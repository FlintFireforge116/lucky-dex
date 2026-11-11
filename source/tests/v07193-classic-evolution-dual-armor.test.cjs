'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const classic=require(A+'/tcg-classic-battle-data.js');
const decks=require(A+'/tcg-classic-decks.js');
const builder=require(A+'/tcg-classic-deck-builder.js');
const opponents=require(A+'/tcg-classic-opponents.js');
const synergy=require(A+'/tcg-deck-synergy.js');
const all=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false&&['ex10','neo1','ex7'].includes(c.setId)).map(c=>({gameplayId:c.id,quantity:4}));
const ex10=all.filter(x=>x.gameplayId.startsWith('ex10-'));
function names(r){return r.cards.map(id=>classic.cardById(id)?.name);}
function legal(r,rows){assert.equal(r.ok,true,r.errors?.join('; '));assert.equal(r.cards.length,30);assert.equal(decks.readiness({cards:r.cards,energyTypes:r.energyTypes,energyMode:'manual'},rows).ok,true);}

test('EX10 screenshot seed has legal fully evolved families and no unrelated Scyther',()=>{
 const r=builder.buildDeck(ex10,{sets:['ex10'],types:['Fire'],style:'random',randomSeed:12});legal(r,ex10);
 assert.equal(names(r).includes('Scyther'),false,'Grass-only Scyther is not a Fire support');
 if(names(r).includes('Quilava'))assert.ok(names(r).includes('Typhlosion'),'Every Quilava core must include Typhlosion');
 if(names(r).includes('Magcargo'))assert.ok(r.energyTypes.includes('Fighting'),'Magcargo Dual Armor needs Fighting');
});
test('focused Quilava builds the complete EX10-only line once Typhlosion is battle-ready',()=>{
 const r=builder.buildDeck(ex10,{sets:['ex10'],types:['Fire'],focusCardId:'ex10-45'});legal(r,ex10);
 for(const name of ['Cyndaquil','Quilava','Typhlosion'])assert.ok(names(r).includes(name),name+' missing');
 assert.ok(r.cards.includes('ex10-45')&&r.cards.includes('ex10-17'));
});
test('when an eligible Typhlosion is in scope, a Quilava-focused build contains all three actual stages',()=>{
 const r=builder.buildDeck(all,{sets:['ex10','neo1'],types:['Fire'],focusCardId:'ex10-45'});legal(r,all);
 for(const name of ['Cyndaquil','Quilava','Typhlosion'])assert.ok(names(r).includes(name),name+' missing');
 assert.ok(r.cards.includes('ex10-45'),'must retain focused Quilava print');
});
test('Magcargo Dual Armor genuinely selects Fire and Fighting with either type filter',()=>{
 for(const type of ['Fire','Fighting']){
  const r=builder.buildDeck(ex10,{sets:['ex10'],types:[type],focusCardId:'ex10-41'});legal(r,ex10);
  assert.deepEqual(new Set(r.energyTypes),new Set(['Fire','Fighting']));
  assert.ok(r.cards.includes('ex10-41'));
 }
});
test('Slowbro Dual Armor requires Psychic to activate while retaining its Water attack costs',()=>{
 const r=builder.buildDeck(ex10,{sets:['ex10'],types:['Psychic'],focusCardId:'ex10-13'});legal(r,ex10);
 assert.deepEqual(new Set(r.energyTypes),new Set(['Water','Psychic']));
 assert.ok(r.cards.includes('ex10-13'));
});
test('Rocket Scizor ex deck retains its Metal activation in a Darkness profile',()=>{
 const r=builder.buildDeck(all,{sets:['ex7'],types:['Darkness'],focusCardId:'ex7-101'});legal(r,all);
 assert.ok(r.cards.includes('ex7-102')&&r.cards.includes('ex7-101'));
 assert.deepEqual(new Set(r.energyTypes),new Set(['Darkness','Metal']));
});
test('explicit incompatible Energy filters do not pretend Dual Armor will activate',()=>{
 const r=builder.buildDeck(ex10,{sets:['ex10'],types:['Fire','Water'],focusCardId:'ex10-41'});
 assert.equal(r.ok,false);assert.match(r.errors.join(' '),/Fighting Energy/);
});
test('auto Energy analysis recommends Dual Armor triggers without making them mandatory manual requirements',()=>{
 const magcargo=['ex10-73','ex10-41'],slowbro=['ex10-72','ex10-13'];
 assert.deepEqual(new Set(decks.analyzeDeck(magcargo).recommendedEnergyTypes),new Set(['Fire','Fighting']));
 assert.deepEqual(new Set(decks.analyzeDeck(slowbro).recommendedEnergyTypes),new Set(['Water','Psychic']));
 assert.deepEqual(decks.analyzeDeck(magcargo,['Fire']).missingEnergyTypes,[], 'optional type boost should not invalidate manual builds');
 assert.equal(decks.dualArmorProfile(classic.cardById('ex10-41')).energyType,'Fighting');
});
test('metadata includes conditional type only when its activation Energy is available',()=>{
 const card=classic.cardById('ex10-41');
 assert.deepEqual(synergy.metadata(card).conditionalTypes,[{type:'Fighting',requiresEnergy:'Fighting'}]);
 assert.ok(synergy.context([card],['Fire']).types.has('Fire'));
 assert.ok(!synergy.context([card],['Fire']).types.has('Fighting'));
 assert.ok(synergy.context([card],['Fire','Fighting']).types.has('Fighting'));
});
test('CPU preserves a coherent Energy plan for any chosen EX10 Fire core',()=>{
 const r=opponents.generate({sets:['ex10'],type:'Fire',seed:12});
 assert.ok(r.ok,r.error);
 assert.equal(decks.analyzeDeck(r.cards,r.energyTypes).missingEnergyTypes.length,0);
 if(r.cards.includes('ex10-41'))assert.deepEqual(new Set(r.energyTypes),new Set(['Fire','Fighting']));
 if(r.cards.includes('ex10-45'))assert.ok(r.cards.includes('ex10-17'));
});
