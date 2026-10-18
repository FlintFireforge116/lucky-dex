const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const manifestPath=path.join(root,'app/src/main/assets/arcade/pikachu-beach/dx/manifest.json');

test('DX manifest catalogues all required gameplay families and local files',()=>{
  assert.ok(fs.existsSync(manifestPath),'DX manifest missing');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  assert.equal(manifest.source,'superSurfingPikachuDX_v1_1.zip');
  assert.ok(Array.isArray(manifest.assets));
  const names=new Set(manifest.assets.map(x=>x.resource));
  for(const name of ['surfingpika','s_wave','s_ring','s_hpUp','s_seaking1','s_lapras','s_natu1','s_wingull','s_articuno_0','s_zapdos_0','s_moltress_0','s_lugia_idle','s_wailord_idle']){
    assert.ok(names.has(name),`missing ${name}`);
  }
  for(const asset of manifest.assets.filter(x=>x.required)){
    assert.ok(asset.local.startsWith('arcade/pikachu-beach/dx/'),`${asset.resource} escaped DX asset directory`);
    assert.ok(fs.existsSync(path.join(root,'app/src/main/assets',asset.local)),`${asset.resource} local file missing`);
    assert.ok(asset.width>0&&asset.height>0,`${asset.resource} missing dimensions`);
    assert.ok(asset.frames>=1,`${asset.resource} missing frames`);
  }
});

test('DX manifest includes browser-playable audio for core surfing actions',()=>{
  assert.ok(fs.existsSync(manifestPath),'DX manifest missing');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const audio=new Map((manifest.audio||[]).map(x=>[x.resource,x]));
  for(const name of ['a_surfing_pikachu_song','a_wave','a_playerJump','a_playerShoot','a_ironTail','a_collect','a_trick','a_playerHit','a_befriend']){
    const item=audio.get(name); assert.ok(item,`missing ${name}`);
    assert.ok(fs.existsSync(path.join(root,'app/src/main/assets',item.local)),`${name} local audio missing`);
  }
});
