
import test from "node:test";
import assert from "node:assert/strict";
import { buildMonsterIntelligence, getTargetSpecificEquipmentNames } from "../src/combat-studio/monster-intelligence.js";
import { targetProfile } from "../src/combat-studio/optimizer.js";
import { targetSpecificCandidates } from "../src/combat-studio/engine-loadout-optimizer.js";

const vorkath = {
  id:8059,name:"Vorkath",version:"",recordIndex:12,style:"ranged",
  attributes:["dragon","undead","fiery"],
  weakness:{element:"fire",severity:40},
  defensive:{flat_armour:0,stab:80,slash:80,crush:80,magic:80,light:70,standard:70,heavy:70},
  skills:{atk:200,def:214,hp:750,magic:150,ranged:150,str:200},
  immunities:{burn:"Normal"},is_slayer_monster:false,
};

test("canonical monster intelligence reads elemental weakness objects and exact attributes",()=>{
  const intel=buildMonsterIntelligence(vorkath,{style:"Ranged"});
  assert.equal(intel.source,"Canonical Combat Engine monster record");
  assert.deepEqual(intel.attributes,["dragon","undead","fiery"]);
  assert.deepEqual(intel.weakness,{element:"fire",severity:40});
  assert.match(intel.elementalAdvice,/matching fire elemental spell/i);
  assert.deepEqual(intel.rangedDefences.map(x=>x.field),["light","standard","heavy"]);
  assert.equal(intel.immunities.burn,"Normal");
  assert.ok(intel.counters.some(x=>x.attribute==="dragon"));
  assert.ok(intel.counters.some(x=>x.attribute==="undead"));
  assert.ok(intel.counters.some(x=>x.attribute==="fiery"));
});

test("canonical target summary reports structured elemental weakness instead of dropping it",()=>{
  const info=targetProfile("Vorkath",[vorkath]);
  assert.equal(info.confidence,"Canonical engine record");
  assert.match(info.weakness,/fire elemental weakness \(40%\)/i);
  assert.match(info.summary,/Vorkath/);
});

test("a name alone never fabricates an attribute or elemental weakness",()=>{
  const unknown={id:999,name:"Dragon-like test target",attributes:[],weakness:null,defensive:{stab:10,slash:20,crush:30,magic:40,light:5,standard:6,heavy:7},immunities:{burn:null}};
  const intel=buildMonsterIntelligence(unknown);
  assert.deepEqual(intel.attributes,[]);
  assert.equal(intel.weakness,null);
  assert.deepEqual(intel.counters,[]);
});

test("dragon, undead and fiery target attributes inject their matching Vorkath counters",()=>{
  const names=getTargetSpecificEquipmentNames(vorkath,"Ranged").map(x=>x.toLowerCase());
  assert.ok(names.includes("dragon hunter crossbow"));
  assert.ok(names.includes("pearl bolts (e)"));
  assert.ok(names.includes("pearl dragon bolts (e)"));
  assert.ok(names.includes("salve amulet (e)"));
  const weaponPool=[{_engineId:21012,_name:"Dragon hunter crossbow",slot:"weapon"}];
  const ammoPool=[
    {_engineId:21944,_name:"Ruby dragon bolts (e)",slot:"ammo"},
    {_engineId:21946,_name:"Diamond dragon bolts (e)",slot:"ammo"},
    {_engineId:9238,_name:"Pearl bolts (e)",slot:"ammo"},
    {_engineId:21936,_name:"Pearl dragon bolts (e)",slot:"ammo"},
  ];
  const neckPool=[{_engineId:10588,_name:"Salve amulet (e)",slot:"neck"}];
  const weapons=targetSpecificCandidates("Weapon",weaponPool,"Ranged",vorkath);
  const ammo=targetSpecificCandidates("Ammo",ammoPool,"Ranged",vorkath);
  const neck=targetSpecificCandidates("Neck",neckPool,"Ranged",vorkath);
  assert.deepEqual(weapons.map(x=>x._name),["Dragon hunter crossbow"]);
  assert.deepEqual(new Set(ammo.map(x=>x._name)),new Set(["Ruby dragon bolts (e)","Diamond dragon bolts (e)","Pearl bolts (e)","Pearl dragon bolts (e)"]));
  assert.deepEqual(neck.map(x=>x._name),["Salve amulet (e)"]);
});

test("demon, kalphite, golem, leafy, rat, shade and xerician attributes supply only matching counter candidates",()=>{
  const items=[
    "Arclight","Emberlight","Scorching bow","Keris partisan of breaching",
    "Granite hammer","Barronite mace","Leaf-bladed battleaxe","Bone mace",
    "Bone shortbow","Gadderhammer","Twisted bow",
  ].map((name,index)=>({_engineId:index+1,_name:name}));
  const target=attributes=>({id:1,name:"Neutral label",attributes,weakness:null});
  const checks=[
    ["demon","Melee",["Arclight","Emberlight"]],
    ["demon","Ranged",["Scorching bow"]],
    ["kalphite","Melee",["Keris partisan of breaching"]],
    ["golem","Melee",["Granite hammer","Barronite mace"]],
    ["leafy","Melee",["Leaf-bladed battleaxe"]],
    ["rat","Melee",["Bone mace"]],
    ["rat","Ranged",["Bone shortbow"]],
    ["shade","Melee",["Gadderhammer"]],
    ["xerician","Ranged",["Twisted bow"]],
  ];
  for(const [attribute,style,expected] of checks){
    const result=targetSpecificCandidates("Weapon",items,style,target([attribute]));
    for(const name of expected) assert.ok(result.some(item=>item._name===name),`${attribute} should include ${name}`);
  }
});

test("vampyre tier metadata shows tier-aware restrictions and supported counters",()=>{
  const tier2={id:2,name:"A vampyre",attributes:["vampyre2"],weakness:null};
  const info=buildMonsterIntelligence(tier2,{style:"Melee"});
  assert.match(info.counters[0].summary,/silver-weapon restrictions/i);
  const names=getTargetSpecificEquipmentNames(tier2,"Melee");
  assert.ok(names.includes("Ivandis flail"));
  assert.ok(names.includes("Efaritay's aid"));
});

test("elemental weakness adds its matching elemental amulets to Magic candidates",()=>{
  const names=getTargetSpecificEquipmentNames(vorkath,"Magic");
  assert.ok(names.includes("Elemental amulet"));
  assert.ok(names.includes("Amulet of fire"));
  const neckPool=[
    {_engineId:1,_name:"Elemental amulet",slot:"neck"},
    {_engineId:2,_name:"Amulet of fire",slot:"neck"},
    {_engineId:3,_name:"Amulet of water",slot:"neck"},
    {_engineId:4,_name:"Salve amulet(ei)",slot:"neck"},
  ];
  const candidates=targetSpecificCandidates("Neck",neckPool,"Magic",vorkath);
  assert.deepEqual(candidates.map(x=>x._name),["Elemental amulet","Amulet of fire","Salve amulet(ei)"]);
});
