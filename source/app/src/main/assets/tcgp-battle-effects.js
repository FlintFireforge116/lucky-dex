(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LuckyDexTCGPBattleEffects = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';
  const ENERGY_CODE = Object.freeze({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'});
  const ENERGY_TYPES=Object.values(ENERGY_CODE);
  const TARGETS=['eventPokemon','self','selfActive','selfBench','selfPokemon','opponentActive','opponentBench','opponentPokemon','opponentAll','selfAll','selfBenchAll'];
  const CONDITIONS=['selfDamaged','selfUndamaged','opponentDamaged','opponentStatus','selfStatus','opponentEx','selfEnergyAtLeast','opponentEnergyAtLeast','benchAtLeast','selfHasTool','opponentHasTool','selfExtraEnergyAtLeast','supporterPlayed','stadiumInPlay','opponentMatches','pokemonPresent','koLastOpponentTurn','sweetsRelayLastTurn','movedFromBenchThisTurn','evolvedThisTurn','selfHasEnergyType','selfMoreEnergy','opponentHpGreater','selfRemainingHpAtMost','handSizeOneOf','sameEnergyTypeAtLeast','opponentPointsExact','combinedActiveEnergyAtLeast','teamEnergyAtLeast','teamDistinctEnergyTypesAtLeast','discardContains','equalEnergyCount','handSizesEqual','ownPointsExact','opponentHpLess','fewerPokemonInPlay','opponentHandSizeOneOf','selfDistinctEnergyTypesAtLeast','ownTurnCountAtMost','selfMatches','opponentStadiumInPlay','pokemonPresentAll','damagedByAttackLastOpponentTurn','activeMatches','ownPointsAtLeast','teamDistinctTypesAtLeast','firstAttackAfterPlay','opponentPointsGainedLastTurn','handAtLeast','selfRemainingHpAbove','selfRemainingHpFractionAtMost','selfRetreatCostAtLeast','koLastOpponentTurnFilter','selfOnBench','deckEmpty','opponentPointsAtLeast','ownTurnCountAtLeast'];
  const FILTER_KEYS=['kind','stage','subtype','name','trainerType','isEx','damaged','evolved','hasAbility','evolvesFrom','hasEnergyType','hasAnyEnergy','nameContains','hpAtMost','retreatAtLeast','energyTypeAtLeast','points','attackName','tag'];
  const STATUSES=['poison','burn','sleep','paralysis','confusion'];
  const STATS=['attackDamage','damageReduction','retreatCost','attackCost','maxHp','energyMultiplier','poisonDamageBonus','attackCostGrass','attackCostFire','attackCostWater','attackCostLightning','attackCostPsychic','attackCostFighting','attackCostDarkness','attackCostMetal','attackCostColorless','damageTaken','attackDamageAllTargets'];
  const effectTypes=Object.freeze(['noop','sequence','healSelf','heal','damage','bonusDamage','coinDamage','energyDamage','benchCountDamage','statusDamage','damageFromDamage','discardTop','benchDamage','selfDamage','attachEnergy','discardEnergy','draw','search','searchRandomBasic','switch','status','coinFlip','modifier','removeStatus','lock','preventDamage','selectedDamage','coinUntilTails','playFossil','rareCandy','discardSelf','moveEnergy','handShuffle','preventStatus','actionLock','discardTool','discardHand','benchFromDeck','allHeadsBonus','attackCoinGate','retaliateDamage','pointDamage','namedAttackCountDamage','usedAttackCountDamage','coinDamageByPokemon','randomPokemonDamage','globalRandomDiscardEnergy','retreatCostDamage','toolCountDamage','discardStadium','drain','nextAttackBonus','coinAttackGate','damageRule','evolveFromDeck','coinDamageByEnergy','discardCountDamage','fieldCountDamage','energyTypeCountDamage','statusCountDamage','handCountDamage','remainingHpDamage','trimHand','shuffleRandomHandCard','halveRemainingHp','setRemainingHp','removeRandomStatus','randomStatus','allHeadsEffect','selfDamagePenalty','deckCountDamage','attachEnergyFromDiscard','endTurn','coinRepeatEffect','coinDamageStatus','topDeckFilter','fieldCountDraw','selectedEnergyDamage','forceOpponentSwitch','revealHand','inspectTop','returnToHand','shuffleIntoDeck','discardChosenHand','shuffleChosenHand','searchChosen','takeTopMatching','selectTopToHand','swapHandWithRandomDeck','moveDamage','discardBenchPokemon','copyAttack','drawToHandSize','chooseTarget','attackRequirement','triggeredEffect','koGuard','coinDamageGuard','preventEffects','healingBlock','setNextEnergyRandom','changeRandomEnergyType','devolve','chooseOption','revealDeck','removeStatuses','topDeckDiscardBonus','coinAnyHeadsGate','shuffleDeck','returnAllTools','shuffleAllTools','evolveTargetFromDeck','moveRandomEnergy','stealRandomFromDiscard','filteredHandCountDamage','pointsGainedLastTurnDamage','koCountDamage','preventAbilityDamage','distributeEnergy','previousEvolutionAttacks','stackAttackBonus','firstDamageGuard','topDeckCountDamage','attachRandomEnergy','selfDamageIfDefenderKnockedOut','shuffleRandomCombinedHandCard','coinDiscardEnergyDamage','createCard','coinBonus','coinTierBonus','coinBenchDamage','searchThenShuffleChosen','stadiumAction','rerollEnergyZone','evolutionAsName','evolutionTimingOverride','abilitySuppression','conditionalAttackCost','additionalType','benchFromDiscard','attachRandomEnergyFromDiscard','knockOut','discardPokemon','koPointBonus','randomAttackLock','optionalDiscardBenchBonus','randomHitBonus','statusRecoveryAura','weaknessGuard','weaknessMultiplier','copyRandomTrainerEffect','healActiveReturnTrainer','copyRandomAttackFromPrivate','energyAttachStatusTrap','multiTargetDamage','scheduleDelayed','retreatRetaliation','chooseDiscardForBonus','reorderTop','redistributeEnergy','distributeDiscardEnergyDistinct','benchBasicsFromOpponentHand','forceFirstCoinHead','coinReroll','toolCapacity','repeatAttack']);
  const nonnegative=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
  const integer=n=>nonnegative(n)&&Number.isInteger(n);
  function validateEffect(effect,path){
    const at=path||'effect',errors=[];
    if(effect==null)return errors;
    if(!effect||typeof effect!=='object'||Array.isArray(effect)||!effectTypes.includes(effect.type))return [`${at}: Unsupported battle effect: ${effect&&effect.type}`];
    const need=(ok,text)=>{if(!ok)errors.push(`${at}: ${text}`);};
    if(effect.target!=null)need(TARGETS.includes(effect.target),'invalid target selector');
    if(effect.condition!=null){const c=effect.condition;need(c&&CONDITIONS.includes(c.type),'invalid condition');if(c&&c.energyType!=null)need(ENERGY_TYPES.includes(c.energyType),'invalid condition Energy type');if(c&&c.status!=null)need(STATUSES.includes(c.status),'invalid condition status');if(c&&c.amount!=null)need(nonnegative(c.amount),'invalid condition amount');if(c&&c.values!=null)need(Array.isArray(c.values)&&c.values.every(integer),'invalid condition values');if(c&&c.filter!=null){need(c.filter&&typeof c.filter==='object'&&!Array.isArray(c.filter),'invalid condition filter');for(const key of Object.keys(c.filter||{}))need(FILTER_KEYS.includes(key),'invalid condition filter key');}if(c?.type==='pokemonPresent')need(['bench','inPlay'].includes(c.zone),'invalid condition zone');}
    if(effect.energyType!=null)need(ENERGY_TYPES.includes(effect.energyType),'invalid Energy type');
    if(effect.side!=null)need((['handShuffle','benchCountDamage','fieldCountDraw'].includes(effect.type)?['self','opponent','both']:['self','opponent']).includes(effect.side),'invalid side');
    if(effect.mode!=null&&effect.type!=='koGuard')need(['add','replace'].includes(effect.mode),'invalid damage mode');
    switch(effect.type){
      case 'knockOut':case 'discardPokemon':case 'statusRecoveryAura':break;
      case 'weaknessGuard':need(['opponentTurn','whileInPlay'].includes(effect.duration),'invalid weakness guard duration');break;
      case 'weaknessMultiplier':need(Number(effect.multiplier)>=1,'invalid weakness multiplier');break;
      case 'copyRandomTrainerEffect':need(['opponentHand','opponentDeck'].includes(effect.source),'invalid copied Trainer source');need(effect.trainerType==='Supporter','copyRandomTrainerEffect currently supports Supporters');break;
      case 'copyRandomAttackFromPrivate':need(effect.source==='opponentHandAndDeck','invalid random copied attack source');break;
      case 'energyAttachStatusTrap':need(STATUSES.includes(effect.status),'invalid Energy-attachment trap status');break;
      case 'multiTargetDamage':need(['opponentPokemon','opponentBench'].includes(effect.target),'invalid multi-target selector');need(integer(effect.count)&&effect.count>0,'invalid multi-target count');need(nonnegative(effect.amount),'invalid multi-target damage');break;
      case 'scheduleDelayed':need(effect.event==='endOpponentNextTurn','invalid delayed event');need(['defender','selectedSpot'].includes(effect.targetMode),'invalid delayed target mode');need(!!effect.effect,'missing delayed effect');errors.push(...validateEffect(effect.effect,`${at}.effect`));break;
      case 'retreatRetaliation':need(nonnegative(effect.amount),'invalid retreat retaliation damage');break;
      case 'healActiveReturnTrainer':need(nonnegative(effect.amount),'invalid heal amount');break;
      case 'koPointBonus':need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid KO point bonus');break;
      case 'randomAttackLock':need(['opponentTurn','nextOwnTurn'].includes(effect.duration),'invalid random attack lock duration');break;
      case 'optionalDiscardBenchBonus':need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid optional discard bonus');break;
      case 'randomHitBonus':need(typeof effect.attackName==='string'&&effect.attackName.length>0,'missing random-hit attack name');need(integer(effect.amount)&&effect.amount>0,'invalid random-hit bonus');break;
      case 'benchFromDiscard':need(effect.side==='opponent','benchFromDiscard currently requires opponent side');need(integer(effect.amount)&&effect.amount>0,'invalid bench-from-discard count');break;
      case 'attachRandomEnergyFromDiscard':need(integer(effect.amount)&&effect.amount>0,'invalid random discard Energy amount');break;
      case 'evolutionAsName':need(typeof effect.name==='string'&&effect.name.length>0,'evolutionAsName requires name');break;
      case 'evolutionTimingOverride':need(effect.firstTurn===true||effect.sameTurn===true,'evolutionTimingOverride requires timing permission');break;
      case 'abilitySuppression':need(['whileActive','whileInPlay'].includes(effect.duration),'invalid ability suppression duration');if(effect.scope!=null)need(['self','team','both','opponent'].includes(effect.scope),'invalid ability suppression scope');break;
      case 'conditionalAttackCost':need(typeof effect.cost==='string'&&/^[GRWLPFDM C]*$/.test(effect.cost.replace(/ /g,'')),'conditionalAttackCost requires Energy cost');break;
      case 'additionalType':need(Array.isArray(effect.types)&&effect.types.length>0&&effect.types.every(x=>ENERGY_TYPES.includes(x)),'additionalType requires valid types');break;
      case 'sequence':need(Array.isArray(effect.effects)&&effect.effects.length>0,'sequence requires effects');for(const [i,e] of (Array.isArray(effect.effects)?effect.effects:[]).entries()){need(e!=null,'sequence cannot contain null');errors.push(...validateEffect(e,`${at}.effects[${i}]`));}break;
      case 'moveEnergy':need(['self','selfBench','selfBenchAll','selfAll','opponentActive'].includes(effect.source),'invalid Energy movement source');need(['self','selfActive','selfBench'].includes(effect.target),'invalid Energy movement destination');need(!(effect.source==='selfBench'&&effect.target==='selfBench'),'two selected Bench endpoints require separate selection');need(effect.amount==='all'||integer(effect.amount),'invalid moved Energy amount');if(effect.allowedEnergyTypes!=null)need(Array.isArray(effect.allowedEnergyTypes)&&effect.allowedEnergyTypes.every(x=>ENERGY_TYPES.includes(x)),'invalid allowed moved Energy types');break;
      case 'handShuffle':need(effect.draw==='same'||effect.draw==='opponentHandCount'||effect.draw==='pointsRemaining'||integer(effect.draw),'invalid hand redraw amount');break;
      case 'preventStatus':need(['whileInPlay','whileActive'].includes(effect.duration),'invalid status immunity duration');if(effect.status!=null)need(STATUSES.includes(effect.status),'invalid prevented status');if(effect.scope!=null)need(['self','team'].includes(effect.scope),'invalid status scope');break;
      case 'coinUntilTails':need(!!effect.effect,'coinUntilTails requires effect');errors.push(...validateEffect(effect.effect,`${at}.effect`));break;
      case 'lock':need(['attack','retreat'].includes(effect.action),'invalid locked action');need(['nextOwnTurn','opponentTurn','whileInPlay'].includes(effect.duration),'invalid lock duration');break;
      case 'preventDamage':need(['opponentTurn','whileInPlay','whileActive'].includes(effect.duration),'invalid prevention duration');if(effect.maxDamage!=null)need(nonnegative(effect.maxDamage),'invalid prevention threshold');if(effect.attackerFilter!=null){need(effect.attackerFilter&&typeof effect.attackerFilter==='object'&&!Array.isArray(effect.attackerFilter),'invalid attacker filter');for(const key of Object.keys(effect.attackerFilter||{}))need(FILTER_KEYS.includes(key),'invalid attacker filter key');}break;
      case 'coinFlip':need(!!effect.heads,'coinFlip requires heads effect');errors.push(...validateEffect(effect.heads,`${at}.heads`),...validateEffect(effect.tails,`${at}.tails`));break;
      case 'status':need(!['selfAll','selfBenchAll','selfBench','opponentBench','selfPokemon','opponentPokemon'].includes(effect.target),'special conditions require Active Pokemon');need(STATUSES.includes(effect.status),'invalid special condition');if(effect.amount!=null)need(nonnegative(effect.amount),'invalid status damage');if(effect.recoveryCoins!=null)need(integer(effect.recoveryCoins)&&effect.recoveryCoins>0,'invalid status recovery coin count');break;
      case 'noop':case 'removeStatus':case 'removeRandomStatus':case 'switch':case 'discardSelf':case 'rareCandy':case 'discardTool':case 'halveRemainingHp':case 'forceOpponentSwitch':case 'revealHand':case 'inspectTop':case 'returnToHand':case 'shuffleIntoDeck':case 'discardChosenHand':case 'shuffleChosenHand':case 'searchChosen':case 'takeTopMatching':case 'selectTopToHand':case 'swapHandWithRandomDeck':case 'moveDamage':case 'discardBenchPokemon':case 'preventAbilityDamage':case 'shuffleDeck':case 'returnAllTools':case 'shuffleAllTools':case 'evolveTargetFromDeck':case 'moveRandomEnergy':case 'stealRandomFromDiscard':case 'previousEvolutionAttacks':break;
      case 'copyAttack':need(['opponentActive','opponentPokemon','selfBench'].includes(effect.source),'invalid copied-attack source');break;
      case 'stackAttackBonus':need(typeof effect.attackName==='string'&&effect.attackName.length>0,'missing stacked attack name');need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid stacked attack bonus');break;
      case 'firstDamageGuard':break;
      case 'topDeckCountDamage':need(integer(effect.count)&&effect.count>0,'invalid top deck count');need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid top deck damage amount');break;
      case 'attachRandomEnergy':need(Array.isArray(effect.energyTypes)&&effect.energyTypes.length>0&&effect.energyTypes.every(x=>ENERGY_TYPES.includes(x)),'invalid random Energy pool');need(integer(effect.amount)&&effect.amount>0,'invalid random Energy attach amount');break;
      case 'selfDamageIfDefenderKnockedOut':need(nonnegative(effect.amount),'invalid conditional self damage');break;
      case 'shuffleRandomCombinedHandCard':break;
      case 'coinDiscardEnergyDamage':need(integer(effect.coins)&&effect.coins>0,'invalid coin-discard count');need(nonnegative(effect.amount),'invalid coin-discard damage');need(ENERGY_TYPES.includes(effect.energyType),'invalid coin-discard Energy');break;
      case 'createCard':need(typeof effect.cardId==='string'&&effect.cardId.length>0,'missing created card id');need(integer(effect.amount||1),'invalid created card count');break;
      case 'coinBonus':need(integer(effect.amount)&&effect.amount>0,'invalid coin bonus');need(typeof effect.attackName==='string'&&effect.attackName.length>0,'missing coin-bonus attack');break;
      case 'coinTierBonus':need(integer(effect.coins)&&effect.coins>0,'invalid tier coin count');need(effect.tiers&&typeof effect.tiers==='object','missing coin tiers');break;
      case 'coinBenchDamage':need(integer(effect.coins)&&effect.coins>0,'invalid bench coin count');need(nonnegative(effect.amount),'invalid bench coin damage');break;
      case 'searchThenShuffleChosen':need(integer(effect.amount)&&effect.amount>0,'invalid search amount');need(effect.filter&&typeof effect.filter==='object','missing search filter');break;
      case 'stadiumAction':need(!!effect.effect,'stadium action requires child effect');errors.push(...validateEffect(effect.effect,`${at}.effect`));break;
      case 'rerollEnergyZone':break;
      case 'chooseDiscardForBonus':need(['bench','hand'].includes(effect.zone),'invalid discard-bonus zone');need(integer(effect.max)&&effect.max>0,'invalid discard-bonus maximum');need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid discard-bonus amount');break;
      case 'reorderTop':need(['self','opponent'].includes(effect.deckSide||'self'),'invalid reorder deck side');if(effect.count!=null)need(integer(effect.count)&&effect.count>0,'invalid reorder count');if(effect.countPerType!=null)need(ENERGY_TYPES.includes(effect.countPerType),'invalid reorder counted type');break;
      case 'redistributeEnergy':break;
      case 'distributeDiscardEnergyDistinct':need(integer(effect.amount)&&effect.amount>0,'invalid distinct discard Energy amount');break;
      case 'benchBasicsFromOpponentHand':break;
      case 'forceFirstCoinHead':break;
      case 'coinReroll':need(['attack','trainer'].includes(effect.scope),'invalid coin reroll scope');break;
      case 'toolCapacity':need(integer(effect.amount)&&effect.amount>=1,'invalid tool capacity');break;
      case 'repeatAttack':need(nonnegative(effect.secondDamage),'invalid repeated attack damage');break;
      case 'distributeEnergy':need(['zone','self'].includes(effect.source),'invalid distributed Energy source');need(['selfBench','selfPokemon'].includes(effect.target),'invalid distributed Energy target');need(effect.amount==='all'||effect.amount==null||integer(effect.amount),'invalid distributed Energy amount');if(effect.energyType!=null)need(ENERGY_TYPES.includes(effect.energyType),'invalid distributed Energy type');if(effect.energyTypes!=null)need(Array.isArray(effect.energyTypes)&&effect.energyTypes.length>0&&effect.energyTypes.every(x=>ENERGY_TYPES.includes(x)),'invalid distributed Energy types');if(effect.coins!=null)need(integer(effect.coins)&&effect.coins>0,'invalid distributed Energy coin count');break;
      case 'drawToHandSize':need(effect.size!=null?integer(effect.size):['self','opponent'].includes(effect.matchSide||'opponent'),'invalid hand-size target');break;
      case 'attackRequirement':need(!!effect.condition,'attackRequirement requires condition');break;
      case 'triggeredEffect':need(['onAttach','endTurn','beginTurn','checkup','damagedByAttack','energyAttached','evolved','benched','retreat','knockedOut','opponentKnockedOut'].includes(effect.event),'invalid persistent trigger event');need(!!effect.effect,'triggeredEffect requires child effect');if(effect.turn!=null)need(['owner','opponent','any'].includes(effect.turn),'invalid trigger turn');errors.push(...validateEffect(effect.effect,`${at}.effect`));break;
      case 'koGuard':need(['surviveCoin','noPointsCoin','returnToHand','survive'].includes(effect.mode),'invalid KO guard mode');if(effect.remainingHp!=null)need(nonnegative(effect.remainingHp),'invalid KO remaining HP');break;
      case 'coinDamageGuard':if(effect.reduction!=null)need(nonnegative(effect.reduction),'invalid coin guard reduction');break;
      case 'preventEffects':need(['whileInPlay','whileActive'].includes(effect.duration),'invalid effect prevention duration');break;
      case 'healingBlock':break;
      case 'stadiumAction':applyEffect(effect.effect,ctx);break;
      case 'rerollEnergyZone':{const ss=own(ctx);if(!ss.energyAvailable||ss.energyUsed)break;ss.energyType=ss.nextEnergyType||ss.energyTypes[0];ss.nextEnergyType=ss.energyTypes.length>1?ss.energyTypes[Math.floor(ctx.random(ctx.state)*ss.energyTypes.length)]:ss.energyTypes[0];log({type:'energyZoneReroll',energyType:ss.energyType});break;}
      case 'setNextEnergyRandom':need(['self','opponent'].includes(effect.side||'opponent'),'invalid next-Energy side');need(Array.isArray(effect.energyTypes)&&effect.energyTypes.length&&effect.energyTypes.every(x=>ENERGY_TYPES.includes(x)&&x!=='Colorless'),'invalid generated Energy types');break;
      case 'changeRandomEnergyType':need(Array.isArray(effect.energyTypes)&&effect.energyTypes.length&&effect.energyTypes.every(x=>ENERGY_TYPES.includes(x)&&x!=='Colorless'),'invalid replacement Energy types');break;
      case 'devolve':break;
      case 'chooseOption':need(Array.isArray(effect.options)&&effect.options.length>0,'chooseOption requires options');for(const [i,opt] of (effect.options||[]).entries()){need(opt&&typeof opt.label==='string','choice option requires label');need(!!opt?.effect,'choice option requires effect');errors.push(...validateEffect(opt?.effect,`${at}.options[${i}].effect`));}break;
      case 'revealDeck':if(effect.side!=null)need(['self','opponent'].includes(effect.side),'invalid reveal side');break;
      case 'removeStatuses':need(Array.isArray(effect.statuses)&&effect.statuses.length>0&&effect.statuses.every(x=>STATUSES.includes(x)),'invalid removed statuses');break;
      case 'topDeckDiscardBonus':need(nonnegative(effect.amount),'invalid top-deck bonus');need(effect.filter&&typeof effect.filter==='object','topDeckDiscardBonus requires filter');break;
      case 'coinAnyHeadsGate':need(integer(effect.coins)&&effect.coins>0,'invalid coin gate count');break;
      case 'chooseTarget':need(['selfPokemon','selfBench','opponentPokemon','opponentBench'].includes(effect.target),'invalid choice target');need(!!effect.effect,'chooseTarget requires child effect');errors.push(...validateEffect(effect.effect,`${at}.effect`));break;
      case 'actionLock':need(['Supporter','Item','Trainer','Stadium','EnergyActive','Evolution','EvolutionActive'].includes(effect.cardType),'invalid locked card type');need(['opponentTurn','whileActive','whileInPlay'].includes(effect.duration),'invalid action-lock duration');break;
      case 'discardHand':need(['self','opponent'].includes(effect.side),'invalid discard-hand side');need(integer(effect.amount),'invalid discarded hand count');break;
      case 'benchFromDeck':need(integer(effect.amount),'invalid bench count');need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'benchFromDeck requires filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid bench filter');break;
      case 'allHeadsBonus':need(integer(effect.coins)&&effect.coins>0,'invalid all-heads coin count');need(nonnegative(effect.amount),'invalid all-heads bonus');break;
      case 'attackCoinGate':need(['opponentTurn','whileActive'].includes(effect.duration),'invalid attack gate duration');break;
      case 'retaliateDamage':need(['opponentTurn','whileActive'].includes(effect.duration),'invalid retaliation duration');need(nonnegative(effect.amount),'invalid retaliation amount');break;
      case 'pointDamage':need(nonnegative(effect.amount),'invalid point multiplier');break;
      case 'namedAttackCountDamage':case 'usedAttackCountDamage':need(nonnegative(effect.amount),'invalid named-attack multiplier');need(typeof effect.attackName==='string'&&effect.attackName.length>0,'missing counted attack name');break;
      case 'coinDamageByPokemon':need(nonnegative(effect.amount),'invalid per-head damage');break;
      case 'randomPokemonDamage':need((integer(effect.hits)&&effect.hits>0)||ENERGY_TYPES.includes(effect.perEnergyType),'invalid random hit count');need(nonnegative(effect.amount),'invalid random hit damage');if(effect.zone!=null)need(['all','bench'].includes(effect.zone),'invalid random target zone');if(effect.bothSides!=null)need(typeof effect.bothSides==='boolean','invalid both-sides flag');if(effect.excludeSelf!=null)need(typeof effect.excludeSelf==='boolean','invalid exclude-self flag');break;
      case 'globalRandomDiscardEnergy':if(effect.amount!=null)need(integer(effect.amount)&&effect.amount>0,'invalid global Energy discard amount');break;
      case 'retreatCostDamage':case 'toolCountDamage':need(nonnegative(effect.amount),'invalid dynamic multiplier');break;
      case 'discardStadium':case 'drain':case 'evolveFromDeck':case 'damageRule':break;
      case 'nextAttackBonus':need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid next attack bonus');need(typeof effect.attackName==='string'&&effect.attackName.length>0,'missing boosted attack name');break;
      case 'coinAttackGate':need(!!effect.heads,'coin attack gate requires heads effect');errors.push(...validateEffect(effect.heads,`${at}.heads`));break;
      case 'coinDamageByEnergy':need(nonnegative(effect.amount),'invalid per-Energy head damage');break;
      case 'discardCountDamage':case 'fieldCountDamage':case 'energyTypeCountDamage':case 'statusCountDamage':case 'handCountDamage':need(nonnegative(effect.amount),'invalid dynamic multiplier');break;
      case 'remainingHpDamage':case 'selfDamagePenalty':break;
      case 'deckCountDamage':need(nonnegative(effect.amount),'invalid deck-count multiplier');need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'deckCountDamage requires filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid deck-count filter');break;
      case 'randomStatus':need(Array.isArray(effect.statuses)&&effect.statuses.length>0&&effect.statuses.every(x=>STATUSES.includes(x)),'invalid random status list');break;
      case 'allHeadsEffect':need(integer(effect.coins)&&effect.coins>0,'invalid all-heads coin count');need(!!effect.heads,'allHeadsEffect requires heads effect');errors.push(...validateEffect(effect.heads,`${at}.heads`));break;
      case 'attachEnergyFromDiscard':need(integer(effect.amount)&&effect.amount>0,'invalid discard Energy attach amount');if(effect.energyType!=null)need(ENERGY_TYPES.includes(effect.energyType),'invalid discard Energy type');break;
      case 'endTurn':break;
      case 'coinRepeatEffect':need(integer(effect.coins)&&effect.coins>0,'invalid repeated coin count');need(!!effect.effect,'coinRepeatEffect requires child effect');if(effect.zeroDamageIfNoHeads!=null)need(typeof effect.zeroDamageIfNoHeads==='boolean','invalid zero-damage flag');errors.push(...validateEffect(effect.effect,`${at}.effect`));break;
      case 'coinDamageStatus':need(integer(effect.coins)&&effect.coins>0,'invalid damage/status coin count');need(nonnegative(effect.amount),'invalid per-head damage');need(integer(effect.minHeads)&&effect.minHeads>0&&effect.minHeads<=effect.coins,'invalid status head threshold');need(STATUSES.includes(effect.status),'invalid threshold status');break;
      case 'topDeckFilter':need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'topDeckFilter requires filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid top-deck filter');break;
      case 'fieldCountDraw':need(['self','both'].includes(effect.side),'invalid field-count side');need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'fieldCountDraw requires filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid field-count filter');break;
      case 'selectedEnergyDamage':need(['opponentPokemon','opponentBench'].includes(effect.target),'invalid selected Energy-damage target');need(nonnegative(effect.amount),'invalid selected Energy multiplier');break;
      case 'trimHand':need(['self','opponent'].includes(effect.side),'invalid trim-hand side');need(integer(effect.maxSize),'invalid trim-hand size');break;
      case 'shuffleRandomHandCard':need(['self','opponent'].includes(effect.side),'invalid shuffle-hand side');break;
      case 'setRemainingHp':need(nonnegative(effect.amount),'invalid remaining HP amount');break;
      case 'playFossil':need(nonnegative(effect.hp)&&effect.hp>0,'invalid Fossil HP');need(effect.subtype==='Colorless','invalid Fossil type');need(effect.canRetreat===false,'Fossil cannot retreat');break;
      case 'modifier':need(STATS.includes(effect.stat),'invalid modifier stat');need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid modifier amount');need(['turn','opponentTurn','nextOwnTurn','whileActive','whileInPlay'].includes(effect.duration),'invalid duration');if(effect.scope!=null)need(['self','team','active','both','opponentActive'].includes(effect.scope),'invalid modifier scope');break;
      case 'discardTop':need(integer(effect.amount),'invalid discarded card count');break;
      case 'damageFromDamage':need(['self','opponent'].includes(effect.source),'invalid damage source');need(nonnegative(effect.amount),'invalid damage multiplier');break;
      case 'discardEnergy':need(effect.amount==='all'||integer(effect.amount),'invalid discarded Energy amount');break;
      case 'search':need(['deck','discard'].includes(effect.source||'deck'),'invalid search source');need(effect.random===true,'only random filtered searches are supported');need(integer(effect.amount),'invalid search amount');need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'search requires filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid search filter');break;
      default:need(effect.type==='bonusDamage'?typeof effect.amount==='number'&&Number.isFinite(effect.amount):nonnegative(effect.amount),'invalid amount');
    }
    if(effect.type==='statusDamage')need(STATUSES.includes(effect.status),'invalid damage status');
    if(effect.type==='coinDamage')need((integer(effect.coins)&&effect.coins<=100)||effect.coins==='untilTails','invalid coin count');
    if(effect.type==='energyDamage'){need(['self','opponent'].includes(effect.source),'invalid energy source');if(effect.extraAbove!=null)need(integer(effect.extraAbove),'invalid extra Energy threshold');if(effect.energyTypes!=null)need(Array.isArray(effect.energyTypes)&&effect.energyTypes.every(x=>ENERGY_TYPES.includes(x)),'invalid Energy damage types');}
    if(effect.type==='attachEnergy'){need(integer(effect.amount),'invalid generated Energy count');need(ENERGY_TYPES.includes(effect.energyType),'attachEnergy requires Energy type');}
    if(['draw','searchRandomBasic'].includes(effect.type))need(integer(effect.amount),'invalid card count');
    if(effect.type==='selectedDamage')need(['opponentPokemon','opponentBench'].includes(effect.target),'invalid selected attack target');
    if(effect.sourceFilter!=null){need(effect.sourceFilter&&typeof effect.sourceFilter==='object'&&!Array.isArray(effect.sourceFilter),'invalid source filter');for(const key of Object.keys(effect.sourceFilter||{}))need(['kind','stage','subtype','name','trainerType','isEx','damaged'].includes(key),'invalid source filter key');}
    if(effect.filter!=null){need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'invalid target filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid target filter key');}
    if(effect.opponentFilter!=null){need(effect.type==='modifier','opponent filter requires modifier');need(effect.opponentFilter&&typeof effect.opponentFilter==='object'&&!Array.isArray(effect.opponentFilter),'invalid opposing Pokemon filter');for(const key of Object.keys(effect.opponentFilter||{}))need(FILTER_KEYS.includes(key),'invalid opposing Pokemon filter key');}
    if(effect.pokemonType!=null)need([...ENERGY_TYPES,'Colorless','Dragon'].includes(effect.pokemonType),'invalid Pokemon type');
    return errors;
  }
  function supportsEffect(effect){return typeof effect==='string'?effectTypes.includes(effect):validateEffect(effect).length===0;}
  function assertEffect(effect){const errors=validateEffect(effect);if(errors.length)throw new Error(errors.join('; '));}
  function totalEnergy(energy){return Object.values(energy||{}).reduce((n,v)=>n+Math.max(0,Number(v)||0),0);}
  function canPayCost(energy,cost){const pool={...(energy||{})};const symbols=String(cost||'').split('').filter(Boolean);for(const symbol of symbols){if(symbol==='C')continue;const type=ENERGY_CODE[symbol];if(!type||Number(pool[type]||0)<=0)return false;pool[type]-=1;}return totalEnergy(pool)>=symbols.filter(s=>s==='C').length;}
  function spendGenericEnergy(energy,amount){let left=Math.max(0,Number(amount||0));const next={...(energy||{})};for(const type of Object.keys(next).sort((a,b)=>Number(next[b]||0)-Number(next[a]||0))){const n=Math.min(left,Math.max(0,Number(next[type]||0)));next[type]-=n;left-=n;if(!left)break;}return left?null:next;}
  function spendGenericEnergyWithValue(energy,amount,values){let left=Math.max(0,Number(amount||0)),next={...(energy||{})};const types=Object.keys(next).sort((a,b)=>(Number(values?.[b]||1)-Number(values?.[a]||1))||Number(next[b]||0)-Number(next[a]||0));for(const type of types){const value=Math.max(1,Number(values?.[type]||1));while(left>0&&Number(next[type]||0)>0){next[type]--;left=Math.max(0,left-value);}}return left?null:next;}
  const hasType=(card,type)=>(Array.isArray(card?.types)&&card.types.length?card.types:[card?.subtype]).includes(type);
  function attackDamage(attackerCard,attack,defenderCard){let n=Math.max(0,Number(attack&&attack.damage||0));if(n>0&&attackerCard&&defenderCard&&hasType(attackerCard,defenderCard.weakness))n+=20;return n;}
  function own(ctx){return ctx.state.sides[ctx.side];}
  function other(ctx){return ctx.state.sides[ctx.foeSide];}
  function pokemonOn(side){return [side.active,...side.bench].filter(Boolean);}
  function toolsOf(slot){return slot?[slot.tool,...(slot.extraTools||[])].filter(Boolean):[];}
  function removeToolAt(slot,index){const list=toolsOf(slot);if(index<0||index>=list.length)return null;const [removed]=list.splice(index,1);slot.tool=list.shift()||null;slot.extraTools=list;return removed;}
  function conditionMatches(c,ctx){
    if(!c)return true;
    const a=ctx.attacker,d=ctx.defender;
    switch(c.type){
      case 'stadiumInPlay':return !!ctx.state.stadium;
      case 'selfHasTool':return toolsOf(a).length>0;
      case 'opponentHasTool':return toolsOf(d).length>0;
      case 'selfUndamaged':return !!a&&Number(a.damage||0)===0;
      case 'opponentMatches':return !!d&&matchesFilter(ctx.cardById(d.cardId),c.filter,d);
      case 'selfMatches':return !!a&&matchesFilter(ctx.cardById(a.cardId),c.filter,a);
      case 'pokemonPresent':{const ss=c.side==='opponent'?other(ctx):own(ctx);return (c.zone==='bench'?ss.bench:pokemonOn(ss)).some(s=>s&&(!c.excludeSelf||s!==a)&&matchesFilter(ctx.cardById(s.cardId),c.filter,s));}
      case 'supporterPlayed':return !!own(ctx).supporterUsed;
      case 'selfExtraEnergyAtLeast':{const e=a?.energy||{},cost=String(ctx.attack?.cost||'');const required=c.energyType?cost.split('').filter(k=>ENERGY_CODE[k]===c.energyType).length:cost.length;return (c.energyType?Number(e[c.energyType]||0):totalEnergy(e))-required>=Number(c.amount||0)&&totalEnergy(e)-cost.length>=Number(c.amount||0);}
      case 'selfDamaged':return Number(a&&a.damage)>0;
      case 'opponentDamaged':return Number(d&&d.damage)>0;
      case 'selfStatus':return !!(a&&a.conditions&&(c.status?a.conditions[c.status]:Object.keys(a.conditions).length));
      case 'opponentStatus':return !!(d&&d.conditions&&(c.status?d.conditions[c.status]:Object.keys(d.conditions).length));
      case 'opponentEx':{const card=d&&ctx.cardById(d.cardId);return !!(card&&(card.isEx||card.points===2||/ ex$/.test(card.name)));}
      case 'selfEnergyAtLeast':case 'opponentEnergyAtLeast':{const e=(c.type==='selfEnergyAtLeast'?a:d)?.energy||{};return (c.energyType?Number(e[c.energyType]||0):totalEnergy(e))>=Number(c.amount||0);}
      case 'benchAtLeast':return (c.side==='opponent'?other(ctx):own(ctx)).bench.length>=Number(c.amount||0);
      case 'koLastOpponentTurn':return Number(own(ctx).lastKnockoutTurn||-99)===Number(ctx.state.turnNumber)-1;
      case 'sweetsRelayLastTurn':return own(ctx).lastAttackName==='Sweets Relay'&&Number(own(ctx).lastAttackTurn||-99)===Number(ctx.state.turnNumber)-2;
      case 'movedFromBenchThisTurn':return Number(a?.movedToActiveTurn||-99)===Number(ctx.state.turnNumber);
      case 'evolvedThisTurn':return Number(a?.evolvedOnTurn||-99)===Number(ctx.state.turnNumber);
      case 'selfHasEnergyType':return Number(a?.energy?.[c.energyType]||0)>=1;
      case 'selfMoreEnergy':return totalEnergy(a?.energy)>totalEnergy(d?.energy);
      case 'opponentHpGreater':{const ownHp=(ctx.maxHp?ctx.maxHp(ctx.side,a):Number(ctx.cardById(a?.cardId)?.hp||0))-Number(a?.damage||0),oppHp=(ctx.maxHp?ctx.maxHp(ctx.foeSide,d):Number(ctx.cardById(d?.cardId)?.hp||0))-Number(d?.damage||0);return oppHp>ownHp;}
      case 'selfRemainingHpAtMost':{const hp=(ctx.maxHp?ctx.maxHp(ctx.side,a):Number(ctx.cardById(a?.cardId)?.hp||0))-Number(a?.damage||0);return hp<=Number(c.amount||0);}
      case 'handSizeOneOf':return (c.values||[]).includes(own(ctx).hand.length);
      case 'sameEnergyTypeAtLeast':{const ae=a?.energy||{},de=d?.energy||{};return Object.keys(ae).some(type=>Math.min(Number(ae[type]||0),Number(de[type]||0))>=Number(c.amount||0));}
      case 'opponentPointsExact':return Number(other(ctx).points||0)===Number(c.amount||0);
      case 'combinedActiveEnergyAtLeast':return totalEnergy(a?.energy)+totalEnergy(d?.energy)>=Number(c.amount||0);
      case 'teamEnergyAtLeast':return pokemonOn(own(ctx)).reduce((n,s)=>n+(c.energyType?Number(s.energy?.[c.energyType]||0):totalEnergy(s.energy)),0)>=Number(c.amount||0);
      case 'teamDistinctEnergyTypesAtLeast':{const types=new Set();for(const s of pokemonOn(own(ctx)))for(const [type,n] of Object.entries(s.energy||{}))if(Number(n)>0)types.add(type);return types.size>=Number(c.amount||0);}
      case 'discardContains':return (own(ctx).discard||[]).some(r=>matchesFilter(ctx.cardById(r.cardId),c.filter));
      case 'equalEnergyCount':return totalEnergy(a?.energy)===totalEnergy(d?.energy);
      case 'handSizesEqual':return own(ctx).hand.length===other(ctx).hand.length;
      case 'ownPointsExact':return Number(own(ctx).points||0)===Number(c.amount||0);
      case 'opponentHpLess':{const ownHp=(ctx.maxHp?ctx.maxHp(ctx.side,a):Number(ctx.cardById(a?.cardId)?.hp||0))-Number(a?.damage||0),oppHp=(ctx.maxHp?ctx.maxHp(ctx.foeSide,d):Number(ctx.cardById(d?.cardId)?.hp||0))-Number(d?.damage||0);return oppHp<ownHp;}
      case 'fewerPokemonInPlay':return pokemonOn(own(ctx)).length<pokemonOn(other(ctx)).length;
      case 'opponentHandSizeOneOf':return (c.values||[]).includes(other(ctx).hand.length);
      case 'selfDistinctEnergyTypesAtLeast':return Object.values(a?.energy||{}).filter(n=>Number(n)>0).length>=Number(c.amount||0);
      case 'ownTurnCountAtMost':return Number(own(ctx).turnCount||0)<=Number(c.amount||0);
      case 'opponentStadiumInPlay':return !!ctx.state.stadium&&ctx.state.stadium.ownerSide===ctx.foeSide;
      case 'pokemonPresentAll':{const ss=c.side==='opponent'?other(ctx):own(ctx),slots=c.zone==='bench'?ss.bench:pokemonOn(ss);return (c.names||[]).every(name=>slots.some(s=>s&&ctx.cardById(s.cardId)?.name===name));}
      case 'damagedByAttackLastOpponentTurn':return !!a?.lastDamageSource?.attack&&a.lastDamageSource.side===ctx.foeSide&&Number(a.lastDamageSource.turn)===Number(ctx.state.turnNumber)-1;
      case 'activeMatches':{const slot=own(ctx).active;return !!slot&&matchesFilter(ctx.cardById(slot.cardId),c.filter,slot);}
      case 'ownPointsAtLeast':return Number(own(ctx).points||0)>=Number(c.amount||0);
      case 'teamDistinctTypesAtLeast':{const types=new Set(pokemonOn(own(ctx)).map(s=>ctx.cardById(s.cardId)?.subtype).filter(Boolean));return types.size>=Number(c.amount||0);}
      case 'firstAttackAfterPlay':return Number(a?.attackUseCount||0)===0;
      case 'opponentPointsGainedLastTurn':return Number(other(ctx).pointsGainedLastTurn||0);
      case 'handAtLeast':return own(ctx).hand.length>=Number(c.amount||0);
      case 'selfRemainingHpAbove':{const hp=(ctx.maxHp?ctx.maxHp(ctx.side,a):Number(ctx.cardById(a?.cardId)?.hp||0))-Number(a?.damage||0);return hp>Number(c.amount||0);}
      case 'selfRemainingHpFractionAtMost':{const max=(ctx.maxHp?ctx.maxHp(ctx.side,a):Number(ctx.cardById(a?.cardId)?.hp||0)),remaining=max-Number(a?.damage||0);return max>0&&remaining/max<=Number(c.fraction||0);}
      case 'selfRetreatCostAtLeast':{const base=Number(ctx.cardById(a?.cardId)?.retreat||0),cost=Math.max(0,base+modifierAmount(ctx.state,ctx.side,a,'retreatCost',ctx.cardById));return cost>=Number(c.amount||0);}
      case 'koLastOpponentTurnFilter':{if(Number(own(ctx).lastKnockoutTurn||-99)!==Number(ctx.state.turnNumber)-1)return false;return (own(ctx).lastKnockedOutCardIds||[]).some(id=>matchesFilter(ctx.cardById(id),c.filter));}
      case 'selfOnBench':return !!a&&own(ctx).bench.includes(a);
      case 'deckEmpty':return own(ctx).deck.length===0;
      case 'opponentPointsAtLeast':return Number(other(ctx).points||0)>=Number(c.amount||0);
      case 'ownTurnCountAtLeast':return Number(own(ctx).turnCount||0)>=Number(c.amount||0);
      default:throw new Error(`Unsupported condition: ${c.type}`);
    }
  }
  function coin(ctx){if(typeof ctx.random!=='function')throw new Error('Seeded battle RNG is required.');const ss=own(ctx);if(ss&&Number(ss.forceFirstCoinHeadTurn)===Number(ctx.state.turnNumber)&&!ss.forceFirstCoinHeadUsed&&(ctx.isAttack||ctx.isAbility||ctx.isTrainer)){ss.forceFirstCoinHeadUsed=true;return true;}return ctx.random(ctx.state)<0.5;}
  function selected(ctx,side){const a=ctx.action||{};const target=a.choiceTarget||a.effectTarget||a.target;const idx=a.choiceBenchIndex!=null?a.choiceBenchIndex:(a.effectBenchIndex==null?a.benchIndex:a.effectBenchIndex);return /Bench$/.test(target)||target==='bench'?(side.bench||[]).find(s=>s&&Number(s.benchSlot)===Number(idx))||null:side.active;}
  function targets(selector,ctx){
    switch(selector||'self'){
      case 'eventPokemon':return ctx.eventData?.target?[ctx.eventData.target]:[];
      case 'self':return ctx.attacker?[ctx.attacker]:[];
      case 'selfActive':return own(ctx).active?[own(ctx).active]:[];
      case 'selfAll':return pokemonOn(own(ctx));
      case 'selfBenchAll':return own(ctx).bench.filter(Boolean);
      case 'opponentActive':return other(ctx).active?[other(ctx).active]:[];
      case 'opponentAll':return pokemonOn(other(ctx));
      case 'selfBench':{const s=selected(ctx,own(ctx));return s&&own(ctx).bench.includes(s)?[s]:[];}
      case 'opponentBench':{const s=selected(ctx,other(ctx));return s&&other(ctx).bench.includes(s)?[s]:[];}
      case 'selfPokemon':{const s=selected(ctx,own(ctx));return s?[s]:[];}
      case 'opponentPokemon':{const s=selected(ctx,other(ctx));return s?[s]:[];}
      default:throw new Error(`Unsupported target: ${selector}`);
    }
  }
  function matchesFilter(card,filter,slot){const match=(k,v)=>k==='subtype'?hasType(card,v):k==='tag'?(card.tags||[]).includes(v):k==='damaged'?(Number(slot?.damage)>0)===v:k==='isEx'?!!(card.isEx||card.points>=2||/ ex$/.test(card.name))===v:k==='evolved'?['Stage 1','Stage 2'].includes(card.stage)===v:k==='hasAbility'?!!(card.abilities?.length||card.ability)===v:k==='hasEnergyType'?Number(slot?.energy?.[v]||0)>0:k==='hasAnyEnergy'?totalEnergy(slot?.energy)>0:k==='nameContains'?String(card.name||'').includes(v):k==='attackName'?(card.attacks||[]).some(a=>a.name===v):k==='hpAtMost'?Number(card.hp||0)<=Number(v):k==='retreatAtLeast'?Number(card.retreat||0)>=Number(v):k==='energyTypeAtLeast'?Number(slot?.energy?.[v?.type]||0)>=Number(v?.amount||0):card[k]===v;return !!card&&Object.entries(filter||{}).every(([k,v])=>Array.isArray(v)?v.some(x=>match(k,x)):match(k,v));}
  function clearConditions(slot){if(slot)slot.conditions={};}
  function clearTemporaryEffects(state,slot){if(!slot)return;clearConditions(slot);delete slot.locks;delete slot.attackGuard;delete slot.statusGuard;delete slot.attackGate;delete slot.retaliate;delete slot.stackedAttackBonuses;delete slot.abilitySuppressed;if(state)state.modifiers=(state.modifiers||[]).filter(m=>m.targetUid!==slot.uid||m.scope==='team'||m.scope==='active'||m.scope==='opponentActive');}
  function switchPokemon(side,benchIndex,state){const index=side.bench.findIndex(s=>s&&Number(s.benchSlot)===Number(benchIndex));if(index<0||!side.active)return false;const incoming=side.bench[index],outgoing=side.active;outgoing.benchSlot=Number(incoming.benchSlot);incoming.benchSlot=null;incoming.movedToActiveTurn=state?.turnNumber;side.bench[index]=outgoing;side.active=incoming;clearTemporaryEffects(state,outgoing);return true;}
  function protectedFromEffects(slot,ctx){return !!(ctx.isAttack&&ctx.preventedTargets&&ctx.preventedTargets.has(slot.uid));}
  function repeatHeads(ctx,callback,results){for(let count=0;count<1024;count++){const heads=coin(ctx);if(Array.isArray(results))results.push(heads);if(!heads)return count;callback();}throw new Error('Coin sequence exceeded deterministic resolution limit.');}
  function energyOwner(ctx,slot){if(pokemonOn(own(ctx)).includes(slot))return own(ctx);if(pokemonOn(other(ctx)).includes(slot))return other(ctx);return null;}
  function recordDiscardedEnergy(side,type,amount){if(!side||!type||amount<=0)return;side.energyDiscard=side.energyDiscard||{};side.energyDiscard[type]=Number(side.energyDiscard[type]||0)+Number(amount||0);}
  function applyEffect(effect,ctx){
    if(!effect)return;
    assertEffect(effect);
    if(!conditionMatches(effect.condition,ctx))return;
    const affected=()=>targets(effect.target,ctx).filter(s=>!protectedFromEffects(s,ctx)&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s)),log=entry=>ctx.state.log.push(Object.assign({side:ctx.side},entry));
    switch(effect.type){
      case 'noop':break;
      case 'forceFirstCoinHead':{const ss=own(ctx);ss.forceFirstCoinHeadTurn=ctx.state.turnNumber;ss.forceFirstCoinHeadUsed=false;break;}
      case 'coinReroll':case 'toolCapacity':case 'repeatAttack':case 'chooseDiscardForBonus':case 'weaknessMultiplier':case 'statusRecoveryAura':case 'copyRandomAttackFromPrivate':break;
      case 'weaknessGuard':for(const target of affected())target.weaknessGuard={duration:effect.duration||'opponentTurn',expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'energyAttachStatusTrap':for(const target of affected())target.energyAttachStatusTrap={status:effect.status,expiresTurn:ctx.state.turnNumber+1};break;
      case 'copyRandomTrainerEffect':{const ss=effect.source==='opponentHand'?other(ctx).hand:other(ctx).deck,candidates=ss.map((r,index)=>({r,index,card:ctx.cardById(r.cardId)})).filter(x=>x.card?.kind==='trainer'&&x.card?.trainerType===effect.trainerType&&x.card?.effect&&(!effect.excludeName||x.card.name!==effect.excludeName));if(candidates.length){const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)];log({type:'copyTrainer',cardId:hit.card.id,source:effect.source});applyEffect(hit.card.effect,ctx);if(effect.shuffleAfter&&effect.source==='opponentDeck')ctx.shuffle?.(ctx.state,other(ctx).deck);}break;}
      case 'healActiveReturnTrainer':{const slot=own(ctx).active,before=Number(slot?.damage||0),healed=Math.min(before,Number(effect.amount||0));if(slot)slot.damage=Math.max(0,before-healed);const ref=ctx.trainerRef;if(ref){if(healed>0){const heads=coin(ctx);log({type:'coin',heads,results:[heads]});if(heads)own(ctx).hand.push(ref);else own(ctx).discard.push(ref);}else own(ctx).discard.push(ref);}break;}
      case 'reorderTop':{
        const targetSide=effect.deckSide==='opponent'?other(ctx):own(ctx);
        const count=Math.min(Number(effect.count!=null?effect.count:pokemonOn(own(ctx)).filter(s=>hasType(ctx.cardById(s.cardId),effect.countPerType)).length),targetSide.deck.length);
        if(count<=1)break;
        const chosen=Array.isArray(effect.orderUids)?effect.orderUids.slice():[];
        if(ctx.resolvingChoice){
          const ref=targetSide.deck[Number(ctx.action?.choiceDeckIndex)];
          if(ref&&!chosen.includes(ref.uid))chosen.push(ref.uid);
          if(chosen.length>=count){
            const top=targetSide.deck.slice(0,count),byUid=new Map(top.map(r=>[r.uid,r]));
            const ordered=chosen.map(uid=>byUid.get(uid)).filter(Boolean);
            for(const r of top)if(!chosen.includes(r.uid))ordered.push(r);
            targetSide.deck.splice(0,count,...ordered);
          }else if(typeof ctx.requestChoice==='function'){
            ctx.requestChoice({kind:'topDeckCard',side:'self',deckSide:effect.deckSide==='opponent'?ctx.foeSide:ctx.side,count,excludeUids:chosen,effect:{...effect,count,orderUids:chosen}});
          }
          break;
        }
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'topDeckCard',side:'self',deckSide:effect.deckSide==='opponent'?ctx.foeSide:ctx.side,count,excludeUids:[],effect:{...effect,count,orderUids:[]}});
        break;
      }
      case 'benchBasicsFromOpponentHand':{
        const ss=other(ctx),eligible=(ss.hand||[]).filter(r=>ctx.cardById(r.cardId)?.kind==='pokemon'&&ctx.cardById(r.cardId)?.stage==='Basic');
        if(!eligible.length)break;
        if(ctx.resolvingChoice){
          if(ctx.action?.choiceSkip)break;
          const idx=Number(ctx.action?.choiceHandIndex),ref=ss.hand[idx];
          if(ref&&ctx.cardById(ref.cardId)?.kind==='pokemon'&&ctx.cardById(ref.cardId)?.stage==='Basic'){
            ss.hand.splice(idx,1);
            const placed=ctx.benchCard?.(ss,ref);
            if(placed==null)ss.hand.splice(Math.min(idx,ss.hand.length),0,ref);
          }
          if((ss.hand||[]).some(r=>ctx.cardById(r.cardId)?.kind==='pokemon'&&ctx.cardById(r.cardId)?.stage==='Basic')&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'opponentHandCard',side:'self',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect});
          break;
        }
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'opponentHandCard',side:'self',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect});
        break;
      }
      case 'redistributeEnergy':{
        const all=pokemonOn(own(ctx)),remaining=effect.remaining||null;
        if(effect.phase==='continue'&&ctx.resolvingChoice&&Number(ctx.action?.choiceOption)===1)break;
        if(ctx.resolvingChoice&&effect.phase==='continue'){
          if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'energySource',side:'self',effect:{type:'redistributeEnergy'}});
          break;
        }
        if(ctx.resolvingChoice){
          if(!remaining){
            const source=selected(ctx,own(ctx)),type=ctx.action?.effectEnergyType;
            if(!source||!type||Number(source.energy?.[type]||0)<=0)break;
            if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:true,excludeUids:[source.uid],effect:{...effect,remaining:{sourceUid:source.uid,energyType:type}}});
            break;
          }
          const source=all.find(s=>s.uid===remaining.sourceUid),dest=selected(ctx,own(ctx));
          if(source&&dest&&source!==dest&&Number(source.energy?.[remaining.energyType]||0)>0){source.energy[remaining.energyType]--;dest.energy[remaining.energyType]=Number(dest.energy[remaining.energyType]||0)+1;}
          if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:['Move another Energy','Done'],effect:{type:'redistributeEnergy',phase:'continue'}});
          break;
        }
        const movable=all.some(s=>totalEnergy(s.energy)>0&&all.some(d=>d!==s));
        if(movable&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'energySource',side:'self',effect});
        break;
      }
      case 'distributeDiscardEnergyDistinct':{
        const ss=own(ctx),usedTypes=Array.isArray(effect.usedTypes)?effect.usedTypes.slice():[],placed=Number(effect.placed||0);
        const available=Object.entries(ss.energyDiscard||{}).filter(([t,n])=>Number(n)>0&&!usedTypes.includes(t)).map(([t])=>t);
        const limit=Math.min(Number(effect.amount||0),usedTypes.length+available.length);
        if(placed>=limit||!available.length)break;
        if(ctx.resolvingChoice){
          const target=selected(ctx,ss),type=ctx.action?.effectEnergyType;
          if(target&&type&&!usedTypes.includes(type)&&Number(ss.energyDiscard?.[type]||0)>0&&matchesFilter(ctx.cardById(target.cardId),effect.filter,target)){
            ss.energyDiscard[type]--;target.energy[type]=Number(target.energy[type]||0)+1;ctx.onEnergyAttached?.(target,type,1);usedTypes.push(type);
            const next=placed+1;
            const remain=Object.entries(ss.energyDiscard||{}).filter(([t,n])=>Number(n)>0&&!usedTypes.includes(t)).map(([t])=>t);
            if(next<Number(effect.amount||0)&&remain.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'energyTarget',side:'self',filter:effect.filter,energyTypes:remain,effect:{...effect,usedTypes,placed:next}});
          }
          break;
        }
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'energyTarget',side:'self',filter:effect.filter,energyTypes:available,effect:{...effect,usedTypes,placed}});
        break;
      }
      case 'multiTargetDamage':{const foe=other(ctx),remaining=Math.max(1,Number((effect.remaining??effect.count)||1)),chosen=Array.isArray(effect.chosenUids)?effect.chosenUids.slice():[];if(ctx.resolvingChoice){const target=selected(ctx,foe);if(target&&!chosen.includes(target.uid)){const side=ctx.foeSide,guard=ctx.isAttack&&attackIsPrevented(ctx.state,side,target,ctx.attacker,ctx.cardById),amount=guard?0:Math.max(0,Number(effect.amount||0)-(ctx.isAttack?modifierAmount(ctx.state,side,target,'damageReduction',ctx.cardById):0));target.damage=Number(target.damage||0)+amount;chosen.push(target.uid);}const left=remaining-1;if(left>0&&(foe.active||foe.bench.length)){if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'opponent',includeActive:effect.target==='opponentPokemon',excludeUids:chosen,effect:{...effect,remaining:left,chosenUids:chosen}});}break;}if(typeof ctx.requestChoice==='function'){const candidates=(effect.target==='opponentPokemon'?pokemonOn(foe):foe.bench).filter(s=>s&&!chosen.includes(s.uid));if(candidates.length)ctx.requestChoice({kind:'pokemon',side:'opponent',includeActive:effect.target==='opponentPokemon',excludeUids:chosen,effect:{...effect,remaining}});}break;}
      case 'scheduleDelayed':{const a=ctx.action||{};let targetUid=null,spot=null;if(effect.targetMode==='defender')targetUid=ctx.defender?.uid||null;else{const t=a.choiceTarget||a.effectTarget||a.target;if(t==='opponentActive'||t==='active')spot={side:ctx.foeSide,active:true};else{const idx=a.choiceBenchIndex??a.effectBenchIndex??a.benchIndex;spot={side:ctx.foeSide,benchIndex:Number(idx)};}}ctx.state.delayedEffects=ctx.state.delayedEffects||[];ctx.state.delayedEffects.push({event:effect.event,dueTurn:ctx.state.turnNumber+1,endingSide:ctx.foeSide,originSide:ctx.side,sourceUid:ctx.attacker?.uid||null,targetUid,spot,effect:effect.effect});break;}
      case 'retreatRetaliation':for(const target of affected())target.retreatRetaliation={amount:Number(effect.amount||0),expiresTurn:ctx.state.turnNumber+1};break;
      case 'abilitySuppression':for(const target of affected())target.abilitySuppressed={duration:effect.duration||'whileActive'};break;
      case 'knockOut':for(const target of affected()){const which=pokemonOn(own(ctx)).includes(target)?ctx.side:ctx.foeSide,targetMax=ctx.maxHp?ctx.maxHp(which,target):Number(ctx.cardById(target.cardId)?.hp||0);target.damage=Math.max(Number(target.damage||0),targetMax);}break;
      case 'discardPokemon':for(const target of affected()){const ss=pokemonOn(own(ctx)).includes(target)?own(ctx):other(ctx);for(const cardId of target.stack||[target.cardId])ss.discard.push({uid:`${target.uid}-discard-${cardId}`,cardId});for(const tool of toolsOf(target))ss.discard.push(tool);if(ss.active===target)ss.active=null;else{const i=ss.bench.indexOf(target);if(i>=0)ss.bench.splice(i,1);}log({type:'discardPokemon',cardId:target.cardId});}break;
      case 'koPointBonus':{const ss=own(ctx);ss.koPointBonuses=ss.koPointBonuses||[];ss.koPointBonuses.push({...effect,expiresTurn:ctx.state.turnNumber});break;}
      case 'randomAttackLock':for(const target of affected()){const attacks=ctx.cardById(target.cardId)?.attacks||[];if(!attacks.length)continue;const attack=attacks[Math.floor(ctx.random(ctx.state)*attacks.length)];target.locks=target.locks||[];target.locks.push({action:'attack',attackName:attack.name,duration:effect.duration,expiresTurn:ctx.state.turnNumber+(effect.duration==='opponentTurn'?1:2)});}break;
      case 'randomHitBonus':{const ss=own(ctx);ss.randomHitBonuses=ss.randomHitBonuses||[];ss.randomHitBonuses.push({...effect,expiresTurn:ctx.state.turnNumber});break;}
      case 'stackAttackBonus':if(ctx.attacker){ctx.attacker.stackedAttackBonuses=ctx.attacker.stackedAttackBonuses||{};ctx.attacker.stackedAttackBonuses[effect.attackName]=Number(ctx.attacker.stackedAttackBonuses[effect.attackName]||0)+Number(effect.amount||0);}break;
      case 'firstDamageGuard':for(const s of affected())s.firstDamageGuard=true;break;
      case 'attachRandomEnergy':{for(const s of affected()){for(let i=0;i<Number(effect.amount||1);i++){const type=effect.energyTypes[Math.floor(ctx.random(ctx.state)*effect.energyTypes.length)];s.energy[type]=Number(s.energy[type]||0)+1;ctx.onEnergyAttached?.(s,type,1);}}break;}
      case 'selfDamageIfDefenderKnockedOut':{if(ctx.attacker&&ctx.defender&&Number(ctx.defender.damage||0)>=(ctx.maxHp?ctx.maxHp(ctx.foeSide,ctx.defender):Number(ctx.cardById(ctx.defender.cardId)?.hp||0)))ctx.attacker.damage=Number(ctx.attacker.damage||0)+Number(effect.amount||0);break;}
      case 'shuffleRandomCombinedHandCard':{const pools=[{side:own(ctx),label:'self'},{side:other(ctx),label:'opponent'}],all=[];for(const p of pools)for(const [index,ref] of p.side.hand.entries())all.push({...p,index,ref});if(all.length){const hit=all[Math.floor(ctx.random(ctx.state)*all.length)];log({type:'revealHand',revealedSide:hit.label,cards:[hit.ref.cardId]});const [ref]=hit.side.hand.splice(hit.index,1);hit.side.deck.push(ref);ctx.shuffle?.(ctx.state,hit.side.deck);}break;}
      case 'createCard':{for(let i=0;i<Number(effect.amount||1)&&own(ctx).hand.length<10;i++)own(ctx).hand.push({uid:`rental-${effect.cardId}-${ctx.state.turnNumber}-${i}`,cardId:effect.cardId});break;}
      case 'searchThenShuffleChosen':{const ss=own(ctx),pool=ss.deck.map((r,index)=>({r,index})).filter(x=>matchesFilter(ctx.cardById(x.r.cardId),effect.filter)),drawn=[];for(let i=0;i<Number(effect.amount||0)&&pool.length&&ss.hand.length<10;i++){const pick=Math.floor(ctx.random(ctx.state)*pool.length),hit=pool.splice(pick,1)[0],idx=ss.deck.indexOf(hit.r);if(idx>=0){const [ref]=ss.deck.splice(idx,1);ss.hand.push(ref);drawn.push(ref);}}ctx.shuffle?.(ctx.state,ss.deck);if(drawn.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:'self',filter:effect.handFilter||effect.filter,effect:{type:'shuffleChosenHand',side:'self',amount:drawn.length,required:true,filter:effect.handFilter||effect.filter}});break;}
      case 'coinBenchDamage':{let heads=0;const results=[];for(let i=0;i<effect.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}log({type:'coin',side:ctx.side,heads,coins:effect.coins,results});if(heads)applyEffect({type:'benchDamage',side:'opponent',all:true,amount:heads*Number(effect.amount||0)},ctx);break;}
      case 'stadiumAction':applyEffect(effect.effect,ctx);break;
      case 'rerollEnergyZone':{const ss=own(ctx);if(!ss.energyAvailable||ss.energyUsed)break;ss.energyType=ss.nextEnergyType||ss.energyTypes[0];ss.nextEnergyType=ss.energyTypes.length>1?ss.energyTypes[Math.floor(ctx.random(ctx.state)*ss.energyTypes.length)]:ss.energyTypes[0];log({type:'energyZoneReroll',energyType:ss.energyType});break;}
      case 'setNextEnergyRandom':{const ss=effect.side==='self'?own(ctx):other(ctx),types=effect.energyTypes||[];if(types.length)ss.nextEnergyType=types[Math.floor(ctx.random(ctx.state)*types.length)];break;}
      case 'changeRandomEnergyType':{for(const slot of affected()){const units=[];for(const [type,n] of Object.entries(slot.energy||{}))for(let i=0;i<Number(n||0);i++)units.push(type);if(!units.length)continue;const from=units[Math.floor(ctx.random(ctx.state)*units.length)],types=(effect.energyTypes||[]).filter(t=>t!==from);const to=(types.length?types:effect.energyTypes)[Math.floor(ctx.random(ctx.state)*(types.length?types:effect.energyTypes).length)];if(!to)continue;slot.energy[from]=Math.max(0,Number(slot.energy[from]||0)-1);slot.energy[to]=Number(slot.energy[to]||0)+1;}break;}
      case 'devolve':{for(const slot of affected()){if(!slot.stack||slot.stack.length<2)continue;const ss=energyOwner(ctx,slot),top=slot.stack.pop();if(ss&&ss.hand.length<10)ss.hand.push({uid:`${slot.uid}-devolve-${ctx.state.turnNumber}`,cardId:top});else if(ss)ss.discard.push({uid:`${slot.uid}-devolve-${ctx.state.turnNumber}`,cardId:top});slot.cardId=slot.stack[slot.stack.length-1];clearTemporaryEffects(ctx.state,slot);log({type:'devolve',cardId:top,toCardId:slot.cardId});}break;}
      case 'chooseOption':{if(ctx.resolvingChoice){const index=Number(ctx.action?.choiceOption);const opt=effect.options?.[index];if(opt)applyEffect(opt.effect,ctx);}else if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:(effect.options||[]).map(o=>o.label),effect,optional:!!effect.optional});break;}
      case 'revealDeck':{const ss=effect.side==='self'?own(ctx):other(ctx),cards=ss.deck.filter(r=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r)).map(r=>r.cardId);log({type:'revealDeck',revealedSide:effect.side||'opponent',cards});break;}
      case 'removeStatuses':for(const slot of affected())for(const status of effect.statuses||[])delete (slot.conditions||{})[status];break;
      case 'shuffleDeck':{const ss=effect.side==='opponent'?other(ctx):own(ctx);ctx.shuffle?.(ctx.state,ss.deck);break;}
      case 'returnAllTools':{for(const ss of [own(ctx),other(ctx)])for(const slot of pokemonOn(ss)){const tools=toolsOf(slot);if(!tools.length)continue;ss.hand.push(...tools);slot.tool=null;slot.extraTools=[];}break;}
      case 'shuffleAllTools':{const sides=effect.side==='self'?[own(ctx)]:effect.side==='opponent'?[other(ctx)]:[own(ctx),other(ctx)];for(const ss of sides){for(const slot of pokemonOn(ss)){const tools=toolsOf(slot);if(!tools.length)continue;ss.deck.push(...tools);slot.tool=null;slot.extraTools=[];}ctx.shuffle?.(ctx.state,ss.deck);}break;}
      case 'evolveTargetFromDeck':{for(const slot of affected()){const ss=energyOwner(ctx,slot),base=ctx.cardById(slot.cardId);if(effect.requirePlayedBeforeTurn&&Number(slot.playedOnSideTurn)>=Number(ss?.turnCount))continue;if(!ss||!base)continue;const candidates=ss.deck.map((r,index)=>({r,index,card:ctx.cardById(r.cardId)})).filter(x=>x.card?.kind==='pokemon'&&x.card?.battleEnabled&&x.card.evolvesFrom===base.name&&(!effect.evolutionFilter||matchesFilter(x.card,effect.evolutionFilter,x.r)));if(!candidates.length)continue;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)],[ref]=ss.deck.splice(hit.index,1);slot.cardId=ref.cardId;slot.stack.push(ref.cardId);slot.evolvedOnTurn=ctx.state.turnNumber;slot.playedOnSideTurn=ss.turnCount;ctx.shuffle?.(ctx.state,ss.deck);log({type:'evolve',cardId:ref.cardId,fromDeck:true});ctx.onEvolved?.(slot); }break;}
      case 'moveRandomEnergy':{for(const slot of affected()){const src=effect.source==='opponentActive'?other(ctx).active:effect.source==='opponentBench'?selected(ctx,other(ctx)):effect.source==='selfActive'?own(ctx).active:ctx.attacker;if(!src||src===slot&&effect.source!=='self')continue;const units=[];for(const [type,n] of Object.entries(src.energy||{}))for(let i=0;i<Number(n||0);i++)units.push(type);if(!units.length)continue;const type=units[Math.floor(ctx.random(ctx.state)*units.length)];src.energy[type]=Math.max(0,Number(src.energy[type]||0)-1);slot.energy[type]=Number(slot.energy[type]||0)+1;}break;}
      case 'stealRandomFromDiscard':{const src=effect.side==='opponent'?other(ctx):own(ctx),dst=effect.side==='opponent'?own(ctx):other(ctx);const choices=src.discard.map((r,index)=>({r,index})).filter(({r})=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r));if(choices.length){const hit=choices[Math.floor(ctx.random(ctx.state)*choices.length)],[ref]=src.discard.splice(hit.index,1);dst.hand.push(ref);}break;}
      case 'discardTop':{const ss=effect.side==='opponent'?other(ctx):own(ctx);const discarded=ss.deck.splice(0,effect.amount);ss.discard.push(...discarded);log({type:'discardDeck',count:discarded.length});break;}
      case 'actionLock':{const ss=effect.side==='self'?own(ctx):other(ctx);ss.actionLocks=ss.actionLocks||[];ss.actionLocks.push({...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null,sourceSide:ctx.side,sourceUid:ctx.attacker?.uid});break;}
      case 'discardTool':{
        const selector=effect.target||'self',selectable=['selfPokemon','selfBench','opponentPokemon','opponentBench'].includes(selector),hasPokemonChoice=ctx.action?.choiceTarget==='active'||ctx.action?.choiceTarget==='bench';
        if(selectable&&!hasPokemonChoice){const targetSide=selector.startsWith('opponent')?other(ctx):own(ctx),eligible=pokemonOn(targetSide).filter(slot=>(selector.endsWith('Bench')?targetSide.bench.includes(slot):true)&&toolsOf(slot).length&&matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot));if(eligible.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',selectionSide:selector.startsWith('opponent')?ctx.foeSide:ctx.side,includeActive:selector.endsWith('Pokemon'),requireTool:true,filter:effect.filter,effect});break;}
        for(const slot of affected()){const tools=toolsOf(slot);if(!tools.length)continue;const ss=pokemonOn(own(ctx)).includes(slot)?own(ctx):other(ctx);
          if(effect.sourceOnly&&ctx.sourceTool){const index=tools.findIndex(tool=>tool.uid===ctx.sourceTool.uid);const removed=removeToolAt(slot,index);if(removed)ss.discard.push(removed);continue;}
          if(Number(effect.amount)===1){if(tools.length>1&&!Number.isInteger(ctx.action?.choiceToolIndex)){if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'toolCard',side:'self',selectionSide:ss===own(ctx)?ctx.side:ctx.foeSide,targetUid:slot.uid,effect,choiceTarget:slot===ss.active?'active':'bench',choiceBenchIndex:slot===ss.active?undefined:Number(slot.benchSlot)});break;}const removed=removeToolAt(slot,Number.isInteger(ctx.action?.choiceToolIndex)?Number(ctx.action.choiceToolIndex):0);if(removed)ss.discard.push(removed);continue;}
          ss.discard.push(...tools);slot.tool=null;slot.extraTools=[];
        }break;}
      case 'attackCoinGate':for(const slot of affected())slot.attackGate={...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'retaliateDamage':for(const slot of affected())slot.retaliate={...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'discardHand':{const ss=effect.side==='opponent'?other(ctx):own(ctx);for(let i=0;i<effect.amount&&ss.hand.length;i++){const candidates=ss.hand.map((r,index)=>({r,index})).filter(({r})=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter));if(!candidates.length)break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)];ss.discard.push(...ss.hand.splice(hit.index,1));}break;}
      case 'trimHand':{const ss=effect.side==='opponent'?other(ctx):own(ctx);while(ss.hand.length>effect.maxSize){const index=Math.floor(ctx.random(ctx.state)*ss.hand.length);ss.discard.push(...ss.hand.splice(index,1));}break;}
      case 'shuffleRandomHandCard':{const ss=effect.side==='opponent'?other(ctx):own(ctx),candidates=ss.hand.map((r,index)=>({r,index})).filter(({r})=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter));if(candidates.length){const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)],[ref]=ss.hand.splice(hit.index,1);ss.deck.push(ref);ctx.shuffle(ctx.state,ss.deck);}break;}
      case 'randomPokemonDamage':{let hits=effect.perEnergyType?Number(ctx.attacker?.energy?.[effect.perEnergyType]||0):Number(effect.hits||0);for(const bonus of own(ctx).randomHitBonuses||[])if((bonus.expiresTurn==null||ctx.state.turnNumber<=bonus.expiresTurn)&&bonus.attackName===ctx.attack?.name)hits+=Number(bonus.amount||0);for(let i=0;i<hits;i++){let entries=effect.bothSides?[...pokemonOn(own(ctx)).map(slot=>({slot,side:ctx.side})),...pokemonOn(other(ctx)).map(slot=>({slot,side:ctx.foeSide}))]:(effect.zone==='bench'?other(ctx).bench.filter(Boolean):pokemonOn(other(ctx))).map(slot=>({slot,side:ctx.foeSide}));if(effect.zone==='bench'&&effect.bothSides)entries=entries.filter(x=>x.slot!==own(ctx).active&&x.slot!==other(ctx).active);if(effect.excludeSelf)entries=entries.filter(x=>x.slot!==ctx.attacker);if(!entries.length)break;const hit=entries[Math.floor(ctx.random(ctx.state)*entries.length)],guard=ctx.isAttack&&attackIsPrevented(ctx.state,hit.side,hit.slot,ctx.attacker,ctx.cardById),amount=guard?0:Math.max(0,effect.amount-(ctx.isAttack?modifierAmount(ctx.state,hit.side,hit.slot,'damageReduction',ctx.cardById):0));hit.slot.damage=Number(hit.slot.damage||0)+amount;}break;}
      case 'globalRandomDiscardEnergy':{const count=Math.max(1,Number(effect.amount||1)),sides=effect.side==='self'?[own(ctx)]:effect.side==='opponent'?[other(ctx)]:[own(ctx),other(ctx)];for(let pick=0;pick<count;pick++){const slots=sides.flatMap(ss=>pokemonOn(ss).filter(slot=>!effect.filter||matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot)).map(slot=>({slot,side:ss}))),units=[];for(const x of slots)for(const [type,n] of Object.entries(x.slot.energy||{}))for(let i=0;i<Number(n||0);i++)units.push({...x,type});if(!units.length)break;const hit=units[Math.floor(ctx.random(ctx.state)*units.length)];hit.slot.energy[hit.type]=Math.max(0,Number(hit.slot.energy[hit.type]||0)-1);recordDiscardedEnergy(hit.side,hit.type,1);}break;}
      case 'discardStadium':if(ctx.state.stadium){const st=ctx.state.stadium,ss=ctx.state.sides[st.ownerSide];ss.discard.push({uid:st.uid,cardId:st.cardId});ctx.state.stadium=null;}break;
      case 'drain':if(ctx.attacker)ctx.attacker.damage=Math.max(0,Number(ctx.attacker.damage||0)-Math.max(0,Number(ctx.dealtDamage||0)));break;
      case 'nextAttackBonus':if(ctx.attacker){ctx.attacker.nextAttackBonuses=ctx.attacker.nextAttackBonuses||[];ctx.attacker.nextAttackBonuses.push({attackName:effect.attackName,amount:effect.amount,turn:ctx.state.turnNumber+2});}break;
      case 'evolveFromDeck':if(ctx.attacker&&typeof ctx.evolveFromDeck==='function')ctx.evolveFromDeck(ctx.attacker);break;
      case 'benchFromDiscard':{const ss=other(ctx),source=ss.discard;if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceDiscardIndex)){const index=ctx.action.choiceDiscardIndex,ref=source[index];if(!ref||!matchesFilter(ctx.cardById(ref.cardId),effect.filter))break;const empty=Math.max(0,3-ss.bench.length);if(!empty)break;source.splice(index,1);if(ctx.benchCard(ss,ref)==null)source.splice(index,0,ref);break;}if(ss.bench.length<3&&source.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'discardCard',side:'self',discardZone:'opponent',filter:effect.filter,effect});break;}
      case 'benchFromDeck':{const ss=own(ctx);for(let i=0;i<effect.amount;i++){const candidates=ss.deck.map((r,index)=>({r,index})).filter(({r})=>matchesFilter(ctx.cardById(r.cardId),effect.filter));if(!candidates.length||typeof ctx.benchCard!=='function')break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)],[ref]=ss.deck.splice(hit.index,1);if(ctx.benchCard(ss,ref)==null){ss.deck.splice(hit.index,0,ref);break;}log({type:'benchFromDeck',cardId:ref.cardId});}if(ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);break;}
      case 'forceOpponentSwitch':{
        const ss=other(ctx);if(!ss.active||!ss.bench.length)break;
        if(ctx.resolvingChoice&&ctx.action?.choiceTarget==='bench'){switchPokemon(ss,ctx.action.choiceBenchIndex,ctx.state);log({type:'switch',chosenBy:ctx.foeSide});break;}
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'switchBench',side:'opponent',effect});break;
      }
      case 'revealHand':{const ss=effect.side==='self'?own(ctx):other(ctx);let refs=ss.hand.slice();if(effect.random){const n=Math.min(refs.length,Math.max(0,Number(effect.random)||0)),pool=refs.slice();refs=[];for(let i=0;i<n&&pool.length;i++){const index=Math.floor(ctx.random(ctx.state)*pool.length);refs.push(...pool.splice(index,1));}}log({type:'revealHand',revealedSide:effect.side||'opponent',cards:refs.map(r=>r.cardId)});break;}
      case 'inspectTop':{const ss=effect.side==='opponent'?other(ctx):own(ctx),count=Math.min(Number(effect.amount||1),ss.deck.length);log({type:'inspectTop',inspectedSide:effect.side||'self',cards:ss.deck.slice(0,count).map(r=>r.cardId)});break;}
      case 'returnToHand':{for(const slot of affected()){const ss=energyOwner(ctx,slot);if(!ss)continue;const refs=slot.stack.map((cardId,i)=>({uid:`${slot.uid}-return-${i}`,cardId}));refs.push(...toolsOf(slot));if(ss.hand.length+refs.length>10){log({type:'returnToHandBlocked',cardId:slot.cardId,reason:'hand-full'});continue;}ss.hand.push(...refs);if(ss.active===slot)ss.active=null;else ss.bench.splice(ss.bench.indexOf(slot),1);log({type:'returnToHand',cardId:slot.cardId});}break;}
      case 'shuffleIntoDeck':{for(const slot of affected()){const ss=energyOwner(ctx,slot);if(!ss)continue;const refs=slot.stack.map((cardId,i)=>({uid:`${slot.uid}-shuffle-${i}`,cardId}));if(effect.includeAttached!==false)refs.push(...toolsOf(slot));ss.deck.push(...refs);if(ss.active===slot)ss.active=null;else ss.bench.splice(ss.bench.indexOf(slot),1);if(ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);log({type:'shuffleIntoDeck',cardId:slot.cardId});}break;}
      case 'discardChosenHand':{
        const ss=effect.side==='opponent'?other(ctx):own(ctx),needed=Math.max(1,Number(effect.amount||1));
        if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceHandIndex)){const [ref]=ss.hand.splice(ctx.action.choiceHandIndex,1);if(ref)ss.discard.push(ref);const left=Number(effect.remaining||needed)-1;if(left>0&&ss.hand.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:effect.side||'self',filter:effect.filter,effect:{...effect,remaining:left}});break;}
        const candidates=ss.hand.filter(r=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r));if(candidates.length<needed){if(effect.required)ctx.actionFailed=true;break;}if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:effect.side||'self',filter:effect.filter,effect:{...effect,remaining:needed}});break;
      }
      case 'shuffleChosenHand':{
        const ss=effect.side==='opponent'?other(ctx):own(ctx),needed=Math.max(1,Number(effect.remaining||effect.amount||1));
        if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceHandIndex)){const [ref]=ss.hand.splice(ctx.action.choiceHandIndex,1);if(ref){ss.deck.push(ref);ctx.shuffle?.(ctx.state,ss.deck);}const left=needed-1;if(left>0&&ss.hand.some(r=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:effect.side||'self',filter:effect.filter,effect:{...effect,remaining:left}});break;}
        const candidates=ss.hand.filter(r=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r));if(candidates.length>=needed&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:effect.side||'self',filter:effect.filter,effect:{...effect,remaining:needed}});else if(effect.required)ctx.actionFailed=true;break;
      }
      case 'searchChosen':{
        const ss=own(ctx),source=ss[effect.source||'deck'];
        if(ctx.resolvingChoice){const index=effect.source==='discard'?ctx.action?.choiceDiscardIndex:ctx.action?.choiceDeckIndex;if(Number.isInteger(index)&&source[index]&&ss.hand.length<10){const [ref]=source.splice(index,1);ss.hand.push(ref);log({type:'search',cardId:ref.cardId});const left=Number(effect.remaining||effect.amount||1)-1;if(left>0&&source.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:effect.source==='discard'?'discardCard':'deckCard',side:'self',filter:effect.filter,effect:{...effect,remaining:left}});else if((effect.source||'deck')==='deck'&&ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);}break;}
        const candidates=source.filter(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter));if(candidates.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:effect.source==='discard'?'discardCard':'deckCard',side:'self',filter:effect.filter,effect:{...effect,remaining:Number(effect.amount||1)}});break;
      }
      case 'takeTopMatching':{const ss=own(ctx),n=Math.min(Number(effect.count||1),ss.deck.length),top=ss.deck.splice(0,n),keep=[],rest=[];for(const ref of top)(matchesFilter(ctx.cardById(ref.cardId),effect.filter)?keep:rest).push(ref);while(keep.length&&ss.hand.length<10)ss.hand.push(keep.shift());ss.deck.push(...keep,...rest);ctx.shuffle?.(ctx.state,ss.deck);break;}
      case 'selectTopToHand':{
        const ss=own(ctx),n=Math.min(Number(effect.count||1),ss.deck.length);
        if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceDeckIndex)&&ctx.action.choiceDeckIndex<n){const [ref]=ss.deck.splice(ctx.action.choiceDeckIndex,1);if(ref&&ss.hand.length<10)ss.hand.push(ref);ctx.shuffle?.(ctx.state,ss.deck);break;}
        if(n&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'topDeckCard',side:'self',deckSide:ctx.side,count:n,effect});break;
      }
      case 'swapHandWithRandomDeck':{
        const ss=own(ctx);
        if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceHandIndex)){const chosen=ss.hand[ctx.action.choiceHandIndex],candidates=ss.deck.map((r,index)=>({r,index})).filter(x=>matchesFilter(ctx.cardById(x.r.cardId),effect.deckFilter));if(!chosen||!candidates.length)break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)],[incoming]=ss.deck.splice(hit.index,1),[outgoing]=ss.hand.splice(ctx.action.choiceHandIndex,1,incoming);ss.deck.push(outgoing);ctx.shuffle?.(ctx.state,ss.deck);break;}
        if(ss.hand.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.handFilter))&&ss.deck.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.deckFilter))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:'self',filter:effect.handFilter,effect});break;
      }
      case 'moveDamage':{
        const source=affected().find(x=>!effect.excludeSelf||x!==ctx.attacker),dest=targets(effect.destination||'opponentActive',ctx)[0];if(!source||!dest)break;const amount=Math.min(effect.amount==='all'?Number(source.damage||0):Number(effect.amount||0),Number(source.damage||0));source.damage-=amount;dest.damage=Number(dest.damage||0)+amount;break;
      }
      case 'discardBenchPokemon':{
        const ss=own(ctx);
        if((ctx.resolvingChoice&&ctx.action?.choiceTarget==='bench')||ctx.action?.target==='bench'){const chosen=ctx.resolvingChoice?ctx.action.choiceBenchIndex:ctx.action.benchIndex,idx=ss.bench.findIndex(x=>x&&Number(x.benchSlot)===Number(chosen));if(idx>=0){const [slot]=ss.bench.splice(idx,1);for(const cardId of slot.stack)ss.discard.push({uid:`${slot.uid}-discard-${cardId}`,cardId});for(const tool of toolsOf(slot))ss.discard.push(tool);}break;}
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:false,filter:effect.filter,effect,optional:!!effect.optional});break;
      }
      case 'drawToHandSize':{const ss=own(ctx),match=(effect.matchSide||'opponent')==='self'?own(ctx):other(ctx),goal=effect.size!=null?Number(effect.size):match.hand.length;while(ss.hand.length<goal&&ss.deck.length)ctx.drawCard(ss);break;}
      case 'chooseTarget':{
        const actionTarget=ctx.action?.choiceTarget||ctx.action?.effectTarget||ctx.action?.target;
        if(ctx.resolvingChoice||actionTarget){applyEffect(effect.effect,ctx);break;}
        if(typeof ctx.requestChoice==='function'){const opponent=effect.target.startsWith('opponent'),bench=effect.target.endsWith('Bench');ctx.requestChoice({kind:'pokemon',side:opponent?'opponent':'self',includeActive:!bench,filter:effect.filter,effect,optional:!!effect.optional});}break;
      }
      case 'coinUntilTails':{const results=[],heads=repeatHeads(ctx,()=>applyEffect(effect.effect,ctx),results);log({type:'coin',heads,coins:'untilTails',results});break;}
      case 'sequence':for(let i=0;i<effect.effects.length;i++){applyEffect(effect.effects[i],ctx);if(ctx.state.phase==='effectChoice'){ctx.state.pendingChoice.afterEffects=[...(ctx.state.pendingChoice.afterEffects||[]),...effect.effects.slice(i+1)];break;}}break;
      case 'coinFlip':{const heads=coin(ctx);log({type:'coin',heads,results:[heads]});applyEffect(heads?effect.heads:effect.tails,ctx);break;}
      case 'healSelf':if(ctx.attacker&&!healingIsBlocked(ctx.state,ctx.attacker,ctx.cardById))ctx.attacker.damage=Math.max(0,Number(ctx.attacker.damage||0)-effect.amount);break;
      case 'heal':for(const s of affected())if(!healingIsBlocked(ctx.state,s,ctx.cardById))s.damage=Math.max(0,Number(s.damage||0)-effect.amount);log({type:'heal',amount:effect.amount});break;
      case 'selfDamage':if(ctx.attacker)ctx.attacker.damage=Number(ctx.attacker.damage||0)+effect.amount;break;
      case 'damage':for(const s of affected()){if(ctx.isAbility){const targetSide=pokemonOn(own(ctx)).includes(s)?ctx.side:ctx.foeSide;if(findPassiveRule(ctx.state,targetSide,s,'preventAbilityDamage',ctx.cardById))continue;}s.damage=Number(s.damage||0)+effect.amount;}break;
      case 'halveRemainingHp':for(const s of affected()){const which=pokemonOn(own(ctx)).includes(s)?ctx.side:ctx.foeSide,max=Math.max(1,Number(ctx.maxHp?ctx.maxHp(which,s):ctx.cardById(s.cardId)?.hp||0)),remaining=Math.max(0,max-Number(s.damage||0)),next=Math.floor(remaining/2);s.damage=Math.max(Number(s.damage||0),max-next);}break;
      case 'setRemainingHp':for(const s of affected()){const which=pokemonOn(own(ctx)).includes(s)?ctx.side:ctx.foeSide,max=Math.max(1,Number(ctx.maxHp?ctx.maxHp(which,s):ctx.cardById(s.cardId)?.hp||0));s.damage=Math.max(Number(s.damage||0),max-Number(effect.amount||0));}break;
      case 'attachEnergyFromDiscard':{for(const s of affected()){const owner=energyOwner(ctx,s);if(!owner)continue;owner.energyDiscard=owner.energyDiscard||{};const type=effect.energyType||ctx.action?.effectEnergyType;if(!type)continue;const available=Math.min(Number(effect.amount||0),Number(owner.energyDiscard[type]||0));if(available<=0)continue;owner.energyDiscard[type]-=available;s.energy[type]=Number(s.energy[type]||0)+available;}break;}
      case 'attachRandomEnergyFromDiscard':{for(const s of affected()){const owner=energyOwner(ctx,s);if(!owner)continue;owner.energyDiscard=owner.energyDiscard||{};for(let i=0;i<Number(effect.amount||1);i++){const units=Object.entries(owner.energyDiscard).flatMap(([type,n])=>Array(Math.max(0,Math.floor(Number(n)||0))).fill(type));if(!units.length)break;const type=units[Math.floor(ctx.random(ctx.state)*units.length)];owner.energyDiscard[type]=Math.max(0,Number(owner.energyDiscard[type]||0)-1);s.energy[type]=Number(s.energy[type]||0)+1;}}break;}
      case 'randomStatus':{for(const s of affected()){const choices=(effect.statuses||STATUSES).filter(status=>!effect.excludeExisting||!s.conditions?.[status]);if(!choices.length)continue;const status=choices[Math.floor(ctx.random(ctx.state)*choices.length)];applyEffect({type:'status',target:effect.target||'opponentActive',status},ctx);}break;}
      case 'allHeadsEffect':{let heads=0;const results=[];for(let i=0;i<effect.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}log({type:'coin',heads,coins:effect.coins,results});if(heads===effect.coins)applyEffect(effect.heads,ctx);break;}
      case 'coinRepeatEffect':{let heads=0;const results=[];for(let i=0;i<effect.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}log({type:'coin',heads,coins:effect.coins,results});for(let i=0;i<heads;i++)applyEffect(effect.effect,ctx);break;}
      case 'endTurn':if(typeof ctx.endTurn==='function')ctx.endTurn();break;
      case 'removeRandomStatus':for(const s of affected()){const keys=Object.keys(s.conditions||{});if(!keys.length)continue;const key=keys[Math.floor(ctx.random(ctx.state)*keys.length)];delete s.conditions[key];}break;
      case 'benchDamage':{const ss=effect.side==='self'?own(ctx):other(ctx);const list=effect.all?ss.bench:targets(effect.side==='self'?'selfBench':'opponentBench',ctx);for(const s of list.filter(s=>s&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s))){const side=effect.side==='self'?ctx.side:ctx.foeSide;const guard=ctx.isAttack&&attackIsPrevented(ctx.state,side,s,ctx.attacker,ctx.cardById);const bonus=ctx.isAttack&&ctx.attacker?modifierAmount(ctx.state,ctx.side,ctx.attacker,'attackDamageAllTargets',ctx.cardById):0,amount=guard?0:Math.max(0,Number(effect.amount||0)+bonus-(ctx.isAttack?modifierAmount(ctx.state,side,s,'damageReduction',ctx.cardById):0));s.damage=Number(s.damage||0)+amount;if(ctx.isAttack&&amount>0)log({type:'benchDamage',targetSide:side,sourceCardId:ctx.attacker?.cardId||null,targetCardId:s.cardId,benchIndex:Number(s.benchSlot||0),amount,attack:ctx.attack?.name||'Attack'});}break;}
      case 'distributeEnergy':{
        const sourceSlot=ctx.attacker;
        let queue=Array.isArray(effect.remainingTypes)?effect.remainingTypes.slice():null;
        if(!queue){
          if(effect.source==='self'){
            queue=[];for(const [type,n] of Object.entries(sourceSlot?.energy||{}))for(let i=0;i<Number(n||0);i++)queue.push(type);
            if(effect.random){const shuffled=[];while(queue.length){const idx=Math.floor(ctx.random(ctx.state)*queue.length);shuffled.push(...queue.splice(idx,1));}queue=shuffled;}
            if(effect.amount!=='all')queue=queue.slice(0,Number(effect.amount||queue.length));
          }else if(Array.isArray(effect.energyTypes))queue=effect.energyTypes.slice();
          else{
            let count=Number(effect.amount||1);
            if(effect.coins){count=0;const results=[];for(let i=0;i<effect.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)count++;}log({type:'coin',heads:count,coins:effect.coins,results});}
            queue=Array(count).fill(effect.energyType);
          }
        }
        if(!queue.length)break;
        const eligibleTargets=excluded=>{const ss=own(ctx),list=effect.target==='selfPokemon'?pokemonOn(ss):(ss.bench||[]).filter(Boolean),skip=new Set(excluded||[]);return list.filter(s=>!skip.has(s.uid)&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s));};
        if(ctx.resolvingChoice){
          const selectedSlot=targets(effect.target,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.filter,s))[0];if(!selectedSlot)break;
          const type=queue.shift();
          if(effect.source==='self'){if(Number(sourceSlot?.energy?.[type]||0)<=0)break;sourceSlot.energy[type]-=1;}
          selectedSlot.energy[type]=Number(selectedSlot.energy[type]||0)+1;ctx.onEnergyAttached?.(selectedSlot,type,1);
          const used=[...(effect.usedUids||[])];if(effect.distinctTargets&&!used.includes(selectedSlot.uid))used.push(selectedSlot.uid);
          const excluded=effect.distinctTargets?used:[];
          if(queue.length&&eligibleTargets(excluded).length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:effect.target==='selfPokemon',filter:effect.filter,excludeUids:excluded,effect:{...effect,remainingTypes:queue,usedUids:used}});
          break;
        }
        const excluded=effect.excludeUids||[];
        if(eligibleTargets(excluded).length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:effect.target==='selfPokemon',filter:effect.filter,excludeUids:excluded,effect:{...effect,remainingTypes:queue}});
        break;
      }
      case 'attachEnergy':{const recipients=affected(),attachedBySide={player:0,opponent:0};for(const s of recipients){s.energy[effect.energyType]=Number(s.energy[effect.energyType]||0)+effect.amount;const side=pokemonOn(own(ctx)).includes(s)?ctx.side:ctx.foeSide;attachedBySide[side]+=effect.amount;if(typeof ctx.onEnergyAttached==='function')ctx.onEnergyAttached(s,effect.energyType,effect.amount);}log({type:'effectEnergy',amount:effect.amount,totalAmount:recipients.length*effect.amount,attachedBySide,energyType:effect.energyType});break;}
      case 'discardEnergy':for(const s of affected()){const owner=energyOwner(ctx,s);if(effect.random){const count=effect.amount==='all'?totalEnergy(s.energy):effect.amount;for(let i=0;i<count;i++){const units=Object.entries(s.energy).flatMap(([type,n])=>Array(Math.max(0,Math.floor(n))).fill(type));if(!units.length)break;const type=units[Math.floor(ctx.random(ctx.state)*units.length)];s.energy[type]--;recordDiscardedEnergy(owner,type,1);}}else if(effect.energyType){const before=Number(s.energy[effect.energyType]||0),after=effect.amount==='all'?0:Math.max(0,before-effect.amount);s.energy[effect.energyType]=after;recordDiscardedEnergy(owner,effect.energyType,before-after);}else if(ctx.action?.effectEnergyType){const type=ctx.action.effectEnergyType,before=Number(s.energy[type]||0),after=effect.amount==='all'?0:Math.max(0,before-Number(effect.amount||0));s.energy[type]=after;recordDiscardedEnergy(owner,type,before-after);}else{const before={...(s.energy||{})};s.energy=effect.amount==='all'?{}:spendGenericEnergy(s.energy,Math.min(effect.amount,totalEnergy(s.energy)));for(const [type,n] of Object.entries(before))recordDiscardedEnergy(owner,type,Number(n||0)-Number(s.energy?.[type]||0));}}break;
      case 'moveEnergy':{if(!ctx.resolvingChoice&&typeof ctx.requestChoice==='function'&&(effect.source==='selfBench'||effect.target==='selfBench')){const selector=effect.source==='selfBench'?effect.source:effect.target;ctx.requestChoice({kind:'pokemon',side:'self',includeActive:false,filter:effect.source==='selfBench'?effect.sourceFilter:effect.filter,effect});break;}const sources=targets(effect.source,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.sourceFilter,s)),destination=targets(effect.target,ctx)[0];if(!sources.length||!destination)break;let remaining=effect.amount==='all'?Infinity:effect.amount;for(const source of sources){if(source===destination)continue;for(const type of Object.keys(source.energy)){const chosenType=ctx.action?.effectEnergyType||effect.energyType;if(chosenType&&type!==chosenType)continue;if(effect.allowedEnergyTypes&&!effect.allowedEnergyTypes.includes(type))continue;const amount=Math.min(remaining,Number(source.energy[type]||0));source.energy[type]-=amount;destination.energy[type]=Number(destination.energy[type]||0)+amount;remaining-=amount;if(remaining<=0)break;}if(remaining<=0)break;}break;}
      case 'handShuffle':{const sides=effect.side==='both'?[own(ctx),other(ctx)]:[effect.side==='opponent'?other(ctx):own(ctx)];const opponentCount=other(ctx).hand.length,counts=sides.map(s=>effect.draw==='same'?s.hand.length:effect.draw==='opponentHandCount'?opponentCount:effect.draw==='pointsRemaining'?Math.max(0,3-Number(s.points||0)):effect.draw);for(const ss of sides){ss.deck.push(...ss.hand.splice(0));ctx.shuffle(ctx.state,ss.deck);}sides.forEach((ss,index)=>{for(let i=0;i<counts[index];i++)ctx.drawCard(ss);});break;}
      case 'preventStatus':for(const s of affected())s.statusGuard={...effect};break;
      case 'draw':{const ss=effect.side==='opponent'?other(ctx):own(ctx);for(let i=0;i<effect.amount;i++)ctx.drawCard(ss);log({type:'draw',amount:effect.amount});break;}
      case 'topDeckFilter':{const ss=own(ctx);if(!ss.deck.length)break;const ref=ss.deck.shift(),card=ctx.cardById(ref.cardId);if(matchesFilter(card,effect.filter)&&ss.hand.length<10){ss.hand.push(ref);log({type:'topDeckMatch',cardId:ref.cardId});}else{ss.deck.push(ref);log({type:'topDeckBottom',cardId:ref.cardId});}break;}
      case 'fieldCountDraw':{const slots=effect.side==='both'?[...pokemonOn(own(ctx)),...pokemonOn(other(ctx))]:pokemonOn(own(ctx));const amount=slots.filter(slot=>matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot)).length;for(let i=0;i<amount;i++)ctx.drawCard(own(ctx));log({type:'draw',amount});break;}
      case 'searchRandomBasic':case 'search':{const ss=own(ctx),source=ss[effect.source||'deck'];for(let i=0;i<effect.amount&&ss.hand.length<10;i++){const candidates=source.map((r,index)=>({r,index})).filter(({r})=>matchesFilter(ctx.cardById(r.cardId),effect.type==='searchRandomBasic'?{kind:'pokemon',stage:'Basic'}:effect.filter));if(!candidates.length)break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)];const [found]=source.splice(hit.index,1);ss.hand.push(found);log({type:'search',cardId:found.cardId});}if((effect.source||'deck')==='deck'&&ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);break;}
      case 'switch':{const a=ctx.action||{},side=effect.side==='opponent'?other(ctx):own(ctx);switchPokemon(side,effect.source?ctx.attacker?.benchSlot:a.effectBenchIndex==null?a.benchIndex:a.effectBenchIndex,ctx.state);log({type:'switch'});break;}
      case 'status':{const recipients=targets(effect.target||'opponentActive',ctx).filter(s=>(s===own(ctx).active||s===other(ctx).active)&&!protectedFromEffects(s,ctx)&&!statusIsPrevented(ctx.state,s,ctx.cardById,effect.status)),affectedBySide={player:0,opponent:0};for(const s of recipients){s.conditions=s.conditions||{};if(['sleep','paralysis','confusion'].includes(effect.status))for(const k of ['sleep','paralysis','confusion'])delete s.conditions[k];s.conditions[effect.status]=effect.status==='poison'?{amount:effect.amount==null?10:effect.amount}:effect.status==='paralysis'?{appliedTurn:ctx.state.turnNumber}:effect.status==='sleep'&&effect.recoveryCoins?{recoveryCoins:Number(effect.recoveryCoins)}:true;affectedBySide[s===own(ctx).active?ctx.side:ctx.foeSide]++;}log({type:'status',status:effect.status,affectedCount:recipients.length,affectedBySide});break;}
      case 'playFossil':throw new Error('playFossil must resolve as a Trainer placement.');
      case 'rareCandy':throw new Error('rareCandy must resolve as a Trainer evolution.');
      case 'discardSelf':{const slot=ctx.attacker,ss=own(ctx);if(!slot)break;for(let i=slot.stack.length-1;i>=0;i--)ss.discard.push({uid:slot.uid+'-stack-'+i,cardId:slot.stack[i]});for(const tool of toolsOf(slot))ss.discard.push(tool);if(ss.active===slot)ss.active=null;else{const index=ss.bench.indexOf(slot);if(index>=0)ss.bench.splice(index,1);}log({type:'discardPokemon',cardId:slot.cardId});break;}
      case 'lock':for(const s of affected()){s.locks=s.locks||[];s.locks.push({...effect,expiresTurn:effect.duration==='whileInPlay'?null:ctx.state.turnNumber+(effect.duration==='nextOwnTurn'?2:1)});}break;
      case 'koGuard':for(const s of affected())s.koGuard={...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'preventDamage':for(const s of affected())s.attackGuard={...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'selectedDamage':case 'selectedEnergyDamage':throw new Error(`${effect.type} must resolve as part of an attack.`);
      case 'removeStatus':for(const s of affected())clearConditions(s);break;
      case 'modifier':{const list=effect.scope==='both'||effect.scope==='team'||effect.scope==='active'||effect.scope==='opponentActive'?[ctx.attacker]:affected();ctx.state.modifiers=ctx.state.modifiers||[];for(const s of list)ctx.state.modifiers.push({...effect,ownerSide:effect.scope==='opponentActive'?ctx.foeSide:(own(ctx).active===s||own(ctx).bench.includes(s)?ctx.side:ctx.foeSide),sourceSide:ctx.side,sourceUid:ctx.attacker&&ctx.attacker.uid,targetUid:effect.scope==='both'||effect.scope==='team'||effect.scope==='active'||effect.scope==='opponentActive'?null:s.uid,startsTurn:effect.duration==='nextOwnTurn'?ctx.state.turnNumber+2:null,expiresTurn:effect.duration==='turn'?ctx.state.turnNumber:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:effect.duration==='nextOwnTurn'?ctx.state.turnNumber+2:null});break;}
      case 'damageFromDamage':case 'bonusDamage':case 'coinDamage':case 'energyDamage':case 'benchCountDamage':case 'statusDamage':throw new Error(`${effect.type} must resolve as part of an attack.`);
    }
  }
  function resolveAttack(attack,ctx){
    ctx={...ctx,attack};let damage=Math.max(0,Number(attack.damage)||0),damageTarget=undefined,damageRules={},attackDoesNothing=false;const pending=[];
    function visit(e){
      if(!e)return;assertEffect(e);if(e.type==='attackRequirement'){if(!conditionMatches(e.condition,ctx)){damage=0;attackDoesNothing=true;pending.length=0;}return;}if(!conditionMatches(e.condition,ctx))return;
      if(e.type==='sequence'){for(const child of e.effects)visit(child);return;}
      if(e.type==='coinFlip'){const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,heads,results:[heads]});visit(heads?e.heads:e.tails);return;}
      if(e.type==='coinAttackGate'){const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,heads,results:[heads]});if(heads)pending.push(e.heads);else damage=0;return;}
      if(e.type==='coinAnyHeadsGate'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});if(heads===0)damage=0;return;}
      if(e.type==='topDeckDiscardBonus'){const ss=own(ctx);const ref=ss.deck.shift();if(ref){ss.discard.push(ref);const card=ctx.cardById(ref.cardId);if(matchesFilter(card,e.filter,ref))damage+=Number(e.amount||0);}return;}
      if(e.type==='damageRule'){damageRules={...damageRules,...e};return;}
      let amount;
      if(e.type==='discardChosenHand'&&e.required&&e.zeroDamageIfFailed){
        const ss=e.side==='opponent'?other(ctx):own(ctx),candidates=(ss.hand||[]).filter(r=>!e.filter||matchesFilter(ctx.cardById(r.cardId),e.filter,r));
        if(candidates.length<Math.max(1,Number(e.amount||1))){damage=0;pending.length=0;attackDoesNothing=true;return;}
        pending.push(e);return;
      }
      if(attackDoesNothing)return;
      if(e.type==='chooseDiscardForBonus'){const selectedUids=String(ctx.action?.effectSelection||'').split(',').filter(Boolean),ss=own(ctx);let count=0;if(e.zone==='bench'){for(const uid of selectedUids){const idx=(ss.bench||[]).findIndex(s=>s&&s.uid===uid&&matchesFilter(ctx.cardById(s.cardId),e.filter,s));if(idx<0)continue;const [slot]=ss.bench.splice(idx,1);for(const cardId of slot.stack||[slot.cardId])ss.discard.push({uid:`${slot.uid}-discard-${cardId}`,cardId});for(const tool of toolsOf(slot))ss.discard.push(tool);count++;}}else{for(const uid of selectedUids){const idx=(ss.hand||[]).findIndex(r=>r.uid===uid&&matchesFilter(ctx.cardById(r.cardId),e.filter,r));if(idx<0)continue;const [ref]=ss.hand.splice(idx,1);ss.discard.push(ref);count++;}}damage+=count*Number(e.amount||0);return;}
      if(e.type==='optionalDiscardBenchBonus'){if(!ctx.action?.choiceSkip){damage+=Number(e.amount||0);pending.push({type:'discardBenchPokemon',filter:e.filter});}return;}
      if(e.type==='copyRandomAttackFromPrivate'){const refs=[...(other(ctx).hand||[]),...(other(ctx).deck||[])],attacks=[];for(const ref of refs){const card=ctx.cardById(ref.cardId);for(const attack of card?.attacks||[])attacks.push({card,attack});}if(!attacks.length){damage=0;return;}const hit=attacks[Math.floor(ctx.random(ctx.state)*attacks.length)];ctx.state.log.push({type:'copyAttack',side:ctx.side,cardId:hit.card.id,attack:hit.attack.name,source:'private'});if(Number(ctx.copyDepth||0)>4){damage=0;return;}const copied=resolveAttack(hit.attack,{...ctx,attack:hit.attack,copyDepth:Number(ctx.copyDepth||0)+1});damage=copied.damage;damageTarget=copied.damageTarget;damageRules={...damageRules,...copied.damageRules};pending.push(...copied.pendingEffects);return;}
      if(e.type==='copyAttack'){
        const a=ctx.action||{},sourceSide=e.source==='selfBench'?own(ctx):other(ctx);let slot=null;
        if(e.source==='opponentActive')slot=sourceSide.active;else if(a.choiceTarget==='active')slot=sourceSide.active;else slot=(sourceSide.bench||[]).find(s=>s&&Number(s.benchSlot)===Number(a.choiceBenchIndex));
        const sourceCard=slot&&ctx.cardById(slot.cardId),chosen=sourceCard?.attacks?.[Number(a.choiceAttackIndex)];if(!chosen){damage=0;return;}
        if(e.excludeEx&&sourceCard&&(sourceCard.isEx||sourceCard.points>=2||/ ex$/.test(sourceCard.name))){damage=0;return;}
        if(e.requiresCopiedCost&&typeof ctx.canPayCopiedCost==='function'&&!ctx.canPayCopiedCost(chosen)){damage=0;return;}
        if(Number(ctx.copyDepth||0)>4){damage=0;return;}
        const copied=resolveAttack(chosen,{...ctx,attack:chosen,copyDepth:Number(ctx.copyDepth||0)+1});damage=copied.damage;damageTarget=copied.damageTarget;damageRules={...damageRules,...copied.damageRules};pending.push(...copied.pendingEffects);return;
      }
      if(e.type==='selectedDamage'){damage=e.amount;damageTarget=targets(e.target,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s))[0]||null;if(!damageTarget)damage=0;return;}
      if(e.type==='selectedEnergyDamage'){damageTarget=targets(e.target,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s))[0]||null;damage=damageTarget?totalEnergy(damageTarget.energy)*e.amount:0;return;}
      if(e.type==='bonusDamage')amount=e.amount;
      else if(e.type==='coinDamage'){let heads=0,coins=e.coins==='untilTails'?e.coins:Number(e.coins||0)+coinBonusAmount(ctx.state,ctx.side,ctx.attacker,ctx.attack?.name,ctx.cardById),results=[];if(coins!=='untilTails'&&e.extraCoinsIfTool&&toolsOf(ctx.attacker).some(t=>ctx.cardById(t.cardId)?.name===e.extraCoinsIfTool.name))coins+=Number(e.extraCoinsIfTool.amount||0);if(coins==='untilTails')heads=repeatHeads(ctx,()=>{},results);else for(let i=0;i<coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins,results});amount=heads*e.amount;}
      else if(e.type==='coinDiscardEnergyDamage'){let heads=0,discarded=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}for(let i=0;i<heads&&Number(ctx.attacker?.energy?.[e.energyType]||0)>0;i++){ctx.attacker.energy[e.energyType]--;recordDiscardedEnergy(own(ctx),e.energyType,1);discarded++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});amount=discarded*e.amount;}
      else if(e.type==='coinTierBonus'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});amount=Number(e.tiers?.[heads]||0);}
      else if(e.type==='coinDamageStatus'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});amount=heads*e.amount;if(heads>=e.minHeads)pending.push({type:'status',target:'opponentActive',status:e.status});}
      else if(e.type==='coinRepeatEffect'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});if(heads===0&&e.zeroDamageIfNoHeads)damage=0;for(let i=0;i<heads;i++)pending.push(e.effect);return;}
      else if(e.type==='energyDamage'){const list=e.all?pokemonOn(e.source==='opponent'?other(ctx):own(ctx)):[e.source==='opponent'?ctx.defender:ctx.attacker].filter(Boolean);const count=s=>e.energyType?Number(s.energy?.[e.energyType]||0):Array.isArray(e.energyTypes)?e.energyTypes.reduce((n,t)=>n+Number(s.energy?.[t]||0),0):totalEnergy(s.energy);amount=Math.max(0,list.reduce((n,s)=>n+count(s),0)-Number(e.extraAbove||0))*e.amount;}
      else if(e.type==='benchCountDamage'){const list=e.side==='both'?[...own(ctx).bench,...other(ctx).bench]:(e.side==='opponent'?other(ctx):own(ctx)).bench;amount=list.filter(s=>s&&(!e.pokemonType||hasType(ctx.cardById(s.cardId),e.pokemonType))&&matchesFilter(ctx.cardById(s.cardId),e.filter,s)).length*e.amount;}
      else if(e.type==='damageFromDamage')amount=Number((e.source==='self'?ctx.attacker:ctx.defender)?.damage||0)*e.amount;
      else if(e.type==='statusDamage')amount=ctx.defender?.conditions?.[e.status]?e.amount:0;
      else if(e.type==='allHeadsBonus'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});amount=heads===e.coins?e.amount:0;}
      else if(e.type==='pointDamage')amount=Number((e.side==='opponent'?other(ctx):own(ctx)).points||0)*e.amount;
      else if(e.type==='namedAttackCountDamage'){const cards=[...pokemonOn(own(ctx)).map(s=>ctx.cardById(s.cardId)),...(own(ctx).hand||[]).map(r=>ctx.cardById(r.cardId))];amount=cards.filter(c=>(c?.attacks||[]).some(a=>a.name===e.attackName)).length*e.amount;}
      else if(e.type==='usedAttackCountDamage')amount=Number(own(ctx).attackCounts?.[e.attackName]||0)*e.amount;
      else if(e.type==='coinDamageByPokemon'){const count=pokemonOn(own(ctx)).filter(s=>!e.filter||matchesFilter(ctx.cardById(s.cardId),e.filter,s)).length;let heads=0;const results=[];for(let i=0;i<count;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:count,results});amount=heads*e.amount;}
      else if(e.type==='retreatCostDamage')amount=(ctx.retreatCost?ctx.retreatCost(ctx.foeSide):Number(ctx.cardById(ctx.defender?.cardId)?.retreat||0))*e.amount;
      else if(e.type==='toolCountDamage')amount=pokemonOn(own(ctx)).reduce((n,s)=>n+toolsOf(s).length,0)*e.amount;
      else if(e.type==='coinDamageByEnergy'){const count=e.energyType?Number(ctx.attacker?.energy?.[e.energyType]||0):totalEnergy(ctx.attacker?.energy),results=Array.from({length:count},()=>coin(ctx)),heads=results.filter(Boolean).length;ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:count,results});amount=heads*e.amount;}
      else if(e.type==='discardCountDamage'){const list=own(ctx).discard||[];amount=list.filter(r=>matchesFilter(ctx.cardById(r.cardId),e.filter)).length*e.amount;}
      else if(e.type==='fieldCountDamage'){const ss=e.side==='opponent'?other(ctx):own(ctx);amount=pokemonOn(ss).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s)).length*e.amount;}
      else if(e.type==='energyTypeCountDamage'){amount=Object.values(ctx.attacker?.energy||{}).filter(n=>Number(n)>0).length*e.amount;}
      else if(e.type==='statusCountDamage'){amount=Object.keys(ctx.defender?.conditions||{}).length*e.amount;}
      else if(e.type==='handCountDamage'){amount=own(ctx).hand.length*e.amount;}
      else if(e.type==='remainingHpDamage'){const max=ctx.maxHp?ctx.maxHp(ctx.side,ctx.attacker):Number(ctx.cardById(ctx.attacker?.cardId)?.hp||0);amount=Math.max(0,max-Number(ctx.attacker?.damage||0));}
      else if(e.type==='selfDamagePenalty')amount=-Number(ctx.attacker?.damage||0);
      else if(e.type==='deckCountDamage'){const ss=e.side==='self'?own(ctx):other(ctx);amount=(ss.deck||[]).filter(r=>matchesFilter(ctx.cardById(r.cardId),e.filter)).length*e.amount;}
      else if(e.type==='topDeckCountDamage'){amount=topDeckCountAmount(e,ctx);}
      else if(e.type==='filteredHandCountDamage'){const ss=e.side==='opponent'?other(ctx):own(ctx);amount=(ss.hand||[]).filter(r=>matchesFilter(ctx.cardById(r.cardId),e.filter,r)).length*e.amount;}
      else if(e.type==='pointsGainedLastTurnDamage')amount=Number(other(ctx).pointsGainedLastTurn||0)*Number(e.amount||0);
      else if(e.type==='koCountDamage')amount=Number(own(ctx).knockoutsTaken||0)*Number(e.amount||0);
      else{pending.push(e);return;}
      damage=e.mode==='replace'?amount:damage+amount;
    }
    visit(attack.effect);
    return {damage:Math.max(0,damage),pendingEffects:pending,damageTarget,damageRules};
  }
  function targetChoices(selector,ctx){
    const ownSide=own(ctx),foe=other(ctx);const bench=(ss,prefix)=>ss.bench.filter(Boolean).map(s=>({target:prefix+'bench',benchIndex:Number(s.benchSlot)}));
    if(selector==='selfBench')return bench(ownSide,'');
    if(selector==='opponentBench')return bench(foe,'opponent').map(a=>({...a,target:'opponentBench'}));
    if(selector==='selfPokemon')return [...(ownSide.active?[{target:'active'}]:[]),...bench(ownSide,'')];
    if(selector==='opponentPokemon')return [...(foe.active?[{target:'opponentActive'}]:[]),...bench(foe,'opponent').map(a=>({...a,target:'opponentBench'}))];
    return [{}];
  }
  function choicesForEffect(effect,ctx){
    assertEffect(effect);if(!effect)return [{}];if(!conditionMatches(effect.condition,ctx))return ctx.isAttack?[{}]:[];
    if(effect.type==='attackRequirement')return conditionMatches(effect.condition,ctx)?[{}]:[];
    if(effect.type==='chooseDiscardForBonus'){const items=effect.zone==='bench'?(own(ctx).bench||[]).filter(s=>s&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s)):(own(ctx).hand||[]).filter(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter,r));const max=Math.min(Number(effect.max||items.length),items.length),out=[];for(let mask=0;mask<(1<<items.length);mask++){const picked=[];for(let i=0;i<items.length;i++)if(mask&(1<<i))picked.push(items[i].uid);if(picked.length<=max)out.push({effectSelection:picked.join(','),choiceLabel:`Discard ${picked.length}`});}return out;}
    if(['reorderTop','redistributeEnergy','distributeDiscardEnergyDistinct','benchBasicsFromOpponentHand'].includes(effect.type))return [{}];
    if(effect.type==='optionalDiscardBenchBonus'){const choices=targetChoices('selfBench',ctx).filter(action=>targets('selfBench',{...ctx,action}).some(slot=>matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot)));return [...choices,{choiceSkip:true}];}
    if(effect.type==='moveRandomEnergy'&&effect.source==='opponentBench')return targetChoices('opponentBench',ctx).filter(action=>targets('opponentBench',{...ctx,action}).some(slot=>totalEnergy(slot.energy)>0));
    if(effect.type==='stadiumAction')return choicesForEffect(effect.effect,ctx);
    if(effect.type==='scheduleDelayed'&&effect.targetMode==='selectedSpot')return targetChoices('opponentPokemon',ctx);
    if(effect.type==='multiTargetDamage')return [{}];
    if(effect.type==='copyAttack'){
      const ss=effect.source==='selfBench'?own(ctx):other(ctx),slots=effect.source==='opponentActive'?[ss.active].filter(Boolean):effect.source==='selfBench'?(ss.bench||[]).filter(Boolean):pokemonOn(ss),out=[];
      for(const slot of slots){const card=ctx.cardById(slot.cardId);if(effect.excludeEx&&(card?.isEx||card?.points>=2||/ ex$/.test(card?.name||'')))continue;for(const [attackIndex,attack] of (card?.attacks||[]).entries()){if(effect.requiresCopiedCost&&typeof ctx.canPayCopiedCost==='function'&&!ctx.canPayCopiedCost(attack))continue;const nested=choicesForEffect(attack.effect,{...ctx,attack});const bases=nested.length?nested:[{}];for(const sub of bases)out.push({...sub,choiceTarget:slot===ss.active?'active':'bench',choiceBenchIndex:slot.benchSlot,choiceCardId:slot.cardId,choiceAttackIndex:attackIndex});}}
      if(out.length)return out;
      return effect.requiresCopiedCost?[]:(ctx.isAttack?[{}]:[]);
    }
    if(effect.type==='chooseTarget'){
      return targetChoices(effect.target,ctx).filter(action=>targets(effect.target,{...ctx,action}).some(slot=>matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot)));
    }
    if(['forceOpponentSwitch','discardChosenHand','shuffleChosenHand','searchChosen','selectTopToHand','swapHandWithRandomDeck','discardBenchPokemon','chooseOption'].includes(effect.type))return [{}];
    if(effect.type==='coinUntilTails'||effect.type==='coinRepeatEffect')return choicesForEffect(effect.effect,ctx);
    if(effect.type==='discardEnergy'&&!effect.energyType&&!effect.random){const selector=effect.target||'self';return targetChoices(selector,ctx).flatMap(action=>{const list=targets(selector,{...ctx,action}).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.filter,s)),types=new Set();for(const slot of list)for(const [type,n] of Object.entries(slot.energy||{}))if(Number(n)>0)types.add(type);return [...types].map(type=>({...action,effectEnergyType:type}));});}
    if(effect.type==='attachEnergyFromDiscard'&&!effect.energyType){const selector=effect.target||'self';return targetChoices(selector,ctx).flatMap(action=>{const list=targets(selector,{...ctx,action}).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.filter,s));if(!list.length)return[];const owner=own(ctx),types=Object.entries(owner.energyDiscard||{}).filter(([,n])=>Number(n)>=Number(effect.amount||1)).map(([type])=>type);return types.map(type=>({...action,effectEnergyType:type}));});}
    if(effect.type==='moveEnergy'){const selector=effect.source==='selfBench'?'selfBench':effect.target;let choices=targetChoices(selector,ctx).flatMap(action=>{const slots=targets(effect.source,{...ctx,action}).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.sourceFilter,s));const types=new Set();for(const slot of slots)for(const [type,n] of Object.entries(slot.energy||{}))if(Number(n)>0&&(!effect.energyType||type===effect.energyType)&&(!effect.allowedEnergyTypes||effect.allowedEnergyTypes.includes(type)))types.add(type);if(effect.energyType)return slots.some(s=>Number(s.energy?.[effect.energyType]||0)>0)?[action]:[];if(effect.allowedEnergyTypes)return [...types].map(type=>({...action,effectEnergyType:type}));return slots.some(s=>totalEnergy(s.energy)>0)?[action]:[];});return choices.length?choices:ctx.isAttack?[{}]:[];}
    if(effect.type==='switch'&&effect.source)return ctx.attacker&&own(ctx).bench.includes(ctx.attacker)?[{}]:[];
    if(effect.type==='sequence'||effect.type==='coinFlip'){
      const children=effect.type==='sequence'?effect.effects:[effect.heads,effect.tails].filter(Boolean);let result=[{}];
      for(const e of children){const choices=choicesForEffect(e,ctx);result=result.flatMap(a=>choices.filter(b=>!a.target||!b.target||(a.target===b.target&&a.benchIndex===b.benchIndex)).map(b=>({...a,...b})));}return result;
    }
    const selector=effect.type==='switch'?(effect.side==='opponent'?'opponentBench':'selfBench'):effect.type==='benchDamage'&&!effect.all?(effect.side==='self'?'selfBench':'opponentBench'):effect.target;
    const choices=targetChoices(selector,ctx);if(!choices.length&&ctx.isAttack&&effect.type!=='selectedDamage')return [{}];
    const valid=choices.filter(action=>{const list=targets(selector,{...ctx,action}).filter(s=>(!effect.excludeSelf||s!==ctx.attacker)&&(!effect.requirePlayedBeforeTurn||Number(s.playedOnSideTurn)<Number(own(ctx).turnCount))&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s));if((effect.type==='heal'||effect.type==='healSelf')&&!ctx.isAttack)return list.some(s=>Number(s.damage)>0);if(effect.type==='discardEnergy'&&!ctx.isAttack){const needed=effect.amount==='all'?1:Number(effect.amount||0);return list.some(s=>effect.energyType?Number(s.energy[effect.energyType]||0)>=needed:totalEnergy(s.energy)>=needed);}if(effect.type==='attachEnergyFromDiscard'&&!ctx.isAttack)return list.length>0&&Number(own(ctx).energyDiscard?.[effect.energyType]||0)>=Number(effect.amount||1);if(effect.type==='switch')return (effect.side==='opponent'?other(ctx):own(ctx)).active!=null&&list.length>0;return !selector||list.length>0;});
    return valid.length||!ctx.isAttack||effect.type==='selectedDamage'?valid:[{}];
  }
  function toolCapacity(state,side,slot,cardById){if(!slot)return 1;if(Number(slot.syntheticToolCapacity)>0)return Number(slot.syntheticToolCapacity);let cap=1;if(abilitiesSuppressed(state,side,slot,cardById))return cap;const card=cardById(slot.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean),ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};const scan=e=>{if(!e)return;if(e.type==='sequence'){for(const x of e.effects||[])scan(x);return;}if(e.type==='toolCapacity'&&conditionMatches(e.condition,ctx))cap=Math.max(cap,Number(e.amount||1));};for(const ability of abilities)if(ability.type==='passive')scan(ability.effect);return cap;}
  function passiveModifiers(effect,source,side,state,slot,stat,out,cardById){
    if(!effect)return;
    if(effect.type==='sequence'){effect.effects.forEach(e=>passiveModifiers(e,source,side,state,slot,stat,out,cardById));return;}
    if(effect.type!=='modifier'||effect.stat!==stat||!matchesFilter(cardById(slot.cardId),effect.filter,slot))return;
    const opposingActive=state.sides[side==='player'?'opponent':'player'].active;if(effect.opponentFilter&&(!opposingActive||!matchesFilter(cardById(opposingActive.cardId),effect.opponentFilter,opposingActive)))return;
    if(!conditionMatches(effect.condition,{state,side,foeSide:side==='player'?'opponent':'player',attacker:source,defender:state.sides[side==='player'?'opponent':'player'].active,cardById}))return;
    const ss=state.sides[side];if(effect.duration==='whileActive'&&ss.active!==source)return;
    if(effect.scope==='both'||effect.scope==='team'||effect.scope==='active'&&ss.active===slot||effect.scope==='opponentActive'&&state.sides[side==='player'?'opponent':'player'].active===slot||(!effect.scope||effect.scope==='self')&&source===slot){let amount=effect.amount;if(effect.perEnergy){const energy=slot.energy||{};amount*=effect.energyType?Number(energy[effect.energyType]||0):totalEnergy(energy);}if(effect.perPoints)amount*=Number(state.sides[side].points||0);if(effect.nonStacking){out._nonStacking=out._nonStacking||new Set();const sourceName=cardById(source?.cardId)?.name||source?.cardId||'effect',key=`${sourceName}|${stat}|${effect.scope||'self'}|${JSON.stringify(effect.filter||{})}|${JSON.stringify(effect.condition||{})}`;if(out._nonStacking.has(key))return;out._nonStacking.add(key);}out.push(amount);}
  }
  function applyPersistentEvent(effect,event,ctx){
    if(!effect)return;
    if(effect.type==='sequence'){for(const child of effect.effects)applyPersistentEvent(child,event,ctx);return;}
    if(effect.type!=='triggeredEffect'||effect.event!==event)return;
    if(effect.turn&&effect.turn!=='any'){const ownersTurn=ctx.state.activeSide===ctx.side;if(effect.turn==='owner'&&!ownersTurn||effect.turn==='opponent'&&ownersTurn)return;}
    if(effect.activeOnly&&own(ctx).active!==ctx.attacker)return;
    if(effect.benchOnly&&own(ctx).active===ctx.attacker)return;
    if(effect.opponentAttackOnly&&!(ctx.eventData?.source?.attack&&ctx.eventData.source.side===ctx.foeSide))return;
    if(!conditionMatches(effect.condition,ctx))return;
    applyEffect(effect.effect,ctx);
  }
  function scanEffect(effect,type,ctx){if(!effect)return null;if(effect.type==='sequence'){for(const child of effect.effects){const found=scanEffect(child,type,ctx);if(found)return found;}return null;}return effect.type===type&&(!ctx||conditionMatches(effect.condition,ctx))?effect:null;}
  function coinRerollSource(state,side,scope,subject,cardById){
    const ss=state?.sides?.[side];if(!ss||ss.coinRerollUsedTurn?.[scope]===state.turnNumber)return null;
    for(const source of pokemonOn(ss)){
      if(abilitiesSuppressed(state,side,source,cardById))continue;
      const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
      for(const ability of abilities){if(ability.type!=='passive'||ability.activeOnly&&ss.active!==source||ability.benchOnly&&ss.active===source)continue;
        const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:source,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
        const rule=scanEffect(ability.effect,'coinReroll',ctx);if(!rule||rule.scope!==scope)continue;
        if(rule.filter&&(!subject||!matchesFilter(cardById(subject.cardId),rule.filter,subject)))continue;
        return {sourceUid:source.uid,abilityName:ability.name,rule};
      }
    }
    return null;
  }

  function abilitiesSuppressed(state,side,slot,cardById){
    if(!slot)return false;
    if(slot.abilitySuppressed){if(slot.abilitySuppressed.duration!=='whileActive'||state.sides[side].active===slot)return true;}
    for(const sourceSide of ['player','opponent'])for(const source of pokemonOn(state.sides[sourceSide])){
      const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
      for(const ability of abilities){if(ability.type!=='passive'||ability.activeOnly&&state.sides[sourceSide].active!==source||ability.benchOnly&&state.sides[sourceSide].active===source)continue;
        const ctx={state,side:sourceSide,foeSide:sourceSide==='player'?'opponent':'player',attacker:source,defender:state.sides[sourceSide==='player'?'opponent':'player'].active,cardById};
        const rule=scanEffect(ability.effect,'abilitySuppression',ctx);if(!rule)continue;
        if(rule.scope==='self'&&source!==slot)continue;if(rule.scope==='team'&&sourceSide!==side)continue;if(rule.scope==='opponent'&&sourceSide===side)continue;
        if(matchesFilter(cardById(slot.cardId),rule.filter,slot))return true;
      }
    }
    return false;
  }
  function evolutionRule(state,side,slot,type,cardById){
    if(!slot||abilitiesSuppressed(state,side,slot,cardById))return null;
    const card=cardById(slot.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean),ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
    for(const ability of abilities){if(ability.type!=='passive'||ability.activeOnly&&state.sides[side].active!==slot||ability.benchOnly&&state.sides[side].active===slot)continue;const rule=scanEffect(ability.effect,type,ctx);if(rule)return rule;}return null;
  }
  function attackCostOverride(state,side,slot,attack,cardById){
    const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,attack,cardById};
    const scan=e=>{if(!e)return null;if(e.type==='sequence'){for(const child of e.effects){const r=scan(child);if(r)return r;}return null;}return e.type==='conditionalAttackCost'&&conditionMatches(e.condition,ctx)?e.cost:null;};
    return scan(attack?.effect);
  }
  function effectiveTypes(state,side,slot,cardById){
    const card=cardById(slot?.cardId),out=new Set(card?.types?.length?card.types:[card?.subtype].filter(Boolean));if(!slot||abilitiesSuppressed(state,side,slot,cardById))return [...out];
    const abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean),ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
    for(const ability of abilities){if(ability.type!=='passive'||ability.activeOnly&&state.sides[side].active!==slot||ability.benchOnly&&state.sides[side].active===slot)continue;const rule=scanEffect(ability.effect,'additionalType',ctx);if(rule)for(const type of rule.types||[])out.add(type);}return [...out];
  }
  function findPassiveRule(state,side,slot,type,cardById){
    if(type!=='abilitySuppression'&&abilitiesSuppressed(state,side,slot,cardById))return null;
    const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
    const find=e=>{if(!e)return null;if(e.type==='sequence'){for(const child of e.effects){const r=find(child);if(r)return r;}return null;}return e.type===type&&conditionMatches(e.condition,ctx)?e:null;};
    const card=cardById(slot?.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
    for(const a of abilities){if(a.type!=='passive'||a.activeOnly&&state.sides[side].active!==slot||a.benchOnly&&state.sides[side].active===slot)continue;const r=find(a.effect);if(r)return r;}
    for(const tool of toolsOf(slot)){const r=find(cardById(tool.cardId)?.effect);if(r)return r;}
    return null;
  }
  function canUsePreviousEvolutionAttacks(state,side,slot,cardById){
    if(!slot||!Array.isArray(slot.stack)||slot.stack.length<2)return false;
    const find=e=>{if(!e)return null;if(e.type==='sequence'){for(const child of e.effects){const r=find(child);if(r)return r;}return null;}return e.type==='previousEvolutionAttacks'?e:null;};
    const ss=state.sides[side];
    for(const tool of toolsOf(slot))if(find(cardById(tool.cardId)?.effect))return true;
    for(const source of pokemonOn(ss)){
      if(abilitiesSuppressed(state,side,source,cardById))continue;
      const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
      for(const a of abilities){if(a.type!=='passive'||a.activeOnly&&ss.active!==source||a.benchOnly&&ss.active===source)continue;const rule=find(a.effect);if(!rule)continue;if(source===slot&&(!rule.scope||rule.scope==='self'))return true;if(rule.scope==='team'&&matchesFilter(cardById(slot.cardId),rule.filter,slot))return true;}
    }
    return false;
  }


  function coinBonusAmount(state,side,slot,attackName,cardById){if(!slot||!attackName)return 0;let total=0;for(const source of pokemonOn(state.sides[side])){if(abilitiesSuppressed(state,side,source,cardById))continue;const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);for(const a of abilities){if(a.type!=='passive'||a.activeOnly&&state.sides[side].active!==source||a.benchOnly&&state.sides[side].active===source)continue;const scan=e=>{if(!e)return;if(e.type==='sequence')return e.effects.forEach(scan);if(e.type==='coinBonus'&&e.attackName===attackName)total+=Number(e.amount||0);};scan(a.effect);}}return total;}

  function attackSpecificBonus(slot,attackName){return Number(slot?.stackedAttackBonuses?.[attackName]||0);}
  function consumeDamageGuard(slot,kind){if(!slot)return;if(kind==='firstDamage')slot.firstDamageGuardConsumed=true;}
  function topDeckCountAmount(effect,ctx){const ss=effect.side==='opponent'?other(ctx):own(ctx),n=Math.min(Number(effect.count||0),ss.deck.length),refs=ss.deck.slice(0,n);ctx.state.log.push({type:'revealDeck',revealedSide:effect.side||'self',cards:refs.map(r=>r.cardId)});const count=refs.filter(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter,r)).length;if(effect.shuffleAfter)ctx.shuffle?.(ctx.state,ss.deck);return count*Number(effect.amount||0);}

  function healingIsBlocked(state,slot,cardById){
    if(!slot)return false;
    const targetSide=pokemonOn(state.sides.player).includes(slot)?'player':'opponent';
    for(const sourceSide of ['player','opponent'])for(const source of pokemonOn(state.sides[sourceSide])){
      if(abilitiesSuppressed(state,sourceSide,source,cardById))continue;
      const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
      for(const a of abilities){if(a.type!=='passive')continue;const find=e=>e&&(e.type==='healingBlock'?e:e.type==='sequence'?(e.effects.map(find).find(Boolean)||null):null),rule=find(a.effect);if(!rule)continue;if(a.activeOnly&&state.sides[sourceSide].active!==source||a.benchOnly&&state.sides[sourceSide].active===source)continue;if(rule.scope==='both'||sourceSide===targetSide)return true;}
    }
    if(state.stadium){const st=cardById(state.stadium.cardId);const find=e=>e&&(e.type==='healingBlock'?e:e.type==='sequence'?(e.effects.map(find).find(Boolean)||null):null);if(find(st?.effect))return true;}
    return false;
  }
  function modifierAmount(state,side,slot,stat,cardById){
    if(!slot)return 0;const values=[];
    for(const source of pokemonOn(state.sides[side])){
      if(abilitiesSuppressed(state,side,source,cardById))continue;
      const card=cardById(source.cardId);for(const a of (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean))if(a.type==='passive'&&(!a.activeOnly||state.sides[side].active===source)&&(!a.benchOnly||state.sides[side].active!==source))passiveModifiers(a.effect,source,side,state,slot,stat,values,cardById);
      for(const tool of toolsOf(source))passiveModifiers(cardById(tool.cardId)?.effect,source,side,state,slot,stat,values,cardById);
    }
    const foeSide=side==='player'?'opponent':'player';for(const source of pokemonOn(state.sides[foeSide])){if(abilitiesSuppressed(state,foeSide,source,cardById))continue;const card=cardById(source.cardId);for(const a of (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean))if(a.type==='passive'&&a.effect?.scope==='opponentActive'&&(!a.activeOnly||state.sides[foeSide].active===source)&&(!a.benchOnly||state.sides[foeSide].active!==source))passiveModifiers(a.effect,source,foeSide,state,slot,stat,values,cardById);}
    if(state.stadium){const stadium=cardById(state.stadium.cardId);passiveModifiers(stadium?.effect,state.sides[side].active,side,state,slot,stat,values,cardById);}
    for(const m of state.modifiers||[]){if(m.stat!==stat||(m.scope!=='both'&&m.ownerSide!==side)||(m.scope==='active'||m.scope==='opponentActive'?state.sides[side].active!==slot:m.scope==='both'||m.scope==='team'?false:m.targetUid!==slot.uid)||m.startsTurn!=null&&state.turnNumber<m.startsTurn||m.expiresTurn!=null&&state.turnNumber>m.expiresTurn)continue;const ss=state.sides[side];if(m.duration==='whileActive'&&ss.active?.uid!==m.sourceUid)continue;if(m.duration==='whileInPlay'&&!pokemonOn(ss).some(s=>s.uid===m.sourceUid))continue;const opposingActive=state.sides[side==='player'?'opponent':'player'].active;if(m.opponentFilter&&(!opposingActive||!matchesFilter(cardById(opposingActive.cardId),m.opponentFilter,opposingActive)))continue;if(matchesFilter(cardById(slot.cardId),m.filter,slot))values.push(m.amount);}
    return stat==='energyMultiplier'?(values.length?Math.max(...values):0):values.reduce((a,b)=>a+b,0);
  }
  function passiveProtection(effect,type,ctx,slot){
    if(!effect)return null;
    if(effect.type==='sequence'){for(const child of effect.effects){const found=passiveProtection(child,type,ctx,slot);if(found)return found;}return null;}
    return effect.type===type&&matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot)&&conditionMatches(effect.condition,ctx)?effect:null;
  }
  function protectionFromSources(state,side,slot,attacker,cardById,type){
    if(abilitiesSuppressed(state,side,slot,cardById))return null;
    const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:attacker,cardById};
    const card=cardById(slot.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
    for(const ability of abilities){if(ability.type!=='passive'||ability.activeOnly&&state.sides[side].active!==slot||ability.benchOnly&&state.sides[side].active===slot)continue;const found=passiveProtection(ability.effect,type,ctx,slot);if(found)return found;}
    for(const tool of toolsOf(slot)){const found=passiveProtection(cardById(tool.cardId)?.effect,type,ctx,slot);if(found)return found;}
    return null;
  }
  function attackIsPrevented(state,side,slot,attacker,cardById){
    const passiveFirst=findPassiveRule(state,side,slot,'firstDamageGuard',cardById);if(!slot?.firstDamageGuardConsumed&&(slot?.firstDamageGuard||passiveFirst))return {type:'firstDamageGuard',firstDamage:true};
    const matchesAttacker=guard=>!guard?.attackerFilter||!!attacker&&matchesFilter(cardById(attacker.cardId),guard.attackerFilter,attacker);
    if(slot.attackGuard&&(slot.attackGuard.expiresTurn==null||state.turnNumber<=slot.attackGuard.expiresTurn)&&matchesAttacker(slot.attackGuard))return slot.attackGuard;
    const passive=protectionFromSources(state,side,slot,attacker,cardById,'preventDamage');
    return matchesAttacker(passive)?passive:null;
  }
  function attackEffectsPrevented(state,side,slot,attacker,cardById){
    const rule=findPassiveRule(state,side,slot,'preventEffects',cardById);if(!rule)return false;
    if(rule.attackerFilter&&!attacker)return false;
    return !rule.attackerFilter||matchesFilter(cardById(attacker.cardId),rule.attackerFilter,attacker);
  }
  function applyContinuousRules(state,cardById){
    const walk=(effect,fn)=>{if(!effect)return;if(effect.type==='sequence')for(const child of effect.effects||[])walk(child,fn);else fn(effect);};
    for(const side of ['player','opponent'])for(const source of pokemonOn(state.sides[side])){
      if(abilitiesSuppressed(state,side,source,cardById))continue;
      const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
      for(const a of abilities){if(a.type!=='passive'||a.activeOnly&&state.sides[side].active!==source||a.benchOnly&&state.sides[side].active===source)continue;walk(a.effect,rule=>{if(rule.type!=='statusRecoveryAura'||rule.scope!=='team')return;for(const target of pokemonOn(state.sides[side]))if(matchesFilter(cardById(target.cardId),rule.filter,target))clearConditions(target);});}
    }
  }
  function attackDamageWithState(state,attackSide,attackerSlot,defenderSide,defenderSlot,damage,cardById){
    let n=Math.max(0,Number(damage||0));if(!n||!attackerSlot||!defenderSlot)return n;
    const attacker=cardById(attackerSlot.cardId),defender=cardById(defenderSlot.cardId),weakness=defender?.weakness,types=effectiveTypes(state,attackSide,attackerSlot,cardById);
    if(!weakness||!types.includes(weakness))return n;
    const guard=defenderSlot.weaknessGuard;if(guard&&(guard.expiresTurn==null||state.turnNumber<=guard.expiresTurn))return n;
    let multiplier=null;if(state.stadium){const stadium=cardById(state.stadium.cardId);const find=e=>e&&(e.type==='weaknessMultiplier'?e:e.type==='sequence'?(e.effects.map(find).find(Boolean)||null):null),rule=find(stadium?.effect);if(rule&&(!rule.attackerFilter||matchesFilter(attacker,rule.attackerFilter,attackerSlot)))multiplier=Number(rule.multiplier||0);}
    return multiplier&&multiplier>1?n*multiplier:n+20;
  }
  function resolveDelayedEffects(state,endingSide,cardById,contextFor){const due=(state.delayedEffects||[]).filter(x=>x.event==='endOpponentNextTurn'&&Number(x.dueTurn)<=Number(state.turnNumber)&&x.endingSide===endingSide),keep=(state.delayedEffects||[]).filter(x=>!due.includes(x));state.delayedEffects=keep;for(const item of due){let target=null;if(item.targetUid){for(const side of ['player','opponent'])target=pokemonOn(state.sides[side]).find(s=>s.uid===item.targetUid)||target;}else if(item.spot){const ss=state.sides[item.spot.side];target=item.spot.active?ss.active:(ss.bench||[]).find(s=>s&&Number(s.benchSlot)===Number(item.spot.benchIndex));}if(!target)continue;const sourceSide=item.originSide,source=pokemonOn(state.sides[sourceSide]).find(s=>s.uid===item.sourceUid)||state.sides[sourceSide].active,ctx=contextFor(sourceSide,source);applyEffect({...item.effect,target:'eventPokemon'},{...ctx,eventData:{target}});}}
  function statusIsPrevented(state,slot,cardById,status){
    const matches=guard=>!!guard&&(!guard.status||guard.status===status);
    if(matches(slot.statusGuard))return true;
    const side=pokemonOn(state.sides.player).includes(slot)?'player':'opponent';
    if(matches(protectionFromSources(state,side,slot,state.sides[side==='player'?'opponent':'player'].active,cardById,'preventStatus')))return true;
    const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
    for(const source of pokemonOn(state.sides[side])){if(abilitiesSuppressed(state,side,source,cardById))continue;const card=cardById(source.cardId);for(const a of (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean)){if(a.type!=='passive')continue;if(a.activeOnly&&state.sides[side].active!==source||a.benchOnly&&state.sides[side].active===source)continue;const find=e=>{if(!e)return null;if(e.type==='sequence')return e.effects.map(find).find(Boolean)||null;return e.type==='preventStatus'&&e.scope==='team'&&matchesFilter(cardById(slot.cardId),e.filter,slot)&&conditionMatches(e.condition,{...ctx,attacker:slot})&&matches(e)?e:null;};if(find(a.effect))return true;}}
    return false;
  }
  function passiveActionLock(effect,source,sourceSide,state,targetSide,cardType,cardById){if(!effect)return false;if(effect.type==='sequence')return effect.effects.some(e=>passiveActionLock(e,source,sourceSide,state,targetSide,cardType,cardById));if(effect.type!=='actionLock'||effect.cardType!==cardType)return false;if(effect.side==='opponent'&&targetSide===sourceSide||effect.side==='self'&&targetSide!==sourceSide)return false;if(effect.duration==='whileActive'&&state.sides[sourceSide].active!==source)return false;return true;}
  function isActionLocked(state,side,cardType,cardById){const ss=state.sides[side];if((ss.actionLocks||[]).some(l=>l.cardType===cardType&&(l.expiresTurn==null||state.turnNumber<=l.expiresTurn)))return true;for(const sourceSide of ['player','opponent'])for(const source of pokemonOn(state.sides[sourceSide])){if(abilitiesSuppressed(state,sourceSide,source,cardById))continue;const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);for(const a of abilities)if(a.type==='passive'&&passiveActionLock(a.effect,source,sourceSide,state,side,cardType,cardById))return true;}return false;}
  function passiveAttackAllowed(state,side,slot,cardById){if(!slot||abilitiesSuppressed(state,side,slot,cardById))return true;const card=cardById(slot.cardId),ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById,maxHp:null};const check=e=>{if(!e)return true;if(e.type==='sequence')return e.effects.every(check);if(e.type==='attackRequirement')return conditionMatches(e.condition,ctx);return true;};for(const ability of (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean))if(ability.type==='passive'&&!check(ability.effect))return false;return true;}
  function isLocked(state,slot,action,attackName){return (slot?.locks||[]).some(l=>l.action===action&&(l.expiresTurn==null||state.turnNumber<=l.expiresTurn)&&(!l.attackName||l.attackName===attackName));}
  function applyAttackEffect(effect,context){return applyEffect(effect,context);}
  return {ENERGY_CODE,effectTypes,supportsEffect,validateEffect,matchesFilter,totalEnergy,canPayCost,spendGenericEnergy,spendGenericEnergyWithValue,attackDamage,applyAttackEffect,applyEffect,resolveAttack,choicesForEffect,modifierAmount,clearConditions,clearTemporaryEffects,switchPokemon,attackIsPrevented,attackEffectsPrevented,statusIsPrevented,isLocked,isActionLocked,passiveAttackAllowed,applyPersistentEvent,findPassiveRule,healingIsBlocked,canUsePreviousEvolutionAttacks,attackSpecificBonus,consumeDamageGuard,topDeckCountAmount,coinBonusAmount,abilitiesSuppressed,evolutionRule,attackCostOverride,effectiveTypes,applyContinuousRules,attackDamageWithState,resolveDelayedEffects,toolCapacity,coinRerollSource};
});
