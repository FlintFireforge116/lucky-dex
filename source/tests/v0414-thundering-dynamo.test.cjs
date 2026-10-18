'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');

function seq(values){let i=0;return()=>values[(i++)%values.length];}

test('Thundering Dynamo core follows lamp matching, discharge, CPU and first-full-meter rules',()=>{
  assert.equal(fs.existsSync(asset('arcade-thundering-dynamo-core.js')),true,'Dynamo core asset must exist');
  const core=require(asset('arcade-thundering-dynamo-core.js'));
  assert.equal(core.CONFIG.maxCharge,100);
  assert.equal(core.CONFIG.correctCharge,3);
  assert.equal(core.CONFIG.wrongDrain,6);
  assert.deepEqual(Object.keys(core.DIFFICULTIES),['easy','normal','hard']);
  assert.deepEqual(core.REWARDS.hard,[130,90,60,35]);

  const race=core.createRace({difficulty:'normal',rng:seq([.1,.8,.2,.7,.3,.6]),nowMs:1000});
  assert.equal(race.racers.length,4);
  assert.ok(race.racers.every(r=>[25,100].includes(r.species.dex)),'racers are Pikachu or Voltorb');
  assert.ok(['a','b'].includes(race.lamp));
  const correct=race.lamp,wrong=correct==='a'?'b':'a';
  let result=core.pressPlayer(race,correct,1010);
  assert.equal(result.accepted,true);assert.equal(result.correct,true);assert.equal(race.player.charge,3);assert.equal(race.player.correctPresses,1);
  result=core.pressPlayer(race,wrong,1020);
  assert.equal(result.accepted,true);assert.equal(result.correct,false);assert.equal(race.player.charge,0);assert.equal(race.player.wrongPresses,1);

  race.player.charge=99;race.lamp='b';
  core.pressPlayer(race,'b',1500);
  assert.equal(race.player.charge,100);assert.equal(race.player.finishedAt,1500);assert.equal(race.finalized,true,'first racer reaching full charge ends the round');
  assert.equal(core.rankRace(race)[0].id,'player');
  assert.equal(core.placeFor(race,'player'),1);
});

test('Thundering Dynamo lamp changes are scheduled and CPU difficulty affects reaction/tapping',()=>{
  const core=require(asset('arcade-thundering-dynamo-core.js'));
  const easy=core.difficultyProfile('easy'),hard=core.difficultyProfile('hard');
  assert.ok(hard.reactionMinMs<easy.reactionMinMs);
  assert.ok(hard.tapIntervalMinMs<easy.tapIntervalMinMs);
  assert.ok(hard.errorChance<easy.errorChance);
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  const initial=race.lamp,changeAt=race.nextLampAt;
  core.advanceRace(race,changeAt-1,()=>.5);assert.equal(race.lamp,initial);
  core.advanceRace(race,changeAt,()=>.5);assert.equal(race.lamp,'neutral','lamp enters the grace transition when its colour timer expires');
  core.advanceRace(race,changeAt+core.CONFIG.transitionMs,()=>.5);assert.notEqual(race.lamp,initial,'lamp alternates after the grace transition');
  assert.ok(race.nextLampAt>changeAt+core.CONFIG.transitionMs);
});

test('Kids Club contains Clefairy Says and Thundering Dynamo, with Moon Stage removed as a separate venue',()=>{
  const world=read('arcade-world.js');
  assert.doesNotMatch(world,/id:"moonStage"/,'Moon Stage must no longer be a world stop');
  assert.match(world,/id:"stadiumKidsClub"[^\n]*games:\['ekansHoop','digDigDig','magikarpSplash','rockHarden','clefairy','thunderingDynamo'(?:,'snoreWar')?(?:,'runRattataRun')?(?:,'sushiGoRound')?(?:,'clearCutChallenge')?\]/);
  assert.match(world,/clefairy:'Clefairy Says'/);
  assert.match(world,/thunderingDynamo:'Thundering Dynamo'/);
  assert.match(world,/thunderingDynamo:\(\)=>window\.LuckyDexThunderingDynamo/);
  assert.match(world,/clefairy:\{sprite:'35\.png',mechanic:'Memory · sequence'\}/);
  assert.match(world,/thunderingDynamo:\{sprite:'25\.png',mechanic:'React · rapid input'\}/);
  assert.match(world,/stadiumClassroom:'stadiumKidsClub'/,'legacy Stadium/Moon venue migration must land in Kids Club');
});

test('Dynamo shell, controls and load order are wired into the app',()=>{
  const html=read('index.html');
  assert.match(html,/<link rel="stylesheet" href="arcade-thundering-dynamo\.css" \/>/);
  const a=html.indexOf('id="thunderingDynamoGame"');assert.ok(a>0,'Dynamo game shell exists');
  const b=html.indexOf('id="dashGame"');const shell=html.slice(a,b>0?b:undefined);
  for(const id of ['thunderingDynamoGame','thunderingDynamoStage','thunderingDynamoPlace','thunderingDynamoDifficultyLabel','thunderingDynamoLamp','thunderingDynamoPlayerLane','thunderingDynamoCpu1Lane','thunderingDynamoCpu2Lane','thunderingDynamoCpu3Lane','thunderingDynamoReady','thunderingDynamoStart','thunderingDynamoButtonA','thunderingDynamoButtonB','thunderingDynamoPauseOverlay','thunderingDynamoResume','thunderingDynamoStandings'])assert.match(shell,new RegExp(`id="${id}"`),id);
  assert.doesNotMatch(shell,/thunderingDynamoTimer|thunderingDynamoCountdown/);
  for(const d of ['easy','normal','hard'])assert.match(shell,new RegExp(`data-dynamo-difficulty="${d}"`));
  assert.match(shell,/BLUE A/i);assert.match(shell,/GREEN B/i);
  const coreAt=html.indexOf('<script src="arcade-thundering-dynamo-core.js"></script>');
  const runtimeAt=html.indexOf('<script src="arcade-thundering-dynamo.js"></script>');
  const worldAt=html.indexOf('<script src="arcade-world.js"></script>');
  assert.ok(coreAt>0&&runtimeAt>coreAt&&worldAt>runtimeAt,'Dynamo core/runtime load before Arcade world');
});

test('Dynamo phone controls use shrink-safe equal grid tracks',()=>{
  const css=read('arcade-thundering-dynamo.css');
  assert.match(css,/\.dynamo-controls\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'A/B control columns must be allowed to shrink equally on phone widths');
  assert.match(css,/\.dynamo-button\{[^}]*min-width:0[^}]*width:100%/,'each Dynamo control must stay within its grid track');
});

test('Dynamo state and Arcade Records preserve career metrics',()=>{
  delete require.cache[require.resolve(asset('arcade-platform.js'))];
  global.LuckyDexArcadeRecordsCore=require(asset('arcade-records-core.js'));
  const platform=require(asset('arcade-platform.js'));
  const migrated=platform.ensureArcadeState({customMarker:'keep'});
  assert.equal(migrated.customMarker,'keep');
  assert.deepEqual(migrated.thunderingDynamo,{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0},bestAccuracy:0,totalCorrect:0,totalWrong:0});

  const records=read('arcade-records.js');
  assert.match(records,/['"]thunderingDynamo['"]/);
  assert.match(records,/thunderingDynamo:'Thundering Dynamo'/);
  assert.match(records,/bestAccuracy/i);
});
