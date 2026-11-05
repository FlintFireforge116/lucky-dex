'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const dir=path.resolve(__dirname,'../app/src/main/assets');
const classic=require(path.join(dir,'tcg-classic-battle-data.js'));
const data=require(path.join(dir,'tcgp-battle-data.js'));
const ui=require(path.join(dir,'tcgp-battle-ui.js'));
const forbidden=/^\s*(special effect\.?|effect|see card|unknown|n\/a)\s*$/i;

function hasMeaningfulText(text){return typeof text==='string' && text.trim().length>=12 && !forbidden.test(text);}
test('every effect-bearing pre-Florio Classic attack, Pokémon Power and Trainer has source rules text',()=>{
 const missing=[];
 // Florio has engine-derived in-game descriptions rather than source-transcribed text;
 // its complete attack presentation is audited by v069117-classic-main-combat-mobile.
 for(const card of classic.CARDS.filter(c=>c.setId!=='SNAPFLORIO'&&c.battleEnabled&&c.deckEligible!==false)){
  for(const attack of card.attacks||[]) if(attack.effect&&!hasMeaningfulText(attack.text||attack.printedText))missing.push(`${card.name}: ${attack.name}`);
  for(const ability of card.abilities||[]) if(ability.effect&&!hasMeaningfulText(ability.text))missing.push(`${card.name}: ${ability.name}`);
  if(card.kind==='trainer'&&card.effect&&!hasMeaningfulText(card.text))missing.push(`Trainer ${card.name}`);
  if(card.specialEnergy&&card.effect&&!hasMeaningfulText(card.text))missing.push(`Energy ${card.name}`);
 }
 assert.deepEqual(missing,[]);
});
test('Raticate Super Fang details the half-remaining-HP calculation, not a generic label',()=>{
 const c=data.cardById('base1-40');
 const html=ui.cardRulesHtml(c);
 assert.match(html,/Super Fang/);
 assert.match(html,/half/i);
 assert.match(html,/remaining HP/i);
 assert.match(html,/round/i);
 assert.doesNotMatch(html,/Special effect/i);
});
test('Charizard Pokémon Power and Fire Spin display their costs and effects',()=>{
 const html=ui.cardRulesHtml(data.cardById('base1-4'));
 assert.match(html,/Energy Burn/);
 assert.match(html,/Fire Energy/i);
 assert.match(html,/Fire Spin/);
 assert.match(html,/discard 2 Energy/i);
 assert.doesNotMatch(html,/Special effect/i);
});
test('Trainers and Special Energy show useful explanations in shared card inspector',()=>{
 const oak=ui.cardRulesHtml(data.cardById('base1-88'));
 assert.match(oak,/discard/i);assert.match(oak,/draw 7/i);
 const search=ui.cardRulesHtml(data.cardById('base1-71'));
 assert.match(search,/discard 2/i);assert.match(search,/search/i);
 const energy=ui.cardRulesHtml(data.cardById('base1-96'));
 assert.match(energy,/2 Colorless/i);
 assert.doesNotMatch(oak+search+energy,/Special effect/i);
});
test('printed rules are HTML-escaped and never leak markup',()=>{
 const card={name:'test',kind:'pokemon',attacks:[{name:'Oops',cost:'C',damage:0,effect:{type:'noop'},text:'<script>bad</script>'}]};
 const html=ui.cardRulesHtml(card);
 assert.match(html,/&lt;script&gt;/);
 assert.doesNotMatch(html,/<script>/);
});

test('no playable Base Set card inspection uses the old generic Special effect placeholder',()=>{
 const failures=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false&&/Special effect\./.test(ui.cardRulesHtml(c))).map(c=>c.name);
 assert.deepEqual(failures,[]);
});
