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
const SET_IDS=Object.freeze(['base1','base2','base3','base5','gym1','gym2','neo1','neo2','neo3','neo4','base6','ecard1','ecard2','ecard3','ex1','ex2','ex3','ex4','ex5','ex6','ex7','ex8','ex9','ex10','SNAPFLORIO','SNAPFOUNJA','sv1']);
// Darkness and Metal are already Basic Energy types. Deduplicate before rendering
// archetype chips so each energy type has exactly one toggle.
const ARCHETYPE_TYPES=Object.freeze([...new Set([...decks.ENERGY_TYPES,'Colorless'])]);
const STAGE_RANK=Object.freeze({'Basic':0,'Stage 1':1,'Stage 2':2});
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
const allowedInSetPool=(card,sets)=>sets.includes(card.setId)||isDiscoveryEnergySupply(card,sets);
function specialCosts(_cards){return {D:0,M:0};} // Basic Darkness/Metal satisfies typed attack costs; Special Energy is optional.

function classicCardName(name){return String(name||'').replace(/[’]/g,"'").replace(/\s+(?=[♀♂])/g,'').trim();}
function familyLine(card,pool){if(!card||card.kind!=='pokemon')return [];const line=[card],seen=new Set([card.id]);let cur=card;while(cur.evolvesFrom){const prior=pool.find(c=>(c.kind==='pokemon'||c.effect?.type==='playFossil')&&classicCardName(c.name)===classicCardName(cur.evolvesFrom));if(!prior||seen.has(prior.id))return [];line.unshift(prior);seen.add(prior.id);cur=prior;}return line;}
function familyRoot(card,pool){const line=familyLine(card,pool);return line[0]?.name||card?.name||card?.id||'';}
function archetypeName(card,pool){const root=familyRoot(card,pool);return ['Mysterious Fossil','Eevee'].includes(root)?card?.name||root:root;}
function endpointCards(pool){const parents=new Set(pool.filter(c=>c.kind==='pokemon'&&c.evolvesFrom).map(c=>classicCardName(c.evolvesFrom)));return pool.filter(c=>c.kind==='pokemon'&&!parents.has(classicCardName(c.name)));}
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
 // A randomly drawn Basic or Stage 1 is still the featured card; build the
 // fullest available evolution line containing it, including its exact print.
 const descendants=candidates.filter(c=>familyLine(c,pool).some(member=>classicCardName(member.name)===classicCardName(featured.name)&&member.stage===featured.stage));
 const endpoint=descendants.find(c=>c.id===featured.id)||descendants[0]||featured;
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
 // Competitive considers complete evolution families; Random draws a printed
 // Pokémon from the *entire* owned, battle-ready roster (not the top 14).
 const isEligible=c=>{const line=familyLine(c,evolutionPool);const required=new Set(line.flatMap(attackTypes)),special=specialCosts(line);return !!line.length&&required.size<=2&&(requestedEnergy.length===1?[...new Set([...requestedEnergy,...required])].length<=2:line.every(member=>typeCompatible(member,requestedEnergy)))&&Object.entries(special).every(([sym,n])=>!n||(classic.cardById(SPECIAL_COST_CARDS[sym])?.battleEnabled&&allowedInSetPool(classic.cardById(SPECIAL_COST_CARDS[sym]),scope)&&Number(owned.get(SPECIAL_COST_CARDS[sym])||0)>=n))&&(!requested.length||(c.types||[]).some(type=>requested.includes(type))||((c.types||[]).includes('Colorless')&&line.some(member=>attackTypes(member).some(type=>requestedEnergy.includes(type)))));};
 // An explicitly focused Basic or Stage 1 remains a legal archetype even
 // when a later evolution exists in a different set (Jungle Scyther/Scizor).
 const focal=focus?.kind==='pokemon'&&pokemonPool.some(c=>c.id===focus.id)?[focus]:[];
 let candidates=[...new Map([...(basicOnly?pokemonPool.filter(c=>c.stage==='Basic'):endpointCards(pokemonPool)),...focal].map(c=>[c.id,c])).values()].filter(isEligible);
 // The selected tier determines the featured Pokémon, not its prerequisites.
 // An Ultra Rare VMAX can still have the lower-rarity V it evolves from.
 if(rarityFocus!=='any'||basicOnly)candidates=candidates.filter(c=>matchesRarity(c,rarityFocus,basicOnly));

 if(focus?.kind==='pokemon'){
   const focused=candidates.filter(c=>familyLine(c,evolutionPool).some(member=>classicCardName(member.name)===classicCardName(focus.name)&&member.stage===focus.stage));
   if(focused.length)candidates=focused;
   else if((scope.includes('neo2')||scope.includes('neo3')||scope.includes('neo4'))&&['Darkness','Metal'].some(t=>(focus.types||[]).includes(t)))return fail(`Cannot build around ${focus.name}: a complete evolution family and at most two supported Basic Energy Zone types are required.`);
   else return fail(`Cannot build around ${focus.name} with the selected owned cards and sets.`);
 }
 // Type selection applies to the featured family, not its Colorless supports.
 const coreScore=c=>pokemonScore(c,evolutionPool)+synergy.pokemonThemeScore(c,theme)*4+
   (requested.length?(c.types||[]).includes(requested[0])?240:(c.types||[]).some(type=>requested.includes(type))?120:0:0);
 candidates.sort((a,b)=>coreScore(b)-coreScore(a)||Number(a.number)-Number(b.number));
 if(!candidates.length)return fail('No complete owned evolution family matches the selected rarity, Basic-only and Energy type preferences. Widen the filter or collect the required evolution stages.');
 if(theme!=='any'&&!candidates.some(c=>synergy.pokemonThemeScore(c,theme)>0))return fail(`No owned Pokémon supports the ${synergy.THEMES.find(t=>t.id===theme).label} strategy within the selected rarity, sets and Energy types.`);
 if(theme!=='any'&&!focus)candidates=candidates.filter(c=>synergy.pokemonThemeScore(c,theme)>0);
 let featured=null,main=candidates[0],mainLine=[];
 if(style==='random'&&!focus){
   let roster=pokemonPool.filter(c=>isEligible(c)&&matchesRarity(c,rarityFocus,basicOnly)&&(theme==='any'||synergy.pokemonThemeScore(c,theme)>0));
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
   mainLine=familyLine(main,evolutionPool);
 }
 // Choosing two allowed types is not a request to pollute a single-type
 // attacker's Energy Zone. Mixed *support* requires an explicit opt-in; a
 // featured family that itself needs two Energy types always keeps both.
 // A focused evolution family may need two genuine Energy types even when
 // the player filters by the final Pokémon's single displayed type (e.g.
 // Neo Scyther Grass -> Scizor Metal, Pupitar Fighting -> Tyranitar Darkness).
 // Never grant that second type to an unrelated support attacker.
 const mainRoot=familyRoot(main,evolutionPool),lineEnergy=[...new Set(mainLine.flatMap(attackTypes))],selectedTypes=requestedEnergy.length===1?[...new Set([...requestedEnergy,...lineEnergy])].slice(0,2):(allowMixedEnergy&&requestedEnergy.length===2?requestedEnergy.slice():lineEnergy.slice(0,2));
 if(!selectedTypes.length){const ownType=requestedEnergy[0]||(main.deckMeta?.preferredEnergyTypes||[]).find(t=>decks.ENERGY_TYPES.includes(t))||(main.types||[]).find(t=>decks.ENERGY_TYPES.includes(t));if(ownType)selectedTypes.push(ownType);}
 if(!selectedTypes.length)selectedTypes.push('Fighting');
 const cards=[],counts=new Map();
 function trainerIsUseful(card){
   // EX Deoxys Lady Outing searches fresh Basic Energy via the Zone in the
   // approved hybrid format; it must no longer be excluded as a dead card.
   if(['ex8-93','ex8-95'].includes(card?.id)&&!cards.some(id=>{const p=classic.cardById(id);return p?.kind==='pokemon'&&['Stage 1','Stage 2'].includes(p.stage)&&!p.pokemonEx;}))return false;
   if(card?.id==='ex7-95'&&!cards.some(id=>/^(Dark |Rocket's )/.test(classic.cardById(id)?.name||'')))return false;
   if(card?.id==='ex7-94'&&!selectedTypes.some(type=>['Darkness','Metal'].includes(type)))return false;
   if(card?.kind==='trainer'){const ctx=synergy.context(cards.map(classic.cardById).filter(Boolean),selectedTypes,theme);if(synergy.trainerScore(card,ctx)===-Infinity)return false;}
   if(card.name==="Brock's Training Method")return cards.some(id=>{const pokemon=classic.cardById(id);return pokemon?.kind==='pokemon'&&pokemon.name.startsWith("Brock's ");});
   return true;
 }
 function room(card){const copiesOfName=[...counts].filter(([id])=>classicCardName(classic.cardById(id)?.name)===classicCardName(card.name)).reduce((sum,[,count])=>sum+count,0);const starSlots=card.pokemonStar?Math.max(0,1-cards.filter(id=>classic.cardById(id)?.pokemonStar).length):4;return Math.max(0,Math.min(starSlots,(card.name.startsWith('Shining ')?1:4)-copiesOfName,Number(owned.get(card.id)||0)-(counts.get(card.id)||0)));}
 function add(card,n=1){if(card?.kind==='trainer'&&!trainerIsUseful(card))return 0;if(card?.trainerType==='Stadium'&&cards.filter(id=>classic.cardById(id)?.trainerType==='Stadium').length>=1&&!cards.includes(card.id))return 0;let added=0;while(added<n&&cards.length<30&&room(card)>0&&!(card?.trainerType==='Stadium'&&cards.filter(id=>classic.cardById(id)?.trainerType==='Stadium').length>=2)){cards.push(card.id);counts.set(card.id,(counts.get(card.id)||0)+1);added++;}return added;}
 function addLine(line,copies){if(!line.length||line.some(c=>Number(owned.get(c.id)||0)<1))return false;for(let copy=0;copy<copies;copy++){if(line.some(c=>room(c)<1)||cards.length+line.length>30)break;for(const c of line)add(c,1);}return line.every(c=>(counts.get(c.id)||0)>0);}
 // Preserve legal existing cards first for Fill / repair, but never exceed ownership/copy limits.
 for(const id of existing){const c=classic.cardById(id);if(c&&allowedInSetPool(c,scope)&&c.battleEnabled&&c.deckEligible!==false)add(c,1);}
 // Ensure any preserved evolutions gain their missing prerequisites.
 for(const id of [...cards]){const c=classic.cardById(id);if(c?.kind==='pokemon'&&c.stage!=='Basic'){const line=familyLine(c,evolutionPool);if(line.length)for(const member of line.slice(0,-1))if(!(counts.get(member.id)||0))add(member,1);}}
 const mainCopies=mainLine.length>=2?3:4;addLine(mainLine,mainCopies);
 // A stage-two engine wants one more opening Basic than evolution cards.
 if(mainLine.length>=2)add(mainLine[0],1);
 const pokemonCount=()=>cards.map(classic.cardById).filter(c=>c?.kind==='pokemon').length;
 const neededTypes=()=>[...new Set(cards.map(classic.cardById).flatMap(attackTypes))];
 // Lock support selection to the featured family's actual Energy plan. The
 // previous <=2-type check splashed unrelated Grass attackers into mono-Water
 // decks, then the automatic Energy Zone gave them 50% Grass draws. A true
 // dual-cost featured family (or two explicitly selected types) still works.
 const plannedEnergy=selectedTypes.slice();
 const canFitEnergy=c=>{const line=familyLine(c,evolutionPool),family=line.length?line:[c],needed=[...new Set([...neededTypes(),...family.flatMap(attackTypes)])],special=specialCosts([...cards.map(classic.cardById).filter(Boolean),...family]);return (options._allowSecondType===true&&!requestedEnergy.length?needed.length<=2:needed.every(t=>plannedEnergy.includes(t)))&&Object.entries(special).every(([sym,n])=>!n||allowedInSetPool(classic.cardById(SPECIAL_COST_CARDS[sym]),scope)&&Number(owned.get(SPECIAL_COST_CARDS[sym])||0)>=n);};
 const chooseCandidate=candidates=>{
   if(!candidates.length)return null;
   if(style==='random'){
     const band=candidates.slice(0,Math.min(6,candidates.length));
     return band[Math.floor(random()*band.length)]||band[0];
   }
   return candidates[0];
 };
 // Prefer an entire compatible evolution partner; never add an isolated Basic
 // whose strength depends upon an unavailable evolution (e.g. Base Set Koffing).
 const partnerCandidates=endpointCards(pokemonPool).filter(c=>
   !basicOnly&&matchesRarity(c,rarityFocus,false)&&
   familyRoot(c,evolutionPool)!==mainRoot&&familyRoot(c,evolutionPool)!=='Koffing'&&familyLine(c,evolutionPool).length===2&&canFitEnergy(c)
 ).sort((a,b)=>{
   const newA=attackTypes(a).filter(t=>!selectedTypes.includes(t)).length;
   const newB=attackTypes(b).filter(t=>!selectedTypes.includes(t)).length;
   const matchingA=(a.types||[]).some(t=>(main.types||[]).includes(t))?1:0;
   const matchingB=(b.types||[]).some(t=>(main.types||[]).includes(t))?1:0;
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
 // Supplement only when there is room and a genuinely useful independent role.
 // No arbitrary 14-Pokémon quota: extra Trainers are often more valuable.
 const evolvingNames=new Set(pokemonPool.filter(c=>c.evolvesFrom).map(c=>c.evolvesFrom));
 const usefulBasics=pokemonPool.filter(c=>matchesRarity(c,rarityFocus,true)&&c.stage==='Basic'&&
   !evolvingNames.has(c.name)&&familyRoot(c,evolutionPool)!==mainRoot&&canFitEnergy(c)&&standaloneScore(c)>=70
 ).sort((a,b)=>{
   // Do not splash an unrelated Fire attacker into every Water/Psychic/Fighting
   // deck simply because it has high HP or efficient opening damage.
   const required=neededTypes();
   const extraA=attackTypes(a).filter(t=>!required.includes(t)).length;
   const extraB=attackTypes(b).filter(t=>!required.includes(t)).length;
   const sameTypeA=(a.types||[]).some(t=>(main.types||[]).includes(t))?1:0;
   const sameTypeB=(b.types||[]).some(t=>(main.types||[]).includes(t))?1:0;
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
 // Fallback through remaining owned Trainers first, then compatible Basics. This remains legal but avoids stranded evolutions.
 const trainerFallback=pool.filter(c=>(c.kind==='trainer'||c.specialEnergy&&(!isDiscoveryEnergySupply(c,scope)||specialNeeds[c.id==='neo1-104'?'D':'M']>0))&&trainerIsUseful(c)).sort((a,b)=>synergy.trainerScore(b,supportContext())-synergy.trainerScore(a,supportContext())||Number(a.number)-Number(b.number));
 for(const c of trainerFallback){while(cards.length<30&&room(c)>0){if(!add(c,1))break;}if(cards.length>=30)break;}
 const fallbackBasics=pokemonPool.filter(c=>c.stage==='Basic'&&canFitEnergy(c)).sort((a,b)=>Number(matchesRarity(b,rarityFocus,basicOnly))-Number(matchesRarity(a,rarityFocus,basicOnly))||standaloneScore(b)-standaloneScore(a));
 for(const c of fallbackBasics){while(cards.length<30&&room(c)>0&&canFitEnergy(c)){if(!add(c,1))break;}if(cards.length>=30)break;}
 if(cards.length<30&&!requestedEnergy.length){for(const c of pokemonPool.filter(c=>c.stage==='Basic').sort((a,b)=>Number(matchesRarity(b,rarityFocus,basicOnly))-Number(matchesRarity(a,rarityFocus,basicOnly)))){if(!canFitEnergy(c))continue;while(cards.length<30&&room(c)>0){if(!add(c,1))break;}if(cards.length>=30)break;}}
 // Final conservative fill: respect the planned mono/explicit dual Energy profile;
 // only the sparse-inventory rescue is allowed a second otherwise unrequested type.
 if(cards.length<30){for(const c of pool.filter(c=>(c.kind==='trainer'||c.specialEnergy&&(!isDiscoveryEnergySupply(c,scope)||specialNeeds[c.id==='neo1-104'?'D':'M']>0)||c.stage==='Basic')&&trainerIsUseful(c))){while(cards.length<30&&room(c)>0){const trial=[...cards,c.id],profile=decks.analyzeDeck(trial).recommendedEnergyTypes;if(options._allowSecondType===true&&!requestedEnergy.length?profile.length>2:!profile.every(t=>plannedEnergy.includes(t)))break;if(!add(c,1))break;}if(cards.length>=30)break;}}
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
 const legal=decks.validateDraft(cards,rows,{requireFull:true});if(!legal.ok)return {ok:false,cards,energyTypes:selectedTypes,errors:legal.errors,warnings:[],strategy:''};
 const analysis=decks.analyzeDeck(cards),energyTypes=requestedEnergy.length===1?[...new Set([...requestedEnergy,...mainLine.flatMap(attackTypes)])].slice(0,2):(allowMixedEnergy&&requestedEnergy.length===2?requestedEnergy:neededTypes().length?analysis.recommendedEnergyTypes.slice(0,2):selectedTypes.slice(0,2));
 const finalEnergy=energyTypes.length?energyTypes:selectedTypes.slice(0,2);
 const specialist=(main.types||[]).find(t=>t==='Darkness'||t==='Metal');
 const zoneLabel=finalEnergy.join(' / ');
 const label=specialist?`${specialist} · Basic Zone: ${zoneLabel}`:(requested.includes('Colorless')?`Colorless / ${zoneLabel}`:zoneLabel);
 const plan=synergy.report(cards.map(classic.cardById).filter(Boolean),finalEnergy,theme);
 return {ok:true,cards,energyTypes:finalEnergy,errors:[],warnings:plan.warnings.map(message=>({message})),plan,style,archetypeKey:archetypeKey(featured||main),focusCardId:focus?.id||featured?.id||main.id,strategy:`${style==='random'?'Random featured':'Competitive'} · ${theme!=='any'?synergy.THEMES.find(t=>t.id===theme).label+' · ':''}${rarityFocus!=='any'?RARITY_FOCUS.find(r=>r.id===rarityFocus).label+' · ':''}${basicOnly?'Basic-only · ':''}${label} · ${featured?featured.name+' featured · ':''}${archetypeName(main,evolutionPool)} core · ${pokemonCount()} Pokémon / ${30-pokemonCount()} Trainers & Special Energy`};
}
function buildDeckAsync(rows,options,control={}){return new Promise(resolve=>{setTimeout(()=>{if(control.isCancelled?.())return resolve(null);resolve(buildDeck(rows,options));},0);});}
return {buildDeck,buildDeckAsync,THEMES:synergy.THEMES,familyLine,familyRoot,attackTypes,ARCHETYPE_TYPES,SET_IDS,RARITY_FOCUS,rarityTier,matchesRarity};
});
