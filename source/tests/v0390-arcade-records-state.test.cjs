'use strict';
const assert=require('node:assert/strict');
const platform=require('../app/src/main/assets/arcade-platform.js');
assert.deepEqual(platform.normalizeArcadeRecords(null),{version:1,games:{}});
const old={
  dustKeepCopies:3,customKey:{x:1},dash:{races:4,wins:2,quickBestTimes:{easy:1234}},
  records:{version:99,games:{dash:{recent:[{entryId:'a',completedAt:2,title:'ok'},{entryId:'b',completedAt:1,title:'old'}]},futureGame:{recent:[{entryId:'f',completedAt:3,title:'future'}]},bad:{recent:'nope'}}}
};
const normalized=platform.ensureArcadeState(old);
assert.equal(normalized.dustKeepCopies,3); assert.deepEqual(normalized.customKey,{x:1});
assert.equal(normalized.dash.races,4); assert.equal(normalized.dash.wins,2); assert.equal(normalized.dash.quickBestTimes.easy,1234);
assert.equal(normalized.records.version,1); assert.equal(normalized.records.games.dash.recent.length,2); assert.equal(normalized.records.games.futureGame.recent.length,1); assert.deepEqual(normalized.records.games.bad.recent,[]);
const eleven={version:1,games:{dash:{recent:Array.from({length:11},(_,i)=>({entryId:'e'+i,completedAt:i,title:'t'}))}}};
assert.equal(platform.normalizeArcadeRecords(eleven).games.dash.recent.length,10);
console.log('PASS v0.39.0 arcade records state');
