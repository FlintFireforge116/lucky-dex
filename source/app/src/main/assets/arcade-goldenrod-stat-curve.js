(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexGoldenrodStatCurve=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const REFERENCE_POINTS=Object.freeze([
    Object.freeze({stat:20,factor:.65}),Object.freeze({stat:40,factor:.78}),Object.freeze({stat:59,factor:.90}),Object.freeze({stat:89,factor:1.02}),
    Object.freeze({stat:119,factor:1.12}),Object.freeze({stat:149,factor:1.19}),Object.freeze({stat:180,factor:1.24}),Object.freeze({stat:220,factor:1.28})
  ]);
  function interpolate(baseStat){
    const n=Number(baseStat);const value=Number.isFinite(n)?n:60;
    if(value<=REFERENCE_POINTS[0].stat)return REFERENCE_POINTS[0].factor;
    const last=REFERENCE_POINTS[REFERENCE_POINTS.length-1];if(value>=last.stat)return last.factor;
    for(let i=1;i<REFERENCE_POINTS.length;i++){
      const hi=REFERENCE_POINTS[i],lo=REFERENCE_POINTS[i-1];
      if(value<=hi.stat){const t=(value-lo.stat)/(hi.stat-lo.stat);return Math.round((lo.factor+(hi.factor-lo.factor)*t)*10000)/10000;}
    }
    return last.factor;
  }
  return Object.freeze({REFERENCE_POINTS,interpolate,factor:interpolate});
});
