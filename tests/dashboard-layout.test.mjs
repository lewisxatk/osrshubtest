import test from "node:test";
import assert from "node:assert/strict";
import { DASHBOARD_TEMPLATES, DASHBOARD_WIDGETS, getDashboardTemplateWidgets, isDashboardTemplate, normaliseDashboardWidgets } from "../src/dashboard-layout.js";

test("dashboard ships balanced, trading and workspace presets using only real widgets", () => {
  for (const key of ["balanced", "trading", "workspace"]) {
    assert.ok(isDashboardTemplate(key));
    const widgets = getDashboardTemplateWidgets(key);
    assert.ok(widgets.length > 0);
    assert.ok(widgets.every(id => DASHBOARD_WIDGETS.some(widget => widget.id === id)));
  }
  assert.equal(DASHBOARD_TEMPLATES.balanced.length, 5);
});

test("dashboard widget settings remove duplicates and unknown IDs", () => {
  assert.deepEqual(normaliseDashboardWidgets(["market", "market", "made-up"]), ["market"]);
  assert.deepEqual(normaliseDashboardWidgets([]), [...DASHBOARD_TEMPLATES.balanced]);
  assert.deepEqual(normaliseDashboardWidgets("not an array"), [...DASHBOARD_TEMPLATES.balanced]);
});

test("unknown dashboard template safely falls back to balanced widgets", () => {
  assert.equal(isDashboardTemplate("unknown"), false);
  assert.deepEqual(getDashboardTemplateWidgets("unknown"), [...DASHBOARD_TEMPLATES.balanced]);
});

test("all dashboard widget IDs are unique", () => {
  const ids = DASHBOARD_WIDGETS.map(widget => widget.id);
  assert.equal(new Set(ids).size, ids.length);
});
