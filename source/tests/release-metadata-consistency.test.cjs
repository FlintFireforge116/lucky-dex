'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('displayed and packaged release versions stay aligned',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle');
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  const version=pkg.version;
  const escaped=version.replace(/\./g,'\\.');

  assert.equal(lock.version,version);
  assert.equal(lock.packages[''].version,version);
  assert.match(gradle,new RegExp(`versionName\\s+'${escaped}'`));
  assert.match(gradle,new RegExp(`LuckyDex-asset-builder/${escaped}`));
  assert.match(app,new RegExp(`__LUCKYDEX_BUILD='${escaped}'`));
  assert.ok((html.match(new RegExp(`v${escaped}`,'g'))||[]).length>=2,
    `index.html must display v${version} in both title and app header`);
});
