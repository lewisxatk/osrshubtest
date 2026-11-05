import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const config=readFileSync(new URL("../wrangler.jsonc",import.meta.url),"utf8");
const worker=readFileSync(new URL("../worker.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
test("test Worker is isolated from production services",()=>{
 assert.match(config,/"name":\s*"osrshubtest"/);
 assert.doesNotMatch(config,/database_id|database_name|triggers/);
 assert.match(config,/"OSRSHUB_ENVIRONMENT":\s*"test"/);
 assert.match(config,/osrshubtest\.prices-app\.workers\.dev/);
});
test("database-backed Worker routes fail closed until a test database is connected",()=>{
 assert.match(worker,/\/api\/test\/status/);
 assert.match(worker,/databaseConfigured:!!env\.DB/);
 assert.match(worker,/if\(!env\.DB&&d1Required\)/);
 assert.match(worker,/isolated test build has no test D1 database/);
});
test("test build is not indexed",()=>{
 assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
});
