const t=require('node:test'),a=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js');
const K=require('../app/src/main/assets/tcgp-battle-decks.js');
const C=require('../app/src/main/assets/tcgp-battle-core.js');

function allOwned(){return D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,quantity:2,battleEnabled:true}));}
function battleState(player='B1-102',opponent='A1-096'){
 const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:38,firstSide:'player'});
 b.phase='battle'; b.activeSide='player'; b.turnNumber=4;
 b.sides.player.active=C.makePokemonSlot(player,1,'player-active');
 b.sides.opponent.active=C.makePokemonSlot(opponent,1,'cpu-active');
 b.sides.player.bench=[];b.sides.opponent.bench=[];
 b.sides.player.hand=[];b.sides.opponent.hand=[];
 b.sides.player.discard=[];b.sides.opponent.discard=[];
 b.sides.player.supporterUsed=false;b.sides.player.energyUsed=false;b.sides.player.retreated=false;
 b.modifiers=[];
 return b;
}

t('dynamic attack preview shows Mega Altaria bench damage instead of its printed floor',()=>{
 const b=battleState();
 b.sides.player.active.energy={Psychic:2};
 for(const [i,id] of ['A1-115','A1-127','A1-132'].entries()){const s=C.makePokemonSlot(id,1,'bench-'+i);s.benchSlot=i;b.sides.player.bench.push(s);}
 a.equal(typeof C.attackDamagePreview,'function');
 a.equal(C.attackDamagePreview(b,'player',0).damage,130);
});

t('Korrina buffs a Fighting attacker into Pikachu ex but not a non-Fighting attacker',()=>{
 const b=battleState('A1-155','A1-096');
 b.sides.player.active.energy={Fighting:1};
 b.sides.player.hand=[{uid:'korrina',cardId:'B3-149'}];
 const play=C.legalActions(b,'player').find(x=>x.type==='trainer'&&x.cardId==='B3-149');
 a.ok(play,'Korrina should be playable');C.applyAction(b,'player',play);
 a.equal(C.attackDamagePreview(b,'player',0).damage,60,'30 base + 30 Korrina before Weakness');
 const hit=C.legalActions(b,'player').find(x=>x.type==='attack'&&x.attackIndex===0);a.ok(hit);C.applyAction(b,'player',hit);
 a.equal(b.sides.opponent.active.damage,80,'Korrina +30 then Fighting Weakness +20');
 const psychic=battleState('B1-102','A1-096');psychic.sides.player.active.energy={Psychic:2};psychic.sides.player.hand=[{uid:'korrina2',cardId:'B3-149'}];
 C.applyAction(psychic,'player',C.legalActions(psychic,'player').find(x=>x.type==='trainer'&&x.cardId==='B3-149'));
 a.equal(C.attackDamagePreview(psychic,'player',0).damage,40,'Korrina must not buff Psychic Mega Altaria');
});

t('Mewtwo with three Psychic can use PPC; paralysis is reported as the blocker instead of Energy',()=>{
 const b=battleState('B4a-030','A1-112');b.sides.player.active.energy={Psychic:3};
 a.equal(C.attackAvailability(b,'player',0).usable,true);
 b.sides.player.active.conditions.paralysis=true;
 const blocked=C.attackAvailability(b,'player',0);a.equal(blocked.usable,false);a.equal(blocked.reason,'Paralyzed.');
});

t('autobuilder keeps Professor Research consistency and caps Stadium clutter',()=>{
 const ids=['A1-053','A1-054','A1-055','P-A-007','B2-153','B2-154','B2-155','A1-223','P-A-001','P-A-002','P-A-006'];
 const owned=ids.map(gameplayId=>({gameplayId,quantity:2,battleEnabled:true}));
 const r=K.buildQuickDeck(owned,{type:'Water'});a.equal(r.ok,true,JSON.stringify(r.errors));
 a.equal(r.cards.filter(id=>id==='P-A-007').length,2,'two Professor Research when owned');
 const stadiums=r.cards.map(D.cardById).filter(c=>c?.trainerType==='Stadium');a.ok(stadiums.length<=2,'at most two Stadium cards');
});

t('autobuilder prefers archetype-specific support instead of the same generic Trainer package',()=>{
 const rows=allOwned();
 const fighting=K.buildQuickDeck(rows,{type:'Fighting'});a.equal(fighting.ok,true);
 const fightingNames=fighting.cards.map(D.cardById).filter(c=>c?.kind==='trainer').map(c=>c.name);
 a.ok(fightingNames.includes('Korrina'),'Fighting auto-build should recognise Korrina as specialist support');
 const grass=K.buildQuickDeck(rows,{cardId:'A1-023'});a.equal(grass.ok,true);
 const grassNames=grass.cards.map(D.cardById).filter(c=>c?.kind==='trainer').map(c=>c.name);
 a.ok(grassNames.includes('Erika')||grassNames.includes('Leaf Cape'),'a Grass focus that genuinely benefits from Grass support should prefer matching specialist support');
});

t('autobuilder exposes strong alternative cores instead of one fixed deck per type',()=>{
 const rows=allOwned(),a0=K.buildQuickDeck(rows,{type:'Water',variant:0}),a1=K.buildQuickDeck(rows,{type:'Water',variant:1});
 a.equal(a0.ok,true);a.equal(a1.ok,true);a.notEqual(a1.focusCardId,a0.focusCardId,'second Water recommendation should use a different core');
});
