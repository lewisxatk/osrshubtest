const cleanBaseUrl = value => String(value ?? "").trim().replace(/\/+$/, "");

async function readCollection(baseUrl, resource, fetchImpl, pageSize, maxItems) {
  const readPage = async offset => {
    const response = await fetchImpl(`${baseUrl}/api/${resource}?offset=${offset}&limit=${pageSize}`, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.status !== "ok" || !Array.isArray(payload?.results)) {
      throw new Error(payload?.error || `The combat runtime did not return its canonical ${resource} catalogue (HTTP ${response.status}).`);
    }
    const total = Number(payload.total);
    if (!Number.isInteger(total) || total < 0 || total > maxItems) {
      throw new Error(`The canonical ${resource} catalogue returned an invalid or unsafe record count.`);
    }
    return { total, rows: payload.results };
  };

  const first = await readPage(0);
  if (first.total === 0) throw new Error(`The canonical ${resource} catalogue is empty.`);
  const rows = [...first.rows];
  for (let offset = pageSize; offset < first.total; offset += pageSize * 3) {
    const offsets = [offset, offset + pageSize, offset + pageSize * 2].filter(value => value < first.total);
    const pages = await Promise.all(offsets.map(readPage));
    for (const page of pages) {
      if (page.total !== first.total) throw new Error(`The canonical ${resource} catalogue changed while it was being loaded. Reload Combat Studio.`);
      rows.push(...page.rows);
    }
  }

  const unique = new Map();
  for (const row of rows) {
    const id = Number(row?.id);
    if (Number.isInteger(id) && id > 0 && typeof row?.name === "string" && row.name.trim()) {
      unique.set(id, { ...row, id, name: row.name.trim() });
    }
  }
  if (unique.size !== first.total) {
    throw new Error(`The canonical ${resource} catalogue returned ${unique.size} unique records; expected ${first.total}.`);
  }
  return [...unique.values()];
}

/**
 * Reads the versioned catalogue served by the separately deployed test combat
 * Worker. IDs and combat stats come from the same engine used for DPS.
 */
export async function loadRuntimeCombatCatalogue({
  baseUrl,
  fetchImpl = globalThis.fetch,
  pageSize = 1000,
  maxItems = 30000,
} = {}) {
  const base = cleanBaseUrl(baseUrl);
  if (!base) throw new Error("The test combat runtime URL is not configured.");
  if (typeof fetchImpl !== "function") throw new Error("A Fetch-compatible function is required.");
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000) throw new Error("Catalogue page size must be between 1 and 1000.");

  const [monsters, equipment] = await Promise.all([
    readCollection(base, "monsters", fetchImpl, pageSize, maxItems),
    readCollection(base, "equipment", fetchImpl, pageSize, maxItems),
  ]);
  return {
    status: "ready",
    source: "OSRS Hub canonical combat engine",
    monsters,
    equipment,
    counts: { monsters: monsters.length, equipment: equipment.length },
  };
}
