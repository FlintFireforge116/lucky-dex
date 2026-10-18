'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const T=require('../app/src/main/assets/adventure/adventure-tools.js');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
const F=require('../app/src/main/assets/adventure/adventure-location-flow.js');
const M=require('../app/src/main/assets/adventure/adventure-model.js');
const R=require('../app/src/main/assets/card-rarity-v0253.js');

const fresh=()=>({pokemon:{'1:n':{...S.byId[1],level:5,count:1}},team:['1:n'],profile:{coins:1000,xp:2400},inventory:{potion:5,pokeball:20,berry:2,premierball:0},stats:{}});

function at(region,nodeId){
  const s=fresh(),j=E.start(s,region,17),n=j.nodes.find(row=>row.id===nodeId);
  j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';j.location=n.name;delete j.locationFlow;
  return {s,j,n};
}

test('Mart quantity adjustment keeps the Mart screen and clamps quantity',()=>{
  assert.equal(typeof T.adjustQuantity,'function');
  const opts={quantities:{pokeball:1}};
  assert.deepEqual(T.adjustQuantity(opts,'pokeball',10),{...opts,quantities:{pokeball:11}});
  assert.equal(T.adjustQuantity({quantities:{pokeball:99}},'pokeball',10).quantities.pokeball,99);
  assert.equal(T.adjustQuantity({quantities:{pokeball:1}},'pokeball',-1).quantities.pokeball,1);
});

test('Poké Mart content scrolls on ordinary phone-height screens',()=>{
  const css=read('app/src/main/assets/adventure/adventure-tools.css');
  assert.match(css,/\.a3-tools-content\{[^}]*overflow-y:auto/s);
  assert.doesNotMatch(css,/\.a3-tools-content\{[^}]*overflow:hidden/s);
});

test('Route 30 has a one-time local Explore Area action instead of being empty',()=>{
  const {s,j}=at('johto','johto-c0-s3');
  assert.equal(F.describe(j).name,'Route 30');
  let row=F.actionsFor(s,j).find(x=>x.key==='explore-local');
  assert(row);assert.equal(row.label,'EXPLORE AREA');
  const before={coins:s.profile.coins,pokeball:s.inventory.pokeball,berry:s.inventory.berry,potion:s.inventory.potion};
  const out=F.perform(s,'explore-local');
  assert.equal(out.applied,true);
  const after={coins:s.profile.coins,pokeball:s.inventory.pokeball,berry:s.inventory.berry,potion:s.inventory.potion};
  assert.notDeepEqual(after,before,'local exploration should actually find a small item/reward');
  assert.match(F.feedbackFor(j),/Found|picked up|discovered/i);
  row=F.actionsFor(s,j).find(x=>x.key==='explore-local');
  assert.equal(row,undefined,'the same route segment cannot be farmed repeatedly in one traversal');
});

test('Wild Hunt chain grows when a wild Pokémon is caught or fainted and only breaks on flee/loss',()=>{
  const save={adventureV2:{destinations:{meadow:{chain:4}}}};
  const v=M.ensureState(save);
  assert.equal(M.updateFieldChain(v,'meadow','victory'),5);
  assert.equal(M.updateFieldChain(v,'meadow','capture'),6);
  assert.equal(M.updateFieldChain(v,'meadow','fled'),0);
  M.updateFieldChain(v,'meadow','capture');
  assert.equal(M.updateFieldChain(v,'meadow','loss'),0);
});

test('Card Binder installs a direct collection-mode switch so stale Pokédex rendering cannot win the click race',()=>{
  const source=read('app/src/main/assets/collection-browser-v0280.js');
  assert.match(source,/function switchCollectionMode\(/);
  assert.match(source,/btn\.onclick=\(\)=>switchCollectionMode\(/);
  assert.match(source,/clearGrid\(grid\)/);
});

test('physical TCG trades do not call Illustration Rare and Ultra/Radiant Rare the same rarity',()=>{
  const deoxys={id:'cz-gg46',name:'Deoxys VSTAR',source:'tcg',rarity:'Trainer Gallery Holo Rare V',setId:'cz',setName:'Crown Zenith'};
  const eternatus={id:'cz-105',name:'Radiant Eternatus',source:'tcg',rarity:'Radiant Rare',setId:'cz',setName:'Crown Zenith'};
  assert.equal(R.classify(deoxys).rarityClass,'illustration');
  assert.equal(R.classify(eternatus).rarityClass,'ultra');
  assert.notEqual(R.tradeClass(deoxys),R.tradeClass(eternatus));
  assert.equal(R.tradeClassLabel(R.tradeClass(deoxys)),'Illustration Rare');
  assert.equal(R.tradeClassLabel(R.tradeClass(eternatus)),'Ultra / Radiant Rare');
  const trade=read('app/src/main/assets/trade-v0163.js');
  assert.match(trade,/MARKET_VERSION\s*=\s*'v0405-exact-physical-rarity'/);
});
