const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const core=require(path.join(ROOT,'app/src/main/assets/arcade-roulette-core.js'));

test('roulette live multiplier remains 12 divided by empty matching slots',()=>{
  const round=core.createRound({occupied:['wynaut:yellow','makuhita:yellow']});
  assert.equal(core.matchingSlots(round,{kind:'pokemon',pokemon:'Wynaut'}).length,2);
  assert.equal(core.multiplierFor(round,{kind:'pokemon',pokemon:'Wynaut'}),6);
  assert.equal(core.matchingSlots(round,{kind:'color',color:'yellow'}).length,2);
  assert.equal(core.multiplierFor(round,{kind:'color',color:'yellow'}),6);
  const last=core.createRound({occupied:['wynaut:yellow','wynaut:green']});
  assert.equal(core.multiplierFor(last,{kind:'pokemon',pokemon:'Wynaut'}),12);
});

test('roulette career payout records survive repeated state normalization',()=>{
  const saved={document:global.document,state:global.state,save:global.save,renderProfile:global.renderProfile,
    LuckyDexArcadeSession:global.LuckyDexArcadeSession,LuckyDexRouletteCore:global.LuckyDexRouletteCore,
    LuckyDexArcadePlatform:global.LuckyDexArcadePlatform,setTimeout:global.setTimeout,MathRandom:Math.random,LuckyDexRoulette:global.LuckyDexRoulette};
  try{
    global.document={getElementById(){return null},querySelectorAll(){return []},addEventListener(){}};
    global.state={profile:{coins:5000},settings:{rareOdds:{rouletteServiceDay:0,rouletteRescue:0,rouletteGoldenBall:0}},arcade:{},stats:{arcadeGames:0,arcadeCoins:0}};
    global.save=()=>{};global.renderProfile=()=>{};
    global.LuckyDexArcadeSession={mount(){},hideResult(){},update(){},showResult(){}};
    global.LuckyDexRouletteCore=core;
    delete require.cache[require.resolve(path.join(ROOT,'app/src/main/assets/arcade-platform.js'))];
    const platform=require(path.join(ROOT,'app/src/main/assets/arcade-platform.js'));
    global.LuckyDexArcadePlatform=platform;
    let rolls=[];Math.random=()=>rolls.length?rolls.shift():0;
    global.setTimeout=fn=>{fn();return 1};
    delete require.cache[require.resolve(path.join(ROOT,'app/src/main/assets/arcade-roulette.js'))];
    require(path.join(ROOT,'app/src/main/assets/arcade-roulette.js'));
    const game=global.LuckyDexRoulette;
    game.freshTable(0);
    for(let i=0;i<6;i++){
      const round=global.state.arcade.roulette.activeTable.round;
      const target=core.availableSlots(round)[0];
      game.chooseBet({kind:'slot',slotKey:target.key});
      rolls=[0];
      game.spin();
    }
    const rec=global.state.arcade.roulette;
    assert.equal(rec.tablesCompleted,1);
    assert.equal(rec.gamesPlayed,1);
    assert.equal(rec.spins,6);
    assert.equal(rec.wins,6);
    assert.equal(rec.bestPayout,300);
    assert.equal(rec.biggestMultiplier,12);
    assert.equal(rec.coinsWon,1800);
  }finally{
    Math.random=saved.MathRandom;global.setTimeout=saved.setTimeout;
    for(const [k,v] of Object.entries(saved)){
      if(['MathRandom','setTimeout'].includes(k))continue;
      if(v===undefined)delete global[k];else global[k]=v;
    }
  }
});

test('roulette removes pointer and provides prominent in-wheel win feedback',()=>{
  const html=read('app/src/main/assets/index.html');
  const js=read('app/src/main/assets/arcade-roulette.js');
  assert.doesNotMatch(html,/roulette-wheel-pointer/);
  assert.match(html,/id="rouletteResultFlash"/);
  assert.match(js,/rouletteResultFlash/);
  assert.match(js,/WIN!/);
  assert.match(js,/winning/);
});

test('individual slot bets highlight the matching live wheel segment too',()=>{
  const js=read('app/src/main/assets/arcade-roulette.js');
  assert.doesNotMatch(js,/selectedBet\.kind!==['"]slot['"]/);
  assert.match(js,/core\.betMatches\(slot,selectedBet\)/);
});

test('roulette uses reflective silver and gold balls plus carnival bulb chrome',()=>{
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(css,/\.roulette-wheel-pocket b\{[^}]*radial-gradient[^}]*linear-gradient/s);
  assert.match(css,/\.roulette-wheel-pocket b\.golden\{[^}]*radial-gradient[^}]*linear-gradient/s);
  assert.match(css,/\.roulette-wheel-panel:before/);
  assert.match(css,/roulette-bulb-glow/);
});

test('phone roulette locks to the viewport and scales the wheel with dynamic height',()=>{
  const css=read('app/src/main/assets/arcade-roulette.css');
  assert.match(css,/@media\(max-width:680px\)[\s\S]*\.roulette-game\{[^}]*height:100dvh[^}]*overflow:hidden/);
  assert.match(css,/@media\(max-width:680px\)[\s\S]*\.roulette-wheel\{[^}]*max-width:clamp\(/);
});
