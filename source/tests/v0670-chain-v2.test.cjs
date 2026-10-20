'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../app/src/main/assets/adventure/adventure-model.js');

const saveWithLegacy=()=>({adventureV2:{lastDestination:'meadow',destinations:{meadow:{encounters:12,chain:9,shiny:1,seen:{'25':4,'16':2},caught:{'25':2},rare:{'113':1},custom:{keep:true}}}}});

test('chain v2 migration is additive and never invents a target from the legacy habitat chain',()=>{
 const save=saveWithLegacy(),v2=M.ensureState(save),legacy=v2.destinations.meadow;
 assert.equal(legacy.chain,9);assert.equal(legacy.seen['25'],4);assert.equal(legacy.caught['25'],2);assert.equal(legacy.rare['113'],1);assert.equal(legacy.shiny,1);assert.deepEqual(legacy.custom,{keep:true});
 assert.equal(typeof M.huntState,'function');const hunt=M.huntState(v2,'meadow');assert.deepEqual(hunt,{targetId:null,chain:0,bestBySpecies:{},startedAt:null});assert.equal(v2.activeTargetHuntDestination,null);
 const restored=JSON.parse(JSON.stringify(save));M.ensureState(restored);assert.deepEqual(restored,save,'normalization is idempotent');
});

test('target capture advances, target victory preserves, and untouched non-target leave is harmless',()=>{
 const v2=M.ensureState({});M.startTargetHunt(v2,'meadow',25);
 assert.equal(M.updateTargetHunt(v2,'meadow',{kind:'capture',speciesId:25,committed:true}).chain,1);
 assert.equal(M.updateTargetHunt(v2,'meadow',{kind:'victory',speciesId:25,committed:true}).chain,1,'KO does not equal a successful catch chain step');
 assert.equal(M.updateTargetHunt(v2,'meadow',{kind:'leave',speciesId:16,committed:false}).chain,1);
 assert.equal(M.huntState(v2,'meadow').bestBySpecies['25'],1);
});

test('a failed committed target breaks current chain but preserves its best',()=>{
 for(const kind of ['fled','loss']){const v2=M.ensureState({});M.startTargetHunt(v2,'cave',95);M.updateTargetHunt(v2,'cave',{kind:'capture',speciesId:95,committed:true});M.updateTargetHunt(v2,'cave',{kind:'capture',speciesId:95,committed:true});const h=M.updateTargetHunt(v2,'cave',{kind,speciesId:95,committed:true});assert.equal(h.chain,0,kind);assert.equal(h.bestBySpecies['95'],2,kind);assert.equal(h.targetId,95,kind+' keeps the chosen target so the player can rebuild');}
});

test('switching species or destination breaks only the active chain and preserves historical bests',()=>{
 const v2=M.ensureState({});M.startTargetHunt(v2,'coast',129);for(let i=0;i<3;i++)M.updateTargetHunt(v2,'coast',{kind:'capture',speciesId:129,committed:true});
 let h=M.startTargetHunt(v2,'coast',130);assert.equal(h.targetId,130);assert.equal(h.chain,0);assert.equal(h.bestBySpecies['129'],3);assert.equal(v2.activeTargetHuntDestination,'coast');
 M.updateTargetHunt(v2,'coast',{kind:'capture',speciesId:130,committed:true});M.startTargetHunt(v2,'volcano',58);
 h=M.huntState(v2,'coast');assert.equal(h.targetId,null);assert.equal(h.chain,0);assert.equal(h.bestBySpecies['129'],3);assert.equal(h.bestBySpecies['130'],1);assert.equal(v2.activeTargetHuntDestination,'volcano');assert.equal(M.huntState(v2,'volcano').targetId,58);
});

test('target chain milestones expose every visible capped gameplay bonus',()=>{
 const v2=M.ensureState({});M.startTargetHunt(v2,'meadow',25);const h=M.huntState(v2,'meadow');
 const expected=[
  [0,{targetWeight:1,clueTier:0,rareBonus:0,itemBonus:0,shinyMultiplier:1,nextThreshold:3}],
  [3,{targetWeight:1.5,clueTier:1,rareBonus:.5,itemBonus:1,shinyMultiplier:1,nextThreshold:5}],
  [5,{targetWeight:2,clueTier:2,rareBonus:1,itemBonus:1.5,shinyMultiplier:1.25,nextThreshold:10}],
  [10,{targetWeight:3,clueTier:3,rareBonus:1.5,itemBonus:2,shinyMultiplier:1.5,nextThreshold:20}],
  [20,{targetWeight:4,clueTier:4,rareBonus:2,itemBonus:3,shinyMultiplier:2,nextThreshold:null}],
  [50,{targetWeight:4,clueTier:4,rareBonus:2,itemBonus:3,shinyMultiplier:2,nextThreshold:null}]
 ];
 for(const [chain,bonus] of expected){h.chain=chain;h.bestBySpecies['25']=Math.max(h.bestBySpecies['25']||0,chain);assert.deepEqual(M.targetChainInfo(v2,'meadow'),{targetId:25,chain,best:h.bestBySpecies['25'],...bonus});}
});
