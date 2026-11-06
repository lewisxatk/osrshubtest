const numeric = value => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function matchesScreenerConditions(item, conditions = [], mode = "all", now = Date.now()) {
  const rules = Array.isArray(conditions) ? conditions : [];
  if (!rules.length) return true;
  const results = rules.map(condition => {
    if (!condition || typeof condition !== "object") return false;
    if (condition.field === "members") {
      if (condition.value === "members") return item?.members === true;
      if (condition.value === "f2p") return item?.members === false;
      return condition.value === "any";
    }

    let raw = item?.[condition.field];
    if (condition.field === "buyAge" || condition.field === "sellAge" || condition.field === "updatedAge") {
      const timestamp = numeric(condition.field === "buyAge" ? item?.buyUpdated : condition.field === "sellAge" ? item?.sellUpdated : item?.lastUpdated);
      raw = timestamp == null || timestamp <= 0 ? null : Math.max(0, (now - timestamp) / 60_000);
    }

    const observed = numeric(raw);
    const target = numeric(condition.value);
    if (observed == null || target == null) return false;
    switch (condition.op) {
      case "gt": return observed > target;
      case "gte": return observed >= target;
      case "eq": return observed === target;
      case "lte": return observed <= target;
      case "lt": return observed < target;
      default: return false;
    }
  });
  return mode === "any" ? results.some(Boolean) : results.every(Boolean);
}
