'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/arcade-tile-puzzle-core.js');

test('tiny special roll creates card or pack events and otherwise normal puzzle',()=>{
  assert.equal(core.rollKind(0.001),'card');
  assert.equal(core.rollKind(0.006),'pack');
  assert.equal(core.rollKind(0.02),'normal');
});

test('scene picker skips previous and difficulty-excluded scenes',()=>{
  const scenes=[
    {id:'bad',excludeModes:['hard']},
    {id:'last'},
    {id:'good'}
  ];
  const picked=core.pickScene(scenes,'hard','last',()=>0);
  assert.equal(picked.id,'good');
});

test('normal attempt can contain a persisted present tile and deterministic gift',()=>{
  const rolls=[0.5,0.0,0.0,0.25,0.9];let i=0;
  const a=core.createAttempt({mode:'easy',tileCount:20,scenes:[{id:'scene'}],random:()=>rolls[i++]??0.5});
  assert.equal(a.kind,'normal');
  assert.equal(a.sceneId,'scene');
  assert.equal(a.gift.tileValue,5);
  assert.equal(a.gift.reward.type,'profile');
  assert.equal(a.gift.reward.tickets,1);
  assert.equal(a.gift.revealed,false);
});

test('present reveal follows the tile value as pieces move',()=>{
  const attempt={gift:{tileValue:2,revealed:false}};
  assert.equal(core.giftAtBoardIndex(attempt,[0,2,1],1),true);
  assert.equal(core.giftAtBoardIndex(attempt,[2,0,1],1),false);
  assert.equal(core.revealGift(attempt,[0,2,1],1),true);
  assert.equal(attempt.gift.revealed,true);
});
