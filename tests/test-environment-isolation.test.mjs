import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const config=readFileSync(new URL("../wrangler.jsonc",import.meta.url),"utf8");
const worker=readFileSync(new URL("../worker.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("test Worker is isolated from production services and binds only its dedicated D1 database",()=>{
 assert.match(config,/"name":\s*"osrshubtest"/);
 assert.match(config,/"database_name":\s*"osrshubtest-db"/);
 assert.match(config,/"database_id":\s*"d66af6c1-3ddb-4c43-91bb-78385629b357"/);
 assert.match(config,/"binding":\s*"DB"/);
 assert.match(config,/"crons":\s*\["0 \*\/2 \* \* \*"/);
 assert.doesNotMatch(config,/osrsflipit|production_database/i);
 assert.match(config,/"OSRSHUB_ENVIRONMENT":\s*"test"/);
 assert.match(config,/osrshubtest\.prices-app\.workers\.dev/);
});
test("database-backed Worker routes remain guarded if the isolated D1 binding is absent",()=>{
 assert.match(worker,/\/api\/test\/status/);
 assert.match(worker,/databaseConfigured:!!env\.DB/);
 assert.match(worker,/if\(!env\.DB&&d1Required\)/);
 assert.match(worker,/isolated test build has no test D1 database/);
});
test("test build is not indexed",()=>{
 assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
});
