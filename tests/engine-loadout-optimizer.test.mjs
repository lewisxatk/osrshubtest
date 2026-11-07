import test from "node:test";
import assert from "node:assert/strict";
import { optimizeLoadoutWithEngine } from "../src/combat-studio/engine-loadout-optimizer.js";

const stats = {
  Attack:{level:80}, Defence:{level:80}, Hitpoints:{level:90},
  Magic:{level:84}, Prayer:{level:70}, Ranged:{level:93},
  Strength:{level:86}, Mining:{level:60}, Herblore:{level:70},
  Farming:{level:50},
};

const items = [
  {id:1,name:"Bronze crossbow",slot:"weapon",_price:100,offensive:{stab:0,slash:0,crush:0,magic:0,ranged:10},bonuses:{str:0,ranged_str:1,magic_str:0,prayer:0},isTwoHanded:false},
  {id:2,name:"Rune crossbow",slot:"weapon",_price:500,offensive:{stab:0,slash:0,crush:0,magic:0,ranged:60},bonuses:{str:0,ranged_str:6,magic_str:0,prayer:0},isTwoHanded:false},
  {id:3,name:"Bronze bolts",slot:"ammo",_price:1,offensive:{stab:0,slash:0,crush:0,magic:0,ranged:0},bonuses:{str:0,ranged_str:0,magic_str:0,prayer:0}},
  {id:4,name:"Coif",slot:"head",_price:25,offensive:{stab:0,slash:0,crush:0,magic:0,ranged:2},bonuses:{str:0,ranged_str:0,magic_str:0,prayer:0}},
];

function mockEngine(fetchCalls = []) {
  return async (url, options = {}) => {
    fetchCalls.push({url,options});
    if (url.endsWith("/health")) {
      return new Response(JSON.stringify({status:"ok",service:"osrshub-combat-runtime"}),{status:200});
    }
    if (url.endsWith("/api/calculate")) {
      const request = JSON.parse(options.body);
      const weaponId = request.player.equipment.weapon?.id;
      return new Response(JSON.stringify({
        status:"calculated",issues:[],
        result:{
          monster:{id:8059,name:"Vorkath",version:"",recordIndex:12},
          dps:weaponId===2?4.25:1.1,maxHit:48,accuracy:0.63,
          attackRoll:100,npcDefenceRoll:200,attackSpeed:4,issues:[],
        },
      }),{status:200});
    }
    throw new Error("Unexpected runtime URL: "+url);
  };
}

const base = {
  items,stats,quests:[],questOverrides:{},accountAware:true,
  target:{id:8059,name:"Vorkath",version:"",recordIndex:12},
  style:"Ranged",attackType:"ranged",stance:"Rapid",
  budget:1000,runtimeUrl:"https://test-combat.example.workers.dev",
};

test("engine-backed Auto Build returns a verified, in-budget loadout and ranks DPS upgrades", async () => {
  const calls=[];
  const outcome=await optimizeLoadoutWithEngine({
    ...base,playerName:"Example",fetchImpl:mockEngine(calls),
  });
  assert.equal(outcome.status,"calculated",JSON.stringify(outcome.issues));
  assert.ok(outcome.totalCost<=base.budget);
  assert.ok(outcome.calculations>=2);
  assert.ok(outcome.selectedItemIds.includes(2),"higher-DPS canonical weapon should be selected");
  assert.equal(outcome.engineResult.dps,4.25);
  assert.ok(calls.some(call=>call.url.endsWith("/api/calculate")));
});

test("guest Auto Build works only with account restrictions disabled and labels its assumed stats", async () => {
  let checkedGuestProfile=false;
  const fetchImpl=async (url,options={})=>{
    if(url.endsWith("/health")) return new Response(JSON.stringify({status:"ok",service:"osrshub-combat-runtime"}),{status:200});
    if(url.endsWith("/api/calculate")){
      const request=JSON.parse(options.body);
      checkedGuestProfile=Object.values(request.player.skills).every(level=>level===99)
        && request.player.name==="OSRS Hub guest demo profile";
      return new Response(JSON.stringify({
        status:"calculated",issues:[],
        result:{monster:{id:8059,name:"Vorkath",version:"",recordIndex:12},dps:2,maxHit:20,accuracy:0.5,attackRoll:100,npcDefenceRoll:200,attackSpeed:4,issues:[]},
      }),{status:200});
    }
    throw new Error("Unexpected runtime URL: "+url);
  };
  const outcome=await optimizeLoadoutWithEngine({
    ...base,playerName:"",stats:{},accountAware:false,fetchImpl,
  });
  assert.equal(outcome.status,"calculated",JSON.stringify(outcome.issues));
  assert.equal(checkedGuestProfile,true);
  assert.ok(outcome.warnings.some(w=>w.includes("Guest demo profile")&&w.includes("assumed to be 99")));
});

test("guest Auto Build refuses account-aware mode rather than inventing account levels", async () => {
  let calls=0;
  const outcome=await optimizeLoadoutWithEngine({
    ...base,playerName:"",stats:{},accountAware:true,
    fetchImpl:async()=>{calls++;throw new Error("runtime should not be called");},
  });
  assert.equal(outcome.status,"review-required");
  assert.ok(outcome.issues.some(issue=>issue.includes("Ignore account restrictions")));
  assert.equal(calls,0);
});
