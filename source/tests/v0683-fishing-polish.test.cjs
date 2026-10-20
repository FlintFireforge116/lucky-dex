'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../app/src/main/assets/arcade-fishing-core.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
const ASSETS=path.join(__dirname,'..','app','src','main','assets');
const css=fs.readFileSync(path.join(ASSETS,'arcade-fishing.css'),'utf8');
const js=fs.readFileSync(path.join(ASSETS,'arcade-fishing.js'),'utf8');
const helpJs=fs.readFileSync(path.join(ASSETS,'arcade-help.js'),'utf8');
const helpCss=fs.readFileSync(path.join(ASSETS,'arcade-help.css'),'utf8');

test('common Pokemon pay low single-digit Fishing Tokens and tackle prices match the separate economy',()=>{
  for(const id of [129,72,393]){
    const c=C.createCatch({species:S.byId[id],rolls:{size:.5},rod:'old'});
    const payout=C.catchPayout(c);
    assert(payout.fishingTokens>=1&&payout.fishingTokens<=5,`${c.name} should pay low single-digit tokens, got ${payout.fishingTokens}`);
    assert(payout.luckyCoins>=1&&payout.luckyCoins<=3,`${c.name} Lucky Coin bonus should stay small`);
  }
  assert(C.RODS.good.price>=60&&C.RODS.good.price<=200,'Good Rod should be reachable through the lower-token economy');
  assert(C.RODS.super.price>C.RODS.good.price&&C.RODS.deep.price>C.RODS.super.price);
  assert(C.BAIT.basic.price<=20,'basic bait should be affordable in the lower-token economy');
});

test('escape uses the blocking result popup and successful results no longer delay KEEP FISHING',()=>{
  assert.match(js,/showEscapeModal|showOutcomeModal/,'escape should have an explicit popup path');
  assert.doesNotMatch(js,/RESULT_UNLOCK_MS/,'KEEP FISHING should not use the old delayed unlock');
  assert.doesNotMatch(js,/resultUnlockTimer/,'result action should no longer be timer-gated');
});

test('hidden hooked Pokemon is represented as a fish silhouette instead of a question mark',()=>{
  assert.match(css,/\.fishing-target-hidden:(before|after)\{/,'hidden target should draw a fish shape in CSS');
  assert.doesNotMatch(js,/fish\.textContent='\?'/,'runtime should not render a question-mark target');
});

test('phone play mode reserves one screen for fishing and keeps wallet compact',()=>{
  assert.match(css,/\.fishing-game\.is-fishing-play\{[^}]*overflow-y:\s*hidden/,'active play mode should not scroll vertically');
  assert.match(css,/\.fishing-game\.is-fishing-play\s+\.fishing-play-view\{[^}]*min-height:\s*0/,'play view must be allowed to shrink into the available viewport');
  assert.doesNotMatch(css,/@media\(max-width:420px\)\{[^}]*\.fishing-wallet-strip\{grid-template-columns:1fr\}/,'mobile wallet must remain a compact row');
});

test('shared Arcade help button mounts into game chrome instead of floating over gameplay',()=>{
  assert.match(helpJs,/arcade-full-head/,'help system should look for shared Arcade header chrome');
  assert.match(helpJs,/arcade-help-fallback-slot/,'older games should receive a reserved fallback slot');
  assert.match(helpCss,/\.arcade-game-help-button\{[^}]*position:\s*static/,'help button should participate in layout, not float fixed over games');
  assert.doesNotMatch(helpCss,/\.arcade-game-help-button\{[^}]*position:\s*fixed/);
});
