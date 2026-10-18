(function(root,factory){
  const core=root.LuckyDexGoldenrodCore||(typeof require==='function'?require('./arcade-goldenrod-core.js'):null);
  const stateApi=root.LuckyDexGoldenrodState||(typeof require==='function'?require('./arcade-goldenrod-state.js'):null);
  const api=factory(root,core,stateApi);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexGoldenrod=api;
})(typeof window!=='undefined'?window:globalThis,function(root,core,stateApi){
  'use strict';
  const EVENTS=Object.freeze([
    Object.freeze({id:'dash',name:'Pokémon Dash',stat:'SPEED',sprite:'25.png',mechanic:'Race · stamina · racing lines',guide:'Steer to stay on the fastest racing line. Sprint to gain speed, but watch stamina and ease off before it empties. Clean lines and well-timed bursts beat holding sprint the whole race.',built:true}),
    Object.freeze({id:'powerTrial',name:'Power Trial',stat:'ATTACK',sprite:'68.png',mechanic:'Charge · impact timing',guide:'Hold to build power, then release in the impact window. Releasing too early wastes force; holding too long overshoots. Higher Attack gives stronger hits, but your timing still decides the score.',built:true}),
    Object.freeze({id:'impactTrial',name:'Impact Trial',stat:'DEFENSE',sprite:'306.png',mechanic:'Harden · react · survive',guide:'Watch each incoming attack and trigger Harden as it reaches the impact window. Perfect blocks absorb the hit; mistimed blocks hurt. Low-Defense Pokémon get less room for error and can be knocked out quickly.',built:true}),
    Object.freeze({id:'targetRange',name:'Target Range',stat:'SP. ATK',sprite:'65.png',mechanic:'Aim · wind · distance · combos',guide:'Aim each special attack at the target and compensate for wind and distance before firing. Accurate consecutive hits build the best score; misses break your rhythm.',built:true}),
    Object.freeze({id:'elementalGauntlet',name:'Elemental Gauntlet',stat:'SP. DEF',sprite:'197.png',mechanic:'Dodge · resist · survive',guide:'Move out of incoming elemental attacks and survive the full gauntlet. Sp. Def reduces the punishment when you are hit, but dodging is always safer. Read the warning pattern before committing to a lane.',built:true}),
    Object.freeze({id:'enduranceExpedition',name:'Endurance Expedition',stat:'HP',sprite:'242.png',mechanic:'Steer · dodge · endure',guide:'Steer through the expedition, avoid hazards and preserve as much HP as possible to the finish. High-HP Pokémon can survive more mistakes, but clean movement produces the strongest run.',built:true})
  ]);
  const TYPE_ORDER=Object.freeze(['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']);
  const CUP_REWARDS=Object.freeze({
    rookie:Object.freeze([240,160,110,70,50,40]),poke:Object.freeze([300,200,140,90,65,50]),great:Object.freeze([380,250,175,115,80,60]),ultra:Object.freeze([480,320,220,145,100,75]),master:Object.freeze([620,410,285,185,125,95])
  });
  const ui={screen:'events',eventId:null,mode:null,difficulty:'normal',divisionId:'rookie',type:null,participantKey:null,attackType:null,participantQuery:'',participantSort:'stat-desc',lastScoreboard:null,lastFinal:null};
  let cup=null,wired=false;
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const adapters=()=>root.LuckyDexGoldenrodAdapters||globalThis.LuckyDexGoldenrodAdapters||null;
  const platform=()=>root.LuckyDexArcadePlatform||globalThis.LuckyDexArcadePlatform||null;
  const stateRef=()=>root.state||globalThis.state||null;
  const host=()=>typeof document!=='undefined'?document.getElementById('arcadeVenueGames'):null;
  const gameApi=id=>({dash:root.LuckyDexDash,powerTrial:root.LuckyDexPowerTrial,impactTrial:root.LuckyDexImpactTrial,targetRange:root.LuckyDexTargetRange,elementalGauntlet:root.LuckyDexElementalGauntlet,enduranceExpedition:root.LuckyDexEnduranceExpedition})[id]||null;
  const titleCase=s=>String(s||'').replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase());
  const STAT_LABELS=Object.freeze({speed:'Speed',attack:'Attack',defense:'Defense',spAtk:'Sp. Atk',spDef:'Sp. Def',hp:'HP'});
  const statLabel=statKey=>STAT_LABELS[String(statKey||'')]||titleCase(statKey);
  function participantSortOptions(statKey){
    const label=statLabel(statKey);
    return [
      {value:'stat-desc',label:`${label} · highest`},
      {value:'stat-asc',label:`${label} · lowest`},
      {value:'level-desc',label:'Level · highest'},
      {value:'name-asc',label:'Name · A–Z'},
      {value:'name-desc',label:'Name · Z–A'},
      {value:'dex-asc',label:'Pokédex No.'}
    ];
  }
  function sortParticipantRows(rows,{query='',sortKey='stat-desc',competitive=false}={}){
    const q=String(query||'').trim().toLowerCase();
    const list=(Array.isArray(rows)?rows:[]).filter(row=>!q||String(row?.name||'').toLowerCase().includes(q)||String(row?.id??'').includes(q));
    const num=(v,fallback=0)=>{const n=Number(v);return Number.isFinite(n)?n:fallback;};
    list.sort((a,b)=>{
      if(competitive){const ae=!!a?.eligibility?.eligible,be=!!b?.eligibility?.eligible;if(ae!==be)return ae?-1:1;}
      let cmp=0;
      if(sortKey==='stat-asc')cmp=num(a?.baseStat)-num(b?.baseStat);
      else if(sortKey==='level-desc')cmp=num(b?.level)-num(a?.level);
      else if(sortKey==='name-asc')cmp=String(a?.name||'').localeCompare(String(b?.name||''));
      else if(sortKey==='name-desc')cmp=String(b?.name||'').localeCompare(String(a?.name||''));
      else if(sortKey==='dex-asc')cmp=num(a?.id,Number.MAX_SAFE_INTEGER)-num(b?.id,Number.MAX_SAFE_INTEGER);
      else cmp=num(b?.baseStat)-num(a?.baseStat);
      if(cmp)return cmp;
      cmp=String(a?.name||'').localeCompare(String(b?.name||''));if(cmp)return cmp;
      cmp=num(a?.id,Number.MAX_SAFE_INTEGER)-num(b?.id,Number.MAX_SAFE_INTEGER);if(cmp)return cmp;
      return String(a?.key||'').localeCompare(String(b?.key||''));
    });
    return list;
  }
  function rewardForCup(divisionId,place){const row=CUP_REWARDS[core.division(divisionId).id]||CUP_REWARDS.rookie;return row[Math.max(1,Math.min(6,Math.trunc(Number(place)||6)))-1]||0;}
  function recordsCore(){return root.LuckyDexArcadeRecordsCore||globalThis.LuckyDexArcadeRecordsCore||null;}

  function eventCardsModel(adapterApi=adapters()){
    return EVENTS.map(event=>{
      const adapter=event.built?adapterApi?.get?.(event.id):null;
      const active=!!event.built&&!!adapter;
      return {...event,active,reason:active?'':event.built?'Unavailable':'Coming Later'};
    });
  }
  function flowSteps(mode){return mode==='type'?['event','mode','division','type','participant']:mode==='division'?['event','mode','division','participant']:['event','mode','difficulty','participant'];}
  function renderEventCards(cards=eventCardsModel()){
    return `<div class="goldenrod-event-grid">${cards.map(c=>c.active?`<button type="button" class="goldenrod-event-card" data-goldenrod-event="${c.id}" data-stat="${escapeHtml(c.stat)}"><img src="arcade/sprites/actors/pokemon/${c.sprite}" alt=""><span><small>${escapeHtml(c.stat)} EVENT</small><b>${escapeHtml(c.name)}</b><em>${escapeHtml(c.mechanic)}</em></span><strong>ENTER ›</strong></button>`:`<button type="button" class="goldenrod-event-card is-disabled" disabled data-goldenrod-event="${c.id}" data-stat="${escapeHtml(c.stat)}"><img src="arcade/sprites/actors/pokemon/${c.sprite}" alt=""><span><small>${escapeHtml(c.stat)} EVENT</small><b>${escapeHtml(c.name)}</b><em>${escapeHtml(c.mechanic)}</em><i>${c.reason==='Unavailable'?'UNAVAILABLE':'COMING LATER'}</i></span><strong>${c.reason==='Unavailable'?'OFFLINE':'SOON'}</strong></button>`).join('')}</div>`;
  }
  function scoreboardModel({cup:cupValue,roundResults=[],standings=[]}={}){
    const n=Math.max(1,Math.min(3,cupValue?.rounds?.length||1));
    return {roundLabel:`ROUND ${n} / 3`,roundTitle:'ROUND RESULTS',standingsTitle:'CUP STANDINGS',roundResults:roundResults.map(r=>({...r,player:!!r.isPlayer||String(r.id)==='player'})),standings:standings.map(r=>({...r,player:!!r.isPlayer||String(r.id)==='player'}))};
  }
  function finalModel({cup:cupValue,standings=[],settlement={}}={}){
    return {title:'CUP COMPLETE',podium:standings.slice(0,3).map(r=>({...r,player:!!r.isPlayer||String(r.id)==='player'})),standings:standings.map(r=>({...r,player:!!r.isPlayer||String(r.id)==='player'})),trophy:settlement.trophy||null,coinsAwarded:Number(settlement.coinsAwarded)||0,unlocks:Array.isArray(settlement.unlocks)?settlement.unlocks:[],rareReceipts:Array.isArray(settlement.rareReceipts)?settlement.rareReceipts:(cupValue?.rareReceipts||[]),actions:['TROPHY CABINET','NEW CUP']};
  }

  function goldenrodState(){
    const s=stateRef();if(!s)return stateApi.defaultGoldenrodState();
    s.arcade=s.arcade&&typeof s.arcade==='object'?s.arcade:{};
    s.arcade.goldenrod=stateApi.normalizeGoldenrodState(s.arcade.goldenrod,{legacyDash:s.arcade.dash});
    return s.arcade.goldenrod;
  }
  function eventState(eventId){return goldenrodState().events[eventId]||stateApi.defaultGoldenrodState().events[eventId];}
  function unlockedDivisionIds(eventId){const max=core.division(eventState(eventId).unlockedDivision).index;return core.DIVISIONS.filter(d=>d.index<=max).map(d=>d.id);}
  function selectedAdapter(){return adapters()?.get?.(ui.eventId)||null;}

  function renderHeader(copy='Choose an event'){
    const event=EVENTS.find(e=>e.id===ui.eventId);
    return `<div class="goldenrod-shell-head"><div><small>GOLDENROD · CHALLENGE COURSE</small><h2>${event?escapeHtml(event.name):'Pokémon Challenge Course'}</h2><p>${escapeHtml(copy)}</p></div><button type="button" class="goldenrod-cabinet-btn" data-goldenrod-cabinet>TROPHY CABINET</button></div>`;
  }
  function renderEvents(){return `${renderHeader('Train a specialist, enter a division, and chase the podium.')}${renderEventCards()}`;}
  function renderModes(){
    const es=eventState(ui.eventId),event=EVENTS.find(e=>e.id===ui.eventId);return `${renderHeader('Read the rules, then choose how you want to compete.')}<button class="goldenrod-back" data-goldenrod-back="events">‹ EVENTS</button>${event?`<article class="goldenrod-howto"><small>HOW TO PLAY</small><h3>${escapeHtml(event.name)}</h3><p>${escapeHtml(event.guide||event.mechanic)}</p><b>${escapeHtml(event.stat)} matters here</b></article>`:''}<div class="goldenrod-mode-grid"><button data-goldenrod-mode="exhibition"><b>EXHIBITION</b><span>Single run · unrestricted stats · Easy / Normal / Hard</span></button><button data-goldenrod-mode="division"><b>DIVISION CUP</b><span>Three rounds · six entrants · main progression</span></button><button data-goldenrod-mode="type" ${es.typeCupsUnlocked?'':'disabled'}><b>TYPE CUP</b><span>${es.typeCupsUnlocked?'Three themed rounds · division caps apply':'Podium Rookie Division Cup to unlock'}</span></button></div>`;
  }
  function renderDifficultyOptions(){return `<div class="goldenrod-mode-grid goldenrod-difficulty-grid"><button data-goldenrod-difficulty="easy"><b>EASY</b><span>Relaxed practice</span></button><button data-goldenrod-difficulty="normal"><b>NORMAL</b><span>Standard practice</span></button><button data-goldenrod-difficulty="hard"><b>HARD</b><span>Full-speed practice</span></button></div>`;}
  function renderDifficulties(){return `${renderHeader('Choose an Exhibition difficulty. Stats are unrestricted.')}<button class="goldenrod-back" data-goldenrod-back="modes">‹ MODES</button>${renderDifficultyOptions()}`;}
  function renderDivisions(){
    const unlocked=new Set(unlockedDivisionIds(ui.eventId));return `${renderHeader(ui.mode==='type'?'Choose an unlocked division for this Type Cup.':'Choose your competitive division.')}<button class="goldenrod-back" data-goldenrod-back="modes">‹ MODES</button><div class="goldenrod-division-grid">${core.DIVISIONS.map(d=>`<button data-goldenrod-division="${d.id}" ${unlocked.has(d.id)?'':'disabled'}><b>${d.label}</b><span>${d.maxStat==null?'UNRESTRICTED':`STAT ≤ ${d.maxStat}`}</span><small>${eventState(ui.eventId).divisionTrophies?.[d.id]?.toUpperCase()||''}</small></button>`).join('')}</div>`;
  }
  function renderTypes(){return `${renderHeader('Type Cups use the same division cap with a themed field.')}<button class="goldenrod-back" data-goldenrod-back="divisions">‹ DIVISIONS</button><div class="goldenrod-type-grid">${TYPE_ORDER.map(type=>`<button data-goldenrod-type="${type}"><b>${titleCase(type)}</b></button>`).join('')}</div>`;}
  function participantRows(){
    const adapter=selectedAdapter();if(!adapter)return [];
    const rows=adapter.participants().map(row=>({...row,eligibility:adapter.eligibility(row,{mode:ui.mode,divisionId:ui.divisionId,type:ui.type})}));
    return sortParticipantRows(rows,{query:ui.participantQuery,sortKey:ui.participantSort,competitive:ui.mode!=='exhibition'});
  }
  function renderParticipantCards(adapter,rows){
    const stat=statLabel(adapter?.statKey),empty=ui.participantQuery?'No Pokémon match this search.':'Catch a Pokémon to compete.';
    return rows.map(row=>`<button data-goldenrod-participant="${escapeHtml(row.key)}" ${row.eligibility.eligible?'':'disabled'}><img src="${escapeHtml(row.image||`arcade/sprites/actors/pokemon/${row.id}.png`)}" alt=""><span><b>${escapeHtml(row.name)}</b><small>${escapeHtml(stat.toUpperCase())} ${Math.round(row.baseStat)}</small><em>${row.eligibility.eligible?'ELIGIBLE':row.eligibility.reason==='over-cap'?'OVER CAP':'WRONG TYPE'}</em></span></button>`).join('')||`<div class="goldenrod-empty">${empty}</div>`;
  }
  function renderParticipantTools(adapter,rows){
    const options=participantSortOptions(adapter?.statKey);
    return `<div class="goldenrod-participant-tools"><label class="goldenrod-participant-search"><span>SEARCH</span><input type="search" data-goldenrod-participant-search value="${escapeHtml(ui.participantQuery)}" placeholder="Name or Pokédex No." autocomplete="off" spellcheck="false"></label><label class="goldenrod-participant-sort"><span>SORT</span><select data-goldenrod-participant-sort>${options.map(o=>`<option value="${o.value}" ${ui.participantSort===o.value?'selected':''}>${escapeHtml(o.label)}</option>`).join('')}</select></label></div><div class="goldenrod-participant-count" data-goldenrod-participant-count>${rows.length} Pokémon${ui.mode!=='exhibition'?' · eligible first':''}</div>`;
  }
  function refreshParticipantGrid(){
    if(typeof document==='undefined')return false;const adapter=selectedAdapter();if(!adapter)return false;
    const rows=participantRows(),grid=document.querySelector?.('[data-goldenrod-participant-grid]'),count=document.querySelector?.('[data-goldenrod-participant-count]');
    if(grid)grid.innerHTML=renderParticipantCards(adapter,rows);if(count)count.textContent=`${rows.length} Pokémon${ui.mode!=='exhibition'?' · eligible first':''}`;return true;
  }
  function renderParticipants(){
    const adapter=selectedAdapter(),rows=participantRows();
    if(!adapter)return `${renderHeader('This event is temporarily unavailable.')}<button class="goldenrod-back" data-goldenrod-back="events">‹ EVENTS</button><div class="goldenrod-empty">EVENT UNAVAILABLE</div>`;
    return `${renderHeader(ui.mode==='exhibition'?'Exhibition has no stat cap. Pick any caught Pokémon.':`Pick an eligible Pokémon. ${core.division(ui.divisionId).label} cap applies.`)}<button class="goldenrod-back" data-goldenrod-back="${ui.mode==='type'?'types':ui.mode==='division'?'divisions':'difficulties'}">‹ BACK</button>${renderParticipantTools(adapter,rows)}<div class="goldenrod-participant-grid" data-goldenrod-participant-grid>${renderParticipantCards(adapter,rows)}</div>`;}
  function attackTypesFor(participant){const adapter=selectedAdapter();return adapter?.attackTypes?.(participant)||[];}
  function selectedParticipant(){return selectedAdapter()?.participants?.().find(p=>String(p.key)===String(ui.participantKey))||null;}
  function renderAttackTypes(){
    const row=selectedParticipant(),adapter=selectedAdapter(),types=attackTypesFor(row);
    return `${renderHeader('Choose the special attack style for this Pokémon. The choice stays fixed for the whole cup.')}<button class="goldenrod-back" data-goldenrod-back="participants">‹ POKÉMON</button><div class="goldenrod-type-grid goldenrod-attack-grid">${types.map(type=>`<button data-goldenrod-attack-type="${escapeHtml(type)}"><b>${escapeHtml(adapter?.attackName?.(type)||titleCase(type))}</b><span>${escapeHtml(titleCase(type))}</span></button>`).join('')}</div>`;
  }
  function renderScoreboard(){
    const m=ui.lastScoreboard;if(!m)return renderEvents();
    const adapter=adapters()?.get?.(cup?.eventId);const fmt=v=>adapter?.formatMetric?.(v)??String(v);
    return `${renderHeader('Round complete. Points carry across all three rounds.')}<div class="goldenrod-round-banner">${m.roundLabel}</div><section class="goldenrod-scoreboard"><h3>${m.roundTitle}</h3>${m.roundResults.map(r=>`<div class="goldenrod-score-row${r.player?' is-player':''}"><b>${r.place}</b><span>${escapeHtml(r.name||r.id)}</span><strong>${escapeHtml(fmt(r.metric))}</strong></div>`).join('')}</section><section class="goldenrod-scoreboard"><h3>${m.standingsTitle}</h3>${m.standings.map(r=>`<div class="goldenrod-score-row${r.player?' is-player':''}"><b>${r.place}</b><span>${escapeHtml(r.name||r.id)}</span><strong>${r.points} PTS</strong></div>`).join('')}</section><button class="primary goldenrod-next-round" data-goldenrod-next-round>ROUND ${(cup?.rounds?.length||0)+1} / 3 ›</button>`;
  }
  function renderFinal(){
    const m=ui.lastFinal;if(!m)return renderEvents();
    return `${renderHeader('Tournament complete.')}<div class="goldenrod-final"><div class="goldenrod-podium">${m.podium.map((r,i)=>`<div class="goldenrod-podium-place p${i+1}${r.player?' is-player':''}"><small>${i+1===1?'CHAMPION':i+1===2?'RUNNER-UP':'THIRD'}</small><b>${escapeHtml(r.name||r.id)}</b><span>${r.points} PTS</span></div>`).join('')}</div><div class="goldenrod-final-awards"><b>${m.trophy?`${m.trophy.toUpperCase()} TROPHY`:'NO TROPHY'}</b><span>+${m.coinsAwarded} Lucky Coins</span>${m.unlocks.map(x=>`<em>${escapeHtml(x)}</em>`).join('')}</div>${m.rareReceipts.length?`<section class="goldenrod-rare-receipts"><h3>RARE PRIZES WON</h3>${m.rareReceipts.map(r=>`<div><b>${escapeHtml(r.name||r.label||'Rare Prize')}</b><span>${escapeHtml(r.meta||'Awarded during the cup')}</span></div>`).join('')}</section>`:''}<div class="goldenrod-final-actions"><button data-goldenrod-cabinet>TROPHY CABINET</button><button class="primary" data-goldenrod-new-cup>NEW CUP</button></div></div>`;
  }
  function renderTrophyCabinet(){
    ui.screen='cabinet';const g=goldenrodState();const h=host();
    const medal=(value)=>String(value||'—').toUpperCase();
    const markup=`${renderHeader('Every podium and championship across the Challenge Course.')}<button class="goldenrod-back" data-goldenrod-back="events">‹ EVENTS</button><div class="goldenrod-cabinet">${EVENTS.filter(e=>e.built).map(event=>{const es=g.events[event.id]||{},typeTrophies=es.typeTrophies||{},won=TYPE_ORDER.reduce((sum,type)=>sum+core.DIVISIONS.filter(d=>typeTrophies?.[type]?.[d.id]).length,0);return `<section><h3>${escapeHtml(event.name)}</h3><h4>DIVISION CUPS</h4><div class="goldenrod-cabinet-divisions">${core.DIVISIONS.map(d=>`<span><small>${d.label}</small><b>${medal(es.divisionTrophies?.[d.id])}</b></span>`).join('')}</div><details class="goldenrod-type-trophies"><summary><b>TYPE CUPS</b><small>${won} / ${TYPE_ORDER.length*core.DIVISIONS.length} TROPHIES</small></summary><div class="goldenrod-type-trophy-grid">${TYPE_ORDER.map(type=>`<div class="goldenrod-type-trophy-row"><strong>${escapeHtml(titleCase(type))}</strong>${core.DIVISIONS.map(d=>`<span title="${escapeHtml(titleCase(type))} · ${escapeHtml(d.label)}"><small>${d.label.slice(0,2)}</small><b>${medal(typeTrophies?.[type]?.[d.id])}</b></span>`).join('')}</div>`).join('')}</div></details><p>Highest unlocked: <b>${core.division(es.unlockedDivision).label}</b> · Type Cups: <b>${es.typeCupsUnlocked?'UNLOCKED':'LOCKED'}</b></p></section>`;}).join('')}</div>`;
    if(h)h.innerHTML=markup;return markup;
  }
  function render(){
    const h=host();let markup='';
    if(ui.screen==='events')markup=renderEvents();else if(ui.screen==='modes')markup=renderModes();else if(ui.screen==='difficulties')markup=renderDifficulties();else if(ui.screen==='divisions')markup=renderDivisions();else if(ui.screen==='types')markup=renderTypes();else if(ui.screen==='participants')markup=renderParticipants();else if(ui.screen==='attackTypes')markup=renderAttackTypes();else if(ui.screen==='scoreboard')markup=renderScoreboard();else if(ui.screen==='final')markup=renderFinal();else if(ui.screen==='cabinet')return renderTrophyCabinet();else markup=renderEvents();
    if(h)h.innerHTML=`<div class="goldenrod-shell">${markup}</div>`;return markup;
  }

  function open({eventId=null}={}){
    wire();
    if(eventId&&EVENTS.some(e=>e.id===eventId)&&adapters()?.get?.(eventId)){ui.eventId=eventId;ui.participantQuery='';ui.participantSort='stat-desc';ui.screen='modes';}
    else if(cup&&(ui.screen==='scoreboard'||ui.screen==='final')){}
    else if(ui.screen!=='cabinet'){ui.screen='events';ui.eventId=null;}
    return render();
  }
  function close(){if(!cup){ui.screen='events';ui.eventId=null;ui.mode=null;ui.difficulty='normal';ui.type=null;ui.participantKey=null;ui.attackType=null;ui.participantQuery='';ui.participantSort='stat-desc';}return true;}

  function startExhibition({eventId,difficulty='normal',participantKey,attackType=null}={}){
    const adapter=adapters()?.get?.(eventId);if(!adapter)return false;
    const participant=adapter.participants().find(p=>String(p.key)===String(participantKey));if(!participant)return false;
    let chosenAttackType=attackType;
    if(eventId==='targetRange'){const owned=adapter.attackTypes?.(participant)||[];chosenAttackType=String(chosenAttackType||owned[0]||'').toLowerCase();if(!owned.includes(chosenAttackType))return false;}
    const world=root.LuckyDexArcadeWorld;if(world?.openGame)world.openGame(eventId);
    const api=gameApi(eventId);
    if(api?.startExhibition)return api.startExhibition({difficulty,participant,attackType:chosenAttackType});
    return {eventId,difficulty,participant,attackType:chosenAttackType};
  }
  function normalizeCupEntrant(row,isPlayer=false){return {...row,id:isPlayer?'player':String(row.key??row.id),key:String(row.key??row.id),isPlayer};}
  function launchRound(){
    if(!cup||cup.abandoned||cup.rounds.length>=3)return false;
    const ctx=cup._goldenrod,roundIndex=cup.rounds.length,token=`${cup.id}:round-${roundIndex+1}`;ctx.activeRoundToken=token;ctx.roundHandled=false;
    const api=gameApi(cup.eventId),world=root.LuckyDexArcadeWorld;
    world?.openGame?.(cup.eventId);
    if(api?.startGoldenrodRound)return api.startGoldenrodRound({cupId:cup.id,mode:cup.mode,divisionId:cup.divisionId,type:cup.type,roundIndex,seed:cup.seed+roundIndex*9973,player:ctx.player,aiEntrants:ctx.aiEntrants,attackType:ctx.attackType,onComplete:result=>acceptRoundResult({...result,_cupToken:token})});
    return {pending:true,eventId:cup.eventId,roundIndex};
  }
  function startCup({eventId,mode='division',divisionId='rookie',type=null,participantKey,attackType=null}={}){
    if(cup&&!cup.completed&&!cup.abandoned)return false;
    if(mode!=='division'&&mode!=='type')return false;
    const adapter=adapters()?.get?.(eventId);if(!adapter)return false;
    const es=eventState(eventId),requestedDivision=core.division(divisionId),unlockedDivision=core.division(es.unlockedDivision);
    if(requestedDivision.index>unlockedDivision.index)return false;
    if(mode==='type'&&(!es.typeCupsUnlocked||!type))return false;
    const player=adapter.participants().find(p=>String(p.key)===String(participantKey));if(!player)return false;
    const eligible=adapter.eligibility(player,{mode,divisionId,type});if(!eligible.eligible)return false;
    let chosenAttackType=attackType;if(eventId==='targetRange'){const owned=adapter.attackTypes?.(player)||[];chosenAttackType=String(chosenAttackType||owned[0]||'').toLowerCase();if(!owned.includes(chosenAttackType))return false;}
    const seed=(Date.now()^Math.floor((Number(player.id)||1)*2654435761))>>>0;
    const aiEntrants=adapter.selectAi({divisionId,type:mode==='type'?type:null,player,seed,count:5});if(aiEntrants.length<5)return false;
    const normalizedPlayer=normalizeCupEntrant(player,true),normalizedAi=aiEntrants.map(e=>normalizeCupEntrant(e,false));
    cup=core.createCup({eventId,mode,divisionId,type:mode==='type'?type:null,player:normalizedPlayer,entrants:normalizedAi,seed,metricDirection:adapter.metricDirection});
    cup._goldenrod={player,aiEntrants,attackType:chosenAttackType||null,profiles:Object.fromEntries(aiEntrants.map((e,i)=>[String(e.key??e.id),adapter.createAiProfile({entrant:e,divisionId,seed:seed+i*101})])),activeRoundToken:null,roundHandled:false};
    ui.eventId=eventId;ui.mode=mode;ui.divisionId=divisionId;ui.type=mode==='type'?type:null;ui.participantKey=participantKey;ui.screen='round';
    return launchRound();
  }
  function settleCupOnce(cupValue){
    if(!cupValue||cupValue.abandoned||cupValue.rounds?.length<3)return null;
    return core.completeCupOnce(cupValue,()=>{
      const standings=core.standings(cupValue),playerStanding=standings.find(r=>r.id==='player')||standings[standings.length-1];
      const finalPlace=playerStanding?.place||6,trophy=core.trophyForPlace(finalPlace),coins=rewardForCup(cupValue.divisionId,finalPlace);
      const event=eventState(cupValue.eventId),beforeDivision=event.unlockedDivision,beforeType=!!event.typeCupsUnlocked;
      const progress=stateApi.applyCupProgress(event,{mode:cupValue.mode,divisionId:cupValue.divisionId,type:cupValue.type,finalPlace,trophy});
      const unlocks=[];
      if(progress.divisionUnlocked)unlocks.push(`${core.division(progress.divisionUnlocked).label} DIVISION UNLOCKED`);
      if(!beforeType&&progress.typeCupsUnlocked)unlocks.push('TYPE CUPS UNLOCKED');
      const sref=stateRef();
      if(sref){
        sref.arcade=sref.arcade&&typeof sref.arcade==='object'?sref.arcade:{};
        const rc=recordsCore();if(rc?.updateTournamentRecord)sref.arcade.records=rc.updateTournamentRecord(sref.arcade.records,cupValue.eventId,{mode:cupValue.mode,divisionId:cupValue.divisionId,type:cupValue.type,playerStanding,metricDirection:cupValue.metricDirection,trophy});
      }
      let coinsAwarded=coins;
      try{const paid=platform()?.awardRun?.({gameId:cupValue.eventId,label:`Goldenrod ${cupValue.mode==='type'?titleCase(cupValue.type)+' Type':core.division(cupValue.divisionId).label+' Division'} Cup`,score:Math.max(0,7-finalPlace),coins,dailyEligible:false});if(Number.isFinite(Number(paid?.coinsAwarded)))coinsAwarded=Number(paid.coinsAwarded);}catch(error){try{console.warn('[LuckyDex] Goldenrod cup payout failed',error);}catch(_){}}
      try{(root.save||globalThis.save)?.();}catch(error){try{console.warn('[LuckyDex] Goldenrod cup save failed',error);}catch(_){}}
      return {finalPlace,trophy,coinsAwarded,unlocks,rareReceipts:[...(cupValue.rareReceipts||[])]};
    });
  }

  function acceptRoundResult(result={}){
    if(!cup||cup.abandoned||cup.completed)return false;
    const ctx=cup._goldenrod;if(ctx.roundHandled)return false;
    if(result._cupToken&&ctx.activeRoundToken&&result._cupToken!==ctx.activeRoundToken)return false;
    ctx.roundHandled=true;
    const adapter=adapters()?.get?.(cup.eventId);if(!adapter)return false;
    const roundIndex=cup.rounds.length,playerMetric=adapter.playerMetric(result),rows=[{id:'player',name:ctx.player.name||'YOU',metric:playerMetric,isPlayer:true}];
    for(let i=0;i<ctx.aiEntrants.length;i++){
      const entrant=ctx.aiEntrants[i],id=String(entrant.key??entrant.id),sim=adapter.simulateAiRound({entrant,profile:ctx.profiles[id],divisionId:cup.divisionId,roundIndex,seed:cup.seed+roundIndex*9973+i*379});
      rows.push({id,name:entrant.name||id,metric:sim.metric,isPlayer:false});
    }
    rows.sort((a,b)=>cup.metricDirection==='lower'?a.metric-b.metric:b.metric-a.metric||a.id.localeCompare(b.id));rows.forEach((r,i)=>r.place=i+1);
    const receipts=Array.isArray(result.rareReceipts)?result.rareReceipts:[];
    const recorded=core.recordRound(cup,{roundId:`round-${roundIndex+1}`,results:rows,rareReceipts:receipts});if(!recorded.accepted)return false;
    const standings=core.standings(cup).map(r=>({...r,name:r.name||r.id}));
    if(cup.rounds.length<3){ui.lastScoreboard=scoreboardModel({cup,roundResults:rows,standings});ui.screen='scoreboard';root.LuckyDexArcadeWorld?.openVenue?.('dashCourse');return ui.lastScoreboard;}
    const settlement=settleCupOnce(cup);if(!settlement)return false;
    ui.lastFinal=finalModel({cup,standings,settlement});ui.screen='final';root.LuckyDexArcadeWorld?.openVenue?.('dashCourse');return ui.lastFinal;
  }
  function abandonActiveCup(){if(!cup)return false;core.abandonCup(cup);cup=null;ui.lastScoreboard=null;ui.lastFinal=null;ui.screen='events';return true;}
  function activeCup(){return cup;}
  function newCup(){cup=null;ui.lastScoreboard=null;ui.lastFinal=null;ui.screen='events';ui.eventId=null;ui.mode=null;ui.difficulty='normal';ui.type=null;ui.attackType=null;ui.participantQuery='';ui.participantSort='stat-desc';render();}

  function launchSelectedParticipant(){
    if(ui.mode==='exhibition')return startExhibition({eventId:ui.eventId,difficulty:ui.difficulty,participantKey:ui.participantKey,attackType:ui.attackType});
    return startCup({eventId:ui.eventId,mode:ui.mode,divisionId:ui.divisionId,type:ui.type,participantKey:ui.participantKey,attackType:ui.attackType});
  }
  function chooseParticipant(key){
    ui.participantKey=key;ui.attackType=null;
    if(ui.eventId==='targetRange'){const row=selectedParticipant(),types=attackTypesFor(row);if(!types.length)return false;if(types.length>1){ui.screen='attackTypes';render();return true;}ui.attackType=types[0];}
    return launchSelectedParticipant();
  }

  function wire(){
    if(wired||typeof document==='undefined')return;wired=true;
    document.addEventListener('click',e=>{
      const target=e.target.closest?.('[data-goldenrod-event],[data-goldenrod-mode],[data-goldenrod-difficulty],[data-goldenrod-division],[data-goldenrod-type],[data-goldenrod-participant],[data-goldenrod-attack-type],[data-goldenrod-back],[data-goldenrod-next-round],[data-goldenrod-cabinet],[data-goldenrod-new-cup]');if(!target)return;
      if(target.matches('[data-goldenrod-event]')){const id=target.dataset.goldenrodEvent;if(!adapters()?.get?.(id))return;ui.eventId=id;ui.participantQuery='';ui.participantSort='stat-desc';ui.screen='modes';render();return;}
      if(target.matches('[data-goldenrod-mode]')){ui.mode=target.dataset.goldenrodMode;if(ui.mode==='exhibition'){ui.divisionId='rookie';ui.type=null;ui.difficulty='normal';ui.screen='difficulties';}else ui.screen='divisions';render();return;}
      if(target.matches('[data-goldenrod-difficulty]')){ui.difficulty=target.dataset.goldenrodDifficulty;ui.screen='participants';render();return;}
      if(target.matches('[data-goldenrod-division]')){ui.divisionId=target.dataset.goldenrodDivision;ui.screen=ui.mode==='type'?'types':'participants';render();return;}
      if(target.matches('[data-goldenrod-type]')){ui.type=target.dataset.goldenrodType;ui.screen='participants';render();return;}
      if(target.matches('[data-goldenrod-participant]')){chooseParticipant(target.dataset.goldenrodParticipant);return;}
      if(target.matches('[data-goldenrod-attack-type]')){const row=selectedParticipant(),owned=attackTypesFor(row),chosen=String(target.dataset.goldenrodAttackType||'').toLowerCase();if(!owned.includes(chosen))return;ui.attackType=chosen;launchSelectedParticipant();return;}
      if(target.matches('[data-goldenrod-next-round]')){launchRound();return;}
      if(target.matches('[data-goldenrod-cabinet]')){renderTrophyCabinet();return;}
      if(target.matches('[data-goldenrod-new-cup]')){newCup();return;}
      const back=target.dataset.goldenrodBack;if(back){ui.screen=back;render();}
    });
    document.addEventListener('input',e=>{const field=e.target?.closest?.('[data-goldenrod-participant-search]');if(!field)return;ui.participantQuery=field.value||'';refreshParticipantGrid();});
    document.addEventListener('change',e=>{const field=e.target?.closest?.('[data-goldenrod-participant-sort]');if(!field)return;const allowed=new Set(participantSortOptions(selectedAdapter()?.statKey).map(o=>o.value));ui.participantSort=allowed.has(field.value)?field.value:'stat-desc';refreshParticipantGrid();});
  }

  return Object.freeze({EVENTS,TYPE_ORDER,CUP_REWARDS,rewardForCup,eventCardsModel,flowSteps,renderEventCards,renderDifficultyOptions,participantSortOptions,sortParticipantRows,scoreboardModel,finalModel,open,close,startExhibition,startCup,launchRound,acceptRoundResult,settleCupOnce,abandonActiveCup,renderTrophyCabinet,activeCup});
});
