const assert = require('assert');
const path = require('path');

function freshPlatform(overrides={}) {
  const modPath = path.resolve(__dirname, '../app/src/main/assets/arcade-platform.js');
  delete require.cache[modPath];
  global.state = overrides.state || {
    arcade:{voltorbLevel:3,bestMemory:7},
    inventory:{berry:2,potion:1,pokeball:3,greatball:0,ultraball:0},
    pokemon:{}, profile:{coins:0}, stats:{arcadeCoins:0,arcadeGames:0}
  };
  global.API = {sprite:(id, shiny=false)=>`sprite://${shiny?'shiny/':''}${id}`};
  global.save = overrides.save || (()=>{});
  global.showToast = ()=>{};
  global.awardArcadeCoins = overrides.awardArcadeCoins || ((coins)=>coins);
  global.titleCase = s => String(s||'').replaceAll('-', ' ').replace(/\b\w/g,c=>c.toUpperCase());
  return require(modPath);
}

{
  const p=freshPlatform();
  assert.equal(p.ensureArcadeState({lastArcadeVenue:'stadiumClassroom'}).lastArcadeVenue,'stadiumKidsClub');
  assert.equal(p.ensureArcadeState({lastArcadeVenue:'moonStage'}).lastArcadeVenue,'stadiumKidsClub');
  const legacy={voltorbLevel:4,bestMemory:12,customLegacyFlag:99};
  const a=p.ensureArcadeState(legacy);
  assert.strictEqual(a.voltorbLevel,4);
  assert.strictEqual(a.bestMemory,12);
  assert.strictEqual(a.customLegacyFlag,99);
  assert.deepStrictEqual(a.dailyRewards,{});
  assert.deepStrictEqual(a.bestBerryPicker,{easy:0,normal:0,hard:0});
  assert.deepStrictEqual(a.bestHeadIt,{easy:0,normal:0,hard:0,unlimited:0,unlimitedStreak:0});
  assert.deepStrictEqual(a.bestTilePuzzle,{easy:null,normal:null,hard:null});
  assert.strictEqual(a.lastArcadeZone,'amie');
  console.log('PASS ensureArcadeState preserves legacy fields and adds all v0.17 fields');
}

{
  let saves=0;
  const p=freshPlatform({save:()=>{saves++;}});
  global.state.arcade=p.ensureArcadeState(global.state.arcade);
  assert.strictEqual(p.dailyClaimAvailable('berryPicker','2026-10-04'),true);
  let r=p.awardRun({gameId:'berryPicker',label:'Berry Picker',score:1000,coins:50,dailyEligible:true,dailyReward:{key:'berry',amount:2},dateKey:'2026-10-04'});
  assert.deepStrictEqual(r,{coinsAwarded:50,itemAwarded:{key:'berry',amount:2}});
  assert.strictEqual(global.state.inventory.berry,4);
  assert.strictEqual(p.dailyClaimAvailable('berryPicker','2026-10-04'),false);
  r=p.awardRun({gameId:'berryPicker',label:'Berry Picker',score:1200,coins:60,dailyEligible:true,dailyReward:{key:'berry',amount:2},dateKey:'2026-10-04'});
  assert.deepStrictEqual(r,{coinsAwarded:60,itemAwarded:null});
  assert.strictEqual(global.state.inventory.berry,4);
  assert.strictEqual(p.dailyClaimAvailable('berryPicker','2026-10-05'),true);
  r=p.awardRun({gameId:'berryPicker',label:'Berry Picker',score:1400,coins:70,dailyEligible:true,dailyReward:{key:'berry',amount:2},dateKey:'2026-10-05'});
  assert.deepStrictEqual(r,{coinsAwarded:70,itemAwarded:{key:'berry',amount:2}});
  assert.strictEqual(global.state.inventory.berry,6);
  assert.ok(saves>=2);
  console.log('PASS daily item reward can be claimed once on one date and again after date rollover');
}

{
  let awardCalls=0;
  const p=freshPlatform({awardArcadeCoins:(coins)=>{awardCalls++; return coins;}});
  global.state.arcade=p.ensureArcadeState(global.state.arcade);
  let r=p.awardRun({gameId:'headIt',label:'Head It',score:500,coins:25,dailyEligible:false,dailyReward:{key:'potion',amount:1},dateKey:'2026-10-04'});
  assert.strictEqual(r.coinsAwarded,25);
  assert.strictEqual(r.itemAwarded,null);
  global.state.arcade.dailyRewards.headIt='2026-10-04';
  r=p.awardRun({gameId:'headIt',label:'Head It',score:700,coins:35,dailyEligible:true,dailyReward:{key:'potion',amount:1},dateKey:'2026-10-04'});
  assert.strictEqual(r.coinsAwarded,35);
  assert.strictEqual(r.itemAwarded,null);
  assert.strictEqual(awardCalls,2);
  console.log('PASS non-qualifying or already-claimed runs still return their coin award and do not block replay');
}

{
  const p=freshPlatform();
  assert.deepStrictEqual(p.ballDropPayout({ordinaryPoints:1200,jackpots:0}),{ordinaryCoins:72,jackpotCoins:0,totalCoins:72});
  assert.deepStrictEqual(p.ballDropPayout({ordinaryPoints:3000,jackpots:0}),{ordinaryCoins:90,jackpotCoins:0,totalCoins:90});
  assert.deepStrictEqual(p.ballDropPayout({ordinaryPoints:1200,jackpots:2}),{ordinaryCoins:72,jackpotCoins:2000,totalCoins:2072});
  console.log('PASS ballDropPayout converts ordinary points and adds exactly 1000 per jackpot');
}

{
  const p=freshPlatform();
  global.state.pokemon={};
  const rows=p.caughtParticipants(4,[25,133,175,183]);
  assert.strictEqual(rows.length,4);
  assert.deepStrictEqual(rows.map(x=>x.id),[25,133,175,183]);
  assert.ok(rows.every(x=>x.name && x.image));
  console.log('PASS caughtParticipants returns fallback entries when collection is empty');
}


{
  global.LuckyDexAdventureSpecies={byId:{25:{id:25,name:'Pikachu',types:['electric'],baseStats:{speed:90}},143:{id:143,name:'Snorlax',baseStats:{speed:30}}},fallback:{baseStats:{speed:60}}};
  const p=freshPlatform();
  const a=p.ensureArcadeState({customLegacyFlag:17,dash:{futureFlag:'keep-me'}});
  assert.strictEqual(a.customLegacyFlag,17);
  assert.deepStrictEqual(a.dash,{lastRacerKey:null,races:0,wins:0,podiums:0,bestTimeMs:null,lastQuickRacerKey:null,lastLeagueRacerKey:null,quickBestTimes:{easy:null,normal:null,hard:null,expert:null},leagueRecords:{},futureFlag:'keep-me'});
  assert.strictEqual(p.ensureArcadeState({lastArcadeVenue:'dashCourse'}).lastArcadeVenue,'dashCourse');
  console.log('PASS Dash arcade state migrates additively and dashCourse persists');
}

{
  global.LuckyDexAdventureSpecies={byId:{25:{id:25,name:'Pikachu',types:['electric'],baseStats:{speed:90}},143:{id:143,name:'Snorlax',baseStats:{speed:30}}},fallback:{baseStats:{speed:60}}};
  const p=freshPlatform();
  global.state.pokemon={};
  assert.deepStrictEqual(p.dashRacers(),[]);
  global.state.pokemon={
    '25:n':{id:25,name:'pikachu',shiny:false,level:12,baseStats:{speed:88}},
    '143:s':{id:143,name:'snorlax',shiny:true,level:33,baseStats:null}
  };
  const rows=p.dashRacers();
  assert.strictEqual(rows.length,2);
  assert.deepStrictEqual(rows[0],{key:'25:n',id:25,name:'Pikachu',shiny:false,level:12,baseSpeed:90,types:['electric'],image:'arcade/sprites/actors/pokemon/25.png'});
  assert.deepStrictEqual(rows[1],{key:'143:s',id:143,name:'Snorlax',shiny:true,level:33,baseSpeed:30,types:[],image:'arcade/sprites/actors/pokemon/shiny/143.png'});
  console.log('PASS Dash racers come only from caught collection and preserve identity');
}


{
  global.LuckyDexAdventureSpecies={byId:{25:{id:25,name:'Pikachu',types:['Electric'],baseStats:{speed:90}},6:{id:6,name:'Charizard',types:['Fire','Flying'],baseStats:{speed:100}}},fallback:{baseStats:{speed:60}}};
  const p=freshPlatform();
  const migrated=p.ensureArcadeState({dash:{lastRacerKey:'25:n',futureV2Field:{keep:true}}});
  assert.strictEqual(migrated.dash.lastRacerKey,'25:n');
  assert.strictEqual(migrated.dash.lastQuickRacerKey,'25:n');
  assert.strictEqual(migrated.dash.lastLeagueRacerKey,null);
  assert.deepStrictEqual(migrated.dash.quickBestTimes,{easy:null,normal:null,hard:null,expert:null});
  assert.deepStrictEqual(migrated.dash.leagueRecords,{});
  assert.deepStrictEqual(migrated.dash.futureV2Field,{keep:true});
  global.state.pokemon={
    '25:n':{id:25,name:'pikachu',level:5},
    '6:n':{id:6,name:'charizard',level:20},
    '9999:n':{id:9999,name:'mystery',level:1,baseStats:{speed:44}}
  };
  const rows=p.dashRacers();
  assert.deepStrictEqual(rows.find(x=>x.id===25).types,['electric']);
  assert.deepStrictEqual(rows.find(x=>x.id===6).types,['fire','flying']);
  assert.deepStrictEqual(rows.find(x=>x.id===9999).types,[]);
  console.log('PASS Dash v2 migration preserves legacy state and enriches racer types safely');
}
