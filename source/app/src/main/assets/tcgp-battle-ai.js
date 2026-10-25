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

  const ACTION_KEYS = ['type','handIndex','cardId','target','benchIndex','attackIndex'];
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

  function chooseAction(state,side,difficulty){
    const level=String(difficulty||'Beginner');
    if(level!=='Beginner') throw new Error(`AI difficulty not implemented yet: ${level}`);
    const legal=core.legalActions(state,side);
    if(!legal.length)return null;

    const promote=legal.find(a=>a.type==='promote');
    if(promote)return promote;

    const evolve=legal.find(a=>a.type==='evolve');
    if(evolve)return evolve;

    const trainer=legal.find(a=>a.type==='trainer');
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
      const action=chooseAction(state,startSide,difficulty);
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
