'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-amie.js'),'utf8');

const match=js.match(/function loadedImage\(url,onload\)\{[\s\S]*?return im;\n\}/);
assert.ok(match,'Tile Puzzle loadedImage helper must exist');

class AlreadyLoadedImage{
  constructor(){this.complete=true;this.naturalWidth=640;this.naturalHeight=384;}
  set src(value){this._src=value;}
  get src(){return this._src;}
  addEventListener(){}
}

const makeLoadedImage=new Function('Image','queueMicrotask',`const imageCache=new Map();${match[0]};return loadedImage;`);
const loadedImage=makeLoadedImage(AlreadyLoadedImage,queueMicrotask);
let assignmentFinished=false;
let callbackSawAssignment=null;
const image=loadedImage('scene.png',()=>{callbackSawAssignment=assignmentFinished;});
assignmentFinished=true;
assert.equal(image.naturalWidth,640,'test image should simulate an already-cached scene');

setImmediate(()=>{
  assert.equal(callbackSawAssignment,true,'cached scene repaint must run after caller assignment, otherwise the reference captures a blank canvas after difficulty changes');
  assert.doesNotMatch(js,/if\(im\.complete&&im\.naturalWidth\)onload\?\.\(\)/,'cached scene callback must not be synchronous');
  console.log('PASS v0.28.2 Tile Puzzle difficulty-change reference regression');
});
