'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const b=require(path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js'));
const make=(extra={})=>({x:300,y:276,r:26,collisionR:16,vx:0,vy:200,omega:0,angle:0,pinHits:0,pinCooldown:{},specialCooldown:{},slowTime:0,stallTime:0,progressY:276,recoveries:0,...extra});

// A circular crown gives a vertical bounce here. A diagonal face must deflect
// sideways even when the incoming ball has no lateral velocity.
{
  const pin={id:'face',x:300,y:300,r:9,row:0,special:null};
  const ball=make({y:287});
  b.stepBall(ball,0,1000,[pin],720,()=>.5);
  assert.ok(Math.abs(ball.vx)>50,'sloped upper face must deflect a vertical impact sideways');
  assert.ok(ball.vy<200,'sloped contact must oppose inward vertical motion');
}

// Every collision must finish inside the walls; resolving an edge pin after a
// wall clamp used to push the ball outside the playfield for one frame.
for(const x of [16,704]){
  const field=b.pegs(),edge=field.find(p=>p.edge&&(x<360?p.x<360:p.x>360));
  const ball=make({x,y:edge.y,vx:x<360?-200:200,vy:0});
  b.stepBall(ball,0,1000,field,720,()=>.5);
  assert.ok(ball.x>=16&&ball.x<=704,'edge contact must finish contained');
}

// Explosion can launch upwards. The upper boundary is part of the playfield.
{
  const ball=make({x:360,y:17,vx:0,vy:-800});
  b.stepBall(ball,.002,1000,[],720,()=>.5);
  assert.ok(ball.y>=16&&ball.vy>=0,'upward power launches must rebound from the top boundary');
}

// The left/right ramps must respond as geometric mirrors, including at walls.
for(const [leftX,leftY] of [[122,112],[16,134]]){
  const left=make({x:leftX,y:leftY}),right=make({x:720-leftX,y:leftY});
  b.stepBall(left,0,1000,b.pegs(),720,()=>.5);
  b.stepBall(right,0,1000,b.pegs(),720,()=>.5);
  assert.ok(Math.abs(left.x+right.x-720)<1e-7);
  assert.ok(Math.abs(left.vx+right.vx)<1e-7);
  assert.ok(Math.abs(left.y-right.y)<1e-7&&Math.abs(left.vy-right.vy)<1e-7);
}

// A failed-contact safeguard is a tiny velocity change, not the old large kick.
{
  const ball=make({x:360,y:400,vx:0,vy:0,slowTime:2,stallTime:2,progressY:400});
  b.stepBall(ball,0,1000,[],720,()=>.01);
  assert.equal(ball.x,360);assert.equal(ball.y,400);
  assert.equal(ball.recoveries,1);
  assert.ok(Math.hypot(ball.vx,ball.vy)>0&&Math.hypot(ball.vx,ball.vy)<=20,'watchdog impulse must remain small');
  const other=make({x:360,y:400,vx:0,vy:0,slowTime:2,stallTime:2,progressY:400});
  b.stepBall(other,0,1000,[],720,()=>.99);
  assert.equal(other.vx,ball.vx);assert.equal(other.vy,ball.vy);
  const slot=make({y:940,vx:0,vy:0,slowTime:2,stallTime:2,progressY:940});
  b.stepBall(slot,0,1000,[],720,()=>.5);
  assert.equal(slot.recoveries,0,'reward wells must not trigger the watchdog');
}

function rng(seed){let state=seed>>>0;return()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};}
function land(ball,field,random,label,maxSeconds=25){
  for(let i=1;i<=maxSeconds/b.PHYSICS_MAX_STEP;i++){
    const slot=b.stepBall(ball,b.PHYSICS_MAX_STEP,1000+i*b.PHYSICS_MAX_STEP*1000,field,720,random);
    assert.ok(Number.isFinite(ball.x)&&Number.isFinite(ball.y),`${label}: coordinates must remain finite`);
    assert.ok(ball.x>=ball.collisionR-1e-6&&ball.x<=720-ball.collisionR+1e-6,`${label}: must remain contained, x=${ball.x}`);
    assert.ok(ball.y>=ball.collisionR-1e-6,`${label}: must remain below the top boundary`);
    if(slot!==null){assert.ok(slot>=0&&slot<=6);return i*b.PHYSICS_MAX_STEP;}
  }
  assert.fail(`${label} never landed: ${JSON.stringify(ball)}`);
}
let drops=0,worst=0,recoveries=0;
for(let seed=1;seed<=24;seed++)for(const x of [16,34,72,122,300,360,420,598,648,686,704]){
  const random=rng(seed*101+x),field=b.createPegField(random);
  const ball=make({x,y:96,vx:(random()-.5)*38,vy:0});
  worst=Math.max(worst,land(ball,field,random,`seed ${seed}, aim ${x}`));
  recoveries+=ball.recoveries;drops++;
}
assert.ok(recoveries<=drops*.05,`normal geometry must not rely on watchdog: ${recoveries} in ${drops} drops`);
for(let seed=1;seed<=12;seed++){
  const random=rng(seed),field=b.createPegField(random);
  for(const ball of b.createRainBalls(720,random)){worst=Math.max(worst,land(ball,field,random,`rain ${seed}`));drops++;}
}

// Resting crowns and resumed wall wedges must resolve to genuine nearby slots.
for(const pin of b.pegs().filter(p=>p.row===0)){
  const ball=make({x:pin.x,y:pin.y-25,vx:0,vy:0,progressY:pin.y-25});
  land(ball,b.pegs(),()=>.5,`rest ${pin.id}`);
}
{
  const pin=b.pegs().find(p=>!p.edge&&p.row===0);
  const tip=make({x:pin.x-9,y:pin.y-25,vx:0,vy:0,progressY:pin.y-25});
  land(tip,b.pegs(),()=>.5,'exact stationary tip');
  assert.ok(tip.recoveries<=1,'exact tip support may use only one secondary tiny impulse');
}

for(const special of b.SPECIAL_PIN_TYPES){
  const pin={id:'power',x:300,y:300,r:9,row:0,special,hitUntil:0,warpId:'pair'};
  const other={id:'destination',x:500,y:504,r:9,row:0,special:'teleport',warpId:'pair',hitUntil:0};
  const ball=make({y:278});
  b.stepBall(ball,0,2000,[pin,other],720,()=>0);
  assert.ok(pin.hitUntil>2000,`${special} must activate on the sloped face`);
  if(special==='stickyWeb')assert.equal(ball.webbedPinId,pin.id);
  if(special==='gravity')assert.ok(ball.gravityUntil>2000);
  if(special==='teleport')assert.ok(ball.y>other.y,'paired Warp must retain its destination effect');
  if(special==='metronome')assert.equal(pin.special,'explosion');
  land(ball,[pin,other],()=>.5,`${special} continuation`);
}
console.log(`PASS v0.32 sloped contacts, containment, powers, resting states, ${drops} seeded drops; worst ${worst.toFixed(3)}s; main watchdog assists ${recoveries}`);
