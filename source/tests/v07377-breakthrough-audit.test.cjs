'use strict';
// Independent BREAKthrough audit: print-rule outcomes, inherited passives, and regressions.
const {test}=require('node:test'), assert=require('node:assert/strict');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
function slot(cardId,uid,stack=[cardId],other={}) {return {uid,cardId,stack,energy:{},specialEnergy:[],conditions:{},damage:0,...other};}
function harness(cards,playerActive,playerBench=[],foeActive='opponent'){
 const board=(active,bench=[])=>({active,bench,hand:[],discard:[],deck:[],prizes:[],energyDiscard:{},energySupply:[],turnCount:3,benchLimit:5});
 const a=playerActive,b=slot(foeActive,'foe');const state={format:'classic',turnNumber:3,activeSide:'player',sides:{player:board(a,playerBench),opponent:board(b)},log:[]};
 return {state,cardById:id=>cards[id]||null,a,b};
}
test('Florges BREAK retains original Florges Calming Aroma passive on the Bench',()=>{
 const cards={florges:{id:'florges',name:'Florges',stage:'Stage 2',types:['Fairy'],abilities:[{name:'Calming Aroma',type:'passive',effect:{type:'modifier',stat:'attackCostFairy',amount:-1,scope:'team',duration:'whileInPlay'}}]},
 'xy8-104':{id:'xy8-104',name:'Florges BREAK',stage:'BREAK',breakEvolution:true,types:['Fairy'],abilities:[{name:'Floral Breeze',type:'activated',effect:{type:'noop'}}]},
 attacker:{id:'attacker',name:'Sylveon',stage:'Stage 1',types:['Fairy'],attacks:[]},
 opponent:{id:'opponent',name:'Opponent',stage:'Basic',types:['Colorless']}};
 const f=slot('xy8-104','break',['florges','xy8-104']); const a=slot('attacker','active');
 const {state,cardById}=harness(cards,a,[f]);
 assert.equal(fx.modifierAmount(state,'player',a,'attackCostFairy',cardById),-1);
});
test('BREAK predecessor passives work without applying them twice, and still obey Ability suppression',()=>{
 const cards={pre:{id:'pre',stage:'Stage 1',abilities:[{name:'Inherit Damage Guard',type:'passive',effect:{type:'modifier',stat:'damageReduction',amount:30,scope:'team',duration:'whileInPlay'}}]},
 break:{id:'break',stage:'BREAK',breakEvolution:true,abilities:[]}, attacker:{id:'attacker',stage:'Basic',types:['Water']},opponent:{id:'opponent',stage:'Basic'}};
 const a=slot('attacker','active'),b=slot('break','bench',['pre','break']);const {state,cardById}=harness(cards,a,[b]);
 assert.equal(fx.modifierAmount(state,'player',a,'damageReduction',cardById),30);
 b.abilitySuppressed={duration:'whileInPlay'};
 assert.equal(fx.modifierAmount(state,'player',a,'damageReduction',cardById),0);
});
test('Parallel City replaces Sky Field: opponent chooses three Bench survivors, other player keeps five',()=>{
 const data=require('../app/src/main/assets/tcgp-battle-data.js'),core=require('../app/src/main/assets/tcgp-battle-core.js'),original=data.cardById;
 const cards={basic:{id:'basic',name:'Basic',kind:'pokemon',stage:'Basic',hp:100,types:['Grass'],retreat:1,battleEnabled:true},
  'xy6-89':{id:'xy6-89',name:'Sky Field',kind:'trainer',trainerType:'Stadium',effect:{type:'noop'},battleEnabled:true},
  'xy8-145':{id:'xy8-145',name:'Parallel City',kind:'trainer',trainerType:'Stadium',effect:{type:'neoRule',rule:'xy8:parallelCity'},battleEnabled:true}};
 data.cardById=id=>cards[id]||original(id);
 const bench=(prefix,n)=>Array.from({length:n},(_,i)=>slot('basic',prefix+i,['basic'],{benchSlot:i}));
 const board=(id,n)=>({active:slot('basic',id),bench:bench(id+'b',n),hand:[],deck:[],discard:[],prizes:[],turnCount:3,benchLimit:8});
 const s={format:'classic',phase:'battle',turnNumber:3,activeSide:'player',rngState:42,log:[],rules:{winMode:'prizes',benchSize:3},
  stadium:{uid:'sky',cardId:'xy6-89',ownerSide:'player'},xy6SkyFieldActive:true,xy6SkyFieldUid:'sky',xy6SkyFieldFiveAfter:true,xy6SkyFieldOwner:'player',
  sides:{player:board('p',6),opponent:board('o',6)}};
 s.sides.player.hand=[{uid:'pc',cardId:'xy8-145'}];
 try{
  let options=core.legalActions(s,'player').filter(x=>x.type==='trainer'&&x.cardId==='xy8-145');
  assert.equal(options.length,2);
  core.applyAction(s,'player',options.find(x=>x.effectSelection==='opponentBench'));
  assert.equal(s.stadium.xy8BenchSide,'opponent');
  assert.equal(s.sides.opponent.benchLimit,3);
  assert.equal(s.sides.player.benchLimit,5);
  for(let i=0;i<4;i++){
   assert.equal(s.pendingChoice?.special,'skyFieldBenchTrim',`overflow choice ${i}`);
   const who=s.choiceSide;
   assert.equal(who,i<3?'opponent':'player');
   const selections=core.legalActions(s,who);
   const choice=selections.find(x=>x.type==='effectChoice');assert.ok(choice);
   core.applyAction(s,who,choice);
  }
  assert.equal(s.sides.opponent.bench.length,3);
  assert.equal(s.sides.player.bench.length,5);
  assert.equal(s.pendingChoice,null);
  assert.equal(s.phase,'battle');
  assert.equal(s.log.filter(x=>x.type==='xy6SkyFieldBenchDiscard').length,4);
  assert.ok(!s.log.some(x=>x.type==='knockout'));
 }finally{data.cardById=original;}
});
