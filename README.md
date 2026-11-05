# OSRS Hub — Test Environment

This repository is an isolated test copy of the current OSRS Hub application, based on `lewisxatk/osrsflipit`.

## Safety boundary

- This repository does not deploy to or modify the production OSRS Hub Worker.
- It deliberately has **no production D1 binding**, database ID, cron trigger, Discord OAuth client ID, redirect URI, or bot token.
- The test Worker reports its readiness at `/api/test/status`.
- Market prices, public Wiki lookups and Hiscores routes can run without D1. Account cloud sync, database-backed reference data, admin endpoints and Discord are intentionally returned as a clear test-environment 503 until a separate test D1 database and separate Discord application/secrets are configured.
- Never add production secrets or the production D1 ID to this repository.
- Database migrations are copied for review only; they are not applied automatically.

## Local development

```bash
npm install
npm test
npm run build
npm run dev
```

The Vite build outputs Worker assets to `site/`. The Worker is deployed using `wrangler.jsonc` only after a separate Cloudflare test environment has been configured.

## Validation gates

1. Regression tests pass.
2. Production build completes.
3. Browser smoke tests verify all routes, responsive breakpoints, keyboard navigation and theme switching.
4. API smoke tests confirm that only public routes function without test D1 and that all database-backed paths fail closed with a clear message.
5. Configure a dedicated test D1 database before enabling account sync, reference data, admin tools or scheduled ingestion.
6. Verify Discord in a separate test app/workspace before considering it for this environment.

## Promotion

No code from this repository is promoted into `osrsflipit` automatically. Promotion requires a reviewed PR, passing checks and an explicit decision.
