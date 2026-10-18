'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const catalog=require('../app/src/main/assets/cosmetics-catalog-v0413.js');
const EXPECTED=['luckydex-default','luckydex-midnight','luckydex-cream','luckydex-pixel','kanto-red','johto-gold','hoenn-emerald','shiny-charm','kanto-dex','type-wheel','eras','shiny-tour','tcg-master','dual-binder','sealed-vault','first-ball','pocket-master','god-pack','dash-champion','museum-fossil','rock-solid','unown-code','link-cable','arcade-pass','oak-trio','eevee-spectrum','splash-school','voltorb-lost','golden-recipe','already-got-em'];

test('the original 30 stable sleeve ids remain intact in the expanded registry',()=>{
  const ids=catalog.CATALOGUE.map(x=>x.id);
  assert.ok(ids.length>=30);
  assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual(ids.slice(0,30),EXPECTED);
});

test('every sleeve uses an existing local non-empty WebP asset',()=>{
  for(const row of catalog.CATALOGUE){
    assert.match(row.artPath,/^cosmetics\/sleeves\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.webp$/);
    assert.doesNotMatch(row.artPath,/^(?:https?:|data:|\/)/i);
    const file=path.join(ROOT,'app/src/main/assets',row.artPath);
    assert.ok(fs.existsSync(file),`missing ${row.id}`);
    assert.ok(fs.statSync(file).size>100,`empty ${row.id}`);
  }
});

test('default is public and undiscovered secret catalogue rows expose no public requirement',()=>{
  assert.equal(catalog.BY_ID['luckydex-default'].hidden,false);
  for(const row of catalog.CATALOGUE.filter(x=>x.hidden)){
    assert.equal(row.name,'???');
    assert.equal(row.unlockText,'');
  }
});

test('sleeve achievement reward bindings are not duplicated',()=>{
  const ids=catalog.CATALOGUE.map(x=>x.sourceAchievementId).filter(Boolean);
  assert.equal(new Set(ids).size,ids.length);
});
