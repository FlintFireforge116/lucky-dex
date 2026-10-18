const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=function(){
  const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),gradle=read('app/build.gradle'),version=pkg.version;
  assert.ok(['0.42.1','0.42.2','0.42.3','0.42.4','0.42.5','0.43.0','0.43.1','0.44.0','0.45.0','0.45.1','0.45.2','0.45.3','0.45.4','0.45.5','0.46.0','0.46.1','0.46.2','0.47.0','0.47.1','0.47.2','0.47.4','0.48.0','0.48.1'].includes(version));assert.equal(lock.version,version);assert.equal(lock.packages[''].version,version);
  assert.equal(Number(gradle.match(/versionCode\s+(\d+)/)[1]),Number(version.split('.')[1])*100+Number(version.split('.')[2]));
  assert.equal(gradle.match(/versionName '([^']+)'/)[1],version);
  assert.ok(gradle.includes('LuckyDex-asset-builder/'+version));
  assert.ok(read('app/src/main/assets/app-v0167.js').includes("__LUCKYDEX_BUILD='"+version+"'"));
  assert.ok(read('app/src/main/assets/index.html').split('v'+version).length>=3);
};
