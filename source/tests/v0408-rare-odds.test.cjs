'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const special=require('../app/src/main/assets/arcade-special-events-v0407.js');
const tile=require('../app/src/main/assets/arcade-tile-puzzle-core.js');

test('special-event helpers preserve vanilla odds but accept per-feature overrides',()=>{
  assert.equal(special.BERRY_RUN_RATE,.03);
  assert.equal(special.UNOWN_SHINY_RATE,.004);
  assert.equal(special.createBerryRunSpecial(()=>.5),null);
  assert.ok(special.createBerryRunSpecial(()=>.5,1));
  assert.equal(special.createBerryRunSpecial(()=>0,0),null);
  assert.equal(special.createUnownShiny('PIKACHU',()=>.5),null);
  assert.equal(special.createUnownShiny('PIKACHU',()=>.5,1)?.letter,'A');
  assert.equal(special.createUnownShiny('PIKACHU',()=>0,0),null);
});

test('tile puzzle accepts configurable card pack and present odds while keeping vanilla constants',()=>{
  assert.equal(tile.CARD_RATE,.004);
  assert.equal(tile.PACK_RATE,.004);
  assert.equal(tile.GIFT_RATE,.018);
  const card=tile.createAttempt({scenes:[{id:'scene'}],random:()=>.2,rates:{card:1,pack:0,gift:0}});
  assert.equal(card.kind,'card');
  const pack=tile.createAttempt({scenes:[{id:'scene'}],random:()=>.2,rates:{card:0,pack:1,gift:0}});
  assert.equal(pack.kind,'pack');
  let seq=[.9,0,.1,.9];let i=0;
  const present=tile.createAttempt({tileCount:20,scenes:[{id:'scene'}],random:()=>seq[i++]??.9,rates:{card:0,pack:0,gift:1}});
  assert.equal(present.kind,'normal');
  assert.ok(present.gift);
});
