/* LuckyDex v0.26.6 reusable standalone booster mini-art.
   These assets are intended for Fossil Dig and any future minigame/reward UI.
   Resolution is synchronous and local; no network or runtime JSON fetch is used. */
(function(root,factory){
  const api=factory(root);
  root.LuckyDexBoosterMiniArt=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';
  let full=root.LuckyDexBoosterArt||null;
  if(!full&&typeof require==='function'){
    try{full=require('./booster-art-v0260.js');}catch(_){full=null;}
  }
  function miniFromFull(fullPath=''){
    const match=String(fullPath||'').match(/(?:^|\/)booster-art-v0260\/([^/]+\.webp)$/i);
    return match?`booster-mini-v0266/${match[1]}`:'';
  }
  // Mini sprites remain deliberately bundled/local even when the full-size
  // resolver has a higher-resolution remote override (Dragon Vault).
  function directPath(set){return miniFromFull(full?.localPath?.(set)||full?.directPath?.(set)||'');}
  function localPath(set){return directPath(set);}
  function attach(set){
    if(!set||typeof set!=='object')return set;
    const hit=directPath(set);if(hit)set._boosterMiniArt=hit;return set;
  }
  async function resolve(set){return directPath(set);}
  async function has(set){return !!directPath(set);}
  async function list(set){const hit=directPath(set);return hit?[hit]:[];}
  const byId=Object.fromEntries(Object.entries(full?.EMBEDDED?.byId||{}).map(([id,p])=>[id,miniFromFull(p)]).filter(([,p])=>p));
  const byName=Object.fromEntries(Object.entries(full?.EMBEDDED?.byName||{}).map(([name,p])=>[name,miniFromFull(p)]).filter(([,p])=>p));
  return {directPath,localPath,attach,resolve,has,list,byId,byName,miniFromFull};
});
