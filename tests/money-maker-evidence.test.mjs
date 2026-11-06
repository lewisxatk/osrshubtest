import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const main=fs.readFileSync(new URL("../src/main.jsx",import.meta.url),"utf8");

test("money-maker fallback seeds do not invent a GP/hour value",()=>{
  assert.match(main,/sourceType:"fallback",sourceLabel:"No verified Wiki row"/);
  assert.match(main,/gph:null,sourceType:"fallback"/);
});

test("money-maker rows only show GP/hour when a parsed OSRS Wiki row provides it",()=>{
  assert.match(main,/sourceType:"wiki",sourceLabel:"OSRS Wiki · Money making guide"/);
  assert.match(main,/r\.sourceType==="wiki"&&r\.gph!=null&&Number\.isFinite\(Number\(r\.gph\)\)\?money\(r\.gph\):"—"/);
  assert.match(main,/Unavailable/);
});

test("money-maker ranking puts sourced Wiki rows above fallback records",()=>{
  assert.match(main,/\(b\.sourceType==="wiki"\)-\(a\.sourceType==="wiki"\)/);
  assert.match(main,/excluded from numeric ranking until the Wiki guide returns a matching record/);
});
