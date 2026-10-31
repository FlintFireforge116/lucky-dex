const test=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/',D=require(A+'tcgp-battle-data.js'),C=require(A+'tcgp-battle-core.js'),AI=require(A+'tcgp-battle-ai.js'),S=require(A+'tcgp-battle-solo.js'),W=require(A+'tcgp-deck-workspace.js'),Decks=require(A+'tcgp-battle-decks.js');
function play(challenge,seed,extra={}){
 const b=S.createBattle({challengeId:challenge.id,playerDeck:challenge.deck,playerEnergyTypes:challenge.energyTypes,seed,manualPlayerSetup:true,...extra});let steps=0,perTurn=0,lastTurn=0;
 while(b.phase!=='finished'&&steps++<1400){const side=b.phase==='setup'?b.setupSide:b.phase==='promote'?b.promotionSide:b.activeSide;if(lastTurn!==b.turnNumber){lastTurn=b.turnNumber;perTurn=0;}const legal=C.legalActions(b,side),a=AI.chooseAction(b,side,challenge.difficulty,perTurn++);assert.ok(a,'No action: '+challenge.id+' '+b.phase);assert.ok(legal.some(x=>AI.sameAction(x,a)),JSON.stringify(a));assert.doesNotThrow(()=>C.applyAction(b,side,a),challenge.id+' '+JSON.stringify(a));}
 assert.equal(b.phase,'finished',challenge.id+' stalled at '+b.phase);assert.ok(steps<1400);assert.ok(b.turnNumber<=50);return b;
}
test('all sixteen Solo decks complete legal setup, turn and promotion playthroughs across four CPU levels',()=>{
 for(const c of S.CHALLENGES){const b=play(c,4201);assert.ok(b.log.some(e=>e.type==='attack'),c.id+' never attacked');assert.ok(b.log.some(e=>e.type==='finish'),c.id);}
});
test('Beginner full match includes setup, attacks, knockouts and a game result',()=>{
 const b=play(S.CHALLENGES[0],314159);for(const type of ['setupActive','turn','attach','attack','ko','finish'])assert.ok(b.log.some(e=>e.type===type),type);
});
test('real evolution and status matches execute mechanics rather than only validate card text',()=>{
 const evo=play(S.CHALLENGES.find(c=>c.recipeId==='venusaur-ex'),4201);assert.ok(evo.log.some(e=>e.type==='evolve'));
 const status=play(S.CHALLENGES.find(c=>c.recipeId==='darkness-poison'),4201);assert.ok(status.log.some(e=>e.type==='status'));assert.ok(status.log.some(e=>e.type==='statusDamage'));
});
test('dual-Energy Expert match powers legal attacks and trainer-heavy match plays Tools and Stadiums',()=>{
 const multi=play(S.CHALLENGES.find(c=>c.recipeId==='dragon-dual'),4201);const attached=new Set(multi.log.filter(e=>e.type==='attach').map(e=>e.energyType));assert.ok(attached.size>=2);const dual=play(S.CHALLENGES.find(c=>c.recipeId==='dual-mega'),4201);assert.ok(dual.log.some(e=>e.type==='attack'&&(D.cardById(e.cardId).types||[]).length===2));
 const trainers=dual.log.filter(e=>e.type==='trainer').map(e=>D.cardById(e.cardId).trainerType);for(const type of ['Item','Supporter','Tool','Stadium'])assert.ok(trainers.includes(type),'Missing '+type);
});
test('seeded catalogue sample generates legal complete decks and survives full Expert matches',()=>{
 let rng=6937;const random=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296);const candidates=D.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled&&c.support?.status==='FULL');
 for(let i=0;i<8;i++){const focus=candidates[Math.floor(random()*candidates.length)];const rows=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2}));const setup=Decks.buildTestSetup(rows,{cardId:focus.id});assert.ok(setup.legalDeckReady,'Test setup: '+focus.id+' '+setup.blockers);const challenge={...S.CHALLENGES[0],difficulty:'Expert',deck:setup.cards,energyTypes:setup.energyTypes};play(challenge,6937+i,{testMode:true,opponentDeck:setup.opponentCards,opponentEnergyTypes:setup.opponentEnergyTypes});}
});

