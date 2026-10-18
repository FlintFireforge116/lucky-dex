'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');

class FakeClassList{
  constructor(){this.items=new Set();}
  add(...xs){xs.forEach(x=>this.items.add(x));}
  remove(...xs){xs.forEach(x=>this.items.delete(x));}
  contains(x){return this.items.has(x);}
}
class FakeStyle{
  constructor(){this.values={};}
  setProperty(k,v){this.values[k]=String(v);}
}
class FakeNode{
  constructor(id=''){
    this.id=id;this.dataset={};this.classList=new FakeClassList();this.style=new FakeStyle();this.listeners={};this.children=[];this.hidden=false;
    this.className='';this.textContent='';this.draggable=false;this.src='';this.alt='';
  }
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  dispatch(type,event={}){for(const fn of this.listeners[type]||[])fn({...event,currentTarget:this,target:this,type});}
  appendChild(node){node.parentNode=this;this.children.push(node);return node;}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);}
  querySelectorAll(selector){
    if(selector==='.ekans-hoop-target')return this.children.filter(x=>String(x.className).includes('ekans-hoop-target'));
    return [];
  }
  setAttribute(name,value){this[name]=value;}
  getBoundingClientRect(){return {left:20,top:180,width:320,height:360,right:340,bottom:540,x:20,y:180};}
  setPointerCapture(){throw new Error('pointer capture unavailable');}
}

const nodes=new Map();
for(const id of ['ekansHoopLauncher','ekansHoopStage','ekansHoopField','ekansHoopAimMarker','ekansHoopHint','ekansHoopTimer','ekansHoopScore','ekansHoopStreak','ekansHoopMultiplier','ekansHoopTier','ekansHoopPauseOverlay','ekansHoopResume','ekansHoopGame'])nodes.set(id,new FakeNode(id));
const docListeners={};
global.document={
  hidden:false,
  getElementById:id=>nodes.get(id)||null,
  createElement:()=>new FakeNode(),
  querySelectorAll:()=>[],
  addEventListener:(type,fn)=>{(docListeners[type]??=[]).push(fn);},
  dispatch(type,event={}){for(const fn of docListeners[type]||[])fn({...event,type,target:this,currentTarget:this});}
};
global.requestAnimationFrame=()=>1;
global.cancelAnimationFrame=()=>{};
global.LuckyDexEkansHoopCore=require('../app/src/main/assets/arcade-ekans-hoop-core.js');
delete require.cache[require.resolve('../app/src/main/assets/arcade-ekans-hoop.js')];
const game=require('../app/src/main/assets/arcade-ekans-hoop.js');

game.startRound({countdownMs:0});
const launcher=nodes.get('ekansHoopLauncher');
launcher.dispatch('pointerdown',{pointerId:7,pointerType:'touch',clientX:180,clientY:650,preventDefault(){}});
assert.equal(game.snapshot().dragging,true,'touch begins a drag even when pointer capture is unavailable');

document.dispatch('pointermove',{pointerId:7,pointerType:'touch',clientX:82,clientY:800,preventDefault(){}});
let snap=game.snapshot();
assert.ok(snap.aim.lane>1.5,`pulling down-left should aim right, got lane ${snap.aim.lane}`);
assert.ok(snap.aim.depth>1.4,`pulling farther back should reach far targets, got depth ${snap.aim.depth}`);

document.dispatch('pointerup',{pointerId:7,pointerType:'touch',clientX:82,clientY:800,preventDefault(){}});
snap=game.snapshot();
assert.equal(snap.dragging,false,'document-level release ends the drag');
assert.equal(snap.playerAirborne,true,'release throws Ekans even when pointer capture was unavailable');

const html=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/index.html'),'utf8');
assert.match(html,/PULL BACK · RELEASE TO THROW/,'on-screen hint explains the pull-back slingshot gesture');
assert.match(html,/pull back like a slingshot, then release to throw/i,'launcher accessibility label matches the slingshot gesture');

console.log('PASS v0.35.2 Ekans touch capture fallback under slingshot controls');
