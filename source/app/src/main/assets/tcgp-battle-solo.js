(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./tcgp-battle-core.js'),require('./tcgp-battle-data.js'),require('./tcgp-battle-decks.js'),require('./tcgp-deck-workspace.js'));
  else root.LuckyDexTCGPBattleSolo=factory(root.LuckyDexTCGPBattleCore,root.LuckyDexTCGPBattleData,root.LuckyDexTCGPBattleDecks,root.LuckyDexTCGPDeckWorkspace);
})(typeof globalThis!=='undefined'?globalThis:this,function(core,data,decks,workspace){
  'use strict';
  const DIFFICULTIES=['Beginner','Intermediate','Advanced','Expert'];
  const CHALLENGES=[{id:'genetic-apex-beginner-ivysaur',expansion:'Genetic Apex',difficulty:'Beginner',name:'Ivysaur Deck',description:'Build a Grass bench and evolve Ivysaur.',energyType:'Grass',energyTypes:['Grass'],deck:data.BEGINNER_IVYSAUR_DECK.slice(),firstClear:{coins:100,dust:50},repeat:{coins:0,dust:0}}];
  const recipeGroups=[['fire-pressure','water-sleep','lightning-bench'],['grass-swarm','fighting-evolution','darkness-poison','psychic-punish'],['metal-acceleration','dragon-dual','charizard-ex','sleep-control'],['blastoise-ex','venusaur-ex','dual-mega','greninja-mega']];
  recipeGroups.forEach((ids,level)=>ids.forEach(id=>{
    const recipe=workspace.RECIPES.find(r=>r.id===id);if(!recipe)throw new Error('Missing Solo deck recipe: '+id);
    const valid=decks.validateLoanerDeck(recipe.cards,recipe.energyTypes);
    if(!valid.ok||!valid.energyValid||valid.unpowerable.length||valid.missingEnergyTypes.length||valid.warnings.some(w=>w.code==='orphan'))throw new Error('Invalid Solo deck recipe: '+id);
    CHALLENGES.push({id:'luckydex-'+DIFFICULTIES[level].toLowerCase()+'-'+id,recipeId:id,expansion:'LuckyDex Solo',difficulty:DIFFICULTIES[level],name:recipe.name,description:recipe.description,energyType:recipe.energyTypes[0],energyTypes:recipe.energyTypes.slice(),deck:recipe.cards.slice(),firstClear:{coins:100+level*50,dust:50+level*25},repeat:{coins:0,dust:0}});
  }));
  function challengeById(id){return CHALLENGES.find(c=>c.id===id)||null;}
  function difficultyProgress(difficulty,state){
    const challenges=CHALLENGES.filter(c=>c.difficulty===difficulty),clears=state?.tcgpBattle?.firstClears||{};
    return {cleared:challenges.filter(c=>clears[c.id]).length,total:challenges.length};
  }
  function isUnlocked(challenge,state){
    const c=typeof challenge==='string'?challengeById(challenge):challenge;if(!c)return false;
    const level=DIFFICULTIES.indexOf(c.difficulty);return level===0||level>0&&difficultyProgress(DIFFICULTIES[level-1],state).cleared>=2;
  }
  function getChallengeProgress(challenge,state){const id=typeof challenge==='string'?challenge:challenge.id;return {cleared:!!state?.tcgpBattle?.firstClears?.[id],wins:0,losses:0,draws:0,...state?.tcgpBattle?.challengeRecords?.[id],unlocked:isUnlocked(challenge,state)};}
  function defaultFirstSide(seed){return ((((Number(seed)||0)>>>0)*1664525+1013904223)>>>0)%2===0?'player':'opponent';}
  let lastIssued=0;
  function createBattle(options){
    const opts=options||{},challenge=challengeById(opts.challengeId||CHALLENGES[0].id);if(!challenge)throw new Error('Unknown Pocket Solo challenge.');
    const testMode=opts.testMode===true,cpuDeck=testMode&&Array.isArray(opts.opponentDeck)?opts.opponentDeck.slice():challenge.deck.slice();
    const cpuEnergy=testMode?(opts.opponentEnergyTypes||decks.analyzeDeck(cpuDeck).recommendedEnergyTypes):challenge.energyTypes;
    const valid=decks.validateLoanerDeck(cpuDeck,cpuEnergy);
    if(!valid.ok||!valid.energyValid||valid.unpowerable.length||valid.missingEnergyTypes.length||valid.warnings.some(w=>w.code==='orphan'))throw new Error('CPU deck has illegal cards, incomplete evolution lines or incompatible Energy.');
    const playerDeck=Array.isArray(opts.playerDeck)?opts.playerDeck.slice():data.BEGINNER_IVYSAUR_DECK.slice();
    const battle=core.createBattle({playerDeck,opponentDeck:cpuDeck,seed:opts.seed,firstSide:opts.firstSide||defaultFirstSide(opts.seed),playerEnergyType:opts.playerEnergyType,playerEnergyTypes:opts.playerEnergyTypes,opponentEnergyType:cpuEnergy[0],opponentEnergyTypes:cpuEnergy,manualPlayerSetup:!!opts.manualPlayerSetup});
    const issuedAt=lastIssued=Math.max(Date.now(),lastIssued+1);
    return Object.assign(battle,{challengeId:challenge.id,difficulty:challenge.difficulty,battleId:'solo:'+issuedAt+':'+Math.random().toString(36).slice(2,10),issuedAt,testMode,playerDeck,deckMetadata:{id:opts.playerDeckId||null,name:opts.playerDeckName||null,energyTypes:battle.sides.player.energyTypes.slice()}});
  }
  return {DIFFICULTIES,CHALLENGES,challengeById,difficultyProgress,isUnlocked,getChallengeProgress,createBattle};
});
