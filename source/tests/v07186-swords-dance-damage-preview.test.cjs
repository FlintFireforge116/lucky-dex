'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const ASSETS=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(ASSETS,'tcgp-battle-core.js'));
const classic=require(path.join(ASSETS,'tcg-classic-battle-data.js'));
const opponent=require(path.join(ASSETS,'tcg-classic-opponents.js'));
const cpuDeck=opponent.generate({sets:['ex8'],seed:29});
assert.ok(cpuDeck.ok,cpuDeck.error);

function ready(id,side='player',defender='ex8-15'){
  const state=core.createBattle({format:'classic',playerDeck:cpuDeck.cards,opponentDeck:cpuDeck.cards,
    seed:29,firstSide:'player',playerEnergyTypes:['Grass','Water'],opponentEnergyTypes:['Grass']});
  state.phase='battle';state.activeSide=side;state.turnNumber=9;
  state.sides.player.turnCount=5;state.sides.opponent.turnCount=4;
  state.sides[side].active=core.makePokemonSlot(id,2,'own');
  state.sides[side].active.energy={Grass:4,Water:2,Colorless:2};
  const foeSide=side==='player'?'opponent':'player';
  state.sides[foeSide].active=core.makePokemonSlot(defender,2,'foe');
  state.sides[foeSide].active.energy={Water:3};
  return state;
}
function use(state,side,index){
  const action=core.legalActions(state,side).find(a=>a.type==='attack'&&a.attackIndex===index);
  assert.ok(action,`Attack ${index} should be legal for ${state.sides[side].active?.cardId}`);
  core.applyAction(state,side,action);
}
function nextTurn(state,side){
  const foe=side==='player'?'opponent':'player';
  assert.equal(state.activeSide,foe);
  const end=core.legalActions(state,foe).find(a=>a.type==='endTurn');
  assert.ok(end,'Opponent can end their turn');
  core.applyAction(state,foe,end);
  assert.equal(state.activeSide,side);
  assert.equal(state.phase,'battle');
}
function lastAttack(state){return state.log.filter(x=>x.type==='attack').at(-1);}

for(const [id,expected] of [['ex8-13',80],['base2-10',60],['base2-26',60],['ex2-52',90]]){
  test(`${id} Swords Dance / Focus Energy: Slash shows ${expected} and actually deals ${expected} next turn`,()=>{
    const state=ready(id),source=state.sides.player.active;
    assert.equal(classic.cardById(id).attacks[1].name,'Slash');
    assert.equal(core.attackDamagePreview(state,'player',1).damage,Number(classic.cardById(id).attacks[1].damage));
    use(state,'player',0);
    nextTurn(state,'player');
    const beforeState=JSON.stringify(state);
    assert.deepEqual(core.attackDamagePreview(state,'player',1),{damage:expected,text:String(expected),variable:false});
    assert.equal(JSON.stringify(state),beforeState,'Inspection must not change the board or consume the boost');
    use(state,'player',1);
    assert.equal(lastAttack(state).damage,expected,'Damage log must match the visible preview');
    assert.equal(state.sides.opponent.active.damage,expected,'Damage must change HP, not merely the displayed number');
    assert.equal(source.uid,'own');
  });
}
test('EX Deoxys Ninjask boosts Slash BASE damage before applying Weakness',()=>{
  const s=ready('ex8-13','player','ex8-28');
  assert.equal(classic.cardById('ex8-28').weakness,'Grass');
  use(s,'player',0);nextTurn(s,'player');
  assert.equal(core.attackDamagePreview(s,'player',1).damage,80);
  use(s,'player',1);
  assert.equal(lastAttack(s).damage,160,'80 base is doubled for Grass weakness');
});
test('EX Deoxys Ninjask bonus expires if the next player turn passes without Slash',()=>{
  const s=ready('ex8-13');
  use(s,'player',0);nextTurn(s,'player');
  assert.equal(core.attackDamagePreview(s,'player',1).damage,80);
  const skip=core.legalActions(s,'player').find(a=>a.type==='endTurn');assert.ok(skip);
  core.applyAction(s,'player',skip);nextTurn(s,'player');
  assert.equal(core.attackDamagePreview(s,'player',1).damage,30);
  use(s,'player',1);assert.equal(lastAttack(s).damage,30);
});
test('Both sides honour next-turn Swords Dance or Focus Energy using their own Active Pokémon',()=>{
  const s=ready('base2-10','opponent');
  use(s,'opponent',0);nextTurn(s,'opponent');
  assert.equal(core.attackDamagePreview(s,'opponent',1).damage,60);
  use(s,'opponent',1);
  assert.equal(lastAttack(s).damage,60);
  assert.equal(s.sides.player.active.damage,60);
});
