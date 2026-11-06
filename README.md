# OSRS Hub — Isolated Test Build

This repository is the independent whole-site test environment for OSRS Hub. It preserves the existing application and adds test-only workspace navigation, Account linking, Combat Studio integration, Command Centre improvements and visual refinements.

## Included workspaces

The primary navigation is organised into five workspaces: Home, Market, Trading, Account and OSRS Brain. Secondary tools remain available inside grouped More menus and existing direct routes; features have not been removed simply to shorten the navigation.

Existing Market, Trading Terminal, Screener, Watchlists, Alerts, Finance, Account Studio, Combat Studio, OSRS Brain, Levelling, Recipes, Money Makers, High Alcher, Analysis, Market Radar and Backtester modules remain in the application. The document in `docs/OSRSHUB-TEST-IMPLEMENTATION-MAP.md` records implemented work separately from work that still needs data or engineering.

## Account linking

- Public OSRS Hiscores imports support the standard, Ironman, Ultimate Ironman and Hardcore Ironman tables.
- The WikiSync/RuneMetrics account endpoint can supplement skills and quest progress where the source returns it.
- RuneLite/WikiSync JSON profile files can be imported locally.
- Up to ten profiles are remembered in the browser; the selected profile is shared with the account-aware website modules.
- The active profile and saved profile list are on the cloud-sync allowlist for per-Discord-user backup.
- Discord cloud backup is intentionally unavailable until separate test Discord OAuth credentials and a test redirect URL are configured. Production Discord credentials are not reused.

A RuneLite desktop client is not remotely controlled. JSON import and public account sync are the supported test integrations.

## Combat Studio

Combat Studio uses a separate canonical combat runtime Worker named `osrshubtest-combat-runtime`. It exposes canonical monster IDs, equipment records, spell data and the verified combat calculation endpoint. The website joins canonical equipment records to live market prices and supplements equipment with public item requirements and quest data.

The auto-builder evaluates candidates through the canonical engine and only returns an engine-calculated result. It tests a bounded shortlist (up to four alternatives per equipment slot), so its result is the best verified setup it checked, not a mathematical proof of the global optimum. Items with missing or zero market prices are not assigned invented GP values.

## Environment boundaries

- The test website Worker is named `osrshubtest`.
- The canonical combat runtime is named `osrshubtest-combat-runtime`.
- The dedicated Cloudflare D1 database is `osrshubtest-db` (EU jurisdiction), bound only to the test Worker as `DB`.
- Migrations `0001_auth.sql` through `0006_overnight_price_history.sql` have been applied to this test D1 database.
- A test-only two-hour cron is configured for scheduled ingestion and market snapshots.
- The test Workers do not use the production `osrsflipit` Worker, production D1 database, production secrets, production Discord OAuth or production bot token.
- The `/api/test/status` endpoint reports test service connectivity.
- Production migration files and source data are never applied to production by this repository.

## Deployment

Pushes to `feat/website-evolution-a-foundation` run the validation workflow:

1. Install dependencies, run the website regression tests and build Worker Assets.
2. Run the canonical combat-engine regression tests and validate its Worker bundle.
3. Deploy and smoke-test the isolated canonical combat runtime.
4. Build the website with the test runtime URL and deploy only `osrshubtest`.
5. Smoke-test the website and its isolated D1 status endpoint.

The expected test website is:

https://osrshubtest.prices-app.workers.dev

The expected test combat runtime is:

https://osrshubtest-combat-runtime.prices-app.workers.dev

## Local development

```bash
npm install
npm test
npm run build
npm run dev
```

The Vite build outputs Worker Assets to `site/`. Wrangler deploys only the test Worker using `wrangler.jsonc`.

## Remaining configuration

1. Configure a separate Discord OAuth application with the test callback `https://osrshubtest.prices-app.workers.dev/api/auth/callback`, then add these GitHub repository secrets: `TEST_DISCORD_CLIENT_ID`, `TEST_DISCORD_CLIENT_SECRET` and `TEST_OSRSHUB_AUTH_SECRET`. The test deployment workflow will install them only on the test Worker.
2. Run browser checks across all themes, keyboard navigation and desktop/mobile layouts.
3. Continue seeding and validating structured OSRS reference data; an empty table is not evidence that a feature is complete.
4. Continue Combat Studio accuracy testing against known account, target, budget and gear combinations.
5. Production promotion requires a reviewed change, passing checks and an explicit decision.
