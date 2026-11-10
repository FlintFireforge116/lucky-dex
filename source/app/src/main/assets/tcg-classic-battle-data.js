(function(root,factory){
  const base=typeof module==='object'&&module.exports?require('./tcg-classic-base1.js'):root.LuckyDexClassicTCGBase1;
  const jungle=typeof module==='object'&&module.exports?require('./tcg-classic-jungle.js'):root.LuckyDexClassicTCGJungle;
  const fossil=typeof module==='object'&&module.exports?require('./tcg-classic-fossil.js'):root.LuckyDexClassicTCGFossil;
  const rocket=typeof module==='object'&&module.exports?require('./tcg-classic-team-rocket.js'):root.LuckyDexClassicTCGTeamRocket;
  const gym=typeof module==='object'&&module.exports?require('./tcg-classic-gym-heroes.js'):root.LuckyDexClassicTCGGymHeroes;
  const challenge=typeof module==='object'&&module.exports?require('./tcg-classic-gym-challenge.js'):root.LuckyDexClassicTCGGymChallenge;
  const neo=typeof module==='object'&&module.exports?require('./tcg-classic-neo-genesis.js'):root.LuckyDexClassicTCGNeoGenesis;
  const discovery=typeof module==='object'&&module.exports?require('./tcg-classic-neo-discovery.js'):root.LuckyDexClassicTCGNeoDiscovery;
  const revelation=typeof module==='object'&&module.exports?require('./tcg-classic-neo-revelation.js'):root.LuckyDexClassicTCGNeoRevelation;
  const destiny=typeof module==='object'&&module.exports?require('./tcg-classic-neo-destiny.js'):root.LuckyDexClassicTCGNeoDestiny;
  const legendary=typeof module==='object'&&module.exports?require('./tcg-classic-legendary-collection.js'):root.LuckyDexClassicTCGLegendaryCollection;
  const expedition=typeof module==='object'&&module.exports?require('./tcg-classic-expedition.js'):root.LuckyDexClassicTCGExpedition;
  const aquapolis=typeof module==='object'&&module.exports?require('./tcg-classic-aquapolis.js'):root.LuckyDexClassicTCGAquapolis;
  const skyridge=typeof module==='object'&&module.exports?require('./tcg-classic-skyridge.js'):root.LuckyDexClassicTCGSkyridge;
  const ruby=typeof module==='object'&&module.exports?require('./tcg-classic-ruby-sapphire.js'):root.LuckyDexClassicTCGRubySapphire;
  const sandstorm=typeof module==='object'&&module.exports?require('./tcg-classic-sandstorm.js'):root.LuckyDexClassicTCGSandstorm;
  const dragon=typeof module==='object'&&module.exports?require('./tcg-classic-dragon.js'):root.LuckyDexClassicTCGDragon;
  const magmaAqua=typeof module==='object'&&module.exports?require('./tcg-classic-team-magma-aqua.js'):root.LuckyDexClassicTCGTeamMagmaAqua;
  const teamRocketReturns=typeof module==='object'&&module.exports?require('./tcg-classic-team-rocket-returns.js'):root.LuckyDexClassicTCGTeamRocketReturns;
  const deoxys=typeof module==='object'&&module.exports?require('./tcg-classic-deoxys.js'):root.LuckyDexClassicTCGDeoxys;
  const emerald=typeof module==='object'&&module.exports?require('./tcg-classic-emerald.js'):root.LuckyDexClassicTCGEmerald;
  const unseen=typeof module==='object'&&module.exports?require('./tcg-classic-unseen-forces.js'):root.LuckyDexClassicTCGUnseenForces;
  const fireRedLeafGreen=typeof module==='object'&&module.exports?require('./tcg-classic-firered-leafgreen.js'):root.LuckyDexClassicTCGFireRedLeafGreen;
  const hiddenLegends=typeof module==='object'&&module.exports?require('./tcg-classic-hidden-legends.js'):root.LuckyDexClassicTCGHiddenLegends;
  const lental=typeof module==='object'&&module.exports?require('./tcg-classic-lental.js'):root.LuckyDexClassicTCGLental;
  const sv1=typeof module==='object'&&module.exports?require('./tcg-classic-scarlet-violet.js'):root.LuckyDexClassicTCGScarletViolet;
  const api=factory(base,jungle,fossil,rocket,gym,challenge,neo,discovery,revelation,destiny,legendary,expedition,aquapolis,skyridge,ruby,sandstorm,dragon,magmaAqua,hiddenLegends,fireRedLeafGreen,teamRocketReturns,deoxys,emerald,unseen,lental,sv1);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.LuckyDexClassicTCGBattleData=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(base,jungle,fossil,rocket,gym,challenge,neo,discovery,revelation,destiny,legendary,expedition,aquapolis,skyridge,ruby,sandstorm,dragon,magmaAqua,hiddenLegends,fireRedLeafGreen,teamRocketReturns,deoxys,emerald,unseen,lental,sv1){
'use strict';
if(!base||!Array.isArray(base.CARDS)||!jungle||!Array.isArray(jungle.CARDS)||!fossil||!Array.isArray(fossil.CARDS)||!rocket||!Array.isArray(rocket.CARDS)||!gym||!Array.isArray(gym.CARDS)||!challenge||!Array.isArray(challenge.CARDS)||!neo||!Array.isArray(neo.CARDS)||!discovery||!Array.isArray(discovery.CARDS)||!revelation||!Array.isArray(revelation.CARDS)||!destiny||!Array.isArray(destiny.CARDS))throw new Error('Classic TCG set catalogues are missing.');
const CARDS=[...base.CARDS,...jungle.CARDS,...fossil.CARDS,...rocket.CARDS,...gym.CARDS,...challenge.CARDS,...neo.CARDS,...discovery.CARDS,...revelation.CARDS,...destiny.CARDS,...legendary.CARDS,...expedition.CARDS,...aquapolis.CARDS,...skyridge.CARDS,...ruby.CARDS,...sandstorm.CARDS,...dragon.CARDS,...magmaAqua.CARDS,...hiddenLegends.CARDS,...fireRedLeafGreen.CARDS,...teamRocketReturns.CARDS,...deoxys.CARDS,...emerald.CARDS,...unseen.CARDS,...lental.CARDS,...sv1.CARDS];

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

const LAB_SUBSTITUTE=Object.freeze({id:'LAB-SUBSTITUTE',name:'Substitute',setId:'LAB',kind:'pokemon',stage:'Basic',
  types:['Colorless'],subtype:'Colorless',hp:1000,retreat:0,weakness:null,attacks:[],abilities:[],
  battleEnabled:true,deckEligible:false,noPrize:true,points:0,labDummy:true});
function cardById(id){if(id==='LAB-SUBSTITUTE')return LAB_SUBSTITUTE;return base.cardById(id)||jungle.cardById(id)||fossil.cardById(id)||rocket.cardById(id)||gym.cardById(id)||challenge.cardById(id)||neo.cardById(id)||discovery.cardById(id)||revelation.cardById(id)||destiny.cardById(id)||legendary.cardById(id)||expedition.cardById(id)||aquapolis.cardById(id)||skyridge.cardById(id)||ruby.cardById(id)||sandstorm.cardById(id)||dragon.cardById(id)||magmaAqua.cardById(id)||hiddenLegends.cardById(id)||fireRedLeafGreen.cardById(id)||teamRocketReturns.cardById(id)||deoxys.cardById(id)||emerald.cardById(id)||unseen.cardById(id)||lental.cardById(id)||sv1.cardById(id);}
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
 const name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 const isGym=['gym1','library:gh','gh','library:g1','g1','library:gym1','library:gym','gym'].includes(setId)||['gh','g1','gym1','gym'].includes(key)||name==='gym heroes';
 if(!isGym)return null;
 const direct=gym.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const raw=String(value??'').trim();
  const match=raw.match(/^(?:0*(\d{1,3})(?:\s*\/\s*132)?|(?:library[:_-])?(?:gym1|gym|gh|g1)[-_:]0*(\d{1,3})(?:\s*\/\s*132)?)$/i);
  if(match){const num=Number(match[1]||match[2]);if(num>=1&&num<=132)return gym.cardById(`gym1-${num}`);}
 }
 return null;
}
function ownedGymChallengeCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const src=String(owned.source||'').toLowerCase();if(src&&src!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 const isChallenge=['gym2','library:g2','g2','library:gc','gc','library:gym2'].includes(setId)||['g2','gc','gym2'].includes(key)||name==='gym challenge';
 if(!isChallenge)return null;
 const direct=challenge.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const raw=String(value??'').trim();const match=raw.match(/^(?:0*(\d{1,3})(?:\s*\/\s*132)?|(?:library[:_-])?(?:gym2|gc|g2)[-_:]0*(\d{1,3})(?:\s*\/\s*132)?)$/i);
  if(match){const n=Number(match[1]||match[2]);if(n>=1&&n<=132)return challenge.cardById(`gym2-${n}`);}
 }
 return null;
}
function ownedNeoGenesisCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const src=String(owned.source||'').toLowerCase();if(src&&src!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase();
 const setName=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 const isNeo=['neo1','n1','library:n1','library:neo1'].includes(setId)||['n1','neo1'].includes(key)||setName==='neo genesis';
 if(!isNeo)return null;
 const direct=neo.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const raw=String(value??'').trim();const match=raw.match(/^(?:0*(\d{1,3})(?:\s*\/\s*111)?|(?:library[:_-])?(?:neo1|n1)[-_:]0*(\d{1,3})(?:\s*\/\s*111)?)$/i);
  if(match){const n=Number(match[1]||match[2]);if(n>=1&&n<=111)return neo.cardById(`neo1-${n}`);}
 }
 return null;
}
function ownedNeoDiscoveryCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const src=String(owned.source||'').toLowerCase();if(src&&src!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 if(!(['neo2','n2','library:n2','library:neo2'].includes(setId)||['neo2','n2'].includes(key)||name==='neo discovery'))return null;
 const direct=discovery.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(value??'').trim().match(/^(?:0*(\d{1,2})(?:\s*\/\s*75)?|(?:library[:_-])?(?:neo2|n2)[-_:]0*(\d{1,2})(?:\s*\/\s*75)?)$/i);
  if(match){const n=Number(match[1]||match[2]);if(n>=1&&n<=75)return discovery.cardById('neo2-'+n);}
 }
 return null;
}
function ownedNeoRevelationCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const src=String(owned.source||'').toLowerCase();if(src&&src!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 if(!(['neo3','n3','library:n3','library:neo3'].includes(setId)||['neo3','n3'].includes(key)||name==='neo revelation'))return null;
 const direct=revelation.cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(value??'').trim().match(/^(?:0*(\d{1,2})(?:\s*\/\s*66)?|(?:library[:_-])?(?:neo3|n3)[-_:]0*(\d{1,2})(?:\s*\/\s*66)?)$/i);
  if(match){const n=Number(match[1]||match[2]);if(n>=1&&n<=66)return revelation.cardById('neo3-'+n);}
 }
 return null;
}
function ownedNeoDestinyCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const id of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const direct=destiny.cardById(id);if(direct)return direct;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 if(!(['neo4','n4','library:neo4','library:n4'].includes(set)||['n4','neo4'].includes(key)||name==='neo destiny'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const m=String(raw??'').trim().match(/^(?:0*(\d{1,3})(?:\s*\/\s*105)?|(?:library[:_-])?(?:neo4|n4)[-_:]0*(\d{1,3})(?:\s*\/\s*105)?)$/i);
  if(m){const n=Number(m[1]||m[2]);if(n>=1&&n<=113)return destiny.cardById('neo4-'+n);}
 }
 return null;
}
function ownedLegendaryCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 const key=String(owned._librarySetKey||'').toLowerCase(),set=String(owned.setId||owned.set?.id||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['base6','library:base6','lc','library:lc'].includes(set)||['base6','lc'].includes(key)||name==='legendary collection'))return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned.localId,owned.number,owned._libraryCanonicalId]){
  const m=String(raw??'').trim().match(/^(?:0*(\d{1,3})(?:\s*\/\s*110)?|(?:library[:_-])?(?:base6|lc)[-_:]0*(\d{1,3})(?:\s*\/\s*110)?)$/i);
  if(m){const n=Number(m[1]||m[2]);if(n>=1&&n<=110)return legendary.cardById('base6-'+n);}
 }
 return null;
}
function ownedExpeditionCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 if(!(['ecard1','library:ecard1','ex','library:ex'].includes(set)||['ecard1','ex'].includes(key)||name==='expedition base set'))return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned.localId,owned.number,owned._libraryCanonicalId]){
  const m=String(raw??'').trim().match(/^(?:0*(\d{1,3})(?:\s*\/\s*165)?|(?:library[:_-])?(?:ecard1|ex)[-_:]0*(\d{1,3})(?:\s*\/\s*165)?)$/i);
  if(m){const n=Number(m[1]||m[2]);if(n>=1&&n<=165)return expedition.cardById('ecard1-'+n);}
 }
 return null;
}
function ownedAquapolisCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 if(!(['ecard2','library:ecard2','aq','library:aq'].includes(set)||['ecard2','aq'].includes(key)||name==='aquapolis'))return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned.localId,owned.number,owned._libraryCanonicalId]){
  const m=String(raw??'').trim().match(/^(?:(H\d{1,2}|0*\d{1,3})(?:\s*\/\s*(?:147|150|182))?|(?:library[:_-])?(?:ecard2|aq)[-_:](H\d{1,2}|0*\d{1,3})(?:\s*\/\s*(?:147|150|182))?)$/i);
  if(!m)continue;
  const n=String(m[1]||m[2]).toUpperCase(),id=n.startsWith('H')?'H'+Number(n.slice(1)):String(Number(n));
  const card=aquapolis.cardById('ecard2-'+id);if(card)return card;
 }
 return null;
}
function ownedSkyridgeCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 if(!(['ecard3','library:ecard3','sk','library:sk'].includes(set)||['ecard3','sk'].includes(key)||name==='skyridge'))return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned.localId,owned.number,owned._libraryCanonicalId]){
  const match=String(raw??'').trim().match(/^(?:(H\d{1,2}|0*\d{1,3})(?:\s*\/\s*(?:144|150|182))?|(?:library[:_-])?(?:ecard3|sk)[-_:](H\d{1,2}|0*\d{1,3})(?:\s*\/\s*(?:144|150|182))?)$/i);
  if(!match)continue;
  const n=String(match[1]||match[2]).toUpperCase(),id=n.startsWith('H')?'H'+Number(n.slice(1)):String(Number(n));
  const card=skyridge.cardById('ecard3-'+id);if(card)return card;
 }
 return null;
}
function ownedRubySapphireCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').trim().toLowerCase();
 if(!(['ex1','library:ex1','rs','library:rs'].includes(set)||['ex1','rs'].includes(key)||name==='ex ruby & sapphire'||name==='ruby & sapphire'))return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned.localId,owned.number,owned._libraryCanonicalId]){
  const match=String(raw??'').trim().match(/^(?:0*(\d{1,3})(?:\s*\/\s*109)?|(?:library[:_-])?(?:ex1|rs)[-_:]0*(\d{1,3})(?:\s*\/\s*109)?)$/i);
  if(!match)continue;
  const n=Number(match[1]||match[2]);if(n>=1&&n<=109)return ruby.cardById('ex1-'+n);
 }
 return null;
}
function ownedSandstormCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){
   const direct=sandstorm.cardById(raw);if(direct)return direct;
 }
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex2','library:ex2','ss','library:ss'].includes(set)||['ex2','ss'].includes(key)||name==='ex sandstorm'||name==='sandstorm'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/^(?:(?:ex2|ss)[-_:])?0*(\d{1,3})(?:\s*\/\s*100)?$/i);
  if(match){const n=Number(match[1]);if(n>=1&&n<=100)return sandstorm.cardById('ex2-'+n);}
 }
 return null;
}
function ownedDragonCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const direct=dragon.cardById(raw);if(direct)return direct;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex3','library:ex3','dr','library:dr'].includes(set)||['ex3','dr'].includes(key)||name==='ex dragon'||name==='dragon'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/^(?:(?:ex3|dr)[-_:])?0*(\d{1,3})(?:\s*\/\s*(?:97|100))?$/i);
  if(match){const n=Number(match[1]);if(n>=1&&n<=100)return dragon.cardById('ex3-'+n);}
 }
 return null;
}
function ownedMagmaAquaCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const direct=magmaAqua.cardById(raw);if(direct)return direct;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex4','library:ex4','ma','library:ma'].includes(set)||['ex4','ma'].includes(key)||name==='ex team magma vs team aqua'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/^(?:(?:ex4|ma)[-_:])?0*(\d{1,3})(?:\s*\/\s*97)?$/i);
  if(match){const n=Number(match[1]);if(n>=1&&n<=97)return magmaAqua.cardById('ex4-'+n);}
 }
 return null;
}
function ownedHiddenLegendsCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const direct=hiddenLegends.cardById(raw);if(direct)return direct;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex5','library:ex5','hl','library:hl'].includes(set)||['ex5','hl'].includes(key)||name==='ex hidden legends'||name==='hidden legends'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/^(?:(?:ex5|hl)[-_:])?0*(\d{1,3})(?:\s*\/\s*101)?$/i);
  if(match){const n=Number(match[1]);if(n>=1&&n<=102)return hiddenLegends.cardById('ex5-'+n);}
 }
 return null;
}
function ownedFireRedLeafGreenCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const direct=fireRedLeafGreen.cardById(raw);if(direct)return direct;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex6','library:ex6','rg','library:rg'].includes(set)||['ex6','rg'].includes(key)||name==='ex firered & leafgreen'||name==='firered & leafgreen'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/^(?:(?:ex6|rg)[-_:])?0*(\d{1,3})(?:\s*\/\s*112)?$/i);
  if(match){const n=Number(match[1]);if(n>=1&&n<=116)return fireRedLeafGreen.cardById('ex6-'+n);}
 }
 return null;
}
function ownedTeamRocketReturnsCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const direct=teamRocketReturns.cardById(raw);if(direct)return direct;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex7','library:ex7','rr','library:rr'].includes(set)||['ex7','rr'].includes(key)||name==='ex team rocket returns'||name==='team rocket returns'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/^(?:(?:ex7|rr)[-_:])?0*(\d{1,3})(?:\s*\/\s*109)?$/i);
  if(match){const n=Number(match[1]);if(n>=1&&n<=111)return teamRocketReturns.cardById('ex7-'+n);}
 }
 return null;
}
function ownedDeoxysCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const found=deoxys.cardById(raw);if(found)return found;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex8','library:ex8','dx','library:dx'].includes(set)||['ex8','dx'].includes(key)||name==='ex deoxys'||name==='deoxys'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/^(?:(?:ex8|dx)[-_:])?0*(\d{1,3})(?:\s*\/\s*107)?$/i);
  if(match){const n=Number(match[1]);if(n>=1&&n<=108)return deoxys.cardById('ex8-'+n);}
 }
 return null;
}
function ownedEmeraldCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const found=emerald.cardById(raw);if(found)return found;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex9','library:ex9','em','library:em'].includes(set)||['ex9','em'].includes(key)||['ex emerald','emerald'].includes(name)))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/^(?:(?:ex9|em)[-_:])?0*(\d{1,3})(?:\s*\/\s*(?:106|107))?$/i);
  if(match){const n=Number(match[1]);if(n>=1&&n<=107)return emerald.cardById('ex9-'+n);}
 }
 return null;
}
function ownedUnseenCard(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const raw of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){const found=unseen.cardById(raw);if(found)return found;}
 const set=String(owned.setId||owned.set?.id||'').toLowerCase(),key=String(owned._librarySetKey||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['ex10','library:ex10','uf','library:uf'].includes(set)||['ex10','uf'].includes(key)||name.includes('unseen forces')))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
   const n=String(raw??'').trim().replace(/^(ex10|uf)[-_:]/i,'').replace(/\s*\/\s*145$/,'');
   const number=/^\d{1,3}$/.test(n)?String(Number(n)):n;
   if((Number(number)>=1&&Number(number)<=117)||/^[A-Z!?]$/.test(number)){const found=unseen.cardById('ex10-'+number);if(found)return found;}
 }
 return null;
}
function ownedLentalCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const source=String(owned.source||'tcg').toLowerCase();if(source!=='tcg')return null;
 for(const id of [owned.id,owned._libraryCanonicalId,owned.gameplayId,owned.cardId]){
   const direct=lental.cardById(id);if(direct)return direct;
 }
 const key=String(owned._librarySetKey||'').toUpperCase(),set=String(owned.setId||owned.set?.id||'').toUpperCase();
 const name=String(owned.setName||owned.set?.name||'').toLowerCase();
 const florio=key==='SNAPFLORIO'||['SNAPFLORIO','LIBRARY:SNAPFLORIO'].includes(set)||name.includes('florio nature park');
 const founja=key==='SNAPFOUNJA'||['SNAPFOUNJA','LIBRARY:SNAPFOUNJA'].includes(set)||name.includes('founja jungle');
 if(!florio&&!founja)return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const match=String(raw??'').trim().match(/(?:^|[-_:])0*(\d{1,3})(?:\/\d+)?$/);
  if(match){const number=Number(match[1]);if(number>=1&&number<=(florio?123:86))return lental.cardById(`${florio?'SNAPFLORIO':'SNAPFOUNJA'}-${String(number).padStart(3,'0')}`);}
 }
 return null;
}
function ownedSV1Card(owned){
 if(!owned||typeof owned!=='object'||String(owned.source||'tcg').toLowerCase()!=='tcg')return null;
 for(const direct of [owned.id,owned.gameplayId,owned.cardId,owned._libraryCanonicalId]){
   const found=sv1.cardById(direct);if(found)return found;
 }
 const key=String(owned._librarySetKey||'').toLowerCase(),set=String(owned.setId||owned.set?.id||'').toLowerCase(),name=String(owned.setName||owned.set?.name||'').toLowerCase();
 if(!(['sv1','library:sv1'].includes(set)||key==='sv1'||name==='scarlet & violet'))return null;
 for(const raw of [owned.localId,owned.number,owned._libraryCanonicalId]){
   const match=String(raw||'').match(/^(?:sv1[-_:])?0*(\d{1,3})(?:\s*\/\s*198)?$/i);
   if(match){const n=Number(match[1]);if(n>=1&&n<=258)return sv1.cardById('sv1-'+n);}
 }
 return null;
}
function projectOwnedCards(cards){
 const rows=Array.isArray(cards)?cards:Object.values(cards||{});
 const projected=base.projectOwnedCards(rows);
 const grouped=new Map();
 for(const owned of rows){const card=ownedJungleCard(owned)||ownedFossilCard(owned)||ownedRocketCard(owned)||ownedGymHeroesCard(owned)||ownedGymChallengeCard(owned)||ownedNeoGenesisCard(owned)||ownedNeoDiscoveryCard(owned)||ownedNeoRevelationCard(owned)||ownedNeoDestinyCard(owned)||ownedLegendaryCard(owned)||ownedExpeditionCard(owned)||ownedAquapolisCard(owned)||ownedSkyridgeCard(owned)||ownedRubySapphireCard(owned)||ownedSandstormCard(owned)||ownedDragonCard(owned)||ownedMagmaAquaCard(owned)||ownedHiddenLegendsCard(owned)||ownedFireRedLeafGreenCard(owned)||ownedTeamRocketReturnsCard(owned)||ownedDeoxysCard(owned)||ownedEmeraldCard(owned)||ownedUnseenCard(owned)||ownedLentalCard(owned)||ownedSV1Card(owned);if(!card)continue;
  const quantity=Math.max(0,Number(owned.count==null?1:owned.count)||0);
  const variant={id:owned.id||card.id,quantity,image:owned.image||owned.imageUrl||null,rarity:owned.rarity||null,row:owned};
  const current=grouped.get(card.id);
  if(current){current.quantity+=quantity;current.variants.push(variant);}
  else grouped.set(card.id,{gameplayId:card.id,name:card.name,card,quantity,battleEnabled:!!card.battleEnabled,variants:[variant]});
 }
 return [...projected,...grouped.values()].sort((a,b)=>String(a.card.setId).localeCompare(String(b.card.setId))||Number(a.card.number)-Number(b.card.number));
}
function classicCardName(name){return String(name||'').replace(/[’]/g,"'").replace(/\s+(?=[♀♂])/g,'').trim();}
function validateDeck(ids,options){
 const deck=Array.isArray(ids)?ids:[],owned=options?.owned||null,errors=[];
 if(deck.length!==30)errors.push(`Classic TCG decks require exactly 30 cards (${deck.length}/30).`);
 const byId=new Map(),byName=new Map();
 for(const id of deck){
  const card=cardById(id);if(!card){errors.push(`Unknown Classic TCG card: ${id}.`);continue;}
  byId.set(card.id,(byId.get(card.id)||0)+1);
  byName.set(classicCardName(card.name),(byName.get(classicCardName(card.name))||0)+1);
  if(card.basicEnergy||card.deckEligible===false)errors.push(`${card.name} cannot occupy a Classic30 deck slot.`);
  else if(!card.battleEnabled)errors.push(`${card.name} is not battle-ready: ${(card.support?.reasons||['unsupported mechanics']).join('; ')}`);
 }
 for(const [name,count] of byName){if(count>4)errors.push(`${name} exceeds the four-copy limit across all prints (${count}).`);if(name.startsWith('Shining ')&&count>1)errors.push(`${name} is limited to one card per deck.`);if(name==='Miracle Energy'&&count>1)errors.push('Miracle Energy is limited to one copy per deck.');}
 if(deck.filter(id=>cardById(id)?.pokemonStar).length>1)errors.push('Only one Pokémon ★ is permitted per Classic deck.');
 if(!deck.some(id=>{const c=cardById(id);return c?.kind==='pokemon'&&c.stage==='Basic'&&c.battleEnabled;}))errors.push('Classic TCG decks require at least one battle-ready Basic Pokémon.');
 if(owned){const map=new Map(projectOwnedCards(owned).map(row=>[row.gameplayId,row.quantity]));for(const [id,count] of byId)if(count>Number(map.get(id)||0))errors.push(`Not enough owned copies of ${cardById(id)?.name||id}: need ${count}, own ${Number(map.get(id)||0)}.`);}
 return {ok:errors.length===0,errors};
}
function coverage(){return {...base.coverage(),jungle:jungle.coverage(),fossil:fossil.coverage(),teamRocket:rocket.coverage(),gymHeroes:gym.coverage(),gymChallenge:challenge.coverage(),neoGenesis:neo.coverage(),neoDiscovery:discovery.coverage(),neoRevelation:revelation.coverage(),neoDestiny:destiny.coverage(),legendaryCollection:legendary.coverage(),expedition:expedition.coverage(),aquapolis:aquapolis.coverage(),skyridge:skyridge.coverage(),rubySapphire:ruby.coverage(),sandstorm:sandstorm.coverage(),dragon:dragon.coverage(),teamMagmaAqua:magmaAqua.coverage(),hiddenLegends:hiddenLegends.coverage(),fireRedLeafGreen:fireRedLeafGreen.coverage(),teamRocketReturns:teamRocketReturns.coverage(),deoxys:deoxys.coverage(),emerald:emerald.coverage(),unseenForces:unseen.coverage(),lental:lental.coverage(),scarletViolet:sv1.coverage(),verifiedBattleSlice:CARDS.filter(c=>c.support?.status==='FULL').map(c=>c.id),set:base.SET,sets:[base.SET,jungle.SET,fossil.SET,rocket.SET,gym.SET,challenge.SET,neo.SET,discovery.SET,revelation.SET,destiny.SET,legendary.SET,expedition.SET,aquapolis.SET,skyridge.SET,ruby.SET,sandstorm.SET,dragon.SET,magmaAqua.SET,hiddenLegends.SET,fireRedLeafGreen.SET,teamRocketReturns.SET,deoxys.SET,emerald.SET,unseen.SET,...lental.SETS,sv1.SET]};}
return {SET:base.SET,SETS:[base.SET,jungle.SET,fossil.SET,rocket.SET,gym.SET,challenge.SET,neo.SET,discovery.SET,revelation.SET,destiny.SET,legendary.SET,expedition.SET,aquapolis.SET,skyridge.SET,ruby.SET,sandstorm.SET,dragon.SET,magmaAqua.SET,hiddenLegends.SET,fireRedLeafGreen.SET,teamRocketReturns.SET,deoxys.SET,emerald.SET,unseen.SET,...lental.SETS,sv1.SET],CARDS,ENERGY_CODE:{...base.ENERGY_CODE,Darkness:'D',Metal:'M'},CLASSIC30_LOANER_DECK:base.CLASSIC30_LOANER_DECK,VERIFIED_DETAILS,cardById,typesOf,hasType,isBattleEnabled,projectOwnedCards,validateDeck,coverage};
});
