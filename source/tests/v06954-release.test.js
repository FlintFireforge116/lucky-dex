'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');

test('runtime and visible version markers remain aligned after v0.69.54',()=>{
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  const match=app.match(/window\.__LUCKYDEX_BUILD='(0\.69\.\d+)'/);
  assert.ok(match,'runtime marker should be present');
  assert.ok(html.includes(`v${match[1]}`),`visible version should match ${match[1]}`);
  assert.ok(Number(match[1].split('.').at(-1))>=54,'release should not regress below v0.69.54');
});
