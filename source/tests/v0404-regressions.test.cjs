'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=read('app/src/main/assets/app-v0167.js');
const regional=read('app/src/main/assets/adventure/adventure-regional-ui.js');
const arcadeCss=read('app/src/main/assets/arcade.css');
const collection=require(path.join(root,'app/src/main/assets/collection-browser-v0280.js'));

test('daily pool uses a small Adventure battle goal instead of a full regional clear',()=>{
  assert.doesNotMatch(app,/name:'Complete a Regional Journey'/);
  assert.match(app,/id:'adventureBattle1',name:'Win 1 Adventure battle'.*key:'adventureBattles'/);
  assert.match(regional,/bumpDaily\('adventureBattles',1\)/);
});

test('same-day saves with removed daily task ids are regenerated safely',()=>{
  assert.match(app,/DAILY_POOL\.some\(x=>x\.id===id/);
  assert.match(app,/dailyTaskIdsFor\(t,rankForXp/);
});

test('Card Binder render clears stale Pokémon tiles before drawing cards',()=>{
  assert.equal(typeof collection.clearGrid,'function');
  const grid={innerHTML:'<button data-pokemon-key="390:n">Chimchar</button>'};
  collection.clearGrid(grid);
  assert.equal(grid.innerHTML,'');
});

test('Arcade world location list can scroll fully above persistent navigation',()=>{
  assert.match(arcadeCss,/\.arcade-world-viewport\{[^}]*overflow-y:auto/);
  assert.match(arcadeCss,/\.arcade-world-viewport\{[^}]*padding-bottom:max\(/);
});
