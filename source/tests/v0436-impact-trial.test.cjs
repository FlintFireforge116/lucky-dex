const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const asset=p=>path.join(root,'app/src/main/assets',p);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Gold Rock rare-odds select binds numeric saved values instead of going blank',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(app,/function setRareOddsSelectValue\(/);
  assert.match(app,/Number\(option\.value\)===numeric/);
  assert.match(app,/setRareOddsSelectValue\(el,/);
});

test('Impact Trial core makes clean Harden execution stronger than raw Defense while Defense still mitigates hits',()=>{
  const C=require(asset('arcade-impact-trial-core.js'));
  const hazard=C.HAZARDS[0];
  const perfectLow=C.resolveHarden({hazard,difficulty:'normal',defense:45,hitValue:10,totalValue:10,integrity:100});
  const roughElite=C.resolveHarden({hazard,difficulty:'normal',defense:200,hitValue:2,totalValue:10,integrity:100});
  const sameLow=C.resolveHarden({hazard,difficulty:'normal',defense:50,hitValue:6,totalValue:10,integrity:100});
  const sameHigh=C.resolveHarden({hazard,difficulty:'normal',defense:150,hitValue:6,totalValue:10,integrity:100});
  assert.equal(perfectLow.damage,0,'perfect Harden play should avoid all damage even with low Defense');
  assert.ok(roughElite.damage>0,'high Defense must not erase weak Harden play');
  assert.ok(sameHigh.damage<sameLow.damage,'equal execution should still reward higher Defense');
});

test('Impact Trial has five varied Harden patterns, difficulty scaling and a two-percent Golden Hazard roll',()=>{
  const C=require(asset('arcade-impact-trial-core.js'));
  assert.equal(C.HAZARDS.length,5);
  assert.equal(new Set(C.HAZARDS.map(h=>h.mode)).size,5);
  assert.ok(C.HAZARDS.some(h=>h.mode==='lanes'));
  assert.ok(C.HAZARDS.some(h=>/128\.png/.test(h.sprite)),'Tauros should provide the fast charging hazard');
  assert.ok(C.difficultyProfile('easy').timeScale>C.difficultyProfile('normal').timeScale);
  assert.ok(C.difficultyProfile('normal').timeScale>C.difficultyProfile('hard').timeScale);
  assert.equal(C.rollGoldenHazard(()=>.0199,.02),true);
  assert.equal(C.rollGoldenHazard(()=>.02,.02),false);
});

test('Impact Trial run can be cleared by skilled Harden play and stops when integrity reaches zero',()=>{
  const C=require(asset('arcade-impact-trial-core.js'));
  const skilled=C.createRun({difficulty:'normal',participant:{baseStat:45},rng:()=>.8,goldenRate:0});
  while(!skilled.finished)C.applyHarden(skilled,{hitValue:10,totalValue:10,targetsHit:10,targetsTotal:10});
  assert.equal(skilled.integrity,100);
  assert.equal(skilled.fullClear,true);
  const rough=C.createRun({difficulty:'hard',participant:{baseStat:45},rng:()=>.8,goldenRate:0});
  while(!rough.finished)C.applyHarden(rough,{hitValue:0,totalValue:10,targetsHit:0,targetsTotal:10});
  assert.ok(rough.integrity<=0||rough.hazards.length===C.HAZARDS.length);
});

test('Challenge Course participant adapter exposes Defense from bundled species data',()=>{
  global.LuckyDexAdventureSpecies={byId:{25:{id:25,name:'Pikachu',types:['electric'],baseStats:{attack:55,defense:40,speed:90}}},fallback:{baseStats:{attack:60,defense:60,speed:60}}};
  global.state={pokemon:{'25:n':{id:25,name:'Pikachu',level:12}},arcade:{}};
  delete require.cache[require.resolve(asset('arcade-platform.js'))];
  const P=require(asset('arcade-platform.js'));
  const rows=P.challengeParticipants('defense');
  assert.equal(rows.length,1);
  assert.equal(rows[0].baseStat,40);
  assert.equal(rows[0].statKey,'defense');
});

test('Impact Trial is a playable Goldenrod Challenge Course game with a testable rare event',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  const session=read('app/src/main/assets/arcade-session.js');
  assert.match(world,/id:"dashCourse"[^\n]+games:\['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition'\]/);
  assert.match(world,/impactTrial:'Impact Trial'/);
  assert.match(world,/impactTrial:\(\)=>window\.LuckyDexImpactTrial/);
  assert.match(html,/id="impactTrialGame"/);
  assert.match(html,/arcade-impact-trial\.css/);
  assert.match(html,/arcade-impact-trial-core\.js/);
  assert.match(html,/arcade-impact-trial\.js/);
  assert.match(html,/id="rareImpactTrialGoldenOddsSelect"/);
  assert.match(app,/impactTrialGolden:\.02/);
  assert.match(app,/rareImpactTrialGoldenOddsSelect:'impactTrialGolden'/);
  assert.match(session,/impactTrial:\{run:/);
});

test('Impact Trial persistence, records and achievements cover mastery, Hard clear and Golden Hazard',()=>{
  const platform=read('app/src/main/assets/arcade-platform.js');
  const records=read('app/src/main/assets/arcade-records.js');
  const ach=read('app/src/main/assets/achievements-v0341.js');
  assert.match(platform,/impactTrial:\{gamesPlayed:0,fullClears:0,hardClears:0,noDamageClears:0/);
  assert.match(records,/impactTrial:a=>/);
  for(const id of ['impact_trial_first','impact_trial_10','impact_trial_full_clear','impact_trial_hard_clear','impact_trial_perfect','impact_trial_mastery','impact_trial_golden'])assert.match(ach,new RegExp(id));
});

test('Impact Trial uses the local Dome arena, pixel art and an unmistakable Golden Hazard reward path',()=>{
  const js=read('app/src/main/assets/arcade-impact-trial.js');
  const css=read('app/src/main/assets/arcade-impact-trial.css');
  assert.match(css,/power-trial-dome\.svg/);
  assert.match(css,/image-rendering:pixelated/);
  assert.match(js,/GOLDEN HAZARD/);
  assert.match(js,/LuckyDexRareRewardBridge/);
  assert.match(js,/LuckyDexVoltorbGiftCore/);
  assert.match(js,/rewardReveals:/);
});

test('current release identity is aligned',require('./helpers/current-target-range-release.cjs'));
