'use strict';
const crypto=require('node:crypto');
const {compileAdditional}=require('./tcgp-text-compositions.cjs');
const ENERGY={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'};
const TYPES=[...Object.keys(ENERGY),'Dragon'];
const clean=s=>String(s??'').normalize('NFKC').replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
function setId(s){s=String(s||'').toUpperCase();if(['PA','PROMO-A','P-A'].includes(s))return 'P-A';if(['PB','PROMO-B','P-B'].includes(s))return 'P-B';return s.replace(/^([ABC]\d+)([A-Z])$/,(m,a,b)=>a+b.toLowerCase());}
function printId(id){const m=String(id||'').match(/^(.*?)[-\/](\d+)$/);if(!m)throw Error('Invalid print ID: '+id);return setId(m[1])+'-'+m[2].padStart(3,'0');}
function sequence(effects){const list=effects.filter(Boolean);return list.length===0?null:list.length===1?list[0]:{type:'sequence',effects:list};}
function selections(e){if(!e)return 0;if(e.type==='sequence')return e.effects.reduce((n,e)=>n+selections(e),0);if(e.type==='coinFlip')return Math.max(selections(e.heads),selections(e.tails));return Number(e.type==='selectedDamage'||e.type==='switch'&&!e.source||e.type==='benchDamage'&&!e.all||['selfBench','selfPokemon','opponentBench','opponentPokemon'].includes(e.target)||e.type==='moveEnergy'&&(e.source==='selfBench'||e.target==='selfBench'));}
function compileEffect(raw,kind='attack',baseDamage=0){
 const text=clean(raw);if(!text)return {supported:true,effect:null};let m;
 const ok=effect=>({supported:true,effect}),fail=()=>({supported:false,effect:null,reason:'Unimplemented '+kind+' text: '+text});
 // Every pattern is anchored against the complete rules text. Unconsumed text
 // must never disappear merely because its first sentence was recognized.
 if((m=text.match(/^Heal (\d+) damage from this Pokémon\.$/)))return ok({type:'healSelf',amount:+m[1]});
 if((m=text.match(/^This Pokémon also does (\d+) damage to itself\.$/)))return ok({type:'selfDamage',amount:+m[1]});
 if((m=text.match(/^Your opponent's Active Pokémon is now (Poisoned|Burned|Asleep|Paralyzed|Confused)(?: and (Poisoned|Burned|Asleep|Paralyzed|Confused))?\.$/))){const states={Poisoned:'poison',Burned:'burn',Asleep:'sleep',Paralyzed:'paralysis',Confused:'confusion'};return ok(sequence(m.slice(1).filter(Boolean).map(s=>({type:'status',status:states[s],target:'opponentActive'}))));}
 if((m=text.match(/^Flip a coin\. If heads, your opponent's Active Pokémon is now (Poisoned|Burned|Asleep|Paralyzed|Confused)\.$/))){const branch=compileEffect("Your opponent's Active Pokémon is now "+m[1]+'.');return ok({type:'coinFlip',heads:branch.effect});}
 if((m=text.match(/^Flip a coin\. If heads, this attack does (\d+) more damage\.$/)))return ok({type:'coinDamage',coins:1,amount:+m[1],mode:'add'});
 if(/^Flip a coin\. If tails, this attack does nothing\.$/.test(text))return ok({type:'coinDamage',coins:1,amount:baseDamage,mode:'replace'});
 if((m=text.match(/^Flip (\d+) coins\. This attack does (\d+) damage for each heads\.$/)))return ok({type:'coinDamage',coins:+m[1],amount:+m[2],mode:'replace'});
 if((m=text.match(/^Heal (\d+) damage from (?:1 of )?your Active Pokémon\.$/)))return ok({type:'heal',target:'selfActive',amount:+m[1]});
 if((m=text.match(/^Heal (\d+) damage from 1 of your Pokémon\.$/)))return ok({type:'heal',target:'selfPokemon',amount:+m[1]});
 if(/^Draw a card\.$/.test(text))return ok({type:'draw',amount:1});
 if((m=text.match(/^Draw (\d+) cards\.$/)))return ok({type:'draw',amount:+m[1]});
 if(/^Put a random Basic Pokémon from your deck into your hand\.$/.test(text))return ok({type:'searchRandomBasic',amount:1});
 if(/^Put a random Pokémon from your deck into your hand\.$/.test(text))return ok({type:'search',filter:{kind:'pokemon'},amount:1,source:'deck',random:true});
 if(/^Each player shuffles the cards in their hand into their deck, then draws that many cards\.$/.test(text))return ok({type:'handShuffle',side:'both',draw:'same'});
 if((m=text.match(/^Your opponent shuffles their hand into their deck and draws (\d+) cards\.$/)))return ok({type:'handShuffle',side:'opponent',draw:+m[1]});
 if((m=text.match(/^Play this card as if it were a (\d+)-HP Basic \{C\} Pokémon\. At any time during your turn, you may discard this card from play\. This card can't retreat\.$/)))return ok({type:'playFossil',hp:+m[1],subtype:'Colorless',canRetreat:false});
 if((m=text.match(/^Put a random Basic \{([GRWLPFDM])\} Pokémon from your discard pile into your hand\.$/)))return ok({type:'search',filter:{kind:'pokemon',stage:'Basic',subtype:Object.keys(ENERGY).find(k=>ENERGY[k]===m[1])},amount:1,source:'discard',random:true});
 if((m=text.match(/^Discard (a|an|\d+) \{([GRWLPFDM])\} Energy from this Pokémon\.$/)))return ok({type:'discardEnergy',target:'self',energyType:Object.keys(ENERGY).find(k=>ENERGY[k]===m[2]),amount:/^a/.test(m[1])?1:+m[1]});
 if(/^Discard all Energy from this Pokémon\.$/.test(text))return ok({type:'discardEnergy',target:'self',amount:'all'});
 // Random Energy selection has distinct semantics from generic payment; it is
 // deliberately not represented by discardEnergy until that choice is supported.
 if((m=text.match(/^Take (a|an|\d+) \{([GRWLPFDM])\} Energy from your Energy Zone and attach (?:it|them) to this Pokémon\.$/)))return ok({type:'attachEnergy',target:'self',energyType:Object.keys(ENERGY).find(k=>ENERGY[k]===m[2]),amount:/^a/.test(m[1])?1:+m[1]});
 if((m=text.match(/^Take (a|an|\d+) \{([GRWLPFDM])\} Energy from your Energy Zone and attach (?:it|them) to 1 of your Benched Pokémon\.$/)))return ok({type:'attachEnergy',target:'selfBench',energyType:Object.keys(ENERGY).find(k=>ENERGY[k]===m[2]),amount:/^a/.test(m[1])?1:+m[1]});
 if((m=text.match(/^This attack does (\d+) more damage for each Energy attached to your opponent's Active Pokémon\.$/)))return ok({type:'energyDamage',amount:+m[1],source:'opponent',mode:'add'});
 if((m=text.match(/^This attack does (\d+) more damage for each of your Benched Pokémon\.$/)))return ok({type:'benchCountDamage',amount:+m[1],side:'self',mode:'add'});
 if((m=text.match(/^If this Pokémon has damage on it, this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[1],condition:{type:'selfDamaged'}});
 if((m=text.match(/^If your opponent's Active Pokémon has damage on it, this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[1],condition:{type:'opponentDamaged'}});
 if((m=text.match(/^This attack also does (\d+) damage to (1 of|each of) your opponent's Benched Pokémon\.$/)))return ok({type:'benchDamage',amount:+m[1],side:'opponent',all:m[2]==='each of'});
 if((m=text.match(/^During your opponent's next turn, this Pokémon takes [−-](\d+) damage from attacks\.$/)))return ok({type:'modifier',stat:'damageReduction',amount:+m[1],duration:'opponentTurn'});
 if(/^Switch this Pokémon with 1 of your Benched Pokémon\.$/.test(text))return ok({type:'switch',side:'self'});
 if((m=text.match(/^During your opponent's next turn, the Defending Pokémon can't retreat\.$/)))return ok({type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'});
 if(/^During your next turn, this Pokémon can't attack\.$/.test(text))return ok({type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'});
 if((m=text.match(/^During your next turn, this Pokémon can't use (.+)\.$/)))return ok({type:'lock',target:'self',action:'attack',attackName:m[1],duration:'nextOwnTurn'});
 if(/^Flip a coin\. If heads, during your opponent's next turn, prevent all damage from—and effects of—attacks done to this Pokémon\.$/.test(text))return ok({type:'coinFlip',heads:{type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}});
 if((m=text.match(/^This attack does (\d+) damage to 1 of your opponent's (Benched Pokémon|Pokémon)( that have damage on them)?\.$/)))return ok({type:'selectedDamage',target:m[2]==='Benched Pokémon'?'opponentBench':'opponentPokemon',amount:+m[1],...(m[3]?{filter:{damaged:true}}:{})});
 if((m=text.match(/^Discard a random Energy from (this Pokémon|your opponent's Active Pokémon)\.$/)))return ok({type:'discardEnergy',target:m[1]==='this Pokémon'?'self':'opponentActive',amount:1,random:true});
 if((m=text.match(/^Flip a coin\. If heads, discard a random Energy from your opponent's Active Pokémon\.$/)))return ok({type:'coinFlip',heads:{type:'discardEnergy',target:'opponentActive',amount:1,random:true}});
 if(/^Flip a coin until you get tails\. For each heads, discard a random Energy from your opponent's Active Pokémon\.$/.test(text))return ok({type:'coinUntilTails',effect:{type:'discardEnergy',target:'opponentActive',amount:1,random:true}});
 if((m=text.match(/^Flip a coin until you get tails\. This attack does (\d+) (more )?damage for each heads\.$/)))return ok({type:'coinDamage',coins:'untilTails',amount:+m[1],mode:m[2]?'add':'replace'});
 if((m=text.match(/^If this Pokémon has a Pokémon Tool attached, this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[1],condition:{type:'selfHasTool'}});
 if((m=text.match(/^If this Pokémon has at least (\d+) extra \{([GRWLPFDM])\} Energy attached, this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[3],condition:{type:'selfExtraEnergyAtLeast',amount:+m[1],energyType:Object.keys(ENERGY).find(k=>ENERGY[k]===m[2])}});
 if((m=text.match(/^If you played a Supporter card from your hand during this turn, this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[1],condition:{type:'supporterPlayed'}});
 if((m=text.match(/^This attack does (\d+) (more )?damage for each of your Benched \{([GRWLPFDM])\} Pokémon\.$/)))return ok({type:'benchCountDamage',amount:+m[1],side:'self',pokemonType:Object.keys(ENERGY).find(k=>ENERGY[k]===m[3]),mode:m[2]?'add':'replace'});
 if((m=text.match(/^This Pokémon is now (Asleep|Poisoned|Burned|Paralyzed|Confused)\.$/)))return ok({type:'status',target:'self',status:({Asleep:'sleep',Poisoned:'poison',Burned:'burn',Paralyzed:'paralysis',Confused:'confusion'})[m[1]]});
 if((m=text.match(/^Discard a \{([GRWLPFDM])\}, \{([GRWLPFDM])\}, and \{([GRWLPFDM])\} Energy from this Pokémon\.$/)))return ok(sequence(m.slice(1).map(s=>({type:'discardEnergy',target:'self',energyType:Object.keys(ENERGY).find(k=>ENERGY[k]===s),amount:1}))));
 if((m=text.match(/^During your opponent's next turn, attacks used by the Defending Pokémon do [−-](\d+) damage\.$/)))return ok({type:'modifier',target:'opponentActive',stat:'attackDamage',amount:-Number(m[1]),duration:'opponentTurn'});
 if((m=text.match(/^The Pokémon this card is attached to gets \+(\d+) HP\.$/)))return ok({type:'modifier',stat:'maxHp',amount:+m[1],duration:'whileInPlay'});
 if((m=text.match(/^Attacks used by Stage 1 Pokémon in play \(both yours and your opponent's\) do \+(\d+) damage to the opponent's Active Pokémon\.$/)))return ok({type:'modifier',stat:'attackDamage',amount:+m[1],duration:'whileInPlay',scope:'both',filter:{stage:'Stage 1'}});
 if((m=text.match(/^Each Basic Pokémon in play \(both yours and your opponent's\) gets \+(\d+) HP\.$/)))return ok({type:'modifier',stat:'maxHp',amount:+m[1],duration:'whileInPlay',scope:'both',filter:{stage:'Basic'}});
 if((m=text.match(/^The Retreat Cost of each \{([GRWLPFDM])\} Pokémon in play \(both yours and your opponent's\) is (\d+) less\.$/)))return ok({type:'modifier',stat:'retreatCost',amount:-Number(m[2]),duration:'whileInPlay',scope:'both',filter:{subtype:Object.keys(ENERGY).find(k=>ENERGY[k]===m[1])}});
 if((m=text.match(/^During this turn, the Retreat Cost of your Active Pokémon is (\d+) less\.$/)))return ok({type:'modifier',stat:'retreatCost',amount:-Number(m[1]),duration:'turn',scope:'active'});
 if((m=text.match(/^During this turn, attacks used by your Pokémon do \+(\d+) damage to your opponent's Active Pokémon\.$/)))return ok({type:'modifier',stat:'attackDamage',amount:+m[1],duration:'turn',scope:'team'});
 const additional=compileAdditional(text,kind,baseDamage,compileEffect);if(additional){
  const selectors=new Set();function visit(e){if(!e)return;if(['selfBench','selfPokemon','opponentBench','opponentPokemon'].includes(e.target))selectors.add(e.target);if(e.type==='benchDamage'&&!e.all)selectors.add(e.side==='self'?'selfBench':'opponentBench');if(e.type==='switch'&&!e.source)selectors.add(e.side==='opponent'?'opponentBench':'selfBench');if(e.type==='moveEnergy')selectors.add(e.source==='selfBench'?'selfBench':e.target);for(const c of e.effects||[])visit(c);visit(e.heads);visit(e.tails);}visit(additional.effect);
  return selectors.size>1?fail():additional;
 }
 // Compound effects are accepted only when every full sentence is understood.
 const parts=text.split(/(?<=\.) (?=[A-Z])/);if(parts.length>1&&!text.startsWith('Flip ')){const values=parts.map(p=>compileEffect(p,kind,baseDamage));if(values.every(v=>v.supported)){const effect=sequence(values.map(v=>v.effect));if(selections(effect)<=1)return ok(effect);}}
 return fail();
}
function compileAbility(a){
 const text=clean(a.effect);let m;
 if((m=text.match(/^Once during your turn, you may heal (\d+) damage from your Active Pokémon\.$/)))return {supported:true,ability:{name:clean(a.name),text,type:'activated',oncePerTurn:true,effect:{type:'heal',target:'selfActive',amount:+m[1]}}};
 if((m=text.match(/^This Pokémon takes [−-](\d+) damage from attacks\.$/)))return {supported:true,ability:{name:clean(a.name),text,type:'passive',effect:{type:'modifier',stat:'damageReduction',amount:+m[1],duration:'whileInPlay'}}};
 if(/^At the end of your turn, if this Pokémon is in the Active Spot, draw a card\.$/.test(text))return {supported:true,ability:{name:clean(a.name),text,type:'triggered',event:'endTurn',activeOnly:true,effect:{type:'draw',amount:1}}};
 if((m=text.match(/^If this Pokémon is in the Active Spot and is damaged by an attack from your opponent's Pokémon, do (\d+) damage to the Attacking Pokémon\.$/)))return {supported:true,ability:{name:clean(a.name),text,type:'triggered',event:'damagedByAttack',activeOnly:true,effect:{type:'damage',target:'opponentActive',amount:+m[1]}}};
 if(/^Once during your turn, if this Pokémon is on your Bench, you may switch it with your Active Pokémon\.$/.test(text))return {supported:true,ability:{name:clean(a.name),text,type:'activated',oncePerTurn:true,benchOnly:true,effect:{type:'switch',side:'self',source:true}}};
 if(/^Once during your turn, you may switch in 1 of your opponent's Benched Pokémon to the Active Spot\.$/.test(text))return {supported:true,ability:{name:clean(a.name),text,type:'activated',oncePerTurn:true,effect:{type:'switch',side:'opponent'}}};
 if(/^Once during your turn, you may move all \{P\} Energy from 1 of your Benched \{P\} Pokémon to your Active Pokémon\.$/.test(text))return {supported:true,ability:{name:clean(a.name),text,type:'activated',oncePerTurn:true,effect:{type:'moveEnergy',source:'selfBench',target:'selfActive',energyType:'Psychic',amount:'all',sourceFilter:{subtype:'Psychic'}}}};
 if(/^This Pokémon can't be affected by any Special Conditions\.$/.test(text))return {supported:true,ability:{name:clean(a.name),text,type:'passive',effect:{type:'preventStatus',duration:'whileInPlay'}}};
 return {supported:false,ability:{name:clean(a.name),text,type:'unsupported',effect:null},reason:'Unimplemented ability text: '+text};
}
function normalizeMechanics(raw){
 const reasons=[],kind=raw.category==='Pokemon'?'pokemon':'trainer',card={id:printId(raw.id),name:clean(raw.name),setId:setId(raw.setId||raw.id.slice(0,raw.id.lastIndexOf('-'))),kind};
 card.ruleBoxes=(raw.rules||[]).map(clean);card.tags=[];
 if(kind==='pokemon'){
  card.hp=Number.isFinite(Number(raw.hp))?Number(raw.hp):null;card.types=Array.isArray(raw.types)?raw.types.slice():[];card.subtype=card.types[0]||null;card.stage=({Basic:'Basic',Stage1:'Stage 1',Stage2:'Stage 2'})[raw.stage]||'Unknown';card.evolvesFrom=clean(raw.evolveFrom)||null;card.retreat=Number.isFinite(Number(raw.retreat))?Number(raw.retreat):null;card.weakness=raw.weaknesses?.[0]?.type||null;
  const ex=raw.suffix==='EX'||/\bex$/i.test(card.name);card.points=/^Mega /i.test(card.name)&&ex?3:ex?2:1;if(ex)card.tags.push('ex');if(card.points===3)card.tags.push('mega');
  if(!(card.hp>0&&Number.isInteger(card.hp)))reasons.push('Missing or invalid Pokémon HP');if(!TYPES.includes(card.subtype))reasons.push('Missing or invalid Pokémon type');if(card.stage==='Unknown')reasons.push('Missing or invalid evolution stage');if(card.stage!=='Basic'&&!card.evolvesFrom)reasons.push('Missing pre-evolution');if(!(Number.isInteger(card.retreat)&&card.retreat>=0))reasons.push('Missing or invalid retreat');if(card.weakness&&!TYPES.includes(card.weakness))reasons.push('Invalid weakness');if(raw.weaknesses?.some(w=>w.value!=='+20'))reasons.push('Unsupported weakness modifier');if(!card.types.length||card.types.length>2||new Set(card.types).size!==card.types.length||card.types.some(t=>!TYPES.includes(t)))reasons.push('Invalid Pokémon type list');
  card.attacks=(raw.attacks||[]).map(a=>{const amount=String(a.damage??'0').replace(/[+×x]$/,'');const damage=/^\d+$/.test(amount)?Number(amount):null,cost=(a.cost||[]).map(c=>ENERGY[c]||'?').join(''),compiled=compileEffect(a.effect,'attack',damage||0);if(damage===null)reasons.push('Invalid damage: '+a.damage);if(cost.includes('?'))reasons.push('Unsupported Energy cost');if(!compiled.supported)reasons.push(compiled.reason);if(/[+×x]/.test(String(a.damage))&&!a.effect)reasons.push('Variable damage has no rules text');return {name:clean(a.name),cost,damage:damage??0,text:clean(a.effect),effect:compiled.effect};});
  if(!card.attacks.length)reasons.push('No attack data');
  const abilities=(raw.abilities||[]).map(compileAbility);for(const a of abilities)if(!a.supported)reasons.push(a.reason);card.abilities=abilities.map(a=>a.ability);card.ability=card.abilities[0]||null;
 }else{
  card.trainerType=raw.trainerType||'Unknown';card.text=clean(raw.effect);card.attacks=[];card.ability=null;
  if(!['Item','Supporter','Tool','Stadium'].includes(card.trainerType))reasons.push('Missing or unsupported Trainer subtype');if(!card.text)reasons.push('Missing Trainer rules');
  const effect=compileEffect(raw.effect,'trainer');card.effect=effect.effect;if(!effect.supported)reasons.push(effect.reason);
  if(card.effect?.type==='playFossil'){Object.assign(card,{hp:card.effect.hp,subtype:'Colorless',stage:'Basic',points:1,retreat:0,tags:['fossil'],ability:{name:'Discard',text:'Discard this Fossil from play without awarding points.',type:'activated',effect:{type:'discardSelf'}}});}
  function passive(e){return !e||['modifier','preventDamage'].includes(e.type)||(e.type==='sequence'&&e.effects.every(passive));}
  if(['Tool','Stadium'].includes(card.trainerType)&&!passive(card.effect))reasons.push('Unsupported persistent Trainer activation context');
 }
 const unreviewedRules=card.ruleBoxes.filter(rule=>!(card.points===2&&rule==="ex rule: When your Pokémon ex is Knocked Out, your opponent gets 2 points."||card.points===3&&rule==="Mega Evolution ex rule: When your Mega Evolution Pokémon ex is Knocked Out, your opponent gets 3 points."));
 if(unreviewedRules.length)reasons.push('Additional rule box requires explicit review: '+unreviewedRules.join(' '));
 card.support={status:reasons.length?'PARTIAL':'FULL',reasons:[...new Set(reasons)]};card.battleEnabled=!reasons.length;return card;
}
function fingerprint(raw){const c=normalizeMechanics(raw);return JSON.stringify({name:c.name,kind:c.kind,hp:c.hp,types:c.types,subtype:c.subtype,stage:c.stage,evolvesFrom:c.evolvesFrom,retreat:c.retreat,weakness:c.weakness,points:c.points,attacks:c.attacks.map(a=>({name:a.name,cost:a.cost,damage:a.damage,text:a.text})),abilities:c.abilities,trainerType:c.trainerType,text:c.text,ruleBoxes:c.ruleBoxes,tags:c.tags});}
function normalizeCatalogue({prints,mechanics,sets,cutoff,excludedPrintIds=[],identityEvidence={}}){
 const setMap=new Map(sets.map(s=>[setId(s.id||s.code),s])),rawMap=new Map(mechanics.map(r=>[printId(r.id),r])),excluded=new Set(excludedPrintIds.map(printId)),cards=[],mapped=[],excludedPrints=[],seen=new Set(),identities=new Map(),rulesByKey=new Map();
 for(const raw of mechanics){const key=identityEvidence[printId(raw.id)];if(!key)continue;const prior=rulesByKey.get(key);if(prior&&fingerprint(prior)!==fingerprint(raw))throw Error('Conflicting gameplay identity '+key+': '+prior.id+' / '+raw.id);if(!prior||String(raw.id).localeCompare(prior.id)<0)rulesByKey.set(key,raw);}
 const ordered=prints.slice().sort((a,b)=>{const ai=printId(a.id),bi=printId(b.id),as=setMap.get(ai.slice(0,ai.lastIndexOf('-'))),bs=setMap.get(bi.slice(0,bi.lastIndexOf('-')));return String(as?.releaseDate||'').localeCompare(String(bs?.releaseDate||''))||ai.localeCompare(bi);});
 for(const p of ordered){const id=printId(p.id),sid=id.slice(0,id.lastIndexOf('-')),set=setMap.get(sid);if(!set)throw Error('Unknown set: '+sid);if(seen.has(id))throw Error('Duplicate print: '+id);seen.add(id);if(set.releaseDate>cutoff||excluded.has(id)){excludedPrints.push({id,reason:excluded.has(id)?'Not obtainable by cutoff':'Set releases after cutoff'});continue;}
  const sourceKey=identityEvidence[id],raw=rawMap.get(id)||(sourceKey&&rulesByKey.get(sourceKey));let canonical;if(raw){const key=fingerprint(raw);canonical=identities.get(key);if(!canonical){canonical=normalizeMechanics(raw);canonical.sourceGameplayKey=sourceKey||null;identities.set(key,canonical);cards.push(canonical);}}else{const unknownKey='unknown:'+(sourceKey||id);canonical=identities.get(unknownKey);if(!canonical){canonical={id,name:clean(p.name),setId:sid,kind:p.type==='Trainer'?'trainer':'pokemon',hp:Number(p.health)>0?Number(p.health):null,subtype:TYPES.includes(p.type)?p.type:null,stage:'Unknown',evolvesFrom:null,retreat:null,weakness:null,attacks:[],ability:null,sourceGameplayKey:sourceKey||null,trainerType:p.type==='Trainer'?'Unknown':undefined,support:{status:'UNSUPPORTED',reasons:['Missing licensed detailed mechanics data for this print; no same-name inference']},battleEnabled:false};identities.set(unknownKey,canonical);cards.push(canonical);}}
  mapped.push({id,gameplayId:canonical.id,setId:sid,number:id.slice(id.lastIndexOf('-')+1),name:clean(p.name),rarity:p.rarity||null,sourcePrintId:p.id,source:'tcgp',...(p.image&&['C1','P-C'].includes(sid)?{image:p.image}:{})});
 }
 return {schema:1,cutoff,sets:sets.filter(s=>s.releaseDate<=cutoff),cards,prints:mapped,excludedPrints};
}
module.exports={ENERGY,TYPES,clean,setId,printId,compileEffect,compileAbility,normalizeMechanics,normalizeCatalogue,fingerprint,sequence};
