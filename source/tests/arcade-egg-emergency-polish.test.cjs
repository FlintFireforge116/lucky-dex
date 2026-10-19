'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const core=require('../app/src/main/assets/arcade-egg-emergency-core.js');
const root=path.join(__dirname,'../app/src/main/assets');
const coreSource=fs.readFileSync(path.join(root,'arcade-egg-emergency-core.js'),'utf8');
const css=fs.readFileSync(path.join(root,'arcade-egg-emergency.css'),'utf8');

assert.equal(typeof core.isCatchAligned,'function','catch alignment should be an explicit tested rule');
assert.equal(core.isCatchAligned(0,0),true,'centre catches centre');
assert.equal(core.isCatchAligned(0,-1),false,'centre must not catch left');
assert.equal(core.isCatchAligned(0,1),false,'centre must not catch right');
assert.equal(core.isCatchAligned(-1,-1),true,'left catches left');
assert.equal(core.isCatchAligned(1,1),true,'right catches right');
assert.match(coreSource,/isCatchAligned\(player\.lean,drop\.lane\)/,'runtime resolution should use exact catch alignment helper');

assert.match(css,/\.egg-emergency-lane:nth-child\(1\)\{[^}]*left:20%;[^}]*width:60%/s,'player lane should be a wide centred foreground lane');
assert.match(css,/\.egg-emergency-lane:nth-child\(n\+2\)[^{]*\{[^}]*height:58%/s,'CPU lanes should be staged above the player');
assert.match(css,/\.egg-emergency-lane:nth-child\(1\) \.egg-chansey\{[^}]*width:112px/s,'player Chansey should be visibly larger');
assert.match(css,/\.egg-emergency-lane:nth-child\(n\+2\) \.egg-chansey\{[^}]*width:56px/s,'CPU Chanseys should be visibly smaller');
assert.match(css,/nth-child\(1\) \.egg-chansey\[data-lean="-1"\][^{]*\{[^}]*left:22%;[^}]*rotate\(-18deg\)/s,'player left lean should move and tilt strongly');
assert.match(css,/nth-child\(1\) \.egg-chansey\[data-lean="1"\][^{]*\{[^}]*left:78%;[^}]*rotate\(18deg\)/s,'player right lean should move and tilt strongly');
console.log('arcade-egg-emergency polish tests passed');

assert.match(css,/\.egg-emergency-lane:nth-child\(n\+2\) \.egg-chansey\{[^}]*bottom:56px/s,'CPU Chanseys should sit above their score tags');
assert.match(css,/\.egg-emergency-lane:nth-child\(1\) \.egg-drop-layer\{[^}]*inset:0 0 38px/s,'player drops should fall deeper toward Chansey before resolving');
assert.match(css,/\.egg-emergency-lane:nth-child\(n\+2\) \.egg-drop-layer\{[^}]*inset:0 0 42px/s,'CPU drops should also fall deeper before resolving');
