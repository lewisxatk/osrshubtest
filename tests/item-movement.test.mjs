import test from "node:test";
import assert from "node:assert/strict";
import { buildItemMovementEvidence } from "../src/item-movement.js";

test("movement evidence compares ordered observed prices and reports actual sample coverage", () => {
  const result = buildItemMovementEvidence([
    { timestamp: 3000, buy: 110, sell: 120 },
    { timestamp: 1000, buy: 100, sell: 110 },
    { timestamp: 2000, buy: 105, sell: 115 }
  ], { volume: 2500 });
  assert.equal(result.sampleCount, 3);
  assert.equal(result.windowStart, 1000);
  assert.equal(result.windowEnd, 3000);
  assert.equal(result.midChangePct, ((115 - 105) / 105) * 100);
  assert.equal(result.direction, "rising");
  assert.equal(result.currentVolume, 2500);
});

test("movement evidence returns unknown rather than inventing a percentage for sparse history", () => {
  const result = buildItemMovementEvidence([{ timestamp: 1000, buy: 100, sell: 110 }], { volume: null });
  assert.equal(result.sampleCount, 1);
  assert.equal(result.hasComparableHistory, false);
  assert.equal(result.midChangePct, null);
  assert.equal(result.direction, "unknown");
  assert.equal(result.currentVolume, null);
});

test("movement evidence ignores invalid price samples and never mutates source history", () => {
  const history = [
    { timestamp: 1000, buy: 100, sell: 120 },
    { timestamp: "invalid", buy: 1000, sell: 1100 },
    { timestamp: 2000, buy: 0, sell: 130 },
    { timestamp: 3000, buy: -2, sell: "not a number" }
  ];
  const before = JSON.stringify(history);
  const result = buildItemMovementEvidence(history, { volume: 0 });
  assert.equal(result.sampleCount, 2);
  assert.equal(result.buyChangePct, null);
  assert.equal(result.sellChangePct, ((130 - 120) / 120) * 100);
  assert.equal(result.currentVolume, 0);
  assert.equal(JSON.stringify(history), before);
});

test("midpoint direction is flat when latest midpoint equals the first midpoint", () => {
  const result = buildItemMovementEvidence([
    { timestamp: 1000, buy: 100, sell: 120 },
    { timestamp: 2000, buy: 110, sell: 110 }
  ]);
  assert.equal(result.midChangePct, 0);
  assert.equal(result.direction, "flat");
});
