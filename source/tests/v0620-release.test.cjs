'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.62.1 release metadata is aligned',()=>{
  assert.equal(require(path.join(ROOT,'package.json')).version,'0.62.1');
  const lock=require(path.join(ROOT,'package-lock.json'));
  assert.equal(lock.version,'0.62.1');
  assert.equal(lock.packages[''].version,'0.62.1');
  assert.match(read('app/build.gradle'),/versionCode 6201[\s\S]*versionName '0\.62\.1'/);
  assert.match(read('app/build.gradle'),/LuckyDex-asset-builder\/0\.62\.1/);
  assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.62\.1'/);
  assert.match(read('app/src/main/assets/index.html'),/v0\.62\.1/);
});

test('Streaming Stampede mobile controls stay outside the moving studio and use the shared pause/help lifecycle',()=>{
  const html=read('app/src/main/assets/index.html');
  const css=read('app/src/main/assets/arcade-streaming-stampede.css');
  const js=read('app/src/main/assets/arcade-streaming-stampede.js');
  assert.match(html,/id="streamingStampedeStudio"[\s\S]*id="streamingStampedeControls"/);
  assert.match(html,/id="streamingStampedeA" class="stampede-a"/);
  assert.match(css,/\.stampede-a\{[^}]*min-height:72px/);
  assert.match(css,/@media\(max-width:520px\)/);
  assert.match(js,/function pause\(\)/);
  assert.match(js,/function resume\(\)/);
  assert.match(js,/shiftTimestamps/);
});

test('Streaming Stampede session metadata describes the five-question run',()=>{
  assert.match(read('app/src/main/assets/arcade-session.js'),/streamingStampede:\{run:'Five questions/);
});
