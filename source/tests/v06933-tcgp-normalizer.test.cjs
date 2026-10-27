const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const libPath=path.resolve(__dirname,'../scripts/lib/tcgp-normalize.cjs');
function api(){assert.ok(fs.existsSync(libPath),'Canonical normalizer is required');return require(libPath);}
function bulb(id='A1-001',extra={}){return {id,setId:'A1',name:'Bulbasaur',category:'Pokemon',hp:70,types:['Grass'],stage:'Basic',weaknesses:[{type:'Fire',value:'+20'}],retreat:1,attacks:[{name:'Vine Whip',cost:['Grass','Colorless'],damage:40}],...extra};}
test('identical art variants share gameplay while different rules with the same name stay distinct',()=>{
 const {normalizeCatalogue}=api();const result=normalizeCatalogue({prints:[{id:'a1-001',name:'Bulbasaur'},{id:'a1-227',name:'Bulbasaur'},{id:'a1-999',name:'Bulbasaur'}],mechanics:[bulb(),bulb('A1-227'),bulb('A1-999',{hp:80})],sets:[{id:'A1',name:'Genetic Apex',releaseDate:'2024-10-30'}],cutoff:'2026-10-27'});
 assert.equal(result.prints.length,3);assert.equal(result.cards.length,2);assert.equal(result.prints[1].gameplayId,'A1-001');assert.equal(result.prints[2].gameplayId,'A1-999');assert.equal(result.cards[0].hp,70);assert.equal(result.cards[0].attacks[0].cost,'GC');
});
test('missing mechanics remain explicitly unsupported and never guessed from a same-name card',()=>{
 const r=api().normalizeCatalogue({prints:[{id:'a1-001',name:'Bulbasaur'},{id:'a1-227',name:'Bulbasaur',health:70,type:'Grass'}],mechanics:[bulb()],sets:[{id:'A1',releaseDate:'2024-10-30'}],cutoff:'2026-10-27'});
 assert.equal(r.cards.length,2);assert.equal(r.cards[1].support.status,'UNSUPPORTED');assert.equal(r.cards[1].battleEnabled,false);assert.match(r.cards[1].support.reasons.join(' '),/mechanics/i);assert.notEqual(r.prints[0].gameplayId,r.prints[1].gameplayId);
});
test('whole effect text is consumed: unknown trailing restrictions cannot become a full flat attack',()=>{
 const {compileEffect}=api();assert.deepEqual(compileEffect('Heal 20 damage from this Pokémon.','attack').effect,{type:'healSelf',amount:20});
 assert.equal(compileEffect('Heal 20 damage from this Pokémon. Then win the game.','attack').supported,false);
 assert.equal(compileEffect('During your next turn, this Pokémon cannot perform an undocumented mechanic.','attack').supported,false);
});
test('released-set cutoff excludes previews and rejects prints from unknown sets',()=>{
 const r=api().normalizeCatalogue({prints:[{id:'a1-001',name:'Bulbasaur'},{id:'c1-001',name:'Preview'}],mechanics:[bulb()],sets:[{id:'A1',releaseDate:'2024-10-30'},{id:'C1',releaseDate:'2026-10-29'}],cutoff:'2026-10-27'});
 assert.equal(r.prints.length,1);assert.equal(r.excludedPrints.length,1);
 assert.throws(()=>api().normalizeCatalogue({prints:[{id:'zzz-001',name:'Missing'}],mechanics:[],sets:[],cutoff:'2026-10-27'}),/unknown set/i);
});
test('invalid combat metadata and unsupported Energy symbols never pass as FULL',()=>{
 const r=api().normalizeCatalogue({prints:[{id:'a1-001',name:'Bulbasaur'}],mechanics:[bulb('A1-001',{hp:NaN,attacks:[{name:'Invalid',cost:['Fake'],damage:'??'}]})],sets:[{id:'A1',releaseDate:'2024-10-30'}],cutoff:'2026-10-27'});
 assert.equal(r.cards[0].battleEnabled,false);assert.notEqual(r.cards[0].support.status,'FULL');assert.ok(r.cards[0].support.reasons.length>=2);
});
test('verified internal card keys propagate rules across reprints without guessing by name',()=>{
 const r=api().normalizeCatalogue({prints:[{id:'a1-001',name:'Bulbasaur'},{id:'a4b-001',name:'Bulbasaur'},{id:'a4b-002',name:'Bulbasaur'}],mechanics:[bulb()],sets:[{id:'A1',releaseDate:'2024-10-30'},{id:'A4b',releaseDate:'2025-09-30'}],cutoff:'2026-10-27',identityEvidence:{'A1-001':'cPK:000010','A4b-001':'cPK:000010','A4b-002':'cPK:013070'}});
 assert.equal(r.prints[1].gameplayId,'A1-001');assert.equal(r.cards.length,2);assert.equal(r.cards[1].support.status,'UNSUPPORTED');
});
test('conflicting detailed rules sharing an external key fail instead of silently merging',()=>{
 assert.throws(()=>api().normalizeCatalogue({prints:[{id:'a1-001',name:'Bulbasaur'},{id:'a1-227',name:'Bulbasaur'}],mechanics:[bulb(),bulb('A1-227',{hp:90})],sets:[{id:'A1',releaseDate:'2024-10-30'}],cutoff:'2026-10-27',identityEvidence:{'A1-001':'cPK:000010','A1-227':'cPK:000010'}}),/conflicting.*identity/i);
});
test('reusable lock, prevention, selected damage, random discard and repeated coin rules compile completely',()=>{
 const compile=api().compileEffect;
 const fixtures=[
  ["During your opponent's next turn, the Defending Pokémon can't retreat.",{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'}],
  ["This attack does 50 damage to 1 of your opponent's Pokémon.",{type:'selectedDamage',target:'opponentPokemon',amount:50}],
  ["Discard a random Energy from your opponent's Active Pokémon.",{type:'discardEnergy',target:'opponentActive',amount:1,random:true}],
  ['Flip a coin until you get tails. This attack does 40 more damage for each heads.',{type:'coinDamage',coins:'untilTails',amount:40,mode:'add'}],
  ["If this Pokémon has a Pokémon Tool attached, this attack does 50 more damage.",{type:'bonusDamage',amount:50,condition:{type:'selfHasTool'}}],
  ['The Pokémon this card is attached to gets +20 HP.',{type:'modifier',stat:'maxHp',amount:20,duration:'whileInPlay'}]
 ];
 for(const [text,effect]of fixtures){assert.deepEqual(compile(text).effect,effect,text);assert.equal(compile(text).supported,true,text);}
});
test('persistent Trainer contexts cannot silently consume unsupported one-shot effects',()=>{
 const card=api().normalizeMechanics({id:'A1-998',setId:'A1',name:'Test Tool',category:'Trainer',trainerType:'Tool',effect:'Draw 2 cards.'});
 assert.equal(card.battleEnabled,false);assert.match(card.support.reasons.join(' '),/activation context/i);
});
test('passive Stadium effects keep both-player scope and beneficiary filters',()=>{
 assert.deepEqual(api().compileEffect("Attacks used by Stage 1 Pokémon in play (both yours and your opponent's) do +10 damage to the opponent's Active Pokémon.",'trainer').effect,{type:'modifier',stat:'attackDamage',amount:10,duration:'whileInPlay',scope:'both',filter:{stage:'Stage 1'}});
});
test('Fossils preserve Trainer identity while providing explicit board and voluntary-discard rules',()=>{
 const c=api().normalizeMechanics({id:'A1-216',setId:'A1',name:'Helix Fossil',category:'Trainer',trainerType:'Item',effect:"Play this card as if it were a 40-HP Basic {C} Pokémon. At any time during your turn, you may discard this card from play. This card can't retreat."});
 assert.equal(c.battleEnabled,true);assert.equal(c.kind,'trainer');assert.equal(c.hp,40);assert.deepEqual(c.effect,{type:'playFossil',hp:40,subtype:'Colorless',canRetreat:false});assert.equal(c.ability.effect.type,'discardSelf');
});
test('hand resets and activated Energy movement retain structured choices',()=>{
 assert.deepEqual(api().compileEffect('Each player shuffles the cards in their hand into their deck, then draws that many cards.','trainer').effect,{type:'handShuffle',side:'both',draw:'same'});
 const a=api().compileAbility({name:'Test move',effect:'Once during your turn, you may move all {P} Energy from 1 of your Benched {P} Pokémon to your Active Pokémon.'});
 assert.equal(a.supported,true);assert.deepEqual(a.ability.effect,{type:'moveEnergy',source:'selfBench',target:'selfActive',energyType:'Psychic',amount:'all',sourceFilter:{subtype:'Psychic'}});
});
test('two independent target selections cannot be classified as one supported compound action',()=>{
 assert.equal(api().compileEffect('Heal 20 damage from 1 of your Pokémon. Take a {G} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.','trainer').supported,false);
});
