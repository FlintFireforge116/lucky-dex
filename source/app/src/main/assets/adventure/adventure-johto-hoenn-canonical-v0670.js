(function(root){'use strict';
const BASE='https://archives.bulbagarden.net/wiki/Special:Redirect/file/';
const remote=file=>BASE+encodeURIComponent(String(file).replace(/ /g,'_'));
const slug=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const JOHTO_FILES={
'New Bark Town':'New Bark Town HGSS.png','Route 29':'Johto Route 29 HGSS.png','Cherrygrove City':'Cherrygrove City HGSS.png','Sprout Tower':'Sprout Tower 1F HGSS.png','Violet Gym':'Violet Gym HGSS.png','Route 32':'Johto Route 32 HGSS.png','Union Cave':'Union Cave 1F HGSS.png','Slowpoke Well':'Slowpoke Well B1F HGSS.png','Azalea Town':'Azalea Town HGSS.png','Azalea Gym':'Azalea Gym HGSS.png','Ilex Forest':'Ilex Forest HGSS.png','Route 34':'Johto Route 34 HGSS.png','Goldenrod City':'Goldenrod City HGSS.png','Goldenrod Gym':'Goldenrod Gym HGSS.png','Route 36':'Johto Route 36 HGSS.png','Route 37':'Johto Route 37 HGSS.png','Burned Tower':'Burned Tower 1F HGSS.png','Ecruteak City':'Ecruteak City HGSS.png','Ecruteak Gym':'Ecruteak Gym HGSS.png','Route 38':'Johto Route 38 HGSS.png','Route 40':'Johto Route 40 HGSS.png','Whirl Islands':'Whirl Islands 1F HGSS.png','Cianwood City':'Cianwood City HGSS.png','Cianwood Gym':'Cianwood Gym HGSS.png','Cianwood shore':'Cianwood City HGSS.png','Olivine Lighthouse':'Olivine Lighthouse 1F HGSS.png','Olivine City':'Olivine City HGSS.png','Olivine Gym':'Olivine Gym HGSS.png','Mt. Mortar':'Mt Mortar 1F Entrance HGSS.png','Lake of Rage':'Lake of Rage HGSS.png','Mahogany Town':'Mahogany Town HGSS.png','Mahogany Gym':'Mahogany Gym HGSS.png','Route 44':'Johto Route 44 HGSS.png','Ice Path':'Ice Path 1F HGSS.png','Blackthorn City':'Blackthorn City HGSS.png','Dragon’s Den':'Dragons Den 1F HGSS.png','Blackthorn Gym':'Blackthorn Gym HGSS.png','Route 45':'Johto Route 45 HGSS.png','Victory Road':'Victory Road 1F HGSS.png','Indigo Plateau':'Indigo Plateau HGSS.png'};
const HOENN_FILES={
'Littleroot Town':'Littleroot Town E.png','Route 101':'Hoenn Route 101 E.png','Petalburg City':'Petalburg City E.png','Petalburg Woods':'Petalburg Woods E.png','Rustboro Gym':'Rustboro Gym RS.png','Route 106':'Hoenn Route 106 E.png','Granite Cave':'Granite Cave 1F E.png','Dewford Town':'Dewford Town E.png','Dewford Gym':'Dewford Gym RS.png','Slateport City':'Slateport City E.png','Route 110':'Hoenn Route 110 E.png','Cycling Road approach':'Hoenn Route 110 E.png','Mauville City':'Mauville City E.png','Mauville Gym':'Mauville Gym RS.png','Route 111':'Hoenn Route 111 E.png','Fiery Path':'Fiery Path E.png','Mt. Chimney':'Mt Chimney E.png','Lavaridge Town':'Lavaridge Town E.png','Lavaridge Gym':'Lavaridge Gym RS.png','Route 112':'Hoenn Route 112 E.png','Rusturf Tunnel':'Rusturf Tunnel E.png','Petalburg Gym':'Petalburg Gym E.png','Route 119':'Hoenn Route 119 E.png','Weather Institute':'Weather Institute 1F E.png','Route 120':'Hoenn Route 120 E.png','Fortree City':'Fortree City E.png','Fortree Gym':'Fortree Gym E.png','Route 121':'Hoenn Route 121 E.png','Mt. Pyre':'Mt Pyre exterior E.png','Lilycove City':'Lilycove City E.png','Mossdeep City':'Mossdeep City E.png','Mossdeep Gym':'Mossdeep Gym E.png','Route 124':'Hoenn Route 124 E.png','Route 126':'Hoenn Route 126 E.png','Sootopolis waters':'Hoenn Route 126 E.png','Sootopolis City':'Sootopolis City E.png','Sootopolis Gym':'Sootopolis Gym E.png','Ever Grande waterfall':'Ever Grande City E.png','Victory Road':'Victory Road 1F E.png','Ever Grande City':'Ever Grande City E.png'};
const KIND={
 forest:new Set(['Ilex Forest','Petalburg Woods']),
 cave:new Set(['Union Cave','Slowpoke Well','Whirl Islands','Mt. Mortar','Ice Path','Dragon’s Den','Granite Cave','Fiery Path','Rusturf Tunnel','Victory Road']),
 tower:new Set(['Sprout Tower','Burned Tower','Olivine Lighthouse','Weather Institute']),
 coast:new Set(['Route 40','Cianwood shore','Lake of Rage','Route 106','Route 124','Route 126','Sootopolis waters','Ever Grande waterfall']),
 mountain:new Set(['Mt. Chimney','Mt. Pyre']),
 league:new Set(['Indigo Plateau','Ever Grande City'])
};
function fallbackKind(name){if(/Gym$/.test(name))return'gym';for(const [kind,names] of Object.entries(KIND))if(names.has(name))return kind;if(/Town$/.test(name))return'town';if(/City$/.test(name))return'city';return'route';}
const row=(region,name,file)=>({file,path:remote(file),width:800,height:600,displayAspect:'4/3',playerMarker:true,fallbackKey:`${region}-${fallbackKind(name)}`,canonicalMapScreenshot:true,source:region==='johto'?'Pokémon HeartGold / SoulSilver map':'Pokémon Emerald map'});
const JOHTO_MAPS=Object.fromEntries(Object.entries(JOHTO_FILES).map(([name,file])=>[name,row('johto',name,file)]));
const HOENN_MAPS=Object.fromEntries(Object.entries(HOENN_FILES).map(([name,file])=>[name,row('hoenn',name,file)]));
const REGION_MAPS={
 johto:{id:'johto-canonical-region-map',file:'JohtoMap.png',path:remote('JohtoMap.png'),width:1961,height:1316,displayAspect:'4/3',source:'Pokémon HeartGold / SoulSilver region map',fallbackKey:'johto-city'},
 hoenn:{id:'hoenn-canonical-region-map',file:'Hoenn ORAS.png',path:remote('Hoenn ORAS.png'),width:1250,height:884,displayAspect:'4/3',source:'Pokémon Omega Ruby / Alpha Sapphire region map',fallbackKey:'hoenn-city'}
};
function install(catalog){
 if(!catalog||typeof catalog!=='object')return catalog;
 catalog.scenes=catalog.scenes||{};catalog.named=catalog.named||{};catalog.places=catalog.places||{};
 for(const [region,maps] of Object.entries({johto:JOHTO_MAPS,hoenn:HOENN_MAPS})){
  catalog.named[region]=catalog.named[region]||{};
  for(const [name,data] of Object.entries(maps)){
   const id=`${region}-canonical-${slug(name)}`,prior=catalog.scenes[catalog.named[region][name]],previous=prior?.kind==='canonical-map'?null:prior,fallback=catalog.scenes[data.fallbackKey];
   catalog.scenes[id]={id,region,kind:'canonical-map',...data,fallbackPath:previous?.path||fallback?.path||`adventure/location-scenes/${region}-route.png`};
   catalog.named[region][name]=id;catalog.places[`${region}-${slug(name)}`]=id;
  }
  const map=REGION_MAPS[region],fallback=catalog.scenes[map.fallbackKey];catalog.scenes[map.id]={...map,fallbackPath:fallback?.path||`adventure/location-scenes/${region}-city.png`};
 }
 return catalog;
}
const api={JOHTO_MAPS,HOENN_MAPS,REGION_MAPS,install};
if(root?.LuckyDexLocationScenes)install(root.LuckyDexLocationScenes);
if(root?.LuckyDexAdventureLocationScenes&&root.LuckyDexAdventureLocationScenes!==root.LuckyDexLocationScenes)install(root.LuckyDexAdventureLocationScenes);
root.LuckyDexJohtoHoennCanonicalV0670=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
