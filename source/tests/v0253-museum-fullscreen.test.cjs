'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('app/src/main/assets/index.html');
const css=read('app/src/main/assets/arcade.css');

assert.match(html,/museum-game-v0253/,'museum needs dedicated v0.25.3 fullscreen scene');
assert.match(html,/museum-scene-v0253/,'museum needs a scene-first surface');
assert.match(html,/museum-room-frame-v0253/,'room/exhibit overlay needs a fixed-aspect frame');
assert.doesNotMatch(html,/museum-info-v0252/,'permanent museum side column must be retired');
assert.doesNotMatch(html,/museum-copy-v0252/,'permanent explanatory copy must be retired');
assert.match(html,/id="museumBackOverlay"[^>]*data-exit-game/,'Back must be a scene overlay control');
assert.match(html,/id="museumExhibitCount"[^>]*museum-count-overlay-v0253/,'exhibit count must overlay the scene');
assert.match(html,/id="museumPlaque"[^>]*museum-plaque-v0253[^>]*hidden/,'plaque must begin hidden as an overlay');
assert.match(html,/arcade\/fossil-museum-v0252\/oreburgh-museum-dppt-landscape-v0252\.png/,'fullscreen view must keep the authentic genuine-case Oreburgh room');

assert.match(css,/\.museum-game-v0253\s*\{[^}]*position:fixed[^}]*inset:0/s,'museum game must cover the available app viewport');
assert.match(css,/\.museum-scene-v0253\s*\{[^}]*width:100%[^}]*height:100%/s,'scene must use the full museum viewport');
assert.match(css,/\.museum-room-frame-v0253\s*\{[^}]*aspect-ratio:576\s*\/\s*400/s,'room frame must preserve room geometry');
assert.match(css,/\.museum-room-frame-v0253[^}]*img[^}]*image-rendering:pixelated/s,'room must use nearest-neighbour pixel rendering');
assert.match(css,/\.museum-exhibit-v0250\s+img[^}]*image-rendering:pixelated/s,'exhibit sprites must use nearest-neighbour pixel rendering');
assert.match(css,/\.museum-plaque-v0253\s*\{[^}]*position:absolute/s,'plaque must overlay rather than reflow the room');

// Runtime geometry and orientation are part of the contract.
global.LuckyDexFossilMuseumCore=require('../app/src/main/assets/arcade-fossil-museum-core.js');
const museum=require('../app/src/main/assets/arcade-fossil-museum.js');
const expectedCases=['topA','topB','topC','outerTop','outerMid','outerLow','innerUpper','innerLower','pedestal'].sort();
assert.deepEqual(Object.keys(museum.MUSEUM_CASES).sort(),expectedCases,'only genuine Oreburgh cases/pedestal may be used');
const slots=[];
for(const [id,placement] of Object.entries(museum.MUSEUM_PLACEMENT)){
  assert.ok(expectedCases.includes(placement[0]),`${id} references unknown case ${placement[0]}`);
  const slot=museum.museumSlotFor(id);
  assert.ok(slot,`${id} must resolve to a slot`);
  assert.ok(slot.x>0&&slot.x<100&&slot.y>0&&slot.y<100&&slot.w>0,`${id} slot must stay inside the room`);
  slots.push({id,...slot});
}
for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++){
  const a=slots[i],b=slots[j]; if(a.caseId!==b.caseId)continue;
  const dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y),min=(a.w+b.w)*0.42;
  assert.ok(dx>=min||dy>=min,`${a.id} and ${b.id} overlap in ${a.caseId}`);
}
assert.equal(museum.museumSlotFor('odd-keystone').caseId,'pedestal','Odd Keystone stays on the central pedestal');
const runtime=read('app/src/main/assets/arcade-fossil-museum.js');
assert.match(runtime,/setOrientation\?\.\('landscape'\)/,'museum open requests landscape');
assert.match(runtime,/setOrientation\?\.\('portrait'\)/,'museum close restores portrait');
console.log('PASS v0.25.3 fullscreen Oreburgh museum contract');
