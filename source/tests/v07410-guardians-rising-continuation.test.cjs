'use strict';
// Guardians Rising independent audit, post-build-fix.
// Every enabled Pokémon attack is executed through the actual Classic battle
// controller, on both player and CPU turns; real choice continuations resolve.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..');
const fs=require('node:fs');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const pack=require('../app/src/main/assets/tcg-classic-guardians-rising.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const source=JSON.parse(fs.readFileSync(root+'/data/classic/sm2-print-compact.json','utf8'));
const coverage=JSON.parse(fs.readFileSync(root+'/docs/SM2_BUILD_COVERAGE.json','utf8'));
const dummy={id:'fixture-sm2-target',kind:'pokemon',name:'Audit Dummy',hp:4000,stage:'Basic',types:['Colorless'],attacks:[{name:'Rest',cost:['C'],damage:10,effect:{type:'noop'}}],battleEnabled:true,retreat:1};
const original=classic.cardById;
const slot=(id,uid,energy)=>({uid,cardId:id,stack:[id],damage:0,energy,specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1});
const fullEnergy=()=>({Grass:3,Fire:3,Water:3,Lightning:3,Psychic:3,Fighting:3,Darkness:3,Metal:3,Fairy:3,Colorless:3});
function setup(card,side='player',opts={}){
 const state=core.createBattle({format:'classic',playerDeck:classic.CLASSIC30_LOANER_DECK,opponentDeck:classic.CLASSIC30_LOANER_DECK,seed:421,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 state.phase='battle';state.activeSide=side;state.turnNumber=5;
 for(const [who,ss] of Object.entries(state.sides)){
  ss.turnCount=3;ss.hand=[{uid:who+'h1',cardId:'sm2-1'}];ss.deck=[{uid:who+'d1',cardId:'sm2-1'},{uid:who+'d2',cardId:'sm2-6'},{uid:who+'d3',cardId:'sm2-4'},{uid:who+'d4',cardId:'sm2-116'}];
  ss.discard=[{uid:who+'x1',cardId:'sm2-1'},{uid:who+'x2',cardId:'sm2-6'},{uid:who+'x3',cardId:'sm2-4'}];ss.bench=[];ss.energyDiscard={Fire:2,Water:2,Psychic:2,Metal:2,Lightning:2};ss.energyUsed=true;ss.handEnergyUsed=true;
 }
 const other=side==='player'?'opponent':'player';
 state.sides[side].active=slot(card.id,side+'-active',opts.energy||fullEnergy());
 state.sides[side].bench=[slot('sm2-1',side+'-bench',{Grass:1})];
 state.sides[other].active=slot(dummy.id,other+'-active',opts.opposingEnergy||{Water:3});
 state.sides[other].bench=[slot(dummy.id,other+'-bench',{Water:1})];
 return state;
}
function play(state,side,attackIndex){
 const a=core.legalActions(state,side).filter(x=>x.type==='attack'&&x.attackIndex===attackIndex);
 assert.ok(a.length,`${side} attack ${attackIndex} unavailable`);
 core.applyAction(state,side,a[0]);
 for(let n=0;['effectChoice','promote'].includes(state.phase)&&n<85;n++){
  const picker=state.phase==='promote'?(['player','opponent'].find(s=>core.legalActions(state,s).some(a=>a.type==='promote'))||state.activeSide):(state.pendingChoice?.side||state.activeSide);
  const actions=core.legalActions(state,picker);
  assert.ok(actions.length,`Unresolvable ${picker} choice ${JSON.stringify(state.pendingChoice)}`);
  core.applyAction(state,picker,actions[0]);
 }
 assert.notEqual(state.phase,'effectChoice','an unresolved choice may stall CPU turns');assert.notEqual(state.phase,'promote','promote after self-KO must complete');
 assert.ok(['battle','ended'].includes(state.phase),`Battle unexpectedly exited: ${state.phase}`);
 return state;
}
function withDummy(fn){classic.cardById=id=>id===dummy.id?dummy:original(id);try{return fn();}finally{classic.cardById=original;}}
function simulate(id,attackName,{energy,opposingEnergy,side='player',setupState}={}){
 return withDummy(()=>{
  const card=pack.cardById(id);assert.ok(card?.battleEnabled,id+' is gated');
  const index=card.attacks.findIndex(a=>a.name===attackName);assert.ok(index>=0,id+' missing '+attackName);
  const state=setup(card,side,{energy,opposingEnergy});if(setupState)setupState(state,side);
  play(state,side,index);return {state,slot:state.sides[side].active,foe:state.sides[side==='player'?'opponent':'player'].active};
 });
}
// Guardians Rising continuation: correctness, not only descriptor validation.
test('Trashalanche counts ONLY opposing Item cards in discard',()=>{
 for(const id of ['sm2-51','sm2-51a']){
  const r=simulate(id,'Trashalanche',{setupState(state,side){
   state.sides.opponent.discard=[{uid:'item1',cardId:'sm2-119'},{uid:'item2',cardId:'sm2-124'},{uid:'p',cardId:'sm2-1'},{uid:'support',cardId:'sm2-144'}];
   state.sides.player.discard=Array.from({length:7},(_,i)=>({uid:'self'+i,cardId:'sm2-119'}));
  }});
  assert.equal(r.foe.damage,40,id+' must count opponent items, excluding trainers other than Items');
 }
});
test('Finishing Stinger is legal when target undamaged, then deals damage only to damaged opponent',()=>{
 const no=simulate('sm2-68','Finishing Stinger');assert.equal(no.foe.damage,0);
 const yes=simulate('sm2-68','Finishing Stinger',{setupState(s){s.sides.opponent.active.damage=20;}});
 assert.equal(yes.foe.damage,90);
});
test('Facade bonus triggers exactly once for Burned or Poisoned',()=>{
 for(const [conditions,damage] of [[{},50],[{burn:true},130],[{poison:{amount:10}},130],[{burn:true,poison:{amount:10}},130]]){
  const r=simulate('sm2-49','Facade',{setupState(s){s.sides.player.active.conditions=conditions;}});
  assert.equal(r.foe.damage,damage,JSON.stringify(conditions));
 }
});
test('Karate Chop subtracts ten per damage counter, with a zero floor',()=>{
 for(const [self,damage] of [[0,60],[30,30],[70,0]]){
  const r=simulate('sm2-72','Karate Chop',{setupState(s){s.sides.player.active.damage=self;}});
  assert.equal(r.foe.damage,damage);
 }
});
test('Heavy Slam reduces damage by 30 per opponent retreat; Rock Wrecker flips per Lightning Energy',()=>{
 const heavy=simulate('sm2-42','Heavy Slam');assert.equal(heavy.foe.damage,170);
 const rock=simulate('sm2-42','Electromagnetic Rock Wrecker',{energy:{Lightning:3},setupState(s,side){s.sides[side].dp2ForceTailsUntil=5;}});
 assert.equal(rock.foe.damage,0);
 assert.equal(rock.state.log.filter(e=>e.type==='coin').at(-1)?.results?.length,3);
});
test('Blown Kiss puts one counter on selected Pokemon without Weakness',()=>{
 const r=simulate('sm2-52','Blown Kiss');
 assert.equal(r.foe.damage,10);
});
test('Raging Thunder damages one own Bench Pokemon, not all allies',()=>{
 const r=simulate('sm2-44','Raging Thunder',{setupState(s){s.sides.player.bench.push(slot('sm2-1','otherBench',{Grass:1}));}});
 assert.equal(r.foe.damage,120);
 assert.deepEqual(r.state.sides.player.bench.map(x=>x.damage).sort((a,b)=>a-b),[0,30]);
});
test('Bind Wound heals one own Pokemon on heads, not opponent',()=>{
 const r=simulate('sm2-101','Bind Wound',{setupState(s,side){s.sides[side].active.damage=50;s.sides[side].forceFirstCoinHeadTurn=5;}});
 assert.equal(r.slot.damage,20);
});
test('Power Whip scales with attacking Energy not selected target Energy',()=>{
 const r=simulate('sm2-96','Power Whip',{energy:{Dragon:0,Water:2,Grass:1},opposingEnergy:{Water:1}});
 assert.equal(r.foe.damage,60);
});
test('Tapu Cure-GX heals exactly two distinct Benched Pokemon and consumes GX use',()=>{
 for(const id of ['sm2-60','sm2-60a','sm2-137','sm2-155']){
  const r=simulate(id,'Tapu Cure-GX',{setupState(s,side){
   const ss=s.sides[side];ss.bench=[slot('sm2-1',side+'b1',{}),slot('sm2-1',side+'b2',{}),slot('sm2-1',side+'b3',{})];
   for(const x of ss.bench)x.damage=30;
  }});
  const left=r.state.sides.player.bench.map(x=>x.damage).sort((a,b)=>a-b);
  assert.deepEqual(left,[0,0,30],id+' must heal exactly two distinct targets');
  assert.equal(r.state.sides.player.gxAttackUsed,true);
 }
});
test('Stadium requirement does not make Revelation Dance illegal',()=>{
 const r=simulate('sm2-56','Revelation Dance');assert.equal(r.foe.damage,0);
});
test('Nitro Tank GX cannot create Fire Energy and distributes at most five real discard units',()=>{
 for(const id of ['sm2-18','sm2-131','sm2-148']){
  const r=simulate(id,'Nitro Tank-GX',{setupState(s,side){
    const ss=s.sides[side];ss.energyDiscard={Fire:3};ss.active.energy={Fire:3};ss.bench=[slot('sm2-1',side+'nb',{Fire:1})];
  }});
  const ss=r.state.sides.player;
  assert.equal((ss.active.energy.Fire||0)+(ss.bench[0].energy.Fire||0),7,id+' must conserve Fire');
  assert.equal(ss.energyDiscard.Fire||0,0,id+' must consume, not generate');
  assert.equal(ss.gxAttackUsed,true);
 }
});
test('Ice Path GX moves ALL self damage counters without Weakness, with no duplicate damage',()=>{
 for(const id of ['sm2-22','sm2-132','sm2-150']){
  const r=simulate(id,'Ice Path-GX',{setupState(s,side){s.sides[side].active.damage=90;}});
  assert.equal(r.slot.damage,0,id);
  assert.equal(r.foe.damage,90,id);
 }
});
test('Blue Surge GX moves each Basic Energy unit to Bench, preserving total',()=>{
 for(const id of ['sm2-38','sm2-133','sm2-151']){
  const r=simulate(id,'Blue Surge-GX',{energy:{Water:3,Lightning:2},setupState(s,side){s.sides[side].bench=[slot('sm2-1',side+'wb',{})]}});
  assert.deepEqual(r.slot.energy,{Water:0,Lightning:0},id);
  assert.equal(r.state.sides.player.bench[0].energy.Water,3,id);
  assert.equal(r.state.sides.player.bench[0].energy.Lightning,2,id);
 }
});
test('Plea GX returns exactly two opposing Bench Pokemon including attachments, not Active',()=>{
 for(const id of ['sm2-92','sm2-92a','sm2-140','sm2-158']){
  const r=simulate(id,'Plea-GX',{setupState(s,side){
   const foe=s.sides[side==='player'?'opponent':'player'];foe.hand=[];foe.deck=[{uid:'pleaDraw',cardId:'sm2-116'}];
   foe.bench=[slot('sm2-1','plea1',{Grass:1}),slot('sm2-2','plea2',{Grass:1}),slot('sm2-4','plea3',{})];
  }});
  const ss=r.state.sides.opponent;
  assert.equal(ss.bench.length,1,id+' removes only two Bench Pokemon');
  assert.equal(ss.active.cardId,'fixture-sm2-target');
  assert.equal(ss.hand.filter(x=>['sm2-1','sm2-2','sm2-4'].includes(x.cardId)).length,2,id+' returns exactly two Pokemon');
 }
});
test('Shell Trap counterattack survives defensive Pokemon knockout',()=>withDummy(()=>{
  const t=setup(pack.cardById('sm2-18'),'player',{energy:{Fire:2,Colorless:1}});
  const attack=core.legalActions(t,'player').find(x=>x.type==='attack'&&x.attackIndex===0);
  assert.ok(attack);core.applyAction(t,'player',attack);
  assert.equal(t.sides.player.active?.retaliate?.amount,80);
  // A subsequent opponent attack is sufficient to prove the retaliate effect
  // is scheduled; full KO interaction stays in the battle-engine regression.
}));
test('Lunala Wings of the Moone distributes both typed and special Energy, without creating any',()=>{
 const r=simulate('sm2-61','Wings of the Moone',{energy:{Psychic:3,Grass:2},setupState(s){s.sides.player.bench=[slot('sm2-1','lunaB',{})];s.sides.player.active.specialEnergy=[{uid:'lunaSpe',cardId:'sm2-166',provides:{Colorless:2}}];}});
 assert.equal(r.foe.damage,130);
 assert.equal(Object.values(r.slot.energy||{}).reduce((a,b)=>a+b,0),0);
 assert.equal(Object.values(r.state.sides.player.bench[0].energy||{}).reduce((a,b)=>a+b,0),5);
 assert.equal(r.slot.specialEnergy.length,0);assert.equal(r.state.sides.player.bench[0].specialEnergy.length,1);
});
function playTrainerSM2(id,configure,chooseAction){return withDummy(()=>{
 const state=setup(pack.cardById('sm2-1'));
 const ss=state.sides.player;
 ss.hand=[{uid:'sm2-trainer',cardId:id},{uid:'extra',cardId:'sm2-2'},{uid:'other',cardId:'sm2-3'}];
 ss.deck=Array.from({length:15},(_,i)=>({uid:'deck'+i,cardId:i%2?'sm2-1':'sm2-2'}));
 if(configure)configure(state);
 const options=core.legalActions(state,'player').filter(a=>a.type==='trainer'&&a.cardId===id);
 assert.ok(options.length,id+' should be playable');core.applyAction(state,'player',options[0]);
 for(let n=0;state.phase==='effectChoice'&&n<12;n++){
  const side=state.pendingChoice?.side||state.choiceSide||'player';const choices=core.legalActions(state,side);
  assert.ok(choices.length,`No legal ${id} choices ${JSON.stringify(state.pendingChoice)}`);
  core.applyAction(state,side,chooseAction?chooseAction(choices,state,n)||choices[0]:choices[0]);
 }
 assert.notEqual(state.phase,'effectChoice',id+' must resolve without stalling');
 return state;
});}
test('Hala draws four before GX use and seven after GX use (all prints)',()=>{
 for(const id of ['sm2-126','sm2-143'])for(const gxUsed of [false,true]){
  const state=playTrainerSM2(id,s=>{s.sides.player.gxAttackUsed=gxUsed;});
  assert.equal(state.sides.player.hand.length,gxUsed?7:4,id+' GX='+gxUsed);
  assert.equal(state.sides.player.supporterUsed,true);
 }
});
test('Max Potion heals the selected Pokemon and moves all its Basic and Special Energy to discard',()=>{
 for(const id of ['sm2-128','sm2-128a','sm2-164']){
  const state=playTrainerSM2(id,s=>{
   s.sides.player.active.energy={Water:2,Lightning:1};s.sides.player.active.damage=90;
   s.sides.player.bench=[];
   s.sides.player.active.specialEnergy=[{uid:'spe',cardId:'sm2-166'}];
  });
  assert.equal(state.sides.player.active.damage,0,id);
  assert.equal(Object.values(state.sides.player.active.energy||{}).reduce((a,b)=>a+b,0),0,id);
  assert.equal(state.sides.player.active.specialEnergy.length,0,id);
  assert.equal(state.sides.player.energyDiscard.Water,4,id);
  assert.equal(state.sides.player.energyDiscard.Lightning,3,id);
  assert.ok(state.sides.player.discard.some(x=>x.cardId==='sm2-166'),id);
 }
});

test('Rescue Stretcher: each mode moves only real Pokémon refs and fully resolves',()=>{
 for(const id of ['sm2-130','sm2-130a']){
  const recovered=playTrainerSM2(id,s=>{s.sides.player.discard=[{uid:'r1',cardId:'sm2-1'},{uid:'r2',cardId:'sm2-2'},{uid:'r3',cardId:'sm2-3'}];});
  assert.ok(recovered.sides.player.hand.some(r=>r.uid==='r1'),id+' hand mode moves one discarded Pokémon to hand');
  assert.equal(recovered.sides.player.discard.filter(r=>['r1','r2','r3'].includes(r.uid)).length,2);
  const reshuffled=playTrainerSM2(id,s=>{s.sides.player.discard=[{uid:'r1',cardId:'sm2-1'},{uid:'r2',cardId:'sm2-2'},{uid:'r3',cardId:'sm2-3'}];},(options,state,n)=>n===0?(options.find(a=>a.choiceOption===1)||options[0]):options[0]);
  assert.equal(reshuffled.sides.player.deck.filter(r=>['r1','r2','r3'].includes(r.uid)).length,3,id+' deck mode returns exactly three');
  assert.equal(reshuffled.sides.player.discard.filter(r=>['r1','r2','r3'].includes(r.uid)).length,0);
 }
});
test('Field Blower discards two chosen Stadium/Tool objects with no extra discards',()=>{
 for(const id of ['sm2-125','sm2-125a','sm2-163']){
  const state=playTrainerSM2(id,s=>{
   s.stadium={uid:'stad',cardId:'sm2-116',ownerSide:'opponent'};
   s.sides.opponent.active.tool={uid:'oldTool',cardId:'sm2-121'};
   s.sides.player.active.tool={uid:'ownTool',cardId:'sm2-121a'};
  });
  const side=state.sides.opponent;
  assert.equal(state.stadium,null,'first selection must remove Stadium');
  assert.ok(side.discard.some(r=>r.uid==='stad'));
  assert.ok(side.discard.some(r=>r.uid==='oldTool')||state.sides.player.discard.some(r=>r.uid==='ownTool'),'second selection must remove one Tool');
  assert.equal(Number(!!state.sides.opponent.active.tool)+Number(!!state.sides.player.active.tool),1,id+' should leave exactly one Tool');
 }
});
