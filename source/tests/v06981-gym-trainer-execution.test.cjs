'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const C=require(path.join(root,'tcgp-battle-core.js')),AI=require(path.join(root,'tcgp-battle-ai.js')),G=require(path.join(root,'tcg-classic-gym-heroes.js')),D=require(path.join(root,'tcg-classic-decks.js'));
const trainerCards=G.CARDS.filter(c=>c.kind==='trainer'&&c.battleEnabled);
const problems=[],covered=[];
for(const card of trainerCards){
 const s=C.createBattle({format:'classic',playerDeck:D.LOANER_DECK,opponentDeck:D.LOANER_DECK,seed:82000+Number(card.number),playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting'],opponentEnergyTypes:['Grass','Fighting']});
 s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;
 const ss=s.sides.player,foe=s.sides.opponent;
 ss.bench=[C.makePokemonSlot('gym1-81',1,'b1'),C.makePokemonSlot('gym1-90',1,'b2')];ss.bench.forEach((x,i)=>x.benchSlot=i);
 foe.bench=[C.makePokemonSlot('gym1-90',1,'e1')];foe.bench[0].benchSlot=0;
 ss.hand=[{uid:'trainer-'+card.number,cardId:card.id},...[61,90,91,82,67].map(n=>({uid:'support-'+n,cardId:'gym1-'+n}))];
 ss.deck=[...ss.deck,...[47,81,89,90,95,75,96,62].map(n=>({uid:'find-'+n,cardId:'gym1-'+n}))];
 foe.hand=[{uid:'opp-basic',cardId:'gym1-90'},{uid:'opp-trainer',cardId:'gym1-98'}];
 ss.discard=[{uid:'lost',cardId:'gym1-91'}];
 ss.active.energy={Fighting:2,Psychic:2,Water:2,Grass:2};ss.bench[0].energy={Lightning:2};
 try{
   const action=C.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===card.id);
   if(!action)continue;
   covered.push(card.id);C.applyAction(s,'player',action);
   for(let n=0;s.phase==='effectChoice'&&n<50;n++){
     const options=C.legalActions(s,s.choiceSide);
     if(!options.length)throw new Error('no legal effect choice');
     const choice=AI.chooseAction(s,s.choiceSide,'Beginner',n)||options[0];
     C.applyAction(s,s.choiceSide,choice);
   }
   if(s.phase==='effectChoice')throw new Error('unresolved choice after 50 actions');
 }catch(error){problems.push(card.id+' '+card.name+': '+(error.stack||error));}
}
test('Gym Heroes Trainer cards with satisfied prerequisites resolve without errors or infinite choice loops',()=>{
 assert.ok(covered.length>=15,`only ${covered.length} eligible Gym trainers: ${covered.join(', ')}`);
 assert.deepEqual(problems,[]);
});
