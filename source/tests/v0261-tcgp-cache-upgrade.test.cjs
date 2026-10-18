'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const flow=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/pack-flow-v0165.js'),'utf8');
const start=flow.indexOf('async function preparePack');
assert.ok(start>=0,'preparePack must exist');
const body=flow.slice(Math.max(0,start-1800),start+6000);
assert.match(flow,/luckydex-github-v1/,'generated LuckyDex Pocket index must be recognised as authoritative');
assert.match(flow,/pocketdecks-github-v5/,'direct exact PocketDecks GitHub data must be recognised as authoritative');
assert.doesNotMatch(body,/\[['"]luckydex-github-v1['"],['"]pocketdecks-github-v5['"]\][\s\S]{0,100}flibustier-v2/,
  'old flibustier caches must not be treated as exact authoritative Pocket art');
assert.doesNotMatch(body,/_pocketDataset\s*!==\s*['"]flibustier-v2['"]/,
  'v0.26.1 must not preserve the old Pocket cache shortcut');
console.log('PASS v0.26.1 Pocket cache upgrade contract');
