'use strict';
const assert=require('node:assert/strict');

delete require.cache[require.resolve('../app/src/main/assets/arcade-platform.js')];
const platform=require('../app/src/main/assets/arcade-platform.js');
const defaults=platform.ensureArcadeState({});
assert.deepEqual(defaults.digDigDig,{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0}});
const migrated=platform.ensureArcadeState({customMarker:'keep',digDigDig:{bestTimes:{normal:12345},winsByDifficulty:{hard:2},gamesPlayed:3}});
assert.equal(migrated.customMarker,'keep');
assert.deepEqual(migrated.digDigDig.bestTimes,{easy:null,normal:12345,hard:null});
assert.deepEqual(migrated.digDigDig.winsByDifficulty,{easy:0,normal:0,hard:2});
assert.equal(migrated.digDigDig.gamesPlayed,3);

delete require.cache[require.resolve('../app/src/main/assets/arcade-session.js')];
const session=require('../app/src/main/assets/arcade-session.js');
const rule=session.ruleFor('digDigDig');
assert.match(rule.run,/80[- ]dig/i);assert.match(rule.run,/four|4/i);assert.match(rule.run,/Sandshrew/i);assert.match(rule.run,/alternate|left.*right/i);
assert.match(rule.reward,/place|placement/i);assert.match(rule.reward,/Lucky Coins/i);

const achievements=require('../app/src/main/assets/achievements-v0341.js');
function rows(state){return achievements.buildCoreAchievements(()=>state);}
const baseState={arcade:{digDigDig:defaults.digDigDig}};
const byId=Object.fromEntries(rows(baseState).map(a=>[a.id,a]));
for(const id of ['dig_first_win','dig_wins_10','dig_hard_win','dig_time_12000'])assert.ok(byId[id],`missing ${id}`);
assert.equal(byId.dig_first_win.name,'Down We Go');assert.deepEqual(byId.dig_first_win.progress(),[0,1]);
assert.equal(byId.dig_wins_10.name,'Tunnel Vision');assert.deepEqual(byId.dig_wins_10.progress(),[0,10]);
assert.equal(byId.dig_hard_win.name,'Hard Ground');assert.deepEqual(byId.dig_hard_win.progress(),[0,1]);
assert.equal(byId.dig_time_12000.name,'Rapid Excavator');assert.equal(byId.dig_time_12000.progress()[1],12000);assert.ok(byId.dig_time_12000.progress()[0]<12000,'null best time is incomplete');
const slower=byId.dig_time_12000.progress.call(null);
assert.ok(slower[0]<12000);
const fastRows=Object.fromEntries(rows({arcade:{digDigDig:{...defaults.digDigDig,bestTimeMs:12000,wins:1,winsByDifficulty:{easy:0,normal:0,hard:1}}}}).map(a=>[a.id,a]));
assert.ok(fastRows.dig_time_12000.progress()[0]>=12000,'12s best completes Rapid Excavator');
assert.deepEqual(fastRows.dig_hard_win.progress(),[1,1]);
const tooSlow=Object.fromEntries(rows({arcade:{digDigDig:{...defaults.digDigDig,bestTimeMs:12001}}}).map(a=>[a.id,a])).dig_time_12000.progress();
assert.ok(tooSlow[0]<12000,'slower than 12s remains incomplete');
console.log('PASS v0.36.0 Dig persistence, session metadata and achievements');
