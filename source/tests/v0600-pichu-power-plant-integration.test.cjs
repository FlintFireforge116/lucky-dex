'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Pichu Power Plant is registered in Stadium 2 with help, records and runtime owner',()=>{
  const world=read('arcade-world.js'),help=read('arcade-help.js'),records=read('arcade-records.js');
  assert.match(world,/stadium2KidsClub[\s\S]*pichuPowerPlant/);
  assert.match(world,/pichuPowerPlant:\(\)=>window\.LuckyDexPichuPowerPlant/);
  assert.match(help,/pichuPowerPlant:\{name:'Pichu’s Power Plant'/);
  assert.match(records,/pichuPowerPlant/);
});

test('Pichu Power Plant UI has four racers, four directions and A B zap controls',()=>{
  const html=read('index.html');
  assert.match(html,/id="pichuPowerPlantGame"/);
  for(const n of [0,1,2,3])assert.match(html,new RegExp(`id="pichuPowerPlantPlayer${n}"`));
  for(const d of ['Up','Right','Down','Left'])assert.match(html,new RegExp(`id="pichuPowerPlant${d}"`));
  assert.match(html,/id="pichuPowerPlantA"/);
  assert.match(html,/id="pichuPowerPlantB"/);
  assert.match(html,/arcade-pichu-power-plant\.css/);
  assert.match(html,/arcade-pichu-power-plant-core\.js/);
  assert.match(html,/arcade-pichu-power-plant\.js/);
});

test('Pichu Power Plant has four achievements including a hard win',()=>{
  const ach=read('achievements-v0341.js');
  assert.match(ach,/pichu_power_first_match/);
  assert.match(ach,/pichu_power_first_win/);
  assert.match(ach,/pichu_power_hard_win/);
  assert.match(ach,/pichu_power_perfect/);
});
