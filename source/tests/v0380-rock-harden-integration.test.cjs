'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const world=read('app/src/main/assets/arcade-world.js'),html=read('app/src/main/assets/index.html');
assert.match(world,/id:"stadiumKidsClub"[^\n]*games:\['ekansHoop','digDigDig','magikarpSplash','rockHarden'(?:,'[^']+')*\]/,'Kids Club order must append Rock Harden');
assert.match(world,/rockHarden:'Rock Harden'/);
assert.match(world,/rockHarden:'[^']*(?:Harden|harden)[^']*(?:rock|HP|surviv)/i,'objective must explain timing/HP survival');
assert.match(world,/rockHarden:\(\)=>window\.LuckyDexRockHarden/,'world owner resolver missing');
assert.match(world,/rockHarden:\{sprite:'11\.png',mechanic:'Hold · precision · survival'\}/,'Kids Club selector metadata missing');
for(const row of ["ekansHoop:{sprite:'23.png',mechanic:'Aim · trajectory'}","digDigDig:{sprite:'27.png',mechanic:'Alternate · speed'}","magikarpSplash:{sprite:'129.png',mechanic:'Hold · landing rhythm'}"])assert.ok(world.includes(row),`existing selector entry changed: ${row}`);
assert.match(world,/if\(id==='stadiumKidsClub'\)/,'Kids Club selector stays isolated');
assert.match(world,/class="arcade-venue-game" data-venue-game="\$\{g\}"/,'generic non-Kids-Club renderer must remain');

assert.match(html,/<link rel="stylesheet" href="arcade-rock-harden\.css" \/>/);
const coreAt=html.indexOf('<script src="arcade-rock-harden-core.js"></script>'),ownerAt=html.indexOf('<script src="arcade-rock-harden.js"></script>'),worldAt=html.indexOf('<script src="arcade-world.js"></script>');
assert.ok(coreAt>0&&ownerAt>coreAt&&worldAt>ownerAt,'Rock Harden core/owner must load before Arcade world');
const a=html.indexOf('id="rockHardenGame"'),b=html.indexOf('id="dashGame"');assert.ok(a>0&&b>a,'Rock Harden shell must appear before Dash shell');
const shell=html.slice(a,b);
for(const id of [
  'rockHardenGame','rockHardenStage','rockHardenPlace','rockHardenTimer','rockHardenDifficultyLabel',
  'rockHardenPlayerLane','rockHardenCpu1Lane','rockHardenCpu2Lane','rockHardenCpu3Lane',
  'rockHardenPlayerSprite','rockHardenCpu1Sprite','rockHardenCpu2Sprite','rockHardenCpu3Sprite',
  'rockHardenPlayerHp','rockHardenCpu1Hp','rockHardenCpu2Hp','rockHardenCpu3Hp',
  'rockHardenPlayerScore','rockHardenCpu1Score','rockHardenCpu2Score','rockHardenCpu3Score',
  'rockHardenPlayerRock','rockHardenCpu1Rock','rockHardenCpu2Rock','rockHardenCpu3Rock',
  'rockHardenPlayerShadow','rockHardenCpu1Shadow','rockHardenCpu2Shadow','rockHardenCpu3Shadow',
  'rockHardenPlayerGrade','rockHardenCpu1Grade','rockHardenCpu2Grade','rockHardenCpu3Grade',
  'rockHardenCountdown','rockHardenReady','rockHardenStart','rockHardenButton','rockHardenPauseOverlay','rockHardenResume','rockHardenStandings'
])assert.match(shell,new RegExp(`id="${id}"`),id);
for(const d of ['easy','normal','hard'])assert.match(shell,new RegExp(`data-rock-harden-difficulty="${d}"`));
assert.match(shell,/HOLD HARDEN TO BLOCK (?:ROCKS|HAZARDS)/i);
assert.match(shell,/HARDEN DRAINS HP/i);
assert.strictEqual((shell.match(/id="rockHardenButton"/g)||[]).length,1,'exactly one HARDEN control');
console.log('PASS v0.38.0 Rock Harden Kids Club integration shell');
