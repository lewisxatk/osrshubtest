import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const config=readFileSync(new URL("../wrangler.jsonc",import.meta.url),"utf8");
const worker=readFileSync(new URL("../worker.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const main=readFileSync(new URL("../src/main.jsx",import.meta.url),"utf8");
const themeCss=readFileSync(new URL("../src/osrshub-redesign.css",import.meta.url),"utf8");
test("test Worker is isolated from production services",()=>{
 assert.match(config,/"name":\s*"osrshubtest"/);
 assert.match(config,/"binding":\s*"DB"/);
 assert.match(config,/"database_name":\s*"osrshubtest-db"/);
 assert.match(config,/"database_id":\s*"d66af6c1-3ddb-4c43-91bb-78385629b357"/);
 assert.doesNotMatch(config,/production-db|osrshub-production/);
 assert.match(config,/"OSRSHUB_ENVIRONMENT":\s*"test"/);
 assert.match(config,/osrshubtest\.prices-app\.workers\.dev/);
});
test("database-backed Worker routes use the isolated test D1 and fail closed if its binding is missing",()=>{
 assert.match(worker,/\/api\/test\/status/);
 assert.match(worker,/databaseConfigured:!!env\.DB/);
 assert.match(worker,/if\(!env\.DB&&d1Required\)/);
 assert.match(worker,/isolated test build has no test D1 database/);
});
test("test build is not indexed",()=>{
 assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
});


test("test-site CSP permits the isolated combat catalogue and its equipment images",()=>{
 const csp=html.match(/<meta http-equiv="Content-Security-Policy"[^>]+>/)?.[0]||"";
 assert.match(csp,/connect-src[^;]*https:\/\/osrshubtest-combat-runtime\.prices-app\.workers\.dev/);
 assert.match(csp,/img-src[^;]*https:\/\/raw\.githubusercontent\.com/);
});

test("market mobile cards and filters use active theme palette tokens",()=>{
 assert.match(main,/function Market\(p\)\{return <section className="marketWorkspace">/);
 assert.match(themeCss,/html\[data-theme\] \.marketWorkspace \.mobileFlipCard/);
 assert.match(themeCss,/--market-surface:var\(--oh-surface,var\(--hub-panel-strong/);
 assert.match(themeCss,/--market-text:var\(--oh-text,var\(--hub-text/);
});

test("mobile navigation keeps the original five primary tabs and places Watchlists in More",()=>{
 const start=main.indexOf('<nav className="mobileNav">');
 const end=main.indexOf("</nav>",start);
 assert.ok(start>=0&&end>start,"mobile navigation markup exists");
 const nav=main.slice(start,end);
 const moreStart=nav.indexOf('<div className="mobileMore groupedMobileMore">');
 const primary=nav.slice(0,moreStart);
 assert.equal((primary.match(/<button/g)||[]).length,5);
 assert.match(primary,/<span>Home<\/span>/);
 assert.match(primary,/<span>Market<\/span>/);
 assert.match(primary,/<span>Trading<\/span>/);
 assert.match(primary,/<span>Account<\/span>/);
 assert.match(primary,/<span>More<\/span>/);
 assert.match(nav,/\["watch","Watchlists"\]/);
 assert.doesNotMatch(primary,/<span>Watch<\/span>/);
});
