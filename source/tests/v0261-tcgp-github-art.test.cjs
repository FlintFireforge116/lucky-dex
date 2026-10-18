'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const assets=path.join(ROOT,'app/src/main/assets');
const pocketSrc=fs.readFileSync(path.join(assets,'tcgp-source-v0160.js'),'utf8');
const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');

assert.match(pocketSrc,/FlintFireforge116\/lucky-dex\/main\/tcgp-card-index\.json/,
  'Pocket must use a complete LuckyDex GitHub index, mirroring the physical card catalogue');
assert.match(pocketSrc,/PocketDecks\/pokemon-tcg-pocket-cards/,
  'Pocket exact card/pack artwork must be backed by the validated PocketDecks GitHub catalogue');

const context={
  window:{},
  globalThis:{},
  navigator:{onLine:true},
  localStorage:{getItem(){return null;},setItem(){}},
  indexedDB:{open(){throw new Error('not needed in mapping test');}},
  fetch:async()=>{throw new Error('network not expected in mapping test');},
  AbortController,
  DOMException,
  setTimeout,
  clearTimeout,
  console,
};
context.globalThis=context.window;
vm.createContext(context);
vm.runInContext(pocketSrc,context,{filename:'tcgp-source-v0160.js'});
const Pocket=context.window.LuckyDexPocket;
assert.ok(Pocket,'Pocket runtime should initialise');
assert.equal(typeof Pocket.cardFromIndexRecord,'function','Pocket index records need a deterministic card mapper');
assert.equal(typeof Pocket.setFromIndexRow,'function','Pocket index rows need a deterministic set mapper');

const exactArt='https://raw.githubusercontent.com/PocketDecks/pokemon-tcg-pocket-cards/refs/heads/main/images/webp/cards/a2b/005.webp';
const card=Pocket.cardFromIndexRecord(['A2b-005','5','Sprigatito','One Diamond',exactArt,'Shining'],{id:'A2b',name:'Shining Revelry'});
assert.equal(card.image,exactArt,'Pocket card image must stay the exact GitHub image URL');
assert.equal(card.name,'Sprigatito');
assert.equal(card.source,'tcgp');
assert.equal(card._artIdentityVerified,true,'Pocket GitHub index art is identity-verified');

const packArt='https://raw.githubusercontent.com/PocketDecks/pokemon-tcg-pocket-cards/refs/heads/main/images/webp/packs/a2b-booster.webp';
const set=Pocket.setFromIndexRow({id:'A2b',name:'Shining Revelry',releaseDate:'2025-03-27',packSize:5,cards:[['A2b-005','5','Sprigatito','One Diamond',exactArt,'Shining']],packs:[{name:'Booster',art:packArt}]});
assert.equal(set.boosters[0].artwork_front,packArt,'Pocket sealed pack must receive exact corresponding booster art');
assert.equal(set.cards[0].image,exactArt,'hydrated Pocket set must contain exact card artwork');

const renderStart=app.indexOf('async function renderSealedPack');
assert.ok(renderStart>=0,'sealed pack renderer must exist');
const renderBody=app.slice(renderStart,renderStart+2600);
assert.match(renderBody,/source\s*===\s*['"]tcgp['"][\s\S]*boosters|boosters[\s\S]*source\s*===\s*['"]tcgp['"]/,
  'Pocket sealed packs must prefer Pocket pack artwork rather than the physical resolver');

console.log('PASS v0.26.1 Pocket GitHub catalogue + exact card/pack artwork contract');
