'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=path.resolve(__dirname,'..'),A=path.join(R,'app/src/main/assets');
const data=require(path.join(A,'tcg-classic-battle-data.js'));
const discovery=require(path.join(A,'tcg-classic-neo-discovery.js'));
test('vv0.69.101 release identifies its Android and browser versions consistently',()=>{
 const gradle=fs.readFileSync(path.join(R,'app/build.gradle'),'utf8'),app=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8'),html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 assert.match(gradle,/versionName '0\.69\.101'/);assert.match(gradle,/versionCode 7081/);
 assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.101'/);
 assert.match(html,/v0\.69\.101/);
 const pkg=require(path.join(R,'package.json')),lock=require(path.join(R,'package-lock.json'));
 assert.equal(pkg.version,'0.69.101');assert.equal(lock.version,'0.69.101');
});
test('Neo Discovery loads after effects but before catalogue and exposes exactly 75 supported cards',()=>{
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 assert.ok(html.indexOf('tcgp-battle-effects.js')>=0);
 assert.ok(html.indexOf('tcgp-battle-effects.js')<html.indexOf('tcg-classic-neo-discovery.js'));
 assert.ok(html.indexOf('tcg-classic-neo-discovery.js')<html.indexOf('tcg-classic-battle-data.js'));
 assert.equal(data.SETS.find(x=>x.id==='neo2')?.name,'Neo Discovery');
 assert.equal(discovery.coverage().battleEnabled,75);
 assert.equal(discovery.CARDS.filter(x=>!x.deckEligible).length,0);
});
