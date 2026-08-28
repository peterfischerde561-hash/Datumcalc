import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  /*
   * Calculation logic uses CivilDate, never a JS Date.
   *
   * `new Date()` reads the server's local clock, and Date arithmetic carries an
   * hour component that a daylight-saving transition can shift, which is how
   * day-of-year lost a day between 00:00 and 01:00 once Berlin moved to UTC+2,
   * and how every calculator rendered the previous day for viewers west of UTC.
   * Both were fixed by moving to integer day-count arithmetic; this stops them
   * coming back.
   *
   * Deliberately scoped rather than repo-wide. A blanket ban creates friction
   * and invites workarounds: sitemap generation legitimately needs a real
   * timestamp for lastModified, as do the build id, logging and tests. The rule
   * applies where a wrong date is a wrong answer.
   */
  {
    files: [
      "src/lib/calculator.ts",
      "src/lib/events.ts",
      "src/lib/seo/contentEngine.ts",
      "src/lib/seo/guideFacts.ts",
      "src/components/calculator/**/*.tsx",
      "src/components/seo/AnswerBlock.tsx",
      "src/components/seo/GuideFacts.tsx",
      "src/components/hero/**/*.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='Date']",
          message:
            "Use CivilDate from src/lib/date/civil.ts. `new Date()` reads the server clock and its hour component shifts across DST — see the comment in eslint.config.mjs.",
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message:
            "Use getTodayInTimeZone() from src/lib/date/civil.ts rather than Date.now().",
        },
      ],
    },
  },

  /*
   * The date core is the one module allowed to touch Date: it is where the
   * conversion between a real clock and a CivilDate is deliberately contained.
   * The countdown needs a live clock to tick, and tests construct dates freely.
   */
  {
    files: [
      "src/lib/date/civil.ts",
      "src/lib/date/format.ts",
      "src/components/countdown/CountdownTimer.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
]);

export default eslintConfig;
