'use strict';
// v0.69.389: independent XY10 gameplay, coherence, and generated-deck audit.
const {test}=require('node:test'),assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const owned=classic.CARDS.filter(c=>c.setId==='xy10'&&c.battleEnabled&&c.deckEligible!==false)
  .map(c=>({gameplayId:c.id,quantity:4}));
function certify(result,label){
 assert.ok(result.ok,`${label}: ${result.errors||result.error}`);
 assert.equal(result.cards.length,30,`${label}: 30 physical cards`);
 assert.ok(decks.validateDraft(result.cards,owned,{requireFull:true}).ok,`${label}: draft legal`);
 const cards=result.cards.map(classic.cardById);
 assert.deepEqual(synergy.report(cards,result.energyTypes||[],'any').dead,[],`${label}: unsupported support`);
 const has=n=>cards.some(c=>c?.id===n);
 const pokemon=cards.filter(c=>c?.kind==='pokemon');
 if(has('xy10-108'))assert.ok(pokemon.some(c=>['xy10-54','xy10-54a'].includes(c.id)),`${label}: Power Memory must have Zygarde-EX`);
 if(has('xy10-99')||has('xy10-100'))assert.ok((result.energyTypes||[]).includes('Fairy'),`${label}: Fairy support requires Fairy Energy`);
 if(has('xy10-95'))assert.ok(pokemon.some(c=>['Stage 1','Stage 2'].includes(c.stage)&&pokemon.some(b=>b.name===c.evolvesFrom)),`${label}: Devolution Spray must have evolved line`);
 if(has('xy10-101'))assert.ok(['xy10-96','xy10-102','xy10-106'].some(has),`${label}: Fossil Kit requires a real Item to recover`);
 assert.ok(!has('xy10-104'),`${label}: unknown-opponent Mega Catcher must not be generic filler`);
 for(const id of ['xy10-94','xy10-95','xy10-97','xy10-98'])
  assert.ok(result.cards.filter(c=>c===id).length<=1,`${label}: situational ${id} must not be spammed`);
 if(has('xy10-115'))assert.ok((result.energyTypes||[]).includes('Fighting')&&pokemon.some(c=>c.types?.includes('Fighting')),`${label}: Strong Energy only for attacking Fighting Pokémon`);
 return cards;
}
test('Fates Collide 129 official prints, 147 attacks, 21 Abilities and 5 BREAK have no gated records',()=>{
 const xy=classic.CARDS.filter(c=>c.setId==='xy10');
 assert.equal(xy.length,129);assert.equal(xy.filter(c=>c.battleEnabled).length,129);
 assert.equal(xy.reduce((n,c)=>n+(c.kind==='pokemon'?c.attacks.length:c.id==='xy10-108'?c.attacks.length:0),0),147);
 assert.equal(xy.filter(c=>c.kind==='pokemon').flatMap(c=>c.abilities||[]).length,21);
 assert.equal(xy.filter(c=>c.breakEvolution).length,5);
});
test('Independent generator sweep keeps 30-card player and CPU archetypes useful, with special Energy incentives',()=>{
 for(const style of ['competitive','random'])for(const seed of [3,24,42,73,111,131,199]){
  const cards=certify(builder.buildDeck(owned,{sets:['xy10'],style,randomSeed:seed}),`player ${style}/${seed}`);
  assert.ok(cards.filter(c=>c?.kind==='pokemon').length>=8,'Keep a viable Pokémon core');
 }
 for(const type of ['Fire','Water','Fighting','Psychic','Fairy','Metal']){
  const result=cpu.generate({sets:['xy10'],type,seed:42});
  certify(result,`CPU ${type}`);
 }
 const fighting=builder.buildDeck(owned,{sets:['xy10'],style:'competitive',randomSeed:111});
 assert.equal(fighting.cards.filter(id=>id==='xy10-115').length,2,'Reserve actual Strong Energy with Fighting attacker');
});
test('Power Memory and Fairy-only Trainer validity are checked by shared synergy reporting too',()=>{
 const get=id=>classic.cardById(id);
 assert.equal(synergy.trainerScore(get('xy10-108'),synergy.context([get('xy10-64')],['Metal'])),-Infinity);
 assert.ok(Number.isFinite(synergy.trainerScore(get('xy10-108'),synergy.context([get('xy10-54')],['Fighting']))));
 for(const id of ['xy10-99','xy10-100']){
  assert.equal(synergy.trainerScore(get(id),synergy.context([get('xy10-71')],['Metal'])),-Infinity);
  assert.ok(Number.isFinite(synergy.trainerScore(get(id),synergy.context([get('xy10-71')],['Fairy']))));
 }
 assert.equal(synergy.trainerScore(get('xy10-95'),synergy.context([get('xy10-64')],['Metal'])),-Infinity);
 const report=synergy.report([get('xy10-64'),get('xy10-99'),get('xy10-108')],['Metal'],'any');
 assert.deepEqual(report.dead.sort(),['Fairy Drop','Power Memory'].sort());
});
function scene(){
 const slot=(uid,cardId,benchSlot=null)=>({uid,cardId,benchSlot,damage:0,energy:{},specialEnergy:[],conditions:{}});
 const make=(uid)=>({active:slot(uid,uid),bench:[],deck:[],discard:[],hand:[],energyDiscard:{},energySupply:[],prizes:[],benchLimit:3});
 const p=make('ally'),o=make('enemy');o.bench.push(slot('enemy-b','enemy',0));
 const state={format:'classic',turnNumber:7,phase:'battle',sides:{player:p,opponent:o},log:[]};
 const prompts=[];
 const ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,isAbility:true,cardById:()=>null,requestChoice:q=>prompts.push(q),random:()=>.4};
 return {p,o,state,prompts,ctx};
}
test('Kinesis is optional and resolves an actual player choice before targeted damage',()=>{
 const e={type:'xy10Final',rule:'kinesis'};
 const s=scene();effects.applyEffect(e,{...s.ctx,eventData:{fromHand:true}});
 assert.equal(s.o.active.damage,0,'No damage before choosing to use the Ability');
 assert.deepEqual(s.prompts[0].options,['Use Kinesis','Skip Kinesis']);
 effects.applyEffect(s.prompts[0].effect,{...s.ctx,resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(s.o.active.damage,0,'Declining Kinesis does not damage either Pokémon');
 const t=scene();effects.applyEffect(e,{...t.ctx,eventData:{fromHand:true}});
 effects.applyEffect(t.prompts[0].effect,{...t.ctx,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(t.o.active.damage,20,'Taking optional Ability deals 2 counters to Active');
 assert.equal(t.prompts[1].kind,'pokemon');
 effects.applyEffect(t.prompts[1].effect,{...t.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(t.o.bench[0].damage,30,'Chosen Bench takes exactly 3 counters');
});
test('Rotom Plasmagic never erases friendly damage counters when defender prevents attack effects',()=>{
 const s=scene();s.p.active.damage=40;s.p.bench=[{...s.p.active,uid:'ally-b',damage:20}];
 s.ctx.isAttack=true;s.ctx.preventedTargets=new Set([s.o.active.uid]);
 effects.applyEffect({type:'xy10Final',rule:'plasmagic'},s.ctx);
 assert.equal(s.p.active.damage,40);assert.equal(s.p.bench[0].damage,20);assert.equal(s.o.active.damage,0);
 s.ctx.preventedTargets=new Set();effects.applyEffect({type:'xy10Final',rule:'plasmagic'},s.ctx);
 assert.equal(s.p.active.damage,20);assert.equal(s.p.bench[0].damage,0);assert.equal(s.o.active.damage,40);
});

// Attacks with optional extra damage must offer a real user/CPU selection
// and apply matching post-attack costs, not just have a mapped DSL marker.
test('Moltres Flying Flare and Genesect Rapid Blaster offer usable damage and discard choices',()=>{
 const s=scene(),m=classic.cardById('xy10-9').attacks.find(a=>a.name==='Flying Flare');
 const g=classic.cardById('xy10-64').attacks.find(a=>a.name==='Rapid Blaster');
 s.p.active.energy={Metal:5};
 const flying=effects.choicesForEffect(m.effect,s.ctx);
 assert.deepEqual(flying.map(o=>o.effectSelection),['','boost']);
 assert.equal(effects.resolveAttack(m,{...s.ctx,action:flying[0]}).damage,80);
 const boost=effects.resolveAttack(m,{...s.ctx,action:flying[1]});
 assert.equal(boost.damage,120);
 effects.applyEffect(boost.pendingEffects[0],{...s.ctx,action:flying[1]});
 assert.equal(s.p.active.damage,20,'Flying Flare optional recoil is charged');
 const modes=effects.choicesForEffect(g.effect,s.ctx);
 assert.equal(modes.length,6,'Cannot discard more than five attached Metal Energy');
 assert.equal(effects.resolveAttack(g,{...s.ctx,action:modes.at(-1)}).damage,200);
 const spent=effects.resolveAttack(g,{...s.ctx,action:modes[2]});
 assert.equal(spent.damage,140);
 effects.applyEffect(spent.pendingEffects[0],{...s.ctx,action:modes[2]});
 assert.equal(s.p.active.energy.Metal,3,'Exactly two Metal Energy are discarded');
});
