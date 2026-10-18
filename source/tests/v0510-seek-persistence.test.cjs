const test=require('node:test');
const assert=require('node:assert/strict');
const platform=require('../app/src/main/assets/arcade-platform.js');
const achievements=require('../app/src/main/assets/achievements-v0341.js');
const records=require('../app/src/main/assets/arcade-records.js');

test('v0505 Seek saves gain exploration defaults without losing scores, counters or future fields',()=>{
  const old={gamesPlayed:12,clears:8,hardClears:2,cleanFinds:4,lostItemsFound:5,bestScore:45123,bestScores:{easy:100,normal:45123,hard:33000},bestRemainingMs:70234,bestCleanScore:41000,totalWrongFinds:10,totalListens:13,totalRoomsVisited:80,dreamSparklesSeen:3,dreamSparklesFound:2,dreamPrizes:2,futureRecord:{value:7}};
  const migrated=platform.ensureArcadeState({pokemonSeek:old,rareRewards:{attempts:{prize:{id:'reserved'}}}});
  for(const [key,value] of Object.entries(old))assert.deepEqual(migrated.pokemonSeek[key],value,key);
  assert.equal(migrated.pokemonSeek.firstSearchFinds,0);
  assert.deepEqual(migrated.pokemonSeek.areaClears,{});
  assert.deepEqual(migrated.pokemonSeek.visitedAreas,[]);
  assert.equal(migrated.rareRewards.attempts.prize.id,'reserved');
});

test('exploration migration normalizes malformed counts and clones mutable per-save collections',()=>{
  const source={pokemonSeek:{firstSearchFinds:'2',areaClears:{forest:'3',sea:-1,manor:Infinity},visitedAreas:['forest','sea','forest',null,2,'']}};
  const normalized=platform.ensureArcadeState(source).pokemonSeek;
  assert.equal(normalized.firstSearchFinds,2);
  assert.deepEqual(normalized.areaClears,{forest:3,sea:0,manor:0});
  assert.deepEqual(normalized.visitedAreas,['forest','sea']);
  normalized.areaClears.forest=99;normalized.visitedAreas.push('ice');
  assert.equal(source.pokemonSeek.areaClears.forest,'3');
  assert.deepEqual(source.pokemonSeek.visitedAreas,['forest','sea','forest',null,2,'']);
  const first=platform.ensureArcadeState({}).pokemonSeek,second=platform.ensureArcadeState({}).pokemonSeek;
  first.areaClears.forest=1;first.visitedAreas.push('forest');
  assert.deepEqual(second.areaClears,{});assert.deepEqual(second.visitedAreas,[]);
  const malformed=platform.ensureArcadeState({pokemonSeek:{firstSearchFinds:-1,areaClears:[],visitedAreas:{forest:true}}}).pokemonSeek;
  assert.equal(malformed.firstSearchFinds,0);assert.deepEqual(malformed.areaClears,{});assert.deepEqual(malformed.visitedAreas,[]);
});

test('Seek save round-trips retain exploration and future score keys',()=>{
  const saved=JSON.parse(JSON.stringify({pokemonSeek:{firstSearchFinds:2,areaClears:{forest:3,sea:1},visitedAreas:['forest','sea'],bestScores:{easy:20000,normal:35000,hard:40000,futureMode:45000}}}));
  const restored=platform.ensureArcadeState(saved).pokemonSeek;
  assert.deepEqual(restored.bestScores,{easy:20000,normal:35000,hard:40000,futureMode:45000});
  assert.equal(restored.firstSearchFinds,2);assert.deepEqual(restored.areaClears,{forest:3,sea:1});assert.deepEqual(restored.visitedAreas,['forest','sea']);
});

test('Seek achievements preserve legacy IDs and reward first-search finds and three distinct area clears',()=>{
  const state={arcade:{pokemonSeek:{firstSearchFinds:1,areaClears:{forest:5,sea:1,manor:1,ice:0},hardClears:2}}};
  const rows=achievements.buildCoreAchievements(()=>state),by=Object.fromEntries(rows.map(row=>[row.id,row]));
  for(const id of ['pokemonseek_first_find','pokemonseek_lost_item','pokemonseek_fast_find','pokemonseek_hard_clear','secret_pokemonseek_dream_sparkle','secret_pokemonseek_clean_find'])assert.ok(by[id],id);
  assert.equal(by.pokemonseek_hard_clear.name,'Dream Explorer');
  assert.deepEqual(by.pokemonseek_hard_clear.progress(),[2,1]);
  assert.ok(by.pokemonseek_first_search);assert.deepEqual(by.pokemonseek_first_search.progress(),[1,1]);
  assert.ok(by.pokemonseek_three_areas);assert.deepEqual(by.pokemonseek_three_areas.progress(),[3,3]);
  state.arcade.pokemonSeek.areaClears={forest:50,sea:0};
  assert.deepEqual(by.pokemonseek_three_areas.progress(),[1,3]);
  assert.equal(new Set(rows.map(row=>row.id)).size,rows.length);
});

test('Seek permanent records show distinct exploration and retain legacy score records',()=>{
  const sections=records.adapterFor('pokemonSeek')({pokemonSeek:{firstSearchFinds:2,areaClears:{forest:5,sea:1,manor:0},visitedAreas:['forest','sea','ice'],bestScores:{normal:45000}}});
  const rows=Object.fromEntries(sections.flatMap(section=>section.rows).map(row=>[row.label,row.value]));
  assert.equal(rows['First-Search Finds'],'2');assert.equal(rows['Areas Cleared'],'2');assert.equal(rows['Areas Visited'],'3');assert.equal(rows.Normal,'45,000');
});
