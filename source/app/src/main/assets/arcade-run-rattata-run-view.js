(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexRunRattataRunView=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const CONFIG=Object.freeze({
    playerAnchorRatio:.72,
    worldScale:.8,
    laneCenters:Object.freeze([.125,.375,.625,.875]),
    hurdleCullMargin:24,
    tileSize:32
  });
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  function playerAnchorY(height){return Math.round(Math.max(1,Number(height)||1)*CONFIG.playerAnchorRatio);}
  function worldToY(distance,cameraDistance,height){return playerAnchorY(height)-(Number(distance||0)-Number(cameraDistance||0))*CONFIG.worldScale;}
  function laneToX(index,width){const i=clamp(Math.trunc(Number(index)||0),0,CONFIG.laneCenters.length-1);return Math.max(1,Number(width)||1)*CONFIG.laneCenters[i];}
  function visibleHurdles(hurdles,cameraDistance,height){return (hurdles||[]).map(distance=>({distance:Number(distance)||0,y:worldToY(distance,cameraDistance,height)})).filter(item=>item.y>=-CONFIG.hurdleCullMargin&&item.y<=Number(height||0)+CONFIG.hurdleCullMargin);}
  function courseOffset(cameraDistance){const px=(Number(cameraDistance)||0)*CONFIG.worldScale;return ((px%CONFIG.tileSize)+CONFIG.tileSize)%CONFIG.tileSize;}
  return {CONFIG,playerAnchorY,worldToY,laneToX,visibleHurdles,courseOffset};
});
