const assert=require('assert');
const path=require('path');
const root=path.resolve(__dirname,'..');
global.LuckyDexDashConfig=require(path.join(root,'app/src/main/assets/arcade-dash-config.js'));
global.LuckyDexDashLeague=require(path.join(root,'app/src/main/assets/arcade-dash-league.js'));
global.LuckyDexAdventureSpecies=require(path.join(root,'app/src/main/assets/adventure/adventure-species.js'));
global.LuckyDexDashCourse=require(path.join(root,'app/src/main/assets/arcade-dash-course.js'));
const modPath=path.join(root,'app/src/main/assets/arcade-dash.js');delete require.cache[modPath];const d=require(modPath);
const cfg=global.LuckyDexDashConfig,league=global.LuckyDexDashLeague;
function racer(overrides={}){return {key:'25:n',id:25,name:'Pikachu',shiny:false,level:20,baseSpeed:90,types:['electric'],image:'sprite',...overrides};}
function aiRows(){return [1,2,3,4,5].map((n)=>racer({key:`a${n}`,id:30+n,name:`AI${n}`,baseSpeed:70+n,types:['fire']}));}
function completedRace(place=1,{difficulty='normal',mode='quick',theme='normal',seed=1}={}){
  const p=racer(),ai=aiRows(),race=d.createRaceState(p,ai,{seed,difficulty,mode,theme,course:{finishDistance:1800,objects:[]}});
  race.elapsedMs=12000;race.completed=true;race.phase='racing';
  race.racers.forEach((r,i)=>{r.distance=1500-i*10;r.finished=false;r.finishTimeMs=null;});
  race.racers[0].distance=1800;race.racers[0].finished=true;race.racers[0].finishTimeMs=12000;
  for(let i=1;i<place;i++){race.racers[i].distance=1800;race.racers[i].finished=true;race.racers[i].finishTimeMs=11000+i*100;}
  return race;
}
function freshState(){global.state={arcade:{dash:{lastRacerKey:null,races:0,wins:0,podiums:0,bestTimeMs:null,lastQuickRacerKey:null,lastLeagueRacerKey:null,quickBestTimes:{easy:null,normal:null,hard:null,expert:null},leagueRecords:{}}}};let awards=[];global.LuckyDexArcadePlatform={ensureArcadeState:a=>a||{},awardRun:args=>{awards.push(args);return {coinsAwarded:args.coins,itemAwarded:null};}};global.LuckyDexArcadeSession={showResult:()=>{}};global.save=()=>{};return awards;}

{
  const awards=freshState(),race=completedRace(1,{difficulty:'hard'});
  assert.strictEqual(d.finalizeQuickRace(race,{showResult:false}),true);
  assert.strictEqual(d.finalizeQuickRace(race,{showResult:false}),false);
  assert.strictEqual(awards.length,1);assert.strictEqual(awards[0].coins,cfg.quickReward(1,'hard'));
  const ds=global.state.arcade.dash;assert.strictEqual(ds.races,1);assert.strictEqual(ds.wins,1);assert.strictEqual(ds.podiums,1);assert.strictEqual(ds.bestTimeMs,12000);assert.strictEqual(ds.quickBestTimes.hard,12000);assert.strictEqual(ds.quickBestTimes.easy,null);assert.strictEqual(ds.lastQuickRacerKey,'25:n');
  console.log('PASS Quick Race difficulty reward, best time and exactly-once career persistence');
}

{
  const awards=freshState(),player=racer({types:['fire']}),ai=aiRows(),cup=league.createCup({type:'fire',difficulty:'normal',player,aiRacers:ai,seed:77});
  let out=d.completeLeagueRace(completedRace(1,{difficulty:'normal',mode:'league',theme:'fire',seed:2}),cup,{showStandings:false});assert.strictEqual(out.final,false);assert.strictEqual(awards.length,0);assert.strictEqual(cup.raceIndex,1);
  out=d.completeLeagueRace(completedRace(1,{difficulty:'normal',mode:'league',theme:'fire',seed:3}),cup,{showStandings:false});assert.strictEqual(out.final,false);assert.strictEqual(awards.length,0);assert.strictEqual(cup.raceIndex,2);
  out=d.completeLeagueRace(completedRace(1,{difficulty:'normal',mode:'league',theme:'fire',seed:4}),cup,{showStandings:false});assert.strictEqual(out.final,true);assert.strictEqual(awards.length,1);assert.strictEqual(awards[0].coins,cfg.leagueReward(1,'normal'));
  assert.strictEqual(global.state.arcade.dash.races,3);assert.strictEqual(global.state.arcade.dash.wins,3);assert.strictEqual(global.state.arcade.dash.podiums,3);
  const rec=global.state.arcade.dash.leagueRecords.fire.normal;assert.strictEqual(rec.trophy,'gold');assert.strictEqual(rec.bestPoints,30);assert.ok(rec.bestTotalTimeMs>0);
  assert.strictEqual(d.completeLeagueRace(completedRace(1,{difficulty:'normal',mode:'league',theme:'fire',seed:5}),cup,{showStandings:false}).accepted,false);assert.strictEqual(awards.length,1,'finished cup cannot award again');
  console.log('PASS League races defer coins until race 3 and award/persist cup result exactly once');
}

{
  freshState();const ds=global.state.arcade.dash;
  d.updateLeagueRecord(ds,'ghost','expert',{trophy:'gold',points:24,totalTimeMs:35000});
  d.updateLeagueRecord(ds,'ghost','expert',{trophy:'bronze',points:20,totalTimeMs:32000});
  assert.deepStrictEqual(ds.leagueRecords.ghost.expert,{trophy:'gold',bestPoints:24,bestTotalTimeMs:35000});
  d.updateLeagueRecord(ds,'ghost','expert',{trophy:'silver',points:24,totalTimeMs:34000});
  assert.deepStrictEqual(ds.leagueRecords.ghost.expert,{trophy:'gold',bestPoints:24,bestTotalTimeMs:34000});
  d.updateLeagueRecord(ds,'ghost','expert',{trophy:null,points:26,totalTimeMs:36000});
  assert.deepStrictEqual(ds.leagueRecords.ghost.expert,{trophy:'gold',bestPoints:26,bestTotalTimeMs:36000});
  console.log('PASS League records upgrade trophies and best score/time without trophy downgrade');
}

{
  const race=completedRace(2,{difficulty:'easy'}),cup={marker:'keep'};race.lastFrameMs=5000;
  assert.strictEqual(d.pauseRaceState(race),true);assert.deepStrictEqual(cup,{marker:'keep'});assert.strictEqual(d.resumeRaceState(race),true);assert.strictEqual(race.lastFrameMs,null);
  d.abandonRace(race);assert.strictEqual(d.finalizeQuickRace(race,{showResult:false}),false);
  console.log('PASS pause/resume preserves external cup state and abandoned races cannot pay out');
}
