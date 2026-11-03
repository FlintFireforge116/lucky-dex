(function(root,factory){
  const base=typeof module==='object'&&module.exports?require('./tcg-classic-base1.js'):root.LuckyDexClassicTCGBase1;
  const jungle=typeof module==='object'&&module.exports?require('./tcg-classic-jungle.js'):root.LuckyDexClassicTCGJungle;
  const fossil=typeof module==='object'&&module.exports?require('./tcg-classic-fossil.js'):root.LuckyDexClassicTCGFossil;
  const rocket=typeof module==='object'&&module.exports?require('./tcg-classic-team-rocket.js'):root.LuckyDexClassicTCGTeamRocket;
  const gym=typeof module==='object'&&module.exports?require('./tcg-classic-gym-heroes.js'):root.LuckyDexClassicTCGGymHeroes;
  const api=factory(base,jungle,fossil,rocket,gym);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.LuckyDexClassicTCGBattleData=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(base,jungle,fossil,rocket,gym){
'use strict';
if(!base||!Array.isArray(base.CARDS)||!jungle||!Array.isArray(jungle.CARDS)||!fossil||!Array.isArray(fossil.CARDS)||!rocket||!Array.isArray(rocket.CARDS)||!gym||!Array.isArray(gym.CARDS))throw new Error('Classic TCG set catalogues are missing.');
const CARDS=[...base.CARDS,...jungle.CARDS,...fossil.CARDS,...rocket.CARDS,...gym.CARDS];

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

function cardById(id){return base.cardById(id)||jungle.cardById(id)||fossil.cardById(id)||rocket.cardById(id)||gym.cardById(id);}
function typesOf(card){return Array.isArray(card?.types)&&card.types.length?card.types:[card?.subtype].filter(Boolean);}
function hasType(card,type){return typesOf(card).includes(type);}
function isBattleEnabled(value){const card=typeof value==='string'?cardById(value):cardById(value?.id);return !!(card&&card.battleEnabled&&card.deckEligible!==false);}
function ownedJungleCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const src=String(owned.source||'').toLowerCase();if(src&&src!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase();
 const libraryKey=String(owned._librarySetKey||'').toLowerCase();
 const setName=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 const total=Number(owned.setTotal||owned.set?.cardCount?.total||0);
 if(!(['base2','library:ju','ju'].includes(setId)||libraryKey==='ju'||(setName==='jungle'&&total===64)))return null;
 const direct=jungle.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const m=String(value??'').trim().match(/^(?:base2|ju)?[-_:]?0*(\d{1,2})$/i);
  if(m){const n=Number(m[1]);if(n>=1&&n<=64)return jungle.cardById(`base2-${n}`);}
 }
 return null;
}
function ownedFossilCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const src=String(owned.source||'').toLowerCase();if(src&&src!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase();
 const key=String(owned._librarySetKey||'').toLowerCase();
 const name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 const total=Number(owned.setTotal||owned.set?.cardCount?.total||0);
 if(!(['base3','library:fo','fo'].includes(setId)||key==='fo'||name==='fossil'&&total===62))return null;
 const direct=fossil.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
   const match=String(value??'').trim().match(/^(?:base3|fo)?[-_:]?0*(\d{1,2})$/i);
   if(match){const num=Number(match[1]);if(num>=1&&num<=62)return fossil.cardById(`base3-${num}`);}
 }
 return null;
}

function ownedRocketCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const src=String(owned.source||'').toLowerCase();if(src&&src!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase();
 const name=String(owned.setName||owned.set?.name||'').trim().toLowerCase(),total=Number(owned.setTotal||owned.set?.cardCount?.total||0);
 if(!(['base5','library:tr','library:ro','tr','ro'].includes(setId)||['tr','ro'].includes(key)||name==='team rocket'&&total===83))return null;
 const direct=rocket.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
   const match=String(value??'').trim().match(/^(?:base5|tr|ro)?[-_:]?0*(\d{1,2})$/i);
   if(match){const num=Number(match[1]);if(num>=1&&num<=83)return rocket.cardById(`base5-${num}`);}
 }
 return null;
}
function ownedGymHeroesCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const src=String(owned.source||'').toLowerCase();if(src&&src!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase();
 const name=String(owned.setName||owned.set?.name||'').trim().toLowerCase(),total=Number(owned.setTotal||owned.set?.cardCount?.total||0);
 if(!(['gym1','library:gh','gh','library:g1','g1'].includes(setId)||['gh','g1'].includes(key)||name==='gym heroes'&&total===132))return null;
 const direct=gym.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(value??'').trim().match(/^(?:gym1|gh|g1)?[-_:]?0*(\d{1,3})$/i);
  if(match){const num=Number(match[1]);if(num>=1&&num<=132)return gym.cardById(`gym1-${num}`);}
 }
 return null;
}
function projectOwnedCards(cards){
 const rows=Array.isArray(cards)?cards:Object.values(cards||{});
 const projected=base.projectOwnedCards(rows);
 const grouped=new Map();
 for(const owned of rows){const card=ownedJungleCard(owned)||ownedFossilCard(owned)||ownedRocketCard(owned)||ownedGymHeroesCard(owned);if(!card)continue;
  const quantity=Math.max(0,Number(owned.count==null?1:owned.count)||0);
  const variant={id:owned.id||card.id,quantity,image:owned.image||owned.imageUrl||null,rarity:owned.rarity||null,row:owned};
  const current=grouped.get(card.id);
  if(current){current.quantity+=quantity;current.variants.push(variant);}
  else grouped.set(card.id,{gameplayId:card.id,name:card.name,card,quantity,battleEnabled:!!card.battleEnabled,variants:[variant]});
 }
 return [...projected,...grouped.values()].sort((a,b)=>String(a.card.setId).localeCompare(String(b.card.setId))||Number(a.card.number)-Number(b.card.number));
}
function validateDeck(ids,options){
 const deck=Array.isArray(ids)?ids:[],owned=options?.owned||null,errors=[];
 if(deck.length!==30)errors.push(`Classic TCG decks require exactly 30 cards (${deck.length}/30).`);
 const byId=new Map(),byName=new Map();
 for(const id of deck){
  const card=cardById(id);if(!card){errors.push(`Unknown Classic TCG card: ${id}.`);continue;}
  byId.set(card.id,(byId.get(card.id)||0)+1);
  byName.set(card.name,(byName.get(card.name)||0)+1);
  if(card.basicEnergy||card.deckEligible===false)errors.push(`${card.name} cannot occupy a Classic30 deck slot.`);
  else if(!card.battleEnabled)errors.push(`${card.name} is not battle-ready: ${(card.support?.reasons||['unsupported mechanics']).join('; ')}`);
 }
 for(const [name,count] of byName)if(count>4)errors.push(`${name} exceeds the four-copy limit across all prints (${count}).`);
 if(!deck.some(id=>{const c=cardById(id);return c?.kind==='pokemon'&&c.stage==='Basic'&&c.battleEnabled;}))errors.push('Classic TCG decks require at least one battle-ready Basic Pokémon.');
 if(owned){const map=new Map(projectOwnedCards(owned).map(row=>[row.gameplayId,row.quantity]));for(const [id,count] of byId)if(count>Number(map.get(id)||0))errors.push(`Not enough owned copies of ${cardById(id)?.name||id}: need ${count}, own ${Number(map.get(id)||0)}.`);}
 return {ok:errors.length===0,errors};
}
function coverage(){return {...base.coverage(),jungle:jungle.coverage(),fossil:fossil.coverage(),teamRocket:rocket.coverage(),gymHeroes:gym.coverage(),verifiedBattleSlice:CARDS.filter(c=>c.support?.status==='FULL').map(c=>c.id),set:base.SET,sets:[base.SET,jungle.SET,fossil.SET,rocket.SET,gym.SET]};}
return {SET:base.SET,SETS:[base.SET,jungle.SET,fossil.SET,rocket.SET,gym.SET],CARDS,ENERGY_CODE:base.ENERGY_CODE,CLASSIC30_LOANER_DECK:base.CLASSIC30_LOANER_DECK,VERIFIED_DETAILS,cardById,typesOf,hasType,isBattleEnabled,projectOwnedCards,validateDeck,coverage};
});
