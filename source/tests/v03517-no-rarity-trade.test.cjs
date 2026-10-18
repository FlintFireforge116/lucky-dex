'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const R=require('../app/src/main/assets/card-rarity-v0253.js');
const A=require('../app/src/main/assets/card-acquisition-v0246.js');

const dragonSet={id:'DRV',name:'Dragon Vault',source:'tcg'};
const shelgon={id:'DRV-7',name:'Shelgon',number:'7',localId:'7',rarity:'No Rarity',source:'tcg',set:dragonSet,setId:'DRV',setName:'Dragon Vault'};
const mcdSet={id:'MCD22',name:"McDonald's Collection 2022",source:'tcg'};
const tynamo={id:'MCD22-10',name:'Tynamo',number:'10',localId:'10',rarity:'No Rarity',source:'tcg',set:mcdSet,setId:'MCD22',setName:mcdSet.name};
const holoMcd={...tynamo,id:'MCD22-10-holo',_foil:'Confetti Holo'};
const ordinaryNoRarity={id:'odd-1',name:'Oddball',rarity:'No Rarity',source:'tcg',set:{id:'odd',name:'Odd Set'},setId:'odd',setName:'Odd Set'};
const uncommon={id:'set-2',name:'Normal Uncommon',rarity:'Uncommon',source:'tcg',set:{id:'set',name:'Normal Set'},setId:'set',setName:'Normal Set'};

// Regression: explicit no-rarity cards must never silently inherit Uncommon's numeric trade tier.
assert.equal(R.tradeClass(shelgon,dragonSet),'tcg:dragon-vault-holo','Dragon Vault 1-20 must trade as their own all-holo special class');
assert.equal(R.tradeClass(tynamo,mcdSet),'tcg:mcdonalds-promo','McDonald\'s non-holo mini-pack cards must trade as promotional product cards, not Uncommon');
assert.equal(R.tradeClass(holoMcd,mcdSet),'tcg:mcdonalds-confetti-holo','McDonald\'s confetti holo prints must remain distinct from normal promotional prints');
assert.equal(R.tradeClass(ordinaryNoRarity,ordinaryNoRarity.set),'tcg:no-rarity','other explicit No Rarity cards must fail closed into an exact no-rarity class');
assert.notEqual(R.tradeClass(shelgon,dragonSet),R.tradeClass(uncommon,uncommon.set),'Dragon Vault holo can never match an Uncommon');
assert.notEqual(R.tradeClass(tynamo,mcdSet),R.tradeClass(uncommon,uncommon.set),'McDonald\'s promo can never match an Uncommon');
assert.equal(R.tradeClassLabel('tcg:dragon-vault-holo'),'Dragon Vault Holofoil');
assert.equal(R.tradeClassLabel('tcg:mcdonalds-promo'),"McDonald's Promo");
assert.equal(R.tradeClassLabel('tcg:mcdonalds-confetti-holo'),"McDonald's Confetti Holo");

// Trade UI must use those semantics too, invalidate old cached rows, and show useful labels on the cards.
const source=fs.readFileSync(path.join(root,'app/src/main/assets/trade-v0163.js'),'utf8');
const state={cards:{},stats:{trades:0},trade:{openedSets:{},boards:{},totalTrades:0}};
const context={console,setTimeout,clearTimeout,setInterval,clearInterval,window:null,document:{getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}},localStorage:{setItem(){}},state,setCache:{tcg:[],tcgp:[]},cachedSetV13(){return null},rarityTier:r=>R.tier(r),escapeHtml:s=>String(s??''),save(){},showToast(){},collectionMode:'cards',renderCollection(){},checkCardMilestones(){},LuckyDexCardRarity:R,LuckyDexCardAcquisition:A};
context.window=context;vm.createContext(context);vm.runInContext(source,context,{filename:'trade-v0163.js'});
const T=context.LuckyDexTrade._test;
assert.equal(T.tradeRarityClass(shelgon), 'tcg:dragon-vault-holo');
assert.equal(T.tradeRarityClass(tynamo), 'tcg:mcdonalds-promo');
assert.equal(T.tradeDealClass({offer:shelgon,request:uncommon})[0],'risky','string-vs-numeric physical rarity classes must be treated as a mismatch, never matched rarity');
assert.match(source,/MARKET_VERSION\s*=\s*'v0405-exact-physical-rarity'/,'trade cache must invalidate older broad-tier physical rarity listings');
assert.equal(typeof T.tradeCardRarityLabel,'function','trade card display label must be regression-testable');
assert.equal(T.tradeCardRarityLabel(shelgon),'Dragon Vault Holofoil');
assert.equal(T.tradeCardRarityLabel(tynamo),"McDonald's Promo");
assert.equal(T.tradeCardRarityLabel(holoMcd),"McDonald's Confetti Holo");
assert.equal(typeof T.normalizeTradeCard,'function','trade normalization must preserve finish metadata for value classes');
const normalizedHolo=T.normalizeTradeCard(holoMcd,mcdSet,'tcg');
assert.equal(normalizedHolo._foil,'Confetti Holo');
assert.equal(T.tradeRarityClass(normalizedHolo),'tcg:mcdonalds-confetti-holo',"normalization must not collapse McDonald's holo into the non-holo promo class");

console.log('PASS v0.35.17 physical no-rarity trade semantics');
