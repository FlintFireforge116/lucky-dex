const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('centre play zone resolves any playable hand card without restoring a global action menu',()=>{
  const ui=require('../app/src/main/assets/tcgp-battle-ui.js');
  const actions=[
    {type:'bench',handIndex:2},
    {type:'trainer',handIndex:4},
    {type:'evolve',handIndex:6,target:'active'},
    {type:'evolve',handIndex:6,target:'bench',benchIndex:0}
  ];
  assert.deepEqual(ui.centerHandActionIndices(actions,2),[0]);
  assert.deepEqual(ui.centerHandActionIndices(actions,4),[1]);
  assert.deepEqual(ui.centerHandActionIndices(actions,6),[2,3]);
  assert.deepEqual(ui.centerHandActionIndices(actions,1),[]);
});

test('live battlefield exposes a centre card drop target and keeps direct board placement too',()=>{
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  assert.match(ui,/data-card-play-zone="1"/);
  assert.match(ui,/applyHandCenterDrop\(/);
  assert.match(ui,/data-card-drop-zone="1"/);
});

test('hand is a larger free-floating fan and the middle controls are integrated into the centre strip',()=>{
  const css=read('app/src/main/assets/tcgp-battle.css');
  assert.match(css,/\.tcgp-live-hand\s*\{[^}]*background\s*:\s*transparent/s);
  assert.match(css,/\.tcgp-live-hand-wrap\s*\{[^}]*flex-basis\s*:\s*clamp\(/s);
  assert.match(css,/\.tcgp-live-hand-wrap \.tcgp-live-hand-card\s*\{[^}]*width\s*:\s*clamp\(/s);
  assert.match(css,/\.tcgp-live-mid-controls\s*\{[^}]*background\s*:\s*transparent[^}]*border\s*:\s*0/s);
  assert.match(css,/\.tcgp-live-center-play\s*\{/);
});

test('v0.69.27+ centre-drag release metadata stays aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  const version=pkg.version.replace(/\./g,'\\.');
  assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=7008);
  assert.match(gradle,new RegExp("versionName '"+version+"'"));
  assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.ok((html.match(new RegExp('v'+version,'g'))||[]).length>=2);
});
