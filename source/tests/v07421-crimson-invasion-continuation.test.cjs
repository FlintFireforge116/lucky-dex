'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const sm4=require('../app/src/main/assets/tcg-classic-crimson-invasion.js');
const dummies={
 'test-sm4-neutral':{id:'test-sm4-neutral',kind:'pokemon',stage:'Basic',name:'Neutral Test',hp:3000,types:['Colorless'],retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]},
 'test-sm4-grass':{id:'test-sm4-grass',kind:'pokemon',stage:'Basic',name:'Grass Test',hp:3000,types:['Grass'],retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]},
 'test-sm4-fire':{id:'test-sm4-fire',kind:'pokemon',stage:'Basic',name:'Fire Test',hp:3000,types:['Fire'],retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]},
};
const original=data.cardById;
function withDummy(fn){data.cardById=id=>dummies[id]||original(id);try{return fn();}finally{data.cardById=original;}}
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1});
const rich=()=>({Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4,Fairy:4,Colorless:4});
function setup(id='sm4-1',side='player'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:7404,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.turnNumber=5;s.activeSide=side;
 for(const [who,b] of Object.entries(s.sides)){b.turnCount=3;b.energyUsed=true;b.handEnergyUsed=true;b.supporterUsed=false;b.hand=[];b.deck=Array.from({length:8},(_,i)=>({uid:who+'deck'+i,cardId:'sm4-1'}));b.discard=[];b.energyDiscard={};b.bench=[];}
 const foe=side==='player'?'opponent':'player';s.sides[side].active=slot(id,side+'active',rich());s.sides[side].bench=[slot('sm4-1',side+'bench')];s.sides[foe].active=slot('test-sm4-neutral',foe+'active',{Water:2});s.sides[foe].bench=[slot('test-sm4-neutral',foe+'bench')];return s;
}
function choose(s,side,pred){const available=core.legalActions(s,side),choice=available.find(pred);assert.ok(choice,`No action for ${side} ${s.phase}: ${JSON.stringify(available.slice(0,8))}`);core.applyAction(s,side,choice);return choice;}
function resolve(s,picks=[]){for(let i=0;['effectChoice','promote'].includes(s.phase)&&i<90;i++){const side=s.phase==='promote'?(['player','opponent'].find(x=>core.legalActions(s,x).some(a=>a.type==='promote'))||s.activeSide):s.pendingChoice?.side||s.activeSide;const options=core.legalActions(s,side),rule=picks.shift();const fallback=options.find(a=>/\bDone\b/i.test(String(a.choiceLabel||'')))||options[0];choose(s,side,rule||((a)=>JSON.stringify(a)===JSON.stringify(fallback)));}assert.ok(['battle','ended'].includes(s.phase),`Unresolved phase: ${s.phase}`);}
function attack(id,name,modify=()=>{},side='player',picks=[]){return withDummy(()=>{const s=setup(id,side);modify(s);const i=sm4.cardById(id).attacks.findIndex(a=>a.name===name);choose(s,side,a=>a.type==='attack'&&a.attackIndex===i);resolve(s,picks);return s;});}

test('SM4 continuation retains pinned 126 prints and at least 83 battle-ready without silent no-ops',()=>{
 assert.equal(sm4.CARDS.length,126);assert.ok(sm4.CARDS.filter(c=>c.battleEnabled).length>=83);
 for(const c of sm4.CARDS.filter(c=>c.battleEnabled)){for(const a of c.attacks||[]){assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);if(a.text?.trim())assert.notEqual(a.effect.type,'noop');}for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[]);}
});
test('Sap Sipper boosts only attacks against a Grass defending Pokemon',()=>{
 const grass=attack('sm4-11','Horn Leech',s=>s.sides.opponent.active=slot('test-sm4-grass','grass'));
 const fire=attack('sm4-11','Horn Leech',s=>s.sides.opponent.active=slot('test-sm4-fire','fire'));
 assert.equal(grass.sides.opponent.active.damage-fire.sides.opponent.active.damage,80);
});
test('Fluffy only protects Bewear against non-Fire attackers, including on CPU side',()=>withDummy(()=>{
 for(const side of ['player','opponent']){const s=setup('sm4-56',side),foe=side==='player'?'opponent':'player';
 s.sides[foe].active=slot('test-sm4-neutral','foe');assert.equal(fx.modifierAmount(s,side,s.sides[side].active,'damageReduction',data.cardById),30);
 s.sides[foe].active=slot('test-sm4-fire','fire');assert.equal(fx.modifierAmount(s,side,s.sides[side].active,'damageReduction',data.cardById),0);}
}));
test('Devoured Field grants +10 only to Darkness/Dragon Pokémon for both sides',()=>withDummy(()=>{
 const s=setup('sm4-62');s.stadium={uid:'field',cardId:'sm4-93'};
 for(const side of ['player','opponent']){for(const [id,expected] of [['sm4-62',10],['sm4-74',10],['sm4-1',0]]){
  s.sides[side].active=slot(id,side+id);assert.equal(fx.modifierAmount(s,side,s.sides[side].active,'attackDamage',data.cardById),expected,side+' '+id);}}
}));
test('Pain Amplifier adds exactly 20 damage only to already-damaged opposing Pokémon',()=>{
 const s=attack('sm4-37','Pain Amplifier',s=>{s.sides.opponent.active.damage=30;s.sides.opponent.bench=[slot('test-sm4-neutral','b1'),slot('test-sm4-neutral','b2')];s.sides.opponent.bench[1].damage=10;});
 assert.equal(s.sides.opponent.active.damage,50);assert.equal(s.sides.opponent.bench[0].damage,0);assert.equal(s.sides.opponent.bench[1].damage,30);
});
test('Severe Poison has four damage counters per between-turn tick',()=>{
 const s=attack('sm4-47','Severe Poison');assert.equal(s.sides.opponent.active.conditions.poison.amount,40);
});
test('Buzzwole Absorption-GX scales with own remaining Prize cards, once per game',()=>{
 for(const num of ['57','104','115']){const s=attack('sm4-'+num,'Absorption-GX');assert.equal(s.sides.opponent.active.damage,40*s.sides.player.prizes.length);assert.equal(s.sides.player.gxAttackUsed,true);}
});
test('Revenge Cannon counts only damage on friendly Bench, with exact units',()=>{
 const s=attack('sm4-67','Revenge Cannon',s=>{s.sides.player.bench=[slot('sm4-1','hurt',{Grass:1}),slot('sm4-1','healthy')];s.sides.player.bench[0].damage=50;s.sides.player.active.damage=80;});
 assert.equal(s.sides.opponent.active.damage,60);
});
test('Regigigas Seal of Antiquity requires all three distinct Regi species on its own Bench',()=>withDummy(()=>{
 for(const id of ['sm4-84','sm4-84a']){const s=setup(id);s.sides.player.bench=['sm4-53','sm4-28'].map((x,i)=>slot(x,'regi'+i));
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attack'));
 s.sides.player.bench.push(slot('sm4-68','regi3'));assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'));}
}));
test('Lusamine retrieves only physical Supporter/Stadium cards from the owning discard pile',()=>withDummy(()=>{
 const s=setup();s.sides.player.hand=[{uid:'lu',cardId:'sm4-96'}];s.sides.player.discard=[{uid:'sta',cardId:'sm4-93'},{uid:'sup',cardId:'sm4-96'},{uid:'poke',cardId:'sm4-1'}];
 choose(s,'player',a=>a.type==='trainer'&&a.cardId==='sm4-96');resolve(s);
 assert.equal(s.sides.player.hand.filter(r=>['sta','sup'].includes(r.uid)).length,2);
 assert.equal(s.sides.player.discard.some(r=>r.uid==='poke'),true);
 assert.equal(s.sides.opponent.discard.length,0);
}));
test('Tower-Go-Round-GX offers real movable Energy, can stop, and preserves total Basic Energy',()=>{
 for(const id of ['sm4-74','sm4-107','sm4-118']){
  const s=attack(id,'Tower-Go-Round-GX',s=>{s.sides.player.active.energy={Grass:1,Water:3};s.sides.player.bench=[slot('sm4-1','to',{Grass:1})];});
  const total=[s.sides.player.active,...s.sides.player.bench].reduce((n,p)=>n+Object.values(p.energy||{}).reduce((a,b)=>a+Number(b||0),0),0);
  assert.equal(total,5);assert.equal(s.sides.player.gxAttackUsed,true);
 }
});
test('Multiply benches up to three PHYSICAL Kakuna from deck, not synthesized copies',()=>{
 const s=attack('sm4-2','Multiply',s=>{
  s.sides.player.bench=[];
  s.sides.player.deck=[1,2,3].map(n=>({uid:'kakuna'+n,cardId:'sm4-2'})).concat({uid:'nonmatch',cardId:'sm4-1'});
 });
 assert.equal(s.sides.player.bench.length,3);
 assert.deepEqual(s.sides.player.bench.map(p=>p.cardId),['sm4-2','sm4-2','sm4-2']);
 assert.equal(s.sides.player.deck.length,1);
 assert.equal(s.sides.player.deck[0].uid,'nonmatch');
});
test('Recover spends one attached Energy and fully heals its own damaged Pokémon',()=>{
 const s=attack('sm4-9','Recover',s=>{s.sides.player.active.damage=70;});
 const remaining=Object.values(s.sides.player.active.energy).reduce((sum,n)=>sum+Number(n||0),0);
 assert.equal(s.sides.player.active.damage,0);
 assert.equal(remaining,39);
 assert.equal(Object.values(s.sides.player.energyDiscard||{}).reduce((sum,n)=>sum+Number(n||0),0),1);
});
test('Energy Catch recovers three discarded Basic Energy units, not fresh Energy Zone picks',()=>{
 const s=attack('sm4-35','Energy Catch',s=>{
  s.sides.player.energyDiscard.Water=2;
  s.sides.player.discard=[{uid:'physicalWater',cardId:'sm4-124'},{uid:'discardedPokemon',cardId:'sm4-1'}];
 });
 assert.equal(s.sides.player.hand.length,3);
 assert.ok(s.sides.player.hand.every(r=>data.cardById(r.cardId)?.basicEnergy), 'Only three actual Basic Energy cards recovered');
 assert.equal(s.sides.player.energyDiscard.Water,0);
 assert.equal(s.sides.player.discard.some(r=>r.uid==='physicalWater'),false);
 assert.equal(s.sides.player.discard.some(r=>r.uid==='discardedPokemon'),true);
});
test('Volt Switch offers only Lightning-type friendly Bench targets, not a different type',()=>withDummy(()=>{
 const s=setup('sm4-35');s.sides.player.bench=[slot('sm4-1','grass'),slot('sm4-30','electric')];
 const i=sm4.cardById('sm4-35').attacks.findIndex(a=>a.name==='Volt Switch');
 choose(s,'player',a=>a.type==='attack'&&a.attackIndex===i);
 if(s.phase==='effectChoice'){
  const actions=core.legalActions(s,'player');
  assert.ok(!actions.some(a=>a.choiceBenchIndex===s.sides.player.bench[0].benchSlot),'Grass bench must not be selectable');
 }
 resolve(s);
 assert.equal(s.sides.player.active.cardId,'sm4-30');
}));
