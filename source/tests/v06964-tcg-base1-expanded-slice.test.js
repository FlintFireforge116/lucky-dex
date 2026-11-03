'use strict';
const assert=require('node:assert/strict');
const base=require('../app/src/main/assets/tcg-classic-base1.js');
require('../app/src/main/assets/tcg-classic-battle-data.js');

const expected=[3,6,7,9,10,11,12,13,14,17,19,20,23,24,25,26,28,29,30,31,32,33,34,35,36,37,41,42,43,44,45,46,47,48,49,51,52,53,54,55,56,58,59,60,61,62,63,64,65,66,67,68,69];
for(const number of expected){
  const card=base.cardById(`base1-${number}`);
  assert.equal(card?.support?.status,'FULL',`${card?.name||number} should be FULL`);
  assert.equal(card?.battleEnabled,true,`${card?.name||number} should be battle-enabled`);
}
assert.equal(base.cardById('base1-1').support.status,'FULL','Alakazam graduates once Damage Swap is exact');
assert.equal(base.cardById('base1-4').support.status,'FULL','Charizard graduates once Energy Burn is exact');
assert.equal(base.cardById('base1-15').support.status,'FULL','Venusaur graduates once Energy Trans is exact');
assert.equal(base.cardById('base1-96').support.status,'FULL');
assert.ok(base.coverage().battleEnabled>=54,'expanded slice should materially grow Base Set coverage');

assert.equal(base.cardById('base1-23').stage,'Stage 1');
assert.equal(base.cardById('base1-23').evolvesFrom,'Growlithe');
assert.equal(base.cardById('base1-11').stage,'Stage 2');
assert.equal(base.cardById('base1-11').evolvesFrom,'Nidorino');
assert.equal(base.cardById('base1-37').evolvesFrom,'Nidoran♂');
assert.equal(base.cardById('base1-59').attacks[0].effect.type,'energyDamage');
assert.equal(base.cardById('base1-59').attacks[0].effect.maxCount,2);
console.log('v0.69.64 expanded Base Set slice tests passed');
