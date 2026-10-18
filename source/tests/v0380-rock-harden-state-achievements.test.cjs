const assert=require('assert');
const platform=require('../app/src/main/assets/arcade-platform.js');
const session=require('../app/src/main/assets/arcade-session.js');
const achievements=require('../app/src/main/assets/achievements-v0341.js');

const defaults={
  gamesPlayed:0,wins:0,podiums:0,bestScore:0,
  bestScores:{easy:0,normal:0,hard:0},
  winsByDifficulty:{easy:0,normal:0,hard:0},
  bestPerfects:0,perfectBlocks:0,totalBlocks:0,bestHpRemaining:0,
  goldRocksSeen:0,goldRocksPerfected:0,goldRewardsClaimed:0
};
const base=platform.ensureArcadeState({});
assert.deepStrictEqual(base.rockHarden,defaults);

const migrated=platform.ensureArcadeState({
  unrelated:{keep:true},
  rockHarden:{gamesPlayed:7,wins:3,bestScore:21,bestScores:{hard:31},winsByDifficulty:{normal:2},bestPerfects:9,goldRocksSeen:4}
});
assert.deepStrictEqual(migrated.unrelated,{keep:true});
assert.equal(migrated.rockHarden.gamesPlayed,7);
assert.equal(migrated.rockHarden.wins,3);
assert.equal(migrated.rockHarden.bestScore,21);
assert.deepStrictEqual(migrated.rockHarden.bestScores,{easy:0,normal:0,hard:31});
assert.deepStrictEqual(migrated.rockHarden.winsByDifficulty,{easy:0,normal:2,hard:0});
assert.equal(migrated.rockHarden.bestPerfects,9);
assert.equal(migrated.rockHarden.goldRocksSeen,4);

const malformed=platform.ensureArcadeState({
  keepMe:{yes:true},
  rockHarden:{
    gamesPlayed:undefined,wins:null,podiums:NaN,bestScore:-4,bestPerfects:'bad',perfectBlocks:-1,totalBlocks:Infinity,bestHpRemaining:-2,
    goldRocksSeen:'oops',goldRocksPerfected:undefined,goldRewardsClaimed:-7,
    bestScores:{easy:undefined,normal:NaN,hard:19},winsByDifficulty:{easy:null,normal:'bad',hard:-1}
  }
});
assert.deepStrictEqual(malformed.keepMe,{yes:true});
assert.deepStrictEqual(malformed.rockHarden,{
  ...defaults,bestScores:{easy:0,normal:0,hard:19}
},'malformed Rock Harden state must normalize every numeric field without deleting unrelated Arcade state');

assert.ok(session.GAME_RULES.rockHarden,'Rock Harden session metadata missing');
assert.match(session.GAME_RULES.rockHarden.run,/Harden/i);
assert.match(session.GAME_RULES.rockHarden.run,/HP|rock/i);
assert.match(session.GAME_RULES.rockHarden.reward,/Placement/i);

const blank={arcade:{rockHarden:{...defaults}}};
const rows=achievements.buildCoreAchievements(()=>blank);
const by=Object.fromEntries(rows.map(x=>[x.id,x]));
const expected={
  rock_harden_first_win:['Rock Solid',{coins:300,dust:20}],
  rock_harden_games_25:['Quarry Regular',{coins:600,dust:30}],
  rock_harden_hard_win:['Hard as Steel',{coins:600,dust:30}],
  rock_harden_all_difficulties:['Three Times Hardened',{coins:1000,tickets:1}],
  rock_harden_perfect_10:['Perfect Form',{coins:900,dust:60}],
  rock_harden_hp_50:['Still Standing',{coins:800,dust:50}]
};
for(const [id,[name,reward]] of Object.entries(expected)){
  assert.ok(by[id],`${id} missing`);
  assert.equal(by[id].name,name);
  assert.deepStrictEqual(by[id].reward,reward);
  const progress=by[id].progress();
  assert.equal(progress[0],0,`${id} missing values must remain locked`);
}
blank.arcade.rockHarden.wins=1;
blank.arcade.rockHarden.gamesPlayed=25;
blank.arcade.rockHarden.winsByDifficulty={easy:1,normal:1,hard:1};
blank.arcade.rockHarden.bestPerfects=10;
blank.arcade.rockHarden.bestHpRemaining=50;
blank.arcade.rockHarden.goldRocksPerfected=1;
for(const id of Object.keys(expected))assert.ok(by[id].progress()[0]>=by[id].progress()[1],`${id} should unlock at exact threshold`);

const badState={arcade:{rockHarden:{wins:'no',gamesPlayed:NaN,winsByDifficulty:{easy:'x'},bestPerfects:undefined,bestHpRemaining:-1,goldRocksPerfected:'no'}}};
const badBy=Object.fromEntries(achievements.buildCoreAchievements(()=>badState).map(x=>[x.id,x]));
for(const id of Object.keys(expected))assert.equal(badBy[id].progress()[0],0,`${id} malformed values must not unlock`);

console.log('PASS v0.38.0 Rock Harden state, session metadata and achievements');
