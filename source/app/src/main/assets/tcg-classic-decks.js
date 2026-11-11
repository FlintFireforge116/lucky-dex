(function(root,factory){
  const classic=typeof module==='object'&&module.exports?require('./tcg-classic-battle-data.js'):root.LuckyDexClassicTCGBattleData;
  const api=factory(classic);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.LuckyDexClassicTCGDecks=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(classic){
'use strict';
if(!classic)throw new Error('Classic TCG battle data is missing.');
const ENERGY_TYPES=Object.freeze(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']);
const ENERGY_CODE=Object.freeze({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'});
const DEFAULTS=Object.freeze({schema:1,decks:[],activeDeckId:null,stats:{matches:0,wins:0,losses:0,draws:0,totalTurns:0,bestWinTurns:null}});
const LOANER_DECK=Object.freeze(classic.CLASSIC30_LOANER_DECK.slice());
function ensureState(state){
 if(!state||typeof state!=='object')throw new TypeError('LuckyDex state is required');
 const current=state.tcgClassicBattle&&typeof state.tcgClassicBattle==='object'?state.tcgClassicBattle:{};
 const next={...current,schema:Number(current.schema||1),decks:Array.isArray(current.decks)?current.decks:[],activeDeckId:current.activeDeckId||null,stats:{...DEFAULTS.stats,...(current.stats||{})}};
 state.tcgClassicBattle=next;return next;
}
function ownedRows(cards){return classic.projectOwnedCards(cards||{});}
function ownedMap(rows){const map=new Map();for(const row of rows||[])map.set(row.gameplayId,(map.get(row.gameplayId)||0)+Math.max(0,Number(row.quantity)||0));return map;}
function classicCardName(name){return String(name||'').replace(/[’]/g,"'").replace(/\s+(?=[♀♂])/g,'').trim();}
function countCards(cards){const map=new Map();for(const id of cards||[]){const card=classic.cardById(id);const key=card?.id||String(id||'');map.set(key,(map.get(key)||0)+1);}return map;}
// These four historical Dual Armor prints change TYPE only while their trigger
// Energy is attached. Their activation type is useful for auto-generation, but
// it is not an additional printed attack cost or a manual-deck legality rule.
function dualArmorProfile(card){
 const ability=(card?.abilities||[]).find(a=>/^dual armou?r$/i.test(String(a.name||'')));
 const description=String(ability?.text||'');
 const trigger=/has any (Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy attached/i.exec(description);
 const grant=/is both (Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) and (Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) type/i.exec(description);
 if(!trigger||!grant)return null;
 return {energyType:trigger[1][0].toUpperCase()+trigger[1].slice(1).toLowerCase(),types:[grant[1],grant[2]].map(t=>t[0].toUpperCase()+t.slice(1).toLowerCase())};
}
function analyzeDeck(cards,configured){
 const pokemon=(cards||[]).map(classic.cardById).filter(c=>c?.kind==='pokemon');
 // Classify Energy from a viable evolution line, not the union of every
 // optional move on every stage. Legend Maker Flygon ex needs G/L, while
 // Trapinch's optional F attack is unnecessary (its C attack still works).
 // This must agree with the builder, CPU energy validation and saved decks.
 const normalizeName=x=>classicCardName(x).replace(/\s*δ\s*$/u,'').toLowerCase();
 const attackCosts=c=>[...new Set((c?.attacks||[]).flatMap(a=>[...String(a.cost||'')].map(sym=>ENERGY_CODE[sym]).filter(Boolean)))];
 const roots=new Map(pokemon.map(c=>[normalizeName(c.name),c]));
 const endpoints=pokemon.filter(c=>!pokemon.some(other=>normalizeName(other.evolvesFrom)===normalizeName(c.name)&&
  Number(other.stage==='Stage 2'?2:other.stage==='Stage 1'?1:0)>Number(c.stage==='Stage 2'?2:c.stage==='Stage 1'?1:0)));
 const required=new Set();
 // Some printed in-play partners are deliberately Bench-only supports. Do not
 // require their attack colours in an otherwise mono-type Energy Zone just
 // because they were included for a partner Poké-Power/Body (Latios/Latias,
 // Regice/Regirock, etc.). Only a *minority* partner is exempt: two equally
 // represented attackers must still have their own Energy requirements met.
 const byId=new Map();for(const c of pokemon)byId.set(c.id,(byId.get(c.id)||0)+1);
 const optionalPartnerMeta=()=>{try{return typeof module==='object'&&module.exports?require('./tcg-deck-synergy.js'):typeof globalThis!=='undefined'?globalThis.LuckyDexDeckSynergy:null;}catch(_){return null;}};
 const meta=optionalPartnerMeta();
 const benchOnly=new Set(endpoints.filter(minor=>endpoints.some(major=>{
   if(major.id===minor.id||Number(byId.get(major.id)||0)<=Number(byId.get(minor.id)||0))return false;
   const partners=meta?.metadata?.(major)?.optionalPartners||major.deckMeta?.preferredPartners?.map(name=>({name}))||[];
   return partners.some(p=>normalizeName(p.name)===normalizeName(minor.name));
 })).map(c=>c.id));
 for(const end of endpoints){
   if(benchOnly.has(end.id))continue;
   const line=[end],seen=new Set([end.id]);let prior=end;
   while(prior.evolvesFrom){const c=roots.get(normalizeName(prior.evolvesFrom));if(!c||seen.has(c.id))break;line.unshift(c);seen.add(c.id);prior=c;}
   let needs=[...new Set(line.flatMap(attackCosts))];
   if(needs.length>2){
     const terminal=attackCosts(end);
     const viable=terminal.length<=2&&line.every(c=>!(c.attacks||[]).length||c.attacks.some(a=>[...String(a.cost||'')].every(sym=>sym==='C'||!ENERGY_CODE[sym]||terminal.includes(ENERGY_CODE[sym]))));
     if(viable)needs=terminal;
   }
   for(const type of needs)required.add(type);
 }
 const recommended=ENERGY_TYPES.filter(type=>required.has(type));
 // Prioritise later stages: if the endpoint carries Dual Armor, enable it
 // ahead of an earlier-stage Body when the two-type auto build is tight.
 const byStage=[...pokemon].sort((a,b)=>({'Stage 2':2,'Stage 1':1,Basic:0}[b.stage]||0)-({'Stage 2':2,'Stage 1':1,Basic:0}[a.stage]||0));
 const possibleAbilityTypes=[...new Set(byStage.map(dualArmorProfile).filter(Boolean).map(p=>p.energyType))];
 for(const type of possibleAbilityTypes)if(!recommended.includes(type)&&recommended.length<2)recommended.push(type);
 if(!recommended.length){const printed=pokemon.flatMap(c=>c.types||[]).find(t=>ENERGY_TYPES.includes(t));recommended.push(printed||'Fighting');}
 const types=configured==null?recommended:[...new Set((Array.isArray(configured)?configured:[]).filter(type=>ENERGY_TYPES.includes(type)))];
 return {recommendedEnergyTypes:recommended,configuredEnergyTypes:types,energyValid:types.length>=1&&types.length<=8,
  missingEnergyTypes:ENERGY_TYPES.filter(type=>required.has(type)&&!types.includes(type)),
  suggestedAbilityEnergyTypes:possibleAbilityTypes};
}
function deckEnergyTypes(deck){return deck?.energyMode==='manual'?analyzeDeck(deck.cards||[],deck.energyTypes||[]).configuredEnergyTypes:analyzeDeck(deck?.cards||[]).recommendedEnergyTypes;}
function validateDraft(cards,rows,{requireFull=false}={}){
 const list=Array.isArray(cards)?cards.slice():[],errors=[],have=ownedMap(rows),counts=countCards(list);
 if(requireFull){const core=classic.validateDeck(list);errors.push(...core.errors);}else{
   if(list.length>30)errors.push(`Classic TCG decks contain 30 cards (${list.length}/30).`);
   for(const [id,count] of counts){const card=classic.cardById(id);if(!card){errors.push(`Unknown Classic TCG card: ${id}.`);continue;}if(card.basicEnergy||card.deckEligible===false)errors.push(`${card.name} cannot occupy a Classic deck slot.`);if(!card.battleEnabled)errors.push(`${card.name} is not battle-ready.`);if([...counts].filter(([x])=>classicCardName(classic.cardById(x)?.name)===classicCardName(card.name)).reduce((n,[,v])=>n+v,0)>(card.name.startsWith('Shining ')?1:4))errors.push(card.name.startsWith('Shining ')?`${card.name} is limited to one card per deck.`:`${card.name} exceeds the four-copy limit across its prints.`);}
 }
 for(const [id,count] of counts){const card=classic.cardById(id);if(!card)continue;const quantity=Number(have.get(id)||0);if(count>quantity)errors.push(`Not enough owned copies of ${card.name}: need ${count}, own ${quantity}.`);}
 return {ok:errors.length===0,errors};
}
function readiness(deck,rows){const legal=validateDraft(deck?.cards||[],rows,{requireFull:true}),analysis=analyzeDeck(deck?.cards||[],deckEnergyTypes(deck));const errors=[...legal.errors];if(!analysis.energyValid)errors.push('Classic Energy Zone requires one to eight Basic Energy types.');if(analysis.missingEnergyTypes.length)errors.push(`Energy Zone is missing ${analysis.missingEnergyTypes.join(' / ')}.`);return {ok:errors.length===0,errors,analysis};}
function edit(cards,id,delta,rows){
 const list=(cards||[]).map(x=>classic.cardById(x)?.id||String(x||'')),card=classic.cardById(id),fail=error=>({ok:false,cards:list,error});if(!card)return fail('Unknown Base Set card.');
 const count=list.filter(x=>x===card.id).length;if(delta<0){const index=list.lastIndexOf(card.id);if(index>=0)list.splice(index,1);return {ok:true,cards:list};}
 if(card.basicEnergy||card.deckEligible===false)return fail('Basic Energy comes from the Energy Zone and is not placed in the 30-card deck.');
 if(!card.battleEnabled)return fail('This Classic card is not battle-ready.');if(list.length>=30)return fail('Your Classic deck already has 30 cards.');if(list.filter(id=>classicCardName(classic.cardById(id)?.name)===classicCardName(card.name)).length>=(card.name.startsWith('Shining ')?1:4))return fail(card.name.startsWith('Shining ')?`Only one ${card.name} may be in a deck.`:'Maximum four copies of the same Pokémon or Trainer card across all prints.');
 const have=Number(ownedMap(rows).get(card.id)||0);if(count>=have)return fail('No more owned copies available.');list.push(card.id);return {ok:true,cards:list};
}
function newId(battle){let n=1;while(battle.decks.some(deck=>deck.id===`classic-${n}`))n++;return `classic-${n}`;}
function saveDraft(state,draft,rows){
 const check=validateDraft(draft?.cards||[],rows,{requireFull:false});if(!check.ok)return {ok:false,errors:check.errors};const battle=ensureState(state),id=draft.id||newId(battle),cards=(draft.cards||[]).map(x=>classic.cardById(x)?.id||String(x||'')),energyMode=draft.energyMode==='manual'?'manual':'auto',energyTypes=energyMode==='manual'?analyzeDeck(cards,draft.energyTypes||[]).configuredEnergyTypes:analyzeDeck(cards).recommendedEnergyTypes;
 const saved={id,name:String(draft.name||'Classic Deck').trim().slice(0,40)||'Classic Deck',cards,energyMode,energyTypes,energyType:energyTypes[0]};const ready=readiness(saved,rows);saved.draft=!ready.ok;const index=battle.decks.findIndex(deck=>deck.id===id);if(index>=0)battle.decks[index]=saved;else battle.decks.push(saved);battle.activeDeckId=id;return {ok:true,deck:saved,readiness:ready};
}
function activeDeck(state,rows){const battle=ensureState(state),deck=battle.decks.find(item=>item?.id===battle.activeDeckId)||null;return deck&&readiness(deck,rows).ok?deck:null;}
function recordResult(state,battle){const classicState=ensureState(state),stats=classicState.stats;stats.matches+=1;stats.totalTurns+=Math.max(0,Number(battle?.turnNumber||0));if(battle?.winner==='player'){stats.wins+=1;stats.bestWinTurns=stats.bestWinTurns==null?Number(battle?.turnNumber||0):Math.min(stats.bestWinTurns,Number(battle?.turnNumber||0));}else if(battle?.winner==='opponent')stats.losses+=1;else stats.draws+=1;return stats;}
return {ENERGY_TYPES,dualArmorProfile,LOANER_DECK,ensureState,ownedRows,analyzeDeck,deckEnergyTypes,validateDraft,readiness,edit,saveDraft,activeDeck,recordResult};
});
