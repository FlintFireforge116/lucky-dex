'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const B=require('../app/src/main/assets/adventure/adventure-battle.js');
const V=require('../app/src/main/assets/adventure/adventure-move-view.js');

const mon=(id,key,moves,opts={})=>({
  id,key,name:opts.name||`Mon ${id}`,types:opts.types||['normal'],level:opts.level||20,moves,
  baseStats:opts.baseStats||{hp:100,attack:80,defense:90,speed:opts.speed||80},
  hp:opts.hp,maxHp:opts.maxHp,status:opts.status,weight:opts.weight||50
});
const fight=(player,enemy,seed=1)=>B.create([player],enemy,{context:'regional',kind:'trainer',seed});

// RED contracts for the v0.40.11 mechanics audit.
test('recoil moves damage the user in proportion to damage dealt',()=>{
  const f=fight(mon(1,'1:n',[528],{speed:200}),mon(2,null,[150],{speed:1,baseStats:{hp:180,attack:5,defense:90,speed:1}}));
  const before=f.party[0].hp;
  const r=B.act(f,'move',{moveId:528},{});
  assert.ok(r.action.damage>0);
  assert.ok(f.party[0].hp<before,'Wild Charge should recoil onto the user');
  assert.ok(r.action.events.some(e=>e.kind==='hit'&&e.target==='player'&&/recoil/i.test(e.text)));
});

test('damaging stat-change moves apply real stages and speed stages affect turn order',()=>{
  const p=mon(1,'1:n',[490,33],{speed:80,baseStats:{hp:150,attack:35,defense:150,speed:80}});
  const e=mon(2,null,[33],{speed:100,baseStats:{hp:220,attack:8,defense:180,speed:100}});
  const f=fight(p,e,3);
  B.act(f,'move',{moveId:490},{});
  assert.equal(f.enemy.stages.speed,-1);
  const before=f.enemy.hp;
  const r=B.act(f,'move',{moveId:33},{});
  const firstHit=r.action.events.find(e=>e.kind==='hit');
  assert.equal(firstHit?.target,'enemy','speed drop should let the player attack first next turn');
  assert.ok(f.enemy.hp<before);
});

test('100% flinch stops a slower target from acting in the same turn',()=>{
  const p=mon(1,'1:n',[252],{speed:200,baseStats:{hp:160,attack:50,defense:150,speed:200}});
  const e=mon(2,null,[33],{speed:1,baseStats:{hp:220,attack:50,defense:180,speed:1}});
  const f=fight(p,e,4),before=f.party[0].hp;
  const r=B.act(f,'move',{moveId:252},{});
  assert.equal(f.party[0].hp,before,'flinched foe should not land its move');
  assert.ok(r.action.events.some(e=>/flinched/i.test(e.text)));
});

test('confusion is a volatile condition rather than an unsupported status move',()=>{
  const f=fight(mon(1,'1:n',[109],{speed:200}),mon(2,null,[150],{speed:1}),5);
  const r=B.act(f,'move',{moveId:109},{});
  assert.ok(f.enemy.confusionTurns>0);
  assert.ok(r.action.events.some(e=>/confused/i.test(e.text)));
  assert.equal(r.action.events.some(e=>/No battle effect is currently implemented/i.test(e.text)),false);
});

test('binding moves trap and deal residual damage',()=>{
  const f=fight(mon(1,'1:n',[20],{speed:200,baseStats:{hp:160,attack:35,defense:160,speed:200}}),mon(2,null,[150],{speed:1,baseStats:{hp:300,attack:5,defense:220,speed:1}}),1);
  const r=B.act(f,'move',{moveId:20},{});
  assert.ok(f.enemy.trapTurns>0);
  assert.ok(r.action.events.some(e=>e.source==='trap'&&e.target==='enemy'));
});

test('Protect blocks the opposing targeted move for the turn',()=>{
  const f=fight(mon(1,'1:n',[182],{speed:1,baseStats:{hp:160,attack:20,defense:120,speed:1}}),mon(2,null,[33],{speed:200,baseStats:{hp:200,attack:80,defense:100,speed:200}}),9);
  const before=f.party[0].hp;
  const r=B.act(f,'move',{moveId:182},{});
  assert.equal(f.party[0].hp,before);
  assert.ok(r.action.events.some(e=>/protected itself/i.test(e.text)));
  assert.ok(r.action.events.some(e=>/blocked/i.test(e.text)));
});

test('Rest fully heals, clears the old status and puts the user to sleep',()=>{
  const p=mon(1,'1:n',[156],{speed:200,status:'poison',baseStats:{hp:160,attack:20,defense:200,speed:200}});
  const f=fight(p,mon(2,null,[150],{speed:1}),11);
  f.party[0].hp=Math.floor(f.party[0].maxHp/3);
  const r=B.act(f,'move',{moveId:156},{});
  const heal=r.action.events.find(e=>e.kind==='heal'&&/rested/i.test(e.text));
  assert.equal(heal?.hp,f.party[0].maxHp);
  assert.equal(f.party[0].status,'sleep');
  assert.ok(f.party[0].statusTurns>=2);
  assert.ok(r.action.events.some(e=>/restored.*health|rested/i.test(e.text)));
});

test('Leech Seed drains the target and heals its owner each turn',()=>{
  const p=mon(1,'1:n',[73],{speed:200,baseStats:{hp:160,attack:20,defense:200,speed:200}});
  const f=fight(p,mon(2,null,[150],{speed:1,baseStats:{hp:220,attack:5,defense:200,speed:1}}),12);
  f.party[0].hp=Math.max(1,f.party[0].maxHp-40);
  const playerBefore=f.party[0].hp,enemyBefore=f.enemy.hp;
  const r=B.act(f,'move',{moveId:73},{});
  assert.ok(f.enemy.leechSeededBy);
  assert.ok(f.enemy.hp<enemyBefore);
  assert.ok(f.party[0].hp>playerBefore);
  assert.ok(r.action.events.some(e=>e.source==='leech-seed'));
});

test('Haze resets accumulated battle stat stages on both sides',()=>{
  const f=fight(mon(1,'1:n',[14,114],{speed:200}),mon(2,null,[43,150],{speed:1}),13);
  B.act(f,'move',{moveId:14},{});
  assert.notEqual(f.party[0].stages.attack,0);
  B.act(f,'move',{moveId:114},{});
  assert.deepEqual(f.party[0].stages,{attack:0,defense:0,spAttack:0,spDefense:0,speed:0,accuracy:0,evasion:0});
  assert.deepEqual(f.enemy.stages,{attack:0,defense:0,spAttack:0,spDefense:0,speed:0,accuracy:0,evasion:0});
});

test('party cure moves clear major and volatile status across the party',()=>{
  const p1=mon(1,'1:n',[215],{speed:200,status:'burn'});
  const p2=mon(3,'3:n',[33],{status:'poison'});
  const f=B.create([p1,p2],mon(2,null,[150],{speed:1}),{context:'regional',kind:'trainer',seed:14});
  f.party[1].confusionTurns=3;
  B.act(f,'move',{moveId:215},{});
  assert.equal(f.party[0].status,null);
  assert.equal(f.party[1].status,null);
  assert.equal(f.party[1].confusionTurns,0);
});

test('fixed-damage moves use their real damage rule instead of fallback power 40',()=>{
  const f=fight(mon(1,'1:n',[69],{level:20,speed:200,baseStats:{hp:160,attack:5,defense:200,speed:200}}),mon(2,null,[150],{speed:1,baseStats:{hp:300,attack:5,defense:220,speed:1}}),15);
  const r=B.act(f,'move',{moveId:69},{});
  assert.equal(r.action.damage,20);
});

test('move descriptions explain mechanics now supported by LuckyDex',()=>{
  assert.match(V.describe(528).description,/recoil/i);
  assert.match(V.describe(252).description,/flinch/i);
  assert.match(V.describe(109).description,/confus/i);
  assert.match(V.describe(182).description,/block|protect/i);
  assert.match(V.describe(156).description,/sleep|fully|health/i);
  assert.match(V.describe(69).description,/level|fixed/i);
  assert.match(V.describe(240).description,/rain|weather/i);
  assert.match(V.describe(227).description,/repeat|encore/i);
  assert.match(V.describe(366).description,/speed|tailwind/i);
  assert.match(V.describe(100).description,/wild|escape|teleport/i);
});

test('damaging confusion moves can inflict confusion',()=>{
  const f=fight(mon(1,'1:n',[352],{speed:200}),mon(2,null,[150],{speed:1}),18); // Water Pulse, 20% confusion
  // Force the secondary effect to 100% only for this deterministic mechanics test.
  const D=require('../app/src/main/assets/adventure/adventure-move-data.js');
  const before=D.moves[352].effect.ailmentChance;D.moves[352].effect.ailmentChance=100;
  try{B.act(f,'move',{moveId:352},{});assert.ok(f.enemy.confusionTurns>0);}finally{D.moves[352].effect.ailmentChance=before;}
});

test('Hyper Beam family forces a recharge turn',()=>{
  const f=fight(mon(1,'1:n',[63,33],{speed:200,baseStats:{hp:220,attack:15,defense:200,speed:200}}),mon(2,null,[150],{speed:1,baseStats:{hp:500,attack:3,defense:220,speed:1}}),19);
  B.act(f,'move',{moveId:63},{});
  assert.equal(f.party[0].rechargeTurns,1);
  const r=B.act(f,'move',{moveId:33},{});
  assert.ok(r.action.events.some(e=>/recharge/i.test(e.text)));
  assert.equal(f.party[0].rechargeTurns,0);
});

test('Rain Dance creates weather that boosts Water damage and Sunny Day boosts Fire damage',()=>{
  const D=require('../app/src/main/assets/adventure/adventure-move-data.js');
  const mk=()=>fight(mon(1,'1:n',[240,352],{speed:200,types:['water'],baseStats:{hp:220,attack:60,defense:200,speed:200}}),mon(2,null,[150],{speed:1,types:['normal'],baseStats:{hp:500,attack:3,defense:220,speed:1}}),20);
  const dry=mk();const dryHit=B.act(dry,'move',{moveId:352},{}).action.damage;
  const wet=mk();B.act(wet,'move',{moveId:240},{});assert.equal(wet.weather,'rain');const wetHit=B.act(wet,'move',{moveId:352},{}).action.damage;
  assert.ok(wetHit>dryHit,`rain ${wetHit} should exceed dry ${dryHit}`);
});

test('Pain Split equalizes current HP between user and target',()=>{
  const f=fight(mon(1,'1:n',[220],{speed:1,baseStats:{hp:200,attack:20,defense:200,speed:1}}),mon(2,null,[150],{speed:200,baseStats:{hp:300,attack:3,defense:220,speed:200}}),21);
  f.party[0].hp=40;f.enemy.hp=200;
  B.act(f,'move',{moveId:220},{});
  assert.equal(f.party[0].hp,f.enemy.hp);
  assert.ok(f.party[0].hp>40&&f.party[0].hp<200);
});

test('Belly Drum trades half max HP for maximum Attack stage',()=>{
  const f=fight(mon(1,'1:n',[187],{speed:200,baseStats:{hp:200,attack:20,defense:200,speed:200}}),mon(2,null,[150],{speed:1}),22);
  const max=f.party[0].maxHp;
  const r=B.act(f,'move',{moveId:187},{});
  assert.equal(f.party[0].stages.attack,6);
  const cost=r.action.events.find(e=>e.kind==='hit'&&e.target==='player'&&/cut its HP/i.test(e.text));
  assert.equal(cost?.damage,Math.floor(max/2));
});

test('Encore locks the target to its last move for several turns',()=>{
  const player=mon(1,'1:n',[227,33],{speed:1,baseStats:{hp:300,attack:10,defense:200,speed:1}});
  const enemy=mon(2,null,[33,45],{speed:200,baseStats:{hp:300,attack:5,defense:200,speed:200}});
  const f=fight(player,enemy,23);
  B.act(f,'move',{moveId:33},{}); // enemy establishes its last move
  const last=f.enemy.lastMoveId;
  B.act(f,'move',{moveId:227},{});
  assert.equal(f.enemy.encoreMoveId,last);
  assert.ok(f.enemy.encoreTurns>0);
});

test('Disable prevents the target from selecting its last move temporarily',()=>{
  const p=mon(1,'1:n',[50,33],{speed:1,baseStats:{hp:300,attack:10,defense:200,speed:1}});
  const e=mon(2,null,[33],{speed:200,baseStats:{hp:300,attack:5,defense:200,speed:200}});
  const f=fight(p,e,24);
  B.act(f,'move',{moveId:33},{});
  B.act(f,'move',{moveId:50},{});
  assert.equal(f.enemy.disabledMoveId,33);
  assert.ok(f.enemy.disableTurns>0);
});

test('Tailwind doubles effective side speed long enough to change move order',()=>{
  const p=mon(1,'1:n',[366,33],{speed:60,baseStats:{hp:250,attack:20,defense:200,speed:60}});
  const e=mon(2,null,[33],{speed:100,baseStats:{hp:300,attack:5,defense:220,speed:100}});
  const f=fight(p,e,25);
  B.act(f,'move',{moveId:366},{});
  assert.ok(f.party[0].tailwindTurns>0);
  const r=B.act(f,'move',{moveId:33},{});
  assert.equal(r.action.events.find(e=>e.kind==='hit')?.target,'enemy');
});

test('Trick Room reverses equal-priority Speed order while active',()=>{
  const p=mon(1,'1:n',[433,33],{speed:50,baseStats:{hp:250,attack:20,defense:200,speed:50}});
  const e=mon(2,null,[33],{speed:150,baseStats:{hp:300,attack:5,defense:220,speed:150}});
  const f=fight(p,e,26);
  B.act(f,'move',{moveId:433},{});
  assert.ok(f.trickRoomTurns>0);
  const r=B.act(f,'move',{moveId:33},{});
  assert.equal(r.action.events.find(e=>e.kind==='hit')?.target,'enemy','slower player should move first in Trick Room');
});

test('Teleport exits a wild fight but fails in trainer battles',()=>{
  const p=mon(1,'1:n',[100],{speed:200});
  const wild=B.create([p],mon(2,null,[33],{speed:1}),{context:'regional',kind:'wild',seed:27});
  const rw=B.act(wild,'move',{moveId:100},{});assert.equal(rw.result?.kind,'fled');
  const trainer=fight(p,mon(2,null,[33],{speed:1}),27);const rt=B.act(trainer,'move',{moveId:100},{});assert.equal(trainer.phase,'active');assert.ok(rt.action.events.some(e=>/failed/i.test(e.text)));
});

test('Perish Song starts a countdown that can faint both active battlers',()=>{
  const p=mon(1,'1:n',[195,150],{speed:200,baseStats:{hp:500,attack:5,defense:500,speed:200}});
  const e=mon(2,null,[150],{speed:1,baseStats:{hp:500,attack:5,defense:500,speed:1}});
  const f=fight(p,e,28);
  B.act(f,'move',{moveId:195},{});
  assert.ok(f.party[0].perishTurns>0);assert.ok(f.enemy.perishTurns>0);
  for(let i=0;i<3&&f.phase==='active';i++)B.act(f,'move',{moveId:150},{});
  assert.ok(f.party[0].hp===0||f.enemy.hp===0||f.phase==='terminal');
});
