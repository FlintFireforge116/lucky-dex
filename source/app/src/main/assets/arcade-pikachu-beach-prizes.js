(function(root){
  'use strict';
  const PREFIX='pikachuBeachLuckyWave',locks=new WeakMap();let serial=0;
  const rr=()=>root.LuckyDexArcadeRareRewards;
  const bridge=()=>root.LuckyDexRareRewardBridge;
  function save(owner){if(owner===root.state)(bridge()?.save||root.save)?.();}
  function modeOf(value){return value==='dx'?'dx':'classic';}
  function reserve(owner,mode='classic',rng=Math.random){
    if(typeof mode==='function'){rng=mode;mode='classic';}
    mode=modeOf(mode);rng=typeof rng==='function'?rng:Math.random;
    const store=rr().ensureStore(owner),base=`${PREFIX}:${mode}`,key=store.attempts[base]?`${base}:${Date.now()}:${++serial}`:base;
    const attempt=rr().getOrCreateAttempt(owner,key,()=>{const pick=root.LuckyDexVoltorbGiftCore.rewardForRoll(rng());return {kind:pick.kind,reward:pick.reward,source:'pikachu-beach-lucky-wave',mode,meta:{mode}};});
    save(owner);return attempt;
  }
  function incrementPrize(owner,attempt){
    const beach=owner?.arcade?.pikachuBeach;if(!beach)return;
    const mode=modeOf(attempt?.mode||attempt?.meta?.mode);
    if(beach[mode]&&typeof beach[mode]==='object')beach[mode].luckyPrizes=Number(beach[mode].luckyPrizes||0)+1;
    else beach.luckyPrizes=Number(beach.luckyPrizes||0)+1;
  }
  function deliver(owner,attempt){
    if(!owner||!attempt)return Promise.resolve({pending:true,label:'Lucky Wave Prize Reserved'});
    let pending=locks.get(owner);if(!pending){pending=new Map();locks.set(owner,pending);}if(pending.has(attempt.id))return pending.get(attempt.id);
    const promise=Promise.resolve().then(async()=>{
      try{
        if(owner!==root.state)throw new Error('Save changed');
        if(rr().wasClaimed(owner,attempt.id))return {pending:false,label:attempt.reward?.label||'Lucky Wave Prize'};
        if(!attempt.reward&&['card','pack'].includes(attempt.kind)){
          const reward=await bridge()?.resolveArcadeReward?.(attempt.kind);if(owner!==root.state||!reward)throw new Error('Reward remains reserved');
          attempt=rr().patchAttempt(owner,attempt.key,attempt.id,{reward})||attempt;save(owner);
        }
        if(owner!==root.state||!attempt.reward)throw new Error('Reward remains reserved');
        const claim=await rr().claimAttempt(owner,attempt.key,attempt.id,reward=>bridge().grantReward(reward));
        if(!claim.claimed)throw new Error('Reservation not claimable');
        if(!claim.duplicate)incrementPrize(owner,attempt);
        save(owner);return {pending:false,label:claim.result?.label||attempt.reward.label||'Lucky Wave Prize',reveal:bridge()?.rewardReveal?.(attempt.reward,claim.result,'LUCKY WAVE PRIZE')||null};
      }catch(_){save(owner);return {pending:true,label:'Lucky Wave Prize Reserved'};}
    }).finally(()=>pending.delete(attempt.id));
    pending.set(attempt.id,promise);return promise;
  }
  function retry(owner){const attempts=Object.values(rr()?.ensureStore(owner)?.attempts||{}).filter(a=>String(a.key||'').startsWith(PREFIX));return Promise.all(attempts.map(a=>deliver(owner,a)));}
  root.LuckyDexPikachuBeachPrizes={reserve,deliver,retry};
})(typeof window!=='undefined'?window:globalThis);
