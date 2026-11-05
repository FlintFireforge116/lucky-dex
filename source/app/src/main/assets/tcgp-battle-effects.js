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
  const FILTER_KEYS=['kind','stage','subtype','notSubtype','name','trainerType','isEx','damaged','evolved','hasAbility','evolvesFrom','hasEnergyType','hasAnyEnergy','nameContains','hpAtMost','retreatAtLeast','energyTypeAtLeast','points','attackName','tag'];
  const STATUSES=['poison','burn','sleep','paralysis','confusion'];
  const STATS=['attackDamage','damageReduction','retreatCost','attackCost','maxHp','energyMultiplier','poisonDamageBonus','attackCostGrass','attackCostFire','attackCostWater','attackCostLightning','attackCostPsychic','attackCostFighting','attackCostDarkness','attackCostMetal','attackCostColorless','damageTaken','attackDamageAllTargets','postWeaknessAttackDamage'];
  const effectTypes=Object.freeze(['lentalRule','neoRule','gymRule','fossilWildfire','fossilThunderstorm','fossilProphecy','fossilMoveCounter','fossilTransparency','fossilArmor','fossilClairvoyance','fossilRecycle','chainLightning','returnIfSurvives','peek','noop','sequence','healSelf','heal','damage','bonusDamage','coinDamage','energyDamage','benchCountDamage','statusDamage','damageFromDamage','discardEnergyCard','discardTop','benchDamage','selfDamage','attachEnergy','discardEnergy','draw','search','searchRandomBasic','switch','status','coinFlip','modifier','removeStatus','lock','preventDamage','selectedDamage','coinUntilTails','playFossil','rareCandy','discardSelf','moveEnergy','handShuffle','preventStatus','actionLock','discardTool','discardHand','benchFromDeck','allHeadsBonus','attackCoinGate','retaliateDamage','pointDamage','namedAttackCountDamage','usedAttackCountDamage','coinDamageByPokemon','randomPokemonDamage','globalRandomDiscardEnergy','retreatCostDamage','toolCountDamage','discardStadium','drain','nextAttackBonus','coinAttackGate','damageRule','evolveFromDeck','coinDamageByEnergy','discardCountDamage','fieldCountDamage','energyTypeCountDamage','statusCountDamage','handCountDamage','remainingHpDamage','trimHand','shuffleRandomHandCard','halveRemainingHp','setRemainingHp','removeRandomStatus','randomStatus','allHeadsEffect','selfDamagePenalty','deckCountDamage','attachEnergyFromDiscard','endTurn','coinRepeatEffect','coinDamageStatus','topDeckFilter','fieldCountDraw','selectedEnergyDamage','forceOpponentSwitch','revealHand','inspectTop','returnToHand','shuffleIntoDeck','discardChosenHand','shuffleChosenHand','searchChosen','takeTopMatching','selectTopToHand','swapHandWithRandomDeck','moveDamage','discardBenchPokemon','copyAttack','drawToHandSize','chooseTarget','attackRequirement','triggeredEffect','koGuard','coinDamageGuard','preventEffects','healingBlock','setNextEnergyRandom','changeRandomEnergyType','devolve','chooseOption','revealDeck','removeStatuses','topDeckDiscardBonus','coinAnyHeadsGate','shuffleDeck','returnAllTools','shuffleAllTools','evolveTargetFromDeck','moveRandomEnergy','stealRandomFromDiscard','filteredHandCountDamage','pointsGainedLastTurnDamage','koCountDamage','preventAbilityDamage','distributeEnergy','previousEvolutionAttacks','stackAttackBonus','firstDamageGuard','topDeckCountDamage','attachRandomEnergy','selfDamageIfDefenderKnockedOut','shuffleRandomCombinedHandCard','coinDiscardEnergyDamage','createCard','coinBonus','coinTierBonus','coinBenchDamage','searchThenShuffleChosen','stadiumAction','rerollEnergyZone','evolutionAsName','evolutionTimingOverride','abilitySuppression','conditionalAttackCost','additionalType','benchFromDiscard','attachRandomEnergyFromDiscard','knockOut','discardPokemon','koPointBonus','randomAttackLock','optionalDiscardBenchBonus','randomHitBonus','statusRecoveryAura','weaknessGuard','weaknessMultiplier','copyRandomTrainerEffect','healActiveReturnTrainer','copyRandomAttackFromPrivate','energyAttachStatusTrap','multiTargetDamage','scheduleDelayed','retreatRetaliation','chooseDiscardForBonus','reorderTop','redistributeEnergy','distributeDiscardEnergyDistinct','benchBasicsFromOpponentHand','forceFirstCoinHead','coinReroll','toolCapacity','repeatAttack','energyTypeOverride','redistributeDamage','chooseAttackLock','chooseTypeOverride','remainingHpFractionDamage','destinyBond','shuffleHandMatching','tradeHandForDeck','scoopUp','energyRetrieval','pokemonCenter','devolutionSpray','multiEnergyRemoval','specialEnergy','selfKoAttachAsEnergy','mirrorLastAttackResult','replayAttackResult']);
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
    if(effect.side!=null)need((['handShuffle','benchCountDamage','fieldCountDraw','shuffleHandMatching'].includes(effect.type)?['self','opponent','both']:['self','opponent']).includes(effect.side),'invalid side');
    if(effect.mode!=null&&effect.type!=='koGuard')need(['add','replace'].includes(effect.mode),'invalid damage mode');
    switch(effect.type){
      case 'lentalRule':need(typeof effect.rule==='string'&&effect.rule.length>0,'Lental rule key required');break;
      case 'neoRule':need(typeof effect.rule==='string'&&effect.rule.length>0,'Neo rule key required');break;
      case 'gymRule':if(!effect.rule||typeof effect.rule!=='string')need(false,'Gym rule key required');break;
      case 'fossilWildfire':case 'fossilThunderstorm':case 'fossilProphecy':case 'fossilMoveCounter':case 'fossilTransparency':case 'fossilArmor':case 'fossilClairvoyance':case 'fossilRecycle':break;
      case 'chainLightning':need(nonnegative(effect.amount),'invalid Chain Lightning bench damage');break;
      case 'peek':case 'returnIfSurvives':break;
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
      case 'benchFromDiscard':need(['self','opponent'].includes(effect.side),'benchFromDiscard requires self or opponent side');need(integer(effect.amount)&&effect.amount>0,'invalid bench-from-discard count');break;
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
      case 'coinFlip':need(!!effect.heads||!!effect.tails,'coinFlip requires at least one result effect');if(effect.heads)errors.push(...validateEffect(effect.heads,`${at}.heads`));if(effect.tails)errors.push(...validateEffect(effect.tails,`${at}.tails`));break;
      case 'status':need(!['selfAll','selfBenchAll','selfBench','opponentBench','selfPokemon','opponentPokemon'].includes(effect.target),'special conditions require Active Pokemon');need(STATUSES.includes(effect.status),'invalid special condition');if(effect.amount!=null)need(nonnegative(effect.amount),'invalid status damage');if(effect.recoveryCoins!=null)need(integer(effect.recoveryCoins)&&effect.recoveryCoins>0,'invalid status recovery coin count');break;
      case 'specialEnergy':{const provides=effect.provides;need(provides&&typeof provides==='object'&&!Array.isArray(provides),'specialEnergy requires provides map');for(const [type,amount] of Object.entries(provides||{})){need(ENERGY_TYPES.includes(type),'invalid provided Energy type');need(integer(amount)&&amount>0,'invalid provided Energy amount');}break;}
      case 'selfKoAttachAsEnergy':case 'mirrorLastAttackResult':case 'replayAttackResult':case 'energyTypeOverride':case 'redistributeDamage':case 'chooseAttackLock':case 'chooseTypeOverride':case 'remainingHpFractionDamage':case 'destinyBond':case 'shuffleHandMatching':case 'tradeHandForDeck':case 'scoopUp':case 'energyRetrieval':case 'pokemonCenter':case 'devolutionSpray':case 'multiEnergyRemoval':case 'noop':case 'removeStatus':case 'removeRandomStatus':case 'switch':case 'discardSelf':case 'rareCandy':case 'discardTool':case 'halveRemainingHp':case 'forceOpponentSwitch':case 'revealHand':case 'inspectTop':case 'returnToHand':case 'shuffleIntoDeck':case 'discardChosenHand':case 'shuffleChosenHand':case 'searchChosen':case 'takeTopMatching':case 'selectTopToHand':case 'swapHandWithRandomDeck':case 'moveDamage':case 'discardBenchPokemon':case 'preventAbilityDamage':case 'shuffleDeck':case 'returnAllTools':case 'shuffleAllTools':case 'evolveTargetFromDeck':case 'moveRandomEnergy':case 'stealRandomFromDiscard':case 'previousEvolutionAttacks':break;
      case 'copyAttack':need(['opponentActive','opponentPokemon','selfBench'].includes(effect.source),'invalid copied-attack source');break;
      case 'stackAttackBonus':need(typeof effect.attackName==='string'&&effect.attackName.length>0,'missing stacked attack name');need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid stacked attack bonus');break;
      case 'firstDamageGuard':break;
      case 'topDeckCountDamage':need(integer(effect.count)&&effect.count>0,'invalid top deck count');need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid top deck damage amount');break;
      case 'attachRandomEnergy':need(Array.isArray(effect.energyTypes)&&effect.energyTypes.length>0&&effect.energyTypes.every(x=>ENERGY_TYPES.includes(x)),'invalid random Energy pool');need(integer(effect.amount)&&effect.amount>0,'invalid random Energy attach amount');break;
      case 'selfDamageIfDefenderKnockedOut':need(nonnegative(effect.amount),'invalid conditional self damage');break;
      case 'shuffleRandomCombinedHandCard':break;
      case 'coinDamageByEnergy':if(effect.discardHeads!=null){need(typeof effect.discardHeads==='boolean','invalid per-head discard flag');need(!effect.discardHeads||ENERGY_TYPES.includes(effect.energyType),'per-head discard needs a typed Energy');}break;
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
      case 'rerollEnergyZone':{const ss=own(ctx);if(!ss.energyAvailable||ss.energyUsed)break;if(Array.isArray(ss.energySupply)){const pulled=ss.energySupply.shift();if(pulled)ss.energyType=pulled;ss.nextEnergyType=ss.energySupply[0]||null;}else{ss.energyType=ss.nextEnergyType||ss.energyTypes[0];ss.nextEnergyType=ss.energyTypes.length>1?ss.energyTypes[Math.floor(ctx.random(ctx.state)*ss.energyTypes.length)]:ss.energyTypes[0];}log({type:'energyZoneReroll',energyType:ss.energyType});break;}
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
      case 'discardEnergyCard':need(effect.amount==='all'||integer(effect.amount)&&effect.amount>0,'invalid discarded Energy card amount');break;
      case 'search':need(['deck','discard'].includes(effect.source||'deck'),'invalid search source');need(effect.random===true,'only random filtered searches are supported');need(integer(effect.amount),'invalid search amount');need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'search requires filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid search filter');break;
      default:need(effect.type==='bonusDamage'?typeof effect.amount==='number'&&Number.isFinite(effect.amount):nonnegative(effect.amount),'invalid amount');
    }
    if(effect.type==='statusDamage')need(STATUSES.includes(effect.status),'invalid damage status');
    if(effect.type==='coinDamage')need((integer(effect.coins)&&effect.coins<=100)||effect.coins==='untilTails','invalid coin count');
    if(effect.type==='energyDamage'){need(['self','opponent'].includes(effect.source),'invalid energy source');if(effect.extraAbove!=null)need(integer(effect.extraAbove),'invalid extra Energy threshold');if(effect.energyTypes!=null)need(Array.isArray(effect.energyTypes)&&effect.energyTypes.every(x=>ENERGY_TYPES.includes(x)),'invalid Energy damage types');}
    if(effect.type==='attachEnergy'){need(integer(effect.amount),'invalid generated Energy count');need(ENERGY_TYPES.includes(effect.energyType),'attachEnergy requires Energy type');}
    if(['draw','searchRandomBasic'].includes(effect.type))need(integer(effect.amount),'invalid card count');
    if(effect.type==='selectedDamage')need(['opponentPokemon','opponentBench'].includes(effect.target),'invalid selected attack target');
    if(effect.sourceFilter!=null){need(effect.sourceFilter&&typeof effect.sourceFilter==='object'&&!Array.isArray(effect.sourceFilter),'invalid source filter');for(const key of Object.keys(effect.sourceFilter||{}))need(['kind','stage','subtype','notSubtype','name','trainerType','isEx','damaged'].includes(key),'invalid source filter key');}
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
  function temporaryTrainersOf(slot){return slot?(slot.temporaryTrainers||[]).filter(Boolean):[];}
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
  function matchesFilter(card,filter,slot){const match=(k,v)=>k==='subtype'?hasType(card,v):k==='notSubtype'?!hasType(card,v):k==='tag'?(card.tags||[]).includes(v):k==='damaged'?(Number(slot?.damage)>0)===v:k==='isEx'?!!(card.isEx||card.points>=2||/ ex$/.test(card.name))===v:k==='evolved'?['Stage 1','Stage 2'].includes(card.stage)===v:k==='hasAbility'?!!(card.abilities?.length||card.ability)===v:k==='hasEnergyType'?Number(slot?.energy?.[v]||0)>0:k==='hasAnyEnergy'?totalEnergy(slot?.energy)>0:k==='nameContains'?String(card.name||'').includes(v):k==='attackName'?(card.attacks||[]).some(a=>a.name===v):k==='hpAtMost'?Number(card.hp||0)<=Number(v):k==='retreatAtLeast'?Number(card.retreat||0)>=Number(v):k==='energyTypeAtLeast'?Number(slot?.energy?.[v?.type]||0)>=Number(v?.amount||0):card[k]===v;return !!card&&Object.entries(filter||{}).every(([k,v])=>Array.isArray(v)?v.some(x=>match(k,x)):match(k,v));}
  function clearConditions(slot){if(slot)slot.conditions={};}
  function revertShapeshift(state,slot){
    if(!slot?.gym2ShapeshiftSource)return;
    const owner=state&&['player','opponent'].map(x=>state.sides[x]).find(ss=>ss?.active===slot||ss?.bench?.includes(slot));
    if(owner&&slot.gym2ShapeshiftRef)owner.discard.push(slot.gym2ShapeshiftRef);
    slot.cardId=slot.gym2ShapeshiftSource;delete slot.gym2ShapeshiftSource;delete slot.gym2ShapeshiftRef;
  }
  function clearTemporaryEffects(state,slot){if(!slot)return;
    revertShapeshift(state,slot);
    clearConditions(slot);delete slot.locks;delete slot.attackGuard;delete slot.statusGuard;delete slot.attackGate;delete slot.retaliate;delete slot.stackedAttackBonuses;delete slot.abilitySuppressed;delete slot.energyTypeOverride;delete slot.typeOverride;delete slot.weaknessOverride;delete slot.resistanceOverride;delete slot.destinyBond;delete slot.gymShadowImages;delete slot.gymCounterGuard;delete slot.gymFireWall;delete slot.gymDeflector;delete slot.gymEnergyLock;delete slot.gym2Intimidate;delete slot.gym2GiantGrowth;delete slot.gym2PoisonAmount;delete slot.gym2NinjaTrick;delete slot.gym2FaceDown;delete slot.gym2BubblesLockTurn;delete slot.neoMeanLook;delete slot.neoWebLock;delete slot.neoJawClamp;delete slot.neoLeer;delete slot.neoAmnesia;delete slot.neoScaryFace;delete slot.neoAttackLock;delete slot.neoDeflector;delete slot.neoPollenShield;delete slot.neoScreech;delete slot.neoLockOn;delete slot.neoCounter;delete slot.neoPursuit;delete slot.neoSecretePoison;delete slot.neoSlime;delete slot.neoGazeUntil;if(state)state.modifiers=(state.modifiers||[]).filter(m=>m.targetUid!==slot.uid||m.scope==='team'||m.scope==='active'||m.scope==='opponentActive');}
  function switchPokemon(side,benchIndex,state){const index=side.bench.findIndex(s=>s&&Number(s.benchSlot)===Number(benchIndex));if(index<0||!side.active)return false;const incoming=side.bench[index],outgoing=side.active;outgoing.benchSlot=Number(incoming.benchSlot);incoming.benchSlot=null;incoming.movedToActiveTurn=state?.turnNumber;side.bench[index]=outgoing;side.active=incoming;clearTemporaryEffects(state,outgoing);return true;}
  function protectedFromEffects(slot,ctx){return !!(ctx.isAttack&&ctx.preventedTargets&&ctx.preventedTargets.has(slot.uid));}
  function repeatHeads(ctx,callback,results){for(let count=0;count<1024;count++){const heads=coin(ctx);if(Array.isArray(results))results.push(heads);if(!heads)return count;callback();}throw new Error('Coin sequence exceeded deterministic resolution limit.');}
  function energyOwner(ctx,slot){if(pokemonOn(own(ctx)).includes(slot))return own(ctx);if(pokemonOn(other(ctx)).includes(slot))return other(ctx);return null;}
  function recordDiscardedEnergy(side,type,amount){if(!side||!type||amount<=0)return;side.energyDiscard=side.energyDiscard||{};side.energyDiscard[type]=Number(side.energyDiscard[type]||0)+Number(amount||0);}
  // Gym Heroes cards use a dedicated rules adapter. It operates on the same
  // battle state and choice prompts as Base/Jungle/Fossil; names are intentionally
  // explicit so an unknown printed rule can never silently become a no-op.
  // Blaine's Quiz #1 uses an explicit 50/50 coin-flip adaptation in LuckyDex:
  // the physical TCG's height-guessing interaction has no usable card height metadata.

  // Gym Challenge rules deliberately share the same state and choice system as
  // Gym Heroes. Every name below corresponds to a printed card effect.
  function applyGymChallengeRule(e,ctx){
    const name=e.rule.slice('challenge:'.length),s=own(ctx),foe=other(ctx),a=ctx.action||{},slot=ctx.attacker,card=x=>ctx.cardById(x?.cardId),log=extra=>ctx.state.log.push({type:'gymChallengeEffect',side:ctx.side,rule:name,...extra});
    const all=ss=>pokemonOn(ss),flip=()=>{const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'challenge:'+name,heads,results:[heads]});return heads;};
    const request=(spec,more={})=>ctx.requestChoice?.({...spec,effect:{...e,...more}});
    const selected=(ss=s)=>{if(a.choiceTarget==='active')return ss.active;if(a.choiceTarget==='bench')return ss.bench.find(p=>Number(p.benchSlot)===Number(a.choiceBenchIndex));return null;};
    const discardBasic=(p,type='')=>{if(!p)return false;const types=Object.keys(p.energy||{}).filter(t=>Number(p.energy[t])>0&&(!type||type===t));if(types.length){const chosen=type||types[0];p.energy[chosen]--;const owner=all(s).includes(p)?s:foe;owner.energyDiscard=owner.energyDiscard||{};owner.energyDiscard[chosen]=Number(owner.energyDiscard[chosen]||0)+1;return true;}if((p.specialEnergy||[]).length){const owner=all(s).includes(p)?s:foe;owner.discard.push(p.specialEnergy.shift());return true;}return false;};
    const toHandEnergy=(p,typ)=>{if(!p||!Number(p.energy?.[typ]))return;const ids={Fighting:127,Fire:128,Grass:129,Lightning:130,Psychic:131,Water:132};p.energy[typ]--;s.hand.push({uid:`gym2-energy-${ctx.state.turnNumber}-${s.hand.length}`,cardId:`gym2-${ids[typ]}`,zoneGenerated:true});};
    const addEnergy=(p,type,n=1)=>{if(!p)return; p.energy=p.energy||{};p.energy[type]=Number(p.energy[type]||0)+n;for(let i=0;i<n;i++)ctx.onEnergyAttached?.(p,type,1);};
    const switchBench=(ss,i)=>{if(i==null)return false;return switchPokemon(ss,i,ctx.state);};
    const draw=(ss,n)=>{for(let j=0;j<n;j++)ctx.drawCard(ss);};

    const guessNames=(shown)=>{
      const name=shown?.name||'',candidates=[...s.deck,...foe.deck,...s.hand,...foe.hand].map(card)
        .filter(x=>x?.kind==='pokemon'&&x.name!==name&&x.types?.[0]===shown.types?.[0]).map(x=>x.name);
      const options=[name,...new Set(candidates)].slice(0,4);
      while(options.length<4)for(const fallback of ["Pikachu","Charmander","Mewtwo","Eevee"])if(options.length<4&&!options.includes(fallback))options.push(fallback);
      const spin=Math.floor(ctx.random(ctx.state)*options.length);return options.slice(spin).concat(options.slice(0,spin));
    };
    const chooseTarget=(ss,filter,stage,optional)=>request({kind:'pokemon',side:'self',selectionSide:ss===s?ctx.side:ctx.foeSide,includeActive:true,filter,optional},{stage});
    switch(name){
      case 'growth':{if(!slot)return;const basics=s.hand.filter(r=>card(r)?.basicEnergy&&card(r).subtype==='Grass');const n=Math.min(2,basics.length);for(let i=0;i<n;i++){const ix=s.hand.findIndex(r=>card(r)?.basicEnergy&&card(r).subtype==='Grass');s.hand.splice(ix,1);addEnergy(slot,'Grass');}if(!n&&s.energyAvailable){addEnergy(slot,'Grass',2);log({adaptation:'Energy Zone',attached:2});}else log({attached:n});break;}
      case 'summonStorm':{for(const p of [...foe.bench,...s.bench,foe.active].filter(Boolean))p.damage=Number(p.damage||0)+20;break;}
      case 'dragonTornado':{if(!foe.active||!foe.bench.length||Number(foe.active.damage)>=ctx.maxHp?.(ctx.foeSide,foe.active))break;if(ctx.resolvingChoice)switchBench(foe,a.choiceBenchIndex);else chooseTarget(foe,null,'dragonTornado');break;}
      case 'intimidate':if(ctx.defender&&Number(card(ctx.defender)?.hp||0)<=50)ctx.defender.gym2Intimidate={sourceUid:slot.uid,expiresTurn:ctx.state.turnNumber+1};break;
      case 'giantGrowth':if(slot){slot.gym2GiantGrowth=true;log({hp:80,attackDamage:30});}break;
      case 'noNextTurn':if(slot){slot.locks=slot.locks||[];slot.locks.push({action:'attack',attackName:ctx.attack?.name||'Mega Burn',expiresTurn:ctx.state.turnNumber+2});}break;
      case 'superRemoval':for(const p of all(foe))discardBasic(p);break;
      case 'lieLow':if(slot)slot.gym2LieLowTurn=ctx.state.turnNumber;break;
      case 'overheadToss':if(s.bench.length&& !flip()){if(ctx.resolvingChoice){const p=selected(s);if(p)p.damage=Number(p.damage||0)+20;}else request({kind:'pokemon',side:'self',includeActive:false,optional:false},{stage:'selfBench'});}break;
      case 'suppressPower':foe.gym2PowerLockUntil=ctx.state.turnNumber+1;break;
      case 'damageShift':{let n=0;for(const p of all(s))if(Number(p.damage)>0){p.damage-=10;n++;}if(ctx.defender)ctx.defender.damage=Number(ctx.defender.damage||0)+n*10;break;}
      case 'lunarPower':{if(ctx.resolvingChoice){const p=selected(s);ctx.evolveFromDeck?.(p);}else request({kind:'pokemon',side:'self',includeActive:false,optional:true},{stage:'evolve'});break;}
      case 'falseCharity':{const ref=foe.deck.shift();if(ref){if(card(ref)?.kind==='trainer')foe.discard.push(ref);else foe.hand.push(ref);}break;}
      case 'toxicSecretion':case 'toxicCloud':if(ctx.defender){ctx.defender.conditions=ctx.defender.conditions||{};ctx.defender.conditions.poison={amount:20};}break;
      case 'messenger':{
        if(ctx.resolvingChoice&&e.stage==='find'){
          const index=Number(a.choiceDeckIndex),ref=s.deck[index];if(ref&&card(ref)?.kind==='pokemon'&&card(ref)?.name!=="Koga's Pidgey")s.hand.push(...s.deck.splice(index,1));
          ctx.shuffle?.(ctx.state,s.deck);break;
        }
        if(!slot)break;
        const refs=(slot.stack||[slot.cardId]).map((id,i)=>({uid:`${slot.uid}-shuffle-${i}`,cardId:id}));
        refs.push(...(slot.specialEnergy||[]),...(slot.temporaryTrainers||[]),...(slot.tools||[]));
        if(s.active===slot)s.active=null;else s.bench=s.bench.filter(x=>x!==slot);
        for(const ref of refs)s.deck.push(ref);
        for(const [type,n] of Object.entries(slot.energy||{}))s.energyDiscard={...(s.energyDiscard||{}),[type]:Number(s.energyDiscard?.[type]||0)+Number(n||0)};
        ctx.shuffle?.(ctx.state,s.deck);
        if(s.deck.some(r=>card(r)?.kind==='pokemon'&&card(r)?.name!=="Koga's Pidgey"))request({kind:'deckCard',side:'self',filter:{kind:'pokemon'}},{stage:'find'});
        break;}
      case 'focusDoubleEdge':if(slot)slot.gym2FocusTurn=ctx.state.turnNumber;break;
      case 'doubleEdge':if(slot)slot.damage=Number(slot.damage||0)+(slot.gym2FocusTurn===ctx.state.turnNumber-2?40:20);break;
      case 'invigorate':{
        if(!e.stage){request({kind:'option',side:'self',options:['Your discard','Opponent discard']},{stage:'chooseSide'});break;}
        if(e.stage==='chooseSide'){
          const theirs=Number(a.choiceOption)===1,from=theirs?foe:s;
          if(from.bench.length>=Number(from.benchLimit||3)||!from.discard.some(r=>card(r)?.kind==='pokemon'&&card(r)?.stage==='Basic'))break;
          request({kind:'discardCard',side:'self',discardZone:theirs?'opponent':'self',filter:{kind:'pokemon',stage:'Basic'}},{stage:'revive',targetSide:theirs?'opponent':'player'});break;
        }
        if(e.stage==='revive'){
          const from=e.targetSide==='opponent'?foe:s,idx=Number(a.choiceDiscardIndex),ref=from.discard[idx];
          if(!ref||card(ref)?.stage!=='Basic'||from.bench.length>=Number(from.benchLimit||3))break;
          const uid=ref.uid;from.discard.splice(idx,1);ctx.benchCard?.(from,ref);
          const p=from.bench.find(x=>x.uid===uid);if(p)p.damage=10*Math.floor(Number(card(ref)?.hp||0)/20);
        }break;}
      case 'helpingHand':{
        if(!e.stage){chooseTarget(foe,null,'selectTarget');break;}
        if(e.stage==='selectTarget'){
          const p=selected(foe);if(!p)break;
          const n=Math.min(60,Math.floor(Number(p.damage||0)/10));
          request({kind:'option',side:'self',options:Array.from({length:n+1},(_,i)=>`Remove ${i} damage counters; draw ${i}`)},{stage:'healAmount',targetUid:p.uid});break;
        }
        if(e.stage==='healAmount'){
          const p=all(foe).find(x=>x.uid===e.targetUid);if(!p)break;
          const n=Math.max(0,Math.min(Math.floor(Number(p.damage||0)/10),Number(a.choiceOption||0)));
          p.damage-=n*10;draw(s,n);
        }break;}
      case 'magicDarts':{if(ctx.resolvingChoice){const p=selected(foe);if(p)p.damage=Number(p.damage||0)+10*Number(e.heads||0);}else chooseTarget(foe,null,'dart');break;}
      case 'pranks':if(foe.discard.length){if(ctx.resolvingChoice){const i=Number(a.choiceDiscardIndex);if(foe.discard[i])foe.deck.unshift(...foe.discard.splice(i,1));}else request({kind:'discardCard',side:'self',discardZone:'opponent'},{stage:'discard'});}break;
      case 'callFire':{const n=Math.min(Number(e.heads||0),neoDiscardAvailable(ctx,s,'Fire'));if(n){const recovered=neoTakeDiscard(ctx,s,'Fire',n);neoRecoveredEnergyToHand(ctx,s,'Fire',recovered,'gym2-128');}break;}
      case 'groupAttack':{const space=Number(s.benchLimit||3)-s.bench.length;for(let i=0;i<space;i++){const ix=s.deck.findIndex(r=>card(r)?.name==="Koga's Zubat");if(ix<0)break;ctx.benchCard?.(s,s.deck.splice(ix,1)[0]);}ctx.shuffle?.(ctx.state,s.deck);break;}
      case 'amnesia':{if(!ctx.defender)break;if(ctx.resolvingChoice){ctx.defender.locks=ctx.defender.locks||[];ctx.defender.locks.push({action:'attack',attackName:String(card(ctx.defender)?.attacks?.[Number(a.choiceAttackIndex)]?.name||''),expiresTurn:ctx.state.turnNumber+1});}else request({kind:'attack',side:'self',attackSide:ctx.foeSide,zone:'active'},{stage:'blockAttack'});break;}
      case 'mistyESP':{if(Number(e.heads)===1)draw(s,1);break;}
      case 'energySupport':{const n=neoEnergyToHand(ctx,s,'Psychic',1);log({energyType:'Psychic',amount:n,adaptation:'Energy Supply'});ctx.shuffle?.(ctx.state,s.deck);break;}
      case 'blaine':{if(s.energyUsed||!s.energyAvailable)break;if(ctx.resolvingChoice){const p=selected(s);if(p&&card(p)?.name?.startsWith("Blaine's")){addEnergy(p,'Fire',2);s.energyUsed=true;}}else chooseTarget(s,{nameContains:"Blaine's"},'attach');break;}
      case 'giovanni':s.gym2GiovanniEvolutionTurn=ctx.state.turnNumber;break;
      case 'koga':s.gym2KogaPoisonTurn=ctx.state.turnNumber;break;
      case 'sabrina':{if(ctx.resolvingChoice){if(e.stage==='source'){const p=selected(s);if(p)request({kind:'pokemon',side:'self',includeActive:true,filter:{nameContains:"Sabrina's"},excludeUids:[p.uid]},{stage:'target',sourceUid:p.uid});}else{const p=all(s).find(p=>p.uid===e.sourceUid),to=selected(s);if(p&&to&&p!==to){for(const [type,n] of Object.entries(p.energy||{})){addEnergy(to,type,Number(n||0));p.energy[type]=0;}to.specialEnergy=[...(to.specialEnergy||[]),...(p.specialEnergy||[])];p.specialEnergy=[];}}}else chooseTarget(s,{nameContains:"Sabrina's"},'source');break;}
      case 'giovanniLastResort':{if(ctx.resolvingChoice){const p=selected(s);if(p&&card(p)?.name?.startsWith("Giovanni's")){p.damage=0;s.discard.push(...s.hand.splice(0));}}else chooseTarget(s,{nameContains:"Giovanni's"},'heal');break;}
      case 'masterBall':applyEffect({type:'selectTopToHand',count:7,filter:{kind:'pokemon'}},ctx);break;
      case 'fervor':{const top=s.deck.splice(0,Math.min(3,s.deck.length));let found=0;for(const r of top){if(card(r)?.basicEnergy&&card(r).subtype==='Fire'){s.hand.push(r);found++;}else s.discard.push(r);}if(!found){const n=neoEnergyToHand(ctx,s,'Fire',1,'gym2-128');log({energyType:'Fire',amount:n,adaptation:'Energy Supply'});}break;}
      case 'blainesQuiz2':case 'blainesQuiz3':{
        if(!e.stage){request({kind:'handCard',side:'self',filter:name==='blainesQuiz3'?{kind:'pokemon'}:null},{stage:'reveal'});break;}
        if(e.stage==='reveal'){
          const chosen=s.hand[Number(a.choiceHandIndex)],shown=card(chosen);if(!shown)break;
          if(name==='blainesQuiz2')request({kind:'option',side:'opponent',options:['Pokémon','Trainer','Energy']},{stage:'answer',cardId:shown.id});
          else{
            const attacks=shown.attacks||[];if(!attacks.length)break;
            if(attacks.length>1)request({kind:'option',side:'self',options:attacks.map(x=>x.name)},{stage:'chooseAttack',cardId:shown.id});
            else {const options=guessNames(shown);log({attackHint:attacks[0].name});request({kind:'option',side:'opponent',options},{stage:'answer',cardId:shown.id,attackName:attacks[0].name,guessOptions:options});}
          }break;
        }
        if(e.stage==='chooseAttack'){
          const shown=ctx.cardById(e.cardId),attack=shown?.attacks?.[Number(a.choiceOption)];if(!attack)break;
          const options=guessNames(shown);log({attackHint:attack.name});request({kind:'option',side:'opponent',options},{stage:'answer',cardId:e.cardId,attackName:attack.name,guessOptions:options});break;
        }
        if(e.stage==='answer'){
          const shown=ctx.cardById(e.cardId);
          // The pending choice has already been cleared by the core, so carry
          // the shuffled candidate names in the resumed Gym effect itself.
          const answer=Array.isArray(e.guessOptions)?e.guessOptions[Number(a.choiceOption)]:name==='blainesQuiz2'?['Pokémon','Trainer','Energy'][Number(a.choiceOption)]:'';
          const correct=name==='blainesQuiz2'?answer===(shown?.kind==='pokemon'?'Pokémon':shown?.kind==='trainer'?'Trainer':'Energy'):answer===shown?.name;
          draw(correct?foe:s,name==='blainesQuiz3'?3:2);
          log({revealedCard:e.cardId,attackHint:e.attackName||null,guess:answer,correct});break;
        }
        break;
      }
      case 'warpPoint':{if(!e.stage){if(foe.bench.length)request({kind:'pokemon',side:'opponent',includeActive:false},{stage:'opponent'});else if(s.bench.length)request({kind:'pokemon',side:'self',includeActive:false},{stage:'self'});break;}if(e.stage==='opponent'){switchBench(foe,a.choiceBenchIndex);if(s.bench.length)request({kind:'pokemon',side:'self',includeActive:false},{stage:'self'});}else switchBench(s,a.choiceBenchIndex);break;}
      case 'shapeshift':{
        if(!slot)break;
        if(ctx.resolvingChoice){const idx=Number(a.choiceHandIndex),ref=s.hand[idx],copy=card(ref);if(!copy||copy.kind!=='pokemon'||copy.stage==='Basic')break;
          s.hand.splice(idx,1);slot.gym2ShapeshiftSource=slot.cardId;slot.gym2ShapeshiftRef=ref;slot.cardId=ref.cardId;log({imitation:ref.cardId});
        }else request({kind:'handCard',side:'self',filter:{kind:'pokemon',stage:['Stage 1','Stage 2']}},{stage:'evolution'});
        break;
      }
      case 'energyDrain':if(foe.active&&flip())discardBasic(foe.active);break;
      case 'scram':{if(!slot)break;const hp=ctx.maxHp?.(ctx.side,slot)||Number(card(slot)?.hp||0);if(hp-Number(slot.damage||0)===10)applyEffect({type:'shuffleIntoDeck',target:'self',includeAttached:true},ctx);break;}
      case 'soakUp':{
        if(ctx.resolvingChoice){const p=selected(s);if(p&&p!==slot&&Number(p.energy?.Grass||0)>0){p.energy.Grass--;addEnergy(slot,'Grass');if(Number(e.moved||0)<1&&all(s).some(x=>x!==slot&&Number(x.energy?.Grass)>0))request({kind:'pokemon',side:'self',includeActive:true,optional:true,excludeUids:[slot.uid]},{moved:Number(e.moved||0)+1});}}
        else if(all(s).some(x=>x!==slot&&Number(x.energy?.Grass)>0))request({kind:'pokemon',side:'self',includeActive:true,optional:true,excludeUids:[slot.uid]});break;
      }
      case 'emerge':if(slot&&flip()){const found=s.deck.map((r,i)=>({r,i})).filter(x=>card(x.r)?.name==="Koga's Beedrill");if(found.length){const ref=s.deck.splice(found[0].i,1)[0];slot.cardId=ref.cardId;slot.stack=[...(slot.stack||[]),ref.cardId];slot.evolvedOnTurn=ctx.state.turnNumber;ctx.shuffle?.(ctx.state,s.deck);ctx.onEvolved?.(slot);}}break;
      case 'shockBlast':if(!flip()){if(s.active)s.active.damage=Number(s.active.damage||0)+20;if(foe.active)foe.active.damage=Number(foe.active.damage||0)+20;}break;
      case 'rebellion':case 'psylink':case 'relaxingScent':case 'gaseousForm':break; // Checked at the relevant battle-core resolution hook.
      case 'resistanceGym':case 'cinnabarGym':case 'minefieldGym':case 'viridianGym':case 'chaosGym':break; // Continuous rules resolved in battle-core hooks.

      case 'fuchsiaGym':{const candidates=all(s).filter(p=>card(p)?.name?.startsWith("Koga's"));if(!candidates.length)break;if(ctx.resolvingChoice){const p=selected(s);if(p&&candidates.includes(p)&&flip()){applyEffect({type:'shuffleIntoDeck',target:'selfPokemon',includeAttached:true},{...ctx,action:{...a,target:a.choiceTarget,benchIndex:a.choiceBenchIndex}});}}else chooseTarget(s,{nameContains:"Koga's"},'returnToDeck');break;}
      case 'saffronGym':{const eligible=all(s).filter(p=>card(p)?.name?.startsWith("Sabrina's")&&Object.values(p.energy||{}).some(n=>Number(n)>0));if(!eligible.length)break;if(ctx.resolvingChoice){const p=selected(s);if(p&&eligible.includes(p)){const type=a.effectEnergyType||Object.keys(p.energy).find(t=>Number(p.energy[t])>0);if(type)toHandEnergy(p,type);}}else request({kind:'energySource',side:'self',filter:{nameContains:"Sabrina's"},optional:true});break;}
      case 'brockProtection':if(ctx.resolvingChoice){const p=selected(s);if(p&&card(p)?.name?.startsWith("Brock's"))p.gym2BrockProtection=true;}else chooseTarget(s,{nameContains:"Brock's"},'protect');break;
      case 'maxRevive':{
        if(!e.stage){if(s.hand.filter(ref=>card(ref)?.basicEnergy).length<2||s.bench.length>=Number(s.benchLimit||3))break;request({kind:'handCard',side:'self',filter:{kind:'energy'}},{stage:'pay',paid:0});break;}
        if(e.stage==='pay'){
          const ix=Number(a.choiceHandIndex),ref=s.hand[ix];if(!ref||!card(ref)?.basicEnergy)break;const paidRef=s.hand.splice(ix,1)[0];recordDiscardedEnergy(s,card(paidRef).subtype,1);const paid=Number(e.paid||0)+1;
          if(paid<2)request({kind:'handCard',side:'self',filter:{kind:'energy'}},{stage:'pay',paid});else request({kind:'discardCard',side:'self',filter:{kind:'pokemon',stage:'Basic'}},{stage:'revive'});break;
        }
        if(e.stage==='revive'){const i=Number(a.choiceDiscardIndex),ref=s.discard[i];if(ref&&card(ref)?.stage==='Basic'&&s.bench.length<Number(s.benchLimit||3))ctx.benchCard?.(s,s.discard.splice(i,1)[0]);}break;
      }
      case 'mistyTears':{
        if(!e.stage){if(s.hand.length)request({kind:'handCard',side:'self'},{stage:'discard'});break;}
        const i=Number(a.choiceHandIndex);if(!Number.isInteger(i)||!s.hand[i])break;const discarded=s.hand.splice(i,1)[0],paidCard=card(discarded);if(paidCard?.basicEnergy)recordDiscardedEnergy(s,paidCard.subtype,1);else s.discard.push(discarded);const awarded=neoEnergyToHand(ctx,s,'Water',2,'gym2-132');log({energyType:'Water',amount:awarded,adaptation:'Energy Supply'});ctx.shuffle?.(ctx.state,s.deck);break;
      }
      case 'mistyWish':{
        if(!s.prizes.length)break;
        if(!e.stage){const prize=s.prizes[0];log({viewedPrize:prize.cardId});request({kind:'option',side:'opponent',options:['Allow exchange','Decline exchange']},{stage:'decide'});break;}
        if(e.stage==='decide'){
          if(Number(a.choiceOption)===1){draw(s,1);break;}
          if(s.hand.length)request({kind:'handCard',side:'self'},{stage:'exchange'});break;
        }
        if(e.stage==='exchange'){
          const i=Number(a.choiceHandIndex);if(!s.hand[i])break;const [ref]=s.hand.splice(i,1,s.prizes[0]);s.prizes[0]=ref;log({exchangedPrize:true});break;
        }break;
      }
      case 'ninjaTrick':{if(ctx.resolvingChoice){const p=selected(s);if(p===s.active&&card(p)?.name?.startsWith("Koga's")){
        const ownCard=ctx.trainerRef||null;if(ownCard)p.temporaryTrainers=[...(p.temporaryTrainers||[]),ownCard];p.gym2NinjaTrick=true;
      }}else request({kind:'pokemon',side:'self',includeActive:true,filter:{nameContains:"Koga's"}},{stage:'attach'});break;}
      case 'psychicControl':{
        if(!flip())break;
        if(ctx.resolvingChoice){const ref=foe.discard[Number(a.choiceDiscardIndex)],source=card(ref);
          if(source?.kind==='trainer'&&source.trainerType!=='Stadium'&&source.id!== 'gym2-121')applyEffect(source.effect,{...ctx,trainerRef:ref});
        }else request({kind:'discardCard',side:'self',discardZone:'opponent',filter:{kind:'trainer'},optional:true},{stage:'copy'});break;
      }
      case 'surgeSecretPlan':{
        if(!e.stage){if(s.bench.length>=Number(s.benchLimit||3)||!s.hand.length)break;request({kind:'handCard',side:'self'},{stage:'place'});break;}
        const i=Number(a.choiceHandIndex),ref=s.hand[i];if(!ref)break;s.hand.splice(i,1);if(card(ref)?.kind==='pokemon'&&card(ref)?.stage==='Basic'){
          const ix=ctx.benchCard?.(s,ref),placed=s.bench.find(x=>x.uid===ref.uid);if(placed)placed.gym2FaceDown=true;
        }else{
          // Face-down non-Pokémon remain legal until revealed, at which point
          // they are discarded rather than treated as normal Basic Pokémon.
          const ix=ctx.benchCard?.(s,{...ref,cardId:'gym2-10'}),placed=s.bench.find(x=>x.uid===ref.uid);
          if(placed){placed.gym2FaceDown=true;placed.gym2ConcealedId=ref.cardId;}
        }break;
      }
      default:throw new Error('Unimplemented Gym Challenge rule: '+name);
    }
  }

  function applyGymRule(e,ctx){
    if(e.rule?.startsWith('challenge:'))return applyGymChallengeRule(e,ctx);
    const ss=own(ctx),foe=other(ctx),a=ctx.action||{},log=x=>ctx.state.log.push({side:ctx.side,type:'gymEffect',rule:e.rule,...x});
    const flip=()=>{const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,heads,results:[heads],reason:e.rule});return heads;};
    const pokemon=ss=>pokemonOn(ss);
    const choose=(spec,extra={})=>{if(typeof ctx.requestChoice==='function')ctx.requestChoice({...spec,effect:{...e,...extra}});};
    const card=ref=>ctx.cardById(ref?.cardId);
    const pickDeck=(filter,count=1,zone='hand')=>{let taken=0;for(let n=0;n<count;n++){
      const candidates=ss.deck.map((ref,i)=>({ref,i})).filter(x=>filter(card(x.ref)));
      if(!candidates.length)break;const chosen=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)];
      const [ref]=ss.deck.splice(chosen.i,1);if(zone==='bench'){if(ctx.benchCard?.(ss,ref)==null){ss.deck.splice(chosen.i,0,ref);break;}}else ss.hand.push(ref);
      taken++;log({cardId:ref.cardId});}
      if(taken)ctx.shuffle?.(ctx.state,ss.deck);return taken;};
    const beginHandChoice=(filter,extra={},optional=false)=>{
      if(!ss.hand.some(ref=>matchesFilter(card(ref),filter,ref)))return;
      choose({kind:'handCard',side:'self',filter,optional},extra);};
    const attachToken=(type)=>{const ids={Fighting:127,Fire:128,Grass:129,Lightning:130,Psychic:131,Water:132};
      if(ids[type]&&ss.hand.length<10){ss.hand.push({uid:`gym-energy-${ctx.state.turnNumber}-${ctx.side}-${ss.hand.length}`,cardId:`gym1-${ids[type]}`,zoneGenerated:true});log({energyType:type});}};
    const energyTypes=ss.energyTypes?.filter(x=>x!=='Colorless')||['Grass','Fire','Water','Lightning','Psychic','Fighting'];
    const choiceTarget=()=>{if(a.choiceTarget==='active')return ss.active;if(a.choiceTarget==='bench')return ss.bench.find(x=>Number(x?.benchSlot)===Number(a.choiceBenchIndex));return null;};
    switch(e.rule){
      case 'benchGuard':case 'strangeBarrier':case 'photosynthesis':case 'noRemovalGym':case 'rocketGym':case 'ceruleanGym':case 'pewterGym':case 'vermilionGym':case 'narrowGym':break; // Continuous rules resolved by core hooks.
      case 'fairyPower':{
        if(!e.stage){if(!flip())break;choose({kind:'pokemon',side:'self',includeActive:true,optional:true},{stage:'return'});break;}
        if(a.choiceSkip)break;const chosen=choiceTarget();if(chosen){applyEffect({type:'returnToHand',target:'selfPokemon'}, {...ctx,action:{...a,target:a.choiceTarget,benchIndex:a.choiceBenchIndex}});}
        if(pokemon(ss).length)choose({kind:'pokemon',side:'self',includeActive:true,optional:true},{stage:'return'});
        break;
      }
      case 'flee':{
        // Triggered during the opponent's attack, so do not interrupt its
        // pending effects with a player-choice modal. Auto-select a Bench slot.
        if(ss.bench.length) switchPokemon(ss,ss.bench[0].benchSlot,ctx.state);break;
      }
      case 'crosscounter':if(ctx.attacker)ctx.attacker.gymCounterGuard={expiresTurn:ctx.state.turnNumber+1};break;
      case 'fireWall':if(ctx.attacker)ctx.attacker.gymFireWall={expiresTurn:ctx.state.turnNumber+1};break;
      case 'shadowImages':if(ctx.attacker)ctx.attacker.gymShadowImages={expiresTurn:null};break;
      case 'deflector':if(ctx.attacker)ctx.attacker.gymDeflector={expiresTurn:ctx.state.turnNumber+1};break;
      case 'painAmplifier':for(const p of pokemon(foe))if(Number(p.damage)>0)p.damage+=10;break;
      case 'callNight':{
        if(!ctx.defender)return;const max=ctx.maxHp?.(ctx.foeSide,ctx.defender)||Number(card(ctx.defender)?.hp||0);
        if(Number(ctx.defender.damage)>=max)break;
        const h=flip(),h2=flip();if(h&&h2)applyEffect({type:'shuffleIntoDeck',target:'opponentActive',includeAttached:true},ctx);break;
      }
      case 'energyToHand':{
        if(ctx.resolvingChoice){const type=energyTypes[Number(a.choiceOption)];if(type)attachToken(type);}else choose({kind:'option',side:'self',options:energyTypes});break;
      }
      case 'jellyfishPod':{
        const filter={kind:'pokemon',name:['Tentacool','Tentacruel',"Misty's Tentacool","Misty's Tentacruel"]};
        // Repeat until the player declines or there are no matching cards.
        if(ctx.resolvingChoice){if(a.choiceSkip){ctx.shuffle?.(ctx.state,ss.deck);break;}
          const idx=Number(a.choiceDeckIndex),ref=ss.deck[idx];if(ref&&matchesFilter(card(ref),filter,ref)&&ss.hand.length<10)ss.hand.push(...ss.deck.splice(idx,1));}
        if(ss.deck.some(ref=>matchesFilter(card(ref),filter,ref))&&ss.hand.length<10)choose({kind:'deckCard',side:'self',filter,optional:true});
        else ctx.shuffle?.(ctx.state,ss.deck);break;
      }
      case 'mistyCallFriend':pickDeck(c=>c?.kind==='pokemon'&&c.stage==='Basic'&&c.name?.startsWith("Misty's"),1,'bench');break;
      case 'brockCallFriend':pickDeck(c=>c?.kind==='pokemon'&&c.stage==='Basic'&&c.name?.startsWith("Brock's"),1,'bench');break;
      case 'crystalBeam':if(flip()&&ctx.defender)ctx.defender.gymEnergyLock=ctx.state.turnNumber+1;break;
      case 'kindle':applyEffect({type:'discardEnergyCard',target:'self',amount:1},ctx);if(ctx.defender&&(totalEnergy(ctx.defender.energy)||(ctx.defender.specialEnergy||[]).length))applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},ctx);break;
      case 'energyLoop':{
        const from=ctx.attacker?.energy||{};if(Number(from.Psychic||0)<1)break;from.Psychic--;attachToken('Psychic');break;
      }
      case 'sleightHand':{
        const max=Math.min(3,ss.hand.length);
        if(ctx.resolvingChoice){if(a.choiceSkip){for(let i=0;i<Number(e.picked||0);i++)attachToken(energyTypes[0]);ctx.shuffle?.(ctx.state,ss.deck);break;}
          const idx=Number(a.choiceHandIndex);if(idx>=0&&idx<ss.hand.length){const [ref]=ss.hand.splice(idx,1);ss.deck.unshift(ref);}const picked=Number(e.picked||0)+1;
          if(picked>=3||!ss.hand.length){for(let i=0;i<picked;i++)attachToken(energyTypes[0]);ctx.shuffle?.(ctx.state,ss.deck);}else choose({kind:'handCard',side:'self',optional:true},{picked});
        }else if(max)choose({kind:'handCard',side:'self',optional:true},{picked:0});break;
      }
      case 'erikaDraw':{
        const options=['Draw 0 cards','Draw 1 card','Draw 2 cards','Draw 3 cards'];
        if(!e.stage){choose({kind:'option',side:'self',options,prompt:'Erika: choose how many cards to draw'}, {stage:'self'});break;}
        const count=Math.max(0,Math.min(5,Number(a.choiceOption)||0));
        if(e.stage==='self'){for(let i=0;i<count;i++)ctx.drawCard(ss);
          choose({kind:'option',side:'opponent',options,prompt:'Erika: opponent chooses how many cards to draw'},{stage:'opponent'});
        }else if(e.stage==='opponent'){for(let i=0;i<count;i++)ctx.drawCard(foe);}
        break;
      }
      case 'surgeSwap':{
        if(!ss.active||ss.bench.length>=Number(ss.benchLimit||3))break;
        if(ctx.resolvingChoice){const index=Number(a.choiceHandIndex),ref=ss.hand[index];if(!ref||card(ref)?.stage!=='Basic'||card(ref)?.kind!=='pokemon')break;
          const [selected]=ss.hand.splice(index,1),old=ss.active,used=new Set(ss.bench.map(p=>p.benchSlot)),benchSlot=[0,1,2].find(n=>!used.has(n));
          old.benchSlot=benchSlot;ss.bench.push(old);ss.active={uid:selected.uid,cardId:selected.cardId,stack:[selected.cardId],damage:0,energy:{},specialEnergy:[],conditions:{},playedOnSideTurn:ss.turnCount,benchSlot:null,tool:null,extraTools:[],temporaryTrainers:[]};log({cardId:selected.cardId});
        }else beginHandChoice({kind:'pokemon',stage:'Basic'});break;
      }
      case 'mistyBoost':case 'erikasMaids':case 'secretMission':case 'blainesGamble':{
        const needed=e.rule==='mistyBoost'||e.rule==='erikasMaids'?2:Infinity;
        if(!e.stage){if(e.rule==='secretMission')applyEffect({type:'revealHand',side:'opponent'},ctx);choose({kind:'handCard',side:'self',optional:needed===Infinity},{stage:'discard',count:0});break;}
        if(a.choiceSkip){if(e.rule==='secretMission')for(let i=0;i<Number(e.count||0);i++)ctx.drawCard(ss);
          if(e.rule==='blainesGamble'&&flip())for(let i=0;i<2*Number(e.count||0);i++)ctx.drawCard(ss);break;}
        const index=Number(a.choiceHandIndex),ref=ss.hand[index];if(ref){const [spent]=ss.hand.splice(index,1),c=ctx.cardById(spent.cardId);if(ctx.state.format==='classic'&&c?.basicEnergy)recordDiscardedEnergy(ss,c.subtype,1);else ss.discard.push(spent);}const count=Number(e.count||0)+1;
        if(count>=needed||!ss.hand.length){
          if(e.rule==='mistyBoost'){ss.gymMistyBonusTurn=ctx.state.turnNumber;break;}
          if(e.rule==='erikasMaids'){
            applyEffect({type:'searchChosen',source:'deck',amount:2,filter:{kind:'pokemon',nameContains:'Erika'}},ctx);break;
          }
          if(e.rule==='secretMission'){for(let i=0;i<count;i++)ctx.drawCard(ss);break;}
          if(e.rule==='blainesGamble'&&flip())for(let i=0;i<2*count;i++)ctx.drawCard(ss);
        }else choose({kind:'handCard',side:'self',optional:needed===Infinity},{stage:'discard',count});break;
      }
      case 'lastResort':if(ss.hand.length===0)for(let i=0;i<5;i++)ctx.drawCard(ss);break;
      case 'goodManners':if(!ss.hand.some(ref=>card(ref)?.stage==='Basic'&&card(ref)?.kind==='pokemon')){log({cards:ss.hand.map(r=>r.cardId)});applyEffect({type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon',stage:'Basic'}},ctx);}break;
      case 'surgeTreaty':{
        if(ctx.resolvingChoice){if(Number(a.choiceOption)===1)ctx.drawCard(ss);else for(const side of [ss,foe]){const prize=side.prizes?.shift();if(prize){side.hand.push(prize);side.prizesTaken=Number(side.prizesTaken||0)+1;}}}
        else choose({kind:'option',side:'opponent',options:['Each player takes a Prize','Opponent draws a card']});break;
      }
      case 'rocketMinion':{
        if(e.stage==='target'){
          const target=foe.bench.find(slot=>slot&&Number(slot.benchSlot)===Number(a.choiceBenchIndex));
          if(target)applyEffect({type:'returnToHand',target:'opponentBench'},{...ctx,action:{...a,target:'opponentBench',benchIndex:target.benchSlot}});
          break;
        }
        if(flip()&&flip()){
          if(foe.bench.length)choose({kind:'pokemon',side:'self',selectionSide:ctx.foeSide,includeActive:false},{stage:'target'});
        }else ctx.endTurn?.();break;
      }
      case 'mistysWrath':{
        if(!e.stage){const count=Math.min(7,ss.deck.length);if(count)choose({kind:'topDeckCard',side:'self',deckSide:ctx.side,count},{stage:'first',topCount:count});break;}
        const idx=Number(a.choiceDeckIndex),ref=ss.deck[idx];if(ref&&ss.hand.length<10)ss.hand.push(...ss.deck.splice(idx,1));
        const picked=Number(e.picked||0)+1,count=Number(e.topCount||7);
        if(picked<2&&ss.deck.length)choose({kind:'topDeckCard',side:'self',deckSide:ctx.side,count:Math.min(count-picked,ss.deck.length)},{stage:'second',picked,topCount:count});
        else{const discarded=ss.deck.splice(0,Math.min(ss.deck.length,count-picked));ss.discard.push(...discarded);}break;
      }
      case 'recall':ss.gymRecallTurn=ctx.state.turnNumber;break;
      case 'ticklingMachine':if(flip())foe.gymHandHiddenUntil=ctx.state.turnNumber+2;else ctx.endTurn?.();break;
      case 'energyFlow':{
        // The original card returns Energy *cards*, including Special Energy.
        // Generated Basic Energy is materialised as an in-hand Gym Energy
        // token so it remains usable without drawing from the deck.
        const hasAttached=()=>pokemon(ss).some(p=>totalEnergy(p.energy)>0||(p.specialEnergy||[]).length>0);
        if(!hasAttached())break;
        if(ctx.resolvingChoice){
          if(a.choiceSkip)break;
          const p=choiceTarget();
          if(p&&a.effectSpecialEnergyUid){
            const index=(p.specialEnergy||[]).findIndex(ref=>ref.uid===a.effectSpecialEnergyUid);
            if(index>=0){const [ref]=p.specialEnergy.splice(index,1);ss.hand.push(ref);log({returnedCardId:ref.cardId});}
          }else if(p&&a.effectEnergyType&&Number(p.energy?.[a.effectEnergyType]||0)>0){
            const type=a.effectEnergyType;
            p.energy[type]--;
            // Energy Flow must never silently lose an Energy just because the
            // usual Pocket hand capacity has been reached.
            const ids={Fighting:127,Fire:128,Grass:129,Lightning:130,Psychic:131,Water:132};
            if(ids[type])ss.hand.push({uid:`energy-flow-${ctx.state.turnNumber}-${ctx.side}-${ss.hand.length}`,cardId:`gym1-${ids[type]}`,zoneGenerated:true});
            else p.energy[type]++; // Unknown generated types stay attached.
            log({returnedEnergyType:type});
          }
        }
        if(hasAttached())choose({kind:'energySource',side:'self',includeSpecial:true,optional:true});
        break;
      }
      case 'mistysDuel':{
        const winner=flip()?ss:foe,old=winner.hand.length;winner.deck.push(...winner.hand.splice(0));ctx.shuffle?.(ctx.state,winner.deck);for(let i=0;i<5;i++)ctx.drawCard(winner);log({winner:winner===ss?ctx.side:ctx.foeSide,previousHand:old});break;
      }
      case 'trashExchange':{
        const n=ss.discard.length,refs=ss.discard.splice(0);ss.deck.push(...refs);ctx.shuffle?.(ctx.state,ss.deck);ss.discard.push(...ss.deck.splice(0,Math.min(n,ss.deck.length)));break;
      }
      case 'celadonCure':{
        if(ctx.resolvingChoice){const p=choiceTarget();if(p&&card(p)?.name?.startsWith("Erika's")&&Object.keys(p.conditions||{}).length){const t=a.effectEnergyType||Object.keys(p.energy||{}).find(t=>p.energy[t]>0);if(t&&p.energy[t]>0){p.energy[t]--;ss.energyDiscard=ss.energyDiscard||{};ss.energyDiscard[t]=Number(ss.energyDiscard[t]||0)+1;p.conditions={};}}}
        else choose({kind:'energySource',side:'self',filter:{nameContains:'Erika'},optional:true});break;
      }
      case 'blainesQuiz':{
        if(!e.stage){beginHandChoice({kind:'pokemon'},{stage:'reveal'});break;}
        if(a.choiceSkip)break;
        const pokemonCard=card(ss.hand[Number(a.choiceHandIndex)]);
        if(!pokemonCard||pokemonCard.kind!=='pokemon')break;
        // Heads = correct guess (opponent draws two), tails = wrong guess
        // (you draw two). Preserve printed draw consequence, adapt only the guess.
        const correct=flip();
        log({revealedCard:pokemonCard.id,quizAdaptation:'coinFlip',guessCorrect:correct});
        for(let i=0;i<2;i++)ctx.drawCard(correct?foe:ss);
        break;
      }
      case 'charity':{
        if(ctx.resolvingChoice){const reduce=Math.max(0,Math.min(100,10*Number(a.choiceOption||0)));
          ss.gymCharity={turn:ctx.state.turnNumber,uid:ctx.trainerRef?.uid,activeUid:ss.active?.uid,reduce};
          // Card is already in discard. Return it after this turn unless the
          // Active is Knocked Out, exactly as stated by the printed card.
        }else choose({kind:'option',side:'self',options:Array.from({length:11},(_,i)=>`Reduce attack damage by ${i*10}`)});
        break;
      }
      case 'sabrinasEsp':{
        if(ctx.resolvingChoice){const p=choiceTarget();if(p&&card(p)?.name?.startsWith("Sabrina's")&&ctx.trainerRef){
          const index=ss.discard.findIndex(r=>r.uid===ctx.trainerRef.uid);if(index>=0){const [ref]=ss.discard.splice(index,1);p.temporaryTrainers=p.temporaryTrainers||[];p.temporaryTrainers.push({...ref,attachedTurn:ctx.state.turnNumber});}
        }}else choose({kind:'pokemon',side:'self',includeActive:true,filter:{nameContains:'Sabrina'}});
        break;
      }
      default:throw new Error('Unimplemented Gym Heroes rule: '+e.rule);
    }
  }

  // Johto mechanics use the same seeded RNG, choices and board as other
  // Classic cards. Basic Energy remains in the separate Energy Zone.
  const neoBasicIds={Fighting:'neo1-106',Fire:'neo1-107',Grass:'neo1-108',Lightning:'neo1-109',Psychic:'neo1-110',Water:'neo1-111',Darkness:'lental-basic-darkness',Metal:'lental-basic-metal'};
  function neoDiscardAvailable(ctx,ss,type){
    return Math.max(0,Number(ss?.energyDiscard?.[type]||0))+(ss?.discard||[]).filter(ref=>{const c=ctx.cardById(ref.cardId);return c?.basicEnergy&&c.subtype===type;}).length;
  }
  function neoTakeDiscard(ctx,ss,type,count=1){
    if(!ss||!type)return 0;
    let taken=0;
    for(let i=0;i<count;i++){
      if(Number(ss.energyDiscard?.[type]||0)>0){ss.energyDiscard[type]--;taken++;continue;}
      const idx=(ss.discard||[]).findIndex(ref=>{const c=ctx.cardById(ref.cardId);return c?.basicEnergy&&c.subtype===type;});
      if(idx<0)break;
      ss.discard.splice(idx,1);taken++;
    }
    return taken;
  }
  function neoSupplyTake(ctx,ss,type,amount=1){
    if(!ss)return 0;
    if(!Array.isArray(ss.energySupply))return Math.max(0,Number(amount)||0); // Legacy test state / Pocket
    let taken=0;
    while(taken<amount){
      const idx=type?ss.energySupply.indexOf(type):0;
      if(idx<0||idx>=ss.energySupply.length)break;
      ss.energySupply.splice(idx,1);taken++;
    }
    ss.nextEnergyType=ss.energySupply[0]||null;
    return taken;
  }
  function neoEnergyToHand(ctx,ss,type,count,preferredCardId){
    if(!neoBasicIds[type])return 0;
    const amount=neoSupplyTake(ctx,ss,type,count);
    for(let i=0;i<amount;i++)ss.hand.push({uid:`neo-energy-${type}-${ctx.state.turnNumber}-${ctx.state.rngState}-${ss.hand.length}`,cardId:preferredCardId||neoBasicIds[type],zoneGenerated:true});
    if(amount)ctx.state.log.push({type:'energyFromSupply',side:ss.id||ctx.side,energyType:type,amount,remaining:ss.energySupply?.length});
    return amount;
  }
  function neoRecoveredEnergyToHand(ctx,ss,type,count,preferredCardId){
    if(!neoBasicIds[type])return 0;
    const amount=Math.max(0,Number(count)||0);
    for(let i=0;i<amount;i++)ss.hand.push({uid:`neo-recovered-${type}-${ctx.state.turnNumber}-${ctx.state.rngState}-${ss.hand.length}`,cardId:preferredCardId||neoBasicIds[type],zoneGenerated:true});
    return amount;
  }
  function neoSupplyAttach(ctx,ss,slot,type,amount){
    const count=neoSupplyTake(ctx,ss,type,amount);
    if(count&&slot){slot.energy=slot.energy||{};slot.energy[type]=Number(slot.energy[type]||0)+count;ctx.onEnergyAttached?.(slot,type,count);}
    return count;
  }
  function neoFlip(ctx,reason){const h=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Neo Genesis '+reason,heads:h,results:[h]});return h;}
  function neoSlots(ctx,side){return pokemonOn(side==='opponent'?other(ctx):own(ctx));}
  // Unown [D], [M] and [N] reduce *all* attack damage to their team,
  // including secondary Bench hits from Tyranitar, Yanma and other cards.
  // Duplicate copies of the same Unown letter disable that letter's Power.
  function neoDiscoveryReduction(state,defendingSide,attackingSide,attackingSlot,damage,cardById){
    if(state?.format!=='classic'||!(damage>0)||!attackingSlot)return Math.max(0,Number(damage||0));
    const names={Darkness:'Unown [D]',Metal:'Unown [M]',Colorless:'Unown [N]'},types=effectiveTypes(state,attackingSide,attackingSlot,cardById);
    let n=Math.max(0,Number(damage||0));
    for(const [type,name] of Object.entries(names)){
      if(!types.includes(type))continue;
      const support=pokemonOn(state.sides[defendingSide]).filter(x=>cardById(x.cardId)?.name===name);
      if(support.length===1&&!abilitiesSuppressed(state,defendingSide,support[0],cardById))n=Math.max(0,n-30);
    }
    return n;
  }
  function neoRule(e,ctx){
    const ss=own(ctx),foe=other(ctx),a=ctx.attacker,d=ctx.defender,turn=ctx.state.turnNumber;
    const pick=(which,rule,opts={})=>ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:which==='opponent'?ctx.foeSide:ctx.side,includeActive:opts.includeActive!==false,filter:opts.filter,effect:{type:'neoRule',rule},optional:!!opts.optional});
    const sel=(which)=>{const board=which==='opponent'?foe:ss,target=ctx.action?.choiceTarget,index=Number(ctx.action?.choiceBenchIndex);return target==='active'?board.active:(board.bench||[]).find(x=>Number(x.benchSlot)===index);};
    const log=(details)=>ctx.state.log.push({type:'neoEffect',side:ctx.side,rule:e.rule,...details});
    switch(e.rule){
      // Neo Revelation: the optional Fire search draws from the same ordered
      // Basic Energy supply as the Classic Energy Zone (not the 30-card deck).
      case 'revelation:nightEyes':{
        if(d)d.neoRevNightEyes={turn,side:ctx.side};
        break;
      }
      case 'revelation:perishSong':{
        // Night Eyes on the user's previous turn, still Asleep and same defender.
        if(d?.conditions?.sleep&&d.neoRevNightEyes?.side===ctx.side&&d.neoRevNightEyes.turn===turn-2){
          d.damage=Math.max(Number(d.damage||0),ctx.maxHp?ctx.maxHp(ctx.foeSide,d):Number(ctx.cardById(d.cardId)?.hp||0));
          log({knockout:d.cardId});
        }
        break;
      }
      case 'revelation:callMurkrow':{
        if(ss.bench.length<Math.min(5,Number(ss.benchLimit??3))&&ss.deck.some(ref=>ctx.cardById(ref.cardId)?.name==='Murkrow'))
          ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'pokemon',name:'Murkrow'},effect:{type:'neoRule',rule:'revelation:callMurkrowPick'}});
        break;
      }
      case 'revelation:callMurkrowPick':{
        const i=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[i];
        if(ref&&ctx.cardById(ref.cardId)?.name==='Murkrow'&&ss.bench.length<Math.min(5,Number(ss.benchLimit??3))){
          const [picked]=ss.deck.splice(i,1);ctx.benchCard?.(ss,picked);ctx.shuffle?.(ctx.state,ss.deck);log({benched:picked.cardId});
        }
        break;
      }
      case 'revelation:oldRod':{
        const heads=(neoFlip(ctx,'Old Rod')?1:0)+(neoFlip(ctx,'Old Rod')?1:0);
        const filter=heads===2?{kind:'pokemon'}:heads===0?{kind:'trainer'}:null;
        if(filter&&ss.discard.some(ref=>ctx.cardById(ref.cardId)?.kind===filter.kind))
          ctx.requestChoice?.({kind:'discardCard',side:'self',filter,effect:{type:'neoRule',rule:'revelation:oldRodPick',kind:filter.kind}});
        break;
      }
      case 'revelation:oldRodPick':{
        const i=Number(ctx.action?.choiceDiscardIndex),ref=ss.discard[i];
        if(ref&&ctx.cardById(ref.cardId)?.kind===e.kind&&ss.hand.length<10){ss.hand.push(...ss.discard.splice(i,1));log({recovered:ref.cardId});}
        break;
      }
      case 'revelation:attractCurrent':{
        let heads=0;for(let i=0;i<3;i++)if(neoFlip(ctx,'Attract Current'))heads++;
        const targets=neoSlots(ctx,'self').filter(slot=>ctx.cardById(slot.cardId)?.types?.includes('Lightning'));
        if(heads&&targets.length&&(!Array.isArray(ss.energySupply)||ss.energySupply.includes('Lightning')))
          ctx.requestChoice?.({kind:'pokemon',side:'self',includeActive:true,optional:true,filter:{subtype:'Lightning'},effect:{type:'neoRule',rule:'revelation:attractCurrentPick',remaining:heads}});
        break;
      }
      case 'revelation:attractCurrentPick':{
        if(ctx.action?.choiceSkip)break;
        const target=sel('self');if(!target||!ctx.cardById(target.cardId)?.types?.includes('Lightning'))break;
        const taken=neoSupplyAttach(ctx,ss,target,'Lightning',1);
        log({energyType:'Lightning',amount:taken});
        if(taken&&Number(e.remaining)>1&&(!Array.isArray(ss.energySupply)||ss.energySupply.includes('Lightning')))
          ctx.requestChoice?.({kind:'pokemon',side:'self',includeActive:true,optional:true,filter:{subtype:'Lightning'},effect:{...e,remaining:Number(e.remaining)-1}});
        break;
      }
      case 'revelation:goldScale':{
        // The defending player may draw two, but either decision lets the
        // attacking player draw two. Never silently deny the opponent's choice.
        ctx.requestChoice?.({kind:'option',side:'opponent',options:['Draw two cards','Do not draw'],effect:{type:'neoRule',rule:'revelation:goldScalePick'}});
        break;
      }
      case 'revelation:goldScalePick':{
        if(Number(ctx.action?.choiceOption)===0)for(let i=0;i<2;i++)ctx.drawCard(foe);
        for(let i=0;i<2;i++)ctx.drawCard(ss);
        break;
      }
      case 'revelation:dragonBond':{
        const names=['Gyarados','Dark Gyarados','Shining Gyarados'];
        if(ss.deck.some(ref=>names.includes(ctx.cardById(ref.cardId)?.name)))
          ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{name:names},effect:{type:'neoRule',rule:'revelation:dragonBondPick'}});
        break;
      }
      case 'revelation:dragonBondPick':{
        const i=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[i];
        if(ref&&['Gyarados','Dark Gyarados','Shining Gyarados'].includes(ctx.cardById(ref.cardId)?.name)){
          ss.hand.push(...ss.deck.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);log({searched:ref.cardId});
        }
        break;
      }
      case 'revelation:stoke':{
        if(!a||!Array.isArray(ss.energySupply)||!ss.energySupply.includes('Fire'))break;
        ctx.requestChoice?.({kind:'option',side:'self',options:['Attach Fire Energy','Do not attach'],effect:{type:'neoRule',rule:'revelation:stokePick',uid:a.uid}});
        break;
      }
      case 'revelation:stokePick':{
        if(Number(ctx.action?.choiceOption)!==0)break;
        const target=neoSlots(ctx,'self').find(s=>s.uid===e.uid);
        if(target){const n=neoSupplyAttach(ctx,ss,target,'Fire',1);log({amount:n,energyType:'Fire'});}
        break;
      }
      case 'berserk':{const victim=neoFlip(ctx,'Berserk')?foe:ss;victim.discard.push(...victim.deck.splice(0,5));break;}
      case 'downpour':{const index=ss.hand.findIndex(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype==='Water');if(index>=0){ss.hand.splice(index,1);recordDiscardedEnergy(ss,'Water',1);}break;}
      case 'herbalScent':if(neoFlip(ctx,'Herbal Scent'))for(const s of [...neoSlots(ctx,'self'),...neoSlots(ctx,'opponent')])if(ctx.cardById(s.cardId)?.types?.includes('Grass'))s.damage=0;break;
      case 'fireRecharge':if(neoFlip(ctx,'Fire Recharge')&&(Number(ss.energyDiscard?.Fire||0)>0||ss.discard.some(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype==='Fire'))){const eligible=neoSlots(ctx,'self').filter(s=>ctx.cardById(s.cardId)?.types?.includes('Fire'));if(eligible.length)pick('self','fireRechargeTarget',{filter:{subtype:'Fire'}});}break;
      case 'fireRechargeTarget':{const s=sel('self');if(!s)break;if(Number(ss.energyDiscard?.Fire||0)>0)ss.energyDiscard.Fire--;else{const i=ss.discard.findIndex(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype==='Fire');if(i<0)break;ss.discard.splice(i,1);}s.energy.Fire=Number(s.energy.Fire||0)+1;ctx.onEnergyAttached?.(s,'Fire',1);break;}
      case 'fireBoost':if(neoFlip(ctx,'Fire Boost')&&a){const n=neoSupplyAttach(ctx,ss,a,'Fire',4);log({amount:n});}break;
      case 'playfulPunch':{const h=neoFlip(ctx,'Playful Punch');if(h&&d){const damage=ctx.state.format==='classic'?20:20;d.damage=Number(d.damage||0)+damage;d.lastDamageSource={side:ctx.side,uid:a?.uid,cardId:a?.cardId,attack:false,turn};}ctx.endTurn?.();break;}
      case 'glaringGaze':if(neoFlip(ctx,'Glaring Gaze')&&foe.hand.some(r=>ctx.cardById(r.cardId)?.kind==='trainer'))ctx.requestChoice?.({kind:'opponentHandCard',side:'self',filter:{kind:'trainer'},effect:{type:'neoRule',rule:'glaringGazePick'}});break;
      case 'glaringGazePick':{const i=Number(ctx.action?.choiceHandIndex),ref=foe.hand[i];if(ref&&ctx.cardById(ref.cardId)?.kind==='trainer'){foe.deck.push(...foe.hand.splice(i,1));ctx.shuffle?.(ctx.state,foe.deck);}break;}
      case 'rapidSpin':if(foe.bench.length)ctx.requestChoice?.({kind:'switchBench',side:'opponent',effect:{type:'neoRule',rule:'rapidSpinFoe'}});else if(ss.bench.length)ctx.requestChoice?.({kind:'switchBench',side:'self',effect:{type:'neoRule',rule:'rapidSpinSelf'}});break;
      case 'rapidSpinFoe':switchPokemon(foe,ctx.action.choiceBenchIndex,ctx.state);if(ss.bench.length)ctx.requestChoice?.({kind:'switchBench',side:'self',effect:{type:'neoRule',rule:'rapidSpinSelf'}});break;
      case 'rapidSpinSelf':switchPokemon(ss,ctx.action.choiceBenchIndex,ctx.state);break;
      case 'dragonTornado':if(d&&foe.active===d&&d.damage<Number(ctx.cardById(d.cardId)?.hp||0)&&foe.bench.length)ctx.requestChoice?.({kind:'switchBench',side:'self',selectionSide:ctx.foeSide,effect:{type:'neoRule',rule:'dragonTornadoSwitch'}});break;
      case 'dragonTornadoSwitch':switchPokemon(foe,ctx.action.choiceBenchIndex,ctx.state);break;
      case 'zzzap':for(const side of ['self','opponent'])for(const s of neoSlots(ctx,side))if((ctx.cardById(s.cardId)?.abilities||[]).length)s.damage=Number(s.damage||0)+20;break;
      case 'sputter':ctx.state.neoPowerLockUntil=turn+2;break;
      case 'meanLook':if(d)d.neoMeanLook={sourceUid:a?.uid,side:ctx.side};break;
      case 'spiderWeb':if(d)d.neoWebLock={sourceUid:a?.uid,side:ctx.side};break;
      case 'poisonBite':if(d&&Number(ctx.dealtDamage||0)>0){d.conditions={...(d.conditions||{}),poison:true};if(a)a.damage=Math.max(0,Number(a.damage||0)-Math.ceil(ctx.dealtDamage/20)*10);}break;
      case 'sweetScent':if(neoFlip(ctx,'Sweet Scent'))pick('self','sweetScentSelf');else pick('opponent','sweetScentOpponent');break;
      case 'sweetScentSelf':case 'sweetScentOpponent':{const slot=sel(e.rule==='sweetScentSelf'?'self':'opponent');if(slot)slot.damage=Math.max(0,Number(slot.damage||0)-20);break;}
      case 'squaredance':{const total=neoSlots(ctx,'self').length+neoSlots(ctx,'opponent').length;let heads=0;for(let i=0;i<total;i++)if(neoFlip(ctx,'Squaredance'))heads++;const type=ss.energyTypes.find(t=>neoBasicIds[t])||'Grass';neoEnergyToHand(ctx,ss,type,heads);break;}
      case 'screech':if(d)d.neoScreech={sourceUid:a?.uid,expiresTurn:turn+2};break;
      case 'jawClamp':if(d)d.neoJawClamp={sourceUid:a?.uid,expiresTurn:turn+1};break;
      case 'electricCurrent':{if(!a||!Number(a.energy.Lightning||0))break;if(!ss.bench.length){a.energy.Lightning--;recordDiscardedEnergy(ss,'Lightning',1);}else ctx.requestChoice?.({kind:'pokemon',side:'self',includeActive:false,effect:{type:'neoRule',rule:'electricCurrentTarget'}});break;}
      case 'electricCurrentTarget':{const s=sel('self');if(a&&s&&a.energy?.Lightning>0){a.energy.Lightning--;s.energy.Lightning=Number(s.energy.Lightning||0)+1;}break;}
      case 'batonPass':if(a&&ss.bench.some(s=>ctx.cardById(s.cardId)?.types?.includes('Grass')))ctx.requestChoice?.({kind:'pokemon',side:'self',includeActive:false,filter:{subtype:'Grass'},effect:{type:'neoRule',rule:'batonPassTarget'}});break;
      case 'batonPassTarget':{const s=sel('self');if(a&&s&&ss.bench.includes(s)){const amount=Number(a.energy.Grass||0);a.energy.Grass=0;s.energy.Grass=Number(s.energy.Grass||0)+amount;switchPokemon(ss,s.benchSlot,ctx.state);}break;}
      case 'freeze':if(d)d.neoAttackLock={sourceUid:a?.uid};break;
      case 'leer':if(d)d.neoLeer={sourceUid:a?.uid,expiresTurn:turn+1};break;
      case 'scaryFace':if(d)d.neoScaryFace={sourceUid:a?.uid,expiresTurn:turn+1};break;
      case 'deflector':if(a)a.neoDeflector={expiresTurn:turn+1};break;
      case 'char':if(d&&!d.neoChar)d.neoChar={sourceUid:a?.uid};break;
      case 'prophecy':if(!ctx.resolvingChoice)ctx.requestChoice?.({kind:'option',side:'self',options:['Your deck','Opponent deck'],effect:e});else applyEffect({type:'reorderTop',deckSide:Number(ctx.action?.choiceOption)===1?'opponent':'self',count:3},ctx);break;
      case 'growth':{const hand=ss.hand.filter(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype==='Grass');if(a)for(let i=0;i<2&&i<hand.length;i++){const ref=hand[i],idx=ss.hand.indexOf(ref);if(idx<0)continue;ss.hand.splice(idx,1);a.energy.Grass=Number(a.energy.Grass||0)+1;}break;}
      case 'staticElectricity':for(const s of neoSlots(ctx,'self'))if(ctx.cardById(s.cardId)?.name==='Mareep')neoSupplyAttach(ctx,ss,s,'Lightning',1);break;
      case 'pilfer':{if(!a)break;const refs=(a.stack||[]).map((cardId,i)=>({uid:`neo-pilfer-${turn}-${i}`,cardId}));for(const r of [...(a.specialEnergy||[]),...(a.temporaryTrainers||[]),...toolsOf(a)])refs.push(r);for(const [type,n] of Object.entries(a.energy||{}))for(let i=0;i<Number(n||0);i++)if(neoBasicIds[type]){if(Array.isArray(ss.energySupply))ss.energySupply.push(type);else refs.push({uid:`neo-pilfer-${type}-${turn}-${i}`,cardId:neoBasicIds[type],zoneGenerated:true});}ss.nextEnergyType=ss.energySupply?.[0]||ss.nextEnergyType;ss.deck.push(...refs);ctx.shuffle?.(ctx.state,ss.deck);if(ss.active===a)ss.active=null;else ss.bench.splice(ss.bench.indexOf(a),1);if(neoFlip(ctx,'Pilfer')&&ss.discard.length)ctx.requestChoice?.({kind:'discardCard',side:'self',effect:{type:'neoRule',rule:'pilferRecovery'}});break;}
      case 'pilferRecovery':{const i=Number(ctx.action?.choiceDiscardIndex);if(ss.discard[i]){ss.deck.push(...ss.discard.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);}break;}
      case 'fireWind':case 'mudSplash':{const idx=Number(ctx.action?.benchIndex);const target=foe.bench.find(s=>Number(s.benchSlot)===idx);if(!target)break;let hits=0;for(let i=0;i<(e.rule==='fireWind'?2:1);i++)if(neoFlip(ctx,e.rule))hits++;if(hits)target.damage=Number(target.damage||0)+10*hits;break;}
      case 'amnesia':if(d&&ctx.resolvingChoice)d.neoAmnesia={attackName:ctx.action?.choiceLabel||ctx.cardById(d.cardId)?.attacks?.[Number(ctx.action?.choiceOption)]?.name,expiresTurn:turn+1};else if(d)ctx.requestChoice?.({kind:'option',side:'self',options:(ctx.cardById(d.cardId)?.attacks||[]).map(x=>x.name),effect:e});break;
      case 'pollenShield':if(a)a.neoPollenShield={expiresTurn:turn+1};break;
      case 'elm':applyEffect({type:'handShuffle',side:'self',draw:7},ctx);ss.neoTrainerLockTurn=turn;break;
      case 'arcadeGame':{
        ctx.shuffle?.(ctx.state,ss.deck);const top=ss.deck.splice(0,Math.min(3,ss.deck.length)),counts=new Map();
        for(const ref of top){const name=ctx.cardById(ref.cardId)?.name;counts.set(name,(counts.get(name)||0)+1);}
        const matching=[...counts.entries()].find(([,num])=>num>=2)?.[0];for(const ref of top)(matching&&ctx.cardById(ref.cardId)?.name===matching?ss.hand:ss.deck).push(ref);
        ctx.shuffle?.(ctx.state,ss.deck);log({chosenName:matching||null});break;
      }
      case 'energyCharge':if(neoFlip(ctx,'Energy Charge'))neoRule({...e,rule:'energyChargePick',remaining:2},{...ctx,resolvingChoice:false});break;
      case 'energyChargePick':{
        const choices=[...(ss.discard||[]).map((ref,i)=>({label:`Discard: ${ctx.cardById(ref.cardId)?.name}`,index:i,ref})).filter(x=>ctx.cardById(x.ref.cardId)?.kind==='energy'),
          ...Object.entries(ss.energyDiscard||{}).filter(([type,n])=>neoBasicIds[type]&&n>0).map(([type])=>({label:`Discarded ${type} Energy`,type}))];
        if(ctx.resolvingChoice){const selected=choices[Number(ctx.action?.choiceOption)];if(!selected)break;
          if(selected.ref){const [ref]=ss.discard.splice(selected.index,1),c=ctx.cardById(ref?.cardId);if(c?.basicEnergy&&Array.isArray(ss.energySupply)){ss.energySupply.push(c.subtype);ss.nextEnergyType=ss.energySupply[0]||null;}else if(ref)ss.deck.push(ref);}
          else{ss.energyDiscard[selected.type]--;if(Array.isArray(ss.energySupply)){ss.energySupply.push(selected.type);ss.nextEnergyType=ss.energySupply[0]||null;}else ss.deck.push({uid:`neo-charge-${turn}-${ss.deck.length}`,cardId:neoBasicIds[selected.type],zoneGenerated:true});}
          ctx.shuffle?.(ctx.state,ss.deck);
          if(Number(e.remaining||1)>1)neoRule({...e,remaining:Number(e.remaining)-1},{...ctx,resolvingChoice:false});
        }else if(choices.length)ctx.requestChoice?.({kind:'option',side:'self',options:[...choices.map(x=>x.label),'Done'],effect:e});
        break;
      }
      case 'mary':for(let i=0;i<2;i++)ctx.drawCard(ss);if(ss.hand.length)ctx.requestChoice?.({kind:'handCard',side:'self',effect:{type:'neoRule',rule:'maryPick',remaining:2}});break;
      case 'maryPick':{
        const index=Number(ctx.action?.choiceHandIndex);if(!Number.isInteger(index)||!ss.hand[index])break;
        ss.deck.push(...ss.hand.splice(index,1));ctx.shuffle?.(ctx.state,ss.deck);
        if(Number(e.remaining||1)>1&&ss.hand.length)ctx.requestChoice?.({kind:'handCard',side:'self',effect:{type:'neoRule',rule:'maryPick',remaining:Number(e.remaining)-1}});
        break;
      }
      case 'pokeGear':{
        const hits=ss.deck.slice(0,7).filter(ref=>ctx.cardById(ref.cardId)?.kind==='trainer');
        if(hits.length)ctx.requestChoice?.({kind:'topDeckCard',side:'self',deckSide:ctx.side,count:7,filter:{kind:'trainer'},optional:true,effect:{type:'neoRule',rule:'pokeGearPick'}});
        ss.neoTrainerLockTurn=turn;break;
      }
      case 'pokeGearPick':{
        if(!ctx.action?.choiceSkip){const index=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[index];if(index<7&&ctx.cardById(ref?.cardId)?.kind==='trainer')ss.hand.push(...ss.deck.splice(index,1));}
        ctx.shuffle?.(ctx.state,ss.deck);break;
      }
      case 'superEnergyRetrieval':{
        const energyCount=Object.values(ss.energyDiscard||{}).reduce((n,x)=>n+Number(x||0),0)+(ss.discard||[]).filter(r=>ctx.cardById(r.cardId)?.basicEnergy).length;
        if(ss.hand.length<2||!energyCount)break;
        ctx.requestChoice?.({kind:'handCard',side:'self',effect:{type:'neoRule',rule:'superEnergyDiscard',remaining:2}});break;
      }
      case 'superEnergyDiscard':{
        const index=Number(ctx.action?.choiceHandIndex);if(!ss.hand[index])break;const [ref]=ss.hand.splice(index,1);const c=ctx.cardById(ref.cardId);if(c?.basicEnergy)recordDiscardedEnergy(ss,c.subtype,1);else ss.discard.push(ref);
        if(Number(e.remaining||1)>1&&ss.hand.length)ctx.requestChoice?.({kind:'handCard',side:'self',effect:{...e,remaining:Number(e.remaining)-1}});
        else neoRule({type:'neoRule',rule:'superEnergyRetrieve',remaining:4},{...ctx,resolvingChoice:false});
        break;
      }
      case 'superEnergyRetrieve':{
        const types=[...new Set([...Object.entries(ss.energyDiscard||{}).filter(([t,n])=>neoBasicIds[t]&&n>0).map(([t])=>t),...(ss.discard||[]).map(r=>ctx.cardById(r.cardId)).filter(c=>c?.basicEnergy).map(c=>c.subtype)])];
        if(!types.length)break;
        if(!ctx.resolvingChoice)ctx.requestChoice?.({kind:'option',side:'self',options:[...types,'Done'],effect:{...e,phase:'take'}});
        else{
          const type=types[Number(ctx.action?.choiceOption)];if(!type)break;
          const i=ss.discard.findIndex(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype===type);
          if(i>=0)ss.hand.push(...ss.discard.splice(i,1));else if(ss.energyDiscard?.[type]>0){ss.energyDiscard[type]--;neoRecoveredEnergyToHand(ctx,ss,type,1);}
          if(Number(e.remaining||1)>1)neoRule({...e,remaining:Number(e.remaining)-1,phase:'start'}, {...ctx,resolvingChoice:false});
        }break;
      }
      case 'timeCapsule':ss.neoTrainerLockTurn=turn;neoRule({type:'neoRule',rule:'timeCapsulePick',selectionSide:'opponent',remaining:5},{...ctx,resolvingChoice:false});break;
      case 'timeCapsulePick':{
        const board=e.selectionSide==='opponent'?foe:ss;
        const choices=[...(board.discard||[]).map((ref,index)=>({label:ctx.cardById(ref.cardId)?.name||ref.cardId,ref,index})).filter(x=>['pokemon'].includes(ctx.cardById(x.ref.cardId)?.kind)||ctx.cardById(x.ref.cardId)?.basicEnergy),
          ...Object.entries(board.energyDiscard||{}).filter(([type,n])=>neoBasicIds[type]&&n>0).map(([type])=>({label:`${type} Energy from discard`,type}))];
        if(ctx.resolvingChoice){const selected=choices[Number(ctx.action?.choiceOption)];
          if(selected){if(selected.ref){const [ref]=board.discard.splice(selected.index,1),c=ctx.cardById(ref?.cardId);if(c?.basicEnergy&&Array.isArray(board.energySupply)){board.energySupply.push(c.subtype);board.nextEnergyType=board.energySupply[0]||null;}else if(ref)board.deck.push(ref);}else{board.energyDiscard[selected.type]--;if(Array.isArray(board.energySupply)){board.energySupply.push(selected.type);board.nextEnergyType=board.energySupply[0]||null;}else board.deck.push({uid:`neo-capsule-${turn}-${board.deck.length}`,cardId:neoBasicIds[selected.type],zoneGenerated:true});}ctx.shuffle?.(ctx.state,board.deck);}
          if(selected&&Number(e.remaining||1)>1)neoRule({...e,remaining:Number(e.remaining)-1},{...ctx,resolvingChoice:false});
          else if(e.selectionSide==='opponent')neoRule({...e,selectionSide:'self',remaining:5},{...ctx,resolvingChoice:false});
        }else if(choices.length)ctx.requestChoice?.({kind:'option',side:'self',options:[...choices.map(x=>x.label),'Done'],effect:e});
        else if(e.selectionSide==='opponent')neoRule({...e,selectionSide:'self',remaining:5},{...ctx,resolvingChoice:false});
        break;
      }
      case 'cardFlipGame':{
        if(!foe.prizes?.length)break;
        const options=foe.prizes.flatMap((_,i)=>['Pokémon','Trainer','Energy'].map(type=>`Prize ${i+1} · ${type}`));
        ctx.requestChoice?.({kind:'option',side:'self',options,effect:{type:'neoRule',rule:'cardFlipGuess'}});break;
      }
      case 'cardFlipGuess':{
        const index=Number(ctx.action?.choiceOption),prizeIndex=Math.floor(index/3),expected=['pokemon','trainer','energy'][index%3],ref=foe.prizes?.[prizeIndex];if(!ref||!expected)break;
        ref.revealed=true;if(ctx.cardById(ref.cardId)?.kind===expected)for(let i=0;i<2;i++)ctx.drawCard(ss);
        log({prizeIndex,guess:expected,actual:ctx.cardById(ref.cardId)?.kind});break;
      }
      case 'doubleGust':if(foe.bench.length)ctx.requestChoice?.({kind:'switchBench',side:'opponent',effect:{type:'neoRule',rule:'doubleGustOpponent'}});else if(ss.bench.length)ctx.requestChoice?.({kind:'switchBench',side:'self',effect:{type:'neoRule',rule:'doubleGustSelf'}});break;
      case 'doubleGustOpponent':switchPokemon(foe,ctx.action?.choiceBenchIndex,ctx.state);if(ss.bench.length)ctx.requestChoice?.({kind:'switchBench',side:'self',effect:{type:'neoRule',rule:'doubleGustSelf'}});break;
      case 'doubleGustSelf':switchPokemon(ss,ctx.action?.choiceBenchIndex,ctx.state);break;
      case 'mooMooMilk':pick('self','mooMooPick');break;
      case 'mooMooPick':{const slot=sel('self');if(!slot)break;let heads=0;for(let i=0;i<2;i++)if(neoFlip(ctx,'Moo-Moo Milk'))heads++;slot.damage=Math.max(0,Number(slot.damage||0)-heads*20);break;}
      case 'pokemonMarch':{
        const hasBasics=board=>board.deck.some(r=>ctx.cardById(r.cardId)?.stage==='Basic'&&ctx.cardById(r.cardId)?.kind==='pokemon')&&board.bench.length<Math.min(5,Number(board.benchLimit??3));
        if(hasBasics(foe))ctx.requestChoice?.({kind:'deckCard',side:'opponent',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect:{type:'neoRule',rule:'pokemonMarchFoe'}});
        else if(hasBasics(ss))ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect:{type:'neoRule',rule:'pokemonMarchSelf'}});
        break;
      }
      case 'pokemonMarchFoe':case 'pokemonMarchSelf':{
        const board=e.rule==='pokemonMarchFoe'?foe:ss;
        if(!ctx.action?.choiceSkip){const index=Number(ctx.action?.choiceDeckIndex),ref=board.deck[index];if(ref&&ctx.cardById(ref.cardId)?.kind==='pokemon'&&ctx.cardById(ref.cardId)?.stage==='Basic'&&board.bench.length<Math.min(5,Number(board.benchLimit??3))){board.deck.splice(index,1);ctx.benchCard?.(board,ref);}}
        ctx.shuffle?.(ctx.state,board.deck);
        if(e.rule==='pokemonMarchFoe'&&ss.deck.some(r=>ctx.cardById(r.cardId)?.kind==='pokemon'&&ctx.cardById(r.cardId)?.stage==='Basic')&&ss.bench.length<Math.min(5,Number(ss.benchLimit??3)))ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect:{type:'neoRule',rule:'pokemonMarchSelf'}});
        break;
      }
      case 'superRod':{
        const head=neoFlip(ctx,'Super Rod'),stage=head?'Stage 1':'Basic';
        const has=ss.discard.some(r=>ctx.cardById(r.cardId)?.kind==='pokemon'&&(head?ctx.cardById(r.cardId)?.stage!=='Basic':ctx.cardById(r.cardId)?.stage==='Basic'));
        if(has)ctx.requestChoice?.({kind:'discardCard',side:'self',filter:head?{kind:'pokemon',stage:['Stage 1','Stage 2']}:{kind:'pokemon',stage:'Basic'},effect:{type:'neoRule',rule:'superRodPick',evolutions:head}});
        break;
      }
      case 'superRodPick':{
        const index=Number(ctx.action?.choiceDiscardIndex),ref=ss.discard[index],card=ctx.cardById(ref?.cardId);if(card?.kind==='pokemon'&&(e.evolutions?card.stage!=='Basic':card.stage==='Basic'))ss.hand.push(...ss.discard.splice(index,1));break;
      }
      // Ongoing Trainer and Energy behaviours are enforced by the core hooks.
      case 'ecogym':case 'focusBand':case 'goldBerry':case 'miracleBerry':case 'sproutTower':case 'berry':
      case 'finalBlow':case 'wildGrowth':case 'mindGames':case 'hydroelectricPower':break;
      // Neo Discovery: maintain all printed effects through the battle state,
      // including multi-step choices for Trainer searches and triggered Powers.
      case 'discovery:lockOn':if(a)a.neoLockOn={turn:turn+2,uid:a.uid};break;
      case 'discovery:counter':if(a)a.neoCounter={until:turn+1};break;
      case 'discovery:pursuit':if(d)d.neoPursuit={until:turn+1,sourceUid:a?.uid};break;
      case 'discovery:secretePoison':if(a)a.neoSecretePoison={until:turn+1};break;
      case 'discovery:slime':if(a)a.neoSlime={until:turn+1};break;
      case 'discovery:magicDust':{
        if(ctx.resolvingChoice){const status=['sleep','confusion','paralysis','poison'][Number(ctx.action?.choiceOption)];if(d&&status)d.conditions={...(d.conditions||{}),[status]:true};}
        else if(d)ctx.requestChoice?.({kind:'option',side:'self',options:['Asleep','Confused','Paralyzed','Poisoned'],effect:e});
        break;
      }
      case 'discovery:hyperReverse':if(a)a.damage=Math.max(0,Number(a.damage||0)-Math.max(0,Number(ctx.dealtDamage||0)));break;
      case 'discovery:shockwave':{
        for(const target of neoSlots(ctx,'opponent')){const dealt=neoDiscoveryReduction(ctx.state,ctx.foeSide,ctx.side,a,10,ctx.cardById);target.damage=Number(target.damage||0)+dealt;log({targetCardId:target.cardId,amount:dealt});}
        if(foe.bench.length)ctx.requestChoice?.({kind:'switchBench',side:'opponent',effect:{type:'neoRule',rule:'discovery:shockwaveSwitch'}});
        break;
      }
      case 'discovery:shockwaveSwitch':switchPokemon(foe,ctx.action?.choiceBenchIndex,ctx.state);break;
      case 'discovery:plunder':if(d){for(const ref of [...toolsOf(d),...(d.temporaryTrainers||[])])foe.discard.push(ref);d.tool=null;d.extraTools=[];d.temporaryTrainers=[];}break;
      case 'discovery:hatch':{
        if(!ctx.resolvingChoice){if(neoFlip(ctx,'Hatch')&&a){a.damage=0;const has=ss.deck.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom==='Metapod');if(has)ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{evolvesFrom:'Metapod'},effect:e});}break;}
        const i=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[i],card=ctx.cardById(ref?.cardId);if(!ref||card?.evolvesFrom!=='Metapod'||!a||ctx.cardById(a.cardId)?.name!=='Metapod')break;
        ss.deck.splice(i,1);a.stack.push(ref.cardId);a.cardId=ref.cardId;a.evolvedOnTurn=turn;a.playedOnSideTurn=ss.turnCount;ctx.shuffle?.(ctx.state,ss.deck);ctx.onEvolved?.(a);break;
      }
      case 'discovery:bellyDrum':{
        if(!a)break;a.damage=Number(a.damage||0)+30;const max=ctx.maxHp?.(ctx.side,a)||ctx.cardById(a.cardId)?.hp||0;
        if(a.damage>=max)break;
        const types=(ss.energyTypes||[]).filter(t=>neoBasicIds[t]&&(!Array.isArray(ss.energySupply)||ss.energySupply.includes(t)));
        if(types.length)ctx.requestChoice?.({kind:'option',side:'self',options:[...types],effect:{type:'neoRule',rule:'discovery:bellyAttach',remaining:2,uid:a.uid}});
        break;
      }
      case 'discovery:bellyAttach':{
        const slot=neoSlots(ctx,'self').find(x=>x.uid===e.uid),types=(ss.energyTypes||[]).filter(t=>neoBasicIds[t]&&(!Array.isArray(ss.energySupply)||ss.energySupply.includes(t))),type=types[Number(ctx.action?.choiceOption)];
        if(!slot||!type)break;const attached=neoSupplyAttach(ctx,ss,slot,type,1);
        const remaining=types.filter(t=>!Array.isArray(ss.energySupply)||ss.energySupply.includes(t));
        if(attached&&Number(e.remaining)>1&&remaining.length)ctx.requestChoice?.({kind:'option',side:'self',options:remaining,effect:{...e,remaining:e.remaining-1}});break;
      }
      case 'discovery:energyCycle':{
        if(!d||!foe.bench.length||!neoFlip(ctx,'Energy Cycle'))break;
        const choices=[...Object.entries(d.energy||{}).filter(([,n])=>Number(n)>0).map(([type])=>({type,label:`Basic ${type} Energy`})) ,
          ...(d.specialEnergy||[]).map(ref=>({uid:ref.uid,label:ctx.cardById(ref.cardId)?.name||'Special Energy'}))];
        if(choices.length)ctx.requestChoice?.({kind:'option',side:'self',options:choices.map(x=>x.label),effect:{type:'neoRule',rule:'discovery:energyCycleSource',defenderUid:d.uid,choices}});break;
      }
      case 'discovery:energyCycleSource':{
        const choice=e.choices?.[Number(ctx.action?.choiceOption)],source=neoSlots(ctx,'opponent').find(x=>x.uid===e.defenderUid);
        if(!choice||!source||!foe.bench.length)break;
        if(choice.type&&Number(source.energy?.[choice.type]||0)<1)break;
        if(choice.uid&&!(source.specialEnergy||[]).some(ref=>ref.uid===choice.uid))break;
        ctx.requestChoice?.({kind:'switchBench',side:'self',selectionSide:ctx.foeSide,effect:{type:'neoRule',rule:'discovery:energyCycleTarget',choice,defenderUid:e.defenderUid}});break;
      }
      case 'discovery:energyCycleTarget':{
        const source=neoSlots(ctx,'opponent').find(x=>x.uid===e.defenderUid),target=foe.bench.find(x=>Number(x.benchSlot)===Number(ctx.action?.choiceBenchIndex));
        if(!source||!target||source===target)break;
        const choice=e.choice;
        if(choice.type&&source.energy?.[choice.type]>0){source.energy[choice.type]--;target.energy[choice.type]=Number(target.energy[choice.type]||0)+1;}
        else if(choice.uid){const i=(source.specialEnergy||[]).findIndex(ref=>ref.uid===choice.uid);if(i>=0){target.specialEnergy=target.specialEnergy||[];target.specialEnergy.push(...source.specialEnergy.splice(i,1));}}break;
      }
      case 'discovery:burst':{
        if(!a)break;const h1=neoFlip(ctx,'Burst recoil');if(h1){a.damage=Number(a.damage||0)+40;for(const side of ['self','opponent'])for(const slot of (side==='self'?ss:foe).bench)slot.damage=Number(slot.damage||0)+10;}
        if(!neoFlip(ctx,'Burst attack')){ctx.state.neoBurstFailed={sourceUid:a.uid,turn};}break;
      }
      case 'discovery:spikes':case 'discovery:frogSong':case 'discovery:anger':
      case 'discovery:unownDarkness':case 'discovery:unownMetal':case 'discovery:unownNormal':break;
      case 'discovery:gaze':{
        if(ctx.resolvingChoice){const target=sel('opponent');if(target)target.neoGazeUntil=turn;break;}
        if(foe.bench.some(s=>(ctx.cardById(s.cardId)?.abilities||[]).length))pick('opponent','discovery:gaze',{filter:{hasAbility:true},includeActive:false});break;
      }
      case 'discovery:unownFind':{
        const names=['Unown [F]','Unown [I]','Unown [N]','Unown [D]'],mine=neoSlots(ctx,'self');
        if(!names.every(name=>mine.some(slot=>ctx.cardById(slot.cardId)?.name===name)))break;
        if(ctx.resolvingChoice){const i=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[i];if(ctx.cardById(ref?.cardId)?.kind==='trainer'){ss.hand.push(...ss.deck.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);}}
        else if(ss.deck.some(ref=>ctx.cardById(ref.cardId)?.kind==='trainer'))ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'trainer'},effect:e});break;
      }
      case 'discovery:unownUndo':{
        const names=['Unown [U]','Unown [N]','Unown [D]','Unown [O]'],mine=neoSlots(ctx,'self');
        if(!names.every(name=>mine.some(slot=>ctx.cardById(slot.cardId)?.name===name))||!ss.active)break;
        const slot=ss.active;const refs=(slot.stack||[]).map((id,i)=>({uid:`undo-${turn}-${i}-${ss.hand.length}`,cardId:id}));refs.push(...(slot.specialEnergy||[]),...toolsOf(slot),...(slot.temporaryTrainers||[]));
        for(const [type,count] of Object.entries(slot.energy||{}))for(let i=0;i<Number(count||0);i++)if(neoBasicIds[type])refs.push({uid:`undo-energy-${turn}-${type}-${i}`,cardId:neoBasicIds[type],zoneGenerated:true});
        ss.hand.push(...refs);ss.active=null;break;
      }
      case 'discovery:reviveFriends':case 'discovery:reviveFossil':{
        if(ctx.resolvingChoice){const i=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[i],card=ctx.cardById(ref?.cardId),valid=e.rule.endsWith('Friends')?card?.name==='Kabuto':card?.evolvesFrom==='Mysterious Fossil';if(valid&&ss.bench.length<Number(ss.benchLimit??3)){ss.deck.splice(i,1);ctx.benchCard?.(ss,ref);ctx.shuffle?.(ctx.state,ss.deck);}break;}
        if(ss.bench.length>=Number(ss.benchLimit??3)||!neoFlip(ctx,e.rule))break;
        const filter=e.rule.endsWith('Friends')?{name:'Kabuto'}:{evolvesFrom:'Mysterious Fossil'};
        if(ss.deck.some(ref=>matchesFilter(ctx.cardById(ref.cardId),filter)))ctx.requestChoice?.({kind:'deckCard',side:'self',filter,effect:e});break;
      }
      case 'discovery:unownEngage':{
        const redraw=(side)=>{const board=side==='opponent'?foe:ss;board.deck.push(...board.hand.splice(0));ctx.shuffle?.(ctx.state,board.deck);for(let i=0;i<4;i++)ctx.drawCard(board);};
        if(!ctx.resolvingChoice){ctx.requestChoice?.({kind:'option',side:'opponent',options:['Shuffle hand and draw 4','Keep hand'],effect:{...e,phase:'opponent'}});break;}
        if(e.phase==='opponent'){if(Number(ctx.action?.choiceOption)===0)redraw('opponent');ctx.requestChoice?.({kind:'option',side:'self',options:['Shuffle hand and draw 4','Keep hand'],effect:{...e,phase:'self'}});}
        else if(Number(ctx.action?.choiceOption)===0)redraw('self');break;
      }
      case 'discovery:unownIncrease':{
        if(ctx.resolvingChoice){const i=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[i];if(ref&&String(ctx.cardById(ref.cardId)?.name||'').startsWith('Unown [')&&ss.bench.length<Number(ss.benchLimit??3)){ss.deck.splice(i,1);ctx.benchCard?.(ss,ref);ctx.shuffle?.(ctx.state,ss.deck);}break;}
        if(ss.bench.length<Number(ss.benchLimit??3)&&ss.deck.some(r=>String(ctx.cardById(r.cardId)?.name||'').startsWith('Unown [')))ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{nameContains:'Unown ['},effect:e});break;
      }
      case 'discovery:unownObserve':{
        const names=foe.deck.slice(0,5).map(r=>ctx.cardById(r.cardId)?.name||r.cardId);
        if(!ctx.resolvingChoice&&names.length)ctx.requestChoice?.({kind:'option',side:'self',options:[`Top ${names.length}: ${names.join(' · ')}`],effect:e});break;
      }
      case 'discovery:fossilEgg':{
        if(ss.bench.length>=Number(ss.benchLimit??3)||!neoFlip(ctx,'Fossil Egg'))break;
        const inDeck=ss.deck.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom==='Mysterious Fossil'),inHand=ss.hand.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom==='Mysterious Fossil');
        if(inDeck&&inHand)ctx.requestChoice?.({kind:'option',side:'self',options:['Search deck','Choose from hand'],effect:{type:'neoRule',rule:'discovery:fossilEggSource'}});
        else if(inDeck)ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{evolvesFrom:'Mysterious Fossil'},effect:{type:'neoRule',rule:'discovery:fossilEggPick',zone:'deck'}});
        else if(inHand)ctx.requestChoice?.({kind:'handCard',side:'self',filter:{evolvesFrom:'Mysterious Fossil'},effect:{type:'neoRule',rule:'discovery:fossilEggPick',zone:'hand'}});break;
      }
      case 'discovery:fossilEggSource':{
        const zone=Number(ctx.action?.choiceOption)===1?'hand':'deck';
        const arr=ss[zone];if(arr.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom==='Mysterious Fossil'))ctx.requestChoice?.({kind:zone==='hand'?'handCard':'deckCard',side:'self',filter:{evolvesFrom:'Mysterious Fossil'},effect:{type:'neoRule',rule:'discovery:fossilEggPick',zone}});break;
      }
      case 'discovery:fossilEggPick':{
        const zone=e.zone==='hand'?'hand':'deck',index=Number(zone==='hand'?ctx.action?.choiceHandIndex:ctx.action?.choiceDeckIndex),ref=ss[zone][index],card=ctx.cardById(ref?.cardId);
        if(card?.evolvesFrom==='Mysterious Fossil'&&ss.bench.length<Number(ss.benchLimit??3)){
          ss[zone].splice(index,1);ctx.benchCard?.(ss,ref);if(zone==='deck')ctx.shuffle?.(ctx.state,ss.deck);
        }break;
      }
      case 'discovery:hyperDevolution':{
        if(ctx.resolvingChoice){const slot=sel('self');if(slot?.stack?.length>1){const top=slot.stack.pop();slot.cardId=slot.stack.at(-1);ss.hand.push({uid:`neo-devolution-${turn}-${ss.hand.length}`,cardId:top});slot.playedOnSideTurn=ss.turnCount;slot.evolvedOnTurn=turn;slot.neoDevolvedTurn=ss.turnCount;clearTemporaryEffects(ctx.state,slot);}break;}
        if(neoSlots(ctx,'self').some(x=>x.stack?.length>1))pick('self','discovery:hyperDevolution',{filter:{evolved:true}});break;
      }
      case 'discovery:ruinWall':{
        if(ctx.resolvingChoice){const i=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[i];if(ref&&String(ctx.cardById(ref.cardId)?.name||'').startsWith('Unown [')&&ss.bench.length<Number(ss.benchLimit??3)){ss.deck.splice(i,1);ctx.benchCard?.(ss,ref);ctx.shuffle?.(ctx.state,ss.deck);}break;}
        if(ss.bench.length<Number(ss.benchLimit??3)&&ss.deck.some(r=>String(ctx.cardById(r.cardId)?.name||'').startsWith('Unown [')))ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{nameContains:'Unown ['},effect:e});break;
      }
      case 'discovery:energyArk':{
        const choices=()=> (ss.energyTypes||[]).filter(t=>neoBasicIds[t]&&(!Array.isArray(ss.energySupply)||ss.energySupply.includes(t)));
        if(!ctx.resolvingChoice){
          let heads=0;for(let i=0;i<2;i++)if(neoFlip(ctx,'Energy Ark'))heads++;
          log({type:'energyArkResult',heads,coins:2});
          const available=choices();
          if(heads&&available.length===1){
            // No choice is necessary in a one-type deck: award Energy at once.
            neoEnergyToHand(ctx,ss,available[0],heads);
          }else if(heads&&available.length){
            ctx.requestChoice?.({kind:'option',side:'self',prompt:`Energy Ark: ${heads} heads. Choose ${heads===1?'an Energy card':'your next Energy card'} from the supply.`,options:available,effect:{...e,remaining:heads}});
          }
          return;
        }
        const types=choices(),index=Number(ctx.action?.choiceOption),type=types[index];
        if(!type)return;
        const taken=neoEnergyToHand(ctx,ss,type,1);
        if(taken>0&&Number(e.remaining)>1&&choices().length)ctx.requestChoice?.({kind:'option',side:'self',prompt:`Energy Ark: ${Number(e.remaining)-1} Energy remaining. Choose from the supply.`,options:choices(),effect:{...e,remaining:Number(e.remaining)-1}});
        break;
      }
      case 'discovery:trample':{
        for(const side of [ctx.side,ctx.foeSide])for(const slot of ctx.state.sides[side].bench||[]){
          if(neoFlip(ctx,'Trample')){const dealt=neoDiscoveryReduction(ctx.state,side,ctx.side,a,30,ctx.cardById);slot.damage=Number(slot.damage||0)+dealt;ctx.state.log.push({type:'benchDamage',side:ctx.side,targetSide:side,cardId:slot.cardId,amount:dealt,benchIndex:Number(slot.benchSlot||0)});}
        }break;
      }
      case 'discovery:dustDevil':{
        for(const side of [ctx.side,ctx.foeSide])for(const slot of neoSlots(ctx,side===ctx.side?'self':'opponent')){
          if(ctx.cardById(slot.cardId)?.types?.includes('Fighting'))continue;
          const dealt=neoDiscoveryReduction(ctx.state,side,ctx.side,a,10,ctx.cardById);slot.damage=Number(slot.damage||0)+dealt;
          ctx.state.log.push({type:'neoEffect',side:ctx.side,rule:e.rule,targetSide:side,cardId:slot.cardId,amount:dealt});
        }break;
      }
      case 'discovery:energyEvolution':{
        const type=String(ctx.eventData?.energyType||'');
        if(!a||!type||!neoFlip(ctx,'Energy Evolution'))break;
        const eligible=ss.deck.some(ref=>{const card=ctx.cardById(ref.cardId);return card?.kind==='pokemon'&&card.evolvesFrom==='Eevee'&&card.types?.includes(type);});
        if(eligible)ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'pokemon',evolvesFrom:'Eevee',subtype:type},effect:{type:'neoRule',rule:'discovery:energyEvolutionPick',targetUid:a.uid,energyType:type}});
        break;
      }
      case 'discovery:energyEvolutionPick':{
        const target=neoSlots(ctx,'self').find(s=>s.uid===e.targetUid),idx=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[idx],card=ctx.cardById(ref?.cardId);
        if(!target||ctx.cardById(target.cardId)?.name!=='Eevee'||!card||card.evolvesFrom!=='Eevee'||!card.types?.includes(e.energyType))break;
        ss.deck.splice(idx,1);target.cardId=ref.cardId;target.stack.push(ref.cardId);target.playedOnSideTurn=ss.turnCount;target.evolvedOnTurn=turn;ctx.shuffle?.(ctx.state,ss.deck);ctx.onEvolved?.(target);
        log({evolvedTo:ref.cardId});break;
      }
      case 'discovery:collectFire':{
        if(!a)break;
        const index=ss.discard.findIndex(ref=>ctx.cardById(ref.cardId)?.basicEnergy&&ctx.cardById(ref.cardId)?.subtype==='Fire');
        if(index>=0)ss.discard.splice(index,1);
        else if(Number(ss.energyDiscard?.Fire||0)>0)ss.energyDiscard.Fire--;
        else break;
        a.energy.Fire=Number(a.energy.Fire||0)+1;ctx.onEnergyAttached?.(a,'Fire',1);break;
      }
      case 'riptideReturn':{const count=Number(ss.energyDiscard.Water||0);if(Array.isArray(ss.energySupply)){for(let i=0;i<count;i++)ss.energySupply.push('Water');ss.nextEnergyType=ss.energySupply[0]||null;}else for(let i=0;i<count;i++)ss.deck.push({uid:`neo-riptide-${turn}-${i}`,cardId:'neo1-111',zoneGenerated:true});ss.energyDiscard.Water=0;for(let i=ss.discard.length-1;i>=0;i--)if(ctx.cardById(ss.discard[i].cardId)?.basicEnergy&&ctx.cardById(ss.discard[i].cardId).subtype==='Water'){
          const [ref]=ss.discard.splice(i,1);if(Array.isArray(ss.energySupply))ss.energySupply.push('Water');else ss.deck.push(ref);
        }ss.nextEnergyType=ss.energySupply?.[0]||ss.nextEnergyType;ctx.shuffle?.(ctx.state,ss.deck);break;}
      default:break;
    }
  }

  // Creator's Lental rule adapter. Uses the same ordered Energy supply, discard,
  // choice prompts and Prize state as other Classic30 cards.
  // v0.69.108: rules shared by the new Florio card slice. Unimplemented
  // mechanics are never silently replaced with noop on a battle-ready card.
  const LENTAL_108_RULES=new Set(['guillotine','unhingeHorn','herculesGlide','grassBackup','noToolBonus',
    'rejuvenate','mountainDance','terrainStomp','slumberTime','supplyEnergyToHand','retrieveDarkEnergy',
    'leadTheWay','basicEnergyPeck','wickedFlock','pastureFields','crystalbloom','zappedFluffruit']);
  function lentalRule108(effect,ctx){
    const ss=own(ctx),foe=other(ctx),rule=effect.rule;
    const note=data=>ctx.state.log.push({type:'lentalRule',side:ctx.side,rule,...data});
    const request=spec=>ctx.requestChoice?.({...spec,effect:spec.effect||effect});
    if(rule==='guillotine'){
      const results=[coin(ctx),coin(ctx)],heads=results.filter(Boolean).length;
      ctx.state.log.push({type:'coin',side:ctx.side,reason:'Guillotine',heads,coins:2,results});
      if(heads===2)applyEffect({type:'knockOut',target:'opponentActive'},ctx);
      return;
    }
    if(rule==='unhingeHorn'){
      const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Unhinge Horn',heads,results:[heads]});
      if(!heads||!foe.active)return;
      const target=foe.active;
      let ref=null;
      if(target.tool){ref=target.tool;target.tool=(target.extraTools||[]).shift()||null;}
      else if(target.extraTools?.length)ref=target.extraTools.shift();
      if(ref){foe.discard.push(ref);note({discardedTool:ref.cardId});}
      return;
    }
    if(rule==='herculesGlide'){
      if(neoTakeDiscard(ctx,ss,'Grass',1)){
        neoRecoveredEnergyToHand(ctx,ss,'Grass',1);note({energyRecovered:'Grass'});
      }
      return;
    }
    if(rule==='grassBackup'){
      const filter={kind:'pokemon',stage:'Basic',subtype:'Grass'};
      let remaining=Math.max(0,Number(effect.remaining??effect.amount??3));
      if(ctx.resolvingChoice){
        if(ctx.action?.choiceSkip){ctx.shuffle?.(ctx.state,ss.deck);return;}
        const i=Number(ctx.action?.choiceDeckIndex);
        if(Number.isInteger(i)&&i>=0&&ss.deck[i]&&matchesFilter(ctx.cardById(ss.deck[i].cardId),filter)){
          const [ref]=ss.deck.splice(i,1);ss.hand.push(ref);remaining--;note({searched:ref.cardId});
        }else{ctx.shuffle?.(ctx.state,ss.deck);return;}
      }
      if(remaining>0&&ss.deck.some(ref=>matchesFilter(ctx.cardById(ref.cardId),filter))){
        request({kind:'deckCard',side:'self',filter,optional:true,effect:{...effect,remaining}});
      }else ctx.shuffle?.(ctx.state,ss.deck);
      return;
    }
    if(rule==='rejuvenate'){
      const count=Math.min(Math.floor(Math.max(0,Number(ctx.attacker?.damage||0))/10),ss.discard.length);
      for(let i=0;i<count;i++)ss.deck.push(ss.discard.shift());
      if(count)ctx.shuffle?.(ctx.state,ss.deck);
      note({cardsReturned:count});return;
    }
    if(rule==='mountainDance'){
      const ourPrizes=ss.prizes?.length??0,foePrizes=foe.prizes?.length??0;
      if(ourPrizes<foePrizes){for(let i=0;i<foePrizes;i++)ctx.drawCard?.(ss);note({cardsDrawn:foePrizes});}
      return;
    }
    if(rule==='slumberTime'){
      if(!ctx.attacker||statusIsPrevented(ctx.state,ctx.attacker,ctx.cardById,'sleep'))return;
      applyEffect({type:'status',target:'self',status:'sleep'},ctx);
      if(ctx.attacker.conditions?.sleep){ctx.attacker.damage=0;note({asleep:true,healedAll:true});}
      return;
    }
    if(rule==='supplyEnergyToHand'){
      const types=[...new Set(ss.energySupply||[])].filter(Boolean);
      if(ctx.resolvingChoice){const chosen=types[Number(ctx.action?.choiceOption)];if(chosen){const amount=neoEnergyToHand(ctx,ss,chosen,1);note({energyToHand:chosen,amount});}return;}
      if(types.length)request({kind:'option',side:'self',options:types});
      return;
    }
    if(rule==='retrieveDarkEnergy'){
      if(neoTakeDiscard(ctx,ss,'Darkness',1)){
        neoRecoveredEnergyToHand(ctx,ss,'Darkness',1);note({recovered:'Darkness'});
      }
      return;
    }
    if(rule==='leadTheWay'){
      const drawn=ctx.drawCard?.(foe),card=drawn&&ctx.cardById(drawn.cardId);
      if(card?.kind==='pokemon'&&card.stage==='Basic'){
        const i=foe.hand.findIndex(ref=>ref.uid===drawn.uid);
        if(i>=0){foe.discard.push(...foe.hand.splice(i,1));note({opponentDiscardedBasic:card.id});}
      }
      return;
    }
    if(rule==='basicEnergyPeck'){
      const target=foe.active,types=Object.entries(target?.energy||{}).filter(([,n])=>n>0).map(([type])=>type);
      if(!types.length)return;
      if(ctx.resolvingChoice){const type=types[Number(ctx.action?.choiceOption)];if(type&&Number(target.energy[type])>0){target.energy[type]--;recordDiscardedEnergy(foe,type,1);note({discardedEnergy:type});}return;}
      request({kind:'option',side:'self',options:types});return;
    }
    if(rule==='pastureFields'){
      const types=[...new Set(ss.energySupply||[])].filter(Boolean);
      if(ctx.resolvingChoice&&effect.energyType){
        const slot=ctx.action?.choiceTarget==='active'?ss.active:ss.bench.find(s=>Number(s.benchSlot)===Number(ctx.action?.choiceBenchIndex));
        if(slot&&types.includes(effect.energyType)){const amount=neoSupplyAttach(ctx,ss,slot,effect.energyType,1);note({attached:effect.energyType,to:slot.cardId,amount});}
        return;
      }
      if(ctx.resolvingChoice){
        const type=types[Number(ctx.action?.choiceOption)];
        if(type&&ctx.requestChoice)request({kind:'pokemon',side:'self',includeActive:true,effect:{...effect,energyType:type}});
        return;
      }
      if(types.length&&(ss.active||ss.bench.length))request({kind:'option',side:'self',options:types});
      return;
    }
    if(rule==='crystalbloom'){
      const filter={kind:'pokemon',stage:'Basic',nameContains:'Illumina'};
      if(ctx.resolvingChoice){
        const i=Number(ctx.action?.choiceDeckIndex);
        if(Number.isInteger(i)&&i>=0&&ss.deck[i]&&matchesFilter(ctx.cardById(ss.deck[i].cardId),filter)&&ss.bench.length<Number(ss.benchLimit||3)){
          const [ref]=ss.deck.splice(i,1);
          if(ctx.benchCard?.(ss,ref)==null)ss.deck.splice(i,0,ref);
          else note({benched:ref.cardId});
        }
        ctx.shuffle?.(ctx.state,ss.deck);return;
      }
      if(ss.bench.length<Number(ss.benchLimit||3)&&ss.deck.some(ref=>matchesFilter(ctx.cardById(ref.cardId),filter)))request({kind:'deckCard',side:'self',filter});
      return;
    }
    if(rule==='zappedFluffruit'){
      const target=ctx.action?.target==='active'?ss.active:ss.bench.find(s=>Number(s.benchSlot)===Number(ctx.action?.benchIndex));
      if(!target||healingIsBlocked(ctx.state,target,ctx.cardById))return;
      const amount=hasType(ctx.cardById(target.cardId),'Lightning')?60:20;
      const before=Number(target.damage||0);target.damage=Math.max(0,before-amount);
      note({healed:before-target.damage,cardId:target.cardId});return;
    }
    throw new Error('Unsupported Florio v0.69.108 rule: '+rule);
  }
  // All reductions happen AFTER Weakness and Resistance. Warding Glare stacks;
  // Fungal Shield is expressly limited to one, and Shrink only works vs Rule Boxes.
  function lentalDefenseReduction(state,defenderSide,defender,attackerCard,cardById){
    if(state?.format!=='classic'||!defender||!cardById)return 0;
    const board=state.sides?.[defenderSide];if(!board)return 0;
    const ruleBox=Number(attackerCard?.prizeCards||0)>1||/\b(?:TAG TEAM|VMAX|VSTAR|GX|V|ex)\b/i.test(String(attackerCard?.name||''));
    let total=0;
    if(ruleBox){
      for(const source of [board.active,...(board.bench||[])].filter(Boolean)){
        if(source.cardId==='SNAPFLORIO-011'&&!abilitiesSuppressed(state,defenderSide,source,cardById))total+=30;
      }
      for(const tool of [defender.tool,...(defender.extraTools||[])].filter(Boolean))if(tool.cardId==='SNAPFLORIO-121')total+=30;
    }
    if(board.active===defender&&Object.values(defender.conditions||{}).some(Boolean)){
      if((board.bench||[]).some(source=>source?.cardId==='SNAPFLORIO-031'&&!abilitiesSuppressed(state,defenderSide,source,cardById)))total+=30;
    }
    return total;
  }


  // v0.69.111: only creator-verified Florio effects live here.
  const LENTAL_111_RULES=new Set(['friendsFireRecovery111','waterFountain111','healingCircle111','slumberParty111','mindsEye111','wickedFlock111','scavengeItems111']);
  function lentalRule111(effect,ctx){
    const ss=own(ctx),foe=other(ctx),rule=effect.rule;
    const note=data=>ctx.state.log.push({type:'lentalRule',rule,side:ctx.side,...data});
    const request=spec=>ctx.requestChoice?.({...spec,effect:spec.effect||effect});
    if(rule==='friendsFireRecovery111'){
      const count=(ss.bench||[]).filter(slot=>ctx.cardById(slot.cardId)?.kind==='pokemon'&&ctx.cardById(slot.cardId)?.stage==='Basic').length;
      const results=Array.from({length:count},()=>coin(ctx));let moved=0;
      for(const heads of results){if(!heads||!neoTakeDiscard(ctx,ss,'Fire',1))continue;
        ss.deck.push({uid:`florio111-fire-${ctx.state.turnNumber}-${ss.deck.length}-${moved}`,cardId:neoBasicIds.Fire});moved++;}
      if(moved)ctx.shuffle?.(ctx.state,ss.deck);
      ctx.state.log.push({type:'coin',side:ctx.side,reason:'Fun with Friends',coins:count,heads:results.filter(Boolean).length,results});
      note({energyCardsShuffled:moved});return;
    }
    if(rule==='waterFountain111'){
      const source=ctx.attacker;
      if(!source||Number(source.energy?.Water||0)<=0||ss.waterFountainUsedTurn===ss.turnCount)return;
      source.energy.Water--;ss.waterFountainUsedTurn=ss.turnCount;
      neoRecoveredEnergyToHand(ctx,ss,'Water',1);
      note({recoveredBasicWater:1});return;
    }
    if(rule==='healingCircle111'){
      const chosen=ss.bench.find(slot=>Number(slot.benchSlot)===Number(ctx.action?.benchIndex));
      if(!chosen||Number(chosen.damage||0)<=0)return;
      const healed=Number(chosen.damage);chosen.damage=0;
      // Discard ALL attached Psychic Energy, even if the attacker used a
      // Special Energy. Basic units remain in the separate Energy discard.
      const source=ctx.attacker;if(source){
        const n=Number(source.energy?.Psychic||0);if(n){source.energy.Psychic=0;ss.energyDiscard=ss.energyDiscard||{};ss.energyDiscard.Psychic=Number(ss.energyDiscard.Psychic||0)+n;}
        const rest=[];for(const ref of source.specialEnergy||[]){const map=ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{};
          if(Number(map.Psychic||0)>0)ss.discard.push(ref);else rest.push(ref);}source.specialEnergy=rest;
      }
      note({healed,cardId:chosen.cardId});return;
    }
    if(rule==='slumberParty111'){
      const source=ctx.attacker,active=ss.active;
      if(!source||!active||active.conditions?.sleep)return;
      const types=Object.entries(source.energy||{}).filter(([,n])=>Number(n)>0).map(([type])=>type);
      if(!types.length)return;
      if(!ctx.resolvingChoice){request({kind:'option',side:'self',options:types,effect:{...effect,energyTypes:types}});return;}
      const type=effect.energyTypes?.[Number(ctx.action?.choiceOption)];if(!type||Number(source.energy?.[type]||0)<=0)return;
      source.energy[type]--;ss.energyDiscard=ss.energyDiscard||{};
      ss.energyDiscard[type]=Number(ss.energyDiscard[type]||0)+1;
      active.damage=Math.max(0,Number(active.damage||0)-60);
      clearConditions(active);active.conditions={sleep:true};
      note({discardedBasicEnergy:type,asleep:true});return;
    }
    if(rule==='mindsEye111'){
      const remaining=Number(effect.remaining??Math.min(2,ss.deck.length));
      const topCount=Math.min(Number(effect.topCount??3),ss.deck.length);
      if(!ctx.resolvingChoice){if(topCount)request({kind:'topDeckCard',side:'self',count:topCount,effect:{...effect,remaining:Math.min(2,topCount),topCount}});return;}
      const idx=ctx.action?.choiceDeckIndex;
      if(!Number.isInteger(idx)||idx<0||idx>=topCount||!ss.deck[idx])return;
      const [picked]=ss.deck.splice(idx,1);ss.hand.push(picked);
      const left=remaining-1;
      if(left>0&&ss.deck.length&&topCount>1){request({kind:'topDeckCard',side:'self',count:topCount-1,effect:{...effect,remaining:left,topCount:topCount-1}});}
      else if(topCount>1&&ss.deck.length){ss.deck.push(ss.deck.shift());}
      note({cardToHand:picked.cardId});return;
    }
    if(rule==='scavengeItems111'){
      const filter={kind:'trainer',trainerType:'Item'};
      let left=Number(effect.remaining??2);
      if(ctx.resolvingChoice){
        if(ctx.action?.choiceSkip)return;
        const idx=ctx.action?.choiceDiscardIndex;
        if(!Number.isInteger(idx)||!ss.discard[idx]||!matchesFilter(ctx.cardById(ss.discard[idx].cardId),filter))return;
        const [ref]=ss.discard.splice(idx,1);ss.hand.push(ref);left--;
        note({itemRetrieved:ref.cardId});
      }
      if(left>0&&ss.discard.some(ref=>matchesFilter(ctx.cardById(ref.cardId),filter))){
        request({kind:'discardCard',side:'self',filter,optional:true,effect:{...effect,remaining:left}});
      }
      return;
    }
    if(rule==='wickedFlock111'){
      const action=ctx.action||{},target=action.target==='opponentActive'?foe.active:
        action.target==='opponentBench'?foe.bench.find(s=>Number(s.benchSlot)===Number(action.benchIndex)):null;
      if(!target)return;
      const count=[ss.active,...ss.bench].filter(s=>s&&/\bMurkrow\b/i.test(ctx.cardById(s.cardId)?.name||'')).length;
      const blocked=attackIsPrevented(ctx.state,ctx.foeSide,target,ctx.attacker,ctx.cardById);
      if(blocked?.effects||protectedFromEffects(target,ctx))return;
      applyEffect({type:'damage',target:action.target,amount:40*count},ctx);
      note({target:target.cardId,damageCounters:4*count});return;
    }
    throw new Error('Unknown Florio 111 rule '+rule);
  }


  // v0.69.112: creator-verified Florio v2 effects. Invalid choices fail closed.
  const LENTAL_112_RULES=new Set(['wildPollen112','splashAssist112','miracleSight112',
    'combatDance112','shadowPeck112','voltSwitch112']);
  function lentalRule112(effect,ctx){
    const ss=own(ctx),foe=other(ctx),rule=effect.rule;
    const note=info=>ctx.state.log.push({type:'lentalRule',rule,side:ctx.side,...info});
    const prompt=spec=>ctx.requestChoice?.({...spec,effect:spec.effect||effect});
    const board=s=>[s.active,...(s.bench||[])].filter(Boolean);
    if(rule==='wildPollen112'){
      const target=foe.active;if(!target)return;
      const energy=ctx.effectiveEnergy?.(target)||target.energy||{};
      for(const [type,status] of [['Fighting','confusion'],['Fire','burn'],['Psychic','poison']]){
        if(Number(energy[type]||0)>0)applyEffect({type:'status',target:'opponentActive',status},ctx);
      }
      note({target:target.cardId});return;
    }
    if(rule==='combatDance112'){
      let count=0;
      for(const side of [ss,foe])for(const slot of board(side)){
        if(Number((ctx.effectiveEnergy?.(slot)||slot.energy||{}).Fighting||0)<=0)continue;
        if(protectedFromEffects(slot,ctx))continue;
        slot.damage=Number(slot.damage||0)+20;count++;
      }
      note({pokemonDamaged:count,damageCounters:2});return;
    }
    if(rule==='shortCircuit112'){
      const slot=foe.active;if(!slot)return;
      const all=[slot.tool,...(slot.extraTools||[])].filter(Boolean);
      if(!all.length)return;
      slot.tool=null;slot.extraTools=[];foe.discard.push(...all);
      note({discardedTools:all.map(t=>t.cardId)});return;
    }
    if(rule==='splashAssist112'){
      const filter={kind:'pokemon',stage:'Basic'};
      const waters=ss.hand.some(ref=>{const c=ctx.cardById(ref.cardId);return c?.basicEnergy&&c.subtype==='Water';});
      if(!waters||!ss.bench?.length)return;
      if(!ctx.resolvingChoice){prompt({kind:'pokemon',side:'self',includeActive:false,effect:{...effect,phase:'chooseBench'}});return;}
      if(effect.phase==='chooseBench'){
        const target=ss.bench.find(slot=>Number(slot.benchSlot)===Number(ctx.action?.choiceBenchIndex));
        if(target)prompt({kind:'handCard',side:'self',filter:{basicEnergy:true,subtype:'Water'},effect:{...effect,phase:'chooseWater',targetUid:target.uid}});
        return;
      }
      if(effect.phase==='chooseWater'){
        const target=ss.bench.find(slot=>slot.uid===effect.targetUid),idx=ctx.action?.choiceHandIndex;
        const ref=Number.isInteger(idx)?ss.hand[idx]:null,c=ctx.cardById(ref?.cardId);
        if(!target||!c?.basicEnergy||c.subtype!=='Water')return;
        ss.hand.splice(idx,1);target.energy=target.energy||{};
        target.energy.Water=Number(target.energy.Water||0)+1;
        ctx.onEnergyAttached?.(target,'Water',1);
        note({attached:'Water',target:target.cardId});return;
      }
    }
    if(rule==='miracleSight112'){
      note({revealedHand:ctx.resolvingChoice?undefined:foe.hand.map(ref=>ref.cardId)});
      const filter={kind:'trainer',trainerType:'Item'};
      if(!ctx.resolvingChoice){
        if(foe.hand.some(ref=>matchesFilter(ctx.cardById(ref.cardId),filter)))prompt({kind:'opponentHandCard',side:'self',filter,optional:true});
        return;
      }
      if(ctx.action?.choiceSkip)return;
      const idx=ctx.action?.choiceHandIndex,ref=Number.isInteger(idx)?foe.hand[idx]:null;
      if(ref&&matchesFilter(ctx.cardById(ref.cardId),filter)){
        foe.discard.push(...foe.hand.splice(idx,1));note({discardedItem:ref.cardId});
      }
      return;
    }
    if(rule==='shadowPeck112'){
      const defender=foe.active,attacker=ctx.attacker;
      if(!defender||!attacker)return;
      const ref=defender.tool||defender.extraTools?.[0];
      if(!ref)return;
      if([attacker.tool,...(attacker.extraTools||[])].filter(Boolean).length>=toolCapacity(ctx.state,ctx.side,attacker,ctx.cardById))return;
      if(defender.tool?.uid===ref.uid){defender.tool=defender.extraTools?.shift()||null;}
      else defender.extraTools=defender.extraTools.filter(t=>t.uid!==ref.uid);
      if(!attacker.tool)attacker.tool=ref;else (attacker.extraTools=attacker.extraTools||[]).push(ref);
      note({movedTool:ref.cardId,from:defender.cardId,to:attacker.cardId});return;
    }
    if(rule==='voltSwitch112'){
      const source=ctx.attacker;
      const energy=source&&(ctx.effectiveEnergy?.(source)||source.energy||{});
      if(Number(energy?.Lightning||0)<1)return;
      if(ctx.action?.target==='bench'&&Number.isInteger(ctx.action.benchIndex)){
        if(switchPokemon(ss,ctx.action.benchIndex,ctx.state))note({switched:true});
      }
      return;
    }
    throw new Error('Unsupported Florio v112 rule: '+rule);
  }

  function lentalRule(effect,ctx){
    const ss=own(ctx),foe=other(ctx),rule=effect.rule;
    if(LENTAL_112_RULES.has(rule))return lentalRule112(effect,ctx);
    if(LENTAL_111_RULES.has(rule))return lentalRule111(effect,ctx);
    if(LENTAL_108_RULES.has(rule))return lentalRule108(effect,ctx);
    const log=entry=>ctx.state.log.push({side:ctx.side,type:'lentalRule',rule,...entry});

    // Revised Wurmple #14: swapping after Quick March is optional.
    if(rule==='optionalQuickMarch'){
      if(ctx.resolvingChoice){
        if(ctx.action?.choiceSkip)return;
        const index=Number(ctx.action?.choiceBenchIndex);
        if(Number.isInteger(index)&&ss.bench.some(p=>Number(p?.benchSlot)===index)){
          switchPokemon(ss,index,ctx.state);
          log({switchedTo:index});
        }
        return;
      }
      if(ss.bench.length&&typeof ctx.requestChoice==='function')
        ctx.requestChoice({kind:'pokemon',side:'self',includeActive:false,optional:true,effect});
      return;
    }
    // Revised Swanna ex #46: one counter PER attached Basic Water Energy,
    // on EACH opposing Bench Pokemon; these are attack-effect counters.
    if(rule==='torrentSpread'){
      const count=Math.max(0,Number(ctx.attacker?.energy?.Water||0));
      if(count>0&&foe.bench.length)
        applyEffect({type:'benchDamage',side:'opponent',all:true,amount:count*10},ctx);
      log({waterCards:count,opposingBench:foe.bench.length});
      return;
    }
    // Revised Pikachu #50: only Basic Lightning, not all typed Energy.
    if(rule==='discardAllBasicLightning'){
      const pokemon=ctx.attacker,count=Math.max(0,Number(pokemon?.energy?.Lightning||0));
      if(count){pokemon.energy.Lightning=0;ss.energyDiscard=ss.energyDiscard||{};
        ss.energyDiscard.Lightning=Number(ss.energyDiscard.Lightning||0)+count;}
      log({discardedBasicLightning:count});
      return;
    }
    // Revised Vivillon #102: a TRAINER card from discard is returned to deck.
    if(rule==='compoundEyesTrainer'){
      const filter={kind:'trainer'};
      if(ctx.resolvingChoice){
        const index=ctx.action?.choiceDiscardIndex,ref=Number.isInteger(index)?ss.discard[index]:null;
        if(ref&&matchesFilter(ctx.cardById(ref.cardId),filter)){
          ss.deck.push(...ss.discard.splice(index,1));ctx.shuffle?.(ctx.state,ss.deck);
          log({trainerReturned:ref.cardId});
        }
      }else if(ss.discard.some(ref=>matchesFilter(ctx.cardById(ref.cardId),filter)))
        ctx.requestChoice?.({kind:'discardCard',side:'self',filter,effect});
      return;
    }

    if(rule==='standoffRevised'){
      // Creator print uses >10 Pokemon; the agreed LuckyDex Classic30
      // compact-board adaptation activates with all 8 ordinary positions full.
      const occupied=['player','opponent'].every(w=>ctx.state.sides[w].active&&ctx.state.sides[w].bench.length>=3);
      if(!occupied)return;
      const heads=coin(ctx),target=heads?foe:ss;
      for(const slot of target.bench)slot.damage=Number(slot.damage||0)+10;
      log({heads,results:[heads],damagedSide:heads?ctx.foeSide:ctx.side,affected:target.bench.length});
      return;
    }

    const ask=(spec)=>{if(typeof ctx.requestChoice==='function')ctx.requestChoice({...spec,effect:spec.effect||effect});};
    const bench=ss.bench||[];
    if(rule==='magikarpSoak'){
      if(foe.active){foe.active.weaknessOverride='Water';log({targetCardId:foe.active.cardId});}
      return;
    }
    if(rule==='naturalGuardian'){
      for(const slot of bench){slot.attackGuard={type:'preventDamage',target:'selfBench',effects:false,expiresTurn:ctx.state.turnNumber+2};}
      log({protected:bench.length});return;
    }
    if(rule==='extraEnergyDraw'){
      const slot=ctx.attacker;if(!slot)return;
      const count=Math.max(0,totalEnergy(slot.energy||{})+(slot.specialEnergy||[]).length-Number(effect.attackEnergyCost||0));
      for(let i=0;i<count;i++)ctx.drawCard?.(ss);
      log({drawn:count});return;
    }
    if(rule==='motherBird'){
      const filter={kind:'pokemon',stage:'Basic'},remaining=Math.max(0,Number(effect.remaining??effect.amount??3));
      if(ctx.resolvingChoice){
        if(ctx.action?.choiceSkip){ctx.shuffle?.(ctx.state,ss.deck);return;}
        const index=ctx.action?.choiceDeckIndex;
        if(Number.isInteger(index)&&ss.deck[index]&&ss.bench.length<Number(ss.benchLimit||3)&&matchesFilter(ctx.cardById(ss.deck[index].cardId),filter)){
          const [ref]=ss.deck.splice(index,1);
          if(ctx.benchCard?.(ss,ref)==null)ss.deck.splice(index,0,ref);
          else log({benched:ref.cardId});
        }
      }
      const left=remaining-(ctx.resolvingChoice?1:0);
      if(left>0&&ss.bench.length<Number(ss.benchLimit||3)&&ss.deck.some(ref=>matchesFilter(ctx.cardById(ref.cardId),filter))){
        ask({kind:'deckCard',side:'self',filter,optional:true,effect:{...effect,remaining:left}});
      }else ctx.shuffle?.(ctx.state,ss.deck);
      return;
    }
    if(rule==='torrentCorkscrew'){
      const amount=Number(ctx.attacker?.energy?.Water||0)+(ctx.attacker?.specialEnergy||[]).filter(ref=>{
        const card=ctx.cardById(ref.cardId),map=ref.provides||card?.effect?.provides||{};return Number(map.Water||0)>0;
      }).length;
      if(amount<=0||!foe.bench.length)return;
      if(ctx.resolvingChoice){
        const slot=foe.bench.find(s=>Number(s.benchSlot)===Number(ctx.action?.choiceBenchIndex));
        if(slot){slot.damage=Number(slot.damage||0)+amount*10;log({targetCardId:slot.cardId,counters:amount});}
      }else ask({kind:'pokemon',side:'self',selectionSide:ctx.foeSide,includeActive:false});
      return;
    }
    if(rule==='busyBuzz'){
      if(ctx.resolvingChoice){
        const action=ctx.action||{},target=action.choiceTarget==='active'?foe.active:foe.bench.find(s=>Number(s.benchSlot)===Number(action.choiceBenchIndex));
        if(target){const counters=Math.max(0,Number(ss.prizes?.length||0));target.damage=Number(target.damage||0)+10*counters;log({targetCardId:target.cardId,counters});}
      }else if(foe.active||foe.bench.length)ask({kind:'pokemon',side:'self',selectionSide:ctx.foeSide,includeActive:true});
      return;
    }
    if(rule==='compoundEyes'){
      if(ctx.resolvingChoice){
        const index=ctx.action?.choiceDiscardIndex;
        if(Number.isInteger(index)&&ss.discard[index]){const [ref]=ss.discard.splice(index,1);ss.deck.push(ref);ctx.shuffle?.(ctx.state,ss.deck);log({returned:ref.cardId});}
      }else if(ss.discard.length)ask({kind:'discardCard',side:'self'});
      return;
    }
    if(rule==='fallenBerries'){
      const excluded=[...(effect.excluded||[])],remaining=Math.max(0,Number(effect.remaining??3));
      if(ctx.resolvingChoice){
        if(ctx.action?.choiceSkip)return;
        const slot=bench.find(s=>Number(s.benchSlot)===Number(ctx.action?.choiceBenchIndex));
        if(slot&&slot.damage>0&&!excluded.includes(slot.uid)){
          slot.damage=Math.max(0,slot.damage-10);excluded.push(slot.uid);log({healed:slot.cardId,amount:10});
        }
      }
      const left=remaining-(ctx.resolvingChoice?1:0);
      if(left>0&&bench.some(s=>s.damage>0&&!excluded.includes(s.uid))){
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:false,filter:{damaged:true},excludeUids:excluded,optional:true,effect:{...effect,remaining:left,excluded}});
      }
      return;
    }
    throw new Error('Unsupported Lental rule: '+rule);
  }

  function applyEffect(effect,ctx){
    if(!effect)return;
    assertEffect(effect);
    if(!conditionMatches(effect.condition,ctx))return;
    const affected=()=>targets(effect.target,ctx).filter(s=>!protectedFromEffects(s,ctx)&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s)),log=entry=>ctx.state.log.push(Object.assign({side:ctx.side},entry));
    switch(effect.type){
      case 'noop':case 'specialEnergy':break;
      case 'lentalRule':lentalRule(effect,ctx);break;
      case 'neoRule':neoRule(effect,ctx);break;
      case 'gymRule':applyGymRule(effect,ctx);break;
      case 'forceFirstCoinHead':{const ss=own(ctx);ss.forceFirstCoinHeadTurn=ctx.state.turnNumber;ss.forceFirstCoinHeadUsed=false;break;}
      case 'coinReroll':case 'toolCapacity':case 'repeatAttack':case 'chooseDiscardForBonus':case 'weaknessMultiplier':case 'statusRecoveryAura':case 'copyRandomAttackFromPrivate':break;
      case 'weaknessGuard':for(const target of affected())target.weaknessGuard={duration:effect.duration||'opponentTurn',expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'energyAttachStatusTrap':for(const target of affected())target.energyAttachStatusTrap={status:effect.status,expiresTurn:ctx.state.turnNumber+1};break;
      case 'copyRandomTrainerEffect':{const ss=effect.source==='opponentHand'?other(ctx).hand:other(ctx).deck,candidates=ss.map((r,index)=>({r,index,card:ctx.cardById(r.cardId)})).filter(x=>x.card?.kind==='trainer'&&x.card?.trainerType===effect.trainerType&&x.card?.effect&&(!effect.excludeName||x.card.name!==effect.excludeName));if(candidates.length){const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)];log({type:'copyTrainer',cardId:hit.card.id,source:effect.source});applyEffect(hit.card.effect,ctx);if(effect.shuffleAfter&&effect.source==='opponentDeck')ctx.shuffle?.(ctx.state,other(ctx).deck);}break;}
      case 'healActiveReturnTrainer':{const slot=own(ctx).active,before=Number(slot?.damage||0),healed=Math.min(before,Number(effect.amount||0));if(slot)slot.damage=Math.max(0,before-healed);const ref=ctx.trainerRef;if(ref){if(healed>0){const heads=coin(ctx);log({type:'coin',heads,results:[heads]});if(heads)own(ctx).hand.push(ref);else own(ctx).discard.push(ref);}else own(ctx).discard.push(ref);}break;}
      case 'selfKoAttachAsEnergy':{
        const types=effect.energyTypes||['Grass','Fire','Water','Lightning','Psychic','Fighting'];
        if(ctx.resolvingChoice&&effect.targetUid){const type=types[Number(ctx.action?.choiceOption)];if(type&&typeof ctx.transformSelfToEnergy==='function')ctx.transformSelfToEnergy(ctx.attacker,effect.targetUid,type,Number(effect.amount||2));break;}
        if(ctx.resolvingChoice){const picked=selected(ctx,own(ctx));if(picked&&picked!==ctx.attacker&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:types,effect:{...effect,targetUid:picked.uid}});break;}
        if(ctx.attacker&&pokemonOn(own(ctx)).some(slot=>slot!==ctx.attacker)&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:true,excludeUids:[ctx.attacker.uid],effect});
        break;
      }
      case 'replayAttackResult':{
        const target=ctx.defender,result=effect.result||{};if(!target)break;
        for(const [status,value] of Object.entries(result.conditions||{})){if(value==null)continue;const amount=status==='poison'&&typeof value==='object'?Number(value.amount||10):undefined;applyEffect({type:'status',target:'opponentActive',status,...(amount!=null?{amount}:{})},ctx);}
        for(let i=0;i<Number(result.energyCardsDiscarded||0);i++)applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},ctx);
        if(result.attackGate)target.attackGate={...result.attackGate};
        if(Array.isArray(result.locks)&&result.locks.length)target.locks=[...(target.locks||[]),...result.locks.map(x=>({...x}))];
        if(result.weaknessOverride!=null)target.weaknessOverride=result.weaknessOverride;
        if(result.resistanceOverride!=null)target.resistanceOverride=result.resistanceOverride;
        break;
      }
      case 'energyTypeOverride':{if(ctx.attacker)ctx.attacker.energyTypeOverride={type:effect.energyType,duration:effect.duration||'turn',expiresTurn:ctx.state.turnNumber};break;}
      case 'redistributeDamage':{
        const ss=own(ctx),all=pokemonOn(ss),pending=effect.sourceUid||null;
        if(ctx.resolvingChoice){
          const picked=selected(ctx,ss);
          if(!pending){if(!picked||Number(picked.damage||0)<Number(effect.amount||10))break;if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:true,excludeUids:[picked.uid],effect:{...effect,sourceUid:picked.uid}});break;}
          const source=all.find(x=>x.uid===pending),dest=picked,amount=Number(effect.amount||10),destMax=dest&&ctx.maxHp?ctx.maxHp(ctx.side,dest):Number(ctx.cardById(dest?.cardId)?.hp||0);
          if(source&&dest&&source!==dest&&Number(source.damage||0)>=amount&&Number(dest.damage||0)+amount<destMax){source.damage-=amount;dest.damage=Number(dest.damage||0)+amount;}
          break;
        }
        if(all.some(x=>Number(x.damage||0)>=Number(effect.amount||10))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:true,filter:{damaged:true},effect});
        break;
      }
      case 'chooseAttackLock':{
        if(ctx.resolvingChoice){const target=other(ctx).active,attack=ctx.cardById(target?.cardId)?.attacks?.[Number(ctx.action?.choiceAttackIndex)];if(target&&attack){target.locks=target.locks||[];target.locks.push({action:'attack',attackName:attack.name,duration:effect.duration||'opponentTurn',expiresTurn:ctx.state.turnNumber+1});}break;}
        if(other(ctx).active&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'attack',side:'self',attackSide:ctx.foeSide,zone:'active',effect});
        break;
      }
      case 'chooseTypeOverride':{
        const target=effect.target==='opponentActive'?other(ctx).active:ctx.attacker,types=effect.energyTypes||['Grass','Fire','Water','Lightning','Psychic','Fighting'];
        if(!target)break;
        if(ctx.resolvingChoice){const type=types[Number(ctx.action?.choiceOption)];if(type){if(effect.stat==='weakness')target.weaknessOverride=type;else if(effect.stat==='type')target.typeOverride={type,expiresTurn:ctx.state.turnNumber};else target.resistanceOverride=type;}break;}
        if(typeof ctx.requestChoice==='function'){const options=effect.stat==='type'?[...new Set([...pokemonOn(own(ctx)),...pokemonOn(other(ctx))].flatMap(slot=>ctx.cardById(slot.cardId)?.types||[]).filter(type=>type!=='Colorless'&&types.includes(type)))]:types;if(options.length)ctx.requestChoice({kind:'option',side:'self',options,effect:{...effect,energyTypes:options}});}
        break;
      }
      case 'destinyBond':{for(const slot of affected())slot.destinyBond={expiresTurn:ctx.state.turnNumber+1,opponentAttackOnly:true};break;}
      case 'shuffleHandMatching':{
        const sides=effect.side==='both'?[own(ctx),other(ctx)]:[effect.side==='opponent'?other(ctx):own(ctx)];
        for(const ss of sides){for(let i=ss.hand.length-1;i>=0;i--){const ref=ss.hand[i];if(matchesFilter(ctx.cardById(ref.cardId),effect.filter,ref)){ss.deck.push(...ss.hand.splice(i,1));}}ctx.shuffle?.(ctx.state,ss.deck);}break;
      }
      case 'tradeHandForDeck':{
        const ss=own(ctx);
        if(ctx.resolvingChoice&&effect.handUid){const deckIndex=Number(ctx.action?.choiceDeckIndex),handIndex=ss.hand.findIndex(r=>r.uid===effect.handUid),incoming=ss.deck[deckIndex];if(handIndex>=0&&incoming&&matchesFilter(ctx.cardById(incoming.cardId),effect.deckFilter)){const [inRef]=ss.deck.splice(deckIndex,1),[outRef]=ss.hand.splice(handIndex,1,inRef);log({type:'pokemonTraderReveal',side:ctx.side,fromHand:outRef.cardId,fromDeck:inRef.cardId});ss.deck.push(outRef);ctx.shuffle?.(ctx.state,ss.deck);}break;}
        if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceHandIndex)){const ref=ss.hand[ctx.action.choiceHandIndex];if(ref&&matchesFilter(ctx.cardById(ref.cardId),effect.handFilter)&&ss.deck.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.deckFilter))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'deckCard',side:'self',filter:effect.deckFilter,effect:{...effect,handUid:ref.uid}});break;}
        if(ss.hand.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.handFilter))&&ss.deck.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.deckFilter))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:'self',filter:effect.handFilter,effect});break;
      }
      case 'scoopUp':{
        const slot=affected()[0],ss=slot&&energyOwner(ctx,slot);if(!slot||!ss)break;
        if(ctx.state.format==='classic'&&ctx.trainerRef?.cardId==='neo1-98'){
          // Unlike Base Set Scoop Up, Super Scoop Up returns the entire evolution
          // stack and every attachment to hand on heads.
          const refs=[...(slot.stack||[slot.cardId]).map((cardId,i)=>({uid:`${slot.uid}-neo-scoop-${i}`,cardId})),...(slot.specialEnergy||[]),...toolsOf(slot),...(slot.temporaryTrainers||[])];
          for(const [type,count] of Object.entries(slot.energy||{}))for(let i=0;i<Number(count||0);i++)if(neoBasicIds[type])refs.push({uid:`${slot.uid}-neo-energy-${type}-${i}`,cardId:neoBasicIds[type],zoneGenerated:true});
          if(ss.handLimit!=null&&ss.hand.length+refs.length>ss.handLimit)break;
          ss.hand.push(...refs);
          if(ss.active===slot)ss.active=null;else{const index=ss.bench.indexOf(slot);if(index>=0)ss.bench.splice(index,1);}
          break;
        }
        const basicId=slot.stack?.[0]||slot.cardId;if(ss.handLimit!=null&&ss.hand.length>=ss.handLimit)break;
        ss.hand.push({uid:`${slot.uid}-scoop-basic`,cardId:basicId});
        for(const cardId of (slot.stack||[]).slice(1))ss.discard.push({uid:`${slot.uid}-scoop-${cardId}`,cardId});
        for(const tool of toolsOf(slot))ss.discard.push(tool);for(const t of slot.temporaryTrainers||[])ss.discard.push(t);for(const ref of slot.specialEnergy||[])ss.discard.push(ref);
        ss.energyDiscard=ss.energyDiscard||{};for(const [type,n] of Object.entries(slot.energy||{}))ss.energyDiscard[type]=Number(ss.energyDiscard[type]||0)+Number(n||0);
        if(ss.active===slot)ss.active=null;else{const i=ss.bench.indexOf(slot);if(i>=0)ss.bench.splice(i,1);}log({type:'scoopUp',cardId:slot.cardId,basicCardId:basicId});break;
      }
      case 'energyRetrieval':{
        const ss=own(ctx),ids=effect.energyCardIds||{};
        const availableTypes=()=>{const set=new Set(Object.entries(ss.energyDiscard||{}).filter(([,n])=>Number(n)>0).map(([t])=>t));for(const ref of ss.discard||[]){const c=ctx.cardById(ref.cardId);if(c?.basicEnergy)set.add(c.subtype);}return [...set].filter(t=>ids[t]);};
        if(ctx.resolvingChoice){const opts=availableTypes(),pick=Number(ctx.action?.choiceOption);if(pick>=opts.length)break;const type=opts[pick];let ref=null,di=ss.discard.findIndex(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype===type);if(di>=0)[ref]=ss.discard.splice(di,1);else if(Number(ss.energyDiscard?.[type]||0)>0){ss.energyDiscard[type]--;ref={uid:`retrieved-${type}-${ctx.state.turnNumber}-${ss.hand.length}`,cardId:ids[type]};}if(ref)ss.hand.push(ref);const left=Number(effect.remaining||effect.amount||2)-1,next=availableTypes();if(left>0&&next.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:[...next,'Done'],effect:{...effect,remaining:left}});break;}
        const opts=availableTypes();if(opts.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:[...opts,'Done'],effect:{...effect,remaining:Number(effect.amount||2)}});break;
      }
      case 'pokemonCenter':{
        const ss=own(ctx);for(const slot of pokemonOn(ss)){if(Number(slot.damage||0)<=0)continue;slot.damage=0;ss.energyDiscard=ss.energyDiscard||{};for(const [type,n] of Object.entries(slot.energy||{}))ss.energyDiscard[type]=Number(ss.energyDiscard[type]||0)+Number(n||0);slot.energy={};for(const ref of slot.specialEnergy||[])ss.discard.push(ref);slot.specialEnergy=[];}break;
      }
      case 'devolutionSpray':{
        const slot=affected()[0],ss=slot&&energyOwner(ctx,slot);if(!slot||!ss||!Array.isArray(slot.stack)||slot.stack.length<2)break;
        const choices=slot.stack.slice(1).map((cardId,index)=>({cardId,stackIndex:index+1})).reverse();
        if(ctx.resolvingChoice){const pick=choices[Number(ctx.action?.choiceOption)];if(!pick)break;while(slot.stack.length>pick.stackIndex+1){const top=slot.stack.pop();ss.discard.push({uid:`${slot.uid}-devolution-${top}-${ctx.state.turnNumber}`,cardId:top});}const chosen=slot.stack.pop();if(chosen)ss.discard.push({uid:`${slot.uid}-devolution-${chosen}-${ctx.state.turnNumber}`,cardId:chosen});slot.cardId=slot.stack[slot.stack.length-1];clearTemporaryEffects(ctx.state,slot);break;}
        if(choices.length===1){const chosen=slot.stack.pop();if(chosen)ss.discard.push({uid:`${slot.uid}-devolution-${chosen}-${ctx.state.turnNumber}`,cardId:chosen});slot.cardId=slot.stack[slot.stack.length-1];clearTemporaryEffects(ctx.state,slot);break;}
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:choices.map(x=>ctx.cardById(x.cardId)?.stage||ctx.cardById(x.cardId)?.name||x.cardId),effect});break;
      }
      case 'multiEnergyRemoval':{
        const ownSide=own(ctx),foe=other(ctx),stage=effect.stage||'self';
        if(stage==='self'){
          if(ctx.resolvingChoice){const slot=selected(ctx,ownSide);if(!slot)break;applyEffect({type:'discardEnergyCard',target:slot===ownSide.active?'selfActive':'selfBench',amount:1},{...ctx,action:{...ctx.action,target:slot===ownSide.active?'active':'bench',benchIndex:slot.benchSlot}});if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',selectionSide:ctx.foeSide,includeActive:true,effect:{...effect,stage:'opponent'}});break;}
          if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:true,effect});break;
        }
        if(ctx.resolvingChoice){const slot=selected(ctx,foe);if(!slot)break;let left=Math.min(2,Object.values(slot.energy||{}).reduce((n,x)=>n+Number(x||0),0)+(slot.specialEnergy||[]).length);while(left-->0)applyEffect({type:'discardEnergyCard',target:slot===foe.active?'opponentActive':'opponentBench',amount:1},{...ctx,action:{...ctx.action,target:slot===foe.active?'opponentActive':'opponentBench',benchIndex:slot.benchSlot}});break;}
        break;
      }
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
        const freeSlots=Math.max(0,3-(ss.bench||[]).filter(Boolean).length);
        if(!eligible.length||!freeSlots)break;
        if(ctx.resolvingChoice){
          if(ctx.action?.choiceSkip)break;
          const idx=Number(ctx.action?.choiceHandIndex),ref=ss.hand[idx];
          if(ref&&ctx.cardById(ref.cardId)?.kind==='pokemon'&&ctx.cardById(ref.cardId)?.stage==='Basic'){
            ss.hand.splice(idx,1);
            const placed=ctx.benchCard?.(ss,ref);
            if(placed==null)ss.hand.splice(Math.min(idx,ss.hand.length),0,ref);
          }
          if((ss.bench||[]).filter(Boolean).length<3&&(ss.hand||[]).some(r=>ctx.cardById(r.cardId)?.kind==='pokemon'&&ctx.cardById(r.cardId)?.stage==='Basic')&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'opponentHandCard',side:'self',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect});
          break;
        }
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'opponentHandCard',side:'self',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect});
        break;
      }
      case 'redistributeEnergy':{
        const all=pokemonOn(own(ctx)),remaining=effect.remaining||null;
        if(effect.phase==='continue'&&ctx.resolvingChoice&&Number(ctx.action?.choiceOption)===1)break;
        if(ctx.resolvingChoice&&effect.phase==='continue'){
          if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'energySource',side:'self',energyTypes:effect.allowedEnergyTypes,effect:{type:'redistributeEnergy',allowedEnergyTypes:effect.allowedEnergyTypes}});
          break;
        }
        if(ctx.resolvingChoice){
          if(!remaining){
            const source=selected(ctx,own(ctx)),type=ctx.action?.effectEnergyType;
            if(!source||!type||Number(source.energy?.[type]||0)<=0||(effect.allowedEnergyTypes&&!effect.allowedEnergyTypes.includes(type)))break;
            if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',includeActive:true,excludeUids:[source.uid],effect:{...effect,remaining:{sourceUid:source.uid,energyType:type}}});
            break;
          }
          const source=all.find(s=>s.uid===remaining.sourceUid),dest=selected(ctx,own(ctx));
          if(source&&dest&&source!==dest&&Number(source.energy?.[remaining.energyType]||0)>0){source.energy[remaining.energyType]--;dest.energy[remaining.energyType]=Number(dest.energy[remaining.energyType]||0)+1;}
          if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:['Move another Energy','Done'],effect:{type:'redistributeEnergy',phase:'continue'}});
          break;
        }
        const movable=all.some(s=>totalEnergy(s.energy)>0&&all.some(d=>d!==s));
        if(movable&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'energySource',side:'self',energyTypes:effect.allowedEnergyTypes,effect});
        break;
      }
      case 'distributeDiscardEnergyDistinct':{
        const ss=own(ctx),usedTypes=Array.isArray(effect.usedTypes)?effect.usedTypes.slice():[],placed=Number(effect.placed||0);
        const available=[...new Set([...Object.keys(ss.energyDiscard||{}),...(ss.discard||[]).map(ref=>ctx.cardById(ref.cardId)).filter(c=>c?.basicEnergy).map(c=>c.subtype)])].filter(t=>!usedTypes.includes(t)&&neoDiscardAvailable(ctx,ss,t)>0);
        const limit=Math.min(Number(effect.amount||0),usedTypes.length+available.length);
        if(placed>=limit||!available.length)break;
        if(ctx.resolvingChoice){
          const target=selected(ctx,ss),type=ctx.action?.effectEnergyType;
          if(target&&type&&!usedTypes.includes(type)&&neoDiscardAvailable(ctx,ss,type)>0&&matchesFilter(ctx.cardById(target.cardId),effect.filter,target)){
            neoTakeDiscard(ctx,ss,type,1);target.energy[type]=Number(target.energy[type]||0)+1;ctx.onEnergyAttached?.(target,type,1);usedTypes.push(type);
            const next=placed+1;
            const remain=[...new Set([...Object.keys(ss.energyDiscard||{}),...(ss.discard||[]).map(ref=>ctx.cardById(ref.cardId)).filter(c=>c?.basicEnergy).map(c=>c.subtype)])].filter(t=>!usedTypes.includes(t)&&neoDiscardAvailable(ctx,ss,t)>0);
            if(next<Number(effect.amount||0)&&remain.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'energyTarget',side:'self',filter:effect.filter,energyTypes:remain,effect:{...effect,usedTypes,placed:next}});
          }
          break;
        }
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'energyTarget',side:'self',filter:effect.filter,energyTypes:available,effect:{...effect,usedTypes,placed}});
        break;
      }
      case 'multiTargetDamage':{const foe=other(ctx),remaining=Math.max(1,Number((effect.remaining??effect.count)||1)),chosen=Array.isArray(effect.chosenUids)?effect.chosenUids.slice():[];if(ctx.resolvingChoice){const target=selected(ctx,foe);if(target&&!chosen.includes(target.uid)){const side=ctx.foeSide,guard=ctx.isAttack&&attackIsPrevented(ctx.state,side,target,ctx.attacker,ctx.cardById)||fossilTransparencyBlocks(ctx,side,target),amount=guard?0:Math.max(0,Number(effect.amount||0)-(ctx.isAttack?modifierAmount(ctx.state,side,target,'damageReduction',ctx.cardById):0));target.damage=Number(target.damage||0)+amount;chosen.push(target.uid);}const left=remaining-1;if(left>0&&(effect.target==='opponentPokemon'?pokemonOn(foe):foe.bench).some(s=>s&&!chosen.includes(s.uid))){if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',selectionSide:ctx.foeSide,includeActive:effect.target==='opponentPokemon',excludeUids:chosen,effect:{...effect,remaining:left,chosenUids:chosen}});}break;}if(typeof ctx.requestChoice==='function'){const candidates=(effect.target==='opponentPokemon'?pokemonOn(foe):foe.bench).filter(s=>s&&!chosen.includes(s.uid));if(candidates.length)ctx.requestChoice({kind:'pokemon',side:'self',selectionSide:ctx.foeSide,includeActive:effect.target==='opponentPokemon',excludeUids:chosen,effect:{...effect,remaining}});}break;}
      case 'scheduleDelayed':{const a=ctx.action||{};let targetUid=null,spot=null;if(effect.targetMode==='defender')targetUid=ctx.defender?.uid||null;else{const t=a.choiceTarget||a.effectTarget||a.target;if(t==='opponentActive'||t==='active')spot={side:ctx.foeSide,active:true};else{const idx=a.choiceBenchIndex??a.effectBenchIndex??a.benchIndex;spot={side:ctx.foeSide,benchIndex:Number(idx)};}}ctx.state.delayedEffects=ctx.state.delayedEffects||[];ctx.state.delayedEffects.push({event:effect.event,dueTurn:ctx.state.turnNumber+1,endingSide:ctx.foeSide,originSide:ctx.side,sourceUid:ctx.attacker?.uid||null,targetUid,spot,effect:effect.effect});break;}
      case 'retreatRetaliation':for(const target of affected())target.retreatRetaliation={amount:Number(effect.amount||0),expiresTurn:ctx.state.turnNumber+1};break;
      case 'abilitySuppression':for(const target of affected())target.abilitySuppressed={duration:effect.duration||'whileActive'};break;
      case 'knockOut':for(const target of affected()){const which=pokemonOn(own(ctx)).includes(target)?ctx.side:ctx.foeSide,targetMax=ctx.maxHp?ctx.maxHp(which,target):Number(ctx.cardById(target.cardId)?.hp||0);target.damage=Math.max(Number(target.damage||0),targetMax);}break;
      case 'discardPokemon':for(const target of affected()){const ss=pokemonOn(own(ctx)).includes(target)?own(ctx):other(ctx);for(const cardId of target.stack||[target.cardId])ss.discard.push({uid:`${target.uid}-discard-${cardId}`,cardId});for(const tool of [...toolsOf(target),...temporaryTrainersOf(target),...(target.specialEnergy||[])])ss.discard.push(tool);for(const [type,n] of Object.entries(target.energy||{}))recordDiscardedEnergy(ss,type,Number(n||0));if(ss.active===target)ss.active=null;else{const i=ss.bench.indexOf(target);if(i>=0)ss.bench.splice(i,1);}log({type:'discardPokemon',cardId:target.cardId});}break;
      case 'koPointBonus':{const ss=own(ctx);ss.koPointBonuses=ss.koPointBonuses||[];ss.koPointBonuses.push({...effect,expiresTurn:ctx.state.turnNumber});break;}
      case 'randomAttackLock':for(const target of affected()){const attacks=ctx.cardById(target.cardId)?.attacks||[];if(!attacks.length)continue;const attack=attacks[Math.floor(ctx.random(ctx.state)*attacks.length)];target.locks=target.locks||[];target.locks.push({action:'attack',attackName:attack.name,duration:effect.duration,expiresTurn:ctx.state.turnNumber+(effect.duration==='opponentTurn'?1:2)});}break;
      case 'randomHitBonus':{const ss=own(ctx);ss.randomHitBonuses=ss.randomHitBonuses||[];ss.randomHitBonuses.push({...effect,expiresTurn:ctx.state.turnNumber});break;}
      case 'stackAttackBonus':if(ctx.attacker){ctx.attacker.stackedAttackBonuses=ctx.attacker.stackedAttackBonuses||{};ctx.attacker.stackedAttackBonuses[effect.attackName]=Number(ctx.attacker.stackedAttackBonuses[effect.attackName]||0)+Number(effect.amount||0);}break;
      case 'firstDamageGuard':for(const s of affected())s.firstDamageGuard=true;break;
      case 'attachRandomEnergy':{for(const s of affected()){const owner=energyOwner(ctx,s);for(let i=0;i<Number(effect.amount||1);i++){const choices=(effect.energyTypes||[]).filter(type=>!Array.isArray(owner?.energySupply)||owner.energySupply.includes(type));if(!choices.length)break;const type=choices[Math.floor(ctx.random(ctx.state)*choices.length)];const taken=neoSupplyTake(ctx,owner,type,1);if(!taken)continue;s.energy[type]=Number(s.energy[type]||0)+taken;ctx.onEnergyAttached?.(s,type,taken);}}break;}
      case 'selfDamageIfDefenderKnockedOut':{if(ctx.attacker&&ctx.defender&&Number(ctx.defender.damage||0)>=(ctx.maxHp?ctx.maxHp(ctx.foeSide,ctx.defender):Number(ctx.cardById(ctx.defender.cardId)?.hp||0)))ctx.attacker.damage=Number(ctx.attacker.damage||0)+Number(effect.amount||0);break;}
      case 'shuffleRandomCombinedHandCard':{const pools=[{side:own(ctx),label:'self'},{side:other(ctx),label:'opponent'}],all=[];for(const p of pools)for(const [index,ref] of p.side.hand.entries())all.push({...p,index,ref});if(all.length){const hit=all[Math.floor(ctx.random(ctx.state)*all.length)];log({type:'revealHand',revealedSide:hit.label,cards:[hit.ref.cardId]});const [ref]=hit.side.hand.splice(hit.index,1);hit.side.deck.push(ref);ctx.shuffle?.(ctx.state,hit.side.deck);}break;}
      case 'createCard':{for(let i=0;i<Number(effect.amount||1)&&own(ctx).hand.length<10;i++)own(ctx).hand.push({uid:`rental-${effect.cardId}-${ctx.state.turnNumber}-${i}`,cardId:effect.cardId});break;}
      case 'searchThenShuffleChosen':{const ss=own(ctx),pool=ss.deck.map((r,index)=>({r,index})).filter(x=>matchesFilter(ctx.cardById(x.r.cardId),effect.filter)),drawn=[];for(let i=0;i<Number(effect.amount||0)&&pool.length&&ss.hand.length<10;i++){const pick=Math.floor(ctx.random(ctx.state)*pool.length),hit=pool.splice(pick,1)[0],idx=ss.deck.indexOf(hit.r);if(idx>=0){const [ref]=ss.deck.splice(idx,1);ss.hand.push(ref);drawn.push(ref);}}ctx.shuffle?.(ctx.state,ss.deck);if(drawn.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:'self',filter:effect.handFilter||effect.filter,effect:{type:'shuffleChosenHand',side:'self',amount:drawn.length,required:true,filter:effect.handFilter||effect.filter}});break;}
      case 'coinBenchDamage':{let heads=0;const results=[];for(let i=0;i<effect.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}log({type:'coin',side:ctx.side,heads,coins:effect.coins,results});if(heads)applyEffect({type:'benchDamage',side:'opponent',all:true,amount:heads*Number(effect.amount||0)},ctx);break;}
      case 'stadiumAction':applyEffect(effect.effect,ctx);break;
      case 'rerollEnergyZone':{const ss=own(ctx);if(!ss.energyAvailable||ss.energyUsed)break;if(Array.isArray(ss.energySupply)){const pulled=ss.energySupply.shift();if(pulled)ss.energyType=pulled;ss.nextEnergyType=ss.energySupply[0]||null;}else{ss.energyType=ss.nextEnergyType||ss.energyTypes[0];ss.nextEnergyType=ss.energyTypes.length>1?ss.energyTypes[Math.floor(ctx.random(ctx.state)*ss.energyTypes.length)]:ss.energyTypes[0];}log({type:'energyZoneReroll',energyType:ss.energyType});break;}
      case 'setNextEnergyRandom':{const ss=effect.side==='self'?own(ctx):other(ctx),types=effect.energyTypes||[];if(types.length){const next=types[Math.floor(ctx.random(ctx.state)*types.length)];if(Array.isArray(ss.energySupply)&&ss.energySupply.length)ss.energySupply[0]=next;ss.nextEnergyType=next;}break;}
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
      case 'discardHand':{const ss=effect.side==='opponent'?other(ctx):own(ctx);for(let i=0;i<effect.amount&&ss.hand.length;i++){const candidates=ss.hand.map((r,index)=>({r,index})).filter(({r})=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter));if(!candidates.length)break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)];const [ref]=ss.hand.splice(hit.index,1),c=ctx.cardById(ref?.cardId);if(ctx.state.format==='classic'&&c?.basicEnergy)recordDiscardedEnergy(ss,c.subtype,1);else if(ref)ss.discard.push(ref);}break;}
      case 'trimHand':{const ss=effect.side==='opponent'?other(ctx):own(ctx);while(ss.hand.length>effect.maxSize){const index=Math.floor(ctx.random(ctx.state)*ss.hand.length);const [ref]=ss.hand.splice(index,1),c=ctx.cardById(ref?.cardId);if(ctx.state.format==='classic'&&c?.basicEnergy)recordDiscardedEnergy(ss,c.subtype,1);else if(ref)ss.discard.push(ref);}break;}
      case 'shuffleRandomHandCard':{const ss=effect.side==='opponent'?other(ctx):own(ctx),candidates=ss.hand.map((r,index)=>({r,index})).filter(({r})=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter));if(candidates.length){const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)],[ref]=ss.hand.splice(hit.index,1);ss.deck.push(ref);ctx.shuffle(ctx.state,ss.deck);}break;}
      case 'randomPokemonDamage':{let hits=effect.perEnergyType?Number(ctx.attacker?.energy?.[effect.perEnergyType]||0):Number(effect.hits||0);for(const bonus of own(ctx).randomHitBonuses||[])if((bonus.expiresTurn==null||ctx.state.turnNumber<=bonus.expiresTurn)&&bonus.attackName===ctx.attack?.name)hits+=Number(bonus.amount||0);for(let i=0;i<hits;i++){let entries=effect.bothSides?[...pokemonOn(own(ctx)).map(slot=>({slot,side:ctx.side})),...pokemonOn(other(ctx)).map(slot=>({slot,side:ctx.foeSide}))]:(effect.zone==='bench'?other(ctx).bench.filter(Boolean):pokemonOn(other(ctx))).map(slot=>({slot,side:ctx.foeSide}));if(effect.zone==='bench'&&effect.bothSides)entries=entries.filter(x=>x.slot!==own(ctx).active&&x.slot!==other(ctx).active);if(effect.excludeSelf)entries=entries.filter(x=>x.slot!==ctx.attacker);if(!entries.length)break;const hit=entries[Math.floor(ctx.random(ctx.state)*entries.length)],guard=ctx.isAttack&&attackIsPrevented(ctx.state,hit.side,hit.slot,ctx.attacker,ctx.cardById),amount=guard?0:Math.max(0,effect.amount-(ctx.isAttack?modifierAmount(ctx.state,hit.side,hit.slot,'damageReduction',ctx.cardById):0));hit.slot.damage=Number(hit.slot.damage||0)+amount;}break;}
      case 'globalRandomDiscardEnergy':{const count=Math.max(1,Number(effect.amount||1)),sides=effect.side==='self'?[own(ctx)]:effect.side==='opponent'?[other(ctx)]:[own(ctx),other(ctx)];for(let pick=0;pick<count;pick++){const slots=sides.flatMap(ss=>pokemonOn(ss).filter(slot=>!effect.filter||matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot)).map(slot=>({slot,side:ss}))),units=[];for(const x of slots)for(const [type,n] of Object.entries(x.slot.energy||{}))for(let i=0;i<Number(n||0);i++)units.push({...x,type});if(!units.length)break;const hit=units[Math.floor(ctx.random(ctx.state)*units.length)];hit.slot.energy[hit.type]=Math.max(0,Number(hit.slot.energy[hit.type]||0)-1);recordDiscardedEnergy(hit.side,hit.type,1);}break;}
      case 'discardStadium':if(ctx.state.stadium){
        const st=ctx.state.stadium,ss=ctx.state.sides[st.ownerSide];
        ss.discard.push({uid:st.uid,cardId:st.cardId});ctx.state.stadium=null;
        if(st.cardId==='SNAPFLORIO-108'){
          ctx.state.lentalDamOverflow=true;
          for(const which of ['player','opponent'])ctx.state.sides[which].benchLimit=3;
        }
      }break;
      case 'drain':if(ctx.attacker&&Number(ctx.dealtDamage||0)>0){const amount=effect.fraction!=null?Math.ceil(Number(ctx.dealtDamage||0)*Number(effect.fraction)/10)*10:effect.amount==null?Number(ctx.dealtDamage||0):Math.min(Number(ctx.dealtDamage||0),Number(effect.amount||0));ctx.attacker.damage=Math.max(0,Number(ctx.attacker.damage||0)-Math.max(0,amount));}break;
      case 'nextAttackBonus':if(ctx.attacker){ctx.attacker.nextAttackBonuses=ctx.attacker.nextAttackBonuses||[];ctx.attacker.nextAttackBonuses.push({attackName:effect.attackName,amount:effect.amount,turn:ctx.state.turnNumber+2});}break;
      case 'evolveFromDeck':if(ctx.attacker&&typeof ctx.evolveFromDeck==='function')ctx.evolveFromDeck(ctx.attacker);break;
      case 'benchFromDiscard':{const ss=effect.side==='self'?own(ctx):other(ctx),source=ss.discard;if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceDiscardIndex)){const index=ctx.action.choiceDiscardIndex,ref=source[index];if(!ref||!matchesFilter(ctx.cardById(ref.cardId),effect.filter))break;const empty=Math.max(0,Number(ss.benchLimit||3)-ss.bench.length);if(!empty)break;source.splice(index,1);const benchSlot=ctx.benchCard(ss,ref);if(benchSlot==null){source.splice(index,0,ref);break;}if(effect.damageFraction!=null){const slot=(ss.bench||[]).find(x=>x&&Number(x.benchSlot)===Number(benchSlot)),max=Number(ctx.cardById(ref.cardId)?.hp||0),remaining=Math.floor((max*Number(effect.damageFraction))/10)*10;if(slot)slot.damage=Math.max(0,max-remaining);}break;}if(ss.bench.length<Number(ss.benchLimit||3)&&source.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'discardCard',side:'self',discardZone:effect.side==='opponent'?'opponent':'self',filter:effect.filter,effect});break;}
      case 'benchFromDeck':{const ss=own(ctx);for(let i=0;i<effect.amount;i++){const candidates=ss.deck.map((r,index)=>({r,index})).filter(({r})=>matchesFilter(ctx.cardById(r.cardId),effect.filter));if(!candidates.length||typeof ctx.benchCard!=='function')break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)],[ref]=ss.deck.splice(hit.index,1);if(ctx.benchCard(ss,ref)==null){ss.deck.splice(hit.index,0,ref);break;}log({type:'benchFromDeck',cardId:ref.cardId});}if(ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);break;}
      case 'forceOpponentSwitch':{
        const ss=other(ctx);if(!ss.active||!ss.bench.length)break;
        if(ctx.resolvingChoice&&ctx.action?.choiceTarget==='bench'){switchPokemon(ss,ctx.action.choiceBenchIndex,ctx.state);log({type:'switch',chosenBy:ctx.foeSide});break;}
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'switchBench',side:'opponent',effect});break;
      }
      case 'revealHand':{const ss=effect.side==='self'?own(ctx):other(ctx);let refs=ss.hand.slice();if(effect.random){const n=Math.min(refs.length,Math.max(0,Number(effect.random)||0)),pool=refs.slice();refs=[];for(let i=0;i<n&&pool.length;i++){const index=Math.floor(ctx.random(ctx.state)*pool.length);refs.push(...pool.splice(index,1));}}log({type:'revealHand',revealedSide:effect.side||'opponent',cards:refs.map(r=>r.cardId)});break;}
      case 'peek':{
        const ours=own(ctx).prizes||[],theirs=other(ctx).prizes||[];
        const options=['Top of your deck','Top of opponent deck','Random opponent hand',...ours.map((_,i)=>`Your Prize ${i+1}`),...theirs.map((_,i)=>`Opponent Prize ${i+1}`)];
        if(ctx.resolvingChoice){const choice=Number(ctx.action?.choiceOption||0);let list=null,side=ctx.side,zone='deck',ref=null;
          if(choice===0){list=own(ctx).deck;}else if(choice===1){list=other(ctx).deck;side=ctx.foeSide;}else if(choice===2){list=other(ctx).hand;side=ctx.foeSide;zone='hand';}
          else if(choice<3+ours.length){list=ours;zone='prizes';}else{list=theirs;side=ctx.foeSide;zone='prizes';}
          if(choice===2)ref=list?.[Math.floor(ctx.random(ctx.state)*list.length)];else if(zone==='prizes')ref=list?.[choice<3+ours.length?choice-3:choice-3-ours.length];else ref=list?.[0];
          log({type:'peek',inspectedZone:zone,inspectedSide:side,cardId:ref?.cardId||null});break;}
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options,effect});break;
      }
      case 'inspectTop':{const ss=effect.side==='opponent'?other(ctx):own(ctx),count=Math.min(Number(effect.amount||1),ss.deck.length);log({type:'inspectTop',inspectedSide:effect.side||'self',cards:ss.deck.slice(0,count).map(r=>r.cardId)});break;}
      case 'fossilWildfire':{
        const ss=own(ctx),fire=Math.max(0,Number(ctx.attacker?.energy?.Fire||0));
        if(ctx.resolvingChoice){const count=Math.min(Math.max(0,Number(ctx.action?.choiceOption||0)),fire);if(count){applyEffect({type:'discardEnergy',target:'self',energyType:'Fire',amount:count},ctx);for(let i=0;i<count&&other(ctx).deck.length;i++)other(ctx).discard.push(other(ctx).deck.shift());log({type:'fossilWildfire',amount:count});}break;}
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:Array.from({length:Math.min(fire,15)+1},(_,n)=>`${n} Fire Energy`),effect});break;
      }
      case 'fossilThunderstorm':{
        let tails=0;const results=[];for(const slot of other(ctx).bench.filter(Boolean)){const hit=coin(ctx);results.push(hit);if(hit)applyEffect({type:'benchDamage',side:'opponent',amount:20},{...ctx,action:{...ctx.action,target:'bench',benchIndex:slot.benchSlot}});else tails++;}
        log({type:'coin',heads:results.filter(Boolean).length,coins:results.length,results});if(tails)applyEffect({type:'selfDamage',amount:tails*10},ctx);break;
      }
      case 'fossilProphecy':{
        if(ctx.resolvingChoice){applyEffect({type:'reorderTop',count:3,deckSide:Number(ctx.action?.choiceOption)===1?'opponent':'self'},ctx);break;}
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'option',side:'self',options:['Your deck','Opponent deck'],effect});break;
      }
      case 'fossilRecycle':{
        const ss=own(ctx);if(ctx.resolvingChoice){const idx=ctx.action?.choiceDiscardIndex;if(Number.isInteger(idx)&&ss.discard[idx]){const [ref]=ss.discard.splice(idx,1);ss.deck.unshift(ref);log({type:'recycle',cardId:ref.cardId});}break;}
        if(ss.discard.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'discardCard',side:'self',effect});break;
      }
      case 'fossilTransparency':case 'fossilArmor':case 'fossilClairvoyance':break;
      case 'fossilMoveCounter':{
        const ss=effect.side==='opponent'?other(ctx):own(ctx),slots=pokemonOn(ss),destination=effect.destination==='self'?ctx.attacker:null;
        if(ctx.resolvingChoice){
          if(effect.sourceUid){const source=slots.find(s=>s.uid===effect.sourceUid),target=destination||selected(ctx,ss);
            if(source&&target&&source!==target&&source.damage>=10&&(effect.side==='opponent'||target.damage+10<(ctx.maxHp?.(ctx.side,target)||ctx.cardById(target.cardId)?.hp||0))){source.damage-=10;target.damage=Number(target.damage||0)+10;log({type:'moveDamage',source:source.cardId,target:target.cardId,amount:10});}
            break;}
          const source=selected(ctx,ss);if(!source||source.damage<10)break;
          if(destination){if(destination!==source&&destination.damage+10<(ctx.maxHp?.(ctx.side,destination)||ctx.cardById(destination.cardId)?.hp||0)){source.damage-=10;destination.damage+=10;}break;}
          if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',selectionSide:effect.side==='opponent'?ctx.foeSide:ctx.side,includeActive:true,excludeUids:[source.uid],effect:{...effect,sourceUid:source.uid}});break;
        }
        if(slots.some(s=>s.damage>=10&&(effect.side==='opponent'?slots.some(t=>t!==s):destination!==s))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'pokemon',side:'self',selectionSide:effect.side==='opponent'?ctx.foeSide:ctx.side,includeActive:true,effect});break;
      }
      case 'returnIfSurvives':{const slot=other(ctx).active;if(slot&&slot===ctx.defender&&Number(slot.damage||0)<Number(ctx.cardById(slot.cardId)?.hp||0))applyEffect({type:'returnToHand',target:'opponentActive'},ctx);break;}
      case 'returnToHand':{for(const slot of affected()){
        const ss=energyOwner(ctx,slot);if(!ss)continue;
        const refs=slot.stack.map((cardId,i)=>({uid:`${slot.uid}-return-${i}`,cardId}));
        const tools=[...toolsOf(slot),...temporaryTrainersOf(slot)],special=(slot.specialEnergy||[]).slice();
        if(effect.returnBasicEnergy){
          const ids={Fighting:127,Fire:128,Grass:129,Lightning:130,Psychic:131,Water:132};
          for(const [type,n] of Object.entries(slot.energy||{}))for(let i=0;i<Number(n||0);i++){
            if(ids[type])refs.push({uid:`${slot.uid}-basic-${type}-${i}`,cardId:`gym1-${ids[type]}`,zoneGenerated:true});
          }
          refs.push(...special);
          if(!effect.discardTools)refs.push(...tools);
        }else if(effect.discardAttached){
          // Discard attachment effects will commit only after hand-capacity checks.
        }else refs.push(...tools,...special);
        if(ss.handLimit!=null&&ss.hand.length+refs.length>ss.handLimit){
          log({type:'returnToHandBlocked',cardId:slot.cardId,reason:'hand-full'});continue;
        }
        if(effect.returnBasicEnergy&&effect.discardTools)ss.discard.push(...tools);
        else if(effect.discardAttached){ss.discard.push(...tools,...special);for(const [type,n] of Object.entries(slot.energy||{}))recordDiscardedEnergy(ss,type,n);}
        ss.hand.push(...refs);
        if(ss.active===slot)ss.active=null;else ss.bench.splice(ss.bench.indexOf(slot),1);
        log({type:'returnToHand',cardId:slot.cardId});
      }break;}
      case 'shuffleIntoDeck':{for(const slot of affected()){const ss=energyOwner(ctx,slot);if(!ss)continue;const refs=slot.stack.map((cardId,i)=>({uid:`${slot.uid}-shuffle-${i}`,cardId}));
        if(effect.includeAttached!==false){
          refs.push(...toolsOf(slot),...temporaryTrainersOf(slot),...(slot.specialEnergy||[]));
          // Generated Basic Energy cannot enter the 30-card draw deck. Return
          // attached Basics to the BOTTOM of their owner's ordered supply.
          if(Array.isArray(ss.energySupply)){for(const [type,n] of Object.entries(slot.energy||{}))for(let i=0;i<Number(n||0);i++)ss.energySupply.push(type);ss.nextEnergyType=ss.energySupply[0]||null;}
        }else{for(const [type,n] of Object.entries(slot.energy||{}))recordDiscardedEnergy(ss,type,Number(n||0));ss.discard.push(...toolsOf(slot),...temporaryTrainersOf(slot),...(slot.specialEnergy||[]));}
        ss.deck.push(...refs);if(ss.active===slot)ss.active=null;else ss.bench.splice(ss.bench.indexOf(slot),1);if(ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);log({type:'shuffleIntoDeck',cardId:slot.cardId});}break;}
      case 'discardChosenHand':{
        const ss=effect.side==='opponent'?other(ctx):own(ctx),needed=Math.max(1,Number(effect.amount||1));
        if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceHandIndex)){const [ref]=ss.hand.splice(ctx.action.choiceHandIndex,1);if(ref){const c=ctx.cardById(ref.cardId);if(ctx.state.format==='classic'&&c?.basicEnergy)recordDiscardedEnergy(ss,c.subtype,1);else ss.discard.push(ref);}const left=Number(effect.remaining||needed)-1;if(left>0&&ss.hand.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:effect.side||'self',filter:effect.filter,effect:{...effect,remaining:left}});break;}
        const candidates=ss.hand.filter(r=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r));if(candidates.length<needed){if(effect.required)ctx.actionFailed=true;break;}if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:effect.side||'self',filter:effect.filter,effect:{...effect,remaining:needed}});break;
      }
      case 'shuffleChosenHand':{
        const ss=effect.side==='opponent'?other(ctx):own(ctx),needed=Math.max(1,Number(effect.remaining||effect.amount||1));
        if(ctx.resolvingChoice&&Number.isInteger(ctx.action?.choiceHandIndex)){const [ref]=ss.hand.splice(ctx.action.choiceHandIndex,1);if(ref){ss.deck.push(ref);ctx.shuffle?.(ctx.state,ss.deck);}const left=needed-1;if(left>0&&ss.hand.some(r=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:effect.side||'self',filter:effect.filter,effect:{...effect,remaining:left}});break;}
        const candidates=ss.hand.filter(r=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r));if(candidates.length>=needed&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'handCard',side:effect.side||'self',filter:effect.filter,effect:{...effect,remaining:needed}});else if(effect.required)ctx.actionFailed=true;break;
      }
      case 'searchChosen':{
        const ss=own(ctx),source=ss[effect.source||'deck'];
        if(ctx.resolvingChoice){const index=effect.source==='discard'?ctx.action?.choiceDiscardIndex:ctx.action?.choiceDeckIndex;if(Number.isInteger(index)&&source[index]&&(!effect.excludePlayedTrainer||source[index].uid!==ctx.trainerRef?.uid)&&(ss.handLimit==null||ss.hand.length<ss.handLimit)){const [ref]=source.splice(index,1);ss.hand.push(ref);log({type:'search',cardId:ref.cardId});const left=Number(effect.remaining||effect.amount||1)-1;if(left>0&&source.some(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter))&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:effect.source==='discard'?'discardCard':'deckCard',side:'self',filter:effect.filter,excludeUids:effect.excludePlayedTrainer&&ctx.trainerRef?[ctx.trainerRef.uid]:[],effect:{...effect,remaining:left}});else if((effect.source||'deck')==='deck'&&ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);}break;}
        const candidates=source.filter(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter)&&(!effect.excludePlayedTrainer||r.uid!==ctx.trainerRef?.uid));if(candidates.length&&typeof ctx.requestChoice==='function')ctx.requestChoice({kind:effect.source==='discard'?'discardCard':'deckCard',side:'self',filter:effect.filter,excludeUids:effect.excludePlayedTrainer&&ctx.trainerRef?[ctx.trainerRef.uid]:[],effect:{...effect,remaining:Number(effect.amount||1)}});break;
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
        if((ctx.resolvingChoice&&ctx.action?.choiceTarget==='bench')||ctx.action?.target==='bench'){const chosen=ctx.resolvingChoice?ctx.action.choiceBenchIndex:ctx.action.benchIndex,idx=ss.bench.findIndex(x=>x&&Number(x.benchSlot)===Number(chosen));if(idx>=0){const [slot]=ss.bench.splice(idx,1);for(const cardId of slot.stack)ss.discard.push({uid:`${slot.uid}-discard-${cardId}`,cardId});for(const tool of [...toolsOf(slot),...temporaryTrainersOf(slot),...(slot.specialEnergy||[])])ss.discard.push(tool);for(const [type,n] of Object.entries(slot.energy||{}))recordDiscardedEnergy(ss,type,Number(n||0));}break;}
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
      case 'attachEnergyFromDiscard':{for(const s of affected()){const owner=energyOwner(ctx,s);if(!owner)continue;const type=effect.energyType||ctx.action?.effectEnergyType;if(!type)continue;const available=neoTakeDiscard(ctx,owner,type,Number(effect.amount||1));if(available<=0)continue;s.energy[type]=Number(s.energy[type]||0)+available;ctx.onEnergyAttached?.(s,type,available);}break;}
      case 'attachRandomEnergyFromDiscard':{for(const s of affected()){const owner=energyOwner(ctx,s);if(!owner)continue;for(let i=0;i<Number(effect.amount||1);i++){const units=[...Object.entries(owner.energyDiscard||{}).flatMap(([type,n])=>Array(Math.max(0,Math.floor(Number(n)||0))).fill(type)),...(owner.discard||[]).map(ref=>ctx.cardById(ref.cardId)).filter(c=>c?.basicEnergy).map(c=>c.subtype)];if(!units.length)break;const type=units[Math.floor(ctx.random(ctx.state)*units.length)];if(!neoTakeDiscard(ctx,owner,type,1))break;s.energy[type]=Number(s.energy[type]||0)+1;ctx.onEnergyAttached?.(s,type,1);}}break;}
      case 'randomStatus':{for(const s of affected()){const choices=(effect.statuses||STATUSES).filter(status=>!effect.excludeExisting||!s.conditions?.[status]);if(!choices.length)continue;const status=choices[Math.floor(ctx.random(ctx.state)*choices.length)];applyEffect({type:'status',target:effect.target||'opponentActive',status},ctx);}break;}
      case 'allHeadsEffect':{let heads=0;const results=[];for(let i=0;i<effect.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}log({type:'coin',heads,coins:effect.coins,results});if(heads===effect.coins)applyEffect(effect.heads,ctx);break;}
      case 'coinRepeatEffect':{let heads=0;const results=[];for(let i=0;i<effect.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}log({type:'coin',heads,coins:effect.coins,results});for(let i=0;i<heads;i++)applyEffect(effect.effect,ctx);break;}
      case 'endTurn':if(typeof ctx.endTurn==='function')ctx.endTurn();break;
      case 'removeRandomStatus':for(const s of affected()){const keys=Object.keys(s.conditions||{});if(!keys.length)continue;const key=keys[Math.floor(ctx.random(ctx.state)*keys.length)];delete s.conditions[key];}break;
      case 'chainLightning':{if(ctx.isAttack&&ctx.state.stadium?.cardId==='SNAPFLORIO-112')break;const defenderType=ctx.cardById(ctx.defender?.cardId)?.types?.[0];if(!defenderType||defenderType==='Colorless')break;for(const side of [ctx.side,ctx.foeSide]){for(const slot of ctx.state.sides[side].bench||[]){if(!slot||!ctx.cardById(slot.cardId)?.types?.includes(defenderType))continue;const reduced=modifierAmount(ctx.state,side,slot,'damageReduction',ctx.cardById);const guard=attackIsPrevented(ctx.state,side,slot,ctx.attacker,ctx.cardById)||fossilTransparencyBlocks(ctx,side,slot);let amount=guard?0:Math.max(0,Number(effect.amount||10)-reduced);if(amount>0)amount=ctx.gymBenchRedirect?.(side,slot,amount)??amount;slot.damage=Number(slot.damage||0)+amount;if(amount)log({type:'benchDamage',targetSide:side,targetCardId:slot.cardId,sourceCardId:ctx.attacker?.cardId,amount,attack:ctx.attack?.name});}}break;}
      case 'benchDamage':{if(ctx.isAttack&&ctx.state.stadium?.cardId==='SNAPFLORIO-112')break;const ss=effect.side==='self'?own(ctx):other(ctx);const list=effect.all?ss.bench:targets(effect.side==='self'?'selfBench':'opponentBench',ctx);for(const s of list.filter(s=>s&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s))){const side=effect.side==='self'?ctx.side:ctx.foeSide;const guard=ctx.isAttack&&attackIsPrevented(ctx.state,side,s,ctx.attacker,ctx.cardById)||fossilTransparencyBlocks(ctx,side,s);const bonus=ctx.isAttack&&ctx.attacker?modifierAmount(ctx.state,ctx.side,ctx.attacker,'attackDamageAllTargets',ctx.cardById):0,amount=guard?0:Math.max(0,Number(effect.amount||0)+bonus-(ctx.isAttack?modifierAmount(ctx.state,side,s,'damageReduction',ctx.cardById):0));const lentalReduction=ctx.isAttack&&!guard?lentalDefenseReduction(ctx.state,side,s,ctx.cardById(ctx.attacker?.cardId),ctx.cardById):0;
        s.damage=Number(s.damage||0)+Math.max(0,amount-lentalReduction);if(ctx.isAttack&&amount>lentalReduction)log({type:'benchDamage',targetSide:side,sourceCardId:ctx.attacker?.cardId||null,targetCardId:s.cardId,benchIndex:Number(s.benchSlot||0),amount:Math.max(0,amount-lentalReduction),attack:ctx.attack?.name||'Attack'});}break;}
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
          else if(!neoSupplyTake(ctx,own(ctx),type,1))break;
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
      case 'attachEnergy':{const recipients=affected(),attachedBySide={player:0,opponent:0};for(const s of recipients){const side=pokemonOn(own(ctx)).includes(s)?ctx.side:ctx.foeSide,owner=ctx.state.sides[side];let amount=Number(effect.amount||0);
          if(effect.source==='hand'){
            amount=0;for(let i=0;i<Number(effect.amount||0);i++){
              const idx=owner.hand.findIndex(ref=>{const c=ctx.cardById(ref.cardId);return c?.basicEnergy&&c.subtype===effect.energyType;});
              if(idx<0)break;
              owner.hand.splice(idx,1);amount++;
            }
          }else if(Array.isArray(owner.energySupply))amount=neoSupplyTake(ctx,owner,effect.energyType,effect.amount);
          if(!amount)continue;s.energy[effect.energyType]=Number(s.energy[effect.energyType]||0)+amount;attachedBySide[side]+=amount;if(typeof ctx.onEnergyAttached==='function')ctx.onEnergyAttached(s,effect.energyType,amount);}log({type:'effectEnergy',amount:effect.amount,totalAmount:attachedBySide.player+attachedBySide.opponent,attachedBySide,energyType:effect.energyType});break;}
      case 'discardEnergyCard':for(const s of affected()){const owner=energyOwner(ctx,s);if(!owner)continue;const protectedByBrock=(s.temporaryTrainers||[]).some(r=>ctx.cardById(r.cardId)?.id==='gym2-101');if(protectedByBrock&&owner!==own(ctx))continue;let left=effect.amount==='all'?Object.values(s.energy||{}).reduce((n,x)=>n+Number(x||0),0)+(s.specialEnergy||[]).length:Number(effect.amount||1);while(left>0){const special=s.specialEnergy||[];const chosenUid=ctx.action?.effectSpecialEnergyUid;if(chosenUid){const index=special.findIndex(r=>r.uid===chosenUid);if(index>=0){const [ref]=special.splice(index,1);if(ref.cardId==='neo1-105'||ctx.state.stadium?.cardId==='neo1-84'&&owner!==own(ctx)&&ctx.cardById(ref.cardId)?.subtype!=='Colorless')owner.hand.push(ref);else owner.discard.push(ref);left--;continue;}}const chosenType=effect.energyType||ctx.action?.effectEnergyType;if(chosenType&&Number(s.energy?.[chosenType]||0)>0){s.energy[chosenType]--;if(ctx.state.stadium?.cardId==='neo1-84'&&owner!==own(ctx)&&chosenType!=='Colorless')neoRecoveredEnergyToHand(ctx,owner,chosenType,1);else recordDiscardedEnergy(owner,chosenType,1);left--;continue;}const generated=Object.entries(s.energy||{}).find(([,n])=>Number(n)>0);if(generated){s.energy[generated[0]]--;if(ctx.state.stadium?.cardId==='neo1-84'&&owner!==own(ctx)&&generated[0]!=='Colorless')neoRecoveredEnergyToHand(ctx,owner,generated[0],1);else recordDiscardedEnergy(owner,generated[0],1);left--;continue;}if(special.length){const ref=special.shift();if(ref.cardId==='neo1-105'||ctx.state.stadium?.cardId==='neo1-84'&&owner!==own(ctx)&&ctx.cardById(ref.cardId)?.subtype!=='Colorless')owner.hand.push(ref);else owner.discard.push(ref);left--;continue;}break;}}break;
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
      case 'discardSelf':{const slot=ctx.attacker,ss=own(ctx);if(!slot)break;for(let i=slot.stack.length-1;i>=0;i--)ss.discard.push({uid:slot.uid+'-stack-'+i,cardId:slot.stack[i]});for(const tool of toolsOf(slot))ss.discard.push(tool);for(const ref of slot.temporaryTrainers||[])ss.discard.push(ref);for(const ref of slot.specialEnergy||[])ss.discard.push(ref);for(const [type,n] of Object.entries(slot.energy||{}))recordDiscardedEnergy(ss,type,Number(n||0));if(ss.active===slot)ss.active=null;else{const index=ss.bench.indexOf(slot);if(index>=0)ss.bench.splice(index,1);}log({type:'discardPokemon',cardId:slot.cardId});break;}
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
      if(!e)return;assertEffect(e);if(ctx.ignoreUseCosts&&e.useCost)return;if(e.type==='attackRequirement'){if(!conditionMatches(e.condition,ctx)){damage=0;attackDoesNothing=true;pending.length=0;}return;}if(!conditionMatches(e.condition,ctx))return;
      if(e.type==='sequence'){for(const child of e.effects)visit(child);return;}
      if(e.type==='coinFlip'){const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,heads,results:[heads]});visit(heads?e.heads:e.tails);return;}
      if(e.type==='coinAttackGate'){const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,heads,results:[heads]});if(heads)pending.push(e.heads);else damage=0;return;}
      if(e.type==='coinAnyHeadsGate'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});if(heads===0)damage=0;return;}
      if(e.type==='topDeckDiscardBonus'){const ss=own(ctx);const ref=ss.deck.shift();if(ref){ss.discard.push(ref);const card=ctx.cardById(ref.cardId);if(matchesFilter(card,e.filter,ref))damage+=Number(e.amount||0);}return;}
      if(e.type==='damageRule'){damageRules={...damageRules,...e};return;}
      if(e.type==='neoRule'){
        const ss=own(ctx),a=ctx.attacker,foe=other(ctx),r=e.rule;
        const rolls=(n)=>{let heads=0,results=[];for(let i=0;i<Math.min(100,Math.max(0,n));i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}if(results.length)ctx.state.log.push({type:'coin',side:ctx.side,reason:'Neo Genesis '+r,heads,results});return heads;};
        switch(r){
          case 'revelation:psychicLeaf':{
            const amount=totalEnergy(ctx.defender?.energy||{})+(ctx.defender?.specialEnergy||[]).length;
            damage=10+10*rolls(amount);
            // Drain is based on the *actual* damage dealt after Weakness,
            // Resistance and modifiers, not on the printed attack value.
            pending.push({type:'drain'});
            return;
          }
          case 'revelation:present':{
            const heads=rolls(3);
            if(heads===1)damage=40;
            else if(heads===3)damage=60;
            else {damage=0;pending.push({type:'heal',target:'opponentActive',amount:heads===2?30:999});}
            return;
          }
          case 'revelation:needleStorm':{
            let heads=0,results=[];
            for(let i=0;i<100;i++){const hit=coin(ctx);results.push(hit);if(!hit)break;heads++;}
            ctx.state.log.push({type:'coin',side:ctx.side,reason:'Needle Storm',heads,results});
            damage=heads*20;
            return;
          }
          case 'discovery:electricBolt':{
            const locked=!!a?.neoLockOn&&a.neoLockOn.uid===a.uid&&a.neoLockOn.turn===ctx.state.turnNumber;
            const heads=rolls(2);if(heads===2||locked){pending.push({type:'status',target:'opponentActive',status:'paralysis'});}else{damage=0;attackDoesNothing=true;pending.length=0;}
            if(a)delete a.neoLockOn;return;
          }
          case 'discovery:sketch':{
            const observed=ss.neoObservedAttack;
            if(!observed||observed.turn!==ctx.state.turnNumber-1||!observed.witnesses?.includes(a?.uid)||Number(ctx.copyDepth||0)>=3){damage=0;return;}
            const source=ctx.cardById(observed.cardId)?.attacks?.[observed.attackIndex];
            if(!source||source.name==='Sketch'){damage=0;return;}
            const result=resolveAttack(source,{...ctx,attack:source,ignoreUseCosts:true,copyDepth:Number(ctx.copyDepth||0)+1});
            damage=result.damage;pending.push(...result.pendingEffects);damageRules={...result.damageRules};damageTarget=result.damageTarget;
            ctx.state.log.push({type:'copyAttack',side:ctx.side,reason:'Smeargle Sketch',attack:source.name});return;
          }
          case 'discovery:shockwave':{
            if(rolls(1))pending.push(e);damage=0;return;
          }
          case 'discovery:hyperReverse':{
            damage=10*(totalEnergy(ctx.defender?.energy||{})+(ctx.defender?.specialEnergy||[]).length);
            pending.push(e);return;
          }
          case 'discovery:plunder':{
            const target=ctx.defender;if(target){for(const ref of [...toolsOf(target),...(target.temporaryTrainers||[])])foe.discard.push(ref);target.tool=null;target.extraTools=[];target.temporaryTrainers=[];}return;
          }
          case 'discovery:burst':{
            if(rolls(1)){pending.push({type:'selfDamage',amount:40});for(const side of ['self','opponent'])for(const slot of (side==='self'?ss:foe).bench)slot.damage=Number(slot.damage||0)+neoDiscoveryReduction(ctx.state,side==='self'?ctx.side:ctx.foeSide,ctx.side,a,10,ctx.cardById);}
            if(rolls(1)===0){damage=0;attackDoesNothing=true;}return;
          }
          case 'discovery:falseSwipe':{
            const max=ctx.maxHp?ctx.maxHp(ctx.foeSide,ctx.defender):Number(ctx.cardById(ctx.defender?.cardId)?.hp||0);
            damage=Math.floor(Math.max(0,max-Number(ctx.defender?.damage||0))/20)*10;return;
          }
          case 'discovery:hydrocutter':{
            const count=Math.min(3,totalEnergy(a?.energy||{})+(a?.specialEnergy||[]).length);
            damage=40*rolls(count);return;
          }
          case 'discovery:spikeBarrage':{
            const count=Number(a?.energy?.Water||0);
            damage=20+20*rolls(count);return;
          }
          case 'discovery:workTogether':{
            const family=new Set(['Omanyte','Omastar','Kabuto','Kabutops']);
            if(rolls(1))damage+=10*(ss.bench||[]).filter(p=>family.has(ctx.cardById(p.cardId)?.name)).length;
            return;
          }
          case 'chomp':damage+=10*rolls(Math.floor(Number(a?.damage||0)/10));return;
          case 'riptide':damage=10+10*(Number(ss.energyDiscard?.Water||0)+ss.discard.filter(ref=>ctx.cardById(ref.cardId)?.basicEnergy&&ctx.cardById(ref.cardId)?.subtype==='Water').length);pending.push({type:'neoRule',rule:'riptideReturn'});return;
          case 'discharge':{const n=Number(a?.energy?.Lightning||0);damage=30*rolls(n);if(n){a.energy.Lightning=0;recordDiscardedEnergy(ss,'Lightning',n);}return;}
          case 'finSlap':if(a?.lastDamageSource?.attack&&a.lastDamageSource.side===ctx.foeSide&&a.lastDamageSource.turn===ctx.state.turnNumber-1)damage+=10;return;
          case 'fireWind':case 'mudSplash':pending.push(e);return;
          default:pending.push(e);return;
        }
      }
      if(e.type==='gymRule'){
        const rule=e.rule;
        if(rule.startsWith('challenge:')){
          const id=rule.slice(10),ss=own(ctx),foe=other(ctx),slot=ctx.attacker;
          const flip=()=>{const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:rule,heads,results:[heads]});return heads;};
          const rolls=(n)=>{const results=Array.from({length:n},flip);return results.filter(Boolean).length;};
          const add=(n)=>{damage+=Math.max(0,n);};
          const miss=()=>{damage=0;attackDoesNothing=true;pending.length=0;};
          switch(id){
            case 'hyperNeedle':slot.gym2UsedAttacks=slot.gym2UsedAttacks||{};slot.gym2UsedAttacks['Hyper Needle']=true;if(!flip())miss();break;
            case 'ancestralMemory':slot.gym2UsedAttacks=slot.gym2UsedAttacks||{};slot.gym2UsedAttacks['Ancestral Memory']=true;if(!flip())miss();break;
            case 'dittoPound':damage=slot?.gym2GiantGrowth?30:10;break;
            case 'giantGrowth':pending.push(e);break;
            case 'kerzap':pending.push(e);break;
            case 'electroburn':pending.push({type:'selfDamage',amount:10*Object.values(slot?.energy||{}).reduce((v,n)=>v+Number(n||0),0)});break;
            case 'earthdrill':if(!slot?.gym2LieLowTurn||ctx.state.turnNumber-slot.gym2LieLowTurn!==2)miss();break;
            case 'loveLariat':if(!flip())miss();else if(ss.bench.some(p=>ctx.cardById(p.cardId)?.name==="Giovanni's Nidoking"))add(50);break;
            case 'poisonPower':if(slot?.conditions?.poison){add(20);pending.push({type:'status',status:'poison',target:'opponentActive'});}break;
            case 'riskyAttack':if(!flip()){miss();pending.push({type:'selfDamage',amount:100});}break;
            case 'powerBall':add(10*rolls(3));break;
            case 'pendulumCurse':damage=20*rolls(Math.min(30,Math.floor(Number(ctx.defender?.damage||0)/10)));break;
            case 'pulledPunch':damage=Number(ctx.defender?.damage||0)>0?10:40;break;
            case 'furyPunch':damage=flip()?20*Math.floor(Number(slot?.damage||0)/10):0;break;
            case 'groupAttack':damage=10*[ss.active,...ss.bench].filter(p=>p&&ctx.cardById(p.cardId)?.name==="Koga's Zubat").length;pending.push(e);break;
            case 'mistyESP':{
              const heads=rolls(3);damage=heads===2?20:0;
              if(heads===3&&ctx.defender&&Number(ctx.copyDepth||0)<4){
                const available=ctx.cardById(ctx.defender.cardId)?.attacks||[],chosen=available[Number(ctx.action?.choiceAttackIndex)]||available[0];
                if(chosen){const copy=resolveAttack(chosen,{...ctx,attack:chosen,copyDepth:Number(ctx.copyDepth||0)+1});damage=copy.damage;damageTarget=copy.damageTarget;damageRules={...damageRules,...copy.damageRules};pending.push(...copy.pendingEffects);ctx.state.log.push({type:'copyAttack',side:ctx.side,reason:'Misty ESP',attack:chosen.name});}
              }
              pending.push({...e,heads});break;}
            case 'summonStorm':if(rolls(2)===2)pending.push(e);break;
            case 'dragonTornado':pending.push(e);break;
            case 'noNextTurn':pending.push(e);break;
            case 'intimidate':pending.push(e);break;
            case 'superRemoval':pending.push({type:'coinFlip',heads:e});break;
            case 'overheadToss':pending.push(e);break;
            case 'damageShift':pending.push(e);break;
            case 'lunarPower':pending.push({type:'coinFlip',heads:e});break;
            case 'falseCharity':pending.push({type:'coinFlip',heads:e});break;
            case 'toxicSecretion':pending.push({type:'coinFlip',heads:e});break;
            case 'toxicCloud':pending.push({type:'coinFlip',heads:e});break;
            case 'focusDoubleEdge':pending.push(e);break;
            case 'doubleEdge':if(slot?.gym2FocusTurn===ctx.state.turnNumber-2)damage=80;pending.push(e);break;
            case 'invigorate':pending.push(e);break;
            case 'helpingHand':pending.push(e);break;
            case 'magicDarts':pending.push({...e,heads:rolls(3)});break;
            case 'pranks':pending.push({type:'coinFlip',heads:e});break;
            case 'callFire':pending.push({...e,heads:rolls(3)});break;
            case 'bubbles':if(!flip())slot.gym2BubblesLockTurn=ctx.state.turnNumber+2;break;
            case 'amnesia':pending.push(e);break;
            case 'randomESP':if(flip())pending.push({type:'status',status:'confusion',target:'opponentActive'});else {miss();pending.push({type:'status',status:'confusion',target:'self'});}break;
            case 'energySupport':pending.push(e);break;
            case 'growth':pending.push({type:'coinFlip',heads:e});break;
            case 'messenger':pending.push(e);break;
            default:pending.push(e);break;
          }
          return;
        }
        if(rule==='challengeJuxtapose'){
          const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:rule,heads,results:[heads]});
          if(heads&&ctx.attacker&&ctx.defender){const count=Number(ctx.attacker.damage||0);ctx.attacker.damage=Number(ctx.defender.damage||0);ctx.defender.damage=count;}
          return;
        }
        if(rule==='challengeBonfire'){
          const results=[coin(ctx),coin(ctx),coin(ctx)],heads=results.filter(Boolean).length;
          ctx.state.log.push({type:'coin',side:ctx.side,reason:rule,heads,coins:3,results});
          const fire=Math.max(0,Number(ctx.attacker?.energy?.Fire||0));
          if(fire<heads){damage=0;attackDoesNothing=true;return;}
          damage=heads*10;damageRules={...damageRules,ignoreWeakness:true,ignoreResistance:true};
          if(heads){pending.push({type:'discardEnergyCard',target:'self',energyType:'Fire',amount:heads});pending.push({type:'benchDamage',side:'opponent',all:true,amount:heads*10});}
          return;
        }
        if(rule==='lavaBurst'){
          const ss=own(ctx),refs=ss.deck.splice(0,Math.min(5,ss.deck.length));ss.discard.push(...refs);
          damage=refs.filter(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype==='Fire').length*20;
          ctx.state.log.push({type:'gymEffect',side:ctx.side,rule,discarded:refs.map(r=>r.cardId),damage});return;
        }
        if(rule==='eggBomb'){
          const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:rule,heads,results:[heads]});
          if(!heads){damage=0;pending.push({type:'selfDamage',amount:20});}return;
        }
        if(rule==='fullSpeedCharge'){
          const rolls=Array.from({length:4},()=>coin(ctx)),heads=rolls.filter(Boolean).length;
          ctx.state.log.push({type:'coin',side:ctx.side,reason:rule,heads,coins:4,results:rolls});
          damage=20*heads;pending.push({type:'selfDamage',amount:20*(4-heads)});return;
        }
        if(rule==='flytrap'){
          const index=ctx.action?.benchIndex,foe=other(ctx);
          if(!foe.bench.some(slot=>slot&&Number(slot.benchSlot)===Number(index))) {damage=0;attackDoesNothing=true;return;}
          switchPokemon(foe,index,ctx.state);ctx.defender=foe.active;
          ctx.state.log.push({type:'gymEffect',side:ctx.side,rule,benchIndex:index});return;
        }
        if(rule==='karateChop'){damage=Math.max(0,40-Number(ctx.attacker?.damage||0));return;}
        if(rule==='ignoreResistance'){damageRules={...damageRules,ignoreResistance:true};return;}
      }

      if(e.type==='lentalRule'){
        const rule=e.rule;
        if(rule==='majesticLeap112'){
          const results=[coin(ctx),coin(ctx)],heads=results.filter(Boolean).length;
          ctx.state.log.push({type:'coin',side:ctx.side,reason:'Majestic Leap',heads,coins:2,results});
          damage=heads===2?100:0;
          if(heads<2)pending.push({type:'selfDamage',amount:40});
          return;
        }
        if(rule==='endeavorousFlight112'){
          const n=own(ctx).discard.length;
          damage=n>20?0:10+n*10;return;
        }
        if(rule==='unfairFight112'){
          const ours=pokemonOn(own(ctx)).length,theirs=pokemonOn(other(ctx)).length;
          if(theirs>ours)damage+=100;return;
        }
        if(rule==='beakInvasion112'){
          const foe=other(ctx),want=Number(ctx.action?.choiceOption);
          if(!Number.isInteger(want)||want<0||want>5)throw new Error('Choose 0-5 cards for Beak Invasion.');
          const discarded=foe.deck.splice(0,Math.min(want,foe.deck.length));
          foe.discard.push(...discarded);
          damage=Math.max(0,200-20*discarded.length);
          ctx.state.log.push({type:'discardDeck',side:ctx.foeSide,reason:'Beak Invasion',count:discarded.length});return;
        }
        if(rule==='shortCircuit112'){lentalRule112(e,ctx);return;}
        if(rule==='furiousJab111'){
          const hp=Number(ctx.cardById(ctx.attacker?.cardId)?.hp||0)-Number(ctx.attacker?.damage||0);
          const coins=hp<=60?6:3,results=Array.from({length:coins},()=>coin(ctx));
          const heads=results.filter(Boolean).length;
          ctx.state.log.push({type:'coin',side:ctx.side,reason:'Furious Jab',coins,heads,results});
          damage=heads*20;return;
        }
        if(rule==='bidoofGnaw111'){
          if(ctx.cardById(ctx.defender?.cardId)?.types?.includes('Fighting'))damage+=40;
          return;
        }
        if(rule==='noToolBonus'){
          if(!ctx.attacker?.tool&&!(ctx.attacker?.extraTools||[]).length)damage+=30;
          return;
        }
        if(rule==='terrainStomp'){
          if(ctx.state.stadium){damage+=130;pending.push({type:'discardStadium'});}
          return;
        }
        if(rule==='wickedFlock'){
          const foeBoard=other(ctx),chosen=ctx.action?.target==='opponentBench'
            ?foeBoard.bench.find(slot=>Number(slot.benchSlot)===Number(ctx.action?.benchIndex))
            :foeBoard.active;
          if(!chosen){damage=0;return;}
          damageTarget=chosen;
          damage=10*(own(ctx).bench||[]).filter(slot=>ctx.cardById(slot.cardId)?.name==='Murkrow').length;
          return;
        }
        if(['surpriseAttack','fungalFever'].includes(rule)){
          const results=rule==='surpriseAttack'?[coin(ctx)]:[coin(ctx),coin(ctx)],heads=results.filter(Boolean).length;
          ctx.state.log.push({type:'coin',side:ctx.side,reason:'Lental '+rule,heads,results});
          if(rule==='surpriseAttack'&&heads===1)damage=0;
          if(rule==='fungalFever'){
            if(heads===0)damage=0;
            if(heads===2){pending.push({type:'status',target:'opponentActive',status:'paralysis'});pending.push({type:'status',target:'opponentActive',status:'poison'});}
          }
          return;
        }
        if(rule==='wurmpleStartle'){if(Number(ctx.attacker?.damage||0)===0)damage=0;return;}
        if(rule==='shallowSplash'){
          const n=totalEnergy(ctx.attacker?.energy||{})+(ctx.attacker?.specialEnergy||[]).length;
          if(n>1)damage=0;
          return;
        }
        pending.push(e);return;
      }
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
        const copied=resolveAttack(chosen,{...ctx,attack:chosen,copyDepth:Number(ctx.copyDepth||0)+1,ignoreUseCosts:!!e.ignoreUseCosts});damage=copied.damage;damageTarget=copied.damageTarget;damageRules={...damageRules,...copied.damageRules};pending.push(...copied.pendingEffects);return;
      }
      if(e.type==='selectedDamage'){damage=e.amount;damageTarget=targets(e.target,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s))[0]||null;if(!damageTarget)damage=0;return;}
      if(e.type==='selectedEnergyDamage'){damageTarget=targets(e.target,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s))[0]||null;damage=damageTarget?totalEnergy(damageTarget.energy)*e.amount:0;return;}
      if(e.type==='bonusDamage')amount=e.amount;
      else if(e.type==='coinDamage'){let heads=0,coins=e.coins==='untilTails'?e.coins:Number(e.coins||0)+coinBonusAmount(ctx.state,ctx.side,ctx.attacker,ctx.attack?.name,ctx.cardById),results=[];if(coins!=='untilTails'&&e.extraCoinsIfTool&&toolsOf(ctx.attacker).some(t=>ctx.cardById(t.cardId)?.name===e.extraCoinsIfTool.name))coins+=Number(e.extraCoinsIfTool.amount||0);if(coins==='untilTails')heads=repeatHeads(ctx,()=>{},results);else for(let i=0;i<coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins,results});amount=heads*e.amount;}
      else if(e.type==='coinDiscardEnergyDamage'){let heads=0,discarded=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}for(let i=0;i<heads&&Number(ctx.attacker?.energy?.[e.energyType]||0)>0;i++){ctx.attacker.energy[e.energyType]--;recordDiscardedEnergy(own(ctx),e.energyType,1);discarded++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});amount=discarded*e.amount;}
      else if(e.type==='coinTierBonus'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});amount=Number(e.tiers?.[heads]||0);}
      else if(e.type==='coinDamageStatus'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});amount=heads*e.amount;if(heads>=e.minHeads)pending.push({type:'status',target:'opponentActive',status:e.status});}
      else if(e.type==='coinRepeatEffect'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});if(heads===0&&e.zeroDamageIfNoHeads)damage=0;for(let i=0;i<heads;i++)pending.push(e.effect);return;}
      else if(e.type==='energyDamage'){const list=e.all?pokemonOn(e.source==='opponent'?other(ctx):own(ctx)):[e.source==='opponent'?ctx.defender:ctx.attacker].filter(Boolean);const count=s=>{if(e.countCards)return totalEnergy(s.energy)+(s.specialEnergy||[]).length;const pool=typeof ctx.effectiveEnergy==='function'?ctx.effectiveEnergy(s):s.energy||{};return e.energyType?Number(pool?.[e.energyType]||0):Array.isArray(e.energyTypes)?e.energyTypes.reduce((n,t)=>n+Number(pool?.[t]||0),0):totalEnergy(pool);};let counted=Math.max(0,list.reduce((n,s)=>n+count(s),0)-Number(e.extraAbove||0));if(e.maxCount!=null)counted=Math.min(counted,Number(e.maxCount));amount=counted*e.amount;}
      else if(e.type==='benchCountDamage'){const list=e.side==='both'?[...own(ctx).bench,...other(ctx).bench]:(e.side==='opponent'?other(ctx):own(ctx)).bench;amount=list.filter(s=>s&&(!e.pokemonType||hasType(ctx.cardById(s.cardId),e.pokemonType))&&matchesFilter(ctx.cardById(s.cardId),e.filter,s)).length*e.amount;}
      else if(e.type==='mirrorLastAttackResult'){const result=ctx.attacker?.lastAttackResult;if(!result||Number(result.turn)!==Number(ctx.state.turnNumber)-1){amount=0;}else{amount=Number(result.damage||0);damageRules.ignoreWeakness=true;pending.push({type:'replayAttackResult',result:{conditions:result.conditions||{},energyCardsDiscarded:Number(result.energyCardsDiscarded||0),attackGate:result.attackGate||null,locks:result.locks||[],weaknessOverride:result.weaknessOverride??null,resistanceOverride:result.resistanceOverride??null}});} }
      else if(e.type==='remainingHpFractionDamage'){const max=ctx.maxHp?ctx.maxHp(ctx.foeSide,ctx.defender):Number(ctx.cardById(ctx.defender?.cardId)?.hp||0),remaining=Math.max(0,max-Number(ctx.defender?.damage||0)),unit=Math.max(1,Number(e.roundTo||10));amount=Math.ceil((remaining/Math.max(1,Number(e.divisor||2)))/unit)*unit;}
      else if(e.type==='damageFromDamage')amount=Number((e.source==='self'?ctx.attacker:ctx.defender)?.damage||0)*e.amount;
      else if(e.type==='statusDamage')amount=ctx.defender?.conditions?.[e.status]?e.amount:0;
      else if(e.type==='allHeadsBonus'){let heads=0;const results=[];for(let i=0;i<e.coins;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins,results});amount=heads===e.coins?e.amount:0;}
      else if(e.type==='pointDamage')amount=Number((e.side==='opponent'?other(ctx):own(ctx)).points||0)*e.amount;
      else if(e.type==='namedAttackCountDamage'){const cards=[...pokemonOn(own(ctx)).map(s=>ctx.cardById(s.cardId)),...(own(ctx).hand||[]).map(r=>ctx.cardById(r.cardId))];amount=cards.filter(c=>(c?.attacks||[]).some(a=>a.name===e.attackName)).length*e.amount;}
      else if(e.type==='usedAttackCountDamage')amount=Number(own(ctx).attackCounts?.[e.attackName]||0)*e.amount;
      else if(e.type==='coinDamageByPokemon'){const count=(e.benchOnly?own(ctx).bench:pokemonOn(own(ctx))).filter(s=>!e.filter||matchesFilter(ctx.cardById(s.cardId),e.filter,s)).length;let heads=0;const results=[];for(let i=0;i<count;i++){const hit=coin(ctx);results.push(hit);if(hit)heads++;}ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:count,results});amount=heads*e.amount;}
      else if(e.type==='retreatCostDamage')amount=(ctx.retreatCost?ctx.retreatCost(ctx.foeSide):Number(ctx.cardById(ctx.defender?.cardId)?.retreat||0))*e.amount;
      else if(e.type==='toolCountDamage')amount=pokemonOn(own(ctx)).reduce((n,s)=>n+toolsOf(s).length,0)*e.amount;
      else if(e.type==='coinDamageByEnergy'){const count=e.countCards?totalEnergy(ctx.attacker?.energy)+(ctx.attacker?.specialEnergy||[]).length:e.energyType?Number(ctx.attacker?.energy?.[e.energyType]||0):totalEnergy(ctx.attacker?.energy),results=Array.from({length:count},()=>coin(ctx)),heads=results.filter(Boolean).length;ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:count,results});if(e.discardHeads&&e.energyType&&heads){const available=Number(ctx.attacker?.energy?.[e.energyType]||0),spent=Math.min(available,heads);ctx.attacker.energy[e.energyType]=available-spent;recordDiscardedEnergy(own(ctx),e.energyType,spent);}amount=heads*e.amount;}
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
    assertEffect(effect);if(!effect)return [{}];if(effect.type==='attackRequirement')return conditionMatches(effect.condition,ctx)?[{}]:[];if(!conditionMatches(effect.condition,ctx))return ctx.isAttack?[{}]:[];
    if(effect.type==='chooseDiscardForBonus'){const items=effect.zone==='bench'?(own(ctx).bench||[]).filter(s=>s&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s)):(own(ctx).hand||[]).filter(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter,r));const max=Math.min(Number(effect.max||items.length),items.length),out=[];for(let mask=0;mask<(1<<items.length);mask++){const picked=[];for(let i=0;i<items.length;i++)if(mask&(1<<i))picked.push(items[i].uid);if(picked.length<=max)out.push({effectSelection:picked.join(','),choiceLabel:`Discard ${picked.length}`});}return out;}
    if(effect.type==='lentalRule'){
      const rule=effect.rule,ss=own(ctx);
      if(rule==='standoffRevised')return ['player','opponent'].every(w=>ctx.state.sides[w].active&&ctx.state.sides[w].bench.length>=3)?[{}]:[];
      if(rule==='beakInvasion112'){
        const n=Math.min(5,other(ctx).deck.length);
        return Array.from({length:n+1},(_,choiceOption)=>({choiceOption,choiceLabel:`Discard ${choiceOption} cards`}));
      }
      if(rule==='voltSwitch112'){
        const ene=ctx.attacker&&(ctx.effectiveEnergy?.(ctx.attacker)||ctx.attacker.energy||{});
        return Number(ene?.Lightning||0)>0?[...targetChoices('selfBench',ctx),{}]:[{}];
      }
      if(rule==='wickedFlock111')return targetChoices('opponentPokemon',ctx);
      if(rule==='waterFountain111'&&(ss.waterFountainUsedTurn===ss.turnCount||Number(ctx.attacker?.energy?.Water||0)<=0))return [];
      if(rule==='slumberParty111'&&(ss.active?.conditions?.sleep||!ctx.attacker||!Object.values(ctx.attacker.energy||{}).some(n=>Number(n)>0)))return [];
      if(rule==='mindsEye111'&&!ss.deck.length)return [];
      if(rule==='healingCircle111')return targetChoices('selfBench',ctx).filter(choice=>ss.bench.some(p=>Number(p.benchSlot)===Number(choice.benchIndex)&&Number(p.damage||0)>0)).concat(ss.bench.some(p=>Number(p.damage||0)>0)?[]:[{}]);
      if(rule==='wickedFlock')return targetChoices('opponentPokemon',ctx);
      if(rule==='zappedFluffruit')return targetChoices('selfPokemon',ctx).filter(option=>{
        const slot=option.target==='active'?ss.active:ss.bench.find(x=>Number(x.benchSlot)===Number(option.benchIndex));return Number(slot?.damage||0)>0;
      });
      if(rule==='retrieveDarkEnergy'&&neoDiscardAvailable(ctx,ss,'Darkness')<1)return [];
      if(rule==='pastureFields'&&!(ss.energySupply||[]).length)return [];
      if(rule==='crystalbloom'&&(ss.bench.length>=Number(ss.benchLimit||3)||!ss.deck.some(ref=>matchesFilter(ctx.cardById(ref.cardId),{kind:'pokemon',stage:'Basic',nameContains:'Illumina'}))))return [];
      if(rule==='compoundEyesTrainer'&&!ss.discard.some(ref=>ctx.cardById(ref.cardId)?.kind==='trainer'))return [];
      if(rule==='compoundEyes'&&!ss.discard.length)return [];
      if(rule==='fallenBerries'&&!ss.bench.some(s=>s.damage>0))return [];
      return [{}];
    }
    if(effect.type==='neoRule'&&effect.rule.startsWith('discovery:')){
      const r=effect.rule.slice('discovery:'.length),ss=own(ctx),foe=other(ctx),mine=pokemonOn(ss),hasUnown=name=>mine.some(x=>ctx.cardById(x.cardId)?.name===`Unown [${name}]`);
      if(r==='unownFind')return ['F','I','N','D'].every(hasUnown)&&ss.deck.some(ref=>ctx.cardById(ref.cardId)?.kind==='trainer')?[{}]:[];
      if(r==='unownUndo')return ['U','N','D','O'].every(hasUnown)&&!!ss.active?[{}]:[];
      if(r==='gaze')return foe.bench.some(x=>ctx.cardById(x.cardId)?.abilities?.length)?[{}]:[];
      if(r==='reviveFriends')return ss.bench.length<ss.benchLimit&&ss.deck.some(ref=>ctx.cardById(ref.cardId)?.name==='Kabuto')?[{}]:[];
      if(r==='reviveFossil')return ss.bench.length<ss.benchLimit&&ss.deck.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom==='Mysterious Fossil')?[{}]:[];
      if(r==='unownObserve')return foe.deck.length?[{}]:[];
      if(r==='ruinWall')return ss.bench.length<ss.benchLimit&&ss.deck.some(ref=>String(ctx.cardById(ref.cardId)?.name||'').startsWith('Unown ['))?[{}]:[];
      if(r==='hyperDevolution')return mine.some(x=>(x.stack||[]).length>1)?[{}]:[];
      if(r==='fossilEgg')return ss.bench.length<ss.benchLimit&&(ss.deck.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom==='Mysterious Fossil')||ss.hand.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom==='Mysterious Fossil'))?[{}]:[];
    }
    if(effect.type==='neoRule'&&['fireWind','mudSplash'].includes(effect.rule))return targetChoices('opponentBench',ctx).length?targetChoices('opponentBench',ctx):[{}];
    if(effect.type==='gymRule'){const r=effect.rule,ss=own(ctx),foe=other(ctx),card=ref=>ctx.cardById(ref.cardId);
      if(r.startsWith('challenge:')){
        const name=r.slice(10),mine=pokemonOn(ss),theirs=pokemonOn(foe),named=prefix=>mine.some(p=>String(card(p)?.name||'').startsWith(prefix));
        if(name==='shapeshift'&&!ss.hand.some(ref=>['Stage 1','Stage 2'].includes(card(ref)?.stage)))return [];
        if(name==='brockProtection'&&!named("Brock's"))return [];
        if(name==='blaine'&&(ss.energyUsed||!ss.energyAvailable||!named("Blaine's")))return [];
        if(name==='sabrina'&&mine.filter(p=>String(card(p)?.name||'').startsWith("Sabrina's")).length<2)return [];
        if(name==='giovanniLastResort'&&!named("Giovanni's"))return [];
        if(name==='maxRevive'&&(ss.bench.length>=ss.benchLimit||ss.hand.filter(ref=>card(ref)?.basicEnergy).length<2||!ss.discard.some(ref=>card(ref)?.stage==='Basic')))return [];
        if(name==='mistyTears'&&!ss.hand.length)return [];
        if(name==='fuchsiaGym'&&!named("Koga's"))return [];
        if(name==='saffronGym'&&!mine.some(p=>String(card(p)?.name||'').startsWith("Sabrina's")&&totalEnergy(p.energy)>0))return [];
        if(name==='ninjaTrick'&&(!ss.active||!String(card(ss.active)?.name||'').startsWith("Koga's")))return [];
        if(name==='surgeSecretPlan'&&(ss.bench.length>=ss.benchLimit||!ss.hand.length))return [];
        if(name==='blainesQuiz3'&&!ss.hand.some(ref=>card(ref)?.kind==='pokemon'))return [];
        if(name==='warpPoint'&&!ss.bench.length&&!foe.bench.length)return [];
        if(name==='mistyESP'){const attacks=ctx.cardById(foe.active?.cardId)?.attacks||[];return attacks.length?attacks.map((attack,choiceAttackIndex)=>({choiceAttackIndex,choiceLabel:`Copy ${attack.name} on three heads`})):[{}];}
      }
if(r==='lastResort')return ss.hand.length===0?[{}]:[];if(r==='surgeSwap')return ss.active&&ss.bench.length<Number(ss.benchLimit||3)&&ss.hand.some(x=>card(x)?.kind==='pokemon'&&card(x)?.stage==='Basic')?[{}]:[];if(r==='mistyBoost'||r==='erikasMaids')return ss.hand.length>=2?[{}]:[];if(r==='goodManners')return !ss.hand.some(x=>card(x)?.kind==='pokemon'&&card(x)?.stage==='Basic')&&ss.deck.some(x=>card(x)?.kind==='pokemon'&&card(x)?.stage==='Basic')?[{}]:[];if(r==='erikaDraw'&&ss.deck.length===0&&foe.deck.length===0)return [];if(r==='flytrap')return targetChoices('opponentBench',ctx);if(r==='energyLoop')return Number(ctx.attacker?.energy?.Psychic||0)>0?[{}]:[];if(r==='kindle')return totalEnergy(ctx.attacker?.energy)>0?[{}]:[];if(r==='jellyfishPod')return [{}];if(r==='energyFlow')return pokemonOn(ss).some(p=>totalEnergy(p.energy)>0||(p.specialEnergy||[]).length>0)?[{}]:[];if(r==='sabrinasEsp')return pokemonOn(ss).some(x=>String(card(x)?.name||'').startsWith("Sabrina's"))?[{}]:[];return [{}];}
    if(effect.type==='selfKoAttachAsEnergy')return ctx.attacker&&pokemonOn(own(ctx)).some(slot=>slot!==ctx.attacker)?[{}]:[];
    if(effect.type==='benchBasicsFromOpponentHand')return (other(ctx).bench||[]).filter(Boolean).length<3&&(other(ctx).hand||[]).some(r=>{const card=ctx.cardById(r.cardId);return card?.kind==='pokemon'&&card?.stage==='Basic';})?[{}]:[];
    if(['mirrorLastAttackResult','replayAttackResult','reorderTop','redistributeEnergy','redistributeDamage','chooseAttackLock','chooseTypeOverride','tradeHandForDeck','energyRetrieval','multiEnergyRemoval','distributeDiscardEnergyDistinct'].includes(effect.type))return [{}];
    if(effect.type==='optionalDiscardBenchBonus'){const choices=targetChoices('selfBench',ctx).filter(action=>targets('selfBench',{...ctx,action}).some(slot=>matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot)));return [...choices,{choiceSkip:true}];}
    if(effect.type==='moveRandomEnergy'&&effect.source==='opponentBench')return targetChoices('opponentBench',ctx).filter(action=>targets('opponentBench',{...ctx,action}).some(slot=>totalEnergy(slot.energy)>0));
    if(effect.type==='stadiumAction')return choicesForEffect(effect.effect,ctx);
    if(effect.type==='scheduleDelayed'&&effect.targetMode==='selectedSpot')return targetChoices('opponentPokemon',ctx);
    if(effect.type==='multiTargetDamage')return [{}];
    if(effect.type==='copyAttack'){
      const ss=effect.source==='selfBench'?own(ctx):other(ctx),slots=effect.source==='opponentActive'?[ss.active].filter(Boolean):effect.source==='selfBench'?(ss.bench||[]).filter(Boolean):pokemonOn(ss),out=[];
      for(const slot of slots){const card=ctx.cardById(slot.cardId);if(effect.excludeEx&&(card?.isEx||card?.points>=2||/ ex$/.test(card?.name||'')))continue;for(const [attackIndex,attack] of (card?.attacks||[]).entries()){if(effect.requiresCopiedCost&&typeof ctx.canPayCopiedCost==='function'&&!ctx.canPayCopiedCost(attack))continue;const depth=Number(ctx.choiceDepth||0);const nested=depth>=2?[{}]:choicesForEffect(attack.effect,{...ctx,attack,choiceDepth:depth+1});const bases=nested.length?nested:[{}];for(const sub of bases)out.push({...sub,choiceTarget:slot===ss.active?'active':'bench',choiceBenchIndex:slot.benchSlot,choiceCardId:slot.cardId,choiceAttackIndex:attackIndex});}}
      if(out.length)return out;
      return effect.requiresCopiedCost?[]:(ctx.isAttack?[{}]:[]);
    }
    if(effect.type==='scoopUp'||effect.type==='devolutionSpray'){const selector=effect.target||'selfPokemon';return targetChoices(selector,ctx).filter(action=>targets(selector,{...ctx,action}).some(slot=>effect.type==='devolutionSpray'?(slot.stack||[]).length>1:true));}
    if(effect.type==='chooseTarget'){
      return targetChoices(effect.target,ctx).filter(action=>targets(effect.target,{...ctx,action}).some(slot=>matchesFilter(ctx.cardById(slot.cardId),effect.filter,slot)));
    }
    if(effect.type==='discardChosenHand'||effect.type==='shuffleChosenHand'){const ss=effect.side==='opponent'?other(ctx):own(ctx),needed=Math.max(1,Number(effect.amount||1)),count=ss.hand.filter(r=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter,r)).length;return count>=needed?[{}]:[];}
    if(['forceOpponentSwitch','searchChosen','selectTopToHand','swapHandWithRandomDeck','discardBenchPokemon','chooseOption','shuffleHandMatching','pokemonCenter'].includes(effect.type))return [{}];
    if(effect.type==='coinUntilTails'||effect.type==='coinRepeatEffect')return choicesForEffect(effect.effect,ctx);
    if(effect.type==='discardEnergyCard'){const selector=effect.target||'self';return targetChoices(selector,ctx).flatMap(action=>{const list=targets(selector,{...ctx,action}).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.filter,s)),out=[];for(const slot of list){const count=Object.values(slot.energy||{}).reduce((n,x)=>n+Number(x||0),0)+(slot.specialEnergy||[]).length,needed=effect.amount==='all'?1:Number(effect.amount||1);if(count<needed)continue;for(const [type,n] of Object.entries(slot.energy||{}))if(Number(n)>0&&(!effect.energyType||type===effect.energyType))out.push({...action,effectEnergyType:type});for(const ref of slot.specialEnergy||[]){const card=ctx.cardById(ref.cardId),provides=ref?.provides||card?.effect?.provides||{};if(!effect.energyType||Number(provides[effect.energyType]||0)>0)out.push({...action,effectSpecialEnergyUid:ref.uid});}}return out;});}
    if(effect.type==='discardEnergy'&&!effect.energyType&&!effect.random){const selector=effect.target||'self';return targetChoices(selector,ctx).flatMap(action=>{const list=targets(selector,{...ctx,action}).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.filter,s)),types=new Set();for(const slot of list)for(const [type,n] of Object.entries(slot.energy||{}))if(Number(n)>0)types.add(type);return [...types].map(type=>({...action,effectEnergyType:type}));});}
    if(effect.type==='attachEnergyFromDiscard'&&!effect.energyType){const selector=effect.target||'self';return targetChoices(selector,ctx).flatMap(action=>{const list=targets(selector,{...ctx,action}).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.filter,s));if(!list.length)return[];const owner=own(ctx),types=[...new Set([...Object.keys(owner.energyDiscard||{}),...(owner.discard||[]).map(ref=>ctx.cardById(ref.cardId)).filter(c=>c?.basicEnergy).map(c=>c.subtype)])].filter(type=>neoDiscardAvailable(ctx,owner,type)>=Number(effect.amount||1));return types.map(type=>({...action,effectEnergyType:type}));});}
    if(effect.type==='moveEnergy'){const selector=effect.source==='selfBench'?'selfBench':effect.target;let choices=targetChoices(selector,ctx).flatMap(action=>{const slots=targets(effect.source,{...ctx,action}).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.sourceFilter,s));const types=new Set();for(const slot of slots)for(const [type,n] of Object.entries(slot.energy||{}))if(Number(n)>0&&(!effect.energyType||type===effect.energyType)&&(!effect.allowedEnergyTypes||effect.allowedEnergyTypes.includes(type)))types.add(type);if(effect.energyType)return slots.some(s=>Number(s.energy?.[effect.energyType]||0)>0)?[action]:[];if(effect.allowedEnergyTypes)return [...types].map(type=>({...action,effectEnergyType:type}));return slots.some(s=>totalEnergy(s.energy)>0)?[action]:[];});return choices.length?choices:ctx.isAttack?[{}]:[];}
    if(effect.type==='switch'&&effect.source)return ctx.attacker&&own(ctx).bench.includes(ctx.attacker)?[{}]:[];
    if(effect.requirePlayedBeforeTurn&&ctx.attacker&&Number(ctx.attacker.playedOnSideTurn)>=Number(own(ctx).turnCount))return [];
    if(effect.type==='sequence'||effect.type==='coinFlip'){
      const children=effect.type==='sequence'?effect.effects:[effect.heads,effect.tails].filter(Boolean);let result=[{}];
      for(const e of children){const choices=choicesForEffect(e,ctx);result=result.flatMap(a=>choices.filter(b=>!a.target||!b.target||(a.target===b.target&&a.benchIndex===b.benchIndex)).map(b=>({...a,...b})));}return result;
    }
    const selector=effect.type==='switch'?(effect.side==='opponent'?'opponentBench':'selfBench'):effect.type==='benchDamage'&&!effect.all?(effect.side==='self'?'selfBench':'opponentBench'):effect.target;
    const choices=targetChoices(selector,ctx);if(!choices.length&&ctx.isAttack&&effect.type!=='selectedDamage')return [{}];
    const valid=choices.filter(action=>{const list=targets(selector,{...ctx,action}).filter(s=>(!effect.excludeSelf||s!==ctx.attacker)&&(!effect.requirePlayedBeforeTurn||Number(s.playedOnSideTurn)<Number(own(ctx).turnCount))&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s));if((effect.type==='heal'||effect.type==='healSelf')&&!ctx.isAttack)return list.some(s=>Number(s.damage)>0);if(effect.type==='discardEnergy'&&!ctx.isAttack){const needed=effect.amount==='all'?1:Number(effect.amount||0);return list.some(s=>effect.energyType?Number(s.energy[effect.energyType]||0)>=needed:totalEnergy(s.energy)>=needed);}if(effect.type==='attachEnergy'&&!ctx.isAttack){const owner=own(ctx),needed=Number(effect.amount||1);if(effect.source==='hand')return list.length>0&&owner.hand.filter(ref=>{const c=ctx.cardById(ref.cardId);return c?.basicEnergy&&c.subtype===effect.energyType;}).length>=needed;if(Array.isArray(owner.energySupply))return list.length>0&&owner.energySupply.filter(t=>t===effect.energyType).length>=needed;}
      if(effect.type==='attachEnergyFromDiscard'&&!ctx.isAttack)return list.length>0&&neoDiscardAvailable(ctx,own(ctx),effect.energyType)>=(effect.upTo?1:Number(effect.amount||1));if(effect.type==='switch')return (effect.side==='opponent'?other(ctx):own(ctx)).active!=null&&list.length>0;return !selector||list.length>0;});
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
    if(scope==='attack'&&subject&&String(cardById(subject.cardId)?.name||'').startsWith("Sabrina's")){
      const esp=(subject.temporaryTrainers||[]).find(ref=>cardById(ref.cardId)?.id==='gym1-117');
      if(esp)return {sourceUid:subject.uid,abilityName:"Sabrina's ESP",rule:{type:'coinReroll',scope:'attack'}};
    }
    for(const source of pokemonOn(ss)){
      if(abilitiesSuppressed(state,side,source,cardById))continue;
      const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
      for(const ability of abilities){if(ability.disabledByStatus&&(source.conditions?.sleep||source.conditions?.paralysis||source.conditions?.confusion))continue;if(ability.type!=='passive'||ability.activeOnly&&ss.active!==source||ability.benchOnly&&ss.active===source)continue;
        const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:source,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
        const rule=scanEffect(ability.effect,'coinReroll',ctx);if(!rule||rule.scope!==scope)continue;
        if(rule.filter&&(!subject||!matchesFilter(cardById(subject.cardId),rule.filter,subject)))continue;
        return {sourceUid:source.uid,abilityName:ability.name,rule};
      }
    }
    return null;
  }

  function fossilTransparencyBlocks(ctx,side,slot){
    if(!ctx.isAttack||!findPassiveRule(ctx.state,side,slot,'fossilTransparency',ctx.cardById))return false;
    const heads=coin(ctx);
    ctx.state.log.push({type:'coin',side,heads,reason:'fossilTransparency',results:[heads]});
    return heads;
  }
  function abilitiesSuppressed(state,side,slot,cardById){if(state?.format==='classic'&&Number(state.neoPowerLockUntil||0)>=Number(state.turnNumber))return true;if(slot?.gym2ShapeshiftSource)return true;if(slot?.neoGazeUntil===state?.turnNumber)return true;/* Brock's Ninetales cannot use the imitated Evolution's Power. */if(Number(state.sides[side]?.gym2PowerLockUntil||0)>=Number(state.turnNumber))return true;
    if(!slot)return false;
    if(state?.format==='classic'){
      const opp=side==='player'?'opponent':'player';
      if(state.sides?.[opp]&&pokemonOn(state.sides[opp]).some(s=>s.cardId==='SNAPFLORIO-066')&&state.sides?.[side]?.active===slot&&
         !(cardById(slot.cardId)?.abilities||[]).some(a=>a.name==='Dark Disdain'))return true;
    }
    if(state?.format==='classic'){
      const foe=side==='player'?'opponent':'player';
      if(state.sides?.[foe]?.active?.cardId==='SNAPFLORIO-089'&&!(cardById(slot.cardId)?.abilities||[]).some(a=>a.name==='Oblivious'))return true;
    }
    if(slot.abilitySuppressed){if(slot.abilitySuppressed.duration!=='whileActive'||state.sides[side].active===slot)return true;}
    for(const sourceSide of ['player','opponent'])for(const source of pokemonOn(state.sides[sourceSide])){
      const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
      for(const ability of abilities){if(ability.disabledByStatus&&(source.conditions?.sleep||source.conditions?.paralysis||source.conditions?.confusion))continue;if(ability.type!=='passive'||ability.activeOnly&&state.sides[sourceSide].active!==source||ability.benchOnly&&state.sides[sourceSide].active===source)continue;
        const ctx={state,side:sourceSide,foeSide:sourceSide==='player'?'opponent':'player',attacker:source,defender:state.sides[sourceSide==='player'?'opponent':'player'].active,cardById};
        const rule=scanEffect(ability.effect,'abilitySuppression',ctx);if(!rule)continue;
        if(rule.type==='abilitySuppression'&&card?.name==='Muk'&&source===slot)continue;
        if(rule.scope==='self'&&source!==slot)continue;if(rule.scope==='team'&&sourceSide!==side)continue;if(rule.scope==='opponent'&&sourceSide===side)continue;
        if(matchesFilter(cardById(slot.cardId),rule.filter,slot))return true;
      }
    }
    return false;
  }
  function evolutionRule(state,side,slot,type,cardById){
    if(!slot||abilitiesSuppressed(state,side,slot,cardById))return null;
    const card=cardById(slot.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean),ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
    for(const ability of abilities){if(ability.disabledByStatus&&(slot.conditions?.sleep||slot.conditions?.paralysis||slot.conditions?.confusion))continue;if(ability.type!=='passive'||ability.activeOnly&&state.sides[side].active!==slot||ability.benchOnly&&state.sides[side].active===slot)continue;const rule=scanEffect(ability.effect,type,ctx);if(rule)return rule;}return null;
  }
  function attackCostOverride(state,side,slot,attack,cardById){
    const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,attack,cardById};
    const scan=e=>{if(!e)return null;if(e.type==='sequence'){for(const child of e.effects){const r=scan(child);if(r)return r;}return null;}return e.type==='conditionalAttackCost'&&conditionMatches(e.condition,ctx)?e.cost:null;};
    return scan(attack?.effect);
  }
  function effectiveTypes(state,side,slot,cardById){
    const card=cardById(slot?.cardId),out=new Set(card?.types?.length?card.types:[card?.subtype].filter(Boolean));if(!slot||abilitiesSuppressed(state,side,slot,cardById))return [...out];if(slot.typeOverride?.type&&Number(slot.typeOverride.expiresTurn)>=Number(state.turnNumber))return [slot.typeOverride.type];
    const abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean),ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
    for(const ability of abilities){if(ability.disabledByStatus&&(slot.conditions?.sleep||slot.conditions?.paralysis||slot.conditions?.confusion))continue;if(ability.type!=='passive'||ability.activeOnly&&state.sides[side].active!==slot||ability.benchOnly&&state.sides[side].active===slot)continue;const rule=scanEffect(ability.effect,'additionalType',ctx);if(rule)for(const type of rule.types||[])out.add(type);}return [...out];
  }
  function findPassiveRule(state,side,slot,type,cardById){
    if(type!=='abilitySuppression'&&abilitiesSuppressed(state,side,slot,cardById))return null;
    const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
    const find=e=>{if(!e)return null;if(e.type==='sequence'){for(const child of e.effects){const r=find(child);if(r)return r;}return null;}return e.type===type&&conditionMatches(e.condition,ctx)?e:null;};
    const card=cardById(slot?.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
    for(const a of abilities){if(a.type!=='passive'||(a.disabledByStatus&&(slot?.conditions?.sleep||slot?.conditions?.confusion||slot?.conditions?.paralysis))||a.activeOnly&&state.sides[side].active!==slot||a.benchOnly&&state.sides[side].active===slot)continue;const r=find(a.effect);if(r)return r;}
    for(const tool of toolsOf(slot)){const r=find(cardById(tool.cardId)?.effect);if(r)return r;}for(const ref of temporaryTrainersOf(slot)){const r=find(cardById(ref.cardId)?.effect);if(r)return r;}
    return null;
  }
  function canUsePreviousEvolutionAttacks(state,side,slot,cardById){
    if(!slot||!Array.isArray(slot.stack)||slot.stack.length<2)return false;if(state.sides[side]?.gymRecallTurn===state.turnNumber&&state.sides[side]?.active===slot)return true;
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
      for(const tool of toolsOf(source))passiveModifiers(cardById(tool.cardId)?.effect,source,side,state,slot,stat,values,cardById);for(const ref of temporaryTrainersOf(source))passiveModifiers(cardById(ref.cardId)?.effect,source,side,state,slot,stat,values,cardById);
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
    for(const ability of abilities){if(ability.type!=='passive'||ability.disabledByStatus&&(slot.conditions?.sleep||slot.conditions?.confusion||slot.conditions?.paralysis)||ability.activeOnly&&state.sides[side].active!==slot||ability.benchOnly&&state.sides[side].active===slot)continue;const found=passiveProtection(ability.effect,type,ctx,slot);if(found)return found;}
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
    if(state?.format==='classic'&&slot){
      const ownSide=state.sides?.[side];
      if((ownSide?.active?.cardId==='SNAPFLORIO-056'||(ownSide?.bench||[]).some(s=>s.cardId==='SNAPFLORIO-056'&&!abilitiesSuppressed(state,side,s,cardById)))&&
         (Number(slot.energy?.Psychic||0)>0||(slot.specialEnergy||[]).some(r=>Number((r.provides||cardById(r.cardId)?.effect?.provides||{}).Psychic||0)>0)))return true;
    }
    const rule=findPassiveRule(state,side,slot,'preventEffects',cardById);if(!rule)return false;
    if(rule.attackerFilter&&!attacker)return false;
    return !rule.attackerFilter||matchesFilter(cardById(attacker.cardId),rule.attackerFilter,attacker);
  }
  function applyContinuousRules(state,cardById){
    if(state?.format==='classic')for(const side of ['player','opponent']){
      const board=state.sides?.[side];if(!board)continue;
      if(pokemonOn(board).some(s=>s.cardId==='SNAPFLORIO-048'&&!abilitiesSuppressed(state,side,s,cardById)))for(const slot of pokemonOn(board)){
        const attached=Number(slot.energy?.Lightning||0)>0||(slot.specialEnergy||[]).some(r=>Number((r.provides||cardById(r.cardId)?.effect?.provides||{}).Lightning||0)>0);
        if(attached)clearConditions(slot);
      }
    }
    const walk=(effect,fn)=>{if(!effect)return;if(effect.type==='sequence')for(const child of effect.effects||[])walk(child,fn);else fn(effect);};
    for(const side of ['player','opponent'])for(const source of pokemonOn(state.sides[side])){
      if(abilitiesSuppressed(state,side,source,cardById))continue;
      const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
      for(const a of abilities){if(a.type!=='passive'||a.activeOnly&&state.sides[side].active!==source||a.benchOnly&&state.sides[side].active===source)continue;walk(a.effect,rule=>{if(rule.type!=='statusRecoveryAura'||rule.scope!=='team')return;for(const target of pokemonOn(state.sides[side]))if(matchesFilter(cardById(target.cardId),rule.filter,target))clearConditions(target);});}
    }
  }
  function attackDamageWithState(state,attackSide,attackerSlot,defenderSide,defenderSlot,damage,cardById){
    let n=Math.max(0,Number(damage||0));if(!n||!attackerSlot||!defenderSlot)return n;
    const attacker=cardById(attackerSlot.cardId),defender=cardById(defenderSlot.cardId),weakness=defenderSlot?.weaknessOverride||defender?.weakness,resistance=defenderSlot?.resistanceOverride||defender?.resistance,types=effectiveTypes(state,attackSide,attackerSlot,cardById);
    const guard=defenderSlot.weaknessGuard;if(state?.format==='classic'){
      if(weakness&&types.includes(weakness)&&!(guard&&(guard.expiresTurn==null||state.turnNumber<=guard.expiresTurn))){const raw=String(defender?.weaknessValue||'×2'),m=raw.match(/[x×]\s*(\d+(?:\.\d+)?)/i);n=m?n*Number(m[1]):n*2;}
      if(resistance&&types.includes(resistance)){const raw=String(defender?.resistanceValue||'-30'),m=raw.match(/-\s*(\d+)/);n=Math.max(0,n-Number(m?.[1]||30));}
      if(!abilitiesSuppressed(state,defenderSide,defenderSlot,cardById)&&findPassiveRule(state,defenderSide,defenderSlot,'fossilArmor',cardById))n=Math.floor(n/20)*10;
      if(defender?.id==='neo3-51'&&n>0&&n<=40&&!abilitiesSuppressed(state,defenderSide,defenderSlot,cardById))n=10;
      return Math.max(0,n);
    }
    if(!weakness||!types.includes(weakness))return n;
    if(guard&&(guard.expiresTurn==null||state.turnNumber<=guard.expiresTurn))return n;
    let multiplier=null;if(state.stadium){const stadium=cardById(state.stadium.cardId);const find=e=>e&&(e.type==='weaknessMultiplier'?e:e.type==='sequence'?(e.effects.map(find).find(Boolean)||null):null),rule=find(stadium?.effect);if(rule&&(!rule.attackerFilter||matchesFilter(attacker,rule.attackerFilter,attackerSlot)))multiplier=Number(rule.multiplier||0);}
    return multiplier&&multiplier>1?n*multiplier:n+20;
  }
  function resolveDelayedEffects(state,endingSide,cardById,contextFor){const due=(state.delayedEffects||[]).filter(x=>x.event==='endOpponentNextTurn'&&Number(x.dueTurn)<=Number(state.turnNumber)&&x.endingSide===endingSide),keep=(state.delayedEffects||[]).filter(x=>!due.includes(x));state.delayedEffects=keep;for(const item of due){let target=null;if(item.targetUid){for(const side of ['player','opponent'])target=pokemonOn(state.sides[side]).find(s=>s.uid===item.targetUid)||target;}else if(item.spot){const ss=state.sides[item.spot.side];target=item.spot.active?ss.active:(ss.bench||[]).find(s=>s&&Number(s.benchSlot)===Number(item.spot.benchIndex));}if(!target)continue;const sourceSide=item.originSide,source=pokemonOn(state.sides[sourceSide]).find(s=>s.uid===item.sourceUid)||state.sides[sourceSide].active,ctx=contextFor(sourceSide,source);applyEffect({...item.effect,target:'eventPokemon'},{...ctx,eventData:{target}});}}
  function statusIsPrevented(state,slot,cardById,status){
    if(state?.format==='classic'&&slot){
      const owner=pokemonOn(state.sides.player).includes(slot)?'player':pokemonOn(state.sides.opponent).includes(slot)?'opponent':null;
      if(owner){const board=state.sides[owner],flora=pokemonOn(board).some(s=>s.cardId==='SNAPFLORIO-048'&&!abilitiesSuppressed(state,owner,s,cardById));
        if(flora&&(Number(slot.energy?.Lightning||0)>0||(slot.specialEnergy||[]).some(r=>Number((r.provides||cardById(r.cardId)?.effect?.provides||{}).Lightning||0)>0)))return true;
      }
    }
    const card=cardById(slot?.cardId),immunity=card?.statusImmune??card?.effect?.statusImmune;
    if(state.stadium?.cardId==='SNAPFLORIO-104'&&card?.types?.some(type=>type==='Grass'||type==='Psychic'))return true;
    if(Array.isArray(immunity)&&immunity.includes(status))return true;
    if(immunity===true)return true;
    const matches=guard=>!!guard&&(!guard.status||guard.status===status);
    if(matches(slot.statusGuard))return true;
    const side=pokemonOn(state.sides.player).includes(slot)?'player':'opponent';
    if(slot?.neoPollenShield&&slot.neoPollenShield.expiresTurn>=state.turnNumber)return true;
    if(matches(protectionFromSources(state,side,slot,state.sides[side==='player'?'opponent':'player'].active,cardById,'preventStatus')))return true;
    const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};
    for(const source of pokemonOn(state.sides[side])){if(abilitiesSuppressed(state,side,source,cardById))continue;const card=cardById(source.cardId);for(const a of (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean)){if(a.type!=='passive')continue;if(a.activeOnly&&state.sides[side].active!==source||a.benchOnly&&state.sides[side].active===source)continue;const find=e=>{if(!e)return null;if(e.type==='sequence')return e.effects.map(find).find(Boolean)||null;return e.type==='preventStatus'&&e.scope==='team'&&matchesFilter(cardById(slot.cardId),e.filter,slot)&&conditionMatches(e.condition,{...ctx,attacker:slot})&&matches(e)?e:null;};if(find(a.effect))return true;}}
    return false;
  }
  function passiveActionLock(effect,source,sourceSide,state,targetSide,cardType,cardById){if(!effect)return false;if(effect.type==='sequence')return effect.effects.some(e=>passiveActionLock(e,source,sourceSide,state,targetSide,cardType,cardById));if(effect.type!=='actionLock'||effect.cardType!==cardType)return false;if(effect.side==='opponent'&&targetSide===sourceSide||effect.side==='self'&&targetSide!==sourceSide)return false;if(effect.duration==='whileActive'&&state.sides[sourceSide].active!==source)return false;return true;}
  function isActionLocked(state,side,cardType,cardById){const ss=state.sides[side];if((ss.actionLocks||[]).some(l=>l.cardType===cardType&&(l.expiresTurn==null||state.turnNumber<=l.expiresTurn)))return true;for(const sourceSide of ['player','opponent'])for(const source of pokemonOn(state.sides[sourceSide])){if(abilitiesSuppressed(state,sourceSide,source,cardById))continue;const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);for(const a of abilities)if(!(a.disabledByStatus&&(source.conditions?.sleep||source.conditions?.confusion||source.conditions?.paralysis))&&a.type==='passive'&&passiveActionLock(a.effect,source,sourceSide,state,side,cardType,cardById))return true;}return false;}
  function passiveAttackAllowed(state,side,slot,cardById){if(!slot||abilitiesSuppressed(state,side,slot,cardById))return true;const card=cardById(slot.cardId),ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById,maxHp:null};const check=e=>{if(!e)return true;if(e.type==='sequence')return e.effects.every(check);if(e.type==='attackRequirement')return conditionMatches(e.condition,ctx);return true;};for(const ability of (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean))if(ability.type==='passive'&&!check(ability.effect))return false;return true;}
  function isLocked(state,slot,action,attackName){return (slot?.locks||[]).some(l=>l.action===action&&(l.expiresTurn==null||state.turnNumber<=l.expiresTurn)&&(!l.attackName||l.attackName===attackName));}
  function applyAttackEffect(effect,context){return applyEffect(effect,context);}
  return {ENERGY_CODE,effectTypes,supportsEffect,validateEffect,matchesFilter,totalEnergy,canPayCost,spendGenericEnergy,spendGenericEnergyWithValue,attackDamage,applyAttackEffect,applyEffect,resolveAttack,choicesForEffect,neoDiscoveryReduction,modifierAmount,clearConditions,clearTemporaryEffects,revertShapeshift,switchPokemon,attackIsPrevented,attackEffectsPrevented,statusIsPrevented,isLocked,isActionLocked,passiveAttackAllowed,applyPersistentEvent,findPassiveRule,healingIsBlocked,canUsePreviousEvolutionAttacks,attackSpecificBonus,consumeDamageGuard,topDeckCountAmount,coinBonusAmount,abilitiesSuppressed,evolutionRule,attackCostOverride,effectiveTypes,applyContinuousRules,attackDamageWithState,resolveDelayedEffects,toolCapacity,coinRerollSource,lentalDefenseReduction};
});
