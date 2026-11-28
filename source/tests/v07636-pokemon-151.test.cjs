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
 for(const n of [65])assert.equal(sv.cardById('sv3pt5-'+n).battleEnabled,false);
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
 for(const n of [65])assert.equal(by(n).battleEnabled,false,by(n).name);
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
 assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length>=181,true);
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

// Stage 9: real printed Dome and Helix Fossil Abilities and their evolution lines.
test('151 stage 9 enables seven prints, includes missing printed Fossil Abilities',()=>{
 for(const n of [138,139,140,141,152,153,180])assert.ok(sv.cardById('sv3pt5-'+n).battleEnabled,n);
 assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length>=188,true);
 
 assert.equal(sv.cardById('sv3pt5-152').abilities[0].name,'Domed Armor');assert.equal(sv.cardById('sv3pt5-153').abilities[0].name,'Helical Swell');
});
for(const side of ['player','opponent']){
 const foe=side==='player'?'opponent':'player';
 test(side+' Fossil placement and exact evolution dependencies',()=>{
  for(const [fossil,evolution,wrong,final] of [[152,140,138,141],[153,138,140,139]]){
   const {s,us}=scene(side,'sv3pt5-1');us.bench.pop();us.hand=[{uid:'fossil',cardId:'sv3pt5-'+fossil},{uid:'evo',cardId:'sv3pt5-'+evolution},{uid:'wrong',cardId:'sv3pt5-'+wrong},{uid:'final',cardId:'sv3pt5-'+final}];
   trainer(s,side,'sv3pt5-'+fossil);const slot=us.bench.find(p=>p.uid==='fossil');assert.ok(slot);assert.equal(data.cardById(slot.cardId).hp,60);assert.ok(!core.legalActions(s,side).some(a=>a.type==='evolve'&&a.benchIndex===slot.benchSlot));
   slot.playedOnSideTurn=1;const actions=core.legalActions(s,side).filter(a=>a.type==='evolve'&&a.benchIndex===slot.benchSlot);assert.equal(actions.length,1);core.applyAction(s,side,actions[0]);assert.equal(slot.cardId,'sv3pt5-'+evolution);slot.playedOnSideTurn=1;const stage2=core.legalActions(s,side).find(a=>a.type==='evolve'&&a.benchIndex===slot.benchSlot);assert.ok(stage2);core.applyAction(s,side,stage2);assert.equal(slot.cardId,'sv3pt5-'+final);
  }
 });
 test(side+' Domed Armor reduces attack damage by 30 and respects Ability suppression',()=>{
  for(const suppressed of [false,true]){const {s,them}=scene(side,'sv3pt5-117');them.active=core.makePokemonSlot('sv3pt5-152',1,'fossil');const target=them.active;if(suppressed)them.swsh10CologneTurn=s.turnNumber;assert.equal(fx.modifierAmount(s,foe,target,'damageReduction',data.cardById),suppressed?0:30);attack(s,side,0);assert.equal(target.damage,suppressed?50:20);}
 });
 test(side+' Helical Swell and Primordial Tentacles lock only the opposing player while Active',()=>{
  for(const [id,kind] of [[153,'trainer'],[139,'retreat']]){
   const {s,us,them}=scene(side,'sv3pt5-1');them.active=core.makePokemonSlot('sv3pt5-'+id,1,'fossil');us.hand=[{uid:'stadium',cardId:'sm4-99'}];const legal=()=>core.legalActions(s,side).some(a=>a.type===kind&&(kind!=='trainer'||a.cardId==='sm4-99'));assert.equal(legal(),false);them.swsh10CologneTurn=s.turnNumber;assert.equal(legal(),true);delete them.swsh10CologneTurn;them.bench[0]=them.active;them.active=core.makePokemonSlot('sv3pt5-1',1,'new');assert.equal(legal(),true);
  }
 });
 test(side+' Ancient Way quadruples opposing Active weakness with Kabutops on Bench, not own weakness',()=>{
  const {s,us,them}=scene(side,'sv3pt5-4');them.active=core.makePokemonSlot('sv3pt5-3',1,'target');us.bench[0]=core.makePokemonSlot('sv3pt5-141',1,'kabutops');assert.equal(fx.attackDamageWithState(s,side,us.active,foe,them.active,30,data.cardById),120);them.bench[0]=core.makePokemonSlot('sv3pt5-3',1,'bench');assert.notEqual(fx.attackDamageWithState(s,side,us.active,foe,them.bench[0],30,data.cardById),120);us.bench[0]=core.makePokemonSlot('sv3pt5-1',1,'other');assert.equal(fx.attackDamageWithState(s,side,us.active,foe,them.active,30,data.cardById),60);
 });
 test(side+' Omanyte returns chosen physical Energy without Giovanni attachment',()=>{
  const {s,us,them}=scene(side,'sv3pt5-180');them.active=core.makePokemonSlot('sv3pt5-3',1,'target');them.active.energy={Water:1};them.active.specialEnergy=[{uid:'special-fossil',cardId:'base1-96'}];them.hand=[];us.hand=[{uid:'own-energy',cardId:'base1-99'}];const target=them.active;attack(s,side);assert.equal(target.damage,50);assert.equal(s.phase,'effectChoice');const pick=core.legalActions(s,side).find(a=>a.choiceOption===1);assert.ok(pick);core.applyAction(s,side,pick);assert.equal(target.energy.Water,1);assert.equal(target.specialEnergy.length,0);assert.equal(them.hand[0].uid,'special-fossil');assert.equal(us.hand[0].uid,'own-energy');assert.notEqual(s.phase,'effectChoice');
 });
 test(side+' Aqua Split adds two distinct Bench hits without replacing the Active hit',()=>{
  const {s,them}=scene(side,'sv3pt5-139');them.active=core.makePokemonSlot('sv3pt5-3',1,'target');const target=them.active;them.bench=[0,1,2].map(i=>({...core.makePokemonSlot('sv3pt5-6',1,'aqua-b'+i),benchSlot:i}));const bench=them.bench.slice();attack(s,side);assert.equal(target.damage,90);for(let i=0;i<2;i++){assert.equal(s.phase,'effectChoice');const pick=core.legalActions(s,side).find(a=>a.choiceBenchIndex===i);assert.ok(pick,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,pick);}assert.deepEqual(bench.map(p=>p.damage),[30,30,0]);
 });
}
for(const side of ['player','opponent'])test(side+' Antique Fossils are status immune, cannot retreat, and voluntary discard awards no Prize',()=>{
 for(const id of [152,153]){const {s,us,them}=scene(side,'sv3pt5-'+id);const target=us.active;for(const status of ['sleep','confusion','paralysis','poison','burn'])assert.ok(fx.statusIsPrevented(s,target,data.cardById,status));assert.ok(!core.legalActions(s,side).some(a=>a.type==='retreat'));const prizes=them.prizes.length;const a=core.legalActions(s,side).find(a=>a.type==='discardFossil'&&a.target==='active');assert.ok(a);core.applyAction(s,side,a);assert.equal(them.prizes.length,prizes);assert.ok(us.discard.some(r=>r.uid===target.uid&&r.cardId===target.cardId));assert.equal(s.phase,'promote');}
});

// Stage 10: Amber, Aerodactyl, Porygon, Eevee and Haunter.
test('151 stage 10 enables five prints',()=>{for(const n of [93,133,137,142,154])assert.ok(sv.cardById('sv3pt5-'+n).battleEnabled,n);assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length>=193,true);assert.equal(sv.cardById('sv3pt5-154').abilities[0].name,'Amber Protection');});
for(const side of ['player','opponent']){
 const foe=side==='player'?'opponent':'player';
 test(side+' Amber prevents opposing Ability counters, not attack damage, and evolves into Aerodactyl',()=>{
  const {s,us,them}=scene(side,'sv3pt5-154');const p=us.active;
  const context={state:s,side:foe,foeSide:side,attacker:them.active,cardById:data.cardById,isAbility:true};
  fx.applyEffect({type:'placeDamageCounters',target:'opponentActive',amount:20},context);assert.equal(p.damage,0);
  us.swsh10CologneTurn=s.turnNumber;fx.applyEffect({type:'placeDamageCounters',target:'opponentActive',amount:20},context);assert.equal(p.damage,20);delete us.swsh10CologneTurn;
  fx.applyEffect({type:'placeDamageCounters',target:'opponentActive',amount:10},{...context,isAbility:false,isAttack:true});assert.equal(p.damage,30);
  us.hand=[{uid:'aero',cardId:'sv3pt5-142'}];p.playedOnSideTurn=1;const evolve=core.legalActions(s,side).find(a=>a.type==='evolve');assert.ok(evolve);core.applyAction(s,side,evolve);assert.equal(p.cardId,'sv3pt5-142');assert.equal(p.damage,30);
 });
 test(side+' Devolution Ray retains damage and attachments and returns only highest stage to hand',()=>{
  const {s,them}=scene(side,'sv3pt5-142');const p=them.active=core.makePokemonSlot('sv3pt5-6',1,'devo');p.stack=['sv3pt5-4','sv3pt5-5','sv3pt5-6'];p.energy={Fire:1};them.hand=[];attack(s,side,1);assert.equal(p.damage,100);assert.equal(p.cardId,'sv3pt5-5');assert.deepEqual(p.stack,['sv3pt5-4','sv3pt5-5']);assert.equal(p.energy.Fire,1);assert.equal(them.hand[0].cardId,'sv3pt5-6');
 });
 test(side+' Conversion 4 retains chosen Weakness until moving to Bench',()=>{
  const {s,us,them}=scene(side,'sv3pt5-137');const p=them.active=core.makePokemonSlot('sv3pt5-3',1,'conversion');attack(s,side);const pick=core.legalActions(s,side).find(x=>x.choiceOption===2);assert.ok(pick);core.applyAction(s,side,pick);assert.equal(p.weaknessOverride,'Water');assert.equal(p.weaknessOverrideExpiresTurn,undefined);const water=core.makePokemonSlot('sv3pt5-7',1,'water');assert.equal(fx.attackDamageWithState(s,side,water,foe,p,30,data.cardById),60);fx.clearTemporaryEffects(s,p);assert.equal(p.weaknessOverride,undefined);
 });
 test(side+' Colorful Friends selects up to three different types and no duplicate type',()=>{
  const {s,us}=scene(side,'sv3pt5-133');us.hand=[];us.deck=[1,2,4,7,158].map(n=>({uid:'search'+n,cardId:'sv3pt5-'+n}));attack(s,side);for(const n of [1,4,7]){const legal=core.legalActions(s,side);if(n!==1)assert.ok(!legal.some(a=>a.choiceCardId==='sv3pt5-2'));assert.ok(!legal.some(a=>a.choiceCardId==='sv3pt5-158'));const pick=legal.find(a=>a.choiceCardId==='sv3pt5-'+n);assert.ok(pick,JSON.stringify(legal));core.applyAction(s,side,pick);}assert.deepEqual(us.hand.filter(r=>r.uid.startsWith('search')).map(r=>r.cardId),['sv3pt5-1','sv3pt5-4','sv3pt5-7']);assert.notEqual(s.phase,'effectChoice');
 });
 test(side+' Spirit Return on hand evolution chooses opposing Supporter only, and is optional',()=>{
  for(const skip of [false,true]){const {s,us,them}=scene(side,'sv3pt5-92');us.active.playedOnSideTurn=1;us.hand=[{uid:'haunter',cardId:'sv3pt5-93'}];them.hand=[];them.discard=[{uid:'sup',cardId:'sv3pt5-160'},{uid:'item',cardId:'sv3pt5-155'}];const ev=core.legalActions(s,side).find(a=>a.type==='evolve');assert.ok(ev);core.applyAction(s,side,ev);assert.equal(s.phase,'effectChoice');const legal=core.legalActions(s,side);assert.ok(!legal.some(a=>a.choiceDiscardIndex===1));const pick=legal.find(a=>skip?a.choiceSkip:a.choiceDiscardIndex===0);assert.ok(pick,JSON.stringify(legal));core.applyAction(s,side,pick);assert.equal(them.hand.some(r=>r.uid==='sup'),!skip);assert.equal(them.discard.some(r=>r.uid==='item'),true);}
 });
}

// Stage 11: direct deck placement, returning Pokémon, counter placement and immunity.
test('151 stage 11 enables five more prints',()=>{for(const n of [12,47,121,122,179])assert.ok(sv.cardById('sv3pt5-'+n).battleEnabled,n);assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length>=198,true);});
for(const side of ['player','opponent']){
 const foe=side==='player'?'opponent':'player';
 test(side+' Spread Filaments uses two flips, can place evolved Grass Pokémon, and respects capacity and optional stop',()=>{
  for(const mode of ['two','stop','full','tails']){const {s,us}=scene(side,'sv3pt5-47');us.bench=mode==='full'?us.bench:us.bench.slice(0,1);us.benchLimit=3;us.deck=[3,2,4].map(n=>({uid:'filament'+n,cardId:'sv3pt5-'+n}));s.rngState=mode==='tails'?0xffffffff:1;if(mode==='tails')us.bw9CoinTailsUntil=s.turnNumber;attack(s,side);const coins=s.log.findLast(x=>x.type==='coin');assert.equal(coins.heads,mode==='tails'?0:2);if(mode==='full'||mode==='tails'){assert.notEqual(s.phase,'effectChoice');assert.equal(us.deck.some(x=>x.uid==='filament3'),true);continue;}const choices=core.legalActions(s,side);assert.ok(!choices.some(x=>x.choiceCardId==='sv3pt5-4'));const pick=choices.find(x=>mode==='stop'?x.choiceSkip:x.choiceCardId==='sv3pt5-3');assert.ok(pick,JSON.stringify(choices));core.applyAction(s,side,pick);if(mode==='two'){assert.ok(us.bench.some(x=>x.cardId==='sv3pt5-3'&&x.stack.length===1));const next=core.legalActions(s,side).find(x=>x.choiceCardId==='sv3pt5-2');assert.ok(next);core.applyAction(s,side,next);assert.equal(us.bench.length,3);}else assert.equal(us.bench.length,1);assert.notEqual(s.phase,'effectChoice');}
 });
 test(side+' Bye-Bye Flight returns both entire stacks and attachments without awarding Prizes; no Bench does nothing',()=>{
  for(const empty of [true,false]){const {s,us,them}=scene(side,'sv3pt5-12');const own=us.active;own.stack=['sv3pt5-10','sv3pt5-11','sv3pt5-12'];own.energy={Grass:2};own.tool={uid:'own-tool',cardId:'sv3pt5-163'};them.bench=empty?[]:[{...core.makePokemonSlot('sv3pt5-6',1,'bye-target'),benchSlot:0}];if(!empty){them.bench[0].stack=['sv3pt5-4','sv3pt5-5','sv3pt5-6'];them.bench[0].specialEnergy=[{uid:'bye-energy',cardId:'base1-96'}];}const prizes=[us.prizes.length,them.prizes.length];attack(s,side,1);if(empty){assert.equal(us.active,own);assert.notEqual(s.phase,'effectChoice');continue;}const pick=core.legalActions(s,side).find(x=>x.choiceTarget==='bench');assert.ok(pick);core.applyAction(s,side,pick);assert.equal(them.bench.length,0);assert.ok(us.deck.some(x=>x.uid==='own-tool'));assert.ok(us.deck.some(x=>x.cardId==='sv3pt5-11'));assert.ok(them.deck.some(x=>x.uid==='bye-energy'));assert.ok(them.deck.some(x=>x.cardId==='sv3pt5-5'));assert.ok(![us.active,...us.bench].includes(own));assert.deepEqual([us.prizes.length,them.prizes.length],prizes);}
 });
 test(side+' Psypower allocates counters repeatedly to the same target or different targets',()=>{
  const {s,them}=scene(side,'sv3pt5-179');const active=them.active=core.makePokemonSlot('sv3pt5-6',1,'mime-active'),bench=them.bench[0];attack(s,side);for(const target of ['active','bench','active']){const pick=core.legalActions(s,side).find(x=>x.choiceTarget===target&&(target==='active'||x.choiceBenchIndex===0));assert.ok(pick);core.applyAction(s,side,pick);}assert.equal(active.damage,20);assert.equal(bench.damage,10);assert.notEqual(s.phase,'effectChoice');
 });
 test(side+' Mimic Barrier blocks attack damage only when Energy amounts match; respects suppression and Double Colorless',()=>{
  const {s,us,them}=scene(side,'sv3pt5-4');const p=them.active=core.makePokemonSlot('sv3pt5-122',1,'mime');us.active.energy={Fire:2};p.specialEnergy=[{uid:'dce',cardId:'base1-96'}];assert.equal(fx.attackIsPrevented(s,foe,p,us.active,data.cardById)?.reason,'Mimic Barrier');assert.equal(fx.attackEffectsPrevented(s,foe,p,us.active,data.cardById),false);us.active.energy.Fire=1;assert.notEqual(fx.attackIsPrevented(s,foe,p,us.active,data.cardById)?.reason,'Mimic Barrier');us.active.energy.Fire=2;them.swsh10CologneTurn=s.turnNumber;assert.notEqual(fx.attackIsPrevented(s,foe,p,us.active,data.cardById)?.reason,'Mimic Barrier');
 });
 test(side+' Mysterious Comet discards source and attachments after placing counters and excludes protected Amber',()=>{
  for(const blocked of [false,true]){const {s,us,them}=scene(side,'sv3pt5-1');const source=us.bench[0]=Object.assign(core.makePokemonSlot('sv3pt5-121',1,'comet'),{benchSlot:0,stack:['sv3pt5-120','sv3pt5-121'],energy:{Psychic:1},specialEnergy:[{uid:'comet-energy',cardId:'base1-96'}]});them.active=core.makePokemonSlot(blocked?'sv3pt5-154':'sv3pt5-6',1,'comet-target');const target=them.active;const before=them.prizes.length;const a=core.legalActions(s,side).find(x=>x.type==='ability'&&x.target==='bench'&&x.benchIndex===0);assert.ok(a,JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,a);const pick=core.legalActions(s,side).find(x=>x.choiceTarget==='active');if(blocked){assert.equal(pick,undefined);const otherTarget=core.legalActions(s,side).find(x=>x.choiceTarget==='bench');assert.ok(otherTarget);core.applyAction(s,side,otherTarget);assert.equal(target.damage,0);}else{assert.ok(pick);core.applyAction(s,side,pick);assert.equal(target.damage,20);}assert.equal(us.bench.includes(source),false);assert.equal(us.discard.some(x=>x.uid==='comet-energy'),true);assert.equal(them.prizes.length,before);}
 });
}

// Stage 12: Active replacement, Prize interception and attack-damage KO rescue.
test('151 stage 12 enables Ditto, Chansey and Raichu',()=>{for(const n of [26,113,132])assert.ok(sv.cardById('sv3pt5-'+n).battleEnabled);assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length>=201,true);});
for(const side of ['player','opponent']){
 test(side+' Transformative Start is first-turn Active-only and replaces Ditto with a non-Ditto Basic, discarding attachments',()=>{
  for(const mode of ['replace','skip','later','bench']){const {s,us,them}=scene(side,'sv3pt5-132');const ditto=us.active;us.turnCount=mode==='later'?2:1;s.turnNumber=side==='player'?1:2;ditto.energy={Lightning:1};ditto.tool={uid:'ditto-tool',cardId:'sv3pt5-163'};us.deck=[132,2,4].map(n=>({uid:'ditto-search'+n,cardId:'sv3pt5-'+n}));if(mode==='bench'){[us.active,us.bench[0]]=[us.bench[0],ditto];ditto.benchSlot=0;us.active.benchSlot=null;}
  const ability=core.legalActions(s,side).find(a=>a.type==='ability'&&a.target===(mode==='bench'?'bench':'active'));if(mode==='later'||mode==='bench'){assert.equal(ability,undefined);continue;}assert.ok(ability);core.applyAction(s,side,ability);const actions=core.legalActions(s,side);assert.ok(!actions.some(a=>['sv3pt5-132','sv3pt5-2'].includes(a.choiceCardId)));const pick=actions.find(a=>mode==='skip'?a.choiceSkip:a.choiceCardId==='sv3pt5-4');assert.ok(pick);core.applyAction(s,side,pick);if(mode==='skip'){assert.equal(us.active,ditto);continue;}assert.equal(us.active.cardId,'sv3pt5-4');assert.equal(us.active.uid,'ditto-search4');assert.deepEqual(us.active.energy,{});assert.ok(us.discard.some(x=>x.uid==='ditto-tool'));assert.equal(us.energyDiscard.Lightning,1);assert.equal(us.active.playedOnSideTurn,1);}
 });
 test(side+' Lucky Bonus triggers only on a face-down Prize, optional Bench and heads awards one more',()=>{
  for(const mode of ['heads','tails','decline','faceup','full']){const {s,us,them}=scene(side,'sv3pt5-4');us.bench=mode==='full'?us.bench:us.bench.slice(0,1);them.active=core.makePokemonSlot('sv3pt5-1',1,'victim');them.active.damage=50;us.prizes=[{uid:'chansey',cardId:'sv3pt5-113',faceUp:mode==='faceup'},{uid:'bonus',cardId:'sv3pt5-113',faceUp:mode==='faceup'}];s.rngState=1;attack(s,side,1);if(s.pendingChoice?.special==='chooseClassicPrize'){const pick=core.legalActions(s,side).find(a=>a.choicePrizeIndex===0);assert.ok(pick);core.applyAction(s,side,pick);}if(mode==='faceup'||mode==='full'){assert.notEqual(s.pendingChoice?.special,'sm7WishPrize');assert.ok(us.hand.some(r=>r.cardId==='sv3pt5-113'));continue;}assert.equal(s.pendingChoice?.special,'sm7WishPrize');const ref=s.sm7WishPrize.ref;s.rngState=mode==='tails'?0xffffffff:1;if(mode==='tails')us.bw9CoinTailsUntil=s.turnNumber;const pick=core.legalActions(s,side).find(a=>a.choiceOption===(mode==='decline'?0:1));assert.ok(pick);core.applyAction(s,side,pick);if(mode==='decline'){assert.ok(us.hand.some(r=>r.uid===ref.uid));continue;}assert.ok(us.bench.some(p=>p.uid===ref.uid));assert.equal(s.log.findLast(x=>x.reason==='Lucky Bonus').heads,mode==='heads');if(s.pendingChoice?.special==='chooseClassicPrize')core.applyAction(s,side,core.legalActions(s,side)[0]);assert.equal(us.prizesTaken,mode==='heads'?2:1);}
 });
 test(side+' Electrical Grounding moves just one Lightning Energy per Raichu before ally attack KO, optional and suppressed',()=>{
  const foe=side==='player'?'opponent':'player';for(const mode of ['move','skip','suppressed']){const {s,us,them}=scene(foe,'sv3pt5-6');them.active=core.makePokemonSlot('sv3pt5-1',1,'ground-victim');them.active.energy={Lightning:2,Fire:1};const r=them.bench[0]=Object.assign(core.makePokemonSlot('sv3pt5-26',1,'raichu'),{benchSlot:0});if(mode==='suppressed'){s.xy7HexManiacUntil=s.turnNumber;}attack(s,foe,1);if(mode==='suppressed'){assert.notEqual(s.pendingChoice?.special,'sv151ElectricalGrounding');assert.equal(r.energy.Lightning,undefined);continue;}assert.equal(s.pendingChoice?.special,'sv151ElectricalGrounding');const pick=core.legalActions(s,side).find(a=>mode==='skip'?a.choiceSkip:!a.choiceSkip);assert.ok(pick);core.applyAction(s,side,pick);assert.equal(r.energy.Lightning||0,mode==='move'?1:0);assert.equal(them.energyDiscard.Lightning,mode==='move'?1:2);}
 });
}

// Stage 13: next-turn coin restriction, both shared and legacy coin routes.
test('151 stage 13 enables both Psyduck prints',()=>{for(const n of [54,175])assert.ok(sv.cardById('sv3pt5-'+n).battleEnabled);assert.equal(sv.CARDS.filter(c=>c.battleEnabled).length,204);});
for(const side of ['player','opponent']){
 const foe=side==='player'?'opponent':'player';
 test(side+' Overthink marks next opposing turn, not the other player; shared flips advance RNG and override guaranteed heads',()=>{
  const {s,us,them}=scene(side,'sv3pt5-54');attack(s,side);assert.equal(s.activeSide,foe);assert.equal(them.sv151OverthinkTurn,them.turnCount);assert.ok(fx.overthinkForcesTails(s,foe));assert.equal(fx.overthinkForcesTails(s,side),false);
  let calls=0;them.forceFirstCoinHeadTurn=s.turnNumber;them.forceFirstCoinHeadUsed=false;const ctx={state:s,side:foe,foeSide:side,attacker:them.active,cardById:data.cardById,isAttack:true,random:()=>{calls++;return 0;}};assert.equal(fx.coin(ctx),false);assert.equal(fx.coin(ctx),false);assert.equal(calls,2);assert.equal(fx.coin({...ctx,side,foeSide:foe,attacker:us.active}),true);
  const next=core.legalActions(s,foe).find(a=>a.type==='endTurn');assert.ok(next);core.applyAction(s,foe,next);assert.equal(them.sv151OverthinkTurn,undefined);assert.equal(fx.overthinkForcesTails(s,foe),false);
 });
 test(side+' Overthink forces legacy confusion attack gate to tails even with heads seed',()=>{
  const {s,them}=scene(side,'sv3pt5-54');attack(s,side);them.active.conditions={confusion:true};s.rngState=1;const target=them.active;const a=core.legalActions(s,foe).find(a=>a.type==='attack');assert.ok(a);core.applyAction(s,foe,a);assert.ok(s.log.some(x=>x.type==='coin'&&x.side===foe&&x.status==='confusion'&&x.heads===false));assert.equal(target.damage,30);
 });
 test(side+' Overthink does not force Pokémon Checkup recovery flips',()=>{const {s,them}=scene(side,'sv3pt5-54');attack(s,side);them.active.conditions={sleep:true};s.rngState=1;const next=core.legalActions(s,foe).find(a=>a.type==='endTurn');assert.ok(next);core.applyAction(s,foe,next);assert.ok(s.log.some(x=>x.type==='coin'&&x.side===foe&&x.status==='sleep'&&x.heads===true));});
}

// Stage 14: Sand Screen only protects opposing Trainer recovery to deck.
test('151 Sandshrew enabled; only Alakazam ex remains gated',()=>{assert.ok(sv.cardById('sv3pt5-27').battleEnabled);assert.deepEqual(sv.coverage().disabled,['sv3pt5-65','sv3pt5-188','sv3pt5-201']);});
for(const side of ['player','opponent']){
 test(side+' Sand Screen blocks Pal Pad on Active and Bench, respects suppression',()=>{
  for(const mode of ['active','bench','suppressed','absent']){
   const {s,us,them}=scene(side,'sv3pt5-6');const sand=core.makePokemonSlot('sv3pt5-27',1,'sand');if(mode==='active'||mode==='suppressed')them.active=sand;else if(mode==='bench')them.bench[0]=Object.assign(sand,{benchSlot:0});if(mode==='suppressed')sand.sm10AbilityLockUntil=s.turnNumber;
   us.hand=[{uid:'pad',cardId:'sm5-132'}];us.discard=[{uid:'support',cardId:'sv3pt5-160'}];
   const a=core.legalActions(s,side).find(x=>x.type==='trainer'&&x.cardId==='sm5-132');if(a){core.applyAction(s,side,a);const pick=core.legalActions(s,side).find(x=>x.choiceCardId==='sv3pt5-160');if(pick)core.applyAction(s,side,pick);}
   assert.equal(us.deck.some(x=>x.uid==='support'),mode==='suppressed'||mode==='absent',mode);assert.equal(us.discard.some(x=>x.uid==='support'),mode==='active'||mode==='bench',mode);
  }
 });
 test(side+' Sand Screen filters mixed Team Yell recovery and preserves index',()=>{
  const {s,us,them}=scene(side,'sv3pt5-6');them.active=core.makePokemonSlot('sv3pt5-27',1,'sand');us.hand=[{uid:'cheer',cardId:'swsh9-149'}];us.discard=[{uid:'support',cardId:'sv3pt5-160'},{uid:'pokemon',cardId:'sv3pt5-1'}];trainer(s,side,'swsh9-149');
  const opts=core.legalActions(s,side);assert.ok(!opts.some(x=>x.choiceCardId==='sv3pt5-160'));const p=opts.find(x=>x.choiceCardId==='sv3pt5-1');assert.equal(p.choiceDiscardIndex,1);core.applyAction(s,side,p);assert.ok(us.deck.some(x=>x.uid==='pokemon'));assert.ok(us.discard.some(x=>x.uid==='support'));
 });
 test(side+' Sand Screen does not block attack recovery',()=>{
  const {s,us,them}=scene(side,'sv3pt5-6');them.active=core.makePokemonSlot('sv3pt5-27',1,'sand');us.discard=[{uid:'attack-recover',cardId:'sv3pt5-163'}];fx.applyEffect({type:'fossilRecycle'},{...core.effectContext(s,side,{choiceDiscardIndex:0}),isAttack:true,resolvingChoice:true});assert.equal(us.deck[0].uid,'attack-recover');
 });
 test(side+' Sand Screen protects Trainers during Trash Exchange but permits Pokémon',()=>{
  const {s,us,them}=scene(side,'sv3pt5-6');them.active=core.makePokemonSlot('sv3pt5-27',1,'sand');us.discard=[{uid:'protected',cardId:'sv3pt5-160'},{uid:'allowed',cardId:'sv3pt5-1'}];us.deck=[{uid:'old',cardId:'sv3pt5-4'}];const ctx={...core.effectContext(s,side),trainerRef:{uid:'trash',cardId:'gym1-126'},shuffle:()=>{}};fx.applyEffect({type:'gymRule',rule:'trashExchange'},ctx);assert.deepEqual(us.deck.map(x=>x.uid),['allowed']);assert.deepEqual(new Set(us.discard.map(x=>x.uid)),new Set(['protected','old']));
 });
}
for(const side of ['player','opponent']){
 test(side+' Sand Screen prevents recovery through all remaining audited Trainer families',()=>{
  for(const [id,refId] of [['base3-61','sv3pt5-160'],['bw2-96','sv3pt5-160'],['hgss2-76','sv3pt5-160'],['sv1-182','sv3pt5-160'],['sm9-139','sm8-172'],['sm10-181','sv3pt5-160'],['sm12-195','sv3pt5-163'],['swsh9-148','sv3pt5-163'],['swsh10-138','sv3pt5-160']]){
   const {s,us,them}=scene(side,'sv3pt5-6');them.active=core.makePokemonSlot('sv3pt5-27',1,'sand');us.discard=[{uid:'blocked',cardId:refId},{uid:'allowed',cardId:'sv3pt5-1'}];us.hand=[{uid:'played',cardId:id}];const ctx={...core.effectContext(s,side,{trainerRef:us.hand[0]}),trainerRef:us.hand[0],random:()=>id==='hgss2-76'?.9:0};
   fx.applyEffect(data.cardById(id).effect,ctx);
   for(let n=0;n<12&&s.phase==='effectChoice';n++){
    const opts=core.legalActions(s,s.choiceSide||side);assert.ok(!opts.some(a=>a.choiceCardId===refId),id);const a=opts.find(x=>!x.choiceSkip);if(!a)break;core.applyAction(s,s.choiceSide||side,a);
   }
   assert.ok(us.discard.some(x=>x.uid==='blocked'),id);assert.ok(!us.deck.some(x=>x.uid==='blocked'),id);
  }
 });
}
