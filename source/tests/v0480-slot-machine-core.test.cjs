const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
let core=null;
try{core=require(path.join(__dirname,'..','app','src','main','assets','arcade-slot-machine-core.js'));}catch(_){}

test('slot machine core exposes faithful Gen III symbols and 1-3 coin paylines',()=>{
  assert.ok(core,'slot machine core module must exist');
  assert.deepEqual(core.BETS,[25,50,75]);
  assert.equal(core.paylinesForCoins(1).length,1);
  assert.equal(core.paylinesForCoins(2).length,3);
  assert.equal(core.paylinesForCoins(3).length,5);
  for(const id of ['red7','blue7','azurill','lotad','pikachu','cherry','replay','lightning']) assert.ok(core.SYMBOLS[id],id);
});

test('slot payouts preserve Gen III coin ratios scaled by 25 Lucky Coins',()=>{
  assert.ok(core);
  assert.equal(core.payoutForLine(['red7','red7','red7']).coins,7500);
  assert.equal(core.payoutForLine(['blue7','blue7','blue7']).coins,7500);
  assert.equal(core.payoutForLine(['red7','blue7','red7']).coins,2250);
  assert.equal(core.payoutForLine(['azurill','azurill','azurill']).coins,300);
  assert.equal(core.payoutForLine(['lotad','lotad','lotad']).coins,150);
  assert.equal(core.payoutForLine(['cherry','lotad','pikachu']).coins,50);
  assert.equal(core.payoutForLine(['replay','replay','replay']).replay,true);
  assert.equal(core.payoutForLine(['lightning','lightning','lightning']).power,3);
});

test('evaluateWindow only pays active lines and returns the best multiplier/payout',()=>{
  assert.ok(core);
  const window=[
    ['azurill','cherry','lotad'],
    ['red7','red7','red7'],
    ['pikachu','pikachu','pikachu']
  ];
  const one=core.evaluateWindow(window,1);
  assert.equal(one.lines.length,1);
  assert.equal(one.coins,7500);
  const three=core.evaluateWindow(window,3);
  assert.equal(three.lines.length,5);
  assert.ok(three.coins>=7500);
  assert.equal(three.bestLine.coins,7500);
});

test('reel time visibly slows reels and gives a finite precision spin allowance',()=>{
  assert.ok(core);
  const normal=core.createSession({machineLuck:3});
  const reel=core.activateReelTime(normal,{spins:4});
  assert.equal(reel.reelTime.active,true);
  assert.equal(reel.reelTime.spinsLeft,4);
  assert.ok(core.speedFor(reel)<core.speedFor(normal));
  const after=core.consumeReelTimeSpin(reel);
  assert.equal(after.reelTime.spinsLeft,3);
});

test('machine luck and stop slip stay bounded and deterministic with injected random',()=>{
  assert.ok(core);
  assert.equal(core.pickMachineLuck(()=>0),1);
  assert.equal(core.pickMachineLuck(()=>0.999),6);
  assert.equal(core.stopSlip({lucky:false,reelTime:false},()=>0),0);
  assert.ok(core.stopSlip({lucky:true,reelTime:false},()=>0.999)<=4);
  assert.ok(core.stopSlip({lucky:true,reelTime:true},()=>0.999)<=1);
});

test('regular Gen III stops may slip four symbols, while Reel Time stops exactly on input',()=>{
  assert.ok(core);
  assert.equal(core.stopSlip({lucky:false,reelTime:false},()=>0.999),4);
  assert.equal(core.stopSlip({lucky:true,reelTime:false},()=>0.999),4);
  assert.equal(core.stopSlip({lucky:true,reelTime:true},()=>0.999),0);
});

test('straight 7 payouts identify red versus blue and straight 7 ends Reel Time',()=>{
  assert.equal(core.payoutForLine(['red7','red7','red7']).jackpotTone,'red');
  assert.equal(core.payoutForLine(['blue7','blue7','blue7']).jackpotTone,'blue');
  const reel=core.activateReelTime(core.createSession({lucky:true}),{spins:4});
  const ended=core.consumeReelTimeSpin(reel,{straight7:true});
  assert.equal(ended.reelTime.active,false);
  assert.equal(ended.reelTime.spinsLeft,0);
});
