import test from "node:test";
import assert from "node:assert/strict";
import { buildNormalizedComparisonSeries } from "../src/market-compare.js";

test("comparison independently indexes each item's first midpoint to 100", () => {
  const result = buildNormalizedComparisonSeries([
    { id: 4151, name: "Abyssal whip", points: [
      { timestamp: 1000, buy: 100, sell: 120 },
      { timestamp: 2000, buy: 110, sell: 130 }
    ] },
    { id: 11802, name: "Armadyl godsword", points: [
      { timestamp: 1000, buy: 1_000_000, sell: 1_200_000 },
      { timestamp: 2000, buy: 900_000, sell: 1_100_000 }
    ] }
  ]);
  assert.equal(result.lines.length, 2);
  assert.equal(result.data[0].item_4151, 100);
  assert.equal(result.data[0].item_11802, 100);
  assert.ok(Math.abs(result.data[1].item_4151 - (120 / 110 * 100)) < 1e-10);
  assert.equal(result.data[1].item_11802, 90.9090909090909);
  assert.equal(result.hasComparableSeries, true);
});

test("missing or one-sided price observations are omitted, not interpolated", () => {
  const result = buildNormalizedComparisonSeries([
    { id: 1, name: "One", points: [
      { timestamp: 1000, buy: 100, sell: 120 },
      { timestamp: 2000, buy: 110, sell: null },
      { timestamp: 3000, buy: null, sell: 140 }
    ] },
    { id: 2, name: "Two", points: [
      { timestamp: 1000, buy: 200, sell: 220 },
      { timestamp: 2000, buy: 210, sell: 230 }
    ] }
  ]);
  assert.equal(result.lines[0].pointCount, 1);
  assert.equal(result.data.find(row => row.timestamp === 2000).item_1, undefined);
  assert.ok(Math.abs(result.data.find(row => row.timestamp === 2000).item_2 - (220 / 210 * 100)) < 1e-10);
});

test("invalid IDs, duplicate IDs, non-positive prices and malformed timestamps are ignored", () => {
  const result = buildNormalizedComparisonSeries([
    { id: 1, name: "First", points: [
      { timestamp: 1000, buy: 100, sell: 120 },
      { timestamp: "bad", buy: 150, sell: 170 },
      { timestamp: 3000, buy: 0, sell: 140 }
    ] },
    { id: 1, name: "Duplicate", points: [{ timestamp: 1000, buy: 1, sell: 2 }] },
    { id: -1, name: "Bad ID", points: [{ timestamp: 1000, buy: 1, sell: 2 }] },
    { id: 2, name: "No baseline", points: [{ timestamp: 1, buy: null, sell: 20 }] }
  ]);
  assert.equal(result.lines.length, 1);
  assert.equal(result.lines[0].name, "First");
  assert.deepEqual(result.data.map(row => row.timestamp), [1000]);
});

test("comparison rows sort by timestamp and source inputs are not mutated", () => {
  const points = [
    { timestamp: 3000, buy: 120, sell: 140 },
    { timestamp: 1000, buy: 100, sell: 120 },
    { timestamp: 2000, buy: 110, sell: 130 }
  ];
  const before = JSON.stringify(points);
  const result = buildNormalizedComparisonSeries([{ id: 10, points }]);
  assert.deepEqual(result.data.map(row => row.timestamp), [1000, 2000, 3000]);
  assert.equal(JSON.stringify(points), before);
});

test("sparse comparisons explicitly report that two valid series are required", () => {
  const result = buildNormalizedComparisonSeries([{ id: 1, points: [{ timestamp: 1000, buy: 1, sell: 2 }] }]);
  assert.equal(result.hasComparableSeries, false);
  assert.match(result.message, /At least two items/);
});
