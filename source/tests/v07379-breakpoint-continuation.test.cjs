'use strict';
// BREAKpoint continuation: assert concrete state transitions, not labels only.
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const releaseContract=require('../scripts/xy9_release_contract.json');
const script=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy9_verified as v;print(json.dumps({'a':v.ATK,'t':v.TRAINERS,'b':v.ABILITIES},default=str))`;
function scene(){
 const cards={basic:{id:'basic',name:'Basic',kind:'pokemon',stage:'Basic',hp:150,retreat:2,attacks:[],types:['Water']},ally:{id:'ally',name:'Ally',kind:'pokemon',stage:'Basic',hp:100,retreat:1,types:['Water'],attacks:[{name:'Round'}]},stage1:{id:'stage1',kind:'pokemon',stage:'Stage 1',hp:100,retreat:3,types:['Fire']},water:{id:'water',kind:'energy',basicEnergy:true,subtype:'Water',energyType:'Water'},fire:{id:'fire',kind:'energy',basicEnergy:true,subtype:'Fire',energyType:'Fire'},special:{id:'special',name:'Special Energy',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Water:1}}},stadium:{id:'stadium',kind:'trainer',trainerType:'Stadium'},xy9Garbo:{id:'xy9-57',name:'Garbodor',kind:'pokemon',stage:'Stage 1',abilities:[{name:'Garbotoxin',printedPowerType:'ability',type:'passive',effect:{type:'abilitySuppression',duration:'whileInPlay',scope:'both',condition:{type:'selfHasTool'}}}]},other:{id:'other',kind:'pokemon',stage:'Basic',abilities:[{name:'Abyssal Hand',printedPowerType:'ability',type:'activated',effect:{type:'drawToHandSize',size:5}}]},belt:{id:'xy9-99',kind:'trainer',trainerType:'Tool',effect:{type:'sequence',effects:[{type:'modifier',stat:'maxHp',amount:40,scope:'self',duration:'whileInPlay',filter:{stage:'Basic'}},{type:'modifier',stat:'attackDamage',amount:10,scope:'self',duration:'whileInPlay',filter:{stage:'Basic'}}]}}};
 cards['xy9-99']=cards.belt;cards['xy9-57']=cards.xy9Garbo;
 const slot=(id,uid,extra={})=>({uid,benchSlot:0,cardId:id,stack:[id],energy:{},specialEnergy:[],tool:null,damage:0,conditions:{},...extra});
 const p={active:slot('basic','a'),bench:[],hand:[],deck:[],discard:[],prizes:[],energySupply:[],energyDiscard:{},turnCount:2},o={active:slot('basic','b'),bench:[],hand:[],deck:[],discard:[],prizes:[],energySupply:[],energyDiscard:{},turnCount:2};
 const state={format:'classic',turnNumber:3,activeSide:'player',sides:{player:p,opponent:o},log:[]};const prompts=[];
 const ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:id=>cards[id]||null,random:()=>.1,drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r},shuffle:()=>{},onEnergyAttached:()=>{},requestChoice:q=>prompts.push(q),isAttack:true};
 return {cards,slot,p,o,state,ctx,prompts,apply:(e,a={},more={})=>fx.applyEffect(e,{...ctx,resolvingChoice:true,action:a,...more})};
}
const rule=n=>({type:'neoRule',rule:'xy9:'+n});
test('Round counts only Pokémon in play with the Round attack, not cards in hand',()=>{
 const s=scene();s.cards.basic.attacks=[{name:'Round'}];s.p.bench=[s.slot('ally','c')];s.p.hand=[{uid:'h',cardId:'ally'}];
 assert.equal(fx.resolveAttack({name:'Round',damage:0,effect:rule('round')},s.ctx).damage,20);
});
test('Aqua Turbo attaches exactly two finite Water Energy units to a chosen Bench Pokémon',()=>{
 const s=scene();s.p.bench=[s.slot('ally','c')];s.p.energySupply=['Water','Water','Fire'];
 fx.applyEffect(rule('aquaTurbo'),s.ctx);assert.equal(s.prompts.at(-1)?.kind,'pokemon');
 s.apply(s.prompts.pop().effect,{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(s.p.bench[0].energy.Water,2);assert.deepEqual(s.p.energySupply,['Fire']);assert.equal(s.p.active.energy.Water||0,0);
});
test('Shadow Stitching suppresses opposing modern Abilities until end of next turn',()=>{
 const s=scene();s.o.active=s.slot('other','o');fx.applyEffect(rule('shadowStitching'),s.ctx);
 assert.equal(fx.abilitiesSuppressed(s.state,'opponent',s.o.active,s.ctx.cardById),true);
 s.state.turnNumber=4;assert.equal(fx.abilitiesSuppressed(s.state,'opponent',s.o.active,s.ctx.cardById),true);
 s.state.turnNumber=5;assert.equal(fx.abilitiesSuppressed(s.state,'opponent',s.o.active,s.ctx.cardById),false);
});
test('Garbotoxin suppresses modern Abilities with a Tool and exempts itself',()=>{
 const s=scene();const g=s.slot('xy9-57','garbo',{tool:{uid:'t',cardId:'xy9-99'}});s.p.bench=[g];s.o.active=s.slot('other','other');
 assert.equal(fx.abilitiesSuppressed(s.state,'opponent',s.o.active,s.ctx.cardById),true);
 assert.equal(fx.abilitiesSuppressed(s.state,'player',g,s.ctx.cardById),false);
 g.tool=null;assert.equal(fx.abilitiesSuppressed(s.state,'opponent',s.o.active,s.ctx.cardById),false);
});
test('Giant Water Shuriken requires physical Water Energy in hand and targets chosen Pokémon',()=>{
 const s=scene();s.p.hand=[{uid:'e',cardId:'water'}];s.o.bench=[s.slot('ally','foeBench')];
 fx.applyEffect(rule('giantWaterShuriken'),s.ctx);assert.equal(s.prompts.pop().kind,'handCard');
 s.apply({...rule('giantWaterShuriken'),phase:'hand'},{choiceHandIndex:0});assert.equal(s.p.discard.length,1);
 assert.equal(s.prompts.pop().kind,'pokemon');s.apply({...rule('giantWaterShuriken'),phase:'target'},{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(s.o.bench[0].damage,60);assert.equal(s.o.active.damage,0);
});
test('Painful Sword doubles existing damage counters on each opponent Pokémon, not as normal damage',()=>{
 const s=scene();s.o.active.damage=30;s.o.bench=[s.slot('ally','ben',{damage:40})];fx.applyEffect(rule('painfulSword'),s.ctx);
 assert.equal(s.o.active.damage,60);assert.equal(s.o.bench[0].damage,80);
});
test('Never Enough discards the chosen hand card and then draws two real cards',()=>{
 const s=scene();s.p.hand=[{uid:'a',cardId:'basic'},{uid:'b',cardId:'ally'}];s.p.deck=[{uid:'c',cardId:'water'},{uid:'d',cardId:'fire'}];
 fx.applyEffect(rule('neverEnough'),s.ctx);assert.equal(s.prompts.pop().kind,'handCard');
 s.apply(rule('neverEnough'),{choiceHandIndex:1});assert.deepEqual(s.p.discard.map(x=>x.uid),['b']);assert.deepEqual(s.p.hand.map(x=>x.uid),['a','c','d']);
});
test('Turbo Assault can recover a chosen Basic Energy ledger unit to a chosen Bench Pokémon',()=>{
 const s=scene();s.p.energyDiscard={Water:1,Fire:1};s.p.bench=[s.slot('ally','c')];
 fx.applyEffect(rule('turboAssault'),s.ctx);assert.equal(s.prompts.pop().kind,'pokemon');
 s.apply({...rule('turboAssault'),phase:'target'},{choiceTarget:'bench',choiceBenchIndex:0});const q=s.prompts.pop();assert.equal(q.kind,'option');
 const i=q.effect.entries.findIndex(x=>x.type==='Water');s.apply(q.effect,{choiceOption:i});assert.equal(s.p.bench[0].energy.Water,1);assert.equal(s.p.energyDiscard.Water,0);
});
test('Spike Lash uses Retreat Cost per opposing Pokémon; does not damage own Bench',()=>{
 const s=scene();s.o.bench=[s.slot('stage1','b1')];
 const attack=fx.resolveAttack({name:'Spike Lash',damage:0,effect:rule('spikeLash')},s.ctx);
 assert.equal(attack.damage,20);assert.ok(attack.pendingEffects?.some(e=>e.rule==='xy9:spikeLash'));
 fx.applyEffect(rule('spikeLash'),s.ctx);assert.equal(s.o.bench[0].damage,30);
});
test('Mighty Wind selects real hand Energy then places it on the chosen Bench target',()=>{
 const s=scene();s.p.hand=[{uid:'w',cardId:'water'}];s.p.bench=[s.slot('ally','c')];fx.applyEffect(rule('mightyWind'),s.ctx);
 assert.equal(s.prompts.pop().kind,'handCard');s.apply({...rule('mightyWind'),phase:'hand'},{choiceHandIndex:0});assert.equal(s.prompts.pop().kind,'pokemon');
 s.apply({...rule('mightyWind'),phase:'target',energyUid:'w'},{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(s.p.hand.length,0);assert.equal(s.p.bench[0].energy.Water,1);
});
test('Act Cute lets the target owner put one chosen real hand card at bottom of deck',()=>{
 const s=scene();s.o.hand=[{uid:'first',cardId:'fire'},{uid:'second',cardId:'water'}];s.o.deck=[{uid:'old',cardId:'ally'}];
 fx.applyEffect(rule('actCute'),s.ctx);assert.equal(s.prompts.pop().side,'opponent');s.apply(rule('actCute'),{choiceHandIndex:1});
 assert.deepEqual(s.o.hand.map(x=>x.uid),['first']);assert.deepEqual(s.o.deck.map(x=>x.uid),['old','second']);
});
test('Delinquent discards Stadium only once and requires opponent to choose three hand cards',()=>{
 const s=scene();s.state.stadium={uid:'stad',cardId:'stadium',ownerSide:'player'};s.o.hand=[0,1,2,3].map(i=>({uid:'h'+i,cardId:'basic'}));
 fx.applyEffect(rule('delinquent'),s.ctx);assert.equal(s.state.stadium,null);assert.equal(s.p.discard[0].uid,'stad');
 assert.equal(s.prompts.pop().side,'opponent');for(const remaining of [3,2,1]){s.apply({...rule('delinquent'),phase:'discard',remaining},{choiceHandIndex:0});if(remaining>1)assert.equal(s.prompts.pop().side,'opponent');}
 assert.equal(s.o.hand.length,1);assert.deepEqual(s.o.discard.map(x=>x.uid),['h0','h1','h2']);
});
test('Fighting Fury Belt boosts only a Basic holder HP and attack damage',()=>{
 const s=scene();s.p.active.tool={uid:'belt',cardId:'xy9-99'};
 assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'maxHp',s.ctx.cardById),40);
 assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'attackDamage',s.ctx.cardById),10);
 s.p.active.cardId='stage1';assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'maxHp',s.ctx.cardById),0);
});
test('Max Potion heals chosen Bench Pokémon and discards Basic and physically attached Special Energy',()=>{
 const s=scene();s.p.bench=[s.slot('ally','c',{damage:50,energy:{Water:2},specialEnergy:[{uid:'sp',cardId:'special'}]})];
 fx.applyEffect(rule('maxPotion'),s.ctx);assert.equal(s.prompts.pop().kind,'pokemon');s.apply(rule('maxPotion'),{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(s.p.bench[0].damage,0);assert.deepEqual(s.p.bench[0].energy,{});assert.equal(s.p.energyDiscard.Water,2);
 assert.deepEqual(s.p.discard.map(x=>x.uid),['sp']);
});
test('Misty Determination discards a chosen card then lets player select one among top eight',()=>{
 const s=scene();s.p.hand=[{uid:'h',cardId:'basic'}];s.p.deck=[{uid:'a',cardId:'fire'},{uid:'b',cardId:'water'}];
 fx.applyEffect(rule('mistysDetermination'),s.ctx);assert.equal(s.prompts.pop().kind,'handCard');s.apply({...rule('mistysDetermination'),phase:'hand'},{choiceHandIndex:0});
 const q=s.prompts.pop();assert.equal(q.kind,'topDeckCard');fx.applyEffect(q.effect,{...s.ctx,resolvingChoice:true,action:{choiceDeckIndex:1}});
 assert.deepEqual(s.p.discard.map(x=>x.uid),['h']);assert.deepEqual(s.p.hand.map(x=>x.uid),['b']);
});
test('Purifying Fire heals only with actual Basic Fire Energy, not a Special Energy providing Fire',()=>{
 const s=scene();s.p.active.damage=60;s.p.active.specialEnergy=[{uid:'x',cardId:'special',provides:{Fire:1}}];
 fx.applyEffect(rule('purifyingFire'),s.ctx);assert.equal(s.p.active.damage,60);
 s.p.active.energy.Fire=1;fx.applyEffect(rule('purifyingFire'),s.ctx);assert.equal(s.p.active.damage,10);
});
const fs=require('node:fs');
const hasPinnedCatalogue=fs.existsSync(path.join(root,'data/classic/xy9-print-compact.json'));
test('Pinned GitHub catalogue must enable every fully implemented Stage 2 print and keep unfinished cards gated',
 {skip:!hasPinnedCatalogue&&process.env.GITHUB_ACTIONS!=='true'},()=>{
  const set=require('../app/src/main/assets/tcg-classic-breakpoint.js');
  assert.equal(set.CARDS.length,126);
  const nowFull=releaseContract.stage2Playable;
  for(const number of nowFull){const c=set.cardById('xy9-'+number);assert.ok(c,'Missing print '+number);
    assert.equal(c.battleEnabled,true,'Stage 2 mapped print must be FULL: '+number);
    assert.equal(c.support.status,'FULL','Stage 2 status mismatch: '+number);
    for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],'Invalid attack '+c.name+' / '+a.name);
    for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],'Invalid ability '+c.name+' / '+a.name);
    if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],'Invalid Trainer '+c.name);
  }
  const unfinished=releaseContract.expectedGated;
  for(const number of unfinished){const c=set.cardById('xy9-'+number);assert.ok(c);assert.equal(c.battleEnabled,false,'Incomplete print must remain gated: '+number);}
});
test('Moonlight Slash offers no-cost or real Water return choices and adds 20 only when returned',()=>{
 const s=scene();s.p.active.energy.Water=2;
 const attack={name:'Moonlight Slash',damage:60,effect:rule('moonlightSlash')};
 const opts=fx.choicesForEffect(attack.effect,s.ctx);assert.ok(opts.some(o=>o.effectSelection==='basicWater'));
 const plain=fx.resolveAttack(attack,s.ctx);assert.equal(plain.damage,60);
 const boost=fx.resolveAttack(attack,{...s.ctx,action:{effectSelection:'basicWater'}});assert.equal(boost.damage,80);
 assert.ok(boost.pendingEffects?.some(e=>e.rule==='xy9:moonlightSlashReturn'));
 fx.applyEffect({type:'neoRule',rule:'xy9:moonlightSlashReturn',selection:'basicWater'},s.ctx);
 assert.equal(s.p.active.energy.Water,1);assert.equal(s.p.hand.length,1);assert.ok(s.ctx.cardById(s.p.hand[0].cardId)==null||s.p.hand[0].zoneGenerated);
});
test('Aqua Turbo can attach the two selected physical Water cards when the Energy Zone is empty',()=>{
 const s=scene();s.p.bench=[s.slot('ally','chosen')];s.p.deck=[{uid:'u1',cardId:'water'},{uid:'u2',cardId:'water'}];
 fx.applyEffect(rule('aquaTurbo'),s.ctx);s.apply(s.prompts.pop().effect,{choiceTarget:'bench',choiceBenchIndex:0});
 for(let j=0;j<2;j++){const ask=s.prompts.pop();assert.equal(ask.kind,'deckCard');s.apply(ask.effect,{choiceDeckIndex:0});}
 assert.equal(s.p.bench[0].energy.Water,2);assert.equal(s.p.deck.length,0);
});
test('Turbo Assault moves the selected physical Special Energy ref, not a generated replacement',()=>{
 const s=scene();s.p.discard=[{uid:'actualSpecial',cardId:'special'}];s.p.bench=[s.slot('ally','recipient')];
 fx.applyEffect(rule('turboAssault'),s.ctx);s.apply(s.prompts.pop().effect,{choiceTarget:'bench',choiceBenchIndex:0});
 const q=s.prompts.pop();const index=q.effect.entries.findIndex(x=>x.uid==='actualSpecial');assert.ok(index>=0);
 s.apply(q.effect,{choiceOption:index});assert.equal(s.p.discard.length,0);
 assert.equal(s.p.bench[0].specialEnergy[0].uid,'actualSpecial');
});
test('Moonlight Slash can return a selected attached Special Water Energy without removing Basic Energy',()=>{
 const s=scene();s.p.active.specialEnergy=[{uid:'attached',cardId:'special',provides:{Water:1}}];s.p.active.energy.Water=1;
 const a={name:'Moonlight Slash',damage:60,effect:rule('moonlightSlash')},select='special:attached';
 const opts=fx.choicesForEffect(a.effect,s.ctx);assert.ok(opts.some(x=>x.effectSelection===select));
 const result=fx.resolveAttack(a,{...s.ctx,action:{effectSelection:select}});assert.equal(result.damage,80);
 fx.applyEffect({type:'neoRule',rule:'xy9:moonlightSlashReturn',selection:select},s.ctx);
 assert.equal(s.p.active.energy.Water,1);assert.equal(s.p.active.specialEnergy.length,0);
 assert.equal(s.p.hand[0].uid,'attached');
});
test('Delinquent without a Stadium does not discard any opposing hand cards',()=>{
 const s=scene();s.o.hand=[{uid:'x',cardId:'basic'},{uid:'y',cardId:'ally'}];
 fx.applyEffect(rule('delinquent'),s.ctx);assert.deepEqual(s.o.hand.map(x=>x.uid),['x','y']);assert.equal(s.prompts.length,0);
});
