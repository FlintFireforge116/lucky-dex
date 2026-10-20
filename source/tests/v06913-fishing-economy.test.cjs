'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../app/src/main/assets/arcade-fishing-core.js');
const Species=require('../app/src/main/assets/adventure/adventure-species.js').byId;

test('Fishing Pokemon Lucky Coin payout rises materially with rarity and jumbo size',()=>{
  const common=Core.createCatch({species:Species[129],rolls:{size:.5},rod:'old'});
  const rare=Core.createCatch({species:Species[147],rolls:{size:.5},rod:'super'});
  const veryRare=Core.createCatch({species:Species[131],rolls:{size:.5},rod:'super'});
  const legendary=Core.createCatch({species:Species[245],rolls:{size:.5},rod:'deep'});
  const jumbo=Core.createCatch({species:Species[129],rolls:{size:.5},rod:'old',forceJumbo:true});
  const payouts=[common,rare,veryRare,legendary].map(Core.catchPayout);
  assert.ok(payouts[0].luckyCoins>=1,'every landed common Pokemon should still pay a Lucky Coin bonus');
  assert.ok(payouts[1].luckyCoins>=payouts[0].luckyCoins*5,'rare Pokemon should be a noticeable economy step up while common payouts remain secondary to Fishing Tokens');
  assert.ok(payouts[2].luckyCoins>payouts[1].luckyCoins,'very-rare Pokemon should beat rare Pokemon');
  assert.ok(payouts[3].luckyCoins>=75,'legendary fishing catches should feel like genuinely rare wins');
  assert.ok(Core.catchPayout(jumbo).luckyCoins>Core.catchPayout(common).luckyCoins,'jumbo size should increase the external payout as well as appraisal');
});

test('Fishing junk rewards respect ordinary, Easter and ultra rarity instead of flattening to 1 coin',()=>{
  const ordinary=Core.JUNK.find(x=>x.id==='broken-lure');
  const easter=Core.JUNK.find(x=>x.id==='broken-silph-scope');
  const ultra=Core.JUNK.find(x=>x.id==='slowpoke-tail');
  const a=Core.catchPayout({kind:'junk',...ordinary});
  const b=Core.catchPayout({kind:'junk',...easter});
  const c=Core.catchPayout({kind:'junk',...ultra});
  assert.ok(b.fishingTokens>a.fishingTokens&&b.luckyCoins>a.luckyCoins,'Easter junk should outpay ordinary junk');
  assert.ok(c.fishingTokens>=75,'ultra junk should materially advance the tackle economy');
  assert.ok(c.luckyCoins>=500,'ultra junk should be worth the extreme encounter rarity');
});

test('Fishing treasure table and base payouts are ordered by prize rarity',()=>{
  const byId=Object.fromEntries(Core.TREASURE.map(x=>[x.id,x]));
  assert.ok(byId.stardust.amount>=120,'Stardust Cache should be worth at least one Pack Ticket via the 100 Dust exchange');
  assert.ok(byId['big-dust'].amount>=200);
  const order=['coin-pouch','stardust','pack-ticket','sealed-pack','big-dust','ticket-pair'];
  const payout=order.map(id=>Core.catchPayout({kind:'treasure',...byId[id]}));
  for(let i=1;i<payout.length;i++){
    assert.ok(payout[i].fishingTokens>=payout[i-1].fishingTokens,`${order[i]} Fishing Token payout should not regress below ${order[i-1]}`);
    assert.ok(payout[i].luckyCoins>=payout[i-1].luckyCoins,`${order[i]} Lucky Coin payout should not regress below ${order[i-1]}`);
  }
  assert.ok(payout.at(-1).fishingTokens>=50&&payout.at(-1).luckyCoins>=75,'rarest treasure should have a substantial base haul before its special prize');
});

test('Fishing exposes a readable treasure reward summary for the result popup and history',()=>{
  assert.equal(typeof Core.treasureRewardLabel,'function');
  const byId=Object.fromEntries(Core.TREASURE.map(x=>[x.id,x]));
  assert.match(Core.treasureRewardLabel(byId.stardust),/\+\d+ Card Dust/);
  assert.match(Core.treasureRewardLabel(byId['pack-ticket']),/\+1 Pack Ticket/);
  assert.match(Core.treasureRewardLabel(byId['ticket-pair']),/\+2 Pack Tickets/);
  assert.match(Core.treasureRewardLabel(byId['coin-pouch']),/\+\d+ Lucky Coins/);
  assert.match(Core.treasureRewardLabel(byId['sealed-pack']),/Sealed Booster/);
});

test('Fishing treasure claim returns the actual granted amount instead of repeating only the treasure name',async()=>{
  global.window=global;
  global.LuckyDexFishingCore=Core;
  global.LuckyDexRareRewardBridge={grantReward:async reward=>({label:reward.label,dust:reward.dust||0,coins:reward.coins||0,tickets:reward.tickets||0})};
  delete require.cache[require.resolve('../app/src/main/assets/arcade-fishing.js')];
  require('../app/src/main/assets/arcade-fishing.js');
  const stardust=Core.TREASURE.find(x=>x.id==='stardust');
  const summary=await global.LuckyDexFishing.claimTreasure(stardust);
  assert.match(summary,/\+125 Card Dust/);
  assert.doesNotMatch(summary,/^Stardust Cache$/);
});
