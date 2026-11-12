// Separate, persistent Test Lab deck libraries and CPU opponent filters.
// Collection ownership, progress, rewards and match records remain untouched.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.LuckyDexTCGTestLabDecks=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const SAVE_KEY='tcgTestLabDecks';
const POCKET_OPPONENT_KEYS=['opponentRarityFocus','opponentBasicOnly','opponentTheme'];
const CLASSIC_OPPONENT_KEYS=['opponentSets','opponentType','opponentDifficulty','opponentRarityFocus','opponentBasicOnly','opponentTheme'];
function opponentCopy(input,keys){
  const result={};
  for(const key of keys){
    if(!Object.prototype.hasOwnProperty.call(input||{},key))continue;
    const value=input[key];
    if(key==='opponentSets'&&Array.isArray(value))result[key]=value.filter(x=>typeof x==='string').slice(0,100);
    else if(typeof value==='string'||typeof value==='boolean'||typeof value==='number')result[key]=value;
  }
  return result;
}
function autoOptionsCopy(input){
 if(!input||typeof input!=='object')return null;
 const fields=['style','randomType','allowMixedEnergy','rarityFocus','basicOnly','theme','compareCandidates','playtestCandidates'];
 const value={};for(const key of fields)if(['string','boolean'].includes(typeof input[key]))value[key]=input[key];
 if(Array.isArray(input.types))value.types=input.types.filter(x=>typeof x==='string').slice(0,2);
 if(Array.isArray(input.sets))value.sets=input.sets.filter(x=>typeof x==='string').slice(0,100);
 return value;
}
function deckCopy(deck){
  if(!deck||typeof deck!=='object'||typeof deck.id!=='string')return null;
  return {...deck,cards:Array.isArray(deck.cards)?deck.cards.slice():[],energyTypes:Array.isArray(deck.energyTypes)?deck.energyTypes.slice():[],preferredPrints:deck.preferredPrints&&typeof deck.preferredPrints==='object'&&!Array.isArray(deck.preferredPrints)?{...deck.preferredPrints}:{}};
}
function libraryCopy(input){
  const decks=Array.isArray(input?.decks)?input.decks.map(deckCopy).filter(Boolean):[];
  const activeDeckId=decks.some(deck=>deck.id===input?.activeDeckId)?input.activeDeckId:null;
  return {decks,activeDeckId};
}
function restore(realState,session){
  const stored=realState?.[SAVE_KEY];
  const pocket=libraryCopy(stored?.pocket),classic=libraryCopy(stored?.classic);
  session.tcgpBattle={...session.tcgpBattle,...pocket,...opponentCopy(stored?.pocket?.opponent,POCKET_OPPONENT_KEYS)};
  session.tcgClassicBattle={...session.tcgClassicBattle,...classic,...opponentCopy(stored?.classic?.opponent,CLASSIC_OPPONENT_KEYS),...(autoOptionsCopy(stored?.classic?.autoBuildOptions)?{autoBuildOptions:autoOptionsCopy(stored?.classic?.autoBuildOptions)}:{})};
  return session;
}
function persist(realState,session){
  if(!realState||typeof realState!=='object')return false;
  realState[SAVE_KEY]={schema:2,
    pocket:{...libraryCopy(session?.tcgpBattle),opponent:opponentCopy(session?.tcgpBattle,POCKET_OPPONENT_KEYS)},
    classic:{...libraryCopy(session?.tcgClassicBattle),opponent:opponentCopy(session?.tcgClassicBattle,CLASSIC_OPPONENT_KEYS),autoBuildOptions:autoOptionsCopy(session?.tcgClassicBattle?.autoBuildOptions)}
  };
  return true;
}
return {SAVE_KEY,libraryCopy,opponentCopy,autoOptionsCopy,restore,persist};
});
