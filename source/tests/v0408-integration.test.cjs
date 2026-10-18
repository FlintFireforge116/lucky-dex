'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('settings expose every jackpot odds control and clearly identify vanilla values',()=>{
  const html=read('app/src/main/assets/index.html');
  for(const id of ['rareBerryOddsSelect','rareUnownOddsSelect','rareTileCardOddsSelect','rareTilePackOddsSelect','rareTilePresentOddsSelect']) assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/Golden Berry[\s\S]{0,400}Vanilla[^<]*3%/);
  assert.match(html,/Shiny Unown[\s\S]{0,400}Vanilla[^<]*(?:1\/250|0\.4%)/);
  assert.match(html,/Tile Puzzle card[\s\S]{0,400}Vanilla[^<]*(?:1\/250|0\.4%)/);
  assert.match(html,/Tile Puzzle pack[\s\S]{0,400}Vanilla[^<]*(?:1\/250|0\.4%)/);
  assert.match(html,/Tile Puzzle present[\s\S]{0,400}Vanilla[^<]*1\.8%/);
  assert.match(html,/Lucky Dex \(Vanilla\) · 1\/2048/);
});

test('saved state has vanilla rare odds and runtime forwards them to all three rare systems',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  const amie=read('app/src/main/assets/arcade-amie.js');
  const unown=read('app/src/main/assets/arcade-unown.js');
  assert.match(app,/rareOdds:\{berry:\.03,unown:\.004,tileCard:\.004,tilePack:\.004,tilePresent:\.018(?:,voltorbGift:\.02)?(?:,goldRock:\.10,fossilCard:\.15,fossilPack:\.04)?\}/);
  assert.match(app,/state\.settings\.rareOdds=\{\.\.\.defaultState\.settings\.rareOdds,\.\.\.\(state\.settings\.rareOdds\|\|\{\}\)\}/);
  assert.match(amie,/createBerryRunSpecial\?\.\(Math\.random,rareOdds\(\)\.berry\)/);
  assert.match(amie,/rates:\{card:rareOdds\(\)\.tileCard,pack:rareOdds\(\)\.tilePack,gift:rareOdds\(\)\.tilePresent\}/);
  assert.match(unown,/createUnownShiny\?\.\(entry\.answer,Math\.random,rareOdds\(\)\.unown\)/);
});

test('Berry Picker renders the live jackpot as a Golden Berry mystery rather than the hidden prize',()=>{
  const js=read('app/src/main/assets/arcade-amie.js');
  const css=read('app/src/main/assets/arcade-amie.css');
  assert.match(js,/golden-berry/);
  assert.match(js,/GOLDEN BERRY/);
  assert.doesNotMatch(js,/active&&reward\.image\?reward\.image:base\.image/);
  assert.match(css,/brightness\(0\)[^}]*golden|golden-berry[^}]*filter:/i);
  assert.match(js,/rewardReveals/);
});

test('Unown hides Cash Out until there is a bank and vertically fits multi-word glyph rows',()=>{
  const js=read('app/src/main/assets/arcade-unown.js');
  const css=read('app/src/main/assets/arcade.css');
  assert.match(js,/cash\.hidden=!canCash/);
  assert.match(js,/const canCash=game\.phase==='between'&&game\.bank>0/);
  assert.match(js,/verticalSize/);
  assert.match(css,/\.unown-actions\{grid-template-columns:1fr\}/);
  assert.match(css,/\.unown-actions\.cash-available\{grid-template-columns:1fr 1\.35fr\}/);
});
