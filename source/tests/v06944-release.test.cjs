'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.69.44 release identity, random history and expanded TCG coverage are aligned',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js'),editor=read('app/src/main/assets/tcgp-deck-editor.js'),catalogue=require('../app/src/main/assets/tcgp/generated/catalogue.js');
  assert.equal(pkg.version,'0.69.44');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  assert.match(gradle,/versionName '0\.69\.44'/);assert.match(gradle,/versionCode\s+7025\b/);assert.match(gradle,/LuckyDex-asset-builder\/0\.69\.44/);
  assert.ok(html.includes('v0.69.44'));assert.ok(app.includes("window.__LUCKYDEX_BUILD='0.69.44'"));
  assert.match(editor,/randomHistory/);assert.match(editor,/excludeArchetypes/);assert.match(editor,/randomSeed/);
  assert.equal(catalogue.summary.FULL,2178);assert.equal(catalogue.summary.PARTIAL,272);assert.equal(catalogue.summary.UNSUPPORTED,0);
});
