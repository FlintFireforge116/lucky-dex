'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.join(__dirname,'../app/src/main/assets/arcade-rare-rewards.js'));

function state(){return {profile:{coins:0,dust:0,tickets:0},arcade:{}};}

test('rare reward attempt is created once and reused until explicitly completed',()=>{
  const s=state();let rolls=0;
  const first=core.getOrCreateAttempt(s,'tilePuzzle',()=>({kind:'normal',sceneId:`scene-${++rolls}`}),{now:100,id:'attempt-1'});
  const second=core.getOrCreateAttempt(s,'tilePuzzle',()=>({kind:'card',sceneId:`scene-${++rolls}`}),{now:200,id:'attempt-2'});
  assert.equal(first.id,'attempt-1');
  assert.equal(second.id,'attempt-1');
  assert.equal(second.sceneId,'scene-1');
  assert.equal(rolls,1,'re-entry must not reroll the attempt');
});

test('patchAttempt persists reveal/resolution changes only for matching attempt id',()=>{
  const s=state();const a=core.getOrCreateAttempt(s,'tilePuzzle',()=>({kind:'normal'}),{id:'a'});
  assert.equal(core.patchAttempt(s,'tilePuzzle','wrong',{revealed:true}),null);
  const updated=core.patchAttempt(s,'tilePuzzle',a.id,{revealed:true,reward:{type:'profile',dust:25}});
  assert.equal(updated.revealed,true);assert.equal(updated.reward.dust,25);
});

test('claimAttempt grants exactly once and clears the live attempt after success',async()=>{
  const s=state(),a=core.getOrCreateAttempt(s,'tilePuzzle',()=>({kind:'gift',reward:{type:'profile',tickets:1,label:'Present'}}),{id:'gift-1'});
  let grants=0;
  const grant=async reward=>{grants++;s.profile.tickets+=reward.tickets||0;return {ok:true,label:'Pack Ticket'};};
  const first=await core.claimAttempt(s,'tilePuzzle',a.id,grant);
  const second=await core.claimAttempt(s,'tilePuzzle',a.id,grant);
  assert.equal(first.claimed,true);assert.equal(first.duplicate,false);
  assert.equal(second.claimed,true);assert.equal(second.duplicate,true);
  assert.equal(grants,1);assert.equal(s.profile.tickets,1);
  assert.equal(core.currentAttempt(s,'tilePuzzle'),null);
});

test('failed grant leaves attempt active and unclaimed for a safe retry',async()=>{
  const s=state(),a=core.getOrCreateAttempt(s,'tilePuzzle',()=>({kind:'pack',reward:{type:'pack'}}),{id:'pack-1'});
  await assert.rejects(core.claimAttempt(s,'tilePuzzle',a.id,async()=>{throw new Error('offline');}),/offline/);
  assert.equal(core.currentAttempt(s,'tilePuzzle').id,'pack-1');
  assert.equal(core.wasClaimed(s,'pack-1'),false);
});
