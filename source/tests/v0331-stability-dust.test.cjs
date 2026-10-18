'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

(async()=>{
  // Pack reveal regression: a graphics/frame exception must degrade the current
  // reveal to a ready/static card rather than escape as an uncaught exception.
  const pack=require(path.resolve(__dirname,'../app/src/main/assets/pack-opening-v0160.js'));
  let scheduled=null,settled=0,reported=null;
  const session=new pack.RevealSession({
    duration:100,
    raf:fn=>{scheduled=fn;return 1;},
    caf:()=>{},
    frame:()=>{throw new Error('synthetic frame failure');},
    settle:()=>{settled++;},
    onError:error=>{reported=error;}
  });
  session.start();
  assert.equal(typeof scheduled,'function');
  assert.doesNotThrow(()=>scheduled(0),'frame failure must be contained by RevealSession');
  assert.equal(session.ready,true,'failed cinematic should settle to a usable card');
  assert.equal(settled,1,'fallback settle should happen exactly once');
  assert.match(String(reported?.message||''),/synthetic frame failure/);
  let cancelError=null;
  const cancelSession=new pack.RevealSession({duration:1,raf:()=>1,caf:()=>{},frame:()=>{},settle:()=>{},onError:error=>{cancelError=error;}});
  cancelSession.ownAnimation({cancel(){throw new Error('synthetic cancel failure');}});
  assert.doesNotThrow(()=>cancelSession.skip(),'animation cancellation errors must not escape rapid pack navigation');
  assert.match(String(cancelError?.message||''),/synthetic cancel failure/);

  // Ball Drop regression: an unresolved async card/booster lookup must have a
  // deadline so Ball Rain cannot own the turn forever.
  const ballPath=path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js');
  delete require.cache[ballPath];
  const ball=require(ballPath);
  assert.equal(typeof ball.withRewardDeadline,'function','Ball Drop must expose its reward deadline helper');
  const started=Date.now();
  const timed=await ball.withRewardDeadline(new Promise(()=>{}),12);
  assert.equal(timed,null,'unresolved reward lookup should fall back after the deadline');
  assert.ok(Date.now()-started<250,'test deadline should resolve promptly');
  assert.deepEqual(await ball.withRewardDeadline(Promise.resolve({ok:true}),50),{ok:true});
  const rain=ball.createRainBalls(ball.BOARD_CONFIG.width,()=>0.5)[0];
  rain.activeTime=20.1;
  const forcedSlot=ball.stepBall(rain,0.002,1000,[],ball.BOARD_CONFIG.width,()=>0.5);
  assert.notEqual(forcedSlot,null,'a pathological auxiliary ball must not keep a turn alive forever');
  const ballSource=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js'),'utf8');
  assert.match(ballSource,/withRewardDeadline\(bridge\?\.resolveBuriedCard/,'card lookups must use the turn-safe reward deadline');
  assert.match(ballSource,/withRewardDeadline\(bridge\?\.resolveBuriedBooster/,'booster lookups must use the turn-safe reward deadline');

  // Dust exchange regression: users choose an arbitrary spare quantity instead
  // of being restricted to 1 or ALL, while the final binder copy remains protected
  // by the existing conversion function.
  const app=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
  const css=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/trade-browser-v0169.css'),'utf8');
  assert.match(app,/data-dust-qty=/,'dust rows need a quantity input');
  assert.match(app,/data-dust-convert=/,'dust rows need one quantity-aware convert action');
  assert.match(app,/data-dust-max=/,'dust rows should offer a convenient MAX selector');
  assert.doesNotMatch(app,/data-dust-all=/,'old all-or-one conversion UI should be removed');
  assert.match(css,/\.dust-qty-control/,'quantity selector needs mobile styling');

  const flow=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/pack-flow-v0165.js'),'utf8');
  const opener=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/pack-opening-v0160.js'),'utf8');
  assert.match(flow,/recordPackOpeningError/,'pack flow should persist reveal-specific diagnostics');
  assert.match(flow,/packNavigationBusy/,'pack navigation should reject concurrent rapid advances');
  assert.match(flow,/mountFallbackReveal/,'pack flow needs a no-canvas fallback when cinematic mounting fails');
  assert.match(opener,/function mountFallbackReveal/,'pack module should provide a static fallback reveal');
  assert.match(opener,/onError:options\.onError/,'cinematic frame failures should report their pack context');

  console.log('PASS v0.33.1 dust quantity + pack reveal containment + Ball Drop reward deadline');
})().catch(error=>{console.error(error);process.exitCode=1;});
