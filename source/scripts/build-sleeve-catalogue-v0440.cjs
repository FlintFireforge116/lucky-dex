'use strict';
// Content compiler only. The existing v0413 registry remains the single runtime owner.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),assets=path.join(ROOT,'app/src/main/assets');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const rows=d=>Array.isArray(d)?d:d.sleeves;
const legacy=read('scripts/data/sleeves-legacy-v0431.json');
const physical=rows(read('scripts/data/sleeves-physical-v0440.json')),pocket=rows(read('scripts/data/sleeves-pocket-v0440.json'));
const originalArt=rows(read('scripts/data/sleeves-original-v0440.json'));
const imageSources=Object.fromEntries([...physical,...pocket,...originalArt].map(r=>[r.artPath,r]));
const species=require('../app/src/main/assets/adventure/adventure-species.js').byId;
const norm=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const generations=[[1,151,'Kanto'],[152,251,'Johto'],[252,386,'Hoenn'],[387,493,'Sinnoh'],[494,649,'Unova'],[650,721,'Kalos'],[722,809,'Alola'],[810,905,'Galar'],[906,1025,'Paldea']];
const legendary=new Set([144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,772,773,785,786,787,788,789,790,791,792,800,801,802,807,808,809,888,889,890,891,892,893,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1009,1010,1024,1025]);
const familyGroups={1:[1,2,3],2:[1,2,3],3:[1,2,3],4:[4,5,6],5:[4,5,6],6:[4,5,6],7:[7,8,9],8:[7,8,9],9:[7,8,9],25:[25,26],26:[25,26],133:[133,134,135],134:[133,134,135],135:[133,134,135],136:[133,134,136],196:[133,196,197],197:[133,196,197],470:[133,470,471],471:[133,470,471],700:[133,700],152:[152,153,154],155:[155,156,157],158:[158,159,160],252:[252,253,254],254:[252,253,254],255:[255,256,257],257:[255,256,257],258:[258,259,260],387:[387,388,389],390:[390,391,392],393:[393,394,395],501:[501,502,503],653:[653,654,655],658:[656,657,658],722:[722,723,724],816:[816,817,818],906:[906,907,908]};
const title=s=>String(s).replace(/(^|[-\s])\w/g,c=>c.toUpperCase()).replace(/-/g,' ');
function enrich(row){const text=' '+norm(row.name)+' ';const ids=[...new Set([...(row.pokemonIds||[]),...Object.values(species).filter(p=>text.includes(' '+norm(p.name)+' ')).map(p=>p.id)])];
 const subjectTypes=/galarian rapidash/.test(text)?['psychic','fairy']:/alolan vulpix/.test(text)?['ice']:/mega charizard x/.test(text)?['fire','dragon']:/mega gyarados/.test(text)?['water','dark']:/mega altaria/.test(text)?['dragon','fairy']:/mega sceptile/.test(text)?['grass','dragon']:/ultra necrozma/.test(text)?['psychic','dragon']:[...new Set(ids.flatMap(id=>species[id]?.types||[]))];
 const themes=new Set((row.themes||[]).map(t=>({'tcg-pocket':'TCG Pocket','team-rocket':'Team Rocket','special-art':'Events','special-set':'TCG','pokemon':'Pokémon','trainers':'Trainers','mega':'Mega Evolution','shiny':'Shiny'}[t]||title(t))));
 for(const type of subjectTypes)themes.add(title(type));
 for(const id of ids){const p=species[id];if(!p)continue;themes.add(generations.find(g=>id>=g[0]&&id<=g[1])[2]);if(legendary.has(id))themes.add('Legendary / Mythical');if([133,134,135,136,196,197,470,471,700].includes(id))themes.add('Eevee');}
 for(const [pattern,theme]of [[/team rocket/i,'Team Rocket'],[/shiny/i,'Shiny'],[/celebration|festival|party/i,'Events'],[/trainer|oak|cynthia|lillie|iono|arven|elesa|serena|may|gladion|acerola|erika|red and/i,'Trainers']])if(pattern.test(row.name))themes.add(theme);
 for(const [, ,region]of generations)if(text.includes(' '+region.toLowerCase()+' '))themes.add(region);
 if(/galarian/.test(text))themes.add('Galar');if(/alolan/.test(text))themes.add('Alola');
 return {...row,pokemonIds:ids,subjectTypes,themes:[...themes].filter(t=>!['Pokémon','Tcg Pocket','Tcg','Physical Tcg'].includes(t))};}
const official=[...physical,...pocket].map(enrich),bySource=Object.fromEntries(official.map(r=>[r.id,r]));
// These are data replacements, not save aliases: every old ID and achievement binding stays intact.
const replacements={
 'kanto-red':'pocket-red-and-pikachu','johto-gold':'physical-johto-explore-pokemon-premium','hoenn-emerald':'physical-hoenn-explore-pokemon-premium',
 'kanto-dex':'physical-kanto-explore-pokemon-premium','type-wheel':'physical-elemental-types','eras':'physical-pokemon-30th-celebration','shiny-tour':'pocket-shiny-mewtwo',
 'tcg-master':'physical-pokemon-celebration-black','dual-binder':'pocket-gardevoir','sealed-vault':'physical-mewtwo-and-mew-dna','first-ball':'pocket-pikachu',
 'pocket-master':'pocket-special-set-01','god-pack':'pocket-shiny-mega-gengar','dash-champion':'pocket-mega-lucario','rock-solid':'pocket-tyranitar','unown-code':'pocket-darkrai','link-cable':'pocket-espeon-umbreon',
 'oak-trio':'pocket-professor-oak','eevee-spectrum':'pocket-eevee-ver-2','splash-school':'pocket-psyduck','voltorb-lost':'pocket-sableye','already-got-em':'pocket-quagsire-clodsire'
};
const originals={
 'luckydex-default':{name:'LuckyDex Default',themes:['Pokédex','Kanto']},'luckydex-midnight':{name:'LuckyDex Midnight',themes:['Johto','Legendary / Mythical']},'luckydex-cream':{name:'LuckyDex Field Notes',themes:['Kanto','Trainers']},'luckydex-pixel':{name:'LuckyDex Pixel',themes:['Kanto','Pixel']},
 'arcade-pass':{name:'Arcade Champion',themes:['Arcade','Electric']},'museum-fossil':{name:'Fossil Museum',themes:['Fossils','Arcade']},'shiny-charm':{name:'Shiny Celebration',themes:['Shiny']},'golden-recipe':{name:'Berry Festival',themes:['Berries','Arcade']},
 'goldenrod-champion':{name:'Goldenrod Champion',themes:['Goldenrod','Arcade'],rewardGroup:'goldenrod:master-gold'},'adventure-passport':{name:'Adventure Passport',themes:['Adventure','Kanto','Johto','Hoenn'],rewardGroup:'region:kanto'}
};
const trainers={elesa:'goldenrod:type:electric',iono:'goldenrod:type:electric',cynthia:'goldenrod:type:ground',serena:'goldenrod:division-gold',arven:'tcgp:sets:1',may:'region:hoenn',lillie:'tcgp:sets:5',gladion:'goldenrod:type:dark',acerola:'goldenrod:type:ghost',erika:'goldenrod:type:grass'};
function candidates(row,index){const n=norm(row.name),ids=row.pokemonIds,type=row.subjectTypes?.[0],out=[];
 if(/explore pokemon/.test(n)){const region=generations.find(g=>n.includes(g[2].toLowerCase()));if(region)out.push(['Kanto','Johto','Hoenn'].includes(region[2])?'region:'+region[2].toLowerCase():'dex:'+(generations.indexOf(region)+1));}
 if(/shiny/.test(n))out.push('shiny:10','shiny:25','shiny:1');
 for(const [name,group]of Object.entries(trainers))if(new RegExp('(^| )'+name+'( |$)').test(n))out.push(group);
 if(/team rocket/.test(n))out.push('goldenrod:division-gold','packs:250');
 if(/pixel|game corner|battle start/.test(n))out.push('arcade:sampler:8','goldenrod:podium');
 if(/tyrunt|fossil|diglett/.test(n))out.push('arcade:museum:20');
 if(/powerhouse|focused fighter/.test(n))out.push('arcade:impact-clear');
 if(ids.length>1&&ids.length<=3)out.push('collection:family:'+ids.join('-'));
 for(const id of ids){if(familyGroups[id])out.push('collection:family:'+familyGroups[id].join('-'));else if(legendary.has(id))out.push('collection:species:'+id);}
 if(type)out.push('goldenrod:type:'+type,'type:'+type);
 const source=row.sourceFamily==='TCG Pocket'?'tcgp':'tcg';out.push(source+':sets:1',source+':sets:5',source+':sets:10','packs:50','packs:250');
 return [...new Set(out)];}
function requirement(group){const p=group.split(':');if(p[0]==='region')return 'Clear '+title(p[1])+' Regional Adventure.';if(p[0]==='dex')return 'Complete the '+generations[Number(p[1])-1][2]+' Pokédex.';if(p[0]==='collection')return p[1]==='species'?'Own '+species[p[2]].name+'.':'Own '+p[2].split('-').map(id=>species[id].name).join(', ')+'.';if(p[0]==='type')return 'Own 10 distinct '+title(p[1])+'-type Pokémon.';if(p[0]==='shiny')return 'Catch '+p[1]+' shiny Pokémon.';if(p[0]==='goldenrod')return p[1]==='type'?'Win a '+title(p[2])+' Type Cup gold trophy.':p[1]==='master-gold'?'Win a Goldenrod Master Division gold trophy.':p[1]==='division-gold'?'Win a Goldenrod Division Cup gold trophy.':'Earn a Goldenrod podium trophy.';if(p[1]==='sets')return 'Complete '+p[2]+' '+(p[0]==='tcgp'?'TCG Pocket':'physical TCG')+' set'+(p[2]==='1'?'':'s')+'.';if(p[0]==='packs')return 'Open '+p[1]+' booster packs.';if(group==='arcade:museum:20')return 'Discover 20 museum exhibits.';if(group==='arcade:impact-clear')return 'Complete an Impact Trial full clear.';if(group==='arcade:sampler:8')return 'Record results in eight Arcade games.';throw Error('Missing requirement '+group);}
const assigned=new Set(),groups=new Map(),result=[];
for(const old of legacy){const original=originals[old.id];let row;if(original)row={...old,...original,name:old.hidden?'???':original.name,realName:original.name,sourceFamily:'LuckyDex',themes:original.themes,artPath:`cosmetics/sleeves/${old.id}.webp`,sourceId:old.id};else{const source=bySource[replacements[old.id]];if(!source)throw Error('Missing official replacement '+old.id);assigned.add(source.id);row={...old,...source,id:old.id,sourceId:source.id,realName:source.name,name:old.hidden?'???':source.name,hidden:old.hidden,sourceAchievementId:old.sourceAchievementId,unlockText:old.unlockText,category:old.category,tier:old.tier};}result.push(row);}
for(const row of official){if(assigned.has(row.id))continue;const choices=candidates(row),group=choices.find(g=>(groups.get(g)||0)<5)||choices.reduce((best,g)=>(groups.get(g)||0)<(groups.get(best)||0)?g:best,choices[0]);groups.set(group,(groups.get(group)||0)+1);result.push({...row,sourceId:row.id,category:row.sourceFamily==='TCG Pocket'?'tcgp':'tcg',tier:row.themes.includes('Shiny')||row.themes.includes('Legendary / Mythical')?'epic':'rare',realName:row.name,hidden:false,sourceAchievementId:null,rewardGroup:group,unlockText:requirement(group)});}
for(const id of ['goldenrod-champion','adventure-passport'])result.push({id,...originals[id],realName:originals[id].name,sourceId:id,sourceFamily:'LuckyDex',category:'events',tier:'epic',hidden:false,sourceAchievementId:null,artPath:`cosmetics/sleeves/${id}.webp`,unlockText:requirement(originals[id].rewardGroup)});
const coverage={physicalDesigns:physical.length,pocketDesigns:pocket.length,luckydexOriginals:Object.keys(originals).length,total:result.length,legacyIds:legacy.map(r=>r.id)};
const code=`/* Generated by scripts/build-sleeve-catalogue-v0440.cjs. Existing stable registry owner. */\n(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports){module.exports=api;return;}root.LuckyDexCosmeticsCatalogV0413=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';\nconst CATALOGUE=${JSON.stringify(result,null,2)};\nconst BY_ID=Object.fromEntries(CATALOGUE.map(x=>[x.id,x]));return {CATALOGUE,BY_ID,SOURCE_COVERAGE:${JSON.stringify(coverage)}};\n});\n`;
fs.writeFileSync(path.join(assets,'cosmetics-catalog-v0413.js'),code);
const manifest={version:'0.44.0',coverage,sleeves:result.map(r=>{const file=path.join(assets,r.artPath),image=imageSources[r.artPath]||{};return {id:r.id,name:r.name,sourceId:r.sourceId,sourceFamily:r.sourceFamily,artPath:r.artPath,referenceUrl:r.referenceUrl||'docs/LUCKYDEX_ORIGINALS_v0440.md',rewardGroup:r.rewardGroup||null,sourceAchievementId:r.sourceAchievementId||null,width:image.width,height:image.height,...(fs.existsSync(file)?{sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),bytes:fs.statSync(file).size}:{missing:true})};})};
fs.writeFileSync(path.join(assets,'cosmetics/sleeves/manifest-v0440.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(ROOT,'scripts/data/sleeves-unlock-groups-v0440.json'),JSON.stringify(Object.fromEntries([...groups].sort()),null,2)+'\n');
console.log(JSON.stringify(coverage));console.log('Grouped designs',groups.size,'max per new group',Math.max(...groups.values()));
