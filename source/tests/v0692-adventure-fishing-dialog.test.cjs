'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');const js=fs.readFileSync(path.join(root,'app/src/main/assets/adventure/adventure-fishing.js'),'utf8');const css=fs.readFileSync(path.join(root,'app/src/main/assets/adventure/adventure-activities.css'),'utf8');
test('Adventure Fishing no longer renders feedback into the full-screen activity shell',()=>{assert.doesNotMatch(js,/LuckyDexAdventureActivityShell|Shell\.open/);assert.match(js,/appendChild\(overlay\)/);assert.match(js,/adv-fishing-inline-message/)});
test('inline fishing feedback is fixed above the current Adventure location',()=>{assert.match(css,/\.adv-fishing-inline\{[^}]*position:fixed;[^}]*z-index:80/);assert.match(css,/\.adv-fishing-inline-message\{/)});
test('tappable bite dialog uses the same inline message card',()=>{assert.match(js,/adv-fishing-inline-message is-bite/);assert.match(js,/data-fish-hook/)});
