const test=require('node:test');
const assert=require('node:assert/strict');
const {compileEffect,compileAbility}=require('../scripts/lib/tcgp-normalize.cjs');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');

const cases=[
 ["Look at the top card of your deck. If that card is a {P} Pokémon, put it into your hand. If it is not a {P} Pokémon, put it on the bottom of your deck.",'trainer'],
 ["Draw a card for each Mega Evolution Pokémon ex in play (both yours and your opponent's).",'trainer'],
 ["Draw a card for each Poochyena you have in play.",'attack'],
 ["This attack does 20 damage to 1 of your opponent's Pokémon for each Energy attached to that Pokémon.",'attack'],
 ["During your opponent's next turn, this Pokémon takes −80 damage from attacks from your opponent's Pokémon ex.",'attack'],
 ["Discard 2 Energy from this Pokémon. During your opponent's next turn, this Pokémon takes −30 damage from attacks.",'attack']
];

test('final automatic/single-target tranche compiles',()=>{
 for(const [text,kind] of cases){const c=compileEffect(text,kind,0);assert.equal(c.supported,true,c.reason);assert.deepEqual(fx.validateEffect(c.effect),[]);}
 const poison=compileAbility({name:'More Poison',effect:"Your opponent's Active Pokémon takes +10 damage from being Poisoned."});
 assert.equal(poison.supported,true,poison.reason);
 const blissey=compileAbility({name:'Happy Chance',effect:'Once during your turn, you may remove a random Special Condition from your Active Pokémon.'});
 assert.equal(blissey.supported,true,blissey.reason);
});

test('selected Energy damage uses the chosen target Energy count',()=>{
 const c=compileEffect(cases[3][0],'attack',0);assert.equal(c.supported,true);
 const own={active:{uid:'p',cardId:'Tapu Lele',energy:{Psychic:1},conditions:{},damage:0},bench:[],hand:[],deck:[],discard:[]};
 const foe={active:{uid:'oa',cardId:'A',energy:{Water:1},conditions:{},damage:0},bench:[{uid:'ob',cardId:'B',energy:{Fire:3},conditions:{},damage:0,benchSlot:0}],hand:[],deck:[],discard:[]};
 const state={sides:{player:own,opponent:foe},turnNumber:1,log:[]};
 const ctx={state,side:'player',foeSide:'opponent',attacker:own.active,defender:foe.active,action:{effectTarget:'opponentBench',effectBenchIndex:0},cardById:id=>({id,name:id,kind:'pokemon',stage:'Basic',subtype:'Psychic',hp:100}),random:()=>0.1,isAttack:true};
 const r=fx.resolveAttack({damage:0,effect:c.effect},ctx);assert.equal(r.damage,60);assert.equal(r.damageTarget,foe.bench[0]);
});

test('poison bonus modifier increases checkup poison damage',()=>{
 const ability=compileAbility({name:'More Poison',effect:"Your opponent's Active Pokémon takes +10 damage from being Poisoned."});assert.equal(ability.supported,true);
 const source={uid:'n',cardId:'Nihilego',energy:{},conditions:{},damage:0};
 const target={uid:'t',cardId:'Target',energy:{},conditions:{poison:{amount:10}},damage:0};
 const state={sides:{player:{active:source,bench:[]},opponent:{active:target,bench:[]}},turnNumber:1,log:[]};
 const cardById=id=>id==='Nihilego'?{id,name:id,kind:'pokemon',stage:'Basic',subtype:'Darkness',hp:100,abilities:[ability.ability]}:{id,name:id,kind:'pokemon',stage:'Basic',subtype:'Colorless',hp:100};
 assert.equal(fx.modifierAmount(state,'opponent',target,'poisonDamageBonus',cardById),10);
});
