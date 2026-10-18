const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const asset=p=>path.join(root,'app/src/main/assets',p);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Power Trial core makes execution more important than Attack while Attack still helps',()=>{
  const C=require(asset('arcade-power-trial-core.js'));
  const perfectMid=C.strikePower({attack:90,chargeQuality:1,impactQuality:1,difficulty:'normal'});
  const poorElite=C.strikePower({attack:180,chargeQuality:.25,impactQuality:.25,difficulty:'normal'});
  const perfectHigh=C.strikePower({attack:150,chargeQuality:1,impactQuality:1,difficulty:'normal'});
  const perfectLow=C.strikePower({attack:50,chargeQuality:1,impactQuality:1,difficulty:'normal'});
  assert.ok(perfectMid.power>poorElite.power,'strong execution must overcome a large Attack advantage');
  assert.ok(perfectHigh.power>perfectLow.power,'equal execution must still reward higher Attack');
});

test('Power Trial charge peaks then falls away and impact rewards centre timing',()=>{
  const C=require(asset('arcade-power-trial-core.js'));
  const p=C.difficultyProfile('normal');
  assert.ok(C.chargeQuality(p.chargePeakMs,p)>0.98);
  assert.ok(C.chargeQuality(p.maxChargeMs,p)<0.08,'overcharging must drain the stored force');
  assert.ok(C.impactQuality(p.impactCycleMs*.25,p)<C.impactQuality(p.impactCycleMs*.5,p));
  assert.ok(C.impactQuality(p.impactCycleMs*.5,p)>0.98);
});

test('Power Trial has five heavier targets and a 2 percent Golden Target roll',()=>{
  const C=require(asset('arcade-power-trial-core.js'));
  assert.equal(C.TARGETS.length,5);
  for(let i=1;i<C.TARGETS.length;i++)assert.ok(C.TARGETS[i].threshold>C.TARGETS[i-1].threshold);
  assert.equal(C.rollGoldenTarget(()=>0,.02),true);
  assert.equal(C.rollGoldenTarget(()=>.0199,.02),true);
  assert.equal(C.rollGoldenTarget(()=>.02,.02),false);
  assert.equal(C.rollGoldenTarget(()=>.9,.02),false);
});

test('Challenge Course participant adapter exposes Attack from bundled species data',()=>{
  global.LuckyDexAdventureSpecies={byId:{25:{id:25,name:'Pikachu',types:['electric'],baseStats:{attack:55,speed:90}}},fallback:{baseStats:{attack:60,speed:60}}};
  global.state={pokemon:{'25:n':{id:25,name:'Pikachu',level:12}},arcade:{}};
  delete require.cache[require.resolve(asset('arcade-platform.js'))];
  const P=require(asset('arcade-platform.js'));
  const rows=P.challengeParticipants('attack');
  assert.equal(rows.length,1);
  assert.equal(rows[0].baseStat,55);
  assert.equal(rows[0].statKey,'attack');
  assert.equal(rows[0].key,'25:n');
});

test('Power Trial is integrated into the existing dashCourse venue and Settings testing odds',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(world,/id:"dashCourse"[^\n]+name:"Pokémon Challenge Course"[^\n]+games:\['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition'\]/);
  assert.match(world,/powerTrial:'Power Trial'/);
  assert.match(world,/powerTrial:\(\)=>window\.LuckyDexPowerTrial/);
  assert.match(html,/id="powerTrialGame"/);
  assert.match(html,/arcade-power-trial\.css/);
  assert.match(html,/arcade-power-trial-core\.js/);
  assert.match(html,/arcade-power-trial\.js/);
  assert.match(html,/id="rarePowerTrialGoldenOddsSelect"/);
  assert.match(app,/powerTrialGolden:\.02/);
  assert.match(app,/rarePowerTrialGoldenOddsSelect:'powerTrialGolden'/);
});

test('Power Trial persistence and achievements cover runs, mastery, Hard clear and Golden Target',()=>{
  const platform=read('app/src/main/assets/arcade-platform.js');
  const ach=read('app/src/main/assets/achievements-v0341.js');
  assert.match(platform,/powerTrial:\{gamesPlayed:0,fullClears:0,hardClears:0/);
  for(const id of ['power_trial_first','power_trial_10','power_trial_full_clear','power_trial_hard_clear','power_trial_precision','power_trial_mastery','power_trial_golden'])assert.match(ach,new RegExp(id));
});

test('current release identity is aligned',require('./helpers/current-target-range-release.cjs'));
