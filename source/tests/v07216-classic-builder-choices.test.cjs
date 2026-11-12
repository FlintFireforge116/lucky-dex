'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const ex15=require('../app/src/main/assets/tcg-classic-dragon-frontiers.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const opponents=require('../app/src/main/assets/tcg-classic-opponents.js');
const owned=ex15.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
const build=(opts)=>builder.buildDeck(owned,{sets:['ex15'],randomSeed:0,...opts});
const mons=d=>[...new Set(d.cards)].map(classic.cardById).filter(c=>c?.kind==='pokemon');
const stage2Ex=d=>mons(d).filter(c=>c.pokemonEx&&c.stage==='Stage 2'&&builder.familyLine(c,mons(d)).length===3);

test('Lightning-only Feraligatr prefers attack-payable families instead of Fighting Meganium metadata partner',()=>{
 for(const seed of [0,3,19,31,100]){
  const r=build({focusCardId:'ex15-2',types:['Lightning'],randomSeed:seed});
  assert.ok(r.ok,JSON.stringify(r.errors));assert.deepEqual(r.energyTypes,['Lightning']);
  assert.ok(r.cards.includes('ex15-2'));assert.ok(!r.cards.includes('ex15-4'),'Meganium is an unpayable Fighting partner');
  assert.ok(mons(r).every(c=>builder.attackTypes(c).every(type=>r.energyTypes.includes(type))),
    'Attacking line has unmet attack Energy costs');
 }
});
test('Charizard Star cannot attract Xatu or other Stage 2 ex-only supports without a beneficiary',()=>{
 for(const seed of [0,4,19,100]){
  const r=build({focusCardId:'ex15-100',types:['Darkness'],randomSeed:seed});
  assert.ok(r.ok,JSON.stringify(r.errors));assert.ok(r.cards.includes('ex15-100'));
  assert.equal(stage2Ex(r).length,0);
  assert.equal(r.cards.includes('ex15-25'),false,'Xatu Extra Feather cannot buff Charizard Star');
  assert.equal(r.cards.includes('ex15-40'),false,'Swellow Extra Wing cannot help Charizard Star');
  assert.equal(r.cards.includes('ex15-90'),false,'Altaria Extra Boost needs a Stage 2 ex');
 }
});
test('Xatu focus must have playable Stage 2 ex; constrained impossible focus reports reason',()=>{
 const good=build({focusCardId:'ex15-25'});
 assert.ok(good.ok,JSON.stringify(good.errors));assert.ok(good.cards.includes('ex15-25'));
 assert.ok(stage2Ex(good).length,'Xatu needs a complete Stage 2 ex chain');
 const impossible=build({focusCardId:'ex15-25',types:['Darkness']});
 assert.equal(impossible.ok,false);assert.match(impossible.errors[0],/Stage 2.*ex/i);
});
test('Xatu and Swellow still join eligible Stage 2 ex Fire attacker',()=>{
 const r=build({focusCardId:'ex15-93',types:['Fire']});
 assert.ok(r.ok,JSON.stringify(r.errors));assert.ok(r.cards.includes('ex15-25'));
 assert.ok(r.cards.includes('ex15-40'));assert.ok(stage2Ex(r).length);
 assert.deepEqual(r.energyTypes,['Fire']);
});
test('single-type EX15 opponent no longer includes pointless Stage 2 ex-only supports',()=>{
 for(const seed of [1,2,3,4,5,11,25]){
  const r=opponents.generate({sets:['ex15'],type:'Darkness',seed});
  assert.ok(r.ok,r.error);assert.deepEqual(r.energyTypes,['Darkness']);
  const hasBeneficiary=stage2Ex(r).length>0;
  if(!hasBeneficiary)for(const id of ['ex15-25','ex15-40','ex15-90'])assert.ok(!r.cards.includes(id),`${id} is inert at seed ${seed}`);
 }
});
test('card selection art hides fallback name tile while keeping missing-image fallback',()=>{
 const css=fs.readFileSync(path.join(root,'tcgp-battle.css'),'utf8');
 const ui=fs.readFileSync(path.join(root,'tcgp-battle-ui.js'),'utf8');
 assert.match(css,/\.tcgp-live-choice-placeholder\[hidden\][^\n]*display:none!important/);
 assert.match(css,/\.tcgp-live-choice-card img\[hidden\]/);
 assert.match(ui,/onerror="this\.hidden=true;this\.nextElementSibling\.hidden=false"/);
 assert.match(ui,/tcgp-live-choice-placeholder" hidden/);
});
