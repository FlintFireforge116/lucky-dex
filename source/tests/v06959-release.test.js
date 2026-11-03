'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('visible and runtime LuckyDex build markers agree',()=>{
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const runtime=app.match(/window\.__LUCKYDEX_BUILD='(0\.69\.\d+)'/);
  assert.ok(runtime,'runtime build marker should exist');
  assert.match(html,new RegExp(`v${runtime[1].replace(/\./g,'\\.')}`));
});
