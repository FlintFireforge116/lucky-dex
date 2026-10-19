'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.63.0 metadata is aligned',()=>{
  assert.equal(require(path.join(ROOT,'package.json')).version,'0.63.0');
  const lock=require(path.join(ROOT,'package-lock.json'));
  assert.equal(lock.version,'0.63.0');
  assert.equal(lock.packages[''].version,'0.63.0');
  assert.match(read('app/build.gradle'),/versionCode 6300[\s\S]*versionName '0\.63\.0'/);
  assert.match(read('app/build.gradle'),/LuckyDex-asset-builder\/0\.63\.0/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.63\.0'/);
});

test('every Stadium 2 Kids Club game has tile metadata so the venue can render safely',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const stadium2Games=world.match(/id:\"stadium2KidsClub\"[\s\S]*?games:\[([^\]]+)\]/)?.[1]?.match(/'([^']+)'/g)?.map(x=>x.slice(1,-1))||[];
  const kidsBlock=world.match(/const kids=\{([\s\S]*?)\};\n const renderKids/)?.[1]||'';
  for(const game of stadium2Games){
    assert.match(kidsBlock,new RegExp(`${game}:\\{sprite:'[^']+',mechanic:'[^']+'\\}`),`${game} is missing Kids Club tile metadata`);
  }
  assert.match(kidsBlock,/streamingStampede:\{sprite:'173\.png',mechanic:'Count · focus · accuracy'\}/);
});
