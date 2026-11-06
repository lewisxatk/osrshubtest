export const DASHBOARD_WIDGETS = [
  { id: "opportunities", label: "Flip opportunities", description: "Current snapshot-ranked candidates" },
  { id: "market", label: "Market pulse", description: "Loaded liquidity, margin and alert counts" },
  { id: "workspace", label: "Saved workspace", description: "Profiles, columns, filters and portfolio count" },
  { id: "journal", label: "Flip journal", description: "Record and review completed trades" },
  { id: "competition", label: "Competition snapshot", description: "Relative market crowding proxy" }
];

export const DASHBOARD_TEMPLATES = {
  balanced: ["opportunities", "market", "workspace", "journal", "competition"],
  trading: ["opportunities", "market", "journal", "competition"],
  workspace: ["opportunities", "market", "workspace", "journal"]
};

export function isDashboardTemplate(value) {
  return Object.prototype.hasOwnProperty.call(DASHBOARD_TEMPLATES, value);
}

export function normaliseDashboardWidgets(value) {
  if (!Array.isArray(value)) return [...DASHBOARD_TEMPLATES.balanced];
  const allowed = new Set(DASHBOARD_WIDGETS.map(widget => widget.id));
  const selected = [...new Set(value.filter(id => allowed.has(id)))];
  return selected.length ? selected : [...DASHBOARD_TEMPLATES.balanced];
}

export function getDashboardTemplateWidgets(template) {
  return [...(DASHBOARD_TEMPLATES[template] || DASHBOARD_TEMPLATES.balanced)];
}
