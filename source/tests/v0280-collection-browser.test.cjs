'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/collection-trade-v0167.css'),'utf8');
const browserPath=path.join(root,'app/src/main/assets/collection-browser-v0280.js');
assert.ok(fs.existsSync(browserPath),'v0.28.0 collection browser module should exist');
const api=require(browserPath);

assert.match(html,/id="cardBinderSourceTabs"[^>]*>[\s\S]*data-binder-source="tcg"[\s\S]*data-binder-source="tcgp"/,'Card Binder should expose separate TCG and TCGP tabs');
assert.match(html,/id="collectionSort"/,'Card Binder should expose a proper sort selector');
assert.match(html,/id="collectionSortDir"/,'Card Binder should expose reversible sort direction');
assert.match(html,/collection-browser-v0280\.js/,'collection browser module should load in the app');
assert.match(css,/\.binder-source-tabs-v0280/,'collection tabs should have dedicated phone-first styling');
assert.match(css,/\.collection-tools-v0280/,'search and sort controls should have dedicated layout styling');

const cards=[
  {id:'tcg-2',name:'Pikachu',source:'tcg',setId:'base1',setName:'Base Set',localId:'58',rarity:'Common',count:3,setRelease:'1999-01-09'},
  {id:'tcg-1',name:'Charizard',source:'tcg',setId:'base1',setName:'Base Set',localId:'4',rarity:'Rare Holo',count:1,setRelease:'1999-01-09'},
  {id:'A1-001',name:'Bulbasaur',source:'tcgp',setId:'A1',setName:'Genetic Apex',localId:'1',rarity:'◊',count:2,setRelease:'2024-10-30'},
  {id:'A1-036',name:'Pikachu ex',source:'tcgp',setId:'A1',setName:'Genetic Apex',localId:'36',rarity:'◊◊◊◊',count:1,setRelease:'2024-10-30'}
];
assert.deepEqual(api.filterCards(cards,{source:'tcg',query:'base set'}).map(x=>x.id),['tcg-2','tcg-1'],'search should match set names');
assert.deepEqual(api.filterCards(cards,{source:'tcgp',query:'36'}).map(x=>x.id),['A1-036'],'search should match card numbers');
assert.deepEqual(api.filterCards(cards,{source:'tcg',query:'pikachu'}).map(x=>x.id),['tcg-2'],'source tabs should isolate physical TCG from Pocket');
assert.deepEqual(api.sortCards(cards.filter(x=>x.source==='tcg'),'number','asc').map(x=>x.id),['tcg-1','tcg-2'],'card-number sort should be numeric');
assert.deepEqual(api.sortCards(cards.filter(x=>x.source==='tcg'),'quantity','desc').map(x=>x.id),['tcg-2','tcg-1'],'quantity sort should work');
assert.deepEqual(api.sortCards(cards,'releaseDate','desc').map(x=>x.id).slice(0,2),['A1-001','A1-036'],'release-date sort should place newer Pocket cards first');
console.log('PASS v0.28.0 Collection TCG/TCGP tabs, search and sort');
