import test from "node:test";
import assert from "node:assert/strict";
import { GLOBAL_ACTIONS, searchGlobalActions } from "../src/global-actions.js";

test("global action catalogue has unique IDs and valid navigation destinations", () => {
  const ids = GLOBAL_ACTIONS.map(action => action.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const action of GLOBAL_ACTIONS.filter(action => action.type === "navigate")) {
    assert.ok(action.target);
    assert.ok(action.label);
    assert.ok(action.description);
  }
});

test("blank quick-action search exposes useful navigation and quick tools", () => {
  const results = searchGlobalActions("", [], 30);
  const ids = new Set(results.map(result => result.id));
  for (const id of ["market", "terminal", "combat", "quests", "calculator", "mini-ge", "new-alert"]) assert.ok(ids.has(id));
});

test("search ranks direct page matches and finds quick tools by keywords", () => {
  assert.equal(searchGlobalActions("combat", [])[0].id, "combat");
  assert.equal(searchGlobalActions("profit calculator", [])[0].id, "calculator");
  assert.equal(searchGlobalActions("grand exchange", [])[0].id, "market");
});

test("item search supports case-insensitive names and numeric IDs without mutating records", () => {
  const item = { id: 4151, name: "Abyssal whip", icon: "Abyssal whip.png", buy: 100, sell: 120 };
  const byName = searchGlobalActions("ABYSSAL", [item]);
  assert.equal(byName[0].resultType, "item");
  assert.equal(byName[0].item, item);
  const byId = searchGlobalActions("4151", [item]);
  assert.equal(byId[0].item, item);
  assert.deepEqual(item, { id: 4151, name: "Abyssal whip", icon: "Abyssal whip.png", buy: 100, sell: 120 });
});

test("search results are bounded and no-match searches remain empty", () => {
  assert.equal(searchGlobalActions("zzzxqv", []).length, 0);
  assert.ok(searchGlobalActions("market", [], 2).length <= 2);
});
