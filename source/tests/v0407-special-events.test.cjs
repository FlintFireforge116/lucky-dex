'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/arcade-special-events-v0407.js');

test('Berry Picker special event is rare, chooses one reward kind and one trigger slot',()=>{
  let seq=[0.001,0.10,0.49]; const rng=()=>seq.shift();
  const hit=core.createBerryRunSpecial(rng);
  assert.equal(hit.kind,'card');
  assert.equal(hit.triggerAfter,3);
  assert.equal(hit.delivered,false);
  assert.equal(core.createBerryRunSpecial(()=>0.99),null);
});

test('Unown shiny roll selects exactly one alphabetical glyph and preserves its letter',()=>{
  let seq=[0.001,0.72]; const hit=core.createUnownShiny('MR MIME',()=>seq.shift());
  assert.equal(hit.letter,'M');
  assert.equal(hit.glyphIndex,4);
  assert.equal(core.createUnownShiny('PIKACHU',()=>0.99),null);
});

test('Unown card matching is case-insensitive and starts on the requested letter',()=>{
  const rows=[{name:'Pikachu'},{name:'Mr. Mime'},{name:'Mew'},{name:'Machamp'}];
  assert.deepEqual(core.cardsForLetter(rows,'m').map(x=>x.name),['Mr. Mime','Mew','Machamp']);
});
