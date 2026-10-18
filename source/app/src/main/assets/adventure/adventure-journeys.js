(function(root){'use strict';
// Authored travel sections. Encounters and teams are sourced from adventure-regions.
const R=root.LuckyDexRegions||(typeof require==='function'?require('./adventure-regions.js'):null);
const routes={
 kanto:[
  [['Pallet Town','event'],['Route 1','wild'],['Viridian City','camp'],['Viridian Forest','trainer'],['Pewter City','gym']],
  [['Route 3','wild'],['Mt. Moon','trainer'],['Cerulean City','camp'],['Cerulean Gym','gym']],
  [['Nugget Bridge','trainer'],['Route 5','wild'],['Route 6','event'],['Vermilion City','camp'],['Vermilion Gym','gym']],
  [['Rock Tunnel','wild'],['Lavender Town','camp'],['Route 8','trainer'],['Celadon City','event'],['Celadon Gym','gym']],
  [['Cycling Road','trainer'],['Route 15','wild'],['Fuchsia City','camp'],['Fuchsia Gym','gym']],
  [['Pokémon Tower','wild'],['Lavender Town','event'],['Saffron City','camp'],['Saffron approach','trainer'],['Saffron Gym','gym']],
  [['Route 19','wild'],['Seafoam Islands','trainer'],['Cinnabar Island','camp'],['Pokémon Mansion','event'],['Cinnabar Gym','gym']],
  [['Route 21','wild'],['Pallet Town','camp'],['Route 22','trainer'],['Viridian City','event'],['Viridian Gym','gym']],
  [['Route 23','wild'],['Victory Road','victory-road'],['Indigo Plateau','camp']]
 ],
 johto:[
  [['New Bark Town','event'],['Route 29','wild'],['Cherrygrove City','camp'],['Sprout Tower','trainer'],['Violet Gym','gym']],
  [['Route 32','wild'],['Union Cave','trainer'],['Slowpoke Well','event'],['Azalea Town','camp'],['Azalea Gym','gym']],
  [['Ilex Forest','wild'],['Route 34','trainer'],['Goldenrod City','camp'],['Goldenrod Gym','gym']],
  [['Route 36','event'],['Route 37','wild'],['Burned Tower','trainer'],['Ecruteak City','camp'],['Ecruteak Gym','gym']],
  [['Route 38','trainer'],['Route 40','wild'],['Whirl Islands','event'],['Cianwood City','camp'],['Cianwood Gym','gym']],
  [['Cianwood shore','wild'],['Olivine Lighthouse','trainer'],['Olivine City','camp'],['Olivine Gym','gym']],
  [['Mt. Mortar','wild'],['Lake of Rage','trainer'],['Mahogany Town','camp'],['Mahogany Gym','gym']],
  [['Route 44','wild'],['Ice Path','trainer'],['Blackthorn City','camp'],['Dragon’s Den','event'],['Blackthorn Gym','gym']],
  [['Route 45','wild'],['Victory Road','victory-road'],['Indigo Plateau','camp']]
 ],
 hoenn:[
  [['Littleroot Town','event'],['Route 101','wild'],['Petalburg City','camp'],['Petalburg Woods','trainer'],['Rustboro Gym','gym']],
  [['Route 106','wild'],['Granite Cave','trainer'],['Dewford Town','camp'],['Dewford Gym','gym']],
  [['Slateport City','event'],['Route 110','wild'],['Cycling Road approach','trainer'],['Mauville City','camp'],['Mauville Gym','gym']],
  [['Route 111','wild'],['Fiery Path','trainer'],['Mt. Chimney','event'],['Lavaridge Town','camp'],['Lavaridge Gym','gym']],
  [['Route 112','wild'],['Rusturf Tunnel','trainer'],['Petalburg City','camp'],['Petalburg Gym','gym']],
  [['Route 119','wild'],['Weather Institute','trainer'],['Route 120','event'],['Fortree City','camp'],['Fortree Gym','gym']],
  [['Route 121','wild'],['Mt. Pyre','trainer'],['Lilycove City','camp'],['Mossdeep City','event'],['Mossdeep Gym','gym']],
  [['Route 124','wild'],['Route 126','trainer'],['Sootopolis waters','event'],['Sootopolis City','camp'],['Sootopolis Gym','gym']],
  [['Ever Grande waterfall','wild'],['Victory Road','victory-road'],['Ever Grande City','camp']]
 ]
};
const journeys={};
for(const id of Object.keys(routes))journeys[id]={id,chapters:routes[id].map((rows,index)=>({id:`${id}-chapter-${index}`,index,title:index<8?`The road to ${R.regions[id].gyms[index].city}`:'The road to the Pokémon League',sections:rows.map(([name,type],sectionIndex)=>({id:`${id}-c${index}-s${sectionIndex}`,name,type,sectionIndex,detours:sectionIndex===0?[{id:`${id}-c${index}-supplies`,name:`${name} supply stop`,type:'cache',optional:true},{id:`${id}-c${index}-hunt`,name:`${name} Wild Hunt`,type:'wild-hunt',optional:true}]:sectionIndex===1?[{id:`${id}-c${index}-rare`,name:`${name} rare sighting`,type:'rare',optional:true}]:[]}))}))};
const events={
 'Pallet Town':{title:'First steps from Pallet',text:'The road to Pewter begins on Route 1. A local guide offers a quiet rest before you leave, while a nearby path may hold supplies.',safeLabel:'Prepare with the guide',riskLabel:'Search the nearby path'},
 'New Bark Town':{title:'The Violet City road',text:'Route 29 leads towards Cherrygrove and Violet City. Check your partners with a local guide, or explore a nearby patch for supplies.',safeLabel:'Prepare with the guide',riskLabel:'Explore before leaving'},
 'Littleroot Town':{title:'The Rustboro journey',text:'Follow Route 101 towards Petalburg and the woods beyond. A local guide offers a rest, while a nearby path may have useful supplies.',safeLabel:'Prepare with the guide',riskLabel:'Search the nearby path'},
 'Mt. Chimney':R.regions.hoenn.stages[3].event,
 'Sootopolis waters':R.regions.hoenn.stages[7].event,
 'Route 120':R.regions.hoenn.stages[5].event
};
for(const data of Object.values(journeys))for(const ch of data.chapters)for(const section of ch.sections){
 if(section.type==='event')section.event=events[section.name]||{title:`${section.name} travel advice`,text:`A local guide at ${section.name} offers a rest and advice for the next destination. An optional side path may contain supplies, but the crossing is rough.`,safeLabel:'Rest with the guide',riskLabel:'Explore the side path'};
 if(section.type==='camp'&&[1,3,5,8].includes(ch.index))section.detours.push({id:`${data.id}-c${ch.index}-merchant`,name:`${section.name} travelling merchant`,type:'shop',optional:true});
}
const api={journeys,order:Object.keys(journeys),get:id=>journeys[id]||null};root.LuckyDexJourneys=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
