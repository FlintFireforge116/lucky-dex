const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('v0.69.33 patch release identity is aligned while retaining Android application and signer',()=>{
 const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json')),g=read('app/build.gradle');assert.equal(p.version,'0.69.33');assert.equal(l.version,p.version);assert.equal(l.packages[''].version,p.version);assert.match(g,/versionName '0\.69\.33'/);assert.match(g,/versionCode\s+7014\b/);assert.match(g,/applicationId 'com\.example\.luckydex'/);assert.match(g,/keyAlias 'luckydex'/);assert.match(g,/LuckyDex-asset-builder\/0\.69\.33/);assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.69\.33'/);assert.equal((read('app/src/main/assets/index.html').match(/v0\.69\.33/g)||[]).length,2);
});
