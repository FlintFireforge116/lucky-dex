const t=require('node:test'),a=require('node:assert/strict'),D=require('../app/src/main/assets/tcgp-battle-data.js'),K=require('../app/src/main/assets/tcgp-battle-decks.js');
const ids=['A1-053','A1-054','A1-055','A1-074','A1-075','A1-083','P-A-001','P-A-002','P-A-006','P-A-007','A1-223','A2-147','A2-154','A3-143','B2-153','A1-003'];
const owned=ids.map(gameplayId=>({gameplayId,quantity:2,battleEnabled:D.cardById(gameplayId).battleEnabled}));
t('evolution core is selected as duplicate family, with consistency Trainers and no incompatible high-stat Venusaur',()=>{
 const r=K.buildQuickDeck(owned,{cardId:'A1-055'});a.equal(r.ok,true,JSON.stringify(r.errors));a.equal(r.cards.length,20);
 for(const id of ['A1-053','A1-054','A1-055'])a.equal(r.cards.filter(x=>x===id).length,2,id);
 a.ok(r.cards.includes('P-A-007'));a.ok(!r.cards.includes('A1-003'));a.deepEqual(r.energyTypes,['Water']);a.ok(K.validateDeck(r.cards,owned).ok);
 a.ok(r.evaluation?.setupConsistency>0);a.ok(r.evaluation?.trainerSupport>0);a.ok(r.candidatesEvaluated>1);
});
t('repair existing preserves every selected key card and finishes a legal coherent deck',()=>{
 const r=K.buildQuickDeck(owned,{mode:'existing',cards:['A1-083','A1-083','A1-074']});a.equal(r.ok,true,JSON.stringify(r.errors));
 a.equal(r.cards.filter(x=>x==='A1-083').length,2);a.ok(r.cards.includes('A1-074'));a.equal(r.cards.length,20);a.ok(K.validateDeck(r.cards,owned).ok);
});
t('test setup explains Stage2 prerequisites and preserves PARTIAL blockers without claiming legal readiness',()=>{
 a.equal(typeof K.buildTestSetup,'function');const r=K.buildTestSetup(owned,{cardId:'A1-055'});a.equal(r.ready,true);a.ok(r.prerequisites.some(p=>p.includes('Wartortle')));a.ok(r.cards.includes('A1-053'));a.deepEqual(r.energyTypes,['Water']);
 const partial=D.CARDS.find(c=>c.support?.status==='PARTIAL'),review=K.buildTestSetup(owned,{cardId:partial.id});a.equal(review.ready,false);a.ok(review.blockers.length);a.ok(review.attemptedCards.includes(partial.id));a.equal(K.validateLoanerDeck(review.attemptedCards).ok,false);
});
t('opponent-dependent test pair supplies an actual Pokémon ex target instead of a generic Grass opponent',()=>{
 const all=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true}));
 const r=K.buildTestSetup(all,{cardId:'A1a-060'});a.equal(r.ready,true);a.ok(r.opponentCards.some(id=>D.cardById(id)?.kind==='pokemon'&&D.cardById(id).points>=2));a.ok(K.validateLoanerDeck(r.opponentCards).ok);a.ok(r.opponentEnergyTypes.length);
 const S=require('../app/src/main/assets/tcgp-battle-solo.js'),b=S.createBattle({playerDeck:r.cards,playerEnergyTypes:r.energyTypes,testMode:true,opponentDeck:r.opponentCards,opponentEnergyTypes:r.opponentEnergyTypes,seed:2});
 const refs=[b.sides.opponent.active,...b.sides.opponent.bench,...b.sides.opponent.hand,...b.sides.opponent.deck];a.ok(refs.some(r=>D.cardById(r.cardId)?.points>=2));
});
t('generated Stage2 test deck can legally evolve on separate turns and power its focus attack',()=>{
 const C=require('../app/src/main/assets/tcgp-battle-core.js'),r=K.buildTestSetup(owned,{cardId:'A1-055'});a.equal(r.ready,true);
 let b;for(let seed=1;seed<400;seed++){const candidate=C.createBattle({playerDeck:r.cards,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed,manualPlayerSetup:true,firstSide:'player',playerEnergyTypes:r.energyTypes});if(['A1-053','A1-054','A1-055'].every(id=>candidate.sides.player.hand.some(x=>x.cardId===id))){b=candidate;break;}}a.ok(b,'A real shuffled opening must reach the family without invented cards');
 C.applyAction(b,'player',C.legalActions(b,'player').find(x=>x.type==='setupActive'&&x.cardId==='A1-053'));C.applyAction(b,'player',{type:'setupReady'});
 const next=()=>{C.applyAction(b,'player',{type:'endTurn'});C.applyAction(b,'opponent',{type:'endTurn'});};next();
 for(const id of ['A1-054','A1-055']){const evolve=C.legalActions(b,'player').find(x=>x.type==='evolve'&&x.cardId===id);a.ok(evolve,id);C.applyAction(b,'player',evolve);C.applyAction(b,'player',{type:'attach',target:'active'});next();}
 C.applyAction(b,'player',{type:'attach',target:'active'});a.equal(b.sides.player.active.cardId,'A1-055');a.equal(C.attackAvailability(b,'player',0).usable,true);
 C.applyAction(b,'player',C.legalActions(b,'player').find(x=>x.type==='attack'));a.ok(b.log.some(x=>x.type==='attack'&&x.attack==='Hydro Pump'));
});
