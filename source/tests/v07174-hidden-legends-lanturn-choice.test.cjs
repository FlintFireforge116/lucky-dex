'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const ui=require(path.join(A,'tcgp-battle-ui.js'));
const cards=require(path.join(A,'tcg-classic-battle-data.js'));
let seedDeck;
function build(){
  if(!seedDeck)seedDeck=opponents.generate({sets:['ex5'],seed:21}).cards;
  const s=core.createBattle({format:'classic',playerDeck:seedDeck,opponentDeck:seedDeck,seed:7,firstSide:'player',playerEnergyTypes:['Lightning'],opponentEnergyTypes:['Metal']});
  s.phase='battle';s.activeSide='player';s.turnNumber=13;
  s.sides.player.turnCount=7;s.sides.opponent.turnCount=6;
  s.sides.player.active=core.makePokemonSlot('ex5-38',3,'lanturn');
  s.sides.player.active.energy={Lightning:3};
  s.sides.opponent.active=core.makePokemonSlot('ex5-95',3,'target');
  s.sides.opponent.active.energy={Metal:3};
  return s;
}
function attacks(s){return core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);}
test('Hidden Legends Lightning Strike shows distinct 50 and 90 damage choices on the battle screen',()=>{
  const s=build(),actions=attacks(s);
  assert.equal(actions.length,2);
  assert.equal(actions[0].effectSelection,'');assert.equal(actions[1].effectSelection,'discard');
  assert.match(ui.actionLabel(actions[0],s,'player'),/50 damage.*keep Lightning Energy/i);
  assert.match(ui.actionLabel(actions[1],s,'player'),/90 damage.*discard Lightning Energy/i);
  assert.notEqual(ui.actionLabel(actions[0],s,'player'),ui.actionLabel(actions[1],s,'player'));
});
test('discard option deals 90 damage BEFORE consuming Energy; no permanent 90 boost afterward',()=>{
  const s=build();
  core.applyAction(s,'player',attacks(s).find(a=>a.effectSelection==='discard'));
  assert.equal(s.sides.opponent.active.damage,90,'damage remains 90 despite removal of Energy');
  assert.equal(s.sides.player.active.energy.Lightning,0);
  assert.equal(s.sides.player.energyDiscard.Lightning,3);
  assert.equal(s.log.findLast(e=>e.type==='attack')?.damage,90);
  // Restore energy, representing a subsequent eligible turn. The same Lanturn
  // offers its normal 50 damage alongside a fresh optional discard for 90.
  s.sides.player.active.energy.Lightning=3;
  s.phase='battle';s.activeSide='player';s.sides.player.attacked=false;s.sides.player.turnCount++;
  assert.match(ui.actionLabel(attacks(s).find(a=>a.effectSelection===''),s,'player'),/50 damage/i);
});
test('keep option deals 50 and retains Energy for future attacks',()=>{
  const s=build();core.applyAction(s,'player',attacks(s).find(a=>a.effectSelection===''));
  assert.equal(s.sides.opponent.active.damage,50);
  assert.equal(s.sides.player.active.energy.Lightning,3);
  assert.equal(s.sides.player.energyDiscard.Lightning||0,0);
});
test('Hidden Legends original attack text and visible app version remain consistent',()=>{
  assert.match(cards.cardById('ex5-38').attacks[0].text,/base damage is 90 instead of 50/);
  const version=fs.readFileSync(path.join(A,'../../../build.gradle'),'utf8').match(/versionName '([^']+)'/)?.[1];
  assert.ok(version);
  assert.ok(fs.readFileSync(path.join(A,'index.html'),'utf8').includes('v'+version));
  assert.ok(fs.readFileSync(path.join(A,'app-v0167.js'),'utf8').includes(`__LUCKYDEX_BUILD='${version}'`));
});
