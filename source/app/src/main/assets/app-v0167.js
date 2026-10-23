const API = {
  pokeSpecies: 'https://pokeapi.co/api/v2/pokemon-species?limit=2000',
  pokemon: id => `https://pokeapi.co/api/v2/pokemon/${id}`,
  pokeType: type => `https://pokeapi.co/api/v2/type/${type}`,
  tcgSets: 'https://api.tcgdex.net/v2/en/sets',
  tcgSeries: id => `https://api.tcgdex.net/v2/en/series/${id}`,
  tcgSet: id => `https://api.tcgdex.net/v2/en/sets/${id}`,
  card: id => `https://api.tcgdex.net/v2/en/cards/${id}`,
  sprite: (id, shiny=false) => `arcade/sprites/pokemon/${shiny ? 'shiny/' : ''}${id}.png`
};

const MAX_DEX_ID = 1025;
const LEGENDARY_RATE = 1 / 400;
const RARE_WILD_RATE = 1 / 20;
const PACK_COST = {tcgp:450};
const TCGP_TEN_PACK_COUNT = 10;
function pocketTenPackCost(set=null){const singleCost=Math.max(0,Math.round(Number(window.LuckyDexPackPolicy?.priceFor?.(set,'tcgp')||PACK_COST.tcgp||450)));return singleCost*TCGP_TEN_PACK_COUNT;}
const BALLS = {
  pokeball:{name:'Poké Ball',mod:1,emoji:'🔴'},
  premierball:{name:'Premier Ball',mod:1,emoji:'⚪'},
  greatball:{name:'Great Ball',mod:1.5,emoji:'🔵'},
  ultraball:{name:'Ultra Ball',mod:2,emoji:'🟡'}
};
const LEGENDARIES = new Set([144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,772,773,785,786,787,788,789,790,791,792,800,801,802,807,808,809,888,889,890,891,892,893,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1009,1010,1024,1025]);
const MYTHICAL = new Set([151,251,385,386,489,490,491,492,493,494,647,648,649,719,720,721,801,802,807,808,809,893]);
const RARE_WILD = new Set([
  1,2,3,4,5,6,7,8,9,138,139,140,141,142,147,148,149,152,153,154,155,156,157,158,159,160,246,247,248,
  252,253,254,255,256,257,258,259,260,345,346,347,348,371,372,373,374,375,376,387,388,389,390,391,392,393,394,395,
  408,409,410,411,443,444,445,495,496,497,498,499,500,501,502,503,564,565,566,567,633,634,635,650,651,652,653,654,655,
  656,657,658,696,697,698,699,704,705,706,722,723,724,725,726,727,728,729,730,782,783,784,810,811,812,813,814,815,816,
  817,818,880,881,882,883,885,886,887,906,907,908,909,910,911,912,913,914,996,997,998
]);
const GENERATIONS = [
  {id:1,name:'Kanto',min:1,max:151},{id:2,name:'Johto',min:152,max:251},{id:3,name:'Hoenn',min:252,max:386},
  {id:4,name:'Sinnoh',min:387,max:493},{id:5,name:'Unova',min:494,max:649},{id:6,name:'Kalos',min:650,max:721},
  {id:7,name:'Alola',min:722,max:809},{id:8,name:'Galar/Hisui',min:810,max:905},{id:9,name:'Paldea',min:906,max:1025}
];
const ZONES = {
  meadow:{name:'Meadow',emoji:'🌿',types:['grass','normal','bug','fairy'],rank:1,levels:[2,8],flavor:'Open grassland and woodland edges'},
  cave:{name:'Cave',emoji:'🪨',types:['rock','ground','dark','poison','steel'],rank:3,levels:[6,14],flavor:'Deep tunnels and mineral chambers'},
  haunted:{name:'Haunted House',emoji:'🏚️',types:['ghost','psychic','dark','poison'],rank:5,levels:[10,20],flavor:'An abandoned manor outside Lavender Town'},
  coast:{name:'Coast',emoji:'🌊',types:['water','ice','flying'],rank:6,levels:[10,20],flavor:'Rock pools, beaches and rough surf'},
  volcano:{name:'Volcano',emoji:'🌋',types:['fire','rock','ground','dragon'],rank:10,levels:[16,28],flavor:'Hot caverns beneath an active crater'}
};
// v0.15.7: Adventure must remain playable when Android reports a connection
// but PokeAPI is slow/unreachable. These are immediate local encounter seeds;
// a successful background refresh replaces them with the full live type pool.
const LOCAL_ZONE_POOLS={
  meadow:[[10,'caterpie'],[13,'weedle'],[16,'pidgey'],[19,'rattata'],[21,'spearow'],[25,'pikachu'],[29,'nidoran-f'],[32,'nidoran-m'],[35,'clefairy'],[39,'jigglypuff'],[43,'oddish'],[46,'paras'],[48,'venonat'],[52,'meowth'],[69,'bellsprout'],[102,'exeggcute'],[113,'chansey'],[123,'scyther'],[127,'pinsir'],[133,'eevee']],
  cave:[[41,'zubat'],[50,'diglett'],[51,'dugtrio'],[66,'machop'],[67,'machoke'],[74,'geodude'],[75,'graveler'],[95,'onix'],[111,'rhyhorn'],[127,'pinsir'],[142,'aerodactyl'],[246,'larvitar'],[304,'aron'],[443,'gible'],[524,'roggenrola'],[529,'drilbur'],[703,'carbink'],[744,'rockruff']],
  haunted:[[41,'zubat'],[42,'golbat'],[63,'abra'],[64,'kadabra'],[92,'gastly'],[93,'haunter'],[94,'gengar'],[96,'drowzee'],[97,'hypno'],[200,'misdreavus'],[302,'sableye'],[353,'shuppet'],[355,'duskull'],[425,'drifloon'],[442,'spiritomb'],[607,'litwick'],[708,'phantump'],[778,'mimikyu']],
  coast:[[54,'psyduck'],[60,'poliwag'],[72,'tentacool'],[79,'slowpoke'],[86,'seel'],[90,'shellder'],[98,'krabby'],[116,'horsea'],[118,'goldeen'],[120,'staryu'],[129,'magikarp'],[131,'lapras'],[170,'chinchou'],[194,'wooper'],[223,'remoraid'],[278,'wingull'],[320,'wailmer'],[363,'spheal']],
  volcano:[[4,'charmander'],[5,'charmeleon'],[37,'vulpix'],[58,'growlithe'],[74,'geodude'],[77,'ponyta'],[95,'onix'],[111,'rhyhorn'],[126,'magmar'],[218,'slugma'],[228,'houndour'],[240,'magby'],[322,'numel'],[324,'torkoal'],[390,'chimchar'],[485,'heatran'],[636,'larvesta'],[757,'salandit']]
};
const STARTER_META={
  1:{id:1,name:'bulbasaur',types:['grass','poison'],baseStats:{hp:45,attack:49,defense:49,speed:45}},
  4:{id:4,name:'charmander',types:['fire'],baseStats:{hp:39,attack:52,defense:43,speed:65}},
  7:{id:7,name:'squirtle',types:['water'],baseStats:{hp:44,attack:48,defense:65,speed:43}},
  25:{id:25,name:'pikachu',types:['electric'],baseStats:{hp:35,attack:55,defense:40,speed:90}}
};
const zonePoolRefreshJobs={};
const TYPE_MOVE = {
  normal:'Body Slam',fire:'Flame Burst',water:'Water Pulse',electric:'Spark',grass:'Razor Leaf',ice:'Icy Wind',fighting:'Brick Break',
  poison:'Poison Jab',ground:'Mud Shot',flying:'Air Slash',psychic:'Psybeam',bug:'Bug Bite',rock:'Rock Throw',ghost:'Shadow Sneak',
  dragon:'Dragon Breath',dark:'Bite',steel:'Metal Claw',fairy:'Draining Kiss'
};
const SUPER = {
  fire:['grass','ice','bug','steel'],water:['fire','ground','rock'],electric:['water','flying'],grass:['water','ground','rock'],ice:['grass','ground','flying','dragon'],
  fighting:['normal','ice','rock','dark','steel'],poison:['grass','fairy'],ground:['fire','electric','poison','rock','steel'],flying:['grass','fighting','bug'],
  psychic:['fighting','poison'],bug:['grass','psychic','dark'],rock:['fire','ice','flying','bug'],ghost:['psychic','ghost'],dragon:['dragon'],dark:['psychic','ghost'],
  steel:['ice','rock','fairy'],fairy:['fighting','dragon','dark']
};
const WEAK = {
  fire:['fire','water','rock','dragon'],water:['water','grass','dragon'],electric:['electric','grass','dragon'],grass:['fire','grass','poison','flying','bug','dragon','steel'],
  ice:['fire','water','ice','steel'],fighting:['poison','flying','psychic','bug','fairy'],poison:['poison','ground','rock','ghost'],ground:['grass','bug'],
  flying:['electric','rock','steel'],psychic:['psychic','steel'],bug:['fire','fighting','poison','flying','ghost','steel','fairy'],rock:['fighting','ground','steel'],
  ghost:['dark'],dragon:['steel'],dark:['fighting','dark','fairy'],steel:['fire','water','electric','steel'],fairy:['fire','poison','steel']
};
const IMMUNE = {normal:['ghost'],electric:['ground'],fighting:['ghost'],poison:['steel'],ground:['flying'],psychic:['dark'],ghost:['normal'],dragon:['fairy']};


const DAILY_POOL = [
  {id:'catch3',name:'Catch 3 Pokémon',icon:'🔴',target:3,key:'caught'},
  {id:'arcade500',name:'Earn 500 Arcade Coins',icon:'🎮',target:500,key:'arcadeCoins'},
  {id:'adventureBattle1',name:'Win 1 Adventure battle',icon:'🗺️',target:1,key:'adventureBattles'},
  {id:'battles4',name:'Win 4 battles',icon:'⚔️',target:4,key:'battlesWon'},
  {id:'pack1',name:'Open 1 pack',icon:'🃏',target:1,key:'packs'},
  {id:'ghost1',name:'Catch a Ghost type',icon:'👻',target:1,key:'ghostCaught',rank:3},
  {id:'great1',name:'Make a Great/Ultra Ball catch',icon:'🔵',target:1,key:'greatCatches',rank:3},
  {id:'perfect2',name:'Hit 2 perfect Berry Blend rounds',icon:'🍓',target:2,key:'perfectBerry'}
];
const ACHIEVEMENTS = [
  {id:'first_shiny',icon:'✨',name:'A Different Colour',desc:'Catch your first shiny Pokémon.',reward:{coins:500,fragment:1},progress:()=>[state.stats.shinies,1]},
  {id:'ghost10',icon:'👻',name:'Ghost Hunter',desc:'Own 10 different Ghost-type Pokémon.',reward:{coins:750},progress:()=>[ownedTypeCount('ghost'),10]},
  {id:'kanto_all',icon:'🔴',name:'Professor Oak Would Be Proud',desc:'Own every species in the Kanto Pokédex.',reward:{coins:2500,tickets:2,fragment:1,card:{name:'Ancient Mew',setName:'Miscellaneous'}},progress:()=>[ownedRangeCount(1,151),151]},
  {id:'celestial_storm',icon:'🌌',name:'Celestial Storm Master',desc:'Complete the Celestial Storm card set.',reward:{coins:2000,tickets:2},progress:()=>setCompletionProgress(/celestial storm/i)},
  {id:'gold_card',icon:'👑',name:'Golden Ticket',desc:'Pull a Gold/Crown rarity card from TCG Pocket.',reward:{coins:1000,tickets:1},progress:()=>[Math.max(Number(state.stats.goldCards||0),Object.values(state.cards).filter(c=>c.source==='tcgp'&&/(crown|gold)/i.test(String(c.rarity||''))).length),1]},
  {id:'haunted_visit',icon:'🏚️',name:'Things That Go Bump',desc:'Explore Lavender during a Wild Hunt.',reward:{coins:400},progress:()=>[(state.stats.visitedLocations?.haunted||Number(state.adventureV2?.destinations?.haunted?.encounters||0)>0)?1:0,1]},
  {id:'haunted_clear',icon:'🕯️',name:'Exorcist',desc:'Clear the Pokémon Tower leg of a Kanto Regional Adventure.',reward:{coins:1000,tickets:1},progress:()=>[(state.profile.firstClears?.haunted||Object.values(state.adventureRegional?.journeys||{}).some(j=>j?.region==='kanto'&&(j.completedLocations||[]).some(name=>/Pokémon Tower/i.test(String(name)))))?1:0,1]},
  {id:'packs25',icon:'🃏',name:'Card Shop Regular',desc:'Open 25 packs.',reward:{coins:750,tickets:1},progress:()=>[state.stats.packs,25]},
  {id:'packs100',icon:'📦',name:'I Can Quit Whenever I Want',desc:'Open 100 packs.',reward:{coins:2500,tickets:3},progress:()=>[state.stats.packs,100]},
  {id:'arcade10k',icon:'🕹️',name:'Game Corner Ace',desc:'Earn 10,000 Lucky Coins from Arcade games.',reward:{coins:1000,tickets:1,card:{name:'Victory Medal',setName:'Victory Medals'}},progress:()=>[state.stats.arcadeCoins,10000]},
  {id:'five_shiny',icon:'🌟',name:'Shiny Squad',desc:'Catch 5 shiny Pokémon.',reward:{coins:1500,fragment:1},progress:()=>[state.stats.shinies,5]},
  {id:'zubat3',icon:'🦇',name:'Not Again…',desc:'Encounter Zubat three times in a row.',hidden:true,reward:{coins:300},progress:()=>[state.stats.maxZubatStreak,3]},
  {id:'fails3',icon:'💢',name:'Surely This Time',desc:'Fail three catches in one play history.',hidden:true,reward:{coins:250},progress:()=>[state.stats.failedCatches,3]},
  {id:'loaded_pack',icon:'💥',name:'Loaded Pack',desc:'Pull three or more high-rarity cards from one pack.',hidden:true,reward:{coins:750,tickets:1},progress:()=>[state.stats.maxBigHitsInPack,3]}
];

const defaultState = {
  saveVersion:7,
  settings:{shinyOdds:2048,vibration:true,zone:'meadow',ball:'pokeball',gutsyGolbatLeftHanded:false,barrierBallLeftHanded:false,rareOdds:{powerTrialGolden:.02,impactTrialGolden:.02,targetRangeGolden:.02,elementalGauntletPrismatic:.02,enduranceExpeditionCache:.02,rouletteServiceDay:.02,rouletteRescue:.02,rouletteGoldenBall:.004,slotReelTime:.02,iceCreamDreamScoop:.02,wailordRainbowBall:.02,pokemonSeekDreamSparkle:.02,pikachuBeachLuckyWave:.02,fishingTreasure:.02,fishingEasterJunk:.01,fishingJumbo:.015,fishingRarePokemon:0,gutsyGolbatGoldenHeart:.02,furretFrolicMasterBall:.08,berry:.03,unown:.004,tileCard:.004,tilePack:.004,tilePresent:.018,voltorbGift:.02,goldRock:.10,fossilCard:.15,fossilPack:.04}},
  stats:{encounters:0,catches:0,shinies:0,packs:0,cardsPulled:0,zonesExplored:{},visitedLocations:{},battlesWon:0,ballsThrown:0,arcadeGames:0,arcadeCoins:0,adventureClears:0,expeditionRetreats:0,failedCatches:0,maxZubatStreak:0,zubatStreak:0,perfectBerryRounds:0,goldCards:0,maxBigHitsInPack:0,godPacks:0},
  profile:{xp:0,coins:750,tickets:1,dust:0,lastDailyPack:'',firstClears:{},rankRewards:[],achievementClaims:[],pendingCardRewards:[],shinyCharmFragments:0},
  cosmetics:{unlockedSleeves:['luckydex-default'],activeSleeve:'luckydex-default',discoveredSecrets:[],claimedCosmeticRewards:[]},
  achievementTelemetryV0413:{events:{},flags:{}},
  inventory:{pokeball:20,premierball:0,greatball:5,ultraball:1,berry:8,potion:5},
  pokemon:{},cards:{},sealedPacks:{},team:[],recentPokemon:[],rareHits:[],
  claimedMilestones:{dex:[],cards:[]},
  arcade:{voltorbLevel:1,bestMemory:0,bestFossil:0,fossilsFound:0,bestDitto:0,bestQuiz:0,quizPerfect:0,bestQuizEndless:0,bestQuizEndlessScore:0,bestBallDrop:0,bestUnown:0,bestSafari:0,safariCaught:0,dailyRewards:{},bestBerryPicker:{easy:0,normal:0,hard:0},bestHeadIt:{easy:0,normal:0,hard:0,unlimited:0,unlimitedStreak:0},bestTilePuzzle:{easy:null,normal:null,hard:null},museum:{exhibits:{}},dash:{lastRacerKey:null,races:0,wins:0,podiums:0,bestTimeMs:null},goldenrod:{version:1,events:{dash:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},powerTrial:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},impactTrial:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},targetRange:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},elementalGauntlet:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}},enduranceExpedition:{unlockedDivision:'rookie',typeCupsUnlocked:false,divisionTrophies:{},typeTrophies:{},records:{}}}},targetRange:{gamesPlayed:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestAccuracy:0,bestBullseyes:0,bestBullseyeStreak:0,longestBullseyeM:0,goldenTargetsSeen:0,goldenTargetsWon:0,totalShots:0,totalHits:0,totalBullseyes:0,lastPokemonKey:null},elementalGauntlet:{gamesPlayed:0,fullClears:0,hardClears:0,noDamageClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestHealth:0,bestPerfectWaves:0,totalDodges:0,totalGuards:0,totalDamageTaken:0,prismaticStormsSeen:0,prismaticStormsCleared:0,lastPokemonKey:null},enduranceExpedition:{gamesPlayed:0,fullClears:0,hardClears:0,flawlessClears:0,lowHpHardClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestEndurancePct:0,bestPerfectStages:0,totalObstaclesCleared:0,totalHits:0,totalJumps:0,goldenCachesSeen:0,goldenCachesCollected:0,lastPokemonKey:null},iceCreamScoop:{gamesPlayed:0,bestHeight:0,bestHeights:{easy:0,normal:0,hard:0},bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestPerfects:0,bestPerfectStreak:0,totalScoops:0,totalPerfects:0,collapses:0,dreamScoopsSeen:0,dreamScoopsLanded:0,dreamPrizes:0},pokemonSeek:{gamesPlayed:0,firstSearchFinds:0,areaClears:{},visitedAreas:[],clears:0,hardClears:0,cleanFinds:0,lostItemsFound:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestRemainingMs:0,bestCleanScore:0,totalWrongFinds:0,totalListens:0,totalRoomsVisited:0,dreamSparklesSeen:0,dreamSparklesFound:0,dreamPrizes:0},pikachuBeach:{classic:{gamesPlayed:0,clears:0,hardClears:0,flawlessClears:0,bestScore:0,bestScores:{easy:0,normal:0,hard:0},bestRadness:0,bestRemainingHp:0,bestTrick:0,maxFlips:0,totalRadness:0,totalWipeouts:0,luckyWavesSeen:0,luckyWavesLanded:0,luckyPrizes:0},dx:{gamesPlayed:0,clears:0,hardClears:0,flawlessClears:0,bestScore:0,bestScores:{},bestRings:0,bestCombo:0,bestTrick:0,totalRings:0,enemiesDefeated:0,bossDefeats:{},alliesUsed:{},luckyWavesSeen:0,luckyWavesLanded:0,luckyPrizes:0}},lastArcadeZone:'amie',lastArcadeVenue:'amieGarden'},
  daily:{date:'',tasks:[],progress:{},claimed:false},
  adventureV2:{schema:1,destinations:{},activeRoam:null,activeExpedition:null,lastDestination:'meadow'},
  tcgpBattle:{schema:1,helpSeen:false,decks:[],activeDeckId:null,firstClears:{},stats:{matches:0,wins:0,losses:0,draws:0,bestWinTurns:null,totalTurns:0}},
  ui:{packBrowser:{sortKey:'releaseDate',sortDir:'desc'},packMetrics:{},dustExchange:{keepCopies:3}}
};

let state = loadState();
window.LuckyDexCosmeticsV0413?.ensureState(state);
window.LuckyDexAchievementTelemetryV0413?.ensure?.(state);
window.LuckyDexCosmeticsV0413?.applyActiveSleeveCss?.(state);
if(typeof LuckyDexRetiredAchievementMigrationV0410!=='undefined')LuckyDexRetiredAchievementMigrationV0410.scrub(state);
state.settings.rareOdds={...defaultState.settings.rareOdds,...(state.settings.rareOdds||{})};
Object.defineProperty(window,'state',{get:()=>state,configurable:true});
window.API=API;
let species = [];
let zonePools = {};
let setCache = {tcg:[],tcgp:[]};
let cardDetailCache = new Map();
let pokemonMetaCache = new Map();
let collectionMode = 'pokemon';
let preparedPack = null;
let toastTimer = null;
let pokemonModalKey = null;




let challengeTab = 'active';
let starterChoiceInFlight=false;

function cloneDefault(){ return JSON.parse(JSON.stringify(defaultState)); }
function todayKey(){ return new Date().toLocaleDateString('en-CA'); }
function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem('luckyDexSave')||'{}');
    const base=cloneDefault();
    const migrated={
      ...base,...raw,
      settings:{...base.settings,...(raw.settings||{})},
      stats:{...base.stats,...(raw.stats||{}),zonesExplored:{...(raw.stats?.zonesExplored||{})},visitedLocations:{...(raw.stats?.visitedLocations||{})}},
      profile:{...base.profile,...(raw.profile||{}),firstClears:{...(raw.profile?.firstClears||{})},rankRewards:[...(raw.profile?.rankRewards||[])],achievementClaims:[...(raw.profile?.achievementClaims||[])],pendingCardRewards:[...(raw.profile?.pendingCardRewards||[])]},
      inventory:{...base.inventory,...(raw.inventory||{})},
      pokemon:{...(raw.pokemon||{})},cards:{...(raw.cards||{})},sealedPacks:{...(raw.sealedPacks||{})},team:[...(raw.team||[])],recentPokemon:[...(raw.recentPokemon||[])],rareHits:[...(raw.rareHits||[])],
      claimedMilestones:{dex:[...(raw.claimedMilestones?.dex||[])],cards:[...(raw.claimedMilestones?.cards||[])]},
      arcade:{...base.arcade,...(raw.arcade||{}),dailyRewards:{...base.arcade.dailyRewards,...(raw.arcade?.dailyRewards||{})},bestBerryPicker:{...base.arcade.bestBerryPicker,...(raw.arcade?.bestBerryPicker||{})},bestHeadIt:{...base.arcade.bestHeadIt,...(raw.arcade?.bestHeadIt||{})},bestTilePuzzle:{...base.arcade.bestTilePuzzle,...(raw.arcade?.bestTilePuzzle||{})},museum:{...(raw.arcade?.museum||{}),exhibits:{...((raw.arcade?.museum?.exhibits&&typeof raw.arcade.museum.exhibits==='object')?raw.arcade.museum.exhibits:{})}},dash:{...base.arcade.dash,...(raw.arcade?.dash||{})}},daily:{...base.daily,...(raw.daily||{})},
      tcgpBattle:{...base.tcgpBattle,...(raw.tcgpBattle||{}),decks:[...(raw.tcgpBattle?.decks||[])],firstClears:{...(raw.tcgpBattle?.firstClears||{})},stats:{...base.tcgpBattle.stats,...(raw.tcgpBattle?.stats||{})}},
      ui:{...base.ui,...(raw.ui||{}),packBrowser:{...base.ui.packBrowser,...(raw.ui?.packBrowser||{})},packMetrics:{...(raw.ui?.packMetrics||{})},dustExchange:{...base.ui.dustExchange,...(raw.ui?.dustExchange||{})}}
    };
    // v0.69.14 economy audit: the old Golden Ball vanilla rate was too common for a 10× stake bonus.
    // Only migrate the former vanilla value; explicit Off/Test/Always developer choices remain untouched.
    if(Number(raw.settings?.rareOdds?.rouletteGoldenBall)===.02)migrated.settings.rareOdds={...(migrated.settings.rareOdds||{}),rouletteGoldenBall:.004};
    if(!raw.arcade?.lastArcadeVenue){const venueMap={amie:'amieGarden',gameCorner:'goldenrod',discovery:'oreburghMuseum',performance:'lilycoveContest'};migrated.arcade.lastArcadeVenue=venueMap[raw.arcade?.lastArcadeZone]||'amieGarden';}
    if(!raw.saveVersion){
      if(Number(migrated.settings.shinyOdds)===512) migrated.settings.shinyOdds=2048;
      migrated.stats.catches ||= Object.values(migrated.pokemon).reduce((n,p)=>n+Number(p.count||0),0);
      Object.values(migrated.cards).forEach(c=>{ if(!c.setName&&c.set)c.setName=c.set; if(!c.setId&&c.id?.includes('-'))c.setId=c.id.split('-').slice(0,-1).join('-'); });
    }
    if(Number(raw.saveVersion||0)<3){
      const uniquePokemon=new Set(Object.values(migrated.pokemon).map(p=>p.id)).size;
      const uniqueCards=Object.keys(migrated.cards).length;
      if(!raw.profile){
        migrated.profile.xp=uniquePokemon*60+uniqueCards*8+Number(migrated.stats.shinies||0)*250+Number(migrated.stats.packs||0)*25;
        migrated.profile.coins=1000+uniquePokemon*20+Number(migrated.stats.packs||0)*60;
        migrated.profile.tickets=Math.max(1,Math.floor(Number(migrated.stats.packs||0)/10));
      }
      Object.entries(migrated.pokemon).forEach(([key,p])=>{
        p.level=Number(p.level||Math.min(30,5+Math.max(0,Number(p.count||1)-1)*2));
        p.xp=Number(p.xp||0); p.types=Array.isArray(p.types)?p.types:[]; p.baseStats=p.baseStats||null;
        p.generation=p.generation||generationForId(p.id).id;
      });
      if(!migrated.team.length) migrated.team=bestAutoTeam(migrated.pokemon);
    }
    if(Number(raw.saveVersion||0)<4){
      migrated.inventory.potion=Number(migrated.inventory.potion||5);
      migrated.stats.visitedLocations={...(migrated.stats.visitedLocations||{})};
      migrated.profile.achievementClaims=[...(migrated.profile.achievementClaims||[])];
      migrated.profile.shinyCharmFragments=Number(migrated.profile.shinyCharmFragments||0);
      migrated.daily={...cloneDefault().daily,...(migrated.daily||{}),progress:{...(migrated.daily?.progress||{})}};
    }
    window.LuckyDexProgression?.ensureSave(migrated);
    migrated.saveVersion=7;
    resetDaily(migrated);
    window.LuckyDexAdventureModel?.ensureState(migrated);
    return migrated;
  }catch(e){ const s=cloneDefault(); resetDaily(s); window.LuckyDexAdventureModel?.ensureState(s); return s; }
}
function dailyTaskIdsFor(date,rank=1){let seed=[...date].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,2166136261);const pool=DAILY_POOL.filter(x=>(x.rank||1)<=rank);for(let i=pool.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,3).map(x=>x.id);}
function resetDaily(s=state){const t=todayKey(),invalidTasks=!Array.isArray(s.daily.tasks)||!s.daily.tasks.length||s.daily.tasks.some(id=>!DAILY_POOL.some(x=>x.id===id));if(s.daily.date!==t){s.daily={date:t,tasks:dailyTaskIdsFor(t,rankForXp(Number(s.profile?.xp||0))),progress:{},claimed:false};}else if(invalidTasks){s.daily.tasks=dailyTaskIdsFor(t,rankForXp(Number(s.profile?.xp||0)));s.daily.progress={caught:Number(s.daily.caught||0),arcadeCoins:Number(s.daily.arcadeCoins||0),adventureBattles:Number(s.daily.adventureBattles||0),...(s.daily.progress||{})};s.daily.claimed=!!s.daily.claimed;}}
function bumpDaily(key,amount=1){resetDaily();state.daily.progress[key]=Number(state.daily.progress[key]||0)+amount;}
function rebuildableStorageKeys(tier=1){
  const exact=tier===1
    ?new Set(['luckyDexPackCacheV13','luckyDexSetCatalogV13','luckyDexPtcgSets','luckyDexPtcgSetsAt','luckyDexBoosterArtV0259','luckyDexLastPackError','luckyDexLastRuntimeError'])
    :new Set(['luckyDexSpecies']);
  const prefixes=tier===1?['luckyDexPtcgCardsV151:']:['luckyDexZonePool:'];
  const keys=[];
  try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&(exact.has(key)||prefixes.some(prefix=>key.startsWith(prefix))))keys.push(key);}}catch(_){ }
  return keys;
}
function purgeRebuildableStorage(tier=1){
  const keys=rebuildableStorageKeys(tier);for(const key of keys){try{localStorage.removeItem(key);}catch(_){ }}return keys.length;
}
let saveStorageWarningShown=false;
function persistLuckyDexSave(payload){
  try{localStorage.setItem('luckyDexSave',payload);return true;}catch(firstError){
    const primary=purgeRebuildableStorage(1);
    if(primary){try{localStorage.setItem('luckyDexSave',payload);console.warn(`[LuckyDex] cleared ${primary} rebuildable cache entr${primary===1?'y':'ies'} to recover save storage.`);return true;}catch(_){ }}
    const secondary=purgeRebuildableStorage(2);
    if(secondary){try{localStorage.setItem('luckyDexSave',payload);console.warn(`[LuckyDex] cleared ${secondary} secondary cache entr${secondary===1?'y':'ies'} to recover save storage.`);return true;}catch(_){ }}
    console.error('[LuckyDex] save storage write failed after cache recovery',firstError);
    if(!saveStorageWarningShown){saveStorageWarningShown=true;try{if(typeof showToast==='function')showToast('Save storage is full. LuckyDex is still usable, but new progress may not persist.',4200);}catch(_){ }}
    return false;
  }
}
function save(){
  let stored=false;
  try{
    window.LuckyDexProgression?.ensureSave(state);state.saveVersion=7;resetDaily();
    stored=persistLuckyDexSave(JSON.stringify(state));
  }catch(error){console.error('[LuckyDex] save preparation/serialization failed',error);}
  // Persistence must never fail just because a secondary HUD renderer has a bug.
  // v0.15.5-v0.15.7 could save the starter and then throw while updating the pack
  // HUD, leaving the visible screen frozen even though progress had changed.
  try{renderGlobalHud();}catch(e){console.error('[LuckyDex] HUD render failed',e);}
  return stored;
}
function sealedPackKeyV0260(value){return String(value?._libraryKey||value?._libraryCode||value?.setId||value?.id||value||'').trim().replace(/^library:/i,'').replace(/^en[_:-]/i,'');}
function ensureSealedPacksV0260(){if(!state.sealedPacks||typeof state.sealedPacks!=='object'||Array.isArray(state.sealedPacks))state.sealedPacks={};return state.sealedPacks;}
function sealedPackCountV0260(setId){const key=sealedPackKeyV0260(setId);return Math.max(0,Number(ensureSealedPacksV0260()[key]?.count||0));}
function giveSealedPackV0260(set,options={}){
  const key=sealedPackKeyV0260(set);if(!key)return null;
  const all=ensureSealedPacksV0260(),old=all[key]||{};
  const exactArt=window.LuckyDexBoosterArt?.directPath?.(set)||window.LuckyDexBoosterArt?.directPath?.({id:key,name:set?.name||options.setName||old.setName||''})||'';
  all[key]={setId:key,setName:String(set?.name||options.setName||old.setName||key),art:String(exactArt||options.art||old.art||''),count:Math.max(0,Number(old.count||0))+Math.max(1,Number(options.count||1)),firstOwned:Number(old.firstOwned||Date.now())};
  save();return all[key];
}
function consumeSealedPackV0260(setId){
  const key=sealedPackKeyV0260(setId),all=ensureSealedPacksV0260(),row=all[key];if(!row||Number(row.count||0)<1)return false;
  row.count=Number(row.count)-1;if(row.count<=0)delete all[key];save();return true;
}
async function openSealedPackV0260(setId,hooks={}){
  const key=sealedPackKeyV0260(setId),row=ensureSealedPacksV0260()[key];if(!row||Number(row.count||0)<1){showToast('No sealed pack available.');return false;}
  if(!window.LuckyDexPackFlow?.openStoredPack){showToast('Pack opener unavailable.');return false;}
  return !!(await window.LuckyDexPackFlow.openStoredPack({...row,setId:key},{...hooks,onClose:(info)=>{hooks?.onClose?.(info);if(collectionMode==='sealed'){rebuildCollectionControls();renderCollection();}}}));
}
window.LuckyDexSealedPacks={give:giveSealedPackV0260,consume:consumeSealedPackV0260,count:sealedPackCountV0260,open:openSealedPackV0260,all:()=>({...ensureSealedPacksV0260()})};
function fmt(n){ return Number(n||0).toLocaleString(); }
function titleCase(s=''){ return String(s).replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase()); }
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function vibrate(ms=30){ if(state.settings.vibration&&navigator.vibrate)navigator.vibrate(ms); }
function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }

function humanCardText(value,fallback='Card'){
  const raw=String(value??'').trim();if(!raw)return fallback;
  if(/(?:https?:\/\/|[\\/]|\.(?:webp|png|jpe?g|gif|json|zip)\b|^file\b|\b(?:source[_ -]?url|provider|asset|filepath|filename)\b)/i.test(raw))return fallback;
  if(raw==='[object Object]')return fallback;
  return raw.length>60?raw.slice(0,57)+'…':raw;
}
function cardDisplayRarityV03515(card){
  const rarity=humanCardText(card?.rarity||'','');
  if(/^no rarity$/i.test(rarity)){
    const classified=cardClassify(card||{});
    if(classified?.finish==='reverse-holo')return 'Reverse Holo';
    if(classified?.finish&&classified.finish!=='normal')return 'Holofoil';
    return '';
  }
  return /^(?:unknown|none)$/i.test(rarity)?'':rarity;
}
function cardDisplayMeta(card){
  const rarity=cardDisplayRarityV03515(card);
  const setName=humanCardText(cardSetName(card),'Card');
  const number=humanCardText(card?.localId||card?.number||'','');
  return [number?`#${number}`:'',rarity||setName].filter(Boolean).join(' · ');
}
async function fetchJson(url,timeoutMs=3200){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.max(500,Number(timeoutMs)||3200));
  try{const r=await fetch(url,{signal:controller.signal,cache:'no-cache'});if(!r.ok)throw new Error(`${r.status}`);return await r.json();}
  finally{clearTimeout(timer);}
}
function showToast(text,duration=1900){ const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),duration); }
function generationForId(id){ return GENERATIONS.find(g=>id>=g.min&&id<=g.max)||GENERATIONS[GENERATIONS.length-1]; }
function numericLocalId(v){ const m=String(v||'').match(/\d+/);return m?Number(m[0]):99999; }
function rankForXp(xp=state.profile.xp){ return Math.min(50,1+Math.floor(Number(xp||0)/400)); }
function rankProgress(){ const rank=rankForXp(),within=Number(state.profile.xp||0)%400; return {rank,within,next:400,pct:(within/400)*100}; }
function bestAutoTeam(map=state.pokemon){ return Object.entries(map).sort((a,b)=>Number(b[1].shiny)-Number(a[1].shiny)||Number(b[1].level||0)-Number(a[1].level||0)||Number(b[1].count||0)-Number(a[1].count||0)).slice(0,3).map(([k])=>k); }
function hasSpecies(id){ return Object.values(state.pokemon).some(p=>Number(p.id)===Number(id)); }
function currentRank(){ return rankForXp(); }
function effectiveShinyOdds(){const completedCharms=Math.floor(Number(state.profile.shinyCharmFragments||0)/3);return Math.max(64,Math.round(Number(state.settings.shinyOdds||2048)/(1+completedCharms*.34)));}
function cardImage(base,q='high'){ return base?`${base}/${q}.webp`:''; }
function assetImage(base){ return base?`${base}.webp`:''; }
function cardArtHtml(base,name){ return `<div class="card-art-wrap ${base?'':'broken'}"><img ${base?`src="${cardImage(base)}"`:''} data-card-base="${escapeHtml(base||'')}" data-fallback-step="0" alt="${escapeHtml(name||'Card')}" onerror="cardImageFallback(this)"><div class="card-art-fallback">Artwork unavailable<br><small>${escapeHtml(name||'Card')}</small></div></div>`; }
function cardImageFallback(img){ const base=img.dataset.cardBase||'';const step=Number(img.dataset.fallbackStep||0);if(base&&step===0){img.dataset.fallbackStep='1';img.src=cardImage(base,'low');return;}img.parentElement?.classList.add('broken'); }
window.cardImageFallback=cardImageFallback;

function cardClassify(cardOrRarity={}){
  const card=typeof cardOrRarity==='string'?{rarity:cardOrRarity}:(cardOrRarity||{});
  if(window.LuckyDexCardRarity?.classify)return window.LuckyDexCardRarity.classify(card);
  const fallback=window.LuckyDexPack?.profileFor?.(card);
  const tier=fallback?.level??1;
  return {originalRarity:String(card.rarity||'Unknown'),rarityClass:'unknown',tier,finish:card._foil?'holo':'normal',impactTier:tier,impactStyle:fallback?.style||'normal',revealLabel:fallback?.label||'',isRareHit:tier>=3,chaseTraits:[]};
}
function rarityTier(cardOrRarity=''){
  if(window.LuckyDexCardRarity?.tier)return window.LuckyDexCardRarity.tier(cardOrRarity);
  return cardClassify(cardOrRarity).tier;
}
function looksRare(cardOrRarity=''){ return cardClassify(cardOrRarity).isRareHit; }
function tierLabel(t){ return ['Common','Uncommon','Rare','Double rare','Illustration/ultra','Special rare','Jackpot'][clamp(t,0,6)]; }
function cardRarityLabel(cardOrRarity=''){
  const c=cardClassify(cardOrRarity);
  if(c.rarityClass==='secret')return 'Secret Rare';
  return c.originalRarity&&c.originalRarity!=='Unknown'?humanCardText(c.originalRarity,'Unknown'):tierLabel(c.tier);
}
function rareHitLabel(cardOrRarity=''){
  const c=cardClassify(cardOrRarity);
  if(c.rarityClass==='secret')return c.revealLabel||'SECRET RARE';
  return c.originalRarity||cardRarityLabel(cardOrRarity);
}
function dustForTier(t){ return [1,2,3,6,12,24,50][clamp(t,0,6)]; }
function rollWeighted(entries){ const r=Math.random();let acc=0;for(const [value,p] of entries){acc+=p;if(r<acc)return value;}return entries.at(-1)[0]; }
function hitTierForSource(source){ return rollWeighted(source==='tcgp'?[[2,.60],[3,.28],[4,.09],[5,.025],[6,.005]]:[[2,.62],[3,.25],[4,.09],[5,.035],[6,.005]]); }

function grantCoins(amount,source='Reward'){ amount=Math.max(0,Math.round(amount));state.profile.coins+=amount;save();if(amount)showToast(`${source}: +${fmt(amount)} Lucky Coins`); }
function addTrainerXp(amount){
  amount=Math.max(0,Math.round(amount));const oldRank=currentRank();state.profile.xp+=amount;const newRank=currentRank();
  if(newRank>oldRank){for(let r=oldRank+1;r<=newRank;r++){if(!state.profile.rankRewards.includes(r)){state.profile.rankRewards.push(r);state.profile.coins+=150;if(r%5===0)state.profile.tickets++;}}vibrate([30,30,80]);showToast(`Trainer Rank ${newRank}! +150 coins${newRank%5===0?' + Pack Ticket':''}`,2600);}
}
function grantTrainerXp(amount){addTrainerXp(amount);save();}
function trackDaily(kind,amount=1){bumpDaily(kind,amount);save();}

document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.nav==='profile')showProfileMainView();navigate(b.dataset.nav);}));

async function initSpecies(){
  // Seed synchronously so title/starter/adventure never wait on PokeAPI.
  try{const cached=JSON.parse(localStorage.getItem('luckyDexSpecies')||'null');if(Array.isArray(cached)&&cached.length)species=cached.filter(x=>Number(x.id)<=MAX_DEX_ID);}catch(e){}
  if(!species.length)species=Array.from({length:151},(_,i)=>({id:i+1,name:STARTER_META[i+1]?.name||`pokemon-${i+1}`}));
  try{
    const data=await fetchJson(API.pokeSpecies,3200);
    const fresh=(data.results||[]).map(x=>({name:x.name,id:Number(x.url.split('/').filter(Boolean).pop())})).filter(x=>Number.isFinite(x.id)&&x.id<=MAX_DEX_ID);
    if(fresh.length){species=fresh;localStorage.setItem('luckyDexSpecies',JSON.stringify(species));}
  }catch(e){}
  return species;
}
async function loadPokemonMeta(id){
  id=Number(id);if(pokemonMetaCache.has(id))return pokemonMetaCache.get(id);
  try{
    const d=await fetchJson(API.pokemon(id),2800),base={};(d.stats||[]).forEach(s=>base[s.stat.name]=s.base_stat);
    const meta={id,name:d.name,types:(d.types||[]).sort((a,b)=>a.slot-b.slot).map(t=>t.type.name),baseStats:{hp:base.hp||60,attack:base.attack||60,defense:base.defense||60,speed:base.speed||60}};pokemonMetaCache.set(id,meta);return meta;
  }catch(e){
    const seed=STARTER_META[id],meta=seed?{...seed,types:[...seed.types],baseStats:{...seed.baseStats}}:{id,name:species.find(p=>Number(p.id)===id)?.name||`pokemon-${id}`,types:['normal'],baseStats:{hp:60,attack:60,defense:60,speed:60}};
    // Cache the fallback for this session so repeated offline actions stay fast.
    pokemonMetaCache.set(id,meta);return meta;
  }
}
async function ensurePokemonBuild(entry){
  if(entry.types?.length&&entry.baseStats)return entry;
  const seed=STARTER_META[Number(entry.id)]||{name:entry.name||`pokemon-${entry.id}`,types:['normal'],baseStats:{hp:60,attack:60,defense:60,speed:60}};
  entry.name=entry.name||seed.name;entry.types=[...(seed.types||['normal'])];entry.baseStats={...(seed.baseStats||{hp:60,attack:60,defense:60,speed:60})};
  // Persist an immediately usable build, then improve it in the background.
  try{localStorage.setItem('luckyDexSave',JSON.stringify(state));}catch(e){}
  loadPokemonMeta(entry.id).then(m=>{if(!Object.values(state.pokemon).includes(entry))return;entry.name=m.name||entry.name;entry.types=m.types||entry.types;entry.baseStats=m.baseStats||entry.baseStats;try{localStorage.setItem('luckyDexSave',JSON.stringify(state));}catch(e){}}).catch(()=>{});
  return entry;
}
function combatStats(entryOrMeta,level){ const b=entryOrMeta.baseStats||{hp:60,attack:60,defense:60,speed:60};return {maxHp:Math.round(b.hp*.55+level*4+18),attack:Math.round(b.attack*.28+level*2.1+8),defense:Math.round(b.defense*.28+level*2+8),speed:Math.round(b.speed*.22+level*1.6+6)}; }
function xpNeeded(level){return window.LuckyDexProgression?window.LuckyDexProgression.xpNeeded(level):80+level*30;}
function grantPokemonXp(key,amount){const p=state.pokemon[key];if(!p)return;const result=window.LuckyDexProgression.grantXp(p,amount);if(result.levels)showToast(`${titleCase(p.name)} reached Lv. ${p.level}!`);save();}
function typeEffectiveness(att,defs=[]){let mult=1;for(const d of defs){if((IMMUNE[att]||[]).includes(d))mult*=0;else if((SUPER[att]||[]).includes(d))mult*=2;else if((WEAK[att]||[]).includes(d))mult*=.5;}return mult;}
function damageRoll(attacker,defender,power,type){const eff=typeEffectiveness(type,defender.types);const variance=.86+Math.random()*.22;const dmg=Math.max(1,Math.round(power*(attacker.attack/Math.max(1,defender.defense))*.44*variance*eff));return {dmg,eff};}

async function loadZonePool(zoneKey){
  if(zonePools[zoneKey]?.length)return zonePools[zoneKey];
  const cacheKey=`luckyDexZonePool:${zoneKey}:v2`;
  try{const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');if(Array.isArray(cached)&&cached.length>20){zonePools[zoneKey]=cached;return cached;}}catch(e){}
  const seed=(LOCAL_ZONE_POOLS[zoneKey]||[]).map(([id,name])=>({id,name}));
  zonePools[zoneKey]=seed.length?seed:(species.length?species.slice(0,151):[{id:25,name:'pikachu'}]);
  // Never block a search on the network. Refresh the richer type pool behind
  // the scenes and use it on the next encounter/session.
  if(navigator.onLine!==false&&!zonePoolRefreshJobs[zoneKey]){
    const zone=ZONES[zoneKey];
    zonePoolRefreshJobs[zoneKey]=(async()=>{
      try{
        const lists=await Promise.all(zone.types.map(t=>fetchJson(API.pokeType(t),2800))),map=new Map();
        lists.forEach(data=>(data.pokemon||[]).forEach(row=>{const p=row.pokemon||{},id=Number((p.url||'').split('/').filter(Boolean).pop());if(id>0&&id<=MAX_DEX_ID)map.set(id,{id,name:p.name});}));
        const pool=[...map.values()];if(pool.length>=20){zonePools[zoneKey]=pool;try{localStorage.setItem(cacheKey,JSON.stringify(pool));}catch(e){}}
      }catch(e){}finally{delete zonePoolRefreshJobs[zoneKey];}
    })();
  }
  return zonePools[zoneKey];
}
async function chooseStarter(id){
  id=Number(id);if(starterChoiceInFlight||Object.keys(state.pokemon).length)return;
  starterChoiceInFlight=true;document.querySelectorAll('[data-starter]').forEach(b=>b.disabled=true);
  const seed=STARTER_META[id]||{id,name:`pokemon-${id}`,types:['normal'],baseStats:{hp:60,attack:60,defense:60,speed:60}},name=seed.name,key=`${id}:n`;
  // Commit the choice before touching the network. This prevents the old bug
  // where several taps queued several async starter grants while the screen
  // appeared frozen.
  state.pokemon[key]={id,name,shiny:false,count:1,firstSeen:Date.now(),generation:generationForId(id).id,level:5,xp:0,types:[...seed.types],baseStats:{...seed.baseStats},lastZone:'meadow'};
  state.team=[key];state.profile.coins+=250;state.inventory.pokeball+=10;state.recentPokemon.unshift({id,name,shiny:false,zone:'meadow',ts:Date.now()});
  save();document.getElementById('starterPanel').hidden=true;renderTeamPanel();renderTitlePartners();renderAdventurePartyMini();showAdventureHub();showToast(`${titleCase(name)} joined you! +10 Poké Balls`);
  try{const meta=await loadPokemonMeta(id),entry=state.pokemon[key];if(entry){entry.name=meta.name||entry.name;entry.types=meta.types||entry.types;entry.baseStats=meta.baseStats||entry.baseStats;save();renderTeamPanel();renderTitlePartners();renderAdventurePartyMini();}}catch(e){}
  finally{starterChoiceInFlight=false;}
}
function helperAbility(entry){const types=entry?.types||[];if(types.includes('electric'))return {game:'voltorb',name:'Static Scan',desc:'Once per Voltorb board, inspect one hidden tile for danger.'};if(types.includes('psychic'))return {game:'clefairy',name:'Second Sight',desc:'Replay the current Clefairy sequence once per game.'};if(types.includes('grass'))return {game:'berry',name:'Gentle Hands',desc:'Widens the perfect timing zone in Berry Blend.'};if(types.includes('water'))return {game:'berry',name:'Cool Blend',desc:'Berry Blend coin payout +10%.'};if([52,53].includes(Number(entry?.id)))return {game:'all',name:'Pickup',desc:'All Arcade coin payouts +10%.'};return {game:'all',name:'Lucky Cheer',desc:'Your partner cheers you on. No mechanical bonus yet.'};}
function arcadePayoutBonus(amount,game){const e=state.pokemon[state.team[0]],a=helperAbility(e);if(a.name==='Pickup')amount*=1.1;if(a.name==='Cool Blend'&&game==='berry')amount*=1.1;return Math.round(amount);}
function awardArcadeCoins(amount,label,game='all'){amount=arcadePayoutBonus(amount,game);state.profile.coins+=amount;state.stats.arcadeCoins+=amount;state.stats.arcadeGames++;bumpDaily('arcadeCoins',amount);addTrainerXp(Math.min(120,Math.round(amount/10)));save();showToast(`${label}: +${fmt(amount)} Lucky Coins`);renderProfile();return amount;}
function grantProfileRewardV0380({coins=0,dust=0,tickets=0,label=''}={}){
  const c=Math.max(0,Math.round(Number(coins)||0)),d=Math.max(0,Math.round(Number(dust)||0)),t=Math.max(0,Math.floor(Number(tickets)||0));
  state.profile=state.profile||{};state.stats=state.stats||{};
  state.profile.coins=Number(state.profile.coins||0)+c;state.profile.dust=Number(state.profile.dust||0)+d;state.profile.tickets=Number(state.profile.tickets||0)+t;
  if(c){state.stats.arcadeCoins=Number(state.stats.arcadeCoins||0)+c;bumpDaily('arcadeCoins',c);}
  save();
  const parts=[];if(c)parts.push(`+${c} Lucky Coins`);if(d)parts.push(`+${d} Dust`);if(t)parts.push(`+${t} Pack Ticket${t===1?'':'s'}`);if(parts.length)showToast(`${label||'Bonus reward'}: ${parts.join(' · ')}`);
  renderProfile();return {coins:c,dust:d,tickets:t};
}
async function physicalExcavationFallbackSetsV0259(){
  if(!isOnlineV13())return [];
  try{return (await packFetch(`${API.tcgSets}?sort:field=releaseDate&sort:order=DESC`,null,5000)||[]).filter(set=>set?.id&&Number(set?.cardCount?.total||set?.cards?.length||0)>0);}catch(_){return [];}
}
async function prepareExcavationSetV0259(stub){
  if(!stub?.id)return null;
  if(stub?._libraryKey&&window.LuckyDexCardArt?.prepareSet)return LuckyDexCardArt.prepareSet(stub);
  if(Array.isArray(stub.cards)&&stub.cards.length)return stub;
  if(isOnlineV13())return packFetch(API.tcgSet(stub.id),null,5000);
  return null;
}
async function resolveBuriedCardV0259(){
  let sets=[];
  if(window.LuckyDexCardArt?.catalog){try{sets=await LuckyDexCardArt.catalog();}catch(_){sets=[];}}
  if(!sets.length)sets=await physicalExcavationFallbackSetsV0259();
  sets=(sets||[]).filter(set=>set?.id&&Number(set?.cardCount?.total||set?.cards?.length||0)>0);if(!sets.length)return null;
  const start=Math.floor(Math.random()*sets.length),attempts=Math.min(16,sets.length);
  for(let n=0;n<attempts;n++){
    try{
      const set=await prepareExcavationSetV0259(sets[(start+n)%sets.length]),rows=(set?.cards||[]).filter(card=>card?.id);
      if(!rows.length)continue;
      const target=window.LuckyDexFossilMuseumCore.rollBuriedCardTier(Math.random());
      const exact=rows.filter(c=>rarityTier(c)===target),near=rows.filter(c=>Math.abs(rarityTier(c)-target)<=1),pool=exact.length?exact:near.length?near:rows;
      const card=pool[Math.floor(Math.random()*pool.length)];if(card)return {card,set};
    }catch(_){ }
  }
  return null;
}
async function resolveBuriedBoosterV0259(){
  let sets=[];
  if(window.LuckyDexCardArt?.catalog){try{sets=await LuckyDexCardArt.catalog();}catch(_){sets=[];}}
  if(!sets.length)sets=await physicalExcavationFallbackSetsV0259();
  sets=(sets||[]).filter(set=>set?.id&&Number(set?.cardCount?.total||set?.cards?.length||0)>0&&window.LuckyDexCardAcquisition?.boosterProductEligible?.(set,'tcg')===true&&!window.LuckyDexPack?.isPromoSet?.(set));if(!sets.length)return null;
  const start=Math.floor(Math.random()*sets.length),attempts=sets.length;
  for(let n=0;n<attempts;n++){
    try{
      const stub=sets[(start+n)%sets.length],boosterArt=await window.LuckyDexBoosterArt?.resolve?.(stub);
      if(!boosterArt)continue;
      return {set:stub,source:'tcg',boosterArt};
    }catch(_){ }
  }
  return null;
}
function grantFossilCardV0250(card,set={}){
  if(!card?.id)return null;
  const existing=state.cards[card.id];
  if(existing){existing.count=Number(existing.count||1)+1;state.stats.cardsPulled=Number(state.stats.cardsPulled||0)+1;save();return existing;}
  const row={id:card.id,name:card.name||'Buried Card',image:card.image||'',localId:card.localId||card.number||'',setId:card.set?.id||set.id||'',setName:card.set?.name||set.name||'Unknown set',setTotal:card.set?.cardCount?.total||set.cardCount?.total||0,source:'tcg',rarity:card.rarity||'Unknown',count:1,firstPulled:Date.now()};
  for(const key of ['subtypes','subtype','supertype','category','_libraryNative','_librarySetKey','_libraryCanonicalId','_artSource','_artIdentityVerified'])if(card[key]!=null)row[key]=card[key];
  state.cards[row.id]=row;state.stats.cardsPulled=Number(state.stats.cardsPulled||0)+1;
  if(looksRare(row.rarity)){addTrainerXp(25);state.rareHits.unshift({type:'card',name:row.name,rarity:rareHitLabel(row),set:row.setName,tier:rarityTier(row),ts:Date.now()});state.rareHits=state.rareHits.slice(0,50);}
  save();return row;
}
function grantFossilBoosterV0258(reward={}){
  const set=reward.set||{};if(!set?.id)return 0;
  const row=giveSealedPackV0260(set,{art:reward.boosterArt||window.LuckyDexBoosterArt?.localPath?.(set)||''});
  if(row){state.rareHits.unshift({type:'pack',name:`Sealed Booster · ${set.name||'Mystery Pack'}`,rarity:'Excavated reward',set:set.name||'',ts:Date.now()});state.rareHits=state.rareHits.slice(0,50);save();}
  return row?1:0;
}
window.LuckyDexFossilMuseumBridge={
  getState:()=>state,
  save,
  grantCoins:(amount,label='Fossil Dig')=>awardArcadeCoins(Math.max(0,Number(amount)||0),label,'fossil'),
  grantProfileReward:grantProfileRewardV0380,
  grantInventory:(key,amount=1)=>{if(!['pokeball','premierball','greatball','ultraball','berry','potion'].includes(key))return 0;const n=Math.max(0,Math.floor(Number(amount)||0));if(!n)return 0;state.inventory[key]=Number(state.inventory[key]||0)+n;save();return n;},
  resolveBuriedCard:resolveBuriedCardV0259,
  resolveBuriedBooster:resolveBuriedBoosterV0259,
  grantCard:grantFossilCardV0250,
  grantBooster:grantFossilBoosterV0258,
  openSealedPack:(setId,hooks={})=>openSealedPackV0260(setId,hooks),
  showToast:(message)=>showToast(message),
  vibrate:(pattern)=>vibrate(pattern),
  setOrientation:(mode)=>{try{window.Android?.setOrientation?.(String(mode||'portrait'));}catch(_){} }
};

async function resolveTileRewardV0406(kind){
  if(kind==='card'){
    let found=await resolveBuriedCardV0259();
    if(!found){const owned=Object.values(state.cards||{});const card=owned[Math.floor(Math.random()*Math.max(1,owned.length))];if(card)found={card:{...card},set:{id:card.setId||'',name:card.setName||'Owned cards',cardCount:{total:Number(card.setTotal||0)}}};}
    if(!found?.card)return null;const card=found.card,set=found.set||{};
    const base=card.image||card.images?.large||card.images?.small||deriveCardBase(card,set),image=cardImage(base,'high');
    return {type:'card',card,set,label:card.name||'Rare Card',image};
  }
  if(kind==='pack'){
    let pack=await resolveBuriedBoosterV0259();
    if(!pack){
      const sealed=Object.values(state.sealedPacks||{}).filter(row=>Number(row?.count||0)>0);const row=sealed[Math.floor(Math.random()*Math.max(1,sealed.length))];
      if(row)pack={set:{id:row.setId,name:row.setName||row.setId},source:'tcg',boosterArt:row.art||''};
    }
    if(!pack?.set?.id)return null;const image=pack.boosterArt||window.LuckyDexBoosterArt?.localPath?.(pack.set)||window.LuckyDexBoosterArt?.directPath?.(pack.set)||'';
    return {type:'pack',pack,label:`${pack.set.name||'Mystery'} Booster`,image};
  }
  return null;
}
function prepareRareCardImageV0407(card,set,source){
  if(source==='tcgp')return card?.image||deriveCardBase(card,set)||card?.images?.large||card?.images?.small||'';
  const base=card?.image||card?.images?.large||card?.images?.small||deriveCardBase(card,set);return cardImage(base,'high');
}
async function resolveCardForLetterV0407(letter){
  const prefix=String(letter||'').trim().toUpperCase();if(!/^[A-Z]$/.test(prefix))return null;
  const helper=window.LuckyDexArcadeSpecialEvents;const sourceOrder=Math.random()<.5?['tcg','tcgp']:['tcgp','tcg'];
  for(const source of sourceOrder){
    let sets=[];try{sets=source==='tcgp'?(await window.LuckyDexPocket?.catalog?.()||[]):(await window.LuckyDexCardArt?.catalog?.()||[]);}catch(_){sets=[];}
    if(!sets.length&&source==='tcg')sets=await physicalExcavationFallbackSetsV0259();
    if(!sets.length)continue;const start=Math.floor(Math.random()*sets.length),attempts=Math.min(28,sets.length);
    for(let n=0;n<attempts;n++){
      try{
        const stub=sets[(start+n)%sets.length],set=source==='tcgp'?(await window.LuckyDexPocket?.setDetail?.(stub.id)||stub):(await prepareExcavationSetV0259(stub)||stub);
        const matches=(helper?.cardsForLetter?.(set?.cards||[],prefix)||[]).filter(card=>card?.id);if(!matches.length)continue;
        const card=matches[Math.floor(Math.random()*matches.length)],image=prepareRareCardImageV0407(card,set,source);
        return {type:'card',card:{...card,image},set,source,label:`${card.name} · ${source==='tcgp'?'TCG Pocket':'Pokémon TCG'}`,image};
      }catch(_){ }
    }
  }
  const owned=Object.values(state.cards||{}).filter(card=>String(card?.name||'').trim().toUpperCase().startsWith(prefix));if(!owned.length)return null;
  const card={...owned[Math.floor(Math.random()*owned.length)]},source=card.source||'tcg',set={id:card.setId||'',name:card.setName||'Owned cards',cardCount:{total:Number(card.setTotal||0)}};
  return {type:'card',card,set,source,label:`${card.name} · ${source==='tcgp'?'TCG Pocket':'Pokémon TCG'}`,image:card.image||''};
}
async function resolveArcadeRewardV0407(kind,options={}){
  if(kind==='dust'){const amount=[40,60,80,100][Math.floor(Math.random()*4)];return {type:'profile',dust:amount,label:`${amount} Card Dust`,visual:'✦'};}
  if(kind==='ticket')return {type:'profile',tickets:1,label:'Pack Voucher',visual:'🎟'};
  if(kind==='card'&&options.letter)return resolveCardForLetterV0407(options.letter);
  return resolveTileRewardV0406(kind);
}
function grantRareCardV0407(reward){
  const card=reward?.card,set=reward?.set||{},source=reward?.source||card?.source||'tcg';if(!card?.id)return null;
  if(source!=='tcgp')return grantFossilCardV0250(card,set);
  const existing=state.cards[card.id],row=existing||{id:card.id,name:card.name||'Pocket Card',image:card.image||deriveCardBase(card,set)||'',localId:card.localId||card.number||'',setId:card.set?.id||set.id||'',setName:card.set?.name||set.name||'TCG Pocket',setTotal:card.set?.cardCount?.total||set.cardCount?.total||0,source:'tcgp',rarity:card.rarity||'Unknown',count:0,firstPulled:Date.now()};
  row.count=Number(row.count||0)+1;row.image=card.image||row.image;row.source='tcgp';for(const key of ['_tcgpFallbacks','_limitlessSetCode','_pocketImageFile','_pocketNative'])if(card[key]!=null)row[key]=Array.isArray(card[key])?[...card[key]]:card[key];state.cards[row.id]=row;state.stats.cardsPulled=Number(state.stats.cardsPulled||0)+1;
  if(looksRare(row.rarity)){state.rareHits.unshift({type:'card',name:row.name,rarity:rareHitLabel(row),set:row.setName,tier:rarityTier(row),ts:Date.now()});state.rareHits=state.rareHits.slice(0,50);}addTrainerXp(existing?3:12);save();return row;
}
async function grantRareRewardV0406(reward){
  if(!reward)return null;
  if(reward.type==='profile'){const out=grantProfileRewardV0380(reward);return {...out,label:reward.label||'Arcade Bonus'};}
  if(reward.type==='card'){const row=grantRareCardV0407(reward);if(!row)throw new Error('Card reward could not be granted');return {label:reward.label||row.name||'Card',card:row};}
  if(reward.type==='pack'){const count=grantFossilBoosterV0258(reward.pack||{});if(!count)throw new Error('Pack reward could not be granted');return {label:reward.label||'Booster Pack',pack:reward.pack};}
  throw new Error(`Unsupported rare reward type: ${reward.type}`);
}
function rareRewardRevealV0409(reward,claimResult=null,kicker='REWARD WON'){
  if(!reward)return null;
  const type=String(reward.type||''),claimedCard=claimResult?.card||null,card=claimedCard||reward.card||null,set=reward.set||{},pack=reward.pack||claimResult?.pack||{},profile=type==='profile';
  if(type==='card')return {kicker:String(kicker||'CARD WON'),name:card?.name||reward.label||'Card',image:card?.image||reward.image||'',meta:[reward.source==='tcgp'?'TCG Pocket':'Pokémon TCG',card?.setName||set?.name||'',card?.rarity||''].filter(Boolean).join(' · '),id:card?.id||reward.id||''};
  if(type==='pack'){const packSet=pack?.set||{};return {kicker:String(kicker||'BOOSTER WON'),name:reward.label||`${packSet.name||'Mystery'} Booster`,image:reward.image||pack?.boosterArt||window.LuckyDexBoosterArt?.localPath?.(packSet)||window.LuckyDexBoosterArt?.directPath?.(packSet)||'',meta:'SEALED BOOSTER',id:packSet.id||reward.id||''};}
  if(profile){const visual=reward.visual||(reward.dust?'✦':reward.tickets?'🎟':'◈'),meta=reward.dust?'CARD DUST':reward.tickets?'PACK VOUCHER':reward.coins?'LUCKY COINS':'ARCADE REWARD';return {kicker:String(kicker||'REWARD WON'),name:reward.label||claimResult?.label||'Arcade Reward',image:'',visual,meta,id:reward.id||''};}
  return {kicker:String(kicker||'REWARD WON'),name:reward.label||claimResult?.label||'Arcade Reward',image:reward.image||'',visual:reward.visual||'✦',meta:'ARCADE REWARD',id:reward.id||''};
}
window.LuckyDexRareRewardBridge={getState:()=>state,save,resolveTileReward:resolveTileRewardV0406,resolveArcadeReward:resolveArcadeRewardV0407,resolveCardForLetter:resolveCardForLetterV0407,grantReward:grantRareRewardV0406,rewardReveal:rareRewardRevealV0409,setOrientation:(mode)=>{try{window.Android?.setOrientation?.(String(mode||'portrait'));}catch(_){} }};
async function getCardDetail(brief){if(cardDetailCache.has(brief.id))return cardDetailCache.get(brief.id);let card;try{card=await fetchJson(API.card(brief.id));}catch(e){card={...brief,rarity:'Unknown'};}cardDetailCache.set(brief.id,card);return card;}
async function pickCardForTier(briefs,targetTier,used){const pool=briefs.filter(c=>!used.has(c.id));if(!pool.length)return getCardDetail(briefs[Math.floor(Math.random()*briefs.length)]);const maxAttempts=targetTier>=5?20:targetTier>=4?14:9;const tried=new Set();let best=null,bestDistance=999;for(let i=0;i<maxAttempts&&tried.size<pool.length;i++){let brief;do{brief=pool[Math.floor(Math.random()*pool.length)];}while(tried.has(brief.id)&&tried.size<pool.length);tried.add(brief.id);const card=await getCardDetail(brief),tier=rarityTier(card.rarity),distance=Math.abs(tier-targetTier);if(distance<bestDistance||(distance===bestDistance&&tier<=(best?rarityTier(best.rarity):99))){best=card;bestDistance=distance;}if(tier===targetTier)return card;}return best||getCardDetail(pool[0]);}
async function buildBalancedPack(set,source,luckyPack=false){const briefs=set.cards||[];if(!briefs.length)throw new Error('No cards');const hitTier=hitTierForSource(source);const plan=luckyPack?[4,4,4,5,6]:(source==='tcgp'?[0,0,1,rollWeighted([[1,.72],[2,.25],[3,.03]]),hitTier]:[0,1,1,rollWeighted([[1,.55],[2,.38],[3,.07]]),hitTier]);const cards=[],used=new Set();for(const target of plan){const card=await pickCardForTier(briefs,target,used);cards.push(card);used.add(card.id);}return cards;}
function packEntitlement(setArg=null,sourceArg=null){
  const source=sourceArg||document.getElementById('cardSource')?.value||'tcg';
  const selectedId=document.getElementById('setSelect')?.value||'';
  const set=setArg||setCache[source]?.find(row=>String(row?.id)===String(selectedId))||cachedSetV13(selectedId,source)||null;
  if(state.profile.lastDailyPack!==todayKey())return {mode:'daily',label:'FREE DAILY PACK',cost:0};
  if(state.profile.tickets>0)return {mode:'ticket',label:'USE PACK TICKET',cost:0};
  const cost=source==='tcg'?(window.LuckyDexPackPolicy?.priceFor?.(set,'tcg')||600):(PACK_COST.tcgp||450);
  return {mode:'coins',label:`OPEN · ${fmt(cost)} COINS`,cost};
}
function updatePackButton(){const btn=document.getElementById('openPackBtn');if(!btn)return;const e=packEntitlement();btn.textContent=e.label;btn.disabled=e.mode==='coins'&&state.profile.coins<e.cost;const source=document.getElementById('cardSource')?.value||'tcg',setId=document.getElementById('setSelect')?.value||'',set=setCache[source]?.find(row=>String(row?.id)===String(setId))||cachedSetV13(setId,source)||null,ten=document.getElementById('openTenPackBtn');if(ten){const cost=pocketTenPackCost(set);ten.hidden=source!=='tcgp';ten.textContent=`OPEN 10 · ${fmt(cost)} COINS`;ten.disabled=source!=='tcgp'||Number(state.profile.coins||0)<cost;}document.getElementById('dailyPackPill').textContent=state.profile.lastDailyPack!==todayKey()?'Daily ready':'Daily claimed';document.getElementById('packPriceCopy').textContent=e.mode==='daily'?'Your first pack today is free.':e.mode==='ticket'?'A Pack Ticket will be used.':`${fmt(e.cost)} Lucky Coins · earn more in Arcade/Adventure`;document.getElementById('dustTicketExchangeBtn')?.toggleAttribute('disabled',state.profile.dust<100);}



function canConsumePackEntitlement(e=preparedPack?.entitlement||{}){
  if(e.mode==='sealed')return sealedPackCountV0260(e.setId)>0;
  if(e.mode==='daily')return state.profile.lastDailyPack!==todayKey();
  if(e.mode==='ticket')return Number(state.profile.tickets||0)>0;
  if(e.mode==='coins')return Number(state.profile.coins||0)>=Math.max(0,Number(e.cost)||0);
  return false;
}
function consumePackEntitlement(){const e=preparedPack?.entitlement||{};if(!canConsumePackEntitlement(e))return false;if(e.mode==='sealed')return consumeSealedPackV0260(e.setId);if(e.mode==='daily')state.profile.lastDailyPack=todayKey();else if(e.mode==='ticket')state.profile.tickets=Math.max(0,state.profile.tickets-1);else if(e.mode==='coins')state.profile.coins=Math.max(0,state.profile.coins-e.cost);return true;}
function existingPhysicalCardForLibraryPullV165(card,set){
  if(card?._fixedProduct)return null;
  if(!card?._libraryNative||card?._librarySetKey==='MFB')return null;
  const wantedSet=normalizeSetNameV5(card?.set?.name||set?.name||''),wantedName=normalizeSetNameV5(card?.name||'');
  const wantedNumbers=new Set(physicalCollectorNumbersV163(card));
  if(!wantedSet||!wantedName||!wantedNumbers.size)return null;
  let hit=null;
  for(const [id,owned] of Object.entries(state.cards||{})){
    if((owned?.source||'tcg')==='tcgp')continue;
    if(owned?._fixedProduct)continue;
    if(owned?._libraryCanonicalId){if(owned._libraryCanonicalId===card._libraryCanonicalId)return {id,card:owned};continue;}
    if(normalizeSetNameV5(owned?.setName||owned?.set?.name||'')!==wantedSet)continue;
    if(normalizeSetNameV5(owned?.name||'')!==wantedName)continue;
    const numbers=physicalCollectorNumbersV163(owned);if(!numbers.some(n=>wantedNumbers.has(n)))continue;
    if(hit)return null; // ambiguous legacy identity: never merge by guess
    hit={id,card:owned};
  }
  return hit;
}
function commitPreparedPack(){
  if(!preparedPack||preparedPack.committed)return;
  if(!consumePackEntitlement())return false;
  const {cards,set,source}=preparedPack;
  const packGroups=preparedPack.packGroups?.length?preparedPack.packGroups:[{cards,godPack:!!preparedPack.godPack,luckyPack:!!preparedPack.luckyPack}];
  const packCount=Math.max(1,Number(preparedPack.packCount)||packGroups.length||1);
  state.stats.packs+=packCount;bumpDaily('packs',packCount);state.stats.cardsPulled+=cards.length;
  const maxBigHits=Math.max(0,...packGroups.map(group=>(group.cards||[]).filter(c=>rarityTier(c.rarity)>=4).length));
  state.stats.maxBigHitsInPack=Math.max(Number(state.stats.maxBigHitsInPack||0),maxBigHits);
  state.stats.goldCards+=cards.filter(c=>source==='tcgp'&&/(crown|gold)/i.test(String(c.rarity||''))).length;
  const godPackCount=packGroups.filter(group=>group.godPack).length,luckyPackCount=packGroups.filter(group=>group.luckyPack).length;
  if(preparedPack.godPack){state.stats.godPacks=Number(state.stats.godPacks||0)+1;state.rareHits.unshift({type:'pack',name:'✦ GOD PACK',rarity:'1/1,000 event',set:set.name||'',tier:6,ts:Date.now()});}
  else if(godPackCount){state.stats.godPacks=Number(state.stats.godPacks||0)+godPackCount;packGroups.forEach((group,index)=>{if(group.godPack)state.rareHits.unshift({type:'pack',name:`✦ GOD PACK · Pack ${index+1}`,rarity:'1/1,000 event',set:set.name||'',tier:6,ts:Date.now()});});}
  if(preparedPack.luckyPack)state.rareHits.unshift({type:'pack',name:'✦ Lucky Pack',rarity:'1/500 event',ts:Date.now()});
  else if(luckyPackCount)packGroups.forEach((group,index)=>{if(group.luckyPack)state.rareHits.unshift({type:'pack',name:`✦ Lucky Pack · Pack ${index+1}`,rarity:'1/500 event',ts:Date.now()});});
  cards.forEach(c=>{
    let storageId=c.id,existing=state.cards[storageId];
    if(!existing&&source==='tcg'&&c?._libraryNative){const legacy=existingPhysicalCardForLibraryPullV165(c,set);if(legacy){storageId=legacy.id;existing=legacy.card;}}
    c._wasNew=!existing;
    const old=existing||{id:storageId,name:c.name,image:c.image,localId:c.localId,setId:c.set?.id||set.id,setName:c.set?.name||set.name,setTotal:c.set?.cardCount?.total||set.cardCount?.total||0,source,rarity:c.rarity||'Unknown',count:0,firstPulled:Date.now()};
    old.count++;old.image=c.image||old.image;old.localId=c.localId||old.localId;old.rarity=c.rarity||old.rarity;
    old.setId=c.set?.id||old.setId||set.id;old.setName=c.set?.name||old.setName||set.name;old.setTotal=c.set?.cardCount?.total||old.setTotal||set.cardCount?.total||0;old.source=source||old.source;
    if(c._tcgpFallbacks?.length)old._tcgpFallbacks=[...c._tcgpFallbacks];if(c._limitlessSetCode)old._limitlessSetCode=c._limitlessSetCode;if(c._pocketImageFile)old._pocketImageFile=c._pocketImageFile;if(c._pocketNative)old._pocketNative=true;
    if(c._libraryNative)old._libraryNative=true;if(c._librarySetKey)old._librarySetKey=c._librarySetKey;if(c._libraryCanonicalId)old._libraryCanonicalId=c._libraryCanonicalId;if(c._artSource)old._artSource=c._artSource;if(c._artIdentityVerified)old._artIdentityVerified=true;
    if(c._fixedProduct){old._fixedProduct=true;old._fixedProductCode=c._fixedProductCode||'';old._fixedProductPosition=c._fixedProductPosition||Number(c.localId)||0;}
    state.cards[storageId]=old;
    addTrainerXp(existing?3:12);
    if(looksRare(c.rarity||'')){addTrainerXp(25);state.rareHits.unshift({type:'card',name:c.name,rarity:rareHitLabel(c),set:old.setName,tier:rarityTier(c),ts:Date.now()});}
  });
  state.rareHits=state.rareHits.slice(0,50);preparedPack.committed=true;checkCardMilestones(set.id);save();updatePackButton();return true;
}

function exchangeDust(){if(state.profile.dust<100){showToast('You need 100 Card Dust.');return;}state.profile.dust-=100;state.profile.tickets++;save();showToast('100 Card Dust → 1 Pack Ticket');}

function cardSpareCount(card){return Math.max(0,Number(card?.count||0)-1);}
function dustCardProtected(card){return !!(card?._achievementReward||window.LuckyDexCardAcquisition?.achievementEligible?.(card));}
function dustValueForCard(card){
  if(dustCardProtected(card))return 0;
  const isPromo=card?._promo===true||window.LuckyDexCardAcquisition?.classify?.(card)==='promo_vault';
  if(isPromo){const shared=window.LuckyDexCardAcquisition?.promoDustSalvageValue?.(card);if(Number.isFinite(Number(shared)))return Number(shared);}
  return dustForTier(rarityTier(card||{}));
}
function dustExchangeHooks(){return {setFor:card=>cardSetName(card),rarityFor:card=>cardDisplayRarityV03515(card)||card?.rarity||'Unknown',valueFor:dustValueForCard,isProtected:dustCardProtected};}
function dustFilterState(){return {query:String(document.getElementById('dustCardSearch')?.value||'').trim(),set:String(document.getElementById('dustSetFilter')?.value||''),rarities:[...document.querySelectorAll('#dustRarityFilter input[type=\"checkbox\"]:checked')].map(input=>String(input.value||'')).filter(Boolean),dustValue:String(document.getElementById('dustValueFilter')?.value||'')};}
function dustKeepCopiesValue(){const core=window.LuckyDexDustExchangeCore,input=document.getElementById('dustKeepCopies'),stored=state.ui?.dustExchange?.keepCopies??3;return core?.normalizeKeepCopies(input?.value??stored)??Math.max(1,Math.min(99,Math.round(Number(input?.value??stored)||3)));}
function dustFilterOption(select,values,allLabel,format=v=>v){
  if(!select)return;const current=select.value,rows=[...new Set(values.filter(v=>String(v??'').trim()!==''))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:'base'}));
  select.innerHTML=`<option value="">${escapeHtml(allLabel)}</option>`+rows.map(v=>`<option value="${escapeHtml(String(v))}">${escapeHtml(format(v))}</option>`).join('');
  if(rows.some(v=>String(v)===current))select.value=current;
}
function dustRarityOptions(container,cards,hooks=dustExchangeHooks()){
  if(!container)return;
  const selected=new Set([...container.querySelectorAll('input[type="checkbox"]:checked')].map(input=>String(input.value)));
  const byLabel=new Map();
  for(const card of cards||[]){const label=String(hooks.rarityFor(card)||'').trim();if(!label)continue;const tier=Number(rarityTier(card))||0;if(!byLabel.has(label)||tier<byLabel.get(label).tier)byLabel.set(label,{label,tier});}
  const rows=[...byLabel.values()].sort((a,b)=>a.tier-b.tier||a.label.localeCompare(b.label,undefined,{numeric:true,sensitivity:'base'}));
  container.innerHTML=rows.map(row=>`<label class="dust-rarity-choice"><input type="checkbox" value="${escapeHtml(row.label)}" ${selected.has(row.label)?'checked':''}><span>${escapeHtml(row.label)}</span></label>`).join('');
}
function updateDustFilterOptions(cards){
  const hooks=dustExchangeHooks();
  dustFilterOption(document.getElementById('dustSetFilter'),cards.map(c=>hooks.setFor(c)),'ALL SETS');
  dustRarityOptions(document.getElementById('dustRarityFilter'),cards,hooks);
  dustFilterOption(document.getElementById('dustValueFilter'),cards.map(c=>dustValueForCard(c)).filter(v=>v>0),'ALL VALUES',v=>`✦ ${fmt(v)} EACH`);
}
function buildDustBulkSnapshot(){
  const core=window.LuckyDexDustExchangeCore;if(!core)return {filters:dustFilterState(),keepCopies:dustKeepCopiesValue(),rows:[],cardTypes:0,copies:0,dust:0};
  return core.buildBatch(Object.values(state.cards||{}),dustFilterState(),dustKeepCopiesValue(),dustExchangeHooks());
}
function renderDustBulkSummary(snapshot=buildDustBulkSnapshot()){
  const summary=document.getElementById('dustBulkSummary'),button=document.getElementById('dustConvertFiltered');
  if(summary)summary.textContent=snapshot.copies?`${fmt(snapshot.cardTypes)} card type${snapshot.cardTypes===1?'':'s'} · ${fmt(snapshot.copies)} cop${snapshot.copies===1?'y':'ies'} · +${fmt(snapshot.dust)} Dust`:`No filtered extras above Keep ${snapshot.keepCopies}`;
  if(button){button.disabled=!snapshot.copies;button.textContent=snapshot.copies?`CONVERT FILTERED · +${fmt(snapshot.dust)} DUST`:'CONVERT FILTERED';}
  return snapshot;
}
function resetDustExchangeFilters(){
  const search=document.getElementById('dustCardSearch');if(search)search.value='';
  for(const id of ['dustSetFilter','dustValueFilter']){const el=document.getElementById(id);if(el)el.value='';}document.querySelectorAll('#dustRarityFilter input[type="checkbox"]:checked').forEach(input=>{input.checked=false;});
  const dialog=document.getElementById('dustBulkDialog');if(dialog?.open)dialog.close();
  renderDustExchange();
}
function renderDustExchange(){
  const list=document.getElementById('dustCardList'),balance=document.getElementById('tradeDustCount'),ticket=document.getElementById('dustTicketExchangeBtn'),core=window.LuckyDexDustExchangeCore;
  if(balance)balance.textContent=fmt(state.profile.dust||0);if(ticket)ticket.disabled=state.profile.dust<100;if(!list)return;
  const keep=document.getElementById('dustKeepCopies');if(keep&&document.activeElement!==keep)keep.value=String(state.ui?.dustExchange?.keepCopies??3);
  const eligible=Object.values(state.cards||{}).filter(card=>cardSpareCount(card)>0&&!dustCardProtected(card)&&dustValueForCard(card)>0);updateDustFilterOptions(eligible);
  const filters=dustFilterState(),hooks=dustExchangeHooks();
  const rows=eligible.filter(card=>!core||core.matches(card,filters,hooks)).sort((a,b)=>dustValueForCard(b)-dustValueForCard(a)||rarityTier(b)-rarityTier(a)||String(a.name||'').localeCompare(String(b.name||'')));
  const filtered=!!(filters.query||filters.set||filters.dustValue||filters.rarities?.length);
  if(!rows.length){list.innerHTML=`<div class="trade-empty"><b>${filtered?'No cards match these filters':'No spare cards yet'}</b><span>${filtered?'Clear or change a filter.':'Duplicates stay in your binder until you choose to convert them here.'}</span></div>`;renderDustBulkSummary();return;}
  list.innerHTML=rows.map(card=>{const spares=cardSpareCount(card),value=dustValueForCard(card),base=card.image||'';return `<article class="dust-card-row" data-dust-card="${escapeHtml(card.id)}" data-dust-spares="${spares}" data-dust-value="${value}"><div class="dust-card-thumb">${base?`<img src="${escapeHtml(cardImage(base,'low'))}" alt="${escapeHtml(card.name)}" onerror="this.parentElement.classList.add('broken');this.remove()">`:''}</div><div class="dust-card-copy"><b>${escapeHtml(card.name||'Card')}</b><span>${escapeHtml(card.setName||'Unknown set')}${cardDisplayRarityV03515(card)?` · ${escapeHtml(cardDisplayRarityV03515(card))}`:''}</span><em>Owned ×${Number(card.count||0)} · ${spares} spare${spares===1?'':'s'} · ✦ ${value} each</em></div><div class="dust-card-actions"><div class="dust-qty-control"><button class="secondary" type="button" data-dust-adjust="-1" aria-label="Remove one card">−</button><input data-dust-qty="${escapeHtml(card.id)}" type="number" inputmode="numeric" min="1" max="${spares}" value="1" aria-label="Copies to convert"><button class="secondary" type="button" data-dust-adjust="1" aria-label="Add one card">+</button><button class="secondary dust-max" type="button" data-dust-max="${escapeHtml(card.id)}">MAX</button></div><button class="primary dust-convert" type="button" data-dust-convert="${escapeHtml(card.id)}">CONVERT 1 · +${fmt(value)} DUST</button></div></article>`;}).join('');
  list.querySelectorAll('[data-dust-card]').forEach(row=>{
    const input=row.querySelector('[data-dust-qty]'),convert=row.querySelector('[data-dust-convert]'),spares=Math.max(1,Number(row.dataset.dustSpares)||1),value=Math.max(0,Number(row.dataset.dustValue)||0),cardId=row.dataset.dustCard;
    const update=()=>{let qty=Math.round(Number(input?.value)||1);qty=Math.max(1,Math.min(spares,qty));if(input)input.value=String(qty);if(convert)convert.textContent=`CONVERT ${qty} · +${fmt(qty*value)} DUST`;return qty;};
    input?.addEventListener('input',update);input?.addEventListener('change',update);
    row.querySelectorAll('[data-dust-adjust]').forEach(btn=>btn.onclick=()=>{if(input)input.value=String(update()+Number(btn.dataset.dustAdjust||0));update();});
    const max=row.querySelector('[data-dust-max]');if(max)max.onclick=()=>{if(input)input.value=String(spares);update();};
    if(convert)convert.onclick=()=>convertCardSpareToDust(cardId,update());
    update();
  });
  renderDustBulkSummary();
}
function convertCardSpareToDust(cardId,amount=1){
  const card=state.cards?.[cardId],spares=Math.max(0,Number(card?.count||0)-1);if(!card||spares<1){showToast('No spare copy available.');return 0;}
  if(dustCardProtected(card)){showToast('Achievement Reward cards cannot be converted to Dust.');return 0;}
  const qty=Math.max(1,Math.min(spares,Number(amount)||1)),gain=qty*dustValueForCard(card);card.count-=qty;state.profile.dust+=gain;save();renderDustExchange();showToast(`${card.name}: +${fmt(gain)} Card Dust`);return gain;
}
function convertAllCardSparesToDust(cardId){const card=state.cards?.[cardId];return convertCardSpareToDust(cardId,Math.max(0,Number(card?.count||0)-1));}
let pendingDustBulkSnapshot=null;
function closeDustBulkDialog(){pendingDustBulkSnapshot=null;const dialog=document.getElementById('dustBulkDialog');if(dialog?.open)dialog.close();}
function confirmDustBulkSnapshot(snapshot=buildDustBulkSnapshot()){
  if(!snapshot?.copies){showToast(`No filtered cards above Keep ${snapshot?.keepCopies||dustKeepCopiesValue()}.`);return false;}
  pendingDustBulkSnapshot=JSON.parse(JSON.stringify(snapshot));
  const dialog=document.getElementById('dustBulkDialog'),summary=document.getElementById('dustBulkConfirmSummary'),list=document.getElementById('dustBulkConfirmList'),confirm=document.getElementById('dustBulkConfirmBtn');
  if(summary)summary.textContent=`Keep ${snapshot.keepCopies} of each matching card · convert ${fmt(snapshot.copies)} copies from ${fmt(snapshot.cardTypes)} card type${snapshot.cardTypes===1?'':'s'} · gain ${fmt(snapshot.dust)} Dust.`;
  if(list)list.innerHTML=snapshot.rows.map(row=>`<div><span><b>${escapeHtml(row.name)}</b><small>Owned ×${fmt(row.owned)} → keep ×${fmt(row.keep)}</small></span><strong>×${fmt(row.qty)} · +${fmt(row.gain)} ✦</strong></div>`).join('');
  if(confirm)confirm.textContent=`CONVERT ${fmt(snapshot.copies)} · +${fmt(snapshot.dust)} DUST`;
  if(dialog){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  return true;
}
function convertFilteredCardsToDust(snapshot=pendingDustBulkSnapshot){
  const core=window.LuckyDexDustExchangeCore;if(!snapshot||!core)return 0;
  const result=window.LuckyDexDustExchangeCore.applyBatch(state.cards,snapshot,dustExchangeHooks());
  if(!result.ok){closeDustBulkDialog();renderDustExchange();showToast('Your collection changed. Review the filtered conversion again.');return 0;}
  state.profile.dust+=result.dust;save();closeDustBulkDialog();renderDustExchange();showToast(`${fmt(result.copies)} cards converted · +${fmt(result.dust)} Card Dust`,2600);return result.dust;
}
window.resetDustExchangeFilters=resetDustExchangeFilters;
window.renderDustExchange=renderDustExchange;window.LuckyDexDustExchange={convertOne:convertCardSpareToDust,convertAll:convertAllCardSparesToDust,convertFiltered:convertFilteredCardsToDust,buildFiltered:buildDustBulkSnapshot,valueFor:dustValueForCard,spares:cardSpareCount};

function cardSetKey(c){return window.LuckyDexCardAcquisition?.displaySetKey?.(c)||(c.setId||c.setName||c.set||'Unknown set');}function cardSetName(c){return window.LuckyDexCardAcquisition?.displaySetName?.(c)||(c.setName||c.set||c.setId||'Unknown set');}function cardSetTotal(c){return window.LuckyDexCardAcquisition?.achievementEligible?.(c)?0:Number(c?.setTotal||0);}
function ownedRangeCount(min,max){return new Set(Object.values(state.pokemon).filter(p=>Number(p.id)>=min&&Number(p.id)<=max).map(p=>Number(p.id))).size;}
function ownedTypeCount(type){return new Set(Object.values(state.pokemon).filter(p=>(p.types||[]).includes(type)).map(p=>Number(p.id))).size;}
function setCompletionProgress(pattern){const rows=Object.values(state.cards).filter(c=>pattern.test(String(cardSetName(c))));if(!rows.length)return [0,1];const total=Math.max(...rows.map(c=>Number(c.setTotal||0)),0);const owned=new Set(rows.map(c=>c.id)).size;return [owned,total||Math.max(1,owned+1)];}
function achievementProgress(a){try{const [value,target]=a.progress();return {value:Number(value||0),target:Math.max(1,Number(target||1)),complete:Number(value||0)>=Number(target||1),claimed:state.profile.achievementClaims.includes(a.id)};}catch(e){return {value:0,target:1,complete:false,claimed:false};}}
function rewardText(r={}){const bits=[];if(r.coins)bits.push(`◉ ${fmt(r.coins)}`);if(r.tickets)bits.push(`🎟 ×${r.tickets}`);if(r.fragment)bits.push(`✨ Charm Fragment ×${r.fragment}`);if(r.card?.name)bits.push(`🃏 ${r.card.name}`);return bits.join(' · ');}
function normalizeRewardTextV0246(value=''){return window.LuckyDexCardAcquisition?.norm?.(value)||String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function ownedAchievementRewardV0246(reward){const name=normalizeRewardTextV0246(reward?.name),setName=normalizeRewardTextV0246(reward?.setName);return Object.values(state.cards||{}).find(card=>normalizeRewardTextV0246(card?.name)===name&&(!setName||normalizeRewardTextV0246(card?.setName||card?.set?.name)===setName))||null;}
function queueAchievementCardRewardV0246(reward){if(!reward?.name)return;state.profile.pendingCardRewards=Array.isArray(state.profile.pendingCardRewards)?state.profile.pendingCardRewards:[];const key=`${normalizeRewardTextV0246(reward.setName)}:${normalizeRewardTextV0246(reward.name)}`;const owned=ownedAchievementRewardV0246(reward);if(owned){owned._achievementReward=true;return;}if(!state.profile.pendingCardRewards.some(row=>row?.key===key))state.profile.pendingCardRewards.push({...reward,key});}
function queueClaimedAchievementRewardsV0246(){for(const a of ACHIEVEMENTS){if(a.reward?.card&&state.profile.achievementClaims?.includes(a.id))queueAchievementCardRewardV0246(a.reward.card);}}
async function resolveAchievementCardV0246(reward){if(!window.LuckyDexCardArt?.catalog||!window.LuckyDexCardArt?.prepareSet)return null;const sets=await LuckyDexCardArt.catalog();const wantedSet=normalizeRewardTextV0246(reward?.setName),wantedName=normalizeRewardTextV0246(reward?.name);const candidates=sets.filter(set=>!wantedSet||normalizeRewardTextV0246(set?.name)===wantedSet);for(const stub of candidates){try{const full=await LuckyDexCardArt.prepareSet(stub),card=(full?.cards||[]).find(row=>normalizeRewardTextV0246(row?.name)===wantedName);if(card)return {card,set:full};}catch(_){ }}return null;}
function grantAchievementCardV0246(card,set,reward){const existing=ownedAchievementRewardV0246(reward);if(existing){existing._achievementReward=true;return existing;}if(!card?.id)return null;const row={id:card.id,name:card.name,image:card.image||'',localId:card.localId||card.number||'',setId:card.set?.id||set?.id||'',setName:card.set?.name||set?.name||reward?.setName||'Achievement Reward',setTotal:card.set?.cardCount?.total||set?.cardCount?.total||0,source:'tcg',rarity:card.rarity||'Promo',count:1,firstPulled:Date.now(),_promo:true,_achievementReward:true};for(const key of ['_libraryNative','_librarySetKey','_libraryCanonicalId','_artSource','_artIdentityVerified'])if(card[key]!=null)row[key]=card[key];state.cards[row.id]=row;addTrainerXp(40+rarityTier(row.rarity)*10);state.rareHits.unshift({type:'card',name:row.name,rarity:rareHitLabel(row),set:'Achievement Rewards',tier:rarityTier(row),ts:Date.now()});state.rareHits=state.rareHits.slice(0,50);return row;}
let achievementRewardFulfilmentV0246=null;
async function fulfilPendingAchievementRewardsV0246(){if(achievementRewardFulfilmentV0246)return achievementRewardFulfilmentV0246;achievementRewardFulfilmentV0246=(async()=>{const pending=[...(state.profile.pendingCardRewards||[])],remaining=[];for(const reward of pending){const existing=ownedAchievementRewardV0246(reward);if(existing){existing._achievementReward=true;continue;}try{const hit=await resolveAchievementCardV0246(reward);if(!hit){remaining.push(reward);continue;}grantAchievementCardV0246(hit.card,hit.set,reward);}catch(_){remaining.push(reward);}}state.profile.pendingCardRewards=remaining;save();if(pending.length!==remaining.length){rebuildCollectionControls();renderCollection();renderProfile();}return pending.length-remaining.length;})().finally(()=>{achievementRewardFulfilmentV0246=null;});return achievementRewardFulfilmentV0246;}
async function claimAchievement(id){const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a)return;const p=achievementProgress(a);if(!p.complete||p.claimed)return;state.profile.achievementClaims.push(id);state.profile.coins+=Number(a.reward?.coins||0);state.profile.tickets+=Number(a.reward?.tickets||0);state.profile.shinyCharmFragments+=Number(a.reward?.fragment||0);if(a.reward?.card)queueAchievementCardRewardV0246(a.reward.card);addTrainerXp(100+Number(a.reward?.fragment||0)*100);save();vibrate([20,25,60]);showToast(`${a.name} complete · ${rewardText(a.reward)}`,2800);renderAchievements();renderProfile();if(a.reward?.card)await fulfilPendingAchievementRewardsV0246();}
function renderAchievements(){const list=document.getElementById('achievementList');if(!list)return;const rows=ACHIEVEMENTS.map(a=>({a,p:achievementProgress(a)}));const earned=rows.filter(x=>x.p.complete).length;document.getElementById('achievementCountPill').textContent=`${earned}/${ACHIEVEMENTS.length} earned`;let shown=rows.filter(({a,p})=>challengeTab==='complete'?p.complete&&!a.hidden:challengeTab==='hidden'?a.hidden:( !a.hidden&&!p.claimed));if(challengeTab==='active')shown.sort((x,y)=>Number(y.p.complete)-Number(x.p.complete)||y.p.value/y.p.target-x.p.value/x.p.target);list.innerHTML=shown.length?shown.map(({a,p})=>{const secret=a.hidden&&!p.complete;const pct=clamp(p.value/p.target*100,0,100);return `<div class="achievement-row ${p.complete?'complete':''} ${p.claimed?'claimed':''} ${secret?'secret-card':''}"><div class="achievement-icon">${secret?'?':a.icon}</div><div><b>${secret?'Secret achievement':escapeHtml(a.name)}</b><span>${secret?'Keep exploring Lucky Dex to uncover this.':escapeHtml(a.desc)}</span>${!secret?`<div class="progress-track"><i style="width:${pct}%"></i></div><small>${Math.min(p.value,p.target)} / ${p.target}</small>`:''}</div><div>${!secret?`<span class="achievement-reward">${rewardText(a.reward)}</span>`:''}${p.complete&&!p.claimed?`<button class="primary" data-claim-achievement="${a.id}">CLAIM</button>`:p.claimed?'<span class="achievement-reward">✓ CLAIMED</span>':''}</div></div>`;}).join(''):'<div class="empty compact-empty">Nothing in this tab yet.</div>';list.querySelectorAll('[data-claim-achievement]').forEach(b=>b.onclick=()=>claimAchievement(b.dataset.claimAchievement));}
function checkDexMilestones(id){const g=generationForId(id),owned=new Set(Object.values(state.pokemon).filter(p=>p.id>=g.min&&p.id<=g.max).map(p=>p.id)).size,total=g.max-g.min+1;for(const [pct,coins,ticket] of [[.25,250,0],[.5,600,0],[1,1500,1]]){if(owned/total>=pct){const k=`g${g.id}:${pct}`;if(!state.claimedMilestones.dex.includes(k)){state.claimedMilestones.dex.push(k);state.profile.coins+=coins;state.profile.tickets+=ticket;showToast(`Gen ${g.id} ${Math.round(pct*100)}% milestone · +${coins} coins${ticket?' + ticket':''}`,2600);}}}}
function checkCardMilestones(setId){const cards=Object.values(state.cards).filter(c=>cardSetKey(c)===setId),total=Number(cards[0]?.setTotal||0);if(!total)return;const owned=new Set(cards.map(c=>c.id)).size;for(const [pct,coins,ticket] of [[.25,250,0],[.5,500,0],[1,1000,1]]){if(owned/total>=pct){const k=`${setId}:${pct}`;if(!state.claimedMilestones.cards.includes(k)){state.claimedMilestones.cards.push(k);state.profile.coins+=coins;state.profile.tickets+=ticket;showToast(`${cardSetName(cards[0])} ${Math.round(pct*100)}% · +${coins} coins${ticket?' + ticket':''}`,2600);}}}}
function rebuildCollectionControls(){const filter=document.getElementById('collectionFilter'),group=document.getElementById('collectionGroupFilter'),oldFilter=filter.value,oldGroup=group.value;if(collectionMode==='pokemon'){filter.innerHTML='<option value="all">All caught</option><option value="shiny">Shiny only</option><option value="team">Adventure team</option><option value="duplicates">Duplicates</option>';const ids=new Set(Object.values(state.pokemon).map(x=>x.id)),ownedGens=GENERATIONS.filter(g=>[...ids].some(id=>id>=g.min&&id<=g.max));group.innerHTML='<option value="all">All generations</option>'+ownedGens.map(g=>{const n=[...ids].filter(id=>id>=g.min&&id<=g.max).length;return `<option value="gen:${g.id}">Gen ${g.id} · ${escapeHtml(g.name)} · ${n}/${g.max-g.min+1}</option>`;}).join('');}else{filter.innerHTML='<option value="all">All cards</option><option value="rare">Rare hits</option><option value="duplicates">Duplicates</option>';const map=new Map();Object.values(state.cards).forEach(c=>{const k=cardSetKey(c),row=map.get(k)||{key:k,name:cardSetName(c),ids:new Set(),total:Number(c.setTotal||0)};row.ids.add(c.id);row.total=Math.max(row.total,cardSetTotal(c));map.set(k,row);});group.innerHTML='<option value="all">All owned sets</option>'+[...map.values()].sort((a,b)=>a.name.localeCompare(b.name)).map(s=>`<option value="set:${escapeHtml(s.key)}">${escapeHtml(s.name)} · ${s.ids.size}${s.total?`/${s.total}`:''}</option>`).join('');}if([...filter.options].some(o=>o.value===oldFilter))filter.value=oldFilter;if([...group.options].some(o=>o.value===oldGroup))group.value=oldGroup;}
function renderCollectionProgress(items,allItems){const el=document.getElementById('collectionProgress'),group=document.getElementById('collectionGroupFilter').value;let title=collectionMode==='pokemon'?'Pokédex':'Card binder',owned=0,total=0,sub='';if(collectionMode==='pokemon'){const unique=new Set(items.map(x=>x.id));owned=unique.size;if(group.startsWith('gen:')){const g=GENERATIONS.find(x=>x.id===Number(group.split(':')[1]));total=g.max-g.min+1;title=`Gen ${g.id} · ${g.name}`;sub=`${owned} of ${total} species caught`; }else{owned=new Set(allItems.map(x=>x.id)).size;total=MAX_DEX_ID;sub=`${owned} species caught across all generations`;}}else{owned=new Set(items.map(x=>x.id)).size;if(group.startsWith('set:')){const first=items[0];total=cardSetTotal(first);title=first?cardSetName(first):'Set';sub=total?`${owned} of ${total} cards collected`:`${owned} unique cards collected`;}else{owned=new Set(allItems.map(x=>x.id)).size;sub=`${owned} unique cards across ${new Set(allItems.map(cardSetKey)).size} sets`;}}const pct=total?clamp(owned/total*100,0,100):0;el.innerHTML=`<div><b>${escapeHtml(title)}</b><span>${escapeHtml(sub)}</span></div>${total?`<div class="progress-track"><i style="width:${pct}%"></i></div>`:''}`;}
function renderCollection(){
  const q=document.getElementById('collectionSearch').value.toLowerCase(),filter=document.getElementById('collectionFilter').value,group=document.getElementById('collectionGroupFilter').value,grid=document.getElementById('collectionGrid'),allItems=Object.values(collectionMode==='pokemon'?state.pokemon:state.cards);
  let items=allItems.filter(x=>(x.name||'').toLowerCase().includes(q));
  const quick=document.getElementById('binderQuickFilters'),dupCount=document.getElementById('binderDuplicateCount');
  if(quick)quick.hidden=collectionMode!=='cards';if(dupCount)dupCount.textContent=Object.values(state.cards||{}).filter(x=>Number(x.count||0)>1).length;
  document.querySelectorAll('[data-binder-filter]').forEach(b=>b.classList.toggle('active',collectionMode==='cards'&&b.dataset.binderFilter===filter));
  if(collectionMode==='pokemon'){
    if(group.startsWith('gen:')){const g=GENERATIONS.find(x=>x.id===Number(group.split(':')[1]));items=items.filter(x=>x.id>=g.min&&x.id<=g.max);}if(filter==='shiny')items=items.filter(x=>x.shiny);if(filter==='team')items=items.filter(x=>state.team.includes(`${x.id}:${x.shiny?'s':'n'}`));if(filter==='duplicates')items=items.filter(x=>x.count>1);items.sort((a,b)=>group==='all'?(b.firstSeen||0)-(a.firstSeen||0):a.id-b.id||Number(b.shiny)-Number(a.shiny));
  }else{
    if(group.startsWith('set:')){const key=group.slice(4);items=items.filter(x=>cardSetKey(x)===key);}if(filter==='rare')items=items.filter(x=>looksRare(x.rarity));if(filter==='duplicates')items=items.filter(x=>Number(x.count||0)>1);items.sort((a,b)=>group==='all'?(b.firstPulled||0)-(a.firstPulled||0):numericLocalId(a.localId)-numericLocalId(b.localId)||a.name.localeCompare(b.name));
  }
  renderCollectionProgress(items,allItems);if(!items.length){grid.innerHTML=`<div class="empty">${collectionMode==='cards'&&filter==='duplicates'?'No spare card copies yet.':'Nothing here yet.'}</div>`;return;}
  grid.innerHTML=items.map(x=>collectionMode==='pokemon'?(()=>{const key=`${x.id}:${x.shiny?'s':'n'}`;return `<button class="collection-item ${x.shiny?'shiny-glow':''}" data-pokemon-key="${key}">${state.team.includes(key)?'<span class="team-badge">TEAM</span>':''}<span class="count-badge">×${x.count}</span><img src="${API.sprite(x.id,x.shiny)}"><b>${x.shiny?'★ ':''}${escapeHtml(titleCase(x.name))}</b><span>#${x.id} · Lv.${x.level||1} · Gen ${generationForId(x.id).id}</span></button>`;})():`<button class="collection-item card ${looksRare(x.rarity||'')?'rare-card':''}" data-card-id="${escapeHtml(x.id)}"><span class="count-badge">×${x.count}</span>${cardArtHtml(x.image,x.name,x)}<div class="card-tile-copy"><b>${escapeHtml(humanCardText(x.name,'Unknown card'))}</b><span>${escapeHtml(cardDisplayMeta(x))}</span></div></button>`).join('');
  grid.querySelectorAll('[data-card-id]').forEach(b=>b.onclick=()=>openCardModal(state.cards[b.dataset.cardId]));grid.querySelectorAll('[data-pokemon-key]').forEach(b=>b.onclick=()=>openPokemonModal(b.dataset.pokemonKey));
}
function renderTeamPanel(){/* Party editing belongs to Adventure. */}
async function openPokemonModal(key){const p=state.pokemon[key];if(!p)return;pokemonModalKey=key;await ensurePokemonBuild(p);const s=combatStats(p,p.level),a=helperAbility(p);document.getElementById('pokemonDialogSprite').src=API.sprite(p.id,p.shiny);document.getElementById('pokemonDialogDex').textContent=`#${p.id} · Gen ${generationForId(p.id).id}`;document.getElementById('pokemonDialogName').textContent=`${p.shiny?'★ ':''}${titleCase(p.name)} · Lv.${p.level}`;document.getElementById('pokemonDialogTypes').innerHTML=p.types.map(t=>`<span>${titleCase(t)}</span>`).join('');document.getElementById('pokemonDialogStats').innerHTML=[['HP',s.maxHp],['ATK',s.attack],['DEF',s.defense],['SPD',s.speed]].map(([k,v])=>`<div><b>${v}</b><span>${k}</span></div>`).join('');document.getElementById('pokemonDialogHelper').innerHTML=`<b>Arcade helper · ${escapeHtml(a.name)}</b>${escapeHtml(a.desc)}<br><span class="muted">XP ${fmt(p.xp||0)} / ${fmt(xpNeeded(p.level))}</span>`;const inTeam=state.team.includes(key),btn=document.getElementById('teamToggleBtn');btn.textContent='VIEW IN ADVENTURE PARTY';btn.className=inTeam?'secondary full':'primary full';document.getElementById('pokemonDialog').showModal();}
function toggleTeam(){const key=pokemonModalKey;if(!key)return;document.getElementById('pokemonDialog').close();navigate('adventure');window.LuckyDexAdventure.openTool('detail',{key});}
function openCardModal(card){if(!card)return;const stored=state.cards[card.id]||card,img=document.getElementById('cardDialogImage'),base=card.image||stored.image||'';img.parentElement.classList.toggle('broken',!base);img.dataset.cardBase=base;img.dataset.fallbackStep='0';img.src=cardImage(base);img.onerror=()=>cardImageFallback(img);document.getElementById('cardDialogName').textContent=card.name||stored.name;document.getElementById('cardDialogMeta').textContent=[cardDisplayRarityV03515({...stored,...card}),humanCardText(card.set?.name||stored.setName||stored.set||'','Unknown set')].filter(Boolean).join(' · ');const badges=[];if(stored.count)badges.push(`Owned ×${stored.count}`);if(card.localId||stored.localId)badges.push(`#${card.localId||stored.localId}`);const classified=cardClassify({...stored,...card});const t=classified.tier;if(t>=3)badges.push(cardRarityLabel({...stored,...card}));document.getElementById('cardDialogBadges').innerHTML=badges.map(x=>`<span>${escapeHtml(x)}</span>`).join('');document.getElementById('cardDialog').showModal();}

function renderDaily(){const el=document.getElementById('dailyChallenges');if(!el)return;resetDaily();const tasks=state.daily.tasks.map(id=>DAILY_POOL.find(x=>x.id===id)).filter(Boolean);el.innerHTML=tasks.map(t=>{const v=Number(state.daily.progress[t.key]||0),done=v>=t.target;return `<div class="daily-row ${done?'done':''}"><div class="daily-check">${t.icon}</div><div><b>${escapeHtml(t.name)}</b><span>${Math.min(v,t.target)} / ${t.target}</span><div class="progress-track"><i style="width:${clamp(v/t.target*100,0,100)}%"></i></div></div><div class="daily-check">${done?'✓':'○'}</div></div>`;}).join('');const complete=tasks.length===3&&tasks.every(t=>Number(state.daily.progress[t.key]||0)>=t.target),btn=document.getElementById('dailyClaimBtn');btn.disabled=!complete||state.daily.claimed;btn.textContent=state.daily.claimed?'DAILY REWARD CLAIMED':'COMPLETE ALL 3 · CLAIM 🎟 + 300 COINS';document.getElementById('dailyStatusPill').textContent=state.daily.claimed?'Claimed':`${tasks.filter(t=>Number(state.daily.progress[t.key]||0)>=t.target).length}/3`;}
function claimDaily(){resetDaily();const tasks=state.daily.tasks.map(id=>DAILY_POOL.find(x=>x.id===id)).filter(Boolean);if(state.daily.claimed||tasks.length!==3||!tasks.every(t=>Number(state.daily.progress[t.key]||0)>=t.target))return;state.daily.claimed=true;state.profile.tickets++;state.profile.coins+=300;addTrainerXp(125);save();vibrate([20,30,60]);showToast('Daily board complete · +1 Pack Ticket +300 Coins');renderProfile();}
function showProfileMainView(){const main=document.getElementById('profileMainView'),ach=document.getElementById('profileAchievementsView'),custom=document.getElementById('profileCustomiseView');if(main)main.hidden=false;if(ach)ach.hidden=true;if(custom)custom.hidden=true;}
function showAchievementsView(){const main=document.getElementById('profileMainView'),ach=document.getElementById('profileAchievementsView'),custom=document.getElementById('profileCustomiseView');if(main)main.hidden=true;if(custom)custom.hidden=true;if(ach)ach.hidden=false;renderAchievements();const page=document.querySelector('.page[data-page="profile"]');if(page)page.scrollTop=0;}
function renderProfile(){const rp=rankProgress();document.getElementById('trainerRank').textContent=rp.rank;document.getElementById('trainerXpText').textContent=`${fmt(state.profile.xp)} XP`;document.getElementById('trainerXpBar').style.width=`${rp.pct}%`;const next=Object.values(ZONES).find(z=>z.rank>rp.rank);document.getElementById('trainerNextUnlock').textContent=next?`Next zone: ${next.name} at Rank ${next.rank}`:'All current zones unlocked';renderDaily();renderAchievements();window.LuckyDexCustomiseV0413?.refreshSummary?.();const uniquePokemon=new Set(Object.values(state.pokemon).map(x=>x.id)).size,uniqueCards=Object.keys(state.cards).length,setsStarted=new Set(Object.values(state.cards).map(cardSetKey)).size;document.getElementById('statsGrid').innerHTML=[['Battles won',state.stats.battlesWon],['Regional journeys',state.stats.adventureClears],['Arcade coins',state.stats.arcadeCoins],['Caught',state.stats.catches],['Shinies',state.stats.shinies],['Species',uniquePokemon],['Packs',state.stats.packs],['God packs',state.stats.godPacks||0],['Unique cards',uniqueCards],['Sets started',setsStarted],['Balls thrown',state.stats.ballsThrown],['Past returns',state.stats.expeditionRetreats||0],['Charm fragments',state.profile.shinyCharmFragments||0]].map(([k,v])=>`<div class="stat-card"><strong>${fmt(v)}</strong><span>${k}</span></div>`).join('');document.getElementById('unlockList').innerHTML=Object.values(ZONES).map(z=>`<div class="unlock-row ${rp.rank>=z.rank?'unlocked':'locked'}"><span>${z.emoji} ${z.name} Wild Hunt</span><b>${rp.rank>=z.rank?'UNLOCKED':`RANK ${z.rank}`}</b></div>`).join('')+`<div class="unlock-row ${rp.rank>=3?'unlocked':'locked'}"><span>🔵 Great Balls in Poké Mart</span><b>${rp.rank>=3?'UNLOCKED':'RANK 3'}</b></div><div class="unlock-row ${rp.rank>=7?'unlocked':'locked'}"><span>🟡 Ultra Balls in Poké Mart</span><b>${rp.rank>=7?'UNLOCKED':'RANK 7'}</b></div><div class="unlock-row ${state.profile.shinyCharmFragments>=3?'unlocked':'locked'}"><span>✨ Shiny Charm · every 3 fragments improves shiny odds</span><b>${state.profile.shinyCharmFragments>=3?`ACTIVE · 1/${effectiveShinyOdds()}`:`${state.profile.shinyCharmFragments||0}/3`}</b></div>`;const rare=state.rareHits.slice(0,16);document.getElementById('rarestList').innerHTML=rare.length?rare.map(x=>`<div class="rare-row"><b>${escapeHtml(x.name)}</b><span>${x.type==='pokemon'&&x.odds?`~1/${fmt(Math.round(x.odds))}`:escapeHtml(x.rarity||x.set||'Rare')}</span></div>`).join(''):'<div class="empty">Your shiny, legendary and high-rarity pulls will appear here.</div>';renderGlobalHud();}


function exportSave(){const data=JSON.stringify(state,null,2);if(window.Android?.shareText){window.Android.shareText(data);return;}const blob=new Blob([data],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lucky-dex-save.json';a.click();URL.revokeObjectURL(a.href);}
let pendingImportedSave=null;
function parseImportedSave(text){
  const parsed=JSON.parse(String(text||''));
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Save must be a JSON object.');
  if(!parsed.profile&&!parsed.pokemon&&!parsed.cards&&!parsed.arcade)throw new Error('This does not look like a LuckyDex save.');
  return parsed;
}
function importedSaveSummary(raw){
  const pokemon=Object.keys(raw?.pokemon||{}).length,cards=Object.keys(raw?.cards||{}).length,coins=Math.max(0,Number(raw?.profile?.coins||0)||0);
  return `${pokemon} Pokémon · ${cards} cards · ${fmt(coins)} coins`;
}
function closeImportSave(){pendingImportedSave=null;const panel=document.getElementById('importSavePanel'),text=document.getElementById('importSaveText'),summary=document.getElementById('importSaveSummary'),confirmBtn=document.getElementById('confirmImportBtn');if(panel)panel.hidden=true;if(text)text.value='';if(summary)summary.textContent='Paste an exported save to validate it.';if(confirmBtn)confirmBtn.disabled=true;}
function validateImportSave(){const text=document.getElementById('importSaveText'),summary=document.getElementById('importSaveSummary'),confirmBtn=document.getElementById('confirmImportBtn');try{pendingImportedSave=parseImportedSave(text?.value);if(summary)summary.textContent=`Ready to import · ${importedSaveSummary(pendingImportedSave)}`;if(confirmBtn)confirmBtn.disabled=false;return true;}catch(err){pendingImportedSave=null;if(summary)summary.textContent=text?.value?.trim()?`Invalid save: ${err.message}`:'Paste an exported save to validate it.';if(confirmBtn)confirmBtn.disabled=true;return false;}}
function openImportSave(){const panel=document.getElementById('importSavePanel');if(panel)panel.hidden=false;document.getElementById('importSaveText')?.focus();validateImportSave();}
function confirmImportSave(){if(!pendingImportedSave&&!validateImportSave())return false;const incoming=pendingImportedSave;if(!incoming)return false;try{localStorage.setItem('luckyDexSave',JSON.stringify(incoming));pendingImportedSave=null;location.reload();return true;}catch(err){showToast(`Import failed: ${err.message}`,3000);return false;}}

const __origConfirmImportSaveV0413 = confirmImportSave;
confirmImportSave=function(){if(pendingImportedSave){window.LuckyDexCosmeticsV0413?.ensureState(pendingImportedSave);window.LuckyDexAchievementTelemetryV0413?.ensure?.(pendingImportedSave);}return __origConfirmImportSaveV0413();};

window.LuckyDexCosmeticsV0413?.installBridge({getState:()=>state,save,showToast,onChange:()=>{renderProfile();window.LuckyDexCustomiseV0413?.render?.();}});
window.LuckyDexCustomiseV0413?.install({getState:()=>state,save,showToast,escapeHtml,core:window.LuckyDexCosmeticsV0413,onBack:showProfileMainView,onChange:()=>renderProfile()});

// Shared events (Adventure owns its scene listeners).

document.getElementById('cardSource').onchange=e=>{preparedPack=null;document.getElementById('packStage').innerHTML='<div class="empty compact-empty">Choose a set and spend your earned coins.</div>';loadSets(e.target.value);updatePackButton();};document.getElementById('openPackBtn').onclick=preparePack;document.getElementById('openTenPackBtn').onclick=preparePocketTenPack;document.getElementById('dustTicketExchangeBtn').onclick=()=>{exchangeDust();renderDustExchange();};document.getElementById('dustCardSearch').oninput=renderDustExchange;['dustSetFilter','dustRarityFilter','dustValueFilter'].forEach(id=>document.getElementById(id).onchange=renderDustExchange);document.getElementById('dustClearFilters').onclick=resetDustExchangeFilters;document.getElementById('dustKeepCopies').oninput=()=>renderDustBulkSummary();document.getElementById('dustKeepCopies').onchange=e=>{const keep=window.LuckyDexDustExchangeCore.normalizeKeepCopies(e.target.value);e.target.value=String(keep);state.ui.dustExchange={...(state.ui.dustExchange||{}),keepCopies:keep};save();renderDustBulkSummary();};document.getElementById('dustConvertFiltered').onclick=()=>confirmDustBulkSnapshot(buildDustBulkSnapshot());document.querySelectorAll('[data-dust-bulk-cancel]').forEach(btn=>btn.onclick=closeDustBulkDialog);document.getElementById('dustBulkConfirmBtn').onclick=()=>convertFilteredCardsToDust();document.getElementById('dustBulkDialog').addEventListener('close',()=>{pendingDustBulkSnapshot=null;});document.getElementById('dustBulkDialog').addEventListener('click',e=>{if(e.target===e.currentTarget)closeDustBulkDialog();});
document.querySelectorAll('[data-collection]').forEach(b=>b.onclick=()=>{collectionMode=b.dataset.collection;document.querySelectorAll('[data-collection]').forEach(x=>x.classList.toggle('active',x===b));rebuildCollectionControls();renderTeamPanel();renderCollection();});document.getElementById('collectionSearch').oninput=renderCollection;document.getElementById('collectionFilter').onchange=renderCollection;document.getElementById('collectionGroupFilter').onchange=renderCollection;
document.querySelectorAll('[data-challenge-tab]').forEach(b=>b.onclick=()=>{challengeTab=b.dataset.challengeTab;document.querySelectorAll('[data-challenge-tab]').forEach(x=>x.classList.toggle('active',x===b));renderAchievements();});
document.getElementById('achievementSummaryCard')?.addEventListener('click',showAchievementsView);document.getElementById('achievementsBackBtn')?.addEventListener('click',showProfileMainView);
document.getElementById('settingsBtn').onclick=()=>document.getElementById('settingsDialog').showModal();document.getElementById('closeSettings').onclick=()=>document.getElementById('settingsDialog').close();document.getElementById('closeCardDialog').onclick=()=>document.getElementById('cardDialog').close();document.getElementById('closePokemonDialog').onclick=()=>document.getElementById('pokemonDialog').close();document.getElementById('teamToggleBtn').onclick=toggleTeam;document.getElementById('cardDialog').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});document.getElementById('pokemonDialog').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
function setRareOddsSelectValue(el,value){if(!el)return false;const numeric=Number(value);const option=[...el.options].find(option=>Number(option.value)===numeric);if(option){el.value=option.value;return true;}el.selectedIndex=0;return false;}
document.getElementById('shinyOddsSelect').value=String(state.settings.shinyOdds);document.getElementById('vibrationToggle').checked=state.settings.vibration;const barrierBallLeftHandedToggle=document.getElementById('barrierBallLeftHandedToggle');if(barrierBallLeftHandedToggle)barrierBallLeftHandedToggle.checked=!!state.settings.barrierBallLeftHanded;document.getElementById('shinyOddsSelect').onchange=e=>{state.settings.shinyOdds=Number(e.target.value);save();updateSearchCard();};const rareOddsControls={rarePowerTrialGoldenOddsSelect:'powerTrialGolden',rareImpactTrialGoldenOddsSelect:'impactTrialGolden',rareTargetRangeGoldenOddsSelect:'targetRangeGolden',rareElementalGauntletPrismaticOddsSelect:'elementalGauntletPrismatic',rareEnduranceExpeditionCacheOddsSelect:'enduranceExpeditionCache',rareRouletteServiceDayOddsSelect:'rouletteServiceDay',rareRouletteRescueOddsSelect:'rouletteRescue',rareRouletteGoldenBallOddsSelect:'rouletteGoldenBall',rareSlotReelTimeOddsSelect:'slotReelTime',rareIceCreamDreamScoopOddsSelect:'iceCreamDreamScoop',rareWailordRainbowBallOddsSelect:'wailordRainbowBall',rarePokemonSeekDreamSparkleOddsSelect:'pokemonSeekDreamSparkle',rarePikachuBeachLuckyWaveOddsSelect:'pikachuBeachLuckyWave',rareFishingTreasureOddsSelect:'fishingTreasure',rareFishingEasterJunkOddsSelect:'fishingEasterJunk',rareFishingJumboOddsSelect:'fishingJumbo',rareFishingRarePokemonOddsSelect:'fishingRarePokemon',rareGutsyGolbatGoldenHeartOddsSelect:'gutsyGolbatGoldenHeart',rareFurretFrolicMasterBallOddsSelect:'furretFrolicMasterBall',rareBerryOddsSelect:'berry',rareUnownOddsSelect:'unown',rareTileCardOddsSelect:'tileCard',rareTilePackOddsSelect:'tilePack',rareTilePresentOddsSelect:'tilePresent',rareVoltorbGiftOddsSelect:'voltorbGift',rareGoldRockOddsSelect:'goldRock',rareFossilCardOddsSelect:'fossilCard',rareFossilPackOddsSelect:'fossilPack'};for(const [id,key] of Object.entries(rareOddsControls)){const el=document.getElementById(id);if(!el)continue;setRareOddsSelectValue(el,state.settings.rareOdds?.[key]??defaultState.settings.rareOdds[key]);el.onchange=e=>{state.settings.rareOdds={...defaultState.settings.rareOdds,...(state.settings.rareOdds||{}),[key]:Math.max(0,Math.min(1,Number(e.target.value)||0))};save();};}document.getElementById('vibrationToggle').onchange=e=>{state.settings.vibration=e.target.checked;save();};if(barrierBallLeftHandedToggle)barrierBallLeftHandedToggle.onchange=e=>{state.settings.barrierBallLeftHanded=!!e.target.checked;save();window.LuckyDexBarrierBall?.renderHandedness?.();};document.getElementById('dailyClaimBtn').onclick=claimDaily;document.getElementById('exportBtn').onclick=exportSave;document.getElementById('settingsExportBtn').onclick=exportSave;document.getElementById('importBtn').onclick=openImportSave;document.getElementById('cancelImportBtn').onclick=closeImportSave;document.getElementById('confirmImportBtn').onclick=confirmImportSave;document.getElementById('importSaveText').oninput=validateImportSave;document.getElementById('resetBtn').onclick=()=>{if(confirm('Delete the entire Lucky Dex collection and game progress?')){window.LuckyDexAdventure?.leave?.();state=cloneDefault();window.LuckyDexCosmeticsV0413?.ensureState(state);window.LuckyDexAchievementTelemetryV0413?.ensure?.(state);resetDaily();window.LuckyDexAdventureModel?.ensureState(state);save();renderStarter();renderZones();renderProfile();rebuildCollectionControls();renderCollection();}};


async function bootLuckyDexV0158(){
  resetDaily();const speciesJob=initSpecies();renderGlobalHud();renderStarter();renderZones();rebuildCollectionControls();renderTeamPanel();renderProfile();
  // Fire background hydration, but never hold Adventure or the title screen on it.
  loadZonePool(state.settings.zone in ZONES?state.settings.zone:'meadow');loadSets('tcg');speciesJob.then(()=>{renderStarter();}).catch(()=>{});
}


/* =========================================================
   v0.5 — app-flow / pack / arcade overrides
   ========================================================= */

const MEMORY_SYMBOLS_V5=['⭐','🎵','🌙','💫'];


function assetFlexible(base){
  if(!base)return '';
  return /\.(?:webp|png|jpe?g)(?:\?.*)?$/i.test(base)?base:`${base}.webp`;
}
function normalizeCardBase(base=''){
  let out=String(base||'');
  if(/images\.pokemontcg\.io/i.test(out))return out.replace(/_hires\.png(?:\?.*)?$/i,'').replace(/\.png(?:\?.*)?$/i,'');
  return out.replace(/\/(?:high|low)\.(?:webp|png|jpe?g)(?:\?.*)?$/i,'');
}
function cardImage(base,q='high',ext='webp'){
  base=normalizeCardBase(base);if(!base)return '';
  if(/^(?:blob:|data:)/i.test(base))return base;
  // pokemon-tcg-data switched newer sets to Scrydex's direct image routes.
  // These are already complete image URLs (large/small), not TCGdex-style bases.
  if(/images\.scrydex\.com/i.test(base)){
    if(/\/(?:large|small)(?:\?.*)?$/i.test(base))return base.replace(/\/(?:large|small)(?=\?|$)/i,q==='high'?'/large':'/small');
    return `${base.replace(/\/$/,'')}/${q==='high'?'large':'small'}`;
  }
  if(/images\.pokemontcg\.io/i.test(base))return `${base}${q==='high'?'_hires':''}.png`;
  // Preserve any other already-complete image URL instead of corrupting it by
  // appending /high.webp. TCGdex bases intentionally have no extension.
  if(/\.(?:png|webp|jpe?g|avif)(?:\?.*)?$/i.test(base))return base;
  return `${base}/${q}.${ext}`;
}
function deriveCardBase(card,set){
  if(card?.image)return normalizeCardBase(card.image);
  const local=card?.localId;
  const setId=card?.set?.id||set?.id;
  const serieId=card?.set?.serie?.id||set?.serie?.id;
  if(local!=null&&setId&&serieId)return `https://assets.tcgdex.net/en/${serieId}/${setId}/${local}`;
  return '';
}

// Physical-card identity helpers. v0.16.4 deliberately does not infer artwork
// from a collector number alone: subset/reprint catalogues can number the same
// physical cards differently, so only verified cross-catalogue matches may feed art.
function normalizePhysicalSetCodeV163(value=''){
  const code=String(value||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  return code.length>=2&&code.length<=10?code:'';
}
function physicalCollectorNumbersV163(card){
  const raw=String(card?.localId??card?.number??'').trim();if(!raw)return [];
  const values=[];const add=v=>{v=String(v||'').trim().toUpperCase();if(v&&!values.includes(v))values.push(v);};
  if(/^0*\d+$/.test(raw)){const n=String(Number(raw));add(n.padStart(3,'0'));add(n);}
  else {add(raw);add(raw.replace(/[^A-Z0-9]/gi,''));}
  return values;
}
function physicalSetCodesV163(card,set=null){
  const values=[];const add=v=>{const code=normalizePhysicalSetCodeV163(v);if(code&&!values.includes(code))values.push(code);};
  add(card?._limitlessSetCode);add(card?._ptcgoCode);
  add(card?.set?.tcgOnline);add(card?.set?.ptcgoCode);add(card?.set?.abbreviation?.official);add(card?.set?.abbreviation);add(card?.set?.abbreviations?.official);
  add(set?.tcgOnline);add(set?.ptcgoCode);add(set?.abbreviation?.official);add(set?.abbreviation);add(set?.abbreviations?.official);
  // TCGdex uses the official short code as the set id for some current promo
  // sets (e.g. mep), so keep IDs as the final candidate rather than assuming
  // every API uses the same naming scheme.
  add(card?.set?.id);add(card?.setId);add(set?.id);
  return values;
}
function physicalCardArtworkCandidatesV163(card,set=null){
  // v0.16.4: NEVER guess physical artwork from a set code + collector number.
  // That is not identity-safe for reprint/subset sets (for example 30th-c #015
  // collides with 30C #015, which is Fuecoco ex). Only surface URLs that were
  // attached after a metadata-backed identity match.
  if(!card||(card.source||'tcg')==='tcgp')return [];
  const urls=[],seen=new Set(),add=url=>{url=String(url||'');if(url&&!seen.has(url)){seen.add(url);urls.push(url);}};
  add(card._scrydexImageLarge);add(card._scrydexImageSmall);
  add(card._ptcgImageLarge);add(card._ptcgImageSmall);
  return urls;
}
window.physicalCardArtworkCandidatesV163=physicalCardArtworkCandidatesV163;

let ptcgSetListV5=null;
const ptcgCardSetCacheV151=new Map();
const ptcgCardRecordCacheV151=new Map();

// v0.15.2: bundled bridge for the 2026 anniversary sets. TCGdex currently
// exposes some of these cards before its image CDN has matching artwork, and
// Android WebView can also fail the GitHub metadata request on a slow/strict
// connection. Keep a compact, deterministic map for the affected Classic
// Collection so a card such as TCGdex 30th-c-003 Metagross can resolve to the
// maintained Scrydex image me55c-11 without another metadata round-trip.
const PTCG_30TH_CLASSIC_V152=[
  ['me55c-58','Pikachu','58','Common','40','Mitsuhiro Arita'],
  ['me55c-4','Charizard','4','Rare Holo','120','Mitsuhiro Arita'],
  ['me55c-18','Misty','18','Rare Holo','','Ken Sugimori'],
  ['me55c-69',"Erika's Jigglypuff",'69','Common','50','Ken Sugimori'],
  ['me55c-25','Sneasel','25','Rare','60','Ken Sugimori'],
  ['me55c-106','Shining Celebi','106','Rare Secret','50','Hironobu Yoshida'],
  ['me55c-149','Lugia','149','Rare Secret','80','Naoyo Kimura'],
  ['me55c-5','Delcatty','5','Rare Holo','70','Atsuko Nishida'],
  ['me55c-19','Dark Tyranitar','19','Rare','120','Nakaoka'],
  ['me55c-108','Scizor ex','108','Rare Holo ex','120','Mitsuhiro Arita'],
  ['me55c-11','Metagross','11','Rare Holo','100','Masakazu Fukuda'],
  ['me55c-106p','Palkia LV.X','106','Rare Holo LV.X','120','Ryo Ueda'],
  ['me55c-43','Uxie','43','Rare','70','Ken Sugimori'],
  ['me55c-47','Crobat G','47','Uncommon','80','Makoto Imai'],
  ['me55c-94','Gengar','94','Rare Prime','130','Takashi Yamaguchi'],
  ['me55c-99','Darkrai & Cresselia LEGEND','99','LEGEND','150','Noriko Takaya, Shinji Higuchi'],
  ['me55c-100','Darkrai & Cresselia LEGEND','100','LEGEND','150','Noriko Takaya, Shinji Higuchi'],
  ['me55c-101','N','101','Rare Ultra','','Ken Sugimori'],
  ['me55c-85','Rayquaza-EX','85','Rare Holo EX','170','Eske Yoshinob'],
  ['me55c-11g','Genesect-EX','11','Rare Holo EX','170','Eske Yoshinob'],
  ['me55c-106m','M Gardevoir-EX','106','Rare Holo EX','210','5ban Graphics'],
  ['me55c-41','Greninja BREAK','41','Rare BREAK','170','5ban Graphics'],
  ['me55c-89','Solgaleo-GX','89','Rare Holo GX','250','PLANETA'],
  ['me55c-57','Buzzwole-GX','57','Rare Holo GX','190','5ban Graphics'],
  ['me55c-33','Pikachu & Zekrom-GX','33','Rare Holo GX','240','Mitsuhiro Arita'],
  ['me55c-138','Zacian V','138','Holo Rare V','220','5ban Graphics'],
  ['me55c-50','Raikou','50','Amazing Rare','110','Hideki Ishikawa'],
  ['me55c-114','Mew VMAX','114','Holo Rare VMAX','310','5ban Graphics'],
  ['me55c-123','Arceus VSTAR','123','Holo Rare VSTAR','280','5ban Graphics'],
  ['me55c-203','Magikarp','203','Illustration Rare','30','Shinji Kanda']
].map(([id,name,number,rarity,hp,artist])=>({id,name,number,rarity,hp,artist,images:{large:`https://images.scrydex.com/pokemon/${id}/large`,small:`https://images.scrydex.com/pokemon/${id}/small`}}));

function bundledPtcgArtworkRecordV152(card,set=null){
  const setName=normalizeSetNameV5(card?.set?.name||card?.setName||set?.name||'');
  const setId=String(card?.set?.id||card?.setId||set?.id||'').toLowerCase();
  const classic=setId==='30th-c'||setName==='30th classic collection'||setName==='30th celebration classic collection';
  if(classic){
    const wanted=normalizeSetNameV5(card?.name||''),wantedBase=normalizeLegacyCardNameV153(card?.name||'');
    let candidates=PTCG_30TH_CLASSIC_V152.filter(c=>normalizeSetNameV5(c.name)===wanted);
    // Several Classic Collection entries use the base Pokémon name in TCGdex
    // while the maintained art dataset keeps the original mechanic suffix.
    // Example: Palkia -> Palkia LV.X. Fall back to mechanic-insensitive names.
    if(!candidates.length)candidates=PTCG_30TH_CLASSIC_V152.filter(c=>normalizeLegacyCardNameV153(c.name)===wantedBase);
    if(!candidates.length)return null;
    const scored=candidates.map((c,index)=>({c,index,score:ptcgCandidateScoreV153(card,c)})).sort((a,b)=>b.score-a.score||a.index-b.index);
    if(scored.length===1||scored[0].score>scored[1].score)return scored[0].c;
    const sameBriefs=(set?.cards||[]).filter(c=>normalizeLegacyCardNameV153(c?.name||'')===wantedBase);
    const occurrence=Math.max(0,sameBriefs.findIndex(c=>c?.id===card?.id));
    return candidates[Math.min(occurrence,candidates.length-1)]||candidates[0];
  }
  // The main 30th Celebration set uses the same printed number in
  // pokemon-tcg-data/Scrydex, so no large name map is necessary.
  const celebration=setId==='30th'||setName==='30th celebration';
  if(celebration){
    const raw=String(card?.localId??'').trim();if(!raw)return null;
    const number=/^0*\d+$/.test(raw)?String(Number(raw)):raw.toUpperCase();
    const id=`me55-${number}`;
    return {id,name:card?.name||'',number,rarity:card?.rarity||'',hp:card?.hp||'',artist:card?.illustrator||card?.artist||'',images:{large:`https://images.scrydex.com/pokemon/${id}/large`,small:`https://images.scrydex.com/pokemon/${id}/small`}};
  }
  return null;
}
function normalizeSetNameV5(name=''){return String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/pok[eé]mon/g,'pokemon').replace(/[^a-z0-9]+/g,' ').trim();}
function normalizedDateV151(value=''){return String(value||'').trim().replace(/\//g,'-').slice(0,10);}
function setCardCountV151(set){return Number(set?.cardCount?.total??set?.cardCount?.official??set?.total??set?.printedTotal??0)||0;}
function tokenSetV151(value=''){return new Set(normalizeSetNameV5(value).split(/\s+/).filter(Boolean));}
function tokenSimilarityV151(a,b){
  const A=tokenSetV151(a),B=tokenSetV151(b);if(!A.size||!B.size)return 0;
  let shared=0;for(const t of A)if(B.has(t))shared++;
  return shared/Math.max(A.size,B.size);
}
async function loadPtcgSetListV5(signal=null){
  if(ptcgSetListV5)return ptcgSetListV5;
  let cached=[];try{const hit=JSON.parse(localStorage.getItem('luckyDexPtcgSets')||'null');if(Array.isArray(hit))cached=hit;}catch(e){}
  // Do not let a months-old set list live forever. This was the reason newly
  // released sets such as 30th Celebration could never reach their real art.
  if(typeof isOnlineV13==='function'&&!isOnlineV13()){ptcgSetListV5=cached;return cached;}
  try{
    const url='https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/sets/en.json';
    const list=signal?await packFetch(url,signal,12000):await fetchJson(url);
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    ptcgSetListV5=Array.isArray(list)?list:cached;
    if(ptcgSetListV5.length)try{localStorage.setItem('luckyDexPtcgSets',JSON.stringify(ptcgSetListV5));localStorage.setItem('luckyDexPtcgSetsAt',String(Date.now()));}catch(e){}
    return ptcgSetListV5;
  }catch(e){if(signal?.aborted)throw e;ptcgSetListV5=cached;return cached;}
}
function choosePtcgSetV151(setName,set,list){
  const wanted=normalizeSetNameV5(setName),release=normalizedDateV151(set?.releaseDate),count=setCardCountV151(set);
  const wantedId=String(set?.id||'').trim().toLowerCase();
  const wantedCodes=new Set(physicalSetCodesV163(null,set));
  let best=null,bestScore=-1;
  for(const row of list||[]){
    const n=normalizeSetNameV5(row?.name||''),rowId=String(row?.id||'').trim().toLowerCase(),rowCode=normalizePhysicalSetCodeV163(row?.ptcgoCode||row?.tcgOnline||'');
    const sameId=!!(wantedId&&rowId===wantedId),sameCode=!!(rowCode&&wantedCodes.has(rowCode)),sameName=!!(wanted&&n===wanted);
    // v0.16.4: artwork may only cross catalogues after an identity-strength
    // set match. Fuzzy token similarity is useful for search, but it is not
    // safe enough to attach an image to a named card.
    if(!sameId&&!sameCode&&!sameName)continue;
    let score=(sameId?100:0)+(sameCode?80:0)+(sameName?20:0);
    if(release&&normalizedDateV151(row?.releaseDate)===release)score+=3;
    const rc=setCardCountV151(row);if(count&&rc&&count===rc)score+=2;
    if(score>bestScore){bestScore=score;best=row;}
  }
  return best;
}

async function loadPtcgCardsForSetV151(setId,signal=null){
  if(!setId)return [];
  if(ptcgCardSetCacheV151.has(setId))return ptcgCardSetCacheV151.get(setId);
  const key=`luckyDexPtcgCardsV151:${setId}`;
  let cached=[];try{const hit=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(hit)&&hit.length)cached=hit;}catch(e){}
  if(typeof isOnlineV13==='function'&&!isOnlineV13()){ptcgCardSetCacheV151.set(setId,cached);return cached;}
  try{
    const url=`https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/${encodeURIComponent(setId)}.json`;
    const list=signal?await packFetch(url,signal,12000):await fetchJson(url);
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    const cards=Array.isArray(list)?list:cached;ptcgCardSetCacheV151.set(setId,cards);
    // Persist only compact art/identity metadata. Full card JSON for large sets
    // can exceed WebView localStorage limits.
    if(cards.length){
      const compact=cards.map(c=>({id:c.id,name:c.name,number:c.number,rarity:c.rarity,artist:c.artist,hp:c.hp,images:c.images}));
      try{localStorage.setItem(key,JSON.stringify(compact));}catch(e){}
      return compact;
    }
    return cards;
  }catch(e){if(signal?.aborted)throw e;ptcgCardSetCacheV151.set(setId,cached);return cached;}
}
function normalizeArtistV151(value=''){return normalizeSetNameV5(String(value||'').replace(/\s+/g,' '));}
function normalizeLegacyCardNameV153(value=''){
  // Reprint databases disagree on whether the era mechanic is part of the
  // display name (Palkia vs Palkia LV.X, Rayquaza vs Rayquaza-EX, etc.).
  // Strip only trailing mechanic tokens for matching; preserve the real name.
  let x=normalizeSetNameV5(value);
  x=x.replace(/\b(?:lv x|vmax|vstar|break|prime|ex|gx|v|g)\b/g,' ').replace(/\s+/g,' ').trim();
  return x;
}
function ptcgCandidateScoreV153(card,candidate){
  const wanted=normalizeSetNameV5(card?.name||''),got=normalizeSetNameV5(candidate?.name||'');
  const wantedBase=normalizeLegacyCardNameV153(card?.name||''),gotBase=normalizeLegacyCardNameV153(candidate?.name||'');
  let score=0;
  if(wanted&&got===wanted)score+=30;
  else if(wantedBase&&gotBase===wantedBase)score+=16;
  const artist=normalizeArtistV151(card?.illustrator||card?.artist),hp=String(card?.hp??'');
  if(artist&&normalizeArtistV151(candidate?.artist)===artist)score+=8;
  if(hp&&String(candidate?.hp??'')===hp)score+=4;
  return score;
}
function stripCardNumberV151(value=''){return String(value??'').trim().replace(/^0+(?=\d)/,'').toLowerCase();}
function choosePtcgCardV151(card,set,cards){
  const wanted=normalizeSetNameV5(card?.name||''),wantedBase=normalizeLegacyCardNameV153(card?.name||'');
  let candidates=(cards||[]).filter(c=>normalizeSetNameV5(c?.name||'')===wanted);
  if(!candidates.length)candidates=(cards||[]).filter(c=>normalizeLegacyCardNameV153(c?.name||'')===wantedBase);
  if(!candidates.length)return null;if(candidates.length===1)return candidates[0];
  const local=stripCardNumberV151(card?.localId),exact=candidates.find(c=>stripCardNumberV151(c?.number)===local);if(exact)return exact;
  let scored=candidates.map((c,index)=>({c,index,score:ptcgCandidateScoreV153(card,c)}));
  scored.sort((a,b)=>b.score-a.score||a.index-b.index);
  if(scored[0]?.score>scored[1]?.score)return scored[0].c;
  // Reprint subsets can contain two cards with the same name/artist/stats (for
  // example the two LEGEND halves). Preserve occurrence order instead of
  // collapsing them onto the same image.
  const sameBriefs=(set?.cards||[]).filter(c=>normalizeLegacyCardNameV153(c?.name||'')===wantedBase);
  const occurrence=Math.max(0,sameBriefs.findIndex(c=>c?.id===card?.id));
  return candidates[Math.min(occurrence,candidates.length-1)]||candidates[0];
}

const scrydexExpansionCacheV164=new Map();
const scrydexCardCacheV164=new Map();
const MCD23_BY_NUMBER_V164={
  '1':'Sprigatito','2':'Fuecoco','3':'Quaxly','4':'Cetoddle','5':'Cetitan',
  '6':'Pikachu','7':'Pawmi','8':'Kilowattrel','9':'Flittle','10':'Sandaconda',
  '11':'Klawf','12':'Blissey','13':'Tandemaus','14':'Cyclizar','15':'Kirlia'
};
function scrydexRowsV164(payload){return Array.isArray(payload)?payload:(Array.isArray(payload?.data)?payload.data:[]);}
function scrydexEscapeV164(value=''){return String(value||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"');}
async function scrydexFetchV164(url,signal=null,timeout=6500){
  if(typeof isOnlineV13==='function'&&!isOnlineV13())throw new Error('offline');
  const controller=new AbortController(),abort=()=>controller.abort();if(signal?.aborted)controller.abort();signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,timeout);
  try{const r=await fetch(url,{signal:controller.signal,cache:'force-cache'});if(!r.ok)throw new Error(`Scrydex ${r.status}`);return await r.json();}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
function scrydexSetAliasV164(setName='',setId=''){
  const name=normalizeSetNameV5(setName),id=String(setId||'').toLowerCase();
  if(name==='mcdonald s collection 2023'||id==='2023sv'||id==='mcd23')return 'mcd23';
  if(name==='30th classic collection'||name==='30th celebration classic collection'||id==='30th-c')return 'me55c';
  return '';
}
function scrydexImageUrlsV164(hit){
  const out=[];const add=v=>{v=String(v||'');if(v&&!out.includes(v))out.push(v);};
  if(Array.isArray(hit?.images)){
    const fronts=[...hit.images].sort((a,b)=>(a?.type==='front'?-1:0)-(b?.type==='front'?-1:0));
    for(const row of fronts){add(row?.large);add(row?.medium);add(row?.small);}
  }else if(hit?.images){add(hit.images.large);add(hit.images.medium);add(hit.images.small);}
  if(hit?.id){add(`https://images.scrydex.com/pokemon/${hit.id}/large`);add(`https://images.scrydex.com/pokemon/${hit.id}/small`);}
  return out;
}
async function scrydexExpansionForSetV164(card,set=null,signal=null){
  const setName=card?.set?.name||card?.setName||set?.name||'',setId=card?.set?.id||card?.setId||set?.id||'';
  const alias=scrydexSetAliasV164(setName,setId);if(alias)return {id:alias,name:setName,_trustedAlias:true};
  const key=`${normalizeSetNameV5(setName)}|${normalizedDateV151(set?.releaseDate||card?.set?.releaseDate||'')}`;if(scrydexExpansionCacheV164.has(key))return scrydexExpansionCacheV164.get(key);
  const wanted=normalizeSetNameV5(setName);if(!wanted)return null;
  try{
    const q=encodeURIComponent(`!name:"${scrydexEscapeV164(setName)}"`),url=`https://api.scrydex.com/pokemon/v1/en/expansions?q=${q}&page_size=20&select=id,name,code,total,printed_total,release_date`;
    const rows=scrydexRowsV164(await scrydexFetchV164(url,signal));
    const exact=rows.filter(r=>normalizeSetNameV5(r?.name||'')===wanted);
    const release=normalizedDateV151(set?.releaseDate||card?.set?.releaseDate||''),count=setCardCountV151(set||card?.set);
    let best=null,bestScore=-1;for(const row of exact){let score=20;if(release&&normalizedDateV151(row?.release_date)===release)score+=4;const rc=Number(row?.total||row?.printed_total||0);if(count&&rc&&count===rc)score+=2;if(score>bestScore){best=row;bestScore=score;}}
    scrydexExpansionCacheV164.set(key,best||null);return best||null;
  }catch(e){if(signal?.aborted)throw e;scrydexExpansionCacheV164.set(key,null);return null;}
}
async function scrydexCardRecordV164(card,set=null,signal=null){
  if(!card)return null;
  const cacheKey=card?.id||`${set?.id||''}:${card?.localId||''}:${card?.name||''}`;if(scrydexCardCacheV164.has(cacheKey))return scrydexCardCacheV164.get(cacheKey);
  const setName=card?.set?.name||card?.setName||set?.name||'',setId=card?.set?.id||card?.setId||set?.id||'',alias=scrydexSetAliasV164(setName,setId);
  // These two aliases are deterministic and do not require an API request.
  if(alias==='mcd23'){
    const raw=String(card?.localId??card?.number??'').trim();
    if(/^0*\d+$/.test(raw)){
      const number=String(Number(raw)),expected=MCD23_BY_NUMBER_V164[number]||'';
      // This bridge is only used when BOTH the local collector number and card
      // name agree with McDonald's Collection 2023. It therefore cannot turn a
      // valid name into unrelated artwork if another catalogue reuses a number.
      if(expected&&normalizeSetNameV5(expected)===normalizeSetNameV5(card?.name||'')){
        const hit={id:`mcd23-${number}`,name:expected,number,rarity:'Promo',artist:card?.illustrator||card?.artist||'',hp:card?.hp||'',images:{large:`https://images.scrydex.com/pokemon/mcd23-${number}/large`,small:`https://images.scrydex.com/pokemon/mcd23-${number}/small`}};
        scrydexCardCacheV164.set(cacheKey,hit);return hit;
      }
    }
  }
  if(alias==='me55c'){
    const hit=bundledPtcgArtworkRecordV152(card,set);if(hit){scrydexCardCacheV164.set(cacheKey,hit);return hit;}
  }
  const expansion=await scrydexExpansionForSetV164(card,set,signal);if(!expansion?.id)return null;
  try{
    const wanted=normalizeSetNameV5(card?.name||'');if(!wanted)return null;
    const q=encodeURIComponent(`!name:"${scrydexEscapeV164(card.name)}"`),url=`https://api.scrydex.com/pokemon/v1/en/expansions/${encodeURIComponent(expansion.id)}/cards?q=${q}&page_size=100&select=id,name,number,artist,hp,rarity,images,expansion_sort_order`;
    const rows=scrydexRowsV164(await scrydexFetchV164(url,signal)).filter(r=>normalizeSetNameV5(r?.name||'')===wanted);if(!rows.length)return null;
    if(rows.length===1){scrydexCardCacheV164.set(cacheKey,rows[0]);return rows[0];}
    const local=stripCardNumberV151(card?.localId??card?.number),artist=normalizeArtistV151(card?.illustrator||card?.artist),hp=String(card?.hp??'');
    const scored=rows.map((r,index)=>{let score=0;if(local&&stripCardNumberV151(r?.number)===local)score+=12;if(artist&&normalizeArtistV151(r?.artist)===artist)score+=8;if(hp&&String(r?.hp??'')===hp)score+=4;return {r,index,score};}).sort((a,b)=>b.score-a.score||Number(a.r?.expansion_sort_order??a.index)-Number(b.r?.expansion_sort_order??b.index));
    let hit=scored[0]?.r||null;if(scored.length>1&&scored[0].score===scored[1].score){const same=(set?.cards||[]).filter(c=>normalizeSetNameV5(c?.name||'')===wanted),occ=Math.max(0,same.findIndex(c=>c?.id===card?.id));const ordered=[...rows].sort((a,b)=>Number(a?.expansion_sort_order??0)-Number(b?.expansion_sort_order??0));hit=ordered[Math.min(occ,ordered.length-1)]||hit;}
    if(hit)scrydexCardCacheV164.set(cacheKey,hit);return hit;
  }catch(e){if(signal?.aborted)throw e;return null;}
}
async function scrydexArtworkBaseV164(card,set=null,signal=null){
  const hit=await scrydexCardRecordV164(card,set,signal);if(!hit)return '';
  const urls=scrydexImageUrlsV164(hit),art=urls[0]||'';if(!art)return '';
  card._scrydexId=hit.id||'';card._scrydexImageLarge=urls.find(x=>/\/large(?:\?|$)/i.test(x))||art;card._scrydexImageSmall=urls.find(x=>/\/small(?:\?|$)/i.test(x))||'';card._artSource='scrydex-identity';card._artIdentityVerified=true;
  if((!card.rarity||/^(?:none|unknown)$/i.test(String(card.rarity)))&&hit.rarity)card.rarity=hit.rarity;
  card.image=art;return art;
}
window.scrydexArtworkBaseV164=scrydexArtworkBaseV164;

async function pokemonTcgArtworkRecordV151(card,set=null,signal=null){
  const cacheKey=card?.id||`${set?.id||''}:${card?.localId||''}:${card?.name||''}`;
  if(ptcgCardRecordCacheV151.has(cacheKey))return ptcgCardRecordCacheV151.get(cacheKey);
  const bundled=bundledPtcgArtworkRecordV152(card,set);
  if(bundled){ptcgCardRecordCacheV151.set(cacheKey,bundled);return bundled;}
  const list=await loadPtcgSetListV5(signal),setName=card?.set?.name||card?.setName||set?.name||'';
  const match=choosePtcgSetV151(setName,set,list);if(!match)return null;
  const matchCode=normalizePhysicalSetCodeV163(match?.ptcgoCode||match?.tcgOnline||'');if(matchCode)card._limitlessSetCode=matchCode;
  const cards=await loadPtcgCardsForSetV151(match.id,signal),hit=choosePtcgCardV151(card,set,cards);
  if(hit)ptcgCardRecordCacheV151.set(cacheKey,hit);return hit||null;
}
async function pokemonTcgArtworkBaseV5(card,set=null,signal=null){
  const hit=await pokemonTcgArtworkRecordV151(card,set,signal);
  if(hit?.images){
    const art=hit.images.large||hit.images.small||'';
    if(art){
      if(card.image&&!/images\.scrydex\.com/i.test(String(card.image)))card._tcgdexImage=card._tcgdexImage||card.image;card._artSource='pokemon-tcg-data';card._artIdentityVerified=true;card._ptcgId=hit.id;card._ptcgNumber=hit.number||'';card._ptcgImageLarge=hit.images.large||'';card._ptcgImageSmall=hit.images.small||'';
      // TCGdex deliberately reports some new reprint subsets as rarity "None".
      // The alternate catalogue has the actual printed rarity, which also lets
      // Lucky Dex choose sensible pack slots and reveal tiers.
      if((!card.rarity||/^(?:none|unknown)$/i.test(String(card.rarity)))&&hit.rarity)card.rarity=hit.rarity;
      card.image=art;return art;
    }
  }
  return '';
}
async function enrichPhysicalCardV151(card,set=null,signal=null){
  if(!card)return card;
  try{const art=await pokemonTcgArtworkBaseV5(card,set,signal);if(!art)await scrydexArtworkBaseV164(card,set,signal);}catch(e){if(signal?.aborted)throw e;}
  return card;
}
function cardArtHtml(base,name,card=null){
  const clean=normalizeCardBase(base),cardId=card?.id||'';
  let direct='';try{if(!clean&&card&&(typeof isOnlineV13!=='function'||isOnlineV13()))direct=physicalCardArtworkCandidatesV163(card,null)[0]||'';}catch(_){ }
  const first=clean||direct,physicalIndex=direct?1:0;
  return `<div class="card-art-wrap ${first?'loading-art':'broken loading-art'}"><img ${first?`src="${cardImage(first,'high','webp')}"`:''} data-card-base="${escapeHtml(first)}" data-card-id="${escapeHtml(cardId)}" data-fallback-step="0" data-alt-tried="0" data-physical-fallback="${physicalIndex}" alt="${escapeHtml(name||'Card')}" onerror="cardImageFallback(this)"><div class="card-art-fallback">Artwork unavailable<br><small>${escapeHtml(name||'Card')}</small></div></div>`;
}
async function cardImageFallback(img){
  const base=normalizeCardBase(img.dataset.cardBase||'');
  let step=Number(img.dataset.fallbackStep||0);
  const ptcg=/images\.pokemontcg\.io/i.test(base),completeDirect=/\.(?:png|webp|jpe?g|avif)(?:\?.*)?$/i.test(base)&&!ptcg;
  const attempts=completeDirect?[]:ptcg?[()=>cardImage(base,'low','png')]:[
    ()=>cardImage(base,'high','png'),
    ()=>cardImage(base,'low','webp'),
    ()=>cardImage(base,'low','png')
  ];
  if(base&&step<attempts.length){img.dataset.fallbackStep=String(step+1);img.src=attempts[step]();return;}
  const cardId=img.dataset.cardId||'';
  const live=img._luckyCard||(cardId?(state.cards[cardId]||preparedPack?.cards?.find(c=>c.id===cardId)):null);
  if(live&&(live.source||preparedPack?.source)==='tcgp'){
    const fallbacks=live._tcgpFallbacks||[],idx=Number(img.dataset.pocketFallback||0);
    if(idx<fallbacks.length){img.dataset.pocketFallback=String(idx+1);img.dataset.cardBase=fallbacks[idx];img.dataset.fallbackStep='0';img.parentElement?.classList.remove('broken');img.parentElement?.classList.add('loading-art');img.src=fallbacks[idx];return;}
    if(img.dataset.altTried!=='1'&&window.LuckyDexPocket?.resolveCard){
      img.dataset.altTried='1';
      try{
        const exact=await LuckyDexPocket.resolveCard(live);
        if(exact?.image&&normalizeCardBase(exact.image)!==base){
          Object.assign(live,exact);live._pocketExactRemote=true;
          if(cardId&&state.cards[cardId])Object.assign(state.cards[cardId],exact);
          try{localStorage.setItem('luckyDexSave',JSON.stringify(state));}catch(e){}
          img.dataset.cardBase=exact.image;img.dataset.fallbackStep='0';img.parentElement?.classList.remove('broken');img.parentElement?.classList.add('loading-art');img.src=cardImage(exact.image,'high','webp');return;
        }
      }catch(_){ }
    }
  }
  // Try any already identity-verified alternate artwork before another lookup.
  if(live&&(live.source||preparedPack?.source||'tcg')!=='tcgp'){
    const direct=physicalCardArtworkCandidatesV163(live,preparedPack?.set||live?.set||null),idx=Number(img.dataset.physicalFallback||0);
    if(idx<direct.length){img.dataset.physicalFallback=String(idx+1);img.dataset.cardBase=direct[idx];img.dataset.fallbackStep='0';img.parentElement?.classList.remove('broken');img.parentElement?.classList.add('loading-art');img.src=direct[idx];return;}
  }
  if(!ptcg&&cardId&&img.dataset.altTried!=='1'){
    img.dataset.altTried='1';
    if(live&&(live.source||preparedPack?.source||'tcg')!=='tcgp'){
      let alt=await pokemonTcgArtworkBaseV5(live,preparedPack?.set||live?.set||null);
      if(!alt)alt=await scrydexArtworkBaseV164(live,preparedPack?.set||live?.set||null);
      if(alt&&normalizeCardBase(alt)!==base){
        live.image=alt;if(state.cards[cardId]){state.cards[cardId].image=alt;try{localStorage.setItem('luckyDexSave',JSON.stringify(state));}catch(e){}}
        img.dataset.cardBase=alt;img.dataset.fallbackStep='0';img.parentElement?.classList.remove('broken');img.parentElement?.classList.add('loading-art');img.src=cardImage(alt,'high','png');return;
      }
    }
  }
  img.parentElement?.classList.remove('loading-art');img.parentElement?.classList.add('broken');
}
window.cardImageFallback=cardImageFallback;

async function getCardDetail(brief,signal=null){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(cardDetailCache.has(brief.id))return cardDetailCache.get(brief.id);
  if(brief?._libraryNative||brief?._pocketNative){const card={...brief};cardDetailCache.set(brief.id,card);return card;}
  let card;
  try{
    const detail=signal?(packCacheV13.cards[brief.id]||await packFetch(API.card(brief.id),signal)):await fetchJson(API.card(brief.id));
    card={...brief,...detail,image:detail.image||brief.image||''};
  }catch(e){if(signal?.aborted)throw e;card={...brief,rarity:brief.rarity||'Unknown'};}
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  cardDetailCache.set(brief.id,card);
  return card;
}

async function resolveCardArtwork(card,set=null,source=card?.source||'tcg',signal=null){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(!card)return '';
  const identityV0533=window.LuckyDexCardArtIdentityV0533;
  if(card.image&&identityV0533?.isTrusted?.(card,card.image))return normalizeCardBase(card.image);
  if(card.image&&identityV0533&&!identityV0533.isTrusted(card,card.image)){
    card.image='';
    for(const key of ['_resolvedArtworkUrl','_artSource','_artIdentityVerified','_ptcgId','_ptcgNumber','_ptcgImageLarge','_ptcgImageSmall','_scrydexId','_scrydexImageLarge','_scrydexImageSmall','_limitlessSetCode','_limitlessNumber','_tcgdexImage'])delete card[key];
  }
  if(source==='tcgp'&&!card._pocketExactRemote&&window.LuckyDexPocket?.resolveCard){
    try{
      const exact=await LuckyDexPocket.resolveCard(card,signal);
      if(exact?.image){Object.assign(card,exact);card._pocketExactRemote=true;card._artIdentityVerified=true;return normalizeCardBase(exact.image);}
    }catch(e){if(signal?.aborted)throw e;}
  }
  if(source!=='tcgp'&&window.LuckyDexCardArt){
    try{
      const local=await LuckyDexCardArt.resolveLocal(card,set);
      if(local){card.image=local;card._artIdentityVerified=true;card._artSource='luckydex-library-v1';return local;}
    }catch(e){if(signal?.aborted)throw e;}
  }
  if(source!=='tcgp'){
    const bundled=bundledPtcgArtworkRecordV152(card,set);
    if(bundled?.images){const art=bundled.images.large||bundled.images.small||'';if(art){card.image=art;card._artIdentityVerified=true;card._artSource='bundled-identity';if((!card.rarity||/^(?:none|unknown)$/i.test(String(card.rarity)))&&bundled.rarity)card.rarity=bundled.rarity;return art;}}
  }
  if(card.image&&(!identityV0533||identityV0533.isTrusted(card,card.image)))return normalizeCardBase(card.image);
  try{
    const detail=await getCardDetail(card,signal);
    if(detail.image){card.image=normalizeCardBase(detail.image);card._artIdentityVerified=true;card._artSource='tcgdex';return card.image;}
  }catch(e){if(signal?.aborted)throw e;}
  if(source!=='tcgp'){
    const ptcg=await pokemonTcgArtworkBaseV5(card,set,signal);if(ptcg){card.image=ptcg;card._artSource='PokemonTCG';return ptcg;}
    const scrydex=await scrydexArtworkBaseV164(card,set,signal);if(scrydex){card.image=scrydex;return scrydex;}
  }
  let setDetail=set;
  const setId=card.set?.id||card.setId||set?.id;
  if(!setDetail?.serie?.id&&setId){try{setDetail=signal?await packFetch(API.tcgSet(setId),signal):await fetchJson(API.tcgSet(setId));}catch(e){if(signal?.aborted)throw e;}}
  const derived=deriveCardBase(card,setDetail);if(derived)card.image=derived;return derived;
}
async function repairOwnedCardImages(limit=40){
  const missing=Object.values(state.cards).filter(c=>!c.image||((c.source||'tcg')==='tcgp'&&!c._pocketExactRemote)).slice(0,limit);
  if(!missing.length)return;
  for(let i=0;i<missing.length;i+=4){
    const chunk=missing.slice(i,i+4);
    await Promise.allSettled(chunk.map(async c=>{const base=await resolveCardArtwork(c);if(base)c.image=base;}));
  }
  save();if(collectionMode==='cards')renderCollection();
}

/* startup / title */
function renderTitlePartners(){
  const row=document.getElementById('titlePartners');if(!row)return;
  const team=state.team.map(k=>state.pokemon[k]).filter(Boolean).slice(0,3);
  const use=team.length?team:[{id:1},{id:25},{id:4}];
  row.innerHTML=use.map(p=>`<img src="${API.sprite(p.id,!!p.shiny)}" alt="">`).join('');
  const rank=document.getElementById('titleRankText');if(rank)rank.textContent=`TRAINER RANK ${currentRank()}`;
}
// Shared callers refresh the single Adventure owner.
function renderAdventurePartyMini(){window.LuckyDexAdventure?.refresh?.();}
function renderZones(){window.LuckyDexAdventure?.refresh?.();}
function updateSearchCard(){window.LuckyDexAdventure?.refresh?.();}
function renderStarter(){
  const panel=document.getElementById('starterPanel');if(!panel)return;
  if(Object.keys(state.pokemon).length||!window.luckyTitleDismissed){panel.hidden=true;return;}
  panel.hidden=false;
  const starters=[{id:1,name:'Bulbasaur'},{id:4,name:'Charmander'},{id:7,name:'Squirtle'},{id:25,name:'Pikachu'}];
  document.getElementById('starterChoices').innerHTML=starters.map(s=>`<button class="starter-choice" data-starter="${s.id}"><img src="${API.sprite(s.id)}"><b>${s.name}</b></button>`).join('');
  document.querySelectorAll('[data-starter]').forEach(b=>b.onclick=()=>chooseStarter(Number(b.dataset.starter)));
}
function renderGlobalHud(){
  const rank=currentRank();
  ['trainerRankMini','trainerRank'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=rank;});
  const binds={coinMini:state.profile.coins,ticketMini:state.profile.tickets,arcadeCoinCount:state.profile.coins,packCoinCount:state.profile.coins,packTicketCount:state.profile.tickets,packDustCount:state.profile.dust,
    pokeballCount:state.inventory.pokeball,greatballCount:state.inventory.greatball,ultraballCount:state.inventory.ultraball,berryCount:state.inventory.berry,battleBerryCount:`×${state.inventory.berry}`};
  Object.entries(binds).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=fmt(v);});
  renderTitlePartners();renderAdventurePartyMini();updatePackButton();renderDaily();
}
function showAdventureHub(){window.LuckyDexAdventure?.enter?.();}
function navigate(page){
  // Navigation must remain available even if one feature's enter/leave hook fails.
  // A game-specific runtime error should never strand the user on the current tab.
  const safe=(label,fn)=>{try{return fn?.();}catch(error){console.error(`[LuckyDex] navigation hook failed (${label})`,error);return undefined;}};
  const activePage=document.querySelector('.page.active')?.dataset.page;
  if(page!=='adventure'&&activePage==='adventure')safe('adventure leave',()=>window.LuckyDexAdventure?.leave?.());
  if(page!=='packs'&&document.body.classList.contains('pack-opening'))safe('pack close',()=>closePackOpening(true));
  if(page!=='arcade')safe('arcade leave',()=>window.LuckyDexArcadeWorld?.leave?.());
  if(page!=='trade')safe('trade leave',()=>window.LuckyDexTrade?.leave?.());
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
  document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===page));
  if(page==='adventure')safe('adventure enter',()=>showAdventureHub());
  if(page==='collection')safe('collection render',()=>{rebuildCollectionControls();renderTeamPanel();renderCollection();});
  if(page==='arcade')safe('arcade enter',()=>window.LuckyDexArcadeWorld?.openWorld?.());
  if(page==='trade')safe('trade enter',()=>window.LuckyDexTrade?.enter?.());
  if(page==='packs')safe('packs render',()=>{closePackOpening(true);loadSets(document.getElementById('cardSource').value);updatePackButton();updatePackFormatV5();});
  if(page==='profile')safe('profile render',()=>renderProfile());
}
/* Arcade result overlay */
/* physical packs: 10 cards / 4 common / 3 uncommon / 3 foil slots */
async function pickCardForSlotV5(briefs,targetTier,used,variant=null,signal=null,set=null,source='tcg'){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  const pool=briefs.filter(c=>!used.has(c.id));if(!pool.length)return getCardDetail(briefs[Math.floor(Math.random()*briefs.length)],signal);
  const attempts=Math.min(pool.length,targetTier>=4?30:20);let best=null,bestScore=1e9;const tried=new Set();
  for(let i=0;i<attempts;i++){
    let brief;do{brief=pool[Math.floor(Math.random()*pool.length)];}while(tried.has(brief.id)&&tried.size<pool.length);tried.add(brief.id);
    let card=await getCardDetail(brief,signal);if(source==='tcg'&&!card?._libraryNative)card=await enrichPhysicalCardV151(card,set,signal);const tier=rarityTier(card.rarity);let score=Math.abs(tier-targetTier)*10;
    if(variant==='reverse'&&card.variants&&!card.variants.reverse)score+=6;
    if(variant==='holo'&&card.variants&&!(card.variants.holo||tier>=2))score+=4;
    if(score<bestScore){best=card;bestScore=score;}if(score===0)break;
  }
  if(best)return best;let fallback=await getCardDetail(pool[0],signal);if(source==='tcg'&&!fallback?._libraryNative)fallback=await enrichPhysicalCardV151(fallback,set,signal);return fallback;
}
function physicalPackSizeV250(set){return window.LuckyDexPackPolicy?.packSizeFor?.(set,'tcg')||window.LuckyDexPack?.physicalPackSizeFor?.(set)||10;}
function physicalPackSlotsV250(set,luckyPack=false){
  // Legacy compatibility helper. v0.34.3 physical pack construction consumes
  // LuckyDexPackPolicy.slotPlan() descriptors directly.
  return (window.LuckyDexPackPolicy?.slotPlan?.(set,{source:'tcg',luckyPack})||[]).map(row=>[Math.max(0,Number(window.LuckyDexCardRarity?.tier?.({rarity:row.allowedClasses?.[0]})||0)),row.finish]);
}
function normalizeSetNameV0343(value){return String(value||'').toLowerCase().replace(/[‐‑‒–—]/g,'-').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}
function findSetByNameV0343(name,source='tcg'){
  const wanted=normalizeSetNameV0343(name);return (setCache[source]||[]).find(row=>normalizeSetNameV0343(row?.name)===wanted)||null;
}
function findSetByLibraryKeysV03515(keys,source='tcg'){
  const wanted=new Set((Array.isArray(keys)?keys:[]).map(value=>String(value||'').replace(/^library:/i,'').trim().toLowerCase()).filter(Boolean));
  if(!wanted.size)return null;
  return (setCache[source]||[]).find(row=>{
    const candidates=[row?._libraryKey,row?._libraryCode,row?.id].map(value=>String(value||'').replace(/^library:/i,'').trim().toLowerCase()).filter(Boolean);
    return candidates.some(value=>wanted.has(value));
  })||null;
}
async function hydrateSetForDescriptorV0343(stub,signal=null,{offline=false}={}){
  if(!stub)return null;if(stub.cards?.length)return stub;
  if(stub._libraryKey&&window.LuckyDexCardArt?.prepareSet){try{return await LuckyDexCardArt.prepareSet(stub,signal);}catch(error){if(signal?.aborted)throw error;}}
  const cached=cachedSetV13(stub.id,'tcg');if(cached?.cards?.length)return cached;
  const cachedCards=cachedCardsForSetV13(stub.id);if(cachedCards.length)return {...stub,cards:cachedCards};
  if(!offline&&isOnlineV13()){try{return await packFetch(API.tcgSet(stub.id),signal,5000);}catch(error){if(signal?.aborted)throw error;}}
  return stub;
}
async function descriptorPoolV0343(set,source,descriptor,signal=null,{offline=false}={}){
  let effective=descriptor;
  if(source==='tcg'&&descriptor?.replacements?.length){
    for(const replacement of descriptor.replacements){
      const chance=Math.max(0,Math.min(1,Number(replacement?.weight)||0));
      if(Math.random()>=chance)continue;
      if(replacement?.pool==='inline-subset'){
        effective={...descriptor,...replacement,pool:'inline-subset',requiredNumberPrefixes:replacement.requiredNumberPrefixes||[],excludeNumberPrefixes:replacement.excludeNumberPrefixes||[]};break;
      }
      if(replacement?.pool==='subset-key'){
        effective={...descriptor,...replacement,pool:'subset-key',subsetKeys:replacement.subsetKeys||[]};break;
      }
      if(replacement?.pool==='subset'){
        effective={...descriptor,...replacement,pool:'subset',subsetName:replacement.subsetName||descriptor.subsetName};break;
      }
    }
  }
  let poolSet=set,pool=[];
  const special=window.LuckyDexPackPolicy?.specialPoolCards?.(set,effective)||[];
  if(special.length){
    pool=special;poolSet={id:special[0]?.setId||set?.id,name:special[0]?.setName||set?.name,releaseDate:special[0]?.setRelease||set?.releaseDate,cards:special};
  }else if(effective?.pool==='subset-key'){
    const stub=findSetByLibraryKeysV03515(effective.subsetKeys,'tcg');
    poolSet=await hydrateSetForDescriptorV0343(stub,signal,{offline});pool=poolSet?.cards||[];
  }else if(effective?.pool==='subset'){
    const stub=findSetByNameV0343(effective.subsetName,'tcg');poolSet=await hydrateSetForDescriptorV0343(stub,signal,{offline});pool=poolSet?.cards||[];
  }else{
    pool=set?.cards||[];
    if(!pool.length&&offline)pool=cachedCardsForSetV13(set?.id);
    if(effective?.pool==='energy'){
      const energy=pool.filter(card=>/\benergy\b/i.test(String(card?.supertype||card?.category||card?.name||'')));if(energy.length)pool=energy;
    }
  }
  if(source==='tcg')pool=pool.filter(card=>window.LuckyDexCardAcquisition?.boosterEligible?.(card,poolSet||set)!==false);
  // External subset rows are fail-closed. If their audited catalogue key cannot
  // be hydrated, never substitute ordinary cards from the parent booster.
  if(!pool.length&&!['core','inline-subset','subset-key'].includes(String(effective?.pool||''))){
    pool=(set?.cards?.length?set.cards:(offline?cachedCardsForSetV13(set?.id):[])).filter(card=>source!=='tcg'||window.LuckyDexCardAcquisition?.boosterEligible?.(card,set)!==false);poolSet=set;
  }
  return {descriptor:effective,pool,poolSet:poolSet||set};
}
function finishLabelV0343(descriptor,card){
  if(descriptor?.finish==='reverse-holo')return 'Reverse Holo';
  if(descriptor?.finish==='reverse-or-holo')return /holo/i.test(String(card?.rarity||card?.printedRarity||''))?'Foil':'Reverse Holo';
  if(descriptor?.finish==='holo')return 'Foil';
  return String(card?._foil||'');
}
function parallelSignatureV0343(card,foil=''){return `${String(card?.id||'')}|${String(foil||'normal').toLowerCase()}`;}
function canUseDescriptorCardV0343(card,descriptor,chosen,foil){
  if(!card)return false;const id=String(card.id||'');if(!id)return true;
  const same=(chosen||[]).filter(row=>String(row?.id||'')===id);if(!same.length)return true;
  if(!descriptor?.allowParallelRepeat)return false;
  const sig=parallelSignatureV0343(card,foil);return !same.some(row=>parallelSignatureV0343(row,row?._foil||'')===sig);
}
async function pickCardForDescriptorV0343(briefs,descriptor,chosen=[],signal=null,set=null,source='tcg'){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(!Array.isArray(briefs)||!briefs.length)throw new Error(`No eligible cards for ${descriptor?.id||'slot'}`);
  const target=window.LuckyDexPackPolicy?.targetClassesFor?.(set,descriptor,source,Math.random)||descriptor?.allowedClasses||[];
  const targetPlan=source==='tcg'&&window.LuckyDexPackPolicy?.refinePhysicalTargetPlan?window.LuckyDexPackPolicy.refinePhysicalTargetPlan(set,descriptor,briefs,target,window.LuckyDexCardRarity?.classify,Math.random):{targets:target,secretMode:'any'};
  const allowed=new Set(descriptor?.rarePackAllowedClasses||descriptor?.allowedClasses||[]),targets=new Set(targetPlan?.targets||target||[]);
  const policyMatch=card=>{const result=window.LuckyDexPackPolicy?.cardMatchesDescriptor?.(card,descriptor,set,source,window.LuckyDexCardRarity?.classify);return result===undefined?true:result;};
  const cardClass=card=>window.LuckyDexCardRarity?.classify?.(card,set)||{rarityClass:'unknown',tier:rarityTier(card?.rarity)};
  const targetMatch=card=>window.LuckyDexPackPolicy?.targetPlanMatches?window.LuckyDexPackPolicy.targetPlanMatches(card,targetPlan,set,window.LuckyDexCardRarity?.classify):targets.has(cardClass(card).rarityClass);
  const hardMatch=card=>{if(!policyMatch(card))return false;const c=cardClass(card);if(allowed.size&&!allowed.has(c.rarityClass))return false;if(descriptor?.rareOrHigher&&Number(c.tier)<2)return false;return true;};
  const rank=brief=>{let score=hardMatch(brief)?0:1000;if(targets.size&&!targetMatch(brief))score+=30;return score;};
  const ordered=[...briefs].sort((a,b)=>rank(a)-rank(b)||Math.random()-.5);
  for(const brief of ordered.slice(0,Math.min(ordered.length,80))){
    let card=await getCardDetail(brief,signal);if(source==='tcg'&&!card?._libraryNative)card=await enrichPhysicalCardV151(card,set,signal);
    const foil=finishLabelV0343(descriptor,card);if(!canUseDescriptorCardV0343(card,descriptor,chosen,foil)||!hardMatch(card))continue;
    if(!targets.size||targetMatch(card)){card._foil=foil;return card;}
  }
  for(const brief of ordered){
    let card=await getCardDetail(brief,signal);if(source==='tcg'&&!card?._libraryNative)card=await enrichPhysicalCardV151(card,set,signal);const foil=finishLabelV0343(descriptor,card);
    if(canUseDescriptorCardV0343(card,descriptor,chosen,foil)&&hardMatch(card)){card._foil=foil;return card;}
  }
  throw new Error(`No card matches ${descriptor?.id||'slot'} collation`);
}
async function buildGodPackV0291(set,source,signal=null,sourceBriefs=null){
  const all=sourceBriefs||set.cards||[],briefs=source==='tcg'?all.filter(card=>window.LuckyDexCardAcquisition?.boosterEligible?.(card,set)!==false):all;
  if(!briefs.length)throw new Error('No booster-eligible cards');
  const count=source==='tcgp'?(window.LuckyDexPocket?.packSize(set)||5):(window.LuckyDexPackPolicy?.packSizeFor?.(set,'tcg')||physicalPackSizeV250(set));
  const policy=window.LuckyDexGodPack;if(!policy?.targetPlan||!policy?.highPoolTiers)throw new Error('God Pack policy unavailable');
  const highTiers=new Set(policy.highPoolTiers(briefs,rarityTier)),godPool=briefs.filter(card=>highTiers.has(rarityTier(card)));
  const plan=policy.targetPlan(godPool,count,rarityTier),cards=[],used=new Set();
  for(const target of plan){
    let available=godPool.filter(card=>!used.has(card.id));if(!available.length)available=godPool;
    let distance=Infinity,candidates=[];
    for(const brief of available){const tier=rarityTier(brief),score=Math.abs(tier-target);if(score<distance){distance=score;candidates=[brief];}else if(score===distance)candidates.push(brief);}
    candidates.sort((a,b)=>rarityTier(b)-rarityTier(a));const bestTier=rarityTier(candidates[0]),best=candidates.filter(card=>rarityTier(card)===bestTier);const brief=best[Math.floor(Math.random()*best.length)];
    let card=await getCardDetail(brief,signal);if(source==='tcg'&&!card?._libraryNative)card=await enrichPhysicalCardV151(card,set,signal);
    if(source==='tcgp')card.image=deriveCardBase(card,set)||card.image;else if(card.image)card.image=normalizeCardBase(card.image);
    card._foil='';cards.push(card);used.add(brief.id);
  }
  return cards;
}
function assertPackContractV03515(cards,set,source,slots){
  const audit=window.LuckyDexPackPolicy?.validatePack?.(cards,set,source,{slots,classifier:window.LuckyDexCardRarity?.classify});
  if(audit&&!audit.ok)throw new Error(`Invalid pack collation: ${audit.errors.join('; ')}`);
  return cards;
}
async function applyPokemonGoHiddenDittoV04030(cards,set,source,signal,slots){
  const helper=window.LuckyDexPokemonGoDitto;if(source!=='tcg'||!helper?.isPokemonGoSet?.(set)||!helper?.planHiddenDitto)return cards;
  const plan=helper.planHiddenDitto(set,slots,Math.random);if(!plan)return cards;
  const dittoBrief=(set?.cards||[]).find(card=>helper.isDittoCard?.(card));if(!dittoBrief||!plan.cover)return cards;
  try{
    let [cover,ditto]=await Promise.all([getCardDetail(plan.cover,signal),getCardDetail(dittoBrief,signal)]);
    if(source==='tcg'&&!cover?._libraryNative)cover=await enrichPhysicalCardV151(cover,set,signal);
    if(source==='tcg'&&!ditto?._libraryNative)ditto=await enrichPhysicalCardV151(ditto,set,signal);
    if(cover?.image)cover.image=normalizeCardBase(cover.image);if(ditto?.image)ditto.image=normalizeCardBase(ditto.image);
    cover={...cover,_foil:'Reverse Holo'};cards[plan.index]=helper.wrapHiddenDitto(cover,{...ditto});
  }catch(error){console.warn('[LuckyDex] hidden Pokemon GO Ditto unavailable; keeping normal reverse card',error);}
  return cards;
}
async function buildBalancedPack(set,source,luckyPack=false,signal=null,godPack=false){
  const allBriefs=set.cards||[],briefs=source==='tcg'?allBriefs.filter(card=>window.LuckyDexCardAcquisition?.boosterEligible?.(card,set)!==false):allBriefs;if(!briefs.length)throw new Error('No booster-eligible cards');if(godPack)return buildGodPackV0291(set,source,signal,briefs);const cards=[];
  const slots=window.LuckyDexPackPolicy?.slotPlan?.(set,{source,luckyPack})||[];
  if(!slots.length)throw new Error(`No ${source} pack policy for set`);
  for(const descriptor of slots){
    const resolved=await descriptorPoolV0343(set,source,descriptor,signal,{offline:false});if(!resolved.pool.length)throw new Error(`No cards for ${descriptor.id}`);
    const c=await pickCardForDescriptorV0343(resolved.pool,resolved.descriptor,cards,signal,resolved.poolSet,source);
    if(source==='tcgp'){c.image=deriveCardBase(c,set)||c.image;c._foil='';}else if(c.image)c.image=normalizeCardBase(c.image);
    cards.push(c);
  }
  return assertPackContractV03515(cards,set,source,slots);
}
function updatePackFormatV5(){
  const source=document.getElementById('cardSource')?.value||'tcg',physical=source==='tcg',setId=document.getElementById('setSelect')?.value||'',set=setCache[source]?.find(s=>s.id===setId)||cachedSetV13(setId,source),pocketSize=window.LuckyDexPocket?.packSize(set||setId)||5;
  const t=document.getElementById('packFormatTitle'),c=document.getElementById('packFormatCopy'),b=document.getElementById('packCountBadge');
  const profile=physical?window.LuckyDexPackPolicy?.resolve?.(set,'tcg'):null,physicalSize=physical?(profile?.cardCount||physicalPackSizeV250(set)):0,fixedHalfDeck=physical&&profile?.productKind==='half-deck';
  if(t)t.textContent=physical?(fixedHalfDeck?'30-card Half Deck':`${physicalSize}-card booster`):pocketSize===4?'4-card Deluxe Pocket pack':'5-card Pocket pack';
  if(c)c.textContent=physical?(fixedHalfDeck?`Fixed preconstructed deck · ${fmt(profile?.price||600)} Lucky Coins`:`${physicalSize} collectible cards · ${fmt(profile?.price||600)} Lucky Coins`):pocketSize===4?'Deluxe format · position-specific rarity':'Pocket-style position-specific rarity';
  if(b)b.textContent=physical?String(physicalSize):String(pocketSize);
}
function updatePackButton(){
  const btn=document.getElementById('openPackBtn');if(!btn)return;const e=packEntitlement();btn.textContent=e.label;btn.disabled=e.mode==='coins'&&state.profile.coins<e.cost;
  const source=document.getElementById('cardSource')?.value||'tcg',setId=document.getElementById('setSelect')?.value||'',set=setCache[source]?.find(row=>String(row?.id)===String(setId))||cachedSetV13(setId,source)||null,ten=document.getElementById('openTenPackBtn');
  if(ten){const cost=pocketTenPackCost(set);ten.hidden=source!=='tcgp';ten.textContent=`OPEN 10 · ${fmt(cost)} COINS`;ten.disabled=source!=='tcgp'||Number(state.profile.coins||0)<cost;}
  const daily=document.getElementById('dailyPackPill');if(daily)daily.textContent=state.profile.lastDailyPack!==todayKey()?'Daily ready':'Daily claimed';
  const copy=document.getElementById('packPriceCopy');if(copy)copy.textContent=e.mode==='daily'?'Your first pack today is free.':e.mode==='ticket'?'A Pack Ticket will be used.':`${fmt(e.cost)} Lucky Coins`;
  const dust=document.getElementById('dustTicketExchangeBtn');if(dust)dust.disabled=state.profile.dust<100;updatePackFormatV5();
}

function packOpeningInstructionV03514(pack=preparedPack){
  const profile=pack?window.LuckyDexPackPolicy?.resolve?.(pack.set,pack.source):null,batchCount=Math.max(1,Number(pack?.packCount)||1);
  if(batchCount>1)return `Swipe across the stack to open all ${batchCount} packs · ${pack?.cards?.length||0} cards`;
  return profile?.productKind==='half-deck'?`Swipe across the deck seal to open · ${pack?.cards?.length||30} cards`:`Swipe across the pack to rip it open · ${pack?.cards?.length||0} cards`;
}
function applyPackTearPlanV0268(sealed,plan){
  if(!sealed||!plan)return;
  const path=sealed.querySelector('#packTearPath');if(path)path.setAttribute('d',plan.svgPath||'');
  const bottom=sealed.querySelector('.pack-rip-bottom'),top=sealed.querySelector('.pack-rip-top');
  if(bottom)bottom.style.clipPath=plan.bottomClip;if(top)top.style.clipPath=plan.topClip;
}
function wirePackTearGestureV0268(sealed){
  if(!sealed||!window.LuckyDexPack?.planTearGesture)return;
  let start=null,pointerId=null;const path=sealed.querySelector('#packTearPath'),instruction=document.querySelector('.pack-instruction');
  const reset=()=>{start=null;pointerId=null;sealed.classList.remove('tracking-tear');if(path)path.setAttribute('d','M 8 10 L 92 10');};
  sealed.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;pointerId=e.pointerId;start={x:e.clientX,y:e.clientY};sealed.setPointerCapture?.(pointerId);sealed.classList.add('tracking-tear');e.preventDefault();});
  sealed.addEventListener('pointermove',e=>{if(!start||e.pointerId!==pointerId)return;const plan=window.LuckyDexPack.planTearGesture(start,{x:e.clientX,y:e.clientY},sealed.getBoundingClientRect());if(path)path.setAttribute('d',plan.svgPath);e.preventDefault();});
  sealed.addEventListener('pointerup',e=>{if(!start||e.pointerId!==pointerId)return;const plan=window.LuckyDexPack.planTearGesture(start,{x:e.clientX,y:e.clientY},sealed.getBoundingClientRect());sealed.releasePointerCapture?.(pointerId);start=null;pointerId=null;if(!plan.valid){reset();if(instruction)instruction.textContent=packOpeningInstructionV03514();return;}applyPackTearPlanV0268(sealed,plan);sealed.classList.remove('tracking-tear');tearPack(plan);e.preventDefault();});
  sealed.addEventListener('pointercancel',reset);
  sealed.addEventListener('click',e=>{if(e.detail!==0)return;const r=sealed.getBoundingClientRect(),plan=window.LuckyDexPack.planTearGesture({x:r.left+r.width*.08,y:r.top+r.height*.10},{x:r.left+r.width*.92,y:r.top+r.height*.10},r);applyPackTearPlanV0268(sealed,plan);tearPack(plan);});
}
async function renderSealedPack(){
  const {set,source,cards}=preparedPack;
  const profile=window.LuckyDexPackPolicy?.resolve?.(set,source),fixedHalfDeck=profile?.productKind==='half-deck';
  const legacy=(set.boosters||[]).map(b=>b?.artwork_front).filter(Boolean);
  // Pocket's exact pack artwork is carried by the GitHub Pocket index. The
  // physical local-asset resolver is intentionally never asked to guess a
  // Pocket set with a coincidentally similar set code.
  const realArt=fixedHalfDeck?'':source==='tcgp'?(legacy[0]||''):(set._boosterArt||await window.LuckyDexBoosterArt?.resolve?.(set)||legacy[0]||'');
  const fallbackArt=source==='tcg'&&!fixedHalfDeck?(window.LuckyDexBoosterArt?.runtimeFallback?.(set)||''):'';
  const logo=isOnlineV13()&&set.logo?`<img class="pack-logo" src="${assetFlexible(set.logo)}" alt="">`:'';
  const artUrl=realArt?assetFlexible(realArt):'';
  const fallbackArtUrl=fallbackArt&&fallbackArt!==realArt?assetFlexible(fallbackArt):'';
  const batchCount=Math.max(1,Number(preparedPack?.packCount)||1),productCountLabel=batchCount>1?`${batchCount} packs · ${cards.length} cards`:fixedHalfDeck?'30-card Half Deck':`${cards.length} cards`;
  const inner=artUrl?`<img class="booster-art" src="${artUrl}" alt="${escapeHtml(set.name)} booster">`:`${logo}<div class="pack-title"><small>${source==='tcgp'?'TCG POCKET':'POKÉMON TCG'}</small><b>${escapeHtml(set.name)}</b><span>${productCountLabel}</span></div>`;
  const topInner=artUrl?`<img class="booster-art" src="${artUrl}" alt="">`:inner;
  const pocketRare=source==='tcgp'&&preparedPack?.luckyPack&&!preparedPack?.godPack;
  const godClass=preparedPack?.godPack?' god-pack-sealed':pocketRare?' rare-pack-sealed':'';
  const productClass=fixedHalfDeck?' fixed-product half-deck-product':` pointy-pack${batchCount>1?' batch-pack-stack':''}`;
  const artClass=artUrl?'real-pack has-pack-art':'generic-pack';
  const productNoun=fixedHalfDeck?'half deck':batchCount>1?`${batchCount}-pack stack`:'pack';
  const packHtml=`<button class="sealed-pack${productClass} ${artClass}${godClass}" id="sealedPack" aria-label="Swipe across ${escapeHtml(set.name)} ${productNoun} to open"><div class="pack-crimp pack-crimp-top"></div><div class="pack-crimp pack-crimp-bottom"></div><div class="pack-foil"></div><div class="pack-shell-shine"></div>${batchCount>1?`<span class="pack-batch-badge">×${batchCount}</span>`:''}<div class="pack-art-shell pack-rip-bottom">${inner}</div><div class="pack-art-shell pack-rip-top" aria-hidden="true">${topInner}</div><svg class="pack-tear-guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path id="packTearPath" d="M 8 10 L 92 10"></path></svg></button>`;
  const stage=document.getElementById('packStage');stage.classList.toggle('god-pack-omen',!!preparedPack?.godPack);stage.classList.remove('god-pack-active');stage.classList.toggle('rare-pack-active',pocketRare);stage.innerHTML=`<button class="pack-exit" id="packExitBtn">${preparedPack?.sealedRewardSetId?'‹ BACK':'‹ SHOP'}</button><div class="pack-instruction">${packOpeningInstructionV03514(preparedPack)}</div>${packHtml}`;
  if(fallbackArtUrl)stage.querySelectorAll('.booster-art').forEach(img=>{img.onerror=()=>{img.onerror=null;img.src=fallbackArtUrl;};});
  document.getElementById('packExitBtn').onclick=()=>closePackOpening();wirePackTearGestureV0268(document.getElementById('sealedPack'));
}


async function openCardModal(card){
  if(!card)return;
  const stored=state.cards[card.id]||card,identityV0533=window.LuckyDexCardArtIdentityV0533,merged={...stored,...card};
  const candidates=[card.image,stored.image].filter(Boolean);let base=candidates.find(value=>!identityV0533||identityV0533.isTrusted(merged,value))||'';
  if(!base){
    merged.image='';base=await resolveCardArtwork(merged,null,merged.source||'tcg');
    if(state.cards[card.id]){
      state.cards[card.id].image=base||'';
      for(const key of ['_artIdentityVerified','_artSource','_ptcgId','_ptcgNumber','_ptcgImageLarge','_ptcgImageSmall','_scrydexId','_scrydexImageLarge','_scrydexImageSmall']){if(merged[key]!=null)state.cards[card.id][key]=merged[key];else delete state.cards[card.id][key];}
      save();
    }
  }
  const live={...stored,...card,...merged,image:base||''},img=document.getElementById('cardDialogImage');img.onerror=null;img.removeAttribute('src');img.parentElement.classList.toggle('broken',!base);img.dataset.cardBase=normalizeCardBase(base);img.dataset.cardId=live.id||'';img.dataset.fallbackStep='0';img.dataset.altTried='0';img.dataset.pocketFallback='0';img.dataset.physicalFallback='0';img._luckyCard=live;if(base)img.src=cardImage(base,'high','webp');img.onerror=()=>cardImageFallback(img);
  document.getElementById('cardDialogName').textContent=live.name||'Card';document.getElementById('cardDialogMeta').textContent=[cardDisplayRarityV03515(live),humanCardText(cardSetName(live),'Unknown set')].filter(Boolean).join(' · ');
  const badges=[];if(stored.count)badges.push(`Owned ×${stored.count}`);if(live.localId)badges.push(`#${live.localId}`);if(live._foil)badges.push(live._foil);const classified=cardClassify(live);const t=classified.tier;if(t>=3)badges.push(cardRarityLabel(live));document.getElementById('cardDialogBadges').innerHTML=badges.map(x=>`<span>${escapeHtml(x)}</span>`).join('');document.getElementById('cardDialog').showModal();
}

/* Back handling + startup wiring */
window.handleLuckyBack=function(){
  const openDialog=document.querySelector('dialog[open]');if(openDialog){openDialog.close();return true;}
  if(document.body.classList.contains('pack-opening')){closePackOpening();return true;}
  if(document.body.classList.contains('arcade-open')){window.LuckyDexArcadeWorld?.backFromGame(true);return true;}
  const starter=document.getElementById('starterPanel');if(starter&&!starter.hidden){starter.hidden=true;document.getElementById('titleScreen').classList.remove('hidden-title');window.luckyTitleDismissed=false;return true;}
  if(document.querySelector('.page.active')?.dataset.page==='adventure'&&window.LuckyDexAdventure?.handleBack?.())return true;
  return false;
};

function wireV5(){
  const title=document.getElementById('titleScreen');renderTitlePartners();
  document.getElementById('titleContinueBtn').onclick=()=>{window.luckyTitleDismissed=true;title.classList.add('hidden-title');renderStarter();showAdventureHub();};
  document.getElementById('starterBackBtn').onclick=()=>{document.getElementById('starterPanel').hidden=true;window.luckyTitleDismissed=false;title.classList.remove('hidden-title');};
  document.getElementById('cardSource').onchange=e=>{closePackOpening(true);loadSets(e.target.value);updatePackButton();updatePackFormatV5();};
  updatePackFormatV5();showAdventureHub();renderTitlePartners();setTimeout(()=>repairOwnedCardImages(60),1800);
}


/* === v0.6.2 patch: chronology + rare-card drama === */
const __origCommitPreparedPackV62 = commitPreparedPack;
commitPreparedPack = function(){
  if(!preparedPack||preparedPack.committed||preparedPack.debug)return false;
  const openedSetMeta={source:preparedPack.source,setId:preparedPack.set?.id,setName:preparedPack.set?.name};
  const committed=__origCommitPreparedPackV62();if(!committed)return false;
  try{window.LuckyDexPackBrowser?.recordOpen?.(preparedPack.set,preparedPack.source,Date.now(),Math.max(1,Number(preparedPack.packCount)||1));}catch(_){}
  try{Promise.resolve(window.LuckyDexTrade?.noteOpenedSet?.(openedSetMeta)).catch(()=>{});}catch(_){}
  try{
    if(preparedPack?.cards?.length){
      const rel = preparedPack.set?.releaseDate || '';
      preparedPack.cards.forEach(c=>{ if(state.cards[c.id]) state.cards[c.id].setRelease = rel; });
      save();
    }
  }catch(e){}
  return true;
};

const __origCommitPreparedPackV0413 = commitPreparedPack;
commitPreparedPack=function(){
  const committed=__origCommitPreparedPackV0413();if(!committed)return false;
  if(!preparedPack?.telemetryV0413GodNoNew){const godGroups=preparedPack?.packGroups?.length?preparedPack.packGroups.filter(group=>group.godPack):preparedPack?.godPack?[{cards:preparedPack.cards||[]}]:[];const emptyNewGod=godGroups.find(group=>(group.cards||[]).length&&(group.cards||[]).every(c=>!c._wasNew));if(emptyNewGod){preparedPack.telemetryV0413GodNoNew=true;window.LuckyDexAchievementTelemetryV0413?.record?.(state,'pack:god-no-new',{setId:preparedPack.set?.id||'',count:emptyNewGod.cards.length});save();}}
  return true;
};


rebuildCollectionControls = function(){
  const filter=document.getElementById('collectionFilter'),group=document.getElementById('collectionGroupFilter'),oldFilter=filter.value,oldGroup=group.value;
  if(collectionMode==='pokemon'){
    filter.innerHTML='<option value="all">All caught</option><option value="shiny">Shiny only</option><option value="team">Adventure team</option><option value="duplicates">Duplicates</option>';
    const ids=new Set(Object.values(state.pokemon).map(x=>x.id)),ownedGens=GENERATIONS.filter(g=>[...ids].some(id=>id>=g.min&&id<=g.max));
    group.innerHTML='<option value="all">All generations</option>'+ownedGens.map(g=>{const n=[...ids].filter(id=>id>=g.min&&id<=g.max).length;return `<option value="gen:${g.id}">Gen ${g.id} · ${escapeHtml(g.name)} · ${n}/${g.max-g.min+1}</option>`;}).join('');
  } else {
    filter.innerHTML='<option value="all">All cards</option><option value="rare">Rare hits</option><option value="duplicates">Duplicates</option>';
    const map=new Map();
    Object.values(state.cards).forEach(c=>{
      const k=cardSetKey(c), row=map.get(k)||{key:k,name:cardSetName(c),ids:new Set(),total:cardSetTotal(c),release:c.setRelease||''};
      row.ids.add(c.id); row.total=Math.max(row.total,cardSetTotal(c)); row.release = row.release || c.setRelease || '';
      map.set(k,row);
    });
    const rows=[...map.values()].sort((a,b)=>String(a.release||'9999-99-99').localeCompare(String(b.release||'9999-99-99'))||a.name.localeCompare(b.name));
    group.innerHTML='<option value="all">All owned sets</option>'+rows.map(s=>`<option value="set:${escapeHtml(s.key)}">${escapeHtml(s.release?`${s.release} · ${s.name}`:s.name)} · ${s.ids.size}${s.total?`/${s.total}`:''}</option>`).join('');
  }
  if([...filter.options].some(o=>o.value===oldFilter))filter.value=oldFilter;
  if([...group.options].some(o=>o.value===oldGroup))group.value=oldGroup;
  
  const quick=document.getElementById('binderQuickFilters');if(quick)quick.hidden=collectionMode!=='cards';const dc=document.getElementById('binderDuplicateCount');if(dc)dc.textContent=Object.values(state.cards||{}).filter(c=>Number(c.count||0)>1).length;
};





/* === v0.7 patch: stronger scene + pack suspense === */




/* === v0.8 pack spectacle + Clefairy action reliability === */







/* === v0.9 polish patch: proper game-scene Clefairy + cinematic pack hits === */







/* === v0.10: visible card reveal scene + cache-busted build === */


/* v0.10.1 reveal completion hardening */










































/* === v0.13: chronological sets, offline-ready packs, cinematic reveal === */
const PACK_CACHE_KEY_V13='luckyDexPackCacheV13';
const SET_CATALOG_KEY_V13='luckyDexSetCatalogV13';
let packCacheV13={sets:{},cards:{}};
try{packCacheV13=JSON.parse(localStorage.getItem(PACK_CACHE_KEY_V13)||'null')||{sets:{},cards:{}};}catch(e){packCacheV13={sets:{},cards:{}};}
if(!packCacheV13.sets)packCacheV13.sets={};if(!packCacheV13.cards)packCacheV13.cards={};
function savePackCacheV13(){
  try{localStorage.setItem(PACK_CACHE_KEY_V13,JSON.stringify(packCacheV13));}catch(e){
    // Keep the newest 220 card details if WebView storage is tight.
    const entries=Object.entries(packCacheV13.cards||{}).sort((a,b)=>(b[1]._cachedAt||0)-(a[1]._cachedAt||0)).slice(0,220);
    packCacheV13.cards=Object.fromEntries(entries);try{localStorage.setItem(PACK_CACHE_KEY_V13,JSON.stringify(packCacheV13));}catch(_e){}
  }
}
function cacheSetV13(set,source){
  if(!set?.id)return;packCacheV13.sets[`${source}:${set.id}`]={...set,_cachedAt:Date.now(),_source:source};savePackCacheV13();
}
function cacheCardsV13(cards,set,source){
  for(const c of cards||[]){if(!c?.id)continue;packCacheV13.cards[c.id]={...c,setId:set?.id||c.set?.id||c.setId||'',setName:set?.name||c.set?.name||'',setRelease:set?.releaseDate||'',source,_cachedAt:Date.now()};}
  savePackCacheV13();
}
function cachedSetV13(id,source){return packCacheV13.sets[`${source}:${id}`]||null;}
function cachedCardsForSetV13(id){return Object.values(packCacheV13.cards||{}).filter(c=>(c.setId||c.set?.id)===id);}
function isOnlineV13(){return navigator.onLine!==false;}

const __fetchJsonV13=fetchJson;
fetchJson=async function(url){
  // Transparent persistent cache for full set/card detail requests.
  const cardMatch=String(url).match(/\/cards\/([^/?#]+)$/);
  const setMatch=String(url).match(/\/sets\/([^/?#]+)$/);
  if(!isOnlineV13()){
    if(cardMatch&&packCacheV13.cards[decodeURIComponent(cardMatch[1])])return packCacheV13.cards[decodeURIComponent(cardMatch[1])];
    if(setMatch){const id=decodeURIComponent(setMatch[1]);const hit=Object.values(packCacheV13.sets).find(s=>s.id===id);if(hit)return hit;}
  }
  try{
    const data=await __fetchJsonV13(url);
    if(cardMatch&&data?.id){packCacheV13.cards[data.id]={...data,_cachedAt:Date.now()};savePackCacheV13();}
    return data;
  }catch(e){
    if(cardMatch){const id=decodeURIComponent(cardMatch[1]);if(packCacheV13.cards[id])return packCacheV13.cards[id];}
    if(setMatch){const id=decodeURIComponent(setMatch[1]);const hit=Object.values(packCacheV13.sets).find(s=>s.id===id);if(hit)return hit;}
    throw e;
  }
};

function readCatalogCacheV13(){try{return JSON.parse(localStorage.getItem(SET_CATALOG_KEY_V13)||'null')||{};}catch(e){return {};}}
function saveCatalogCacheV13(source,sets){const all=readCatalogCacheV13();all[source]={sets,at:Date.now()};try{localStorage.setItem(SET_CATALOG_KEY_V13,JSON.stringify(all));}catch(e){}}



async function buildOfflinePackV13(set,source,luckyPack=false,godPack=false){
  const cachedPool=cachedCardsForSetV13(set.id),pool=source==='tcg'?cachedPool.filter(card=>window.LuckyDexCardAcquisition?.boosterEligible?.(card,set)!==false):cachedPool;
  const need=source==='tcgp'?(window.LuckyDexPocket?.packSize(set)||5):(window.LuckyDexPackPolicy?.packSizeFor?.(set,'tcg')||physicalPackSizeV250(set));
  if(pool.length<need)throw new Error('offline-cache-empty');
  const shuffled=[...pool].sort(()=>Math.random()-.5),cards=[];
  const byTier=t=>shuffled.filter(c=>rarityTier(c)===t&&!cards.some(x=>x.id===c.id));
  const take=(target,foil='')=>{
    let opts=byTier(target);if(!opts.length)opts=shuffled.filter(c=>!cards.some(x=>x.id===c.id));
    if(!opts.length)opts=pool;
    const c={...opts[Math.floor(Math.random()*opts.length)]};c._foil=foil;cards.push(c);
  };
  if(godPack){
    const policy=window.LuckyDexGodPack;if(!policy?.targetPlan||!policy?.highPoolTiers)throw new Error('God Pack policy unavailable');
    const highTiers=new Set(policy.highPoolTiers(pool,rarityTier)),godPool=shuffled.filter(card=>highTiers.has(rarityTier(card))),used=new Set(),plan=policy.targetPlan(godPool,need,rarityTier);
    for(const target of plan){let available=godPool.filter(card=>!used.has(card.id));if(!available.length)available=godPool;let bestDistance=Infinity,bestTier=-1,options=[];for(const card of available){const tier=rarityTier(card),distance=Math.abs(tier-target);if(distance<bestDistance||(distance===bestDistance&&tier>bestTier)){bestDistance=distance;bestTier=tier;options=[card];}else if(distance===bestDistance&&tier===bestTier)options.push(card);}const chosen={...options[Math.floor(Math.random()*options.length)]};chosen._foil='';cards.push(chosen);used.add(chosen.id);}return cards.slice(0,need);
  }
  const slots=window.LuckyDexPackPolicy?.slotPlan?.(set,{source,luckyPack})||[];
  if(!slots.length)throw new Error('offline-cache-empty');
  for(const descriptor of slots){
    const resolved=await descriptorPoolV0343({...set,cards:pool},source,descriptor,null,{offline:true});
    if(!resolved.pool.length)throw new Error('offline-cache-empty');
    const card=await pickCardForDescriptorV0343(resolved.pool,resolved.descriptor,cards,null,resolved.poolSet,source);
    if(source==='tcgp'){card.image=deriveCardBase(card,set)||card.image;card._foil='';}
    cards.push(card);
  }
  return assertPackContractV03515(cards,set,source,slots);
}

















// Give the player a clear offline-readiness hint on set changes.
let offlineHintEpoch=0;
async function updateOfflineHintV13(){
  const select=document.getElementById('setSelect'),source=document.getElementById('cardSource')?.value||'tcg';if(!select)return;
  const epoch=++offlineHintEpoch,setId=select.value,pool=cachedCardsForSetV13(setId),selectedSet=setCache[source]?.find(s=>s.id===setId)||cachedSetV13(setId,source),libraryInstalled=!!(source==='tcg'&&selectedSet?._libraryKey&&window.LuckyDexCardArt?.isInstalled?.(selectedSet._libraryKey)),need=source==='tcgp'?(window.LuckyDexPocket?.packSize(selectedSet||setId)||5):physicalPackSizeV250(selectedSet),metadata=libraryInstalled||!!cachedSetV13(setId,source)&&pool.length>=need;
  const blobs=!libraryInstalled&&metadata?await Promise.all(pool.map(c=>packCachedBlob(c.id))):[];
  if(epoch!==offlineHintEpoch||select.value!==setId||document.getElementById('cardSource').value!==source)return;
  let ready=metadata;
  for(let i=0;ready&&!libraryInstalled&&i<pool.length;i+=4){
    if(epoch!==offlineHintEpoch)return;
    const usable=await Promise.all(pool.slice(i,i+4).map((c,j)=>packArtworkIsUsable(c,blobs[i+j])));ready=usable.every(Boolean);
  }
  if(epoch!==offlineHintEpoch)return;
  let hint=document.getElementById('offlinePackHint');if(!hint){hint=document.createElement('div');hint.id='offlinePackHint';hint.className='v13-offline-hint';select.parentElement?.appendChild(hint);}
  hint.textContent=libraryInstalled?'✓ Exact artwork pack installed · offline-ready':ready?'✓ Offline-ready · cards and artwork cached':selectedSet?._libraryKey?(isOnlineV13()?'Exact artwork downloads when you open this set':'Exact artwork pack not installed'):isOnlineV13()?'Open this set online to cache cards and artwork':'Cards or artwork are not fully cached for this set';
  hint.classList.toggle('ready',ready);
}
setTimeout(()=>{
  document.getElementById('setSelect')?.addEventListener('change',()=>{updateOfflineHintV13();updatePackFormatV5();});
  document.getElementById('cardSource')?.addEventListener('change',()=>setTimeout(updateOfflineHintV13,250));
  window.addEventListener('online',updateOfflineHintV13);window.addEventListener('offline',updateOfflineHintV13);updateOfflineHintV13();
},120);

/* === v0.13.1: persistent offline artwork cache === */
const __cardImageV131=cardImage;
cardImage=function(base,q='high',ext='webp'){
  const s=String(base||'');if(/^blob:|^data:/i.test(s))return s;return __cardImageV131(base,q,ext);
};
let packDbPromiseV131=null;
function packDbV131(){
  if(packDbPromiseV131)return packDbPromiseV131;
  packDbPromiseV131=new Promise((resolve,reject)=>{
    try{
      const req=indexedDB.open('LuckyDexOfflinePackV164',1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('images'))db.createObjectStore('images');};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    }catch(e){reject(e);}
  });return packDbPromiseV131;
}
async function putOfflineImageV131(cardId,blob){
  if(!cardId||!blob)return;try{const db=await packDbV131();await new Promise((res,rej)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(blob,cardId);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}catch(e){}
}


/* === v0.16.5 deterministic artwork identity migration ===
   v0.16.3 could cache a visually valid but WRONG Limitless image when a subset
   reused a parent set code/number. Purge those unverified URLs and use a fresh
   IndexedDB namespace so a bad blob cannot survive the fix. */
function migrateArtworkIdentityV165(){
  let oldSchema='';try{oldSchema=localStorage.getItem('luckyDexArtworkSchema')||'';}catch(_){ }
  if(oldSchema==='165')return;
  let changed=false;
  const externalAlternate=url=>/(?:limitlesstcg\.nyc3\.cdn\.digitaloceanspaces\.com|images\.pokemontcg\.io|images\.scrydex\.com)/i.test(String(url||''));
  const resetCard=card=>{
    if(!card||(card.source||'tcg')==='tcgp')return;
    // v0.16.3 could persist a decodable but identity-wrong alternate image.
    // Keep TCGdex card-ID artwork, but force all cross-catalogue art through the
    // stricter v0.16.4 resolver once before trusting it again.
    if(externalAlternate(card.image)){card.image='';changed=true;}
    for(const key of ['_resolvedArtworkUrl','_artIdentityVerified','_artSource','_ptcgId','_ptcgNumber','_ptcgImageLarge','_ptcgImageSmall','_scrydexId','_scrydexImageLarge','_scrydexImageSmall','_limitlessSetCode','_limitlessNumber']){
      if(Object.prototype.hasOwnProperty.call(card,key)){delete card[key];changed=true;}
    }
  };
  for(const card of Object.values(state.cards||{}))resetCard(card);
  for(const card of Object.values(packCacheV13.cards||{}))resetCard(card);
  try{localStorage.setItem('luckyDexArtworkSchema','165');}catch(_){ }
  if(changed){try{save();}catch(_){ }try{savePackCacheV13();}catch(_){ }}
}

function migrateArtworkIdentityV0533(){
  let schema='';try{schema=localStorage.getItem('luckyDexArtworkSchemaV0533')||'';}catch(_){ }
  if(schema==='533')return;
  const identity=window.LuckyDexCardArtIdentityV0533;if(!identity)return;
  let changed=false;
  for(const card of Object.values(state.cards||{})){
    if(card?.image&&!identity.isTrusted(card,card.image)){
      card.image='';
      for(const key of ['_resolvedArtworkUrl','_artSource','_artIdentityVerified','_ptcgId','_ptcgNumber','_ptcgImageLarge','_ptcgImageSmall','_scrydexId','_scrydexImageLarge','_scrydexImageSmall','_limitlessSetCode','_limitlessNumber','_tcgdexImage'])delete card[key];
      changed=true;
    }
  }
  try{localStorage.setItem('luckyDexArtworkSchemaV0533','533');}catch(_){ }
  if(changed)try{save();}catch(_){ }
}



/* === v0.26.0 sealed booster collection === */
function renderSealedPackCollectionV0260(){
  const grid=document.getElementById('collectionGrid'),progress=document.getElementById('collectionProgress'),search=document.getElementById('collectionSearch');if(!grid)return;
  const q=String(search?.value||'').trim().toLowerCase(),rows=Object.values(ensureSealedPacksV0260()).filter(row=>Number(row?.count||0)>0).filter(row=>!q||String(row.setName||row.setId||'').toLowerCase().includes(q)).sort((a,b)=>Number(b.firstOwned||0)-Number(a.firstOwned||0)||String(a.setName||'').localeCompare(String(b.setName||'')));
  const all=Object.values(ensureSealedPacksV0260()).filter(row=>Number(row?.count||0)>0),total=all.reduce((n,row)=>n+Number(row.count||0),0);
  if(progress)progress.innerHTML=`<div><b>Sealed Packs</b><span>${total} unopened booster${total===1?'':'s'} across ${all.length} set${all.length===1?'':'s'}</span></div>`;
  grid.classList.add('sealed-pack-collection-v0260');
  if(!rows.length){grid.innerHTML=`<div class="empty">${q?'No sealed packs match that search.':'No unopened packs yet. Win booster packs in Fossil Dig and future Arcade rewards to collect them here.'}</div>`;return;}
  grid.innerHTML=rows.map(row=>{const setRef={id:row.setId,name:row.setName},art=window.LuckyDexBoosterArt?.directPath?.(setRef)||row.art||'',fallback=window.LuckyDexBoosterArt?.runtimeFallback?.(setRef)||row.art||'';return `<article class="collection-item sealed-booster-v0260"><span class="count-badge">×${Number(row.count||0)}</span><div class="sealed-booster-art-v0260"><img src="${escapeHtml(art)}" data-booster-fallback="${escapeHtml(fallback!==art?fallback:'')}" alt="${escapeHtml(row.setName||row.setId)} booster"></div><b>${escapeHtml(row.setName||row.setId)}</b><span>Unopened booster</span><button type="button" class="primary" data-open-sealed="${escapeHtml(row.setId)}">OPEN PACK</button></article>`;}).join('');
  grid.querySelectorAll('.sealed-booster-art-v0260 img[data-booster-fallback]').forEach(img=>{if(!img.dataset.boosterFallback)return;img.onerror=()=>{img.onerror=null;img.src=img.dataset.boosterFallback;};});
  grid.querySelectorAll('[data-open-sealed]').forEach(btn=>btn.onclick=()=>openSealedPackV0260(btn.dataset.openSealed));
}
const __rebuildCollectionControlsV0260=rebuildCollectionControls;
rebuildCollectionControls=function(){
  const filter=document.getElementById('collectionFilter'),group=document.getElementById('collectionGroupFilter'),quick=document.getElementById('binderQuickFilters'),team=document.getElementById('teamPanel'),search=document.getElementById('collectionSearch');
  if(collectionMode==='sealed'){
    if(filter){filter.innerHTML='<option value="all">All sealed packs</option>';filter.value='all';filter.hidden=true;}if(group){group.innerHTML='<option value="all">All sets</option>';group.value='all';group.hidden=true;}if(quick)quick.hidden=true;if(team)team.hidden=true;if(search)search.placeholder='Search sealed packs';return;
  }
  if(filter)filter.hidden=false;if(group)group.hidden=false;if(search)search.placeholder='Search collection';return __rebuildCollectionControlsV0260();
};
const __renderCollectionV0260=renderCollection;
renderCollection=function(){const grid=document.getElementById('collectionGrid');if(collectionMode==='sealed')return renderSealedPackCollectionV0260();grid?.classList.remove('sealed-pack-collection-v0260');return __renderCollectionV0260();};

/* === v0.15.9 runtime-order hardening ===
   IMPORTANT: all startup work runs only after the whole script has evaluated.
   Earlier builds booted midway through this file, before packCacheV13 and
   offlineHintEpoch had left their lexical TDZ. renderGlobalHud() ->
   updatePackButton() -> updatePackFormatV5() -> cachedSetV13() therefore threw
   before the app could finish wiring. That single runtime exception explained
   the frozen starter, Wild Search/Expedition stalls and permanent Loading sets.
*/
window.__LUCKYDEX_BUILD='0.69.24';
window.addEventListener('error',event=>{
  try{localStorage.setItem('luckyDexLastRuntimeError',JSON.stringify({build:window.__LUCKYDEX_BUILD,message:String(event?.message||'Unknown error'),source:String(event?.filename||''),line:Number(event?.lineno||0),at:Date.now()}));}catch(_){ }
});
window.addEventListener('unhandledrejection',event=>{
  try{localStorage.setItem('luckyDexLastRuntimeError',JSON.stringify({build:window.__LUCKYDEX_BUILD,message:String(event?.reason?.stack||event?.reason||'Unhandled rejection'),at:Date.now()}));}catch(_){ }
});
// Adventure's one controller uses explicit shared services and owns its saves.
window.LuckyDexAdventureBridge={
  getState:()=>state,save,currentRank,effectiveShinyOdds,addTrainerXp,bumpDaily,checkDexMilestones,showToast,navigate,
  generationFor:generationForId,generationForId,combatStats,grantPokemonXp,ensurePokemonBuild,
  ZONES,LOCAL_ZONE_POOLS,BALLS,TYPE_MOVE,LEGENDARIES,MYTHICAL,RARE_WILD,API,
  vibrate,renderTeamPanel,renderCollection,renderProfile,
  openSupplies:()=>{navigate('adventure');window.LuckyDexAdventure.openTool('mart');}
};

(function startLuckyDexV0158(){
  // At this point PACK_CACHE_KEY_V13, packCacheV13, offlineHintEpoch and the
  // IndexedDB helpers are all initialized. No startup renderer can touch a TDZ.
  try{migrateArtworkIdentityV165();migrateArtworkIdentityV0533();}catch(e){console.error('[LuckyDex] artwork migration failed',e);}
  try{queueClaimedAchievementRewardsV0246();save();}catch(e){console.error('[LuckyDex] reward migration failed',e);}
  Promise.resolve(bootLuckyDexV0158()).then(()=>setTimeout(()=>fulfilPendingAchievementRewardsV0246().catch(()=>{}),500)).catch(e=>console.error('[LuckyDex] boot failed',e));
  try{wireV5();}catch(e){console.error('[LuckyDex] wiring failed',e);}
})();

