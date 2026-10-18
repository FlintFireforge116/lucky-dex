const {test}=require('node:test'),assert=require('node:assert/strict');
const V=require('../app/src/main/assets/adventure/adventure-move-view.js');
test('Compact move content keeps name/type/category/Power/PP without repeating expanded details',()=>{
  assert.equal(typeof V.compact,'function','A shared compact move variant is missing');
  const html=V.compact(84,{currentPP:4});
  assert.match(html,/Thunder Shock/);assert.match(html,/Electric/);assert.match(html,/Special/);assert.match(html,/Power 40/);assert.match(html,/4 \/ 30/);
  assert.doesNotMatch(html,/Accuracy|Deals special damage/);
});
test('One shared move detail panel exposes factual power/accuracy/effect and safely escapes values',()=>{
  assert.equal(typeof V.details,'function','The shared secondary move panel is missing');
  const html=V.details(84,{currentPP:4});assert.match(html,/40/);assert.match(html,/100%/);assert.match(html,/paralyze/);
  assert.doesNotMatch(V.compact({...require('../app/src/main/assets/adventure/adventure-move-data.js').moves[84],name:'<img src=x>'}),/<img/);
});
test('Party status presentation never exposes raw enum values or unknown internal status strings',()=>{
  assert.equal(typeof V.statusName,'function');
  assert.equal(V.statusName('poison'),'Poisoned');assert.equal(V.statusName('paralysis'),'Paralyzed');
  assert.equal(V.statusName('sleep'),'Asleep');assert.equal(V.statusName('freeze'),'Asleep');assert.equal(V.statusName('future_internal_status'),'Affected');
});
