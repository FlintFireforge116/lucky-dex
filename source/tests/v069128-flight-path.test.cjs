'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const C=require(path.join(A,'tcgp-battle-core.js'));
const D=require(path.join(A,'tcg-classic-battle-data.js'));
const X=require(path.join(A,'tcgp-battle-effects.js'));
const O=require(path.join(A,'tcg-classic-opponents.js'));
function battle(){
  const deck=O.generate({sets:['SNAPFOUNJA'],type:'Grass',seed:64});
  assert.equal(deck.ok,true);
  const s=C.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Colorless','Grass','Psychic'],opponentEnergyTypes:['Grass'],seed:44,firstSide:'player'});
  s.phase='battle';s.activeSide='player';s.turnNumber=3;
  s.sides.player.turnCount=2;s.sides.opponent.turnCount=2;
  s.sides.player.bench=[];s.sides.opponent.bench=[];
  return s;
}
function put(s,side,id,bench){
  const ss=s.sides[side],slot=C.makePokemonSlot(id,1,`${side}-${id}-${bench?'bench':'active'}-${ss.bench.length}`);
  if(bench){slot.benchSlot=ss.bench.length;ss.bench.push(slot);} else ss.active=slot;
  return slot;
}
function setup(){
  const s=battle(),yan=put(s,'player','SNAPFOUNJA-065'),opp=put(s,'opponent','SNAPFOUNJA-055');
  yan.energy.Colorless=2;
  return {s,yan,opp};
}
function flight(s){return C.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);}

test('Flight Path cannot be played when there is no eligible Bench attack',()=>{
  const {s}=setup();
  assert.equal(flight(s).length,0,'No Bench target should disable the attack');
  put(s,'player','SNAPFOUNJA-063',true); // 3- and 4-Energy moves; Jungle Call is 1 Energy
  assert.ok(flight(s).some(a=>a.choiceLabel.includes('Jungle Call')));
  s.sides.player.bench=[];
  put(s,'player','SNAPFOUNJA-047',true); // Submerge is 1; Muddy Water is 3
  assert.ok(flight(s).every(a=>!a.choiceLabel.includes('Muddy Water')));
});

test('Flight Path offers each eligible Bench attack with a readable distinct choice',()=>{
  const {s}=setup();
  const bench=put(s,'player','SNAPFOUNJA-068',true);
  const actions=flight(s);
  assert.equal(actions.length,2);
  assert.ok(actions.every(a=>a.effectSelection.startsWith(bench.uid+'|')));
  assert.ok(actions.some(a=>a.choiceLabel.includes('Flap')&&a.choiceLabel.includes('Pikipek')));
  assert.ok(actions.some(a=>a.choiceLabel.includes('Fruit Fling')));
});

test('Flight Path copies damage through normal attack resolution, then swaps Yanmega with chosen Pokémon',()=>{
  const {s,yan,opp}=setup();
  const bench=put(s,'player','SNAPFOUNJA-068',true);
  const first=flight(s).find(a=>a.effectSelection===bench.uid+'|0');
  assert.ok(first);
  C.applyAction(s,'player',first);
  assert.equal(opp.damage,10);
  assert.equal(s.sides.player.active.uid,bench.uid);
  assert.equal(s.sides.player.bench[0].uid,yan.uid);
  assert.equal(yan.energy.Colorless,2,'Yanmega retains its attached Energy after switching');
  assert.ok(s.log.some(e=>e.rule==='flightPathSwitch'&&e.copied==='Flap'));
});

test('Flight Path uses the copied attack\'s printed damage and not just Flight Path\'s zero',()=>{
  const {s,opp}=setup();
  const bench=put(s,'player','SNAPFOUNJA-068',true);
  const second=flight(s).find(a=>a.effectSelection===bench.uid+'|1');
  C.applyAction(s,'player',second);
  assert.equal(opp.damage,30);
});

test('Flight Path resolves copied status attacks before switching',()=>{
  const {s,yan,opp}=setup();
  const bench=put(s,'player','SNAPFOUNJA-041',true); // Soporific Spore: both Active Pokémon sleep
  const choices=flight(s);
  assert.equal(choices.length,1);
  C.applyAction(s,'player',choices[0]);
  assert.ok(opp.conditions.sleep,'opposing Active is Asleep');
  assert.ok(s.log.some(e=>e.type==='status'&&e.status==='sleep'&&e.affectedBySide?.player===1),
    'Yanmega must receive the copied sleep effect before the end-of-turn recovery flip');
  assert.equal(s.sides.player.active.uid,bench.uid);
});

test('New Founja choice wiring allows legal targeting, optional Tool bonuses and Mach Dart restrictions',()=>{
  const {s}=setup();
  const yan=s.sides.player.active;
  const ctx=(action={},attacker=yan)=>({...C.effectContext(s,'player',action,attacker),isAttack:true});
  assert.equal(X.choicesForEffect({type:'lentalRule',rule:'founja:sonicBreak'},ctx()).length,1);
  assert.equal(X.choicesForEffect({type:'lentalRule',rule:'founja:machDart'},ctx()).length,0);
  yan.movedToActiveTurn=s.turnNumber;
  assert.equal(X.choicesForEffect({type:'lentalRule',rule:'founja:machDart'},ctx()).length,1);
  const falling=X.choicesForEffect({type:'lentalRule',rule:'founja:fallingStar'},ctx());
  assert.equal(falling.length,1);
  assert.equal(falling[0].choiceLabel,'Keep Tool');
});

test('Copied Flight Path damage respects defender protection (no direct damage bypass)',()=>{
  const {s,yan,opp}=setup();
  const bench=put(s,'player','SNAPFOUNJA-068',true);
  opp.attackGuard={type:'preventDamage',duration:'opponentTurn',expiresTurn:s.turnNumber+1};
  const chosen=flight(s).find(a=>a.effectSelection===bench.uid+'|0');
  C.applyAction(s,'player',chosen);
  assert.equal(opp.damage,0,'the attack is prevented by the guard');
  assert.equal(s.sides.player.active.uid,bench.uid,'Yanmega still switches');
  assert.equal(s.sides.player.bench[0].uid,yan.uid);
});

test('Flight Path offers copied optional Tool choices and honours the selected bonus',()=>{
  const {s,yan,opp}=setup();
  const ledian=put(s,'player','SNAPFOUNJA-056',true);
  yan.tool={uid:'yanmega-tool',cardId:'SNAPFOUNJA-084'};
  const actions=flight(s).filter(a=>a.effectSelection===ledian.uid+'|0');
  assert.equal(actions.length,2,'Keep and discard Tool should be separate selectable choices');
  const discard=actions.find(a=>a.copiedEffectSelection==='tool');
  assert.ok(discard);
  C.applyAction(s,'player',discard);
  assert.equal(opp.damage,100,'30 base +70 for discarding attached Tool');
  assert.equal(yan.tool,null);
  assert.ok(s.sides.player.discard.some(x=>x.uid==='yanmega-tool'));
  assert.equal(s.sides.player.active.uid,ledian.uid);
});

test('Flight Path can copy an attack which selects an opponent Bench target',()=>{
  const {s,opp}=setup();
  const copier=put(s,'player','SNAPFOUNJA-014',true); // Sonic Break 60 to chosen Pokémon
  const benchTarget=put(s,'opponent','SNAPFOUNJA-068',true);
  const choices=flight(s).filter(a=>a.effectSelection===copier.uid+'|0');
  assert.equal(choices.length,2);
  const action=choices.find(a=>a.target==='opponentBench'&&a.benchIndex===benchTarget.benchSlot);
  assert.ok(action);
  C.applyAction(s,'player',action);
  assert.equal(opp.damage,0);
  assert.equal(benchTarget.damage,60);
  assert.equal(s.sides.player.active.uid,copier.uid);
});

test('Flight Path waits for the copied attack\'s deferred opponent choice before switching',()=>{
  const {s,yan}=setup();
  const arbok=put(s,'player','SNAPFOUNJA-049',true);
  const opposingBench=put(s,'opponent','SNAPFOUNJA-068',true);
  const chosen=flight(s).find(a=>a.effectSelection===arbok.uid+'|0'); // Hiss
  assert.ok(chosen);
  C.applyAction(s,'player',chosen);
  assert.equal(s.phase,'effectChoice');
  assert.equal(s.choiceSide,'opponent');
  assert.equal(s.sides.player.active.uid,yan.uid,'switch waits for the opponent\'s choice');
  const choice=C.legalActions(s,'opponent').find(a=>a.type==='effectChoice'&&a.choiceCardId===opposingBench.cardId);
  assert.ok(choice);
  C.applyAction(s,'opponent',choice);
  assert.equal(s.sides.opponent.active.uid,opposingBench.uid);
  assert.ok(s.sides.opponent.active.conditions.paralysis);
  assert.equal(s.sides.player.active.uid,arbok.uid,'Yanmega switches after the copied effect');
});
