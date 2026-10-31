(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./tcgp-battle-decks.js'),require('./tcgp-battle-data.js'),require('./tcgp-battle-solo.js'));
  else root.LuckyDexTCGPBattleProgress=factory(root.LuckyDexTCGPBattleDecks,root.LuckyDexTCGPBattleData,root.LuckyDexTCGPBattleSolo);
})(typeof globalThis!=='undefined'?globalThis:this,function(decks,data,solo){
  'use strict';
  const num=v=>Math.max(0,Number(v)||0),zero=()=>({coins:0,dust:0}),LEDGER_LIMIT=256;
  const inc=(o,k,n=1)=>o[k]=num(o[k])+num(n);
  const ENERGY_CODE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
  const enemyStatusCount=e=>e.type==='status'?(e.affectedBySide?num(e.affectedBySide.opponent):e.affectedCount==null?1:num(e.affectedCount)):0;
  function winningArchetypes(logs){
    const attacks=logs.filter(e=>e.side==='player'&&e.type==='attack'),used=new Set();
    for(const event of attacks){const card=data.cardById(event.cardId),attack=card?.attacks?.find(a=>a.name===event.attack)||card?.attacks?.[0];for(const code of String(attack?.cost||''))if(ENERGY_CODE[code])used.add(ENERGY_CODE[code]);}
    // Colourless attackers can use any Energy; credit the types actually attached.
    if(attacks.length&&!used.size)for(const event of logs)if(event.energyType&&(event.side==='player'&&event.type==='attach'||event.type==='effectEnergy'&&num(event.attachedBySide?.player)>0))used.add(event.energyType);
    return used;
  }
  function deckKey(cards,types){let hash=2166136261;for(const c of [...cards].sort().concat(types).join('|')){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return 'deck-'+(hash>>>0).toString(36);}
  function recordResult(state,battle,challenge){
    if(!state||!battle||battle.phase!=='finished'||!challenge)throw new Error('Finished battle and Solo challenge are required.');
    const known=solo.challengeById(challenge.id);if(!known||battle.challengeId&&battle.challengeId!==known.id)throw new Error('Battle does not match its Solo challenge.');
    if(battle.testMode===true)return {alreadyRecorded:false,testMode:true,firstClear:false,reward:zero()};
    const save=decks.ensureBattleState(state),stats=save.stats;
    const ledger=Array.isArray(save.recordedBattles)?save.recordedBattles:[];
    if(battle._luckyDexRecorded||battle.battleId&&(ledger.some(r=>r.id===battle.battleId)||num(battle.issuedAt)>0&&num(battle.issuedAt)<=num(save.recordedBefore)))return {alreadyRecorded:true,firstClear:false,reward:zero()};
    inc(stats,'matches');inc(stats,'totalTurns',battle.turnNumber);
    const won=battle.winner==='player',draw=!battle.winner||battle.winner==='draw',turns=Math.max(1,num(battle.turnNumber));
    inc(stats,won?'wins':draw?'draws':'losses');
    if(won)stats.bestWinTurns=stats.bestWinTurns==null?turns:Math.min(num(stats.bestWinTurns),turns);
    const records=save.challengeRecords=save.challengeRecords||{},record=records[known.id]=records[known.id]||{matches:0,wins:0,losses:0,draws:0};
    inc(record,'matches');inc(record,won?'wins':draw?'draws':'losses');record.lastResult=won?'win':draw?'draw':'loss';
    if(won)record.bestTurns=record.bestTurns==null?turns:Math.min(num(record.bestTurns),turns);
    const firstClear=won&&!save.firstClears[known.id];if(firstClear)save.firstClears[known.id]=true;
    stats.soloClears=solo.CHALLENGES.filter(c=>save.firstClears[c.id]).length;
    save.difficultyClears=Object.fromEntries(solo.DIFFICULTIES.map(level=>[level,solo.CHALLENGES.filter(c=>c.difficulty===level).every(c=>save.firstClears[c.id])]));
    stats.difficultyWins=stats.difficultyWins||{};if(won)inc(stats.difficultyWins,known.difficulty);
    const logs=Array.isArray(battle.log)?battle.log:[],own=logs.filter(e=>e.side==='player');
    inc(stats,'attacks',own.filter(e=>e.type==='attack'||e.type==='attackFailed').length);
    inc(stats,'knockouts',logs.filter(e=>e.type==='ko'&&e.side==='opponent').length);
    inc(stats,'energyAttached',own.filter(e=>e.type==='attach').length+logs.filter(e=>e.type==='effectEnergy').reduce((n,e)=>n+num(e.attachedBySide?e.attachedBySide.player:e.side==='player'?e.totalAmount??e.amount:0),0));
    inc(stats,'trainersPlayed',own.filter(e=>e.type==='trainer').length);
    inc(stats,'evolutions',own.filter(e=>e.type==='evolve').length);
    inc(stats,'statusesApplied',own.reduce((n,e)=>n+enemyStatusCount(e),0));
    const types=battle.sides?.player?.energyTypes||battle.deckMetadata?.energyTypes||[],cards=battle.playerDeck||[];
    const key=battle.deckMetadata?.id||deckKey(cards,types),usage=save.deckUsage=save.deckUsage||{};
    const deck=usage[key]=usage[key]||{id:key,name:battle.deckMetadata?.name||'Pocket Deck',matches:0,wins:0,energyTypes:types.slice()};
    if(battle.deckMetadata?.name)deck.name=battle.deckMetadata.name;inc(deck,'matches');if(won)inc(deck,'wins');
    const favorite=Object.values(usage).sort((a,b)=>b.matches-a.matches||a.id.localeCompare(b.id))[0];stats.favoriteDeck=favorite?{id:favorite.id,name:favorite.name,matches:favorite.matches}:null;
    // Keep summaries bounded even when many temporary player deck configurations are used.
    if(Object.keys(usage).length>100){const keep=new Set(Object.values(usage).sort((a,b)=>b.matches-a.matches).slice(0,99).map(d=>d.id));keep.add(key);for(const id of Object.keys(usage))if(!keep.has(id))delete usage[id];}
    stats.archetypeWins=stats.archetypeWins||{};
    if(won){
      for(const type of winningArchetypes(logs))inc(stats.archetypeWins,type);
      const dual=own.some(e=>e.type==='attack'&&(data.cardById(e.cardId)?.types||[]).length>1);if(dual)inc(stats,'dualTypeWins');
      if(cards.map(data.cardById).filter(c=>c?.kind==='pokemon'&&c.stage!=='Basic').length>=4&&own.some(e=>e.type==='evolve'))inc(stats,'evolutionDeckWins');
      if(own.some(e=>enemyStatusCount(e)>0))inc(stats,'statusWins');
      if(battle.sides?.opponent&&num(battle.sides.opponent.points)===0)inc(stats,'flawlessWins');
    }
    const reward=firstClear?{coins:Math.min(500,num(known.firstClear.coins)),dust:Math.min(250,num(known.firstClear.dust))}:zero();
    state.profile=state.profile&&typeof state.profile==='object'?state.profile:{};state.profile.coins=num(state.profile.coins)+reward.coins;state.profile.dust=num(state.profile.dust)+reward.dust;
    if(battle.battleId){
      ledger.push({id:battle.battleId,issuedAt:num(battle.issuedAt)});ledger.sort((a,b)=>a.issuedAt-b.issuedAt);
      const removed=ledger.splice(0,Math.max(0,ledger.length-LEDGER_LIMIT));save.recordedBefore=Math.max(num(save.recordedBefore),...removed.map(r=>r.issuedAt));save.recordedBattles=ledger;
    }
    battle._luckyDexRecorded=true;
    return {alreadyRecorded:false,firstClear,reward,challengeRecord:record};
  }
  return {recordResult,LEDGER_LIMIT};
});
