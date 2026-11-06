/* LuckyDex Substitute Test Lab. Isolated Classic30 experiments; never persists or awards rewards. */
(function(root,factory){
  const api=factory(
    typeof module==='object'&&module.exports?require('./tcgp-battle-data.js'):root.LuckyDexTCGPBattleData,
    typeof module==='object'&&module.exports?require('./tcgp-battle-core.js'):root.LuckyDexTCGPBattleCore,
    typeof module==='object'&&module.exports?require('./tcg-classic-decks.js'):root.LuckyDexClassicTCGDecks
  );
  if(typeof module==='object'&&module.exports)module.exports=api;
  else if(root)root.LuckyDexSubstituteLab=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(data,core,decks){
  'use strict';
  const appRoot=typeof globalThis!=='undefined'?globalThis:null;
  const ALL_ENERGY=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
  const CODES={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
  const STATUSES=['sleep','poison','burn','paralysis','confusion'];
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=s=>String(s||'').replace(/([a-z])([A-Z])/g,'$1 $2');
  const catalogue=(data.CLASSIC?.CARDS||[]).filter(c=>c?.id&&c.kind&&(c.kind==='pokemon'||c.kind==='trainer'||c.specialEnergy));
  let host=null,container=null,state=null,art=null,onBack=null,query='',setFilter='',selectedCard='',selectedSide='player',selectedZone='active',selectedIndex=0,energyType='Grass',message='',listener=null,sequence=0,autoFund=true,panel='',pileSide='player',pileKind='deck',pickerZone='hand',selectedUid='';
  const has=()=>!!state;
  const card=id=>data.cardById(id);
  const uid=()=>`lab-${++sequence}`;
  const board=side=>state?.sides?.[side];
  const slots=side=>[board(side)?.active,...(board(side)?.bench||[])].filter(Boolean);
  const slotAt=(side,zone='active',index=0)=>zone==='bench'?(board(side)?.bench||[]).find(s=>Number(s.benchSlot)===Number(index))||null:board(side)?.active||null;
  const selectedSlot=()=>slotAt(selectedSide,selectedZone,selectedIndex);
  const energyOf=slot=>Object.entries(slot?.energy||{}).filter(([,n])=>Number(n)>0).map(([t,n])=>`${t} ×${n}`).join(' · ')||'No Energy';
  const targetLabel=(side,zone,index)=>`${side==='player'?'You':'Opponent'} · ${zone==='active'?'Active':`Bench ${Number(index)+1}`}`;
  const appendLog=(type,extra={})=>state?.log?.push({type,side:selectedSide,lab:true,...extra});
  function create(){
    const ids=decks.LOANER_DECK.slice();
    if(ids.length!==30)throw new Error('Classic loaner deck must have 30 cards.');
    const st=core.createBattle({format:'classic',playerDeck:ids,opponentDeck:ids,firstSide:'player',seed:114115,playerEnergyTypes:ALL_ENERGY,opponentEnergyTypes:ALL_ENERGY});
    st.labMode=true;st.phase='battle';st.activeSide='player';
    for(const side of ['player','opponent']){
      const ss=st.sides[side];ss.active=core.makePokemonSlot('LAB-SUBSTITUTE',Math.max(1,ss.turnCount),uid());ss.bench=[];ss.benchLimit=5;
      ss.hand=[];ss.discard=[];ss.removed=[];ss.energyDiscard={};ss.prizesTaken=0;
      // Keep a normal 30-card deck and Prize pool for search, discard and Prize interactions.
      ss.energyAvailable=true;ss.energyUsed=false;ss.retreated=false;
    }
    st.log=[{type:'lab',side:'player',message:'Substitute targets are inert. Place real cards to test their actual effects.'}];
    return st;
  }
  function setSlot(side,zone,index,id){
    if(!has())throw new Error('Start the test lab first.');
    const ss=board(side),c=card(id);
    if(!c||c.kind!=='pokemon')throw new Error('Choose a Pokémon, not a Trainer, for a board position.');
    const fresh=core.makePokemonSlot(c.id,Math.max(0,ss.turnCount-1),uid());
    if(zone==='active'){ss.active=fresh;}else{
      const previous=slotAt(side,'bench',index);if(previous)ss.bench=ss.bench.filter(x=>x!==previous);
      fresh.benchSlot=Number(index);ss.bench.push(fresh);
    }
    appendLog('labPlace',{position:targetLabel(side,zone,index),cardId:c.id});
    return fresh;
  }
  function emptySlot(side,zone,index){const ss=board(side);if(zone==='active')ss.active=core.makePokemonSlot('LAB-SUBSTITUTE',ss.turnCount,uid());else ss.bench=ss.bench.filter(s=>Number(s.benchSlot)!==Number(index));}
  function giveCard(side,id,zone){
    const ss=board(side),c=card(id);if(!ss||!c)throw new Error('Unknown card.');
    const ref={uid:uid(),cardId:c.id};
    if(zone==='hand')ss.hand.push(ref);
    else if(zone==='discard')ss.discard.push(ref);
    else if(zone==='deck')ss.deck.unshift(ref);
    else if(zone==='prizes')ss.prizes.push(ref);
    else if(zone==='stadium'){if(c.trainerType!=='Stadium')throw new Error('Choose a Stadium Trainer.');state.stadium={cardId:c.id,ownerSide:side};}
    else throw new Error('Unknown zone.');
    appendLog('labGive',{cardId:c.id,zone,side});
  }
  const pileKinds=['deck','discard','hand','prizes','removed'];
  function refsAt(side,kind){if(!['player','opponent'].includes(side)||!pileKinds.includes(kind))throw new Error('Unknown card zone.');return board(side)?.[kind]||[];}
  function moveRef(side,kind,refUid,to='removed'){
    if(!pileKinds.includes(to))throw new Error('Unknown destination.');
    const from=refsAt(side,kind),idx=from.findIndex(ref=>String(ref.uid)===String(refUid));
    if(idx<0)throw new Error('That card is no longer in this pile.');
    if(to===kind)return;
    const [ref]=from.splice(idx,1);board(side)[to]=board(side)[to]||[];
    if(to==='deck')board(side)[to].unshift(ref);else board(side)[to].push(ref);
    appendLog('labMoveCard',{side,cardId:ref.cardId,from:kind,to});
    message=`${labelCard(ref.cardId)} moved to ${to==='removed'?'out of game':to}.`;
  }
  function adjustDamage(side,zone,index,delta){const s=slotAt(side,zone,index);if(!s)throw new Error('Select an occupied Pokémon slot.');s.damage=Math.max(0,Number(s.damage||0)+Number(delta||0));appendLog('labDamage',{cardId:s.cardId,damage:s.damage});}
  function adjustEnergy(side,zone,index,type,delta){
    if(!ALL_ENERGY.includes(type))throw new Error('Unknown Basic Energy type.');
    const s=slotAt(side,zone,index);if(!s)throw new Error('Select an occupied Pokémon slot.');
    s.energy=s.energy||{};s.energy[type]=Math.max(0,Number(s.energy[type]||0)+Number(delta||0));appendLog('labEnergy',{cardId:s.cardId,energyType:type,total:s.energy[type]});
  }
  function toggleStatus(side,zone,index,status){
    if(!STATUSES.includes(status))throw new Error('Unknown Special Condition.');
    const slot=slotAt(side,zone,index);if(!slot)throw new Error('Select an occupied Pokémon slot.');
    slot.conditions=slot.conditions||{};if(slot.conditions[status])delete slot.conditions[status];else slot.conditions[status]=true;
    appendLog('labStatus',{cardId:slot.cardId,status,enabled:!!slot.conditions[status]});
  }
  function activeSide(side){
    if(!['player','opponent'].includes(side))throw new Error('Unknown side.');
    if(state.phase==='effectChoice')throw new Error('Resolve the pending card choice before switching sides.');
    if(state.phase==='finished'){state.phase='battle';state.winner=null;state.reason=null;}
    state.activeSide=side;state.phase='battle';
    const ss=board(side);if(Number(ss.turnCount)<1)ss.turnCount=1;
    return ss;
  }
  function fundAttack(side,attack){
    const slot=board(side)?.active;if(!slot||!attack)return;
    const pool={...(slot.energy||{})},required=String(attack.cost||'');
    for(const symbol of required){const type=CODES[symbol];if(type){if(Number(pool[type]||0)>0){pool[type]--;continue;}slot.energy[type]=Number(slot.energy[type]||0)+1;}}
    const count=Object.values(slot.energy||{}).reduce((n,v)=>n+Number(v||0),0),need=required.length;
    if(count<need)slot.energy.Colorless=Number(slot.energy.Colorless||0)+(need-count);
  }
  function listActions(side){
    if(!has()||state.phase==='finished')return [];
    const who=state.phase==='effectChoice'?state.choiceSide:side;
    if(state.phase==='battle')activeSide(who);
    return core.legalActions(state,who);
  }
  function apply(index){
    if(!has())throw new Error('No active experiment.');
    const side=state.phase==='effectChoice'?state.choiceSide:selectedSide;
    if(state.phase==='battle')activeSide(side);
    const actions=core.legalActions(state,side),action=actions[Number(index)];
    if(!action)throw new Error('That action is no longer available.');
    if(action.type==='attack'&&autoFund){const attack=card(action.attackCardId||board(side).active?.cardId)?.attacks?.[action.attackIndex];fundAttack(side,attack);}
    core.applyAction(state,side,action);
    message=`${side==='player'?'Your':'Opponent'} action: ${actionName(action)}`;
    return state;
  }
  function nextTurn(){
    if(state.phase==='effectChoice')throw new Error('Resolve the pending choice first.');
    if(state.phase==='finished'){state.phase='battle';state.winner=null;state.reason=null;}
    state.turnNumber+=1;
    for(const ss of Object.values(state.sides)){
      ss.turnCount+=1;ss.energyAvailable=true;ss.energyUsed=false;ss.retreated=false;ss.supporterUsed=false;ss.stadiumUsed=false;
    }
    state.phase='battle';appendLog('labTurn',{turn:state.turnNumber});
  }
  function doCheckup(){if(state.phase==='effectChoice')throw new Error('Resolve the pending choice first.');core.checkup(state);}
  function actionName(a){
    if(a.type==='attack')return `${card(a.attackCardId||a.cardId)?.attacks?.[a.attackIndex]?.name||'Attack'}${choiceSuffix(a)}`;
    if(a.type==='ability')return `${card(a.cardId)?.abilities?.[a.abilityIndex]?.name||'Ability'}${choiceSuffix(a)}`;
    if(a.type==='trainer')return `${card(a.cardId)?.name||'Trainer'}${choiceSuffix(a)}`;
    if(a.type==='effectChoice')return `Choose ${card(a.choiceCardId)?.name||a.choiceCardId||a.choiceTarget||a.choiceOption||a.choiceHandIndex||a.choiceDeckIndex||'option'}${choiceSuffix(a)}`;
    return fmt(a.type||'Action')+choiceSuffix(a);
  }
  function choiceSuffix(a){return a.target?` · ${a.target}${a.benchIndex==null?'':` ${Number(a.benchIndex)+1}`}`:a.choiceTarget?` · ${a.choiceTarget}`:a.choiceOption!=null?` · ${a.choiceOption}`:'';}
  function labelCard(id){const c=card(id);return c?.name||String(id||'Empty');}
  function subArt(){return '<span class="tcgp-lab-sub-art" aria-hidden="true"><span class="tcgp-lab-sub-head">◕ ◕</span><span class="tcgp-lab-sub-body">◆</span></span>';}
  function artHtml(id){if(id==='LAB-SUBSTITUTE')return subArt();let src=art?.(id,'player');
    if(!src&&/^SNAP(?:FLORIO|FOUNJA)-\d{3}$/i.test(id)&&appRoot){const key=String(id).split('-')[0],num=String(id).split('-')[1],library=appRoot.LuckyDexCardArt;if(library?.isInstalled?.(key))src=library.localPath(key,`cards/${num}.webp`);}
    return src?`<img src="${esc(src)}" loading="lazy" alt="${esc(labelCard(id))}">`:'<span class="tcgp-lab-art-fallback">'+esc(labelCard(id))+'</span>';}
  // Render the sandbox with the *same* playmat, pile, card and bench classes as
  // normal Classic combat, rather than a separate side-by-side inspector board.
  function energyIcon(type,count=1){
    const ui=appRoot?.LuckyDexTCGPUIAssets;
    if(ui?.energyIconHtml)return ui.energyIconHtml(type,{count});
    return `<span class="tcgp-lab-energy-fallback" data-energy="${esc(type)}" title="${esc(type)} Energy">${esc(type[0])}${count>1?`×${count}`:''}</span>`;
  }
  function matStyle(side){
    const cosmetics=appRoot?.LuckyDexCosmeticsV0413,save=appRoot?.state||{};
    const entry=side==='player'?cosmetics?.activePlaymat?.(save):cosmetics?.playmatRegistry?.['pocket-eevee'];
    const url=String(entry?.artPath||cosmetics?.playmatRegistry?.['pocket-eevee']?.artPath||'');
    return url?`style="--tcgp-mat-image:url('${esc(url)}')"`:'';
  }
  function slotHtml(side,zone,index){
    const s=slotAt(side,zone,index),selected=selectedSide===side&&selectedZone===zone&&selectedIndex===index;
    const c=s?card(s.cardId):null,compact=zone==='bench',isDummy=s?.cardId==='LAB-SUBSTITUTE';
    const maxHp=Number(c?.hp||1000),hp=Math.max(0,maxHp-Number(s?.damage||0));
    const status=Object.keys(s?.conditions||{}).filter(key=>s.conditions[key]).map(key=>key.toUpperCase()).join(' · ');
    const basic=Object.entries(s?.energy||{}).filter(([,n])=>Number(n)>0).map(([type,n])=>energyIcon(type,Number(n))).join('');
    const specials=(s?.specialEnergy||[]).map(ref=>energyIcon(Object.keys(card(ref.cardId)?.effect?.provides||{})[0]||'Colorless')).join('');
    const content=s?(isDummy?subArt():artHtml(s.cardId)):'<span>'+esc(zone==='active'?'ACTIVE':'BENCH '+(index+1))+'</span>';
    return `<div data-board-slot="${side}-${zone}-${index}" class="tcgp-live-card-wrap tcgp-lab-position ${compact?'compact':''} ${selected?'tcgp-lab-selected':''}"><button type="button" class="tcgp-live-card ${compact?'compact':''} ${s?'':'empty'} ${isDummy?'tcgp-lab-dummy':''}" data-lab-action="slot" data-side="${side}" data-zone="${zone}" data-index="${index}" aria-pressed="${selected}" aria-label="${esc(targetLabel(side,zone,index))}: ${esc(c?.name||'empty')}${s?`, ${hp} HP, ${energyOf(s)}`:''}">${content}${s?`<span class="tcgp-live-hp">${hp}</span>${status?`<span class="tcgp-live-condition">${esc(status)}</span>`:''}${basic||specials?`<span class="tcgp-live-attached-energy">${basic}${specials}</span>`:''}`:''}</button>${s?`<small class="tcgp-lab-position-name">${esc(c?.name||s.cardId)}${Number(s.damage||0)?` · ${Number(s.damage)} dmg`:''}</small>`:''}</div>`;
  }
  function playmatHtml(side){
    const opponent=side==='opponent';
    return `<section class="tcgp-live-${opponent?'opponent':'player'} tcgp-live-mat-half" data-mat-side="${side}" ${matStyle(side)} aria-label="${opponent?'Opponent':'Your'} playmat"><div class="tcgp-live-${opponent?'opponent':'player'}-${opponent?'bench':'active'}" aria-label="${opponent?'Opponent Bench':'Your Active'}">${opponent?[0,1,2,3,4].map(i=>slotHtml(side,'bench',i)).join(''):slotHtml(side,'active',0)}</div>${!opponent?stadiumHtml():''}<div class="tcgp-live-${opponent?'opponent':'player'}-${opponent?'active':'bench'}" aria-label="${opponent?'Opponent Active':'Your Bench'}">${opponent?slotHtml(side,'active',0):[0,1,2,3,4].map(i=>slotHtml(side,'bench',i)).join('')}</div></section>`;
  }
  function stadiumHtml(){
    const id=state?.stadium?.cardId,info=id?card(id):null;
    return `<button type="button" class="tcgp-live-stadium-slot tcgp-lab-stadium" data-lab-action="open-cards" data-zone="stadium" aria-label="${id?`Replace Stadium ${esc(info?.name||id)}`:'Choose a Stadium card'}"><small>STADIUM</small>${id?`<div class="tcgp-lab-stadium-card">${artHtml(id)}<span>${esc(info?.name||id)}</span></div>`:'<span class="tcgp-lab-stadium-empty">No Stadium</span>'}</button>`;
  }
  function pileHtml(side,kind){
    const ss=board(side),discard=kind==='discard',list=ss?.[kind]||[],top=discard?list[list.length-1]:null;
    const discardedEnergy=Object.values(ss?.energyDiscard||{}).reduce((n,v)=>n+Number(v||0),0);
    return `<button type="button" data-lab-action="open-pile" data-side="${side}" data-kind="${kind}" class="tcgp-live-pile ${kind} ${side==='player'?'mine':''}" aria-label="Open ${side==='player'?'your':'opponent'} ${kind}, ${list.length} cards"><span class="tcgp-live-pile-card ${discard&&!top?'empty':''}">${top?artHtml(top.cardId):discard?'':'◆'}</span><b>${list.length}</b><small>${kind.toUpperCase()}</small>${discard&&discardedEnergy?`<span class="tcgp-live-pile-energy-count">⚡${discardedEnergy}</span>`:''}</button>`;
  }
  function opponentHandHtml(){
    const n=board('opponent')?.hand?.length||0,shown=Math.min(5,n);
    return `<button type="button" data-lab-action="open-hand" data-side="opponent" class="tcgp-live-hand-backs tcgp-lab-opponent-hand" style="--back-count:${shown}" aria-label="Open opponent hand, ${n} cards">${Array.from({length:shown},(_,i)=>`<i style="--i:${i}"></i>`).join('')}<b>${n}</b></button>`;
  }
  function playerHandHtml(){
    const hand=board('player')?.hand||[],shown=hand.slice(-5);
    return `<div class="tcgp-live-hand tcgp-lab-hand" aria-label="Your hand"><div class="tcgp-lab-hand-strip">${shown.map(ref=>`<button type="button" class="tcgp-lab-hand-card" data-lab-action="select-card" data-side="player" data-ref-uid="${esc(ref.uid)}" data-id="${esc(ref.cardId)}" aria-label="Open ${esc(labelCard(ref.cardId))} in hand">${artHtml(ref.cardId)}</button>`).join('')||'<span class="tcgp-live-hand-empty">Hand empty</span>'}</div><button type="button" class="tcgp-lab-hand-open" data-lab-action="open-hand" data-side="player">HAND ${hand.length} · VIEW ALL</button></div>`;
  }
  function battlefieldHtml(){
    const p=board('player'),o=board('opponent'),pending=state.phase==='effectChoice';
    const turnLabel=pending?'CARD CHOICE':selectedSide==='player'?'TEST YOUR TURN':'TEST CPU SIDE';
    return `<div class="tcgp-lab-board"><section class="tcgp-live-arena format-classic lental-wide-bench tcgp-lab-arena" aria-label="Classic TCG test battlefield"><section class="tcgp-live-opponent-top" aria-label="Opponent hand and piles">${pileHtml('opponent','discard')}${opponentHandHtml()}${pileHtml('opponent','deck')}</section>${playmatHtml('opponent')}<section class="tcgp-live-mid"><div class="tcgp-live-score tcgp-classic-score"><div class="tcgp-classic-score-numbers"><span>CPU PRIZES <b>${o.prizesTaken||0}</b>/5</span><i>·</i><span>YOU <b>${p.prizesTaken||0}</b>/5</span></div><small class="tcgp-classic-score-label">SANDBOX · NO REWARDS</small></div><div class="tcgp-live-mid-controls"><span>TURN ${Number(state.turnNumber||1)}</span><b>${esc(turnLabel)}</b><button type="button" class="tcgp-live-end-turn" data-lab-action="next-turn" ${pending?'disabled':''}>NEXT TURN</button></div></section>${playmatHtml('player')}<section class="tcgp-live-player-bottom" aria-label="Player hand and piles"><div class="tcgp-live-piles mine">${pileHtml('player','discard')}${pileHtml('player','deck')}</div>${playerHandHtml()}<button type="button" data-lab-action="open-tools" class="tcgp-live-energy-source" data-energy="${esc(energyType)}" aria-label="Open Energy setup tools, ${esc(energyType)}"><span>${energyIcon(energyType)}</span><small>ENERGY</small></button></section></section></div>`;
  }
  function catalogueHtml(){
    const tokens=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matching=catalogue.filter(c=>(!setFilter||c.setId===setFilter)&&tokens.every(t=>`${c.name} ${c.id} ${c.setId} ${c.kind} ${(c.types||[]).join(' ')}`.toLowerCase().includes(t)));
    const visible=matching.slice(0,70);
    const sets=[...new Map(catalogue.map(c=>[c.setId,c.setId==='SNAPFLORIO'?'Florio Nature Park':c.setId])).entries()];
    return `<section class="tcgp-lab-card-picker"><h3>Any Classic card <small>Ownership ignored · ${matching.length} matches</small></h3><div class="tcgp-lab-search"><input type="search" id="tcgpLabSearch" value="${esc(query)}" placeholder="Find a Pokémon, Trainer, Tool…"><select id="tcgpLabSet"><option value="">All sets</option>${sets.map(([id,name])=>`<option value="${esc(id)}" ${setFilter===id?'selected':''}>${esc(name)}</option>`).join('')}</select></div><div class="tcgp-lab-results">${visible.map(c=>`<button class="tcgp-lab-card-choice ${selectedCard===c.id?'selected':''}" data-lab-action="select-card" data-id="${esc(c.id)}" aria-pressed="${selectedCard===c.id}"><div>${artHtml(c.id)}</div><span>${esc(c.name)}</span><small>${esc(c.id)}${c.battleEnabled?'':' · Unverified'}</small></button>`).join('')||'<p>No matches.</p>'}</div>${matching.length>70?'<small>Showing 70; narrow your search.</small>':''}</section>`;
  }
  function controlsHtml(){const c=card(selectedCard),s=selectedSlot();return `<section class="tcgp-lab-controls"><h3>Experiment controls</h3><p><b>${esc(targetLabel(selectedSide,selectedZone,selectedIndex))}</b> · ${esc(s?labelCard(s.cardId):'Empty slot')}</p><div class="tcgp-lab-chips"><button data-lab-action="dummy">Place inert Substitute</button><button data-lab-action="clear">Clear slot</button><button data-lab-action="reset">New experiment</button></div><div class="tcgp-lab-picker-target"><span>Place chosen card on:</span>${['player','opponent'].map(side=>`<button data-lab-action="side" data-side="${side}" aria-pressed="${selectedSide===side}">${side==='player'?'Yours':'Opponent'}</button>`).join('')}</div><p>Selected card: <b>${esc(c?.name||'Select a card above')}</b></p><div class="tcgp-lab-chips">${['active','bench','hand','deck','discard','prizes'].map(z=>`<button data-lab-action="place" data-zone="${z}" ${c?'':'disabled'}>${z==='active'?'Set Active':z==='bench'?'Set Bench':`Add to ${z}`}</button>`).join('')}</div><div class="tcgp-lab-rule"><strong>Damage</strong><div class="tcgp-lab-chips">${[-100,-50,-10,10,50,100].map(n=>`<button data-lab-action="damage" data-value="${n}" ${s?'':'disabled'}>${n>0?'+':''}${n}</button>`).join('')}</div></div><div class="tcgp-lab-rule"><strong>Basic Energy</strong><div class="tcgp-lab-chips"><select id="tcgpLabEnergy">${ALL_ENERGY.map(t=>`<option value="${t}" ${energyType===t?'selected':''}>${t}</option>`).join('')}</select><button data-lab-action="energy" data-value="1" ${s?'':'disabled'}>Attach +1</button><button data-lab-action="energy" data-value="-1" ${s?'':'disabled'}>Remove −1</button><button data-lab-action="discard-energy" ${s?'':'disabled'}>Add discarded Energy</button></div></div><div class="tcgp-lab-rule"><strong>Special Conditions</strong><div class="tcgp-lab-chips">${STATUSES.map(t=>`<button data-lab-action="status" data-status="${t}" aria-pressed="${!!s?.conditions?.[t]}" ${s?'':'disabled'}>${esc(fmt(t))}</button>`).join('')}</div></div><div class="tcgp-lab-rule"><strong>Game state</strong><div class="tcgp-lab-chips"><button data-lab-action="next-turn">Reset turn actions</button><button data-lab-action="checkup">Run Pokémon Checkup</button><button data-lab-action="fund">Fund active attack costs</button><button data-lab-action="clear-hand">Clear chosen side’s hand</button></div></div><small>Energy, damage and card placement are manual setup tools. Attacks, abilities and Trainers below resolve through the real Classic engine.</small></section>`;}
  function actionsHtml(){const choosing=state.phase==='effectChoice',who=choosing?state.choiceSide:selectedSide;let acts=[],error='';try{acts=listActions(who)}catch(e){error=e.message;}const relevant=choosing?acts:acts.filter(a=>['attack','ability','trainer','stadiumAction','attachSpecial','endTurn'].includes(a.type));
    const prepared=!choosing&&board(who)?.active?.cardId!=='LAB-SUBSTITUTE'?(core.attackOptions?.(state,who)||[]):[];return `<section class="tcgp-lab-actions"><h3>${choosing?'Resolve printed card choice':`Trigger actual effects · ${who==='player'?'You':'Opponent'}`}</h3><small>${choosing?'Choose an option to let the real effect continue.':'No CPU actions or rewards. Use either side and attach enough Energy for attacks.'}</small>${error?`<p class="tcgp-lab-error">${esc(error)}</p>`:''}<div class="tcgp-lab-chips">${relevant.slice(0,65).map(a=>{const idx=acts.indexOf(a);return `<button data-lab-action="perform" data-index="${idx}" ${state.phase==='finished'?'disabled':''}>${esc(actionName(a))}</button>`;}).join('')||'<span>No legal actions. Set up an Active Pokémon, Energy or Trainer; or resolve the pending choice.</span>'}</div>${!choosing?`<div class="tcgp-lab-rule"><strong>Prepare an attack (add required Basic Energy if needed)</strong><div class="tcgp-lab-chips">${prepared.map(a=>`<button data-lab-action="prepare-attack" data-index="${Number(a.attackIndex)}" data-card="${esc(a.cardId)}">${esc(a.attack.name)}</button>`).join('')||'<small>Place a real attacking Pokémon to see its printed attacks.</small>'}</div></div><label class="tcgp-lab-autofund"><input type="checkbox" id="tcgpLabAutoFund" ${autoFund?'checked':''}> Automatically fund an attack when selected</label>`:''}</section>`;}
  function historyHtml(){return `<details class="tcgp-lab-history"><summary>Latest effects and rolls · ${state.log.length}</summary><ol>${(state.log||[]).slice(-20).reverse().map(e=>`<li>${esc(e.type)} · ${esc(e.rule||e.attack||e.reason||e.cardId||e.message||e.status||e.energyType||'')}${e.damage!=null?` · ${e.damage} damage`:''}${e.heads!=null?` · ${JSON.stringify(e.heads)}`:''}</li>`).join('')}</ol></details>`;}
  function zoneCardsHtml(side,kind){
    const cards=refsAt(side,kind);
    return `<div class="tcgp-lab-zone-grid">${cards.map(ref=>`<article class="tcgp-lab-zone-card" data-ref-uid="${esc(ref.uid)}"><div class="tcgp-lab-zone-art">${artHtml(ref.cardId)}${kind==='removed'?'':`<button type="button" class="tcgp-lab-remove-ref" data-lab-action="remove-ref" data-side="${side}" data-kind="${kind}" data-ref-uid="${esc(ref.uid)}" aria-label="Remove ${esc(labelCard(ref.cardId))} from the game" title="Remove from game">×</button>`}</div><b>${esc(labelCard(ref.cardId))}</b><div class="tcgp-lab-zone-moves">${kind!=='removed'&&kind!=='hand'?`<button type="button" data-lab-action="move-ref" data-side="${side}" data-kind="${kind}" data-ref-uid="${esc(ref.uid)}" data-to="hand">To hand</button>`:''}${kind==='removed'?`<button type="button" data-lab-action="move-ref" data-side="${side}" data-kind="removed" data-ref-uid="${esc(ref.uid)}" data-to="deck">Restore</button>`:''}</div></article>`).join('')||'<p class="tcgp-lab-empty-zone">No cards in this zone.</p>'}</div>`;
  }
  function panelContents(){
    const c=card(selectedCard),slot=selectedSlot(),who=pileSide==='player'?'Your':'Opponent';
    if(panel==='pile'||panel==='hand'){
      const kind=panel==='hand'?'hand':pileKind,side=panel==='hand'?pileSide:pileSide;
      const choices=['deck','discard','hand','prizes','removed'].map(k=>`<button type="button" data-lab-action="open-pile" data-side="${side}" data-kind="${k}" class="${kind===k?'selected':''}">${fmt(k)} ${refsAt(side,k).length}</button>`).join('');
      return `<div class="tcgp-lab-zone-tabs">${choices}</div>${zoneCardsHtml(side,kind)}<button type="button" data-lab-action="open-cards" data-zone="${kind==='removed'?'deck':kind}" data-side="${side}" class="tcgp-lab-sheet-primary">+ Add a card to ${kind==='removed'?'deck':kind}</button>`;
    }
    if(panel==='cards')return `<div class="tcgp-lab-picker-target"><span>Give to</span>${['player','opponent'].map(side=>`<button data-lab-action="side" data-side="${side}" aria-pressed="${selectedSide===side}">${side==='player'?'YOU':'CPU'}</button>`).join('')}</div>${c?`<div class="tcgp-lab-picker-commit"><strong>${esc(c.name)}</strong><small>Tap a destination below; ownership is ignored</small><div class="tcgp-lab-chips">${['active','bench','hand','deck','discard','prizes'].map(zone=>`<button type="button" data-lab-action="place" data-zone="${zone}" ${((zone==='active'||zone==='bench')&&c.kind!=='pokemon')?'disabled':''}>${zone==='active'?'Active':zone==='bench'?'Bench':fmt(zone)}</button>`).join('')}${c.trainerType==='Stadium'?'<button data-lab-action="place" data-zone="stadium">Stadium</button>':''}</div></div>`:''}${pickerZone==='stadium'?`<p class="tcgp-lab-picker-note">Choose a Stadium card, then tap Stadium to place it.</p>`:''}${state.stadium?.cardId?`<button type="button" data-lab-action="clear-stadium">Remove current Stadium</button>`:''}${catalogueHtml()}`;
    if(panel==='slot')return `<div class="tcgp-lab-selected-card">${slot?artHtml(slot.cardId):''}<div><strong>${esc(slot?labelCard(slot.cardId):'Empty position')}</strong><small>${esc(targetLabel(selectedSide,selectedZone,selectedIndex))}</small><small>${slot?`${Number(slot.damage||0)} damage · ${esc(energyOf(slot))}`:'Tap Cards to place a Pokémon'}</small></div></div><div class="tcgp-lab-chips"><button type="button" data-lab-action="open-cards" data-zone="${selectedZone}" data-side="${selectedSide}">+ Set Pokémon</button><button data-lab-action="dummy">Substitute</button><button data-lab-action="clear">Clear slot</button></div><div class="tcgp-lab-rule"><strong>Damage</strong><div class="tcgp-lab-chips">${[-100,-10,10,100].map(n=>`<button data-lab-action="damage" data-value="${n}" ${slot?'':'disabled'}>${n>0?'+':''}${n}</button>`).join('')}</div></div><div class="tcgp-lab-rule"><strong>Basic Energy</strong><div class="tcgp-lab-chips"><select id="tcgpLabEnergy">${ALL_ENERGY.map(t=>`<option ${energyType===t?'selected':''}>${t}</option>`).join('')}</select><button data-lab-action="energy" data-value="1" ${slot?'':'disabled'}>+1</button><button data-lab-action="energy" data-value="-1" ${slot?'':'disabled'}>−1</button></div></div><div class="tcgp-lab-rule"><strong>Conditions</strong><div class="tcgp-lab-chips">${STATUSES.map(t=>`<button data-lab-action="status" data-status="${t}" aria-pressed="${!!slot?.conditions?.[t]}" ${slot?'':'disabled'}>${esc(fmt(t))}</button>`).join('')}</div></div><button type="button" class="tcgp-lab-sheet-primary" data-lab-action="open-actions">Test printed attacks / effects</button>`;
    if(panel==='actions')return actionsHtml();
    if(panel==='tools')return `<div class="tcgp-lab-selected-card"><div><strong>${esc(targetLabel(selectedSide,selectedZone,selectedIndex))}</strong><small>Advanced experiment setup</small></div></div>${controlsHtml()}`;
    if(panel==='log')return `<div class="tcgp-lab-rule">${historyHtml()}</div>`;
    return '';
  }
  function panelHtml(){
    if(!panel)return '';
    const titles={pile:`${pileSide==='player'?'Your':'CPU'} ${fmt(pileKind)}`,hand:`${pileSide==='player'?'Your':'CPU'} hand`,cards:'All Classic Cards',slot:targetLabel(selectedSide,selectedZone,selectedIndex),actions:'Test actions',tools:'Experiment tools',log:'Effect history'};
    return `<div class="tcgp-lab-modal" role="presentation"><button type="button" class="tcgp-lab-modal-scrim" data-lab-action="close-panel" aria-label="Close panel"></button><section class="tcgp-lab-sheet" role="dialog" aria-modal="true" aria-label="${esc(titles[panel]||'Test Lab panel')}"><header><b>${esc(titles[panel]||'Test Lab')}</b><button type="button" data-lab-action="close-panel" aria-label="Close menu">×</button></header><div class="tcgp-lab-sheet-scroll">${panelContents()}</div></section></div>`;
  }
  function render(){
    if(!container||!state)return;
    const pending=state.phase==='effectChoice',winner=state.phase==='finished';
    container.innerHTML=`<div class="tcgp-substitute-lab format-classic"><header class="tcgp-lab-compact-header"><b>SUBSTITUTE LAB</b><span>${winner?'ENDED':pending?'CHOICE':`TURN ${Number(state.turnNumber||1)}`}</span><button type="button" data-lab-action="reset" aria-label="Reset lab">↻ Reset</button></header>${battlefieldHtml()}<nav class="tcgp-lab-dock" aria-label="Test Lab tools"><button type="button" data-lab-action="open-cards" data-zone="hand">＋ Cards</button><button type="button" data-lab-action="open-actions">⚔ Actions</button><button type="button" data-lab-action="open-tools">⚙ Tools</button><button type="button" data-lab-action="open-log">☷ Log</button></nav>${message?`<div class="tcgp-lab-toast" role="status" aria-live="polite">${esc(message)}</div>`:''}${panelHtml()}</div>`;
  }
  function onClick(event){
    const btn=event.target.closest?.('[data-lab-action]');if(!btn||!container?.contains(btn))return;
    const a=btn.dataset.labAction;
    try{
      if(a==='exit'){const cb=onBack;close();cb?.();return;}
      if(a==='close-panel'){panel='';render();return;}
      if(a==='open-pile'){pileSide=btn.dataset.side;pileKind=btn.dataset.kind;selectedSide=pileSide;panel='pile';}
      if(a==='open-hand'){pileSide=btn.dataset.side;selectedSide=pileSide;panel='hand';}
      if(a==='open-cards'){if(btn.dataset.side)selectedSide=btn.dataset.side;pickerZone=btn.dataset.zone||'hand';panel='cards';}
      if(a==='open-tools')panel='tools';
      if(a==='open-actions')panel='actions';
      if(a==='open-log')panel='log';
      if(a==='slot'){selectedSide=btn.dataset.side;selectedZone=btn.dataset.zone;selectedIndex=Number(btn.dataset.index)||0;panel='slot';}
      if(a==='side')selectedSide=btn.dataset.side;
      if(a==='select-card'){
        selectedCard=btn.dataset.id;
        if(btn.dataset.refUid){selectedUid=btn.dataset.refUid;pileSide=btn.dataset.side||'player';selectedSide=pileSide;panel='hand';}
      }
      if(a==='remove-ref')moveRef(btn.dataset.side,btn.dataset.kind,btn.dataset.refUid,'removed');
      if(a==='move-ref')moveRef(btn.dataset.side,btn.dataset.kind,btn.dataset.refUid,btn.dataset.to);
      if(a==='place'){
        const zone=btn.dataset.zone;if(!selectedCard)throw new Error('Select a card first.');
        if(zone==='active'||zone==='bench')setSlot(selectedSide,zone,selectedIndex,selectedCard);
        else giveCard(selectedSide,selectedCard,zone);
        message=`Added ${labelCard(selectedCard)} to ${selectedSide==='player'?'your':'CPU'} ${zone}.`;
      }
      if(a==='clear-stadium'){state.stadium=null;message='Removed Stadium from this experiment.';}
      if(a==='dummy')setSlot(selectedSide,selectedZone,selectedIndex,'LAB-SUBSTITUTE');
      if(a==='clear')emptySlot(selectedSide,selectedZone,selectedIndex);
      if(a==='damage')adjustDamage(selectedSide,selectedZone,selectedIndex,Number(btn.dataset.value));
      if(a==='energy')adjustEnergy(selectedSide,selectedZone,selectedIndex,energyType,Number(btn.dataset.value));
      if(a==='discard-energy'){const ss=board(selectedSide);ss.energyDiscard[energyType]=Number(ss.energyDiscard[energyType]||0)+1;}
      if(a==='status')toggleStatus(selectedSide,selectedZone,selectedIndex,btn.dataset.status);
      if(a==='perform')apply(btn.dataset.index);
      if(a==='prepare-attack'){const side=selectedSide;activeSide(side);const attack=card(btn.dataset.card)?.attacks?.[Number(btn.dataset.index)];if(!attack)throw new Error('Attack no longer exists.');fundAttack(side,attack);message=`Prepared ${attack.name}: choose its action to trigger.`;}
      if(a==='next-turn')nextTurn();
      if(a==='checkup')doCheckup();
      if(a==='clear-hand')board(selectedSide).hand=[];
      if(a==='fund'){const s=board(selectedSide)?.active,c=card(s?.cardId);for(const attack of c?.attacks||[])fundAttack(selectedSide,attack);}
      if(a==='reset'){state=create();panel='';message='New isolated experiment';}
      render();
    }catch(error){message=error.message||String(error);render();}
  }
  function onInput(event){const t=event.target;if(t.id==='tcgpLabAutoFund'){autoFund=!!t.checked;return;}if(t.id==='tcgpLabEnergy'){energyType=t.value;return;}if(t.id==='tcgpLabSearch'||t.id==='tcgpLabSet'){
    if(t.id==='tcgpLabSearch')query=t.value;else setFilter=t.value;
    const focused=t.id==='tcgpLabSearch',pos=focused?t.selectionStart:null;render();if(focused){const input=container?.querySelector('#tcgpLabSearch');input?.focus();try{input?.setSelectionRange(pos,pos);}catch(_){}}
  }}
  function open(options={}){
    close();host=options;container=options.container;art=options.art||null;onBack=options.onBack||null;query='';setFilter='';selectedCard='';selectedUid='';selectedSide='player';selectedZone='active';selectedIndex=0;panel='';pileSide='player';pileKind='deck';pickerZone='hand';message='';autoFund=true;sequence=0;state=create();
    if(!container)throw new Error('The Test Lab needs a battle container.');
    listener={click:onClick,input:onInput,change:onInput};container.addEventListener('click',listener.click);container.addEventListener('input',listener.input);container.addEventListener('change',listener.change);render();
  }
  function handleBack(){if(panel){panel='';render();return true;}return false;}
  function close(){if(container&&listener){container.removeEventListener('click',listener.click);container.removeEventListener('input',listener.input);container.removeEventListener('change',listener.change);}listener=null;container=null;host=null;state=null;onBack=null;}
  return {open,close,handleBack,moveRef,getState:()=>state,catalogue,create,setSlot,emptySlot,giveCard,adjustDamage,adjustEnergy,toggleStatus,activeSide,fundAttack,listActions,apply,nextTurn};
});
