'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const data=require(A+'tcg-classic-battle-data.js'),synergy=require(A+'tcg-deck-synergy.js'),builder=require(A+'tcg-classic-deck-builder.js');
const core=require(A+'tcgp-battle-core.js'),ui=require(A+'tcgp-battle-ui.js'),assets=require(A+'tcgp-ui-assets.js');
function hasPartner(id,partner){return synergy.metadata(data.cardById(id)).optionalPartners.some(p=>p.name===partner&&p.required===false&&p.relation==='in-play');}
test('metadata audit derives OPTIONAL cross-Pokémon relationships from every installed card',()=>{
  const all=data.CARDS.filter(c=>c.kind==='pokemon'),linked=all.filter(c=>synergy.metadata(c).optionalPartners.length);
  assert.ok(all.length>2700,'audit must cover the entire installed Classic catalogue');
  assert.ok(linked.length>=18,'detect named partner dependencies without counting self-references');
  assert.ok(new Set(linked.map(c=>c.setId)).size>=5,'must not be tied to EX Emerald or Legend Maker');
  for(const [id,partner] of [['ex9-98','Regirock ex'],['ex9-99','Registeel ex'],['ex9-100','Regice ex'],
    ['ex11-8','Latios'],['ex11-8','Latios ex'],['ex11-45','Volbeat'],
    ['ex12-20','Solrock'],['ex12-25','Lunatone'],['ex12-7','Omanyte'],
    ['ex12-23','Kabutops'],['ex5-23','Low Pressure System']])
    assert.ok(hasPartner(id,partner),`${id} should optionally partner with ${partner}`);
  // Opponent's board and self-only passive effects are not deck partnerships.
  assert.ok(!hasPartner('ex5-7','Pokémon-ex'));
  assert.deepEqual(synergy.metadata(data.cardById('base2-34')).optionalPartners,[],'self-referential Poké-Bodies must not become phantom partners');
  assert.deepEqual(synergy.metadata(data.cardById('ex11-55')).optionalPartners,[],'solo Pokémon effects must not become partner requirements');
  assert.equal(synergy.metadata(data.cardById('ex9-98')).optionalPartners.some(p=>p.required),false);
});
test('Regice ex builds may include Regirock ex without requiring Fighting Energy',()=>{
  const owned=data.CARDS.filter(c=>c.battleEnabled&&c.setId==='ex9').map(c=>({gameplayId:c.id,quantity:4}));
  let withRock=0,withoutRock=0;
  for(let seed=1;seed<=12;seed++){
    const deck=builder.buildDeck(owned,{sets:['ex9'],focusCardId:'ex9-98',types:['Water'],style:'competitive',randomSeed:seed});
    assert.ok(deck.ok,`seed ${seed}: ${deck.errors?.join(' ')}`);
    assert.ok(deck.cards.includes('ex9-98'));
    assert.deepEqual(deck.energyTypes,['Water'],'bench-only partner should not pollute Basic Energy Zone');
    assert.ok(data.validateDeck(deck.cards).ok);
    if(deck.cards.includes('ex9-99'))withRock++;else withoutRock++;
  }
  assert.ok(withRock>0,'Regirock ex must be eligible');
  assert.ok(withoutRock>0,'Regirock ex must remain optional');
});
test('all eight Basic Energy types have physical card art and an in-catalogue print',()=>{
  for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']){
    const url=assets.energyCardUrl(type),id=assets.energyCardId(type),c=data.cardById(id);
    assert.match(url,/^https:\/\/images\.pokemontcg\.io\//);
    assert.ok(c?.basicEnergy,`missing ${type} Basic Energy`);
    assert.equal(c.subtype,type);
  }
});
test('effect-option choices display Energy card art and leave non-Energy choices untouched',()=>{
  const labels=['Find Darkness Energy','Recover Metal Energy','Water','Attach Psychic Energy','Draw 2 cards','Special Energy'];
  const actions=labels.map((choiceLabel,choiceOption)=>({type:'effectChoice',choiceOption,choiceLabel}));
  const fake={format:'classic',phase:'effectChoice',choiceSide:'player',pendingChoice:{kind:'option',options:labels},sides:{player:{},opponent:{}}};
  ui._test.setCurrentBattleForTests(fake,actions);
  for(const [i,type] of [[0,'Darkness'],[1,'Metal'],[2,'Water'],[3,'Psychic']]){
    const m=ui._test.choiceCardModel(actions[i],i);
    assert.equal(m.title,`${type} Energy`);
    assert.equal(m.art,assets.energyCardUrl(type));
    assert.equal(m.detail,'BASIC ENERGY');
  }
  assert.equal(ui._test.choiceCardModel(actions[4],4).art,'');
  assert.equal(ui._test.choiceCardModel(actions[5],5).art,'');
});
test('Lady Outing offers Darkness and Metal in the real battle engine',()=>{
 const owned=data.CARDS.filter(c=>c.battleEnabled&&c.setId==='ex1').map(c=>({gameplayId:c.id,quantity:4}));
 const deck=builder.buildDeck(owned,{sets:['ex1'],types:['Grass'],style:'competitive',randomSeed:3});assert.ok(deck.ok);
 const all=assets.ENERGY_CARD_IDS?Object.keys(assets.ENERGY_CARD_IDS):['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
 const state=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,firstSide:'player',seed:3,playerEnergyTypes:all,opponentEnergyTypes:all});
 state.phase='battle';state.activeSide='player';state.sides.player.turnCount=5;
 state.sides.player.active=core.makePokemonSlot('ex1-9',2,'target');state.sides.opponent.active=core.makePokemonSlot('ex1-9',2,'opp');
 state.sides.player.hand=[{uid:'lady',cardId:'ex1-83'}];
 const action=core.legalActions(state,'player').find(a=>a.type==='trainer'&&a.cardId==='ex1-83');assert.ok(action);
 core.applyAction(state,'player',action);
 assert.equal(state.pendingChoice?.kind,'option');
 assert.ok(state.pendingChoice?.options?.includes('Darkness'));
 assert.ok(state.pendingChoice?.options?.includes('Metal'));
});
test('both Classic and Pocket editors render the eight Energy cards as tappable images',()=>{
  const fs=require('node:fs');
  for(const file of ['tcg-classic-deck-editor.js','tcgp-deck-editor.js']){
   const content=fs.readFileSync(require.resolve(A+file),'utf8');
   assert.match(content,/tcgp-editor-energy-grid/);
   assert.match(content,/energyTile\('energy-type'/);
   assert.match(content,/energyCardUrl/);
  }
});
test('full installed Classic catalogue can be classified without missing metadata fields',()=>{
 assert.equal(data.CARDS.length,3348);
 let ready=0;
 for(const card of data.CARDS){
  const m=synergy.metadata(card);
  for(const key of ['roles','inflicts','payoffs','energyTypes','conditionalAttackEnergyTypes','requiresTools','optionalPartners','specialEnergyPayoffs'])
   assert.ok(Array.isArray(m[key]),`${card.id}: missing ${key}`);
  if(card.battleEnabled)ready++;
 }
 assert.ok(ready>=3200);
});
