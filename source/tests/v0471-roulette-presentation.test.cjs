const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('roulette wheel uses aligned inner landing pockets instead of floating white dots',()=>{
  const js=read('app/src/main/assets/arcade-roulette.js');
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(js,/roulette-wheel-icon/);
  assert.match(js,/roulette-wheel-pocket/);
  assert.doesNotMatch(js,/<i>\$\{occupied\.has\(slot\.key\)\?'●':'<\/i>/);
  assert.match(css,/\.roulette-wheel-pocket\{/);
  assert.match(css,/--pocket-radius/);
  assert.match(css,/--icon-radius/);
});

test('roulette mobile layout keeps a large wheel above the full bet board',()=>{
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(css,/@media\(max-width:680px\)[\s\S]*\.roulette-stage\{grid-template-columns:1fr/);
  assert.match(css,/@media\(max-width:680px\)[\s\S]*\.roulette-wheel\{[^}]*max-width:340px/);
  assert.match(css,/@media\(max-width:680px\)[\s\S]*\.roulette-cell[^}]*min-height:34px/);
});

test('roulette reserves the shared arcade header and uses a compact in-game chrome',()=>{
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(css,/\.roulette-game\{[^}]*padding:58px 8px/);
  assert.match(css,/\.roulette-game>\.arcade-session-strip\{display:none!important\}/);
});
