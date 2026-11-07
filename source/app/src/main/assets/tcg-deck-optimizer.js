/* LuckyDex v0.69.136 — bounded, optional deck candidate ranking and playtesting.
 * Keeps normal card legality and format rules in the existing builders/engine.
 * Estimated plan quality and actual AI-vs-AI results are reported separately.
 */
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./tcg-deck-synergy.js'):root.LuckyDexDeckSynergy,
  typeof module==='object'&&module.exports?require('./tcgp-battle-core.js'):root.LuckyDexTCGPBattleCore,
  typeof module==='object'&&module.exports?require('./tcgp-battle-ai.js'):root.LuckyDexTCGPBattleAI,
  typeof module==='object'&&module.exports?require('./tcgp-battle-data.js'):root.LuckyDexTCGPBattleData);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LuckyDexDeckOptimizer=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(synergy,core,ai,data){
'use strict';
const sleep=()=>new Promise(resolve=>setTimeout(resolve,0));
const testedProfiles=new Map(); // in-memory only; never sent to or stored in the user profile
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const toCard=ids=>(ids||[]).map(data.cardById).filter(Boolean);
const number=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
function evaluate(candidate,theme='any'){
 const cards=toCard(candidate?.cards),mons=cards.filter(c=>c.kind==='pokemon'),trainers=cards.filter(c=>c.kind==='trainer');
 const plan=synergy.report(cards,candidate?.energyTypes||[],theme);
 const ctx=synergy.context(mons,candidate?.energyTypes||[],theme);
 const roles=new Set(trainers.flatMap(c=>synergy.metadata(c).roles));
 const basics=mons.filter(c=>c.stage==='Basic').length;
 const lines=new Set(mons.filter(c=>c.stage!=='Basic').map(c=>c.evolvesFrom));
 const orphan=mons.filter(c=>c.stage!=='Basic'&&!mons.some(x=>x.name===c.evolvesFrom)).length;
 const paidAttacks=mons.flatMap(c=>c.attacks||[]).filter(a=>[...String(a.cost||'')].every(symbol=>symbol==='C'||({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'}[symbol]&&ctx.energy.has({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'}[symbol]))));
 const costs=paidAttacks.map(a=>String(a.cost||'').length);
 const affordable=costs.filter(x=>x<=2).length;
 const support=roles.has('draw')&&roles.has('search')?32:roles.has('draw')||roles.has('search')?19:0;
 const consistency=support+(roles.has('energy')?12:0)+(roles.has('retreat')?8:0)+Math.min(4,basics)*7-Math.max(0,basics-8)*6;
 const enablers=plan.enablers.length,payoffs=plan.payoffs.length;
 const themeScore=theme==='any'?0:Math.min(4,enablers)*20+Math.min(3,payoffs)*23+(enablers&&payoffs?35:0)+Math.min(3,mons.filter(c=>synergy.pokemonThemeScore(c,theme)>0).length)*8;
 const dead=plan.dead.length;
 const tempo=Math.min(6,affordable)*9+Math.min(8,paidAttacks.length)*2;
 const score=consistency+themeScore+tempo-Math.max(0,orphan)*80-dead*55-(basics<2?40:0)-(trainers.length<3?15:0);
 return {score:Math.round(score),themeScore,consistency,tempo,dead,orphan,plan};
}
function winnerScore(state){
 if(state.winner==='player')return 1;if(state.winner==='opponent')return 0;
 const p=state.sides?.player||{},o=state.sides?.opponent||{},pPrizes=number(p.prizesTaken),oPrizes=number(o.prizesTaken);
 const score=pPrizes-oPrizes;return clamp(0.5+score/10,0,1);
}
// Runs the production core and legal-action AI rather than inventing simulated
// damage. An action budget keeps weak / healing decks from locking the UI.
async function playtest(format,player,opponent,seed=1,options={}){
 const playerCards=player?.cards||[],opponentCards=opponent?.cards||[];
 const energyOf=d=>Array.isArray(d?.energyTypes)&&d.energyTypes.length?d.energyTypes:['Fighting'];
 const b=core.createBattle({format,playerDeck:playerCards,opponentDeck:opponentCards,playerEnergyTypes:energyOf(player),opponentEnergyTypes:energyOf(opponent),seed,firstSide:seed%2?'player':'opponent',manualPlayerSetup:false});
 const count={player:0,opponent:0};let actions=0,errors=0;
 const maxActions=clamp(number(options.maxActions,100),15,160);
 for(;actions<maxActions&&b.phase!=='finished';actions++){
  if(options.isCancelled?.())return null;
  const side=b.phase==='promote'?b.promotionSide:b.phase==='effectChoice'?b.choiceSide:b.activeSide;
  if(!side||!b.sides?.[side])break;
  let available;try{available=core.legalActions(b,side);}catch(_){errors++;break;}
  if(!available?.length)break;
  let next=null;
  try{next=ai.chooseAction(b,side,'Beginner',count[side]++);}catch(_){errors++;}
  const matches=a=>available.some(x=>JSON.stringify(x)===JSON.stringify(a));
  if(!next||!matches(next))next=available.find(x=>x.type==='endTurn')||available[0];
  try{core.applyAction(b,side,next);}catch(_){errors++;try{const safe=available.find(x=>x.type==='endTurn'&&x!==next)||available.find(x=>x.type==='effectChoice')||available.find(x=>x!==next);if(!safe)break;core.applyAction(b,side,safe);}catch(__){break;}}
  if(actions%12===11)await sleep();
 }
 return {winRate:winnerScore(b),winner:b.winner||null,actions,turns:number(b.turnNumber),errors,finished:b.phase==='finished'};
}
// The existing builder generates complete, legal decks; we only compare those.
// To preserve variety, rotate among candidates near the best tested score.
async function optimise({build,rows,options={},format='classic',maxCandidates=5,simulate=false,onProgress=()=>{},isCancelled=()=>false,seed=1}={}){
 if(typeof build!=='function')throw new TypeError('A legal deck builder is required');
 const variants=[],fingerprints=new Set(),count=clamp(Number(maxCandidates)||5,1,8);
 for(let i=0;i<count;i++){
  if(isCancelled())return null;
  const variant=await build(rows,{...options,randomSeed:(seed+Math.imul(i+1,7919))>>>0,excludeArchetypes:[...(options.excludeArchetypes||[]),...variants.map(v=>v.archetypeKey).filter(Boolean)]});
  if(variant?.ok){const fingerprint=[...variant.cards].sort().join('|');if(!fingerprints.has(fingerprint)){fingerprints.add(fingerprint);variants.push({...variant,assessment:evaluate(variant,options.theme||'any')});}}
  onProgress({stage:'candidates',completed:i+1,total:count,valid:variants.length});
  await sleep();
 }
 if(!variants.length)return {ok:false,errors:['No legal candidate decks matched those filters.']};
 // All candidates use the same independent benchmark, including when they
 // belong to different archetypes. The alternative is generated legally too.
 if(simulate&&variants.length){
  const benchmark=await build(rows,{...options,style:'random',randomSeed:(seed^0xa31f9d73)>>>0,excludeArchetypes:variants.map(v=>v.archetypeKey).filter(Boolean)})||variants[0];
  const against=benchmark.ok?benchmark:variants[0];
  for(let i=0;i<variants.length;i++){
   if(isCancelled())return null;
   try{const result=await playtest(format,variants[i],against,((seed+i*31)>>>0)||1,{isCancelled});if(result){variants[i].playtest=result;}}
   catch(err){variants[i].playtest={error:String(err.message||err)};}
   onProgress({stage:'matches',completed:i+1,total:variants.length});
  }
 }
 const profileKey=v=>[format,options.theme||'any',(v.energyTypes||[]).join('/'),v.archetypeKey||v.focusCardId||''].join('|');
 const ranked=variants.map(v=>{
  const history=testedProfiles.get(profileKey(v));
  const memoryBoost=history&&history.count>=2?clamp(Math.round((history.average-.5)*30),-15,15):0;
  const ranking=v.assessment.score+(v.playtest&&!v.playtest.error?Math.round((v.playtest.winRate-.5)*100):0)+memoryBoost;
  return {...v,ranking,memoryBoost};
 }).sort((a,b)=>b.ranking-a.ranking);
 // Only finished/valid simulation results affect future optimisations during
 // this app session. Avoid persisting noisy early-match impressions.
 if(simulate)for(const v of variants){if(!v.playtest||v.playtest.error)continue;
  const key=profileKey(v),prior=testedProfiles.get(key)||{count:0,average:.5};
  testedProfiles.set(key,{count:Math.min(50,prior.count+1),average:(prior.average*prior.count+v.playtest.winRate)/(prior.count+1)});
 }
 if(testedProfiles.size>300)testedProfiles.delete(testedProfiles.keys().next().value);
 const best=ranked[0].ranking,near=ranked.filter(v=>v.ranking>=best-24);
 const selected=near[(seed>>>0)%near.length];
 const summary=`${variants.length} legal candidate${variants.length===1?'':'s'} compared · plan ${selected.assessment.score}`+(selected.playtest&&!selected.playtest.error?` · playtest ${Math.round(selected.playtest.winRate*100)}% score over ${selected.playtest.actions} actions`:'');
 return {...selected,ok:true,rankedCandidates:ranked.length,optimisation:{candidates:variants.length,simulated:!!simulate,summary,score:selected.ranking,assessment:selected.assessment,playtest:selected.playtest||null}};
}
return {evaluate,playtest,optimise};
});
