'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const Rarity=require('../app/src/main/assets/card-rarity-v0253.js');
const Pack=require('../app/src/main/assets/pack-policy-v0343.js');
const Acquisition=require('../app/src/main/assets/card-acquisition-v0246.js');

const allAny=profile=>profile.slots.every(slot=>slot.allowedClasses.includes('unknown')&&slot.allowedClasses.includes('common')&&slot.allowedClasses.includes('rare')&&slot.allowedClasses.includes('promo'));

test('Dragon Vault keeps printed rarity separate from its all-holo finish',()=>{
  const dragonSet={id:'dv1',name:'Dragon Vault'};
  assert.equal(Rarity.normalizedPrintedRarity({number:'1',rarity:'Rare Holo'},dragonSet),'No Rarity');
  assert.equal(Rarity.classify({number:'1',rarity:'Rare Holo'},dragonSet).rarityClass,'unknown');
  assert.equal(Rarity.classify({number:'1',rarity:'Rare Holo'},dragonSet).finish,'holo');
  assert.equal(Rarity.normalizedPrintedRarity({number:'20',rarity:'Rare Holo'},dragonSet),'No Rarity');
  assert.equal(Rarity.normalizedPrintedRarity({number:'21',rarity:'Rare Holo'},dragonSet),'Secret Rare');
  assert.equal(Rarity.classify({number:'21',rarity:'Rare Holo'},dragonSet).rarityClass,'secret');
  assert.equal(Rarity.classify({number:'21',rarity:'Rare Holo'},dragonSet).finish,'holo');

  const normal=Pack.slotPlan({...dragonSet,cardCount:{total:21}},{source:'tcg',luckyPack:false});
  const lucky=Pack.slotPlan({...dragonSet,cardCount:{total:21}},{source:'tcg',luckyPack:true});
  assert.equal(normal.length,5);
  assert.ok(normal.every(slot=>slot.finish==='holo'&&slot.allowedClasses.includes('unknown')));
  assert.ok(lucky.every(slot=>slot.finish==='holo'&&slot.allowedClasses.includes('unknown')),'Lucky Pack must not make Dragon Vault impossible by requiring rare-only slots');

  assert.equal(Rarity.normalizedPrintedRarity({rarity:'No Rarity'},{id:'TK4G',name:'HS Trainer Kit—Gyarados'}),'No Rarity');
  assert.equal(Rarity.classify({rarity:'No Rarity'},{id:'TK4G',name:'HS Trainer Kit—Gyarados'}).rarityClass,'unknown');
  assert.equal(Rarity.normalizedPrintedRarity({rarity:'No Rarity'},{id:'basep',name:'Wizards Black Star Promos'}),'Promo');
  assert.equal(Rarity.classify({rarity:'No Rarity'},{id:'basep',name:'Wizards Black Star Promos'}).rarityClass,'promo');
});

test('known fixed/no-rarity products use flexible small-set collation instead of standard booster rarity slots',()=>{
  const samples=[
    [{id:'MCD11',name:"McDonald's Collection 2011",releaseDate:'2011-06-17',cardCount:{total:12}},4],
    [{id:'RM',name:'Rumble',releaseDate:'2009-12-02',cardCount:{total:16}},4],
    [{id:'SI',name:'Southern Islands',releaseDate:'2001-07-31',cardCount:{total:18}},4],
    [{id:'XY0',name:'Kalos Starter Set',releaseDate:'2013-11-08',cardCount:{total:39}},4],
    [{id:'MFB',name:'My First Battle',releaseDate:'2023-09-29',cardCount:{total:48}},6],
    [{id:'CLB',name:'Pokémon TCG Classic - Blastoise',releaseDate:'2023-11-16',cardCount:{total:34}},4],
    [{id:'Box Topper',name:'Box Topper',releaseDate:'2002-09-15',cardCount:{total:12}},4],
    [{id:'HS Energy',name:'HS Energy (2010 Unnumbered)',releaseDate:'2010-02-10',cardCount:{total:8}},4],
  ];
  for(const [set,count] of samples){
    const profile=Pack.resolve(set,'tcg');
    assert.equal(profile.id,`special_flexible_${count}`,`${set.name} gets flexible profile`);
    assert.equal(profile.cardCount,count,`${set.name} keeps small-set pack size`);
    assert.equal(profile.slots.length,count);
    assert.ok(allAny(profile),`${set.name} accepts legitimate no-rarity cards`);
    const lucky=Pack.slotPlan(set,{source:'tcg',luckyPack:true});
    assert.ok(allAny({...profile,slots:lucky}),`${set.name} Lucky Pack cannot reintroduce impossible rare-only slots`);
  }
  assert.equal(Pack.resolve({id:'hgss1',name:'HeartGold & SoulSilver',releaseDate:'2010-02-10',cardCount:{total:124}},'tcg').id,'dp_bw_xy_10','real booster sets keep strict historical collation');
  assert.equal(Pack.resolve({id:'base2',name:'Jungle',releaseDate:'1999-06-16',cardCount:{total:64}},'tcg').id,'wotc_11','Jungle remains untouched');
});

test('McDonalds mini-pack cards remain booster cards while true promo-only products stay in Promo Vault',()=>{
  const mcdSet={id:'MCD13',name:"McDonald's Collection 2013"};
  const mcdCard={id:'MCD13-1',name:'Leafeon',rarity:'Promo',set:mcdSet};
  assert.equal(Acquisition.classify(mcdCard,mcdSet),'booster','McDonald\'s metadata label Promo must not eject the card from its mini-pack');
  assert.equal(Acquisition.setBoosterCatalogEligible(mcdSet),true);
  const mcdSlot=Pack.resolve({...mcdSet,cardCount:{total:12}},'tcg').slots[0];
  assert.equal(Pack.cardMatchesDescriptor(mcdCard,mcdSlot,mcdSet,'tcg',Rarity.classify),true,'Promo-labelled McDonald\'s scans must still satisfy flexible mini-pack slots');

  const bestSet={id:'Best of Game',name:'Best of Game'};
  const bestCard={id:'Best of Game-1',name:'Electabuzz',rarity:'Promo',set:bestSet};
  assert.equal(Acquisition.classify(bestCard,bestSet),'promo_vault');
  assert.equal(Acquisition.setBoosterCatalogEligible(bestSet),false,'Best of Game is a promo issue, not a booster product');
  assert.equal(Acquisition.promoCatalogSetEligible(bestSet),true);

  const futsalSet={id:'FUT20',name:'Pokémon Futsal Collection'};
  const futsalCard={id:'FUT20-001',name:'Pikachu on the Ball',rarity:'Promo',set:futsalSet};
  assert.equal(Acquisition.classify(futsalCard,futsalSet),'promo_vault');
  assert.equal(Acquisition.setBoosterCatalogEligible(futsalSet),false,'Futsal Collection alias must not leave a dead booster tile');
  assert.equal(Acquisition.promoCatalogSetEligible(futsalSet),true);

  const blackStar={id:'basep-1',name:'Pikachu',rarity:'No Rarity',set:{id:'basep',name:'Wizards Black Star Promos'}};
  assert.equal(Acquisition.classify(blackStar,blackStar.set),'promo_vault','dedicated promo families stay routed by set identity even when rarity metadata is weak');
});

test('card-art hydration uses set-aware rarity normalization for collection display',()=>{
  const library=fs.readFileSync(path.join(root,'app/src/main/assets/card-art-library-v0165.js'),'utf8');
  assert.match(library,/normalizedPrintedRarity/,'hydrated index cards must normalize known weak rarity metadata before display/save');
});


test('HS Trainer Kit live index shape is superseded by the fixed 30-card product manifest',()=>{
  const set={id:'library:TK4G',name:'HS Trainer Kit—Gyarados',releaseDate:'2010-05-12',cardCount:{total:2,official:2},_libraryKey:'TK4G'};
  const profile=Pack.resolve(set,'tcg');
  assert.equal(profile.cardCount,30);
  assert.equal(profile.rateFamily,'fixed-product');
  assert.equal(profile.fixedContents,true);
  assert.equal(profile.slots.length,0,'fixed contents never use random booster descriptors');

  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  assert.doesNotMatch(app,/allowExactRepeat/,'the v0.35.13 repeat-print workaround is removed');
});
