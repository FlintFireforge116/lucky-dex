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

assert.ok(b.BOARD_CONFIG.pegRows>=11,'board should retain at least eleven peg rows after later phone-fit refinements');
assert.ok(b.BOARD_CONFIG.height>=980,'board should remain substantially taller than the old 760px cabinet');
const field=b.createPegField(()=>0.42);
assert.equal(new Set(field.map(p=>p.id)).size,field.length,'peg ids must be unique');
assert.ok(field.length>=70,'board should retain a dense peg field after later row-count refinements');
const specials=field.filter(p=>p.special);
assert.ok(specials.length>=4&&specials.length<=6,'a run should contain a handful of special pins');
assert.equal(specials.filter(p=>p.special==='teleport').length,2,'warp must be a paired special pin');
assert.ok(specials.some(p=>p.special==='explosion'),'deterministic field should include an explosion pin');

let seq=[0.10,0.60,0.01,0.20, 0.3,0.8,0.2,0.7,0.4,0.9,0.5,0.6];
let i=0;const rng=()=>seq[i++%seq.length];
const board=b.generatePrizeBoard(rng);
assert.equal(board.length,7);
assert.equal(board[3].type,'mystery','centre slot is always mystery');
assert.ok(board.some(x=>x.type==='card'),'board-level card roll can create a card target');
assert.ok(board.some(x=>x.type==='booster'),'board-level booster roll can create a booster target');

assert.deepEqual(b.rollMysteryReward(()=>0.00),{type:'coin',amount:100,label:'100 COINS'});
assert.deepEqual(b.rollMysteryReward(()=>0.31),{type:'coin',amount:250,label:'250 COINS'});
assert.deepEqual(b.rollMysteryReward(()=>0.56),{type:'coin',amount:500,label:'500 COINS'});
assert.equal(b.rollMysteryReward(()=>0.71).type,'card');
assert.equal(b.rollMysteryReward(()=>0.86).type,'booster');
assert.deepEqual(b.rollMysteryReward(()=>0.99),{type:'coin',amount:1000,label:'★ 1000 JACKPOT ★',jackpot:true});

assert.deepEqual(b.upgradePrize({type:'coin',amount:50,label:'50'}),{type:'coin',amount:150,label:'150 COINS'});
assert.equal(b.upgradePrize({type:'card',label:'CARD'}).type,'booster');

const run=b.createRun(()=>0.5);
assert.equal(run.totalBalls,3);assert.equal(run.round,0);assert.equal(run.ballsRemaining,3);
const extra=b.applyPowerup(run,{type:'extraBall'},null,()=>0.5);
assert.equal(extra.type,'extraBall');assert.equal(run.totalBalls,4);assert.equal(run.ballsRemaining,4);
const ball={coinMultiplier:1,rewardUpgrades:0};
b.applyPowerup(run,{type:'luckyEgg'},ball,()=>0.5);assert.equal(ball.coinMultiplier,2);
b.applyPowerup(run,{type:'masterBall'},ball,()=>0.5);assert.equal(ball.rewardUpgrades,1);

const rain=b.createRainBalls(720,()=>0.5);
assert.equal(rain.length,5,'Poké Ball Rain should spawn five balls');
assert.ok(rain.every(x=>x.isRain&&x.rewardEligible),'every rain ball must be able to win any landing reward');
assert.ok(rain.every(x=>x.r<b.BALL_RADIUS),'rain balls should be smaller than the main ball');

const pickups=b.generatePowerups(()=>0.25);
assert.ok(pickups.length>=1&&pickups.length<=2,'a run gets one or two board pickups');
assert.ok(pickups.every(p=>b.POWERUP_TYPES.includes(p.type)));

console.log('PASS v0.27.1+ chaotic Ball Drop reward/pin/power-up baseline');
