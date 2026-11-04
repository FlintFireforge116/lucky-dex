'use strict';const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');const a=path.resolve(__dirname,'../app/src/main/assets'),G=require(a+'/tcg-classic-gym-challenge.js'),C=require(a+'/tcgp-battle-core.js'),AI=require(a+'/tcgp-battle-ai.js'),D=require(a+'/tcg-classic-decks.js');
test('Every Gym Challenge Trainer resolves its legal actions/choices without crash',()=>{
 const failed=[];let tried=0,actuallyPlayed=0;
 for(const card of G.CARDS.filter(c=>c.kind==='trainer'&&c.battleEnabled))for(let seed=1;seed<=3;seed++){
  try{
   const s=C.createBattle({format:'classic',playerDeck:D.LOANER_DECK,opponentDeck:D.LOANER_DECK,seed:9000+seed+Number(card.number),playerEnergyTypes:['Grass','Fire'],opponentEnergyTypes:['Water','Psychic']});s.phase='battle';s.activeSide='player';s.turnNumber=12;s.sides.player.turnCount=6;s.sides.opponent.turnCount=5;
   s.sides.player.active=C.makePokemonSlot('gym2-67',1,'p');s.sides.opponent.active=C.makePokemonSlot('gym2-74',1,'o');
   s.sides.player.bench=[C.makePokemonSlot('gym2-64',1,'p1'),C.makePokemonSlot('gym2-95',1,'p2')];s.sides.opponent.bench=[C.makePokemonSlot('gym2-67',1,'o1')];s.sides.player.bench.forEach((p,i)=>p.benchSlot=i);s.sides.opponent.bench[0].benchSlot=0;
   s.sides.player.hand=[{uid:'played',cardId:card.id},{uid:'basic1',cardId:'gym2-128',zoneGenerated:true},{uid:'basic2',cardId:'gym2-129',zoneGenerated:true},{uid:'other',cardId:'gym2-49'}];
   s.sides.player.discard.push({uid:'old',cardId:'gym2-49'});s.sides.opponent.discard.push({uid:'oppold',cardId:'gym2-67'});
   let actions=C.legalActions(s,'player'),tr=actions.find(x=>x.type==='trainer'&&x.cardId===card.id);
   if(tr){actuallyPlayed++;C.applyAction(s,'player',tr);for(let i=0;i<20&&s.phase==='effectChoice';i++){const side=s.choiceSide;const choices=C.legalActions(s,side);assert.ok(choices.length,`${card.id} pending ${JSON.stringify(s.pendingChoice)}`);const pick=AI.chooseAction(s,side,'Beginner',i);assert.ok(pick);C.applyAction(s,side,pick);}assert.notEqual(s.phase,'effectChoice','trainer choice stalled');}
   tried++;
  }catch(e){failed.push(`${card.id} ${card.name} seed ${seed}: ${e.stack||e.message}`);}
 }
 assert.deepEqual(failed,[],failed.join('\n'));assert.ok(actuallyPlayed>20);assert.ok(tried>60);
});
