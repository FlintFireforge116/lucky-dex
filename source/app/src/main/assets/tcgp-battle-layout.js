(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexTCGPBattleLayout=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // A horizontal scroll span is intentional once there is no useful exposed
  // card edge left. The board/hand anchor never grows with the number of cards.
  function handFan(count,width,height){
    const n=Math.max(0,Math.min(100,Math.floor(Number(count)||0))),w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1),pad=14;
    const cardWidth=Math.max(1,Math.min(84,(h-24)/1.4,w-2*pad)),cardHeight=cardWidth*1.4;
    const natural=n<=3?cardWidth+8:n<=5?cardWidth*.8:cardWidth*.55;
    const fitted=n>1?(w-2*pad-cardWidth)/(n-1):0;
    const step=n>1?Math.max(Math.min(28,cardWidth),Math.min(natural,fitted)):0;
    const extent=n?cardWidth+step*(n-1):0,spanWidth=Math.max(w,extent+2*pad),start=(spanWidth-extent)/2;
    const angle=Math.min(8,Math.max(0,n-1)*1.4);
    return {cardWidth,cardHeight,step,spanWidth,cards:Array.from({length:n},(_,i)=>{const t=n>1?(i/(n-1))*2-1:0;return {x:start+i*step,y:t*t*3,angle:t*angle,zIndex:i+1};})};
  }
  return {handFan};
});
