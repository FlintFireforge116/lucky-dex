(function(root, factory){
  let data = root && root.LuckyDexTCGPBattleData;
  let effects = root && root.LuckyDexTCGPBattleEffects;
  let decks = root && root.LuckyDexTCGPBattleDecks;
  if (typeof module === 'object' && module.exports){
    data = require('./tcgp-battle-data.js');
    effects = require('./tcgp-battle-effects.js');
    decks = require('./tcgp-battle-decks.js');
    module.exports = factory(data,effects,decks);
  } else if (root){
    root.LuckyDexTCGPBattleCore = factory(data,effects,decks);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(data,effects,decks){
  'use strict';

  function seedValue(seed){
    let n = Number(seed);
    if (!Number.isFinite(n)) n = Date.now();
    n = (n >>> 0) || 0x6d2b79f5;
    return n;
  }

  function random(state){
    let x = state.rngState >>> 0;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    state.rngState = x >>> 0;
    return (state.rngState >>> 0) / 4294967296;
  }

  function shuffle(state, list){
    for (let i=list.length-1;i>0;i--){
      const j = Math.floor(random(state) * (i+1));
      [list[i],list[j]] = [list[j],list[i]];
    }
    return list;
  }

  let slotSequence=0;
  function makePokemonSlot(cardId, playedOnSideTurn, uid){
    const card = data.cardById(cardId);
    if (!card || card.kind !== 'pokemon'&&card.effect?.type!=='playFossil') throw new Error(`Not a Pokémon battle card: ${cardId}`);
    return {
      uid:uid || `slot-${cardId}-${++slotSequence}`,
      cardId:card.id,
      stack:[card.id],
      damage:0,
      energy:{},
      playedOnSideTurn:Math.max(0,Number(playedOnSideTurn || 0)),
      benchSlot:null, conditions:{}, tool:null
    };
  }


  function normalizeBenchSlots(sideState){
    const used=new Set();
    (sideState?.bench||[]).forEach((slot,index)=>{
      if(!slot)return;
      let physical=Number(slot.benchSlot);
      if(!Number.isInteger(physical)||physical<0||physical>2||used.has(physical)){
        physical=[0,1,2].find(i=>!used.has(i));
      }
      slot.benchSlot=physical;
      used.add(physical);
    });
    return sideState?.bench||[];
  }

  function benchArrayIndex(sideState,benchIndex){
    normalizeBenchSlots(sideState);
    const physical=Number(benchIndex);
    return (sideState?.bench||[]).findIndex(slot=>slot&&Number(slot.benchSlot)===physical);
  }

  function benchSlotAt(sideState,benchIndex){
    const index=benchArrayIndex(sideState,benchIndex);
    return index>=0?sideState.bench[index]:null;
  }

  function emptyBenchSlots(sideState){
    normalizeBenchSlots(sideState);
    const used=new Set((sideState?.bench||[]).filter(Boolean).map(slot=>Number(slot.benchSlot)));
    return [0,1,2].filter(i=>!used.has(i));
  }

  function placeOnBench(sideState,slot,benchIndex){
    const physical=Number(benchIndex);
    if(!Number.isInteger(physical)||physical<0||physical>2)throw new Error('Invalid Bench slot.');
    if(benchSlotAt(sideState,physical))throw new Error(`Bench ${physical+1} is already occupied.`);
    slot.benchSlot=physical;
    sideState.bench.push(slot);
    normalizeBenchSlots(sideState);
    return slot;
  }

  function makeDeck(side, ids){
    return ids.map((cardId,index)=>({uid:`${side}-card-${index+1}`,cardId}));
  }

  function isBasic(ref){
    const card = data.cardById(ref && ref.cardId);
    return !!(card && card.kind === 'pokemon' && card.stage === 'Basic');
  }

  function ensureOpeningBasic(state, sideState){
    if (sideState.hand.some(isBasic)) return;
    const idx = sideState.deck.findIndex(isBasic);
    if (idx < 0) throw new Error('Pocket deck must contain at least one Basic Pokémon.');
    const replacement = sideState.deck[idx];
    sideState.deck[idx] = sideState.hand[0];
    sideState.hand[0] = replacement;
  }

  function drawCard(sideState){
    if (!sideState.deck.length || sideState.hand.length >= 10) return null;
    const card = sideState.deck.shift();
    sideState.hand.push(card);
    return card;
  }

  function prepareOpeningHand(state, side){
    const s = state.sides[side];
    for (let i=0;i<5;i++) drawCard(s);
    ensureOpeningBasic(state,s);
  }

  function autoSetup(state, side){
    const s = state.sides[side];
    prepareOpeningHand(state,side);
    const activeIndex = s.hand.findIndex(isBasic);
    const [activeRef] = s.hand.splice(activeIndex,1);
    s.active = makePokemonSlot(activeRef.cardId,0,activeRef.uid);
    for (let i=s.hand.length-1;i>=0 && s.bench.length<3;i--){
      if (!isBasic(s.hand[i])) continue;
      const [ref] = s.hand.splice(i,1);
      const slot=makePokemonSlot(ref.cardId,0,ref.uid);
      placeOnBench(s,slot,emptyBenchSlots(s)[0]);
    }
  }

  function createSide(side, ids, energyType, energyTypes){
    const types=energyTypes==null?(energyType?[energyType]:decks.analyzeDeck(ids).recommendedEnergyTypes):energyTypes;
    if(!Array.isArray(types)||types.length<1||types.length>3||new Set(types).size!==types.length||types.some(t=>!Object.values(effects.ENERGY_CODE).includes(t)))throw new Error('Energy Zone requires one to three distinct valid Energy types.');
    return {
      id:side,
      deck:makeDeck(side,ids), hand:[], discard:[], active:null, bench:[], points:0,
      energyTypes:types.slice(), energyType:types[0], nextEnergyType:types[0], energyAvailable:false, energyUsed:false, retreated:false,
      turnCount:0
    };
  }

  function createBattle(options){
    const opts = options || {};
    const playerDeck = Array.isArray(opts.playerDeck) ? opts.playerDeck.slice() : [];
    const opponentDeck = Array.isArray(opts.opponentDeck) ? opts.opponentDeck.slice() : [];
    if (playerDeck.length !== 20 || opponentDeck.length !== 20) throw new Error('Pocket battles require 20-card decks.');
    if([playerDeck,opponentDeck].some(deck=>!deck.some(id=>{const c=data.cardById(id);return c?.kind==='pokemon'&&c.stage==='Basic';})))throw new Error('Each deck requires at least one Basic Pokémon.');
    const firstSide = opts.firstSide === 'opponent' ? 'opponent' : 'player';
    const manualPlayerSetup = !!opts.manualPlayerSetup;
    const state = {
      schema:1,
      rngState:seedValue(opts.seed),
      phase:manualPlayerSetup?'setup':'battle', winner:null, reason:null,
      setupSide:manualPlayerSetup?'player':null,
      firstSide,
      activeSide:firstSide,
      turnNumber:1,
      log:[],
      sides:{
        player:createSide('player',playerDeck,opts.playerEnergyType,opts.playerEnergyTypes),
        opponent:createSide('opponent',opponentDeck,opts.opponentEnergyType,opts.opponentEnergyTypes)
      }
    };
    shuffle(state,state.sides.player.deck);
    shuffle(state,state.sides.opponent.deck);
    if (manualPlayerSetup) prepareOpeningHand(state,'player');
    else autoSetup(state,'player');
    autoSetup(state,'opponent');
    if (!manualPlayerSetup) beginTurn(state,firstSide);
    return state;
  }

  function beginTurn(state, side){
    const s = state.sides[side];
    s.turnCount += 1;
    s.energyUsed = false;
    s.retreated = false;
    s.supporterUsed = false;
    s.stadiumUsed = false;
    s.abilityUsed = s.abilityUsed || {};
    s.energyAvailable = !(state.turnNumber === 1 && side === state.firstSide);
    if(s.energyAvailable){s.energyType=s.nextEnergyType||s.energyTypes[0];s.nextEnergyType=s.energyTypes.length>1?s.energyTypes[Math.floor(random(state)*s.energyTypes.length)]:s.energyTypes[0];}
    drawCard(s);
    state.log.push({type:'turn',side,turnNumber:state.turnNumber});
  }

  function slotForTarget(s,target,benchIndex){
    if (target === 'active') return s.active;
    if (target === 'bench') return benchSlotAt(s,benchIndex);
    return null;
  }

  function evolutionActions(s){
    if (s.turnCount <= 1) return [];
    const actions = [];
    s.hand.forEach((ref,handIndex)=>{
      const evo = data.cardById(ref.cardId);
      if (!evo || evo.kind !== 'pokemon' || evo.stage === 'Basic' || !evo.battleEnabled) return;
      if (s.active && data.cardById(s.active.cardId).name === evo.evolvesFrom && s.active.playedOnSideTurn < s.turnCount){
        actions.push({type:'evolve',handIndex,cardId:evo.id,target:'active'});
      }
      normalizeBenchSlots(s);
      s.bench.forEach((slot,index)=>{
        if (!slot) return;
        const benchIndex=Number(slot.benchSlot ?? index);
        if (data.cardById(slot.cardId).name === evo.evolvesFrom && slot.playedOnSideTurn < s.turnCount){
          actions.push({type:'evolve',handIndex,cardId:evo.id,target:'bench',benchIndex});
        }
      });
    });
    return actions;
  }

  function setupActions(state, side){
    if (!state || state.phase !== 'setup' || state.setupSide !== side) return [];
    const s = state.sides[side];
    const actions = [];
    if (!s.active){
      s.hand.forEach((ref,handIndex)=>{
        if (isBasic(ref)) actions.push({type:'setupActive',handIndex,cardId:ref.cardId,target:'active'});
      });
      return actions;
    }
    if (s.bench.length < 3){
      const empty=emptyBenchSlots(s);
      s.hand.forEach((ref,handIndex)=>{
        if (!isBasic(ref)) return;
        empty.forEach(benchIndex=>actions.push({type:'setupBench',handIndex,cardId:ref.cardId,target:'bench',benchIndex}));
      });
    }
    actions.push({type:'setupReady'});
    return actions;
  }

  function effectContext(state,side,action,attacker){
    const foeSide=side==='player'?'opponent':'player';
    return {state,side,foeSide,attacker:attacker||state.sides[side].active,defender:state.sides[foeSide].active,action:action||{},cardById:data.cardById,random,shuffle,drawCard};
  }

  function maxHp(state,side,slot){return Math.max(1,Number(data.cardById(slot.cardId).hp||0)+effects.modifierAmount(state,side,slot,'maxHp',data.cardById));}
  function triggerAbilities(state,event,side,onlySource){
    const ss=state.sides[side];
    for(const source of [ss.active,...ss.bench].filter(Boolean)){if(onlySource&&source!==onlySource)continue;
      for(const ability of abilitiesFor(data.cardById(source.cardId))){if(ability.type!=='triggered'||ability.event!==event||ability.activeOnly&&ss.active!==source||ability.benchOnly&&ss.active===source)continue;
        effects.applyEffect(ability.effect,effectContext(state,side,{},source));state.log.push({type:'ability',side,cardId:source.cardId,ability:ability.name,event});
      }
    }
  }

  function retreatCost(state,side){const slot=state.sides[side].active;return Math.max(0,Number(data.cardById(slot.cardId).retreat||0)+effects.modifierAmount(state,side,slot,'retreatCost',data.cardById));}
  function attackCost(state,side,attack){const slot=state.sides[side].active;const amount=effects.modifierAmount(state,side,slot,'attackCost',data.cardById);let cost=attack.cost||'';if(amount>=0)return cost+'C'.repeat(Math.floor(amount));let remove=-Math.floor(amount);for(let i=cost.length-1;i>=0&&remove;i--)if(cost[i]==='C'){cost=cost.slice(0,i)+cost.slice(i+1);remove--;}return cost;}
  function abilitiesFor(card){return (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);}
  function trainerType(card){return card.trainerType||card.subtype||'Item';}
  function effectChoices(effect,ctx){return effects.supportsEffect(effect)?effects.choicesForEffect(effect,ctx):[];}

  function energyCostLabel(cost){const names={...effects.ENERGY_CODE,C:'Colourless'},counts={};for(const c of cost||'')counts[c]=(counts[c]||0)+1;return Object.entries(counts).map(([c,n])=>`${n} ${names[c]||c}`).join(' + ')||'No Energy';}
  function attackAvailability(state,side,attackIndex){
    const s=state.sides[side],slot=s?.active,attack=data.cardById(slot?.cardId)?.attacks?.[attackIndex];
    if(!attack)return {usable:false,cost:'',reason:'No attack in this position.',actions:[]};
    const cost=attackCost(state,side,attack),actions=legalActions(state,side).filter(a=>a.type==='attack'&&a.attackIndex===attackIndex);
    const attached=Object.entries(slot.energy||{}).filter(([,n])=>n>0).map(([t,n])=>`${n} ${t}`).join(' + ')||'none';
    let reason=actions.length?'Ready':!effects.canPayCost(slot.energy,cost)?`Needs ${energyCostLabel(cost)}. Attached: ${attached}.`:effects.isLocked(state,slot,'attack',attack.name)?'This attack is restricted this turn.':state.phase!=='battle'||state.activeSide!==side?'Not your attack turn.':slot.conditions?.sleep?'Asleep.':slot.conditions?.paralysis?'Paralyzed.':'No legal attack target.';
    return {usable:actions.length>0,cost,reason,actions};
  }
  function legalActions(state, side){
    if (!state) return [];
    if (state.phase === 'setup') return setupActions(state,side);
    if (state.phase === 'promote') {
      if (state.promotionSide !== side) return [];
      normalizeBenchSlots(state.sides[side]);
      return state.sides[side].bench.filter(Boolean).map(slot=>({type:'promote',benchIndex:Number(slot.benchSlot)}));
    }
    if (state.phase !== 'battle' || state.activeSide !== side) return [];
    const s = state.sides[side];
    normalizeBenchSlots(s);
    const actions = [];
    if (s.bench.length < 3){
      const empty=emptyBenchSlots(s);
      s.hand.forEach((ref,handIndex)=>{
        const card = data.cardById(ref.cardId);
        if (card && card.kind === 'pokemon' && card.stage === 'Basic' && card.battleEnabled){
          empty.forEach(benchIndex=>actions.push({type:'bench',handIndex,cardId:card.id,benchIndex}));
        }
      });
    }
    actions.push(...evolutionActions(s));
    s.hand.forEach((ref,handIndex)=>{
      const card = data.cardById(ref.cardId);
      if(!card||card.kind!=='trainer'||!card.battleEnabled)return;
      const type=trainerType(card),base={type:'trainer',handIndex,cardId:card.id};
      if(card.effect?.type==='playFossil'){for(const benchIndex of emptyBenchSlots(s))actions.push({...base,target:'bench',benchIndex});return;}
      if(type==='Supporter'&&s.supporterUsed)return;
      if(type==='Tool'){
        if(!effects.supportsEffect(card.effect)||!effects.supportsEffect(card.onAttach))return;
        if(s.active&&!s.active.tool)actions.push({...base,target:'active'});
        for(const slot of s.bench)if(!slot.tool)actions.push({...base,target:'bench',benchIndex:Number(slot.benchSlot)});
      }else if(type==='Stadium'){
        if(!s.stadiumUsed&&effects.supportsEffect(card.effect)&&(!state.stadium||data.cardById(state.stadium.cardId).name!==card.name))actions.push(base);
      }else for(const target of effectChoices(card.effect,effectContext(state,side)))actions.push({...base,...target});
    });
    if (s.energyAvailable && !s.energyUsed){
      if (s.active) actions.push({type:'attach',target:'active'});
      s.bench.forEach(slot=>{if(slot)actions.push({type:'attach',target:'bench',benchIndex:Number(slot.benchSlot)});});
    }
    const conditions=s.active?.conditions||{};
    if (!s.retreated && s.active && s.bench.length&&!conditions.sleep&&!conditions.paralysis&&!effects.isLocked(state,s.active,'retreat')&&data.cardById(s.active.cardId).effect?.type!=='playFossil'){
      if (effects.totalEnergy(s.active.energy) >= retreatCost(state,side)){
        s.bench.forEach(slot=>{if(slot)actions.push({type:'retreat',benchIndex:Number(slot.benchSlot)});});
      }
    }
    for(const source of [s.active,...s.bench].filter(Boolean)){
      const sourceCard=data.cardById(source.cardId);
      abilitiesFor(sourceCard).forEach((ability,abilityIndex)=>{
        if(ability.type==='passive'||ability.type==='triggered'||ability.activeOnly&&source!==s.active||ability.benchOnly&&source===s.active)return;
        const used=(s.abilityUsed||{})[source.uid+':'+abilityIndex];if(ability.oncePerTurn!==false&&used===s.turnCount)return;
        const base={type:'ability',cardId:source.cardId,abilityIndex,target:source===s.active?'active':'bench'};if(source!==s.active)base.benchIndex=Number(source.benchSlot);
        for(const target of effectChoices(ability.effect,effectContext(state,side,{},source))){const a={...base};if(target.target)a.effectTarget=target.target;if(target.benchIndex!=null)a.effectBenchIndex=target.benchIndex;actions.push(a);}
      });
    }
    if (s.active&&!conditions.sleep&&!conditions.paralysis){
      const card = data.cardById(s.active.cardId);
      (card.attacks || []).forEach((attack,attackIndex)=>{
        if (!effects.isLocked(state,s.active,'attack',attack.name)&&effects.canPayCost(s.active.energy,attackCost(state,side,attack)))for(const target of effectChoices(attack.effect,{...effectContext(state,side),isAttack:true}))actions.push({type:'attack',attackIndex,cardId:card.id,...target});
      });
    }
    actions.push({type:'endTurn'});
    return actions;
  }

  function actionMatches(legal, action){
    if (!legal || !action || legal.type !== action.type) return false;
    const keys = ['handIndex','cardId','target','benchIndex','attackIndex','abilityIndex','effectTarget','effectBenchIndex'];
    return keys.every(key => action[key] == null || legal[key] === action[key]);
  }

  function finish(state,winner,reason){
    state.phase = 'finished'; state.winner = winner; state.reason = reason;
    state.log.push({type:'finish',winner,reason,turnNumber:state.turnNumber});
  }

  function advanceTurn(state){
    if (state.turnNumber >= 50){ finish(state,'opponent','turn-limit'); return; }
    state.activeSide=state.activeSide==='player'?'opponent':'player';
    state.turnNumber+=1;
    state.modifiers=(state.modifiers||[]).filter(m=>m.expiresTurn==null||m.expiresTurn>=state.turnNumber);
    beginTurn(state,state.activeSide);
  }

  function checkup(state){
    for(const side of [state.activeSide,state.activeSide==='player'?'opponent':'player'])triggerAbilities(state,'checkup',side);
    const first=state.activeSide,second=first==='player'?'opponent':'player';
    for(const side of [first,second]){
      const slot=state.sides[side].active;if(!slot)continue;
      const c=slot.conditions||{};
      if(c.poison){const amount=typeof c.poison==='object'?Number(c.poison.amount??10):10;slot.damage+=amount;state.log.push({type:'statusDamage',side,status:'poison',amount});}
      if(c.burn){slot.damage+=20;state.log.push({type:'statusDamage',side,status:'burn',amount:20});if(random(state)<0.5)delete c.burn;}
      if(c.sleep&&random(state)<0.5)delete c.sleep;
      if(c.paralysis&&side===state.activeSide&&Number(c.paralysis.appliedTurn??-1)<state.turnNumber)delete c.paralysis;
    }
  }

  function resumeAfterPromotion(state){
    const next=state.promotionQueue?.shift();
    if(next){state.phase='promote';state.promotionSide=next;return;}
    state.phase='battle';state.promotionSide=null;
    const resume=Object.prototype.hasOwnProperty.call(state,'pendingAfterPromotion')?state.pendingAfterPromotion:'endTurn';state.pendingAfterPromotion=null;
    if(resume==='endTurn')endTurn(state);else if(resume==='advanceTurn')advanceTurn(state);
  }

  function endTurn(state){
    if (state.phase !== 'battle') return;
    triggerAbilities(state,'endTurn',state.activeSide);
    checkup(state);
    if(!resolveKnockOut(state,'advanceTurn'))advanceTurn(state);
  }

  function discardKnockedOut(s, slot){
    for (let i=slot.stack.length-1;i>=0;i--) s.discard.push({uid:`${slot.uid}-stack-${i}`,cardId:slot.stack[i]});
    if(slot.tool)s.discard.push(slot.tool);
  }

  function resolveKnockOut(state,resume){
    let any=false;
    while(true){
      const knocked=[];
      for(const side of ['player','opponent'])for(const slot of [state.sides[side].active,...state.sides[side].bench].filter(Boolean))if(Number(slot.damage||0)>=maxHp(state,side,slot))knocked.push({side,slot});
      if(!knocked.length)break;
      for(const {side,slot} of knocked){
        const s=state.sides[side],foe=state.sides[side==='player'?'opponent':'player'],card=data.cardById(slot.cardId);
        any=true;discardKnockedOut(s,slot);if(slot===s.active)s.active=null;else s.bench.splice(s.bench.indexOf(slot),1);
        foe.points+=Math.max(1,Number(card.points||1));state.log.push({type:'ko',side,cardId:card.id,points:foe.points});
      }
    }
    const p=state.sides.player,o=state.sides.opponent;
    const pw=Number(p.points>=3)+Number(!o.active&&!o.bench.length),ow=Number(o.points>=3)+Number(!p.active&&!p.bench.length);
    if(pw||ow){finish(state,pw===ow?'draw':pw>ow?'player':'opponent',pw===ow?'simultaneous-ko':(!p.active&&!p.bench.length||!o.active&&!o.bench.length)?'no-pokemon':'points');return true;}
    const order=[state.activeSide,state.activeSide==='player'?'opponent':'player'];
    const needs=order.filter(side=>!state.sides[side].active&&state.sides[side].bench.length);
    if(needs.length){state.pendingAfterPromotion=resume||null;state.promotionQueue=needs;state.phase='promote';state.promotionSide=state.promotionQueue.shift();return true;}
    return false;
  }

  function playTrainer(state,side,action){
    const s=state.sides[side];const [ref]=s.hand.splice(action.handIndex,1);const card=data.cardById(ref.cardId),type=trainerType(card);
    state.log.push({type:'trainer',side,cardId:card.id,target:action.target,benchIndex:action.benchIndex});
    if(card.effect?.type==='playFossil'){placeOnBench(s,makePokemonSlot(card.id,s.turnCount,ref.uid),action.benchIndex);return;}
    if(type==='Supporter')s.supporterUsed=true;
    if(type==='Tool'){const target=slotForTarget(s,action.target,action.benchIndex);target.tool=ref;effects.applyEffect(card.onAttach,effectContext(state,side,action,target));resolveKnockOut(state,null);return;}
    if(type==='Stadium'){if(state.stadium)state.sides[state.stadium.ownerSide].discard.push({uid:state.stadium.uid,cardId:state.stadium.cardId});state.stadium={...ref,ownerSide:side};s.stadiumUsed=true;resolveKnockOut(state,null);return;}
    s.discard.push(ref);
    effects.applyEffect(card.effect,effectContext(state,side,action));
    resolveKnockOut(state,null);
  }

  function applyAction(state, side, action){
    if (!state || !['setup','battle','promote'].includes(state.phase)) throw new Error('Battle is not active.');
    if (state.phase === 'battle' && state.activeSide !== side) throw new Error(`It is not ${side}'s turn.`);
    if (state.phase === 'setup' && state.setupSide !== side) throw new Error(`It is not ${side}'s setup.`);
    if (state.phase === 'promote' && state.promotionSide !== side) throw new Error(`It is not ${side}'s promotion.`);
    const legal = legalActions(state,side);
    const matched = legal.find(item => actionMatches(item,action));
    if (!matched){
      if (action && action.type === 'attach' && state.sides[side].energyUsed) throw new Error('Energy can only be attached once per turn.');
      throw new Error(`Illegal Pocket action: ${action && action.type || 'unknown'}.`);
    }
    const s = state.sides[side];
    if (matched.type === 'promote'){
      const index=benchArrayIndex(s,matched.benchIndex);
      if(index<0)throw new Error('That Bench slot is empty.');
      const [incoming]=s.bench.splice(index,1);
      const fromBench=Number(incoming.benchSlot);
      incoming.benchSlot=null;
      s.active=incoming;
      state.log.push({type:'promote',side,cardId:incoming.cardId,benchIndex:fromBench});
      resumeAfterPromotion(state);
      return state;
    }
    if (matched.type === 'setupActive'){
      const [ref] = s.hand.splice(matched.handIndex,1);
      s.active = makePokemonSlot(ref.cardId,0,ref.uid);
      state.log.push({type:'setupActive',side,cardId:ref.cardId,target:'active'});
      return state;
    }
    if (matched.type === 'setupBench'){
      const [ref] = s.hand.splice(matched.handIndex,1);
      placeOnBench(s,makePokemonSlot(ref.cardId,0,ref.uid),matched.benchIndex);
      state.log.push({type:'setupBench',side,cardId:ref.cardId,target:'bench',benchIndex:matched.benchIndex});
      return state;
    }
    if (matched.type === 'setupReady'){
      if (!s.active) throw new Error('Choose an Active Pokémon first.');
      state.phase = 'battle';
      state.setupSide = null;
      state.activeSide = state.firstSide;
      state.turnNumber = 1;
      beginTurn(state,state.firstSide);
      return state;
    }
    const foeSide = side === 'player' ? 'opponent' : 'player';
    const foe = state.sides[foeSide];

    if (matched.type === 'bench'){
      const [ref] = s.hand.splice(matched.handIndex,1);
      placeOnBench(s,makePokemonSlot(ref.cardId,s.turnCount,ref.uid),matched.benchIndex);
      state.log.push({type:'bench',side,cardId:ref.cardId,benchIndex:matched.benchIndex});
      return state;
    }
    if (matched.type === 'evolve'){
      const [ref] = s.hand.splice(matched.handIndex,1);
      const target = slotForTarget(s,matched.target,matched.benchIndex);
      target.cardId = ref.cardId;
      target.stack.push(ref.cardId);
      effects.clearTemporaryEffects(state,target);
      target.playedOnSideTurn=s.turnCount;
      state.log.push({type:'evolve',side,cardId:ref.cardId,target:matched.target,benchIndex:matched.benchIndex});
      return state;
    }
    if (matched.type === 'trainer'){
      playTrainer(state,side,matched);
      return state;
    }
    if (matched.type === 'ability'){
      const source=slotForTarget(s,matched.target,matched.benchIndex),ability=abilitiesFor(data.cardById(source.cardId))[matched.abilityIndex||0];
      s.abilityUsed=s.abilityUsed||{};s.abilityUsed[source.uid+':'+(matched.abilityIndex||0)]=s.turnCount;
      effects.applyEffect(ability.effect,effectContext(state,side,matched,source));
      state.log.push({type:'ability',side,cardId:source.cardId,ability:ability.name,target:matched.effectTarget,benchIndex:matched.effectBenchIndex});
      resolveKnockOut(state,null);
      return state;
    }
    if (matched.type === 'attach'){
      const target = slotForTarget(s,matched.target,matched.benchIndex);
      const type = s.energyType;
      target.energy[type] = Number(target.energy[type] || 0) + 1;
      s.energyUsed = true;
      state.log.push({type:'attach',side,target:matched.target,benchIndex:matched.benchIndex,cardId:target.cardId,energyType:type});
      return state;
    }
    if (matched.type === 'retreat'){
      const activeCard = data.cardById(s.active.cardId);
      const paid = effects.spendGenericEnergy(s.active.energy,retreatCost(state,side));
      if (!paid) throw new Error('Not enough Energy to retreat.');
      s.active.energy = paid;
      const benchArray=benchArrayIndex(s,matched.benchIndex);
      if(benchArray<0)throw new Error('That Bench slot is empty.');
      const incoming=s.bench[benchArray];
      const outgoing=s.active;
      const physical=Number(incoming.benchSlot);
      incoming.benchSlot=null;
      outgoing.benchSlot=physical;
      effects.clearTemporaryEffects(state,outgoing);
      s.bench[benchArray]=outgoing;
      s.active=incoming;
      s.retreated = true;
      state.log.push({type:'retreat',side,cardId:outgoing.cardId,toCardId:incoming.cardId,benchIndex:physical});
      return state;
    }
    if (matched.type === 'attack'){
      const attackerCard=data.cardById(s.active.cardId),attack=attackerCard.attacks[matched.attackIndex];
      if(s.active.conditions?.confusion){const heads=random(state)<0.5;state.log.push({type:'coin',side,heads,status:'confusion'});if(!heads){state.log.push({type:'attackFailed',side,reason:'confusion'});endTurn(state);return state;}}
      const context={...effectContext(state,side,matched),isAttack:true},result=effects.resolveAttack(attack,context);
      const defender=result.damageTarget===undefined?foe.active:result.damageTarget;
      if(!defender)throw new Error('No legal target remains for this attack.');
      const isActive=defender===foe.active;
      let damage=result.damage;
      if(isActive&&damage>0)damage+=effects.modifierAmount(state,side,s.active,'attackDamage',data.cardById);
      if(isActive)damage=effects.attackDamage(attackerCard,{damage},data.cardById(defender.cardId));
      const guard=effects.attackIsPrevented(state,foeSide,defender,s.active,data.cardById);
      damage=guard?0:Math.max(0,damage-effects.modifierAmount(state,foeSide,defender,'damageReduction',data.cardById));
      defender.damage=Number(defender.damage||0)+damage;
      state.log.push({type:'attack',side,cardId:attackerCard.id,attack:attack.name,damage,target:isActive?'active':'bench',benchIndex:defender.benchSlot});
      if(damage>0)triggerAbilities(state,'damagedByAttack',foeSide,defender);
      if(guard?.effects)context.preventedTargets=new Set([defender.uid]);
      for(const effect of result.pendingEffects)effects.applyEffect(effect,context);
      const paused=resolveKnockOut(state,'endTurn');
      if(!paused&&state.phase==='battle')endTurn(state);
      return state;
    }
    if (matched.type === 'endTurn'){
      endTurn(state);
      return state;
    }
    throw new Error(`Unimplemented Pocket action: ${matched.type}`);
  }

  function publicSnapshot(state){ return JSON.parse(JSON.stringify(state)); }

  return {createBattle,makePokemonSlot,legalActions,attackAvailability,energyCostLabel,applyAction,publicSnapshot,drawCard,endTurn,benchSlotAt,benchArrayIndex,normalizeBenchSlots,random,shuffle,checkup,effectContext,maxHp};
});
