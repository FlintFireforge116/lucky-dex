'use strict';
const assert=require('node:assert/strict');
const core=require('../app/src/main/assets/arcade-ekans-hoop-core.js');
class FakeClassList{constructor(){this.items=new Set();}add(...xs){xs.forEach(x=>this.items.add(x));}remove(...xs){xs.forEach(x=>this.items.delete(x));}toggle(x,on){if(on)this.items.add(x);else this.items.delete(x);return !!on;}}
class FakeStyle{constructor(){this.values={};}setProperty(k,v){this.values[k]=String(v);}}
class FakeNode{
  constructor(id=''){this.id=id;this.dataset={};this.classList=new FakeClassList();this.style=new FakeStyle();this.listeners={};this.children=[];this.hidden=false;this.className='';this.textContent='';this.attributes={};}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);} dispatch(type,event={}){for(const fn of this.listeners[type]||[])fn({...event,currentTarget:this,target:this,type});}
  appendChild(n){n.parentNode=this;this.children.push(n);return n;} remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);}
  querySelectorAll(sel){if(sel==='.ekans-hoop-target')return this.children.filter(x=>String(x.className).includes('ekans-hoop-target'));return [];}
  setAttribute(k,v){this.attributes[k]=String(v);} setPointerCapture(){}
}
const nodes=new Map();
for(const id of ['ekansHoopGame','ekansHoopStage','ekansHoopField','ekansHoopAimMarker','ekansHoopHint','ekansHoopTimer','ekansHoopScore','ekansHoopStreak','ekansHoopMultiplier','ekansHoopTier','ekansHoopPauseOverlay','ekansHoopResume','ekansHoopReady','ekansHoopReadyMeta','ekansHoopStart','ekansHoopLauncher','ekansHoopCountdown'])nodes.set(id,new FakeNode(id));
const difficultyButtons=['easy','normal','hard'].map(key=>{const n=new FakeNode();n.dataset.ekansDifficulty=key;return n;});
const docListeners={};
global.document={hidden:false,getElementById:id=>nodes.get(id)||null,createElement:()=>new FakeNode(),querySelectorAll:sel=>sel==='[data-ekans-difficulty]'?difficultyButtons:[],addEventListener:(type,fn)=>{(docListeners[type]??=[]).push(fn);}};
global.requestAnimationFrame=()=>1;global.cancelAnimationFrame=()=>{};global.LuckyDexEkansHoopCore=core;
global.LuckyDexArcadeSession={mount(){},update(){}};
delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
const game=require('../app/src/main/assets/arcade-ekans-hoop.js');
game.open();
assert.equal(game.snapshot().phase,'idle');
assert.equal(nodes.get('ekansHoopReady').hidden,false);
assert.equal(nodes.get('ekansHoopLauncher').hidden,true);
assert.equal(nodes.get('ekansHoopTimer').textContent,'60');

difficultyButtons[2].dispatch('click');
assert.equal(game.snapshot().difficulty,'hard');
assert.equal(nodes.get('ekansHoopTimer').textContent,'50');
assert.equal(difficultyButtons[2].attributes['aria-pressed'],'true');

nodes.get('ekansHoopStart').dispatch('click');
const started=game.snapshot();
assert.ok(['countdown','playing'].includes(started.phase));
assert.equal(started.difficulty,'hard');
assert.equal(nodes.get('ekansHoopReady').hidden,true);
assert.equal(nodes.get('ekansHoopLauncher').hidden,true,'launcher stays hidden during the start countdown');
assert.equal(started.targets.length,0,'targets do not spawn until the countdown ends');
assert.equal(nodes.get('ekansHoopCountdown').hidden,false);
console.log('PASS v0.35.7 Ekans START UI flow with pre-spawn countdown');
