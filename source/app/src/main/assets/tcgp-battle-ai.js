(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./tcgp-battle-core.js'),require('./tcgp-battle-data.js'),require('./tcgp-battle-effects.js'));
  else root.LuckyDexTCGPBattleAI=factory(root.LuckyDexTCGPBattleCore,root.LuckyDexTCGPBattleData,root.LuckyDexTCGPBattleEffects);
})(typeof globalThis!=='undefined'?globalThis:this,function(core,data,effects){
  'use strict';
  const DIFFICULTIES=['Beginner','Intermediate','Advanced','Expert'];
  const ACTION_KEYS=['type','handIndex','cardId','target','benchIndex','attackIndex','abilityIndex','effectTarget','effectBenchIndex'];
  const sameAction=(a,b)=>!!a&&!!b&&ACTION_KEYS.every(k=>a[k]===b[k]||(a[k]==null&&b[k]==null));
  const foeOf=side=>side==='player'?'opponent':'player';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const slots=s=>[s.active,...s.bench].filter(Boolean);
  function slotFor(s,target,index){return target==='bench'?core.benchSlotAt(s,index):s.active;}
  function deficit(slot,attack){
    const cost=String(attack?.cost||''),energy={...slot.energy};let missing=0;
    for(const c of cost)if(c!=='C'){const type=effects.ENERGY_CODE[c];if(energy[type]>0)energy[type]--;else missing++;}
    return missing+Math.max(0,[...cost].filter(c=>c==='C').length-effects.totalEnergy(energy));
  }
  function attachScore(action,state,side){
    const s=state.sides[side],slot=slotFor(s,action.target,action.benchIndex);if(!slot)return -100;
    const card=data.cardById(slot.cardId),attacks=card?.attacks||[];
    const before=Math.min(...attacks.map(a=>deficit(slot,a)),99),after={...slot,energy:{...slot.energy,[s.energyType]:Number(slot.energy[s.energyType]||0)+1}};
    const gain=before-Math.min(...attacks.map(a=>deficit(after,a)),99);
    return gain*50+(action.target==='active'?15:5)-effects.totalEnergy(slot.energy)*2;
  }
  function abilityEffect(card,index){return (card?.abilities?.length?card.abilities:[].concat(card?.ability||[]))[Number(index||0)]?.effect;}
  function dangerous(effect){return effect?.type==='discardSelf'||effect?.effects?.some(dangerous);}
  function beginner(action,state,side){
    const source=slotFor(state.sides[side],action.target,action.benchIndex),card=data.cardById(action.cardId||source?.cardId);
    if(action.type==='promote'||action.type==='setupActive')return 1000+Number(card?.hp||0);
    if(action.type==='setupBench')return 950;
    if(action.type==='setupReady')return 1;
    if(action.type==='evolve')return 900;
    if(action.type==='ability')return dangerous(abilityEffect(card,action.abilityIndex))?-100:800;
    if(action.type==='trainer')return dangerous(card?.effect)?-100:700;
    if(action.type==='bench')return 600;
    if(action.type==='attach')return 400+attachScore(action,state,side);
    if(action.type==='attack')return 200+Number(data.cardById(state.sides[side].active.cardId)?.attacks[action.attackIndex]?.damage||0);
    if(action.type==='retreat')return -10;
    return 0;
  }
  // Search never sees a hidden identity or the live RNG stream. Public counts remain
  // available for hand disruption; only our own hand and public zones retain identities.
  function publicPosition(state,side){
    const masked=count=>Array.from({length:count},(_,i)=>({uid:'unknown-'+i,cardId:'BASIC-POKE-BALL'}));
    const view={...state,rngState:123456789,log:[],sides:{}};
    delete view.playerDeck;delete view.deckMetadata;
    for(const id of ['player','opponent']){const s=state.sides[id];view.sides[id]={...s,deck:masked(s.deck.length),hand:id===side?s.hand:masked(s.hand.length)};}
    return clone(view);
  }
  function sideValue(state,side,level){
    const s=state.sides[side];let score=Number(s.points||0)*(level>=2?700:350)+s.hand.length*4;
    for(const slot of slots(s)){
      const card=data.cardById(slot.cardId),hp=core.maxHp(state,side,slot),remaining=Math.max(0,hp-Number(slot.damage||0));
      const attacks=card.attacks||[],need=Math.min(...attacks.map(a=>deficit(slot,a)),99),power=Math.max(0,...attacks.filter(a=>deficit(slot,a)===0).map(a=>Number(a.damage||0)));
      const active=slot===s.active,points=Number(card.points||1);
      score+=remaining*.24+remaining/hp*12+Math.min(80,Number(card.hp||0))*.06;
      score+=Math.max(0,35-need*12)+(active?power*.3:power*.12);
      // Energy beyond attack needs has little value; extra Energy attacks are valued
      // through their actual engine result in the action search.
      const maxCost=Math.max(1,...attacks.map(a=>String(a.cost||'').length));
      score+=Math.min(effects.totalEnergy(slot.energy),maxCost)*9;
      if(slot.tool)score+=8;if(slot.attackGuard)score+=8;
      if(level>=2){score-=Object.keys(slot.conditions||{}).length*(active?14:2);score-=Number(slot.damage||0)/hp*points*(s.points>=2?24:10);}
      if(!active)score+=6;
    }
    if(level>=2)score+=Math.min(30,(state.modifiers||[]).filter(m=>m.ownerSide===side).reduce((n,m)=>n+Number(m.amount||0),0));
    return score;
  }
  function value(state,side,level){
    if(state.phase==='finished')return state.winner===side?1000000:state.winner===foeOf(side)?-1000000:0;
    return sideValue(state,side,level)-sideValue(state,foeOf(side),level)*(level>=2?1:.6);
  }
  // Deck searches operate on unknown order/composition in the projection. Value
  // their setup opportunity from public deck count and available Bench space.
  function searchOpportunity(effect,s){
    if(!effect)return 0;
    if(effect.type==='sequence')return effect.effects.reduce((n,e)=>n+searchOpportunity(e,s),0);
    if(['search','searchRandomBasic'].includes(effect.type)&&(!effect.source||effect.source==='deck'))return Math.min(s.deck.length,Number(effect.amount||1))*(s.bench.length===0?24:s.bench.length<3?16:6);
    return 0;
  }
  function evaluate(position,action,side,level){
    const next=clone(position);core.applyAction(next,side,action);
    let score=value(next,side,level);
    if(action.type==='attach')score+=attachScore(action,position,side)*.12;
    if(action.type==='evolve')score+=4;
    if(action.type==='trainer')score+=2+searchOpportunity(data.cardById(action.cardId)?.effect,position.sides[side]);
    if(action.type==='ability')score+=searchOpportunity(abilityEffect(data.cardById(action.cardId),action.abilityIndex),position.sides[side]);
    if(action.type==='endTurn')score-=4;
    // Avoid gratuitous retreat loops and spending an attacker's last Energy.
    if(action.type==='retreat')score-=level>=2?7:12;
    return {action,score,next};
  }
  function chooseAction(state,side,difficulty,actionCount){
    const level=DIFFICULTIES.indexOf(String(difficulty||'Beginner'));if(level<0)throw new Error('Unknown AI difficulty: '+difficulty);
    const legal=core.legalActions(state,side);if(!legal.length)return null;
    if(Number(actionCount||0)>=30)return legal.find(a=>a.type==='attack')||legal.find(a=>a.type==='endTurn')||legal[0];
    if(level===0)return legal.map((action,index)=>({action,index,score:beginner(action,state,side)})).sort((a,b)=>b.score-a.score||a.index-b.index)[0].action;
    const position=publicPosition(state,side),ranked=legal.map(action=>evaluate(position,action,side,level)).sort((a,b)=>b.score-a.score);
    // Expert scores short sequences with the real action engine: e.g. damage boost
    // before the winning attack, draw before attachment, switch before a useful KO.
    if(level===3&&ranked[0].score<1000000){
      for(const candidate of ranked.slice(0,8)){
        const next=candidate.next;if(next.phase!=='battle'||next.activeSide!==side)continue;
        const follow=core.legalActions(next,side);let best=candidate.score;
        for(const action of follow){const future=evaluate(next,action,side,level);best=Math.max(best,future.score-1);}
        candidate.score=best;
      }
      ranked.sort((a,b)=>b.score-a.score);
    }
    return ranked[0].action;
  }
  function runTurn(state,side,difficulty){
    let count=0;
    while(count<48){
      const acting=state.phase==='promote'?state.promotionSide:state.phase==='setup'?state.setupSide:state.activeSide;
      if(state.phase==='finished'||state.phase==='battle'&&acting!==side)break;
      const action=chooseAction(state,acting,difficulty,count);if(!action)break;core.applyAction(state,acting,action);count++;
    }
    if(state.phase==='battle'&&state.activeSide===side){const end=core.legalActions(state,side).find(a=>a.type==='endTurn');if(end)core.applyAction(state,side,end);}
    return state;
  }
  return {DIFFICULTIES,sameAction,chooseAction,runTurn};
});
