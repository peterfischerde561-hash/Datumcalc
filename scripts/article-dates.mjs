/**
 * Derives each guide's real publication and modification dates from git.
 *
 * `datePublished` and `dateModified` are claims. The previous Article markup
 * asserted 2024-03-24 for every guide, which was wrong by a year for the two
 * oldest and wrong outright for the other six, so the dates were removed rather
 * than left false. This puts them back from the only honest source available:
 * the commits that actually introduced and last changed each article.
 *
 * For every commit touching the articles file, the script extracts that one
 * article's block and hashes it. The first commit where the block appears is
 * `datePublished`; the last commit where its hash changed is `dateModified`.
 * A commit that reformats a neighbouring article does not move either date.
 *
 *   node scripts/article-dates.mjs           # print the table
 *   node scripts/article-dates.mjs --check   # exit 1 if articles.ts is stale
 *
 * `--check` is what CI runs: it fails when an article's content has changed
 * since its recorded `dateModified`, which is the only way this kind of field
 * goes quietly false.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const SOURCE = 'src/lib/articles.ts';

/** GitHub Desktop ships its own git; PATH does not have one on this machine. */
function resolveGit() {
    for (const candidate of ['git', process.env.GIT_PATH].filter(Boolean)) {
        try {
            execFileSync(candidate, ['--version'], { stdio: 'ignore' });
            return candidate;
        } catch { /* try the next one */ }
    }
    const root = `${process.env.LOCALAPPDATA}\\GitHubDesktop`;
    if (existsSync(root)) {
        for (const app of readdirSync(root).filter((d) => d.startsWith('app-')).sort().reverse()) {
            const exe = `${root}\\${app}\\resources\\app\\git\\cmd\\git.exe`;
            if (existsSync(exe)) return exe;
        }
    }
    throw new Error('git not found: put it on PATH or set GIT_PATH');
}

const GIT = resolveGit();
const git = (...args) => execFileSync(GIT, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/**
 * Returns the source region belonging to one article: from its `slug:` line up
 * to the next article's `slug:` line. Crude, but it tracks exactly what we want
 * — a change inside one article's own object — without parsing TypeScript.
 *
 * The last article needs the end of the `articles` object as its boundary, not
 * the end of the file. Without it the final block swallowed every helper
 * declared below the array, so editing an unrelated validation function counted
 * as modifying the last article and reported it stale.
 */
function articlesEnd(lines) {
    const start = lines.findIndex((l) => /^export const articles/.test(l));
    if (start === -1) return lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        if (/^\};/.test(lines[i])) return i;
    }
    return lines.length;
}

function articleBlock(source, slug) {
    const lines = source.split(/\r?\n/);
    const start = lines.findIndex((l) => l.includes(`slug: '${slug}'`));
    if (start === -1) return null;
    let end = articlesEnd(lines);
    for (let i = start + 1; i < end; i++) {
        if (/^\s*slug: '/.test(lines[i])) { end = i; break; }
    }
    return lines
        .slice(start, end)
        // The recorded dates are metadata about the block, not part of it.
        // Hashing them would make writing a date count as changing the article,
        // so every regeneration would immediately report itself stale.
        .filter((l) => !/^\s*(datePublished|dateModified):/.test(l))
        .join('\n')
        .trim();
}

const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 12);

const current = readFileSync(SOURCE, 'utf8');
const slugs = [...current.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);

// Oldest first, so the first sighting of a block is its publication.
const commits = git('log', '--format=%H %ad', '--date=short', '--', SOURCE)
    .trim().split('\n').filter(Boolean)
    .map((line) => { const [sha, date] = line.split(' '); return { sha, date }; })
    .reverse();

const sourceAt = new Map();
for (const { sha } of commits) {
    try { sourceAt.set(sha, git('show', `${sha}:${SOURCE}`)); }
    catch { sourceAt.set(sha, null); } // file did not exist yet at this commit
}

const results = [];
for (const slug of slugs) {
    let published = null;
    let modified = null;
    let lastHash = null;

    for (const { sha, date } of commits) {
        const source = sourceAt.get(sha);
        if (!source) continue;
        const block = articleBlock(source, slug);
        if (!block) continue;
        const h = hash(block);
        if (published === null) { published = date; modified = date; lastHash = h; continue; }
        if (h !== lastHash) { modified = date; lastHash = h; }
    }
    results.push({ slug, published, modified });
}

const recorded = new Map(
    [...current.matchAll(/slug: '([^']+)'[\s\S]*?datePublished: '([\d-]+)'[\s\S]*?dateModified: '([\d-]+)'/g)]
        .map((m) => [m[1], { published: m[2], modified: m[3] }])
);

let stale = 0;
console.log(`${'slug'.padEnd(26)} ${'published'.padEnd(12)} ${'modified'.padEnd(12)} status`);
for (const { slug, published, modified } of results) {
    const have = recorded.get(slug);
    let status = 'ok';
    if (!have) { status = 'MISSING in articles.ts'; stale++; }
    else if (have.published !== published || have.modified !== modified) {
        status = `STALE (recorded ${have.published} / ${have.modified})`;
        stale++;
    }
    console.log(`${slug.padEnd(26)} ${String(published).padEnd(12)} ${String(modified).padEnd(12)} ${status}`);
}

if (process.argv.includes('--check')) {
    if (stale > 0) {
        console.error(`\n${stale} article date(s) out of sync with git. Update src/lib/articles.ts.`);
        process.exit(1);
    }
    console.log(`\n${results.length} articles, dates match git.`);
}
