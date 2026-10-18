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

// Edge half-pins must look inside the frame but leave no wedge channel between
// their collision circle and the physical wall for the main ball.
{
  const edges=b.pegs().filter(p=>p.edge);
  assert.ok(edges.length>=8);
  for(const p of edges){
    assert.ok(p.x>0 && p.x<b.BOARD_CONFIG.width,'edge pin centre should be visually inside the board');
    const wallGap=p.x<b.BOARD_CONFIG.width/2 ? p.x-p.r : b.BOARD_CONFIG.width-(p.x+p.r);
    assert.ok(wallGap < b.BALL_COLLISION_RADIUS*2,'edge pin must not leave a ball-sized wedge beside the wall');
  }
}

// Special pins should be unambiguously strong.
{
  const pins=[
    {id:'x',x:100,y:100,r:9,special:'explosion',hitUntil:0},
    {id:'g',x:200,y:100,r:9,special:'gravity',hitUntil:0},
    {id:'s',x:300,y:100,r:9,special:'stickyWeb',hitUntil:0},
  ];
  const explosion={x:116,y:100,r:26,collisionR:16,vx:-40,vy:60,omega:0,specialCooldown:{},pinCooldown:{}};
  b._testTriggerSpecial(explosion,pins[0],1000,pins,()=>.5);
  assert.ok(Math.hypot(explosion.vx,explosion.vy)>=650,'Explosion should violently launch the ball');
  const gravity={x:200,y:116,r:26,collisionR:16,vx:220,vy:-180,omega:1,specialCooldown:{},pinCooldown:{}};
  b._testTriggerSpecial(gravity,pins[1],1000,pins,()=>.5);
  assert.ok(gravity.vy>=500,'Gravity should immediately yank the ball downward');
  assert.ok(Math.abs(gravity.vx)<=60,'Gravity should strongly suppress sideways momentum');
  const web={x:300,y:116,r:26,collisionR:16,vx:320,vy:420,omega:4,specialCooldown:{},pinCooldown:{}};
  b._testTriggerSpecial(web,pins[2],1000,pins,()=>.5);
  assert.equal(web.vx,0,'Sticky Web should kill horizontal momentum immediately');
  assert.equal(web.vy,0,'Sticky Web should kill vertical momentum immediately');
  assert.equal(web.omega,0,'Sticky Web should kill spin immediately');
  assert.equal(web.webbedPinId,'s');
  assert.ok(Number.isFinite(web.webbedSince),'Sticky Web should track capture time for progressive seep');
  const firstSince=web.webbedSince;web.vx=25;web.vy=30;
  b._testTriggerSpecial(web,pins[2],1400,pins,()=>.5);
  assert.equal(web.webbedSince,firstSince,'continued contact with the same web pin must not reset seep progress');
  assert.notEqual(web.vx,0,'continued web contact must not repeatedly hard-reset momentum');
}

// While webbed, downward seep should strengthen over time rather than leave a
// stationary ball balanced on the peg forever.
{
  const web={id:'s',x:300,y:300,r:9,special:'stickyWeb',hitUntil:0};
  const ball={x:300,y:325,r:26,collisionR:16,vx:0,vy:0,omega:0,pinHits:0,pinCooldown:{},specialCooldown:{s:1000},slowTime:0,stallTime:0,progressY:325,recoveries:0,webbedPinId:'s',webbedSince:1000,gravityUntil:0};
  b.stepBall(ball,.002,1200,[web],720,()=>.5); const early=ball.vy;
  b.stepBall(ball,.002,2200,[web],720,()=>.5); const late=ball.vy;
  assert.ok(late>early+5,'web seep should accelerate dramatically downward with elapsed capture time');
}

// Event log must reserve exactly two rows so adding/removing notifications does
// not change document flow and move the cabinet.
const css=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/arcade.css'),'utf8');
assert.match(css,/\.ball-drop-event-log\{[^}]*height:/s,'event log needs fixed height, not only min-height');
assert.match(css,/grid-template-rows:repeat\(2,/,'event log should reserve two rows');
assert.match(css,/overflow:hidden/,'event log should clip/overlap rather than grow');

console.log('PASS v0.27.8 Ball Drop edge clearance, powered pins and fixed notification rows');
