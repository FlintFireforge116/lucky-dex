'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const asset=n=>require(path.join(__dirname,'../app/src/main/assets',n));
const core=asset('tcgp-battle-core.js'),ai=asset('tcgp-battle-ai.js'),decks=asset('tcg-classic-decks.js');
function arena(){
 const s=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK,opponentDeck:decks.LOANER_DECK,seed:777,playerEnergyTypes:['Fighting'],opponentEnergyTypes:['Fighting','Grass']});
 s.phase='battle';s.activeSide='opponent';s.turnNumber=11;s.sides.opponent.turnCount=6;
 s.sides.player.active=core.makePokemonSlot('base3-1',0,'defender-aero');s.sides.player.active.energy={Fighting:3};
 s.sides.opponent.active=core.makePokemonSlot('base3-1',0,'cpu-aero');s.sides.opponent.active.energy={Fighting:3};
 s.sides.opponent.bench=[];s.sides.player.bench=[];s.sides.opponent.hand=[];
 s.sides.opponent.energyUsed=true;s.sides.opponent.energyAvailable=false;
 return s;
}
test('Aerodactyl mirror Wing Attack does zero from printed Fighting resistance and explains why',()=>{
 const s=arena(),action=core.legalActions(s,'opponent').find(a=>a.type==='attack');assert.ok(action);
 core.applyAction(s,'opponent',action);
 const event=s.log.find(e=>e.type==='attack');assert.equal(event.damage,0);
 assert.match(String(event.damageReason||''),/resistance/i);
 assert.match(String(event.damageReason||''),/Fighting/i);
 assert.equal(s.sides.player.active.damage,0);
});
test('Classic CPU never wastes Energy Retrieval when no Energy is in discard, or Super Energy Removal with no opposing Energy',()=>{
 const s=arena();s.sides.player.active.energy={};s.sides.opponent.hand=[{uid:'super',cardId:'base1-79'},{uid:'retrieval',cardId:'base1-81'},{uid:'removal',cardId:'base1-92'}];
 for(const difficulty of ['Beginner','Intermediate','Advanced','Expert']){
  const action=ai.chooseAction(s,'opponent',difficulty,0);assert.ok(action);
  assert.notEqual(action.type,'trainer',`${difficulty} wasted ${action.cardId}`);
 }
});
test('Classic CPU does not spend Super Energy Removal when only one opposing Energy can be removed',()=>{
 const s=arena();s.sides.player.active.energy={Fighting:1};s.sides.opponent.hand=[{uid:'super',cardId:'base1-79'}];
 for(const difficulty of ['Beginner','Intermediate','Advanced','Expert']){
  const action=ai.chooseAction(s,'opponent',difficulty,0);assert.ok(action);
  assert.notEqual(action.cardId,'base1-79');
 }
});
test('Classic CPU switches away from a zero-damage Aerodactyl mirror to a powered Grass Bench attacker',()=>{
 const s=arena(),grimer=core.makePokemonSlot('base3-48',0,'grimer');grimer.benchSlot=0;grimer.energy={Grass:1};s.sides.opponent.bench=[grimer];
 for(const difficulty of ['Beginner','Intermediate','Advanced','Expert']){
  const action=ai.chooseAction(s,'opponent',difficulty,0);
  assert.equal(action.type,'retreat',`${difficulty}: ${JSON.stringify(action)}`);
  assert.equal(action.benchIndex,0);
 }
});
test('Classic CPU chooses the Energy-bearing opposing Pokemon for Super Energy Removal, not an empty Active',()=>{
 const s=arena();s.sides.opponent.active.energy={Fighting:1};s.sides.opponent.hand=[{uid:'ser',cardId:'base1-79'}];s.sides.player.active.energy={};
 const target=core.makePokemonSlot('base3-48',0,'powered-bench');target.benchSlot=0;target.energy={Grass:3};s.sides.player.bench=[target];
 core.applyAction(s,'opponent',core.legalActions(s,'opponent').find(a=>a.cardId==='base1-79'));
 assert.equal(s.phase,'effectChoice');
 const ownChoice=ai.chooseAction(s,'opponent','Beginner',1);
 core.applyAction(s,'opponent',ownChoice);
 const opponentChoice=ai.chooseAction(s,'opponent','Beginner',2);
 assert.equal(opponentChoice.choiceTarget,'bench');assert.equal(opponentChoice.choiceBenchIndex,0);
 core.applyAction(s,'opponent',opponentChoice);
 assert.ok(Object.values(target.energy).reduce((a,b)=>a+b,0)<3,'energy should be removed from the actual target');
});
test('Classic CPU may still use Super Energy Removal when there is a two-Energy target and it can pay the cost',()=>{
 const s=arena();s.sides.player.active.energy={Fighting:2};s.sides.opponent.active.energy={Fighting:1};s.sides.opponent.hand=[{uid:'ser',cardId:'base1-79'}];
 const action=ai.chooseAction(s,'opponent','Beginner',0);
 assert.equal(action.type,'trainer');assert.equal(action.cardId,'base1-79');
});
