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
 old:{name:'Old Rod',price:0,zone:.28,rarity:0,difficulty:.04},
 good:{name:'Good Rod',price:2500,zone:.32,rarity:.12,difficulty:0},
 super:{name:'Super Rod',price:7500,zone:.36,rarity:.25,difficulty:-.04},
 deep:{name:'Deep Sea Rod',price:18000,zone:.40,rarity:.38,difficulty:-.08}
};
const BAIT={
 basic:{name:'Basic Bait',price:120,quantity:5,rare:.02,treasure:0,size:0},
 honey:{name:'Sweet Honey',price:350,quantity:5,rare:.09,treasure:0,size:.02},
 lure:{name:'Lure Ball Chum',price:700,quantity:4,rare:.16,treasure:.015,size:.04},
 pearl:{name:'Pearl Bait',price:1200,quantity:3,rare:.06,treasure:.08,size:.08}
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
 {id:'waterlogged-mail',name:'Waterlogged Mail',value:9,easter:true,desc:'The message is now just “...”'}
];
const TREASURE=[
 {id:'coin-pouch',name:'Washed-up Coin Pouch',rewardKind:'coins',amount:500,weight:34},
 {id:'stardust',name:'Stardust Cache',rewardKind:'dust',amount:80,weight:28},
 {id:'pack-ticket',name:'Pack Ticket',rewardKind:'tickets',amount:1,weight:20},
 {id:'sealed-pack',name:'Sealed Booster',rewardKind:'pack',amount:1,weight:10},
 {id:'big-dust',name:'Shimmering Dust Tin',rewardKind:'dust',amount:200,weight:5},
 {id:'ticket-pair',name:'Two Pack Tickets',rewardKind:'tickets',amount:2,weight:3}
];
const RARITY_VALUE={common:35,uncommon:75,rare:160,'very-rare':360,legendary:900};
const RARITY_DIFFICULTY={common:.26,uncommon:.38,rare:.54,'very-rare':.68,legendary:.82};
const RARITY_WEIGHT={common:1,uncommon:.58,rare:.28,'very-rare':.11,legendary:.025};
const RARITY_OVERRIDES={129:'common',349:'very-rare',369:'very-rare',131:'very-rare',147:'rare',148:'very-rare',170:'uncommon',171:'rare',223:'uncommon',224:'rare',320:'uncommon',321:'rare',318:'uncommon',319:'rare',350:'legendary',245:'legendary',382:'legendary',484:'legendary',647:'legendary',746:'uncommon',771:'rare',883:'very-rare',902:'very-rare',977:'very-rare'};
function clone(v){return JSON.parse(JSON.stringify(v));}
function slug(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function clamp(n,a=0,b=1){return Math.max(a,Math.min(b,Number(n)||0));}
function bst(p){return Object.values(p?.baseStats||{}).reduce((a,b)=>a+(Number(b)||0),0);}
function rarityFor(p){if(RARITY_OVERRIDES[p?.id])return RARITY_OVERRIDES[p.id];const total=bst(p);if(total>=570)return'legendary';if(total>=500)return'very-rare';if(total>=420)return'rare';if(total>=320)return'uncommon';return'common';}
function regionKeyForId(id){id=Number(id);for(const [key,,range] of REGION_DEFS)if(id>=range[0]&&id<=range[1])return key;return'paldea';}
function buildCatalog(speciesById={}){const regions={};for(const [key,name,range,areaNames] of REGION_DEFS){const species=Object.values(speciesById).filter(p=>p&&p.id>=range[0]&&p.id<=range[1]&&Array.isArray(p.types)&&p.types.includes('water')).map(p=>p.id).sort((a,b)=>a-b);const areas=areaNames.map((areaName,i)=>({id:`${key}-${slug(areaName)}`,name:areaName,region:key,species:[]}));species.forEach((id,i)=>{areas[i%areas.length].species.push(id);if(species.length>8&&i%3===0)areas[(i+1)%areas.length].species.push(id);});regions[key]={id:key,name,range,species,areas};}return{regions};}
function sizeRatioFromRoll(roll,forceJumbo=false){if(forceJumbo)return 1.35+clamp(roll)*.35;const r=clamp(roll);if(r<.02)return .52+r/.02*.12;if(r>.985)return 1.35+(r-.985)/.015*.28;return .68+r*.62;}
function createCatch({species,rolls={},rod='old',bait='none',forceJumbo=false}={}){if(!species)throw new TypeError('Fishing catch requires species.');const rarity=rarityFor(species),ratio=sizeRatioFromRoll(rolls.size??Math.random(),forceJumbo),lengthM=Math.max(.05,(Number(species.height)||.5)*ratio),weightKg=Math.max(.05,(Number(species.weight)||1)*Math.pow(ratio,2.6)),rodRule=RODS[rod]||RODS.old,baitRule=BAIT[bait]||{};const sizeMultiplier=.58+Math.pow(ratio,2)*.55,value=Math.max(5,Math.round((RARITY_VALUE[rarity]||35)*sizeMultiplier)),difficulty=clamp((RARITY_DIFFICULTY[rarity]||.3)+Math.min(.12,Math.max(0,weightKg-20)/450)+rodRule.difficulty-(baitRule.rare||0)*.18,.16,.94);return{kind:'pokemon',id:`pokemon-${species.id}`,speciesId:species.id,name:species.name,rarity,sizeRatio:ratio,lengthM:Number(lengthM.toFixed(2)),weightKg:Number(weightKg.toFixed(2)),value,difficulty,jumbo:ratio>=1.35,tiny:ratio<=.64};}
function rng32(seed){let x=(Number(seed)>>>0)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function weightedPick(items,weight,rand){let total=0;const rows=[];for(const item of items){const w=Math.max(0,Number(weight(item))||0);if(!w)continue;total+=w;rows.push([item,total]);}if(!rows.length)return items[0];const n=rand()*total;for(const [item,edge] of rows)if(n<=edge)return item;return rows.at(-1)[0];}
function settingsOdds(settings,key,fallback){const n=Number(settings?.[key]);return Number.isFinite(n)?clamp(n):fallback;}
function rollCatch({area,speciesById={},settings={},seed=Date.now(),rod='old',bait='none',forceKind=null}={}){if(!area)throw new TypeError('Fishing area required.');const rand=rng32(seed),baitRule=BAIT[bait]||{},rodRule=RODS[rod]||RODS.old;const treasureOdds=settingsOdds(settings,'fishingTreasure',.02)+(baitRule.treasure||0),easterOdds=settingsOdds(settings,'fishingEasterJunk',.01);let kind=forceKind;if(!kind){if(settingsOdds(settings,'fishingTreasure',.02)>=1)kind='treasure';else if(settingsOdds(settings,'fishingEasterJunk',.01)>=1)kind='junk-easter';else{const a=rand();if(a<treasureOdds)kind='treasure';else if(a<treasureOdds+easterOdds)kind='junk-easter';else if(a<treasureOdds+easterOdds+.12)kind='junk';else kind='pokemon';}}
 if(kind==='treasure'){const prize=weightedPick(TREASURE,x=>x.weight||1,rand);return{kind:'treasure',...prize,value:0,difficulty:.2};}
 if(kind==='junk'||kind==='junk-easter'){const pool=kind==='junk-easter'?JUNK.filter(x=>x.easter):JUNK.filter(x=>!x.ultra);const item=weightedPick(pool,x=>x.ultra?.08:x.easter?.55:1,rand);return{kind:'junk',...item,difficulty:.14};}
 const ids=(area.species||[]).filter(id=>speciesById[id]);let pool=ids.length?ids:Object.keys(speciesById).map(Number).filter(id=>speciesById[id]?.types?.includes('water'));const forceRare=rand()<settingsOdds(settings,'fishingRarePokemon',0);if(forceRare){const rarePool=pool.filter(id=>['rare','very-rare','legendary'].includes(rarityFor(speciesById[id])));if(rarePool.length)pool=rarePool;}const rarityBoost=(rodRule.rarity||0)+(baitRule.rare||0);const id=weightedPick(pool,id=>forceRare?1:Math.pow(RARITY_WEIGHT[rarityFor(speciesById[id])]||.2,Math.max(.35,1-rarityBoost)),rand);const forceJumbo=rand()<settingsOdds(settings,'fishingJumbo',.015);return createCatch({species:speciesById[id],rolls:{size:rand(),rarity:rand()},rod,bait,forceJumbo});}
function defaultState(){return{casts:0,catches:0,escaped:0,pokemonCaught:0,junkCaught:0,treasuresCaught:0,totalValue:0,bestValue:0,biggestRatio:0,jumboCaught:0,tinyCaught:0,rareCaught:0,easterJunk:0,treasurePrizes:0,selectedRegion:'kanto',selectedArea:null,selectedRod:'old',selectedBait:'none',rods:{old:true,good:false,super:false,deep:false},bait:{basic:0,honey:0,lure:0,pearl:0},book:{pokemon:{},junk:{},treasure:{}}};}
function ensureState(save){if(!save||typeof save!=='object')throw new TypeError('Fishing state requires save.');save.arcade=save.arcade&&typeof save.arcade==='object'?save.arcade:{};const d=defaultState(),src=save.arcade.fishing&&typeof save.arcade.fishing==='object'?save.arcade.fishing:{};const out={...d,...src,rods:{...d.rods,...(src.rods||{})},bait:{...d.bait,...(src.bait||{})},book:{pokemon:{...(src.book?.pokemon||{})},junk:{...(src.book?.junk||{})},treasure:{...(src.book?.treasure||{})}}};for(const k of ['casts','catches','escaped','pokemonCaught','junkCaught','treasuresCaught','totalValue','bestValue','biggestRatio','jumboCaught','tinyCaught','rareCaught','easterJunk','treasurePrizes'])out[k]=Math.max(0,Number(out[k])||0);save.arcade.fishing=out;save.profile=save.profile&&typeof save.profile==='object'?save.profile:{};save.profile.coins=Math.max(0,Number(save.profile.coins)||0);return out;}
function buy(save,type,id){const s=ensureState(save);if(type==='rod'){const row=RODS[id];if(!row)return{ok:false,reason:'unknown'};if(s.rods[id])return{ok:false,reason:'owned'};if(save.profile.coins<row.price)return{ok:false,reason:'coins'};save.profile.coins-=row.price;s.rods[id]=true;return{ok:true,cost:row.price,quantity:1};}if(type==='bait'){const row=BAIT[id];if(!row)return{ok:false,reason:'unknown'};if(save.profile.coins<row.price)return{ok:false,reason:'coins'};save.profile.coins-=row.price;s.bait[id]=(Number(s.bait[id])||0)+row.quantity;return{ok:true,cost:row.price,quantity:row.quantity};}return{ok:false,reason:'type'};}
function consumeBait(save,id){if(!id||id==='none')return true;const s=ensureState(save);if((s.bait[id]||0)<=0)return false;s.bait[id]-=1;return true;}
function recordCatch(save,c){const s=ensureState(save);s.catches++;s.totalValue+=Number(c.value)||0;s.bestValue=Math.max(s.bestValue,Number(c.value)||0);if(c.kind==='pokemon'){s.pokemonCaught++;s.biggestRatio=Math.max(s.biggestRatio,Number(c.sizeRatio)||0);if(c.jumbo)s.jumboCaught++;if(c.tiny)s.tinyCaught++;if(['rare','very-rare','legendary'].includes(c.rarity))s.rareCaught++;const key=String(c.speciesId),old=s.book.pokemon[key]||{count:0,largestM:0,heaviestKg:0,bestValue:0};s.book.pokemon[key]={count:old.count+1,largestM:Math.max(old.largestM||0,c.lengthM||0),heaviestKg:Math.max(old.heaviestKg||0,c.weightKg||0),bestValue:Math.max(old.bestValue||0,c.value||0),rarity:c.rarity};}
 else if(c.kind==='junk'){s.junkCaught++;if(c.easter)s.easterJunk++;const old=s.book.junk[c.id]||{count:0};s.book.junk[c.id]={count:old.count+1,bestValue:Math.max(old.bestValue||0,c.value||0)};}
 else if(c.kind==='treasure'){s.treasuresCaught++;const old=s.book.treasure[c.id]||{count:0};s.book.treasure[c.id]={count:old.count+1};}
 return s;}
function startFight(catchItem,rod='old',seed=Date.now()){const rand=rng32(seed),zone=RODS[rod]?.zone||RODS.old.zone;return{catchItem,rod,fishY:.2+rand()*.6,fishV:(rand()-.5)*.5,zoneY:.32,zoneV:0,zoneSize:zone,progress:.18,timeMs:0,phase:'playing',seed,noise:rand()};}
function stepFight(run,{hold=false}={},dt=16){if(!run||run.phase!=='playing')return run;const sec=clamp(Number(dt)/1000,0,.1),d=Number(run.catchItem?.difficulty)||.3;run.timeMs+=dt;const target=.5+Math.sin(run.timeMs*(.0016+d*.0018)+run.noise*8)*(.18+d*.2)+Math.sin(run.timeMs*.0063+run.noise*3)*d*.08;run.fishV+=(target-run.fishY)*(1.8+d*3.2)*sec;run.fishV*=Math.pow(.93,dt/16);run.fishY=clamp(run.fishY+run.fishV*sec,.02,.98);run.zoneV+=(hold?1.45:-1.25)*sec;run.zoneV*=Math.pow(.90,dt/16);run.zoneY=clamp(run.zoneY-run.zoneV*sec,run.zoneSize/2,1-run.zoneSize/2);if(run.zoneY===run.zoneSize/2||run.zoneY===1-run.zoneSize/2)run.zoneV*=.35;const inside=Math.abs(run.fishY-run.zoneY)<=run.zoneSize/2;run.progress=clamp(run.progress+(inside?(0.24-d*.075):-(.10+d*.07))*sec,0,1);if(run.progress>=1)run.phase='caught';else if(run.progress<=0||run.timeMs>45000)run.phase='escaped';return run;}
return{REGION_DEFS,RODS,BAIT,JUNK,TREASURE,buildCatalog,rarityFor,regionKeyForId,createCatch,rollCatch,ensureState,buy,consumeBait,recordCatch,startFight,stepFight};
});
