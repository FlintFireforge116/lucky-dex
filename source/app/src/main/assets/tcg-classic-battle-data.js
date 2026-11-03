(function(root,factory){
  const base=typeof module==='object'&&module.exports?require('./tcg-classic-base1.js'):root.LuckyDexClassicTCGBase1;
  const api=factory(base);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.LuckyDexClassicTCGBattleData=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(base){
'use strict';
if(!base||!Array.isArray(base.CARDS))throw new Error('Classic Base Set catalogue is missing.');

// Legacy v0.69.63 seed details retained as provenance fixtures. v0.69.64's
// complete Base Set mechanics live in tcg-classic-base1.js; registering these
// seed rows is idempotent and preserves the original audited starter records.
const VERIFIED_DETAILS=[
 {id:'base1-7',name:'Hitmonchan',supertype:'Pokémon',subtypes:['Basic'],hp:'70',types:['Fighting'],attacks:[{name:'Jab',cost:['Fighting'],damage:'20',text:''},{name:'Special Punch',cost:['Fighting','Fighting','Colorless'],damage:'40',text:''}],weaknesses:[{type:'Psychic',value:'×2'}],retreatCost:['Colorless','Colorless']},
 {id:'base1-26',name:'Dratini',supertype:'Pokémon',subtypes:['Basic'],hp:'40',types:['Colorless'],attacks:[{name:'Pound',cost:['Colorless'],damage:'10',text:''}],resistances:[{type:'Psychic',value:'-30'}],retreatCost:['Colorless']},
 {id:'base1-28',name:'Growlithe',supertype:'Pokémon',subtypes:['Basic'],hp:'60',types:['Fire'],attacks:[{name:'Flare',cost:['Fire','Colorless'],damage:'20',text:''}],weaknesses:[{type:'Water',value:'×2'}],retreatCost:['Colorless']},
 {id:'base1-52',name:'Machop',supertype:'Pokémon',subtypes:['Basic'],hp:'50',types:['Fighting'],attacks:[{name:'Low Kick',cost:['Fighting'],damage:'20',text:''}],weaknesses:[{type:'Psychic',value:'×2'}],retreatCost:['Colorless']},
 {id:'base1-60',name:'Ponyta',supertype:'Pokémon',subtypes:['Basic'],hp:'40',types:['Fire'],attacks:[{name:'Smash Kick',cost:['Colorless','Colorless'],damage:'20',text:''},{name:'Flame Tail',cost:['Fire','Fire'],damage:'30',text:''}],weaknesses:[{type:'Water',value:'×2'}],retreatCost:['Colorless']},
 {id:'base1-61',name:'Rattata',supertype:'Pokémon',subtypes:['Basic'],hp:'30',types:['Colorless'],attacks:[{name:'Bite',cost:['Colorless'],damage:'20',text:''}],weaknesses:[{type:'Fighting',value:'×2'}],resistances:[{type:'Psychic',value:'-30'}],retreatCost:[]},
 {id:'base1-65',name:'Staryu',supertype:'Pokémon',subtypes:['Basic'],hp:'40',types:['Water'],attacks:[{name:'Slap',cost:['Water'],damage:'20',text:''}],weaknesses:[{type:'Lightning',value:'×2'}],retreatCost:['Colorless']},
 {id:'base1-67',name:'Voltorb',supertype:'Pokémon',subtypes:['Basic'],hp:'40',types:['Lightning'],attacks:[{name:'Tackle',cost:['Colorless'],damage:'10',text:''}],weaknesses:[{type:'Fighting',value:'×2'}],retreatCost:['Colorless']}
];
for(const detail of VERIFIED_DETAILS)base.registerDetails(detail);
for(const card of base.CARDS){card.battleFormat='classic';card.source='tcg';}

function cardById(id){return base.cardById(id);}
function typesOf(card){return Array.isArray(card?.types)&&card.types.length?card.types:[card?.subtype].filter(Boolean);}
function hasType(card,type){return typesOf(card).includes(type);}
function isBattleEnabled(value){const card=typeof value==='string'?cardById(value):cardById(value?.id);return !!(card&&card.battleEnabled&&card.deckEligible!==false);}
function validateDeck(ids,options){
 const deck=Array.isArray(ids)?ids:[],owned=options?.owned||null,errors=[];
 if(deck.length!==30)errors.push(`Classic TCG decks require exactly 30 cards (${deck.length}/30).`);
 const counts=new Map();
 for(const id of deck){const card=cardById(id);counts.set(id,Number(counts.get(id)||0)+1);if(!card)errors.push(`Unknown Base Set card: ${id}.`);else if(card.basicEnergy||card.deckEligible===false)errors.push(`${card.name} is supplied by the Energy Zone and cannot occupy a Classic30 deck slot.`);else if(!card.battleEnabled)errors.push(`${card.name} is not battle-ready: ${(card.support?.reasons||['unsupported mechanics']).join('; ')}`);}
 for(const [id,count] of counts)if(count>4)errors.push(`${cardById(id)?.name||id} exceeds the four-copy limit (${count}).`);
 if(!deck.some(id=>{const c=cardById(id);return c?.kind==='pokemon'&&c.stage==='Basic'&&c.battleEnabled;}))errors.push('Classic TCG decks require at least one battle-ready Basic Pokémon.');
 if(owned){const projected=new Map(base.projectOwnedCards(owned).map(row=>[row.gameplayId,row.quantity]));for(const [id,count] of counts)if(count>Number(projected.get(id)||0))errors.push(`Not enough owned copies of ${cardById(id)?.name||id}: need ${count}, own ${Number(projected.get(id)||0)}.`);}
 return {ok:errors.length===0,errors};
}
function coverage(){return {...base.coverage(),verifiedBattleSlice:base.CARDS.filter(c=>c.support?.status==='FULL').map(c=>c.id),set:base.SET};}
return {SET:base.SET,CARDS:base.CARDS,ENERGY_CODE:base.ENERGY_CODE,CLASSIC30_LOANER_DECK:base.CLASSIC30_LOANER_DECK,VERIFIED_DETAILS,cardById,typesOf,hasType,isBattleEnabled,projectOwnedCards:base.projectOwnedCards,validateDeck,coverage};
});
