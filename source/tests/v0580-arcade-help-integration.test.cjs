'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ASSETS=path.join(__dirname,'..','app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('arcade world defers unseen games until first-play help is dismissed',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/LuckyDexArcadeHelp/);
  assert.match(world,/showFirstTime\?\.\(id,startGame\)/);
  assert.match(world,/isSeen\?\.\(id\)/);
  assert.match(world,/function startGame\(\)/);
  const start=world.indexOf('function startGame()');
  const help=world.indexOf('showFirstTime?.(id,startGame)');
  assert.ok(start>=0&&help>start,'openGame should build a deferred start callback before first-time help');
});

test('reopened help pauses and resumes owners that support it',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/owner\?\.pause\?\.\(\)===true/);
  assert.match(world,/owner\?\.resume\?\.\(\)/);
  assert.match(world,/showInfo\?\.\(active/);
});

test('cleanup silently clears help and the shared info entry point',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/deactivate\?\.\(\{silent:true\}\)/);
  assert.match(world,/if\(window\.LuckyDexArcadeHelp\?\.isOpen\?\.\(\)\)/);
});
