const assert=require('assert');
const fs=require('fs');
const gradle=fs.readFileSync('app/build.gradle','utf8');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const app=fs.readFileSync('app/src/main/assets/app-v0167.js','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
function atLeast(parts,floor){
  for(let i=0;i<3;i++){
    if(parts[i]>floor[i]) return true;
    if(parts[i]<floor[i]) return false;
  }
  return true;
}
assert.match(gradle,/applicationId 'com\.example\.luckydex'/,'Android application ID must remain upgrade-compatible');
const code=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]||0);
assert.ok(code>=293,'post-v0.29.2 builds must retain Android versionCode >=293');
const gradleVersion=(gradle.match(/versionName '(\d+)\.(\d+)\.(\d+)'/)||[]).slice(1).map(Number);
assert.equal(gradleVersion.length,3,'Android versionName must remain semantic');
assert.ok(atLeast(gradleVersion,[0,29,2]),'Android versionName must not regress below v0.29.2');
const packageVersion=pkg.version.split('.').map(Number);
assert.equal(packageVersion.length,3,'package version must remain semantic');
assert.ok(atLeast(packageVersion,[0,29,2]),'package version must not regress below v0.29.2');
assert.strictEqual(lock.version,pkg.version);
assert.strictEqual(lock.packages[''].version,pkg.version);
assert.ok(html.includes(`v${pkg.version}`),'visible UI version must match package version');
assert.ok(app.includes(`__LUCKYDEX_BUILD='${pkg.version}'`),'runtime build marker must match package version');
console.log('v0.29.2+ release identity verified');
