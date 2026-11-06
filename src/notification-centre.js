const asTime = value => {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? (value < 1e12 ? value * 1000 : value) : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function buildNotificationFeed({ alerts = [], alertRules = [], items = [], updated = null, loading = false, cloudUser = null, cloudSyncing = false, now = Date.now() } = {}) {
  const history = (Array.isArray(alerts) ? alerts : []).map((alert, index) => {
    const at = asTime(alert?.at);
    const metric = String(alert?.metric || "condition");
    const rawTarget = alert?.target ?? alert?.value;
    const target = rawTarget == null ? "the saved threshold" : metric === "roi" ? `${Number(rawTarget).toFixed(2)}%` : `${Number(rawTarget).toLocaleString("en-GB")} gp`;
    return {
      id: `alert:${String(alert?.id ?? index)}`,
      kind: "alert",
      tone: "alert",
      title: `${String(alert?.name || "Item")} alert triggered`,
      description: `${metric.toUpperCase()} reached ${target}`,
      at,
      itemId: alert?.itemId ?? null,
      target: "item"
    };
  });

  const system = [];
  const snapshotTime = asTime(updated);
  const stale = snapshotTime != null && now - snapshotTime > 5 * 60 * 1000;
  if (loading && !(Array.isArray(items) && items.length)) {
    system.push({ id: "system:market:loading", kind: "system", tone: "info", title: "Market data is loading", description: "The market snapshot is being refreshed.", target: "market", at: now });
  } else if (!(Array.isArray(items) && items.length)) {
    system.push({ id: "system:market:empty", kind: "system", tone: "warning", title: "No market snapshot available", description: "Market-dependent tools may show empty or unavailable data until the price feed responds.", target: "market", at: now });
  } else if (stale) {
    system.push({ id: "system:market:stale", kind: "system", tone: "warning", title: "Market snapshot may be stale", description: `${items.length.toLocaleString("en-GB")} items are loaded; the last refresh was more than five minutes ago.`, target: "market", at: snapshotTime });
  }

  if (Array.isArray(alertRules) && alertRules.length) {
    system.push({ id: "system:alerts:rules", kind: "system", tone: "info", title: "Alert rules saved", description: `${alertRules.length.toLocaleString("en-GB")} rule(s) are stored in this workspace.`, target: "alerts", at: null });
  }
  if (cloudUser) {
    system.push({ id: cloudSyncing ? "system:cloud:syncing" : "system:cloud:connected", kind: "system", tone: cloudSyncing ? "info" : "success", title: cloudSyncing ? "Workspace sync in progress" : "Cloud account connected", description: cloudSyncing ? "Your saved workspace settings are being synchronised." : "This workspace is linked to your OSRS Hub account.", target: "account", at: null });
  } else {
    system.push({ id: "system:cloud:local", kind: "system", tone: "info", title: "Using a local workspace", description: "Changes are saved in this browser. Sign in only when a separate test account service is configured.", target: "account", at: null });
  }

  return [...history, ...system].sort((a, b) => (b.at || 0) - (a.at || 0));
}
