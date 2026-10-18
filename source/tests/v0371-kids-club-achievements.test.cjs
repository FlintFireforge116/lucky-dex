'use strict';
const assert=require('node:assert/strict');
const achievements=require('../app/src/main/assets/achievements-v0341.js');

const digBase={gamesPlayed:0,wins:0,bestTimeMs:null,winsByDifficulty:{easy:0,normal:0,hard:0}};
const magBase={wins:0,bestScore:0,winsByDifficulty:{easy:0,normal:0,hard:0}};
function byId(state){return Object.fromEntries(achievements.buildCoreAchievements(()=>state).map(a=>[a.id,a]));}

const base=byId({arcade:{digDigDig:digBase,magikarpSplash:magBase}});
for(const id of ['dig_games_25','dig_all_difficulties','dig_time_7500','magikarp_wins_10','magikarp_all_difficulties','magikarp_score_30']){
  assert.ok(base[id],`missing ${id}`);
}

assert.equal(base.dig_games_25.name,'Excavation Crew');
assert.deepEqual(base.dig_games_25.reward,{coins:600,dust:30});
assert.deepEqual(base.dig_games_25.progress(),[0,25]);
assert.equal(base.dig_all_difficulties.name,'Three Layers Down');
assert.deepEqual(base.dig_all_difficulties.reward,{coins:1000,tickets:1});
assert.deepEqual(base.dig_all_difficulties.progress(),[0,3]);
assert.equal(base.dig_time_7500.name,'Mole Machine');
assert.equal(base.dig_time_7500.hidden,true);
assert.deepEqual(base.dig_time_7500.reward,{coins:1500,dust:100});
assert.deepEqual(base.dig_time_7500.progress(),[0,1]);

const digProgress=byId({arcade:{digDigDig:{...digBase,gamesPlayed:25,winsByDifficulty:{easy:2,normal:1,hard:1},bestTimeMs:7690}}});
assert.deepEqual(digProgress.dig_games_25.progress(),[25,25]);
assert.deepEqual(digProgress.dig_all_difficulties.progress(),[3,3]);
assert.deepEqual(digProgress.dig_time_7500.progress(),[0,1],'7.69s PB must not complete Mole Machine');
const digMaster=byId({arcade:{digDigDig:{...digBase,bestTimeMs:7500}}});
assert.deepEqual(digMaster.dig_time_7500.progress(),[1,1],'7.50s must complete Mole Machine');

assert.equal(base.magikarp_wins_10.name,'Splash Veteran');
assert.deepEqual(base.magikarp_wins_10.reward,{coins:800,dust:40});
assert.deepEqual(base.magikarp_wins_10.progress(),[0,10]);
assert.equal(base.magikarp_all_difficulties.name,'Master of the Pond');
assert.deepEqual(base.magikarp_all_difficulties.reward,{coins:1000,tickets:1});
assert.deepEqual(base.magikarp_all_difficulties.progress(),[0,3]);
assert.equal(base.magikarp_score_30.name,'Thirty Splash Salute');
assert.equal(base.magikarp_score_30.hidden,true);
assert.deepEqual(base.magikarp_score_30.reward,{coins:1500,dust:100});
assert.deepEqual(base.magikarp_score_30.progress(),[0,1]);

const magMaster=byId({arcade:{magikarpSplash:{...magBase,wins:10,bestScore:30,winsByDifficulty:{easy:1,normal:4,hard:2}}}});
assert.deepEqual(magMaster.magikarp_wins_10.progress(),[10,10]);
assert.deepEqual(magMaster.magikarp_all_difficulties.progress(),[3,3]);
assert.deepEqual(magMaster.magikarp_score_30.progress(),[1,1]);
const magNotYet=byId({arcade:{magikarpSplash:{...magBase,bestScore:29,winsByDifficulty:{easy:1,normal:0,hard:1}}}});
assert.deepEqual(magNotYet.magikarp_all_difficulties.progress(),[2,3]);
assert.deepEqual(magNotYet.magikarp_score_30.progress(),[0,1]);

console.log('PASS v0.37.1 Kids Club achievement expansion');
