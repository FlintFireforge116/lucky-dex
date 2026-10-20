'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const ROOT=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
test('release identity remains internally consistent across package, Gradle and visible build metadata',()=>{
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),version=pkg.version;assert.equal(lock.version,version);assert.equal(lock.packages[''].version,version);
 const [ma,mi,pa]=version.split('.').map(Number),expectedCode=ma*100000+mi*100+pa*10,gradle=read('app/build.gradle');assert.match(gradle,new RegExp('versionCode '+expectedCode+'\\b'));assert.match(gradle,new RegExp("versionName '"+version.replace(/\./g,'\\.')+"'"));
 assert.match(read('app/src/main/assets/app-v0167.js'),new RegExp("window\\.__LUCKYDEX_BUILD='"+version.replace(/\./g,'\\.')+"';"));
 const html=read('app/src/main/assets/index.html');assert.ok((html.match(new RegExp('v'+version.replace(/\./g,'\\.'),'g'))||[]).length>=2);
});
