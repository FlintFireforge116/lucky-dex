const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const K=require('../app/src/main/assets/tcgp-battle-decks.js');

function owned(ids){return ids.map(id=>({gameplayId:id,quantity:2}));}
function names(result){return result.cards.map(id=>D.cardById(id)?.name||id);}

test('competitive Stage 2 deck does not spend trainer slots on Stage 1 bridge support',()=>{
  const rows=owned([
    'A1-143', // Machop
    'A1-144', // Machoke - bridge only
    'A1-146', // Machamp ex
    'A3-144', // Rare Candy
    'B2-153', // Training Area
    'B3b-065', // Elegant Cape
    'B3-149', // Korrina
    'P-A-007', // Professor's Research
    'P-A-002', // X Speed
    'A2b-071', // Red
    'B3b-064', // Small Balloon
    'A2-154', // Dawn
    'A1-223' // Giovanni
  ]);
  const result=K.buildQuickDeck(rows,{style:'competitive',types:['Fighting']});
  assert.equal(result.ok,true,result.errors?.join(' '));
  const deck=names(result);
  assert.equal(deck.includes('Machoke'),true,'the evolution bridge can remain in the list');
  assert.equal(deck.includes('Rare Candy'),true,'Stage 2 consistency tech should remain');
  assert.equal(deck.includes('Training Area'),false,'Stage 1-only Stadium is dead when Stage 1 is only a bridge');
  assert.equal(deck.includes('Elegant Cape'),false,'Stage 1-only Tool is dead when Stage 1 is only a bridge');
  assert.equal(deck.includes('Korrina'),true,'archetype-relevant Fighting support should still be selected');
});

test('Stage 1 endpoint deck can still choose Stage 1 support',()=>{
  const rows=owned([
    'B4-112', // Duraludon
    'B4-113', // Archaludon - actual Stage 1 endpoint
    'B2-153', // Training Area
    'B3b-065', // Elegant Cape
    'P-A-007','P-A-002','P-A-001','A1-223','A2-147','A2-154','A2a-075','A2b-069','A2b-071','C1-122'
  ]);
  const result=K.buildQuickDeck(rows,{style:'competitive',types:['Metal']});
  assert.equal(result.ok,true,result.errors?.join(' '));
  const deck=names(result);
  assert.equal(deck.includes('Archaludon'),true);
  assert.equal(deck.includes('Training Area')||deck.includes('Elegant Cape'),true,'real Stage 1 endpoints should keep access to Stage 1 support');
});
