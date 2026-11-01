const t=require('node:test'),a=require('node:assert/strict'),fs=require('fs'),path=require('path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

t('v0.69.39 release floor remains satisfied',()=>{
 const gradle=read('app/build.gradle'),pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 const code=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]||0);
 const semver=v=>v.split('.').map(Number);
 const atLeast=(v,min)=>{const a1=semver(v),b=semver(min);for(let i=0;i<3;i++){if(a1[i]>b[i])return true;if(a1[i]<b[i])return false;}return true;};
 a.ok(code>=7020);a.ok(atLeast(pkg.version,'0.69.39'));a.ok(atLeast(lock.version,'0.69.39'));a.ok(atLeast(lock.packages[''].version,'0.69.39'));
 a.match(read('app/src/main/assets/app-v0167.js'),/__LUCKYDEX_BUILD='0\.69\.(?:39|[4-9]\d)'/);
});
