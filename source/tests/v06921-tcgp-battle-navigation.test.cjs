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

test('v0.69.21+ navigation patch keeps release metadata aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  const version=pkg.version.replace(/\./g,'\\.');
  assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=7002);
  assert.match(gradle,new RegExp("versionName '"+version+"'"));
  assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.ok((html.match(new RegExp('v'+version,'g'))||[]).length>=2);
});
