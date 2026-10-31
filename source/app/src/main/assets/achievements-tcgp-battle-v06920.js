(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexTCGPBattleAchievementsV06920=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const num=v=>Math.max(0,Number(v)||0);
  function build(getState){
    const state=()=>getState?.()||{},stats=()=>state().tcgpBattle?.stats||{};
    const make=(id,icon,name,desc,coins,current,target=1,extra={})=>({id,icon,name,desc,category:'tcgp',reward:{coins,...extra},progress:()=>[num(current()),target],_v06920:true});
    return [
      make('v06920_tcgp_first_win','🃏','First Prize','Win your first TCG Pocket Solo Battle.',250,()=>stats().wins),
      make('v06920_tcgp_10_wins','♟','Pocket Tactician','Win 10 TCG Pocket Solo Battles.',750,()=>stats().wins,10,{tickets:1}),
      make('v06937_tcgp_first_clear','⭐','Solo Debut','Clear your first Solo challenge.',100,()=>Object.values(state().tcgpBattle?.firstClears||{}).filter(Boolean).length),
      ...['Beginner','Intermediate','Advanced','Expert'].map((level,i)=>make('v06937_tcgp_clear_'+level.toLowerCase(),'🏅',level+' Champion','Clear every '+level+' Solo challenge.',150+i*100,()=>state().tcgpBattle?.difficultyClears?.[level]?1:0)),
      make('v06937_tcgp_expert_win','♟','Expert Challenger','Win against an Expert CPU.',250,()=>stats().difficultyWins?.Expert),
      make('v06937_tcgp_25_wins','🏆','Pocket Veteran','Win 25 TCG Pocket Solo Battles.',1000,()=>stats().wins,25),
      make('v06937_tcgp_archetypes','🌈','Energy Explorer','Win with four different Energy archetypes.',250,()=>Object.values(stats().archetypeWins||{}).filter(v=>num(v)>0).length,4),
      make('v06937_tcgp_dual_type','⚡','Fusion Tactics','Win after attacking with a dual-type Pokémon.',200,()=>stats().dualTypeWins),
      make('v06937_tcgp_evolution','🌿','Growing Strong','Win with at least four evolution cards in your deck and evolve in battle.',200,()=>stats().evolutionDeckWins),
      make('v06937_tcgp_flawless','✨','Clean Sweep','Win without conceding a point.',200,()=>stats().flawlessWins),
      make('v06937_tcgp_status','☠','Status Strategy','Win after applying a Special Condition.',150,()=>stats().statusWins),
      make('v06937_tcgp_attacks','🎯','Battle Practice','Use 100 attacks in Solo battles.',300,()=>stats().attacks,100)
    ];
  }
  return {build};
});
