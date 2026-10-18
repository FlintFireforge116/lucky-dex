const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const asset=n=>path.join(root,'app/src/main/assets',n);
const read=n=>fs.readFileSync(asset(n),'utf8');

test('shared Goldenrod shell exposes six event cards and required navigation flow',()=>{
  global.LuckyDexGoldenrodCore=require(asset('arcade-goldenrod-core.js'));
  global.LuckyDexGoldenrodState=require(asset('arcade-goldenrod-state.js'));
  global.LuckyDexGoldenrodAdapters={get:id=>['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition'].includes(id)?{id}:null};
  const p=asset('arcade-goldenrod.js');delete require.cache[require.resolve(p)];const G=require(p);
  assert.equal(G.EVENTS.length,6);
  const cards=G.eventCardsModel(global.LuckyDexGoldenrodAdapters);
  assert.deepEqual(cards.filter(x=>x.active).map(x=>x.id),['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition']);
  assert.deepEqual(cards.filter(x=>!x.active).map(x=>x.id),[]);
  assert.deepEqual(G.flowSteps('exhibition'),['event','mode','difficulty','participant']);
  assert.deepEqual(G.flowSteps('division'),['event','mode','division','participant']);
  assert.deepEqual(G.flowSteps('type'),['event','mode','division','type','participant']);
  assert.doesNotMatch(G.renderEventCards(cards),/COMING LATER/);
  assert.match(G.renderEventCards(cards),/data-goldenrod-event="dash"/);
  assert.equal(typeof G.renderDifficultyOptions,'function');
  const difficulties=G.renderDifficultyOptions();
  for(const difficulty of ['easy','normal','hard'])assert.match(difficulties,new RegExp(`data-goldenrod-difficulty=\"${difficulty}\"`));
  const controllerSource=read('arcade-goldenrod.js');
  assert.match(controllerSource,/data-goldenrod-difficulty/);
  assert.match(controllerSource,/difficulty:ui\.difficulty/);
  for(const name of ['open','close','startExhibition','startCup','acceptRoundResult','abandonActiveCup','renderTrophyCabinet','activeCup'])assert.equal(typeof G[name],'function',name);
});

test('missing adapter disables a built event instead of throwing',()=>{
  global.LuckyDexGoldenrodCore=require(asset('arcade-goldenrod-core.js'));
  global.LuckyDexGoldenrodState=require(asset('arcade-goldenrod-state.js'));
  global.LuckyDexGoldenrodAdapters={get:id=>id==='dash'?{id}:null};
  const p=asset('arcade-goldenrod.js');delete require.cache[require.resolve(p)];const G=require(p);
  const cards=G.eventCardsModel(global.LuckyDexGoldenrodAdapters);
  assert.equal(cards.find(x=>x.id==='powerTrial').active,false);
  assert.equal(cards.find(x=>x.id==='powerTrial').reason,'Unavailable');
  assert.doesNotThrow(()=>G.open({eventId:'powerTrial'}));
});

test('round scoreboard and final podium models are visibly separate and player-aware',()=>{
  global.LuckyDexGoldenrodCore=require(asset('arcade-goldenrod-core.js'));
  global.LuckyDexGoldenrodState=require(asset('arcade-goldenrod-state.js'));
  global.LuckyDexGoldenrodAdapters={get:()=>null};
  const p=asset('arcade-goldenrod.js');delete require.cache[require.resolve(p)];const G=require(p);
  const cup={rounds:[{}],entrants:[],rareReceipts:[{name:'Rare Prize'}]};
  const standings=[{id:'cpu',name:'CPU',place:1,points:10},{id:'player',name:'YOU',place:2,points:6,isPlayer:true}];
  const round=[{id:'cpu',place:1,metric:100},{id:'player',place:2,metric:90}];
  const score=G.scoreboardModel({cup,roundResults:round,standings});
  assert.equal(score.roundLabel,'ROUND 1 / 3');
  assert.equal(score.roundTitle,'ROUND RESULTS');
  assert.equal(score.standingsTitle,'CUP STANDINGS');
  assert.equal(score.standings.find(x=>x.id==='player').player,true);
  const final=G.finalModel({cup,standings:[...standings,{id:'c',name:'C',place:3,points:4}],settlement:{trophy:'silver',coinsAwarded:160,unlocks:['POKÉ DIVISION'],rareReceipts:cup.rareReceipts}});
  assert.equal(final.podium.length,3);
  assert.equal(final.trophy,'silver');
  assert.equal(final.coinsAwarded,160);
  assert.equal(final.rareReceipts.length,1);
  assert.ok(final.actions.includes('TROPHY CABINET'));
});

test('Goldenrod assets are wired and Challenge Course opens the shared shell',()=>{
  const html=read('index.html'),world=read('arcade-world.js'),session=read('arcade-session.js');
  assert.match(html,/arcade-goldenrod\.css/);
  assert.match(html,/arcade-goldenrod\.js/);
  assert.match(world,/LuckyDexGoldenrod/);
  assert.match(world,/dashCourse/);
  assert.match(session,/Exhibition/i);
  assert.match(session,/Division Cup/i);
  assert.match(session,/Type Cup/i);
});
