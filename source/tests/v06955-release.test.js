'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('v0.69.55 runtime and visible header markers are aligned',()=>{
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.55'/);
  assert.match(html,/v0\.69\.55/);
  assert.ok(!html.includes('v0.69.54'));
});
