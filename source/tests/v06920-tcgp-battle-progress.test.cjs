const test=require('node:test');
const assert=require('node:assert/strict');
const decks=require('../app/src/main/assets/tcgp-battle-decks.js');
const progress=require('../app/src/main/assets/tcgp-battle-progress.js');
const solo=require('../app/src/main/assets/tcgp-battle-solo.js');

function baseState(){return {profile:{coins:10,dust:5},tcgpBattle:{stats:{wins:2}}};}

test('records wins and grants Beginner rewards once per challenge',()=>{
  const state=baseState();
  const battle={phase:'finished',winner:'player',reason:'points',turnNumber:17};
  const challenge=solo.challengeById('genetic-apex-beginner-ivysaur');
  const first=progress.recordResult(state,battle,challenge);
  assert.equal(first.firstClear,true);
  assert.deepEqual(first.reward,{coins:100,dust:50});
  assert.equal(state.profile.coins,110);
  assert.equal(state.profile.dust,55);
  assert.equal(state.tcgpBattle.stats.matches,1);
  assert.equal(state.tcgpBattle.stats.wins,3);
  assert.equal(state.tcgpBattle.stats.bestWinTurns,17);
  assert.equal(state.tcgpBattle.firstClears[challenge.id],true);

  const duplicate=progress.recordResult(state,battle,challenge);
  assert.equal(duplicate.alreadyRecorded,true);
  assert.equal(state.profile.coins,110);
  assert.equal(state.tcgpBattle.stats.matches,1);
});

test('repeat clears and losses do not create a currency farming loop',()=>{
  const challenge=solo.challengeById('genetic-apex-beginner-ivysaur');
  const state={profile:{coins:0,dust:0},tcgpBattle:{firstClears:{[challenge.id]:true}}};
  const repeat={phase:'finished',winner:'player',reason:'points',turnNumber:23};
  const repeated=progress.recordResult(state,repeat,challenge);
  assert.deepEqual(repeated.reward,{coins:0,dust:0});
  assert.equal(state.profile.coins,0);
  assert.equal(state.tcgpBattle.stats.wins,1);

  const loss={phase:'finished',winner:'opponent',reason:'turn-limit',turnNumber:50};
  const lost=progress.recordResult(state,loss,challenge);
  assert.deepEqual(lost.reward,{coins:0,dust:0});
  assert.equal(state.tcgpBattle.stats.matches,2);
  assert.equal(state.tcgpBattle.stats.losses,1);
});
