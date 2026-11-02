'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');

function battle(){const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:6947,firstSide:'player'});b.phase='battle';b.activeSide='player';b.turnNumber=5;b.sides.player.turnCount=3;b.sides.opponent.turnCount=3;b.sides.player.hand=[];b.sides.opponent.hand=[];b.sides.player.bench=[];b.sides.opponent.bench=[];b.sides.player.active=C.makePokemonSlot('B4-115',3,'rev');b.sides.opponent.active=C.makePokemonSlot('A1-001',3,'foe');return b;}
function tools(slot){return [slot.tool,...(slot.extraTools||[])].filter(Boolean);}
function act(b,side,predicate,label){const a=C.legalActions(b,side).find(predicate);assert.ok(a,label);C.applyAction(b,side,a);return a;}

test('discardTool sourceOnly discards only the Tool whose persistent effect fired',()=>{
 const b=battle(),slot=b.sides.player.active;
 slot.tool={uid:'lum',cardId:'A2-149'};slot.extraTools=[{uid:'sitrus',cardId:'B1-218'}];
 E.applyEffect({type:'discardTool',target:'self',sourceOnly:true},{...C.effectContext(b,'player',{},slot),sourceTool:slot.tool});
 assert.deepEqual(tools(slot).map(x=>x.uid),['sitrus']);
 assert.deepEqual(b.sides.player.discard.map(x=>x.uid),['lum']);
});

test('Field Blower lets its player choose one Tool from a two-Tool Revavroom',()=>{
 const b=battle(),slot=b.sides.player.active;
 slot.tool={uid:'lum',cardId:'A2-149'};slot.extraTools=[{uid:'sitrus',cardId:'B1-218'}];
 b.sides.player.hand=[{uid:'blower',cardId:'B3-147'}];
 act(b,'player',a=>a.type==='trainer'&&a.cardId==='B3-147','Field Blower should be playable');
 assert.equal(b.phase,'effectChoice');
 act(b,'player',a=>a.type==='effectChoice'&&a.choiceLabel==='Your Pokémon Tool','choose own Tool option');
 assert.equal(b.phase,'effectChoice','choosing the Field Blower option should ask which Pokémon');
 act(b,'player',a=>a.type==='effectChoice'&&a.choiceTarget==='active','choose Revavroom');
 assert.equal(b.phase,'effectChoice','two attached Tools should require choosing the specific Tool');
 const toolChoices=C.legalActions(b,'player').filter(a=>a.type==='effectChoice'&&a.choiceToolIndex!=null);
 assert.equal(toolChoices.length,2);
 const chosen=toolChoices.find(a=>a.choiceCardId==='A2-149')||toolChoices[0];
 act(b,'player',a=>a.type==='effectChoice'&&a.choiceToolIndex===chosen.choiceToolIndex,'choose one attached Tool');
 assert.equal(tools(slot).length,1);
 assert.equal(b.sides.player.discard.filter(r=>r.uid==='lum'||r.uid==='sitrus').length,1);
});
