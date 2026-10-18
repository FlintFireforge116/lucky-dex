'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),cat=require('../app/src/main/assets/cosmetics-catalog-v0413.js'),core=require('../app/src/main/assets/cosmetics-core-v0413.js');
const legacy=['luckydex-default','luckydex-midnight','luckydex-cream','luckydex-pixel','kanto-red','johto-gold','hoenn-emerald','shiny-charm','kanto-dex','type-wheel','eras','shiny-tour','tcg-master','dual-binder','sealed-vault','first-ball','pocket-master','god-pack','dash-champion','museum-fossil','rock-solid','unown-code','link-cable','arcade-pass','oak-trio','eevee-spectrum','splash-school','voltorb-lost','golden-recipe','already-got-em'];
test('catalogue expands substantially with unique stable IDs and only four free sleeves',()=>{
 assert(cat.CATALOGUE.length>=200);assert.equal(new Set(cat.CATALOGUE.map(r=>r.id)).size,cat.CATALOGUE.length);for(const id of legacy)assert(cat.BY_ID[id],id);
 assert.deepEqual(core.normaliseCosmetics(null).unlockedSleeves,legacy.slice(0,4));
});
test('every sourced design is represented once including complete Pocket and physical enumeration',()=>{
 for(const family of ['pocket','physical']){const source=JSON.parse(fs.readFileSync(path.join(root,'scripts/data/sleeves-'+family+'-v0440.json'),'utf8')),designs=Array.isArray(source)?source:source.sleeves;assert(designs.length>50);for(const s of designs){const matches=cat.CATALOGUE.filter(r=>r.sourceId===s.id);assert.equal(matches.length,1,s.id);assert.equal(matches[0].artPath,s.artPath);}}
});
test('catalogue artwork is local, unique unless explicitly shared, and all rows have themed requirements',()=>{
 const hashes=new Map();for(const row of cat.CATALOGUE){assert.match(row.id,/^[a-z0-9-]+$/);assert.match(row.artPath,/^cosmetics\/sleeves\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.webp$/);const file=path.join(root,'app/src/main/assets',row.artPath);assert(fs.existsSync(file),row.id);const bytes=fs.readFileSync(file),hash=crypto.createHash('sha256').update(bytes).digest('hex');assert(bytes.length<250000,row.id+' oversized');if(hashes.has(hash))assert.equal(hashes.get(hash),row.artPath,'identical artwork should share the same file');hashes.set(hash,row.artPath);assert(['LuckyDex','Physical TCG','TCG Pocket'].includes(row.sourceFamily));assert(Array.isArray(row.themes)&&row.themes.length);if(!legacy.slice(0,4).includes(row.id))assert(row.sourceAchievementId||row.rewardGroup,row.id+' missing unlock');if(row.hidden){assert.equal(row.name,'???');assert.equal(row.unlockText,'');}}
});
test('v0.43.1 cosmetics ownership, equipped IDs, claims and unknown nested data survive',()=>{
 const state={profile:{coins:919,tickets:7,achievementClaims:[]},cosmetics:{unlockedSleeves:legacy,activeSleeve:'link-cable',claimedCosmeticRewards:['old:reward'],discoveredSecrets:['v0413_secret_eevee_family'],future:{sentinel:42}},goldenrod:{sentinel:'retain'},cards:{legacy:{sentinel:11}}};const before=JSON.stringify(state);core.ensureState(state);assert.equal(state.cosmetics.activeSleeve,'link-cable');assert.deepEqual(state.cosmetics.unlockedSleeves,legacy);assert.deepEqual(state.cosmetics.future,{sentinel:42});assert(state.cosmetics.claimedCosmeticRewards.includes('old:reward'));assert.equal(state.profile.coins,919);assert.equal(state.cards.legacy.sentinel,11);assert(core.activeSleeve(state).artPath);
 const pending=cat.CATALOGUE.find(r=>r.rewardGroup&&!r.hidden);assert(pending);assert.equal(core.equipSleeve({cosmetics:core.normaliseCosmetics(null)},pending.id).ok,false);
});
test('zero-count Pokémon entries are not evidence of current species ownership',()=>{
 const row=cat.CATALOGUE.find(r=>r.rewardGroup==='collection:species:384');assert(row);
 const state={pokemon:{'384:n':{id:384,count:0,types:['dragon','flying']}},cosmetics:core.normaliseCosmetics(null)};
 core.reconcile(state);assert(!state.cosmetics.unlockedSleeves.includes(row.id));
 state.pokemon['384:n'].count=1;core.reconcile(state);assert(state.cosmetics.unlockedSleeves.includes(row.id));
});
