'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const picker=require('../app/src/main/assets/tcg-classic-set-picker.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const game=require('../app/src/main/assets/tcg-classic-decks.js');
function assertSelectable(ids,label){
 const html=picker.html({ids,selected:['sm1'],mode:label,title:label+' allowed sets'});
 assert.match(html,/data-set-choice="sm1"/,label+' missing Sun & Moon selectable button');
 assert.match(html,/data-set-era="Sun &amp; Moon"/,label+' missing Sun & Moon era group');
 assert.match(html,/data-set-choice="sm1"[^>]*aria-pressed="true"/,label+' must preserve chosen SM1');
 assert.match(html,/Sun &amp; Moon/,label+' must display escaped label');
}
test('Sun & Moon era renders in both player and CPU Classic set selectors',()=>{
 assert.ok(picker.rows.some(row=>row[0]==='sm1'&&row[2]==='Sun & Moon'));
 assert.ok(builder.SET_IDS.includes('sm1'));
 assert.ok(cpu.SETS.includes('sm1'));
 assertSelectable(builder.SET_IDS,'player');
 assertSelectable(cpu.SETS,'cpu');
});
test('Every registered Classic set has a visible selection button in both surfaces',()=>{
 for(const [label,ids] of [['player',builder.SET_IDS],['cpu',cpu.SETS]]){
  const html=picker.html({ids,selected:[],mode:label});
  for(const id of ids){assert.ok(html.includes('data-set-choice="'+id+'"'),label+' invisible set '+id);}
 }
});
test('Selection corresponds to a legal SM1 player and opponent deck',()=>{
 const owned=classic.CARDS.filter(c=>c.setId==='sm1'&&c.battleEnabled&&c.deckEligible!==false)
  .map(c=>({gameplayId:c.id,quantity:4}));
 const player=builder.buildDeck(owned,{sets:['sm1'],style:'competitive',randomSeed:11});
 assert.equal(player.ok,true,(player.errors||[]).join('; '));
 assert.equal(player.cards.length,30);
 assert.ok(player.cards.every(id=>classic.cardById(id)?.setId==='sm1'));
 assert.equal(game.analyzeDeck(player.cards,player.energyTypes).missingEnergyTypes.length,0);
 const opponent=cpu.generate({sets:['sm1'],type:'Water',seed:33});
 assert.equal(opponent.ok,true,opponent.error);
 assert.equal(opponent.cards.length,30);
 assert.ok(opponent.cards.every(id=>classic.cardById(id)?.setId==='sm1'));
});
