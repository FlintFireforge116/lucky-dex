const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const core=require(path.join(ROOT,'app/src/main/assets/arcade-roulette-core.js'));

test('wheel presentation order interleaves species instead of grouping three together',()=>{
  assert.equal(core.WHEEL_SLOTS.length,12);
  assert.equal(new Set(core.WHEEL_SLOTS.map(s=>s.key)).size,12);
  for(let i=1;i<core.WHEEL_SLOTS.length;i++)assert.notEqual(core.WHEEL_SLOTS[i-1].pokemonKey,core.WHEEL_SLOTS[i].pokemonKey);
});

test('golden ball is a rare per-spin outcome independent of the landing slot',()=>{
  const rolls=[0.01,0.75];let i=0;
  const result=core.resolveSpin(core.createRound(),{kind:'color',color:'yellow'},{goldenRate:1,random:()=>rolls[i++]??0.5});
  assert.equal(result.golden,true);
  assert.ok(result.slot);
  assert.equal(core.goldenPrizeForStake(25),250);
  assert.equal(core.goldenPrizeForStake(75),750);
  assert.equal(core.goldenPrizeForStake(150),1500);
});

test('roulette stacks the wheel above the full betting mat on phones and gives the wheel more room',()=>{
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(css,/@media\(max-width:680px\)[\s\S]*\.roulette-stage\{[^}]*grid-template-columns:1fr/);
  assert.match(css,/@media\(max-width:680px\)[\s\S]*\.roulette-wheel\{[^}]*max-width:(?:330|340|350|360)px/);
});

test('wheel rotor spins for a longer animation while the ball resolves separately',()=>{
  const html=read('app/src/main/assets/index.html');
  const js=read('app/src/main/assets/arcade-roulette.js');
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(html,/id="rouletteWheelRotor"/);
  assert.match(js,/rouletteWheelRotor/);
  assert.match(js,/spinTimer=setTimeout\([\s\S]*?\},3200\)/);
  assert.match(css,/\.roulette-wheel-rotor\.spinning/);
});

test('wheel pokemon sprites are unframed and board highlights every live cell covered by a group bet',()=>{
  const js=read('app/src/main/assets/arcade-roulette.js');
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(js,/bet-covered/);
  assert.match(css,/\.roulette-wheel-icon\{[^}]*background:transparent[^}]*border:0/);
  assert.match(css,/\.roulette-cell\.bet-covered/);
});

test('golden ball is testable, recorded and has a hidden achievement',()=>{
  const html=read('app/src/main/assets/index.html');
  const app=read('app/src/main/assets/app-v0167.js');
  const platform=read('app/src/main/assets/arcade-platform.js');
  const records=read('app/src/main/assets/arcade-records.js');
  const achievements=read('app/src/main/assets/achievements-v0341.js');
  assert.match(html,/rareRouletteGoldenBallOddsSelect/);
  assert.match(app,/rouletteGoldenBall/);
  assert.match(platform,/goldenBalls/);
  assert.match(records,/Golden Balls/);
  assert.match(achievements,/roulette_golden_ball/);
});
