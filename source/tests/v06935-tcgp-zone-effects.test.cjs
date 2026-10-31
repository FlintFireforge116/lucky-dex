const test=require('node:test'),assert=require('node:assert/strict'),N=require('../scripts/lib/tcgp-normalize.cjs'),E=require('../app/src/main/assets/tcgp-battle-effects.js');
function ctx(){const slot=(uid,damage)=>({uid,damage,energy:{}}),p={active:slot('p',30),bench:[slot('b',20)],deck:[{uid:'one',cardId:'A1-001'},{uid:'two',cardId:'A1-014'}],discard:[]},o={active:slot('o',20),bench:[],deck:[{uid:'three',cardId:'A1-021'}],discard:[]};return {state:{log:[],sides:{player:p,opponent:o}},side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:()=>({}),random:()=>.1};}
test('deck discard is a reusable bounded zone operation and preserves exact card identities',()=>{
 const r=N.compileEffect("Discard the top card of your opponent's deck.");assert.equal(r.supported,true);assert.deepEqual(r.effect,{type:'discardTop',side:'opponent',amount:1});const c=ctx();E.applyEffect(r.effect,c);assert.deepEqual(c.state.sides.opponent.discard,[{uid:'three',cardId:'A1-021'}]);assert.equal(c.state.sides.opponent.deck.length,0);E.applyEffect(r.effect,c);assert.equal(c.state.sides.opponent.discard.length,1);
 const s=N.compileEffect('Discard the top 2 cards of your deck.');assert.equal(s.supported,true);E.applyEffect(s.effect,c);assert.deepEqual(c.state.sides.player.discard.map(x=>x.uid),['one','two']);
});
test('heal-each uses one deterministic all-own selector, not a secretly chosen Pokémon',()=>{
 const r=N.compileEffect('Heal 20 damage from each of your Pokémon.');assert.equal(r.supported,true);assert.deepEqual(r.effect,{type:'heal',target:'selfAll',amount:20});const c=ctx();E.applyEffect(r.effect,c);assert.equal(c.attacker.damage,10);assert.equal(c.state.sides.player.bench[0].damage,0);assert.equal(c.defender.damage,20);assert.deepEqual(E.choicesForEffect(r.effect,c),[{}]);
});
test('damage-dependent attack bonus uses actual source damage and stays a single ordinary damage packet',()=>{
 const r=N.compileEffect('This attack does more damage equal to the damage this Pokémon has on it.');assert.equal(r.supported,true);const c=ctx();assert.equal(E.resolveAttack({damage:10,effect:r.effect},c).damage,40);c.attacker.damage=0;assert.equal(E.resolveAttack({damage:10,effect:r.effect},c).damage,10);
});
test('all-own targeting cannot spread Special Conditions onto a Bench',()=>assert.ok(E.validateEffect({type:'status',target:'selfAll',status:'poison'}).length));
