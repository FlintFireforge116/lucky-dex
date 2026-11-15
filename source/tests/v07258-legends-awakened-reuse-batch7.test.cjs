'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const la=require('../app/src/main/assets/tcg-classic-legends-awakened.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:53});assert.ok(loan.ok);
const ids=[6,13,14,18,36,38,39,76,78,79,80,81];
function board(n,def='dp6-117',seed=53){const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Fire','Water','Metal','Lightning','Psychic','Fighting','Grass']});s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].hand=[];s.sides[side].bench=[];}
 s.sides.player.active=core.makePokemonSlot('dp6-'+n,2,'hero');s.sides.player.active.energy={Fire:3,Water:3,Metal:3,Lightning:3,Psychic:3,Fighting:3,Grass:3};s.sides.opponent.active=core.makePokemonSlot(def,2,'enemy');return s;}
function bench(s,side,id){const p=core.makePokemonSlot(id,2,side+'b'+s.sides[side].bench.length);p.benchSlot=s.sides[side].bench.length;s.sides[side].bench.push(p);return p;}
function actions(s,type='attack',side='player'){return core.legalActions(s,side).filter(x=>x.type===type);}
function use(s,type='attack',i=0,side='player'){const opt=actions(s,type,side)[i];assert.ok(opt,`${type}/${i} missing ${s.sides[side].active?.cardId}, phase ${s.phase}`);core.applyAction(s,side,opt);return opt;}
function settle(s,n=24){for(let i=0;i<n&&s.phase==='effectChoice';i++){const side=s.pendingChoice.side;const a=actions(s,'effectChoice',side);assert.ok(a.length,JSON.stringify(s.pendingChoice));use(s,'effectChoice',0,side);}assert.notEqual(s.phase,'effectChoice','unresolved choice: '+JSON.stringify(s.pendingChoice));}
function damage(s){return s.sides.opponent.active?.damage||0;}
test('123 enabled prints / 23 gated; exact printed effects validated',()=>{assert.equal(la.coverage().battleEnabled,146);for(const n of ids){const c=data.cardById('dp6-'+n);assert.ok(c?.battleEnabled,`${n} not available`);assert.equal(c.abilities.length,1);for(const a of [...c.attacks,...c.abilities])assert.deepEqual(fx.validateEffect(a.effect),[],`${n}/${a.name}`);}for(let n=1;n<=146;n++)assert.equal(data.isBattleEnabled('dp6-'+n),true);});
test('All new attacks are legal and resolve without throwing',()=>{for(const n of ids){const s=board(n,'dp6-117');bench(s,'player','dp6-117');bench(s,'opponent','dp6-117');use(s);settle(s);assert.notEqual(s.phase,'error',String(n));}});
test('Heatran Flash Fire moves Fire from a different ally, Magma Storm spends selected Basic Energy',()=>{const s=board(6);const from=bench(s,'player','dp6-117');from.energy={Fire:2};use(s,'ability');assert.equal(s.phase,'effectChoice');settle(s);assert.equal(from.energy.Fire,1);assert.equal(s.sides.player.active.energy.Fire,4);
 const t=board(6,'dp6-9');const attack=actions(t)[2];assert.ok(attack,'Magma Storm must offer 2 Energy discard');core.applyAction(t,'player',attack);assert.equal(damage(t),80);assert.equal(t.sides.player.active.energy.Fire+t.sides.player.active.energy.Metal+t.sides.player.active.energy.Water+t.sides.player.active.energy.Lightning+t.sides.player.active.energy.Psychic+t.sides.player.active.energy.Fighting+t.sides.player.active.energy.Grass,19);});
test('Probopass Steel Coating reduces by at most 20 after Weakness; Metal Bomber selects Bench',()=>{const s=board(13);const p=s.sides.player.active;p.energy={Metal:3};assert.equal(fx.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',p,50,data.cardById),30);p.energy={Metal:1};assert.equal(fx.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',p,50,data.cardById),40);
 const t=board(13);const b=bench(t,'opponent','dp6-117');use(t);assert.equal(t.phase,'effectChoice');settle(t);assert.equal(b.damage,20);});
test('Rayquaza Speed Gain flips until tails, attaches only discarded basic Fire or Lightning',()=>{const s=board(14);s.sides.player.discard=[{uid:'fire',cardId:'dp1-124'}];s.sides.player.energyDiscard={Lightning:3};use(s,'ability');settle(s);const roll=s.log.find(x=>x.reason==='Speed Gain');assert.ok(roll);assert.equal(roll.results.at(-1),false);assert.ok(s.sides.player.active.energy.Fire>=3);});
test('Armaldo Fossil Armor prevents <=60 after Weakness; Crush Claw bonus applies only next own turn',()=>{const s=board(18);const p=s.sides.player.active;assert.equal(fx.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',p,60,data.cardById),0);assert.equal(fx.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',p,70,data.cardById),70);
 const t=board(18,'dp6-9');use(t);assert.equal(t.sides.opponent.active.dp6CrushClawUntil,12);t.turnNumber=12;assert.equal(fx.attackDamageWithState(t,'player',t.sides.player.active,'opponent',t.sides.opponent.active,20,data.cardById),60);t.turnNumber=14;assert.equal(fx.attackDamageWithState(t,'player',t.sides.player.active,'opponent',t.sides.opponent.active,20,data.cardById),20);});
test('Regice Ice Reflect only Paralyzes after real prior attack, Regi Move uses two physical hand cards',()=>{const s=board(36);s.sides.player.active.lastDamageSource={attack:true,side:'opponent',turn:9};use(s);assert.ok(s.sides.opponent.active.conditions?.paralysis);
 const t=board(36);t.sides.player.hand=[{uid:'one',cardId:'dp6-117'},{uid:'two',cardId:'dp6-117'}];bench(t,'opponent','dp6-117');use(t,'ability');settle(t);assert.equal(t.sides.player.hand.length,0);assert.equal(t.sides.player.discard.length>=2,true);});
test('Regirock Regi Cycle discards two cards and attaches Fighting Energy from discard',()=>{const s=board(38);s.sides.player.hand=[{uid:'one',cardId:'dp6-117'},{uid:'two',cardId:'dp6-117'}];s.sides.player.energyDiscard={Fighting:2};use(s,'ability');settle(s);assert.equal(s.sides.player.active.energy.Fighting,4);assert.equal(s.sides.player.hand.length,0);});
test('Registeel Regi Heal discards exactly 2 from hand; Rotating Claws can replace Energy',()=>{const s=board(39);s.sides.player.active.damage=50;s.sides.player.hand=[{uid:'one',cardId:'dp6-117'},{uid:'two',cardId:'dp6-117'}];use(s,'ability');settle(s);assert.equal(s.sides.player.active.damage,20);assert.equal(s.sides.player.hand.length,0);
 const t=board(39);t.sides.player.discard=[{uid:'replacement',cardId:'dp1-124'}];use(t);settle(t);assert.ok(t.sides.player.active.energy.Fire>=3);});
test('Unown J JUNK only activates when Benched from hand; Hidden Power cures only Sleep',()=>{const s=board(76);s.sides.opponent.active.conditions={sleep:true,poison:{amount:10}};use(s);assert.ok(!s.sides.opponent.active.conditions.sleep);assert.ok(s.sides.opponent.active.conditions.poison);
 const ab=data.cardById('dp6-76').abilities[0];assert.equal(ab.event,'benched');assert.equal(ab.fromHandOnly,true);});
test('Unown U UNSEEN protects all Unown on Bench, not unrelated Pokémon',()=>{const s=board(78);const u=bench(s,'player','dp6-78');const v=bench(s,'player','dp6-79');const p=bench(s,'player','dp6-117');assert.ok(fx.attackIsPrevented(s,'player',u,s.sides.opponent.active,data.cardById)?.effects);assert.ok(fx.attackIsPrevented(s,'player',v,s.sides.opponent.active,data.cardById)?.effects);assert.notEqual(fx.attackIsPrevented(s,'player',p,s.sides.opponent.active,data.cardById)?.reason,'UNSEEN');});
test('Unown V VACATION heals all then ends own turn, Hidden Power damages own Bench',()=>{const s=board(79);const b=bench(s,'player','dp6-117');b.damage=30;s.sides.player.active.damage=40;use(s,'ability');assert.equal(b.damage,10);assert.equal(s.sides.player.active.damage,20);assert.notEqual(s.activeSide,'player');
 const t=board(79);bench(t,'player','dp6-117');use(t);assert.equal(t.sides.player.bench[0].damage,10);});
test('Unown W WALL protects allied active and benched, Hidden Power draws',()=>{const s=board(80);const p=bench(s,'player','dp6-117');assert.equal(fx.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',p,40,data.cardById),30);assert.equal(fx.attackDamageWithState(s,'opponent',s.sides.opponent.active,'player',s.sides.player.active,40,data.cardById),30);
 const t=board(80);t.sides.player.deck=[{uid:'draw',cardId:'dp6-117'}];use(t);assert.equal(t.sides.player.hand.length,1);});
test('Unown Y YAWN only heals and sleeps an active Unown; Hidden Power takes up to 2 Trainers',()=>{const s=board(81);const active=board(80).sides.player.active;active.damage=30;s.sides.player.active=active;const y=bench(s,'player','dp6-81');use(s,'ability');assert.equal(active.damage,20);assert.ok(active.conditions.sleep);
 const t=board(81);t.sides.player.deck=[{uid:'trainer1',cardId:'dp6-129'},{uid:'trainer2',cardId:'dp6-132'},{uid:'other',cardId:'dp6-117'}];use(t);settle(t);assert.equal(t.sides.player.hand.length,2);assert.ok(t.sides.player.hand.every(r=>data.cardById(r.cardId).kind==='trainer'));});
test('New Poké-Powers are only offered when their printed prerequisites can resolve',()=>{
 const heat=board(6);assert.equal(actions(heat,'ability').length,0);
 const donor=bench(heat,'player','dp6-117');donor.energy={Fire:1};assert.equal(actions(heat,'ability').length,1);
 const ray=board(14);assert.equal(actions(ray,'ability').length,0);
 ray.sides.player.energyDiscard={Fire:1};assert.equal(actions(ray,'ability').length,1);
 bench(ray,'player','dp6-14');assert.equal(actions(ray,'ability').length,0);
 const ice=board(36);ice.sides.player.hand=[{uid:'1',cardId:'dp6-117'},{uid:'2',cardId:'dp6-117'}];assert.equal(actions(ice,'ability').length,0);
 bench(ice,'opponent','dp6-117');assert.equal(actions(ice,'ability').length,1);
 ice.sides.opponent.active=core.makePokemonSlot('dp6-46',2,'evolved');assert.equal(actions(ice,'ability').length,0);
 const rock=board(38);rock.sides.player.hand=[{uid:'1',cardId:'dp6-117'},{uid:'2',cardId:'dp6-117'}];assert.equal(actions(rock,'ability').length,0);
 rock.sides.player.energyDiscard={Fighting:1};assert.equal(actions(rock,'ability').length,1);
 const vacation=board(79);assert.equal(actions(vacation,'ability').length,0);
 vacation.sides.player.active.damage=20;assert.equal(actions(vacation,'ability').length,1);
 const yawn=board(81);assert.equal(actions(yawn,'ability').length,0);
 const y=bench(yawn,'player','dp6-81');yawn.sides.player.active=core.makePokemonSlot('dp6-80',2,'unown');
 assert.equal(actions(yawn,'ability').some(x=>x.cardId==='dp6-81'&&x.target==='bench'),true);
});
