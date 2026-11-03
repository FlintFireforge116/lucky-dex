(function(root,factory){
 const classic=typeof module==='object'&&module.exports?require('./tcg-classic-battle-data.js'):root.LuckyDexClassicTCGBattleData;
 const decks=typeof module==='object'&&module.exports?require('./tcg-classic-decks.js'):root.LuckyDexClassicTCGDecks;
 const api=factory(classic,decks);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGDeckBuilder=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(classic,decks){
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
const STAGE_RANK=Object.freeze({'Basic':0,'Stage 1':1,'Stage 2':2});
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function ownedMap(rows){const map=new Map();for(const row of rows||[]){const id=classic.cardById(row.gameplayId)?.id;if(id)map.set(id,(map.get(id)||0)+Math.max(0,Number(row.quantity)||0));}return map;}
function attackTypes(card){const out=new Set();for(const attack of card?.attacks||[])for(const symbol of String(attack.cost||'')){const type=CODE_TO_TYPE[symbol];if(type)out.add(type);}return [...out];}
function familyLine(card,pool){if(!card||card.kind!=='pokemon')return [];const line=[card],seen=new Set([card.id]);let cur=card;while(cur.evolvesFrom){const prior=pool.find(c=>c.kind==='pokemon'&&c.name===cur.evolvesFrom);if(!prior||seen.has(prior.id))return [];line.unshift(prior);seen.add(prior.id);cur=prior;}return line;}
function familyRoot(card,pool){const line=familyLine(card,pool);return line[0]?.name||card?.name||card?.id||'';}
function endpointCards(pool){const parents=new Set(pool.filter(c=>c.kind==='pokemon'&&c.evolvesFrom).map(c=>c.evolvesFrom));return pool.filter(c=>c.kind==='pokemon'&&!parents.has(c.name));}
function damageValue(card){let best=0;for(const a of card?.attacks||[]){const raw=Number(String(a.damageText??a.damage??0).match(/\d+/)?.[0]||0);best=Math.max(best,raw);}return best;}
function pokemonScore(card,pool){const line=familyLine(card,pool);return Number(card.hp||0)+damageValue(card)*1.7+(STAGE_RANK[card.stage]||0)*24+(line.length===3?18:line.length===2?10:0)-Math.max(0,Number(card.retreat||0)-2)*4;}
function typeCompatible(card,types){if(!types?.length)return true;const needs=attackTypes(card);return !needs.length||needs.every(type=>types.includes(type));}
function rng(seed){let x=(Number(seed)||0x6d2b79f5)>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function fail(message){return {ok:false,cards:[],energyTypes:[],errors:[message],warnings:[],strategy:''};}
function buildDeck(rows,options={}){
 const style=options.style==='random'?'random':'competitive',owned=ownedMap(rows),pool=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false&&Number(owned.get(c.id)||0)>0),pokemonPool=pool.filter(c=>c.kind==='pokemon');
 if([...owned.values()].reduce((sum,n)=>sum+Math.min(4,n),0)<30)return fail('Not enough owned battle-ready Base Set copies to build a 30-card deck.');
 if(!pokemonPool.some(c=>c.stage==='Basic'))return fail('No owned battle-ready Basic Pokémon are available.');
 const requested=[...new Set((options.types||[]).filter(t=>decks.ENERGY_TYPES.includes(t)))].slice(0,2),existing=Array.isArray(options.cards)?options.cards:[],focus=classic.cardById(options.focusCardId),random=rng(options.randomSeed),excluded=new Set(options.excludeArchetypes||[]);
 let candidates=endpointCards(pokemonPool).filter(c=>familyLine(c,pokemonPool).length&&typeCompatible(c,requested));
 if(focus?.kind==='pokemon'){
   const root=familyRoot(focus,pokemonPool);const focused=candidates.filter(c=>familyRoot(c,pokemonPool)===root);if(focused.length)candidates=focused;
 }
 candidates.sort((a,b)=>pokemonScore(b,pokemonPool)-pokemonScore(a,pokemonPool)||Number(a.number)-Number(b.number));
 if(!candidates.length)return fail('No complete owned evolution family matches the selected Classic Energy types.');
 if(style==='random'){
   const viable=candidates.filter(c=>!excluded.has(norm(familyRoot(c,pokemonPool))));if(viable.length)candidates=viable;
   const band=candidates.slice(0,Math.min(14,candidates.length));const pick=band[Math.floor(random()*band.length)]||candidates[0];candidates=[pick,...candidates.filter(c=>c!==pick)];
 }
 const main=candidates[0],mainLine=familyLine(main,pokemonPool),mainRoot=familyRoot(main,pokemonPool),selectedTypes=requested.length?requested.slice():attackTypes(main).slice(0,2);
 if(!selectedTypes.length){const ownType=(main.types||[]).find(t=>decks.ENERGY_TYPES.includes(t));if(ownType)selectedTypes.push(ownType);}
 if(!selectedTypes.length)selectedTypes.push('Fighting');
 const cards=[],counts=new Map();
 function room(card){return Math.max(0,Math.min(4,Number(owned.get(card.id)||0))-(counts.get(card.id)||0));}
 function add(card,n=1){let added=0;while(added<n&&cards.length<30&&room(card)>0){cards.push(card.id);counts.set(card.id,(counts.get(card.id)||0)+1);added++;}return added;}
 function addLine(line,copies){if(!line.length||line.some(c=>Number(owned.get(c.id)||0)<1))return false;for(let copy=0;copy<copies;copy++){if(line.some(c=>room(c)<1)||cards.length+line.length>30)break;for(const c of line)add(c,1);}return line.every(c=>(counts.get(c.id)||0)>0);}
 // Preserve legal existing cards first for Fill / repair, but never exceed ownership/copy limits.
 for(const id of existing){const c=classic.cardById(id);if(c&&c.battleEnabled&&c.deckEligible!==false)add(c,1);}
 // Ensure any preserved evolutions gain their missing prerequisites.
 for(const id of [...cards]){const c=classic.cardById(id);if(c?.kind==='pokemon'&&c.stage!=='Basic'){const line=familyLine(c,pokemonPool);if(line.length)for(const member of line.slice(0,-1))if(!(counts.get(member.id)||0))add(member,1);}}
 const mainCopies=mainLine.length===3?3:mainLine.length===2?3:4;addLine(mainLine,mainCopies);
 const pokemonCount=()=>cards.map(classic.cardById).filter(c=>c?.kind==='pokemon').length;
 const familySet=()=>new Set(cards.map(classic.cardById).filter(c=>c?.kind==='pokemon').map(c=>familyRoot(c,pokemonPool)));
 // One coherent secondary family, preferring the selected Energy profile.
 const canFitEnergy=c=>requested.length?typeCompatible(c,selectedTypes):new Set([...selectedTypes,...attackTypes(c)]).size<=2;
 const partnerCandidates=endpointCards(pokemonPool).filter(c=>familyRoot(c,pokemonPool)!==mainRoot&&canFitEnergy(c)&&familyLine(c,pokemonPool).length<=2).sort((a,b)=>{const aNew=attackTypes(a).filter(t=>!selectedTypes.includes(t)).length,bNew=attackTypes(b).filter(t=>!selectedTypes.includes(t)).length;return aNew-bNew||pokemonScore(b,pokemonPool)-pokemonScore(a,pokemonPool)||Number(a.number)-Number(b.number);});
 if(partnerCandidates.length&&pokemonCount()<12){let partner=partnerCandidates[0];if(style==='random'){const band=partnerCandidates.slice(0,Math.min(8,partnerCandidates.length));partner=band[Math.floor(random()*band.length)]||partner;}if(addLine(familyLine(partner,pokemonPool),2)&&!requested.length)for(const type of attackTypes(partner))if(!selectedTypes.includes(type)&&selectedTypes.length<2)selectedTypes.push(type);}
 // Add useful standalone Basics until the deck has a practical opening density.
 const basics=pokemonPool.filter(c=>c.stage==='Basic'&&canFitEnergy(c)).sort((a,b)=>{const aNew=attackTypes(a).filter(t=>!selectedTypes.includes(t)).length,bNew=attackTypes(b).filter(t=>!selectedTypes.includes(t)).length;return aNew-bNew||pokemonScore(b,pokemonPool)-pokemonScore(a,pokemonPool)||Number(a.number)-Number(b.number);});
 for(const c of basics){if(pokemonCount()>=14)break;if(!familySet().has(familyRoot(c,pokemonPool))||room(c)>0){const added=add(c,Math.min(2,room(c)));if(added&&!requested.length)for(const type of attackTypes(c))if(!selectedTypes.includes(type)&&selectedTypes.length<2)selectedTypes.push(type);}}
 // Stage 2 decks value Breeder; add it before generic staples when owned.
 if(cards.map(classic.cardById).some(c=>c?.stage==='Stage 2')){const breeder=classic.cardById('base1-76');if(breeder)add(breeder,Math.min(2,room(breeder)));}
 if(focus&&focus.kind!=='pokemon')add(focus,Math.min(2,room(focus)));
 // DCE is a real deck card and is especially useful when attacks contain Colorless requirements.
 const hasColorless=cards.map(classic.cardById).filter(c=>c?.kind==='pokemon').some(c=>(c.attacks||[]).some(a=>String(a.cost||'').includes('C'))),dce=classic.cardById('base1-96');if(hasColorless&&dce)add(dce,Math.min(2,room(dce)));
 for(const [id,want] of STAPLES){const card=classic.cardById(id);if(card)add(card,Math.min(want,room(card)));if(cards.length>=30)break;}
 // Fallback through remaining owned Trainers first, then compatible Basics. This remains legal but avoids stranded evolutions.
 const trainerFallback=pool.filter(c=>c.kind==='trainer'||c.specialEnergy).sort((a,b)=>Number(a.number)-Number(b.number));
 for(const c of trainerFallback){while(cards.length<30&&room(c)>0)add(c,1);if(cards.length>=30)break;}
 for(const c of basics){while(cards.length<30&&room(c)>0)add(c,1);if(cards.length>=30)break;}
 if(cards.length<30&&!requested.length){for(const c of pokemonPool.filter(c=>c.stage==='Basic')){const next=[...new Set([...selectedTypes,...attackTypes(c)])];if(next.length>2)continue;while(cards.length<30&&room(c)>0)add(c,1);for(const type of attackTypes(c))if(!selectedTypes.includes(type)&&selectedTypes.length<2)selectedTypes.push(type);if(cards.length>=30)break;}}
 // Final conservative fill: only Trainers, Special Energy, and Basics whose actual deck Energy profile stays at two types or fewer.
 if(cards.length<30){for(const c of pool.filter(c=>c.kind==='trainer'||c.specialEnergy||c.stage==='Basic')){while(cards.length<30&&room(c)>0){const trial=[...cards,c.id],profile=decks.analyzeDeck(trial).recommendedEnergyTypes;if(requested.length&&!profile.every(t=>requested.includes(t)))break;if(!requested.length&&profile.length>2)break;add(c,1);}if(cards.length>=30)break;}}
 if(cards.length!==30)return fail(`Could only assemble ${cards.length}/30 compatible owned cards. Add more Base Set cards or widen the Energy type filter.`);
 const legal=decks.validateDraft(cards,rows,{requireFull:true});if(!legal.ok)return {ok:false,cards,energyTypes:selectedTypes,errors:legal.errors,warnings:[],strategy:''};
 const analysis=decks.analyzeDeck(cards),energyTypes=requested.length?requested:analysis.recommendedEnergyTypes.slice(0,2);
 const finalEnergy=energyTypes.length?energyTypes:selectedTypes.slice(0,2);
 return {ok:true,cards,energyTypes:finalEnergy,errors:[],warnings:[],style,archetypeKey:norm(mainRoot),focusCardId:focus?.id||main.id,strategy:`${style==='random'?'Random viable':'Competitive'} · ${finalEnergy.join(' / ')} · ${mainRoot} core · ${pokemonCount()} Pokémon / ${30-pokemonCount()} Trainers & Special Energy`};
}
function buildDeckAsync(rows,options,control={}){return new Promise(resolve=>{setTimeout(()=>{if(control.isCancelled?.())return resolve(null);resolve(buildDeck(rows,options));},0);});}
return {buildDeck,buildDeckAsync,familyLine,familyRoot,attackTypes};
});
