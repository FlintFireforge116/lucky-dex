'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const corePath=path.join(__dirname,'../app/src/main/assets/arcade-streaming-stampede-core.js');
const core=require(corePath);

function sequence(values){let i=0;return()=>values[i++%values.length];}

test('Streaming Stampede keeps the original five-question scoring structure',()=>{
  assert.deepEqual(core.ROUND_MAX_POINTS,[10,10,20,20,40]);
  const match=core.createMatch({difficulty:'normal',rng:sequence([.1,.7,.2,.8,.3,.9])});
  assert.equal(match.rounds.length,5);
  assert.notEqual(match.rounds[0].targetId,'all');
  assert.notEqual(match.rounds[3].targetId,'all');
  assert.equal(match.rounds[4].targetId,'all');
  assert.equal(match.rounds.reduce((n,r)=>n+r.maxPoints,0),100);
});

test('each generated question has a truthful count and distractors before the final all-Pokemon question',()=>{
  const match=core.createMatch({difficulty:'normal',rng:sequence([.01,.12,.23,.34,.45,.56,.67,.78,.89,.95])});
  for(const round of match.rounds.slice(0,4)){
    const actual=round.stream.filter(p=>p.speciesId===round.targetId).length;
    assert.equal(round.actualCount,actual);
    assert.ok(round.stream.some(p=>p.speciesId!==round.targetId),'expected distractor Pokémon');
  }
  const final=match.rounds[4];
  assert.equal(final.actualCount,final.stream.length);
});

test('Normal difficulty is slightly calmer than Hard and the final all-Pokemon count is no longer extreme',()=>{
  const easy=core.roundConfigFor(4,'easy');
  const normal=core.roundConfigFor(4,'normal');
  const hard=core.roundConfigFor(4,'hard');
  assert.ok(easy.max<hard.max);
  assert.ok(normal.max<hard.max);
  assert.ok(normal.gapMin>hard.gapMin);
  assert.ok(normal.travelMin>hard.travelMin);
  assert.ok(normal.entryMs>=1500);
  const match=core.createMatch({difficulty:'normal',rng:sequence([.13,.23,.33,.43,.53,.63,.73,.83,.93])});
  const final=match.rounds[4];
  assert.ok(final.actualCount<=28,`expected calmer final round, got ${final.actualCount}`);
  assert.equal(final.entryDurationMs,1500);
});

test('A counts during the stream and the post-stream entry window, then locks at reveal',()=>{
  const match=core.createMatch({difficulty:'normal',rng:sequence([.2,.4,.6,.8])});
  core.beginRound(match,0,1000);
  assert.equal(core.pressCount(match,1200).accepted,true);
  assert.equal(match.player.roundCount,1);
  core.beginEntryWindow(match,7000);
  assert.equal(core.pressCount(match,7100).accepted,true);
  assert.equal(match.player.roundCount,2);
  core.revealRound(match,8000,sequence([.2,.4,.6,.8]));
  assert.equal(core.pressCount(match,8100).accepted,false);
});

test('near counts receive diminishing partial credit and exact counts receive full credit',()=>{
  for(const max of core.ROUND_MAX_POINTS){
    assert.equal(core.scoreAnswer(12,12,max),max);
    const one=core.scoreAnswer(11,12,max);
    const two=core.scoreAnswer(10,12,max);
    assert.ok(one>two && two>=1);
    assert.equal(core.scoreAnswer(9,12,max),0);
  }
});

test('CPU answers are independent, difficulty-sensitive, and ranked against one another as well as the player',()=>{
  const easy=core.profileFor('easy');
  const hard=core.profileFor('hard');
  assert.ok(easy.maxAnswerError>hard.maxAnswerError);
  const match=core.createMatch({difficulty:'normal',rng:sequence([.1,.8,.2,.7,.3,.6,.4,.5])});
  match.players[0].score=65;match.players[1].score=82;match.players[2].score=51;match.players[3].score=74;
  const ranked=core.rankMatch(match);
  assert.deepEqual(ranked.map(p=>p.id),['cpu1','cpu3','player','cpu2']);
  assert.equal(core.placeFor(match,'player'),3);
});

test('pause shifting preserves active round timing',()=>{
  const match=core.createMatch({difficulty:'normal',rng:sequence([.2,.5,.8])});
  core.beginRound(match,0,1000);
  const before=match.round.startedAt;
  core.shiftTimestamps(match,1500);
  assert.equal(match.round.startedAt,before+1500);
  assert.equal(match.startedAt,2500);
});
