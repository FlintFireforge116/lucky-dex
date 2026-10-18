'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const assetRoot=path.join(root,'app/src/main/assets');
const manifestPath=path.join(assetRoot,'arcade/fossil-museum-v0253/manifest.json');
assert.ok(fs.existsSync(manifestPath),'v0.25.3 authentic museum asset manifest must exist');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert.ok(Array.isArray(manifest.items)&&manifest.items.length>=30,'manifest must cover museum exhibit sprites');
const ids=new Set(),files=new Set();
for(const row of manifest.items){
  assert.ok(row.id&&row.file&&row.source,`manifest row needs id/file/source: ${JSON.stringify(row)}`);
  assert.ok(!ids.has(row.id),`duplicate manifest id ${row.id}`);ids.add(row.id);
  files.add(row.file);
  assert.match(row.file,/^arcade\/fossil-museum-v0253\/items\//,`${row.id} must use v0.25.3 authentic set`);
  const full=path.join(assetRoot,row.file);
  assert.ok(fs.existsSync(full),`missing ${row.file}`);
  const b=fs.readFileSync(full);
  assert.equal(b.subarray(1,4).toString('ascii'),'PNG',`${row.file} must decode as PNG signature`);
}
const platinumAlphaIds=['helix-fossil','dome-fossil','root-fossil','claw-fossil','skull-fossil','armor-fossil','odd-keystone'];
for(const id of platinumAlphaIds){
  const row=manifest.items.find(x=>x.id===id),b=fs.readFileSync(path.join(assetRoot,row.file));
  assert.equal(b[25],6,`${id} Platinum sprite must be converted to RGBA so the mining colour-key background is transparent`);
}
const sources=fs.readFileSync(path.join(assetRoot,'arcade/fossil-museum-v0253/SOURCES.md'),'utf8');
for(const row of manifest.items)assert.ok(sources.includes(row.id),`SOURCES.md must document ${row.id}`);
const core=require('../app/src/main/assets/arcade-fossil-museum-core.js');
const museum=core.CATALOGUE.filter(x=>x.museumEligible);
assert.ok(museum.length>=30);
for(const item of museum){
  assert.ok(ids.has(item.id),`manifest missing museum item ${item.id}`);
  assert.match(item.sprite,/^arcade\/fossil-museum-v025[3-9]\/items\//,`${item.id} should point at the active authentic sprite set`);
  assert.doesNotMatch(item.sprite,/fossil-museum-v0252\/mining/);
}
console.log('PASS v0.25.3 authentic museum/mining asset contract');
