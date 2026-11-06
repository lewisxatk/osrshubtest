import test from "node:test";
import assert from "node:assert/strict";
import { matchesScreenerConditions } from "../src/screener-filters.js";

const item = { id: 4151, members: true, buy: 1_000_000, sell: 1_050_000, margin: 29_000, roi: 2.9, volume: 12_000, buyUpdated: 1_800_000_000_000 };

test("ALL mode requires each valid condition to pass", () => {
  const rules = [
    { field: "margin", op: "gte", value: 20_000 },
    { field: "volume", op: "gte", value: 10_000 }
  ];
  assert.equal(matchesScreenerConditions(item, rules, "all", 1_800_000_060_000), true);
  assert.equal(matchesScreenerConditions(item, [...rules, { field: "roi", op: "gt", value: 5 }], "all"), false);
});

test("ANY mode passes when at least one condition matches", () => {
  const rules = [
    { field: "margin", op: "gte", value: 100_000 },
    { field: "volume", op: "gte", value: 10_000 }
  ];
  assert.equal(matchesScreenerConditions(item, rules, "any"), true);
  assert.equal(matchesScreenerConditions(item, rules, "all"), false);
});

test("membership filters and all supported comparison operators work", () => {
  assert.equal(matchesScreenerConditions(item, [{ field: "members", op: "eq", value: "members" }]), true);
  assert.equal(matchesScreenerConditions(item, [{ field: "members", op: "eq", value: "f2p" }]), false);
  for (const [op, expected] of [["gt", false], ["gte", true], ["eq", true], ["lte", true], ["lt", false]]) {
    assert.equal(matchesScreenerConditions(item, [{ field: "margin", op, value: 29_000 }]), expected);
  }
});

test("missing fields never satisfy a filter, even in ANY mode", () => {
  const rules = [
    { field: "missingSourceField", op: "gte", value: 0 },
    { field: "roi", op: "gte", value: 2 }
  ];
  assert.equal(matchesScreenerConditions({ roi: null }, rules, "any"), false);
  assert.equal(matchesScreenerConditions({ roi: 2.5 }, rules, "any"), true);
  assert.equal(matchesScreenerConditions({ roi: null }, rules, "all"), false);
});

test("age filters use real source timestamps and reject missing timestamps", () => {
  const now = 1_800_000_060_000;
  assert.equal(matchesScreenerConditions(item, [{ field: "buyAge", op: "lte", value: 1 }], "all", now), true);
  assert.equal(matchesScreenerConditions({ ...item, buyUpdated: null }, [{ field: "buyAge", op: "lte", value: 5 }], "all", now), false);
});

test("empty filters preserve the existing no-filter behaviour", () => {
  assert.equal(matchesScreenerConditions(item, [], "all"), true);
  assert.equal(matchesScreenerConditions(item, [], "any"), true);
});
