const fs=require('fs');const assert=require('assert');
const acquisition=require('../app/src/main/assets/card-acquisition-v0246.js');
const flow=fs.readFileSync('app/src/main/assets/pack-flow-v0165.js','utf8');
const app=fs.readFileSync('app/src/main/assets/app-v0167.js','utf8');
const trade=fs.readFileSync('app/src/main/assets/trade-v0163.js','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');
const pkg=require('../package.json');

function values(card){
  return {
    band:acquisition.promoValueBand(card),
    buy:acquisition.promoDustPurchaseCost(card),
    dust:acquisition.promoDustSalvageValue(card)
  };
}

assert.deepStrictEqual(values({name:'Pikachu',rarity:'Promo'}),{band:'standard',buy:350,dust:100});
assert.deepStrictEqual(values({name:'Popplio',rarity:'Promo'}),{band:'standard',buy:350,dust:100});
for(const name of ['Charizard ex','Mewtwo-EX','Pikachu V','Greninja-GX','Trevenant BREAK','Garchomp C Lv.X']){
  assert.deepStrictEqual(values({name,rarity:'Promo'}),{band:'enhanced',buy:600,dust:175},`${name} should use enhanced promo value`);
}
for(const name of ['Pikachu VMAX','Arceus VSTAR','Pikachu & Zekrom TAG TEAM','Radiant Eevee','Shining Ho-Oh']){
  assert.deepStrictEqual(values({name,rarity:'Promo'}),{band:'elite',buy:900,dust:275},`${name} should use elite promo value`);
}
for(const card of [
  {name:'Golden Pikachu',rarity:'Gold Promo'},
  {name:'Mew ex',rarity:'Hyper Rare Promo'},
  {name:'Charizard VMAX',rarity:'Rainbow Promo'},
  {name:'Pikachu ex',rarity:'Special Illustration Promo'},
  {name:'Mewtwo',rarity:'Crown Promo'}
]){
  assert.deepStrictEqual(values(card),{band:'premium',buy:1300,dust:450},`${card.rarity} should use premium promo value`);
}
for(const card of [
  {name:'Pikachu',rarity:'Promo'},
  {name:'Mewtwo-EX',rarity:'Promo'},
  {name:'Pikachu VMAX',rarity:'Promo'},
  {name:'Mew ex',rarity:'Hyper Rare Promo'}
]) assert(acquisition.promoDustSalvageValue(card)<acquisition.promoDustPurchaseCost(card),'Promo dust return must remain below its purchase cost');

assert.strictEqual(acquisition.isAchievementOnlyPromoSet({name:'Miscellaneous'}),true,'Miscellaneous is achievement-only and should not be listed as a promo/trade set');
assert.strictEqual(acquisition.isAchievementOnlyPromoSet({name:'Victory Medals'}),false,'Victory Medals contains non-achievement promos and should remain available');
assert.strictEqual(acquisition.isAchievementOnlyPromoSet({name:'Poké Card Creator Pack'}),false,'Card Creator promos can stay in the Promo Vault');
assert.strictEqual(acquisition.isAchievementOnlyPromoSet({name:'World Collection'}),false,'World Collection promos can stay in the Promo Vault');
assert.strictEqual(acquisition.promoCatalogSetEligible({name:'Miscellaneous'}),false);
assert.strictEqual(acquisition.promoCatalogSetEligible({name:'Victory Medals'}),true);
assert.strictEqual(acquisition.tradeCatalogSetEligible({name:'Victory Medals'}),true);
assert.strictEqual(acquisition.tradeCatalogSetEligible({name:'Wizards Black Star Promos'}),true);

assert.match(flow,/promoDustPurchaseCost/,'Promo Vault purchase price should use shared promo economy rules');
assert.match(flow,/promoCatalogSetEligible/,'Promo Vault set list should filter achievement-only promo buckets');
assert.match(flow,/promoVaultCards\.length[^\n]*===?0|!cards\.length[\s\S]{0,320}promoSetCache/,'An unexpectedly empty promo-only bucket should be removable from the list');
assert.match(app,/promoDustSalvageValue/,'Dust Exchange should use the promo-specific salvage value');
assert.match(trade,/tradeCatalogSetEligible/,'Trade discovered-set list should hide achievement-only promo buckets');

const currentCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);const currentName=(gradle.match(/versionName\s+'([^']+)'/)||[])[1];
assert.ok(currentCode>=248);assert.strictEqual(pkg.version,currentName);const vp=String(currentName||'').split('.').map(Number);assert.ok(vp[0]>0||vp[1]>24||(vp[1]===24&&vp[2]>=8));
assert.match(gradle,/applicationId\s+'com\.example\.luckydex'/);
assert.match(gradle,/signingConfig\s+signingConfigs\.debug/);

console.log('v0.24.8 promo economy/set filtering contract passed');
