'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.join(__dirname,'..','app','src','main','assets','arcade-pichu-power-plant-core.js'));

test('Pichu player charge returns to the original four percent per correct zap',()=>{
  assert.equal(core.CONFIG.playerCorrectCharge,4);
  assert.equal(core.CONFIG.cpuCorrectCharge,4);
  const match=core.createMatch({difficulty:'normal',rng:()=>0,nowMs:0});
  core.setPlayerDirection(match,match.player.signal.direction,true);
  core.pressPlayer(match,match.player.signal.button,10);
  assert.equal(match.player.charge,4);
});

test('Pichu difficulty is created by fallible slower CPUs instead of a human charge bonus',()=>{
  for(const key of ['easy','normal','hard']){
    const p=core.DIFFICULTIES[key];
    assert.ok(p.errorChance>0);
    assert.ok(p.hesitationChance>0);
    assert.ok(p.zapMinMs>=260,`${key} CPU zap cadence should leave one-thumb breathing room`);
  }
  assert.ok(core.DIFFICULTIES.easy.errorChance>core.DIFFICULTIES.normal.errorChance);
  assert.ok(core.DIFFICULTIES.normal.errorChance>core.DIFFICULTIES.hard.errorChance);
  assert.ok(core.DIFFICULTIES.easy.zapMinMs>core.DIFFICULTIES.normal.zapMinMs);
  assert.ok(core.DIFFICULTIES.normal.zapMinMs>core.DIFFICULTIES.hard.zapMinMs);
});
