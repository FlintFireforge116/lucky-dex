const t=require('node:test'),a=require('node:assert/strict'),N=require('../scripts/lib/tcgp-normalize.cjs'),E=require('../app/src/main/assets/tcgp-battle-effects.js'),D=require('../app/src/main/assets/tcgp-battle-data.js'),C=require('../app/src/main/assets/tcgp-battle-core.js');
t('Stadium bonus executes conditionally in real C1 dual-type attack',()=>{
 const c=D.cardById('C1-056');a.equal(c.battleEnabled,true,c.support.reasons.join(' '));
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:1});
 const p=b.sides.player,o=b.sides.opponent;p.active=C.makePokemonSlot(c.id,0,'mewtwo');o.active=C.makePokemonSlot('A1-083',0,'target');
 const ctx={state:b,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:D.cardById,random:C.random};
 a.equal(E.resolveAttack(c.attacks[0],ctx).damage,100);b.stadium={cardId:'B2-153'};a.equal(E.resolveAttack(c.attacks[0],ctx).damage,140);
 a.equal(E.attackDamage(c,{damage:100},{weakness:'Fighting'}),120);
});
t('reusable self Energy discard and coin lock compositions execute, unknown trailing clauses stay partial',()=>{
 const compiled=N.compileEffect('Discard 2 random Energy from this Pokémon.');a.equal(compiled.supported,true);
 const slot={uid:'self',cardId:'A1-083',energy:{Water:3},damage:0};const state={sides:{player:{active:slot,bench:[]},opponent:{active:{uid:'foe',cardId:'A1-001',energy:{},locks:[]},bench:[]}},log:[],turnNumber:5};
 const ctx={state,side:'player',foeSide:'opponent',attacker:slot,random:()=>0.2,cardById:D.cardById};E.applyEffect(compiled.effect,ctx);a.equal(slot.energy.Water,1);
 const lock=N.compileEffect("Flip a coin. If heads, the Defending Pokémon can't attack during your opponent's next turn.");a.equal(lock.supported,true);E.applyEffect(lock.effect,ctx);a.equal(state.sides.opponent.active.locks[0].action,'attack');
 a.equal(N.compileEffect('Discard 2 random Energy from this Pokémon. Invent a card.').supported,false);
});
t('known ex/Mega point rules are explicitly supported, unknown rule boxes are never ignored',()=>{
 const raw={id:'C1-900',setId:'C1',name:'Mega Fixture ex',category:'Pokemon',hp:100,types:['Psychic'],stage:'Basic',retreat:1,attacks:[{name:'Hit',damage:30,cost:['Psychic']}],rules:['Mega Evolution ex rule: When your Mega Evolution Pokémon ex is Knocked Out, your opponent gets 3 points.']};
 a.equal(N.normalizeMechanics(raw).battleEnabled,true);a.equal(N.normalizeMechanics(raw).points,3);
 a.equal(N.normalizeMechanics({...raw,rules:['Invent extra points.']}).battleEnabled,false);
});
