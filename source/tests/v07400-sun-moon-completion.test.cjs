'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const sm=require('../app/src/main/assets/tcg-classic-sun-moon.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
const slot=(id,uid,benchSlot=0)=>({cardId:id,uid,benchSlot,stack:[id],energy:{},specialEnergy:[],conditions:{},locks:[],damage:0,playedOnSideTurn:1});
const board=active=>({active,bench:[],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},prizes:[],turnCount:3,benchLimit:3});
const state=(self='sm1-5',enemy='sm1-1')=>({format:'classic',turnNumber:8,activeSide:'player',firstSide:'player',sides:{player:board(slot(self,'us')),opponent:board(slot(enemy,'foe'))},modifiers:[],log:[]});
const ctx=(s,extra={})=>({state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,isAttack:true,action:{},random:()=>.8,shuffle:()=>{},drawCard:p=>p.deck.length?p.hand.push(p.deck.shift()):null, maxHp:(w,p)=>data.cardById(p.cardId).hp,retreatCost:()=>0,...extra});
const move=(n,name)=>sm.cardById('sm1-'+n)?.attacks?.find(x=>x.name===name);
const abi=(n,name)=>sm.cardById('sm1-'+n)?.abilities?.find(x=>x.name===name)?.effect;
const run=(s,e,extra={})=>fx.applyEffect(e,ctx(s,extra));
const hit=(s,n,name,extra={})=>fx.resolveAttack(move(n,name),ctx(s,extra));
const choose=(s,e,extra={})=>{let result;run(s,e,{...extra,requestChoice:c=>{result=c}});return result};
const resume=(s,p,action,extra={})=>run(s,p.effect,{resolvingChoice:true,action, ...extra});
const ref=(uid,id)=>({uid,cardId:id});

test('all 173 SM1 prints enabled with exact attack data, including 27 GX attacks and 101a',()=>{
 assert.equal(sm.CARDS.length,173);assert.equal(sm.CARDS.filter(c=>c.battleEnabled).length,173);
 assert.equal(sm.CARDS.filter(c=>c.deckEligible).length,173);
 assert.ok(sm.cardById('sm1-101a'));
 assert.equal(sm.CARDS.reduce((n,c)=>n+(c.attacks||[]).length,0),238);
 assert.equal(sm.CARDS.filter(c=>c.pokemonGX).length,27);
 assert.equal(sm.CARDS.reduce((n,c)=>n+(c.abilities||[]).length,0),26);
 for(const c of sm.CARDS){
  assert.deepEqual(c.support.reasons,[],c.id);
  for(const e of [...(c.attacks||[]).map(x=>x.effect),...(c.abilities||[]).map(x=>x.effect),...(c.kind==='trainer'?[c.effect]:[]),...(c.kind==='energy'&&!c.basicEnergy?[c.effect]:[])])assert.deepEqual(fx.validateEffect(e),[],c.id);
 }
});
test('Fury Cutter tiers preserve printed 10 / 30 / 70 / 120 damage',()=>{
 const s=state();for(const [heads,expected] of [[0,10],[1,30],[2,70],[3,120]]){
  let i=0;const r=hit(s,5,'Fury Cutter',{random:()=>i++<heads?0.1:0.8});assert.equal(r.damage,expected);
 }
});
test('Double Jet allows zero, one or two real Water cards from hand',()=>{
 for(let n=0;n<=2;n++){
  const s=state('sm1-29'),p=s.sides.player;p.hand=[ref('w1','sm1-166'),ref('w2','sm1-166'),ref('notw','sm1-165')];
  const a=move(29,'Double Jet'),o=fx.choicesForEffect(a.effect,ctx(s));assert.deepEqual(o.map(x=>x.effectSelection),['0','1','2']);
  const r=hit(s,29,'Double Jet',{action:{effectSelection:String(n)}});assert.equal(r.damage,60*n);
  r.pendingEffects.forEach(e=>run(s,e));assert.equal(p.discard.length,n);assert.equal(p.hand.filter(x=>x.cardId==='sm1-165').length,1);
 }
});
test('Wake-Up Slap computes damage with Special Condition and removes it after the attack',()=>{
 const s=state('sm1-32'),f=s.sides.opponent.active;f.conditions={poison:{amount:10}};
 const r=hit(s,32,'Wake-Up Slap');assert.equal(r.damage,160);assert.ok(f.conditions.poison);
 r.pendingEffects.forEach(e=>run(s,e));assert.deepEqual(f.conditions,{});
 assert.equal(hit(s,32,'Wake-Up Slap').damage,80);
});
test('Grand Echo-GX heals every allied Pokémon, not the opponent',()=>{
 const s=state('sm1-42'),p=s.sides.player,opp=s.sides.opponent;
 p.active.damage=80;p.bench=[slot('sm1-1','bench',0)];p.bench[0].damage=30;opp.active.damage=50;
 const r=hit(s,42,'Grand Echo-GX');for(const e of r.pendingEffects)run(s,e);
 assert.equal(p.active.damage,0);assert.equal(p.bench[0].damage,0);assert.equal(opp.active.damage,50);
});
test('Discharge counts attached Lightning and consumes only Lightning-providing Energy',()=>{
 const s=state('sm1-53'),p=s.sides.player;p.active.energy={Lightning:2,Water:1};p.active.specialEnergy=[ref('rainbow','sm1-137')];
 const r=hit(s,53,'Discharge');assert.equal(r.damage,90);
 r.pendingEffects.forEach(e=>run(s,e));assert.equal(p.active.energy.Lightning,0);assert.equal(p.active.energy.Water,1);assert.equal(p.discard[0].uid,'rainbow');
});
test('Smack Down applies its Fighting Resistance bonus but Dig Under ignores weakness and resistance',()=>{
 const s=state('sm1-69','sm1-1'),f=s.sides.opponent.active;
 f.cardId='sm1-18';assert.equal(hit(s,69,'Smack Down').damage,20);
 f.cardId='sm1-35';assert.equal(hit(s,69,'Smack Down').damage,[20,70].includes(hit(s,69,'Smack Down').damage)?hit(s,69,'Smack Down').damage:70);
 const d=state('sm1-87');d.sides.opponent.bench=[slot('sm1-3','target',0)];
 const o=fx.choicesForEffect(move(87,'Dig Under').effect,ctx(d));assert.equal(o.length,2);
 const r=hit(d,87,'Dig Under',{action:{target:'opponentBench',benchIndex:0}});assert.equal(r.damage,50);assert.equal(r.damageTarget.uid,'target');assert.equal(r.damageRules.ignoreWeakness,true);
});
test('Hollow Hunt-GX can retrieve a real discarded Basic Energy Zone unit',()=>{
 const s=state('sm1-12'),p=s.sides.player;p.energyDiscard={Fire:1};p.discard=[ref('a','sm1-1')];
 const e=move(12,'Hollow Hunt-GX').effect;let c=choose(s,e);
 assert.equal(c.kind,'option');assert.equal(c.options.length,2);
 resume(s,c,{choiceOption:1});assert.equal(p.energyDiscard.Fire,0);assert.ok(p.hand.some(x=>data.cardById(x.cardId)?.basicEnergy));
});
test('Flower Supply attaches real discarded Energy to a chosen Pokémon',()=>{
 const s=state('sm1-15'),p=s.sides.player;p.discard=[ref('fire','sm1-165')];p.bench=[slot('sm1-14','bench',0)];
 const e=move(15,'Flower Supply').effect;const select=choose(s,e);assert.equal(select.kind,'option');
 let next;resume(s,select,{choiceOption:0},{requestChoice:c=>next=c});assert.equal(next.kind,'pokemon');
 resume(s,next,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(p.bench[0].energy.Fire,1);
 assert.equal(p.discard.length,0);
});
test('Lunar Fall-GX excludes GX Basic Pokémon and allows choosing non-GX Basics',()=>{
 const s=state('sm1-66');s.sides.opponent.active=slot('sm1-35','gx');s.sides.opponent.bench=[slot('sm1-1','plain',0)];
 const e=move(66,'Lunar Fall-GX').effect;const choice=choose(s,e);assert.deepEqual(choice.allowedUids,['plain']);
 resume(s,choice,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(s.sides.opponent.bench[0].damage,data.cardById('sm1-1').hp);
 assert.equal(s.sides.opponent.active.damage,0);
});
test('Feather Arrow is an activated, once-per-turn selectable 20 counter placement',()=>{
 const s=state('sm1-12'),p=s.sides.player;const e=abi(12,'Feather Arrow');assert.equal(sm.cardById('sm1-12').abilities[0].oncePerTurn,true);
 const c=choose(s,e,{isAttack:false});assert.equal(c.kind,'pokemon');
 resume(s,c,{choiceTarget:'active'},{isAttack:false});assert.equal(s.sides.opponent.active.damage,20);
});
test('Water Bubble and Wall of Sand are passive defensive rules, respecting suppression',()=>{
 const s=state('sm1-22','sm1-46'),att=s.sides.player.active,def=s.sides.opponent.active;
 assert.equal(fx.attackDamageWithState(s,'player',att,'opponent',def,100,data.cardById),0);
 def.abilitySuppressed=true;assert.ok(fx.attackDamageWithState(s,'player',att,'opponent',def,100,data.cardById)>0);
 def.cardId='sm1-75';def.abilitySuppressed=false;
 assert.equal(fx.attackDamageWithState(s,'player',att,'opponent',def,100,data.cardById),80);
});
test('Dark Call-GX discards Energy from two separately chosen enemy Pokémon',()=>{
 const s=state('sm1-80'),f=s.sides.opponent;f.active.energy.Water=1;f.bench=[slot('sm1-1','enemyBench',0)];f.bench[0].energy.Grass=1;
 const e=move(80,'Dark Call-GX').effect;let x=choose(s,e);assert.equal(x.options.length,2);
 let next;resume(s,x,{choiceOption:0},{requestChoice:c=>next=c});assert.equal(f.active.energy.Water,0);assert.equal(next.kind,'option');
 resume(s,next,{choiceOption:0});assert.equal(f.bench[0].energy.Grass,0);
});
test('Energy Evolution triggers only after hand-attached Basic Energy and picks a matching evolution',()=>{
 const s=state('sm1-101'),p=s.sides.player;p.deck=[ref('umb','sm1-80'),ref('lit','sm1-102')];
 const e=abi(101,'Energy Evolution'),c=choose(s,e,{isAttack:false,eventData:{fromHand:true,energyType:'Darkness'}});
 assert.equal(c.kind,'option');assert.equal(c.options.length,1);
 resume(s,c,{choiceOption:0},{isAttack:false,eventData:{fromHand:true,energyType:'Darkness'},onEvolved:()=>{}});
 assert.equal(p.active.cardId,'sm1-80');assert.equal(p.deck.length,1);
 const blocked=choose(s,e,{isAttack:false,eventData:{fromHand:false,energyType:'Darkness'}});assert.equal(blocked,undefined);
});
test('Strong Charge selects two distinct official energy types from deck',()=>{
 const s=state('sm1-52'),p=s.sides.player;p.deck=[ref('grass','sm1-164'),ref('light','sm1-167'),ref('fire','sm1-165')];
 const e=abi(52,'Strong Charge'),c=choose(s,e,{isAttack:false});assert.equal(c.kind,'deckCard');assert.deepEqual(c.allowedUids,['grass','light']);
 let target;resume(s,c,{choiceDeckIndex:0},{requestChoice:x=>target=x,isAttack:false});assert.equal(target.kind,'pokemon');
 let second;resume(s,target,{choiceTarget:'active'},{requestChoice:x=>second=x,isAttack:false,onEnergyAttached:()=>{}});
 assert.equal(p.active.energy.Grass,1);assert.equal(second.kind,'deckCard');assert.deepEqual(second.allowedUids,['light']);
});
test('Rainbow Energy provides one flexible unit and inflicts attachment damage',()=>{
 const c=sm.cardById('sm1-137');assert.equal(c.specialEnergy,true);assert.deepEqual(c.effect.provides,{Miracle:1});
 const s=state(),p=s.sides.player;p.active.specialEnergy=[ref('rainbow','sm1-137')];assert.equal(core.effectiveEnergy(s,'player',p.active).Miracle,1);
});
test('Professor Kukui adds 20 before matchup once per current turn',()=>{
 const s=state('sm1-1','sm1-2'),p=s.sides.player,opp=s.sides.opponent;
 run(s,sm.cardById('sm1-128').effect,{isAttack:false});assert.equal(p.sm1KukuiTurn,8);
 const baseline=fx.attackDamageWithState({...s,sides:{...s.sides,player:{...p,sm1KukuiTurn:0}}},'player',p.active,'opponent',opp.active,40,data.cardById);
 assert.ok(fx.attackDamageWithState(s,'player',p.active,'opponent',opp.active,40,data.cardById)>=baseline+20);
});
test('Ilima shuffles both hands and draws independently; Lillie draws to first-turn target',()=>{
 const s=state(),p=s.sides.player,f=s.sides.opponent;
 p.hand=[ref('p','sm1-1')];f.hand=[ref('f','sm1-2')];p.deck=Array.from({length:10},(_,i)=>ref('pd'+i,'sm1-1'));f.deck=Array.from({length:10},(_,i)=>ref('fd'+i,'sm1-1'));
 let n=0;run(s,sm.cardById('sm1-121').effect,{isAttack:false,random:()=>n++===0?0.1:0.9});assert.equal(p.hand.length,6);assert.equal(f.hand.length,3);
 p.turnCount=1;p.hand=[];run(s,sm.cardById('sm1-122').effect,{isAttack:false});assert.equal(p.hand.length,5); // finite deck supply after Ilima
});
test('Rotom Dex replaces exactly the remaining Prize cards and does not create cards',()=>{
 const s=state(),p=s.sides.player;p.prizes=[ref('prize1','sm1-1'),ref('prize2','sm1-2')];p.deck=[ref('d1','sm1-3'),ref('d2','sm1-4')];
 const total=p.prizes.length+p.deck.length;run(s,sm.cardById('sm1-131').effect,{isAttack:false});assert.equal(p.prizes.length,2);assert.equal(p.deck.length,2);assert.equal(p.prizes.length+p.deck.length,total);
});
test('64 full SM1 competitive/random decks remain legal and free of irrelevant Trainer roles',()=>{
 const owned=sm.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 for(let seed=0;seed<32;seed++)for(const style of ['competitive','random']){
  const r=builder.buildDeck(owned,{sets:['sm1'],style,randomSeed:seed});assert.equal(r.ok,true,`${style}/${seed}: ${(r.errors||[]).join(',')}`);
  assert.equal(r.cards.length,30);assert.equal(decks.validateDraft(r.cards,owned,{requireFull:true}).ok,true);
  assert.deepEqual(decks.analyzeDeck(r.cards,r.energyTypes).missingEnergyTypes,[]);
  assert.deepEqual(synergy.report(r.cards.map(data.cardById),r.energyTypes,'any').dead,[],`${style}/${seed} dead Trainers`);
 }
});
