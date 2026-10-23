const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('battle board owns deck, discard, energy and contextual Pokemon controls',()=>{
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  assert.match(ui,/function livePileHtml\(/);
  assert.match(ui,/data-tcgp-action="open-discard"/);
  assert.match(ui,/function livePokemonActionsHtml\(/);
  assert.match(ui,/data-tcgp-action="battle-action"/);
  assert.match(ui,/data-energy-target="1"/);
  assert.match(ui,/data-tcgp-energy-source="1"/);
  assert.match(ui,/pointerdown/);
  assert.match(ui,/elementFromPoint/);
});

test('player deck uses the equipped LuckyDex sleeve and discard is same visual footprint',()=>{
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  const css=read('app/src/main/assets/tcgp-battle.css');
  assert.match(ui,/LuckyDexCosmeticsV0413/);
  assert.match(ui,/activeSleeve/);
  assert.match(css,/\.tcgp-live-pile\s*\{/);
  assert.match(css,/\.tcgp-live-pile\.discard/);
});

test('attached Energy is visible on the Pokemon card and player Energy lives at bottom right',()=>{
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  const css=read('app/src/main/assets/tcgp-battle.css');
  assert.match(ui,/tcgp-live-attached-energy/);
  assert.match(css,/\.tcgp-live-energy-source/);
  assert.match(css,/right:/);
  assert.match(css,/bottom:/);
});

test('v0.69.25+ board interaction patch keeps release metadata aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  const version=pkg.version.replace(/\./g,'\\.');
  assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=7006);
  assert.match(gradle,new RegExp("versionName '"+version+"'"));
  assert.ok(app.includes("__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.ok((html.match(new RegExp('v'+version,'g'))||[]).length>=2);
});
