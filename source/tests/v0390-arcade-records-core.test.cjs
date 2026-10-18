'use strict';
const assert=require('node:assert/strict');
let core;
try{ core=require('../app/src/main/assets/arcade-records-core.js'); }catch(e){ console.error(e.message); process.exit(1); }

const review=core.normalizeReview('dash',{
  title:'RACE COMPLETE',mode:'Quick Race',difficulty:'Hard',metricLabel:'PLACE',metricValue:'2ND',primaryMetric:'2ND',
  scoreboard:Array.from({length:12},(_,i)=>({rank:i<2?'1ST':`${i+1}TH`,label:`Racer ${i}`,value:`${i}.123`,player:i===2,evil:{x:1},fn:()=>1})),
  stats:Array.from({length:20},(_,i)=>({label:'S'.repeat(200)+i,value:{bad:true}})),
  pbs:Array.from({length:12},(_,i)=>({label:'PB '+i,value:'V'.repeat(300),isNew:i===0})),
  rewards:Array.from({length:12},(_,i)=>({label:'Coins '+i,value:String(i),payload:{bad:true}})),
  achievements:Array.from({length:12},(_,i)=>({id:'a'+i,name:'Achievement '+i,desc:'D'.repeat(200),icon:'x',hidden:false,fn:()=>1})),
  callback:()=>42, nested:{danger:true}
});
assert.equal(review.gameId,'dash');
assert.equal(review.scoreboard.length,8);
assert.equal(review.scoreboard[0].rank,'1ST');
assert.equal(review.scoreboard[1].rank,'1ST','shared rank labels must survive');
assert.ok(review.scoreboard.every(r=>!('fn' in r)&&!('evil' in r)));
assert.equal(review.stats.length,12);
assert.equal(review.pbs.length,8);
assert.equal(review.rewards.length,8);
assert.equal(review.achievements.length,8);
assert.ok(review.stats[0].label.length<=120);
assert.ok(review.pbs[0].value.length<=120);
assert.ok(!('callback' in review)&&!('nested' in review));

const entry=core.historyEntryFromReview(review,{completedAt:123456,entryId:'dash:123'});
assert.equal(entry.entryId,'dash:123');
assert.equal(JSON.stringify(entry).includes('callback'),false);
assert.equal(JSON.stringify(entry).includes('function'),false);
const stored=core.reviewFromHistory('dash',entry);
assert.equal(stored.readOnly,true);
assert.ok(!('onReplay' in stored));

let store={version:1,games:{}};
let out=core.appendHistory(store,'dash',entry,10); store=out.store; assert.equal(out.appended,true);
out=core.appendHistory(store,'dash',entry,10); store=out.store; assert.equal(out.appended,false); assert.equal(store.games.dash.recent.length,1);
for(let i=0;i<11;i++){ out=core.appendHistory(store,'dash',{...entry,entryId:'e'+i,completedAt:200000+i},10); store=out.store; }
assert.equal(store.games.dash.recent.length,10); assert.equal(store.games.dash.recent[0].entryId,'e10'); assert.equal(store.games.dash.recent.at(-1).entryId,'e1');
const malformed=core.normalizeHistoryEntry('dash',{entryId:'x'.repeat(500),completedAt:'nope',title:'T'.repeat(999),scoreboard:new Array(200).fill({rank:'1ST',label:'L'.repeat(500),value:'V'.repeat(500)})});
assert.ok(malformed); assert.ok(malformed.entryId.length<=120); assert.ok(malformed.title.length<=120); assert.equal(malformed.scoreboard.length,8);
const ach=core.newAchievements(['a'],[{id:'a',name:'Old'},{id:'b',name:'New'}]); assert.deepEqual(ach.map(x=>x.id),['b']);
console.log('PASS v0.39.0 arcade records core');
