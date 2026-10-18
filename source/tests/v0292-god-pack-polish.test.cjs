'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const god=require(path.join(root,'app/src/main/assets/god-pack-v0291.js'));
const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');

assert.strictEqual(god.PRODUCTION_DENOMINATOR,1000,'God Pack production odds stay 1/1000');
assert.strictEqual(god.FORCE_TEST_GOD_PACK,false,'100% validation override must be disabled after sign-off');
assert.match(flow,/!godPack\s*&&\s*Math\.random\(\)\s*<\s*1\/500/,'Lucky Pack must be 1/500 and suppressed by God Pack');
assert.doesNotMatch(flow,/IMPOSSIBLE LUCK/,'God Pack intro must not say IMPOSSIBLE LUCK');
assert.doesNotMatch(flow,/EVERY CARD IS A HIT/,'God Pack intro must not say EVERY CARD IS A HIT');
assert.match(flow,/god-pack-intro-title\">GOD PACK</,'God Pack intro must simply say GOD PACK');
assert.match(flow,/GOD PACK COMPLETE/,'completion summary remains GOD PACK COMPLETE');
console.log('v0.29.2 God Pack polish contract passed');
