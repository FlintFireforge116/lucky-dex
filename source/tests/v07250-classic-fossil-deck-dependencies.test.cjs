'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const rowsFor=sets=>data.CARDS.filter(c=>sets.includes(c.setId)&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const name=c=>String(typeof c==='string'?c:c?.name||'').replace(/\s*δ\s*$/u,'').trim();
const isFossil=c=>c?.kind==='trainer'&&c.effect?.type==='playFossil'&&/(?:Fossil|Old Amber)$/i.test(name(c));
const isSupport=c=>c?.kind==='trainer'&&['Fossil Excavator','Fossil Egg','Holon Fossil'].includes(name(c));
function assertCoherent(built,rows,tag){
 assert.equal(built.ok,true,`${tag}: ${built.errors?.join('; ')}`);
 assert.equal(decks.validateDraft(built.cards,rows,{requireFull:true}).ok,true,tag);
 const cards=built.cards.map(data.cardById);
 for(const fossil of cards.filter(isFossil)){
  assert.ok(cards.some(c=>c?.kind==='pokemon'&&name(c.evolvesFrom)===name(fossil)),`${tag}: ${fossil.id} with no directly matching evolution`);
 }
 for(const support of cards.filter(isSupport)){
  assert.ok(cards.some(c=>c?.kind==='pokemon'&&c.evolvesFrom&&data.CARDS.some(f=>isFossil(f)&&name(f.name)===name(c.evolvesFrom))),`${tag}: orphan ${support.id}`);
 }
}
test('Majestic Dawn random/competitive 30-card builds never include orphan Old Amber, Dome or Helix Fossils',()=>{
 const rows=rowsFor(['dp5']);
 for(const style of ['random','competitive'])for(let seed=1;seed<=25;seed++){
  const opts={sets:['dp5'],style,randomSeed:seed};
  const result=builder.buildDeck(rows,opts);assertCoherent(result,rows,`${style}/${seed}`);
 }
});
test('Majestic Dawn focuses on genuine Fossil evolutions when user selects a Fossil',()=>{
 const rows=rowsFor(['dp5']);
 for(const [id,evolution] of [['dp5-84','Aerodactyl'],['dp5-89','Kabuto'],['dp5-91','Omanyte']]){
  const built=builder.buildDeck(rows,{sets:['dp5'],style:'competitive',focusCardId:id});
  assertCoherent(built,rows,id);
  assert.ok(built.cards.includes(id),`${id} missing`);
  assert.ok(built.cards.some(cid=>name(data.cardById(cid))===evolution),`${id} without ${evolution}`);
 }
});
test('Cross-set Fossil focus keeps the exact selected print and its matching evolutionary chain',()=>{
 const sets=['dp5','ex12'],rows=rowsFor(sets);
 for(const id of ['ex12-79','dp5-89']){
  const built=builder.buildDeck(rows,{sets,style:'competitive',focusCardId:id});
  assertCoherent(built,rows,id);
  assert.ok(built.cards.includes(id),`selected print ${id} was replaced`);
 }
 const selectedKabuto=builder.buildDeck(rows,{sets,style:'competitive',focusCardId:'dp5-67'});
 assertCoherent(selectedKabuto,rows,'dp5 Kabuto in mixed sets');
 assert.ok(selectedKabuto.cards.includes('dp5-89'),'selected Kabuto must get Dome Fossil');
});
test('Missing fossil evolution prevents focusing a Fossil and excludes orphaned saved Fossils in Fill',()=>{
 const rows=rowsFor(['dp5']).filter(r=>!['dp5-15','dp5-67','dp5-69','dp5-6','dp5-26'].includes(r.gameplayId));
 for(const id of ['dp5-84','dp5-89','dp5-91']){
  const built=builder.buildDeck(rows,{sets:['dp5'],focusCardId:id});
  assert.equal(built.ok,false,id);assert.match(built.errors?.[0]||'',/Fossil|Amber|evolve|evolution/i);
 }
 const built=builder.buildDeck(rows,{sets:['dp5'],cards:['dp5-84','dp5-89','dp5-91','dp5-82'],style:'competitive'});
 assertCoherent(built,rows,'repair');
 for(const id of ['dp5-84','dp5-89','dp5-91','dp5-82'])assert.ok(!built.cards.includes(id),`saved orphan ${id}`);
});
test('Fossil evolution in a deck does not legitimise a different type of Fossil',()=>{
 const rows=rowsFor(['dp5']);
 const built=builder.buildDeck(rows,{sets:['dp5'],focusCardId:'dp5-67',style:'competitive',cards:['dp5-84','dp5-91']});
 assertCoherent(built,rows,'Kabuto focus');
 assert.ok(built.cards.includes('dp5-89')); // Dome Fossil for Kabuto
 assert.ok(!built.cards.includes('dp5-84')||built.cards.includes('dp5-15'));
 assert.ok(!built.cards.includes('dp5-91')||built.cards.includes('dp5-69'));
});
test('Older Fossil sets respect the same per-evolution prerequisite and fossil-support exclusion',()=>{
 for(const set of ['ex16','dp2','ex13','neo2']){
  const rows=rowsFor([set]);
  for(let seed=1;seed<=12;seed++){
    const built=builder.buildDeck(rows,{sets:[set],style:'random',randomSeed:seed});
    if(built.ok)assertCoherent(built,rows,`${set}/${seed}`);
  }
 }
});
test('No fossil evolution means neither fossil-item nor fossil-only support can be used as Trainer filler',()=>{
 const rows=rowsFor(['dp5']).filter(r=>!['dp5-15','dp5-67','dp5-69'].includes(r.gameplayId));
 for(let seed=1;seed<=15;seed++){
  const built=builder.buildDeck(rows,{sets:['dp5'],style:'random',randomSeed:seed});
  assertCoherent(built,rows,`filler/${seed}`);
  assert.equal(built.cards.filter(id=>isFossil(data.cardById(id))||isSupport(data.cardById(id))).length,0);
 }
});
test('Basic-only filters cannot quietly add Fossils or include a Fossil as focus',()=>{
 const rows=rowsFor(['dp5']);
 const built=builder.buildDeck(rows,{sets:['dp5'],basicOnly:true,style:'random',randomSeed:4});
 assertCoherent(built,rows,'Basic-only');
 assert.equal(built.cards.some(id=>isFossil(data.cardById(id))),false);
 const bad=builder.buildDeck(rows,{sets:['dp5'],basicOnly:true,focusCardId:'dp5-89'});
 assert.equal(bad.ok,false);assert.match(bad.errors[0],/Basic-only/);
});
test('CPU-generated Fossil builds obey the same requirements',()=>{
 const rows=rowsFor(['dp5']);let checked=0;
 for(const type of ['Water','Fighting','Grass'])for(let seed=1;seed<=8;seed++){
  const built=cpu.generate({sets:['dp5'],type,seed});
  if(built.ok){assertCoherent(built,rows,`CPU ${type}/${seed}`);checked++;}
 }
 assert.ok(checked>=8,`Expected legal CPU decks; generated ${checked}`);
});
