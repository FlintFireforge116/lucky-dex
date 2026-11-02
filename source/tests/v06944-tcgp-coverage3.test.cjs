const test=require('node:test');
const assert=require('node:assert/strict');
const {compileEffect}=require('../scripts/lib/tcgp-normalize.cjs');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');

const texts={
  drapion:"Flip 4 coins. This attack does 40 damage for each heads. If at least 2 of them are heads, your opponent's Active Pokémon is now Poisoned.",
  marowak:"Flip 2 coins. This attack does 70 damage for each heads. If at least 1 of them is heads, your opponent's Active Pokémon is now Burned.",
  pidgeot:"Flip 2 coins. For each heads, discard a random Energy from your opponent's Active Pokémon. If both of them are tails, this attack does nothing.",
  megaPidgeot:"Flip 3 coins. For each heads, discard a random Energy from your opponent's Active Pokémon. If all of them are tails, this attack does nothing.",
  krookodile:"Flip 3 coins. For each heads, a card is chosen at random from your opponent's hand. Your opponent reveals that card and shuffles it into their deck.",
  moltres:"Flip 3 coins. For each heads, produce a {R} Energy from your Energy Zone and attach it to this Pokémon.",
  hammer:"Flip 2 coins. If both of them are heads, discard a random Energy from your opponent's Active Pokémon.",
  coalossal:"Flip a coin until you get tails. For each heads, discard the top card of your opponent's deck.",
  researcher:"Flip a coin until you get tails. For each heads, put a random Pokémon that has “Team Rocket” in its name from your deck into your hand."
};

test('automatic coin-effect families compile to executable effects',()=>{
  for(const [name,text] of Object.entries(texts)){
    const c=compileEffect(text,name==='hammer'||name==='researcher'?'trainer':'attack',0);
    assert.equal(c.supported,true,`${name}: ${c.reason||'unsupported'}`);
    assert.deepEqual(fx.validateEffect(c.effect),[],`${name} schema`);
  }
});

test('coin damage threshold applies status only when threshold is reached',()=>{
  const c=compileEffect(texts.drapion,'attack',0); assert.equal(c.supported,true);
  const own={active:{uid:'p',cardId:'Drapion',energy:{},conditions:{},damage:0},bench:[],hand:[],deck:[],discard:[]};
  const foe={active:{uid:'o',cardId:'Target',energy:{},conditions:{},damage:0},bench:[],hand:[],deck:[],discard:[]};
  const state={sides:{player:own,opponent:foe},turnNumber:1,log:[]};
  let seq=[0.1,0.1,0.9,0.9],i=0;
  const ctx={state,side:'player',foeSide:'opponent',attacker:own.active,defender:foe.active,cardById:id=>({id,name:id,kind:'pokemon',stage:'Basic',subtype:'Darkness',hp:100}),random:()=>seq[i++],isAttack:true};
  const result=fx.resolveAttack({damage:0,effect:c.effect},ctx);
  assert.equal(result.damage,80);
  for(const e of result.pendingEffects)fx.applyEffect(e,ctx);
  assert.ok(foe.active.conditions.poison);
});

test('per-head discard effect consumes exactly one random Energy for each head',()=>{
  const c=compileEffect(texts.pidgeot,'attack',0); assert.equal(c.supported,true);
  const own={active:{uid:'p',cardId:'Pidgeot',energy:{},conditions:{},damage:0},bench:[],hand:[],deck:[],discard:[],energyDiscard:{}};
  const foe={active:{uid:'o',cardId:'Target',energy:{Fire:2,Water:1},conditions:{},damage:0},bench:[],hand:[],deck:[],discard:[],energyDiscard:{}};
  const state={sides:{player:own,opponent:foe},turnNumber:1,log:[]};
  let seq=[0.1,0.1,0.0,0.0],i=0;
  const ctx={state,side:'player',foeSide:'opponent',attacker:own.active,defender:foe.active,cardById:id=>({id,name:id,kind:'pokemon',stage:'Basic',subtype:'Colorless',hp:100}),random:()=>seq[i++],isAttack:true};
  const result=fx.resolveAttack({damage:0,effect:c.effect},ctx);
  for(const e of result.pendingEffects)fx.applyEffect(e,ctx);
  assert.equal(Object.values(foe.active.energy).reduce((a,b)=>a+b,0),1);
  assert.equal(Object.values(foe.energyDiscard).reduce((a,b)=>a+b,0),2);
});
