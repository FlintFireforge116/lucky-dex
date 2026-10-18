'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Barrier Ball exposes handedness directly on the ready screen and keeps Settings toggle',()=>{
  const html=read('index.html');
  const js=read('arcade-barrier-ball.js');
  assert.match(html,/id="barrierBallHandedness"/);
  assert.match(html,/id="barrierBallLeftHandedToggle"/);
  assert.match(js,/barrierBallHandedness/);
  assert.match(js,/toggleHandedness/);
  assert.match(js,/state\.settings\.barrierBallLeftHanded/);
});

test('Barrier Ball mobile layout places status before the lower smash control zone',()=>{
  const css=read('arcade-barrier-ball.css');
  assert.match(css,/@media\(max-width:600px\)[\s\S]*\.barrier-ball-status\{[^}]*order:3/);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*\.barrier-ball-controls\{[^}]*order:4[^}]*margin-top:(?:3[5-9]|[4-9][0-9])px/);
});
