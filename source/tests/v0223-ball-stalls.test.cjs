const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

// The real drop callback runs against a controlled clock; only canvas and timer I/O
// are replaced. Removing recovery or reintroducing the narrow edge gap stalls it.
function harness(seed=1){
  let clock=0,nextId=0,randomState=seed>>>0;
  const frames=new Map(),timers=new Map();
  const context=new Proxy({}, {get:(_,key)=>key==='createLinearGradient'||key==='createRadialGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
  const makeCanvas=()=>({width:720,height:1004,getContext:()=>context});
  const elements={
    ballDropBackboardCanvas:makeCanvas(),ballDropPinsCanvas:makeCanvas(),ballDropPrizeCanvas:makeCanvas(),ballDropPowerupCanvas:makeCanvas(),ballDropBallCanvas:makeCanvas(),ballDropEffectsCanvas:makeCanvas(),
    ballDropAimSurface:{getBoundingClientRect:()=>({left:0,width:720}),addEventListener(){},setPointerCapture(){},releasePointerCapture(){}},
    ballDropBtn:{disabled:false},ballDropLanding:{hidden:true,classList:{toggle(){},remove(){}}}
  };
  const math=Object.create(Math);math.random=()=>{randomState=(1664525*randomState+1013904223)>>>0;return randomState/4294967296;};
  const sandbox={Math:math,performance:{now:()=>clock},document:{getElementById:id=>elements[id]||null},requestAnimationFrame:fn=>{const id=++nextId;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:fn=>{const id=++nextId;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),LuckyDexArcadeSession:{update(){},hideResult(){}},console};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js'),'utf8'),sandbox);
  return {api:sandbox.LuckyDexBallDropV0180,elements,frames,timers,
    seed(value){randomState=value>>>0;},
    tick(){clock+=16;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(clock));},
    land(model,maxFrames=1875){let ticks=0;while(model.round===0&&ticks<maxFrames){this.tick();ticks++;}return ticks*.016;}
  };
}

const wedge=harness(1),wedged=wedge.api.startRun();wedge.api.dropBall();
// Screenshot trap: 60px ball, left wall and outer row-5 peg (62,515).
Object.assign(wedged.ball,{x:30,y:491,vx:0,vy:0,omega:0});
const wedgeTime=wedge.land(wedged);
assert.equal(wedged.round,1,`phone wall/peg wedge must reach a slot within 30s; ended at ${wedged.ball.x},${wedged.ball.y}`);
assert.equal(wedged.ballsRemaining,2);
assert.ok(Number.isInteger(wedged.settledSlot)&&wedged.settledSlot>=0&&wedged.settledSlot<=6);assert.ok(wedged.score>=0,'new prize model should still settle to a valid reward');
console.log(`PASS forced phone wedge landed after ${wedgeTime.toFixed(3)}s`);

// Even if a previously wedged state is resumed, recovery must choose a nearby
// collision-free continuation, keep its radius, and not grant a bonus itself.
const oldPegs=[];for(let row=0;row<7;row++){const count=row%2?7:6,margin=row%2?62:112;for(let i=0;i<count;i++)oldPegs.push({id:`${row}:${i}`,x:margin+i*(720-margin*2)/(count-1),y:145+row*74,r:10});}
const trapped={x:30,y:491,r:30,collisionR:16,vx:0,vy:0,omega:0,angle:0,pinHits:0,pinCooldown:{}};
let recovered=false,oldSlot=null;
for(let i=1;i<=3750&&oldSlot===null;i++){
  const before={x:trapped.x,y:trapped.y,pinHits:trapped.pinHits,recoveries:trapped.recoveries||0};
  oldSlot=wedge.api.stepBall(trapped,.008,i*8,oldPegs);
  if(trapped.recoveries>before.recoveries){
    recovered=true;assert.equal(trapped.pinHits,before.pinHits,'watchdog must not award pin hits');
    assert.equal(trapped.r,30);
    assert.ok(Math.hypot(trapped.x-before.x,trapped.y-before.y)<12,'watchdog must not teleport the ball to a new continuation point');
    assert.ok(Math.hypot(trapped.vx,trapped.vy)>0,'watchdog should recover with velocity only');
    assert.ok(trapped.x>=16&&trapped.x<=704);
  }
}
assert.notEqual(oldSlot,null,'previous wedge state must continue to a real slot with the corrected collision radius');
assert.equal(oldSlot,0,'left-edge wedge must continue locally, not jump to a jackpot');
const pins=wedge.api.pegs();
const edgePins=pins.filter(pin=>pin.edge);
assert.ok(edgePins.length>=8,'edge half-pins should intentionally break up wall-hugging straight drops');
assert.ok(edgePins.every(pin=>pin.x>0&&pin.x<720),'edge pins should sit visually inside the board boundary');
assert.ok(edgePins.every(pin=>{const gap=pin.x<360?pin.x-pin.r:720-(pin.x+pin.r);return gap<wedge.api.BALL_COLLISION_RADIUS*2;}),'edge pins must not leave a ball-sized wall wedge');
for(const pin of pins.filter(pin=>!pin.edge)){
  const diameter=wedge.api.BALL_COLLISION_RADIUS*2;
  assert.ok(wedge.api.BOARD_CONFIG.slotTop-(pin.y+pin.r)>=diameter,'a full-size ball must fit above dividers');
  for(const other of pins.filter(other=>!other.edge))if(pin!==other)assert.ok(Math.hypot(pin.x-other.x,pin.y-other.y)-pin.r-other.r>=diameter,'a full-size ball must fit between adjacent interior pegs');
}
console.log(`PASS corrected collision clears the old wedge${recovered?' with velocity-only watchdog assist':''}, local slot ${oldSlot}`);

const aims=[0,1,10,25,40,50,60,75,90,99,100];let worst=0,total=0;
const sim=harness(123456);
for(let seed=1;seed<=8;seed++)for(const aim of aims){
  sim.seed(seed*11+aims.indexOf(aim));const model=sim.api.startRun();sim.api.setAimX(model,aim/100*720);sim.api.dropBall();
  const elapsed=sim.land(model);worst=Math.max(worst,elapsed);total++;
  assert.equal(model.round,1,`drop ${total}, aim ${aim} never landed: ${JSON.stringify(model.ball)}`);
  assert.ok(Number.isInteger(model.settledSlot)&&model.settledSlot>=0&&model.settledSlot<=6);
  assert.equal(model.ballsRemaining,model.totalBalls-model.round);assert.ok(model.totalBalls>=3&&model.totalBalls<=5);assert.equal(model.finished,false);
}
sim.api.stop();assert.equal(sim.frames.size,0);assert.equal(sim.timers.size,0);
const cancelled=sim.api.startRun();sim.api.dropBall();sim.tick();sim.api.stop();for(let i=0;i<20;i++)sim.tick();assert.equal(cancelled.round,0);
const reentered=sim.api.startRun();sim.api.dropBall();sim.land(reentered);assert.equal(reentered.round,1);assert.equal(cancelled.round,0);
console.log(`PASS ${total} production RAF drops; worst ${worst.toFixed(3)}s; cancel/reentry clean`);

(async()=>{
  const {launch}=require('../scripts/recovery-browser.cjs');const browser=await launch();
  try{
    const page=await browser.newPage({viewport:{width:393,height:873},hasTouch:true,isMobile:true}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.setContent('<div class="ball-drop-machine"><canvas id="ballDropBackboardCanvas" width="720" height="1004"></canvas><canvas id="ballDropPinsCanvas" width="720" height="1004"></canvas><canvas id="ballDropPrizeCanvas" width="720" height="1004"></canvas><canvas id="ballDropPowerupCanvas" width="720" height="1004"></canvas><canvas id="ballDropBallCanvas" width="720" height="1004"></canvas><canvas id="ballDropEffectsCanvas" width="720" height="1004"></canvas><div id="ballDropAimSurface" style="position:absolute;inset:0"></div><div id="ballDropLanding" hidden></div></div><button id="ballDropBtn">DROP BALL</button>');
    await page.evaluate(()=>{
      window.pendingBallFrames=new Set();window.pendingBallTimers=new Set();
      window.ballFrameProbe={frames:0,physicsSeconds:0,last:0,maxFrameGap:0,samples:[]};
      const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),later=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window);
      window.requestAnimationFrame=callback=>{const production=callback.toString().includes('token!==model.token');let id=request(now=>{pendingBallFrames.delete(id);if(production){const gap=now-ballFrameProbe.last;ballFrameProbe.last=now;ballFrameProbe.frames++;ballFrameProbe.physicsSeconds+=Math.min(.032,gap/1000);ballFrameProbe.maxFrameGap=Math.max(ballFrameProbe.maxFrameGap,gap);}callback(now);if(production&&ballFrameProbe.frames%60===0)ballFrameProbe.samples.push({frame:ballFrameProbe.frames,physics:ballFrameProbe.physicsSeconds,ball:window.newBallRun?.ball?JSON.parse(JSON.stringify(newBallRun.ball)):null});});pendingBallFrames.add(id);return id;};
      window.cancelAnimationFrame=id=>{pendingBallFrames.delete(id);cancel(id);};
      window.setTimeout=(callback,time)=>{let id=later(()=>{pendingBallTimers.delete(id);callback();},time);pendingBallTimers.add(id);return id;};
      window.clearTimeout=id=>{pendingBallTimers.delete(id);clear(id);};
    });
    await page.addScriptTag({content:fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js'),'utf8')});
    for(let cycle=0;cycle<3;cycle++){
      await page.evaluate(()=>{ballFrameProbe={frames:0,physicsSeconds:0,last:performance.now(),maxFrameGap:0,samples:[]};window.cancelledBallRun=LuckyDexBallDropV0180.startRun();LuckyDexBallDropV0180.dropBall();});
      await page.waitForFunction(()=>ballFrameProbe.frames>0,{},{polling:100,timeout:8000});
      await page.evaluate(()=>LuckyDexBallDropV0180.stop());
      await page.waitForTimeout(80);
      assert.deepEqual(await page.evaluate(()=>({round:cancelledBallRun.round,frames:pendingBallFrames.size,timers:pendingBallTimers.size})),{round:0,frames:0,timers:0});
    }
    // Chromium can be starved under the full release suite: the diagnostic
    // reproduction delivered only 1.72 physics seconds in 15.32 wall seconds,
    // with a 2.996s native RAF gap. Landing has a physics-time bound; drive the
    // same browser callback with a controlled clock, rather than weakening it
    // with a longer wall-time timeout. Native lifecycle checks above stay real.
    await page.evaluate(()=>{
      window.controlledBallFrames=new Map();let frameId=100000;
      window.requestAnimationFrame=callback=>{const id=++frameId;controlledBallFrames.set(id,callback);pendingBallFrames.add(id);return id;};
      window.cancelAnimationFrame=id=>{controlledBallFrames.delete(id);pendingBallFrames.delete(id);};
      let seed=73;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
      window.newBallRun=LuckyDexBallDropV0180.startRun();
    });
    assert.equal(await page.locator('#ballDropBtn').isEnabled(),true);
    await page.locator('#ballDropBtn').click();
    const browserLanding=await page.evaluate(()=>{
      let now=performance.now(),ticks=0;const started=now;
      while(newBallRun.round===0&&ticks<1875){
        now+=16;ticks++;const frames=[...controlledBallFrames.entries()];controlledBallFrames.clear();
        for(const [id,callback] of frames){pendingBallFrames.delete(id);callback(now);}
      }
      return {round:newBallRun.round,frames:ticks,physicsSeconds:ticks*.016,wallSeconds:(performance.now()-started)/1000,ball:newBallRun.ball,slot:newBallRun.settledSlot};
    });
    assert.equal(browserLanding.round,1,'browser production RAF must land within 30 physics seconds: '+JSON.stringify(browserLanding));
    assert.ok(Number.isInteger(browserLanding.slot)&&browserLanding.slot>=0&&browserLanding.slot<=6);
    console.log(`PASS browser production RAF landed in ${browserLanding.physicsSeconds.toFixed(3)} physics seconds (${browserLanding.frames} frames)`);
    assert.equal(await page.evaluate(()=>cancelledBallRun.round),0,'cancelled browser run cannot receive a later landing');
    // Cancelling the landing hold must remove its timer as well as live motion.
    await page.evaluate(()=>LuckyDexBallDropV0180.stop());
    assert.deepEqual(await page.evaluate(()=>({frames:pendingBallFrames.size,timers:pendingBallTimers.size})),{frames:0,timers:0});
    assert.deepEqual(errors,[]);console.log('PASS native browser RAF cancellation, reentry, bounded browser slot landing and landing-hold cleanup');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
