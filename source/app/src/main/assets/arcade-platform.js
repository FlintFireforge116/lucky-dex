(function(root){
  'use strict';

  const FALLBACK_NAMES={25:'Pikachu',133:'Eevee',175:'Togepi',183:'Marill'};
  const ITEM_KEYS=new Set(['berry','potion','pokeball','greatball','ultraball']);
  const ARCADE_DEFAULTS={
    dailyRewards:{},
    helpSeen:{},
    bestBerryPicker:{easy:0,normal:0,hard:0},
    bestHeadIt:{easy:0,normal:0,hard:0,unlimited:0,unlimitedStreak:0},
    bestTilePuzzle:{easy:null,normal:null,hard:null},
    lastArcadeZone:'amie',
    lastArcadeVenue:'amieGarden',
    museum:{exhibits:{}},
    dash:{lastRacerKey:null,races:0,wins:0,podiums:0,bestTimeMs:null,lastQuickRacerKey:null,lastLeagueRacerKey:null,quickBestTimes:{easy:null,normal:null,hard:null,expert:null},leagueRecords:{}},
    powerTrial:{gamesPlayed:0,fullClears:0,hardClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestSingleHit:0,bestPerfects:0,perfectHits:0,totalTargetsCleared:0,goldenTargetsSeen:0,goldenTargetsCleared:0,lastPokemonKey:null},
    impactTrial:{gamesPlayed:0,fullClears:0,hardClears:0,noDamageClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestIntegrity:0,bestPerfects:0,bestHardenPct:0,perfectDefenses:0,totalHazardsSurvived:0,hardenTargetsHit:0,hardenTargetsSeen:0,goldenHazardsSeen:0,goldenHazardsCleared:0,lastPokemonKey:null},
    targetRange:{gamesPlayed:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestAccuracy:0,bestBullseyes:0,bestBullseyeStreak:0,longestBullseyeM:0,goldenTargetsSeen:0,goldenTargetsWon:0,totalShots:0,totalHits:0,totalBullseyes:0,lastPokemonKey:null},
    elementalGauntlet:{gamesPlayed:0,fullClears:0,hardClears:0,noDamageClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestHealth:0,bestPerfectWaves:0,totalDodges:0,totalGuards:0,totalDamageTaken:0,prismaticStormsSeen:0,prismaticStormsCleared:0,lastPokemonKey:null},
    enduranceExpedition:{gamesPlayed:0,fullClears:0,hardClears:0,flawlessClears:0,lowHpHardClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestEndurancePct:0,bestPerfectStages:0,totalObstaclesCleared:0,totalHits:0,totalJumps:0,goldenCachesSeen:0,goldenCachesCollected:0,lastPokemonKey:null},
    roulette:{gamesPlayed:0,tablesCompleted:0,spins:0,wins:0,exactWins:0,pokemonWins:0,colorWins:0,bestPayout:0,biggestMultiplier:0,coinsWagered:0,coinsWon:0,rescueEvents:0,shroomishRescues:0,taillowRescues:0,serviceDaysSeen:0,serviceDaySpins:0,goldenBalls:0,goldenBallCoins:0,betKindsWon:{slot:0,pokemon:0,color:0},activeTable:null},
    slotMachine:{gamesPlayed:0,spins:0,wins:0,jackpots:0,mixedSevens:0,replays:0,reelTimes:0,bestPayout:0,biggestMultiplier:0,coinsWagered:0,coinsWon:0,maxPower:0,powerHits:0,luckyMachines:0,activeSession:null},
    ekansHoop:{gamesPlayed:0,wins:0,bestScore:0,bestStreak:0,totalHoops:0,shinyHits:0},
    digDigDig:{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0}},
    magikarpSplash:{gamesPlayed:0,wins:0,podiums:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},bestQuickChain:0},
    rockHarden:{gamesPlayed:0,wins:0,podiums:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},bestPerfects:0,perfectBlocks:0,totalBlocks:0,bestHpRemaining:0,goldRocksSeen:0,goldRocksPerfected:0,goldRewardsClaimed:0},
    thunderingDynamo:{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0},bestAccuracy:0,totalCorrect:0,totalWrong:0},
    snoreWar:{gamesPlayed:0,wins:0,podiums:0,bestStreak:0,bestAccuracy:0,totalHits:0,totalMisses:0,winsByDifficulty:{easy:0,normal:0,hard:0},endlessRuns:0,bestEndlessHits:0,bestEndlessStreak:0,bestEndlessPeriodMs:null},
    runRattataRun:{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0},flawlessWins:0,totalHurdlesCleared:0,totalHurdlesHit:0},
    sushiGoRound:{gamesPlayed:0,wins:0,podiums:0,bestBill:0,bestBills:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},bestCombo:0,totalSushiEaten:0,hotPenalties:0},
    clearCutChallenge:{gamesPlayed:0,wins:0,podiums:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},totalPerfects:0,closestCutPct:null,totalAbsErrorPct:0,totalCuts:0,bagsPerfect:0,bagPrizes:0},
    gutsyGolbat:{gamesPlayed:0,wins:0,podiums:0,bestHearts:0,bestHeartsByDifficulty:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},totalHeartsCollected:0,totalHeartsLost:0,magnemiteHits:0,rivalHits:0,goldenHeartsSeen:0,goldenHeartsCollected:0,cleanWins:0},
    furretFrolic:{gamesPlayed:0,wins:0,podiums:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},totalPoints:0,totalBallsScored:0,pokeBalls:0,greatBalls:0,ultraBalls:0,masterBalls:0,masterBallsSeen:0,bestMargin:0},
    topsyTurvy:{gamesPlayed:0,wins:0,podiums:0,bestKnockouts:0,bestKnockoutsByDifficulty:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},totalKnockouts:0,totalFalls:0,rapidSpins:0,shutoutWins:0},
    barrierBall:{gamesPlayed:0,wins:0,podiums:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},totalGoals:0,totalConceded:0,totalReturns:0,totalSmashes:0,bestGoalDifference:0,cleanSheetWins:0},
    pichuPowerPlant:{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0},bestAccuracy:0,totalCorrect:0,totalWrong:0,perfectWins:0},
    rampageRollout:{gamesPlayed:0,wins:0,podiums:0,bestTimeMs:null,bestTimes:{easy:null,normal:null,hard:null},winsByDifficulty:{easy:0,normal:0,hard:0},totalDustDropped:0,totalDustHits:0,dustHitsTaken:0,bestDustHits:0,cleanWins:0},
    streamingStampede:{gamesPlayed:0,wins:0,podiums:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},totalPoints:0,totalError:0,perfectRounds:0,bestPerfectRounds:0,perfectGames:0,finalRoundPerfects:0},
    delibirdDelivery:{gamesPlayed:0,wins:0,podiums:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},winsByDifficulty:{easy:0,normal:0,hard:0},totalDelivered:0,totalBankedPoints:0,totalSwinubHits:0,bestMatchChain:0,bigBagDeliveries:0},
    iceCreamScoop:{gamesPlayed:0,bestHeight:0,bestHeights:{easy:0,normal:0,hard:0},bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestPerfects:0,bestPerfectStreak:0,totalScoops:0,totalPerfects:0,collapses:0,dreamScoopsSeen:0,dreamScoopsLanded:0,dreamPrizes:0},
    wailordWaterSpout:{gamesPlayed:0,clears:0,hardClears:0,perfectClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestBalls:0,bestBallsByDifficulty:{easy:0,normal:0,hard:0},bestCombo:0,maxMultiplier:0,totalBallsOpened:0,totalFalls:0,rainbowBallsSeen:0,rainbowBallsOpened:0,rainbowPrizes:0},
    pokemonSeek:{gamesPlayed:0,clears:0,hardClears:0,cleanFinds:0,lostItemsFound:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestRemainingMs:0,bestCleanScore:0,totalWrongFinds:0,totalListens:0,totalRoomsVisited:0,dreamSparklesSeen:0,dreamSparklesFound:0,dreamPrizes:0,firstSearchFinds:0,areaClears:{},visitedAreas:[]},
    picross:{completed:{},bestTimesMs:{},totalClears:0,noMistakeClears:0},
    pikachuBeach:{classic:{gamesPlayed:0,clears:0,hardClears:0,flawlessClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestRadness:0,bestRemainingHp:0,bestTrick:0,maxFlips:0,totalRadness:0,totalWipeouts:0,luckyWavesSeen:0,luckyWavesLanded:0,luckyPrizes:0},dx:{gamesPlayed:0,clears:0,hardClears:0,flawlessClears:0,bestScore:0,bestScores:{},bestRings:0,bestCombo:0,bestTrick:0,totalRings:0,enemiesDefeated:0,bossDefeats:{},alliesUsed:{},luckyWavesSeen:0,luckyWavesLanded:0,luckyPrizes:0}},
    records:{version:1,games:{}},
    goldenrod:{version:1,events:{dash:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},powerTrial:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},impactTrial:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},targetRange:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},elementalGauntlet:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},enduranceExpedition:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}}}}
  };
  const ZONES={
    amie:{id:'amie',name:'Kalos Amie Garden',icon:'🌸',games:['berryPicker','tilePuzzle']},
    gameCorner:{id:'gameCorner',name:'Game Corner',icon:'🎰',games:['voltorb','roulette','slotMachine','ballDrop']},
    discovery:{id:'discovery',name:'Discovery District',icon:'🔬',games:['fossil','ditto','unown','quiz']},
    performance:{id:'performance',name:'Performance Stage',icon:'🎭',games:['berry','clefairy']}
  };

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function nonNegativeNumber(value,fallback=0){
    const n=Number(value);return Number.isFinite(n)&&n>=0?n:(Number(fallback)||0);
  }
  function numericDifficultyRecord(defaults,value){
    const src=value&&typeof value==='object'?value:{};
    const out={...defaults};
    for(const key of Object.keys(defaults)){
      const n=Number(src[key]);
      out[key]=Number.isFinite(n)&&n>=0?n:Number(defaults[key])||0;
    }
    return out;
  }

  function recordsCore(){
    if(root.LuckyDexArcadeRecordsCore)return root.LuckyDexArcadeRecordsCore;
    if(typeof require==='function'){try{return require('./arcade-records-core.js');}catch(_){}}
    return null;
  }
  function normalizeArcadeRecords(value){
    const core=recordsCore();
    if(core?.appendHistory){
      const src=value&&typeof value==='object'?value:{};const games={};
      const source=src.games&&typeof src.games==='object'?src.games:{};
      for(const [gameId,bucket] of Object.entries(source)){
        const recent=(Array.isArray(bucket?.recent)?bucket.recent:[]).map(row=>core.normalizeHistoryEntry(gameId,row)).filter(Boolean).sort((a,b)=>b.completedAt-a.completedAt).slice(0,10);
        games[gameId]={...(bucket&&typeof bucket==='object'?bucket:{}),recent};
      }
      return {version:1,games};
    }
    const src=value&&typeof value==='object'?value:{};const games={};
    for(const [gameId,bucket] of Object.entries(src.games&&typeof src.games==='object'?src.games:{}))games[gameId]={...(bucket&&typeof bucket==='object'?bucket:{}),recent:Array.isArray(bucket?.recent)?bucket.recent.slice(0,10):[]};
    return {version:1,games};
  }

  function goldenrodStateModule(){
    if(root.LuckyDexGoldenrodState)return root.LuckyDexGoldenrodState;
    if(typeof require==='function'){try{return require('./arcade-goldenrod-state.js');}catch(_){}}
    return null;
  }

  function ensureArcadeState(arcade){
    const input=(arcade&&typeof arcade==='object')?arcade:{};
    const retiredKey=String.fromCharCode(116,117,109,98,108,105,110,103,84,111,103,101,112,105);
    const src=Object.fromEntries(Object.entries(input).filter(([key])=>key!==retiredKey));
    const srcDash=(src.dash&&typeof src.dash==='object')?src.dash:{};
    const dash={
      ...ARCADE_DEFAULTS.dash,
      ...srcDash,
      quickBestTimes:{...ARCADE_DEFAULTS.dash.quickBestTimes,...(srcDash.quickBestTimes&&typeof srcDash.quickBestTimes==='object'?srcDash.quickBestTimes:{})},
      leagueRecords:{...(srcDash.leagueRecords&&typeof srcDash.leagueRecords==='object'?srcDash.leagueRecords:{})}
    };
    if((srcDash.lastQuickRacerKey===undefined||srcDash.lastQuickRacerKey===null)&&srcDash.lastRacerKey)dash.lastQuickRacerKey=srcDash.lastRacerKey;
    const goldenrodModule=goldenrodStateModule();
    const goldenrod=goldenrodModule?.normalizeGoldenrodState?goldenrodModule.normalizeGoldenrodState(src.goldenrod,{legacyDash:dash}):{...ARCADE_DEFAULTS.goldenrod,...(src.goldenrod||{})};
    return {
      ...src,
      dailyRewards:{...ARCADE_DEFAULTS.dailyRewards,...(src.dailyRewards||{})},
      helpSeen:(()=>{const normalized=root.LuckyDexArcadeHelp?.normalizeSeen?.(src.helpSeen);if(normalized)return normalized;const raw=src.helpSeen&&typeof src.helpSeen==='object'&&!Array.isArray(src.helpSeen)?src.helpSeen:{};return Object.fromEntries(Object.entries(raw).filter(([key,value])=>typeof key==='string'&&key.trim()&&value===true));})(),
      bestBerryPicker:{...ARCADE_DEFAULTS.bestBerryPicker,...(src.bestBerryPicker||{})},
      bestHeadIt:{...ARCADE_DEFAULTS.bestHeadIt,...(src.bestHeadIt||{})},
      bestTilePuzzle:{...ARCADE_DEFAULTS.bestTilePuzzle,...(src.bestTilePuzzle||{})},
      museum:{...(src.museum&&typeof src.museum==='object'?src.museum:{}),exhibits:{...((src.museum&&typeof src.museum.exhibits==='object'&&src.museum.exhibits)||{})}},
      dash,
      powerTrial:(()=>{const r=src.powerTrial&&typeof src.powerTrial==='object'?src.powerTrial:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),fullClears:nonNegativeNumber(r.fullClears),hardClears:nonNegativeNumber(r.hardClears),bestScore:nonNegativeNumber(r.bestScore),
        bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.powerTrial.bestScores,r.bestScores),bestSingleHit:nonNegativeNumber(r.bestSingleHit),bestPerfects:nonNegativeNumber(r.bestPerfects),perfectHits:nonNegativeNumber(r.perfectHits),totalTargetsCleared:nonNegativeNumber(r.totalTargetsCleared),goldenTargetsSeen:nonNegativeNumber(r.goldenTargetsSeen),goldenTargetsCleared:nonNegativeNumber(r.goldenTargetsCleared),lastPokemonKey:typeof r.lastPokemonKey==='string'?r.lastPokemonKey:null
      };})(),
      impactTrial:(()=>{const r=src.impactTrial&&typeof src.impactTrial==='object'?src.impactTrial:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),fullClears:nonNegativeNumber(r.fullClears),hardClears:nonNegativeNumber(r.hardClears),noDamageClears:nonNegativeNumber(r.noDamageClears),bestScore:nonNegativeNumber(r.bestScore),
        bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.impactTrial.bestScores,r.bestScores),bestIntegrity:nonNegativeNumber(r.bestIntegrity),bestPerfects:nonNegativeNumber(r.bestPerfects),bestHardenPct:nonNegativeNumber(r.bestHardenPct),perfectDefenses:nonNegativeNumber(r.perfectDefenses),totalHazardsSurvived:nonNegativeNumber(r.totalHazardsSurvived),hardenTargetsHit:nonNegativeNumber(r.hardenTargetsHit),hardenTargetsSeen:nonNegativeNumber(r.hardenTargetsSeen),goldenHazardsSeen:nonNegativeNumber(r.goldenHazardsSeen),goldenHazardsCleared:nonNegativeNumber(r.goldenHazardsCleared),lastPokemonKey:typeof r.lastPokemonKey==='string'?r.lastPokemonKey:null
      };})(),
      targetRange:(()=>{const r=src.targetRange&&typeof src.targetRange==='object'?src.targetRange:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.targetRange.bestScores,r.bestScores),bestAccuracy:nonNegativeNumber(r.bestAccuracy),bestBullseyes:nonNegativeNumber(r.bestBullseyes),bestBullseyeStreak:nonNegativeNumber(r.bestBullseyeStreak),longestBullseyeM:nonNegativeNumber(r.longestBullseyeM),goldenTargetsSeen:nonNegativeNumber(r.goldenTargetsSeen),goldenTargetsWon:nonNegativeNumber(r.goldenTargetsWon),totalShots:nonNegativeNumber(r.totalShots),totalHits:nonNegativeNumber(r.totalHits),totalBullseyes:nonNegativeNumber(r.totalBullseyes),lastPokemonKey:typeof r.lastPokemonKey==='string'?r.lastPokemonKey:null
      };})(),
      elementalGauntlet:(()=>{const r=src.elementalGauntlet&&typeof src.elementalGauntlet==='object'?src.elementalGauntlet:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),fullClears:nonNegativeNumber(r.fullClears),hardClears:nonNegativeNumber(r.hardClears),noDamageClears:nonNegativeNumber(r.noDamageClears),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.elementalGauntlet.bestScores,r.bestScores),bestHealth:nonNegativeNumber(r.bestHealth),bestPerfectWaves:nonNegativeNumber(r.bestPerfectWaves),totalDodges:nonNegativeNumber(r.totalDodges),totalGuards:nonNegativeNumber(r.totalGuards),totalDamageTaken:nonNegativeNumber(r.totalDamageTaken),prismaticStormsSeen:nonNegativeNumber(r.prismaticStormsSeen),prismaticStormsCleared:nonNegativeNumber(r.prismaticStormsCleared),lastPokemonKey:typeof r.lastPokemonKey==='string'?r.lastPokemonKey:null
      };})(),
      enduranceExpedition:(()=>{const r=src.enduranceExpedition&&typeof src.enduranceExpedition==='object'?src.enduranceExpedition:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),fullClears:nonNegativeNumber(r.fullClears),hardClears:nonNegativeNumber(r.hardClears),flawlessClears:nonNegativeNumber(r.flawlessClears),lowHpHardClears:nonNegativeNumber(r.lowHpHardClears),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.enduranceExpedition.bestScores,r.bestScores),bestEndurancePct:nonNegativeNumber(r.bestEndurancePct),bestPerfectStages:nonNegativeNumber(r.bestPerfectStages),totalObstaclesCleared:nonNegativeNumber(r.totalObstaclesCleared),totalHits:nonNegativeNumber(r.totalHits),totalJumps:nonNegativeNumber(r.totalJumps),goldenCachesSeen:nonNegativeNumber(r.goldenCachesSeen),goldenCachesCollected:nonNegativeNumber(r.goldenCachesCollected),lastPokemonKey:typeof r.lastPokemonKey==='string'?r.lastPokemonKey:null
      };})(),
      roulette:(()=>{const r=src.roulette&&typeof src.roulette==='object'?src.roulette:{},b=r.betKindsWon&&typeof r.betKindsWon==='object'?r.betKindsWon:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),tablesCompleted:nonNegativeNumber(r.tablesCompleted),spins:nonNegativeNumber(r.spins),wins:nonNegativeNumber(r.wins),exactWins:nonNegativeNumber(r.exactWins),pokemonWins:nonNegativeNumber(r.pokemonWins),colorWins:nonNegativeNumber(r.colorWins),bestPayout:nonNegativeNumber(r.bestPayout),biggestMultiplier:nonNegativeNumber(r.biggestMultiplier),coinsWagered:nonNegativeNumber(r.coinsWagered),coinsWon:nonNegativeNumber(r.coinsWon),rescueEvents:nonNegativeNumber(r.rescueEvents),shroomishRescues:nonNegativeNumber(r.shroomishRescues),taillowRescues:nonNegativeNumber(r.taillowRescues),serviceDaysSeen:nonNegativeNumber(r.serviceDaysSeen),serviceDaySpins:nonNegativeNumber(r.serviceDaySpins),goldenBalls:nonNegativeNumber(r.goldenBalls),goldenBallCoins:nonNegativeNumber(r.goldenBallCoins),betKindsWon:{slot:nonNegativeNumber(b.slot),pokemon:nonNegativeNumber(b.pokemon),color:nonNegativeNumber(b.color)},activeTable:r.activeTable&&typeof r.activeTable==='object'?r.activeTable:null
      };})(),
      slotMachine:(()=>{const r=src.slotMachine&&typeof src.slotMachine==='object'?src.slotMachine:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),spins:nonNegativeNumber(r.spins),wins:nonNegativeNumber(r.wins),jackpots:nonNegativeNumber(r.jackpots),mixedSevens:nonNegativeNumber(r.mixedSevens),replays:nonNegativeNumber(r.replays),reelTimes:nonNegativeNumber(r.reelTimes),bestPayout:nonNegativeNumber(r.bestPayout),biggestMultiplier:nonNegativeNumber(r.biggestMultiplier),coinsWagered:nonNegativeNumber(r.coinsWagered),coinsWon:nonNegativeNumber(r.coinsWon),maxPower:nonNegativeNumber(r.maxPower),powerHits:nonNegativeNumber(r.powerHits),luckyMachines:nonNegativeNumber(r.luckyMachines),activeSession:r.activeSession&&typeof r.activeSession==='object'?r.activeSession:null
      };})(),
      ekansHoop:{...ARCADE_DEFAULTS.ekansHoop,...(src.ekansHoop&&typeof src.ekansHoop==='object'?src.ekansHoop:{})},
      digDigDig:{...ARCADE_DEFAULTS.digDigDig,...(src.digDigDig&&typeof src.digDigDig==='object'?src.digDigDig:{}),bestTimes:{...ARCADE_DEFAULTS.digDigDig.bestTimes,...(src.digDigDig&&typeof src.digDigDig.bestTimes==='object'?src.digDigDig.bestTimes:{})},winsByDifficulty:{...ARCADE_DEFAULTS.digDigDig.winsByDifficulty,...(src.digDigDig&&typeof src.digDigDig.winsByDifficulty==='object'?src.digDigDig.winsByDifficulty:{})}},
      magikarpSplash:{...ARCADE_DEFAULTS.magikarpSplash,...(src.magikarpSplash&&typeof src.magikarpSplash==='object'?src.magikarpSplash:{}),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.magikarpSplash.bestScores,src.magikarpSplash?.bestScores),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.magikarpSplash.winsByDifficulty,src.magikarpSplash?.winsByDifficulty)},
      records:normalizeArcadeRecords(src.records),
      goldenrod,
      thunderingDynamo:(()=>{const r=src.thunderingDynamo&&typeof src.thunderingDynamo==='object'?src.thunderingDynamo:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestTimeMs:r.bestTimeMs==null?null:nonNegativeNumber(r.bestTimeMs),
        bestTimes:{easy:r.bestTimes?.easy==null?null:nonNegativeNumber(r.bestTimes.easy),normal:r.bestTimes?.normal==null?null:nonNegativeNumber(r.bestTimes.normal),hard:r.bestTimes?.hard==null?null:nonNegativeNumber(r.bestTimes.hard)},
        winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.thunderingDynamo.winsByDifficulty,r.winsByDifficulty),bestAccuracy:nonNegativeNumber(r.bestAccuracy),totalCorrect:nonNegativeNumber(r.totalCorrect),totalWrong:nonNegativeNumber(r.totalWrong)
      };})(),
      snoreWar:(()=>{const r=src.snoreWar&&typeof src.snoreWar==='object'?src.snoreWar:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestStreak:nonNegativeNumber(r.bestStreak),bestAccuracy:nonNegativeNumber(r.bestAccuracy),totalHits:nonNegativeNumber(r.totalHits),totalMisses:nonNegativeNumber(r.totalMisses),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.snoreWar.winsByDifficulty,r.winsByDifficulty),endlessRuns:nonNegativeNumber(r.endlessRuns),bestEndlessHits:nonNegativeNumber(r.bestEndlessHits),bestEndlessStreak:nonNegativeNumber(r.bestEndlessStreak),bestEndlessPeriodMs:r.bestEndlessPeriodMs==null?null:nonNegativeNumber(r.bestEndlessPeriodMs)
      };})(),
      runRattataRun:(()=>{const r=src.runRattataRun&&typeof src.runRattataRun==='object'?src.runRattataRun:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestTimeMs:r.bestTimeMs==null?null:nonNegativeNumber(r.bestTimeMs),bestTimes:{easy:r.bestTimes?.easy==null?null:nonNegativeNumber(r.bestTimes.easy),normal:r.bestTimes?.normal==null?null:nonNegativeNumber(r.bestTimes.normal),hard:r.bestTimes?.hard==null?null:nonNegativeNumber(r.bestTimes.hard)},winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.runRattataRun.winsByDifficulty,r.winsByDifficulty),flawlessWins:nonNegativeNumber(r.flawlessWins),totalHurdlesCleared:nonNegativeNumber(r.totalHurdlesCleared),totalHurdlesHit:nonNegativeNumber(r.totalHurdlesHit)
      };})(),
      sushiGoRound:(()=>{const r=src.sushiGoRound&&typeof src.sushiGoRound==='object'?src.sushiGoRound:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestBill:nonNegativeNumber(r.bestBill),bestBills:numericDifficultyRecord(ARCADE_DEFAULTS.sushiGoRound.bestBills,r.bestBills),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.sushiGoRound.winsByDifficulty,r.winsByDifficulty),bestCombo:nonNegativeNumber(r.bestCombo),totalSushiEaten:nonNegativeNumber(r.totalSushiEaten),hotPenalties:nonNegativeNumber(r.hotPenalties)
      };})(),
      clearCutChallenge:(()=>{const r=src.clearCutChallenge&&typeof src.clearCutChallenge==='object'?src.clearCutChallenge:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.clearCutChallenge.bestScores,r.bestScores),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.clearCutChallenge.winsByDifficulty,r.winsByDifficulty),totalPerfects:nonNegativeNumber(r.totalPerfects),closestCutPct:r.closestCutPct==null?null:nonNegativeNumber(r.closestCutPct),totalAbsErrorPct:nonNegativeNumber(r.totalAbsErrorPct),totalCuts:nonNegativeNumber(r.totalCuts),bagsPerfect:nonNegativeNumber(r.bagsPerfect),bagPrizes:nonNegativeNumber(r.bagPrizes)
      };})(),
      gutsyGolbat:(()=>{const r=src.gutsyGolbat&&typeof src.gutsyGolbat==='object'?src.gutsyGolbat:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestHearts:nonNegativeNumber(r.bestHearts),bestHeartsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.gutsyGolbat.bestHeartsByDifficulty,r.bestHeartsByDifficulty),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.gutsyGolbat.winsByDifficulty,r.winsByDifficulty),totalHeartsCollected:nonNegativeNumber(r.totalHeartsCollected),totalHeartsLost:nonNegativeNumber(r.totalHeartsLost),magnemiteHits:nonNegativeNumber(r.magnemiteHits),rivalHits:nonNegativeNumber(r.rivalHits),goldenHeartsSeen:nonNegativeNumber(r.goldenHeartsSeen),goldenHeartsCollected:nonNegativeNumber(r.goldenHeartsCollected),cleanWins:nonNegativeNumber(r.cleanWins)
      };})(),
      furretFrolic:(()=>{const r=src.furretFrolic&&typeof src.furretFrolic==='object'?src.furretFrolic:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.furretFrolic.bestScores,r.bestScores),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.furretFrolic.winsByDifficulty,r.winsByDifficulty),totalPoints:nonNegativeNumber(r.totalPoints),totalBallsScored:nonNegativeNumber(r.totalBallsScored),pokeBalls:nonNegativeNumber(r.pokeBalls),greatBalls:nonNegativeNumber(r.greatBalls),ultraBalls:nonNegativeNumber(r.ultraBalls),masterBalls:nonNegativeNumber(r.masterBalls),masterBallsSeen:nonNegativeNumber(r.masterBallsSeen),bestMargin:nonNegativeNumber(r.bestMargin)
      };})(),
      topsyTurvy:(()=>{const r=src.topsyTurvy&&typeof src.topsyTurvy==='object'?src.topsyTurvy:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestKnockouts:nonNegativeNumber(r.bestKnockouts),bestKnockoutsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.topsyTurvy.bestKnockoutsByDifficulty,r.bestKnockoutsByDifficulty),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.topsyTurvy.winsByDifficulty,r.winsByDifficulty),totalKnockouts:nonNegativeNumber(r.totalKnockouts),totalFalls:nonNegativeNumber(r.totalFalls),rapidSpins:nonNegativeNumber(r.rapidSpins),shutoutWins:nonNegativeNumber(r.shutoutWins)
      };})(),
      barrierBall:(()=>{const r=src.barrierBall&&typeof src.barrierBall==='object'?src.barrierBall:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.barrierBall.bestScores,r.bestScores),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.barrierBall.winsByDifficulty,r.winsByDifficulty),totalGoals:nonNegativeNumber(r.totalGoals),totalConceded:nonNegativeNumber(r.totalConceded),totalReturns:nonNegativeNumber(r.totalReturns),totalSmashes:nonNegativeNumber(r.totalSmashes),bestGoalDifference:nonNegativeNumber(r.bestGoalDifference),cleanSheetWins:nonNegativeNumber(r.cleanSheetWins)
      };})(),
      pichuPowerPlant:(()=>{const r=src.pichuPowerPlant&&typeof src.pichuPowerPlant==='object'?src.pichuPowerPlant:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestTimeMs:r.bestTimeMs==null?null:nonNegativeNumber(r.bestTimeMs),
        bestTimes:{easy:r.bestTimes?.easy==null?null:nonNegativeNumber(r.bestTimes.easy),normal:r.bestTimes?.normal==null?null:nonNegativeNumber(r.bestTimes.normal),hard:r.bestTimes?.hard==null?null:nonNegativeNumber(r.bestTimes.hard)},
        winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.pichuPowerPlant.winsByDifficulty,r.winsByDifficulty),bestAccuracy:Math.min(100,nonNegativeNumber(r.bestAccuracy)),totalCorrect:nonNegativeNumber(r.totalCorrect),totalWrong:nonNegativeNumber(r.totalWrong),perfectWins:nonNegativeNumber(r.perfectWins)
      };})(),
      rampageRollout:(()=>{const r=src.rampageRollout&&typeof src.rampageRollout==='object'?src.rampageRollout:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestTimeMs:r.bestTimeMs==null?null:nonNegativeNumber(r.bestTimeMs),
        bestTimes:{easy:r.bestTimes?.easy==null?null:nonNegativeNumber(r.bestTimes.easy),normal:r.bestTimes?.normal==null?null:nonNegativeNumber(r.bestTimes.normal),hard:r.bestTimes?.hard==null?null:nonNegativeNumber(r.bestTimes.hard)},
        winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.rampageRollout.winsByDifficulty,r.winsByDifficulty),totalDustDropped:nonNegativeNumber(r.totalDustDropped),totalDustHits:nonNegativeNumber(r.totalDustHits),dustHitsTaken:nonNegativeNumber(r.dustHitsTaken),bestDustHits:nonNegativeNumber(r.bestDustHits),cleanWins:nonNegativeNumber(r.cleanWins)
      };})(),
      streamingStampede:(()=>{const r=src.streamingStampede&&typeof src.streamingStampede==='object'?src.streamingStampede:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.streamingStampede.bestScores,r.bestScores),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.streamingStampede.winsByDifficulty,r.winsByDifficulty),totalPoints:nonNegativeNumber(r.totalPoints),totalError:nonNegativeNumber(r.totalError),perfectRounds:nonNegativeNumber(r.perfectRounds),bestPerfectRounds:nonNegativeNumber(r.bestPerfectRounds),perfectGames:nonNegativeNumber(r.perfectGames),finalRoundPerfects:nonNegativeNumber(r.finalRoundPerfects)
      };})(),
      delibirdDelivery:(()=>{const r=src.delibirdDelivery&&typeof src.delibirdDelivery==='object'?src.delibirdDelivery:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.delibirdDelivery.bestScores,r.bestScores),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.delibirdDelivery.winsByDifficulty,r.winsByDifficulty),totalDelivered:nonNegativeNumber(r.totalDelivered),totalBankedPoints:nonNegativeNumber(r.totalBankedPoints),totalSwinubHits:nonNegativeNumber(r.totalSwinubHits),bestMatchChain:nonNegativeNumber(r.bestMatchChain),bigBagDeliveries:nonNegativeNumber(r.bigBagDeliveries)
      };})(),
      iceCreamScoop:(()=>{const r=src.iceCreamScoop&&typeof src.iceCreamScoop==='object'?src.iceCreamScoop:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),bestHeight:nonNegativeNumber(r.bestHeight),bestHeights:numericDifficultyRecord(ARCADE_DEFAULTS.iceCreamScoop.bestHeights,r.bestHeights),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.iceCreamScoop.bestScores,r.bestScores),bestPerfects:nonNegativeNumber(r.bestPerfects),bestPerfectStreak:nonNegativeNumber(r.bestPerfectStreak),totalScoops:nonNegativeNumber(r.totalScoops),totalPerfects:nonNegativeNumber(r.totalPerfects),collapses:nonNegativeNumber(r.collapses),dreamScoopsSeen:nonNegativeNumber(r.dreamScoopsSeen),dreamScoopsLanded:nonNegativeNumber(r.dreamScoopsLanded),dreamPrizes:nonNegativeNumber(r.dreamPrizes)
      };})(),
      wailordWaterSpout:(()=>{const r=src.wailordWaterSpout&&typeof src.wailordWaterSpout==='object'?src.wailordWaterSpout:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),clears:nonNegativeNumber(r.clears),hardClears:nonNegativeNumber(r.hardClears),perfectClears:nonNegativeNumber(r.perfectClears),bestScore:nonNegativeNumber(r.bestScore),bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.wailordWaterSpout.bestScores,r.bestScores),bestBalls:nonNegativeNumber(r.bestBalls),bestBallsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.wailordWaterSpout.bestBallsByDifficulty,r.bestBallsByDifficulty),bestCombo:nonNegativeNumber(r.bestCombo),maxMultiplier:nonNegativeNumber(r.maxMultiplier),totalBallsOpened:nonNegativeNumber(r.totalBallsOpened),totalFalls:nonNegativeNumber(r.totalFalls),rainbowBallsSeen:nonNegativeNumber(r.rainbowBallsSeen),rainbowBallsOpened:nonNegativeNumber(r.rainbowBallsOpened),rainbowPrizes:nonNegativeNumber(r.rainbowPrizes)
      };})(),
      pokemonSeek:(()=>{const r=src.pokemonSeek&&typeof src.pokemonSeek==='object'?src.pokemonSeek:{};return {
        ...r,
        firstSearchFinds:nonNegativeNumber(r.firstSearchFinds),
        areaClears:Object.fromEntries(Object.entries(r.areaClears&&typeof r.areaClears==='object'&&!Array.isArray(r.areaClears)?r.areaClears:{}).filter(([key])=>key.trim()).map(([key,value])=>[key,nonNegativeNumber(value)])),
        visitedAreas:[...new Set((Array.isArray(r.visitedAreas)?r.visitedAreas:[]).filter(id=>typeof id==='string'&&id.trim()))],
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),clears:nonNegativeNumber(r.clears),hardClears:nonNegativeNumber(r.hardClears),cleanFinds:nonNegativeNumber(r.cleanFinds),lostItemsFound:nonNegativeNumber(r.lostItemsFound),bestScore:nonNegativeNumber(r.bestScore),bestScores:{...(r.bestScores&&typeof r.bestScores==='object'&&!Array.isArray(r.bestScores)?r.bestScores:{}),...numericDifficultyRecord(ARCADE_DEFAULTS.pokemonSeek.bestScores,r.bestScores)},bestRemainingMs:nonNegativeNumber(r.bestRemainingMs),bestCleanScore:nonNegativeNumber(r.bestCleanScore),totalWrongFinds:nonNegativeNumber(r.totalWrongFinds),totalListens:nonNegativeNumber(r.totalListens),totalRoomsVisited:nonNegativeNumber(r.totalRoomsVisited),dreamSparklesSeen:nonNegativeNumber(r.dreamSparklesSeen),dreamSparklesFound:nonNegativeNumber(r.dreamSparklesFound),dreamPrizes:nonNegativeNumber(r.dreamPrizes)
      };})(),
      picross:(()=>{const r=src.picross&&typeof src.picross==='object'&&!Array.isArray(src.picross)?src.picross:{};const cleanMap=value=>Object.fromEntries(Object.entries(value&&typeof value==='object'&&!Array.isArray(value)?value:{}).filter(([key])=>typeof key==='string'&&key.trim()).map(([key,val])=>[key,val]));const completed=Object.fromEntries(Object.entries(cleanMap(r.completed)).map(([key,val])=>{const row=val&&typeof val==='object'?val:{};return [key,{area:nonNegativeNumber(row.area),timeMs:nonNegativeNumber(row.timeMs),bestMistakes:nonNegativeNumber(row.bestMistakes),completedAt:nonNegativeNumber(row.completedAt)}];}));const bestTimesMs=Object.fromEntries(Object.entries(cleanMap(r.bestTimesMs)).map(([key,val])=>[key,nonNegativeNumber(val)]));return {completed,bestTimesMs,totalClears:nonNegativeNumber(r.totalClears),noMistakeClears:nonNegativeNumber(r.noMistakeClears)};})(),
      pikachuBeach:(()=>{const r=src.pikachuBeach&&typeof src.pikachuBeach==='object'&&!Array.isArray(src.pikachuBeach)?src.pikachuBeach:{};const split=(r.classic&&typeof r.classic==='object')||(r.dx&&typeof r.dx==='object');const c=split?(r.classic&&typeof r.classic==='object'?r.classic:{}):r;const d=split?(r.dx&&typeof r.dx==='object'?r.dx:{}):{};const numMap=value=>Object.fromEntries(Object.entries(value&&typeof value==='object'&&!Array.isArray(value)?value:{}).filter(([k])=>k.trim()).map(([k,v])=>[k,nonNegativeNumber(v)]));const classic={
        ...c,gamesPlayed:nonNegativeNumber(c.gamesPlayed),clears:nonNegativeNumber(c.clears),hardClears:nonNegativeNumber(c.hardClears),flawlessClears:nonNegativeNumber(c.flawlessClears),bestScore:nonNegativeNumber(c.bestScore),bestScores:{...(c.bestScores&&typeof c.bestScores==='object'?c.bestScores:{}),...numericDifficultyRecord(ARCADE_DEFAULTS.pikachuBeach.classic.bestScores,c.bestScores)},bestRadness:nonNegativeNumber(c.bestRadness),bestRemainingHp:nonNegativeNumber(c.bestRemainingHp),bestTrick:nonNegativeNumber(c.bestTrick),maxFlips:nonNegativeNumber(c.maxFlips),totalRadness:nonNegativeNumber(c.totalRadness),totalWipeouts:nonNegativeNumber(c.totalWipeouts),luckyWavesSeen:nonNegativeNumber(c.luckyWavesSeen),luckyWavesLanded:nonNegativeNumber(c.luckyWavesLanded),luckyPrizes:nonNegativeNumber(c.luckyPrizes)
      };const dx={...d,gamesPlayed:nonNegativeNumber(d.gamesPlayed),clears:nonNegativeNumber(d.clears),hardClears:nonNegativeNumber(d.hardClears),flawlessClears:nonNegativeNumber(d.flawlessClears),bestScore:nonNegativeNumber(d.bestScore),bestScores:numMap(d.bestScores),bestRings:nonNegativeNumber(d.bestRings),bestCombo:nonNegativeNumber(d.bestCombo),bestTrick:nonNegativeNumber(d.bestTrick),totalRings:nonNegativeNumber(d.totalRings),enemiesDefeated:nonNegativeNumber(d.enemiesDefeated),bossDefeats:numMap(d.bossDefeats),alliesUsed:numMap(d.alliesUsed),luckyWavesSeen:nonNegativeNumber(d.luckyWavesSeen),luckyWavesLanded:nonNegativeNumber(d.luckyWavesLanded),luckyPrizes:nonNegativeNumber(d.luckyPrizes)};return split?{...r,classic,dx}:{classic,dx};})(),
      rockHarden:(()=>{const r=src.rockHarden&&typeof src.rockHarden==='object'?src.rockHarden:{};return {
        gamesPlayed:nonNegativeNumber(r.gamesPlayed),wins:nonNegativeNumber(r.wins),podiums:nonNegativeNumber(r.podiums),bestScore:nonNegativeNumber(r.bestScore),
        bestScores:numericDifficultyRecord(ARCADE_DEFAULTS.rockHarden.bestScores,r.bestScores),winsByDifficulty:numericDifficultyRecord(ARCADE_DEFAULTS.rockHarden.winsByDifficulty,r.winsByDifficulty),
        bestPerfects:nonNegativeNumber(r.bestPerfects),perfectBlocks:nonNegativeNumber(r.perfectBlocks),totalBlocks:nonNegativeNumber(r.totalBlocks),bestHpRemaining:nonNegativeNumber(r.bestHpRemaining),
        goldRocksSeen:nonNegativeNumber(r.goldRocksSeen),goldRocksPerfected:nonNegativeNumber(r.goldRocksPerfected),goldRewardsClaimed:nonNegativeNumber(r.goldRewardsClaimed)
      };})(),
      lastArcadeZone:typeof src.lastArcadeZone==='string'&&src.lastArcadeZone?src.lastArcadeZone:ARCADE_DEFAULTS.lastArcadeZone,
      lastArcadeVenue:['amieGarden','goldenrod','celadonPrize','lilycoveContest','oreburghMuseum','ruinsAlph','indigoQuiz','dashCourse','stadiumKidsClub','stadium2KidsClub','dreamWorld','picrossPlaza','summerBeach'].includes(src.lastArcadeVenue)?src.lastArcadeVenue:['moonStage','stadiumClassroom'].includes(src.lastArcadeVenue)?'stadiumKidsClub':({amie:'amieGarden',gameCorner:'goldenrod',discovery:'oreburghMuseum',performance:'lilycoveContest',moonStage:'stadiumKidsClub'}[src.lastArcadeZone]||'amieGarden')
    };
  }
  function todayKey(date){
    const d=date instanceof Date?date:new Date();
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function getState(){return root.state||globalThis.state;}
  function dailyClaimAvailable(gameId,dateKey){
    const s=getState();
    if(!s)return false;
    s.arcade=ensureArcadeState(s.arcade);
    const key=dateKey||todayKey();
    return s.arcade.dailyRewards[String(gameId)]!==key;
  }
  function awardRun({gameId,label,score=0,coins=0,dailyEligible=false,dailyReward=null,dateKey=null}={}){
    const s=getState();
    if(!s)throw new Error('LuckyDex state unavailable');
    s.arcade=ensureArcadeState(s.arcade);
    const rawCoins=Math.max(0,Math.round(Number(coins)||0));
    const awardFn=root.awardArcadeCoins||globalThis.awardArcadeCoins;
    const awarded=typeof awardFn==='function'?Number(awardFn(rawCoins,label||'Arcade',gameId||'all')):rawCoins;
    let itemAwarded=null;
    const key=dateKey||todayKey();
    if(dailyEligible&&dailyReward&&ITEM_KEYS.has(dailyReward.key)&&Number(dailyReward.amount)>0&&dailyClaimAvailable(gameId,key)){
      const amount=Math.max(1,Math.round(Number(dailyReward.amount)));
      s.inventory=s.inventory||{};
      s.inventory[dailyReward.key]=Number(s.inventory[dailyReward.key]||0)+amount;
      s.arcade.dailyRewards[String(gameId)]=key;
      itemAwarded={key:dailyReward.key,amount};
      const saveFn=root.save||globalThis.save;
      if(typeof saveFn==='function')saveFn();
      const toastFn=root.showToast||globalThis.showToast;
      if(typeof toastFn==='function')toastFn(`${label||'Arcade'} daily bonus: +${amount} ${dailyReward.key}`);
    }
    return {coinsAwarded:Number.isFinite(awarded)?awarded:rawCoins,itemAwarded};
  }
  function fallbackName(id){return FALLBACK_NAMES[Number(id)]||`Pokémon ${id}`;}
  function spriteFor(id,shiny){
    const api=root.API||globalThis.API;
    return `arcade/sprites/actors/pokemon/${shiny?'shiny/':''}${id}.png`;
  }
  function displayName(entry,id){
    const raw=entry?.name||fallbackName(id);
    const tc=root.titleCase||globalThis.titleCase;
    return typeof tc==='function'?tc(raw):String(raw).replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase());
  }
  function caughtParticipants(limit,fallbackIds=[25,133,175,183]){
    const max=Math.max(0,Math.floor(Number(limit)||0));
    if(!max)return [];
    const s=getState()||{};
    const seen=new Set();
    const result=[];
    for(const entry of Object.values(s.pokemon||{})){
      const id=Number(entry?.id);
      if(!Number.isFinite(id)||id<=0)continue;
      const identity=`${id}:${entry?.shiny?'s':'n'}`;
      if(seen.has(identity))continue;
      seen.add(identity);
      result.push({id,name:displayName(entry,id),shiny:!!entry?.shiny,image:spriteFor(id,!!entry?.shiny)});
      if(result.length>=max)return result;
    }
    for(const rawId of fallbackIds||[]){
      const id=Number(rawId);
      if(!Number.isFinite(id)||id<=0)continue;
      const identity=`${id}:n`;
      if(seen.has(identity))continue;
      seen.add(identity);
      result.push({id,name:fallbackName(id),shiny:false,image:spriteFor(id,false)});
      if(result.length>=max)break;
    }
    return result;
  }
  function dashRacers(){
    const s=getState()||{};
    const dataset=root.LuckyDexAdventureSpecies||globalThis.LuckyDexAdventureSpecies||{};
    const byId=dataset.byId||{};
    const neutral=Number(dataset.fallback?.baseStats?.speed)||60;
    return Object.entries(s.pokemon||{}).map(([key,entry])=>{
      const id=Number(entry?.id);
      if(!Number.isFinite(id)||id<=0)return null;
      const species=byId[id]||byId[String(id)]||null;
      const speciesSpeed=Number(species?.baseStats?.speed);
      const entrySpeed=Number(entry?.baseStats?.speed);
      const baseSpeed=Number.isFinite(speciesSpeed)&&speciesSpeed>0?speciesSpeed:(Number.isFinite(entrySpeed)&&entrySpeed>0?entrySpeed:neutral);
      const racer={key:String(key),id,name:displayName(entry,id),shiny:!!entry?.shiny,level:Math.max(1,Math.round(Number(entry?.level)||1)),baseSpeed,types:Array.isArray(species?.types)?species.types.map(x=>String(x).toLowerCase()):[],image:spriteFor(id,!!entry?.shiny)};
      const speciesHeight=Number(species?.height),speciesWeight=Number(species?.weight);
      if(Number.isFinite(speciesHeight)&&speciesHeight>0)racer.height=speciesHeight;
      if(Number.isFinite(speciesWeight)&&speciesWeight>0)racer.weight=speciesWeight;
      return racer;
    }).filter(Boolean).sort((a,b)=>a.id-b.id||Number(a.shiny)-Number(b.shiny)||a.key.localeCompare(b.key));
  }
  function challengeParticipants(statKey='attack'){
    const s=getState()||{},dataset=root.LuckyDexAdventureSpecies||globalThis.LuckyDexAdventureSpecies||{},byId=dataset.byId||{},key=String(statKey||'attack'),neutral=Number(dataset.fallback?.baseStats?.[key])||60;
    return Object.entries(s.pokemon||{}).map(([saveKey,entry])=>{
      const id=Number(entry?.id);if(!Number.isFinite(id)||id<=0)return null;const species=byId[id]||byId[String(id)]||null,speciesStat=Number(species?.baseStats?.[key]),entryStat=Number(entry?.baseStats?.[key]);
      const baseStat=Number.isFinite(speciesStat)&&speciesStat>0?speciesStat:(Number.isFinite(entryStat)&&entryStat>0?entryStat:neutral);
      return {key:String(saveKey),id,name:displayName(entry,id),shiny:!!entry?.shiny,level:Math.max(1,Math.round(Number(entry?.level)||1)),statKey:key,baseStat,types:Array.isArray(species?.types)?species.types.map(x=>String(x).toLowerCase()):[],image:spriteFor(id,!!entry?.shiny)};
    }).filter(Boolean).sort((a,b)=>b.baseStat-a.baseStat||a.name.localeCompare(b.name)||a.key.localeCompare(b.key));
  }
  function ballDropPayout({ordinaryPoints=0,jackpots=0}={}){
    const points=Math.max(0,Number(ordinaryPoints)||0);
    const ordinaryCoins=points<=0?0:clamp(Math.round(points*0.06),15,90);
    const jackpotCoins=Math.max(0,Math.floor(Number(jackpots)||0))*1000;
    return {ordinaryCoins,jackpotCoins,totalCoins:ordinaryCoins+jackpotCoins};
  }

  const api={ZONES,ensureArcadeState,normalizeArcadeRecords,todayKey,dailyClaimAvailable,awardRun,caughtParticipants,dashRacers,challengeParticipants,ballDropPayout};
  root.LuckyDexArcadePlatform=api;
  if(root.state)root.state.arcade=ensureArcadeState(root.state.arcade);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
