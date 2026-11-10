'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const ui=require(path.join(A,'tcgp-battle-ui.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const deck=opponent.generate({sets:['ex8'],seed:29});assert.ok(deck.ok,deck.error);
function battle(active='ex8-20'){
  const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:29,firstSide:'player',playerEnergyTypes:['Fire','Water','Lightning'],opponentEnergyTypes:['Lightning']});
  s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=4;
  s.sides.player.active=core.makePokemonSlot(active,1,'own');s.sides.player.active.energy={Fire:3};
  s.sides.opponent.active=core.makePokemonSlot('ex8-52',1,'foe');
  return s;
}
function select(s,predicate){assert.equal(s.phase,'effectChoice');const a=core.legalActions(s,'player').find(predicate);assert.ok(a,'Expected choice');core.applyAction(s,'player',a);}
test('EX Deoxys Energy Charge shuffles discarded Basic Energy into DRAW deck (not Energy Supply)',()=>{
  const s=battle(),p=s.sides.player;
  p.hand=[{uid:'ec',cardId:'ex8-86'}];p.energyDiscard={Fire:2};
  const beforeDeck=p.deck.length,beforeSupply=p.energySupply.length;
  p.forceFirstCoinHeadTurn=s.turnNumber;
  const play=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex8-86');assert.ok(play);
  core.applyAction(s,'player',play);
  select(s,x=>x.choiceLabel?.includes('Fire'));
  select(s,x=>x.choiceLabel?.includes('Fire'));
  assert.equal(s.phase,'battle');assert.equal(p.deck.length,beforeDeck+2);assert.equal(p.energyDiscard.Fire,0);
  assert.equal(p.energySupply.length,beforeSupply);
  assert.equal(p.deck.filter(r=>r.cardId==='neo1-107'&&r.zoneGenerated===false).length,2);
  // An Energy Charge-recovered Basic Energy remains a normal deck card after
  // shuffle and can be drawn and played from hand under turn attachment rules.
  const recoveredIndex=p.deck.findIndex(r=>r.cardId==='neo1-107'&&r.zoneGenerated===false);assert.ok(recoveredIndex>=0);
  p.deck.unshift(...p.deck.splice(recoveredIndex,1));
  const drawn=core.drawCard?core.drawCard(p):p.hand.push(p.deck.shift());
  const idx=p.hand.findIndex(ref=>ref.cardId==='neo1-107');assert.ok(idx>=0);
  const attachments=core.legalActions(s,'player').filter(a=>a.type==='attachSpecial'&&a.handIndex===idx);assert.ok(attachments.length);
  core.applyAction(s,'player',attachments.find(a=>a.target==='active'));
  assert.equal(p.active.energy.Fire,4);assert.equal(p.handEnergyUsed,true);assert.equal(p.energyUsed,false);
  assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attachSpecial'&&classic.cardById(a.cardId)?.basicEnergy));
});
test('Energy Charge preserves returned Special Energy cards in draw deck',()=>{
  const s=battle(),p=s.sides.player;
  p.hand=[{uid:'ec',cardId:'ex8-86'}];p.energyDiscard={Fire:1};p.discard.push({uid:'special',cardId:'ex8-94'});
  const n=p.deck.length;p.forceFirstCoinHeadTurn=s.turnNumber;
  core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex8-86'));
  select(s,a=>a.choiceLabel?.includes('Heal Energy'));
  select(s,a=>a.choiceLabel?.includes('Fire'));
  assert.equal(p.deck.length,n+2);assert.ok(p.deck.some(ref=>ref.uid==='special'));assert.equal(p.energyDiscard.Fire,0);
});
test('Optional Magcargo Knock Over choices show distinct effects rather than identical damage labels',()=>{
  const s=battle();s.stadium={uid:'stadium',cardId:'ex8-89'};s.stadiumOwner='opponent';
  const choices=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
  assert.equal(choices.length,2);
  const labels=choices.map(a=>ui.actionLabel(a,s,'player'));
  assert.ok(labels.some(l=>l.includes('Keep Stadium')),labels.join(' | '));
  assert.ok(labels.some(l=>l.includes('Discard Stadium')),labels.join(' | '));
  assert.notEqual(labels[0],labels[1]);
  ui._test.setCurrentBattleForTests(s,choices);
  ui._test.setBattleOverlayForTests('context-actions',[0,1]);
  const markup=ui._test.liveContextActionsOverlayHtml();
  assert.match(markup,/Keep Stadium/);assert.match(markup,/Discard Stadium/);
});
