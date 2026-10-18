'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/styles-v013.css'),'utf8');

assert.doesNotMatch(html,/class="sealed-shelf"/,'non-functional Sealed shelf teaser must not consume Packs viewport space');
assert.match(css,/\.pack-home\s*\{[^}]*overflow-y:\s*auto/s,'Packs viewport can scroll when the selector expands beyond the phone height');
assert.match(css,/\.pack-selector-card\s*\{[^}]*flex:\s*0\s+0\s+auto[^}]*min-height:\s*0[^}]*overflow:\s*visible/s,'pack selector sizes to content without crushing or overlapping controls');
assert.match(css,/\.pack-set-browser\s*\{[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/s,'set chooser owns its own scrolling when expanded');
assert.match(css,/@media\s*\(max-height:\s*760px\)[\s\S]*?\.pack-set-row\s*\{[^}]*min-height:\s*44px/s,'short-phone mode compacts set rows');
assert.match(css,/\.pack-open-main\s*\{[^}]*margin-top:\s*0[^}]*min-height:\s*48px/s,'open-pack button remains a reserved visible control');
assert.match(html,/id="openPackBtn"/,'open-pack button remains present');
console.log('PASS Packs short-phone layout contract');
