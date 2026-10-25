const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const ui=require('../app/src/main/assets/tcgp-battle-ui.js');

const deck=data.BEGINNER_IVYSAUR_DECK;

function firstBasicIndex(side){return side.hand.findIndex(ref=>data.cardById(ref.cardId)?.stage==='Basic');}

test('manual setup offers every empty physical Bench slot and preserves the chosen slot',()=>{
  const battle=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:913,firstSide:'player',manualPlayerSetup:true});
  let handIndex=firstBasicIndex(battle.sides.player);
  core.applyAction(battle,'player',{type:'setupActive',handIndex});
  handIndex=firstBasicIndex(battle.sides.player);
  assert.ok(handIndex>=0,'opening hand should contain another Basic for this seed');
  const actions=core.legalActions(battle,'player').filter(a=>a.type==='setupBench'&&a.handIndex===handIndex);
  assert.deepEqual(actions.map(a=>a.benchIndex).sort(),[0,1,2]);
  core.applyAction(battle,'player',{type:'setupBench',handIndex,benchIndex:2});
  assert.equal(battle.sides.player.bench.length,1);
  assert.equal(battle.sides.player.bench[0].benchSlot,2);
  assert.equal(core.benchSlotAt(battle.sides.player,2)?.cardId,battle.sides.player.bench[0].cardId);
  assert.equal(core.benchSlotAt(battle.sides.player,0),null);
});

test('live Basic placement can target any empty physical Bench slot',()=>{
  const battle=core.createBattle({playerDeck:deck,opponentDeck:deck,seed:914,firstSide:'player'});
  battle.sides.player.bench=[];
  battle.sides.player.hand=[{uid:'basic-live',cardId:'A1-014'}];
  const actions=core.legalActions(battle,'player').filter(a=>a.type==='bench');
  assert.deepEqual(actions.map(a=>a.benchIndex).sort(),[0,1,2]);
  core.applyAction(battle,'player',{type:'bench',handIndex:0,cardId:'A1-014',benchIndex:1});
  assert.equal(battle.sides.player.bench[0].benchSlot,1);
});

test('UI direct-drop matching respects the chosen physical Bench slot',()=>{
  const battle={phase:'battle',activeSide:'player',sides:{player:{bench:[]}}};
  const actions=[
    {type:'bench',handIndex:0,cardId:'A1-014',benchIndex:0},
    {type:'bench',handIndex:0,cardId:'A1-014',benchIndex:2}
  ];
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'bench',2),1);
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'bench',1),-1);
});
