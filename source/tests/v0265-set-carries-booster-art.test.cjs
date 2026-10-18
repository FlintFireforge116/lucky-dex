const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const art=require(path.join(process.cwd(),'app/src/main/assets/booster-art-v0260.js'));

const jungle={id:'library:base2',name:'Jungle'};
assert.equal(typeof art.attach,'function','booster art module must expose attach(set)');
art.attach(jungle);
assert.equal(jungle._boosterArt,'booster-art-v0260/base2.webp');

const app=fs.readFileSync('app/src/main/assets/app-v0167.js','utf8');
assert.match(app,/set\._boosterArt\s*\|\|/,'sealed pack renderer must use the set-carried artwork before any fallback');
console.log('PASS v0.26.5 set-carried booster artwork');
