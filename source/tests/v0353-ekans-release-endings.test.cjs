'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');

class FakeClassList{constructor(){this.items=new Set();}add(...xs){xs.forEach(x=>this.items.add(x));}remove(...xs){xs.forEach(x=>this.items.delete(x));}contains(x){return this.items.has(x);}}
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
  global.LuckyDexEkansHoopCore=require('../app/src/main/assets/arcade-ekans-hoop-core.js');
  delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
  const game=require('../app/src/main/assets/arcade-ekans-hoop.js');
  game.startRound({countdownMs:0});
  return {game,nodes,document:global.document};
}
function drag(h,pointerId=4){
  const launcher=h.nodes.get('ekansHoopLauncher');
  launcher.dispatch('pointerdown',{pointerId,pointerType:'touch',clientX:180,clientY:650,preventDefault(){}});
  h.document.dispatch('pointermove',{pointerId,pointerType:'touch',clientX:125,clientY:760,preventDefault(){}});
  const snap=h.game.snapshot();
  assert.equal(snap.dragging,true);
  assert.ok(snap.aim.depth>1,'pulling back moves the circle into the field while finger remains down');
  return snap.aim;
}

{
  const h=makeHarness();
  const aimed=drag(h,4);
  h.document.dispatch('pointercancel',{pointerId:4,pointerType:'touch',clientX:125,clientY:760,preventDefault(){}});
  const snap=h.game.snapshot();
  assert.equal(snap.dragging,false,'Android pointer cancellation ends aiming');
  assert.equal(snap.playerAirborne,true,'Android pointer cancellation after a deliberate drag commits the throw');
  assert.deepEqual(snap.aim,aimed,'the throw preserves the last visible target-circle position');
}

{
  const h=makeHarness();
  const aimed=drag(h,8);
  h.document.dispatch('touchend',{changedTouches:[{clientX:125,clientY:760}],preventDefault(){}});
  const snap=h.game.snapshot();
  assert.equal(snap.dragging,false,'touchend fallback ends aiming when pointerup is missing');
  assert.equal(snap.playerAirborne,true,'touchend fallback commits the throw');
  assert.deepEqual(snap.aim,aimed,'touchend fallback uses the already-visible target position');
}

const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-ekans-hoop.css'),'utf8');
assert.doesNotMatch(css,/\.ekans-hoop-launcher\{[^}]*transform:/,'Ekans remains planted while the target circle moves');
console.log('PASS v0.35.3 Ekans release endings and planted launcher');
