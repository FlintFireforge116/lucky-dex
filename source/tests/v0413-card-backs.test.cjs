'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('shared card back helper resolves active sleeve and safe default',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const state={cosmetics:core.normaliseCosmetics({unlockedSleeves:['luckydex-default','luckydex-midnight'],activeSleeve:'luckydex-midnight'})};
  const html=core.cardBackInnerHtml(state);
  assert.match(html,/data-sleeve-id="luckydex-midnight"/);
  assert.match(html,/cosmetics\/sleeves\/luckydex-midnight\.webp/);
  assert.match(html,/onerror=/);
  state.cosmetics.activeSleeve='missing';
  const fallback=core.cardBackInnerHtml(state);
  assert.match(fallback,/data-sleeve-id="luckydex-default"/);
});

test('pack card backs use the active sleeve CSS overlay without modifying the protected pack runtime',()=>{
  const js=read('app/src/main/assets/pack-opening-v0160.js');
  const css=read('app/src/main/assets/cosmetics-v0413.css');
  const core=read('app/src/main/assets/cosmetics-core-v0413.js');
  assert.doesNotMatch(js,/cardBackInnerHtml|sleeveBackHtml/);
  assert.match(css,/pack-face-back::after/);
  assert.match(css,/pack-unrevealed-cover::after/);
  assert.match(css,/--luckydex-active-sleeve/);
  assert.match(core,/function applyActiveSleeveCss/);
});

test('Trade receive animation uses the shared helper',()=>{
  const js=read('app/src/main/assets/trade-v0163.js');
  assert.match(js,/function fxCardBack\(\)[\s\S]*cardBackInnerHtml/);
});

test('shared sleeve CSS keeps a local image over a visible fallback layer',()=>{
  const css=read('app/src/main/assets/cosmetics-v0413.css');
  assert.match(css,/\.lucky-sleeve-back-inner/);
  assert.match(css,/\.lucky-sleeve-back-inner\s*>\s*img/);
  assert.match(css,/\.lucky-sleeve-fallback/);
});

test('equipping a different sleeve updates the shared pack and Trade back without reload',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const state={cosmetics:core.normaliseCosmetics(null)};
  core.unlockSleeve(state,'luckydex-midnight','test:a');
  core.unlockSleeve(state,'kanto-red','test:b');
  core.installBridge({getState:()=>state});
  assert.equal(core.equipSleeve(state,'luckydex-midnight').ok,true);
  assert.match(core.cardBackInnerHtml(),/data-sleeve-id="luckydex-midnight"/);
  assert.equal(core.equipSleeve(state,'kanto-red').ok,true);
  assert.match(core.cardBackInnerHtml(),/data-sleeve-id="kanto-red"/);
  state.cosmetics.activeSleeve='corrupt-id';
  assert.match(core.cardBackInnerHtml(),/data-sleeve-id="luckydex-default"/);
  assert.equal(core.activeSleeve(state).id,'luckydex-default');
});

test('equipping sleeves updates the pack CSS variable immediately with a safe default fallback',()=>{
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const state={cosmetics:core.normaliseCosmetics(null)};
  core.unlockSleeve(state,'luckydex-midnight','css:a');
  core.unlockSleeve(state,'kanto-red','css:b');
  const writes=[];const previous=global.document;
  global.document={documentElement:{style:{setProperty:(key,value)=>writes.push([key,value])}}};
  try{
    core.equipSleeve(state,'luckydex-midnight');
    assert.match(writes.at(-1)?.[1]||'',/luckydex-midnight\.webp/);
    core.equipSleeve(state,'kanto-red');
    assert.ok((writes.at(-1)?.[1]||'').includes(core.registry['kanto-red'].artPath));
    state.cosmetics.activeSleeve='broken';
    core.applyActiveSleeveCss(state);
    assert.match(writes.at(-1)?.[1]||'',/luckydex-default\.webp/);
  } finally {global.document=previous;}
});
