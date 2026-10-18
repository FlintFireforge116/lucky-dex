'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Furret Frolic runtime assets are present',()=>{
  for(const name of ['arcade-furret-frolic-core.js','arcade-furret-frolic.js','arcade-furret-frolic.css'])assert.equal(fs.existsSync(path.join(ASSETS,name)),true,`${name} missing`);
});

test('Stadium 2 Kids Club exposes Furret Frolic after Clear Cut and Gutsy Golbat',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/furretFrolic:'Furret’s Frolic'/);
  assert.match(world,/games:\['clearCutChallenge','gutsyGolbat','furretFrolic','topsyTurvy','barrierBall','pichuPowerPlant'(?:,'[^']+')*\]/);
  assert.match(world,/furretFrolic:\(\)=>window\.LuckyDexFurretFrolic/);
  assert.match(world,/furretFrolic:\{sprite:'162\.png',mechanic:'Patch lock · A hit · score'\}/);
});

test('Furret Frolic panel has Furret and Girafarig selection plus four-way move and A hit controls',()=>{
  const html=read('index.html');
  assert.match(html,/id="furretFrolicGame"/);
  assert.match(html,/data-furret-pokemon="162"/);
  assert.match(html,/data-furret-pokemon="203"/);
  for(const id of ['furretFrolicUp','furretFrolicDown','furretFrolicLeft','furretFrolicRight','furretFrolicHit'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/arcade-furret-frolic\.css/);
  assert.match(html,/arcade-furret-frolic-core\.js/);
  assert.match(html,/arcade-furret-frolic\.js/);
});
