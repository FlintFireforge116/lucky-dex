'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path');const root='../app/src/main/assets/';
const core=require(root+'tcgp-battle-core'),AI=require(root+'tcgp-battle-ai'),UI=require(root+'tcgp-battle-ui'),DB=require(root+'tcg-classic-deck-builder'),cat=require(root+'tcg-classic-battle-data'),cpu=require(root+'tcg-classic-opponents'),lab=require(root+'tcg-test-lab-decks');
const energies=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const g=cpu.generate({sets:['ex15'],type:'Fire',seed:3});assert.ok(g.ok);
function battle(playerCard='ex15-95',oppCard='ex15-70'){
 const s=core.createBattle({format:'classic',playerDeck:g.cards,opponentDeck:g.cards,seed:4,playerEnergyTypes:energies,opponentEnergyTypes:energies});
 s.phase='battle';s.turnNumber=12;s.activeSide='player';s.sides.player.turnCount=10;s.sides.opponent.turnCount=9;
 s.sides.player.active=core.makePokemonSlot(playerCard,5,'p');s.sides.player.active.energy={Fire:3,Metal:2,Psychic:2};
 s.sides.opponent.active=core.makePokemonSlot(oppCard,5,'o');s.sides.opponent.active.damage=Math.max(0,Number(cat.cardById(oppCard).hp)-20);
 s.sides.player.bench=[core.makePokemonSlot('ex15-70',5,'pb')];s.sides.opponent.bench=[core.makePokemonSlot('ex15-70',5,'ob')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.prizes=[{uid:'p0',cardId:'ex15-70'},{uid:'p1',cardId:'ex15-63'},{uid:'p2',cardId:'ex15-62'},{uid:'p3',cardId:'ex15-61'},{uid:'p4',cardId:'ex15-60'}];return s;
}
function attack(s){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a);core.applyAction(s,'player',a);return s;}
function select(s,i){const a=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&x.choicePrizeIndex===i);assert.ok(a);core.applyAction(s,'player',a);return s;}
function prizeIds(s){return s.sides.player.prizes.map(x=>x.uid);}
test('Classic prizes are chosen, not automatically shifted: hidden cards have no card IDs in legal actions',()=>{
 const s=attack(battle());assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.special,'chooseClassicPrize');
 assert.equal(s.sides.player.prizesTaken,0);
 const actions=core.legalActions(s,'player');assert.equal(actions.length,5);assert.deepEqual(actions.map(x=>x.choicePrizeIndex),[0,1,2,3,4]);
 assert.ok(actions.every(a=>!Object.hasOwn(a,'choiceCardId')),'face-down prize identities are hidden');
 select(s,3);assert.equal(s.sides.player.hand.at(-1).uid,'p3');assert.ok(!prizeIds(s).includes('p3'));assert.equal(s.sides.player.prizesTaken,1);assert.equal(s.phase,'promote','KO promotion resumes after Prize choice');
});
test('Pokémon-ex knockout awards two independent Prize choices from the remaining pile',()=>{
 const s=attack(battle('ex15-95','ex15-93'));assert.equal(s.pendingPrizeClaims[0].remaining,2);
 select(s,4);assert.equal(s.sides.player.hand.at(-1).uid,'p4');assert.equal(s.pendingPrizeClaims[0].remaining,1);assert.equal(s.phase,'effectChoice');
 const second=core.legalActions(s,'player');assert.equal(second.length,4);assert.ok(second.every(x=>x.choicePrizeIndex<4));
 select(s,1);assert.equal(s.sides.player.hand.at(-1).uid,'p1');assert.equal(s.sides.player.prizesTaken,2);assert.equal(s.phase,'promote');
});
test('Revealed Prize remains visible; unrevealed identities are not exposed in UI',()=>{
 const s=attack(battle());s.sides.player.prizes[2].faceUp=true;
 const actions=core.legalActions(s,'player');assert.equal(actions[2].choiceCardId,'ex15-62');assert.equal(actions[1].choiceCardId,undefined);
 UI._test.setCurrentBattleForTests(s,actions);
 const shown=UI._test.liveEffectChoiceCenterHtml();assert.match(shown,/Prize 3 · revealed/);assert.match(shown,/data-action-index="2"/);
 assert.doesNotMatch(shown,/ex15-63|ex15-70|ex15-61|ex15-60/,"don't leak hidden IDs into choice UI");
 const preview=UI._test.livePrizeOverlayHtml();assert.equal(preview,'');
 UI._test.setBattleOverlayForTests('prizes');const html=UI._test.livePrizeOverlayHtml();assert.match(html,/face-down/);assert.match(html,/revealed/);assert.doesNotMatch(html,/ex15-63|ex15-70|ex15-61|ex15-60/);
});
test('Last Prize knockout only finishes after the player claims the last card',()=>{
 const s=battle();s.sides.player.prizes=[{uid:'last',cardId:'ex15-62'}];s.sides.player.prizesTaken=4;
 attack(s);assert.equal(s.phase,'effectChoice');assert.equal(s.sides.player.prizesTaken,4);
 select(s,0);assert.equal(s.phase,'finished');assert.equal(s.winner,'player');assert.equal(s.reason,'prizes');
});
test('CPU chooses a concealed Prize position without waiting for a player prompt',()=>{
 const s=battle();s.activeSide='opponent';const a=s.sides.opponent.active;a.cardId='ex15-95';a.energy={Fire:3};s.sides.player.active.damage=30;
 const action=core.legalActions(s,'opponent').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(action);core.applyAction(s,'opponent',action);
 assert.notEqual(s.pendingChoice?.special,'chooseClassicPrize');assert.equal(s.sides.opponent.prizesTaken,2);
});
test('CPU Snorlax Dozing activates and selects heal across difficulty settings, then remains Asleep',()=>{
 for(const level of AI.DIFFICULTIES){const s=battle();s.activeSide='opponent';s.sides.opponent.active=core.makePokemonSlot('ex15-10',5,'sn');s.sides.opponent.active.damage=40;
  const action=AI.chooseAction(s,'opponent',level,0);assert.equal(action?.type,'ability',level);assert.equal(action.abilityIndex,1,level);
  core.applyAction(s,'opponent',action);assert.equal(s.phase,'effectChoice');
  const choice=AI.chooseAction(s,'opponent',level,1);assert.equal(choice?.choiceOption,1,level);core.applyAction(s,'opponent',choice);
  assert.equal(s.sides.opponent.active.damage,20);assert.ok(s.sides.opponent.active.conditions.sleep);
 }
});
test('Swellow δ focused Fire builds include a whole Stage 2 ex line and the reverse pairing works',()=>{
 const rows=cat.CARDS.filter(c=>c.setId==='ex15'&&c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 for(const focusCardId of ['ex15-40','ex15-93']){const d=DB.buildDeck(rows,{sets:['ex15'],focusCardId,randomSeed:13});assert.ok(d.ok,JSON.stringify(d.errors));
  assert.ok(d.cards.includes('ex15-40'),'Swellow must provide Extra Wing');assert.ok(d.cards.includes('ex15-93'),'Stage 2 Pokémon-ex must benefit from Extra Wing');
  const ex=cat.cardById('ex15-93');
  assert.ok(d.cards.some(id=>cat.cardById(id)?.name?.replace(/ δ$/,'')===ex.evolvesFrom),'Stage 1 included');
 }
});
test('Fellow Boost requires actual Basic Energy from hand; focused Latias gets Mr Stone source',()=>{
 const rows=cat.CARDS.filter(c=>c.setId==='ex15'&&c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 const d=DB.buildDeck(rows,{sets:['ex15'],focusCardId:'ex15-95',randomSeed:14});assert.ok(d.ok);assert.ok(d.cards.includes('ex15-77'));
 const s=battle();s.sides.player.hand=[];assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='ex15-95')||s.sides.player.active.cardId==='ex15-95');
 // The helper Trainer gets Basic Energy from the Zone to hand (the ability never does).
 s.sides.player.hand=[{uid:'basic-fire',cardId:'basic-energy-fire'}];
 // Card ID for generated Zone energy is data-driven, not the mythical 'basic-energy-fire'.
 const type=cat.CARDS.find(c=>c.basicEnergy&&c.subtype==='Fire');assert.ok(type);s.sides.player.hand[0].cardId=type.id;
 const avail=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='ex15-95');assert.ok(avail);core.applyAction(s,'player',avail);
 const pick=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceHandIndex===0);assert.ok(pick);core.applyAction(s,'player',pick);
 assert.equal(s.phase,'effectChoice','target choice follows hand Energy choice');
 const target=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceTarget==='active');assert.ok(target);core.applyAction(s,'player',target);
 assert.ok(s.log.some(x=>x.type==='ex15FellowBoost'));assert.equal(s.sides.player.hand.some(r=>r.uid==='basic-fire'),false);
});
test('Test Lab saves and restores auto-builder selections separately from normal game settings',()=>{
 const real={tcgClassicBattle:{autoBuildOptions:{types:['Fire'],sets:['base1']}},tcgpBattle:{decks:[]}};
 const session={tcgClassicBattle:{decks:[],autoBuildOptions:{types:['Psychic'],sets:['ex15'],theme:'sleep',compareCandidates:false}},tcgpBattle:{decks:[]}};
 lab.persist(real,session);const stored=real.tcgTestLabDecks.classic.autoBuildOptions;assert.deepEqual(stored.sets,['ex15']);assert.equal(real.tcgClassicBattle.autoBuildOptions.types[0],'Fire');
 const restored={tcgClassicBattle:{decks:[]},tcgpBattle:{decks:[]}};lab.restore(real,restored);assert.deepEqual(restored.tcgClassicBattle.autoBuildOptions.types,['Psychic']);assert.equal(restored.tcgClassicBattle.autoBuildOptions.theme,'sleep');restored.tcgClassicBattle.autoBuildOptions.sets.push('neo1');assert.deepEqual(stored.sets,['ex15']);
});

test('Card inspection identifies printed Poké-Bodies and Poké-Powers distinctly',()=>{
 const swellow=UI.cardRulesHtml(cat.cardById('ex15-40'));assert.match(swellow,/Poké-Body · Extra Wing/);
 const snorlax=UI.cardRulesHtml(cat.cardById('ex15-10'));assert.match(snorlax,/Poké-Body · Bedhead/);assert.match(snorlax,/Poké-Power · Dozing/);
});
test('Selection artwork needs no duplicate text label and plain options still have readable text',()=>{
 const s=battle();s.phase='effectChoice';s.choiceSide='player';s.pendingChoice={kind:'option',prompt:'Choose an Energy',side:'player',options:['Find Fire Energy','Decline']};
 const choices=[{type:'effectChoice',choiceOption:0,choiceLabel:'Find Fire Energy'},{type:'effectChoice',choiceOption:1,choiceLabel:'Decline'}];
 UI._test.setCurrentBattleForTests(s,choices);const card=UI._test.choiceCardTileHtml(choices[0],0);
 assert.match(card,/<img /);assert.doesNotMatch(card,/<small>/);assert.match(card,/aria-label/);
 const text=UI._test.choiceCardTileHtml(choices[1],1);assert.match(text,/Decline/);
});
test('Fellow Boost is unavailable without physical hand Basic Energy, preventing inert activations',()=>{
 const s=battle();s.sides.player.hand=[];assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='ex15-95'));
 const type=cat.CARDS.find(c=>c.basicEnergy&&c.subtype==='Fire');assert.ok(type);s.sides.player.hand.push({uid:'f',cardId:type.id});
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='ex15-95'));
});
