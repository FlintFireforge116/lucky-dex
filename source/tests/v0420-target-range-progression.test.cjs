const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const asset=n=>path.join(ROOT,'app/src/main/assets',n);
function fresh(n){const p=asset(n);delete require.cache[require.resolve(p)];return require(p);}

test('Target Range state normalizes records while preserving legacy arcade data',()=>{
  global.state={arcade:{dash:{races:9},targetRange:{gamesPlayed:3,bestScore:88,bestScores:{easy:50},bestAccuracy:70,bestBullseyes:4,bestBullseyeStreak:3,longestBullseyeM:41,goldenTargetsSeen:2,goldenTargetsWon:1,totalShots:20,totalHits:14,totalBullseyes:5,lastPokemonKey:'x'}}};
  global.LuckyDexGoldenrodState=fresh('arcade-goldenrod-state.js');
  const p=fresh('arcade-platform.js'),a=p.ensureArcadeState(global.state.arcade);
  assert.equal(a.dash.races,9);assert.equal(a.targetRange.gamesPlayed,3);assert.equal(a.targetRange.bestScore,88);
  assert.deepEqual(a.targetRange.bestScores,{easy:50,normal:0,hard:0});
  assert.equal(a.targetRange.longestBullseyeM,41);assert.equal(a.goldenrod.events.targetRange.unlockedDivision,'rookie');
});

test('bullseye streak is tracked separately from combo and resets on a non-bullseye',()=>{
  const c=fresh('arcade-target-range-core.js'),round=c.createRound({participant:{baseStat:80},profile:c.difficultyProfile('normal'),seed:2,goldenRate:0});
  round.targets=[{id:'a',x:.5,y:.5,radius:.2,distanceM:10,wind:0,motion:{type:'stationary'},armored:false},{id:'b',x:.5,y:.5,radius:.2,distanceM:10,wind:0,motion:{type:'stationary'},armored:false},{id:'c',x:.5,y:.5,radius:.2,distanceM:10,wind:0,motion:{type:'stationary'},armored:false}];round.currentIndex=0;round.complete=false;
  c.applyShot(round,{aimX:.5,aimY:.49,firedAtMs:0,focus:1});
  c.applyShot(round,{aimX:.5,aimY:.49,firedAtMs:0,focus:1});
  assert.equal(round.bestBullseyeStreak,2);
  c.applyShot(round,{aimX:.62,aimY:.49,firedAtMs:0,focus:1});
  assert.equal(round.bullseyeStreak,0);assert.equal(round.bestBullseyeStreak,2);
});

test('Golden Target receipt exists only for a bullseye win and uses the Target Range rare source',()=>{
  global.LuckyDexTargetRangeCore=fresh('arcade-target-range-core.js');
  const api=fresh('arcade-target-range.js');
  const base={score:120,hits:5,shots:6,bullseyes:2,bestCombo:1.5,bestBullseyeStreak:2,longestBullseyeM:40,goldenSeen:1,attackType:'psychic'};
  assert.equal(api.tournamentResultPayload({...base,goldenWon:0},{label:'Pack'}).rareReceipts.length,0);
  const won=api.tournamentResultPayload({...base,goldenWon:1},{label:'Pack',pending:false,reveal:{title:'GOLDEN TARGET PRIZE'}});
  assert.equal(won.rareReceipts.length,1);assert.equal(won.rareReceipts[0].source,'targetRangeGolden');assert.equal(won.rareReceipts[0].label,'Pack');
});

test('Target Range records and achievements are registered and Grand Champion now requires four Masters',()=>{
  const records=fs.readFileSync(asset('arcade-records.js'),'utf8'),ach=fs.readFileSync(asset('achievements-v0341.js'),'utf8');
  assert.match(records,/targetRange:'Target Range'/);assert.match(records,/Best Accuracy/);assert.match(records,/Longest Bullseye/);assert.match(records,/Golden Targets/);
  for(const id of ['target_range_first','target_range_bullseye','target_range_streak','target_range_longshot','target_range_golden','goldenrod_target_master'])assert.ok(ach.includes(id),id);
  assert.match(ach,/\['dash','powerTrial','impactTrial','targetRange'\]/);
  assert.match(ach,/Goldenrod Grand Champion[\s\S]{0,500},4\]/);
});

test('rare odds settings include a configurable Target Range Golden Target control',()=>{
  const html=fs.readFileSync(asset('index.html'),'utf8'),app=fs.readFileSync(asset('app-v0167.js'),'utf8'),runtime=fs.readFileSync(asset('arcade-target-range.js'),'utf8');
  assert.match(html,/rareTargetRangeGoldenOddsSelect/);assert.match(app,/targetRangeGolden:\.02/);assert.match(app,/rareTargetRangeGoldenOddsSelect:'targetRangeGolden'/);
  assert.match(runtime,/getOrCreateAttempt\(root\.state,'targetRangeGolden'/);assert.match(runtime,/claimGoldenPrize/);assert.match(runtime,/completionHandled/);
});
