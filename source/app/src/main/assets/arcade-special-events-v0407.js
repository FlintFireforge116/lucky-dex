(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexArcadeSpecialEvents=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const BERRY_RUN_RATE=.03;
  const UNOWN_SHINY_RATE=.004;
  const clamp01=v=>Math.max(0,Math.min(.999999,Number(v)||0));
  const clampRate=(v,fallback)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;};
  function weightedKind(r){const v=clamp01(r);return v<.35?'card':v<.55?'pack':v<.85?'dust':'ticket';}
  function createBerryRunSpecial(rng=Math.random,rate=BERRY_RUN_RATE){
    const chance=clampRate(rate,BERRY_RUN_RATE);if(chance<=0||clamp01(rng())>=chance)return null;
    const kind=weightedKind(rng());
    return {kind,triggerAfter:1+Math.floor(clamp01(rng())*5),delivered:false,surfaced:false,missed:false};
  }
  function glyphLetters(answer=''){
    const out=[];let glyphIndex=0;
    for(const ch of String(answer).toUpperCase())if(/[A-Z]/.test(ch))out.push({letter:ch,glyphIndex:glyphIndex++});
    return out;
  }
  function createUnownShiny(answer,rng=Math.random,rate=UNOWN_SHINY_RATE){
    const chance=clampRate(rate,UNOWN_SHINY_RATE);if(chance<=0||clamp01(rng())>=chance)return null;
    const letters=glyphLetters(answer);if(!letters.length)return null;
    return {...letters[Math.floor(clamp01(rng())*letters.length)]};
  }
  function cardsForLetter(rows,letter){const prefix=String(letter||'').trim().toUpperCase();return (Array.isArray(rows)?rows:[]).filter(row=>String(row?.name||'').trim().toUpperCase().startsWith(prefix));}
  return Object.freeze({BERRY_RUN_RATE,UNOWN_SHINY_RATE,createBerryRunSpecial,createUnownShiny,cardsForLetter});
});
