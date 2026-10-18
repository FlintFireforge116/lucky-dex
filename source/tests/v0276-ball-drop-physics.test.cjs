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

assert.equal(b.BALL_RADIUS,26,'visual draw radius stays at the approved v0.27.5 size');
assert.equal(b.BALL_COLLISION_RADIUS,16,'main-ball collision should match the opaque ~32px Poké Ball sprite, not its transparent 52px draw box');
assert.equal(b.RAIN_COLLISION_RADIUS,11,'rain collision radius should preserve its smaller visual footprint');
assert.equal(b.PHYSICS_MAX_STEP,.002,'pin contact integration should use 2ms substeps to keep pin correction below visible jump thresholds');
assert.deepEqual(b.SPECIAL_PIN_TYPES,['explosion','teleport','stickyWeb','gravity','metronome']);

// A visually clear gap must stay clear. At 30px centre separation, a 16px
// visible ball plus a 9px pin has 5px clearance; the old 26px collision radius
// incorrectly pushed the ball sideways here.
{
  const ball={x:100,y:100,r:26,collisionR:16,vx:0,vy:0,omega:0,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:0,stallTime:0,progressY:100};
  const pin={id:'normal',x:130,y:100,r:9,special:null};
  b.stepBall(ball,0,0,[pin],720,()=>.5);
  assert.equal(ball.x,100,'pin collision must not extend beyond the visible ball + pin radii');
}

// Anti-stall recovery may add velocity, but must never relocate the ball.
{
  const ball={x:360,y:400,r:26,collisionR:16,vx:0,vy:0,omega:0,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:.9,stallTime:1.4,progressY:400,recoveries:0};
  const before={x:ball.x,y:ball.y};
  b.stepBall(ball,0,1000,[],720,()=>.5);
  assert.equal(ball.x,before.x,'stall recovery must not teleport sideways');
  assert.equal(ball.y,before.y,'stall recovery must not teleport downward');
  assert.equal(ball.recoveries,1,'stall recovery should still be recorded');
  assert.ok(Math.hypot(ball.vx,ball.vy)>0,'stall recovery should use a velocity nudge');
}

// Sticky Web should suppress bounce while the ball remains on that peg.
{
  const pin={id:'web',x:300,y:300,r:9,special:'stickyWeb',hitUntil:0};
  const ball={x:324,y:300,r:26,collisionR:16,vx:-180,vy:80,omega:0,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:0,stallTime:0,progressY:300};
  b.stepBall(ball,0,2000,[pin],720,()=>.5);
  assert.equal(ball.webbedPinId,'web');
  assert.ok(Math.abs(ball.vx)<25,'Sticky Web should kill almost all horizontal bounce');
  assert.ok(Math.abs(ball.vy)<25,'Sticky Web should kill almost all vertical bounce');
}

// Explosion is radial and deterministic: a ball contacting the right side
// must be blasted right, not receive the old random Bounce kick.
{
  const pin={id:'boom',x:300,y:300,r:9,special:'explosion',hitUntil:0};
  const ball={x:324,y:300,r:26,collisionR:16,vx:-20,vy:0,omega:0,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:0,stallTime:0,progressY:300};
  b.stepBall(ball,0,3000,[pin],720,()=>.99);
  assert.ok(ball.vx>250,'Explosion should blast strongly away from the pin');
  assert.ok(Math.abs(ball.vy)<80,'side-on Explosion should remain mostly horizontal');
}

// Gravity is a temporary downward-force effect, not a lateral speed kick.
{
  const pin={id:'grav',x:300,y:300,r:9,special:'gravity',hitUntil:0};
  const ball={x:324,y:300,r:26,collisionR:16,vx:-20,vy:0,omega:0,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:0,stallTime:0,progressY:300};
  b.stepBall(ball,0,4000,[pin],720,()=>.1);
  assert.ok(ball.gravityUntil>4000,'Gravity pin should arm a temporary gravity boost');
  const vx=ball.vx,vy=ball.vy;
  b.stepBall(ball,.1,4010,[],720,()=>.1);
  assert.ok(ball.vy-vy>200,'Gravity pin should make downward acceleration substantially stronger than normal');
  assert.ok(Math.abs(ball.vx-vx)<5,'Gravity pin should not create a sideways launch');
}

// Metronome chooses once, visibly becomes that pin, and stays that way.
{
  const pin={id:'metro',x:300,y:300,r:9,special:'metronome',hitUntil:0};
  const first={x:324,y:300,r:26,collisionR:16,vx:-20,vy:0,omega:0,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:0,stallTime:0,progressY:300};
  b.stepBall(first,0,5000,[pin],720,()=>0);
  assert.equal(pin.special,'explosion','Metronome should reveal and become its rolled effect for the rest of the game');
  const second={x:324,y:300,r:26,collisionR:16,vx:-20,vy:0,omega:0,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:0,stallTime:0,progressY:300};
  b.stepBall(second,0,6000,[pin],720,()=>.99);
  assert.ok(second.vx>250,'revealed Metronome pin should retain the same Explosion effect');
}


// Substep refinement must not change drag: two 2ms steps should closely match
// one 4ms step when there are no collisions or special effects.
{
  const make=()=>({x:360,y:200,r:26,collisionR:16,vx:180,vy:70,omega:1.2,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:0,stallTime:0,progressY:200});
  const fine=make(),coarse=make();
  b.stepBall(fine,.002,1000,[],720,()=>.5);b.stepBall(fine,.002,1002,[],720,()=>.5);
  b.stepBall(coarse,.004,1000,[],720,()=>.5);
  assert.ok(Math.abs(fine.vx-coarse.vx)<.03,'horizontal damping must be time-based, not substep-count based');
  assert.ok(Math.abs(fine.omega-coarse.omega)<.001,'spin damping must be time-based, not substep-count based');
}

const source=fs.readFileSync(modPath,'utf8');
assert.match(source,/Math\.ceil\(dt\/PHYSICS_MAX_STEP\)/,'RAF integration should respect the exported 2ms physics step');
console.log('PASS v0.27.6 Ball Drop collision, anti-teleport and move-pin contract');
