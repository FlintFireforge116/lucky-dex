const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('live TCG battle becomes a single-screen arena instead of a scrolling app page',()=>{
  const css=read('app/src/main/assets/tcgp-battle.css');
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  assert.match(ui,/classList\.add\('tcgp-battle-live'\)/);
  assert.match(ui,/classList\.remove\('tcgp-battle-live'\)/);
  assert.match(css,/body\.tcgp-battle-live\s+\.topbar[^}]*display\s*:\s*none/s);
  assert.match(css,/body\.tcgp-battle-live\s+\.bottom-nav[^}]*display\s*:\s*none/s);
  assert.match(css,/body\.tcgp-battle-live\s+\.tcgp-battle-view[^}]*height\s*:\s*100dvh/s);
  assert.match(css,/body\.tcgp-battle-live\s+\.tcgp-battle-view[^}]*overflow\s*:\s*hidden/s);
  assert.match(css,/\.tcgp-live-arena[^}]*height\s*:\s*100%/s);
});

test('single-screen board keeps opponent, active lane, bench and hand on the board and uses overlays for detail/actions',()=>{
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  assert.match(ui,/tcgp-live-opponent/);
  assert.match(ui,/tcgp-live-opponent-active/);
  assert.match(ui,/tcgp-live-player-active/);
  assert.match(ui,/tcgp-live-player-bench/);
  assert.match(ui,/tcgp-live-hand/);
  assert.match(ui,/data-tcgp-action="open-actions"/);
  assert.match(ui,/tcgp-live-overlay/);
  assert.match(ui,/data-tcgp-action="close-overlay"/);
  assert.doesNotMatch(ui,/tcgp-pocket-center-note">Tap any card to inspect/);
});

test('v0.69.24 single-screen battle release metadata stays aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.69.24');
  assert.match(gradle,/versionCode\s+7005/);
  assert.match(gradle,/versionName '0\.69\.24'/);
  assert.ok(gradle.includes('LuckyDex-asset-builder/0.69.24'));
  assert.ok(app.includes("__LUCKYDEX_BUILD='0.69.24'"));
  assert.ok((html.match(/v0\.69\.24/g)||[]).length>=2);
});
