'use strict';
// BREAKpoint Stage 3: real choices / physical-card identities / conditional rules.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),path=require('node:path');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const contract=require('../scripts/xy9_release_contract.json');
const root=path.resolve(__dirname,'..');
const raw=spawnSync('python3',['-c',String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy9_verified as v;print(json.dumps({'attacks':list(v.ATK.values()),'abilities':[x['effect'] for x in v.ABILITIES.values()],'trainers':[x[1] for x in v.TRAINERS.values()]}))`,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(raw.status,0,raw.stderr);
const maps=JSON.parse(raw.stdout);
const rule=k=>({type:'neoRule',rule:'xy9:'+k});
function scene(){
 const cards={a:{id:'a',name:'Attacker',kind:'pokemon',stage:'Stage 1',hp:150,types:['Water'],retreat:1},
  b:{id:'b',name:'Defender',kind:'pokemon',stage:'Basic',hp:150,types:['Fire'],retreat:2},
  water:{id:'water',name:'Water Energy',kind:'energy',basicEnergy:true,subtype:'Water',energyType:'Water'},
  fire:{id:'fire',name:'Fire Energy',kind:'energy',basicEnergy:true,subtype:'Fire',energyType:'Fire'},
  dark:{id:'dark',name:'Dark Energy',kind:'energy',basicEnergy:true,subtype:'Darkness',energyType:'Darkness'},
  rainbow:{id:'rainbow',name:'Rainbow',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Water:1}}},
  'xy9-30':{id:'xy9-30',name:'Suicune',kind:'pokemon',stage:'Basic',hp:120,types:['Water']},
  'xy9-57':{id:'xy9-57',name:'Garbodor',kind:'pokemon',stage:'Stage 1',abilities:[{name:'Garbotoxin',type:'passive',effect:{type:'abilitySuppression',scope:'both',duration:'whileInPlay',condition:{type:'selfHasTool'}}}]},
  tool:{id:'tool',kind:'trainer',trainerType:'Tool'}};
 const slot=(cardId,uid,overrides={})=>({uid,benchSlot:0,cardId,stack:[cardId],energy:{},specialEnergy:[],damage:0,conditions:{},...overrides});
 const p={active:slot('a','atk'),bench:[],hand:[],deck:[],discard:[],prizes:[{uid:'pr1'}],energyDiscard:{},energySupply:[],turnCount:2};
 const o={active:slot('b','def'),bench:[],hand:[],deck:[],discard:[],prizes:[{uid:'pr2'}],energyDiscard:{},energySupply:[],turnCount:2};
 const state={format:'classic',phase:'battle',activeSide:'player',turnNumber:5,sides:{player:p,opponent:o},log:[]};
 const prompts=[];const ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:id=>cards[id]||null,requestChoice:x=>prompts.push(x),random:()=>.1,shuffle:()=>{},drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},onEnergyAttached:()=>{},isAttack:true};
 return {cards,slot,p,o,state,ctx,prompts,do:(e,action={})=>fx.applyEffect(e,{...ctx,resolvingChoice:true,action})};
}
test('All BREAKpoint Stage 3 mapping effects pass shared DSL validation',()=>{
 for(const effect of [...maps.attacks,...maps.abilities,...maps.trainers])assert.deepEqual(fx.validateEffect(effect),[],JSON.stringify(effect));
 assert.equal(contract.expectedPlayable,122);assert.equal(contract.expectedGated.length,4);
 for(const n of contract.stage3Playable)assert.ok(!contract.expectedGated.includes(n),'Newly enabled print stayed gated: '+n);
});
test('Kricketune Screech buffs the same Defending Pokémon only on the next attacking turn',()=>{
 const s=scene();fx.applyEffect(rule('screech'),s.ctx);
 assert.equal(s.o.active.xy9ScreechUntil,7);
 s.state.turnNumber=7;
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,30,s.ctx.cardById),90);
 s.state.turnNumber=8;
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,30,s.ctx.cardById),30);
});
test('Walk-Off Homer wins only with precisely one Prize remaining',()=>{
 const s=scene();fx.applyEffect(rule('walkOffHomer'),s.ctx);
 assert.equal(s.state.phase,'finished');assert.equal(s.state.winner,'player');
 const t=scene();t.p.prizes=[{uid:'p1'},{uid:'p2'}];fx.applyEffect(rule('walkOffHomer'),t.ctx);
 assert.equal(t.state.phase,'battle');assert.equal(t.state.winner,undefined);
});
test('Royal Flash requires heads, offers a real opposing Energy choice, then moves it to selected Bench',()=>{
 const s=scene();s.o.active.energy={Water:1};s.o.active.specialEnergy=[{uid:'realRainbow',cardId:'rainbow',provides:{Water:1}}];
 s.o.bench=[s.slot('b','bench',{benchSlot:0})];
 fx.applyEffect(rule('royalFlash'),s.ctx);
 assert.equal(s.prompts.pop().kind,'option');
 s.do({...rule('royalFlash'),phase:'energy',picks:[{type:'Water',label:'Basic Water Energy'},{uid:'realRainbow',label:'Rainbow'}]},{choiceOption:1});
 const q=s.prompts.pop();assert.equal(q.kind,'pokemon');
 s.do(q.effect,{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(s.o.active.specialEnergy.length,0);
 assert.equal(s.o.bench[0].specialEnergy[0].uid,'realRainbow');
 assert.equal(s.o.active.energy.Water,1);
});
test('Suicune Wind Charm protects both friendly Pokémon from effects, not damage, while Active',()=>{
 const s=scene();s.p.active.cardId='xy9-30';s.p.bench=[s.slot('a','ben')];
 assert.equal(fx.attackEffectsPrevented(s.state,'player',s.p.bench[0],s.o.active,s.ctx.cardById),true);
 assert.equal(fx.attackDamageWithState(s.state,'opponent',s.o.active,'player',s.p.bench[0],20,s.ctx.cardById),20);
 s.p.active.cardId='a';assert.equal(fx.attackEffectsPrevented(s.state,'player',s.p.bench[0],s.o.active,s.ctx.cardById),false);
});
test('Siphon Off attaches three actual discard Energy units and never takes from fresh supply',()=>{
 const s=scene();s.p.energyDiscard={Water:2};s.p.discard=[{uid:'actualRainbow',cardId:'rainbow'}];s.p.energySupply=['Fire'];
 fx.applyEffect(rule('siphonOff'),s.ctx);let q=s.prompts.pop();assert.equal(q.kind,'option');
 s.do(q.effect,{choiceOption:q.effect.picks.findIndex(p=>p.type==='Water')});q=s.prompts.pop();
 s.do(q.effect,{choiceOption:q.effect.picks.findIndex(p=>p.uid==='actualRainbow')});q=s.prompts.pop();
 s.do(q.effect,{choiceOption:q.effect.picks.findIndex(p=>p.type==='Water')});
 assert.equal(s.p.active.energy.Water,2);assert.equal(s.p.active.specialEnergy[0].uid,'actualRainbow');
 assert.equal(s.p.energyDiscard.Water,0);assert.deepEqual(s.p.energySupply,['Fire']);
});
test('Energy Present attaches at most two selected physical hand Energy cards to one chosen Bench target',()=>{
 const s=scene();s.p.bench=[s.slot('b','ben',{benchSlot:0})];s.p.hand=[{uid:'w',cardId:'water'},{uid:'r',cardId:'rainbow'},{uid:'x',cardId:'a'}];
 fx.applyEffect(rule('energyPresent'),s.ctx);let q=s.prompts.pop();assert.equal(q.kind,'pokemon');
 s.do(q.effect,{choiceTarget:'bench',choiceBenchIndex:0});q=s.prompts.pop();assert.equal(q.kind,'handCard');
 s.do(q.effect,{choiceHandIndex:0});q=s.prompts.pop();s.do(q.effect,{choiceHandIndex:0});
 assert.equal(s.p.bench[0].energy.Water,1);assert.equal(s.p.bench[0].specialEnergy[0].uid,'r');
 assert.deepEqual(s.p.hand.map(r=>r.uid),['x']);
});
test('Shiftry Roll Up flips three coins and makes choices for each discarded opposing hand card',()=>{
 const s=scene();s.o.hand=[{uid:'a',cardId:'water'},{uid:'b',cardId:'fire'},{uid:'c',cardId:'dark'},{uid:'d',cardId:'a'}];
 fx.applyEffect(rule('rollUp'),s.ctx);const log=s.state.log.find(e=>e.reason==='Roll Up');assert.equal(log.heads,3);
 for(let i=0;i<3;i++){const q=s.prompts.pop();assert.equal(q.kind,'handCard');s.do(q.effect,{choiceHandIndex:0});}
 assert.deepEqual(s.o.discard.map(x=>x.uid),['a','b','c']);assert.deepEqual(s.o.hand.map(x=>x.uid),['d']);
});
test("Psychic's Third Eye reveals opposing hand, discards selected own cards, then draws same count",()=>{
 const s=scene();s.o.hand=[{uid:'opp',cardId:'b'}];s.p.hand=[{uid:'h1',cardId:'a'},{uid:'h2',cardId:'water'}];
 s.p.deck=[{uid:'d1',cardId:'fire'},{uid:'d2',cardId:'dark'},{uid:'d3',cardId:'b'}];
 fx.applyEffect(rule('psychicsThirdEye'),s.ctx);assert.deepEqual(s.state.log.find(l=>l.type==='revealHand').cards,['b']);
 let q=s.prompts.pop();s.do(q.effect,{choiceHandIndex:0});q=s.prompts.pop();s.do(q.effect,{choiceHandIndex:0});
 assert.equal(s.prompts.length,0,'Drawing should start automatically once no cards remain to discard');
 assert.deepEqual(s.p.discard.map(x=>x.uid),['h1','h2']);assert.deepEqual(s.p.hand.map(x=>x.uid),['d1','d2']);
});
test('All-Night Party is available only for a Sleeping Active and removes Sleep while healing 30',()=>{
 const s=scene();s.p.active.conditions={sleep:true};s.p.active.damage=60;
 assert.deepEqual(fx.choicesForEffect(rule('allNightParty'),s.ctx),[{}]);
 fx.applyEffect(rule('allNightParty'),s.ctx);assert.equal(s.p.active.damage,30);
 assert.equal(s.p.active.conditions.sleep,undefined);
 assert.deepEqual(fx.choicesForEffect(rule('allNightParty'),s.ctx),[]);
});
test('Reverse Valley orientation applies +10 Darkness attacks or -10 Metal received to the chosen player only',()=>{
 const s=scene();s.cards.darkmon={id:'darkmon',name:'Dark Mon',types:['Darkness'],kind:'pokemon',stage:'Basic',hp:100};
 s.cards.metalmon={id:'metalmon',name:'Metal Mon',types:['Metal'],kind:'pokemon',stage:'Basic',hp:100};
 s.state.stadium={uid:'realStadium',cardId:'xy9-110',xy9DownSide:'player',ownerSide:'opponent'};
 s.p.active.cardId='darkmon';
 assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'attackDamage',s.ctx.cardById),10);
 s.p.active.cardId='metalmon';
 assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'damageReduction',s.ctx.cardById),10);
 assert.equal(fx.modifierAmount(s.state,'opponent',s.o.active,'damageReduction',s.ctx.cardById),0);
 s.state.stadium.xy9DownSide='opponent';
 assert.equal(fx.modifierAmount(s.state,'player',s.p.active,'damageReduction',s.ctx.cardById),0);
});
test('Zebstrika Crashing Bolt sees Fighting Resistance; Zap Zone bypasses attack effects for Lightning allies',()=>{
 const s=scene();s.cards.b.resistance='Fighting';
 const atk={name:'Crashing Bolt',damage:50,effect:rule('crashingBolt')};
 assert.equal(fx.resolveAttack(atk,s.ctx).damage,110);
 s.cards.a.types=['Lightning'];s.cards['xy9-49']={id:'xy9-49',name:'Zebstrika',stage:'Stage 1',types:['Lightning']};
 s.p.bench=[s.slot('xy9-49','zeb',{benchSlot:0})];
 assert.equal(fx.resolveAttack({name:'Zap attack',damage:30,effect:{type:'noop'}},s.ctx).damageRules.ignoreEffects,true);
 s.p.bench=[];
 assert.equal(fx.resolveAttack({name:'Zap attack',damage:30,effect:{type:'noop'}},s.ctx).damageRules.ignoreEffects,undefined);
});
test('Bursting Balloon reacts before knockout and the exact attached Tool expires at opponent turn end',()=>{
 const s=scene();const ref={uid:'balloon-uid',cardId:'xy9-97'};
 s.p.active.tool=ref;
 const effect={type:'sequence',effects:[
  {type:'triggeredEffect',event:'damagedByAttack',activeOnly:true,opponentAttackOnly:true,effect:rule('burstingBalloonCounter')},
  {type:'triggeredEffect',event:'endTurn',turn:'opponent',effect:rule('burstingBalloonExpire')} ]};
 const ctx={...s.ctx,sourceTool:ref,isAttack:false,eventData:{damage:90,attacker:s.o.active,source:{side:'opponent',attack:true}}};
 fx.applyPersistentEvent(effect,'damagedByAttack',ctx);
 assert.equal(s.o.active.damage,60);assert.equal(s.p.active.tool.uid,'balloon-uid');
 s.state.activeSide='opponent';
 fx.applyPersistentEvent(effect,'endTurn',ctx);
 assert.equal(s.p.active.tool,null);assert.deepEqual(s.p.discard.map(r=>r.uid),['balloon-uid']);
});
