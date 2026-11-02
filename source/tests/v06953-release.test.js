'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('runtime and visible app labels agree',()=>{
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  const match=app.match(/window\.__LUCKYDEX_BUILD='(0\.69\.\d+)'/);
  assert.ok(match,'runtime marker should be present');
  assert.doesNotMatch(html,/v0\.69\.47/);
  assert.ok(html.includes(`v${match[1]}`),`visible version should match ${match[1]}`);
});

test('random Solo battle is presented as repeatable rather than a zero-value first clear',()=>{
  const ui=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  assert.match(ui,/REPEATABLE RANDOM BATTLE/);
});
