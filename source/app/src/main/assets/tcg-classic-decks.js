(function(root,factory){
  const classic=typeof module==='object'&&module.exports?require('./tcg-classic-battle-data.js'):root.LuckyDexClassicTCGBattleData;
  const api=factory(classic);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.LuckyDexClassicTCGDecks=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(classic){
'use strict';
if(!classic)throw new Error('Classic TCG battle data is missing.');
const ENERGY_TYPES=Object.freeze(['Grass','Fire','Water','Lightning','Psychic','Fighting']);
const ENERGY_CODE=Object.freeze({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting'});
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
function countCards(cards){const map=new Map();for(const id of cards||[]){const card=classic.cardById(id);const key=card?.id||String(id||'');map.set(key,(map.get(key)||0)+1);}return map;}
function analyzeDeck(cards,configured){
 const required=new Set();for(const id of cards||[]){const card=classic.cardById(id);if(!card)continue;for(const attack of card.attacks||[])for(const symbol of String(attack.cost||''))if(ENERGY_CODE[symbol])required.add(ENERGY_CODE[symbol]);}
 const recommended=ENERGY_TYPES.filter(type=>required.has(type));if(!recommended.length)recommended.push('Fighting');
 const types=configured==null?recommended:[...new Set((Array.isArray(configured)?configured:[]).filter(type=>ENERGY_TYPES.includes(type)))];
 return {recommendedEnergyTypes:recommended,configuredEnergyTypes:types,energyValid:types.length>=1&&types.length<=6,missingEnergyTypes:ENERGY_TYPES.filter(type=>required.has(type)&&!types.includes(type))};
}
function deckEnergyTypes(deck){return deck?.energyMode==='manual'?analyzeDeck(deck.cards||[],deck.energyTypes||[]).configuredEnergyTypes:analyzeDeck(deck?.cards||[]).recommendedEnergyTypes;}
function validateDraft(cards,rows,{requireFull=false}={}){
 const list=Array.isArray(cards)?cards.slice():[],errors=[],have=ownedMap(rows),counts=countCards(list);
 if(requireFull){const core=classic.validateDeck(list);errors.push(...core.errors);}else{
   if(list.length>30)errors.push(`Classic TCG decks contain 30 cards (${list.length}/30).`);
   for(const [id,count] of counts){const card=classic.cardById(id);if(!card){errors.push(`Unknown Base Set card: ${id}.`);continue;}if(card.basicEnergy||card.deckEligible===false)errors.push(`${card.name} cannot occupy a Classic deck slot.`);if(!card.battleEnabled)errors.push(`${card.name} is not battle-ready.`);if(count>4)errors.push(`${card.name} exceeds the four-copy limit (${count}).`);}
 }
 for(const [id,count] of counts){const card=classic.cardById(id);if(!card)continue;const quantity=Number(have.get(id)||0);if(count>quantity)errors.push(`Not enough owned copies of ${card.name}: need ${count}, own ${quantity}.`);}
 return {ok:errors.length===0,errors};
}
function readiness(deck,rows){const legal=validateDraft(deck?.cards||[],rows,{requireFull:true}),analysis=analyzeDeck(deck?.cards||[],deckEnergyTypes(deck));const errors=[...legal.errors];if(!analysis.energyValid)errors.push('Classic Energy Zone requires one to six Basic Energy types.');if(analysis.missingEnergyTypes.length)errors.push(`Energy Zone is missing ${analysis.missingEnergyTypes.join(' / ')}.`);return {ok:errors.length===0,errors,analysis};}
function edit(cards,id,delta,rows){
 const list=(cards||[]).map(x=>classic.cardById(x)?.id||String(x||'')),card=classic.cardById(id),fail=error=>({ok:false,cards:list,error});if(!card)return fail('Unknown Base Set card.');
 const count=list.filter(x=>x===card.id).length;if(delta<0){const index=list.lastIndexOf(card.id);if(index>=0)list.splice(index,1);return {ok:true,cards:list};}
 if(card.basicEnergy||card.deckEligible===false)return fail('Basic Energy comes from the Energy Zone and is not placed in the 30-card deck.');
 if(!card.battleEnabled)return fail('This Base Set card is not battle-ready.');if(list.length>=30)return fail('Your Classic deck already has 30 cards.');if(count>=4)return fail('Maximum four copies of the same Base Set card.');
 const have=Number(ownedMap(rows).get(card.id)||0);if(count>=have)return fail('No more owned copies available.');list.push(card.id);return {ok:true,cards:list};
}
function newId(battle){let n=1;while(battle.decks.some(deck=>deck.id===`classic-${n}`))n++;return `classic-${n}`;}
function saveDraft(state,draft,rows){
 const check=validateDraft(draft?.cards||[],rows,{requireFull:false});if(!check.ok)return {ok:false,errors:check.errors};const battle=ensureState(state),id=draft.id||newId(battle),cards=(draft.cards||[]).map(x=>classic.cardById(x)?.id||String(x||'')),energyMode=draft.energyMode==='manual'?'manual':'auto',energyTypes=energyMode==='manual'?analyzeDeck(cards,draft.energyTypes||[]).configuredEnergyTypes:analyzeDeck(cards).recommendedEnergyTypes;
 const saved={id,name:String(draft.name||'Base Set Deck').trim().slice(0,40)||'Base Set Deck',cards,energyMode,energyTypes,energyType:energyTypes[0]};const ready=readiness(saved,rows);saved.draft=!ready.ok;const index=battle.decks.findIndex(deck=>deck.id===id);if(index>=0)battle.decks[index]=saved;else battle.decks.push(saved);battle.activeDeckId=id;return {ok:true,deck:saved,readiness:ready};
}
function activeDeck(state,rows){const battle=ensureState(state),deck=battle.decks.find(item=>item?.id===battle.activeDeckId)||null;return deck&&readiness(deck,rows).ok?deck:null;}
function recordResult(state,battle){const classicState=ensureState(state),stats=classicState.stats;stats.matches+=1;stats.totalTurns+=Math.max(0,Number(battle?.turnNumber||0));if(battle?.winner==='player'){stats.wins+=1;stats.bestWinTurns=stats.bestWinTurns==null?Number(battle?.turnNumber||0):Math.min(stats.bestWinTurns,Number(battle?.turnNumber||0));}else if(battle?.winner==='opponent')stats.losses+=1;else stats.draws+=1;return stats;}
return {ENERGY_TYPES,LOANER_DECK,ensureState,ownedRows,analyzeDeck,deckEnergyTypes,validateDraft,readiness,edit,saveDraft,activeDeck,recordResult};
});
