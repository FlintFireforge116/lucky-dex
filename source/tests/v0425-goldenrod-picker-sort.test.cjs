'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=name=>path.join(ROOT,'app/src/main/assets',name);
function load(){
  global.LuckyDexGoldenrodCore=require(asset('arcade-goldenrod-core.js'));
  global.LuckyDexGoldenrodState=require(asset('arcade-goldenrod-state.js'));
  global.LuckyDexGoldenrodAdapters={get:()=>null};
  const p=asset('arcade-goldenrod.js');delete require.cache[require.resolve(p)];return require(p);
}

test('shared Goldenrod picker exposes event-specific relevant-stat sort labels',()=>{
  const G=load();
  const expected={speed:'Speed',attack:'Attack',defense:'Defense',spAtk:'Sp. Atk'};
  for(const [statKey,label] of Object.entries(expected)){
    const options=G.participantSortOptions(statKey);
    assert.equal(options[0].value,'stat-desc');
    assert.equal(options[0].label,`${label} · highest`);
    assert.equal(options[1].value,'stat-asc');
    assert.equal(options[1].label,`${label} · lowest`);
    assert.ok(options.some(o=>o.value==='level-desc'&&o.label==='Level · highest'));
    assert.ok(options.some(o=>o.value==='name-asc'&&o.label==='Name · A–Z'));
    assert.ok(options.some(o=>o.value==='name-desc'&&o.label==='Name · Z–A'));
    assert.ok(options.some(o=>o.value==='dex-asc'&&o.label==='Pokédex No.'));
  }
});

test('competitive picker groups eligible Pokémon first and then applies the chosen sort',()=>{
  const G=load();
  const rows=[
    {key:'a',id:1,name:'Bulbasaur',baseStat:65,level:8,eligibility:{eligible:true}},
    {key:'b',id:2,name:'Ivysaur',baseStat:80,level:20,eligibility:{eligible:false}},
    {key:'c',id:3,name:'Venusaur',baseStat:75,level:4,eligibility:{eligible:true}},
    {key:'d',id:4,name:'Charmander',baseStat:90,level:30,eligibility:{eligible:false}}
  ];
  assert.deepEqual(G.sortParticipantRows(rows,{sortKey:'stat-desc',competitive:true}).map(r=>r.key),['c','a','d','b']);
  assert.deepEqual(G.sortParticipantRows(rows,{sortKey:'name-asc',competitive:true}).map(r=>r.key),['a','c','d','b']);
});

test('shared picker search matches Pokémon name or Pokédex number',()=>{
  const G=load();
  const rows=[
    {key:'a',id:74,name:'Geodude',baseStat:30,level:7,eligibility:{eligible:true}},
    {key:'b',id:524,name:'Roggenrola',baseStat:25,level:9,eligibility:{eligible:true}},
    {key:'c',id:46,name:'Paras',baseStat:45,level:5,eligibility:{eligible:true}}
  ];
  assert.deepEqual(G.sortParticipantRows(rows,{query:'geo',sortKey:'dex-asc'}).map(r=>r.name),['Geodude']);
  assert.deepEqual(G.sortParticipantRows(rows,{query:'524',sortKey:'dex-asc'}).map(r=>r.name),['Roggenrola']);
});

test('Goldenrod participant screen renders shared search and sort controls with responsive styling',()=>{
  const js=fs.readFileSync(asset('arcade-goldenrod.js'),'utf8');
  const css=fs.readFileSync(asset('arcade-goldenrod.css'),'utf8');
  assert.match(js,/data-goldenrod-participant-search/);
  assert.match(js,/data-goldenrod-participant-sort/);
  assert.match(js,/participantSortOptions/);
  assert.match(css,/goldenrod-participant-tools/);
  assert.match(css,/goldenrod-participant-search/);
  assert.match(css,/goldenrod-participant-sort/);
});
