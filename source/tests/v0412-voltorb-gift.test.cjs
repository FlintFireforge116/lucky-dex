const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

function loadCore(){
  const p=path.join(ROOT,'app/src/main/assets/arcade-voltorb-gift-core.js');
  delete require.cache[require.resolve(p)];
  return require(p);
}

test('Voltorb mini-gift core defaults to 2 percent and only hides gifts on safe tiles',()=>{
  const core=loadCore();
  assert.equal(core.GIFT_RATE,0.02);
  const tiles=[0,1,2,3,0,1];
  assert.equal(core.createGift({tiles,rate:0,random:()=>0}),null);
  const seq=[0,0.99,0.1]; let i=0;
  const gift=core.createGift({tiles,rate:1,random:()=>seq[i++]});
  assert.ok(gift);
  assert.notEqual(tiles[gift.tileIndex],0,'gift must not be placed on a Voltorb');
  assert.equal(gift.revealed,false);
});

test('Voltorb mini-gift reward table includes coins dust voucher card and sealed pack',()=>{
  const core=loadCore();
  const kinds=[0.05,0.45,0.68,0.82,0.98].map(v=>core.rewardForRoll(v).kind);
  assert.deepEqual(kinds,['coins','dust','ticket','card','pack']);
});

test('Voltorb gift is revealed only when its safe tile is flipped',()=>{
  const core=loadCore();
  const board={gift:{tileIndex:2,revealed:false}};
  assert.equal(core.revealGift(board,1),false);
  assert.equal(board.gift.revealed,false);
  assert.equal(core.revealGift(board,2),true);
  assert.equal(board.gift.revealed,true);
  assert.equal(core.revealGift(board,2),false,'cannot rediscover the same gift');
});

test('Settings expose configurable Voltorb Gift odds at vanilla 2 percent',()=>{
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(html,/Voltorb Gift[\s\S]{0,500}id="rareVoltorbGiftOddsSelect"[\s\S]{0,300}value="0\.02"[^>]*>Vanilla · 2%/i);
  assert.match(app,/rareOdds:\{[^}]*voltorbGift:\.02/s);
  assert.match(app,/rareVoltorbGiftOddsSelect:'voltorbGift'/);
});

test('Voltorb runtime persists the board attempt, uses shared claim-once rewards, and reveals the prize before review',()=>{
  const js=read('app/src/main/assets/arcade-classics.js');
  assert.match(js,/getOrCreateAttempt\([^\n]*['"]voltorbGift['"]/);
  assert.match(js,/patchAttempt\([^\n]*['"]voltorbGift['"]/);
  assert.match(js,/claimAttempt\([^\n]*['"]voltorbGift['"]/);
  assert.match(js,/rewardReveal/);
  assert.match(js,/rewardReveals/);
  assert.match(js,/mystery-gift\.svg/);
});

test('Voltorb revealed gift uses a transparent overlay and does not replace the tile value',()=>{
  const js=read('app/src/main/assets/arcade-classics.js');
  const css=read('app/src/main/assets/arcade.css');
  assert.match(js,/vf-mini-gift/);
  assert.match(js,/mystery-gift\.svg/);
  assert.match(css,/\.vf-mini-gift\{[^}]*background\s*:\s*none/i);
  assert.match(css,/\.vf-mini-gift\{[^}]*box-shadow\s*:\s*none/i);
});
