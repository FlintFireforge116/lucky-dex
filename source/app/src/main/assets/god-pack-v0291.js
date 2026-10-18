/* LuckyDex God Pack policy (introduced v0.29.1; productionized v0.29.2).
   FORCE_TEST_GOD_PACK remains available as a validation override and is false in production builds.
   Flip only that flag to false after visual/mechanical sign-off; production odds
   remain fixed at 1 / PRODUCTION_DENOMINATOR. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LuckyDexGodPack=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const PRODUCTION_DENOMINATOR=1000;
  const FORCE_TEST_GOD_PACK=false;
  const clampTier=value=>Math.max(0,Math.min(6,Number(value)||0));

  function shouldRoll(random=Math.random,force=FORCE_TEST_GOD_PACK){
    if(force)return true;
    return Number(random()) < (1/PRODUCTION_DENOMINATOR);
  }

  function availableTiers(cards=[],tierFor=card=>Number(card?.tier)||0){
    return [...new Set((cards||[]).map(card=>clampTier(tierFor(card))).filter(Number.isFinite))].sort((a,b)=>a-b);
  }

  function highPoolTiers(cards=[],tierFor){
    const tiers=availableTiers(cards,tierFor);
    if(!tiers.length)return [0];
    const max=tiers.at(-1);
    const floor=max>=6?4:max>=5?4:max>=4?3:max>=3?2:max;
    const pool=tiers.filter(t=>t>=floor);
    return pool.length?pool:[max];
  }

  function targetPlan(cards=[],count=5,tierFor=card=>Number(card?.tier)||0){
    const size=Math.max(1,Math.floor(Number(count)||1));
    const pool=highPoolTiers(cards,tierFor);
    const descending=[...pool].sort((a,b)=>b-a);
    const max=descending[0];
    const plan=[];
    // Modern chase pools guarantee two attempts at the ceiling. Older sets
    // whose ceiling is Rare/Holo simply make every slot the best tier present.
    const guaranteed=max>=5?Math.min(2,size):1;
    for(let i=0;i<guaranteed;i++)plan.push(max);
    if(pool.length===1){while(plan.length<size)plan.push(max);return plan;}
    let cursor=1;
    while(plan.length<size){
      plan.push(descending[cursor%descending.length]);
      cursor++;
    }
    return plan;
  }

  return Object.freeze({PRODUCTION_DENOMINATOR,FORCE_TEST_GOD_PACK,shouldRoll,availableTiers,highPoolTiers,targetPlan});
});
