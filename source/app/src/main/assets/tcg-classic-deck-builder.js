(function(root,factory){
 const classic=typeof module==='object'&&module.exports?require('./tcg-classic-battle-data.js'):root.LuckyDexClassicTCGBattleData;
 const decks=typeof module==='object'&&module.exports?require('./tcg-classic-decks.js'):root.LuckyDexClassicTCGDecks;
 const synergy=typeof module==='object'&&module.exports?require('./tcg-deck-synergy.js'):root.LuckyDexDeckSynergy;
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(classic,decks,synergy,fx);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGDeckBuilder=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(classic,decks,synergy,fx){
'use strict';
if(!classic||!decks)throw new Error('Classic TCG deck builder dependencies are missing.');
const CODE_TO_TYPE=Object.freeze(Object.fromEntries(Object.entries(classic.ENERGY_CODE||{}).map(([type,code])=>[code,type])));
const STAPLES=Object.freeze([
 ['base1-91',2], // Bill — conservative in compact 30-card decks
 ['base1-88',1], // Professor Oak — draw 7 is extremely costly in 30 cards
 ['base1-71',1], // Computer Search
 ['base1-77',2], // Pokemon Trader
 ['base1-95',2], // Switch
 ['base1-93',2], // Gust of Wind
 ['base1-92',2], // Energy Removal
 ['base1-84',2], // PlusPower
 ['base1-79',1], // Super Energy Removal
 ['base1-78',1], // Scoop Up
 ['base1-80',1], // Defender
 ['base1-94',2], // Potion
 ['base1-81',1], // Energy Retrieval
 ['base1-90',1], // Super Potion
 ['base1-82',1], // Full Heal
 ['base1-89',1], // Revive
 ['base1-83',1], // Maintenance
 ['base1-87',1]  // Pokedex
]);
const SET_IDS=Object.freeze(['base1','base2','base3','base5','gym1','gym2','neo1','neo2','neo3','neo4','base6','ecard1','ecard2','ecard3','ex1','ex2','ex3','ex4','ex5','ex6','ex7','ex8','ex9','ex10','ex11','ex12','ex13','ex14','ex15','ex16','dp1','dp2','dp3','dp4','dp5','dp6','dp7','pl1','pl2','pl3','pl4','hgss1','hgss2','hgss3','hgss4','col1','bw1','bw2','bw3','bw4','bw5','bw6','bw7','bw8','bw9','bw10','bw11','xy1','xy2','xy3','xy4','xy5','xy6','xy7','xy8','xy9','xy10','xy11','xy12','sm1','sm2','sm3','sm4','sm5','sm6','sm7','sm75','sm8','sm9','det1','sm10','sm11','sm115','sma','sm12','swsh1','swsh2','swsh3','swsh35','swsh4','SNAPFLORIO','SNAPFOUNJA','sv1']);
// Darkness and Metal are already Basic Energy types. Deduplicate before rendering
// archetype chips so each energy type has exactly one toggle.
// Dragon is a Pokémon type, never a Basic Energy type. Include it as an
// archetype choice; actual deck Energy comes from each Dragon's printed costs.
const ARCHETYPE_TYPES=Object.freeze([...new Set([...decks.ENERGY_TYPES,'Colorless','Dragon'])]);
const STAGE_RANK=Object.freeze({'Basic':0,'Stage 1':1,'Stage 2':2,'Level-Up':3,'BREAK':3,'VMAX':1});
const RARITY_FOCUS=Object.freeze([{id:'any',label:'Any rarity'},{id:'common',label:'Common'},{id:'uncommon',label:'Uncommon'},{id:'rare',label:'Rare / Holo'},{id:'ultra',label:'Ultra Rare · V / ex / VMAX'}]);
function rarityTier(card){
 // Original Pokemon-ex prints are Ultra/ex targets even when the printed
 // 2003 rarity string is 'Rare Holo EX' (rather than 'Ultra Rare').
 if(card?.pokemonEx||card?.isEx)return 'ultra';
 let raw=String(card?.rarity||'').toLowerCase().trim();
 // The Base Set battle catalogue predates stored rarity metadata; its 1999
 // collector numbers are authoritative, but only for that exact original set.
 if(!raw&&card?.setId==='base1'){
   const n=Number(card.number);raw=n<=16?'rare holo':n<=22?'rare':n<=42?'uncommon':n<=69?'common':'';
 }
 if(/ultra|secret|illustration|double rare|radiant|shiny|vmax|vstar/i.test(raw))return 'ultra';
 if(/^rare|holo rare|rare holo/i.test(raw))return 'rare';
 if(/uncommon/.test(raw))return 'uncommon';
 if(/common/.test(raw))return 'common';
 return 'unknown';
}
function matchesRarity(card,focus='any',basicOnly=false){return card?.kind==='pokemon'&&(!basicOnly||card.stage==='Basic')&&(focus==='any'||rarityTier(card)===focus);}

const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function ownedMap(rows){const map=new Map();for(const row of rows||[]){const id=classic.cardById(row.gameplayId)?.id;if(id)map.set(id,(map.get(id)||0)+Math.max(0,Number(row.quantity)||0));}return map;}
function attackTypes(card){const out=new Set();for(const attack of card?.attacks||[])for(const symbol of String(attack.cost||'')){const type=CODE_TO_TYPE[symbol];if(type&&decks.ENERGY_TYPES.includes(type))out.add(type);}return [...out];}
// The hybrid Energy Zone supplies Basic Darkness and Metal too.
// Neo Genesis Special Energy remains optional and occupies actual deck slots.
const SPECIAL_COST_CARDS=Object.freeze({D:'neo1-104',M:'neo1-19'});
// Neo Discovery has Darkness and Metal attackers but no Energy prints.  Treat
// the relevant Neo Genesis Special Energy as a cross-set energy supply, not as
// an off-set Pokémon/Trainer. Ownership and four-copy limits still apply.
const isDiscoveryEnergySupply=(card,sets)=>(sets.includes('neo2')||sets.includes('neo3')||sets.includes('neo4'))&&Object.values(SPECIAL_COST_CARDS).includes(card?.id);
// Holon Phantoms prints several attacks/Poké-Bodies that explicitly need
// the Holon Energy cards printed in EX Delta Species. Treat these three
// Special Energy cards as optional cross-set *support*, not as an invitation
// to mix unrelated Pokémon from the older expansion. Ownership still applies.
const isHolonPhantomsEnergySupply=(card,sets)=>sets.includes('ex13')&&card?.setId==='ex11'&&
 /^Holon Energy (?:FF|GL|WP)$/.test(card.name||'');
const allowedInSetPool=(card,sets)=>!!card&&(sets.includes(card.setId)||isDiscoveryEnergySupply(card,sets)||isHolonPhantomsEnergySupply(card,sets));
function specialCosts(_cards){return {D:0,M:0};} // Basic Darkness/Metal satisfies typed attack costs; Special Energy is optional.

function classicCardName(name){return String(name||'').replace(/[’]/g,"'").replace(/\s+(?=[♀♂])/g,'').replace(/\s*δ\s*$/u,'').trim();}
function classicEvolutionMatches(baseName,parentName){const a=classicCardName(baseName),p=classicCardName(parentName);return a===p||(p==='Burmy'&&/^Burmy (?:Plant|Sandy|Trash) Cloak$/.test(a));}
function parentKeys(baseName){const n=classicCardName(baseName);return /^Burmy (?:Plant|Sandy|Trash) Cloak$/.test(n)?[n,'Burmy']:[n];}
// A Fossil printed as a playable Trainer is an evolution prerequisite, not
// a generic Item or a disposable 30th card. Clefairy Doll also uses the
// playFossil engine path, but must NOT be mistaken for an evolution Fossil.
// BW3 Restored Pokémon are not Basics: these two specific Item cards are
// their required entry path.  Treat them as fossil-family roots for deck
// generation, while the battle engine continues to bench via bottom-seven.
const RESTORED_FOSSIL_IDS=new Set(['bw3-90','bw3-93','bw5-97','bw10-79','bw10-82','bw10-87','xy10-96','xy10-102','xy10-106','xy11-98','xy11-100']);
const EVOLUTION_FOSSIL_NAMES=new Set(classic.CARDS.filter(c=>c.kind==='trainer'&&
  (c.effect?.type==='playFossil'||RESTORED_FOSSIL_IDS.has(c.id))&&
  (c.id==='bw5-97'||c.id.startsWith('xy10-')||c.id.startsWith('xy11-')||/(?:Fossil(?: Lileep)?|Old Amber)$/i.test(classicCardName(c.name)))).map(c=>classicCardName(c.name)));
function isEvolutionFossil(card){return !!(card?.kind==='trainer'&&
  (card.effect?.type==='playFossil'||RESTORED_FOSSIL_IDS.has(card.id))&&
  EVOLUTION_FOSSIL_NAMES.has(classicCardName(card.name)));}
function fossilEvolutionInDeck(fossil,ids){
 const restored={'bw10-79':'bw10-27','bw10-82':'bw10-53','bw10-87':'bw10-3','xy10-96':'xy10-38','xy10-102':'xy10-17','xy10-106':'xy10-76','xy11-98':'xy11-69','xy11-100':'xy11-56'};
 if(restored[fossil?.id])return (ids||[]).includes(restored[fossil.id]);
 if(fossil?.id==='bw5-97')return (ids||[]).includes('bw5-53');return (ids||[]).some(id=>{
 const c=classic.cardById(id);
 return c?.kind==='pokemon'&&!!c.evolvesFrom&&classicEvolutionMatches(fossil.name,c.evolvesFrom);
});}
function anyFossilEvolutionInDeck(ids){
 if(['bw10-3','bw10-27','bw10-53','xy10-17','xy10-38','xy10-76','xy11-56','xy11-69'].some(id=>(ids||[]).includes(id)))return true;
 return (ids||[]).some(id=>{
 const c=classic.cardById(id);
 return c?.kind==='pokemon'&&!!c.evolvesFrom&&EVOLUTION_FOSSIL_NAMES.has(classicCardName(c.evolvesFrom));
});}
function isFossilSupport(card){return card?.kind==='trainer'&&
  (['Holon Fossil','Fossil Egg','Fossil Excavator','Fossil Excavation Kit'].includes(classicCardName(card.name)));}
// Baby Evolution is a special, voluntary Basic -> Basic evolution. It does
// not use evolvesFrom, so ordinary evolution-chain completion cannot detect
// missing partners (e.g. Smoochum -> Jynx). Treat it as a *deck dependency*.
// Fallbacks cover older prints whose ability text is empty or truncated.
const BABY_EVOLUTION_FAMILIES=Object.freeze({
 Azurill:['Marill'],Bonsly:['Sudowoodo'],Budew:['Roselia'],Chingling:['Chimecho'],
 Cleffa:['Clefairy'],Elekid:['Electabuzz'],Happiny:['Chansey'],Igglybuff:['Jigglypuff'],
 Magby:['Magmar'],Mantyke:['Mantine'],Munchlax:['Snorlax'],'Mime Jr.':['Mr. Mime'],
 Pichu:['Pikachu'],Smoochum:['Jynx'],Tyrogue:['Hitmonchan','Hitmonlee','Hitmontop'],
 Wynaut:['Wobbuffet']
});
function babyEvolutionTargets(card){
 if(card?.kind!=='pokemon'||!(card.abilities||[]).some(a=>/^Baby Evolution$/i.test(a.name||'')))return [];
 const name=classicCardName(card.name);return BABY_EVOLUTION_FAMILIES[name]||[];
}
// Index only private, immutable-for-this-build evolution pools. External callers
// can pass mutable arrays to familyLine; those continue to use the uncached path.
const indexedEvolutionPools=new WeakMap();
function indexEvolutionPool(pool){
 const byId=new Map(),parents=new Map();
 for(const c of pool){if(!byId.has(c.id))byId.set(c.id,c);if(c.kind!=='pokemon'&&!isEvolutionFossil(c))continue;
  for(const key of parentKeys(c.name)){let group=parents.get(key);if(!group)parents.set(key,group=[]);group.push(c);}}
 indexedEvolutionPools.set(pool,{byId,parents,lines:new Map()});
}
function familyLine(card,pool){
 const index=indexedEvolutionPools.get(pool);
 if(!index||!card||card.kind!=='pokemon')return computeFamilyLine(card,pool,index);
 if(!index.lines.has(card))index.lines.set(card,computeFamilyLine(card,pool,index));
 // Callers replace a focused Fossil/featured print; never mutate cached lines.
 return index.lines.get(card).slice();
}
function computeFamilyLine(card,pool,index){
 if(!card||card.kind!=='pokemon')return [];
 // Old Amber Aerodactyl puts a Restored Pokemon directly on the Bench.
 // This is a required Item/Pokemon deck pair, NOT a Basic evolution.
 if(card.id==='bw5-53'){const amber=index?index.byId.get('bw5-97'):pool.find(c=>c.id==='bw5-97');return amber?[amber,card]:[];}
 const line=[card],seen=new Set([card.id]);let cur=card;
 // When an expansion includes different prints of a pre-evolution, choose
 // the print that can fight using the final attacker's Energy plan. Without
 // this, a Lightning/Metal Charizard δ was paired with Fire Charmeleon even
 // though the set contains a Lightning Charmeleon δ.
 const finalTypes=new Set(attackTypes(card));
 while(cur.evolvesFrom){
  const parents=index?(index.parents.get(classicCardName(cur.evolvesFrom))||[]).slice():pool.filter(c=>(c.kind==='pokemon'||isEvolutionFossil(c))&&classicEvolutionMatches(c.name,cur.evolvesFrom));
  if(!parents.length)return [];
  const fit=c=>{
   const needs=attackTypes(c),off=needs.filter(t=>!finalTypes.has(t)).length,
     playable=(c.attacks||[]).some(a=>[...String(a.cost||'')].every(symbol=>symbol==='C'||!CODE_TO_TYPE[symbol]||finalTypes.has(CODE_TO_TYPE[symbol]))),
     sameType=(c.types||[]).some(t=>(card.types||[]).includes(t));
   return (playable?10:0)+(sameType?3:0)-off*15;
  };
  parents.sort((a,b)=>fit(b)-fit(a));
  const prior=parents[0];if(seen.has(prior.id))return [];
  line.unshift(prior);seen.add(prior.id);cur=prior;
 }
 const restoredFossil={'bw10-3':'bw10-87','bw10-27':'bw10-79','bw10-53':'bw10-82','xy11-56':'xy11-100','xy11-69':'xy11-98'};
 const needed=restoredFossil[line[0]?.id];
 if(needed){const fossil=index?index.byId.get(needed):pool.find(c=>c.id===needed);
   if(!fossil)return [];line.unshift(fossil);
 }
 return line;
}
// A visible Stage 1 is not a finished core when a Stage 2 exists but is
// PARTIAL, unowned or excluded by the selected sets. Check the full catalogue
// before treating the end of the playable subset as a terminal evolution.
// A future staged set's GATED evolutions must not retroactively invalidate
// old one-set Stage-1 builds. Legacy EX pool rules still apply unchanged.
const FULL_EVOLUTION_NAMES=new Set(classic.CARDS.filter(c=>c.kind==='pokemon'&&c.evolvesFrom&&c.stage!=='Level-Up'&&(!['dp1','dp2','dp3','dp4'].includes(c.setId)||c.battleEnabled)).map(c=>classicCardName(c.evolvesFrom)));
function hasKnownEvolution(card){return !!(card?.kind==='pokemon'&&parentKeys(card.name).some(k=>FULL_EVOLUTION_NAMES.has(k)));}
function abilityEnergy(card){return decks.dualArmorProfile(card)?.energyType||null;}
function effectiveTypes(card){return [...new Set([...(card?.types||[]),...(decks.dualArmorProfile(card)?.types||[])])];}
function conditionalAttackTypes(card){return synergy.metadata(card)?.conditionalAttackEnergyTypes||[];}
function conditionalAttackUseful(card,energy){
 const triggers=conditionalAttackTypes(card);
 return !triggers.length||triggers.some(type=>energy.includes(type));
}
// Prefer the endpoint attack requirements when early evolutions have optional
// typed attacks that are not needed to evolve or attack. E.g. Legend Maker
// Trapinch can use Colorless Pebble Throw until Flygon ex has Grass/Lightning;
// forcing the stage-one optional Fighting attack adds an impossible 3rd type.
// Keep all requirements when a 1/2-type union already fits, preserving older
// mixed-type evolutions and conditional Energy rules.
function familyEssentialTypes(line){
 const all=[...new Set((line||[]).flatMap(attackTypes))];
 if(!line?.length)return all;
 const endpoint=attackTypes(line[line.length-1]);
 if(endpoint.length>2)return all;
 const canPay=card=>!card.attacks?.length||card.attacks.some(attack=>[...String(attack.cost||'')].every(symbol=>symbol==='C'||!CODE_TO_TYPE[symbol]||endpoint.includes(CODE_TO_TYPE[symbol])));
 // DP1's Metal Steelix can be powered with Metal alone: Onix's Colorless
 // Headbutt remains payable, so its optional Fighting attack must not cause
 // an unwanted second Basic Energy Zone type. Keep pre-DP heuristics intact.
 if(['dp1','dp2','dp3','dp4'].includes(line[line.length-1]?.setId)&&endpoint.length&&line.every(canPay))return endpoint;
 if(all.length<=2)return all;
 return line.every(canPay)?endpoint:all;
}
function familyRoot(card,pool){const line=familyLine(card,pool);return line[0]?.name||card?.name||card?.id||'';}
function archetypeName(card,pool){const root=familyRoot(card,pool);return ['Mysterious Fossil','Eevee'].includes(root)?card?.name||root:root;}
function endpointCards(pool){const parents=new Set(pool.filter(c=>c.kind==='pokemon'&&c.evolvesFrom).map(c=>classicCardName(c.evolvesFrom)));return pool.filter(c=>c.kind==='pokemon'&&!parentKeys(c.name).some(k=>parents.has(k)));}
function damageValue(card){let best=0;for(const a of card?.attacks||[]){
  const raw=Number(a.damage||0);
  const effect=a.effect||{};
  // Score expected output rather than misreading “30×” or “?” as raw damage.
  const estimate=effect.type==='remainingHpFractionDamage'?60:effect.type==='coinDamage'?Number(effect.coins||1)*Number(effect.amount||0)/2:raw;
  best=Math.max(best,estimate);
 }return best;}

// Roles are inferred from battle data, so a newly added set can supply a useful
// evolution partner or standalone support without per-set deck recipes.
function standaloneScore(card){
 if(card?.kind!=='pokemon'||card.stage!=='Basic')return -Infinity;
 const attacks=card.attacks||[];
 const early=attacks.some(a=>String(a.cost||'').length<=2 && Number(a.damage||0)>=20 && a.effect?.type!=='coinAttackGate');
 const utility=attacks.some(a=>['status','coinFlip','preventDamage','energyAcceleration','heal'].includes(a.effect?.type));
 const retreat=Number(card.retreat||0);
 return Number(card.hp||0)*0.5 + (early?30:0) + (utility?12:0) + (retreat===0?12:0) - Math.max(0,retreat-1)*6;
}
function pokemonScore(card,pool){const line=familyLine(card,pool);return Number(card.hp||0)+damageValue(card)*1.7+(STAGE_RANK[card.stage]||0)*24+(line.length===3?18:line.length===2?10:0)-Math.max(0,Number(card.retreat||0)-2)*4;}
function typeCompatible(card,types){if(!types?.length)return true;const needs=attackTypes(card);return !needs.length||needs.every(type=>types.includes(type));}
// Mix the seed before the first draw. A small sequential seed must not
// always pick the first candidate (the old xorshift did exactly that).
function rng(seed){let x=(Number(seed)||0x6d2b79f5)>>>0;return()=>{x=(x+0x6d2b79f5)>>>0;let z=x;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return ((z^(z>>>14))>>>0)/4294967296;};}
function archetypeKey(card){return norm(`${card?.name||'pokemon'}-${card?.id||''}`);}
function completeLineFor(featured,candidates,pool){
 // A featured first/middle stage may be the main attacker, but its full legal
 // line is mandatory. Select the furthest supported endpoint and retain the
 // exact featured print at its own stage.
 const descendants=pool.filter(c=>c.kind==='pokemon'&&familyLine(c,pool).some(member=>classicCardName(member.name)===classicCardName(featured.name)&&member.stage===featured.stage));
 descendants.sort((a,b)=>(STAGE_RANK[b.stage]||0)-(STAGE_RANK[a.stage]||0));
 const endpoint=descendants[0]||featured;
 const line=familyLine(endpoint,pool);
 const selected=line.map(card=>classicCardName(card.name)===classicCardName(featured.name)&&card.stage===featured.stage?featured:card);
 // Replacing an intermediate printed Pokémon must also replace its actual
 // prerequisites. Otherwise a chosen Dome Fossil Kabuto could acquire a
 // Mysterious Fossil parent from a different Kabuto print in another set.
 const index=selected.findIndex(c=>c.id===featured.id);
 if(index>0){const prefix=familyLine(featured,pool);if(prefix.length===index+1)return [...prefix.slice(0,-1),...selected.slice(index)];}
 return selected;
}

function fail(message){return {ok:false,cards:[],energyTypes:[],errors:[message],warnings:[],strategy:''};}
// BW10 source-verified emergency legal composition. This is ONLY a fallback
// for a BW10-only unrestricted auto deck when the normal core algorithm has
// failed. Complete families are required; no orphan Restored Pokémon, false
// Energy, ACE SPEC overflow, cross-set Trainers or generic unrelated basics.
// Exposed for an independent regression; it never overrides a manual focus.
// BW11-only complete Basic cores. The emergency path never changes manual
// selection and refuses to create cards not actually owned. 14 legitimate
// Pokémon prints + four legitimate playsets, all inside Legendary Treasures.
// XY Base single-set fallback: only authentic owned prints; reserve 14 basic
// attackers and four useful 4-copy Trainer/Special Energy groups. This does not
// replace the normal evolution-aware builder or change manual/featured decks.
function rescueXY1Deck(rows,options={}){
 const scopes=options.sets||[],types=options.types||[];
 if(scopes.length!==1||scopes[0]!=='xy1'||types.length!==1||options.focusCardId||
    options.basicOnly===true||(options.rarityFocus&&options.rarityFocus!=='any')||
    (options.theme&&options.theme!=='any')||(options.cards&&options.cards.length))return null;
 const type=types[0];
 if(!ARCHETYPE_TYPES.includes(type))return null;
 const energyTypes=type==='Colorless'?['Fairy']:type==='Dragon'?['Fire','Lightning']:[type];
 const owned=ownedMap(rows);
 const canUse=c=>!!c&&c.setId==='xy1'&&c.kind==='pokemon'&&c.battleEnabled&&
   c.deckEligible!==false&&Number(owned.get(c.id)||0)>0;
 const pool=classic.CARDS.filter(canUse);
 const attackable=c=>(c.attacks||[]).some(a=>{
   const symbols=Array.isArray(a.cost)?a.cost:[...String(a.cost||'')];
   return symbols.every(k=>k==='C'||!CODE_TO_TYPE[k]||energyTypes.includes(CODE_TO_TYPE[k]));
 });
 const sameArchetype=c=>(c.types||[]).includes(type)||
   (type!=='Dragon'&&(c.types||[]).includes('Colorless'));
 // A legal Pokemon-family unit is either a standalone Basic or a COMPLETE
 // owned evolution line. Never pad the 30-card deck with orphaned evolving
 // Basics, Stage 1/2 Pokemon without parents, or cards from other sets.
 const groups=[];
 for(const c of pool){
   if(!sameArchetype(c)||!attackable(c))continue;
   let line;
   if(c.stage==='Basic'){
     if(hasKnownEvolution(c)||babyEvolutionTargets(c).length)continue;
     line=[c];
   }else if(['Stage 1','Stage 2','VMAX'].includes(c.stage)){
     // If the chosen Pokemon itself can evolve again, don't stop the line
     // halfway through (e.g. a Quilava without a Typhlosion).
     if(hasKnownEvolution(c))continue;
     line=familyLine(c,pool);
     if(line.length<2||line[0]?.stage!=='Basic'||
        line.some(x=>!canUse(x)||x.kind!=='pokemon'||!sameArchetype(x)))continue;
   }else continue;
   if(new Set(line.map(x=>classicCardName(x.name))).size!==line.length)continue;
   groups.push({line,endpoint:c,primary:(c.types||[]).includes(type),
     maxCopies:Math.min(4,...line.map(x=>Number(owned.get(x.id)||0)))});
 }
 // Prefer an on-type attacker, with Colorless only as genuinely playable
 // support. Prefer smaller independent Basic cores before complete families.
 groups.sort((a,b)=>Number(b.primary)-Number(a.primary)||
   a.line.length-b.line.length||Number(b.endpoint.hp||0)-Number(a.endpoint.hp||0));
 const unique=[],usedNames=new Set();
 for(const g of groups){
   const names=g.line.map(c=>classicCardName(c.name));
   if(names.some(name=>usedNames.has(name)))continue;
   unique.push(g);for(const name of names)usedNames.add(name);
 }
 if(!unique.some(g=>g.primary))return null;
 // Each copy of an evolution unit includes its actual Basic/Stage 1 parent.
 // A bounded exact-fill search avoids the old all-Basic filter, which left
 // 0 of 108 authentic XY CPU decks constructible in GitHub's build tests.
 const solve=(i,remaining,parts)=>{
   if(remaining===0)return parts;
   if(i>=unique.length)return null;
   const g=unique[i],max=Math.min(g.maxCopies,Math.floor(remaining/g.line.length));
   for(let n=max;n>=0;n--){
     const found=solve(i+1,remaining-n*g.line.length,n?[...parts,[g,n]]:parts);
     if(found)return found;
   }
   return null;
 };
 const parts=solve(0,14,[]);
 if(!parts)return null;
 const selected=parts.flatMap(([g,n])=>g.line.flatMap(c=>Array(n).fill(c.id)));
 const staples=['xy1-118','xy1-122','xy1-123','xy1-130'];
 for(const id of staples){const c=classic.cardById(id);
   if(!c||!c.battleEnabled||c.deckEligible===false||Number(owned.get(id)||0)<4)return null;
   selected.push(...Array(4).fill(id));
 }
 if(selected.length!==30||!classic.validateDeck(selected).ok||
    !decks.validateDraft(selected,rows,{requireFull:true}).ok||
    decks.analyzeDeck(selected,energyTypes).missingEnergyTypes.length)return null;
 return {ok:true,cards:selected,energyTypes,errors:[],warnings:[],style:'competitive',
   archetypeKey:'xy1-'+type.toLowerCase()+'-fallback',focusCardId:parts[0][0].endpoint.id,
   strategy:'XY Base legal owned complete-family rescue'};
}
function rescueXY2Deck(rows,options={}){
 const scopes=options.sets||[],types=options.types||[];
 if(scopes.length!==1||scopes[0]!=='xy2'||types.length!==1||options.focusCardId||
    options.basicOnly===true||(options.rarityFocus&&options.rarityFocus!=='any')||
    (options.theme&&options.theme!=='any')||(options.cards&&options.cards.length))return null;
 const type=types[0];
 if(!ARCHETYPE_TYPES.includes(type))return null;
 const energyTypes=type==='Colorless'?['Fairy']:type==='Dragon'?['Fire','Lightning']:[type];
 const owned=ownedMap(rows);
 const canUse=c=>!!c&&c.setId==='xy2'&&c.kind==='pokemon'&&c.battleEnabled&&
   c.deckEligible!==false&&Number(owned.get(c.id)||0)>0;
 const pool=classic.CARDS.filter(canUse);
 const attackable=c=>(c.attacks||[]).some(a=>{
   const symbols=Array.isArray(a.cost)?a.cost:[...String(a.cost||'')];
   return symbols.every(k=>k==='C'||!CODE_TO_TYPE[k]||energyTypes.includes(CODE_TO_TYPE[k]));
 });
 const sameArchetype=c=>(c.types||[]).includes(type)||
   (type!=='Dragon'&&(c.types||[]).includes('Colorless'));
 // A legal Pokemon-family unit is either a standalone Basic or a COMPLETE
 // owned evolution line. Never pad the 30-card deck with orphaned evolving
 // Basics, Stage 1/2 Pokemon without parents, or cards from other sets.
 const groups=[];
 for(const c of pool){
   if(!sameArchetype(c)||!attackable(c))continue;
   let line;
   if(c.stage==='Basic'){
     if(hasKnownEvolution(c)||babyEvolutionTargets(c).length)continue;
     line=[c];
   }else if(['Stage 1','Stage 2','VMAX'].includes(c.stage)){
     // If the chosen Pokemon itself can evolve again, don't stop the line
     // halfway through (e.g. a Quilava without a Typhlosion).
     if(hasKnownEvolution(c))continue;
     line=familyLine(c,pool);
     if(line.length<2||line[0]?.stage!=='Basic'||
        line.some(x=>!canUse(x)||x.kind!=='pokemon'||!sameArchetype(x)))continue;
   }else continue;
   if(new Set(line.map(x=>classicCardName(x.name))).size!==line.length)continue;
   groups.push({line,endpoint:c,primary:(c.types||[]).includes(type),
     maxCopies:Math.min(4,...line.map(x=>Number(owned.get(x.id)||0)))});
 }
 // Prefer an on-type attacker, with Colorless only as genuinely playable
 // support. Prefer smaller independent Basic cores before complete families.
 groups.sort((a,b)=>Number(b.primary)-Number(a.primary)||
   a.line.length-b.line.length||Number(b.endpoint.hp||0)-Number(a.endpoint.hp||0));
 const unique=[],usedNames=new Set();
 for(const g of groups){
   const names=g.line.map(c=>classicCardName(c.name));
   if(names.some(name=>usedNames.has(name)))continue;
   unique.push(g);for(const name of names)usedNames.add(name);
 }
 if(!unique.some(g=>g.primary))return null;
 // Each copy of an evolution unit includes its actual Basic/Stage 1 parent.
 // A bounded exact-fill search avoids the old all-Basic filter, which left
 // 0 of 108 authentic XY CPU decks constructible in GitHub's build tests.
 const solve=(i,remaining,parts)=>{
   if(remaining===0)return parts;
   if(i>=unique.length)return null;
   const g=unique[i],max=Math.min(g.maxCopies,Math.floor(remaining/g.line.length));
   for(let n=max;n>=0;n--){
     const found=solve(i+1,remaining-n*g.line.length,n?[...parts,[g,n]]:parts);
     if(found)return found;
   }
   return null;
 };
 const parts=solve(0,14,[]);
 if(!parts)return null;
 const selected=parts.flatMap(([g,n])=>g.line.flatMap(c=>Array(n).fill(c.id)));
 const staples=['xy2-90','xy2-93','xy2-94','xy2-99'];
 for(const id of staples){const c=classic.cardById(id);
   if(!c||!c.battleEnabled||c.deckEligible===false||Number(owned.get(id)||0)<4)return null;
   selected.push(...Array(4).fill(id));
 }
 if(selected.length!==30||!classic.validateDeck(selected).ok||
    !decks.validateDraft(selected,rows,{requireFull:true}).ok||
    decks.analyzeDeck(selected,energyTypes).missingEnergyTypes.length)return null;
 return {ok:true,cards:selected,energyTypes,errors:[],warnings:[],style:'competitive',
   archetypeKey:'xy2-'+type.toLowerCase()+'-fallback',focusCardId:parts[0][0].endpoint.id,
   strategy:'Flashfire legal owned complete-family rescue'};
}
function rescueBW11Deck(rows,options={}){
 const scopes=options.sets||[],types=options.types||[];
 if(scopes.length!==1||scopes[0]!=='bw11'||types.length!==1||options.focusCardId||
    options.basicOnly===true||(options.rarityFocus&&options.rarityFocus!=='any')||
    (options.theme&&options.theme!=='any')||(options.cards&&options.cards.length))return null;
 const type=types[0],families={
  Grass:['bw11-3','bw11-5','bw11-15','bw11-13'],
  Fire:['bw11-22','bw11-24','bw11-28','bw11-29'],
  Water:['bw11-32','bw11-43','bw11-44','bw11-45'],
  Lightning:['bw11-46','bw11-50','bw11-51','bw11-52'],
  Psychic:['bw11-53','bw11-54','bw11-66','bw11-77'],
  Fighting:['bw11-82','bw11-84','bw11-85','bw11-83'],
  Darkness:['bw11-88','bw11-89','bw11-90','bw11-RC13'],
  Metal:['bw11-91','bw11-107','bw11-108','bw11-104'],
  Dragon:['bw11-93','bw11-100','bw11-101','bw11-107'],
  Colorless:['bw11-107','bw11-108','bw11-104','bw11-RC15']
 };
 const core=families[type];if(!core)return null;
 const counts=[4,4,4,2],trainers=['bw11-109','bw11-111','bw11-112','bw11-113'];
 const selected=[...core.map((id,i)=>[id,counts[i]]),...trainers.map(id=>[id,4])];
 const owned=ownedMap(rows);
 if(selected.some(([id,n])=>{const c=classic.cardById(id);return !c||!c.battleEnabled||c.deckEligible===false||
     c.setId!=='bw11'||Number(owned.get(id)||0)<n;}))return null;
 const cards=selected.flatMap(([id,n])=>Array(n).fill(id));
 const energyTypes=type==='Dragon'?['Fire','Lightning']:type==='Colorless'?['Fighting']:[type];
 if(cards.length!==30||!classic.validateDeck(cards).ok||
    !decks.validateDraft(cards,rows,{requireFull:true}).ok)return null;
 const code={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
 if(core.some(id=>{const c=classic.cardById(id);return !(c.attacks||[]).some(a=>
  (Array.isArray(a.cost)?a.cost:[...String(a.cost||'')]).every(t=>t==='C'||!code[t]||energyTypes.includes(code[t])));} ))return null;
 return {ok:true,cards,energyTypes,errors:[],warnings:[],style:'competitive',
   archetypeKey:'bw11-'+type.toLowerCase()+'-fallback',focusCardId:core[0],
   strategy:'BW11 verified single-set recovery'};
}
function rescueBW10Deck(rows,options={}){
 const scopes=options.sets||[],types=options.types||[];
 if(scopes.length!==1||scopes[0]!=='bw10'||types.length!==1||
    options.focusCardId||options.basicOnly===true||
    (options.rarityFocus&&options.rarityFocus!=='any')||
    (options.theme&&options.theme!=='any')||
    (options.cards&&options.cards.length))return null;
 const type=types[0];
 const families={
  Grass:[['bw10-5',3],['bw10-10',3]],
  Fire:[['bw10-12',3],['bw10-13',3]],
  Water:[['bw10-17',3],['bw10-20',3]],
  Psychic:[['bw10-36',3],['bw10-37',3]],
  Fighting:[['bw10-51',3],['bw10-52',3]],
  Metal:[['bw10-57',2],['bw10-58',2],['bw10-59',2]],
  Darkness:[['bw10-55',3],['bw10-56',3]],
  Colorless:[['bw10-71',3],['bw10-77',3]],
  Dragon:[['bw10-62',2],['bw10-63',2],['bw10-64',2]]
 };
 const core=families[type];if(!core)return null;
 const trainers=[['bw10-78',4],['bw10-80',4],['bw10-83',4],['bw10-84',4],['bw10-88',4],['bw10-90',4]];
 const owned=ownedMap(rows),selected=[...core,...trainers];
 if(selected.some(([id,n])=>{const c=classic.cardById(id);return !c||c.setId!=='bw10'||
   !c.battleEnabled||c.deckEligible===false||Number(owned.get(id)||0)<n;
 }))return null;
 const cards=selected.flatMap(([id,n])=>Array(n).fill(id));
 const energyTypes=type==='Colorless'?['Fighting']:type==='Dragon'?['Fire','Water']:[type];
 if(cards.length!==30||!classic.validateDeck(cards).ok||
    !decks.validateDraft(cards,rows,{requireFull:true}).ok||
    decks.analyzeDeck(cards,energyTypes).missingEnergyTypes.length)return null;
 // Never return a legal but energy-unpayable attacking roster.
 const coded={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
 if(core.some(([id])=>{const p=classic.cardById(id);return (p.attacks||[]).length&&
    !(p.attacks||[]).some(a=>[...String(a.cost||'')].every(sym=>sym==='C'||!coded[sym]||energyTypes.includes(coded[sym])));
 }))return null;
 return {ok:true,cards,energyTypes,errors:[],warnings:[],
  style:options.style==='random'?'random':'competitive',
  archetypeKey:'bw10-'+type.toLowerCase()+'-fallback',
  focusCardId:core[0][0],strategy:'BW10 verified '+type+' complete-family recovery'};
}
function buildDeck(rows,options={}){
 const rarityFocus=RARITY_FOCUS.some(r=>r.id===options.rarityFocus)?options.rarityFocus:'any',basicOnly=options.basicOnly===true,theme=synergy.THEMES.some(t=>t.id===options.theme)?options.theme:'any';
 const style=options.style==='random'?'random':'competitive',owned=ownedMap(rows),allowedSets=(options.sets||SET_IDS).filter(s=>SET_IDS.includes(s)),scope=allowedSets.length?allowedSets:SET_IDS,pool=classic.CARDS.filter(c=>allowedInSetPool(c,scope)&&c.battleEnabled&&c.deckEligible!==false&&Number(owned.get(c.id)||0)>0),pokemonPool=pool.filter(c=>c.kind==='pokemon'),evolutionPool=pool.filter(c=>c.kind==='pokemon'||isEvolutionFossil(c));
 indexEvolutionPool(evolutionPool);
 if([...pool].reduce((sum,c)=>sum+Math.min(c.setId==='pl4'&&(/^AR[1-9]$/.test(String(c.number))||['94','95','96'].includes(String(c.number)))?30:4,owned.get(c.id)||0),0)<30)return fail('Not enough owned battle-ready Classic card copies to build a 30-card deck.');
 if(!pokemonPool.some(c=>c.stage==='Basic'))return fail('No owned battle-ready Basic Pokémon are available.');
 const requested=[...new Set((options.types||[]).filter(t=>ARCHETYPE_TYPES.includes(t)))].slice(0,2),requestedEnergy=requested.filter(t=>decks.ENERGY_TYPES.includes(t)),allowMixedEnergy=options.allowMixedEnergy===true,existing=Array.isArray(options.cards)?options.cards:[],random=rng(options.randomSeed),excluded=new Set(options.excludeArchetypes||[]);
 // V-create requires five actual Benched Pokemon. LuckyDex Classic's default
 // three-slot Bench cannot satisfy it; only a saved deck with a five-slot
 // Bench stadium can deliberately use this print. Never auto-pick a dead core.
 const hasFiveBenchRoute=scope.includes('SNAPFLORIO')&&existing.includes('SNAPFLORIO-108');
 // Evolution end-points are era-aware: a later-era species such as
 // Annihilape must not retroactively invalidate 2009 Primeape decks. An
 // earlier known Stage 2 still requires its complete line when selected.
 const latestEra=Math.max(...scope.map(id=>SET_IDS.indexOf(id)).filter(i=>i>=0));
 const knownEvolutionParentsInEra=new Set(classic.CARDS.filter(c=>c.kind==='pokemon'&&c.evolvesFrom&&c.stage!=='Level-Up'&&SET_IDS.indexOf(c.setId)<=latestEra&&(!['dp1','dp2','dp3','dp4'].includes(c.setId)||c.battleEnabled)).map(c=>classicCardName(c.evolvesFrom)));
 const hasKnownEvolutionInEra=card=>!!(card?.kind==='pokemon'&&parentKeys(card.name).some(k=>knownEvolutionParentsInEra.has(k)));
 // Rayquaza C LV.X explicitly costs Water + Psychic + Fighting. Only an
 // explicit focus on this printed card opts its Energy Zone into three
 // types; normal autobuild remains two-type by default.
 const maxEnergyTypes=scope.includes('pl3')&&['pl3-8','pl3-146'].includes(options.focusCardId)?3:2;

 let focus=classic.cardById(options.focusCardId);
 if(basicOnly&&focus?.kind==='pokemon'&&focus.stage!=='Basic')return fail(`${focus.name} is ${focus.stage} and cannot be used in Basic-only mode.`);
 const fossilFocus=isEvolutionFossil(focus)?focus:null;
 if(fossilFocus){
   if(!evolutionPool.some(c=>c.id===fossilFocus.id))return fail(`${fossilFocus.name} is not owned or battle-ready in the selected sets.`);
   if(basicOnly)return fail(`${fossilFocus.name} requires a Pokémon evolution, which is incompatible with Basic-only mode.`);
   const descendants=pokemonPool.filter(p=>familyLine(p,evolutionPool).some(member=>isEvolutionFossil(member)&&classicEvolutionMatches(member.name,fossilFocus.name)));
   descendants.sort((a,b)=>(STAGE_RANK[b.stage]||0)-(STAGE_RANK[a.stage]||0)||pokemonScore(b,evolutionPool)-pokemonScore(a,evolutionPool));
   if(!descendants.length)return fail(`Cannot build around ${fossilFocus.name}: no owned, battle-ready Pokémon evolves from it in the selected sets.`);
   focus=descendants[0];
 }
 if(isFossilSupport(focus)&&!pokemonPool.some(p=>familyLine(p,evolutionPool).some(member=>isEvolutionFossil(member))))
   return fail(`Cannot build around ${focus.name}: no owned, battle-ready Fossil evolution line is available.`);
 const playableChildren=new Map(),finishMemo=new Map();
 // A Baby Evolution partner must be a genuinely owned, battle-enabled
 // Basic target in the selected sets. Since this is an unusual evolution,
 // the target remains Basic in the catalog and needs explicit deck pairing.
 const playableBabyTargets=(baby,energy=[])=>{
   const names=babyEvolutionTargets(baby);
   if(!names.length)return [];
   return pokemonPool.filter(c=>c.stage==='Basic'&&names.includes(classicCardName(c.name))&&
     (!energy.length||!(c.attacks||[]).length||(c.attacks||[]).some(a=>[...String(a.cost||'')].every(symbol=>symbol==='C'||!CODE_TO_TYPE[symbol]||energy.includes(CODE_TO_TYPE[symbol])))))
     .sort((a,b)=>Number(b.setId===baby.setId)-Number(a.setId===baby.setId)||
       Number((b.types||[]).some(t=>(baby.types||[]).includes(t)))-Number((a.types||[]).some(t=>(baby.types||[]).includes(t)))||a.id.localeCompare(b.id));
 };
 for(const c of pokemonPool)if(c.evolvesFrom){const key=classicCardName(c.evolvesFrom);if(!playableChildren.has(key))playableChildren.set(key,[]);playableChildren.get(key).push(c);}
 const canFinishInPool=c=>{
  // A viable starting Basic must lead to a useful terminal Pokémon, not
  // blindly evolve into an inert Xatu/Swellow/Altaria support-only endpoint.
  if(isStage2OnlySupport(c)&&!hasEligibleBeneficiary(c))return false;
  if(!hasKnownEvolutionInEra(c))return true;
  const key=classicCardName(c.name)+'@'+c.stage;
  if(finishMemo.has(key))return finishMemo.get(key);
  // Children must be higher stages and have a legal, playable root chain.
  const next=parentKeys(c.name).flatMap(k=>playableChildren.get(k)||[]).filter(child=>(STAGE_RANK[child.stage]||0)>(STAGE_RANK[c.stage]||0));
  const ok=next.some(child=>familyLine(child,evolutionPool).length>0&&canFinishInPool(child));
  finishMemo.set(key,ok);return ok;
 };
 // A support-only Poké-Body / Poké-Power is not a viable standalone core.
 // Restrict it to a pool with a FULL Stage 2 Pokémon-ex evolution family
 // whose required attack Energy fits the user's selected type filter.
 // Keep a cached candidate list for both core eligibility and pairing.
 const stage2ExBeneficiaries=pokemonPool.filter(c=>c.pokemonEx&&c.stage==='Stage 2'&&
   familyLine(c,evolutionPool).length===3&&
   familyLine(c,evolutionPool).every(member=>Number(owned.get(member.id)||0)>0)&&
   familyEssentialTypes(familyLine(c,evolutionPool)).length<=2&&
   (!requestedEnergy.length||familyEssentialTypes(familyLine(c,evolutionPool)).every(t=>requestedEnergy.includes(t))));
 const isStage2OnlySupport=c=>!!((c?.deckMeta?.stage2ExSupport||['ex15-25','ex15-40','ex15-90'].includes(c?.id))&&c.stage!=='Stage 2');
 const hasEligibleBeneficiary=c=>stage2ExBeneficiaries.some(target=>familyRoot(target,evolutionPool)!==familyRoot(c,evolutionPool));
 // Competitive considers complete evolution families; Random draws a printed
 // Pokémon from the *entire* owned, battle-ready roster (not the top 14).
 const isEligible=c=>{
  if(c.id==='bw3-15'&&!hasFiveBenchRoute)return false;
  const line=familyLine(c,evolutionPool),required=familyEssentialTypes(line),special=specialCosts(line);
  if(isStage2OnlySupport(c)&&!hasEligibleBeneficiary(c))return false;
  if(babyEvolutionTargets(c).length&&!playableBabyTargets(c,requestedEnergy.length?requestedEnergy:required).length)return false;
  const dual=decks.dualArmorProfile(c),all=[...new Set([...requestedEnergy,...required])];
  // In EX Power Keepers-only builds, a one-type selection must not recruit
  // a Fire/Water Salamence or Grass/Lightning Flygon and then quietly add a
  // second Energy type. Keep older sets' longstanding evolution-energy
  // conversion (e.g. mixed Kingdra delta) unchanged in this set audit.
  if(scope.length===1&&scope[0]==='ex16'&&requestedEnergy.length===1&&!allowMixedEnergy&&!dual&&
     required.some(t=>!requestedEnergy.includes(t)))return false;
  if(dual&&!all.includes(dual.energyType)&&all.length<2)all.push(dual.energyType);
  // If the player filters by a type that Dual Armor *grants*, we must be able
  // to attach its trigger Energy; just matching the name is not enough.
  const matching= !requested.length||effectiveTypes(c).some(type=>requested.includes(type))||conditionalAttackTypes(c).some(type=>requested.includes(type))||((c.types||[]).includes('Colorless')&&line.some(member=>attackTypes(member).some(type=>requestedEnergy.includes(type))));
  // A Dual Armor core must *actually* activate its second type. If an
  // explicit two-type filter leaves no slot, choose a different core.
  const activeMatch=!dual||all.includes(dual.energyType);
  return !!line.length&&required.length<=maxEnergyTypes&&all.length<=maxEnergyTypes&&matching&&activeMatch&&
   (requestedEnergy.length!==2||required.every(type=>requestedEnergy.includes(type)))&&
   Object.entries(special).every(([sym,n])=>!n||(classic.cardById(SPECIAL_COST_CARDS[sym])?.battleEnabled&&allowedInSetPool(classic.cardById(SPECIAL_COST_CARDS[sym]),scope)&&Number(owned.get(SPECIAL_COST_CARDS[sym])||0)>=n));
 };
 // An explicitly focused Basic or Stage 1 remains a legal archetype even
 // when a later evolution exists in a different set (Jungle Scyther/Scizor).
 const focal=focus?.kind==='pokemon'&&pokemonPool.some(c=>c.id===focus.id)?[focus]:[];
 let candidates=[...new Map([...(basicOnly?pokemonPool.filter(c=>c.stage==='Basic'):endpointCards(pokemonPool).filter(c=>canFinishInPool(c))),...focal.filter(c=>basicOnly||c.stage==='Basic'||canFinishInPool(c))].map(c=>[c.id,c])).values()].filter(isEligible);
 // The selected tier determines the featured Pokémon, not its prerequisites.
 // An Ultra Rare VMAX can still have the lower-rarity V it evolves from.
 if(rarityFocus!=='any'||basicOnly)candidates=candidates.filter(c=>matchesRarity(c,rarityFocus,basicOnly));

 if(focus?.kind==='pokemon'){
   if(focus.id==='bw3-15'&&!hasFiveBenchRoute)return fail('Victini V-create requires five Benched Pokemon; the default Classic three-slot Bench cannot use it. Use a verified five-slot Bench effect in a mixed-set draft.');
   if(babyEvolutionTargets(focus).length&&!playableBabyTargets(focus,requestedEnergy).length)
     return fail(`Cannot build around ${focus.name}: its Baby Evolution needs an owned, battle-ready ${babyEvolutionTargets(focus).join(' / ')} in the selected sets and Energy plan.`);
   if(isStage2OnlySupport(focus)&&!hasEligibleBeneficiary(focus))
     return fail(`Cannot build around ${focus.name}: its Body/Power supports Stage 2 Pokémon-ex, but no complete Stage 2 ex line fits the chosen sets, owned cards and Energy types. Widen the type/set selection.`);
   const focused=candidates.filter(c=>familyLine(c,evolutionPool).some(member=>classicCardName(member.name)===classicCardName(focus.name)&&member.stage===focus.stage));
   if(focused.length)candidates=focused;
   else if((scope.includes('neo2')||scope.includes('neo3')||scope.includes('neo4'))&&['Darkness','Metal'].some(t=>(focus.types||[]).includes(t)))return fail(`Cannot build around ${focus.name}: a complete evolution family and at most two supported Basic Energy Zone types are required.`);
   else if(!basicOnly&&!canFinishInPool(focus))return fail(`Cannot complete ${focus.name}'s evolution family with battle-ready owned cards in the selected sets. Include its next evolution or choose a different focus.`);
   else if(abilityEnergy(focus)&&requestedEnergy.length>=2&&!requestedEnergy.includes(abilityEnergy(focus)))return fail(`${focus.name} needs ${abilityEnergy(focus)} Energy for Dual Armor; include that type or choose a different focus.`);
   else return fail(`Cannot build around ${focus.name} with the selected Energy types, owned cards and sets.`);
 }
 // Type selection applies to the featured family, not its Colorless supports.
 const coreScores=new Map();
 const computeCoreScore=c=>pokemonScore(c,evolutionPool)+synergy.pokemonThemeScore(c,theme)*4+
   (requested.length?effectiveTypes(c).includes(requested[0])?240:effectiveTypes(c).some(type=>requested.includes(type))?120:conditionalAttackTypes(c).some(type=>requested.includes(type))?100:0:0);
 const coreScore=c=>{if(!coreScores.has(c))coreScores.set(c,computeCoreScore(c));return coreScores.get(c);};
 candidates.sort((a,b)=>coreScore(b)-coreScore(a)||Number(a.number)-Number(b.number));
 if(!candidates.length)return fail('No complete owned evolution family matches the selected rarity, Basic-only and Energy type preferences. Widen the filter or collect the required evolution stages.');
 if(theme!=='any'&&!candidates.some(c=>synergy.pokemonThemeScore(c,theme)>0))return fail(`No owned Pokémon supports the ${synergy.THEMES.find(t=>t.id===theme).label} strategy within the selected rarity, sets and Energy types.`);
 if(theme!=='any'&&!focus)candidates=candidates.filter(c=>synergy.pokemonThemeScore(c,theme)>0);
 let featured=null,main=candidates[0],mainLine=[];
 if(style==='random'&&!focus){
   let roster=pokemonPool.filter(c=>isEligible(c)&&matchesRarity(c,rarityFocus,basicOnly)&&(basicOnly||canFinishInPool(c))&&(theme==='any'||synergy.pokemonThemeScore(c,theme)>0));
   // Exclusions only affect the *next main Pokémon*, never its legal support.
   const fresh=roster.filter(c=>!excluded.has(archetypeKey(c)));
   if(fresh.length)roster=fresh;
   if(!roster.length)return fail('No owned, playable Pokémon matches the selected Classic Energy types.');
   featured=roster[Math.floor(random()*roster.length)];
   mainLine=completeLineFor(featured,candidates,evolutionPool);
   main=mainLine[mainLine.length-1]||featured;
 }else{
   let selectable=candidates.filter(c=>!excluded.has(archetypeKey(c)));
   if(!selectable.length)selectable=candidates;
   if(style==='competitive'&&options.randomSeed!=null&&!focus){
     // Weighted toward strong cores, while letting later-set archetypes with
     // lower printed HP/damage compete. Only the *UI* supplies this seed;
     // deterministic calls without one keep the strongest default.
     const highest=coreScore(selectable[0]);
     const viable=selectable.filter(c=>coreScore(c)>=Math.max(145,highest*0.42));
     const shortlist=viable.length?viable:selectable;
     main=shortlist[Math.min(shortlist.length-1,Math.floor(Math.pow(random(),1.6)*shortlist.length))];
   }else main=(focus&&selectable.find(c=>c.id===focus.id))||selectable[0];
   mainLine=focus?.kind==='pokemon'?completeLineFor(focus,selectable,evolutionPool):familyLine(main,evolutionPool);
   main=mainLine[mainLine.length-1]||main;
 }
 // Basic-only is an explicit player constraint.  The focused-core path
 // previously expanded a chosen Basic into Stage 1/2 or LV.X even though
 // the candidate selector itself was filtering to Basic Pokémon.
 if(basicOnly){
   if(focus?.kind==='pokemon'&&focus.stage!=='Basic')
     return fail(`${focus.name} is ${focus.stage} and cannot be used in Basic-only mode.`);
   mainLine=[featured?.stage==='Basic'?featured:mainLine.find(c=>c.stage==='Basic')||main];
   main=mainLine[0];
 }
 // When multiple sets print the same Fossil, keep the actual focused print
 // in the selected evolutionary line instead of quietly swapping its card ID.
 if(fossilFocus){
   // A focus on a specific Fossil print is a focus on its matching family,
   // even when another set also prints the same evolved Pokémon species.
   mainLine=familyLine(focus,evolutionPool);
   if(!mainLine.length||!isEvolutionFossil(mainLine[0])||!classicEvolutionMatches(mainLine[0].name,fossilFocus.name))
     return fail(`Cannot find a complete evolution family for ${fossilFocus.name} in the selected sets.`);
   mainLine[0]=fossilFocus;
   main=mainLine[mainLine.length-1];
 }
 // Choosing two allowed types is not a request to pollute a single-type
 // attacker's Energy Zone. Mixed *support* requires an explicit opt-in; a
 // featured family that itself needs two Energy types always keeps both.
 // A focused evolution family may need two genuine Energy types even when
 // the player filters by the final Pokémon's single displayed type (e.g.
 // Neo Scyther Grass -> Scizor Metal, Pupitar Fighting -> Tyranitar Darkness).
 // Never grant that second type to an unrelated support attacker.
 const mainRoot=familyRoot(main,evolutionPool),lineEnergy=familyEssentialTypes(mainLine),selectedTypes=[...new Set([...requestedEnergy,...lineEnergy])];
 // Conditional attack payoffs require actual attached Basic Energy. Typhlosion
 // δ has a Psychic attack cost, but Burning Ball only Burns with two Fire.
 // Don't promise the bonus when a locked dual-type filter has no room.
 const conditionalPayoffTypes=[...new Set(mainLine.flatMap(c=>c.deckMeta?.conditionalAttackEnergyTypes||[]))];
 for(const type of conditionalPayoffTypes)if(!selectedTypes.includes(type)&&selectedTypes.length<2)selectedTypes.push(type);
 // A Stage-1 Body/Poké-Power whose entire purpose is supporting Stage 2 ex
 // needs an actual Stage-2 ex line. Select Energy for that ATTACKER instead of
 // diluting its Zone with a Bench-only Xatu/Altaria/Swellow attack cost.
 const supportFocus=!!(!basicOnly&&mainLine.some(isStage2OnlySupport));
 const stage2Candidates=supportFocus?stage2ExBeneficiaries.filter(c=>familyRoot(c,evolutionPool)!==mainRoot).sort((a,b)=>Number(familyEssentialTypes(familyLine(b,evolutionPool)).some(t=>lineEnergy.includes(t)))-Number(familyEssentialTypes(familyLine(a,evolutionPool)).some(t=>lineEnergy.includes(t)))||pokemonScore(b,evolutionPool)-pokemonScore(a,evolutionPool)||a.id.localeCompare(b.id)):[];
 const stage2Beneficiary=stage2Candidates[0]||null;
 if(stage2Beneficiary){
   const targetEnergy=familyEssentialTypes(familyLine(stage2Beneficiary,evolutionPool));
   selectedTypes.splice(0,selectedTypes.length,...new Set([...requestedEnergy,...targetEnergy]));
   if(!selectedTypes.length)selectedTypes.push((stage2Beneficiary.types||[]).find(t=>decks.ENERGY_TYPES.includes(t))||'Fighting');
 }
 // A conditional secondary type is useful only if its *actual* activation
 // Energy is available. Add it to the automatic Zone without introducing an
 // irrelevant third type or losing the attack's printed costs.
 for(const c of [...mainLine].reverse()){const type=abilityEnergy(c);if(type&&!selectedTypes.includes(type)&&selectedTypes.length<2)selectedTypes.push(type);}
 if(allowMixedEnergy&&requestedEnergy.length===2&&lineEnergy.every(t=>requestedEnergy.includes(t))){selectedTypes.splice(0,selectedTypes.length,...requestedEnergy);} 
 if(!selectedTypes.length){const ownType=requestedEnergy[0]||(main.deckMeta?.preferredEnergyTypes||[]).find(t=>decks.ENERGY_TYPES.includes(t))||(main.types||[]).find(t=>decks.ENERGY_TYPES.includes(t));if(ownType)selectedTypes.push(ownType);}
 if(!selectedTypes.length)selectedTypes.push('Fighting');
 const cards=[],counts=new Map(),nameCounts=new Map();
 // The Classic format is only 30 cards. Trainer redundancy is useful, but
 // stuffing four copies of every high-scoring Supporter/Tool is not. Start
 // with varied two-copy support, relaxing only for inventories which cannot
 // produce a full legal deck otherwise. Manually retained copies are exempt.
 let autoTrainerCap=2,autoPokemonCap=18,energyFillerPhase=false;
 const retainedNameCopies=new Map();
 for(const id of existing){const saved=classic.cardById(id);if(saved){const name=classicCardName(saved.name);retainedNameCopies.set(name,(retainedNameCopies.get(name)||0)+1);}}
 // The deck grows only through add(); cache derived state for the current
 // exact draft, not across ownership changes, builds or Energy selections.
 let draftCacheSize=-1,draftCacheEnergy='',draftPokemon=[],draftCards=[],draftContext=null,draftUseful=new Map(),draftScores=new Map();
 function refreshDraftCache(){const key=selectedTypes.join('|');if(draftCacheSize===cards.length&&draftCacheEnergy===key)return;
  draftCacheSize=cards.length;draftCacheEnergy=key;draftCards=cards.map(classic.cardById).filter(Boolean);draftPokemon=draftCards.filter(c=>c.kind==='pokemon');draftContext=null;draftUseful=new Map();draftScores=new Map();}
 const selectedPokemon=()=>{refreshDraftCache();return draftPokemon;};
 const supportContext=()=>{refreshDraftCache();return draftContext||(draftContext=synergy.context(draftCards,selectedTypes,theme));};
 const cachedTrainerScore=card=>{refreshDraftCache();if(!draftScores.has(card))draftScores.set(card,synergy.trainerScore(card,supportContext()));return draftScores.get(card);};
 function trainerIsUseful(card){refreshDraftCache();if(!draftUseful.has(card))draftUseful.set(card,computeTrainerUseful(card));return draftUseful.get(card);}
 function computeTrainerUseful(card){
   // Stormfront's specialist search/transfer cards must have real targets.
   // A Premier Ball is dead without a LV.X and Conductive Quarry is dead
   // without Lightning or Metal in the actual selected Energy Zone.
   if(card?.id==='dp7-91'&&!cards.some(id=>classic.cardById(id)?.stage==='Level-Up'))return false;
   if(card?.id==='dp7-82'&&!selectedTypes.some(type=>type==='Lightning'||type==='Metal'))return false;
   // Platinum SP and LV.X support cannot be useful without actual physical
   // beneficiaries in this deck. Three SP are required to play Power Spray.
   const platinumMembers=()=>cards.map(id=>classic.cardById(id)).filter(p=>p?.kind==='pokemon');
   const platinumSP=()=>platinumMembers().filter(p=>p.isPokemonSP).length;
   if(['pl1-116','pl1-118'].includes(card?.id)&&platinumSP()<1)return false;
   if(card?.id==='pl1-117'&&platinumSP()<3)return false;
   if(card?.id==='pl1-107'&&!platinumMembers().some(p=>p.stage==='Level-Up'))return false;
   if(card?.id==='pl1-110'&&!platinumMembers().some(p=>['Stage 1','Stage 2','Level-Up'].includes(p.stage)))return false;
   // Rising Rivals SP-only cards are dead without an actual Pokémon SP in
   // the *constructed deck*, regardless of whether the owner owns SP cards.
   // Respect explicitly retained user card choices; these restrictions only
   // govern automatic additions to the deck.
   const manuallyKept=card?.id&&existing.includes(card.id);
   // Cross-era printed restrictions, evaluated against this particular deck.
   // Being battle-enabled does not mean the Trainer has a useful target.
   if(!manuallyKept){
     const pokemon=selectedPokemon();
     if(card?.trainerType==='Tool'&&fx){
       const species=fx.spiritLinkSpecies(card);
       if(species&&(!pokemon.some(p=>fx.usefulToolRecipient(card,p))||!pokemon.some(p=>fx.spiritLinkEvolution(card,p))))return false;
       if(!species&&!pokemon.some(p=>fx.usefulToolRecipient(card,p)))return false;
     }
     // Banette's global Tool Concealment blanks every Pokémon Tool on both
     // boards while its Ability is live. Avoid spending the compact 30-card
     // support slots on inactive Tools when automatically building around it.
     // Existing user-selected Tools are retained, even if situational.
     if(card?.trainerType==='Tool'&&pokemon.some(p=>p.id==='xy6-31'))return false;
     if(card?.trainerType==='Tool'&&pokemon.some(p=>p.id==='xy8-94'))return false;
     // Vileplume's Irritating Pollen blocks Items for both players once live.
     // Keep a small setup allowance (and Rare Candy for its Stage 2 line),
     // but prioritise functional Supporters instead of dead Item filler.
     if(card?.trainerType==='Item'&&card?.name!=='Rare Candy'&&
        pokemon.some(p=>p.id==='xy7-3')&&
        cards.filter(id=>classic.cardById(id)?.trainerType==='Item').length>=2)return false;
     // Steam Siege: Special Charge recycles PHYSICAL Special Energy cards,
     // never the virtual Basic Energy Zone. Captivating Poké Puff is matchup
     // disruption, not a universal Trainer filler for unrelated archetypes.
     if(card?.id==='xy11-105'&&!cards.some(id=>classic.cardById(id)?.specialEnergy))return false;
     if(card?.id==='xy11-99')return false;
     // Greedy Dice cannot be deliberately played from hand; it only triggers
     // when the face-down Prize lottery reveals it. Never fill a generated
     // 30-card deck with it as a generic Item. Keep explicit user picks.
     if(card?.id==='xy11-102')return false;
     // Ninja Boy and Pokémon Ranger are matchup / tactical Supporters, not
     // four-copy draw engines. Cap their automatic packages across alt arts.
     if(['xy11-103','xy11-104','xy11-113'].includes(card?.id)&&
        cards.filter(id=>['Ninja Boy','Pokémon Ranger'].includes(classic.cardById(id)?.name)&&
          classic.cardById(id)?.name===card.name).length>=2)return false;
     // Fates Collide: only place named, conditional cards when the actual
     // selected deck supplies their recipient. Otherwise these became the
     // identical default 17-Trainer filler package for unrelated archetypes.
     if(card?.id==='xy10-108'&&!pokemon.some(p=>['xy10-54','xy10-54a'].includes(p.id)))return false;
     if(['xy10-99','xy10-100'].includes(card?.id)&&!selectedTypes.includes('Fairy'))return false;
     if(card?.id==='xy10-95'&&!pokemon.some(p=>['Stage 1','Stage 2'].includes(p.stage)&&
       pokemon.some(base=>classicCardName(base.name)===classicCardName(p.evolvesFrom||''))))return false;
     // Mega Catcher has no target in our own deck: it is matchup tech, not
     // generic filler. Preserve the owner's explicit choice if retained.
     if(card?.id==='xy10-104')return false;
     // An Excavation Kit without a real Fossil Item in the physical draw
     // deck cannot ever recover anything, regardless of the Pokemon line.
     if(card?.id==='xy10-101'&&!cards.some(id=>['xy10-96','xy10-102','xy10-106'].includes(id)))return false;
     // Primal Clash Spirit Links are only useful with their exact Mega or
     // Primal Evolution prints IN the finished 30-card deck. A matching
     // ordinary Basic EX is not enough; do not auto-add dead Tool cards.
     const xy5Links={'xy4-95':['xy4-35','xy4-121'],'xy4-100':['xy4-24','xy4-24a','xy4-120'],'xy5-123':['xy5-94','xy5-154'],
       'xy5-130':['xy5-106','xy5-156'],
       'xy5-131':['xy5-86','xy5-151','xy7-97'],
       'xy5-132':['xy5-55','xy5-149','xy7-96'],
       'xy6-83':['xy6-35','xy6-100'],
       'xy6-85':['xy6-59','xy6-102'],
       'xy6-87':['xy6-61','xy6-76','xy6-105','xy7-98'],
       'xy7-70':['xy7-28','xy7-88'],
       'xy7-80':['xy7-8','xy7-85'],
       'xy7-81':['xy7-43','xy7-92'],
       'xy8-139':['xy8-35','xy8-156'],
       'xy8-142':['xy8-22','xy8-154'],
       'xy8-144':['xy8-63','xy8-64','xy8-159','xy8-160'],
       'xy9-101':['xy9-27','xy9-115'],
       'xy9-111':['xy9-77','xy9-120'],
       'xy10-90':['xy10-26','xy10-118'],
       'xy10-91':['xy10-69','xy10-121'],
       'xy10-92':['xy10-85'],
       'xy11-101':['xy11-79','xy11-112'],
       'xy11-106':['xy11-68','xy11-109'],
       'xy12-73':['xy12-22','xy12-102'],
       'xy12-75':['xy12-13','xy12-101'],
       'xy12-81':['xy12-65','xy12-105'],
       'xy12-86':['xy12-27'],
       'xy12-89':['xy12-2','xy12-100']};
     if(xy5Links[card?.id]&&!fx?.spiritLinkSpecies(card)&&!pokemon.some(p=>xy5Links[card.id].includes(p.id)))return false;
     // Primal Clash's new Trainers must match the *constructed* 30-card
     // deck, not the full collection. Basic Energy in the automatic Zone is
     // not a printed hand card, so it cannot pay Scorched Earth's discard.
     // Archie/Maxie only work as the final hand card AND require a matching
     // real Pokémon in the discard. Do not auto-insert them as generic
     // Supporter filler into an unrelated 30-card deck. Manual picks remain.
     if(['xy5-124','xy5-157','xy5-133','xy5-158'].includes(card?.id)){
       const targetType=['xy5-124','xy5-157'].includes(card.id)?'Water':'Fighting';
       if(pokemon.filter(p=>(p.types||[]).includes(targetType)).length<3)return false;
       if(!cards.some(id=>{
         const c=classic.cardById(id),name=c?.name||'';
         return /^(Battle Compressor|Ultra Ball|Professor Sycamore|Professor Juniper|Computer Search|Acro Bike)$/.test(name)||
           (c?.deckMeta?.roles||[]).includes('discard');
       }))return false;
     }
     // Wally may accelerate an evolution even on turn one, but only a
     // constructed 30-card deck with a real parent/evolution pair can use it.
     // Do not auto-add either artwork as unthemed Supporter filler.
     if(['xy6-94','xy6-107'].includes(card?.id)&&!pokemon.some(evo=>
       evo.stage!=='Basic'&&pokemon.some(base=>
         classicCardName(base.name)===classicCardName(evo.evolvesFrom||'')&&base.id!==evo.id)))return false;
     // Teammates is a conditional comeback Supporter; avoid crowding the
     // scarce Trainer slots with copies in ultra-short Pokémon builds.
     if(['xy5-141','xy5-160'].includes(card?.id)&&pokemon.length<7)return false;
     if(card?.id==='xy5-137'&&!pokemon.some(p=>(p.types||[]).some(t=>t==='Water'||t==='Lightning')))return false;
     if(['xy5-138','xy10-110'].includes(card?.id)&&!cards.some(id=>{const c=classic.cardById(id);return c?.basicEnergy&&['Fire','Fighting'].includes(c.energyType||c.subtype);} ))return false;
     if(card?.id==='xy5-139'&&!pokemon.some(p=>p.stage!=='Basic'&&pokemon.some(b=>
       classicCardName(b.name)===classicCardName(p.evolvesFrom||'')&&b.id!==p.id)))return false;
     if(card?.id==='xy5-140'&&pokemon.some(p=>p.stage==='Basic'&&(p.abilities||[]).length))return false;
     // Ancient Origins Stadiums and Ability lock need a coherent deck plan.
     if(card?.id==='xy7-74'&&!pokemon.some(p=>(p.types||[]).includes('Grass')&&p.stage!=='Basic'&&
       pokemon.some(b=>(b.types||[]).includes('Grass')&&classicCardName(b.name)===classicCardName(p.evolvesFrom||''))))return false;
     if(card?.id==='xy7-73'&&pokemon.some(p=>p.megaEvolution))return false;
     if(['xy7-75','xy7-75a'].includes(card?.id)&&pokemon.filter(p=>(p.abilities||[]).length).length>3)return false;
     // Ancient Origins recycle Items need cards that genuinely enter the
     // matching discard zone. Avoid stuffing an unrelated compact deck with
     // Eco Arm or Energy Recycler as generic filler.
     if(card?.id==='xy7-71'&&cards.filter(id=>classic.cardById(id)?.trainerType==='Tool').length<2)return false;
     if(card?.id==='xy7-72'&&!pokemon.some(p=>(p.attacks||[]).some(a=>/discard.*energy|discard all.*energy/i.test(a.text||''))))return false;
     if(card?.id==='xy5-136'&&!pokemon.some(p=>pokemon.filter(other=>classicCardName(other.name)===classicCardName(p.name)).length>1))return false;

     // Evolution accelerators without Stage 2 targets are dead cards.
     if(card?.name==='Rare Candy'&&!pokemon.some(p=>p.stage==='Stage 2'))return false;
     if(card?.name==="Brock's Protection"&&!pokemon.some(p=>p.name.startsWith("Brock's ")))return false;
     // Across the Gym sets, Trainer names vary but their printed text is
     // decisive: an Item for Giovanni's/Koga's Pokémon is not generic filler.
     const gymOwners=['Brock','Misty','Erika','Lt. Surge','Koga','Sabrina','Blaine','Giovanni'];
     const targetText=String(card?.text||card?.printedRules||'');
     const owner=gymOwners.find(name=>new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"(?:['’]s)?\\s+Pok[eé]mon",'i').test(targetText));
     if(owner&&!pokemon.some(p=>p.name.startsWith(owner+"'s ")))return false;
     if(/^Mystery Plate [αβγδ]/.test(card?.name||'')&&cards.some(id=>/^Mystery Plate [αβγδ]/.test(classic.cardById(id)?.name||'')))return false;
     if(card?.name==='Apricorn Maker'&&!cards.some(id=>{
       const target=classic.cardById(id);return target?.kind==='trainer'&&/Ball/i.test(target.name||'')&&target.id!==card.id;
     }))return false;
     if(card?.name==='Heavy Ball'&&!pokemon.some(p=>Number(p.retreatCost??p.retreat??0)>=3))return false;
     // Frozen City damages both players, so a normal non-Plasma core hurts
     // itself. Only select it as a meaningful Team Plasma stadium.
     if(card?.name==='Frozen City'&&(!pokemon.some(p=>p.teamPlasma)||pokemon.some(p=>!p.teamPlasma)))return false;
     // VS Seeker can only recover a physical Supporter; don't select it
     // into a build with no Supporter cards whatsoever.
     if(card?.name==='VS Seeker'&&!cards.some(id=>classic.cardById(id)?.trainerType==='Supporter'))return false;
     // Roaring Skies Mega Turbo is dead without a Mega Evolution in this
     // *actual* deck, not merely in the owner's collection. Do not use the
     // Trainer as generic filler in all-Basic or non-Mega decks.
     if(card?.id==='xy6-86'&&!pokemon.some(p=>p.megaEvolution))return false;
     // Healing Scarf checks physical hand-Energy cards, not Energy Zone
     // attachments. A deck with no Special Energy has no routine trigger.
     if(card?.id==='xy6-84'&&!cards.some(id=>classic.cardById(id)?.specialEnergy))return false;
     // Wide Lens only changes damage to the opponent's Bench. Without an
     // actual printed Bench-damaging attack in this 30-card deck it cannot
     // contribute; don't auto-fill otherwise unrelated decks with the Tool.
     if(card?.id==='xy6-95'&&!pokemon.some(p=>(p.attacks||[]).some(a=>
       /(?:opponent['’]s|the opponent['’]s)\s+(?:Benched|Bench)|(?:opponent['’]s|the opponent['’]s)\s+Pok[eé]mon/i.test(String(a.text||''))&&
       /(?:damage to|does \d+ damage|damage on|damage among)/i.test(String(a.text||''))&&
       /(?:Benched|Bench)/i.test(String(a.text||'')))))return false;
     // Sky Field is not a generic filler Stadium: it earns its slot when the
     // deck can exploit more than three Bench spaces with Emerald Break.
     if(card?.id==='xy6-89'&&(!pokemon.some(p=>['xy6-76','xy6-105'].includes(p.id))||
       pokemon.filter(p=>p.stage==='Basic').length<5))return false;
   }
   // Supreme Victors Stadiums must strengthen the actual deck. Battle Tower
   // heals Pokémon only when they Level-Up; without a friendly LV.X it risks
   // healing only the opponent. Champion's Room helps Pokémon SP only.
   if(!manuallyKept&&card?.id==='pl3-134'&&!platinumMembers().some(p=>p.stage==='Level-Up'))return false;
   if(!manuallyKept&&card?.id==='pl3-135'&&!platinumMembers().some(p=>p.isPokemonSP))return false;
   if(!manuallyKept&&['pl2-90','pl2-91','pl2-95','pl2-96'].includes(card?.id)&&platinumSP()<1)return false;
   // Flint's Willpower attaches a physical basic Energy card from the hand.
   // A hybrid Zone-only Energy plan cannot fulfill that requirement, even
   // when a Pokémon SP is present.
   if(!manuallyKept&&card?.id==='pl2-91'&&!cards.some(id=>classic.cardById(id)?.basicEnergy))return false;
   // Never draw Fossils from the general Trainer pool without a matching
   // evolution already in the actual 30-card deck (not merely owned).
   if(isEvolutionFossil(card)&&!fossilEvolutionInDeck(card,cards))return false;
   if(isFossilSupport(card)&&!anyFossilEvolutionInDeck(cards))return false;
   // Legends Awakened: TS-1 Evoluter must have a real Stage 1/2 evolution
   // in the current deck. LV.X is not an Evolution card and is never a
   // valid Evoluter search result. Do not give an all-Basic deck four dead TMs.
   if(card?.id==='dp6-136'){
     const species=new Set(cards.map(id=>classic.cardById(id)?.name));
     if(!cards.some(id=>{const p=classic.cardById(id);return p?.kind==='pokemon'&&
       ['Stage 1','Stage 2'].includes(p.stage)&&species.has(p.evolvesFrom);}))return false;
   }
   // Compact 30-card decks should keep spare slots for draw, search and
   // counterplay, not fill eight of them with duplicate single-slot Tools.
   if(['dp6-129','dp6-136','dp6-137'].includes(card?.id)&&
      cards.filter(id=>id===card.id).length>=Math.max(2,existing.filter(id=>id===card.id).length))return false;
   if(card?.technicalMachine&&cards.some(id=>id==='ex11-25')){
     const supported=['ecard1-144','ex5-84','ex5-85','ex5-86'];
     if(!supported.includes(card.id))return false;
     if(cards.filter(id=>classic.cardById(id)?.technicalMachine).length>=2)return false;
   }
   // EX Deoxys Lady Outing searches fresh Basic Energy via the Zone in the
   // approved hybrid format; it must no longer be excluded as a dead card.
   if(['ex8-93','ex8-95'].includes(card?.id)&&!cards.some(id=>{const p=classic.cardById(id);return p?.kind==='pokemon'&&['Stage 1','Stage 2'].includes(p.stage)&&!p.pokemonEx;}))return false;
   if(card?.id==='ex7-95'&&!cards.some(id=>/^(Dark |Rocket's )/.test(classic.cardById(id)?.name||'')))return false;
   if(card?.id==='ex7-94'&&!selectedTypes.some(type=>['Darkness','Metal'].includes(type)))return false;
   // Holon Fossil only searches playable Fossil evolutions; it is dead filler
   // without Omanyte/Kabuto/Aerodactyl/Lileep/Anorith in this very deck.
   if(card?.id==='ex13-86'&&(cards.filter(id=>id==='ex13-86').length>=2||!cards.some(id=>['Omanyte','Kabuto','Aerodactyl','Aerodactyl ex','Lileep','Anorith'].includes(classicCardName(classic.cardById(id)?.name)))))return false;
   // Energy Root suppresses the wearer's Power/Body. It is legal on such
   // Pokemon, but an all-abilities deck must not automatically choose it.
   // Only non-ex, non-Dark, non-owner-named Pokemon are legal wearers.
   if(card?.id==='ex10-83'){
     const eligible=cards.map(classic.cardById).filter(p=>p?.kind==='pokemon'&&!p.pokemonEx&&
       !/^(?:Dark |Rocket's |Team Aqua's |Team Magma's |Brock's |Misty's |Lt\. Surge's |Erika's |Koga's |Blaine's |Sabrina's |Giovanni's )/.test(p.name||''));
     if(!eligible.length||eligible.every(p=>(p.abilities||[]).length>0))return false;
   }

   if(card?.kind==='trainer'&&!manuallyKept){if(cachedTrainerScore(card)===-Infinity)return false;}
   if(card.name==="Brock's Training Method")return cards.some(id=>{const pokemon=classic.cardById(id);return pokemon?.kind==='pokemon'&&pokemon.name.startsWith("Brock's ");});
   return true;
 }
 // In compact 30-card Stormfront decks, bulk-search Trainers should not
 // consume four slots merely because the owner has four copies. Saved manual
 // choices can be preserved up to the global four-copy limit.
 const stormfrontAutoCaps={'dp7-91':2,'dp7-86':1,'dp7-85':3,'dp7-83':2,'pl2-96':2,'pl2-95':2};
 // These XY10 cards answer narrow situations; a single copy leaves more room
 // for real draw/search and Pokémon lines. Explicit player copies still win.
 const xy10SituationalCaps={'xy10-94':1,'xy10-95':1,'xy10-97':1,'xy10-98':1,'xy10-101':2};
 function room(card){
   const arceusUnlimited=card.setId==='pl4'&&(/^AR[1-9]$/.test(String(card.number))||['94','95','96'].includes(String(card.number)));
   const name=classicCardName(card.name);
   const copiesOfName=nameCounts.get(name)||0;
   const starSlots=card.pokemonStar?Math.max(0,1-cards.filter(id=>classic.cardById(id)?.pokemonStar).length):arceusUnlimited?30:4;
   const aceSlots=card.aceSpec?Math.max(0,1-cards.filter(id=>classic.cardById(id)?.aceSpec).length):4;
   const miracleSlots=(name==='Miracle Energy'||card.prismStar)?Math.max(0,1-copiesOfName):4;
   const rawCap=stormfrontAutoCaps[card.id]??xy10SituationalCaps[card.id];
   let allowedCopies=arceusUnlimited?30:rawCap===undefined?4:Math.min(4,Math.max(rawCap,existing.filter(id=>id===card.id).length));
   if(energyFillerPhase&&card.specialEnergy){
     // Never turn the final third of a Zone-based deck into four copies of
     // unrelated physical Energy. Keep copies intentionally reserved earlier.
     allowedCopies=Math.min(allowedCopies,Math.max(copiesOfName,retainedNameCopies.get(name)||0,1));
   }
   if(card.kind==='trainer'&&!isEvolutionFossil(card)){
     const saved=retainedNameCopies.get(name)||0;
     // Evolution searching and rare synergy combos can reach three copies;
     // the generic filler phase starts at two before considering a third.
     const namedDependency=cards.some(id=>{
       const c=classic.cardById(id);return c?.kind==='pokemon'&&
         (c.deckMeta?.preferredTrainerNames||[]).includes(card.name);
     });
     const strategicCap=namedDependency?Math.min(4,autoTrainerCap+1):autoTrainerCap;
     allowedCopies=Math.min(allowedCopies,Math.max(saved,strategicCap));
   }
   return Math.max(0,Math.min(starSlots,aceSlots,miracleSlots,(card.name.startsWith('Shining ')?1:allowedCopies)-copiesOfName,Number(owned.get(card.id)||0)-(counts.get(card.id)||0)));
 }
 function hasBabyPartner(card){
   const names=babyEvolutionTargets(card);
   return !names.length||cards.some(id=>names.includes(classicCardName(classic.cardById(id)?.name)));
 }
 function add(card,n=1,fromEvolutionLine=false){
   if(card?.id==='bw3-15'&&!hasFiveBenchRoute)return 0;
   // Don't solve a weak Trainer plan by padding twenty-five irrelevant Basics.
   // Keep manual drafts and whole evolution packages intact.
   if(!fromEvolutionLine&&card?.kind==='pokemon'&&!existing.includes(card.id)&&
      cards.filter(id=>classic.cardById(id)?.kind==='pokemon').length>=autoPokemonCap)return 0;
   // Energy Link is useful as a coherent two-copy package, never a lone
   // tool that wastes the final slot. Reserve the pair atomically.
   if(card?.id==='dp7-83'&&!fromEvolutionLine&&(counts.get(card.id)||0)===0){
     if(Number(owned.get(card.id)||0)<2||cards.length>28||room(card)<2)return 0;
     n=Math.max(n,2);
   }
   if(!fromEvolutionLine&&isEvolutionFossil(card)&&!fossilEvolutionInDeck(card,cards))return 0;if(!fromEvolutionLine&&!hasBabyPartner(card))return 0;if(card?.kind==='trainer'&&!fromEvolutionLine&&!trainerIsUseful(card))return 0;if(card?.trainerType==='Stadium'&&cards.filter(id=>classic.cardById(id)?.trainerType==='Stadium').length>=1&&!cards.includes(card.id))return 0;let added=0;while(added<n&&cards.length<30&&room(card)>0&&(!['dp6-129','dp6-136','dp6-137'].includes(card?.id)||fromEvolutionLine||cards.filter(id=>id===card.id).length<Math.max(2,existing.filter(id=>id===card.id).length))&&!(card?.trainerType==='Stadium'&&cards.filter(id=>classic.cardById(id)?.trainerType==='Stadium').length>=2)){cards.push(card.id);counts.set(card.id,(counts.get(card.id)||0)+1);const name=classicCardName(card.name);nameCounts.set(name,(nameCounts.get(name)||0)+1);added++;}return added;}
 function addLine(line,copies){if(!line.length||line.some(c=>Number(owned.get(c.id)||0)<1))return false;for(let copy=0;copy<copies;copy++){if(line.some(c=>room(c)<1)||cards.length+line.length>30)break;for(const c of line)add(c,1,true);}return line.every(c=>(counts.get(c.id)||0)>0);}
 // Preserve legal existing cards first for Fill / repair, but never exceed ownership/copy limits.
 for(const id of existing){const c=classic.cardById(id);if(c&&allowedInSetPool(c,scope)&&c.battleEnabled&&c.deckEligible!==false&&!babyEvolutionTargets(c).length&&!isEvolutionFossil(c)&&!isFossilSupport(c))add(c,1);}
 // Existing draft cards are preserved where coherent. For a manually
 // saved Baby-first list, insert the playable partner before the Baby; never
 // silently preserve an orphaned Baby in a generated/fill result.
 for(const id of existing){const c=classic.cardById(id);if(!c||!allowedInSetPool(c,scope)||!c.battleEnabled||c.deckEligible===false||!babyEvolutionTargets(c).length)continue;
   if(!hasBabyPartner(c)){
     const partner=playableBabyTargets(c,selectedTypes)[0];
     if(partner&&!cards.includes(partner.id)&&cards.length<29)add(partner,1,true);
   }
   add(c,1);
 }
 // Ensure any preserved evolutions gain their missing prerequisites.
 for(const id of [...cards]){const c=classic.cardById(id);if(c?.kind==='pokemon'&&c.stage!=='Basic'){const line=familyLine(c,evolutionPool);if(line.length)for(const member of line.slice(0,-1))if(!(counts.get(member.id)||0))add(member,1,member?.effect?.type==='playFossil');}}
 // Fill/repair may retain an owned Fossil only after its direct evolution
 // survived the initial filter. It must never keep an orphan saved Item.
 for(const id of existing){const c=classic.cardById(id);if(!c||!allowedInSetPool(c,scope)||!c.battleEnabled||c.deckEligible===false)continue;
   if(isEvolutionFossil(c)&&fossilEvolutionInDeck(c,cards))add(c,1);
   if(isFossilSupport(c)&&anyFossilEvolutionInDeck(cards))add(c,1);
 }
 const mainCopies=mainLine.length>=2?3:4;addLine(mainLine,mainCopies);
 // Reserve the Baby's real Basic evolution partner *before* generic
 // Pokémon and Trainers fill the deck. This is not an ordinary evolution line
 // and must not be inferred from the evolvesFrom field.
 if(mainLine.some(c=>babyEvolutionTargets(c).length)){
   for(const baby of mainLine.filter(c=>babyEvolutionTargets(c).length)){
     const partner=playableBabyTargets(baby,selectedTypes)[0];
     if(!partner)return fail(`Cannot build around ${baby.name} without its Baby Evolution partner in the selected, owned card pool.`);
     const babyCopies=counts.get(baby.id)||0;
     if(!hasBabyPartner(baby)&&!add(partner,Math.min(2,Math.max(1,Math.ceil(babyCopies/2))),true))
       return fail(`Cannot add ${baby.name}'s Baby Evolution partner ${partner.name} to this deck.`);
   }
 }
 // Baby evolution support is not an ordinary Stage-1 predecessor: printed
 // Azurill->Marill and Budew->Roselia are optional in-hand Powers. A focus
 // on their explicit payoffs should still receive playable Baby copies.
 if(scope.includes('dp1')&&!basicOnly){
   const names=[...new Set(mainLine.flatMap(c=>c.deckMeta?.babyEvolutionSupport||[]))];
   for(const name of names){const baby=pokemonPool.find(c=>c.name===name&&c.setId==='dp1'&&c.battleEnabled);
     if(baby&&hasBabyPartner(baby)&&room(baby)>0)add(baby,Math.min(2,room(baby)));
   }
 }
 // The supported Stage 2 ex is the win condition in an Xatu/Altaria/Swellow
 // focused deck. Include the FULL evolution family, not just its Stage 2.
 if(stage2Beneficiary)addLine(familyLine(stage2Beneficiary,evolutionPool),2);
 // A stage-two engine wants one more opening Basic than evolution cards.
 if(mainLine.length>=2)add(mainLine[0],1,true);
 // Fossil lines need a playable Fossil Basic in the 30-card deck. A normal
 // Trainer synergy filter can reject these (they are Trainers with Colorless
 // identity), so addLine deliberately inserts their printed prerequisites.
 // Holon Fossil is an optional second route to benching those evolutions,
 // not generic Trainer filler in decks with no valid fossil targets.
 const holonFossil=classic.cardById('ex13-86');
 if(holonFossil&&allowedInSetPool(holonFossil,scope)&&
   cards.some(id=>['Omanyte','Kabuto','Aerodactyl','Aerodactyl ex','Lileep','Anorith'].includes(classicCardName(classic.cardById(id)?.name))))
   add(holonFossil,1);
 const pokemonCount=()=>cards.map(classic.cardById).filter(c=>c?.kind==='pokemon').length;
 const neededTypes=()=>[...new Set(cards.map(classic.cardById).flatMap(attackTypes).filter(t=>selectedTypes.includes(t)))];
 // Lock support selection to the featured family's actual Energy plan. The
 // previous <=2-type check splashed unrelated Grass attackers into mono-Water
 // decks, then the automatic Energy Zone gave them 50% Grass draws. A true
 // dual-cost featured family (or two explicitly selected types) still works.
 const plannedEnergy=selectedTypes.slice();
 const canFitEnergy=c=>{
   // A support-only line (Xatu, Swellow, Altaria ex) must not slip into a
   // Charizard Star / ordinary Stage 1 deck just because its attack is
   // affordable. Its real payoff requires a Stage 2 Pokémon-ex already here.
   if(isStage2OnlySupport(c)&&!cards.some(id=>{const p=classic.cardById(id);return p?.pokemonEx&&p.stage==='Stage 2';}))return false;
   const line=familyLine(c,evolutionPool),family=line.length?line:[c],needed=[...new Set([...neededTypes(),...familyEssentialTypes(family)])],special=specialCosts([...cards.map(classic.cardById).filter(Boolean),...family]);
   return (options._allowSecondType===true&&!requestedEnergy.length?needed.length<=2:needed.every(t=>plannedEnergy.includes(t)))&&family.every(member=>conditionalAttackUseful(member,plannedEnergy))&&Object.entries(special).every(([sym,n])=>!n||allowedInSetPool(classic.cardById(SPECIAL_COST_CARDS[sym]),scope)&&Number(owned.get(SPECIAL_COST_CARDS[sym])||0)>=n);
 };
 const chooseCandidate=candidates=>{
   if(!candidates.length)return null;
   if(style==='random'){
     const band=candidates.slice(0,Math.min(6,candidates.length));
     return band[Math.floor(random()*band.length)]||band[0];
   }
   return candidates[0];
 };
 // EX Dragon Frontiers' Stage-2-ex support is a *shared* synergy:
 // Xatu gives attack damage, Swellow gives free retreat, Altaria ex ramps
 // actual Basic Energy from hand, and Kingdra ex reduces incoming damage.
 // A support's Bench Body does not require paying its own attack costs.
 if(!basicOnly&&cards.length<=23&&pokemonCount()<=16){
   const hasStage2Ex=cards.some(id=>{const c=classic.cardById(id);return c?.pokemonEx&&c.stage==='Stage 2';});
   const supportInMain=mainLine.some(isStage2OnlySupport);
   if(!hasStage2Ex&&!supportInMain){ // ordinary attacker: no useless ex support
   }else if(hasStage2Ex){
     // First add Xatu (offensive payoff), then Swellow (mobility). Don't add
     // duplicates of the main evolution line; support is intentionally small.
     for(const id of ['ex15-25','ex15-40']){
       const helper=classic.cardById(id);
       if(!helper||!pool.includes(helper)||cards.includes(id))continue;
       const line=familyLine(helper,evolutionPool);
       if(line.length===2&&line.every(member=>room(member)>0)&&pokemonCount()+line.length<=17&&cards.length+line.length<=26)
         addLine(line,1);
     }
     // Altaria ex requires a PHYSICAL Basic Energy card in hand and is not
     // useful with a bare Energy Zone. Only include it with a hand source.
     const altaria=classic.cardById('ex15-90');
     const hasHandSource=pool.some(c=>c.kind==='trainer'&&c.name==="Mr. Stone's Project");
     if(!supportInMain&&hasHandSource&&altaria&&pool.includes(altaria)&&!cards.includes(altaria.id)){
       const line=familyLine(altaria,evolutionPool);
       if(line.length===2&&line.every(member=>room(member)>0)&&pokemonCount()+2<=17&&cards.length+line.length<=24)
         addLine(line,1);
     }
   }
 }
 // Prefer an entire compatible evolution partner; never add an isolated Basic
 // whose strength depends upon an unavailable evolution (e.g. Base Set Koffing).
 const partnerCandidates=endpointCards(pokemonPool).filter(c=>
   c.id!=='dp6-143'&& // handled as a complete three-LV.X combo, not isolated filler
   !basicOnly&&matchesRarity(c,rarityFocus,false)&&
   familyRoot(c,evolutionPool)!==mainRoot&&familyRoot(c,evolutionPool)!=='Koffing'&&familyLine(c,evolutionPool).length===2&&canFitEnergy(c)
 ).sort((a,b)=>{
   const newA=attackTypes(a).filter(t=>!selectedTypes.includes(t)).length;
   const newB=attackTypes(b).filter(t=>!selectedTypes.includes(t)).length;
   const matchingA=effectiveTypes(a).some(t=>effectiveTypes(main).includes(t))?1:0;
   const matchingB=effectiveTypes(b).some(t=>effectiveTypes(main).includes(t))?1:0;
   // Within the same playable Energy type, prefer actual same-type partners
   // unless the user has explicitly requested a themed synergy deck.
   const cohesion=theme==='any'?matchingB-matchingA:0;
   return newA-newB||cohesion||synergy.pokemonThemeScore(b,theme)-synergy.pokemonThemeScore(a,theme)||matchingB-matchingA||pokemonScore(b,evolutionPool)-pokemonScore(a,evolutionPool)||Number(a.number)-Number(b.number);
 });
 if(pokemonCount()<=11){
   // A named synergy in a printed attack is stronger evidence of a partner
   // than general HP/type scoring (Jungle Nidoqueen's Boyfriends / Nidoking).
   const namedEffects=[...(main.attacks||[]),...(main.abilities||[])].map(x=>String(x.text||'')).join(' ').toLowerCase();
   const namedPartners=endpointCards(pokemonPool).filter(c=>c.id!==main.id&&c.stage!=='Basic'&&
      namedEffects.includes(c.name.toLowerCase())&&familyLine(c,evolutionPool).length>=2&&canFitEnergy(c));
   const partner=chooseCandidate(namedPartners.length?namedPartners:partnerCandidates);
   if(partner)addLine(familyLine(partner,evolutionPool),namedPartners.length?1:2);
 }
 // Printed in-play partner effects are optional support plans. A Water
 // Regice ex deck may Bench Regirock ex to unlock Iceberg Crush without
 // having to dilute its Energy Zone with Fighting. This is an option, never
 // a mandatory inclusion, and follows selected-set and ownership constraints.
 const optionalPartners=mainLine.flatMap(c=>synergy.metadata(c).optionalPartners||[]);
 const optionalInPlay=endpointCards(pokemonPool).filter(c=>
  optionalPartners.some(partner=>classicCardName(partner.name).toLowerCase()===classicCardName(c.name).toLowerCase()&&
   // 'Preferred partner' is a metadata suggestion, NOT a licence to add
   // unplayable Fighting Meganium to a Lightning Feraligatr deck. Only a
   // genuine printed "in play" dependency may justify an off-type Bench card.
   (canFitEnergy(c)||partner.source!=='printed synergy metadata'&&!isStage2OnlySupport(c)))&&
  c.id!==main.id&&familyRoot(c,evolutionPool)!==mainRoot&&
  (!basicOnly||c.stage==='Basic')&&familyLine(c,evolutionPool).length>0&&room(c)>0
 ).sort((a,b)=>{
  const easyA=a.stage==='Basic'?1:0,easyB=b.stage==='Basic'?1:0;
  return easyB-easyA||pokemonScore(b,evolutionPool)-pokemonScore(a,evolutionPool);
 });
 const partnerRoll=([...String(main.id)].reduce((h,ch)=>Math.imul(h^ch.charCodeAt(0),16777619)>>>0,Math.imul((Number(options.randomSeed)||0)+7,2654435761)>>>0))/4294967296;
 const tryInPlayPartner=optionalInPlay.length&&pokemonCount()<12&&partnerRoll<(style==='competitive'?0.70:0.40);
 if(tryInPlayPartner){const partner=optionalInPlay[0],line=familyLine(partner,evolutionPool);
  if(line.length&&cards.length+line.length<=30&&line.every(c=>room(c)>0))addLine(line,1);
 }
 // Holon Phantoms Form Change is a real alternate-Pokémon line, not four
 // identical copies of the same Deoxys print. An off-type form is never
 // selected unless its required attack symbols fit the chosen Energy plan.
 const deoxysFormIds=['ex13-3','ex13-4','ex13-5','ex13-6'];
 if(cards.some(id=>deoxysFormIds.includes(id))&&cards.length<30){
   const available=deoxysFormIds.filter(id=>!cards.includes(id)).map(classic.cardById).filter(c=>c&&pool.includes(c)&&
     attackTypes(c).every(t=>selectedTypes.includes(t))&&room(c)>0);
   if(available.length)add(available[0],1);
 }
 // Supplement only when there is room and a genuinely useful independent role.
 // No arbitrary 14-Pokémon quota: extra Trainers are often more valuable.
 const evolvingNames=new Set(classic.CARDS.filter(c=>c.kind==='pokemon'&&c.evolvesFrom).map(c=>classicCardName(c.evolvesFrom)));
 const usefulBasics=pokemonPool.filter(c=>matchesRarity(c,rarityFocus,true)&&c.stage==='Basic'&&
   !evolvingNames.has(classicCardName(c.name))&&familyRoot(c,evolutionPool)!==mainRoot&&canFitEnergy(c)&&standaloneScore(c)>=70
 ).sort((a,b)=>{
   // Do not splash an unrelated Fire attacker into every Water/Psychic/Fighting
   // deck simply because it has high HP or efficient opening damage.
   const required=neededTypes();
   const extraA=attackTypes(a).filter(t=>!required.includes(t)).length;
   const extraB=attackTypes(b).filter(t=>!required.includes(t)).length;
   const sameTypeA=effectiveTypes(a).some(t=>effectiveTypes(main).includes(t))?1:0;
   const sameTypeB=effectiveTypes(b).some(t=>effectiveTypes(main).includes(t))?1:0;
   return extraA-extraB||(theme==='any'?sameTypeB-sameTypeA:0)||synergy.pokemonThemeScore(b,theme)-synergy.pokemonThemeScore(a,theme)||standaloneScore(b)-standaloneScore(a)||Number(a.number)-Number(b.number);
 });
 if(pokemonCount()<12){
   const support=chooseCandidate(usefulBasics);
   if(support)add(support,Math.min(2,room(support)));
 }
 // Legends Awakened: these Powers require physically distinct form prints
 // in the deck. The battle engine already swaps from the actual deck; having
 // four of the *same* Deoxys/Castform makes Form Change/Temperament dead.
 // Do not introduce an off-type attack that the selected Energy Zone cannot pay.
 for(const group of ['deoxys','castform']){
   const grouped=cards.map(classic.cardById).filter(c=>c?.setId==='dp6'&&
     (c.abilities||[]).some(a=>a.formGroup===group));
   if(!grouped.length)continue;
   const present=new Set(grouped.map(c=>c.id));
   const compatible=pokemonPool.filter(c=>c.setId==='dp6'&&!present.has(c.id)&&
     (c.abilities||[]).some(a=>a.formGroup===group)&&room(c)>0&&
     attackTypes(c).every(t=>plannedEnergy.includes(t)));
   // Distinct forms matter more than repeat copies; prefer the original form
   // as an accessible return-to-baseline when it is not already selected.
   compatible.sort((a,b)=>Number(b.number=== (group==='deoxys'?'1':'48'))-
     Number(a.number=== (group==='deoxys'?'1':'48'))||Number(a.number)-Number(b.number));
   for(const candidate of compatible.slice(0,2))if(cards.length<26&&pokemonCount()<16)
     add(candidate,Math.min(present.size===1?2:1,room(candidate)),true);
 }
 // Ninjask's printed Cast-off Shell summons Shedinja from hand/discard as a
 // Basic. It is wasted if the auto deck contains no Shedinja at all.
 if(cards.includes('dp6-67')&&!cards.includes('dp6-40')){
   const ninjaPartner=classic.cardById('dp6-40');
   if(ninjaPartner&&pool.includes(ninjaPartner)&&pokemonCount()<17&&cards.length<27)
     add(ninjaPartner,Math.min(2,room(ninjaPartner)),true);
 }
 // Supreme Blast requires BOTH Azelf LV.X and Uxie LV.X in play.  A lonely
 // Mesprit LV.X from the ordinary partner picker has a dead signature attack.
 // Include real prerequisite Basic + LV.X lines, never bare Level-Up cards.
 if(cards.includes('dp6-143'))for(const partnerId of ['dp6-140','dp6-146']){
   if(cards.includes(partnerId))continue;
   const lv=classic.cardById(partnerId),line=lv?familyLine(lv,evolutionPool):[];
   if(line.length===2&&line.every(member=>pool.includes(member)&&room(member)>0)&&
      familyEssentialTypes(line).every(t=>plannedEnergy.includes(t))&&
      cards.length+line.length<=29&&pokemonCount()+line.length<=17)
     addLine(line,1);
 }
 // Special Energy is non-negotiable for a Darkness or Metal attacker.
 // Reserve it ahead of Trainers, otherwise the generated 30-card deck can
 // contain a Sneasel/Steelix that literally cannot pay for its signature move.
 const specialNeeds=specialCosts(cards.map(classic.cardById).filter(Boolean));
 for(const [symbol,needed] of Object.entries(specialNeeds))if(needed){
   const energyCard=classic.cardById(SPECIAL_COST_CARDS[symbol]);
   if(energyCard&&allowedInSetPool(energyCard,scope))add(energyCard,Math.min(4,Math.max(needed*2,2)));
 }
 // Primal Clash: Mega/Primal evolutions ordinarily end the turn. A
 // constructed line without its matching Spirit Link is much less useful.
 // Reserve at most two *owned, matching* Tools before generic Trainer filler
 // takes the remaining slots; never add a link for a missing evolution.
 const xy5SpiritLinks=[
   ['xy4-95',['xy4-35','xy4-121']], // Manectric Spirit Link
   ['xy4-100',['xy4-24','xy4-24a','xy4-120']], // Gengar Spirit Link
   ['xy5-123',['xy5-94','xy5-154']],  // M Aggron-EX
   ['xy5-130',['xy5-106','xy5-156']],// M Gardevoir-EX
   ['xy5-131',['xy5-86','xy5-151','xy7-97']], // Primal Groudon-EX
   ['xy5-132',['xy5-55','xy5-149','xy7-96']], // Primal Kyogre-EX
   ['xy6-83',['xy6-35','xy6-100']], // M Gallade-EX
   ['xy6-85',['xy6-59','xy6-102']], // M Latios-EX
   ['xy6-87',['xy6-61','xy6-76','xy6-105','xy7-98']], // M Rayquaza-EX
   ['xy7-70',['xy7-28','xy7-88']], // M Ampharos-EX
   ['xy7-80',['xy7-8','xy7-85']], // M Sceptile-EX
   ['xy7-81',['xy7-43','xy7-92']], // M Tyranitar-EX
   ['xy8-139',['xy8-35','xy8-156']], // M Glalie-EX
   ['xy8-142',['xy8-22','xy8-154']], // M Houndoom-EX
   ['xy8-144',['xy8-63','xy8-64','xy8-159','xy8-160']], // M Mewtwo-EX
   ['xy9-101',['xy9-27','xy9-115']], // M Gyarados-EX
   ['xy9-111',['xy9-77','xy9-120']], // M Scizor-EX
   ['xy10-90',['xy10-26','xy10-118']], // M Alakazam-EX
   ['xy10-91',['xy10-69','xy10-121']], // M Altaria-EX
   ['xy10-92',['xy10-85']], // M Audino-EX
   ['xy11-101',['xy11-79','xy11-112']], // M Gardevoir-EX
   ['xy11-106',['xy11-68','xy11-109']], // M Steelix-EX
   ['xy12-73',['xy12-22','xy12-102']], // M Blastoise-EX
   ['xy12-75',['xy12-13','xy12-101']], // M Charizard-EX
   ['xy12-81',['xy12-65','xy12-105']], // M Pidgeot-EX
   ['xy12-86',['xy12-27']], // M Slowbro-EX
   ['xy12-89',['xy12-2','xy12-100']] // M Venusaur-EX
 ];
 for(const [id,partners] of xy5SpiritLinks){
   const link=classic.cardById(id);
   if(!partners.some(p=>cards.includes(p))&&!selectedPokemon().some(p=>fx?.spiritLinkEvolution(link,p)))continue;
   if(link&&pool.includes(link)&&trainerIsUseful(link))add(link,Math.min(2,room(link)));
 }
 // Double Dragon Energy provides two flexible units only on Dragon Pokémon.
 // Add it early to real Dragon lines (rather than as generic filler) and
 // NEVER to a non-Dragon deck where it cannot legally be attached.
 const dragonLine=cards.some(id=>(classic.cardById(id)?.types||[]).includes('Dragon'));
 if(dragonLine){
   const doubleDragon=classic.cardById('xy6-97');
   if(doubleDragon&&pool.includes(doubleDragon)&&cards.length<29)
     add(doubleDragon,Math.min(2,room(doubleDragon)));
 }
 // The 30-card format EXCLUDES physical Basic Energy. Sceptile Nurture and
 // Heal, Mega Sceptile Jagged Saber and Torchic Flare Bonus need Energy in hand, which ordinary
 // turn attachments from the Energy Zone do not supply. Reserve compatible
 // Zone-to-hand search Trainers from the owned/set-scoped pool, if available.
 const xy5HandEnergyNeeds=[['xy5-8','Grass'],['xy5-26','Fire'],['xy7-8','Grass'],['xy7-85','Grass']]
   .filter(([id])=>cards.includes(id));
 if(xy5HandEnergyNeeds.length){
   const energyToHandRules=new Set(['bw1:energySearch','bw4:cilan','ex1:basicSearch1','ex1:basicSearch2','expedition:energySearch','ex9:trainer:79','ex15:77:trainer']);
   const searchers=pool.filter(c=>c.kind==='trainer'&&c.battleEnabled!==false&&
     (energyToHandRules.has(c.effect?.rule)||c.name==='Energy Search'||c.id==='xy7-95'))
     .sort((a,b)=>Number(a.trainerType==='Item')-Number(b.trainerType==='Item')||
       Number(b.setId===main.setId)-Number(a.setId===main.setId)||a.id.localeCompare(b.id));
   let reserve=2;
   for(const trainer of searchers){if(reserve<=0||cards.length>=30)break;
     reserve-=add(trainer,Math.min(reserve,room(trainer)));
   }
 }
 // EX Dragon Frontiers Fellow Boost attaches a physical Basic Energy *from
 // hand*, not the hybrid Energy Zone. Mr Stone's Project can fetch Basic
 // Energy into hand so the Power is usable without rewriting its printed rule.
 const fellowBoostCore=mainLine.some(c=>c.id==='ex15-95');
 const fellowBoostSupport=cards.some(id=>id==='ex15-95');
 const altariaBoostSupport=cards.includes('ex15-90')&&cards.some(id=>{const c=classic.cardById(id);return c?.pokemonEx&&c.stage==='Stage 2';});
 if(fellowBoostCore||fellowBoostSupport||altariaBoostSupport){
   const stones=pool.filter(c=>c.name==="Mr. Stone's Project"&&c.kind==='trainer')
     .sort((a,b)=>Number(b.setId===main.setId)-Number(a.setId===main.setId)||a.id.localeCompare(b.id));
   let remaining=fellowBoostCore||mainLine.some(c=>c.id==='ex15-90')?3:2;
   for(const trainer of stones){if(!remaining)break;remaining-=add(trainer,Math.min(remaining,room(trainer)));}
 }
 // Printed Special Energy dependencies must be chosen before generic draw
 // Trainers fill all 30 card slots. In the hybrid format the Basic Energy
 // triggers are fulfilled by the separately configured Energy Zone.
 const energySupportContext=()=>synergy.context(cards.map(classic.cardById).filter(Boolean),selectedTypes,theme,main);
 const rankedHolon=pool.filter(c=>c.specialEnergy&&/^Holon Energy (?:FF|GL|WP)$/.test(c.name||''))
   .map(card=>({card,score:synergy.specialEnergyScore(card,energySupportContext())}))
   .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.card.id.localeCompare(b.card.id));
 if(rankedHolon.length){
   const strongest=rankedHolon[0],ctx=energySupportContext(),payoff=ctx.specialEnergyPayoffs.has('holon-energy');
   // Two useful copies for Rayquaza / Castform payoff builds; otherwise one
   // protective copy. Never pollute a deck with inactive Energy variants.
   const total=Math.min(payoff?2:1,Math.max(0,2-cards.filter(id=>/^Holon Energy (?:FF|GL|WP)$/.test(classic.cardById(id)?.name||'')).length));
   let remain=total;
   for(const {card,score} of rankedHolon){
     if(!remain)break;
     if(score<strongest.score-80&&(!ctx.specialEnergyPayoffs.has('holon-energy')||score<150))continue;
     remain-=add(card,Math.min(remain,room(card)));
   }
 }
 // Fates Collide Strong Energy is a genuine Fighting attack modifier, not
 // generic hand-card filler. Reserve two physical copies for a Fighting
 // attacker, then leave most of the 30-card deck for coherent Trainers.
 if(scope.includes('xy10')){
   const fighters=cards.map(classic.cardById).filter(c=>c?.kind==='pokemon'&&
     (c.types||[]).includes('Fighting')&&
     (c.attacks||[]).some(a=>Array.isArray(a.cost)?a.cost.includes('F'):String(a.cost||'').includes('F')));
   if(fighters.length&&selectedTypes.includes('Fighting')){
     const strong=classic.cardById('xy10-115');if(strong&&pool.includes(strong))add(strong,Math.min(2,room(strong)));
   }
   const wideColorless=cards.map(classic.cardById).some(c=>c?.kind==='pokemon'&&
     (c.attacks||[]).some(a=>{const cost=Array.isArray(a.cost)?a.cost:String(a.cost||'').split('');return cost.filter(t=>t==='C').length>=2;}));
   if(wideColorless){const dce=classic.cardById('xy10-114');if(dce&&pool.includes(dce))add(dce,Math.min(1,room(dce)));}
 }
 // EX Legend Maker React Energy supplies Colorless, but printed React bonuses
 // belong in focused React archetypes, not generic Special Energy filler.
 const liveReact=cards.map(classic.cardById).some(c=>c?.kind==='pokemon'&&c.deckMeta?.specialEnergyPayoffs?.includes('react-energy'));
 const reactEnergy=classic.cardById('ex12-82');
 if(liveReact&&reactEnergy&&allowedInSetPool(reactEnergy,scope))add(reactEnergy,Math.min(3,room(reactEnergy)));
 // EX Holon Phantoms: reserve rule-relevant Special Energy and Holon
 // Stadium support before generic Trainer filler. δ Rainbow is Colorless on
 // non-δ Pokémon; do not treat it as an unrestricted rainbow for all decks.
 const selectedMons=cards.map(classic.cardById).filter(c=>c?.kind==='pokemon');
 const deltaMons=selectedMons.filter(c=>c.deltaSpecies),deltaMain=deltaMons.length>0;
 const wantsDeltaRainbow=deltaMons.some(c=>{
   const symbols=new Set((c.attacks||[]).flatMap(a=>String(a.cost||'').split('').filter(t=>t!=='C')));
   return symbols.size>=2||symbols.size===1&&!selectedTypes.some(t=>[...symbols].includes(({Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M'})[t]));
 });
 const deltaRainbow=classic.cardById('ex13-98');
 if(deltaMain&&deltaRainbow&&allowedInSetPool(deltaRainbow,scope))
   add(deltaRainbow,Math.min(wantsDeltaRainbow?2:1,room(deltaRainbow)));
 const holonLake=classic.cardById('ex13-87');
 const holonLakeUseful=deltaMons.some(c=>c.deckMeta?.holonStadiumPayoff)||deltaMons.length>=2;
 if(holonLakeUseful&&holonLake&&allowedInSetPool(holonLake,scope)&&!
   cards.some(id=>classic.cardById(id)?.trainerType==='Stadium'))add(holonLake,1);
 const mainMetal=(mainLine||[]).some(c=>(c.types||[]).includes('Metal')||(c.deckMeta?.requiredEnergyTypes||[]).includes('Metal'));
 const defensiveMetal=classic.cardById('ex13-95');
 if(mainMetal&&selectedTypes.includes('Metal')&&defensiveMetal&&allowedInSetPool(defensiveMetal,scope))add(defensiveMetal,Math.min(1,room(defensiveMetal)));
 // Call of Legends has two *physical* Special Energy prints. Reserve them
 // before Trainer filler when matching Pokémon are actually in the deck: this
 // lets Skarmory's Steel Coat search a real Metal Energy card and gives Dark/
 // Metal Pokémon their printed Special Energy payoff. The Basic Energy Zone
 // remains separate, and no Basic Energy cards are added to the 30-card deck.
 if(scope.includes('col1')){
   const pokemon=cards.map(classic.cardById).filter(c=>c?.kind==='pokemon');
   for(const [id,type] of [['col1-86','Darkness'],['col1-87','Metal']]){
     if(!pokemon.some(c=>(c.types||[]).includes(type)))continue;
     const physical=classic.cardById(id);
     if(physical&&allowedInSetPool(physical,scope))add(physical,Math.min(2,room(physical)));
   }
 }
 // v0.69.314 Plasma Freeze / Storm physical Plasma Energy. The Zone's
 // Colorless counter is not a Plasma Energy CARD. When the printed attack
 // payoff checks Plasma Energy or Colress Machine can attach one, reserve
 // actual Special Energy copies before Trainer filler crowds them out.
 // Include BW8, BW9 and BW10 cards, preferring the focus set's identical print.
 if(scope.includes('bw8')||scope.includes('bw9')||scope.includes('bw10')||scope.includes('bw11')){
   const pokemon=cards.map(classic.cardById).filter(c=>c?.kind==='pokemon');
   const plasmaPayoff=pokemon.some(c=>(c.attacks||[]).some(a=>/Plasma Energy attached|Plasma Gale/i.test(String(a.text||'')+' '+a.name)));
   const hasColressMachine=pool.some(c=>c.name==='Colress Machine'&&c.battleEnabled);
   const plasmaPackage=pokemon.some(c=>c.teamPlasma)&&hasColressMachine;
   const requested=plasmaPayoff?3:plasmaPackage?2:0;
   if(requested){
     const energies=pool.filter(c=>c.kind==='energy'&&c.specialEnergy&&c.name==='Plasma Energy')
       .sort((a,b)=>Number(b.setId===main.setId)-Number(a.setId===main.setId)||a.id.localeCompare(b.id));
     let remaining=requested;
     for(const energyCard of energies){
       if(remaining<=0||cards.length>=30)break;
       remaining-=add(energyCard,Math.min(remaining,room(energyCard)));
     }
   }
 }
 const flexibleDarkMetal=classic.cardById('ex13-97');
 if(flexibleDarkMetal&&allowedInSetPool(flexibleDarkMetal,scope)&&
   selectedTypes.includes('Darkness')&&selectedTypes.includes('Metal'))add(flexibleDarkMetal,1);
 // Stage-2 Powers that reveal physical deck cards (Charizard δ's Peal of
 // Thunder) cannot find Basic Energy in the separate Zone. Reserve actually
 // owned, legally attachable *physical* Energy before general Trainers. This
 // is a payoff/dependency choice, not a conversion of the Energy Zone or a
 // blanket Special Energy filler rule. Dragon-type mixed Energy costs remain
 // served by the planned Basic Energy Zone separately.
 const revealedPhysicalEnergyCore=mainLine.some(c=>(c.deckMeta?.triggerDependencies||[]).includes('top-five-physical-deck-energy'));
 const revealedPhysicalEnergySupport=cards.map(classic.cardById).some(c=>c?.kind==='pokemon'&&(c.deckMeta?.triggerDependencies||[]).includes('top-five-physical-deck-energy'));
 const hasEvolvedNonExTarget=cards.map(classic.cardById).some(c=>c?.kind==='pokemon'&&['Stage 1','Stage 2'].includes(c.stage)&&!c.pokemonEx);
 const peekEnergyNames=new Set(cards.map(classic.cardById).flatMap(c=>c?.deckMeta?.physicalDeckEnergyPayoffs||[]));
 const eligiblePeekEnergy=pool.filter(c=>c.kind==='energy'&&c.specialEnergy&&peekEnergyNames.has(c.name))
   .sort((a,b)=>Number(b.setId===main.setId)-Number(a.setId===main.setId)||a.id.localeCompare(b.id));
 if(revealedPhysicalEnergySupport&&hasEvolvedNonExTarget){
   let reserve=revealedPhysicalEnergyCore?3:2;
   for(const energyCard of eligiblePeekEnergy){
     if(reserve<=0)break;
     reserve-=add(energyCard,Math.min(reserve,room(energyCard)));
   }
 }
 // Tool-triggered Metal Star / Pump Out is genuinely unusable without a
 // physical Pokémon Tool. Reserve Tools before Supporter/Item filler.
 const needsPokemonTool=cards.map(classic.cardById).some(c=>c?.kind==='pokemon'&&
   (c.deckMeta?.requiresTools||[]).includes('pokemonTool'));
 if(needsPokemonTool){
   const tools=pool.filter(c=>c.trainerType==='Tool'&&c.battleEnabled&&trainerIsUseful(c))
     .sort((a,b)=>Number(b.id==='ex15-81')-Number(a.id==='ex15-81')||a.id.localeCompare(b.id));
   let need=3;
   for(const tool of tools){if(!need)break;need-=add(tool,Math.min(need,room(tool)));}
 }
 // Stage 2 decks value Breeder; add it before generic staples when owned.
 if(cards.map(classic.cardById).some(c=>c?.stage==='Stage 2')){const breeder=classic.cardById('base1-76');if(breeder&&scope.includes(breeder.setId))add(breeder,Math.min(2,room(breeder)));}
 if(focus&&scope.includes(focus.setId)&&focus.kind!=='pokemon')add(focus,Math.min(2,room(focus)));
 // DCE is a real deck card and is especially useful when attacks contain Colorless requirements.
 const hasColorless=cards.map(classic.cardById).filter(c=>c?.kind==='pokemon').some(c=>(c.attacks||[]).some(a=>String(a.cost||'').includes('C'))),dce=classic.cardById('base1-96');if(hasColorless&&dce&&scope.includes(dce.setId))add(dce,Math.min(2,room(dce)));
 // Contextual strategy support: select rule-relevant cards before the generic
 // consistency backbone. A Stadium may be taken only if its Pokémon/Energy
 // requirements are satisfied by the completed core; no random dead Stadiums.
 const strategicTrainers=pool.filter(c=>c.kind==='trainer'&&trainerIsUseful(c)).map(c=>({card:c,score:cachedTrainerScore(c)}))
   .filter(r=>Number.isFinite(r.score)).sort((a,b)=>b.score-a.score||(a.card.id||'').localeCompare(b.card.id||''));
 let strategyAdds=0,stadiumsAdded=cards.filter(id=>classic.cardById(id)?.trainerType==='Stadium').length;
 for(const {card,score} of strategicTrainers){
   if(cards.length>=30||strategyAdds>=7)break;
   if(card.trainerType==='Stadium'&&stadiumsAdded>=1)continue;
   if(theme==='any'&&score<33)continue;
   if(theme!=='any'&&score<33)continue;
   const n=score>=70?2:1;
   const added=add(card,Math.min(n,room(card)));
   if(added){strategyAdds+=added;if(card.trainerType==='Stadium')stadiumsAdded+=added;}
 }
 // Start with a compact consistency backbone, rather than spending every
 // Trainer slot on Base Set before later sets are even considered.
 for(const [id,want] of [['base1-91',2],['base1-88',1],['base1-71',1],['base1-77',1],['base1-95',1],['base1-93',1]]){
   const card=classic.cardById(id);if(card&&scope.includes(card.setId))add(card,Math.min(want,room(card)));
 }
 const themedNames=new Set(cards.map(classic.cardById).filter(c=>c?.kind==='pokemon').map(c=>c.name));
 const themes=['Blaine','Brock','Erika','Giovanni','Koga','Lt. Surge','Misty','Sabrina'];
 const activeThemes=new Set(themes.filter(theme=>[...themedNames].some(name=>name.startsWith(`${theme}'s `))));
 const gymSupport=[
   ['gym2-116',82,null], // Master Ball: search
   ['gym1-111',80,null], // Good Manners: reliable Basics
   ['gym2-126',78,null], // Warp Point: switching
   ['gym1-118',73,null], // Secret Mission: hand selection
   ['gym1-122',65,null], // Energy Flow: recycle attachments
   ['gym2-124',91,'Fire'], // Fervor: Fire Energy from separate Energy Zone
   ['gym2-103',57,null], // Erika's Kindness: heal bulky Pokémon
   ['gym1-114',70,null], // Misty's Wrath: card draw
   ['gym1-106',102,'Brock'], // Brock's Training Method: named search
   ['gym1-109',90,'Erika'],
   ['gym1-117',90,'Sabrina'],
   ['gym2-108',90,'Misty'],
   ['gym2-105',85,'Giovanni'],
   ['gym2-107',83,'Lt. Surge'],
   ['gym2-115',84,'Koga'],
   ['gym2-17',100,'Blaine'],
   ['gym2-18',100,'Giovanni'],
   ['gym2-19',100,'Koga'],
   ['gym2-20',100,'Sabrina'],
   ['gym1-15',85,'Brock'],
   ['gym1-16',85,'Erika'],
   ['gym1-17',85,'Lt. Surge'],
   ['gym1-18',85,'Misty']
 ];
 let gymAdded=0;
 const supports=gymSupport.filter(([id,score,need])=>{
   const c=classic.cardById(id);if(!c||!scope.includes(c.setId)||!pool.includes(c)||!trainerIsUseful(c))return false;
   if(need==='Fire')return selectedTypes.includes('Fire');
   return !need||activeThemes.has(need);
 }).sort((a,b)=>b[1]-a[1]);
 for(const [id] of supports){if(cards.length>=30||gymAdded>=4)break;gymAdded+=add(classic.cardById(id),1);}
 for(const [id,want] of STAPLES){const card=classic.cardById(id);if(card&&scope.includes(card.setId)){const already=cards.filter(cid=>classicCardName(classic.cardById(cid)?.name)===classicCardName(card.name)).length;add(card,Math.min(Math.max(0,want-already),room(card)));}if(cards.length>=30)break;}
 // Special Energy must never be treated as generic 30-card filler. In the
 // hybrid rules Basic Darkness/Metal already comes from the Energy Zone;
 // their Special prints are only worthwhile if the *printed additional effect*
 // can work on at least one of this deck's Pokémon. A Fighting Sharpedo δ
 // does NOT gain the Darkness Energy +10 attack bonus, for example.
 const usefulFillerSpecialEnergy=card=>{
   if(!card?.specialEnergy)return false;
   const name=String(card.name||'');
   const pokemon=cards.map(classic.cardById).filter(c=>c?.kind==='pokemon');
   if(name==='Darkness Energy')return pokemon.some(p=>(p.types||[]).includes('Darkness')||/^Dark\s/i.test(p.name||''));
   if(name==='Metal Energy')return pokemon.some(p=>(p.types||[]).includes('Metal'));
   if(name==='Shield Energy')return pokemon.some(p=>(p.types||[]).includes('Metal'));
   if(name==='Wonder Energy')return pokemon.some(p=>(p.types||[]).includes('Fairy'));
   if(name==='Dangerous Energy')return pokemon.some(p=>(p.types||[]).includes('Darkness'));
   if(name==='Flash Energy')return pokemon.some(p=>(p.types||[]).includes('Lightning'));
   if(name==='Dark Metal Energy')return pokemon.some(p=>
     (p.types||[]).some(t=>t==='Darkness'||t==='Metal')||
     (p.attacks||[]).some(a=>/[DM]/.test(String(a.cost||''))));
   if(name==='React Energy')return pokemon.some(p=>synergy.metadata(p).specialEnergyPayoffs.includes('react-energy'));
   if(name==='Plasma Energy')return pokemon.some(p=>p.teamPlasma||
     (p.attacks||[]).some(a=>/Plasma Energy attached|Plasma Gale/i.test(String(a.text||'')+' '+a.name)));
   if(name==='δ Rainbow Energy')return pokemon.some(p=>p.deltaSpecies===true);
   // Holon Energy is selected earlier using its real basic-Energy activation
   // conditions and printed on-Pokémon payoffs, not in this filler stage.
   if(/^Holon Energy (?:FF|GL|WP)$/.test(name))return false;
   // Unknown Special Energy is not generic filler in a separate Energy Zone.
   return false;
 };
 const usefulFillerCard=c=>c?.kind==='trainer'||
   (c?.specialEnergy&&usefulFillerSpecialEnergy(c)&&
    (!isDiscoveryEnergySupply(c,scope)||specialNeeds[c.id==='neo1-104'?'D':'M']>0));
 // Fallback through remaining owned Trainers first, then compatible Basics. This remains legal but avoids stranded evolutions.
 energyFillerPhase=true;
 const trainerPool=pool.filter(c=>usefulFillerCard(c));
 // Re-rank after EVERY addition: four of a generic draw Supporter are not
 // better than a balanced mix of search, switching, recovery and counterplay.
 // In particular the Supporter once-per-turn rule is factored into selection.
 let marginalSize=-1,marginalOthers=[],marginalRoles=new Map(),marginalSupporters=0,marginalHandSource=false;
 function refreshMarginal(){if(marginalSize===cards.length)return;marginalSize=cards.length;
   marginalOthers=cards.map(classic.cardById).filter(c=>c?.kind==='trainer');marginalRoles=new Map();marginalSupporters=marginalOthers.filter(c=>c.trainerType==='Supporter').length;
   for(const c of marginalOthers)for(const role of synergy.metadata(c).roles)marginalRoles.set(role,(marginalRoles.get(role)||0)+1);
   marginalHandSource=cards.some(id=>{const c=classic.cardById(id);return c?.kind==='pokemon'&&((c.deckMeta?.triggerDependencies||[]).includes('basic-energy-in-hand')||(c.abilities||[]).some(a=>/Basic Energy card from your hand/i.test(a.text||'')));});
 }
 function marginalTrainerScore(card){
   const base=card.kind==='trainer'?cachedTrainerScore(card):
     (card.specialEnergy&&usefulFillerSpecialEnergy(card)?20:-Infinity);
   if(!Number.isFinite(base))return -Infinity;
   refreshMarginal();
   const repeats=marginalOthers.filter(c=>classicCardName(c.name)===classicCardName(card.name)).length;
   const roles=new Set(synergy.metadata(card).roles||[]);
   let penalty=repeats*34;
   if(card.trainerType==='Supporter'){
     const supporters=marginalSupporters;
     penalty+=Math.max(0,supporters-4)*12;
   }
   for(const role of ['draw','search','healing','energy','retreat','stall','disruption']){
     if(!roles.has(role))continue;
     const otherRoleCount=marginalRoles.get(role)||0;
     const threshold=role==='draw'||role==='search'?5:role==='energy'?3:2;
     penalty+=Math.max(0,otherRoleCount-threshold)*9;
   }
   // Energy from the hybrid Zone is already available for ordinary turn
   // attachments. Hand-only Energy search is not the strongest generic filler.
   if(['Energy Search','Cilan',"Professor's Letter"].includes(card.name)&&
      !marginalHandSource)penalty+=23;
   if(card.trainerType==='AttachedTrainer'||card.trainerType==='Tool')penalty+=8;
   return base-penalty;
 }
 function fillTrainerSlots(){
   const blocked=new Set();
   while(cards.length<30){
     const stadiums=cards.filter(id=>classic.cardById(id)?.trainerType==='Stadium');
     const ranked=trainerPool.filter(c=>!blocked.has(c.id)&&room(c)>0&&
       !(c.trainerType==='Stadium'&&(stadiums.length>=2||(stadiums.length>=1&&!stadiums.includes(c.id))))&&
       (!c.specialEnergy||usefulFillerSpecialEnergy(c))&&
       (c.kind!=='trainer'||trainerIsUseful(c))).map(card=>({card,score:marginalTrainerScore(card)}))
       .filter(x=>Number.isFinite(x.score)).sort((a,b)=>b.score-a.score||a.card.id.localeCompare(b.card.id));
     if(!ranked.length)break;
     if(!add(ranked[0].card,1))blocked.add(ranked[0].card.id);
   }
 }
 fillTrainerSlots();
 const cohesiveBasic=c=>{
  if(options._allowSecondType===true&&!requestedEnergy.length)return true;
  return effectiveTypes(c).some(t=>t==='Colorless'||effectiveTypes(main).includes(t)||selectedTypes.includes(t));
 };
 const fallbackBasics=pokemonPool.filter(c=>c.stage==='Basic'&&canFitEnergy(c)&&cohesiveBasic(c)&&
   (basicOnly||familyRoot(c,evolutionPool)===mainRoot||!hasKnownEvolutionInEra(c))).sort((a,b)=>Number(matchesRarity(b,rarityFocus,basicOnly))-Number(matchesRarity(a,rarityFocus,basicOnly))||standaloneScore(b)-standaloneScore(a));
 for(const c of fallbackBasics){while(cards.length<30&&pokemonCount()<18&&room(c)>0&&canFitEnergy(c)){if(!add(c,1))break;}if(cards.length>=30)break;}
 if(cards.length<30&&!requestedEnergy.length){for(const c of pokemonPool.filter(c=>c.stage==='Basic').sort((a,b)=>Number(matchesRarity(b,rarityFocus,basicOnly))-Number(matchesRarity(a,rarityFocus,basicOnly)))){if(!canFitEnergy(c)||!cohesiveBasic(c)||(!basicOnly&&familyRoot(c,evolutionPool)!==mainRoot&&hasKnownEvolutionInEra(c)))continue;while(cards.length<30&&pokemonCount()<18&&room(c)>0){if(!add(c,1))break;}if(cards.length>=30)break;}}
 // A single newly integrated set can have abundant compatible Pokémon but
 // very few verified Trainers. Give cohesive Basics room before raising the
 // automatic Trainer cap to four; otherwise three unrelated Trainer names
 // become compulsory four-copy packages in every generated deck. This applies
 // only to sparse, single-set pools and never overrides manual card choices.
 if(cards.length<30&&scope.length===1&&new Set(pool.filter(c=>c.kind==='trainer'&&trainerIsUseful(c)).map(c=>classicCardName(c.name))).size<=4){
   autoPokemonCap=Math.max(autoPokemonCap,22);
   // Prefer coherent affordable Basics already in the selected Energy plan.
   // They can provide backup Active Pokémon instead of a mandatory fourth
   // copy of every unrelated Trainer in a small verified set catalogue.
   const rescueBasics=pokemonPool.filter(c=>c.stage==='Basic'&&canFitEnergy(c)&&cohesiveBasic(c))
     .sort((a,b)=>standaloneScore(b)-standaloneScore(a)||a.id.localeCompare(b.id));
   for(const basic of rescueBasics){
     while(cards.length<30&&pokemonCount()<22&&room(basic)>0&&canFitEnergy(basic)){
       if(!add(basic,1))break;
     }
     if(cards.length>=30||pokemonCount()>=22)break;
   }
 }
 // Try a third copy only after diversifying trainers and choosing compatible
 // Pokémon. Some eras have very narrow trainer pools; retain legal recovery.
 if(cards.length<30){autoTrainerCap=3;fillTrainerSlots();}
 if(cards.length<30){autoTrainerCap=4;fillTrainerSlots();}
 // Final conservative fill: respect the planned mono/explicit dual Energy profile;
 // only the sparse-inventory rescue is allowed a second otherwise unrequested type.
 if(cards.length<30){for(const c of pool.filter(c=>(usefulFillerCard(c)||c.stage==='Basic')&&trainerIsUseful(c))){while(cards.length<30&&room(c)>0){const trial=[...cards,c.id],profile=decks.analyzeDeck(trial).recommendedEnergyTypes;if(options._allowSecondType===true&&!requestedEnergy.length?profile.length>2:!profile.every(t=>plannedEnergy.includes(t)))break;if(!add(c,1))break;}if(cards.length>=30)break;}}
 // Sparse single-set pools (including partially integrated Steam Siege) may
 // print several Trainers but have only a few that are actually useful for the
 // current deck. Count distinct usable Trainer names, not alternate-art prints: otherwise
 // an authentic 30-card deck cannot meet the normal 18-Pokémon soft cap and
 // the mandatory all-set build quality gate fails. Never inject dead Trainers.
 // Keep the relaxation limited to this single-set emergency; multi-era decks
 // and explicitly retained cards keep the normal composition rules.
 if(cards.length<30&&scope.length===1&&new Set(pool.filter(c=>c.kind==='trainer'&&trainerIsUseful(c)).map(c=>classicCardName(c.name))).size<=4){
   autoPokemonCap=30;
   // Add complete affordable Stage-1 families before loose Basics. This
   // rescues Team Rocket without stuffing isolated Dratini or Diglett into
   // a deck that has no path to its printed final evolution.
   const spareFamilies=endpointCards(pokemonPool).filter(c=>
     familyRoot(c,evolutionPool)!==mainRoot&&familyLine(c,evolutionPool).length===2&&canFitEnergy(c))
     .sort((a,b)=>Number(effectiveTypes(b).some(t=>effectiveTypes(main).includes(t)))-
       Number(effectiveTypes(a).some(t=>effectiveTypes(main).includes(t)))||
       pokemonScore(b,evolutionPool)-pokemonScore(a,evolutionPool)||a.id.localeCompare(b.id));
   for(const endpoint of spareFamilies){
     const line=familyLine(endpoint,evolutionPool);
     if(line.some(member=>room(member)<1)||line.length>30-cards.length)continue;
     const repeats=Math.min(2,Math.floor((30-cards.length)/line.length),...line.map(member=>room(member)));
     if(repeats>0)addLine(line,repeats);
     if(cards.length>=30)break;
   }
   const fallbackRoots=pokemonPool.filter(c=>c.stage==='Basic'&&canFitEnergy(c)&&cohesiveBasic(c))
      .sort((a,b)=>Number(familyRoot(b,evolutionPool)===mainRoot)-Number(familyRoot(a,evolutionPool)===mainRoot)||
        standaloneScore(b)-standaloneScore(a)||a.id.localeCompare(b.id));
   for(const basic of fallbackRoots){
     if(!basicOnly&&familyRoot(basic,evolutionPool)!==mainRoot&&hasKnownEvolutionInEra(basic))continue;
     while(cards.length<30&&room(basic)>0){if(!add(basic,1))break;}
     if(cards.length>=30)break;
   }
 }
 if(cards.length!==30){
   const xy1Recovery=rescueXY1Deck(rows,{...options,sets:scope});
   if(xy1Recovery?.ok)return xy1Recovery;
   const xy2Recovery=rescueXY2Deck(rows,{...options,sets:scope});
   if(xy2Recovery?.ok)return xy2Recovery;
   const bw11Recovery=rescueBW11Deck(rows,{...options,sets:scope});
   if(bw11Recovery?.ok)return bw11Recovery;
   const bw10Recovery=rescueBW10Deck(rows,{...options,sets:scope});
   if(bw10Recovery)return bw10Recovery;
   // Sparse themed pools can choose an awkward first core that leaves too few
   // compatible fillers. Retry distinct archetypes rather than handing back an
   // incomplete deck when other owned families could form a legal deck.
   const depth=Number(options._retryDepth||0);
   if(!focus&&depth<6){
     const next=buildDeck(rows,{...options,_retryDepth:depth+1,randomSeed:Number(options.randomSeed||1)+9973*(depth+1),excludeArchetypes:[...excluded,archetypeKey(featured||main)]});
     if(next.ok)return next;
   }
   // Reconsider this same core with an explicit single-type plan before
   // giving up on it. A random build must not needlessly rescue a perfectly
   // playable mono-Fighting Golem ex using a Grass Volbeat.
   if(depth===0&&!focus&&!requestedEnergy.length&&!options._allowSecondType&&lineEnergy.length===1){
     const sameCore=buildDeck(rows,{...options,focusCardId:main.id,types:[lineEnergy[0]],excludeArchetypes:[],_retryDepth:6});
     if(sameCore.ok)return sameCore;
   }
   // Favour mono-Energy in all normal builds. For a tiny collection that
   // literally cannot complete 30 cards with any mono core, permit a two-type
   // rescue as a last resort rather than failing to build a legal deck.
   // Never override a user-selected Energy type to do this.
   if(depth===0&&!focus&&!requestedEnergy.length&&!options._allowSecondType){
     const rescue=buildDeck(rows,{...options,_allowSecondType:true,_retryDepth:0});
     if(rescue.ok)return rescue;
   }
   // A named, colorless-cost core in a single expansion (Fossil Aerodactyl)
   // may need a second compatible Energy type to reach a legal 30-card deck.
   // Never override a type explicitly selected by the user.
   if(focus&&!requestedEnergy.length&&!options._allowSecondType){
     for(const candidate of decks.ENERGY_TYPES){
       if(selectedTypes.includes(candidate))continue;
       const rescue=buildDeck(rows,{...options,types:[...selectedTypes,candidate],allowMixedEnergy:true,
         _allowSecondType:true,_retryDepth:6});
       if(rescue.ok)return rescue;
     }
   }
   return fail(`Could only assemble ${cards.length}/30 compatible owned cards. Add more Classic TCG cards or widen the Energy type filter.`);
 }
 // A Baby Evolution target is a necessary deck-building dependency,
 // irrespective of whether its printed attack can be used alone.
 const unpairedBaby=cards.map(classic.cardById).find(c=>babyEvolutionTargets(c).length&&!hasBabyPartner(c));
 if(unpairedBaby)return fail(`${unpairedBaby.name} was included without a playable Baby Evolution partner.`);
 const orphanFossil=cards.map(classic.cardById).find(c=>isEvolutionFossil(c)&&!fossilEvolutionInDeck(c,cards));
 if(orphanFossil)return fail(`${orphanFossil.name} was included without a matching Fossil Pokémon evolution in this deck.`);
 const orphanFossilSupport=cards.map(classic.cardById).find(c=>isFossilSupport(c)&&!anyFossilEvolutionInDeck(cards));
 if(orphanFossilSupport)return fail(`${orphanFossilSupport.name} was included without a Fossil evolution line in this deck.`);
 if(cards.includes('dp6-143')&&!['dp6-140','dp6-146'].every(id=>cards.includes(id)))
   return fail('Mesprit LV.X Supreme Blast requires complete Azelf LV.X and Uxie LV.X lines.');
 const legal=decks.validateDraft(cards,rows,{requireFull:true});if(!legal.ok)return {ok:false,cards,energyTypes:selectedTypes,errors:legal.errors,warnings:[],strategy:''};
 const analysis=decks.analyzeDeck(cards),conditionalDual=requestedEnergy.length===2&&requestedEnergy.every(type=>conditionalAttackTypes(main).includes(type)),
  energyTypes=(main.pokemonEx&&main.stage==='Stage 2')||stage2Beneficiary||conditionalPayoffTypes.some(t=>selectedTypes.includes(t))||requestedEnergy.length===1||conditionalDual||lineEnergy.length>=2?selectedTypes.slice(0,maxEnergyTypes):(allowMixedEnergy&&requestedEnergy.length===2?requestedEnergy:neededTypes().length?analysis.recommendedEnergyTypes.slice(0,2):selectedTypes.slice(0,maxEnergyTypes));
 const finalEnergy=energyTypes.length?energyTypes:selectedTypes.slice(0,maxEnergyTypes);
 const specialist=(main.types||[]).find(t=>t==='Darkness'||t==='Metal');
 const zoneLabel=finalEnergy.join(' / ');
 const label=specialist?`${specialist} · Basic Zone: ${zoneLabel}`:(requested.includes('Colorless')?`Colorless / ${zoneLabel}`:zoneLabel);
 const plan=synergy.report(cards.map(classic.cardById).filter(Boolean),finalEnergy,theme);
 const notes=plan.warnings.map(message=>({message}));
 for(const [,type] of xy5HandEnergyNeeds){
   const sourceAvailable=cards.some(id=>{const c=classic.cardById(id);return c?.kind==='trainer'&&
     (['bw1:energySearch','bw4:cilan','ex1:basicSearch1','ex1:basicSearch2','expedition:energySearch','ex9:trainer:79','ex15:77:trainer'].includes(c.effect?.rule)||c.name==='Energy Search');});
   if(!sourceAvailable)notes.push({message:`Primal Clash ${type} hand-Energy ability/attack has no Energy-to-hand Trainer in this deck. Zone attachments alone cannot provide a physical Energy card in hand; include an Energy Search, Cilan or compatible source from an owned set.`});
 }
 for(const [id,partners] of xy5SpiritLinks){
   if(partners.some(p=>cards.includes(p))&&!cards.includes(id))
     notes.push({message:`The ${classic.cardById(id)?.name||'Spirit Link'} is absent: this Mega/Primal Evolution will end your turn. Add the matching Tool if available.`});
 }
 if(revealedPhysicalEnergySupport&&!cards.some(id=>classic.cardById(id)?.kind==='energy'))
   notes.push({message:'Peal of Thunder looks at the real draw deck, not the Basic Energy Zone. No owned physical Energy was available in this deck, so its top-five reveal cannot attach Energy.'});
 return {ok:true,cards,energyTypes:finalEnergy,errors:[],warnings:notes,plan,style,archetypeKey:archetypeKey(featured||main),focusCardId:fossilFocus?.id||focus?.id||featured?.id||main.id,strategy:`${style==='random'?'Random featured':'Competitive'} · ${theme!=='any'?synergy.THEMES.find(t=>t.id===theme).label+' · ':''}${rarityFocus!=='any'?RARITY_FOCUS.find(r=>r.id===rarityFocus).label+' · ':''}${basicOnly?'Basic-only · ':''}${label} · ${featured?featured.name+' featured · ':''}${archetypeName(main,evolutionPool)} core · ${pokemonCount()} Pokémon / ${30-pokemonCount()} Trainers & Special Energy`};
}
function buildDeckAsync(rows,options,control={}){return new Promise(resolve=>{setTimeout(()=>{if(control.isCancelled?.())return resolve(null);resolve(buildDeck(rows,options));},0);});}
return {buildDeck,rescueBW10Deck,rescueBW11Deck,rescueXY1Deck,rescueXY2Deck,buildDeckAsync,THEMES:synergy.THEMES,familyLine,familyRoot,attackTypes,conditionalAttackTypes,allowedInSetPool,ARCHETYPE_TYPES,SET_IDS,RARITY_FOCUS,rarityTier,matchesRarity};
});
