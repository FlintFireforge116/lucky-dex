'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const sm2=require('../app/src/main/assets/tcg-classic-guardians-rising.js');
const dummy={id:'sm2-audit-4000',kind:'pokemon',name:'Large audit target',hp:4000,stage:'Basic',types:['Colorless'],retreat:1,attacks:[{name:'Test',cost:['C'],damage:10,effect:{type:'noop'}}],battleEnabled:true};
const saved=data.cardById;
function makeSlot(id,uid,energy={},benchSlot=null){return {uid,cardId:id,stack:[id],energy:{...energy},specialEnergy:[],damage:0,conditions:{},locks:[],tool:null,extraTools:[],benchSlot,playedOnSideTurn:1}}
function fixture(id='sm2-13'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,firstSide:'player',seed:42,playerEnergyTypes:['Fire','Grass','Lightning'],opponentEnergyTypes:['Water']});
 s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;s.sides.opponent.turnCount=4;
 for(const [who,ss] of Object.entries(s.sides)){ss.hand=[];ss.deck=[{cardId:'sm2-1',uid:who+'-deck1'},{cardId:'sm2-4',uid:who+'-deck2'}];ss.discard=[];ss.bench=[];ss.energyDiscard={Water:0,Fire:0};ss.energyUsed=true;ss.handEnergyUsed=true;ss.supporterUsed=false;}
 s.sides.player.active=makeSlot(id,'actor',{Fire:2});s.sides.player.bench=[makeSlot('sm2-1','pbench',{},0)];
 s.sides.opponent.active=makeSlot(dummy.id,'target',{Water:1});s.sides.opponent.bench=[makeSlot('sm2-1','obench',{},0)];return s;
}
function choose(s,side='player',fn){const actions=core.legalActions(s,side);const a=actions.find(fn)||actions[0];assert.ok(a,'No legal action for '+side+': '+JSON.stringify(s.pendingChoice));core.applyAction(s,side,a);return a;}
function resolve(s,prefs=[]){for(let i=0;s.phase==='effectChoice'&&i<30;i++){const side=s.pendingChoice.side||s.activeSide;const p=prefs.shift();choose(s,side,p||(()=>true));}assert.notEqual(s.phase,'effectChoice','unresolved effect choice');}
function withDummy(fn){data.cardById=id=>id===dummy.id?dummy:saved(id);try{return fn();}finally{data.cardById=saved}}

test('Shady Move can move the final damage counter and Knock Out the opponent',()=>withDummy(()=>{
 const s=fixture('sm2-13');s.sides.player.active.damage=10;s.sides.opponent.active.damage=3990;
 const ability=core.legalActions(s,'player').find(a=>a.type==='ability');assert.ok(ability,'Shady Move ability unavailable');core.applyAction(s,'player',ability);
 assert.equal(s.phase,'effectChoice');
 choose(s,'player',a=>a.choiceOption===0); // choose own source side
 choose(s,'player',a=>a.choiceTarget==='active'); // choose our damaged active
 choose(s,'player',a=>a.choiceOption===1); // choose opponent as destination side
 assert.equal(s.phase,'effectChoice','opposing near-KO target must be offered');
 choose(s,'player',a=>a.choiceTarget==='active'); // choose opposing Active
 assert.ok(s.sides.player.active.damage===0,'source counter must be transferred');
 assert.ok(s.sides.opponent.active?.cardId!==dummy.id||s.phase==='promote'||s.phase==='ended','opponent should be Knocked Out');
 assert.equal(s.pendingChoice?.special,'chooseClassicPrize','Ability knockout must trigger an actual Prize choice');
 choose(s,'player',a=>a.type==='effectChoice'&&Number.isInteger(a.choicePrizeIndex));
 assert.equal(s.sides.player.prizesTaken,1,'Shady Move knockout should award exactly one Prize');
}));

test('Vital Dance uses two independent Basic Energy Zone search coin flips, including after tails',()=>withDummy(()=>{
 const s=fixture('sm2-1'),p=s.sides.player;p.bench=[];p.hand=[{uid:'oricorio',cardId:'sm2-55'}];p.deck=[];p.energySupply=['Grass','Grass'];p.dp2ForceTailsUntil=7;
 const before=p.energySupply.length;choose(s,'player',a=>a.type==='bench'&&a.cardId==='sm2-55');
 resolve(s);
 assert.equal(p.energySupply.length,before);
 const rolls=s.log.filter(x=>x.reason==='Hybrid Basic Energy deck search');assert.equal(rolls.length,2,'both separate attempts must flip, even if first tails');
 assert.equal(p.hand.filter(x=>data.cardById(x.cardId)?.basicEnergy).length,0);
}));
test('Aqua Patch attaches one Water from discard to a Benched Water Pokémon without a coin flip',()=>withDummy(()=>{
 const s=fixture('sm2-1'),p=s.sides.player;
 p.hand=[{uid:'patch',cardId:'sm2-119'}];p.bench=[makeSlot('sm2-23','tentacool',{},0)];p.energyDiscard.Water=2;
 const acts=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId==='sm2-119');
 assert.ok(acts.length,'Aqua Patch must be playable with available Water in discard');
 core.applyAction(s,'player',acts[0]);resolve(s);
 assert.equal(p.bench[0].energy.Water,1);
 assert.equal(p.energyDiscard.Water,1);
 assert.equal(s.log.filter(x=>x.reason==='Hybrid Basic Energy deck search').length,0);
}));

test('Doom News follows the original target through a switch until the opponent turn ends',()=>withDummy(()=>{
 const s=fixture('sm2-81'),p=s.sides.player,o=s.sides.opponent;
 p.active.energy={Darkness:2};
 const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===sm2.cardById('sm2-81').attacks.findIndex(x=>x.name==='Doom News'));
 assert.ok(a,'Doom News attack unavailable');core.applyAction(s,'player',a);
 assert.equal(s.delayedEffects.length,1);
 const original=o.active;
 o.active=o.bench.shift();o.bench.push(original); original.benchSlot=1;o.active.benchSlot=null;
 s.turnNumber=8;
 fx.resolveDelayedEffects(s,'opponent',data.cardById,(side,actor)=>core.effectContext(s,side,{},actor));
 assert.ok(original.damage>=4000,'Delayed knockout must follow the original defending Pokémon to its Bench');
 assert.equal(o.active.damage,0,'New Active must not be knocked out');
 assert.equal(s.delayedEffects.length,0,'Delayed effect consumed once');
}));

test('Mallow searches any two physical cards and places chosen cards at top in selected order',()=>withDummy(()=>{
 const s=fixture('sm2-1'),p=s.sides.player;
 p.hand=[{uid:'mallow',cardId:'sm2-127'}];
 p.deck=[{uid:'first',cardId:'sm2-1'},{uid:'second',cardId:'sm2-2'},{uid:'third',cardId:'sm2-3'},{uid:'fourth',cardId:'sm2-4'}];
 choose(s,'player',a=>a.type==='trainer'&&a.cardId==='sm2-127');
 assert.equal(s.phase,'effectChoice');choose(s,'player',a=>a.choiceDeckIndex===2);
 assert.equal(s.phase,'effectChoice');choose(s,'player',a=>a.choiceDeckIndex===0);
 assert.equal(s.phase,'battle');assert.deepEqual(p.deck.slice(0,2).map(x=>x.uid),['third','first']);
 assert.equal(p.deck.length,4);
}));

test('Aether Paradise reduces damage for Basic Grass/Lightning Pokémon on either side but not evolved Grass',()=>withDummy(()=>{
 const s=fixture('sm2-1');s.stadium={cardId:'sm2-116',uid:'stadium',ownerSide:'player'};
 const basic=s.sides.player.active,opp=s.sides.opponent.active;
 assert.equal(fx.modifierAmount(s,'player',basic,'damageReduction',data.cardById),30);
 opp.cardId='sm2-47';assert.equal(fx.modifierAmount(s,'opponent',opp,'damageReduction',data.cardById),30);
 basic.cardId='sm2-3';assert.equal(fx.modifierAmount(s,'player',basic,'damageReduction',data.cardById),0);
}));

test('Energy Loto checks only physical top seven and cannot convert into an unconditional Zone search',()=>withDummy(()=>{
 const s=fixture('sm2-1'),p=s.sides.player;p.hand=[{uid:'loto',cardId:'sm2-122'}];p.energySupply=['Grass','Grass'];
 p.deck=Array.from({length:7},(_,i)=>({uid:'n'+i,cardId:'sm2-1'}));
 choose(s,'player',a=>a.type==='trainer'&&a.cardId==='sm2-122');resolve(s);
 assert.equal(p.energySupply.length,2);assert.ok(!p.hand.some(ref=>data.cardById(ref.cardId)?.basicEnergy));
 assert.equal(s.log.filter(x=>x.reason==='Hybrid Basic Energy deck search').length,0);
}));
