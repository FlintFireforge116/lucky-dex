'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const Pack=require('../app/src/main/assets/pack-policy-v0343.js');
globalThis.LuckyDexPackPolicy=Pack;
const BoosterArt=require('../app/src/main/assets/booster-art-v0260.js');
globalThis.LuckyDexBoosterArt=BoosterArt;
const Acquisition=require('../app/src/main/assets/card-acquisition-v0246.js');
const Ach=require('../app/src/main/assets/achievements-v0341.js');
const Opening=require('../app/src/main/assets/pack-opening-v0160.js');

test('physical Pack Shop policy exposes genuine boosters only',()=>{
  const trainer={id:'library:TK4G',_libraryKey:'TK4G',name:'HS Trainer Kit—Gyarados',cardCount:{total:30},releaseDate:'2010-05-01'};
  const southern={id:'si1',name:'Southern Islands',cardCount:{total:18},releaseDate:'2001-07-31'};
  const vault={id:'dv1',name:'Dragon Vault',cardCount:{total:21},releaseDate:'2012-10-05'};
  const jungle={id:'base2',name:'Jungle',cardCount:{total:64},releaseDate:'1999-06-16'};

  assert.equal(Pack.resolve(trainer,'tcg').productKind,'half-deck');
  assert.equal(Pack.resolve(trainer,'tcg').purchasable,false,'fixed half-decks must not be sold as boosters');
  assert.equal(Pack.resolve(southern,'tcg').purchasable,false,'fixed collection products must not be sold as boosters');
  assert.equal(Pack.resolve(vault,'tcg').productKind,'booster');
  assert.equal(Pack.resolve(vault,'tcg').purchasable,true);
  assert.equal(Pack.resolve(jungle,'tcg').productKind,'booster');
  assert.equal(Acquisition.boosterProductEligible(trainer,'tcg'),false);
  assert.equal(Acquisition.boosterProductEligible(southern,'tcg'),false);
  assert.equal(Acquisition.boosterProductEligible(vault,'tcg'),true);
  for(const row of [
    {name:'Pokémon Rumble',releaseDate:'2009-12-02'},
    {name:'Pokémon Trading Card Game Classic—Blastoise',releaseDate:'2023-11-16'},
    {name:'Sun & Moon Energy (Team Up)',releaseDate:'2019-02-01'},
    {name:'Radiant Collection',releaseDate:'2013-11-06'}
  ])assert.equal(Pack.resolve(row,'tcg').purchasable,false,`${row.name} must not seep into Pack Shop`);
});

test('physical Pack Shop fails closed while audited policy or bundled-art resolver is unavailable',()=>{
  const savedPolicy=globalThis.LuckyDexPackPolicy,savedArt=globalThis.LuckyDexBoosterArt;
  try{
    delete globalThis.LuckyDexPackPolicy;
    assert.equal(Acquisition.boosterProductEligible({id:'base2',name:'Jungle',releaseDate:'1999-06-16'},'tcg'),false);
    globalThis.LuckyDexPackPolicy=savedPolicy;delete globalThis.LuckyDexBoosterArt;
    assert.equal(Acquisition.boosterProductEligible({id:'base2',name:'Jungle',releaseDate:'1999-06-16'},'tcg'),false);
  }finally{globalThis.LuckyDexPackPolicy=savedPolicy;globalThis.LuckyDexBoosterArt=savedArt;}
});

test('Pack Shop and buried-booster discovery use booster product eligibility, not loose set eligibility',()=>{
  const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(flow,/boosterProductEligible\?\.\(set,'tcg'\)===true/,'shop filtering must fail closed through the product-level booster gate');
  assert.match(app,/boosterProductEligible\?\.\(set,'tcg'\)===true/,'excavated sealed boosters must fail closed through the same product-level gate');
  assert.match(flow,/boosterProductEligible\?\.\(initialSet,'tcg'\)!==true/,'purchase boundary must re-check stale/cached selections before construction');
});

test('hard physical-TCG collection achievements award the two HS Half Decks',()=>{
  const state={cards:{}};
  for(let i=0;i<500;i++)state.cards[`tcg-${i}`]={id:`tcg-${i}`,source:'tcg'};
  for(let i=0;i<700;i++)state.cards[`tcgp-${i}`]={id:`tcgp-${i}`,source:'tcgp'};
  const rows=Ach.buildCoreAchievements(()=>state);
  const g=rows.find(a=>a.id==='tcg_unique_500_gyarados_half_deck');
  const r=rows.find(a=>a.id==='tcg_unique_1000_raichu_half_deck');
  assert.ok(g,'500-card physical collection reward must exist');
  assert.ok(r,'1000-card physical collection reward must exist');
  assert.deepEqual(g.progress(),[500,500]);
  assert.deepEqual(r.progress(),[500,1000]);
  assert.equal(g.reward.fixedProduct,'TK4G');
  assert.equal(r.reward.fixedProduct,'TK4R');
  assert.match(g.reward.fixedProductName,/Gyarados/);
  assert.match(r.reward.fixedProductName,/Raichu/);

  const source=fs.readFileSync(path.join(root,'app/src/main/assets/achievements-v0341.js'),'utf8');
  assert.match(source,/fixedProductName/,'achievement reward copy must surface the Half Deck reward');
  assert.match(source,/grantFixedProductReward/,'claiming a Half Deck achievement must grant its fixed contents');
});


test('fixed Half Deck reward merge adds all 30 deck positions without counting them as booster pulls',()=>{
  const Fixed=require('../app/src/main/assets/fixed-products-v03514.js');
  const cards=Array.from({length:30},(_,i)=>({id:`TK4G-${i+1}`,name:i===29?'Gyarados':'Deck Card',localId:String(i+1),rarity:'No Rarity',source:'tcg',setId:'library:TK4G',setName:'HS Trainer Kit—Gyarados',setTotal:30,_fixedProduct:true,_fixedProductCode:'TK4G',_fixedProductPosition:i+1}));
  const collection={'TK4G-1':{...cards[0],count:2,firstPulled:1}};
  const result=Fixed.grantToCollection(collection,cards,12345);
  assert.equal(result.copies,30);
  assert.equal(result.newCards,29);
  assert.equal(collection['TK4G-1'].count,3,'existing fixed-product cards gain one reward copy');
  assert.equal(collection['TK4G-30'].count,1);
  assert.equal(collection['TK4G-30']._fixedProduct,true);
  assert.equal(collection['TK4G-30']._fixedProductCode,'TK4G');
  assert.equal(collection['TK4G-30'].firstPulled,12345);
  assert.equal(collection['TK4G-30']._achievementReward,undefined,'deck cards stay in their real Trainer Kit set and spare copies remain dustable');
});

test('Dragon Vault reveal uses HOLOFOIL without repeating No Rarity beneath it',()=>{
  globalThis.LuckyDexCardRarity=require('../app/src/main/assets/card-rarity-v0253.js');
  const card={id:'dv1-1',name:'Dratini',number:'1',localId:'1',rarity:'No Rarity',set:{id:'dv1',name:'Dragon Vault'}};
  const profile=Opening.profileFor(card);
  assert.equal(profile.label,'HOLOFOIL');
  assert.equal(profile.secondaryLabel,'','explicit No Rarity must not be repeated in reveal copy');
  const secret=Opening.profileFor({id:'dv1-21',name:'Kyurem',number:'21',localId:'21',rarity:'Rare Holo',set:{id:'dv1',name:'Dragon Vault'}});
  assert.equal(secret.label,'SECRET RARE');
  const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
  assert.match(flow,/function packSummaryLabelV03515/);
  assert.ok(flow.includes('/^no rarity$/i'),'pack summary must hide the raw No Rarity label too');
  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  const modalBodies=[...app.matchAll(/async function openCardModal\(card\)\{([\s\S]*?)\n\}/g)].map(match=>match[1]);
  assert.ok(modalBodies.length>=1,'card modal renderer must exist');
  assert.ok(modalBodies.every(body=>body.includes('cardDisplayRarityV03515')),'every active async card modal renderer must suppress raw No Rarity');
});

test('Dragon Vault wrapper upgrade is case-safe and the APK build refuses the low-resolution fallback',()=>{
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  assert.match(gradle,/1niceroli\/ptcg-assets\/main\/dv1\/packshots\/ray\.webp/,'build must materialize the audited high-resolution Dragon Vault packshot');
  assert.match(gradle,/EXPECTED_DRAGON_VAULT_BYTES\s*=\s*210014L/,'build must require the exact audited Dragon Vault asset size');
  assert.match(gradle,/b21c12cb6766ae7c6bf21a194851cad954aea1a3/,'build must verify the exact audited Git blob SHA-1');
  assert.match(gradle,/1\.\.3/,'asset fetch should retry transient network failures before failing the build');
  assert.match(gradle,/refusing low-resolution fallback/,'failed high-resolution materialization must fail closed');
  assert.doesNotMatch(gradle,/legacy fallback will be used/,'build must not silently package the old 109x199 wrapper');
  const art=require('../app/src/main/assets/booster-art-v0260.js');
  const expected='authentic-pack-art/dragon-vault-ray.webp';
  assert.equal(art.directPath({id:'dv1',name:'Dragon Vault'}),expected);
  assert.equal(art.directPath({id:'library:DV1',_libraryKey:'DV1',name:'Dragon Vault'}),expected,'uppercase library keys must still hit authentic overrides');
  assert.equal(art.directPath({id:'library:unknown',name:'Dragon Vault'}),expected,'name-only catalogue rows must also hit the authentic override');
  assert.equal(art.runtimeFallback({id:'library:DV1',name:'Dragon Vault'}),'','Dragon Vault must never fall back to the obsolete 109x199 thumbnail');
  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  assert.ok((app.match(/runtimeFallback\?\./g)||[]).length>=2,'sealed opener and saved sealed boosters must use the safe runtime fallback policy');
});

test('Pack Flow grants fixed Half Deck rewards directly into the card collection without opening a booster',()=>{
  const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
  assert.match(flow,/async function grantFixedProductRewardV03515\(/,'Pack Flow needs a dedicated fixed-product reward path');
  assert.match(flow,/fixedProductCardsV03514\(/,'reward path must build the authentic fixed deck contents');
  assert.match(flow,/grantToCollection\?\.\(state\.cards,built\.cards/,'reward path must merge all fixed deck positions into the binder');
  assert.match(flow,/grantFixedProductReward:grantFixedProductRewardV03515/,'achievement system must be able to call the reward path');
});
