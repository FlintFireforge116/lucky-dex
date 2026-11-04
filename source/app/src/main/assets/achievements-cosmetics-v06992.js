(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexCosmeticAchievementsV06992=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TARGETS=[1,3,5,10,15,25,40,60];
const num=v=>Math.max(0,Number(v)||0);
function build(getState){
 const state=()=>getState?.()||{};
 return ['pocket','classic'].flatMap(format=>TARGETS.map((target,index)=>({
   id:`v06992_style_${format}_${target}`,icon:format==='pocket'?'🎨':'🪙',
   name:`${format==='pocket'?'Pocket':'Classic'} Style ${target}`,
   desc:`Win ${target} ${format==='pocket'?'TCG Pocket Solo':'Classic TCG'} battle${target===1?'':'s'} to unlock matching playmats and coins.`,
   category:format==='pocket'?'tcgp':'tcg',
   reward:{coins:100+index*75},
   progress:()=>[num(format==='pocket'?state().tcgpBattle?.stats?.wins:state().tcgClassicBattle?.stats?.wins),target],
   _v06992:true
 })));
}
return {build,TARGETS};
});
