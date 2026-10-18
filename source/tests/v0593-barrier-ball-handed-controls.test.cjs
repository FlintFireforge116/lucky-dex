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

test('v0.59.3 handed-controls release remains present in later releases',()=>{
  const version=require(path.join(ROOT,'package.json')).version;
  const parts=version.split('.').map(Number);
  assert.ok(parts[0]>0||parts[1]>59||(parts[1]===59&&parts[2]>=3),`expected >=0.59.3, got ${version}`);
  const escaped=version.replace(/\./g,'\\.');
  assert.match(fs.readFileSync(path.join(ROOT,'package-lock.json'),'utf8'),new RegExp(`\"version\": \"${escaped}\"`));
  assert.match(fs.readFileSync(path.join(ROOT,'app','build.gradle'),'utf8'),new RegExp(`versionName '${escaped}'`));
  assert.match(read('app-v0167.js'),new RegExp(`__LUCKYDEX_BUILD='${escaped}'`));
  assert.match(read('index.html'),new RegExp(`v${escaped}`));
});
