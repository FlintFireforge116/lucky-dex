'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const A='../app/src/main/assets/';const core=require(A+'tcgp-battle-core.js'),fx=require(A+'tcgp-battle-effects.js'),data=require(A+'tcg-classic-battle-data.js'),cpu=require(A+'tcg-classic-opponents.js');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const cp=(id,foeId='ex12-84')=>{
 const deck=cpu.generate({sets:['ex13'],type:'Metal',seed:17}).cards;const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:1337,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(id,2,'pa');s.sides.opponent.active=core.makePokemonSlot(foeId,2,'oa');
 for(const side of ['player','opponent'])s.sides[side].active.energy={};
 s.sides.player.active.energy=Object.fromEntries(types.map(t=>[t,4]));s.sides.player.bench=[core.makePokemonSlot('ex13-58',2,'pb')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex13-58',2,'ob0'),core.makePokemonSlot('ex13-58',2,'ob1'),core.makePokemonSlot('ex13-58',2,'ob2')];s.sides.opponent.bench.forEach((p,i)=>p.benchSlot=i);
 return s;
};
const attack=(s,i=0)=>{const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(a,'Attack missing');core.applyAction(s,'player',a);return s;};
const actions=s=>core.legalActions(s,s.choiceSide||s.activeSide).filter(a=>a.type==='effectChoice');
const choose=(s,pred)=>{assert.equal(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));const a=actions(s).find(pred);assert.ok(a,'Missing choice '+JSON.stringify(actions(s)));core.applyAction(s,s.choiceSide||s.activeSide,a);return s;};
function settle(s){for(let i=0;s.phase==='effectChoice'&&i<20;i++)choose(s,a=>!a.choiceSkip||a.choiceSkip);assert.notEqual(s.phase,'effectChoice','stuck');return s;}
test('Deoxys Energy Loop returns 2 Energy cards of the chosen type, not whichever types first',()=>{
 const s=cp('ex13-3'),p=s.sides.player.active;p.energy={Darkness:4};const before=s.sides.player.hand.length;
 attack(s);assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceOption===0);choose(s,a=>a.choiceOption===0);
 assert.equal(p.energy.Darkness,2);assert.equal(s.sides.player.hand.length,before+2);
});
test('Deoxys Energy Loop lets player return a Special Energy',()=>{
 const s=cp('ex13-3'),p=s.sides.player.active;p.energy={Darkness:3};p.specialEnergy=[{uid:'react',cardId:'ex12-82'}];attack(s);
 assert.ok(actions(s).some(a=>String(a.choiceLabel).includes('React')));
 choose(s,a=>String(a.choiceLabel).includes('React'));choose(s,a=>a.choiceOption===0);
 assert.equal(p.specialEnergy.length,0);
});
test('Rotating Claws spends attached Energy before choosing a different discarded Energy',()=>{
 const s=cp('ex13-14'),p=s.sides.player.active;p.energy={Lightning:1,Metal:1,Water:2};s.sides.player.energyDiscard={Fire:1};attack(s);
 assert.ok(actions(s).some(a=>String(a.choiceLabel).includes('Discard')));
 choose(s,a=>String(a.choiceLabel).includes('Discard Water'));
 assert.equal(p.energy.Water,1);
 assert.ok(actions(s).some(a=>String(a.choiceLabel).includes('Fire')));
 choose(s,a=>String(a.choiceLabel).includes('Fire'));
 assert.equal(p.energy.Fire,1);assert.equal(s.sides.player.energyDiscard.Fire,0);
});
test('Rotating Claws allows declining the optional Energy exchange',()=>{
 const s=cp('ex13-14'),p=s.sides.player.active;p.energy={Lightning:1,Metal:1,Water:2};attack(s);
 assert.ok(actions(s).some(a=>a.choiceSkip));choose(s,a=>a.choiceSkip);
 assert.equal(p.energy.Water,2);
});
test('Gyarados Star All-out Blast mills until one card left and gains +20 per Energy card',()=>{
 const s=cp('ex13-102'),p=s.sides.player;p.active.energy={Fire:4};p.deck=[{uid:'1',cardId:'ex13-98'},{uid:'2',cardId:'ex13-95'},{uid:'3',cardId:'ex13-58'},{uid:'4',cardId:'ex13-59'}];
 attack(s,1);settle(s);assert.equal(s.sides.opponent.active.damage,90);assert.deepEqual(p.discard.slice(-3).map(x=>x.uid),['1','2','3']);assert.equal(p.deck.length,1);
});
test('Mew ex Devo Crush still deals its 50 base damage and never forces an Energy discard',()=>{
 const s=cp('ex13-100'),p=s.sides.player.active;p.energy={Psychic:3};s.sides.opponent.active.stack=['ex13-58','ex12-84'];attack(s,1);
 assert.equal(s.sides.opponent.active.damage,50);assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceOption===0);assert.equal(p.energy.Psychic,3);
 assert.equal(s.sides.opponent.active.cardId,'ex12-84');
});
test('Mew ex Devo Crush permits optional devolution after actually discarding 2 Energy',()=>{
 const s=cp('ex13-100'),p=s.sides.player.active;p.energy={Psychic:3};s.sides.opponent.active.stack=['ex12-69','ex12-84'];attack(s,1);
 choose(s,a=>a.choiceOption===1);choose(s,a=>a.choiceOption===0);choose(s,a=>a.choiceOption===0);choose(s,a=>a.choiceOption===1);
 assert.equal(p.energy.Psychic,1);assert.equal(s.sides.opponent.active.cardId,'ex12-69');
});
test('Crystal Laser next-own-turn buff works two turns later, not on the opponent turn',()=>{
 const s=cp('ex13-5'),a=s.sides.player.active,d=s.sides.opponent.active;attack(s);
 assert.equal(a.ex13NextAttackBonusUntil,12);s.turnNumber=11;
 const opp=fx.attackDamageWithState(s,'player',a,'opponent',d,20,data.cardById);
 s.turnNumber=12;const mine=fx.attackDamageWithState(s,'player',a,'opponent',d,20,data.cardById);
 assert.equal(mine-opp,40);
});
test('Raichu Zzzap ignores Weakness and Resistance when targeting a Poké-Power holder',()=>{
 const s=cp('ex13-15','ex13-11');const foe=s.sides.opponent.active;foe.weaknessOverride='Metal';attack(s,0);assert.equal(foe.damage,20);
});
test('Regirock Rock Slide targets just two Benched Pokémon, not every Bench slot',()=>{
 const s=cp('ex13-28');s.sides.player.active.energy={Fighting:4};attack(s);
 choose(s,a=>a.choiceBenchIndex===0);choose(s,a=>a.choiceBenchIndex===1);
 assert.deepEqual(s.sides.opponent.bench.map(x=>x.damage),[10,10,0]);
});
test('Rayquaza Flamethrower discards an attached Fire Energy',()=>{
 const s=cp('ex13-26');const p=s.sides.player.active;p.energy={Fire:2,Colorless:1};attack(s,1);
 assert.equal(p.energy.Fire,1);assert.equal(s.sides.player.energyDiscard.Fire,1);
});
test('Holon Phantoms Root Fossil heals between turns',()=>{
 const s=cp('ex13-93');s.sides.player.active.damage=20;core.checkup(s);assert.equal(s.sides.player.active.damage,10);
});
test('All 111 cards keep original art, card-identity, rules and active set registration',()=>{
 const set=require(A+'tcg-classic-holon-phantoms.js');assert.equal(set.CARDS.length,111);
 assert.equal(new Set(set.CARDS.map(c=>c.id)).size,111);assert.ok(set.CARDS.every(c=>c.image?.includes('images.pokemontcg.io/ex13/')));
 assert.ok(set.CARDS.every(c=>c.deckMeta&&Array.isArray(c.deckMeta.roles)&&Array.isArray(c.deckMeta.energyTypes)));
});
test('Aerodactyl Primal Light selects one specific Basic Energy from the Energy Zone',()=>{
 const s=cp('ex13-35'),p=s.sides.player;p.energySupply=['Water','Fire'];const action=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='ex13-35');assert.ok(action);core.applyAction(s,'player',action);
 assert.ok(actions(s).some(a=>String(a.choiceLabel).includes('Fire')));
 choose(s,a=>String(a.choiceLabel).includes('Fire'));
 assert.deepEqual(p.energySupply,['Water']);assert.ok(p.hand.some(ref=>data.cardById(ref.cardId)?.subtype==='Fire'));
});
test('Mr. Stone Project offers independent Basic Energy selections',()=>{
 const s=cp('ex13-58'),p=s.sides.player;p.hand=[{uid:'st',cardId:'ex13-88'}];p.energySupply=['Water','Fire','Water'];
 const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex13-88');assert.ok(action);core.applyAction(s,'player',action);
 choose(s,a=>a.choiceOption===0);choose(s,a=>String(a.choiceLabel).includes('Fire'));choose(s,a=>String(a.choiceLabel).includes('Water'));
 assert.deepEqual(p.energySupply,['Water']);assert.deepEqual(p.hand.filter(ref=>data.cardById(ref.cardId)?.basicEnergy).map(ref=>data.cardById(ref.cardId).subtype).sort(),['Fire','Water']);
});
test('Mew Super Psywave places damage counters without doubling for Weakness',()=>{
 const s=cp('ex13-111','ex13-27'),foe=s.sides.opponent.active;foe.energy={Water:1};foe.specialEnergy=[{uid:'h',cardId:'ex13-98'}];
 attack(s);choose(s,a=>a.choiceTarget==='active');assert.equal(foe.damage,20);
});
test('Mawile Feint Attack ignores Weakness and Resistance',()=>{
 const s=cp('ex13-23','ex13-29'),foe=s.sides.opponent.active;foe.weaknessOverride='Metal';
 attack(s);choose(s,a=>a.choiceTarget==='active');assert.equal(foe.damage,10);
});
test('Trapinch Big Bite does 10 damage AND prevents retreat',()=>{
 const s=cp('ex13-84','ex13-59'),foe=s.sides.opponent.active;attack(s);assert.equal(foe.damage,10);assert.ok(foe.locks?.some(l=>l.action==='retreat'));
});
test('Kabutops Vital Drain heals after a KO and removes its conditions',()=>{
 const s=cp('ex13-9','ex13-58'),a=s.sides.player.active,d=s.sides.opponent.active;a.damage=70;a.conditions={burn:true};d.damage=10;s.sides.player.active.energy={Lightning:4};attack(s);
 assert.equal(a.damage,0);assert.deepEqual(a.conditions,{});
});
test('Holon Castform contributes two Energy units to Super Psywave and Power Blow',()=>{
 const s=cp('ex13-111','ex13-99'),foe=s.sides.opponent.active;foe.energy={};foe.specialEnergy=[{uid:'cast',cardId:'ex13-44',provides:{Miracle:2}}];
 attack(s);choose(s,a=>a.choiceTarget==='active');assert.equal(foe.damage,20);
 const c=cp('ex13-99'),p=c.sides.player.active;p.energy={};p.specialEnergy=[{uid:'cast',cardId:'ex13-44',provides:{Miracle:2}}];attack(c);assert.equal(c.sides.opponent.active.damage,40);
});
test('Form Change searches older compatible Deoxys prints as well as Holon Phantoms forms',()=>{
 const s=cp('ex13-3'),p=s.sides.player.active;p.energy={Darkness:2};s.sides.player.deck.unshift({uid:'old',cardId:'ex8-16'});
 const a=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='ex13-3');assert.ok(a);core.applyAction(s,'player',a);
 assert.ok(actions(s).some(x=>x.choiceDeckIndex===0));choose(s,x=>x.choiceDeckIndex===0);assert.equal(p.cardId,'ex8-16');
});
test('Water-only Latios may have a minority Latias δ Bench partner without requiring Fire Energy',()=>{
 const s=cpu.generate({sets:['ex13'],type:'Water',seed:7});assert.ok(s.ok,s.error);assert.deepEqual(s.energyTypes,['Water']);
 assert.ok(s.cards.includes('ex13-12'));assert.ok(s.cards.includes('ex13-11'));
 const decks=require(A+'tcg-classic-decks.js');assert.deepEqual(decks.analyzeDeck(s.cards,s.energyTypes).missingEnergyTypes,[]);
});
test('Holon Fossil is not selected without a Fossil evolution target',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(const seed of [1,5,7]){
  const r=cpu.generate({sets:['ex13'],type,seed});assert.ok(r.ok,`${type}:${seed}: ${r.error}`);
  if(r.cards.includes('ex13-86'))assert.ok(r.cards.some(id=>['Omanyte','Kabuto','Aerodactyl','Aerodactyl ex','Lileep','Anorith'].includes((data.cardById(id)?.name||'').replace(/\s*δ\s*$/u,''))),`${type}:${seed}`);
 }
});

test('Fossil-focused decks preserve the prerequisite Trainer Fossil and may use up to 2 Holon Fossil support',()=>{
 const builder=require(A+'tcg-classic-deck-builder.js');
 const owned=data.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 const lines=[['ex13-1','ex13-91'],['ex13-9','ex13-92'],['ex13-13','ex13-92'],['ex13-35','ex13-92']];
 for(const [focus,fossil] of lines){
  const deck=builder.buildDeck(owned,{sets:['ex13'],focusCardId:focus,style:'competitive',randomSeed:42});
  assert.ok(deck.ok,focus+': '+deck.errors);assert.equal(deck.cards.length,30);
  assert.ok(deck.cards.includes(focus));assert.ok(deck.cards.includes(fossil),focus+' must have its playable Fossil Basic');
  const holonCount=deck.cards.filter(id=>id==='ex13-86').length;
  assert.ok(holonCount>=1&&holonCount<=2,focus+' Holon Fossil copies: '+holonCount);
 }
});
test('Filling a saved deck restores a missing Fossil prerequisite without changing its chosen evolution',()=>{
 const builder=require(A+'tcg-classic-deck-builder.js');
 const owned=data.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 const r=builder.buildDeck(owned,{sets:['ex13'],cards:['ex13-1'],focusCardId:'ex13-58',style:'competitive',randomSeed:42});
 assert.ok(r.ok,String(r.errors));assert.ok(r.cards.includes('ex13-1'));assert.ok(r.cards.includes('ex13-91'));
});
