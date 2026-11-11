'use strict';
const A='../app/src/main/assets/';
const core=require(A+'tcgp-battle-core.js'),fx=require(A+'tcgp-battle-effects.js'),data=require(A+'tcg-classic-battle-data.js'),cpu=require(A+'tcg-classic-opponents.js'),set=require(A+'tcg-classic-legend-maker.js');
function deck(){return cpu.generate({sets:['ex12'],type:'Psychic',seed:7}).cards}
function battle(id,opp='ex12-51'){const d=deck(),s=core.createBattle({format:'classic',playerDeck:d,opponentDeck:d,seed:1337,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness']});s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;s.sides.player.active=core.makePokemonSlot(id,2,'pa');s.sides.opponent.active=core.makePokemonSlot(opp,2,'oa');s.sides.player.active.energy={Grass:9,Fire:9,Water:9,Lightning:9,Psychic:9,Fighting:9,Metal:9,Darkness:9};s.sides.player.energyDiscard={Fire:3,Water:3,Psychic:3};s.sides.player.bench=[core.makePokemonSlot('ex12-51',2,'pb')];s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench=[core.makePokemonSlot('ex12-51',2,'ob')];s.sides.opponent.bench[0].benchSlot=0;return s;}
function choice(s,mode){let n=0;while(s.phase==='effectChoice'&&n++<30){let who=s.choiceSide||s.activeSide,as=core.legalActions(s,who),a=mode?.(s,as)||as.find(x=>x.type==='effectChoice'&&!x.choiceSkip)||as.find(x=>x.choiceSkip);if(!a)throw Error('choice impossible '+JSON.stringify(s.pendingChoice).slice(0,350));core.applyAction(s,who,a)}if(s.phase==='effectChoice')throw Error('choice loop');return s;}
function attack(s,i=0,mode){const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);if(!act)throw Error('No legal '+s.sides.player.active.cardId+' '+i);core.applyAction(s,'player',act);choice(s,mode);return s}
const {test}=require('node:test');
test('93 all battle enabled',()=>{if(set.CARDS.length!==93||set.CARDS.filter(c=>c.battleEnabled).length!==93)throw Error(JSON.stringify(set.coverage()))});
test('React colorless energy',()=>{const s=battle('ex12-1'),x=s.sides.player.active;x.energy={};x.specialEnergy=[{uid:'sp1',cardId:'ex12-82'}];const e=core.effectiveEnergy(s,'player',x);if(e.Colorless!==1)throw Error(JSON.stringify(e))});
test('Gorebyss React doubles types',()=>{const s=battle('ex12-17'),x=s.sides.player.active;x.energy={};x.specialEnergy=[{uid:'sp1',cardId:'ex12-82'}];const e=core.effectiveEnergy(s,'player',x);if(e.Miracle!==2)throw Error(JSON.stringify(e))});
test('Mew ex copies opponent attack',()=>{const s=battle('ex12-88','ex12-51'),a=core.attackOptions(s,'player');if(!a.some(x=>x.cardId==='ex12-51'))throw Error(a.map(x=>x.cardId).join(', '));});
test('Gengar Cursed Reaction counters',()=>{const s=battle('ex12-5');attack(s);if(!s.sides.opponent.active.damage)throw Error('no counter')});
test('Flygon Reactive Blast player picks discard 1',()=>{const s=battle('ex12-87','ex12-83'),x=s.sides.player.active;x.specialEnergy=[{uid:'t1',cardId:'ex12-82'},{uid:'t2',cardId:'ex12-82'}];attack(s,0,(s,as)=>s.pendingChoice?.effect?.rule==='ex12:87:0'?as.find(x=>x.choiceOption===1):undefined);if(x.specialEnergy.length!==1)throw Error(JSON.stringify(x.specialEnergy));if(s.sides.opponent.active.damage<70)throw Error('incorrect damage '+s.sides.opponent.active.damage)});
test('Cradily Devolution Wave removes evolution from enemy',()=>{const s=battle('ex12-3','ex12-36');s.sides.player.active.specialEnergy=[{uid:'t1',cardId:'ex12-82'}];s.sides.opponent.active.stack=['ex12-79','ex12-36'];attack(s);if(s.sides.opponent.active.cardId!=='ex12-79')throw Error(s.sides.opponent.active.cardId)});
test('Mew Type Change',()=>{const s=battle('ex12-10','ex12-48');const act=core.legalActions(s,'player').find(a=>a.type==='ability');if(!act)throw Error('no ability');core.applyAction(s,'player',act);if(!fx.effectiveTypes(s,'player',s.sides.player.active,data.cardById).includes('Metal'))throw Error(JSON.stringify(s.sides.player.active))});
test('Banette Shady Move chooses source and target',()=>{const s=battle('ex12-85');s.sides.player.active.damage=20;const act=core.legalActions(s,'player').find(a=>a.type==='ability');if(!act)throw Error('no ability');core.applyAction(s,'player',act);choice(s);if(s.sides.player.active.damage>=20)throw Error('source not drained')});
test('Girafarig Foresight reorder top 5',()=>{const s=battle('ex12-16');s.sides.player.deck=[{uid:'A',cardId:'ex12-11'},{uid:'B',cardId:'ex12-22'},{uid:'C',cardId:'ex12-31'},{uid:'D',cardId:'ex12-50'},{uid:'E',cardId:'ex12-19'},...s.sides.player.deck];const initial=s.sides.player.deck.slice(0,5).map(x=>x.uid);attack(s,0);const after=s.sides.player.deck.slice(0,5).map(x=>x.uid);if(!initial.every(x=>after.includes(x)))throw Error('lost cards '+JSON.stringify(after))});
for(const ty of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'])test('CPU '+ty,()=>{for(const seed of [2,7,13]){const d=cpu.generate({sets:['ex12'],type:ty,seed});if(!d.ok)throw Error(d.error||JSON.stringify(d.errors));if(!data.validateDeck(d.cards).ok)throw Error(JSON.stringify(data.validateDeck(d.cards)));}})
test('Giant Stump discards down to three, stadium owner first, no returned cards',()=>{
 const s=battle('ex12-51');s.sides.player.bench=[0,1,2,3,4].map(i=>{const p=core.makePokemonSlot('ex12-50',2,'b'+i);p.benchSlot=i;return p});
 s.sides.opponent.bench=[0,1,2,3].map(i=>{const p=core.makePokemonSlot('ex12-50',2,'o'+i);p.benchSlot=i;return p});
 s.sides.player.benchLimit=5;s.sides.opponent.benchLimit=5;
 s.sides.player.hand=[{uid:'g',cardId:'ex12-75'}];
 const play=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex12-75');if(!play)throw Error('not playable');
 core.applyAction(s,'player',play);
 if(s.choiceSide!=='player')throw Error('must discard stadium owner first '+s.choiceSide);
 choice(s);
 if(s.sides.player.bench.length!==3||s.sides.opponent.bench.length!==3)throw Error('not trimmed '+s.sides.player.bench.length+'/'+s.sides.opponent.bench.length);
 if(!s.sides.player.discard.some(r=>r.cardId==='ex12-50')||!s.sides.opponent.discard.some(r=>r.cardId==='ex12-50'))throw Error('no discarded Pokémon');
});
test('Dunsparce Deadlock locks opposing Dunsparce attacks',()=>{
 const s=battle('ex12-31','ex12-31');const actions=core.legalActions(s,'player').filter(a=>a.type==='attack');
 if(actions.length)throw Error('Deadlock allowed Dunsparce attacks');
});
test('Girafarig Rear Sensor suppresses Basic Active Poké-Powers, not Poké-Bodies',()=>{
 const s=battle('ex12-15','ex12-16');
 s.sides.player.active=core.makePokemonSlot('ex12-8',2,'lap');
 if(!fx.abilitiesSuppressed(s,'player',s.sides.player.active,data.cardById))throw Error('Lapras power not locked');
 s.sides.player.active=core.makePokemonSlot('ex12-31',2,'dun');
 if(fx.abilitiesSuppressed(s,'player',s.sides.player.active,data.cardById))throw Error('Dunsparce body wrongly locked');
});
test('React-energy metadata includes named interactions, not generic Colorless filler',()=>{
 const r=data.cardById('ex12-87'),g=data.cardById('ex12-17'),a=data.cardById('ex12-83'),o=data.cardById('ex12-23');
 for(const c of [r,g,a])if(!c.deckMeta.specialEnergyPayoffs.includes('react-energy'))throw Error(c.name+' missing React metadata');
 if(!o.deckMeta.preferredPartners.includes('Kabutops'))throw Error('Omastar needs Fossil partners');
});
test('React Energy is present in a focused React-dependency deck',()=>{
 const builder=require(A+'tcg-classic-deck-builder.js');const owned=set.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 const d=builder.buildDeck(owned,{sets:['ex12'],focusCardId:'ex12-87',types:['Grass','Lightning'],style:'competitive'});
 if(!d.ok)throw Error(JSON.stringify(d.errors));
 if(!d.cards.includes('ex12-82'))throw Error('React payoff with no React Energy');
 const analysis=require(A+'tcg-classic-decks.js').analyzeDeck(d.cards,d.energyTypes);if(analysis.missingEnergyTypes.length)throw Error('Flygon optional stage-one attack falsely invalidates deck: '+analysis.missingEnergyTypes);
 const auto=require(A+'tcg-classic-decks.js').analyzeDeck(d.cards);if(auto.recommendedEnergyTypes.includes('Fighting'))throw Error('Auto Energy Zone wrongly recommends unnecessary Fighting');
});
test('Mew ex borrowed attack can be used with its printed energy cost',()=>{
 const s=battle('ex12-88','ex12-51');const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackCardId==='ex12-51');
 if(!act)throw Error('Mew ex has no borrowed attack');core.applyAction(s,'player',act);choice(s);
});
test('Fieldworker opponent gets explicit optional draw choice',()=>{
 const s=battle('ex12-51');s.sides.player.hand=[{uid:'w',cardId:'ex12-73'}];
 const act=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex12-73');if(!act)throw Error('Fieldworker unplayable');
 const before=s.sides.opponent.hand.length;
 core.applyAction(s,'player',act);
 if(s.phase!=='effectChoice'||s.choiceSide!=='opponent')throw Error('no opponent optional choice');
 const refuse=core.legalActions(s,'opponent').find(a=>a.choiceOption===1);if(!refuse)throw Error('no decline choice');core.applyAction(s,'opponent',refuse);
 if(s.sides.opponent.hand.length!==before)throw Error('forced draw despite decline');
});
test('Flygon ex Emerge Charge retrieves real discarded Energy when evolved',()=>{
 const s=battle('ex12-46');s.sides.player.active.stack=['ex12-67','ex12-46'];s.sides.player.hand=[{uid:'evo',cardId:'ex12-87'}];
 s.sides.player.discard=[{uid:'re',cardId:'ex12-82'}];
 const evolve=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='ex12-87');if(!evolve)throw Error('cannot evolve into Flygon ex');
 core.applyAction(s,'player',evolve);choice(s,(s,as)=>{
  if(s.pendingChoice?.effect?.rule==='ex12:power:87'&&s.pendingChoice.kind==='option')
    return as.find(a=>a.type==='effectChoice'&&/React Energy/.test(s.pendingChoice.options?.[a.choiceOption]||''));
 });
 if(s.sides.player.active.cardId!=='ex12-87')throw Error('Flygon evolution missing');
 if(!s.sides.player.active.specialEnergy.some(x=>x.cardId==='ex12-82'))throw Error('React was not retrieved');
});
test('CPU Flygon ex retrieves React Energy ahead of generic discarded Basic Energy',()=>{
 const ai=require(A+'tcgp-battle-ai.js'),s=battle('ex12-46');
 s.sides.player.active.stack=['ex12-67','ex12-46'];
 s.sides.player.hand=[{uid:'evo',cardId:'ex12-87'}];
 s.sides.player.discard=[{uid:'react',cardId:'ex12-82'}];
 s.sides.player.energyDiscard={Fire:2,Water:2,Psychic:2};
 const evolve=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='ex12-87');
 core.applyAction(s,'player',evolve);
 const action=ai.chooseAction(s,'player','Advanced',0);
 if(!action||!String(s.pendingChoice.options?.[action.choiceOption]).includes('React Energy'))
   throw Error('CPU failed to prioritise a React payoff: '+JSON.stringify(action));
});
