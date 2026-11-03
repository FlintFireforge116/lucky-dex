'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const dir=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(dir,'tcgp-battle-core.js'));
const classic=require(path.join(dir,'tcg-classic-battle-data.js'));
const decks=require(path.join(dir,'tcg-classic-decks.js'));
const builder=require(path.join(dir,'tcg-classic-deck-builder.js'));
const ui=require(path.join(dir,'tcgp-battle-ui.js'));
function match(seed=69){return core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:decks.LOANER_DECK.slice(),playerEnergyTypes:['Fire','Fighting'],opponentEnergyTypes:['Fire','Fighting'],seed,firstSide:'opponent'});}
test('Classic hybrid continues instead of losing when the draw pile is empty and Pokémon remain',()=>{
 const b=match();b.phase='battle';b.activeSide='opponent';b.turnNumber=16;b.sides.player.deck=[];b.sides.player.prizesTaken=2;
 b.sides.player.active=core.makePokemonSlot('base1-4',0,'charizard');
 b.sides.player.bench=[core.makePokemonSlot('base1-3',0,'chansey')];b.sides.player.bench[0].benchSlot=0;
 core.applyAction(b,'opponent',core.legalActions(b,'opponent').find(a=>a.type==='endTurn'));
 assert.equal(b.phase,'battle','player should receive a normal turn');assert.equal(b.activeSide,'player');assert.equal(b.winner,null);assert.equal(b.sides.player.prizesTaken,2);assert.equal(b.sides.player.deck.length,0);
 assert.ok(core.legalActions(b,'player').some(a=>a.type==='endTurn'),'player still has legal moves');
 assert.ok(b.log.some(item=>item.type==='drawSkipped'&&item.side==='player'&&item.reason==='empty-deck'),'log records a skipped draw');
});
test('Pocket empty-deck behavior stays unchanged',()=>{
 const cards=Array.from({length:20},()=> 'A1-001');
 const b=core.createBattle({format:'pocket',playerDeck:cards,opponentDeck:cards,playerEnergyTypes:['Grass'],opponentEnergyTypes:['Grass'],firstSide:'opponent',seed:69});
 b.sides.player.deck=[];b.phase='battle';b.activeSide='opponent';b.turnNumber=10;
 core.applyAction(b,'opponent',core.legalActions(b,'opponent').find(a=>a.type==='endTurn'));
 assert.equal(b.phase,'battle');assert.equal(b.winner,null);assert.equal(b.activeSide,'player');
});
test('Classic auto-build limits aggressive deck-draw support while retaining a complete legal deck',()=>{
 const rows=classic.CARDS.filter(c=>c.battleEnabled&&!c.basicEnergy).map(c=>({gameplayId:c.id,quantity:4}));
 const result=builder.buildDeck(rows,{style:'competitive',focusCardId:'base1-4'});
 assert.equal(result.ok,true,result.errors?.join('; '));assert.equal(result.cards.length,30);
 const count=id=>result.cards.filter(x=>x===id).length;
 assert.ok(count('base1-91')<=2,'avoid four Bills in 30-card deck');
 assert.ok(count('base1-88')<=1,'avoid three Professor Oaks in 30-card deck');
 assert.ok(count('base1-71')<=1,'avoid overloading Computer Search');
 assert.ok(count('base1-4')>0&&count('base1-24')>0&&count('base1-46')>0,'Charizard retains its full line');
 assert.ok(classic.validateDeck(result.cards).ok,'deck is legal');
});

test('Classic has longer turn safety limit; a 2–0 lead at 50 turns does not become an automatic CPU victory',()=>{
 const b=match(70);b.phase='battle';b.activeSide='opponent';b.turnNumber=50;b.sides.player.prizesTaken=2;b.sides.opponent.prizesTaken=0;
 core.applyAction(b,'opponent',core.legalActions(b,'opponent').find(a=>a.type==='endTurn'));
 assert.equal(b.phase,'battle');assert.equal(b.winner,null);assert.equal(b.turnNumber,51);
});
test('Classic safety timeout is decided by Prize lead, never always awarded to the CPU',()=>{
 for(const [ours,theirs,expected] of [[2,0,'player'],[0,2,'opponent'],[2,2,'draw']]){
  const b=match(71);b.phase='battle';b.activeSide='opponent';b.turnNumber=100;b.sides.player.prizesTaken=ours;b.sides.opponent.prizesTaken=theirs;
  core.applyAction(b,'opponent',core.legalActions(b,'opponent').find(a=>a.type==='endTurn'));
  assert.equal(b.phase,'finished');assert.equal(b.winner,expected);assert.equal(b.reason,'turn-limit');
  assert.match(ui.resultSummary(b).message,/100|Prize/i);
 }
});
