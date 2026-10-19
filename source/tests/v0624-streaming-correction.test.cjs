'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const core=require(path.join(ROOT,'app/src/main/assets/arcade-streaming-stampede-core.js'));
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
function sequence(values){let i=0;return()=>values[i++%values.length];}

test('Streaming Stampede can correct accidental counts without going below zero',()=>{
  assert.equal(typeof core.decrementCount,'function','expected a decrementCount core action');
  const match=core.createMatch({difficulty:'normal',rng:sequence([.2,.4,.6,.8])});
  core.beginRound(match,0,1000);
  core.pressCount(match);core.pressCount(match);
  assert.deepEqual(core.decrementCount(match),{accepted:true,count:1});
  assert.deepEqual(core.decrementCount(match),{accepted:true,count:0});
  assert.deepEqual(core.decrementCount(match),{accepted:false,count:0});
  core.beginEntryWindow(match,7000);
  core.pressCount(match);
  assert.deepEqual(core.decrementCount(match),{accepted:true,count:0});
  core.revealRound(match,8000,sequence([.2,.4,.6,.8]));
  assert.equal(core.decrementCount(match).accepted,false);
});

test('Streaming Stampede exposes a separate mobile correction button and B keyboard input',()=>{
  const html=read('app/src/main/assets/index.html');
  const js=read('app/src/main/assets/arcade-streaming-stampede.js');
  assert.match(html,/id="streamingStampedeMinus"[^>]*>−1<small>CORRECT<\/small>/);
  assert.match(js,/function decrement\(/);
  assert.match(js,/streamingStampedeMinus/);
  assert.match(js,/k==='b'/);
});
