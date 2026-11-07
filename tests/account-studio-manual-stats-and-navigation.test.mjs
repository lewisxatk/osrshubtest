import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source=await readFile(new URL("../src/main.jsx",import.meta.url),"utf8");
const combat=await readFile(new URL("../src/CombatStudioPage.jsx",import.meta.url),"utf8");
const css=await readFile(new URL("../src/combat-studio.css",import.meta.url),"utf8");
const workbench=await readFile(new URL("../src/combat-studio/LoadoutWorkbench.jsx",import.meta.url),"utf8");
const v2=await readFile(new URL("../src/combat-studio-v2.css",import.meta.url),"utf8");
test("Account Studio exposes a local manual editor for every OSRS skill",()=>{
 assert.match(source,/function ManualAccountStats\(/);
 assert.match(source,/SKILL_NAMES\.map\(skill/);
 assert.match(source,/name:account\?\.name\|\|"Manual account"/);
 assert.match(source,/localStorage\.setItem\("osrshub-account"/);
});
test("manual account levels are validated before account-restricted live combat builds",()=>{
 assert.match(combat,/these live-engine skills are missing or invalid:/);
 assert.match(combat,/Account Studio → Account Tracker/);
});
test("More navigation groups tools beneath clear category headings on desktop and mobile",()=>{
 assert.match(source,/groupedToolsMenu/);assert.match(source,/groupedMobileMore/);
 assert.match(source,/TRADING/);assert.match(source,/ACCOUNT & PROGRESSION/);
 assert.match(source,/OSRS INTELLIGENCE/);assert.match(source,/TOOLS & UTILITIES/);
});
test("Combat Studio inherits active OSRS Hub theme tokens",()=>{
 assert.match(css,/--cs-accent:var\(--oh-accent/);assert.match(css,/--cs-bg:var\(--oh-surface/);
});

test("gear slot picker only offers canonical equipment when the engine catalogue is loaded",()=>{
 assert.match(workbench,/canonicalCataloguePresent = items\.some\(item => item\?\._engineCanonical === true\)/);
 assert.match(workbench,/item\._engineCanonical === true\) && equipmentSlotOf\(item\) === activeSlot/);
});

test("Combat Studio V2 overrides its old gold skin with live theme tokens",()=>{
 assert.match(v2,/--cs-accent:var\(--oh-accent/);
 assert.match(v2,/\.cs-primary,.combat-studio \.cs-command-build[\s\S]*background:var\(--cs-accent\)!important/);
 assert.match(v2,/\.cs-slot\{[\s\S]*background:var\(--oh-surface/);
});
