const assert=require('assert');
const core=require('../app/src/main/assets/arcade-rock-harden-core.js');

assert.equal(core.CONFIG.startingHp,100);
assert.equal(core.CONFIG.hardenDrainPerSecond,18);
assert.equal(core.CONFIG.perfectLeadMs,110);
assert.equal(core.CONFIG.goodLeadMs,260);
assert.equal(core.CONFIG.safetyCapMs,45000);
assert.equal(core.CONFIG.goldRoundChance,.10);
assert.deepStrictEqual(core.ROSTER.map(x=>x.dex),[11,14,204,247,266,268,412,541,544,616,665,737,825,917]);
assert.deepStrictEqual(core.REWARDS.hard,[130,90,60,35]);
assert.deepStrictEqual(core.ROCK_CLASSES.small.damage,18);
assert.deepStrictEqual(core.ROCK_CLASSES.medium.damage,26);
assert.deepStrictEqual(core.ROCK_CLASSES.heavy.damage,34);

function rngFor(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
const a=core.createRound({difficulty:'hard',rng:rngFor(1234),nowMs:500});
const b=core.createRound({difficulty:'hard',rng:rngFor(1234),nowMs:500});
assert.equal(new Set(a.racers.map(r=>r.species.dex)).size,4,'four species must be unique');
assert.deepStrictEqual(a.racers.map(r=>r.species.dex),b.racers.map(r=>r.species.dex),'same seed must choose same roster');
assert.deepStrictEqual(a.waves,b.waves,'same seed must choose same wave schedule');
assert.ok(a.racers.every(r=>r.hp===100),'all racers start on exactly 100 HP');
assert.ok(a.racers.every(r=>r.hardenDrainPerSecond===18),'species may not alter drain');
assert.ok(a.racers.every(r=>r.physicsKey==='shared'),'species may not alter physics');
const c=core.createRound({difficulty:'hard',rng:rngFor(4321),nowMs:500});
assert.notDeepStrictEqual(a.racers.map(r=>r.species.dex),c.racers.map(r=>r.species.dex),'different RNG should reroll roster');

const gold=core.createRound({difficulty:'normal',rng:()=>0,nowMs:0});
assert.equal(gold.gold.present,true,'roll below 10% must create Gold Rock');
assert.ok(gold.gold.waveIndex>=4,'Gold Rock cannot appear in first four waves');
assert.equal(gold.waves.filter(w=>w.gold).length,1,'at most one Gold replacement exists');
const noGold=core.createRound({difficulty:'normal',rng:()=>.10,nowMs:0});
assert.equal(noGold.gold.present,false,'roll at boundary 10% must not create Gold Rock');
assert.equal(noGold.waves.filter(w=>w.gold).length,0);

assert.equal(core._rollGoldPrize(()=>.399999).category,'coins');
assert.equal(core._rollGoldPrize(()=>.40).category,'dust');
assert.equal(core._rollGoldPrize(()=>.699999).category,'dust');
assert.equal(core._rollGoldPrize(()=>.70).category,'ticket');
assert.equal(core._rollGoldPrize(()=>.849999).category,'ticket');
assert.equal(core._rollGoldPrize(()=>.85).category,'card');
assert.equal(core._rollGoldPrize(()=>.949999).category,'card');
assert.equal(core._rollGoldPrize(()=>.95).category,'booster');
for(let i=0;i<100;i++){
  const prize=core._rollGoldPrize(rngFor(i+1));
  if(prize.category==='coins') assert.ok(prize.coins>=300&&prize.coins<=600);
  if(prize.category==='dust') assert.ok(prize.dust>=40&&prize.dust<=80);
}
for(let i=0;i<50;i++){
  const fallback=core._rollFallbackPrize(rngFor(900+i));
  assert.ok(['coins','dust','ticket'].includes(fallback.category));
  if(fallback.category==='coins') assert.ok(fallback.coins>=300&&fallback.coins<=600);
  if(fallback.category==='dust') assert.ok(fallback.dust>=40&&fallback.dust<=80);
}

console.log('PASS v0.38.0 Rock Harden core config/round model');

function firstImpactRound(){return core.createRound({difficulty:'normal',rng:rngFor(700),nowMs:0});}
function gradeAt(lead){
  const r=firstImpactRound(),impact=r.waves[0].impactAt;
  assert.equal(core.pressPlayer(r,impact-lead),true);
  core.advanceRound(r,impact);
  return r;
}
const perfect=gradeAt(80);
assert.equal(perfect.player.lastGrade,'perfect');
assert.equal(perfect.player.score,3);
assert.equal(perfect.player.perfects,1);
assert.equal(perfect.player.blocks,1);
assert.equal(perfect.player.hp,100-(80/1000)*18,'Perfect should pay only hold drain');
const good=gradeAt(200);
assert.equal(good.player.lastGrade,'good');
assert.equal(good.player.score,2);
const safe=gradeAt(400);
assert.equal(safe.player.lastGrade,'safe');
assert.equal(safe.player.score,1);

const miss=firstImpactRound(),missImpact=miss.waves[0].impactAt,missDamage=miss.waves[0].damage;
core.advanceRound(miss,missImpact);
assert.equal(miss.player.lastGrade,'miss');
assert.equal(miss.player.score,0);
assert.equal(miss.player.hp,100-missDamage);

const drain=firstImpactRound();
assert.equal(core.pressPlayer(drain,0),true);
core.advanceRound(drain,1000);
assert.equal(drain.player.hp,82,'Harden drains exactly 18 HP over 1000 ms');
assert.equal(core.releasePlayer(drain,1000),true);
assert.equal(drain.player.hardened,false);

const protectedRound=firstImpactRound(),protectedImpact=protectedRound.waves[0].impactAt,protectedDamage=protectedRound.waves[0].damage;
core.pressPlayer(protectedRound,protectedImpact-80);
core.advanceRound(protectedRound,protectedImpact);
assert.ok(protectedRound.player.hp>100-protectedDamage,'protected impact adds no rock damage');

const ko=firstImpactRound();
ko.player.hp=1;
core.pressPlayer(ko,0);
core.advanceRound(ko,1000);
assert.equal(ko.player.hp,0);
assert.equal(ko.player.alive,false);
assert.equal(ko.player.hardened,false,'Harden switches off at KO');
assert.ok(ko.player.koAt>0&&ko.player.koAt<=1000,'drain KO should be timestamped at exact depletion time');

const late=firstImpactRound(),lateImpact=late.waves[0].impactAt;
core.advanceRound(late,lateImpact);
const lateScore=late.player.score,lateHp=late.player.hp;
assert.equal(core.pressPlayer(late,lateImpact+1),true,'input after impact may start Harden for later rocks');
core.advanceRound(late,lateImpact+10);
assert.equal(late.player.score,lateScore,'late input cannot retroactively score the already processed rock');
assert.ok(late.player.hp<=lateHp,'late input only drains forward in time');
const processedScore=late.player.score;
core.advanceRound(late,lateImpact+500);
assert.equal(late.player.score,processedScore,'one rock can only score once');

const events=core.consumeEvents(perfect);
assert.ok(events.some(e=>e.type==='telegraph'));
assert.ok(events.some(e=>e.type==='impact'));
assert.ok(events.some(e=>e.type==='block'&&e.grade==='perfect'));
assert.equal(core.consumeEvents(perfect).length,0,'events are consumed exactly once');

console.log('PASS v0.38.0 Rock Harden player timing/HP');
