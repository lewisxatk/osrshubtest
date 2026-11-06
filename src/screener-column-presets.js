export const COLUMN_PRESETS = {
  trading: ["buy", "sell", "margin", "potentialProfit", "roi", "volume"],
  liquidity: ["buy", "sell", "volume", "limit", "limitCost", "buyUpdated", "sellUpdated"],
  risk: ["buy", "sell", "margin", "flipScore", "riskScore", "buyUpdated", "sellUpdated", "updated"],
  full: ["buy", "sell", "margin", "potentialProfit", "roi", "volume", "flipScore", "riskScore", "capitalEfficiency", "slotProfit", "limit", "limitCost", "tax", "alch", "buyUpdated", "sellUpdated", "updated"]
};

export function getColumnPreset(name) {
  const preset = COLUMN_PRESETS[name];
  return Array.isArray(preset) ? [...new Set(preset)] : [];
}
