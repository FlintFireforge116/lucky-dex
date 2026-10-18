'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const modulePath='../app/src/main/assets/adventure/adventure-battle.js';
const B=fs.existsSync(require('node:path').resolve(__dirname,modulePath))?require(modulePath):{};
const copy=x=>JSON.parse(JSON.stringify(x));
const mon=(id,key,types=['normal'],level=12)=>({id,key,name:'Pokemon '+id,types,level,baseStats:{hp:60,attack:60,defense:60,speed:60}});
const party=()=>[mon(25,'25:n',['electric']),mon(7,'7:n',['water'])];
const create=(opts={},enemy=mon(19,undefined))=>B.create(party(),enemy,{context:'expedition',destination:'meadow',seed:32,...opts});
test('battle exposes one offline reducer and scoped renderer',()=>{
  for(const name of ['create','act','markup','update','animate']) assert.equal(typeof B[name],'function');
});
test('combat stat formulas and expedition HP persist while roam starts full',()=>{
  const p=party();p[0].hp=3;p[0].custom={keep:1};
  const f=B.create(p,mon(19),{context:'expedition',seed:8});
  assert.deepEqual(f.party[0].stats,{hp:99,attack:50,defense:49,spAttack:47,spDefense:46,speed:38});
  assert.equal(f.party[0].hp,3);assert.deepEqual(f.party[0].custom,{keep:1});
  assert.equal(B.create(p,mon(19),{context:'roam'}).party[0].hp,99);
  assert.equal(p[0].hp,3);
});
test('actions replay identically across serialization without dropping unknown fields',()=>{
  const f=create({perks:['quickClaw','potionBelt']});f.custom={persist:true};
  B.act(f,'quick',{},{});
  const restored=copy(f), inventory={berry:2,potion:2,pokeball:2,greatball:1,ultraball:1}, other=copy(inventory);
  for(const [cmd,args] of [['berry',{}],['switch',{key:'7:n'}],['potion',{}],['type',{}],['ball',{key:'pokeball'}]]) {
    assert.deepEqual(B.act(f,cmd,args,inventory),B.act(restored,cmd,args,other));
    assert.deepEqual(f,restored);assert.deepEqual(inventory,other);
  }
  assert.deepEqual(f.custom,{persist:true});
});
test('invalid commands and unavailable items never consume RNG or inventory',()=>{
  const f=create(), inv={potion:1,pokeball:0,berry:0}, before=copy(f);
  for(const [cmd,args] of [['bad',{}],['ball',{key:'bad'}],['ball',{key:'pokeball'}],['berry',{}],['potion',{}],['switch',{key:'25:n'}],['switch',{key:'absent'}]]) {
    assert.equal(B.act(f,cmd,args,inv).applied,false);assert.deepEqual(f,before);
  }
  assert.deepEqual(inv,{potion:1,pokeball:0,berry:0});
});
test('berry is a free action, capped and strengthened by satchel',()=>{
  const f=create({perks:['berrySatchel']}), inv={berry:9};
  for(let i=0;i<5;i++) assert.equal(B.act(f,'berry',{},inv).applied,true);
  assert.equal(f.berryBoost,2.2);assert.equal(f.turns,0);assert.equal(inv.berry,4);assert.equal(f.party[0].hp,f.party[0].maxHp);
});
test('potion and switch consume an opponent turn, belt modifies healing',()=>{
  const f=create({perks:['potionBelt']});f.party[0].hp=10;
  const inv={potion:1}, a=B.act(f,'potion',{},inv);
  assert.equal(inv.potion,0);assert.equal(a.action.events[0].heal,44);assert.equal(f.turns,1);
  const hp=f.party[1].hp;B.act(f,'switch',{key:'7:n'},inv);
  assert.equal(f.leadKey,'7:n');assert.ok(f.party[1].hp<hp);assert.equal(f.turns,2);
});
test('trainer and elite reject balls without consumption; boss remains catchable',()=>{
  for(const kind of ['trainer','elite']) {
    const f=create({kind}), inv={pokeball:3}, before=copy(f);
    assert.equal(B.act(f,'ball',{key:'pokeball'},inv).applied,false);assert.deepEqual(f,before);assert.equal(inv.pokeball,3);
  }
  assert.equal(B.act(create({kind:'boss',bossId:127}),'ball',{key:'pokeball'},{pokeball:1}).applied,true);
});
test('rare, legendary and mythical modifiers use persisted metadata',()=>{
  for(const [patch,modifier] of [[{tier:'normal'},1],[{tier:'rare'},.72],[{tier:'legendary',legendary:true},.28],[{tier:'legendary',legendary:true,mythical:true},.28*.75]]) {
    const f=create({}, {...mon(19),...patch}), inv={pokeball:1};f.enemy.hp=f.enemy.maxHp/2;
    const a=B.act(f,'ball',{key:'pokeball'},inv);
    assert.ok(Math.abs(a.action.captureChance-Math.max(.025,.43*modifier))<1e-9);
    assert.equal(inv.pokeball,0);
    if(!a.action.captureSuccess) {assert.equal(f.berryBoost,1);assert.equal(f.turns,1);}
  }
});
test('legendary and mythical species IDs retain baseline catch modifiers without optional booleans',()=>{
  const f=create({}, {...mon(151),tier:'normal'});f.enemy.hp=f.enemy.maxHp/2;
  const a=B.act(f,'ball',{key:'pokeball'},{pokeball:1});
  assert.ok(Math.abs(a.action.captureChance-.43*.28*.75)<1e-9);
});
test('quick claw boosts only the first attack and Charizard field boosts either side',()=>{
  const ordinary=create(), claw=create({perks:['quickClaw']});
  const first=B.act(ordinary,'quick',{},{}), boosted=B.act(claw,'quick',{},{});
  assert.ok(boosted.action.damage>first.action.damage);
  assert.equal(B.act(ordinary,'quick',{},{}).action.damage,B.act(claw,'quick',{},{}).action.damage);
  const p=[mon(4,'4:n',['fire'])], foe=mon(6,undefined,['fire']);
  const plain=B.create(p,foe,{seed:45,kind:'boss',bossId:999}), blaze=B.create(p,foe,{seed:45,kind:'boss',bossId:6});
  const a=B.act(plain,'type',{},{}),b=B.act(blaze,'type',{},{});
  assert.ok(b.action.damage>a.action.damage);
  assert.ok(b.action.events.find(e=>e.target==='player').damage>a.action.events.find(e=>e.target==='player').damage);
});
test('capture commits once, terminal commands cannot reroll or consume another ball',()=>{
  let f,a;
  for(let seed=1;seed<1000;seed++) {
    f=create({seed});f.enemy.hp=1;f.berryBoost=2;
    a=B.act(f,'ball',{key:'ultraball'},{ultraball:1});if(a.result?.kind==='capture') break;
  }
  assert.equal(a.result.kind,'capture');assert.equal(f.phase,'terminal');
  const loaded=copy(f), inv={ultraball:8}, before=copy(loaded);
  assert.equal(B.act(loaded,'ball',{key:'ultraball'},inv).applied,false);
  assert.deepEqual(loaded,before);assert.equal(inv.ultraball,8);
});
test('faint selects the next living member, party wipe loses, victory never retaliates',()=>{
  const f=create();f.party[0].hp=1;B.act(f,'switch',{key:'7:n'},{});f.party[1].hp=1;
  const hit=B.act(f,'quick',{},{});assert.equal(f.leadKey,'25:n');assert.equal(hit.result,null);
  assert.equal(hit.action.beforeLead.key,'7:n');assert.equal(hit.action.beforeLead.hp,1);
  f.party[0].hp=1;assert.equal(B.act(f,'quick',{},{}).result.kind,'loss');
  const v=create();v.enemy.hp=1;const hp=v.party[0].hp;
  assert.equal(B.act(v,'quick',{},{}).result.kind,'victory');assert.equal(v.party[0].hp,hp);
});
test('type immunity is zero damage and flee terminates without opponent damage',()=>{
  const f=create({},mon(50,undefined,['ground']));const a=B.act(f,'type',{},{});
  assert.equal(a.action.damage,0);assert.equal(a.action.eff,0);
  const hp=f.party[0].hp;assert.equal(B.act(f,'flee',{},{}).result.kind,'fled');assert.equal(f.party[0].hp,hp);
});
test('bosses have thirty percent extra HP and readable once-only mechanics',()=>{
  const ids=[127,142,94,131,6];
  for(const bossId of ids) {
    const f=create({kind:'boss',bossId},mon(bossId));assert.equal(f.enemy.maxHp,129);assert.ok(f.bossModifier.text);
  }
  const fast=create({kind:'boss',bossId:142});let a=B.act(fast,'quick',{},{});
  assert.equal(a.action.events[0].target,'player');a=B.act(fast,'quick',{},{});assert.equal(a.action.events[0].target,'enemy');
  const veil=create({kind:'boss',bossId:94});a=B.act(veil,'quick',{},{});assert.ok(veil.flags.veilUsed);assert.ok(a.action.events.some(e=>e.kind==='modifier'));
  const tide=create({kind:'boss',bossId:131});tide.enemy.hp=45;a=B.act(tide,'quick',{},{});assert.ok(tide.flags.tideUsed);assert.ok(a.action.events.some(e=>e.heal===26));
  const rage=create({kind:'boss',bossId:127});rage.enemy.hp=50;B.act(rage,'quick',{},{});assert.ok(rage.flags.enraged);
});
test('markup uses local actors, command drawers, escaped labels and scoped assets',()=>{
  const f=create({kind:'boss',bossId:94});f.enemy.name='<script>';f.inventory={berry:2,potion:1,pokeball:4};
  const html=B.markup(f,{destinations:{meadow:{battle:'local-battle.png'}},pokemon:(id,shiny,back)=>`${back?'back':'front'}-${id}.png`});
  assert.ok(html.includes('local-battle.png'));assert.ok(html.includes('back-25.png'));assert.ok(html.includes('front-19.png'));
  assert.ok(html.includes('data-adv-battle="quick"'));assert.ok(html.includes('data-adv-command="battle-bag"'));
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('What will'));
  assert.ok(html.includes('data-back-src="back-7.png"'));
});
function animationHost() {
  const nodes=new Map();
  function node() {
    const names=new Set();return {dataset:{},offsetWidth:1,classList:{add:n=>names.add(n),remove:n=>names.delete(n),contains:n=>names.has(n)},querySelector:selector=>nodes.get(selector)};
  }
  const scene=node();scene.matches=()=>true;
  for(const selector of ['[data-battle-ball]','[data-battle-actor="enemy"]','[data-battle-actor="player"]','[data-battle-effect]','[data-battle-message]']) nodes.set(selector,node());
  return {scene,nodes};
}
test('animation cleans every transient class when root scope cancels or wait rejects',async()=>{
  const {scene,nodes}=animationHost();let active=true,waits=0;
  await B.animate(scene,{kind:'ball',ball:'pokeball',shakes:3,captureSuccess:true},{isActive:()=>active,wait:async()=>{waits++;active=false;}},false);
  assert.equal(waits,1);assert.equal(nodes.get('[data-battle-ball]').classList.contains('is-thrown'),false);
  active=true;
  await assert.rejects(B.animate(scene,{kind:'ball',ball:'pokeball',shakes:3},{isActive:()=>active,wait:async()=>{throw Error('disposed');}},false),/disposed/);
  assert.equal(nodes.get('[data-battle-ball]').classList.contains('is-thrown'),false);
});
test('reduced motion resolves synchronously without consuming root waits',async()=>{
  const {scene,nodes}=animationHost();let waits=0;
  await B.animate(scene,{kind:'ball',text:'Caught!',shakes:3},{wait:async()=>{waits++;}},true);
  assert.equal(waits,0);assert.equal(nodes.get('[data-battle-message]').textContent,'Caught!');
});
test('capture presentation finishes within 650ms using only root waits',async()=>{
  const {scene}=animationHost();let elapsed=0;
  await B.animate(scene,{kind:'ball',ball:'ultraball',shakes:3,captureSuccess:true,events:[]},{wait:async ms=>{elapsed+=ms;}},false);
  assert.ok(elapsed<=650,`capture took ${elapsed}ms`);
});
