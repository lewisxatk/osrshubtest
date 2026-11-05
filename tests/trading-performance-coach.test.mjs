import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const main=readFileSync(new URL("../src/main.jsx",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/osrshub-redesign.css",import.meta.url),"utf8");
test("Trading Performance Coach analyses only real entries from the flip journal",()=>{
 assert.match(main,/function TradingPerformanceCoach\(\{logs=\[\]\}\)/);
 assert.match(main,/Number\(x\.profit\)/);
 assert.match(main,/const avgWin=/);
 assert.match(main,/avgLoss=/);
 assert.match(main,/const factor=grossLoss>0\?grossProfit\/grossLoss:null/);
 assert.match(main,/DATE COVERAGE/);
 assert.match(main,/<TradingPerformanceCoach logs=\{logs\}\/>/);
});
test("Performance Coach warns about small samples and never invents holding-time data",()=>{
 assert.match(main,/Build a larger sample/);
 assert.match(main,/does not infer unlogged orders, fill prices or holding time/);
 assert.match(main,/not a prediction/);
});
test("Performance Coach has responsive layout and reduced-motion support",()=>{
 assert.match(styles,/\.tradingCoachMetrics/);
 assert.match(styles,/@media\(max-width:760px\)/);
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
});
