const positive = value => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

export function buildNormalizedComparisonSeries(records = []) {
  const dataByTimestamp = new Map();
  const lines = [];
  const seen = new Set();

  for (const record of Array.isArray(records) ? records.slice(0, 4) : []) {
    const id = Number(record?.id);
    if (!Number.isSafeInteger(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);

    const points = (Array.isArray(record?.points) ? record.points : [])
      .map(point => {
        const buy = positive(point?.buy);
        const sell = positive(point?.sell);
        const timestamp = Number(point?.timestamp);
        const midpoint = buy != null && sell != null ? (buy + sell) / 2 : null;
        return { timestamp, midpoint };
      })
      .filter(point => Number.isFinite(point.timestamp) && point.midpoint != null)
      .sort((a, b) => a.timestamp - b.timestamp);

    const baseline = points[0];
    if (!baseline || baseline.midpoint <= 0) continue;
    const dataKey = `item_${id}`;
    const uniquePoints = new Map();
    for (const point of points) {
      const index = (point.midpoint / baseline.midpoint) * 100;
      if (!Number.isFinite(index)) continue;
      uniquePoints.set(point.timestamp, index);
    }
    if (!uniquePoints.size) continue;

    lines.push({
      id,
      dataKey,
      name: String(record?.name || `Item ${id}`),
      baselineTimestamp: baseline.timestamp,
      baselineMidpoint: baseline.midpoint,
      pointCount: uniquePoints.size
    });

    for (const [timestamp, index] of uniquePoints) {
      const row = dataByTimestamp.get(timestamp) || { timestamp };
      row[dataKey] = index;
      dataByTimestamp.set(timestamp, row);
    }
  }

  const data = [...dataByTimestamp.values()].sort((a, b) => a.timestamp - b.timestamp);
  return {
    lines,
    data,
    hasComparableSeries: lines.length >= 2,
    message: lines.length < 2 ? "At least two items need valid overlapping history for a comparison." : null
  };
}
