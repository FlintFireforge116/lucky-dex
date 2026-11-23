'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
function setup(id,{supply=['Grass','Grass','Fire','Fire'],rolls=[.9,.1],deck=[],hand=[],bench=2,opponentBench=0,trainer=false}={}){
 const slot=(cardId,uid,benchSlot=0)=>({uid,cardId,benchSlot,stack:[cardId],energy:{},specialEnergy:[],damage:0,conditions:{}});
 const a=slot(id,'a0');
 const p={id:'player',energySupply:supply.slice(),deck:deck.map((cardId,i)=>({uid:'deck'+i,cardId})),hand:hand.map((cardId,i)=>({uid:'hand'+i,cardId})),discard:[],energyDiscard:{},active:a,bench:Array.from({length:bench},(_,i)=>slot('sm1-14','b'+i,i)),benchLimit:3,turnCount:4};
 const o={id:'opponent',energySupply:[],deck:[],hand:[],discard:[],energyDiscard:{},active:slot('sm1-1','foe'),bench:Array.from({length:opponentBench},(_,i)=>slot('sm1-1','fb'+i,i))};
 const state={format:'classic',turnNumber:9,activeSide:'player',sides:{player:p,opponent:o},log:[]};
 let randomCalls=0,prompt=null;
 const ctx={state,side:'player',foeSide:'opponent',attacker:a,defender:o.active,trainerRef:trainer?{cardId:id,uid:'trainer'}:null,cardById:data.cardById,random:()=>rolls[Math.min(randomCalls++,rolls.length-1)],requestChoice:q=>{prompt=q;},onEnergyAttached:()=>{},shuffle:()=>{},drawCard:()=>{},eventData:{fromHand:true},isAttack:!trainer,action:{},benchCard:(ss,ref)=>{const index=Array.from({length:ss.benchLimit},(_,i)=>i).find(i=>!ss.bench.some(p=>p.benchSlot===i));if(index===undefined)return null;ss.bench.push(slot(ref.cardId,ref.uid,index));return index;}};
 return {p,o,a,state,ctx,get prompt(){return prompt;},get randomCalls(){return randomCalls;},apply(effect){prompt=null;fx.applyEffect(effect||data.cardById(id).effect||data.cardById(id).attacks[0].effect,ctx);},choose(action){assert.ok(prompt,'missing choice for '+id);const q=prompt;prompt=null;fx.applyEffect(q.effect,{...ctx,resolvingChoice:true,action});},coinLog(){return state.log.filter(x=>x.reason==='Hybrid Basic Energy deck search');},drain(actions){for(const a of actions)this.choose(a);}};
}
const opt=n=>({choiceOption:n}),deckPick=n=>({choiceDeckIndex:n}),active=()=>({choiceTarget:'active'});

test('Team Aqua and Team Magma Conspirator each attempt both searches after tails',()=>{
 for(const id of ['ex4-77','ex4-82']){
  const x=setup(id,{supply:['Fire','Grass'],rolls:[.9,.1],bench:0,trainer:true});
  x.apply();assert.equal(x.prompt.kind,'option');x.choose(opt(0));
  assert.equal(x.coinLog().length,1);assert.equal(x.p.hand.length,0);
  assert.equal(x.prompt.kind,'option','tails should not cancel second search');x.choose(opt(0));
  assert.equal(x.coinLog().length,2);assert.equal(x.p.hand.length,1);assert.equal(x.p.energySupply.length,1);
 }
});
test('Conspirator can mix a Team Basic from physical deck and one Zone search',()=>{
 const x=setup('ex4-77',{deck:['ex4-17'],supply:['Fire'],rolls:[.1],bench:0,trainer:true});
 x.apply();assert.equal(x.prompt.kind,'option');x.choose(opt(0));assert.equal(x.prompt.kind,'deckCard');x.choose(deckPick(0));
 assert.equal(x.p.hand.length,1);assert.equal(x.coinLog().length,0);assert.equal(x.prompt.kind,'option');
 x.choose(opt(0));assert.equal(x.coinLog().length,1);assert.equal(x.p.hand.length,2);
});
test('Igglybuff Set Song searches Zone after Basic Pokemon and also without one',()=>{
 for(const deck of [[],['sm1-1']]){
  const x=setup('ex5-37',{supply:['Grass'],rolls:[.9],deck,bench:0});x.apply();
  if(deck.length){assert.equal(x.prompt.kind,'deckCard');x.choose(deckPick(0));assert.equal(x.p.hand.length,1);}
  assert.equal(x.prompt.kind,'option');x.choose(opt(0));assert.equal(x.coinLog().length,1);
  assert.equal(x.p.energySupply.length,1,'tails preserves finite Zone');
 }
});
test('Remoraid Energy Draw requires original heads and a separate hybrid heads',()=>{
 const fail=setup('ex7-73',{supply:['Water'],rolls:[.9],bench:0});fail.apply();assert.equal(fail.prompt,null);assert.equal(fail.coinLog().length,0);
 for(const [roll,success] of [[.9,0],[.1,1]]){
  const x=setup('ex7-73',{supply:['Water'],rolls:[.1,roll],bench:0});x.apply();assert.equal(x.prompt.kind,'option');x.choose(opt(0));
  assert.equal(x.coinLog().length,1);assert.equal(x.a.energy.Water||0,success);
 }
});
test('Typhlosion ex Bursting Up continues after a failed Zone flip',()=>{
 const x=setup('ex10-110',{supply:['Fire','Fire'],rolls:[.9,.1],opponentBench:2});
 const effect=data.cardById('ex10-110').abilities[0].effect;x.apply(effect);
 assert.equal(x.prompt.kind,'pokemon');x.choose(active());
 assert.equal(x.prompt.kind,'option');x.choose(opt(0));
 assert.equal(x.prompt.kind,'option','first tails must leave second search');x.choose(opt(0));
 assert.equal(x.coinLog().length,2);assert.equal(x.a.energy.Fire||0,1);assert.equal(x.p.energySupply.length,1);
});
test('Holon Researcher must pay discard cost before choosing Metal Zone search',()=>{
 const noCost=setup('ex11-95',{supply:['Metal'],hand:[],bench:0,trainer:true});noCost.apply();assert.equal(noCost.prompt,null);assert.equal(noCost.coinLog().length,0);
 const x=setup('ex11-95',{supply:['Metal'],hand:['sm1-1'],rolls:[.1],bench:0,trainer:true});x.apply();assert.equal(x.prompt.kind,'handCard');x.choose({choiceHandIndex:0});
 assert.equal(x.p.discard.length,1);assert.equal(x.prompt.kind,'option');x.choose(opt(0));
 assert.equal(x.coinLog().length,1);assert.equal(x.p.hand.length,1);
});
test('Infernape Blaze Dance independent Zone flips after original coin',()=>{
 const x=setup('dp7-3',{supply:['Fire','Fire','Fire','Fire'],rolls:[.1,.9,.1,.9,.1],bench:0});
 const ab=data.cardById('dp7-3').abilities[0].effect;x.apply(ab);
 for(let i=0;i<4;i++){assert.equal(x.prompt.kind,'option');x.choose(opt(1));assert.equal(x.prompt.kind,'pokemon');x.choose(active());}
 assert.equal(x.coinLog().length,4);assert.equal(x.a.energy.Fire||0,2);
});
test('Bronzong Cycler pays the hand-to-deck cost then flips for both Zone Energy searches',()=>{
 const x=setup('dp7-13',{hand:['sm1-1'],supply:['Grass','Grass'],rolls:[.9,.1],bench:0});
 x.apply(data.cardById('dp7-13').abilities[0].effect);assert.equal(x.prompt.kind,'option');x.choose(opt(0));
 assert.equal(x.p.hand.length,0);assert.equal(x.p.deck.length,1);
 for(let i=0;i<2;i++){assert.equal(x.prompt.kind,'option');x.choose(opt(1));}
 assert.equal(x.coinLog().length,2);assert.equal(x.p.hand.length,1);assert.equal(x.p.deck.length,1);
});
test('Drifblim Lifting can Bench two Basics and give each one coin-gated Energy',()=>{
 const x=setup('dp7-16',{deck:['sm1-1','sm1-1'],supply:['Grass','Grass'],rolls:[.9,.1],bench:0});
 x.apply(data.cardById('dp7-16').attacks.find(a=>a.name==='Lifting').effect);
 for(let i=0;i<2;i++){
  assert.equal(x.prompt.kind,'option');x.choose(opt(1)); // bench first Basic
  assert.equal(x.prompt.kind,'option');x.choose(opt(1)); // Zone Grass
 }
 assert.equal(x.coinLog().length,2);assert.equal(x.p.bench.length,2);
 assert.equal(x.p.bench[0].energy.Grass||0,0);assert.equal(x.p.bench[1].energy.Grass||0,1);
});
test('Tangela Ingrain does not grant protection unless a searched Energy attached',()=>{
 for(const [roll,expected] of [[.9,0],[.1,1]]){
  const x=setup('dp7-78',{supply:['Grass'],rolls:[.1,roll],bench:0});
  x.apply();assert.equal(x.prompt.kind,'option');x.choose(opt(0));
  assert.equal(x.coinLog().length,1);assert.equal(x.a.energy.Grass||0,expected);
  assert.equal(!!x.a.attackGuard,!!expected);
 }
});
test('Arceus Ripple Swell adapts requirement to four play slots and flips independently',()=>{
 const x=setup('pl4-AR5',{supply:['Fire','Fire','Fire','Fire'],rolls:[.9,.1,.9,.1],bench:3});
 x.p.bench.forEach((p,i)=>{p.cardId=['pl4-AR1','pl4-AR2','pl4-AR3'][i]});
 x.apply();
 for(let i=0;i<4;i++){assert.equal(x.prompt.kind,'option');x.choose(opt(0));assert.equal(x.prompt.kind,'option');x.choose(opt(0));}
 assert.equal(x.coinLog().length,4);assert.equal(x.p.energySupply.length,2);
 const unready=setup('pl4-AR5',{supply:['Fire'],rolls:[.1],bench:2});unready.apply();assert.equal(unready.prompt,null);
});
test('HGSS Unown DARK triggered Zone search recognizes Basic Darkness naming alias',()=>{
 for(const [roll,expected] of [[.9,0],[.1,1]]){
  const x=setup('hgss3-40',{supply:['Darkness'],rolls:[roll],bench:0});
  x.apply(data.cardById('hgss3-40').abilities[0].effect);
  assert.equal(x.prompt.kind,'option');x.choose(opt(0));
  assert.equal(x.coinLog().length,1);assert.equal(x.p.hand.length,expected);
 }
});

test('Conspirator can take two eligible physical cards without a hybrid flip',()=>{
 const x=setup('ex4-82',{deck:['ex4-23','neo1-108'],supply:['Fire'],rolls:[.9,.9],bench:0,trainer:true});
 x.apply();
 // If the Team Magma Basic print is not eligible, at least the real Grass
 // Energy must remain selectable through the physical picker.
 assert.ok(x.prompt);x.choose(opt(0));
 assert.equal(x.prompt.kind,'deckCard');
 const index=x.p.deck.findIndex(ref=>data.cardById(ref.cardId)?.basicEnergy);
 x.choose(deckPick(index));assert.equal(x.coinLog().length,0);
 assert.equal(x.p.hand.length,1);
});
test('Holon Researcher can still choose a real delta Pokemon instead of Zone Energy',()=>{
 const x=setup('ex11-95',{supply:['Metal'],deck:['ex11-1'],hand:['sm1-1'],rolls:[.9],bench:0,trainer:true});
 x.apply();x.choose({choiceHandIndex:0});assert.equal(x.prompt.kind,'option');x.choose(opt(0));
 assert.equal(x.prompt.kind,'deckCard');x.choose(deckPick(0));
 assert.equal(x.p.hand[0]?.cardId,'ex11-1');assert.equal(x.coinLog().length,0);
});
test('Remoraid physical Basic Energy search uses printed flip only, no extra hybrid coin',()=>{
 const x=setup('ex7-73',{supply:['Fire'],deck:['neo1-108'],rolls:[.1,.9],bench:0});
 x.apply();x.choose(opt(0));assert.equal(x.prompt.kind,'deckCard');x.choose(deckPick(0));
 assert.equal(x.randomCalls,1);assert.equal(x.coinLog().length,0);
 assert.equal(x.a.energy.Grass,1);
});
test('Six-slot Arceus format still requires all six differently typed Arceus',()=>{
 const x=setup('pl4-AR5',{supply:['Grass'],bench:3,rolls:[.1]});
 x.p.benchLimit=5;
 x.p.bench.forEach((p,i)=>{p.cardId=['pl4-AR1','pl4-AR2','pl4-AR3'][i]});
 x.apply();assert.equal(x.prompt,null,'four Arceus must not activate on a six-slot board');
 for(const [i,id] of ['pl4-AR4','pl4-AR6'].entries())x.p.bench.push({uid:'extra'+i,benchSlot:3+i,cardId:id,energy:{},conditions:{}});
 x.apply();assert.equal(x.prompt?.kind,'option');
});
