(function(root,factory){
  let deps={
    layout:root&&root.LuckyDexTCGPBattleLayout,
    data:root&&root.LuckyDexTCGPBattleData,
    decks:root&&root.LuckyDexTCGPBattleDecks,
    core:root&&root.LuckyDexTCGPBattleCore,
    ai:root&&root.LuckyDexTCGPBattleAI,
    solo:root&&root.LuckyDexTCGPBattleSolo,
    progress:root&&root.LuckyDexTCGPBattleProgress,
    workspace:root&&root.LuckyDexTCGPDeckWorkspace,
    labDecks:root&&root.LuckyDexTCGTestLabDecks,
    classicDecks:root&&root.LuckyDexClassicTCGDecks,classicOpponents:root&&root.LuckyDexClassicTCGOpponents,effects:root&&root.LuckyDexTCGPBattleEffects,
    cosmetics:root&&root.LuckyDexCosmeticsV0413,
    uiAssets:root&&root.LuckyDexTCGPUIAssets
  };
  if(typeof module==='object'&&module.exports){
    deps={
      layout:require('./tcgp-battle-layout.js'),data:require('./tcgp-battle-data.js'),decks:require('./tcgp-battle-decks.js'),core:require('./tcgp-battle-core.js'),
      ai:require('./tcgp-battle-ai.js'),solo:require('./tcgp-battle-solo.js'),progress:require('./tcgp-battle-progress.js'),workspace:require('./tcgp-deck-workspace.js'),labDecks:require('./tcg-test-lab-decks.js'),classicDecks:require('./tcg-classic-decks.js'),classicOpponents:require('./tcg-classic-opponents.js'),effects:require('./tcgp-battle-effects.js'),
      cosmetics:require('./cosmetics-core-v0413.js'),uiAssets:require('./tcgp-ui-assets.js')
    };
    module.exports=factory(null,deps);
  }else if(root){
    root.LuckyDexTCGPBattleUI=factory(root,deps);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(root,deps){
  'use strict';
  const {layout,data,decks,core,ai,solo,progress,classicDecks,classicOpponents,effects,cosmetics,uiAssets,labDecks}=deps;
  const setPicker=root?.LuckyDexClassicSetPicker||(typeof module==='object'&&module.exports?require('./tcg-classic-set-picker.js'):null);
  const energyIconHtml=(type,options)=>uiAssets?.energyIconHtml?.(type,options)||`<span class="tcgp-energy-icon" data-energy="${esc(type)}"><i>${esc(String(type||'?').slice(0,1))}</i></span>`;

  const CHALLENGE_ID='genetic-apex-beginner-ivysaur';
  let selectedChallengeId=CHALLENGE_ID,selectedDifficulty='Beginner',currentDeckAppearance=null;
  const PRINT_ART_BY_ID=new Map((data.PRINTS||[]).map(print=>[String(print.id).toUpperCase(),print]));
  let cancelGesture=null;
  let screen='home',battleFormat='pocket',currentPlayerEnergyTypes=[],classicDraft=null,classicSearch='',currentClassicOpponent=null;
  const recentClassicOpponentTypes=[];
  // The simplified Test Lab uses ordinary deck builders and battles. Its
  // ownership catalogue is temporary, but deck libraries persist separately.
  // Normal owned decks, match history and player progression remain untouched.
  let sandboxMode=false;
  const sandboxState={cards:{},tcgpBattle:{decks:[],activeDeckId:null},tcgClassicBattle:{decks:[],activeDeckId:null}};
  let sandboxPocketRows=null,sandboxClassicRows=null;
  function workingState(){return sandboxMode?sandboxState:(root?.state||{});}
  function enterSandbox(){labDecks.restore(root?.state,sandboxState);sandboxMode=true;}
  function sandboxPocketCards(){if(!sandboxPocketRows)sandboxPocketRows=data.CARDS.filter(c=>c&&c.kind!=='energy'&&c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,name:c.name,card:c,quantity:2,battleEnabled:true,variants:[]}));return sandboxPocketRows;}
  function sandboxClassicCards(){if(!sandboxClassicRows)sandboxClassicRows=(root.LuckyDexClassicTCGBattleData?.CARDS||[]).filter(c=>c.battleEnabled&&c.deckEligible!==false&&!c.basicEnergy).map(c=>({gameplayId:c.id,name:c.name,card:c,quantity:4,battleEnabled:true,variants:[]}));return sandboxClassicRows;}
  function sandboxBanner(){return sandboxMode?'<section class="tcgp-battle-panel" style="margin:8px 0;padding:10px 12px"><strong>TEST LAB · ALL CARDS</strong><p style="margin:4px 0">All battle-ready cards are available. Use Build Deck → Filter cards for the card catalogue, or CPU DECK FILTERS below for your opponent. Decks and opponent filters save separately from normal play. No rewards or battle records.</p><div class="tcgp-battle-actions-row"><button type="button" class="tcgp-battle-action" data-tcgp-action="open-opponent-filters">CPU DECK FILTERS</button><button type="button" class="tcgp-battle-action secondary" data-tcgp-action="exit-sandbox">EXIT TEST LAB</button></div></section>':'';}

  // One authoritative CPU expansion list: do not hide newly imported sets in the battle UI.
  const CLASSIC_SETS=classicOpponents.SETS.slice();
  let opponentSetUI={search:'',sort:'release',selectedOnly:false};
  const CLASSIC_TYPES=['random',...classicOpponents.TYPES];
  const AI_LEVELS=['Beginner','Intermediate','Advanced','Expert'];
  function classicOpponentConfig(){
    const cfg=workingState()?.tcgClassicBattle||{};
    const sets=Array.isArray(cfg.opponentSets)?CLASSIC_SETS.filter(s=>cfg.opponentSets.includes(s)):CLASSIC_SETS.slice();
    return {sets,type:CLASSIC_TYPES.includes(cfg.opponentType)?cfg.opponentType:'random',difficulty:AI_LEVELS.includes(cfg.opponentDifficulty)?cfg.opponentDifficulty:'Beginner',rarityFocus:classicOpponents&&['any','common','uncommon','rare','ultra'].includes(cfg.opponentRarityFocus)?cfg.opponentRarityFocus:'any',basicOnly:cfg.opponentBasicOnly===true,theme:decks.THEMES.some(t=>t.id===cfg.opponentTheme)?cfg.opponentTheme:'any'};
  }
  function classicOpponentPickerHtml(){
    const cfg=classicOpponentConfig();
    const pools=setPicker.html({ids:CLASSIC_SETS,selected:cfg.sets,mode:'opponent',title:'Allowed opponent expansions',state:opponentSetUI});
    const types=CLASSIC_TYPES.map(t=>`<button type="button" data-tcgp-action="classic-opponent-type" data-id="${t}" aria-pressed="${cfg.type===t}">${t==='random'?'🎲 Random':t}</button>`).join('');
    const rarities=[['any','Any'],['common','Common'],['uncommon','Uncommon'],['rare','Rare / Holo'],['ultra','Ultra · V/ex/VMAX']].map(([id,label])=>`<button type="button" data-tcgp-action="classic-opponent-rarity" data-id="${id}" aria-pressed="${cfg.rarityFocus===id}">${label}</button>`).join('');
    const themes=decks.THEMES.map(t=>`<button type="button" data-tcgp-action="classic-opponent-theme" data-id="${t.id}" aria-pressed="${cfg.theme===t.id}">${t.label}</button>`).join('');
    const basicOnly=`<button type="button" data-tcgp-action="classic-opponent-basic" aria-pressed="${cfg.basicOnly}">Basic Pokémon only</button>`;
    const levels=AI_LEVELS.map(level=>`<button type="button" data-tcgp-action="classic-opponent-difficulty" data-id="${level}" aria-pressed="${cfg.difficulty===level}">${level}</button>`).join('');
    return `<section class="tcgp-classic-match-settings" aria-label="Random opponent settings"><h3>Random opponent decks</h3><p>Choose which sets the CPU can build from and its Pokémon archetype. Select multiple sets for mixed decks.</p>${pools}<div class="tcgp-classic-choice-label">Opponent archetype</div><div class="tcgp-classic-match-chips">${types}</div><div class="tcgp-classic-choice-label">CPU Pokémon rarity focus</div><div class="tcgp-classic-match-chips">${rarities}${basicOnly}</div><small>Prefers the chosen rarity; pre-evolutions and Trainer support are allowed when needed. Basic-only produces unevolved opponents.</small><div class="tcgp-classic-choice-label">CPU deck strategy</div><div class="tcgp-classic-match-chips">${themes}</div><div class="tcgp-classic-choice-label">CPU difficulty · same AI levels as Pocket</div><div class="tcgp-classic-match-chips">${levels}</div></section>`;
  }
  function refreshOpponentControls(){
    const panel=el('tcgpBattleContent')?.querySelector('.tcgp-classic-match-settings');if(!panel)return;
    const cfg=classicOpponentConfig();setPicker.refresh(panel.querySelector('.tcg-set-selector'),cfg.sets,opponentSetUI);
    const selectedByAction={'classic-opponent-type':cfg.type,'classic-opponent-difficulty':cfg.difficulty,'classic-opponent-rarity':cfg.rarityFocus,'classic-opponent-theme':cfg.theme};
    panel.querySelectorAll('[data-tcgp-action]').forEach(button=>{const action=button.dataset.tcgpAction;
      if(Object.hasOwn(selectedByAction,action))button.setAttribute('aria-pressed',String(button.dataset.id===selectedByAction[action]));
      if(action==='classic-opponent-basic')button.setAttribute('aria-pressed',String(cfg.basicOnly));
    });
  }
  let currentBattle=null,currentChallenge=null,currentPractice=false,currentClassic=false,currentPlayerDeck=null,resultInfo=null,cpuPending=false,cpuTimer=null,cpuActions=0,battleActionCache=[],battleInspect=null,battleOverlay=null,battleContextActionIndices=[],battlePokemonActionSpec=null,battleHandIndex=-1,battleDiscardSide='player',handDragSuppressUntil=0,battleEvent='',battleEventSide=null,battleEventCardId=null,battleEventKind=null,battleChoiceSelectionIndex=-1,battleChoiceBoardFilter=null,battlePresentationBusy=false,battlePresentationTimers=[],battlePresentationDone=null,battlePresentationSerial=0,battlePrizePresentationHeld=false,battleHandReveal=null;

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const el=id=>root&&root.document?root.document.getElementById(id):null;
  const saveNow=()=>{try{if(sandboxMode)labDecks.persist(root?.state,sandboxState);if(root&&typeof root.save==='function')root.save();}catch(error){console.error('[TCGP Battle] save failed',error);}};
  const toast=msg=>{try{if(root&&typeof root.showToast==='function')root.showToast(msg,2400);}catch(_){}};
  let battleEventTimer=null,battleEventSerial=0;
  function clearBattleEvent(){clearTimeout(battleEventTimer);battleEventTimer=null;battleEvent='';battleEventSide=null;battleEventCardId=null;battleEventKind=null;battleEventSerial++;}
  function cpuActionCardId(action,entries){
    if(!action)return null;
    const log=[...(entries||[])].reverse().find(e=>e.type==='trainer'||e.type==='evolve'||e.type==='attack'||e.type==='ability'||e.type==='attachSpecial'||e.type==='bench'||e.type==='promote');
    const cardId=action.type==='trainer'||action.type==='evolve'||action.type==='attachSpecial'||action.type==='bench'||action.type==='setupActive'||action.type==='setupBench'?action.cardId:
      action.type==='attack'?action.attackCardId||log?.cardId||currentBattle?.sides?.opponent?.active?.cardId:
      action.type==='ability'?log?.cardId||currentBattle?.sides?.opponent?.active?.cardId:
      action.type==='effectChoice'?action.choiceCardId||log?.cardId:
      log?.cardId;
    return cardId&&data.cardById(cardId)?cardId:null;
  }
  function setBattleEvent(message,side=null,action=null,entries=[]){
    clearBattleEvent();battleEvent=message;battleEventSide=side;battleEventCardId=side==='opponent'?cpuActionCardId(action,entries):null;battleEventKind=action?.type||null;
    const serial=battleEventSerial;battleEventTimer=setTimeout(()=>{if(serial!==battleEventSerial)return;battleEvent='';battleEventSide=null;battleEventCardId=null;battleEventKind=null;battleEventTimer=null;const host=el('tcgpBattleContent');host?.querySelector('.tcgp-live-action-event')?.remove();host?.querySelector('.tcgp-live-cpu-card-reveal')?.remove();},3500);
  }

  function cardArtUrl(cardId,sideName){
    const gameplay=data.cardById(cardId);
    if(gameplay?.source==='tcg'){const rows=root?.state?.cards?Object.values(root.state.cards):[],owned=rows.find(row=>String(row?.id||'').toLowerCase()===String(gameplay.id||cardId).toLowerCase());let image=String(owned?.image||owned?.imageUrl||gameplay.image||'');if(!image&&/^SNAP(?:FLORIO|FOUNJA)-\d{3}$/i.test(gameplay.id)){const key=String(gameplay.id).split('-')[0],num=String(gameplay.id).split('-')[1],library=root?.LuckyDexCardArt;if(library?.isInstalled?.(key))image=library.localPath(key,'cards/'+num+'.webp');}return image;}
    if(sideName==='player'&&currentDeckAppearance&&deps.workspace.selectedPrint){const selected=deps.workspace.selectedPrint(currentDeckAppearance,gameplay?.id||cardId,currentDeckAppearance._ownedRows||ownedRows());if(selected&&selected!==cardId)return cardArtUrl(selected);}
    let id=String(cardId||'').toUpperCase();if(id==='BASIC-POKE-BALL')id='P-A-005';const match=/^([A-Z0-9]+(?:-[A-Z])?)-(\d+)$/.exec(id);
    if(!match||match[1]==='BASIC')return'';
    const rows=root?.state?.cards?Object.values(root.state.cards):[],canonical=data.cardById(cardId)?.id;
    const owned=rows.find(row=>String(row?.id||'').toUpperCase()===id)||rows.find(row=>canonical&&data.gameplayIdForOwned(row)===canonical&&(row.image||row.imageUrl));
    const image=owned?.image||owned?.imageUrl;if(typeof image==='string'&&image)return image;
    const print=PRINT_ART_BY_ID.get(id.replace(/^P([AB])-/,'P-$1-'));
    if(print?.image)return print.image;
    const set=print?.setId||match[1].replace(/^([ABC]\d+)([A-Z])$/,(_,base,suffix)=>base+suffix.toLowerCase()),number=String(Number(match[2])).padStart(3,'0');
    return `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/${set}/${set}_${number}_EN.webp`;
  }
  function sleeveArtPath(sideName){
    const cosmeticsApi=cosmetics||(root&&root.LuckyDexCosmeticsV0413);
    if(!cosmeticsApi)return'';
    const entry=cosmeticsApi.activeSleeve?.(root?.state||{})||cosmeticsApi.registry?.[root?.state?.cosmetics?.activeSleeve]||cosmeticsApi.registry?.['luckydex-default'];
    return String(entry?.artPath||'cosmetics/sleeves/luckydex-default.webp');
  }
  function playmatArtPath(sideName,stateOverride,challengeOverride){
    const cosmeticsApi=cosmetics||(root&&root.LuckyDexCosmeticsV0413),state=stateOverride||root?.state||{};
    if(!cosmeticsApi)return'';
    if(sideName==='player')return String(cosmeticsApi.activePlaymat?.(state)?.artPath||cosmeticsApi.playmatRegistry?.['pocket-eevee']?.artPath||'');
    const mats=(cosmeticsApi.playmatCatalogue||[]).filter(entry=>entry?.artPath);if(!mats.length)return'';
    const seed=String(challengeOverride?.id||currentChallenge?.id||'opponent');let hash=2166136261;
    for(let i=0;i<seed.length;i++){hash^=seed.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return String(mats[Math.abs(hash)%mats.length]?.artPath||mats[0]?.artPath||'');
  }
  function playmatStyle(sideName){const url=playmatArtPath(sideName,root?.state,currentChallenge);return url?`style="--tcgp-mat-image:url('${esc(url)}')"`:'';}
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
  // An attack like Clefable's Metronome is chosen through the ATTACK menu,
  // not a later effect-choice sheet.  Show the actual opponent's move, its
  // printed damage/effect and the source card for every copied-attack option.
  function copiedAttackOption(action,state,side){
    if(action?.type!=='attack'||action.choiceAttackIndex==null||!action.choiceCardId)return null;
    const ownActive=state?.sides?.[side]?.active;
    const attack=data.cardById(action.attackCardId||ownActive?.cardId)?.attacks?.[action.attackIndex];
    const findCopy=e=>e?.type==='copyAttack'?e:e?.type==='sequence'?(e.effects||[]).map(findCopy).find(Boolean):null;
    const copyEffect=findCopy(attack?.effect);if(!copyEffect)return null;
    const source=data.cardById(action.choiceCardId),copied=source?.attacks?.[Number(action.choiceAttackIndex)];
    if(!source||!copied)return null;
    const damage=copied.damageText||String(Number(copied.damage||0)||0);
    const text=String(copied.text||'').trim();
    return {source,attack:copied,damage,text,sourceSide:copyEffect.source==='selfBench'?side:side==='player'?'opponent':'player',originalName:attack?.name||'COPY ATTACK'};
  }
  function copiedAttackLabel(action,state,side){
    const copied=copiedAttackOption(action,state,side);if(!copied)return null;
    const outcome=copied.damage==='0'||!copied.damage?'EFFECT ONLY':`${copied.damage} DMG`;
    const description=copied.text?` · ${copied.text}`:'';
    return `${copied.originalName} → COPY ${copied.source.name}: ${copied.attack.name} (${outcome})${description}`;
  }
  function shouldHoldPrizePresentation(state,logs){
    return state?.pendingChoice?.special==='chooseClassicPrize'&&Array.isArray(logs)&&logs.some(entry=>['coin','attack','attackFailed','benchDamage','status','heal','ko','draw'].includes(entry?.type));
  }
  function releasePrizePresentation(){
    if(!battlePrizePresentationHeld)return;
    battlePrizePresentationHeld=false;
    if(currentBattle&&screen==='battle')renderBattle();
  }
  function actionLabel(action,state,side){
    if(!action)return'PLAY';
    if(action.type==='setupActive')return`ACTIVE · ${cardName(action.cardId)}`;
    if(action.type==='setupBench')return`BENCH · ${cardName(action.cardId)}`;
    if(action.type==='setupReady')return'READY';
    if(action.type==='effectChoice'){const c=action.choiceCardId?cardName(action.choiceCardId):'';if(state?.pendingChoice?.effect?.rule==='energyFlow'){const slot=action.choiceTarget==='active'?state.sides?.[side]?.active:state.sides?.[side]?.bench?.find(x=>x.benchSlot===Number(action.choiceBenchIndex));const special=slot?.specialEnergy?.find(r=>r.uid===action.effectSpecialEnergyUid);if(special)return `RETURN ${cardName(special.cardId)} · ${c}`;if(action.effectEnergyType)return `RETURN ${action.effectEnergyType} ENERGY · ${c}`;}if(action.choiceAttackIndex!=null){const attack=data.cardById(action.choiceCardId)?.attacks?.[Number(action.choiceAttackIndex)];return `CHOOSE ${c} · ${attack?.name||'ATTACK '+(Number(action.choiceAttackIndex)+1)}`;}if(action.choiceTarget==='bench')return `CHOOSE ${c||'BENCH '+(Number(action.choiceBenchIndex)+1)}`;if(action.choiceTarget==='active')return `CHOOSE ${c||'ACTIVE'}`;if(action.choiceHandIndex!=null)return `CHOOSE ${c||'HAND CARD'}`;if(action.choiceDiscardIndex!=null)return `CHOOSE ${c||'DISCARD CARD'}`;if(action.choiceDeckIndex!=null)return `CHOOSE ${c||'DECK CARD'}`;if(action.choiceOption!=null)return action.choiceLabel||`OPTION ${Number(action.choiceOption)+1}`;if(action.choiceSkip)return 'SKIP';return 'CHOOSE';}
    if(action.type==='promote')return`PROMOTE · ${slotName(state,side,'bench',action.benchIndex)}`;
    if(action.type==='bench')return`BENCH · ${cardName(action.cardId)}`;
    if(action.type==='evolve')return`EVOLVE ${slotName(state,side,action.target,action.benchIndex)} → ${cardName(action.cardId)}`;
    if(action.type==='trainer'){if(action.cardId==='A3-144')return `PLAY RARE CANDY · ${slotName(state,side,action.target,action.benchIndex)} → ${cardName(action.evolutionCardId)}`;return (action.cardId==='BASIC-POKE-BALL'?'PLAY POKE BALL':`PLAY ${cardName(action.cardId)}`)+targetLabel(action,state,side);}
    if(action.type==='ability'){
      const s=state?.sides?.[side],slot=action.target==='bench'?(core.benchSlotAt?core.benchSlotAt(s,action.benchIndex):s?.bench?.[action.benchIndex]):s?.active,card=data.cardById(slot?.cardId);
      const ability=cardAbilities(card)[Number(action.abilityIndex||0)];
      return `${ability?.name||'ABILITY'} · ${cardName(slot?.cardId)}${action.effectTarget?targetLabel(action,state,side):''}`;
    }
    if(action.type==='stadiumAction')return `STADIUM · ${cardName(action.cardId)}`;
    if(action.type==='attach')return`ATTACH ${String(state?.sides?.[side]?.energyType||'Grass').toUpperCase()} → ${slotName(state,side,action.target,action.benchIndex)}`;
    if(action.type==='attachSpecial')return`ATTACH ${cardName(action.cardId)} → ${slotName(state,side,action.target,action.benchIndex)}`;
    if(action.type==='retreat')return`RETREAT → ${slotName(state,side,'bench',action.benchIndex)}`;
    if(action.type==='attack'){
      const active=state?.sides?.[side]?.active,sourceCard=data.cardById(action.attackCardId||active?.cardId),attack=sourceCard?.attacks?.[action.attackIndex];
      const preview=core.attackDamagePreview?.(state,side,action.attackIndex,action.attackCardId);
      if(attack?.effect?.rule==='founja:flightPath'&&action.choiceLabel)return `FLIGHT PATH · ${action.choiceLabel}`;
      if(attack?.effect?.rule==='expedition:lightningStrike'&&action.choiceLabel)return `LIGHTNING STRIKE · ${action.choiceLabel}`;
      // EX Hidden Legends Lanturn: the printed 50 damage is replaced by 90
      // for the optional all-Lightning discard, before those Energy leave play.
      if(attack?.effect?.rule==='ex5:38:0'&&action.choiceLabel)return `LIGHTNING STRIKE · ${action.choiceLabel}`;
      // Optional attack outcomes may have identical artwork and damage.
      // Display the choice made by the rules engine, not just the attack name.
      const copyLabel=copiedAttackLabel(action,state,side);if(copyLabel)return copyLabel;
      const outcome=action.choiceLabel?` — ${action.choiceLabel}`:'';
      return `${attack?.name||'ATTACK'}${action.attackCardId&&action.attackCardId!==active?.cardId?` · ${sourceCard?.name||'PREVIOUS EVOLUTION'}`:''} · ${preview?.text??attack?.damageText??attack?.damage??0} DMG${outcome}${targetLabel(action,state,side)}`;
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
    if(entry.type==='attachSpecial')return`${who} attached ${cardName(entry.energyCardId||entry.cardId)} to ${cardName(entry.cardId)}`;
    if(entry.type==='effectChoice')return`${who} resolved a card effect`;
    if(entry.type==='retreat'){const count=Object.values(entry.spentEnergy||{}).reduce((n,v)=>n+Number(v||0),0)+Number(entry.spentSpecialEnergy||0);return`${who} retreated ${cardName(entry.cardId)} → ${cardName(entry.toCardId)} · ${count?`discarded ${count} Energy for Retreat`:'free Retreat (no Energy discarded)'}`;}
    if(entry.type==='attack')return`${who} used ${entry.attack} · ${Number(entry.damage||0)} damage${entry.damageReason?` · ${entry.damageReason}`:''}`;
    if(entry.type==='ko')return`${cardName(entry.cardId)} was Knocked Out`;
    if(entry.type==='promote')return`${who} promoted ${cardName(entry.cardId)} to Active`;
    if(entry.type==='sleepCheck')return`${who==='You'?'Your':'CPU'} Pokémon ${entry.woke?'woke up':'is still Asleep'} after the Sleep coin flip`;
    if(entry.type==='coin'&&entry.reason==='Dream Garden')return`Dream Garden · ${entry.heads?'HEADS — no new Sleep':'TAILS — Active Pokémon fell Asleep'}`;
    if(entry.type==='endTurn')return`${who} ended the turn`;
    return'';
  }

  function eventForAction(action,side,beforeLogLength){
    if(!action||!currentBattle)return'';
    const added=currentBattle.log.slice(Number(beforeLogLength||0));
    const attack=added.find(entry=>entry.type==='attack');
    if(attack){
      const ko=added.find(entry=>entry.type==='ko');
      const storm=attack.cardId==='SNAPFOUNJA-010'&&attack.attack==='Spore Storm'
        ?[...added].reverse().find(entry=>entry.type==='coin'&&entry.reason==='Founja sporeStorm'):null;
      const flips=storm?` · ${storm.results?.filter(Boolean).length||0}/${storm.results?.length||0} Heads`:'';
      const moltresCoin=attack.attack==='Burning Tail'?added.find(entry=>entry.type==='coin'&&entry.reason==='Skyridge Burning Tail'):null;
      const moltresResult=moltresCoin?(moltresCoin.results?.[0]?' · HEADS — Fire Energy kept':moltresCoin.outcome==='discarded'?' · TAILS — Fire Energy discarded':' · TAILS — no Fire Energy to discard'):'';
      return actionEventText(attack)+flips+moltresResult+(ko?` · KO ${cardName(ko.cardId)}`:'');
    }
    const preferred=[...added].reverse().find(entry=>['setupActive','setupBench','bench','evolve','trainer','ability','attach','attachSpecial','retreat','promote'].includes(entry.type));
    if(preferred)return actionEventText(preferred);
    if(action.type==='endTurn'){
      const checks=added.filter(entry=>entry.type==='sleepCheck');
      const garden=added.find(entry=>entry.type==='coin'&&entry.reason==='Dream Garden');
      const notices=[...checks.map(actionEventText),...(garden?[actionEventText(garden)]:[])];
      return notices.length?notices.join(' · '):actionEventText({type:'endTurn',side});
    }
    if(action.type==='effectChoice')return `${side==='player'?'You':'CPU'} selected ${actionLabel(action,currentBattle,side).replace(/^CHOOSE\s*/,'')}`;
    if(action.type==='setupReady')return side==='player'?'You finished setting up':'CPU finished setting up';
    return actionEventText({...action,side});
  }

  function attackPresentationMeta(entry){
    const card=data.cardById(entry?.cardId),rawType=String((card?.types||[])[0]||card?.subtype||'Colorless').toLowerCase();
    const allowed=new Set(['grass','fire','water','lightning','psychic','fighting','darkness','metal','dragon','colorless']);
    const type=allowed.has(rawType)?rawType:'colorless',damage=Math.max(0,Number(entry?.damage||0));
    const intensity=damage>=180?'finisher':damage>=120?'big':damage>=60?'medium':'small';
    return {type,intensity,damage,attack:String(entry?.attack||'Attack')};
  }

  function coinSequence(entry){
    if(Array.isArray(entry?.results)&&entry.results.length)return entry.results.map(Boolean);
    if(typeof entry?.heads==='boolean')return [entry.heads];
    const coins=Math.max(0,Number(entry?.coins||0)),heads=Math.max(0,Math.min(coins,Number(entry?.heads||0)));
    return Array.from({length:coins},(_,index)=>index<heads);
  }

  function battleSummaryStats(battle){
    const log=Array.isArray(battle?.log)?battle.log:[];
    let damageDealt=0,damageTaken=0,attacksUsed=0,knockouts=0,trainersPlayed=0,energyAttached=0,coinHeads=0,coinTails=0,biggestHit=0,biggestAttack='',biggestAttacker='';
    for(const entry of log){
      if(entry?.type==='attack'){
        const damage=Math.max(0,Number(entry.damage||0));
        if(entry.side==='player'){damageDealt+=damage;attacksUsed++;if(damage>biggestHit){biggestHit=damage;biggestAttack=String(entry.attack||'Attack');biggestAttacker=cardName(entry.cardId);}}
        else if(entry.side==='opponent')damageTaken+=damage;
      }else if(entry?.type==='benchDamage'){
        const damage=Math.max(0,Number(entry.amount||0));if(entry.side==='player')damageDealt+=damage;else if(entry.side==='opponent')damageTaken+=damage;
      }else if(entry?.type==='ko'&&entry.side==='opponent')knockouts++;
      else if(entry?.type==='trainer'&&entry.side==='player')trainersPlayed++;
      else if((entry?.type==='attach'||entry?.type==='attachSpecial')&&entry.side==='player')energyAttached++;
      else if(entry?.type==='coin'&&entry.side==='player'){const seq=coinSequence(entry);coinHeads+=seq.filter(Boolean).length;coinTails+=seq.filter(v=>!v).length;}
    }
    const classic=battle?.format==='classic';
    return {turns:Math.max(0,Number(battle?.turnNumber||0)),playerPoints:Math.max(0,Number(classic?battle?.sides?.player?.prizesTaken:battle?.sides?.player?.points||0)),opponentPoints:Math.max(0,Number(classic?battle?.sides?.opponent?.prizesTaken:battle?.sides?.opponent?.points||0)),damageDealt,damageTaken,attacksUsed,knockouts,trainersPlayed,energyAttached,coinHeads,coinTails,coinTotal:coinHeads+coinTails,biggestHit,biggestAttack,biggestAttacker};
  }

  function presentationRect(node){
    if(!node?.getBoundingClientRect)return null;const r=node.getBoundingClientRect();
    return {left:r.left,top:r.top,width:r.width,height:r.height,right:r.right,bottom:r.bottom};
  }
  function boardSlotKey(side,zone,index){return `${side}-${zone}-${Number(index||0)}`;}
  function boardSlotSelector(side,zone,index){return `[data-board-slot="${boardSlotKey(side,zone,index)}"] .tcgp-live-card`;}
  function capturePresentationAnchors(action,side){
    const content=el('tcgpBattleContent'),arena=content?.querySelector('.tcgp-live-arena');if(!content||!arena)return null;
    const slots={};
    for(const sideName of ['player','opponent']){
      const stateSide=currentBattle?.sides?.[sideName];
      const activeNode=content.querySelector(boardSlotSelector(sideName,'active',0));
      slots[boardSlotKey(sideName,'active',0)]={rect:presentationRect(activeNode),cardId:stateSide?.active?.cardId||null,zone:'active',index:0,side:sideName};
      for(let i=0;i<Math.max(3,Math.min(5,Number(stateSide?.benchLimit||3)));i++){
        const node=content.querySelector(boardSlotSelector(sideName,'bench',i)),slot=core?.benchSlotAt?core.benchSlotAt(stateSide,i):stateSide?.bench?.[i];
        slots[boardSlotKey(sideName,'bench',i)]={rect:presentationRect(node),cardId:slot?.cardId||null,zone:'bench',index:i,side:sideName};
      }
    }
    const hand=side==='player'&&action?.handIndex!=null?content.querySelector(`[data-hand-index="${Number(action.handIndex)}"] .tcgp-live-hand-card`):side==='opponent'?content.querySelector('[data-hand-side="opponent"]'):null;
    const energy=content.querySelector(`[data-energy-side="${side}"]`),center=content.querySelector('.tcgp-live-mid-controls');
    const stadiumNode=content.querySelector('[data-stadium-slot="1"] .tcgp-live-stadium-card'),stadium={rect:presentationRect(stadiumNode),cardId:currentBattle?.stadium?.cardId||null,ownerSide:currentBattle?.stadium?.ownerSide||null};
    const piles={};for(const sideName of ['player','opponent'])for(const kind of ['deck','discard'])piles[`${sideName}-${kind}`]=presentationRect(content.querySelector(`[data-pile-side="${sideName}"][data-pile-kind="${kind}"]`));
    const energyRect=presentationRect(energy)||(side==='opponent'?slots[boardSlotKey('opponent','active',0)]?.rect:null);
    return {arena:presentationRect(arena),slots,hand:presentationRect(hand),energy:energyRect,center:presentationRect(center),stadium:presentationRect(stadiumNode)?stadium:null,piles,action:action?JSON.parse(JSON.stringify(action)):null,side};
  }
  function localBox(rect,layerRect){if(!rect||!layerRect)return null;return {x:rect.left-layerRect.left,y:rect.top-layerRect.top,width:rect.width,height:rect.height,cx:rect.left-layerRect.left+rect.width/2,cy:rect.top-layerRect.top+rect.height/2};}
  function targetKeyForAction(action,side){
    if(!action)return boardSlotKey(side,'active',0);
    if(action.type==='setupActive')return boardSlotKey(side,'active',0);
    if(action.type==='setupBench'||action.type==='bench')return boardSlotKey(side,'bench',action.benchIndex);
    if(action.type==='evolve'||action.type==='attach'||action.type==='attachSpecial'||action.type==='ability'||action.type==='trainer'){
      let target=action.effectTarget||action.target||'active',index=action.effectTarget?action.effectBenchIndex:action.benchIndex,targetSide=side;
      if(String(target).startsWith('opponent')){targetSide=side==='player'?'opponent':'player';target=String(target).toLowerCase().includes('bench')?'bench':'active';}
      return boardSlotKey(targetSide,target==='bench'?'bench':'active',target==='bench'?index:0);
    }
    return boardSlotKey(side,'active',0);
  }
  function presentationCardArt(cardId,side){try{return cardId?cardArtUrl(cardId,side):'';}catch(_){return'';}}
  function appendPresentationNode(stage,className){const node=root?.document?.createElement?.('div');if(!node)return null;node.className=className;stage.appendChild(node);return node;}
  function spawnCardGhost(stage,layerRect,cardId,side,fromRect,toRect,extraClass){
    const from=localBox(fromRect,layerRect),to=localBox(toRect,layerRect);if(!from||!to)return null;
    const node=appendPresentationNode(stage,`tcgp-present-card-ghost ${extraClass||''}`);if(!node)return null;
    node.style.left=from.x+'px';node.style.top=from.y+'px';node.style.width=Math.max(28,from.width)+'px';node.style.height=Math.max(39,from.height)+'px';node.style.setProperty('--tcgp-present-tx',(to.cx-from.cx)+'px');node.style.setProperty('--tcgp-present-ty',(to.cy-from.cy)+'px');node.style.setProperty('--tcgp-present-scale',String(Math.max(.5,Math.min(1.35,to.width/Math.max(1,from.width)))));
    const art=presentationCardArt(cardId,side);if(art)node.style.backgroundImage=`url("${art.replace(/"/g,'&quot;')}")`;else node.textContent=cardName(cardId).slice(0,10);
    return node;
  }
  function spawnDrawGhost(stage,layerRect,entry,fromRect,toRect){
    const from=localBox(fromRect,layerRect),to=localBox(toRect,layerRect);if(!from||!to)return null;
    const node=appendPresentationNode(stage,'tcgp-present-card-ghost tcgp-present-draw');if(!node)return null;
    node.style.left=from.x+'px';node.style.top=from.y+'px';node.style.width=Math.max(28,Math.min(58,from.width||42))+'px';node.style.height=Math.max(39,Math.min(82,from.height||59))+'px';node.style.setProperty('--tcgp-present-tx',(to.cx-from.cx)+'px');node.style.setProperty('--tcgp-present-ty',(to.cy-from.cy)+'px');node.style.setProperty('--tcgp-present-scale','.72');
    if(entry?.side==='player'&&entry?.cardId){const art=presentationCardArt(entry.cardId,'player');if(art)node.style.backgroundImage=`url("${art.replace(/"/g,'&quot;')}")`;}
    return node;
  }
  function spawnEnergyGhost(stage,layerRect,entry,fromRect,toRect){
    const from=localBox(fromRect,layerRect),to=localBox(toRect,layerRect);if(!from||!to)return null;const node=appendPresentationNode(stage,'tcgp-present-energy-ghost');if(!node)return null;
    node.innerHTML=energyIconHtml(entry?.energyType||'Colorless',{className:'presentation'});node.dataset.energy=entry?.energyType||'Colorless';node.style.left=(from.cx-18)+'px';node.style.top=(from.cy-18)+'px';node.style.setProperty('--tcgp-present-tx',(to.cx-from.cx)+'px');node.style.setProperty('--tcgp-present-ty',(to.cy-from.cy)+'px');return node;
  }
  function coinArtPath(sideName,stateOverride){
    const api=cosmetics||(root&&root.LuckyDexCosmeticsV0413),state=stateOverride||root?.state||{};
    // CPU flips use a neutral Poké Ball coin, not the player's unlocked design.
    const entry=sideName==='player'?api?.activeCoin?.(state):api?.coinRegistry?.['pocket-coin-poke-ball'];
    return String(entry?.artPath||'');
  }
  function coinPresentationHtml(heads,sideName,stateOverride){
    const image=coinArtPath(sideName,stateOverride);
    // The selected coin art is the HEADS face. The reverse must be a clearly
    // different BACK, not the face of another coin or a mirrored Poké Ball.
    return heads
      ?`<span class="tcgp-present-coin-face is-heads">${image?`<img src="${esc(image)}" alt="" decoding="async" onerror="this.hidden=true">`:''}</span>`
      :'<span class="tcgp-present-coin-face is-tails"><span class="tcgp-present-coin-reverse">TAILS</span></span>'; 
  }
  function spawnCoinRow(stage,entry){
    // Coin flips in a single action play sequentially: displaying every
    // previous result row until the animation ends made it look like both
    // players had flipped simultaneously.
    for(const previous of stage.querySelectorAll('.tcgp-present-coins'))previous.remove();
    const results=coinSequence(entry),shown=results.slice(0,20),row=appendPresentationNode(stage,`tcgp-present-coins ${entry?.side==='opponent'?'is-opponent':'is-player'}`);if(!row)return 0;
    shown.forEach((heads,index)=>{const coin=appendPresentationNode(row,`tcgp-present-coin ${heads?'heads':'tails'}`);coin.innerHTML=coinPresentationHtml(heads,entry?.side||'player');coin.title=heads?'Heads':'Tails';coin.setAttribute('aria-label',heads?'Heads':'Tails');coin.style.setProperty('--tcgp-coin-delay',(index*70)+'ms');});
    if(results.length>shown.length){const more=appendPresentationNode(row,'tcgp-present-coin-more');more.textContent=`+${results.length-shown.length}`;}
    const heads=results.filter(Boolean).length,tails=results.length-heads,label=appendPresentationNode(row,'tcgp-present-coin-label');label.textContent=results.length===1?(results[0]?'HEADS':'TAILS'):`${heads} HEADS · ${tails} TAILS`;
    return Math.min(1050,320+shown.length*70);
  }
  function benchDamagePresentationEntry(entry){return {type:'attack',side:entry?.side,targetSide:entry?.targetSide||((entry?.side==='player')?'opponent':'player'),cardId:entry?.sourceCardId,attack:String(entry?.attack||'Attack'),damage:Math.max(0,Number(entry?.amount||0)),target:'bench',benchIndex:Number(entry?.benchIndex||0),secondary:true};}
  function attackTargetAnchor(anchors,entry){const foe=entry?.targetSide||(entry?.side==='player'?'opponent':'player'),zone=entry?.target==='bench'?'bench':'active',index=zone==='bench'?Number(entry?.benchIndex||0):0;return anchors?.slots?.[boardSlotKey(foe,zone,index)]||null;}
  function spawnAttackFx(stage,layerRect,anchors,entry){
    const source=anchors?.slots?.[boardSlotKey(entry.side,'active',0)]?.rect,targetInfo=attackTargetAnchor(anchors,entry),target=targetInfo?.rect,from=localBox(source,layerRect),to=localBox(target,layerRect);if(!from||!to)return;
    const meta=attackPresentationMeta(entry),dx=to.cx-from.cx,dy=to.cy-from.cy,distance=Math.max(18,Math.hypot(dx,dy)),angle=Math.atan2(dy,dx)*180/Math.PI;
    const fx=appendPresentationNode(stage,`tcgp-present-attack type-${meta.type} intensity-${meta.intensity}${entry?.secondary?' secondary':''}`);fx.style.left=from.cx+'px';fx.style.top=from.cy+'px';fx.style.width=distance+'px';fx.style.setProperty('--tcgp-attack-angle',angle+'deg');
    const damage=appendPresentationNode(stage,`tcgp-present-damage intensity-${meta.intensity}${entry?.secondary?' secondary':''}`);damage.textContent=meta.damage>0?`−${meta.damage}`:(entry?.displayOutcome||(entry?.damageReason?'BLOCKED':'EFFECT'));damage.style.left=to.cx+'px';damage.style.top=to.cy+'px';
    const content=el('tcgpBattleContent'),attackerNode=content?.querySelector(boardSlotSelector(entry.side,'active',0)),targetNode=content?.querySelector(boardSlotSelector(targetInfo?.side||'',targetInfo?.zone||'active',targetInfo?.index||0));if(!entry?.secondary)attackerNode?.classList.add('tcgp-present-lunge');targetNode?.classList.add('tcgp-present-hit');
    const remove=()=>{attackerNode?.classList.remove('tcgp-present-lunge');targetNode?.classList.remove('tcgp-present-hit');};battlePresentationTimers.push(setTimeout(remove,680));
    if(meta.intensity==='big'||meta.intensity==='finisher')content?.querySelector('.tcgp-live-arena')?.classList.add('tcgp-present-shake');
  }
  function findKoAnchor(anchors,entry,used){
    const candidates=Object.values(anchors?.slots||{}).filter(info=>info.side===entry.side&&info.cardId===entry.cardId&&info.rect&&!used.has(boardSlotKey(info.side,info.zone,info.index)));
    const hit=candidates[0]||null;if(hit)used.add(boardSlotKey(hit.side,hit.zone,hit.index));return hit;
  }
  function finishBattlePresentation(runCallback=true){
    battlePresentationSerial++;for(const timer of battlePresentationTimers)clearTimeout(timer);battlePresentationTimers=[];
    const layer=el('tcgpBattleContent')?.querySelector('.tcgp-present-layer');layer?.remove();el('tcgpBattleContent')?.querySelector('.tcgp-live-arena')?.classList.remove('tcgp-present-shake');
    const done=battlePresentationDone;battlePresentationDone=null;battlePresentationBusy=false;if(runCallback&&typeof done==='function')done();
  }
  function playBattlePresentation(action,side,anchors,logs,done){
    finishBattlePresentation(false);const entries=Array.isArray(logs)?logs:[];if(!root?.document||!anchors||!entries.length){if(typeof done==='function')done();return 0;}
    const arena=el('tcgpBattleContent')?.querySelector('.tcgp-live-arena');if(!arena){if(typeof done==='function')done();return 0;}
    battlePresentationBusy=true;battlePresentationDone=done;const serial=++battlePresentationSerial,layer=root.document.createElement('div');layer.className='tcgp-present-layer';layer.innerHTML='<button type="button" class="tcgp-present-skip" data-tcgp-action="skip-presentation" aria-label="Skip battle animation">SKIP</button><div class="tcgp-present-stage" aria-hidden="true"></div>';arena.appendChild(layer);const stage=layer.querySelector('.tcgp-present-stage'),layerRect=presentationRect(layer),reduced=!!root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const later=(delay,fn)=>{const timer=setTimeout(()=>{if(serial===battlePresentationSerial&&battlePresentationBusy)fn();},Math.max(0,delay));battlePresentationTimers.push(timer);};
    let t=0;
    const movement=entries.find(e=>['setupActive','setupBench','bench','evolve','trainer','attach','attachSpecial','retreat','promote'].includes(e.type));
    if(movement&&!reduced){
      later(t,()=>{
        if(movement.type==='attach'){const target=anchors.slots[targetKeyForAction(action,side)]?.rect||anchors.slots[boardSlotKey(side,'active',0)]?.rect;spawnEnergyGhost(stage,layerRect,movement,anchors.energy,target);return;}
        if(movement.type==='attachSpecial'){const target=presentationRect(el('tcgpBattleContent')?.querySelector(`[data-board-slot="${targetKeyForAction(action,side)}"] .tcgp-live-card`))||anchors.slots[targetKeyForAction(action,side)]?.rect;spawnCardGhost(stage,layerRect,movement.energyCardId||action?.cardId,side,anchors.hand,target,'tcgp-present-energy-card');return;}
        if(movement.type==='retreat'){const active=anchors.slots[boardSlotKey(side,'active',0)],bench=anchors.slots[boardSlotKey(side,'bench',movement.benchIndex)];const postActive=presentationRect(el('tcgpBattleContent')?.querySelector(boardSlotSelector(side,'active',0))),postBench=presentationRect(el('tcgpBattleContent')?.querySelector(boardSlotSelector(side,'bench',movement.benchIndex)));spawnCardGhost(stage,layerRect,active?.cardId,side,active?.rect,postBench,'tcgp-present-swap');spawnCardGhost(stage,layerRect,bench?.cardId,side,bench?.rect,postActive,'tcgp-present-swap');return;}
        if(movement.type==='promote'){const bench=anchors.slots[boardSlotKey(side,'bench',movement.benchIndex)],postActive=presentationRect(el('tcgpBattleContent')?.querySelector(boardSlotSelector(side,'active',0)));spawnCardGhost(stage,layerRect,movement.cardId||bench?.cardId,side,bench?.rect,postActive,'tcgp-present-promote');return;}
        const trainerCard=movement.type==='trainer'?data.cardById(movement.cardId||action?.cardId):null,trainerType=trainerCard?.trainerSubtype||trainerCard?.trainerType||'Trainer';
        if(movement.type==='trainer'&&trainerType==='Stadium'){
          const content=el('tcgpBattleContent'),postStadium=presentationRect(content?.querySelector('[data-stadium-slot="1"] .tcgp-live-stadium-card')),from=anchors.hand||anchors.slots[boardSlotKey(side,'active',0)]?.rect;
          if(anchors.stadium?.cardId){const discard=presentationRect(content?.querySelector(`[data-pile-side="${anchors.stadium.ownerSide}"][data-pile-kind="discard"]`))||anchors.piles?.[`${anchors.stadium.ownerSide}-discard`];spawnCardGhost(stage,layerRect,anchors.stadium.cardId,anchors.stadium.ownerSide,anchors.stadium.rect,discard,'tcgp-present-stadium-replace');}
          spawnCardGhost(stage,layerRect,movement.cardId||action?.cardId,side,from,postStadium,'tcgp-present-stadium-play');return;
        }
        const targetKey=targetKeyForAction(action,side),postTarget=presentationRect(el('tcgpBattleContent')?.querySelector(`[data-board-slot="${targetKey}"] .tcgp-live-card`)),to=movement.type==='trainer'?(anchors.center||anchors.piles?.[`${side}-discard`]):postTarget,from=anchors.hand||anchors.slots[boardSlotKey(side,'active',0)]?.rect;spawnCardGhost(stage,layerRect,movement.cardId||action?.cardId,side,from,to,movement.type==='evolve'?'tcgp-present-evolve':movement.type==='trainer'?'tcgp-present-trainer':'tcgp-present-play');
      });t+=movement.type==='retreat'?430:310;
    }
    for(const entry of entries.filter(entry=>entry.type==='stadiumAction')){later(t,()=>{const node=el('tcgpBattleContent')?.querySelector('[data-stadium-slot="1"] .tcgp-live-stadium-card');node?.classList.add('tcgp-present-stadium-active');const clear=()=>node?.classList.remove('tcgp-present-stadium-active');battlePresentationTimers.push(setTimeout(clear,620));});t+=reduced?40:280;}
    for(const coinEntry of entries.filter(e=>e.type==='coin')){later(t,()=>spawnCoinRow(stage,coinEntry));t+=reduced?60:Math.max(300,Math.min(850,280+coinSequence(coinEntry).length*70));}
    const attack=entries.find(e=>e.type==='attack');if(attack){const zeroOutcome=Number(attack.damage||0)===0?(entries.some(e=>e.type==='ko'&&e.side!==(attack.side))?'KNOCK OUT':entries.some(e=>e.type==='lentalRule'&&e.rule==='predatorPlunge114'&&e.conditionFailed)?'NO EFFECT':null):null;const visualAttack=zeroOutcome?{...attack,displayOutcome:zeroOutcome}:attack;later(t,()=>spawnAttackFx(stage,layerRect,anchors,visualAttack));t+=reduced?80:(attackPresentationMeta(attack).intensity==='finisher'?650:attackPresentationMeta(attack).intensity==='big'?560:450);}
    for(const benchHit of entries.filter(e=>e.type==='benchDamage'&&Number(e.amount||0)>0)){const visual=benchDamagePresentationEntry(benchHit);later(t,()=>spawnAttackFx(stage,layerRect,anchors,visual));t+=reduced?40:210;}
    for(const status of entries.filter(e=>e.type==='status'&&Number(e.affectedCount||0)>0)){later(t,()=>{const node=appendPresentationNode(stage,`tcgp-present-status status-${String(status.status||'effect').toLowerCase()}`);node.textContent=String(status.status||'STATUS').toUpperCase();});t+=reduced?40:220;}
    for(const heal of entries.filter(e=>e.type==='heal')){later(t,()=>{const node=appendPresentationNode(stage,'tcgp-present-heal');node.textContent=`+${Number(heal.amount||0)} HP`;});t+=reduced?40:220;}
    const used=new Set();for(const ko of entries.filter(e=>e.type==='ko')){later(t,()=>{const info=findKoAnchor(anchors,ko,used),discard=presentationRect(el('tcgpBattleContent')?.querySelector(`[data-pile-side="${ko.side}"][data-pile-kind="discard"]`))||anchors.piles?.[`${ko.side}-discard`];spawnCardGhost(stage,layerRect,ko.cardId,ko.side,info?.rect,discard,'tcgp-present-ko');const badge=appendPresentationNode(stage,'tcgp-present-ko-label');badge.textContent='KNOCKED OUT';});t+=reduced?80:440;}
    for(const draw of entries.filter(e=>e.type==='draw')){later(t,()=>{const content=el('tcgpBattleContent'),from=presentationRect(content?.querySelector(`[data-pile-side="${draw.side}"][data-pile-kind="deck"]`))||anchors.piles?.[`${draw.side}-deck`],to=presentationRect(draw.side==='player'?content?.querySelector('.tcgp-live-hand'):content?.querySelector('[data-hand-side="opponent"]'));spawnDrawGhost(stage,layerRect,draw,from,to);});t+=reduced?40:230;}
    if(t===0){finishBattlePresentation(true);return 0;}
    battlePresentationTimers.push(setTimeout(()=>{if(serial===battlePresentationSerial)finishBattlePresentation(true);},Math.max(60,t+60)));return t;
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

  function battleSave(){return decks.ensureBattleState(workingState());}
  function ownedRows(){return sandboxMode?sandboxPocketCards():data.projectOwnedCards(root.state?.cards||{});}
  function classicState(){return classicDecks.ensureState(workingState());}
  function classicOwnedRows(){return sandboxMode?sandboxClassicCards():classicDecks.ownedRows(root.state?.cards||{});}
  function classicActiveDeck(){return classicDecks.activeDeck(workingState(),classicOwnedRows());}
  function formatSwitchHtml(){return `<div class="tcgp-battle-format-switch" role="tablist" aria-label="Battle format"><button type="button" class="tcgp-battle-action ${battleFormat==='pocket'?'':'secondary'}" data-tcgp-action="format-pocket" role="tab" aria-selected="${battleFormat==='pocket'}">TCG POCKET</button><button type="button" class="tcgp-battle-action ${battleFormat==='classic'?'':'secondary'}" data-tcgp-action="format-classic" role="tab" aria-selected="${battleFormat==='classic'}">CLASSIC TCG</button></div>`;}
  function updateBattleHeader(){const top=el('tcgpBattleView')?.querySelector('.tcgp-battle-topbar > div');if(!top)return;const small=top.querySelector('small'),bold=top.querySelector('b');if(small)small.textContent=sandboxMode?'TEST LAB · NO REWARDS':battleFormat==='classic'?'CLASSIC TCG':'TCG POCKET';if(bold)bold.textContent=battleFormat==='classic'?'Classic TCG Battle':'TCG Pocket Battle';}
  function classicSavedDeck(){const state=classicState();return state.decks.find(item=>item?.id===state.activeDeckId)||state.decks[0]||null;}
  function renderClassicHome(){
    const state=classicState(),stats=state.stats,rows=classicOwnedRows().filter(row=>row.card?.deckEligible!==false),saved=classicSavedDeck(),ready=saved?classicDecks.readiness(saved,classicOwnedRows()):null,deck=ready?.ok?saved:null,totalCopies=rows.reduce((n,row)=>n+Math.min(4,Number(row.quantity||0)),0);
    setContent(`<div class="format-classic">${formatSwitchHtml()}${sandboxBanner()}<section class="tcgp-battle-hero tcgp-battle-hero-compact"><div><div class="eyebrow">BASE • JUNGLE • FOSSIL • ROCKET • GYM • NEO • E-CARD • EX • SNAP • MODERN</div><h2>Classic TCG Battle</h2><p>Build a 30-card deck using the supported Classic, New Pokémon Snap and Scarlet & Violet cards, then face a CPU deck from the sets, archetype and AI difficulty you select. Basic Energy comes from the Energy Zone; Double Colorless remains a deck card.</p></div><div class="tcgp-battle-stat-grid"><div class="tcgp-battle-stat"><small>MATCHES</small><b>${Number(stats.matches||0)}</b></div><div class="tcgp-battle-stat"><small>WINS</small><b>${Number(stats.wins||0)}</b></div><div class="tcgp-battle-stat"><small>${sandboxMode?'AVAILABLE':'OWNED'}</small><b>${totalCopies}</b></div></div></section><section class="tcgp-battle-challenge tcgp-battle-ready-card"><div class="tcgp-battle-challenge-head"><div><div class="eyebrow">YOUR CLASSIC DECK</div><h3>${saved?esc(saved.name):'No Classic deck saved'}</h3></div><span class="tcgp-battle-difficulty">${saved?`${saved.cards.length}/30`:'30 CARDS'}</span></div><p>${deck?'Battle-ready.':saved?(ready?.errors?.[0]||'Finish the deck to battle.'):'Use cards from your physical Classic sets, including Florio Nature Park.'}</p><div class="tcgp-battle-actions-row tcgp-battle-start-actions"><button class="tcgp-battle-action" data-tcgp-action="classic-build">${saved?'EDIT CLASSIC DECK':'BUILD CLASSIC DECK'}</button><button class="tcgp-battle-action secondary" data-tcgp-action="classic-quick">AUTO BUILD</button><button class="tcgp-battle-action ${deck?'':'secondary'}" data-tcgp-action="classic-battle" ${deck?'':'disabled'}>${deck?(classicOpponentConfig().type==='random'?'BATTLE RANDOM TYPE':'BATTLE '+classicOpponentConfig().type.toUpperCase()):'DECK NOT READY'}</button><button class="tcgp-battle-action secondary" data-tcgp-action="classic-practice">PRACTICE WITH LOANER</button><button class="tcgp-battle-action secondary" data-tcgp-action="open-sandbox">${sandboxMode?'TEST LAB ENABLED':'TEST LAB · ALL CARDS'}</button></div></section>${classicOpponentPickerHtml()}<details class="tcgp-battle-panel" open><summary>Classic rules in LuckyDex</summary><p>30 deck cards · maximum 4 copies of a card · 7-card opening hand · 5 Prize cards · first player can generate Energy on turn one.</p><p>The Classic catalogue includes Base through Neo Destiny, Legendary Collection, Expedition, Aquapolis, New Pokémon Snap and Scarlet & Violet. Cards with unsupported effects stay unavailable for battle. Basic Energy, including Darkness and Metal, is supplied by the Energy Zone and does not occupy deck slots.</p></details></div>`);
  }
  function renderClassicBuilder(){
    setBattleLive(false);setScreen('classic-builder');
    if(!classicDraft){const saved=classicSavedDeck();classicDraft=saved?{...saved,cards:saved.cards.slice(),energyTypes:(saved.energyTypes||[]).slice()}:{name:'Base Set Deck',cards:[],energyMode:'auto',energyTypes:[]};}
    const allRows=classicOwnedRows().filter(row=>row.card?.battleEnabled&&row.card?.deckEligible!==false),query=classicSearch.trim().toLowerCase(),rows=allRows.filter(row=>!query||[row.name,row.card?.kind,row.card?.stage,...(row.card?.types||[])].join(' ').toLowerCase().includes(query)).sort((a,b)=>Number(a.card?.number||0)-Number(b.card?.number||0)),counts=new Map();for(const id of classicDraft.cards)counts.set(id,(counts.get(id)||0)+1);
    const analysis=classicDecks.analyzeDeck(classicDraft.cards),ready=classicDecks.readiness(classicDraft,classicOwnedRows()),cardsHtml=rows.map(row=>{const id=row.gameplayId,count=counts.get(id)||0,card=row.card,art=cardArtUrl(id,'player'),canAdd=classicDraft.cards.length<30&&count<4&&count<Number(row.quantity||0);return `<article class="tcg-classic-card-row"><button type="button" class="tcg-classic-card-art" data-tcgp-action="classic-inspect" data-id="${esc(id)}">${art?`<img src="${esc(art)}" alt="${esc(card.name)}">`:`<span>${esc(card.name)}</span>`}</button><div class="tcg-classic-card-copy"><small>#${esc(card.number)} · ${esc(card.kind==='pokemon'?(card.stage+' · '+(card.types||[]).join('/')):'Trainer')}</small><b>${esc(card.name)}</b><span>Owned ${Number(row.quantity||0)} · Deck ${count}/4</span></div><div class="tcg-classic-card-stepper"><button type="button" data-tcgp-action="classic-remove" data-id="${esc(id)}" ${count?'':'disabled'}>−</button><b>${count}</b><button type="button" data-tcgp-action="classic-add" data-id="${esc(id)}" ${canAdd?'':'disabled'}>+</button></div></article>`;}).join('');
    setContent(`<div class="format-classic tcg-classic-builder">${formatSwitchHtml()}<section class="tcgp-battle-hero tcgp-battle-hero-compact"><div><div class="eyebrow">CLASSIC TCG · DECK BUILDER</div><h2>${classicDraft.cards.length}/30 cards</h2><p>Energy Zone: ${esc(analysis.recommendedEnergyTypes.join(' / '))}</p></div><div class="tcgp-battle-actions-row"><button class="tcgp-battle-action" data-tcgp-action="classic-save">SAVE DECK</button><button class="tcgp-battle-action secondary" data-tcgp-action="classic-clear">CLEAR</button></div></section><section class="tcgp-battle-panel tcg-classic-builder-tools"><label>DECK NAME<input id="classicDeckName" type="text" maxlength="40" value="${esc(classicDraft.name||'Base Set Deck')}"></label><label>SEARCH<input id="classicDeckSearch" type="search" value="${esc(classicSearch)}" placeholder="Pokémon, Trainer, type…"></label><p class="tcgp-battle-note ${ready.ok?'ready':''}">${ready.ok?'✓ Battle-ready Classic deck.':esc(ready.errors?.[0]||'Add owned Classic cards to reach 30.')}</p></section><section class="tcg-classic-card-list">${cardsHtml||'<p class="tcgp-battle-note">No owned battle-ready Classic cards match this search.</p>'}</section></div>`);
  }
  function enabledOwnedRows(){return ownedRows().filter(row=>row.battleEnabled);}
  function activeDeck(){
    const state=battleSave(),deck=state.decks.find(item=>item?.id===state.activeDeckId)||null;
    if(!deck)return null;
    return deps.workspace.readiness(deck,ownedRows()).ok?deck:null;
  }
  function setScreen(next){screen=next;updateBackLabel();updateBattleHeader();}
  function updateBackLabel(){const back=el('tcgpBattleBack');if(back)back.textContent=screen==='home'?'‹ CARD SHOP':'‹ BATTLE HOME';}
  function setContent(html){const content=el('tcgpBattleContent');if(content)content.innerHTML=html;}
  function setBattleLive(on){if(!root?.document?.body)return;root.LuckyDexTCGPDeckEditor?.close();root.LuckyDexClassicTCGDeckEditor?.close();root.document.body.classList.remove('tcgp-deck-editing');if(on)root.document.body.classList.add('tcgp-battle-live');else root.document.body.classList.remove('tcgp-battle-live');}

  function pocketOpponentConfig(){const cfg=battleSave();return {rarityFocus:Math.max(0,Math.min(4,Number(cfg.opponentRarityFocus)||0)),basicOnly:cfg.opponentBasicOnly===true,theme:decks.THEMES.some(t=>t.id===cfg.opponentTheme)?cfg.opponentTheme:'any'};}
  function pocketOpponentPickerHtml(){const cfg=pocketOpponentConfig();const themes=decks.THEMES.map(r=>`<button type="button" class="tcgp-battle-action ${cfg.theme===r.id?'':'secondary'}" data-tcgp-action="pocket-opponent-theme" data-id="${r.id}" aria-pressed="${cfg.theme===r.id}">${esc(r.label)}</button>`).join('');const choices=decks.FOCUS_RARITIES.map(r=>`<button type="button" class="tcgp-battle-action ${cfg.rarityFocus===r.rank?'':'secondary'}" data-tcgp-action="pocket-opponent-rarity" data-id="${r.rank}" aria-pressed="${cfg.rarityFocus===r.rank}">${esc(r.label)}</button>`).join('');return `<details class="tcgp-battle-panel tcgp-pocket-opponent-filters" ${sandboxMode?'open':''}><summary>CPU deck filters · rarity, strategy and Pokémon</summary><p>Choose the Pokémon rarity for <b>Random Battle</b> opponents. Official named Solo decks are unchanged. Evolution prerequisites and Trainers may be lower rarity.</p><div class="tcgp-battle-actions-row">${themes}</div><div class="tcgp-battle-actions-row">${choices}<button type="button" class="tcgp-battle-action ${cfg.basicOnly?'':'secondary'}" data-tcgp-action="pocket-opponent-basic" aria-pressed="${cfg.basicOnly}">Basic Pokémon only</button></div></details>`;}
  function renderHome(skipGuard){
    if((screen==='builder'||screen==='classic-builder')&&skipGuard!==true)return requestLeave(()=>renderHome(true));
    clearBattleEvent();finishBattlePresentation(false);
    cancelGesture?.();clearTimeout(cpuTimer);cpuTimer=null;cpuPending=false;
    setBattleLive(false);battleOverlay=null;battleInspect=null;battleChoiceSelectionIndex=-1;battleChoiceBoardFilter=null;setScreen('home');
    root?.LuckyDexSubstituteLab?.close?.();
    if(battleFormat==='classic'){renderClassicHome();return;}
    const state=battleSave(),stats=state.stats,owned=enabledOwnedRows(),deck=activeDeck(),challenge=solo.challengeById(sandboxMode?'random-'+selectedDifficulty.toLowerCase():selectedChallengeId)||solo.challengeById(CHALLENGE_ID),cleared=!!state.firstClears[challenge.id];
    const coverage=coverageForOwnedCards(root.state?.cards||{}),copies=owned.reduce((sum,row)=>sum+Math.min(2,row.quantity),0);
    const levels=(solo.DIFFICULTIES||['Beginner']).map(level=>{const p=solo.difficultyProgress?.(level,root.state)||{cleared:0,total:1};return `<button class="tcgp-battle-action ${selectedDifficulty===level?'':'secondary'}" data-tcgp-action="solo-difficulty" data-difficulty="${esc(level)}" aria-pressed="${selectedDifficulty===level}">${esc(level)} · ${p.cleared}/${p.total}</button>`;}).join('');
    const challenges=solo.CHALLENGES.filter(c=>c.difficulty===selectedDifficulty).map(c=>{const unlocked=solo.isUnlocked?.(c,root.state)!==false,p=solo.getChallengeProgress?.(c,root.state)||{cleared:!!state.firstClears[c.id],wins:0},energyLabel=c.randomPool?'Variable':(c.energyTypes||[c.energyType]).join(' / '),progressLabel=c.repeatable?'Repeatable':(p.cleared?'Cleared':'Not cleared');return `<article class="tcgp-battle-challenge" data-solo-challenge="${esc(c.id)}"><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><small>${esc(energyLabel)} Energy · ${progressLabel} · ${Number(p.wins||0)} wins${c.source?` · ${esc(c.source)}`:''}</small><div class="tcgp-battle-actions-row"><button class="tcgp-battle-action ${selectedChallengeId===c.id?'':'secondary'}" data-tcgp-action="select-challenge" data-challenge-id="${esc(c.id)}" ${unlocked?'':'disabled'}>${unlocked?(selectedChallengeId===c.id?'SELECTED':'SELECT'):'LOCKED'}</button></div>${unlocked?'':'<p>Clear two different challenges in the previous difficulty to unlock.</p>'}</article>`;}).join('');
    setContent(`
      ${formatSwitchHtml()}${sandboxBanner()}<section class="tcgp-battle-hero tcgp-battle-hero-compact"><div><div class="eyebrow">${sandboxMode?'TEST LAB · ANY CARD':'PLAY YOUR COLLECTION'}</div><h2>TCG Pocket Battle</h2></div>
        <div class="tcgp-battle-stat-grid"><div class="tcgp-battle-stat"><small>MATCHES</small><b>${Number(stats.matches||0)}</b></div><div class="tcgp-battle-stat"><small>WINS</small><b>${Number(stats.wins||0)}</b></div><div class="tcgp-battle-stat"><small>${sandboxMode?'AVAILABLE':'READY'}</small><b>${sandboxMode?owned.length:coverage.supportedGameplay}</b></div></div>
      </section>
      <section class="tcgp-battle-challenge tcgp-battle-ready-card"><div class="tcgp-battle-challenge-head"><div><div class="eyebrow">NEXT BATTLE</div><h3>${esc(challenge.name)}</h3></div><span class="tcgp-battle-difficulty">${esc(challenge.difficulty)}</span></div><p>${esc(challenge.description)}</p>
        <div class="tcgp-battle-ready-deck"><small>YOUR DECK</small><b>${deck?esc(deck.name):'No battle-ready deck selected'}</b><button class="tcgp-battle-link" data-tcgp-action="build">${deck?'EDIT':'BUILD'}</button></div>
        <div class="tcgp-battle-reward">${challenge.repeatable?'REPEATABLE RANDOM BATTLE':cleared?'✓ FIRST CLEAR COMPLETE':`FIRST CLEAR · ◉ ${challenge.firstClear.coins} + ✦ ${challenge.firstClear.dust}`}</div>
        <div class="tcgp-battle-actions-row tcgp-battle-start-actions"><button class="tcgp-battle-action" data-tcgp-action="battle-owned" ${deck?'':'disabled'}>${deck?'BATTLE NOW':'BUILD A DECK TO BATTLE'}</button><button class="tcgp-battle-action secondary" data-tcgp-action="practice">PRACTICE</button><button class="tcgp-battle-action secondary" data-tcgp-action="open-sandbox">${sandboxMode?'TEST LAB ENABLED':'TEST LAB · ALL CARDS'}</button></div>
      </section>
      ${pocketOpponentPickerHtml()}${sandboxMode?`<section class="tcgp-battle-panel"><h3>CPU challenge difficulty</h3><div class="tcgp-battle-actions-row tcgp-battle-levels">${levels}</div><p>Test matches use generated random opponents and do not affect Solo unlocks.</p></section>`:`<details class="tcgp-battle-panel tcgp-battle-picker"><summary>Choose Solo challenge · ${esc(selectedDifficulty)}</summary><div class="tcgp-battle-actions-row tcgp-battle-levels">${levels}</div>${challenges}</details>`}
      <details class="tcgp-battle-panel"><summary>Decks & auto-build</summary><p>${copies>=18?`${copies} usable owned copies available.`:`${copies}/18 owned copies available, plus two supplied Poké Balls.`}</p><div class="tcgp-battle-actions-row"><button class="tcgp-battle-action" data-tcgp-action="build">${deck?'EDIT DECK':'BUILD DECK'}</button><button class="tcgp-battle-action secondary" data-tcgp-action="quick">AUTO BUILD</button></div><div class="tcgp-battle-note">${sandboxMode?'Every battle-ready card is available for testing; this collection is not modified.':'Only owned, battle-ready cards are offered by default. Practice uses a loaner and does not award first-clear rewards.'}</div></details>
      <details class="tcgp-battle-panel"><summary>Battle records</summary><p>Wins ${Number(stats.wins||0)} · Losses ${Number(stats.losses||0)} · Draws ${Number(stats.draws||0)} · Solo clears ${Number(stats.soloClears||0)}</p><p>Attacks ${Number(stats.attacks||0)} · Pokémon knocked out ${Number(stats.knockouts||0)} · Energy attached ${Number(stats.energyAttached||0)} · Trainers played ${Number(stats.trainersPlayed||0)}</p>${stats.favoriteDeck?`<p>Most-used deck: ${esc(stats.favoriteDeck.name||stats.favoriteDeck)}</p>`:''}</details>`);
  }

  function supportText(card){return card?.battleEnabled?'':(card?.support?.status||'UNSUPPORTED')+' · '+(card?.support?.reasons||[]).join(' ');}
  function filterBuilderRows(rows,query){return deps.workspace.query(rows,{search:query,pageSize:200,developer:true}).rows;}

  function hpInfo(slot,side){
    if(!slot)return{card:null,hp:0,left:0,pct:0,energy:0};
    const card=data.cardById(slot.cardId),hp=currentBattle&&core.maxHp?core.maxHp(currentBattle,side||'player',slot):Number(card?.hp||0),left=Math.max(0,hp-Number(slot.damage||0)),energy=Object.values(slot.energy||{}).reduce((a,b)=>a+Number(b||0),0);
    return{card,hp,left,pct:hp?Math.max(0,Math.min(100,left/hp*100)):0,energy,energyPool:slot.energy||{},specialEnergy:slot.specialEnergy||[]};
  }
  function typeLabel(card){
    if(!card)return'Card';
    if(card.kind==='trainer')return card.trainerSubtype||card.trainerType||'Trainer';
    return `${data.typesOf(card).join(' / ')||'Pokémon'} · ${card.stage||'Card'}`;
  }
  const florioRuleSummary=Object.freeze({
    surpriseAttack:'Flip a coin. On heads, this attack does no damage.',
    guillotine:'Flip 2 coins. If both are heads, Knock Out the opponent’s Active Pokémon.',
    vicePincers114:'Choose Basic Energy to discard from the opponent’s Active Pokémon. This attack does 300 damage minus 20 for each Energy discarded.',
    faceUpPrize114:'Choose 1 of your remaining Prize cards and turn it face up. The card stays in the Prize area.',
    unhingeHorn:'Flip a coin. On heads, discard a Tool attached to the opponent’s Active Pokémon.',
    herculesGlide:'If available, return 1 Grass Energy from your Energy discard pile to your hand.',
    wurmpleStartle:'This attack does no damage unless this Pokémon already has at least 1 damage counter on it.',
    optionalQuickMarch:'Flip a coin. On heads, you may switch this Pokémon with a Benched Pokémon.',
    grassBackup:'Search your deck for up to 3 Basic Grass Pokémon, put them into your hand, then shuffle your deck.',
    poisonSpray113:'If this Pokémon takes attack damage on your opponent’s next turn, make the attacking Pokémon Poisoned.',
    fungalFever:'Flip 2 coins. If both are tails, this attack does no damage. If both are heads, the opponent’s Active Pokémon becomes Paralyzed and Poisoned.',
    nectarOrder114:'Flip a coin. On heads, the opponent’s Active Pokémon becomes Asleep. If it was already Asleep before the flip, return this Pokémon and its attached cards to your hand.',
    majestyWaltz113:'You may shuffle up to 2 Combee or 1 Vespiquen from your discard pile into your deck.',
    tangledFruit114:'Choose one: put 3 damage counters on the opponent’s Active Pokémon, or heal 30 damage from this Pokémon.',
    energyThrash114:'You may discard up to 2 Basic Energy from this Pokémon. If you discard exactly 2, reveal your opponent’s hand and do 40 extra damage for each Energy card in that hand.',
    herbalShower114:'If this attack Knocks Out the opponent’s Active Pokémon, heal up to 50 damage from one of your Benched Pokémon.',
    fertilize114:'Choose any eligible Benched Grass Pokémon and evolve them using matching Evolution cards in your discard pile. You may repeat this for other eligible Pokémon.',
    wildPollen112:'Check the opponent’s Active Pokémon’s attached Energy: Fighting causes Confusion, Fire causes Burn, and Psychic causes Poison. More than one condition can apply.',
    toolDiscardBonus114:'You may discard one Tool attached to this Pokémon. If you do, this attack does 50 more damage.',
    friendsFireRecovery111:'Flip 1 coin for each Basic Pokémon on your Bench. For each heads, shuffle 1 Fire Energy from your Energy discard pile into your deck, if available.',
    shallowSplash:'This attack does no damage if this Pokémon has more than 1 Energy attached.',
    magikarpSoak:'Change the opponent’s Active Pokémon’s Weakness to Water.',
    majesticLeap112:'Flip 2 coins. If both are heads, deal 100 damage. Otherwise deal no damage and put 40 damage on this Pokémon.',
    motherBird:'Search your deck for up to 3 Basic Pokémon and put them directly onto your Bench, as space allows. Then shuffle your deck.',
    torrentSpread:'Place 1 damage counter on each opposing Benched Pokémon for each Basic Water Energy attached to this Pokémon.',
    jolt114:'Attach a Lightning Energy to this Pokémon from your Energy supply, then place 1 damage counter on it.',
    friendshipSurge114:'For each opponent’s Benched Pokémon, you may discard some of its attached Energy. Maximum 3 per Pokémon, limited by the number of Grass and Lightning Energy on this Pokémon beyond 2.',
    discardAllBasicLightning:'Discard all Basic Lightning Energy attached to this Pokémon.',
    shortCircuit112:'Discard every Tool attached to the opponent’s Active Pokémon.',
    forage114:'Draw 3 cards. If you draw Zapped Fluffruit, you may immediately play one to heal 60 damage from a Lightning Pokémon or 20 from another Pokémon.',
    chargedRoast114:'Discard 1 Basic Energy from your Active Pokémon, if possible. Then discard 1 Basic Energy from the opponent’s Active Pokémon, if possible.',
    florgesHealing113:'Remove all damage from one of your Benched Pokémon. Then discard all Psychic Energy attached to this Pokémon.',
    florgesGarden114:'If a Stadium is in play, attach the next Grass Energy from your Energy Zone to a Benched Pokémon (or use Grass Energy already in hand).',
    natureStorm114:'Once per game, move up to 10 damage counters from your Benched Pokémon to the opponent’s Benched Pokémon, one counter at a time (if Flower Garden is not protecting the Bench).',
    combatDance112:'Place 2 damage counters on each Pokémon in play (yours and your opponent’s) with Fighting Energy attached.',
    rejuvenate:'For each damage counter on this Comfey, move 1 card from the top of your discard pile into your deck, then shuffle your deck. This attack does not heal damage. If fewer cards are discarded, move only those available.',
    extraEnergyDraw:'Draw 1 card for every Energy attached to this Pokémon beyond this attack’s Energy cost.',
    mountainDance:'If you have fewer Prize cards remaining than your opponent, draw cards equal to the number of Prize cards your opponent has remaining. Otherwise, draw nothing.',
    terrainStomp:'If a Stadium is in play, this attack does 130 more damage and discards it.',
    chasmCrash113:'If at least 8 Energy are attached, discard the opponent’s hand.',
    shadowPeck112:'If this Pokémon has room for a Tool, take 1 Tool attached to the opponent’s Active Pokémon and attach it to this Pokémon.',
    captivate114:'You may repeatedly discard 1 attached Energy from this Pokémon to choose and discard up to 2 cards from your opponent’s hand each time.',
    predatorPlunge114:'Knock Out the opponent’s Active Pokémon if it has at least 1 Water Energy attached (Basic or Special). Other Energy types do not count.',
    scavengeItems111:'Choose up to 2 Item cards from your discard pile and put them into your hand.',
    furiousJab111:'Flip 3 coins, or 6 if this Pokémon has 60 HP or less remaining. Deal 20 damage per heads.',
    endeavorousFlight112:'This attack does 10 damage plus 10 for each card in your discard pile. If your discard pile has more than 20 cards, it does no damage.',
    unfairFight112:'This attack does 100 extra damage if your opponent has more Pokémon in play than you.',
    beakInvasion112:'Choose 0–5 cards to discard from the top of the opponent’s deck. The attack loses 20 damage per discarded card.',
    goodDreams114:'You can use this move while Asleep. Choose up to 3 Basic Energy from your Energy supply and attach them one at a time to your Benched Pokémon.',
    startlingSnore113:'If the target has a Special Condition, do 100 more damage; then remove its Special Conditions.',
    foodRush113:'Look at the top 3 cards of your deck. Put any Item cards among them into your hand; shuffle the others into your deck.',
    leadTheWay:'Your opponent draws 1 card. If it is a Basic Pokémon, discard it from their hand.',
    wickedFlock111:'Choose 1 opposing Pokémon. Put 4 damage counters on it for each Murkrow you have in play (including your Active Pokémon).',
    bidoofGnaw111:'This attack does 40 more damage if the opponent’s Active Pokémon is Fighting type.',
    hibernate114:'If this Pokémon has at least 3 Energy attached, prevent attack damage to it during your opponent’s next turn; discard its Energy when the protection expires.',
    exactSixPrizes113:'This attack does 80 more damage when exactly 6 Prize cards remain.',
    flyOff114:'You may switch this Pokémon with one of your Benched Pokémon. If you switch, attach 1 Basic Energy from your Energy supply to the new Active Pokémon.',
    windStorm114:'Discard up to 2 attached Energy from this Pokémon, choosing each one separately.',
    voltSwitch112:'If this Pokémon has Lightning Energy attached, you may switch it with one of your Benched Pokémon.',
    herding114:'For each Bouffalant you have in play, you may attach 1 Basic Energy from your discard pile to one of your Pokémon.',
    rearUp113:'If this Pokémon is damaged by an attack on the opponent’s next turn, discard 1 Energy from the attacker.'
  });
  function summarizeEffect(effect){
    if(!effect||effect.type==='noop')return '';
    const n=Number(effect.amount||0),target=String(effect.target||'');
    if(effect.type==='lentalRule')return florioRuleSummary[effect.rule]||`Resolve the ${String(effect.rule||'special').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\d+$/,'')} effect.`;
    if(effect.type==='sequence')return (effect.effects||[]).map(summarizeEffect).filter(Boolean).join(' ');
    if(effect.type==='coinFlip')return 'Flip a coin. '+(effect.heads?'On heads: '+summarizeEffect(effect.heads):'')+(effect.tails?' On tails: '+summarizeEffect(effect.tails):'');
    if(effect.type==='fieldCountDamage')return `Deal ${n} extra damage for each ${effect.filter?.name||'qualifying Pokémon'} you have in play.`;
    if(effect.type==='damageRule')return [effect.ignoreWeakness?'Ignore Weakness.':'',effect.ignoreResistance?'Ignore Resistance.':'',effect.ignoreEffects?'Ignore effects on the Defending Pokémon.':''].filter(Boolean).join(' ');
    if(effect.type==='actionLock')return `Your opponent cannot play ${effect.cardType==='SpecialEnergy'?'Special Energy':effect.cardType==='Tool'?'Pokémon Tools':effect.cardType==='Trainer'?'Trainer cards':effect.cardType||'those cards'} during their next turn.`;
    if(effect.type==='discardTop')return `Discard ${n||1} card${n===1?'':'s'} from the top of ${effect.side==='opponent'?'your opponent’s':'your'} deck.`;
    if(effect.type==='status')return `Make ${target==='self'?'this Pokémon':"the opponent’s Active Pokémon"} ${String(effect.status||'affected')}.`;
    if(effect.type==='healSelf')return `Heal ${n} damage from this Pokémon.`;
    if(effect.type==='heal')return `Heal ${n} damage from the chosen Pokémon.`;
    if(effect.type==='selfDamage')return `This Pokémon also takes ${n} damage.`;
    if(effect.type==='draw')return `Draw ${n||1} card${n===1?'':'s'}.`;
    if(effect.type==='discardEnergyCard'||effect.type==='discardEnergy')return `Discard ${effect.amount==='all'?'all':n||1} attached ${effect.energyType||'Energy'} ${effect.amount==='all'?'cards':'card(s)'} from ${target==='self'?'this Pokémon':'the selected Pokémon'}.`;
    if(effect.type==='attachEnergy')return `Attach ${n||1} ${effect.energyType||'Energy'} Energy from ${effect.source==='hand'?'your hand (or the matching next Energy Zone card in Classic)':effect.source||'the Energy Zone'} to ${target==='self'?'this Pokémon':'a Pokémon'}.`;
    if(effect.type==='benchDamage')return `Deal ${n} damage to ${effect.all?'each ':''}${effect.side==='self'?'your':'the opponent’s'} Benched Pokémon.`;
    if(effect.type==='benchCountDamage')return `Deal ${n} additional damage per qualifying ${effect.pokemonType||''} Benched Pokémon.`;
    if(effect.type==='energyDamage')return `Damage scales by ${Number(effect.amount||10)} for each qualifying attached Energy.`;
    if(effect.type==='coinDamage')return `Flip ${effect.coins||1} coins; deal ${effect.amount||10} damage per heads.`;
    if(effect.type==='bonusDamage')return `Deal ${n} additional damage when the condition is met${effect.condition?.type==='opponentMatches'&&effect.condition.filter?.subtype?' (opponent has '+effect.condition.filter.subtype+' type)':''}.`;
    if(effect.type==='switch')return `Switch ${effect.side==='opponent'?'your opponent’s':'your'} Active Pokémon with a Benched Pokémon.`;
    if(effect.type==='lock')return `Prevent ${effect.target==='self'?'this Pokémon':'the target'} from ${effect.action||'acting'} for the specified turn.`;
    if(effect.type==='searchChosen')return `Search your ${effect.source||'deck'} for ${effect.amount||1} matching card(s).`;
    if(effect.type==='nextAttackBonus')return `Deal ${n} more damage with the named attack next time.`;
    if(effect.type==='damageFromDamage')return 'Damage depends on damage counters already placed.';
    if(effect.type==='reorderTop')return `Look at and rearrange the top ${effect.count||1} cards of your deck.`;
    if(effect.type==='neoRule')return ''; // Printed rule text is displayed on the attack; no placeholder for plain damage.
    return `Resolve ${String(effect.type||'special').replace(/([a-z])([A-Z])/g,'$1 $2')} effect.`;
  }
  function attackDescription(attack){
    if(!attack)return '';
    const printed=typeof attack.text==='string'&&attack.text.trim()?attack.text:typeof attack.printedText==='string'&&attack.printedText.trim()?attack.printedText:'';
    const detail=printed||summarizeEffect(attack.effect);
    const special=attack.requiresAsleep?'This Pokémon must be Asleep to use this attack. ':'';
    return (special+detail).trim()||(Number(attack.damage)>0?`Deal ${Number(attack.damage)} damage.`:'No additional effect.');
  }
  function cardRulesHtml(card,availability,options){
    const text=value=>typeof value==='string'?value:Array.isArray(value)?value.filter(v=>typeof v==='string').join(' '):'';
    const paragraph=value=>value?`<p>${esc(value)}</p>`:'';
    const abilities=cardAbilities(card);
    const abilityName=ability=>card.source!=='tcg'?'Ability':ability.printedPowerType==='body'?'Poké-Body':ability.printedPowerType==='power'?'Poké-Power':'Pokémon Power';
    const abilityHtml=abilities.map(ability=>`<article><div><b>${esc(abilityName(ability))} · ${esc(ability.name||'Ability')}</b></div>${paragraph(text(ability.text)||summarizeEffect(ability.effect))}${paragraph(text(ability.timing))}</article>`).join('');
    const handEnergyNote=card.id==='ex15-95'&&currentBattle?.format==='classic'?'<p><b>Fellow Boost:</b> This needs a Basic Energy card in your hand, not the Energy Zone. Mr. Stone\'s Project can retrieve Basic Energy into your hand.</p>':'';
    const attacks=(card.attacks||[]).map((attack,i)=>`<article><div><b>${esc(attack.name)}</b><strong>${esc(attack.damageText??attack.damage??0)}</strong></div>${energyCostHtml(availability?.[i]?.cost??attack.cost)}${paragraph(attackDescription(attack))}${paragraph(availability?.[i]?.reason)}</article>`).join('');
    const subtype=card.trainerSubtype||card.trainerType||'Trainer';
    const defaultTiming=subtype==='Supporter'?'You may play only 1 Supporter during your turn.':subtype==='Tool'?'Attach to 1 of your Pokémon that does not already have a Tool.':subtype==='Stadium'?'Only 1 Stadium may be in play.':'';
    // Keep the printed Trainer effect intact, but explain the Classic Energy
    // Zone adaptation next to it when the original assumes Energy in deck.
    const florioAdaptation=card.id==='SNAPFLORIO-119'?'<p><b>Classic Energy Zone adaptation:</b> Each player attaches the next Basic Energy from their ordered Energy Zone to their Active Pokémon (in addition to their normal once-per-turn Energy attachment). If a supply is empty, generated Basic Energy already in hand can be used instead.</p>':'';
    const classicAdaptation=card.id==='gym2-124'?'<p><b>Classic 30 adaptation:</b> Basic Energy is not in your deck. Discard up to three cards from the top of your deck and add one Fire Energy card from the Energy Zone to your hand. You can attach it to a Pokémon without using your normal Energy Zone attachment.</p>':'';
    const discoveryAdaptation=card.id==='neo2-48'||card.id==='neo2-51'?'<p><b>Classic compact-board adaptation:</b> This game has three Bench slots. Count the four named Unown across your Active Pokémon and Bench rather than requiring four Benched Unown.</p>':card.id==='neo2-44'||card.id==='neo2-75'?'<p><b>Classic Energy Zone adaptation:</b> Basic Energy is generated separately, so this effect supplies the corresponding Basic Energy directly from the Energy Zone.</p>':'';
    const trainer=card.kind==='trainer'?`<article><div><b>${esc(card.name)}</b><strong>${esc(subtype)}</strong></div>${paragraph(text(card.text)||text(card.printedRules)||summarizeEffect(card.effect))}${classicAdaptation}${florioAdaptation}${paragraph(text(card.timing)||defaultTiming)}</article>`:'';
    const energy=card.kind==='energy'?`<article><div><b>${esc(card.name)}</b><strong>${card.specialEnergy?'Special Energy':'Basic Energy'}</strong></div>${paragraph(text(card.text)||summarizeEffect(card.effect))}</article>`:'';
    return abilityHtml+handEnergyNote+attacks+trainer+energy+discoveryAdaptation+(options?.developer?paragraph(supportText(card)):'');
  }
  function energyCostHtml(cost){
    const letters=String(cost||'').split('').filter(Boolean);
    if(!letters.length)return '<span class="tcgp-cost-empty">No Energy</span>';
    const labelFor=letter=>({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless',N:'Dragon'}[letter]||letter);
    return `<span class="tcgp-cost">${letters.map(letter=>energyIconHtml(labelFor(letter),{className:'cost'})).join('')}</span>`;
  }
  function slotTools(slot){
    return slot?[slot.tool,...(slot.extraTools||[])].filter(Boolean):[];
  }
  function buildInspectSpec(side,zone,index,toolIndex){
    return { side:side||'player', zone:zone||'active', index:Number(index||0), toolIndex:Number(toolIndex||0) };
  }
  function resolveInspect(state,spec){
    if(!state)return null;
    const probe=spec||battleInspect||buildInspectSpec('player','active',0);
    const sideName=probe.side==='opponent'?'opponent':'player';
    const side=state.sides?.[sideName];
    if(!side)return null;
    if(['discard','stadium','tool-active','tool-bench'].includes(probe.zone)){
      const slot=probe.zone==='tool-active'?side.active:probe.zone==='tool-bench'?(core.benchSlotAt?core.benchSlotAt(side,probe.index):side.bench?.[probe.index]):null;
      const ref=probe.zone==='discard'?side.discard?.[probe.index]:probe.zone==='stadium'?state.stadium:slotTools(slot)[Number(probe.toolIndex||0)];
      if(!ref)return null;const card=data.cardById(ref.cardId);return {spec:probe,sideName,zone:probe.zone,slot:null,ref,card,title:card?.name||ref.cardId,subtitle:probe.zone==='stadium'?'Stadium in play':slot?'Attached Pokémon Tool':`${sideName==='player'?'Your':'CPU'} discard pile`};
    }
    if(probe.zone==='hand'){
      const ref=side.hand?.[Number(probe.index)||0];
      if(!ref)return null;
      const card=data.cardById(ref.cardId);
      return { spec:probe, sideName, zone:'hand', slot:null, ref, card, title:card?.name||ref.cardId, subtitle:`${sideName==='player'?'Your':'CPU'} hand card` };
    }
    if(probe.zone==='bench'){
      const slot=core.benchSlotAt?core.benchSlotAt(side,Number(probe.index)||0):side.bench?.[Number(probe.index)||0];
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
  function toolInspectAttrs(side,zone,index,toolIndex){
    return `${inspectAttrs(side,'tool-'+zone,index)} data-tool-index="${Number(toolIndex||0)}"`;
  }
  function attachedToolLinksHtml(info,index){
    if(!info?.slot)return'';
    return slotTools(info.slot).map((ref,toolIndex)=>{
      const card=data.cardById(ref.cardId),name=card?.name||ref.cardId||`Tool ${toolIndex+1}`;
      return `<button class="tcgp-battle-action secondary" ${toolInspectAttrs(info.sideName,info.zone,index,toolIndex)}>Inspect ${esc(name)}</button>`;
    }).join('');
  }
  function logText(entry){
    if(entry.type==='turn')return`Turn ${entry.turnNumber}: ${entry.side==='player'?'Your':'CPU'} turn`;
    if(entry.type==='attack')return`${entry.side==='player'?'You':'CPU'} used ${entry.attack} for ${entry.damage}${entry.damageReason?` (${entry.damageReason})`:''}`;
    if(entry.type==='ko')return`${cardName(entry.cardId)} was Knocked Out`;
    if(entry.type==='search')return`${entry.side==='player'?'You':'CPU'} found ${cardName(entry.cardId)}`;
    if(entry.type==='pokemonTraderReveal')return`${entry.side==='player'?'You':'CPU'} traded ${cardName(entry.fromHand)} for ${cardName(entry.fromDeck)}`;
    return actionEventText(entry);
  }

  function actionIndicesFor(predicate){const out=[];battleActionCache.forEach((action,index)=>{if(predicate(action))out.push(index);});return out;}
  // A legal attack/Power option targeting an in-play Pokemon must be chosen
  // on that Pokemon's physical slot, never from a duplicate-name text list.
  // The effectSelection UID is the existing battle-engine target contract.
  function boardTargetForAction(state,action){
    if(!state||!action)return null;
    const uid=action.effectSelection;
    if(typeof uid==='string'&&uid){
      for(const side of ['player','opponent']){
        const ss=state.sides?.[side];if(!ss)continue;
        if(ss.active?.uid===uid)return {side,zone:'active',index:0};
        for(const slot of ss.bench||[])if(slot?.uid===uid)return {side,zone:'bench',index:Number(slot.benchSlot)};
      }
    }
    // Some selectable attacks offer the defending Active as the empty
    // effectSelection alternative to UID-backed Bench targets.
    if(action.type==='attack'&&(uid===''||uid==null)&&/^(?:(?:target|attack) (?:the )?(?:opposing |current )?(?:active|defender|defending pok[eé]mon)|keep current (?:opposing )?active)$/i.test(String(action.choiceLabel||'').trim()))
      return state.sides?.opponent?.active?{side:'opponent',zone:'active',index:0}:null;
    if(action.type==='attack'&&action.target==='opponentBench')return {side:'opponent',zone:'bench',index:Number(action.benchIndex)};
    if(action.type==='attack'&&action.target==='opponentActive')return {side:'opponent',zone:'active',index:0};
    return null;
  }
  function boardTargetOnlyActions(state,actions,indices){
    if(!Array.isArray(indices)||indices.length<2)return false;
    const places=indices.map(i=>boardTargetForAction(state,actions[i]));
    return places.every(Boolean)&&new Set(places.map(p=>`${p.side}:${p.zone}:${p.index}`)).size===places.length;
  }
  function classicTrainerRestriction(state,side='player'){
    if(state?.format!=='classic'||state.phase!=='battle'||state.activeSide!==side)return '';
    const s=state.sides?.[side]||{},turn=Number(state.turnNumber);
    if(Number(s.ex8TrainerLockUntil||0)>=turn)return 'TRAINERS BLOCKED · Disconnect or High Voltage: Items, Tools and Stadiums cannot be played this turn. Supporters are allowed.';
    if(Number(s.ex7TrainerLockedUntil||0)>=turn)return 'TRAINERS BLOCKED · Opponent attack: Items, Tools and Stadiums cannot be played this turn. Supporters are allowed.';
    if(Number(s.ex8SupporterLockUntil||0)>=turn)return 'SUPPORTERS BLOCKED · Opponent attack: Supporters cannot be played this turn. Other Trainers are allowed.';
    return '';
  }
  function contextActionButton(indices,label,extraClass){
    if(!indices.length)return'';
    if(indices.length===1)return `<button type="button" class="tcgp-live-context-action ${extraClass||''}" data-tcgp-action="battle-action" data-action-index="${indices[0]}">${esc(label)}</button>`;
    return `<button type="button" class="tcgp-live-context-action ${extraClass||''}" data-tcgp-action="open-context-actions" data-action-indices="${indices.join(',')}">${esc(label)}${boardTargetOnlyActions(currentBattle,battleActionCache,indices)?' · TAP TARGET':''}</button>`;
  }
  function energyTargetAttrs(side,zone,index){
    if(side!=='player')return'';
    const hit=battleActionCache.find(action=>action.type==='attach'&&action.target===zone&&(zone!=='bench'||Number(action.benchIndex)===Number(index||0)));
    return hit?`data-energy-target="1" data-energy-zone="${esc(zone)}" data-energy-index="${Number(index||0)}"`:'';
  }
  function benchSwitchActionIndices(actions,benchIndex){
    return (actions||[]).map((action,i)=>({action,i})).filter(({action})=>
      Number(action?.benchIndex)===Number(benchIndex)&&(
        action.type==='retreat'||action.type==='promote'||
        (action.type==='trainer'&&action.target==='bench'&&data.cardById(action.cardId)?.name==='Switch')
      )).map(({i})=>i);
  }
  function pokemonActionIndices(side,zone,index){
    if(side!=='player'||!currentBattle)return[];
    const benchIndex=Number(index||0);
    if(currentBattle.phase==='promote'&&currentBattle.promotionSide==='player'&&zone==='bench')return actionIndicesFor(action=>action.type==='promote'&&Number(action.benchIndex)===benchIndex);
    if(currentBattle.phase!=='battle'||currentBattle.activeSide!=='player'||cpuPending)return[];
    if(zone==='active')return actionIndicesFor(action=>['attack','retreat'].includes(action.type)||(action.type==='ability'&&action.target==='active'));
    if(zone==='bench')return actionIndicesFor(action=>action.type==='ability'&&action.target==='bench'&&Number(action.benchIndex)===benchIndex);
    return[];
  }
  // Board choices stay on the board.  A list of Pokémon with identical names
  // must never collapse into duplicate, indistinguishable text buttons.
  function choiceBoardActions(state,actions,side,zone,index){
    const pending=state?.pendingChoice;
    if(!state||state.phase!=='effectChoice'||state.choiceSide!=='player'||!pending)return [];
    const selectionSide=pending.selectionSide||pending.attackSide||pending.side||'player';
    if(side!==selectionSide)return [];
    return (actions||[]).map((action,i)=>({action,i})).filter(({action})=>action?.type==='effectChoice'&&action.choiceTarget===zone&&(zone!=='bench'||Number(action.choiceBenchIndex)===Number(index||0))).map(({i})=>i);
  }
  function contextualBoardActions(actions,side,zone,index){
    if(!['context-actions','energy-actions'].includes(battleOverlay))return [];
    return battleContextActionIndices.filter(i=>{
      const a=actions?.[i],target=boardTargetForAction(currentBattle,a);
      if(target)return target.side===side&&target.zone===zone&&(zone!=='bench'||target.index===Number(index));
      return side==='player'&&a&&((a.type==='retreat'||a.type==='promote')&&zone==='bench'&&Number(a.benchIndex)===Number(index)||a.type==='trainer'&&a.target===zone&&(zone!=='bench'||Number(a.benchIndex)===Number(index))||a.type==='attach'&&a.target===zone&&(zone!=='bench'||Number(a.benchIndex)===Number(index)));
    });
  }
  function canChooseBoardDirect(state,actions){
    if(state?.phase!=='effectChoice'||state.choiceSide!=='player')return false;
    return ['pokemon','switchBench','narrowGymReturn','attack','energyTarget','energySource','toolCard'].includes(state.pendingChoice?.kind)||state.pendingChoice?.special==='narrowGymReturn';
  }
  function boardChoiceAttrs(side,zone,index){
    const indices=choiceBoardActions(currentBattle,battleActionCache,side,zone,index);
    if(indices.length&&canChooseBoardDirect(currentBattle,battleActionCache))return `data-tcgp-action="choose-board-card" data-side="${esc(side)}" data-zone="${esc(zone)}" data-index="${Number(index||0)}" aria-label="Select ${esc(slotName(currentBattle,side,zone,index))} for this effect"`;
    const context=contextualBoardActions(battleActionCache,side,zone,index);
    if(context.length)return `data-tcgp-action="choose-board-card" data-side="${esc(side)}" data-zone="${esc(zone)}" data-index="${Number(index||0)}" aria-label="Select ${esc(slotName(currentBattle,side,zone,index))} as the target"`;
    return '';
  }
  function activeBoardChoiceMode(){
    return canChooseBoardDirect(currentBattle,battleActionCache)&&battleActionCache.some(a=>a?.type==='effectChoice'&&a.choiceTarget&&['active','bench'].includes(a.choiceTarget));
  }
  function choiceZoneKind(){return currentBattle?.pendingChoice?.kind||'';}
  function handChoiceActionIndices(index){
    return currentBattle?.phase==='effectChoice'&&currentBattle.choiceSide==='player'&&choiceZoneKind()==='handCard'
      ?battleActionCache.map((a,i)=>a?.type==='effectChoice'&&Number(a.choiceHandIndex)===Number(index)?i:-1).filter(i=>i>=0):[];
  }
  function pokemonInteractionAttrs(side,zone,index,slot){
    if(!slot)return inspectAttrs(side,zone,index);
    const boardChoice=boardChoiceAttrs(side,zone,index);if(boardChoice)return boardChoice;
    if(side!=='player')return inspectAttrs(side,zone,index);
    if(zone==='bench'&&currentBattle?.phase==='effectChoice'&&currentBattle?.choiceSide==='player'&&currentBattle?.pendingChoice?.special==='narrowGymReturn'){
      const actionIndex=battleActionCache.findIndex(action=>action.type==='effectChoice'&&action.choiceTarget==='bench'&&Number(action.choiceBenchIndex)===Number(index));
      if(actionIndex>=0)return `data-tcgp-action="battle-action" data-action-index="${actionIndex}" aria-label="Return ${esc(cardName(slot.cardId))} to hand for Narrow Gym"`;
    }
    const indices=pokemonActionIndices(side,zone,index),activeAttackSurface=currentBattle?.phase==='battle'&&currentBattle?.activeSide==='player'&&zone==='active'&&!cpuPending;
    // A tapped Benched Pokemon should explain why its attacks cannot be used,
    // not silently open a read-only inspector that looks like a broken attack menu.
    const benchActionView=currentBattle?.phase==='battle'&&currentBattle?.activeSide==='player'&&zone==='bench'&&!cpuPending;
    // Classic's compact board must let the user select *any* of their
    // Pokémon, including a Benched Mewtwo without a currently legal attack.
    if(currentBattle?.format==='classic'&&['bench','active'].includes(zone))
      return `data-tcgp-action="open-pokemon-actions" data-side="${esc(side)}" data-zone="${esc(zone)}" data-index="${Number(index||0)}" aria-label="Select ${esc(cardName(slot.cardId))}, ${zone==='bench'?'Benched':'Active'} Pokémon"`;
    if(!indices.length&&!activeAttackSurface&&!benchActionView)return inspectAttrs(side,zone,index);
    return `data-tcgp-action="open-pokemon-actions" data-side="${esc(side)}" data-zone="${esc(zone)}" data-index="${Number(index||0)}"`;
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
      attacks.forEach(actionIndex=>{const action=battleActionCache[actionIndex],key=`${action.attackCardId||action.cardId}:${action.attackIndex}`;if(!attackGroups.has(key))attackGroups.set(key,[]);attackGroups.get(key).push(actionIndex);});
      const activeCardId=currentBattle?.sides?.player?.active?.cardId;
      const options=core.attackOptions?core.attackOptions(currentBattle,'player'):(data.cardById(activeCardId)?.attacks||[]).map((attack,attackIndex)=>({cardId:activeCardId,attackIndex,attack,previous:false}));
      options.forEach(({cardId:attackCardId,attackIndex,attack,previous,psymimic,technicalMachine})=>{
        const key=`${attackCardId}:${attackIndex}`,indices=attackGroups.get(key)||[],actionIndex=indices[0],availability=core.attackAvailability(currentBattle,'player',attackIndex,attackCardId),cost=core.energyCostLabel(availability.cost),preview=core.attackDamagePreview?.(currentBattle,'player',attackIndex,attackCardId),source=data.cardById(attackCardId);
        const attrs=!indices.length?`data-tcgp-action="explain-unavailable" data-reason="${esc(availability.reason)}" aria-disabled="true"`:indices.length>1?`data-tcgp-action="open-context-actions" data-action-indices="${indices.join(',')}"`:`data-tcgp-action="battle-action" data-action-index="${actionIndex}"`;
        const boardTargetAttack=boardTargetOnlyActions(currentBattle,battleActionCache,indices);
        const blocker=indices.length?cost:(/^Needs /i.test(availability.reason)?availability.reason.replace(/\. Attached:.*$/,'').replace(/\.$/,''):availability.reason.replace(/\.$/,'')),origin=psymimic?`PSYMIMIC · ${String(source?.name||'OPPONENT').toUpperCase()} · `:technicalMachine?'TECHNICAL MACHINE · ':previous?`FROM ${String(source?.name||'PREVIOUS EVOLUTION').toUpperCase()} · `:'';
        parts.push(`<button type="button" class="tcgp-live-context-action attack" title="${esc(availability.reason)}" ${attrs}><b>${esc(attack?.name||'ATTACK')}</b><small>${esc(origin+blocker)}${indices.length>1?(attack?.effect?.rule==='founja:flightPath'?' · CHOOSE BENCH ATTACK':attack?.effect?.rule==='expedition:lightningStrike'?' · CHOOSE DAMAGE':' · '+(boardTargetAttack?'TAP TARGET':'CHOOSE TARGET')):''}</small><em class="tcgp-live-attack-description">${esc(attackDescription(attack))}</em><strong>${esc(preview?.text??attack?.damageText??attack?.damage??0)} DMG</strong></button>`);
      });
      const retreats=actionIndicesFor(action=>action.type==='retreat');
      if(retreats.length)parts.push(contextActionButton(retreats,'RETREAT','retreat'));
      const abilities=actionIndicesFor(action=>action.type==='ability'&&action.target==='active');
      if(abilities.length){const first=battleActionCache[abilities[0]],card=data.cardById(currentBattle?.sides?.player?.active?.cardId),ability=cardAbilities(card)[Number(first?.abilityIndex||0)];parts.push(contextActionButton(abilities,ability?.name||'ABILITY','ability'));}
    }else if(zone==='bench'){
      const abilities=actionIndicesFor(action=>action.type==='ability'&&action.target==='bench'&&Number(action.benchIndex)===Number(index||0));
      if(abilities.length){const slot=core?.benchSlotAt?core.benchSlotAt(currentBattle?.sides?.player,index):currentBattle?.sides?.player?.bench?.[Number(index||0)],first=battleActionCache[abilities[0]],card=data.cardById(slot?.cardId),ability=cardAbilities(card)[Number(first?.abilityIndex||0)];parts.push(contextActionButton(abilities,ability?.name||'ABILITY','ability'));}
      if(currentBattle?.format==='classic'){
        for(const actionIndex of benchSwitchActionIndices(battleActionCache,index)){
          const action=battleActionCache[actionIndex];
          const label=action.type==='promote'?'PROMOTE TO ACTIVE':action.type==='retreat'?'RETREAT ACTIVE → HERE':'PLAY SWITCH → ACTIVE';
          parts.push(`<button type="button" class="tcgp-live-context-action promote" data-tcgp-action="battle-action" data-action-index="${actionIndex}">${label}</button>`);
        }
      }
    }
    return parts.length?`<div class="tcgp-live-card-actions">${parts.join('')}</div>`:'';
  }
  function liveBenchReadOnlyMovesHtml(card){
    if(!card?.attacks?.length)return '<p class="tcgp-live-bench-note">This Benched Pokémon has no attacks.</p>';
    const attacks=card.attacks.map(attack=>`<div class="tcgp-live-bench-move"><b>${esc(attack.name||'Attack')}</b>${energyCostHtml(attack.cost)}<small>${esc(attackDescription(attack))}</small></div>`).join('');
    return `<div class="tcgp-live-bench-note" role="note"><b>Benched Pokémon cannot attack.</b> Use Switch or retreat your Active Pokémon to bring this Pokémon Active. Once Active, its moves will be selectable if the required Energy is attached.</div><div class="tcgp-live-bench-moves"><small>ATTACKS · ACTIVE ONLY</small>${attacks}</div>`;
  }
  function liveAttachedEnergyHtml(info){
    if(!info)return'';
    const entries=Object.entries(info.energyPool||{}).filter(([,n])=>n>0);
    const specialRefs=info.specialEnergy||[];
    const specials=specialRefs.map(ref=>{
      const card=data.cardById(ref.cardId),provides=ref.provides||card?.effect?.provides||{};
      const units=Object.entries(provides).filter(([,n])=>Number(n)>0);
      const name=card?.name||'Special Energy',short=name==='Double Colorless Energy'?'DCE':name.replace(/ Energy$/,'');
      const benefit=units.map(([type,n])=>`${n} ${type}`).join(' + ')||'special';
      // Show just one small type symbol and a number: a full-size Energy
      // icon + its count badge hid most of the artwork on compact cards.
      return `<span class="tcgp-live-special-energy" title="${esc(`${name} · provides ${benefit} Energy`)}" aria-label="${esc(`${name} provides ${benefit} Energy`)}"><b>${esc(short)}</b>${units.map(([type,n])=>`${energyIconHtml(type,{className:'attached',title:`${n} ${type} Energy`})}<span class="tcgp-live-special-energy-count">×${Number(n)}</span>`).join('')}</span>`;
    });
    if(!entries.length&&!specials.length)return'';
    const label=[...entries.map(([type,n])=>`${n} ${type}`),...specialRefs.map(ref=>`${data.cardById(ref.cardId)?.name||'Special Energy'}`)].join(' + ');
    return `<span class="tcgp-live-attached-energy" aria-label="${esc(label)} attached Energy">${entries.map(([type,n])=>energyIconHtml(type,{className:'attached',count:n,title:`${n} ${type} Energy`})).join('')}${specials.join('')}</span>`;
  }
  function liveToolMiniCardsHtml(side,zone,index,slot,compact){
    const tools=slotTools(slot);
    if(!tools.length)return'';
    return `<span class="tcgp-live-tool-stack ${compact?'compact':''}" aria-label="${tools.length} attached Pokémon Tool${tools.length===1?'':'s'}">${tools.map((ref,toolIndex)=>{
      const card=data.cardById(ref.cardId),art=cardArtUrl(ref.cardId,side),name=card?.name||ref.cardId||`Tool ${toolIndex+1}`;
      const choice=battleActionCache.findIndex(a=>a?.type==='effectChoice'&&currentBattle?.phase==='effectChoice'&&currentBattle.choiceSide==='player'&&currentBattle.pendingChoice?.kind==='toolCard'&&a.choiceToolIndex===toolIndex&&a.choiceCardId===ref.cardId&&a.choiceTarget===zone&&(zone!=='bench'||Number(a.choiceBenchIndex)===Number(index)));
      const attrs=choice>=0?`data-tcgp-action="battle-action" data-action-index="${choice}"` : toolInspectAttrs(side,zone,index,toolIndex);
      return `<button type="button" class="tcgp-live-tool-mini ${choice>=0?'tool-choice-eligible':''}" style="--tool-i:${toolIndex}" ${attrs} aria-label="${choice>=0?'Choose':'Inspect'} attached Tool ${esc(name)}">${art?`<img src="${esc(art)}" alt="${esc(name)}">`:`<span>${esc(String(name).slice(0,1))}</span>`}</button>`;
    }).join('')}</span>`;
  }
  function liveCardHtml(slot,opts){
    const settings=opts||{},compact=!!settings.compact,side=settings.side||'player',zone=settings.zone||'active',index=Number(settings.index||0),showActions=settings.showActions!==false,energyAttrs=energyTargetAttrs(side,zone,index),dropAttrs=cardDropAttrs(side,zone,index);
    if(!slot)return `<div data-board-slot="${side}-${zone}-${index}" class="tcgp-live-card-wrap ${compact?'compact':''}" ${dropAttrs}><button type="button" class="tcgp-live-card ${compact?'compact ':''}empty" ${inspectAttrs(side,zone,index)} ${energyAttrs}><span>${zone==='active'?'ACTIVE':'BENCH '+(index+1)}</span></button></div>`;
    const info=hpInfo(slot,side),card=info.card,art=cardArtUrl(slot.cardId,side),conditions=Object.keys(slot.conditions||{}).filter(key=>slot.conditions[key]).map(key=>key.toUpperCase()).join(' · '),interactionAttrs=pokemonInteractionAttrs(side,zone,index,slot);
    return `<div data-board-slot="${boardSlotKey(side,zone,index)}" class="tcgp-live-card-wrap ${compact?'compact':''}" ${dropAttrs} ${side==='player'&&currentBattle?.format==='classic'?interactionAttrs:''}><button type="button" class="tcgp-live-card ${compact?'compact':''}" ${interactionAttrs} ${energyAttrs}>${art?`<img src="${esc(art)}" alt="${esc(card?.name||slot.cardId)}">`:''}<span class="tcgp-live-hp">${info.left}</span>${conditions?`<span class="tcgp-live-condition">${esc(conditions)}</span>`:''}${liveAttachedEnergyHtml(info)}<span class="tcgp-live-name">${esc(card?.name||slot.cardId)}</span></button>${liveToolMiniCardsHtml(side,zone,index,slot,compact)}${showActions?livePokemonActionsHtml(side,zone,index):''}</div>`;
  }
  function liveBenchHtml(sideName,bench){
    const slots=[];
    const limited=currentBattle?.format==='classic'&&currentBattle?.stadium?.cardId==='gym1-124'&&currentBattle?.pendingChoice?.special!=='narrowGymReturn';
    const sideState=currentBattle?.sides?.[sideName]||{bench:bench||[],benchLimit:limited?2:3};
    // A knockout can leave an old physical slot 2 populated. Normalize here
    // as well as in the engine so no occupied Pokémon becomes invisible.
    core?.normalizeBenchSlots?.(sideState);
    for(let i=0;i<Math.min(5,Math.max(Number(sideState.benchLimit??3),sideState.bench?.length||0));i++){const slot=core?.benchSlotAt?core.benchSlotAt(sideState,i):(bench?.[i]||null);slots.push(liveCardHtml(slot,{compact:true,side:sideName,zone:'bench',index:i,showActions:false}));}
    return slots.join('');
  }
  function classicOpponentHandRevealed(battle){
    if(battle?.format!=='classic'||!effects?.findPassiveRule)return false;
    for(const slot of [battle.sides?.player?.active,...(battle.sides?.player?.bench||[])].filter(Boolean)){
      if(slot.conditions?.sleep||slot.conditions?.paralysis||slot.conditions?.confusion)continue;
      if(effects.findPassiveRule(battle,'player',slot,'fossilClairvoyance',data.cardById))return true;
    }
    return false;
  }
  function liveOpponentHandHtml(side){
    const sleeve=sleeveArtPath('opponent'),visible=Math.min(5,side.hand.length),reveal=classicOpponentHandRevealed(currentBattle);
    const backs=(reveal?side.hand.slice(0,visible).map((ref,i)=>{
      const card=data.cardById(ref.cardId),art=cardArtUrl(ref.cardId,'opponent');
      return `<i style="--i:${i}" title="${esc(card?.name||ref.cardId)}">${art?`<img src="${esc(art)}" alt="${esc(card?.name||ref.cardId)}">`:`<span>${esc(card?.name||ref.cardId)}</span>`}</i>`;
    }):Array.from({length:visible},(_,i)=>`<i style="--i:${i};${sleeve?`background-image:url('${esc(sleeve)}');`:''}"></i>`)).join('');
    return `<div data-hand-side="opponent" class="tcgp-live-hand-backs ${reveal?'is-revealed':''}" style="--back-count:${visible}" aria-label="Opponent hand ${side.hand.length} cards${reveal?', revealed by Clairvoyance':''}">${backs}<b>${side.hand.length}</b></div>`;
  }
  function centerHandActionIndices(actions,handIndex){
    const allowed=new Set(['setupActive','setupBench','bench','evolve','trainer','attachSpecial']);
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
      const special=find(action=>action.type==='attachSpecial'&&action.target===zone&&(!String(zone).toLowerCase().includes('bench')||Number(action.benchIndex)===benchIndex));
      if(special>=0)return special;
      const trainer=find(action=>action.type==='trainer'&&action.target===zone&&(!String(zone).toLowerCase().includes('bench')||Number(action.benchIndex)===benchIndex));
      if(trainer>=0)return trainer;
      // Trainers without a target use the player's Active area as the general
      // play surface. Targeted Trainers still resolve only on the Pokémon they
      // were dropped onto, so healing / Tool / similar plays need no chooser.
      const untargetedTrainer=zone==='active'?find(action=>action.type==='trainer'&&action.target==null&&action.effectTarget==null):-1;
      if(untargetedTrainer>=0)return untargetedTrainer;
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
      const card=data.cardById(ref.cardId),art=cardArtUrl(ref.cardId,'player'),choice=handChoiceActionIndices(index),usable=centerHandActionIndices(battleActionCache,index).length>0||choice.length>0;
      return `<div data-hand-index="${index}" class="tcgp-live-hand-wrap ${usable?'playable':''} ${choice.length?'effect-choice-eligible':''} ${battleOverlay==='hand-picker'&&usable?'hand-picker-eligible':''}" style="--hand-i:${index}"><button type="button" class="tcgp-live-hand-card" data-tcgp-action="${choice.length?'choose-hand-card':'open-hand-actions'}" data-index="${index}" ${choice.length?'':'data-tcgp-hand-drag="'+index+'"'}>${art?`<img src="${esc(art)}" alt="${esc(card?.name||ref.cardId)}">`:`<span>${esc(card?.name||ref.cardId)}</span>`}</button></div>`;
    }).join('')||'<span class="tcgp-live-hand-empty">No cards</span>'}</div>`;
  }
  function layoutPlayerHand(){
    const host=el('tcgpBattleContent')?.querySelector('.tcgp-live-hand'),fan=host?.querySelector('.tcgp-live-hand-fan');if(!fan||!layout)return;
    const wraps=[...fan.querySelectorAll('.tcgp-live-hand-wrap')],model=layout.handFan(wraps.length,host.clientWidth,host.clientHeight);
    fan.style.width=model.spanWidth+'px';fan.style.setProperty('--card-width',model.cardWidth+'px');fan.style.setProperty('--card-height',model.cardHeight+'px');
    wraps.forEach((node,i)=>{const pose=model.cards[i];node.style.setProperty('--hand-x',pose.x+'px');node.style.setProperty('--hand-y',pose.y+'px');node.style.setProperty('--hand-angle',pose.angle+'deg');node.style.zIndex=pose.zIndex;});
  }
  function livePileHtml(sideName,side,kind){
    const isDiscard=kind==='discard',cardDiscard=(side.discard||[]).filter(ref=>data.cardById(ref.cardId)?.kind!=='energy'),energyCount=Object.values(side.energyDiscard||{}).reduce((n,v)=>n+Math.max(0,Number(v||0)),0)+(side.discard||[]).filter(ref=>data.cardById(ref.cardId)?.kind==='energy').length;
    const count=isDiscard?cardDiscard.length:side.deck.length,top=isDiscard&&count?cardDiscard[count-1]:null,emptyDiscard=isDiscard&&!count;
    const topArt=top?cardArtUrl(top.cardId,sideName):'',sleeve=sleeveArtPath(sideName),backStyle=!isDiscard&&sleeve?`background-image:url('${esc(sleeve)}');`:'';
    const attrs=isDiscard?`data-tcgp-action="open-discard" data-side="${esc(sideName)}"`:'';
    const fallbackText=isDiscard&&top&&!topArt?esc(cardName(top.cardId).slice(0,2).toUpperCase()):(!topArt&&!sleeve&&!isDiscard?'◆':'');
    return `<button type="button" data-pile-side="${esc(sideName)}" data-pile-kind="${esc(kind)}" class="tcgp-live-pile ${isDiscard?'discard':'deck'} ${sideName==='player'?'mine':''}" ${attrs} ${isDiscard?'':'disabled'} aria-label="${isDiscard?'View discard pile':'Deck'} ${count} cards"><span class="tcgp-live-pile-card${emptyDiscard?' empty':''}" style="${topArt?`background-image:url('${esc(topArt)}');`:backStyle}">${fallbackText}</span><b>${count}</b><small>${isDiscard?'DISCARD':'DECK'}</small>${isDiscard?`<span class="tcgp-live-pile-energy-count" aria-label="${energyCount} discarded Energy">⚡${energyCount}</span>`:''}</button>`;
  }
  function livePrizePileHtml(side){
    const count=side.prizes?.length||0,faceUp=(side.prizes||[]).filter(ref=>ref.faceUp).length;
    return `<button type="button" class="tcgp-live-prize-pile" data-tcgp-action="open-prizes" aria-label="View your ${count} remaining Prize cards"><span>PRIZES</span><b>${count}</b>${faceUp?`<small>${faceUp} revealed</small>`:''}</button>`;
  }
  function prizeCardArt(ref){return ref?.faceUp?cardArtUrl(ref.cardId,'player'):'';}
  function prizeCardButton(ref,index,actionIndex){
    const art=prizeCardArt(ref),sleeve=sleeveArtPath('player');
    return `<button type="button" class="tcgp-live-prize-card ${ref?.faceUp?'face-up':'face-down'}" ${actionIndex==null||actionIndex<0?'disabled':`data-tcgp-action="battle-action" data-action-index="${actionIndex}"`} aria-label="Prize ${index+1}${ref?.faceUp?`: ${esc(cardName(ref.cardId))}`:' · face down'}">${art?`<img src="${esc(art)}" alt="${esc(cardName(ref.cardId))}">`:ref?.faceUp?`<span class="tcgp-live-prize-revealed-name">${esc(cardName(ref.cardId))}</span>`:`<span class="tcgp-live-prize-back" style="${sleeve?`background-image:url('${esc(sleeve)}')`:''}">◆</span>`}<small>Prize ${index+1}${ref?.faceUp?' · revealed':''}</small></button>`;
  }
  function livePrizeOverlayHtml(){
    if(battleOverlay!=='prizes'||currentBattle?.format!=='classic')return '';
    const prizes=currentBattle.sides.player.prizes||[];
    return `<div class="tcgp-live-overlay"><button class="tcgp-live-overlay-scrim" type="button" data-tcgp-action="close-overlay" aria-label="Close Prize cards"></button><section class="tcgp-live-sheet tcgp-live-prize-sheet" role="dialog" aria-label="Your Prize cards"><header><h3>Your Prize cards · ${prizes.length} remaining</h3><button class="tcgp-live-sheet-close" type="button" data-tcgp-action="close-overlay" aria-label="Close">×</button></header><p>Face-down cards are hidden until claimed. Revealed Prize cards stay face-up.</p><div class="tcgp-live-prize-grid">${prizes.map((ref,i)=>prizeCardButton(ref,i,null)).join('')}</div></section></div>`;
  }
  function tellRevealFromLogs(entries){
    const log=(entries||[]).find(entry=>entry.type==='revealHand'&&entry.side==='player'&&entry.reason==='Unown [T] Tell');
    return log?{cards:[...(log.cards||[])],sharedHand:[...(log.sharedHand||[])]}:null;
  }
  function liveHandRevealOverlayHtml(){
    if(battleOverlay!=='hand-reveal'||!battleHandReveal)return '';
    const cards=battleHandReveal.cards||[];
    const tile=id=>{const art=cardArtUrl(id,'opponent'),name=data.cardById(id)?.name||id;
      return `<div class="tcgp-live-reveal-card" aria-label="${esc(name)}">${art?`<img src="${esc(art)}" alt="${esc(name)}">`:`<span>${esc(name)}</span>`}<small>${esc(name)}</small></div>`;};
    return `<div class="tcgp-live-overlay"><button class="tcgp-live-overlay-scrim" type="button" data-tcgp-action="close-hand-reveal" aria-label="Close revealed hand"></button><section class="tcgp-live-sheet tcgp-live-reveal-sheet" role="dialog" aria-modal="true" aria-label="Unown Tell revealed opponent hand"><div class="tcgp-live-sheet-head"><div><small>UNOWN [T] · TELL · HEADS</small><h3>Opponent's hand (${cards.length})</h3></div><button type="button" class="tcgp-live-sheet-close" data-tcgp-action="close-hand-reveal" aria-label="Close">×</button></div><p class="tcgp-live-play-hint">These are the opponent's current hand cards at the moment of the coin flip. Your hand has also been shown to the opponent.</p><div class="tcgp-live-reveal-grid">${cards.length?cards.map(tile).join(''):'<p>Opponent has no cards in hand.</p>'}</div><button type="button" class="tcgp-battle-action" data-tcgp-action="close-hand-reveal">CONTINUE BATTLE</button></section></div>`;
  }
  function liveEnergySourceHtml(side){
    const available=currentBattle?.phase==='battle'&&currentBattle?.activeSide==='player'&&!cpuPending&&side.energyAvailable&&!side.energyUsed;
    const energyType=side.energyType||side.energyTypes?.[0]||'Grass',next=side.nextEnergyType||side.energySupply?.[0]||energyType,third=side.energySupply?.[1]||null;
    const order=`This turn: ${energyType}. Next: ${next}${third?`; then: ${third}`:''}. ${Array.isArray(side.energySupply)?`${side.energySupply.length} remaining in Energy supply.`:''}`;
    return `<button type="button" data-energy-side="player" class="tcgp-live-energy-source ${available?'ready':''}" data-energy="${esc(energyType)}" data-tcgp-energy-source="1" data-tcgp-action="open-energy-actions" ${available?'':'disabled'} title="${esc(order)}" aria-label="${esc(order)} ${available?'Drag current Energy onto a Pokémon.':''}"><span class="tcgp-live-current-energy">${energyIconHtml(energyType,{className:'current'})}</span><span class="tcgp-live-next-energy">${energyIconHtml(next,{className:'next'})}</span>${third?`<span class="tcgp-live-third-energy">${energyIconHtml(third,{className:'following'})}</span>`:''}</button>`;
  }
  function zoomArtworkButtonHtml(art,cardName){
    return art?`<button type="button" class="tcgp-live-card-art-zoom-trigger" data-tcgp-action="zoom-card" aria-label="View ${esc(cardName)} full-screen"><img src="${esc(art)}" alt="${esc(cardName)}"><span>ENLARGE</span></button>`:'';
  }
  function cardZoomOverlayHtml(art,cardName){
    return art?`<div class="tcgp-live-card-zoom" hidden role="dialog" aria-modal="true" aria-label="${esc(cardName)} full-screen card"><button type="button" class="tcgp-live-card-zoom-scrim" data-tcgp-action="close-card-zoom" aria-label="Return to card details"></button><div class="tcgp-live-card-zoom-panel"><button type="button" class="tcgp-live-card-zoom-close" data-tcgp-action="close-card-zoom" aria-label="Close enlarged card">×</button><img src="${esc(art)}" alt="${esc(cardName)} full card artwork" draggable="false"><span>${esc(cardName)} · Tap outside to return</span></div></div>`:'';
  }
  function liveInspectOverlayHtml(){
    if(battleOverlay!=='inspect'||!battleInspect)return'';
    const info=resolveInspect(currentBattle,battleInspect);if(!info?.card)return'';
    const card=info.card,art=cardArtUrl(info.ref?.cardId||card.id,info.sideName),health=info.slot?hpInfo(info.slot,battleInspect.side):null;
    const links=attachedToolLinksHtml(info,battleInspect.index);
    return `<div class="tcgp-live-overlay"><button class="tcgp-live-overlay-scrim" type="button" data-tcgp-action="close-overlay" aria-label="Close card detail"></button><section class="tcgp-live-sheet tcgp-live-card-sheet"><button class="tcgp-live-sheet-close" type="button" data-tcgp-action="close-overlay">×</button><div class="tcgp-live-sheet-card">${zoomArtworkButtonHtml(art,card.name)}<div><div class="eyebrow">${esc(info.subtitle)}</div><h3>${esc(card.name)}</h3><div class="tcgp-live-tags"><span>${esc(typeLabel(card))}</span>${card.kind==='pokemon'||info.slot?`<span>HP ${health?.left??card.hp}/${health?.hp??card.hp}</span><span>⚡ ${health?.energy||0}</span><span>Retreat ${Number(card.retreat||0)}</span><span>Weak ${esc(card.weakness||'—')}</span>`:''}</div></div></div><div class="tcgp-live-sheet-attacks">${cardRulesHtml(card,info.zone==='active'?(card.attacks||[]).map((_,i)=>core.attackAvailability(currentBattle,info.sideName,i)):null)}</div>${links?`<div class="tcgp-battle-actions-row">${links}</div>`:''}</section>${cardZoomOverlayHtml(art,card.name)}</div>`;
  }
  function choiceVisibleActions(){
    if(currentBattle?.phase!=='effectChoice'||currentBattle.choiceSide!=='player')return [];
    const source=battleActionCache.map((action,index)=>({action,index}));
    if(battleChoiceBoardFilter)return source.filter(({action})=>action.choiceTarget===battleChoiceBoardFilter.zone&&(battleChoiceBoardFilter.zone!=='bench'||Number(action.choiceBenchIndex)===battleChoiceBoardFilter.index));
    return source;
  }
  function choiceCardModel(action,index){
    const pending=currentBattle?.pendingChoice||{},kind=pending.kind;
    const cardId=action.choiceCardId||null,card=cardId?data.cardById(cardId):null;
    const sourceLabel=kind==='deckCard'||kind==='topDeckCard'?'DECK':kind==='discardCard'?'DISCARD':kind==='opponentHandCard'?'CPU HAND':kind==='handCard'?'HAND':kind==='toolCard'?'TOOL':kind==='attack'?'ATTACK':'CHOICE';
    const energy=action.effectEnergyType||null;
    // Rule choices for basic Energy are generated by the Energy Zone: they
    // aren't hand/deck card refs, so resolve the matching real print for art.
    // Do not turn Special Energy, 'Draw 1 card', or other options into Energy.
    const label=String(action.choiceLabel||'').trim();
    const match=/^(?:(?:Find|Recover|Take|Attach|Choose|Get|Return|Discard|Search for)\s+)?(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal)(?:\s+(?:Basic\s+)?Energy)(?:\s+card)?$/i.exec(label)||/^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal)$/i.exec(label);
    const basicType=match?uiAssets?.normalise?.(match[1])||match[1]:!card&&energy&&uiAssets?.normalise?.(energy);
    const basicPrint=!card&&basicType?data.cardById(uiAssets?.energyCardId?.(basicType)):null;
    const art=cardId?cardArtUrl(cardId,pending.discardZone==='opponent'||kind==='opponentHandCard'?'opponent':'player'):(basicType?(basicPrint?.image||uiAssets?.energyCardUrl?.(basicType)||''):'');
    const special=action.effectSpecialEnergyUid&&currentBattle?.sides?.[pending.selectionSide||'player'];
    const title=card?.name||(basicType?`${basicType} Energy`:null)||action.choiceLabel||energy||actionLabel(action,currentBattle,'player');
    const detail=action.choiceAttackIndex!=null?(card?.attacks||[])[Number(action.choiceAttackIndex)]?.name||`Attack ${Number(action.choiceAttackIndex)+1}`:
      basicType?'BASIC ENERGY':special?'Special Energy':card?.number!=null?`#${card.number}`:sourceLabel;
    return {index,cardId:cardId||basicPrint?.id||null,title,detail,art,sourceLabel,optionLabel:card&&action.choiceLabel?action.choiceLabel:null};
  }
  function choiceCardTileHtml(action,index){
    const model=choiceCardModel(action,index),selected=battleChoiceSelectionIndex===index;
    // Artwork-only card picks shouldn't repeat the card name or BASIC ENERGY.
    // But meaningful labels (copied attacks, outcomes, different targets)
    // must stay visible so two identical pieces of art are never ambiguous.
    const optionLabel=String(action.choiceLabel||'').trim().toLowerCase().replace(/\s+/g,' '),
      cardName=String(model.title||'').trim().toLowerCase(),
      redundant=optionLabel===cardName||['find','choose','select','take','get','pick'].some(verb=>optionLabel===verb+' '+cardName),
      describe=!model.art||action.choiceAttackIndex!=null||!!(action.choiceLabel&&!redundant);
    return `<button type="button" class="tcgp-live-choice-card ${model.art?'':'text-option'} ${selected?'selected':''}" data-tcgp-action="select-choice-card" data-action-index="${index}" aria-pressed="${selected}" aria-label="${esc(model.title)} ${esc(model.detail)}">${model.art?`<img src="${esc(model.art)}" alt="${esc(model.title)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="tcgp-live-choice-placeholder" hidden>${esc(model.title)}</span>`:`<span class="tcgp-live-choice-text">${esc(model.title)}</span>`}${describe?`<small>${esc(model.optionLabel||model.detail)}</small>`:''}</button>`;
  }
  function liveEffectChoiceCenterHtml(){
    const battle=currentBattle,pending=battle?.pendingChoice;
    if(battle?.phase!=='effectChoice'||battle.choiceSide!=='player'||!pending)return '';
    if(pending.special==='chooseClassicPrize'){
      if(battlePrizePresentationHeld)return '';
      const prizes=battle.sides.player.prizes||[];
      const actions=battleActionCache;
      return `<section class="tcgp-live-choice-centre tcgp-prize-pick-centre" aria-label="Choose a Prize card"><div class="tcgp-live-choice-head"><div><small>PRIZE CARDS</small><b>${esc(pending.prompt||'Choose a Prize')}</b><span>Choose a position. Face-down cards remain hidden; any previously revealed cards are visible.</span></div></div><div class="tcgp-live-prize-grid">${prizes.map((ref,i)=>prizeCardButton(ref,i,actions.findIndex(a=>a.choicePrizeIndex===i))).join('')}</div></section>`;
    }
    const rows=choiceVisibleActions(),selected=rows.some(r=>r.index===battleChoiceSelectionIndex);
    const skip=rows.find(r=>r.action.choiceSkip),normal=rows.filter(r=>!r.action.choiceSkip);
    const board=activeBoardChoiceMode(),kind=choiceZoneKind();
    const boardDirect=board&&!battleChoiceBoardFilter;
    const handDirect=kind==='handCard';
    const showCards=!boardDirect&&!handDirect;
    const prompt=pending.prompt||(boardDirect?'Choose a Pokémon on the board':handDirect?'Choose a raised card in your hand':'Choose a card');
    const note=boardDirect?'Tap a highlighted Pokémon. The card stays in its slot.':handDirect?'Valid cards are raised in your hand. Tap one to select it.':kind==='deckCard'||kind==='topDeckCard'?'Browse the available deck cards, then confirm.':kind==='discardCard'?'Choose a card from the discard pile, then confirm.':'Select a card or option, then confirm.';
    return `<section class="tcgp-live-choice-centre ${showCards?'has-card-rail':'board-instruction'}" aria-label="Card effect selection"><div class="tcgp-live-choice-head"><div><small>${esc((pending.kind||'CHOICE').replace(/([A-Z])/g,' $1').toUpperCase())}</small><b>${esc(prompt)}</b><span>${esc(note)}</span></div>${battleChoiceBoardFilter?'<button type="button" class="tcgp-live-choice-cancel" data-tcgp-action="clear-choice-filter">BACK</button>':''}</div>${showCards?`<div class="tcgp-live-choice-rail" role="group" aria-label="Available cards">${normal.map(({action,index})=>choiceCardTileHtml(action,index)).join('')||'<span>No valid cards.</span>'}</div>`:''}<div class="tcgp-live-choice-footer">${skip?`<button type="button" class="tcgp-live-choice-skip" data-tcgp-action="battle-action" data-action-index="${skip.index}">${pending.optional?'SKIP':'DONE'}</button>`:''}${showCards?`<button type="button" class="tcgp-live-choice-confirm" data-tcgp-action="confirm-choice-card" ${selected?'':'disabled'}>CONFIRM ${selected?'CARD':'SELECTION'}</button>`:''}</div></section>`;
  }
  function liveContextActionsOverlayHtml(){
    if(battleOverlay!=='context-actions')return'';
    const rows=battleContextActionIndices.map(index=>({index,action:battleActionCache[index]})).filter(({action})=>!!action);
    const boardRows=rows.filter(({action})=>action.type==='retreat'||action.type==='promote'||action.type==='trainer'&&action.target==='bench');
    const directTargets=boardTargetOnlyActions(currentBattle,battleActionCache,rows.map(row=>row.index));
    const boardOnly=directTargets||(boardRows.length===rows.length&&rows.length>0);
    // Board-target actions use a non-modal hint; the actual Pokémon is selected
    // in its original slot rather than through duplicate labels in a sheet.
    if(boardOnly)return `<div class="tcgp-live-board-target-hint" role="status"><span>${directTargets?'Tap the Pokémon you want to target on the board.':`Tap a highlighted Bench Pokémon to ${rows.some(r=>r.action.type==='retreat')?'RETREAT':'SELECT'}.`}</span><button type="button" data-tcgp-action="close-overlay">CANCEL</button></div>`;
    const buttons=rows.map(({index,action})=>{const copy=copiedAttackOption(action,currentBattle,'player'),id=copy?.source?.id||action.cardId||action.choiceCardId||(action.target==='bench'?core.benchSlotAt(currentBattle.sides.player,action.benchIndex)?.cardId:null),art=id?cardArtUrl(id,copy?.sourceSide||'player'):'';return `<button class="tcgp-live-context-card${copy?' is-copy-attack':''}" type="button" data-tcgp-action="battle-action" data-action-index="${index}">${art?`<img src="${esc(art)}" alt="">`:''}<span>${esc(actionLabel(action,currentBattle,'player'))}</span></button>`;}).join('');
    return `<div class="tcgp-live-context-centre" role="dialog" aria-label="Choose a play"><div class="tcgp-live-context-head"><b>Choose a play</b><button type="button" data-tcgp-action="close-overlay">×</button></div><div class="tcgp-live-context-rail">${buttons}</div></div>`;
  }
  function handActionIndices(handIndex){return battleActionCache.map((action,index)=>({action,index})).filter(({action})=>Number(action.handIndex)===Number(handIndex)&&['setupActive','setupBench','bench','evolve','trainer','attachSpecial'].includes(action.type)).map(({index})=>index);}
  function openHandActions(handIndex){
    if(!currentBattle?.sides?.player?.hand?.[handIndex]||battlePresentationBusy)return;
    battleHandIndex=Number(handIndex);battleInspect=null;battleOverlay='hand-actions';renderBattle();
  }
  function openHandPicker(){
    if(!currentBattle||battlePresentationBusy)return;
    battleInspect=null;battleOverlay='hand-picker';renderBattle();
  }
  function openEnergyActions(){
    if(!currentBattle||battlePresentationBusy)return;
    const options=actionIndicesFor(action=>action.type==='attach');
    if(!options.length){toast('This turn’s Energy has already been attached, or no legal Pokémon can receive it.');return;}
    if(options.length===1)return applyActionIndex(options[0]);
    battleContextActionIndices=options;battleInspect=null;battleOverlay='energy-actions';renderBattle();
  }
  function liveHandAndEnergyOverlayHtml(){
    if(battleOverlay==='hand-picker'){
      return `<div class="tcgp-live-board-target-hint"><span>Playable cards are raised in your hand. Tap one, or drag it onto your chosen Pokémon.</span><button type="button" data-tcgp-action="close-overlay">CANCEL</button></div>`;
    }
    if(battleOverlay==='energy-actions'){
      return `<div class="tcgp-live-board-target-hint"><span>Tap a highlighted Pokémon to attach this turn's Energy, or drag the Energy icon onto it.</span><button type="button" data-tcgp-action="close-overlay">CANCEL</button></div>`;
    }
    if(battleOverlay!=='hand-actions')return '';
    const ref=currentBattle?.sides?.player?.hand?.[battleHandIndex],card=data.cardById(ref?.cardId);if(!card)return '';
    const options=handActionIndices(battleHandIndex),art=cardArtUrl(card.id,'player');
    const restriction=card.kind==='trainer'&&card.trainerType!=='Supporter'?classicTrainerRestriction(currentBattle):'';
    return `<div class="tcgp-live-overlay"><button type="button" class="tcgp-live-overlay-scrim" data-tcgp-action="close-overlay"></button><section class="tcgp-live-sheet tcgp-live-action-sheet tcgp-live-hand-action-sheet"><div class="tcgp-live-sheet-head"><div><small>YOUR HAND</small><h3>${esc(card.name)}</h3></div><button type="button" class="tcgp-live-sheet-close" data-tcgp-action="close-overlay">×</button></div><div class="tcgp-live-sheet-card">${zoomArtworkButtonHtml(art,card.name)}<div><b>${esc(typeLabel(card))}</b><p class="tcgp-live-play-hint">Tap a legal action below to play this card. You can also drag it onto the board.</p></div></div><div class="tcgp-live-actions">${options.map(i=>`<button type="button" class="tcgp-battle-action" data-tcgp-action="battle-action" data-action-index="${i}">${esc(actionLabel(battleActionCache[i],currentBattle,'player'))}</button>`).join('')||`<p class="tcgp-live-play-hint">${esc(restriction||'No legal play for this card right now.')}</p>`}<button type="button" class="tcgp-battle-action secondary" data-tcgp-action="inspect-hand-card" data-index="${battleHandIndex}">READ CARD / ATTACK DETAILS</button></div></section>${cardZoomOverlayHtml(art,card.name)}</div>`;
  }
  function livePokemonActionsOverlayHtml(){
    if(battleOverlay!=='pokemon-actions'||!battlePokemonActionSpec)return'';
    const spec=battlePokemonActionSpec,info=resolveInspect(currentBattle,spec);if(!info?.slot||!info?.card)return'';
    const actions=livePokemonActionsHtml('player',info.zone,spec.index),zoneLabel=info.zone==='active'?'ACTIVE POKÉMON':`BENCH ${Number(spec.index||0)+1}`;
    const benchNote=info.zone==='bench'&&currentBattle?.phase==='battle'?liveBenchReadOnlyMovesHtml(info.card):'';
    const extraBoostHint=info.card.id==='ex15-90'&&currentBattle?.activeSide==='player'&&currentBattle?.phase==='battle'&&!(actions||'').includes('EXTRA BOOST')&&!(actions||'').includes('Extra Boost')
      ?(!currentBattle.sides.player.hand.some(ref=>data.cardById(ref.cardId)?.basicEnergy)
        ?'Extra Boost needs a physical Basic Energy card in your hand. Rainbow Energy, Double Colorless and the Energy Zone do not qualify.'
        :![currentBattle.sides.player.active,...currentBattle.sides.player.bench].filter(Boolean).some(slot=>{const c=data.cardById(slot.cardId);return c?.pokemonEx&&c.stage==='Stage 2';})
          ?'Extra Boost needs a Stage 2 Pokémon-ex on your board.'
          :'Extra Boost is unavailable: it may already have been used this turn, or Altaria is affected by a disabling condition.') :'';
    const yourTurn=currentBattle?.phase==='battle'&&currentBattle?.activeSide==='player'&&!cpuPending;
    const quickActions=yourTurn?`<div class="tcgp-live-quick-actions"><button type="button" class="tcgp-battle-action secondary" data-tcgp-action="open-hand-picker">PLAY FROM HAND</button><button type="button" class="tcgp-battle-action secondary" data-tcgp-action="open-energy-actions">ENERGY ZONE</button></div>`:'';
    return `<div class="tcgp-live-overlay"><button class="tcgp-live-overlay-scrim" type="button" data-tcgp-action="close-overlay" aria-label="Close Pokémon actions"></button><section class="tcgp-live-sheet tcgp-live-pokemon-action-sheet"><div class="tcgp-live-sheet-head"><div><small>${esc(zoneLabel)}</small><h3>${esc(info.card.name||info.slot.cardId)}</h3></div><button class="tcgp-live-sheet-close" type="button" data-tcgp-action="close-overlay">×</button></div>${benchNote}${extraBoostHint?`<p class="tcgp-live-bench-note" role="note">${esc(extraBoostHint)}</p>`:''}${currentBattle?.phase==='battle'&&currentBattle.activeSide!=='player'?'<p class="tcgp-live-bench-note">It is the CPU turn. You can inspect this Pokémon now, and act on your next turn.</p>':''}<div class="tcgp-live-pokemon-actions">${actions||(benchNote?'':'<p class="tcgp-battle-note">No battle action is available right now.</p>')}</div>${quickActions}<button type="button" class="tcgp-battle-action secondary tcgp-live-card-info-action" data-tcgp-action="inspect-pokemon-from-actions" data-side="player" data-zone="${esc(info.zone)}" data-index="${Number(spec.index||0)}">CARD INFO</button></section></div>`;
  }
  function liveDiscardOverlayHtml(){
    if(battleOverlay!=='discard'&&battleOverlay!=='energy-discard')return'';
    const side=currentBattle?.sides?.[battleDiscardSide],label=battleDiscardSide==='player'?'Your':'CPU',discards=side?.discard||[];
    const cardRefs=discards.map((ref,index)=>({ref,index})).filter(({ref})=>data.cardById(ref.cardId)?.kind!=='energy');
    const energyRefs=discards.map((ref,index)=>({ref,index})).filter(({ref})=>data.cardById(ref.cardId)?.kind==='energy');
    const basic=Object.entries(side?.energyDiscard||{}).filter(([,count])=>Number(count)>0),energyCount=basic.reduce((n,[,c])=>n+Number(c||0),0)+energyRefs.length;
    const cardsHtml=cardRefs.map(({ref,index})=>{const card=data.cardById(ref.cardId),art=cardArtUrl(ref.cardId,battleDiscardSide);return `<button type="button" class="tcgp-live-discard-card" ${inspectAttrs(battleDiscardSide,'discard',index)}>${art?`<img src="${esc(art)}" alt="${esc(card?.name||ref.cardId)}">`:''}<span>${esc(card?.name||ref.cardId)}</span></button>`;}).join('');
    const energyIcons=basic.map(([type,count])=>`<div class="tcgp-live-discard-energy-tile">${energyIconHtml(type,{className:'discard'})}<b>${esc(type)}</b><span>×${Number(count)}</span></div>`).join('');
    const energyCards=energyRefs.map(({ref,index})=>{const card=data.cardById(ref.cardId),art=cardArtUrl(ref.cardId,battleDiscardSide);return `<button type="button" class="tcgp-live-discard-card" ${inspectAttrs(battleDiscardSide,'discard',index)}>${art?`<img src="${esc(art)}" alt="${esc(card?.name||ref.cardId)}">`:''}<span>${esc(card?.name||ref.cardId)}</span></button>`;}).join('');
    const energyFirst=battleOverlay==='energy-discard';
    const cardSection=`<section class="tcgp-live-discard-section"><h4>Discarded cards · ${cardRefs.length}</h4><div class="tcgp-live-discard-grid">${cardsHtml||'<p class="tcgp-battle-note">No discarded cards.</p>'}</div></section>`;
    const energySection=`<section class="tcgp-live-discard-section" id="tcgp-energy-discard-section"><h4>Discarded Energy · ${energyCount}</h4><p class="tcgp-battle-note">Basic Energy lost from Pokémon is held separately here. Energy recovery cards search this pile; Special Energy keeps its printed card identity.</p><div class="tcgp-live-discard-energy-grid">${energyIcons}${energyCards||''}${!energyCount?'<p class="tcgp-battle-note">No discarded Energy.</p>':''}</div></section>`;
    return `<div class="tcgp-live-overlay"><button class="tcgp-live-overlay-scrim" type="button" data-tcgp-action="close-overlay" aria-label="Close discard pile"></button><section class="tcgp-live-sheet tcgp-live-discard-sheet"><div class="tcgp-live-sheet-head"><div><small>${label.toUpperCase()}</small><h3>Discard piles · ${cardRefs.length} cards / ${energyCount} Energy</h3></div><button class="tcgp-live-sheet-close" type="button" data-tcgp-action="close-overlay">×</button></div>${energyFirst?energySection+cardSection:cardSection+energySection}</section></div>`;
  }
  function liveEnergyArkChoiceOverlayHtml(){
    const pending=currentBattle?.pendingChoice;
    if(currentBattle?.phase!=='effectChoice'||currentBattle?.choiceSide!=='player'||pending?.effect?.rule!=='discovery:energyArk')return'';
    const options=battleActionCache.map((action,index)=>action?.type==='effectChoice'&&action.choiceOption!=null?`<button type="button" class="tcgp-battle-action tcgp-energy-choice-button" data-tcgp-action="battle-action" data-action-index="${index}">${energyIconHtml(action.choiceLabel,{className:'current'})} <span>${esc(action.choiceLabel)}</span></button>`:'').filter(Boolean).join('');
    return `<div class="tcgp-live-overlay tcgp-energy-ark-choice"><div class="tcgp-live-overlay-scrim"></div><section class="tcgp-live-sheet tcgp-live-action-sheet"><div class="tcgp-live-sheet-head"><div><small>ENERGY ARK</small><h3>${esc(pending.prompt||'Choose Energy from the supply')}</h3></div></div><div class="tcgp-live-actions">${options}</div></section></div>`;
  }
  function stadiumSlotModel(state,actions,side){
    const viewer=side||'player',stadium=state?.stadium||null,sideState=state?.sides?.[viewer]||{},actionIndex=(actions||[]).findIndex(action=>action?.type==='stadiumAction');
    if(!stadium)return {cardId:null,ownerSide:null,actionIndex:-1,status:'EMPTY',canActivate:false};
    const used=sideState.stadiumActionUsedTurn===state.turnNumber&&sideState.stadiumActionUsedUid===stadium.uid;
    return {cardId:stadium.cardId,ownerSide:stadium.ownerSide,actionIndex,status:actionIndex>=0?'ACTIVATE':used?'USED':'IN PLAY',canActivate:actionIndex>=0};
  }
  function liveStadiumSlotHtml(){
    const model=stadiumSlotModel(currentBattle,battleActionCache,'player');
    if(!model.cardId)return '';
    const card=data.cardById(model.cardId),art=cardArtUrl(model.cardId,model.ownerSide),used=model.status==='USED';
    return `<div class="tcgp-live-stadium-slot" data-stadium-slot="1"><button type="button" class="tcgp-live-stadium-card${used?' used':''}" ${inspectAttrs(model.ownerSide||'player','stadium',0)} aria-label="Inspect Stadium ${esc(card?.name||model.cardId)}">${art?`<img src="${esc(art)}" alt="${esc(card?.name||model.cardId)}">`:`<span>${esc(String(card?.name||model.cardId).slice(0,1))}</span>`}</button>${model.canActivate?`<button type="button" class="tcgp-live-stadium-activate" data-tcgp-action="battle-action" data-action-index="${model.actionIndex}">ACTIVATE</button>`:''}</div>`;
  }
  function liveMidControlsHtml(turnText,lastLog){
    if(currentBattle?.phase==='setup'){
      const readyIndex=battleActionCache.findIndex(action=>action.type==='setupReady');
      return `<div class="tcgp-live-mid-controls setup" data-card-play-zone="1"><span>SETUP</span><b>${currentBattle.sides.player.active?'ADD BENCH OR START':'CHOOSE ACTIVE'}</b><em>Drag a Basic here or directly onto the board.</em>${readyIndex>=0?`<button type="button" class="tcgp-live-end-turn" data-tcgp-action="battle-action" data-action-index="${readyIndex}">READY</button>`:''}</div>`;
    }
    if(currentBattle?.phase==='effectChoice'){
      if(battlePrizePresentationHeld&&currentBattle.pendingChoice?.special==='chooseClassicPrize')return '<div class="tcgp-live-mid-controls promote" role="status"><span>ATTACK</span><b>RESOLVING EFFECTS…</b><em>Coin flips and knockout results are being shown before Prize selection.</em></div>';
      const mine=currentBattle.choiceSide==='player';
      return `<div class="tcgp-live-mid-controls promote"><span>EFFECT</span><b>${mine?'SELECT A CARD':'CPU CHOOSING'}</b><em>${mine?'Tap a highlighted card or use the centre selector.':esc(currentBattle.pendingChoice?.prompt||'CPU is resolving the effect.')}</em>${!mine&&!cpuPending&&!battlePresentationBusy?'<button type="button" class="tcgp-live-end-turn" data-tcgp-action="resume-cpu">RESUME CPU</button>':''}</div>`;
    }
    if(currentBattle?.phase==='promote'){
      const mine=currentBattle.promotionSide==='player';
      return `<div class="tcgp-live-mid-controls promote"><span>KO</span><b>${mine?'CHOOSE NEW ACTIVE':'CPU CHOOSING ACTIVE'}</b><em>${mine?'Tap PROMOTE beneath the Bench Pokémon you want.':'Opponent must promote before play continues.'}</em>${!mine&&!cpuPending&&!battlePresentationBusy?'<button type="button" class="tcgp-live-end-turn" data-tcgp-action="resume-cpu">RESUME CPU</button>':''}</div>`;
    }
    const endIndex=battleActionCache.findIndex(action=>action.type==='endTurn');
    const resumeCpu=cpuOwnsNextAction()&&!cpuPending&&!battlePresentationBusy;
    return `<div class="tcgp-live-mid-controls" data-card-play-zone="1"><span>TURN ${currentBattle?.turnNumber||1}/${currentBattle?.format==='classic'?100:50}</span><b>${esc(turnText)}</b><em>${esc(lastLog)}</em>${endIndex>=0?`<button type="button" class="tcgp-live-end-turn" data-tcgp-action="battle-action" data-action-index="${endIndex}">END TURN</button>`:''}${resumeCpu?'<button type="button" class="tcgp-live-end-turn" data-tcgp-action="resume-cpu">RESUME CPU</button>':''}</div>`;
  }


  function renderBattle(){
    cancelGesture?.();
    if(!currentBattle)return renderHome();
    setBattleLive(true);setScreen('battle');
    const p=currentBattle.sides.player,o=currentBattle.sides.opponent;
    if(currentBattle.pendingChoice?.special==='chooseClassicPrize')battleOverlay=null;
    const playerCanAct=(currentBattle.phase==='setup'&&currentBattle.setupSide==='player')||(currentBattle.phase==='battle'&&currentBattle.activeSide==='player'&&!cpuPending)||(currentBattle.phase==='promote'&&currentBattle.promotionSide==='player'&&!cpuPending)||(currentBattle.phase==='effectChoice'&&currentBattle.choiceSide==='player'&&!cpuPending);
    battleActionCache=playerCanAct?core.legalActions(currentBattle,'player'):[];
    const turnText=currentBattle.phase==='setup'?'SET UP YOUR BOARD':currentBattle.phase==='effectChoice'?(currentBattle.choiceSide==='player'?'MAKE A CHOICE':'CPU CHOOSING'):currentBattle.phase==='promote'?(currentBattle.promotionSide==='player'?'CHOOSE NEW ACTIVE':'CPU CHOOSING ACTIVE'):currentBattle.activeSide==='player'?'YOUR TURN':cpuPending?'CPU PLAYING…':'CPU TURN';
    const lastLog=[...currentBattle.log].reverse().map(logText).find(Boolean)||(currentBattle.phase==='setup'?'Choose an Active Pokémon.':'Battle started');
    const handScroll=el('tcgpBattleContent')?.querySelector('.tcgp-live-hand')?.scrollLeft||0;
    const classic=currentBattle.format==='classic',scoreHtml=classic?`<span>CPU PRIZES <b>${Number(o.prizesTaken||0)}</b>/5</span><i>·</i><span>YOU <b>${Number(p.prizesTaken||0)}</b>/5</span>`:`<span>CPU <b>${o.points}</b>/3</span><i>·</i><span>YOU <b>${p.points}</b>/3</span>`;
    const florioPrizeReveal=classic?[['YOU',p],['CPU',o]].flatMap(([label,ss])=>(ss.prizes||[]).filter(ref=>ref.faceUp).map(ref=>`${label}: ${esc(data.cardById(ref.cardId)?.name||ref.cardId)}`)).join(' · '):'';
    const cpuMessageVisible=!!battleEvent&&battleEventSide==='opponent',cpuReporting=cpuMessageVisible&&(cpuPending||cpuOwnsNextAction());
    const narrowGym=classic&&currentBattle.stadium?.cardId==='gym1-124'&&currentBattle.pendingChoice?.special!=='narrowGymReturn';
    const lentalWide=classic&&[p,o].some(ss=>Number(ss.benchLimit||3)>3||(ss.bench||[]).length>3);
    setContent(`<section class="tcgp-live-arena ${classic?'format-classic':''}${narrowGym?' narrow-gym':''}${lentalWide?' lental-wide-bench':''}" aria-label="${classic?'Classic TCG':'TCG Pocket'} battlefield">
      <section class="tcgp-live-opponent-top" aria-label="Opponent hand and piles">${livePileHtml('opponent',o,'discard')}${liveOpponentHandHtml(o)}${livePileHtml('opponent',o,'deck')}</section>
      <section class="tcgp-live-opponent tcgp-live-mat-half" data-mat-side="opponent" ${playmatStyle('opponent')} aria-label="Opponent half">
        <div class="tcgp-live-opponent-bench" aria-label="Opponent Bench">${liveBenchHtml('opponent',o.bench)}</div>
        <div class="tcgp-live-opponent-active" aria-label="Opponent Active">${liveCardHtml(o.active,{side:'opponent',zone:'active'})}</div>${battleEventSide==='opponent'&&battleEventCardId?`<div class="tcgp-live-cpu-card-reveal" aria-label="CPU ${esc(battleEventKind||'card')} ${esc(cardName(battleEventCardId))}"><small>CPU ${esc((battleEventKind||'play').toUpperCase())}</small>${cardArtUrl(battleEventCardId,'opponent')?`<img src="${esc(cardArtUrl(battleEventCardId,'opponent'))}" alt="${esc(cardName(battleEventCardId))}">`:`<span>${esc(cardName(battleEventCardId))}</span>`}</div>`:''}
      </section>
      <section class="tcgp-live-mid ${cpuReporting?'is-reporting':''}" aria-label="Score, turn and play lane"><div class="tcgp-live-score${classic?' tcgp-classic-score':''}">${classic?`<div class="tcgp-classic-score-numbers">${scoreHtml}${livePrizePileHtml(p)}</div><small class="tcgp-classic-score-label">CPU · ${esc(currentClassicOpponent?.name||'Base Set')}${florioPrizeReveal?` · Face-up Prize: ${florioPrizeReveal}`:''}</small>`:scoreHtml}</div>${liveMidControlsHtml(turnText,lastLog)}${classicTrainerRestriction(currentBattle)?`<div class="tcgp-live-trainer-lock-notice" role="status">${esc(classicTrainerRestriction(currentBattle))}</div>`:''}${cpuMessageVisible?`<div class="tcgp-live-action-event is-cpu" role="status">${esc(battleEvent)}</div>`:battleEvent?`<div class="tcgp-live-action-event is-player" role="status">${esc(battleEvent)}</div>`:''}</section>
      <section class="tcgp-live-player tcgp-live-mat-half" data-mat-side="player" ${playmatStyle('player')} aria-label="Player half">
        <div class="tcgp-live-player-active" aria-label="Your Active" ${classic&&p.active&&!battleOverlay?'data-tcgp-action="open-pokemon-actions" data-side="player" data-zone="active" data-index="0"':''}>${liveCardHtml(p.active,{side:'player',zone:'active',showActions:false})}</div>${liveStadiumSlotHtml()}
        <div class="tcgp-live-player-bench" aria-label="Your Bench">${liveBenchHtml('player',p.bench)}</div>
      </section>
      <section class="tcgp-live-player-bottom" aria-label="Your hand and piles"><div class="tcgp-live-piles mine" aria-label="Your card piles">${livePileHtml('player',p,'discard')}${livePileHtml('player',p,'deck')}</div><div class="tcgp-live-hand" aria-label="Your hand · swipe for more cards">${livePlayerHandHtml(p)}</div>${liveEnergySourceHtml(p)}</section>
      ${liveEffectChoiceCenterHtml()}${liveInspectOverlayHtml()}${liveContextActionsOverlayHtml()}${liveHandAndEnergyOverlayHtml()}${livePokemonActionsOverlayHtml()}${liveDiscardOverlayHtml()}${livePrizeOverlayHtml()}${liveHandRevealOverlayHtml()}
    </section>`);
    layoutPlayerHand();const hand=el('tcgpBattleContent')?.querySelector('.tcgp-live-hand');if(hand)hand.scrollLeft=handScroll;
  }


  function finishBattle(){
    if(!currentBattle||currentBattle.phase!=='finished')return;
    if(currentClassic){if(!currentPractice)classicDecks.recordResult(root.state,currentBattle);resultInfo={classic:true,practice:currentPractice,firstClear:false,reward:{coins:0,dust:0}};}
    else if(currentPractice)resultInfo={practice:true,firstClear:false,reward:{coins:0,dust:0}};
    else resultInfo=progress.recordResult(root.state,currentBattle,currentChallenge);
    saveNow();renderResult();
  }
  function resultSummary(battle){
    const won=battle?.winner==='player',title=battle?.winner==='draw'?'DRAW':won?'VICTORY':'DEFEAT';
    const classic=battle?.format==='classic';
    if(title==='DRAW')return {title,message:classic&&battle?.reason==='turn-limit'?'The 100-turn Classic safety limit was reached with both trainers tied on Prize cards.':'Both sides reached a winning condition at the same time.'};
    if(battle?.reason==='deck-out')return {title,message:won?"The CPU couldn't draw a card at the start of its turn — its deck ran out.":"You couldn't draw a card at the start of your turn — your deck ran out. Your Bench may still have Pokémon, but deck exhaustion is a separate loss condition."};
    if(battle?.reason==='no-pokemon')return {title,message:won?'The CPU had no Pokémon left in play.':'You had no Active or Benched Pokémon left in play.'};
    if(battle?.reason==='prizes')return {title,message:won?'You claimed all 5 Prize cards.':'The CPU claimed all 5 Prize cards.'};
    if(battle?.reason==='turn-limit')return {title,message:classic?(won?'The 100-turn Classic safety limit was reached. You were ahead on Prize cards.':'The 100-turn Classic safety limit was reached. The CPU was ahead on Prize cards.'):'The 50-turn Solo limit expired.'};
    return {title,message:won?'You won the match.':'The CPU won the match.'};
  }
  function resultActionsModel(challenge,practice){return {canRematch:!(challenge?.randomPool===true),canHome:true,practice:!!practice};}
  function renderResult(){
    clearBattleEvent();finishBattlePresentation(false);
    setBattleLive(false);battleOverlay=null;battleInspect=null;setScreen('result');
    const won=currentBattle?.winner==='player',practice=!!resultInfo?.practice,classic=currentBattle?.format==='classic',reward=resultInfo?.reward||{coins:0,dust:0},stats=battleSummaryStats(currentBattle),coinText=stats.coinTotal?`${stats.coinHeads}H · ${stats.coinTails}T`:'—',bigHit=stats.biggestHit?`${stats.biggestHit}`:'—',bigHitDetail=stats.biggestHit?`${stats.biggestAttacker} · ${stats.biggestAttack}`:'No damaging attack recorded',resultActions=resultActionsModel(currentChallenge,practice),scoreLabel=classic?'PRIZES':'POINTS',rewardText=classic?(practice?'CLASSIC PRACTICE · NO REWARDS':'CLASSIC TCG · NO REWARDS'):(practice?'PRACTICE · NO REWARDS':won?(resultInfo.firstClear?`FIRST CLEAR · ◉ ${reward.coins} + ✦ ${reward.dust}`:'REPEAT CLEAR'):'NO REWARD');
    setContent(`<section class="tcgp-battle-result tcgp-battle-result-detailed ${classic?'format-classic':''}"><div class="eyebrow">${classic?'CLASSIC TCG':'SOLO BATTLE'} · SUMMARY</div><h2>${esc(resultSummary(currentBattle).title)}</h2><p>${esc(resultSummary(currentBattle).message)}</p>${classic&&currentClassicOpponent?`<p class="tcgp-classic-end-reason">CPU DECK · ${esc(currentClassicOpponent.name)}</p>`:''}${classic&&currentBattle?.reason?`<p class="tcgp-classic-end-reason">END CONDITION · ${esc(String(currentBattle.reason).replace(/-/g,' ').toUpperCase())}</p>`:''}<div class="tcgp-battle-stat-grid tcgp-battle-score-grid"><div class="tcgp-battle-stat"><small>YOU · ${scoreLabel}</small><b>${stats.playerPoints}${classic?'/5':''}</b></div><div class="tcgp-battle-stat"><small>CPU · ${scoreLabel}</small><b>${stats.opponentPoints}${classic?'/5':''}</b></div><div class="tcgp-battle-stat"><small>TURNS</small><b>${stats.turns}</b></div></div><div class="tcgp-battle-summary-grid"><div class="tcgp-battle-stat"><small>DAMAGE DEALT</small><b>${stats.damageDealt}</b></div><div class="tcgp-battle-stat"><small>DAMAGE TAKEN</small><b>${stats.damageTaken}</b></div><div class="tcgp-battle-stat"><small>BIGGEST HIT</small><b>${bigHit}</b></div><div class="tcgp-battle-stat"><small>KNOCKOUTS</small><b>${stats.knockouts}</b></div><div class="tcgp-battle-stat"><small>ATTACKS</small><b>${stats.attacksUsed}</b></div><div class="tcgp-battle-stat"><small>TRAINERS</small><b>${stats.trainersPlayed}</b></div><div class="tcgp-battle-stat"><small>ENERGY</small><b>${stats.energyAttached}</b></div><div class="tcgp-battle-stat"><small>COIN FLIPS</small><b>${esc(coinText)}</b></div></div><div class="tcgp-battle-highlight"><small>BIGGEST ATTACK</small><b>${esc(bigHitDetail)}</b></div><div class="tcgp-battle-reward">${rewardText}</div><div class="tcgp-battle-actions-row">${resultActions.canRematch?`<button class="tcgp-battle-action" data-tcgp-action="rematch">${classic&&!currentPractice?'NEW RANDOM MATCH':'REMATCH'}</button>`:''}<button class="tcgp-battle-action secondary" data-tcgp-action="home">BATTLE HOME</button></div></section>`);
  }

  let currentTestSetup=null;
  function startBattle(cards,practice,energyTypes,testSetup){
    clearBattleEvent();finishBattlePresentation(false);
    cancelGesture?.();clearTimeout(cpuTimer);cpuTimer=null;
    battleHandReveal=null;currentChallenge=solo.challengeById(sandboxMode?'random-'+selectedDifficulty.toLowerCase():selectedChallengeId)||solo.challengeById(CHALLENGE_ID);currentPractice=!!practice||sandboxMode;currentClassic=false;currentPlayerDeck=cards.slice();resultInfo=null;cpuPending=false;battleInspect=null;battleOverlay=null;battleEvent='';setBattleLive(true);
    currentPlayerEnergyTypes=Array.isArray(energyTypes)?energyTypes.slice():decks.analyzeDeck(cards).recommendedEnergyTypes;
    currentTestSetup=practice&&testSetup?testSetup:null;
    currentBattle=solo.createBattle({challengeId:currentChallenge.id,playerDeck:cards,playerDeckId:currentDeckAppearance?.id,playerDeckName:currentDeckAppearance?.name,seed:Date.now()>>>0,cpuRarityFocus:practice?0:pocketOpponentConfig().rarityFocus,cpuBasicOnly:practice?false:pocketOpponentConfig().basicOnly,cpuTheme:practice?'any':pocketOpponentConfig().theme,playerEnergyType:currentPlayerEnergyTypes[0],playerEnergyTypes:currentPlayerEnergyTypes,manualPlayerSetup:true,testMode:!!practice||sandboxMode,...(practice&&testSetup?{opponentDeck:testSetup.opponentCards,opponentEnergyTypes:testSetup.opponentEnergyTypes}:{})});
    renderBattle();maybeCpu();
  }
  function startClassicBattle(cards,practice){
    if(!practice&&!classicOpponentConfig().sets.length){toast('Choose at least one opponent expansion first.');return;}
    clearBattleEvent();finishBattlePresentation(false);battlePrizePresentationHeld=false;cancelGesture?.();clearTimeout(cpuTimer);cpuTimer=null;
    battleHandReveal=null;const playerCards=Array.isArray(cards)?cards.slice():[];
    // Real Classic matches rotate through all six CPU Energy types. Practice
    // retains the original fixed loaner for predictable testing.
    const preferences=classicOpponentConfig();
    const opponent=practice?null:classicOpponents.generate({seed:((Date.now()>>>0)^((Math.random()*0x100000000)>>>0))>>>0,excludeTypes:preferences.type==='random'?recentClassicOpponentTypes:[],sets:preferences.sets,rarityFocus:preferences.rarityFocus,basicOnly:preferences.basicOnly,theme:preferences.theme,includeColorless:true,type:preferences.type==='random'?null:preferences.type});
    if(!practice&&!opponent?.ok){toast(opponent?.error||'Could not generate a Classic opponent.');return renderClassicHome();}
    const opponentCards=practice?classicDecks.LOANER_DECK.slice():opponent.cards.slice();
    currentClassicOpponent=practice?{name:'Base Set loaner',type:'Fighting'}:opponent;
    currentChallenge={id:practice?'classic-base1-loaner':`classic-base1-${opponent.type.toLowerCase()}-${opponent.archetypeKey}`,name:practice?'Base Set Loaner Battle':`Random ${opponent.name}`,difficulty:preferences.difficulty,randomPool:false,format:'classic'};
    currentPractice=!!practice||sandboxMode;currentClassic=true;currentPlayerDeck=playerCards.slice();currentDeckAppearance=null;currentTestSetup=null;resultInfo=null;cpuPending=false;battleInspect=null;battleOverlay=null;battleEvent='';setBattleLive(true);
    currentPlayerEnergyTypes=classicDecks.analyzeDeck(playerCards).recommendedEnergyTypes;
    const opponentEnergyTypes=practice?classicDecks.analyzeDeck(opponentCards).recommendedEnergyTypes:opponent.energyTypes.slice();
    currentBattle=core.createBattle({format:'classic',playerDeck:playerCards,opponentDeck:opponentCards,seed:Date.now()>>>0,firstSide:Math.random()<.5?'player':'opponent',playerEnergyTypes:currentPlayerEnergyTypes,opponentEnergyTypes,manualPlayerSetup:true});
    currentBattle.classicOpponent={name:currentClassicOpponent.name,type:currentClassicOpponent.type,sets:opponent?.sets||['base1'],archetypeKey:opponent?.archetypeKey||null};
    if(!practice){recentClassicOpponentTypes.push(opponent.type);if(recentClassicOpponentTypes.length>=classicOpponents.TYPES.length)recentClassicOpponentTypes.length=0;}
    renderBattle();maybeCpu();
  }
  // Human-readable CPU actions in both formats: a short animation is not a
  // readable turn. Hold each meaningful action on screen before the next one,
  // while allowing longer animations to finish without an unnecessary pause.
  function cpuActionDwellMs(action,logs){
    const entries=Array.isArray(logs)?logs:[];
    if(entries.some(e=>e.type==='attack')||action?.type==='attack')return 2750;
    if(entries.some(e=>e.type==='ko'||e.type==='promote')||action?.type==='promote')return 2500;
    if(entries.some(e=>e.type==='coin'))return 2300;
    if(['trainer','ability','evolve','attachSpecial','retreat'].includes(action?.type))return 2450;
    if(['bench','setupBench','setupActive','attach'].includes(action?.type))return 2000;
    if(action?.type==='effectChoice')return 1800;
    return 1100; // end of turn, ready, and other routine transitions
  }
  const cpuRemainingDwellMs=(action,logs,elapsed)=>Math.max(0,cpuActionDwellMs(action,logs)-Math.max(0,Number(elapsed)||0));
  function cpuOwnsNextAction(){
    return !!currentBattle&&((currentBattle.phase==='battle'&&currentBattle.activeSide==='opponent')||(currentBattle.phase==='promote'&&currentBattle.promotionSide==='opponent')||(currentBattle.phase==='effectChoice'&&currentBattle.choiceSide==='opponent'));
  }
  function maybeCpu(){
    if(!cpuOwnsNextAction()||cpuPending||battlePresentationBusy)return;
    cpuActions=0;cpuPending=true;renderBattle();clearTimeout(cpuTimer);cpuTimer=setTimeout(cpuStep,480);
  }
  // A failed AI search must not maroon an otherwise legal match on CPU TURN.
  // The fallback only uses actions legal in the *actual* position; the search
  // engine remains responsible for all legality checks and card effects.
  function cpuSafeAction(){
    const legal=core.legalActions(currentBattle,'opponent');
    if(!legal.length)return null;
    if(currentBattle.phase==='battle')return legal.find(a=>a.type==='endTurn')||legal[0];
    if(currentBattle.phase==='effectChoice')return legal.find(a=>a.choiceSkip===true&&currentBattle.pendingChoice?.optional===true)||legal[0];
    return legal[0];
  }
  function cpuStep(){
    if(!currentBattle||!cpuOwnsNextAction()){cpuPending=false;renderBattle();return;}
    let chosen=null,anchors=null,before=currentBattle.log.length;const started=Date.now();
    try{chosen=ai.chooseAction(currentBattle,'opponent',currentChallenge?.difficulty||'Beginner',cpuActions);}
    catch(error){
      console.warn('[TCGP Battle] CPU search failed; using legal fallback',error);
      try{chosen=ai.chooseAction(currentBattle,'opponent','Beginner',99);}catch(_){chosen=null;}
    }
    if(!chosen){
      try{chosen=cpuSafeAction();}catch(error){console.error('[TCGP Battle] no recovery action',error);}
    }
    if(!chosen){cpuPending=false;setBattleEvent('CPU cannot select an action · tap Resume CPU');renderBattle();return;}
    // Restore the state if executing a chosen action unexpectedly throws, then
    // end the turn or resolve the mandatory effect choice. Do not repeat an
    // errored Trainer until a new CPU decision is made.
    const snapshot=JSON.parse(JSON.stringify(currentBattle));
    try{anchors=capturePresentationAnchors(chosen,'opponent');}catch(error){console.warn('[TCGP Battle] CPU animation unavailable',error);}
    try{core.applyAction(currentBattle,'opponent',chosen);}
    catch(error){
      console.error('[TCGP Battle] CPU action failed; recovering',error);
      Object.keys(currentBattle).forEach(key=>delete currentBattle[key]);Object.assign(currentBattle,snapshot);
      try{chosen=cpuSafeAction();if(!chosen)throw new Error('No legal fallback');try{anchors=capturePresentationAnchors(chosen,'opponent');}catch(_){anchors=null;}core.applyAction(currentBattle,'opponent',chosen);}
      catch(recoveryError){console.error('[TCGP Battle] recovery failed',recoveryError);cpuPending=false;setBattleEvent('CPU action failed · tap Resume CPU');renderBattle();return;}
    }
    cpuActions+=1;const added=currentBattle.log.slice(before);setBattleEvent(eventForAction(chosen,'opponent',before),'opponent',chosen,added);
    const finished=currentBattle?.phase==='finished',again=!finished&&cpuOwnsNextAction();cpuPending=again;battlePrizePresentationHeld=shouldHoldPrizePresentation(currentBattle,added);renderBattle();
    const continueCpu=()=>{
      releasePrizePresentation();
      if(currentBattle?.phase==='finished'){cpuPending=false;finishBattle();return;}
      if(again){clearTimeout(cpuTimer);cpuTimer=setTimeout(cpuStep,cpuRemainingDwellMs(chosen,added,Date.now()-started));}
    };
    try{playBattlePresentation(chosen,'opponent',anchors,added,continueCpu);}
    catch(error){console.warn('[TCGP Battle] CPU presentation failed; continuing turn',error);finishBattlePresentation(false);continueCpu();}
  }

  function open(){
    const home=el('packHome'),stage=el('packStage'),view=el('tcgpBattleView');if(!view)return;
    if(home)home.hidden=true;if(stage)stage.hidden=true;view.hidden=false;renderHome();
    const state=battleSave();if(!state.helpSeen){state.helpSeen=true;saveNow();showHelp();}
  }
  function openSubstituteLab(){
    const lab=root?.LuckyDexSubstituteLab;
    if(!lab)return toast('Substitute Test Lab is not installed.');
    clearTimeout(cpuTimer);cpuTimer=null;cpuPending=false;currentBattle=null;currentClassic=false;
    finishBattlePresentation(false);setBattleLive(true);setScreen('substitute-lab');
    try{lab.open({container:el('tcgpBattleContent'),art:cardArtUrl,onBack:()=>renderHome(true)});}
    catch(error){console.error('[LuckyDex Test Lab] failed',error);toast(error.message||'Could not open lab');renderHome(true);}
  }
  function requestLeave(callback){if(screen==='builder'&&root?.LuckyDexTCGPDeckEditor?.requestLeave)return root.LuckyDexTCGPDeckEditor.requestLeave(callback);if(screen==='classic-builder'&&root?.LuckyDexClassicTCGDeckEditor?.requestLeave)return root.LuckyDexClassicTCGDeckEditor.requestLeave(callback);callback();return true;}
  function close(force){root?.LuckyDexSubstituteLab?.close?.();if(force!==true&&(screen==='builder'||screen==='classic-builder'))return requestLeave(()=>close(true));clearBattleEvent();finishBattlePresentation(false);battlePrizePresentationHeld=false;cancelGesture?.();clearTimeout(cpuTimer);cpuTimer=null;cpuPending=false;currentBattle=null;currentClassic=false;battleHandReveal=null;const view=el('tcgpBattleView'),home=el('packHome');if(view)view.hidden=true;if(home)home.hidden=false;battleInspect=null;battleOverlay=null;setBattleLive(false);sandboxMode=false;setScreen('home');}
  function showHelp(){const help=el('tcgpBattleHelp');if(help)help.hidden=false;}
  function hideHelp(){const help=el('tcgpBattleHelp');if(help)help.hidden=true;}
  function back(){
    if(screen==='substitute-lab'){if(root?.LuckyDexSubstituteLab?.handleBack?.())return true;root?.LuckyDexSubstituteLab?.close?.();renderHome(true);return true;}
    if(screen==='battle'&&battleOverlay){if(battleOverlay==='hand-reveal')battleHandReveal=null;battleOverlay=null;renderBattle();return true;}
    if(screen==='builder')return requestLeave(()=>renderHome(true));
    if(screen==='classic-builder')return requestLeave(()=>renderHome(true));
    if(screen==='home'){close();return true;}
    if(screen==='battle'&&['setup','battle','promote'].includes(currentBattle?.phase)){
      if(root&&typeof root.confirm==='function'&&!root.confirm('Leave this battle? The current match will be abandoned.'))return;
      clearTimeout(cpuTimer);currentBattle=null;cpuPending=false;battleInspect=null;battleOverlay=null;
    }
    renderHome();return true;
  }

  function startOwned(){const deck=activeDeck();if(!deck){toast('Build and save a legal owned deck first.');return;}currentDeckAppearance={...deck,preferredPrints:{...deck.preferredPrints},_ownedRows:ownedRows()};startBattle(deck.cards,false,decks.deckEnergyTypes(deck));}
  function startClassicOwned(){const deck=classicActiveDeck();if(!deck){toast('Build and save a battle-ready 30-card Classic deck first.');return;}startClassicBattle(deck.cards,false);}
  function openBuilder(prefill){
    setBattleLive(false);setScreen('builder');
    root.document.body.classList.add('tcgp-deck-editing');
    root.LuckyDexTCGPDeckEditor.open({container:el('tcgpBattleContent'),state:workingState,owned:ownedRows,sandbox:sandboxMode,art:cardArtUrl,rules:cardRulesHtml,save:saveNow,battle:startOwned,playTest:r=>{if(r.ready)startBattle(r.cards,true,r.energyTypes,r);},quick:prefill==='quick'});
  }
  function openClassicBuilder(prefill){
    setBattleLive(false);setScreen('classic-builder');
    root.document.body.classList.add('tcgp-deck-editing');
    root.LuckyDexClassicTCGDeckEditor.open({container:el('tcgpBattleContent'),state:workingState,owned:classicOwnedRows,sandbox:sandboxMode,art:cardArtUrl,rules:cardRulesHtml,save:saveNow,battle:startClassicOwned,quick:prefill==='quick'});
  }

  function contentClick(event){
    const setButton=event.target.closest?.('.tcgp-classic-match-settings .tcg-set-selector button');
    if(setButton){const cfg=classicDecks.ensureState(workingState()),current=classicOpponentConfig();const choice=setButton.dataset.setChoice,bulk=setButton.dataset.setBulk;
      if(choice&&CLASSIC_SETS.includes(choice)){const chosen=new Set(current.sets);if(chosen.has(choice))chosen.delete(choice);else chosen.add(choice);cfg.opponentSets=CLASSIC_SETS.filter(id=>chosen.has(id));}
      else if(bulk){const chosen=new Set(current.sets);cfg.opponentSets=bulk==='all'?CLASSIC_SETS.slice():bulk==='none'?[]:CLASSIC_SETS.filter(id=>!chosen.has(id));}
      else if(setButton.hasAttribute('data-set-selected-only'))opponentSetUI.selectedOnly=!opponentSetUI.selectedOnly;
      else return;
      recentClassicOpponentTypes.length=0;saveNow();refreshOpponentControls();return;
    }
    const btn=event.target.closest?.('[data-tcgp-action]');if(!btn)return;const action=btn.dataset.tcgpAction;
    if(Date.now()<handDragSuppressUntil&&(btn.closest?.('[data-tcgp-hand-drag]')||btn.closest?.('[data-tcgp-energy-source]')))return;
    if(action==='zoom-card'){
      const layer=btn.closest('.tcgp-live-overlay')?.querySelector('.tcgp-live-card-zoom');
      if(layer){layer.hidden=false;layer.querySelector('.tcgp-live-card-zoom-close')?.focus();}
      return;
    }
    if(action==='close-card-zoom'){
      const layer=btn.closest('.tcgp-live-card-zoom');
      if(layer){layer.hidden=true;layer.closest('.tcgp-live-overlay')?.querySelector('.tcgp-live-card-art-zoom-trigger')?.focus();}
      return;
    }
    if(action==='select-choice-card'){
      const index=Number(btn.dataset.actionIndex);
      if(!battleActionCache[index]||currentBattle?.phase!=='effectChoice'||currentBattle.choiceSide!=='player')return;
      battleChoiceSelectionIndex=index;
      const centre=btn.closest('.tcgp-live-choice-centre');centre?.querySelectorAll('[data-action-index].tcgp-live-choice-card').forEach(tile=>{const selected=Number(tile.dataset.actionIndex)===index;tile.classList.toggle('selected',selected);tile.setAttribute('aria-pressed',String(selected));});
      const confirm=centre?.querySelector('[data-tcgp-action="confirm-choice-card"]');if(confirm){confirm.disabled=false;confirm.textContent='CONFIRM CARD';}
      return;
    }
    if(action==='confirm-choice-card'){
      if(battleChoiceSelectionIndex>=0)return applyActionIndex(battleChoiceSelectionIndex);
      return;
    }
    if(action==='clear-choice-filter'){battleChoiceBoardFilter=null;battleChoiceSelectionIndex=-1;return renderBattle();}
    if(action==='choose-hand-card'){
      const options=handChoiceActionIndices(Number(btn.dataset.index));
      if(options.length===1)return applyActionIndex(options[0]);
      if(options.length){battleChoiceSelectionIndex=options[0];return renderBattle();}
      return;
    }
    if(action==='choose-board-card'){
      const side=btn.dataset.side,zone=btn.dataset.zone,index=Number(btn.dataset.index||0);
      const context=contextualBoardActions(battleActionCache,side,zone,index);
      const options=context.length?context:choiceBoardActions(currentBattle,battleActionCache,side,zone,index);
      if(options.length===1)return applyActionIndex(options[0]);
      if(options.length){battleChoiceBoardFilter={side,zone,index};battleChoiceSelectionIndex=-1;return renderBattle();}
      return;
    }
    if(action==='skip-presentation')return finishBattlePresentation(true);
    if(action==='resume-cpu')return maybeCpu();
    if(battlePresentationBusy){
      // A player should never lose the ability to inspect/select their Active
      // Pokémon because an animation layer is still on screen. Finish safely
      // and let the original click perform its intended inspection.
      if(['open-pokemon-actions','inspect-card','inspect-pokemon-from-actions','open-hand-actions','open-hand-picker','open-energy-actions','open-discard'].includes(action))finishBattlePresentation(true);
      else return;
    }
    if(action==='explain-unavailable')return toast(btn.dataset.reason||'This action is currently unavailable.');
    if(action==='open-hand-actions')return openHandActions(Number(btn.dataset.index));
    if(action==='open-hand-picker')return openHandPicker();
    if(action==='open-energy-actions')return openEnergyActions();
    if(action==='inspect-hand-card'){battleInspect=buildInspectSpec('player','hand',Number(btn.dataset.index));battleOverlay='inspect';return renderBattle();}
    if(action==='format-pocket'){battleFormat='pocket';classicDraft=null;return renderHome(true);}
    if(action==='format-classic'){battleFormat='classic';return renderHome(true);}
    if(['classic-opponent-type','classic-opponent-difficulty','classic-opponent-rarity','classic-opponent-basic','classic-opponent-theme'].includes(action)){
      const cfg=classicDecks.ensureState(workingState()),current=classicOpponentConfig(),id=btn.dataset.id;
      if(action==='classic-opponent-type'&&CLASSIC_TYPES.includes(id))cfg.opponentType=id;
      else if(action==='classic-opponent-difficulty'&&AI_LEVELS.includes(id))cfg.opponentDifficulty=id;
      else if(action==='classic-opponent-rarity'&&['any','common','uncommon','rare','ultra'].includes(id))cfg.opponentRarityFocus=id;
      else if(action==='classic-opponent-basic')cfg.opponentBasicOnly=!current.basicOnly;
      else if(action==='classic-opponent-theme'&&decks.THEMES.some(t=>t.id===id))cfg.opponentTheme=id;
      else return;
      recentClassicOpponentTypes.length=0;saveNow();refreshOpponentControls();return;
    }
    if(action==='open-opponent-filters'){
      const selector=battleFormat==='classic'?'.tcgp-classic-match-settings':'.tcgp-pocket-opponent-filters';
      const panel=el('tcgpBattleContent')?.querySelector(selector);
      if(panel?.tagName==='DETAILS')panel.open=true;
      panel?.scrollIntoView?.({behavior:'smooth',block:'start'});
      return;
    }
    if(action==='classic-build')return openClassicBuilder();
    if(action==='classic-quick')return openClassicBuilder('quick');
    if(action==='classic-add'||action==='classic-remove'){
      if(!classicDraft)return renderClassicBuilder();const changed=classicDecks.edit(classicDraft.cards,btn.dataset.id,action==='classic-add'?1:-1,classicOwnedRows());if(!changed.ok){toast(changed.error||'That card cannot be added.');return;}classicDraft.cards=changed.cards;return renderClassicBuilder();
    }
    if(action==='classic-clear'){if(classicDraft)classicDraft.cards=[];return renderClassicBuilder();}
    if(action==='classic-save'){
      if(!classicDraft)return renderClassicBuilder();const name=el('classicDeckName')?.value;if(name!=null)classicDraft.name=name;const saved=classicDecks.saveDraft(workingState(),classicDraft,classicOwnedRows());if(!saved.ok){toast(saved.errors?.[0]||'Classic deck could not be saved.');return;}classicDraft={...saved.deck,cards:saved.deck.cards.slice(),energyTypes:(saved.deck.energyTypes||[]).slice()};saveNow();toast(saved.readiness.ok?'Classic deck saved and battle-ready.':'Classic deck draft saved.');return renderClassicBuilder();
    }
    if(action==='classic-battle')return startClassicOwned();
    if(action==='classic-practice')return startClassicBattle(classicDecks.LOANER_DECK.slice(),true);
    if(action==='substitute-lab'||action==='open-sandbox'){if(!sandboxMode)enterSandbox();classicDraft=null;recentClassicOpponentTypes.length=0;return renderHome(true);}
    if(action==='exit-sandbox'){sandboxMode=false;classicDraft=null;currentDeckAppearance=null;return renderHome(true);}
    if(action==='classic-inspect'){
      const row=classicOwnedRows().find(item=>item.gameplayId===btn.dataset.id),owned=row?.variants?.[0]?.row;if(owned&&typeof root?.openCardModal==='function')return root.openCardModal(owned);const card=data.cardById(btn.dataset.id);return toast(card?`${card.name} · ${card.support?.status||'Battle ready'}`:'Base Set card');
    }
    if(action==='pocket-opponent-rarity'||action==='pocket-opponent-basic'||action==='pocket-opponent-theme'){
      const cfg=battleSave();if(action==='pocket-opponent-theme'&&decks.THEMES.some(t=>t.id===btn.dataset.id))cfg.opponentTheme=btn.dataset.id;else if(action==='pocket-opponent-basic')cfg.opponentBasicOnly=!pocketOpponentConfig().basicOnly;
      else if(decks.FOCUS_RARITIES.some(r=>r.rank===Number(btn.dataset.id)))cfg.opponentRarityFocus=Number(btn.dataset.id);
      saveNow();return renderHome();
    }
    if(action==='solo-difficulty'){selectedDifficulty=btn.dataset.difficulty;return renderHome();}
    if(action==='select-challenge'){const c=solo.challengeById(btn.dataset.challengeId);if(c&&solo.isUnlocked?.(c,root.state)!==false){selectedChallengeId=c.id;selectedDifficulty=c.difficulty;}return renderHome();}
    if(action==='build')return openBuilder();
    if(action==='quick')return openBuilder('quick');
    if(action==='battle-owned')return startOwned();
    if(action==='practice'){currentDeckAppearance=null;return startBattle(decks.LOANER_PLAYER_DECK,true);}
    if(action==='home')return renderHome();
    if(action==='rematch'){if(currentClassic)return startClassicBattle(currentPlayerDeck,currentPractice&&!sandboxMode);if(currentChallenge?.randomPool)return renderHome();return startBattle(currentPlayerDeck,currentPractice,currentPlayerEnergyTypes,currentTestSetup);}
    if(action==='inspect-card'){
      battlePokemonActionSpec=null;battleInspect=buildInspectSpec(btn.dataset.side,btn.dataset.zone,btn.dataset.index,btn.dataset.toolIndex);battleOverlay='inspect';
      return renderBattle();
    }
    if(action==='open-pokemon-actions'){
      battlePokemonActionSpec=buildInspectSpec('player',btn.dataset.zone,btn.dataset.index);battleInspect=null;battleOverlay='pokemon-actions';
      return renderBattle();
    }
    if(action==='inspect-pokemon-from-actions'){
      battleInspect=buildInspectSpec('player',btn.dataset.zone,btn.dataset.index);battlePokemonActionSpec=null;battleOverlay='inspect';
      return renderBattle();
    }
    if(action==='open-context-actions'){
      battleContextActionIndices=String(btn.dataset.actionIndices||'').split(',').map(Number).filter(index=>Number.isInteger(index)&&battleActionCache[index]);
      battleOverlay='context-actions';battleInspect=null;return renderBattle();
    }
    if(action==='open-prizes'&&currentBattle?.format==='classic'){battleOverlay='prizes';battleInspect=null;return renderBattle();}
    if(action==='open-discard'){
      battleDiscardSide=btn.dataset.side==='opponent'?'opponent':'player';battleOverlay='discard';battleInspect=null;return renderBattle();
    }
    if(action==='open-actions'){battleOverlay='context-actions';battleContextActionIndices=battleActionCache.map((_,index)=>index);battleInspect=null;return renderBattle();}
    if(action==='close-hand-reveal'){battleHandReveal=null;battleOverlay=null;return renderBattle();}
    if(action==='close-overlay'){battleOverlay=null;battleInspect=null;battleContextActionIndices=[];battlePokemonActionSpec=null;return renderBattle();}
    if(action==='battle-action'){
      if(!currentBattle)return;
      const canAct=currentBattle.phase==='setup'?currentBattle.setupSide==='player':currentBattle.phase==='promote'?currentBattle.promotionSide==='player':currentBattle.phase==='effectChoice'?currentBattle.choiceSide==='player':currentBattle.activeSide==='player';
      if(!canAct)return;
      return applyActionIndex(Number(btn.dataset.actionIndex));
    }
  }

  function contentInput(event){
    if(event.target?.matches?.('.tcgp-classic-match-settings [data-set-search]')){
      opponentSetUI.search=event.target.value;refreshOpponentControls();return;
    }

    if(event.target?.id==='classicDeckName'){if(classicDraft)classicDraft.name=event.target.value;return;}
    if(event.target?.id==='classicDeckSearch'){
      classicSearch=event.target.value||'';const caret=classicSearch.length;renderClassicBuilder();const search=el('classicDeckSearch');search?.focus();try{search?.setSelectionRange(caret,caret);}catch(_){}return;
    }
  }

  function applyActionIndex(actionIndex){
    const chosen=battleActionCache[Number(actionIndex)];if(!chosen||battlePresentationBusy)return false;
    battleOverlay=null;battleInspect=null;battleContextActionIndices=[];battlePokemonActionSpec=null;battleChoiceSelectionIndex=-1;battleChoiceBoardFilter=null;
    const anchors=capturePresentationAnchors(chosen,'player'),before=currentBattle.log.length;
    try{core.applyAction(currentBattle,'player',chosen);}catch(error){console.error('[TCGP Battle] action error',error);toast(error.message||'That play is not legal.');return false;}
    const added=currentBattle.log.slice(before);battlePrizePresentationHeld=shouldHoldPrizePresentation(currentBattle,added);setBattleEvent(eventForAction(chosen,'player',before));renderBattle();
    const reveal=tellRevealFromLogs(added);
    const done=()=>{releasePrizePresentation();if(reveal){battleHandReveal=reveal;battleOverlay='hand-reveal';renderBattle();return;}if(currentBattle?.phase==='finished')finishBattle();else maybeCpu();};
    try{playBattlePresentation(chosen,'player',anchors,added,done);}
    catch(error){console.warn('[TCGP Battle] player presentation failed; showing result and Prize choice',error);finishBattlePresentation(false);done();}
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
    if(!action||battlePresentationBusy)return false;
    const anchors=capturePresentationAnchors(action,'player'),before=currentBattle.log.length;
    try{core.applyAction(currentBattle,'player',action);}catch(error){console.error('[TCGP Battle] card drop error',error);toast(error.message||'That card cannot be placed there.');return false;}
    const added=currentBattle.log.slice(before);setBattleEvent(eventForAction(action,'player',before));renderBattle();
    playBattlePresentation(action,'player',anchors,added,()=>{if(currentBattle?.phase==='finished')finishBattle();else maybeCpu();});
    return true;
  }
  function clearHandDragFeedback(){
    const content=el('tcgpBattleContent');if(!content)return;
    content.querySelectorAll('[data-tcgp-drop-state]').forEach(node=>node.removeAttribute('data-tcgp-drop-state'));
  }
  function setHandDragFeedback(handIndex){
    const content=el('tcgpBattleContent');if(!content)return;
    const blocked=cpuPending;
    content.querySelectorAll('[data-card-play-zone="1"]').forEach(node=>{const canPlay=!blocked&&centerHandActionIndices(battleActionCache,handIndex).length>0;node.setAttribute('data-tcgp-drop-state',canPlay?'valid':'invalid');});
    content.querySelectorAll('[data-card-drop-zone="1"]').forEach(node=>{
      const valid=!blocked&&directHandDropActionIndex(battleActionCache,currentBattle,handIndex,node.dataset.cardZone,Number(node.dataset.cardIndex||0))>=0;
      node.setAttribute('data-tcgp-drop-state',valid?'valid':'invalid');
    });
  }

  function handDropErrorMessage(handIndex){
    const card=data.cardById(currentBattle?.sides?.player?.hand?.[Number(handIndex)]?.cardId);
    if(currentBattle?.format==='classic'&&currentBattle?.stadium?.cardId==='gym1-124'&&card?.kind==='pokemon'&&card?.stage==='Basic'&&currentBattle?.sides?.player?.bench?.filter(Boolean).length>=2){
      return 'Narrow Gym limits your Bench to two Pokémon. Replace the Stadium or free a Bench space.';
    }
    return currentBattle?.phase==='setup'?'Drag a Basic Pokémon onto Active or Bench.':'Drop that card onto a legal Pokémon slot.';
  }
  // Keep the visual preview centred on the *actual* touch/pointer location.
  // A large upward offset makes a dragged card appear above another Bench slot,
  // while the release hit-test still uses the finger position.
  function dragPreviewTransform(pointerX,pointerY,previewWidth,previewHeight){
    const x=Number(pointerX)||0,y=Number(pointerY)||0;
    const w=Math.max(0,Number(previewWidth)||0),h=Math.max(0,Number(previewHeight)||0);
    return `translate(${Math.round(x-w/2)}px,${Math.round(y-h/2)}px)`;
  }
  function handPointerDown(event){
    const source=event.target.closest?.('[data-tcgp-hand-drag]');
    if(!source||battlePresentationBusy||!root?.document||event.isPrimary===false)return;
    const handIndex=Number(source.dataset.tcgpHandDrag);if(!Number.isInteger(handIndex))return;
    cancelGesture?.();event.preventDefault();
    const captured=currentBattle,ref=captured?.sides?.player?.hand?.[handIndex],art=ref?cardArtUrl(ref.cardId,'player'):'',originWrap=source.closest('.tcgp-live-hand-wrap');
    const host=source.closest('.tcgp-live-hand'),scrollStart=host?.scrollLeft||0,sx=event.clientX,sy=event.clientY;
    let ghost=null,moved=false,mode=event.pointerType==='touch'&&host?.scrollWidth>host?.clientWidth?'pending':'drag';
    function makeGhost(){
      ghost=root.document.createElement('div');ghost.className='tcgp-live-hand-drag';
      ghost.textContent=cardName(ref?.cardId);
      if(art){const img=root.document.createElement('img');img.src=art;img.alt='';img.onerror=()=>img.remove();ghost.appendChild(img);}
      originWrap?.classList.add('tcgp-drag-origin');setHandDragFeedback(handIndex);
      root.document.body.appendChild(ghost);root.document.body.classList.add('tcgp-card-dragging');
    }
    function move(e){
      const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>6)moved=true;
      if(mode==='pending'&&moved)mode=Math.abs(dx)>Math.abs(dy)*1.2?'scroll':'drag';
      if(mode==='scroll'){host.scrollLeft=scrollStart-dx;return;}
      if(mode==='drag'&&moved){if(!ghost)makeGhost();ghost.style.transform=dragPreviewTransform(e.clientX,e.clientY,ghost.offsetWidth||76,ghost.offsetHeight||106);}
    }
    function cleanup(){root.document.removeEventListener('pointermove',move,true);root.document.removeEventListener('pointerup',end,true);root.document.removeEventListener('pointercancel',cancel,true);root.document.body.classList.remove('tcgp-card-dragging');originWrap?.classList.remove('tcgp-drag-origin');clearHandDragFeedback();ghost?.remove();if(cancelGesture===cancel)cancelGesture=null;}
    function end(e){
      const point=moved&&mode==='drag'?root.document.elementFromPoint?.(e.clientX,e.clientY):null,target=point?.closest?.('[data-card-drop-zone="1"],[data-card-play-zone="1"]');
      cleanup();handDragSuppressUntil=Date.now()+350;if(mode==='scroll'||captured!==currentBattle)return;
      if(!moved){openHandActions(handIndex);return;}
      if(target){const done=target.hasAttribute('data-card-play-zone')?applyHandCenterDrop(handIndex):applyHandDrop(handIndex,target.dataset.cardZone,Number(target.dataset.cardIndex||0));if(!done)toast(handDropErrorMessage(handIndex));return;}
      toast(handDropErrorMessage(handIndex));
    }
    function cancel(){cleanup();handDragSuppressUntil=Date.now()+250;}
    cancelGesture=cancel;move(event);
    try{source.setPointerCapture?.(event.pointerId);}catch(_){}
    root.document.addEventListener('pointermove',move,true);root.document.addEventListener('pointerup',end,true);root.document.addEventListener('pointercancel',cancel,true);
  }

  function applyEnergyDrop(zone,index){
    if(!currentBattle||currentBattle.activeSide!=='player'||cpuPending)return false;
    const action=battleActionCache.find(item=>item.type==='attach'&&item.target===zone&&(zone!=='bench'||Number(item.benchIndex)===Number(index||0)));
    if(!action||battlePresentationBusy)return false;
    const anchors=capturePresentationAnchors(action,'player'),before=currentBattle.log.length;
    try{core.applyAction(currentBattle,'player',action);}catch(error){console.error('[TCGP Battle] energy drop error',error);toast(error.message||'That Energy attachment is not legal.');return false;}
    const added=currentBattle.log.slice(before);setBattleEvent(eventForAction(action,'player',before));renderBattle();
    playBattlePresentation(action,'player',anchors,added,()=>{if(currentBattle?.phase==='finished')finishBattle();else maybeCpu();});
    return true;
  }
  function energyPointerDown(event){
    const source=event.target.closest?.('[data-tcgp-energy-source="1"]');
    if(!source||battlePresentationBusy||source.disabled||!root?.document||event.isPrimary===false)return;
    cancelGesture?.();event.preventDefault();const captured=currentBattle;
    const sx=event.clientX,sy=event.clientY;let ghost=null,moved=false;
    function move(e){
      if(Math.hypot(e.clientX-sx,e.clientY-sy)>7)moved=true;
      if(!moved)return;
      if(!ghost){ghost=root.document.createElement('div');ghost.className='tcgp-live-energy-drag';ghost.innerHTML=source.querySelector('.tcgp-energy-icon')?.outerHTML||energyIconHtml(source.dataset.energy||'Grass');root.document.body.appendChild(ghost);}
      ghost.style.transform=dragPreviewTransform(e.clientX,e.clientY,ghost.offsetWidth||42,ghost.offsetHeight||42);
    }
    function cleanup(){root.document.removeEventListener('pointermove',move,true);root.document.removeEventListener('pointerup',end,true);root.document.removeEventListener('pointercancel',cancel,true);ghost?.remove();if(cancelGesture===cancel)cancelGesture=null;}
    function end(e){
      const target=moved?root.document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.('[data-energy-target="1"]'):null;cleanup();
      if(captured!==currentBattle)return;if(!moved){handDragSuppressUntil=Date.now()+300;openEnergyActions();return;}
      if(!target){toast('Drag Energy onto one of your Pokémon, or tap it to choose.');return;}
      applyEnergyDrop(target.dataset.energyZone,Number(target.dataset.energyIndex||0));
    }
    function cancel(){cleanup();}
    cancelGesture=cancel;try{source.setPointerCapture?.(event.pointerId);}catch(_){}root.document.addEventListener('pointermove',move,true);root.document.addEventListener('pointerup',end,true);root.document.addEventListener('pointercancel',cancel,true);
  }

  function init(){
    const entry=el('tcgpBattleEntry'),content=el('tcgpBattleContent');if(!entry||!content)return;
    entry.addEventListener('click',open);el('tcgpBattleBack')?.addEventListener('click',back);el('tcgpBattleInfo')?.addEventListener('click',showHelp);el('tcgpBattleHelpClose')?.addEventListener('click',hideHelp);el('tcgpBattleHelpDone')?.addEventListener('click',hideHelp);content.addEventListener('click',contentClick);content.addEventListener('input',contentInput);content.addEventListener('change',event=>{if(event.target?.matches?.('.tcgp-classic-match-settings [data-set-sort]')){opponentSetUI.sort=event.target.value;const panel=content.querySelector('.tcgp-classic-match-settings'),node=panel?.querySelector('.tcg-set-selector');if(node){const scrollHost=content.closest('.tcgp-battle-content')||content;const scrollTop=scrollHost.scrollTop;const holder=root.document.createElement('div');holder.innerHTML=setPicker.html({ids:CLASSIC_SETS,selected:classicOpponentConfig().sets,mode:'opponent',title:'Allowed opponent expansions',state:opponentSetUI});node.replaceWith(holder.firstElementChild);refreshOpponentControls();scrollHost.scrollTop=scrollTop;}}});content.addEventListener('pointerdown',energyPointerDown);content.addEventListener('pointerdown',handPointerDown);
    content.addEventListener('keydown',event=>{
      if(event.key!=='Escape')return;
      const layer=content.querySelector('.tcgp-live-card-zoom:not([hidden])');
      if(!layer)return;
      event.stopPropagation();event.preventDefault();layer.hidden=true;
      layer.closest('.tcgp-live-overlay')?.querySelector('.tcgp-live-card-art-zoom-trigger')?.focus();
    });
    root.addEventListener?.('beforeunload',event=>{if(screen==='builder'&&root.LuckyDexTCGPDeckEditor?.isDirty?.()){event.preventDefault();event.returnValue='';}});
    // A ResizeObserver callback is not a user cancellation. A reflow of the
    // fan can happen during an Android drag; cancelling here drops the preview
    // and swallows the tap/pointerup that should have played the card.
    if(root.ResizeObserver)new root.ResizeObserver(()=>layoutPlayerHand()).observe(content);else root.addEventListener?.('resize',()=>layoutPlayerHand());
  }
  if(root&&root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',init,{once:true});else init();}

  return{actionLabel,actionEventText,cardArtUrl,cardRulesHtml,supportText,filterBuilderRows,resultSummary,coverageForOwnedCards,centerHandActionIndices,directHandDropActionIndex,open,close,renderHome,requestLeave,isEditing:()=>screen==='builder',_test:{copiedAttackOption,copiedAttackLabel,shouldHoldPrizePresentation,setPrizePresentationHeldForTests:value=>{battlePrizePresentationHeld=!!value;},liveMidControlsHtml,cpuActionDwellMs,cpuRemainingDwellMs,slotTools,buildInspectSpec,resolveInspect,attachedToolLinksHtml,liveToolMiniCardsHtml,liveCardHtml,attackPresentationMeta,coinSequence,battleSummaryStats,capturePresentationAnchors,targetKeyForAction,benchDamagePresentationEntry,stadiumSlotModel,resultActionsModel,choiceBoardActions,contextualBoardActions,canChooseBoardDirect,boardTargetForAction,boardTargetOnlyActions,classicTrainerRestriction,liveContextActionsOverlayHtml,liveMidControlsHtml,livePrizePileHtml,livePrizeOverlayHtml,liveHandRevealOverlayHtml,tellRevealFromLogs,setHandRevealForTests:value=>{battleHandReveal=value;},livePokemonActionsOverlayHtml,setPokemonActionSpecForTests:value=>{battlePokemonActionSpec=value;},liveEffectChoiceCenterHtml,prizeCardButton,choiceCardTileHtml,choiceCardModel,handChoiceActionIndices,cpuActionCardId,setCurrentBattleForTests:(state,actions)=>{currentBattle=state;battleActionCache=actions||[];battleChoiceSelectionIndex=-1;battleChoiceBoardFilter=null;},setBattleOverlayForTests:(overlay,indices)=>{battleOverlay=overlay;battleContextActionIndices=indices||battleActionCache.map((_,i)=>i);},playmatArtPath,coinArtPath,coinPresentationHtml,energyCostHtml,liveAttachedEnergyHtml,liveEnergySourceHtml,liveBenchReadOnlyMovesHtml,handActionIndices,attackDescription,zoomArtworkButtonHtml,cardZoomOverlayHtml,openHandActions,openEnergyActions,pokemonActionIndices,pokemonInteractionAttrs,benchSwitchActionIndices,classicOpponentConfig,classicOpponentPickerHtml,pocketOpponentConfig,pocketOpponentPickerHtml,classicOpponentHandRevealed,handDropErrorMessage,dragPreviewTransform},back};
});
