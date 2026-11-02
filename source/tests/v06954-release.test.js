'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('v0.69.54 runtime and visible version markers are current',()=>{
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  assert.ok(app.includes("window.__LUCKYDEX_BUILD='0.69.54'"));
  assert.ok(html.includes('v0.69.54'));
  assert.ok(!html.includes('v0.69.53'));
});
