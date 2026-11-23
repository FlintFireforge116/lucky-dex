'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const pack=require('../app/src/main/assets/tcg-classic-crimson-invasion.js');
const dummy={id:'sm4-test-dummy',kind:'pokemon',name:'Dummy',stage:'Basic',hp:4500,types:['Colorless'],retreat:1,battleEnabled:true,attacks:[{name:'Rest',cost:'C',damage:10,effect:{type:'noop'}}]};
const old=data.cardById;
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy,specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1});
const fullEnergy=()=>({Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4,Fairy:4,Colorless:4});
function setup(id,side='player'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:714,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide=side;s.turnNumber=5;
 for(const [who,b] of Object.entries(s.sides)){
  b.turnCount=3;b.hand=[{uid:who+'h',cardId:'sm4-12'}];
  b.deck=Array.from({length:15},(_,i)=>({uid:who+'d'+i,cardId:'sm4-18'}));
  b.discard=[{uid:who+'x',cardId:'sm4-1'}];b.energyDiscard={Water:2,Fire:2};b.energyUsed=true;b.handEnergyUsed=true;b.bench=[];
 }
 const other=side==='player'?'opponent':'player';s.sides[side].active=slot(id,side+'active',fullEnergy());
 s.sides[side].bench=[slot('sm4-12',side+'bench',{})];
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

test('Crimson Invasion stage1: every enabled attack completes for player and CPU once',()=>{
 let count=0;for(const c of pack.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'))for(const a of c.attacks){
  for(const side of ['player','opponent']){
   let s;try{s=attack(c.id,a.name,side);}catch(e){e.message=`${c.id} ${a.name} ${side}: ${e.message}`;throw e;}
   assert.equal(s.log.filter(x=>x.type==='attack'&&x.side===side&&x.attack===a.name).length,1,`${c.id} duplicate attack`);
  }count++;
 }
 assert.ok(count>=55,'Unexpectedly few enabled attacks '+count);
});


test('SM4 Pikachu Pika Draw takes exactly one card from the physical deck',()=>{
 const s=attack('sm4-30','Pika Draw');
 assert.equal(s.sides.player.hand.length,2);
 assert.equal(s.sides.player.deck.length,14);
});

test('SM4 Cacnea Sucker Punch gains only its printed Darkness-energy bonus',()=>{
 const dark=attack('sm4-5','Sucker Punch');assert.equal(dark.sides.opponent.active.damage,40);
 const none=attack('sm4-5','Sucker Punch','player',s=>{s.sides.player.active.energy={Grass:1,Colorless:5};});
 assert.equal(none.sides.opponent.active.damage,10);
});

test('SM4 Silvally-GX Rebel-GX counts the opposing Bench and consumes GX action',()=>{
 const s=attack('sm4-90','Rebel-GX');assert.equal(s.sides.opponent.active.damage,50);
 assert.equal(s.sides.player.gxAttackUsed,true);
});

test('SM4 Piloswine Rest heals its Active Pokémon and applies Sleep',()=>{
 const s=attack('sm4-20','Rest','player',s=>{s.sides.player.active.damage=70;});
 assert.equal(s.sides.player.active.damage,0);
 assert.ok(s.log.some(x=>x.type==='status'&&x.status==='sleep'&&x.side==='player'),'Rest must apply Sleep before Pokémon Checkup');
});

test('SM4 Regirock Rock Peak Growl improves Registeel attacks only',()=>{
 const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
 const s=setup('sm4-53');
 s.sides.player.active=slot('sm4-68','registeel-active',fullEnergy());
 s.sides.player.bench=[slot('sm4-53','regirock-bench',{})];
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),10);
 s.sides.player.active=slot('sm4-30','pikachu-active',{});
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),0);
});

test('SM4 Silvally-GX Gyro Unit makes a friendly Basic retreat without spending Energy',()=>{
 const s=setup('sm4-90');s.sides.player.active=slot('sm4-30','pika-no-energy',{});
 s.sides.player.bench=[slot('sm4-90','silvally',{})];
 const actions=core.legalActions(s,'player');
 assert.ok(actions.some(a=>a.type==='retreat'),JSON.stringify(actions.map(a=>a.type)));
});
