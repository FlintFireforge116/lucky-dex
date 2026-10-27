const test=require('node:test');
const assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const decks=require('../app/src/main/assets/tcgp-battle-decks.js');
const ui=require('../app/src/main/assets/tcgp-battle-ui.js');
const ai=require('../app/src/main/assets/tcgp-battle-ai.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');

test('deck ownership combines separately projected rows for one canonical card',()=>{
  const cards=decks.LOANER_PLAYER_DECK.slice();
  const rows=cards.filter(id=>id!=='BASIC-POKE-BALL').map(id=>({gameplayId:id,quantity:1,battleEnabled:true}));
  assert.deepEqual(decks.validateDeck(cards,rows),{ok:true,errors:[]});
});

test('saved alternate-print deck IDs use canonical ownership without rewriting the saved card list',()=>{
  assert.equal(data.cardById('A1-227').id,'A1-001');
  const cards=decks.LOANER_PLAYER_DECK.map(id=>id==='A1-001'?'A1-227':id);
  const rows=cards.filter(id=>id!=='BASIC-POKE-BALL').map(gameplayId=>({gameplayId,quantity:1,battleEnabled:true}));
  assert.deepEqual(decks.validateDeck(cards,rows),{ok:true,errors:[]});
  const state={},saved=decks.saveDeck(state,{id:'legacy-alt',cards},rows);
  assert.equal(saved.ok,true);assert.ok(saved.deck.cards.includes('A1-227'));
  assert.ok(!saved.deck.cards.includes('A1-001'));
});

test('copy limits normalize accented and unaccented Trainer names',()=>{
  assert.equal(decks.copyLimitKey({name:'Poké Ball'}),decks.copyLimitKey({name:'Poke Ball'}));
  assert.notEqual(decks.copyLimitKey({name:'Pikachu ex'}),decks.copyLimitKey({name:'Pikachu'}));
});

test('art URL fallback preserves mini-set and Promo print identities',()=>{
  assert.match(ui.cardArtUrl('A1a-001'),/\/A1a\/A1a_001_EN\.webp$/);
  assert.match(ui.cardArtUrl('P-A-005'),/\/P-A\/P-A_005_EN\.webp$/);
  assert.equal(ui.cardArtUrl('BASIC-POKE-BALL'),'');
});

test('deck save preserves up to three Energy types and rejects impossible Energy zones',()=>{
  const cards=decks.LOANER_PLAYER_DECK.slice(),rows=cards.filter(id=>id!=='BASIC-POKE-BALL').map(gameplayId=>({gameplayId,quantity:1,battleEnabled:true}));
  const state={};
  const saved=decks.saveDeck(state,{id:'mixed',cards,energyTypes:['Fire','Water','Lightning']},rows);
  assert.equal(saved.ok,true);
  assert.deepEqual(saved.deck.energyTypes,['Fire','Water','Lightning']);
  assert.equal(saved.deck.energyType,'Fire');
  assert.equal(decks.saveDeck(state,{id:'invalid',cards,energyTypes:['Grass','Fire','Water','Metal']},rows).ok,false);
  assert.equal(decks.saveDeck(state,{id:'invalid',cards,energyTypes:['Dragon']},rows).ok,false);
  assert.equal(decks.saveDeck(state,{id:'invalid',cards,energyTypes:['Water','Water']},rows).ok,false);
});

test('inspection renders full attack and ability text without exposing effect objects',()=>{
  const html=ui.cardRulesHtml({kind:'pokemon',attacks:[{name:'Targeted hit',cost:'GC',damage:20,text:'Choose 1 opposing Pokémon. This also poisons it.',effect:{type:'status',status:'poison'}}],ability:{name:'Recovery',text:'Once during your turn, heal 20 damage.',effect:{type:'healSelf',amount:20}}});
  assert.match(html,/Choose 1 opposing Pokémon/);
  assert.match(html,/Recovery/);
  assert.match(html,/Once during your turn/);
  assert.doesNotMatch(html,/\[object Object\]|"type":/);
});

test('Trainer inspection shows subtype, complete effect text and usage restrictions',()=>{
  const html=ui.cardRulesHtml({kind:'trainer',name:'Medic',trainerSubtype:'Supporter',text:'Heal 50 damage from 1 of your Pokémon.',timing:'Only once during your turn.'});
  assert.match(html,/Supporter/);
  assert.match(html,/Heal 50 damage/);
  assert.match(html,/Only once during your turn/);
});

test('owned catalogue search includes unsupported cards and explains their support status',()=>{
  const rows=[{gameplayId:'X-001',name:'Poké Ball',card:{name:'Poké Ball',kind:'trainer',trainerSubtype:'Item'},battleEnabled:true},{gameplayId:'X-002',name:'Mystery',card:{name:'Mystery',support:{status:'PARTIAL',reasons:['Damage prevention needs implementation.']}},battleEnabled:false}];
  assert.deepEqual(ui.filterBuilderRows(rows,'poke'),[rows[0]]);
  assert.deepEqual(ui.filterBuilderRows(rows,'X-002'),[rows[1]]);
  assert.equal(ui.filterBuilderRows(rows,'').length,2);
  assert.match(ui.supportText(rows[1].card),/PARTIAL.*Damage prevention needs implementation/);
});

test('legal ability and effect targets are distinct actions',()=>{
  const action={type:'ability',target:'bench',benchIndex:2,abilityIndex:0,effectTarget:'bench',effectBenchIndex:0};
  assert.equal(ai.sameAction(action,{...action}),true);
  assert.equal(ai.sameAction(action,{...action,abilityIndex:1}),false);
  assert.equal(ai.sameAction(action,{...action,effectBenchIndex:1}),false);
});

test('action narration distinguishes targeted Trainers, abilities and physical target slots',()=>{
  const state={sides:{player:{active:{cardId:'A1-001'},bench:[{cardId:'A1-014',benchSlot:2}]},opponent:{active:{cardId:'A1-189'},bench:[]}}};
  assert.match(ui.actionLabel({type:'trainer',cardId:'BASIC-POKE-BALL',target:'bench',benchIndex:2},state,'player'),/Paras/);
  assert.match(ui.actionEventText({type:'ability',side:'opponent',ability:'Recovery',cardId:'A1-001'}),/CPU.*Recovery/);
  state.sides.player.energyType='Water';
  assert.match(ui.actionLabel({type:'attach',target:'active'},state,'player'),/WATER/);
});

test('targeted Trainer cards can be dropped on their legal physical Bench slot',()=>{
  const battle={phase:'battle',activeSide:'player',sides:{player:{bench:[{cardId:'A1-014',benchSlot:2}]}}};
  const actions=[{type:'trainer',handIndex:0,target:'bench',benchIndex:2}];
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'bench',2),0);
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'bench',1),-1);
  assert.equal(ui.directHandDropActionIndex([{type:'trainer',handIndex:0,target:'opponentBench',benchIndex:2}],battle,0,'opponentBench',2),0);
  assert.equal(ui.directHandDropActionIndex([{type:'trainer',handIndex:0,target:'opponentBench',benchIndex:2}],battle,0,'opponentBench',1),-1);
});

test('simultaneous Knock Outs are narrated as a draw',()=>{
  assert.deepEqual(ui.resultSummary({winner:'draw',reason:'simultaneous-ko'}),{title:'DRAW',message:'Both sides reached a winning condition at the same time.'});
});

test('Beginner AI uses legal activated abilities and stays independent of hidden opponent cards',()=>{
  const card=data.cardById('A1-014'),previous=card.ability;
  try{
    card.ability={name:'Supply',type:'activated',oncePerTurn:true,effect:{type:'attachEnergy',target:'selfPokemon',energyType:'Grass',amount:1}};
    const state=core.createBattle({playerDeck:decks.LOANER_PLAYER_DECK,opponentDeck:decks.LOANER_PLAYER_DECK,seed:9331,firstSide:'player'});
    state.turnNumber=5;state.sides.player.turnCount=3;
    state.sides.player.active=core.makePokemonSlot('A1-014',0);
    state.sides.player.bench=[];state.sides.player.hand=[];
    assert.ok(core.legalActions(state,'player').some(action=>action.type==='ability'));
    // The AI must select exclusively from legalActions, without inspecting hidden identities.
    Object.defineProperty(state.sides.opponent,'hand',{get(){throw Error('AI inspected opponent hand');}});
    Object.defineProperty(state.sides.opponent,'deck',{get(){throw Error('AI inspected opponent deck');}});
    const action=ai.chooseAction(state,'player');
    assert.equal(action.type,'ability');
    assert.ok(core.legalActions(state,'player').some(legal=>ai.sameAction(action,legal)));
    assert.equal(ai.chooseAction(state,'player','Beginner',30).type,'endTurn','live CPU turns have the same action bound as headless turns');
  }finally{card.ability=previous;}
});

test('Beginner AI preserves a Fossil rather than using its optional self-discard ability every turn',()=>{
  const card=data.cardById('A1-014'),previous=card.ability;
  try{
    card.ability={name:'Discard Fossil',type:'activated',effect:{type:'discardSelf'}};
    const state=core.createBattle({playerDeck:decks.LOANER_PLAYER_DECK,opponentDeck:decks.LOANER_PLAYER_DECK,seed:9332,firstSide:'player'});
    state.sides.player.active=core.makePokemonSlot('A1-014',0);state.sides.player.hand=[];state.sides.player.bench=[];
    assert.ok(core.legalActions(state,'player').some(action=>action.type==='ability'));
    assert.equal(ai.chooseAction(state,'player').type,'endTurn');
  }finally{card.ability=previous;}
});
