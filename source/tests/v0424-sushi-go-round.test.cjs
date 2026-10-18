'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

test('Sushi-Go-Round core has four Lickitung, eight priced foods and a one-minute round',()=>{
  assert.equal(fs.existsSync(asset('arcade-sushi-go-round-core.js')),true,'core asset must exist');
  const core=fresh('arcade-sushi-go-round-core.js');
  assert.equal(core.CONFIG.durationMs,60000);
  assert.equal(core.CONFIG.plateCount,12);
  assert.equal(core.CONFIG.comboCap,5);
  assert.equal(core.SUSHI.length,8);
  assert.deepEqual(core.SUSHI.map(x=>x.value),[1000,600,350,250,200,150,50,20]);
  const round=core.createRound({difficulty:'normal',rng:()=>.25,nowMs:0});
  assert.equal(round.racers.length,4);
  assert.ok(round.racers.every(r=>r.species.dex===108));
  assert.deepEqual(round.racers.map(r=>r.label),['YOU','COM 1','COM 2','COM 3']);
  assert.equal(round.plates.filter(Boolean).length,12);
});

test('Sushi-Go-Round same-type chain multiplies bills up to x5',()=>{
  const core=fresh('arcade-sushi-go-round-core.js');
  const round=core.createRound({difficulty:'normal',rng:()=>0,nowMs:0});
  const p=round.player;
  const uni=core.SUSHI.find(x=>x.id==='uni');
  for(let i=1;i<=6;i++){
    round.plates[core.CONFIG.stations.player]={id:`u${i}`,type:uni.id,value:uni.value,name:uni.name,hot:false};
    const out=core.eatAtStation(round,'player',i*300);
    assert.equal(out.accepted,true);
    assert.equal(out.multiplier,Math.min(i,5));
  }
  assert.equal(p.combo,5);
  assert.equal(p.bestCombo,5);
  assert.equal(p.eaten,6);
  assert.equal(p.bill,1000*(1+2+3+4+5+5));
});

test('Sushi-Go-Round hot item stuns Lickitung and blocks immediate eating',()=>{
  const core=fresh('arcade-sushi-go-round-core.js');
  const round=core.createRound({difficulty:'normal',rng:()=>0,nowMs:0});
  const hot=core.SUSHI.find(x=>x.hot);
  round.plates[core.CONFIG.stations.player]={id:'hot',type:hot.id,value:hot.value,name:hot.name,hot:true};
  const first=core.eatAtStation(round,'player',1000);
  assert.equal(first.accepted,true);assert.equal(first.hot,true);
  assert.ok(round.player.stunnedUntil>=1000+core.CONFIG.hotStunMs);
  round.plates[core.CONFIG.stations.player]={id:'next',type:'uni',value:1000,name:'Uni',hot:false};
  const blocked=core.eatAtStation(round,'player',1100);
  assert.equal(blocked.accepted,false);assert.equal(blocked.reason,'stunned');
  const later=core.eatAtStation(round,'player',round.player.stunnedUntil+1);
  assert.equal(later.accepted,true);
});

test('Sushi-Go-Round hard CPUs are more selective and reliable than easy CPUs',()=>{
  const core=fresh('arcade-sushi-go-round-core.js');
  const easy=core.difficultyProfile('easy'),hard=core.difficultyProfile('hard');
  assert.ok(hard.takeChance>easy.takeChance);
  assert.ok(hard.valueWeight>easy.valueWeight);
  assert.ok(hard.comboWeight>easy.comboWeight);
  assert.ok(hard.hotAversion>easy.hotAversion);
});

test('Sushi-Go-Round ends after one minute and highest bill wins',()=>{
  const core=fresh('arcade-sushi-go-round-core.js');
  const round=core.createRound({difficulty:'normal',rng:()=>.2,nowMs:1000});
  round.player.bill=5000;round.racers[1].bill=4200;round.racers[2].bill=3000;round.racers[3].bill=1000;
  core.advanceRound(round,60999,()=>.99);assert.equal(round.finalized,false);
  core.advanceRound(round,61001,()=>.99);assert.equal(round.finalized,true);
  assert.equal(core.rankRound(round)[0].id,'player');
  assert.equal(core.placeFor(round,'player'),1);
  assert.ok(core.rewardFor(1,'hard')>core.rewardFor(1,'easy'));
});

test('Kids Club exposes Sushi-Go-Round as the ninth Stadium game',()=>{
  const world=read('arcade-world.js');
  assert.match(world,/games:\['ekansHoop','digDigDig','magikarpSplash','rockHarden','clefairy','thunderingDynamo','snoreWar','runRattataRun','sushiGoRound'(?:,'clearCutChallenge')?\]/);
  assert.match(world,/sushiGoRound:'Sushi-Go-Round'/);
  assert.match(world,/sushiGoRound:\(\)=>window\.LuckyDexSushiGoRound/);
  assert.match(world,/sushiGoRound:\{sprite:'108\.png',mechanic:'Choose · combo · value'\}/);
});

test('Sushi-Go-Round shell has circular conveyor and four Lickitung',()=>{
  const html=read('index.html');
  assert.match(html,/<link rel="stylesheet" href="arcade-sushi-go-round\.css" \/>/);
  const a=html.indexOf('id="sushiGoRoundGame"');assert.ok(a>0,'game shell exists');
  const b=html.indexOf('id="dashGame"');const shell=html.slice(a,b>0?b:undefined);
  for(const id of ['sushiGoRoundGame','sushiGoRoundStage','sushiGoRoundPlace','sushiGoRoundBill','sushiGoRoundDifficultyLabel','sushiGoRoundConveyor','sushiGoRoundPlates','sushiGoRoundPlayer','sushiGoRoundCpu1','sushiGoRoundCpu2','sushiGoRoundCpu3','sushiGoRoundReady','sushiGoRoundStart','sushiGoRoundPauseOverlay','sushiGoRoundResume'])assert.match(shell,new RegExp(`id="${id}"`),id);
  for(const d of ['easy','normal','hard'])assert.match(shell,new RegExp(`data-sushi-difficulty="${d}"`));
  const coreAt=html.indexOf('<script src="arcade-sushi-go-round-core.js"></script>');
  const runtimeAt=html.indexOf('<script src="arcade-sushi-go-round.js"></script>');
  const worldAt=html.indexOf('<script src="arcade-world.js"></script>');
  assert.ok(coreAt>0&&runtimeAt>coreAt&&worldAt>runtimeAt,'core/runtime load before Arcade world');
});

test('Sushi-Go-Round state migration and Arcade Records are durable',()=>{
  global.LuckyDexArcadeRecordsCore=fresh('arcade-records-core.js');
  const platform=fresh('arcade-platform.js');
  const migrated=platform.ensureArcadeState({sushiGoRound:{gamesPlayed:5,wins:2,bestBill:12345,custom:'ignored'}}).sushiGoRound;
  assert.equal(migrated.gamesPlayed,5);assert.equal(migrated.wins,2);assert.equal(migrated.bestBill,12345);assert.equal(migrated.bestCombo,0);assert.equal(migrated.totalSushiEaten,0);assert.deepEqual(migrated.winsByDifficulty,{easy:0,normal:0,hard:0});
  const records=read('arcade-records.js');
  assert.match(records,/sushiGoRound/);assert.match(records,/Sushi-Go-Round/);assert.match(records,/Best Bill/);assert.match(records,/Best Combo/);assert.match(records,/Sushi Eaten/);
});

test('Sushi-Go-Round has a standard five-achievement set',()=>{
  const achievements=fresh('achievements-v0341.js');
  const state={arcade:{sushiGoRound:{wins:1,winsByDifficulty:{easy:1,normal:1,hard:1},bestCombo:5,bestBill:16000}}};
  const rows=achievements.buildCoreAchievements(()=>state),byId=new Map(rows.map(a=>[a.id,a]));
  for(const id of ['sushi_first_win','sushi_hard_win','sushi_all_difficulties','sushi_combo_5','sushi_big_bill'])assert.ok(byId.has(id),id);
  assert.deepEqual(byId.get('sushi_all_difficulties').progress(),[3,3]);
  assert.deepEqual(byId.get('sushi_combo_5').progress(),[5,5]);
  assert.deepEqual(byId.get('sushi_big_bill').progress(),[1,1]);
});
