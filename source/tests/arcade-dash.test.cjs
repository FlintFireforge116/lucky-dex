const assert=require('assert');
const path=require('path');
global.LuckyDexDashConfig=require(path.resolve(__dirname,'../app/src/main/assets/arcade-dash-config.js'));
global.LuckyDexAdventureSpecies=require(path.resolve(__dirname,'../app/src/main/assets/adventure/adventure-species.js'));
global.LuckyDexDashCourse=require(path.resolve(__dirname,'../app/src/main/assets/arcade-dash-course.js'));
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-dash.js');
delete require.cache[modPath];
const d=require(modPath);

function racer(overrides={}){return {key:'25:n',id:25,name:'Pikachu',shiny:false,level:20,baseSpeed:90,image:'sprite',...overrides};}

{
  for(const fn of ['open','close','pause','resume','startRace'])assert.strictEqual(typeof d[fn],'function',`Dash browser API ${fn}`);
  console.log('PASS Dash exposes the required browser lifecycle API');
}


{
  const slow=d.paceModifier(10),fast=d.paceModifier(180);
  assert.ok(fast>slow);
  const spread=fast/slow;
  assert.ok(spread>=1.88&&spread<=1.93,`pace spread ${spread}`);
  assert.ok(d.levelModifier(50)-d.levelModifier(1)<=d.CONSTANTS.MAX_LEVEL_BONUS+1e-9);
  assert.strictEqual(d.levelModifier(100),d.levelModifier(50));
  console.log('PASS Dash Speed variety and level bonus stay within balance bounds');
}

{
  let s={stamina:100,recoveryDelay:0};
  s=d.stepStamina(s,true,1);
  assert.ok(s.stamina<100&&s.stamina>60);
  const drained=s.stamina;
  s=d.stepStamina(s,false,0.3);
  assert.strictEqual(s.stamina,drained,'regen waits through recovery delay');
  s=d.stepStamina(s,false,1);
  assert.ok(s.stamina>drained&&s.stamina<=100);
  console.log('PASS Dash sprint drains stamina and release regenerates after a delay');
}

{
  const r={stamina:50,slowFactor:1,slowTimer:0,boostTimer:0};
  d.applyCourseObject(r,{id:'r',effect:'rock'});assert.ok(r.slowFactor<1&&r.slowTimer>0);
  d.applyCourseObject(r,{id:'m',effect:'mud'});assert.ok(r.slowFactor<=d.CONSTANTS.MUD_FACTOR);
  d.applyCourseObject(r,{id:'b',effect:'speed-pad'});assert.ok(r.boostTimer>0);
  d.applyCourseObject(r,{id:'s',effect:'stamina-pickup'});assert.ok(r.stamina>50);
  d.tickEffects(r,10);assert.strictEqual(r.slowFactor,1);assert.strictEqual(r.boostTimer,0);
  assert.strictEqual(d.clampLane(-1),0);assert.strictEqual(d.clampLane(5),2);assert.strictEqual(d.clampLane(1),1);
  console.log('PASS Dash objects apply/expire and lanes clamp to three valid lanes');
}

{
  const rows=[{distance:20,index:2},{distance:25,index:1},{distance:25,index:0},{distance:10,index:3}];
  const ranked=d.rankRacers(rows);
  assert.deepStrictEqual(ranked.map(x=>x.index),[0,1,2,3]);
  assert.deepStrictEqual([1,2,3,4,5,6].map(d.rewardForPlace),[120,80,55,35,25,20]);
  assert.strictEqual(d.rewardForPlace(7),0);
  console.log('PASS Dash placements are stable and reward mapping is exact');
}

{
  const ai=[1,2,3,4,5].map((n)=>racer({key:`${n}:n`,id:n,name:`AI${n}`,baseSpeed:60+n*5,level:10+n}));
  const race=d.createRaceState(racer(),ai,{seed:17});
  assert.strictEqual(race.racers.length,6);
  assert.ok(race.racers.slice(1).every(x=>x.ai&&x.stamina===100));
  const before=race.racers.slice(1).map(x=>x.stamina);
  for(let i=0;i<80;i++)d.stepRace(race,0.05,{sprint:true,targetLane:1});
  assert.ok(race.racers.slice(1).some((x,i)=>x.stamina<before[i]),'AI uses finite stamina');
  assert.ok(race.racers.every(x=>x.stamina>=0&&x.stamina<=100));
  console.log('PASS Dash creates five AI racers that use finite shared stamina rules');
}

{
  const ai=[1,2,3,4,5].map((n)=>racer({key:`${n}:n`,id:n,name:`AI${n}`,baseSpeed:65}));
  const race=d.createRaceState(racer(),ai,{seed:22});
  const before=race.racers[0].distance;
  const out=d.stepRace(race,5,{sprint:false,targetLane:1});
  assert.ok(out.dt<=d.CONSTANTS.MAX_FRAME_DT+1e-9);
  assert.ok(race.elapsedMs<=d.CONSTANTS.MAX_FRAME_DT*1000+1e-6);
  assert.ok(race.racers[0].distance>before);
  race.racers[0].distance=race.finishDistance-0.01;
  d.stepRace(race,0.05,{sprint:true,targetLane:1});
  assert.ok(race.racers[0].finished);
  assert.ok(race.racers[0].distance>=race.finishDistance);
  console.log('PASS Dash caps hidden frame jumps and finishes at fixed distance');
}

{
  const race={completionHandled:false};let calls=0;
  assert.strictEqual(d.finishRaceOnce(race,()=>calls++),true);
  assert.strictEqual(d.finishRaceOnce(race,()=>calls++),false);
  assert.strictEqual(calls,1);
  console.log('PASS Dash finish completion guard is exactly-once');
}


{
  const race=d.createRaceState(racer(),[1,2,3,4,5].map(n=>racer({key:`${n}:n`,id:n,name:`AI${n}`,baseSpeed:70})),{seed:31});
  race.elapsedMs=12345;race.racers[0].finished=true;race.racers[0].finishTimeMs=12345;race.racers[0].distance=race.finishDistance;race.completed=true;
  race.racers[1].finished=true;race.racers[1].finishTimeMs=12000;race.racers[1].distance=race.finishDistance;
  global.state={arcade:{dash:{lastRacerKey:null,races:0,wins:0,podiums:0,bestTimeMs:null}}};
  let awards=0,results=0,saves=0;
  global.LuckyDexArcadePlatform={awardRun:(args)=>{awards++;return {coinsAwarded:args.coins,itemAwarded:null};},ensureArcadeState:x=>x};
  global.LuckyDexArcadeSession={showResult:(id,args)=>{results++;assert.strictEqual(id,'dash');assert.ok(args.details.some(x=>/Speed 90/.test(x.subtitle)));return args;}};
  global.save=()=>{saves++;};
  assert.strictEqual(d.finalizeRace(race),true);
  assert.strictEqual(d.finalizeRace(race),false);
  assert.strictEqual(awards,1);assert.strictEqual(results,1);assert.ok(saves>=1);
  assert.strictEqual(global.state.arcade.dash.races,1);assert.strictEqual(global.state.arcade.dash.wins,0);assert.strictEqual(global.state.arcade.dash.podiums,1);assert.strictEqual(global.state.arcade.dash.bestTimeMs,12345);
  console.log('PASS Dash completion awards and persists stats exactly once');
}

{
  const race=d.createRaceState(racer(),[],{seed:44});
  race.lastFrameMs=5000;
  assert.strictEqual(d.pauseRaceState(race),true);assert.strictEqual(race.phase,'paused');
  assert.strictEqual(d.resumeRaceState(race),true);assert.strictEqual(race.phase,'racing');assert.strictEqual(race.lastFrameMs,null);
  d.abandonRace(race);assert.strictEqual(race.phase,'abandoned');assert.strictEqual(d.finalizeRace(race),false);
  console.log('PASS Dash pause/resume resets frame clock and abandoned races cannot reward');
}


{
  const player=racer({id:25,baseSpeed:90,types:['electric']});
  const bands={easy:[20,65],normal:[55,100],hard:[90,135],expert:[100,180]};
  for(const [difficulty,[lo,hi]] of Object.entries(bands)){
    const rows=d.aiPool(player,12345,{difficulty});
    assert.strictEqual(rows.length,5);
    assert.ok(rows.every(x=>x.baseSpeed>=lo&&x.baseSpeed<=hi),`${difficulty} pool must stay in band`);
    assert.deepStrictEqual(rows,d.aiPool(player,12345,{difficulty}),`${difficulty} pool deterministic`);
  }
  const fire=d.aiPool(player,77,{difficulty:'normal',type:'fire'});
  assert.strictEqual(fire.length,5);
  assert.ok(fire.every(x=>x.types.includes('fire')));
  const rare=d.aiPool(player,81,{difficulty:'expert',type:'bug'});
  assert.strictEqual(rare.length,5);
  assert.ok(rare.every(x=>x.types.includes('bug')),'fallback expansion must keep league type');
  console.log('PASS Dash AI pools are deterministic, difficulty-banded and league-type restricted');
}

{
  const race=d.createRaceState(racer(),[],{seed:101,difficulty:'expert',mode:'league',theme:'fire'});
  assert.strictEqual(race.difficulty,'expert');assert.strictEqual(race.mode,'league');assert.strictEqual(race.theme,'fire');
  assert.ok(race.racers.slice(1).every(x=>x.ai&&x.ai.mistake===global.LuckyDexDashConfig.DIFFICULTIES.expert.ai.mistake));
  const course={finishDistance:1800,objects:[{id:'x',effect:'rock',skin:'basalt',lane:1,distance:1}]};
  const one=d.createRaceState(racer(),[],{seed:1,difficulty:'easy',course});
  d.stepRace(one,0.05,{sprint:false,targetLane:1});
  assert.ok(one.racers[0].slowTimer>0,'themed effect still collides through hidden lane');
  console.log('PASS difficulty profile and effect semantics feed the unchanged race physics');
}

{
  const w=540,h=720;
  assert.ok(d.laneToCanvasX(0,w)<d.laneToCanvasX(1,w));
  assert.ok(d.laneToCanvasX(1,w)<d.laneToCanvasX(2,w));
  assert.ok(d.laneToCanvasX(.5,w)>d.laneToCanvasX(0,w)&&d.laneToCanvasX(.5,w)<d.laneToCanvasX(1,w));
  const player=500;
  assert.ok(d.distanceToCanvasY(550,player,h)<d.distanceToCanvasY(500,player,h));
  assert.ok(d.distanceToCanvasY(450,player,h)>d.distanceToCanvasY(500,player,h));
  assert.strictEqual(d.distanceToCanvasY(player,player,h),h*.70);
  assert.strictEqual(d.racerPixelSize(200,300),96);
  assert.strictEqual(d.racerPixelSize(540,720),112);
  assert.strictEqual(d.racerPixelSize(2000,2000),112);
  console.log('PASS top-down lane/distance mapping and racer scale are stable');
}
