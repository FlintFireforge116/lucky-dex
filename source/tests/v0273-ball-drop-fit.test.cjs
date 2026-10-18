'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');
const js=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-ball-drop.js'),'utf8');

assert.match(css,/\.ball-drop-machine\{[^}]*width:94%;[^}]*margin-inline:auto/,'phone cabinet should scale down slightly and stay centered so the prize row remains visible');
assert.match(css,/\.ball-drop-machine\{[^}]*aspect-ratio:720\/1004/,'cabinet should retain the approved fixed internal aspect ratio');
assert.match(js,/width:720[^\n]*pegRows:(?:11|13)/,'later releases may shorten rows but must retain the 720-wide production geometry');
console.log('PASS v0.27.3+ Ball Drop phone-fit baseline');
