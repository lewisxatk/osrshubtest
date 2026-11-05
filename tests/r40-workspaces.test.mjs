import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const main=readFileSync(new URL("../src/main.jsx",import.meta.url),"utf8");
const command=readFileSync(new URL("../src/HubCommandCentre.jsx",import.meta.url),"utf8");
const experience=readFileSync(new URL("../src/hub-experience.css",import.meta.url),"utf8");
const redesign=readFileSync(new URL("../src/osrshub-redesign.css",import.meta.url),"utf8");
test("test build keeps the Command Centre integrated as the root workspace",()=>{
 assert.match(main,/import HubCommandCentre, \{ HubBreadcrumbs \}/);
 assert.match(main,/<HubCommandCentre items=\{items\}/);
 assert.match(main,/PATH_TABS\["\/"\]="command"/);
 assert.match(main,/HubBreadcrumbs activeTab=\{tab\}/);
 assert.match(main,/TEST BUILD/);
});
test("Command Centre derives its briefing from the current item snapshot and persists planning inputs",()=>{
 assert.match(command,/NEXT MOVE ENGINE/);
 assert.match(command,/osrshub-command-bankroll/);
 assert.match(command,/osrshub-command-goal-target/);
 assert.match(command,/screeningRank/);
});
test("theme layer includes Gilded and Graphite with reduced-motion support",()=>{
 assert.match(experience,/data-theme="gilded"/);
 assert.match(experience,/data-theme="graphite"/);
 assert.match(experience,/prefers-reduced-motion/);
 assert.match(redesign,/data-theme="gilded"/);
});
