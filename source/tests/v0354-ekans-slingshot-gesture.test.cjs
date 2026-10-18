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
function down(h,id=11){
  h.nodes.get('ekansHoopLauncher').dispatch('pointerdown',{pointerId:id,pointerType:'touch',clientX:180,clientY:650,preventDefault(){}});
}

{
  const h=makeHarness();
  down(h,11);
  h.document.dispatch('pointermove',{pointerId:11,pointerType:'touch',clientX:120,clientY:725,preventDefault(){}});
  let snap=h.game.snapshot();
  assert.ok(snap.aim.depth>0.8,`pulling down/back should move the circle forward into the field, got depth ${snap.aim.depth}`);
  assert.ok(snap.aim.lane>1.4,`pulling down-left should aim up-right, got lane ${snap.aim.lane}`);
  const marker=h.nodes.get('ekansHoopAimMarker');
  assert.ok(parseFloat(marker.style.top)<70,`target circle should visibly move upward on the board, got top ${marker.style.top}`);
  assert.ok(parseFloat(marker.style.left)>50,`target circle should visibly move right when pulling left, got left ${marker.style.left}`);

  h.document.dispatch('pointermove',{pointerId:11,pointerType:'touch',clientX:90,clientY:810,preventDefault(){}});
  snap=h.game.snapshot();
  assert.ok(snap.aim.depth>1.8,`a deeper pull should reach the far row, got depth ${snap.aim.depth}`);
  assert.ok(snap.aim.lane>1.8,`a stronger left pull should reach the right lane, got lane ${snap.aim.lane}`);
  const aimed={...snap.aim};
  h.document.dispatch('pointerup',{pointerId:11,pointerType:'touch',clientX:90,clientY:810,preventDefault(){}});
  snap=h.game.snapshot();
  assert.equal(snap.playerAirborne,true,'releasing a pulled-back slingshot launches Ekans');
  assert.deepEqual(snap.aim,aimed,'release launches at the target circle that was visible while held');
}

{
  const h=makeHarness();
  down(h,12);
  h.document.dispatch('pointermove',{pointerId:12,pointerType:'touch',clientX:250,clientY:760,preventDefault(){}});
  const snap=h.game.snapshot();
  assert.ok(snap.aim.depth>1.2,'pulling farther back increases throw distance');
  assert.ok(snap.aim.lane<0.5,`pulling down-right should aim up-left, got lane ${snap.aim.lane}`);
}

{
  const h=makeHarness();
  down(h,13);
  h.document.dispatch('pointermove',{pointerId:13,pointerType:'touch',clientX:180,clientY:520,preventDefault(){}});
  let snap=h.game.snapshot();
  assert.ok(snap.aim.depth<0,'flicking forward/up leaves the aim at its below-near-row resting position');
  h.document.dispatch('pointerup',{pointerId:13,pointerType:'touch',clientX:180,clientY:520,preventDefault(){}});
  snap=h.game.snapshot();
  assert.equal(snap.playerAirborne,false,'a forward flick must not throw Ekans');
}

const html=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8');
assert.match(html,/PULL BACK · RELEASE TO THROW/,'on-screen hint teaches the slingshot gesture');
assert.match(html,/pull back like a slingshot/i,'launcher accessibility label describes the slingshot gesture');

console.log('PASS v0.35.4 Ekans pull-back slingshot aiming');
