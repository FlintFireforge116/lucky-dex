const assert=require('assert');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const ROOT=path.resolve(__dirname,'..');
const ASSETS=path.join(ROOT,'app/src/main/assets');
const core=require(path.join(ASSETS,'arcade-fossil-museum-core.js'));
const manifestPath=path.join(ASSETS,'arcade/fossil-museum-v0257/manifest.json');

const EXPECTED={
  'helix-fossil':'4abfb01a2054de5c60d931997ed0dc2c7cf38dbc',
  'dome-fossil':'f72235f64ca6361d4528a4f9d0fd647790fef6bc',
  'old-amber':'116ef68fa77cbaaed247478f3593ec3e37a2a5b5',
  'root-fossil':'df5e5c3c96e9bf619cd8c9bbcb90b3d1a9f4ec9e',
  'claw-fossil':'af10ce7ecad3cb76db10602ef4412cd1388feac9',
  'skull-fossil':'ee40c811a5d291dff703f993fac480bd814dee3a',
  'armor-fossil':'e373e0b1cb273548ec82eb4affb2e7514face97c',
  'cover-fossil':'ed48e7109b9130c4c1252b62e21e050685f05d60',
  'plume-fossil':'56bafa056b321479ed8a057f4175ca262b300de3',
  'jaw-fossil':'82b2241f7f5d74840c7042aa2ee757629609b1da',
  'sail-fossil':'2a7ec87b27ba2a3f668f762c1eb9334f5a1a7a17',
  'fossilized-bird':'6e92c963c29711325b3ff3c07e51277bfaec0032',
  'fossilized-fish':'5deb36b3c200e8fef4d71e2b89cce01f86ff7a02',
  'fossilized-dino':'8fa2ab463966c6160bb51e9e92bdbe47e5d1896d',
  'fossilized-drake':'4120ff35cb06238a5a5469e5c9675019a5320b00',
  'fire-stone':'512aab2aa6e1cda2ff740ce5e584f0ef8daf2252',
  'water-stone':'36669d6e96c69ec071a3f571e81ffdd8c843be13',
  'thunder-stone':'0b69dd2efc70a505dc27697e181e91dbbdf84f62',
  'leaf-stone':'69116e9248449bfc3a4df8c30f10b990b16c1282',
  'moon-stone':'d5f41bf9dccc6b368ec7355cfe9c5a0fef530230',
  'hard-stone':'8601b20e4b2ccde4b17f2d7ae225ca978bd4e2ad',
  'everstone':'87e69da98836271d2958e61e960420d309d1f561',
  'odd-keystone':'fd992140a6a0023726aa3dda2ec8b01305a1ba47',
  'relic-copper':'284c0d176a188a3336edcf0e5bbc45608e9fba88',
  'relic-silver':'fe049f4e14b56e5778621a3a6d04f76fd96f0862',
  'relic-gold':'de74f019899d29823d3b91c65d033eec42db7e15',
  'relic-vase':'00cbce628c479bf8e978bcabc1fca5fb01913462',
  'relic-band':'15c960a67d77dedbb7a94d984063bd28bda61141',
  'relic-statue':'c0255c5d1309e5852aa1b5efb2ea61772bf58603',
  'relic-crown':'91b301b98eb078c33dcd2795df9a9fa3101411ef',
  'comet-shard':'33db646eb21b82057ea118dda6608a7706078c59',
  'rare-bone':'73ac7470ea7d50bcf45778a6083b7dd1df4ff963',
  'poke-ball':'538b46fc6763f593950527eaf14689790560d643',
  'great-ball':'af321b012a5b0e86d5ee3f44f89a1f4197b0afb7',
  'ultra-ball':'728f552e0bfbfb3068fdea9ca9e082f44acc27ff',
  'nugget':'25b835b5b2c205b2877d2b6a2515233173cabda6',
  'big-nugget':'09a956fcecc19110cd4917ac7609f470e7aa9f15',
  'pearl':'f769f1f1ad22fae154223a1ab17163bd4b038ebe',
  'big-pearl':'ace3694a5308c155d097dd153bba33a6d84cb673',
  'stardust':'b84b29b3021a646b965a8a44003a0b52dbe70cd9',
  'star-piece':'02aa2f7caca93293d3dc23fe85e32f7f30dcffb0'
};

function gitBlobSha(file){
  const bytes=fs.readFileSync(file);
  const header=Buffer.from(`blob ${bytes.length}\0`);
  return crypto.createHash('sha1').update(Buffer.concat([header,bytes])).digest('hex');
}

assert.ok(fs.existsSync(manifestPath),'v0.25.7 provenance manifest must exist');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert.strictEqual(manifest.version,'0.25.7');

const sprites=new Set(core.CATALOGUE.map(x=>x.sprite));
for(const sprite of sprites){
  assert.ok(sprite.startsWith('arcade/fossil-museum-v0257/items/'),`active sprite must use audited v0.25.7 namespace: ${sprite}`);
  assert.ok(fs.existsSync(path.join(ASSETS,sprite)),`missing active sprite: ${sprite}`);
}

for(const [id,sha] of Object.entries(EXPECTED)){
  const file=path.join(ASSETS,`arcade/fossil-museum-v0257/items/${id}.png`);
  assert.ok(fs.existsSync(file),`missing audited sprite ${id}`);
  assert.strictEqual(gitBlobSha(file),sha,`${id} must exactly match its recorded upstream blob`);
}

const rows=new Map(manifest.items.map(x=>[x.id,x]));
assert.strictEqual(rows.size,42,'manifest must cover all 41 sourced sprites plus the TCG placeholder');
for(const [id,sha] of Object.entries(EXPECTED)){
  const row=rows.get(id);
  assert.ok(row,`manifest missing ${id}`);
  assert.strictEqual(row.sourceBlobSha,sha,`manifest SHA mismatch for ${id}`);
  assert.ok(row.sourceRepo&&row.sourcePath,`manifest must record upstream repo/path for ${id}`);
}
assert.strictEqual(rows.get('tcg-card')?.sourceType,'runtime-card-placeholder','TCG placeholder must be the only explicit non-upstream item art');
assert.ok(!JSON.stringify(manifest).includes('Existing packaged LuckyDex'),'manifest must not accept unverified LuckyDex art as provenance');

console.log(`v0.25.7 complete dig asset audit: ${Object.keys(EXPECTED).length} upstream sprites pinned + TCG runtime placeholder`);
