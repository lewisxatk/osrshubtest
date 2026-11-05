import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const main=readFileSync(new URL("../src/main.jsx",import.meta.url),"utf8");
const visual=readFileSync(new URL("../src/osrshub-redesign.css",import.meta.url),"utf8");
const companion=readFileSync(new URL("../src/hub-companion.css",import.meta.url),"utf8");
test("test build exposes a Gilded theme and the OSRS Hub companion",()=>{
 assert.match(main,/gilded:"Gilded"/);
 assert.match(main,/<HubCompanion items=\{items\}/);
 assert.match(main,/TEST BUILD/);
 assert.match(visual,/data-theme="gilded"/);
 assert.match(companion,/hubCompanionPanel/);
});
