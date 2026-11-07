import { loadRuntimeCombatCatalogue } from "../src/combat-studio/runtime-catalogue.js";
import { optimizeLoadoutWithEngine } from "../src/combat-studio/engine-loadout-optimizer.js";

const siteUrl = (process.env.OSRSHUB_TEST_SITE_URL || "https://osrshubtest.prices-app.workers.dev").replace(/\/+$/, "");
const runtimeUrl = (process.env.OSRSHUB_TEST_COMBAT_RUNTIME_URL || "https://osrshubtest-combat-runtime.prices-app.workers.dev").replace(/\/+$/, "");
const budget = 150_000_000;

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`GET ${url} failed (HTTP ${response.status}): ${payload?.error || "invalid response"}`);
  return payload;
}

function readPriceRows(payload) {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Live GE latest endpoint did not return an item-price map.");
  return data;
}

function readMappingRows(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return Object.entries(data).map(([id, row]) => ({ id: Number(id), ...row }));
  throw new Error("Live GE mapping endpoint did not return an item mapping.");
}

async function main() {
  const [catalogue, latestPayload, mappingPayload] = await Promise.all([
    loadRuntimeCombatCatalogue({ baseUrl: runtimeUrl }),
    getJson(`${siteUrl}/api/prices/latest`),
    getJson(`${siteUrl}/api/prices/mapping`),
  ]);
  const latest = readPriceRows(latestPayload);
  const mappingById = new Map(readMappingRows(mappingPayload).map(row => [Number(row.id), row]));
  const items = catalogue.equipment.map(row => {
    const id = Number(row.id);
    const quote = latest[String(id)] ?? {};
    const mapping = mappingById.get(id) ?? {};
    const price = Number(quote.high) > 0 ? Number(quote.high)
      : Number(quote.low) > 0 ? Number(quote.low) : 0;
    return {
      ...row, ...mapping,
      id, name: row.name, _name: row.name, slot: row.slot,
      equipment_slot: row.slot, equipable: true, equippable: true,
      offensive: row.offensive, defensive: row.defensive, bonuses: row.bonuses,
      speed: row.speed, twoHanded: Boolean(row.isTwoHanded),
      _price: price,
    };
  }).filter(row => row._price > 0);

  const target = catalogue.monsters.find(row =>
    String(row.name).trim().toLowerCase() === "vorkath" && Number(row.skills?.hp) > 0
  ) ?? catalogue.monsters.find(row =>
    /vorkath/i.test(String(row.name)) && Number(row.skills?.hp) > 0
  );
  if (!target) throw new Error("The canonical combat runtime catalogue did not contain a Vorkath record.");
  const rangedWeapons = items.filter(row =>
    row.slot === "weapon" && Number(row.offensive?.ranged) > 0
    && /(bow|crossbow|blowpipe|ballista)/i.test(row.name)
  );
  if (!rangedWeapons.length) throw new Error("No priced canonical ranged weapons were available from live GE prices.");

  const stats = {
    Attack:{level:90}, Strength:{level:99}, Defence:{level:85},
    Hitpoints:{level:99}, Ranged:{level:93}, Prayer:{level:77},
    Magic:{level:87}, Mining:{level:60}, Herblore:{level:70}, Farming:{level:50},
  };
  const shared = {
    items, stats, quests: [], questOverrides: {}, excluded: [], allowedItems: [],
    target: { id:Number(target.id), name:target.name, version:target.version ?? "", recordIndex:Number(target.recordIndex) },
    style:"Ranged", attackType:"ranged", stance:"Rapid", spell:null,
    budget, runtimeUrl,
    onProgress: progress => console.log(`Auto Build ${progress.slot}: ${progress.checked} engine calculations, ${Number(progress.dps || 0).toFixed(3)} DPS`),
  };

  for (const scenario of [
    { label:"imported-profile", playerName:"OSRS Hub CI Imported Profile", accountAware:true, stats },
    { label:"guest-demo", playerName:"", accountAware:false, stats:{} },
  ]) {
    const outcome = await optimizeLoadoutWithEngine({ ...shared, ...scenario });
    const weapon = outcome.slots?.find(([slot]) => slot === "Weapon")?.[1] ?? "none";
    if (outcome.status !== "calculated") {
      throw new Error(`${scenario.label} Auto Build failed: ${(outcome.issues || []).join("; ")}`);
    }
    if (!(Number(outcome.engineResult?.dps) > 0) || !weapon || weapon === "—") {
      throw new Error(`${scenario.label} Auto Build returned no useful weapon/DPS (weapon=${weapon}, DPS=${outcome.engineResult?.dps}).`);
    }
    if (/deadman/i.test(weapon)) {
      throw new Error(`${scenario.label} Auto Build incorrectly selected Deadman Mode-only gear: ${weapon}.`);
    }
    if (!(Number(outcome.totalCost) > 0) || Number(outcome.totalCost) > budget) {
      throw new Error(`${scenario.label} Auto Build returned an invalid cost ${outcome.totalCost} for budget ${budget}.`);
    }
    if (!Array.isArray(outcome.selectedItemIds) || !outcome.selectedItemIds.length) {
      throw new Error(`${scenario.label} Auto Build did not return selected canonical item IDs.`);
    }
    console.log(`REAL AUTO BUILD VERIFIED [${scenario.label}]: ${weapon} vs ${target.name} · DPS ${outcome.engineResult.dps} · ${outcome.totalCost} GP · ${outcome.selectedItemIds.length} items`);
  }
}

main().catch(error => {
  console.error("Combat Studio real Auto Build smoke test failed:", error);
  process.exitCode = 1;
});
