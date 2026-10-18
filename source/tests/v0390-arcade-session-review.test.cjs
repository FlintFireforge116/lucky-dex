'use strict';
const assert=require('node:assert/strict');
globalThis.state={arcade:{}};
let commits=0, storedCalls=0;
globalThis.LuckyDexArcadeRecords={
 captureAchievementSnapshot:()=>{const a=[];Object.defineProperty(a,'available',{value:true});return a;},
 commitReview:(gameId,review,opts)=>{commits++;return {...review,gameId,achievements:[{id:'new',name:'New'}]};},
 getRecent:()=>[],openGame:()=>{storedCalls++;}
};
const session=require('../app/src/main/assets/arcade-session.js');
session.mount('dash');
const result=session.showResult('dash',{title:'RACE COMPLETE',metricLabel:'PLACE',metricValue:'2ND',coinsAwarded:100,bestText:'NEW BEST',review:{title:'RACE COMPLETE',mode:'Quick Race',difficulty:'Hard',metricLabel:'PLACE',metricValue:'2ND',scoreboard:[{rank:'1ST',label:'CPU',value:'12.00s'},{rank:'2ND',label:'YOU',value:'12.10s',player:true}],stats:[{label:'Gap',value:'+0.10s'}]},historyKey:'dash:1'});
assert.equal(commits,1);assert.equal(result.review.mode,'Quick Race');assert.equal(result.review.difficulty,'Hard');assert.equal(result.review.scoreboard[1].player,true);assert.equal(result.review.achievements[0].id,'new');
assert.equal(session.showResult('dash',{title:'DUP'}),false,'sheet guard blocks duplicate completion display');
session.hideResult();
const legacy=session.showResult('quiz',{title:'DONE',metricLabel:'SCORE',metricValue:'500',coinsAwarded:20,bestText:'BEST',details:[{title:'10/10',subtitle:'Hard'}],historyKey:'quiz:1'});
assert.equal(legacy.review.metricValue,'500');assert.ok(legacy.review.stats.some(r=>r.label==='10/10'));assert.ok(legacy.review.rewards.some(r=>r.label==='Lucky Coins'));
session.hideResult();
const before=commits;const stored=session.showStoredReview('dash',{entryId:'x',title:'OLD RUN',metricLabel:'PLACE',metricValue:'1ST',primaryMetric:'1ST',scoreboard:[{rank:'1ST',label:'YOU',value:'11.00s',player:true}]});
assert.equal(commits,before,'stored review never recommits history/rewards');assert.equal(stored.review.readOnly,true);
session.hideResult();
console.log('PASS v0.39.0 arcade session review');
