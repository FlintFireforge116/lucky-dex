'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const pocket=fs.readFileSync(path.join(ROOT,'app/src/main/assets/tcgp-source-v0160.js'),'utf8');
const app=fs.readFileSync(path.join(ROOT,'app/src/main/assets/app-v0167.js'),'utf8');
assert.match(pocket,/function resolveCard|async function resolveCard/,'Pocket runtime needs an exact-card resolver for cards saved by older versions');
assert.match(pocket,/resolveCard[\s\S]{0,1800}setDetail/,'Pocket exact-card repair must rehydrate from the authoritative set catalogue');
const start=app.indexOf('async function resolveCardArtwork');
assert.ok(start>=0);
const body=app.slice(start,start+3000);
assert.match(body,/source===['"]tcgp['"][\s\S]{0,1600}LuckyDexPocket\?\.resolveCard|source===['"]tcgp['"][\s\S]{0,1600}LuckyDexPocket\.resolveCard/,
  'old owned Pocket cards must be upgraded to the exact GitHub artwork resolver');
const repairStart=app.indexOf('async function repairOwnedCardImages');
const repairBody=app.slice(repairStart,repairStart+900);
assert.match(repairBody,/tcgp[\s\S]{0,250}_pocketExactRemote/,'background repair must include stale Pocket cards, not only cards with an empty image field');
console.log('PASS v0.26.1 owned Pocket artwork repair contract');
