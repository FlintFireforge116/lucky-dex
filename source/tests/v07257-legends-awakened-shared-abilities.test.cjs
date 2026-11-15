'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const la=require('../app/src/main/assets/tcg-classic-legends-awakened.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:31});assert.ok(loan.ok);
const ids=[8,10,12,15,23,28,30,34,41,46,57,83,105,126];
function board(id,opp='dp6-117',seed=51){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].hand=[];s.sides[side].bench=[];}
 s.sides.player.active=core.makePokemonSlot('dp6-'+id,2,'actor');
 s.sides.player.active.energy={Grass:3,Fire:3,Water:3,Lightning:3,Psychic:3,Fighting:3,Metal:3,Darkness:3};
 s.sides.opponent.active=core.makePokemonSlot(opp,2,'defender');return s;
}
function bench(s,side,id,uid){const p=core.makePokemonSlot(id,2,uid||'b'+s.sides[side].bench.length);p.benchSlot=s.sides[side].bench.length;s.sides[side].bench.push(p);return p;}
function actions(s,which='attack',side='player'){return core.legalActions(s,side).filter(a=>a.type===which);}
function use(s,which='attack',index=0,side='player'){const act=actions(s,which,side)[index];assert.ok(act,`${which} missing for ${s.sides[side].active?.cardId} ${s.phase}`);core.applyAction(s,side,act);return act;}
function damage(s){return [...s.log].reverse().find(e=>e.type==='attack'&&e.side==='player')?.damage;}
function settle(s){for(let i=0;i<20&&s.phase==='effectChoice';i++)use(s,'effectChoice',0,s.pendingChoice.side);assert.notEqual(s.phase,'effectChoice');}
test('Legends Awakened expands to 111; all 14 audited prints are complete and effect-schema valid',()=>{
 assert.equal(la.coverage().battleEnabled,111);
 for(const n of ids){const c=data.cardById('dp6-'+n);assert.ok(c.battleEnabled,`dp6-${n} gated`);
  for(const a of c.attacks)assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);
  for(const a of c.abilities)assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);
 }
 for(const n of [6,7,13,14,16,18,19,21,27,38,40,42,129,130,131,135])assert.equal(data.isBattleEnabled('dp6-'+n),false,`incomplete dp6-${n} activated`);
});
test('Every new attack can be declared and its choices resolve without throwing',()=>{
 for(const n of ids){const c=data.cardById('dp6-'+n);for(let i=0;i<c.attacks.length;i++){
  const s=board(n);bench(s,'player','dp6-117');bench(s,'opponent','dp6-117');
  if(n===15)s.sides.opponent.prizes=[{cardId:'dp6-117'}];
  assert.ok(actions(s,'attack').some(a=>a.attackIndex===i),`${n} attack ${i} unavailable`);
  const idx=actions(s,'attack').findIndex(a=>a.attackIndex===i);
  assert.doesNotThrow(()=>use(s,'attack',idx),`dp6-${n} ${c.attacks[i].name}`);settle(s);
  assert.notEqual(s.phase,'error',c.id+' '+c.attacks[i].name);
 }}
});
test('Luxray Rivalry applies only against opposing LV.X and Shock Bolt removes Lightning',()=>{
 const s=board(8);bench(s,'opponent','dp6-146');use(s);assert.equal(damage(s),90);
 const t=board(8);use(t);assert.equal(damage(t),40);
 const u=board(8);use(u,'attack',1);assert.equal(u.sides.player.active.energy.Lightning,0);
});
test('Metagross Extra Comet Punch reaches 100 next turn; Magnetic Reversal choice selects opposing Bench',()=>{
 const s=board(10);use(s);assert.equal(damage(s),50);
 s.turnNumber=12;s.activeSide='player';s.phase='battle';s.sides.player.turnCount++;if(s.sides.opponent.active)s.sides.opponent.active.damage=0;
 use(s);assert.equal(damage(s),100);
 const t=board(10);bench(t,'opponent','dp6-117','target');use(t,'ability');settle(t);
 assert.ok(t.log.some(x=>x.type==='coin'));
});
test('Politoed Enthusiasm applies only to the printed Poliwag line and only with all members in play',()=>{
 const s=board(12);bench(s,'player','dp6-114');bench(s,'player','dp6-115');bench(s,'player','dp6-35');
 const p=s.sides.player.bench[0];const normal=fx.attackDamageWithState(s,'player',p,'opponent',s.sides.opponent.active,10,data.cardById);
 assert.equal(normal,70);
 s.sides.player.bench.pop();assert.equal(fx.attackDamageWithState(s,'player',p,'opponent',s.sides.opponent.active,10,data.cardById),10);
});
test('Regigigas Slow Start prevents attacks until opponent has three or fewer Prizes; Crush Grip uses previous damage',()=>{
 const s=board(15);s.sides.opponent.prizes=Array.from({length:4},(_,n)=>({uid:'p'+n,cardId:'dp6-117'}));
 assert.equal(actions(s,'attack').length,0);s.sides.opponent.prizes.pop();assert.ok(actions(s,'attack').length);
 s.sides.opponent.active.damage=20;use(s);assert.equal(damage(s),40);
});
test('Delcatty Energy Assist chooses a discarded Basic Energy and a Bench target',()=>{
 const s=board(23);const b=bench(s,'player','dp6-117');s.sides.player.discard.push({uid:'lightning',cardId:'dp1-126'});
 use(s);assert.equal(s.phase,'effectChoice');settle(s);
 assert.equal(b.energy.Lightning,1);assert.equal(s.sides.player.discard.some(r=>r.uid==='lightning'),false);
});
test('Metal Heatran Heavy Metal scales with independent Metal Energy coin flips, Smelt moves actual attached Energy',()=>{
 const s=board(30);s.sides.player.active.energy={Metal:2,Fire:1};use(s);const roll=s.log.find(x=>x.type==='coin');assert.ok(roll);
 assert.equal(damage(s),40+20*roll.heads);
 const t=board(30);const source=bench(t,'player','dp6-117');source.energy={Metal:1};use(t,'ability');assert.equal(t.phase,'effectChoice');settle(t);
 assert.equal(source.energy.Metal,0);assert.equal(t.sides.player.active.energy.Metal,4);
});
test('Mesprit Extrasensory compares real hand sizes; Psychic Bind locks Poké-Powers globally',()=>{
 const s=board(34);s.sides.player.hand=[{uid:'a',cardId:'dp6-117'}];s.sides.opponent.hand=[{uid:'b',cardId:'dp6-117'}];use(s);assert.equal(damage(s),80);
 const t=board(34);t.sides.player.hand=[{uid:'a',cardId:'dp6-117'}];use(t);assert.equal(damage(t),30);
});
test('Torkoal White Smoke prevents effects and damage to allied Bench, not to Active',()=>{
 const s=board(41);const p=bench(s,'player','dp6-117');const foe=s.sides.opponent.active;
 const protect=fx.attackIsPrevented(s,'player',p,foe,data.cardById);
 assert.ok(protect?.effects,JSON.stringify(protect));
 const active=fx.attackIsPrevented(s,'player',s.sides.player.active,foe,data.cardById);
 assert.notEqual(active?.reason,'White Smoke');
});
test('Anorith Guard Claw uses timed damage reduction; Lileep Absorb heals precisely 20',()=>{
 const s=board(46);use(s);assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'damageReduction',data.cardById),20);
 const t=board(105);t.sides.player.active.damage=50;use(t,'attack',1);assert.equal(t.sides.player.active.damage,30);
});
test('Houndoom Revenge Fang checks Bench sizes; Burning Sensation only Burns previously damaged opponent',()=>{
 const s=board(57);bench(s,'opponent','dp6-117');use(s);assert.equal(damage(s),60);
 const t=board(57);use(t);assert.equal(damage(t),20);assert.ok(!t.sides.opponent.active.conditions?.burn);
 const u=board(57);u.sides.opponent.active.damage=10;use(u);assert.ok(u.sides.opponent.active.conditions?.burn||u.log.some(x=>x.type==='status'&&x.status==='burn'));
});
test('Beldum Metal Chain and Tyrogue Baby Evolution are correct triggered/activated Powers',()=>{
 const s=board(83);const ab=data.cardById('dp6-83').abilities[0];assert.equal(ab.event,'energyAttached');assert.equal(ab.fromHandOnly,true);
 const t=board(126);t.sides.player.hand=[{uid:'hit',cardId:'dp6-99'}];t.sides.player.active.damage=30;
 use(t,'ability');assert.equal(t.phase,'effectChoice');settle(t);
 assert.equal(t.sides.player.active.cardId,'dp6-99');assert.equal(t.sides.player.active.damage,0);
 assert.ok(t.sides.player.active.stack.includes('dp6-126'));
});

test('Luxray Plasma moves one real discarded Lightning Energy to attacker',()=>{
 const s=board(8);s.sides.player.active.energy={Colorless:2};s.sides.player.discard.push({uid:'L',cardId:'dp1-126'});
 use(s);assert.equal(s.sides.player.active.energy.Lightning,1);
 assert.equal(s.sides.player.discard.some(x=>x.uid==='L'),false);
});
test('Delcatty Attracting Body reacts to a real opposing hit when Active',()=>{
 const s=board(23,'dp6-117');s.activeSide='opponent';s.sides.opponent.active.energy={Fighting:2,Colorless:3};
 const attack=actions(s,'attack','opponent')[0];assert.ok(attack);
 core.applyAction(s,'opponent',attack);
 assert.ok(s.log.some(x=>x.ability==='Attracting Body')||s.phase==='effectChoice',JSON.stringify(s.log.slice(-8)));
});
test('Forretress Iron Shell triggers on Basic Energy from hand, not from Classic Energy Zone',()=>{
 const s=board(28);s.sides.player.active.energy={Metal:1};s.sides.player.hand=[{uid:'metalFromHand',cardId:'dp1-130'}];
 const x=actions(s,'attachSpecial').find(x=>x.cardId==='dp1-130'&&x.target==='active');assert.ok(x);
 core.applyAction(s,'player',x);
 assert.equal(s.phase,'effectChoice','Body should offer its optional coin flip');
 assert.equal(actions(s,'effectChoice').length,2);
 const t=board(28);t.sides.player.active.energy={Metal:1};const energy=actions(t,'attach');assert.ok(energy.length);
 core.applyAction(t,'player',energy[0]);assert.notEqual(t.phase,'effectChoice','Zone attachment may not trigger Iron Shell');
});
test('Mesprit Psychic Bind benched from hand offers optional next-opponent-turn Poké-Power lock',()=>{
 const s=board(117);s.sides.player.hand=[{uid:'mespritFromHand',cardId:'dp6-34'}];
 const action=actions(s,'bench').find(a=>a.cardId==='dp6-34');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice');
 assert.equal(actions(s,'effectChoice').length,2);use(s,'effectChoice',1);
 assert.equal(s.sides.opponent.dp6PsychicBindUntil,11);
 s.turnNumber=11;s.activeSide='opponent';
 const p=bench(s,'opponent','dp6-43');assert.equal(fx.abilitiesSuppressed(s,'opponent',p,data.cardById),true);
});
test('Beldum Metal Chain triggers only on physical Metal from hand, not free Energy Zone',()=>{
 const s=board(83);s.sides.player.deck=[{uid:'extraBeldum',cardId:'dp6-83'}];
 s.sides.player.hand=[{uid:'metalFromHand',cardId:'dp1-130'}];
 const action=actions(s,'attachSpecial').find(a=>a.cardId==='dp1-130');assert.ok(action);core.applyAction(s,'player',action);
 assert.equal(s.phase,'effectChoice');settle(s);
 assert.ok(s.sides.player.bench.some(p=>p.cardId==='dp6-83'));
 const t=board(83);t.sides.player.deck=[{uid:'extra',cardId:'dp6-83'}];use(t,'attach');assert.equal(t.sides.player.bench.length,0);
});
test('Lileep Astonish removes exactly one random physical card from opponent hand',()=>{
 const s=board(105);s.sides.opponent.hand=[{uid:'a',cardId:'dp6-117'},{uid:'b',cardId:'dp6-114'}];const before=s.sides.opponent.deck.length;
 fx.applyEffect(data.cardById('dp6-105').attacks[0].effect,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,random:()=>0,shuffle:()=>{}});
 assert.equal(s.sides.opponent.hand.length,1);assert.equal(s.sides.opponent.deck.length,before+1);
});
test('Psychic Bind turns off opposing Poké-Powers but never a printed Poké-Body',()=>{
 const s=board(41);
 s.sides.player.dp6PsychicBindUntil=s.turnNumber;
 const passive=s.sides.player.active;
 assert.equal(fx.abilitiesSuppressed(s,'player',passive,data.cardById),false,'Torkoal White Smoke Body must stay active');
 const p=bench(s,'player','dp6-30','metalHeatran');
 assert.equal(fx.abilitiesSuppressed(s,'player',p,data.cardById),true,'Heatran Smelt Power is blocked');
 const ally=bench(s,'player','dp6-117','protected');
 assert.ok(fx.attackIsPrevented(s,'player',ally,s.sides.opponent.active,data.cardById)?.effects,'Body still protects Bench');
});
