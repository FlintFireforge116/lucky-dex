'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('Gym Challenge full set remains in releases since v0.69.89 with aligned runtime/Android markers',()=>{
 const build=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 const runtime=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
 const version=build.match(/versionName '([0-9]+)\.([0-9]+)\.([0-9]+)'/);
 assert.ok(version,'Android build version is missing');
 const [major,minor,patch]=version.slice(1).map(Number);
 assert.ok(major>0||minor>69||minor===69&&patch>=89,'Gym Challenge must not target a pre-0.69.89 release');
 assert.ok(Number(build.match(/versionCode\s+(\d+)/)?.[1])>=7069);
 assert.match(runtime,new RegExp(`window\\.__LUCKYDEX_BUILD='${version[1]}\\.${version[2]}\\.${version[3]}'`));
});
