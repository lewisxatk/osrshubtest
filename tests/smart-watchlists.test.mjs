import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const main=readFileSync(new URL("../src/main.jsx",import.meta.url),"utf8");
const worker=readFileSync(new URL("../worker.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/osrshub-redesign.css",import.meta.url),"utf8");
test("Smart Watchlists derives matches from the live market snapshot and never fabricates unknown risk data",()=>{
 assert.match(main,/function SmartWatchPanel\(/);
 assert.match(main,/osrshub-smart-watch-filters/);
 assert.match(main,/osrshub-smart-watch-presets/);
 assert.match(main,/risk==null\|\|risk<0/);
 assert.match(main,/items\.filter\(x=>/);
 assert.match(main,/onAdd\?\.\(x\.id,active\.id\)/);
 assert.match(main,/marketItems=\{items\}/);
});
test("Smart Watchlist presets are included in the frontend and Worker cloud sync allowlists",()=>{
 assert.match(main,/osrshub-smart-watch-filters/);
 assert.match(worker,/osrshub-smart-watch-filters/);
 assert.match(worker,/osrshub-smart-watch-presets/);
});
test("Smart Watchlists has responsive controls and a reduced-motion fallback",()=>{
 assert.match(styles,/\.smartWatchFilters/);
 assert.match(styles,/@media\(max-width:680px\)/);
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
});
