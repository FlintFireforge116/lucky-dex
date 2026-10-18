const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('Arcade uses its venue carousel rather than a global all-games catalogue',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/ARCADE LOCATIONS/);
  assert.doesNotMatch(world,/ALL GAMES/);
  assert.doesNotMatch(world,/data-arcade-browser=/);
});

test('Game Corner is one Arcade venue with regional sublocations',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/id:"gameCorner",name:"Game Corner"/);
  assert.match(world,/GAME_CORNER_LOCATIONS/);
  assert.match(world,/data-game-corner-location=/);
});

test('Game Corner sublocations route through the shared openGame path',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/openGameCornerLocation/);
  assert.match(world,/data-venue-game=/);
  assert.match(world,/function openGame\(id\)/);
});

test('Arcade venue presentation remains available for all non-Game-Corner locations',()=>{
  const world=read('arcade-world.js'),css=read('arcade.css');
  assert.match(world,/world-scene/);
  assert.match(world,/world-stops/);
  assert.match(css,/arcade-venue-game/);
});
