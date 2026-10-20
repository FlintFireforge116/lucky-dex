'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets','adventure');const css=fs.readFileSync(path.join(root,'adventure-activities.css'),'utf8'),js=fs.readFileSync(path.join(root,'adventure-fishing.js'),'utf8');
test('Adventure fishing uses current location art with a single game-style message window',()=>{assert.match(js,/scenePath\(s\.place\)/);assert.match(js,/class="adv-fishing-gen3-dialog"/);assert.match(js,/A Pokémon's on the hook!/);assert.match(js,/Not even a nibble/);assert.match(js,/It got away/);});
test('Gen III encounter presentation preserves pixel scene art and chunky dialogue framing',()=>{assert.match(css,/\.adv-fishing-gen3-scene img\{[^}]*image-rendering:\s*pixelated/);assert.match(css,/\.adv-fishing-gen3-dialog\{[^}]*border:\s*4px solid/);assert.match(css,/\.adv-fishing-gen3\{[^}]*grid-template-rows:/);});
