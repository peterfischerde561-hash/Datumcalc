#!/usr/bin/env node
/**
 * Runs every verification against one base URL.
 *
 *   node scripts/verify-all.mjs                       # localhost:3000
 *   node scripts/verify-all.mjs https://example.com   # a preview or production
 *
 * This exists rather than chaining the three scripts with && in package.json,
 * because npm forwards `--` arguments only to the last command in a chain. That
 * would have run the first two against localhost while appearing to check the
 * URL you passed — a false pass on production is worse than no check.
 */

import { spawn } from 'node:child_process';

const BASE = process.argv[2] || 'http://localhost:3000';

const CHECKS = [
    ['routes', 'scripts/verify-routes.mjs'],
    ['accessibility', 'scripts/verify-a11y.mjs'],
    ['redirects', 'scripts/verify-redirects.mjs'],
    ['structured data', 'scripts/verify-schema.mjs']
];

function run(script) {
    return new Promise((resolve) => {
        const child = spawn(process.execPath, [script, BASE], { stdio: 'inherit' });
        child.on('close', (code) => resolve(code ?? 1));
    });
}

console.log(`Verifying ${BASE}\n`);

const failed = [];
for (const [name, script] of CHECKS) {
    console.log(`──── ${name} ────`);
    const code = await run(script);
    if (code !== 0) failed.push(name);
    console.log('');
}

if (failed.length) {
    console.log(`FAILED: ${failed.join(', ')}  (against ${BASE})`);
    process.exit(1);
}
console.log(`All checks passed against ${BASE}`);
