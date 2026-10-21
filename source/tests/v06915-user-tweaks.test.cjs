'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(ROOT,rel),'utf8');

test('Trade opens on the full market and no longer exposes a redundant Featured-five filter',()=>{
  const html=read('app/src/main/assets/index.html');
  const trade=read('app/src/main/assets/trade-v0163.js');
  assert.doesNotMatch(html,/data-trade-view="featured"/i);
  assert.match(html,/<button class="active" data-trade-view="all">ALL/i);
  assert.match(trade,/let tradeView\s*=\s*'all'/);
  assert.doesNotMatch(trade,/if\(view==='featured'\)/);
  assert.doesNotMatch(trade,/featured ·/i);
});

test('Fishing region progress distinguishes unique regional completion from the unlock target',()=>{
  const fishing=read('app/src/main/assets/arcade-fishing.js');
  assert.match(fishing,/function regionSpeciesCount\(/);
  assert.match(fishing,/unique species caught/i);
  assert.match(fishing,/next region unlock/i);
  assert.doesNotMatch(fishing,/\$\{logged\}\/\$\{r\.regionalTarget\} regional species logged/);
});


test('regional Fishing progress counts repeated species across spots only once',()=>{
  global.LuckyDexFishingCore=require('../app/src/main/assets/arcade-fishing-core.js');
  delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];
  require('../app/src/main/assets/arcade-fishing.js');
  const api=global.LuckyDexFishing;
  const region={areas:[{id:'one',pool:[{speciesId:1},{speciesId:2},{speciesId:3}]},{id:'two',pool:[{speciesId:2},{speciesId:3},{speciesId:4}]}]};
  const progress={areaCaught:{one:[1,2,3],two:[2,3,4]}};
  assert.equal(api.regionProgressCount(progress,region),4,'six spot entries represent four unique regional species');
  assert.equal(api.regionSpeciesCount(region),4,'regional denominator also deduplicates species shared by spots');
});

test('Fishing play screen shows current spot completion without returning to Change Spot',()=>{
  const html=read('app/src/main/assets/index.html');
  const fishing=read('app/src/main/assets/arcade-fishing.js');
  assert.match(html,/id="fishingPlayProgress"/);
  assert.match(fishing,/fishingPlayProgress/);
  assert.match(fishing,/local species/i);
});

test('Fishing pre-cast countdown is half a second longer',()=>{
  const fishing=read('app/src/main/assets/arcade-fishing.js');
  const match=fishing.match(/const COUNTDOWN_STEPS=\[(.*?)\];/s);
  assert.ok(match,'countdown steps should remain explicit');
  const durations=[...match[1].matchAll(/,\s*(\d+)\s*\]/g)].map(m=>Number(m[1]));
  assert.equal(durations.reduce((a,b)=>a+b,0),1850,'countdown should increase from 1.35s to 1.85s');
});
