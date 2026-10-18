'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('v0.40.13 release identity is aligned across package Android runtime and visible UI',()=>{
  const pkg=JSON.parse(read('package.json'));
  const lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle');
  const app=read('app/src/main/assets/app-v0167.js');
  const html=read('app/src/main/assets/index.html');
  const match=/^0\.40\.(\d+)$/.exec(pkg.version);
  assert.ok(match,'expected a v0.40.x release');
  const patch=Number(match[1]);
  assert.ok(patch>=13,'expected v0.40.13 or later');
  assert.equal(lock.version,pkg.version);
  assert.equal(lock.packages?.['']?.version,pkg.version);
  assert.match(gradle,new RegExp('versionCode\\s+'+(4000+patch)));
  assert.match(gradle,new RegExp("versionName\\s+'"+pkg.version.replace(/\./g,'\\.')+"'"));
  assert.ok(gradle.includes('LuckyDex-asset-builder/'+pkg.version));
  assert.ok(app.includes("window.__LUCKYDEX_BUILD='"+pkg.version+"'"));
  assert.ok((html.match(new RegExp('v'+pkg.version.replace(/\./g,'\\.'),'g'))||[]).length>=2,'expected visible current version in title/footer surfaces');
});

test('v0.40.13 cosmetics and achievement modules are packaged in startup order',()=>{
  const html=read('app/src/main/assets/index.html');
  for(const file of ['cosmetics-v0413.css','cosmetics-catalog-v0413.js','cosmetics-core-v0413.js','cosmetics-customise-v0413.js','achievement-telemetry-v0413.js','achievements-expansion-v0413.js']) assert.match(html,new RegExp(file.replace(/[.]/g,'\\.')));
  const core=html.indexOf('cosmetics-core-v0413.js'),telemetry=html.indexOf('achievement-telemetry-v0413.js'),app=html.indexOf('app-v0167.js'),expansion=html.indexOf('achievements-expansion-v0413.js'),achievements=html.indexOf('achievements-v0341.js');
  assert.ok(core>=0&&core<app);
  assert.ok(telemetry>=0&&telemetry<app);
  assert.ok(expansion>=0&&expansion<achievements);
});
