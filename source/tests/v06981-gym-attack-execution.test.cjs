'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const a=path.resolve(__dirname,'../app/src/main/assets');
const C=require(path.join(a,'tcgp-battle-core.js')),G=require(path.join(a,'tcg-classic-gym-heroes.js')),D=require(path.join(a,'tcg-classic-decks.js'));
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless'};
const problems=[];
for(const card of G.CARDS.filter(x=>x.kind==='pokemon'&&x.battleEnabled)){
 for(let i=0;i<card.attacks.length;i++){
  const attack=card.attacks[i];
  const s=C.createBattle({format:'classic',playerDeck:D.LOANER_DECK,opponentDeck:D.LOANER_DECK,seed:81000+Number(card.number)*9+i,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting'],opponentEnergyTypes:['Fighting']});
  s.phase='battle';s.activeSide='player';s.turnNumber=10;s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
  const slot=C.makePokemonSlot(card.id,2,'gym-attacker');slot.energy={Grass:6,Fire:6,Water:6,Lightning:6,Psychic:6,Fighting:6};
  s.sides.player.active=slot;s.sides.player.bench=[C.makePokemonSlot('gym1-90',0,'bench-ours')];s.sides.player.bench[0].benchSlot=0;
  s.sides.opponent.active=C.makePokemonSlot('base1-7',0,'bench-target');s.sides.opponent.active.energy={Fighting:2};
  s.sides.opponent.bench=[C.makePokemonSlot('base1-44',0,'bench-theirs')];s.sides.opponent.bench[0].benchSlot=0;
  try{
   const options=C.legalActions(s,'player');const act=options.find(x=>x.type==='attack'&&x.attackIndex===i);
   if(!act)throw new Error('attack not selectable');
   C.applyAction(s,'player',act);
   if(s.phase==='effectChoice'&&!C.legalActions(s,s.choiceSide).length)throw new Error('effect choice has no actions');
  }catch(e){problems.push(`${card.id} ${card.name} ${attack.name}: ${e.stack||e}`)}
 }
}
test('every Gym Heroes battle-ready attack is usable and executes without runtime errors or empty mandatory choices',()=>{
 assert.deepEqual(problems,[]);
});
