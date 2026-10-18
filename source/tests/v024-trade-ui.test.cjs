'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/trade-v0163.css'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'../app/src/main/assets/trade-browser-v0169.css'),'utf8');
function count(re){return (html.match(re)||[]).length;}
assert.equal(count(/class="panel trade-intro"/g),0,'large Global market intro panel is removed');
assert.doesNotMatch(html,/Global market\. Up to five featured\./,'verbose market explainer is removed');
for(const id of ['tradeCountdown','tradeModeTabs','tradeViewTabs','tradeSourceTabs','tradeSearch','tradeDiscoveryText','tradeOfferList']) assert.equal(count(new RegExp(`id="${id}"`,'g')),1,`${id} remains exactly once`);
const summaryIndex=html.indexOf('id="tradeDiscoveryText"'),listIndex=html.indexOf('id="tradeOfferList"');
assert.ok(summaryIndex>0&&summaryIndex<listIndex,'compact summary remains directly before the trade list');
assert.doesNotMatch(css,/\.trade-intro\s*\{/,'Trade CSS no longer reserves space for the deleted intro panel');
assert.match(css,/\.trade-discovery[^\{]*\{[^}]*margin:[^;}]*0?\s*[^;}]*[0-8]px/s,'trade summary spacing is compact');
console.log('PASS v0.24 compact Trade UI structure');
