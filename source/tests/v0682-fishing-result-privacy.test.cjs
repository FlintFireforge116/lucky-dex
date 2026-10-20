'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'arcade-fishing.js'),'utf8');
const css=fs.readFileSync(path.join(root,'arcade-fishing.css'),'utf8');

test('hooked Pokemon stay anonymous until the result modal',()=>{
  assert.match(html,/id="fishingFishTarget"[^>]*aria-label="Unknown hooked catch"/);
  assert.match(js,/fishing-target-hidden/);
  assert.doesNotMatch(js,/catchItem\.name[^\n]*on the line/,'pre-catch status must not interpolate the Pokemon name');
  assert.match(js,/Something is on the line/);
});

test('caught result is an input-blocking popup with delayed controls and no instant close X',()=>{
  assert.match(html,/id="fishingResultOverlay"[^>]*hidden/);
  assert.match(html,/id="fishingResultActions"[^>]*hidden/);
  assert.match(html,/id="fishingResultContinueBtn"/);
  assert.doesNotMatch(html,/fishingResultClose/);
  assert.match(js,/resultOpen/);
  assert.match(js,/RESULT_UNLOCK_MS/);
  assert.match(css,/\.fishing-result-overlay\{[^}]*position:fixed/);
});

test('Fishing wallet shows Lucky Coins and separate Fishing Tokens away from the global help button',()=>{
  assert.match(html,/id="fishingWalletStrip"/);
  assert.match(html,/id="fishingLuckyCoins"/);
  assert.match(html,/id="fishingTokens"/);
  assert.match(css,/\.fishing-wallet-strip\{/);
  assert.doesNotMatch(html,/class="fishing-wallet" id="fishingWallet"/,'currency should not occupy the top-right header slot under the help button');
});
