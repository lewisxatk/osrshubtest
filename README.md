# OSRS Hub — Isolated Test Build

This repository is the independent whole-site test environment for OSRS Hub. The starting application is based on production commit be7fbe478a85f9789bdd3f96451384e7a137cd4f. Test-only Command Centre, workspace/navigation work and visual styling are maintained here.

## Included
The current React/Vite/Cloudflare Worker app and its regression tests are preserved. The test branch also includes the Command Centre, daily market briefing, explainable Next Move screening, account and GP planning inputs, pinned workspaces, recently visited navigation, breadcrumbs, multi-theme styling and the Gilded theme.

Existing Market, Trading Terminal, Screener, Watchlists, Alerts, Finance, Account Studio, Combat Studio, OSRS Brain, Levelling, Recipes, Money Makers, High Alcher, Analysis, Market Radar and Backtester modules remain in the application. The document in docs/OSRSHUB-TEST-IMPLEMENTATION-MAP.md records implemented work separately from work that still needs data or engineering.

## Environment boundaries
- This repository does not deploy to or modify the production osrsflipit Worker.
- The test Worker is named osrshubtest.
- The test Worker has no production database ID or binding, no scheduled ingestion cron and no Discord OAuth or bot credentials.
- The /api/test/status endpoint reports which test services are connected.
- Market prices, public Wiki lookups and Hiscores can operate without D1. Account cloud sync, database-backed OSRS reference data, admin and Discord routes return a clear unavailable response until separate test services are configured.
- Production migration files are included for reference only and are never automatically applied.
- Do not add production secrets, database IDs or production redirect URLs to this repository.

## Local development
```bash
npm install
npm test
npm run build
npm run dev
```

The Vite build outputs Worker Assets to site/. Wrangler deploys only the test Worker using wrangler.jsonc.

## Validation gates
1. All regression tests pass.
2. The Worker Assets build completes and site/index.html exists.
3. Browser checks cover key routes, themes, keyboard navigation and desktop/mobile layouts.
4. API checks confirm public endpoints work without D1 and database-backed routes fail closed.
5. Create a dedicated test D1 database before enabling cloud sync, structured OSRS data routes or admin tools.
6. Create a separate Discord OAuth application and optional test bot before testing Discord.
7. Production promotion requires a reviewed change, passing checks and an explicit decision.

## Cloudflare
The repository is prepared for a separate Worker deployment, but no Cloudflare deployment has been made from this session. A test deployment requires Wrangler authentication. Database-backed features remain disabled until a separate D1 database is created and connected.
