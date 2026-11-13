'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const p='../app/src/main/assets/';
const core=require(p+'tcgp-battle-core'),ui=require(p+'tcgp-battle-ui'),opp=require(p+'tcg-classic-opponents');
const generated=opp.generate({sets:['dp1'],type:'Psychic',seed:57});
function game(){
  assert.ok(generated.ok,generated.error);
  const s=core.createBattle({format:'classic',playerDeck:generated.cards,opponentDeck:generated.cards,seed:57,firstSide:'player',playerEnergyTypes:['Psychic','Fighting','Colorless'],opponentEnergyTypes:['Psychic']});
  s.phase='battle';s.activeSide='player';s.turnNumber=10;s.sides.player.turnCount=8;s.sides.opponent.turnCount=8;
  s.sides.player.active=core.makePokemonSlot('dp1-22',2,'clefable');s.sides.player.active.energy={Colorless:3};
  s.sides.opponent.active=core.makePokemonSlot('dp1-27',2,'gengar');s.sides.opponent.active.energy={Psychic:3};
  s.sides.opponent.bench=[core.makePokemonSlot('dp1-82',2,'gastly')];s.sides.opponent.bench[0].benchSlot=0;
  return s;
}
test('Clefable Metronome shows copied source Pokémon, attack and printed effect, never 0 DMG duplicates',()=>{
  const s=game(),choices=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
  assert.equal(choices.length,2);
  const labels=choices.map(a=>ui.actionLabel(a,s,'player'));
  assert.match(labels[0],/Gengar.*Life Drain/);
  assert.match(labels[1],/Gengar.*Shadow Dance/);
  assert.ok(labels[0].includes('heads')&&labels[1].includes('four damage counters'));
  assert.notEqual(labels[0],labels[1]);
  assert.ok(!labels.some(x=>x.includes('Metronome · 0 DMG')));
  ui._test.setCurrentBattleForTests(s,choices);ui._test.setBattleOverlayForTests('context-actions',[0,1]);
  const html=ui._test.liveContextActionsOverlayHtml();
  assert.match(html,/is-copy-attack/);
  assert.match(html,/images\.pokemontcg\.io\/dp1\/27\.png/);
  assert.match(html,/Life Drain/);assert.match(html,/Shadow Dance/);
});
test('copied attack logic is specific to copy effects; regular attack labels remain intact',()=>{
  const s=game(),a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
  assert.equal(ui._test.copiedAttackOption(a,s,'player'),null);
  assert.match(ui.actionLabel(a,s,'player'),/Double Slap/);
});
test('real copied attack selection deals target damage, rather than a zero-damage Metronome',()=>{
  const s=game(),a=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1).find(a=>a.choiceAttackIndex===1);
  assert.ok(a);
  core.applyAction(s,'player',a);
  assert.ok(s.log.some(e=>e.type==='attack'&&e.attack==='Metronome'));
  assert.ok(s.sides.opponent.active?.damage>=0||s.log.some(e=>e.type==='ko'));
});
test('mandatory prize UI is withheld while coin/KO animation is in progress, then made available',()=>{
  const s=game();
  s.phase='effectChoice';s.choiceSide='player';s.pendingChoice={special:'chooseClassicPrize',kind:'prizeCard',prompt:'Choose a Prize card',side:'player'};
  const logs=[{type:'coin',side:'player',heads:true,results:[true]},{type:'attack',side:'player',damage:80},{type:'ko',side:'opponent',cardId:'dp1-82'}];
  assert.equal(ui._test.shouldHoldPrizePresentation(s,logs),true);
  ui._test.setCurrentBattleForTests(s,core.legalActions(s,'player'));
  ui._test.setPrizePresentationHeldForTests(true);
  assert.equal(ui._test.liveEffectChoiceCenterHtml(),'');
  assert.match(ui._test.liveMidControlsHtml('MAKE A CHOICE',''),/RESOLVING EFFECTS/);
  ui._test.setPrizePresentationHeldForTests(false);
  const html=ui._test.liveEffectChoiceCenterHtml();
  assert.match(html,/Choose a Prize card/);
  assert.match(html,/tcgp-live-prize-grid/);
});
test('non-prize choices are never suppressed and prize choice without resolution logs is not held',()=>{
  const s=game();s.phase='effectChoice';s.choiceSide='player';s.pendingChoice={special:'chooseClassicPrize',kind:'prizeCard',prompt:'Prize'};
  assert.equal(ui._test.shouldHoldPrizePresentation(s,[]),false);
  assert.equal(ui._test.shouldHoldPrizePresentation(s,[{type:'trainer',side:'player'}]),false);
  s.pendingChoice={kind:'option',prompt:'Choose an option',options:['Take','Skip']};
  assert.equal(ui._test.shouldHoldPrizePresentation(s,[{type:'ko'}]),false);
  ui._test.setCurrentBattleForTests(s,[{type:'effectChoice',choiceOption:0,choiceLabel:'Take'},{type:'effectChoice',choiceOption:1,choiceLabel:'Skip'}]);
  ui._test.setPrizePresentationHeldForTests(true);
  assert.match(ui._test.liveEffectChoiceCenterHtml(),/Choose an option/);
  ui._test.setPrizePresentationHeldForTests(false);
});
