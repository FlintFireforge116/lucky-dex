'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Tile Puzzle loads shared rare reward/core helpers before the game runtime',()=>{
  const html=read('app/src/main/assets/index.html');
  const rare=html.indexOf('arcade-rare-rewards.js'),core=html.indexOf('arcade-tile-puzzle-core.js'),amie=html.indexOf('arcade-amie.js');
  assert(rare>0&&core>rare&&amie>core);
});

test('Tile Puzzle exposes a landscape control and phone-landscape layout',()=>{
  const html=read('app/src/main/assets/index.html'),css=read('app/src/main/assets/arcade-amie.css'),js=read('app/src/main/assets/arcade-amie.js');
  assert.match(html,/id="tilePuzzleLandscapeBtn"/);
  assert.match(css,/@media\s*\(orientation:landscape\)[^{]*\{[\s\S]*?#tilePuzzleGame/s);
  assert.match(js,/tilePuzzleLandscapeBtn/);
  assert.match(js,/setOrientation|orientation\.lock/);
});

test('Tile Puzzle persists one attempt, resolves exact card or pack rewards, and only pays discovered presents on completion',()=>{
  const js=read('app/src/main/assets/arcade-amie.js');
  assert.match(js,/LuckyDexArcadeRareRewards/);
  assert.match(js,/getOrCreateAttempt/);
  assert.match(js,/resolveTileReward/);
  assert.match(js,/claimAttempt/);
  assert.match(js,/revealGift/);
  assert.match(js,/gift\??\.revealed/);
});

test('known visually repetitive scene/mode combinations are excluded from Tile Puzzle selection',()=>{
  const scenes=require('../app/src/main/assets/arcade-tile-scenes-v0253.js');
  const ruins=scenes.find(x=>x.id==='ruins-of-alph');
  const celadon=scenes.find(x=>x.id==='celadon-game-corner');
  const indigo=scenes.find(x=>x.id==='indigo-plateau');
  assert.deepEqual(ruins.excludeModes,['easy','normal','hard']);
  assert(celadon.excludeModes.includes('hard'));
  assert(indigo.excludeModes.includes('hard'));
});
