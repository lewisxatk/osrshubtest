import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../src/main.jsx',import.meta.url),'utf8');
const styles=await readFile(new URL('../src/osrshub2.css',import.meta.url),'utf8');
test('High Alcher handles both supported latest-price response shapes and shows a recoverable empty state',()=>{
 assert.match(source,/const data=latest\?\.data\?\.data\|\|latest\?\.data\|\|\{\}/);
 assert.match(source,/const buy=Number\(x\.buy\|\|x\.avgLowPrice\|\|0\)/);
 assert.match(source,/No market items are loaded yet/);
 assert.match(source,/marketLoading=\{loading\}/);
});
test('High Alcher is named consistently and secondary tools are grouped by workspace',()=>{
 assert.match(source,/"highalch","High Alcher"/);
 assert.match(source,/Open High Alcher/);
 const start=source.indexOf('className="extrasMenu toolsMenu"');
 const end=source.indexOf('</div>}</div></div>',start);
 const menu=source.slice(start,end);
 for(const label of ['TRADING TOOLS','ACCOUNT & PROGRESSION','OSRS BRAIN & EXTRAS','Analysis & Radar','High Alcher','Combat Studio','Quest Pathway'])assert.ok(menu.includes(label),label+' should be available in the grouped More menu');
 assert.match(source,/mobileMoreGroup/);
});
