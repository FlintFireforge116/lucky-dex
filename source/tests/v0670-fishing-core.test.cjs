'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const F=require('../app/src/main/assets/adventure/adventure-fishing-core.js');

const cap=(region='kanto',name='route-19')=>({type:'fish',poolKey:`${region}-${name}`,rods:['old','good','super'],repeatable:true});

test('rod unlocks derive safely from regional badge count',()=>{
  assert.deepEqual(F.availableRods({},null),['old']);
  assert.deepEqual(F.availableRods({}, {badges:2}),['old']);
  assert.deepEqual(F.availableRods({}, {badges:3}),['old','good']);
  assert.deepEqual(F.availableRods({}, {badges:6}),['old','good','super']);
});

test('cast quality and bite timing are deterministic for a seed but vary between seeds',()=>{
  const a=F.start({capability:cap(),rod:'old',seed:123,now:1000});
  const b=F.start({capability:cap(),rod:'old',seed:123,now:1000});
  const c=F.start({capability:cap(),rod:'old',seed:124,now:1000});
  F.cast(a,{power:.75,now:1000});F.cast(b,{power:.75,now:1000});F.cast(c,{power:.2,now:1000});
  assert.equal(a.castQuality,b.castQuality);assert.equal(a.biteAt,b.biteAt);assert.notEqual(a.biteAt,c.biteAt);assert.ok(a.castQuality>c.castQuality);
});

test('missed bite escapes, timely hook reaches reel',()=>{
  const miss=F.start({capability:cap(),rod:'old',seed:9,now:0});F.cast(miss,{power:.75,now:0});F.advance(miss,miss.biteAt);assert.equal(miss.phase,'bite');F.advance(miss,miss.hookDeadline+1);assert.equal(F.result(miss).reason,'missed-hook');
  const hit=F.start({capability:cap(),rod:'good',seed:9,now:0});F.cast(hit,{power:.75,now:0});F.advance(hit,hit.biteAt);assert.equal(F.hook(hit,hit.biteAt+20),true);assert.equal(hit.phase,'reel');assert.ok(hit.speciesId>0);
});

test('reckless reeling can break tension while managed tension lands the fish',()=>{
  const broken=F.start({capability:cap('hoenn','route-124'),rod:'super',seed:44,now:0});F.cast(broken,{power:.75,now:0});F.advance(broken,broken.biteAt);F.hook(broken,broken.biteAt);for(let i=0;i<20&&!F.result(broken);i++)F.reel(broken,{pull:true},400);assert.equal(F.result(broken).reason,'line-break');
  const landed=F.start({capability:cap('johto','lake-of-rage'),rod:'good',seed:45,now:0});F.cast(landed,{power:.78,now:0});F.advance(landed,landed.biteAt);F.hook(landed,landed.biteAt);for(let i=0;i<80&&!F.result(landed);i++)F.reel(landed,{pull:landed.tension<.62},250);const result=F.result(landed);assert.equal(result.kind,'landed');assert.ok(result.speciesId>0);assert.ok(result.level>=1);assert.equal(result.seed,45);
});

test('cancel never fabricates a landed encounter and records normalize additively',()=>{
  const save={profile:{coins:7}};const s=F.ensureState(save);assert.equal(save.profile.coins,7);assert.equal(s.casts,0);
  const run=F.start({capability:cap(),rod:'old',seed:2,now:0});F.cast(run,{power:.5,now:0});F.cancel(run);assert.equal(F.result(run).kind,'cancelled');
  F.record(save,{kind:'cancelled'});assert.equal(F.ensureState(save).casts,0);
  F.record(save,{kind:'escaped',hooked:true});F.record(save,{kind:'landed',speciesId:129,rare:false,shiny:false});F.record(save,{kind:'landed',speciesId:130,rare:true,shiny:true,caught:true});
  const r=F.ensureState(save);assert.equal(r.hooked,1);assert.equal(r.escapes,1);assert.equal(r.landed,2);assert.equal(r.catches,1);assert.equal(r.rare,1);assert.equal(r.shiny,1);assert.equal(r.bestStreak,2);
});
