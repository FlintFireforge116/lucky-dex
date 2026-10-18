'use strict';
const assert=require('node:assert/strict');
globalThis.LuckyDexArcadeRecordsCore=require('../app/src/main/assets/arcade-records-core.js');
globalThis.LuckyDexArcadePlatform=require('../app/src/main/assets/arcade-platform.js');
globalThis.state={stats:{perfectBerryRounds:7},arcade:globalThis.LuckyDexArcadePlatform.ensureArcadeState({
  bestBerryPicker:{easy:12,normal:24,hard:36},bestTilePuzzle:{easy:50.25,normal:70.5,hard:null},voltorbLevel:4,bestBallDrop:1234,ballDropJackpots:6,bestUnown:800,bestQuiz:900,bestQuizEndless:12,
  museum:{exhibits:{a:{discovered:true},b:{discovered:true}}},dash:{races:10,wins:4,podiums:8,bestTimeMs:12345,quickBestTimes:{easy:11111,normal:12222,hard:null,expert:null}},
  ekansHoop:{gamesPlayed:3,wins:1,bestScore:50,bestStreak:4,totalHoops:20,shinyHits:1},digDigDig:{gamesPlayed:2,wins:1,podiums:2,bestTimeMs:8000,bestTimes:{easy:8000}},magikarpSplash:{gamesPlayed:2,wins:1,podiums:2,bestScore:31,bestQuickChain:8},rockHarden:{gamesPlayed:2,wins:1,podiums:2,bestScore:42,goldRewardsClaimed:1}
})};
let saves=0; globalThis.save=()=>{saves++;};
let after=['old'];
globalThis.LuckyDexAchievements={
 snapshotCompletedArcadeIds:()=>after.slice(),
 describeAchievementIds:ids=>ids.map(id=>({id,name:'Name '+id,icon:'*',desc:'desc',hidden:false}))
};
let records;
try{records=require('../app/src/main/assets/arcade-records.js');}catch(e){console.error(e.message);process.exit(1);}
assert.deepEqual(records.SUPPORTED_GAME_IDS,['berryPicker','tilePuzzle','voltorb','ballDrop','berry','clefairy','fossil','unown','quiz','dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition','roulette','slotMachine','ekansHoop','digDigDig','magikarpSplash','rockHarden','thunderingDynamo','snoreWar','runRattataRun','sushiGoRound','clearCutChallenge','gutsyGolbat','furretFrolic','topsyTurvy','barrierBall','pichuPowerPlant','rampageRollout','iceCreamScoop','wailordWaterSpout','pokemonSeek','picross','pikachuBeach']);
for(const id of records.SUPPORTED_GAME_IDS)assert.ok(records.adapterFor(id),`adapter ${id}`);
assert.equal(records.adapterFor('museum'),null);
assert.ok(records.getPermanent('dash').flatMap(s=>s.rows).some(r=>r.label==='Wins'&&r.value==='4'));
assert.ok(records.getPermanent('rockHarden').flatMap(s=>s.rows).some(r=>r.label==='Gold Rewards Claimed'&&r.value==='1'));
assert.ok(records.getPermanent('tilePuzzle').flatMap(s=>s.rows).some(r=>r.label==='Easy'&&r.value==='50.25s'),'Tile Puzzle PBs are stored in seconds and must display as seconds');

const before=records.captureAchievementSnapshot(); assert.deepEqual([...before],['old']);
after=['old','new'];
let review=records.commitReview('dash',{title:'RACE COMPLETE',metricLabel:'PLACE',metricValue:'1ST',rewards:[{label:'Lucky Coins',value:'+100'}]},{achievementBefore:before,historyKey:'dash:one',completedAt:100});
assert.equal(review.achievements.length,1); assert.equal(review.achievements[0].id,'new'); assert.equal(records.getRecent('dash').length,1); assert.equal(saves,1);
records.commitReview('dash',{title:'RACE COMPLETE',metricLabel:'PLACE',metricValue:'1ST'},{achievementBefore:before,historyKey:'dash:one',completedAt:100});
assert.equal(records.getRecent('dash').length,1); assert.equal(saves,1,'dedupe must not save');
for(let i=0;i<12;i++)records.commitReview('dash',{title:'R'+i,metricValue:String(i)},{achievementBefore:records.captureAchievementSnapshot(),historyKey:'d:'+i,completedAt:200+i});
assert.equal(records.getRecent('dash').length,10); assert.equal(records.getRecent('dash')[0].entryId,'d:11');
state.arcade.records.games.futureGame={recent:[{entryId:'f',completedAt:1,title:'future'}]}; assert.equal(records.adapterFor('futureGame'),null); assert.ok(state.arcade.records.games.futureGame);

const oldAch=globalThis.LuckyDexAchievements; globalThis.LuckyDexAchievements=null;
const unavailable=records.captureAchievementSnapshot(); assert.equal(unavailable.length,0); assert.equal(unavailable.available,false);
globalThis.LuckyDexAchievements=oldAch; after=['old','ancient','new'];
review=records.commitReview('quiz',{title:'DONE'},{achievementBefore:unavailable,historyKey:'quiz:no-snapshot',completedAt:500});
assert.equal(review.achievements.length,0,'unavailable before snapshot must not mislabel older achievements as new');

const oldSave=globalThis.save; globalThis.save=()=>{throw new Error('disk full');};
assert.doesNotThrow(()=>records.commitReview('quiz',{title:'SAFE'},{achievementBefore:records.captureAchievementSnapshot(),historyKey:'quiz:persist-fail',completedAt:501}));
globalThis.save=oldSave;
console.log('PASS v0.39.0 arcade records registry');
