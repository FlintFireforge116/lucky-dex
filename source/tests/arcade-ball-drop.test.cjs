const assert=require('assert');
const path=require('path');
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-ball-drop.js');
delete require.cache[modPath];
let awardCalls=0,resultCalls=0,lastAward=null,lastResult=null;
global.LuckyDexArcadePlatform={
  ballDropPayout:({ordinaryPoints=0,jackpots=0}={})=>{const ordinaryCoins=ordinaryPoints<=0?0:Math.max(15,Math.min(90,Math.round(ordinaryPoints*.06)));const jackpotCoins=Math.max(0,Math.floor(jackpots))*1000;return {ordinaryCoins,jackpotCoins,totalCoins:ordinaryCoins+jackpotCoins};},
  awardRun:(args)=>{awardCalls++;lastAward=args;return {coinsAwarded:args.coins,itemAwarded:null};}
};
global.LuckyDexArcadeSession={showResult:(game,args)=>{resultCalls++;lastResult={game,...args};return true;},update:()=>{},hideResult:()=>{}};
global.state={arcade:{bestBallDrop:0,ballDropJackpots:0}};global.save=()=>{};
const b=require(modPath);
let run=b.createRun();
assert.strictEqual(run.round,0);assert.strictEqual(run.ballsRemaining,3);assert.strictEqual(run.finished,false);
assert.deepStrictEqual(b.payoutDelta({ordinaryPoints:0,jackpots:0},{ordinaryPoints:400,jackpots:0}),{ordinaryCoins:24,jackpotCoins:0,totalCoins:24});
assert.deepStrictEqual(b.payoutDelta({ordinaryPoints:400,jackpots:0},{ordinaryPoints:412,jackpots:1}),{ordinaryCoins:1,jackpotCoins:1000,totalCoins:1001});
let landed=b.applyLanding(run,{slot:2,slotPoints:400,pinBonus:24,pinHits:2});
assert.strictEqual(run.round,1);assert.strictEqual(run.ballsRemaining,2);assert.strictEqual(run.finished,false);assert.strictEqual(landed.delta.totalCoins,25);assert.ok(landed.message.includes('+25 coins'));
landed=b.applyLanding(run,{slot:3,slotPoints:1000,pinBonus:12,pinHits:1});
assert.strictEqual(run.round,2);assert.strictEqual(run.ballsRemaining,1);assert.strictEqual(run.finished,false);assert.strictEqual(landed.delta.jackpotCoins,1000);assert.ok(landed.message.includes('JACKPOT'));assert.ok(landed.message.includes('+1000'));
landed=b.applyLanding(run,{slot:0,slotPoints:150,pinBonus:0,pinHits:0});
assert.strictEqual(run.round,3);assert.strictEqual(run.ballsRemaining,0);assert.strictEqual(run.finished,true);
const expected=global.LuckyDexArcadePlatform.ballDropPayout({ordinaryPoints:run.ordinaryPoints,jackpots:run.jackpots});
assert.strictEqual(b.completeRun(run),true);assert.strictEqual(b.completeRun(run),false);assert.strictEqual(awardCalls,1);assert.strictEqual(resultCalls,1);assert.strictEqual(lastAward.coins,expected.totalCoins);assert.strictEqual(lastResult.coinsAwarded,expected.totalCoins);
console.log('PASS Ball Drop three-ball/jackpot/idempotent award models');
