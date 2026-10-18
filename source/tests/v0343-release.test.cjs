const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

const gradle = read('app/build.gradle');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const html = read('app/src/main/assets/index.html');
const app = read('app/src/main/assets/app-v0167.js');
const trade = read('app/src/main/assets/trade-v0163.js');
const godPack = read('app/src/main/assets/god-pack-v0291.js');

assert.match(gradle, /applicationId 'com\.example\.luckydex'/, 'Android application ID must remain update-compatible');
const versionCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
const versionName=(gradle.match(/versionName '([^']+)'/)||[])[1];
assert.ok(versionCode>=343, 'Android versionCode must preserve v0.34.3 or later');
assert.ok(versionName.localeCompare('0.34.3',undefined,{numeric:true})>=0, 'Android versionName must preserve v0.34.3 or later');
assert.equal(pkg.version, versionName, 'package version must match Android release');
assert.equal(lock.version, versionName, 'package-lock root version must match release');
assert.equal(lock.packages[''].version, versionName, 'package-lock package version must match release');
assert.ok(html.includes('v'+versionName), 'visible app release marker must match current release');
assert.ok(app.includes("window.__LUCKYDEX_BUILD='"+versionName+"'"), 'runtime build marker must match current release');

const orderedScripts = [
  'card-rarity-v0253.js',
  'pack-policy-v0343.js',
  'card-acquisition-v0246.js',
  'pack-opening-v0160.js',
  'pack-flow-v0165.js',
  'app-v0167.js',
];
let previous = -1;
for (const script of orderedScripts) {
  const at = html.indexOf(`src="${script}"`);
  assert.ok(at > previous, `${script} must be present after the previous pack dependency`);
  previous = at;
}

assert.match(trade, /const REFRESH_HOURS\s*=\s*1\s*;/, 'trade market must refresh hourly');
assert.match(godPack, /const PRODUCTION_DENOMINATOR\s*=\s*1000\s*;/, 'God Pack denominator must remain 1000');

console.log('PASS v0.34.3 release identity, pack dependency order, hourly trades and God Pack contract');
