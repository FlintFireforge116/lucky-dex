const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'../app/src/main/assets');
const gift=require(path.join(base,'arcade-voltorb-gift-core.js'));

test('Lucky Wave shared reward table can roll coins dust ticket card and booster',()=>{
  assert.equal(gift.rewardForRoll(.10).kind,'coins');
  assert.equal(gift.rewardForRoll(.50).kind,'dust');
  assert.equal(gift.rewardForRoll(.70).kind,'ticket');
  assert.equal(gift.rewardForRoll(.85).kind,'card');
  assert.equal(gift.rewardForRoll(.97).kind,'pack');
});

function setup(kind='coins'){
  let saves=0,grants=0,resolve;
  const immediate={
    coins:{type:'profile',coins:300,label:'300 Lucky Coins'},
    dust:{type:'profile',dust:60,label:'60 Card Dust'},
    ticket:{type:'profile',tickets:1,label:'Pack Voucher'}
  };
  const root={
    state:{arcade:{pikachuBeach:{luckyPrizes:0}}},
    LuckyDexArcadeRareRewards:require(path.join(base,'arcade-rare-rewards.js')),
    LuckyDexVoltorbGiftCore:{rewardForRoll:()=>({kind,reward:immediate[kind]||null})},
    LuckyDexRareRewardBridge:{
      save:()=>saves++,
      resolveArcadeReward:()=>new Promise(r=>resolve=r),
      grantReward:async reward=>{grants++;return {label:reward.label};},
      rewardReveal:(reward,result,kicker)=>({name:result?.label||reward.label,kicker})
    }
  };
  const p=path.join(base,'arcade-pikachu-beach-prizes.js');
  vm.runInNewContext(fs.readFileSync(p,'utf8'),{window:root,console});
  return {root,api:root.LuckyDexPikachuBeachPrizes,counts:()=>({saves,grants}),resolve:r=>resolve?.(r)};
}

test('Lucky Wave reservation is saved before prize delivery',()=>{
  const s=setup('card'),attempt=s.api.reserve(s.root.state,()=>.5);
  assert.equal(attempt.kind,'card');
  assert.ok(s.root.state.arcade.rareRewards.attempts[attempt.key]);
  assert.equal(s.counts().grants,0);
  assert.ok(s.counts().saves>0);
});

test('profile Lucky Wave prizes claim once and increment the prize record once',async()=>{
  for(const kind of ['coins','dust','ticket']){
    const s=setup(kind),attempt=s.api.reserve(s.root.state);
    const [a,b]=await Promise.all([s.api.deliver(s.root.state,attempt),s.api.deliver(s.root.state,attempt)]);
    assert.equal(a.pending,false,kind);
    assert.equal(b.pending,false,kind);
    assert.equal(s.counts().grants,1,kind);
    assert.equal(s.root.state.arcade.pikachuBeach.luckyPrizes,1,kind);
  }
});

test('card and booster Lucky Wave prizes resolve then safely claim',async()=>{
  for(const kind of ['card','pack']){
    const s=setup(kind),attempt=s.api.reserve(s.root.state),pending=s.api.deliver(s.root.state,attempt);
    await Promise.resolve();
    s.resolve({type:kind,label:kind==='card'?'Mystery Card':'Mystery Booster'});
    const result=await pending;
    assert.equal(result.pending,false,kind);
    assert.equal(s.counts().grants,1,kind);
    assert.equal(s.root.state.arcade.pikachuBeach.luckyPrizes,1,kind);
  }
});

test('save switch during card resolution leaves Lucky Wave reward reserved and ungranted',async()=>{
  const s=setup('card'),owner=s.root.state,attempt=s.api.reserve(owner),pending=s.api.deliver(owner,attempt);
  await Promise.resolve();
  s.root.state={arcade:{}};
  s.resolve({type:'card',label:'Old save card'});
  const result=await pending;
  assert.equal(result.pending,true);
  assert.equal(s.counts().grants,0);
  assert.ok(owner.arcade.rareRewards.attempts[attempt.key]);
});
