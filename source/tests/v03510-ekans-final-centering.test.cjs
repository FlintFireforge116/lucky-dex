const assert=require('assert');
const fs=require('fs');
const css=fs.readFileSync('app/src/main/assets/arcade-ekans-hoop.css','utf8');
const js=fs.readFileSync('app/src/main/assets/arcade-ekans-hoop.js','utf8');

assert.match(css,/\.ekans-hoop-target\{[^}]*width:\s*88px;[^}]*height:\s*88px/i,'desktop Diglett target should be slightly larger');
assert.match(css,/\.ekans-hoop-target\.is-dugtrio\{[^}]*width:\s*108px;[^}]*height:\s*100px/i,'desktop Dugtrio target should be slightly larger');
assert.match(css,/@media\(max-width:420px\)[\s\S]*?\.ekans-hoop-target\{width:\s*80px;height:\s*80px\}/i,'mobile Diglett target should be slightly larger');
assert.match(css,/@media\(max-width:420px\)[\s\S]*?\.ekans-hoop-target\.is-dugtrio\{width:\s*96px;height:\s*90px\}/i,'mobile Dugtrio target should be slightly larger');

// The visual centre of depth rows must match the centres of the three board cells:
// far 17%, middle 50%, near 83% from the top.
assert.match(js,/const depthPct=depth=>83-clamp\(Number\(depth\)\|\|0,0,2\)\*33;/,'target row centres should be 17/50/83 percent');
assert.match(js,/const aimDepthPct=depth=>83-clamp\(Number\(depth\)\|\|0,AIM_REST_DEPTH,2\)\*33;/,'aim marker should use the same cell-centre mapping');

console.log('PASS v0.35.10 Ekans final sprite scale and cell centering');
