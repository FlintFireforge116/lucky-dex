(function(root, factory){
  let core = root && root.LuckyDexTCGPBattleCore;
  let data = root && root.LuckyDexTCGPBattleData;
  if (typeof module === 'object' && module.exports){
    core = require('./tcgp-battle-core.js');
    data = require('./tcgp-battle-data.js');
    module.exports = factory(core,data);
  } else if (root){
    root.LuckyDexTCGPBattleAI = factory(core,data);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(core,data){
  'use strict';

  const ACTION_KEYS = ['type','handIndex','cardId','target','benchIndex','attackIndex','abilityIndex','effectTarget','effectBenchIndex'];
  function sameAction(a,b){ return !!a && !!b && ACTION_KEYS.every(key => (a[key] == null && b[key] == null) || a[key] === b[key]); }

  function attackScore(action, state, side){
    const slot = state.sides[side].active;
    const card = slot && data.cardById(slot.cardId);
    const attack = card && card.attacks[action.attackIndex];
    return Number(attack && attack.damage || 0);
  }

  function attachScore(action,state,side){
    const s=state.sides[side];
    if(action.target==='active'){
      const card=data.cardById(s.active.cardId);
      const attacks=card.attacks||[];
      const total=Object.values(s.active.energy||{}).reduce((a,b)=>a+Number(b||0),0);
      const minNeed=Math.min(...attacks.map(a=>String(a.cost||'').length).filter(Boolean),99);
      return total<minNeed?100:30;
    }
    const slot=core.benchSlotAt?core.benchSlotAt(s,action.benchIndex):s.bench[action.benchIndex];
    const card=slot&&data.cardById(slot.cardId);
    if(!card)return 0;
    const total=Object.values(slot.energy||{}).reduce((a,b)=>a+Number(b||0),0);
    const minNeed=Math.min(...(card.attacks||[]).map(a=>String(a.cost||'').length).filter(Boolean),99);
    return 20-Math.min(10,total)+(minNeed<99?Math.max(0,5-minNeed):0);
  }

  function utilityScore(action,state,side){
    const s=state.sides[side],source=action.target==='bench'?(core.benchSlotAt?core.benchSlotAt(s,action.benchIndex):s.bench[action.benchIndex]):s.active;
    const card=data.cardById(action.cardId||source?.cardId);
    const abilities=card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:[card?.ability];
    const ability=abilities[Number(action.abilityIndex||0)];
    const effect=action.type==='ability'?ability?.effect:card?.effect;
    if(effect?.type==='discardSelf')return -Infinity;
    const target=action.effectTarget||action.target,index=action.effectTarget?action.effectBenchIndex:action.benchIndex;
    const ownTarget=target==='active'?s.active:target==='bench'?(core.benchSlotAt?core.benchSlotAt(s,index):s.bench[index]):null;
    const subtype=card?.trainerSubtype||card?.trainerType;
    let score=({Supporter:20,Tool:15,Stadium:10,Item:5}[subtype]||0);
    if(effect&&/heal/i.test(effect.type))score+=Math.min(Number(effect.amount||0),Number(ownTarget?.damage||0));
    if(effect&&/attachEnergy/i.test(effect.type)&&ownTarget)score+=attachScore({target,benchIndex:index},state,side);
    return score;
  }

  function chooseAction(state,side,difficulty,actionCount){
    const level=String(difficulty||'Beginner');
    if(level!=='Beginner') throw new Error(`AI difficulty not implemented yet: ${level}`);
    const legal=core.legalActions(state,side);
    if(!legal.length)return null;

    const promote=legal.find(a=>a.type==='promote');
    if(promote)return promote;
    if(Number(actionCount||0)>=30)return legal.find(a=>a.type==='endTurn')||null;

    const evolve=legal.find(a=>a.type==='evolve');
    if(evolve)return evolve;

    const ability=legal.filter(a=>a.type==='ability'&&utilityScore(a,state,side)>-Infinity).sort((a,b)=>utilityScore(b,state,side)-utilityScore(a,state,side))[0];
    if(ability)return ability;

    const trainer=legal.filter(a=>a.type==='trainer').sort((a,b)=>utilityScore(b,state,side)-utilityScore(a,state,side))[0];
    if(trainer)return trainer;

    const bench=legal.find(a=>a.type==='bench');
    if(bench)return bench;

    const attach=legal.filter(a=>a.type==='attach').sort((a,b)=>attachScore(b,state,side)-attachScore(a,state,side))[0];
    if(attach)return attach;

    const attack=legal.filter(a=>a.type==='attack').sort((a,b)=>attackScore(b,state,side)-attackScore(a,state,side))[0];
    if(attack)return attack;

    const retreat=legal.find(a=>a.type==='retreat');
    if(retreat)return retreat;

    return legal.find(a=>a.type==='endTurn')||legal[0];
  }

  function runTurn(state,side,difficulty){
    const startSide=side;
    let actions=0;
    while(actions<30){
      if(state.phase==='promote'){
        const promotionSide=state.promotionSide;
        const action=chooseAction(state,promotionSide,difficulty);
        if(!action)break;
        core.applyAction(state,promotionSide,action);
        actions+=1;
        continue;
      }
      if(state.phase!=='battle'||state.activeSide!==startSide)break;
      const action=chooseAction(state,startSide,difficulty,actions);
      if(!action)break;
      core.applyAction(state,startSide,action);
      actions+=1;
    }
    if(actions>=30&&state.phase==='battle'&&state.activeSide===startSide){
      const end=core.legalActions(state,startSide).find(a=>a.type==='endTurn');
      if(end)core.applyAction(state,startSide,end);
    }
    return state;
  }

  return {sameAction,chooseAction,runTurn};
});
