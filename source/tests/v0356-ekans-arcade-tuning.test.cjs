'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const core=require('../app/src/main/assets/arcade-ekans-hoop-core.js');

// Species and shininess are independent: 80/20 species split, 1% shiny chance for either.
assert.equal(core.targetTypeForRoll(0.00,0.50).kind,'diglett');
assert.equal(core.targetTypeForRoll(0.7999,0.50).kind,'diglett');
assert.equal(core.targetTypeForRoll(0.80,0.50).kind,'dugtrio');
assert.equal(core.targetTypeForRoll(0.9999,0.50).kind,'dugtrio');
assert.equal(core.targetTypeForRoll(0.20,0.009).kind,'shinyDiglett');
assert.equal(core.targetTypeForRoll(0.90,0.009).kind,'shinyDugtrio');
assert.equal(core.targetTypeForRoll(0.20,0.010).kind,'diglett');
assert.equal(core.targetTypeForRoll(0.90,0.010).kind,'dugtrio');
assert.deepEqual(core.CONFIG.targetValues,{diglett:1,dugtrio:3,shinyDiglett:5,shinyDugtrio:10});

const fixed=(values)=>{let i=0;return ()=>values[Math.min(i++,values.length-1)];};
const spawnRound=core.createRound();
// socket, species, shiny, lifetime
let target=core.spawnTarget(spawnRound,fixed([0.1,0.9,0.5,0.5]),1000);
assert.equal(target.kind,'dugtrio');
assert.equal(target.points,3);
spawnRound.targets=[];
target=core.spawnTarget(spawnRound,fixed([0.2,0.9,0.005,0.5]),2000);
assert.equal(target.kind,'shinyDugtrio');
assert.equal(target.points,10);

// Landing on a visible target scores even without a launch-time target token.
const diglettRound=core.createRound();
diglettRound.targets.push({socketIndex:0,lane:0,depth:0,token:1,kind:'diglett',speciesId:50,shiny:false,points:1,spawnedAt:0,expiresAt:99999});
const diglettHit=core.resolveThrow(diglettRound,{lane:0.54,depth:0},100);
assert.equal(diglettHit.hit,true,'a visible Ekans/Diglett overlap should score');
assert.equal(diglettHit.target.token,1);
const dugtrioRound=core.createRound();
dugtrioRound.targets.push({socketIndex:1,lane:1,depth:0,token:2,kind:'dugtrio',speciesId:51,shiny:false,points:3,spawnedAt:0,expiresAt:99999});
const dugtrioHit=core.resolveThrow(dugtrioRound,{lane:1.66,depth:0},101);
assert.equal(dugtrioHit.hit,true,'Dugtrio gets a slightly larger collision allowance');
assert.equal(dugtrioHit.target.token,2);
assert.equal(dugtrioHit.basePoints,3);

const overlapRound=core.createRound();
overlapRound.targets.push({socketIndex:0,lane:0,depth:0,token:20,kind:'diglett',speciesId:50,shiny:false,points:1,spawnedAt:0,expiresAt:99999});
overlapRound.targets.push({socketIndex:1,lane:1,depth:0,token:21,kind:'dugtrio',speciesId:51,shiny:false,points:3,spawnedAt:0,expiresAt:99999});
const overlapHit=core.resolveThrow(overlapRound,{lane:0.45,depth:0},110);
assert.equal(overlapHit.target.token,20,'when generous hitboxes overlap, the closest visible target wins');

// Arcade timing stays ruthless: a target that expires before the throw resolves does not score.
const arcadeTimingRound=core.createRound();
arcadeTimingRound.targets.push({socketIndex:4,lane:1,depth:1,token:9,kind:'diglett',speciesId:50,shiny:false,points:1,spawnedAt:0,expiresAt:150});
const tooLate=core.resolveThrow(arcadeTimingRound,{lane:1,depth:1},151);
assert.equal(tooLate.hit,false,'a target may duck away while Ekans is in flight');

class FakeClassList{constructor(){this.items=new Set();}add(...xs){xs.forEach(x=>this.items.add(x));}remove(...xs){xs.forEach(x=>this.items.delete(x));}}
class FakeStyle{constructor(){this.values={};}setProperty(k,v){this.values[k]=String(v);}}
class FakeNode{
  constructor(id=''){this.id=id;this.dataset={};this.classList=new FakeClassList();this.style=new FakeStyle();this.listeners={};this.children=[];this.hidden=false;this.className='';this.textContent='';this.draggable=false;this.src='';this.alt='';}
  addEventListener(type,fn,opts){(this.listeners[type]??=[]).push({fn,opts});}
  dispatch(type,event={}){for(const rec of this.listeners[type]||[])rec.fn({...event,currentTarget:this,target:this,type});}
  appendChild(node){node.parentNode=this;this.children.push(node);return node;}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);}
  querySelectorAll(selector){if(selector==='.ekans-hoop-target')return this.children.filter(x=>String(x.className).includes('ekans-hoop-target'));return [];}
  setAttribute(name,value){this[name]=value;}
  setPointerCapture(){}
}
function makeHarness(){
  const nodes=new Map();
  for(const id of ['ekansHoopLauncher','ekansHoopStage','ekansHoopField','ekansHoopAimMarker','ekansHoopHint','ekansHoopTimer','ekansHoopScore','ekansHoopStreak','ekansHoopMultiplier','ekansHoopTier','ekansHoopPauseOverlay','ekansHoopResume','ekansHoopGame'])nodes.set(id,new FakeNode(id));
  const docListeners={};
  global.document={hidden:false,getElementById:id=>nodes.get(id)||null,createElement:()=>new FakeNode(),querySelectorAll:()=>[],addEventListener:(type,fn,opts)=>{(docListeners[type]??=[]).push({fn,opts});},dispatch(type,event={}){for(const rec of docListeners[type]||[])rec.fn({...event,type,target:this,currentTarget:this});}};
  global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};
  global.LuckyDexEkansHoopCore=core;
  delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
  const game=require('../app/src/main/assets/arcade-ekans-hoop.js');
  game.startRound({countdownMs:0});
  return {game,nodes,document:global.document};
}
{
  const h=makeHarness();
  const launcher=h.nodes.get('ekansHoopLauncher');
  launcher.dispatch('pointerdown',{pointerId:21,pointerType:'touch',clientX:180,clientY:650,preventDefault(){}});
  let snap=h.game.snapshot();
  assert.ok(snap.aim.depth<0,'resting aim should begin below the near row so the first row requires a pull');
  assert.ok(parseFloat(h.nodes.get('ekansHoopAimMarker').style.top)>76,'resting circle should render below the near row');
  h.document.dispatch('pointermove',{pointerId:21,pointerType:'touch',clientX:180,clientY:672,preventDefault(){}});
  snap=h.game.snapshot();
  assert.ok(Math.abs(snap.aim.depth)<0.08,`about 22px of pull should target the near row, got ${snap.aim.depth}`);
  h.document.dispatch('pointerup',{pointerId:21,pointerType:'touch',clientX:180,clientY:672,preventDefault(){}});
  assert.equal(h.game.snapshot().playerAirborne,true,'a deliberate near-row pull must be enough to throw');
}

const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-ekans-hoop.css'),'utf8');
assert.match(css,/\.ekans-hoop-launch-zone\{[^}]*min-height:\s*(?:1[8-9]\d|[2-9]\d{2})px/i,'launch runway preserves enough pull-back room for near-row aiming');

console.log('PASS v0.35.6 Ekans arcade tuning');
