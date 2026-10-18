const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('settings include Gold Rock and Fossil Dig card/booster rare odds with vanilla values',()=>{
  const html=read('app/src/main/assets/index.html');
  for(const [id,label,vanilla] of [
    ['rareGoldRockOddsSelect','Gold Rock','0.10'],
    ['rareFossilCardOddsSelect','Fossil Dig card','0.15'],
    ['rareFossilPackOddsSelect','Fossil Dig booster','0.04'],
  ]){
    assert.ok(html.includes(`id="${id}"`),`${label} selector missing`);
    assert.match(html,new RegExp(`${label}[\\s\\S]{0,500}value="${vanilla.replace('.','\\.')}"[^>]*>Vanilla`, 'i'));
  }
});

test('default state and settings binding persist the three new odds',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(app,/rareOdds:\{[^}]*goldRock:\.10[^}]*fossilCard:\.15[^}]*fossilPack:\.04/s);
  assert.match(app,/rareGoldRockOddsSelect:'goldRock'/);
  assert.match(app,/rareFossilCardOddsSelect:'fossilCard'/);
  assert.match(app,/rareFossilPackOddsSelect:'fossilPack'/);
});

test('Rock Harden round accepts a configurable gold chance while preserving 10 percent default',()=>{
  const core=require(path.join(ROOT,'app/src/main/assets/arcade-rock-harden-core.js'));
  assert.equal(core.CONFIG.goldRoundChance,0.10);
  const never=core.createRound({difficulty:'normal',rng:()=>0,nowMs:0,goldRoundChance:0});
  assert.equal(never.gold.present,false);
  const always=core.createRound({difficulty:'normal',rng:()=>0.99,nowMs:0,goldRoundChance:1});
  assert.equal(always.gold.present,true);
});

test('Fossil Dig site accepts configurable card and booster chances while preserving vanilla constants',()=>{
  const core=require(path.join(ROOT,'app/src/main/assets/arcade-fossil-museum-core.js'));
  assert.equal(core.BURIED_CARD_SITE_CHANCE,0.15);
  assert.equal(core.BURIED_BOOSTER_SITE_CHANCE,0.04);
  const catalogue=core.CATALOGUE;
  const none=core.generateDigSite({rng:()=>0,minFinds:1,maxFinds:1,catalogue,buriedCardChance:0,buriedBoosterChance:0});
  assert.equal(none.finds.some(f=>f.itemId==='tcg-card'),false);
  assert.equal(none.finds.some(f=>f.itemId==='tcg-booster'),false);
  const forced=core.generateDigSite({rng:()=>0,minFinds:3,maxFinds:3,catalogue,buriedCardChance:1,buriedBoosterChance:1});
  assert.equal(forced.finds.some(f=>f.itemId==='tcg-card'),true);
  assert.equal(forced.finds.some(f=>f.itemId==='tcg-booster'),true);
});

test('runtime passes saved odds into Rock Harden and Fossil Dig generators',()=>{
  const rock=read('app/src/main/assets/arcade-rock-harden.js');
  const fossil=read('app/src/main/assets/arcade-fossil-museum.js');
  assert.match(rock,/goldRoundChance\s*:\s*rareOdds\(\)\.goldRock/);
  assert.match(fossil,/buriedCardChance\s*:\s*rareOdds\(\)\.fossilCard/);
  assert.match(fossil,/buriedBoosterChance\s*:\s*rareOdds\(\)\.fossilPack/);
});
