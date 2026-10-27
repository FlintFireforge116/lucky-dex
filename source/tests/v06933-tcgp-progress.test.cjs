const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js'),C=require('../app/src/main/assets/tcgp-battle-core.js'),P=require('../app/src/main/assets/tcgp-battle-progress.js'),S=require('../app/src/main/assets/tcgp-battle-solo.js');
test('a real simultaneous-KO draw increments draws without losses, rewards or first-clear changes',()=>{
 const card=D.cardById('A1-001'),attacks=card.attacks;
 try{
  card.attacks=[{name:'Recoil fixture',cost:'',damage:80,effect:{type:'selfDamage',amount:80}}];
  const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:15});
  for(const side of ['player','opponent']){b.sides[side].active=C.makePokemonSlot('A1-001',0,'draw-'+side);b.sides[side].points=2;}
  C.applyAction(b,'player',{type:'attack',attackIndex:0});assert.equal(b.winner,'draw');
  const state={profile:{coins:100,dust:20},tcgpBattle:{stats:{losses:3}}},challenge=S.challengeById('genetic-apex-beginner-ivysaur');
  const result=P.recordResult(state,b,challenge);assert.equal(state.tcgpBattle.stats.draws,1);assert.equal(state.tcgpBattle.stats.losses,3);assert.equal(state.tcgpBattle.stats.wins,0);assert.deepEqual(result.reward,{coins:0,dust:0});assert.deepEqual(state.profile,{coins:100,dust:20});assert.deepEqual(state.tcgpBattle.firstClears,{});assert.equal(P.recordResult(state,b,challenge).alreadyRecorded,true);assert.equal(state.tcgpBattle.stats.draws,1);
 }finally{card.attacks=attacks;}
});
