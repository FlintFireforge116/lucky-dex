'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const base=path.resolve(__dirname,'../app/src/main/assets');
const neo=require(path.join(base,'tcg-classic-neo-genesis.js'));
const classic=require(path.join(base,'tcg-classic-battle-data.js'));
const core=require(path.join(base,'tcgp-battle-core.js'));
const fx=require(path.join(base,'tcgp-battle-effects.js'));
const build=require(path.join(base,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(base,'tcg-classic-opponents.js'));
const owned=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const make=(seed=1234)=>{
  const recipe=opponents.generate({seed:1234,sets:['neo1'],type:'Grass'});assert.equal(recipe.ok,true,recipe.error);
  const s=core.createBattle({format:'classic',playerDeck:recipe.cards,opponentDeck:recipe.cards,playerEnergyTypes:recipe.energyTypes,opponentEnergyTypes:recipe.energyTypes,firstSide:'player',seed});
  s.sides.player.active=core.makePokemonSlot('neo1-6',0,'hero');s.sides.opponent.active=core.makePokemonSlot('neo1-10',0,'foe');s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;s.turnNumber=5;s.activeSide='player';return s;
};
test('all 111 Neo Genesis cards have registered battle effects; only Basic Energy prints are excluded from 30-card decks',()=>{
 assert.equal(neo.CARDS.length,111);assert.equal(neo.coverage().battleEnabled,111);
 assert.ok(neo.CARDS.every(c=>c.battleEnabled&&c.support.status==='FULL'));
 for(const c of neo.CARDS){if(c.kind==='pokemon'){
  for(const a of c.attacks||[]){assert.equal(a.unimplemented,false,`${c.name} ${a.name} unimplemented`);if(a.effect)assert.equal(fx.supportsEffect(a.effect),true,`${c.name} ${a.name}`);}
  for(const a of c.abilities||[])assert.equal(fx.supportsEffect(a.effect),true,`${c.name} ${a.name}`);
 }}
 for(let n=106;n<=111;n++)assert.equal(neo.CARDS[n-1].deckEligible,false);
 for(let n of [19,104,105])assert.equal(neo.CARDS[n-1].deckEligible,true);
});
test('Special Darkness/Metal energy powers named attackers in Classic auto decks without changing Energy Zone types',()=>{
 for(const [id,special] of [['neo1-25','neo1-104'],['neo1-15','neo1-19'],['neo1-13','neo1-19']]){
  const result=build.buildDeck(owned,{style:'competitive',sets:['neo1'],focusCardId:id,randomSeed:902});
  assert.equal(result.ok,true,id+': '+result.errors);assert.ok(result.cards.includes(id),id+' featured');
  assert.ok(result.cards.includes(special),id+' requires '+special);
  assert.ok(result.energyTypes.every(t=>!['Darkness','Metal'].includes(t)),id+' separate Energy Zone');
 }
});
test('Darkness/Metal cards cannot become unpowerable main builds if the player does not own their Special Energy',()=>{
 const without=owned.filter(row=>!['neo1-104','neo1-19'].includes(row.gameplayId));
 for(let seed=1;seed<=35;seed++){
  const result=build.buildDeck(without,{style:'random',sets:['neo1'],randomSeed:seed});assert.equal(result.ok,true,'seed '+seed+' '+result.errors);
  const cards=result.cards.map(classic.cardById).filter(c=>c?.kind==='pokemon');
  for(const c of cards){for(const a of c.attacks||[]){assert.equal(String(a.cost).includes('D'),false,'Darkness cost missing Special Energy '+c.name);assert.equal(String(a.cost).includes('M'),false,'Metal cost missing Special Energy '+c.name);}}
 }
});
test('Final Blow increases Heracross Megahorn from 60 to 120 at 20 remaining HP',()=>{
 let checked=0;for(let seed=81377;seed<81397;seed++){
  const state=make(seed),p=state.sides.player.active;p.energy.Grass=3;p.damage=40;
  const action=core.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
  assert.ok(action,'Heracross attack legal');core.applyAction(state,'player',action);
  const hit=state.log.filter(a=>a.type==='attack'&&a.side==='player').at(-1);
  if(hit&&hit.damage>0){assert.equal(hit.damage,120);checked++;}
 }assert.ok(checked>0,'at least one successful coin flip must show boosted 120 damage');
});
test('Neo Super Scoop Up returns entire stack, Energy and attached Tool to hand',()=>{
 const state=make(),p=state.sides.player.active,ss=state.sides.player;
 p.stack=['neo1-61','neo1-49','neo1-7'];p.cardId='neo1-7';p.energy.Grass=2;
 p.specialEnergy=[{uid:'en1',cardId:'neo1-105'}];p.tool={uid:'t1',cardId:'neo1-86'};
 const ref={uid:'test-super-scoop',cardId:'neo1-98'};
 fx.applyEffect({type:'scoopUp',target:'selfPokemon'},{...core.effectContext(state,'player',{target:'active'}),trainerRef:ref,action:{target:'active'}});
 assert.equal(ss.active,null);
 const ids=ss.hand.map(r=>r.cardId);
 for(const id of ['neo1-61','neo1-49','neo1-7','neo1-105','neo1-86'])assert.ok(ids.includes(id),id);
 assert.equal(ids.filter(id=>id==='neo1-108').length,2);
});
test('Ecogym returns discarded non-Colorless Basic and Special Energy to original owner hand',()=>{
 const s=make(),foe=s.sides.opponent;foe.active.energy.Water=1;foe.active.specialEnergy=[{uid:'sp-x',cardId:'neo1-104'}];s.stadium={uid:'stadium',cardId:'neo1-84',ownerSide:'player'};
 const ctx={...core.effectContext(s,'player',{target:'opponentActive'}),action:{target:'opponentActive'}};
 fx.applyEffect({type:'discardEnergyCard',target:'opponentActive',energyType:'Water',amount:1},ctx);
 assert.equal(foe.active.energy.Water,0);assert.ok(foe.hand.some(r=>r.cardId==='neo1-111'));
 fx.applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},ctx);
 assert.equal(foe.active.specialEnergy.length,0);assert.ok(foe.hand.some(r=>r.cardId==='neo1-104'));
});
test('Baby Pokémon coin rule guards against attacks without removing player agency',()=>{
 const s=make(9382);s.sides.opponent.active=core.makePokemonSlot('neo1-20',0,'baby');s.sides.player.active.energy.Grass=3;
 const action=core.legalActions(s,'player').find(a=>a.type==='attack');assert.ok(action);
 core.applyAction(s,'player',action);assert.ok(s.log.some(x=>x.type==='coin'&&x.reason==='Neo Baby Pokémon rule'));
});
test('Super Energy Retrieval takes discarded Basic Energy into hand only after two hand-card discards',()=>{
 const s=make(),ss=s.sides.player;ss.hand=[{uid:'junk-a',cardId:'neo1-60'},{uid:'junk-b',cardId:'neo1-61'}];ss.energyDiscard={Grass:3};
 const ctx=core.effectContext(s,'player',{trainerRef:{uid:'trainer',cardId:'neo1-89'}},ss.active);
 fx.applyEffect({type:'neoRule',rule:'superEnergyRetrieval'},ctx);
 assert.equal(s.phase,'effectChoice');
 for(let n=0;n<2;n++){
  const action=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceHandIndex!=null);
  assert.ok(action,'choose hand card to discard');core.applyAction(s,'player',action);
 }
 assert.equal(s.phase,'effectChoice','next step must offer discarded Energy selection');
 const pick=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===0);
 assert.ok(pick,'a discarded Grass Energy must be a selectable reward');core.applyAction(s,'player',pick);
 assert.equal(ss.hand.filter(r=>r.cardId==='neo1-108').length,1);assert.equal(ss.energyDiscard.Grass,2);
});
test('Final Blow does not activate without the HP threshold or while a Special Condition disables the Power',()=>{
 for(const disabled of ['hp','status']){
  let hit=false;
  for(let seed=82900;seed<82940;seed++){
   const s=make(seed),p=s.sides.player.active;p.energy.Grass=3;p.damage=disabled==='hp'?20:40;
   if(disabled==='status')p.conditions.confusion=true;
   const attack=core.legalActions(s,'player').find(x=>x.type==='attack');assert.ok(attack);
   core.applyAction(s,'player',attack);
   const log=s.log.filter(x=>x.type==='attack'&&x.side==='player').at(-1);
   if(log?.damage>0){assert.equal(log.damage,60);hit=true;break;}
  }assert.ok(hit,disabled+' should see a successful attack');
 }
});
test('Time Capsule restores virtual discarded Basic Energy for each player, then locks further Trainers',()=>{
 const s=make(),player=s.sides.player,foe=s.sides.opponent;player.energyDiscard={Grass:1};foe.energyDiscard={Water:1};
 fx.applyEffect({type:'neoRule',rule:'timeCapsule'},core.effectContext(s,'player',{},player.active));
 assert.equal(s.phase,'effectChoice');
 let action=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===0);assert.ok(action);
 core.applyAction(s,'player',action);assert.ok(foe.deck.some(r=>r.cardId==='neo1-111'));assert.equal(foe.energyDiscard.Water,0);
 action=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===0);assert.ok(action);
 core.applyAction(s,'player',action);assert.ok(player.deck.some(r=>r.cardId==='neo1-108'));assert.equal(player.energyDiscard.Grass,0);
 assert.equal(player.neoTrainerLockTurn,s.turnNumber);
});
test('Energy Charge chooses discarded Basic Energy and shuffles it into the deck',()=>{
 let succeeded=false;
 for(let seed=200;seed<250;seed++){
  const s=make(seed),player=s.sides.player;player.energyDiscard={Fire:2};
  fx.applyEffect({type:'neoRule',rule:'energyCharge'},core.effectContext(s,'player',{},player.active));
  if(s.phase!=='effectChoice')continue;
  const action=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===0);assert.ok(action);
  core.applyAction(s,'player',action);assert.equal(player.energyDiscard.Fire,1);
  assert.ok(player.deck.some(r=>r.cardId==='neo1-107'));succeeded=true;break;
 }assert.ok(succeeded,'a successful Energy Charge flip must allow a real choice');
});
test('Darkness Energy recoil occurs at the end of the turn except on Darkness Pokémon',()=>{
 let s=make();s.sides.player.active.specialEnergy.push({uid:'dark-ref',cardId:'neo1-104'});
 core.applyAction(s,'player',{type:'endTurn'});assert.equal(s.sides.player.active.damage,10);
 s=make();s.sides.player.active=core.makePokemonSlot('neo1-25',0,'dark-attacker');s.sides.player.active.specialEnergy.push({uid:'dark-ref',cardId:'neo1-104'});
 core.applyAction(s,'player',{type:'endTurn'});assert.equal(s.sides.player.active.damage,0);
});
