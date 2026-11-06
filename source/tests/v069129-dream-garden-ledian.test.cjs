'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const C=require(path.join(A,'tcgp-battle-core.js'));
const D=require(path.join(A,'tcg-classic-battle-data.js'));
const O=require(path.join(A,'tcg-classic-opponents.js'));
function battle(){
  const deck=O.generate({sets:['SNAPFOUNJA'],type:'Grass',seed:64});
  assert.equal(deck.ok,true);
  const s=C.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Grass'],opponentEnergyTypes:['Water'],seed:44,firstSide:'player'});
  s.phase='battle';s.activeSide='player';s.turnNumber=3;
  s.sides.player.turnCount=2;s.sides.opponent.turnCount=2;
  s.sides.player.bench=[];s.sides.opponent.bench=[];
  return s;
}
function put(s,side,id,bench=false){
  const ss=s.sides[side],slot=C.makePokemonSlot(id,1,`${side}-${id}-${bench?'bench':'active'}-${ss.bench.length}`);
  if(bench){slot.benchSlot=ss.bench.length;ss.bench.push(slot);}else ss.active=slot;
  return slot;
}
function rngStateFor(heads){
  for(let n=1;n<100000;n++)if((C.random({rngState:n})<.5)===heads)return n;
  throw Error('no suitable seed');
}
function fixGarden(s){s.stadium={uid:'garden-stadium',cardId:'SNAPFLORIO-109',ownerSide:'player'};}
function gardenFixture(){const s=battle();put(s,'player','SNAPFOUNJA-068');put(s,'opponent','SNAPFOUNJA-068');fixGarden(s);return s;}

test('Dream Garden flips at start of opposing turn and tails sends their Active to Sleep',()=>{
  const s=gardenFixture();s.rngState=rngStateFor(false);
  C.endTurn(s);
  assert.equal(s.activeSide,'opponent');
  const flip=s.log.findLast(x=>x.type==='coin'&&x.reason==='Dream Garden');
  assert.ok(flip);assert.equal(flip.side,'opponent');assert.equal(flip.heads,false);
  assert.equal(s.sides.opponent.active.conditions.sleep,true);
  assert.ok(s.log.some(x=>x.type==='status'&&x.reason==='Dream Garden'&&x.side==='opponent'));
});

test('Dream Garden heads leaves the new Active Pokémon awake',()=>{
  const s=gardenFixture();s.rngState=rngStateFor(true);
  C.endTurn(s);
  const flip=s.log.findLast(x=>x.type==='coin'&&x.reason==='Dream Garden');
  assert.equal(flip.heads,true);assert.ok(!s.sides.opponent.active.conditions?.sleep);
});

test('Dream Garden flips on either player turn, only while that Stadium is in play',()=>{
  const s=gardenFixture();s.rngState=rngStateFor(false);C.endTurn(s);
  assert.equal(s.sides.opponent.active.conditions.sleep,true);
  // Removing sleep before the test prevents its normal recovery flip from
  // consuming the deterministic random stream.
  delete s.sides.opponent.active.conditions.sleep;
  s.rngState=rngStateFor(false);C.endTurn(s);
  assert.equal(s.activeSide,'player');
  assert.equal(s.sides.player.active.conditions.sleep,true);
  assert.deepEqual(s.log.filter(x=>x.type==='coin'&&x.reason==='Dream Garden').map(x=>x.side),['opponent','player']);
  s.stadium={uid:'replacement',cardId:'SNAPFOUNJA-080',ownerSide:'opponent'};
  delete s.sides.player.active.conditions.sleep;
  const before=s.log.filter(x=>x.type==='coin'&&x.reason==='Dream Garden').length;
  C.endTurn(s);
  assert.equal(s.log.filter(x=>x.type==='coin'&&x.reason==='Dream Garden').length,before);
});

test('Dream Garden does not impose any extra Sleep recovery coins',()=>{
  const s=gardenFixture();s.sides.player.active.conditions.sleep=true;
  s.rngState=rngStateFor(true);
  C.endTurn(s);
  const check=s.log.find(x=>x.type==='sleepCheck'&&x.side==='player');
  assert.ok(check);assert.equal(check.coins,1);
});

function sporeFixture(energies){
  const s=battle(),ledian=put(s,'player','SNAPFOUNJA-010'),defender=put(s,'opponent','SNAPFOUNJA-055');
  ledian.energy.Grass=2;ledian.energy.Colorless=1;
  defender.energy.Water=energies;
  return {s,ledian,defender};
}
test('Ledian ex preview shows the possible range without rolling coins or changing RNG',()=>{
  const {s}=sporeFixture(3);const old=s.rngState,oldLog=s.log.length;
  const preview=C.attackDamagePreview(s,'player',1);
  assert.deepEqual(preview,{damage:40,text:'40–160',variable:true});
  assert.equal(s.rngState,old);assert.equal(s.log.length,oldLog);
});

test('Spore Storm damage is exactly 40 + 40 per HEAD; multiple seeds produce different damage',()=>{
  const outcomes=new Set();
  for(let n=1;n<=30;n++){
    const {s,defender}=sporeFixture(3);
    s.rngState=n*48137;
    const act=C.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);
    assert.ok(act,'Spore Storm is offered with the correct Energy');
    C.applyAction(s,'player',act);
    const flip=s.log.findLast(x=>x.type==='coin'&&x.reason==='Founja sporeStorm');
    const attack=s.log.findLast(x=>x.type==='attack'&&x.attack==='Spore Storm');
    assert.ok(flip);assert.ok(attack);
    assert.equal(flip.results.length,3);
    const heads=flip.results.filter(Boolean).length;
    const amount=40+40*heads;
    assert.equal(attack.damage,amount,`seed ${n}: ${heads} heads must deal ${amount}`);
    assert.equal(defender.damage,amount);
    outcomes.add(amount);
  }
  assert.ok(outcomes.size>=3,`expected a range of damage values, found ${[...outcomes]}`);
});

test('Spore Storm includes opposing Bench Energy and counts Special Energy as one card',()=>{
  const {s}=sporeFixture(1);const bench=put(s,'opponent','SNAPFOUNJA-068',true);
  bench.energy.Water=1;bench.specialEnergy=[{uid:'special',cardId:'neo1-105'}];
  const preview=C.attackDamagePreview(s,'player',1);
  assert.equal(preview.text,'40–160');
  const action=C.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);
  C.applyAction(s,'player',action);
  const coin=s.log.findLast(x=>x.type==='coin'&&x.reason==='Founja sporeStorm');
  assert.equal(coin.results.length,3);
});

test('Spore Storm deals only its printed 40 base damage when no opposing Energy is attached',()=>{
  const {s,defender}=sporeFixture(0);
  assert.deepEqual(C.attackDamagePreview(s,'player',1),{damage:40,text:'40',variable:false});
  const action=C.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);
  C.applyAction(s,'player',action);
  assert.equal(defender.damage,40);
});

test('Playing Dream Garden does not instantly cause Sleep; the next player turn starts its flip',()=>{
  const s=battle();put(s,'player','SNAPFOUNJA-068');put(s,'opponent','SNAPFOUNJA-068');
  s.sides.player.hand.push({uid:'dream-garden-hand',cardId:'SNAPFLORIO-109'});
  const play=C.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='SNAPFLORIO-109');
  assert.ok(play,'Stadium can be played normally');
  C.applyAction(s,'player',play);
  assert.equal(s.stadium.cardId,'SNAPFLORIO-109');
  assert.ok(!s.sides.player.active.conditions.sleep);
  assert.ok(!s.log.some(e=>e.reason==='Dream Garden'));
  s.rngState=rngStateFor(false);C.endTurn(s);
  assert.equal(s.sides.opponent.active.conditions.sleep,true);
});

test('Visible event messaging identifies Dream Garden Tails and Heads',()=>{
  const ui=require(path.join(A,'tcgp-battle-ui.js'));
  assert.match(ui.actionEventText({type:'coin',reason:'Dream Garden',heads:false,side:'player'}),/TAILS.*Asleep/);
  assert.match(ui.actionEventText({type:'coin',reason:'Dream Garden',heads:true,side:'opponent'}),/HEADS.*no new Sleep/);
});
