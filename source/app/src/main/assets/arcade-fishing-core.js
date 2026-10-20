(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexFishingCore=api;})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
const REGION_DEFS=[
 ['kanto','Kanto',[1,151],['Cerulean Waters','Vermilion Harbour','Safari Pond','Seafoam Coast']],
 ['johto','Johto',[152,251],['Cherrygrove Shore','Lake of Rage','Olivine Harbour','Whirl Islands']],
 ['hoenn','Hoenn',[252,386],['Dewford Shore','Slateport Harbour','Route 119','Sootopolis Depths']],
 ['sinnoh','Sinnoh',[387,493],['Valley Windworks','Pastoria Marsh','Canalave Harbour','Pokémon League Coast']],
 ['unova','Unova',[494,649],['Driftveil Waters','Undella Bay','Village Bridge','Seaside Cave']],
 ['kalos','Kalos',[650,721],['Ambrette Coast','Cyllage Shore','Azure Bay','Couriway River']],
 ['alola','Alola',[722,809],['Melemele Sea','Brooklet Hill','Akala Coast','Poni Wilds']],
 ['galar','Galar',[810,905],['Hulbury Harbour','Motostoke Riverbank','Lake of Outrage','Crown Tundra']],
 ['paldea','Paldea',[906,1025],['South Province Coast','Casseroya Lake','Porto Marinada','North Paldea Sea']]
];
const RODS={
 old:{name:'Old Rod',price:0,zone:.12,rarity:0,difficulty:.13,tier:0},
 good:{name:'Good Rod',price:120,zone:.16,rarity:.12,difficulty:.04,tier:1},
 super:{name:'Super Rod',price:380,zone:.21,rarity:.25,difficulty:-.03,tier:2},
 deep:{name:'Deep Sea Rod',price:900,zone:.26,rarity:.38,difficulty:-.09,tier:3}
};
const BAIT={
 basic:{name:'Basic Bait',price:10,quantity:5,rare:.02,treasure:0,size:0},
 honey:{name:'Sweet Honey',price:25,quantity:5,rare:.09,treasure:0,size:.02},
 lure:{name:'Lure Ball Chum',price:55,quantity:4,rare:.16,treasure:.015,size:.04},
 pearl:{name:'Pearl Bait',price:90,quantity:3,rare:.06,treasure:.08,size:.08}
};
const JUNK=[
 {id:'empty-potion',name:'Empty Potion Bottle',value:3,easter:false,desc:'Still smells faintly medicinal.'},
 {id:'bent-pokeball',name:'Bent Poké Ball',value:5,easter:false,desc:'Definitely not going to click shut again.'},
 {id:'repel-wrapper',name:'Soggy Repel Wrapper',value:2,easter:false,desc:'The wild Pokémon were unimpressed.'},
 {id:'driftwood',name:'Odd Driftwood',value:4,easter:false,desc:'Almost looks like a Sudowoodo. Almost.'},
 {id:'broken-lure',name:'Broken Fishing Lure',value:7,easter:false,desc:'Somebody else had a worse day fishing.'},
 {id:'rotten-leftovers',name:'Rotten Leftovers',value:11,easter:true,desc:'No longer restores anything except regret.'},
 {id:'rusty-bike',name:'Rusty Bike',value:40,easter:true,desc:'The voucher probably expired several regions ago.'},
 {id:'frayed-rope',name:'Frayed Escape Rope',value:13,easter:true,desc:'It escaped before you could.'},
 {id:'shattered-blackglasses',name:'Shattered BlackGlasses',value:18,easter:true,desc:'Still stylish if you only look through one side.'},
 {id:'decomposed-apricorn',name:'Decomposed Apricorn',value:6,easter:true,desc:'Kurt would prefer you did not bring this to him.'},
 {id:'slowpoke-tail',name:'Slowpoke Tail',value:999,easter:true,ultra:true,desc:'You decide not to ask where this came from.'},
 {id:'torn-eon-ticket',name:'Torn Eon Ticket',value:777,easter:true,ultra:true,desc:'Half a ticket to somewhere extremely interesting.'},
 {id:'broken-silph-scope',name:'Broken Silph Scope',value:80,easter:true,desc:'It only identifies wet ghosts now.'},
 {id:'soggy-rocket-uniform',name:'Soggy Team Rocket Uniform',value:45,easter:true,desc:'The R is peeling off.'},
 {id:'fake-nugget',name:'Fake Nugget',value:1,easter:true,desc:'A rock painted gold with alarming confidence.'},
 {id:'waterlogged-mail',name:'Waterlogged Mail',value:9,easter:true,desc:'The message is now just “...”'},
 {id:'cracked-pokenav',name:'Cracked PokéNav',value:18,easter:true,desc:'It insists every current location is somewhere near Mauville.'},
 {id:'waterlogged-poketch',name:'Waterlogged Pokétch',value:17,easter:true,desc:'The screen is permanently stuck on the friendship checker.'},
 {id:'deflated-pokedoll',name:'Deflated Poké Doll',value:8,easter:false,desc:'It no longer scares anything away.'},
 {id:'faded-old-sea-map',name:'Faded Old Sea Map',value:850,easter:true,ultra:true,desc:'Most of the route is gone, but one tiny island is still circled.'},
 {id:'rusted-itemfinder',name:'Rusted Itemfinder',value:15,easter:true,desc:'It only reacts when pointed at itself.'},
 {id:'torn-vs-seeker',name:'Torn Vs. Seeker',value:14,easter:true,desc:'No nearby Trainers want a rematch with this.'},
 {id:'muddy-acro-pedal',name:'Muddy Acro Bike Pedal',value:10,easter:true,desc:'Somebody attempted one wheelie too many.'},
 {id:'bent-mach-gear',name:'Bent Mach Bike Gear',value:12,easter:true,desc:'Fast once. Extremely crunchy now.'},
 {id:'empty-moomoo-bottle',name:'Empty MooMoo Milk Bottle',value:4,easter:false,desc:'Thoroughly rinsed by several routes worth of water.'},
 {id:'soggy-old-gateau',name:'Soggy Old Gateau',value:6,easter:true,desc:'The Chateau was old. This is older.'},
 {id:'chipped-mystic-water',name:'Chipped Mystic Water',value:22,easter:true,desc:'A Water-type treasure that somehow lost a fight with water.'},
 {id:'cracked-damp-rock',name:'Cracked Damp Rock',value:16,easter:true,desc:'It may still make the rain last longer. Probably not.'},
 {id:'broken-pokeflute-reed',name:'Broken Poké Flute Reed',value:19,easter:true,desc:'Produces one note. Snorlax remains unimpressed.'},
 {id:'waterlogged-pokeblock-case',name:'Waterlogged Pokéblock Case',value:11,easter:true,desc:'Everything inside has become one very questionable Pokéblock.'},
 {id:'torn-devon-label',name:'Torn Devon Goods Label',value:13,easter:true,desc:'Marked urgent. Delivery is only a few decades late.'},
 {id:'crushed-soda-can',name:'Crushed Soda Pop Can',value:2,easter:false,desc:'Fresh Water would have aged better.'},
 {id:'snapped-super-rod',name:'Snapped Super Rod Handle',value:24,easter:true,desc:'Proof that something enormous once won.'},
 {id:'moldy-ragecandy-wrapper',name:'Moldy RageCandyBar Wrapper',value:5,easter:true,desc:'No candy remains. The rage is intact.'},
 {id:'cracked-dive-ball',name:'Cracked Dive Ball',value:9,easter:false,desc:'Excellent underwater. Less excellent with a hole in it.'},
 {id:'glitched-driftwood',name:'Glitched Driftwood',value:99,easter:true,ultra:true,desc:'Its shape seems to change whenever you stop looking at it.'}
];
const TREASURE=[
 {id:'coin-pouch',name:'Washed-up Coin Pouch',rewardKind:'coins',amount:650,weight:34,payoutTokens:12,payoutCoins:20},
 {id:'stardust',name:'Stardust Cache',rewardKind:'dust',amount:125,weight:28,payoutTokens:15,payoutCoins:20},
 {id:'pack-ticket',name:'Pack Ticket',rewardKind:'tickets',amount:1,weight:20,payoutTokens:20,payoutCoins:30},
 {id:'sealed-pack',name:'Sealed Booster',rewardKind:'pack',amount:1,weight:10,payoutTokens:28,payoutCoins:45},
 {id:'big-dust',name:'Shimmering Dust Tin',rewardKind:'dust',amount:225,weight:5,payoutTokens:40,payoutCoins:65},
 {id:'ticket-pair',name:'Two Pack Tickets',rewardKind:'tickets',amount:2,weight:3,payoutTokens:55,payoutCoins:90}
];
const RARITY_COIN_BASE={common:2,uncommon:7,rare:18,'very-rare':40,legendary:90};
const RARITY_VALUE={common:2,uncommon:4,rare:8,'very-rare':14,legendary:24};
const RARITY_DIFFICULTY={common:.24,uncommon:.40,rare:.58,'very-rare':.75,legendary:.88};
const RARITY_WEIGHT={common:1,uncommon:.58,rare:.28,'very-rare':.11,legendary:.025};
const RARITY_OVERRIDES={129:'common',349:'very-rare',369:'very-rare',131:'very-rare',147:'rare',148:'very-rare',170:'uncommon',171:'rare',223:'uncommon',224:'rare',320:'uncommon',321:'rare',318:'uncommon',319:'rare',350:'legendary',245:'legendary',382:'legendary',484:'legendary',647:'legendary',746:'uncommon',771:'rare',883:'very-rare',902:'very-rare',977:'very-rare'};
const ARCHIVE_BASE='https://archives.bulbagarden.net/wiki/Special:Redirect/file/';
const remoteMap=file=>ARCHIVE_BASE+encodeURIComponent(String(file).replace(/ /g,'_'));
const AREA_ART={
 'Cerulean Waters':['Cerulean City FRLG.png','adventure/location-scenes/kanto-city.png'],
 'Vermilion Harbour':['Vermilion City FRLG.png','adventure/location-scenes/kanto-coast.png'],
 'Safari Pond':['Safari Zone area 2 FRLG.png','adventure/location-scenes/kanto-coast.png','30% 52%'],
 'Seafoam Coast':['FL Seafoam Islands.png','adventure/location-scenes/kanto-coast.png'],
 'Cherrygrove Shore':['Cherrygrove City HGSS.png','adventure/location-scenes/johto-coast.png'],
 'Lake of Rage':['Lake of Rage HGSS.png','adventure/location-scenes/johto-coast.png'],
 'Olivine Harbour':['Olivine City HGSS.png','adventure/location-scenes/johto-coast.png'],
 'Whirl Islands':['Whirl Islands 1F HGSS.png','adventure/location-scenes/johto-cave.png'],
 'Dewford Shore':['Dewford Town E.png','adventure/location-scenes/hoenn-coast.png'],
 'Slateport Harbour':['Slateport City E.png','adventure/location-scenes/hoenn-coast.png'],
 'Route 119':['Hoenn Route 119 E.png','adventure/location-scenes/hoenn-route.png'],
 'Sootopolis Depths':['Hoenn Route 126 E.png','adventure/location-scenes/hoenn-coast.png'],
 'Valley Windworks':['Valley Windworks Pt.png','adventure/art/meadow-scene.png'],
 'Pastoria Marsh':['Great Marsh Pt.png','adventure/art/meadow-scene.png'],
 'Canalave Harbour':['Canalave City Pt.png','adventure/art/coast-scene.png'],
 'Pokémon League Coast':['Sinnoh Route 223 Pt.png','adventure/art/coast-scene.png'],
 'Driftveil Waters':['Driftveil City B2W2.png','adventure/art/coast-scene.png'],
 'Undella Bay':['Undella Bay Spring B2W2.png','adventure/art/coast-scene.png'],
 'Village Bridge':['Village Bridge Spring B2W2.png','adventure/art/coast-scene.png'],
 'Seaside Cave':['Seaside Cave 1F B2W2.png','adventure/art/cave-scene.png'],
 'Ambrette Coast':['Ambrette Town XY.png','adventure/art/coast-scene.png'],
 'Cyllage Shore':['Cyllage City XY.png','adventure/art/coast-scene.png'],
 'Azure Bay':['Azure Bay XY.png','adventure/art/coast-scene.png'],
 'Couriway River':['Couriway Town XY.png','adventure/art/meadow-scene.png'],
 'Melemele Sea':['Alola Melemele Sea Map.png','adventure/art/coast-scene.png'],
 'Brooklet Hill':['Brooklet Hill SM.png','adventure/art/meadow-scene.png'],
 'Akala Coast':['Alola Heahea Beach Map.png','adventure/art/coast-scene.png'],
 'Poni Wilds':['Alola Poni Wilds Map.png','adventure/art/meadow-scene.png'],
 'Hulbury Harbour':['Galar Hulbury Map.png','adventure/art/coast-scene.png'],
 'Motostoke Riverbank':['Galar Motostoke Riverbank Map.png','adventure/art/meadow-scene.png'],
 'Lake of Outrage':['Galar Lake of Outrage Map.png','adventure/art/coast-scene.png'],
 'Crown Tundra':['Galar Crown Tundra SwSh.png','adventure/art/coast-scene.png'],
 'South Province Coast':['South Paldean Sea.png','adventure/art/coast-scene.png'],
 'Casseroya Lake':['Casseroya Lake SV.png','adventure/art/coast-scene.png'],
 'Porto Marinada':['Porto Marinada.png','adventure/art/coast-scene.png'],
 'North Paldea Sea':['North Paldean Sea.png','adventure/art/coast-scene.png']
};
const OLD_ROD_SPECIES=new Set([60,72,90,98,116,118,120,129,170,194,211,222,223,270,283,318,320,339,341,349,363,366,370,418,422,456,458,535,550,592,688,690,692,746,747,751,767,771,833,846,960]);
const SUPER_ONLY_SPECIES=new Set([9,62,73,80,87,91,99,117,119,121,130,131,134,139,141,160,171,184,186,195,199,224,226,230,245,260,272,279,319,321,340,342,350,365,367,368,369,382,395,419,423,457,484,489,490,503,516,537,565,581,593,647,658,689,693,721,730,748,752,768,788,818,834,847,882,883,902,914,961,964,976,977,978,991,1009]);

function clone(v){return JSON.parse(JSON.stringify(v));}
function slug(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function clamp(n,a=0,b=1){return Math.max(a,Math.min(b,Number(n)||0));}
function bst(p){return Object.values(p?.baseStats||{}).reduce((a,b)=>a+(Number(b)||0),0);}
function rarityFor(p){if(RARITY_OVERRIDES[p?.id])return RARITY_OVERRIDES[p.id];const total=bst(p);if(total>=570)return'legendary';if(total>=500)return'very-rare';if(total>=420)return'rare';if(total>=320)return'uncommon';return'common';}
function regionKeyForId(id){id=Number(id);for(const [key,,range] of REGION_DEFS)if(id>=range[0]&&id<=range[1])return key;return'paldea';}
function locationsModule(){if(typeof globalThis!=='undefined'&&globalThis.LuckyDexFishingLocations)return globalThis.LuckyDexFishingLocations;if(typeof require==='function')try{return require('./arcade-fishing-locations.js');}catch(_e){}return null;}
function buildCatalog(speciesById={}){const L=locationsModule();if(L?.buildCatalog)return L.buildCatalog(speciesById);return{regions:{}};}
function poolAllowsRod(row,rod='old'){const L=locationsModule(),tier=RODS[rod]?.tier??0,min=L?.minRodTier?L.minRodTier(row?.minRod):(RODS[row?.minRod]?.tier??0);return tier>=min;}
function minimumRodForSpecies(species){for(const id of ['old','good','super','deep'])if(rodAllowsSpecies(species,id))return id;return'deep';}
function availableSpecies(area,rod='old'){const rows=Array.isArray(area?.pool)?area.pool:[];return rows.filter(row=>poolAllowsRod(row,rod)).map(row=>row.speciesId);}
function sizeRatioFromRoll(roll,forceJumbo=false){if(forceJumbo)return 1.35+clamp(roll)*.35;const r=clamp(roll);if(r<.02)return .52+r/.02*.12;if(r>.985)return 1.35+(r-.985)/.015*.28;return .68+r*.62;}
const BEHAVIOR_BY_RARITY={common:['steady','drift'],uncommon:['drift','flutter'],rare:['flutter','dart'],"very-rare":['dart','surge','erratic'],legendary:['surge','erratic']};
function behaviorFor(species,rarity){const pool=BEHAVIOR_BY_RARITY[rarity]||BEHAVIOR_BY_RARITY.common;const id=Math.max(1,Number(species?.id)||1);return pool[(Math.imul(id,2654435761)>>>0)%pool.length];}
function rodAllowsSpecies(species,rod='old'){if(!species||!Array.isArray(species.types)||!species.types.includes('water'))return false;const tier=RODS[rod]?.tier??0;if(OLD_ROD_SPECIES.has(Number(species.id)))return tier>=0;const rarity=rarityFor(species);if(rarity==='legendary')return tier>=3;if(SUPER_ONLY_SPECIES.has(Number(species.id))||rarity==='very-rare')return tier>=2;return tier>=1;}
function createCatch({species,rolls={},rod='old',bait='none',forceJumbo=false}={}){if(!species)throw new TypeError('Fishing catch requires species.');const rarity=rarityFor(species),ratio=sizeRatioFromRoll(rolls.size??Math.random(),forceJumbo),lengthM=Math.max(.05,(Number(species.height)||.5)*ratio),weightKg=Math.max(.05,(Number(species.weight)||1)*Math.pow(ratio,2.6)),rodRule=RODS[rod]||RODS.old,baitRule=BAIT[bait]||{};const sizeMultiplier=.58+Math.pow(ratio,2)*.55,value=Math.max(1,Math.round((RARITY_VALUE[rarity]||2)*sizeMultiplier)),difficulty=clamp((RARITY_DIFFICULTY[rarity]||.3)+Math.min(.10,Math.max(0,weightKg-20)/500)+rodRule.difficulty-(baitRule.rare||0)*.12,.18,.97),behavior=behaviorFor(species,rarity);return{kind:'pokemon',id:`pokemon-${species.id}`,speciesId:species.id,name:species.name,rarity,sizeRatio:ratio,lengthM:Number(lengthM.toFixed(2)),weightKg:Number(weightKg.toFixed(2)),value,difficulty,behavior,jumbo:ratio>=1.35,tiny:ratio<=.64};}
function rng32(seed){let x=(Number(seed)>>>0)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function weightedPick(items,weight,rand){let total=0;const rows=[];for(const item of items){const w=Math.max(0,Number(weight(item))||0);if(!w)continue;total+=w;rows.push([item,total]);}if(!rows.length)return items[0];const n=rand()*total;for(const [item,edge] of rows)if(n<=edge)return item;return rows.at(-1)[0];}
function settingsOdds(settings,key,fallback){const n=Number(settings?.[key]);return Number.isFinite(n)?clamp(n):fallback;}
function rollCatch({area,speciesById={},settings={},seed=Date.now(),rod='old',bait='none',forceKind=null}={}){if(!area)throw new TypeError('Fishing area required.');const rand=rng32(seed),baitRule=BAIT[bait]||{},rodRule=RODS[rod]||RODS.old;const treasureOdds=settingsOdds(settings,'fishingTreasure',.02)+(baitRule.treasure||0),easterOdds=settingsOdds(settings,'fishingEasterJunk',.01),forceEaster=settingsOdds(settings,'fishingEasterJunk',.01)>=1;let kind=forceKind;if(!kind){if(settingsOdds(settings,'fishingTreasure',.02)>=1)kind='treasure';else if(forceEaster)kind='junk-easter';else{const a=rand();if(a<treasureOdds)kind='treasure';else if(a<treasureOdds+easterOdds)kind='junk-easter';else if(a<treasureOdds+easterOdds+.12)kind='junk';else kind='pokemon';}}
 if(kind==='treasure'){const prize=weightedPick(TREASURE,x=>x.weight||1,rand);return{kind:'treasure',...prize,value:0,difficulty:.2};}
 if(kind==='junk'||kind==='junk-easter'){let pool=kind==='junk-easter'?JUNK.filter(x=>forceEaster?x.ultra:x.easter):JUNK.filter(x=>!x.ultra);if(!pool.length)pool=JUNK.filter(x=>x.easter);const item=weightedPick(pool,x=>x.ultra?.08:x.easter?.55:1,rand);return{kind:'junk',...item,difficulty:.14};}
 const authored=(Array.isArray(area.pool)&&area.pool.length?area.pool:(area.species||[]).filter(id=>speciesById[id]).map(id=>({speciesId:id,minRod:minimumRodForSpecies(speciesById[id]),weight:1}))).filter(row=>speciesById[row.speciesId]);const forceRare=rand()<settingsOdds(settings,'fishingRarePokemon',0);let rows=authored.filter(row=>poolAllowsRod(row,rod));if(!rows.length)rows=authored;if(forceRare){const rareRows=authored.filter(row=>['rare','very-rare','legendary'].includes(rarityFor(speciesById[row.speciesId])));if(rareRows.length)rows=rareRows;}if(!rows.length)throw new Error(`Fishing area ${area.name||area.id||'unknown'} has no authored catches.`);const rarityBoost=(rodRule.rarity||0)+(baitRule.rare||0);const picked=weightedPick(rows,row=>{const rarityWeight=forceRare?1:Math.pow(RARITY_WEIGHT[rarityFor(speciesById[row.speciesId])]||.2,Math.max(.35,1-rarityBoost));return rarityWeight*Math.max(.01,Number(row.weight)||1);},rand);const id=picked.speciesId;const forceJumbo=rand()<settingsOdds(settings,'fishingJumbo',.015);return createCatch({species:speciesById[id],rolls:{size:rand(),rarity:rand()},rod,bait,forceJumbo});}
function defaultState(){return{casts:0,catches:0,escaped:0,pokemonCaught:0,junkCaught:0,treasuresCaught:0,totalValue:0,bestValue:0,biggestRatio:0,jumboCaught:0,tinyCaught:0,rareCaught:0,easterJunk:0,treasurePrizes:0,fishingTokens:0,selectedRegion:'kanto',selectedArea:null,selectedRod:'old',selectedBait:'none',rods:{old:true,good:false,super:false,deep:false},bait:{basic:0,honey:0,lure:0,pearl:0},book:{pokemon:{},junk:{},treasure:{}},progression:null};}
function ensureState(save){if(!save||typeof save!=='object')throw new TypeError('Fishing state requires save.');save.arcade=save.arcade&&typeof save.arcade==='object'?save.arcade:{};const d=defaultState(),src=save.arcade.fishing&&typeof save.arcade.fishing==='object'?save.arcade.fishing:{},merged={...d,...src,rods:{...d.rods,...(src.rods||{})},bait:{...d.bait,...(src.bait||{})},book:{pokemon:{...(src.book?.pokemon||{})},junk:{...(src.book?.junk||{})},treasure:{...(src.book?.treasure||{})}}};Object.assign(src,merged);for(const k of ['casts','catches','escaped','pokemonCaught','junkCaught','treasuresCaught','totalValue','bestValue','biggestRatio','jumboCaught','tinyCaught','rareCaught','easterJunk','treasurePrizes','fishingTokens'])src[k]=Math.max(0,Number(src[k])||0);save.arcade.fishing=src;save.profile=save.profile&&typeof save.profile==='object'?save.profile:{};save.profile.coins=Math.max(0,Number(save.profile.coins)||0);return src;}

function progressionDefault(catalog){const firstRegion=locationsModule()?.REGION_ORDER?.[0]||Object.keys(catalog?.regions||{})[0]||'kanto',firstArea=catalog?.regions?.[firstRegion]?.areas?.[0]?.id||null;return{version:1,migratedFromLegacy:false,unlockedRegions:[firstRegion],unlockedAreas:{[firstRegion]:firstArea?[firstArea]:[]},areaCaught:{}};}
function sortedUniqueIds(values){return[...new Set((values||[]).map(Number).filter(Number.isFinite))].sort((a,b)=>a-b);}
function normalizeProgression(raw,catalog){const base=progressionDefault(catalog),src=raw&&typeof raw==='object'?raw:{},p={version:1,migratedFromLegacy:!!src.migratedFromLegacy,unlockedRegions:Array.isArray(src.unlockedRegions)?[...src.unlockedRegions]:[...base.unlockedRegions],unlockedAreas:{},areaCaught:{}};const order=locationsModule()?.REGION_ORDER||Object.keys(catalog?.regions||{});p.unlockedRegions=[...new Set(p.unlockedRegions.filter(id=>catalog?.regions?.[id]))].sort((a,b)=>order.indexOf(a)-order.indexOf(b));if(!p.unlockedRegions.includes(order[0]))p.unlockedRegions.unshift(order[0]);for(const regionId of order){const region=catalog?.regions?.[regionId];if(!region)continue;const validIds=new Set(region.areas.map(a=>a.id));p.unlockedAreas[regionId]=[...new Set((src.unlockedAreas?.[regionId]||base.unlockedAreas[regionId]||[]).filter(id=>validIds.has(id)))].sort((a,b)=>region.areas.findIndex(x=>x.id===a)-region.areas.findIndex(x=>x.id===b));for(const area of region.areas)p.areaCaught[area.id]=sortedUniqueIds(src.areaCaught?.[area.id]);}return p;}
function progressForArea(progression,areaId){const uniqueCaught=sortedUniqueIds(progression?.areaCaught?.[areaId]).length;return{uniqueCaught,target:3,complete:uniqueCaught>=3};}
function isRegionUnlocked(progression,regionId){return !!progression?.unlockedRegions?.includes(regionId);}
function isAreaUnlocked(progression,regionId,areaId){return isRegionUnlocked(progression,regionId)&&!!progression?.unlockedAreas?.[regionId]?.includes(areaId);}
function regionalCaught(progression,region){const ids=[];for(const area of region?.areas||[])ids.push(...(progression?.areaCaught?.[area.id]||[]));return sortedUniqueIds(ids);}
function recomputeUnlocks(progression,catalog,{grandfatherThrough=-1}={}){const L=locationsModule(),order=L?.REGION_ORDER||Object.keys(catalog?.regions||{});const unlockedRegions=new Set(progression.unlockedRegions||[]);unlockedRegions.add(order[0]);if(grandfatherThrough>=0)for(let i=0;i<=Math.min(grandfatherThrough,order.length-1);i++)unlockedRegions.add(order[i]);for(let ri=0;ri<order.length;ri++){const regionId=order[ri],region=catalog?.regions?.[regionId];if(!region||!unlockedRegions.has(regionId))continue;const open=new Set(progression.unlockedAreas?.[regionId]||[]);if(region.areas[0])open.add(region.areas[0].id);if(grandfatherThrough>=ri){let furthest=0;for(let i=0;i<region.areas.length;i++)if((progression.areaCaught?.[region.areas[i].id]||[]).length)furthest=i;for(let i=0;i<=furthest;i++)open.add(region.areas[i].id);}for(let i=0;i<region.areas.length-1;i++)if(open.has(region.areas[i].id)&&progressForArea(progression,region.areas[i].id).complete)open.add(region.areas[i+1].id);progression.unlockedAreas[regionId]=region.areas.filter(a=>open.has(a.id)).map(a=>a.id);const allComplete=region.areas.every(a=>progressForArea(progression,a.id).complete),target=Math.max(1,Number(region.regionalTarget)||1);if(allComplete&&regionalCaught(progression,region).length>=target&&order[ri+1])unlockedRegions.add(order[ri+1]);}
 progression.unlockedRegions=order.filter(id=>unlockedRegions.has(id));for(const regionId of progression.unlockedRegions){const region=catalog.regions[regionId];if(region&&!progression.unlockedAreas[regionId]?.length)progression.unlockedAreas[regionId]=region.areas[0]?[region.areas[0].id]:[];}return progression;}
function migrateLegacyProgression(save,catalog){const s=ensureState(save),p=progressionDefault(catalog),L=locationsModule(),order=L?.REGION_ORDER||Object.keys(catalog?.regions||{}),bookIds=Object.entries(s.book?.pokemon||{}).filter(([,row])=>(Number(row?.count)||0)>0).map(([id])=>Number(id)).filter(Number.isFinite).sort((a,b)=>a-b);let highest=-1;for(const speciesId of bookIds){const native=regionKeyForId(speciesId),candidates=[];for(const regionId of order){const region=catalog?.regions?.[regionId];for(const area of region?.areas||[])if(area.pool?.some(row=>row.speciesId===speciesId))candidates.push({regionId,area});}candidates.sort((a,b)=>{const an=a.regionId===native?0:1,bn=b.regionId===native?0:1;return an-bn||order.indexOf(a.regionId)-order.indexOf(b.regionId)||a.area.order-b.area.order;});const chosen=candidates[0];if(!chosen)continue;p.areaCaught[chosen.area.id]=sortedUniqueIds([...(p.areaCaught[chosen.area.id]||[]),speciesId]);highest=Math.max(highest,order.indexOf(chosen.regionId));}
 p.migratedFromLegacy=true;recomputeUnlocks(p,catalog,{grandfatherThrough:highest});return p;}
function normalizeSelection(state,progression,catalog){const L=locationsModule(),order=L?.REGION_ORDER||Object.keys(catalog?.regions||{});let regionId=state.selectedRegion;if(!isRegionUnlocked(progression,regionId)){const wanted=Math.max(0,order.indexOf(regionId));regionId=[...progression.unlockedRegions].sort((a,b)=>order.indexOf(a)-order.indexOf(b)).filter(id=>order.indexOf(id)<=wanted).at(-1)||progression.unlockedRegions.at(-1)||order[0];state.selectedRegion=regionId;}const region=catalog?.regions?.[regionId],open=progression.unlockedAreas?.[regionId]||[];if(!region)return;const selected=state.selectedArea;if(!open.includes(selected)){const wanted=region.areas.findIndex(a=>a.id===selected);const eligible=region.areas.filter(a=>open.includes(a.id));state.selectedArea=(wanted>=0?eligible.filter(a=>a.order<=wanted).at(-1):eligible.at(-1))?.id||region.areas[0]?.id||null;}}
function ensureProgression(save,catalog){if(!catalog?.regions)throw new TypeError('Fishing progression requires catalogue.');const s=ensureState(save);let p;if(s.progression?.version===1)p=normalizeProgression(s.progression,catalog);else p=normalizeProgression(migrateLegacyProgression(save,catalog),catalog);recomputeUnlocks(p,catalog);s.progression=p;save.arcade.fishing=s;normalizeSelection(s,p,catalog);return p;}
function unlockRequirement(save,catalog,regionId,areaId){const s=ensureState(save),p=ensureProgression(save,catalog),L=locationsModule(),order=L?.REGION_ORDER||Object.keys(catalog.regions);if(regionId&&!isRegionUnlocked(p,regionId)){const i=order.indexOf(regionId),prev=catalog.regions[order[Math.max(0,i-1)]];return prev?`Complete all 4 ${prev.name} spots and log ${prev.regionalTarget} regional species.`:'Locked.';}if(regionId&&areaId&&!isAreaUnlocked(p,regionId,areaId)){const region=catalog.regions[regionId],i=region.areas.findIndex(a=>a.id===areaId),prev=region.areas[Math.max(0,i-1)],info=progressForArea(p,prev?.id);return prev?`Catch ${Math.max(0,3-info.uniqueCaught)} more distinct local species at ${prev.name}.`:'Locked.';}return'';}
function recordProgressionCatch(save,catalog,area,speciesId){const p=ensureProgression(save,catalog),result={changed:false};if(!area||!isAreaUnlocked(p,area.region,area.id)||!area.pool?.some(row=>row.speciesId===Number(speciesId)))return result;const beforeRegions=new Set(p.unlockedRegions),beforeAreas=new Set(p.unlockedAreas?.[area.region]||[]),ids=sortedUniqueIds([...(p.areaCaught[area.id]||[]),speciesId]);if(ids.length===(p.areaCaught[area.id]||[]).length)return result;p.areaCaught[area.id]=ids;result.changed=true;recomputeUnlocks(p,catalog);const afterAreas=p.unlockedAreas?.[area.region]||[];result.spotUnlocked=afterAreas.find(id=>!beforeAreas.has(id));result.regionUnlocked=p.unlockedRegions.find(id=>!beforeRegions.has(id));ensureState(save).progression=p;return result;}

function buy(save,type,id){const s=ensureState(save);if(type==='rod'){const row=RODS[id];if(!row)return{ok:false,reason:'unknown'};if(s.rods[id])return{ok:false,reason:'owned'};if(s.fishingTokens<row.price)return{ok:false,reason:'tokens'};s.fishingTokens-=row.price;s.rods[id]=true;return{ok:true,cost:row.price,quantity:1};}if(type==='bait'){const row=BAIT[id];if(!row)return{ok:false,reason:'unknown'};if(s.fishingTokens<row.price)return{ok:false,reason:'tokens'};s.fishingTokens-=row.price;s.bait[id]=(Number(s.bait[id])||0)+row.quantity;return{ok:true,cost:row.price,quantity:row.quantity};}return{ok:false,reason:'type'};}
function checkoutCart(save,lines){if(!Array.isArray(lines)||!lines.length)return{ok:false,reason:'empty'};const shadow=JSON.parse(JSON.stringify(save||{})),s=ensureState(shadow),normalized=[],seenRods=new Set();let cost=0,itemCount=0;for(const raw of lines){const type=raw?.type,id=raw?.id,quantity=Number(raw?.quantity);if(!Number.isInteger(quantity)||quantity<=0)return{ok:false,reason:'quantity'};if(type==='rod'){const row=RODS[id];if(!row)return{ok:false,reason:'unknown'};if(quantity!==1)return{ok:false,reason:'rod-quantity'};if(seenRods.has(id)||s.rods[id])return{ok:false,reason:'owned'};seenRods.add(id);cost+=row.price;itemCount+=1;normalized.push({type,id,quantity:1,row});}else if(type==='bait'){const row=BAIT[id];if(!row)return{ok:false,reason:'unknown'};cost+=row.price*quantity;itemCount+=quantity;normalized.push({type,id,quantity,row});}else return{ok:false,reason:'type'};}if(s.fishingTokens<cost)return{ok:false,reason:'tokens',cost};s.fishingTokens-=cost;for(const line of normalized){if(line.type==='rod')s.rods[line.id]=true;else s.bait[line.id]=(Number(s.bait[line.id])||0)+line.row.quantity*line.quantity;}const target=ensureState(save);target.fishingTokens=s.fishingTokens;target.rods={...s.rods};target.bait={...s.bait};return{ok:true,cost,itemCount,lineCount:normalized.length};}
function consumeBait(save,id){if(!id||id==='none')return true;const s=ensureState(save);if((s.bait[id]||0)<=0)return false;s.bait[id]-=1;return true;}
function treasureRewardLabel(c={}){const amount=Math.max(0,Math.round(Number(c.amount)||0));if(c.rewardKind==='coins')return`+${amount.toLocaleString('en-GB')} Lucky Coins`;if(c.rewardKind==='dust')return`+${amount.toLocaleString('en-GB')} Card Dust`;if(c.rewardKind==='tickets')return`+${amount.toLocaleString('en-GB')} Pack Ticket${amount===1?'':'s'}`;if(c.rewardKind==='pack')return c.name||'Sealed Booster';return c.name||'Treasure reward';}
function catchPayout(c={}){
 if(c.kind==='treasure')return{fishingTokens:Math.max(5,Math.round(Number(c.payoutTokens)||5)),luckyCoins:Math.max(2,Math.round(Number(c.payoutCoins)||2))};
 if(c.kind==='junk'){
  const value=Math.max(0,Number(c.value)||0);
  if(c.ultra)return{fishingTokens:Math.max(75,Math.round(value*.10)),luckyCoins:Math.max(500,Math.round(value))};
  if(c.easter)return{fishingTokens:Math.max(4,Math.min(20,Math.round(value*.35))),luckyCoins:Math.max(8,Math.min(75,Math.round(value*.75)))};
  return{fishingTokens:Math.max(1,Math.min(6,Math.round(value*.30))),luckyCoins:Math.max(1,Math.min(10,Math.round(value*.50)))};
 }
 const fishingTokens=Math.max(1,Math.round(Number(c.value)||1)),rarity=String(c.rarity||'common'),base=RARITY_COIN_BASE[rarity]||RARITY_COIN_BASE.common,ratio=Math.max(.5,Math.min(1.7,Number(c.sizeRatio)||1)),sizeFactor=Math.max(.72,Math.min(1.2,.85+(ratio-1)*.45)),jumboBonus=c.jumbo?1.35:1,scaledCoins=Math.max(1,Math.round(base*sizeFactor*jumboBonus)),luckyCoins=rarity==='common'?Math.min(fishingTokens,scaledCoins):scaledCoins;return{fishingTokens,luckyCoins};
}
function recordCatch(save,c,catalog=null,area=null){const s=ensureState(save);s.catches++;s.totalValue+=Number(c.value)||0;s.bestValue=Math.max(s.bestValue,Number(c.value)||0);if(c.kind==='pokemon'){s.pokemonCaught++;s.biggestRatio=Math.max(s.biggestRatio,Number(c.sizeRatio)||0);if(c.jumbo)s.jumboCaught++;if(c.tiny)s.tinyCaught++;if(['rare','very-rare','legendary'].includes(c.rarity))s.rareCaught++;const key=String(c.speciesId),old=s.book.pokemon[key]||{count:0,largestM:0,heaviestKg:0,bestValue:0};s.book.pokemon[key]={count:old.count+1,largestM:Math.max(old.largestM||0,c.lengthM||0),heaviestKg:Math.max(old.heaviestKg||0,c.weightKg||0),bestValue:Math.max(old.bestValue||0,c.value||0),rarity:c.rarity};}
 else if(c.kind==='junk'){s.junkCaught++;if(c.easter)s.easterJunk++;const old=s.book.junk[c.id]||{count:0};s.book.junk[c.id]={count:old.count+1,bestValue:Math.max(old.bestValue||0,c.value||0)};}
 else if(c.kind==='treasure'){s.treasuresCaught++;const old=s.book.treasure[c.id]||{count:0};s.book.treasure[c.id]={count:old.count+1};}
 if(c.kind==='pokemon'&&catalog&&area)recordProgressionCatch(save,catalog,area,c.speciesId);return ensureState(save);}
function startFight(catchItem,rod='old',seed=Date.now()){const rand=rng32(seed),zone=RODS[rod]?.zone||RODS.old.zone;return{catchItem,rod,fishY:.2+rand()*.6,fishV:(rand()-.5)*.5,zoneY:.32,zoneV:0,zoneSize:zone,progress:.18,timeMs:0,phase:'playing',seed,noise:rand()};}
function behaviorNoise(seed,index){let x=((Number(seed)||1)^(Math.imul((index|0)+1,0x9e3779b1)))>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return(x>>>0)/4294967296;}
function stepFight(run,{hold=false}={},dt=16){if(!run||run.phase!=='playing')return run;const sec=clamp(Number(dt)/1000,0,.1),d=Number(run.catchItem?.difficulty)||.3,behavior=run.catchItem?.behavior||'steady';run.timeMs+=dt;const t=run.timeMs,phase=run.noise*6.28318;let target=.5,response=3.2+d*4,direct=0,damping=.88;
 if(behavior==='steady'){target=.5+Math.sin(t*.00115+phase)*(.075+d*.055);response=2.4+d*2.8;damping=.91;}
 else if(behavior==='drift'){target=.5+Math.sin(t*.00155+phase)*(.19+d*.11);response=3.4+d*3.2;damping=.90;}
 else if(behavior==='flutter'){target=.5+Math.sin(t*.0058+phase)*(.17+d*.12)+Math.sin(t*.014+phase*.7)*(.045+d*.035);response=5.2+d*4.8;direct=.018+d*.012;damping=.84;}
 else if(behavior==='dart'){const seg=Math.floor(t/720),r=behaviorNoise(run.seed,seg);target=.08+r*.84;response=8+d*8;direct=.075+d*.035;damping=.72;}
 else if(behavior==='surge'){const seg=Math.floor(t/1500),p=(t%1500)/1500,r=behaviorNoise(run.seed,seg);const resting=.5+Math.sin(t*.0015+phase)*.11;target=p<.58?resting:(r>.5?.9:.1);response=p<.58?4:11+d*8;direct=p<.58?.006:.085+d*.035;damping=p<.58?.88:.70;}
 else if(behavior==='erratic'){const seg=Math.floor(t/330),r=behaviorNoise(run.seed,seg),r2=behaviorNoise(run.seed+9176,seg);target=.05+r*.90+Math.sin(t*.021+r2*5)*.055;response=11+d*10;direct=.105+d*.045;damping=.64;}
 target=clamp(target,.035,.965);if(direct)run.fishY=clamp(run.fishY+(target-run.fishY)*direct,.02,.98);run.fishV+=(target-run.fishY)*response*sec;run.fishV*=Math.pow(damping,dt/16);run.fishY=clamp(run.fishY+run.fishV*sec,.02,.98);
 const targetZoneV=hold?-1.05:.92,blend=Math.min(1,sec*30);run.zoneV+=(targetZoneV-run.zoneV)*blend;run.zoneY=clamp(run.zoneY+run.zoneV*sec,run.zoneSize/2,1-run.zoneSize/2);if(run.zoneY===run.zoneSize/2||run.zoneY===1-run.zoneSize/2)run.zoneV=0;const inside=Math.abs(run.fishY-run.zoneY)<=run.zoneSize/2;run.progress=clamp(run.progress+(inside?(0.30-d*.10):-(.145+d*.105))*sec,0,1);if(run.progress>=1)run.phase='caught';else if(run.progress<=0||run.timeMs>45000)run.phase='escaped';return run;}
return{REGION_DEFS,RODS,BAIT,JUNK,TREASURE,AREA_ART,buildCatalog,rarityFor,regionKeyForId,rodAllowsSpecies,createCatch,rollCatch,ensureState,ensureProgression,isRegionUnlocked,isAreaUnlocked,progressForArea,unlockRequirement,recordProgressionCatch,availableSpecies,buy,checkoutCart,consumeBait,treasureRewardLabel,catchPayout,recordCatch,startFight,stepFight};
});
