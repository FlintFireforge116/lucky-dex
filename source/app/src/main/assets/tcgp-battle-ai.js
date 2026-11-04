(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./tcgp-battle-core.js'),require('./tcgp-battle-data.js'),require('./tcgp-battle-effects.js'));
  else root.LuckyDexTCGPBattleAI=factory(root.LuckyDexTCGPBattleCore,root.LuckyDexTCGPBattleData,root.LuckyDexTCGPBattleEffects);
})(typeof globalThis!=='undefined'?globalThis:this,function(core,data,effects){
  'use strict';
  const DIFFICULTIES=['Beginner','Intermediate','Advanced','Expert'];
  const ACTION_KEYS=['type','handIndex','cardId','target','benchIndex','attackIndex','attackCardId','abilityIndex','effectTarget','effectBenchIndex','choiceTarget','choiceBenchIndex','choiceHandIndex','choiceDiscardIndex','choiceDeckIndex','choiceCardId','choiceAttackIndex','choiceOption','choiceSkip','effectEnergyType'];
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
  // Classic trainers with no legal benefit should stay in the CPU hand. The
  // generic battle action list intentionally lets human players experiment;
  // CPU utility must not interpret every legal Trainer as useful.
  const attachedCount=slot=>slot?effects.totalEnergy(slot.energy)+(slot.specialEnergy||[]).length:0;
  function usefulClassicTrainer(state,side,action){
    const card=data.cardById(action.cardId),s=state.sides[side],foe=state.sides[foeOf(side)];
    if(!card)return false;
    if(card.name==='Super Energy Removal')return slots(s).some(x=>attachedCount(x)>0)&&slots(foe).some(x=>attachedCount(x)>=2);
    if(card.name==='Energy Removal')return slots(foe).some(x=>attachedCount(x)>0);
    if(card.name==='Energy Retrieval')return Object.values(s.energyDiscard||{}).some(n=>Number(n)>0)||(s.discard||[]).some(ref=>data.cardById(ref.cardId)?.basicEnergy);
    if(card.name==='Pokémon Center')return slots(s).some(x=>Number(x.damage||0)>0);
    if(card.name==='Full Heal')return !!s.active&&Object.values(s.active.conditions||{}).some(Boolean);
    if(card.name==='Recycle')return (s.discard||[]).length>0;
    if(card.name==='Pokédex')return (s.deck||[]).length>1;
    return true;
  }
  // Damage must be scored *after* Weakness/Resistance; a 30-damage Fighting
  // Wing Attack against Fossil Aerodactyl is actually zero damage.
  function matchupDamage(state,side,slot,attack,attackIndex,attackCardId){
    const foeSide=foeOf(side),target=state.sides[foeSide]?.active;
    if(!slot||!target||!attack)return 0;
    const active=state.sides[side].active===slot;
    const raw=active?Number(core.attackDamagePreview(state,side,attackIndex,attackCardId)?.damage||0):Number(attack.damage||0);
    return effects.attackDamageWithState(state,side,slot,foeSide,target,Math.max(0,raw),data.cardById);
  }
  function benchAttackValue(state,side,slot){
    const card=data.cardById(slot?.cardId);if(!card)return 0;
    const energy={...(slot.energy||{})};
    for(const ref of slot.specialEnergy||[]){const provides=data.cardById(ref.cardId)?.effect?.provides||ref.provides||{};for(const [type,amount] of Object.entries(provides))energy[type]=Number(energy[type]||0)+Number(amount||0);}
    return Math.max(0,...(card.attacks||[]).map((attack,index)=>effects.canPayCost(energy,attack.cost)?matchupDamage(state,side,slot,attack,index,card.id):0));
  }
  // Gym Heroes Lt. Surge's Electabuzz has a free recovery attack (Charge)
  // followed by Discharge, whose damage is "30×" rather than a fixed number.
  // Fixed-damage AI scores otherwise rate both as zero and keep taking the
  // first option, even after banking ten Lightning Energy. Prefer the actual
  // damage attack once charged, while allowing Charge to recover real Energy.
  function chargedCoinAttack(state,side,legal){
    if(state?.format!=='classic'||state?.phase!=='battle')return null;
    const ss=state.sides[side],slot=ss?.active,card=data.cardById(slot?.cardId);
    if(!card)return null;
    const findNested=(effect,type)=>effect?.type===type?effect:(Array.isArray(effect?.effects)?effect.effects.map(x=>findNested(x,type)).find(Boolean):null);
    for(const attackAction of legal.filter(a=>a.type==='attack')){
      const attack=data.cardById(attackAction.attackCardId||slot.cardId)?.attacks?.[attackAction.attackIndex];
      const flip=findNested(attack?.effect,'coinDamageByEnergy');
      if(!flip?.energyType||!flip?.amount)continue;
      const attached=Number(slot.energy?.[flip.energyType]||0);
      const expected=Math.max(0,attached)*Number(flip.amount)*0.5;
      const recovery=Number(ss.energyDiscard?.[flip.energyType]||0);
      // At one attached Energy, recover before attacking if a discarded
      // Energy is available. Otherwise an idle Charge changes nothing.
      if(attached>=2&&expected>=Number(flip.amount)||attached>=1&&recovery===0)return attackAction;
    }
    return null;
  }
  function usefulRetreatFromResistance(state,side,legal){
    if(state.format!=='classic'||state.phase!=='battle')return null;
    const attacks=legal.filter(a=>a.type==='attack'),retreats=legal.filter(a=>a.type==='retreat');
    if(!attacks.length||!retreats.length)return null;
    // Don't force a retreat from an attack that still has an important
    // effect (e.g. paralysis, healing or switching) despite zero damage.
    const harmless=attacks.every(a=>{
      const card=data.cardById(a.attackCardId||state.sides[side].active?.cardId),attack=card?.attacks?.[a.attackIndex];
      return attack&&!attack.effect&&matchupDamage(state,side,state.sides[side].active,attack,a.attackIndex,card.id)===0;
    });
    if(!harmless)return null;
    const candidates=retreats.map(a=>({action:a,score:benchAttackValue(state,side,slotFor(state.sides[side],'bench',a.benchIndex))})).filter(x=>x.score>0);
    candidates.sort((a,b)=>b.score-a.score);
    return candidates[0]?.action||null;
  }
  function abilityEffect(card,index){return (card?.abilities?.length?card.abilities:[].concat(card?.ability||[]))[Number(index||0)]?.effect;}
  function dangerous(effect){return effect?.type==='discardSelf'||effect?.effects?.some(dangerous);}
  function beginner(action,state,side){
    const source=slotFor(state.sides[side],action.target,action.benchIndex),card=data.cardById(action.cardId||source?.cardId);
    if(action.type==='effectChoice')return 980;
    if(action.type==='promote'||action.type==='setupActive')return 1000+Number(card?.hp||0);
    if(action.type==='setupBench')return 950;
    if(action.type==='setupReady')return 1;
    if(action.type==='evolve')return 900;
    if(action.type==='ability')return dangerous(abilityEffect(card,action.abilityIndex))?-100:800;
    if(action.type==='trainer')return dangerous(card?.effect)?-100:700;
    if(action.type==='bench')return 600;
    if(action.type==='attach')return 400+attachScore(action,state,side);
    if(action.type==='attack')return 200+Number(data.cardById(action.attackCardId||state.sides[side].active.cardId)?.attacks[action.attackIndex]?.damage||0);
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
    const legal=core.legalActions(state,side).filter(action=>{
      if(state.format==='classic'&&action.type==='trainer'&&!usefulClassicTrainer(state,side,action))return false;
      if(state.format!=='classic'||action.type!=='ability')return true;
      const source=slotFor(state.sides[side],action.target,action.benchIndex),card=data.cardById(source?.cardId),index=Number(action.abilityIndex||0),power=(card?.abilities||[])[index];
      // Powers remain freely repeatable for the human. The CPU may use them
      // once per turn so it cannot oscillate Energy/Damage forever.
      return !(power?.oncePerTurn===false&&state.sides[side].abilityUsed?.[source.uid+':'+index]===state.sides[side].turnCount);
    });
    if(!legal.length)return null;
    // Super Energy Removal has two sequential target choices. Beginners used
    // to select the first listed Active target, even if it had no Energy.
    if(state.format==='classic'&&state.phase==='effectChoice'&&state.pendingChoice?.effect?.type==='multiEnergyRemoval'){
      const pending=state.pendingChoice,origin=pending.originSide||side,isOpponent=pending.effect.stage==='opponent';
      const owner=isOpponent?foeOf(origin):origin,candidates=legal.filter(a=>a.type==='effectChoice').map(a=>({action:a,count:attachedCount(slotFor(state.sides[owner],a.choiceTarget,a.choiceBenchIndex))})).filter(x=>x.count>0);
      candidates.sort((a,b)=>isOpponent?b.count-a.count:a.count-b.count);
      if(candidates.length)return candidates[0].action;
    }
    // Escape resistance stalemates before scoring another futile attack.
    const rescue=usefulRetreatFromResistance(state,side,legal);if(rescue)return rescue;
    const chargedAttack=chargedCoinAttack(state,side,legal);if(chargedAttack)return chargedAttack;
    if(state.format==='classic'&&state.phase==='effectChoice'&&state.pendingChoice?.effect?.type==='redistributeEnergy'&&state.pendingChoice.effect.phase==='continue'){
      const done=legal.find(action=>action.choiceLabel==='Done');if(done)return done;
    }
    if(Number(actionCount||0)>=30)return legal.find(a=>a.type==='attack')||legal.find(a=>a.type==='endTurn')||legal.find(a=>a.choiceLabel==='Done')||legal[0];
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
      const acting=state.phase==='effectChoice'?state.choiceSide:state.phase==='promote'?state.promotionSide:state.phase==='setup'?state.setupSide:state.activeSide;
      if(state.phase==='finished'||state.phase==='battle'&&acting!==side)break;
      const action=chooseAction(state,acting,difficulty,count);if(!action)break;core.applyAction(state,acting,action);count++;
    }
    if(state.phase==='battle'&&state.activeSide===side){const end=core.legalActions(state,side).find(a=>a.type==='endTurn');if(end)core.applyAction(state,side,end);}
    return state;
  }
  return {DIFFICULTIES,sameAction,chooseAction,runTurn};
});
