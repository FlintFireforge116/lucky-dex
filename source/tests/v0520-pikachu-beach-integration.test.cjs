const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));

const index=read('app/src/main/assets/index.html');
const world=read('app/src/main/assets/arcade-world.js');
const app=read('app/src/main/assets/app-v0167.js');
const platform=read('app/src/main/assets/arcade-platform.js');
const session=read('app/src/main/assets/arcade-session.js');
const achievements=read('app/src/main/assets/achievements-v0341.js');
const records=read('app/src/main/assets/arcade-records.js');
const arcadeCss=read('app/src/main/assets/arcade.css');

test('Pikachu Beach is a playable Summer Beach House Arcade venue',()=>{
  assert.match(world,/id:"summerBeach"/);
  assert.match(world,/name:"Summer Beach House"/);
  assert.match(world,/games:\['pikachuBeach'\]/);
  assert.match(world,/pikachuBeach:'Pikachu[’']s Beach'/);
  assert.match(world,/pikachuBeach:\(\)=>window\.LuckyDexPikachuBeach/);
});

test('Pikachu Beach DX keeps its controls below the unobscured playfield',()=>{
  const scene=index.indexOf('id="pikachuBeachDxPlayfield"');
  const controls=index.indexOf('id="pikachuBeachDxControls"');
  assert.ok(scene>=0,'playfield missing');
  assert.ok(controls>scene,'controls must be after/outside the main playfield');
  for(const key of ['up','down','left','right','jump','attack'])assert.match(index,new RegExp(`data-dx-control="${key}"`));
  assert.doesNotMatch(index,/data-dx-control="tilt"/);
  assert.match(index,/id="pikachuBeachDxHp"/);
  assert.match(index,/id="pikachuBeachDxRings"/);
  assert.match(index,/id="pikachuBeachDxProgress"/);
});

test('Pikachu Beach assets, CSS and scripts are bundled locally',()=>{
  for(const file of [
    'app/src/main/assets/arcade-pikachu-beach.css',
    'app/src/main/assets/arcade-pikachu-beach-dx-core.js',
    'app/src/main/assets/arcade-pikachu-beach-dx.js',
    'app/src/main/assets/arcade-pikachu-beach-prizes.js',
    'app/src/main/assets/arcade-pikachu-beach.js',
    'app/src/main/assets/arcade/pikachu-beach/summer-beach.svg'
  ])assert.ok(exists(file),file+' missing');
  assert.match(index,/arcade-pikachu-beach\.css/);
  assert.ok(index.indexOf('arcade-pikachu-beach-prizes.js')<index.indexOf('arcade-pikachu-beach-dx-core.js'));
  assert.ok(index.indexOf('arcade-pikachu-beach-dx-core.js')<index.indexOf('arcade-pikachu-beach-dx.js'));
  assert.ok(index.indexOf('arcade-pikachu-beach-dx.js')<index.indexOf('arcade-pikachu-beach.js'));
});

test('Lucky Wave exposes Off Vanilla Test Always settings and defaults to 2 percent',()=>{
  assert.match(index,/Lucky Wave · Pikachu/);
  assert.match(index,/id="rarePikachuBeachLuckyWaveOddsSelect"/);
  assert.match(index,/value="0"[^>]*>Off/);
  assert.match(index,/value="0\.02"[^>]*>Vanilla · 2%/);
  assert.match(index,/value="0\.25"[^>]*>Test · 25%/);
  assert.match(index,/value="1"[^>]*>Always · 100%/);
  assert.match(app,/pikachuBeachLuckyWave:\.02/);
  assert.match(app,/rarePikachuBeachLuckyWaveOddsSelect:'pikachuBeachLuckyWave'/);
});

test('Lucky Wave prize is reserved and uses the shared five-way safe reward pool',()=>{
  const file='app/src/main/assets/arcade-pikachu-beach-prizes.js';
  assert.ok(exists(file),file+' missing');
  const prizes=read(file);
  assert.match(prizes,/rewardForRoll\(rng\(\)\)/);
  assert.match(prizes,/getOrCreateAttempt/);
  assert.match(prizes,/\['card','pack'\]\.includes\(attempt\.kind\)/);
  assert.match(prizes,/resolveArcadeReward/);
  assert.match(prizes,/claimAttempt/);
  assert.match(prizes,/source:'pikachu-beach-lucky-wave'/);
});

test('Pikachu Beach persistent state includes records needed for results and achievements',()=>{
  assert.match(platform,/pikachuBeach:\{classic:\{gamesPlayed:0,clears:0,hardClears:0,flawlessClears:0/);
  assert.match(platform,/luckyWavesSeen:0,luckyWavesLanded:0,luckyPrizes:0/);
  assert.match(platform,/bestScores:\{easy:0,normal:0,hard:0\}/);
  assert.match(platform,/bestRadness:0/);
  assert.match(platform,/bestRemainingHp:0/);
  assert.match(platform,/\['amieGarden'[\s\S]*'summerBeach'/);
});

test('Pikachu Beach has at least six dedicated achievements including Hard flawless and rare-event goals',()=>{
  const ids=[...achievements.matchAll(/push\('(pikachubeach_[^']+|secret_pikachubeach_[^']+)'/g)].map(m=>m[1]);
  assert.ok(ids.length>=6,'expected at least six Pikachu Beach achievements');
  assert.ok(ids.some(x=>x.includes('first')));
  assert.ok(ids.some(x=>x.includes('hard')));
  assert.ok(ids.some(x=>x.includes('flawless')));
  assert.ok(ids.some(x=>x.includes('lucky')));
});



test('Pikachu Beach appears in permanent Arcade records with surf-specific career stats',()=>{
  assert.match(records,/SUPPORTED_GAME_IDS=\[[^\]]*'pikachuBeach'/);
  assert.match(records,/pikachuBeach:'Pikachu[’']s Beach'/);
  assert.match(records,/pikachuBeach:a=>/);
  assert.match(records,/Best Rings/);
  assert.match(records,/Enemies Defeated/);
  assert.match(records,/Boss Defeats/);
  assert.match(records,/Lucky Waves/);
  assert.match(records,/Best Scores/);
});

test('Pikachu Beach is represented in shared Arcade session metadata and DX results',()=>{
  assert.match(session,/pikachuBeach:\{run:/);
  assert.match(session,/Pikachu/);
  const game=read('app/src/main/assets/arcade-pikachu-beach-dx.js');
  assert.match(game,/showResult\?\.\('pikachuBeach'/);
  assert.match(game,/metricLabel:'SCORE'/);
  assert.match(game,/Rings/);
  assert.match(game,/Bosses/);
  assert.match(game,/PLAY DX AGAIN/);
});



test('Pikachu Beach results use a dedicated beach presentation theme',()=>{
  assert.match(session,/pikachuBeach/);
  assert.match(session,/data-result-theme['"),]+beach|beach['"),]+data-result-theme/);
  assert.match(arcadeCss,/data-result-theme=["']beach["']/);
});

test('Pikachu Beach UI disables text selection and uses no obstacle-dodging mechanic',()=>{
  const css=exists('app/src/main/assets/arcade-pikachu-beach.css')?read('app/src/main/assets/arcade-pikachu-beach.css'):'';
  const core=exists('app/src/main/assets/arcade-pikachu-beach-core.js')?read('app/src/main/assets/arcade-pikachu-beach-core.js'):'';
  assert.match(css,/user-select:\s*none/);
  assert.doesNotMatch(core,/obstacle/i);
});

test('release metadata remains at or beyond the v0.53.3 Pikachu Beach release',()=>{
  const pkg=JSON.parse(read('package.json'));
  const parts=pkg.version.split('.').map(Number);
  assert.ok(parts[0]>0||parts[1]>53||(parts[1]===53&&parts[2]>=3));
  const gradle=read('app/build.gradle');
  assert.match(gradle,new RegExp(`versionName '${pkg.version.replace(/\./g,'\\.')}'`));
  assert.match(app,new RegExp(`__LUCKYDEX_BUILD='${pkg.version.replace(/\./g,'\\.')}'`));
  assert.match(index,new RegExp(`v${pkg.version.replace(/\./g,'\\.')}`));
});
