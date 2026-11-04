'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const workspace=require(path.join(assets,'tcgp-deck-workspace.js'));
const row=(id,quantity=2)=>({gameplayId:id,quantity,battleEnabled:true,variants:[]});

test('workspace exposes official recipes separately while keeping local recipes',()=>{
  assert.ok(workspace.OFFICIAL_RECIPES.length>=8);
  assert.ok(workspace.LOCAL_RECIPES.length>=17);
  assert.equal(workspace.RECIPES.length,workspace.OFFICIAL_RECIPES.length+workspace.LOCAL_RECIPES.length);
  assert.ok(workspace.OFFICIAL_RECIPES.every(r=>r.source==='Official'));
  assert.ok(workspace.LOCAL_RECIPES.every(r=>r.source==='LuckyDex'));
});

test('recipeSeed never grants missing cards and preserves owned complete evolution ancestry',()=>{
  const recipe=workspace.OFFICIAL_RECIPES.find(r=>r.id==='official-genetic-apex-advanced-charizard-ex');
  const rows=[row('A1-033',2),row('A1-034',2),row('A1-036',1),row('BASIC-POKE-BALL',2),row('P-A-007',2),row('A1-042',2)];
  const seeded=workspace.recipeSeed(recipe,rows);
  assert.ok(seeded.cards.includes('A1-036'),'owned Charizard ex should be seedable when its ancestry is owned');
  assert.ok(seeded.cards.includes('A1-033'));
  assert.ok(seeded.cards.includes('A1-034'));
  assert.equal(seeded.cards.includes('A1-049'),false,'missing Salandit must not be granted');
  assert.ok(seeded.missing.length>0);
});

test('recipeSeed drops an owned evolution when the owned prerequisite is missing',()=>{
  const recipe=workspace.OFFICIAL_RECIPES.find(r=>r.id==='official-genetic-apex-advanced-charizard-ex');
  const rows=[row('A1-036',1),row('BASIC-POKE-BALL',2),row('P-A-007',2)];
  const seeded=workspace.recipeSeed(recipe,rows);
  assert.equal(seeded.cards.includes('A1-036'),false);
});

test('recipe editor advertises exact, collection-adapted and archetype workflows for official recipes',()=>{
  const src=fs.readFileSync(path.join(assets,'tcgp-deck-editor.js'),'utf8');
  assert.match(src,/USE EXACT LIST/);
  assert.match(src,/BUILD WITH MY COLLECTION/);
  assert.match(src,/BUILD AROUND ARCHETYPE/);
  assert.match(src,/Official recipes/);
  assert.match(src,/LuckyDex recipes/);
});
