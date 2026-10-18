'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const session=require('../app/src/main/assets/arcade-session.js');

test('arcade results can present generic reward reveals before the normal summary',()=>{
  const model=session.resultModel({rewardReveals:[{kicker:'GOLDEN BERRY REWARD',name:'80 Card Dust',visual:'✦',meta:'SPECIAL DELIVERY'}]});
  assert.equal(model.rewardReveals.length,1);
  assert.equal(model.rewardReveals[0].kicker,'GOLDEN BERRY REWARD');
  assert.equal(model.rewardReveals[0].visual,'✦');
  assert.equal(model.rewardReveals[0].name,'80 Card Dust');
});

test('legacy card reveals are still adapted into generic reveal cards',()=>{
  const model=session.resultModel({cardReveals:[{name:'Pikachu',image:'p.png',setName:'Base',rarity:'Rare'}]});
  assert.equal(model.cardReveals.length,1);
  assert.equal(model.rewardReveals.length,1);
  assert.equal(model.rewardReveals[0].kicker,'CARD WON');
  assert.equal(model.rewardReveals[0].name,'Pikachu');
});
