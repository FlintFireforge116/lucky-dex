(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexTCGPBattleAchievementsV06920=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const num=value=>Math.max(0,Number(value)||0);
  function build(getState){
    const s=()=>getState?.()||{};
    return [
      {id:'v06920_tcgp_first_win',icon:'🃏',name:'First Prize',desc:'Win your first TCG Pocket Solo Battle.',category:'tcgp',reward:{coins:250},progress:()=>[num(s().tcgpBattle?.stats?.wins),1],_v06920:true},
      {id:'v06920_tcgp_10_wins',icon:'♟',name:'Pocket Tactician',desc:'Win 10 TCG Pocket Solo Battles.',category:'tcgp',reward:{coins:750,tickets:1},progress:()=>[num(s().tcgpBattle?.stats?.wins),10],_v06920:true}
    ];
  }
  return{build};
});
