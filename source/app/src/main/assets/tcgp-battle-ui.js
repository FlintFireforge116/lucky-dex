(function(root,factory){
  let deps={
    layout:root&&root.LuckyDexTCGPBattleLayout,
    data:root&&root.LuckyDexTCGPBattleData,
    decks:root&&root.LuckyDexTCGPBattleDecks,
    core:root&&root.LuckyDexTCGPBattleCore,
    ai:root&&root.LuckyDexTCGPBattleAI,
    solo:root&&root.LuckyDexTCGPBattleSolo,
    progress:root&&root.LuckyDexTCGPBattleProgress
  };
  if(typeof module==='object'&&module.exports){
    deps={
      layout:require('./tcgp-battle-layout.js'),data:require('./tcgp-battle-data.js'),decks:require('./tcgp-battle-decks.js'),core:require('./tcgp-battle-core.js'),
      ai:require('./tcgp-battle-ai.js'),solo:require('./tcgp-battle-solo.js'),progress:require('./tcgp-battle-progress.js')
    };
    module.exports=factory(null,deps);
  }else if(root){
    root.LuckyDexTCGPBattleUI=factory(root,deps);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(root,deps){
  'use strict';
  const {layout,data,decks,core,ai,solo,progress}=deps;

  const CHALLENGE_ID='genetic-apex-beginner-ivysaur';
  const PRINT_ART_BY_ID=new Map((data.PRINTS||[]).map(print=>[String(print.id).toUpperCase(),print]));
  let cancelGesture=null;
  let screen='home',builderCards=[],builderName='My Pocket Deck',builderMessage='',builderFilter='',builderEnergyTypes=[],builderEnergyMode='auto',currentPlayerEnergyTypes=[];
  let currentBattle=null,currentChallenge=null,currentPractice=false,currentPlayerDeck=null,resultInfo=null,cpuPending=false,cpuTimer=null,cpuActions=0,battleActionCache=[],battleInspect=null,battleOverlay=null,battleContextActionIndices=[],battleDiscardSide='player',handDragSuppressUntil=0,battleEvent='';

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const el=id=>root&&root.document?root.document.getElementById(id):null;
  const saveNow=()=>{try{if(root&&typeof root.save==='function')root.save();}catch(error){console.error('[TCGP Battle] save failed',error);}};
  const toast=msg=>{try{if(root&&typeof root.showToast==='function')root.showToast(msg,2400);}catch(_){}};
  let battleEventTimer=null,battleEventSerial=0;
  function clearBattleEvent(){clearTimeout(battleEventTimer);battleEventTimer=null;battleEvent='';battleEventSerial++;}
  function setBattleEvent(message){clearBattleEvent();battleEvent=message;const serial=battleEventSerial;battleEventTimer=setTimeout(()=>{if(serial!==battleEventSerial)return;battleEvent='';battleEventTimer=null;el('tcgpBattleContent')?.querySelector('.tcgp-live-action-event')?.remove();},1600);}

  function cardArtUrl(cardId){
    const id=String(cardId||'').toUpperCase(),match=/^([A-Z0-9]+(?:-[A-Z])?)-(\d+)$/.exec(id);
    if(!match||match[1]==='BASIC')return'';
    const rows=root?.state?.cards?Object.values(root.state.cards):[],canonical=data.cardById(cardId)?.id;
    const owned=rows.find(row=>String(row?.id||'').toUpperCase()===id)||rows.find(row=>canonical&&data.gameplayIdForOwned(row)===canonical&&(row.image||row.imageUrl));
    const image=owned?.image||owned?.imageUrl;if(typeof image==='string'&&image)return image;
    const print=PRINT_ART_BY_ID.get(id.replace(/^P([AB])-/,'P-$1-'));
    const set=print?.setId||match[1].replace(/^([AB]\d+)([A-Z])$/,(_,base,suffix)=>base+suffix.toLowerCase()),number=String(Number(match[2])).padStart(3,'0');
    return `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/${set}/${set}_${number}_EN.webp`;
  }
  function sleeveArtPath(sideName){
    const cosmetics=root&&root.LuckyDexCosmeticsV0413;
    if(!cosmetics)return'';
    if(sideName==='player'){
      const entry=cosmetics.activeSleeve?.(root.state||{})||cosmetics.registry?.[root.state?.cosmetics?.activeSleeve];
      return String(entry?.artPath||'');
    }
    return String(cosmetics.registry?.['luckydex-default']?.artPath||'cosmetics/sleeves/luckydex-default.webp');
  }
  function cardName(id){return data.cardById(id)?.name||id||'Card';}
  function cardAbilities(card){return card?.abilities?.length?card.abilities:Array.isArray(card?.ability)?card.ability:card?.ability?[card.ability]:[];}
  function slotName(state,side,target,benchIndex){
    if(String(target||'').startsWith('opponent')){side=side==='player'?'opponent':'player';target=target==='opponentBench'?'bench':'active';}
    const s=state?.sides?.[side];
    const slot=target==='active'?s?.active:(core?.benchSlotAt?core.benchSlotAt(s,benchIndex):s?.bench?.[Number(benchIndex)]);
    return cardName(slot?.cardId);
  }
  function targetLabel(action,state,side){
    const target=action.effectTarget||action.target,index=action.effectTarget?action.effectBenchIndex:action.benchIndex;
    return target?` → ${slotName(state,side,target,index)}${String(target).toLowerCase().includes('bench')?` · Bench ${Number(index||0)+1}`:''}`:'';
  }
  function actionLabel(action,state,side){
    if(!action)return'PLAY';
    if(action.type==='setupActive')return`ACTIVE · ${cardName(action.cardId)}`;
    if(action.type==='setupBench')return`BENCH · ${cardName(action.cardId)}`;
    if(action.type==='setupReady')return'READY';
    if(action.type==='promote')return`PROMOTE · ${slotName(state,side,'bench',action.benchIndex)}`;
    if(action.type==='bench')return`BENCH · ${cardName(action.cardId)}`;
    if(action.type==='evolve')return`EVOLVE ${slotName(state,side,action.target,action.benchIndex)} → ${cardName(action.cardId)}`;
    if(action.type==='trainer')return (action.cardId==='BASIC-POKE-BALL'?'PLAY POKE BALL':`PLAY ${cardName(action.cardId)}`)+targetLabel(action,state,side);
    if(action.type==='ability'){
      const s=state?.sides?.[side],slot=action.target==='bench'?(core.benchSlotAt?core.benchSlotAt(s,action.benchIndex):s?.bench?.[action.benchIndex]):s?.active,card=data.cardById(slot?.cardId);
      const ability=cardAbilities(card)[Number(action.abilityIndex||0)];
      return `${ability?.name||'ABILITY'} · ${cardName(slot?.cardId)}${action.effectTarget?targetLabel(action,state,side):''}`;
    }
    if(action.type==='attach')return`ATTACH ${String(state?.sides?.[side]?.energyType||'Grass').toUpperCase()} → ${slotName(state,side,action.target,action.benchIndex)}`;
    if(action.type==='retreat')return`RETREAT → ${slotName(state,side,'bench',action.benchIndex)}`;
    if(action.type==='attack'){
      const active=state?.sides?.[side]?.active,card=data.cardById(active?.cardId),attack=card?.attacks?.[action.attackIndex];
      return `${attack?.name||'ATTACK'} · ${Number(attack?.damage||0)} DMG${targetLabel(action,state,side)}`;
    }
    if(action.type==='endTurn')return'END TURN';
    return String(action.type||'PLAY').toUpperCase();
  }

  function actionEventText(entry){
    if(!entry)return'';
    const who=entry.side==='player'?'You':'CPU';
    if(entry.type==='setupActive')return`${who} placed ${cardName(entry.cardId)} Active`;
    if(entry.type==='setupBench'||entry.type==='bench')return`${who} placed ${cardName(entry.cardId)} on Bench ${Number(entry.benchIndex||0)+1}`;
    if(entry.type==='evolve')return`${who} evolved into ${cardName(entry.cardId)}${entry.target==='bench'?` on Bench ${Number(entry.benchIndex||0)+1}`:''}`;
    if(entry.type==='trainer')return`${who} played ${cardName(entry.cardId)}`;
    if(entry.type==='ability')return`${who} used ${entry.ability||entry.abilityName||'an ability'} · ${cardName(entry.cardId)}`;
    if(entry.type==='attach')return`${who} attached ${entry.energyType||'Energy'} to ${cardName(entry.cardId)}`;
    if(entry.type==='retreat')return`${who} retreated ${cardName(entry.cardId)} → ${cardName(entry.toCardId)}`;
    if(entry.type==='attack')return`${who} used ${entry.attack} · ${Number(entry.damage||0)} damage`;
    if(entry.type==='ko')return`${cardName(entry.cardId)} was Knocked Out`;
    if(entry.type==='promote')return`${who} promoted ${cardName(entry.cardId)} to Active`;
    if(entry.type==='endTurn')return`${who} ended the turn`;
    return'';
  }

  function eventForAction(action,side,beforeLogLength){
    if(!action||!currentBattle)return'';
    const added=currentBattle.log.slice(Number(beforeLogLength||0));
    const attack=added.find(entry=>entry.type==='attack');
    if(attack){const ko=added.find(entry=>entry.type==='ko');return actionEventText(attack)+(ko?` · KO ${cardName(ko.cardId)}`:'');}
    const preferred=[...added].reverse().find(entry=>['setupActive','setupBench','bench','evolve','trainer','ability','attach','retreat','promote'].includes(entry.type));
    if(preferred)return actionEventText(preferred);
    if(action.type==='endTurn')return actionEventText({type:'endTurn',side});
    return actionEventText({...action,side});
  }

  function coverageForOwnedCards(cards){
    const rows=Array.isArray(cards)?cards:Object.values(cards||{});
    const pocketPrints=new Set();
    for(const row of rows){
      if(String(row?.source||'').toLowerCase()!=='tcgp')continue;
      pocketPrints.add(String(row?.id||`${row?.setId||''}:${row?.name||''}`));
    }
    const supportedGameplay=data.projectOwnedCards(cards).filter(row=>row.battleEnabled).length;
    return {supportedGameplay,pocketPrints:pocketPrints.size};
  }

  function battleSave(){return decks.ensureBattleState(root.state);}
  function ownedRows(){return data.projectOwnedCards(root.state?.cards||{});}
  function enabledOwnedRows(){return ownedRows().filter(row=>row.battleEnabled);}
  function activeDeck(){
    const state=battleSave(),deck=state.decks.find(item=>item?.id===state.activeDeckId)||null;
    if(!deck)return null;
    return decks.validateDeck(deck.cards,ownedRows()).ok?deck:null;
  }
  function setScreen(next){screen=next;updateBackLabel();}
  function updateBackLabel(){const back=el('tcgpBattleBack');if(back)back.textContent=screen==='home'?'‹ CARD SHOP':'‹ BATTLE HOME';}
  function setContent(html){const content=el('tcgpBattleContent');if(content)content.innerHTML=html;}
  function setBattleLive(on){if(!root?.document?.body)return;if(on)root.document.body.classList.add('tcgp-battle-live');else root.document.body.classList.remove('tcgp-battle-live');}

  function renderHome(){
    clearBattleEvent();
    cancelGesture?.();clearTimeout(cpuTimer);cpuTimer=null;cpuPending=false;
    setBattleLive(false);battleOverlay=null;battleInspect=null;setScreen('home');
    const state=battleSave(),stats=state.stats,owned=enabledOwnedRows(),deck=activeDeck(),challenge=solo.challengeById(CHALLENGE_ID),cleared=!!state.firstClears[challenge.id];
    const coverage=coverageForOwnedCards(root.state?.cards||{}),copies=owned.reduce((sum,row)=>sum+Math.min(2,row.quantity),0);
    setContent(`
      <section class="tcgp-battle-hero"><div class="eyebrow">PLAY YOUR COLLECTION</div><h2>TCG Pocket Battle</h2><p>Your Pocket pulls are becoming playable cards. This first slice proves the real battle engine against a fixed Solo deck while card-effect coverage expands.</p>
        <div class="tcgp-battle-stat-grid"><div class="tcgp-battle-stat"><small>MATCHES</small><b>${Number(stats.matches||0)}</b></div><div class="tcgp-battle-stat"><small>WINS</small><b>${Number(stats.wins||0)}</b></div><div class="tcgp-battle-stat"><small>BATTLE READY</small><b>${coverage.supportedGameplay}</b></div></div>
      </section>
      <section class="tcgp-battle-challenge"><div class="tcgp-battle-challenge-head"><div><div class="eyebrow">GENETIC APEX · SOLO</div><h3>${esc(challenge.name)}</h3></div><span class="tcgp-battle-difficulty">${esc(challenge.difficulty)}</span></div><p>${esc(challenge.description)}</p><div class="tcgp-battle-reward">${cleared?'✓ FIRST CLEAR COMPLETE':'FIRST CLEAR · ◉ 100 + ✦ 50'}</div>
        <div class="tcgp-battle-actions-row"><button class="tcgp-battle-action" data-tcgp-action="battle-owned" ${deck?'':'disabled'}>${deck?`BATTLE · ${esc(deck.name)}`:'BUILD AN OWNED DECK'}</button><button class="tcgp-battle-action secondary" data-tcgp-action="practice">PRACTICE · LAB LOANER</button></div>
        <div class="tcgp-battle-note">Lab Loaner is practice only and does not award first-clear rewards. Your saved deck must use cards you actually own; two Poke Balls are supplied as Battle Basics.</div>
      </section>
      <section class="tcgp-battle-panel"><h3>Deck Lab</h3><p>${copies>=18?`You have at least ${copies} supported owned copies ready for this prototype.`:`You currently have ${copies}/18 supported owned copies needed for a full deck plus two Battle Basics.`} <strong>${coverage.supportedGameplay}</strong> gameplay cards are battle-enabled from <strong>${coverage.pocketPrints}</strong> Pocket card prints you own; more effects will unlock as coverage expands.</p><div class="tcgp-battle-actions-row"><button class="tcgp-battle-action" data-tcgp-action="build">${deck?'EDIT DECK':'BUILD DECK'}</button><button class="tcgp-battle-action secondary" data-tcgp-action="quick">QUICK BUILD</button></div></section>`);
  }

  function selectedCount(id){const canonical=data.cardById(id)?.id||id;return builderCards.filter(cardId=>(data.cardById(cardId)?.id||cardId)===canonical).length;}
  function maxOwnedFor(row){
    const card=row?.card||data.cardById(row?.gameplayId),count=selectedCount(row?.gameplayId);
    const sameName=builderCards.filter(id=>decks.copyLimitKey(data.cardById(id))===decks.copyLimitKey(card)).length;
    return Math.min(Math.max(0,2-sameName+count),Math.max(0,Number(row?.quantity||0)));
  }
  function supportText(card){
    const status=card?.support?.status||(card?.battleEnabled?'FULL':'UNSUPPORTED');
    return status==='FULL'?'':`${status} · ${card?.support?.reasons?.join(' ')||'This card’s rules are not implemented yet.'}`;
  }
  function filterBuilderRows(rows,query){
    const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const tokens=normalize(query).trim().split(/\s+/).filter(Boolean);
    return (rows||[]).filter(row=>{const card=row.card||{},text=normalize([row.name,card.name,row.gameplayId,card.setId,card.subtype,card.stage,card.trainerSubtype,card.trainerType,card.support?.status,...(row.variants||[]).map(v=>v.id)].join(' '));return tokens.every(token=>text.includes(token));});
  }
  function deckCardRow(row){
    const count=selectedCount(row.gameplayId),max=maxOwnedFor(row),card=row.card,art=cardArtUrl(row.gameplayId);
    return `<div class="tcgp-deck-card"><div>${art?`<img src="${esc(art)}" alt="" loading="lazy">`:''}</div><div class="tcgp-deck-card-copy"><b>${esc(card.name)}</b><small>${esc(card.stage||card.trainerSubtype||card.trainerType||'Card')} · Owned ${row.quantity}${row.battleEnabled?'':` · ${esc(supportText(card))}`}</small></div><div class="tcgp-deck-stepper"><button type="button" data-tcgp-action="remove-card" data-card-id="${esc(row.gameplayId)}" ${count?'':'disabled'}>−</button><b>${count}</b><button type="button" data-tcgp-action="add-card" data-card-id="${esc(row.gameplayId)}" ${row.battleEnabled&&count<max&&builderCards.length<20?'':'disabled'}>+</button></div></div>`;
  }
  function supportRow(){const count=selectedCount('BASIC-POKE-BALL'),max=maxOwnedFor({gameplayId:'BASIC-POKE-BALL',quantity:2});return `<div class="tcgp-deck-card tcgp-battle-support"><div>🔴</div><div class="tcgp-deck-card-copy"><b>Poke Ball</b><small>Battle Basics · 2 supplied · Searches a random Basic Pokémon</small></div><div class="tcgp-deck-stepper"><button type="button" data-tcgp-action="remove-card" data-card-id="BASIC-POKE-BALL" ${count?'':'disabled'}>−</button><b>${count}</b><button type="button" data-tcgp-action="add-card" data-card-id="BASIC-POKE-BALL" ${count<max&&builderCards.length<20?'':'disabled'}>+</button></div></div>`;}

  function renderBuilder(){
    setBattleLive(false);setScreen('builder');
    if(builderEnergyMode==='auto')builderEnergyTypes=decks.analyzeDeck(builderCards).recommendedEnergyTypes;
    const validation=decks.validateDeck(builderCards,ownedRows(),builderEnergyTypes);
    setContent(`<section class="tcgp-battle-panel"><div class="eyebrow">20-CARD DECK</div><h3>Deck Builder</h3><p>Alternate artworks count as the same gameplay card. Pocket's two-copy limit is enforced across every print.</p><div class="tcgp-deck-summary"><span><small>DECK SIZE</small><br><b>${builderCards.length}/20</b></span><span><small>ENERGY ZONE</small><br><b>GRASS</b></span></div><input id="tcgpDeckName" class="tcgp-deck-name" maxlength="40" value="${esc(builderName)}" aria-label="Deck name"><div class="tcgp-battle-actions-row"><button class="tcgp-battle-action secondary" data-tcgp-action="quick">QUICK BUILD</button><button class="tcgp-battle-action" data-tcgp-action="save-deck" ${validation.ok?'':'disabled'}>SAVE DECK</button></div>${builderMessage?`<div class="tcgp-battle-error">${esc(builderMessage)}</div>`:''}${!validation.ok&&builderCards.length?`<div class="tcgp-battle-note">${esc(validation.errors[0])}</div>`:''}</section><section class="tcgp-battle-panel"><h3>Battle Basics</h3><div class="tcgp-deck-list">${supportRow()}</div></section><section class="tcgp-battle-panel"><h3>Your Pocket cards</h3><input id="tcgpDeckSearch" class="tcgp-deck-name" type="search" value="${esc(builderFilter)}" placeholder="Search name, set, type or support status" aria-label="Search owned Pocket cards"><div id="tcgpDeckCatalogue"></div></section>`);
    const input=el('tcgpDeckName');if(input)input.addEventListener('input',event=>{builderName=event.target.value||'My Pocket Deck';});
    input?.insertAdjacentHTML('beforebegin',`<label for="tcgpDeckEnergyMode">Energy selection</label><select id="tcgpDeckEnergyMode" class="tcgp-deck-name"><option value="auto" ${builderEnergyMode==='auto'?'selected':''}>Automatic · follows attack costs</option><option value="manual" ${builderEnergyMode==='manual'?'selected':''}>Manual · preserve my choices</option></select><label for="tcgpDeckEnergy">Energy Zone · choose 1 to 3 types</label><select id="tcgpDeckEnergy" class="tcgp-deck-name" aria-label="Energy types" multiple size="3">${decks.ENERGY_TYPES.map(type=>`<option value="${type}" ${builderEnergyTypes.includes(type)?'selected':''}>${type}</option>`).join('')}</select><div class="tcgp-deck-warnings" role="status">${validation.warnings.map(w=>`<p>${esc(w.message)}</p>`).join('')}${builderEnergyTypes.length>3?'<p>More than three required Energy types: simplify the deck or choose an experimental configuration.</p>':''}</div>`);
    el('tcgpDeckEnergyMode')?.addEventListener('change',event=>{builderEnergyMode=event.target.value==='manual'?'manual':'auto';renderBuilder();});
    const energySummary=el('tcgpBattleContent')?.querySelector('.tcgp-deck-summary span:last-child b');
    if(energySummary)energySummary.textContent=builderEnergyTypes.join(' / ').toUpperCase();
    el('tcgpDeckEnergy')?.addEventListener('change',event=>{
      const selected=Array.from(event.target.selectedOptions,option=>option.value);
      if(!selected.length||selected.length>3){for(const option of event.target.options)option.selected=builderEnergyTypes.includes(option.value);toast('Choose 1 to 3 different Energy types.');return;}
      builderEnergyTypes=selected;builderEnergyMode='manual';renderBuilder();
    });
    el('tcgpDeckSearch')?.addEventListener('input',event=>{builderFilter=event.target.value;renderBuilderCatalogue();});
    renderBuilderCatalogue();
    el('tcgpBattleContent')?.insertAdjacentHTML('beforeend',`<details class="tcgp-battle-panel"><summary>Developer / Testing · focused deck</summary><p>Build from owned FULL cards. Non-FULL focus cards show their review blockers; they are never silently enabled.</p><select id="tcgpTestKind" class="tcgp-deck-name" aria-label="Test deck focus"><option value="card">Card / Pokémon ID</option><option value="type">Type</option><option value="setId">Set</option><option value="mechanic">Effect / mechanic</option><option value="status">Support status (e.g. PARTIAL)</option></select><input id="tcgpTestValue" class="tcgp-deck-name" placeholder="A1-083, Water, A1, coinFlip or PARTIAL" aria-label="Test focus value"><button type="button" class="tcgp-battle-action" data-tcgp-action="test-build">BUILD FOCUSED TEST DECK</button></details>`);
  }
  function renderBuilderCatalogue(){
    const container=el('tcgpDeckCatalogue');if(!container)return;
    const rows=filterBuilderRows(ownedRows(),builderFilter),shown=rows.slice(0,100);
    container.innerHTML=shown.length?`<p>${rows.length} matching gameplay cards${rows.length>100?' · Showing the first 100; refine your search to find more.':'.'}</p><div class="tcgp-deck-list">${shown.map(deckCardRow).join('')}</div>`:'<p>No matching owned Pocket cards. Use the Lab Loaner to practice.</p>';
  }

  function hpInfo(slot,side){
    if(!slot)return{card:null,hp:0,left:0,pct:0,energy:0};
    const card=data.cardById(slot.cardId),hp=currentBattle&&core.maxHp?core.maxHp(currentBattle,side||'player',slot):Number(card?.hp||0),left=Math.max(0,hp-Number(slot.damage||0)),energy=Object.values(slot.energy||{}).reduce((a,b)=>a+Number(b||0),0);
    return{card,hp,left,pct:hp?Math.max(0,Math.min(100,left/hp*100)):0,energy,energyPool:slot.energy||{}};
  }
  function typeLabel(card){
    if(!card)return'Card';
    if(card.kind==='trainer')return card.trainerSubtype||card.trainerType||'Trainer';
    return `${card.subtype||'Pokémon'} · ${card.stage||'Card'}`;
  }
  function summarizeEffect(effect){
    if(!effect)return'';
    if(effect.type==='healSelf')return `Heal ${Number(effect.amount||0)} from this Pokémon.`;
    if(effect.type==='attachEnergyFromZoneToBench')return `Attach ${Number(effect.amount||1)} ${String(effect.energy||'Energy')} Energy to 1 Benched Pokémon.`;
    if(effect.type==='searchRandomBasic')return 'Search your deck for a random Basic Pokémon and put it into your hand.';
    if(effect.type==='coinDiscardOpponentEnergy')return 'On heads, discard an Energy from your opponent.';
    if(effect.type==='forceOpponentSwitch')return 'Force your opponent to switch their Active Pokémon.';
    return'Special effect.';
  }
  function cardRulesHtml(card,availability){
    const text=value=>typeof value==='string'?value:Array.isArray(value)?value.filter(v=>typeof v==='string').join(' '):'';
    const paragraph=value=>value?`<p>${esc(value)}</p>`:'';
    const abilities=cardAbilities(card);
    const abilityHtml=abilities.map(ability=>`<article><div><b>Ability · ${esc(ability.name||'Ability')}</b></div>${paragraph(text(ability.text)||summarizeEffect(ability.effect))}${paragraph(text(ability.timing))}</article>`).join('');
    const attacks=(card.attacks||[]).map((attack,i)=>`<article><div><b>${esc(attack.name)}</b><strong>${esc(attack.damageText??attack.damage??0)}</strong></div>${energyCostHtml(availability?.[i]?.cost??attack.cost)}${paragraph(text(attack.text)||summarizeEffect(attack.effect))}${paragraph(availability?.[i]?.reason)}</article>`).join('');
    const subtype=card.trainerSubtype||card.trainerType||'Trainer';
    const defaultTiming=subtype==='Supporter'?'You may play only 1 Supporter during your turn.':subtype==='Tool'?'Attach to 1 of your Pokémon that does not already have a Tool.':subtype==='Stadium'?'Only 1 Stadium may be in play.':'';
    const trainer=card.kind==='trainer'?`<article><div><b>${esc(card.name)}</b><strong>${esc(subtype)}</strong></div>${paragraph(text(card.text)||summarizeEffect(card.effect))}${paragraph(text(card.timing)||defaultTiming)}</article>`:'';
    return abilityHtml+attacks+trainer+paragraph(supportText(card));
  }
  function energyCostHtml(cost){
    const letters=String(cost||'').split('').filter(Boolean);
    if(!letters.length)return '<span class="tcgp-cost-empty">No Energy</span>';
    const labelFor=letter=>({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless',N:'Dragon'}[letter]||letter);
    return `<span class="tcgp-cost">${letters.map(letter=>`<i data-energy="${esc(labelFor(letter))}">${esc(labelFor(letter))}</i>`).join('')}</span>`;
  }
  function buildInspectSpec(side,zone,index){
    return { side:side||'player', zone:zone||'active', index:Number(index||0) };
  }
  function resolveInspect(state,spec){
    if(!state)return null;
    const probe=spec||battleInspect||buildInspectSpec('player','active',0);
    const sideName=probe.side==='opponent'?'opponent':'player';
    const side=state.sides?.[sideName];
    if(!side)return null;
    if(probe.zone==='hand'){
      const ref=side.hand?.[Number(probe.index)||0];
      if(!ref)return null;
      const card=data.cardById(ref.cardId);
      return { spec:probe, sideName, zone:'hand', slot:null, ref, card, title:card?.name||ref.cardId, subtitle:`${sideName==='player'?'Your':'CPU'} hand card` };
    }
    if(probe.zone==='bench'){
      const slot=side.bench?.[Number(probe.index)||0];
      if(!slot)return null;
      const card=data.cardById(slot.cardId);
      return { spec:probe, sideName, zone:'bench', slot, ref:null, card, title:card?.name||slot.cardId, subtitle:`${sideName==='player'?'Your':'CPU'} Bench` };
    }
    const slot=side.active;
    if(!slot)return null;
    const card=data.cardById(slot.cardId);
    return { spec:buildInspectSpec(sideName,'active',0), sideName, zone:'active', slot, ref:null, card, title:card?.name||slot.cardId, subtitle:`${sideName==='player'?'Your':'CPU'} Active Pokémon` };
  }
  function inspectAttrs(side,zone,index){
    return `data-tcgp-action="inspect-card" data-side="${esc(side)}" data-zone="${esc(zone)}" data-index="${Number(index||0)}"`;
  }
  function logText(entry){
    if(entry.type==='turn')return`Turn ${entry.turnNumber}: ${entry.side==='player'?'Your':'CPU'} turn`;
    if(entry.type==='attack')return`${entry.side==='player'?'You':'CPU'} used ${entry.attack} for ${entry.damage}`;
    if(entry.type==='ko')return`${cardName(entry.cardId)} was Knocked Out`;
    if(entry.type==='search')return`${entry.side==='player'?'You':'CPU'} found ${cardName(entry.cardId)}`;
    return actionEventText(entry);
  }

  function actionIndicesFor(predicate){const out=[];battleActionCache.forEach((action,index)=>{if(predicate(action))out.push(index);});return out;}
  function contextActionButton(indices,label,extraClass){
    if(!indices.length)return'';
    if(indices.length===1)return `<button type="button" class="tcgp-live-context-action ${extraClass||''}" data-tcgp-action="battle-action" data-action-index="${indices[0]}">${esc(label)}</button>`;
    return `<button type="button" class="tcgp-live-context-action ${extraClass||''}" data-tcgp-action="open-context-actions" data-action-indices="${indices.join(',')}">${esc(label)}</button>`;
  }
  function energyTargetAttrs(side,zone,index){
    if(side!=='player')return'';
    const hit=battleActionCache.find(action=>action.type==='attach'&&action.target===zone&&(zone!=='bench'||Number(action.benchIndex)===Number(index||0)));
    return hit?`data-energy-target="1" data-energy-zone="${esc(zone)}" data-energy-index="${Number(index||0)}"`:'';
  }
  function cardDropAttrs(side,zone,index){
    if(!currentBattle)return'';
    const benchIndex=Number(index||0);
    const target=side==='opponent'?(zone==='bench'?'opponentBench':'opponentActive'):zone;
    return `data-card-drop-zone="1" data-card-zone="${esc(target)}" data-card-index="${benchIndex}"`;
  }
  function livePokemonActionsHtml(side,zone,index){
    if(side!=='player')return'';
    const parts=[];
    if(currentBattle?.phase==='promote'&&currentBattle?.promotionSide==='player'&&zone==='bench'){
      const promoteIndex=battleActionCache.findIndex(action=>action.type==='promote'&&Number(action.benchIndex)===Number(index||0));
      if(promoteIndex>=0)parts.push(`<button type="button" class="tcgp-live-context-action promote" data-tcgp-action="battle-action" data-action-index="${promoteIndex}">PROMOTE TO ACTIVE</button>`);
      return parts.length?`<div class="tcgp-live-card-actions">${parts.join('')}</div>`:'';
    }
    if(currentBattle?.phase!=='battle')return'';
    if(zone==='active'){
      const attacks=actionIndicesFor(action=>action.type==='attack');
      const attackGroups=new Map();
      attacks.forEach(actionIndex=>{const attackIndex=battleActionCache[actionIndex].attackIndex;if(!attackGroups.has(attackIndex))attackGroups.set(attackIndex,[]);attackGroups.get(attackIndex).push(actionIndex);});
      const card=data.cardById(currentBattle?.sides?.player?.active?.cardId);
      (card?.attacks||[]).forEach((attack,attackIndex)=>{
        const indices=attackGroups.get(attackIndex)||[],actionIndex=indices[0],availability=core.attackAvailability(currentBattle,'player',attackIndex),cost=core.energyCostLabel(availability.cost);
        const attrs=indices.length>1?`data-tcgp-action="open-context-actions" data-action-indices="${indices.join(',')}"`:`data-tcgp-action="battle-action" data-action-index="${actionIndex}"`;
        parts.push(`<button type="button" class="tcgp-live-context-action attack" ${indices.length?'':'disabled'} title="${esc(availability.reason)}" ${attrs}><b>${esc(attack?.name||'ATTACK')}</b><small>${indices.length?esc(cost):'Needs '+esc(cost)}${indices.length>1?' · CHOOSE TARGET':''}</small><strong>${esc(attack?.damageText??attack?.damage??0)} DMG</strong></button>`);
      });
      const retreats=actionIndicesFor(action=>action.type==='retreat');
      if(retreats.length)parts.push(contextActionButton(retreats,'RETREAT','retreat'));
      const abilities=actionIndicesFor(action=>action.type==='ability'&&action.target==='active');
      if(abilities.length)parts.push(contextActionButton(abilities,'ABILITY','ability'));
    }else if(zone==='bench'){
      const abilities=actionIndicesFor(action=>action.type==='ability'&&action.target==='bench'&&Number(action.benchIndex)===Number(index||0));
      if(abilities.length)parts.push(contextActionButton(abilities,'ABILITY','ability'));
    }
    return parts.length?`<div class="tcgp-live-card-actions">${parts.join('')}</div>`:'';
  }
  function liveAttachedEnergyHtml(info){
    if(!info?.energy)return'';
    const codes={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M'};
    const entries=Object.entries(info.energyPool||{}).filter(([,n])=>n>0),label=entries.map(([type,n])=>`${n} ${type}`).join(' + ');
    return `<span class="tcgp-live-attached-energy" aria-label="${esc(label)} attached Energy">${entries.map(([type,n])=>`<i data-energy="${esc(type)}" title="${esc(type)}">${codes[type]||'?'}${n>1?`<b>${n}</b>`:''}</i>`).join('')}</span>`;
  }
  function liveCardHtml(slot,opts){
    const settings=opts||{},compact=!!settings.compact,side=settings.side||'player',zone=settings.zone||'active',index=Number(settings.index||0),targetAttrs=[energyTargetAttrs(side,zone,index),cardDropAttrs(side,zone,index)].filter(Boolean).join(' ');
    if(!slot)return `<div data-board-slot="${side}-${zone}-${index}" class="tcgp-live-card-wrap ${compact?'compact':''}"><button type="button" class="tcgp-live-card ${compact?'compact ':''}empty" ${inspectAttrs(side,zone,index)} ${targetAttrs}><span>${zone==='active'?'ACTIVE':'BENCH '+(index+1)}</span></button></div>`;
    const info=hpInfo(slot,side),card=info.card,art=cardArtUrl(slot.cardId);
    return `<div class="tcgp-live-card-wrap ${compact?'compact':''}"><button type="button" class="tcgp-live-card ${compact?'compact':''}" ${inspectAttrs(side,zone,index)} ${targetAttrs}>${art?`<img src="${esc(art)}" alt="${esc(card?.name||slot.cardId)}">`:''}<span class="tcgp-live-hp">${info.left}</span>${liveAttachedEnergyHtml(info)}<span class="tcgp-live-name">${esc(card?.name||slot.cardId)}</span></button>${livePokemonActionsHtml(side,zone,index)}</div>`;
  }
  function liveBenchHtml(sideName,bench){
    const slots=[],sideState={bench:bench||[]};
    for(let i=0;i<3;i++){const slot=core?.benchSlotAt?core.benchSlotAt(sideState,i):(bench?.[i]||null);slots.push(liveCardHtml(slot,{compact:true,side:sideName,zone:'bench',index:i}));}
    return slots.join('');
  }
  function liveOpponentHandHtml(side){
    const sleeve=sleeveArtPath('opponent'),style=sleeve?`style="background-image:url('${esc(sleeve)}')"`:'';
    const visible=Math.min(5,side.hand.length),backs=Array.from({length:visible},(_,i)=>`<i style="--i:${i};${sleeve?`background-image:url('${esc(sleeve)}');`:''}"></i>`).join('');
    return `<div class="tcgp-live-hand-backs" style="--back-count:${visible}" aria-label="Opponent hand ${side.hand.length} cards">${backs}<b>${side.hand.length}</b></div>`;
  }
  function centerHandActionIndices(actions,handIndex){
    const allowed=new Set(['setupActive','setupBench','bench','evolve','trainer']);
    const index=Number(handIndex);
    return (actions||[]).map((action,actionIndex)=>({action,actionIndex})).filter(row=>allowed.has(row.action?.type)&&Number(row.action?.handIndex)===index).map(row=>row.actionIndex);
  }
  function directHandDropActionIndex(actions,battle,handIndex,zone,index){
    if(!battle)return -1;
    const idx=Number(handIndex),benchIndex=Number(index||0),list=actions||[],player=battle.sides?.player||{},find=predicate=>list.findIndex(action=>Number(action?.handIndex)===idx&&predicate(action));
    if(battle.phase==='setup'&&battle.setupSide==='player'){
      if(zone==='active')return find(action=>action.type==='setupActive');
      if(zone==='bench')return find(action=>action.type==='setupBench'&&Number(action.benchIndex)===benchIndex);
      return -1;
    }
    if(battle.phase==='battle'&&battle.activeSide==='player'){
      const trainer=find(action=>action.type==='trainer'&&action.target===zone&&(!String(zone).toLowerCase().includes('bench')||Number(action.benchIndex)===benchIndex));
      if(trainer>=0)return trainer;
      if(zone==='active')return find(action=>action.type==='evolve'&&action.target==='active');
      if(zone==='bench'){
        const occupied=core?.benchSlotAt?core.benchSlotAt(player,benchIndex):player.bench?.[benchIndex];
        if(occupied)return find(action=>action.type==='evolve'&&action.target==='bench'&&Number(action.benchIndex)===benchIndex);
        return find(action=>action.type==='bench'&&Number(action.benchIndex)===benchIndex);
      }
    }
    return -1;
  }
  function livePlayerHandHtml(side){
    const handCount=Math.max(1,side.hand.length);
    return `<div class="tcgp-live-hand-fan" style="--hand-count:${handCount}">${side.hand.map((ref,index)=>{
      const card=data.cardById(ref.cardId),art=cardArtUrl(ref.cardId),usable=centerHandActionIndices(battleActionCache,index).length>0;
      return `<div class="tcgp-live-hand-wrap ${usable?'playable':''}" style="--hand-i:${index}"><button type="button" class="tcgp-live-hand-card" ${inspectAttrs('player','hand',index)} data-tcgp-hand-drag="${index}">${art?`<img src="${esc(art)}" alt="${esc(card?.name||ref.cardId)}">`:`<span>${esc(card?.name||ref.cardId)}</span>`}</button></div>`;
    }).join('')||'<span class="tcgp-live-hand-empty">No cards</span>'}</div>`;
  }
  function layoutPlayerHand(){
    const host=el('tcgpBattleContent')?.querySelector('.tcgp-live-hand'),fan=host?.querySelector('.tcgp-live-hand-fan');if(!fan||!layout)return;
    const wraps=[...fan.querySelectorAll('.tcgp-live-hand-wrap')],model=layout.handFan(wraps.length,host.clientWidth,host.clientHeight);
    fan.style.width=model.spanWidth+'px';fan.style.setProperty('--card-width',model.cardWidth+'px');fan.style.setProperty('--card-height',model.cardHeight+'px');
    wraps.forEach((node,i)=>{const pose=model.cards[i];node.style.setProperty('--hand-x',pose.x+'px');node.style.setProperty('--hand-y',pose.y+'px');node.style.setProperty('--hand-angle',pose.angle+'deg');node.style.zIndex=pose.zIndex;});
  }
  function livePileHtml(sideName,side,kind){
    const isDiscard=kind==='discard',count=isDiscard?side.discard.length:side.deck.length,top=isDiscard&&count?side.discard[count-1]:null,emptyDiscard=isDiscard&&!count;
    const topArt=top?cardArtUrl(top.cardId):'',sleeve=sleeveArtPath(sideName),backStyle=!isDiscard&&sleeve?`background-image:url('${esc(sleeve)}');`:'';
    const attrs=isDiscard?`data-tcgp-action="open-discard" data-side="${esc(sideName)}"`:'';
    const fallbackText=isDiscard&&top&&!topArt?esc(cardName(top.cardId).slice(0,2).toUpperCase()):(!topArt&&!sleeve&&!isDiscard?'◆':'');
    return `<button type="button" class="tcgp-live-pile ${isDiscard?'discard':'deck'} ${sideName==='player'?'mine':''}" ${attrs} ${isDiscard?'':'disabled'} aria-label="${isDiscard?'View discard pile':'Deck'} ${count} cards"><span class="tcgp-live-pile-card${emptyDiscard?' empty':''}" style="${topArt?`background-image:url('${esc(topArt)}');`:backStyle}">${fallbackText}</span><b>${count}</b><small>${isDiscard?'DISCARD':'DECK'}</small></button>`;
  }
  function liveEnergySourceHtml(side){
    const available=currentBattle?.phase==='battle'&&currentBattle?.activeSide==='player'&&!cpuPending&&side.energyAvailable&&!side.energyUsed;
    const energyType=side.energyType||'Grass',symbol={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M'}[energyType]||'?';
    return `<button type="button" class="tcgp-live-energy-source ${available?'ready':''}" data-energy="${esc(energyType)}" data-tcgp-energy-source="1" ${available?'':'disabled'} aria-label="${available?`Drag ${esc(energyType)} Energy to a Pokémon`:`${esc(energyType)} Energy unavailable`} · Next ${esc(side.nextEnergyType||energyType)}"><span>${symbol}</span><small>${esc(energyType).toUpperCase()}<br>NEXT ${esc(side.nextEnergyType||energyType).toUpperCase()}</small></button>`;
  }
  function liveInspectOverlayHtml(){
    if(battleOverlay!=='inspect'||!battleInspect)return'';
    const info=resolveInspect(currentBattle,battleInspect);if(!info?.card)return'';
    const card=info.card,art=cardArtUrl(card.id),health=info.slot?hpInfo(info.slot,battleInspect.side):null;
    return `<div class="tcgp-live-overlay"><button class="tcgp-live-overlay-scrim" type="button" data-tcgp-action="close-overlay" aria-label="Close card detail"></button><section class="tcgp-live-sheet tcgp-live-card-sheet"><button class="tcgp-live-sheet-close" type="button" data-tcgp-action="close-overlay">×</button><div class="tcgp-live-sheet-card">${art?`<img src="${esc(art)}" alt="${esc(card.name)}">`:''}<div><div class="eyebrow">${esc(info.subtitle)}</div><h3>${esc(card.name)}</h3><div class="tcgp-live-tags"><span>${esc(typeLabel(card))}</span>${card.kind==='pokemon'||info.slot?`<span>HP ${health?.left??card.hp}/${health?.hp??card.hp}</span><span>⚡ ${health?.energy||0}</span><span>Retreat ${Number(card.retreat||0)}</span><span>Weak ${esc(card.weakness||'—')}</span>`:''}</div></div></div><div class="tcgp-live-sheet-attacks">${cardRulesHtml(card,info.zone==='active'?(card.attacks||[]).map((_,i)=>core.attackAvailability(currentBattle,info.sideName,i)):null)}</div></section></div>`;
  }
  function liveContextActionsOverlayHtml(){
    if(battleOverlay!=='context-actions')return'';
    const buttons=battleContextActionIndices.map(index=>{const action=battleActionCache[index];return action?`<button class="tcgp-battle-action" type="button" data-tcgp-action="battle-action" data-action-index="${index}">${esc(actionLabel(action,currentBattle,'player'))}</button>`:'';}).join('');
    return `<div class="tcgp-live-overlay"><button class="tcgp-live-overlay-scrim" type="button" data-tcgp-action="close-overlay" aria-label="Close actions"></button><section class="tcgp-live-sheet tcgp-live-action-sheet"><div class="tcgp-live-sheet-head"><div><small>CHOOSE TARGET</small><h3>Choose a play</h3></div><button class="tcgp-live-sheet-close" type="button" data-tcgp-action="close-overlay">×</button></div><div class="tcgp-live-actions">${buttons}</div></section></div>`;
  }
  function liveDiscardOverlayHtml(){
    if(battleOverlay!=='discard')return'';
    const side=currentBattle?.sides?.[battleDiscardSide],label=battleDiscardSide==='player'?'Your':'CPU',cards=side?.discard||[];
    return `<div class="tcgp-live-overlay"><button class="tcgp-live-overlay-scrim" type="button" data-tcgp-action="close-overlay" aria-label="Close discard pile"></button><section class="tcgp-live-sheet tcgp-live-discard-sheet"><div class="tcgp-live-sheet-head"><div><small>${label.toUpperCase()}</small><h3>Discard pile · ${cards.length}</h3></div><button class="tcgp-live-sheet-close" type="button" data-tcgp-action="close-overlay">×</button></div><div class="tcgp-live-discard-grid">${cards.length?cards.map(ref=>{const card=data.cardById(ref.cardId),art=cardArtUrl(ref.cardId);return `<div class="tcgp-live-discard-card">${art?`<img src="${esc(art)}" alt="${esc(card?.name||ref.cardId)}">`:''}<span>${esc(card?.name||ref.cardId)}</span></div>`;}).join(''):'<p class="tcgp-battle-note">Discard pile is empty.</p>'}</div></section></div>`;
  }
  function liveMidControlsHtml(turnText,lastLog){
    if(currentBattle?.phase==='setup'){
      const readyIndex=battleActionCache.findIndex(action=>action.type==='setupReady');
      return `<div class="tcgp-live-mid-controls setup" data-card-play-zone="1"><span>SETUP</span><b>${currentBattle.sides.player.active?'ADD BENCH OR START':'CHOOSE ACTIVE'}</b><em>Drag a Basic here or directly onto the board.</em><i class="tcgp-live-center-play">DROP CARD TO PLAY</i>${readyIndex>=0?`<button type="button" class="tcgp-live-end-turn" data-tcgp-action="battle-action" data-action-index="${readyIndex}">READY</button>`:''}</div>`;
    }
    if(currentBattle?.phase==='promote'){
      const mine=currentBattle.promotionSide==='player';
      return `<div class="tcgp-live-mid-controls promote"><span>KO</span><b>${mine?'CHOOSE NEW ACTIVE':'CPU CHOOSING ACTIVE'}</b><em>${mine?'Tap PROMOTE beneath the Bench Pokémon you want.':'Opponent must promote before play continues.'}</em></div>`;
    }
    const endIndex=battleActionCache.findIndex(action=>action.type==='endTurn');
    return `<div class="tcgp-live-mid-controls" data-card-play-zone="1"><span>TURN ${currentBattle?.turnNumber||1}/50</span><b>${esc(turnText)}</b><em>${esc(lastLog)}</em><i class="tcgp-live-center-play">DROP CARD TO PLAY</i>${endIndex>=0?`<button type="button" class="tcgp-live-end-turn" data-tcgp-action="battle-action" data-action-index="${endIndex}">END TURN</button>`:''}</div>`;
  }


  function renderBattle(){
    cancelGesture?.();
    if(!currentBattle)return renderHome();
    setBattleLive(true);setScreen('battle');
    const p=currentBattle.sides.player,o=currentBattle.sides.opponent;
    const playerCanAct=(currentBattle.phase==='setup'&&currentBattle.setupSide==='player')||(currentBattle.phase==='battle'&&currentBattle.activeSide==='player'&&!cpuPending)||(currentBattle.phase==='promote'&&currentBattle.promotionSide==='player'&&!cpuPending);
    battleActionCache=playerCanAct?core.legalActions(currentBattle,'player'):[];
    const turnText=currentBattle.phase==='setup'?'SET UP YOUR BOARD':currentBattle.phase==='promote'?(currentBattle.promotionSide==='player'?'CHOOSE NEW ACTIVE':'CPU CHOOSING ACTIVE'):currentBattle.activeSide==='player'?'YOUR TURN':cpuPending?'CPU PLAYING…':'CPU TURN';
    const lastLog=[...currentBattle.log].reverse().map(logText).find(Boolean)||(currentBattle.phase==='setup'?'Choose an Active Pokémon.':'Battle started');
    const handScroll=el('tcgpBattleContent')?.querySelector('.tcgp-live-hand')?.scrollLeft||0;
    setContent(`<section class="tcgp-live-arena" aria-label="TCG Pocket battlefield">
      <section class="tcgp-live-opponent" aria-label="Opponent half">
        <div class="tcgp-live-opponent-top">${livePileHtml('opponent',o,'discard')}${liveOpponentHandHtml(o)}${livePileHtml('opponent',o,'deck')}</div>
        <div class="tcgp-live-opponent-bench" aria-label="Opponent Bench">${liveBenchHtml('opponent',o.bench)}</div>
        <div class="tcgp-live-opponent-active" aria-label="Opponent Active">${liveCardHtml(o.active,{side:'opponent',zone:'active'})}</div>
      </section>
      <section class="tcgp-live-mid" aria-label="Score, turn and play lane"><div class="tcgp-live-score"><span>CPU <b>${o.points}</b>/3</span><i>·</i><span>YOU <b>${p.points}</b>/3</span></div>${liveMidControlsHtml(turnText,lastLog)}</section>
      <section class="tcgp-live-player" aria-label="Player half">
        <div class="tcgp-live-player-active" aria-label="Your Active">${liveCardHtml(p.active,{side:'player',zone:'active'})}</div>
        <div class="tcgp-live-player-bench" aria-label="Your Bench">${liveBenchHtml('player',p.bench)}</div>
        <div class="tcgp-live-player-bottom"><div class="tcgp-live-piles mine" aria-label="Your card piles">${livePileHtml('player',p,'discard')}${livePileHtml('player',p,'deck')}</div><div class="tcgp-live-hand" aria-label="Your hand · swipe for more cards">${livePlayerHandHtml(p)}</div>${liveEnergySourceHtml(p)}</div>
      </section>
      ${battleEvent?`<div class="tcgp-live-action-event" role="status">${esc(battleEvent)}</div>`:''}
      ${liveInspectOverlayHtml()}${liveContextActionsOverlayHtml()}${liveDiscardOverlayHtml()}
    </section>`);
    layoutPlayerHand();const hand=el('tcgpBattleContent')?.querySelector('.tcgp-live-hand');if(hand)hand.scrollLeft=handScroll;
  }


  function finishBattle(){
    if(!currentBattle||currentBattle.phase!=='finished')return;
    if(currentPractice)resultInfo={practice:true,firstClear:false,reward:{coins:0,dust:0}};
    else resultInfo=progress.recordResult(root.state,currentBattle,currentChallenge);
    saveNow();renderResult();
  }
  function resultSummary(battle){
    if(battle?.winner==='draw')return {title:'DRAW',message:'Both sides reached a winning condition at the same time.'};
    if(battle?.winner==='player')return {title:'VICTORY',message:'You won the match.'};
    return {title:'DEFEAT',message:battle?.reason==='turn-limit'?'The 50-turn Solo limit expired.':'The CPU won the match.'};
  }
  function renderResult(){
    clearBattleEvent();
    setBattleLive(false);battleOverlay=null;battleInspect=null;setScreen('result');
    const won=currentBattle?.winner==='player',practice=!!resultInfo?.practice,reward=resultInfo?.reward||{coins:0,dust:0};
    setContent(`<section class="tcgp-battle-result"><div class="eyebrow">SOLO BATTLE</div><h2>${esc(resultSummary(currentBattle).title)}</h2><p>${esc(resultSummary(currentBattle).message)}</p><div class="tcgp-battle-stat-grid"><div class="tcgp-battle-stat"><small>YOU</small><b>${currentBattle?.sides.player.points||0}</b></div><div class="tcgp-battle-stat"><small>CPU</small><b>${currentBattle?.sides.opponent.points||0}</b></div><div class="tcgp-battle-stat"><small>TURN</small><b>${currentBattle?.turnNumber||0}</b></div></div><div class="tcgp-battle-reward">${practice?'PRACTICE · NO REWARDS':won?(resultInfo.firstClear?`FIRST CLEAR · ◉ ${reward.coins} + ✦ ${reward.dust}`:'REPEAT CLEAR · NO CURRENCY FARMING'):'NO REWARD'}</div><div class="tcgp-battle-actions-row"><button class="tcgp-battle-action" data-tcgp-action="rematch">REMATCH</button><button class="tcgp-battle-action secondary" data-tcgp-action="home">BATTLE HOME</button></div></section>`);
  }

  function startBattle(cards,practice,energyTypes){
    clearBattleEvent();
    cancelGesture?.();clearTimeout(cpuTimer);cpuTimer=null;
    currentChallenge=solo.challengeById(CHALLENGE_ID);currentPractice=!!practice;currentPlayerDeck=cards.slice();resultInfo=null;cpuPending=false;battleInspect=null;battleOverlay=null;battleEvent='';setBattleLive(true);
    currentPlayerEnergyTypes=Array.isArray(energyTypes)?energyTypes.slice():decks.analyzeDeck(cards).recommendedEnergyTypes;
    currentBattle=solo.createBattle({challengeId:CHALLENGE_ID,playerDeck:cards,seed:Date.now()>>>0,playerEnergyType:currentPlayerEnergyTypes[0],playerEnergyTypes:currentPlayerEnergyTypes,manualPlayerSetup:true});
    renderBattle();maybeCpu();
  }
  function cpuOwnsNextAction(){
    return !!currentBattle&&((currentBattle.phase==='battle'&&currentBattle.activeSide==='opponent')||(currentBattle.phase==='promote'&&currentBattle.promotionSide==='opponent'));
  }
  function maybeCpu(){
    if(!cpuOwnsNextAction()||cpuPending)return;
    cpuActions=0;cpuPending=true;renderBattle();clearTimeout(cpuTimer);
    cpuTimer=setTimeout(cpuStep,520);
  }
  function cpuStep(){
    if(!currentBattle||!cpuOwnsNextAction()){cpuPending=false;renderBattle();return;}
    const before=currentBattle.log.length;
    try{
      const chosen=ai.chooseAction(currentBattle,'opponent','Beginner',cpuActions);
      if(!chosen){cpuPending=false;renderBattle();return;}
      core.applyAction(currentBattle,'opponent',chosen);
      cpuActions+=1;
      setBattleEvent(eventForAction(chosen,'opponent',before));
    }catch(error){console.error('[TCGP Battle] CPU error',error);cpuPending=false;toast('Battle engine error.');renderBattle();return;}
    if(currentBattle?.phase==='finished'){
      cpuPending=false;renderBattle();clearTimeout(cpuTimer);cpuTimer=setTimeout(finishBattle,700);return;
    }
    const again=cpuOwnsNextAction();cpuPending=again;renderBattle();
    if(again){clearTimeout(cpuTimer);cpuTimer=setTimeout(cpuStep,780);}
  }

  function open(){
    const home=el('packHome'),stage=el('packStage'),view=el('tcgpBattleView');if(!view)return;
    if(home)home.hidden=true;if(stage)stage.hidden=true;view.hidden=false;renderHome();
    const state=battleSave();if(!state.helpSeen){state.helpSeen=true;saveNow();showHelp();}
  }
  function close(){clearBattleEvent();cancelGesture?.();clearTimeout(cpuTimer);cpuTimer=null;cpuPending=false;currentBattle=null;const view=el('tcgpBattleView'),home=el('packHome');if(view)view.hidden=true;if(home)home.hidden=false;battleInspect=null;battleOverlay=null;setBattleLive(false);setScreen('home');}
  function showHelp(){const help=el('tcgpBattleHelp');if(help)help.hidden=false;}
  function hideHelp(){const help=el('tcgpBattleHelp');if(help)help.hidden=true;}
  function back(){
    if(screen==='home')return close();
    if(screen==='battle'&&['setup','battle','promote'].includes(currentBattle?.phase)){
      if(root&&typeof root.confirm==='function'&&!root.confirm('Leave this battle? The current match will be abandoned.'))return;
      clearTimeout(cpuTimer);currentBattle=null;cpuPending=false;battleInspect=null;battleOverlay=null;
    }
    renderHome();
  }

  function startOwned(){const deck=activeDeck();if(!deck){toast('Build and save a legal owned deck first.');return;}startBattle(deck.cards,false,decks.deckEnergyTypes(deck));}
  function openBuilder(prefill){
    const deck=activeDeck();builderName=deck?.name||'My Pocket Deck';builderMessage='';builderEnergyTypes=decks.deckEnergyTypes(deck);builderEnergyMode=deck?(deck.energyMode||'manual'):'auto';
    if(prefill==='quick'){
      const quick=decks.buildQuickDeck(ownedRows());builderCards=quick.cards.slice();builderEnergyTypes=quick.energyTypes;builderEnergyMode='auto';builderMessage=quick.ok?quick.strategy:quick.errors[0]||'Not enough supported cards yet.';
    }else builderCards=deck?.cards?.slice()||[];
    renderBuilder();
  }

  function contentClick(event){
    const btn=event.target.closest?.('[data-tcgp-action]');if(!btn)return;const action=btn.dataset.tcgpAction;
    if(Date.now()<handDragSuppressUntil&&btn.closest?.('[data-tcgp-hand-drag]'))return;
    if(action==='build')return openBuilder();
    if(action==='quick')return openBuilder('quick');
    if(action==='test-build'){
      const kind=el('tcgpTestKind')?.value,value=el('tcgpTestValue')?.value.trim(),options=kind==='card'?{cardId:value}:{[kind]:value};
      const result=decks.buildQuickDeck(ownedRows(),options);builderMessage=result.ok?result.strategy:result.errors.join(' ');
      if(result.ok){builderCards=result.cards;builderEnergyTypes=result.energyTypes;builderEnergyMode='auto';}
      else if(kind==='card'){const card=data.cardById(value);if(card&&!card.battleEnabled)builderMessage+=' '+supportText(card);}
      return renderBuilder();
    }
    if(action==='battle-owned')return startOwned();
    if(action==='practice')return startBattle(decks.LOANER_PLAYER_DECK,true);
    if(action==='home')return renderHome();
    if(action==='rematch')return startBattle(currentPlayerDeck,currentPractice,currentPlayerEnergyTypes);
    if(action==='add-card'||action==='remove-card'){
      const id=btn.dataset.cardId,count=selectedCount(id),row=enabledOwnedRows().find(r=>r.gameplayId===id),max=id==='BASIC-POKE-BALL'?maxOwnedFor({gameplayId:id,quantity:2}):maxOwnedFor(row);
      if(action==='add-card'&&(id==='BASIC-POKE-BALL'||row?.battleEnabled)&&count<max&&builderCards.length<20)builderCards.push(id);
      if(action==='remove-card'&&count){const canonical=data.cardById(id)?.id||id,idx=builderCards.map(savedId=>data.cardById(savedId)?.id||savedId).lastIndexOf(canonical);if(idx>=0)builderCards.splice(idx,1);}
      builderMessage='';return renderBuilder();
    }
    if(action==='save-deck'){
      const result=decks.saveDeck(root.state,{id:activeDeck()?.id||'tcgp-main',name:builderName,cards:builderCards,energyTypes:builderEnergyTypes,energyMode:builderEnergyMode},ownedRows());
      if(!result.ok){builderMessage=result.errors[0]||'Deck is not legal.';return renderBuilder();}saveNow();toast('Pocket deck saved.');return renderHome();
    }
    if(action==='inspect-card'){
      battleInspect=buildInspectSpec(btn.dataset.side,btn.dataset.zone,btn.dataset.index);battleOverlay='inspect';
      return renderBattle();
    }
    if(action==='open-context-actions'){
      battleContextActionIndices=String(btn.dataset.actionIndices||'').split(',').map(Number).filter(index=>Number.isInteger(index)&&battleActionCache[index]);
      battleOverlay='context-actions';battleInspect=null;return renderBattle();
    }
    if(action==='open-discard'){
      battleDiscardSide=btn.dataset.side==='opponent'?'opponent':'player';battleOverlay='discard';battleInspect=null;return renderBattle();
    }
    if(action==='open-actions'){battleOverlay='context-actions';battleContextActionIndices=battleActionCache.map((_,index)=>index);battleInspect=null;return renderBattle();}
    if(action==='close-overlay'){battleOverlay=null;battleInspect=null;battleContextActionIndices=[];return renderBattle();}
    if(action==='battle-action'){
      if(!currentBattle)return;
      const canAct=currentBattle.phase==='setup'?currentBattle.setupSide==='player':currentBattle.phase==='promote'?currentBattle.promotionSide==='player':currentBattle.activeSide==='player';
      if(!canAct)return;
      return applyActionIndex(Number(btn.dataset.actionIndex));
    }
  }

  function applyActionIndex(actionIndex){
    const chosen=battleActionCache[Number(actionIndex)];if(!chosen)return false;
    battleOverlay=null;battleInspect=null;battleContextActionIndices=[];
    const before=currentBattle.log.length;
    try{core.applyAction(currentBattle,'player',chosen);}catch(error){console.error('[TCGP Battle] action error',error);toast(error.message||'That play is not legal.');return false;}
    setBattleEvent(eventForAction(chosen,'player',before));
    if(currentBattle.phase==='finished')finishBattle();else{renderBattle();maybeCpu();}
    return true;
  }
  function applyHandCenterDrop(handIndex){
    if(!currentBattle||cpuPending)return false;
    let indices=centerHandActionIndices(battleActionCache,handIndex);
    if(!indices.length)return false;
    if(currentBattle.phase==='setup'){
      const activeEmpty=!currentBattle.sides?.player?.active;
      const preferred=indices.find(index=>battleActionCache[index]?.type===(activeEmpty?'setupActive':'setupBench'));
      if(Number.isInteger(preferred))return applyActionIndex(preferred);
    }
    if(indices.length===1)return applyActionIndex(indices[0]);
    battleContextActionIndices=indices;battleOverlay='context-actions';battleInspect=null;renderBattle();return true;
  }

  function applyHandDrop(handIndex,zone,index){
    if(!currentBattle||cpuPending)return false;
    const actionIndex=directHandDropActionIndex(battleActionCache,currentBattle,handIndex,zone,index),action=battleActionCache[actionIndex];
    if(!action)return false;
    const before=currentBattle.log.length;
    try{core.applyAction(currentBattle,'player',action);}catch(error){console.error('[TCGP Battle] card drop error',error);toast(error.message||'That card cannot be placed there.');return false;}
    setBattleEvent(eventForAction(action,'player',before));
    if(currentBattle.phase==='finished')finishBattle();else{renderBattle();maybeCpu();}
    return true;
  }
  function clearHandDragFeedback(){
    const content=el('tcgpBattleContent');if(!content)return;
    content.querySelectorAll('[data-tcgp-drop-state]').forEach(node=>node.removeAttribute('data-tcgp-drop-state'));
    const prompt=content.querySelector('.tcgp-live-center-play');if(prompt)prompt.textContent='DROP CARD TO PLAY';
  }
  function setHandDragFeedback(handIndex){
    const content=el('tcgpBattleContent');if(!content)return;
    const blocked=cpuPending;
    content.querySelectorAll('[data-card-drop-zone="1"]').forEach(node=>{
      const valid=!blocked&&directHandDropActionIndex(battleActionCache,currentBattle,handIndex,node.dataset.cardZone,Number(node.dataset.cardIndex||0))>=0;
      node.setAttribute('data-tcgp-drop-state',valid?'valid':'invalid');
    });
    const center=content.querySelector('[data-card-play-zone="1"]');
    if(center){
      const valid=!blocked&&centerHandActionIndices(battleActionCache,handIndex).length>0;
      center.setAttribute('data-tcgp-drop-state',valid?'valid':'invalid');
      const prompt=center.querySelector('.tcgp-live-center-play');if(prompt)prompt.textContent=valid?'DROP CARD TO PLAY':'NOT A VALID PLAY';
    }
  }

  function handPointerDown(event){
    const source=event.target.closest?.('[data-tcgp-hand-drag]');
    if(!source||!root?.document||event.isPrimary===false)return;
    const handIndex=Number(source.dataset.tcgpHandDrag);if(!Number.isInteger(handIndex))return;
    cancelGesture?.();event.preventDefault();
    const captured=currentBattle,ref=captured?.sides?.player?.hand?.[handIndex],art=ref?cardArtUrl(ref.cardId):'',originWrap=source.closest('.tcgp-live-hand-wrap');
    const host=source.closest('.tcgp-live-hand'),scrollStart=host?.scrollLeft||0,sx=event.clientX,sy=event.clientY;
    let ghost=null,moved=false,mode=event.pointerType==='touch'&&host?.scrollWidth>host?.clientWidth?'pending':'drag';
    function makeGhost(){
      ghost=root.document.createElement('div');ghost.className='tcgp-live-hand-drag';
      if(art)ghost.style.backgroundImage="url('"+art+"')";else ghost.textContent=cardName(ref?.cardId);
      originWrap?.classList.add('tcgp-drag-origin');setHandDragFeedback(handIndex);
      root.document.body.appendChild(ghost);root.document.body.classList.add('tcgp-card-dragging');
    }
    function move(e){
      const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>6)moved=true;
      if(mode==='pending'&&moved)mode=Math.abs(dx)>Math.abs(dy)*1.2?'scroll':'drag';
      if(mode==='scroll'){host.scrollLeft=scrollStart-dx;return;}
      if(mode==='drag'){if(!ghost)makeGhost();ghost.style.transform='translate('+(e.clientX-38)+'px,'+(e.clientY-50)+'px)';}
    }
    function cleanup(){root.document.removeEventListener('pointermove',move,true);root.document.removeEventListener('pointerup',end,true);root.document.removeEventListener('pointercancel',cancel,true);root.document.body.classList.remove('tcgp-card-dragging');originWrap?.classList.remove('tcgp-drag-origin');clearHandDragFeedback();ghost?.remove();if(cancelGesture===cancel)cancelGesture=null;}
    function end(e){
      const point=moved&&mode==='drag'?root.document.elementFromPoint?.(e.clientX,e.clientY):null,center=point?.closest?.('[data-card-play-zone="1"]'),target=point?.closest?.('[data-card-drop-zone="1"]');
      cleanup();handDragSuppressUntil=Date.now()+350;if(mode==='scroll'||captured!==currentBattle)return;
      if(!moved){battleInspect=buildInspectSpec('player','hand',handIndex);battleOverlay='inspect';renderBattle();return;}
      if(center){if(!applyHandCenterDrop(handIndex))toast('That card has no legal play right now.');return;}
      if(!target||!applyHandDrop(handIndex,target.dataset.cardZone,Number(target.dataset.cardIndex||0)))toast(currentBattle?.phase==='setup'?'Drag a Basic Pokémon onto Active, Bench, or the centre.':'Drop that card onto a legal Pokémon slot or into the centre to play it.');
    }
    function cancel(){cleanup();handDragSuppressUntil=Date.now()+250;}
    cancelGesture=cancel;move(event);
    root.document.addEventListener('pointermove',move,true);root.document.addEventListener('pointerup',end,true);root.document.addEventListener('pointercancel',cancel,true);
  }

  function applyEnergyDrop(zone,index){
    if(!currentBattle||currentBattle.activeSide!=='player'||cpuPending)return false;
    const action=battleActionCache.find(item=>item.type==='attach'&&item.target===zone&&(zone!=='bench'||Number(item.benchIndex)===Number(index||0)));
    if(!action)return false;
    const before=currentBattle.log.length;
    try{core.applyAction(currentBattle,'player',action);}catch(error){console.error('[TCGP Battle] energy drop error',error);toast(error.message||'That Energy attachment is not legal.');return false;}
    setBattleEvent(eventForAction(action,'player',before));
    if(currentBattle.phase==='finished')finishBattle();else{renderBattle();maybeCpu();}
    return true;
  }
  function energyPointerDown(event){
    const source=event.target.closest?.('[data-tcgp-energy-source="1"]');
    if(!source||source.disabled||!root?.document||event.isPrimary===false)return;
    cancelGesture?.();event.preventDefault();const captured=currentBattle;
    const ghost=root.document.createElement('div');ghost.className='tcgp-live-energy-drag';ghost.textContent=source.querySelector('span')?.textContent||'G';root.document.body.appendChild(ghost);
    function move(e){ghost.style.transform='translate('+(e.clientX-21)+'px,'+(e.clientY-21)+'px)';}
    function cleanup(){root.document.removeEventListener('pointermove',move,true);root.document.removeEventListener('pointerup',end,true);root.document.removeEventListener('pointercancel',cancel,true);ghost.remove();if(cancelGesture===cancel)cancelGesture=null;}
    function end(e){
      const target=root.document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.('[data-energy-target="1"]');cleanup();
      if(captured!==currentBattle)return;if(!target){toast('Drag Energy onto one of your Pokémon.');return;}
      applyEnergyDrop(target.dataset.energyZone,Number(target.dataset.energyIndex||0));
    }
    function cancel(){cleanup();}
    cancelGesture=cancel;move(event);root.document.addEventListener('pointermove',move,true);root.document.addEventListener('pointerup',end,true);root.document.addEventListener('pointercancel',cancel,true);
  }

  function init(){
    const entry=el('tcgpBattleEntry'),content=el('tcgpBattleContent');if(!entry||!content)return;
    entry.addEventListener('click',open);el('tcgpBattleBack')?.addEventListener('click',back);el('tcgpBattleInfo')?.addEventListener('click',showHelp);el('tcgpBattleHelpClose')?.addEventListener('click',hideHelp);el('tcgpBattleHelpDone')?.addEventListener('click',hideHelp);content.addEventListener('click',contentClick);content.addEventListener('pointerdown',energyPointerDown);content.addEventListener('pointerdown',handPointerDown);
    if(root.ResizeObserver)new root.ResizeObserver(()=>{cancelGesture?.();layoutPlayerHand();}).observe(content);else root.addEventListener?.('resize',()=>{cancelGesture?.();layoutPlayerHand();});
  }
  if(root&&root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',init,{once:true});else init();}

  return{actionLabel,actionEventText,cardArtUrl,cardRulesHtml,supportText,filterBuilderRows,resultSummary,coverageForOwnedCards,centerHandActionIndices,directHandDropActionIndex,open,close,renderHome};
});
