'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../app/src/main/assets/arcade-fossil-museum-core.js');
const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
const museum=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-fossil-museum.js'),'utf8');

assert.equal(core.BURIED_CARD_SITE_CHANCE,0.15,'loose buried cards should occur on 15% of dig sites');
assert.equal(core.BURIED_BOOSTER_SITE_CHANCE,0.04,'full buried boosters should be rarer at 4% of dig sites');
const booster=core.byId('tcg-booster');
assert.ok(booster,'fossil catalogue must contain a buried booster reward');
assert.equal(booster.rewardDestination,'booster');
assert.match(app,/resolveBuriedBooster:resolveBuriedBoosterV0259/,'runtime bridge resolves a real random booster');
assert.match(app,/grantBooster:grantFossilBoosterV0258/,'runtime bridge grants all cards from a buried booster');
assert.match(museum,/rewardDestination==='booster'[\s\S]{0,300}grantBooster/,'dig banking must collect the buried booster reward');
console.log('PASS v0.25.8 dig card/booster reward contract');
