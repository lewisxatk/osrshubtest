import test from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { equipmentIconUrl } from "../src/combat-studio/item-icons.js";
import { loadRuntimeCombatCatalogue } from "../src/combat-studio/runtime-catalogue.js";

test("resolves untradeable equipment icons from the Combat Engine asset catalogue", () => {
  assert.equal(
    equipmentIconUrl("Barrows gloves"),
    "https://raw.githubusercontent.com/lewisxatk/osrshub-combat-engine/main/cdn/equipment/Barrows%20gloves.png",
  );
  assert.equal(
    equipmentIconUrl("Salve amulet (e)"),
    "https://raw.githubusercontent.com/lewisxatk/osrshub-combat-engine/main/cdn/equipment/Salve%20amulet%20(e).png",
  );
});

test("prefers an explicit image URL and resolves engine-relative image paths", () => {
  assert.equal(equipmentIconUrl("Item", "https://cdn.example/item.png"), "https://cdn.example/item.png");
  assert.equal(
    equipmentIconUrl("Barrows gloves", "cdn/equipment/Barrows gloves.png"),
    "https://raw.githubusercontent.com/lewisxatk/osrshub-combat-engine/main/cdn/equipment/Barrows%20gloves.png",
  );
});

test("does not request an image for an empty equipment slot", () => {
  assert.equal(equipmentIconUrl("—"), "");
});

test("loads and paginates both canonical engine catalogues", async () => {
  const calls = [];
  const data = {
    monsters: [{ id: 8059, name: "Vorkath" }, { id: 7223, name: "Scurrius" }],
    equipment: [{ id: 21012, name: "Dragon hunter crossbow", slot: "weapon" }, { id: 7462, name: "Barrows gloves", slot: "hands" }],
  };
  const fetchImpl = async input => {
    const url = new URL(String(input));
    calls.push(url.pathname + url.search);
    const resource = url.pathname.split("/").at(-1);
    const offset = Number(url.searchParams.get("offset"));
    const pageSize = Number(url.searchParams.get("limit"));
    const rows = data[resource];
    const results = rows.slice(offset, offset + pageSize);
    return new Response(JSON.stringify({ status: "ok", total: rows.length, offset, limit: pageSize, results }), { status: 200 });
  };
  const result = await loadRuntimeCombatCatalogue({ baseUrl: "https://test-runtime.example///", fetchImpl, pageSize: 1 });
  assert.equal(result.status, "ready");
  assert.deepEqual(result.counts, { monsters: 2, equipment: 2 });
  assert.equal(result.monsters.find(row => row.name === "Vorkath").id, 8059);
  assert.equal(result.equipment.find(row => row.name === "Barrows gloves").id, 7462);
  assert.equal(calls.length, 4);
});

test("preserves monster variants that share an NPC ID and gives each a stable record index", async () => {
  const data = {
    monsters: [
      { id: 265, name: "Blue dragon", version: "1" },
      { id: 265, name: "Blue dragon", version: "Task only, 1" },
      { id: 8059, name: "Vorkath", version: "Post-quest" },
    ],
    equipment: [
      { id: 21012, name: "Dragon hunter crossbow", slot: "weapon" },
    ],
  };
  const fetchImpl = async input => {
    const url = new URL(String(input));
    const resource = url.pathname.split("/").at(-1);
    const offset = Number(url.searchParams.get("offset"));
    const limit = Number(url.searchParams.get("limit"));
    const rows = data[resource];
    return new Response(JSON.stringify({
      status: "ok",
      total: rows.length,
      offset,
      limit,
      results: rows.slice(offset, offset + limit),
    }), { status: 200 });
  };

  const result = await loadRuntimeCombatCatalogue({
    baseUrl: "https://test-runtime.example",
    fetchImpl,
    pageSize: 1,
  });

  assert.equal(result.counts.monsters, 3);
  assert.deepEqual(result.monsters.map(row => row.recordIndex), [0, 1, 2]);
  assert.equal(result.monsters.filter(row => row.id === 265).length, 2);
  assert.equal(result.monsters[1].version, "Task only, 1");
  assert.equal(result.equipment.length, 1);
});

test("fails closed when the canonical catalogue API is unavailable", async () => {
  await assert.rejects(
    loadRuntimeCombatCatalogue({
      baseUrl: "https://test-runtime.example",
      fetchImpl: async () => new Response("{}", { status: 503 }),
    }),
    /canonical .* catalogue|HTTP 503/i,
  );
});


test("Combat Studio never shows hard-coded sample gear as a completed recommendation", () => {
  const page = readFileSync(new URL("../src/CombatStudioPage.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /STYLE_SLOTS/);
  assert.match(page, /setSlots\(EMPTY_SLOTS\.map/);
  assert.match(page, /Engine verified/);
  assert.match(page, /Not built/);
  assert.match(page, /osrshubtest-combat-runtime\.prices-app\.workers\.dev/);
  assert.doesNotMatch(page, /localStorage\.getItem\(["\x27]osrshub-combat-runtime-url/);
});

test("Combat Studio rejects an engine result that exceeds the user budget", () => {
  const page = readFileSync(new URL("../src/CombatStudioPage.jsx", import.meta.url), "utf8");
  assert.match(page, /Number\(outcome\.totalCost\)>Number\(budget\)/);
  assert.match(page, /returned a loadout above your budget/);
});

test("untradeable equipment remains discoverable and uses canonical engine icons", () => {
  const workbench = readFileSync(new URL("../src/combat-studio/LoadoutWorkbench.jsx", import.meta.url), "utf8");
  assert.match(workbench, /item\.tradeable === false/);
  assert.match(workbench, /equipmentIconUrl/);
  assert.match(workbench, /Untradeable/);
});

test("the test Worker exposes untradeable quest and unlock metadata from D1", () => {
  const worker = readFileSync(new URL("../worker.js", import.meta.url), "utf8");
  assert.match(worker, /quest_requirements:Array\.isArray\(item\.quest_requirements\)/);
  assert.match(worker, /unlock_requirements_note:item\.unlock_requirements_note/);
  assert.match(worker, /shopPrice:Number\(item\.shop_price/);
});


test("changing the budget or target clears every old equipment slot and recommendation", () => {
  const page = readFileSync(new URL("../src/CombatStudioPage.jsx", import.meta.url), "utf8");
  assert.match(page, /setSlots\(EMPTY_SLOTS\.map\(x=>\[\.\.\.x\]\)\);setStatus\(""\);setError\(false\)\},\[boss,selectedTargetRecordIndex,attackType,stance,budget,account\?\.name,accountAware\]\)/);
});

test("Auto Build offers an explicit guest demo when account restrictions are disabled", () => {
  const page = readFileSync(new URL("../src/CombatStudioPage.jsx", import.meta.url), "utf8");
  assert.match(page, /if\(!account\?\.name&&accountAware\)/);
  assert.match(page, /No OSRS account is linked/);
  assert.match(page, /cs-account-settings/);
  assert.match(page, /useState\(Boolean\(account\?\.name\)\)/);
  assert.match(page, /Guest build · assumed maxed levels \(99\) · not account-specific/);
});

test("verified Auto Build only accepts a canonical monster record, never a heuristic target", () => {
  const page = readFileSync(new URL("../src/CombatStudioPage.jsx", import.meta.url), "utf8");
  assert.match(page, /const canonicalTarget=selectedTargetRecord/);
  assert.match(page, /heuristic target hints cannot be used/);
  assert.doesNotMatch(page, /Use “\{bossQuery\.trim\(\)\}” as target/);
});

test("untradeable gear can enter DPS search only when its acquisition price is recorded", () => {
  const optimizer = readFileSync(new URL("../src/combat-studio/engine-loadout-optimizer.js", import.meta.url), "utf8");
  assert.match(optimizer, /item\?\.shopPrice/);
  assert.match(optimizer, /if \(price == null\)/);
  assert.doesNotMatch(optimizer, /item\.tradeable === false && normalized !==/);
});


test("Combat Studio resolves monster variants by record index and keeps variant IDs in live builds",()=>{
 const page=readFileSync(new URL("../src/CombatStudioPage.jsx",import.meta.url),"utf8");
 assert.match(page,/recordIndex:Number\.isInteger\(m\.recordIndex\)\?m\.recordIndex:index/);
 assert.match(page,/const selectedTargetRecord=useMemo\(\(\)=>loadedTargetRecords\.find\(record=>record\.recordIndex===selectedTargetRecordIndex\)/);
 assert.match(page,/target:\{id:Number\(canonicalTarget\.id\),name:canonicalTarget\.name,version:canonicalTarget\.version\?\?\"\",recordIndex:Number\(canonicalTarget\.recordIndex\),attributes:Array\.isArray\(canonicalTarget\.attributes\)\?canonicalTarget\.attributes:\[\]\}/);
 assert.match(page,/record\.version\?\" — \"\+record\.version/);
});

test("paper-doll slots open the matching canonical item picker",()=>{
 const page=readFileSync(new URL("../src/CombatStudioPage.jsx",import.meta.url),"utf8");
 assert.match(page,/onClick=\{\(\)=>openWorkbenchSlot\(slot\)\}/);
 assert.match(page,/activeSlotValue=\{workbenchSlot\} onActiveSlotChange=\{setWorkbenchSlot\}/);
});
