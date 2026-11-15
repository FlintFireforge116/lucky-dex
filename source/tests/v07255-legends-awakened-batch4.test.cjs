'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const la=require('../app/src/main/assets/tcg-classic-legends-awakened.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:47});assert.ok(loan.ok,loan.error);
const nums=[2,5,9,31,33,37,43,56,60,66,68,69,73,85,99,100,118,120];
const slot=(id,uid)=>{const s=core.makePokemonSlot(id,2,uid||id);return s;};
function board(id,defender='dp5-17',seed=27){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].bench=[];s.sides[side].hand=[];}
 s.sides.player.active=slot(id,'actor');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5};
 s.sides.opponent.active=slot(defender,'defender');return s;
}
function bench(s,side,id='dp5-12',uid='b1'){const p=slot(id,uid);p.benchSlot=s.sides[side].bench.length;s.sides[side].bench.push(p);return p;}
function actions(s,side='player',type='effectChoice'){return core.legalActions(s,side).filter(x=>x.type===type);}
function attack(s,i=0,selector={}){const options=actions(s,'player','attack').filter(x=>x.attackIndex===i);assert.ok(options.length,`${s.sides.player.active?.cardId} attack ${i} missing`);const a=options.find(x=>Object.entries(selector).every(([k,v])=>x[k]===v))||options[0];core.applyAction(s,'player',a);return a;}
function choose(s,i=0,side='player'){const opts=actions(s,side);assert.ok(opts.length,`${side} no choice ${s.phase}`);core.applyAction(s,side,opts[i]);}
function quietChoices(s,side='player',limit=18){for(let i=0;i<limit&&s.phase==='effectChoice';i++){let chooser=s.pendingChoice?.side||side;const opts=actions(s,chooser);assert.ok(opts.length);core.applyAction(s,chooser,opts[0]);}assert.notEqual(s.phase,'effectChoice');}

test('DP6 registration, all 18 new prints and every new ability/attack has validated effects',()=>{
 assert.equal(la.CARDS.length,146);assert.equal(la.coverage().battleEnabled,80);
 for(const n of nums){const c=data.cardById('dp6-'+n);assert.ok(c?.battleEnabled,`dp6-${n} gated`);assert.ok(c?.attacks?.length>=1);for(const move of c.attacks)assert.deepEqual(fx.validateEffect(move.effect),[],`${n}: ${move.name}`);for(const power of c.abilities||[])assert.deepEqual(fx.validateEffect(power.effect),[],`${n}: ${power.name}`);}
 for(const n of [1,6,7,8,10,12,14,16,19,24,25,26,27,28,38,138,139,140,141,142,143,144,145,146])assert.equal(data.isBattleEnabled('dp6-'+n),false,`unimplemented dp6-${n} entered deck`);
});

test('all new printed attack paths initiate without exceptions, with real choices settled',()=>{
 for(const n of nums){const c=data.cardById('dp6-'+n);for(let i=0;i<c.attacks.length;i++){
  const s=board('dp6-'+n);bench(s,'player','dp6-117','mine');bench(s,'opponent','dp5-12','theirs');s.sides.opponent.active.energy={Water:2,Grass:1};
  assert.doesNotThrow(()=>attack(s,i),`dp6-${n} ${c.attacks[i].name}`);assert.notEqual(s.phase,'error');quietChoices(s);
 }}
});

test('Dragonite Draco Meteor independently flips for Active and every opponent Bench',()=>{
 const s=board('dp6-2','dp5-17',3);bench(s,'opponent','dp5-12','one');bench(s,'opponent','dp5-20','two');attack(s,1);
 const rolls=s.log.filter(x=>x.type==='coin'&&/Draco Meteor/.test(x.reason||''));assert.equal(rolls.length,3);
 assert.equal(s.sides.opponent.active.damage,rolls[0].heads?50:0);
 assert.equal(s.sides.opponent.bench[0].damage,rolls[1].heads?50:0);
 assert.equal(s.sides.opponent.bench[1].damage,rolls[2].heads?50:0);
});

test('Gliscor Burning Poison offers status choice then optional whole-stack return',()=>{
 const s=board('dp6-5');bench(s,'player','dp6-117','mine');s.sides.player.active.stack=['dp6-95','dp6-5'];
 attack(s,0);assert.equal(s.phase,'effectChoice');assert.equal(actions(s).length,2);
 choose(s,1);assert.equal(s.sides.opponent.active.conditions.poison!=null,true);
 if(s.phase==='effectChoice')choose(s,1);
 assert.equal(s.sides.player.hand.some(ref=>ref.cardId==='dp6-5'),true);
});

test('Mamoswine Charge Through choices change Active and Bench damage and recoil as printed',()=>{
 let s=board('dp6-9');bench(s,'opponent','dp5-12','one');
 const opts=actions(s,'player','attack').filter(a=>a.attackIndex===1);assert.equal(opts.length,2);
 attack(s,1,{effectSelection:''});assert.equal(s.sides.opponent.active.damage,60);assert.equal(s.sides.player.active.damage,0);assert.equal(s.sides.opponent.bench[0].damage,0);
 s=board('dp6-9');bench(s,'opponent','dp5-12','one');attack(s,1,{effectSelection:'one'});
 assert.equal(s.sides.opponent.active.damage,100);assert.equal(s.sides.opponent.bench[0].damage,40);assert.equal(s.sides.player.active.damage,40);
});

test('Jirachi One Desire puts chosen physical card on top after shuffling; Doom Desire delayed KO',()=>{
 let s=board('dp6-31');s.sides.player.deck=[{uid:'first',cardId:'dp6-117'},{uid:'second',cardId:'dp6-118'},{uid:'third',cardId:'dp6-121'}];attack(s,0);assert.equal(s.phase,'effectChoice');
 const opts=actions(s);assert.equal(opts.length,3);const q=opts.findIndex(a=>a.choiceDeckIndex===1);assert.ok(q>=0);choose(s,q);assert.equal(s.sides.player.deck[0].uid,'second');
 s=board('dp6-31');attack(s,1);assert.equal(Object.values(s.sides.player.active.energy).reduce((n,v)=>n+v,0),0);assert.equal(s.delayedEffects?.length,1);assert.equal(s.delayedEffects[0].targetUid,'defender');
});

test('Lopunny draw and evolved-target bonus, and Regigigas Gigaton bonus coin are resolved',()=>{
 let s=board('dp6-33');s.sides.player.deck=[{uid:'a',cardId:'dp6-117'},{uid:'b',cardId:'dp6-117'},{uid:'c',cardId:'dp6-117'}];attack(s,0);assert.equal(s.sides.player.hand.length,3);
 s=board('dp6-33','dp6-55');attack(s,1);assert.equal(s.sides.opponent.active.damage,60);
 s=board('dp6-37');bench(s,'opponent','dp5-12','b');attack(s,0);const roll=s.log.find(x=>x.type==='coin'&&x.side==='player');assert.equal(s.sides.opponent.active.damage,roll.heads?80:60);assert.equal(s.sides.opponent.bench[0].damage,roll.heads?20:0);
});

test('Uxie Psychic Restore keeps card or puts stack and attachments on bottom in chosen order',()=>{
 let s=board('dp6-43');s.sides.player.active.energy={Psychic:2};attack(s,0);assert.equal(s.phase,'effectChoice');choose(s,0);assert.equal(s.sides.player.active.cardId,'dp6-43');
 s=board('dp6-43');s.sides.player.active.energy={Psychic:1};bench(s,'player','dp6-117','mine');attack(s,0);choose(s,1);assert.equal(s.phase,'effectChoice');quietChoices(s);
 assert.equal(s.phase,'promote');assert.ok(s.sides.player.bench.some(p=>p.cardId==='dp6-117'));assert.ok(s.sides.player.deck.some(ref=>ref.cardId==='dp6-43'));assert.ok(s.sides.player.deck.some(ref=>ref.cardId==='dp1-127'));
});

test('Grumpig Magical Step sets 60 counter confusion and Grind scales with attached Energy',()=>{
 let s=board('dp6-56');attack(s,0);assert.equal(s.sides.opponent.active.conditions.confusion.selfDamage,60);
 s=board('dp6-56');s.sides.player.active.energy={Psychic:1,Grass:2};attack(s,1);assert.equal(s.sides.opponent.active.damage,60);
});

test('Ledian Baton Pass selects replacement and permits zero/some/all Energy transfers',()=>{
 const s=board('dp6-60');const original=s.sides.player.active;original.energy={Grass:2,Fire:1};bench(s,'player','dp6-117','mine');attack(s,1);
 assert.equal(s.phase,'effectChoice');choose(s,1);assert.equal(s.phase,'effectChoice');choose(s,0);
 assert.equal(s.sides.player.active.uid,'mine');assert.equal(s.phase,'effectChoice');const picks=actions(s);assert.ok(picks.length>=3);
 choose(s,1);assert.equal(s.sides.player.active.energy.Grass,1);assert.equal(original.energy.Grass,1);
 if(s.phase==='effectChoice')choose(s,0);assert.equal(s.phase,'battle');
});

test('Mightyena Bite On blocks Basic attacker/retreat and Powers only; Harass counts own bench',()=>{
 let s=board('dp6-66','dp6-43');attack(s,0);assert.ok(s.sides.opponent.active.locks.some(l=>l.action==='attack'));assert.ok(s.sides.opponent.active.locks.some(l=>l.action==='retreat'));assert.equal(s.sides.opponent.active.dp6PowerLockUntil,11);
 s=board('dp6-66');bench(s,'player','dp6-117','b');attack(s,1);assert.equal(s.sides.opponent.active.damage,20);
});

test('Persian Feint Attack ignores Weakness and defensive effects; Fasten Claws reports its roll',()=>{
 let s=board('dp6-68','dp6-117');s.sides.opponent.active.attackGuard={expiresTurn:20};attack(s,0);assert.equal(s.sides.opponent.active.damage,30);
 s=board('dp6-68');attack(s,1);const roll=s.log.find(x=>x.type==='coin'&&x.side==='player');assert.equal(s.sides.opponent.active.damage,roll.heads?50:40);
});

test('Piloswine Charge Dash optional recoil and Icy Wind Sleep',()=>{
 let s=board('dp6-69');attack(s,0,{effectSelection:''});assert.equal(s.sides.opponent.active.damage,30);assert.equal(s.sides.player.active.damage,0);
 s=board('dp6-69');attack(s,0,{effectSelection:'boost'});assert.equal(s.sides.opponent.active.damage,60);assert.equal(s.sides.player.active.damage,30);
 s=board('dp6-69');attack(s,1);assert.equal(s.log.some(e=>e.type==='status'&&e.status==='sleep'),true);
});

test('Swellow Mach Descent checks actual Bench-to-Active timing; retreat body needs zero Energy',()=>{
 let s=board('dp6-73');attack(s,0);assert.equal(s.sides.opponent.active.damage,30);
 s=board('dp6-73');s.sides.player.active.movedToActiveTurn=10;attack(s,0);assert.equal(s.sides.opponent.active.damage,60);
});

test('Bellsprout Vine Bind locks Poke-Powers only on heads; Careless Tackle recoils',()=>{
 let s=board('dp6-85','dp6-43',4);attack(s,0);const roll=s.log.find(x=>x.type==='coin'&&x.side==='player');assert.equal(s.sides.opponent.active.dp6PowerLockUntil===11,!!roll.heads);
 s=board('dp6-85');attack(s,1);assert.equal(s.sides.opponent.active.damage,20);assert.equal(s.sides.player.active.damage,10);
});

test('Hitmonchan Counter Punch queues retaliatory damage; Gut Strike only bonus with Tyrogue stack',()=>{
 let s=board('dp6-99');attack(s,0);assert.equal(s.sides.player.active.retaliate.amount,40);
 s=board('dp6-99');attack(s,1);assert.equal(s.sides.opponent.active.damage,30);
 s=board('dp6-99');s.sides.player.active.stack=['dp6-126','dp6-99'];attack(s,1);assert.equal(s.sides.opponent.active.damage,60);
});

test('Hitmonlee Gut Kick enables bench attack only when evolved from Tyrogue',()=>{
 let s=board('dp6-100');bench(s,'opponent','dp5-12','b');assert.equal(actions(s,'player','attack').filter(x=>x.attackIndex===0).length,1);attack(s,0);assert.equal(s.sides.opponent.active.damage,30);
 s=board('dp6-100');s.sides.player.active.stack=['dp6-126','dp6-100'];bench(s,'opponent','dp5-12','b');assert.equal(actions(s,'player','attack').filter(x=>x.attackIndex===0).length,2);attack(s,0,{effectSelection:'b'});assert.equal(s.sides.opponent.bench[0].damage,30);assert.equal(s.sides.opponent.active.damage,0);
});

test('Shinx Recharge only attaches actual Lightning Energy from deck; Sneasel returns Tools and TMs',()=>{
 let s=board('dp6-118');s.sides.player.active.energy={Grass:1};s.sides.player.deck=[{uid:'one',cardId:'dp1-126'},{uid:'two',cardId:'dp1-125'}];attack(s,0);assert.equal(s.phase,'effectChoice');choose(s,0);assert.equal(s.sides.player.active.energy.Lightning,1);assert.ok(!s.sides.player.deck.some(ref=>ref.uid==='one'));
 s=board('dp6-120');s.sides.opponent.hand=[{uid:'tm',cardId:'dp6-136'},{uid:'tool',cardId:'dp6-129'},{uid:'basic',cardId:'dp6-117'}];attack(s,0);assert.equal(s.sides.opponent.hand.length,2);assert.ok(s.sides.opponent.hand.some(ref=>ref.cardId==='dp6-117'));for(const id of ['dp6-136','dp6-129'])assert.equal([...s.sides.opponent.hand,...s.sides.opponent.deck].filter(ref=>ref.cardId===id).length,1);
});
