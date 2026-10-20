'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/arcade-fishing-core.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');

test('rod tiers materially change catch-zone width and Old Rod is deliberately narrow',()=>{
  const common=C.createCatch({species:S.byId[129],rolls:{size:.5},rod:'old'});
  const old=C.startFight(common,'old',10),good=C.startFight(common,'good',10),superRod=C.startFight(common,'super',10);
  assert(old.zoneSize<=.19,`Old Rod zone should be narrow, got ${old.zoneSize}`);
  assert(good.zoneSize>old.zoneSize);assert(superRod.zoneSize>good.zoneSize);
});

test('rarer Pokemon are materially harder to land than common Pokemon',()=>{
  const common=C.createCatch({species:S.byId[129],rolls:{size:.5},rod:'old'}); // common Magikarp
  const rare=C.createCatch({species:S.byId[131],rolls:{size:.5},rod:'old'}); // very-rare Lapras override
  assert.equal(common.rarity,'common');assert.equal(rare.rarity,'very-rare');
  assert(rare.difficulty-common.difficulty>=.25,`rarity gap too small: ${common.difficulty} -> ${rare.difficulty}`);
});

test('tackle shop spends Fishing Tokens, never Lucky Coins',()=>{
  const save={profile:{coins:7777},arcade:{fishing:{fishingTokens:1000}}};
  const beforeCoins=save.profile.coins;
  const out=C.buy(save,'rod','good');
  assert.equal(out.ok,true);assert.equal(save.profile.coins,beforeCoins,'Lucky Coins are not tackle currency');
  assert(C.ensureState(save).fishingTokens<1000,'Fishing Tokens pay for tackle');
});

test('landed catches pay both Fishing Tokens and a smaller Lucky Coin bonus',()=>{
  assert.equal(typeof C.catchPayout,'function');
  const fish=C.createCatch({species:S.byId[129],rolls:{size:.5},rod:'old'});
  const payout=C.catchPayout(fish);
  assert(payout.fishingTokens>=1&&payout.fishingTokens<=5,'common catches use the low-token fishing economy');
  assert(payout.luckyCoins>0,'every landed catch gives some Lucky Coins');
  assert(payout.luckyCoins<=payout.fishingTokens,'Lucky Coins are a secondary bonus, not the fishing economy');
});

test('Old Rod separates common from very-rare catches under human-scale reaction delay',()=>{
  function successRate(speciesId,rod='old',trials=60){let wins=0;for(let seed=1;seed<=trials;seed++){const item=C.createCatch({species:S.byId[speciesId],rolls:{size:.5},rod});const run=C.startFight(item,rod,seed);let hold=false,decisionMs=0;for(let i=0;i<4000&&run.phase==='playing';i++){if(decisionMs<=0){hold=run.zoneY>run.fishY;decisionMs=200;}C.stepFight(run,{hold},16);decisionMs-=16;}if(run.phase==='caught')wins++;}return wins/trials;}
  const common=successRate(129),veryRare=successRate(131);
  assert(common>.9,`common catch should remain learnable on Old Rod, got ${common}`);
  assert(veryRare<.5,`very-rare catch should demand a better rod/tighter reactions, got ${veryRare}`);
});

test('same-rarity species can still have different deterministic fight behaviours',()=>{
  const squirtle=C.createCatch({species:S.byId[7],rolls:{size:.5},rod:'old'});
  const wartortle=C.createCatch({species:S.byId[8],rolls:{size:.5},rod:'old'});
  assert.equal(squirtle.rarity,'common');assert.equal(wartortle.rarity,'common');
  assert.notEqual(squirtle.behavior,wartortle.behavior);
});
