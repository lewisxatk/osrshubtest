# OSRS Hub — Website Evolution Master Acceptance Ledger

Scope: the complete 35-section website-wide evolution blueprint, all six visual-reference experiences, the additional signature-feature list, and the legacy behaviours that must remain intact.

Repository: lewisxatk/osrshubtest
Working branch: feat/website-evolution-a-foundation
Safety boundary: test repository only. No production Worker, production D1, production bindings, production Discord integration or production deployment may be changed.

This ledger supplements OSRSHUB-TEST-IMPLEMENTATION-MAP.md. A route, tile, screenshot, menu or placeholder is not proof of completion. A feature is DONE only when its behaviour works, data is grounded, and tests/release checks support the claim.

## Status rules

- DONE: implemented and covered by focused tests or a verified regression gate.
- PARTIAL: a working foundation exists, but the full blueprint acceptance criteria are not met.
- TODO: implementation remains outstanding.
- BLOCKED: a dedicated test service, credentials, source data or real-device verification is required.
- Unknown OSRS facts remain unknown. Do not fabricate game formulas, drop chances, quest requirements, item requirements, market events, historical fills, XP rates, or GP/hour results.
- A heuristic is not a forecast, probability, optimal result, guaranteed fill or guaranteed profit.

## 1. Connected OSRS Hub product — PARTIAL
- [x] Keep Market, Trading, Account, Combat, OSRS Brain, Finance, Progression and Tools in one application shell.
- [x] Provide connected entry points from the Command Centre and global action drawer.
- [ ] Complete Market → Item → Trade plan → Alert → Journal → Review with actual IDs and saved context.
- [ ] Complete Account → Quest → Unlock → Combat Build → Upgrade → GP plan.
- [ ] Complete knowledge relationships across items, monsters, quests and recipes.
- [ ] Add a real global activity model from actual app events only.

## 2. Global navigation, search and actions — PARTIAL
- [x] Preserve existing navigation and Command Centre compatibility route.
- [x] Add Ctrl/Cmd+J quick actions, page/tool launch and live item search by name or ID.
- [x] Add desktop drawer and mobile bottom-sheet treatments, keyboard navigation and reduced motion.
- [x] Add global notification centre using real alert history and workspace status.
- [x] Persist notification read state and dashboard preferences through the test-only sync allowlist.
- [ ] Add context-aware actions on item, monster, quest, recipe, account and trade views.
- [ ] Search monsters, quests, recipes, skills and saved builds when indexed data exists.
- [ ] Add notification grouping, preferences and full focus/screen-reader audit.

## 3. Command Centre and homepage — PARTIAL
- [x] Show real loaded market, margin, watchlist and alert counts.
- [x] Keep Next Move visibly labelled as a snapshot-ranking heuristic.
- [x] Persist GP goal, bankroll presets and workspace pins.
- [x] Add Balanced, Trading Focus and Workspace Focus dashboard templates.
- [x] Add widget visibility controls for the five real dashboard widgets.
- [ ] Add drag/drop layout with keyboard alternative, named templates, duplication and export.
- [ ] Add account-aware briefing only from imported account data and verified requirements.
- [ ] Add performance trends only when reliable history supports them.
- [ ] Explain the observed data behind every suggested action.

## 4. Design system — PARTIAL
- [x] Add semantic theme tokens and shared Command Centre card treatments.
- [x] Provide consistent foundations for cards, buttons, tabs, tables, progress, focus and responsive grids.
- [ ] Audit every legacy page/modal for hard-coded colours, spacing, typography and inconsistent surfaces.
- [ ] Consolidate duplicated visual components without changing behaviour.
- [ ] Standardise loading, empty, error, stale, unavailable, retry and success states.
- [ ] Verify contrast and hierarchy at desktop, tablet and narrow phone widths.

## 5. Themes — PARTIAL
- [x] Preserve Paper/Light, Frost, Comfort, Obsidian, Aurora, Void, Opera Red, Graphite and Gilded.
- [x] Add theme token overrides in the test-only style layer.
- [ ] Prove every theme works on every page, chart, tooltip, modal and mobile overlay.
- [ ] Ensure theme switching preserves saved filters, charts, watchlists, account data and profiles.
- [ ] Add animation, sound and motion intensity preferences.
- [ ] Verify theme sync only through a separate test account service.

## 6. Signature motion — PARTIAL
- [x] Preserve existing hero motion, page transitions, focus and hover states.
- [x] Respect reduced-motion in new global, notification, item and market-comparison components.
- [ ] Add consistent price pulses, skeletons, tooltips, crosshairs and saved-state feedback across all routes.
- [ ] Add sound/haptic settings, sound off by default.
- [ ] Audit animation duration, performance and phone usability.

## 7. Trading Terminal and Market Intelligence — PARTIAL
- [x] Preserve Terminal, market snapshot, search, scanner, history, watch actions and saved profiles.
- [x] Preserve buy/sell history and selected range behaviour.
- [x] Fetch selected history range for up to four pinned items.
- [x] Add indexed midpoint-price overlays, each series starting at 100.
- [x] Leave missing/one-sided history absent rather than interpolating.
- [ ] Add statistical correlation with lookback, sample size and missing-data rules.
- [ ] Add saved multi-panel chart workspaces and shared cursors/crosshair.
- [ ] Add verified market calendar and sourced event attribution.
- [ ] Add anomaly/volatility detection with period and confidence/sample context.
- [ ] Add observed-data Market Replay/Time Machine.
- [ ] Add fill simulation only when queue/fill assumptions are explicit.
- [ ] Add a trade replay journal linked to real user-entered/observed trades.
- [ ] Add bankroll/GE-slot-aware scan ranking with visible methodology.

## 8. Screener — PARTIAL
- [x] Preserve snapshot search, filters, sort, volume, margin and price columns.
- [x] Preserve saved scan profiles and Smart Watchlists.
- [x] Add a visual filter builder with ALL (AND) / ANY (OR) logic, accessible rule fields/operators, responsive layout and saved profile match mode.
- [ ] Extend to nested AND/OR groups with per-group conditions.
- [x] Keep configurable, reorderable columns and saved scan profiles; add Trading, Liquidity, Risk and Full column presets for desktop and mobile.
- [ ] Add nested filter groups and more advanced saved column layouts with independent names.
- [ ] Add desktop high-density table and mobile card/bottom-sheet version.
- [ ] Add explicit unknown-data filters.
- [ ] Add right-side item preview, two-line graph and context actions without breaking quick item menu.
- [ ] Add reproducible scan snapshots.

## 9. Item dossier and Item DNA — PARTIAL
- [x] Preserve item panel, price history and Item DNA entry point.
- [x] Replace arbitrary capital/stability sub-score bars with direct market facts.
- [x] Display loaded buy/sell, after-tax margin, ROI, volume, GE limit and capital-at-limit where present.
- [x] Label Hub flip/risk scores as heuristic ranks.
- [x] Add an evidence-led “Why is it moving?” panel from observed buy/sell history and available volume.
- [x] Show unavailable when data is insufficient; do not infer cause or forecast.
- [ ] Add source-backed requirements, alchemy, recipe, monster/drop and quest links.
- [ ] Add item relationship/ingredient/drop journey with provenance and timestamps.
- [ ] Add side-by-side dossier comparison with missing-value warnings.
- [ ] Add GE limit reset timing only when source-backed.

## 10. Watchlists — PARTIAL
- [x] Preserve existing watchlists, watch actions and 25-item limit.
- [x] Preserve Smart Watchlists based on loaded snapshot fields.
- [ ] Add folders, tags, targets, notes, layouts and list-level alert settings.
- [ ] Add monitoring history and actual trade performance.
- [ ] Add import/export and test-account sync.
- [ ] Add watchlist briefing with price, margin, volume and freshness context.

## 11. Alerts and automation — PARTIAL
- [x] Preserve price/margin rules and Discord integration source unchanged.
- [x] Show actual triggered alert history in the notification centre.
- [x] Persist notification read/unread state.
- [ ] Add compound/chained conditions with explicit evaluation order.
- [ ] Add watchlist alert creation and templates.
- [ ] Add cooldown, duplicate suppression, expiry and pause/resume.
- [ ] Add test-only delivery and logs once credentials are provisioned.
- [ ] Show exact observed trigger values.

## 12. Finance and bankroll — PARTIAL
- [x] Preserve Flip Log, P&L, bankroll and portfolio.
- [x] Preserve Trading Performance Coach calculations from actual logged trades with sample cautions.
- [ ] Match orders/fills only when actual order records exist.
- [ ] Add holding time only after entry/exit timestamps exist.
- [ ] Add bankroll allocation optimiser with risk, GE slots and concentration limits.
- [ ] Add allocation what-if scenarios and explainable changes.
- [ ] Add exportable reports tied to source trade rows.

## 13. Money Makers — PARTIAL
- [x] Preserve Money Makers and parsed OSRS Wiki guide data.
- [x] Separate parsed Wiki rows from fallback seeds.
- [x] Hide GP/hour for fallback rows without a current matching Wiki record.
- [x] Rank sourced rows above fallback rows and label published GP/hour as estimates.
- [ ] Add account-stat and quest-requirement matching from verified method records.
- [ ] Add exact “what am I missing?” requirements.
- [ ] Add live supplies, current prices, fees and user-measured session results.
- [ ] Add source/date/sample context to method comparisons.

## 14. Recipes and production — PARTIAL
- [x] Preserve Recipes and existing production calculations.
- [ ] Add full recipe trees and sub-recipe dependency graph.
- [ ] Add batch planner/optimizer using verified yields and current prices.
- [ ] Add ingredient radar and price/stock alerts.
- [ ] Add account-aware levels/unlocks from verified records.
- [ ] Include tax, secondary supplies and unknown price handling.

## 15. High Alch — PARTIAL
- [x] Preserve High Alcher and existing rune/after-tax calculations.
- [ ] Add alch session workspace and inventory/bankroll planner.
- [ ] Add provenance for alchemy value and current GE cost timestamps.
- [ ] Add scanner with slots, capital and volume constraints.
- [ ] Distinguish alchemy value, sell price and achievable margin.

## 16. OSRS Brain and knowledge graph — PARTIAL
- [x] Preserve OSRS Brain, intelligence search and Data Control Centre.
- [x] Preserve structured dataset interfaces where supplied.
- [ ] Add visual item/monster/quest/recipe relationship explorer.
- [ ] Add monster drops and attack styles with verified probabilities and sources.
- [ ] Add quest dependency graph with exact prerequisites/unlocks.
- [ ] Add field/record source, confidence and last-updated metadata.
- [ ] Add dataset diff viewer.
- [ ] Add source conflict states: unknown, conflicting, verified.

## 17. Account Studio — PARTIAL
- [x] Preserve account import/lookup and Account Studio.
- [x] Add profile data-coverage audit from actual skill/quest/source/sync fields.
- [x] Include all 24 current profile skill fields, including Sailing.
- [x] Distinguish completed, in-progress, not-started and unknown quest states.
- [x] Do not treat a list of quest names as proof of completion.
- [ ] Add verified quest dependency graph and completion reconciliation.
- [ ] Add account history and import/manual-override diffs.
- [ ] Add account goals/roadmap with prerequisite evidence.
- [ ] Add quest-to-upgrade/profit recommendations from verified unlock records.
- [ ] Add boss readiness passport/build checklist only after requirements data exists.
- [ ] Add shareable build passport with timestamp and missing-data warnings.

## 18. Levelling and XP — PARTIAL
- [x] Preserve skills/XP calculations and account level data.
- [x] Calculate exact XP only when imported XP is valid for its level.
- [x] Show level-based XP interval when current XP is missing/malformed.
- [x] Require user-entered or source-backed XP/hour rate for time estimates.
- [x] Remove arbitrary default method rates and GP costs.
- [ ] Build verified training method catalogue with requirements, XP/hour ranges, costs, source and date.
- [ ] Add method comparison/efficiency map based on evidence.
- [ ] Add 1–99 and quest XP route optimiser after quest XP/dependencies are complete.
- [ ] Add user-measured XP session history.

## 19. Analysis — PARTIAL
- [x] Preserve Analysis, Market Radar/heatmap and Historical Backtester.
- [x] Keep historical replay tied to observations and show model limitations.
- [ ] Add anomaly/volatility indicators with sample coverage.
- [ ] Add correlation explorer with lookback and sample-size safeguards.
- [ ] Add market calendar and sourced events.
- [ ] Add saved multi-item comparisons.
- [ ] Add “why moving?” attribution only when a verified event is linked to item/time.

## 20. Tools and Utilities — PARTIAL
- [x] Preserve calculators, Recipes, High Alch, teleport links and tools already present.
- [ ] Finish Teleport Atlas, Prayer Optimiser, Shop Price Explorer, Death Cost, Boost Explorer, Slayer Planner, Loot Probability Simulator, Boss Supply Planner, Diary Planner and Clue helper individually.
- [ ] Every calculator must identify formula/source, account inputs and unknown fields, and have tests.
- [ ] Drop tools must distinguish independent events, per-kill rates and cumulative probability.
- [ ] Cost tools must use loaded prices or user inputs; missing prices remain unavailable.

## 21. Signature features — PARTIAL
- [x] Next Move heuristic exists with explicit non-guarantee caveat.
- [x] Command Centre has bankroll, GP goal and workflow launchpad.
- [ ] Finish Grand Exchange Radar and evidence-backed Market Pulse/Events.
- [ ] Finish Opportunity Feed, Market Constellation and Flip Map.
- [ ] Finish Market Time Machine and replay.
- [ ] Finish Progression Constellation and Bank-to-Build.
- [ ] Finish GE-to-Combat and account/quest-aware equipment bridge.
- [ ] Finish Quest-to-Profit, Boss-to-Bank and GP Efficiency Atlas.
- [ ] Finish what-if simulator and scenario compare.
- [ ] Finish grounded assistant with record-level sources and unknown handling.
- [ ] Finish weekly report, clan workspace, collections, Academy and Market Challenge.

## 22. Profile and cloud sync — PARTIAL / BLOCKED
- [x] Preserve local preferences and existing cloud-sync allowlist mechanism.
- [x] Add dashboard layout and notification read state to the allowlist.
- [ ] Add profile controls for home, widgets, default filters, charts, theme, shortcuts and notifications.
- [ ] Provision separate test auth/OAuth service and validate cloud operations.
- [ ] Verify concurrent sync, conflicts, sign-out, account switching and local-only mode.
- BLOCKED: test OAuth credentials/service are not configured; production credentials are prohibited.

## 23. Integrations — PARTIAL / BLOCKED
- [x] Preserve Discord integration source/config unchanged.
- [x] Keep test Worker free of production Discord credentials.
- [ ] Provision separate test Discord OAuth/bot/webhook for test delivery.
- [ ] Add PWA install/offline with stale-data warnings.
- [ ] Research/implement RuneLite companion only after safe versioned data contract.
- [ ] Add share links/export for watchlists, builds, routes and reports.
- BLOCKED: separate test Discord credentials required.

## 24. Mobile — PARTIAL / BLOCKED
- [x] Preserve responsive layout and mobile navigation.
- [x] Add bottom-sheet versions of new global actions/notifications.
- [x] Respect safe areas and reduced motion in new surfaces.
- [ ] Audit every route for phone widths, fullscreen charts, compact tables, bottom sheets and forms.
- [ ] Add accessible swipe interactions only with button/keyboard alternative.
- [ ] Test real iPhone/tablet and capture findings.
- BLOCKED: no physical-device/browser session has been run in this GitHub-only pass.

## 25. Assets and dynamic artwork — PARTIAL
- [x] Preserve existing OSRS item-icon/asset use.
- [ ] Audit licences, missing icons, fallback states and alt text.
- [ ] Add consistent item, monster, boss, quest and skill assets from permitted sources.
- [ ] Use dynamic artwork only where it communicates real state.
- [ ] Optimise image formats, sizes, cache and loading.

## 26. Performance — PARTIAL
- [x] Preserve Vite/Worker Assets build and regression CI.
- [x] Package test build as GitHub Actions artifact.
- [ ] Measure route load, script size, chart rendering and request budgets.
- [ ] Add route code-splitting/lazy loading where safe.
- [ ] Add abort/retry/stale-cache for all slow endpoints.
- [ ] Add offline, stale, rate-limited, partial-response and recoverable-error states.
- [ ] Run mobile performance checks.

## 27. Data Health and trust — PARTIAL / BLOCKED
- [x] Preserve Data Control Centre, dataset health and validation routes.
- [x] Surface empty/stale market state in notifications when timestamps/data exist.
- [x] Keep missing values unavailable in item/account/XP panels.
- [ ] Add record-level provenance, source URL, timestamp, confidence and validation state.
- [ ] Add dataset change log/diff.
- [ ] Show schema/coverage/combat-readiness reports with explanations.
- [ ] Provision dedicated test D1, apply migrations to test D1 only, and exercise DB-backed routes.
- BLOCKED: test Worker has no dedicated test D1 binding; production D1 cannot be used.

## 28. Accessibility and quality of life — PARTIAL
- [x] Preserve reduced motion and visible keyboard focus in shared foundation.
- [x] Add keyboard shortcut for quick actions.
- [ ] Finish keyboard audit across routes, modals, tables, charts and mobile drawers.
- [ ] Add screen-reader labels, graph summaries and form error announcements.
- [ ] Add density, font-size, motion and sound preferences.
- [ ] Do not use colour alone to represent data state.

## 29. World Map, Item Journey, Academy and Challenge — TODO
- [ ] Add world map linked to verified locations, teleports and quest unlocks.
- [ ] Add item journey across drops, bosses, recipes, quests and GE context.
- [ ] Add personal goal boards with measurable evidence.
- [ ] Add Market Challenge using observed/historical data and clear scoring.
- [ ] Add Academy lessons linked to actual workflows and verified game facts.
- [ ] Add collection/achievement tracking from imported account data.

## 30. Animation library — PARTIAL
- [x] Keep current motion and reduced-motion foundations.
- [ ] Apply consistent transitions, price pulses, skeletons, tooltips, crosshairs and success feedback across all modules.
- [ ] Keep motion optional, restrained and non-blocking on phones.
- [ ] Add reduced-motion verification for all new components.

## 31. Preservation constraints — DONE for repository boundary; PARTIAL for full regression
- [x] Work in osrshubtest only.
- [x] Do not change production repo, Worker bindings, D1, Discord credentials or deploy production.
- [x] Retain existing modules and source routes in test app.
- [x] Preserve market API and historical-price interfaces.
- [x] Preserve canonical Combat Studio/engine bridge; do not replace with quick formulas.
- [ ] Add explicit route-by-route regression assertions for all existing flows.
- [ ] Re-test legacy behaviour after each major release slice.

## 32. Releases A–H — PARTIAL
- A Visual Foundation: PARTIAL — tokens exist; full legacy/theme/device audit remains.
- B Command Centre: PARTIAL — actions, notifications, templates exist; drag/drop and deeper briefing remain.
- C Market Intelligence: PARTIAL — Terminal, Screener, watchlists and indexed overlay exist; correlation, anomalies, events and replay remain.
- D Account Intelligence: PARTIAL — Account Studio and coverage audit exist; verified graph and roadmap remain.
- E OSRS Brain: PARTIAL — search/data foundations exist; visual graph/provenance remain.
- F New Intelligence: PARTIAL — Next Move and journal-backed coach exist; other planners/reports remain.
- G Companion Ecosystem: BLOCKED/PARTIAL — Discord source retained; test-only credentials, PWA, RuneLite and sharing remain.
- H Signature OSRS Hub Experience: TODO — integrate signature features into A–G; avoid disconnected pages.

## 33. Priority upgrade queue — PARTIAL
1. Global quick-action drawer — DONE.
2. Global notification centre — DONE.
3. Dashboard templates/widget visibility — DONE.
4. Evidence-led item movement — DONE.
5. Item DNA market-fact profile — DONE.
6. Account data-coverage audit — DONE.
7. Exact/range XP planner with user-entered rate — DONE.
8. Remove identified unverified XP/combat/PvM defaults — DONE for identified legacy panels; further audit remains.
9. Money Makers source/fallback separation — DONE.
10. Four-item indexed historical comparison — DONE.
11. Visual Screener builder — TODO.
12. Item relationship explorer — TODO.
13. Account quest dependency graph — TODO.
14. Full engine-backed combat optimiser — TODO.
15. Bank-to-Build/GE-to-Combat bridge — TODO.
16. Bankroll allocation optimiser — TODO.
17. Compound alert chains — TODO.
18. Market anomaly/correlation engine — TODO.
19. World map/item journey — TODO.
20. Mobile/device/performance acceptance — TODO/BLOCKED.

## 34. Prohibited anti-patterns — ACTIVE GUARDRAIL
- [x] Do not rewrite the app into a visual-only shell or remove functional modules.
- [x] Do not duplicate data sources or persist duplicate market history without schema decision.
- [x] Do not invent game stats, formulas, drops, completions, requirements, XP rates, GP/hour or fills.
- [x] Do not turn a heuristic into a guarantee/probability.
- [x] Do not call a feature complete because a tile, mockup or placeholder exists.
- [x] Do not change production Discord, Worker bindings or databases.
- [ ] Continue auditing unverified seed values, hard-coded colours, dead routes and unsupported copy.

## 35. Design direction and final acceptance — PARTIAL
- [x] Keep OSRS Hub identity and “Trade smarter. Fight better. Progress faster.”
- [x] Use Aurora/Frost/Graphite foundations and retain other named themes.
- [ ] Complete six page-level visual experiences in working routes, not static mockups.
- [ ] Capture/review desktop, tablet and iPhone screenshots against approved references.
- [ ] Complete all remaining criteria with tests, provenance and release-gate evidence before calling the blueprint finished.

## Six required visual-reference experiences

1. Market: market pulse, price/margin/volume context, crosshair, saved terminal, sourced events, multi-item comparison and mobile chart mode. Foundations exist; full acceptance is partial.
2. Screener: high-density table, configurable columns, visual filter builder, saved scans, mobile filter sheet, item preview and quick actions. Filters/saved profiles exist; builder and device review remain.
3. Item Details: factual Item DNA, buy/sell history, margin/ROI/volume/limit, movement evidence, recipe/drop/quest relationships and provenance. Factual profile/movement evidence exist; relationship/provenance remain.
4. Combat Lab: account-aware boss/style/budget/loadout, gear slots, source-backed DPS/hit chance/max hit/attack interval, upgrades and exclusions. Canonical Combat Studio/bridge exists; expanded engine coverage and requirements remain.
5. Account Coach: imported stats/quests, confirmed vs unknown, goals/pathways, skill constellation, unlocks and next steps. Coverage audit exists; verified quest graph and roadmap remain.
6. Mobile: page-specific responsive layout, bottom sheets, fullscreen charts, compact cards, safe areas, thumb-friendly actions and accessible alternatives. Responsive foundation exists; device acceptance remains blocked.

## External dependencies and release gates

- Test D1: provision a dedicated database, apply migrations there only, then test database-backed market/account/brain/alert routes. Production D1 is never a fallback.
- Test Discord: create separate test OAuth/bot/webhook credentials. Until then, test Discord delivery is blocked; production source/config remains unchanged.
- Test auth/cloud sync: create a separate test OAuth service and verify sync. Production credentials are prohibited.
- Browser/device review: run desktop, tablet and real-iPhone review across retained themes and key flows.
- Data sources: every OSRS game rule/dataset must retain source, timestamp and validation status. Unresolved fields stay unknown.
- CI: regression tests, Vite Worker Assets build, output verification and artifact packaging must pass on the exact branch head.
- Promotion: only a separate reviewed PR may propose a future production release. No production deployment is part of this work.

## Current implementation checkpoints

The following are present on the working branch; the most recent changes still need their own CI result where indicated:
- Global quick-action drawer and global notification centre.
- Dashboard templates and widget visibility.
- Evidence-led item movement panel.
- Account data-coverage audit and explicit unknown quest states.
- XP planner uses valid account XP or a level range and user-entered time rate only.
- Identified legacy quick-combat and seeded PvM ranking panels are withheld; manual PvM scenarios use only user-entered assumptions.
- Money Makers fallback rows do not display unsupported GP/hour.
- Up-to-four-item indexed historical midpoint comparison in Terminal.
- Item DNA displays market facts and labelled heuristic scores instead of arbitrary capital/stability sub-scores.

Do not mark this master ledger complete until every remaining criterion has passed tests, source validation and release gates.
