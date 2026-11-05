# OSRS Hub Test — Whole-site implementation map

Baseline: production source snapshot `be7fbe478a85f9789bdd3f96451384e7a137cd4f`.

This document is the acceptance ledger for the separate test build. It intentionally separates shipped code from connected existing tools and from ideas that require more data, backend work or external credentials. A visual tile or roadmap label must not be mistaken for a completed feature.

## 1. Foundation and isolation

- [x] Copy the current React/Vite/Worker application and existing tests into this repository.
- [x] Keep the production repository untouched.
- [x] Use a separate Worker identity with no production D1 binding; database-backed routes fail closed until a dedicated test D1 resource is created.
- [x] Make the test page non-indexable and disallow crawling.
- [x] Preserve the production migration files as source only; no migration has been applied.
- [x] Keep Discord Worker code, but leave test OAuth and bot credentials unset until separate test credentials are provided.
- [x] Add a GitHub Actions workflow for regression tests, Worker Assets build, output verification and downloadable artifacts.
- [ ] Create the dedicated Cloudflare D1 database and replace the test database ID placeholder.
- [ ] Configure a separate Discord OAuth application and optional test bot.

## 2. Site shell and navigation

- [x] Make the new Command Centre the root route.
- [x] Keep the original market page accessible at `/market`.
- [x] Retain `/command-centre` as a compatibility route.
- [x] Promote Market to a first-class navigation destination.
- [x] Expand desktop sidebar and mobile More navigation to expose Screener, Market Radar, Backtester, Finance, Quest Pathway, Levelling and Tools.
- [x] Keep the existing command palette, quick calculator, alerts popover, login area, item detail overlays, watch ticker and responsive navigation.
- [x] Add persistent breadcrumbs and recently visited page shortcuts throughout the existing routes.
- [ ] Add a universal cross-page action drawer and a consistent global notification centre.

## 3. New Command Centre

- [x] Workspace overview with real loaded-market, margin, watchlist and alert counts.
- [x] Transparent Next Move screening heuristic using the current loaded item fields.
- [x] Candidate action opens the real existing item detail view.
- [x] Market pulse shortlist derived from the loaded item snapshot.
- [x] Daily briefing summary using available local data only.
- [x] Persistent personal GP goal and progress indicator.
- [x] Persistent working bankroll with budget presets.
- [x] User-controlled workspace pins, saved across visits and prioritised in the tool grid.
- [x] Recent-page history and breadcrumbs are synchronised through the existing cloud-data allowlist when Discord account sync is configured.
- [x] Trading workflow with discovery → research → plan → monitor → review.
- [x] Account, combat and knowledge launchpad linking to the existing tools.
- [x] Separate sections for Overview, Trading, Account, OSRS Brain and GP Planner.
- [x] Classic quick-launch command panel retained behind an expandable disclosure.
- [ ] Do not interpret the heuristic score as an optimal flip, forecast, guaranteed fill or profit recommendation.
- [ ] Add account-import-aware daily briefing once the account data contract is reliably available.
- [ ] Add time-windowed briefing and personal performance trends when reliable historical data is available.

## 4. Visual identity and interaction system

- [x] Shared test-only design layer with semantic surface, text, border, accent, status and shadow tokens.
- [x] Full visual token overrides for Paper, Aurora Frost, Comfort, Obsidian, Aurora, Void, Opera Red, Graphite and Gilded.
- [x] New aurora-inspired command hero with animated rune/orb treatment.
- [x] Refined cards, hover lift, focus states, market rows, segmented tabs, progress tracks and responsive grid.
- [x] Signature motion includes hero atmosphere drift, rune glow, orbit ring, live pulse, page entrance and interaction transitions.
- [x] Reduced-motion support.
- [x] Keyboard-visible focus rings.
- [ ] Audit every legacy page against each theme and remove any remaining hard-coded colour exceptions.
- [ ] Run full visual review at desktop, tablet and real iPhone widths.
- [ ] Add page-specific skeletons and empty states to every data-heavy legacy page.

## 5. Existing modules retained from the current build

These are copied working application modules; the current test pass must prove them again after the new shell and styles are integrated.

- [x] Market snapshot, item search, filtering, column layouts and market tables.
- [x] Item detail panels, historical price charts and Item DNA scoring.
- [x] Trading Terminal multi-chart workspace and profiles.
- [x] Screener, smart flip finder and saved scan profiles.
- [x] Watchlists and per-item watch actions.
- [x] Alerts, alert rules, history and Discord integration code.
- [x] Dashboard, finance tools, flip log, bankroll and portfolio records.
- [x] Account Studio, account tracker, loadout studio, quest progression and calculators.
- [x] Combat Studio, engine bridge, live calculation clients, loadout optimizer and saved builds.
- [x] OSRS Brain/intelligence search and Data Control Centre.
- [x] Levelling planner, Recipes, Money Makers and High Alcher.
- [x] Analysis, Market Radar and Historical Backtester.
- [x] Existing migrations, tests, Worker routes and data adapters.

## 6. Whole-site roadmap — acceptance catalogue

The categories below preserve every major proposal from the whole-site blueprint. The labels do not claim unfinished items are already coded.

### Market and trading intelligence
- [x] Existing live market, item detail and item search.
- [x] Existing multi-chart terminal, scanner/screener, profiles and watchlists.
- [x] Existing price alerts, CSV export, historical chart views and backtester.
- [ ] Item dossier 2.0 with dedicated market quality, liquidity, volatility, margin, GE limit, tax, alchemy, requirements, related items, history and source panels.
- [ ] Multi-item comparison workspace with correlated price overlays.
- [ ] Multi-horizon market calendar for daily/weekly patterns, only where sufficient timestamped history exists.
- [ ] Market anomaly and volatility detection with explainable thresholds.
- [ ] Alert chains and compound triggers with explicit reset behaviour.
- [x] Smart Watchlists with live-snapshot filter rules, saved named presets, ranking choices and one-click add to the active manual list. Filters remain transparent and exclude records missing risk-score evidence.
- [ ] Trade replay and fill journal that distinguishes assumed fills from verified user fills.
- [ ] Market replay for historical windows when data coverage and granularity support it.

### Personal finance and GP planning
- [x] Existing flip log, P&L and bankroll controls.
- [x] New personal GP goal and bankroll inputs in the Command Centre.
- [x] Trading Performance Coach derives win rate, average win/loss, profit factor, per-item P&L concentration and sample-size cautions from actual logged trades. (Holding time is intentionally not reported because the journal does not store verified timestamps.)
- [ ] Allocation optimiser with explicit risk limits and no automatic order placement.
- [ ] GP efficiency atlas connecting the user's money-making methods, XP goals and equipment targets.

### Account and progression intelligence
- [x] Existing Account Studio, account tracker, account-aware loadout pathway, quest checklist and levelling tools.
- [x] New Account and GP Planner launch sections.
- [ ] Full account-readiness audit with missing/unknown fields separated from confirmed requirements.
- [ ] Verified quest dependency graph and skill requirement matrix.
- [ ] Quest-to-profit and quest-to-upgrade planning.
- [ ] XP/quest route optimiser using confirmed rewards and requirements.
- [ ] Boss preparation passport combining account, gear, supplies, unlocks and budget.
- [ ] Build passport for shareable, reproducible gear/scenario configurations.

### Combat and equipment
- [x] Existing Combat Studio page and engine adapters retained.
- [ ] Expand optimiser candidate coverage and clearly quantify tested search space.
- [ ] Add prayer, potion, stance, target style, phase, special attack and gear-swap scenario controls backed by engine support.
- [ ] Show DPS, hit chance, max hit, attack interval and assumptions with source-backed tooltips.
- [ ] Add boss matchup matrix and scenario comparison where the engine has validated support.
- [ ] Add upgrade path ranked by measured DPS improvement per GP, not estimated item score alone.
- [ ] Show hard exclusions and unresolved requirements separately.

### OSRS Brain and knowledge graph
- [x] Existing Intelligence page, OSRS Brain routes and data control tooling retained.
- [ ] Visual item relationship explorer.
- [ ] Monster, drop and attack-style evidence explorer.
- [ ] Quest and unlock dependency graph.
- [ ] Recipe and production graph.
- [ ] Field-level provenance, confidence and source timestamp on all critical records.
- [ ] Dataset diff viewer for new, changed, stale and missing entries.
- [ ] Never fill unknown combat formulas, drop rates or quest requirements with invented values.

### Tools and connected workflows
- [x] Existing quick calculator, Money Makers, Recipes and High Alcher retained.
- [x] New workspace cards route to available tools.
- [ ] Dedicated GE-to-Combat, Quest-to-Upgrade, Boss-to-Bank and Skill-to-GP planners.
- [ ] Universal what-if simulator with clearly declared assumptions.
- [ ] Personal assistant only when a real, grounded data/retrieval service exists; no fake AI chat.
- [ ] Weekly account and trading report generated from user's own verified data.
- [ ] Optional clan/group workspace with privacy and permissions designed before implementation.

### Mobile, accessibility and performance
- [x] Existing mobile navigation retained and expanded.
- [x] New Command Centre responds from wide desktop down to narrow mobile.
- [x] Reduced-motion and keyboard focus support in the test visual layer.
- [ ] Verify real device touch-target sizes, scroll behaviour, chart gestures and modal stacking.
- [ ] Audit bundle size, lazy-load heavy destinations and split the monolithic app by page without a risky rewrite.
- [ ] Add consistent loading, offline/stale-data, API-rate-limit, and retry feedback.
- [ ] Add performance budgets and automated mobile smoke checks.

## 7. Release gates before production promotion

1. All CI regression tests pass.
2. Vite Worker Assets build succeeds and output is verified.
3. Test Worker deploys against a newly created D1 database.
4. Migrations succeed on test D1 only.
5. Price, history, OSRS data, account, market, combat and knowledge routes are smoke-tested.
6. Discord login and alert delivery are tested only after separate test credentials are configured.
7. Manual desktop and iPhone review across all nine themes.
8. No critical visual regressions, console errors, fake data or unlabelled estimates.
9. Review the diff against the production backup and approve a separate promotion PR.

## Accuracy and safety standard

Any market score is a ranking heuristic, not a promise. Any backtest is an observation-based replay unless order queues and fills are modelled. Any combat result is only as reliable as its engine input and supported mechanics. Missing quest, drop, equipment, monster or formula data remains unknown; it is never silently invented.
