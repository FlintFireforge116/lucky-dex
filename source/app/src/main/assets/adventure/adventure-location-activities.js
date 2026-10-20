(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexAdventureActivities=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const WATER={
 kanto:new Set(['Pallet Town','Vermilion City','Route 19','Seafoam Islands','Cinnabar Island','Route 21']),
 johto:new Set(['Route 32','Union Cave','Route 40','Whirl Islands','Cianwood City','Cianwood shore','Olivine City','Lake of Rage','Dragon’s Den']),
 hoenn:new Set(['Route 106','Dewford Town','Slateport City','Route 110','Route 119','Route 124','Route 126','Sootopolis waters','Sootopolis City','Ever Grande waterfall','Ever Grande City'])
};
const slug=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function ensureState(save){if(!save||typeof save!=='object')throw new TypeError('Adventure activity state requires a save object.');if(!save.adventureActivities||typeof save.adventureActivities!=='object')save.adventureActivities={};const s=save.adventureActivities;if(!Number.isFinite(s.schema))s.schema=1;if(!s.helpSeen||typeof s.helpSeen!=='object'||Array.isArray(s.helpSeen))s.helpSeen={};if(!s.records||typeof s.records!=='object'||Array.isArray(s.records))s.records={};return s;}
function capabilitiesFor(place){if(!place||!place.region||!place.name||!WATER[place.region]?.has(place.name))return[];return[{type:'fish',rods:['old','good','super'],poolKey:`${place.region}-${slug(place.name)}`,repeatable:true,helpId:'fishing'}];}
function actionsFor(save,place){ensureState(save);return capabilitiesFor(place).map(c=>c.type==='fish'?{key:'fish',label:'FISH',activity:'fish'}:{key:c.type,label:String(c.type).toUpperCase(),activity:c.type});}
return{WATER,ensureState,capabilitiesFor,actionsFor};
});
