'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Profile contains Customise summary and sleeve-only subview hooks',()=>{
  const html=read('app/src/main/assets/index.html');
  for(const id of ['customiseSummaryCard','customiseSummaryPreview','customiseSummaryName','profileCustomiseView','customiseBackBtn','customiseSleeveGrid','customiseSleeveDetail','customiseOwnershipFilter','customiseCategoryFilter']) assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/data-cosmetic-filter="all"/);
  assert.match(html,/data-cosmetic-filter="owned"/);
  assert.match(html,/data-cosmetic-filter="locked"/);
  assert.doesNotMatch(html,/Profile frames|Backgrounds|future cosmetics/i);
});

test('presentation masks undiscovered secrets and exposes equip states',()=>{
  const mod=require('../app/src/main/assets/cosmetics-customise-v0413.js');
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const catalogue=require('../app/src/main/assets/cosmetics-catalog-v0413.js');
  const state={cosmetics:core.normaliseCosmetics({unlockedSleeves:['luckydex-default','luckydex-midnight'],activeSleeve:'luckydex-default'})};
  const active=mod.presentation(catalogue.BY_ID['luckydex-default'],state,core);
  const owned=mod.presentation(catalogue.BY_ID['luckydex-midnight'],state,core);
  const locked=mod.presentation(catalogue.BY_ID['kanto-red'],state,core);
  const secret=mod.presentation(catalogue.BY_ID['oak-trio'],state,core);
  assert.equal(active.action,'EQUIPPED');
  assert.equal(owned.action,'EQUIP');
  assert.equal(locked.action,'LOCKED');assert.match(locked.requirement,/Kanto/i);
  assert.equal(secret.name,'???');assert.equal(secret.artPath,'');assert.equal(secret.requirement,'');
  core.discoverSecret(state,'v0413_secret_kanto_starters');
  const revealed=mod.presentation(catalogue.BY_ID['oak-trio'],state,core);
  assert.notEqual(revealed.name,'???');assert.equal(revealed.artPath,catalogue.BY_ID['oak-trio'].artPath);
});

test('Customise stylesheet defines a two-column mobile sleeve grid',()=>{
  const css=read('app/src/main/assets/cosmetics-v0413.css');
  assert.match(css,/\.customise-sleeve-grid\s*\{[^}]*grid-template-columns\s*:\s*repeat\(2\s*,\s*minmax\(0\s*,\s*1fr\)\)/s);
});

test('all Customise ownership/category paths mask secrets before filtering',()=>{
  const js=read('app/src/main/assets/cosmetics-customise-v0413.js');
  assert.match(js,/CATALOGUE\|\|\[\]\)\.map\(x=>presentation\(x,state,core\)\)\.filter\(Boolean\)\.filter\(p=>category/);
  const mod=require('../app/src/main/assets/cosmetics-customise-v0413.js');
  const core=require('../app/src/main/assets/cosmetics-core-v0413.js');
  const catalogue=require('../app/src/main/assets/cosmetics-catalog-v0413.js');
  const state={cosmetics:core.normaliseCosmetics(null)};
  const secret=mod.presentation(catalogue.BY_ID['oak-trio'],state,core);
  assert.deepEqual({name:secret.name,artPath:secret.artPath,requirement:secret.requirement},{name:'???',artPath:'',requirement:''});
});
