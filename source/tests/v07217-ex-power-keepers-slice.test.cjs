'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const ex16=require(A+'tcg-classic-power-keepers'),classic=require(A+'tcg-classic-battle-data'),builder=require(A+'tcg-classic-deck-builder'),opponents=require(A+'tcg-classic-opponents'),sets=require(A+'tcg-classic-set-picker'),core=require(A+'tcgp-battle-core'),fx=require(A+'tcgp-battle-effects');
const ENERGIES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const oldDeck=opponents.generate({sets:['ex15'],seed:19,type:'Darkness'});
assert.ok(oldDeck.ok,oldDeck.error);
function duel(att,def='ex16-58'){
 const d=oldDeck.cards;
 const s=core.createBattle({format:'classic',playerDeck:d,opponentDeck:d,seed:17,firstSide:'player',playerEnergyTypes:ENERGIES,opponentEnergyTypes:ENERGIES});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';
 s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(att,4,'a');s.sides.opponent.active=core.makePokemonSlot(def,4,'b');
 s.sides.player.active.energy=Object.fromEntries(ENERGIES.map(t=>[t,5]));
 s.sides.opponent.bench=[core.makePokemonSlot('ex16-43',4,'c')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.bench=[core.makePokemonSlot('ex16-66',4,'d')];s.sides.player.bench[0].benchSlot=0;
 return s;
}
function hit(s,index=0){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===index);assert.ok(a,`attack ${s.sides.player.active.cardId}:${index} not legal`);core.applyAction(s,'player',a);return s;}
function choose(s){let n=0;while(s.phase==='effectChoice'&&n++<20){const side=s.choiceSide||s.activeSide;const choices=core.legalActions(s,side).filter(x=>x.type==='effectChoice');assert.ok(choices.length,'choice missing');core.applyAction(s,side,choices.find(x=>!x.choiceSkip)||choices[0]);}assert.ok(n<21,'choice not resolving');return s;}
test('ex16 catalogue contains exactly 108 canonical cards with full print, art and evolution data',()=>{
 assert.equal(ex16.CARDS.length,108);
 assert.equal(new Set(ex16.CARDS.map(x=>x.id)).size,108);
 assert.equal(ex16.SET.name,'EX Power Keepers');
 assert.equal(classic.cardById('ex16-94')?.name,'Flygon ex');
 assert.equal(classic.cardById('ex16-108')?.name,'Fighting Energy');
 for(const c of ex16.CARDS){assert.equal(classic.cardById(c.id),c);assert.match(c.image, new RegExp('ex16/'+c.number+'\\.png$'));assert.ok(c.rarity);if(c.kind==='pokemon'){assert.ok(c.hp>0&&c.stage&&c.types.length);for(const a of c.attacks){assert.ok(a.name&&a.cost!==undefined&&a.text&&!/special effect/i.test(a.text));}}}
 assert.equal(ex16.cardById('ex16-5').abilities[0].name,'Firestarter');
 assert.equal(ex16.cardById('ex16-8').attacks[0].name,'Max Energy Source');
 assert.equal(ex16.cardById('ex16-96').attacks[0].damage,150);
 assert.equal(ex16.cardById('ex16-108').deckEligible,false);
});
test('unsupported complex effects are not falsely marked as battle-ready',()=>{
 for(const n of [2,3,5,7,8,9,10,13,18,21,22,45,56,70,71,72,73,75,76,79,81,82,83,84,86,92,93,94,95,97,98,99,100,101,102]){
   const c=ex16.cardById('ex16-'+n);assert.equal(c.battleEnabled,false,c.id);assert.ok(c.support.reasons.length,c.id);
 }
 assert.equal(ex16.cardById('ex16-80').battleEnabled,true);
});
test('every enabled EX16 attack is understood by effects and can execute in live engine',()=>{
 let attacks=0;
 for(const c of ex16.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(let i=0;i<c.attacks.length;i++){
  const a=c.attacks[i];assert.equal(fx.validateEffect(a.effect).length,0,c.id+' '+a.name);
  const s=duel(c.id);if(c.id==='ex16-31'&&i===1)s.sides.opponent.active.conditions={sleep:true};assert.doesNotThrow(()=>choose(hit(s,i)),c.id+' '+a.name);attacks++;
 }
 assert.ok(attacks>=37,'want broad generic attack coverage, got '+attacks);
});
test('coin damage and 10-HP-per-counter scaling are not inflated tenfold',()=>{
 for(const [id,index,damage,expected] of [['ex16-43',0,30,30],['ex16-39',0,30,40]]){
  const s=duel(id);s.sides.player.active.damage=damage;hit(s,index);assert.equal(s.sides.opponent.active.damage,expected,id);
 }
});
test('EX Power Keepers appears in set picker, CPU and autobuilder allowed-set menus',()=>{
 assert.ok(sets.rows.some(x=>x[0]==='ex16'));
 assert.ok(builder.SET_IDS.includes('ex16'));
 assert.ok(opponents.SETS.includes('ex16'));
});
test('printed effects preserve statuses, Fossil identities, ex Prize rules and unique Star restrictions',()=>{
 const charizard=ex16.cardById('ex16-6');assert.equal(charizard.attacks[1].effect.status,'burn');
 const seviper=ex16.cardById('ex16-23');assert.equal(seviper.attacks[1].effect.amount,20);
 assert.equal(ex16.cardById('ex16-94').prizeCards,2);
 assert.equal(ex16.cardById('ex16-100').pokemonStar,true);
 assert.equal(ex16.cardById('ex16-85').fossilHp,50);
 assert.ok(classic.validateDeck(['ex16-2']).errors.some(e=>e.includes('cannot occupy')||e.includes('not battle-ready')));
});


test('Power Keepers Machamp body only grants +30 against Pokémon-ex in play',()=>{
 const a=duel('ex16-11','ex16-99');choose(hit(a,0));assert.equal(a.sides.opponent.active.damage,70);
 const b=duel('ex16-11','ex16-48');choose(hit(b,0));assert.equal(b.sides.opponent.active.damage,40);
});
test('Vigorous Aura applies to both active attackers, not bench or suppressed bodies',()=>{
 const a=duel('ex16-34','ex16-48');choose(hit(a,0));assert.equal(a.sides.opponent.active.damage,40);
 const b=duel('ex16-12','ex16-34');choose(hit(b,0));assert.equal(b.sides.opponent.active.damage,20);
 const c=duel('ex16-12','ex16-48');c.sides.player.bench=[core.makePokemonSlot('ex16-34',4,'m')];choose(hit(c,0));assert.equal(c.sides.opponent.active.damage,10);
});
test('Omastar Hydrocannon counts Water Energy not spent on Colorless cost',()=>{
 for(const [energy,expect] of [[{Water:2},30],[{Water:3},50],[{Water:4},70],[{Water:2,Fire:2},70]]){
  const s=duel('ex16-20','ex16-99');s.sides.player.active.energy=energy;choose(hit(s,1));assert.equal(s.sides.opponent.active.damage,expect,JSON.stringify(energy));
 }
});
test('Great Ball shows a Basic non-ex deck search and respects player selection',()=>{
 const s=duel('ex16-12');s.sides.player.deck=[{uid:'leaf',cardId:'ex16-43'},{uid:'forbidden',cardId:'ex16-92'},{uid:'train',cardId:'ex16-80'}];
 s.sides.player.hand.push({uid:'greatball',cardId:'ex16-77'});const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex16-77');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice');const choices=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.ok(choices.some(c=>c.choiceCardId==='ex16-43'));assert.ok(!choices.some(c=>c.choiceCardId==='ex16-92'));
 core.applyAction(s,'player',choices.find(c=>c.choiceCardId==='ex16-43'));
 assert.equal(s.sides.player.bench.some(x=>x.cardId==='ex16-43'),true);assert.notEqual(s.phase,'effectChoice');
});
test('Master Ball offers only Pokémon from top seven, then shuffles unused cards',()=>{
 const s=duel('ex16-12');s.sides.player.deck=[{uid:'train',cardId:'ex16-80'},{uid:'pika',cardId:'ex16-57'},{uid:'train2',cardId:'ex16-85'},{uid:'other',cardId:'ex16-43'}];s.sides.player.hand.push({uid:'master',cardId:'ex16-78'});
 const a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex16-78');assert.ok(a);core.applyAction(s,'player',a);
 const c=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');assert.ok(c.some(x=>x.choiceCardId==='ex16-57'));assert.ok(!c.some(x=>x.choiceCardId==='ex16-80'));
 core.applyAction(s,'player',c.find(x=>x.choiceCardId==='ex16-57'));assert.ok(s.sides.player.hand.some(x=>x.cardId==='ex16-57'));assert.notEqual(s.phase,'effectChoice');
});
test('All enabled printed Poké-Powers and Bodies pass the effect validator',()=>{
 for(const c of ex16.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'))for(const a of c.abilities||[]){assert.equal(fx.validateEffect(a.effect).length,0,c.id+' '+a.name);}
});
test('Dusclops Dark Mind and Magnemite Spark hit selected Bench for printed extra damage',()=>{
 for(const [id,index,benchDamage] of [['ex16-14',0,20],['ex16-54',1,10]]){
  const s=duel(id,'ex16-99');hit(s,index);choose(s);
  assert.equal(s.sides.opponent.bench[0].damage,benchDamage,id+' bench');
  assert.ok(s.sides.opponent.active.damage>0,id+' active');
 }
});
test('Vigoroth Strikes Back and Carvanha Rough Skin retaliate while Active',()=>{
 for(const id of ['ex16-41','ex16-47']){
  const s=duel('ex16-6',id);hit(s,0);choose(s);assert.equal(s.sides.player.active.damage,10,id);assert.equal(s.sides.opponent.active.damage,30,id);
 }
});
test('Aggron Terraforming provides a player-selected top-deck order',()=>{
 const s=duel('ex16-1','ex16-99');s.sides.player.deck=[{uid:'a1',cardId:'ex16-57'},{uid:'a2',cardId:'ex16-50'},{uid:'a3',cardId:'ex16-43'},{uid:'a4',cardId:'ex16-44'},{uid:'a5',cardId:'ex16-12'}];
 const act=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='ex16-1');assert.ok(act);
 core.applyAction(s,'player',act);assert.equal(s.phase,'effectChoice');
 for(const uid of ['a5','a4','a3','a2','a1']){const choices=core.legalActions(s,'player').filter(x=>x.type==='effectChoice');const action=choices.find(x=>s.sides.player.deck[x.choiceDeckIndex]?.uid===uid);assert.ok(action,uid);core.applyAction(s,'player',action);}
 assert.equal(s.phase,'battle');assert.deepEqual(s.sides.player.deck.map(x=>x.uid),['a5','a4','a3','a2','a1']);
});
test('Aron Dig Deep takes a physical Special Energy or a discarded basic Energy from the Zone',()=>{
 const a=duel('ex16-42','ex16-99');a.sides.player.discard=[{uid:'special',cardId:'ex15-86'}];hit(a,0);assert.equal(a.phase,'effectChoice');choose(a);
 assert.ok(a.sides.player.hand.some(x=>x.cardId==='ex15-86'));
 const b=duel('ex16-42','ex16-99');b.sides.player.energyDiscard={Fire:2};hit(b,0);assert.equal(b.phase,'effectChoice');choose(b);
 assert.equal(b.sides.player.energyDiscard.Fire,1);assert.ok(b.sides.player.hand.some(x=>x.cardId==='ex16-104'));
});
test('all nine EX Power Keepers-only CPU archetypes build legal, type-accurate 30-card decks',()=>{
 const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'];
 for(const type of types){const d=opponents.generate({sets:['ex16'],seed:3,type});assert.ok(d.ok,type+': '+d.error);assert.equal(d.cards.length,30,type);assert.ok(classic.validateDeck(d.cards).ok,type);assert.ok(d.cards.every(id=>id.startsWith('ex16-')&&ex16.cardById(id).battleEnabled),type);}
});
