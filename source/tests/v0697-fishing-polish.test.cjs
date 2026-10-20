'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const locations=require('../app/src/main/assets/arcade-fishing-locations.js');

const js=fs.readFileSync('app/src/main/assets/arcade-fishing.js','utf8');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const help=fs.readFileSync('app/src/main/assets/arcade-help.js','utf8');

test('Fishing copy uses Oxford commas in the first-play help and setup copy',()=>{
  assert.match(help,/landing Pokémon, unusual junk, and rare treasure/);
  assert.match(html,/Pick a region, fishing spot, rod, and optional bait\./);
  assert.doesNotMatch(help,/landing Pokémon, unusual junk and rare treasure/);
});

test('Fishing play view has countdown, in-location gear controls, and shop purchase feedback',()=>{
  for(const id of ['fishingCountdown','fishingPlayRod','fishingPlayBait','fishingShopNotice'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(js,/beginCountdown/);
  assert.match(js,/countdownActive/);
  assert.match(js,/Purchased .*Fishing Tokens/);
});

test('every authored Fishing spot defines a location-appropriate mystery silhouette',()=>{
  for(const region of Object.values(locations.REGIONS)){
    for(const area of region.areas){
      assert.ok(Number.isInteger(area.silhouetteSpeciesId),`${area.id} needs silhouetteSpeciesId`);
    }
  }
  const kanto=Object.fromEntries(locations.REGIONS.kanto.areas.map(a=>[a.id,a.silhouetteSpeciesId]));
  assert.equal(kanto['kanto-cerulean-waters'],118,'Cerulean freshwater should use Goldeen');
  assert.equal(kanto['kanto-vermilion-harbour'],72,'Vermilion ocean should use Tentacool');
  assert.equal(kanto['kanto-safari-pond'],118,'Safari Pond should use a freshwater silhouette');
  assert.equal(kanto['kanto-seafoam-coast'],72,'Seafoam coast should use an ocean silhouette');
});

test('silhouette rendering uses the selected location proxy rather than catch identity',()=>{
  global.window=global;
  delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];
  const api=require('../app/src/main/assets/arcade-fishing.js');
  assert.equal(api.silhouetteForCatch({speciesId:129,lengthM:1.1},{silhouetteSpeciesId:72}).id,72);
  assert.equal(api.silhouetteForCatch({speciesId:72,lengthM:.4},{silhouetteSpeciesId:118}).id,118);
});

test('reachable-caught counter treats availableSpecies results as species IDs',()=>{
  assert.match(js,/availableSpecies\(a,s\.selectedRod\)\.map\(id=>Number\(id\)\)/);
  assert.doesNotMatch(js,/availableSpecies\(a,s\.selectedRod\)\.map\(row=>Number\(row\.speciesId\)\)/);
});
