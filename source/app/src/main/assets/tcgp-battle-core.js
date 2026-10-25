(function(root, factory){
  let data = root && root.LuckyDexTCGPBattleData;
  let effects = root && root.LuckyDexTCGPBattleEffects;
  if (typeof module === 'object' && module.exports){
    data = require('./tcgp-battle-data.js');
    effects = require('./tcgp-battle-effects.js');
    module.exports = factory(data,effects);
  } else if (root){
    root.LuckyDexTCGPBattleCore = factory(data,effects);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(data,effects){
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

  function makePokemonSlot(cardId, playedOnSideTurn, uid){
    const card = data.cardById(cardId);
    if (!card || card.kind !== 'pokemon') throw new Error(`Not a Pokémon battle card: ${cardId}`);
    return {
      uid:uid || `slot-${cardId}-${Math.random().toString(36).slice(2,8)}`,
      cardId:card.id,
      stack:[card.id],
      damage:0,
      energy:{},
      playedOnSideTurn:Math.max(0,Number(playedOnSideTurn || 0)),
      benchSlot:null
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

  function createSide(side, ids, energyType){
    return {
      id:side,
      deck:makeDeck(side,ids), hand:[], discard:[], active:null, bench:[], points:0,
      energyType:energyType || 'Grass', energyAvailable:false, energyUsed:false, retreated:false,
      turnCount:0
    };
  }

  function createBattle(options){
    const opts = options || {};
    const playerDeck = Array.isArray(opts.playerDeck) ? opts.playerDeck.slice() : [];
    const opponentDeck = Array.isArray(opts.opponentDeck) ? opts.opponentDeck.slice() : [];
    if (playerDeck.length !== 20 || opponentDeck.length !== 20) throw new Error('Pocket battles require 20-card decks.');
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
        player:createSide('player',playerDeck,opts.playerEnergyType || 'Grass'),
        opponent:createSide('opponent',opponentDeck,opts.opponentEnergyType || 'Grass')
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
    s.energyAvailable = !(state.turnNumber === 1 && side === state.firstSide);
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
      if (card && card.kind === 'trainer' && card.battleEnabled) actions.push({type:'trainer',handIndex,cardId:card.id});
    });
    if (s.energyAvailable && !s.energyUsed){
      if (s.active) actions.push({type:'attach',target:'active'});
      normalizeBenchSlots(s);
      s.bench.forEach((slot,index)=>{if(slot)actions.push({type:'attach',target:'bench',benchIndex:Number(slot.benchSlot ?? index)});});
    }
    if (!s.retreated && s.active && s.bench.length){
      const card = data.cardById(s.active.cardId);
      if (effects.totalEnergy(s.active.energy) >= Number(card.retreat || 0)){
        normalizeBenchSlots(s);
        s.bench.forEach((slot,index)=>{if(slot)actions.push({type:'retreat',benchIndex:Number(slot.benchSlot ?? index)});});
      }
    }
    if (s.active){
      const card = data.cardById(s.active.cardId);
      (card.attacks || []).forEach((attack,attackIndex)=>{
        if (effects.canPayCost(s.active.energy,attack.cost)) actions.push({type:'attack',attackIndex,cardId:card.id});
      });
    }
    actions.push({type:'endTurn'});
    return actions;
  }

  function actionMatches(legal, action){
    if (!legal || !action || legal.type !== action.type) return false;
    const keys = ['handIndex','cardId','target','benchIndex','attackIndex'];
    return keys.every(key => action[key] == null || legal[key] === action[key]);
  }

  function finish(state,winner,reason){
    state.phase = 'finished'; state.winner = winner; state.reason = reason;
    state.log.push({type:'finish',winner,reason,turnNumber:state.turnNumber});
  }

  function endTurn(state){
    if (state.phase !== 'battle') return;
    if (state.turnNumber >= 50){ finish(state,'opponent','turn-limit'); return; }
    state.activeSide = state.activeSide === 'player' ? 'opponent' : 'player';
    state.turnNumber += 1;
    beginTurn(state,state.activeSide);
  }

  function discardKnockedOut(s, slot){
    for (let i=slot.stack.length-1;i>=0;i--) s.discard.push({uid:`${slot.uid}-stack-${i}`,cardId:slot.stack[i]});
  }

  function resolveKnockOut(state, attackerSide){
    const defenderSide = attackerSide === 'player' ? 'opponent' : 'player';
    const attacker = state.sides[attackerSide], defender = state.sides[defenderSide];
    if (!defender.active) return;
    const card = data.cardById(defender.active.cardId);
    if (Number(defender.active.damage || 0) < Number(card.hp || 0)) return;
    const knocked = defender.active;
    discardKnockedOut(defender,knocked);
    defender.active = null;
    attacker.points += Math.max(1,Number(card.points || 1));
    state.log.push({type:'ko',side:defenderSide,cardId:card.id,points:attacker.points});
    if (attacker.points >= 3){ finish(state,attackerSide,'points'); return; }
    if (!defender.bench.length){ finish(state,attackerSide,'no-pokemon'); return; }
    normalizeBenchSlots(defender);
    state.phase='promote';
    state.promotionSide=defenderSide;
  }

  function playTrainer(state,side,action){
    const s = state.sides[side];
    const [ref] = s.hand.splice(action.handIndex,1);
    const card = data.cardById(ref.cardId);
    s.discard.push(ref);
    state.log.push({type:'trainer',side,cardId:card.id});
    if (card.effect && card.effect.type === 'searchRandomBasic'){
      if (s.hand.length >= 10) return;
      const candidates=[];
      s.deck.forEach((item,index)=>{ if (isBasic(item)) candidates.push(index); });
      if (!candidates.length) return;
      const pick = candidates[Math.floor(random(state)*candidates.length)];
      const [found] = s.deck.splice(pick,1);
      s.hand.push(found);
      state.log.push({type:'search',side,cardId:found.cardId,source:card.id});
      return;
    }
    if (card.effect) throw new Error(`Unsupported trainer effect: ${card.effect.type}`);
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
      state.phase='battle';
      state.promotionSide=null;
      endTurn(state);
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
      state.log.push({type:'evolve',side,cardId:ref.cardId,target:matched.target,benchIndex:matched.benchIndex});
      return state;
    }
    if (matched.type === 'trainer'){
      playTrainer(state,side,matched);
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
      const paid = effects.spendGenericEnergy(s.active.energy,activeCard.retreat);
      if (!paid) throw new Error('Not enough Energy to retreat.');
      s.active.energy = paid;
      const benchArray=benchArrayIndex(s,matched.benchIndex);
      if(benchArray<0)throw new Error('That Bench slot is empty.');
      const incoming=s.bench[benchArray];
      const outgoing=s.active;
      const physical=Number(incoming.benchSlot);
      incoming.benchSlot=null;
      outgoing.benchSlot=physical;
      s.bench[benchArray]=outgoing;
      s.active=incoming;
      s.retreated = true;
      state.log.push({type:'retreat',side,cardId:outgoing.cardId,toCardId:incoming.cardId,benchIndex:physical});
      return state;
    }
    if (matched.type === 'attack'){
      const attackerCard = data.cardById(s.active.cardId);
      const attack = attackerCard.attacks[matched.attackIndex];
      const defenderCard = data.cardById(foe.active.cardId);
      const damage = effects.attackDamage(attackerCard,attack,defenderCard);
      foe.active.damage = Number(foe.active.damage || 0) + damage;
      state.log.push({type:'attack',side,cardId:attackerCard.id,attack:attack.name,damage});
      effects.applyAttackEffect(attack.effect,{state,attacker:s.active,defender:foe.active,side,foeSide});
      resolveKnockOut(state,side);
      if (state.phase === 'battle') endTurn(state);
      return state;
    }
    if (matched.type === 'endTurn'){
      endTurn(state);
      return state;
    }
    throw new Error(`Unimplemented Pocket action: ${matched.type}`);
  }

  function publicSnapshot(state){ return JSON.parse(JSON.stringify(state)); }

  return {createBattle,makePokemonSlot,legalActions,applyAction,publicSnapshot,drawCard,endTurn,benchSlotAt,benchArrayIndex,normalizeBenchSlots};
});
