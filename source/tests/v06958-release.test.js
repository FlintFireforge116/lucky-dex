'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('v0.69.58 modules are loaded before battle UI and visible/runtime versions match',()=>{
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  assert.match(html,/cosmetics-playmats-v06958\.js[\s\S]*cosmetics-core-v0413\.js/);
  assert.match(html,/tcgp-ui-assets\.js[\s\S]*tcgp-battle-ui\.js/);
  const build=app.match(/window\.__LUCKYDEX_BUILD='(0\.69\.\d+)'/)?.[1];
  assert.ok(build,'runtime build marker exists');
  assert.match(html,new RegExp('v'+build.replaceAll('.', '\\.')));
});
