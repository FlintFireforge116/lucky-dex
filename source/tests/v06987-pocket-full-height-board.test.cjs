'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-battle.css'),'utf8');
const ui=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-battle-ui.js'),'utf8');

test('Pocket battle gives spare viewport height to the player mat, keeping the hand row compact',()=>{
  assert.match(css,/\.tcgp-live-arena:not\(\.format-classic\)\s*\{[^}]*grid-template-rows:\s*56px\s+var\(--tcgp-mat-h\)\s+34px\s+minmax\(0,1fr\)\s+118px\s*!important/s);
  assert.match(css,/\.tcgp-live-arena:not\(\.format-classic\)>\.tcgp-live-player\.tcgp-live-mat-half\s*\{[^}]*height:\s*100%\s*!important;[^}]*max-height:\s*none\s*!important/s);
  assert.match(css,/\.tcgp-live-arena:not\(\.format-classic\)>\.tcgp-live-player-bottom\s*\{[^}]*height:\s*118px\s*!important/s);
  assert.match(css,/@media\s*\(max-width:380px\)\s*\{\s*\.tcgp-live-arena:not\(\.format-classic\)\s*\{[^}]*grid-template-rows:\s*52px\s+var\(--tcgp-mat-h\)\s+32px\s+minmax\(0,1fr\)\s+108px\s*!important/s);
});

test('Pocket taller player playmat uses proportional cropping and keeps opponent half alone',()=>{
  assert.match(css,/\.tcgp-live-arena:not\(\.format-classic\)>\.tcgp-live-player\.tcgp-live-mat-half\s*\{[^}]*background-size:\s*cover\s*!important;[^}]*background-position:\s*center bottom\s*!important/s);
  assert.match(css,/\.tcgp-live-mat-half\.tcgp-live-opponent\{background-position:center top!important\}/);
});

test('Android Pocket battlefield does not reserve the system navigation inset twice',()=>{
  assert.match(css,/html\.android-native-inset\s+body\.tcgp-battle-live\s+\.tcgp-live-arena:not\(\.format-classic\)\s*\{[^}]*padding-bottom:\s*6px\s*!important/s);
  assert.match(css,/\.tcgp-live-arena\s*\{[^}]*padding:\s*6px\s+10px\s+calc\(6px\s*\+\s*env\(safe-area-inset-bottom\)\)\s*!important/s);
});

test('Pocket and Classic still share the card-click battle layout without new UI actions',()=>{
  assert.match(ui,/tcgp-live-arena \$\{classic\?'format-classic':''\}/);
  assert.match(ui,/liveCardHtml\(p\.active,\{side:'player',zone:'active',showActions:false\}\)/);
  assert.match(css,/\.tcgp-live-player-actions\{display:none!important\}/);
});

test('Pocket full-height update increments Android and runtime release markers together',()=>{
  const gradle=fs.readFileSync(path.join(__dirname,'../app/build.gradle'),'utf8');
  const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(gradle,/versionName '0\.69\.87'/);
  assert.match(gradle,/versionCode 7067/);
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.87'/);
});
