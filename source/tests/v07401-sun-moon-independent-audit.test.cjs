'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const sm=require('../app/src/main/assets/tcg-classic-sun-moon.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(id,uid,benchSlot=null)=>({cardId:id,uid,benchSlot,stack:[id],energy:{},specialEnergy:[],conditions:{},damage:0,tool:null,extraTools:[],locks:[],playedOnSideTurn:0});
function battle(){
 const board=(active,bench=[])=>({active,bench,hand:[],deck:[],discard:[],prizes:[],energyDiscard:{},energySupply:[],energyTypes:['Grass'],turnCount:3,benchLimit:5,energyAvailable:true,energyUsed:false,handEnergyUsed:false,retreated:false});
 return {format:'classic',phase:'battle',activeSide:'player',turnNumber:5,rngState:123,log:[],rules:{winMode:'prizes',benchSize:5},sides:{player:board(slot('sm1-1','p')),
 opponent:board(slot('sm1-1','o'))}};
}
test('SM1 metadata audit: 173 exact prints, 238 attacks, 26 Abilities, 27 GX attacks and physical energy',()=>{
 const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/sm1-print-compact.json'),'utf8'));
 assert.equal(rows.length,173);assert.equal(sm.CARDS.length,173);
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),238);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),26);
 assert.equal(rows.reduce((n,r)=>n+r[7].filter(a=>a[0].endsWith('-GX')).length,0),27);
 for(const [i,row] of rows.entries()){
  const card=sm.CARDS[i];assert.equal(card.id,'sm1-'+row[0]);assert.equal(card.name,row[1]);
  assert.equal(card.battleEnabled,true,card.id);if(card.kind==='pokemon'){
   assert.equal(card.hp,Number(row[4]));assert.deepEqual(card.types,row[5]);
   assert.deepEqual(card.attacks.map(a=>a.name),row[7].map(a=>a[0]));
   assert.deepEqual(card.attacks.map(a=>Array.isArray(a.cost)?a.cost.join(''):a.cost),row[7].map(a=>a[1].join('')));
   assert.deepEqual(card.attacks.map(a=>a.damageText||''),row[7].map(a=>a[2]));
   assert.deepEqual(card.abilities.map(a=>a.name),row[8].map(a=>a[0]));
  }
 }
});
test('SM1 Alolan Dugtrio Tangling Hair stacks +1 retreat for each unsuppressed opponent Dugtrio',()=>{
 const s=battle();s.sides.player.active.energy.Grass=3;
 s.sides.opponent.bench=[slot('sm1-87','d1',0),slot('sm1-87','d2',1)];
 assert.equal(core.retreatCost(s,'player'),3,'A printed Retreat Cost of 1 plus two Tangling Hair sources');
 s.sides.opponent.bench[1].abilitySuppressed=true;
 assert.equal(core.retreatCost(s,'player'),2,'Suppressed Dugtrio contributes no extra retreat');
});
test('SM1 Toxapex Toxic Spikes poisons the NEW Active after a voluntary retreat, without crashing',()=>{
 const s=battle();s.sides.player.active.energy.Grass=1;s.sides.player.bench=[slot('sm1-3','incoming',0)];
 s.sides.opponent.bench=[slot('sm1-63','tox',0)];
 const act=core.legalActions(s,'player').find(a=>a.type==='retreat');assert.ok(act,'Expected affordable legal retreat');
 assert.doesNotThrow(()=>core.applyAction(s,'player',act));
 assert.equal(s.sides.player.active.uid,'incoming');
 assert.ok(s.sides.player.active.conditions.poison,'The new Active is Poisoned');
 assert.equal(s.sides.player.bench[0].conditions.poison,undefined,'Retreated Pokémon is not Poisoned');
 assert.equal(s.log.filter(x=>x.type==='sm1ToxicSpikes').length,1);
});
test('SM1 Toxapex respects Ability suppression when opponent retreats',()=>{
 const s=battle();s.sides.player.active.energy.Grass=1;s.sides.player.bench=[slot('sm1-3','incoming',0)];
 const tox=slot('sm1-63','tox',0);tox.abilitySuppressed=true;s.sides.opponent.bench=[tox];
 core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='retreat'));
 assert.equal(s.sides.player.active.uid,'incoming');
 assert.equal(s.sides.player.active.conditions.poison,undefined);
});
test('SM1 Pyukumuku Innards Out triggers on Active-only knockout, not Bench damage KO',()=>{
 const ability=sm.cardById('sm1-47').abilities.find(a=>a.name==='Innards Out');
 assert.equal(ability?.type,'triggered');assert.equal(ability?.event,'knockedOutByAttack');
 assert.equal(ability.activeOnly,true,'Benched Pyukumuku cannot trigger Innards Out');
});
test('SM1 once-per-game GX attack restriction survives switching to a different Pokémon-GX',()=>{
 const s=battle();s.sides.player.active=slot('sm1-100','tauros');s.sides.player.active.energy.Fire=3;
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===2));
 s.sides.player.gxAttackUsed=true;
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===2));
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===1));
 s.sides.player.active=slot('sm1-35','lapras');s.sides.player.active.energy.Water=3;
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===1));
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===2),
   'GX usage belongs to the player, not the current Pokémon');
});
test('SM1 Pokémon-GX KO earns two physical Prize choices in live attack resolution',()=>{
 const s=battle(),att=slot('sm1-89','solgaleo');att.energy.Metal=3;s.sides.player.active=att;
 s.sides.opponent.active=slot('sm1-35','lapras');
 s.sides.player.prizes=Array.from({length:4},(_,i)=>({uid:'prize-'+i,cardId:'sm1-1'}));
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(action);
 core.applyAction(s,'player',action);
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice?.kind,'prizeCard');
 assert.deepEqual(s.pendingPrizeClaims,[{side:'player',remaining:2}]);
 assert.ok(s.log.some(x=>x.type==='ko'&&x.cardId==='sm1-35'&&x.awarded===2));
});
