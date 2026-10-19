'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corePath=path.join(__dirname,'../app/src/main/assets/arcade-delibird-delivery-core.js');
const core=fs.existsSync(corePath)?require(corePath):null;

function coreReady(){assert.ok(core,'Delibird Delivery core must exist');}
function sequence(values){let i=0;return()=>values[i++%values.length];}

test('original gift table and five-present carrying limit are preserved',()=>{
  coreReady();
  assert.deepEqual(core.GIFTS.map(g=>[g.key,g.points]),[
    ['candy',20],['stocking',50],['gameBoy',100],['n64',250],['snorlax',350],['piano',600],['ring',1000]
  ]);
  assert.equal(core.CONFIG.maxCarry,5);
  assert.equal(core.CONFIG.durationMs,60000);
});

test('collecting stops at five and heavier/full sacks reduce movement speed',()=>{
  coreReady();
  const game=core.createGame({difficulty:'normal',rng:sequence([.1,.2,.3,.4,.5]),nowMs:0});
  const p=game.player;
  const ring=core.GIFTS.find(g=>g.key==='ring');
  for(let i=0;i<5;i++)assert.equal(core.collectGift(p,{...ring,id:`r${i}`}).accepted,true);
  assert.equal(p.carried.length,5);
  assert.equal(core.collectGift(p,{...ring,id:'extra'}).accepted,false);
  assert.ok(core.speedForPlayer(p)<core.speedForPlayer({...p,carried:[]}));
});

test('banking scores carried gifts and rewards repeated matching presents',()=>{
  coreReady();
  const game=core.createGame({difficulty:'normal',rng:sequence([.2,.4,.6,.8]),nowMs:0});
  const p=game.player;
  const candy=core.GIFTS.find(g=>g.key==='candy');
  core.collectGift(p,{...candy,id:'a'});
  core.collectGift(p,{...candy,id:'b'});
  core.collectGift(p,{...candy,id:'c'});
  const out=core.bankCarried(p);
  assert.equal(p.carried.length,0);
  assert.equal(out.basePoints,60);
  assert.ok(out.comboBonus>0);
  assert.equal(p.score,out.totalPoints);
  assert.ok(p.bestMatchChain>=3);
});

test('Swinub collision drops the entire unbanked sack but preserves delivered score',()=>{
  coreReady();
  const game=core.createGame({difficulty:'normal',rng:sequence([.3,.5,.7,.9]),nowMs:0});
  const p=game.player;
  const gift=core.GIFTS[2];
  p.score=500;
  core.collectGift(p,{...gift,id:'a'});
  core.collectGift(p,{...gift,id:'b'});
  const out=core.hitSwinub(p,1000);
  assert.equal(out.dropped,2);
  assert.equal(p.carried.length,0);
  assert.equal(p.score,500);
});

test('countdown does not consume the 60-second game timer',()=>{
  coreReady();
  assert.deepEqual(core.countdownState(0),{label:'3',done:false});
  assert.deepEqual(core.countdownState(1000),{label:'2',done:false});
  assert.deepEqual(core.countdownState(2000),{label:'1',done:false});
  assert.equal(core.countdownState(3000).done,true);
  const game=core.createGame({difficulty:'normal',rng:sequence([.1,.5,.9]),nowMs:1234});
  core.startGame(game,9000);
  assert.equal(game.startedAt,9000);
  assert.equal(game.endsAt,69000);
});

test('CPU players share the same gift pool and Swinub hazards instead of fake score timers',()=>{
  coreReady();
  const game=core.createGame({difficulty:'normal',rng:sequence([.13,.27,.41,.55,.69,.83,.97]),nowMs:0});
  assert.equal(game.players.length,4);
  assert.ok(game.gifts.length>0);
  assert.ok(game.swinub.length>0);
  const before=game.players.slice(1).map(p=>p.score);
  core.startGame(game,0);
  core.advanceGame(game,10000,sequence([.15,.35,.55,.75,.95]));
  assert.ok(game.players.slice(1).some((p,i)=>p.score!==before[i]||p.carried.length>0),'CPU should interact with real gifts/banking');
});
