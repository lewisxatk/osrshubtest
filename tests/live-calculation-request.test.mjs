import test from "node:test";
import assert from "node:assert/strict";
import { buildLiveCalculationRequest, getMissingEngineSkills } from "../src/combat-studio/live-calculation-request.js";

const stats = {
  Attack: { level: 80 }, Defence: { level: 80 }, Hitpoints: { level: 90 },
  Magic: { level: 84 }, Prayer: { level: 70 }, Ranged: { level: 93 },
  Strength: { level: 86 }, Mining: { level: 60 }, Herblore: { level: 70 },
  Farming: { level: 50 },
};
const items = [
  { id: 21902, name: "Dragon hunter lance" },
  { id: 11840, name: "Dragon boots" },
];
const style = { name: "Lance stab", type: "stab", stance: "Aggressive" };
const base = {
  playerName: "Example",
  stats,
  slots: [["Weapon", "Dragon hunter lance"], ["Feet", "Dragon boots"], ["Head", "—"]],
  items,
  target: { id: 8059, name: "Vorkath" },
  style,
  boosts: { atk: 0, def: 0, hp: 0, magic: 0, prayer: 0, ranged: 0, str: 0, mining: 0, herblore: 0, farming: 0 },
};

test("builds engine request with canonical IDs and explicit combat style", () => {
  const result = buildLiveCalculationRequest(base);
  assert.equal(result.status, "ready");
  assert.equal(result.request.monsterId, 8059);
  assert.deepEqual(result.request.player.equipment.weapon, { id: 21902 });
  assert.deepEqual(result.request.player.equipment.feet, { id: 11840 });
  assert.equal(result.request.player.equipment.head, null);
  assert.equal(result.request.player.style.type, "stab");
  assert.equal(result.request.player.skills.atk, 80);
  assert.equal(result.request.player.skills.str, 86);
});

test("refuses to guess a combat stance from the broad combat category", () => {
  const result = buildLiveCalculationRequest({ ...base, style: null });
  assert.equal(result.status, "review-required");
  assert.equal(result.request, null);
  assert.ok(result.issues.some(issue => issue.includes("combat style")));
});

test("refuses missing skills and unknown equipment IDs", () => {
  const result = buildLiveCalculationRequest({
    ...base,
    stats: { ...stats, Mining: undefined },
    slots: [["Weapon", "Unknown weapon"]],
  });
  assert.equal(result.status, "review-required");
  assert.ok(result.issues.some(issue => issue.includes("mining level")));
  assert.ok(result.issues.some(issue => issue.includes("no resolved canonical item ID")));
});

test("refuses a target without a positive canonical engine ID", () => {
  const result = buildLiveCalculationRequest({ ...base, target: { name: "Vorkath" } });
  assert.equal(result.status, "review-required");
  assert.ok(result.issues.some(issue => issue.includes("canonical engine monster ID")));
});

test("passes the exact canonical monster variant identity through to the runtime", () => {
  const result = buildLiveCalculationRequest({
    ...base,
    target: { id: 265, name: "Blue dragon", version: "Task only, 1", recordIndex: 876 },
  });
  assert.equal(result.status, "ready");
  assert.equal(result.request.monsterId, 265);
  assert.equal(result.request.monsterIndex, 876);
  assert.equal(result.request.monsterName, "Blue dragon");
  assert.equal(result.request.monsterVersion, "Task only, 1");
});

test("rejects an invalid monster record index", () => {
  const result = buildLiveCalculationRequest({
    ...base,
    target: { id: 8059, name: "Vorkath", recordIndex: -1 },
  });
  assert.equal(result.status, "review-required");
  assert.ok(result.issues.some(issue => issue.includes("recordIndex")));
});

test("keeps explicit monster inputs and does not mutate caller state", () => {
  const monsterInputs = { partySize: 1, monsterCurrentHp: 750 };
  const result = buildLiveCalculationRequest({ ...base, monsterInputs });
  assert.equal(result.status, "ready");
  assert.deepEqual(result.request.monsterInputs, monsterInputs);
  assert.deepEqual(monsterInputs, { partySize: 1, monsterCurrentHp: 750 });
});

test("accepts account skills in nested and alternate-key formats",()=>{
 const alternate={skills:{attack:{level:80},strength:86,defence:80,hp_level:90,ranged:93,magic:84,prayer:70},levels:{mining:60,herblore:70,farming:50}};
 const result=buildLiveCalculationRequest({...base,stats:alternate});
 assert.equal(result.status,"ready",JSON.stringify(result.issues));
 assert.equal(result.request.player.skills.hp,90);
 assert.equal(result.request.player.skills.mining,60);
 assert.equal(result.request.player.skills.herblore,70);
 assert.equal(result.request.player.skills.farming,50);
});
test("reports the missing engine skills once using readable OSRS names",()=>{
 assert.deepEqual(getMissingEngineSkills({...stats,Hitpoints:undefined,Mining:undefined,Herblore:undefined,Farming:undefined}),["Hitpoints","Mining","Herblore","Farming"]);
});
