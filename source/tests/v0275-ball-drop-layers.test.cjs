'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');
const ids=['ballDropBackboardCanvas','ballDropPinsCanvas','ballDropPrizeCanvas','ballDropPowerupCanvas','ballDropBallCanvas','ballDropEffectsCanvas'];
for(const id of ids){
  const matches=html.match(new RegExp(`id="${id}"\\s+width="720"\\s+height="1004"`,'g'))||[];
  assert.equal(matches.length,1,`${id} must exist exactly once at 720x1004`);
}
assert.doesNotMatch(html,/id="ballDropCanvas"/,'legacy single Ball Drop canvas must be removed');
assert.match(html,/id="ballDropAimSurface"/,'dedicated aim surface is required');
const machine=html.match(/<div class="ball-drop-machine">([\s\S]*?)<\/div>\s*<div class="game-actions ball-drop-actions">/);
assert.ok(machine,'Ball Drop machine markup should remain grouped');
assert.match(machine[1],/id="ballDropToastStack"/,'toast DOM stays in machine');
assert.match(machine[1],/id="ballDropLanding"/,'landing DOM stays in machine');
assert.match(css,/\.ball-drop-machine\{[^}]*aspect-ratio:720\/1004/,'machine owns the 720/1004 aspect ratio');
assert.match(css,/\.ball-drop-machine canvas\{[^}]*position:absolute;[^}]*inset:0;[^}]*width:100%;[^}]*height:100%/,'all canvases must be pixel-aligned');
assert.match(css,/\.ball-drop-aim-surface\{[^}]*position:absolute;[^}]*inset:0/,'aim surface covers the same board rectangle');
console.log('PASS v0.27.5 Ball Drop layer structure');
const js=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-ball-drop.js'),'utf8');
for(const fn of ['renderBackboard','renderPins','renderPrizeSlot','renderPrizeBoard','renderPowerups','renderBalls','renderEffects','renderAllLayers']){
  assert.match(js,new RegExp(`function ${fn}\\(`),`${fn} must exist`);
}
assert.match(js,/function renderBackboard\([\s\S]*?BOARD_CONFIG\.slotTop[\s\S]*?BOARD_CONFIG\.floorY/,'backboard must own integrated well geometry');
const prizeFn=(js.match(/function drawPrizeSlot\([\s\S]*?\n\s*\}/)||[''])[0];
assert.ok(prizeFn,'drawPrizeSlot must exist');
assert.doesNotMatch(prizeFn,/fillRect\(/,'prize content must not paint an opaque slot underlay');
assert.match(prizeFn,/ctx\.clip\(\)/,'prize content and glow must stay clipped inside its own well');
assert.match(js,/function draw\(\)\{return renderAllLayers\(\);\}/,'legacy draw must delegate to explicit full layered render');
console.log('PASS v0.27.5 Ball Drop render ownership');
assert.doesNotMatch(js,/ballSprite\.onload=\(\)=>draw\(\)/,'ball sprite readiness must not redraw the whole machine');
assert.doesNotMatch(js,/img\.onload=\(\)=>draw\(\)/,'prize image readiness must not redraw the whole machine');
assert.match(js,/function prepareTurn\([\s\S]*?return true;\n\s*\}/,'prepareTurn must remain explicit and bounded');
assert.doesNotMatch(js,/function prepareTurn\([^\n]*\)[^\n]*\bdraw\(/,'prepareTurn must not redraw the whole machine');
assert.match(js,/function aimFromPointer\([^\n]*ballDropAimSurface[^\n]*renderBalls\(\)[^\n]*return true;/,'pointer aiming must use the aim surface and redraw only balls');
assert.match(js,/function animate\([\s\S]*?renderBalls\(\);renderEffects\(now\);/,'animation frames redraw only balls/effects');
assert.match(js,/async function hydratePrizeForSlot\([\s\S]*?renderPrizeSlot\(slot\);return prize;/,'hydration redraws only the current slot');
assert.match(js,/function refreshPrizeSlot[\s\S]*?renderPrizeSlot\(slot\)[\s\S]*?hydratePrizeForSlot\(model,slot\)/,'won slot refresh redraws only that slot');
assert.match(js,/function checkPowerups[\s\S]*?clearPowerupRegion\(p\)[\s\S]*?renderRun\(\);\}/,'collecting one pickup must clear only its own region');
assert.doesNotMatch(js,/function checkPowerups\([\s\S]*?renderRun\(\);draw\(\);/,'pickup collection must not redraw the whole board');
console.log('PASS v0.27.5 targeted redraw contract');

const ballDrop=require(path.join(root,'app/src/main/assets/arcade-ball-drop.js'));
const persistent=ballDrop.createRun();
persistent.prizeBoard=ballDrop.generatePrizeBoard(()=>0.5);persistent.prizeBoardInitialized=true;
const identities=persistent.prizeBoard.slice();
ballDrop.refreshPrizeSlot(persistent,1,()=>0.2);ballDrop.refreshPrizeSlot(persistent,5,()=>0.8);
for(const i of [0,2,3,4,6])assert.equal(persistent.prizeBoard[i],identities[i],`refreshing two landed slots must preserve untouched slot ${i}`);
assert.notEqual(persistent.prizeBoard[1],identities[1]);assert.notEqual(persistent.prizeBoard[5],identities[5]);
console.log('PASS v0.27.5 independent multi-slot persistence');
