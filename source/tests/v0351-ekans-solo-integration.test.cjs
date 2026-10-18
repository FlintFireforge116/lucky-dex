'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('app/src/main/assets/index.html');
const world=read('app/src/main/assets/arcade-world.js');
const session=read('app/src/main/assets/arcade-session.js');
const css=read('app/src/main/assets/arcade-ekans-hoop.css');
const start=html.indexOf('<div id="ekansHoopGame"');
const end=html.indexOf('<div id="dashGame"');
const shell=html.slice(start,end);

assert.match(world,/ekansHoop:'Ekans[’'] Hoop Hurl'/);
assert.match(world,/ekansHoop:'(?:Drag, aim and release|Pull back and release) Ekans to hoop [^']+\.'/);
assert.match(session,/ekansHoop:\{run:'(?:60 seconds|50–75 seconds · Choose difficulty) · Solo hoop score attack'/);
assert.match(session,/reward:'Score tiers · Lucky Coins'/);

for(const id of ['ekansHoopGame','ekansHoopTimer','ekansHoopScore','ekansHoopStreak','ekansHoopMultiplier','ekansHoopField','ekansHoopLauncher','ekansHoopAimMarker','ekansHoopPauseOverlay','ekansHoopResume'])assert.match(shell,new RegExp(`id="${id}"`),`missing solo shell id ${id}`);
for(const removed of ['ekansHoopScores','ekansHoopCpuRow','ekansHoopLeft','ekansHoopRight','ekansHoopNear','ekansHoopMid','ekansHoopFar','ekansHoopThrow'])assert.doesNotMatch(shell,new RegExp(`id="${removed}"`),`obsolete multiplayer/button control ${removed} must be removed`);
assert.doesNotMatch(shell,/>P[234]</,'CPU score labels must be absent');

for(const asset of [
  'arcade/sprites/actors/pokemon/50.png',
  'arcade/sprites/actors/pokemon/51.png',
  'arcade/sprites/actors/pokemon/shiny/50.png',
  'arcade/sprites/actors/pokemon/shiny/51.png'
])assert.match(shell,new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`shell preloads authentic asset ${asset}`);
assert.doesNotMatch(shell,/https?:\/\//,'Ekans game shell has no runtime remote asset');
assert.doesNotMatch(css,/ekans-hoop-cpu/,'CPU presentation CSS removed');
assert.doesNotMatch(css,/ekans-hoop-controls/,'button-control CSS removed');
assert.match(css,/touch-action:none/,'touch field owns the drag gesture');

console.log('PASS v0.35.1 Ekans solo integration contract');
