'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');
const sessionSource=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-session.js'),'utf8');
const ballSource=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-ball-drop.js'),'utf8');
const fossilSource=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-fossil-museum.js'),'utf8');
const session=require('../app/src/main/assets/arcade-session.js');

assert.match(html,/id="arcadeResultCardReveal"/,'shared Arcade result sheet should contain a card reveal stage');
assert.match(html,/id="arcadeResultRevealImage"/,'card reveal stage should display real card artwork');
assert.match(html,/id="arcadeResultRevealNext"/,'multiple card wins need a next/continue control');
assert.match(css,/\.arcade-card-reveal-stage/,'shared card reveal needs pack-like visual styling');
assert.match(sessionSource,/cardReveals/,'Arcade session should understand card reveal payloads');

const model=session.resultModel({cardReveals:[
  {id:'a',name:'Alpha ex',image:'cards/a.png',setName:'Set A',rarity:'Ultra Rare'},
  {id:'b',name:'Beta',image:'cards/b.png',setName:'Set B',rarity:'Rare'}
]});
assert.equal(model.cardReveals.length,2,'result model should preserve multiple card wins');
assert.deepEqual(model.cardReveals[0],{id:'a',name:'Alpha ex',image:'cards/a.png',setName:'Set A',rarity:'Ultra Rare'});

assert.match(ballSource,/cardReveals:model\.cardReveals/,'Ball Drop completion should hand won cards to the shared reveal stage');
assert.match(fossilSource,/cardReveals/,'Fossil Dig should collect won cards for the shared reveal stage');
assert.match(fossilSource,/showResult\?\.\('fossil',[\s\S]*cardReveals/,'Fossil Dig result should pass recovered cards to the reveal stage');

console.log('PASS v0.27.4 shared end-of-minigame card reveal contract');
