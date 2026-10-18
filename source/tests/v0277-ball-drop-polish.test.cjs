'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js');
delete require.cache[modPath];
global.LuckyDexArcadePlatform={awardRun:({coins})=>({coinsAwarded:coins,itemAwarded:null})};
global.LuckyDexArcadeSession={update:()=>{},hideResult:()=>{},showResult:()=>true};
global.state={arcade:{bestBallDrop:0,ballDropJackpots:0}};
global.save=()=>{};
const b=require(modPath);

// Edge pegs should physically interrupt wall-hugging straight drops while
// remaining visually integrated with the frame. v0.27.8 moves them slightly
// inward so the visible half-pin no longer appears outside the cabinet.
{
  const pegs=b.pegs();
  const edge=pegs.filter(p=>p.edge===true);
  assert.ok(edge.length>=8,'board should have several half-pins along the edges');
  assert.ok(edge.every(p=>p.x>0&&p.x<b.BOARD_CONFIG.width),'edge pins should sit just inside the visible boundary');
  assert.ok(edge.every(p=>{const gap=p.x<b.BOARD_CONFIG.width/2?p.x-p.r:b.BOARD_CONFIG.width-(p.x+p.r);return gap<b.BALL_COLLISION_RADIUS*2;}),'edge pins must not create a ball-sized wedge channel');
  assert.ok(new Set(edge.map(p=>p.row)).size>=4,'edge half-pins should cover multiple rows');
}

// Prize wells should be the true bottom of the machine, with no exposed
// backboard strip beneath them.
assert.equal(b.BOARD_CONFIG.floorY,b.BOARD_CONFIG.height,'reward wells should extend to the board bottom');
assert.ok(b.BOARD_CONFIG.slotTop>=900,'reward wells should sit lower than v0.27.6');

// Fanfare tiers must distinguish ordinary coins from the three special wins.
assert.equal(b.fanfareKindForPrize({type:'coin'},false),'none');
assert.equal(b.fanfareKindForPrize({type:'coin'},true),'mystery');
assert.equal(b.fanfareKindForPrize({type:'card'},false),'card');
assert.equal(b.fanfareKindForPrize({type:'booster'},false),'booster');
assert.equal(b.fanfareKindForPrize({type:'card'},true),'card');

const js=fs.readFileSync(modPath,'utf8');
const css=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/arcade.css'),'utf8');
assert.match(js,/ball-drop-launch-glow/,'dropping a ball should toggle the launch-glow class');
assert.match(css,/\.ball-drop-machine\.ball-drop-launch-glow/,'launch glow should have a machine-level animation');
assert.match(css,/ballDropLaunchRed/,'launch should use a dedicated red glow animation');
assert.match(js,/triggerFanfare\('mystery'\)/,'landing on Mystery should immediately trigger Mystery fanfare');
assert.match(js,/triggerFanfare\(fanfare\)/,'resolved Card/Booster prizes should trigger their fanfare tier');
for(const kind of ['mystery','card','booster']){
  assert.match(css,new RegExp(`\\.ball-drop-machine\\.fanfare-${kind}`),`${kind} fanfare should style the whole machine`);
}
console.log('PASS v0.27.7 Ball Drop edge pins, bottom wells and fanfare contract');
