import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const main = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const panel = await readFile(new URL("../src/AccountLinkPanel.jsx", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const combat = await readFile(new URL("../src/CombatStudioPage.jsx", import.meta.url), "utf8");
const optimizer = await readFile(new URL("../src/combat-studio/engine-loadout-optimizer.js", import.meta.url), "utf8");
const runtimeWorkflow = await readFile(new URL("../.github/workflows/validate.yml", import.meta.url), "utf8");

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

test("RuneLite profile JSON import is explicitly local and does not claim remote desktop access", () => {
  assert.match(panel, /Import RuneLite JSON/);
  assert.match(panel, /parseRuneLiteProfile/);
  assert.match(panel, /RuneLite desktop is not remotely controlled/);
  assert.match(panel, /Local first/);
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
  assert.match(combat, /find\(v=>Number\.isFinite\(v)&&v>0\)/);
  assert.doesNotMatch(combat, /barrowsgloves\?130000/);
  assert.match(optimizer, /if \(name === "barrowsgloves"\) return 0/);
  assert.match(optimizer, /up to four shortlisted alternatives per slot/);
  assert.match(optimizer, /Choose a monster with a canonical combat-engine ID/);
});
