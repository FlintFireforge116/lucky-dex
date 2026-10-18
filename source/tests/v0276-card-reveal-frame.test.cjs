'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/arcade.css'),'utf8');
assert.match(css,/\.arcade-card-reveal-art\{[^}]*margin-bottom:\s*12px/s,'card artwork frame should reserve a real gap before the caption');
assert.match(css,/\.arcade-card-reveal-copy\{[^}]*position:\s*relative[^}]*z-index:\s*2[^}]*background:/s,'card caption should render in its own opaque layer above/below the frame, never underneath it');
assert.match(css,/\.arcade-card-reveal-copy\{[^}]*width:\s*100%/s,'card caption should own a full-width row beneath the artwork');
console.log('PASS v0.27.6 card reveal frame/caption separation');
