'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ASSETS=path.join(__dirname,'..','app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Barrier Ball runtime assets are present',()=>{
  for(const name of ['arcade-barrier-ball-core.js','arcade-barrier-ball.js','arcade-barrier-ball.css'])assert.equal(fs.existsSync(path.join(ASSETS,name)),true,`${name} missing`);
});

test('Stadium 2 Kids Club exposes Barrier Ball with Mr. Mime identity',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/barrierBall:'Barrier Ball'/);
  assert.match(world,/games:\['clearCutChallenge','gutsyGolbat','furretFrolic','topsyTurvy','barrierBall','pichuPowerPlant'\]/);
  assert.match(world,/barrierBall:\(\)=>window\.LuckyDexBarrierBall/);
  assert.match(world,/barrierBall:\{sprite:'122\.png',mechanic:'Barrier · angle · smash'\}/);
});

test('Barrier Ball panel exposes a four-way court, direct court drag and A smash',()=>{
  const html=read('index.html');
  assert.match(html,/id="barrierBallGame"/);
  assert.match(html,/id="barrierBallArena"/);
  assert.doesNotMatch(html,/id="barrierBallSlider"/);
  assert.match(html,/id="barrierBallSmash"/);
  assert.match(html,/60 seconds/i);
  assert.match(html,/five points/i);
  assert.match(html,/arcade-barrier-ball-core\.js/);
});

test('Barrier Ball is included in the shared first-play instructions system',()=>{
  const help=read('arcade-help.js');
  assert.match(help,/barrierBall:\{name:'Barrier Ball'/);
  assert.match(help,/barrierBall:\{[^}]+controls:'Drag anywhere across the court/s);
});

test('visible Barrier travel is mapped to court coordinates rather than element-width transforms',()=>{
  const css=read('arcade-barrier-ball.css'),js=read('arcade-barrier-ball.js');
  assert.match(css,/left:calc\(50% \+ var\(--offset,0%\)\)/);
  assert.match(css,/top:calc\(50% \+ var\(--offset,0%\)\)/);
  assert.match(js,/p\.offset\/core\.CONFIG\.width\*100/);
});
