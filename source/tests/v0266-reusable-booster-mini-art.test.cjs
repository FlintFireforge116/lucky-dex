'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const assets=path.join(ROOT,'app/src/main/assets');
const fullManifest=JSON.parse(fs.readFileSync(path.join(assets,'booster-art-index-v0260.json'),'utf8'));
const miniDir=path.join(assets,'booster-mini-v0266');
const miniModulePath=path.join(assets,'booster-mini-v0266.js');

assert.ok(fs.existsSync(miniDir),'standalone booster-mini-v0266 asset folder must exist');
assert.ok(fs.existsSync(miniModulePath),'reusable booster mini resolver module must exist');
const miniFiles=fs.readdirSync(miniDir).filter(f=>f.endsWith('.webp'));
assert.equal(miniFiles.length,Object.keys(fullManifest.byId||{}).length,'every physical packshot must have one reusable mini asset');

const mini=require(miniModulePath);
for(const [id] of Object.entries(fullManifest.byId||{})){
  const expected=`booster-mini-v0266/${id}.webp`;
  assert.equal(mini.directPath({id}),expected,`${id} must resolve to its standalone mini asset`);
  assert.ok(fs.existsSync(path.join(assets,expected)),`${id} mini asset is missing`);
}
assert.equal(mini.directPath({name:'Jungle'}),'booster-mini-v0266/base2.webp','Jungle mini art must resolve directly');
assert.equal(mini.directPath({name:'Ruby & Sapphire'}),'booster-mini-v0266/ex1.webp','Ruby & Sapphire mini art must resolve directly');

const index=fs.readFileSync(path.join(assets,'index.html'),'utf8');
assert.match(index,/booster-mini-v0266\.js["']/,'mini resolver must load in the app');
const fossil=fs.readFileSync(path.join(assets,'arcade-fossil-museum.js'),'utf8');
assert.match(fossil,/LuckyDexBoosterMiniArt\?\.directPath/,'Fossil Dig must request standalone mini pack art');
assert.match(fossil,/fossil-booster-mini-v0266/,'Fossil Dig must render the dedicated mini-pack sprite class');
assert.doesNotMatch(fossil,/className='fossil-booster-find-v0258'/,'Fossil Dig must not wrap real pack art in the old generated booster shell');

const css=fs.readFileSync(path.join(assets,'arcade.css'),'utf8');
assert.match(css,/\.fossil-booster-mini-v0266\s*\{[^}]*object-fit\s*:\s*contain/s,'mini booster sprite must preserve the complete pack artwork');

console.log(`PASS v0.26.6 reusable booster mini assets: ${miniFiles.length} standalone pack sprites`);
