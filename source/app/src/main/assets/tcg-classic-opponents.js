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
 const TYPES=builder.ARCHETYPE_TYPES.slice();
 const SETS=['base1','base2','base3','base5','gym1','gym2','neo1','neo2','neo3','neo4','base6','ecard1','ecard2','ecard3','ex1','ex2','ex3','ex4','ex5','ex6','ex7','ex8','ex9','SNAPFLORIO','SNAPFOUNJA','sv1'];
 function pick(seed,size){let x=(Number(seed)||0x9e3779b9)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%size;}
 function pickType({seed=Date.now(),excludeTypes=[],includeColorless=false}={}){
   const availableTypes=includeColorless?TYPES:decks.ENERGY_TYPES.slice();
   const excluded=new Set(excludeTypes.filter(type=>availableTypes.includes(type)));
   const available=availableTypes.filter(type=>!excluded.has(type));
   const candidates=available.length?available:availableTypes;
   return candidates[pick(seed,candidates.length)];
 }
 function generate({seed=Date.now(),excludeTypes=[],excludeArchetypes=[],sets=SETS,type=null,includeColorless=false,rarityFocus='any',basicOnly=false,theme='any'}={}){
   // A shuffle-bag of Energy types: a new random opponent never repeats a type
   // until all available types have been encountered, then a new cycle begins.
   const availableTypes=includeColorless||type==='Colorless'?TYPES:decks.ENERGY_TYPES.slice();
   const excluded=new Set(excludeTypes.filter(t=>availableTypes.includes(t)));
   const available=availableTypes.filter(t=>!excluded.has(t));
   const candidates=type&&TYPES.includes(type)?[type]:(available.length?available:availableTypes);
   const first=pick(seed,candidates.length);
   const allowed=[...new Set((sets||SETS).filter(id=>SETS.includes(id)))];
   if(!allowed.length)return {ok:false,error:'Select at least one set for the CPU card pool.'};
   for(let step=0;step<candidates.length;step++){
     const type=candidates[(first+step)%candidates.length];
     const result=builder.buildDeck(ALL_PLAYABLE,{style:'random',types:[type],sets:allowed,rarityFocus,basicOnly,theme,randomSeed:(Number(seed)+step*2654435761)>>>0,excludeArchetypes});
     if(!result.ok)continue;
     const legal=classic.validateDeck(result.cards);
     const energy=decks.analyzeDeck(result.cards).recommendedEnergyTypes;
     if(!legal.ok||(!['Colorless','Darkness','Metal'].includes(type)&&decks.analyzeDeck(result.cards,[type]).missingEnergyTypes.length)||!result.cards.some(id=>classic.cardById(id)?.types?.includes(type)))continue;
     if(result.cards.some(id=>{const card=classic.cardById(id);return !allowed.includes(card?.setId)&&!((allowed.includes('neo2')||allowed.includes('neo3')||allowed.includes('neo4'))&&['neo1-104','neo1-19'].includes(id));}))continue;
     const archetype=String(result.strategy.match(/· ([^·]+) core/)?.[1]||'Classic TCG').trim();
     return {ok:true,type,rarityFocus,basicOnly,theme,cards:result.cards.slice(),energyTypes:['Colorless','Darkness','Metal'].includes(type)?result.energyTypes.slice():[type],sets:allowed.slice(),archetype,archetypeKey:result.archetypeKey,name:`${type} · ${archetype}`};
   }
   return {ok:false,error:'No legal Classic CPU deck matches those rarity, evolution and set settings. Try another rarity or more sets.'};
 }
 return {generate,pickType,TYPES,SETS};
});
