'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('runtime and visible header stay aligned at or beyond v0.69.55',()=>{
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  const runtime=app.match(/window\.__LUCKYDEX_BUILD='(0\.69\.\d+)'/)?.[1];
  assert.ok(runtime,'runtime build marker missing');
  const patch=Number(runtime.split('.')[2]);
  assert.ok(patch>=55,`expected v0.69.55+, got ${runtime}`);
  assert.ok(html.includes(`v${runtime}`),'visible header should match runtime build');
});
