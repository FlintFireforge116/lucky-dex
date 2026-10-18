'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const builder=fs.readFileSync(path.join(ROOT,'scripts/build-booster-art-index.py'),'utf8');
assert.doesNotMatch(builder,/api\.github\.com|raw\.githubusercontent\.com|urllib|urlopen|git[^\n]*fetch/i,
  'APK booster-art build must be network-independent so GitHub rate limits cannot break Android builds');
assert.match(builder,/local_art_files/,'builder must enumerate checked-in local pack images');
assert.match(builder,/unexpected_missing/,'builder must fail closed if a genuine audited booster set loses its artwork');
assert.match(builder,/booster-art-coverage-v0264\.json/,'builder must emit an explicit coverage audit');
console.log('PASS v0.26.4 booster artwork build is offline and rate-limit-proof');
