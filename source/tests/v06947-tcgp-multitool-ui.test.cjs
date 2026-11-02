const test=require('node:test');
const assert=require('node:assert/strict');
const ui=require('../app/src/main/assets/tcgp-battle-ui.js');

function tool(cardId){return {cardId};}
function activeWithTwoTools(){
  return {
    cardId:'A1-130',
    damage:0,
    energy:{},
    conditions:{},
    tool:tool('A2-149'),
    extraTools:[tool('B1-218')]
  };
}

test('two attached Tools are individually inspectable and visible on the live card',()=>{
  assert.ok(ui._test,'battle UI exposes focused helpers for regression testing');
  const slot=activeWithTwoTools();
  assert.deepEqual(ui._test.slotTools(slot).map(ref=>ref.cardId),['A2-149','B1-218']);

  const state={sides:{player:{active:slot,bench:[],hand:[],discard:[]},opponent:{active:null,bench:[],hand:[],discard:[]}},stadium:null};
  const spec=ui._test.buildInspectSpec('player','tool-active',0,1);
  assert.equal(spec.toolIndex,1);
  const inspected=ui._test.resolveInspect(state,spec);
  assert.equal(inspected?.card?.name,'Sitrus Berry');

  const links=ui._test.attachedToolLinksHtml({slot,sideName:'player',zone:'active'},0);
  assert.match(links,/Inspect Lum Berry/);
  assert.match(links,/Inspect Sitrus Berry/);
  assert.match(links,/data-tool-index="0"/);
  assert.match(links,/data-tool-index="1"/);

  const cardHtml=ui._test.liveCardHtml(slot,{side:'opponent',zone:'active',index:0});
  assert.match(cardHtml,/>TOOLS 2</);
});
