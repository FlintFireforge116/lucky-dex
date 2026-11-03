const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const app=read('app/src/main/assets/app-v0167.js');
const html=read('app/src/main/assets/index.html');
const css=read('app/src/main/assets/tcgp-battle.css');

test('release markers are v0.69.61',()=>{
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.61'/);
  assert.match(html,/v0\.69\.61/);
  assert.doesNotMatch(html,/v0\.69\.60/);
});

test('v06961 is a hard battlefield reset rather than another legacy position layer',()=>{
  assert.match(css,/\/\* v0\.69\.61 battlefield reset/);
  assert.match(css,/--tcgp-mat-h:calc\(var\(--tcgp-board-w\) \* \.5\)/);
  assert.match(css,/\.tcgp-live-player-bottom\{[^}]*overflow:hidden!important/s);
  assert.match(css,/\.tcgp-live-mat-half \.tcgp-live-card-wrap\{[^}]*aspect-ratio:2\.5 \/ 3\.5!important/s);
});
