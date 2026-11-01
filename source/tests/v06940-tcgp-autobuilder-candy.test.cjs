const t=require('node:test'),a=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const K=require('../app/src/main/assets/tcgp-battle-decks.js');
const C=require('../app/src/main/assets/tcgp-battle-core.js');

const row=id=>({gameplayId:id,quantity:2,battleEnabled:true,variants:[{id,quantity:2,rarity:'One Diamond'}]});
const allOwned=()=>D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>row(c.id));

t('Rare Candy is battle-ready and can evolve a prior-turn Basic directly into its Stage 2',()=>{
 const candy=D.cardById('A3-144');a.equal(candy?.name,'Rare Candy');a.equal(candy?.battleEnabled,true);a.equal(candy?.effect?.type,'rareCandy');
 const deck=D.BEGINNER_IVYSAUR_DECK.slice();
 const b=C.createBattle({playerDeck:deck,opponentDeck:deck,seed:17,firstSide:'player'});
 b.sides.player.active=C.makePokemonSlot('A1-001',0,'bulb');
 b.sides.player.hand=[{uid:'candy',cardId:'A3-144'},{uid:'venu',cardId:'A1-003'}];
 a.equal(C.legalActions(b,'player').some(x=>x.type==='trainer'&&x.cardId==='A3-144'),false,'Rare Candy cannot be used on the first turn');
 C.applyAction(b,'player',{type:'endTurn'});C.applyAction(b,'opponent',{type:'endTurn'});
 const action=C.legalActions(b,'player').find(x=>x.type==='trainer'&&x.cardId==='A3-144'&&x.evolutionCardId==='A1-003'&&x.target==='active');
 a.ok(action,'Rare Candy should offer Venusaur onto a prior-turn Bulbasaur');
 C.applyAction(b,'player',action);
 a.equal(b.sides.player.active.cardId,'A1-003');a.deepEqual(b.sides.player.active.stack,['A1-001','A1-003']);
 a.ok(b.sides.player.discard.some(x=>x.cardId==='A3-144'));a.ok(!b.sides.player.hand.some(x=>x.cardId==='A1-003'));
});

t('competitive Stage 2 decks reserve Rare Candy when owned',()=>{
 const rows=allOwned();
 const r=K.buildQuickDeck(rows,{types:['Grass'],style:'competitive',cardId:'A1-003'});a.equal(r.ok,true,JSON.stringify(r.errors));
 a.equal(r.cards.filter(id=>id==='A3-144').length,2,'Stage 2 competitive core should run two Rare Candy');
});

t('auto-builder does not strand an evolvable Basic when its evolution is unavailable',()=>{
 const trainerRows=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind==='trainer').map(c=>row(c.id));
 const rows=[...trainerRows,row('A2-116'),row('C1-091')]; // Bronzor + standalone Mega Skarmory ex, but no Bronzong
 const r=K.buildQuickDeck(rows,{types:['Metal'],style:'random',variant:0});a.equal(r.ok,true,JSON.stringify(r.errors));
 const names=r.cards.map(D.cardById).filter(c=>c?.kind==='pokemon').map(c=>c.name);
 a.ok(!names.includes('Bronzor'),`random viable deck stranded Bronzor without Bronzong: ${names.join(', ')}`);
 a.ok(names.includes('Mega Skarmory ex'),'builder should use the coherent standalone Metal attacker instead');
});
