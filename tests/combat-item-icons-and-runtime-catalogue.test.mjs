import test from "node:test";
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

test("fails closed when the canonical catalogue API is unavailable", async () => {
  await assert.rejects(
    loadRuntimeCombatCatalogue({
      baseUrl: "https://test-runtime.example",
      fetchImpl: async () => new Response("{}", { status: 503 }),
    }),
    /canonical .* catalogue|HTTP 503/i,
  );
});
