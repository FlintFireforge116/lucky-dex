'use strict';
const assert=require('assert');
const path=require('path');
const runtimePath=path.join(__dirname,'../app/src/main/assets/arcade-eager-eevee.js');

delete require.cache[require.resolve(runtimePath)];
assert.doesNotThrow(()=>require(runtimePath),'Eager Eevee runtime must load without referencing removed controls');
assert.equal(typeof globalThis.LuckyDexEagerEevee?.pressA,'function','A/Dash should remain exported');
assert.equal('pressB' in (globalThis.LuckyDexEagerEevee||{}),false,'removed B/Feint control must not remain in runtime exports');
console.log('arcade-eager-eevee runtime load test passed');
