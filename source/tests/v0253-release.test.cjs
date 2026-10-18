'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gradle=read('app/build.gradle');
const pkg=JSON.parse(read('package.json'));
const html=read('app/src/main/assets/index.html');
assert.match(gradle,/applicationId\s+'com\.example\.luckydex'/,'applicationId must remain stable');
const versionCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
assert.ok(versionCode>=253,'Android versionCode must not regress below 253');
const versionName=(gradle.match(/versionName\s+'([^']+)'/)||[])[1];
assert.ok(versionName&&versionName.localeCompare('0.25.3',undefined,{numeric:true})>=0,'Android versionName must not regress below 0.25.3');
assert.ok(pkg.version.localeCompare('0.25.3',undefined,{numeric:true})>=0,'package version must not regress below 0.25.3');
const key=fs.readFileSync(path.join(root,'app/luckydex-dev.keystore'));
assert.equal(crypto.createHash('sha256').update(key).digest('hex'),'90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3','permanent signer bytes changed');
const order=[
 'card-rarity-v0253.js',
 'card-acquisition-v0246.js',
 'pack-opening-v0160.js',
 'pack-flow-v0165.js',
 'app-v0167.js',
 'trade-v0163.js'
].map(x=>html.indexOf(x));
assert.ok(order.every(i=>i>=0),'all rarity consumer scripts must be present');
for(let i=1;i<order.length;i++)assert.ok(order[i]>order[i-1],`script order broken between ${i-1} and ${i}`);
assert.ok(html.indexOf('arcade-tile-scenes-v0253.js')>=0&&html.indexOf('arcade-tile-scenes-v0253.js')<html.indexOf('arcade-amie.js'),'Tile scene manifest must load before arcade-amie.js');
console.log('PASS v0.25.3 release contract');
