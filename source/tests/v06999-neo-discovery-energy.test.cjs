'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const discovery=require(path.join(A,'tcg-classic-neo-discovery.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const decks=require(path.join(A,'tcg-classic-decks.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const full=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));

test('Neo Discovery has 75 numbered prints and reserves nonimplemented rule text',()=>{
 assert.equal(discovery.CARDS.length,75);
 assert.equal(new Set(discovery.CARDS.map(c=>c.id)).size,75);
 assert.equal(classic.SETS.at(-1).id,'neo2');
 assert.ok(discovery.CARDS.filter(c=>c.battleEnabled).length>=35);
 assert.ok(discovery.CARDS.some(c=>!c.battleEnabled));
 for(const card of discovery.CARDS)if(card.battleEnabled){
   assert.equal(card.support.status,'FULL',card.name);
   for(const a of card.attacks||[])assert.equal(a.unimplemented,false,card.name+' / '+a.name);
 }
 assert.equal(classic.cardById('neo2-12').name,'Tyranitar');
 assert.equal(classic.cardById('neo2-10').name,'Scizor');
 assert.equal(classic.cardById('neo2-13').name,'Umbreon');
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 assert.ok(html.indexOf('tcgp-battle-effects.js')<html.indexOf('tcg-classic-neo-discovery.js'));
 assert.ok(html.indexOf('tcg-classic-neo-discovery.js')<html.indexOf('tcg-classic-battle-data.js'));
});

test('Darkness and Metal are existing special Energy cards, never Basic Zone types',()=>{
 for(const [id,name] of [['neo1-104','Darkness Energy'],['neo1-19','Metal Energy']]){
  const card=classic.cardById(id);
  assert.equal(card.name,name);assert.equal(card.specialEnergy,true);assert.equal(card.basicEnergy,false);
  assert.equal(card.battleEnabled,true);
 }
 assert.equal(decks.ENERGY_TYPES.includes('Darkness'),false);
 assert.equal(decks.ENERGY_TYPES.includes('Metal'),false);
});

test('Neo Discovery-only automatic builds reserve owned Neo Genesis Energy for all flagship Darkness/Metal lines',()=>{
 for(const [id,type,energy] of [['neo2-12','Darkness','neo1-104'],['neo2-13','Darkness','neo1-104'],['neo2-10','Metal','neo1-19']]){
  const result=builder.buildDeck(full,{sets:['neo2'],style:'competitive',types:[type],focusCardId:id,randomSeed:42});
  assert.equal(result.ok,true,id+': '+result.errors);
  assert.equal(result.cards.length,30);
  assert.ok(result.cards.includes(id),id+' not present');
  assert.ok(result.cards.filter(c=>c===energy).length>=2,id+' lacks required Special Energy');
  assert.ok(result.cards.every(cid=>classic.cardById(cid).setId==='neo2'||cid===energy),id+' contains unrelated off-set cards');
  assert.ok(result.energyTypes.every(t=>decks.ENERGY_TYPES.includes(t)),id+' leaked non-Basic Energy to zone');
  assert.equal(decks.validateDraft(result.cards,full,{requireFull:true}).ok,true);
 }
});

test('Missing Darkness/Metal Energy never creates an illegal or unusable focused deck',()=>{
 const noEnergy=full.filter(r=>!['neo1-104','neo1-19'].includes(r.gameplayId));
 for(const [id,type] of [['neo2-12','Darkness'],['neo2-13','Darkness'],['neo2-10','Metal']]){
  const result=builder.buildDeck(noEnergy,{sets:['neo2'],style:'competitive',types:[type],focusCardId:id,randomSeed:42});
  assert.equal(result.ok,false,id+' should be blocked');
  assert.match(result.errors.join(' '),/Energy/);
 }
});

test('CPU can choose Darkness or Metal archetypes without generating non-Basic Zone Energy',()=>{
 assert.ok(opponents.TYPES.includes('Darkness')&&opponents.TYPES.includes('Metal'));
 for(const type of ['Darkness','Metal']){
  let success=0;
  for(let seed=1;seed<=20;seed++){
   const result=opponents.generate({sets:['neo2'],type,seed});
   assert.equal(result.ok,true,`${type} ${seed}: ${result.error}`);
   assert.equal(result.type,type);
   assert.ok(result.cards.some(id=>classic.cardById(id).types?.includes(type)));
   assert.ok(result.energyTypes.every(t=>decks.ENERGY_TYPES.includes(t)));
   assert.ok(result.cards.every(id=>classic.cardById(id).setId==='neo2'||['neo1-19','neo1-104'].includes(id)));
   assert.equal(classic.validateDeck(result.cards).ok,true);
   success++;
  }
  assert.equal(success,20);
 }
});

test('Expert Classic opponent can begin matches with Neo Discovery and real special Energy',()=>{
 for(const type of ['Darkness','Metal']){
  const recipe=opponents.generate({sets:['neo2'],type,seed:31});assert.equal(recipe.ok,true);
  const state=core.createBattle({format:'classic',playerDeck:recipe.cards,opponentDeck:recipe.cards,seed:12345,firstSide:'opponent',playerEnergyTypes:recipe.energyTypes,opponentEnergyTypes:recipe.energyTypes,manualPlayerSetup:false});
  for(let i=0;i<24;i++){
   const acting=state.phase==='effectChoice'?state.choiceSide:state.phase==='promote'?state.promotionSide:state.activeSide;
   if(state.phase==='finished'||acting!=='opponent')break;
   const action=ai.chooseAction(state,'opponent','Expert',i);
   assert.ok(action,`no action ${type} at ${i}`);
   assert.doesNotThrow(()=>core.applyAction(state,'opponent',action));
  }
 }
});
