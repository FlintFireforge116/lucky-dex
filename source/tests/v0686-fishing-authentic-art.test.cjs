'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const Core=require('../app/src/main/assets/arcade-fishing-core.js');
const Art=require('../app/src/main/assets/arcade-fishing-item-art.js');

const all=[...Core.JUNK,...Core.TREASURE];

test('Fishing reuses authentic existing/official item sprites rather than custom drawn SVGs',()=>{
  for(const item of all){
    const p=Art.pathFor(item);
    assert.ok(p,`missing item art for ${item.id}`);
    assert.ok(!/fishing-items-v0685\//.test(p),`${item.id} still uses hand-drawn v0.68.5 art`);
    assert.ok(!/\.svg(?:$|\?)/i.test(p),`${item.id} should not use a custom SVG`);
  }
  assert.equal(Art.pathFor('stardust'),'arcade/sprites/items/stardust.png','Stardust should reuse the sprite already shipped for mining');
  assert.equal(Art.pathFor('coin-pouch'),'arcade/sprites/items/nugget.png');
  assert.equal(Art.pathFor('big-dust'),'arcade/sprites/items/star-piece.png');
  assert.match(Art.pathFor('rotten-leftovers'),/sprites\/items\/leftovers\.png$/);
  assert.match(Art.pathFor('slowpoke-tail'),/sprites\/items\/slowpoke-tail\.png$/);
});

test('Fishing item art exposes local authentic fallbacks for remote official sprites',()=>{
  for(const item of all){
    const fallback=Art.fallbackFor(item);
    assert.ok(fallback,`missing fallback for ${item.id}`);
    assert.ok(!/fishing-items-v0685\//.test(fallback),`${item.id} fallback still uses drawn fishing art`);
    if(!/^https?:/.test(fallback))assert.ok(fs.existsSync(path.join(ROOT,'app/src/main/assets',fallback)),`missing local fallback ${fallback}`);
  }
});

test('Safari Pond uses the actual water-bearing FRLG Safari area and focuses the ponds',()=>{
  const row=Core.AREA_ART['Safari Pond'];
  assert.ok(row,'Safari Pond art missing');
  assert.match(row[0],/Safari Zone area 2 FRLG\.png/i);
  assert.equal(row[1],'adventure/location-scenes/kanto-coast.png','offline fallback should at least be a Kanto water scene');
  assert.match(row[2],/^\d+% \d+%$/,'spot should carry an explicit crop/focus position');
  const catalog=Core.buildCatalog(require('../app/src/main/assets/adventure/adventure-species.js').byId);
  const safari=catalog.regions.kanto.areas.find(a=>a.name==='Safari Pond');
  assert.equal(safari.backdropPosition,row[2]);
});
