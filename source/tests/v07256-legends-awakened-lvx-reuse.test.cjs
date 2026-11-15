'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const la=require('../app/src/main/assets/tcg-classic-legends-awakened.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js'),core=require('../app/src/main/assets/tcgp-battle-core.js'),cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:17});assert.ok(loan.ok);
function board(id,opp='dp6-117'){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:31,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].hand=[];s.sides[side].bench=[];}
 s.sides.player.active=core.makePokemonSlot(id,2,'actor');s.sides.opponent.active=core.makePokemonSlot(opp,2,'target');
 s.sides.player.active.energy={Grass:3,Water:3,Psychic:3,Lightning:3,Fighting:3,Metal:3};
 return s;
}
function bench(s,side,id){const p=core.makePokemonSlot(id,2,side+'b'+s.sides[side].bench.length);p.benchSlot=s.sides[side].bench.length;s.sides[side].bench.push(p);return p;}
function options(s,type,side='player'){return core.legalActions(s,side).filter(a=>a.type===type);}
function use(s,type,idx=0,side='player'){const a=options(s,type,side)[idx];assert.ok(a,`missing ${type} action`);core.applyAction(s,side,a);return a;}
function settle(s){for(let i=0;i<12&&s.phase==='effectChoice';i++){const side=s.pendingChoice.side;use(s,'effectChoice',0,side);}assert.notEqual(s.phase,'effectChoice');}
test('all seven archived LV.X share the existing level-up and previous-level inheritance framework',()=>{
 assert.equal(la.coverage().battleEnabled,146);
 for(let n=140;n<=146;n++){
   const c=data.cardById('dp6-'+n);assert.ok(c.battleEnabled,c.id);assert.ok(c.isLevelX);assert.equal(c.stage,'Level-Up');assert.ok(c.levelUpFrom);
   for(const attack of c.attacks)assert.deepEqual(fx.validateEffect(attack.effect),[],c.id+attack.name);
   for(const ab of c.abilities||[])assert.deepEqual(fx.validateEffect(ab.effect),[],c.id+ab.name);
 }
 const s=board('dp6-141');const p=s.sides.player.active;p.stack=['dp6-5','dp6-141'];
 assert.ok(options(s,'attack').some(a=>a.attackIndex===0&&a.attackCardId==='dp6-5'),'inherited Gliscor attack missing');
 const t=board('dp6-43');t.sides.player.hand=[{uid:'uxie-level',cardId:'dp6-146'}];
 assert.ok(options(t,'evolve').some(a=>a.handIndex===0),'cannot level up Uxie from hand');
 use(t,'evolve');assert.equal(t.sides.player.active.cardId,'dp6-146');assert.deepEqual(t.sides.player.active.stack,['dp6-43','dp6-146']);
 assert.ok(options(t,'attack').some(a=>a.attackCardId==='dp6-43'),'previous level attack lost');
});
test('Azelf Psychic Aura removes Psychic Weakness for entire side, not the attacker alone',()=>{
 const s=board('dp6-11','dp6-11');bench(s,'opponent','dp6-140');
 const original=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,30,data.cardById);
 assert.equal(original,30);
 s.sides.opponent.bench=[];
 const doubled=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,30,data.cardById);
 assert.equal(doubled,50);
});
test('Azelf Deep Balance chooses a physical target and places counters for opponent Energy across field',()=>{
 const s=board('dp6-140','dp6-9');s.sides.opponent.active.energy={Water:2};const p=bench(s,'opponent','dp6-117');p.energy={Grass:3};
 use(s,'attack');assert.equal(s.phase,'effectChoice');assert.equal(options(s,'effectChoice').length,2);
 use(s,'effectChoice',1);assert.equal(p.damage,50);assert.equal(s.sides.opponent.active.damage,0);
});
test('Gliscor LV.X Shoot Poison triggers on real level-up, not bench evolution, and offers decline',()=>{
 let s=board('dp6-5');s.sides.player.hand=[{uid:'gliscor-lvx',cardId:'dp6-141'}];use(s,'evolve');
 assert.equal(s.phase,'effectChoice');assert.equal(options(s,'effectChoice').length,2);
 use(s,'effectChoice',1);assert.ok(s.sides.opponent.active.conditions.paralysis);assert.ok(s.sides.opponent.active.conditions.poison);
 s=board('dp6-141');bench(s,'player','dp6-117');use(s,'attack');assert.equal(s.phase,'effectChoice');settle(s);
});
test('Mesprit LV.X Supreme Blast requires BOTH named LV.X and only then discards energy',()=>{
 let s=board('dp6-143','dp6-9');use(s,'attack',1);assert.equal(s.sides.opponent.active.damage,0);assert.equal(s.sides.player.active.energy.Psychic,3);
 s=board('dp6-143','dp6-9');bench(s,'player','dp6-140');bench(s,'player','dp6-146');use(s,'attack',1);
 assert.equal(s.sides.opponent.active,null,'200 damage should KO the defender');assert.equal(Object.values(s.sides.player.active.energy).reduce((q,n)=>q+n,0),0);
});
test('Mewtwo LV.X Psybarrier prevents damage from non-evolved attackers and Giga Burn discards all energy',()=>{
 let s=board('dp6-144','dp6-117');s.sides.player.active.energy={Psychic:3};use(s,'attack');assert.equal(s.sides.player.active.energy.Psychic,0);
 s=board('dp6-117','dp6-144');assert.equal(fx.attackIsPrevented(s,'opponent',s.sides.opponent.active,s.sides.player.active,data.cardById)?.reason,'Psybarrier');
 s.sides.player.active=core.makePokemonSlot('dp6-55',2,'stageone');assert.equal(fx.attackIsPrevented(s,'opponent',s.sides.opponent.active,s.sides.player.active,data.cardById),null);
});
test('Rhyperior Hard Crush discards exactly five physical top cards and scales with Energy',()=>{
 const s=board('dp6-145','dp6-9');s.sides.player.deck=[{uid:'e1',cardId:'dp1-128'},{uid:'a',cardId:'dp6-117'},{uid:'e2',cardId:'dp1-125'},{uid:'b',cardId:'dp6-95'},{uid:'e3',cardId:'dp1-127'},{uid:'x',cardId:'dp6-117'}];
 use(s,'attack');assert.equal(s.sides.opponent.active,null,'150 damage should KO the 140HP defender');assert.deepEqual(s.sides.player.deck.map(x=>x.uid),['x']);assert.equal(s.sides.player.discard.filter(x=>['e1','a','e2','b','e3'].includes(x.uid)).length,5);
});
test('Uxie Trade Off chooses one top card into hand and puts the other onto bottom without shuffle',()=>{
 const s=board('dp6-146');s.sides.player.hand=[];s.sides.player.deck=[{uid:'first',cardId:'dp6-117'},{uid:'second',cardId:'dp6-118'},{uid:'third',cardId:'dp6-95'}];
 use(s,'ability');assert.equal(s.phase,'effectChoice');assert.equal(options(s,'effectChoice').length,2);
 use(s,'effectChoice',1);assert.equal(s.sides.player.hand[0].uid,'second');assert.deepEqual(s.sides.player.deck.map(x=>x.uid),['third','first']);
});
test('Magnezone Electric Trans can move an attached Special Metal/Lightning Energy card physically',()=>{
 const s=board('dp6-142');const target=bench(s,'player','dp6-117');
 s.sides.player.active.energy={};s.sides.player.active.specialEnergy=[{uid:'special-metal-1',cardId:'neo1-103',provides:{Metal:1}}];
 use(s,'ability');assert.equal(s.phase,'effectChoice');
 let a=options(s,'effectChoice').find(x=>x.effectSpecialEnergyUid==='special-metal-1');assert.ok(a,'Electric Trans missing Special Metal target');core.applyAction(s,'player',a);
 a=options(s,'effectChoice').find(x=>x.choiceTarget==='bench');assert.ok(a);core.applyAction(s,'player',a);
 assert.equal(target.specialEnergy[0].uid,'special-metal-1');assert.equal(s.sides.player.active.specialEnergy.length,0);
 a=options(s,'effectChoice').find(x=>x.choiceOption===1);assert.ok(a);core.applyAction(s,'player',a);
});
test('Mesprit Healing Look heals 30 from each ally Bench position, not Active',()=>{
 const s=board('dp6-143');const a=bench(s,'player','dp6-117'),b=bench(s,'player','dp6-117');a.damage=50;b.damage=20;s.sides.player.active.damage=30;
 use(s,'attack');assert.equal(a.damage,20);assert.equal(b.damage,0);assert.equal(s.sides.player.active.damage,30);
});
test('Rhyperior Upthrow shuffles ALL discarded Fighting Energy including Energy Zone supply',()=>{
 const s=board('dp6-145');s.sides.player.discard=[{uid:'physical-f',cardId:'dp1-128'},{uid:'not-f',cardId:'dp1-125'}];s.sides.player.energyDiscard={Fighting:2};s.sides.player.deck=[{uid:'other',cardId:'dp6-117'}];
 use(s,'attack',1);assert.equal(s.sides.player.discard.length,1);assert.equal(s.sides.player.discard[0].uid,'not-f');assert.equal(s.sides.player.energyDiscard.Fighting,0);
 assert.equal(s.sides.player.deck.filter(x=>x.cardId==='dp1-128').length,3);
});
test('status suppression disables Electric Trans and Trade Off for Poison and Burn, not just Sleep',()=>{
 for(const id of ['dp6-142','dp6-146']){
  const s=board(id);bench(s,'player','dp6-117');s.sides.player.deck=[{uid:'a',cardId:'dp6-117'},{uid:'b',cardId:'dp6-117'}];
  for(const key of ['poison','burn','sleep']){
   s.sides.player.active.conditions={[key]:{appliedTurn:10}};
   assert.equal(options(s,'ability').length,0,`${id} should not use Power with ${key}`);
  }
 }
});
test('LV.X level-up preserves poison, damage, attack guards and physical attachments unlike evolution',()=>{
 const s=board('dp6-43');const a=s.sides.player.active;
 a.damage=20;a.conditions={poison:{appliedTurn:10}};a.attackGuard={type:'preventDamage',expiresTurn:12};a.tool={uid:'my-tool',cardId:'dp2-65'};
 s.sides.player.hand=[{uid:'physical-uxie',cardId:'dp6-146'}];use(s,'evolve');
 assert.equal(s.sides.player.active,a);assert.equal(a.cardId,'dp6-146');assert.equal(a.damage,20);
 assert.ok(a.conditions.poison);assert.ok(a.attackGuard);assert.equal(a.tool.uid,'my-tool');
});
