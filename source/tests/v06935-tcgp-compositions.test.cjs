const test=require('node:test'),assert=require('node:assert/strict');const N=require('../scripts/lib/tcgp-normalize.cjs'),E=require('../app/src/main/assets/tcgp-battle-effects.js');
const cases=[
 ["If your opponent's Active Pokémon is Poisoned, this attack does 50 more damage.",{type:'bonusDamage',amount:50,condition:{type:'opponentStatus',status:'poison'}}],
 ["If your opponent's Active Pokémon is a Pokémon ex, this attack does 70 more damage.",{type:'bonusDamage',amount:70,condition:{type:'opponentEx'}}],
 ['This attack does 20 more damage for each {G} Energy attached to this Pokémon.',{type:'energyDamage',amount:20,source:'self',energyType:'Grass',mode:'add'}],
 ["This attack does 20 more damage for each of your opponent's Benched Pokémon.",{type:'benchCountDamage',amount:20,side:'opponent',mode:'add'}],
 ['Flip 2 coins. This attack does 20 more damage for each heads.',{type:'coinDamage',coins:2,amount:20,mode:'add'}],
 ['Move all {P} Energy from this Pokémon to 1 of your Benched Pokémon.',{type:'moveEnergy',source:'self',target:'selfBench',energyType:'Psychic',amount:'all'}],
 ['Move an Energy from 1 of your Benched Pokémon to your Active Pokémon.',{type:'moveEnergy',source:'selfBench',target:'selfActive',amount:1}],
 ['Put 1 random {G} Pokémon from your deck into your hand.',{type:'search',filter:{kind:'pokemon',subtype:'Grass'},amount:1,source:'deck',random:true}],
 ["Flip a coin. If tails, during your next turn, this Pokémon can't attack.",{type:'coinFlip',heads:{type:'noop'},tails:{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'}}],
 ['Flip a coin. If heads, this attack does 40 more damage. If tails, this Pokémon also does 20 damage to itself.',{type:'coinFlip',heads:{type:'bonusDamage',amount:40},tails:{type:'selfDamage',amount:20}}],
 ];
for(const [text,effect]of cases)test('whole-text deterministic composition: '+text,()=>{const r=N.compileEffect(text);assert.equal(r.supported,true);assert.deepEqual(r.effect,effect);assert.deepEqual(E.validateEffect(r.effect),[]);});
test('compound compiler never drops an unrecognized clause or guesses an independent target',()=>{
 assert.equal(N.compileEffect('Flip a coin. If heads, draw 2 cards. Then turn all Pokémon into Magikarp.').supported,false);
 assert.equal(N.compileEffect('Heal 20 damage from 1 of your Pokémon. Take a {G} Energy from your Energy Zone and attach it to 1 of your Benched Pokémon.').supported,false);
 assert.equal(N.compileEffect('Flip a coin. If tails, this attack does nothing. Discard all Energy from this Pokémon.').supported,false);
 assert.equal(N.compileEffect("Flip a coin. If heads, heal 20 damage from 1 of your Pokémon. If tails, this attack also does 20 damage to 1 of your opponent's Benched Pokémon.").supported,false);
 assert.equal(N.compileEffect('Flip a coin. If heads, this attack does 40 more damage. This Pokémon also does 20 damage to itself.').supported,false);
});
test('one shared toss resolves heads bonus or tails recoil, not two independent random choices',()=>{
 const effect=N.compileEffect(cases[9][0]).effect;assert.ok(effect);for(const [random,wantDamage,wantRecoil]of [[()=>.1,50,0],[()=>.9,10,20]]){const slot={damage:0},s={log:[],sides:{player:{active:slot,bench:[]},opponent:{active:{damage:0},bench:[]}}};const ctx={state:s,side:'player',foeSide:'opponent',attacker:slot,defender:s.sides.opponent.active,cardById:()=>({}),random};const r=E.resolveAttack({damage:10,effect},ctx);for(const e of r.pendingEffects)E.applyEffect(e,ctx);assert.equal(r.damage,wantDamage);assert.equal(slot.damage,wantRecoil);assert.equal(s.log.filter(e=>e.type==='coin').length,1);}
});
