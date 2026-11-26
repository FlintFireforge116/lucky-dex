(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./tcgp-battle-core.js'),require('./tcgp-battle-data.js'),require('./tcgp-battle-effects.js'));
  else root.LuckyDexTCGPBattleAI=factory(root.LuckyDexTCGPBattleCore,root.LuckyDexTCGPBattleData,root.LuckyDexTCGPBattleEffects);
})(typeof globalThis!=='undefined'?globalThis:this,function(core,data,effects){
  'use strict';
  const DIFFICULTIES=['Beginner','Intermediate','Advanced','Expert'];
  const ACTION_KEYS=['type','handIndex','cardId','target','benchIndex','attackIndex','attackCardId','abilityIndex','effectTarget','effectBenchIndex','choiceTarget','choiceBenchIndex','choiceHandIndex','choiceDiscardIndex','choiceDeckIndex','choiceCardId','choiceAttackIndex','choiceToolIndex','choicePrizeIndex','choiceOption','choiceSkip','effectEnergyType','effectSpecialEnergyUid','effectSelection','copiedEffectSelection'];
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
  function usefulClassicTool(state,side,action,card){
    const ss=state.sides[side];
    // Opponent-targeting Team Flare Tools have their own printed legality.
    if(String(action.target||'').startsWith('opponent'))return true;
    const slot=slotFor(ss,action.target,action.benchIndex),mon=data.cardById(slot?.cardId);
    if(!slot||!effects.usefulToolRecipient(card,mon))return false;
    if(effects.spiritLinkSpecies(card)){
      // It is reasonable to reserve a matching Link for a future Mega in
      // our own deck, but never spend it on a different species or on an
      // already evolved Mega. This is deck composition, not deck order.
      if(effects.toolEffectsSuppressed(state,data.cardById,slot))return false;
      if([slot.tool,...(slot.extraTools||[])].some(r=>effects.spiritLinkSpecies(data.cardById(r?.cardId))===effects.spiritLinkSpecies(card)))return false;
      return [...ss.hand,...ss.deck].some(r=>effects.spiritLinkEvolution(card,data.cardById(r.cardId)));
    }
    if(/ium Z: /.test(card.name||'')&&(ss.sm11GxLocked||ss.gxAttackUsed&&!(ss.sm12WaterGxTurn===state.turnNumber&&effects.effectiveTypes(state,side,slot,data.cardById).includes('Water'))))return false;
    // Never attach an HP-reducing Tool if the attachment itself would KO us.
    if(card.name==='Island Challenge Amulet'&&core.maxHp(state,side,slot)-Number(slot.damage||0)<=100)return false;
    return true;
  }
  function usefulClassicTrainer(state,side,action){
    const card=data.cardById(action.cardId),s=state.sides[side],foe=state.sides[foeOf(side)];
    if(!card)return false;
    if(action.swsh4Substitution)return s.deck.length>0;
    if(card.trainerType==='Tool'&&!usefulClassicTool(state,side,action,card))return false;
    if(card.effect?.rule==='swsh2ToolScrapper')return slots(foe).some(p=>p.tool||p.extraTools?.length);
    if(card.effect?.rule==='swsh2ScoopNet')return slots(s).some(p=>{const c=data.cardById(p.cardId);return !c?.pokemonV&&!c?.pokemonGX&&(p!==s.active||s.bench.length)&&Number(p.damage||0)>=Math.max(40,core.maxHp(state,side,p)-40)&&attachedCount(p)<=1;});
    if(card.id==='sm11-186')return s.hand.some(r=>data.cardById(r.cardId)?.kind==='pokemon'&&data.cardById(r.cardId)?.attacks?.length);
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
    const raw=active?Number(core.attackDamagePreview(state,side,attackIndex,attackCardId,false)?.damage||0):Number(attack.damage||0);
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
    if(action.type==='sm11ElectricSwamp'||action.type==='sm8HandAbility'||action.type==='abilityDiscard'&&action.cardId==='sm8-97')return 800;
    if(action.type==='ability')return dangerous(abilityEffect(card,action.abilityIndex))?-100:800;
    if(action.type==='trainer')return !action.swsh4Substitution&&dangerous(card?.effect)?-100:700;
    if(action.type==='stadiumAction')return worthwhileStadiumAction(state,side,action)?850:-100;
    if(action.type==='bench'||action.type==='legendBench')return action.type==='legendBench'?720:600;
    if(action.type==='attach'||action.type==='attachSpecial')return 400+attachScore(action,state,side);
    if(action.type==='attack'){
      const attack=data.cardById(action.attackCardId||state.sides[side].active.cardId)?.attacks[action.attackIndex];
      // Explosive Jet has no printed fixed damage: score its explicitly chosen
      // discard amount rather than treating every option as a zero-damage hit.
      const fireCount=/^count:(\d+)$/.exec(String(action.effectSelection||''));
      let damage=attack?.effect?.rule==='xy5:explosiveJet'&&fireCount?Number(fireCount[1])*50:Number(attack?.damage||0);
      if(attack?.effect?.rule==='swsh4GulpMissile'){
        const n=String(action.effectSelection||'').split(',').filter(Boolean).length,target=state.sides[foeOf(side)].active;
        const remaining=target?core.maxHp(state,foeOf(side),target)-Number(target.damage||0):Infinity;
        const hit=target?effects.attackDamageWithState(state,side,state.sides[side].active,foeOf(side),target,60*n,data.cardById):0;
        return 200+Math.min(hit,remaining)-n*2+(hit>=remaining?100:0);
      }
      if(attack?.name==='Ball Juggling'&&attack?.effect?.type==='chooseDiscardForBonus'){
        const n=String(action.effectSelection||'').split(',').filter(Boolean).length,target=state.sides[foeOf(side)].active;
        const remaining=target?core.maxHp(state,foeOf(side),target)-Number(target.damage||0):Infinity;
        const hit=target?effects.attackDamageWithState(state,side,state.sides[side].active,foeOf(side),target,10+40*n,data.cardById):0;
        return 200+Math.min(hit,remaining)-n*2+(hit>=remaining?100:0);
      }
      if(attack?.effect?.rule==='swsh7ExtremeFreeze')damage=60*slots(state.sides[side]).reduce((n,p)=>n+Number(p.energy?.Water||0)+(p.specialEnergy||[]).filter(r=>effects.attachedSpecialProvidesType(r,'Water',p,data.cardById,state)).length,0);
      if(attack?.effect?.rule==='swsh7YogaLoop'){const foe=state.sides[foeOf(side)],p=action.target==='opponentBench'?slotFor(foe,'bench',action.benchIndex):foe.active;return p&&core.maxHp(state,foeOf(side),p)-Number(p.damage||0)<=20?430:10;}
      if(attack?.effect?.rule==='swsh7LivePainting')damage=30+30*String(action.effectSelection||'').split(',').filter(Boolean).length;
      if(attack?.effect?.rule==='swsh7JudgmentSurge')damage=40*Number(state.sides[foeOf(side)].prizesTaken||0);
      if(attack?.effect?.rule==='swsh7ElectronCrush'){
        const target=state.sides[foeOf(side)].active,me=state.sides[side].active,remaining=target?core.maxHp(state,foeOf(side),target)-Number(target.damage||0):Infinity,hit=n=>target?effects.attackDamageWithState(state,side,me,foeOf(side),target,n,data.cardById):0;
        if(action.effectSelection)return 200+Math.min(remaining,hit(220))-35+(hit(220)>=remaining&&hit(100)<remaining?100:0);return 200+Math.min(remaining,hit(100))+(hit(100)>=remaining?100:0);
      }
      if(attack?.effect?.rule==='swsh6Tentacles')damage=40*state.sides[side].hand.filter(r=>data.cardById(r.cardId)?.rapidStrike).length;
      if(['swsh7SpiralBurst','swsh7MaxBurst'].includes(attack?.effect?.rule)){const p=state.sides[side].active;damage=20+80*Math.min(attack.effect.rule==='swsh7SpiralBurst'?2:Infinity,Math.max(Number(p.energy?.Fire||0),Number(p.energy?.Lightning||0)));}
      if(attack?.effect?.rule==='swsh6MaxLance')damage=10+120*Math.min(2,attachedCount(state.sides[side].active));
      if(attack?.effect?.rule==='swsh6RepeatedStrike')damage=120+30*slots(state.sides[side]).reduce((n,p)=>n+attachedCount(p),0);
      if(attack?.effect?.rule==='swsh4FlyingFury')damage=10+40*slots(state.sides[side]).reduce((n,p)=>n+(p.tool?1:0)+(p.extraTools||[]).length,0);
      if(attack?.effect?.rule==='swsh35Whisk')damage=60*slots(state.sides[side]).reduce((n,p)=>n+attachedCount(p),0);
      if(attack?.effect?.rule==='swsh2MiningRush')damage=30*Number(action.effectSelection||0);
      if(attack?.effect?.rule==='swsh2SpiralJet'&&!action.effectSelection)damage=0;
      if((action.attackCardId||state.sides[side].active.cardId)==='xy7-49'&&attack?.name==='Iron Cannon'){
        // Don't throw away all attached Metal for an unnecessary +80; do
        // choose the discard when it actually secures a knockout.
        const target=state.sides[foeOf(side)].active;
        const remaining=target?core.maxHp(state,foeOf(side),target)-Number(target.damage||0):Infinity;
        if(action.effectSelection==='discard')return 200+(remaining>80&&remaining<=160?220:20);
        damage=80;
      }
      return 200+damage;
    }
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
      if(slot.tool){const tool=data.cardById(slot.tool.cardId);if(!tool||state.format!=='classic'||effects.usefulToolRecipient(tool,card))score+=8;}if(slot.attackGuard)score+=8;
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
      else bonus+=2+searchOpportunity(action.swsh4Substitution?{type:'draw',amount:3}:card?.effect,position.sides[side]);
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
      if(power?.name==='Buzzap Generator'){const board=state.sides[side],enemy=state.sides[foeOf(side)];if(enemy.prizes.length<=1||!board.active||board.active===source||!effects.effectiveTypes(state,side,board.active,data.cardById).includes('Lightning')||attachedCount(board.active)>=3||!(board.energySupply||[]).includes('Lightning')&&!board.deck.some(r=>data.cardById(r.cardId)?.basicEnergy&&data.cardById(r.cardId)?.subtype==='Lightning'))return false;}
      if(power?.effect?.rule==='swsh7RapidConnection'){
        const board=state.sides[side],active=board.active;
        if(!active||!data.cardById(active.cardId)?.rapidStrike||!board.bench.some(p=>attachedCount(p)>0)||!(data.cardById(active.cardId)?.attacks||[]).some(a=>!effects.canPayCost(core.effectiveEnergy(state,side,active),a.cost)))return false;
      }
      if(power?.effect?.rule==='swsh5MetalTransfer'){
        const board=state.sides[side],active=board.active;
        if(!active||!(data.cardById(active.cardId)?.attacks||[]).some(a=>!effects.canPayCost(core.effectiveEnergy(state,side,active),a.cost)))return false;
        if(!board.bench.some(p=>Number(p.energy?.Metal)>0||(p.specialEnergy||[]).some(x=>effects.attachedSpecialProvidesType(x,'Metal',p,data.cardById,state))))return false;
      }
      if(power?.effect?.rule==='swsh2AppleDrop'&&source===state.sides[side].active&&!state.sides[side].bench.length)return false;
      return !(power?.oncePerTurn===false&&state.sides[side].abilityUsed?.[source.uid+':'+index]===state.sides[side].turnCount);
    });
    if(!legal.length)return null;
    if(state.format==='classic'&&state.phase==='battle'){
      const ss=state.sides[side];
      const whisk=legal.find(a=>a.type==='attack'&&data.cardById(a.attackCardId||ss.active?.cardId)?.attacks?.[a.attackIndex]?.effect?.rule==='swsh35Whisk');
      const target=state.sides[foeOf(side)].active;
      if(whisk&&target&&!legal.some(a=>['attach','attachSpecial','evolve','ability','trainer'].includes(a.type))){
        const raw=60*slots(ss).reduce((n,p)=>n+attachedCount(p),0),remaining=core.maxHp(state,foeOf(side),target)-Number(target.damage||0);
        if(effects.attackDamageWithState(state,side,ss.active,foeOf(side),target,raw,data.cardById)>=remaining)return whisk;
      }
      const link=legal.find(a=>a.type==='trainer'&&effects.spiritLinkSpecies(data.cardById(a.cardId))&&legal.some(e=>e.type==='evolve'&&e.target===a.target&&e.benchIndex===a.benchIndex&&effects.spiritLinkEvolution(data.cardById(a.cardId),data.cardById(e.cardId||ss.hand[e.handIndex]?.cardId))));
      if(link)return link;
    }
    if(state.phase==='effectChoice'&&state.pendingChoice?.special==='swsh2NaturalDraw')return legal.find(x=>x.choiceOption===1)||legal[0];
    if(state.phase==='effectChoice'&&state.pendingChoice?.effect?.rule==='sm11Quiz'&&state.pendingChoice.effect.stage==='guess')return legal[Math.floor(core.random(state)*legal.length)];
    if(state.format==='classic'&&state.phase==='effectChoice'&&state.pendingChoice?.special==='skyFieldBenchTrim'){
      const bench=state.sides[side].bench;
      const score=action=>{
        const slot=bench.find(p=>Number(p.benchSlot)===Number(action.choiceBenchIndex));
        if(!slot)return Infinity;
        const card=data.cardById(slot.cardId),energy=attachedCount(slot);
        const stage=card?.stage==='Stage 2'?45:card?.stage==='Stage 1'?20:0;
        return stage+energy*15+(slot.tool?9:0)+(slot.specialEnergy||[]).length*5+
          Math.max(0,Number(card?.hp||0)-Number(slot.damage||0))*.09;
      };
      return legal.filter(a=>a.type==='effectChoice').sort((a,b)=>score(a)-score(b))[0]||legal[0];
    }
    if(state.format==='classic'&&state.phase==='battle'&&state.sides[side]?.active?.cardId==='ex15-10'&&
       Number(state.sides[side].active.damage||0)>=20&&
       !state.sides[side].active.conditions?.sleep){
      const doze=legal.find(a=>a.type==='ability'&&a.cardId==='ex15-10'&&a.abilityIndex===1);
      if(doze)return doze;
    }
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
    // Snorlax δ Dozing is an optional Power: do not habitually pick the first
    // (decline) option when it can heal and activate Bedhead between turns.
    if(state.format==='classic'&&state.phase==='effectChoice'&&
       String(state.pendingChoice?.effect?.rule||'').startsWith('ex15:10:power')){
      const source=state.sides[side]?.active;
      const heal=legal.find(a=>a.type==='effectChoice'&&a.choiceOption===1);
      if(source?.cardId==='ex15-10'&&Number(source.damage||0)>=10&&heal)return heal;
    }
    // Roaring Skies Serene Grace: the CPU must actually attach the revealed
    // Zone Basic Energy, not choose the first ('Done') option repeatedly.
    // All choices are drawn from its own known Zone and public Pokémon.
    if(state.format==='classic'&&state.phase==='effectChoice'&&state.pendingChoice?.originSide===side){
      const pending=state.pendingChoice,e=pending.effect||{},choices=legal.filter(a=>a.type==='effectChoice');
      if(e.rule==='swsh7RapidConnection'){
        const board=state.sides[side],stop=choices.find(a=>a.choiceSkip);
        if(e.stage==='target')return choices.find(a=>a.choiceTarget==='active')||choices[0];
        return choices.find(a=>!a.choiceSkip&&e.units?.[a.choiceOption]?.source!==board.active?.uid)||stop||choices[0];
      }
      if(e.rule==='swsh7MirrorPain'){const board=state.sides[side];return choices.sort((a,b)=>Number(slotFor(board,b.choiceTarget,b.choiceBenchIndex)?.damage||0)-Number(slotFor(board,a.choiceTarget,a.choiceBenchIndex)?.damage||0))[0];}
      if(e.rule==='swsh7TrickySteps'){const board=state.sides[foeOf(side)];if(e.stage==='energy')return choices.find(a=>!a.choiceSkip&&e.opts?.[a.choiceOption]?.uid)||choices.find(a=>!a.choiceSkip)||choices[0];return choices.sort((a,b)=>attachedCount(slotFor(board,a.choiceTarget,a.choiceBenchIndex))-attachedCount(slotFor(board,b.choiceTarget,b.choiceBenchIndex)))[0];}
      if(e.rule==='swsh7ZapperKick'){const board=state.sides[side],enemy=state.sides[foeOf(side)],target=enemy.active;return target&&target.damage<core.maxHp(state,foeOf(side),target)&&!target.conditions?.paralysis&&attachedCount(board.active)<=3?choices.find(a=>!a.choiceSkip)||choices[0]:choices.find(a=>a.choiceSkip)||choices[0];}
      if(pending.special==='swsh7SpiritMask')return choices.slice().sort((a,b)=>{const v=x=>{const c=data.cardById(state.sides[side].hand[x.choiceHandIndex]?.cardId);return c?.basicEnergy?0:c?.kind==='energy'?2:c?.kind==='trainer'?1:3;};return v(a)-v(b);})[0];
      if(e.rule==='swsh7BubblePod'){
        const picks=choices.filter(a=>!a.choiceSkip);
        if(pending.kind==='option')return picks.sort((a,b)=>b.choiceOption-a.choiceOption)[0]||choices[0];
        return picks.sort((a,b)=>Number(data.cardById(b.choiceCardId)?.hp||0)-Number(data.cardById(a.choiceCardId)?.hp||0))[0]||choices[0];
      }
      if(e.rule==='swsh7ElementChain')return choices.find(a=>!a.choiceSkip&&a.choiceTarget==='active')||choices.find(a=>!a.choiceSkip)||choices[0];
      if(e.rule==='swsh6HiddenClaw')return choices.find(a=>!a.choiceSkip&&e.opts?.[a.choiceOption]?.side===foeOf(side))||choices.find(a=>a.choiceSkip)||choices[0];
      if(['swsh6DiscardAttach','swsh6BlissfulBlast'].includes(e.rule))return choices.find(a=>!a.choiceSkip)||choices[0];
      if(e.type==='redistributeEnergy'&&e.optional){
        if(e.phase==='continue')return choices.find(a=>a.choiceLabel==='Done')||choices[0];
        if(e.remaining)return choices.find(a=>a.choiceTarget==='active')||choices[0];
        return choices.find(a=>!a.choiceSkip&&a.choiceTarget==='bench')||choices.find(a=>a.choiceSkip)||choices[0];
      }
      if(e.rule==='swsh45VTransformation'){
        const board=state.sides[side],source=slots(board).find(p=>p.uid===pending.sourceUid),stop=choices.find(a=>a.choiceSkip);
        if(!source)return stop||choices[0];
        const score=c=>!c||Number(c.hp||0)<=Number(source.damage||0)?-Infinity:Number(c.hp||0)+Math.max(0,...(c.attacks||[]).map(a=>Number(a.damage||0)));
        const picks=choices.filter(a=>!a.choiceSkip&&data.cardById(a.choiceCardId)?.name!=='Ditto V').sort((a,b)=>score(data.cardById(b.choiceCardId))-score(data.cardById(a.choiceCardId)));
        return picks.length&&score(data.cardById(picks[0].choiceCardId))>score(data.cardById(source.cardId))?picks[0]:stop||choices[0];
      }
      if(e.rule==='swsh5MetalTransfer'){
        const board=state.sides[side],stop=choices.find(a=>a.choiceSkip);
        if(e.stage==='target')return choices.find(a=>a.choiceTarget==='active')||choices[0];
        return choices.find(a=>!a.choiceSkip&&e.units?.[a.choiceOption]?.source!==board.active?.uid)||stop||choices[0];
      }
      if(['swsh5EarMoves','swsh5Evomancy','swsh5PowerSplit','swsh5Sordward'].includes(e.rule))return choices.find(a=>!a.choiceSkip)||choices[0];
      if(['swsh5Mustard','swsh5Stance','swsh5Roar','swsh5Urn','swsh5BallSearch','swsh5SpringBloom','swsh45BallGuy','swsh3DarkAsset','swsh3FamiliarBell','swsh3Breeder','swsh3Rose','swsh3SpiderNet','swsh3ShuffleDance'].includes(e.rule))return choices.find(a=>!a.choiceSkip)||choices[0];
      if(e.rule==='sm10Kaleidostorm'&&slots(state.sides[side]).some(p=>p.uid===pending.sourceUid&&p.cardId==='swsh3-147')){
        const board=state.sides[side],stop=choices.find(x=>x.choiceSkip);
        if(e.stage==='source')return choices.find(x=>!x.choiceSkip&&e.opts?.[x.choiceOption]?.p!==board.active?.uid)||stop||choices[0];
        return choices.find(x=>x.choiceTarget==='active')||stop||choices[0];
      }
      if(e.rule==='swsh2ToolScrapper')return choices.find(a=>!a.choiceSkip&&e.opts?.[a.choiceOption]?.owner===foeOf(side))||choices.find(a=>a.choiceSkip)||choices[0];
      if(e.rule==='swsh2ScoopNet'){const ss=state.sides[side],score=a=>{const p=slotFor(ss,a.choiceTarget,a.choiceBenchIndex);return Number(p?.damage||0)-attachedCount(p)*40;};return choices.sort((a,b)=>score(b)-score(a))[0];}
      if(['swsh2RecoverBasic','swsh2TarGenerator'].includes(e.rule))return choices.find(a=>!a.choiceSkip)||choices[0];
      if(e.rule==='swsh2AppleDrop'){const ss=state.sides[side],source=slots(ss).find(p=>p.uid===pending.sourceUid);if(source===ss.active&&!ss.bench.length)return choices.find(a=>a.choiceSkip)||choices[0];return choices.find(a=>!a.choiceSkip)||choices[0];}
      if(e.rule==='swsh2Milo'){const ss=state.sides[side],pick=choices.filter(a=>!a.choiceSkip).sort((a,b)=>{const score=x=>{const c=data.cardById(ss.hand[x.choiceHandIndex]?.cardId);return c?.kind==='energy'?0:c?.kind==='trainer'?1:2;};return score(a)-score(b);});return ss.deck.length?pick[0]||choices[0]:choices.find(a=>a.choiceSkip)||choices[0];}
      // Ancient Origins M Sceptile-EX: Jagged Saber is optional but valuable.
      // Choose genuine Grass Basic Energy already in hand and a useful Bench
      // recipient; never manufacture Energy from the separate Energy Zone.
      // Ancient Origins hybrid Thunder Rod: four attack coin flips gate the
      // genuine top-four Zone Lightning units. Offered attachment choices
      // already enforce remaining heads; attach rather than default to Done.
      if(e.type==='xy7ThunderRod'&&pending.kind==='option')
        return choices.find(a=>a.choiceOption===1)||choices[0];
      // Entei's milled Fire Energy MUST be placed on real Pokémon. Prefer a
      // beneficiary with a Fire attack and few attached Energy units.
      if(e.type==='xy7BurningRoar'&&pending.kind==='pokemon'){
        const ss=state.sides[side];
        const score=a=>{
          const slot=a.choiceTarget==='active'?ss.active:ss.bench.find(p=>Number(p?.benchSlot)===Number(a.choiceBenchIndex));
          const card=data.cardById(slot?.cardId),fireAttack=card?.attacks?.some(at=>(at.cost||[]).includes('R'));
          return (fireAttack?50:0)-attachedCount(slot)*8+(a.choiceTarget==='active'?4:0);
        };
        choices.sort((a,b)=>score(b)-score(a));return choices[0];
      }
      if(e.type==='xy7SolarBirth'&&pending.kind==='option'&&e.phase==='zone'){
        // Keep accelerating while there is real Energy remaining. The
        // choices themselves prove that the Zone still contains that type.
        return choices.find(a=>Number(a.choiceOption)>0)||choices[0];
      }
      if(e.type==='xy7DigitalReboot'&&pending.kind==='option'){
        // Choose to de-evolve Bench Pokémon only when there are hand cards to
        // regain; preserve evolved attackers for the next turn otherwise.
        return choices.find(a=>a.choiceOption===0)||choices[0];
      }
      if(e.type==='xy7JaggedSaber'){
        if(pending.kind==='handCard'){
          const hand=state.sides[side]?.hand||[];
          const useful=choices.filter(a=>!a.choiceSkip&&Number.isInteger(a.choiceHandIndex)&&
            data.cardById(hand[a.choiceHandIndex]?.cardId)?.basicEnergy===true&&
            ['Grass'].includes(data.cardById(hand[a.choiceHandIndex]?.cardId)?.subtype||
              data.cardById(hand[a.choiceHandIndex]?.cardId)?.energyType));
          if(useful.length)return useful[0];
          return choices.find(a=>a.choiceSkip)||choices[0];
        }
        if(pending.kind==='pokemon'){
          const bench=state.sides[side]?.bench||[];
          const score=a=>{
            const slot=bench.find(p=>p&&Number(p.benchSlot)===Number(a.choiceBenchIndex));
            if(!slot)return -Infinity;
            const card=data.cardById(slot.cardId);
            return Math.min(Number(slot.damage||0),120)*2+
              ((card?.types||[]).includes('Grass')?30:0)-attachedCount(slot)*6;
          };
          const valid=choices.filter(a=>a.choiceTarget==='bench');
          valid.sort((a,b)=>score(b)-score(a));
          return valid[0]||choices[0];
        }
      }
      const grace=e.type==='attachTopZoneEnergy'||e.type==='chooseOption'&&e.options?.some(o=>o.effect?.type==='attachTopZoneEnergy');
      if(grace){
        if(e.type==='chooseOption')return choices.find(a=>a.choiceOption===0)||choices[0];
        if(pending.kind==='option')return choices.find(a=>a.choiceOption===1)||choices.find(a=>a.choiceOption===0)||choices[0];
        if(pending.kind==='pokemon'){
          const energyType=e.remainingTypes?.[e.selectedIndex];
          const ss=state.sides[side],fakeState={...state,sides:{...state.sides,[side]:{...ss,energyType}}};
          choices.sort((a,b)=>attachScore({type:'attach',target:b.choiceTarget,benchIndex:b.choiceBenchIndex},fakeState,side)-
            attachScore({type:'attach',target:a.choiceTarget,benchIndex:a.choiceBenchIndex},fakeState,side));
          return choices[0];
        }
      }
      if(e.rule==='xy6:wingBuzz'&&pending.kind==='handCard'){
        const hand=state.sides[side].hand||[];
        const score=a=>{
          const card=data.cardById(hand[a.choiceHandIndex]?.cardId);
          return (card?.basicEnergy?0:card?.kind==='trainer'?2:card?.stage==='Stage 2'?5:card?.stage==='Stage 1'?4:3);
        };
        choices.sort((a,b)=>score(a)-score(b));return choices[0];
      }
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
      const available=legal.filter(a=>a.type==='bench'||a.type==='legendBench');
      if(available.length){
        available.sort((a,b)=>Number(data.cardById(b.cardId)?.hp||0)-Number(data.cardById(a.cardId)?.hp||0));
        return available[0];
      }
    }
    if(state.phase==='effectChoice'&&state.pendingChoice?.special==='sm7BeforeAttack'&&state.pendingChoice.rule==='swsh4FlyingFury'){
      const board=state.sides[side],target=state.sides[foeOf(side)].active,stop=legal.find(a=>a.choiceSkip),picks=legal.filter(a=>!a.choiceSkip);
      const remaining=target?core.maxHp(state,foeOf(side),target)-Number(target.damage||0):0;
      const hit=target?effects.attackDamageWithState(state,side,board.active,foeOf(side),target,10+40*Number(state.pendingChoice.count||0),data.cardById):0;
      if(!target||hit>=remaining||!picks.length)return stop||legal[0];
      picks.sort((a,b)=>Number(state.pendingChoice.opts?.[a.choiceOption]?.slotUid===board.active?.uid)-Number(state.pendingChoice.opts?.[b.choiceOption]?.slotUid===board.active?.uid));return picks[0];
    }
    // Finish Whisk payment even beyond the ordinary AI action budget.
    if(state.phase==='effectChoice'&&state.pendingChoice?.special==='sm7BeforeAttack'&&state.pendingChoice.rule==='swsh35Whisk'){
      const me=state.sides[side],foe=foeOf(side),target=state.sides[foe].active;
      const stop=legal.find(a=>a.choiceSkip),picks=legal.filter(a=>!a.choiceSkip);
      const remaining=target?core.maxHp(state,foe,target)-Number(target.damage||0):0;
      const damage=target?effects.attackDamageWithState(state,side,me.active,foe,target,60*Number(state.pendingChoice.count||0),data.cardById):0;
      if(!target||damage>=remaining||!picks.length)return stop||legal[0];
      picks.sort((a,b)=>{const score=x=>{const p=slotFor(me,x.choiceTarget,x.choiceBenchIndex);return (p===me.active?-20:0)+attachedCount(p);};return score(b)-score(a);});
      return picks[0];
    }
    if(state.phase==='effectChoice'&&state.pendingChoice?.special==='swsh5DeepSeaKing')return legal.find(a=>!a.choiceSkip)||legal[0];
    if(state.phase==='effectChoice'&&state.pendingChoice?.effect?.rule==='swsh35Adornment')return legal.find(a=>!a.choiceSkip)||legal[0];
    if(Number(actionCount||0)>=30)return legal.find(a=>a.type==='attachSpecial')||legal.find(a=>a.type==='attach')||legal.find(a=>a.type==='attack')||legal.find(a=>a.type==='endTurn')||legal.find(a=>a.choiceLabel==='Done')||legal[0];
    // Effect choices may expose private deck/hand cards. Advanced search works
    // on a redacted public projection, where those card UIDs/positions are not
    // available; simulating a choice there is both invalid and information
    // leakage. Choose from the actual legal set instead.
    if(state.format==='classic'&&state.phase==='effectChoice'){
      const pending=state.pendingChoice||{},rule=String(pending.effect?.rule||'');
      if(rule==='swsh5Selickt'&&pending.kind==='option'){
        const board=state.sides[side];return legal.find(a=>pending.effect.zones?.[a.choiceOption]===(board.deck.length<=4||board.hand.length<=1?'hand':'deck'))||legal[0];
      }
      if(rule==='swsh5Sordward'&&pending.effect?.stage==='answer')return legal.find(a=>a.choiceOption===0)||legal[0];
      if(rule==='sm9ElectroShaker'||rule==='sm10Kaleidostorm'){
        // Never cycle Energy endlessly between two slots. CPU moves toward its Active only.
        const board=state.sides[side],stop=legal.find(x=>x.choiceSkip);
        if(pending.effect.stage==='source')return legal.find(x=>!x.choiceSkip&&pending.effect.opts?.[x.choiceOption]?.p!==board.active?.uid)||stop||legal[0];
        return legal.find(x=>x.choiceTarget==='active')||stop||legal[0];
      }
      if(rule==='swsh3Breeder'&&pending.effect.amazingBloom||rule==='sm12HandAttach'&&pending.effect.healAll)return legal.find(x=>!x.choiceSkip)||legal[0];
      if(rule==='sm9SearchAttach'&&data.cardById(slots(state.sides[side]).find(p=>p.uid===pending.sourceUid)?.cardId)?.abilities?.some(a=>a.name==='Buzzap Generator')&&pending.effect.stage==='attach')return legal.find(x=>x.choiceTarget==='active')||legal.find(x=>!x.choiceSkip&&x.choiceBenchIndex!==slots(state.sides[side]).find(p=>p.uid===pending.sourceUid)?.benchSlot)||legal[0];
      if(['swsh4CastOffShell','swsh4CaraLiss','swsh4Nessa','swsh4Cheese','swsh4Devolution','swsh35Adornment','sm9TopAttach','sm9SearchAttach','sm9DanceAncients','sm9NineTemptations','sm9AdventurousAppetite'].includes(rule))return legal.find(x=>!x.choiceSkip)||legal[0];
      if(pending.special==='swsh7ToolOverflow'){const board=state.sides[side],p=slots(board).find(x=>x.uid===pending.sourceUid),c=data.cardById(p?.cardId);return legal.find(a=>!effects.usefulToolRecipient(data.cardById(a.choiceCardId),c))||legal[0];}
      if(pending.special==='swsh7PrizeReaction')return legal.find(a=>a.choiceTarget==='active')||legal.find(a=>!a.choiceSkip)||legal[0];
      if(pending.special==='sm7WishPrize')return legal.find(a=>a.choiceOption===1)||legal[0];
      if(pending.special==='sm7Grounding')return legal.find(a=>!a.choiceSkip)||legal[0];
      if(pending.special==='sm7BeforeAttack'&&pending.rule==='swsh6Tentacles'){
        const me=state.sides[side],target=state.sides[foeOf(side)].active,stop=legal.find(a=>a.choiceSkip),picks=legal.filter(a=>!a.choiceSkip);
        const hit=target?effects.attackDamageWithState(state,side,me.active,foeOf(side),target,40*Number(pending.count||0),data.cardById):0;
        if(!target||hit>=core.maxHp(state,foeOf(side),target)-Number(target.damage||0)||!picks.length)return stop||legal[0];
        return picks[0];
      }
      if(pending.special==='sm7BeforeAttack'&&pending.rule==='swsh7ExtremeFreeze'){const me=state.sides[side],target=state.sides[foeOf(side)].active,stop=legal.find(a=>a.choiceSkip),picks=legal.filter(a=>!a.choiceSkip);const hit=target?effects.attackDamageWithState(state,side,me.active,foeOf(side),target,60*Number(pending.count||0),data.cardById):0;if(!target||hit>=core.maxHp(state,foeOf(side),target)-Number(target.damage||0)||!picks.length)return stop||legal[0];return picks.find(a=>a.choiceTarget==='bench')||picks[0];}
      if(pending.special==='sm7BeforeAttack'&&['swsh6MaxLance','swsh6RepeatedStrike'].includes(pending.rule)){
        const me=state.sides[side],target=state.sides[foeOf(side)].active,stop=legal.find(a=>a.choiceSkip),picks=legal.filter(a=>!a.choiceSkip),max=pending.rule==='swsh6MaxLance';
        const hit=target?effects.attackDamageWithState(state,side,me.active,foeOf(side),target,(max?10:120)+(max?120:30)*Number(pending.count||0),data.cardById):0;
        if(!target||hit>=core.maxHp(state,foeOf(side),target)-Number(target.damage||0)||!picks.length)return stop||legal[0];
        picks.sort((a,b)=>{const score=x=>{const p=slotFor(me,x.choiceTarget,x.choiceBenchIndex);return (p===me.active?-20:0)+attachedCount(p);};return score(b)-score(a);});return picks[0];
      }
      if(pending.special==='sm7BeforeAttack'&&['swsh7SpiralBurst','swsh7MaxBurst'].includes(pending.rule)){const me=state.sides[side],target=state.sides[foeOf(side)].active,stop=legal.find(a=>a.choiceSkip),remaining=target?core.maxHp(state,foeOf(side),target)-Number(target.damage||0):0,hit=n=>effects.attackDamageWithState(state,side,me.active,foeOf(side),target,20+80*n,data.cardById);if(!target||hit(0)>=remaining)return stop||legal[0];const picks=legal.filter(a=>!a.choiceSkip).sort((a,b)=>pending.opts[a.choiceOption].n-pending.opts[b.choiceOption].n);return picks.find(a=>hit(pending.opts[a.choiceOption].n)>=remaining)||picks.at(-1)||stop||legal[0];}
      if(pending.special==='sm7BeforeAttack'){
        const picks=legal.filter(a=>!a.choiceSkip),stop=legal.find(a=>a.choiceSkip);
        if(pending.rule==='sandyFear')return picks[0]||stop||legal[0];
        const me=state.sides[side],target=state.sides[foeOf(side)].active;
        const remaining=target?core.maxHp(state,foeOf(side),target)-Number(target.damage||0):0;
        const current=effects.attackDamageWithState(state,side,me.active,foeOf(side),target,(['swsh35Whisk','sm75ExplosiveJet','sm8MindBlown','sm10Fireball','sm10RocketSplash'].includes(pending.rule)?0:pending.rule==='sm8LavaFlow'?50:30)+(['sm10RocketSplash','swsh35Whisk'].includes(pending.rule)?60:50)*Number(pending.count||0),data.cardById);
        if(current>=remaining||!picks.length)return stop||legal[0];
        if(pending.rule==='sm10Fireball')return picks[0]||stop||legal[0];
        // Prefer surplus energy or an already-damaged Bench over draining the Active.
        picks.sort((a,b)=>{const score=x=>{const p=slotFor(me,x.choiceTarget,x.choiceBenchIndex);return (p===me.active?-20:0)+attachedCount(p);};return score(b)-score(a);});
        return picks[0]||stop||legal[0];
      }
      if(pending.effect?.type==='sm7Rule'&&['doubleCharge','redEyes','steelworks','strikeRun','mining','beastBall'].includes(rule)){
        if(rule==='strikeRun'&&pending.effect.stage==='switch')return legal.find(a=>a.choiceSkip)||legal[0];
        return legal.find(a=>!a.choiceSkip)||legal[0];
      }
      // Mysterious Treasures (dp2): pick opposing-player decisions on their
      // own merits. Wager uses a public-state-derived choice, never the hidden
      // opponent selection, and changes its selection after an RPS tie.
      if(rule.startsWith('dp2:')&&pending.kind==='option'){
        const stage=String(pending.effect?.stage||''),choose=n=>legal.find(a=>a.type==='effectChoice'&&a.choiceOption===n);
        if(rule==='dp2:115:teamGalacticsWager'){
          if(stage==='rock'||stage==='foeRock'){
            const round=Number(state.dp2WagerRound||0);
            let hash=((state.rngState>>>0)^Math.imul(round+1,0x9e3779b9)^(side==='player'?0x51cc2341:0xa72d6d8f))>>>0;
            hash^=hash>>>16;hash=Math.imul(hash,0x7feb352d)>>>0;hash^=hash>>>15;
            return choose(hash%3)||legal[0];
          }
          const cap=stage==='drawLoser'?3:6,me=state.sides[side];
          if(stage==='drawUs'||stage==='drawFoe'||stage==='drawLoser'){
            const n=Math.min(cap,Math.max(0,(me?.deck||[]).length),Math.max(0,Number(me?.handLimit||8)-(me?.hand||[]).length));
            return choose(n)||legal[0];
          }
        }
        if(rule==='dp2:3:charityTail'&&stage==='offer'){
          const me=state.sides[side],active=me?.active,health=Number(data.cardById(active?.cardId)?.hp||0)-Number(active?.damage||0);
          return choose(me?.hand?.length>=2&&(health<=80||me.hand.length>3)?1:0)||legal[0];
        }
        if(rule==='dp2:2:powerCancel'&&stage==='offer')return choose(state.sides[side]?.hand?.length>=4?1:0)||legal[0];
        if(rule==='dp2:18:memoryOut'&&stage==='offer')return choose(1)||legal[0];
        if(rule==='dp2:23:evolutionaryToxic'&&stage==='offer')return choose(state.sides[foeOf(side)]?.active?.conditions?.poison?0:1)||legal[0];
        if(rule==='dp2:39:freezeUp'&&stage==='offer')return choose(1)||legal[0];
        if(rule==='dp2:39:iceBind'&&stage==='decision')return choose(state.sides[side]?.hand?.length>1?0:legal.filter(a=>a.type==='effectChoice').length-1)||legal[0];
        if(rule==='dp2:30:trickPlay'&&stage==='guess')return choose((Number(state.turnNumber||0)+(state.rngState>>>0))%2)||legal[0];
      }
      // EX Power Keepers Bench/evolution Powers explicitly say 'may'. The
      // default first-option policy blindly burned/injured our own Active
      // with a Star, even when the opponent gained the same benefit. Evaluate
      // only PUBLIC board state; do not inspect the opponent's hidden hand.
      if(pending.originSide===side&&pending.kind==='option'&&pending.effect?.ex16OptionalPower==='offer'&&
         ['ex16:92:cursedEyes','ex16:99:chillingBreath','ex16:100:crimsonRay',
          'ex16:101:yellowRay','ex16:102:blueRay'].includes(rule)){
        const own=state.sides[side]?.active,enemy=state.sides[foeOf(side)]?.active;
        const myCard=own&&data.cardById(own.cardId),theirCard=enemy&&data.cardById(enemy.cardId);
        const remaining=(p,c)=>p?Number(c?.hp||0)-Number(p.damage||0):0;
        let use=true;
        if(rule==='ex16:100:crimsonRay'){
          const ownBurned=!!own?.conditions?.burn,enemyBurned=!!enemy?.conditions?.burn;
          use=!!enemy&&!enemyBurned&&(ownBurned||remaining(enemy,theirCard)<=20||!own);
        }else if(rule==='ex16:101:yellowRay'){
          use=!!enemy&&(remaining(enemy,theirCard)<=10&&remaining(own,myCard)>10||
            remaining(enemy,theirCard)<remaining(own,myCard)-40);
        }else if(rule==='ex16:102:blueRay'){
          const myDamage=Number(own?.damage||0),theirDamage=Number(enemy?.damage||0);
          const myConditions=!!(own?.conditions?.burn||own?.conditions?.poison||own?.conditions?.sleep||
            own?.conditions?.paralysis||own?.conditions?.confusion);
          const theirConditions=!!(enemy?.conditions?.burn||enemy?.conditions?.poison||enemy?.conditions?.sleep||
            enemy?.conditions?.paralysis||enemy?.conditions?.confusion);
          use=myDamage>theirDamage||myConditions&&!theirConditions;
        }
        const chosen=legal.find(a=>a.type==='effectChoice'&&a.choiceOption===(use?0:1));
        if(chosen)return chosen;
      }
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
      // Power Spray is an opponent-turn interrupt, never a normal Trainer.
      // The AI should cancel an opponent's real Poké-Power if it has three SP
      // in play and the physical Power Spray card in its own hand.
      if(pending.special==='pl1PowerSpray'){
        const interrupt=legal.find(a=>a.type==='effectChoice'&&a.choiceOption===1);
        if(interrupt)return interrupt;
      }
      // Invisible Tentacles requires discarding a *real* hand card to attack.
      // Prefer the cheapest expendable physical card, not an invalid Skip.
      if(pending.special==='pl1InvisibleTentacles'){
        const cards=state.sides[side]?.hand||[];
        const choices=legal.filter(a=>a.type==='effectChoice'&&Number.isInteger(a.choiceHandIndex));
        choices.sort((a,b)=>{
          const score=x=>{const c=data.cardById(cards[x.choiceHandIndex]?.cardId);return c?.kind==='energy'?0:c?.kind==='trainer'?2:3;};
          return score(a)-score(b);
        });
        if(choices.length)return choices[0];
      }
      // Platinum Stage 2: finish beneficial optional attacks/Powers with actual
      // legal choices. This logic uses only our own hand/deck/discard and the
      // publicly visible board; no opposing concealed cards are inspected.
      if(pending.originSide===side&&rule.startsWith('pl1:')){
        const actions=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip),
          key=rule.slice(4),stage=String(pending.effect?.stage||''),us=state.sides[side];
        const pick=(fn)=>actions.find(fn)||actions[0];
        const slot=a=>a.choiceTarget==='active'?us.active:(us.bench||[]).find(p=>p.benchSlot===a.choiceBenchIndex);
        const severity=p=>Number(p?.damage||0)+(p?.conditions?.poison?15:0)+(p?.conditions?.burn?15:0);
        if(key==='lookers'&&pending.kind==='option'){
          if(stage==='who'){
            // Refill our depleted hand, or disrupt a larger enemy hand.
            const ours=(us.hand||[]).length,theirs=state.sides[foeOf(side)]?.hand?.length||0;
            return pick(a=>a.choiceOption===(ours<=2?0:theirs>=5?1:0));
          }
          if(stage==='draw'){
            const recipient=state.sides[pending.effect?.affectedSide]||us,
              count=Math.min(5,Math.max(0,(recipient.deck||[]).length+(recipient.hand||[]).length));
            return pick(a=>a.choiceOption===count);
          }
        }
        if(key==='nurseCall'&&stage==='healing'&&pending.kind==='pokemon'){
          actions.sort((a,b)=>severity(slot(b))-severity(slot(a)));
          if(actions.length)return actions[0];
        }
        if(key==='lifeHerb'&&pending.kind==='pokemon'){
          actions.sort((a,b)=>severity(slot(b))-severity(slot(a)));
          if(actions.length)return actions[0];
        }
        if(key==='reheat'&&pending.kind==='handCard'){
          if((us.deck||[]).length>=2&&actions.length)return actions[0];
        }
        if(['ascension','energyStream','flashBite','hospitality'].includes(key)&&actions.length)return actions[0];
      }
      // Platinum's printed "search for up to N Basic Pokémon and put them on
      // your Bench" attacks are optional. As with Blissey ex Energy
      // Absorption, a CPU should not immediately skip a beneficial choice.
      // Inspect only its own deck and public Bench; no opponent hidden data.
      if(pending.originSide===side&&pending.kind==='deckCard'&&
         pending.effect?.type==='benchFromDeck'&&pending.effect?.choose&&
         ['pl1-17','pl1-73','pl1-75','pl1-86'].includes(state.sides[side]?.active?.cardId)&&
         (state.sides[side]?.bench||[]).filter(Boolean).length<Number(state.sides[side]?.benchLimit||3)){
        const available=legal.filter(a=>a.type==='effectChoice'&&!a.choiceSkip&&Number.isInteger(a.choiceDeckIndex));
        if(available.length){
          const pool=state.sides[side].deck||[];
          available.sort((a,b)=>{
            const rating=action=>{
              const card=data.cardById(pool[action.choiceDeckIndex]?.cardId);
              const wanted=state.sides[side]?.energyType||'Colorless';
              const preferred=card?.deckMeta?.preferredEnergyTypes||[];
              return (preferred.includes(wanted)?100:0)+Number(card?.hp||0)/10+(card?.attacks||[]).length;
            };
            return rating(b)-rating(a);
          });
          return available[0];
        }
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
        'ex10:46:0':['deckCard'],
        // Blissey ex Energy Absorption can recover up to three Energy after
        // attacking. Never auto-skip its optional recovery menu when live
        // discarded Energy are selectable.
        'ex10:101:0':['option']
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
        const follow=core.legalActions(next,side).filter(a=>{const c=data.cardById(a.cardId);return next.format!=='classic'||a.type!=='trainer'||c?.trainerType!=='Tool'||usefulClassicTool(next,side,a,c);});let best=candidate.score;
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
  return {DIFFICULTIES,sameAction,chooseAction,runTurn,_test:{deficit,sideValue,matchupDamage}};
});
