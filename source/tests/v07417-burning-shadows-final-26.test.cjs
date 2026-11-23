'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const sm3=require('../app/src/main/assets/tcg-classic-burning-shadows.js');
const dummy={id:'sm3-stage4-dummy',kind:'pokemon',name:'Stage 4 dummy',stage:'Basic',hp:4000,types:['Colorless'],retreat:1,battleEnabled:true,attacks:[{name:'Test hit',cost:'C',damage:300,effect:{type:'noop'}}]};
const original=data.cardById;
function withDummy(fn){data.cardById=id=>id===dummy.id?dummy:original(id);try{return fn();}finally{data.cardById=original;}}
function slot(id,uid,energy={}){return {uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1};}
function setup(id='sm3-1',side='player'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:19,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Fairy'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Fairy']});
 s.phase='battle';s.activeSide=side;s.turnNumber=7;
 for(const [who,ss] of Object.entries(s.sides)){ss.turnCount=4;ss.hand=[];ss.deck=[{uid:who+'d1',cardId:'sm3-1'},{uid:who+'d2',cardId:'sm3-2'},{uid:who+'d3',cardId:'sm3-3'},{uid:who+'d4',cardId:'sm3-4'}];ss.discard=[];ss.bench=[];ss.energySupply=['Grass','Grass','Fire','Fire','Fire','Fire','Darkness'];ss.energyDiscard={Water:1,Darkness:2};ss.energyUsed=true;ss.handEnergyUsed=true;ss.supporterUsed=false;}
 s.sides[side].active=slot(id,side+'active',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Fairy:4});
 s.sides[side].bench=[slot('sm3-1',side+'bench',{})];
 const other=side==='player'?'opponent':'player';s.sides[other].active=slot(dummy.id,other+'active',{Water:2});s.sides[other].bench=[slot(dummy.id,other+'bench',{})];
 return s;
}
function choose(s,side,pred){const opts=core.legalActions(s,side),found=opts.find(pred);assert.ok(found,'Missing action: '+side+' state '+s.phase+' '+JSON.stringify(s.pendingChoice)+' available '+JSON.stringify(opts.slice(0,8)));core.applyAction(s,side,found);return found;}
function resolve(s,picks=[]){for(let n=0;s.phase==='effectChoice'&&n<50;n++){const side=s.pendingChoice?.side||s.activeSide,fn=picks.shift()||(()=>true);choose(s,side,fn);}assert.notEqual(s.phase,'effectChoice','Stuck choice');}
function attack(id,name,modify=()=>{},which=()=>true){return withDummy(()=>{const s=setup(id);modify(s);const idx=sm3.cardById(id).attacks.findIndex(a=>a.name===name);assert.ok(idx>=0,id+': '+name);choose(s,'player',a=>a.type==='attack'&&a.attackIndex===idx&&which(a));resolve(s);return s;});}
function trainer(id,modify=()=>{},picks=[]){return withDummy(()=>{const s=setup();modify(s);s.sides.player.hand.push({uid:'trainer-'+id,cardId:id});choose(s,'player',a=>a.type==='trainer'&&a.cardId===id);resolve(s,picks);return s;});}

test('every one of 177 collector prints is playable without unsupported descriptor',()=>{
 assert.equal(sm3.CARDS.length,177);assert.equal(sm3.CARDS.filter(c=>c.battleEnabled).length,177);
 for(const c of sm3.CARDS){assert.equal(c.support.status,'FULL',c.id);for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}
});
test('Odor Sleuth flips exactly twice and returns at most one real discarded card per heads',()=>{
 const s=attack('sm3-24','Odor Sleuth',s=>{s.sides.player.discard=[{uid:'lost1',cardId:'sm3-2'},{uid:'lost2',cardId:'sm3-3'}];s.sides.player.forceFirstCoinHeadTurn=s.turnNumber;});
 const flips=s.log.find(e=>e.reason==='Odor Sleuth');assert.equal(flips.results.length,2);assert.ok(s.sides.player.hand.length<=flips.heads);
 assert.equal(s.sides.player.hand.length+s.sides.player.discard.length,2);
});
test('Vacuum Bolt has optional boost with exactly 80 chosen friendly self-damage',()=>{
 const s=attack('sm3-46','Vacuum Bolt',()=>{},a=>a.effectSelection==='boost');
 assert.equal(s.sides.opponent.active.damage,160);
 assert.equal(s.sides.player.active.damage+s.sides.player.bench.reduce((n,p)=>n+p.damage,0),80);
 const no=attack('sm3-46','Vacuum Bolt',()=>{},a=>!a.effectSelection);assert.equal(no.sides.opponent.active.damage,80);
});
test('Unarmed ignores attack cost only with empty hand',()=>withDummy(()=>{
 const s=setup('sm3-48');s.sides.player.active.energy={};
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===1),'zero hand: free Unarmed');
 s.sides.player.hand=[{uid:'held',cardId:'sm3-1'}];
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===1),'nonzero hand: paid Unarmed');
}));
test('Dark Invitation benches a real opponent Basic from hand and adds three counters',()=>withDummy(()=>{
 const s=setup('sm3-53');s.sides.opponent.hand=[{uid:'invited',cardId:'sm3-1'},{uid:'item',cardId:'sm3-114'}];
 choose(s,'player',a=>a.type==='ability'&&a.cardId==='sm3-53');resolve(s);
 assert.ok(s.sides.opponent.bench.some(p=>p.uid==='invited'&&p.damage===30));assert.equal(s.sides.opponent.hand.length,1);
}));
test('Perplexing Eyes overrides weakness for next turn',()=>{const s=attack('sm3-59','Perplexing Eyes');assert.equal(s.sides.opponent.active.weaknessOverride,'Psychic');assert.ok(s.sides.opponent.active.weaknessOverrideExpiresTurn>=s.turnNumber);});
test('Dust Storm discards every attachment on both active Pokémon, not their Pokémon cards',()=>{
 const s=attack('sm3-62','Dust Storm',s=>{for(const side of ['player','opponent']){const ss=s.sides[side];ss.active.energy={Grass:1,Fire:1};ss.active.specialEnergy=[{uid:side+'special',cardId:'sm2-166'}];ss.active.tool={uid:side+'tool',cardId:'sm2-121'};}});
 for(const side of ['player','opponent']){const ss=s.sides[side];assert.equal(ss.active.specialEnergy.length,0);assert.equal(Object.values(ss.active.energy).reduce((a,b)=>a+b,0),0);assert.equal(ss.active.tool,null);assert.ok(ss.discard.some(x=>x.uid===side+'special'));assert.ok(ss.discard.some(x=>x.uid===side+'tool'));}
});
test('Intentional Grounding costs an actual Tool in hand and is zero without a Tool',()=>{
 const no=attack('sm3-79','Intentional Grounding');assert.equal(no.sides.opponent.active.damage,0);
 const yes=attack('sm3-79','Intentional Grounding',s=>{s.sides.player.hand=[{uid:'tool-cost',cardId:'sm2-121'}];});
 assert.equal(yes.sides.opponent.active.damage,90);assert.ok(yes.sides.player.discard.some(r=>r.uid==='tool-cost'));
});
test('Peerless Hundred Blows counts actual Basic Energy, not Special Energy',()=>{
 const s=attack('sm3-80','Peerless Hundred Blows-GX',s=>{s.sides.player.active.energy={Fighting:2};s.sides.player.active.specialEnergy=[{uid:'special',cardId:'sm2-166',provides:{Colorless:2}}];});
 assert.equal(s.sides.opponent.active.damage,100);assert.equal(s.sides.player.gxAttackUsed,true);
});
test('Shadow Hunt offers discarded Basic attacks and keeps their printed energy costs',()=>withDummy(()=>{
 const s=setup('sm3-80');s.sides.player.discard=[{uid:'fromPile',cardId:'sm3-1'}];
 const borrowed=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackCardId==='sm3-1');
 assert.ok(borrowed.length>0);s.sides.player.discard=[];
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackCardId==='sm3-1').length,0);
}));
test('Restoration offers discarded Darkrai to both player and CPU and attaches a discarded Darkness',()=>withDummy(()=>{
 for(const side of ['player','opponent']){
  const s=setup('sm3-1',side),ss=s.sides[side];ss.discard=[{uid:'restored',cardId:'sm3-88'}];ss.energyDiscard.Darkness=2;
  choose(s,side,a=>a.type==='abilityDiscard'&&a.cardId==='sm3-88');
  assert.ok(ss.bench.some(p=>p.uid==='restored'&&p.energy.Darkness===1));assert.equal(ss.energyDiscard.Darkness,1);assert.equal(ss.discard.length,0);
 }
}));
test('Sparkling Wish can evolve a chosen Pokémon from physical deck',()=>withDummy(()=>{
 const s=setup('sm3-94');s.sides.player.bench[0]=slot('sm3-1','cat',{});s.sides.player.deck=[{uid:'evolved',cardId:'sm3-2'}];
 choose(s,'player',a=>a.type==='attack'&&a.attackIndex===0);resolve(s);
 assert.equal(s.sides.player.bench[0].cardId,'sm3-2');assert.equal(s.sides.player.deck.length,0);
}));
test('Screech puts target-specific delayed damage bonus on defender',()=>{
 const s=attack('sm3-102','Screech');assert.ok(Number(s.sides.opponent.active.sm3ScreechUntil)>=s.turnNumber);
});
test('Initialize devolves every opponent evolution upon hand evolution trigger',()=>withDummy(()=>{
 const s=setup('sm3-104');s.sides.player.hand=[{uid:'pz',cardId:'sm3-105'}];
 const mon=s.sides.opponent.active;mon.cardId='sm3-2';mon.stack=['sm3-1','sm3-2'];
 choose(s,'player',a=>a.type==='evolve'&&a.cardId==='sm3-105');resolve(s);
 assert.equal(mon.cardId,'sm3-1');assert.ok(s.sides.opponent.hand.some(r=>r.cardId==='sm3-2'));
}));
test('Kiawe attaches only Fire resources on successful flips and ends turn',()=>{
 const s=trainer('sm3-116',s=>{s.sides.player.energySupply=['Fire','Fire','Fire','Fire'];s.sides.player.deck=[];s.sides.player.forceFirstCoinHeadTurn=s.turnNumber;});
 const log=s.log.filter(r=>r.reason==='Hybrid Basic Energy deck search');
 assert.equal(log.length,4);assert.equal(s.sides.player.active.energy.Fire,4+log.filter(r=>r.heads).length);assert.notEqual(s.activeSide,'player');
});
test('Plumeria requires two real hand discards before discarding opposing Energy',()=>{
 const s=trainer('sm3-120',s=>{s.sides.player.hand=[{uid:'cost1',cardId:'sm3-1'},{uid:'cost2',cardId:'sm3-2'}];s.sides.opponent.active.energy={Water:2};});
 assert.ok(s.sides.player.discard.some(r=>r.uid==='cost1'));assert.ok(s.sides.player.discard.some(r=>r.uid==='cost2'));
 assert.equal(s.sides.opponent.active.energy.Water,1);
});
test('Sophocles discards two physical hand cards and draws four',()=>{
 const s=trainer('sm3-123',s=>{s.sides.player.hand=[{uid:'cost1',cardId:'sm3-1'},{uid:'cost2',cardId:'sm3-2'}];});
 assert.ok(s.sides.player.discard.some(r=>r.uid==='cost1'));assert.ok(s.sides.player.discard.some(r=>r.uid==='cost2'));assert.equal(s.sides.player.hand.length,4);
});
test('Wishful Baton offers a KO choice and conserves up to 3 Basic Energy units',()=>withDummy(()=>{
 const s=setup('sm3-1','opponent');s.sides.player.active=slot('sm3-1','victim',{Grass:4,Water:1});s.sides.player.active.tool={uid:'baton',cardId:'sm3-128'};
 s.sides.player.bench=[slot('sm3-1','receiver',{})];s.sides.opponent.active=slot(dummy.id,'hit',{Colorless:1});
 choose(s,'opponent',a=>a.type==='attack');
 assert.equal(s.phase,'effectChoice');assert.ok(s.pendingChoice?.effect?.rule==='wishfulBaton');
 resolve(s,[a=>a.choiceOption===3,a=>a.choiceTarget==='bench']);
 assert.equal(s.sides.player.bench[0].energy.Grass,3);
 assert.ok(s.sides.player.discard.some(r=>r.uid==='baton'));
}));
test('every alternate print of Stage 4 GX and Supporters shares a fully supported rule',()=>{
 for(const id of ['sm3-88a','sm3-139','sm3-158','sm3-137','sm3-156','sm3-105a','sm3-116a','sm3-144','sm3-145','sm3-146']){
  assert.ok(sm3.cardById(id)?.battleEnabled,id);
  assert.equal(sm3.cardById(id)?.support.status,'FULL',id);
 }
});
test('Restoration consumes actual discarded Darkness Basic card before ledger Energy',()=>withDummy(()=>{
 const s=setup(),ss=s.sides.player;ss.discard=[{uid:'darkrai',cardId:'sm3-139'},{uid:'realDarkness',cardId:'sm3-168'}];ss.energyDiscard.Darkness=2;
 choose(s,'player',a=>a.type==='abilityDiscard'&&a.cardId==='sm3-139');
 assert.ok(ss.bench.some(p=>p.uid==='darkrai'&&p.energy.Darkness===1));assert.equal(ss.discard.length,0);assert.equal(ss.energyDiscard.Darkness,2);
}));
test('Shadow Hunt attack executes from discarded Basic and respects GX once-per-game limit',()=>withDummy(()=>{
 const s=setup('sm3-80');s.sides.player.discard=[{uid:'borrowed',cardId:'sm3-24'}];
 const borrowed=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackCardId==='sm3-24'&&a.attackIndex===1);
 assert.ok(borrowed,'Searing Flame legal through Shadow Hunt');core.applyAction(s,'player',borrowed);resolve(s);
 assert.ok(s.sides.opponent.active.conditions.burn,'copied attack applied Burn');
 s.activeSide='player';s.phase='battle';s.sides.player.gxAttackUsed=true;
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackCardId==='sm3-80'&&a.attackIndex===1));
}));
test('Wishful Baton can choose mixed Basic types without creating Energy',()=>withDummy(()=>{
 const s=setup('sm3-1','opponent');s.sides.player.active=slot('sm3-1','victim',{Grass:2,Water:2});
 s.sides.player.active.tool={uid:'baton',cardId:'sm3-128'};s.sides.player.bench=[slot('sm3-1','r1',{}),slot('sm3-1','r2',{})];
 s.sides.opponent.active=slot(dummy.id,'killer',{Colorless:1});
 choose(s,'opponent',a=>a.type==='attack');
 resolve(s,[a=>a.choiceOption===3,a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===1,a=>a.choiceOption===1,a=>a.choiceOption===0,a=>a.choiceOption===1]);
 const moved=s.sides.player.bench[1];assert.equal(moved.energy.Grass,1);assert.equal(moved.energy.Water,2);
 assert.equal(s.sides.player.bench[0].energy.Grass||0,0);
}));
test('Kiawe tails cannot create Fire Energy and still ends the Supporter turn',()=>{
 const s=trainer('sm3-144',s=>{s.sides.player.deck=[];s.sides.player.energySupply=['Fire','Fire','Fire','Fire'];s.sides.player.dp2ForceTailsUntil=s.turnNumber;});
 assert.equal(s.sides.player.active.energy.Fire,4);assert.equal(s.sides.player.energySupply.length,4);
 assert.equal(s.log.filter(e=>e.reason==='Hybrid Basic Energy deck search').length,4);
 assert.equal(s.activeSide,'opponent');
});
test('CPU can play Sophocles and complete both discard choices',()=>withDummy(()=>{
 const s=setup('sm3-1','opponent');s.sides.opponent.hand=[{uid:'fee1',cardId:'sm3-2'},{uid:'fee2',cardId:'sm3-3'},{uid:'soph',cardId:'sm3-146'}];
 choose(s,'opponent',a=>a.type==='trainer'&&a.cardId==='sm3-146');resolve(s);
 assert.equal(s.sides.opponent.discard.filter(x=>['fee1','fee2'].includes(x.uid)).length,2);
 assert.equal(s.sides.opponent.hand.length,4);
}));
test('Restoration never becomes a repeatable in-play activated Ability',()=>withDummy(()=>{
 const s=setup('sm3-88');
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='sm3-88'));
 s.sides.player.bench.push(slot('sm3-139','otherDarkrai'));
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='sm3-139'));
}));
test('Initialize offers a real optional choice and does not devolve if declined',()=>withDummy(()=>{
 const s=setup('sm3-104');s.sides.player.hand=[{uid:'pz',cardId:'sm3-105'}];
 const mon=s.sides.opponent.active;mon.cardId='sm3-2';mon.stack=['sm3-1','sm3-2'];
 choose(s,'player',a=>a.type==='evolve'&&a.cardId==='sm3-105');
 assert.equal(s.phase,'effectChoice');assert.ok(s.pendingChoice.options.length===2);
 resolve(s,[a=>a.choiceOption===1]);assert.equal(mon.cardId,'sm3-2');
}));
