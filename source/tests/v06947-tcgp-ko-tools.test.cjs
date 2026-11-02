const test=require('node:test');const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/tcgp-battle-core.js');const D=require('../app/src/main/assets/tcgp-battle-data.js');
function b(seed=1){const x=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed,firstSide:'player'});x.phase='battle';x.activeSide='player';x.turnNumber=5;x.sides.player.turnCount=3;x.sides.opponent.turnCount=3;x.sides.player.hand=[];x.sides.opponent.hand=[];return x;}
test('Rocky Helmet retaliates when attached Active is damaged',()=>{
 assert.equal(D.cardById('A2-148').battleEnabled,true);
 const x=b();x.activeSide='opponent';x.sides.opponent.active=C.makePokemonSlot('A1-001',1,'atk');x.sides.opponent.active.energy={Grass:1,Colorless:1};x.sides.player.active=C.makePokemonSlot('A1-003',1,'def');x.sides.player.active.tool={uid:'t',cardId:'A2-148'};
 const a=C.legalActions(x,'opponent').find(v=>v.type==='attack');assert.ok(a);C.applyAction(x,'opponent',a);assert.equal(x.sides.opponent.active.damage,20);
});
test('Leftovers heals attached Active at end of its owners turn',()=>{
 assert.equal(D.cardById('A3b-067').battleEnabled,true);
 const x=b();x.sides.player.active=C.makePokemonSlot('A1-003',1,'def');x.sides.player.active.damage=40;x.sides.player.active.tool={uid:'l',cardId:'A3b-067'};C.endTurn(x);assert.equal(x.sides.player.active.damage,30);
});
test('Conkeldurr can survive lethal attack at 10 HP on heads',()=>{
 assert.equal(D.cardById('A3-096').battleEnabled,true);
 const x=b(1);x.activeSide='opponent';x.rngState=1;x.sides.player.active=C.makePokemonSlot('A3-096',1,'conk');x.sides.player.active.damage=130;x.sides.opponent.active=C.makePokemonSlot('A1-001',1,'atk');x.sides.opponent.active.energy={Grass:1,Colorless:1};const max=C.maxHp(x,'player',x.sides.player.active);assert.equal(max,150);const a=C.legalActions(x,'opponent').find(v=>v.type==='attack');C.applyAction(x,'opponent',a);assert.equal(x.sides.player.active?.cardId,'A3-096');assert.equal(max-x.sides.player.active.damage,10);
});
test('Rescue Scarf returns the Knocked Out Pokemon card to hand but still awards points',()=>{
 assert.equal(D.cardById('A4-155').battleEnabled,true);
 const x=b();x.activeSide='opponent';x.sides.player.active=C.makePokemonSlot('A1-003',1,'def');x.sides.player.active.damage=120;x.sides.player.active.tool={uid:'rs',cardId:'A4-155'};x.sides.opponent.active=C.makePokemonSlot('A1-001',1,'atk');x.sides.opponent.active.energy={Grass:1,Colorless:1};
 const a=C.legalActions(x,'opponent').find(v=>v.type==='attack');C.applyAction(x,'opponent',a);assert.ok(x.sides.player.hand.some(r=>r.cardId==='A1-003'));assert.equal(x.sides.opponent.points,1);assert.ok(x.sides.player.discard.some(r=>r.cardId==='A4-155'));
});
test('Claydol prevents healing on both sides',()=>{
 assert.equal(D.cardById('A3a-031').battleEnabled,true);
 const x=b();x.sides.player.active=C.makePokemonSlot('A3a-031',1,'clay');x.sides.player.active.damage=20;x.sides.opponent.active=C.makePokemonSlot('A1-003',1,'opp');x.sides.opponent.active.damage=20;
 const E=require('../app/src/main/assets/tcgp-battle-effects.js');const ctx={state:x,side:'player',foeSide:'opponent',attacker:x.sides.player.active,defender:x.sides.opponent.active,action:{},cardById:D.cardById,random:()=>0.9,shuffle:()=>{}};
 E.applyEffect({type:'heal',target:'selfActive',amount:20},ctx);E.applyEffect({type:'heal',target:'opponentActive',amount:20},ctx);assert.equal(x.sides.player.active.damage,20);assert.equal(x.sides.opponent.active.damage,20);
});
test('Bastiodon coin damage guard reduces attack damage by 100 on heads',()=>{
 assert.equal(D.cardById('A2-114').battleEnabled,true);
 const x=b(1);x.activeSide='opponent';x.rngState=1;x.sides.player.active=C.makePokemonSlot('A2-114',1,'bast');x.sides.opponent.active=C.makePokemonSlot('A1-123',1,'atk');x.sides.opponent.active.energy={Psychic:3};
 const attack=C.legalActions(x,'opponent').find(v=>v.type==='attack');C.applyAction(x,'opponent',attack);assert.equal(x.sides.player.active.damage,0);
});
test('Team Rocket Kecleon reveals only one random opponent hand card',()=>{
 assert.equal(D.cardById('B4a-062').battleEnabled,true);
 const x=b();x.sides.opponent.hand=[{uid:'h1',cardId:'A1-001'},{uid:'h2',cardId:'A1-002'},{uid:'h3',cardId:'A1-003'}];
 const E=require('../app/src/main/assets/tcgp-battle-effects.js');
 E.applyEffect({type:'revealHand',side:'opponent',random:1},{state:x,side:'player',foeSide:'opponent',attacker:x.sides.player.active,defender:x.sides.opponent.active,action:{},cardById:D.cardById,random:()=>0.6,shuffle:()=>{}});
 const reveal=x.log.filter(e=>e.type==='revealHand').at(-1);assert.equal(reveal.cards.length,1);assert.equal(reveal.cards[0],'A1-002');
});
test('Metal Scrum does not stack with a second Melmetal',()=>{
 assert.equal(D.cardById('C1-097').battleEnabled,true);
 const x=b();x.sides.player.active=C.makePokemonSlot('B4-114',1,'metal');x.sides.player.bench=[C.makePokemonSlot('C1-097',1,'m1'),C.makePokemonSlot('C1-097',1,'m2')];
 const E=require('../app/src/main/assets/tcgp-battle-effects.js');assert.equal(E.modifierAmount(x,'player',x.sides.player.active,'damageReduction',D.cardById),20);
});
