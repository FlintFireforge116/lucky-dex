'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('playmat catalogue includes an always-available Eevee mat and unlockable Pocket mats',()=>{
  const cat=require(path.join(assets,'cosmetics-playmats-v06958.js'));
  assert.ok(cat.CATALOGUE.length>=10);
  const eevee=cat.BY_ID['pocket-eevee'];
  assert.equal(eevee.alwaysUnlocked,true);
  assert.match(eevee.artPath,/TCGP_Playmat_Eevee\.png/);
  assert.ok(cat.CATALOGUE.some(x=>x.rewardGroup==='type:grass'));
});

test('old saves migrate to a default playmat and locked mats cannot be equipped',()=>{
  const core=require(path.join(assets,'cosmetics-core-v0413.js'));
  const state={cosmetics:{unlockedSleeves:['luckydex-default'],activeSleeve:'luckydex-default'}};
  const c=core.ensureState(state);
  assert.ok(c.unlockedPlaymats.includes('pocket-eevee'));
  assert.equal(c.activePlaymat,'pocket-eevee');
  assert.equal(core.equipPlaymat(state,'pocket-darkrai').ok,false);
  assert.equal(core.equipPlaymat(state,'pocket-eevee').ok,true);
});

test('playmat progression unlocks reconcile from LuckyDex evidence',()=>{
  const core=require(path.join(assets,'cosmetics-core-v0413.js'));
  const state={cosmetics:{},pokemon:{one:{id:25,count:1}},profile:{achievementClaims:[]}};
  const result=core.reconcile(state,[]);
  assert.ok(result.unlockedPlaymats.includes('pocket-pikachu'));
  assert.ok(core.isPlaymatOwned(state,'pocket-pikachu'));
});

test('customise screen exposes Sleeves and Playmats catalogue tabs',()=>{
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  const js=fs.readFileSync(path.join(assets,'cosmetics-customise-v0413.js'),'utf8');
  assert.match(html,/data-cosmetic-kind="sleeves"/);
  assert.match(html,/data-cosmetic-kind="playmats"/);
  assert.match(js,/equipPlaymat/);
});
