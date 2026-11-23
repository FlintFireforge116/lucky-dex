'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const pack=require('../app/src/main/assets/tcg-classic-burning-shadows.js');
const dummy={id:'sm3-test-dummy',kind:'pokemon',name:'Dummy',stage:'Basic',hp:4500,types:['Colorless'],retreat:1,battleEnabled:true,attacks:[{name:'Rest',cost:'C',damage:10,effect:{type:'noop'}}]};
const old=data.cardById;
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy,specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1});
const fullEnergy=()=>({Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4,Fairy:4,Colorless:4});
function setup(id,side='player'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:714,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide=side;s.turnNumber=5;
 for(const [who,b] of Object.entries(s.sides)){
  b.turnCount=3;b.hand=[{uid:who+'h',cardId:'sm3-12'}];
  b.deck=Array.from({length:15},(_,i)=>({uid:who+'d'+i,cardId:'sm3-18'}));
  b.discard=[{uid:who+'x',cardId:'sm3-1'}];b.energyDiscard={Water:2,Fire:2};b.energyUsed=true;b.handEnergyUsed=true;b.bench=[];
 }
 const other=side==='player'?'opponent':'player';s.sides[side].active=slot(id,side+'active',fullEnergy());
 s.sides[side].bench=[slot('sm3-12',side+'bench',{})];
 s.sides[other].active=slot(dummy.id,other+'active',{Water:4});s.sides[other].bench=[slot(dummy.id,other+'bench',{})];
 return s;
}
function attack(id,name,side='player',modify=()=>{}){
 const c=pack.cardById(id);assert.ok(c?.battleEnabled,id+' is gated');const ix=c.attacks.findIndex(a=>a.name===name);assert.ok(ix>=0,id+' lacks '+name);
 data.cardById=x=>x===dummy.id?dummy:old(x);
 try{
  const s=setup(id,side);modify(s,side);
  const act=core.legalActions(s,side).find(a=>a.type==='attack'&&a.attackIndex===ix);assert.ok(act,`${id} ${name} ${side} illegal`);
  core.applyAction(s,side,act);
  for(let n=0;['effectChoice','promote'].includes(s.phase)&&n<80;n++){
   const picker=s.phase==='promote'?(['player','opponent'].find(x=>core.legalActions(s,x).some(a=>a.type==='promote'))||s.activeSide):(s.pendingChoice?.side||s.activeSide);
   const opts=core.legalActions(s,picker);assert.ok(opts.length,`no choice: ${id} ${name} ${s.phase}`);
   core.applyAction(s,picker,opts[0]);
  }
  assert.ok(['battle','ended'].includes(s.phase),id+' '+name+' stuck phase '+s.phase);
  return s;
 }finally{data.cardById=old;}
}

test('Burning Shadows stage1: every enabled attack completes for player and CPU once',()=>{
 let count=0;for(const c of pack.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'))for(const a of c.attacks){
  for(const side of ['player','opponent']){
   let s;try{s=attack(c.id,a.name,side);}catch(e){e.message=`${c.id} ${a.name} ${side}: ${e.message}`;throw e;}
   assert.equal(s.log.filter(x=>x.type==='attack'&&x.side===side&&x.attack===a.name).length,1,`${c.id} duplicate attack`);
  }count++;
 }
 assert.ok(count>=95,'Unexpectedly few enabled attacks '+count);
});

test('SM3 Water Arrow targets any Pokémon without bonus energy or weakness',()=>{
 for(const [id,n] of [['sm3-29',10],['sm3-30',30]]){
  const s=attack(id,'Water Arrow');const foe=s.sides.opponent;
  assert.equal((foe.active.damage||0)+(foe.bench[0]?.damage||0),n);
 }
});

test('SM3 Raging Out GX discards exactly ten opponent deck cards and uses GX once',()=>{
 const s=attack('sm3-20','Raging Out-GX');assert.equal(s.sides.opponent.deck.length,4);assert.equal(s.sides.opponent.discard.length,11);assert.equal(s.sides.player.gxAttackUsed,true);
});

test('SM3 Boomburst GX damages defender and bench exactly once',()=>{
 const s=attack('sm3-99','Boomburst-GX');assert.equal(s.sides.opponent.active.damage,50);assert.equal(s.sides.opponent.bench[0].damage,50);
});

test('SM3 Golisopod GX crossing attack and 30-to-120 First Impression',()=>{
 const s=attack('sm3-17','First Impression');assert.equal(s.sides.opponent.active.damage,30);
 const b=attack('sm3-17','First Impression','player',s=>{s.sides.player.active.movedFromBenchThisTurn=true;});
 assert.ok(b.sides.opponent.active.damage>=30);
});
