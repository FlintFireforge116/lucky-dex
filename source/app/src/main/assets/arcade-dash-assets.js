(function(root){'use strict';
const catalog=root.LuckyDexDashGen3Manifest||(typeof require==='function'?require('./arcade-dash-gen3-manifest.js'):null);
const data=root.LuckyDexDashCourseData||(typeof require==='function'?require('./arcade-dash-course-data.js'):null);
const IMAGE_LIMIT=256;let pins=new Set();const cache=new Map(),loads=new Map(),ui=['shadow','player-ring','player-marker','finish'];
function descriptor(key){return catalog.sprites[key]||null;}
function spritePath(key){const d=descriptor(key);if(!d)throw new Error('Unknown Emerald Dash sprite: '+key);return d.path;}
function path(type,kind,name){const p=data.courseFor(type);if(kind==='objects')return spritePath(name==='stamina-pickup'?'oran-berry':name==='speed-pad'?p.boost.idle:name==='rock'?p.hazards.rock:name==='mud'?p.hazards.mud:name==='prop'?p.commonScenery[0]:'flowers');if(kind==='tiles')return spritePath(name.startsWith('road-')?p.path:name==='rim'?p.edge:p.ground);return 'arcade/dash/ui/'+name+'.png';}
function keysFor(type){const p=data.courseFor(type),keys=new Set([p.ground,p.path,p.edge,p.hazards.rock,p.hazards.mud,p.boost.idle,p.boost.active,'oran-berry','bridge-rail']);for(const s of p.sections){for(const key of [s.ground,s.path,s.edge,s.landmark,...(s.commonScenery||p.commonScenery),...(s.uncommonScenery||p.uncommonScenery)])if(key)keys.add(key)}for(const key of [...keys])for(const k of Object.keys(catalog.sprites))if(k.startsWith(key+'-')&&/^\d+$/.test(k.slice(key.length+1)))keys.add(k);return [...keys];}
function manifest(type='normal'){return [...new Set([...keysFor(type).map(spritePath),...ui.map(key=>'arcade/dash/ui/'+key+'.png')])];}
function imageFor(src){const img=cache.get(src);if(img){cache.delete(src);cache.set(src,img)}return img||null;}
function image(key){return imageFor(spritePath(key));}
function load(src){if(cache.has(src)){imageFor(src);return loads.get(src)||Promise.resolve(cache.get(src))}if(loads.has(src))return loads.get(src);const promise=new Promise((resolve,reject)=>{if(typeof Image==='undefined')return reject(new Error('Image loader unavailable'));const img=new Image();img.onload=()=>{cache.set(src,img);while(cache.size>IMAGE_LIMIT){const old=[...cache.keys()].find(key=>!pins.has(key));if(old==null)break;cache.delete(old);loads.delete(old)}resolve(img)};img.onerror=()=>{loads.delete(src);reject(new Error('Missing local Dash asset: '+src))};img.src=src;});loads.set(src,promise);return promise;}
function preload(type,racers=[]){pins=new Set([...manifest(type),...racers.map(r=>r.image)]);if(pins.size>IMAGE_LIMIT)return Promise.reject(new Error('Dash theme image budget exceeded'));return Promise.all([...pins].map(load));}
function release(){pins.clear();}
function cacheStats(){return {images:cache.size,loads:loads.size,imageLimit:IMAGE_LIMIT};}
const api={descriptor,spritePath,keysFor,path,manifest,imageFor,image,load,preload,cacheStats,release};root.LuckyDexDashAssets=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
