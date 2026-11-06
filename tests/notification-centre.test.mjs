import test from "node:test";
import assert from "node:assert/strict";
import { buildNotificationFeed } from "../src/notification-centre.js";

test("notification feed includes actual saved price alerts without fabricating price fields", () => {
  const alert = { id: "a1", name: "Abyssal whip", itemId: 4151, metric: "sell", target: 1_000_000, at: 1_800_000_000_000 };
  const feed = buildNotificationFeed({ alerts: [alert], items: [{ id: 4151 }], updated: 1_800_000_000_000, now: 1_800_000_000_100 });
  const row = feed.find(entry => entry.id === "alert:a1");
  assert.equal(row.title, "Abyssal whip alert triggered");
  assert.equal(row.description, "SELL reached 1,000,000 gp");
  assert.equal(row.itemId, 4151);
});

test("feed surfaces an empty market and a local-only account accurately", () => {
  const feed = buildNotificationFeed({ items: [], loading: false, cloudUser: null, now: 1_800_000_000_000 });
  assert.ok(feed.some(entry => entry.id === "system:market:empty" && entry.tone === "warning"));
  assert.ok(feed.some(entry => entry.id === "system:cloud:local"));
  assert.ok(!feed.some(entry => entry.id === "system:cloud:connected"));
});

test("stale market warning appears only when the last verified update is older than five minutes", () => {
  const now = 1_800_000_000_000;
  const stale = buildNotificationFeed({ items: [{ id: 1 }], updated: now - 300_001, now });
  const fresh = buildNotificationFeed({ items: [{ id: 1 }], updated: now - 299_999, now });
  assert.ok(stale.some(entry => entry.id === "system:market:stale"));
  assert.ok(!fresh.some(entry => entry.id === "system:market:stale"));
});

test("cloud sync status reflects app state and alert rules count stays grounded", () => {
  const feed = buildNotificationFeed({
    items: [{ id: 1 }], updated: 1_800_000_000_000,
    alertRules: [{ id: "r1" }, { id: "r2" }],
    cloudUser: { id: "account" }, cloudSyncing: true,
    now: 1_800_000_000_100
  });
  assert.ok(feed.some(entry => entry.id === "system:cloud:syncing"));
  assert.ok(feed.some(entry => entry.description === "2 rule(s) are stored in this workspace."));
});


test("cached market rows are not misreported as an empty market while refresh is active", () => {
  const feed = buildNotificationFeed({ items: [{ id: 1 }], loading: true, updated: null });
  assert.ok(!feed.some(entry => entry.id === "system:market:empty"));
  assert.ok(!feed.some(entry => entry.id === "system:market:loading"));
});
