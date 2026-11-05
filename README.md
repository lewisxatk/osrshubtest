# OSRS Hub Test

**Purpose:** isolated test build for the OSRS Hub whole-site evolution. This repository is separate from the production website repository.

- Production source: https://github.com/lewisxatk/osrsflipit
- Test source: https://github.com/lewisxatk/osrshubtest
- Baseline copied from production commit: `be7fbe478a85f9789bdd3f96451384e7a137cd4f`

## Non-negotiable isolation rules

1. Do not connect this Worker to the production D1 database.
2. Do not reuse production Discord OAuth credentials or callback URLs.
3. Do not add Cloudflare secrets or API tokens to Git.
4. Apply migrations only to the dedicated `osrshubtest-accounts` D1 database.
5. Keep the production `osrsflipit` repository and Worker unchanged until the test build passes review and you explicitly approve migration.

The test `wrangler.jsonc` intentionally contains `REPLACE_WITH_TEST_D1_DATABASE_ID`. Deployment must fail until that is replaced with the ID of a newly created test D1 database.

## Local validation

Requires Node.js 22 or newer.

```bash
npm install
npm test
npm run build
npm run preview
```

The Vite build generates the Cloudflare Worker Assets directory at `site/`. It does not apply D1 migrations or deploy anything.

## Create the isolated Cloudflare resources

From this repository, after installing Wrangler:

```bash
npx wrangler login
npx wrangler d1 create osrshubtest-accounts
```

Copy the returned test database ID into `wrangler.jsonc`, keeping the binding name `DB` and database name `osrshubtest-accounts`.

Then apply the existing migration set to that test database only:

```bash
npx wrangler d1 migrations apply osrshubtest-accounts --remote
```

Review the Wrangler output and confirm it names **osrshubtest-accounts** before accepting the migration.

## Test Worker deployment

The test config uses:

- Worker name: `osrshubtest`
- Expected preview origin: `https://osrshubtest.prices-app.workers.dev`
- OAuth callback: `https://osrshubtest.prices-app.workers.dev/api/auth/callback`
- D1 binding: `DB` → the new test database only

Confirm your Cloudflare account's Workers subdomain is `prices-app.workers.dev`. If it differs, update `PUBLIC_ORIGIN` and `DISCORD_REDIRECT_URI` in `wrangler.jsonc` before deploying.

```bash
npm run build
npx wrangler deploy --config wrangler.jsonc
```

## Optional Discord setup for the test environment

The existing Discord code is preserved. Sign-in is intentionally unavailable until a separate test OAuth application is configured.

Create a Discord application for the test Worker and add this exact redirect URI to that test application's OAuth2 settings:

`https://osrshubtest.prices-app.workers.dev/api/auth/callback`

Set the following Worker secrets interactively; never commit their values:

```bash
npx wrangler secret put DISCORD_CLIENT_SECRET --config wrangler.jsonc
npx wrangler secret put OSRSHUB_AUTH_SECRET --config wrangler.jsonc
```

Set the test application's client ID as the `DISCORD_CLIENT_ID` variable in `wrangler.jsonc`. The auth callback also needs the configured `DISCORD_REDIRECT_URI`.

Discord bot notifications are separate and optional:

```bash
npx wrangler secret put DISCORD_BOT_TOKEN --config wrangler.jsonc
```

Administrator-only tools can be enabled with a strong test-only password:

```bash
npx wrangler secret put ADMIN_PASSWORD --config wrangler.jsonc
```

Without Discord credentials, ordinary site and market functionality should remain available; login, cloud account sync and bot delivery will show their configuration state rather than pretending to work.

## GitHub validation

The GitHub Actions workflow runs the existing Node regression suite, builds the site, verifies the Worker Assets output and uploads source/site test artifacts. A green workflow validates compilation and the automated regression coverage; it does not prove that Cloudflare secrets, D1 connectivity, third-party data availability or Discord delivery are configured.

## What this test build contains

The test copy retains the current site's working market, trading terminal, screener, item detail, watchlists, alerts, finance, analysis, market radar, backtester, Account Studio, Combat Studio, OSRS Brain, levelling, recipes, money makers, High Alcher, Data Control Centre, existing Worker routes, migrations, and tests.

The new Command Centre, broader navigation, experience design layer, extra themes and motion system are added on top. See [the implementation map](docs/OSRSHUB-TEST-IMPLEMENTATION-MAP.md) for the difference between implemented features, preserved existing features, and larger roadmap concepts that still require additional data or engineering.

## Production promotion

No automatic promotion exists. Once this test build is fully validated and reviewed, production changes should be transferred in a separate, explicit release. Never point the test Worker at production D1 as a shortcut.
