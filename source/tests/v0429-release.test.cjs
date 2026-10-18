'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.40.29+ preserves the user-tweak assets introduced in v0.40.29',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
  const [,minor='0',patch='0']=String(pkg.version).split('.');
  assert.equal(Number(minor),40);assert.ok(Number(patch)>=29);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  const code=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]||0);assert.ok(code>=4029);
  assert.ok(gradle.includes(`versionName '${pkg.version}'`));assert.ok(gradle.includes(`LuckyDex-asset-builder/${pkg.version}`));
  assert.ok(html.includes(`v${pkg.version}`));assert.ok(app.includes(`__LUCKYDEX_BUILD='${pkg.version}'`));
  assert.ok(fs.existsSync(path.join(root,'app/src/main/assets/pokemon-go-ditto-v04029.js')),'historical v0.40.29 Ditto helper remains preserved');
  assert.ok(fs.existsSync(path.join(root,'tests/v0429-user-tweaks.test.cjs')));
});
