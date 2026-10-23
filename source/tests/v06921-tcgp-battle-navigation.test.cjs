const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Battle Lab navigation hides the full Pack home instead of laying the lab underneath it',()=>{
  const css=read('app/src/main/assets/styles-v013.css');
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  assert.match(css,/\.pack-home\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/s);
  assert.match(ui,/if\(home\)home\.hidden=true/);
  assert.match(ui,/view\.hidden=false/);
});

test('v0.69.21 patch metadata is consistent',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.69.21');
  assert.match(gradle,/versionCode\s+7002\b/);
  assert.match(gradle,/versionName '0\.69\.21'/);
  assert.ok(app.includes("__LUCKYDEX_BUILD='0.69.21'"));
  assert.equal((html.match(/v0\.69\.21/g)||[]).length,2);
});
