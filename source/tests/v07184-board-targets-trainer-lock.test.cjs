'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const ui=require(path.join(A,'tcgp-battle-ui.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const seeded=opponent.generate({sets:['ex8'],seed:29});assert.ok(seeded.ok,seeded.error);
const slot=(n,uid,benchSlot)=>({...core.makePokemonSlot('ex8-'+n,3,uid),...(benchSlot!=null?{benchSlot}:{})});
function battle(){
  const s=core.createBattle({format:'classic',playerDeck:seeded.cards,opponentDeck:seeded.cards,seed:29,firstSide:'player',playerEnergyTypes:['Fire','Water','Lightning'],opponentEnergyTypes:['Lightning']});
  s.phase='battle';s.activeSide='player';s.turnNumber=6;s.sides.player.turnCount=3;s.sides.opponent.turnCount=3;
  s.sides.player.active=slot(103,'salamence');s.sides.player.active.energy={Fire:5,Water:5,Lightning:4};
  s.sides.opponent.active=slot(52,'bagon-active');
  s.sides.opponent.bench=[slot(52,'bagon-bench-1',0),slot(52,'bagon-bench-2',1)];
  return s;
}
test('Salamence ex Flame Jet targets each physical opposing Pokemon rather than a text menu',()=>{
  const s=battle(),actions=core.legalActions(s,'player'),idx=actions.map((a,i)=>a.type==='attack'&&a.attackIndex===0?i:-1).filter(i=>i>=0);
  assert.equal(idx.length,3,'Active plus the two distinct Benched Bagon');
  assert.equal(ui._test.boardTargetOnlyActions(s,actions,idx),true);
  ui._test.setCurrentBattleForTests(s,actions);
  ui._test.setBattleOverlayForTests('context-actions',idx);
  const active=ui._test.contextualBoardActions(actions,'opponent','active',0);
  const bench0=ui._test.contextualBoardActions(actions,'opponent','bench',0);
  const bench1=ui._test.contextualBoardActions(actions,'opponent','bench',1);
  assert.equal(active.length,1);assert.equal(bench0.length,1);assert.equal(bench1.length,1);
  assert.notEqual(bench0[0],bench1[0],'same species must be distinct selectable slots');
  assert.match(ui._test.pokemonInteractionAttrs('opponent','bench',0,s.sides.opponent.bench[0]),/choose-board-card/);
  assert.match(ui._test.liveContextActionsOverlayHtml(),/Tap the Pok[eé]mon you want to target on the board/);
  assert.doesNotMatch(ui._test.liveContextActionsOverlayHtml(),/tcgp-live-context-card/,'no text card chooser');
  core.applyAction(s,'player',actions[bench1[0]]);
  assert.equal(s.sides.opponent.active.damage,0);
  assert.equal(s.sides.opponent.bench[0].damage,0);
  assert.equal(s.sides.opponent.bench[1].damage,40);
});
test('UID-backed targets work for other moves and both owners without name matching',()=>{
  const s=battle();
  const choices=[{type:'ability',effectSelection:'bagon-bench-1'}, {type:'ability',effectSelection:'salamence'}];
  assert.deepEqual(ui._test.boardTargetForAction(s,choices[0]),{side:'opponent',zone:'bench',index:0});
  assert.deepEqual(ui._test.boardTargetForAction(s,choices[1]),{side:'player',zone:'active',index:0});
  assert.equal(ui._test.boardTargetOnlyActions(s,choices,[0,1]),true);
});
test('Manectric ex Disconnect blocks Items and Tools for exactly next turn but not Supporters',()=>{
  const s=battle();s.activeSide='opponent';s.turnNumber=5;
  s.sides.opponent.active=slot(101,'manectric');s.sides.opponent.active.energy={Lightning:8,Colorless:8};
  s.sides.player.hand=[{uid:'energy-charge',cardId:'ex8-86'},{uid:'master-ball',cardId:'ex8-88'},{uid:'supporter',cardId:'ex8-90'}];
  const disconnect=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);
  assert.ok(disconnect,'Disconnect should be usable');
  core.applyAction(s,'opponent',disconnect);
  assert.equal(s.activeSide,'player');assert.equal(s.turnNumber,6);
  const turn6=core.legalActions(s,'player');
  assert.ok(!turn6.some(a=>a.type==='trainer'&&a.cardId==='ex8-86'));
  assert.ok(!turn6.some(a=>a.type==='trainer'&&a.cardId==='ex8-88'));
  assert.ok(turn6.some(a=>a.type==='trainer'&&a.cardId==='ex8-90'),'Supporter still legal');
  assert.match(ui._test.classicTrainerRestriction(s),/Disconnect/);
  core.applyAction(s,'player',turn6.find(a=>a.type==='endTurn'));
  core.applyAction(s,'opponent',core.legalActions(s,'opponent').find(a=>a.type==='endTurn'));
  assert.equal(s.activeSide,'player');assert.equal(s.turnNumber,8);
  const turn8=core.legalActions(s,'player');
  assert.ok(turn8.some(a=>a.type==='trainer'&&a.cardId==='ex8-86'),'Energy Charge unlocked after one turn');
  assert.ok(turn8.some(a=>a.type==='trainer'&&a.cardId==='ex8-88'),'Master Ball unlocked after one turn');
  assert.equal(ui._test.classicTrainerRestriction(s),'');
});
test('Using a Supporter does not block Item Trainers on an otherwise unlocked turn',()=>{
  const s=battle();
  s.sides.player.supporterUsed=true;
  s.sides.player.hand=[{uid:'energy-charge',cardId:'ex8-86'},{uid:'master-ball',cardId:'ex8-88'},{uid:'supporter',cardId:'ex8-90'}];
  const legal=core.legalActions(s,'player');
  assert.ok(legal.some(a=>a.type==='trainer'&&a.cardId==='ex8-86'));
  assert.ok(legal.some(a=>a.type==='trainer'&&a.cardId==='ex8-88'));
  assert.ok(!legal.some(a=>a.type==='trainer'&&a.cardId==='ex8-90'));
  assert.equal(ui._test.classicTrainerRestriction(s),'');
});
test('Older-set attack target choices reuse the same physical board target flow',()=>{
  const s=battle(),active=s.sides.opponent.active,bench=s.sides.opponent.bench[0];
  for(const label of ['Target Active','Attack current Active','Attack current defender','Keep current Active','Attack opposing Active']){
    assert.deepEqual(ui._test.boardTargetForAction(s,{type:'attack',effectSelection:'',choiceLabel:label}),{side:'opponent',zone:'active',index:0},label);
  }
  assert.deepEqual(ui._test.boardTargetForAction(s,{type:'attack',effectSelection:bench.uid,choiceLabel:'Target Bagon'}),{side:'opponent',zone:'bench',index:0});
  assert.equal(ui._test.boardTargetForAction(s,{type:'attack',effectSelection:'discard',choiceLabel:'Discard Lightning Energy'}),null,'non-target choices stay in menu');
  assert.ok(active);
});
