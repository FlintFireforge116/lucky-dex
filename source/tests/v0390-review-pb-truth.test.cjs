'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>fs.readFileSync('app/src/main/assets/'+f,'utf8');
const ball=read('arcade-ball-drop.js'),rock=read('arcade-rock-harden.js'),clefairy=read('clefairy-memory.js');

assert.match(ball,/const\s+previousBest\s*=.*?bestBallDrop/s,'Ball Drop captures the PB before updating it');
assert.match(ball,/isNew\s*:\s*Number\(model\.score\|\|0\)\s*>\s*previousBest/s,'Ball Drop marks only strict PB improvements as new');

assert.match(rock,/previousBestScore/s,'Rock captures the difficulty PB before record mutation');
assert.match(rock,/previousBestPerfects/s,'Rock captures the Perfect PB before record mutation');
assert.match(rock,/isNew\s*:\s*Number\(score\)\s*>\s*previousBestScore/s,'Rock score ties are not new records');
assert.match(rock,/isNew\s*:\s*Number\(perfects\)\s*>\s*previousBestPerfects/s,'Rock Perfect ties are not new records');

assert.match(clefairy,/const\s+previousBest\s*=.*?bestMemory/s,'Clefairy captures its PB before updateBest');
assert.match(clefairy,/isNew\s*:\s*completed\s*>\s*previousBest/s,'Clefairy failure ties are not new records');
assert.match(clefairy,/isNew\s*:\s*current\.round\s*>\s*previousBest/s,'Clefairy cash-out ties are not new records');
console.log('PASS v0.39.0 review PB truth');
