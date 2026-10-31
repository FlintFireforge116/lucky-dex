const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js'),K=require('../app/src/main/assets/tcgp-battle-decks.js'),C=require('../app/src/main/assets/tcgp-battle-core.js');
const S=require('../app/src/main/assets/tcgp-battle-solo.js');
const owned=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true}));
test('Energy recommendation follows attack costs, not Pokémon type or a default Grass choice',()=>{
 assert.equal(typeof K.analyzeDeck,'function');
 assert.deepEqual(K.analyzeDeck(['A1-083']).recommendedEnergyTypes,['Water']);
 assert.deepEqual(K.analyzeDeck(['A1-083','A1-001']).recommendedEnergyTypes,['Grass','Water']);
 assert.deepEqual(K.deckEnergyTypes({cards:['A1-083']}),['Water']);
 assert.deepEqual(K.deckEnergyTypes({cards:['A1-083'],energyTypes:['Fire']}),['Fire']);
});
test('manual legality is separate from unpowerable attackers, orphan lines and unused Energy warnings',()=>{
 assert.equal(typeof K.analyzeDeck,'function');const a=K.analyzeDeck(['A1-083','A1-002'],['Grass','Fire']);
 assert.ok(a.warnings.some(w=>w.code==='unpowerable'&&w.cardId==='A1-083'));
 assert.ok(a.warnings.some(w=>w.code==='orphan'&&w.cardId==='A1-002'));
 assert.ok(a.warnings.some(w=>w.code==='unused-energy'&&w.energyType==='Fire'));
 const r=K.validateLoanerDeck(D.BEGINNER_IVYSAUR_DECK,['Fire']);assert.equal(r.ok,true);assert.ok(r.warnings.length);
});
test('Quick Build mixed collection produces20 owned, powerable cards with complete lines and focus Articuno',()=>{
 const r=K.buildQuickDeck(owned,{cardId:'A1-083'});assert.equal(r.ok,true,JSON.stringify(r.errors));assert.equal(r.cards.length,20);assert.ok(r.cards.includes('A1-083'));assert.ok(r.energyTypes?.includes('Water'));assert.ok(K.validateDeck(r.cards,owned).ok);
 const a=K.analyzeDeck(r.cards,r.energyTypes);assert.deepEqual(a.unpowerable,[]);assert.deepEqual(a.missingEnergyTypes,[]);assert.ok(!a.warnings.some(w=>w.code==='orphan'));assert.ok(r.strategy);
 assert.deepEqual(K.buildQuickDeck(owned,{cardId:'A1-083'}),r);
});
test('type/set/mechanic test-build options focus actual owned cards and never fabricate missing copies',()=>{
 for(const options of [{type:'Water'},{setId:'A1'},{mechanic:'coinFlip'}]){const r=K.buildQuickDeck(owned,options);assert.equal(r.ok,true,JSON.stringify(r.errors));assert.ok(r.focusCardId);}
 assert.equal(K.buildQuickDeck([{gameplayId:'A1-083',quantity:1,battleEnabled:true}],{cardId:'A1-083'}).ok,false);
 assert.equal(K.buildQuickDeck(owned,{cardId:'not-a-card'}).ok,false);
 const partial=D.CARDS.find(c=>c.support?.status==='PARTIAL');assert.equal(K.buildQuickDeck(owned,{cardId:partial.id}).ok,false);
});
test('Articuno inferred Water can generate and pay Ice Beam; wrong Grass cannot; attack availability explains both',()=>{
 const deck=K.buildQuickDeck(owned,{cardId:'A1-083'});assert.ok(deck.ok);const b=C.createBattle({playerDeck:deck.cards,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:2,firstSide:'opponent'});assert.deepEqual(b.sides.player.energyTypes,['Water']);
 b.activeSide='player';b.turnNumber=4;b.sides.player.turnCount=2;b.sides.player.active=C.makePokemonSlot('A1-083',0,'articuno');b.sides.player.active.energy={Grass:3};
 assert.equal(typeof C.attackAvailability,'function');let a=C.attackAvailability(b,'player',0);assert.equal(a.usable,false);assert.match(a.reason,/Water/);assert.equal(a.cost,'WWC');
 b.sides.player.energyType='Water';b.sides.player.energyAvailable=true;b.sides.player.energyUsed=false;b.sides.player.active.energy={Water:2};C.applyAction(b,'player',{type:'attach',target:'active'});
 a=C.attackAvailability(b,'player',0);assert.equal(a.usable,true);const action=C.legalActions(b,'player').find(a=>a.type==='attack'&&a.attackIndex===0);C.applyAction(b,'player',action);assert.ok(b.log.some(e=>e.type==='attack'&&e.attack==='Ice Beam'));
});
test('CPU validation rejects an Energy configuration that cannot power its fixed deck',()=>{
 assert.throws(()=>S.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentEnergyTypes:['Fire']}),/CPU.*Energy/i);
});
test('saving an experimental deck preserves explicit Energy and returns warnings rather than blocking legality',()=>{
 const state={};const r=K.saveDeck(state,{cards:D.BEGINNER_IVYSAUR_DECK,energyTypes:['Fire']},owned);assert.equal(r.ok,true);assert.deepEqual(r.deck.energyTypes,['Fire']);assert.ok(r.warnings.some(w=>w.code==='unpowerable'));
});
test('automatic saved Energy follows later Pokémon changes while explicit saved Energy never silently changes',()=>{
 const s={},r=K.saveDeck(s,{cards:D.BEGINNER_IVYSAUR_DECK,energyMode:'auto'},owned);assert.equal(r.ok,true);assert.equal(r.deck.energyMode,'auto');r.deck.cards=['A1-083'];assert.deepEqual(K.deckEnergyTypes(r.deck),['Water']);
 assert.deepEqual(K.deckEnergyTypes({cards:['A1-083'],energyTypes:['Fire'],energyMode:'manual'}),['Fire']);
});
