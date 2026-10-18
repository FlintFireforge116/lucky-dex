(function(root){
  'use strict';
  const PREFIX='pokemonSeekDreamSparkle',locks=new WeakMap();let serial=0;
  const rr=()=>root.LuckyDexArcadeRareRewards;
  const bridge=()=>root.LuckyDexRareRewardBridge;
  function save(owner){if(owner===root.state)(bridge()?.save||root.save)?.();}
  function reserve(owner,rng=Math.random){
    const store=rr().ensureStore(owner),key=store.attempts[PREFIX]?`${PREFIX}:${Date.now()}:${++serial}`:PREFIX;
    const attempt=rr().getOrCreateAttempt(owner,key,()=>{const pick=root.LuckyDexVoltorbGiftCore.rewardForRoll(rng());return {kind:pick.kind,reward:pick.reward,source:'pokemon-seek-dream-sparkle'};});
    save(owner);return attempt;
  }
  function deliver(owner,attempt){
    if(!owner||!attempt)return Promise.resolve({pending:true,label:'Dream Prize Reserved'});
    let pending=locks.get(owner);if(!pending){pending=new Map();locks.set(owner,pending);}if(pending.has(attempt.id))return pending.get(attempt.id);
    // Queue work after the lock is installed, including synchronous grant APIs.
    const promise=Promise.resolve().then(async()=>{
      try{
        if(owner!==root.state)throw new Error('Save changed');
        if(rr().wasClaimed(owner,attempt.id))return {pending:false,label:attempt.reward?.label||'Dream Prize'};
        if(!attempt.reward&&['card','pack'].includes(attempt.kind)){
          const reward=await bridge()?.resolveArcadeReward?.(attempt.kind);if(owner!==root.state||!reward)throw new Error('Reward remains reserved');
          attempt=rr().patchAttempt(owner,attempt.key,attempt.id,{reward})||attempt;save(owner);
        }
        if(owner!==root.state||!attempt.reward)throw new Error('Reward remains reserved');
        const claim=await rr().claimAttempt(owner,attempt.key,attempt.id,reward=>bridge().grantReward(reward));
        if(!claim.claimed)throw new Error('Reservation not claimable');
        if(!claim.duplicate&&owner.arcade.pokemonSeek)owner.arcade.pokemonSeek.dreamPrizes=Number(owner.arcade.pokemonSeek.dreamPrizes||0)+1;
        save(owner);return {pending:false,label:claim.result?.label||attempt.reward.label||'Dream Prize',reveal:bridge()?.rewardReveal?.(attempt.reward,claim.result,'DREAM SPARKLE PRIZE')||null};
      }catch(_){save(owner);return {pending:true,label:'Dream Prize Reserved'};}
    }).finally(()=>pending.delete(attempt.id));
    pending.set(attempt.id,promise);return promise;
  }
  function retry(owner){const attempts=Object.values(rr()?.ensureStore(owner)?.attempts||{}).filter(a=>a.key.startsWith(PREFIX));return Promise.all(attempts.map(a=>deliver(owner,a)));}
  root.LuckyDexPokemonSeekPrizes={reserve,deliver,retry};
})(typeof window!=='undefined'?window:globalThis);
