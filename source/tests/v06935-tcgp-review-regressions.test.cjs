const test=require('node:test'),assert=require('node:assert/strict'),D=require('../app/src/main/assets/tcgp-battle-data.js'),K=require('../app/src/main/assets/tcgp-battle-decks.js'),C=require('../app/src/main/assets/tcgp-battle-core.js');
test('Mismagius Stored Power deals its ordinary damage even when no Bench can receive optional Energy movement',()=>{
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:6});b.activeSide='player';b.turnNumber=5;const p=b.sides.player;p.turnCount=3;p.active=C.makePokemonSlot('B1a-031',0,'mismagius');p.active.energy={Psychic:2};p.bench=[];b.sides.opponent.active=C.makePokemonSlot('A1-001',0,'bulba');
 const action=C.legalActions(b,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(action,'a no-op secondary movement must not prevent the damage attack');C.applyAction(b,'player',action);assert.equal(b.sides.opponent.active.damage,60);assert.equal(p.active.energy.Psychic,2);
});
test('generic Trainer focus builds around an owned Grass archetype rather than forcing Water',()=>{
 const rows=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind==='pokemon'&&c.stage==='Basic'&&c.attacks.every(a=>a.cost.includes('G')&&/^[GC]+$/.test(a.cost))).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true}));rows.push({gameplayId:'A1-223',quantity:2,battleEnabled:true});assert.equal(K.buildQuickDeck(rows).ok,true);
 const r=K.buildQuickDeck(rows,{cardId:'A1-223'});assert.equal(r.ok,true,r.errors.join(' '));assert.ok(r.cards.includes('A1-223'));assert.deepEqual(r.energyTypes,['Grass']);assert.equal(K.validateDeck(r.cards,rows).ok,true);
});
