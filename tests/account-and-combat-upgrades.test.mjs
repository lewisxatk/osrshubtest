import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const panel = await readFile(new URL("../src/AccountLinkPanel.jsx", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const combat = await readFile(new URL("../src/CombatStudioPage.jsx", import.meta.url), "utf8");
const optimizer = await readFile(new URL("../src/combat-studio/engine-loadout-optimizer.js", import.meta.url), "utf8");
const runtimeWorkflow = await readFile(new URL("../.github/workflows/validate.yml", import.meta.url), "utf8");
const animations = await readFile(new URL("../src/unique-animations.css", import.meta.url), "utf8");
const themeCss = await readFile(new URL("../src/theme-compatibility.css", import.meta.url), "utf8");

test("account linking is available in Account Studio and remembers multiple profiles locally", () => {
  assert.match(main, /AccountLinkPanel/);
  assert.match(main, /osrshub-linked-accounts/);
  assert.match(panel, /localStorage\.setItem\(STORE_KEY/);
  assert.match(panel, /localStorage\.setItem\("osrshub-account"/);
  assert.match(panel, /Saved accounts/);
});

test("Hiscores import parses the Overall row and all supported skills including Sailing", () => {
  assert.match(panel, /HISCORE_ORDER=\["Overall".*"Sailing"\]/);
  assert.match(panel, /split\(\/\\r\?\\n\//);
  assert.match(panel, /skill==="Overall"\?2500:126/);
  assert.match(worker, /async function hiscores\(request\)/);
  assert.match(worker, /STANDARD:UPSTREAM/);
  assert.match(worker, /hiscore_oldschool_ironman/);
  assert.match(worker, /hiscore_oldschool_ultimate/);
  assert.match(worker, /hiscore_oldschool_hardcore_ironman/);
});

test("RuneLite profile import reuses the existing settings-profile parser and persists the resulting account", () => {
  assert.match(panel, /Import RuneLite profile/);
  assert.match(main, /RuneLite profile export/);
  assert.match(main, /persistAccount\(next\)/);
  assert.match(main, /RuneLite/);
});

test("linked account profiles are included in both sides of Discord cloud backup", () => {
  assert.match(main, /"osrshub-linked-accounts"/);
  assert.match(worker, /"osrshub-linked-accounts"/);
  assert.match(panel, /Discord cloud backup is not enabled on this isolated test Worker yet/);
});

test("Combat Studio loads canonical equipment and monster IDs from its isolated runtime", () => {
  assert.match(combat, /osrshubtest-combat-runtime\.prices-app\.workers\.dev/);
  assert.match(combat, /\/api\/monsters\?limit=1000/);
  assert.match(combat, /\/api\/equipment\?limit=1000/);
  assert.match(runtimeWorkflow, /Deploy isolated canonical combat runtime/);
  assert.match(runtimeWorkflow, /ALLOWED_ORIGIN:https:\/\/osrshubtest\.prices-app\.workers\.dev/);
});

test("Combat Studio only accepts positive live prices and does not invent Barrows gloves GP cost", () => {
  assert.ok(combat.includes("find(v=>Number.isFinite(v)&&v>0)"));
  assert.ok(combat.includes("[it.sell,it.high,it.price,it._price,prev._price]"));
  assert.ok(combat.includes("[x._price,x.sell,x.high,x.price]"));
  assert.match(combat, /if\(x\.tradeable===false/);
  assert.ok(!combat.includes("x.buy"));
  assert.doesNotMatch(optimizer, /item\?\.buy/);
  assert.match(optimizer, /const untradeable = item\?\.tradeable/);
  assert.match(optimizer, /if \(untradeable\) values\.push/);
  assert.doesNotMatch(combat, /barrowsgloves\?130000/);
  assert.match(optimizer, /if \(name === "barrowsgloves"\) return 0/);
  assert.match(optimizer, /up to four shortlisted alternatives per slot/);
  assert.match(optimizer, /Choose a monster with a canonical combat-engine ID/);
});

test("new OSRS-inspired motion is theme-aware and respects reduced-motion preferences", () => {
  assert.match(main, /accountStudioHero osrs-rune-ambient/);
  assert.match(main, /marketEvents osrs-rune-ambient/);
  assert.match(combat, /combat-studio osrs-rune-ambient/);
  assert.match(animations, /@keyframes osrsRuneDrift/);
  assert.match(animations, /@keyframes osrsSignalPulse/);
  assert.match(animations, /@keyframes osrsDossierReveal/);
  assert.match(animations, /prefers-reduced-motion:reduce/);
});

test("Account Studio RuneLite import uses the official export flow and persists imported profiles", () => {
  assert.match(main, /Import RuneLite profile/);
  assert.match(main, /Export profile/);
  assert.match(main, /api\/hiscores\?player=/);
  assert.match(main, /hiscoreMode/);
  assert.match(main, /lines\[index\+1\]/);
  assert.match(main, /const persistAccount=next=>/);
  assert.match(main, /osrshub-linked-accounts/);
});

test("all theme families use shared surface, control and feature-card tokens", () => {
  for (const theme of ["frost","comfort","graphite","gilded","opera"]) assert.ok(themeCss.includes('html[data-theme="'+theme+'"]'));
  assert.match(themeCss, /input:not\(\[type="checkbox"\]\)/);
  assert.match(themeCss, /\.mobileToolBtn/);
  assert.match(themeCss, /\.itemDetailCard/);
  assert.match(themeCss, /\.calcLabCard/);
  assert.match(themeCss, /var\(--oh-surface2\)/);
});

test("Market discovery toolbar and floating profile panels are hidden on focused item dossier pages", () => {
  assert.match(themeCss, /body:has\(\.routeItemPage\) \.filterbar/);
  assert.match(themeCss, /body:has\(\.routeItemPage\) \.mobileQuickTools/);
  assert.match(themeCss, /body:has\(\.routeItemPage\) \.mobileColumnsPanel/);
});
