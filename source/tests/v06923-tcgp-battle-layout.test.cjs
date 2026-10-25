const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Pocket-style battle layout keeps inspectable cards, score state and accessible legal actions',()=>{
  const css=read('app/src/main/assets/tcgp-battle.css');
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  // Obsolete scrolling Pocket renderer retired in v0.69.29. The real-browser
  // geometry/interaction suites verify these live anchors and accessible actions.
  assert.match(css,/\.tcgp-live-arena\s*\{[^}]*display:grid/s);
  assert.match(css,/\.tcgp-live-opponent\s*\{/);
  assert.match(css,/\.tcgp-live-context-action\s*\{/);
  assert.match(css,/\.tcgp-live-hand-card:active/);
  assert.match(ui,/data-tcgp-action=\"inspect-card\"/);
  assert.ok(/tcgp-pocket-scoreline/.test(ui)||/tcgp-live-score/.test(ui));
  assert.match(ui,/function liveInspectOverlayHtml\(/);
});

test('v0.69.23+ battle layout patch keeps release metadata aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  const version=pkg.version.replace(/\./g,'\\.');
  assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=7004);
  assert.match(gradle,new RegExp("versionName '"+version+"'"));
  assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.ok((html.match(new RegExp('v'+version,'g'))||[]).length>=2);
});
