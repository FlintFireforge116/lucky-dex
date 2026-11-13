'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';const dp=require(A+'tcg-classic-diamond-pearl'),opp=require(A+'tcg-classic-opponents'),core=require(A+'tcgp-battle-core'),ui=require(A+'tcgp-battle-ui');
const r=opp.generate({sets:['dp1'],seed:31});assert.ok(r.ok,r.error);
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function state(id){const s=core.createBattle({format:'classic',playerDeck:r.cards,opponentDeck:r.cards,seed:31,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});s.phase='battle';s.activeSide='player';s.turnNumber=9;s.sides.player.turnCount=s.sides.opponent.turnCount=6;
  s.sides.player.active=core.makePokemonSlot(id,2,'a');s.sides.player.active.energy=Object.fromEntries(types.map(x=>[x,5]));s.sides.opponent.active=core.makePokemonSlot('dp1-27',2,'o');s.sides.opponent.active.energy={Psychic:5};
  s.sides.player.bench=[core.makePokemonSlot('dp1-85',2,'pb')];s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench=[core.makePokemonSlot('dp1-85',2,'ob')];s.sides.opponent.bench[0].benchSlot=0;return s;}
test('D&P attack choices with multiple actions have distinct descriptions across all battle-enabled Pokémon',()=>{const missing=[];let checked=0;
 for(const card of dp.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled)){
  const s=state(card.id),attacks=core.legalActions(s,'player').filter(a=>a.type==='attack');
  const groups=new Map();for(const a of attacks){const k=a.attackCardId+':'+a.attackIndex;groups.set(k,[...(groups.get(k)||[]),a]);}
  for(const [k,choices] of groups){if(choices.length<2)continue;const labels=choices.map(a=>ui.actionLabel(a,s,'player'));checked++;
    if(new Set(labels).size!==labels.length)missing.push({k,card:card.name,labels,actions:choices});
  }
 }
 assert.deepEqual(missing.map(x=>({card:x.card,k:x.k,labels:x.labels})),[],'Ambiguous printed attack choice labels');
 assert.ok(checked>0);
});
