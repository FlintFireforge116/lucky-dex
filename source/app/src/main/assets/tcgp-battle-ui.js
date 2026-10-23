(function(root,factory){
  let deps={
    data:root&&root.LuckyDexTCGPBattleData,
    decks:root&&root.LuckyDexTCGPBattleDecks,
    core:root&&root.LuckyDexTCGPBattleCore,
    ai:root&&root.LuckyDexTCGPBattleAI,
    solo:root&&root.LuckyDexTCGPBattleSolo,
    progress:root&&root.LuckyDexTCGPBattleProgress
  };
  if(typeof module==='object'&&module.exports){
    deps={
      data:require('./tcgp-battle-data.js'),decks:require('./tcgp-battle-decks.js'),core:require('./tcgp-battle-core.js'),
      ai:require('./tcgp-battle-ai.js'),solo:require('./tcgp-battle-solo.js'),progress:require('./tcgp-battle-progress.js')
    };
    module.exports=factory(null,deps);
  }else if(root){
    root.LuckyDexTCGPBattleUI=factory(root,deps);
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(root,deps){
  'use strict';
  const {data,decks,core,ai,solo,progress}=deps;

  const CHALLENGE_ID='genetic-apex-beginner-ivysaur';
  let screen='home',builderCards=[],builderName='My Pocket Deck',builderMessage='';
  let currentBattle=null,currentChallenge=null,currentPractice=false,currentPlayerDeck=null,resultInfo=null,cpuPending=false,cpuTimer=null,battleActionCache=[];

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const el=id=>root&&root.document?root.document.getElementById(id):null;
  const saveNow=()=>{try{if(root&&typeof root.save==='function')root.save();}catch(error){console.error('[TCGP Battle] save failed',error);}};
  const toast=msg=>{try{if(root&&typeof root.showToast==='function')root.showToast(msg,2400);}catch(_){}};

  function cardArtUrl(cardId){
    const match=/^([A-Z0-9]+)-(\d+)$/.exec(String(cardId||'').toUpperCase());
    if(!match||match[1]==='BASIC')return'';
    const set=match[1],number=String(Number(match[2])).padStart(3,'0');
    return `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/${set}/${set}_${number}_EN.webp`;
  }
  function cardName(id){return data.cardById(id)?.name||id||'Card';}
  function slotName(state,side,target,benchIndex){
    const s=state?.sides?.[side];
    const slot=target==='active'?s?.active:s?.bench?.[Number(benchIndex)];
    return cardName(slot?.cardId);
  }
  function actionLabel(action,state,side){
    if(!action)return'PLAY';
    if(action.type==='bench')return`BENCH · ${cardName(action.cardId)}`;
    if(action.type==='evolve')return`EVOLVE ${slotName(state,side,action.target,action.benchIndex)} → ${cardName(action.cardId)}`;
    if(action.type==='trainer')return action.cardId==='BASIC-POKE-BALL'?'PLAY POKE BALL':`PLAY ${cardName(action.cardId)}`;
    if(action.type==='attach')return`ATTACH GRASS → ${slotName(state,side,action.target,action.benchIndex)}`;
    if(action.type==='retreat')return`RETREAT → ${slotName(state,side,'bench',action.benchIndex)}`;
    if(action.type==='attack'){
      const active=state?.sides?.[side]?.active,card=data.cardById(active?.cardId),attack=card?.attacks?.[action.attackIndex];
      return `${attack?.name||'ATTACK'} · ${Number(attack?.damage||0)} DMG`;
    }
    if(action.type==='endTurn')return'END TURN';
    return String(action.type||'PLAY').toUpperCase();
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

  function renderHome(){
    setScreen('home');
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

  function selectedCount(id){return builderCards.filter(cardId=>cardId===id).length;}
  function maxOwnedFor(row){return Math.min(2,Math.max(0,Number(row?.quantity||0)));}
  function deckCardRow(row){
    const count=selectedCount(row.gameplayId),max=maxOwnedFor(row),card=row.card,art=cardArtUrl(row.gameplayId);
    return `<div class="tcgp-deck-card"><div>${art?`<img src="${art}" alt="" loading="lazy">`:''}</div><div class="tcgp-deck-card-copy"><b>${esc(card.name)}</b><small>${esc(card.stage||card.trainerType||'Card')} · Owned ${row.quantity}${row.battleEnabled?'':' · NOT BATTLE-ENABLED'}</small></div><div class="tcgp-deck-stepper"><button type="button" data-tcgp-action="remove-card" data-card-id="${esc(row.gameplayId)}" ${count?'':'disabled'}>−</button><b>${count}</b><button type="button" data-tcgp-action="add-card" data-card-id="${esc(row.gameplayId)}" ${count<max&&builderCards.length<20?'':'disabled'}>+</button></div></div>`;
  }
  function supportRow(){const count=selectedCount('BASIC-POKE-BALL');return `<div class="tcgp-deck-card tcgp-battle-support"><div>🔴</div><div class="tcgp-deck-card-copy"><b>Poke Ball</b><small>Battle Basics · 2 supplied · Searches a random Basic Pokémon</small></div><div class="tcgp-deck-stepper"><button type="button" data-tcgp-action="remove-card" data-card-id="BASIC-POKE-BALL" ${count?'':'disabled'}>−</button><b>${count}</b><button type="button" data-tcgp-action="add-card" data-card-id="BASIC-POKE-BALL" ${count<2&&builderCards.length<20?'':'disabled'}>+</button></div></div>`;}

  function renderBuilder(){
    setScreen('builder');
    const rows=enabledOwnedRows(),validation=decks.validateDeck(builderCards,ownedRows());
    setContent(`<section class="tcgp-battle-panel"><div class="eyebrow">20-CARD DECK</div><h3>Deck Builder</h3><p>Alternate artworks count as the same gameplay card. Pocket's two-copy limit is enforced across every print.</p><div class="tcgp-deck-summary"><span><small>DECK SIZE</small><br><b>${builderCards.length}/20</b></span><span><small>ENERGY ZONE</small><br><b>GRASS</b></span></div><input id="tcgpDeckName" class="tcgp-deck-name" maxlength="40" value="${esc(builderName)}" aria-label="Deck name"><div class="tcgp-battle-actions-row"><button class="tcgp-battle-action secondary" data-tcgp-action="quick">QUICK BUILD</button><button class="tcgp-battle-action" data-tcgp-action="save-deck" ${validation.ok?'':'disabled'}>SAVE DECK</button></div>${builderMessage?`<div class="tcgp-battle-error">${esc(builderMessage)}</div>`:''}${!validation.ok&&builderCards.length?`<div class="tcgp-battle-note">${esc(validation.errors[0])}</div>`:''}</section><section class="tcgp-battle-panel"><h3>Battle Basics</h3><div class="tcgp-deck-list">${supportRow()}</div></section><section class="tcgp-battle-panel"><h3>Your battle-enabled pulls</h3>${rows.length?`<div class="tcgp-deck-list">${rows.map(deckCardRow).join('')}</div>`:'<p>No supported owned cards yet. Use the Lab Loaner to test the battle engine while coverage expands.</p>'}</section>`);
    const input=el('tcgpDeckName');if(input)input.addEventListener('input',event=>{builderName=event.target.value||'My Pocket Deck';});
  }

  function hpInfo(slot){
    if(!slot)return{card:null,hp:0,left:0,pct:0};const card=data.cardById(slot.cardId),hp=Number(card?.hp||0),left=Math.max(0,hp-Number(slot.damage||0));return{card,hp,left,pct:hp?Math.max(0,Math.min(100,left/hp*100)):0};
  }
  function slotHtml(slot,compact){
    if(!slot)return'<div class="tcgp-poke-card no-art">EMPTY</div>';
    const info=hpInfo(slot),art=cardArtUrl(slot.cardId),energy=Object.values(slot.energy||{}).reduce((a,b)=>a+Number(b||0),0);
    return `<div class="tcgp-poke-card${art?'':' no-art'}">${art&&!compact?`<img src="${art}" alt="${esc(info.card?.name||'Pokémon')}">`:''}<div class="tcgp-slot-name">${esc(info.card?.name||slot.cardId)}</div><div class="tcgp-hp-track"><i style="width:${info.pct}%"></i></div><div class="tcgp-slot-detail">HP ${info.left}/${info.hp} · ⚡ ${energy}</div></div>`;
  }
  function boardSideHtml(side,label,cpu){
    return `<section class="tcgp-board-side${cpu?' cpu':''}"><div class="tcgp-board-meta"><b>${label} · ${side.points}/3 PTS</b><span>Deck ${side.deck.length} · Hand ${side.hand.length}</span></div><div class="tcgp-active-wrap">${slotHtml(side.active,false)}<div><small>ACTIVE</small><p class="tcgp-battle-note">${side.active?`${esc(cardName(side.active.cardId))} · Retreat ${Number(data.cardById(side.active.cardId)?.retreat||0)}`:'No Active Pokémon'}</p><div class="tcgp-bench">${side.bench.length?side.bench.map(slot=>slotHtml(slot,true)).join(''):'<span class="tcgp-battle-note">Bench empty</span>'}</div></div></div></section>`;
  }
  function handHtml(side){return side.hand.map(ref=>{const art=cardArtUrl(ref.cardId);return `<div class="tcgp-hand-card">${art?`<img src="${art}" alt="">`:'<div>🔴</div>'}<b>${esc(cardName(ref.cardId))}</b></div>`;}).join('')||'<span class="tcgp-battle-note">No cards in hand.</span>';}
  function logText(entry){
    if(entry.type==='turn')return`Turn ${entry.turnNumber}: ${entry.side==='player'?'Your':'CPU'} turn`;
    if(entry.type==='attack')return`${entry.side==='player'?'You':'CPU'} used ${entry.attack} for ${entry.damage}`;
    if(entry.type==='ko')return`${cardName(entry.cardId)} was Knocked Out`;
    if(entry.type==='search')return`${entry.side==='player'?'You':'CPU'} found ${cardName(entry.cardId)}`;
    return'';
  }

  function renderBattle(){
    if(!currentBattle)return renderHome();
    setScreen('battle');
    const p=currentBattle.sides.player,o=currentBattle.sides.opponent;
    battleActionCache=currentBattle.phase==='battle'&&currentBattle.activeSide==='player'&&!cpuPending?core.legalActions(currentBattle,'player'):[];
    const actions=battleActionCache.map((action,index)=>`<button class="tcgp-battle-action" type="button" data-tcgp-action="battle-action" data-action-index="${index}">${esc(actionLabel(action,currentBattle,'player'))}</button>`).join('');
    const logs=currentBattle.log.slice(-7).map(entry=>`<span>${esc(logText(entry))}</span>`).filter(x=>!x.endsWith('></span>')).join('');
    setContent(`<div class="tcgp-turn-banner"><b>TURN ${currentBattle.turnNumber}/50</b><span>${currentBattle.activeSide==='player'?'YOUR TURN':cpuPending?'CPU THINKING…':'CPU TURN'}${p.energyAvailable&&!p.energyUsed?' · GRASS ENERGY READY':''}</span></div><div class="tcgp-board">${boardSideHtml(o,'CPU',true)}${boardSideHtml(p,'YOU',false)}</div><section class="tcgp-battle-panel"><h3>Your hand</h3><div class="tcgp-battle-hand">${handHtml(p)}</div></section><section class="tcgp-battle-panel${cpuPending?' tcgp-battle-thinking':''}"><h3>${currentBattle.activeSide==='player'?'Legal actions':'Waiting for CPU'}</h3><div class="tcgp-battle-action-list">${actions||'<span class="tcgp-battle-note">The opponent is taking its turn.</span>'}</div></section><section class="tcgp-battle-panel"><h3>Battle log</h3><div class="tcgp-battle-log">${logs||'<span>Battle started.</span>'}</div></section>`);
  }

  function finishBattle(){
    if(!currentBattle||currentBattle.phase!=='finished')return;
    if(currentPractice)resultInfo={practice:true,firstClear:false,reward:{coins:0,dust:0}};
    else resultInfo=progress.recordResult(root.state,currentBattle,currentChallenge);
    saveNow();renderResult();
  }
  function renderResult(){
    setScreen('result');
    const won=currentBattle?.winner==='player',practice=!!resultInfo?.practice,reward=resultInfo?.reward||{coins:0,dust:0};
    setContent(`<section class="tcgp-battle-result"><div class="eyebrow">SOLO BATTLE</div><h2>${won?'VICTORY':'DEFEAT'}</h2><p>${won?'You reached 3 points first.':currentBattle?.reason==='turn-limit'?'The 50-turn Solo limit expired.':'The CPU won the match.'}</p><div class="tcgp-battle-stat-grid"><div class="tcgp-battle-stat"><small>YOU</small><b>${currentBattle?.sides.player.points||0}</b></div><div class="tcgp-battle-stat"><small>CPU</small><b>${currentBattle?.sides.opponent.points||0}</b></div><div class="tcgp-battle-stat"><small>TURN</small><b>${currentBattle?.turnNumber||0}</b></div></div><div class="tcgp-battle-reward">${practice?'PRACTICE · NO REWARDS':won?(resultInfo.firstClear?`FIRST CLEAR · ◉ ${reward.coins} + ✦ ${reward.dust}`:'REPEAT CLEAR · NO CURRENCY FARMING'):'NO REWARD'}</div><div class="tcgp-battle-actions-row"><button class="tcgp-battle-action" data-tcgp-action="rematch">REMATCH</button><button class="tcgp-battle-action secondary" data-tcgp-action="home">BATTLE HOME</button></div></section>`);
  }

  function startBattle(cards,practice){
    currentChallenge=solo.challengeById(CHALLENGE_ID);currentPractice=!!practice;currentPlayerDeck=cards.slice();resultInfo=null;cpuPending=false;
    currentBattle=solo.createBattle({challengeId:CHALLENGE_ID,playerDeck:cards,seed:Date.now()>>>0,playerEnergyType:'Grass'});
    renderBattle();maybeCpu();
  }
  function maybeCpu(){
    if(!currentBattle||currentBattle.phase!=='battle'||currentBattle.activeSide!=='opponent'||cpuPending)return;
    cpuPending=true;renderBattle();clearTimeout(cpuTimer);cpuTimer=setTimeout(()=>{try{ai.runTurn(currentBattle,'opponent','Beginner');}catch(error){console.error('[TCGP Battle] CPU error',error);toast('Battle engine error.');}cpuPending=false;if(currentBattle?.phase==='finished')finishBattle();else renderBattle();},380);
  }

  function open(){
    const home=el('packHome'),stage=el('packStage'),view=el('tcgpBattleView');if(!view)return;
    if(home)home.hidden=true;if(stage)stage.hidden=true;view.hidden=false;renderHome();
    const state=battleSave();if(!state.helpSeen){state.helpSeen=true;saveNow();showHelp();}
  }
  function close(){const view=el('tcgpBattleView'),home=el('packHome');if(view)view.hidden=true;if(home)home.hidden=false;setScreen('home');}
  function showHelp(){const help=el('tcgpBattleHelp');if(help)help.hidden=false;}
  function hideHelp(){const help=el('tcgpBattleHelp');if(help)help.hidden=true;}
  function back(){
    if(screen==='home')return close();
    if(screen==='battle'&&currentBattle?.phase==='battle'){
      if(root&&typeof root.confirm==='function'&&!root.confirm('Leave this battle? The current match will be abandoned.'))return;
      clearTimeout(cpuTimer);currentBattle=null;cpuPending=false;
    }
    renderHome();
  }

  function startOwned(){const deck=activeDeck();if(!deck){toast('Build and save a legal owned deck first.');return;}startBattle(deck.cards,false);}
  function openBuilder(prefill){
    const deck=activeDeck();builderName=deck?.name||'My Pocket Deck';builderMessage='';
    if(prefill==='quick'){
      const quick=decks.buildQuickDeck(ownedRows());builderCards=quick.cards.slice();if(!quick.ok)builderMessage=quick.errors[0]||'Not enough supported cards yet.';
    }else builderCards=deck?.cards?.slice()||[];
    renderBuilder();
  }

  function contentClick(event){
    const btn=event.target.closest?.('[data-tcgp-action]');if(!btn)return;const action=btn.dataset.tcgpAction;
    if(action==='build')return openBuilder();
    if(action==='quick')return openBuilder('quick');
    if(action==='battle-owned')return startOwned();
    if(action==='practice')return startBattle(decks.LOANER_PLAYER_DECK,true);
    if(action==='home')return renderHome();
    if(action==='rematch')return startBattle(currentPlayerDeck,currentPractice);
    if(action==='add-card'||action==='remove-card'){
      const id=btn.dataset.cardId,count=selectedCount(id),row=enabledOwnedRows().find(r=>r.gameplayId===id),max=id==='BASIC-POKE-BALL'?2:maxOwnedFor(row);
      if(action==='add-card'&&count<max&&builderCards.length<20)builderCards.push(id);
      if(action==='remove-card'&&count){const idx=builderCards.lastIndexOf(id);if(idx>=0)builderCards.splice(idx,1);}
      builderMessage='';return renderBuilder();
    }
    if(action==='save-deck'){
      const result=decks.saveDeck(root.state,{id:activeDeck()?.id||'tcgp-main',name:builderName,cards:builderCards,energyType:'Grass'},ownedRows());
      if(!result.ok){builderMessage=result.errors[0]||'Deck is not legal.';return renderBuilder();}saveNow();toast('Pocket deck saved.');return renderHome();
    }
    if(action==='battle-action'){
      if(!currentBattle||currentBattle.activeSide!=='player')return;const chosen=battleActionCache[Number(btn.dataset.actionIndex)];if(!chosen)return;
      try{core.applyAction(currentBattle,'player',chosen);}catch(error){console.error('[TCGP Battle] action error',error);toast(error.message||'That play is not legal.');}
      if(currentBattle.phase==='finished')return finishBattle();renderBattle();maybeCpu();
    }
  }

  function init(){
    const entry=el('tcgpBattleEntry'),content=el('tcgpBattleContent');if(!entry||!content)return;
    entry.addEventListener('click',open);el('tcgpBattleBack')?.addEventListener('click',back);el('tcgpBattleInfo')?.addEventListener('click',showHelp);el('tcgpBattleHelpClose')?.addEventListener('click',hideHelp);el('tcgpBattleHelpDone')?.addEventListener('click',hideHelp);content.addEventListener('click',contentClick);
  }
  if(root&&root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',init,{once:true});else init();}

  return{actionLabel,cardArtUrl,coverageForOwnedCards,open,close,renderHome};
});
