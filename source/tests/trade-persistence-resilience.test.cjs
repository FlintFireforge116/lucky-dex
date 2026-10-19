const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/trade-v0163.js'),'utf8');
const start=source.indexOf('async function ensureMarket');
assert.ok(start>=0,'ensureMarket must exist');
const end=source.indexOf('\n  async function augmentMarketForSet',start);
assert.ok(end>start,'ensureMarket block must be bounded');
const block=source.slice(start,end);
assert.match(block,/typeof save==='function'\)save\(\)/,'market snapshots should use the shared resilient save path when available');
assert.match(block,/else localStorage\.setItem\('luckyDexSave'/,'legacy fallback should remain for isolated trade contexts');
console.log('trade-persistence-resilience: ok');
