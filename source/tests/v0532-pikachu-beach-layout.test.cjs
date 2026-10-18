'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('DX controls use one full-width 2x3 grid in the requested order',()=>{
  const html=read('app/src/main/assets/index.html');
  const controls=html.match(/<div id="pikachuBeachDxControls"[\s\S]*?<\/div>/)?.[0]||'';
  const order=[...controls.matchAll(/data-dx-control="([^"]+)"[^>]*>([^<]+)<\/button>/g)].map(m=>[m[1],m[2].trim()]);
  assert.deepEqual(order,[
    ['jump','JUMP'],['up','▲'],['attack','ATTACK'],
    ['left','◀'],['down','▼'],['right','▶'],
  ]);
  assert.doesNotMatch(controls,/dx-dpad|dx-actions/);
  const css=read('app/src/main/assets/arcade-pikachu-beach.css');
  assert.match(css,/\.dx-controls\s*\{[^}]*grid-template-columns\s*:\s*repeat\(3\s*,\s*minmax\(0\s*,\s*1fr\)\)/s);
});

test('ready screen replaces the empty playfield with a compact surfing Pikachu hero',()=>{
  const html=read('app/src/main/assets/index.html');
  assert.match(html,/class="dx-ready-surfer"[^>]+surfingpika\/000\.png/);
  const ui=read('app/src/main/assets/arcade-pikachu-beach-dx.js');
  assert.match(ui,/pikachuBeachDxView[^\n]*is-ready|is-ready[^\n]*pikachuBeachDxView/);
  const css=read('app/src/main/assets/arcade-pikachu-beach.css');
  assert.match(css,/\.pikachu-beach-mode-view\.is-ready[^\{]*\{[^}]*\}/s);
  assert.match(css,/\.is-ready\s+\.dx-hud[^\{]*,[^\{]*\.is-ready\s+\.pikachu-beach-dx-playfield\s*\{[^}]*display\s*:\s*none/s);
});

test('Beach layout is compact enough to avoid its own scrolling on phone viewports',()=>{
  const css=read('app/src/main/assets/arcade-pikachu-beach.css');
  assert.match(css,/\.pikachu-beach-game\s*\{[^}]*overflow\s*:\s*hidden/s);
  assert.match(css,/\.dx-controls button\s*\{[^}]*min-height\s*:\s*(?:5[2-9]|6\d)px/s);
  assert.match(css,/@media\(max-width:420px\)[\s\S]*\.pikachu-beach-dx-playfield\s*\{[^}]*height\s*:\s*clamp\([^;]*dvh[^;]*\)/s);
  assert.match(css,/@media\(max-width:355px\)\{[^}]*\.dx-ally-guide\s*\{[^}]*grid-template-columns\s*:\s*repeat\(3/s);
});

test('v0.53.3 release metadata is consistent for the compact Beach layout',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle'),app=read('app/src/main/assets/app-v0167.js'),html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.53.3');assert.equal(lock.version,'0.53.3');assert.equal(lock.packages[''].version,'0.53.3');
  assert.match(gradle,/versionCode\s+5303/);assert.match(gradle,/versionName\s+['"]0\.53\.3['"]/);assert.match(gradle,/LuckyDex-asset-builder\/0\.53\.3/);
  assert.match(app,/__LUCKYDEX_BUILD=['"]0\.53\.3['"]/);assert.ok((html.match(/v0\.53\.3/g)||[]).length>=2);
});
