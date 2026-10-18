/* LuckyDex v0.25.9 physical booster artwork resolver.
   Build-time authority: 1niceroli/ptcg-assets packshots index.
   Runtime fallback: GitHub Contents API, cached per set for future opens. */
(function(root,factory){
  const api=factory(root);
  root.LuckyDexBoosterArt=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';
  const REPO='1niceroli/ptcg-assets';
  const MANIFEST='booster-art-index-v0259.json';
  const CACHE_KEY='luckyDexBoosterArtV0259';
  const KNOWN={
    base1:[
      'https://raw.githubusercontent.com/1niceroli/ptcg-assets/main/base1/packshots/Base_Set_Booster_Blastoise_Shadowless.webp',
      'https://raw.githubusercontent.com/1niceroli/ptcg-assets/main/base1/packshots/Base_Set_Booster_Charizard_Shadowless.webp',
      'https://raw.githubusercontent.com/1niceroli/ptcg-assets/main/base1/packshots/Base_Set_Booster_Venusaur_Shadowless.webp'
    ]
  };
  let manifestPromise=null,manifestCache=null;

  function setKey(set){
    const raw=String(set?._libraryKey||set?._libraryCode||set?.id||'').trim().replace(/^library:/i,'');
    return raw.replace(/^en[_:-]/i,'');
  }
  function apiUrl(set){const key=encodeURIComponent(setKey(set));return `https://api.github.com/repos/${REPO}/contents/${key}/packshots`;}
  function cleanUrls(rows){return [...new Set((rows||[]).map(String).filter(url=>/^https:\/\//i.test(url)))];}
  function known(set){return cleanUrls(KNOWN[setKey(set)]||[]);}
  function existing(set){return cleanUrls((set?.boosters||[]).map(row=>row?.artwork_front||row?.artworkFront||row?.image||''));}
  function cachedMap(){
    if(typeof localStorage==='undefined')return {};
    try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')||{};}catch(_){return {};}
  }
  function writeCached(key,rows){
    if(typeof localStorage==='undefined'||!key||!rows?.length)return;
    try{const all=cachedMap();all[key]=cleanUrls(rows);localStorage.setItem(CACHE_KEY,JSON.stringify(all));}catch(_){ }
  }
  async function loadManifest(){
    if(manifestCache)return manifestCache;
    if(manifestPromise)return manifestPromise;
    manifestPromise=(async()=>{
      if(typeof fetch!=='function')return {};
      try{const response=await fetch(MANIFEST,{cache:'no-store'});if(!response.ok)throw new Error(`manifest ${response.status}`);const data=await response.json();manifestCache=data&&typeof data==='object'?data:{};return manifestCache;}catch(_){manifestCache={};return manifestCache;}finally{manifestPromise=null;}
    })();
    return manifestPromise;
  }
  async function remote(set,timeoutMs=2200){
    const key=setKey(set);if(!key||typeof fetch!=='function')return [];
    const controller=typeof AbortController!=='undefined'?new AbortController():null;
    const timer=controller?setTimeout(()=>controller.abort(),Math.max(350,Number(timeoutMs)||2200)):null;
    try{
      const response=await fetch(apiUrl(set),{headers:{Accept:'application/vnd.github+json'},signal:controller?.signal});
      if(!response.ok)return [];
      const rows=await response.json();const urls=cleanUrls((Array.isArray(rows)?rows:[]).filter(row=>row?.type==='file'&&/\.(?:png|jpe?g|webp)$/i.test(row?.name||'')).map(row=>row.download_url));
      if(urls.length)writeCached(key,urls);return urls;
    }catch(_){return [];}finally{if(timer)clearTimeout(timer);}
  }
  async function list(set){
    const key=setKey(set);if(!key)return existing(set);
    const direct=existing(set),cache=cleanUrls(cachedMap()[key]||[]),manifest=cleanUrls((await loadManifest())[key]||[]),seed=known(set);
    const rows=cleanUrls([...direct,...manifest,...cache,...seed]);
    return rows.length?rows:remote(set);
  }
  async function resolve(set,rng=Math.random){
    const rows=await list(set);if(!rows.length)return '';
    const n=Math.max(0,Math.min(.999999,Number(typeof rng==='function'?rng():rng)||0));return rows[Math.floor(n*rows.length)]||rows[0]||'';
  }
  return {REPO,MANIFEST,setKey,apiUrl,known,existing,loadManifest,remote,list,resolve};
});
