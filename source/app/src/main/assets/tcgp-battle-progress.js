(function(root,factory){
  let decks=root&&root.LuckyDexTCGPBattleDecks;
  if(typeof module==='object'&&module.exports){decks=require('./tcgp-battle-decks.js');module.exports=factory(decks);}else if(root){root.LuckyDexTCGPBattleProgress=factory(decks);}
})(typeof globalThis!=='undefined'?globalThis:this,function(decks){
  'use strict';
  function cleanReward(value){return{coins:Math.max(0,Number(value?.coins||0)),dust:Math.max(0,Number(value?.dust||0))};}
  function recordResult(state,battle,challenge){
    if(!state||!battle||battle.phase!=='finished'||!challenge)throw new Error('Finished battle and Solo challenge are required.');
    if(battle._luckyDexRecorded)return{alreadyRecorded:true,firstClear:false,reward:{coins:0,dust:0}};
    const save=decks.ensureBattleState(state),stats=save.stats;
    stats.matches=Math.max(0,Number(stats.matches||0))+1;
    stats.totalTurns=Math.max(0,Number(stats.totalTurns||0))+Math.max(0,Number(battle.turnNumber||0));
    const playerWon=battle.winner==='player';
    const draw=!battle.winner;
    if(playerWon){
      stats.wins=Math.max(0,Number(stats.wins||0))+1;
      const turns=Math.max(1,Number(battle.turnNumber||1));
      stats.bestWinTurns=stats.bestWinTurns==null?turns:Math.min(Number(stats.bestWinTurns),turns);
    }else if(draw)stats.draws=Math.max(0,Number(stats.draws||0))+1;
    else stats.losses=Math.max(0,Number(stats.losses||0))+1;
    const firstClear=playerWon&&!save.firstClears[challenge.id];
    if(firstClear)save.firstClears[challenge.id]=true;
    const reward=cleanReward(playerWon?(firstClear?challenge.firstClear:challenge.repeat):null);
    state.profile=state.profile&&typeof state.profile==='object'?state.profile:{};
    state.profile.coins=Math.max(0,Number(state.profile.coins||0))+reward.coins;
    state.profile.dust=Math.max(0,Number(state.profile.dust||0))+reward.dust;
    battle._luckyDexRecorded=true;
    return{alreadyRecorded:false,firstClear,reward};
  }
  return{recordResult};
});
