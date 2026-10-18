(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexArcadeRareRewards=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  function ensureStore(state){
    if(!state||typeof state!=='object')throw new Error('LuckyDex state unavailable');
    state.arcade=state.arcade&&typeof state.arcade==='object'?state.arcade:{};
    const store=state.arcade.rareRewards=state.arcade.rareRewards&&typeof state.arcade.rareRewards==='object'?state.arcade.rareRewards:{};
    store.attempts=store.attempts&&typeof store.attempts==='object'?store.attempts:{};
    store.claimed=store.claimed&&typeof store.claimed==='object'?store.claimed:{};
    return store;
  }
  function makeId(key,now){return `${String(key||'reward')}:${Number(now)||Date.now()}:${Math.random().toString(36).slice(2,8)}`;}
  function currentAttempt(state,key){return ensureStore(state).attempts[String(key)]||null;}
  function getOrCreateAttempt(state,key,create,{now=Date.now(),id=null}={}){
    const store=ensureStore(state),slot=String(key);if(store.attempts[slot])return store.attempts[slot];
    const body=typeof create==='function'?(create()||{}):{};
    const attempt={...body,id:id||makeId(slot,now),key:slot,createdAt:Number(now)||Date.now(),status:'active'};
    store.attempts[slot]=attempt;return attempt;
  }
  function patchAttempt(state,key,id,patch){
    const store=ensureStore(state),slot=String(key),attempt=store.attempts[slot];if(!attempt||String(attempt.id)!==String(id))return null;
    Object.assign(attempt,patch&&typeof patch==='object'?patch:{});return attempt;
  }
  function wasClaimed(state,id){return !!ensureStore(state).claimed[String(id)];}
  async function claimAttempt(state,key,id,grant){
    const store=ensureStore(state),claimId=String(id);
    if(store.claimed[claimId])return {claimed:true,duplicate:true,result:store.claimed[claimId]};
    const slot=String(key),attempt=store.attempts[slot];
    if(!attempt||String(attempt.id)!==claimId)return {claimed:false,duplicate:false,missing:true};
    if(typeof grant!=='function')throw new Error('Reward grant handler unavailable');
    const result=await grant(attempt.reward,attempt);
    const receipt={at:Date.now(),kind:attempt.kind||attempt.reward?.type||'reward',label:result?.label||attempt.reward?.label||''};
    store.claimed[claimId]=receipt;delete store.attempts[slot];return {claimed:true,duplicate:false,result};
  }
  function abandonAttempt(state,key,id){
    const store=ensureStore(state),slot=String(key),attempt=store.attempts[slot];if(!attempt||String(attempt.id)!==String(id))return false;delete store.attempts[slot];return true;
  }
  return Object.freeze({ensureStore,currentAttempt,getOrCreateAttempt,patchAttempt,claimAttempt,wasClaimed,abandonAttempt});
});
