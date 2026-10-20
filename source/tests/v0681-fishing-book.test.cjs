'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
global.window=global;
delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];
const F=require('../app/src/main/assets/arcade-fishing.js');

test('Angler log search never reveals an uncaught Pokemon name',()=>{
  const rows=[
    {kind:'pokemon',dex:7,name:'Squirtle',known:false,rarity:'common',count:0,largest:0,bestValue:0},
    {kind:'pokemon',dex:129,name:'Magikarp',known:true,rarity:'common',count:3,largest:1.1,bestValue:120}
  ];
  assert.deepEqual(F.filterBookRows(rows,{query:'Squirtle'}),[],'hidden names are not searchable');
  assert.equal(F.filterBookRows(rows,{query:'#7'}).length,1,'Dex number search still locates silhouettes');
  assert.equal(F.filterBookRows(rows,{query:'magi'}).length,1,'known names are searchable');
});

test('Angler log filters caught state/category and sorts by size/value/count',()=>{
  const rows=[
    {kind:'pokemon',dex:129,name:'Magikarp',known:true,rarity:'common',count:8,largest:1.2,bestValue:90},
    {kind:'pokemon',dex:131,name:'Lapras',known:true,rarity:'very-rare',count:2,largest:2.8,bestValue:900},
    {kind:'junk',name:'Rusty Bike',known:true,count:1,bestValue:0}
  ];
  assert.deepEqual(F.filterBookRows(rows,{category:'pokemon',status:'caught',sort:'largest'}).map(x=>x.name),['Lapras','Magikarp']);
  assert.deepEqual(F.filterBookRows(rows,{category:'pokemon',status:'caught',sort:'best-value'}).map(x=>x.name),['Lapras','Magikarp']);
  assert.deepEqual(F.filterBookRows(rows,{status:'caught',sort:'count'}).map(x=>x.name),['Magikarp','Lapras','Rusty Bike']);
});
