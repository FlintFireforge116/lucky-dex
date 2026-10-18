const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('Arcade restores the venue carousel and consolidates only Game Corners',()=>{
  const world=read('arcade-world.js');
  assert.doesNotMatch(world,/ALL GAMES/);
  assert.doesNotMatch(world,/data-arcade-browser=/);
  assert.match(world,/id:"gameCorner",name:"Game Corner"/);
  assert.doesNotMatch(world,/id:"goldenrod",name:"Goldenrod Game Corner"/);
  assert.doesNotMatch(world,/id:"celadonPrize",name:"Celadon Game Corner"/);
  assert.match(world,/function renderWorld\(\)/);
  assert.match(world,/ARCADE LOCATIONS/);
});

test('Game Corner opens a location submenu for Goldenrod Celadon and Mauville',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/GAME_CORNER_LOCATIONS/);
  assert.match(world,/id:'goldenrod'.*games:\['voltorb'\]/s);
  assert.match(world,/id:'celadon'.*games:\['ballDrop'\]/s);
  assert.match(world,/id:'mauville'.*games:\['roulette','slotMachine'\]/s);
  assert.match(world,/data-game-corner-location=/);
  assert.match(world,/function openGameCornerLocation\(/);
  assert.match(world,/openGameCornerLocation\(corner\.dataset\.gameCornerLocation\)/);
});

test('Game Corner games share the one parent venue while back navigation preserves the chosen location',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/const GAME_CORNER_GAMES=new Set/);
  assert.match(world,/venueForGame=id=>GAME_CORNER_GAMES\.has\(id\)\?'gameCorner'/);
  assert.match(world,/gameCornerLocationForGame/);
  assert.match(world,/backFromGame\(\).*openGameCornerLocation/s);
  assert.match(world,/backFromVenue\(\).*gameCornerLocation/s);
});
