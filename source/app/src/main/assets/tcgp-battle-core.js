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
      energy:{}, specialEnergy:[],
      playedOnSideTurn:Math.max(0,Number(playedOnSideTurn || 0)),
      benchSlot:null, conditions:{}, tool:null, extraTools:[], temporaryTrainers:[]
    };
  }


  function pokemonOn(sideState){ return [sideState?.active,...(sideState?.bench||[])].filter(Boolean); }
  function toolsOf(slot){ return slot?[slot.tool,...(slot.extraTools||[])].filter(Boolean):[]; }
  function temporaryTrainersOf(slot){return slot?(slot.temporaryTrainers||[]).filter(Boolean):[];}
  function attachTool(slot,ref){ if(!slot.tool)slot.tool=ref;else{slot.extraTools=slot.extraTools||[];slot.extraTools.push(ref);} }

  function normalizeBenchSlots(sideState){
    const bench=sideState?.bench||[],cap=Math.max(0,Math.min(5,Number(sideState?.benchLimit??3)));
    // A newly played Narrow Gym may temporarily leave three Pokémon on the
    // Bench pending a return-to-hand choice. Keep all three visible until the
    // player has chosen one. Afterwards, no Pokémon may remain in hidden slot 2.
    const visible=Math.min(5,Math.max(cap,bench.filter(Boolean).length));
    const used=new Set(),unplaced=[];
    // Reserve valid physical slots first. Otherwise an off-screen Pokémon at
    // slot 2 could steal slot 0 from a Pokémon already displayed there.
    bench.forEach(slot=>{
      if(!slot)return;
      const physical=Number(slot.benchSlot);
      if(Number.isInteger(physical)&&physical>=0&&physical<visible&&!used.has(physical))used.add(physical);
      else unplaced.push(slot);
    });
    for(const slot of unplaced){
      const physical=[0,1,2,3,4].slice(0,visible).find(i=>!used.has(i));
      if(physical===undefined)continue;
      slot.benchSlot=physical;used.add(physical);
    }
    return bench;
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

  function maxBenchSize(sideState){return Math.max(0,Math.min(5,Number(sideState?.benchLimit??3)));}

  function emptyBenchSlots(sideState){
    normalizeBenchSlots(sideState);
    const used=new Set((sideState?.bench||[]).filter(Boolean).map(slot=>Number(slot.benchSlot)));
    return [0,1,2,3,4].slice(0,maxBenchSize(sideState)).filter(i=>!used.has(i));
  }

  function placeOnBench(sideState,slot,benchIndex){
    const physical=Number(benchIndex);
    if(!Number.isInteger(physical)||physical<0||physical>=maxBenchSize(sideState))throw new Error('That Bench slot is unavailable.');
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
    if (idx < 0) throw new Error(`${state?.format==='classic'?'Classic TCG':'Pocket'} deck must contain at least one Basic Pokémon.`);
    const replacement = sideState.deck[idx];
    sideState.deck[idx] = sideState.hand[0];
    sideState.hand[0] = replacement;
  }

  function drawCard(sideState){
    const hasLimit=sideState?.handLimit!=null,limit=hasLimit?Number(sideState.handLimit):null;
    if (!sideState.deck.length || (hasLimit&&Number.isFinite(limit)&&limit>=0&&sideState.hand.length>=limit)) return null;
    const card = sideState.deck.shift();
    sideState.hand.push(card);
    return card;
  }

  function prepareOpeningHand(state, side){
    const s = state.sides[side];
    const opening=Math.max(1,Number(state.rules?.openingHand||5));
    for (let i=0;i<opening;i++) drawCard(s);
    ensureOpeningBasic(state,s);
  }

  function autoSetup(state, side){
    const s = state.sides[side];
    if(!s.hand.length)prepareOpeningHand(state,side);
    const activeIndex = s.hand.findIndex(isBasic);
    const [activeRef] = s.hand.splice(activeIndex,1);
    s.active = makePokemonSlot(activeRef.cardId,0,activeRef.uid);
    const benchLimit=Math.max(0,Number(state.rules?.benchSize??3));
    for (let i=s.hand.length-1;i>=0 && s.bench.length<benchLimit;i--){
      if (!isBasic(s.hand[i])) continue;
      const [ref] = s.hand.splice(i,1);
      const slot=makePokemonSlot(ref.cardId,0,ref.uid);
      placeOnBench(s,slot,emptyBenchSlots(s)[0]);
    }
  }

  const RULE_PROFILES=Object.freeze({
    pocket:Object.freeze({id:'pocket',deckSize:20,openingHand:5,prizeCount:0,winMode:'points',winPoints:3,handLimit:10,benchSize:3,firstTurnEnergy:false}),
    classic:Object.freeze({id:'classic',deckSize:30,openingHand:7,prizeCount:5,winMode:'prizes',winPoints:null,handLimit:null,benchSize:3,firstTurnEnergy:true})
  });
  function battleRules(format){return RULE_PROFILES[String(format||'pocket').toLowerCase()]||RULE_PROFILES.pocket;}
  function createSide(side, ids, energyType, energyTypes, rules){
    const types=energyTypes==null?(energyType?[energyType]:decks.analyzeDeck(ids).recommendedEnergyTypes):energyTypes;
    const maxEnergyTypes=rules?.id==='classic'?6:3;
    if(!Array.isArray(types)||types.length<1||types.length>maxEnergyTypes||new Set(types).size!==types.length||types.some(t=>!Object.values(effects.ENERGY_CODE).includes(t)))throw new Error(`Energy Zone requires one to ${maxEnergyTypes} distinct valid Energy types.`);
    return {
      id:side,
      deck:makeDeck(side,ids), hand:[], discard:[], energyDiscard:{}, energySupply:null, active:null, bench:[], benchLimit:3, points:0,
      prizes:[],prizesTaken:0,handLimit:rules?.handLimit==null?null:Number(rules.handLimit),
      energyTypes:types.slice(), energyType:types[0], nextEnergyType:types[0], energyAvailable:false, energyUsed:false, retreated:false,
      turnCount:0, pointsGainedThisTurn:0, pointsGainedLastTurn:0, knockoutsTaken:0, lastKnockedOutCardIds:[]
    };
  }
  function setupPrizes(state,side){
    const s=state.sides[side],count=Math.max(0,Number(state.rules?.prizeCount||0));
    if(!count)return;
    s.prizes=s.deck.splice(0,count);s.prizesTaken=0;
  }

  function createBattle(options){
    const opts = options || {},rules=battleRules(opts.format),format=rules.id;
    const playerDeck = Array.isArray(opts.playerDeck) ? opts.playerDeck.slice() : [];
    const opponentDeck = Array.isArray(opts.opponentDeck) ? opts.opponentDeck.slice() : [];
    if (playerDeck.length !== rules.deckSize || opponentDeck.length !== rules.deckSize) throw new Error(`${format==='classic'?'Classic TCG':'Pocket'} battles require ${rules.deckSize}-card decks.`);
    if(format==='classic'){for(const deck of [playerDeck,opponentDeck]){const result=data.CLASSIC?.validateDeck?.(deck);if(!result?.ok)throw new Error(`Illegal Classic TCG deck: ${(result?.errors||['Classic card data is unavailable.'])[0]}`);}}
    if([playerDeck,opponentDeck].some(deck=>!deck.some(id=>{const c=data.cardById(id);return c?.kind==='pokemon'&&c.stage==='Basic';})))throw new Error('Each deck requires at least one Basic Pokémon.');
    const firstSide = opts.firstSide === 'opponent' ? 'opponent' : 'player';
    const manualPlayerSetup = !!opts.manualPlayerSetup;
    const state = {
      schema:1,format,rules:{...rules},
      rngState:seedValue(opts.seed),
      phase:manualPlayerSetup?'setup':'battle', winner:null, reason:null,
      setupSide:manualPlayerSetup?'player':null,
      firstSide,
      activeSide:firstSide,
      turnNumber:1,
      log:[],
      sides:{
        player:createSide('player',playerDeck,opts.playerEnergyType,opts.playerEnergyTypes,rules),
        opponent:createSide('opponent',opponentDeck,opts.opponentEnergyType,opts.opponentEnergyTypes,rules)
      }
    };
    shuffle(state,state.sides.player.deck);
    shuffle(state,state.sides.opponent.deck);
    // Classic uses a real, ordered Basic Energy supply outside the 30 cards.
    // 240 cards supports the full 100-turn safety limit and extra searches.
    // The queue is seeded once and is never rerolled behind the player's back.
    if(format==='classic')for(const ss of Object.values(state.sides)){
      ss.energySupply=Array.from({length:240},(_,index)=>ss.energyTypes[index%ss.energyTypes.length]);
      shuffle(state,ss.energySupply);
      ss.energyType=ss.energySupply[0];
      ss.nextEnergyType=ss.energySupply[0];
    }
    // Opening hands are drawn before Prize cards are set aside. Pocket has no
    // Prizes, so its existing setup order is unchanged in observable play.
    prepareOpeningHand(state,'player');prepareOpeningHand(state,'opponent');
    setupPrizes(state,'player');setupPrizes(state,'opponent');
    if (!manualPlayerSetup) autoSetup(state,'player');
    autoSetup(state,'opponent');
    if (!manualPlayerSetup) beginTurn(state,firstSide);
    return state;
  }

  function neoToolCheck(state,side){
    if(state.format!=='classic')return;
    const ss=state.sides[side];for(const slot of pokemonOn(ss)){
      for(const ref of toolsOf(slot)){
        const id=ref.cardId,healing=id==='neo1-93'?40:id==='neo1-99'?20:0;
        const index=toolsOf(slot).findIndex(x=>x.uid===ref.uid);
        const cure=id==='neo1-94'&&Object.keys(slot.conditions||{}).length>0;
        if((healing&&slot.damage>=healing)||cure){if(healing)slot.damage=Math.max(0,slot.damage-healing);if(cure)slot.conditions={};
          if(slot.tool?.uid===ref.uid){slot.tool=null;if(slot.extraTools?.length)slot.tool=slot.extraTools.shift();}
          else slot.extraTools=(slot.extraTools||[]).filter(x=>x.uid!==ref.uid);
          ss.discard.push(ref);state.log.push({type:'neoTool',side,cardId:id,healed:healing,statusCured:cure});
        }
      }
    }
  }
  function neoTrapActive(state,side,slot,kind){
    if(state.format!=='classic'||!slot)return false;
    const opponent=side==='player'?'opponent':'player',foe=state.sides[opponent],isActive=sourceUid=>foe.active?.uid===sourceUid;
    const active=kind==='retreat'||kind==='switch';
    return active&&(!!(slot.neoMeanLook&&isActive(slot.neoMeanLook.sourceUid))||!!(slot.neoWebLock&&isActive(slot.neoWebLock.sourceUid))||!!(slot.neoJawClamp&&isActive(slot.neoJawClamp.sourceUid)&&state.turnNumber<=Number(slot.neoJawClamp.expiresTurn||0))||(kind==='retreat'&&!!(slot.neoScaryFace&&state.turnNumber<=slot.neoScaryFace.expiresTurn)));
  }
  function neoAttackLocked(state,side,slot,attackName){
    if(state.format!=='classic'||!slot)return false;
    return !!(slot.neoAttackLock||slot.neoScaryFace&&state.turnNumber<=slot.neoScaryFace.expiresTurn||slot.neoAmnesia&&slot.neoAmnesia.expiresTurn>=state.turnNumber&&slot.neoAmnesia.attackName===attackName);
  }
  function neoRecycleSpecial(ss,ref){if(ref?.cardId==='neo1-105')ss.hand.push(ref);else ss.discard.push(ref);}
  function beginTurn(state, side){
    const s = state.sides[side];
    s.turnCount += 1;
    s.energyUsed = false;
    s.retreated = false;
    s.supporterUsed = false;
    s.stadiumUsed = false;
    s.abilityUsed = s.abilityUsed || {};
    s.energyAvailable = !!state.rules?.firstTurnEnergy || !(state.turnNumber === 1 && side === state.firstSide);
    if(s.energyAvailable){
      if(Array.isArray(s.energySupply)){
        // This turn consumes the TOP of the supply, not an independent RNG roll.
        s.energyType=s.energySupply.shift()||null;
        s.nextEnergyType=s.energySupply[0]||null;
        if(!s.energyType)s.energyAvailable=false;
        state.log.push({type:'energySupplyDraw',side,energyType:s.energyType,remaining:s.energySupply.length});
      }else{
        s.energyType=s.nextEnergyType||s.energyTypes[0];
        s.nextEnergyType=s.energyTypes.length>1?s.energyTypes[Math.floor(random(state)*s.energyTypes.length)]:s.energyTypes[0];
      }
    }
    neoToolCheck(state,side);
    const hadCardToDraw=s.deck.length>0,drawn=drawCard(s);
    // The compact Classic hybrid uses Pocket's no-deck-out rule: losing
    // 5 Prize cards plus the 7-card opening hand from a 30-card deck would
    // otherwise turn normal draw Trainers into premature match losses.
    if(!drawn&&state.format==='classic'&&!hadCardToDraw)state.log.push({type:'drawSkipped',side,reason:'empty-deck',turnNumber:state.turnNumber});
    if(drawn)state.log.push({type:'draw',side,amount:1,cardId:drawn.cardId,reason:'turn'});
    state.log.push({type:'turn',side,turnNumber:state.turnNumber});
    triggerAbilities(state,'beginTurn',side);
    triggerPersistent(state,'beginTurn',side);
    if(state.format==='classic'&&state.stadium?.cardId==='SNAPFLORIO-118')resolveKnockOut(state,null);
  }

  function slotForTarget(s,target,benchIndex){
    if (target === 'active') return s.active;
    if (target === 'bench') return benchSlotAt(s,benchIndex);
    return null;
  }

  function evolutionActions(state,side){
    const s=state.sides[side],actions=[];
    const canEvolveTarget=(slot,evo,target)=>{
      if(!slot)return false;
      const base=data.cardById(slot.cardId),asName=effects.evolutionRule(state,side,slot,'evolutionAsName',data.cardById),timing=effects.evolutionRule(state,side,slot,'evolutionTimingOverride',data.cardById);
      const evolvesName=asName?.name||base?.name;if(evolvesName!==evo.evolvesFrom)return false;
      const firstTurn=s.turnCount<=1,sameTurn=Number(slot.playedOnSideTurn)>=Number(s.turnCount);
      const giovanniBonus=state.format==='classic'&&Number(s.gym2GiovanniEvolutionTurn)===Number(state.turnNumber)&&base?.name?.startsWith("Giovanni's")&&evo.name?.startsWith("Giovanni's");
      if(firstTurn&&!timing?.firstTurn&&!giovanniBonus)return false;if(sameTurn&&!timing?.sameTurn&&!giovanniBonus)return false;
      return true;
    };
    s.hand.forEach((ref,handIndex)=>{
      const evo=data.cardById(ref.cardId);if(!evo||evo.kind!=='pokemon'||evo.stage==='Basic'||!evo.battleEnabled)return;
      if(canEvolveTarget(s.active,evo,'active'))actions.push({type:'evolve',handIndex,cardId:evo.id,target:'active'});
      normalizeBenchSlots(s);s.bench.forEach((slot,index)=>{if(!slot)return;const benchIndex=Number(slot.benchSlot??index);if(canEvolveTarget(slot,evo,'bench'))actions.push({type:'evolve',handIndex,cardId:evo.id,target:'bench',benchIndex});});
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
    if (s.bench.length < maxBenchSize(s)){
      const empty=emptyBenchSlots(s);
      s.hand.forEach((ref,handIndex)=>{
        if (!isBasic(ref)) return;
        empty.forEach(benchIndex=>actions.push({type:'setupBench',handIndex,cardId:ref.cardId,target:'bench',benchIndex}));
      });
    }
    actions.push({type:'setupReady'});
    return actions;
  }

  function findSlotByUid(state,side,uid){return [state.sides[side]?.active,...(state.sides[side]?.bench||[])].find(slot=>slot&&slot.uid===uid)||null;}
  function beginEffectChoice(state,originSide,source,spec){
    const side=spec.side==='opponent'?(originSide==='player'?'opponent':'player'):spec.side==='self'?originSide:spec.side;
    state.pendingChoice={...spec,originSide,side,sourceUid:source?.uid||null,afterEffects:Array.isArray(spec.afterEffects)?spec.afterEffects.slice():[],resume:spec.resume||null,isAttack:!!spec.isAttack};
    state.phase='effectChoice';state.choiceSide=side;
  }
  function effectChoiceActions(state,side){
    const p=state.pendingChoice;if(!p||p.side!==side)return[];const ss=state.sides[side],out=[];
    const filterCard=(slotOrRef)=>{if((p.excludeUids||[]).includes(slotOrRef?.uid))return false;const card=data.cardById(slotOrRef?.cardId);return !p.filter||effects.matchesFilter?effects.matchesFilter(card,p.filter,slotOrRef):true;};
    if(p.kind==='narrowGymReturn'){
      for(const slot of ss.bench||[])if(slot)out.push({type:'effectChoice',choiceTarget:'bench',choiceBenchIndex:Number(slot.benchSlot),choiceCardId:slot.cardId});
    }else if(p.kind==='switchBench'||p.kind==='pokemon'){
      const board=state.sides[p.selectionSide||side],eligible=slot=>slot&&filterCard(slot)&&(!p.requireTool||toolsOf(slot).length>0);
      if(p.kind==='pokemon'&&p.includeActive!==false&&eligible(board.active))out.push({type:'effectChoice',choiceTarget:'active',choiceCardId:board.active.cardId});
      for(const slot of board.bench||[])if(eligible(slot))out.push({type:'effectChoice',choiceTarget:'bench',choiceBenchIndex:Number(slot.benchSlot),choiceCardId:slot.cardId});
    }else if(p.kind==='handCard'){
      ss.hand.forEach((ref,index)=>{const card=data.cardById(ref.cardId);if(!p.filter||effects.matchesFilter(card,p.filter,ref))out.push({type:'effectChoice',choiceHandIndex:index,choiceCardId:ref.cardId});});
    }else if(p.kind==='deckCard'){
      ss.deck.forEach((ref,index)=>{const card=data.cardById(ref.cardId);if(!p.filter||effects.matchesFilter(card,p.filter,ref))out.push({type:'effectChoice',choiceDeckIndex:index,choiceCardId:ref.cardId});});
    }else if(p.kind==='discardCard'){
      const zoneSide=p.discardZone==='opponent'?(p.originSide==='player'?'opponent':'player'):side,target=state.sides[zoneSide],excluded=new Set(p.excludeUids||[]);target.discard.forEach((ref,index)=>{const card=data.cardById(ref.cardId);if(!excluded.has(ref.uid)&&(!p.filter||effects.matchesFilter(card,p.filter,ref)))out.push({type:'effectChoice',choiceDiscardIndex:index,choiceCardId:ref.cardId});});
    }else if(p.kind==='opponentHandCard'){
      const targetSide=p.originSide==='player'?'opponent':'player',target=state.sides[targetSide];target.hand.forEach((ref,index)=>{const card=data.cardById(ref.cardId);if(!p.filter||effects.matchesFilter(card,p.filter,ref))out.push({type:'effectChoice',choiceHandIndex:index,choiceCardId:ref.cardId});});
    }else if(p.kind==='attack'){
      const targetSide=state.sides[p.attackSide||side],slots=p.zone==='bench'?(targetSide.bench||[]):p.zone==='all'?[targetSide.active,...(targetSide.bench||[])].filter(Boolean):[targetSide.active].filter(Boolean);
      for(const slot of slots){const card=data.cardById(slot.cardId);for(const [attackIndex,attack] of (card?.attacks||[]).entries())out.push({type:'effectChoice',choiceTarget:slot===targetSide.active?'active':'bench',choiceBenchIndex:slot.benchSlot,choiceCardId:slot.cardId,choiceAttackIndex:attackIndex});}
    }else if(p.kind==='option'){
      (p.options||[]).forEach((label,index)=>out.push({type:'effectChoice',choiceOption:index,choiceLabel:label}));
    }else if(p.kind==='topDeckCard'){
      const target=state.sides[p.deckSide||side],n=Math.min(Number(p.count||1),target.deck.length),excluded=new Set(p.excludeUids||[]);for(let i=0;i<n;i++){const ref=target.deck[i];if(!excluded.has(ref.uid)&&(!p.filter||effects.matchesFilter(data.cardById(ref.cardId),p.filter,ref)))out.push({type:'effectChoice',choiceDeckIndex:i,choiceCardId:ref.cardId});}
    }else if(p.kind==='energySource'){
      for(const slot of [ss.active,...(ss.bench||[])].filter(Boolean)){
        const target={type:'effectChoice',choiceTarget:slot===ss.active?'active':'bench',choiceBenchIndex:slot===ss.active?undefined:Number(slot.benchSlot),choiceCardId:slot.cardId};
        for(const [energyType,amount] of Object.entries(slot.energy||{})){
          if(Number(amount)<=0||(p.energyTypes&&!p.energyTypes.includes(energyType)))continue;
          out.push({...target,effectEnergyType:energyType});
        }
        // Only effects that explicitly opt in can recover attached Special
        // Energy. Other Energy-source effects continue selecting Basic Energy.
        if(p.includeSpecial)for(const ref of slot.specialEnergy||[]){
          const provides=specialEnergyProvides(ref);
          if(!p.energyTypes||p.energyTypes.some(t=>Number(provides[t]||0)>0))out.push({...target,effectSpecialEnergyUid:ref.uid});
        }
      }
    }else if(p.kind==='energyTarget'){
      const energyTypes=(p.energyTypes||[]).filter(Boolean);for(const slot of [ss.active,...(ss.bench||[])].filter(Boolean)){const card=data.cardById(slot.cardId);if(p.filter&&!effects.matchesFilter(card,p.filter,slot))continue;for(const energyType of energyTypes)out.push({type:'effectChoice',choiceTarget:slot===ss.active?'active':'bench',choiceBenchIndex:slot===ss.active?undefined:Number(slot.benchSlot),choiceCardId:slot.cardId,effectEnergyType:energyType});}
    }else if(p.kind==='toolCard'){
      const board=state.sides[p.selectionSide||side],slot=[board.active,...(board.bench||[])].find(x=>x&&x.uid===p.targetUid);if(slot)toolsOf(slot).forEach((tool,index)=>out.push({type:'effectChoice',choiceTarget:p.choiceTarget||(slot===board.active?'active':'bench'),choiceBenchIndex:p.choiceBenchIndex!=null?p.choiceBenchIndex:(slot===board.active?undefined:Number(slot.benchSlot)),choiceToolIndex:index,choiceCardId:tool.cardId}));
    }
    if(p.optional)out.push({type:'effectChoice',choiceSkip:true});
    return out;
  }
  function effectContext(state,side,action,attacker){
    const foeSide=side==='player'?'opponent':'player';
    return {state,side,foeSide,attacker:attacker||state.sides[side].active,defender:state.sides[foeSide].active,action:action||{},cardById:data.cardById,random,shuffle,drawCard,maxHp:(which,slot)=>maxHp(state,which,slot),retreatCost:which=>retreatCost(state,which),effectiveEnergy:slot=>{const which=pokemonOn(state.sides.player).includes(slot)?'player':'opponent';return effectiveEnergy(state,which,slot);},canPayCopiedCost:attack=>effects.canPayCost(effectiveEnergy(state,side,attacker||state.sides[side].active),attackCost(state,side,attack)),endTurn:()=>endTurn(state),requestChoice:spec=>beginEffectChoice(state,side,attacker||state.sides[side].active,{...spec,trainerRef:action?.trainerRef||spec.trainerRef||null}),benchCard:(ss,ref)=>{const slot=emptyBenchSlots(ss)[0];if(slot==null)return null;const placed=placeOnBench(ss,makePokemonSlot(ref.cardId,ss.turnCount,ref.uid),slot),targetSide=ss===state.sides.player?'player':'opponent';triggerAbilities(state,'benched',targetSide,placed,{fromDeck:true});return slot;},onEnergyAttached:(target,energyType,amount)=>{const targetSide=pokemonOn(state.sides.player).includes(target)?'player':'opponent';for(let i=0;i<Number(amount||1);i++)triggerAbilities(state,'energyAttached',targetSide,target,{energyType,fromZone:true});},gymBenchRedirect:(which,slot,amount)=>gymBenchRedirect(state,which,slot,amount),onEvolved:target=>{const targetSide=pokemonOn(state.sides.player).includes(target)?'player':'opponent';triggerAbilities(state,'evolved',targetSide,target,{fromDeck:true});},evolveFromDeck:target=>{const targetSide=pokemonOn(state.sides.player).includes(target)?'player':'opponent',ss=state.sides[targetSide],base=data.cardById(target.cardId),candidates=ss.deck.map((r,index)=>({r,index,card:data.cardById(r.cardId)})).filter(x=>x.card?.battleEnabled&&x.card.kind==='pokemon'&&x.card.evolvesFrom===base?.name);if(!candidates.length)return false;const hit=candidates[Math.floor(random(state)*candidates.length)],[ref]=ss.deck.splice(hit.index,1);target.cardId=ref.cardId;target.stack.push(ref.cardId);target.playedOnSideTurn=ss.turnCount;target.evolvedOnTurn=state.turnNumber;shuffle(state,ss.deck);state.log.push({type:'evolve',side:targetSide,cardId:ref.cardId,fromDeck:true});triggerAbilities(state,'evolved',targetSide,target,{fromDeck:true});return true;},transformSelfToEnergy:(source,targetUid,energyType,amount)=>{if(!source)return false;const target=pokemonOn(state.sides[side]).find(slot=>slot&&slot.uid===targetUid&&slot!==source);if(!target)return false;source.transformOnKO={targetUid,provides:{[energyType]:Math.max(1,Number(amount||2))}};source.damage=Math.max(Number(source.damage||0),maxHp(state,side,source));return true;}};
  }

  function gymBenchRedirect(state,side,target,amount){
    if(amount<=0||!target||state.format!=='classic'||!state.sides[side]?.bench.includes(target))return amount;
    const rhydon=state.sides[side].bench.find(s=>s&&s.cardId==='gym1-2'&&s!==target&&Number(s.damage||0)+10<Number(data.cardById(s.cardId)?.hp||0));
    if(!rhydon||effects.abilitiesSuppressed(state,side,rhydon,data.cardById))return amount;
    rhydon.damage=Number(rhydon.damage||0)+10;
    state.log.push({type:'gymBenchGuard',side,cardId:rhydon.cardId,redirected:Math.min(10,amount)});
    return Math.max(0,amount-10);
  }
  function gymDamageDefender(state,side,defender,attacker,damage){
    if(state.format!=='classic'||!defender||damage<=0)return damage;
    const defenderCard=data.cardById(defender.cardId),attackerCard=data.cardById(attacker?.cardId);
    if(defender.cardId==='gym1-42'&&attackerCard?.stage==='Basic'&&damage>=20)damage=10;
    if(defender.gymDeflector&&(defender.gymDeflector.expiresTurn==null||state.turnNumber<=defender.gymDeflector.expiresTurn))damage=Math.floor(damage/20)*10;
    if(defender.neoDeflector&&defender.neoDeflector.expiresTurn>=state.turnNumber)damage=Math.floor(damage/20)*10;
    if([state.sides.player.active,state.sides.opponent.active].some(p=>p?.cardId==='gym2-41'&&!effects.abilitiesSuppressed(state,p===state.sides.player.active?'player':'opponent',p,data.cardById)&&!p.conditions?.sleep&&!p.conditions?.confusion&&!p.conditions?.paralysis))damage=Math.ceil(damage/20)*10;
    if(defender.gymShadowImages){const heads=random(state)<0.5;state.log.push({type:'coin',side,reason:'shadowImages',heads,results:[heads]});if(!heads)damage=0;}
    if(damage>0&&defender.gymShadowImages)delete defender.gymShadowImages;
    return damage;
  }
  function gymReactiveDamage(state,defenderSide,defender,attackerSide,attacker,damage){
    if(!defender||!attacker||damage<=0||state.format!=='classic')return;
    if(defender.gymCounterGuard&&(defender.gymCounterGuard.expiresTurn==null||state.turnNumber<=defender.gymCounterGuard.expiresTurn)){
      const heads=random(state)<0.5;state.log.push({type:'coin',side:defenderSide,reason:'crosscounter',heads,results:[heads]});
      if(heads){attacker.damage=Number(attacker.damage||0)+damage*2;state.log.push({type:'gymCounter',side:defenderSide,damage:damage*2});}
    }
    if(defender.gymFireWall&&(defender.gymFireWall.expiresTurn==null||state.turnNumber<=defender.gymFireWall.expiresTurn)){
      const weak=data.cardById(attacker.cardId)?.weakness,res=data.cardById(attacker.cardId)?.resistance;
      const dealt=Math.max(0,10+(weak==='Fire'?10:0)-(res==='Fire'?30:0));attacker.damage=Number(attacker.damage||0)+dealt;
      state.log.push({type:'gymCounter',side:defenderSide,damage:dealt});
    }
  }
  function maxHp(state,side,slot){const extra=slot.cardId==='gym2-97'?10*Number(slot.energy?.Psychic||0):slot.cardId==='gym2-10'&&slot.gym2GiantGrowth&&state.sides[side].active===slot?40:0;return Math.max(1,Number(data.cardById(slot.cardId).hp||0)+extra+effects.modifierAmount(state,side,slot,'maxHp',data.cardById));}
  function triggerAbilities(state,event,side,onlySource,eventData){
    const ss=state.sides[side],meta=eventData||{};
    if(event==='evolved'&&state.stadium?.cardId==='gym2-123'&&onlySource&&data.cardById(onlySource.cardId)?.name?.startsWith("Giovanni's"))onlySource.damage=Math.max(0,Number(onlySource.damage||0)-20);
    for(const source of [ss.active,...ss.bench].filter(Boolean)){if(onlySource&&source!==onlySource)continue;if(effects.abilitiesSuppressed(state,side,source,data.cardById)||Number(state.sides[side]?.gym2PowerLockUntil||0)>=state.turnNumber)continue;
      for(const ability of abilitiesFor(data.cardById(source.cardId))){if(abilityBlockedByStatus(ability,source)||ability.type!=='triggered'||ability.event!==event||ability.activeOnly&&ss.active!==source||ability.benchOnly&&ss.active===source)continue;if(event==='endTurn'){const ownersTurn=state.activeSide===side,turn=ability.turn||'owner';if(turn==='owner'&&!ownersTurn||turn==='opponent'&&ownersTurn)continue;}if(ability.opponentAttackOnly&&!(meta.source?.attack&&meta.source.side===(side==='player'?'opponent':'player')))continue;if(ability.energyType&&ability.energyType!==meta.energyType)continue;if(ability.fromHandOnly&&!meta.fromHand)continue;if(ability.firstTurnOnly&&ss.turnCount!==1)continue;
        effects.applyEffect(ability.effect,{...effectContext(state,side,{},source),isAbility:true,eventData:meta});state.log.push({type:'ability',side,cardId:source.cardId,ability:ability.name,event});
      }
    }
  }

  function triggerPersistent(state,event,side,onlySource,eventData){
    const ss=state.sides[side],meta=eventData||{};
    for(const source of [ss.active,...ss.bench].filter(Boolean)){if(onlySource&&source!==onlySource)continue;for(const tool of toolsOf(source)){const ctx={...effectContext(state,side,{},source),eventData:meta,sourceTool:tool};effects.applyPersistentEvent(data.cardById(tool.cardId)?.effect,event,ctx);}for(const ref of temporaryTrainersOf(source)){const ctx={...effectContext(state,side,{},source),eventData:meta,sourceTool:ref};effects.applyPersistentEvent(data.cardById(ref.cardId)?.effect,event,ctx);}}
    if(state.stadium){const source=ss.active||ss.bench[0];if(source){const ctx={...effectContext(state,side,{},source),eventData:meta};effects.applyPersistentEvent(data.cardById(state.stadium.cardId)?.effect,event,ctx);}}
  }
  function retreatCost(state,side){const slot=state.sides[side].active;
    if(state.format==='classic'&&slot?.cardId==='SNAPFLORIO-002'&&slot.lastDamageSource?.attack&&
       slot.lastDamageSource.side!==side&&Number(slot.lastDamageSource.turn)===Number(state.turnNumber)-1)return 0;const gym=data.cardById(state.stadium?.cardId)?.id,ownerName=data.cardById(slot.cardId)?.name||'';let stadiumCost=gym==='gym1-104'?1:gym==='gym1-108'&&ownerName.startsWith("Misty's")?-1:0;
    if(gym==='SNAPFLORIO-111'&&data.cardById(slot.cardId)?.stage==='Basic')stadiumCost-=1;if(data.cardById(slot.cardId)?.retreatZeroWithWater&&(Number(slot.energy?.Water||0)+(slot.specialEnergy||[]).reduce((n,r)=>n+Number(r.provides?.Water||data.cardById(r.cardId)?.effect?.provides?.Water||0),0))>=Number(data.cardById(slot.cardId)?.retreatWaterMinimum||1))return 0;
    return Math.max(0,Number(data.cardById(slot.cardId).retreat||0)+effects.modifierAmount(state,side,slot,'retreatCost',data.cardById)+stadiumCost);}
  function attackCost(state,side,attack){const slot=state.sides[side].active;let cost=effects.attackCostOverride(state,side,slot,attack,data.cardById)??attack.cost??'';
    if(state.format==='classic'&&state.stadium?.cardId==='SNAPFLORIO-120'&&data.cardById(slot.cardId)?.types?.some(t=>t==='Grass'||t==='Colorless')){
      const i=cost.lastIndexOf('C');if(i>=0)cost=cost.slice(0,i)+cost.slice(i+1);
    }
    const typed={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};for(const [symbol,name] of Object.entries(typed)){let remove=Math.max(0,-Math.floor(effects.modifierAmount(state,side,slot,'attackCost'+name,data.cardById)));for(let i=cost.length-1;i>=0&&remove;i--)if(cost[i]===symbol){cost=cost.slice(0,i)+cost.slice(i+1);remove--;}}const amount=effects.modifierAmount(state,side,slot,'attackCost',data.cardById);if(amount>=0)return cost+'C'.repeat(Math.floor(amount));let remove=-Math.floor(amount);for(let i=cost.length-1;i>=0&&remove;i--)if(cost[i]==='C'){cost=cost.slice(0,i)+cost.slice(i+1);remove--;}return cost;}
  function energyValues(state,side,slot){const values={};for(const type of Object.keys(slot?.energy||{})){
    const mult=effects.modifierAmount(state,side,slot,'energyMultiplier',data.cardById);
    const meg=state.format==='classic'&&type==='Grass'&&data.cardById(slot?.cardId)?.types?.includes('Grass')&&pokemonOn(state.sides[side]).some(p=>p.cardId==='neo1-11'&&!effects.abilitiesSuppressed(state,side,p,data.cardById)&&!p.conditions?.sleep&&!p.conditions?.confusion&&!p.conditions?.paralysis)?2:1;
    values[type]=Math.max(1,(type==='Grass'?mult||1:1)*meg);
  }return values;}

  function specialEnergyProvides(ref){if(ref?.provides&&typeof ref.provides==='object')return ref.provides;const card=data.cardById(ref?.cardId),provides=card?.specialEnergy?card.effect?.provides:null;return provides&&typeof provides==='object'?provides:{};}
  function effectiveEnergy(state,side,slot){const next={...(slot?.energy||{})},values=energyValues(state,side,slot);for(const [type,n] of Object.entries(next))next[type]=Number(n||0)*Number(values[type]||1);for(const ref of slot?.specialEnergy||[])for(const [type,n] of Object.entries(specialEnergyProvides(ref)))next[type]=Number(next[type]||0)+Number(n||0);if(slot?.cardId==='gym1-47'){const count=Object.values(next).reduce((n,x)=>n+Number(x||0),0);return {Grass:count};}const override=slot?.energyTypeOverride;if(override&&(override.expiresTurn==null||state.turnNumber<=override.expiresTurn)){const total=Object.values(next).reduce((a,b)=>a+Number(b||0),0);return {[override.type]:total};}return next;}
  function spendRetreatEnergy(state,side,slot,cost){
    let remaining=Math.max(0,Number(cost||0)),generated={...(slot.energy||{})},special=(slot.specialEnergy||[]).slice(),discardSpecial=[];
    const values=energyValues(state,side,slot),basicTotal=Object.entries(generated).reduce((sum,[type,n])=>sum+Number(n||0)*Number(values[type]||1),0);
    if(basicTotal>=remaining){const paid=effects.spendGenericEnergyWithValue(generated,remaining,values);return paid?{energy:paid,specialEnergy:special,discardSpecial}:null;}
    remaining-=basicTotal;generated={};
    while(remaining>0&&special.length){const ref=special.shift(),value=Object.values(specialEnergyProvides(ref)).reduce((a,b)=>a+Number(b||0),0)||1;discardSpecial.push(ref);remaining-=value;}
    return remaining<=0?{energy:generated,specialEnergy:special,discardSpecial}:null;
  }
  function abilitiesFor(card){return (card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability]).filter(Boolean);}
  function abilityBlockedByStatus(ability,slot){if(!ability?.disabledByStatus||!slot)return false;const c=slot.conditions||{};return !!(c.sleep||c.confusion||c.paralysis);}
  function trainerType(card){return card.trainerType||card.subtype||'Item';}
  function rareCandyMatches(stage2,basic){
    if(!stage2||stage2.kind!=='pokemon'||stage2.stage!=='Stage 2'||!basic||basic.kind!=='pokemon'||basic.stage!=='Basic')return false;
    return data.CARDS.some(stage1=>stage1?.kind==='pokemon'&&stage1.name===stage2.evolvesFrom&&stage1.evolvesFrom===basic.name);
  }
  function effectChoices(effect,ctx){return effects.supportsEffect(effect)?effects.choicesForEffect(effect,ctx):[];}

  function energyCostLabel(cost){const names={...effects.ENERGY_CODE,C:'Colourless'},counts={};for(const c of cost||'')counts[c]=(counts[c]||0)+1;return Object.entries(counts).map(([c,n])=>`${n} ${names[c]||c}`).join(' + ')||'No Energy';}
  function attackHasRandom(effect){if(!effect||typeof effect!=='object')return false;if(['coinFlip','coinDamage','coinUntilTails'].includes(effect.type))return true;if(Array.isArray(effect.effects)&&effect.effects.some(attackHasRandom))return true;return ['heads','tails','effect'].some(key=>attackHasRandom(effect[key]));}
  function attackOptions(state,side){
    const slot=state?.sides?.[side]?.active,current=data.cardById(slot?.cardId);if(!slot||!current)return[];
    const out=(current.attacks||[]).map((attack,attackIndex)=>({cardId:current.id,attackIndex,attack,previous:false}));
    if(effects.canUsePreviousEvolutionAttacks?.(state,side,slot,data.cardById))for(const cardId of (slot.stack||[]).slice(0,-1)){const card=data.cardById(cardId);for(const [attackIndex,attack] of (card?.attacks||[]).entries())out.push({cardId,attackIndex,attack,previous:true});}
    if(current.id==='gym2-16'&&!effects.abilitiesSuppressed(state,side,slot,data.cardById)&&!(slot.conditions?.sleep||slot.conditions?.confusion||slot.conditions?.paralysis)){
      const seen=new Set(out.map(x=>x.cardId+':'+x.attackIndex));
      for(const p of [state.sides[side].active,...state.sides[side].bench].filter(Boolean)){
        if(!data.cardById(p.cardId)?.types?.includes('Psychic'))continue;
        const c=data.cardById(p.cardId);for(const [attackIndex,attack] of (c.attacks||[]).entries())if(!seen.has(c.id+':'+attackIndex)){seen.add(c.id+':'+attackIndex);out.push({cardId:c.id,attackIndex,attack,previous:false,borrowed:true});}
      }
    }
    return out;
  }
  function attackDamagePreview(state,side,attackIndex,attackCardId){
    const source=state?.sides?.[side]?.active,attack=data.cardById(attackCardId||source?.cardId)?.attacks?.[attackIndex];
    if(!source||!attack)return {damage:0,text:'0',variable:false};
    if(attackHasRandom(attack.effect))return {damage:Math.max(0,Number(attack.damage)||0),text:String(attack.damageText??attack.damage??0),variable:true};
    const snapshot=publicSnapshot(state),foeSide=side==='player'?'opponent':'player',attacker=snapshot.sides[side].active,context={...effectContext(snapshot,side,{},attacker),isAttack:true};
    const result=effects.resolveAttack(attack,context),defender=result.damageTarget===undefined?snapshot.sides[foeSide].active:result.damageTarget,isActive=defender===snapshot.sides[foeSide].active;
    let damage=Math.max(0,Number(result.damage)||0);if(isActive&&damage>0)damage+=effects.modifierAmount(snapshot,side,attacker,'attackDamage',data.cardById);
    return {damage:Math.max(0,damage),text:String(Math.max(0,damage)),variable:false};
  }
  function attackAvailability(state,side,attackIndex,attackCardId){
    const s=state.sides[side],slot=s?.active,sourceCardId=attackCardId||slot?.cardId,attack=data.cardById(sourceCardId)?.attacks?.[attackIndex];
    if(!attack)return {usable:false,cost:'',reason:'No attack in this position.',actions:[]};
    const cost=attackCost(state,side,attack),actions=legalActions(state,side).filter(a=>a.type==='attack'&&a.attackIndex===attackIndex&&(a.attackCardId||slot.cardId)===sourceCardId);
    const attached=Object.entries(slot.energy||{}).filter(([,n])=>n>0).map(([t,n])=>`${n} ${t}`).join(' + ')||'none';
    let reason=actions.length?'Ready':!effects.canPayCost(effectiveEnergy(state,side,slot),cost)?`Needs ${energyCostLabel(cost)}. Attached: ${attached}.`:effects.isLocked(state,slot,'attack',attack.name)?'This attack is restricted this turn.':state.phase!=='battle'||state.activeSide!==side?'Not your attack turn.':slot.conditions?.sleep?'Asleep.':slot.conditions?.paralysis?'Paralyzed.':'No legal attack target.';
    return {usable:actions.length>0,cost,reason,actions};
  }
  function legalActions(state, side){
    effects.applyContinuousRules?.(state,data.cardById);
    if (!state) return [];
    if(state.lentalDamOverflow&&state.phase==='battle'&&checkNarrowGymOverflow(state))return effectChoiceActions(state,side);
    if (state.phase === 'setup') return setupActions(state,side);
    if (state.phase === 'effectChoice') return effectChoiceActions(state,side);
    if (state.phase === 'promote') {
      if (state.promotionSide !== side) return [];
      normalizeBenchSlots(state.sides[side]);
      return state.sides[side].bench.filter(Boolean).map(slot=>({type:'promote',benchIndex:Number(slot.benchSlot)}));
    }
    if (state.phase !== 'battle' || state.activeSide !== side) return [];
    const s = state.sides[side];
    normalizeBenchSlots(s);
    const actions = [];
    if (s.bench.length < maxBenchSize(s)){
      const empty=emptyBenchSlots(s);
      s.hand.forEach((ref,handIndex)=>{
        const card = data.cardById(ref.cardId);
        if (card && card.kind === 'pokemon' && card.stage === 'Basic' && card.battleEnabled){
          empty.forEach(benchIndex=>actions.push({type:'bench',handIndex,cardId:card.id,benchIndex}));
        }
      });
    }
    {const evolutionLocked=effects.isActionLocked(state,side,'Evolution',data.cardById),activeEvolutionLocked=effects.isActionLocked(state,side,'EvolutionActive',data.cardById);if(!evolutionLocked)actions.push(...evolutionActions(state,side).filter(x=>!activeEvolutionLocked||x.target!=='active'));}
    s.hand.forEach((ref,handIndex)=>{
      const card = data.cardById(ref.cardId);
      if(!card||card.kind!=='trainer'||!card.battleEnabled)return;
      const type=trainerType(card),base={type:'trainer',handIndex,cardId:card.id};if(effects.isActionLocked(state,side,'Trainer',data.cardById)||effects.isActionLocked(state,side,type,data.cardById))return;
      if(card.effect?.type==='playFossil'){for(const benchIndex of emptyBenchSlots(s))actions.push({...base,target:'bench',benchIndex});return;}
      if(card.effect?.type==='rareCandy'){
        if(s.turnCount<=1)return;
        const stage2Refs=s.hand.map((candidate,evolutionHandIndex)=>({candidate,evolutionHandIndex,card:data.cardById(candidate.cardId)})).filter(x=>x.evolutionHandIndex!==handIndex&&x.card?.battleEnabled&&x.card.kind==='pokemon'&&x.card.stage==='Stage 2');
        const targets=[];if(s.active)targets.push({target:'active',slot:s.active});for(const slot of s.bench)if(slot)targets.push({target:'bench',benchIndex:Number(slot.benchSlot),slot});
        for(const evo of stage2Refs)for(const target of targets){const basic=data.cardById(target.slot.cardId);if(target.slot.playedOnSideTurn<s.turnCount&&rareCandyMatches(evo.card,basic))actions.push({...base,target:target.target,benchIndex:target.benchIndex,evolutionCardId:evo.card.id});}
        return;
      }
      if(state.format==='classic'&&state.stadium?.cardId==='gym1-103'&&['Energy Removal','Super Energy Removal'].includes(card.name)&&s.hand.length<3)return;
      if(type==='Supporter'&&s.supporterUsed)return;
      if(state.format==='classic'&&s.neoTrainerLockTurn===state.turnNumber)return;
      if(state.format==='classic'&&neoTrapActive(state,side,s.active,'switch')&&['Switch','Double Gust','Super Scoop Up'].includes(card.name))return;
      if(type==='AttachedTrainer'){
        const valid=slot=>!(card.id==='gym2-101'||card.id==='gym2-115') || (card.id==='gym2-101'&&data.cardById(slot.cardId)?.name?.startsWith("Brock's")) || (card.id==='gym2-115'&&data.cardById(slot.cardId)?.name?.startsWith("Koga's"));
        if(s.active&&valid(s.active))actions.push({...base,target:'active'});
        if(card.id!=='gym2-115')for(const slot of s.bench)if(slot&&valid(slot))actions.push({...base,target:'bench',benchIndex:Number(slot.benchSlot)});
      }else if(type==='Tool'){
        if(!effects.supportsEffect(card.effect)||!effects.supportsEffect(card.onAttach))return;
        if(s.active&&toolsOf(s.active).length<effects.toolCapacity(state,side,s.active,data.cardById))actions.push({...base,target:'active'});
        for(const slot of s.bench)if(toolsOf(slot).length<effects.toolCapacity(state,side,slot,data.cardById))actions.push({...base,target:'bench',benchIndex:Number(slot.benchSlot)});
      }else if(type==='Stadium'){
        if(!s.stadiumUsed&&effects.supportsEffect(card.effect)&&(!state.stadium||data.cardById(state.stadium.cardId).name!==card.name))actions.push(base);
      }else for(const target of effectChoices(card.effect,effectContext(state,side)))actions.push({...base,...target});
    });
    // Classic's Energy Zone is the one-per-turn placement. Special Energy
    // cards are extra attachments and can be stacked before or after it.
    if(state.format==='classic'){s.hand.forEach((ref,handIndex)=>{const card=data.cardById(ref.cardId);if(!(card?.specialEnergy||card?.basicEnergy)||card.battleEnabled===false&& !card.basicEnergy)return;if(card?.specialEnergy&&effects.isActionLocked(state,side,'SpecialEnergy',data.cardById))return;if(card.basicEnergy&&s.energyUsed&&!ref.zoneGenerated)return;if(s.active&&!s.active.gymEnergyLock)actions.push({type:'attachSpecial',handIndex,cardId:card.id,target:'active'});for(const slot of s.bench)if(slot&&!slot.gymEnergyLock)actions.push({type:'attachSpecial',handIndex,cardId:card.id,target:'bench',benchIndex:Number(slot.benchSlot)});});}
    if(state.stadium){const stadium=data.cardById(state.stadium.cardId),actionEffect=stadium?.effect?.type==='stadiumAction'?stadium.effect.effect:null,used=s.stadiumActionUsedTurn===state.turnNumber&&s.stadiumActionUsedUid===state.stadium.uid;if(actionEffect&&!used&&effectChoices(actionEffect,effectContext(state,side)).length)actions.push({type:'stadiumAction',cardId:stadium.id});}
    if (s.energyAvailable && !s.energyUsed){
      if (s.active&&!s.active.gymEnergyLock&&!effects.isActionLocked(state,side,'EnergyActive',data.cardById)) actions.push({type:'attach',target:'active'});
      s.bench.forEach(slot=>{if(slot&&!slot.gymEnergyLock)actions.push({type:'attach',target:'bench',benchIndex:Number(slot.benchSlot)});});
    }
    const conditions=s.active?.conditions||{};
    if (!s.retreated && s.active && s.bench.length&&(s.active.cardId==='SNAPFLORIO-073'||!neoTrapActive(state,side,s.active,'retreat'))&&!conditions.sleep&&!conditions.paralysis&&(s.active.cardId==='SNAPFLORIO-073'||!effects.isLocked(state,s.active,'retreat'))&&data.cardById(s.active.cardId).effect?.type!=='playFossil'){
      if (effects.totalEnergy(effectiveEnergy(state,side,s.active)) >= retreatCost(state,side)){
        s.bench.forEach(slot=>{if(slot)actions.push({type:'retreat',benchIndex:Number(slot.benchSlot)});});
      }
    }
    for(const source of [s.active,...s.bench].filter(Boolean)){
      const sourceCard=data.cardById(source.cardId);if(effects.abilitiesSuppressed(state,side,source,data.cardById))continue;
      abilitiesFor(sourceCard).forEach((ability,abilityIndex)=>{
        if(abilityBlockedByStatus(ability,source)||ability.type==='passive'||ability.type==='triggered'||ability.activeOnly&&source!==s.active||ability.benchOnly&&source===s.active)return;
        if(ability.vstarPower&&s.vstarPowerUsed)return;
        const used=(s.abilityUsed||{})[source.uid+':'+abilityIndex];if(ability.oncePerTurn!==false&&used===s.turnCount)return;
        if(ability.lentalSharedOnce==='scavenge'&&s.lentalScavengeUsedTurn===s.turnCount)return;
        const base={type:'ability',cardId:source.cardId,abilityIndex,target:source===s.active?'active':'bench'};if(source!==s.active)base.benchIndex=Number(source.benchSlot);
        for(const target of effectChoices(ability.effect,effectContext(state,side,{},source))){const a={...base};if(target.target)a.effectTarget=target.target;if(target.benchIndex!=null)a.effectBenchIndex=target.benchIndex;actions.push(a);}
      });
    }
    if (s.active&&!conditions.paralysis){
      for(const entry of attackOptions(state,side)){
        const {cardId:attackCardId,attackIndex,attack}=entry;
        if ((attack.gxAttack||/\bGX\b/i.test(attack.name||''))&&s.gxAttackUsed)continue;
        if(attack.vstarPower&&s.vstarPowerUsed)continue;
        if(attack.requiresAsleep&&!conditions.sleep)continue;
        if(conditions.sleep&&!attack.allowAsleep)continue;
        if (!(s.active.gym2UsedAttacks?.[attack.name]) && !(attack.name==='Bubbles'&&s.active.gym2BubblesLockTurn===state.turnNumber) && !(attack.name==='Earthdrill'&&s.active.cardId==='gym2-22'&&s.active.gym2LieLowTurn!==state.turnNumber-2) && effects.passiveAttackAllowed(state,side,s.active,data.cardById)&&!effects.isLocked(state,s.active,'attack',attack.name)&&!neoAttackLocked(state,side,s.active,attack.name)&&effects.canPayCost(effectiveEnergy(state,side,s.active),attackCost(state,side,attack))){
          const choices=effectChoices(attack.effect,{...effectContext(state,side),isAttack:true,attack});
          // Fire Spin's two-Energy use cost used to create one *attack* action
          // per attached Energy type. That produced duplicate Fire Spin choices.
          // Classic resolves this use cost as one attack, discarding two Energy
          // in the effect resolver's normal deterministic order.
          const automaticCost=state.format==='classic'&&attack.effect?.type==='discardEnergyCard'&&attack.effect?.target==='self'&&attack.effect?.useCost;
          for(const target of automaticCost?(choices.length?[{}]:[]):choices)actions.push({type:'attack',attackIndex,attackCardId,cardId:s.active.cardId,...target});
        }
      }
    }
    actions.push({type:'endTurn'});
    return actions;
  }

  function actionMatches(legal, action){
    if (!legal || !action || legal.type !== action.type) return false;
    const keys = ['handIndex','cardId','target','benchIndex','attackIndex','attackCardId','abilityIndex','effectTarget','effectBenchIndex','evolutionCardId','choiceTarget','choiceBenchIndex','choiceHandIndex','choiceDiscardIndex','choiceDeckIndex','choiceCardId','choiceAttackIndex','choiceToolIndex','choiceOption','choiceSkip','effectEnergyType','effectSpecialEnergyUid','effectSelection'];
    return keys.every(key => action[key] == null || legal[key] === action[key]);
  }

  function finish(state,winner,reason){
    state.phase = 'finished'; state.winner = winner; state.reason = reason;
    state.log.push({type:'finish',winner,reason,turnNumber:state.turnNumber});
  }

  function advanceTurn(state){
    const maxTurns=state.format==='classic'?100:50;
    if(state.turnNumber>=maxTurns){
      if(state.format==='classic'){
        // A longer cap keeps stalled hybrid matches finite; a timeout is
        // decided by Prize progress instead of arbitrarily favouring the CPU.
        const ours=Number(state.sides.player.prizesTaken||0),theirs=Number(state.sides.opponent.prizesTaken||0);
        finish(state,ours===theirs?'draw':ours>theirs?'player':'opponent','turn-limit');
      }else finish(state,'opponent','turn-limit');
      return;
    }
    const ended=state.sides[state.activeSide];ended.pointsGainedLastTurn=Number(ended.pointsGainedThisTurn||0);ended.pointsGainedThisTurn=0;
    state.activeSide=state.activeSide==='player'?'opponent':'player';
    state.turnNumber+=1;
    state.modifiers=(state.modifiers||[]).filter(m=>m.expiresTurn==null||m.expiresTurn>=state.turnNumber);
    beginTurn(state,state.activeSide);
  }

  function checkup(state){
    effects.applyContinuousRules?.(state,data.cardById);
    for(const side of [state.activeSide,state.activeSide==='player'?'opponent':'player'])triggerAbilities(state,'checkup',side);
    const first=state.activeSide,second=first==='player'?'opponent':'player';
    for(const side of [first,second])neoToolCheck(state,side);
    if(state.format==='classic')for(const side of [first,second])for(const slot of pokemonOn(state.sides[side]))if(slot.neoChar){
      const heads=random(state)<.5;state.log.push({type:'coin',side,reason:'Neo Char',heads,results:[heads]});if(!heads)slot.damage=Number(slot.damage||0)+20;
    }
    for(const side of [first,second]){
      const slot=state.sides[side].active;if(!slot)continue;
      const c=slot.conditions||{};
      if(slot.gym2ShapeshiftSource&&(c.sleep||c.confusion||c.paralysis))effects.revertShapeshift(state,slot);
      if(c.poison){const base=typeof c.poison==='object'?Number(c.poison.amount??10):10,amount=Math.max(0,base+effects.modifierAmount(state,side,slot,'poisonDamageBonus',data.cardById));slot.damage+=amount;state.log.push({type:'statusDamage',side,status:'poison',amount});}
      if(c.burn){slot.damage+=20;state.log.push({type:'statusDamage',side,status:'burn',amount:20});const heads=random(state)<0.5;state.log.push({type:'coin',side,heads,status:'burn',results:[heads]});if(heads)delete c.burn;}
      if(c.sleep){const coins=state.format==='classic'&&state.stadium?.cardId==='SNAPFLORIO-109'?2:typeof c.sleep==='object'?Math.max(1,Number(c.sleep.recoveryCoins||1)):1;let allHeads=true;for(let i=0;i<coins;i++){const heads=random(state)<0.5;state.log.push({type:'coin',side,heads,status:'sleep',results:[heads]});if(!heads)allHeads=false;}if(allHeads)delete c.sleep;}
      if(c.paralysis&&side===state.activeSide&&Number(c.paralysis.appliedTurn??-1)<state.turnNumber)delete c.paralysis;
    }
  }

  function finishRepeatAttack(state){
    const pending=state.pendingRepeatAttack;if(!pending)return false;
    const side=pending.side,foeSide=side==='player'?'opponent':'player',ss=state.sides[side],foe=state.sides[foeSide];
    const attacker=[ss.active,...ss.bench].find(x=>x&&x.uid===pending.sourceUid),defender=foe.active;
    state.pendingRepeatAttack=null;
    if(!attacker||!defender){if(state.phase==='battle')endTurn(state);return false;}
    const attackName=pending.attackName||'Repeated attack';let damage=Math.max(0,Number(pending.amount||0));
    damage+=effects.modifierAmount(state,side,attacker,'attackDamage',data.cardById)+effects.modifierAmount(state,side,attacker,'attackDamageAllTargets',data.cardById)+effects.attackSpecificBonus(attacker,attackName,state.turnNumber);
    for(const boost of attacker.nextAttackBonuses||[])if(Number(boost.turn)===state.turnNumber&&boost.attackName===attackName)damage+=Number(boost.amount||0);
    damage+=effects.modifierAmount(state,foeSide,defender,'damageTaken',data.cardById);
    damage=effects.attackDamageWithState(state,side,attacker,foeSide,defender,damage,data.cardById);
    let guard=effects.attackIsPrevented(state,foeSide,defender,attacker,data.cardById);if(guard?.maxDamage!=null&&damage>Number(guard.maxDamage))guard=null;if(guard?.minDamage!=null&&Math.max(0,damage-effects.modifierAmount(state,foeSide,defender,'damageReduction',data.cardById))<Number(guard.minDamage))guard=null;const preGuardDamage=damage;if(guard?.firstDamage&&preGuardDamage>0)effects.consumeDamageGuard(defender,'firstDamage');
    damage=guard?0:Math.max(0,damage-effects.modifierAmount(state,foeSide,defender,'damageReduction',data.cardById));
    if(damage>0){const coinGuard=effects.findPassiveRule(state,foeSide,defender,'coinDamageGuard',data.cardById);if(coinGuard){const heads=random(state)<0.5;state.log.push({type:'coin',side:foeSide,heads,reason:'coinDamageGuard',results:[heads]});if(heads)damage=coinGuard.preventAll?0:Math.max(0,damage-Number(coinGuard.reduction||0));}}
    if(state.format==='classic'&&damage>0&&defender===state.sides[foeSide].active){
      const refs=[defender.tool,...(defender.extraTools||[])].filter(Boolean),fruit=refs.find(ref=>ref.cardId==='SNAPFLORIO-115');
      if(fruit){if(defender.tool?.uid===fruit.uid)defender.tool=defender.extraTools?.shift()||null;
        else defender.extraTools=(defender.extraTools||[]).filter(ref=>ref.uid!==fruit.uid);
        state.sides[foeSide].discard.push(fruit);damage=0;
        state.log.push({type:'toolGuard',side:foeSide,toolId:fruit.cardId,prevented:true});}
    }
    defender.damage=Number(defender.damage||0)+damage;if(damage>0)effects.florioReactToAttackDamage?.(state,foeSide,defender,side,attacker,damage,data.cardById,random);if(damage>0)defender.lastDamageSource={side,uid:attacker.uid,cardId:attacker.cardId,attack:true,turn:state.turnNumber};
    if(damage>0&&defender.retaliate&&(defender.retaliate.expiresTurn==null||state.turnNumber<=defender.retaliate.expiresTurn)){const amount=Number(defender.retaliate.amount||0);attacker.damage=Number(attacker.damage||0)+amount;state.log.push({type:'retaliate',side:foeSide,amount,cardId:defender.cardId});}
    state.log.push({type:'attack',side,cardId:attacker.cardId,attack:attackName,damage,target:'active',repeat:true});ss.lastAttackName=attackName;ss.lastAttackTurn=state.turnNumber;ss.attackCounts=ss.attackCounts||{};ss.attackCounts[attackName]=Number(ss.attackCounts[attackName]||0)+1;attacker.attackUseCount=Number(attacker.attackUseCount||0)+1;
    if(damage>0){triggerAbilities(state,'damagedByAttack',foeSide,defender);triggerPersistent(state,'damagedByAttack',foeSide,defender,{attacker,damage});}
    const paused=resolveKnockOut(state,'endTurn','attack');if(!paused&&state.phase==='battle')endTurn(state);return true;
  }

  function resumeAfterPromotion(state){
    const next=state.promotionQueue?.shift();
    if(next){state.phase='promote';state.promotionSide=next;return;}
    state.phase='battle';state.promotionSide=null;
    const resume=Object.prototype.hasOwnProperty.call(state,'pendingAfterPromotion')?state.pendingAfterPromotion:'endTurn';state.pendingAfterPromotion=null;
    if(resume==='endTurn')endTurn(state);else if(resume==='advanceTurn')advanceTurn(state);else if(resume==='repeatAttack')finishRepeatAttack(state);
  }

  function endTurn(state){
    if (state.phase !== 'battle') return;
    triggerAbilities(state,'endTurn','player');triggerAbilities(state,'endTurn','opponent');
    triggerPersistent(state,'endTurn','player');triggerPersistent(state,'endTurn','opponent');
    effects.resolveDelayedEffects?.(state,state.activeSide,data.cardById,(side,source)=>effectContext(state,side,{},source));
    if(state.format==='classic')for(const who of ['player','opponent']){
      const side=state.sides[who];for(const slot of pokemonOn(side)){
        for(const ref of slot.specialEnergy||[])if(ref.cardId==='neo1-104'&&!data.cardById(slot.cardId)?.types?.includes('Darkness')&&!/Dark/i.test(data.cardById(slot.cardId)?.name||''))slot.damage=Number(slot.damage||0)+10;
      }
    }
    for(const ownerSide of ['player','opponent'])for(const slot of [state.sides[ownerSide].active,...state.sides[ownerSide].bench].filter(Boolean)){const keep=[];for(const ref of temporaryTrainersOf(slot)){const card=data.cardById(ref.cardId),expire=card?.expires;const due=expire==='endOwnTurn'?state.activeSide===ownerSide:expire==='endOpponentTurn'?state.activeSide!==ownerSide&&Number(state.turnNumber)>Number(ref.attachedTurn):false;if(due)state.sides[ownerSide].discard.push(ref);else keep.push(ref);}slot.temporaryTrainers=keep;}
    if(state.format==='classic'){const side=state.activeSide,ss=state.sides[side],pending=ss.gymCharity; if(pending&&pending.turn===state.turnNumber){const target=[ss.active,...ss.bench].find(p=>p&&p.uid===pending.activeUid);if(target&&target.damage<maxHp(state,side,target)){const idx=ss.discard.findIndex(r=>r.uid===pending.uid);if(idx>=0)ss.hand.push(...ss.discard.splice(idx,1));}ss.gymCharity=null;}}
    checkup(state);
    if(!resolveKnockOut(state,'advanceTurn'))advanceTurn(state);
  }

  function attackResultSnapshot(slot){return {damage:Number(slot?.damage||0),conditions:JSON.parse(JSON.stringify(slot?.conditions||{})),energyCards:Object.values(slot?.energy||{}).reduce((n,x)=>n+Number(x||0),0)+(slot?.specialEnergy||[]).length,attackGate:slot?.attackGate?JSON.parse(JSON.stringify(slot.attackGate)):null,locks:JSON.parse(JSON.stringify(slot?.locks||[])),weaknessOverride:slot?.weaknessOverride??null,resistanceOverride:slot?.resistanceOverride??null};}
  function finalizeAttackResult(state){const pending=state.pendingAttackResult;if(!pending)return;delete state.pendingAttackResult;const ss=state.sides[pending.defenderSide],slot=[ss.active,...ss.bench].find(x=>x&&x.uid===pending.defenderUid);if(!slot)return;const after=attackResultSnapshot(slot),before=pending.before,changedConditions={};for(const [key,value] of Object.entries(after.conditions||{}))if(JSON.stringify(value)!==JSON.stringify(before.conditions?.[key]))changedConditions[key]=value;const beforeLocks=before.locks||[],afterLocks=after.locks||[];slot.lastAttackResult={turn:pending.turn,damage:Math.max(0,after.damage-before.damage),conditions:changedConditions,energyCardsDiscarded:Math.max(0,Number(before.energyCards||0)-Number(after.energyCards||0)),attackGate:JSON.stringify(after.attackGate)!==JSON.stringify(before.attackGate)?after.attackGate:null,locks:afterLocks.slice(beforeLocks.length),weaknessOverride:after.weaknessOverride!==before.weaknessOverride?after.weaknessOverride:null,resistanceOverride:after.resistanceOverride!==before.resistanceOverride?after.resistanceOverride:null};}

  function prizeValue(card){
    const explicit=Number(card?.prizeCards||card?.prizeValue||0);
    if(Number.isFinite(explicit)&&explicit>=1)return Math.max(1,Math.min(3,Math.floor(explicit)));
    if(/\b(?:TAG TEAM|VMAX)\b/i.test(card?.name||''))return 3;
    if(/\b(?:VSTAR|GX|V|ex)\b/i.test(card?.name||''))return 2;
    return 1;
  }
  function discardKnockedOut(s, slot, options){
    const keepTop=!!options?.keepTop,topIndex=slot.stack.length-1;
    s.energyDiscard=s.energyDiscard||{};for(const [type,n] of Object.entries(slot.energy||{}))if(Number(n)>0)s.energyDiscard[type]=Number(s.energyDiscard[type]||0)+Number(n||0);
    for (let i=slot.stack.length-1;i>=0;i--){if(keepTop&&i===topIndex)continue;s.discard.push({uid:`${slot.uid}-stack-${i}`,cardId:slot.stack[i]});}
    for(const tool of toolsOf(slot))s.discard.push(tool);
    for(const ref of temporaryTrainersOf(slot))s.discard.push(ref);
      for(const energy of slot.specialEnergy||[])neoRecycleSpecial(s,energy);
  }

  function resolveKnockOut(state,resume,cause){
    let any=false;
    while(true){
      const knocked=[];
      for(const side of ['player','opponent'])for(const slot of [state.sides[side].active,...state.sides[side].bench].filter(Boolean))if(Number(slot.damage||0)>=maxHp(state,side,slot))knocked.push({side,slot});
      if(!knocked.length)break;
      for(const {side,slot} of knocked){
        const s=state.sides[side],foeSide=side==='player'?'opponent':'player',foe=state.sides[foeSide],card=data.cardById(slot.cardId),source=slot.lastDamageSource;
        if(state.format==='classic'&&cause==='attack'&&source?.side===foeSide&&source?.attack){
          const band=toolsOf(slot).find(r=>r.cardId==='neo1-86');
          if(band){if(slot.tool?.uid===band.uid){slot.tool=null;if(slot.extraTools?.length)slot.tool=slot.extraTools.shift();}else slot.extraTools=(slot.extraTools||[]).filter(r=>r.uid!==band.uid);
            s.discard.push(band);const heads=random(state)<.5;state.log.push({type:'coin',side,heads,reason:'Neo Focus Band',results:[heads]});
            if(heads){slot.damage=Math.max(0,maxHp(state,side,slot)-10);continue;}
          }
        }
        const tempGuard=slot.koGuard&&(slot.koGuard.expiresTurn==null||state.turnNumber<=slot.koGuard.expiresTurn)?slot.koGuard:null,koGuard=tempGuard||effects.findPassiveRule(state,side,slot,'koGuard',data.cardById),guardEligible=!!koGuard&&(!koGuard.attackOnly||source?.attack&&source.side===foeSide);
        if(guardEligible){
          if(koGuard.mode==='surviveCoin'){const heads=random(state)<0.5;state.log.push({type:'coin',side,heads,reason:'koGuard',results:[heads]});if(heads){slot.damage=Math.max(0,maxHp(state,side,slot)-Number(koGuard.remainingHp||10));state.log.push({type:'koPrevented',side,cardId:card.id});continue;}}
          if(koGuard.mode==='survive'){slot.damage=Math.max(0,maxHp(state,side,slot)-Number(koGuard.remainingHp||10));state.log.push({type:'koPrevented',side,cardId:card.id});continue;}
        }
        const eventSource=cause==='attack'?source:null;
        if(!slot._koTriggersResolved){slot._koTriggersResolved=true;triggerAbilities(state,'knockedOut',side,slot,{source:eventSource});triggerPersistent(state,'knockedOut',side,slot,{source:eventSource});if(state.phase==='effectChoice'){state.pendingChoice.resume='knockout';state.pendingChoice.koResume=resume||null;state.pendingChoice.koCause=cause||null;return true;}}
        if(slot.destinyBond&&(slot.destinyBond.expiresTurn==null||state.turnNumber<=slot.destinyBond.expiresTurn)&&eventSource?.attack&&eventSource.side===foeSide){const bonded=[foe.active,...foe.bench].find(x=>x&&x.uid===eventSource.uid);if(bonded)bonded.damage=Math.max(Number(bonded.damage||0),maxHp(state,foeSide,bonded));}
        any=true;const countsAsKnockout=card?.effect?.countsAsKnockout!==false&&card?.countsAsKnockout!==false;if(countsAsKnockout){if(Number(s.lastKnockoutTurn)!==Number(state.turnNumber))s.lastKnockedOutCardIds=[];s.lastKnockoutTurn=state.turnNumber;s.lastKnockedOutCardIds.push(card.id);s.knockoutsTaken=Number(s.knockoutsTaken||0)+1;}
        if(guardEligible&&koGuard.mode==='returnToHand'){
          const top=slot.stack[slot.stack.length-1];for(let i=slot.stack.length-2;i>=0;i--)s.discard.push({uid:`${slot.uid}-stack-${i}`,cardId:slot.stack[i]});for(const tool of toolsOf(slot))s.discard.push(tool);for(const ref of temporaryTrainersOf(slot))s.discard.push(ref);for(const energy of slot.specialEnergy||[])s.discard.push(energy);if(top&&(s.handLimit==null||s.hand.length<s.handLimit))s.hand.push({uid:`${slot.uid}-rescued`,cardId:top});else if(top)s.discard.push({uid:`${slot.uid}-rescued`,cardId:top});
        }else{const transform=slot.transformOnKO,target=transform&&pokemonOn(s).find(x=>x&&x.uid===transform.targetUid&&x!==slot);discardKnockedOut(s,slot,{keepTop:!!(transform&&target)});if(transform&&target){target.specialEnergy=target.specialEnergy||[];target.specialEnergy.push({uid:`${slot.uid}-transformed-energy`,cardId:card.id,provides:{...transform.provides},transformedPokemon:true});state.log.push({type:'transformEnergy',side,cardId:card.id,targetCardId:target.cardId,provides:{...transform.provides}});}}if(slot===s.active)s.active=null;else s.bench.splice(s.bench.indexOf(slot),1);
        const attacker=source&&[foe.active,...foe.bench].find(x=>x&&x.uid===source.uid);let points=0;
        if(state.rules?.winMode==='prizes'){
          const awardsPrize=card?.effect?.noPrize!==true&&card?.noPrize!==true;
          let awarded=0;const prizeCount=awardsPrize?prizeValue(card):0;
          for(let i=0;i<prizeCount;i++){
            const prize=foe.prizes.shift();if(!prize)break;
            foe.hand.push(prize);awarded++;foe.prizesTaken=Number(foe.prizesTaken||0)+1;
            state.log.push({type:'prize',side:foeSide,cardId:prize.cardId,remaining:foe.prizes.length,taken:foe.prizesTaken});
          }
          state.log.push({type:'ko',side,cardId:card.id,prizesTaken:foe.prizesTaken,awarded});
        }else{
          points=Math.max(1,Number(card.points||1));const pointBonuses=(foe.koPointBonuses||[]).filter(b=>(b.expiresTurn==null||state.turnNumber<=b.expiresTurn)&&(!b.attackerFilter||attacker&&effects.matchesFilter(data.cardById(attacker.cardId),b.attackerFilter,attacker)));for(const bonus of pointBonuses)points+=Number(bonus.amount||0);if(guardEligible&&koGuard.mode==='noPointsCoin'){const heads=random(state)<0.5;state.log.push({type:'coin',side,heads,reason:'noPointsKo',results:[heads]});if(heads)points=0;}foe.points+=points;foe.pointsGainedThisTurn=Number(foe.pointsGainedThisTurn||0)+points;state.log.push({type:'ko',side,cardId:card.id,points:foe.points,awarded:points});
        }
        if(attacker&&countsAsKnockout){triggerAbilities(state,'opponentKnockedOut',foeSide,attacker,{knockedOut:slot,points,prizes:Number(foe.prizesTaken||0)});triggerPersistent(state,'opponentKnockedOut',foeSide,attacker,{knockedOut:slot,points,prizes:Number(foe.prizesTaken||0)});}
      }
    }
    const p=state.sides.player,o=state.sides.opponent;
    if(state.rules?.winMode==='prizes'){
      const target=Math.max(1,Number(state.rules.prizeCount||5)),pPrize=Number(p.prizesTaken||0)>=target,oPrize=Number(o.prizesTaken||0)>=target;
      const pNoPokemon=!o.active&&!o.bench.length,oNoPokemon=!p.active&&!p.bench.length;
      const pw=Number(pPrize||pNoPokemon),ow=Number(oPrize||oNoPokemon);
      if(pw||ow){finish(state,pw===ow?'draw':pw>ow?'player':'opponent',pw===ow?'simultaneous-ko':pPrize||oPrize?'prizes':'no-pokemon');return true;}
    }else{
      const target=Math.max(1,Number(state.rules?.winPoints||3)),pw=Number(p.points>=target)+Number(!o.active&&!o.bench.length),ow=Number(o.points>=target)+Number(!p.active&&!p.bench.length);
      if(pw||ow){finish(state,pw===ow?'draw':pw>ow?'player':'opponent',pw===ow?'simultaneous-ko':(!p.active&&!p.bench.length||!o.active&&!o.bench.length)?'no-pokemon':'points');return true;}
    }
    const order=[state.activeSide,state.activeSide==='player'?'opponent':'player'];
    const needs=order.filter(side=>!state.sides[side].active&&state.sides[side].bench.length);
    if(needs.length){state.pendingAfterPromotion=resume||null;state.promotionQueue=needs;state.phase='promote';state.promotionSide=state.promotionQueue.shift();return true;}
    return false;
  }

  // LuckyDex Classic has three Bench spaces. Narrow Gym therefore limits
  // both sides to TWO (the printed four-slot rule otherwise has no effect).
  function narrowGymReturnToHand(state,side,benchIndex){
    const ss=state.sides[side],index=benchArrayIndex(ss,benchIndex);
    if(index<0)throw new Error('Choose a Benched Pokémon to return.');
    const [slot]=ss.bench.splice(index,1);
    if(state.lentalDamOverflow){
      discardKnockedOut(ss,slot);
      state.log.push({type:'lentalBenchDiscard',side,cardId:slot.cardId,benchIndex});
      ss.bench.sort((a,b)=>Number(a.benchSlot)-Number(b.benchSlot));
      ss.bench.forEach((pokemon,i)=>{pokemon.benchSlot=i;});
      return;
    }
    // Evolution cards and printed attachments go back to the player's hand;
    // generated Basic Energy returns to the separate Energy discard pool.
    for(const [i,cardId] of (slot.stack||[slot.cardId]).entries()){
      ss.hand.push({uid:`narrow-${slot.uid}-evo-${i}`,cardId});
    }
    for(const ref of [...(slot.specialEnergy||[]),...toolsOf(slot),...temporaryTrainersOf(slot)])ss.hand.push(ref);
    ss.energyDiscard=ss.energyDiscard||{};
    for(const [type,count] of Object.entries(slot.energy||{})){
      if(count>0)ss.energyDiscard[type]=Number(ss.energyDiscard[type]||0)+Number(count);
    }
    state.log.push({type:'narrowGymReturn',side,cardId:slot.cardId,benchIndex});
    // Keep the two remaining Pokémon on visible physical slots 0 and 1.
    ss.bench.sort((a,b)=>Number(a.benchSlot)-Number(b.benchSlot));
    ss.bench.forEach((pokemon,i)=>{pokemon.benchSlot=i;});
  }
  function checkNarrowGymOverflow(state){
    const narrow=state.stadium?.cardId==='gym1-124';
    if(!narrow&&!state.lentalDamOverflow)return false;
    const stadiumSide=state.stadium?.ownerSide||'player';
    const first=stadiumSide==='player'?'opponent':'player',second=stadiumSide;
    const side=[first,second].find(w=>state.sides[w].bench.length>maxBenchSize(state.sides[w]));
    if(!side){state.lentalDamOverflow=false;return false;}
    state.phase='effectChoice';state.choiceSide=side;
    state.pendingChoice={kind:'narrowGymReturn',special:'narrowGymReturn',side,originSide:stadiumSide,
      prompt:state.lentalDamOverflow?'Florio Dam left play: discard a Benched Pokémon until the new Bench limit is met.':'Narrow Gym: return a Benched Pokémon to your hand (maximum two).'};
    return true;
  }

  function playTrainer(state,side,action){
    const s=state.sides[side];const [ref]=s.hand.splice(action.handIndex,1);const card=data.cardById(ref.cardId),type=trainerType(card);if(state.format==='classic'&&state.stadium?.cardId==='gym1-103'&&['Energy Removal','Super Energy Removal'].includes(card.name)){for(let n=0;n<2;n++){const index=s.hand.length-1;if(index>=0)s.discard.push(...s.hand.splice(index,1));}}
    state.log.push({type:'trainer',side,cardId:card.id,target:action.target,benchIndex:action.benchIndex});
    if(card.effect?.type==='playFossil'){placeOnBench(s,makePokemonSlot(card.id,s.turnCount,ref.uid),action.benchIndex);return;}
    if(card.effect?.type==='rareCandy'){
      const evoIndex=s.hand.findIndex(candidate=>candidate.cardId===action.evolutionCardId);if(evoIndex<0)throw new Error('Rare Candy Stage 2 is no longer in hand.');
      const [evoRef]=s.hand.splice(evoIndex,1),target=slotForTarget(s,action.target,action.benchIndex);if(!target)throw new Error('Rare Candy target is no longer in play.');
      target.cardId=evoRef.cardId;target.stack.push(evoRef.cardId);effects.clearTemporaryEffects(state,target);target.playedOnSideTurn=s.turnCount;target.evolvedOnTurn=state.turnNumber;s.discard.push(ref);
      state.log.push({type:'evolve',side,cardId:evoRef.cardId,target:action.target,benchIndex:action.benchIndex,viaRareCandy:true});triggerAbilities(state,'evolved',side,target,{fromHand:true,viaRareCandy:true});resolveKnockOut(state,null);return;
    }
    if(state.format==='classic'&&state.stadium?.cardId==='gym2-102'&&type!=='Stadium'){
      const heads=random(state)<0.5;state.log.push({type:'coin',side,reason:'Chaos Gym',heads,results:[heads]});
      if(!heads){s.discard.push(ref);const foeSide=side==='player'?'opponent':'player',otherSide=state.sides[foeSide];
        // The opponent may perform the Trainer's effect if it is legal for
        // their board. Unattached Item effects can be taken over directly;
        // attached cards still require a legal Pokémon target.
        const transferable=!['AttachedTrainer','Tool'].includes(type);
        if(transferable&&otherSide.active){effects.applyEffect(card.effect,{...effectContext(state,foeSide,{trainerRef:ref},otherSide.active),trainerRef:ref});if(state.phase==='effectChoice')state.pendingChoice.resume='trainer';}
        return;
      }
    }
    if(state.format==='classic'&&type!=='Stadium'){
      const blockers=pokemonOn(state.sides[side==='player'?'opponent':'player']).filter(p=>p.cardId==='neo1-14'&&!effects.abilitiesSuppressed(state,side==='player'?'opponent':'player',p,data.cardById)&&!p.conditions?.sleep&&!p.conditions?.paralysis&&!p.conditions?.confusion);
      for(const blocker of blockers){const heads=random(state)<.5;state.log.push({type:'coin',side:side==='player'?'opponent':'player',reason:'Neo Mind Games',heads,results:[heads]});if(heads){s.deck.unshift(ref);return;}}
    }
    if(type==='Supporter')s.supporterUsed=true;
    if(type==='AttachedTrainer'){const target=slotForTarget(s,action.target,action.benchIndex);if(!target)throw new Error('Attached Trainer target is no longer in play.');target.temporaryTrainers=target.temporaryTrainers||[];target.temporaryTrainers.push({...ref,ownerSide:side,attachedTurn:state.turnNumber});resolveKnockOut(state,null);return;}
    if(type==='Tool'){const target=slotForTarget(s,action.target,action.benchIndex);attachTool(target,ref);const ctx=effectContext(state,side,action,target);effects.applyEffect(card.onAttach,ctx);effects.applyPersistentEvent(card.effect,'onAttach',ctx);resolveKnockOut(state,null);return;}
    if(type==='Stadium'){
      state.lentalDamOverflow=state.stadium?.cardId==='SNAPFLORIO-108';
      if(state.stadium)state.sides[state.stadium.ownerSide].discard.push({uid:state.stadium.uid,cardId:state.stadium.cardId});
      state.stadium={...ref,ownerSide:side};s.stadiumUsed=true;
      if(card.id==='SNAPFLORIO-104')for(const who of ['player','opponent'])for(const slot of [state.sides[who].active,...state.sides[who].bench].filter(Boolean))if(data.cardById(slot.cardId)?.types?.some(t=>t==='Grass'||t==='Psychic'))slot.conditions={};
      for(const which of ['player','opponent']){
        state.sides[which].benchLimit=card.id==='gym1-124'?2:card.id==='SNAPFLORIO-108'?5:3;
        normalizeBenchSlots(state.sides[which]);
      }
      if(checkNarrowGymOverflow(state))return;resolveKnockOut(state,null);return;
    }
    s.discard.push(ref);
    effects.applyEffect(card.effect,{...effectContext(state,side,{...action,trainerRef:ref}),trainerRef:ref});
    if(state.phase==='effectChoice'){state.pendingChoice.resume=state.pendingChoice.resume||'trainer';return;}
    resolveKnockOut(state,null);
  }

  function applyActionRaw(state, side, action){
    if (!state || !['setup','battle','promote','effectChoice'].includes(state.phase)) throw new Error('Battle is not active.');
    if (state.phase === 'battle' && state.activeSide !== side) throw new Error(`It is not ${side}'s turn.`);
    if (state.phase === 'effectChoice' && state.choiceSide !== side) throw new Error(`It is not ${side}'s choice.`);
    if (state.phase === 'setup' && state.setupSide !== side) throw new Error(`It is not ${side}'s setup.`);
    if (state.phase === 'promote' && state.promotionSide !== side) throw new Error(`It is not ${side}'s promotion.`);
    const legal = legalActions(state,side);
    const matched = legal.find(item => actionMatches(item,action));
    if (!matched){
      if (action && (action.type === 'attach'||(action.type==='attachSpecial'&&!data.cardById(action.cardId)?.specialEnergy)) && state.sides[side].energyUsed) throw new Error('Energy Zone can only be attached once per turn.');
      throw new Error(`Illegal Pocket action: ${action && action.type || 'unknown'}.`);
    }
    if(matched.type==='effectChoice'){
      const pending=state.pendingChoice;if(!pending)throw new Error('No pending effect choice.');
      if(pending.special==='narrowGymReturn'){
        narrowGymReturnToHand(state,side,matched.choiceBenchIndex);
        state.pendingChoice=null;state.choiceSide=null;state.phase='battle';
        if(!checkNarrowGymOverflow(state))resolveKnockOut(state,null);
        return state;
      }
      if(pending.special==='coinReroll'){
        if(Number(matched.choiceOption)===0){restoreState(state,pending.keepState);return state;}
        const snapshot=pending.snapshot,rngAfter=pending.rerollRngState,ownerSide=pending.rerollOwnerSide,scope=pending.rerollScope,actionSide=pending.actionSide,originalAction=pending.originalAction;
        restoreState(state,snapshot);state.rngState=rngAfter;const owner=state.sides[ownerSide];owner.coinRerollUsedTurn=owner.coinRerollUsedTurn||{};owner.coinRerollUsedTurn[scope]=state.turnNumber;
        return applyAction(state,actionSide,originalAction);
      }
      const originSide=pending.originSide,source=findSlotByUid(state,originSide,pending.sourceUid)||state.sides[originSide].active;
      const after=(pending.afterEffects||[]).slice(),resume=pending.resume,isAttack=!!pending.isAttack,koResume=pending.koResume,koCause=pending.koCause;
      state.pendingChoice=null;state.choiceSide=null;state.phase='battle';
      const ctx={...effectContext(state,originSide,{...matched,trainerRef:pending.trainerRef||null},source),trainerRef:pending.trainerRef||null,isAttack,resolvingChoice:true};
      effects.applyEffect(pending.effect,ctx);
      if(state.phase==='effectChoice'){state.pendingChoice.afterEffects=[...(state.pendingChoice.afterEffects||[]),...after];state.pendingChoice.resume=resume||state.pendingChoice.resume;state.pendingChoice.isAttack=isAttack||state.pendingChoice.isAttack;state.pendingChoice.koResume=koResume;state.pendingChoice.koCause=koCause;return state;}
      for(let i=0;i<after.length;i++){const afterCtx={...ctx,resolvingChoice:false};effects.applyEffect(after[i],afterCtx);if(state.phase==='effectChoice'){state.pendingChoice.afterEffects=[...(state.pendingChoice.afterEffects||[]),...after.slice(i+1)];state.pendingChoice.resume=resume||state.pendingChoice.resume;state.pendingChoice.isAttack=isAttack||state.pendingChoice.isAttack;state.pendingChoice.koResume=koResume;state.pendingChoice.koCause=koCause;return state;}}
      if(resume==='knockout'){const paused=resolveKnockOut(state,koResume,koCause);if(paused)return state;if(state.phase==='battle'){if(koResume==='endTurn')endTurn(state);else if(koResume==='advanceTurn')advanceTurn(state);}return state;}
      if(resume==='attack')finalizeAttackResult(state);
      const paused=resolveKnockOut(state,resume==='attack'?'endTurn':null,isAttack?'attack':null);if(paused)return state;
      if(resume==='attack'&&state.phase==='battle')endTurn(state);
      return state;
    }
    const s = state.sides[side];
    if (matched.type === 'promote'){
      const index=benchArrayIndex(s,matched.benchIndex);
      if(index<0)throw new Error('That Bench slot is empty.');
      const [incoming]=s.bench.splice(index,1);
      const fromBench=Number(incoming.benchSlot);
      incoming.benchSlot=null;
      incoming.movedToActiveTurn=state.turnNumber;
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
      const placed=placeOnBench(s,makePokemonSlot(ref.cardId,s.turnCount,ref.uid),matched.benchIndex);
      state.log.push({type:'bench',side,cardId:ref.cardId,benchIndex:matched.benchIndex});
      if(state.stadium?.cardId==='SNAPFLORIO-106'&&data.cardById(placed.cardId)?.stage==='Basic'){
        placed.damage=Number(placed.damage||0)+20;
        state.log.push({type:'stadiumDamage',side,cardId:placed.cardId,stadium:'SNAPFLORIO-106',amount:20});
      }
      if(state.stadium?.cardId==='gym2-119'){const heads=random(state)<0.5;state.log.push({type:'coin',side,reason:'Rocket Minefield Gym',heads,results:[heads]});if(!heads)placed.damage=Number(placed.damage||0)+20;}
      triggerAbilities(state,'benched',side,placed,{fromHand:true});
      if(state.stadium?.cardId==='SNAPFLORIO-106')resolveKnockOut(state,null);
      return state;
    }
    if (matched.type === 'evolve'){
      const [ref] = s.hand.splice(matched.handIndex,1);
      const target = slotForTarget(s,matched.target,matched.benchIndex);
      target.cardId = ref.cardId;
      target.stack.push(ref.cardId);
      effects.clearTemporaryEffects(state,target);
      target.playedOnSideTurn=s.turnCount;target.evolvedOnTurn=state.turnNumber;
      state.log.push({type:'evolve',side,cardId:ref.cardId,target:matched.target,benchIndex:matched.benchIndex});triggerAbilities(state,'evolved',side,target,{fromHand:true});
      resolveKnockOut(state,null);
      return state;
    }
    if (matched.type === 'trainer'){
      playTrainer(state,side,matched);
      return state;
    }
    if (matched.type === 'ability'){
      const source=slotForTarget(s,matched.target,matched.benchIndex),ability=abilitiesFor(data.cardById(source.cardId))[matched.abilityIndex||0];
      s.abilityUsed=s.abilityUsed||{};s.abilityUsed[source.uid+':'+(matched.abilityIndex||0)]=s.turnCount;
      if(ability.lentalSharedOnce==='scavenge')s.lentalScavengeUsedTurn=s.turnCount;
      if(ability.vstarPower)s.vstarPowerUsed=true;
      effects.applyEffect(ability.effect,{...effectContext(state,side,matched,source),isAbility:true});
      if(state.phase==='effectChoice')state.pendingChoice.resume=state.pendingChoice.resume||'ability';
      state.log.push({type:'ability',side,cardId:source.cardId,ability:ability.name,target:matched.effectTarget,benchIndex:matched.effectBenchIndex});
      if(state.phase!=='effectChoice')resolveKnockOut(state,null);
      return state;
    }
    if(matched.type==='stadiumAction'){const stadium=data.cardById(state.stadium?.cardId),effect=stadium?.effect?.type==='stadiumAction'?stadium.effect.effect:null;if(!effect)throw new Error('No Stadium action is available.');s.stadiumActionUsedTurn=state.turnNumber;s.stadiumActionUsedUid=state.stadium.uid;effects.applyEffect(effect,{...effectContext(state,side,matched),isStadium:true});if(state.phase==='effectChoice')state.pendingChoice.resume=state.pendingChoice.resume||'stadiumAction';else resolveKnockOut(state,null);state.log.push({type:'stadiumAction',side,cardId:stadium.id});return state;}
    if (matched.type === 'attachSpecial'){
      const target=slotForTarget(s,matched.target,matched.benchIndex),[ref]=s.hand.splice(matched.handIndex,1),card=data.cardById(ref?.cardId);
      if(!target||!ref||!(card?.specialEnergy||card?.basicEnergy))throw new Error('That Energy card attachment is no longer legal.');
      let provides={};if(card.basicEnergy){target.energy[card.subtype]=Number(target.energy[card.subtype]||0)+1;provides={[card.subtype]:1};}else{target.specialEnergy=target.specialEnergy||[];target.specialEnergy.push(ref);provides={...specialEnergyProvides(ref)};}if(card.basicEnergy&&!ref.zoneGenerated)s.energyUsed=true;
      state.log.push({type:'attachSpecial',side,target:matched.target,benchIndex:matched.benchIndex,cardId:target.cardId,energyCardId:card.id,provides});
      triggerAbilities(state,'energyAttached',side,target,{energyType:Object.keys(provides)[0]||'Colorless',fromZone:false,specialEnergy:!!card.specialEnergy});resolveKnockOut(state,null);return state;
    }
    if (matched.type === 'attach'){
      const target = slotForTarget(s,matched.target,matched.benchIndex);
      const type = s.energyType;
      target.energy[type] = Number(target.energy[type] || 0) + 1;
      s.energyUsed = true;
      state.log.push({type:'attach',side,target:matched.target,benchIndex:matched.benchIndex,cardId:target.cardId,energyType:type});triggerAbilities(state,'energyAttached',side,target,{energyType:type,fromZone:true});triggerAbilities(state,'opponentEnergyAttached',side==='player'?'opponent':'player',null,{target,energyType:type,fromZone:true,sourceSide:side});resolveKnockOut(state,null);
      return state;
    }
    if (matched.type === 'retreat'){
      if(state.format==='classic'&&s.active?.neoPursuit&&state.turnNumber<=s.active.neoPursuit.until){
        const source=state.sides[foeSide].active;
        if(source?.uid===s.active.neoPursuit.sourceUid){s.active.damage=Number(s.active.damage||0)+10;state.log.push({type:'retaliate',side:foeSide,reason:'Neo Discovery Pursuit',amount:10});
          if(resolveKnockOut(state,null,'effect'))return state;if(!s.active)return state;
        }
      }
      const activeCard = data.cardById(s.active.cardId);
      const beforeEnergy={...(s.active.energy||{})},paid=spendRetreatEnergy(state,side,s.active,retreatCost(state,side));
      if (!paid) throw new Error('Not enough Energy to retreat.');
      s.energyDiscard=s.energyDiscard||{};for(const [type,n] of Object.entries(beforeEnergy)){const spent=Number(n||0)-Number(paid.energy[type]||0);if(spent>0)s.energyDiscard[type]=Number(s.energyDiscard[type]||0)+spent;}
      for(const ref of paid.discardSpecial)neoRecycleSpecial(s,ref);s.active.energy=paid.energy;s.active.specialEnergy=paid.specialEnergy;
      const benchArray=benchArrayIndex(s,matched.benchIndex);
      if(benchArray<0)throw new Error('That Bench slot is empty.');
      const incoming=s.bench[benchArray];
      const outgoing=s.active;
      const physical=Number(incoming.benchSlot);
      incoming.benchSlot=null;
      incoming.movedToActiveTurn=state.turnNumber;
      outgoing.benchSlot=physical;
      effects.clearTemporaryEffects(state,outgoing);
      s.bench[benchArray]=outgoing;
      s.active=incoming;
      s.retreated = true;
      state.log.push({type:'retreat',side,cardId:outgoing.cardId,toCardId:incoming.cardId,benchIndex:physical});const foeSide=side==='player'?'opponent':'player',retaliator=state.sides[foeSide].active;if(retaliator?.retreatRetaliation&&(retaliator.retreatRetaliation.expiresTurn==null||state.turnNumber<=retaliator.retreatRetaliation.expiresTurn)){s.active.damage=Number(s.active.damage||0)+Number(retaliator.retreatRetaliation.amount||0);state.log.push({type:'retreatRetaliation',side:foeSide,amount:Number(retaliator.retreatRetaliation.amount||0)});resolveKnockOut(state,null);}return state;
    }
    if (matched.type === 'attack'){
      const attackerCard=data.cardById(s.active.cardId),attackSourceCard=data.cardById(matched.attackCardId||s.active.cardId),attack=attackSourceCard.attacks[matched.attackIndex];
      if(attack.gxAttack||/\bGX\b/i.test(attack.name||''))s.gxAttackUsed=true;
      if(attack.vstarPower)s.vstarPowerUsed=true;
      if(state.format==='classic'&&foe.active?.cardId&&data.cardById(foe.active.cardId)?.baby){
        const heads=random(state)<.5;state.log.push({type:'coin',side,heads,reason:'Neo Baby Pokémon rule',results:[heads]});if(!heads){state.log.push({type:'attackFailed',side,reason:'Baby Pokémon rule'});endTurn(state);return state;}
      }
      if(s.active.attackGate&&(s.active.attackGate.expiresTurn==null||state.turnNumber<=s.active.attackGate.expiresTurn)){const heads=random(state)<0.5;state.log.push({type:'coin',side,heads,reason:'attackGate',results:[heads]});if(!heads){state.log.push({type:'attackFailed',side,reason:'attackGate'});endTurn(state);return state;}}
      if(s.active.conditions?.confusion){const heads=random(state)<0.5;state.log.push({type:'coin',side,heads,status:'confusion',results:[heads]});if(!heads){state.log.push({type:'attackFailed',side,reason:'confusion'});endTurn(state);return state;}}
      if(s.active.cardId==='gym2-13'&&!(s.active.conditions?.sleep||s.active.conditions?.paralysis)){
        const first=random(state)<0.5,second=random(state)<0.5;state.log.push({type:'coin',side,reason:'Misty Gyarados Rebellion',heads:[first,second].filter(Boolean).length,results:[first,second]});
        if(!first&&!second){effects.applyEffect({type:'shuffleIntoDeck',target:'self',includeAttached:true},{...effectContext(state,side,matched),isAttack:true});state.log.push({type:'attackFailed',side,reason:'Rebellion'});resolveKnockOut(state,'endTurn');if(state.phase==='battle')endTurn(state);return state;}
      }
      const ninja=foe.active&&(foe.active.temporaryTrainers||[]).find(r=>data.cardById(r.cardId)?.id==='gym2-115');
      if(ninja&&foe.bench.length){
        const old=foe.active;{
          const idx=foe.bench[0].benchSlot; const attached=old.temporaryTrainers||[];
          old.temporaryTrainers=attached.filter(ref=>ref.uid!==ninja.uid);foe.discard.push(ninja);
          const incoming=foe.bench.find(p=>p.benchSlot===idx);if(incoming){foe.bench[foe.bench.indexOf(incoming)]=old;old.benchSlot=idx;incoming.benchSlot=null;foe.active=incoming;}
          state.log.push({type:'gymEffect',side:foeSide,rule:'Ninja Trick',switched:true});
        }
      }
      const context={...effectContext(state,side,matched),isAttack:true},result=effects.resolveAttack(attack,context);
      if(attack.lentalSnore&&foe.active?.conditions?.sleep){result.damage=Number(result.damage||0)+100;delete foe.active.conditions.sleep;state.log.push({type:'lentalSnore',side,bonus:100});}
      const repeatEffect=(result.pendingEffects||[]).find(e=>e?.type==='repeatAttack');
      if(repeatEffect)state.pendingRepeatAttack={side,sourceUid:s.active.uid,attackName:attack.name,amount:Number(repeatEffect.secondDamage||0)};
      const defender=result.damageTarget===undefined?foe.active:result.damageTarget;
      if(!defender)throw new Error('No legal target remains for this attack.');
      const isActive=defender===foe.active;
      state.pendingAttackResult={defenderSide:foeSide,defenderUid:defender.uid,turn:state.turnNumber,before:attackResultSnapshot(defender)};
      let damage=result.damage;
      if(state.format==='classic'&&damage>0){
        // Unown [A]: at most one Anger Power modifies each Hidden Power.
        if(attackerCard.name.startsWith('Unown [')&&attack.name==='Hidden Power'){
          const support=pokemonOn(s).find(slot=>['neo2-14','neo2-33'].includes(slot.cardId)&&!effects.abilitiesSuppressed(state,side,slot,data.cardById));
          if(support)damage+=10*Math.floor(Number(support.damage||0)/10);
        }
      }
      // Neo Genesis Heracross #6: Final Blow changes Megahorn's base to 120
      // only while Heracross has 20 HP or less and its Power is functioning.
      if(state.format==='classic'&&attackerCard.id==='neo1-6'&&attack.name==='Megahorn'&&
         maxHp(state,side,s.active)-Number(s.active.damage||0)<=20&&
         !effects.abilitiesSuppressed(state,side,s.active,data.cardById)&&
         !s.active.conditions?.sleep&&!s.active.conditions?.confusion&&!s.active.conditions?.paralysis&&damage>0){damage=120;}
      if(isActive&&damage>0){
        // The creator's Battle Stick is an attached Tool, not a global buff.
        if(attackerCard.name==='Bidoof'&&[s.active.tool,...(s.active.extraTools||[])].some(r=>r?.cardId==='SNAPFLORIO-103'))damage+=20;
        if(state.format==='classic'&&attackerCard.id==='neo1-38'&&attack.name==='Floodlight'&&!effects.abilitiesSuppressed(state,side,s.active,data.cardById))damage+=10*Number(s.active.energy?.Water||0);
        damage+=effects.modifierAmount(state,side,s.active,'attackDamage',data.cardById)+effects.modifierAmount(state,side,s.active,'attackDamageAllTargets',data.cardById)+effects.attackSpecificBonus(s.active,attack.name,state.turnNumber);for(const boost of s.active.nextAttackBonuses||[])if(Number(boost.turn)===state.turnNumber&&boost.attackName===attack.name)damage+=Number(boost.amount||0);}
      let resistanceReason='';
      if(isActive){
        damage+=effects.modifierAmount(state,foeSide,defender,'damageTaken',data.cardById);
        if(state.format==='classic'&&damage>0){const metal=(s.active.specialEnergy||[]).filter(r=>r.cardId==='neo1-19').length;if(metal&&!attackerCard.types?.includes('Metal'))damage=Math.max(0,damage-metal*10);}
        if(!result.damageRules?.ignoreWeakness){
          const beforeMatchup=damage,defCard=data.cardById(defender.cardId),resistance=defender.resistanceOverride||defCard?.resistance;
          if(state.format==='classic'&&beforeMatchup>0&&resistance&&effects.effectiveTypes(state,side,s.active,data.cardById).includes(resistance)){
            resistanceReason=`${resistance} resistance (${defCard?.resistanceValue||'-30'})`;
          }
          if(state.stadium?.cardId==='gym2-113'&&attackerCard.types?.includes('Water')&&data.cardById(defender.cardId)?.name?.startsWith("Blaine's"))result.damageRules={...result.damageRules,ignoreWeakness:true};
          damage=effects.attackDamageWithState(state,side,s.active,foeSide,defender,damage,data.cardById);
          if(state.stadium?.cardId==='gym2-109'&&defender.resistanceOverride!==null&&data.cardById(defender.cardId)?.resistance&&attackerCard.types?.includes(data.cardById(defender.cardId).resistance))damage+=20;if(result.damageRules?.ignoreResistance&&damage>0){const card=data.cardById(defender.cardId),res=defender.resistanceOverride||card?.resistance;if(res&&effects.effectiveTypes(state,side,s.active,data.cardById).includes(res))damage+=30;}if(state.format==='classic'&&state.stadium?.cardId==='gym1-115'&&attackerCard.name?.startsWith("Brock's")&&damage>0){const defenderRes=data.cardById(defender.cardId)?.resistance;if(defenderRes&&attackerCard.types?.includes(defenderRes))damage+=30;}if(state.format==='classic'&&state.stadium?.cardId==='gym1-120'&&attackerCard.name?.startsWith("Lt. Surge's")){const heads=random(state)<0.5;state.log.push({type:'coin',side,reason:'Vermilion City Gym',heads,results:[heads]});if(heads&&damage>0)damage+=10;else if(!heads)s.active.damage=Number(s.active.damage||0)+10;}
        }
        if(damage>0){
          // Frog Song adds 40 *after* Weakness and Resistance when the attack
          // actually damaged the Defending Pokémon, rather than multiplying
          // the bonus through the matchup calculation.
          if(state.format==='classic'&&['neo2-8','neo2-27'].includes(attackerCard.id)&&
            !effects.abilitiesSuppressed(state,side,s.active,data.cardById)&&
            !s.active.conditions?.sleep&&!s.active.conditions?.confusion&&!s.active.conditions?.paralysis&&
            [s,foe].flatMap(board=>pokemonOn(board)).filter(slot=>['Poliwag','Poliwhirl','Poliwrath','Politoed'].includes(data.cardById(slot.cardId)?.name)).length>3)damage+=40;
          damage+=effects.modifierAmount(state,side,s.active,'postWeaknessAttackDamage',data.cardById);
          if(state.format==='classic'){
            const dark=(s.active.specialEnergy||[]).filter(r=>r.cardId==='neo1-104').length;
            damage+=dark*10;
            if(defender.neoScreech&&state.turnNumber<=defender.neoScreech.expiresTurn)damage+=20;
          }
        }if(damage>0&&state.format==='classic'&&s.gymMistyBonusTurn===state.turnNumber&&attackerCard.name?.startsWith("Misty's"))damage+=20;if(damage>0&&state.format==='classic'&&s.gymCharity?.turn===state.turnNumber&&s.gymCharity.activeUid===s.active.uid)damage=Math.max(0,damage-Number(s.gymCharity.reduce||0));
      }
      // Fossil Haunter's Transparency is a passive coin flip on every incoming
      // attack (including status-only attacks). A heads prevents all effects.
      const transparency=result.damageRules?.ignoreEffects?null:effects.findPassiveRule(state,foeSide,defender,'fossilTransparency',data.cardById);
      const transparencyHeads=!!transparency&&random(state)<0.5;
      if(transparency)state.log.push({type:'coin',side:foeSide,heads:transparencyHeads,reason:'fossilTransparency',results:[transparencyHeads]});
      let guard=result.damageRules?.ignoreEffects?null:effects.attackIsPrevented(state,foeSide,defender,s.active,data.cardById);
      if(transparencyHeads)guard={effects:true};if(guard?.maxDamage!=null&&damage>Number(guard.maxDamage))guard=null;if(guard?.minDamage!=null&&Math.max(0,damage-effects.modifierAmount(state,foeSide,defender,'damageReduction',data.cardById))<Number(guard.minDamage))guard=null;const preGuardDamage=damage;if(guard?.firstDamage&&preGuardDamage>0)effects.consumeDamageGuard(defender,'firstDamage');
      damage=guard?0:Math.max(0,damage-(result.damageRules?.ignoreEffects?0:effects.modifierAmount(state,foeSide,defender,'damageReduction',data.cardById)));damage=gymDamageDefender(state,foeSide,defender,s.active,damage);
      if(state.format==='classic'){
        const metal=(defender.specialEnergy||[]).filter(r=>r.cardId==='neo1-19').length;
        damage=result.damageRules?.ignoreEffects?damage:Math.max(0,damage-metal*10);
        if(state.stadium?.cardId==='neo1-97'&&attackerCard.types?.includes('Colorless'))damage=Math.max(0,damage-30);
      }
      if(damage>0&&!result.damageRules?.ignoreEffects){const coinGuard=effects.findPassiveRule(state,foeSide,defender,'coinDamageGuard',data.cardById);if(coinGuard){const heads=random(state)<0.5;state.log.push({type:'coin',side:foeSide,heads,reason:'coinDamageGuard',results:[heads]});if(heads)damage=coinGuard.preventAll?0:Math.max(0,damage-Number(coinGuard.reduction||0));}}
      if(state.format==='classic'&&damage>0&&!result.damageRules?.ignoreEffects){
        damage=effects.neoDiscoveryReduction(state,foeSide,side,s.active,damage,data.cardById);
        if(defender.neoSlime&&state.turnNumber<=defender.neoSlime.until){const heads=random(state)<.5;state.log.push({type:'coin',side:foeSide,reason:'Neo Discovery Slime',heads,results:[heads]});if(!heads)damage=0;}
      }
      if(state.stadium?.cardId==='SNAPFLORIO-112'&&!isActive)damage=0;
      // Apply printed Lental protection after Weakness, Resistance and ordinary modifiers.
      if(!result.damageRules?.ignoreEffects)damage=Math.max(0,damage-effects.lentalDefenseReduction(state,foeSide,defender,attackerCard,data.cardById));
      if(state.format==='classic'&&damage>0&&defender===state.sides[foeSide].active){
      const refs=[defender.tool,...(defender.extraTools||[])].filter(Boolean),fruit=refs.find(ref=>ref.cardId==='SNAPFLORIO-115');
      if(fruit){if(defender.tool?.uid===fruit.uid)defender.tool=defender.extraTools?.shift()||null;
        else defender.extraTools=(defender.extraTools||[]).filter(ref=>ref.uid!==fruit.uid);
        state.sides[foeSide].discard.push(fruit);damage=0;
        state.log.push({type:'toolGuard',side:foeSide,toolId:fruit.cardId,prevented:true});}
    }
    defender.damage=Number(defender.damage||0)+damage;if(damage>0)effects.florioReactToAttackDamage?.(state,foeSide,defender,side,attacker,damage,data.cardById,random);
      if(state.format==='classic'&&damage>0){
        // Resolve reactive attacks before KO; Wobbuffet can counter even when
        // the incoming blow knocks it out.
        if(defender.neoCounter&&state.turnNumber<=defender.neoCounter.until){const heads=random(state)<.5;state.log.push({type:'coin',side:foeSide,reason:'Neo Discovery Counter',heads,results:[heads]});if(heads){const reflected=effects.attackDamageWithState(state,foeSide,defender,side,s.active,damage,data.cardById);s.active.damage=Number(s.active.damage||0)+Math.max(0,reflected);}}
        if(defender.neoSecretePoison&&state.turnNumber<=defender.neoSecretePoison.until){s.active.conditions={...(s.active.conditions||{}),poison:true};for(const b of s.bench)b.damage=Number(b.damage||0)+effects.neoDiscoveryReduction(state,side,foeSide,defender,10,data.cardById);}
      }
      if(damage>0&&s.gym2KogaPoisonTurn===state.turnNumber&&attackerCard.name?.startsWith("Koga's"))defender.conditions={...(defender.conditions||{}),poison:true};
      gymReactiveDamage(state,foeSide,defender,side,s.active,damage);
      if(damage>0)defender.lastDamageSource={side,uid:s.active.uid,cardId:s.active.cardId,attack:true,turn:state.turnNumber};
      if(damage>0&&defender.retaliate&&(defender.retaliate.expiresTurn==null||state.turnNumber<=defender.retaliate.expiresTurn)){const amount=Number(defender.retaliate.amount||0);s.active.damage=Number(s.active.damage||0)+amount;state.log.push({type:'retaliate',side:foeSide,amount,cardId:defender.cardId});}
      if(state.format==='classic')foe.neoObservedAttack={turn:state.turnNumber,cardId:attackSourceCard.id,attackIndex:matched.attackIndex,witnesses:pokemonOn(foe).map(x=>x.uid)};
      state.log.push({type:'attack',side,cardId:attackerCard.id,attack:attack.name,damage,damageReason:damage===0?resistanceReason:'',target:isActive?'active':'bench',benchIndex:defender.benchSlot});s.lastAttackName=attack.name;s.lastAttackTurn=state.turnNumber;s.attackCounts=s.attackCounts||{};s.attackCounts[attack.name]=Number(s.attackCounts[attack.name]||0)+1;s.active.attackUseCount=Number(s.active.attackUseCount||0)+1;
      if(damage>0){triggerAbilities(state,'damagedByAttack',foeSide,defender);triggerPersistent(state,'damagedByAttack',foeSide,defender,{attacker:s.active,damage});}
      if(guard?.effects||effects.attackEffectsPrevented(state,foeSide,defender,s.active,data.cardById)||state.sides[foeSide].active!==defender)context.preventedTargets=new Set([defender.uid,...[state.sides[foeSide].active?.uid].filter(Boolean)]);context.dealtDamage=damage;
      for(let i=0;i<result.pendingEffects.length;i++){effects.applyEffect(result.pendingEffects[i],context);if(state.phase==='effectChoice'){state.pendingChoice.afterEffects=[...(state.pendingChoice.afterEffects||[]),...result.pendingEffects.slice(i+1)];state.pendingChoice.resume='attack';state.pendingChoice.isAttack=true;return state;}}
      finalizeAttackResult(state);
      if(repeatEffect){const paused=resolveKnockOut(state,'repeatAttack','attack');if(paused)return state;finishRepeatAttack(state);return state;}
      const paused=resolveKnockOut(state,'endTurn','attack');
      if(!paused&&state.phase==='battle')endTurn(state);
      return state;
    }
    if (matched.type === 'endTurn'){
      endTurn(state);
      return state;
    }
    throw new Error(`Unimplemented Pocket action: ${matched.type}`);
  }

  function cloneState(state){return JSON.parse(JSON.stringify(state));}
  function restoreState(state,snapshot){for(const key of Object.keys(state))delete state[key];Object.assign(state,cloneState(snapshot));return state;}
  function effectContainsCoin(effect){if(!effect||typeof effect!=='object')return false;const type=String(effect.type||'');if(type.startsWith('coin')||['allHeadsEffect','allHeadsBonus','attackCoinGate','coinAttackGate','coinAnyHeadsGate'].includes(type))return true;if(Array.isArray(effect.effects)&&effect.effects.some(effectContainsCoin))return true;if(effect.heads&&effectContainsCoin(effect.heads))return true;if(effect.tails&&effectContainsCoin(effect.tails))return true;if(effect.effect&&effectContainsCoin(effect.effect))return true;if(Array.isArray(effect.options)&&effect.options.some(x=>effectContainsCoin(x?.effect)))return true;return false;}
  function rerollContext(state,side,action){
    if(!state||!action)return null;
    if(state.phase==='effectChoice'){
      const p=state.pendingChoice;if(!p||p.special==='coinReroll')return null;
      const scope=p.resume==='trainer'?'trainer':(p.resume==='attack'||p.isAttack?'attack':null);if(!scope||!effectContainsCoin(p.effect))return null;
      const ownerSide=p.originSide||side,subject=scope==='attack'?(findSlotByUid(state,ownerSide,p.sourceUid)||state.sides[ownerSide].active):null;return {ownerSide,scope,subject};
    }
    if(action.type==='attack'){
      const slot=state.sides[side]?.active,sourceCard=data.cardById(action.attackCardId||slot?.cardId),attack=sourceCard?.attacks?.[action.attackIndex];if(!slot||!effectContainsCoin(attack?.effect))return null;return {ownerSide:side,scope:'attack',subject:slot};
    }
    if(action.type==='trainer'){
      const card=data.cardById(action.cardId);if(!effectContainsCoin(card?.effect))return null;return {ownerSide:side,scope:'trainer',subject:null};
    }
    return null;
  }
  // Neo Discovery Spikes reacts to a Benched Pokemon becoming Active on its
  // own turn. Observe the state transition for all switch and promotion paths.
  function neoSpikesAfterAction(state,before){
    if(state.format!=='classic')return;
    let hit=false;
    for(const side of ['player','opponent']){
      const ss=state.sides[side],old=before[side];if(!old||state.activeSide!==side||!ss.active||ss.active.uid===old.uid||!old.bench.has(ss.active.uid))continue;
      const foe=state.sides[side==='player'?'opponent':'player'];
      for(const slot of pokemonOn(foe)){
        if(!['neo2-2','neo2-21'].includes(slot.cardId)||effects.abilitiesSuppressed(state,foe.id,slot,data.cardById)||slot.conditions?.sleep||slot.conditions?.confusion||slot.conditions?.paralysis)continue;
        ss.active.damage=Number(ss.active.damage||0)+10;state.log.push({type:'neoEffect',side:foe.id,rule:'Spikes',targetCardId:ss.active.cardId,amount:10});hit=true;
      }
    }
    if(hit)resolveKnockOut(state,null,'effect');
  }
  function neoMonitoredAction(state,side,action){
    const before=Object.fromEntries(['player','opponent'].map(who=>[who,{uid:state.sides[who].active?.uid,bench:new Set((state.sides[who].bench||[]).map(p=>p.uid))}]));
    const result=applyActionRaw(state,side,action);neoSpikesAfterAction(state,before);return result;
  }
  function applyAction(state,side,action){
    const rc=rerollContext(state,side,action),source=rc&&effects.coinRerollSource?.(state,rc.ownerSide,rc.scope,rc.subject,data.cardById);
    if(!source)return neoMonitoredAction(state,side,action);
    const snapshot=cloneState(state),logStart=state.log?.length||0,result=neoMonitoredAction(state,side,action),newLogs=(state.log||[]).slice(logStart),flipped=newLogs.some(x=>x?.type==='coin');
    if(!flipped)return result;
    const keepState=cloneState(state),rngAfter=state.rngState;state.phase='effectChoice';state.choiceSide=rc.ownerSide;delete state.winner;delete state.reason;
    state.pendingChoice={kind:'option',options:['Keep results','Reroll'],side:rc.ownerSide,originSide:rc.ownerSide,sourceUid:source.sourceUid,special:'coinReroll',keepState,snapshot,originalAction:cloneState(action),actionSide:side,rerollRngState:rngAfter,rerollOwnerSide:rc.ownerSide,rerollScope:rc.scope};
    return state;
  }

  function publicSnapshot(state){ return JSON.parse(JSON.stringify(state)); }

  return {createBattle,makePokemonSlot,legalActions,attackOptions,attackAvailability,attackDamagePreview,effectiveEnergy,energyCostLabel,applyAction,publicSnapshot,drawCard,endTurn,benchSlotAt,benchArrayIndex,normalizeBenchSlots,random,shuffle,checkup,effectContext,maxHp};
});
