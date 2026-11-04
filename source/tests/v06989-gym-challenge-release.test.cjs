'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('Gym Challenge full set release aligns runtime and Android markers',()=>{
 const build=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8'),runtime=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
 assert.match(build,/versionName '0\.69\.101'/);assert.match(build,/versionCode 7081/);
 assert.match(runtime,/window\.__LUCKYDEX_BUILD='0\.69\.101'/);
});
