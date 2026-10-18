const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Golden Target is unmistakable and promises a real prize',()=>{
  const js=read('app/src/main/assets/arcade-power-trial.js');
  const css=read('app/src/main/assets/arcade-power-trial.css');
  assert.match(js,/GOLDEN TARGET/);
  assert.match(js,/BREAK IT FOR A PRIZE/);
  assert.match(js,/powerTrialGoldenPrize/);
  assert.match(css,/powertrial-golden[^}]*animation:/);
});

test('Golden Target reward uses the shared arcade prize system and is shown on results',()=>{
  const js=read('app/src/main/assets/arcade-power-trial.js');
  assert.match(js,/LuckyDexVoltorbGiftCore/);
  assert.match(js,/rewardForRoll/);
  assert.match(js,/LuckyDexRareRewardBridge/);
  assert.match(js,/resolveArcadeReward/);
  assert.match(js,/grantReward/);
  assert.match(js,/rewardReveal/);
  assert.match(js,/rewardReveals:/);
  assert.match(js,/Golden Target Prize/);
});

test('Power Trial no longer uses the mushroom-like rock prop asset',()=>{
  const core=read('app/src/main/assets/arcade-power-trial-core.js');
  assert.doesNotMatch(core,/rock-prop\.png/);
  assert.match(core,/route-rock\.png|cave-rock\.png|strength_boulder\.png/);
});

test('Pokemon picker scales with search sort and pagination',()=>{
  const js=read('app/src/main/assets/arcade-power-trial.js');
  assert.match(js,/id="powerTrialSearch"/);
  assert.match(js,/id="powerTrialSort"/);
  assert.match(js,/id="powerTrialPrev"/);
  assert.match(js,/id="powerTrialNext"/);
  assert.match(js,/id="powerTrialPage"/);
  assert.match(js,/PICKER_PAGE_SIZE=6/);
});

test('game UI disables browser text selection and long press callout',()=>{
  const css=read('app/src/main/assets/arcade-power-trial.css');
  assert.match(css,/\.powertrial-shell[^}]*user-select:none/);
  assert.match(css,/\.powertrial-shell[^}]*-webkit-user-select:none/);
  assert.match(css,/\.powertrial-shell[^}]*-webkit-touch-callout:none/);
});


test('charge visual crosses the white centre line exactly at peak power',()=>{
  const core=require(path.join(root,'app/src/main/assets/arcade-power-trial-core.js'));
  const p=core.difficultyProfile('normal');
  assert.equal(core.chargePosition(0,p),0);
  assert.ok(Math.abs(core.chargePosition(p.chargePeakMs,p)-.5)<.001);
  assert.ok(core.chargeQuality(p.chargePeakMs,p)>.99);
  assert.ok(core.chargePosition(p.maxChargeMs,p)>.99);
  assert.ok(core.chargeQuality(p.maxChargeMs,p)<.01);
});

test('charge and impact bars expose numerical values',()=>{
  const js=read('app/src/main/assets/arcade-power-trial.js');
  assert.match(js,/id="powerTrialChargeValue"/);
  assert.match(js,/id="powerTrialImpactValue"/);
  assert.match(js,/powerTrialChargeValue.*textContent/s);
  assert.match(js,/powerTrialImpactValue.*textContent/s);
});

test('stored reviews do not show a fake plus zero Lucky Coins banner',()=>{
  const session=read('app/src/main/assets/arcade-session.js');
  assert.match(session,/arcadeResultCoins[^\n]+hidden=!!readOnly/);
});

test('current release identity is aligned',require('./helpers/current-target-range-release.cjs'));
