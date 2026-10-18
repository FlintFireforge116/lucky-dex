'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Pack=require('../app/src/main/assets/pack-opening-v0160.js');

// Pull impact is style-aware: Rainbow must outrank Illustration, and Gold/Hyper/Crown
// must be the unmistakable top jackpot without inheriting rainbow rays.
{
  const illustration=Pack.profileFor({rarity:'Illustration Rare'});
  const rainbow=Pack.profileFor({rarity:'Rainbow Rare'});
  const hyper=Pack.profileFor({rarity:'Hyper Rare'});
  const gold=Pack.profileFor({rarity:'Gold Rare'});
  const crown=Pack.profileFor({rarity:'Crown Rare'});
  assert.equal(illustration.level,4);
  assert.equal(illustration.style,'illustration');
  assert.equal(rainbow.level,5);
  assert.equal(rainbow.style,'prismatic');
  assert.ok(rainbow.duration>illustration.duration,'Rainbow reveal is more dramatic/longer than Illustration Rare');
  for(const [name,p] of [['Hyper Rare',hyper],['Gold Rare',gold],['Crown Rare',crown]]){
    assert.equal(p.level,6,`${name} is jackpot tier`);
    assert.equal(p.style,'gold',`${name} uses gold jackpot effects`);
    assert.equal(p.rainbow,false,`${name} does not use rainbow rays`);
  }
}

// Physical booster size scales down for genuinely small sets.
assert.equal(Pack.physicalPackSizeFor({cardCount:{total:30}}),4);
assert.equal(Pack.physicalPackSizeFor({cardCount:{total:40}}),4);
assert.equal(Pack.physicalPackSizeFor({cardCount:{total:41}}),6);
assert.equal(Pack.physicalPackSizeFor({cardCount:{total:70}}),6);
assert.equal(Pack.physicalPackSizeFor({cardCount:{total:71}}),8);
assert.equal(Pack.physicalPackSizeFor({cardCount:{total:100}}),8);
assert.equal(Pack.physicalPackSizeFor({cardCount:{total:101}}),10);
assert.equal(Pack.physicalPackSizeFor({cardCount:{total:0}}),10,'unknown set size stays conservative');

// Only explicit promo series leave the normal booster catalogue. Small special
// sets such as McDonald's / Trainer Kits are not accidentally removed.
assert.equal(Pack.isPromoSet({id:'library:svp',name:'Scarlet & Violet Black Star Promos'}),true);
assert.equal(Pack.isPromoSet({id:'promo-sm',name:'Sun & Moon Promos'}),true);
assert.equal(Pack.isPromoSet({id:'mcd23',name:"McDonald's Collection 2023"}),false);
assert.equal(Pack.isPromoSet({id:'tk-xy',name:'XY Trainer Kit—Noivern'}),false);
assert.equal(Pack.isPromoSet({id:'cel25',name:'Celebrations'}),false);

const flow=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/pack-flow-v0165.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');

assert.match(app,/physicalPackSizeFor/,'online/offline pack orchestration uses the shared physical pack-size rule');
assert.match(flow,/isPromoSet/,'pack catalogue explicitly separates promo series');
assert.match(flow,/promoSetCache|promoSets/,'promo sets are retained for Promo Vault instead of discarded');
assert.match(html,/id="promoVaultBtn"/,'Packs screen exposes Promo Vault');
assert.match(html,/id="promoVaultDialog"/,'Promo Vault has a dedicated browsing surface');
assert.match(flow,/buyPromoCard|purchasePromoCard/,'Promo Vault has a Dust purchase path');
assert.match(html,/Duplicate cards stay in your binder[\s\S]*Dust Exchange/,'v0.24.7 manual duplicate economy is explained from Packs');

console.log('PASS v0.24.5 pull impact, promo separation and small-set booster contract');
