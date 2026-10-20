'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const css=fs.readFileSync('app/src/main/assets/arcade-fishing.css','utf8');
const help=fs.readFileSync('app/src/main/assets/arcade-help.js','utf8');

test('Fishing setup uses visible progression cards instead of unrestricted location selects',()=>{
  const block=html.match(/<section id="fishingSetupView"[\s\S]*?<\/section>/)?.[0]||'';
  assert.match(block,/id="fishingRegionProgress"/);
  assert.match(block,/id="fishingSpotProgress"/);
  assert.doesNotMatch(block,/id="fishingRegion"/);
  assert.doesNotMatch(block,/id="fishingArea"/);
  assert.match(css,/\.fishing-progression-card/);
  assert.match(css,/\.fishing-progression-card\.is-locked/);
});

test('Fishing help explains sequential unlocks without revealing locked catches',()=>{
  assert.match(help,/3 distinct local Pokémon/i);
  assert.match(help,/revisit/i);
  assert.match(help,/stronger rods/i);
});
