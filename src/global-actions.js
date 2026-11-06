export const GLOBAL_ACTIONS = [
  { id: "home", label: "Open Command Centre", description: "Your OSRS Hub overview, goals and next moves.", type: "navigate", target: "command", icon: "compass", group: "Navigate", keywords: ["home", "overview", "dashboard", "next move"] },
  { id: "market", label: "Open Live Market", description: "Grand Exchange prices, margins and item research.", type: "navigate", target: "market", icon: "activity", group: "Navigate", aliases: ["grand exchange", "live ge", "ge market"], keywords: ["grand exchange", "ge", "prices", "items"] },
  { id: "terminal", label: "Open Trading Terminal", description: "Charts, comparison, scanner and saved trading profiles.", type: "navigate", target: "terminal", icon: "chart", group: "Navigate", keywords: ["trading", "charts", "terminal", "compare"] },
  { id: "screener", label: "Open Opportunity Screener", description: "Filter, rank and scan the current market snapshot.", type: "navigate", target: "screener", icon: "radar", group: "Navigate", keywords: ["scanner", "filters", "flips"] },
  { id: "watch", label: "Open Watchlists", description: "Manage tracked items and saved market lists.", type: "navigate", target: "watch", icon: "target", group: "Navigate", keywords: ["watchlist", "favourites", "tracked"] },
  { id: "alerts", label: "Open Alerts", description: "Create and manage price rules and notification history.", type: "navigate", target: "alerts", icon: "bell", group: "Navigate", keywords: ["notifications", "price alerts", "rules"] },
  { id: "finance", label: "Open Flip Journal & Finance", description: "Review logged trades, P&L and bankroll.", type: "navigate", target: "finance", icon: "wallet", group: "Navigate", keywords: ["profit", "loss", "journal", "bankroll", "money"] },
  { id: "account", label: "Open Account Studio", description: "Account stats, goals, progression and loadout tools.", type: "navigate", target: "account", icon: "shield", group: "Navigate", keywords: ["account", "stats", "profile", "gear"] },
  { id: "combat", label: "Open Combat Studio", description: "Build and compare account-aware combat loadouts.", type: "navigate", target: "combat", icon: "swords", group: "Navigate", keywords: ["combat", "boss", "dps", "gear", "loadout"] },
  { id: "quests", label: "Open Quest Pathway", description: "Track quests and plan unlock progression.", type: "navigate", target: "quests", icon: "list", group: "Navigate", keywords: ["quest", "unlock", "prerequisite"] },
  { id: "levelling", label: "Open Levelling Planner", description: "Plan XP targets and training routes.", type: "navigate", target: "levelling", icon: "target", group: "Navigate", keywords: ["skills", "xp", "training", "99"] },
  { id: "intelligence", label: "Open OSRS Brain", description: "Search the structured OSRS knowledge base.", type: "navigate", target: "intelligence", icon: "book", group: "Navigate", keywords: ["encyclopaedia", "knowledge", "monster", "drop"] },
  { id: "recipes", label: "Open Recipes & Production", description: "Compare production inputs, outputs and economics.", type: "navigate", target: "recipes", icon: "layers", group: "Navigate", keywords: ["crafting", "herblore", "cooking", "production"] },
  { id: "highalch", label: "Open High Alcher", description: "Check alchemy values, rune costs and margins.", type: "navigate", target: "highalch", icon: "zap", group: "Navigate", keywords: ["alchemy", "alch", "nature rune"] },
  { id: "money", label: "Open Money Makers", description: "Explore methods and their account requirements.", type: "navigate", target: "money", icon: "wallet", group: "Navigate", keywords: ["gp per hour", "methods", "profit"] },
  { id: "heatmap", label: "Open Market Radar", description: "Explore market opportunities by relative metrics.", type: "navigate", target: "heatmap", icon: "chart", group: "Navigate", keywords: ["heatmap", "radar", "liquidity"] },
  { id: "backtest", label: "Open Historical Backtester", description: "Review strategies against observed historical prices.", type: "navigate", target: "backtest", icon: "clock", group: "Navigate", keywords: ["replay", "history", "strategy"] },
  { id: "tools", label: "Open Tools & Utilities", description: "Browse calculators and supporting OSRS tools.", type: "navigate", target: "cool", icon: "calculator", group: "Navigate", keywords: ["utilities", "calculators"] },
  { id: "data", label: "Open Data Control Centre", description: "Inspect available datasets and data-health tools.", type: "navigate", target: "admin", icon: "database", group: "Navigate", keywords: ["data", "health", "admin", "provenance"] },
  { id: "calculator", label: "Open Quick Profit Calculator", description: "Calculate after-tax GP profit, ROI and capital needed.", type: "calculator", icon: "calculator", group: "Quick tools", keywords: ["flip calculator", "tax", "margin", "roi"] },
  { id: "mini-ge", label: "Open Mini Grand Exchange", description: "Manage your eight-slot buy and sell planning workspace.", type: "mini-ge", icon: "shopping", group: "Quick tools", aliases: ["mini ge", "buy slots", "sell slots"], keywords: ["mini ge", "buy slots", "sell slots", "orders"] },
  { id: "new-alert", label: "Create a Price Alert", description: "Start a new item price or margin alert rule.", type: "alert", icon: "bell", group: "Quick tools", keywords: ["new alert", "threshold", "notification"] }
];

function scoreAction(query, action) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return 1;
  const label = String(action.label || "").toLowerCase();
  const terms = [label, action.description, ...(action.keywords || []), action.target].filter(Boolean).join(" ").toLowerCase();
  if (label === q) return 1000;
  if ((action.aliases || []).some(alias => String(alias).toLowerCase() === q)) return 960;
  if (label.startsWith(q)) return 900 - Math.max(0, label.length - q.length);
  if (label.includes(q)) return 850 - label.indexOf(q);
  if ((action.keywords || []).some(keyword => String(keyword).toLowerCase() === q)) return 800;
  if (terms.includes(q)) return 720 - Math.max(0, terms.indexOf(q)) * 0.01;
  const tokens = q.split(/\s+/).filter(Boolean);
  const matched = tokens.filter(token => terms.includes(token));
  if (!matched.length) return -1;
  return 250 * matched.length / tokens.length + (terms.includes(q) ? 100 : 0);
}

export function searchGlobalActions(query, items = [], limit = 12) {
  const q = String(query || "").trim();
  const actions = GLOBAL_ACTIONS.map(action => ({ ...action, score: scoreAction(q, action), resultType: "action" }))
    .filter(action => action.score >= 0);
  const itemResults = q ? (Array.isArray(items) ? items : []).map(item => {
    const name = String(item?.name || "");
    const id = String(item?.id ?? "");
    const lower = name.toLowerCase();
    const queryLower = q.toLowerCase();
    const score = lower === queryLower ? 1200 : lower.startsWith(queryLower) ? 900 : lower.includes(queryLower) ? 700 - lower.indexOf(queryLower) : id === q ? 800 : -1;
    return score < 0 ? null : {
      id: "item:" + id, label: name, description: "Open live item dossier · " + (id ? "Item " + id : "Grand Exchange"),
      type: "item", item, icon: "item", group: "Items", score, resultType: "item"
    };
  }).filter(Boolean) : [];
  const defaultOrder = ["home", "market", "terminal", "screener", "calculator", "mini-ge", "new-alert", "watch", "alerts", "finance", "account", "combat", "quests", "levelling", "intelligence", "recipes", "highalch", "money", "heatmap", "backtest", "tools", "data"];
  const results = [...actions, ...itemResults];
  results.sort((a, b) => q
    ? b.score - a.score || a.label.localeCompare(b.label)
    : defaultOrder.indexOf(a.id) - defaultOrder.indexOf(b.id));
  return results.slice(0, Math.max(1, Number(limit) || 12));
}
