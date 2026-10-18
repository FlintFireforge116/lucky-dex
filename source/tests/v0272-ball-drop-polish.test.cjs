'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js');
delete require.cache[modPath];
global.LuckyDexArcadePlatform={awardRun:({coins})=>({coinsAwarded:coins,itemAwarded:null})};
global.LuckyDexArcadeSession={update:()=>{},hideResult:()=>{},showResult:()=>true};
global.state={arcade:{bestBallDrop:0,ballDropJackpots:0}};
global.save=()=>{};
const b=require(modPath);

assert.equal(b.BALL_RADIUS,26,'v0.27.2 main ball should be slightly smaller');
assert.equal(b.RAIN_RADIUS,18,'rain balls should retain their smaller chaos-ball size');
assert.ok(b.BALL_RADIUS>b.RAIN_RADIUS,'main ball must remain visibly larger than rain balls');
assert.ok(b.BOARD_CONFIG.height<=1140&&b.BOARD_CONFIG.height>=980,'cabinet should remain phone-fit without shrinking back to the old short board');
assert.ok(b.BOARD_CONFIG.floorY<=1090,'prize floor should sit clear of the rounded bottom crop');

const model=b.createRun();
assert.equal(model.aimX,b.BOARD_CONFIG.width/2,'a new run should aim from centre');
b.setAimX(model,-500);
assert.equal(model.aimX,b.BALL_RADIUS+8,'aim should clamp safely inside the left wall');
b.setAimX(model,9999);
assert.equal(model.aimX,b.BOARD_CONFIG.width-b.BALL_RADIUS-8,'aim should clamp safely inside the right wall');
b.setAimX(model,214);
assert.equal(model.aimX,214,'aim should accept direct board-space x positions');

const field=b.createPegField(()=>0.42);
const seqA=[.02,.18,.33,.51,.67,.84,.13,.29,.45,.61,.77,.93]; let ai=0;
const seqB=[.91,.73,.55,.37,.19,.01,.82,.64,.46,.28,.10,.88]; let bi=0;
const pa=b.generatePowerups(()=>seqA[ai++%seqA.length],field);
const pb=b.generatePowerups(()=>seqB[bi++%seqB.length],field);
assert.ok(pa.length>=1&&pa.length<=2,'run should still contain one or two power-ups');
assert.ok(pa.every(p=>Math.hypot(p.x-360,p.y-350)>1),'power-ups must not use the old hard-coded centre fallback');
assert.ok(pa.every(p=>field.every(pin=>Math.hypot(p.x-pin.x,p.y-pin.y)>=40)),'power-ups should occupy clear pockets between pins');
assert.notDeepEqual(pa.map(p=>[Math.round(p.x),Math.round(p.y)]),pb.map(p=>[Math.round(p.x),Math.round(p.y)]),'different runs should vary pickup positions');

const persistent=b.createRun();
persistent.pegField=field;
b.prepareTurn(persistent,()=>0.25);
const firstRef=persistent.powerups;
const firstLayout=firstRef.map(p=>[p.id,p.x,p.y]);
firstRef[0].collected=true;
b.prepareTurn(persistent,()=>0.81);
assert.equal(persistent.powerups,firstRef,'power-up array should persist across manual balls');
assert.deepEqual(persistent.powerups.map(p=>[p.id,p.x,p.y]),firstLayout,'power-up positions should not reroll each ball');
assert.equal(persistent.powerups[0].collected,true,'a collected power-up must remain gone for the rest of the game');

const eventModel=b.createRun();
for(let n=1;n<=6;n++)b.addEvent(eventModel,`EVENT ${n}`,'coin');
assert.deepEqual(eventModel.events.map(e=>e.message),['EVENT 6','EVENT 5','EVENT 4','EVENT 3','EVENT 2'],'persistent log should retain newest five events');
assert.deepEqual(eventModel.toasts.map(e=>e.message),['EVENT 6','EVENT 5','EVENT 4','EVENT 3','EVENT 2'],'temporary toast stack should also cap at five, pushing out the oldest');

console.log('PASS v0.27.2 Ball Drop controls, persistent pickups, placement and event model');
