'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
global.LuckyDexRegions=require('../app/src/main/assets/adventure/adventure-regions.js');
const journeys=require('../app/src/main/assets/adventure/adventure-journeys.js');
const catalog=require('../app/src/main/assets/adventure-location-scenes.js');
const canonical=require('../app/src/main/assets/adventure/adventure-johto-hoenn-canonical-v0670.js');
const clone=x=>JSON.parse(JSON.stringify(x));

test('Johto and Hoenn every authored journey place has an explicit canonical scene',()=>{
  const c=clone(catalog); canonical.install(c);
  for(const region of ['johto','hoenn']){
    const names=[...new Set(journeys.journeys[region].chapters.flatMap(ch=>ch.sections.map(s=>s.name)))];
    assert.equal(names.length,40,region+' journey should expose 40 unique authored places');
    for(const name of names){
      const id=c.named?.[region]?.[name];
      assert.ok(id,`${region} ${name} missing named scene`);
      assert.match(id,new RegExp(`^${region}-canonical-`));
      const scene=c.scenes[id];
      assert.ok(scene?.path?.startsWith('https://archives.bulbagarden.net/wiki/Special:Redirect/file/'),`${name} should use canonical remote source`);
      assert.ok(scene?.fallbackPath?.startsWith('adventure/location-scenes/'),`${name} needs local fallback`);
    }
  }
});

test('regional canonical maps exist with local fallback and unknown names retain generic category fallback',()=>{
  const c=clone(catalog); canonical.install(c);
  for(const region of ['johto','hoenn']){
    const id=`${region}-canonical-region-map`;
    assert.equal(c.scenes[id].id,id);
    assert.ok(c.scenes[id].path.includes('Special:Redirect/file/'));
    assert.ok(c.scenes[id].fallbackPath);
    assert.ok(c.categories?.[region]?.route || c.categories?.[`${region}-route`]);
    assert.equal(c.named[region]['Definitely Not A Place'],undefined);
  }
});

test('journey map UI selects a canonical region map for all three Adventure regions',()=>{
  const ui=read('app/src/main/assets/adventure/adventure-regional-ui.js');
  assert.match(ui,/canonical-region-map/);
  assert.match(ui,/\[?'kanto','johto','hoenn'\]?|kanto.*johto.*hoenn/s);
  assert.doesNotMatch(ui,/r\.region==='kanto'\?`<img/);
});
