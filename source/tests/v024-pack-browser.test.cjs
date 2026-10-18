'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/pack-flow-v0165.js'),'utf8');
function ctx(){
  const context={console,window:null,state:{cards:{},ui:{packBrowser:{sortKey:'releaseDate',sortDir:'desc'},packMetrics:{},keepMe:7},settings:{}},setCache:{tcg:[],tcgp:[]},document:{getElementById(){return null;}},LuckyDexDebug:{},LuckyDexPack:{dateValue:v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null;},placeholder:()=>''},escapeHtml:String,AbortController,URL,setTimeout,clearTimeout,Promise,Date};
  context.window=context;vm.createContext(context);vm.runInContext(source,context,{filename:'pack-flow-v0165.js'});return context;
}
const sets=[
  {id:'zeta',name:'Zeta Set',releaseDate:'2020-01-01',cardCount:{total:100}},
  {id:'alpha',name:'Alpha Set',releaseDate:'2024-01-01',cardCount:{total:50}},
  {id:'mystery',name:'Mystery Set',releaseDate:null,cardCount:{}},
];
{
  const c=ctx();c.setCache.tcg=sets;
  c.state.cards.a1={id:'a1',name:'A',setId:'alpha',setName:'Alpha Set',setTotal:50,source:'tcg',count:1};
  c.state.cards.a2={id:'a2',name:'B',setId:'alpha',setName:'Alpha Set',setTotal:50,source:'tcg',count:2};
  c.state.ui.packMetrics['tcg:alpha']={packsOpened:3,lastOpened:300};
  c.state.ui.packMetrics['tcg:zeta']={packsOpened:1,lastOpened:100};
  const B=c.LuckyDexPackBrowser;
  assert.ok(B,'Pack Browser model is exported');
  assert.deepEqual(Array.from(B.rows('tcg','alp','name','asc')).map(x=>x.id),['alpha'],'search matches set name case-insensitively');
  assert.deepEqual(Array.from(B.rows('tcg','ZET','name','asc')).map(x=>x.id),['zeta'],'search matches set id/code case-insensitively');
  assert.deepEqual(Array.from(B.rows('tcg','','releaseDate','desc')).map(x=>x.id),['alpha','zeta','mystery'],'newest first with unknown deterministic last');
  assert.deepEqual(Array.from(B.rows('tcg','','releaseDate','asc')).map(x=>x.id),['mystery','zeta','alpha'],'ascending reverses release-date ordering deterministically');
  assert.deepEqual(Array.from(B.rows('tcg','','name','asc')).map(x=>x.id),['alpha','mystery','zeta'],'name ascending A-Z');
  assert.deepEqual(Array.from(B.rows('tcg','','name','desc')).map(x=>x.id),['zeta','mystery','alpha'],'name descending Z-A');
  assert.deepEqual(Array.from(B.rows('tcg','','setSize','desc')).map(x=>x.id),['zeta','alpha','mystery'],'set-size numeric sort works');
  assert.equal(B.metrics(sets[1],'tcg').owned,2);assert.equal(B.metrics(sets[1],'tcg').total,50);assert.equal(B.metrics(sets[1],'tcg').completion,0.04);
  assert.deepEqual(Array.from(B.rows('tcg','','packsOpened','desc')).map(x=>x.id),['alpha','zeta','mystery'],'packs-opened sort uses persisted metrics and zero fallback');
  assert.deepEqual(Array.from(B.rows('tcg','','recentlyOpened','desc')).map(x=>x.id),['alpha','zeta','mystery'],'recently-opened sort uses persisted timestamps and null fallback');
  assert.equal(B.metrics(sets[2],'tcg').packsOpened,0);assert.equal(B.metrics(sets[2],'tcg').lastOpened,null,'missing metadata never drops a set');
  B.recordOpen(sets[1],'tcg',500);assert.equal(c.state.ui.packMetrics['tcg:alpha'].packsOpened,4);assert.equal(c.state.ui.packMetrics['tcg:alpha'].lastOpened,500,'real pack metrics increment once per record');
}
const appSource=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
assert.match(appSource,/ui:\s*\{[^}]*packBrowser/s,'default state contains pack browser preferences');
assert.match(appSource,/ui:\s*\{\.\.\.base\.ui,\.\.\.\(raw\.ui\|\|\{\}\)/s,'loadState deep-merges UI state');
assert.match(appSource,/__origCommitPreparedPackV62\(\);[\s\S]{0,500}LuckyDexPackBrowser\?\.recordOpen/,'real committed packs record pack metrics after commit');

const html=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8');
for(const id of ['packSetSearch','packSortKey','packSortDir','packSetBrowser','setSelect']) assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,`${id} exists exactly once`);
assert.match(html,/id="setSelect"[^>]*class="[^"]*pack-set-select-compat/,'native set select remains as hidden compatibility control');
assert.match(source,/select\.value=id;[\s\S]{0,180}dispatchEvent/,'browser-row selection synchronizes the authoritative native select through its change path');
assert.match(source,/renderPackSetBrowser\(source\)/,'catalogue/source updates rerender the visible set browser');
assert.match(source,/packSortDir[\s\S]{0,500}aria-label|aria-label[\s\S]{0,500}packSortDir/,'sort direction exposes accessible direction state');

console.log('PASS v0.24 Pack Browser model, search/sort, metrics and DOM sync');
