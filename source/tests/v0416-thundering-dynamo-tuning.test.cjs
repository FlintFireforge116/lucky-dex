'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function seq(values){let i=0;return()=>values[(i++)%values.length];}

test('Dynamo uses 3% correct charge and a 300ms neutral transition between lamp colours',()=>{
  delete require.cache[require.resolve(asset('arcade-thundering-dynamo-core.js'))];
  const core=require(asset('arcade-thundering-dynamo-core.js'));
  assert.equal(core.CONFIG.correctCharge,3);
  assert.equal(core.CONFIG.transitionMs,300);
  const race=core.createRace({difficulty:'normal',rng:seq([.1,.8,.2,.7,.3,.6]),nowMs:1000});
  const initial=race.lamp;
  const changeAt=race.nextLampAt;
  const result=core.pressPlayer(race,initial,1010);
  assert.equal(result.accepted,true);
  assert.equal(race.player.charge,3);
  core.advanceRace(race,changeAt,()=>.5);
  assert.equal(race.lamp,'neutral','lamp should enter a neutral grey state before changing colour');
  assert.equal(race.transitionEndsAt,changeAt+300);
  const chargeBefore=race.player.charge;
  const neutralPress=core.pressPlayer(race,initial,changeAt+100);
  assert.equal(neutralPress.accepted,false,'player input should be ignored during the neutral transition');
  assert.equal(race.player.charge,chargeBefore);
  assert.equal(race.player.wrongPresses,0,'neutral transition presses must not count as mistakes');
  core.advanceRace(race,changeAt+299,()=>.5);
  assert.equal(race.lamp,'neutral');
  core.advanceRace(race,changeAt+300,()=>.5);
  assert.equal(race.lamp,initial==='a'?'b':'a');
  assert.equal(race.transitionEndsAt,null);
  assert.ok(race.nextLampAt>changeAt+300);
});

test('Dynamo CPUs cannot charge during neutral and react only after the new colour appears',()=>{
  delete require.cache[require.resolve(asset('arcade-thundering-dynamo-core.js'))];
  const core=require(asset('arcade-thundering-dynamo-core.js'));
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  const changeAt=race.nextLampAt;
  core.advanceRace(race,changeAt,()=>.5);
  assert.equal(race.lamp,'neutral');
  const before=race.racers.slice(1).map(r=>r.charge);
  assert.ok(race.racers.slice(1).every(r=>r.nextTapAt==null),'CPU tapping should be suspended during neutral');
  core.advanceRace(race,changeAt+299,()=>.5);
  assert.deepEqual(race.racers.slice(1).map(r=>r.charge),before);
  core.advanceRace(race,changeAt+300,()=>.5);
  assert.ok(race.racers.slice(1).every(r=>r.nextTapAt>changeAt+300),'CPU reaction delay should begin after the new colour appears');
});

test('Dynamo runtime starts immediately with no countdown and renders neutral lamp with no A/B cue',()=>{
  const js=read('arcade-thundering-dynamo.js');
  assert.doesNotMatch(js,/phase==='countdown'|countdownEndsAt|countdownRemainingMs|goFlashUntil/,'Dynamo runtime should not contain a pre-race countdown phase');
  assert.match(js,/function startRound[\s\S]*?phase='racing'[\s\S]*?return snapshot\(\);}/,'START should enter racing immediately');
  assert.match(js,/race\.lamp==='neutral'/,'runtime should explicitly render the neutral lamp state');
  assert.match(js,/key\.textContent=race\.lamp==='neutral'\?'':/,'neutral lamp should show no A/B key');
});

test('Dynamo shell removes visible timer and countdown UI, with a grey neutral lamp style',()=>{
  const html=read('index.html');
  const a=html.indexOf('id="thunderingDynamoGame"');
  const next=html.indexOf('id="snoreWarGame"',a);
  const b=next>0?next:html.indexOf('id="dashGame"',a);
  const shell=html.slice(a,b>0?b:undefined);
  assert.doesNotMatch(shell,/thunderingDynamoTimer|<small>TIME<\/small>/);
  assert.doesNotMatch(shell,/thunderingDynamoCountdown/);
  assert.match(shell,/PLACE/);
  assert.match(shell,/LEVEL/);
  const css=read('arcade-thundering-dynamo.css');
  assert.match(css,/\.dynamo-lamp\.is-neutral b\{[^}]*background:\s*#[0-9a-fA-F]{3,8}/,'neutral lamp should have an explicit grey visual state');
});
