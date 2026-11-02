const test=require('node:test');
const assert=require('node:assert/strict');
const N=require('../scripts/lib/tcgp-normalize.cjs');
const E=require('../app/src/main/assets/tcgp-battle-effects.js');
const C=require('../app/src/main/assets/tcgp-battle-core.js');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const dir='../data/tcgp/import/';
const all=[...require(dir+'tcgdex-pocket-cards.json'),...require(dir+'tcgdex-A4b-cards.json'),...require(dir+'vociferix-missing-mechanics.json'),...require(dir+'current-pocket-mechanics.json')];
const raw=id=>all.find(x=>N.printId(x.id)===N.printId(id));
const norm=id=>N.normalizeMechanics(raw(id));
const FINAL=['A3-104','A3a-065','A4-045','A4-156','A4-161','A4a-018','A4a-071','P-B-049','P-B-100','B2-127','B3a-072','B4-115','B4a-051','B4a-071'];
function battle(){const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:47,firstSide:'player'});b.phase='battle';b.activeSide='player';b.turnNumber=5;b.sides.player.turnCount=3;b.sides.opponent.turnCount=3;b.sides.player.active=C.makePokemonSlot('A1-001',1,'p');b.sides.opponent.active=C.makePokemonSlot('A1-001',1,'o');b.sides.player.hand=[];b.sides.opponent.hand=[];return b;}

test('the final fourteen card identities compile fully',()=>{
 for(const id of FINAL){const c=norm(id);assert.equal(c.support.status,'FULL',`${id}: ${c.support.reasons.join(' | ')}`);}
});

test('final interaction primitives validate',()=>{
 const effects=[
  {type:'chooseDiscardForBonus',zone:'bench',max:3,amount:40,filter:{subtype:'Water'}},
  {type:'reorderTop',deckSide:'self',countPerType:'Fighting'},
  {type:'redistributeEnergy'},
  {type:'distributeDiscardEnergyDistinct',amount:3,filter:{tag:'Ancient'}},
  {type:'benchBasicsFromOpponentHand'},
  {type:'forceFirstCoinHead'},
  {type:'coinReroll',scope:'attack',filter:{subtype:'Fire'}},
  {type:'toolCapacity',amount:2},
  {type:'repeatAttack',secondDamage:40}
 ];
 for(const effect of effects)assert.deepEqual(E.validateEffect(effect),[],JSON.stringify(effect));
});

test('Will forces only the first eligible coin to heads',()=>{
 const b=battle(),ctx=C.effectContext(b,'player',{},b.sides.player.active);
 E.applyEffect({type:'forceFirstCoinHead'},ctx);
 const attack={name:'Coin test',damage:0,effect:{type:'coinDamage',coins:2,amount:10,mode:'replace'}};
 const out=E.resolveAttack(attack,{...ctx,isAttack:true,random:()=>0.99});
 assert.equal(out.damage,10);
});

test('Revavroom-style tool capacity can raise the attachment cap to two',()=>{
 const b=battle(),slot=b.sides.player.active;
 slot.syntheticToolCapacity=2;
 assert.equal(E.toolCapacity?.(b,'player',slot,D.cardById)??0,2);
});

test('Gyarados-style selected bench discards increase damage and actually discard those Pokemon',()=>{
 const b=battle(),slot=b.sides.player.active;slot.cardId='A1-003';
 const a=C.makePokemonSlot('A1-001',1,'w1'),c=C.makePokemonSlot('A1-014',1,'w2');a.benchSlot=0;c.benchSlot=1;b.sides.player.bench=[a,c];
 const attack={name:'Wild Swing',damage:20,effect:{type:'chooseDiscardForBonus',zone:'bench',max:3,amount:40,filter:{subtype:'Grass'}}};
 const choices=E.choicesForEffect(attack.effect,{...C.effectContext(b,'player',{},slot),isAttack:true,attack});
 const both=choices.find(x=>String(x.effectSelection||'').split(',').filter(Boolean).length===2);assert.ok(both);
 const out=E.resolveAttack(attack,{...C.effectContext(b,'player',both,slot),isAttack:true});
 assert.equal(out.damage,100);assert.equal(b.sides.player.bench.length,0);assert.equal(b.sides.player.discard.filter(x=>['A1-001','A1-014'].includes(x.cardId)).length,2);
});

test('top-deck reorder exposes a real effect choice rather than randomising the order',()=>{
 const b=battle();b.sides.player.deck=[{uid:'d1',cardId:'A1-001'},{uid:'d2',cardId:'A1-002'},{uid:'d3',cardId:'A1-003'}];
 E.applyEffect({type:'reorderTop',deckSide:'self',count:3},C.effectContext(b,'player'));
 assert.equal(b.phase,'effectChoice');assert.equal(b.choiceSide,'player');assert.equal(C.legalActions(b,'player').length,3);
});
