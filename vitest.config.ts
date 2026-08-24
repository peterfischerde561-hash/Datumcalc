import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            // Mirrors the `@/*` -> `src/*` path mapping in tsconfig.json. Vitest
            // does not read tsconfig paths, so any module importing through the
            // alias fails to resolve without this.
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    test: {
        include: ['src/**/*.{test,spec}.{ts,tsx}']
    }
});
