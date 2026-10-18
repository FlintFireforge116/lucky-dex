'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const B=require('../app/src/main/assets/adventure/adventure-battle.js');
const D=require('../app/src/main/assets/adventure/adventure-move-data.js');
const mon=(key,speed,moves=[33])=>({id:19,key,name:key,level:12,types:['normal'],moves,baseStats:{hp:60,attack:60,defense:60,speed},maxHp:500,hp:500});
const fight=(speed=40,enemySpeed=80,moves=[33],enemyMoves=[33],seed=31)=>B.create([mon('player',speed,moves),mon('reserve',50)],mon('enemy',enemySpeed,enemyMoves),{context:'regional',kind:'trainer',seed});
const hits=result=>result.action.events.filter(e=>e.kind==='hit'&&e.source!=='status');

test('a faster enemy moves before the player at equal priority',()=>{
  const f=fight();const r=B.act(f,'move',{moveId:33},{});assert.equal(hits(r)[0].source,'enemy');assert.equal(hits(r)[1].source,'player');
});
test('move priority outranks speed for player and enemy',()=>{
  assert.equal(hits(B.act(fight(10,180,[98]),'move',{moveId:98},{}))[0].source,'player');
  assert.equal(hits(B.act(fight(180,10,[33],[98]),'move',{moveId:33},{}))[0].source,'enemy');
});
test('speed ties use the persisted seed and can put either side first',()=>{
  const firsts=new Set();for(let seed=1;seed<=40;seed++) {const f=fight(60,60,[33],[33],'battle-'+seed),copy=JSON.parse(JSON.stringify(f));const a=B.act(f,'move',{moveId:33},{});assert.deepEqual(a,B.act(copy,'move',{moveId:33},{}));firsts.add(hits(a)[0].source);}assert.deepEqual([...firsts].sort(),['enemy','player']);
});
test('a defeated queued attacker does not transfer its chosen move to the next partner',()=>{
  const f=fight();f.party[0].hp=1;const pp=f.party[0].pp[33],reservePP=f.party[1].pp[33];const r=B.act(f,'move',{moveId:33},{});assert.equal(hits(r).length,1);assert.equal(f.leadKey,'reserve');assert.equal(f.party[0].pp[33],pp);assert.equal(f.party[1].pp[33],reservePP);assert.match(r.action.events.map(e=>e.text).join(' '),/fainted/i);
});
test('a knocked out enemy sends its replacement without giving it a queued attack',()=>{
  const f=fight(180,10,[98]);f.enemyTeam.push(mon('next',200));f.enemy.hp=1;const r=B.act(f,'move',{moveId:98},{});assert.equal(f.enemyIndex,1);assert.equal(f.enemy.name,'next');assert.equal(hits(r).length,1);assert.equal(f.party[0].hp,500);
});
test('trainer and elite leave attempts do not mutate a battle',()=>{
  for(const kind of ['trainer','elite']) {const f=fight();f.kind=kind;const before=JSON.parse(JSON.stringify(f));assert.equal(B.act(f,'flee',{},{}).applied,false);assert.deepEqual(f,before);}
});
test('wild leave ends encounter without consuming supplies or an enemy turn',()=>{
  const f=fight();f.kind='wild';const inv={pokeball:2};const hp=f.party[0].hp;assert.equal(B.act(f,'flee',{},inv).result.kind,'fled');assert.equal(f.turns,0);assert.equal(f.party[0].hp,hp);assert.deepEqual(inv,{pokeball:2});
});
test('rare wild encounters retain a visible leave command and can flee',()=>{
  const f=fight();f.kind='rare';const inv={pokeball:2},hp=f.party[0].hp;
  assert.match(B.markup(f,{}),/data-adv-battle="flee"/);
  assert.equal(B.act(f,'flee',{},inv).result?.kind,'fled');assert.equal(f.turns,0);assert.equal(f.party[0].hp,hp);assert.deepEqual(inv,{pokeball:2});
});
test('capture berries are rejected against trainers without consuming them',()=>{
  const f=fight(),before=JSON.parse(JSON.stringify(f)),inv={berry:2};assert.equal(B.act(f,'berry',{},inv).applied,false);assert.deepEqual(f,before);assert.equal(inv.berry,2);
});
test('sleep prevents a move without spending its PP',()=>{
  const f=fight(180,10);f.party[0].status='sleep';f.party[0].statusTurns=2;const pp=f.party[0].pp[33];B.act(f,'move',{moveId:33},{});assert.equal(f.party[0].pp[33],pp);
});
test('enemy can use a healing move from an otherwise non-damaging set',()=>{
  const f=fight(10,180,[33],[105]);f.enemy.hp=50;const r=B.act(f,'move',{moveId:33},{});assert.ok(r.action.events.some(e=>e.kind==='heal'&&e.target==='enemy'));assert.equal(f.enemy.pp[105],4);
});
test('enemy healing budget is retained when sleep prevents its move',()=>{
  const f=fight(10,180,[33],[105]);f.enemy.hp=50;f.enemy.status='sleep';f.enemy.statusTurns=1;B.act(f,'move',{moveId:33},{});assert.equal(f.enemy.pp[105],5);assert.ok(!f.flags.healUsed);const r=B.act(f,'move',{moveId:33},{});assert.ok(r.action.events.some(e=>e.kind==='heal'&&e.target==='enemy'));
});
test('confusion status moves now produce explicit implemented feedback',()=>{
  const f=fight(180,10,[109]);const r=B.act(f,'move',{moveId:109},{});assert.match(r.action.events.map(e=>e.text).join(' '),/confused/i);assert.ok(f.enemy.confusionTurns>0);assert.equal(f.enemy.status,null);
});
test('an accuracy miss spends PP and gives readable feedback',()=>{
  let missed=false;for(let i=0;i<30&&!missed;i++){const f=fight(180,10,[95],[33],'miss-'+i),pp=f.party[0].pp[95],r=B.act(f,'move',{moveId:95},{});if(r.action.events.some(e=>e.kind==='miss'&&/missed/.test(e.text))){missed=true;assert.equal(f.party[0].pp[95],pp-1);assert.equal(f.enemy.status,null);}}assert.ok(missed);
});
test('STAB and immunity affect actual damage and immunity feedback',()=>{
  const a=fight(180,10),b=fight(180,10);a.party[0].types=['normal'];b.party[0].types=['grass'];assert.ok(B.act(a,'move',{moveId:33},{}).action.damage>B.act(b,'move',{moveId:33},{}).action.damage);
  const f=fight(180,10);f.enemy.types=['ghost'];const r=B.act(f,'move',{moveId:33},{});assert.equal(r.action.damage,0);assert.match(r.action.events[0].text,/no effect/i);
});
test('status immunity and inflicted status use readable battle feedback',()=>{
  const f=fight(180,10,[86]);f.enemy.types=['electric'];const immune=B.act(f,'move',{moveId:86},{});assert.equal(f.enemy.status,null);assert.match(immune.action.events.map(e=>e.text).join(' '),/immune/i);
  const g=fight(180,10,[86]),status=B.act(g,'move',{moveId:86},{});assert.equal(g.enemy.status,'paralysis');assert.match(status.action.events.map(e=>e.text).join(' '),/paralyzed/i);
});
test('Normal damage is resisted by Rock and Steel',()=>{
  assert.equal(B.effectiveness('normal',['rock']),.5);assert.equal(B.effectiveness('normal',['steel']),.5);
});
test('battle menus group moves under Fight and remove forbidden trainer actions',()=>{
  const f=fight(),html=B.markup(f);assert.match(html,/data-adv-command="battle-fight"/);assert.match(html,/data-battle-drawer="fight" hidden/);assert.match(html,/>POKÉMON</);assert.doesNotMatch(html,/data-adv-battle="flee"|data-adv-battle="ball"|data-adv-battle="berry"/);assert.match(html,/1 \/ 1 Pokémon remaining/);assert.doesNotMatch(html,/PWR |\bno-op\b|\bdebuff\b/);
  f.kind='wild';assert.match(B.markup(f),/data-adv-battle="flee"/);assert.match(B.markup(f),/>LEAVE</);
});
test('enemy team remaining count follows knockout and final victory',()=>{
  const f=fight(180,10,[98]);f.enemyTeam.push(mon('next',10));f.enemy.hp=1;B.act(f,'move',{moveId:98},{});assert.match(B.markup(f),/1 \/ 2 Pokémon remaining/);f.enemy.hp=1;B.act(f,'move',{moveId:98},{});assert.match(B.markup(f),/0 \/ 2 Pokémon remaining/);
});
test('generated priority retains the pinned CSV values for every move',()=>{
  const fs=require('node:fs'),path=require('node:path');const lines=fs.readFileSync(path.resolve(__dirname,'../data/adventure-moves/moves.csv'),'utf8').trim().split(/\r?\n/);const header=lines.shift().split(','),idIndex=header.indexOf('id'),priorityIndex=header.indexOf('priority');const priorities=new Map(lines.map(line=>{const cells=line.split(',');return [+cells[idIndex],+cells[priorityIndex]]}));for(const m of Object.values(D.moves))assert.equal(m.priority,priorities.get(m.id),m.name);
});
