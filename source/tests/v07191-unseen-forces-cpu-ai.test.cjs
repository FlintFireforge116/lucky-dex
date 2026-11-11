'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(A+'/tcgp-battle-core.js'),ai=require(A+'/tcgp-battle-ai.js'),data=require(A+'/tcg-classic-battle-data.js'),
  opp=require(A+'/tcg-classic-opponents.js'),ex10=require(A+'/tcg-classic-unseen-forces.js'),syn=require(A+'/tcg-deck-synergy.js');
const mk=(id,uid)=>core.makePokemonSlot(id,2,uid);
function state(seed=1){
 const d=opp.generate({sets:['ex10'],seed}),e=opp.generate({sets:['ex10'],seed:seed+701});
 assert.ok(d.ok&&e.ok,'legal opponent decks');
 const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:e.cards,playerEnergyTypes:d.energyTypes,opponentEnergyTypes:e.energyTypes,firstSide:'opponent',seed});
 s.phase='battle';s.activeSide='opponent';s.turnNumber=9;const cpu=s.sides.opponent;cpu.turnCount=5;cpu.active=mk('ex10-60','cpu-active');cpu.bench=[mk('ex10-71','cpu-bench')];cpu.hand=[];cpu.energyType='Lightning';cpu.energyAvailable=false;cpu.energyUsed=true;cpu.handEnergyUsed=false;cpu.supporterUsed=false;return s;
}
function applyAI(s,difficulty='Advanced',count=0){
 const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.activeSide;
 const action=ai.chooseAction(s,side,difficulty,count);assert.ok(action,`legal CPU action in ${s.phase}`);core.applyAction(s,side,action);return action;
}
test('EX10 metadata identifies usable Energy-recovery, search, healing and draw Trainers',()=>{
 for(const [id,role] of [['ex10-81','energy'],['ex10-86','draw'],['ex10-94','search'],['ex10-95','healing']]){
  assert.ok(ex10.cardById(id).battleEnabled,id);assert.ok(syn.metadata(data.cardById(id)).roles.includes(role),id+' needs '+role);
 }
 assert.equal(ex10.coverage().total,145);assert.ok(ex10.coverage().battleEnabled>=87);
});
test('CPU Energy Search takes real Energy from the Zone rather than selecting optional Skip',()=>{
 const s=state(),ss=s.sides.opponent;ss.hand=[{uid:'energy-search',cardId:'ex10-94'}];ss.energySupply=['Lightning','Grass','Fire'];ss.deck=[];
 const trainer=core.legalActions(s,'opponent').find(a=>a.type==='trainer'&&a.cardId==='ex10-94');assert.ok(trainer);core.applyAction(s,'opponent',trainer);
 assert.equal(s.phase,'effectChoice');const chosen=applyAI(s,'Beginner');assert.equal(chosen.choiceSkip,undefined);assert.equal(s.phase,'battle');
 assert.equal(ss.hand.some(ref=>data.cardById(ref.cardId)?.basicEnergy),true);assert.equal(ss.energySupply.length,2);
});
test('CPU attaches drawn Basic Energy from hand before attacking or ending turn',()=>{
 for(const level of ai.DIFFICULTIES){
  const s=state(33),ss=s.sides.opponent;ss.hand=[{uid:'hand-water',cardId:'ex1-109'}];
  // The shared physical Basic Energy catalogue must be used (and the source
  // is irrelevant to the once-per-turn hand attachment allowance).
  ss.hand=[{uid:'hand-lightning',cardId:'ex1-109'}];
  const start=core.legalActions(s,'opponent').filter(x=>x.type==='attachSpecial');assert.ok(start.length,level);
  let attached=false;
  for(let count=0;count<10&&s.activeSide==='opponent';count++){
   const action=applyAI(s,level,count);if(action.type==='attachSpecial'){attached=true;break;}
   if(s.phase==='effectChoice')while(s.phase==='effectChoice')applyAI(s,level,count+1);
  }
  assert.ok(attached,level+' failed to attach a physical Basic Energy from hand');assert.equal(ss.handEnergyUsed,true);
  assert.equal(ss.hand.some(r=>r.uid==='hand-lightning'),false);
 }
});
test('CPU does not waste Potion on fully healed Pokemon',()=>{
 const s=state(44),ss=s.sides.opponent;ss.hand=[{uid:'potion',cardId:'ex10-95'}];ss.energyAvailable=false;ss.energyUsed=true;
 const action=ai.chooseAction(s,'opponent','Advanced',0);
 assert.notEqual(action.type,'trainer');
});
test('Energy Recycle System recovers from Energy Discard through both stages without effect schema exception',()=>{
 const s=state(45),ss=s.sides.opponent;ss.energyDiscard={Fire:3};ss.hand=[{uid:'energy-recycle',cardId:'ex10-81'}];
 const trainer=core.legalActions(s,'opponent').find(a=>a.cardId==='ex10-81');assert.ok(trainer);core.applyAction(s,'opponent',trainer);
 assert.equal(s.phase,'effectChoice');
 let i=0;while(s.phase==='effectChoice'&&i++<8){const a=applyAI(s,'Intermediate',i);assert.notEqual(a.choiceSkip,true,'must not skip a useful Energy recovery');}
 assert.equal(s.phase,'battle','CPU should resolve recovery without a resume button');
 assert.equal(ss.energyDiscard.Fire,2);assert.ok(ss.hand.some(r=>data.cardById(r.cardId)?.basicEnergy));
});
test('Energy Recycle System three-to-deck mode keeps valid effect metadata through nested option choices',()=>{
 const s=state(46),ss=s.sides.opponent;ss.energyDiscard={Fire:3};ss.handEnergyUsed=true;ss.hand=[{uid:'energy-recycle',cardId:'ex10-81'}];
 const size=ss.deck.length;core.applyAction(s,'opponent',core.legalActions(s,'opponent').find(a=>a.cardId==='ex10-81'));
 let i=0;while(s.phase==='effectChoice'&&i++<9){const a=applyAI(s,'Intermediate',i);assert.notEqual(a.choiceSkip,true);}
 assert.equal(s.phase,'battle');assert.equal(ss.deck.length,size+3);assert.equal(ss.energyDiscard.Fire,0);
});
test('Short EX10 CPU turn simulations on all difficulty levels do not throw or strand a legal effect choice',()=>{
 for(const level of ai.DIFFICULTIES){
  for(const seed of [3,8]){
   const d=opp.generate({sets:['ex10'],seed}),e=opp.generate({sets:['ex10'],seed:seed+700});
   const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:e.cards,playerEnergyTypes:d.energyTypes,opponentEnergyTypes:e.energyTypes,firstSide:'opponent',seed});
   let n=0,choices=0;
   while(s.phase!=='finished'&&n<65){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.activeSide;const action=ai.chooseAction(s,side,level,n%35);assert.ok(action,level+' seed '+seed+' stranded at '+s.phase);if(action.type==='effectChoice')choices++;assert.doesNotThrow(()=>core.applyAction(s,side,action),level+' seed '+seed+' action '+JSON.stringify(action));n++;}
   assert.ok(n>=10,level+' seed '+seed+' too few turns');
  }
 }
});
test('CPU resolves EX10 optional healing onto the most damaged target instead of Skip',()=>{
 const s=state(55),ss=s.sides.opponent;ss.hand=[{uid:'potion',cardId:'ex10-95'}];ss.active.damage=20;ss.bench[0].damage=40;
 const trainer=core.legalActions(s,'opponent').find(a=>a.cardId==='ex10-95');core.applyAction(s,'opponent',trainer);
 assert.equal(s.phase,'effectChoice');const chosen=applyAI(s,'Beginner');assert.notEqual(chosen.choiceSkip,true);
 assert.equal(s.phase,'battle');assert.equal(ss.bench[0].damage,20,'Potion should heal the most damaged Pokemon');
});
test('Unown Q CPU takes three distinct Energy types instead of skipping the printed search',()=>{
 const effects=require(A+'/tcgp-battle-effects.js'),s=state(56),ss=s.sides.opponent;
 ss.active=mk('ex10-Q','cpu-q');ss.hand=[];ss.energySupply=['Fire','Water','Grass','Fire','Water','Grass'];
 effects.applyEffect({type:'neoRule',rule:'ex10:Q:0'},core.effectContext(s,'opponent',{},ss.active));
 let n=0;while(s.phase==='effectChoice'&&n++<5){const chosen=applyAI(s,'Intermediate',n);assert.notEqual(chosen.choiceSkip,true);}
 assert.equal(s.phase,'battle');assert.equal(new Set(ss.hand.map(ref=>data.cardById(ref.cardId)?.subtype)).size,3);
});
test('EX10 Lanturn/Onix recovery choices are consumed rather than silently skipped by CPU',()=>{
 const effects=require(A+'/tcgp-battle-effects.js');
 for(const [rule,cardId,type] of [['ex10:40:0','ex10-40','Lightning'],['ex10:65:0','ex10-65','Fire']]){
  const s=state(57),ss=s.sides.opponent;ss.active=mk(cardId,'recovery');ss.energyDiscard={[type]:1};ss.hand=[];
  const ctx=core.effectContext(s,'opponent',{},ss.active);effects.applyEffect({type:'neoRule',rule},ctx);
  assert.equal(s.phase,'effectChoice',rule);const picked=applyAI(s,'Intermediate');assert.notEqual(picked.choiceSkip,true,rule);assert.equal(s.phase,'battle');
  assert.equal(ss.energyDiscard[type],0,rule+' must consume discarded Energy');
  if(cardId==='ex10-40')assert.equal(ss.active.energy.Lightning,1);else assert.ok(ss.hand.some(x=>data.cardById(x.cardId)?.basicEnergy));
 }
});
test('Mary’s Request draws from deck and exhausts only the Supporter allowance',()=>{
 const s=state(58),ss=s.sides.opponent;ss.hand=[{uid:'mary',cardId:'ex10-86'}];const before=ss.deck.length;
 const trainer=core.legalActions(s,'opponent').find(x=>x.cardId==='ex10-86');assert.ok(trainer);core.applyAction(s,'opponent',trainer);
 assert.equal(ss.supporterUsed,true);assert.equal(ss.deck.length,Math.max(0,before-3));
 assert.equal(ss.handEnergyUsed,false,'Supporter is not a hand Energy attachment');
});
test('regression: the EX10 CPU continues through late-game Energy Recycle without a Resume-required exception',()=>{
 // Preserve the original long-match reproduction deck IDs. Re-generating
 // from seed 8 is not a stable fixture when deck-builder rules change: a new
 // Sunkern mirror can end on turn 19 without exercising late-game recovery.
 const seed=8;
 const playerCards=['ex10-51','ex10-35','ex10-51','ex10-35','ex10-51','ex10-35','ex10-51','ex10-53','ex10-36','ex10-53','ex10-36','ex10-46','ex10-46','ex10-94','ex10-89','ex10-81','ex10-86','ex10-87','ex10-84','ex10-94','ex10-94','ex10-94','ex10-89','ex10-89','ex10-89','ex10-81','ex10-81','ex10-81','ex10-86','ex10-86'];
 const enemyCards=['ex10-76','ex10-16','ex10-76','ex10-16','ex10-76','ex10-16','ex10-76','ex10-59','ex10-43','ex10-59','ex10-43','ex10-46','ex10-46','ex10-94','ex10-89','ex10-81','ex10-86','ex10-87','ex10-84','ex10-94','ex10-94','ex10-94','ex10-89','ex10-89','ex10-89','ex10-81','ex10-81','ex10-81','ex10-86','ex10-86'];
 const s=core.createBattle({format:'classic',playerDeck:playerCards,opponentDeck:enemyCards,playerEnergyTypes:['Grass'],opponentEnergyTypes:['Grass'],firstSide:'opponent',seed});
 let actions=0;while(s.phase!=='finished'&&actions<170){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.activeSide;const action=ai.chooseAction(s,side,'Intermediate',actions%100);assert.ok(action,'CPU should be able to continue');assert.doesNotThrow(()=>core.applyAction(s,side,action));actions++;}
 assert.ok(actions>75,'the original failure occurred after an extended turn sequence');
});
