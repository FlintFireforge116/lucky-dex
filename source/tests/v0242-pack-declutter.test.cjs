'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/styles-v013.css'),'utf8');
const flow=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/pack-flow-v0165.js'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');

// Accordion selector: selected set is always visible; the full search/sort list opens on demand.
for(const id of ['packSetAccordionToggle','packSelectedSetName','packSetAccordionPanel']){
  assert.equal((html.match(new RegExp(`id="${id}"`,'g'))||[]).length,1,`${id} exists exactly once`);
}
assert.match(html,/id="packSetAccordionPanel"[^>]*hidden/,'set browser panel starts collapsed');
assert.match(flow,/packSetAccordionToggle[\s\S]{0,1200}packSetAccordionPanel/,'pack flow owns accordion open/close state');
assert.match(flow,/button\.dataset\.packSetId[\s\S]{0,500}packSetAccordionPanel/,'selecting a set closes the accordion');
assert.match(flow,/set-picker-open/,'accordion toggles a selector-card state so pack-opening controls can yield space while browsing sets');
assert.match(css,/\.pack-selector-card\.set-picker-open[\s\S]{0,240}\.pack-open-main[^}]*display:\s*none/s,'expanded set picker temporarily hides pack format\/price\/open controls instead of cramming the list into a tiny strip');
assert.match(css,/\.pack-set-accordion\.open\s*\{[^}]*flex:\s*1\s+1\s+auto[^}]*grid-template-rows:\s*auto\s+minmax\(0,1fr\)/s,'expanded accordion takes the available selector-card height instead of a tiny fixed strip');
assert.match(css,/\.pack-set-browser\s*\{[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/s,'expanded accordion scrolls its full set list internally when necessary');

// Pack format is intentionally compact: title only, no content recipe or giant count badge.
assert.doesNotMatch(html,/id="packFormatCopy"/,'pack rarity recipe copy removed from Packs home');
assert.doesNotMatch(html,/id="packCountBadge"/,'large yellow pack-count badge removed');
assert.match(html,/id="packFormatTitle"/,'compact 10\/5\/4-card format title remains');
assert.match(html,/id="packDustHint"[^>]*>[^<]*Duplicate cards[^<]*binder[^<]*Dust Exchange/i,'Packs page points duplicate management to the manual Dust Exchange');
assert.doesNotMatch(html,/id="dustExchangeBtn"/,'legacy Packs-screen Dust exchange button is removed');

// Authoritative chronology overrides known bad/missing physical-set dates.
function ctx(){
  const context={console,window:null,state:{cards:{},ui:{packBrowser:{sortKey:'releaseDate',sortDir:'desc'},packMetrics:{}},settings:{}},setCache:{tcg:[],tcgp:[]},document:{getElementById(){return null;}},LuckyDexDebug:{},LuckyDexPack:{dateValue:v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null;},placeholder:()=>''},escapeHtml:String,AbortController,URL,setTimeout,clearTimeout,Promise,Date};
  context.window=context;vm.createContext(context);vm.runInContext(flow,context,{filename:'pack-flow-v0165.js'});return context;
}
{
  const c=ctx();
  c.setCache.tcg=[
    {id:'151',name:'Scarlet & Violet—151',releaseDate:'2027-01-01',cardCount:{total:207}},
    {id:'30th',name:'30th Celebration',releaseDate:'2023-01-01',cardCount:{total:160}},
  ];
  assert.deepEqual(Array.from(c.LuckyDexPackBrowser.rows('tcg','','releaseDate','desc')).map(x=>x.id),['30th','151'],'release sort uses corrected 2026/2023 chronology, not bad source metadata');
  assert.deepEqual(Array.from(c.LuckyDexPackBrowser.chronology(c.setCache.tcg)).map(x=>x.id),['30th','151'],'authoritative hidden set order also starts from the newest corrected release');
}

// First run after this UI migration should show newest-first when Release Date is selected.
assert.match(flow,/chronologyV0242[\s\S]{0,500}sortDir\s*=\s*'desc'/,'v0.24.2 migration resets release-date browsing to newest-first once');
assert.match(flow,/renderSetOptionsV13[\s\S]{0,400}packChronologicalSetsV0242/,'authoritative native set selection also uses corrected newest-first chronology');

// v0.24.7 supersedes auto-conversion: duplicates remain in the binder and Dust still buys tickets from Trade.
assert.doesNotMatch(app,/if\(existing\)state\.profile\.dust\+=dustForTier/,'duplicates no longer auto-convert to Dust');
assert.match(app,/state\.profile\.dust-=100;state\.profile\.tickets\+\+/,'100 Dust still exchanges for one Pack Ticket');

console.log('PASS v0.24.2 Packs accordion, chronology and declutter contract');
