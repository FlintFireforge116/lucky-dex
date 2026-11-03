'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('v0.69.59 visible and runtime build markers agree',()=>{
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.59'/);
  assert.match(html,/v0\.69\.59/);
});
