import test from"node:test";import assert from"node:assert/strict";import{xpForLevel,xpRangeToTarget,estimateXpHours}from"../src/xp-planning.js";
test("standard OSRS XP thresholds match level milestones",()=>{assert.equal(xpForLevel(1),0);assert.equal(xpForLevel(2),83);assert.equal(xpForLevel(99),13034431)});
test("valid account XP produces an exact balance to target",()=>{const r=xpRangeToTarget(50,101333,99);assert.equal(r.exact,true);assert.equal(r.min,13034431-101333);assert.equal(r.max,r.min)});
test("level-only data produces a conservative XP interval",()=>{const r=xpRangeToTarget(50,null,99);assert.equal(r.exact,false);assert.equal(r.min,13034431-(xpForLevel(51)-1));assert.equal(r.max,13034431-xpForLevel(50));assert.ok(r.min<=r.max)});
test("target at or below current level requires no additional XP",()=>{assert.deepEqual(xpRangeToTarget(75,null,70),{min:0,max:0,exact:true})});
test("time estimates require a positive user-supplied rate",()=>{const range={min:100000,max:200000,exact:false};assert.equal(estimateXpHours(range,""),null);assert.equal(estimateXpHours(range,"0"),null);assert.deepEqual(estimateXpHours(range,"50000"),{minHours:2,maxHours:4,exact:false})});
test("invalid XP does not become an exact account balance",()=>{assert.equal(xpRangeToTarget(80,10,99).exact,false)});
