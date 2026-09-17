/**
 * `server-only` throws unconditionally unless resolved under the
 * `react-server` export condition (only set by Next's own bundler) - see
 * node_modules/server-only/package.json. Vitest resolves plain Node/Vite
 * conditions, so any module under test that imports `server-only` (e.g.
 * `src/lib/env/index.ts`, `src/lib/seo/llms-txt.ts`) needs it aliased to a
 * no-op here instead (vitest.config.ts, `resolve.alias`).
 */
export {}
