const test=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/',D=require(A+'tcgp-battle-data.js'),C=require(A+'tcgp-battle-core.js'),AI=require(A+'tcgp-battle-ai.js'),S=require(A+'tcgp-battle-solo.js'),P=require(A+'tcgp-battle-progress.js'),W=require(A+'tcgp-deck-workspace.js'),Achievements=require(A+'achievements-tcgp-battle-v06920.js');
const levels=['Beginner','Intermediate','Advanced','Expert'];
function battle(seed=701){return S.createBattle({seed,firstSide:'player',playerDeck:D.BEGINNER_IVYSAUR_DECK});}
test('four CPU levels accept all engine choices and never consume real RNG while evaluating',()=>{
 for(const level of levels){const b=battle();const before=JSON.stringify(b);const legal=C.legalActions(b,'player'),a=AI.chooseAction(b,'player',level);assert.ok(legal.some(x=>AI.sameAction(x,a)));assert.equal(JSON.stringify(b),before);}
 assert.throws(()=>AI.chooseAction(battle(),'player','Impossible'),/difficulty/i);
});
test('Expert immediately takes a winning KO and evaluates only legally visible information',()=>{
 const b=battle(),s=b.sides.player;s.hand=[];s.active=C.makePokemonSlot('A1-002',0);s.active.energy={Grass:3};s.points=2;b.sides.opponent.active=C.makePokemonSlot('A1-001',0);b.sides.opponent.active.damage=60;
 const a=AI.chooseAction(b,'player','Expert');assert.equal(a.type,'attack');const copy=JSON.parse(JSON.stringify(b));copy.rngState=999;copy.sides.opponent.hand=copy.sides.opponent.hand.map((x,i)=>({...x,cardId:i%2?'A1-003':'A1-001'}));copy.sides.opponent.deck.reverse();assert.deepEqual(AI.chooseAction(copy,'player','Expert'),a);C.applyAction(b,'player',a);assert.equal(b.winner,'player');
});
test('sixteen coherent Solo challenges use validated shared recipes and progression requires unique clears',()=>{
 assert.equal(S.CHALLENGES.length,16);assert.deepEqual(S.DIFFICULTIES,levels);
 for(const level of levels)assert.equal(S.CHALLENGES.filter(c=>c.difficulty===level).length,4);
 const decks=require(A+'tcgp-battle-decks.js');for(const c of S.CHALLENGES){const valid=decks.validateLoanerDeck(c.deck,c.energyTypes||[c.energyType]);assert.equal(valid.ok,true,c.id);assert.equal(valid.energyValid,true,c.id);assert.equal(valid.warnings.some(w=>w.code==='orphan'),false,c.id);assert.equal(valid.missingEnergyTypes.length,0,c.id);assert.equal(valid.unpowerable.length,0,c.id);assert.ok(c.deck.every(id=>(D.cardById(id).support?.status==='FULL'||id==='BASIC-POKE-BALL')),c.id);if(c.recipeId)assert.deepEqual(c.deck,W.RECIPES.find(r=>r.id===c.recipeId).cards);}
 const state={tcgpBattle:{firstClears:{}}},inter=S.CHALLENGES.find(c=>c.difficulty==='Intermediate');assert.equal(S.isUnlocked(inter,state),false);for(const c of S.CHALLENGES.filter(c=>c.difficulty==='Beginner'))state.tcgpBattle.firstClears[c.id]=true;assert.equal(S.isUnlocked(inter,state),true);
});
test('battle IDs survive serialization, preserve first clear rewards and prevent repeated results',()=>{
 const b=battle();assert.ok(b.battleId);assert.equal(b.challengeId,S.CHALLENGES[0].id);assert.equal(b.difficulty,'Beginner');assert.notEqual(battle().battleId,b.battleId);b.phase='finished';b.winner='player';const state={};const first=P.recordResult(state,b,S.CHALLENGES[0]);assert.deepEqual(first.reward,{coins:100,dust:50});const replay=JSON.parse(JSON.stringify(b));delete replay._luckyDexRecorded;const saved=JSON.parse(JSON.stringify(state));assert.equal(P.recordResult(saved,replay,S.CHALLENGES[0]).alreadyRecorded,true);assert.equal(saved.tcgpBattle.stats.wins,1);
});
test('temporary developer battle has no real progression or rewards',()=>{
 const b=S.createBattle({seed:15,testMode:true,opponentDeck:D.BEGINNER_IVYSAUR_DECK});b.phase='finished';b.winner='player';const state={};const result=P.recordResult(state,b,S.CHALLENGES[0]);assert.deepEqual(result.reward,{coins:0,dust:0});assert.equal(state.tcgpBattle?.stats?.wins||0,0);assert.equal(Object.keys(state.tcgpBattle?.firstClears||{}).length,0);
});
test('records player log events, challenge statistics, archetypes and expanded normal achievements',()=>{
 const b=battle();b.phase='finished';b.winner='player';b.sides.opponent.points=0;b.log=[{type:'attack',side:'player',cardId:'A1-002'},{type:'attack',side:'opponent'},{type:'attach',side:'player'},{type:'trainer',side:'player'},{type:'evolve',side:'player'},{type:'ko',side:'opponent'},{type:'status',side:'player',status:'poison'}];const state={};P.recordResult(state,b,S.CHALLENGES[0]);const s=state.tcgpBattle.stats;assert.equal(s.attacks,1);assert.equal(s.knockouts,1);assert.equal(s.energyAttached,1);assert.equal(s.trainersPlayed,1);assert.equal(s.flawlessWins,1);assert.equal(state.tcgpBattle.challengeRecords[b.challengeId].wins,1);assert.ok(s.archetypeWins.Grass);assert.equal(s.statusWins,1);assert.ok(Achievements.build(()=>state).length>=12);assert.ok(Achievements.build(()=>state).some(a=>a.id==='v06920_tcgp_first_win'));
});


test('Expert chooses a winning Bench KO over a higher raw-damage attack',()=>{
 const card=D.cardById('A1-002'),original=card.attacks;
 try{card.attacks=[{name:'Big number',cost:'',damage:80},{name:'Tactical target',cost:'',damage:0,effect:{type:'selectedDamage',target:'opponentPokemon',amount:40}}];const b=battle();b.sides.player.active=C.makePokemonSlot(card.id,0);b.sides.player.hand=[];b.sides.player.energyUsed=true;b.sides.player.points=2;b.sides.opponent.active=C.makePokemonSlot('A1-003',0);const target=C.makePokemonSlot('A1-001',0);target.damage=40;target.benchSlot=0;b.sides.opponent.bench=[target];const action=AI.chooseAction(b,'player','Expert');assert.equal(action.attackIndex,1);assert.equal(action.target,'opponentBench');C.applyAction(b,'player',action);assert.equal(b.winner,'player');}finally{card.attacks=original;}
});
test('Expert orders a damage Supporter before a winning attack and does not waste Energy',()=>{
 const b=battle(),s=b.sides.player;s.active=C.makePokemonSlot('A1-002',0);s.active.energy={Grass:3};s.hand=[{uid:'support',cardId:'A1-223'}];s.energyAvailable=false;s.points=2;b.sides.opponent.active=C.makePokemonSlot('A1-001',0);b.sides.opponent.active.damage=0;
 const a=AI.chooseAction(b,'player','Expert');assert.equal(a.type,'trainer');assert.equal(a.cardId,'A1-223');C.applyAction(b,'player',a);const attack=AI.chooseAction(b,'player','Expert');assert.equal(attack.type,'attack');C.applyAction(b,'player',attack);assert.equal(b.winner,'player');
 const c=battle(),p=c.sides.player;p.active=C.makePokemonSlot('A1-002',0);p.active.energy={Grass:5};p.hand=[];p.bench=[C.makePokemonSlot('A1-002',0)];p.bench[0].benchSlot=0;p.energyAvailable=true;p.energyUsed=false;const chosen=AI.chooseAction(c,'player','Expert');assert.ok(chosen.type!=='attach'||chosen.target==='bench');
});
test('persisted bounded battle ledger rejects old results after their individual entries expire',()=>{
 const state={};let oldest;
 for(let i=0;i<P.LEDGER_LIMIT+5;i++){const b=battle(700+i);b.phase='finished';b.winner='opponent';if(!oldest)oldest=JSON.parse(JSON.stringify(b));P.recordResult(state,b,S.CHALLENGES[0]);}
 assert.equal(state.tcgpBattle.recordedBattles.length,P.LEDGER_LIMIT);const n=state.tcgpBattle.stats.matches;assert.equal(P.recordResult(state,oldest,S.CHALLENGES[0]).alreadyRecorded,true);assert.equal(state.tcgpBattle.stats.matches,n);
});
test('first-clear migration is retained and challenge mismatch cannot redirect rewards',()=>{
 const state={tcgpBattle:{firstClears:{'genetic-apex-beginner-ivysaur':true},stats:{wins:4}}};const b=battle();b.phase='finished';b.winner='player';assert.throws(()=>P.recordResult(state,b,S.CHALLENGES[1]),/match/);assert.deepEqual(P.recordResult(state,b,S.CHALLENGES[0]).reward,{coins:0,dust:0});assert.equal(state.tcgpBattle.stats.wins,5);
});


test('Intermediate builds a reserve with a search Item before taking a nonwinning attack',()=>{
 const b=battle(),p=b.sides.player;p.active=C.makePokemonSlot('A1-002',0);p.active.energy={Grass:3};p.hand=[{uid:'search',cardId:'BASIC-POKE-BALL'}];p.bench=[];p.energyUsed=true;b.sides.opponent.active=C.makePokemonSlot('A1-003',0);const a=AI.chooseAction(b,'player','Intermediate');assert.equal(a.type,'trainer');assert.equal(a.cardId,'BASIC-POKE-BALL');
});

test('stats count actual Energy recipients and only award archetypes used by the winning attacker',()=>{
 const b=battle();b.phase='finished';b.winner='player';b.sides.player.energyTypes=['Grass','Fire','Water'];b.log=[{type:'attack',side:'player',cardId:'A1-002',attack:'Razor Leaf'},{type:'effectEnergy',side:'player',amount:1,totalAmount:3,attachedBySide:{player:3,opponent:0}},{type:'effectEnergy',side:'opponent',amount:2,attachedBySide:{player:2,opponent:0}},{type:'effectEnergy',side:'player',amount:5,attachedBySide:{player:0,opponent:5}}];const state={};P.recordResult(state,b,S.CHALLENGES[0]);assert.equal(state.tcgpBattle.stats.energyAttached,5);assert.deepEqual(state.tcgpBattle.stats.archetypeWins,{Grass:1});
});

test('status statistics and achievements exclude prevented or self-inflicted conditions',()=>{
 const b=battle();b.phase='finished';b.winner='player';b.log=[{type:'status',side:'player',status:'poison',affectedCount:0,affectedBySide:{player:0,opponent:0}},{type:'status',side:'player',status:'sleep',affectedCount:1,affectedBySide:{player:1,opponent:0}}];const state={};P.recordResult(state,b,S.CHALLENGES[0]);assert.equal(state.tcgpBattle.stats.statusesApplied,0);assert.equal(state.tcgpBattle.stats.statusWins||0,0);
});
