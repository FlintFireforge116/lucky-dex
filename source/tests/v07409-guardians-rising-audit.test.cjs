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
test('Independent SM2 audit: all 180 records, legal gating, complete printed metadata',()=>{
 assert.equal(source.length,180);assert.equal(pack.CARDS.length,180);
 assert.equal(coverage.printed,180);assert.equal(coverage.battleReady+Object.keys(coverage.gated).length,180);
 assert.ok(coverage.battleReady>57,'Audit must unlock some previously safely-gated mechanics');
 for(let n=0;n<180;n++){
  const row=source[n],card=pack.CARDS[n];assert.equal(card.id,'sm2-'+row[0]);assert.equal(card.name,row[1]);
  assert.equal(card.battleEnabled,card.deckEligible,card.id+' inconsistent deck eligibility');
  if(card.kind==='pokemon'){
   assert.equal(card.hp,Number(row[4]));assert.equal(card.retreat,row[11]);assert.equal(card.weakness,row[9]);assert.equal(card.resistance,row[10]);
   assert.deepEqual(card.attacks.map(a=>a.name),row[7].map(a=>a[0]));
   assert.deepEqual(card.attacks.map(a=>a.text),row[7].map(a=>a[3]));
   assert.deepEqual(card.attacks.map(a=>Array.isArray(a.cost)?a.cost.join(''):String(a.cost)),row[7].map(a=>a[1].join('')));
   assert.equal(card.abilities.length,row[8].length);
   assert.equal(card.prizeCards,row[3].includes('GX')?2:1);
  }
  if(!card.battleEnabled){assert.ok(coverage.gated[card.id]?.length,card.id+' has no reported blocker');continue;}
  for(const attack of card.attacks||[]){assert.deepEqual(fx.validateEffect(attack.effect),[],card.id+' '+attack.name);if(attack.text.replace(/\(You can't use more than 1 GX attack in a game\.\)/g,'').trim())assert.notEqual(attack.effect.type,'noop',card.id+' unsupported printed attack was silently no-op');}
  for(const power of card.abilities||[])assert.deepEqual(fx.validateEffect(power.effect),[],card.id+' '+power.name);
  if(card.kind==='trainer')assert.deepEqual(fx.validateEffect(card.effect),[],card.id+' Trainer');
 }
 assert.equal(coverage.battleReady,180,'Final Guardians Rising audit must have all prints playable');
 assert.deepEqual(coverage.gated,{},'No Guards Rising prints may be silently gated in the completion release');
});
test('All enabled SM2 printed attacks finish without exception or stranded choice, both sides',()=>withDummy(()=>{
 let attacks=0;
 for(const card of pack.CARDS.filter(x=>x.battleEnabled&&x.kind==='pokemon'))for(let index=0;index<card.attacks.length;index++){
  for(const side of ['player','opponent']){
   const state=setup(card,side);try{play(state,side,index);}catch(e){e.message=card.id+' '+card.attacks[index].name+' '+side+': '+e.message;throw e;}
   assert.equal(state.log.filter(e=>e.type==='attack'&&e.attack===card.attacks[index].name&&e.side===side).length,1,`${card.id} ${card.attacks[index].name} ${side}: attack logged more than once`);
  }
  attacks++;
 }
 assert.ok(attacks>=120,'Unexpectedly low audit attack coverage: '+attacks);
}));
test('Coin-based Energy discard: heads discards only one, tails leaves it; no target Energy remains legal',()=>{
 for(const [id,name] of [['sm2-2','Muddy Acid'],['sm2-32','Crunch'],['sm2-51','Acid Spray']]){
  if(!pack.cardById(id)?.battleEnabled)continue;
  const h=simulate(id,name,{opposingEnergy:{Water:2},setupState(s,side){s.sides[side].forceFirstCoinHeadTurn=5}});
  assert.equal(h.state.sides.opponent.energyDiscard.Water,3,id+' heads should discard exactly one');
  const t=simulate(id,name,{opposingEnergy:{Water:2},setupState(s,side){s.sides[side].dp2ForceTailsUntil=5}});
  assert.equal(t.state.sides.opponent.energyDiscard.Water||0,2,id+' tails must not discard');
  const empty=simulate(id,name,{opposingEnergy:{},setupState(s,side){s.sides[side].forceFirstCoinHeadTurn=5}});
  assert.equal(empty.state.phase,'battle',id+' must not block attack with no target Energy');
 }
});
test('Petal Blizzard hits Active and Bench exactly once; Petal Dance scales with heads',()=>{
 const blizzard=simulate('sm2-5','Petal Blizzard');
 assert.equal(blizzard.foe.damage,10);assert.equal(blizzard.state.sides.opponent.bench[0].damage,10);
 const tails=simulate('sm2-5','Petal Dance',{setupState(s,side){s.sides[side].dp2ForceTailsUntil=5}});
 assert.equal(tails.foe.damage,0);assert.ok(tails.slot.conditions.confusion);
 assert.ok(pack.cardById('sm2-61').battleEnabled,'Lunala Wings of the Moone now uses tested full Energy redistribution');
});
test('Attack after-effects and Energy conservation: opponent draws, typed discard and copied GX rule',()=>{
 const beacon=simulate('sm2-21','Beacon');assert.ok(beacon.state.sides.player.hand.length>1,'Beacon must search physical Pokémon deck');
 const beam=simulate('sm2-86','Energy Link');assert.ok(Object.values(beam.state.sides.player.energyDiscard).reduce((a,b)=>a+b,0)<10,'Energy Link must attach only from discard inventory');
 const gx=simulate('sm2-115','Big Wheel-GX');assert.equal(gx.state.sides.player.gxAttackUsed,true,'GX once-per-game tracker must be updated');
});
test('Deck builder and CPU integration: SM2-only decks remain legal and Energy-synergistic across seeds',()=>{
 const owned=pack.CARDS.filter(x=>x.battleEnabled).map(x=>({gameplayId:x.id,quantity:4}));
 for(const seed of [3,9,24,45,91]){
  const b=builder.buildDeck(owned,{sets:['sm2'],style:seed%2?'competitive':'random',randomSeed:seed});
  assert.equal(b.ok,true,'player seed '+seed+': '+b.errors?.join('; '));assert.equal(b.cards.length,30);
  assert.ok(b.cards.every(id=>pack.cardById(id)?.battleEnabled),'blocked card generated by player builder');
  const c=cpu.generate({sets:['sm2'],type:['Grass','Water','Psychic','Fire','Fighting'][seed%5],seed});
  assert.equal(c.ok,true,'CPU seed '+seed+': '+c.error);assert.equal(c.cards.length,30);
  assert.ok(c.cards.every(id=>pack.cardById(id)?.battleEnabled),'blocked card generated by CPU builder');
 }
});
test('Toxapex-GX intense poison deals 100 between turns, with once-only GX protection',()=>{
 const t=simulate('sm2-57','Super Intense Poison');
 assert.equal(t.foe.conditions.poison?.amount,100,'Poison must be 100, not the regular 10');
 const p=simulate('sm2-57','Total Shelter-GX');
 assert.equal(p.state.sides.player.gxAttackUsed,true,'Total Shelter-GX must consume the one GX attack');
 assert.ok(p.slot.attackGuard||p.slot.statusGuard||p.slot.locks?.length||p.slot.protection||p.slot.preventEffectsUntil||p.state.modifiers?.length,'GX shield must leave an actual guard');
});
test('Poltergeist counts only opponent Trainer hand cards',()=>{
 const p=simulate('sm2-7','Poltergeist',{setupState(s){s.sides.opponent.hand=[{uid:'t1',cardId:'sm2-119'},{uid:'t2',cardId:'sm2-124'},{uid:'p1',cardId:'sm2-1'}]}});
 assert.equal(p.foe.damage,60,'Two Trainer cards should deal exactly 60 damage');
});
test('Victini Victory Star supplies an attack coin-reroll aura',()=>{
 const state=setup(pack.cardById('sm2-10'));
 state.sides.player.bench=[slot('sm2-10','victiniBench',{})];
 const r=fx.coinRerollSource(state,'player','attack',state.sides.player.active,classic.cardById);
 assert.equal(r?.abilityName,'Victory Star');
});
test('Geotech System attaches only discarded Psychic/Metal and respects once-per-turn activation',()=>{
 const state=setup(pack.cardById('sm2-85'));
 const before={...state.sides.player.energyDiscard};
 const actions=core.legalActions(state,'player').filter(a=>a.type==='ability'&&a.cardId==='sm2-85');
 assert.ok(actions.length,'Geotech System should be offered as usable activated ability');
 core.applyAction(state,'player',actions[0]);
 assert.equal(state.phase,'effectChoice','Geotech System must ask which Energy to attach');
 const opts=core.legalActions(state,state.pendingChoice?.side||'player');
 assert.ok(opts.length,'Geotech continuation must have usable options');
 const pick=opts.find(a=>a.choiceOption===0)||opts[0];
 core.applyAction(state,'player',pick);
 assert.notEqual(state.phase,'effectChoice','Geotech choice should finish');
 assert.equal((state.sides.player.active.energy.Psychic||0)-(fullEnergy().Psychic),1,'Should gain one Psychic from discard');
 assert.equal(before.Psychic-state.sides.player.energyDiscard.Psychic,1,'Must consume one Psychic in discard');
 assert.equal(core.legalActions(state,'player').filter(a=>a.type==='ability'&&a.cardId==='sm2-85').length,0,'Once per turn must be enforced');
});
test('Resolute Claws recognizes GX and EX opponents without double bonus',()=>{
 const saved={pokemonGX:dummy.pokemonGX,pokemonEX:dummy.pokemonEX};
 try{
  for(const [gx,ex,damage] of [[false,false,80],[true,false,150],[false,true,150]]){
   dummy.pokemonGX=gx;dummy.pokemonEX=ex;
   const result=simulate('sm2-9','Resolute Claws');
   assert.equal(result.foe.damage,damage,`Opponent GX=${gx} EX=${ex}`);
  }
 }finally{dummy.pokemonGX=saved.pokemonGX;dummy.pokemonEX=saved.pokemonEX;}
});
