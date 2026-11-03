// Random Classic CPU opponents use the same legal deck-building rules as players,
// but have access to the complete playable catalogue rather than the player's pulls.
(function(root,factory){
 const api=factory(
  typeof module==='object'&&module.exports?require('./tcg-classic-battle-data.js'):root.LuckyDexClassicTCGBattleData,
  typeof module==='object'&&module.exports?require('./tcg-classic-decks.js'):root.LuckyDexClassicTCGDecks,
  typeof module==='object'&&module.exports?require('./tcg-classic-deck-builder.js'):root.LuckyDexClassicTCGDeckBuilder
 );
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LuckyDexClassicTCGOpponents=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(classic,decks,builder){
 'use strict';
 if(!classic||!decks||!builder)throw new Error('Classic opponent generation dependencies are missing.');
 const ALL_PLAYABLE=Object.freeze(classic.CARDS.filter(card=>card.battleEnabled&&card.deckEligible!==false).map(card=>Object.freeze({gameplayId:card.id,quantity:4})));
 const TYPES=decks.ENERGY_TYPES.slice();
 function pick(seed,size){let x=(Number(seed)||0x9e3779b9)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%size;}
 function pickType({seed=Date.now(),excludeTypes=[]}={}){
   const excluded=new Set(excludeTypes.filter(type=>TYPES.includes(type)));
   const available=TYPES.filter(type=>!excluded.has(type));
   const candidates=available.length?available:TYPES;
   return candidates[pick(seed,candidates.length)];
 }
 function generate({seed=Date.now(),excludeTypes=[],excludeArchetypes=[]}={}){
   // A shuffle-bag of Energy types: a new random opponent never repeats a type
   // until all six have been encountered, then a new cycle begins.
   const excluded=new Set(excludeTypes.filter(type=>TYPES.includes(type)));
   const available=TYPES.filter(type=>!excluded.has(type));
   const candidates=available.length?available:TYPES;
   const first=pick(seed,candidates.length);
   for(let step=0;step<candidates.length;step++){
     const type=candidates[(first+step)%candidates.length];
     const result=builder.buildDeck(ALL_PLAYABLE,{style:'random',types:[type],randomSeed:(Number(seed)+step*2654435761)>>>0,excludeArchetypes});
     if(!result.ok)continue;
     const legal=classic.validateDeck(result.cards);
     const energy=decks.analyzeDeck(result.cards).recommendedEnergyTypes;
     if(!legal.ok||energy.some(t=>t!==type)||!result.cards.some(id=>classic.cardById(id)?.types?.includes(type)))continue;
     const archetype=String(result.strategy.match(/· ([^·]+) core/)?.[1]||'Classic TCG').trim();
     return {ok:true,type,cards:result.cards.slice(),energyTypes:[type],archetype,archetypeKey:result.archetypeKey,name:`${type} · ${archetype}`};
   }
   return {ok:false,error:'Could not build a legal random Classic TCG opponent deck.'};
 }
 return {generate,pickType,TYPES};
});
