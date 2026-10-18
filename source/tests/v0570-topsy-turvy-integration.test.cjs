'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Topsy-Turvy runtime assets are present',()=>{
  for(const name of ['arcade-topsy-turvy-core.js','arcade-topsy-turvy.js','arcade-topsy-turvy.css'])assert.equal(fs.existsSync(path.join(ASSETS,name)),true,`${name} missing`);
});

test('Stadium 2 Kids Club exposes Topsy-Turvy with Hitmontop identity',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/topsyTurvy:'Topsy-Turvy'/);
  assert.match(world,/games:\['clearCutChallenge','gutsyGolbat','furretFrolic','topsyTurvy','barrierBall','pichuPowerPlant'\]/);
  assert.match(world,/topsyTurvy:\(\)=>window\.LuckyDexTopsyTurvy/);
  assert.match(world,/topsyTurvy:\{sprite:'237\.png',mechanic:'Momentum · Rapid Spin · ring-outs'\}/);
});

test('Topsy-Turvy panel teaches the faithful 60-second first-to-five rules and exposes analogue-style movement plus A',()=>{
  const html=read('index.html');
  assert.match(html,/id="topsyTurvyGame"/);
  assert.match(html,/60 seconds/i);
  assert.match(html,/five ring-outs/i);
  assert.match(html,/id="topsyTurvyStick"/);
  assert.match(html,/id="topsyTurvySpin"/);
  assert.match(html,/arcade-topsy-turvy\.css/);
  assert.match(html,/arcade-topsy-turvy-core\.js/);
  assert.match(html,/arcade-topsy-turvy\.js/);
});


test('Topsy-Turvy presents a larger readable arena surface',()=>{
  const css=fs.readFileSync(path.join(ASSETS,'arcade-topsy-turvy.css'),'utf8');
  assert.match(css,/topsy-stage\{max-width:8(?:2|4)0px/);
  assert.match(css,/topsy-arena\{[^}]*width:min\(100%,7(?:4|6)0px\)/s);
});
