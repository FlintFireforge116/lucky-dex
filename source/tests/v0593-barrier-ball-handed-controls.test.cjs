'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Barrier Ball defaults to right-handed play with Smash bottom-left and mirrors for left-handed play',()=>{
  const css=read('arcade-barrier-ball.css');
  const js=read('arcade-barrier-ball.js');
  const app=read('app-v0167.js');
  const html=read('index.html');
  assert.match(app,/barrierBallLeftHanded\s*:\s*false/);
  assert.match(js,/barrierBallLeftHanded/);
  assert.match(js,/is-left-handed/);
  assert.match(css,/\.barrier-ball-controls\{[^}]*justify-content:flex-start/);
  assert.match(css,/\.barrier-ball-controls\.is-left-handed\{[^}]*justify-content:flex-end/);
  assert.match(html,/id="barrierBallLeftHandedToggle"/);
});

test('Settings exposes persistent Barrier Ball handedness toggle and refreshes the live game layout',()=>{
  const html=read('index.html');
  const app=read('app-v0167.js');
  assert.match(html,/id="barrierBallLeftHandedToggle"[^>]*type="checkbox"|type="checkbox"[^>]*id="barrierBallLeftHandedToggle"/);
  assert.match(html,/Barrier Ball[^<]*left-handed controls/i);
  assert.match(app,/barrierBallLeftHandedToggle/);
  assert.match(app,/LuckyDexBarrierBall\?\.renderHandedness/);
});

test('v0.59.3 release metadata is consistent',()=>{
  assert.equal(require(path.join(ROOT,'package.json')).version,'0.59.3');
  assert.match(fs.readFileSync(path.join(ROOT,'package-lock.json'),'utf8'),/"version": "0\.59\.3"/);
  assert.match(fs.readFileSync(path.join(ROOT,'app','build.gradle'),'utf8'),/versionCode 5903[\s\S]*versionName '0\.59\.3'/);
  assert.match(read('app-v0167.js'),/__LUCKYDEX_BUILD='0\.59\.3'/);
  assert.match(read('index.html'),/v0\.59\.3/);
});
