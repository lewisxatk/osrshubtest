import test from "node:test";
import assert from "node:assert/strict";
import { COLUMN_PRESETS, getColumnPreset } from "../src/screener-column-presets.js";

test("Trading, Liquidity, Risk and Full presets use known configurable columns", () => {
  const allowed = new Set(COLUMN_PRESETS.full);
  for (const name of ["trading", "liquidity", "risk", "full"]) {
    const preset = getColumnPreset(name);
    assert.ok(preset.length > 0);
    assert.equal(new Set(preset).size, preset.length);
    assert.ok(preset.every(key => allowed.has(key)));
  }
});

test("unknown column preset returns no changes", () => {
  assert.deepEqual(getColumnPreset("unknown"), []);
});

test("presets return independent arrays and do not mutate definitions", () => {
  const first = getColumnPreset("trading");
  first.push("invalid");
  assert.ok(!getColumnPreset("trading").includes("invalid"));
});
