(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LuckyDexTCGPBattleEffects = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';
  const ENERGY_CODE = Object.freeze({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'});
  const ENERGY_TYPES=Object.values(ENERGY_CODE);
  const TARGETS=['self','selfActive','selfBench','selfPokemon','opponentActive','opponentBench','opponentPokemon','opponentAll','selfAll','selfBenchAll'];
  const CONDITIONS=['selfDamaged','selfUndamaged','opponentDamaged','opponentStatus','selfStatus','opponentEx','selfEnergyAtLeast','opponentEnergyAtLeast','benchAtLeast','selfHasTool','opponentHasTool','selfExtraEnergyAtLeast','supporterPlayed','stadiumInPlay','opponentMatches','pokemonPresent','koLastOpponentTurn','sweetsRelayLastTurn','movedFromBenchThisTurn','evolvedThisTurn','selfHasEnergyType','selfMoreEnergy','opponentHpGreater','selfRemainingHpAtMost','handSizeOneOf','sameEnergyTypeAtLeast','opponentPointsExact','combinedActiveEnergyAtLeast','teamEnergyAtLeast','teamDistinctEnergyTypesAtLeast','discardContains','equalEnergyCount','handSizesEqual','ownPointsExact','opponentHpLess','fewerPokemonInPlay','opponentHandSizeOneOf','selfDistinctEnergyTypesAtLeast','ownTurnCountAtMost'];
  const FILTER_KEYS=['kind','stage','subtype','name','trainerType','isEx','damaged','evolved','hasAbility','evolvesFrom','hasEnergyType','hasAnyEnergy','nameContains'];
  const STATUSES=['poison','burn','sleep','paralysis','confusion'];
  const STATS=['attackDamage','damageReduction','retreatCost','attackCost','maxHp','energyMultiplier'];
  const effectTypes=Object.freeze(['noop','sequence','healSelf','heal','damage','bonusDamage','coinDamage','energyDamage','benchCountDamage','statusDamage','damageFromDamage','discardTop','benchDamage','selfDamage','attachEnergy','discardEnergy','draw','search','searchRandomBasic','switch','status','coinFlip','modifier','removeStatus','lock','preventDamage','selectedDamage','coinUntilTails','playFossil','rareCandy','discardSelf','moveEnergy','handShuffle','preventStatus','actionLock','discardTool','discardHand','benchFromDeck','allHeadsBonus','attackCoinGate','retaliateDamage','pointDamage','namedAttackCountDamage','coinDamageByPokemon','randomPokemonDamage','globalRandomDiscardEnergy','retreatCostDamage','toolCountDamage','discardStadium','drain','nextAttackBonus','coinAttackGate','damageRule','evolveFromDeck','coinDamageByEnergy','discardCountDamage','fieldCountDamage','energyTypeCountDamage','statusCountDamage','handCountDamage','remainingHpDamage','trimHand','shuffleRandomHandCard','halveRemainingHp','setRemainingHp','removeRandomStatus']);
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
    if(effect.side!=null)need((['handShuffle','benchCountDamage'].includes(effect.type)?['self','opponent','both']:['self','opponent']).includes(effect.side),'invalid side');
    if(effect.mode!=null)need(['add','replace'].includes(effect.mode),'invalid damage mode');
    switch(effect.type){
      case 'sequence':need(Array.isArray(effect.effects)&&effect.effects.length>0,'sequence requires effects');for(const [i,e] of (Array.isArray(effect.effects)?effect.effects:[]).entries()){need(e!=null,'sequence cannot contain null');errors.push(...validateEffect(e,`${at}.effects[${i}]`));}break;
      case 'moveEnergy':need(['self','selfBench'].includes(effect.source),'invalid Energy movement source');need(['selfActive','selfBench'].includes(effect.target),'invalid Energy movement destination');need(!(effect.source==='selfBench'&&effect.target==='selfBench'),'two selected Bench endpoints require separate selection');need(effect.amount==='all'||integer(effect.amount),'invalid moved Energy amount');break;
      case 'handShuffle':need(effect.draw==='same'||effect.draw==='opponentHandCount'||integer(effect.draw),'invalid hand redraw amount');break;
      case 'preventStatus':need(['whileInPlay','whileActive'].includes(effect.duration),'invalid status immunity duration');break;
      case 'coinUntilTails':need(!!effect.effect,'coinUntilTails requires effect');errors.push(...validateEffect(effect.effect,`${at}.effect`));break;
      case 'lock':need(['attack','retreat'].includes(effect.action),'invalid locked action');need(['nextOwnTurn','opponentTurn','whileInPlay'].includes(effect.duration),'invalid lock duration');break;
      case 'preventDamage':need(['opponentTurn','whileInPlay','whileActive'].includes(effect.duration),'invalid prevention duration');if(effect.maxDamage!=null)need(nonnegative(effect.maxDamage),'invalid prevention threshold');if(effect.attackerFilter!=null){need(effect.attackerFilter&&typeof effect.attackerFilter==='object'&&!Array.isArray(effect.attackerFilter),'invalid attacker filter');for(const key of Object.keys(effect.attackerFilter||{}))need(FILTER_KEYS.includes(key),'invalid attacker filter key');}break;
      case 'coinFlip':need(!!effect.heads,'coinFlip requires heads effect');errors.push(...validateEffect(effect.heads,`${at}.heads`),...validateEffect(effect.tails,`${at}.tails`));break;
      case 'status':need(!['selfAll','selfBenchAll','selfBench','opponentBench','selfPokemon','opponentPokemon'].includes(effect.target),'special conditions require Active Pokemon');need(STATUSES.includes(effect.status),'invalid special condition');if(effect.amount!=null)need(nonnegative(effect.amount),'invalid status damage');break;
      case 'noop':case 'removeStatus':case 'removeRandomStatus':case 'switch':case 'discardSelf':case 'rareCandy':case 'discardTool':case 'halveRemainingHp':break;
      case 'actionLock':need(['Supporter','Item','EnergyActive'].includes(effect.cardType),'invalid locked card type');need(['opponentTurn','whileActive','whileInPlay'].includes(effect.duration),'invalid action-lock duration');break;
      case 'discardHand':need(['self','opponent'].includes(effect.side),'invalid discard-hand side');need(integer(effect.amount),'invalid discarded hand count');break;
      case 'benchFromDeck':need(integer(effect.amount),'invalid bench count');need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'benchFromDeck requires filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid bench filter');break;
      case 'allHeadsBonus':need(integer(effect.coins)&&effect.coins>0,'invalid all-heads coin count');need(nonnegative(effect.amount),'invalid all-heads bonus');break;
      case 'attackCoinGate':need(['opponentTurn','whileActive'].includes(effect.duration),'invalid attack gate duration');break;
      case 'retaliateDamage':need(['opponentTurn','whileActive'].includes(effect.duration),'invalid retaliation duration');need(nonnegative(effect.amount),'invalid retaliation amount');break;
      case 'pointDamage':need(nonnegative(effect.amount),'invalid point multiplier');break;
      case 'namedAttackCountDamage':need(nonnegative(effect.amount),'invalid named-attack multiplier');need(typeof effect.attackName==='string'&&effect.attackName.length>0,'missing counted attack name');break;
      case 'coinDamageByPokemon':need(nonnegative(effect.amount),'invalid per-head damage');break;
      case 'randomPokemonDamage':need(integer(effect.hits)&&effect.hits>0,'invalid random hit count');need(nonnegative(effect.amount),'invalid random hit damage');if(effect.zone!=null)need(['all','bench'].includes(effect.zone),'invalid random target zone');break;
      case 'globalRandomDiscardEnergy':break;
      case 'retreatCostDamage':case 'toolCountDamage':need(nonnegative(effect.amount),'invalid dynamic multiplier');break;
      case 'discardStadium':case 'drain':case 'evolveFromDeck':case 'damageRule':break;
      case 'nextAttackBonus':need(nonnegative(effect.amount),'invalid next attack bonus');need(typeof effect.attackName==='string'&&effect.attackName.length>0,'missing boosted attack name');break;
      case 'coinAttackGate':need(!!effect.heads,'coin attack gate requires heads effect');errors.push(...validateEffect(effect.heads,`${at}.heads`));break;
      case 'coinDamageByEnergy':need(nonnegative(effect.amount),'invalid per-Energy head damage');break;
      case 'discardCountDamage':case 'fieldCountDamage':case 'energyTypeCountDamage':case 'statusCountDamage':case 'handCountDamage':need(nonnegative(effect.amount),'invalid dynamic multiplier');break;
      case 'remainingHpDamage':break;
      case 'trimHand':need(['self','opponent'].includes(effect.side),'invalid trim-hand side');need(integer(effect.maxSize),'invalid trim-hand size');break;
      case 'shuffleRandomHandCard':need(['self','opponent'].includes(effect.side),'invalid shuffle-hand side');break;
      case 'setRemainingHp':need(nonnegative(effect.amount),'invalid remaining HP amount');break;
      case 'playFossil':need(nonnegative(effect.hp)&&effect.hp>0,'invalid Fossil HP');need(effect.subtype==='Colorless','invalid Fossil type');need(effect.canRetreat===false,'Fossil cannot retreat');break;
      case 'modifier':need(STATS.includes(effect.stat),'invalid modifier stat');need(typeof effect.amount==='number'&&Number.isFinite(effect.amount),'invalid modifier amount');need(['turn','opponentTurn','nextOwnTurn','whileActive','whileInPlay'].includes(effect.duration),'invalid duration');if(effect.scope!=null)need(['self','team','active','both','opponentActive'].includes(effect.scope),'invalid modifier scope');break;
      case 'discardTop':need(integer(effect.amount),'invalid discarded card count');break;
      case 'damageFromDamage':need(['self','opponent'].includes(effect.source),'invalid damage source');need(nonnegative(effect.amount),'invalid damage multiplier');break;
      case 'discardEnergy':need(effect.amount==='all'||integer(effect.amount),'invalid discarded Energy amount');break;
      case 'search':need(['deck','discard'].includes(effect.source||'deck'),'invalid search source');need(effect.random===true,'only random filtered searches are supported');need(integer(effect.amount),'invalid search amount');need(effect.filter&&typeof effect.filter==='object'&&!Array.isArray(effect.filter),'search requires filter');for(const key of Object.keys(effect.filter||{}))need(FILTER_KEYS.includes(key),'invalid search filter');break;
      default:need(nonnegative(effect.amount),'invalid amount');
    }
    if(effect.type==='statusDamage')need(STATUSES.includes(effect.status),'invalid damage status');
    if(effect.type==='coinDamage')need((integer(effect.coins)&&effect.coins<=100)||effect.coins==='untilTails','invalid coin count');
    if(effect.type==='energyDamage'){need(['self','opponent'].includes(effect.source),'invalid energy source');if(effect.extraAbove!=null)need(integer(effect.extraAbove),'invalid extra Energy threshold');}
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
  function conditionMatches(c,ctx){
    if(!c)return true;
    const a=ctx.attacker,d=ctx.defender;
    switch(c.type){
      case 'stadiumInPlay':return !!ctx.state.stadium;
      case 'selfHasTool':return !!a?.tool;
      case 'opponentHasTool':return !!d?.tool;
      case 'selfUndamaged':return !!a&&Number(a.damage||0)===0;
      case 'opponentMatches':return !!d&&matchesFilter(ctx.cardById(d.cardId),c.filter,d);
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
      default:throw new Error(`Unsupported condition: ${c.type}`);
    }
  }
  function coin(ctx){if(typeof ctx.random!=='function')throw new Error('Seeded battle RNG is required.');return ctx.random(ctx.state)<0.5;}
  function selected(ctx,side){const a=ctx.action||{};const target=a.effectTarget||a.target;const idx=a.effectBenchIndex==null?a.benchIndex:a.effectBenchIndex;return /Bench$/.test(target)||target==='bench'?(side.bench||[]).find(s=>s&&Number(s.benchSlot)===Number(idx))||null:side.active;}
  function targets(selector,ctx){
    switch(selector||'self'){
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
  function matchesFilter(card,filter,slot){const match=(k,v)=>k==='subtype'?hasType(card,v):k==='damaged'?(Number(slot?.damage)>0)===v:k==='isEx'?!!(card.isEx||card.points>=2||/ ex$/.test(card.name))===v:k==='evolved'?['Stage 1','Stage 2'].includes(card.stage)===v:k==='hasAbility'?!!(card.abilities?.length||card.ability)===v:k==='hasEnergyType'?Number(slot?.energy?.[v]||0)>0:k==='hasAnyEnergy'?totalEnergy(slot?.energy)>0:k==='nameContains'?String(card.name||'').includes(v):card[k]===v;return !!card&&Object.entries(filter||{}).every(([k,v])=>Array.isArray(v)?v.some(x=>match(k,x)):match(k,v));}
  function clearConditions(slot){if(slot)slot.conditions={};}
  function clearTemporaryEffects(state,slot){if(!slot)return;clearConditions(slot);delete slot.locks;delete slot.attackGuard;delete slot.statusGuard;delete slot.attackGate;delete slot.retaliate;if(state)state.modifiers=(state.modifiers||[]).filter(m=>m.targetUid!==slot.uid||m.scope==='team'||m.scope==='active'||m.scope==='opponentActive');}
  function switchPokemon(side,benchIndex,state){const index=side.bench.findIndex(s=>s&&Number(s.benchSlot)===Number(benchIndex));if(index<0||!side.active)return false;const incoming=side.bench[index],outgoing=side.active;outgoing.benchSlot=Number(incoming.benchSlot);incoming.benchSlot=null;incoming.movedToActiveTurn=state?.turnNumber;side.bench[index]=outgoing;side.active=incoming;clearTemporaryEffects(state,outgoing);return true;}
  function protectedFromEffects(slot,ctx){return !!(ctx.isAttack&&ctx.preventedTargets&&ctx.preventedTargets.has(slot.uid));}
  function repeatHeads(ctx,callback){for(let count=0;count<1024;count++){if(!coin(ctx))return count;callback();}throw new Error('Coin sequence exceeded deterministic resolution limit.');}
  function applyEffect(effect,ctx){
    if(!effect)return;
    assertEffect(effect);
    if(!conditionMatches(effect.condition,ctx))return;
    const affected=()=>targets(effect.target,ctx).filter(s=>!protectedFromEffects(s,ctx)&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s)),log=entry=>ctx.state.log.push(Object.assign({side:ctx.side},entry));
    switch(effect.type){
      case 'noop':break;
      case 'discardTop':{const ss=effect.side==='opponent'?other(ctx):own(ctx);const discarded=ss.deck.splice(0,effect.amount);ss.discard.push(...discarded);log({type:'discardDeck',count:discarded.length});break;}
      case 'actionLock':{const ss=effect.side==='self'?own(ctx):other(ctx);ss.actionLocks=ss.actionLocks||[];ss.actionLocks.push({...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null,sourceSide:ctx.side,sourceUid:ctx.attacker?.uid});break;}
      case 'discardTool':{for(const slot of affected()){if(!slot.tool)continue;const ss=pokemonOn(own(ctx)).includes(slot)?own(ctx):other(ctx);ss.discard.push(slot.tool);delete slot.tool;}break;}
      case 'attackCoinGate':for(const slot of affected())slot.attackGate={...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'retaliateDamage':for(const slot of affected())slot.retaliate={...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'discardHand':{const ss=effect.side==='opponent'?other(ctx):own(ctx);for(let i=0;i<effect.amount&&ss.hand.length;i++){const candidates=ss.hand.map((r,index)=>({r,index})).filter(({r})=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter));if(!candidates.length)break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)];ss.discard.push(...ss.hand.splice(hit.index,1));}break;}
      case 'trimHand':{const ss=effect.side==='opponent'?other(ctx):own(ctx);while(ss.hand.length>effect.maxSize){const index=Math.floor(ctx.random(ctx.state)*ss.hand.length);ss.discard.push(...ss.hand.splice(index,1));}break;}
      case 'shuffleRandomHandCard':{const ss=effect.side==='opponent'?other(ctx):own(ctx),candidates=ss.hand.map((r,index)=>({r,index})).filter(({r})=>!effect.filter||matchesFilter(ctx.cardById(r.cardId),effect.filter));if(candidates.length){const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)],[ref]=ss.hand.splice(hit.index,1);ss.deck.push(ref);ctx.shuffle(ctx.state,ss.deck);}break;}
      case 'randomPokemonDamage':{const ss=other(ctx);for(let i=0;i<effect.hits;i++){const list=effect.zone==='bench'?ss.bench.filter(Boolean):pokemonOn(ss);if(!list.length)break;const slot=list[Math.floor(ctx.random(ctx.state)*list.length)],guard=attackIsPrevented(ctx.state,ctx.foeSide,slot,ctx.attacker,ctx.cardById),amount=guard?0:Math.max(0,effect.amount-modifierAmount(ctx.state,ctx.foeSide,slot,'damageReduction',ctx.cardById));slot.damage=Number(slot.damage||0)+amount;}break;}
      case 'globalRandomDiscardEnergy':{const slots=[...pokemonOn(own(ctx)).map(slot=>({slot,side:own(ctx)})),...pokemonOn(other(ctx)).map(slot=>({slot,side:other(ctx)}))],units=[];for(const x of slots)for(const [type,n] of Object.entries(x.slot.energy||{}))for(let i=0;i<Number(n||0);i++)units.push({...x,type});if(units.length){const hit=units[Math.floor(ctx.random(ctx.state)*units.length)];hit.slot.energy[hit.type]=Math.max(0,Number(hit.slot.energy[hit.type]||0)-1);}break;}
      case 'discardStadium':if(ctx.state.stadium){const st=ctx.state.stadium,ss=ctx.state.sides[st.ownerSide];ss.discard.push({uid:st.uid,cardId:st.cardId});ctx.state.stadium=null;}break;
      case 'drain':if(ctx.attacker)ctx.attacker.damage=Math.max(0,Number(ctx.attacker.damage||0)-Math.max(0,Number(ctx.dealtDamage||0)));break;
      case 'nextAttackBonus':if(ctx.attacker){ctx.attacker.nextAttackBonuses=ctx.attacker.nextAttackBonuses||[];ctx.attacker.nextAttackBonuses.push({attackName:effect.attackName,amount:effect.amount,turn:ctx.state.turnNumber+2});}break;
      case 'evolveFromDeck':if(ctx.attacker&&typeof ctx.evolveFromDeck==='function')ctx.evolveFromDeck(ctx.attacker);break;
      case 'benchFromDeck':{const ss=own(ctx);for(let i=0;i<effect.amount;i++){const candidates=ss.deck.map((r,index)=>({r,index})).filter(({r})=>matchesFilter(ctx.cardById(r.cardId),effect.filter));if(!candidates.length||typeof ctx.benchCard!=='function')break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)],[ref]=ss.deck.splice(hit.index,1);if(ctx.benchCard(ss,ref)==null){ss.deck.splice(hit.index,0,ref);break;}log({type:'benchFromDeck',cardId:ref.cardId});}if(ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);break;}
      case 'coinUntilTails':repeatHeads(ctx,()=>applyEffect(effect.effect,ctx));break;
      case 'sequence':for(const child of effect.effects)applyEffect(child,ctx);break;
      case 'coinFlip':{const heads=coin(ctx);log({type:'coin',heads});applyEffect(heads?effect.heads:effect.tails,ctx);break;}
      case 'healSelf':if(ctx.attacker)ctx.attacker.damage=Math.max(0,Number(ctx.attacker.damage||0)-effect.amount);break;
      case 'heal':for(const s of affected())s.damage=Math.max(0,Number(s.damage||0)-effect.amount);log({type:'heal',amount:effect.amount});break;
      case 'selfDamage':if(ctx.attacker)ctx.attacker.damage=Number(ctx.attacker.damage||0)+effect.amount;break;
      case 'damage':for(const s of affected())s.damage=Number(s.damage||0)+effect.amount;break;
      case 'halveRemainingHp':for(const s of affected()){const which=pokemonOn(own(ctx)).includes(s)?ctx.side:ctx.foeSide,max=Math.max(1,Number(ctx.maxHp?ctx.maxHp(which,s):ctx.cardById(s.cardId)?.hp||0)),remaining=Math.max(0,max-Number(s.damage||0)),next=Math.floor(remaining/2);s.damage=Math.max(Number(s.damage||0),max-next);}break;
      case 'setRemainingHp':for(const s of affected()){const which=pokemonOn(own(ctx)).includes(s)?ctx.side:ctx.foeSide,max=Math.max(1,Number(ctx.maxHp?ctx.maxHp(which,s):ctx.cardById(s.cardId)?.hp||0));s.damage=Math.max(Number(s.damage||0),max-Number(effect.amount||0));}break;
      case 'removeRandomStatus':for(const s of affected()){const keys=Object.keys(s.conditions||{});if(!keys.length)continue;const key=keys[Math.floor(ctx.random(ctx.state)*keys.length)];delete s.conditions[key];}break;
      case 'benchDamage':{const ss=effect.side==='self'?own(ctx):other(ctx);const list=effect.all?ss.bench:targets(effect.side==='self'?'selfBench':'opponentBench',ctx);for(const s of list.filter(s=>s&&matchesFilter(ctx.cardById(s.cardId),effect.filter,s))){const side=effect.side==='self'?ctx.side:ctx.foeSide;const guard=ctx.isAttack&&attackIsPrevented(ctx.state,side,s,ctx.attacker,ctx.cardById);const amount=guard?0:Math.max(0,effect.amount-(ctx.isAttack?modifierAmount(ctx.state,side,s,'damageReduction',ctx.cardById):0));s.damage=Number(s.damage||0)+amount;}break;}
      case 'attachEnergy':{const recipients=affected(),attachedBySide={player:0,opponent:0};for(const s of recipients){s.energy[effect.energyType]=Number(s.energy[effect.energyType]||0)+effect.amount;const side=pokemonOn(own(ctx)).includes(s)?ctx.side:ctx.foeSide;attachedBySide[side]+=effect.amount;}log({type:'effectEnergy',amount:effect.amount,totalAmount:recipients.length*effect.amount,attachedBySide,energyType:effect.energyType});break;}
      case 'discardEnergy':for(const s of affected()){if(effect.random){const count=effect.amount==='all'?totalEnergy(s.energy):effect.amount;for(let i=0;i<count;i++){const units=Object.entries(s.energy).flatMap(([type,n])=>Array(Math.max(0,Math.floor(n))).fill(type));if(!units.length)break;const type=units[Math.floor(ctx.random(ctx.state)*units.length)];s.energy[type]--;}}else if(effect.energyType)s.energy[effect.energyType]=effect.amount==='all'?0:Math.max(0,Number(s.energy[effect.energyType]||0)-effect.amount);else s.energy=effect.amount==='all'?{}:spendGenericEnergy(s.energy,Math.min(effect.amount,totalEnergy(s.energy)));}break;
      case 'moveEnergy':{const source=targets(effect.source,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.sourceFilter,s))[0],destination=targets(effect.target,ctx)[0];if(!source||!destination||source===destination)break;let remaining=effect.amount==='all'?Infinity:effect.amount;for(const type of Object.keys(source.energy)){if(effect.energyType&&type!==effect.energyType)continue;const amount=Math.min(remaining,Number(source.energy[type]||0));source.energy[type]-=amount;destination.energy[type]=Number(destination.energy[type]||0)+amount;remaining-=amount;}break;}
      case 'handShuffle':{const sides=effect.side==='both'?[own(ctx),other(ctx)]:[effect.side==='opponent'?other(ctx):own(ctx)];const opponentCount=other(ctx).hand.length,counts=sides.map(s=>effect.draw==='same'?s.hand.length:effect.draw==='opponentHandCount'?opponentCount:effect.draw);for(const ss of sides){ss.deck.push(...ss.hand.splice(0));ctx.shuffle(ctx.state,ss.deck);}sides.forEach((ss,index)=>{for(let i=0;i<counts[index];i++)ctx.drawCard(ss);});break;}
      case 'preventStatus':for(const s of affected())s.statusGuard={...effect};break;
      case 'draw':{const ss=effect.side==='opponent'?other(ctx):own(ctx);for(let i=0;i<effect.amount;i++)ctx.drawCard(ss);log({type:'draw',amount:effect.amount});break;}
      case 'searchRandomBasic':case 'search':{const ss=own(ctx),source=ss[effect.source||'deck'];for(let i=0;i<effect.amount&&ss.hand.length<10;i++){const candidates=source.map((r,index)=>({r,index})).filter(({r})=>matchesFilter(ctx.cardById(r.cardId),effect.type==='searchRandomBasic'?{kind:'pokemon',stage:'Basic'}:effect.filter));if(!candidates.length)break;const hit=candidates[Math.floor(ctx.random(ctx.state)*candidates.length)];const [found]=source.splice(hit.index,1);ss.hand.push(found);log({type:'search',cardId:found.cardId});}if((effect.source||'deck')==='deck'&&ctx.shuffle)ctx.shuffle(ctx.state,ss.deck);break;}
      case 'switch':{const a=ctx.action||{},side=effect.side==='opponent'?other(ctx):own(ctx);switchPokemon(side,effect.source?ctx.attacker?.benchSlot:a.effectBenchIndex==null?a.benchIndex:a.effectBenchIndex,ctx.state);log({type:'switch'});break;}
      case 'status':{const recipients=targets(effect.target||'opponentActive',ctx).filter(s=>(s===own(ctx).active||s===other(ctx).active)&&!protectedFromEffects(s,ctx)&&!statusIsPrevented(ctx.state,s,ctx.cardById)),affectedBySide={player:0,opponent:0};for(const s of recipients){s.conditions=s.conditions||{};if(['sleep','paralysis','confusion'].includes(effect.status))for(const k of ['sleep','paralysis','confusion'])delete s.conditions[k];s.conditions[effect.status]=effect.status==='poison'?{amount:effect.amount==null?10:effect.amount}:effect.status==='paralysis'?{appliedTurn:ctx.state.turnNumber}:true;affectedBySide[s===own(ctx).active?ctx.side:ctx.foeSide]++;}log({type:'status',status:effect.status,affectedCount:recipients.length,affectedBySide});break;}
      case 'playFossil':throw new Error('playFossil must resolve as a Trainer placement.');
      case 'rareCandy':throw new Error('rareCandy must resolve as a Trainer evolution.');
      case 'discardSelf':{const slot=ctx.attacker,ss=own(ctx);if(!slot)break;for(let i=slot.stack.length-1;i>=0;i--)ss.discard.push({uid:slot.uid+'-stack-'+i,cardId:slot.stack[i]});if(slot.tool)ss.discard.push(slot.tool);if(ss.active===slot)ss.active=null;else{const index=ss.bench.indexOf(slot);if(index>=0)ss.bench.splice(index,1);}log({type:'discardPokemon',cardId:slot.cardId});break;}
      case 'lock':for(const s of affected()){s.locks=s.locks||[];s.locks.push({...effect,expiresTurn:effect.duration==='whileInPlay'?null:ctx.state.turnNumber+(effect.duration==='nextOwnTurn'?2:1)});}break;
      case 'preventDamage':for(const s of affected())s.attackGuard={...effect,expiresTurn:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:null};break;
      case 'selectedDamage':throw new Error('selectedDamage must resolve as part of an attack.');
      case 'removeStatus':for(const s of affected())clearConditions(s);break;
      case 'modifier':{const list=effect.scope==='both'||effect.scope==='team'||effect.scope==='active'||effect.scope==='opponentActive'?[ctx.attacker]:affected();ctx.state.modifiers=ctx.state.modifiers||[];for(const s of list)ctx.state.modifiers.push({...effect,ownerSide:effect.scope==='opponentActive'?ctx.foeSide:(own(ctx).active===s||own(ctx).bench.includes(s)?ctx.side:ctx.foeSide),sourceSide:ctx.side,sourceUid:ctx.attacker&&ctx.attacker.uid,targetUid:effect.scope==='both'||effect.scope==='team'||effect.scope==='active'||effect.scope==='opponentActive'?null:s.uid,startsTurn:effect.duration==='nextOwnTurn'?ctx.state.turnNumber+2:null,expiresTurn:effect.duration==='turn'?ctx.state.turnNumber:effect.duration==='opponentTurn'?ctx.state.turnNumber+1:effect.duration==='nextOwnTurn'?ctx.state.turnNumber+2:null});break;}
      case 'damageFromDamage':case 'bonusDamage':case 'coinDamage':case 'energyDamage':case 'benchCountDamage':case 'statusDamage':throw new Error(`${effect.type} must resolve as part of an attack.`);
    }
  }
  function resolveAttack(attack,ctx){
    ctx={...ctx,attack};let damage=Math.max(0,Number(attack.damage)||0),damageTarget=undefined,damageRules={};const pending=[];
    function visit(e){
      if(!e)return;assertEffect(e);if(!conditionMatches(e.condition,ctx))return;
      if(e.type==='sequence'){for(const child of e.effects)visit(child);return;}
      if(e.type==='coinFlip'){const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,heads});visit(heads?e.heads:e.tails);return;}
      if(e.type==='coinAttackGate'){const heads=coin(ctx);ctx.state.log.push({type:'coin',side:ctx.side,heads});if(heads)pending.push(e.heads);else damage=0;return;}
      if(e.type==='damageRule'){damageRules={...damageRules,...e};return;}
      let amount;
      if(e.type==='selectedDamage'){damage=e.amount;damageTarget=targets(e.target,ctx).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s))[0]||null;if(!damageTarget)damage=0;return;}
      if(e.type==='bonusDamage')amount=e.amount;
      else if(e.type==='coinDamage'){let heads=0;if(e.coins==='untilTails')heads=repeatHeads(ctx,()=>{});else for(let i=0;i<e.coins;i++)if(coin(ctx))heads++;ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins});amount=heads*e.amount;}
      else if(e.type==='energyDamage'){const list=e.all?pokemonOn(e.source==='opponent'?other(ctx):own(ctx)):[e.source==='opponent'?ctx.defender:ctx.attacker].filter(Boolean);amount=Math.max(0,list.reduce((n,s)=>n+(e.energyType?Number(s.energy?.[e.energyType]||0):totalEnergy(s.energy)),0)-Number(e.extraAbove||0))*e.amount;}
      else if(e.type==='benchCountDamage'){const list=e.side==='both'?[...own(ctx).bench,...other(ctx).bench]:(e.side==='opponent'?other(ctx):own(ctx)).bench;amount=list.filter(s=>s&&(!e.pokemonType||hasType(ctx.cardById(s.cardId),e.pokemonType))&&matchesFilter(ctx.cardById(s.cardId),e.filter,s)).length*e.amount;}
      else if(e.type==='damageFromDamage')amount=Number((e.source==='self'?ctx.attacker:ctx.defender)?.damage||0)*e.amount;
      else if(e.type==='statusDamage')amount=ctx.defender?.conditions?.[e.status]?e.amount:0;
      else if(e.type==='allHeadsBonus'){let heads=0;for(let i=0;i<e.coins;i++)if(coin(ctx))heads++;ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:e.coins});amount=heads===e.coins?e.amount:0;}
      else if(e.type==='pointDamage')amount=Number((e.side==='opponent'?other(ctx):own(ctx)).points||0)*e.amount;
      else if(e.type==='namedAttackCountDamage'){const cards=[...pokemonOn(own(ctx)).map(s=>ctx.cardById(s.cardId)),...(own(ctx).hand||[]).map(r=>ctx.cardById(r.cardId))];amount=cards.filter(c=>(c?.attacks||[]).some(a=>a.name===e.attackName)).length*e.amount;}
      else if(e.type==='coinDamageByPokemon'){const count=pokemonOn(own(ctx)).length;let heads=0;for(let i=0;i<count;i++)if(coin(ctx))heads++;ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:count});amount=heads*e.amount;}
      else if(e.type==='retreatCostDamage')amount=(ctx.retreatCost?ctx.retreatCost(ctx.foeSide):Number(ctx.cardById(ctx.defender?.cardId)?.retreat||0))*e.amount;
      else if(e.type==='toolCountDamage')amount=pokemonOn(own(ctx)).filter(s=>s.tool).length*e.amount;
      else if(e.type==='coinDamageByEnergy'){const count=e.energyType?Number(ctx.attacker?.energy?.[e.energyType]||0):totalEnergy(ctx.attacker?.energy),heads=Array.from({length:count},()=>coin(ctx)).filter(Boolean).length;ctx.state.log.push({type:'coin',side:ctx.side,heads,coins:count});amount=heads*e.amount;}
      else if(e.type==='discardCountDamage'){const list=own(ctx).discard||[];amount=list.filter(r=>matchesFilter(ctx.cardById(r.cardId),e.filter)).length*e.amount;}
      else if(e.type==='fieldCountDamage'){const ss=e.side==='opponent'?other(ctx):own(ctx);amount=pokemonOn(ss).filter(s=>matchesFilter(ctx.cardById(s.cardId),e.filter,s)).length*e.amount;}
      else if(e.type==='energyTypeCountDamage'){amount=Object.values(ctx.attacker?.energy||{}).filter(n=>Number(n)>0).length*e.amount;}
      else if(e.type==='statusCountDamage'){amount=Object.keys(ctx.defender?.conditions||{}).length*e.amount;}
      else if(e.type==='handCountDamage'){amount=own(ctx).hand.length*e.amount;}
      else if(e.type==='remainingHpDamage'){const max=ctx.maxHp?ctx.maxHp(ctx.side,ctx.attacker):Number(ctx.cardById(ctx.attacker?.cardId)?.hp||0);amount=Math.max(0,max-Number(ctx.attacker?.damage||0));}
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
    if(effect.type==='coinUntilTails')return choicesForEffect(effect.effect,ctx);
    if(effect.type==='moveEnergy'){const selector=effect.source==='selfBench'?'selfBench':effect.target;const choices=targetChoices(selector,ctx).filter(action=>targets(effect.source,{...ctx,action}).some(s=>matchesFilter(ctx.cardById(s.cardId),effect.sourceFilter,s)&&(effect.energyType?Number(s.energy[effect.energyType]||0):totalEnergy(s.energy))>0));return choices.length?choices:ctx.isAttack?[{}]:[];}
    if(effect.type==='switch'&&effect.source)return ctx.attacker&&own(ctx).bench.includes(ctx.attacker)?[{}]:[];
    if(effect.type==='sequence'||effect.type==='coinFlip'){
      const children=effect.type==='sequence'?effect.effects:[effect.heads,effect.tails].filter(Boolean);let result=[{}];
      for(const e of children){const choices=choicesForEffect(e,ctx);result=result.flatMap(a=>choices.filter(b=>!a.target||!b.target||(a.target===b.target&&a.benchIndex===b.benchIndex)).map(b=>({...a,...b})));}return result;
    }
    const selector=effect.type==='switch'?(effect.side==='opponent'?'opponentBench':'selfBench'):effect.type==='benchDamage'&&!effect.all?(effect.side==='self'?'selfBench':'opponentBench'):effect.target;
    const choices=targetChoices(selector,ctx);if(!choices.length&&ctx.isAttack&&effect.type!=='selectedDamage')return [{}];
    const valid=choices.filter(action=>{const list=targets(selector,{...ctx,action}).filter(s=>matchesFilter(ctx.cardById(s.cardId),effect.filter,s));if((effect.type==='heal'||effect.type==='healSelf')&&!ctx.isAttack)return list.some(s=>Number(s.damage)>0);if(effect.type==='discardEnergy'&&!ctx.isAttack)return list.some(s=>effect.energyType?Number(s.energy[effect.energyType])>0:totalEnergy(s.energy)>0);if(effect.type==='switch')return (effect.side==='opponent'?other(ctx):own(ctx)).active!=null&&list.length>0;return !selector||list.length>0;});
    return valid.length||!ctx.isAttack||effect.type==='selectedDamage'?valid:[{}];
  }
  function passiveModifiers(effect,source,side,state,slot,stat,out,cardById){
    if(!effect)return;
    if(effect.type==='sequence'){effect.effects.forEach(e=>passiveModifiers(e,source,side,state,slot,stat,out,cardById));return;}
    if(effect.type!=='modifier'||effect.stat!==stat||!matchesFilter(cardById(slot.cardId),effect.filter,slot))return;
    const opposingActive=state.sides[side==='player'?'opponent':'player'].active;if(effect.opponentFilter&&(!opposingActive||!matchesFilter(cardById(opposingActive.cardId),effect.opponentFilter,opposingActive)))return;
    if(!conditionMatches(effect.condition,{state,side,foeSide:side==='player'?'opponent':'player',attacker:source,defender:state.sides[side==='player'?'opponent':'player'].active,cardById}))return;
    const ss=state.sides[side];if(effect.duration==='whileActive'&&ss.active!==source)return;
    if(effect.scope==='both'||effect.scope==='team'||effect.scope==='active'&&ss.active===slot||effect.scope==='opponentActive'&&state.sides[side==='player'?'opponent':'player'].active===slot||(!effect.scope||effect.scope==='self')&&source===slot){let amount=effect.amount;if(effect.perEnergy){const energy=slot.energy||{};amount*=effect.energyType?Number(energy[effect.energyType]||0):totalEnergy(energy);}out.push(amount);}
  }
  function modifierAmount(state,side,slot,stat,cardById){
    if(!slot)return 0;const values=[];
    for(const source of pokemonOn(state.sides[side])){
      const card=cardById(source.cardId);for(const a of (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean))if(a.type==='passive'&&(!a.activeOnly||state.sides[side].active===source)&&(!a.benchOnly||state.sides[side].active!==source))passiveModifiers(a.effect,source,side,state,slot,stat,values,cardById);
      if(source.tool)passiveModifiers(cardById(source.tool.cardId)?.effect,source,side,state,slot,stat,values,cardById);
    }
    const foeSide=side==='player'?'opponent':'player';for(const source of pokemonOn(state.sides[foeSide])){const card=cardById(source.cardId);for(const a of (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean))if(a.type==='passive'&&a.effect?.scope==='opponentActive'&&(!a.activeOnly||state.sides[foeSide].active===source)&&(!a.benchOnly||state.sides[foeSide].active!==source))passiveModifiers(a.effect,source,foeSide,state,slot,stat,values,cardById);}
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
    const ctx={state,side,foeSide:side==='player'?'opponent':'player',attacker:slot,defender:attacker,cardById};
    const card=cardById(slot.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);
    for(const ability of abilities){if(ability.type!=='passive'||ability.activeOnly&&state.sides[side].active!==slot||ability.benchOnly&&state.sides[side].active===slot)continue;const found=passiveProtection(ability.effect,type,ctx,slot);if(found)return found;}
    if(slot.tool)return passiveProtection(cardById(slot.tool.cardId)?.effect,type,ctx,slot);
    return null;
  }
  function attackIsPrevented(state,side,slot,attacker,cardById){
    const matchesAttacker=guard=>!guard?.attackerFilter||!!attacker&&matchesFilter(cardById(attacker.cardId),guard.attackerFilter,attacker);
    if(slot.attackGuard&&(slot.attackGuard.expiresTurn==null||state.turnNumber<=slot.attackGuard.expiresTurn)&&matchesAttacker(slot.attackGuard))return slot.attackGuard;
    const passive=protectionFromSources(state,side,slot,attacker,cardById,'preventDamage');
    return matchesAttacker(passive)?passive:null;
  }
  function statusIsPrevented(state,slot,cardById){
    if(slot.statusGuard)return true;
    const side=pokemonOn(state.sides.player).includes(slot)?'player':'opponent';
    return !!protectionFromSources(state,side,slot,state.sides[side==='player'?'opponent':'player'].active,cardById,'preventStatus');
  }
  function passiveActionLock(effect,source,sourceSide,state,targetSide,cardType,cardById){if(!effect)return false;if(effect.type==='sequence')return effect.effects.some(e=>passiveActionLock(e,source,sourceSide,state,targetSide,cardType,cardById));if(effect.type!=='actionLock'||effect.cardType!==cardType)return false;if(effect.side==='opponent'&&targetSide===sourceSide||effect.side==='self'&&targetSide!==sourceSide)return false;if(effect.duration==='whileActive'&&state.sides[sourceSide].active!==source)return false;return true;}
  function isActionLocked(state,side,cardType,cardById){const ss=state.sides[side];if((ss.actionLocks||[]).some(l=>l.cardType===cardType&&(l.expiresTurn==null||state.turnNumber<=l.expiresTurn)))return true;for(const sourceSide of ['player','opponent'])for(const source of pokemonOn(state.sides[sourceSide])){const card=cardById(source.cardId),abilities=(card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);for(const a of abilities)if(a.type==='passive'&&passiveActionLock(a.effect,source,sourceSide,state,side,cardType,cardById))return true;}return false;}
  function isLocked(state,slot,action,attackName){return (slot?.locks||[]).some(l=>l.action===action&&(l.expiresTurn==null||state.turnNumber<=l.expiresTurn)&&(!l.attackName||l.attackName===attackName));}
  function applyAttackEffect(effect,context){return applyEffect(effect,context);}
  return {ENERGY_CODE,effectTypes,supportsEffect,validateEffect,totalEnergy,canPayCost,spendGenericEnergy,spendGenericEnergyWithValue,attackDamage,applyAttackEffect,applyEffect,resolveAttack,choicesForEffect,modifierAmount,clearConditions,clearTemporaryEffects,switchPokemon,attackIsPrevented,statusIsPrevented,isLocked,isActionLocked};
});
