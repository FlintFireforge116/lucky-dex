(function(root,factory){
 const classic=typeof module==='object'&&module.exports?require('./tcg-classic-battle-data.js'):root.LuckyDexClassicTCGBattleData;
 const decks=typeof module==='object'&&module.exports?require('./tcg-classic-decks.js'):root.LuckyDexClassicTCGDecks;
 const synergy=typeof module==='object'&&module.exports?require('./tcg-deck-synergy.js'):root.LuckyDexDeckSynergy;
 const api=factory(classic,decks,synergy);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGDeckBuilder=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(classic,decks,synergy){
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
const SET_IDS=Object.freeze(['base1','base2','base3','base5','gym1','gym2','neo1','neo2','neo3','neo4','base6','ecard1','ecard2','ecard3','ex1','ex2','ex3','ex4','ex5','ex6','ex7','ex8','ex9','ex10','ex11','ex12','ex13','ex14','ex15','ex16','dp1','dp2','dp3','dp4','dp5','SNAPFLORIO','SNAPFOUNJA','sv1']);
// Darkness and Metal are already Basic Energy types. Deduplicate before rendering
// archetype chips so each energy type has exactly one toggle.
const ARCHETYPE_TYPES=Object.freeze([...new Set([...decks.ENERGY_TYPES,'Colorless'])]);
const STAGE_RANK=Object.freeze({'Basic':0,'Stage 1':1,'Stage 2':2,'Level-Up':3});
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
function familyLine(card,pool){
 if(!card||card.kind!=='pokemon')return [];
 const line=[card],seen=new Set([card.id]);let cur=card;
 // When an expansion includes different prints of a pre-evolution, choose
 // the print that can fight using the final attacker's Energy plan. Without
 // this, a Lightning/Metal Charizard δ was paired with Fire Charmeleon even
 // though the set contains a Lightning Charmeleon δ.
 const finalTypes=new Set(attackTypes(card));
 while(cur.evolvesFrom){
  const parents=pool.filter(c=>(c.kind==='pokemon'||c.effect?.type==='playFossil')&&classicEvolutionMatches(c.name,cur.evolvesFrom));
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
 return line;
}
// A visible Stage 1 is not a finished core when a Stage 2 exists but is
// PARTIAL, unowned or excluded by the selected sets. Check the full catalogue
// before treating the end of the playable subset as a terminal evolution.
// A future staged set's GATED evolutions must not retroactively invalidate
// old one-set Stage-1 builds. Legacy EX pool rules still apply unchanged.
const FULL_EVOLUTION_NAMES=new Set(classic.CARDS.filter(c=>c.kind==='pokemon'&&c.evolvesFrom&&(!['dp1','dp2','dp3','dp4'].includes(c.setId)||c.battleEnabled)).map(c=>classicCardName(c.evolvesFrom)));
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
 return line.map(card=>classicCardName(card.name)===classicCardName(featured.name)&&card.stage===featured.stage?featured:card);
}

function fail(message){return {ok:false,cards:[],energyTypes:[],errors:[message],warnings:[],strategy:''};}
function buildDeck(rows,options={}){
 const rarityFocus=RARITY_FOCUS.some(r=>r.id===options.rarityFocus)?options.rarityFocus:'any',basicOnly=options.basicOnly===true,theme=synergy.THEMES.some(t=>t.id===options.theme)?options.theme:'any';
 const style=options.style==='random'?'random':'competitive',owned=ownedMap(rows),allowedSets=(options.sets||SET_IDS).filter(s=>SET_IDS.includes(s)),scope=allowedSets.length?allowedSets:SET_IDS,pool=classic.CARDS.filter(c=>allowedInSetPool(c,scope)&&c.battleEnabled&&c.deckEligible!==false&&Number(owned.get(c.id)||0)>0),pokemonPool=pool.filter(c=>c.kind==='pokemon'),evolutionPool=pool.filter(c=>c.kind==='pokemon'||c.effect?.type==='playFossil');
 if([...pool].reduce((sum,c)=>sum+Math.min(4,owned.get(c.id)||0),0)<30)return fail('Not enough owned battle-ready Classic card copies to build a 30-card deck.');
 if(!pokemonPool.some(c=>c.stage==='Basic'))return fail('No owned battle-ready Basic Pokémon are available.');
 const requested=[...new Set((options.types||[]).filter(t=>ARCHETYPE_TYPES.includes(t)))].slice(0,2),requestedEnergy=requested.filter(t=>decks.ENERGY_TYPES.includes(t)),allowMixedEnergy=options.allowMixedEnergy===true,existing=Array.isArray(options.cards)?options.cards:[],focus=classic.cardById(options.focusCardId),random=rng(options.randomSeed),excluded=new Set(options.excludeArchetypes||[]);
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
  if(!hasKnownEvolution(c))return true;
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
  return !!line.length&&required.length<=2&&all.length<=2&&matching&&activeMatch&&
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
 const coreScore=c=>pokemonScore(c,evolutionPool)+synergy.pokemonThemeScore(c,theme)*4+
   (requested.length?effectiveTypes(c).includes(requested[0])?240:effectiveTypes(c).some(type=>requested.includes(type))?120:conditionalAttackTypes(c).some(type=>requested.includes(type))?100:0:0);
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
 const cards=[],counts=new Map();
 function trainerIsUseful(card){
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

   if(card?.kind==='trainer'){const ctx=synergy.context(cards.map(classic.cardById).filter(Boolean),selectedTypes,theme);if(synergy.trainerScore(card,ctx)===-Infinity)return false;}
   if(card.name==="Brock's Training Method")return cards.some(id=>{const pokemon=classic.cardById(id);return pokemon?.kind==='pokemon'&&pokemon.name.startsWith("Brock's ");});
   return true;
 }
 function room(card){const copiesOfName=[...counts].filter(([id])=>classicCardName(classic.cardById(id)?.name)===classicCardName(card.name)).reduce((sum,[,count])=>sum+count,0);const starSlots=card.pokemonStar?Math.max(0,1-cards.filter(id=>classic.cardById(id)?.pokemonStar).length):4;return Math.max(0,Math.min(starSlots,(card.name.startsWith('Shining ')?1:4)-copiesOfName,Number(owned.get(card.id)||0)-(counts.get(card.id)||0)));}
 function hasBabyPartner(card){
   const names=babyEvolutionTargets(card);
   return !names.length||cards.some(id=>names.includes(classicCardName(classic.cardById(id)?.name)));
 }
 function add(card,n=1,fromEvolutionLine=false){if(!fromEvolutionLine&&!hasBabyPartner(card))return 0;if(card?.kind==='trainer'&&!fromEvolutionLine&&!trainerIsUseful(card))return 0;if(card?.trainerType==='Stadium'&&cards.filter(id=>classic.cardById(id)?.trainerType==='Stadium').length>=1&&!cards.includes(card.id))return 0;let added=0;while(added<n&&cards.length<30&&room(card)>0&&!(card?.trainerType==='Stadium'&&cards.filter(id=>classic.cardById(id)?.trainerType==='Stadium').length>=2)){cards.push(card.id);counts.set(card.id,(counts.get(card.id)||0)+1);added++;}return added;}
 function addLine(line,copies){if(!line.length||line.some(c=>Number(owned.get(c.id)||0)<1))return false;for(let copy=0;copy<copies;copy++){if(line.some(c=>room(c)<1)||cards.length+line.length>30)break;for(const c of line)add(c,1,true);}return line.every(c=>(counts.get(c.id)||0)>0);}
 // Preserve legal existing cards first for Fill / repair, but never exceed ownership/copy limits.
 for(const id of existing){const c=classic.cardById(id);if(c&&allowedInSetPool(c,scope)&&c.battleEnabled&&c.deckEligible!==false&&!babyEvolutionTargets(c).length)add(c,1);}
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
 // Special Energy is non-negotiable for a Darkness or Metal attacker.
 // Reserve it ahead of Trainers, otherwise the generated 30-card deck can
 // contain a Sneasel/Steelix that literally cannot pay for its signature move.
 const specialNeeds=specialCosts(cards.map(classic.cardById).filter(Boolean));
 for(const [symbol,needed] of Object.entries(specialNeeds))if(needed){
   const energyCard=classic.cardById(SPECIAL_COST_CARDS[symbol]);
   if(energyCard&&allowedInSetPool(energyCard,scope))add(energyCard,Math.min(4,Math.max(needed*2,2)));
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
   const tools=pool.filter(c=>c.trainerType==='Tool'&&c.battleEnabled)
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
 const supportContext=()=>synergy.context(cards.map(classic.cardById).filter(Boolean),selectedTypes,theme);
 const strategicTrainers=pool.filter(c=>c.kind==='trainer'&&trainerIsUseful(c)).map(c=>({card:c,score:synergy.trainerScore(c,supportContext())}))
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
   if(name==='Dark Metal Energy')return pokemon.some(p=>
     (p.types||[]).some(t=>t==='Darkness'||t==='Metal')||
     (p.attacks||[]).some(a=>/[DM]/.test(String(a.cost||''))));
   if(name==='React Energy')return pokemon.some(p=>synergy.metadata(p).specialEnergyPayoffs.includes('react-energy'));
   if(name==='δ Rainbow Energy')return pokemon.some(p=>p.deltaSpecies===true);
   // Holon Energy is selected earlier using its real basic-Energy activation
   // conditions and printed on-Pokémon payoffs, not in this filler stage.
   if(/^Holon Energy (?:FF|GL|WP)$/.test(name))return false;
   return true;
 };
 const usefulFillerCard=c=>c?.kind==='trainer'||
   (c?.specialEnergy&&usefulFillerSpecialEnergy(c)&&
    (!isDiscoveryEnergySupply(c,scope)||specialNeeds[c.id==='neo1-104'?'D':'M']>0));
 // Fallback through remaining owned Trainers first, then compatible Basics. This remains legal but avoids stranded evolutions.
 const trainerFallback=pool.filter(c=>usefulFillerCard(c)&&trainerIsUseful(c)).sort((a,b)=>synergy.trainerScore(b,supportContext())-synergy.trainerScore(a,supportContext())||Number(a.number)-Number(b.number));
 for(const c of trainerFallback){while(cards.length<30&&room(c)>0){if(!add(c,1))break;}if(cards.length>=30)break;}
 const cohesiveBasic=c=>{
  if(options._allowSecondType===true&&!requestedEnergy.length)return true;
  return effectiveTypes(c).some(t=>t==='Colorless'||effectiveTypes(main).includes(t)||selectedTypes.includes(t));
 };
 const fallbackBasics=pokemonPool.filter(c=>c.stage==='Basic'&&canFitEnergy(c)&&cohesiveBasic(c)&&
   (basicOnly||familyRoot(c,evolutionPool)===mainRoot||!hasKnownEvolution(c))).sort((a,b)=>Number(matchesRarity(b,rarityFocus,basicOnly))-Number(matchesRarity(a,rarityFocus,basicOnly))||standaloneScore(b)-standaloneScore(a));
 for(const c of fallbackBasics){while(cards.length<30&&room(c)>0&&canFitEnergy(c)){if(!add(c,1))break;}if(cards.length>=30)break;}
 if(cards.length<30&&!requestedEnergy.length){for(const c of pokemonPool.filter(c=>c.stage==='Basic').sort((a,b)=>Number(matchesRarity(b,rarityFocus,basicOnly))-Number(matchesRarity(a,rarityFocus,basicOnly)))){if(!canFitEnergy(c)||!cohesiveBasic(c)||(!basicOnly&&familyRoot(c,evolutionPool)!==mainRoot&&hasKnownEvolution(c)))continue;while(cards.length<30&&room(c)>0){if(!add(c,1))break;}if(cards.length>=30)break;}}
 // Final conservative fill: respect the planned mono/explicit dual Energy profile;
 // only the sparse-inventory rescue is allowed a second otherwise unrequested type.
 if(cards.length<30){for(const c of pool.filter(c=>(usefulFillerCard(c)||c.stage==='Basic')&&trainerIsUseful(c))){while(cards.length<30&&room(c)>0){const trial=[...cards,c.id],profile=decks.analyzeDeck(trial).recommendedEnergyTypes;if(options._allowSecondType===true&&!requestedEnergy.length?profile.length>2:!profile.every(t=>plannedEnergy.includes(t)))break;if(!add(c,1))break;}if(cards.length>=30)break;}}
 if(cards.length!==30){
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
 const legal=decks.validateDraft(cards,rows,{requireFull:true});if(!legal.ok)return {ok:false,cards,energyTypes:selectedTypes,errors:legal.errors,warnings:[],strategy:''};
 const analysis=decks.analyzeDeck(cards),conditionalDual=requestedEnergy.length===2&&requestedEnergy.every(type=>conditionalAttackTypes(main).includes(type)),
  energyTypes=(main.pokemonEx&&main.stage==='Stage 2')||stage2Beneficiary||conditionalPayoffTypes.some(t=>selectedTypes.includes(t))||requestedEnergy.length===1||conditionalDual||lineEnergy.length>=2?selectedTypes.slice(0,2):(allowMixedEnergy&&requestedEnergy.length===2?requestedEnergy:neededTypes().length?analysis.recommendedEnergyTypes.slice(0,2):selectedTypes.slice(0,2));
 const finalEnergy=energyTypes.length?energyTypes:selectedTypes.slice(0,2);
 const specialist=(main.types||[]).find(t=>t==='Darkness'||t==='Metal');
 const zoneLabel=finalEnergy.join(' / ');
 const label=specialist?`${specialist} · Basic Zone: ${zoneLabel}`:(requested.includes('Colorless')?`Colorless / ${zoneLabel}`:zoneLabel);
 const plan=synergy.report(cards.map(classic.cardById).filter(Boolean),finalEnergy,theme);
 const notes=plan.warnings.map(message=>({message}));
 if(revealedPhysicalEnergySupport&&!cards.some(id=>classic.cardById(id)?.kind==='energy'))
   notes.push({message:'Peal of Thunder looks at the real draw deck, not the Basic Energy Zone. No owned physical Energy was available in this deck, so its top-five reveal cannot attach Energy.'});
 return {ok:true,cards,energyTypes:finalEnergy,errors:[],warnings:notes,plan,style,archetypeKey:archetypeKey(featured||main),focusCardId:focus?.id||featured?.id||main.id,strategy:`${style==='random'?'Random featured':'Competitive'} · ${theme!=='any'?synergy.THEMES.find(t=>t.id===theme).label+' · ':''}${rarityFocus!=='any'?RARITY_FOCUS.find(r=>r.id===rarityFocus).label+' · ':''}${basicOnly?'Basic-only · ':''}${label} · ${featured?featured.name+' featured · ':''}${archetypeName(main,evolutionPool)} core · ${pokemonCount()} Pokémon / ${30-pokemonCount()} Trainers & Special Energy`};
}
function buildDeckAsync(rows,options,control={}){return new Promise(resolve=>{setTimeout(()=>{if(control.isCancelled?.())return resolve(null);resolve(buildDeck(rows,options));},0);});}
return {buildDeck,buildDeckAsync,THEMES:synergy.THEMES,familyLine,familyRoot,attackTypes,conditionalAttackTypes,allowedInSetPool,ARCHETYPE_TYPES,SET_IDS,RARITY_FOCUS,rarityTier,matchesRarity};
});
