const finitePositive = value => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const percentChange = (start, end) => {
  const a = finitePositive(start);
  const b = finitePositive(end);
  return a && b ? ((b - a) / a) * 100 : null;
};

export function buildItemMovementEvidence(history = [], item = {}) {
  const points = (Array.isArray(history) ? history : [])
    .map(point => ({
      timestamp: Number(point?.timestamp),
      buy: finitePositive(point?.buy),
      sell: finitePositive(point?.sell)
    }))
    .filter(point => Number.isFinite(point.timestamp) && (point.buy != null || point.sell != null))
    .sort((a, b) => a.timestamp - b.timestamp);

  const first = points[0] || null;
  const last = points[points.length - 1] || null;
  const midpoint = point => point?.buy && point?.sell ? (point.buy + point.sell) / 2 : null;
  const comparable = points.length >= 2;
  const midStart = midpoint(first);
  const midEnd = midpoint(last);
  const midChangePct = comparable ? percentChange(midStart, midEnd) : null;
  const volume = Number(item?.volume);

  return {
    sampleCount: points.length,
    windowStart: comparable ? first.timestamp : null,
    windowEnd: comparable ? last.timestamp : null,
    buyChangePct: comparable ? percentChange(first?.buy, last?.buy) : null,
    sellChangePct: comparable ? percentChange(first?.sell, last?.sell) : null,
    midChangePct,
    direction: midChangePct == null ? "unknown" : midChangePct > 0 ? "rising" : midChangePct < 0 ? "falling" : "flat",
    currentVolume: Number.isFinite(volume) && volume >= 0 ? volume : null,
    hasComparableHistory: comparable
  };
}
