const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('app/src/main/assets/index.html');
const css=read('app/src/main/assets/collection-trade-v0167.css');
const browser=require(path.join(root,'app/src/main/assets/collection-browser-v0280.js'));

assert.match(html,/id="collectionSetPickerButton"/,'Card Binder should expose a custom set-picker button');
assert.match(html,/id="collectionSetPickerDialog"/,'Card Binder should use an in-app set picker instead of exposing the native Android select');
assert.match(html,/id="collectionSetSearch"[^>]*type="search"/,'set search should exist only inside the set picker');
assert.match(html,/id="collectionSetPickerList"/,'set picker should have its own scrollable list');
assert.equal(typeof browser.filterOwnedSets,'function','collection browser should expose set search filtering for regression tests');
assert.equal(typeof browser.formatSetDate,'function','collection browser should expose friendly release-date formatting');
assert.equal(typeof browser.setCompletion,'function','collection browser should expose completion calculation');

const sets=[
  {key:'sv9',name:'Journey Together',release:'2025-03-28',count:1,total:190},
  {key:'base1',name:'Base Set',release:'1999-01-09',count:102,total:102},
  {key:'me2',name:'Phantasmal Flames',release:'2026-11-13',count:20,total:130},
];
assert.deepEqual(browser.filterOwnedSets(sets,'base').map(x=>x.key),['base1'],'set picker search should filter by set name');
assert.deepEqual(browser.filterOwnedSets(sets,'2025').map(x=>x.key),['sv9'],'set picker search should also match release dates');
assert.equal(browser.formatSetDate('2026-09-16'),'Sep 16, 2026');
assert.equal(browser.setCompletion({count:102,total:102}),100);
assert.equal(browser.setCompletion({count:20,total:191}),10);
assert.match(css,/\.collection-set-picker-card/,'custom selected-set panel should have dedicated LuckyDex styling');
assert.match(css,/\.collection-set-picker-dialog/,'set picker modal should have dedicated LuckyDex styling');
assert.match(css,/\.collection-set-row\.complete/,'completed sets should receive a distinct treatment');

const packageVersion=JSON.parse(read('package.json')).version;
const gradle=read('app/build.gradle');
const versionCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
const versionName=(gradle.match(/versionName\s+'([^']+)'/)||[])[1];
assert.ok(versionCode>=342,'Android versionCode should preserve v0.34.2 or later');
assert.ok(versionName.localeCompare('0.34.2',undefined,{numeric:true})>=0,'Android versionName should preserve v0.34.2 or later');
assert.equal(packageVersion,versionName,'package and Android versions should remain aligned');
console.log('PASS v0.34.2+ custom searchable Card Binder set picker');
