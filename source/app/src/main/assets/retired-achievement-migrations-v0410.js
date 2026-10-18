(function(root){'use strict';
const RETIRED=new Set(['rock_harden_gold_perfect','pikachubeach_first_clear','pikachubeach_radness_1000','pikachubeach_hard_clear','pikachubeach_flawless','pikachubeach_triple_mixed','secret_pikachubeach_lucky_wave','secret_pikachubeach_5500']);
function scrub(state){
  if(!state||typeof state!=='object')return state;
  if(state.profile&&Array.isArray(state.profile.achievementClaims)){
    state.profile.achievementClaims=state.profile.achievementClaims.filter(id=>!RETIRED.has(id));
  }
  const games=state.arcade?.records?.games;
  if(games&&typeof games==='object'){
    for(const game of Object.values(games)){
      if(!game||!Array.isArray(game.recent))continue;
      for(const review of game.recent){
        if(review&&Array.isArray(review.achievements))review.achievements=review.achievements.filter(row=>!RETIRED.has(row?.id));
      }
    }
  }
  return state;
}
const api={scrub,RETIRED_IDS:[...RETIRED]};
root.LuckyDexRetiredAchievementMigrationV0410=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
