'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ASSETS=path.join(__dirname,'..','app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');

test('Furret arena exposes readable corner chutes, burrows and grass patch layer',()=>{
  const html=read('index.html');
  assert.match(html,/class="furret-chutes"/);
  assert.match(html,/class="furret-patch-layer"/);
  assert.match(html,/class="furret-burrow-layer"/);
});

test('Furret actors are compact and visually buried in grass',()=>{
  const css=read('arcade-furret-frolic.css');
  assert.match(css,/\.furret-player\{[^}]*width:44px;[^}]*height:50px/s);
  assert.match(css,/\.furret-player::after\{[^}]*content:"";[^}]*background:/s);
  assert.match(css,/\.furret-burrow/);
});

test('ready copy teaches zone lock, release return and A-only ball control',()=>{
  const html=read('index.html');
  assert.match(html,/Hold a direction to lock into a grass patch/i);
  assert.match(html,/Only A can hit a ball/i);
});
