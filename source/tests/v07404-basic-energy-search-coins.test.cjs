'use strict';
// Global Classic deck-search conversion rule: each requested Basic Energy
// from Energy Zone requires its own heads. Physical/discard/normal uses unchanged.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
function setup(cardId,randomResults=[0.1]){
 const owner={id:'player',energySupply:['Lightning','Lightning','Water','Metal'],nextEnergyType:'Lightning',hand:[],deck:[],discard:[],energyDiscard:{},bench:[],active:{uid:'attacker',cardId:'base1-2',energy:{},specialEnergy:[],conditions:{}}};
 const foe={id:'opponent',energySupply:['Water'],hand:[],deck:[],bench:[],active:{uid:'foe',cardId:'base1-3',energy:{},conditions:{}}};
 const state={format:'classic',turnNumber:3,activeSide:'player',sides:{player:owner,opponent:foe},log:[]};
 let index=0,prompt=null;
 const ctx={state,side:'player',foeSide:'opponent',attacker:owner.active,defender:foe.active,trainerRef:{uid:'trainer',cardId},cardById:data.cardById,random:()=>randomResults[Math.min(index++,randomResults.length-1)],onEnergyAttached:()=>{},requestChoice:spec=>{prompt=spec;},action:{},shuffle:()=>{}};
 return {state,owner,ctx,get prompt(){return prompt;},get rolls(){return index;}};
}
function chooseZone(f,optionIndex=0){
 fx.applyEffect(data.cardById(f.ctx.trainerRef.cardId).effect,f.ctx);
 assert.ok(f.prompt, 'should offer an Energy Zone selection');
 const live=f.prompt.effect;
 const index=f.prompt.options?.findIndex(x=>x.includes('Energy Zone'))??-1;
 const opt=index<0?optionIndex:index;
 fx.applyEffect(live,{...f.ctx,resolvingChoice:true,action:{choiceOption:opt}});
}
test('Base Energy Search: heads retrieves one Basic Energy from Zone',()=>{
 const f=setup('base3-59',[0.1]);chooseZone(f);
 assert.equal(f.rolls,1);assert.equal(f.owner.hand.length,1);
 assert.equal(f.owner.energySupply.length,3);
 assert.equal(f.state.log.filter(x=>x.type==='coin'&&x.reason==='Hybrid Basic Energy deck search').length,1);
});
test('Base Energy Search: tails retrieves none and does not consume Zone',()=>{
 const f=setup('base3-59',[0.9]);chooseZone(f);
 assert.equal(f.rolls,1);assert.equal(f.owner.hand.length,0);
 assert.equal(f.owner.energySupply.length,4);
});
test('non-search Energy attachment is not coin-gated',()=>{
 const f=setup('base3-59',[0.9]);
 fx.applyEffect({type:'attachEnergy',target:'self',amount:1,energyType:'Lightning'},f.ctx);
 assert.equal(f.rolls,0);assert.equal(f.owner.active.energy.Lightning,1);
 assert.equal(f.owner.energySupply.length,3);
});
test('discard recovery is not coin-gated',()=>{
 const f=setup('base3-59',[0.9]);f.owner.energyDiscard.Lightning=1;
 fx.applyEffect({type:'searchChosen',source:'discard',filter:{basicEnergy:true},amount:1},f.ctx);
 assert.ok(f.prompt);assert.equal(f.rolls,0);
 fx.applyEffect(f.prompt.effect,{...f.ctx,resolvingChoice:true,action:{effectEnergyType:'Lightning'}});
 assert.equal(f.owner.hand.length,1);assert.equal(f.owner.energySupply.length,4);
 assert.equal(f.rolls,0);
});
test('four independent requested Basic Energy units: each tails remains in Zone',()=>{
 const f=setup('base3-59',[0.1,0.9,0.1,0.9]);
 // Sequential search effect with a 4-unit search allocation. A separate
 // user-facing choice is necessary when the basic types are different.
 const ss=f.owner;ss.energySupply=['Lightning','Lightning','Lightning','Lightning'];
 for(let i=0;i<4;i++){
   const c={...f.ctx}; // each selection is an independent Basic Energy search.
   // Direct modelled search action uses the same central gate marker inferred
   // by card metadata in the generic searchChosen entry point.
   fx.applyEffect({type:'searchChosen',source:'deck',filter:{basicEnergy:true},amount:1},c);
   const pending=f.prompt;
   fx.applyEffect(pending.effect,{...c,resolvingChoice:true,action:{choiceOption:0}});
 }
 assert.equal(f.rolls,4);assert.equal(ss.hand.length,2);assert.equal(ss.energySupply.length,2);
 assert.deepEqual(f.state.log.filter(x=>x.reason==='Hybrid Basic Energy deck search').map(x=>x.heads),[true,false,true,false]);
});
test('Diamond & Pearl Synthesis: legacy typed deck search attaches on heads only',()=>{
 for(const [roll,expected] of [[0.1,1],[0.9,0]]){
   const f=setup('base3-59',[roll]);
   f.ctx.trainerRef=null;
   f.owner.active.cardId='dp1-49';f.owner.energySupply=['Grass','Grass'];
   const effect=data.cardById('dp1-49').attacks[0].effect;
   fx.applyEffect(effect,f.ctx);
   assert.equal(f.prompt.effect.stage,'target');
   fx.applyEffect(f.prompt.effect,{...f.ctx,resolvingChoice:true,action:{choiceTarget:'active'}});
   assert.equal(f.owner.active.energy.Grass||0,expected);
   assert.equal(f.owner.energySupply.length,2-expected);
   assert.equal(f.rolls,1,'legacy rule must inherit exactly one global search flip');
 }
});
test('EX Ruby Skitty two-card adapted supply search continues after first tails',()=>{
 const f=setup('base3-59',[0.9,0.1]);f.ctx.trainerRef=null;
 f.owner.active.cardId='ex1-44';
 const effect=data.cardById('ex1-44').attacks[0].effect;
 assert.match(data.cardById('ex1-44').attacks[0].text,/separate supply/i);
 fx.applyEffect(effect,f.ctx);
 assert.ok(f.prompt.options?.length);
 fx.applyEffect(f.prompt.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(f.owner.hand.length,0);
 assert.ok(f.prompt.effect.remaining===1,'second search chance offered after tails');
 fx.applyEffect(f.prompt.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(f.rolls,2);assert.equal(f.owner.hand.length,1);
 assert.equal(f.owner.energySupply.length,3);
});

const core=require('../app/src/main/assets/tcgp-battle-core.js');
test('real Classic trainer and effectChoice preserve the coin rule across the CPU/player turn pipeline',()=>{
 const seen=new Set();
 for(let seed=1;seed<=48&&seen.size<2;seed++){
  const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed,firstSide:'player',playerEnergyTypes:['Lightning'],opponentEnergyTypes:['Water']});
  s.phase='battle';s.activeSide='player';s.turnNumber=9;
  const p=s.sides.player;
  p.hand=[{uid:'search-item',cardId:'dp1-117'}];p.deck=[];p.energySupply=['Lightning','Lightning'];p.nextEnergyType='Lightning';p.supporterUsed=false;
  p.active=core.makePokemonSlot('dp1-49',3,'player-test');
  s.sides.opponent.active=core.makePokemonSlot('dp1-49',3,'cpu-test');
  const trainer=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp1-117');
  assert.ok(trainer);core.applyAction(s,'player',trainer);
  assert.equal(s.phase,'effectChoice');
  const choices=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');
  assert.ok(choices.length);core.applyAction(s,s.choiceSide,choices.find(a=>!a.choiceSkip)||choices[0]);
  const coins=s.log.filter(e=>e.type==='coin'&&e.reason==='Hybrid Basic Energy deck search');
  assert.equal(coins.length,1);assert.equal(s.phase,'battle');
  const heads=coins[0].heads;seen.add(heads);
  assert.equal(p.hand.length,heads?1:0);
  assert.equal(p.energySupply.length,heads?1:2);
 }
 assert.deepEqual([...seen].sort(),[false,true],'both RNG outcomes should happen in a real battle');
});

test('Black & White Energy Search legacy trainer uses the shared flip',()=>{
 for(const [roll,expected] of [[0.1,1],[0.9,0]]){
  const f=setup('bw1-93',[roll]);
  fx.applyEffect(data.cardById('bw1-93').effect,f.ctx);
  assert.equal(f.prompt?.effect?.stage,'zone');
  fx.applyEffect(f.prompt.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
  assert.equal(f.owner.hand.length,expected);
  assert.equal(f.owner.energySupply.length,4-expected);
  assert.equal(f.state.log.filter(x=>x.reason==='Hybrid Basic Energy deck search').length,1);
 }
});
test('Plasma Storm Energy Search legacy trainer uses the shared flip',()=>{
 for(const [roll,expected] of [[0.1,1],[0.9,0]]){
  const f=setup('bw7-128',[roll]);
  fx.applyEffect(data.cardById('bw7-128').effect,f.ctx);
  assert.equal(f.prompt?.effect?.stage,'energy');
  fx.applyEffect(f.prompt.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
  assert.equal(f.owner.hand.length,expected);
  assert.equal(f.owner.energySupply.length,4-expected);
  assert.equal(f.state.log.filter(x=>x.reason==='Hybrid Basic Energy deck search').length,1);
 }
});
test('Victini-EX Turbo Energize makes a fresh flip for each of two searches after tails',()=>{
 const f=setup('base3-59',[0.9,0.1,0.5]);
 f.ctx.trainerRef=null;f.owner.active.cardId='bw8-18';
 f.owner.bench=[{uid:'bench1',benchSlot:0,cardId:'bw1-1',energy:{},conditions:{}}];
 const attack=data.cardById('bw8-18').attacks[0].effect;
 fx.applyEffect(attack,f.ctx);
 for(let n=0;n<2;n++){
  assert.equal(f.prompt?.effect?.stage,'chooseEnergy');
  const energyChoice=f.prompt.effect;
  fx.applyEffect(energyChoice,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
  assert.equal(f.prompt?.effect?.stage,'target');
  const targetChoice=f.prompt.effect;
  fx.applyEffect(targetChoice,{...f.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
  if(n===0)assert.equal(f.prompt?.effect?.stage,'chooseEnergy','first tails must not cancel second chance');
 }
 assert.equal(f.state.log.filter(x=>x.reason==='Hybrid Basic Energy deck search').length,2);
 assert.equal(f.owner.bench[0].energy.Lightning,1);
 assert.equal(f.owner.energySupply.length,3);
});
test('Rotom Energy Extract flips for Zone but does not consume Energy on tails',()=>{
 for(const [roll,expected] of [[0.1,1],[0.9,0]]){
  const f=setup('base3-59',[roll]);f.ctx.trainerRef=null;
  f.owner.active.cardId='xy10-24';
  const e=data.cardById('xy10-24').attacks[0].effect;
  fx.applyEffect(e,f.ctx);
  assert.equal(f.prompt?.kind,'option');
  fx.applyEffect(f.prompt.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
  assert.equal(f.owner.active.energy.Lightning||0,expected);
  assert.equal(f.owner.energySupply.length,4-expected);
  assert.equal(f.state.log.filter(x=>x.reason==='Hybrid Basic Energy deck search').length,1);
 }
});
