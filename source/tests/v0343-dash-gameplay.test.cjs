'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const a=path.resolve(__dirname,'../app/src/main/assets');
global.LuckyDexDashConfig=require(path.join(a,'arcade-dash-config.js'));
global.LuckyDexAdventureSpecies=require(path.join(a,'adventure/adventure-species.js'));
global.LuckyDexDashCourse=require(path.join(a,'arcade-dash-course.js'));
const dash=require(path.join(a,'arcade-dash.js'));
function player(){return {key:'25:n',id:25,name:'Pikachu',baseSpeed:90,level:15,types:['electric']};}
function race(objects=[]){const r=dash.createRaceState(player(),[],{seed:343,difficulty:'normal',course:{finishDistance:1800,objects,sectionPlan:[]}});r.phase='racing';r.racers=r.racers.slice(0,1);return r;}

// Steering: first-frame response, clean release, immediate reversal without teleporting.
{
  const r=race(),p=r.racers[0];
  dash.stepRace(r,1/60,{steer:1,sprint:false});
  assert.ok(p.laneVisual>1,'right steering responds on first frame');
  assert.ok(p.laneVisual<1.2,'first frame remains smooth');
  const right=p.laneVisual;
  dash.stepRace(r,1/60,{steer:0,sprint:false});
  assert.ok(Math.abs(p.laneVisual-right)<1e-9,'release stops lateral motion immediately');
  dash.stepRace(r,1/60,{steer:-1,sprint:false});
  assert.ok(p.laneVisual<right,'reversal changes direction next frame');
}

// Emptying the bar should create a meaningful exhaustion state rather than 1-frame sprint flicker.
{
  let s={stamina:1,recoveryDelay:0,sprintExhausted:false};
  s=dash.stepStamina(s,true,0.1);
  assert.equal(s.stamina,0);
  assert.equal(s.sprintExhausted,true,'fully draining stamina enters exhaustion');
  s=dash.stepStamina(s,false,1.0);
  assert.ok(s.stamina>0,'stamina regenerates after release');
  assert.equal(s.sprintExhausted,true,'a tiny refill does not instantly re-arm sprint');
  s=dash.stepStamina({...s,stamina:dash.CONSTANTS.SPRINT_REARM},false,0);
  assert.equal(s.sprintExhausted,false,'sprint re-arms at the recovery threshold');
}


// Racer contacts should separate bodies without changing species/base pace.
{
  const r=dash.createRaceState(player(),[{key:'26:n',id:26,name:'Raichu',baseSpeed:90,level:15,types:['electric']}],{seed:99,difficulty:'normal',course:{finishDistance:1800,objects:[],sectionPlan:[]}});
  r.phase='racing';r.racers=r.racers.slice(0,2);
  const [a,b]=r.racers;a.laneVisual=1;b.laneVisual=1;a.targetLane=1;b.targetLane=1;a.distance=120;b.distance=120;
  const speeds=r.racers.map(x=>x.baseSpeed);
  const beforeLane=Math.abs(a.laneVisual-b.laneVisual),beforeDistance=Math.abs(a.distance-b.distance);
  assert.equal(dash.resolveRacerContacts(r),1);
  assert.ok(Math.abs(a.laneVisual-b.laneVisual)>beforeLane||Math.abs(a.distance-b.distance)>beforeDistance,'contact adds bounded physical separation');
  assert.deepEqual(r.racers.map(x=>x.baseSpeed),speeds,'contact does not change base speed');
}

// One obstacle can only penalize a racer once even while its footprint overlaps consecutive frames.
{
  const rock={id:'rock-once',effect:'rock',lane:1,distance:4,assetKey:'route-rock'};
  const r=race([rock]),p=r.racers[0];p.distance=0;p.laneVisual=1;
  dash.stepRace(r,0.05,{steer:0,sprint:false});
  assert.ok(p.hitObjects.has('rock-once'),'first contact is recorded');
  const timer=p.slowTimer,afterFirst=p.distance;
  dash.stepRace(r,0.01,{steer:0,sprint:false});
  assert.ok(p.slowTimer<=timer,'overlap does not re-apply or extend the penalty');
  assert.ok(p.distance>=afterFirst,'second frame is not knocked backward again');
}


// Player berry pickups are shared one-shot course objects and disappear immediately.
{
  const berry={id:'berry-once',effect:'stamina-pickup',lane:1,distance:4,assetKey:'oran-berry'};
  const r=race([berry]),p=r.racers[0];p.stamina=20;p.distance=0;p.laneVisual=1;
  dash.stepRace(r,0.05,{steer:0,sprint:false});
  assert.equal(berry.consumed,true,'pickup object is marked consumed immediately');
  const after=p.stamina;
  p.distance=0;
  dash.stepRace(r,0.05,{steer:0,sprint:false});
  assert.ok(p.stamina<=after+2,'consumed pickup cannot award stamina a second time');
}

// Position changes and the final stretch are explicit race feedback state.
{
  const r=dash.createRaceState({...player(),baseSpeed:180},[{key:'1:n',id:1,name:'Bulbasaur',baseSpeed:10,level:1,types:['grass']}],{seed:71,difficulty:'easy',course:{finishDistance:100,objects:[],sectionPlan:[]}});
  r.phase='racing';r.racers=r.racers.slice(0,2);const [p,ai]=r.racers;
  p.distance=50;ai.distance=52;r.lastPlayerPlace=2;
  dash.stepRace(r,0.05,{steer:0,sprint:true});
  assert.ok(r.positionSignal&&r.positionSignal.to===1,'overtake exposes a transient position-change signal');
  p.distance=86;ai.distance=70;r.lastPlayerPlace=1;r.finalStretch=false;
  dash.stepRace(r,0.01,{steer:0,sprint:false});
  assert.equal(r.finalStretch,true,'final-stretch state activates before the finish');
}

console.log('PASS v0.34.3 Dash gameplay contracts');
