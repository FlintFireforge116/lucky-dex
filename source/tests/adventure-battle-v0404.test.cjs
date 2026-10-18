'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const B=require('../app/src/main/assets/adventure/adventure-battle.js');
const V=require('../app/src/main/assets/adventure/adventure-move-view.js');

const mon=(id,key,moves,stats={hp:100,attack:70,defense:100,speed:80})=>({id,key,name:'Mon '+id,types:['normal'],level:12,moves,baseStats:stats,xp:37});

test('Fury Swipes resolves its 2-5 hits but spends PP only once',()=>{
  const player=mon(1,'1:n',[154],{hp:100,attack:25,defense:100,speed:200});
  const foe=mon(2,undefined,[33],{hp:250,attack:10,defense:220,speed:1});
  const f=B.create([player],foe,{context:'regional',kind:'trainer',seed:22});
  const before=f.party[0].pp[154];
  const r=B.act(f,'move',{moveId:154},{});
  const hits=r.action.events.filter(e=>e.kind==='hit'&&e.target==='enemy');
  assert.ok(hits.length>=2&&hits.length<=5,`expected 2-5 hits, got ${hits.length}`);
  assert.equal(f.party[0].pp[154],before-1);
  assert.ok(r.action.events.some(e=>e.kind==='modifier'&&/hit \d+ times/i.test(e.text)));
});

test('Yawn marks the target then puts it to sleep at the end of the following turn',()=>{
  const player=mon(1,'1:n',[281,33],{hp:160,attack:20,defense:200,speed:200});
  const foe=mon(2,undefined,[33],{hp:220,attack:5,defense:200,speed:1});
  const f=B.create([player],foe,{context:'regional',kind:'trainer',seed:4});
  let r=B.act(f,'move',{moveId:281},{});
  assert.equal(f.enemy.status,null);
  assert.equal(f.enemy.yawnTurns,1);
  assert.ok(r.action.events.some(e=>/grew drowsy/i.test(e.text)));
  r=B.act(f,'move',{moveId:33},{});
  assert.equal(f.enemy.yawnTurns,0);
  assert.equal(f.enemy.status,'sleep');
  assert.ok(r.action.events.some(e=>/fell asleep/i.test(e.text)));
});

test('battle player HUD exposes visible numeric EXP and an EXP progress bar',()=>{
  const f=B.create([mon(1,'1:n',[33])],mon(2,undefined,[33]),{context:'regional',seed:1});
  const html=B.markup(f,{pokemon:id=>`${id}.png`,destinations:{meadow:{battle:'battle.png'}}});
  assert.match(html,/data-xp-track/);
  assert.match(html,/data-xp-fill/);
  assert.match(html,/37\s*\/\s*440\s*EXP/);
});

test('compact move choices show both Power and PP for comparison screens',()=>{
  const html=V.compact(33);
  assert.match(html,/Power\s+40/i);
  assert.match(html,/PP\s+35/i);
});

test('regional and Wild Hunt battle drawers persist the selected menu across rerenders until closed',()=>{
  const regional=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/adventure/adventure-regional-ui.js'),'utf8');
  const wild=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/adventure/adventure-wild-hunt.js'),'utf8');
  for(const src of [regional,wild]){
    assert.match(src,/lastBattleDrawer/);
    assert.match(src,/lastBattleDrawer\s*=\s*target/);
    assert.match(src,/if\(lastBattleDrawer/);
    assert.match(src,/drawer\(lastBattleDrawer\)/);
    assert.match(src,/lastBattleDrawer\s*=\s*null/);
  }
});
