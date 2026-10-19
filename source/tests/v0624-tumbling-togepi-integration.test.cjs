'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Tumbling Togepi is registered in Stadium 2, shared help, page assets, session rules and persistent records',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const help=read('app/src/main/assets/arcade-help.js');
  const html=read('app/src/main/assets/index.html');
  const session=read('app/src/main/assets/arcade-session.js');
  const platform=read('app/src/main/assets/arcade-platform.js');
  assert.match(world,/stadium2KidsClub[\s\S]*tumblingTogepi/);
  assert.match(world,/tumblingTogepi:'Tumbling Togepi'/);
  assert.match(world,/tumblingTogepi:\(\)=>window\.LuckyDexTumblingTogepi/);
  assert.match(world,/tumblingTogepi:\{sprite:'175\.png',mechanic:'[^']+'\}/);
  assert.match(help,/tumblingTogepi:\{name:'Tumbling Togepi'/);
  assert.match(html,/id="tumblingTogepiGame"/);
  assert.match(html,/arcade-tumbling-togepi\.css/);
  assert.match(html,/arcade-tumbling-togepi-core\.js/);
  assert.match(html,/arcade-tumbling-togepi\.js/);
  assert.match(session,/tumblingTogepi:\{run:/);
  assert.match(platform,/tumblingTogepi:\{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null/);
});

test('Tumbling Togepi has difficulty, phone controls, Omanyte selection, achievements and no invented rare toggle',()=>{
  const html=read('app/src/main/assets/index.html');
  const gameJs=path.join(ROOT,'app/src/main/assets/arcade-tumbling-togepi.js');
  assert.ok(fs.existsSync(gameJs),'Tumbling Togepi gameplay module should exist');
  const js=fs.readFileSync(gameJs,'utf8');
  const achievements=read('app/src/main/assets/achievements-v0341.js');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(html,/data-tumbling-difficulty="easy"/);
  assert.match(html,/id="tumblingTogepiStick"/);
  assert.match(html,/data-tumbling-species="138"/);
  assert.match(js,/hasCaughtOmanyte/);
  assert.match(achievements,/tumbling_togepi_first_match/);
  assert.match(achievements,/tumbling_togepi_first_win/);
  assert.match(achievements,/tumbling_togepi_hard_win/);
  assert.match(achievements,/tumbling_togepi_boost_chain/);
  assert.doesNotMatch(app,/forceTumblingTogepiRare/i);
});
