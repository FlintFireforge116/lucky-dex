'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const la=require('../app/src/main/assets/tcg-classic-legends-awakened.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:47});assert.ok(loan.ok);
const groupA=[1,24,25,26],groupB=[48,49,50,51],batch=[...groupA,...groupB];
function board(id,def='dp6-9'){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:23,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].hand=[];s.sides[side].bench=[];}
 s.sides.player.active=core.makePokemonSlot(id,2,'actor');s.sides.opponent.active=core.makePokemonSlot(def,2,'defender');
 s.sides.player.active.energy={Grass:3,Fire:3,Water:3,Psychic:3,Lightning:3,Fighting:3,Metal:3,Darkness:3};return s;
}
function actions(s,type,side='player'){return core.legalActions(s,side).filter(x=>x.type===type);}
function use(s,type,index=0,side='player'){const opts=actions(s,type,side);assert.ok(opts.length,`${type} missing for ${s.sides[side].active?.cardId}`);core.applyAction(s,side,opts[index]);return opts[index];}
function bench(s,side,id){const p=core.makePokemonSlot(id,2,side+'-bench');p.benchSlot=s.sides[side].bench.length;s.sides[side].bench.push(p);return p;}
function settle(s){for(let i=0;i<20&&s.phase==='effectChoice';i++){const side=s.pendingChoice.side;use(s,'effectChoice',0,side);}assert.notEqual(s.phase,'effectChoice');}

test('Eight Forme prints are genuine battle cards with archived attacks and legal Powers',()=>{
 assert.equal(la.coverage().battleEnabled,111);
 for(const n of batch){const c=data.cardById('dp6-'+n);assert.ok(c.battleEnabled,`${n}`);assert.ok(c.deckEligible);assert.equal(c.attacks.length,1);
  assert.deepEqual(fx.validateEffect(c.attacks[0].effect),[]);assert.equal(c.abilities[0].type,'activated');assert.deepEqual(fx.validateEffect(c.abilities[0].effect),[]);
  const s=board(c.id);s.sides.player.deck=[{uid:'form',cardId:(groupA.includes(n)?'dp6-'+groupA.find(v=>v!==n):'dp6-'+groupB.find(v=>v!==n))}];
  assert.equal(actions(s,'ability').length,1,`No ${c.abilities[0].name} on ${c.id}`);
  assert.ok(actions(s,'attack').length,`Missing ${c.attacks[0].name}`);
 }
});
test('Form Change retains the complete Pokémon slot, attached Energy, tools, damage and conditions; searches physical card',()=>{
 const s=board('dp6-1');const p=s.sides.player.active;p.damage=20;p.conditions.poison={appliedTurn:10};p.tool={uid:'tool',cardId:'dp2-65'};
 s.sides.player.deck=[{uid:'other',cardId:'dp6-24'},{uid:'notAForm',cardId:'dp6-117'}];
 use(s,'ability');assert.equal(s.phase,'effectChoice');assert.deepEqual(actions(s,'effectChoice').map(a=>a.choiceCardId),['dp6-24']);
 use(s,'effectChoice');assert.equal(s.sides.player.active,p);assert.equal(p.cardId,'dp6-24');assert.equal(p.damage,20);
 assert.equal(p.energy.Psychic,3);assert.ok(p.conditions.poison);assert.equal(p.tool.uid,'tool');
 assert.ok(s.sides.player.deck.some(r=>r.cardId==='dp6-1'));
 assert.equal(s.sides.player.dp6FormUsed.deoxys,7);
 s.sides.player.deck=[{uid:'other2',cardId:'dp6-25'}];
 assert.equal(actions(s,'ability').length,0,'Form Change should be locked across all Deoxys');
});
test('Castform Temperament shares its once-per-turn family limit and does not consume Deoxys limit',()=>{
 const s=board('dp6-48');s.sides.player.deck=[{uid:'rain',cardId:'dp6-49'},{uid:'notCastform',cardId:'dp6-117'}];
 use(s,'ability');assert.equal(s.phase,'effectChoice');assert.deepEqual(actions(s,'effectChoice').map(x=>x.choiceCardId),['dp6-49']);use(s,'effectChoice');
 assert.equal(s.sides.player.active.cardId,'dp6-49');s.sides.player.deck=[{uid:'sun',cardId:'dp6-51'}];
 assert.equal(actions(s,'ability').length,0,'Temperament should be locked for every form this turn');
 assert.equal(s.sides.player.dp6FormUsed.castform,7);
});
test('Energy Crush counts Energy on all opposing Pokémon; Speed Shot ignores Weakness and effects',()=>{
 const s=board('dp6-1');s.sides.opponent.active.energy={Psychic:2};bench(s,'opponent','dp6-117').energy={Grass:3};use(s,'attack');assert.equal(s.sides.opponent.active.damage,70);
 const t=board('dp6-26','dp6-117');t.sides.opponent.active.attackGuard={expiresTurn:30};use(t,'attack');settle(t);assert.equal(t.sides.opponent.active.damage,30);
});
test('Castform Hail damages Active and all Benched Pokémon; Sunny Form Ember discards Fire',()=>{
 const s=board('dp6-50','dp6-117');bench(s,'opponent','dp6-117');use(s,'attack');assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,10);
 const t=board('dp6-51');const before=t.sides.player.active.energy.Fire;use(t,'attack');assert.equal(t.sides.player.active.energy.Fire,before-1);
});
test('Weather Ball checks Stadium ownership and heals only when own Stadium is in play',()=>{
 const s=board('dp6-48');s.sides.player.active.damage=40;s.stadium={uid:'st',ownerSide:'player',cardId:'dp5-79'};use(s,'attack');assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.opponent.active.damage,30);
 const t=board('dp6-48');t.stadium={uid:'st2',ownerSide:'opponent',cardId:'dp5-79'};use(t,'attack');assert.equal(t.sides.opponent.active.damage,60);
});
test('Psychic Boost reduces printed base to 20 only on following own turn',()=>{
 const s=board('dp6-24');use(s,'attack');assert.equal(s.sides.opponent.active.damage,80);assert.equal(s.sides.player.active.dp6PsychicBoostTurn,10);
 s.turnNumber=12;s.activeSide='player';s.phase='battle';s.sides.player.turnCount++;s.sides.opponent.active.damage=0;use(s,'attack');assert.equal(s.sides.opponent.active.damage,20);
});
test('Psychic Defense leaves damage reduction for next opposing turn and prevents secondary effects',()=>{
 const s=board('dp6-25');use(s,'attack');assert.equal(s.sides.opponent.active.damage,40);assert.equal(s.sides.player.active.dp6PsychicDefenseUntil,11);
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'damageReduction',data.cardById),20);
 assert.equal(fx.attackEffectsPrevented(s,'player',s.sides.player.active,s.sides.opponent.active,data.cardById),true);
});
