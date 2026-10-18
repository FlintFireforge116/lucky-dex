'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const Pack=require('../app/src/main/assets/pack-policy-v0343.js');
const Rarity=require('../app/src/main/assets/card-rarity-v0253.js');
const Fixed=require('../app/src/main/assets/fixed-products-v03514.js');

const card=(name,id,extra={})=>({id,name,localId:id,number:id,rarity:'Common',image:`https://example.test/${encodeURIComponent(name)}.jpg`,setId:'hgss1',setName:'HeartGold & SoulSilver',source:'tcg',...extra});

function supportPools(){
  const names=['Totodile','Bill','Magikarp','Croconaw','Marill','Energy Switch','Pokémon Communication','Poké Ball',"Professor Elm's Training Method",'Switch','Moomoo Milk','Pikachu','Flaaffy','Meowth','Mareep','Copycat','Pokémon Collector'];
  const coreCards=names.map((name,i)=>card(name,String(i+1)));
  const energyCards=[card('Water Energy','W',{supertype:'Energy'}),card('Lightning Energy','L',{supertype:'Energy'})];
  return {coreCards,energyCards};
}

test('HS Trainer Kits are fixed 30-card Half Deck products, not four-card flexible boosters',()=>{
  const g={id:'library:TK4G',_libraryKey:'TK4G',name:'HS Trainer Kit—Gyarados',cardCount:{total:2}};
  const r={id:'library:TK4R',_libraryKey:'TK4R',name:'HS Trainer Kit—Raichu',cardCount:{total:2}};
  for(const set of [g,r]){
    const definition=Fixed.definitionFor(set);
    assert.ok(definition,`${set.name} has a fixed definition`);
    assert.equal(definition.kind,'half-deck');
    assert.equal(definition.cardCount,30);
    assert.equal(definition.contents.length,30);
    const profile=Pack.resolve(set,'tcg');
    assert.equal(profile.id,'fixed_half_deck_30');
    assert.equal(profile.productKind,'half-deck');
    assert.equal(profile.fixedContents,true);
    assert.equal(profile.cardCount,30);
    assert.equal(profile.slots.length,0,'fixed decks bypass random booster slots');
  }
  assert.equal(Pack.resolve({id:'MCD11',name:"McDonald's Collection 2011",cardCount:{total:12}},'tcg').id,'special_flexible_4','unrelated mini-packs stay flexible');
});

test('Gyarados Half Deck builds the authentic ordered 30-card list with unique position IDs',()=>{
  const set={id:'library:TK4G',_libraryKey:'TK4G',name:'HS Trainer Kit—Gyarados',releaseDate:'2010-05-12'};
  const signature=[
    card('Gyarados','TK4G-20',{localId:'20',number:'20',rarity:'No Rarity',image:'https://example.test/gyarados.jpg'}),
    card('Gyarados','TK4G-20-2',{localId:'20',number:'20',rarity:'No Rarity',image:'https://example.test/gyarados-holo.jpg',_foil:'Holofoil'})
  ];
  const cards=Fixed.build(set,{signatureCards:signature,...supportPools()});
  assert.equal(cards.length,30);
  assert.equal(new Set(cards.map(c=>c.id)).size,30,'every physical deck position has a unique LuckyDex identity');
  assert.deepEqual(cards.slice(0,5).map(c=>c.name),['Totodile','Water Energy','Water Energy','Water Energy','Bill']);
  assert.equal(cards[11].name,'Magikarp');
  assert.equal(cards[19].name,'Gyarados');
  assert.equal(cards[29].name,'Gyarados');
  assert.deepEqual(cards.map(c=>c.localId),Array.from({length:30},(_,i)=>String(i+1)));
  assert.ok(cards.every(c=>c.rarity==='No Rarity'));
  assert.equal(cards[19]._foil,undefined,'Gyarados 20/30 is non-holo');
  assert.equal(cards[29]._foil,'Holofoil','Gyarados 30/30 is holo');
  assert.notEqual(cards[19].id,cards[29].id);
});

test('Raichu Half Deck has its own authentic order and only position 30 is holo',()=>{
  const set={id:'library:TK4R',_libraryKey:'TK4R',name:'HS Trainer Kit—Raichu',releaseDate:'2010-05-12'};
  const signature=[card('Raichu','TK4R-19',{localId:'19',number:'19',rarity:'No Rarity'}),card('Raichu','TK4R-30',{localId:'30',number:'30',rarity:'No Rarity',_foil:'Holofoil'})];
  const cards=Fixed.build(set,{signatureCards:signature,...supportPools()});
  assert.equal(cards.length,30);
  assert.deepEqual(cards.slice(0,5).map(c=>c.name),['Moomoo Milk','Pikachu','Flaaffy','Meowth','Lightning Energy']);
  assert.equal(cards[18].name,'Raichu');
  assert.equal(cards[29].name,'Raichu');
  assert.equal(cards[18]._foil,undefined);
  assert.equal(cards[29]._foil,'Holofoil');
  assert.equal(new Set(cards.map(c=>c.id)).size,30);
});

test('legitimate No Rarity reveal metadata never leaks UNKNOWN RARITY',()=>{
  const trainer=Rarity.classify({rarity:'No Rarity',name:'Totodile'},{id:'TK4G',name:'HS Trainer Kit—Gyarados'});
  assert.equal(trainer.rarityClass,'unknown','collation compatibility may stay unknown internally');
  assert.equal(trainer.revealLabel,'NO RARITY');
  assert.equal(trainer.revealStyle,'normal');
  assert.equal(trainer.diagnostic,null,'explicit No Rarity is known metadata, not a diagnostic failure');

  const dv=Rarity.classify({number:'17',rarity:'No Rarity',name:'Druddigon'},{id:'dv1',name:'Dragon Vault'});
  assert.equal(dv.finish,'holo');
  assert.equal(dv.revealLabel,'HOLOFOIL');
  assert.equal(dv.revealStyle,'holo');
  assert.equal(dv.diagnostic,null);

  const secret=Rarity.classify({number:'21',rarity:'Rare Holo',name:'Kyurem'},{id:'dv1',name:'Dragon Vault'});
  assert.equal(secret.revealLabel,'SECRET RARE');
});

test('Dragon Vault uses an authenticated high-resolution primary wrapper and never falls back to the tiny legacy image',()=>{
  const art=require('../app/src/main/assets/booster-art-v0260.js');
  const set={id:'dv1',name:'Dragon Vault'};
  assert.equal(art.directPath(set),'authentic-pack-art/dragon-vault-ray.webp');
  assert.equal(art.localPath(set),'booster-art-v0260/dv1.webp','legacy archive remains only as historical source data');
  assert.equal(art.runtimeFallback(set),'','runtime must never display the obsolete Dragon Vault thumbnail');
  assert.ok(!/^https?:/i.test(art.directPath(set)),'normal Android rendering must not depend on runtime hotlinking');

  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  assert.match(gradle,/ptcg-assets\/main\/dv1\/packshots\/ray\.webp/,'build obtains the audited full-size wrapper');
  assert.match(gradle,/authentic-pack-art[\\/]dragon-vault-ray\.webp/,'materialized target is packaged under Android assets');
  assert.match(gradle,/preBuild[\s\S]*materializeAuthenticPackArt|materializeAuthenticPackArt[\s\S]*preBuild/,'asset materialization runs before APK packaging');
});

test('pack UI identifies fixed Half Decks and keeps opener instructions clear of the Shop button',()=>{
  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'app/src/main/assets/styles-v013.css'),'utf8')+'\n'+fs.readFileSync(path.join(root,'app/src/main/assets/pack-opening-v0160.css'),'utf8');
  assert.match(flow,/LuckyDexFixedProducts/,'pack preparation must build fixed products instead of random collation');
  assert.match(app,/30-card Half Deck|Half Deck/,'shop/opening copy identifies the Trainer Kit product correctly');
  assert.match(app,/fixed-product|half-deck-product/,'sealed product has a non-booster presentation hook');
  assert.match(css,/\.pack-instruction[^\n]*(?:margin-top|padding-top)|\.pack-stage-header|pack-instruction[\s\S]{0,200}margin:\s*(?:5[0-9]|6[0-9])px/,'instruction is vertically separated from the absolute Shop button');
});

test('fixed Trainer Kit collection identities never merge into the source HGSS artwork cards',()=>{
  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(app,/if\(card\?\._fixedProduct\)return null/,'a fixed deck pull must bypass legacy physical-card merging');
  assert.match(app,/if\(owned\?\._fixedProduct\)continue/,'a later HGSS pull must not merge into an owned fixed deck position');
  assert.match(app,/old\._fixedProduct=true/,'fixed-product identity metadata must persist in the collection');
  assert.match(app,/old\._fixedProductPosition=c\._fixedProductPosition/,'the printed half-deck position must persist');
});
