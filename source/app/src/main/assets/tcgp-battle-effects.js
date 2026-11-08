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
  const FILTER_KEYS=['kind','stage','subtype','notSubtype','name','trainerType','isEx','damaged','evolved','hasAbility','evolvesFrom','hasEnergyType','hasAnyEnergy','basicEnergy','classicRecoverable','nameContains','hpAtMost','retreatAtLeast','energyTypeAtLeast','points','attackName','tag'];
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
      case 'moveEnergy':need(['self','selfActive','selfBench','selfBenchAll','selfAll','opponentActive'].includes(effect.source),'invalid Energy movement source');need(['self','selfActive','selfBench'].includes(effect.target),'invalid Energy movement destination');need(!(effect.source==='selfBench'&&effect.target==='selfBench'),'two selected Bench endpoints require separate selection');need(effect.amount==='all'||integer(effect.amount),'invalid moved Energy amount');if(effect.allowedEnergyTypes!=null)need(Array.isArray(effect.allowedEnergyTypes)&&effect.allowedEnergyTypes.every(x=>ENERGY_TYPES.includes(x)),'invalid allowed moved Energy types');break;
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
      case 'coinDamageByEnergy':if(effect.discardHeads!=null){need(typeof effect.discardHeads==='boolean','invalid per-head discard flag');need(!effect.discardHeads||ENERGY_TYPES.includes(effect.energyType),'per-head discard needs a typed Energy');}if(effect.countAttachedEnergyType!=null)need(typeof effect.countAttachedEnergyType==='boolean'&&!!effect.energyType,'typed attached-card count requires Energy type');break;
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
      case 'triggeredEffect':need(['onAttach','endTurn','beginTurn','checkup','damagedByAttack','energyAttached','evolved','benched','retreat','knockedOut','opponentKnockedOut','teammateKnockedOut'].includes(effect.event),'invalid persistent trigger event');need(!!effect.effect,'triggeredEffect requires child effect');if(effect.turn!=null)need(['owner','opponent','any'].includes(effect.turn),'invalid trigger turn');errors.push(...validateEffect(effect.effect,`${at}.effect`));break;
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
      case 'actionLock':need(['Supporter','Item','Trainer','Tool','SpecialEnergy','Stadium','EnergyActive','Evolution','EvolutionActive'].includes(effect.cardType),'invalid locked card type');need(['opponentTurn','whileActive','whileInPlay'].includes(effect.duration),'invalid action-lock duration');break;
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
  function canPayCost(energy,cost){const pool={...(energy||{})};const symbols=String(cost||'').split('').filter(Boolean);for(const symbol of symbols){if(symbol==='C')continue;const type=ENERGY_CODE[symbol];if(!type)return false;if(Number(pool[type]||0)>0)pool[type]--;else if(Number(pool.Crystal||0)>0&&pool.__crystalAllowed?.[type])pool.Crystal--;else if(Number(pool.Miracle||0)>0)pool.Miracle--;else return false;}return totalEnergy(pool)>=symbols.filter(s=>s==='C').length;}
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
  function coin(ctx){if(typeof ctx.random!=='function')throw new Error('Seeded battle RNG is required.');const ss=own(ctx);if(ctx.isAttack&&ss&&Number(ss.florioPetalTurn)===Number(ctx.state.turnNumber)&&!ss.florioPetalUsed&&typeof ss.florioPetalResult==='boolean'){ss.florioPetalUsed=true;return ss.florioPetalResult;}if(ss&&Number(ss.forceFirstCoinHeadTurn)===Number(ctx.state.turnNumber)&&!ss.forceFirstCoinHeadUsed&&(ctx.isAttack||ctx.isAbility||ctx.isTrainer)){ss.forceFirstCoinHeadUsed=true;return true;}return ctx.random(ctx.state)<0.5;}
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
  function matchesFilter(card,filter,slot){const match=(k,v)=>k==='subtype'?hasType(card,v):k==='notSubtype'?!hasType(card,v):k==='tag'?(card.tags||[]).includes(v):k==='classicRecoverable'?(card.kind==='pokemon'||card.basicEnergy)===v:k==='damaged'?(Number(slot?.damage)>0)===v:k==='isEx'?!!(card.isEx||card.points>=2||/ ex$/.test(card.name))===v:k==='evolved'?['Stage 1','Stage 2'].includes(card.stage)===v:k==='hasAbility'?!!(card.abilities?.length||card.ability)===v:k==='hasEnergyType'?Number(slot?.energy?.[v]||0)>0:k==='hasAnyEnergy'?totalEnergy(slot?.energy)>0:k==='nameContains'?String(card.name||'').includes(v):k==='attackName'?(card.attacks||[]).some(a=>a.name===v):k==='hpAtMost'?Number(card.hp||0)<=Number(v):k==='retreatAtLeast'?Number(card.retreat||0)>=Number(v):k==='energyTypeAtLeast'?Number(slot?.energy?.[v?.type]||0)>=Number(v?.amount||0):card[k]===v;return !!card&&Object.entries(filter||{}).every(([k,v])=>Array.isArray(v)?v.some(x=>match(k,x)):match(k,v));}
  function clearConditions(slot){if(slot)slot.conditions={};}
  function revertShapeshift(state,slot){
    if(!slot?.gym2ShapeshiftSource)return;
    const owner=state&&['player','opponent'].map(x=>state.sides[x]).find(ss=>ss?.active===slot||ss?.bench?.includes(slot));
    if(owner&&slot.gym2ShapeshiftRef)owner.discard.push(slot.gym2ShapeshiftRef);
    slot.cardId=slot.gym2ShapeshiftSource;delete slot.gym2ShapeshiftSource;delete slot.gym2ShapeshiftRef;
  }
  function clearTemporaryEffects(state,slot){if(!slot)return;
    revertShapeshift(state,slot);
    clearConditions(slot);delete slot.locks;delete slot.attackGuard;delete slot.statusGuard;delete slot.attackGate;delete slot.retaliate;delete slot.stackedAttackBonuses;delete slot.abilitySuppressed;delete slot.energyTypeOverride;delete slot.typeOverride;delete slot.weaknessOverride;delete slot.resistanceOverride;delete slot.destinyBond;delete slot.gymShadowImages;delete slot.gymCounterGuard;delete slot.gymFireWall;delete slot.gymDeflector;delete slot.gymEnergyLock;delete slot.gym2Intimidate;delete slot.gym2GiantGrowth;delete slot.gym2PoisonAmount;delete slot.gym2NinjaTrick;delete slot.gym2FaceDown;delete slot.gym2BubblesLockTurn;delete slot.legendaryMirrorShellUntil;delete slot.neoMeanLook;delete slot.neoWebLock;delete slot.neoJawClamp;delete slot.neoLeer;delete slot.neoAmnesia;delete slot.neoScaryFace;delete slot.neoAttackLock;delete slot.neoDeflector;delete slot.neoPollenShield;delete slot.neoScreech;delete slot.neoLockOn;delete slot.neoCounter;delete slot.neoPursuit;delete slot.neoSecretePoison;delete slot.neoSlime;delete slot.neoGazeUntil;if(state)state.modifiers=(state.modifiers||[]).filter(m=>m.targetUid!==slot.uid||m.scope==='team'||m.scope==='active'||m.scope==='opponentActive');}
  function switchPokemon(side,benchIndex,state){const index=side.bench.findIndex(s=>s&&Number(s.benchSlot)===Number(benchIndex));if(index<0||!side.active)return false;const incoming=side.bench[index],outgoing=side.active;outgoing.benchSlot=Number(incoming.benchSlot);incoming.benchSlot=null;incoming.movedToActiveTurn=state?.turnNumber;side.bench[index]=outgoing;side.active=incoming;clearTemporaryEffects(state,outgoing);return true;}
  function protectedFromEffects(slot,ctx){
    if(ctx.isAttack&&ctx.state?.format==='classic'&&ctx.state?.stadium?.cardId==='SNAPFLORIO-112'&&
      ((ctx.state.sides?.player?.bench||[]).includes(slot)||(ctx.state.sides?.opponent?.bench||[]).includes(slot)))return true;
    return !!(ctx.isAttack&&ctx.preventedTargets&&ctx.preventedTargets.has(slot.uid));
  }
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
  // LuckyDex's three-Bench adaptation for Unown word Powers: required letters
  // can be split across the player's hand, Active Spot and Bench. The Pokémon
  // whose Power is activated must still be in play (enforced by legalActions).
  function neoUnownWordReady(ctx,letters){
    const ss=own(ctx),available=new Set([...pokemonOn(ss),...(ss.hand||[])].map(ref=>ctx.cardById(ref?.cardId)?.name).filter(Boolean));
    return [...new Set(String(letters||'').toUpperCase().split(''))].every(letter=>available.has('Unown ['+letter+']'));
  }
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
  // Neo Destiny: dedicated resolutions for original Light/Dark/Shining rules.
  // Choice continuations use the ordinary battle effect-choice pipeline.
  function destinyRule(effect,ctx){
    const rule=effect.rule.slice(8),ss=own(ctx),foe=other(ctx),att=ctx.attacker,def=ctx.defender;
    const uid=ctx.action?.choiceBenchIndex,target=ctx.action?.choiceTarget;
    const selected=(board)=>target==='active'?board.active:board.bench.find(s=>Number(s.benchSlot)===Number(uid));
    const draw=(board,n)=>{for(let i=0;i<n;i++)ctx.drawCard?.(board);};
    const request=(kind,extra={})=>ctx.requestChoice?.({kind,side:'self',effect,...extra});
    const choose=(which,ruleName,optional=false,filter)=>ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:which==='foe'?ctx.foeSide:ctx.side,includeActive:true,optional,filter,effect:{...effect,rule:'destiny:'+ruleName}});
    const energy=(s)=>totalEnergy(s?.energy||{})+(s?.specialEnergy||[]).length;
    const drop=(s,board,type,count)=>{let n=Math.min(Math.max(0,Number(count)),Number(s?.energy?.[type]||0));if(n){s.energy[type]-=n;recordDiscardedEnergy(board,type,n);}return n;};
    const damage=(s,n)=>{if(s&&n>0){s.damage=Number(s.damage||0)+Number(n);ctx.state.log.push({type:'neoDestinyDamage',side:ctx.side,rule,target:s.cardId,damage:n});}};
    const heal=(s,n)=>{if(s)s.damage=Math.max(0,Number(s.damage||0)-Number(n));};
    const log=(x={})=>ctx.state.log.push({type:'neoDestiny',side:ctx.side,rule,...x});
    const flip=(name=rule)=>{const h=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Neo Destiny '+name,heads:h,results:[h]});return h;};
    const putBasicFromDiscard=(board)=>{const possible=board.discard.map((r,i)=>({r,i,c:ctx.cardById(r.cardId)})).filter(x=>x.c?.kind==='pokemon'&&x.c.stage==='Basic');if(!possible.length||board.bench.length>=board.benchLimit)return null;const p=possible[0];board.discard.splice(p.i,1);ctx.benchCard?.(board,p.r);return board.bench.at(-1);};
    const pickDiscard=(which,filter,after)=>{const board=which==='foe'?foe:ss;if(board.discard.some(r=>matchesFilter(ctx.cardById(r.cardId),filter)))request('discardCard',{discardZone:which==='foe'?'opponent':'self',filter,effect:{...effect,rule:'destiny:'+after,which}});};
    const drawZone=(board,type,n=1)=>neoSupplyAttach(ctx,board,board.active,type,n);
    const benchEffect=(n,which='foe')=>{const board=which==='foe'?foe:ss;if(!board.bench.length)return;choose(which,rule+'Pick',true);};
    switch(rule){
      case 'conductivity':{if(!ctx.eventData?.target)return;const amph=neoSlots(ctx,'self').filter(x=>x.cardId==='neo4-1');if(amph.length!==1)break;damage(ctx.eventData.target,10);break;}
      case 'surpriseBite':choose('foe','surpriseBitePick',true);break;
      case 'surpriseBitePick':damage(selected(foe),20);break;
      case 'deepSleep':case 'scare':case 'miraculousWind':case 'unownZ':case 'unownX':break; // Passive effects handled in core.
      case 'spatialDistortion':if(flip()&&ss.discard.some(r=>ctx.cardById(r.cardId)?.trainerType==='Stadium'))pickDiscard('self',{trainerType:'Stadium'},'spatialDistortionPick');break;
      case 'spatialDistortionPick':{const i=Number(ctx.action?.choiceDiscardIndex),ref=ss.discard[i];if(ref&&ctx.cardById(ref.cardId)?.trainerType==='Stadium'){ss.discard.splice(i,1);if(ctx.state.stadium){const old=ctx.state.stadium;const owner=ctx.state.stadiumOwner||ctx.foeSide;ctx.state.sides[owner]?.discard.push(old);}ctx.state.stadium=ref;ctx.state.stadiumOwner=ctx.side;log({stadium:ref.cardId});}break;}
      case 'driveOff':if(foe.bench.length)request('switchBench',{side:'opponent',selectionSide:ctx.foeSide,effect:{...effect,rule:'destiny:driveOffPick'}});break;
      case 'driveOffPick':switchPokemon(foe,ctx.action?.choiceBenchIndex,ctx.state);break;
      case 'gift':{if(foe.deck.some(r=>ctx.cardById(r.cardId)?.trainerType==='Tool'))request('deckCard',{side:'opponent',selectionSide:ctx.foeSide,filter:{trainerType:'Tool'},optional:true,effect:{...effect,rule:'destiny:giftFoe'}});else destinyRule({...effect,rule:'destiny:giftSelf'},ctx);break;}
      case 'giftFoe':{const i=Number(ctx.action?.choiceDeckIndex),r=foe.deck[i];if(r&&ctx.cardById(r.cardId)?.trainerType==='Tool'){foe.hand.push(...foe.deck.splice(i,1));ctx.shuffle?.(ctx.state,foe.deck);}destinyRule({...effect,rule:'destiny:giftSelf'},ctx);break;}
      case 'giftSelf':if(ss.deck.some(r=>ctx.cardById(r.cardId)?.trainerType==='Tool'))request('deckCard',{filter:{trainerType:'Tool'},optional:true,effect:{...effect,rule:'destiny:giftSelfPick'}});break;
      case 'giftSelfPick':{const i=Number(ctx.action?.choiceDeckIndex),r=ss.deck[i];if(r&&ctx.cardById(r.cardId)?.trainerType==='Tool'){ss.hand.push(...ss.deck.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);}break;}
      case 'hotPlate':if(ctx.eventData?.target&&ctx.cardById(ctx.eventData.target.cardId)?.stage==='Basic'&&ss.active===att)damage(ctx.eventData.target,10);break;
      case 'cunning':{const r=foe.deck[0];if(r){log({topOpponentDeckCard:r.cardId});request('option',{options:['Shuffle opponent deck','Leave it'],effect:{...effect,rule:'destiny:cunningPick'}});}break;}
      case 'cunningPick':if(Number(ctx.action?.choiceOption)===0)ctx.shuffle?.(ctx.state,foe.deck);break;
      case 'tagTeam':{if(ss.active===att||!att)return;heal(ss.active,30);switchPokemon(ss,att.benchSlot,ctx.state);break;}
      case 'fluffyWool':{const meta=ctx.eventData;if(meta?.source?.attack&&meta.damage>0&&ss.active===att&&flip())meta.attacker.conditions={...(meta.attacker.conditions||{}),sleep:true};break;}
      case 'unownGive':{
        if(!neoUnownWordReady(ctx,'GIVE'))break;
        const top=Array.isArray(ss.energySupply)?ss.energySupply[0]:ss.energyTypes?.[0];
        if(neoBasicIds[top]&&flip('Unown [Give]'))request('pokemon',{includeActive:true,effect:{...effect,rule:'destiny:unownGivePick'}});
        break;
      }
      case 'unownGivePick':{
        if(!neoUnownWordReady(ctx,'GIVE'))break;
        const slot=selected(ss),type=Array.isArray(ss.energySupply)?ss.energySupply[0]:ss.energyTypes?.[0];
        if(slot&&neoBasicIds[type])neoSupplyAttach(ctx,ss,slot,type,1);
        break;
      }
      case 'unownHelp':{
        if(!neoUnownWordReady(ctx,'HELP'))break;
        const count=ss.hand.length;
        ss.deck.push(...ss.hand.splice(0));ctx.shuffle?.(ctx.state,ss.deck);draw(ss,count);
        break;
      }
      case 'unownWant':{
        if(neoUnownWordReady(ctx,'WANT')&&ss.discard.some(ref=>ctx.cardById(ref.cardId)?.kind==='trainer')&&flip('Unown [Want]'))pickDiscard('self',{kind:'trainer'},'unownWantPick');
        break;
      }
      case 'unownWantPick':{
        if(!neoUnownWordReady(ctx,'WANT'))break;
        const i=Number(ctx.action?.choiceDiscardIndex),ref=ss.discard[i];
        if(ref&&ctx.cardById(ref.cardId)?.kind==='trainer')ss.hand.push(...ss.discard.splice(i,1));
        break;
      }
      case 'unownP':break;
      case 'unownQ':if(flip())for(const slot of neoSlots(ctx,'self'))if(ctx.cardById(slot.cardId)?.name?.startsWith('Unown ['))slot.attackGuard={type:'preventDamage',target:'self',effects:true,expiresTurn:ctx.state.turnNumber+1};break;
      case 'unownL':if(flip()){ctx.shuffle?.(ctx.state,ss.deck);ctx.shuffle?.(ctx.state,foe.deck);}break;
      case 'unownS':{const ref=ss.prizes?.[0];if(ref){ref.revealed=true;log({lookedAtPrize:ref.cardId});}break;}
      case 'unownT':if(flip())log({opponentHand:foe.hand.map(r=>r.cardId),ownHand:ss.hand.map(r=>r.cardId)});break;
      case 'unownV':{if(!flip())break;const candidates=neoSlots(ctx,'self').filter(s=>s!==att&&ctx.cardById(s.cardId)?.name?.startsWith('Unown ['));if(candidates.length)choose('self','unownVPick',true,{nameContains:'Unown ['});break;}
      case 'unownVPick':{const s=selected(ss);if(!s||s===att||!ctx.cardById(s.cardId)?.name?.startsWith('Unown ['))break;ss.hand.push({uid:'neo4-v-'+ctx.state.turnNumber,cardId:s.cardId});ss.discard.push(...(s.specialEnergy||[]),...(s.tool?[s.tool]:[]));for(const [t,n] of Object.entries(s.energy||{}))recordDiscardedEnergy(ss,t,n);if(ss.active===s)ss.active=null;else ss.bench.splice(ss.bench.indexOf(s),1);break;}
      case 'gentleFlames':case 'beatdown':case 'splashAbout':case 'synchronize':break;
      case 'pulseGuard':if(att)att.attackGuard={type:'preventDamage',target:'self',duration:'opponentTurn',minDamage:30,expiresTurn:ctx.state.turnNumber+1};break;
      case 'shockBolt':drop(att,ss,'Lightning',100);break;
      case 'darkDrain':{let dealt=0;for(const slot of neoSlots(ctx,'foe'))if(flip()) {damage(slot,10);dealt+=10;}heal(att,dealt);break;}
      case 'tuskToss':if(!foe.bench.length)break;if(flip()){const refs=(def.stack?.length?def.stack:[def.cardId]).map((id,i)=>({uid:'neo-tusk-'+ctx.state.turnNumber+'-'+i,cardId:id}));foe.hand.push(...refs,...(def.specialEnergy||[]),...(def.tool?[def.tool]:[]),...(def.extraTools||[]));for(const [type,n] of Object.entries(def.energy||{}))neoRecoveredEnergyToHand(ctx,foe,type,n);if(foe.active===def)foe.active=null;}else request('switchBench',{side:'opponent',selectionSide:ctx.foeSide,effect:{...effect,rule:'destiny:tuskTossPick'}});break;
      case 'tuskTossPick':switchPokemon(foe,ctx.action?.choiceBenchIndex,ctx.state);break;
      case 'psysplash':for(const s of neoSlots(ctx,'foe'))damage(s,10*energy(s));break;
      case 'crushingBlow':if(energy(def)&&flip())applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},ctx);break;
      case 'pullIn':if(foe.bench.length)request('switchBench',{selectionSide:ctx.foeSide,effect:{...effect,rule:'destiny:pullInPick'}});else if(def)def.conditions={...(def.conditions||{}),sleep:true};break;
      case 'pullInPick':switchPokemon(foe,ctx.action?.choiceBenchIndex,ctx.state);if(foe.active)foe.active.conditions={...(foe.active.conditions||{}),sleep:true};break;
      case 'eerieHowl':{const i=foe.hand.findIndex(r=>ctx.cardById(r.cardId)?.kind==='pokemon'&&ctx.cardById(r.cardId)?.stage==='Basic');if(i<0||foe.bench.length>=foe.benchLimit)break;const [r]=foe.hand.splice(i,1);ctx.benchCard?.(foe,r);switchPokemon(foe,foe.bench.at(-1).benchSlot,ctx.state);break;}
      case 'darkFire':if(Number(att?.energy?.Darkness||0)>0){drop(att,ss,'Darkness',1);}break;
      case 'threaten':if(flip()&&foe.hand.some(r=>ctx.cardById(r.cardId)?.kind==='trainer'))request('opponentHandCard',{filter:{kind:'trainer'},effect:{...effect,rule:'destiny:threatenPick'}});break;
      case 'threatenPick':{const i=Number(ctx.action?.choiceHandIndex),r=foe.hand[i];if(r&&ctx.cardById(r.cardId)?.kind==='trainer'){foe.deck.push(...foe.hand.splice(i,1));ctx.shuffle?.(ctx.state,foe.deck);}break;}
      case 'rushingFlames':{let n=Number(effect.discardFireCount||0);for(const slot of pokemonOn(ss)){if(n<=0)break;const used=drop(slot,ss,'Fire',n);n-=used;}break;}
      case 'mountainSmasher':break;
      case 'flingAway':if(foe.bench.length)choose('foe','flingAwayPick');break;
      case 'flingAwayPick':damage(selected(foe),30);break;
      case 'bubbleJump':if(ss.bench.length&&flip())request('pokemon',{includeActive:false,effect:{...effect,rule:'destiny:bubbleJumpPick'}});break;
      case 'bubbleJumpPick':{const slot=selected(ss);if(slot&&slot!==att){let n=2;for(const [t,count] of Object.entries(att.energy||{})){const take=Math.min(Number(count||0),n);att.energy[t]-=take;slot.energy[t]=Number(slot.energy[t]||0)+take;n-=take;if(!n)break;}const refs=(att.stack?.length?att.stack:[att.cardId]).map((id,i)=>({uid:'neo-bubble-'+ctx.state.turnNumber+'-'+i,cardId:id}));ss.hand.push(...refs,...(att.specialEnergy||[]),...(att.tool?[att.tool]:[]),...(att.extraTools||[]));for(const [t,n] of Object.entries(att.energy||{}))neoRecoveredEnergyToHand(ctx,ss,t,n);if(ss.active===att)ss.active=null;}break;}
      case 'sweetKiss':request('option',{side:'opponent',options:['Draw a card','Do not draw'],effect:{...effect,rule:'destiny:sweetKissPick'}});break;
      case 'sweetKissPick':if(Number(ctx.action?.choiceOption)===0)draw(foe,1);break;
      case 'entangle':if(foe.bench.length)request('switchBench',{selectionSide:ctx.foeSide,effect:{...effect,rule:'destiny:entanglePick'}});break;
      case 'entanglePick':switchPokemon(foe,ctx.action?.choiceBenchIndex,ctx.state);if(flip()&&foe.active)foe.active.conditions={...(foe.active.conditions||{}),paralysis:true};break;
      case 'poisonBind':if(def){def.conditions={...(def.conditions||{}),poison:true};if(flip())def.locks=[...(def.locks||[]),{type:'lock',action:'retreat',expiresTurn:ctx.state.turnNumber+1}];}break;
      case 'ballOfFlame':if(att.energy?.Fire>0&&foe.bench.length)request('option',{options:['Discard Fire and hit Bench','Keep Fire Energy'],effect:{...effect,rule:'destiny:ballOfFlamePick'}});break;
      case 'ballOfFlamePick':if(Number(ctx.action?.choiceOption)===0&&drop(att,ss,'Fire',1))choose('foe','ballOfFlameDamage');break;
      case 'ballOfFlameDamage':damage(selected(foe),20);break;
      case 'prehistoricWater':if(neoSlots(ctx,'foe').some(s=>s.stack?.length>1)&&flip())choose('foe','prehistoricWaterPick',false,{evolved:true});break;
      case 'prehistoricWaterPick':{const s=selected(foe);if(s?.stack?.length>1){const top=s.stack.pop();foe.deck.push({uid:'neo-devolve-'+ctx.state.turnNumber,cardId:top});s.cardId=s.stack.at(-1);ctx.shuffle?.(ctx.state,foe.deck);}break;}
      case 'darkTentacle':if(def)def.neoDestinyEvolutionLockUntil=ctx.state.turnNumber+1;break;
      case 'provoke':{const opts=foe.hand.filter(r=>ctx.cardById(r.cardId)?.stage==='Basic');if(opts.length&&foe.bench.length<foe.benchLimit){const ref=opts[0];foe.hand.splice(foe.hand.indexOf(ref),1);ctx.benchCard?.(foe,ref);}break;}
      case 'battleFrenzy':for(const board of [ss,foe])for(const s of pokemonOn(board))if(flip())damage(s,20);break;
      case 'searchlight':if(!flip())break;if(ss.discard.length)pickDiscard('self',{},'searchlightSelf');else if(foe.discard.length)pickDiscard('foe',{},'searchlightFoe');break;
      case 'searchlightSelf':{const i=Number(ctx.action?.choiceDiscardIndex);if(ss.discard[i])ss.hand.push(...ss.discard.splice(i,1));if(foe.discard.length)pickDiscard('foe',{},'searchlightFoe');break;}
      case 'searchlightFoe':{const i=Number(ctx.action?.choiceDiscardIndex);if(foe.discard[i])foe.hand.push(...foe.discard.splice(i,1));break;}
      case 'spark':if(foe.bench.length)choose('foe','sparkPick');break;
      case 'sparkPick':damage(selected(foe),10);break;
      case 'flashTouch':if(ss.bench.length)request('switchBench',{effect:{...effect,rule:'destiny:flashTouchPick'}});break;
      case 'flashTouchPick':{switchPokemon(ss,ctx.action?.choiceBenchIndex,ctx.state);if(ss.active)ss.active.neoDestinyStatusGuardUntil=ctx.state.turnNumber+1;break;}
      case 'knockOver':if(ctx.state.stadium)request('option',{options:['Discard Stadium','Keep Stadium'],effect:{...effect,rule:'destiny:knockOverPick'}});break;
      case 'knockOverPick':if(Number(ctx.action?.choiceOption)===0&&ctx.state.stadium){const owner=ctx.state.stadiumOwner||ctx.side;ctx.state.sides[owner].discard.push(ctx.state.stadium);ctx.state.stadium=null;}break;
      case 'highVoltage':if(flip())foe.neoDestinyTrainerLockUntil=ctx.state.turnNumber+1;break;
      case 'stunWave':if(def)def.neoDestinyPowerLockUntil=ctx.state.turnNumber+2;break;
      case 'armorUp':if(att)att.koGuard={type:'koGuard',mode:'surviveCoin',remainingHp:10,expiresTurn:ctx.state.turnNumber+2};break;
      case 'callBack':{const s=putBasicFromDiscard(foe);if(s)damage(s,10);break;}
      case 'waterCannon':break;
      case 'explosiveEvolution':if(flip()){for(const s of neoSlots(ctx,'foe'))damage(s,10);const hit=ss.deck.findIndex(r=>ctx.cardById(r.cardId)?.name==='Dark Tyranitar');if(hit>=0&&att){const [ref]=ss.deck.splice(hit,1);att.cardId=ref.cardId;att.stack.push(ref.cardId);ctx.shuffle?.(ctx.state,ss.deck);ctx.onEvolved?.(att);}}break;
      case 'incinerate':{const r=foe.deck[0];if(r&&ctx.cardById(r.cardId)?.kind==='trainer')foe.discard.push(foe.deck.shift());break;}
      case 'rushingMagma':{const cards=ss.deck.splice(0,5);ss.discard.push(...cards);break;}
      case 'slapAwake':if(def){delete def.conditions?.sleep;delete def.conditions?.confusion;}break;
      case 'freezingBreath':if(def)def.conditions={...(def.conditions||{}),[flip()?'paralysis':'sleep']:true};break;
      case 'icePillar':if(att)ss.neoDestinyBenchGuardUntil=ctx.state.turnNumber+1;break;
      case 'warmUp':if(ss.bench.length)request('pokemon',{includeActive:false,effect:{...effect,rule:'destiny:warmUpPick'}});break;
      case 'warmUpPick':{const target=selected(ss);if(target)neoSupplyAttach(ctx,ss,target,'Fire',1);break;}
      case 'burningFlame':break;
      case 'flipperStroke':for(const board of [foe,ss]){const picks=board.deck.splice(0,3),found=picks.filter(r=>ctx.cardById(r.cardId)?.basicEnergy);board.hand.push(...found);board.deck.push(...picks.filter(r=>!found.includes(r)));ctx.shuffle?.(ctx.state,board.deck);}break;
      case 'returnHome':if(ss.bench.length)choose('self','returnHomePick',false);break;
      case 'returnHomePick':{const s=selected(ss);if(!s||s===ss.active)break;ss.deck.push({uid:'neo-return-'+ctx.state.turnNumber,cardId:s.cardId});ss.bench.splice(ss.bench.indexOf(s),1);ctx.shuffle?.(ctx.state,ss.deck);break;}
      case 'guidingFlame':putBasicFromDiscard(ss);break;
      case 'fishOut':for(const board of [foe,ss]){const recovered=board.discard.filter(r=>ctx.cardById(r.cardId)?.kind==='pokemon').slice(0,3);board.discard=board.discard.filter(r=>!recovered.includes(r));board.deck.push(...recovered);ctx.shuffle?.(ctx.state,board.deck);}break;
      case 'washAway':if(ss.bench.length&&flip())request('pokemon',{includeActive:false,effect:{...effect,rule:'destiny:washAwayPick'}});break;
      case 'washAwayPick':{const s=selected(ss);if(s){s.damage=0;for(const [type,n] of Object.entries(s.energy||{})){recordDiscardedEnergy(ss,type,n);s.energy[type]=0;}ss.discard.push(...(s.specialEnergy||[]));s.specialEnergy=[];}break;}
      case 'hypnoshower':if(def)def.conditions={...(def.conditions||{}),sleep:true};for(const board of [ss,foe])for(const s of board.bench)heal(s,10);break;
      case 'mysteriousWing':if(foe.discard.some(r=>ctx.cardById(r.cardId)?.kind==='pokemon'))pickDiscard('foe',{kind:'pokemon'},'mysteriousWingFoe');else destinyRule({...effect,rule:'destiny:mysteriousWingSelf'},ctx);break;
      case 'mysteriousWingFoe':{const i=Number(ctx.action?.choiceDiscardIndex);if(ctx.cardById(foe.discard[i]?.cardId)?.kind==='pokemon')foe.hand.push(...foe.discard.splice(i,1));destinyRule({...effect,rule:'destiny:mysteriousWingSelf'},ctx);break;}
      case 'mysteriousWingSelf':if(ss.discard.some(r=>ctx.cardById(r.cardId)?.kind==='pokemon'))pickDiscard('self',{kind:'pokemon'},'mysteriousWingSelfPick');break;
      case 'mysteriousWingSelfPick':{const i=Number(ctx.action?.choiceDiscardIndex);if(ctx.cardById(ss.discard[i]?.cardId)?.kind==='pokemon')ss.hand.push(...ss.discard.splice(i,1));break;}
      case 'evolutionSong':if(ss.deck.some(r=>ctx.cardById(r.cardId)?.kind==='pokemon'))request('option',{options:['Opponent evolves first','Skip'],effect:{...effect,rule:'destiny:evolutionSongPick'}});break;
      case 'evolutionSongPick':if(Number(ctx.action?.choiceOption)===0){const s=neoSlots(ctx,'self').find(p=>ss.deck.some(r=>ctx.cardById(r.cardId)?.evolvesFrom===ctx.cardById(p.cardId)?.name));if(s)ctx.evolveFromDeck?.(s);}break;
      case 'charm':if(def)def.neoDestinyAttackWeakUntil=ctx.state.turnNumber+1;break;
      case 'tentacleWrap':if(def){if(flip())def.conditions={...(def.conditions||{}),paralysis:true};else def.neoDestinyRetreatExtraUntil=ctx.state.turnNumber+1;}break;
      case 'reflectedSunlight':{const target=neoSlots(ctx,'self').find(s=>ctx.cardById(s.cardId)?.types?.includes('Grass'));if(target){const n=Math.min(2,ss.hand.filter(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype==='Grass').length);for(let i=0;i<n;i++){const ix=ss.hand.findIndex(r=>ctx.cardById(r.cardId)?.basicEnergy&&ctx.cardById(r.cardId)?.subtype==='Grass');ss.hand.splice(ix,1);target.energy.Grass=Number(target.energy.Grass||0)+1;}}break;}
      case 'sunbathe':if(flip()&&att){heal(att,999);ctx.evolveFromDeck?.(att);}break;
      case 'healingWater':if(ss.bench.length)request('pokemon',{includeActive:false,effect:{...effect,rule:'destiny:healingWaterPick'}});break;
      case 'healingWaterPick':heal(selected(ss),10*Number(att?.energy?.Water||0));break;
      case 'miracleLeaf':if(Array.from({length:Math.min(100,energy(def))},()=>flip()).some(Boolean))request('option',{options:['Asleep','Confused','Poisoned'],effect:{...effect,rule:'destiny:miracleLeafPick'}});break;
      case 'miracleLeafPick':{const status=['sleep','confusion','poison'][Number(ctx.action?.choiceOption)];if(status&&def)def.conditions={...(def.conditions||{}),[status]:true};break;}
      case 'whiteHotFlame':drop(att,ss,'Fire',1);drop(att,ss,'Lightning',1);if(!flip())damage(att,30);break;
      case 'lightningCut':if(effect.heads){for(const s of foe.bench)damage(s,10);}else damage(att,10);break;
      case 'reflectShield':if(att)att.neoDestinyReflectUntil=ctx.state.turnNumber+1;break;
      case 'psyburst':drop(att,ss,'Fire',1);break;
      case 'flashingEyes':{const heads=Number(effect.heads||0),status=heads===1?'sleep':heads===2?'confusion':heads===3?'paralysis':null;if(def&&status)def.conditions={...(def.conditions||{}),[status]:true};break;}
      case 'thundersquall':if(foe.bench.length)choose('foe','thundersquallPick',true);break;
      case 'thundersquallPick':damage(selected(foe),10*Number(att?.energy?.Water||0));break;
      case 'crushingEarth':{if(effect.heads)for(const board of [ss,foe])for(const s of board.bench)damage(s,10);if(att)att.neoDestinyCannotAttackUntil=ctx.state.turnNumber+2;break;}
      case 'mountainCrush':{for(let i=0;i<100&&flip();i++){if(foe.deck.length)foe.discard.push(foe.deck.shift());}break;}
      case 'destructiveFire':{const hits=Number(effect.heads||0);drop(att,ss,'Fire',hits);for(let i=0;i<hits;i++)applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},ctx);break;}
      case 'lightWave':if(att)att.neoDestinyPreventEffectsUntil=ctx.state.turnNumber+1;break;
      case 'impostorOak':{if(!foe.prizes?.length)break;const old=foe.prizes.splice(0);foe.deck.push(...old);ctx.shuffle?.(ctx.state,foe.deck);foe.prizes.push(...foe.deck.splice(0,old.length));log({replacedPrizes:old.length});break;}
      case 'radioTower':log({topTwoCards:ss.deck.slice(0,2).map(r=>r.cardId)});break;
      case 'luckyStadium':if(flip())draw(ss,1);break;
      case 'energyStadium':if(flip()){const type=Object.entries(ss.energyDiscard||{}).find(([t,n])=>n>0)?.[0];if(type){ss.energyDiscard[type]--;neoRecoveredEnergyToHand(ctx,ss,type,1);}}break;
      case 'thoughtWave':{let heads=0;for(let i=0;i<100&&flip();i++)heads++;const types=Object.entries(foe.active?.energy||{}).filter(([,n])=>n>0);for(let i=0;i<heads&&types.length;i++){const [type]=types[i%types.length];if(foe.active?.energy?.[type]>0){foe.active.energy[type]--;neoRecoveredEnergyToHand(ctx,foe,type,1);}}ctx.endTurn?.();break;}
      case 'counterattackClaws':{const meta=ctx.eventData;if(!meta?.source?.attack||!meta.attacker||ss.active!==att)break;if(flip())damage(meta.attacker,20);const ref=ctx.sourceTool;if(ref){if(att.tool?.uid===ref.uid)att.tool=att.extraTools?.shift()||null;else att.extraTools=(att.extraTools||[]).filter(r=>r.uid!==ref.uid);ss.discard.push(ref);}break;}
      case 'expAll':break; // Handled at KO by the normal Energy-transfer hook.
      case 'energyAmplifier':{const i=ss.hand.findIndex(r=>ctx.cardById(r.cardId)?.basicEnergy);if(i<0)break;const [ref]=ss.hand.splice(i,1);ss.deck.push(ref);ctx.shuffle?.(ctx.state,ss.deck);if(flip()){const type=ctx.cardById(ref.cardId)?.subtype;neoEnergyToHand(ctx,ss,type,Math.min(3,ss.energySupply?.filter(t=>t===type).length||3));}break;}
      case 'personalityTest':{const evo=ss.hand.find(r=>{const c=ctx.cardById(r.cardId);return c?.kind==='pokemon'&&c.stage!=='Basic';});if(!evo)break;request('option',{side:'opponent',options:['Light','Dark','Neither'],effect:{...effect,rule:'destiny:personalityTestPick',cardId:evo.cardId}});break;}
      case 'personalityTestPick':{const name=ctx.cardById(effect.cardId)?.name||'',category=name.startsWith('Light ')?0:name.startsWith('Dark ')?1:2;draw(Number(ctx.action?.choiceOption)===category?foe:ss,3);break;}
      case 'evilDeeds':if(foe.hand.length)request('opponentHandCard',{effect:{...effect,rule:'destiny:evilDeedsPick'}});break;
      case 'evilDeedsPick':{const i=Number(ctx.action?.choiceHandIndex);if(foe.hand[i]){foe.deck.push(...foe.hand.splice(i,1));ctx.shuffle?.(ctx.state,foe.deck);}request('option',{side:'opponent',options:['Draw 0','Draw 1','Draw 2'],effect:{...effect,rule:'destiny:evilDeedsDraw'}});break;}
      case 'evilDeedsDraw':draw(foe,Math.max(0,Math.min(2,Number(ctx.action?.choiceOption))));break;
      default:throw new Error('Unsupported Neo Destiny rule: '+rule);
    }
  }


  // Expedition introduces new Poké-Powers, special energy management, and
  // optional attacks. Unsupported mechanics are not marked playable by the
  // Expedition registry; never silently fall through as a no-op.
  function expeditionRule(effect,ctx){
    const rule=String(effect.rule||'').slice('expedition:'.length);
    const ss=own(ctx),foe=other(ctx),a=ctx.attacker,d=ctx.defender,act=ctx.action||{};
    const slots=board=>pokemonOn(board),card=slot=>ctx.cardById(slot?.cardId);
    const selected=board=>act.choiceTarget==='active'?board.active:
      board.bench.find(slot=>Number(slot.benchSlot)===Number(act.choiceBenchIndex));
    const req=(kind,extra={})=>ctx.requestChoice?.({kind,side:'self',...extra,effect:{type:'neoRule',rule:'expedition:'+rule,...(extra.continuation||{})}});
    const choose=(which,next,opts={})=>ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:which==='opponent'?ctx.foeSide:ctx.side,
      includeActive:opts.includeActive!==false,optional:!!opts.optional,excludeUids:opts.excludeUids,
      effect:{...effect,rule:'expedition:'+next}});
    const flip=()=>{const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Expedition '+rule,heads,results:[heads]});return heads;};
    const heal=(slot,n)=>{if(slot&&Number(slot.damage||0)>0&&!healingIsBlocked(ctx.state,slot,ctx.cardById))slot.damage=Math.max(0,Number(slot.damage||0)-n);};
    const add=(slot,type,n)=>{if(!slot||n<=0)return;slot.energy=slot.energy||{};slot.energy[type]=Number(slot.energy[type]||0)+n;ctx.onEnergyAttached?.(slot,type,n);};
    const drop=(slot,board,type,n)=>{if(!slot)return 0;const v=Math.min(Number(slot.energy?.[type]||0),n);if(v){slot.energy[type]-=v;recordDiscardedEnergy(board,type,v);}return v;};
    const energyTotal=board=>slots(board).reduce((sum,slot)=>sum+totalEnergy(slot.energy)+(slot.specialEnergy||[]).length,0);
    const log=extra=>ctx.state.log.push({type:'expeditionEffect',rule,side:ctx.side,...extra});
    switch(rule){
      case 'psymimic':case 'harvestBounty':break; // handled by attack and Energy attachment paths
      case 'harvestOffer':{
        const source=slots(ss).find(slot=>slot.uid===effect.sourceUid);
        if(!source||!['ecard1-30','ecard1-68'].includes(source.cardId)||
           source.harvestBountyUsedTurn===ctx.state.turnNumber||
           (source.conditions?.sleep||source.conditions?.paralysis||source.conditions?.confusion||source.conditions?.poison||source.conditions?.burn)||
           abilitiesSuppressed(ctx.state,ctx.side,source,ctx.cardById)||!ss.active||!ss.energySupply?.length)break;
        ctx.requestChoice?.({kind:'option',side:'self',options:['Skip extra Energy','Attach '+ss.energySupply[0]+' Energy'],
          effect:{type:'neoRule',rule:'expedition:harvestBountyPick',sourceUid:source.uid}});break;
      }
      case 'harvestBountyPick':{
        if(Number(act.choiceOption)!==1||!ss.active||!ss.energySupply?.length)break;
        const source=slots(ss).find(slot=>slot.uid===effect.sourceUid);
        if(!source||source.harvestBountyUsedTurn===ctx.state.turnNumber||
           (source.conditions?.sleep||source.conditions?.paralysis||source.conditions?.confusion||source.conditions?.poison||source.conditions?.burn)||
           abilitiesSuppressed(ctx.state,ctx.side,source,ctx.cardById))break;
        const type=ss.energySupply.shift();ss.nextEnergyType=ss.energySupply[0]||null;
        source.harvestBountyUsedTurn=ctx.state.turnNumber;
        add(ss.active,type,1);log({sourceCardId:source.cardId,energyType:type,attachedTo:ss.active.cardId});break;
      }
      case 'lightningStrikeDiscard':{
        if(!a)break;
        drop(a,ss,'Lightning',Number(a.energy?.Lightning||0));
        for(const ref of [...(a.specialEnergy||[])]){
          const provides=ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{};
          if(Number(provides.Lightning||0)<=0)continue;
          a.specialEnergy=a.specialEnergy.filter(x=>x.uid!==ref.uid);ss.discard.push(ref);
        }
        log({discardedLightning:true});break;
      }
      // Attack-only damage rules are processed by resolveAttack, and must not be
      // applied again after the damage has resolved.
      case 'syncroblast':case 'energyCannon':case 'rendingJaws':case 'ironFist':
      case 'dogpile':case 'spiralWave':case 'waterPunch':case 'lightningStrike':break;
      case 'scorchingWhirlwind':{
        const tails=Number(!flip())+Number(!flip());if(tails===2)
          applyEffect({type:'discardEnergyCard',target:'self',amount:'all'},ctx);
        else if(tails===1)applyEffect({type:'discardEnergyCard',target:'self',amount:2},ctx);
        break;
      }
      case 'etherealFlame':{
        const n=Math.max(0,Number(effect.discardFire||0));drop(a,ss,'Fire',n);break;
      }
      case 'shockBolt':if(a)drop(a,ss,'Lightning',Math.max(0,Number(a.energy?.Lightning||0)));break;
      case 'mislead':if(([flip(),flip()].some(Boolean))&&d){d.conditions=d.conditions||{};d.conditions.confusion=true;}break;
      case 'rockSlide':if(foe.bench.length)choose('opponent','rockSlidePick',{includeActive:false});break;
      case 'rockSlidePick':{const slot=selected(foe);if(slot)slot.damage=Number(slot.damage||0)+10;
        if(slot&&foe.bench.length>1)ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:ctx.foeSide,
          includeActive:false,excludeUids:[slot.uid],optional:true,effect:{...effect,rule:'expedition:rockSlideSecond'}});break;}
      case 'rockSlideSecond':{const slot=selected(foe);if(slot)slot.damage=Number(slot.damage||0)+10;break;}
      case 'energyCatch':case 'plasma':{
        const type=rule==='plasma'?'Lightning':Object.entries(ss.energyDiscard||{}).find(([,n])=>Number(n)>0)?.[0];
        if(type&&Number(ss.energyDiscard?.[type]||0)>0){ss.energyDiscard[type]--;neoRecoveredEnergyToHand(ctx,ss,type,1);log({recoveredEnergy:type});}break;
      }
      case 'soothingAroma':for(const slot of slots(ss))heal(slot,10);break;
      case 'bindWound':choose('self','bindWoundPick');break;
      case 'bindWoundPick':heal(selected(ss),20);break;
      case 'energyDraw':{
        const type=ss.energySupply?.[0]||ss.energyType;if(type)neoSupplyAttach(ctx,ss,a,type,1);break;
      }
      case 'energyRecall':{
        const type=Object.entries(ss.energyDiscard||{}).find(([,n])=>Number(n)>0)?.[0];
        if(type){const n=Math.min(2,Number(ss.energyDiscard[type]||0));ss.energyDiscard[type]-=n;add(a,type,n);log({recoveredEnergy:type,amount:n});}break;
      }
      case 'reflectEnergy':if(a&&ss.bench.length&&Object.values(a.energy||{}).some(n=>n>0)){
        ctx.requestChoice?.({kind:'energySource',side:'self',selectionSide:ctx.side,includeActive:true,
          effect:{...effect,rule:'expedition:reflectEnergySource'}});
      }break;
      case 'reflectEnergySource':{
        const type=act.effectEnergyType;
        if(a&&type&&Number(a.energy?.[type]||0)>0&&ss.bench.length)
          ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:ctx.side,includeActive:false,
            effect:{...effect,rule:'expedition:reflectEnergyPick',energyType:type}});
        break;}
      case 'reflectEnergyPick':{const slot=selected(ss);if(slot&&a&&slot!==a&&drop(a,ss,effect.energyType,1)){ss.energyDiscard[effect.energyType]--;add(slot,effect.energyType,1);}break;}
      case 'energyPatch':{
        ctx.requestChoice?.({kind:'energySource',side:'self',selectionSide:ctx.side,
          effect:{...effect,rule:'expedition:energyPatchSource'}});break;
      }
      case 'energyPatchSource':{
        const source=selected(ss),type=act.effectEnergyType;
        if(source&&type&&Number(source.energy?.[type]||0)>0)
          ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:ctx.side,includeActive:true,
            excludeUids:[source.uid],effect:{...effect,rule:'expedition:energyPatchTarget',sourceUid:source.uid,energyType:type}});
        break;
      }
      case 'energyPatchTarget':{
        const source=slots(ss).find(slot=>slot.uid===effect.sourceUid),dest=selected(ss);
        if(source&&dest&&source!==dest&&Number(source.energy?.[effect.energyType]||0)>0){source.energy[effect.energyType]--;add(dest,effect.energyType,1);}break;
      }
      case 'burningEnergy':{
        // This turn only: convert attached Basic Energy, not Special Energy.
        for(const slot of slots(ss))slot.expeditionBasicFireUntil=ctx.state.turnNumber;
        log({basicFireConversion:true});break;
      }
      case 'moonlight':{
        if(ss.hand.length)ctx.requestChoice?.({kind:'handCard',side:'self',effect:{...effect,rule:'expedition:moonlightPick'}});break;
      }
      case 'moonlightPick':{
        const i=Number(act.choiceHandIndex),ref=ss.hand[i];if(!ref)break;
        ss.deck.push(...ss.hand.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);
        // Basic Energy belongs to the ordered Classic Energy Zone.
        const type=ss.energySupply?.[0]||ss.energyType;if(type)neoEnergyToHand(ctx,ss,type,1);break;
      }
      case 'beatingWings':{
        if(a===ss.active&&ss.bench.length)choose('self','beatingWingsPick',{includeActive:false});break;
      }
      case 'beatingWingsPick':{
        const slot=selected(ss);if(!slot||!ss.bench.includes(slot))break;
        const refs=[...(slot.stack||[slot.cardId]).map((cardId,i)=>({uid:slot.uid+'-expedition-'+i,cardId})),
          ...(slot.specialEnergy||[]),...(slot.temporaryTrainers||[]),...(slot.extraTools||[])];
        if(slot.tool)refs.push(slot.tool);
        for(const [type,n] of Object.entries(slot.energy||{}))for(let j=0;j<Number(n||0);j++){
          // Generated Energy returns to the separate ordered supply when shuffled.
          if(Array.isArray(ss.energySupply))ss.energySupply.push(type);
        }
        ss.deck.push(...refs);ss.bench.splice(ss.bench.indexOf(slot),1);
        ctx.shuffle?.(ctx.state,ss.deck);log({returnedPokemon:slot.cardId,cardCount:refs.length});break;
      }
      case 'chaosMove':{
        if((foe.prizes||[]).length>3)break;
        ctx.requestChoice?.({kind:'option',side:'self',options:['Move damage from my Pokémon','Move damage from opponent Pokémon'],
          effect:{...effect,rule:'expedition:chaosMoveSourceSide'}});break;
      }
      case 'chaosMoveSourceSide':{
        const sourceSide=Number(act.choiceOption)===1?'opponent':'self';
        if(slots(sourceSide==='self'?ss:foe).some(slot=>Number(slot.damage||0)>0))
          ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:sourceSide==='self'?ctx.side:ctx.foeSide,
            includeActive:true,effect:{...effect,rule:'expedition:chaosMoveSource',sourceSide}});
        break;
      }
      case 'chaosMoveSource':{
        const src=selected(effect.sourceSide==='self'?ss:foe);
        if(!src||Number(src.damage||0)<10)break;
        ctx.requestChoice?.({kind:'option',side:'self',options:['Move to my Pokémon','Move to opponent Pokémon'],
          effect:{...effect,rule:'expedition:chaosMoveTargetSide',sourceUid:src.uid}});break;
      }
      case 'chaosMoveTargetSide':{
        const targetSide=Number(act.choiceOption)===1?'opponent':'self';
        ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:targetSide==='self'?ctx.side:ctx.foeSide,
          includeActive:true,excludeUids:[effect.sourceUid],effect:{...effect,rule:'expedition:chaosMoveTarget',targetSide}});break;
      }
      case 'chaosMoveTarget':{
        const src=[...slots(ss),...slots(foe)].find(slot=>slot.uid===effect.sourceUid);
        const target=selected(effect.targetSide==='self'?ss:foe);
        if(src&&target&&src!==target&&Number(src.damage||0)>=10){src.damage-=10;target.damage=Number(target.damage||0)+10;
          log({from:src.cardId,to:target.cardId,amount:10});}break;
      }
      case 'energyConnect':{
        if(ss.active&&ss.bench.some(slot=>Object.values(slot.energy||{}).some(n=>n>0)))
          ctx.requestChoice?.({kind:'energySource',side:'self',selectionSide:ctx.side,includeActive:false,
            effect:{...effect,rule:'expedition:energyConnectPick'}});
        break;
      }
      case 'energyConnectPick':{
        const src=selected(ss),type=act.effectEnergyType;
        if(src&&src!==ss.active&&type&&Number(src.energy?.[type]||0)>0){src.energy[type]--;add(ss.active,type,1);}break;
      }
      case 'jetStream':{
        if(!a||!d)break;
        if(!flip())break;
        applyEffect({type:'discardEnergyCard',target:'self',amount:1},ctx);
        applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},ctx);
        break;
      }
      case 'plunge':{
        if(!a||!ss.active||a===ss.active||!flip())break;
        const outgoing=ss.active;
        for(const [type,n] of Object.entries(outgoing.energy||{})){add(a,type,Number(n||0));outgoing.energy[type]=0;}
        a.specialEnergy=[...(a.specialEnergy||[]),...(outgoing.specialEnergy||[])];outgoing.specialEnergy=[];
        if(a.benchSlot!=null)switchPokemon(ss,a.benchSlot,ctx.state);break;
      }
      case 'majorTsunami':{
        if(foe.bench.length)ctx.requestChoice?.({kind:'pokemon',side:'opponent',selectionSide:ctx.foeSide,includeActive:false,
          effect:{...effect,rule:'expedition:majorTsunamiOpponent'}});
        else expeditionRule({...effect,rule:'expedition:majorTsunamiSelf'},ctx);
        break;
      }
      case 'majorTsunamiOpponent':{
        const slot=selected(foe);if(slot?.benchSlot!=null)switchPokemon(foe,slot.benchSlot,ctx.state);
        expeditionRule({...effect,rule:'expedition:majorTsunamiSelf'},ctx);break;
      }
      case 'majorTsunamiSelf':if(ss.bench.length)choose('self','majorTsunamiSelfPick',{includeActive:false});break;
      case 'majorTsunamiSelfPick':{const slot=selected(ss);if(slot?.benchSlot!=null)switchPokemon(ss,slot.benchSlot,ctx.state);break;}
      case 'heatUp':{
        if(energyTotal(foe)<=energyTotal(ss)||!ss.bench.length)break;
        ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:ctx.side,includeActive:false,
          effect:{...effect,rule:'expedition:heatUpPick'}});break;
      }
      case 'heatUpPick':{const slot=selected(ss);if(slot)neoSupplyAttach(ctx,ss,slot,'Fire',1);break;}
      case 'billsMaintenance':{
        if(ss.hand.length)ctx.requestChoice?.({kind:'handCard',side:'self',effect:{...effect,rule:'expedition:billsMaintenancePick'}});break;
      }
      case 'billsMaintenancePick':{const i=Number(act.choiceHandIndex),ref=ss.hand[i];if(ref){ss.deck.push(...ss.hand.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);for(let k=0;k<3;k++)ctx.drawCard?.(ss);}break;}
      case 'energyRestore':{
        const heads=[flip(),flip(),flip()].filter(Boolean).length;let left=heads;
        while(left-->0){const type=Object.entries(ss.energyDiscard||{}).find(([,n])=>Number(n)>0)?.[0];if(!type)break;ss.energyDiscard[type]--;neoRecoveredEnergyToHand(ctx,ss,type,1);}break;
      }
      case 'powerCharge':{
        if(!flip())break;
        let remaining=2;
        for(const [type,n] of Object.entries(ss.energyDiscard||{}))while(remaining>0&&ss.energyDiscard[type]>0){
          ss.energyDiscard[type]--;ss.energySupply=ss.energySupply||[];ss.energySupply.push(type);remaining--;
        }
        const refs=ss.discard.filter(ref=>ctx.cardById(ref.cardId)?.basicEnergy).slice(0,remaining);
        for(const ref of refs){ss.discard.splice(ss.discard.indexOf(ref),1);ss.deck.push(ref);}
        ctx.shuffle?.(ctx.state,ss.deck);break;
      }
      case 'elmsTrainingMethod':{
        if(ss.deck.some(ref=>['Stage 1','Stage 2'].includes(ctx.cardById(ref.cardId)?.stage)))
          ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'pokemon',evolved:true},
            effect:{...effect,rule:'expedition:elmsTrainingMethodPick'}});
        break;
      }
      case 'elmsTrainingMethodPick':{
        const i=Number(act.choiceDeckIndex),ref=ss.deck[i];
        if(ref&&['Stage 1','Stage 2'].includes(ctx.cardById(ref.cardId)?.stage)){
          ss.hand.push(...ss.deck.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);
        }break;
      }
      case 'pokemonNurse':choose('self','pokemonNursePick');break;
      case 'pokemonNursePick':{
        const slot=selected(ss);if(!slot)break;heal(slot,9999);
        for(const [type,n] of Object.entries(slot.energy||{}))drop(slot,ss,type,Number(n)||0);
        ss.discard.push(...(slot.specialEnergy||[]));slot.specialEnergy=[];break;
      }
      case 'superScoopUp':if(flip())choose('self','superScoopUpPick');break;
      case 'superScoopUpPick':{
        const slot=selected(ss);if(slot)applyEffect({type:'scoopUp',target:slot===ss.active?'selfActive':'selfBench'},
          {...ctx,attacker:slot,trainerRef:{cardId:'ecard1-151'}});break;
      }
      case 'energySearch':{
        const type=ss.energySupply?.[0]||ss.energyType;
        if(type)neoEnergyToHand(ctx,ss,type,1);break;
      }
      // Master Ball reveals seven cards and selects just ONE eligible Pokémon.
      // Unlike takeTopMatching, this must never take every Pokémon in the top seven.
      case 'masterBall':{
        const count=Math.min(7,ss.deck.length);
        if(count&&ss.deck.slice(0,count).some(ref=>ctx.cardById(ref.cardId)?.kind==='pokemon'))
          ctx.requestChoice?.({kind:'topDeckCard',side:'self',deckSide:ctx.side,count,
            filter:{kind:'pokemon'},optional:true,effect:{...effect,rule:'expedition:masterBallPick'}});
        else ctx.shuffle?.(ctx.state,ss.deck);
        break;
      }
      case 'masterBallPick':{
        const i=Number(act.choiceDeckIndex),n=Math.min(7,ss.deck.length);
        if(!act.choiceSkip&&Number.isInteger(i)&&i>=0&&i<n&&ctx.cardById(ss.deck[i]?.cardId)?.kind==='pokemon')
          ss.hand.push(...ss.deck.splice(i,1));
        ctx.shuffle?.(ctx.state,ss.deck);break;
      }
      // The player choosing Pokémon Reversal picks the opposing Bench target;
      // it is NOT the opponent's choice (unlike forced-switch effects).
      case 'pokemonReversal':if(foe.bench.length)choose('opponent','pokemonReversalPick',{includeActive:false});break;
      case 'pokemonReversalPick':{
        const target=selected(foe);
        if(target&&foe.bench.includes(target)&&flip())switchPokemon(foe,target.benchSlot,ctx.state);
        break;
      }
      default:throw new Error('Unsupported Expedition rule: '+rule);
    }
  }

  // Skyridge e-Card follow-up actions, executed after attack damage through the
  // same effect-choice pipeline. We deliberately never invent choices or Energy.
  function skyridgeRule(e,ctx){
    const rule=e.rule.slice('skyridge:'.length),us=own(ctx),them=other(ctx),self=ctx.attacker;
    const log=(more={})=>ctx.state.log.push({type:'skyridgeEffect',side:ctx.side,rule,...more});
    switch(rule){
      case 'pollenShield':if(self){self.neoPollenShield={expiresTurn:ctx.state.turnNumber+1};log({protectedUntil:self.neoPollenShield.expiresTurn});}break;
      case 'miraclePowderChoice':{
        const statuses=['sleep','burn','confusion','paralysis','poison'];
        if(ctx.resolvingChoice){const status=statuses[Number(ctx.action?.choiceOption)];if(status)applyEffect({type:'status',target:'opponentActive',status},ctx);}
        else ctx.requestChoice?.({kind:'option',side:'self',options:['Asleep','Burned','Confused','Paralyzed','Poisoned'],effect:e});
        break;
      }
      case 'fastBall':{
        // Reveal until the first Evolution. No choice, no replacement and shuffle
        // every non-selected revealed card back into the deck afterwards.
        const idx=us.deck.findIndex(ref=>{const c=ctx.cardById(ref.cardId);return c?.kind==='pokemon'&&['Stage 1','Stage 2'].includes(c.stage);});
        if(idx>=0){const [ref]=us.deck.splice(idx,1);us.hand.push(ref);log({found:ref.cardId,revealed:idx+1});}
        else log({found:null,revealed:us.deck.length});
        ctx.shuffle?.(ctx.state,us.deck);break;
      }
      case 'lureBall':{
        const results=[coin(ctx),coin(ctx),coin(ctx)],heads=results.filter(Boolean).length;
        ctx.state.log.push({type:'coin',side:ctx.side,reason:'Skyridge Lure Ball',heads,results});
        if(heads)applyEffect({type:'searchChosen',source:'discard',amount:heads,filter:{kind:'pokemon',stage:['Stage 1','Stage 2']}},ctx);
        break;
      }
      case 'energyHeal':{
        const valid=pokemonOn(us).filter(slot=>Number(Object.values(slot.energy||{}).reduce((n,v)=>n+Number(v||0),0))+(slot.specialEnergy||[]).length>0);
        if(ctx.resolvingChoice){const selectedSlot=selected(ctx,us);if(valid.includes(selectedSlot)&&!healingIsBlocked(ctx.state,selectedSlot,ctx.cardById))selectedSlot.damage=Math.max(0,Number(selectedSlot.damage||0)-10);}
        else if(valid.length)ctx.requestChoice?.({kind:'pokemon',side:'self',includeActive:true,effect:e});
        break;
      }
      case 'callFriends':case 'callNidoran':{
        if(us.bench.length>=Number(us.benchLimit||3))break;
        const filter=rule==='callFriends'?{kind:'pokemon',stage:['Basic','Baby']}:{kind:'pokemon',stage:'Basic',name:['Nidoran ♀','Nidoran ♂']};
        const allowed=c=>matchesFilter(c,filter);
        if(ctx.resolvingChoice){if(ctx.action?.choiceSkip)break;const i=Number(ctx.action?.choiceDeckIndex),ref=us.deck[i];
          if(ref&&allowed(ctx.cardById(ref.cardId))){us.deck.splice(i,1);ctx.benchCard?.(us,ref);}ctx.shuffle?.(ctx.state,us.deck);
        }else if(us.deck.some(ref=>allowed(ctx.cardById(ref.cardId))))ctx.requestChoice?.({kind:'deckCard',side:'self',filter,effect:e});
        break;
      }
      case 'warpHoleChoose':{
        if(!ctx.resolvingChoice){if(us.discard.length)ctx.requestChoice?.({kind:'discardCard',side:'self',optional:true,effect:e});break;}
        if(ctx.action?.choiceSkip)break;
        const index=Number(ctx.action?.choiceDiscardIndex);
        if(Number.isInteger(index)&&index>=0&&index<us.discard.length){const [ref]=us.discard.splice(index,1);us.deck.unshift(ref);log({returned:ref.cardId});}
        break;
      }
      case 'strangeSpiral':{
        if(!self||!them.active)break;
        const types=Object.entries(self.energy||{}).filter(([,n])=>Number(n)>0).map(([t])=>t);
        if(ctx.resolvingChoice){
          const t=e.energyTypes?.[Number(ctx.action?.choiceOption)];
          if(!t||!Number(self.energy?.[t]||0))break;
          self.energy[t]--;us.energyDiscard=us.energyDiscard||{};
          us.energyDiscard[t]=Number(us.energyDiscard[t]||0)+1;
          applyEffect({type:'status',target:'opponentActive',status:'confusion'},ctx);log({discarded:t});
        }else if(types.length)ctx.requestChoice?.({kind:'option',side:'self',options:types.map(t=>'Discard '+t+' Energy'),effect:{...e,energyTypes:types}});
        break;
      }
      case 'goodNeighbor':{
        if(!self||!us.bench.includes(self))break;
        if(!ctx.resolvingChoice){
          if(Number(us.skyridgeGoodNeighborTurn)===Number(ctx.state.turnNumber))break;
          us.skyridgeGoodNeighborTurn=ctx.state.turnNumber;
          const result=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Skyridge Good Neighbor',heads:result,results:[result]});
          if(result)ctx.requestChoice?.({kind:'option',side:'self',options:['Heal 0','Heal 10','Heal 20'],effect:{...e,stage:'self'}});
        }else{
          const target=e.stage==='opponent'?them.active:us.active;
          const amount=Math.min(20,10*Math.max(0,Math.min(2,Number(ctx.action?.choiceOption||0))));
          if(target&&!healingIsBlocked(ctx.state,target,ctx.cardById))target.damage=Math.max(0,Number(target.damage||0)-amount);
          log({healAmount:amount,stage:e.stage});
          if(e.stage==='self')ctx.requestChoice?.({kind:'option',side:'opponent',options:['Heal 0','Heal 10','Heal 20'],effect:{...e,stage:'opponent'}});
        }
        break;
      }
      case 'empathicHealing':{
        if(!self)return;const types=effectiveTypes(ctx.state,ctx.side,self,ctx.cardById);
        for(const side of [ctx.side,ctx.foeSide])for(const slot of pokemonOn(ctx.state.sides[side])){
          if(slot!==self&&!effectiveTypes(ctx.state,side,slot,ctx.cardById).some(t=>types.includes(t)))continue;
          if(!healingIsBlocked(ctx.state,slot,ctx.cardById))slot.damage=Math.max(0,Number(slot.damage||0)-20);
        }log({type:types});break;
      }
      default:throw new Error('Unsupported Skyridge follow-up: '+rule);
    }
  }

  // Aquapolis e-Card exact-effect handlers. Each step uses the same effect-choice
  // UI/CPU state machine as Expedition, with a legal choice rather than random
  // card movement. An action chain never touches the generated Energy Zone.
  function aquapolisRule(e,ctx){
    const rule=e.rule.slice('aquapolis:'.length),ss=own(ctx),foe=other(ctx),a=ctx.attacker,d=ctx.defender;
    const card=r=>ctx.cardById(r?.cardId),refOK=(r,filter)=>matchesFilter(card(r),filter,r);
    const request=(kind,filter,next,extra={})=>ctx.requestChoice?.({kind,side:'self',filter,effect:{...e,rule:'aquapolis:'+next},...extra});
    const log=(details={})=>ctx.state.log.push({type:'aquapolisEffect',rule,side:ctx.side,...details});
    const flip=()=>{const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Aquapolis '+rule,heads,results:[heads]});return heads;};
    const basic={basicEnergy:true},recover={classicRecoverable:true};
    const attach=(target,ref)=>{
      if(!target||!ref)return false;const c=card(ref);if(!c?.basicEnergy&&!c?.specialEnergy)return false;
      if(c.basicEnergy){target.energy=target.energy||{};target.energy[c.subtype]=Number(target.energy[c.subtype]||0)+1;ctx.onEnergyAttached?.(target,c.subtype,1);}
      else{target.specialEnergy=target.specialEnergy||[];target.specialEnergy.push(ref);ctx.onEnergyAttached?.(target,Object.keys(c.effect?.provides||{})[0]||'Colorless',1);}
      return true;
    };
    const choiceIndex=kind=>ctx.action?.[kind],pickTarget=(board)=>selected(ctx,board);
    switch(rule){
      case 'warpEnergySwitch':{
        if(ctx.resolvingChoice&&ss.bench.some(x=>Number(x.benchSlot)===Number(ctx.action?.choiceBenchIndex))){
          switchPokemon(ss,ctx.action.choiceBenchIndex,ctx.state);
          log({switchedTo:ss.active?.cardId});
        }
        return;
      }
      case 'glueySlimePassive':case 'suctionCupsPassive':case 'denseBodyPassive':case 'conductiveBodyPassive':case 'energyBarrierPassive':case 'enervatingPollenPassive':return;
      case 'spiralAura':{
        // This is a post-damage switch; the attack does not force a switch if KO.
        if(!d||d!==foe.active||Number(d.damage||0)>=Number(card(d)?.hp||0)||!foe.bench.length)return;
        if(ctx.resolvingChoice){const chosen=Number(choiceIndex('choiceBenchIndex'));if(foe.bench.some(x=>Number(x.benchSlot)===chosen))switchPokemon(foe,chosen,ctx.state);return;}
        request('pokemon',undefined,'spiralAura',{selectionSide:ctx.foeSide,includeActive:false,optional:true});return;
      }
      case 'flowerSupplement':{
        const eligible=ss.hand.filter(ref=>card(ref)?.basicEnergy),benches=ss.bench.filter(Boolean);
        if(ctx.resolvingChoice&&e.selectedUid){const target=pickTarget(ss),i=ss.hand.findIndex(ref=>ref.uid===e.selectedUid);if(target&&benches.includes(target)&&i>=0&&eligible.includes(ss.hand[i])){const ref=ss.hand[i];if(attach(target,ref)){ss.hand.splice(i,1);log({attached:ref.cardId,target:target.cardId});}}return;}
        if(ctx.resolvingChoice){const ref=ss.hand[choiceIndex('choiceHandIndex')];if(ref&&eligible.includes(ref)&&benches.length)request('pokemon',undefined,'flowerSupplement',{includeActive:false,optional:true,effect:{...e,selectedUid:ref.uid}});return;}
        if(eligible.length&&benches.length&&flip())request('handCard',basic,'flowerSupplement',{optional:true});return;
      }
      case 'shuffleAttack':{
        const count=Math.min(foe.deck.length,totalEnergy(d?.energy)+(d?.specialEnergy||[]).length);
        if(count)applyEffect({type:'reorderTop',deckSide:'opponent',count},ctx);return;
      }
      case 'discardSpecial':{
        const found=d?.specialEnergy||[],i=found.findIndex(ref=>ref.uid===e.selectedUid),idx=i<0?0:i;
        if(found.length){const [ref]=found.splice(idx,1);foe.discard.push(ref);log({discarded:ref.cardId});}return;
      }
      case 'plasma':{
        const lightning=Number(ss.energyDiscard?.Lightning||0),candidates=ss.discard.filter(r=>card(r)?.basicEnergy&&card(r)?.subtype==='Lightning');
        if(!lightning&&!candidates.length)return;
        if(!ctx.resolvingChoice){if(!flip())return;if(candidates.length)request('discardCard',{basicEnergy:true,subtype:'Lightning'},'plasma',{optional:true});else{ss.energyDiscard.Lightning--;a.energy.Lightning=Number(a.energy.Lightning||0)+1;log({attached:'Lightning'});}return;}
        const i=choiceIndex('choiceDiscardIndex'),ref=ss.discard[i];if(ref&&candidates.includes(ref)&&attach(a,ref)){ss.discard.splice(i,1);log({attached:ref.cardId});}return;
      }
      case 'electricTackleRecoil':{
        if(!flip()){const amount=10*Number(a?.energy?.Lightning||0);if(a)a.damage=Number(a.damage||0)+amount;log({recoil:amount});}return;
      }
      case 'energyDraw':{
        const candidates=ss.deck.filter(r=>card(r)?.kind==='energy'&&(!e.basicOnly||card(r)?.basicEnergy));
        if(ctx.resolvingChoice&&Number.isInteger(choiceIndex('choiceDeckIndex'))){const i=choiceIndex('choiceDeckIndex');const ref=ss.deck[i];if(ref&&candidates.includes(ref)&&attach(a,ref)){ss.deck.splice(i,1);ctx.shuffle?.(ctx.state,ss.deck);log({attached:ref.cardId});}return;}
        if(candidates.length)request('deckCard',e.basicOnly?basic:{kind:'energy'},'energyDraw',{optional:true});return;
      }
      case 'growthFromHand':case 'grassGrowth':{
        const limit=rule==='grassGrowth'?2:1,eligible=ss.hand.filter(r=>card(r)?.kind==='energy'&&(rule!=='grassGrowth'||card(r)?.basicEnergy&&card(r)?.subtype==='Grass'));
        if(ctx.resolvingChoice&&Number.isInteger(choiceIndex('choiceHandIndex'))){const i=choiceIndex('choiceHandIndex');const ref=ss.hand[i];if(!ref||!eligible.includes(ref)||!attach(a,ref))return;ss.hand.splice(i,1);log({attached:ref.cardId});const left=Number(e.remaining||limit)-1;
          if(left>0&&ss.hand.some(r=>card(r)?.basicEnergy&&card(r)?.subtype==='Grass'))request('handCard',{basicEnergy:true,subtype:'Grass'},rule,{optional:true,effect:{...e,remaining:left}});return;}
        if(eligible.length)request('handCard',rule==='grassGrowth'?{basicEnergy:true,subtype:'Grass'}:{kind:'energy'},rule,{optional:true,effect:{...e,remaining:limit}});return;
      }
      case 'energySupport':{
        const eligible=ss.deck.filter(r=>card(r)?.basicEnergy&&card(r)?.subtype==='Psychic');
        if(ctx.resolvingChoice&&e.selectedUid){const hit=pickTarget(ss),ref=ss.deck.find(r=>r.uid===e.selectedUid);if(hit&&ss.bench.includes(hit)&&ref&&attach(hit,ref)){ss.deck.splice(ss.deck.indexOf(ref),1);ctx.shuffle?.(ctx.state,ss.deck);log({attached:ref.cardId,target:hit.cardId});}return;}
        if(ctx.resolvingChoice){const ref=ss.deck[choiceIndex('choiceDeckIndex')];if(ref&&eligible.includes(ref)&&ss.bench.length)request('pokemon',undefined,'energySupport',{includeActive:false,effect:{...e,selectedUid:ref.uid},optional:true});return;}
        if(eligible.length&&ss.bench.length)request('deckCard',{basicEnergy:true,subtype:'Psychic'},'energySupport',{optional:true});return;
      }
      case 'skedaddle':{if(ss.bench.length)applyEffect({type:'returnToHand',target:'self',returnBasicEnergy:true},ctx);return;}
      case 'dataSort':{
        if(ctx.resolvingChoice){const i=choiceIndex('choiceDiscardIndex'),ref=ss.discard[i];if(ref&&card(ref)?.kind==='trainer'){ss.deck.push(...ss.discard.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);log({returned:ref.cardId});}return;}
        if(ss.discard.some(r=>card(r)?.kind==='trainer'))request('discardCard',{kind:'trainer'},'dataSort');return;
      }
      case 'fishingTail':{
        if(ctx.resolvingChoice){const i=choiceIndex('choiceDiscardIndex'),ref=ss.discard[i];if(ref&&refOK(ref,recover)&&(ss.handLimit==null||ss.hand.length<ss.handLimit)){ss.hand.push(...ss.discard.splice(i,1));log({recovered:ref.cardId});}return;}
        if(ss.discard.some(r=>refOK(r,recover)))request('discardCard',recover,'fishingTail');return;
      }
      case 'minorErrand':{
        if(!ctx.resolvingChoice){const results=[flip(),flip()],heads=results.filter(Boolean).length;if(heads>0&&ss.deck.some(r=>refOK(r,basic)))request('deckCard',basic,'minorErrand',{optional:true,effect:{...e,remaining:heads}});return;}
        const i=choiceIndex('choiceDeckIndex'),ref=ss.deck[i];if(ref&&refOK(ref,basic)&&(ss.handLimit==null||ss.hand.length<ss.handLimit)){ss.hand.push(...ss.deck.splice(i,1));const left=Number(e.remaining||1)-1;if(left>0&&ss.deck.some(r=>refOK(r,basic))){request('deckCard',basic,'minorErrand',{optional:true,effect:{...e,remaining:left}});return;}ctx.shuffle?.(ctx.state,ss.deck);}return;
      }
      case 'fanClub':{
        const filter={kind:'pokemon',stage:['Basic','Baby']};
        if(ctx.resolvingChoice){const i=choiceIndex('choiceDeckIndex'),ref=ss.deck[i];if(ref&&refOK(ref,filter)&&ss.bench.length<Number(ss.benchLimit||3)){if(ctx.benchCard?.(ss,ref)!=null){ss.deck.splice(i,1);const left=Number(e.remaining||2)-1;if(left>0&&ss.bench.length<Number(ss.benchLimit||3)&&ss.deck.some(r=>refOK(r,filter))){request('deckCard',filter,'fanClub',{optional:true,effect:{...e,remaining:left}});return;}ctx.shuffle?.(ctx.state,ss.deck);}}return;}
        if(ss.bench.length<Number(ss.benchLimit||3)&&ss.deck.some(r=>refOK(r,filter)))request('deckCard',filter,'fanClub',{optional:true,effect:{...e,remaining:2}});return;
      }
      case 'seer':{
        const top=ss.deck.splice(0,6),found=top.filter(r=>refOK(r,basic)),other=top.filter(r=>!refOK(r,basic));ss.hand.push(...found);ss.deck.push(...other);ctx.shuffle?.(ctx.state,ss.deck);log({found:found.map(r=>r.cardId)});return;
      }
      case 'energySwitch':{
        const slots=pokemonOn(ss),unit=x=>Object.values(x.energy||{}).some(n=>Number(n)>0);
        if(e.sourceUid){if(ctx.resolvingChoice){const target=pickTarget(ss),source=slots.find(x=>x.uid===e.sourceUid),type=e.energyType;if(target&&source&&target!==source&&Number(source.energy?.[type]||0)>0){source.energy[type]--;target.energy[type]=Number(target.energy[type]||0)+1;log({source:source.cardId,target:target.cardId,energyType:type});}return;}
          request('pokemon',undefined,'energySwitch',{includeActive:true,excludeUids:[e.sourceUid],effect:e});return;}
        if(ctx.resolvingChoice){const source=pickTarget(ss),type=choiceIndex('effectEnergyType');if(source&&type&&Number(source.energy?.[type]||0)>0&&slots.some(x=>x!==source))request('pokemon',undefined,'energySwitch',{includeActive:true,excludeUids:[source.uid],effect:{...e,sourceUid:source.uid,energyType:type}});return;}
        if(slots.length>1&&slots.some(unit))request('energySource',undefined,'energySwitch',{effect:e});return;
      }
      case 'juggler':{
        const filter={basicEnergy:true};
        if(!e.remaining&&ctx.resolvingChoice){const v=Number(choiceIndex('choiceOption'));if(v<=0)return;request('handCard',filter,'juggler',{effect:{...e,remaining:v,original:v}});return;}
        if(e.remaining&&ctx.resolvingChoice){const i=choiceIndex('choiceHandIndex'),ref=ss.hand[i];if(ref&&refOK(ref,filter)){ss.discard.push(...ss.hand.splice(i,1));const left=e.remaining-1;if(left>0&&ss.hand.some(r=>refOK(r,filter)))request('handCard',filter,'juggler',{effect:{...e,remaining:left}});else for(let k=0;k<(e.original>=2?5:3);k++)ctx.drawCard(ss);}return;}
        const n=Math.min(2,ss.hand.filter(r=>refOK(r,filter)).length);if(n)request('option',undefined,'juggler',{options:['Do not discard',...(n>=1?['Discard 1 Basic Energy']:[]),...(n>=2?['Discard 2 Basic Energy']:[])],effect:e});return;
      }
      case 'darkImpact':if(d)d.neoDestinyPowerLockUntil=ctx.state.turnNumber+2;return;
      case 'happyHealing':{
        if(ctx.resolvingChoice){const target=pickTarget(ss);if(target&&ss.bench.includes(target)&&flip()){
          const n=totalEnergy(a?.energy)+(a?.specialEnergy||[]).length;target.damage=Math.max(0,Number(target.damage||0)-n*10);log({healed:target.cardId,energyCards:n});}return;}
        if(ss.bench.length)request('pokemon',undefined,'happyHealing',{includeActive:false,optional:true});return;}
      case 'energyReturn':{
        if(ctx.resolvingChoice){const chosenOption=e.available?.[Number(choiceIndex('choiceOption'))];if(chosenOption){const source=pokemonOn(ss).find(p=>p.uid===chosenOption.sourceUid);if(source){if(chosenOption.energyType&&Number(source.energy?.[chosenOption.energyType]||0)>0){source.energy[chosenOption.energyType]--;ss.hand.push({uid:`aq-return-${ctx.state.turnNumber}-${ss.hand.length}`,cardId:neoBasicIds[chosenOption.energyType]||'base1-99',zoneGenerated:true});}else if(chosenOption.refUid){const i=(source.specialEnergy||[]).findIndex(x=>x.uid===chosenOption.refUid);if(i>=0)ss.hand.push(...source.specialEnergy.splice(i,1));}}return;}const source=pokemonOn(ss).find(p=>p.uid===e.sourceUid),type=e.energyType;
          if(source&&type&&Number(source.energy?.[type]||0)>0){source.energy[type]--;ss.hand.push({uid:`aq-return-${ctx.state.turnNumber}-${ss.hand.length}`,cardId:neoBasicIds[type]||'base1-99',zoneGenerated:true});log({energyReturned:type});}
          else if(source&&e.refUid){const i=(source.specialEnergy||[]).findIndex(r=>r.uid===e.refUid);if(i>=0)ss.hand.push(...source.specialEnergy.splice(i,1));}return;}
        if(a){const choices=pokemonOn(ss).flatMap(x=>[...Object.entries(x.energy||{}).filter(([,n])=>n>0).map(([type])=>({label:card(x)?.name+' '+type,sourceUid:x.uid,energyType:type})),...(x.specialEnergy||[]).map(ref=>({label:card(x)?.name+' '+card(ref)?.name,sourceUid:x.uid,refUid:ref.uid}))]);
          if(choices.length)request('option',undefined,'energyReturn',{options:choices.map(x=>x.label),effect:{...e,available:choices}});}
        return;}
      case 'pureBodyFire':case 'pureBodyWater':case 'fluff':case 'heavyweight':case 'antiLightning':case 'crystalType':case 'healingBerryPassive':case 'timeShardPassive':case 'weaknessGuardPassive':case 'pokemonParkPassive':return;
      case 'ionCoating':{
        if(a){a.aquapolisIonCoatingUntil=ctx.state.turnNumber;log({converted:'Lightning to Water',cardId:a.cardId});}return;}
      case 'magneticFlow':{
        const energized=pokemonOn(foe).filter(p=>totalEnergy(p.energy)+(p.specialEnergy||[]).length>0);
        if(e.sourceUid){if(ctx.resolvingChoice){const target=pickTarget(foe),source=energized.find(p=>p.uid===e.sourceUid),srcType=e.energyType,dstType=ctx.action?.effectEnergyType;
          if(source&&target&&source!==target&&srcType&&dstType&&Number(source.energy?.[srcType]||0)>0&&Number(target.energy?.[dstType]||0)>0){source.energy[srcType]--;target.energy[dstType]--;source.energy[dstType]=(source.energy[dstType]||0)+1;target.energy[srcType]=(target.energy[srcType]||0)+1;log({swapped:[srcType,dstType]});}return;}
          request('energySource',undefined,'magneticFlow',{selectionSide:ctx.foeSide,excludeUids:[e.sourceUid],effect:e});return;}
        if(ctx.resolvingChoice){const src=pickTarget(foe),type=ctx.action?.effectEnergyType;if(src&&type&&Number(src.energy?.[type]||0)>0)request('energySource',undefined,'magneticFlow',{selectionSide:ctx.foeSide,excludeUids:[src.uid],effect:{...e,sourceUid:src.uid,energyType:type}});return;}
        if(energized.length>=2&&flip())request('energySource',undefined,'magneticFlow',{selectionSide:ctx.foeSide});return;}
      case 'strangeTentacles':{
        if(!a||!d||!(totalEnergy(a.energy)+(a.specialEnergy||[]).length>totalEnergy(d.energy)+(d.specialEnergy||[]).length))return;
        if(ctx.resolvingChoice){const i=Number(choiceIndex('choiceDiscardIndex')),ref=foe.discard[i];if(ref&&card(ref)?.kind==='energy'&&attach(d,ref)){foe.discard.splice(i,1);log({attached:ref.cardId});}return;}
        if(foe.discard.some(ref=>card(ref)?.kind==='energy'))request('discardCard',{kind:'energy'},'strangeTentacles',{discardZone:'opponent',optional:true});return;}
      case 'miracleShift':{
        const eligible=pokemonOn(ss).flatMap(slot=>Object.entries(slot.energy||{}).filter(([,n])=>n>0).map(([type])=>({slot,type}))),discardTypes=Object.entries(ss.energyDiscard||{}).filter(([,n])=>n>0).map(([type])=>type);
        if(e.sourceUid){if(ctx.resolvingChoice){const type=e.energyTypes?.[Number(choiceIndex('choiceOption'))]||String(ctx.action?.effectEnergyType||''),target=pokemonOn(ss).find(p=>p.uid===e.sourceUid);if(target&&discardTypes.includes(type)&&Number(target.energy?.[e.energyType]||0)>0){target.energy[e.energyType]--;ss.energyDiscard[e.energyType]=(ss.energyDiscard[e.energyType]||0)+1;ss.energyDiscard[type]--;target.energy[type]=(target.energy[type]||0)+1;log({replacement:type});}return;}
          if(discardTypes.length)request('option',undefined,'miracleShift',{options:discardTypes,effect:{...e,energyTypes:discardTypes}});return;}
        if(ctx.resolvingChoice){const option=e.available?.[Number(choiceIndex('choiceOption'))];if(option)request('option',undefined,'miracleShift',{options:discardTypes,effect:{...e,sourceUid:option.uid,energyType:option.type,energyTypes:discardTypes}});return;}
        if(eligible.length&&discardTypes.length)request('option',undefined,'miracleShift',{options:eligible.map(x=>card(x.slot)?.name+' '+x.type),effect:{...e,available:eligible.map(x=>({uid:x.slot.uid,type:x.type}))}});return;}
      case 'darkMoon':{
        if(!a||!d&&false)return;
        const amount=Number(a?.energy?.Darkness||0)+(a?.specialEnergy||[]).filter(r=>Number((r.provides||card(r)?.effect?.provides||{}).Darkness||0)>0).length,remaining=Number(e.remaining??amount);
        if(!amount||remaining<=0)return;
        if(ctx.resolvingChoice){if(ctx.action?.choiceSkip){for(let n=0;n<Number(e.selected||0);n++)ctx.drawCard?.(foe);ctx.shuffle?.(ctx.state,foe.deck);return;}const i=Number(choiceIndex('choiceHandIndex')),ref=foe.hand[i];if(ref){foe.deck.push(...foe.hand.splice(i,1));log({replaced:ref.cardId});}const left=remaining-1,selected=Number(e.selected||0)+(ref?1:0);if(left>0&&foe.hand.length)request('opponentHandCard',undefined,'darkMoon',{selectionSide:ctx.foeSide,optional:true,effect:{...e,remaining:left,selected}});else{ctx.shuffle?.(ctx.state,foe.deck);for(let n=0;n<selected;n++)ctx.drawCard?.(foe);}return;}
        request('opponentHandCard',undefined,'darkMoon',{selectionSide:ctx.foeSide,optional:true,effect:{...e,remaining,selected:0}});return;}
      case 'scavengerHunt':{
        const remaining=Number(e.remaining||2);
        if(e.phase==='search'){
          if(ctx.resolvingChoice){const i=Number(choiceIndex('choiceDeckIndex')),ref=ss.deck[i];if(ref&&card(ref)?.kind==='energy'){ss.hand.push(...ss.deck.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);}return;}
          if(ss.deck.some(ref=>card(ref)?.kind==='energy'))request('deckCard',{kind:'energy'},'scavengerHunt',{effect:{...e,phase:'search'}});return;}
        if(ctx.resolvingChoice){const i=Number(choiceIndex('choiceHandIndex')),ref=ss.hand[i];if(ref){ss.deck.push(...ss.hand.splice(i,1));const left=remaining-1;if(left>0&&ss.hand.length)request('handCard',undefined,'scavengerHunt',{effect:{...e,remaining:left}});else{ctx.shuffle?.(ctx.state,ss.deck);aquapolisRule({...e,phase:'search'},{...ctx,resolvingChoice:false});}}return;}
        if(ss.hand.length>=2)request('handCard',undefined,'scavengerHunt',{effect:{...e,remaining:2}});return;}
      case 'energyKick':{
        if(!foe.bench.length||!d)return;
        const tokens=[...Object.keys(d.energy||{}).filter(t=>Number(d.energy[t]||0)>0),...(d.specialEnergy||[]).map(ref=>'special:'+ref.uid)];
        if(e.step==='move'){
          if(ctx.resolvingChoice){const target=pickTarget(foe),type=e.energyToken;
            if(!target||!foe.bench.includes(target)||!type)return;
            if(type.startsWith('special:')){
              const i=(d.specialEnergy||[]).findIndex(ref=>ref.uid===type.slice(8));
              if(i>=0){target.specialEnergy=target.specialEnergy||[];const [ref]=d.specialEnergy.splice(i,1);target.specialEnergy.push(ref);log({movedEnergy:ref.cardId,target:target.cardId});}
            }else if(Number(d.energy?.[type]||0)>0){d.energy[type]--;target.energy=target.energy||{};target.energy[type]=(target.energy[type]||0)+1;log({movedEnergy:type,target:target.cardId});}
          }else request('pokemon',undefined,'energyKick',{selectionSide:ctx.foeSide,includeActive:false,effect:e});return;
        }
        if(ctx.resolvingChoice){const type=e.types?.[Number(ctx.action?.choiceOption)];
          if(type&&tokens.includes(type))request('pokemon',undefined,'energyKick',{selectionSide:ctx.foeSide,includeActive:false,effect:{...e,step:'move',energyToken:type}});return;}
        if(tokens.length&&flip())request('option',undefined,'energyKick',{options:tokens.map(t=>t.startsWith('special:')?(card((d.specialEnergy||[]).find(ref=>ref.uid===t.slice(8)))?.name||'Special Energy'):t),effect:{...e,stage:'pickType',types:tokens}});return;}
      case 'burningFang':{
        if(!a)return;const fire=Number(a.energy?.Fire||0);
        if(fire&&String(ctx.action?.effectSelection)==='try'&&flip()){a.energy.Fire--;ss.energyDiscard.Fire=(ss.energyDiscard.Fire||0)+1;applyEffect({type:'status',target:'opponentActive',status:'burn'},ctx);}return;}
      case 'superEggsplosion':case 'fireBlow':case 'heavyMetal':case 'burningSludge':case 'steelWave':case 'snatch':case 'conduction40':case 'lugiaPsychic':return;
      case 'superEnergyRemoval2':{
        const h=Number(flip())+Number(flip()),board=h===2?foe:h===0?ss:null;if(!board?.active)return;
        for(const [type,n] of Object.entries(board.active.energy||{})){board.energyDiscard[type]=(board.energyDiscard[type]||0)+Number(n||0);}board.active.energy={};board.discard.push(...(board.active.specialEnergy||[]));board.active.specialEnergy=[];log({discarded:h===2?'opponent':'self',bothHeads:h===2,bothTails:h===0});return;}
      case 'townVolunteers':{
        const filter={classicRecoverable:true},remaining=Number(e.remaining??5);
        if(ctx.resolvingChoice){if(ctx.action?.choiceSkip){ctx.shuffle?.(ctx.state,ss.deck);return;}const i=Number(choiceIndex('choiceDiscardIndex')),ref=ss.discard[i];if(ref&&refOK(ref,filter)){ss.deck.push(...ss.discard.splice(i,1));log({returned:ref.cardId});}
          if(remaining>1&&ss.discard.some(ref=>refOK(ref,filter)))request('discardCard',filter,'townVolunteers',{optional:true,effect:{...e,remaining:remaining-1}});else ctx.shuffle?.(ctx.state,ss.deck);return;}
        if(ss.discard.some(ref=>refOK(ref,filter)))request('discardCard',filter,'townVolunteers',{optional:true,effect:{...e,remaining:5}});return;}
      case 'powerPlant':{
        if(ctx.resolvingChoice&&e.phase==='discard'){const i=Number(choiceIndex('choiceDiscardIndex')),ref=ss.discard[i];if(ref&&card(ref)?.basicEnergy){ss.hand.push(...ss.discard.splice(i,1));log({taken:ref.cardId});}return;}
        if(ctx.resolvingChoice){const i=Number(choiceIndex('choiceHandIndex')),ref=ss.hand[i];if(ref&&card(ref)?.basicEnergy){ss.discard.push(...ss.hand.splice(i,1));request('discardCard',{basicEnergy:true},'powerPlant',{effect:{...e,phase:'discard'}});}return;}
        if(ss.hand.some(ref=>card(ref)?.basicEnergy)&&ss.discard.some(ref=>card(ref)?.basicEnergy))request('handCard',{basicEnergy:true},'powerPlant',{optional:true});return;}
      case 'underseaRuins':{
        if(ctx.resolvingChoice){const target=pickTarget(ss);if(!target||target.stack?.length<2)return;const old=target.stack.pop();ss.discard.push({uid:`aq-devolve-${ctx.state.turnNumber}-${ss.discard.length}`,cardId:old});target.cardId=target.stack.at(-1);log({devolved:old,to:target.cardId});return;}
        if(pokemonOn(ss).some(slot=>(slot.stack||[]).length>1)&&flip())request('pokemon',{evolved:true},'underseaRuins',{includeActive:true,optional:true});return;}
      case 'apricornForest':{
        if(e.energyType){if(ctx.resolvingChoice){const i=Number(choiceIndex('choiceDeckIndex')),ref=ss.deck[i];if(ref&&card(ref)?.kind==='pokemon'&&card(ref)?.stage==='Basic'&&card(ref)?.types?.includes(e.energyType)&&ss.bench.length<Number(ss.benchLimit||3)){ss.deck.splice(i,1);ctx.benchCard?.(ss,ref);ctx.shuffle?.(ctx.state,ss.deck);log({benched:ref.cardId});}return;}
          request('deckCard',{kind:'pokemon',stage:'Basic',subtype:e.energyType},'apricornForest',{optional:true,effect:e});return;}
        if(ctx.resolvingChoice){const i=Number(choiceIndex('choiceHandIndex')),ref=ss.hand[i],type=card(ref)?.subtype;if(card(ref)?.basicEnergy&&ss.deck.some(r=>card(r)?.stage==='Basic'&&card(r)?.types?.includes(type)))aquapolisRule({...e,energyType:type},{...ctx,resolvingChoice:false});return;}
        if(ss.bench.length>=Number(ss.benchLimit||3)||!ss.hand.some(ref=>card(ref)?.basicEnergy))return;
        if(flip())request('handCard',{basicEnergy:true},'apricornForest',{optional:true});return;}
      case 'rollingThunder':{
        const board=flip()?foe:ss;for(const slot of board.bench)slot.damage=Number(slot.damage||0)+10;log({bench:board===foe?'opponent':'self'});return;}
      case 'dualBurn':{
        const misses=Number(!flip())+Number(!flip());let left=misses;
        for(const [type,n] of Object.entries(a?.energy||{}))while(left>0&&a.energy[type]>0){a.energy[type]--;ss.energyDiscard[type]=(ss.energyDiscard[type]||0)+1;left--;}
        while(left>0&&(a?.specialEnergy||[]).length){ss.discard.push(a.specialEnergy.shift());left--;}log({discarded:misses-left});return;}
      case 'timeShardRescue':{
        const slot=pokemonOn(ss).find(p=>p.uid===e.sourceUid);if(!slot)return;
        const types=Object.keys(slot.energy||{}).filter(t=>Number(slot.energy[t])>0),remaining=Number(e.remaining||2);
        if(ctx.resolvingChoice){
          const selectedType=e.energyTypes?.[Number(ctx.action?.choiceOption)-1];
          if(!selectedType)return;
          if(Number(slot.energy[selectedType]||0)>0){slot.energy[selectedType]--;ss.hand.push({uid:`aq-time-shard-${ctx.state.turnNumber}-${slot.uid}-${ss.hand.length}`,cardId:neoBasicIds[selectedType]||'base1-99',zoneGenerated:true});log({rescued:selectedType});}
          if(remaining>1&&Object.values(slot.energy||{}).some(n=>n>0))aquapolisRule({...e,remaining:remaining-1},{...ctx,resolvingChoice:false});return;
        }
        if(types.length&&remaining>0)request('option',undefined,'timeShardRescue',{options:['Keep all Energy in discard',...types.map(x=>'Return '+x+' Energy')],effect:{...e,energyTypes:types}});
        return;}
      case 'healingBerryTick':return;
      default:throw new Error('Unsupported Aquapolis rule '+rule);
    }
  }

  function neoRule(e,ctx){
    const ss=own(ctx),foe=other(ctx),a=ctx.attacker,d=ctx.defender,turn=ctx.state.turnNumber;
    const pick=(which,rule,opts={})=>ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:which==='opponent'?ctx.foeSide:ctx.side,includeActive:opts.includeActive!==false,filter:opts.filter,effect:{type:'neoRule',rule},optional:!!opts.optional});
    const sel=(which)=>{const board=which==='opponent'?foe:ss,target=ctx.action?.choiceTarget,index=Number(ctx.action?.choiceBenchIndex);return target==='active'?board.active:(board.bench||[]).find(x=>Number(x.benchSlot)===index);};
    const log=(details)=>ctx.state.log.push({type:'neoEffect',side:ctx.side,rule:e.rule,...details});
    if(String(e.rule||'').startsWith('skyridge:'))return skyridgeRule(e,ctx);
    if(String(e.rule||'').startsWith('aquapolis:'))return aquapolisRule(e,ctx);
    if(String(e.rule||'').startsWith('expedition:'))return expeditionRule(e,ctx);
    if(String(e.rule||'').startsWith('destiny:'))return destinyRule(e,ctx);
    switch(e.rule){
      // Legendary Collection and its Team Rocket reprints. These are true
      // Battle Core effect choices, not cosmetic UI prompts or damage stand-ins.
      case 'legendary:summonMinions':{
        if(ss.bench.length<Number(ss.benchLimit||3)&&ss.deck.some(ref=>ctx.cardById(ref.cardId)?.kind==='pokemon'&&ctx.cardById(ref.cardId)?.stage==='Basic'))
          ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect:{type:'neoRule',rule:'legendary:summonPick',remaining:2}});
        break;
      }
      case 'legendary:summonPick':{
        if(ctx.action?.choiceSkip){ctx.shuffle?.(ctx.state,ss.deck);break;}
        const index=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[index];
        if(ref&&ctx.cardById(ref.cardId)?.kind==='pokemon'&&ctx.cardById(ref.cardId)?.stage==='Basic'&&ss.bench.length<Number(ss.benchLimit||3)){
          ss.deck.splice(index,1);ctx.benchCard?.(ss,ref);log({benched:ref.cardId});
        }
        const left=Number(e.remaining||1)-1;
        if(left>0&&ss.bench.length<Number(ss.benchLimit||3)&&ss.deck.some(r=>ctx.cardById(r.cardId)?.kind==='pokemon'&&ctx.cardById(r.cardId)?.stage==='Basic'))
          ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'pokemon',stage:'Basic'},optional:true,effect:{...e,remaining:left}});
        else ctx.shuffle?.(ctx.state,ss.deck);
        break;
      }
      case 'legendary:reelIn':{
        if(ss.discard.some(ref=>ctx.cardById(ref.cardId)?.kind==='pokemon'))
          ctx.requestChoice?.({kind:'discardCard',side:'self',filter:{kind:'pokemon'},optional:true,effect:{type:'neoRule',rule:'legendary:reelPick',remaining:3}});
        break;
      }
      case 'legendary:reelPick':{
        if(ctx.action?.choiceSkip)break;
        const index=Number(ctx.action?.choiceDiscardIndex),ref=ss.discard[index];
        if(ref&&ctx.cardById(ref.cardId)?.kind==='pokemon'&&ss.hand.length<Number(ss.handLimit||10)){
          ss.hand.push(...ss.discard.splice(index,1));log({recovered:ref.cardId});
        }
        const left=Number(e.remaining||1)-1;
        if(left>0&&ss.discard.some(ref=>ctx.cardById(ref.cardId)?.kind==='pokemon')&&ss.hand.length<Number(ss.handLimit||10))
          ctx.requestChoice?.({kind:'discardCard',side:'self',filter:{kind:'pokemon'},optional:true,effect:{...e,remaining:left}});
        break;
      }
      case 'legendary:mirrorShell':if(a)a.legendaryMirrorShellUntil=turn+1;break;
      case 'legendary:energyControl':{
        if(foe.bench.length&&[foe.active,...foe.bench].filter(Boolean).some(slot=>Object.values(slot.energy||{}).some(n=>Number(n)>0)))
          ctx.requestChoice?.({kind:'energySource',side:'self',selectionSide:ctx.foeSide,effect:{type:'neoRule',rule:'legendary:energyControlSource'}});
        break;
      }
      case 'legendary:energyControlSource':{
        const source=ctx.action?.choiceTarget==='active'?foe.active:foe.bench.find(slot=>Number(slot.benchSlot)===Number(ctx.action?.choiceBenchIndex));
        const type=ctx.action?.effectEnergyType;
        if(source&&type&&Number(source.energy?.[type]||0)>0&&[foe.active,...foe.bench].some(slot=>slot&&slot!==source))
          ctx.requestChoice?.({kind:'pokemon',side:'self',selectionSide:ctx.foeSide,includeActive:true,excludeUids:[source.uid],effect:{type:'neoRule',rule:'legendary:energyControlTarget',sourceUid:source.uid,energyType:type}});
        break;
      }
      case 'legendary:energyControlTarget':{
        const source=[foe.active,...foe.bench].find(slot=>slot?.uid===e.sourceUid),dest=sel('opponent');
        if(source&&dest&&source!==dest&&Number(source.energy?.[e.energyType]||0)>0){
          source.energy[e.energyType]--;dest.energy[e.energyType]=Number(dest.energy[e.energyType]||0)+1;log({movedBasicEnergy:e.energyType,from:source.cardId,to:dest.cardId});
        }
        break;
      }
      case 'legendary:challenge':{
        ctx.requestChoice?.({kind:'option',side:'opponent',options:['Accept challenge','Decline challenge'],effect:{type:'neoRule',rule:'legendary:challengeAnswer'}});
        break;
      }
      case 'legendary:challengeAnswer':{
        if(Number(ctx.action?.choiceOption)!==0||ss.bench.length>=Number(ss.benchLimit||3)&&foe.bench.length>=Number(foe.benchLimit||3)){
          ctx.drawCard?.(ss);ctx.drawCard?.(ss);log({challengeAccepted:false});break;
        }
        log({challengeAccepted:true});
        neoRule({type:'neoRule',rule:'legendary:challengePick',phase:'self'}, {...ctx,resolvingChoice:false});break;
      }
      case 'legendary:challengePick':{
        const ownPhase=e.phase==='self',board=ownPhase?ss:foe,side=ownPhase?'self':'opponent';
        if(ctx.resolvingChoice&&!ctx.action?.choiceSkip){
          const index=Number(ctx.action?.choiceDeckIndex),ref=board.deck[index];
          if(ref&&ctx.cardById(ref.cardId)?.kind==='pokemon'&&ctx.cardById(ref.cardId)?.stage==='Basic'&&board.bench.length<Number(board.benchLimit||3)){
            board.deck.splice(index,1);ctx.benchCard?.(board,ref);log({challengeBenched:ref.cardId,phase:e.phase});
          }
        }
        if(board.bench.length<Number(board.benchLimit||3)&&board.deck.some(ref=>ctx.cardById(ref.cardId)?.kind==='pokemon'&&ctx.cardById(ref.cardId)?.stage==='Basic')&&!ctx.action?.choiceSkip){
          ctx.requestChoice?.({kind:'deckCard',side,filter:{kind:'pokemon',stage:'Basic'},optional:true,effect:{...e}});break;
        }
        ctx.shuffle?.(ctx.state,board.deck);
        if(ownPhase)neoRule({...e,phase:'opponent'},{...ctx,action:{},resolvingChoice:false});
        break;
      }
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
        if(!neoUnownWordReady(ctx,'FIND'))break;
        if(ctx.resolvingChoice){const i=Number(ctx.action?.choiceDeckIndex),ref=ss.deck[i];if(ctx.cardById(ref?.cardId)?.kind==='trainer'){ss.hand.push(...ss.deck.splice(i,1));ctx.shuffle?.(ctx.state,ss.deck);}}
        else if(ss.deck.some(ref=>ctx.cardById(ref.cardId)?.kind==='trainer'))ctx.requestChoice?.({kind:'deckCard',side:'self',filter:{kind:'trainer'},effect:e});break;
      }
      case 'discovery:unownUndo':{
        if(!neoUnownWordReady(ctx,'UNDO')||!ss.active)break;
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
    if(defender.cardId==='SNAPFOUNJA-004'&&!abilitiesSuppressed(state,defenderSide,defender,cardById))total+=10*(board.bench||[]).filter(s=>s.cardId==='SNAPFOUNJA-003'||s.cardId==='SNAPFOUNJA-004'||s.cardId==='SNAPFOUNJA-005').length;
    if(defender.founjaShell&&Number(defender.founjaShell.until)>=Number(state.turnNumber))total+=Number(defender.founjaShell.amount||0);
    if(defender.cardId==='SNAPFOUNJA-042'&&!abilitiesSuppressed(state,defenderSide,defender,cardById))total+=10*Math.min(4,(board.bench||[]).filter(s=>String(cardById(s.cardId)?.name||'').includes('Quagsire')).length);
    if(defender.cardId==='SNAPFOUNJA-016'&&!abilitiesSuppressed(state,defenderSide,defender,cardById)&&state.activeSide!==defenderSide)total+=40;
    if(defender.cardId==='SNAPFOUNJA-067'&&!abilitiesSuppressed(state,defenderSide,defender,cardById)&&Number(defender.energy?.Fairy||0)>0)total+=40;
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


  // Florio v0.69.113: shared attack-reaction and choice handlers.
  const LENTAL_113_RULES=new Set(['poisonSpray113','majestyWaltz113','florgesHealing113',
    'florgesTransfer113','healBench113','rearUp113','foodRush113']);
  const florioBoard=ss=>[ss.active,...(ss.bench||[])].filter(Boolean);
  function lentalRule113(effect,ctx){
    const ss=own(ctx),foe=other(ctx),rule=effect.rule,a=ctx.action||{};
    const note=info=>ctx.state.log.push({type:'lentalRule',side:ctx.side,rule,...info});
    const ask=spec=>ctx.requestChoice?.({...spec,effect:spec.effect||effect});
    if(rule==='poisonSpray113'||rule==='rearUp113'){
      if(ctx.attacker){ctx.attacker.florioRevenge={kind:rule==='poisonSpray113'?'poison':'stripEnergy',due:ctx.state.turnNumber+1};
        note({prepared:true,due:ctx.state.turnNumber+1});}
      return;
    }
    if(rule==='foodRush113'){
      const cards=ss.deck.splice(0,Math.min(3,ss.deck.length)),remaining=[],added=[];
      for(const ref of cards){const card=ctx.cardById(ref.cardId);
        if(card?.kind==='trainer'&&card?.trainerType==='Item'&&(ss.handLimit==null||ss.hand.length<ss.handLimit)){
          ss.hand.push(ref);added.push(ref.cardId);
        }else remaining.push(ref);
      }
      ss.deck.push(...remaining);ctx.shuffle?.(ctx.state,ss.deck);
      note({added,returned:remaining.length});return;
    }
    if(rule==='majestyWaltz113'){
      const contains=(ref,part)=>ctx.cardById(ref.cardId)?.kind==='pokemon'&&String(ctx.cardById(ref.cardId)?.name||'').includes(part);
      if(!ctx.resolvingChoice){
        const opts=['Return up to 2 Combee','Return 1 Vespiquen','Skip'];
        if(ss.discard.some(r=>contains(r,'Combee')||contains(r,'Vespiquen')))ask({kind:'option',side:'self',options:opts,effect:{...effect,phase:'family'}});
        return;
      }
      if(effect.phase==='family'){
        const selection=a.choiceOption;
        if(!Number.isInteger(selection)||selection===2||selection<0||selection>2)return;
        const part=selection===0?'Combee':'Vespiquen',amount=selection===0?2:1;
        if(ss.discard.some(ref=>contains(ref,part)))ask({kind:'discardCard',side:'self',filter:{kind:'pokemon',nameContains:part},optional:true,
          effect:{...effect,phase:'pick',part,remaining:amount}});
        return;
      }
      if(effect.phase==='pick'){
        if(a.choiceSkip){ctx.shuffle?.(ctx.state,ss.deck);return;}
        const idx=a.choiceDiscardIndex,ref=Number.isInteger(idx)?ss.discard[idx]:null;
        if(!ref||!contains(ref,effect.part))return;
        ss.deck.push(...ss.discard.splice(idx,1));
        const left=Math.max(0,Number(effect.remaining||1)-1);note({returned:ref.cardId});
        if(left&&ss.discard.some(r=>contains(r,effect.part)))ask({kind:'discardCard',side:'self',
          filter:{kind:'pokemon',nameContains:effect.part},optional:true,effect:{...effect,remaining:left}});
        else ctx.shuffle?.(ctx.state,ss.deck);
        return;
      }
      return;
    }
    if(rule==='florgesHealing113'){
      const available=(ss.bench||[]).filter(s=>s&&Number(s.damage||0)>0);
      if(!ctx.resolvingChoice){if(available.length)ask({kind:'pokemon',side:'self',includeActive:false,filter:{damaged:true},effect});return;}
      const target=ss.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
      if(!target||Number(target.damage||0)<=0)return;
      const healed=target.damage;target.damage=0;note({target:target.cardId,healed});
      const source=ctx.attacker;if(!source)return;
      const amount=Math.max(0,Number(source.energy?.Psychic||0));
      if(amount){source.energy.Psychic=0;recordDiscardedEnergy(ss,'Psychic',amount);}
      for(const ref of [...(source.specialEnergy||[])]){
        const energy=ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{};
        if(Number(energy.Psychic||0)>0){source.specialEnergy=source.specialEnergy.filter(r=>r.uid!==ref.uid);ss.discard.push(ref);}
      }
      return;
    }
    if(rule==='florgesTransfer113'){
      const all=florioBoard(ss);
      const movableSpecial=(slot,ref)=>Object.values(ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{}).some(v=>Number(v)>0);
      if(!ctx.resolvingChoice){
        if(all.length>1&&all.some(p=>Object.values(p.energy||{}).some(v=>Number(v)>0)||(p.specialEnergy||[]).some(r=>movableSpecial(p,r))))
          ask({kind:'energySource',side:'self',includeSpecial:true,effect:{...effect,phase:'source'}});
        return;
      }
      if(effect.phase==='source'){
        const source=selected(ctx,ss),ref=source?.specialEnergy?.find(r=>r.uid===a.effectSpecialEnergyUid);
        if(!source||!all.some(d=>d!==source))return;
        if(ref?!movableSpecial(source,ref):(!a.effectEnergyType||Number(source.energy?.[a.effectEnergyType]||0)<=0))return;
        ask({kind:'pokemon',side:'self',includeActive:true,excludeUids:[source.uid],
          effect:{...effect,phase:'target',sourceUid:source.uid,energyType:ref?null:a.effectEnergyType,energySpecialUid:ref?.uid||null}});
        return;
      }
      const source=all.find(s=>s.uid===effect.sourceUid),dest=selected(ctx,ss);
      if(!source||!dest||source===dest)return;
      if(effect.energySpecialUid){
        const idx=(source.specialEnergy||[]).findIndex(r=>r.uid===effect.energySpecialUid);
        if(idx<0||!movableSpecial(source,source.specialEnergy[idx]))return;
        const [ref]=source.specialEnergy.splice(idx,1);dest.specialEnergy=dest.specialEnergy||[];
        dest.specialEnergy.push(ref);
      }else{
        const type=effect.energyType;if(!type||Number(source.energy?.[type]||0)<=0)return;
        source.energy[type]--;dest.energy=dest.energy||{};
        dest.energy[type]=Number(dest.energy[type]||0)+1;
      }
      const attachedType=effect.energyType||Object.keys(dest.specialEnergy?.at(-1)?.provides||{}).find(t=>Number(dest.specialEnergy.at(-1).provides[t])>0)||'Colorless';
      ctx.onEnergyAttached?.(dest,attachedType,1);note({from:source.cardId,to:dest.cardId,energy:attachedType,special:!!effect.energySpecialUid});return;
    }
    if(rule==='healBench113'){
      if(!ctx.resolvingChoice){if(ss.bench.some(s=>Number(s.damage||0)>0))ask({kind:'pokemon',side:'self',includeActive:false,
        filter:{damaged:true},effect});return;}
      const slot=ss.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
      if(!slot||healingIsBlocked(ctx.state,slot,ctx.cardById))return;
      const amount=Math.min(Number(slot.damage||0),Number(effect.amount||0));slot.damage-=amount;note({healed:amount,cardId:slot.cardId});return;
    }
    throw new Error('Unsupported Florio 113 rule: '+rule);
  }
  // Called before knockout cleanup, including when the defender is KO'd.
  function florioReactToAttackDamage(state,defendingSide,defender,attackingSide,attacker,amount,cardById,random){
    if(state?.format!=='classic'||!defender||!attacker||amount<=0||defendingSide===attackingSide||state.activeSide!==attackingSide)return;
    if(!state.sides?.[defendingSide]||!state.sides?.[attackingSide])return;
    const id=defender.cardId,src=cardById(id);
    const marker=defender.florioRevenge;
    const next=marker&&Number(marker.due)===Number(state.turnNumber);
    const statusAllowed=status=>!statusIsPrevented(state,attacker,cardById,status);
    const flip=reason=>{const heads=random(state)<.5;
      state.log.push({type:'coin',side:defendingSide,heads,results:[heads],reason});return heads;};
    if(id==='SNAPFLORIO-016'&&next&&marker.kind==='poison'&&statusAllowed('poison')){
      attacker.conditions=attacker.conditions||{};attacker.conditions.poison={amount:10};
      state.log.push({type:'lentalReaction',side:defendingSide,rule:'Poison Spray',attackerCardId:attacker.cardId});
    }
    if(id==='SNAPFLORIO-061'&&!abilitiesSuppressed(state,defendingSide,defender,cardById)&&flip('Counter Strike')){
      attacker.damage=Number(attacker.damage||0)+amount;
      state.log.push({type:'lentalReaction',side:defendingSide,rule:'Counter Strike',damage:amount});
    }
    if(id==='SNAPFLORIO-067'&&!abilitiesSuppressed(state,defendingSide,defender,cardById)&&flip('Stun Shock')&&statusAllowed('paralysis')){
      attacker.conditions=attacker.conditions||{};
      delete attacker.conditions.sleep;delete attacker.conditions.confusion;
      attacker.conditions.paralysis={appliedTurn:state.turnNumber};
    }
    if(id==='SNAPFLORIO-100'&&next&&marker.kind==='stripEnergy'&&flip('Rear Up')){
      const n=Object.values(attacker.energy||{}).reduce((sum,v)=>sum+Number(v||0),0);
      for(const [type,count] of Object.entries(attacker.energy||{}))recordDiscardedEnergy(state.sides[attackingSide],type,Number(count||0));
      attacker.energy={};state.log.push({type:'lentalReaction',side:defendingSide,rule:'Rear Up',energyDiscarded:n});
    }
  }


  // Florio v0.69.114: creator-card rules share the normal Classic30 choice
  // system. No ownership bypasses or hidden automatic effects.
  const FLORIO114=new Set(['pinsirWait114','petalGlow114','faceUpPrize114','nectarOrder114',
    'tangledFruit114','energyThrash114','herbalShower114','fertilize114','babyEvolution114',
    'jolt114','friendshipSurge114','forage114','chargedRoast114','florgesGarden114',
    'natureStorm114','forageZapped114','captivate114','dinnerTime114','predatorPlunge114','slumberTime114',
    'goodDreams114','hibernate114','flyOff114','windStorm114','herding114','surprise114']);
  const FLORIO_BASIC_IDS={Fighting:'neo1-106',Fire:'neo1-107',Grass:'neo1-108',
    Lightning:'neo1-109',Psychic:'neo1-110',Water:'neo1-111',
    Darkness:'lental-basic-darkness',Metal:'lental-basic-metal'};
  const florio114All=side=>[side.active,...(side.bench||[])].filter(Boolean);
  const florio114Tools=slot=>[slot?.tool,...(slot?.extraTools||[])].filter(Boolean);
  const florio114Energies=slot=>[
    ...Object.entries(slot?.energy||{}).filter(([,n])=>Number(n)>0).map(([type,n])=>({key:'basic:'+type,label:type+' Basic Energy',type,count:Number(n)})),
    ...(slot?.specialEnergy||[]).map(ref=>({key:'special:'+ref.uid,label:'Special Energy '+ref.cardId,ref,count:1}))
  ];
  function florio114DiscardEnergy(side,slot,key){
    const [mode,value]=String(key||'').split(':');
    if(mode==='basic'&&Number(slot?.energy?.[value]||0)>0){slot.energy[value]--;
      recordDiscardedEnergy(side,value,1);return true;}
    if(mode==='special'){
      const index=(slot?.specialEnergy||[]).findIndex(r=>String(r.uid)===value);
      if(index>=0){side.discard.push(...slot.specialEnergy.splice(index,1));return true;}
    }
    return false;
  }
  function florio114AttachedBasic(side,slot,type){return Number(slot?.energy?.[type]||0)>0;}
  function florio114AttachHand(ctx,owner,target,ref){
    const card=ctx.cardById(ref?.cardId);
    if(!target||!card?.basicEnergy||!card?.subtype)return false;
    const idx=owner.hand.findIndex(r=>r.uid===ref.uid);if(idx<0)return false;
    owner.hand.splice(idx,1);target.energy=target.energy||{};
    target.energy[card.subtype]=Number(target.energy[card.subtype]||0)+1;
    ctx.onEnergyAttached?.(target,card.subtype,1);return true;
  }
  // In Classic30 the Basic Energy deck is the *ordered* Energy Zone, not
  // a shuffleable collection of Basic Energy cards in hand. Card text which
  // says "from hand" can consume its next zone card as an extra attachment.
  // Never search further into the supply for a type: the visible top stays
  // the same card that the effect actually takes.
  function florio114AttachZone(ctx,owner,target,requiredType=null){
    if(!target||!Array.isArray(owner?.energySupply)||!owner.energySupply.length)return null;
    const type=owner.energySupply[0];
    if(!type||requiredType&&requiredType!==type)return null;
    if(neoSupplyTake(ctx,owner,type,1)!==1)return null;
    target.energy=target.energy||{};
    target.energy[type]=Number(target.energy[type]||0)+1;
    ctx.onEnergyAttached?.(target,type,1);
    ctx.state.log.push({type:'energyFromSupply',side:owner.id||ctx.side,energyType:type,amount:1,
      remaining:owner.energySupply.length,reason:'Florio Energy Zone attachment'});
    return type;
  }
  function florio114ReturnPokemonToHand(ctx,owner,slot,excludeToolId,removeFromBoard=true){
    if(!owner||!slot)return false;
    for(const [i,cardId] of (slot.stack||[slot.cardId]).entries())
      owner.hand.push({uid:`${slot.uid}-florio-restore-${i}`,cardId});
    for(const [type,count] of Object.entries(slot.energy||{}))for(let i=0;i<Number(count||0);i++){
      const cardId=FLORIO_BASIC_IDS[type];if(cardId)owner.hand.push({uid:`${slot.uid}-energy-${type}-${i}`,cardId,zoneGenerated:true});
      else {owner.energyDiscard=owner.energyDiscard||{};owner.energyDiscard[type]=Number(owner.energyDiscard[type]||0)+1;}
    }
    owner.hand.push(...(slot.specialEnergy||[]));
    for(const ref of florio114Tools(slot)){
      if(ref.cardId===excludeToolId)owner.discard.push(ref);
      else owner.hand.push(ref);
    }
    owner.hand.push(...(slot.temporaryTrainers||[]));
    if(removeFromBoard){if(owner.active===slot)owner.active=null;
      else {const at=owner.bench.indexOf(slot);if(at>=0)owner.bench.splice(at,1);}}
    return true;
  }
  function florio114RescueKO(state,ownerSide,slot,source,cardById){
    if(state.format!=='classic'||!source?.attack||source.side===ownerSide||
       !florio114Tools(slot).some(ref=>ref.cardId==='SNAPFLORIO-122'))return false;
    const owner=state.sides[ownerSide],sourceId=slot.cardId;
    florio114ReturnPokemonToHand({cardById},owner,slot,'SNAPFLORIO-122',false);
    state.log.push({type:'lentalRescue',side:ownerSide,cardId:sourceId,tool:'Teleport Point'});
    return true;
  }
  function florio114PrismCleanup(state){
    if(!state||state.format!=='classic')return;
    for(const side of ['player','opponent']){
      const ss=state.sides[side];ss.lostZone=ss.lostZone||[];
      for(let i=(ss.discard||[]).length-1;i>=0;i--){
        if(ss.discard[i].cardId==='SNAPFLORIO-029')ss.lostZone.unshift(...ss.discard.splice(i,1));
      }
    }
  }
  function florio114Combos(energy,amount=null){
    let combos=[{}];for(const [type,n] of Object.entries(energy||{}).filter(([,v])=>Number(v)>0)){
      const next=[];for(const combo of combos)for(let k=0;k<=Math.min(20,Number(n));k++){
        const v={...combo};if(k)v[type]=k;next.push(v);
      }combos=next.slice(0,256);
    }
    return combos.filter(m=>amount==null||Object.values(m).reduce((n,v)=>n+v,0)===amount).map(m=>({
      effectSelection:Object.entries(m).map(([t,n])=>t+':'+n).join(','),
      choiceLabel:Object.keys(m).length?'Discard '+Object.entries(m).map(([t,n])=>n+' '+t).join(', '):'Discard none'
    }));
  }
  function florio114ParseCombo(str){
    const out={};for(const item of String(str||'').split(',').filter(Boolean)){
      const at=item.lastIndexOf(':'),type=item.slice(0,at),count=Number(item.slice(at+1));
      if(at<0||!FLORIO_BASIC_IDS[type]||!Number.isInteger(count)||count<0)throw new Error('Invalid Florio Energy choice');
      out[type]=count;
    }return out;
  }
  function florio114ApplyCombo(ctx,owner,slot,selection){
    const counts=florio114ParseCombo(selection);
    for(const [type,n] of Object.entries(counts))if(Number(slot?.energy?.[type]||0)<n)throw new Error('Chosen Basic Energy is no longer attached.');
    let total=0;for(const [type,n] of Object.entries(counts)){
      slot.energy[type]-=n;recordDiscardedEnergy(owner,type,n);total+=n;
    }return total;
  }
  function florio114(ctx,e){
    const rule=e.rule,ss=own(ctx),foe=other(ctx),a=ctx.action||{},source=ctx.attacker;
    const log=info=>ctx.state.log.push({type:'lentalRule',side:ctx.side,rule,...info});
    const ask=spec=>ctx.requestChoice?.({...spec,effect:spec.effect||e});
    const hasEnergy=ref=>ctx.cardById(ref.cardId)?.basicEnergy;
    const basicHand=side=>side.hand.some(hasEnergy);
    if(rule==='pinsirWait114'){
      const defender=florio114All(foe).find(slot=>slot.uid===e.defenderUid);
      if(!defender)return;
      const available=Object.entries(defender.energy||{}).filter(([,n])=>Number(n)>0).map(([type])=>type);
      if(ctx.resolvingChoice){const index=Number(a.choiceOption);
        if(index>=0&&index<available.length){const type=available[index];
          if(florio114DiscardEnergy(foe,defender,'basic:'+type)){
            const amount=Math.min(30,Math.max(0,Number(e.damageLeft||0)));
            defender.damage=Math.max(0,Number(defender.damage||0)-amount);
            log({prevented:amount,energy:type});
            const left=Number(e.damageLeft||0)-amount;
            if(left>0&&Object.values(defender.energy||{}).some(n=>Number(n)>0))
              ask({side:'opponent',kind:'option',options:[...Object.entries(defender.energy||{}).filter(([,n])=>n>0).map(([t])=>'Discard '+t),'Done'],
                effect:{...e,damageLeft:left}});
          }
        }return;
      }
      if(available.length&&e.damage>0)ask({side:'opponent',kind:'option',
        options:[...available.map(t=>'Discard '+t),'Done'],effect:{...e,damageLeft:e.damage}});
      return;
    }
    if(rule==='petalGlow114'){
      if(ctx.resolvingChoice){const choice=Number(a.choiceOption);
        if(choice===0||choice===1){ss.florioPetalTurn=ctx.state.turnNumber;
          ss.florioPetalResult=choice===0;ss.florioPetalUsed=false;log({chosen:choice===0?'heads':'tails'});}
      }else ask({side:'self',kind:'option',options:['Force heads on next attack flip','Force tails on next attack flip']});
      return;
    }
    if(rule==='faceUpPrize114'){
      if(ctx.resolvingChoice){const index=Number(a.choiceOption),ref=ss.prizes?.[index];
        if(ref){ref.faceUp=true;log({revealedPrize:ref.cardId,index});}
      }else if(ss.prizes?.length)ask({side:'self',kind:'option',options:ss.prizes.map((_,i)=>'Reveal Prize '+(i+1))});
      return;
    }
    if(rule==='nectarOrder114'){
      const already=!!foe.active?.conditions?.sleep;
      const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Nectar Order',heads,results:[heads]});
      if(heads&&foe.active&&!statusIsPrevented(ctx.state,foe.active,ctx.cardById,'sleep')){
        foe.active.conditions=foe.active.conditions||{};foe.active.conditions.sleep=true;
      }
      if(already){florio114ReturnPokemonToHand(ctx,ss,source,null);log({returned:source?.cardId});}
      return;
    }
    if(rule==='tangledFruit114'){
      if(Number(a.choiceOption)===0&&foe.active){foe.active.damage=Number(foe.active.damage||0)+30;log({counters:3,target:foe.active.cardId});}
      else if(Number(a.choiceOption)===1&&source){source.damage=Math.max(0,Number(source.damage||0)-30);log({healed:30});}
      return;
    }
    if(rule==='herbalShower114'){
      const knocked=foe.active&&Number(foe.active.damage||0)>=Number(ctx.maxHp?.(ctx.foeSide,foe.active)||ctx.cardById(foe.active.cardId)?.hp||0);
      if(!knocked||!ss.bench.some(s=>Number(s.damage||0)>0))return;
      if(ctx.resolvingChoice){const target=ss.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
        if(target&&!healingIsBlocked(ctx.state,target,ctx.cardById)){const n=Math.min(50,target.damage);target.damage-=n;log({healed:n,to:target.cardId});}
      }else ask({side:'self',kind:'pokemon',includeActive:false,filter:{damaged:true}});
      return;
    }
    if(rule==='fertilize114'){
      const excluded=e.done||[],possible=ss.bench.filter(s=>!excluded.includes(s.uid)&&ctx.cardById(s.cardId)?.types?.includes('Grass')&&
        ss.discard.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom===ctx.cardById(s.cardId)?.name));
      if(ctx.resolvingChoice&&e.phase==='target'){
        if(a.choiceSkip)return;const target=ss.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
        if(target&&possible.includes(target)){ask({side:'self',kind:'discardCard',
          filter:{evolvesFrom:ctx.cardById(target.cardId).name},effect:{...e,phase:'evolve',targetUid:target.uid}});}
        return;
      }
      if(ctx.resolvingChoice&&e.phase==='evolve'){
        const target=ss.bench.find(s=>s.uid===e.targetUid),index=Number(a.choiceDiscardIndex),ref=ss.discard?.[index];
        if(target&&ref&&ctx.cardById(ref.cardId)?.evolvesFrom===ctx.cardById(target.cardId)?.name){
          ss.discard.splice(index,1);target.cardId=ref.cardId;target.stack.push(ref.cardId);
          target.evolvedOnTurn=ctx.state.turnNumber;ctx.onEvolved?.(target);log({evolved:ref.cardId});
        }
        const done=[...excluded,e.targetUid],next=ss.bench.filter(s=>!done.includes(s.uid)&&ctx.cardById(s.cardId)?.types?.includes('Grass')&&
          ss.discard.some(ref=>ctx.cardById(ref.cardId)?.evolvesFrom===ctx.cardById(s.cardId)?.name));
        if(next.length)ask({side:'self',kind:'pokemon',includeActive:false,optional:true,
          filter:{subtype:'Grass'},excludeUids:done,effect:{...e,phase:'target',done}});
        return;
      }
      if(possible.length)ask({side:'self',kind:'pokemon',includeActive:false,optional:true,
        filter:{subtype:'Grass'},excludeUids:excluded,effect:{...e,phase:'target'}});
      return;
    }
    if(rule==='babyEvolution114'){
      if(ctx.resolvingChoice){const index=Number(a.choiceHandIndex),ref=ss.hand[index];
        if(ref&&ctx.cardById(ref.cardId)?.name==='Pikachu'&&source){ss.hand.splice(index,1);
          source.cardId=ref.cardId;source.stack.push(ref.cardId);source.damage=0;
          source.evolvedOnTurn=ctx.state.turnNumber;ctx.onEvolved?.(source);log({evolved:ref.cardId});}
      }else if(ss.hand.some(ref=>ctx.cardById(ref.cardId)?.name==='Pikachu'))
        ask({side:'self',kind:'handCard',filter:{name:'Pikachu'}});
      return;
    }
    if(rule==='jolt114'){
      const attached=neoSupplyAttach(ctx,ss,source,'Lightning',1);
      if(source)source.damage=Number(source.damage||0)+10;
      log({attached,damageSelf:10});return;
    }
    if(rule==='friendshipSurge114'){
      const effective=ctx.effectiveEnergy?.(source)||source?.energy||{};
      const attached=Number(effective.Lightning||0)+Number(effective.Grass||0);
      const extra=Math.max(0,attached-2),limit=Math.min(3,extra);
      if(!limit||!foe.bench.length)return;
      const cursor=Math.max(0,Number(e.cursor||0)),used=Math.max(0,Number(e.used||0));
      const target=foe.bench[cursor];if(!target)return;
      const options=florio114Energies(target);
      if(ctx.resolvingChoice){
        if(a.choiceSkip||Number(a.choiceOption)>=options.length||!options.length){
          const next=cursor+1;if(foe.bench[next])ask({side:'self',kind:'option',
            options:[...florio114Energies(foe.bench[next]).map(x=>'Discard '+x.label),'Skip Pokémon'],
            effect:{...e,cursor:next,used:0}});
          return;
        }
        const picked=options[Number(a.choiceOption)];
        if(picked&&florio114DiscardEnergy(foe,target,picked.key))log({target:target.cardId,discarded:picked.label});
        if(used+1<limit&&florio114Energies(target).length){
          ask({side:'self',kind:'option',options:[...florio114Energies(target).map(x=>'Discard '+x.label),'Skip Pokémon'],
            effect:{...e,cursor,used:used+1}});
        }else if(foe.bench[cursor+1])ask({side:'self',kind:'option',
          options:[...florio114Energies(foe.bench[cursor+1]).map(x=>'Discard '+x.label),'Skip Pokémon'],
          effect:{...e,cursor:cursor+1,used:0}});
        return;
      }
      ask({side:'self',kind:'option',options:[...options.map(x=>'Discard '+x.label),'Skip Pokémon'],
        effect:{...e,cursor,used}});return;
    }
    if(rule==='forage114'){
      if(ctx.resolvingChoice&&e.phase==='play'){
        if(a.choiceSkip)return;const ref=ss.hand[Number(a.choiceHandIndex)];
        if(ref?.cardId==='SNAPFLORIO-123'&&(e.drawn||[]).includes(ref.uid)){
          ss.hand.splice(Number(a.choiceHandIndex),1);ss.discard.push(ref);
          ask({side:'self',kind:'pokemon',includeActive:true,
            filter:{damaged:true},effect:{type:'lentalRule',rule:'forageZapped114'}});
        }return;
      }
      const drawn=[];for(let i=0;i<3;i++){const ref=ctx.drawCard?.(ss);if(ref)drawn.push(ref.uid);}
      const candidates=ss.hand.filter(ref=>drawn.includes(ref.uid)&&ref.cardId==='SNAPFLORIO-123');
      if(candidates.length&&florio114All(ss).some(slot=>Number(slot.damage||0)>0)&&ctx.requestChoice)ask({side:'self',kind:'handCard',optional:true,filter:{id:'SNAPFLORIO-123'},effect:{...e,phase:'play',drawn}});
      log({drawn:drawn.length});return;
    }
    if(rule==='forageZapped114'){
      const target=a.choiceTarget==='active'?ss.active:ss.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
      if(target&&!healingIsBlocked(ctx.state,target,ctx.cardById)){
        const amount=ctx.cardById(target.cardId)?.types?.includes('Lightning')?60:20;
        const prev=Number(target.damage||0);target.damage=Math.max(0,prev-amount);
        log({healed:prev-target.damage,to:target.cardId});
      }return;
    }
    if(rule==='chargedRoast114'){
      const target=e.phase==='opponent'?foe.active:ss.active,owner=e.phase==='opponent'?foe:ss;
      const options=Object.entries(target?.energy||{}).filter(([,n])=>Number(n)>0).map(([type])=>type);
      if(ctx.resolvingChoice){const index=Number(a.choiceOption),type=options[index];
        if(type)florio114DiscardEnergy(owner,target,'basic:'+type);
        if(e.phase!=='opponent')ask({side:'opponent',kind:'option',options:[...Object.entries(foe.active?.energy||{}).filter(([,n])=>n>0).map(([t])=>'Discard '+t),'No Basic Energy'],
          effect:{...e,phase:'opponent'}});
        return;
      }
      if(options.length)ask({side:'self',kind:'option',options:options.map(t=>'Discard '+t),effect:{...e,phase:'self'}});
      else if(foe.active&&Object.values(foe.active.energy||{}).some(n=>n>0))ask({side:'opponent',kind:'option',
        options:Object.entries(foe.active.energy).filter(([,n])=>n>0).map(([t])=>'Discard '+t),effect:{...e,phase:'opponent'}});
      return;
    }
    if(rule==='florgesGarden114'){
      const handGrass=ss.hand.find(ref=>ctx.cardById(ref.cardId)?.basicEnergy&&ctx.cardById(ref.cardId)?.subtype==='Grass');
      const zoneGrass=ss.energySupply?.[0]==='Grass';
      if(ctx.state.stadium==null||!ss.bench.length||(!zoneGrass&&!handGrass))return;
      if(ctx.resolvingChoice&&e.phase==='target'){
        if(a.choiceSkip)return;
        const slot=ss.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
        if(slot){const attached=zoneGrass?florio114AttachZone(ctx,ss,slot,'Grass'):null;
          if(attached||handGrass&&florio114AttachHand(ctx,ss,slot,handGrass))
            log({attachedEnergy:'Grass',to:slot.cardId,source:attached?'Energy Zone':'hand'});}
      }else ask({side:'self',kind:'pokemon',includeActive:false,optional:true,effect:{...e,phase:'target'}});
      return;
    }
    if(rule==='natureStorm114'){
      if(ctx.state.stadium?.cardId==='SNAPFLORIO-112')return;
      const left=Math.max(0,Number(e.left??10));if(!left||!ss.bench.some(s=>Number(s.damage||0)>=10)||!foe.bench.length)return;
      if(ctx.resolvingChoice&&e.phase==='source'){
        if(a.choiceSkip)return;const slot=ss.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
        if(slot&&slot.damage>=10)ask({side:'self',kind:'pokemon',selectionSide:ctx.foeSide,includeActive:false,
          effect:{...e,phase:'target',sourceUid:slot.uid}});
        return;
      }
      if(ctx.resolvingChoice&&e.phase==='target'){
        const from=ss.bench.find(s=>s.uid===e.sourceUid),to=foe.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
        if(from&&to&&from.damage>=10){from.damage-=10;to.damage=Number(to.damage||0)+10;log({moved:10,from:from.cardId,to:to.cardId});}
        const next=left-1;if(next>0&&ss.bench.some(s=>s.damage>=10)&&foe.bench.length)
          ask({side:'self',kind:'pokemon',includeActive:false,filter:{damaged:true},optional:true,
            effect:{...e,phase:'source',left:next}});
        return;
      }
      ask({side:'self',kind:'pokemon',includeActive:false,filter:{damaged:true},optional:true,effect:{...e,phase:'source',left}});return;
    }
    if(rule==='captivate114'){
      if(ctx.resolvingChoice&&e.phase==='energy'){
        const options=florio114Energies(source);const chosen=options[Number(a.choiceOption)];
        if(!chosen)return;
        if(chosen.key!=='done'&&florio114DiscardEnergy(ss,source,chosen.key)){
          const amount=Math.min(foe.hand.length,2);
          if(amount)ask({side:'opponent',kind:'handCard',effect:{...e,phase:'oppHand',left:amount,continue:true}});
          else if(florio114Energies(source).length)ask({side:'self',kind:'option',
            options:[...florio114Energies(source).map(x=>'Discard '+x.label),'Done'],effect:{...e,phase:'energy'}});
        }return;
      }
      if(ctx.resolvingChoice&&e.phase==='oppHand'){
        const index=Number(a.choiceHandIndex);if(!Number.isInteger(index)||index<0||index>=foe.hand.length)return;
        foe.discard.push(...foe.hand.splice(index,1));const left=Number(e.left||1)-1;
        if(left>0&&foe.hand.length)ask({side:'opponent',kind:'handCard',effect:{...e,left}});
        else if(florio114Energies(source).length)ask({side:'self',kind:'option',
          options:[...florio114Energies(source).map(x=>'Discard '+x.label),'Done'],effect:{...e,phase:'energy'}});
        return;
      }
      const options=florio114Energies(source).map(x=>'Discard '+x.label);
      if(options.length)ask({side:'self',kind:'option',options:[...options,'Done'],effect:{...e,phase:'energy'}});
      return;
    }
    if(rule==='dinnerTime114'){
      const available=ss.bench.filter(p=>ctx.cardById(p.cardId)?.name==='Magikarp');
      if(ctx.resolvingChoice){const slot=ss.bench.find(p=>Number(p.benchSlot)===Number(a.choiceBenchIndex));
        if(!slot||ctx.cardById(slot.cardId)?.name!=='Magikarp')return;
        ss.bench.splice(ss.bench.indexOf(slot),1);ss.discard.push({uid:`${slot.uid}-dinner`,cardId:slot.cardId});
        for(const [type,n] of Object.entries(slot.energy||{}))for(let k=0;k<Number(n||0);k++)ss.energySupply?.push(type);
        ss.deck.push(...(slot.specialEnergy||[]),...florio114Tools(slot),...(slot.temporaryTrainers||[]));
        ctx.shuffle?.(ctx.state,ss.deck);
        if(source)source.damage=Math.max(0,Number(source.damage||0)-100);
        log({discarded:slot.cardId,healed:100});
      }else if(available.length)ask({side:'self',kind:'pokemon',includeActive:false,filter:{name:'Magikarp'}});
      return;
    }
    if(rule==='predatorPlunge114'){
      const defender=foe.active;
      const basic=Number(defender?.energy?.Water||0)>0;
      const special=(defender?.specialEnergy||[]).some(ref=>Number(ref.provides?.Water||ctx.cardById(ref.cardId)?.effect?.provides?.Water||0)>0);
      if(defender&&(basic||special)){
        defender.damage=Math.max(Number(defender.damage||0),Number(ctx.maxHp?.(ctx.foeSide,defender)||ctx.cardById(defender.cardId)?.hp||0));
        log({knockedOut:defender.cardId});
      }else log({conditionFailed:true,reason:'The opponent’s Active Pokémon needs attached Water Energy.'});
      return;
    }
    if(rule==='slumberTime114'){
      if(source&&source.damage>0){source.damage=0;source.conditions={...(source.conditions||{}),sleep:true};log({healedAll:true,asleep:true});}return;
    }
    if(rule==='goodDreams114'){
      const left=Math.max(0,Number(e.left??3)),types=[...new Set(ss.energySupply||[])].filter(Boolean);
      if(!left||!ss.bench.length||!types.length)return;
      if(ctx.resolvingChoice&&e.phase==='target'){
        if(a.choiceSkip)return;const slot=ss.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
        if(slot)ask({side:'self',kind:'option',options:types,effect:{...e,phase:'type',targetUid:slot.uid}});
        return;
      }
      if(ctx.resolvingChoice&&e.phase==='type'){
        const slot=ss.bench.find(s=>s.uid===e.targetUid),available=[...new Set(ss.energySupply||[])].filter(Boolean),type=available[Number(a.choiceOption)];
        if(slot&&type){const amount=neoSupplyAttach(ctx,ss,slot,type,1);log({attached:type,amount,to:slot.cardId});}
        const next=left-1;if(next>0&&ss.bench.length&&(ss.energySupply||[]).length)
          ask({side:'self',kind:'pokemon',includeActive:false,optional:true,effect:{...e,phase:'target',left:next}});
        return;
      }
      ask({side:'self',kind:'pokemon',includeActive:false,optional:true,effect:{...e,phase:'target',left}});return;
    }
    if(rule==='hibernate114'){
      const n=totalEnergy(ctx.effectiveEnergy?.(source)||source?.energy||{});
      if(source&&n>=3){source.attackGuard={type:'preventDamage',duration:'opponentTurn',expiresTurn:ctx.state.turnNumber+1};
        source.florioHibernateDue=ctx.state.turnNumber+1;log({protectedUntil:source.florioHibernateDue});}
      return;
    }
    if(rule==='flyOff114'){
      if(ctx.resolvingChoice&&e.phase==='bench'){
        if(a.choiceSkip)return;const index=Number(a.choiceBenchIndex);
        if(!Number.isInteger(index)||!switchPokemon(ss,index,ctx.state))return;
        const types=[...new Set(ss.energySupply||[])].filter(Boolean);
        if(types.length)ask({side:'self',kind:'option',options:types,effect:{...e,phase:'type'}});
        return;
      }
      if(ctx.resolvingChoice&&e.phase==='type'){
        const types=[...new Set(ss.energySupply||[])].filter(Boolean),type=types[Number(a.choiceOption)];
        if(type&&ss.active){const amount=neoSupplyAttach(ctx,ss,ss.active,type,1);log({attached:type,amount});}return;
      }
      if(ss.bench.length)ask({side:'self',kind:'pokemon',includeActive:false,optional:true,effect:{...e,phase:'bench'}});
      return;
    }
    if(rule==='windStorm114'){
      const choices=florio114Energies(source);
      if(ctx.resolvingChoice){const picked=choices[Number(a.choiceOption)];
        if(!picked||!florio114DiscardEnergy(ss,source,picked.key))return;
        if(Number(e.left||2)>1&&florio114Energies(source).length)ask({side:'self',kind:'option',
          options:florio114Energies(source).map(x=>'Discard '+x.label),effect:{...e,left:Number(e.left||2)-1}});
        return;
      }
      if(choices.length)ask({side:'self',kind:'option',options:choices.map(x=>'Discard '+x.label),effect:{...e,left:2}});
      return;
    }
    if(rule==='herding114'){
      const bouffalants=florio114All(ss).filter(s=>ctx.cardById(s.cardId)?.name==='Bouffalant').length;
      const left=Math.max(0,Number(e.left??bouffalants));
      const types=[...new Set([...Object.entries(ss.energyDiscard||{}).filter(([,n])=>Number(n)>0).map(([t])=>t),
        ...ss.discard.map(r=>ctx.cardById(r.cardId)).filter(c=>c?.basicEnergy).map(c=>c.subtype)])].filter(t=>neoDiscardAvailable(ctx,ss,t)>0);
      if(!left||!types.length)return;
      if(ctx.resolvingChoice&&e.phase==='target'){
        const target=selected(ctx,ss);if(target)ask({side:'self',kind:'option',options:types,effect:{...e,phase:'type',targetUid:target.uid}});
        return;
      }
      if(ctx.resolvingChoice&&e.phase==='type'){
        const target=florio114All(ss).find(s=>s.uid===e.targetUid),current=[...new Set([...Object.entries(ss.energyDiscard||{}).filter(([,n])=>n>0).map(([t])=>t),
          ...ss.discard.map(r=>ctx.cardById(r.cardId)).filter(c=>c?.basicEnergy).map(c=>c.subtype)])].filter(t=>neoDiscardAvailable(ctx,ss,t)>0);
        const type=current[Number(a.choiceOption)];if(target&&type&&neoTakeDiscard(ctx,ss,type,1)){
          target.energy=target.energy||{};target.energy[type]=Number(target.energy[type]||0)+1;ctx.onEnergyAttached?.(target,type,1);
          log({attached:type,to:target.cardId});
        }
        const next=left-1;const remaining=Object.values(ss.energyDiscard||{}).reduce((n,v)=>n+Number(v||0),0)+
          ss.discard.filter(r=>ctx.cardById(r.cardId)?.basicEnergy).length;
        if(next>0&&remaining)ask({side:'self',kind:'pokemon',includeActive:true,optional:true,
          effect:{...e,phase:'target',left:next}});
        return;
      }
      ask({side:'self',kind:'pokemon',includeActive:true,optional:true,effect:{...e,phase:'target',left}});return;
    }
    if(rule==='surprise114'){
      // Pichu & Scorbunny's Surprise!: "from hand" means the *next* Basic
      // Energy in each player's separate supply in our hybrid format.
      // The effect is in addition to each player's normal turn attachment.
      for(const owner of [ss,foe]){
        const target=owner.active;if(!target)continue;
        const type=florio114AttachZone(ctx,owner,target);
        if(type){log({owner:owner.id,attachedEnergy:type,source:'Energy Zone'});continue;}
        // Energy returned to hand by another card is still usable if the
        // ordered supply is genuinely empty; don't silently discard it.
        if(!owner.energySupply?.length){const ref=owner.hand.find(hasEnergy);
          if(ref&&florio114AttachHand(ctx,owner,target,ref))log({owner:owner.id,attachedEnergy:ctx.cardById(ref.cardId).subtype,source:'hand'});}
      }
      return;
    }
    throw new Error('Unimplemented revised Florio v114 rule: '+rule);
  }

  // Founja Jungle printed-effect adapter. Rules are deliberately named and
  // exhaustive: a missing rule must throw rather than silently do nothing.
  function founjaRule(effect,ctx){
    const name=effect.rule.slice(7),ss=own(ctx),foe=other(ctx),a=ctx.action||{},self=ctx.attacker;
    const mine=pokemonOn(ss),theirs=pokemonOn(foe),card=x=>ctx.cardById(x?.cardId);
    const note=v=>ctx.state.log.push({type:'founjaEffect',side:ctx.side,rule:name,...v});
    const ask=(spec,more={})=>ctx.requestChoice?.({...spec,effect:{...effect,...more}});
    const flip=()=>{const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Founja '+name,heads,results:[heads]});return heads;};
    const chosen=(owner=ss)=>{
      if(a.choiceTarget==='active'||a.choiceTarget==='opponentActive')return owner.active;
      if(a.choiceTarget==='bench'||a.choiceTarget==='opponentBench')return owner.bench.find(s=>Number(s.benchSlot)===Number(a.choiceBenchIndex));
      return null;
    };
    const drop=(owner,slot,type)=>{if(!slot)return false;let energyType=type||Object.keys(slot.energy||{}).find(t=>slot.energy[t]>0);if(energyType&&Number(slot.energy?.[energyType]||0)>0){slot.energy[energyType]--;recordDiscardedEnergy(owner,energyType,1);return true;}
      if((slot.specialEnergy||[]).length){owner.discard.push(slot.specialEnergy.shift());return true;}return false;};
    const topEnergy=(owner,accepted)=>Array.isArray(owner.energySupply)&&owner.energySupply.length&&(accepted==='any'||accepted.includes(owner.energySupply[0]))?owner.energySupply[0]:null;
    const attachTop=(owner,slot,accepted)=>{const type=topEnergy(owner,accepted);return type?neoSupplyAttach(ctx,owner,slot,type,1):0;};
    const handEnergy=(owner,slot,accepted)=>{const index=owner.hand.findIndex(r=>{const c=card(r);return c?.basicEnergy&&(accepted==='any'||accepted.includes(c.subtype));});if(index<0)return 0;const [ref]=owner.hand.splice(index,1);const type=card(ref)?.subtype;slot.energy=slot.energy||{};slot.energy[type]=Number(slot.energy[type]||0)+1;ctx.onEnergyAttached?.(slot,type,1);return 1;};
    const validTarget=(owner,target)=>owner===ss?mine.includes(target):theirs.includes(target);
    const discardOne=(owner,filter)=>{const index=owner.discard.findIndex(r=>filter(card(r)));if(index<0)return null;return owner.discard.splice(index,1)[0];};
    switch(name){
      case 'sweetAntenna':{
        if(ctx.resolvingChoice){const i=Number(a.choiceDeckIndex),ref=ss.deck[i];if(ref&&card(ref)?.kind==='pokemon'&&card(ref)?.stage==='Basic'&&ss.bench.length<Number(ss.benchLimit||3)){ss.deck.splice(i,1);ctx.benchCard?.(ss,ref);ctx.shuffle?.(ctx.state,ss.deck);note({benched:ref.cardId});}return;}
        if(ss.bench.length<Number(ss.benchLimit||3)&&ss.deck.some(r=>card(r)?.kind==='pokemon'&&card(r)?.stage==='Basic'))ask({kind:'deckCard',side:'self',filter:{kind:'pokemon',stage:'Basic'}});return;
      }
      case 'ironShell':{const amount=10*Number((ctx.effectiveEnergy?.(self)||self?.energy||{}).Psychic||0);if(self&&amount>0)self.founjaShell={amount,until:ctx.state.turnNumber+1};return;}
      case 'cometFlurry':{const energy=ctx.effectiveEnergy?.(self)||self?.energy||{},count=Object.values(energy).reduce((n,x)=>n+Number(x||0),0),extra=Math.max(0,count-2);if(extra)applyEffect({type:'benchDamage',side:'opponent',all:true,amount:extra*10},ctx);return;}
      case 'starlightShower':if(flip()){foe.founjaNoHealUntil=ctx.state.turnNumber+1;note({healBlockedUntil:foe.founjaNoHealUntil});}return;
      case 'berryBlast':if(foe.active?.damage>0){for(let i=0;i<2;i++)drop(foe,foe.active);note({discarded:2});}return;
      case 'aroma':{if(ctx.resolvingChoice){const target=chosen();if(target&&ss.bench.includes(target)&&!healingIsBlocked(ctx.state,target,ctx.cardById))target.damage=0;return;}
        if(ss.bench.some(s=>Number(s.damage||0)>0))ask({kind:'pokemon',side:'self',includeActive:false,filter:{damaged:true}});return;}
      case 'gentleGlide':{if(ctx.resolvingChoice){const i=Number(a.choiceDiscardIndex),ref=ss.discard[i];if(ref){ss.discard.splice(i,1);ss.deck.push(ref);ctx.shuffle?.(ctx.state,ss.deck);note({returned:ref.cardId});}return;}
        if(ss.discard.length)ask({kind:'discardCard',side:'self'});return;}
      case 'compoundEyes':{
        if(ctx.resolvingChoice){const i=Number(a.choiceDeckIndex);if(i>=0&&i<Math.min(2,ss.deck.length)){const [ref]=ss.deck.splice(i,1);if(ref)ss.hand.push(ref);if(ss.deck.length)ss.deck.push(ss.deck.shift());note({chosen:ref?.cardId});}return;}
        if(ss.deck.length)ask({kind:'topDeckCard',side:'self',count:Math.min(2,ss.deck.length)});return;
      }
      case 'scatter':{
        if(ctx.resolvingChoice&&effect.phase==='target'){const target=chosen();const energy=effect.energyType;if(target&&ss.bench.includes(target)&&neoTakeDiscard(ctx,ss,energy,1)){target.energy[energy]=Number(target.energy[energy]||0)+1;ctx.onEnergyAttached?.(target,energy,1);note({attached:energy,to:target.cardId});}return;}
        if(ctx.resolvingChoice&&effect.phase==='type'){const types=effect.options||[],type=types[Number(a.choiceOption)];if(type)ask({kind:'pokemon',side:'self',includeActive:false},{phase:'target',energyType:type});return;}
        const options=Object.keys(ss.energyDiscard||{}).filter(t=>neoDiscardAvailable(ctx,ss,t)>0);for(const ref of ss.discard||[]){const c=card(ref);if(c?.basicEnergy&&neoDiscardAvailable(ctx,ss,c.subtype)>0&&!options.includes(c.subtype))options.push(c.subtype);}if(options.length&&ss.bench.length)ask({kind:'option',side:'self',options},{phase:'type',options});return;
      }
      case 'berryJuice':if(ctx.resolvingChoice){const target=chosen();if(target&&!healingIsBlocked(ctx.state,target,ctx.cardById))target.damage=Math.max(0,Number(target.damage||0)-20);return;}
        if(flip()&&mine.some(s=>s.damage>0))ask({kind:'pokemon',side:'self',includeActive:true,filter:{damaged:true}});return;
      case 'gasp':{ // In Classic30 Basic Energy is in the ordered Energy Zone, not the deck.
        if(Array.isArray(ss.energySupply)&&ss.energySupply.length){const top=ss.energySupply[0];if(top==='Water')neoEnergyToHand(ctx,ss,'Water',1);else{ss.energySupply.push(ss.energySupply.shift());ss.nextEnergyType=ss.energySupply[0];}note({topEnergy:top,waterFound:top==='Water'});}return;
      }
      case 'whirlwind':applyEffect({type:'forceOpponentSwitch'},ctx);return;
      case 'waterFountain':{const target=ss.bench.find(s=>Number(s.benchSlot)===Number(a.benchIndex));if(target&&Number(self?.energy?.Water||0)>0){self.energy.Water--;target.energy.Water=Number(target.energy?.Water||0)+1;note({movedWater:1,to:target.cardId});}return;}
      case 'magicSplash':{
        const opt=String(a.effectSelection||'');if(!opt)return;
        const [fromUid,toUid,type]=opt.split('|'),src=theirs.find(s=>s.uid===fromUid),dest=theirs.find(s=>s.uid===toUid);
        if(src&&dest&&src!==dest&&Number(src.energy?.[type]||0)>0){src.energy[type]--;dest.energy[type]=Number(dest.energy[type]||0)+1;note({moved:type,from:src.cardId,to:dest.cardId});}return;
      }
      case 'waterfallClimb':{if(!self||!self.founjaWaterfallKo)return;delete self.founjaWaterfallKo;
        const idx=ss.deck.findIndex(r=>card(r)?.name==='Gyarados'&&card(r)?.stage==='Stage 1');if(idx<0)return;
        const [ref]=ss.deck.splice(idx,1);self.stack=[...(self.stack||[self.cardId]),ref.cardId];self.cardId=ref.cardId;self.evolvedOnTurn=ctx.state.turnNumber;ctx.onEvolved?.(self);ctx.shuffle?.(ctx.state,ss.deck);note({evolved:ref.cardId});return;
      }
      case 'bigSplash':{
        // Peek exactly five ordered supply entries; take only Water among those five.
        if(ctx.resolvingChoice){const slot=chosen(),left=Number(effect.remaining||0);if(slot&&validTarget(ss,slot)){
          slot.energy.Water=Number(slot.energy?.Water||0)+1;ctx.onEnergyAttached?.(slot,'Water',1);note({attached:'Water',to:slot.cardId});}
          if(left>1)ask({kind:'pokemon',side:'self',includeActive:true},{remaining:left-1});return;}
        let count=0;for(let i=Math.min(4,(ss.energySupply||[]).length-1);i>=0;i--)if(ss.energySupply[i]==='Water'){ss.energySupply.splice(i,1);count++;}
        ss.nextEnergyType=ss.energySupply?.[0]||null;
        if(count&&mine.length)ask({kind:'pokemon',side:'self',includeActive:true},{remaining:count});return;
      }
      case 'jumpSlamGX':{const attached=Number((ctx.effectiveEnergy?.(self)||self?.energy||{}).Water||0),extra=Math.max(0,attached-1),count=Math.min(extra,foe.hand.length);for(let i=0;i<count;i++){const index=Math.floor(ctx.random(ctx.state)*foe.hand.length);foe.discard.push(...foe.hand.splice(index,1));}
        if(count&&foe.hand.length===0&&self){self.damage=Math.max(Number(self.damage||0),Number(ctx.maxHp?.(ctx.side,self)||card(self)?.hp||0));}note({discardedHand:count,knockedSelf:count>0&&!foe.hand.length});return;}
      case 'fatefulEncounter':{if(ctx.eventData?.fromHand!==true||!self)return;let count=0;
        for(let i=0;i<2;i++){const done=attachTop(ss,self,['Psychic']);if(!done)break;count+=done;}note({attached:count});return;}
      case 'spiralScatter':{const targets=ss.bench.filter(s=>card(s)?.stage==='Basic'&&card(s)?.types?.includes('Psychic'));for(const target of targets){const types=Object.entries(ss.energyDiscard||{}).filter(([,n])=>Number(n)>0).map(([type])=>type);if(!types.length)break;const type=types[0];if(neoTakeDiscard(ctx,ss,type,1)){target.energy[type]=Number(target.energy[type]||0)+1;ctx.onEnergyAttached?.(target,type,1);}}return;}
      case 'investigate':{
        if(ctx.resolvingChoice){const index=Number(a.choiceOption),prize=ss.prizes[index];if(prize){prize.faceUp=true;if(ss.deck.length){const top=ss.deck.shift();ss.deck.unshift(prize);ss.prizes[index]={...top,faceUp:false};}note({prizeChanged:true});}return;}
        if(ss.prizes?.length)ask({kind:'option',side:'self',options:ss.prizes.map((_,i)=>'Prize '+(i+1))});return;
      }
      case 'mudBath':{
        const count=Math.min(Math.max(0,Number(a.choiceOption||0)),Number(self?.energy?.Fighting||0));if(!count||!self)return;
        self.energy.Fighting-=count;ss.energySupply=ss.energySupply||[];for(let i=0;i<count;i++)ss.energySupply.push('Fighting');
        for(let i=0;i<count*2&&ss.discard.length;i++){if(ss.handLimit!=null&&ss.hand.length>=ss.handLimit)break;ss.hand.push(ss.discard.shift());}ss.nextEnergyType=ss.energySupply?.[0]||null;note({fightingReturned:count,cardsRetrieved:Math.min(2*count,ss.hand.length)});return;
      }
      case 'bogTorrent':{if(Number(a.choiceOption||0)>0&&self&&drop(ss,self))applyEffect({type:'status',target:'opponentActive',status:'poison'},ctx);return;}
      case 'sitUpSnooze':{const basics=foe.hand.filter(r=>card(r)?.kind==='pokemon'&&card(r)?.stage==='Basic').length;if(foe.active)foe.active.damage=Number(foe.active.damage||0)+20*basics;applyEffect({type:'status',target:'self',status:'sleep'},ctx);note({revealed:foe.hand.map(r=>r.cardId),basicCount:basics});return;}
      case 'swampSplash':{if(ctx.resolvingChoice){const slot=chosen();if(slot&&validTarget(ss,slot)){const amount=attachTop(ss,slot,['Water','Fighting'])||handEnergy(ss,slot,['Water','Fighting']);note({attached:amount,to:slot.cardId});}return;}
        if(mine.length&&(topEnergy(ss,['Water','Fighting'])||ss.hand.some(r=>card(r)?.basicEnergy&&['Water','Fighting'].includes(card(r)?.subtype))))ask({kind:'pokemon',side:'self',includeActive:true,optional:true});return;}
      case 'submerge':if(self){self.founjaSubmergeUntil=ctx.state.turnNumber+1;note({protected:true});}return;
      case 'muddyWater':{const count=Number(self?.energy?.Water||0)+(self?.specialEnergy||[]).reduce((n,r)=>n+Number((r.provides||card(r)?.effect?.provides||{}).Water||0),0);for(let i=0;i<count&&foe.deck.length;i++)foe.discard.push(foe.deck.shift());note({discardedDeck:count});return;}
      case 'hiss':{if(ctx.resolvingChoice){const target=chosen(foe);if(target&&foe.bench.includes(target)&&switchPokemon(foe,target.benchSlot,ctx.state))applyEffect({type:'status',target:'opponentActive',status:'paralysis'},ctx);return;}
        if(foe.bench.length)ask({kind:'pokemon',side:'opponent',includeActive:false});return;}
      case 'venomPunishment':{applyEffect({type:'status',target:'opponentActive',status:'poison'},ctx);if(foe.active)foe.active.damage=Number(foe.active.damage||0)+10*foe.hand.length;note({counters:foe.hand.length});return;}
      case 'nastyWeb':foe.founjaNoHandUntil=ctx.state.turnNumber+1;note({handLockUntil:foe.founjaNoHandUntil});return;
      case 'waitForPrey':if(self)self.founjaWaitPreyUntil=ctx.state.turnNumber+1;return;
      case 'deceive':{if(ctx.resolvingChoice){const target=chosen(foe),left=Math.max(0,Number(ctx.maxHp?.(ctx.side,self)||card(self)?.hp||0)-Number(self?.damage||0));if(target&&validTarget(foe,target))target.damage=Number(target.damage||0)+10*Math.floor(left/10);note({counters:Math.floor(left/10),target:target?.cardId});return;}
        if(theirs.length)ask({kind:'pokemon',side:'opponent',includeActive:true});return;}
      case 'harvester':{if(!foe.active||!card(foe.active)?.types?.includes('Grass'))return;let amount=0;for(let i=0;i<3&&ss.bench.length;i++){
          const type=Object.entries(ss.energyDiscard||{}).find(([,n])=>Number(n)>0)?.[0];if(!type)break;
          if(neoTakeDiscard(ctx,ss,type,1)){const slot=ss.bench[i%ss.bench.length];slot.energy[type]=Number(slot.energy[type]||0)+1;ctx.onEnergyAttached?.(slot,type,1);amount++;}}
        note({attached:amount});return;}
      case 'monkeySwing':if(self){self.founjaFreeRetreatNext=ctx.state.turnNumber+2;note({freeRetreatNext:true});}return;
      case 'butterflySwoop':for(const slot of foe.bench)drop(foe,slot);return;
      case 'insatiableHunger':{const amount=Math.max(0,Number(a.choiceOption||0));let taken=0;for(let i=ss.hand.length-1;i>=0&&taken<amount;i--)if(card(ss.hand[i])?.trainerType==='Item'){ss.discard.push(...ss.hand.splice(i,1));taken++;}
        if(self&&!healingIsBlocked(ctx.state,self,ctx.cardById))self.damage=Math.max(0,Number(self.damage||0)-40*taken);note({discardedItems:taken,healed:40*taken});return;}
      case 'jungleCall':{if(ctx.resolvingChoice){const target=chosen(),remaining=Number(effect.remaining||0);if(target&&validTarget(ss,target)){
            const amount=attachTop(ss,target,'any');note({attached:amount,to:target.cardId});}
          if(remaining>1&&ss.energySupply?.length)ask({kind:'pokemon',side:'self',includeActive:true},{remaining:remaining-1});return;}
        if(ss.energySupply?.length&&mine.length)ask({kind:'pokemon',side:'self',includeActive:true},{remaining:Math.min(3,ss.energySupply.length)});return;}
      case 'mightyWhack':if(flip()){ss.founjaLastWhack=true;foe.deck.push(...foe.hand.splice(0));ctx.shuffle?.(ctx.state,foe.deck);for(let i=0;i<4;i++)ctx.drawCard?.(foe);}return;
      case 'echoBeat':{if(ss.founjaVstarUsed)return;
        if(ctx.resolvingChoice&&effect.phase==='evolution'){const target=ss.bench.find(s=>s.uid===effect.targetUid),index=Number(a.choiceDeckIndex),ref=ss.deck[index];if(target&&ref&&card(ref)?.evolvesFrom===card(target)?.name){ss.deck.splice(index,1);target.stack.push(ref.cardId);target.cardId=ref.cardId;target.evolvedOnTurn=ctx.state.turnNumber;ctx.onEvolved?.(target);ctx.shuffle?.(ctx.state,ss.deck);}return;}
        if(ctx.resolvingChoice&&effect.phase==='basic'){const index=Number(a.choiceDeckIndex),ref=ss.deck[index];if(ref&&card(ref)?.kind==='pokemon'&&card(ref)?.stage==='Basic'&&ss.bench.length<Number(ss.benchLimit||3)){
          ss.deck.splice(index,1);ctx.benchCard?.(ss,ref);const target=ss.bench.find(s=>s.uid===ref.uid),evolution=ss.deck.some(r=>card(r)?.evolvesFrom===card(target)?.name);ctx.shuffle?.(ctx.state,ss.deck);
          if(target&&evolution)ask({kind:'deckCard',side:'self',filter:{evolvesFrom:card(target).name}},{phase:'evolution',targetUid:target.uid});}return;}
        if(ss.bench.length>=Number(ss.benchLimit||3)||!ss.deck.some(r=>card(r)?.kind==='pokemon'&&card(r)?.stage==='Basic'))return;
        ss.founjaVstarUsed=true;ask({kind:'deckCard',side:'self',filter:{kind:'pokemon',stage:'Basic'}},{phase:'basic'});return;
      }
      case 'flightPathCopyEffect':{
        // Play the copied attack's deferred effects using its OWN choice
        // fields, rather than Flight Path's Bench-attacker selector.
        if(effect.copiedEffect)applyEffect(effect.copiedEffect,{...ctx,action:effect.copiedAction||ctx.action});
        return;
      }
      case 'flightPathSwitch':{
        // The copied move has already been resolved through the ordinary attack
        // pipeline (Weakness, Resistance, protection and damage counters).
        // Only switch after its other effects have finished resolving.
        const slot=ss.bench.find(s=>s.uid===effect.slotUid);
        if(slot&&ss.active?.uid===effect.yanmegaUid&&switchPokemon(ss,slot.benchSlot,ctx.state))
          note({copied:effect.copiedAttackName,switchedTo:slot.cardId});
        return;
      }
      case 'talonScrape':{if(ctx.resolvingChoice){const target=chosen(foe);if(target&&foe.bench.includes(target))drop(foe,target);return;}
        if(foe.bench.some(s=>Object.values(s.energy||{}).some(n=>n>0)||(s.specialEnergy||[]).length))ask({kind:'pokemon',side:'opponent',includeActive:false,filter:{hasAnyEnergy:true}});return;}
      case 'dazzleMajesty':{if(ctx.resolvingChoice){const target=chosen(foe);if(!target||!foe.bench.includes(target))return;
          if(switchPokemon(foe,target.benchSlot,ctx.state)){
            const active=foe.active,amount=attackDamageWithState(ctx.state,ctx.side,self,ctx.foeSide,active,100,ctx.cardById);
            if(!attackIsPrevented(ctx.state,ctx.foeSide,active,self,ctx.cardById)){active.damage=Number(active.damage||0)+Math.max(0,amount-modifierAmount(ctx.state,ctx.foeSide,active,'damageReduction',ctx.cardById)-lentalDefenseReduction(ctx.state,ctx.foeSide,active,card(self),ctx.cardById));}
            applyEffect({type:'status',target:'opponentActive',status:'confusion'},ctx);note({to:active.cardId,damage:amount});}return;}
        if(foe.bench.length)ask({kind:'pokemon',side:'opponent',includeActive:false});return;}
      case 'waterLily':{let taken=0;for(let i=0;i<3;i++){if(topEnergy(ss,['Water'])!=='Water')break;taken+=neoEnergyToHand(ctx,ss,'Water',1);}note({energyToHand:taken});return;}
      case 'overlook':{if(ctx.resolvingChoice){const index=Number(a.choiceHandIndex);if(index>=0&&ss.hand[index]){
          ss.discard.push(...ss.hand.splice(index,1));for(let i=0;i<3&&foe.hand.length;i++)foe.discard.push(...foe.hand.splice(Math.floor(ctx.random(ctx.state)*foe.hand.length),1));note({opponentHandNow:foe.hand.length});}return;}
        note({revealed:foe.hand.map(r=>r.cardId)});if(ss.hand.length)ask({kind:'handCard',side:'self',optional:true});return;}
      case 'energyFlower':{const target=ss.active;if(!target)return;const conditions=Object.keys(target.conditions||{});if(!conditions.length)return;
        const chosenStatus=conditions[0];delete target.conditions[chosenStatus];if(!flip())return;
        const subtype=card(target)?.types?.[0],type=Object.entries(ss.energyDiscard||{}).find(([t,n])=>Number(n)>0&&t===subtype)?.[0];if(type&&neoTakeDiscard(ctx,ss,type,1))neoRecoveredEnergyToHand(ctx,ss,type,1);note({conditionRemoved:chosenStatus,recovered:type||null});return;}
      case 'mewsGetaway':{if(ctx.resolvingChoice){const target=chosen();if(target&&ss.bench.includes(target)&&switchPokemon(ss,target.benchSlot,ctx.state)){
           applyEffect({type:'modifier',target:'self',stat:'attackDamage',amount:20,duration:'turn'}, {...ctx,attacker:ss.active});note({switchedTo:ss.active.cardId,bonus:20});}return;}
        if(ss.bench.length)ask({kind:'pokemon',side:'self',includeActive:false});return;}
      // Damage-stage-only rules are consumed by resolveAttack. A pending
      // invocation would be an error; do not mistake it for an implemented effect.
      case 'sonicBreak':case 'sporeStorm':case 'flutterSwarm':case 'chargeSpin':case 'sonicWingbeat':case 'naturePower':case 'furiousPeck':case 'swiftBeak':case 'machDart':case 'fallingStar':return;
      default:throw new Error('Unimplemented Founja rule: '+name);
    }
  }


  // Scarlet & Violet Base: explicit hybrid Classic30 adaptations. The Basic
  // Energy Zone is ORDERED; an Energy search/attachment can never skip its top.
  const SV1_ENERGY_IDS=Object.freeze({Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Darkness:'lental-basic-darkness',Metal:'lental-basic-metal',Colorless:'neo1-110'});
  function sv1ZoneTake(ctx,ss,type){
    if(!ss.energySupply?.length||type&&ss.energySupply[0]!==type)return null;
    const taken=ss.energySupply.shift();ss.nextEnergyType=ss.energySupply[0]||null;return taken;
  }
  function sv1DiscardEnergy(ss,slot,type){
    if(!slot||Number(slot.energy?.[type]||0)<1)return false;
    slot.energy[type]--;recordDiscardedEnergy(ss,type,1);return true;
  }
  function sv1PickSlot(ss,ctx){return selected(ctx,ss);}
  function sv1Roll(ctx,reason,count=1){let results=[];for(let i=0;i<count;i++)results.push(coin(ctx));ctx.state.log.push({type:'coin',side:ctx.side,reason:'Scarlet & Violet '+reason,heads:results.filter(Boolean).length,results});return results;}
  function sv1Rule(effect,ctx){
    const rule=String(effect.rule||'').slice(4),ss=own(ctx),foe=other(ctx),self=ctx.attacker,a=ctx.action||{};
    const note=extra=>ctx.state.log.push({type:'sv1Effect',side:ctx.side,rule,...extra});
    const ask=spec=>ctx.requestChoice?.({...spec,side:'self',effect:spec.effect||effect});
    const chosen=(board)=>sv1PickSlot(board,ctx);
    const apply=fx=>applyEffect(fx,ctx);
    switch(rule){
      case 'specialCondition':{
        const names=['poison','burn','sleep','paralysis','confusion'];
        if(ctx.resolvingChoice){const status=names[Number(a.choiceOption)];if(status)apply({type:'status',status,target:'opponentActive'});}else ask({kind:'option',options:names.map(x=>x[0].toUpperCase()+x.slice(1))});break;
      }
      case 'trickCape':{
        if(!a.effectSelection)return;
        const [type,uid]=String(a.effectSelection).split('|');
        if(type==='special'){const idx=(foe.active?.specialEnergy||[]).findIndex(x=>String(x.uid)===uid);if(idx>=0)foe.hand.push(...foe.active.specialEnergy.splice(idx,1));}
        else if(Number(foe.active?.energy?.[type]||0)>0){foe.active.energy[type]--;const id=SV1_ENERGY_IDS[type];if(id)foe.hand.push({uid:'sv1-recovered-'+ctx.state.turnNumber+'-'+type+'-'+foe.hand.length,cardId:id,zoneGenerated:true});}
        note({effect:'returned opposing Energy to hand'});break;
      }
      case 'eerieTentacles':{
        const [uid,type]=String(a.effectSelection||'').split('|'),target=foe.bench.find(s=>s.uid===uid);
        if(target&&Number(foe.active?.energy?.[type]||0)>0){foe.active.energy[type]--;target.energy[type]=Number(target.energy[type]||0)+1;note({energyType:type,to:target.cardId});}
        break;
      }
      case 'energyFromZoneToHand':case 'energySearch':{
        const n=rule==='energySearch'?1:Number(effect.amount||1);let count=0;
        for(let i=0;i<n;i++){const type=sv1ZoneTake(ctx,ss);if(!type)break;const cardId=SV1_ENERGY_IDS[type];if(!cardId){ss.energyDiscard[type]=Number(ss.energyDiscard[type]||0)+1;continue;}ss.hand.push({uid:'sv1-zone-hand-'+ctx.state.turnNumber+'-'+ss.hand.length,cardId,zoneGenerated:true});count++;}
        note({amount:count,source:'ordered Energy Zone'});break;
      }
      case 'enrichingOil':{
        if(ctx.resolvingChoice){if(a.choiceSkip)return;const target=chosen(ss);
          if(target&&Number(target.damage||0)>0){target.damage=0;note({healed:target.cardId,amount:'all'});}
        }else if(pokemonOn(ss).some(p=>Number(p.damage||0)>0))ask({kind:'pokemon',includeActive:true,filter:{damaged:true},optional:true});
        break;
      }
      case 'energyCarnival':{
        // One extra attachment from hand. In the hybrid format, the next
        // ordered Energy Zone card stands in for an otherwise empty hand.
        const held=ss.hand.filter(ref=>ctx.cardById(ref.cardId)?.basicEnergy).map(ref=>ctx.cardById(ref.cardId)?.subtype);
        const available=[...new Set(held.length?held:(ss.energySupply?.length?[ss.energySupply[0]]:[]))];
        if(!available.length)return;
        if(ctx.resolvingChoice){if(a.choiceSkip)return;const target=chosen(ss),type=a.effectEnergyType;if(!target||!available.includes(type))return;
          if(held.length){const idx=ss.hand.findIndex(ref=>{const card=ctx.cardById(ref.cardId);return card?.basicEnergy&&card.subtype===type;});if(idx<0)return;ss.hand.splice(idx,1);}
          else if(!sv1ZoneTake(ctx,ss,type))return;
          target.energy[type]=Number(target.energy[type]||0)+1;ctx.onEnergyAttached?.(target,type,1);note({to:target.cardId,energyType:type});
        }else ask({kind:'energyTarget',energyTypes:available});return;
      }
      case 'miseEnPlace':case 'passionateSinging':case 'dinoCry':case 'psychicEmbrace':{
        const source=rule==='miseEnPlace'?'zone':'discard';
        const fixedType=rule==='miseEnPlace'?'Water':rule==='dinoCry'?'Fighting':rule==='psychicEmbrace'?'Psychic':null;
        const max=rule==='psychicEmbrace'?1:2,remaining=Number(effect.remaining??max);
        const filter=rule==='miseEnPlace'?{kind:'pokemon',stage:'Basic'}:rule==='dinoCry'?{kind:'pokemon',stage:'Basic',subtype:'Fighting'}:rule==='psychicEmbrace'?{kind:'pokemon',subtype:'Psychic'}:null;
        const types=source==='zone'?(ss.energySupply?.length?[ss.energySupply[0]]:[]):Object.keys(ss.energyDiscard||{}).filter(t=>Number(ss.energyDiscard[t])>0).concat(ss.discard.map(ref=>ctx.cardById(ref.cardId)).filter(c=>c?.basicEnergy).map(c=>c.subtype));
        const available=[...new Set(types)].filter(t=>!fixedType||fixedType===t);
        if(!available.length){if(rule==='dinoCry'&&remaining===max)ctx.endTurn?.();return;}
        if(ctx.resolvingChoice){if(a.choiceSkip){if(rule==='dinoCry')ctx.endTurn?.();return;}const target=chosen(ss),type=a.effectEnergyType||available[0];
          if(target&&available.includes(type)&&matchesFilter(ctx.cardById(target.cardId),filter,target)&&!(rule==='psychicEmbrace'&&Number(ctx.cardById(target.cardId)?.hp||0)-Number(target.damage||0)<=20)){
            let success=false;if(source==='zone')success=!!sv1ZoneTake(ctx,ss,type);else success=neoTakeDiscard(ctx,ss,type,1)===1;
            if(success){target.energy[type]=Number(target.energy[type]||0)+1;ctx.onEnergyAttached?.(target,type,1);if(rule==='psychicEmbrace'){target.damage=Number(target.damage||0)+20;}note({to:target.cardId,energyType:type});}
          }
          if(rule==='dinoCry'){if(remaining<=1){ctx.endTurn?.();return;}}
          const next=remaining-1,still=source==='zone'?(ss.energySupply?.length?[ss.energySupply[0]]:[]):Object.keys(ss.energyDiscard||{}).filter(t=>Number(ss.energyDiscard[t]||0)>0);
          const nextTypes=still.filter(t=>!fixedType||fixedType===t);
          if(next>0&&nextTypes.length)ask({kind:'energyTarget',energyTypes:nextTypes,filter,optional:true,effect:{...effect,remaining:next}});
          else if(rule==='dinoCry')ctx.endTurn?.();
        }else ask({kind:'energyTarget',energyTypes:available,filter,optional:true,effect:{...effect,remaining}});
        break;
      }
      case 'curseSpreading':{
        const left=Math.max(0,Number(effect.remaining??8));
        if(ctx.resolvingChoice){const target=chosen(foe);if(target)target.damage=Number(target.damage||0)+10;
          if(left>1&&[foe.active,...foe.bench].some(Boolean))ask({kind:'pokemon',selectionSide:ctx.foeSide,includeActive:true,effect:{...effect,remaining:left-1}});
        }else ask({kind:'pokemon',selectionSide:ctx.foeSide,includeActive:true,effect:{...effect,remaining:left}});break;
      }
      case 'supporterToBottom':{
        if(ctx.resolvingChoice){const idx=Number(a.choiceHandIndex),ref=foe.hand[idx];if(ref&&ctx.cardById(ref.cardId)?.trainerType==='Supporter')foe.deck.push(...foe.hand.splice(idx,1));}
        else if(foe.hand.some(ref=>ctx.cardById(ref.cardId)?.trainerType==='Supporter'))ask({kind:'opponentHandCard',filter:{kind:'trainer',trainerType:'Supporter'}});break;
      }
      case 'sandstormSpray':{
        if(Object.values(self?.energy||{}).reduce((n,x)=>n+Number(x||0),0)<2)return;
        for(let i=0;i<2;i++){const type=Object.keys(self.energy).find(t=>self.energy[t]>0);if(type)sv1DiscardEnergy(ss,self,type);}
        apply({type:'shuffleIntoDeck',target:'opponentActive',includeAttached:true});break;
      }
      case 'doomDecree':if(sv1Roll(ctx,'Doom Decree',2).every(Boolean))apply({type:'knockOut',target:'opponentActive'});break;
      case 'tripleLaser':apply({type:'multiTargetDamage',target:'opponentPokemon',amount:30,count:3});break;
      case 'happyCyclone':{
        const chosenUid=a.effectSelection,target=ss.bench.find(s=>s.uid===chosenUid);
        if(!target)return;
        for(const [type,n] of Object.entries(self?.energy||{})){target.energy[type]=Number(target.energy[type]||0)+Number(n||0);}self.energy={};target.specialEnergy=[...(target.specialEnergy||[]),...(self.specialEnergy||[])];self.specialEnergy=[];break;
      }
      case 'dragOff':{
        if(ctx.resolvingChoice){const target=chosen(foe);if(target&&switchPokemon(foe,target.benchSlot,ctx.state))foe.active.damage=Number(foe.active.damage||0)+30;}
        else if(foe.bench.length)ask({kind:'pokemon',selectionSide:ctx.foeSide,includeActive:false});break;
      }
      case 'rageFist':case 'avengingKnuckle':case 'payback':break; // resolved in attackDamage below
      case 'flyFailure':note({outcome:'Tails — attack fails'});break;
      case 'pokegear':{
        const count=Math.min(7,ss.deck.length);
        if(ctx.resolvingChoice){const idx=Number(a.choiceDeckIndex);if(idx>=0&&idx<count&&ctx.cardById(ss.deck[idx]?.cardId)?.trainerType==='Supporter')ss.hand.push(...ss.deck.splice(idx,1));ctx.shuffle?.(ctx.state,ss.deck);}
        else if(ss.deck.slice(0,count).some(ref=>ctx.cardById(ref.cardId)?.trainerType==='Supporter'))ask({kind:'topDeckCard',count,deckSide:ctx.side,filter:{trainerType:'Supporter'}});
        break;
      }
      case 'arven':{
        if(ctx.resolvingChoice){const idx=Number(a.choiceDeckIndex),ref=ss.deck[idx];if(ref){const c=ctx.cardById(ref.cardId);if(c?.trainerType===effect.phase){ss.hand.push(...ss.deck.splice(idx,1));ctx.shuffle?.(ctx.state,ss.deck);}}
          if(effect.phase==='Item'&&ss.deck.some(r=>ctx.cardById(r.cardId)?.trainerType==='Tool'))ask({kind:'deckCard',filter:{kind:'trainer',trainerType:'Tool'},effect:{...effect,phase:'Tool'}});
        }else if(ss.deck.some(r=>ctx.cardById(r.cardId)?.trainerType==='Item'))ask({kind:'deckCard',filter:{kind:'trainer',trainerType:'Item'},effect:{...effect,phase:'Item'}});
        else if(ss.deck.some(r=>ctx.cardById(r.cardId)?.trainerType==='Tool'))ask({kind:'deckCard',filter:{kind:'trainer',trainerType:'Tool'},effect:{...effect,phase:'Tool'}});
        break;
      }
      case 'electricGenerator':{
        // Energy cards are not in Classic deck: reveal the NEXT five Energy
        // Zone cards and attach up to two Lightning among those five.
        const visible=(ss.energySupply||[]).slice(0,5),amount=Math.min(2,visible.filter(t=>t==='Lightning').length);
        if(!amount||!ss.bench.some(s=>ctx.cardById(s.cardId)?.types?.includes('Lightning')))break;
        if(ctx.resolvingChoice){const target=chosen(ss);if(target&&ss.bench.includes(target)&&ctx.cardById(target.cardId)?.types?.includes('Lightning')){
            const index=ss.energySupply.slice(0,5).indexOf('Lightning');if(index>=0){ss.energySupply.splice(index,1);ss.nextEnergyType=ss.energySupply[0]||null;target.energy.Lightning=Number(target.energy.Lightning||0)+1;ctx.onEnergyAttached?.(target,'Lightning',1);}
          }
          if(Number(effect.remaining||amount)>1&&ss.energySupply.slice(0,5).includes('Lightning'))ask({kind:'pokemon',includeActive:false,filter:{subtype:'Lightning'},effect:{...effect,remaining:Number(effect.remaining||amount)-1}});
        }else ask({kind:'pokemon',includeActive:false,filter:{subtype:'Lightning'},effect:{...effect,remaining:amount}});
        break;
      }
      case 'energySwitch':case 'fireOff':case 'strangeBehavior':{
        if(rule==='strangeBehavior'){
          const otherDamaged=[ss.active,...ss.bench].filter(s=>s&&s!==self&&s.damage>0);
          if(!otherDamaged.length||Number(self?.damage||0)+10>=Number(ctx.cardById(self.cardId)?.hp||0))return;
          if(ctx.resolvingChoice){const target=chosen(ss);if(target&&target!==self&&target.damage>0){target.damage-=10;self.damage=Number(self.damage||0)+10;}}
          else ask({kind:'pokemon',includeActive:true,filter:{damaged:true},excludeUids:[self.uid]});return;
        }
        const sources=rule==='fireOff'?ss.bench.filter(s=>Number(s.energy?.Fire||0)>0):[ss.active,...ss.bench].filter(s=>s&&Object.values(s.energy||{}).some(n=>n>0));
        if(ctx.resolvingChoice){
          if(!effect.fromUid){const source=chosen(ss);if(source&&sources.some(s=>s.uid===source.uid)){const types=rule==='fireOff'?['Fire']:Object.keys(source.energy||{}).filter(t=>source.energy[t]>0);ask({kind:'energyTarget',energyTypes:types,effect:{...effect,fromUid:source.uid}});} }
          else {const from=sources.find(s=>s.uid===effect.fromUid),to=chosen(ss),type=a.effectEnergyType;
            if(from&&to&&from!==to&&Number(from.energy?.[type]||0)>0){from.energy[type]--;to.energy[type]=Number(to.energy[type]||0)+1;ctx.onEnergyAttached?.(to,type,1);}
          }
        }else if(sources.length)ask({kind:'pokemon',includeActive:rule!=='fireOff',filter:rule==='fireOff'?{hasEnergyType:'Fire'}:{hasAnyEnergy:true}});
        break;
      }
      case 'rumblingEngine':{
        const card=ss.hand.findIndex(ref=>ctx.cardById(ref.cardId)?.basicEnergy);
        if(card<0){const type=ss.energySupply?.[0];if(!type)return;const taken=sv1ZoneTake(ctx,ss,type);recordDiscardedEnergy(ss,taken,1);}
        else {const [ref]=ss.hand.splice(card,1);recordDiscardedEnergy(ss,ctx.cardById(ref.cardId)?.subtype,1);}
        while(ss.hand.length<6&&ss.deck.length)ctx.drawCard(ss);break;
      }
      case 'nestStash':{
        if(!ss.hand.length)return;ss.deck.push(...ss.hand.splice(0));ctx.drawCard(ss);break;
      }
      case 'miriam':case 'palPad':{
        const max=rule==='miriam'?5:2,filter=rule==='miriam'?{kind:'pokemon'}:{kind:'trainer',trainerType:'Supporter'};
        const candidates=ss.discard.filter(ref=>matchesFilter(ctx.cardById(ref.cardId),filter));
        if(ctx.resolvingChoice){if(a.choiceSkip){if(rule==='miriam'&&Number(effect.done||0))for(let j=0;j<3;j++)ctx.drawCard(ss);return;}
          const idx=Number(a.choiceDiscardIndex),ref=ss.discard[idx];if(ref&&matchesFilter(ctx.cardById(ref.cardId),filter)){ss.deck.push(...ss.discard.splice(idx,1));ctx.shuffle?.(ctx.state,ss.deck);}
          const done=Number(effect.done||0)+1;
          if(done<max&&ss.discard.some(r=>matchesFilter(ctx.cardById(r.cardId),filter)))ask({kind:'discardCard',filter,optional:true,effect:{...effect,done}});
          else if(rule==='miriam')for(let j=0;j<3;j++)ctx.drawCard(ss);
        }else if(candidates.length)ask({kind:'discardCard',filter,optional:true,effect:{...effect,done:0}});
        break;
      }
      case 'teamStarGrunt':{
        const target=foe.active,type=a.effectEnergyType||Object.keys(target?.energy||{}).find(t=>target.energy[t]>0);
        if(target&&type&&target.energy[type]>0){target.energy[type]--;foe.energySupply=foe.energySupply||[];foe.energySupply.unshift(type);foe.nextEnergyType=type;note({returned:type,zone:'top of Energy Zone'});}
        break;
      }
      case 'expShare':{const ko=ctx.eventData?.knockedOut,target=self;
        if(!ko||ko.uid===target?.uid||!target)return;
        const type=Object.keys(ko.energy||{}).find(t=>Number(ko.energy[t])>0);
        if(type){ko.energy[type]--;target.energy[type]=Number(target.energy[type]||0)+1;ctx.onEnergyAttached?.(target,type,1);note({energyType:type,from:ko.cardId,to:target.cardId});}
        break;
      }
      case 'flyingEntry':{
        const previous=[...(effect.pickedUids||[])],eligible=foe.bench.filter(t=>t&&!previous.includes(t.uid));
        if(ctx.resolvingChoice){if(a.choiceSkip)return;const target=chosen(foe);if(target&&eligible.includes(target)){target.damage=Number(target.damage||0)+10;previous.push(target.uid);}
          if(previous.length<2&&foe.bench.some(t=>t&&!previous.includes(t.uid)))ask({kind:'pokemon',selectionSide:ctx.foeSide,includeActive:false,excludeUids:previous,optional:true,effect:{...effect,pickedUids:previous}});
        }else if(eligible.length)ask({kind:'pokemon',selectionSide:ctx.foeSide,includeActive:false,optional:true});
        break;
      }
      case 'wellBakedBody':case 'poisonSacs':case 'rockyHelmet':break;
      default:throw new Error('Unsupported Scarlet & Violet rule: '+rule);
    }
  }

  function lentalRule(effect,ctx){
    const ss=own(ctx),foe=other(ctx),rule=effect.rule;
    if(rule.startsWith('founja:'))return founjaRule(effect,ctx);
    if(rule.startsWith('sv1:'))return sv1Rule(effect,ctx);
    if(FLORIO114.has(rule))return florio114(ctx,effect);
    if(LENTAL_113_RULES.has(rule))return lentalRule113(effect,ctx);
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
    // Ledian's Energy Conservation applies only against an opposing Item or
    // Supporter which tries to remove attached Energy from our Pokémon.
    const trainer=ctx.trainerRef&&ctx.cardById?.(ctx.trainerRef.cardId);
    if(trainer&&['Item','Supporter'].includes(trainer.trainerType)&&['discardEnergyCard','discardEnergy','returnToHand','shuffleIntoDeck'].includes(effect.type)){
      const victimSide=String(effect.target||'').startsWith('opponent')?ctx.foeSide:ctx.side;
      if(victimSide!==ctx.side&&pokemonOn(ctx.state.sides[victimSide]).some(slot=>slot.cardId==='SNAPFOUNJA-008'&&!abilitiesSuppressed(ctx.state,victimSide,slot,ctx.cardById))){
        ctx.state.log.push({type:'founjaEnergyConservation',side:victimSide,trainerCardId:trainer.id});return;
      }
    }
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
        if(ctx.state.format==='classic'&&['neo1-98','ecard1-151'].includes(ctx.trainerRef?.cardId)){
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
        if(ctx.resolvingChoice&&ctx.action?.choiceTarget==='bench'){switchPokemon(ss,ctx.action.choiceBenchIndex,ctx.state);log({type:'switch',chosenBy:effect.chooseBy==='attacker'?ctx.side:ctx.foeSide});break;}
        if(typeof ctx.requestChoice==='function')ctx.requestChoice({kind:'switchBench',side:effect.chooseBy==='attacker'?'self':'opponent',selectionSide:ctx.foeSide,effect});break;
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
          const ids={Fighting:'gym1-127',Fire:'gym1-128',Grass:'gym1-129',Lightning:'gym1-130',Psychic:'gym1-131',Water:'gym1-132',Darkness:'lental-basic-darkness',Metal:'lental-basic-metal'};
          for(const [type,n] of Object.entries(slot.energy||{}))for(let i=0;i<Number(n||0);i++){
            if(ids[type])refs.push({uid:`${slot.uid}-basic-${type}-${i}`,cardId:ids[type],zoneGenerated:true});
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
      case 'benchDamage':{if(ctx.isAttack&&ctx.state.stadium?.cardId==='SNAPFLORIO-112')break;const ss=effect.side==='self'?own(ctx):other(ctx);const list=effect.all?ss.bench:targets(effect.side==='self'?'selfBench':'opponentBench',ctx);for(const s of list.filter(s=>s&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s))){const side=effect.side==='self'?ctx.side:ctx.foeSide;const guard=ctx.isAttack&&attackIsPrevented(ctx.state,side,s,ctx.attacker,ctx.cardById)||fossilTransparencyBlocks(ctx,side,s);const bonus=ctx.isAttack&&ctx.attacker?modifierAmount(ctx.state,ctx.side,ctx.attacker,'attackDamageAllTargets',ctx.cardById):0;
        const charm=ctx.isAttack&&ctx.attacker&&Number(effect.amount||0)+bonus>0?toolsOf(ctx.attacker).find(r=>r.cardId==='ecard1-150'):null;
        const amount=guard?0:Math.max(0,Number(effect.amount||0)+bonus+(charm?10:0)-(ctx.isAttack?modifierAmount(ctx.state,side,s,'damageReduction',ctx.cardById):0));const lentalReduction=ctx.isAttack&&!guard?lentalDefenseReduction(ctx.state,side,s,ctx.cardById(ctx.attacker?.cardId),ctx.cardById):0;
        s.damage=Number(s.damage||0)+Math.max(0,amount-lentalReduction);if(charm&&amount>lentalReduction)charm.strengthCharmUsedTurn=ctx.state.turnNumber;if(ctx.isAttack&&ctx.attacker&&amount>lentalReduction)florioReactToAttackDamage(ctx.state,side,s,ctx.side,ctx.attacker,Math.max(0,amount-lentalReduction),ctx.cardById,ctx.random);if(ctx.isAttack&&amount>lentalReduction)log({type:'benchDamage',targetSide:side,sourceCardId:ctx.attacker?.cardId||null,targetCardId:s.cardId,benchIndex:Number(s.benchSlot||0),amount:Math.max(0,amount-lentalReduction),attack:ctx.attack?.name||'Attack'});}break;}
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
              // Hybrid Classic: Basic Energy normally lives in the *ordered*
              // Energy Zone rather than the deck/hand. An effect requiring
              // Energy from hand takes the visible next card of the right type
              // instead. Never search deeper in the zone or skip its top.
              if(ctx.state.format==='classic'&&owner.energySupply?.[0]===effect.energyType&&neoSupplyTake(ctx,owner,effect.energyType,1)===1){amount++;continue;}
              // Cards genuinely returned to hand by effects remain usable.
              const idx=owner.hand.findIndex(ref=>{const c=ctx.cardById(ref.cardId);return c?.basicEnergy&&c.subtype===effect.energyType;});
              if(idx<0)break;
              owner.hand.splice(idx,1);amount++;
            }
          }else if(Array.isArray(owner.energySupply))amount=neoSupplyTake(ctx,owner,effect.energyType,effect.amount);
          if(!amount)continue;s.energy[effect.energyType]=Number(s.energy[effect.energyType]||0)+amount;attachedBySide[side]+=amount;if(typeof ctx.onEnergyAttached==='function')ctx.onEnergyAttached(s,effect.energyType,amount);}log({type:'effectEnergy',amount:effect.amount,totalAmount:attachedBySide.player+attachedBySide.opponent,attachedBySide,energyType:effect.energyType});break;}
      case 'discardEnergyCard':for(const s of affected()){const owner=energyOwner(ctx,s);if(!owner)continue;const protectedByBrock=(s.temporaryTrainers||[]).some(r=>ctx.cardById(r.cardId)?.id==='gym2-101');if(protectedByBrock&&owner!==own(ctx))continue;let left=effect.amount==='all'?(effect.strictEnergyType&&effect.energyType?Number(s.energy?.[effect.energyType]||0)+(s.specialEnergy||[]).filter(r=>Number((r.provides||ctx.cardById(r.cardId)?.effect?.provides||{})[effect.energyType]||0)>0).length:Object.values(s.energy||{}).reduce((n,x)=>n+Number(x||0),0)+(s.specialEnergy||[]).length):Number(effect.amount||1);while(left>0){const special=s.specialEnergy||[];const chosenUid=ctx.action?.effectSpecialEnergyUid;if(chosenUid){const index=special.findIndex(r=>r.uid===chosenUid);if(index>=0&&(!effect.strictEnergyType||!effect.energyType||Number((special[index].provides||ctx.cardById(special[index].cardId)?.effect?.provides||{})[effect.energyType]||0)>0)){const [ref]=special.splice(index,1);if(ref.cardId==='neo1-105'||ctx.state.stadium?.cardId==='neo1-84'&&owner!==own(ctx)&&ctx.cardById(ref.cardId)?.subtype!=='Colorless')owner.hand.push(ref);else owner.discard.push(ref);left--;continue;}}const chosenType=effect.energyType||ctx.action?.effectEnergyType;if(chosenType&&Number(s.energy?.[chosenType]||0)>0){s.energy[chosenType]--;if(ctx.state.stadium?.cardId==='neo1-84'&&owner!==own(ctx)&&chosenType!=='Colorless')neoRecoveredEnergyToHand(ctx,owner,chosenType,1);else recordDiscardedEnergy(owner,chosenType,1);left--;continue;}if(effect.strictEnergyType&&effect.energyType){const idx=special.findIndex(r=>Number((r.provides||ctx.cardById(r.cardId)?.effect?.provides||{})[effect.energyType]||0)>0);if(idx>=0){owner.discard.push(...special.splice(idx,1));left--;continue;}break;}const generated=Object.entries(s.energy||{}).find(([,n])=>Number(n)>0);if(generated){s.energy[generated[0]]--;if(ctx.state.stadium?.cardId==='neo1-84'&&owner!==own(ctx)&&generated[0]!=='Colorless')neoRecoveredEnergyToHand(ctx,owner,generated[0],1);else recordDiscardedEnergy(owner,generated[0],1);left--;continue;}if(special.length){const ref=special.shift();if(ref.cardId==='neo1-105'||ctx.state.stadium?.cardId==='neo1-84'&&owner!==own(ctx)&&ctx.cardById(ref.cardId)?.subtype!=='Colorless')owner.hand.push(ref);else owner.discard.push(ref);left--;continue;}break;}}break;
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

      if(e.type==='lentalRule'&&String(e.rule||'').startsWith('sv1:')){
        const r=e.rule.slice(4),ss=own(ctx),foe=other(ctx),att=ctx.attacker,def=ctx.defender;
        if(r==='rageFist'){damage=70*Number(foe.prizesTaken||0);return;}
        if(r==='avengingKnuckle'){
          const last=Number(ctx.state.turnNumber)-1,knockout=(ctx.state.log||[]).some(x=>x.type==='ko'&&x.side===ctx.side&&Number(x.turnNumber||last)===last&&ctx.cardById(x.cardId)?.types?.includes('Fighting'));
          if(knockout)damage+=120;return;
        }
        if(r==='payback'){if((foe.prizes||[]).length===1)damage+=90;return;}
        if(r==='doomDecree'||r==='curseSpreading'||r==='sandstormSpray'||r==='happyCyclone'||r==='dragOff'||r==='tripleLaser'||r==='trickCape'||r==='eerieTentacles'||r==='specialCondition'||r==='miseEnPlace'||r==='passionateSinging'||r==='supporterToBottom'||r==='energyFromZoneToHand'||r==='flyFailure'){
          if(r==='flyFailure')damage=0;
          pending.push(e);return;
        }
        pending.push(e);return;
      }
      if(e.type==='lentalRule'&&String(e.rule||'').startsWith('founja:')){
        const r=e.rule.slice(7),ss=own(ctx),foe=other(ctx),self=ctx.attacker,def=ctx.defender;
        const energy=typeof ctx.effectiveEnergy==='function'?ctx.effectiveEnergy(self):self?.energy||{};
        const attached=Object.values(energy).reduce((n,v)=>n+Number(v||0),0);
        const roll=(n)=>{const results=Array.from({length:Math.min(100,Math.max(0,n))},()=>coin(ctx));ctx.state.log.push({type:'coin',side:ctx.side,reason:'Founja '+r,heads:results.filter(Boolean).length,results});return results.filter(Boolean).length;};
        if(r==='sporeStorm'){const n=pokemonOn(foe).reduce((acc,s)=>acc+Object.values(s.energy||{}).reduce((v,c)=>v+Number(c||0),0)+(s.specialEnergy||[]).length,0);damage=40+40*roll(n);return;}
        if(r==='sonicWingbeat'){damage=20*roll(4);if(!damage)pending.push({type:'discardEnergyCard',target:'opponentActive',amount:1});return;}
        if(r==='chargeSpin'){damage=self?.damage>0?20:50;return;}
        if(r==='flutterSwarm'){damage=30+30*[...pokemonOn(ss),...pokemonOn(foe)].filter(s=>ctx.cardById(s.cardId)?.name==='Vivillon').length;return;}
        if(r==='naturePower'){damage=0;return;}
        if(r==='furiousPeck'){damage=10*(Object.values(self?.energy||{}).reduce((n,v)=>n+Number(v||0),0));return;}
        if(r==='swiftBeak'){damage=40+(Number(self?.movedToActiveTurn)===Number(ctx.state.turnNumber)?80:0);return;}
        if(r==='machDart'){if(Number(self?.movedToActiveTurn)!==Number(ctx.state.turnNumber)){damage=0;attackDoesNothing=true;}return;}
        if(r==='fallingStar'){
          if(ctx.action?.effectSelection==='tool'&&(self?.tool||(self?.extraTools||[]).length)){
            const ref=self.tool||self.extraTools[0];if(self.tool?.uid===ref.uid)self.tool=self.extraTools?.shift()||null;else self.extraTools=self.extraTools.filter(x=>x.uid!==ref.uid);
            ss.discard.push(ref);damage+=70;
          }return;
        }
        if(r==='sonicBreak'){
          const target=ctx.action?.target==='opponentBench'?foe.bench.find(s=>Number(s.benchSlot)===Number(ctx.action?.benchIndex)):foe.active;
          if(!target){damage=0;attackDoesNothing=true;return;}damageTarget=target;damage=60;
          if(target!==foe.active)damageRules={...damageRules,ignoreWeakness:true,ignoreResistance:true};return;
        }
        if(r==='ironShell'){damage+=10*Number(energy.Psychic||0);}
        if(r==='berryBlast'&&def?.damage>0)damage=40;
        if(r==='magicSplash'&&ctx.action?.effectSelection)damage=0;
        if(r==='monkeySwing'&&self?.founjaFreeRetreatNext>ctx.state.turnNumber)damage=20;
        if(r==='flightPath'){
          const [uid,indexRaw]=String(ctx.action?.effectSelection||'').split('|');
          const index=Number(indexRaw),slot=ss.bench.find(s=>s.uid===uid);
          const chosen=Number.isInteger(index)&&indexRaw!==undefined?ctx.cardById(slot?.cardId)?.attacks?.[index]:null;
          if(!slot||!chosen||String(chosen.cost||'').length>2||Number(ctx.copyDepth||0)>=3){
            damage=0;attackDoesNothing=true;return;
          }
          const copiedAction={...ctx.action,effectSelection:ctx.action?.copiedEffectSelection||''};
          const copy=resolveAttack(chosen,{...ctx,action:copiedAction,attack:chosen,
            copyDepth:Number(ctx.copyDepth||0)+1,ignoreUseCosts:true});
          damage=copy.damage;
          damageTarget=copy.damageTarget;
          damageRules={...damageRules,...copy.damageRules};
          for(const copiedEffect of copy.pendingEffects)pending.push({type:'lentalRule',
            rule:'founja:flightPathCopyEffect',copiedEffect,copiedAction});
          pending.push({type:'lentalRule',rule:'founja:flightPathSwitch',slotUid:slot.uid,
            yanmegaUid:self.uid,copiedAttackName:chosen.name});
          return;
        }
        if(r==='jumpSlamGX'&&!ss.gxAttackUsed){/* applied after damage */}
        pending.push(e);return;
      }
      if(e.type==='neoRule'&&String(e.rule||'').startsWith('skyridge:')){
        const rule=e.rule.slice('skyridge:'.length),us=own(ctx),them=other(ctx),att=ctx.attacker,def=ctx.defender;
        const attachedCards=slot=>totalEnergy(slot?.energy||{})+(slot?.specialEnergy||[]).length;
        const flipSky=()=>{const hit=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Skyridge '+rule,heads:hit?1:0,results:[hit]});return hit;};
        const flipN=n=>{const results=Array.from({length:n},()=>coin(ctx)),heads=results.filter(Boolean).length;ctx.state.log.push({type:'coin',side:ctx.side,reason:'Skyridge '+rule,heads,results});return heads;};
        switch(rule){
          case 'eruption':{
            const refs=[us,them].map(board=>{const ref=board.deck.shift();if(ref)board.discard.push(ref);return ref;});
            damage=20+20*refs.filter(ref=>ctx.cardById(ref?.cardId)?.basicEnergy&&ctx.cardById(ref.cardId).subtype==='Fire').length;
            return;
          }
          case 'trample':{
            damage=40;for(const board of [us,them])for(const slot of board.bench){if(flipSky())slot.damage=Number(slot.damage||0)+20;}
            return;
          }
          case 'zzzap':{
            damage=0;for(const board of [us,them])for(const slot of pokemonOn(board)){
              if((ctx.cardById(slot.cardId)?.abilities||[]).length)slot.damage=Number(slot.damage||0)+20;
            }return;
          }
          case 'maxVoltage':{
            const types=Number(att?.energy?.Lightning||0);let specials=0;
            if(att){att.energy.Lightning=0;us.energyDiscard=us.energyDiscard||{};us.energyDiscard.Lightning=Number(us.energyDiscard.Lightning||0)+types;
              for(const ref of (att.specialEnergy||[]).slice()){
                const c=ctx.cardById(ref.cardId),provides=ref.provides||c?.effect?.provides||{};
                if(!Number(provides.Lightning||0))continue;
                att.specialEnergy.splice(att.specialEnergy.indexOf(ref),1);us.discard.push(ref);specials++;
              }
            }damage=20+10*(types+specials);return;
          }
          case 'lonelyFang':damage=30+20*(them.bench.length-us.bench.length);return;
          case 'magneticWave':damage=30+10*(us.bench.length-them.bench.length);return;
          case 'energyBurst':damage=flipSky()?10*(attachedCards(att)+attachedCards(def)):0;return;
          case 'doTheWave':damage=flipSky()?10*(us.bench.length+(us.active?1:0)):0;return;
          case 'giftOfSpite':damage=0;pending.push({type:'damage',target:'opponentActive',amount:10*pokemonOn(us).filter(slot=>Number(slot.damage||0)>0).length});return;
          case 'continuousCharge':{const heads=flipN(4);damage=30+20*heads;if(heads)pending.push({type:'selfDamage',amount:heads*10});return;}
          case 'returnAttack':damage=flipN(2)>0?10*Math.floor(Number(att?.damage||0)/10):0;return;
          case 'syncroblast':damage=attachedCards(att)===attachedCards(def)?40:10;return;
          case 'angryHorn':damage=Number(att?.damage||0)>=40?50:30;return;
          case 'energyHealing':damage=0;pending.push({type:'healSelf',amount:20*attachedCards(att)});return;
          case 'healingDust':{const heads=flipN(2);damage=0;if(heads)pending.push({type:'heal',target:'selfAll',amount:10*heads});return;}
          case 'miraclePowder':if(flipSky())pending.push({type:'neoRule',rule:'skyridge:miraclePowderChoice'});return;
          case 'empathicHealing':damage=0;pending.push(e);return;
          case 'pollenShield':pending.push(e);return;
          case 'dragOff':{
            const target=them.bench.find(slot=>slot.uid===ctx.action?.effectSelection);
            if(target&&switchPokemon(them,target.benchSlot,ctx.state)){
              damageTarget=target;ctx.defender=target;
              ctx.state.log.push({type:'skyridgeSwitch',side:ctx.foeSide,cardId:target.cardId,reason:'Drag Off'});
            }
            return;
          }
          case 'metalTail':damage=ctx.action?.effectSelection==='flip'?(flipSky()?80:0):40;return;
          case 'warpHole':if(flipSky()&&us.discard.length)pending.push({type:'neoRule',rule:'skyridge:warpHoleChoose'});return;
          default:pending.push(e);return;
        }
      }
      if(e.type==='neoRule'&&String(e.rule||'').startsWith('aquapolis:')){
        const rule=e.rule.slice('aquapolis:'.length),rolls=n=>{const results=Array.from({length:n},()=>coin(ctx));ctx.state.log.push({type:'coin',side:ctx.side,reason:'Aquapolis '+rule,heads:results.filter(Boolean).length,results});return results.filter(Boolean).length;};
        if(rule==='fireBlow'){
          const n=Math.max(0,Math.min(Number(ctx.action?.effectSelection)||0,Number(ctx.attacker?.energy?.Fire||0)));
          if(n){ctx.attacker.energy.Fire-=n;const board=own(ctx);board.energyDiscard.Fire=(board.energyDiscard.Fire||0)+n;}
          damage=30+30*rolls(n);return;
        }
        if(rule==='superEggsplosion'){
          const options=(String(ctx.action?.effectSelection||'').split(',').filter(Boolean)),ss=own(ctx),slots=pokemonOn(ss);let discarded=0;
          for(const token of options){const [uid,type]=token.split('~'),slot=slots.find(p=>p.uid===uid);if(!slot)continue;
            if(type.startsWith('special:')){const i=(slot.specialEnergy||[]).findIndex(r=>r.uid===type.slice(8));if(i>=0){ss.discard.push(...slot.specialEnergy.splice(i,1));discarded++;}}
            else if(Number(slot.energy?.[type]||0)>0){slot.energy[type]--;ss.energyDiscard[type]=(ss.energyDiscard[type]||0)+1;discarded++;}}
          damage=40*rolls(Math.min(150,discarded));return;
        }
        if(rule==='heavyMetal'){
          const count=Number(ctx.attacker?.energy?.Metal||0)+(ctx.attacker?.specialEnergy||[]).filter(ref=>Number((ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{}).Metal||0)>0).length;
          damage=30+20*rolls(Math.min(100,count));return;
        }
        if(rule==='burningSludge'){
          const count=Number(ctx.attacker?.energy?.Grass||0)+(ctx.attacker?.specialEnergy||[]).filter(ref=>Number((ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{}).Grass||0)>0).length;
          if(rolls(Math.min(100,count))>0)pending.push({type:'sequence',effects:[{type:'status',target:'opponentActive',status:'poison'},{type:'status',target:'opponentActive',status:'burn'}]});return;
        }
        if(rule==='steelWave'){
          const type=ctx.cardById(ctx.defender?.cardId)?.types?.[0];const bench=other(ctx).bench.filter(slot=>ctx.cardById(slot.cardId)?.types?.includes(type));
          for(const slot of bench)slot.damage=Number(slot.damage||0)+10;return;
        }
        if(rule==='snatch'){
          const uid=String(ctx.action?.effectSelection||''),foe=other(ctx),slot=foe.bench.find(p=>p.uid===uid&&Number(p.damage||0)===0);
          if(slot){const incoming=slot,prev=foe.active;switchPokemon(foe,slot.benchSlot,ctx.state);ctx.defender=incoming;ctx.state.log.push({type:'aquapolisEffect',rule:'snatch',switched:incoming.cardId});}
          return;
        }
        if(rule==='conduction40'){
          const a=ctx.attacker,ss=own(ctx),basics=Number(a?.energy?.Lightning||0),special=(a?.specialEnergy||[]).filter(ref=>Number((ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{}).Lightning||0)>0);
          if(a){a.energy.Lightning=0;ss.energyDiscard.Lightning=(ss.energyDiscard.Lightning||0)+basics;for(const ref of special){a.specialEnergy.splice(a.specialEnergy.indexOf(ref),1);ss.discard.push(ref);}}
          damage=40*rolls(Math.min(100,basics+special.length));return;
        }
        if(rule==='lugiaPsychic'){damage=10*(totalEnergy(ctx.defender?.energy)+(ctx.defender?.specialEnergy||[]).length);return;}
        if(rule==='peckAttack'){const heads=rolls(2);damage=heads===2?50:heads===1?20:0;if(!heads)pending.push({type:'status',target:'opponentActive',status:'confusion'});return;}
        if(rule==='energyKiss'){const amount=totalEnergy(ctx.defender?.energy)+(ctx.defender?.specialEnergy||[]).length;damage=rolls(Math.min(amount,100))*10;return;}
        if(rule==='tripleSpin'){const heads=rolls(3);damage=heads*20;if(heads>=2&&own(ctx).bench.length)pending.push({type:'switch',side:'self'});return;}
        if(rule==='damageBlast'){damage=30+10*rolls(Math.min(100,Math.floor(Number(ctx.defender?.damage||0)/10)));return;}
        if(rule==='bigEggsplosion'){const n=totalEnergy(ctx.attacker?.energy)+(ctx.attacker?.specialEnergy||[]).length;damage=20*rolls(Math.min(100,n));return;}
        if(rule==='lateralEggsplosion'){const n=own(ctx).bench.reduce((sum,slot)=>sum+totalEnergy(slot?.energy)+(slot?.specialEnergy||[]).length,0);damage=30+10*rolls(Math.min(100,n));return;}
        if(rule==='conduction'){
          const a=ctx.attacker,ss=own(ctx),basics=Number(a?.energy?.Lightning||0),special=(a?.specialEnergy||[]).filter(ref=>Number((ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{}).Lightning||0)>0);
          if(a){a.energy.Lightning=0;ss.energyDiscard=ss.energyDiscard||{};ss.energyDiscard.Lightning=Number(ss.energyDiscard.Lightning||0)+basics;
            for(const ref of special){a.specialEnergy.splice(a.specialEnergy.indexOf(ref),1);ss.discard.push(ref);}}
          damage=30+40*rolls(Math.min(100,basics+special.length));return;
        }
        if(rule==='tripleBone'){
          const bench=(other(ctx).bench||[]).find(slot=>Number(slot.benchSlot)===Number(ctx.action?.benchIndex));
          damage=bench?10*rolls(3):0;damageTarget=bench||null;damageRules.ignoreWeakness=true;damageRules.ignoreResistance=true;return;
        }
        if(rule==='specialEnergyPunch'){
          if(!rolls(1)){damage=0;return;}
          damage=10;if(ctx.defender?.specialEnergy?.length)pending.push({type:'neoRule',rule:'aquapolis:discardSpecial',selectedUid:ctx.action?.effectSpecialEnergyUid});return;
        }
        if(rule==='skedaddle'&&!own(ctx).bench.length){damage=0;return;}
        pending.push(e);return;
      }
      if(e.type==='neoRule'&&String(e.rule||'').startsWith('expedition:')){
        const r=e.rule.slice('expedition:'.length),ss=own(ctx),foe=other(ctx),a=ctx.attacker,d=ctx.defender;
        const count=slot=>totalEnergy(slot?.energy||{})+(slot?.specialEnergy||[]).length;
        const flip=()=>{const h=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Expedition '+r,heads:h,results:[h]});return h;};
        const roll=n=>{let heads=0;for(let i=0;i<Math.min(100,n);i++)if(flip())heads++;return heads;};
        switch(r){
          case 'syncroblast':damage=count(a)===count(d)?80:20;return;
          case 'energyCannon':damage=40+10*Math.min(2,Math.max(0,count(a)-3));return;
          case 'rendingJaws':damage=Number(d?.damage||0)>0?70:40;return;
          case 'ironFist':damage=50+(flip()?10*pokemonOn(ss).filter(slot=>Number(slot.damage||0)>0).length:0);return;
          case 'dogpile':damage=10*ss.bench.length;pending.push({type:'selfDamage',amount:damage});return;
          case 'spiralWave':{let heads=0;while(heads<100&&flip())heads++;damage=20*heads;return;}
          case 'waterPunch':damage=40+10*roll(Number(a?.energy?.Water||0));return;
          case 'etherealFlame':{const n=Number(a?.energy?.Fire||0);damage=30+20*n;pending.push({...e,discardFire:n});return;}
          case 'shockBolt':if(!Number(a?.energy?.Lightning||0)){damage=0;attackDoesNothing=true;pending.length=0;return;}pending.push(e);return;
          case 'mislead':damage=0;pending.push(e);return;
          case 'lightningStrike':{
            const boosted=ctx.action?.effectSelection==='discard'&&
              (Number(a?.energy?.Lightning||0)>0||(a?.specialEnergy||[]).some(ref=>
                Number((ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{}).Lightning||0)>0));
            damage=boosted?80:40;
            if(boosted)pending.push({type:'neoRule',rule:'expedition:lightningStrikeDiscard'});
            return;
          }
          case 'scorchingWhirlwind':case 'rockSlide':case 'energyCatch':case 'plasma':
          case 'energyDraw':case 'energyRecall':case 'energyPatch':case 'reflectEnergy':
          case 'bindWound':case 'soothingAroma':case 'jetStream':case 'plunge':
            pending.push(e);return;
          default:throw new Error('Unsupported Expedition attack: '+r);
        }
      }
      if(e.type==='neoRule'&&String(e.rule||'').startsWith('destiny:')){
        const r=e.rule.slice(8),ss=own(ctx),foe=other(ctx),a=ctx.attacker,d=ctx.defender;
        const attached=s=>totalEnergy(s?.energy||{})+(s?.specialEnergy||[]).length;
        const flip=()=>{const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,reason:'Neo Destiny '+r,heads,results:[heads]});return heads;};
        const roll=n=>{let h=0;for(let i=0;i<Math.min(100,n);i++)if(flip())h++;return h;};
        const miss=()=>{damage=0;attackDoesNothing=true;pending.length=0;};
        switch(r){
          case 'darkDrain':case 'tuskToss':case 'psysplash':case 'eerieHowl':case 'battleFrenzy':case 'flipperStroke':case 'reflectedSunlight':case 'sunbathe':case 'healingWater':damage=0;break;
          case 'shockBolt':if(!a?.energy?.Lightning){miss();return;}break;
          case 'crushingBlow':case 'pullIn':case 'threaten':case 'bubbleJump':case 'entangle':case 'poisonBind':case 'ballOfFlame':case 'prehistoricWater':case 'darkTentacle':case 'provoke':case 'searchlight':case 'spark':case 'flashTouch':case 'knockOver':case 'highVoltage':case 'stunWave':case 'armorUp':case 'callBack':case 'incinerate':case 'icePillar':case 'warmUp':case 'fishOut':case 'washAway':case 'hypnoshower':case 'mysteriousWing':case 'evolutionSong':case 'charm':case 'tentacleWrap':case 'miracleLeaf':case 'reflectShield':case 'thundersquall':case 'mountainCrush':case 'destructiveFire':case 'slapAwake':case 'freezingBreath':case 'sweetKiss':case 'returnHome':case 'guidingFlame':break;
          case 'darkFire':if(Number(a?.energy?.Darkness||0)>0)damage+=20;break;
          case 'rushingFlames':{const max=pokemonOn(ss).reduce((sum,slot)=>sum+Number(slot.energy?.Fire||0),0);const requested=Number(ctx.action?.effectSelection||0);const n=Math.max(0,Math.min(max,Number.isFinite(requested)?requested:0));damage=40*roll(n);pending.push({...e,discardFireCount:n});return;}
          case 'mountainSmasher':{const h=roll(Number(a?.energy?.Fighting||0));damage=20*h;if(h)pending.push({type:'discardTop',side:'opponent',amount:h});return;}
          case 'flingAway':if(foe.bench.length)damage=30;break;
          case 'gentleFlames':{const c=ctx.cardById(d?.cardId);damage=c?.stage==='Baby'?10:c?.stage==='Basic'?30:50;break;}
          case 'maxBurst':damage=20*roll(pokemonOn(foe).reduce((n,slot)=>n+attached(slot),0));return;
          case 'waterCannon':damage=Math.min(3,Number(a?.energy?.Water||0))*10;return;
          case 'rushingMagma':{const cards=ss.deck.slice(0,5);damage=20*cards.filter(ref=>ctx.cardById(ref.cardId)?.basicEnergy&&ctx.cardById(ref.cardId)?.subtype==='Fire').length;break;}
          case 'burningFlame':{const h=roll(2);if(Number(a?.energy?.Fire||0)<h){miss();return;}damage=30+h*20;if(h)pending.push({type:'discardEnergyCard',target:'self',energyType:'Fire',amount:h});return;}
          case 'coreBlast':damage+=20*(d?.specialEnergy||[]).length;return;
          case 'pulseGuard':case 'returnHome':break;
          case 'splashAbout':if(attached(d)>attached(a))damage+=20;break;
          case 'synchronize':if(attached(d)!==attached(a))miss();break;
          case 'inkBlast':damage+=Math.min(2,Math.max(0,attached(a)-1))*10;return;
          case 'waterGun':damage+=10*Math.min(2,Math.max(0,Number(a?.energy?.Water||0)-1));return;
          case 'whiteHotFlame':if(Number(a?.energy?.Fire||0)<1||Number(a?.energy?.Lightning||0)<1){miss();return;}break;
          case 'lightningCut':{const h=flip();damage=30+(h?10:0);pending.push({...e,heads:h});return;}
          case 'waterSlash':damage+=10*Math.max(0,Number(a?.energy?.Water||0)-2);damageRules.ignoreResistance=true;return;
          case 'psyburst':if(!Number(a?.energy?.Fire||0)){miss();return;}damage+=10*attached(d);break;
          case 'flashingEyes':{const h=roll(3);pending.push({...e,heads:h});return;}
          case 'crushingEarth':{const h=flip();if(!h)damage=0;pending.push({...e,heads:h});return;}
          case 'beatdown':{const c=ctx.cardById(d?.cardId);if(c&&(c.name?.includes('Dark')||c.types?.includes('Darkness'))&&flip())damage=100;break;}
          default:break;
        }
        pending.push(e);return;
      }
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
      if(rule==='vicePincers114'){
          const n=florio114ApplyCombo(ctx,other(ctx),ctx.defender,ctx.action?.effectSelection);
          damage=Math.max(0,300-20*n);return;
        }
        if(rule==='energyThrash114'){
          const chosen=ctx.action?.effectSelection||'';
          if(chosen){const n=florio114ApplyCombo(ctx,own(ctx),ctx.attacker,chosen);
            if(n===2){const energyCards=other(ctx).hand.filter(ref=>{const c=ctx.cardById(ref.cardId);return c?.basicEnergy||c?.specialEnergy;}).length;
              ctx.state.log.push({type:'revealHand',side:ctx.foeSide,cards:other(ctx).hand.map(r=>r.cardId)});
              damage+=40*energyCards;}}
          return;
        }
        if(rule==='toolDiscardBonus114'){
          const uid=String(ctx.action?.effectSelection||'');
          if(!uid)return;
          const slot=ctx.attacker,idx=(slot.extraTools||[]).findIndex(r=>r.uid===uid);
          if(slot.tool?.uid===uid){const ref=slot.tool;slot.tool=slot.extraTools?.shift()||null;own(ctx).discard.push(ref);damage+=50;}
          else if(idx>=0){own(ctx).discard.push(...slot.extraTools.splice(idx,1));damage+=50;}
          return;
        }
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
        if(rule==='chasmCrash113'){
          const attached=Object.values(ctx.effectiveEnergy?.(ctx.attacker)||ctx.attacker?.energy||{}).reduce((n,v)=>n+Number(v||0),0);
          if(attached>=8)pending.push({type:'discardHand',side:'opponent',amount:999});
          return;
        }
        if(rule==='startlingSnore113'){
          if(Object.values(ctx.defender?.conditions||{}).some(Boolean))damage+=100;
          pending.push({type:'removeStatus',target:'opponentActive'});return;
        }
        if(rule==='exactSixPrizes113'){
          if((own(ctx).prizes||[]).length===6)damage+=80;
          return;
        }
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
      if(e.type==='selectedDamage'){damage=e.amount;damageTarget=targets(e.target,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s))[0]||null;if(e.ignoreWeakness)damageRules.ignoreWeakness=true;if(e.ignoreResistance)damageRules.ignoreResistance=true;if(!damageTarget)damage=0;return;}
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
      else if(e.type==='coinDamageByEnergy'){const count=e.countAttachedEnergyType?Number(ctx.attacker?.energy?.[e.energyType]||0)+(ctx.attacker?.specialEnergy||[]).filter(ref=>{const c=ctx.cardById(ref.cardId),provides=ref.provides||c?.effect?.provides||{};return Number(provides[e.energyType]||0)>0||Number(provides.Miracle||0)>0||c?.name==='Rainbow Energy'||c?.name==='Crystal Energy'&&Number(ctx.attacker?.energy?.[e.energyType]||0)>0;}).length:e.countCards?totalEnergy(ctx.attacker?.energy)+(ctx.attacker?.specialEnergy||[]).length:e.energyType?Number(ctx.attacker?.energy?.[e.energyType]||0):totalEnergy(ctx.attacker?.energy),results=Array.from({length:Math.min(100,Math.max(0,count))},()=>coin(ctx)),heads=results.filter(Boolean).length;ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:count,results});if(e.discardHeads&&e.energyType&&heads){const available=Number(ctx.attacker?.energy?.[e.energyType]||0),spent=Math.min(available,heads);ctx.attacker.energy[e.energyType]=available-spent;recordDiscardedEnergy(own(ctx),e.energyType,spent);}amount=heads*e.amount;}
      else if(e.type==='discardCountDamage'){const list=own(ctx).discard||[];amount=list.filter(r=>matchesFilter(ctx.cardById(r.cardId),e.filter)).length*e.amount;}
      else if(e.type==='fieldCountDamage'){const ss=e.side==='opponent'?other(ctx):own(ctx);amount=pokemonOn(ss).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s)).length*e.amount;}
      else if(e.type==='energyTypeCountDamage'){amount=Object.values(ctx.attacker?.energy||{}).filter(n=>Number(n)>0).length*e.amount;}
      else if(e.type==='statusCountDamage'){amount=Object.keys(ctx.defender?.conditions||{}).length*e.amount;}
      else if(e.type==='handCountDamage'){amount=own(ctx).hand.length*e.amount;}
      else if(e.type==='remainingHpDamage'){const max=ctx.maxHp?ctx.maxHp(ctx.side,ctx.attacker):Number(ctx.cardById(ctx.attacker?.cardId)?.hp||0);amount=Math.max(0,max-Number(ctx.attacker?.damage||0));}
      else if(e.type==='selfDamagePenalty')amount=-Number(ctx.attacker?.damage||0)*Number(e.amount||1);
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
    if(effect?.type==='neoRule'&&String(effect.rule||'').startsWith('skyridge:')){
      const rule=effect.rule.slice('skyridge:'.length);
      if(rule==='dragOff')return other(ctx).bench.length?other(ctx).bench.map(slot=>({effectSelection:slot.uid,choiceLabel:'Switch in '+ctx.cardById(slot.cardId)?.name})):[{}];
      if(rule==='metalTail')return [{effectSelection:'',choiceLabel:'40 damage · no coin flip'},{effectSelection:'flip',choiceLabel:'Flip coin for 80 damage (tails: 0)'}];
      if(rule==='energyHeal')return targetChoices('selfPokemon',ctx).filter(a=>{
        const slot=targets('selfPokemon',{...ctx,action:a})[0];return slot&&(Object.values(slot.energy||{}).some(n=>Number(n)>0)||(slot.specialEnergy||[]).length>0);
      });
      if(['callFriends','callNidoran'].includes(rule))return own(ctx).bench.length<Number(own(ctx).benchLimit||3)?[{}]:[];
      if(rule==='strangeSpiral')return Object.values(ctx.attacker?.energy||{}).some(n=>Number(n)>0)?[{}]:[];
      if(rule==='goodNeighbor')return Number(own(ctx).skyridgeGoodNeighborTurn)!==Number(ctx.state.turnNumber)?[{}]:[];
      return [{}];
    }
    if(effect?.type==='neoRule'&&String(effect.rule||'').startsWith('aquapolis:')){
      const rule=effect.rule.slice(10);
      if(rule==='fireBlow'){
        const max=Math.min(30,Number(ctx.attacker?.energy?.Fire||0));
        return Array.from({length:max+1},(_,n)=>({effectSelection:String(n),choiceLabel:`Discard ${n} Fire Energy (${n} coin flips)`}));
      }
      if(rule==='superEggsplosion'){
        // Encode *which* attached Energy cards are discarded, not just a count.
        // Enumerate bounded board choices; an overflow is shown as groups of the
        // same source rather than silently discarding from a random Pokémon.
        const sources=pokemonOn(own(ctx)).flatMap(slot=>[
          ...Object.entries(slot.energy||{}).flatMap(([type,n])=>Array.from({length:Math.min(12,Number(n||0))},()=>({token:slot.uid+'~'+type,label:ctx.cardById(slot.cardId)?.name+' '+type}))),
          ...(slot.specialEnergy||[]).map(ref=>({token:slot.uid+'~special:'+ref.uid,label:ctx.cardById(slot.cardId)?.name+' '+ctx.cardById(ref.cardId)?.name}))
        ]);
        let masks=[[]];for(const entry of sources){if(masks.length>500)break;masks=masks.concat(masks.map(x=>x.concat(entry)));}
        const unique=new Map();for(const entries of masks){const ids=entries.map(x=>x.token).join(',');if(!unique.has(ids))unique.set(ids,{effectSelection:ids,choiceLabel:entries.length?`Discard ${entries.length}: `+entries.map(x=>x.label).join(', '):'Do not discard Energy'});}
        return [...unique.values()];
      }
      if(rule==='snatch')return [{effectSelection:'',choiceLabel:'Attack current Active'},...other(ctx).bench.filter(x=>Number(x.damage||0)===0).map(x=>({effectSelection:x.uid,choiceLabel:'Switch in '+ctx.cardById(x.cardId)?.name}))];
      if(rule==='burningFang')return [{effectSelection:'',choiceLabel:'Do not risk Burning Fang flip'},...(Number(ctx.attacker?.energy?.Fire||0)>0?[{effectSelection:'try',choiceLabel:'Flip to try Burn (discard Fire on heads)'}]:[])];
      if(rule==='tripleBone')return targetChoices('opponentBench',ctx);
      if(['happyHealing','energyReturn','magneticFlow','miracleShift','darkMoon','scavengerHunt','energyKick','strangeTentacles','apricornForest','powerPlant','underseaRuins','townVolunteers'].includes(rule))return [{}];
      if(rule==='specialEnergyPunch')return (ctx.defender?.specialEnergy||[]).length
        ?ctx.defender.specialEnergy.map(ref=>({effectSpecialEnergyUid:ref.uid,choiceLabel:'Discard '+ctx.cardById(ref.cardId)?.name+' if heads'})):[{}];
      if(rule==='flowerSupplement')return own(ctx).bench.length&&own(ctx).hand.some(ref=>ctx.cardById(ref.cardId)?.basicEnergy)?[{}]:[];
    }

    if(effect?.type==='neoRule'&&String(effect.rule||'').startsWith('destiny:unown')){
      const r=effect.rule.slice('destiny:unown'.length),ss=own(ctx),word={Give:'GIVE',Help:'HELP',Want:'WANT'}[r];
      if(word&&!neoUnownWordReady(ctx,word))return [];
      if(r==='Give'){const top=Array.isArray(ss.energySupply)?ss.energySupply[0]:ss.energyTypes?.[0];return neoBasicIds[top]&&pokemonOn(ss).length?[{}]:[];}
      if(r==='Want')return ss.discard.some(ref=>ctx.cardById(ref.cardId)?.kind==='trainer')?[{}]:[];
      if(r==='Help')return [{}];
    }
    if(effect?.type==='neoRule'&&effect.rule==='expedition:lightningStrike'){
      const a=ctx.attacker,hasLightning=Number(a?.energy?.Lightning||0)>0||
        (a?.specialEnergy||[]).some(ref=>Number((ref.provides||ctx.cardById(ref.cardId)?.effect?.provides||{}).Lightning||0)>0);
      return [{effectSelection:'',choiceLabel:'40 damage · keep Lightning Energy'},
        ...(hasLightning?[{effectSelection:'discard',choiceLabel:'80 damage · discard all Lightning Energy'}]:[])];
    }
    if(effect?.type==='neoRule'&&effect.rule==='destiny:rushingFlames'){const total=pokemonOn(own(ctx)).reduce((n,slot)=>n+Number(slot.energy?.Fire||0),0);return Array.from({length:Math.min(20,total)+1},(_,n)=>({effectSelection:String(n),choiceLabel:'Discard '+n+' Fire Energy for '+n+' coin flips'}));}
    assertEffect(effect);if(!effect)return [{}];if(effect.type==='attackRequirement')return conditionMatches(effect.condition,ctx)?[{}]:[];if(!conditionMatches(effect.condition,ctx))return ctx.isAttack?[{}]:[];
    if(effect.type==='chooseDiscardForBonus'){const items=effect.zone==='bench'?(own(ctx).bench||[]).filter(s=>s&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s)):(own(ctx).hand||[]).filter(r=>matchesFilter(ctx.cardById(r.cardId),effect.filter,r));const max=Math.min(Number(effect.max||items.length),items.length),out=[];for(let mask=0;mask<(1<<items.length);mask++){const picked=[];for(let i=0;i<items.length;i++)if(mask&(1<<i))picked.push(items[i].uid);if(picked.length<=max)out.push({effectSelection:picked.join(','),choiceLabel:`Discard ${picked.length}`});}return out;}
    if(effect.type==='lentalRule'&&String(effect.rule||'').startsWith('sv1:')){
      const rule=effect.rule.slice(4),foe=other(ctx),ss=own(ctx);
      if(rule==='trickCape')return [{effectSelection:'',choiceLabel:'Keep Energy'},...Object.entries(foe.active?.energy||{}).filter(([,n])=>n>0).map(([t])=>({effectSelection:t,choiceLabel:'Return '+t+' Energy'})),...(foe.active?.specialEnergy||[]).map(ref=>({effectSelection:'special|'+ref.uid,choiceLabel:'Return Special Energy'}))];
      if(rule==='eerieTentacles')return foe.bench.flatMap(slot=>Object.entries(foe.active?.energy||{}).filter(([,n])=>n>0).map(([type])=>({effectSelection:slot.uid+'|'+type,choiceLabel:'Move '+type+' to '+ctx.cardById(slot.cardId)?.name}))).concat([{}]);
      if(rule==='happyCyclone')return ss.bench.map(slot=>({effectSelection:slot.uid,choiceLabel:'Move Energy to '+ctx.cardById(slot.cardId)?.name}));
      if(['sandstormSpray'].includes(rule))return totalEnergy(ctx.attacker?.energy)>=2?[{}]:[];
      return [{}];
    }
    if(effect.type==='lentalRule'){
      const rule=effect.rule,ss=own(ctx);
      if(rule.startsWith('founja:')){
        const r=rule.slice(7),self=ctx.attacker,foe=other(ctx);
        if(r==='sonicBreak')return targetChoices('opponentPokemon',ctx);
        if(r==='waterFountain')return [{effectSelection:'',choiceLabel:'Keep Water Energy'},...(ss.bench||[]).map(slot=>({target:'bench',benchIndex:Number(slot.benchSlot),choiceLabel:'Move to '+ctx.cardById(slot.cardId)?.name}))];
        if(r==='fallingStar')return [{effectSelection:'',choiceLabel:'Keep Tool'},...(toolsOf(self).length?[{effectSelection:'tool',choiceLabel:'Discard Tool (+70)'}]:[])];
        if(r==='flightPath')return (ss.bench||[]).flatMap(slot=>
          (ctx.cardById(slot.cardId)?.attacks||[]).map((attack,i)=>({attack,i}))
            .filter(({attack})=>String(attack.cost||'').length<=2)
            .flatMap(({attack,i})=>{
              const depth=Number(ctx.choiceDepth||0);
              // Prevent an endless recursive menu if another Yanmega uses
              // Flight Path. All concrete attacks remain available.
              const nested=depth>=2&&attack.effect?.rule==='founja:flightPath'?[]:
                choicesForEffect(attack.effect,{...ctx,attack,choiceDepth:depth+1});
              return nested.map(sub=>{
                const {effectSelection:copiedEffectSelection,...rest}=sub;
                const details=sub.choiceLabel?` · ${sub.choiceLabel}`:
                  sub.target?` · ${sub.target}${sub.benchIndex!=null?' '+(sub.benchIndex+1):''}`:'';
                return {...rest,effectSelection:slot.uid+'|'+i,
                  ...(copiedEffectSelection!=null?{copiedEffectSelection}:{}),
                  choiceLabel:'Copy '+attack.name+' ('+(ctx.cardById(slot.cardId)?.name||'Bench Pokémon')+')'+details+' then switch'};
              });
            }));
        if(r==='magicSplash'){const pokemon=pokemonOn(foe);return [{effectSelection:'',choiceLabel:'Deal 20 damage'},...pokemon.flatMap(src=>Object.keys(src.energy||{}).filter(t=>src.energy[t]>0).flatMap(type=>pokemon.filter(dst=>dst!==src).map(dst=>({effectSelection:src.uid+'|'+dst.uid+'|'+type,choiceLabel:'Move '+type+' Energy'}))))];}
        if(r==='machDart')return Number(self?.movedToActiveTurn)===Number(ctx.state.turnNumber)?[{}]:[];
        if(r==='jumpSlamGX')return [{}];
        if(r==='bogTorrent')return [{choiceOption:0,choiceLabel:'Keep Energy'},...(self&&Object.values(self.energy||{}).some(v=>v>0)?[{choiceOption:1,choiceLabel:'Discard an Energy and Poison'}]:[])];
        if(r==='mudBath')return Array.from({length:Math.min(12,Number(self?.energy?.Fighting||0))+1},(_,i)=>({choiceOption:i,choiceLabel:'Return '+i+' Fighting Energy'}));
        if(r==='insatiableHunger')return Array.from({length:Math.min(12,ss.hand.filter(ref=>ctx.cardById(ref.cardId)?.trainerType==='Item').length)+1},(_,i)=>({choiceOption:i,choiceLabel:'Discard '+i+' Items'}));
      }
      if(rule==='vicePincers114')return florio114Combos(other(ctx).active?.energy||{});
      if(rule==='energyThrash114')return [
        {effectSelection:'',choiceLabel:'Keep both Energy'},
        ...florio114Combos(ctx.attacker?.energy||{},2)];
      if(rule==='toolDiscardBonus114')return [
        {effectSelection:'',choiceLabel:'Keep attached Tool'},
        ...florio114Tools(ctx.attacker).map(r=>({effectSelection:String(r.uid),choiceLabel:'Discard '+r.cardId}))];
      if(rule==='tangledFruit114')return [
        {choiceOption:0,choiceLabel:'3 damage counters on opponent'},
        {choiceOption:1,choiceLabel:'Heal 3 damage counters from Tangrowth'}];
      if(rule==='petalGlow114'&&Number(ss.florioPetalTurn)===Number(ctx.state.turnNumber)&&!ss.florioPetalUsed)return [];
      if(rule==='babyEvolution114'&&!ss.hand.some(ref=>ctx.cardById(ref.cardId)?.name==='Pikachu'))return [];
      if(rule==='dinnerTime114'&&!ss.bench.some(s=>ctx.cardById(s.cardId)?.name==='Magikarp'))return [];
      if(rule==='slumberTime114'&&Number(ctx.attacker?.damage||0)<=0)return [];
      if(rule==='florgesTransfer113')return florioBoard(ss).length>1&&florioBoard(ss).some(s=>Object.values(s.energy||{}).some(n=>Number(n)>0)||(s.specialEnergy||[]).some(r=>Object.values(r.provides||ctx.cardById(r.cardId)?.effect?.provides||{}).some(n=>Number(n)>0)))?[{}]:[];
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
      const r=effect.rule.slice('discovery:'.length),ss=own(ctx),foe=other(ctx),mine=pokemonOn(ss);
      if(r==='unownFind')return neoUnownWordReady(ctx,'FIND')&&ss.deck.some(ref=>ctx.cardById(ref.cardId)?.kind==='trainer')?[{}]:[];
      if(r==='unownUndo')return neoUnownWordReady(ctx,'UNDO')&&!!ss.active?[{}]:[];
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
    const valid=choices.filter(action=>{const list=targets(selector,{...ctx,action}).filter(s=>(!effect.excludeSelf||s!==ctx.attacker)&&(!effect.requirePlayedBeforeTurn||Number(s.playedOnSideTurn)<Number(own(ctx).turnCount))&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s));if((effect.type==='heal'||effect.type==='healSelf')&&!ctx.isAttack)return list.some(s=>Number(s.damage)>0);if(effect.type==='discardEnergy'&&!ctx.isAttack){const needed=effect.amount==='all'?1:Number(effect.amount||0);return list.some(s=>effect.energyType?Number(s.energy[effect.energyType]||0)>=needed:totalEnergy(s.energy)>=needed);}if(effect.type==='attachEnergy'&&!ctx.isAttack){const owner=own(ctx),needed=Number(effect.amount||1);if(effect.source==='hand'){const actualHand=owner.hand.filter(ref=>{const c=ctx.cardById(ref.cardId);return c?.basicEnergy&&c.subtype===effect.energyType;}).length;const zone=ctx.state.format==='classic'?(owner.energySupply||[]):[];let zoneTop=0;while(zone[zoneTop]===effect.energyType)zoneTop++;return list.length>0&&(actualHand+zoneTop)>=needed;}if(Array.isArray(owner.energySupply))return list.length>0&&owner.energySupply.filter(t=>t===effect.energyType).length>=needed;}
      if(effect.type==='attachEnergyFromDiscard'&&!ctx.isAttack)return list.length>0&&neoDiscardAvailable(ctx,own(ctx),effect.energyType)>=(effect.upTo?1:Number(effect.amount||1));if(effect.type==='switch')return (effect.side==='opponent'?other(ctx):own(ctx)).active!=null&&list.length>0;return !selector||list.length>0;});
    return valid.length||!ctx.isAttack||effect.type==='selectedDamage'?valid:[{}];
  }
  function toolCapacity(state,side,slot,cardById){if(!slot)return 1;if(Number(slot.syntheticToolCapacity)>0)return Number(slot.syntheticToolCapacity);let cap=1;if(abilitiesSuppressed(state,side,slot,cardById))return cap;const card=cardById(slot.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean),ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:state.sides[side==='player'?'opponent':'player'].active,cardById};const scan=e=>{if(!e)return;if(e.type==='sequence'){for(const x of e.effects||[])scan(x);return;}if(e.type==='toolCapacity'&&conditionMatches(e.condition,ctx))cap=Math.max(cap,Number(e.amount||1));};for(const ability of abilities)if(ability.type==='passive')scan(ability.effect);return cap;}
  function passiveModifiers(effect,source,side,state,slot,stat,out,cardById){
    if(!effect)return;
    if(effect.type==='sequence'){effect.effects.forEach(e=>passiveModifiers(e,source,side,state,slot,stat,out,cardById));return;}
    if(effect.type!=='modifier'||effect.stat!==stat||!matchesFilter(cardById(slot.cardId),effect.filter,slot))return;
    if(effect.sv1DefianceBand&&!(state.sides[side]?.prizes?.length>state.sides[side==='player'?'opponent':'player']?.prizes?.length))return;
    const opposingActive=state.sides[side==='player'?'opponent':'player'].active;if(effect.opponentFilter&&(!opposingActive||!matchesFilter(cardById(opposingActive.cardId),effect.opponentFilter,opposingActive)))return;
    if(!conditionMatches(effect.condition,{state,side,foeSide:side==='player'?'opponent':'player',attacker:source,defender:state.sides[side==='player'?'opponent':'player'].active,cardById}))return;
    const ss=state.sides[side];if(effect.duration==='whileActive'&&ss.active!==source)return;
    if(effect.scope==='both'||effect.scope==='team'||effect.scope==='active'&&ss.active===slot||effect.scope==='opponentActive'&&state.sides[side==='player'?'opponent':'player'].active===slot||(!effect.scope||effect.scope==='self')&&source===slot){let amount=effect.amount;if(effect.perEnergy){const energy=slot.energy||{};amount*=effect.energyType?Number(energy[effect.energyType]||0):totalEnergy(energy);}if(effect.perEnergyCards){const energy=slot.energy||{};amount*=Number(energy[effect.energyType]||0)+(slot.specialEnergy||[]).filter(r=>!effect.energyType||Number((r.provides||cardById(r.cardId)?.effect?.provides||{})[effect.energyType]||0)>0).length+(effect.energyType?0:totalEnergy(energy));}if(effect.perPoints)amount*=Number(state.sides[side].points||0);if(effect.nonStacking){out._nonStacking=out._nonStacking||new Set();const sourceName=cardById(source?.cardId)?.name||source?.cardId||'effect',key=`${sourceName}|${stat}|${effect.scope||'self'}|${JSON.stringify(effect.filter||{})}|${JSON.stringify(effect.condition||{})}`;if(out._nonStacking.has(key))return;out._nonStacking.add(key);}out.push(amount);}
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
    if(slot?.cardId==='SNAPFLORIO-029'&&attack?.name==='Garden Flourish'&&(state.sides[side]?.bench||[]).some(s=>cardById(s.cardId)?.types?.includes('Grass')))return 'GGG';
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
    if(Number(state.sides[targetSide]?.founjaNoHealUntil||0)>=Number(state.turnNumber))return true;
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
    if(state?.format==='classic'&&slot){
      const bench=state.sides?.[side]?.bench||[],attackerCard=cardById(attacker?.cardId);
      if(slot.cardId==='sv1-99'&&!abilitiesSuppressed(state,side,slot,cardById)&&attackerCard?.types?.includes('Fire'))return {type:'preventDamage',reason:'Well-Baked Body',effects:true};
      if(bench.includes(slot)&&(state.stadium?.cardId==='SNAPFOUNJA-083'||pokemonOn(state.sides[side]).some(p=>p.cardId==='SNAPFOUNJA-001'&&!abilitiesSuppressed(state,side,p,cardById))))return {type:'preventDamage',reason:'Founja Bench protection',effects:true};
      if(slot.founjaSubmergeUntil>=state.turnNumber&&attackerCard?.stage!=='Basic')return {type:'preventDamage',reason:'Submerge',effects:true};
      const nesting=pokemonOn(state.sides[side]).find(p=>p.cardId==='SNAPFOUNJA-069'&&!abilitiesSuppressed(state,side,p,cardById));
      if(bench.includes(slot)&&nesting){
        let x=state.rngState>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;state.rngState=x>>>0;
        const heads=(state.rngState>>>0)/4294967296<0.5;
        state.log.push({type:'coin',side,heads,reason:'Nest Defender',results:[heads]});
        if(heads)return {type:'preventDamage',reason:'Nest Defender'};
      }
    }
    if(state?.format==='classic'&&state.stadium?.cardId==='SNAPFLORIO-112'&&(state.sides?.[side]?.bench||[]).includes(slot))return {type:'preventDamage',reason:'Florio Nature Park'};
    const passiveFirst=findPassiveRule(state,side,slot,'firstDamageGuard',cardById);if(!slot?.firstDamageGuardConsumed&&(slot?.firstDamageGuard||passiveFirst))return {type:'firstDamageGuard',firstDamage:true};
    const matchesAttacker=guard=>!guard?.attackerFilter||!!attacker&&matchesFilter(cardById(attacker.cardId),guard.attackerFilter,attacker);
    if(slot.attackGuard&&(slot.attackGuard.expiresTurn==null||state.turnNumber<=slot.attackGuard.expiresTurn)&&matchesAttacker(slot.attackGuard))return slot.attackGuard;
    const passive=protectionFromSources(state,side,slot,attacker,cardById,'preventDamage');
    return matchesAttacker(passive)?passive:null;
  }
  function attackEffectsPrevented(state,side,slot,attacker,cardById){
    if(state?.format==='classic'&&slot){
      if(Number(slot.neoDestinyStatusGuardUntil||0)>=Number(state.turnNumber))return true;
      if(slot.cardId==='sv1-99'&&!abilitiesSuppressed(state,side,slot,cardById)&&cardById(attacker?.cardId)?.types?.includes('Fire'))return true;
      if((state.sides[side]?.bench||[]).includes(slot)&&(state.stadium?.cardId==='SNAPFOUNJA-083'||pokemonOn(state.sides[side]).some(p=>p.cardId==='SNAPFOUNJA-001'&&!abilitiesSuppressed(state,side,p,cardById))))return true;
      if(slot.founjaSubmergeUntil>=state.turnNumber&&cardById(attacker?.cardId)?.stage!=='Basic')return true;
      if(slot.cardId==='SNAPFOUNJA-030'&&!abilitiesSuppressed(state,side,slot,cardById))return true;
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
      const blooming=state.sides?.[defenderSide]&&pokemonOn(state.sides[defenderSide]).some(p=>p.cardId==='sv1-93'&&!abilitiesSuppressed(state,defenderSide,p,cardById));
      if(weakness&&types.includes(weakness)&&!blooming&&!(guard&&(guard.expiresTurn==null||state.turnNumber<=guard.expiresTurn))){const raw=String(defender?.weaknessValue||'×2'),m=raw.match(/[x×]\s*(\d+(?:\.\d+)?)/i);n=m?n*Number(m[1]):n*2;}
      if(resistance&&types.includes(resistance)){const raw=String(defender?.resistanceValue||'-30'),m=raw.match(/-\s*(\d+)/);const enervating=defenderSlot===state.sides[defenderSide].active&&['player','opponent'].some(w=>pokemonOn(state.sides[w]).some(p=>p.cardId==='ecard2-49'&&!abilitiesSuppressed(state,w,p,cardById)));
        n=Math.max(0,n-(enervating?10:Number(m?.[1]||30)));}
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
      if(slot.cardId==='sv1-99'&&status==='burn'){const owner=pokemonOn(state.sides.player).includes(slot)?'player':'opponent';if(!abilitiesSuppressed(state,owner,slot,cardById))return true;}
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
  return {ENERGY_CODE,effectTypes,supportsEffect,validateEffect,matchesFilter,totalEnergy,canPayCost,spendGenericEnergy,spendGenericEnergyWithValue,attackDamage,applyAttackEffect,applyEffect,resolveAttack,choicesForEffect,neoDiscoveryReduction,modifierAmount,clearConditions,clearTemporaryEffects,revertShapeshift,switchPokemon,attackIsPrevented,attackEffectsPrevented,statusIsPrevented,isLocked,isActionLocked,passiveAttackAllowed,applyPersistentEvent,findPassiveRule,healingIsBlocked,canUsePreviousEvolutionAttacks,attackSpecificBonus,consumeDamageGuard,topDeckCountAmount,coinBonusAmount,abilitiesSuppressed,evolutionRule,attackCostOverride,effectiveTypes,applyContinuousRules,attackDamageWithState,resolveDelayedEffects,toolCapacity,coinRerollSource,lentalDefenseReduction,florioReactToAttackDamage,florio114RescueKO,florio114PrismCleanup};
});
