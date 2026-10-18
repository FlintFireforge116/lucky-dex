const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.45.0');assert.equal(lock.version,'0.45.0');assert.equal(lock.packages[''].version,'0.45.0');
assert.match(read('app/build.gradle'),/applicationId 'com\.example\.luckydex'/);assert.match(read('app/build.gradle'),/versionCode\s+4500\b/);assert.match(read('app/build.gradle'),/versionName '0\.45\.0'/);assert.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.45\.0'/);assert.equal((read('app/src/main/assets/index.html').match(/v0\.45\.0/g)||[]).length,2);
console.log('PASS v0.45.0 Elemental Gauntlet release identity and unchanged Android application ID');
