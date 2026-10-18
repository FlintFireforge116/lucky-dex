'use strict';
const assert=require('assert'),path=require('path');
const assetsRoot=path.resolve(__dirname,'../app/src/main/assets');

global.LuckyDexAdventureSpecies={byId:{
  4:{id:4,name:'Charmander',types:['fire'],height:.6,weight:8.5,baseStats:{speed:65}},
  275:{id:275,name:'Shiftry',types:['grass','dark'],height:1.3,weight:59.6,baseStats:{speed:80}}
},fallback:{baseStats:{speed:60}}};
global.state={pokemon:{'4:n':{id:4,name:'Charmander',level:8},'275:n':{id:275,name:'Shiftry',level:8}},arcade:{}};
const platformPath=path.join(assetsRoot,'arcade-platform.js');delete require.cache[platformPath];
const platform=require(platformPath);
const rows=platform.dashRacers();
assert.equal(rows.find(r=>r.id===4).height,.6,'Dash racers carry species height into the renderer');
assert.equal(rows.find(r=>r.id===275).weight,59.6,'Dash racers carry species weight into the renderer');

const renderer=require(path.join(assetsRoot,'arcade-dash-renderer.js'));
assert.equal(typeof renderer.racerVisualScale,'function','renderer exposes bounded species size classes');
const tiny=renderer.racerVisualScale({height:.2,weight:2}),mid=renderer.racerVisualScale({height:1,weight:30}),huge=renderer.racerVisualScale({height:8,weight:500});
assert(tiny<mid&&mid<huge,'visual scale preserves some species-size identity');
assert(tiny>=.82&&huge<=1.12,'species size is intentionally compressed for fair racing');
const wide=renderer.spriteGeometry({naturalWidth:83,naturalHeight:66},270,500,112,98);
assert(wide.width<=98,'wide racers cannot spill across neighbouring lanes');
assert.equal(wide.y+wide.height,500,'racer geometry remains feet anchored');
assert.equal(typeof renderer.motionForRacer,'function','renderer exposes racer motion animation');
const idle=renderer.motionForRacer({types:['fire'],sprinting:false,boostTimer:0,impactTimer:0},0);
const moving=renderer.motionForRacer({types:['fire'],sprinting:true,boostTimer:0,impactTimer:0},140);
assert.notDeepEqual(idle,moving,'ground racers visibly animate while moving');
const hover=renderer.motionForRacer({types:['flying'],sprinting:false,boostTimer:0,impactTimer:0},140);
assert.equal(hover.profile,'hover','flying racers use a hover motion profile');

const dashPath=path.join(assetsRoot,'arcade-dash.js');delete require.cache[dashPath];
global.LuckyDexDashConfig=require(path.join(assetsRoot,'arcade-dash-config.js'));
global.LuckyDexDashCourse=require(path.join(assetsRoot,'arcade-dash-course.js'));
const dash=require(dashPath);
const racer={stamina:50,slowFactor:1,slowTimer:0,boostTimer:0,impactTimer:0,bodyBumpTimer:0,contactSlowTimer:0,contactCooldown:0};
dash.applyCourseObject(racer,{effect:'rock'});
assert(racer.impactTimer>0&&racer.impactKind==='rock','rock collision creates visible impact state');
const before=racer.impactTimer;dash.tickEffects(racer,.1);assert(racer.impactTimer<before,'impact animation expires over time');
assert.equal(typeof dash.resolveRacerContacts,'function','race engine exposes soft racer contact resolution');
const a={index:0,laneVisual:1,distance:100,finished:false,contactCooldown:0,bodyBumpTimer:0,contactSlowTimer:0};
const b={index:1,laneVisual:1.05,distance:105,finished:false,contactCooldown:0,bodyBumpTimer:0,contactSlowTimer:0};
assert(dash.resolveRacerContacts({racers:[a,b]})>0,'overlapping racers make soft contact');
assert(a.bodyBumpTimer>0&&b.bodyBumpTimer>0&&a.contactSlowTimer>0&&b.contactSlowTimer>0,'contact produces short feedback without permanent blocking');

const assets=require(path.join(assetsRoot,'arcade-dash-assets.js'));
assert.equal(assets.path('normal','objects','stamina-pickup'),'arcade/dash/gen3/oran-berry.png','stamina pickup uses the exact complete Emerald Oran Berry icon');
console.log('PASS Dash v0.33 finishing pass metadata, scale, animation, collision and authentic pickup contracts');
