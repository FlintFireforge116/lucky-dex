'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const effects=require(path.join(A,'tcgp-battle-effects.js'));
const destiny=require(path.join(A,'tcg-classic-neo-destiny.js'));
const discovery=require(path.join(A,'tcg-classic-neo-discovery.js'));
const base=Array(4).fill('neo4-73').concat(Array(4).fill('neo4-75'),Array(4).fill('neo4-68'),Array(4).fill('neo4-77'),Array(4).fill('neo4-63'),Array(4).fill('neo4-64'),Array(4).fill('neo4-65'),Array(2).fill('neo4-104'));
const ref=(id,index=0)=>({uid:'hand-'+id+'-'+index,cardId:id});
const slot=(id,index=0)=>{const s=core.makePokemonSlot(id,1,'slot-'+id+'-'+index);s.benchSlot=index;return s;};
function game(){
 const s=core.createBattle({format:'classic',playerDeck:base,opponentDeck:base,seed:312,firstSide:'player',playerEnergyTypes:['Psychic','Fire','Grass'],opponentEnergyTypes:['Psychic','Fire','Grass']});
 s.phase='battle';s.activeSide='player';s.turnNumber=5;
 for(const which of ['player','opponent']){const p=s.sides[which];p.turnCount=3;p.hand=[];p.bench=[];p.active=slot('neo4-73');p.active.uid=which+'-active';p.active.playedOnSideTurn=1;p.energyAvailable=true;p.energyUsed=false;}
 return s;
}
function ability(s,id){return core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId===id);}
function choose(s,predicate=()=>true){assert.equal(s.phase,'effectChoice','expected a choice');const actions=core.legalActions(s,s.choiceSide).filter(predicate);assert.ok(actions.length>0,'no matching choice: '+JSON.stringify(s.pendingChoice));core.applyAction(s,s.choiceSide,actions[0]);}
function hand(s,ids){s.sides.player.hand=ids.map((id,i)=>ref(id,i));}
function bench(s,ids){s.sides.player.bench=ids.map((id,i)=>slot(id,i));}

test('Three previously blocked Neo Destiny Unown are usable and have word Powers',()=>{
 assert.equal(destiny.coverage().battleEnabled,113);
 for(const n of [27,28,29]){const c=destiny.cardById('neo4-'+n);assert.ok(c.battleEnabled,c.name);assert.equal(c.abilities[0].type,'activated');assert.ok(effects.supportsEffect(c.abilities[0].effect));}
});
test('GIVE counts a mix of hand + in-play letters, takes the NEXT ordered Energy, and targets a Pokémon',()=>{
 const s=game(),p=s.sides.player;p.active=slot('neo4-27');bench(s,['neo2-68']);hand(s,['neo4-89','neo2-67']);p.energySupply=['Fire','Psychic'];p.forceFirstCoinHeadTurn=s.turnNumber;
 assert.ok(ability(s,'neo4-27'));
 core.applyAction(s,'player',ability(s,'neo4-27'));choose(s,a=>a.choiceTarget==='active');
 assert.equal(p.active.energy.Fire,1);assert.deepEqual(p.energySupply,['Psychic']);
 assert.equal(p.hand.length,2);
});
test('GIVE is not usable with a missing letter or letters belonging only to the opponent',()=>{
 const s=game(),p=s.sides.player;p.active=slot('neo4-27');bench(s,['neo2-68']);hand(s,['neo4-89']);p.energySupply=['Fire'];
 assert.equal(ability(s,'neo4-27'),undefined,'E absent');
 s.sides.opponent.hand=[ref('neo2-67')];assert.equal(ability(s,'neo4-27'),undefined,'enemy hand cannot complete word');
 hand(s,['neo4-89','neo2-67']);p.energySupply=[];assert.equal(ability(s,'neo4-27'),undefined,'no ordered energy in zone');
});
test('HELP redraws the same number of cards from the deck when letters come from hand',()=>{
 const s=game(),p=s.sides.player;p.active=slot('neo4-28');bench(s,['neo2-67']);hand(s,['neo4-86','neo4-58']); // H, E on board; L and P in hand
 assert.ok(ability(s,'neo4-28'));
 const n=p.hand.length,deckSize=p.deck.length;
 core.applyAction(s,'player',ability(s,'neo4-28'));
 assert.equal(p.hand.length,n);assert.equal(p.deck.length,deckSize);assert.ok(s.log.some(x=>x.type==='ability'&&x.cardId==='neo4-28'));
 assert.equal(ability(s,'neo4-28'),undefined,'once per turn');
});
test('WANT retrieves chosen Trainer from discard with hand letters and a head coin',()=>{
 const s=game(),p=s.sides.player;p.active=slot('neo4-29');bench(s,['neo2-14']);hand(s,['neo2-50','neo4-88']);p.discard.push(ref('neo4-104',20));p.forceFirstCoinHeadTurn=s.turnNumber;
 assert.ok(ability(s,'neo4-29'));
 core.applyAction(s,'player',ability(s,'neo4-29'));choose(s,a=>a.choiceCardId==='neo4-104');
 assert.ok(p.hand.some(x=>x.cardId==='neo4-104'));
 assert.equal(p.discard.some(x=>x.cardId==='neo4-104'),false);
});
test('Old Neo Discovery FIND can mix hand, Active and Bench and searches Trainer',()=>{
 const s=game(),p=s.sides.player;p.active=slot('neo2-48');bench(s,['neo2-50']);hand(s,['neo2-68','neo2-47']);p.deck.unshift(ref('neo4-104',40));
 assert.ok(ability(s,'neo2-48'));
 core.applyAction(s,'player',ability(s,'neo2-48'));choose(s,a=>a.choiceCardId==='neo4-104');
 assert.ok(p.hand.some(x=>x.cardId==='neo4-104'));
});
test('Old Neo Discovery UNDO can mix hand with on-board letters and return Active to hand',()=>{
 const s=game(),p=s.sides.player;p.active=slot('neo2-51');bench(s,['neo2-47']);hand(s,['neo2-50','neo2-69']);
 assert.ok(ability(s,'neo2-51'));
 core.applyAction(s,'player',ability(s,'neo2-51'));
 assert.equal(p.active,null);assert.ok(p.hand.some(x=>x.cardId==='neo2-51'));
});
test('Unown Powers cannot be activated by a Power owner that is only in hand',()=>{
 const s=game();hand(s,['neo2-48','neo2-68','neo2-50','neo2-47','neo4-27','neo4-89','neo2-67']);
 assert.equal(ability(s,'neo2-48'),undefined);assert.equal(ability(s,'neo4-27'),undefined);
});
test('Old Neo Discovery word abilities and other Unown still carry supported effects',()=>{
 for(const id of ['neo2-48','neo2-51','neo4-27','neo4-28','neo4-29']){
 const c=id.startsWith('neo2')?discovery.cardById(id):destiny.cardById(id);
 assert.equal(c.battleEnabled,true,id);assert.ok(c.abilities.every(a=>effects.supportsEffect(a.effect)));
 }
});
