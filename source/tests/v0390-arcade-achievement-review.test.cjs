'use strict';
const assert=require('node:assert/strict');
globalThis.state={profile:{achievementClaims:['claimed'],coins:10,dust:20,tickets:3}};
globalThis.ACHIEVEMENTS=[
 {id:'claimed',name:'Claimed',desc:'x',icon:'A',category:'arcade',hidden:false,progress:()=>[1,1]},
 {id:'unclaimed',name:'Complete but unclaimed',desc:'x',icon:'B',category:'arcade',hidden:true,progress:()=>[2,2]},
 {id:'incomplete',name:'No',desc:'x',icon:'C',category:'arcade',hidden:false,progress:()=>[0,1]},
 {id:'other',name:'Other',desc:'x',icon:'D',category:'pokemon',hidden:false,progress:()=>[1,1]}
];
globalThis.achievementProgress=a=>{const [value,target]=a.progress();return {value,target,complete:value>=target,claimed:state.profile.achievementClaims.includes(a.id)};};
const api=require('../app/src/main/assets/achievements-v0341.js');
assert.deepEqual(api.snapshotCompletedArcadeIds().sort(),['claimed','unclaimed']);
const rows=api.describeAchievementIds(['unclaimed','other','missing']);
assert.deepEqual(rows.map(r=>r.id),['unclaimed','other']);
assert.equal(rows[0].hidden,true); assert.ok(!('reward' in rows[0])&&!('progress' in rows[0]));
assert.deepEqual(state.profile,{achievementClaims:['claimed'],coins:10,dust:20,tickets:3},'snapshot must never mutate rewards/claims');
const old=globalThis.achievementProgress; globalThis.achievementProgress=null;
assert.deepEqual(api.snapshotCompletedArcadeIds().sort(),['claimed','unclaimed'],'progress can be derived read-only when runtime helper is unavailable');
globalThis.ACHIEVEMENTS=null;
assert.deepEqual(api.snapshotCompletedArcadeIds(),[],'unavailable runtime catalogue is safe');
globalThis.achievementProgress=old;
console.log('PASS v0.39.0 arcade achievement review');
