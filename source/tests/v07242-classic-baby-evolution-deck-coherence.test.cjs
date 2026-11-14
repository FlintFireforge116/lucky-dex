'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const rowsFor=sets=>data.CARDS.filter(c=>sets.includes(c.setId)&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const num=(built,name)=>built.cards.filter(id=>data.cardById(id)?.name===name).length;
function ready(built,rows){assert.equal(built.ok,true,built.errors?.join('; '));assert.equal(built.cards.length,30);assert.equal(decks.validateDraft(built.cards,rows,{requireFull:true}).ok,true);}

test('Secret Wonders Psychic Smoochum focus always includes actual Jynx card copies',()=>{
 const rows=rowsFor(['dp3']);const built=builder.buildDeck(rows,{sets:['dp3'],types:['Psychic'],style:'random',focusCardId:'dp3-67',randomSeed:125});
 ready(built,rows);
 assert.equal(num(built,'Smoochum'),4);assert.ok(num(built,'Jynx')>=2,JSON.stringify(built.cards));
 assert.ok(built.cards.includes('dp3-30'));assert.deepEqual(built.energyTypes,['Psychic']);
});

test('Random and competitive builds across Secret Wonders never select orphan Smoochum',()=>{
 const rows=rowsFor(['dp3']);
 for(const style of ['random','competitive'])for(let seed=1;seed<=55;seed++){
   const built=builder.buildDeck(rows,{sets:['dp3'],types:['Psychic'],style,randomSeed:seed});
   ready(built,rows);
   if(num(built,'Smoochum'))assert.ok(num(built,'Jynx')>0,`orphan Smoochum: ${style} seed ${seed}`);
 }
});

test('Baby print cannot be a focus or filler without its actual partner owned',()=>{
 const rows=rowsFor(['dp3']).filter(r=>data.cardById(r.gameplayId)?.name!=='Jynx');
 const missing=builder.buildDeck(rows,{sets:['dp3'],types:['Psychic'],focusCardId:'dp3-67',style:'random'});
 assert.equal(missing.ok,false);assert.match(missing.errors.join(' '),/Smoochum.*Jynx/);
 for(let seed=1;seed<=30;seed++){
  const built=builder.buildDeck(rows,{sets:['dp3'],types:['Psychic'],style:'random',randomSeed:seed});
  if(built.ok)assert.equal(num(built,'Smoochum'),0,`orphan Smoochum chosen at seed ${seed}`);
 }
});

test('Fill/repair of a saved Smoochum-only deck adds Jynx rather than preserving an orphan',()=>{
 const rows=rowsFor(['dp3']);const ownedBaby=['dp3-67','dp3-67','dp3-67','dp3-67'];
 const built=builder.buildDeck(rows,{sets:['dp3'],style:'random',types:['Psychic'],cards:ownedBaby,randomSeed:125});
 ready(built,rows);
 assert.ok(num(built,'Smoochum')>0);assert.ok(num(built,'Jynx')>0);
});

test('Fill/repair drops previously saved orphan Baby when matching evolution is unowned',()=>{
 const rows=rowsFor(['dp3']).filter(r=>data.cardById(r.gameplayId)?.name!=='Jynx');
 const built=builder.buildDeck(rows,{sets:['dp3'],style:'random',types:['Psychic'],cards:['dp3-67','dp3-67'],randomSeed:14});
 ready(built,rows);
 assert.equal(num(built,'Smoochum'),0);
});

test('Older Baby Evolution families are paired too, not only Secret Wonders Smoochum',()=>{
 const rows=rowsFor(['ex10','dp1','dp2']);
 for(const [set,baby,partner,energy] of [
   ['ex10','ex10-31','Jynx','Water'],
   ['dp1','dp1-43','Roselia','Grass'],
   ['dp2','dp2-88','Magmar','Fire']]){
   const built=builder.buildDeck(rows,{sets:[set],style:'random',types:[energy],focusCardId:baby,randomSeed:4});
   ready(built,rows);
   assert.ok(num(built,data.cardById(baby).name)>0);
   assert.ok(num(built,partner)>0,`${data.cardById(baby).name} was not paired with ${partner}`);
 }
});

test('CPU Secret Wonders Psychic decks share the same Baby partner requirements',()=>{
 const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
 let generated=0;
 for(let seed=1;seed<=16;seed++){
  const built=cpu.generate({sets:['dp3'],type:'Psychic',seed});
  if(!built.ok)continue;
  generated++;
  if(num(built,'Smoochum'))assert.ok(num(built,'Jynx')>0,`CPU orphaned Smoochum seed ${seed}`);
 }
 assert.ok(generated>=8,`Too few legal CPU Psychic decks: ${generated}`);
});
