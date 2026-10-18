
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Barrier Ball keeps START MATCH fully reachable on phone-sized courts',()=>{
  const css=read('arcade-barrier-ball.css');
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.barrier-ball-ready>small,\.barrier-ball-ready>span\{display:none\}/,
    'phone ready panel should remove duplicate rules copy that pushes START MATCH below the square court');
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.barrier-ball-start\{[^}]*display:block[^}]*min-height:36px[^}]*flex:0 0 auto/,
    'START MATCH should retain a full non-shrinking phone tap target');
  assert.match(read('index.html'),/id="barrierBallStart"[^>]*>START MATCH<\/button>/);
});

test('v0.59.1 mobile-start fix remains present in later releases with aligned metadata',()=>{
  const version=require(path.join(ROOT,'package.json')).version;
  const parts=version.split('.').map(Number);
  assert.ok(parts[0]>0||parts[1]>59||(parts[1]===59&&parts[2]>=1));
  const gradle=fs.readFileSync(path.join(ROOT,'app','build.gradle'),'utf8');
  assert.match(gradle,new RegExp(`versionName '${version.replaceAll('.','\\.')}'`));
  assert.match(read('app-v0167.js'),new RegExp(`__LUCKYDEX_BUILD='${version.replaceAll('.','\\.')}'`));
  assert.match(read('index.html'),new RegExp(`v${version.replaceAll('.','\\.')}`));
});
