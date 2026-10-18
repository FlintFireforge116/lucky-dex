'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=n=>fs.readFileSync(path.join(ASSETS,n),'utf8');
const core=require(path.join(ASSETS,'arcade-pichu-power-plant-core.js'));

test('Pichu Power Plant gives the human more charge per correct one-thumb zap than CPUs',()=>{
  assert.ok(core.CONFIG.playerCorrectCharge>core.CONFIG.cpuCorrectCharge,
    'human correct zap should be worth more than CPU correct zap');
  assert.ok(core.CONFIG.playerCorrectCharge>=7,
    'human should need roughly half as many taps as the original 4-charge tuning');
  const match=core.createMatch({difficulty:'normal',rng:()=>0,nowMs:0});
  core.setPlayerDirection(match,match.player.signal.direction,true);
  core.pressPlayer(match,match.player.signal.button,10);
  assert.equal(match.player.charge,core.CONFIG.playerCorrectCharge);
});

test('Pichu Power Plant CPU cadence is relaxed for a one-thumb player race',()=>{
  assert.ok(core.DIFFICULTIES.easy.zapMinMs>=330);
  assert.ok(core.DIFFICULTIES.normal.zapMinMs>=250);
  assert.ok(core.DIFFICULTIES.hard.zapMinMs>=180);
  assert.ok(core.DIFFICULTIES.easy.reactionMinMs>=430);
  assert.ok(core.DIFFICULTIES.normal.reactionMinMs>=320);
  assert.ok(core.DIFFICULTIES.hard.reactionMinMs>=220);
});

test('Pichu Power Plant layout puts three compact CPUs across the top and the human large below',()=>{
  const css=read('arcade-pichu-power-plant.css');
  assert.match(css,/grid-template-areas:\s*"cpu1 cpu2 cpu3"\s*"you you you"/);
  assert.match(css,/#pichuPowerPlantPlayer0\s*\{[^}]*grid-area:you/);
  assert.match(css,/#pichuPowerPlantPlayer1\s*\{[^}]*grid-area:cpu1/);
  assert.match(css,/#pichuPowerPlantPlayer2\s*\{[^}]*grid-area:cpu2/);
  assert.match(css,/#pichuPowerPlantPlayer3\s*\{[^}]*grid-area:cpu3/);
  assert.match(css,/#pichuPowerPlantPlayer0\s*\{[^}]*min-height:\s*2\d\dpx/);
  assert.match(css,/#pichuPowerPlantPlayer[123]/);
});
