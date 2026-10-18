'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');

const root=path.join(__dirname,'..');
const policyPath=path.join(root,'app/src/main/assets/card-acquisition-v0246.js');

test('v0.24.6 card-level acquisition policy routes promos safely',()=>{
  assert.ok(fs.existsSync(policyPath),'card acquisition policy module must exist');
  delete require.cache[require.resolve(policyPath)];
  const policy=require(policyPath);

  const misc={id:'misc',name:'Miscellaneous'};
  const ancient={id:'ancient-mew',name:'Ancient Mew',rarity:'Promo',set:misc};
  const blackStar={id:'basep-1',name:'Pikachu',rarity:'Promo',set:{id:'basep',name:'Wizards Black Star Promos'}};
  const leakedPromo={id:'odd-1',name:'Event Pikachu',rarity:'Promo',set:{id:'odd',name:'Ordinary Looking Set'}};
  const normal={id:'base-4',name:'Charizard',rarity:'Rare Holo',set:{id:'base',name:'Base Set'}};
  const creator={id:'creator-1',name:'Creator Pikachu',rarity:'No Rarity',set:{id:'poke-card-creator-pack',name:'Poké Card Creator Pack'}};
  const world={id:'world-1',name:'World Collection Pikachu',rarity:'No Rarity',set:{id:'world-collection-2000-jp',name:'World Collection 2000 (JP)'}};
  const otherMedal={id:'victory-medal-2',name:'Victory Medal Silver',rarity:'No Rarity',set:{id:'victory-medals',name:'Victory Medals'}};

  assert.equal(policy.classify(ancient,misc),'achievement_reward');
  assert.equal(policy.boosterEligible(ancient,misc),false,'Ancient Mew must never be in a booster');
  assert.equal(policy.promoVaultEligible(ancient,misc),false,'Ancient Mew must never be Dust-buyable');
  assert.equal(policy.achievementEligible(ancient,misc),true);
  assert.equal(policy.displaySetName(ancient),'Achievement Rewards');
  assert.equal(policy.displaySetKey(ancient),'achievement-rewards');

  assert.equal(policy.classify(blackStar,blackStar.set),'promo_vault');
  assert.equal(policy.classify(leakedPromo,leakedPromo.set),'promo_vault','rarity metadata must beat a generic set name');
  assert.equal(policy.boosterEligible(leakedPromo,leakedPromo.set),false);
  assert.equal(policy.promoVaultEligible(leakedPromo,leakedPromo.set),true);

  assert.equal(policy.classify(normal,normal.set),'booster');
  assert.equal(policy.boosterEligible(normal,normal.set),true);
  assert.equal(policy.promoVaultEligible(normal,normal.set),false);

  assert.equal(policy.classify(creator,creator.set),'promo_vault','Card Creator one-offs must use the Promo Vault, not boosters');
  assert.equal(policy.setBoosterCatalogEligible(creator.set),false,'Card Creator is not a retail booster series');
  assert.equal(policy.classify(world,world.set),'promo_vault','World Collection one-offs must use the Promo Vault, not boosters');
  assert.equal(policy.setBoosterCatalogEligible(world.set),false,'World Collection is not a retail booster series');
  assert.equal(policy.classify(otherMedal,otherMedal.set),'promo_vault','non-achievement Victory Medals remain collectible through the Promo Vault');

  assert.equal(policy.setMayContainPromoCards(misc),true,'Miscellaneous must be audited by Promo Vault');
  assert.equal(policy.setMayContainPromoCards(blackStar.set),true);
  assert.equal(policy.setMayContainPromoCards(normal.set),false);

  const medal={id:'victory-medal-1',name:'Victory Medal',rarity:'No Rarity',set:{id:'victory-medals',name:'Victory Medals'}};
  assert.equal(policy.classify(medal,medal.set),'achievement_reward','trophy Victory Medals are achievement-only');
  assert.equal(policy.setBoosterCatalogEligible(medal.set),false,'Victory Medals do not appear as purchasable booster packs');
  assert.equal(policy.setBoosterCatalogEligible(misc),false,'Miscellaneous does not appear as a normal booster pack');
});

test('v0.24.6 source wiring applies policy at packs, Promo Vault and collection display',()=>{
  const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  assert.match(html,/card-acquisition-v0246\.js/,'policy module is loaded before pack/app code');
  assert.match(app,/LuckyDexCardAcquisition(?:\?\.)?\.boosterEligible|LuckyDexCardAcquisition\?\.boosterEligible/,'pack construction applies card-level booster eligibility');
  assert.match(app,/allBriefs=set\.cards\|\|\[\],briefs=source==='tcg'\?allBriefs\.filter\(card=>window\.LuckyDexCardAcquisition\?\.boosterEligible/,'online/library physical pack pool is filtered card-by-card');
  assert.match(app,/cachedPool=cachedCardsForSetV13\(set\.id\),pool=source==='tcg'\?cachedPool\.filter\(card=>window\.LuckyDexCardAcquisition\?\.boosterEligible/,'offline cached physical pack pool is filtered card-by-card');
  assert.match(flow,/LuckyDexCardAcquisition(?:\?\.)?\.promoVaultEligible|LuckyDexCardAcquisition\?\.promoVaultEligible/,'Promo Vault filters individual cards');
  assert.match(flow,/LuckyDexCardAcquisition(?:\?\.)?\.setMayContainPromoCards|LuckyDexCardAcquisition\?\.setMayContainPromoCards/,'Promo Vault scans mixed generic promo sources');
  assert.match(app,/LuckyDexCardAcquisition(?:\?\.)?\.displaySetName|LuckyDexCardAcquisition\?\.displaySetName/,'collection display uses acquisition grouping');
  assert.match(app,/LuckyDexCardAcquisition(?:\?\.)?\.displaySetKey|LuckyDexCardAcquisition\?\.displaySetKey/,'collection grouping uses acquisition grouping key');
  assert.match(app,/card:\{name:'Ancient Mew',setName:'Miscellaneous'\}/,'Kanto completion awards Ancient Mew');
  assert.match(app,/card:\{name:'Victory Medal',setName:'Victory Medals'\}/,'Game Corner achievement awards a Victory Medal');
  assert.match(app,/total=cardSetTotal\(first\)/,'Achievement Rewards binder progress must not inherit a physical source-set total');
});

test('release identity remains newer than v0.24.6 without changing signing identity',()=>{
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  const code=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]||0);
  assert.ok(code>=246,'versionCode remains at or above the v0.24.6 release floor');
  const name=(gradle.match(/versionName\s+["']([^"']+)["']/)||[])[1];const parts=String(name||'').split('.').map(Number);assert.ok(parts[0]>0||parts[1]>24||(parts[1]===24&&parts[2]>=6));
  assert.ok(html.includes(`v${name}`),'visible app version follows current release');
  assert.ok(fs.existsSync(path.join(root,'app/luckydex-dev.keystore')),'permanent signer remains bundled');
});
