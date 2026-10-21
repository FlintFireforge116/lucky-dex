'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const records=require('../app/src/main/assets/arcade-records.js');
const gutsy=require('../app/src/main/assets/arcade-gutsy-golbat-core.js');
const furret=require('../app/src/main/assets/arcade-furret-frolic-core.js');
const topsy=require('../app/src/main/assets/arcade-topsy-turvy-core.js');
const barrier=require('../app/src/main/assets/arcade-barrier-ball-core.js');
const slots=require('../app/src/main/assets/arcade-slot-machine-core.js');
const roulette=require('../app/src/main/assets/arcade-roulette-core.js');

const read=rel=>fs.readFileSync(path.join(ROOT,rel),'utf8');

test('every competitive Arcade world game has a permanent Records adapter',()=>{
  for(const id of ['streamingStampede','delibirdDelivery']){
    assert.ok(records.SUPPORTED_GAME_IDS.includes(id),`${id} should appear in Arcade Records`);
    assert.equal(typeof records.adapterFor(id),'function',`${id} should expose a permanent record adapter`);
  }
});

test('daily reward copy agrees with the actual 300 coin claim reward before JS hydration',()=>{
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(html,/COMPLETE ALL 3 · CLAIM 🎟 \+ 300 COINS/);
  assert.doesNotMatch(html,/COMPLETE ALL 3 · CLAIM 🎟 \+ 250 COINS/);
  assert.match(app,/profile\.coins\+=300/);
});

test('regular Stadium 2 games share a sane non-jackpot payout band',()=>{
  const gutsyNormal=gutsy.rewardForResult({place:1,hearts:30,difficulty:'normal',goldenHearts:0});
  const gutsyHard=gutsy.rewardForResult({place:1,hearts:40,difficulty:'hard',goldenHearts:0});
  const furretNormal=furret.rewardForResult({place:1,score:12,difficulty:'normal'});
  const furretHard=furret.rewardForResult({place:1,score:15,difficulty:'hard'});
  for(const [label,value] of Object.entries({gutsyNormal,gutsyHard,furretNormal,furretHard})){
    assert.ok(value>=100,`${label} should still feel worthwhile (${value})`);
    assert.ok(value<=300,`${label} should not outpay several peer minigames (${value})`);
  }
  assert.ok(gutsyHard>gutsyNormal,'Hard Gutsy Golbat should retain a reward premium');
  assert.ok(furretHard>furretNormal,'Hard Furret Frolic should retain a reward premium');
});

test('Topsy-Turvy and Barrier Ball calculate rewards in their testable cores and remain in the standard payout band',()=>{
  assert.equal(typeof topsy.rewardForResult,'function');
  assert.equal(typeof barrier.rewardForResult,'function');
  for(const [label,core,metric] of [['Topsy-Turvy',topsy,5],['Barrier Ball',barrier,5]]){
    const normal=core.rewardForResult({place:1,score:metric,difficulty:'normal'});
    const hard=core.rewardForResult({place:1,score:metric,difficulty:'hard'});
    assert.ok(normal>=100&&normal<=260,`${label} normal champion reward was ${normal}`);
    assert.ok(hard>normal&&hard<=300,`${label} hard champion reward was ${hard}`);
    assert.ok(core.rewardForResult({place:4,score:0,difficulty:'normal'})<normal,`${label} placement must matter`);
  }
});


test('Mauville slots have a sustainable random-stop RTP while preserving a meaningful jackpot',()=>{
  function randomStopRtp(coinsBet){
    let payout=0, outcomes=0;
    for(let a=0;a<slots.REEL_STRIPS[0].length;a++){
      for(let b=0;b<slots.REEL_STRIPS[1].length;b++){
        for(let c=0;c<slots.REEL_STRIPS[2].length;c++){
          payout+=slots.evaluateWindow(slots.visibleWindow([a,b,c]),coinsBet).coins;
          outcomes++;
        }
      }
    }
    return (payout/outcomes)/(coinsBet*slots.BET_UNIT);
  }
  const rtps=[1,2,3].map(randomStopRtp);
  for(const [i,rtp] of rtps.entries()) assert.ok(rtp<1,`${i+1}-coin random-stop RTP must stay below 100% (was ${(rtp*100).toFixed(1)}%)`);
  assert.ok(rtps[2]>=0.85&&rtps[2]<=0.98,`max-bet random-stop RTP should reward risk without printing coins (${(rtps[2]*100).toFixed(1)}%)`);
  assert.ok(slots.payoutForLine(['red7','red7','red7']).coins>=2500,'straight 7 jackpot should still be exciting');
});

test('Mauville Roulette uses fair live multipliers as occupied pockets leave the wheel',()=>{
  const occupied=['makuhita:yellow','azurill:green','skitty:purple'];
  const round=roulette.createRound({occupied});
  const bets=[
    {kind:'slot',slotKey:'wynaut:yellow'},
    {kind:'pokemon',pokemon:'Wynaut'},
    {kind:'color',color:'yellow'}
  ];
  for(const bet of bets){
    const available=roulette.availableSlots(round).length;
    const matching=roulette.matchingSlots(round,bet).length;
    const expected=matching?available/matching:0;
    assert.equal(roulette.multiplierFor(round,bet),expected,'multiplier should track the remaining wheel, not the original 12 pockets');
    if(matching)assert.ok(Math.abs((matching/available)*roulette.multiplierFor(round,bet)-1)<1e-12,'base roulette return should not rise as pockets fill');
  }
});

test('Roulette Golden Ball remains a genuinely rare testable event rather than a common economy subsidy',()=>{
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(html,/rareRouletteGoldenBallOddsSelect[^>]*>[\s\S]*?value="0\.004"[^>]*>Vanilla[^<]*0\.4%/);
  assert.match(app,/rouletteGoldenBall:\.004/);
  assert.match(html,/rareRouletteGoldenBallOddsSelect[\s\S]*?value="1"[^>]*>Always/,'Developer forcing must remain available');
});


test('existing saves on the old Roulette Golden Ball vanilla rate migrate to the new audited rate without touching explicit test overrides',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(app,/raw\.settings\?\.rareOdds\?\.rouletteGoldenBall\)===\.02/);
  assert.match(app,/migrated\.settings\.rareOdds=\{\.\.\.\(migrated\.settings\.rareOdds\|\|\{\}\),rouletteGoldenBall:\.004\}/);
});

test('wagered Game Corner machines credit shared Arcade earnings from net profit only',()=>{
  const rouletteView=read('app/src/main/assets/arcade-roulette.js');
  const slotView=read('app/src/main/assets/arcade-slot-machine.js');
  for(const [label,src] of [['Roulette',rouletteView],['Slot Machine',slotView]]){
    assert.match(src,/const earned=Math\.max\(0,payout-wager\)/,`${label} should derive Arcade earnings from net profit`);
    assert.match(src,/stats\.arcadeCoins=Number\([^\n]*stats\.arcadeCoins\|\|0\)\+earned/,`${label} should add net profit to the shared Arcade earnings stat`);
    assert.match(src,/bumpDaily\?\.\('arcadeCoins',earned\)/,`${label} should advance the daily Arcade coin task from net profit`);
  }
  assert.doesNotMatch(rouletteView,/stats\.arcadeCoins=Number\([^\n]*\)\+payout/,'Roulette must not count returned stake as Arcade earnings');
});

test('slot machine help copy matches the actual maximum payout after the economy rebalance',()=>{
  let maxPayout=0;
  for(let a=0;a<slots.REEL_STRIPS[0].length;a++)for(let b=0;b<slots.REEL_STRIPS[1].length;b++)for(let c=0;c<slots.REEL_STRIPS[2].length;c++){
    maxPayout=Math.max(maxPayout,slots.evaluateWindow(slots.visibleWindow([a,b,c]),3).coins);
  }
  assert.equal(maxPayout,3125,'max-bet reel layout should have a deterministic audited ceiling');
  const slotView=read('app/src/main/assets/arcade-slot-machine.js');
  assert.match(slotView,new RegExp(`rewardText:'Up to ${maxPayout.toLocaleString('en-GB')} coins`));
});

test('shared Roulette session copy describes the live fair multipliers rather than the old static table',()=>{
  const sessionView=read('app/src/main/assets/arcade-session.js');
  assert.match(sessionView,/roulette:\{[^\n]*reward:'Live fair multipliers · rare Golden Ball jackpot'/);
  assert.doesNotMatch(sessionView,/roulette:\{[^\n]*Dynamic ×3 \/ ×4 \/ ×6 \/ ×12/);
});
