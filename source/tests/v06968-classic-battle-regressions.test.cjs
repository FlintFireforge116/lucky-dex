'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(dir,'tcgp-battle-core.js'));
const ui=require(path.join(dir,'tcgp-battle-ui.js'));
const decks=require(path.join(dir,'tcg-classic-decks.js'));
const data=require(path.join(dir,'tcgp-battle-data.js'));
const libraryDeck=decks.LOANER_DECK.slice();
function match(seed=68){return core.createBattle({format:'classic',playerDeck:libraryDeck,opponentDeck:libraryDeck,playerEnergyTypes:['Fire','Water'],opponentEnergyTypes:['Water','Fire'],seed,firstSide:'opponent'});}

test('knocking out Charizard with Arcanine and Chansey on bench prompts promotion, not defeat, and awards a Prize',()=>{
 const b=match();b.phase='battle';b.activeSide='opponent';b.turnNumber=4;
 b.sides.player.active=core.makePokemonSlot('base1-4',0,'test-charizard');b.sides.player.active.damage=110;
 const arcanine=core.makePokemonSlot('base1-23',0,'test-arcanine');arcanine.benchSlot=0;
 const chansey=core.makePokemonSlot('base1-3',0,'test-chansey');chansey.benchSlot=2;
 b.sides.player.bench=[arcanine,chansey];
 b.sides.opponent.active=core.makePokemonSlot('base1-65',0,'test-staryu');b.sides.opponent.active.energy={Water:1};
 const a=core.legalActions(b,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(a,'Staryu can use Slap');core.applyAction(b,'opponent',a);
 assert.equal(b.phase,'promote','a surviving bench must require promotion');
 assert.equal(b.winner,null,'the battle must not finish on a KO with a bench');
 assert.equal(b.promotionSide,'player');
 assert.equal(b.sides.player.bench.length,2);
 assert.equal(b.sides.opponent.prizesTaken,1,'the CPU earns one Prize for Charizard');
 const choice=core.legalActions(b,'player').find(a=>a.type==='promote'&&a.benchIndex===2);
 assert.ok(choice,'Chansey must be a valid replacement');core.applyAction(b,'player',choice);
 assert.equal(b.sides.player.active.cardId,'base1-3');assert.notEqual(b.phase,'finished');
});

test('a saved legacy Classic deck-out result has an explicit loss reason even when Bench survives',()=>{
 const b=match(69);b.sides.player.active=core.makePokemonSlot('base1-4',0,'charizard');
 b.sides.player.bench=[core.makePokemonSlot('base1-3',0,'chansey')];b.sides.player.bench[0].benchSlot=0;
 b.sides.player.deck=[];b.phase='battle';b.activeSide='player';b.sides.player.prizesTaken=2;
 // v0.69.68 could save a completed deck-out loss; older summaries must still explain it.
 b.phase='finished';b.winner='opponent';b.reason='deck-out';
 assert.equal(b.phase,'finished');assert.equal(b.winner,'opponent');assert.equal(b.reason,'deck-out');
 assert.equal(b.sides.player.bench.length,1);
 assert.match(ui.resultSummary(b).message,/deck|draw/i,'the result must say the loss was deck exhaustion');
 assert.doesNotMatch(ui.resultSummary(b).message,/The CPU won the match\./);
});

test('Double Colorless appears on board as its own card plus its provided 2 Colorless energy',()=>{
 const slot=core.makePokemonSlot('base1-4',0,'charizard');slot.energy={Fire:3};slot.specialEnergy=[{uid:'dce-1',cardId:'base1-96'}];
 const html=ui._test.liveCardHtml(slot,{side:'player',zone:'active'});
 assert.match(html,/Double Colorless Energy|DCE/);
 assert.match(html,/2 Colorless/i);
 assert.match(html,/tcgp-live-special-energy/);
 assert.match(html,/Fire/);
});

test('Classic Special Energy attaches in addition to the Energy Zone attachment, before or after',()=>{
 for(const order of ['special-first','zone-first']){
  const b=match(order==='special-first'?72:73);b.phase='battle';b.activeSide='player';b.sides.player.active=core.makePokemonSlot('base1-65',0,'staryu');b.sides.player.energyType='Water';b.sides.player.energyAvailable=true;b.sides.player.energyUsed=false;
  const dce={uid:`dce-${order}`,cardId:'base1-96'};b.sides.player.hand.push(dce);
  const special=()=>core.legalActions(b,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='base1-96'&&a.target==='active');
  const zone=()=>core.legalActions(b,'player').find(a=>a.type==='attach'&&a.target==='active');
  const first=order==='special-first'?special():zone();assert.ok(first,`${order} first attachment`);core.applyAction(b,'player',first);
  const second=order==='special-first'?zone():special();assert.ok(second,`${order} second attachment`);core.applyAction(b,'player',second);
  assert.equal(b.sides.player.active.energy.Water,1);assert.equal(b.sides.player.active.specialEnergy.length,1);
  assert.equal(b.sides.player.energyUsed,true,'only the zone attachment uses up the placement');
  assert.equal(core.legalActions(b,'player').some(a=>a.type==='attach'),false,'no second zone attachment');
  assert.equal(data.cardById('base1-96').effect.provides.Colorless,2);
 }
});

test('Charizard Fire Spin is a single battle action even with multiple types of energy',()=>{
 const b=match(74);b.phase='battle';b.activeSide='player';b.sides.player.active=core.makePokemonSlot('base1-4',0,'charizard');b.sides.player.active.energy={Fire:4,Water:2};
 const options=core.attackOptions(b,'player').filter(x=>x.attack?.name==='Fire Spin');
 assert.equal(options.length,1,'printed Charizard has only one Fire Spin');
 const actions=core.legalActions(b,'player').filter(a=>a.type==='attack'&&a.attackCardId==='base1-4');
 assert.equal(actions.length,1,'discarding energy should not create multiple Fire Spin buttons');
 b.sides.opponent.active=core.makePokemonSlot('base1-3',0,'cpu-chansey');
 core.applyAction(b,'player',actions[0]);
 assert.equal(b.sides.player.active.energy.Fire,2,'Fire Spin still discards two Energy units');
 assert.ok(b.log.some(x=>x.type==='attack'&&x.attack==='Fire Spin'&&x.damage===100));
});
