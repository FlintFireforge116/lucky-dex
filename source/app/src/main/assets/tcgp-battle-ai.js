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
  // Double Colorless supplies TWO Colorless units, never Fighting (or any
  // other named type). Judge it by the exact printed attack costs rather than
  // by the raw number of attached Energy. In particular, Brock's Onix #21
  // needs FF/FFF and cannot evolve into an ordinary Steelix.
  function missingForCost(cost,pool){
    const energy={...pool};let need=0;
    for(const code of String(cost||''))if(code!=='C'){
      const type=effects.ENERGY_CODE[code];
      if(Number(energy[type]||0)>0)energy[type]--;
      else if(Number(energy.Miracle||0)>0)energy.Miracle--;
      else need++;
    }
    return need+Math.max(0,[...String(cost||'')].filter(x=>x==='C').length-effects.totalEnergy(energy));
  }
  function doubleColorlessValue(state,side,action){
    const ss=state.sides[side],slot=slotFor(ss,action.target,action.benchIndex);
    if(!slot)return 0;
    const ref=ss.hand[action.handIndex];
    const before=core.effectiveEnergy(state,side,slot);
    const after=core.effectiveEnergy(state,side,{...slot,specialEnergy:[...(slot.specialEnergy||[]),ref]});
    const value=attack=>Math.max(0,missingForCost(attack.cost,before)-missingForCost(attack.cost,after));
    const current=data.cardById(slot.cardId);
    const attackGain=Math.max(0,...(current?.attacks||[]).map(value));
    if(attackGain>0)return attackGain*50;
    // A speculative attachment is only worthwhile if a *real* evolution of
    // this exact named Pokemon exists in the CPU's remaining cards. Do not
    // infer that Brock's Onix can evolve into Steelix.
    const candidates=[...(ss.hand||[]),...(ss.deck||[])];
    const exactName=String(current?.name||'').replace(/[’]/g,"'").trim();
    const evolves=c=>String(c?.evolvesFrom||'').replace(/[’]/g,"'").trim()===exactName;
    if(candidates.some(r=>{const c=data.cardById(r.cardId);return c?.kind==='pokemon'&&evolves(c)&&
      (c.attacks||[]).some(a=>String(a.cost||'').includes('C')&&value(a)>0);})){return 8;}
    return 0;
  }
  function uselessDoubleColorless(state,side,action){
    return action.type==='attachSpecial'&&
      data.cardById(action.cardId)?.name==='Double Colorless Energy'&&
      doubleColorlessValue(state,side,action)<=0;
  }
  // The Classic Energy Zone and an Energy card in hand are TWO independent
  // attachments. An AI that scores only `attach` can draw/recover Basic Energy
  // repeatedly yet never attach the real cards in its hand.
  function attachScore(action,state,side){
    const s=state.sides[side],slot=slotFor(s,action.target,action.benchIndex);if(!slot)return -100;
    const card=data.cardById(slot.cardId),attacks=card?.attacks||[];
    const energyType=action.type==='attach'?s.energyType:null;
    const ref=action.type==='attachSpecial'?s.hand[action.handIndex]:null,handCard=ref?data.cardById(ref.cardId):null;
    const after={...slot,energy:{...(slot.energy||{})},specialEnergy:[...(slot.specialEnergy||[])]};
    if(action.type==='attach'&&energyType)after.energy[energyType]=Number(after.energy[energyType]||0)+1;
    else if(handCard?.basicEnergy)after.energy[handCard.subtype]=Number(after.energy[handCard.subtype]||0)+1;
    else if(handCard?.specialEnergy||handCard?.holonEnergyPokemon)after.specialEnergy.push(handCard?.holonEnergyPokemon?{...ref,provides:['ex11-21','ex11-22'].includes(handCard.id)?{Miracle:2}:{Colorless:1}}:ref);
    else return -100;
    const beforeEnergy=core.effectiveEnergy(state,side,slot),afterEnergy=core.effectiveEnergy(state,side,after);
    const missing=pool=>Math.min(99,...attacks.map(attack=>{
      const energy={...pool};let need=0;
      for(const code of String(attack.cost||''))if(code!=='C'){
        const type=effects.ENERGY_CODE[code];if(Number(energy[type]||0)>0)energy[type]--;else if(Number(energy.Miracle||0)>0)energy.Miracle--;else need++;
      }
      return need+Math.max(0,[...String(attack.cost||'')].filter(code=>code==='C').length-effects.totalEnergy(energy));
    }));
    const gain=missing(beforeEnergy)-missing(afterEnergy);
    // A slot that already uses its best attack gains little from gratuitous
    // Energy. Preserve useful Energy for the next attacker when possible.
    const active=action.target==='active',hasAttack=attacks.length>0;
    let synergyBonus=0;
    if(handCard?.specialEnergy&&/^Holon Energy (?:FF|GL|WP)$/.test(handCard.name||'')){
      const conditions=handCard.deckMeta?.specialEnergyConditions||[];
      const triggers=conditions.filter(rule=>Number(slot.energy?.[rule.basicEnergy]||0)>0);
      const payoff=card?.deckMeta?.specialEnergyPayoffs?.includes('holon-energy');
      // This is a real Colorless attachment either way, but protect its
      // printed benefit: it belongs on an eligible Pokémon, especially a
      // Rayquaza / Castform whose attack changes when Holon Energy is present.
      if(card?.pokemonEx||card?.isEx)synergyBonus-=75;
      else if(payoff)synergyBonus+=110+triggers.length*25;
      else if(triggers.length)synergyBonus+=40*triggers.length;
      else synergyBonus-=35;
    }
    if(handCard?.name==='Double Colorless Energy')synergyBonus+=doubleColorlessValue(state,side,action)>0?doubleColorlessValue(state,side,action):-1000;
    if(handCard?.id==='ex12-82'){
      const eligible=card?.deckMeta?.specialEnergyPayoffs?.includes('react-energy');
      const current=(slot.specialEnergy||[]).filter(r=>r.cardId==='ex12-82').length;
      synergyBonus+=eligible?105-Math.min(2,current)*35:-20;
    }
    return gain*50+(active?15:5)-effects.totalEnergy(beforeEnergy)*2+(hasAttack?4:-10)+synergyBonus;
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
    if(card.id==='ex11-94'){const compatible=ss=>slots(ss).filter(p=>data.cardById(p.cardId)?.deltaSpecies&&Object.values(p.energy||{}).some(n=>Number(n)>0)).length;return 9+12*(compatible(mine)-compatible(foe));}
    if(card.id==='ex11-96'){const hasDelta=ss=>slots(ss).some(p=>data.cardById(p.cardId)?.deltaSpecies);return (hasDelta(mine)?18:0)-(hasDelta(foe)?8:0);}
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
    if(card.id==='ex11-91')return Object.values(s.energyDiscard||{}).some(n=>Number(n)>0)||(s.discard||[]).some(ref=>data.cardById(ref.cardId)?.kind==='pokemon'||data.cardById(ref.cardId)?.basicEnergy);
    if(card.id==='ex11-92')return (s.deck||[]).length>0&&s.hand.length<8;
    if(card.id==='ex11-95')return s.deck.some(ref=>{const c=data.cardById(ref.cardId);return c?.kind==='energy'&&c.subtype==='Metal'||c?.deltaSpecies;});
    if(card.id==='ex11-97')return foe.hand.length>s.hand.length;
    if(card.id==='ex11-98')return [...s.deck,...s.discard].some(ref=>data.cardById(ref.cardId)?.name?.startsWith('Holon ')&&data.cardById(ref.cardId)?.trainerType==='Supporter');
    if(card.id==='ex11-100')return slots(s).length>1;
    if(card.name==='Super Energy Removal')return slots(s).some(x=>attachedCount(x)>0)&&slots(foe).some(x=>attachedCount(x)>=2);
    if(card.name==='Energy Removal')return slots(foe).some(x=>attachedCount(x)>0);
    if(card.name==='Energy Retrieval')return Object.values(s.energyDiscard||{}).some(n=>Number(n)>0)||(s.discard||[]).some(ref=>data.cardById(ref.cardId)?.basicEnergy);
    if(card.name==='Pokémon Center')return slots(s).some(x=>Number(x.damage||0)>0);
    if(['Potion','Super Potion','ex10-95'].includes(card.name)||card.id==='ex10-95')return slots(s).some(x=>Number(x.damage||0)>0);
    if(['Full Heal','Double Full Heal'].includes(card.name))return slots(s).some(x=>Object.values(x.conditions||{}).some(Boolean));
    if(card.name==='Recycle')return (s.discard||[]).length>0;
    if(card.name==='Pokédex')return (s.deck||[]).length>1;
    if(card.id==='ex10-81')return Object.values(s.energyDiscard||{}).some(n=>Number(n)>0)||(s.discard||[]).some(ref=>data.cardById(ref.cardId)?.basicEnergy);
    if(card.id==='ex10-94'||card.name==='Energy Search')return (s.energySupply||[]).length>0||(s.deck||[]).some(ref=>data.cardById(ref.cardId)?.basicEnergy);
    if(card.id==='ex10-86')return (s.deck||[]).length>0;
    // Do not burn a draw-only Supporter after the draw deck has emptied.
    if(card.trainerType==='Supporter'&&/^Draw (?:a card|cards|\d+ cards)/i.test(String(card.text||'').trim()))return (s.deck||[]).length>0;
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
    if(action.type==='attach'||action.type==='attachSpecial')return 400+attachScore(action,state,side);
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
    if(action.type==='attach'||action.type==='attachSpecial')bonus+=attachScore(action,position,side)*.12;
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
      if(state.format==='classic'&&uselessDoubleColorless(state,side,action))return false;
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
    // A Classic CPU with no Bench must not pass up a Basic already in hand.
    // This is especially important for EX Team Magma/Aqua Power Saver: a lone
    // Kyogre/Groudon cannot attack until the team has enough members in play.
    if(state.format==='classic'&&state.phase==='battle'&&!state.sides[side].bench.filter(Boolean).length){
      const available=legal.filter(a=>a.type==='bench');
      if(available.length){
        available.sort((a,b)=>Number(data.cardById(b.cardId)?.hp||0)-Number(data.cardById(a.cardId)?.hp||0));
        return available[0];
      }
    }
    if(Number(actionCount||0)>=30)return legal.find(a=>a.type==='attachSpecial')||legal.find(a=>a.type==='attach')||legal.find(a=>a.type==='attack')||legal.find(a=>a.type==='endTurn')||legal.find(a=>a.choiceLabel==='Done')||legal[0];
    // Effect choices may expose private deck/hand cards. Advanced search works
    // on a redacted public projection, where those card UIDs/positions are not
    // available; simulating a choice there is both invalid and information
    // leakage. Choose from the actual legal set instead.
    if(state.format==='classic'&&state.phase==='effectChoice'){
      const pending=state.pendingChoice||{},rule=String(pending.effect?.rule||'');
      // Charizard δ's evolution-triggered Peal of Thunder is a "may" Power.
      // CPU knows its own 30-card deck composition, not its top-card order:
      // decline when no physical Energy remains rather than milling five
      // otherwise valuable cards for no possible attachment.
      if(pending.originSide===side&&rule==='ex14:4:power'&&pending.kind==='option'&&!pending.effect?.step){
        const hasPhysicalEnergy=(state.sides[side].deck||[]).some(ref=>data.cardById(ref.cardId)?.kind==='energy');
        const wanted=hasPhysicalEnergy?0:1;
        const chosen=legal.find(a=>a.type==='effectChoice'&&a.choiceOption===wanted);
        if(chosen)return chosen;
      }
      // EX Unseen Forces makes many beneficial effects optional. Choosing
      // Skip by default wasted Potions, Fire Dance, Jolteon's Energy ramp,
      // Lanturn's discard recovery, Onix's retrieval and Unown Q's Energy
      // search even though the player had paid the attack/Trainer cost.
      const helpfulEx10={
        'ex10:trainer:95':['pokemon'],
        'ex10:5:0':['pokemon','option'],
        'ex10:8:0':['pokemon'],
        'ex10:40:0':['option'],
        'ex10:65:0':['option'],
        'ex10:Q:0':['option'],
        'ex10:W:0':['option'],
        'ex10:71:0':['deckCard'],
        'ex10:46:0':['deckCard']
      };
      if(pending.originSide===side&&helpfulEx10[rule]?.includes(pending.kind)){
        const available=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
        if(available.length){
          if(rule==='ex10:trainer:95'){
            const ss=state.sides[side],getSlot=a=>slotFor(ss,a.choiceTarget,a.choiceBenchIndex);
            available.sort((a,b)=>Number(getSlot(b)?.damage||0)-Number(getSlot(a)?.damage||0));
          }else if(['ex10:5:0','ex10:8:0'].includes(rule)&&pending.kind==='pokemon'){
            available.sort((a,b)=>attachScore({type:'attach',target:b.choiceTarget,benchIndex:b.choiceBenchIndex},
              {...state,sides:{...state.sides,[side]:{...state.sides[side],energyType:rule==='ex10:5:0'?'Fire':'Lightning'}}},side)-
              attachScore({type:'attach',target:a.choiceTarget,benchIndex:a.choiceBenchIndex},
              {...state,sides:{...state.sides,[side]:{...state.sides[side],energyType:rule==='ex10:5:0'?'Fire':'Lightning'}}},side));
          }
          return available[0];
        }
      }
      // EX Delta Species optional searches and discard recovery should be
      // completed by the CPU instead of automatically selecting Skip.
      const usefulEx11=new Set(['ex11:trainer:91','ex11:trainer:92','ex11:trainer:98',
        'ex11:power:12','ex11:20:0','ex11:45:0','ex11:55:0',
        'ex11:111:0','ex11:112:0','ex11:113:0']);
      if(pending.originSide===side&&usefulEx11.has(rule)&&['option','deckCard','pokemon','handCard'].includes(pending.kind)){
        const available=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
        if(available.length)return available[0];
      }
      // Flygon ex Emerge Charge can retrieve two Energy after evolving. React
      // Energy powers Reactive Blast, so recover it ahead of generic Basic
      // Energy if the physical special card is in the discard pile.
      if(pending.originSide===side&&rule==='ex12:power:87'&&pending.kind==='option'){
        const available=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
        const react=available.find(a=>/React Energy/.test(String(pending.options?.[a.choiceOption]||'')));
        if(react)return react;
        if(available.length)return available[0];
      }
      // EX Legend Maker's printed deck/energy recovery is strategically useful.
      const usefulEx12=new Set(['ex12:power:8','ex12:power:18','ex12:power:43','ex12:7:0',
        'ex12:27:0','ex12:29:0','ex12:48:0','ex12:54:0','ex12:61:0','ex12:64:0','ex12:76','ex12:trainer:76','ex12:trainer:77']);
      if(pending.originSide===side&&usefulEx12.has(rule)){
        const available=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
        if(available.length)return available[0];
      }
      // Energy Recycle System is a TWO-STAGE choice. Skipping both stages
      // after using the Trainer used to leave the CPU's recovered Energy
      // stranded in its discard. Prefer a useful source/destination.
      if(rule==='ex10:trainer:81'){
        const available=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
        if(available.length){
          if(!pending.effect?.recoveryMode&&pending.kind==='option'){
            const handAvailable=!state.sides[side].handEnergyUsed;
            return available.find(a=>a.choiceOption===(handAvailable?0:1))||available[0];
          }
          return available[0];
        }
      }
      // Selecting an actual eligible deck card is better than throwing away
      // a search effect, provided the engine has offered a legal choice.
      if(['deckCard','discardCard'].includes(pending.kind)&&legal.some(a=>a.type==='effectChoice'&&!a.choiceSkip)&&
         ['searchChosen','searchRandomBasic'].includes(pending.effect?.type)){
        return legal.find(a=>a.type==='effectChoice'&&!a.choiceSkip);
      }
      // Energy Search can offer a Zone Energy via an optional option menu.
      // Previously the generic 'optional => Skip' fallback discarded the
      // result of a perfectly legal Energy-search Trainer.
      if(pending.kind==='option'&&pending.effect?.type==='searchChosen'&&
          (pending.effect.zoneTypes||pending.effect.chooseEnergySource)){
        const available=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
        if(available.length){
          // If a physical Basic is also in the deck, use a fresh Zone source
          // by preference; the physical recovered card remains drawable.
          if(pending.effect.chooseEnergySource)return available.find(a=>a.choiceOption>0)||available[0];
          return available[0];
        }
      }
      // EX4's Team Balls, Conspirators, Archie and Call for Family effects
      // offer an *optional* deck search. An earlier generic heuristic always
      // chose Skip, even when a useful Pokémon was actually available. These
      // are beneficial searches, not costs or mandatory exchanges. The CPU
      // must actually take the card (including on Beginner difficulty).
      if(pending.kind==='deckCard'&&rule.startsWith('ex4:')){
        const available=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
        if(available.length){
          const ss=state.sides[side],empty=!ss.bench.filter(Boolean).length;
          const score=a=>{
            const card=data.cardById(a.choiceCardId),basic=card?.kind==='pokemon'&&card.stage==='Basic';
            // If the Bench is empty, retrieve Basics before evolutions;
            // otherwise prefer relevant Pokémon to spare Energy cards.
            return (basic?(empty?1000:500):card?.kind==='pokemon'?200:0)+Number(card?.hp||0)*.01;
          };
          available.sort((a,b)=>score(b)-score(a));
          return available[0];
        }
      }
      return legal.find(a=>a.choiceSkip===true&&pending.optional===true)||legal[0];
    }
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
      const options=legal.filter(action=>action.type==='attach'||action.type==='attachSpecial');
      if(options.length){
        options.sort((a,b)=>attachScore(b,state,side)-attachScore(a,state,side));
        return options[0];
      }
    }
    // Expert's two-ply simulation can sometimes pick a legal Holon attachment
    // solely for its Colorless supply and overlook a printed Body payoff on
    // another target. Keep the shared attachment evaluation authoritative
    // whenever that alternative has a clear synergy advantage.
    if(state.format==='classic'&&selected.type==='attachSpecial'&&
       /^Holon Energy (?:FF|GL|WP)$/.test(data.cardById(selected.cardId)?.name||'')){
      const alternatives=legal.filter(a=>a.type==='attachSpecial'&&a.handIndex===selected.handIndex);
      alternatives.sort((a,b)=>attachScore(b,state,side)-attachScore(a,state,side));
      if(alternatives.length&&attachScore(alternatives[0],state,side)>attachScore(selected,state,side)+25)
       return alternatives[0];
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
