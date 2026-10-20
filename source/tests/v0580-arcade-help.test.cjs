'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

function worldGameIds(){
  const world=read('arcade-world.js');
  const body=world.match(/const GAME_NAMES=\{([^;]+)\};/s)?.[1]||'';
  return [...body.matchAll(/(?:^|,)([A-Za-z0-9]+):/g)].map(m=>m[1]);
}

test('shared Arcade help assets exist and load before arcade-world',()=>{
  assert.equal(fs.existsSync(path.join(ASSETS,'arcade-help.js')),true,'arcade-help.js missing');
  assert.equal(fs.existsSync(path.join(ASSETS,'arcade-help.css')),true,'arcade-help.css missing');
  const html=read('index.html');
  assert.match(html,/arcade-help\.css/);
  assert.match(html,/arcade-help\.js/);
  assert.ok(html.indexOf('arcade-help.js')<html.indexOf('arcade-world.js'),'help must load before world lifecycle');
});

test('every current Arcade game has complete shared instructions',()=>{
  const ids=worldGameIds();
  assert.ok(ids.length>=40,'current Arcade registry should include the expanded game set');
  const help=require(path.join(ASSETS,'arcade-help.js'));
  assert.deepEqual(help.gameIds().sort(),ids.sort());
  for(const id of ids){
    const row=help.getInstructions(id);
    assert.ok(row,`${id} instructions missing`);
    assert.ok(String(row.name||'').trim(),`${id} name missing`);
    for(const key of ['goal','controls','rules','tip'])assert.ok(String(row[key]||'').trim(),`${id} ${key} missing`);
  }
});

test('help seen state is normalized per known game and old saves remain valid',()=>{
  delete require.cache[require.resolve(path.join(ASSETS,'arcade-help.js'))];
  delete require.cache[require.resolve(path.join(ASSETS,'arcade-platform.js'))];
  const platform=require(path.join(ASSETS,'arcade-platform.js'));
  const out=platform.ensureArcadeState({coins:12,helpSeen:{dash:true,quiz:1,topsyTurvy:false,unknownGame:true,'':true}});
  assert.equal(out.coins,12);
  assert.deepEqual(out.helpSeen,{dash:true});
  assert.deepEqual(platform.ensureArcadeState({}).helpSeen,{});
});


test('platform preserves seen flags even if help loads after platform in a nonstandard harness',()=>{
  const platformPath=path.join(ASSETS,'arcade-platform.js');
  delete globalThis.LuckyDexArcadeHelp;
  delete require.cache[require.resolve(platformPath)];
  const platform=require(platformPath);
  const out=platform.ensureArcadeState({helpSeen:{dash:true,quiz:false}});
  assert.deepEqual(out.helpSeen,{dash:true});
});

test('help module exposes first-time, info and cleanup lifecycle APIs',()=>{
  const src=read('arcade-help.js');
  for(const api of ['showFirstTime','showInfo','activate','deactivate','isOpen','close'])assert.match(src,new RegExp(`\\b${api}\\b`));
  assert.match(src,/FIRST PLAY/);
  assert.match(src,/HOW TO PLAY/);
  assert.match(src,/BACK TO GAME/);
  assert.match(src,/Goal/);
  assert.match(src,/Controls/);
  assert.match(src,/Rules/);
  assert.match(src,/Tip/);
  const css=read('arcade-help.css');
  assert.match(css,/arcade-game-help-button/);
  assert.match(css,/position:fixed/);
  assert.match(css,/env\(safe-area-inset-top\)/);
  assert.match(css,/z-index:\s*1[2-9]\d{3}/);
});
