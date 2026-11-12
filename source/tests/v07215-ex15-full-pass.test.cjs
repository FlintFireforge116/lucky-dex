'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const cards=require(A+'tcg-classic-battle-data'),ex15=require(A+'tcg-classic-dragon-frontiers'),builder=require(A+'tcg-classic-deck-builder'),opponents=require(A+'tcg-classic-opponents'),core=require(A+'tcgp-battle-core'),effects=require(A+'tcgp-battle-effects');
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const owned=ex15.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
const sampleDeck=opponents.generate({sets:['ex15'],type:'Fire',seed:92});assert.ok(sampleDeck.ok);
function battle(id='ex15-93',def='ex15-61'){
 const s=core.createBattle({format:'classic',playerDeck:sampleDeck.cards,opponentDeck:sampleDeck.cards,seed:19,firstSide:'player',playerEnergyTypes:TYPES,opponentEnergyTypes:TYPES});
 s.phase='battle';s.turnNumber=12;s.activeSide='player';s.sides.player.turnCount=10;s.sides.opponent.turnCount=10;
 s.sides.player.active=core.makePokemonSlot(id,4,'mine');s.sides.opponent.active=core.makePokemonSlot(def,4,'theirs');
 s.sides.player.active.energy=Object.fromEntries(TYPES.map(t=>[t,5]));
 s.sides.player.bench=[core.makePokemonSlot('ex15-25',4,'xatu1')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex15-61',4,'otherBench')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function focus(n,options={}){return builder.buildDeck(owned,{sets:['ex15'],focusCardId:'ex15-'+n,randomSeed:19,...options});}
function pokemonIds(result){return result.cards.filter(id=>cards.cardById(id)?.kind==='pokemon');}
function containsStage2ExLine(d){
 const mons=pokemonIds(d).map(cards.cardById);
 return mons.some(c=>c.pokemonEx&&c.stage==='Stage 2'&&builder.familyLine(c,mons).length===3);
}
test('all 101 Dragon Frontiers cards have distinct identities, printed text and battle readiness',()=>{
 assert.equal(ex15.CARDS.length,101);assert.equal(new Set(ex15.CARDS.map(c=>c.id)).size,101);
 assert.ok(ex15.CARDS.every(c=>c.battleEnabled&&c.deckEligible&&c.support.status==='FULL'));
 for(const c of ex15.CARDS){
  assert.equal(cards.cardById(c.id),c);assert.ok(c.image.endsWith(`/ex15/${c.number}.png`));
  if(c.kind==='pokemon'){
   assert.ok(c.name&&c.hp>0&&c.stage&&c.types.length,c.id);
   for(const a of c.attacks||[]){assert.ok(a.name&&a.cost!=null&&a.text&&!/special effect/i.test(a.text),c.id+' '+a.name);assert.equal(a.effect?.type,'neoRule');}
   for(const a of c.abilities||[])assert.ok(a.name&&a.text&&!/special effect/i.test(a.text),c.id+' '+a.name);
  }
 }
});
test('four Stage 2 ex Bench support mechanics have distinct metadata and conditions',()=>{
 for(const [n,kind] of [[25,'damage'],[40,'retreat'],[90,'hand-energy'],[94,'defense']]){
  const c=cards.cardById('ex15-'+n);
  assert.equal(c.deckMeta.stage2ExSupport,kind);assert.ok(c.deckMeta.roles.includes('stage2-ex-support'));
  assert.ok(c.deckMeta.synergy.includes('stage2-ex'));
 }
 assert.equal(cards.cardById('ex15-90').deckMeta.handBasicEnergySource,'hand');
 assert.equal(cards.cardById('ex15-95').deckMeta.handBasicEnergySource,'hand');
 assert.ok(cards.cardById('ex15-25').deckMeta.specialEnergyPayoffs.includes('stage2-ex-damage'));
});
test('Xatu focus always adds a complete available Stage 2 ex attacking family',()=>{
 const d=focus(25);assert.ok(d.ok,JSON.stringify(d.errors));assert.equal(d.cards.length,30);
 assert.ok(d.cards.includes('ex15-25'));assert.ok(containsStage2ExLine(d));
 const stage2=pokemonIds(d).map(cards.cardById).find(c=>c.pokemonEx&&c.stage==='Stage 2');
 assert.ok(builder.attackTypes(stage2).every(t=>d.energyTypes.includes(t)),'Energy supports beneficiary, not only Xatu');
 assert.equal(d.energyTypes.includes('Darkness'),false,'a Bench-only Body does not force Darkness');
});
test('Swellow and Altaria focused decks include complete Stage 2 ex lines and useful Energy',()=>{
 for(const n of [40,90]){const d=focus(n);assert.ok(d.ok,JSON.stringify(d.errors));assert.ok(d.cards.includes('ex15-'+n));assert.ok(containsStage2ExLine(d));
  const stage2=pokemonIds(d).map(cards.cardById).find(c=>c.pokemonEx&&c.stage==='Stage 2');
  assert.ok(builder.attackTypes(stage2).every(t=>d.energyTypes.includes(t)),n+' Energy mismatch');
 }
 assert.ok(focus(40).cards.includes('ex15-93'),'Fire Swellow should preserve compatible Gardevoir ex partnership');
 const altaria=focus(90);assert.ok(altaria.cards.includes('ex15-77'),'Altaria needs Basic Energy physically in hand, fetched by Mr. Stone');
});
test('Stage 2 ex focused decks gain Xatu and Swellow without off-type Energy dilution',()=>{
 for(const n of [91,92,93,94,98,99]){
  const d=focus(n);assert.ok(d.ok,JSON.stringify(d.errors));assert.ok(d.cards.includes('ex15-25'),'Xatu omitted for '+n);assert.ok(d.cards.includes('ex15-40'),'Swellow omitted for '+n);
  const attacker=cards.cardById('ex15-'+n);
  assert.ok(builder.attackTypes(attacker).every(t=>d.energyTypes.includes(t)),'main attack Energy lost for '+n);
 }
});
test('Typhlosion δ gets both Psychic cost and Fire Burn requirements, without imposing Fire on unrelated Pokémon',()=>{
 const d=focus(12);assert.ok(d.ok);assert.deepEqual(d.energyTypes,['Psychic','Fire']);
 const unrelated=focus(99);assert.ok(unrelated.ok);assert.deepEqual(unrelated.energyTypes,['Lightning']);
});
test('Tool-triggered Ledian and Quagsire get actual Tool cards before generic Supporter filler',()=>{
 for(const n of [18,21]){
  const d=focus(n);assert.ok(d.ok);assert.ok(d.cards.filter(id=>cards.cardById(id)?.trainerType==='Tool').length>=2,n+' no tools');
  assert.ok(d.cards.includes('ex15-81'),'compatible Strength Charm should appear');
 }
});
test('status metadata detects multi-status and indirect wording but not self-Sleep as attacking Sleep',()=>{
 assert.deepEqual(cards.cardById('ex15-13').deckMeta.inflicts.sort(),['burn','poison']);
 assert.ok(cards.cardById('ex15-16').deckMeta.inflicts.includes('paralysis'));
 assert.ok(cards.cardById('ex15-42').deckMeta.inflicts.includes('confusion'));
 assert.equal(cards.cardById('ex15-10').deckMeta.inflicts.includes('sleep'),false);
});
test('Extra Feather provides 10 attack damage per unsuppressed Xatu to allied Stage 2 ex on both sides',()=>{
 const s=battle('ex15-93');const active=s.sides.player.active,enemy=s.sides.opponent.active;
 const dmg=()=>effects.attackDamageWithState(s,'player',active,'opponent',enemy,30,cards.cardById);
 const one=dmg();assert.equal(one,40);
 const second=core.makePokemonSlot('ex15-25',4,'xatu2');second.benchSlot=1;s.sides.player.bench.push(second);assert.equal(dmg(),one+10);
 s.sides.player.bench=[];assert.equal(dmg(),30);
 active.cardId='ex15-90';assert.equal(dmg(),30,'Stage 1 ex cannot receive Extra Feather');
 s.sides.opponent.active.cardId='ex15-93';s.sides.opponent.active.energy={Fire:3};s.sides.opponent.bench[0].cardId='ex15-25';
 const mirror=effects.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',active,30,cards.cardById);
 assert.equal(mirror,40,'CPU side has the same Body bonus');
});
test('Altaria Extra Boost is not offered without physical hand Energy and Stage 2 ex target',()=>{
 const s=battle('ex15-90');s.sides.player.bench=[core.makePokemonSlot('ex15-93',4,'stage2')];s.sides.player.bench[0].benchSlot=0;
 s.sides.player.hand=[];
 const available=()=>core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId==='ex15-90');
 assert.equal(available().length,0,'must not offer inert hand-only Power');
 s.sides.player.hand=[{uid:'basic',cardId:'base1-98'}];assert.ok(available().length);
 s.sides.player.bench[0].cardId='ex15-61';assert.equal(available().length,0,'no Stage 2 ex target');
 s.sides.player.bench[0].cardId='ex15-93';
 const use=available()[0];core.applyAction(s,'player',use);
 const pickEnergy=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceHandIndex===0);assert.ok(pickEnergy);core.applyAction(s,'player',pickEnergy);
 const pickTarget=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceTarget==='bench'&&a.choiceBenchIndex===0);assert.ok(pickTarget);core.applyAction(s,'player',pickTarget);
 assert.equal(s.sides.player.bench[0].energy.Fire,1);assert.equal(s.sides.player.hand.length,0);
});
test('all 83 Pokémon prints can be focused into 30-card legal decks using available EX15 pool',()=>{
 let n=0;for(const c of ex15.CARDS.filter(c=>c.kind==='pokemon')){
  const d=focus(Number(c.number));assert.ok(d.ok,c.id+': '+d.errors);assert.equal(d.cards.length,30);
  assert.ok(cards.validateDeck(d.cards).ok,c.id+' deck not legal');assert.ok(d.cards.includes(c.id),c.id+' focus dropped');n++;
 }
 assert.equal(n,83);
});
test('opponent generation across all nine archetypes preserves legal deck and full Energy plan',()=>{
 for(const type of [...TYPES,'Colorless'])for(const seed of [2,21,73]){
  const d=opponents.generate({sets:['ex15'],type,seed});assert.ok(d.ok,type+' '+seed+' '+d.error);assert.equal(d.cards.length,30);
  assert.ok(cards.validateDeck(d.cards).ok,type+' invalid deck');assert.ok(d.energyTypes.includes(type)||d.energyTypes.some(t=>TYPES.includes(t)),type+' no energy');
 }
});
test('all EX15 Pokémon attack commands are executable when their printed Energy cost is supplied',()=>{
 let attempted=0,skipped=[];
 for(const card of ex15.CARDS.filter(c=>c.kind==='pokemon'))for(let index=0;index<(card.attacks||[]).length;index++){
  const s=battle(card.id,'ex15-61');
  s.sides.player.bench.push(core.makePokemonSlot('ex15-46',4,'bench2'));s.sides.player.bench[1].benchSlot=1;
  const action=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===index);
  if(!action){skipped.push(card.id+':'+index);continue;}
  assert.doesNotThrow(()=>core.applyAction(s,'player',action),card.id+' '+index);attempted++;
  let count=0;
  while(s.phase==='effectChoice'&&count++<16){
   const choices=core.legalActions(s,s.choiceSide||s.activeSide).filter(x=>x.type==='effectChoice');if(!choices.length)break;
   assert.doesNotThrow(()=>core.applyAction(s,s.choiceSide||s.activeSide,choices.find(x=>!x.choiceSkip)||choices[0]),card.id+' choice '+count);
  }
  assert.ok(count<17,card.id+' unresolved choice loop');
 }
 assert.ok(attempted>=95,'expected broad attack smoke coverage, got '+attempted);
 assert.deepEqual(skipped,[],skipped.join(', '));
});
