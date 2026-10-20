'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const M=require('../app/src/main/assets/adventure/adventure-model.js');
const root=path.resolve(__dirname,'../app/src/main/assets/adventure');
const wild=()=>fs.readFileSync(path.join(root,'adventure-wild-hunt.js'),'utf8');
const controller=()=>fs.readFileSync(path.join(root,'adventure-controller.js'),'utf8');
const css=()=>fs.readFileSync(path.join(root,'adventure.css'),'utf8');

test('known target choices are limited to species already discovered in that habitat and its authentic pools',()=>{
 const v2=M.ensureState({adventureV2:{destinations:{meadow:{seen:{'25':2,'999':4},caught:{'16':1,'113':1}}}}});
 assert.equal(typeof M.knownTargetIds,'function');assert.deepEqual(M.knownTargetIds(v2,'meadow'),[16,25,113]);
 assert.deepEqual(M.knownTargetIds(v2,'cave'),[],'records do not leak between habitats');
});

test('target weighting changes deterministic picks without deleting non-target species',()=>{
 assert.equal(typeof M.weightedPick,'function');const ids=[10,16,25];
 assert.equal(M.weightedPick(ids,25,1,.55),16,'weight x1 behaves as the ordinary pool');
 assert.equal(M.weightedPick(ids,25,4,.55),25,'milestone weighting favours the target');
 const samples=new Set([.01,.12,.3,.55,.8,.99].map(r=>M.weightedPick(ids,25,4,r)));assert(samples.has(10));assert(samples.has(16));assert(samples.has(25),'weighting does not turn the hunt into a guaranteed spawn');
});

test('Wild Hunt UI is wired to target selection, explicit bonuses and safe untouched non-target leave',()=>{
 const src=wild();assert.match(src,/data-adv-target/);assert.match(src,/TRACK THIS SPECIES/);assert.match(src,/M\.startTargetHunt/);assert.match(src,/M\.targetChainInfo/);assert.match(src,/M\.weightedPick/);
 assert.match(src,/kind:'leave'/,'revealed non-target leave is recorded as a harmless leave');assert.doesNotMatch(src,/M\.updateFieldChain/,'new Wild Hunt no longer mutates the legacy habitat chain');
 assert.match(src,/Target escape\/loss resets|target escape\/loss resets/i,'break rule is visible before battle commitment');
 assert.match(css(),/adv-target-picker/);assert.match(css(),/adv-hunt-target-status/);
});

test('Adventure home surfaces the active species hunt instead of presenting the legacy field chain as current gameplay',()=>{
 const src=controller();assert.match(src,/targetChainInfo/);assert.match(src,/Tracking/);assert.doesNotMatch(src,/Catch Chain ×\$\{b\.chain\}/);
});

test('untargeted hunt call to action is spelled clearly',()=>{
  assert.match(wild(),/START UNTARGETED SEARCH/);
});
