'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const data=require(A+'tcg-classic-battle-data.js');
const builder=require(A+'tcg-classic-deck-builder.js');
const cpu=require(A+'tcg-classic-opponents.js');
const core=require(A+'tcgp-battle-core.js');
const holonIds=['ex11-104','ex11-105','ex11-106'];
const allOwned=data.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const build=(rows=allOwned)=>builder.buildDeck(rows,{sets:['ex13'],types:['Fighting'],focusCardId:'ex13-53',style:'competitive',randomSeed:7});
const holon=(cards)=>cards.filter(id=>holonIds.includes(id));

test('Sharpedo δ retains the printed Holon Energy payoff',()=>{
 const p=data.cardById('ex13-53');
 assert.equal(p.name,'Sharpedo δ');
 assert.ok(p.attacks[0].text.includes('Holon Energy'));
 assert.ok(p.deckMeta.specialEnergyPayoffs.includes('holon-energy'));
});
test('EX Holon Phantoms-only Fighting build includes owned Holon FF from prior EX Delta Species',()=>{
 const result=build();
 assert.ok(result.ok,result.errors?.join('; '));
 assert.equal(result.cards.filter(id=>id==='ex13-53').length,3);
 assert.deepEqual(holon(result.cards),['ex11-104','ex11-104']);
 assert.ok(result.cards.every(id=>data.cardById(id)?.setId==='ex13'||holonIds.includes(id)), 'No unrelated cross-set Pokémon/Trainer allowed');
 assert.deepEqual(result.energyTypes,['Fighting']);
 assert.ok(data.validateDeck(result.cards).ok);
 assert.equal(result.warnings.some(w=>String(w.message||'').includes('Holon Energy bonus inactive')),false);
});
test('The builder does not create unowned Holon Energy and explicitly warns about the payoff',()=>{
 const result=build(allOwned.filter(row=>!holonIds.includes(row.gameplayId)));
 assert.ok(result.ok,result.errors?.join('; '));
 assert.equal(holon(result.cards).length,0);
 assert.ok(result.warnings.some(w=>String(w.message||'').includes('Holon Energy bonus inactive')));
 assert.ok(data.validateDeck(result.cards).ok);
});
test('The cross-set exception is restricted to Holon Phantoms, not unrelated expansions',()=>{
 const ff=data.cardById('ex11-104');
 assert.equal(builder.allowedInSetPool(ff,['ex13']),true);
 assert.equal(builder.allowedInSetPool(ff,['base1']),false);
 assert.equal(builder.allowedInSetPool(data.cardById('ex11-13'),['ex13']),false);
 assert.equal(builder.allowedInSetPool(data.cardById('ex12-82'),['ex13']),false);
});
test('CPU accepts EX Holon Phantoms decks with their permitted Delta Species Energy support',()=>{
 for(let seed=0;seed<4;seed++){
  const result=cpu.generate({sets:['ex13'],type:'Fighting',seed});
  assert.ok(result.ok,`seed ${seed}: ${result.error}`);
  assert.equal(result.cards.length,30);
  assert.ok(data.validateDeck(result.cards).ok);
  assert.ok(result.cards.every(id=>builder.allowedInSetPool(data.cardById(id),['ex13'])));
 }
});
function rockSlide(defenderId){
 const pool=cpu.generate({sets:['ex12'],type:'Fighting',seed:7}).cards;
 const s=core.createBattle({format:'classic',playerDeck:pool,opponentDeck:pool,seed:1337,firstSide:'player',playerEnergyTypes:['Fighting'],opponentEnergyTypes:['Fighting']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot('ex12-34',2,'g');
 s.sides.opponent.active=core.makePokemonSlot(defenderId,2,'d');
 s.sides.player.active.energy={Fighting:4};s.sides.opponent.active.energy={};
 s.sides.opponent.bench=[core.makePokemonSlot('ex12-57',2,'b0'),core.makePokemonSlot('ex12-57',2,'b1')];
 s.sides.opponent.bench.forEach((p,i)=>p.benchSlot=i);
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(action);
 core.applyAction(s,'player',action);
 return s;
}
test('Legend Maker Graveler Rock Slide deals 20 to neutral Active AND 10 to each of two Bench targets',()=>{
 const s=rockSlide('ex12-57');
 assert.equal(s.sides.opponent.active.damage,20);
 assert.deepEqual(s.sides.opponent.bench.map(p=>p.damage),[10,10]);
 assert.equal(s.log.find(l=>l.type==='attack')?.damage,20);
});
test('Rock Slide can deal zero to a Fighting-resistant Active while still dealing 10 to Bench',()=>{
 // EX Legend Maker Aerodactyl has -30 Fighting Resistance.
 const s=rockSlide('ex12-1');
 assert.equal(s.sides.opponent.active.damage,0);
 assert.deepEqual(s.sides.opponent.bench.map(p=>p.damage),[10,10]);
 assert.match(s.log.find(l=>l.type==='attack')?.damageReason||'',/Fighting resistance/);
});

test('Special Darkness/Metal Energy is never padded into unrelated single-type Holon Phantoms decks',()=>{
 // Previously, this final fallback silently filled Grass/Psychic/Water decks
 // with four copies of EX Holon Phantoms Special Darkness Energy, despite
 // neither paying the printed attack costs nor activating the +10 bonus.
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless']){
  for(const seed of [31,62,93,124,155]){
   const result=builder.buildDeck(allOwned,{sets:['ex13'],types:[type],style:'competitive',randomSeed:seed});
   assert.ok(result.ok,`${type}/${seed}: ${result.errors?.join('; ')}`);
   assert.equal(result.cards.length,30);
   const pokemon=result.cards.map(data.cardById).filter(c=>c?.kind==='pokemon');
   const validDark= pokemon.some(c=>(c.types||[]).includes('Darkness')||/^Dark\s/i.test(c.name||''));
   const validMetal=pokemon.some(c=>(c.types||[]).includes('Metal'));
   if(!validDark)assert.ok(!result.cards.includes('ex13-94'),`${type}/${seed}: dead Darkness Energy`);
   if(!validMetal)assert.ok(!result.cards.includes('ex13-95'),`${type}/${seed}: dead Metal Energy`);
   assert.ok(data.validateDeck(result.cards).ok);
  }
 }
});
test('Sharpedo δ uses Holon FF rather than Special Darkness Energy, without losing legal support',()=>{
 const deck=build();assert.ok(deck.ok);
 assert.deepEqual(holon(deck.cards),['ex11-104','ex11-104']);
 assert.ok(!deck.cards.includes('ex13-94'));
 assert.ok(!deck.cards.includes('ex13-95'));
 assert.ok(!deck.cards.includes('ex13-97'));
});
test('Special Darkness and Metal Energy can still be included when their bonus benefits the deck',()=>{
 const dark=builder.buildDeck(allOwned,{sets:['ex13'],types:['Darkness'],focusCardId:'ex13-101',randomSeed:3});
 const metal=builder.buildDeck(allOwned,{sets:['ex13'],types:['Metal'],focusCardId:'ex13-58',randomSeed:3});
 assert.ok(dark.ok,dark.errors?.join('; '));
 assert.ok(metal.ok,metal.errors?.join('; '));
 assert.ok(dark.cards.includes('ex13-94'),'Mightyena ex should be able to use Special Darkness Energy');
 assert.ok(metal.cards.includes('ex13-95'),'Aron should be able to use Special Metal Energy');
});
