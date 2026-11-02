'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('v0.69.53 runtime and visible app labels agree',()=>{
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.53'/);
  assert.doesNotMatch(html,/v0\.69\.47/);
  assert.match(html,/v0\.69\.53/);
});

test('random Solo battle is presented as repeatable rather than a zero-value first clear',()=>{
  const ui=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  assert.match(ui,/REPEATABLE RANDOM BATTLE/);
});
