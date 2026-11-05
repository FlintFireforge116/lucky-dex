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
  function deficit(slot,attack,state,side){
    const cost=String(attack?.cost||''),energy={...(state&&side?core.effectiveEnergy(state,side,slot):slot.energy||{})};let missing=0;
    for(const c of cost)if(c!=='C'){const type=effects.ENERGY_CODE[c];if(energy[type]>0)energy[type]--;else missing++;}
    return missing+Math.max(0,[...cost].filter(c=>c==='C').length-effects.totalEnergy(energy));
  }
  function attachScore(action,state,side){
    const s=state.sides[side],slot=slotFor(s,action.target,action.benchIndex);if(!slot)return -100;
    const card=data.cardById(slot.cardId),attacks=card?.attacks||[];
    const before=Math.min(...attacks.map(a=>deficit(slot,a,state,side)),99),after={...slot,energy:{...slot.energy,[s.energyType]:Number(slot.energy[s.energyType]||0)+1}};
    const gain=before-Math.min(...attacks.map(a=>deficit(after,a,state,side)),99);
    return gain*50+(action.target==='active'?15:5)-effects.totalEnergy(core.effectiveEnergy(state,side,slot))*2;
  }
  // Classic trainers with no legal benefit should stay in the CPU hand. The
  // generic battle action list intentionally lets human players experiment;
  // CPU utility must not interpret every legal Trainer as useful.
  const attachedCount=slot=>slot?effects.totalEnergy(slot.energy)+(slot.specialEnergy||[]).length:0;
  // Evaluate Stadium cards as persistent board assets, not disposable Trainers.
  // Playing a different Stadium removes the one already in play. A generic
  // +2 Trainer bonus made Advanced/Expert repeatedly replace useful Stadiums.
  // Values are deliberately based only on the public board, not hidden decks.
  function stadiumUtility(state,side,card,ownerSide){
    if(!card)return 0;
    const mine=state.sides[side],foe=state.sides[foeOf(side)];
    const myActive=mine.active,theirActive=foe.active;
    const myDamage=Number(myActive?.damage||0),theirDamage=Number(theirActive?.damage||0);
    if(card.id==='neo3-61'){
      // Healing Field is symmetrical: both sides can heal. Protect it while
      // our damaged Active benefits; do not play it to heal only the opponent.
      return 6+Math.min(40,myDamage)*.8-Math.min(40,theirDamage)*.55;
    }
    if(card.id==='neo3-63'){
      const darkCount=ss=>slots(ss).filter(slot=>/Dark/.test(String(data.cardById(slot.cardId)?.name||''))).length;
      return (darkCount(mine)-darkCount(foe))*16;
    }
    if(card.id==='gym1-124')return (Math.max(0,foe.bench.filter(Boolean).length-2)-Math.max(0,mine.bench.filter(Boolean).length-2))*18;
    if(card.id==='neo1-97'){
      const colorless=slot=>data.cardById(slot?.cardId)?.types?.includes('Colorless');
      return (Number(colorless(theirActive))-Number(colorless(myActive)))*12;
    }
    if(card.id==='neo1-84')return 8; // Ecogym benefits both players.
    // Other Gym cards have situational rules. Keep a Stadium in play rather
    // than cycling through these blindly; replacement requires an advantage.
    return ownerSide===side?9:-5;
  }
  function stadiumWorthPlaying(state,side,card){
    if(!card)return false;
    const current=state.stadium,previous=current?data.cardById(current.cardId):null;
    const nextScore=stadiumUtility(state,side,card,side);
    if(!current)return nextScore>=8;
    const previousScore=stadiumUtility(state,side,previous,current.ownerSide);
    // A Stadium already owned by this CPU should not be swapped for an
    // equivalent card. An opponent-owned one may warrant an earlier counter.
    return nextScore-previousScore>=(current.ownerSide===side?10:5);
  }
  function worthwhileStadiumAction(state,side,action){
    if(action.type!=='stadiumAction')return false;
    if(action.cardId==='neo3-61')return Number(state.sides[side]?.active?.damage||0)>0;
    // Other Stadium abilities have their own legal-effect checks. Do not
    // invoke them blindly when no measurable utility is available.
    return true;
  }
  function usefulClassicTrainer(state,side,action){
    const card=data.cardById(action.cardId),s=state.sides[side],foe=state.sides[foeOf(side)];
    if(!card)return false;
    if((card.trainerType==='Stadium'||card.trainerSubtype==='Stadium'))return stadiumWorthPlaying(state,side,card);
    if(card.id==='neo3-64')return (s.discard||[]).some(ref=>{const c=data.cardById(ref.cardId);return c?.kind==='trainer'||c?.kind==='pokemon';});
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
    const energy=core.effectiveEnergy(state,side,slot);
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
    if(action.type==='stadiumAction')return worthwhileStadiumAction(state,side,action)?850:-100;
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
    const s=state.sides[side];const progress=Number(state.format==='classic'?s.prizesTaken:s.points)||0;let score=progress*(level>=2?700:350)+s.hand.length*4;
    for(const slot of slots(s)){
      const card=data.cardById(slot.cardId),hp=core.maxHp(state,side,slot),remaining=Math.max(0,hp-Number(slot.damage||0));
      const attacks=card.attacks||[],need=Math.min(...attacks.map(a=>deficit(slot,a,state,side)),99),power=Math.max(0,...attacks.filter(a=>deficit(slot,a,state,side)===0).map(a=>Number(a.damage||0)));
      const active=slot===s.active,points=Number(card.points||1);
      score+=remaining*.24+remaining/hp*12+Math.min(80,Number(card.hp||0))*.06;
      score+=Math.max(0,35-need*12)+(active?power*.3:power*.12);
      // Energy beyond attack needs has little value; extra Energy attacks are valued
      // through their actual engine result in the action search.
      const maxCost=Math.max(1,...attacks.map(a=>String(a.cost||'').length));
      score+=Math.min(effects.totalEnergy(core.effectiveEnergy(state,side,slot)),maxCost)*9;
      if(slot.tool)score+=8;if(slot.attackGuard)score+=8;
      if(level>=2){score-=Object.keys(slot.conditions||{}).length*(active?14:2);score-=Number(slot.damage||0)/hp*points*(progress>=(state.format==='classic'?4:2)?24:10);}
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
  // The AI cannot see hidden deck order. This projected state replaces both
  // decks with anonymous cards. Certain *legal* actions (e.g. Gym Heroes Good
  // Manners searching for a Basic) therefore cannot be replayed on the
  // projection: the anonymous deck contains no searchable Basic Pokémon.
  // Those actions need a heuristic, not an exception that freezes the CPU.
  // Do not inspect the hidden real deck as a workaround.
  function actionBonus(action,position,side,level){
    let bonus=0;
    if(action.type==='attach')bonus+=attachScore(action,position,side)*.12;
    if(action.type==='evolve')bonus+=4;
    if(action.type==='trainer'){
      const card=data.cardById(action.cardId);
      if(card?.trainerType==='Stadium'||card?.trainerSubtype==='Stadium')bonus+=stadiumUtility(position,side,card,side)*.5;
      else bonus+=2+searchOpportunity(card?.effect,position.sides[side]);
    }
    if(action.type==='stadiumAction'&&action.cardId==='neo3-61'&&position.sides[side]?.active?.damage>0)bonus+=32;
    if(action.type==='ability')bonus+=searchOpportunity(abilityEffect(data.cardById(action.cardId),action.abilityIndex),position.sides[side]);
    if(action.type==='endTurn')bonus-=4;
    if(action.type==='retreat')bonus-=level>=2?7:12;
    return bonus;
  }
  function evaluate(position,action,side,level){
    let next=null;
    try{
      next=clone(position);
      core.applyAction(next,side,action);
      return {action,score:value(next,side,level)+actionBonus(action,position,side,level),next};
    }catch(error){
      // Only the hypothetical branch failed. The original action was obtained
      // from legalActions on the real state, so it remains playable. Retain a
      // conservative score without an invalid follow-up state.
      return {action,score:value(position,side,level)+actionBonus(action,position,side,level),next:null,projectionUnavailable:true};
    }
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
    // Healing Field is a once-per-turn Stadium action, not a Trainer card.
    // Resolve it while there is damage to heal; don't leave it unused because
    // one hidden-RNG simulation happened to turn up tails.
    if(state.format==='classic'&&state.phase==='battle'){
      const heal=legal.find(a=>a.type==='stadiumAction'&&a.cardId==='neo3-61');
      if(heal&&worthwhileStadiumAction(state,side,heal))return heal;
    }
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
    // Effect choices may expose private deck/hand cards. Advanced search works
    // on a redacted public projection, where those card UIDs/positions are not
    // available; simulating a choice there is both invalid and information
    // leakage. Choose from the actual legal set instead.
    if(state.format==='classic'&&state.phase==='effectChoice')return legal.find(a=>a.choiceSkip===true&&state.pendingChoice?.optional===true)||legal[0];
    if(level===0)return legal.map((action,index)=>({action,index,score:beginner(action,state,side)})).sort((a,b)=>b.score-a.score||a.index-b.index)[0].action;
    const position=publicPosition(state,side),ranked=legal.map(action=>evaluate(position,action,side,level)).sort((a,b)=>b.score-a.score);
    // Expert scores short sequences with the real action engine: e.g. damage boost
    // before the winning attack, draw before attachment, switch before a useful KO.
    if(level===3&&ranked[0].score<1000000){
      for(const candidate of ranked.slice(0,8)){
        const next=candidate.next;if(!next||next.phase!=='battle'||next.activeSide!==side)continue;
        const follow=core.legalActions(next,side);let best=candidate.score;
        for(const action of follow){const future=evaluate(next,action,side,level);best=Math.max(best,future.score-1);}
        candidate.score=best;
      }
      ranked.sort((a,b)=>b.score-a.score);
    }
    const selected=ranked[0].action;
    // The Classic Basic Energy Zone grants one attachment per turn. There is
    // no reason to throw that opportunity away while a legal target exists.
    // Finish draws/evolutions/Trainers first if the search wants them, but
    // attach before committing to an attack or voluntarily ending the turn.
    if(state.format==='classic'&&state.phase==='battle'&&['attack','endTurn'].includes(selected.type)){
      const options=legal.filter(action=>action.type==='attach');
      if(options.length){
        options.sort((a,b)=>attachScore(b,state,side)-attachScore(a,state,side));
        return options[0];
      }
    }
    return selected;
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
  return {DIFFICULTIES,sameAction,chooseAction,runTurn,_test:{deficit,sideValue}};
});
