const t=require('node:test'),a=require('node:assert/strict'),fs=require('fs'),path=require('path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

t('v0.69.39 release identity is consistent',()=>{
 a.match(read('app/build.gradle'),/versionCode 7020/);
 a.match(read('app/build.gradle'),/versionName '0\.69\.39'/);
 a.match(read('app/build.gradle'),/LuckyDex-asset-builder\/0\.69\.39/);
 a.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.69\.39'/);
 a.match(read('app/src/main/assets/index.html'),/v0\.69\.39/);
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 a.equal(pkg.version,'0.69.39');a.equal(lock.version,'0.69.39');a.equal(lock.packages[''].version,'0.69.39');
});
