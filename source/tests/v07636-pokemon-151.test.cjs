 'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const sv=require('../app/src/main/assets/tcg-classic-151'),data=require('../app/src/main/assets/tcg-classic-battle-data'),core=require('../app/src/main/assets/tcgp-battle-core'),fx=require('../app/src/main/assets/tcgp-battle-effects'),builder=require('../app/src/main/assets/tcg-classic-deck-builder'),opp=require('../app/src/main/assets/tcg-classic-opponents'),picker=require('../app/src/main/assets/tcg-classic-set-picker');
const canonical=require('../docs/SV3PT5_CANONICAL_SOURCE.json'),raw=require('../data/classic/sv3pt5-print-compact.json');
test('pinned 151 catalogue has all 207 numbered prints with exact identity, rules and eligibility',()=>{
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(require.resolve('../data/classic/sv3pt5-print-compact.json'))).digest('hex'),canonical.compactSha256);
 assert.equal(sv.CARDS.length,207);assert.equal(new Set(sv.CARDS.map(c=>c.id)).size,207);
 const codes={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C',Dragon:'N',Fairy:'Y'};
 for(const p of raw){const c=sv.cardById(p.id);assert.equal(data.cardById(p.id),c);assert.deepEqual([c.name,c.number,c.rarity,c.kind,c.image,c.imageLarge],[p.name,p.number,p.rarity,p.kind,p.image,p.imageLarge]);
  if(c.kind==='pokemon'){assert.deepEqual([c.hp,c.types,c.evolvesFrom,c.retreat,c.weakness,c.resistance],[p.hp,p.types,p.evolvesFrom,p.retreat,p.weakness,p.resistance]);assert.deepEqual(c.attacks.map(a=>[a.name,a.cost,a.damageText||'',a.text]),p.attacks.map(a=>[a.name,a.cost.map(x=>codes[x]).join(''),a.damage,a.text]));assert.deepEqual(c.abilities.map(a=>[a.name,a.text]),p.abilities.map(a=>[a.name,a.text]));for(const a of c.attacks)if(c.battleEnabled){assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}: ${fx.validateEffect(a.effect).join('; ')}`);assert.equal(a.effect.type==='noop',!a.text);}}
  if(c.kind==='trainer')assert.equal(c.text,p.rules[0]);if(!c.battleEnabled){assert.equal(c.deckEligible,false);assert.ok(c.support.reasons.length);}
 }
 for(const n of [65,113,132,152,153,154])assert.equal(sv.cardById('sv3pt5-'+n).battleEnabled,false);
 for(const n of [1,2,13,17,32,50,63,83,86,115,206,207])assert.equal(sv.cardById('sv3pt5-'+n).battleEnabled,true);
 assert.equal(sv.cardById('sv3pt5-207').deckEligible,false);
 assert.ok(sv.CARDS.filter(c=>c.battleEnabled).length>=50);
});
test('151 player and CPU selectors are registered, with explicit mixed-pool-only stage gate',()=>{
 for(const ids of [builder.SET_IDS,opp.SETS]){assert.ok(ids.includes('sv3pt5'));assert.match(picker.html({ids,selected:['sv3pt5']}),/data-set-choice="sv3pt5"/);}
 const rows=sv.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 assert.equal(builder.buildDeck(rows,{sets:['sv3pt5']}).ok,false);assert.equal(opp.generate({sets:['sv3pt5'],type:'Grass',seed:3}).ok,false);
});
const deck=[...Array(4).fill('sv1-30'),...Array(4).fill('sv1-32'),...Array(4).fill('sv1-33'),...Array(4).fill('sv1-36'),...Array(4).fill('sv1-188'),...Array(4).fill('sv1-180'),...Array(4).fill('sv1-189'),...Array(2).fill('sv1-194')];
function scene(side,id){const foe=side==='player'?'opponent':'player',s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:32,firstSide:side,playerEnergyTypes:['Grass','Fire','Water','Lightning','Fighting','Psychic'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Fighting','Psychic']});s.phase='battle';s.activeSide=side;s.turnNumber=8;for(const who of [side,foe]){const b=s.sides[who];b.turnCount=4;b.active=core.makePokemonSlot(who===side?id:'sv1-86',1,who+'a');b.active.energy={Fire:4,Grass:4,Water:4,Lightning:4,Fighting:4,Psychic:4};b.bench=['sv1-32','sv1-225','sv1-33'].map((id,i)=>({...core.makePokemonSlot(id,1,who+'b'+i),benchSlot:i}));}return {s,us:s.sides[side],them:s.sides[foe]};}
function attack(s,side,i=0){const a=core.legalActions(s,side).find(a=>a.type==='attack'&&a.attackIndex===i);assert.ok(a,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,a);}
for(const side of ['player','opponent']){
 test(side+' Bulbasaur Leech Seed heals exactly 20',()=>{const {s,us}=scene(side,'sv3pt5-1');const a=us.active;a.damage=30;attack(s,side);assert.equal(a.damage,10);});
 test(side+' Doduo Reckless Charge deals 10 recoil',()=>{const {s,us}=scene(side,'sv3pt5-84');const a=us.active;attack(s,side);assert.equal(a.damage,10);});
 test(side+' Machop Mountain Mashing discards the real top card',()=>{const {s,them}=scene(side,'sv3pt5-66');them.deck.unshift({uid:'151-top',cardId:'sv3-1'});attack(s,side);assert.ok(them.discard.some(r=>r.uid==='151-top'));});
}

// Stage 2: verify new effects, variants and actual symmetric battle outcomes.
test('151 stage 2 exact shared effects and explicit remaining dependencies',()=>{
 const by=n=>sv.cardById('sv3pt5-'+n);
 for(const n of [3,4,8,10,18,22,25,35,38,52,55,56,59,82,88,89,97,98,120,123,125,126,127,129,130,134,135,136,144,149,155,159,165])assert.ok(by(n).battleEnabled,`${n}: ${by(n).support.reasons}`);
 for(const n of [65,113,132,152,153,154])assert.equal(by(n).battleEnabled,false,by(n).name);
 for(const c of sv.CARDS.filter(c=>c.battleEnabled)){
   for(const a of c.abilities||[])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
   if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 for(const c of sv.CARDS.filter(c=>+c.number>151&&c.kind==='pokemon')){
   const match=sv.CARDS.find(p=>+p.number<=151&&p.name===c.name&&p.kind===c.kind&&p.hp===c.hp);
   assert.ok(match,c.id);assert.deepEqual(c.attacks,match.attacks);assert.deepEqual(c.abilities,match.abilities);assert.equal(c.battleEnabled,match.battleEnabled);
 }
 assert.equal(by(155).effect.filter.stage,'Stage 2');assert.equal(by(165).effect.filter.stage,'Stage 1');
 assert.equal(by(130).abilities[0].event,'evolved');assert.equal(by(130).abilities[0].fromHandOnly,true);
 assert.deepEqual(by(149).attacks[0].effect,{type:'discardTop',side:'self',amount:2});
 assert.equal(by(149).abilities[0].effect.scope,'team');
});
for(const side of ['player','opponent']){
 test(side+' Ninetales ex Mirrored Flames changes damage only for matching hand sizes',()=>{
  for(const same of [true,false]){const {s,us,them}=scene(side,'sv3pt5-38');them.active=core.makePokemonSlot('sv3pt5-6',1,'target');us.hand=[];them.hand=same?[]:[{uid:'extra',cardId:'sv3pt5-1'}];const target=them.active;
   attack(s,side,1);assert.equal(target.damage,same?220:80);}
 });
 test(side+' Dragonite Dragon Pulse discards exactly two of its own deck cards',()=>{
   const {s,us,them}=scene(side,'sv3pt5-149');
   them.active=core.makePokemonSlot('sv3pt5-6',1,'target');
   us.deck.unshift({uid:'dragon-pulse-first',cardId:'sv3pt5-1'},{uid:'dragon-pulse-second',cardId:'sv3pt5-2'},{uid:'dragon-pulse-third',cardId:'sv3pt5-3'});
   them.deck.unshift({uid:'dragon-pulse-opponent',cardId:'sv3pt5-4'});
   attack(s,side);
   assert.ok(us.discard.some(r=>r.uid==='dragon-pulse-first'));
   assert.ok(us.discard.some(r=>r.uid==='dragon-pulse-second'));
   assert.ok(us.deck.some(r=>r.uid==='dragon-pulse-third'));
   assert.ok(!them.discard.some(r=>r.uid==='dragon-pulse-opponent'));
 });
 test(side+' Fearow Beak Catch and recovery retain optional physical targets',()=>{
   const c=sv.cardById('sv3pt5-22');assert.deepEqual(c.attacks[0].effect,{type:'searchChosen',source:'deck',amount:3,optional:true,filter:{}});
   const d=sv.cardById('sv3pt5-55');assert.deepEqual(d.attacks[0].effect,{type:'searchChosen',source:'discard',amount:4,optional:true,filter:{kind:'pokemon'}});
 });
}

// Stage 3: preserve previous catalogue and gates; check precise new effect schemas.
test('151 stage 3 shared effects, target filters and alternate Trainer prints',()=>{
 const by=n=>sv.cardById('sv3pt5-'+n);
 for(const n of [14,15,31,41,49,58,76,79,80,87,94,107,124,146,150,156,194]){
  const c=by(n);assert.ok(c.battleEnabled,`${c.id}: ${c.support.reasons}`);
  for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
  if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 assert.deepEqual(by(14).abilities[0].effect,{type:'preventEffects',duration:'whileInPlay',scope:'self'});
 assert.deepEqual(by(31).attacks[0].effect.attackerFilter,{stage:'Basic'});
 assert.deepEqual(by(58).attacks[0].effect,{type:'discardEnergyCard',target:'opponentActive',amount:1,energyType:'Water',strictEnergyType:true,allowNoTarget:true});
 assert.equal(by(49).attacks[0].effect.effects[1].cardType,'Item');
 assert.equal(by(76).attacks[0].effect.attackName,'*');
 assert.equal(by(87).attacks[0].effect.activeWeaknessResistance,true);
 assert.equal(by(94).attacks[1].effect.benchOnly,true);
 assert.equal(by(107).abilities[0].opponentAttackOnly,true);
 assert.equal(by(146).attacks[0].effect.effects[1].target,'opponentBench');
 assert.deepEqual(by(156).effect,by(194).effect);
 assert.equal(by(156).effect.count,8);assert.equal(by(156).effect.amount,8);
});
for(const side of ['player','opponent']){
 test(side+' Slowpoke Sea Bathing heals 30 damage',()=>{
  const {s,us}=scene(side,'sv3pt5-79');const actor=us.active;actor.damage=40;
  attack(s,side);assert.equal(actor.damage,10);
 });
}

// Stage 4: check real card costs, alternate arts, conditional KO and timing.
test('151 stage 4 shared effects and exact resource restrictions',()=>{
 const by=n=>sv.cardById('sv3pt5-'+n);
 for(const n of [9,21,24,36,68,71,110,157,184,185,200]){
  const c=by(n);assert.ok(c.battleEnabled,`${c.id}: ${c.support.reasons}`);
  for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
  if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 const twin=by(9).attacks[0].effect;
 assert.deepEqual(twin,{type:'chooseDiscardForBonus',zone:'hand',max:2,amount:140,filter:{kind:'energy',basicEnergy:true,subtype:'Water'}});
 assert.deepEqual(by(9).attacks,by(184).attacks);assert.deepEqual(by(9).attacks,by(200).attacks);
 assert.deepEqual(by(24).attacks,by(185).attacks);
 assert.equal(by(24).attacks[1].effect.opponentChooses,true);
 assert.equal(by(21).abilities[0].effect.firstTurn,true);
 assert.equal(by(36).attacks[1].effect.rule,'sm12RedBanquet');
 assert.deepEqual(by(68).abilities[0].effect,{type:'koGuard',mode:'surviveCoin',remainingHp:10,attackOnly:true});
 assert.deepEqual(by(71).attacks[1].effect,{type:'scheduleDelayed',event:'endOpponentNextTurn',targetMode:'defender',effect:{type:'placeDamageCounters',target:'eventPokemon',amount:120}});
 assert.equal(by(110).abilities[0].event,'knockedOutByAttack');
 assert.equal(by(110).abilities[0].activeOnly,true);
 assert.equal(by(157).effect.effect.filter.basicEnergy,true);
});
for(const side of ['player','opponent']){
 test(side+' Machamp Mountain Chopping mills exactly the top two cards',()=>{
  const {s,them}=scene(side,'sv3pt5-68');
  them.deck.unshift({uid:'151-638-mill1',cardId:'sv3-1'},{uid:'151-638-mill2',cardId:'sv3-2'},{uid:'151-638-mill3',cardId:'sv3-3'});
  attack(s,side);assert.ok(them.discard.some(c=>c.uid==='151-638-mill1'));assert.ok(them.discard.some(c=>c.uid==='151-638-mill2'));assert.ok(!them.discard.some(c=>c.uid==='151-638-mill3'));
 });
}

// Stage 5: shared copy selection and scoped modifiers; all alternate prints agree.
test('151 stage 5 exact attack copy, damage counters and modifiers',()=>{
 const by=n=>sv.cardById('sv3pt5-'+n);
 for(const n of [40,85,104,106,151,164,187,193,205]){
  const c=by(n);assert.ok(c.battleEnabled,`${c.id}: ${c.support.reasons}`);
  for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
  if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 assert.deepEqual(by(40).attacks[0].effect,{type:'bonusDamage',amount:90,condition:{type:'supporterPlayed'}});
 assert.deepEqual(by(40).abilities[0].effect,{type:'modifier',stat:'maxHp',amount:100,scope:'self',duration:'whileInPlay',filter:{hasSpecialEnergy:true}});
 assert.deepEqual(by(40).abilities,by(187).abilities);
 assert.equal(by(85).abilities[0].oncePerTurn,true);
 assert.deepEqual(by(85).abilities[0].effect.effects,[{type:'placeDamageCounters',target:'self',amount:10},{type:'draw',amount:1}]);
 assert.equal(by(104).abilities[0].benchOnly,true);
 assert.deepEqual(by(104).abilities[0].effect.filter,{name:'Marowak'});
 assert.equal(by(104).abilities[0].effect.stat,'attackDamageActiveOnly');
 assert.deepEqual(by(106).attacks[0].effect.effects,[{type:'bonusDamage',amount:10},{type:'benchDamage',side:'opponent',all:true,amount:10},{type:'switch',target:'self',optional:false}]);
 for(const n of [151,193,205]){
  assert.equal(by(n).attacks[0].cost,'CCC');
  assert.deepEqual(by(n).attacks[0].effect,{type:'copyAttack',source:'opponentActive',ignoreUseCosts:true,sm12Copy:true});
  assert.deepEqual(by(n).abilities,by(151).abilities);
 }
 assert.deepEqual(by(164).effect,{type:'weaknessGuard',duration:'whileInPlay',scope:'self',filter:{stage:'Basic'}});
});

// Exercise the real scheduler, validator, and counter resolver without loading the full catalogue.
function check151DelayedCounters(sv,fx,assert){
 const effect=sv.cardById('sv3pt5-71').attacks[1].effect;
 const lookup=id=>sv.cardById(id);
 assert.ok(fx.supportsEffect(effect),fx.validateEffect(effect).join('; '));
 assert.equal(fx.supportsEffect({...effect,effect:{...effect.effect,target:'invalid'}}),false);
 assert.equal(fx.supportsEffect({...effect,effect:{...effect.effect,amount:125}}),false);
 const make=(id,uid)=>({cardId:id,uid,damage:0,energy:{},conditions:{},specialEnergy:[],stack:[]});
 for(const side of ['player','opponent'])for(const mode of ['remain','clear','switch','removed']){
  const label=side+' '+mode,foeSide=side==='player'?'opponent':'player';
  const att=make('sv3pt5-71','a'),def=make('sv3pt5-149','d'),bench={...make('sv3pt5-149','b'),benchSlot:0};
  const board=active=>({active,bench:[],hand:[],deck:[],discard:[],prizes:[],turnCount:4});
  const state={format:'classic',turnNumber:8,activeSide:side,sides:{[side]:board(att),[foeSide]:board(def)},log:[],modifiers:[],delayedEffects:[]};
  state.sides[foeSide].bench=[bench];
  const ctx=(who=side,source=att)=>({state,side:who,foeSide:who==='player'?'opponent':'player',attacker:source,defender:state.sides[who==='player'?'opponent':'player'].active,cardById:lookup,random:()=>0.1,action:{},isAttack:false});
  fx.applyEffect(effect,{...ctx(),isAttack:true});
  assert.equal(state.delayedEffects.length,1,label);assert.equal(state.delayedEffects[0].targetUid,def.uid,label);
  assert.equal(def.damage,0,label);fx.resolveDelayedEffects(state,side,lookup,ctx);assert.equal(def.damage,0,label);
  state.turnNumber=9;state.activeSide=foeSide;
  if(mode==='clear')fx.clearTemporaryEffects(state,def);
  if(mode==='switch')assert.ok(fx.switchPokemon(state.sides[foeSide],0,state));
  if(mode==='removed'){state.sides[foeSide].active=bench;state.sides[foeSide].bench=[];}
  fx.resolveDelayedEffects(state,foeSide,lookup,ctx);
  const expected=mode==='remain'?120:0;
  assert.equal(def.damage,expected,label);assert.equal(bench.damage,0,label);assert.equal(state.delayedEffects.length,0,label);
  fx.resolveDelayedEffects(state,foeSide,lookup,ctx);assert.equal(def.damage,expected,label+' resolves only once');
  if(mode==='remain')assert.equal(state.log.filter(x=>x.type==='damageCounters'&&x.amount===120).length,1,label);
 }
}

test('151 Slow-Acting Acid resolves twelve counters on the original defender exactly once, and clears on switch/removal',()=>check151DelayedCounters(sv,fx,assert));

// Stage 6: verify physical targets, real attack continuation and scoped effects.
test('151 stage 6 enables eleven prints with complete alternate-art parity',()=>{
 for(const n of [34,57,143,145,158,162,163,174,192,195,202])assert.ok(sv.cardById('sv3pt5-'+n).battleEnabled,n);
 for(const n of [192,202])assert.deepEqual(sv.cardById('sv3pt5-'+n).attacks,sv.cardById('sv3pt5-145').attacks);
 assert.deepEqual(sv.cardById('sv3pt5-195').effect,sv.cardById('sv3pt5-158').effect);
});
for(const side of ['player','opponent']){
 test(side+' Enthusiastic King waives cost only while allied Nidoqueen is present',()=>{
  const {s,us,them}=scene(side,'sv3pt5-34');us.active.energy={};const legal=()=>core.legalActions(s,side).some(a=>a.type==='attack');
  assert.equal(legal(),false);them.bench[0]= {...core.makePokemonSlot('sv3pt5-31',1,'opposing-queen'),benchSlot:0};assert.equal(legal(),false);
  us.bench[0]={...core.makePokemonSlot('sv3pt5-31',1,'allied-queen'),benchSlot:0};assert.equal(legal(),true);
  us.bench.shift();assert.equal(legal(),false);
 });
 test(side+' Primeape Rant and Rave self-confuses and unconfused Raging Smash does no damage',()=>{
  const one=scene(side,'sv3pt5-57');one.them.active=core.makePokemonSlot('sv3pt5-6',1,'target');const actor=one.us.active;attack(one.s,side);assert.equal(actor.conditions.confusion,true);
  const two=scene(side,'sv3pt5-57');two.them.active=core.makePokemonSlot('sv3pt5-6',1,'target');const target=two.them.active;attack(two.s,side,1);assert.equal(target.damage,0);
 });
 test(side+' Multishot Lightning retains main hit and targets only damaged Benched Pokémon',()=>{
  for(const hasDamaged of [true,false]){
   const {s,them}=scene(side,'sv3pt5-145');them.active=core.makePokemonSlot('sv3pt5-6',1,'target');const target=them.active;
   them.bench=[0,1].map(i=>({...core.makePokemonSlot('sv3pt5-6',1,'zap-b'+i),benchSlot:i}));const bench=them.bench.slice();if(hasDamaged)bench[1].damage=10;
   attack(s,side);assert.equal(target.damage,120);
   if(hasDamaged){assert.equal(s.phase,'effectChoice');const choices=core.legalActions(s,side);assert.ok(choices.length);assert.equal(choices.filter(a=>a.choiceBenchIndex===0).length,0,JSON.stringify(choices));const pick=choices.find(a=>a.choiceBenchIndex===1);assert.ok(pick,JSON.stringify(choices));core.applyAction(s,side,pick);assert.equal(bench[1].damage,100);}
   else assert.notEqual(s.phase,'effectChoice');assert.equal(bench[0].damage,0);
  }
 });
 test(side+' Daisy reveals only own prizes without moving them, Grabber filters Pokémon',()=>{
  const {s,us,them}=scene(side,'sv3pt5-143');const foe=side==='player'?'opponent':'player';const lookup=data.cardById;
  const ctx={state:s,side,foeSide:foe,attacker:us.active,defender:them.active,cardById:lookup,action:{},drawCard:b=>b.hand.push(b.deck.shift())};
  us.deck=[{uid:'draw1',cardId:'sv3pt5-1'},{uid:'draw2',cardId:'sv3pt5-2'}];us.hand=[];us.prizes=[{uid:'prize1',cardId:'sv3pt5-3'}];them.prizes=[{uid:'enemy-prize',cardId:'sv3pt5-4'}];
  fx.applyEffect(sv.cardById('sv3pt5-158').effect,ctx);assert.deepEqual(us.hand.map(r=>r.uid),['draw1','draw2']);assert.equal(us.prizes.length,1);assert.equal(them.prizes.length,1);
  const reveal=s.log.find(x=>x.type==='revealPrizes'&&x.privateTo===side);assert.ok(reveal);assert.deepEqual(reveal.cards,['sv3pt5-3']);
  them.hand=[{uid:'trainer',cardId:'sv3pt5-158'},{uid:'mon',cardId:'sv3pt5-1'}];let request;
  const effect=sv.cardById('sv3pt5-162').effect;fx.applyEffect(effect,{...ctx,requestChoice:r=>request=r});assert.deepEqual(request.allowedUids,['mon']);
  fx.applyEffect(effect,{...ctx,resolvingChoice:true,action:{choiceHandIndex:0}});assert.equal(them.hand.length,2);
  fx.applyEffect(effect,{...ctx,resolvingChoice:true,action:{choiceHandIndex:1}});assert.equal(them.deck.at(-1).uid,'mon');assert.equal(them.hand[0].uid,'trainer');
 });
 test(side+' Leftovers heals 20 on owner end turn only, Active only',()=>{
  const {s,us,them}=scene(side,'sv3pt5-143');const foe=side==='player'?'opponent':'player';const effect=sv.cardById('sv3pt5-163').effect;const actor=us.active;actor.damage=50;
  const ctx={state:s,side,foeSide:foe,attacker:actor,defender:them.active,cardById:data.cardById,action:{},eventData:{turnSide:foe}};
  s.activeSide=foe;fx.applyPersistentEvent(effect,'endTurn',ctx);assert.equal(actor.damage,50);
  s.activeSide=side;ctx.eventData.turnSide=side;fx.applyPersistentEvent(effect,'endTurn',ctx);assert.equal(actor.damage,30);
  us.bench.push(actor);us.active=us.bench.shift();fx.applyPersistentEvent(effect,'endTurn',ctx);assert.equal(actor.damage,30);
 });
}

// Stage 7: exact physical deck windows and reused pre-damage choices.
test('151 stage 7 enables six prints',()=>{
 for(const n of [44,45,73,95,101,117])assert.ok(sv.cardById('sv3pt5-'+n).battleEnabled,n);
 assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length>=171,true);
 const e=sv.cardById('sv3pt5-73').attacks[1].effect;assert.equal(fx.supportsEffect({...e,coins:2}),false);assert.equal(fx.supportsEffect({...e,firstTailStatus:'invalid'}),false);
});
for(const side of ['player','opponent']){
 test(side+' Tentacular Panic uses a single coin sequence and confuses only on first tails',()=>{
  for(const flips of [[0.9],[0.1,0.9],[0.1,0.1,0.9]]){
   const {s,us,them}=scene(side,'sv3pt5-73');let i=0;const ctx={state:s,side,foeSide:side==='player'?'opponent':'player',attacker:us.active,defender:them.active,cardById:data.cardById,random:()=>flips[i++],action:{},isAttack:true};
   const r=fx.resolveAttack(sv.cardById('sv3pt5-73').attacks[1],ctx);assert.equal(r.damage,90*(flips.length-1));assert.equal(i,flips.length);assert.equal(r.pendingEffects.some(e=>e.type==='status'&&e.status==='confusion'),flips.length===1);
  }
 });
 test(side+' Thumpalanche discards all five cards and counts only exact printed retreat four',()=>{
  const {s,us,them}=scene(side,'sv3pt5-95');const ids=['base2-11','sv3pt5-1','base1-99','base3-36','sv3pt5-158','base2-27'];us.deck=ids.map((cardId,i)=>({cardId,uid:'mill'+i}));us.discard=[];
  const r=fx.resolveAttack(sv.cardById('sv3pt5-95').attacks[0],{state:s,side,foeSide:side==='player'?'opponent':'player',attacker:us.active,defender:them.active,cardById:data.cardById,action:{},isAttack:true});assert.equal(r.damage,160);assert.deepEqual(us.discard.map(x=>x.cardId),ids.slice(0,5));assert.equal(us.deck[0].cardId,ids[5]);
 });
 test(side+' Blinding Ink applies a two-coin gate to the original defender',()=>{
  const {s,them}=scene(side,'sv3pt5-117');them.active=core.makePokemonSlot('sv3pt5-3',1,'target');const target=them.active;attack(s,side);assert.equal(target.damage,50);assert.equal(target.attackGate.coins,2);assert.equal(target.attackGate.expiresTurn,9);fx.clearTemporaryEffects(s,target);assert.equal(target.attackGate,undefined);
 });
 test(side+' Bang Boom Chain discards a chosen Tool before base plus bonus damage',()=>{
  const {s,us,them}=scene(side,'sv3pt5-101');them.active=core.makePokemonSlot('sv3pt5-6',1,'target');const target=them.active;us.bench[0].tool={cardId:'sv3pt5-163',uid:'tool-643'};attack(s,side);assert.equal(s.phase,'effectChoice');const pick=core.legalActions(s,side).find(a=>a.choiceOption===0&&!a.choiceSkip);assert.ok(pick);core.applyAction(s,side,pick);assert.ok(us.discard.some(x=>x.uid==='tool-643'));assert.equal(target.damage,60);
 });
 test(side+' blooming abilities use their exact evolution windows',()=>{
  for(const [id,from,count] of [['sv3pt5-44','sv3pt5-43',3],['sv3pt5-45','sv3pt5-44',8]]){
   const {s,us}=scene(side,from);us.hand=[{cardId:id,uid:'evolve-643'}];us.deck=Array.from({length:count+1},(_,i)=>({cardId:i===0||i===count?'base1-99':'sv3pt5-1',uid:'window'+i}));const initial=us.active.energy.Grass;
   const evo=core.legalActions(s,side).find(a=>a.type==='evolve'&&a.target==='active');assert.ok(evo,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,evo);assert.equal(us.active.cardId,id);assert.equal(s.phase,'effectChoice');const options=core.legalActions(s,side).filter(a=>!a.choiceSkip);assert.equal(options.length,1);core.applyAction(s,side,options[0]);const pick=core.legalActions(s,side).find(a=>a.choiceTarget==='active');assert.ok(pick,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,pick);assert.equal(us.active.energy.Grass,initial+1);assert.ok(us.deck.some(r=>r.uid==='window'+count));assert.ok(!us.deck.some(r=>r.uid==='window0'));
  }
 });
}

// Stage 8: named Supporters and their dependent Pokémon.
test('151 stage 8 enables ten prints and preserves Supporter artwork parity',()=>{
 for(const n of [53,112,114,160,161,178,196,197,203,204])assert.ok(sv.cardById('sv3pt5-'+n).battleEnabled,n);
 assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length,181);
 for(const [a,b] of [[160,196],[160,203],[161,197],[161,204]])assert.deepEqual(sv.cardById('sv3pt5-'+a).effect,sv.cardById('sv3pt5-'+b).effect);
});
function trainer(s,side,id){const a=core.legalActions(s,side).find(a=>a.type==='trainer'&&a.cardId===id);assert.ok(a,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,a);}
for(const side of ['player','opponent']){
 test(side+' Erika chooses only Basic Pokémon from opponent hand, benches and switches exactly that card',()=>{
  const {s,us,them}=scene(side,'sv3pt5-114');them.bench.pop();us.hand=[{uid:'erika',cardId:'sv3pt5-203'}];them.hand=[{uid:'basic',cardId:'sv3pt5-1'},{uid:'evo',cardId:'sv3pt5-2'},{uid:'trainer',cardId:'sv3pt5-158'}];const old=them.active;
  trainer(s,side,'sv3pt5-203');assert.equal(s.phase,'effectChoice');const actions=core.legalActions(s,side);assert.equal(actions.length,1);assert.equal(actions[0].choiceHandIndex,0);core.applyAction(s,side,actions[0]);assert.equal(them.active.uid,'basic');assert.ok(them.bench.includes(old));assert.deepEqual(them.hand.map(x=>x.uid),['evo','trainer']);assert.equal(us.sm10SupporterTurns["Erika's Invitation"],8);
  const target=them.active;attack(s,side);assert.equal(target.damage,70);
 });
 test(side+' Giovanni returns Basic or Special Energy to the opponent, then attaches a physical hand Energy to own Active',()=>{
  for(const special of [false,true]){
   const {s,us,them}=scene(side,'sv3pt5-112');them.active=core.makePokemonSlot('sv3pt5-6',1,'target');them.active.energy=special?{}:{Water:1};them.active.specialEnergy=special?[{uid:'special',cardId:'base1-96'}]:[];them.hand=[];us.hand=[{uid:'gio',cardId:'sv3pt5-197'},{uid:'hand-energy',cardId:'base1-99'}];us.handEnergyUsed=true;const old=us.active.energy.Grass;
   trainer(s,side,'sv3pt5-197');assert.equal(s.phase,'effectChoice');core.applyAction(s,side,core.legalActions(s,side)[0]);assert.equal(them.hand.length,1);assert.equal(them.hand[0].cardId,special?'base1-96':'neo1-111');assert.equal(s.phase,'effectChoice');const choices=core.legalActions(s,side);assert.equal(choices.length,1);core.applyAction(s,side,choices[0]);assert.equal(us.active.energy.Grass,old+1);assert.equal(us.hand.length,0);assert.equal(us.sm10SupporterTurns["Giovanni's Charisma"],8);
   const target=them.active;attack(s,side,1);assert.equal(target.damage,180);
  }
 });
 test(side+' named attack bonuses expire and do not accept a different Supporter',()=>{
  for(const [n,index,base,boost,name] of [[112,1,40,140,"Giovanni's Charisma"],[114,0,10,60,"Erika's Invitation"]])for(const mode of ['same','previous','different']){
   const {s,us,them}=scene(side,'sv3pt5-'+n);them.active=core.makePokemonSlot('sv3pt5-6',1,'target');us.supporterUsed=true;us.sm10SupporterTurns={[mode==='different'?"Daisy's Help":name]:mode==='previous'?7:8};const target=them.active;attack(s,side,index);assert.equal(target.damage,base+(mode==='same'?boost:0));
  }
 });
 test(side+' Persian can search alternate artwork of Giovanni without consuming a Supporter play',()=>{
  const {s,us}=scene(side,'sv3pt5-53');us.hand=[];us.deck=[{uid:'gio-search',cardId:'sv3pt5-204'},{uid:'other',cardId:'sv3pt5-203'}];const a=core.legalActions(s,side).find(a=>a.type==='ability'&&a.target==='active');assert.ok(a,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,a);const pick=core.legalActions(s,side).find(x=>x.choiceCardId==='sv3pt5-204');assert.ok(pick,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,pick);assert.equal(us.hand[0].uid,'gio-search');assert.equal(!!us.supporterUsed,false);
 });
}
