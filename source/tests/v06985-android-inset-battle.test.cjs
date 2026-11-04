'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-battle.css'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');

test('Android native-inset Classic battle does not reserve the system navigation inset twice',()=>{
  assert.match(js,/document\.documentElement\?\.classList\.add\('android-native-inset'\)/);
  assert.match(css,/html\.android-native-inset\s+body\.tcgp-battle-live\s+\.tcgp-live-arena\.format-classic\s*\{[^}]*padding-bottom:\s*6px\s*!important/s);
});

test('Browser/PWA safe-area rule and Pocket geometry remain unchanged',()=>{
  assert.match(css,/\.tcgp-live-arena\s*\{[^}]*padding:\s*6px\s+10px\s+calc\(6px\s*\+\s*env\(safe-area-inset-bottom\)\)\s*!important/s);
  assert.match(css,/\.tcgp-live-arena\.format-classic\s*\{[^}]*grid-template-rows:\s*56px\s+var\(--tcgp-mat-h\)\s+34px\s+minmax\(0,1fr\)\s+118px\s*!important/s);
});
