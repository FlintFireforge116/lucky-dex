(function(root){
  'use strict';
  const core=root.LuckyDexRouletteCore;
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const session=()=>root.LuckyDexArcadeSession;
  const platform=()=>root.LuckyDexArcadePlatform;
  let opened=false,spinning=false,selectedBet=null,lastResult=null,ballTurns=4,wheelTurns=2,spinTimer=null,resultTimer=null;

  function state(){return root.state||globalThis.state;}
  function odds(){return {service:.02,rescue:.02,golden:.004,...((state()?.settings?.rareOdds)||{})};}
  function rec(){
    const s=state(),p=platform();if(!s||!p)return null;s.arcade=p.ensureArcadeState(s.arcade);return s.arcade.roulette;
  }
  function save(){root.save?.();root.renderProfile?.();}
  function money(){return Math.max(0,Math.round(Number(state()?.profile?.coins)||0));}
  function sprite(id){return `arcade/sprites/actors/pokemon/${id}.png`;}
  function title(s){return String(s||'').replace(/^./,c=>c.toUpperCase());}
  function formatMultiplier(value){return core?.formatMultiplier?core.formatMultiplier(value):String(Math.round((Number(value)||0)*100)/100);}
  function randomServiceDay(){return Math.random()<Math.max(0,Math.min(1,Number(odds().rouletteServiceDay??odds().service)||0));}
  function active(){return rec()?.activeTable||null;}
  function round(){return core.createRound(active()?.round||{});}
  function currentStake(){const t=active();return core.tableStakes(!!t?.round?.serviceDay)[Number(t?.round?.tableIndex)===1?1:0];}

  function freshTable(tableIndex=0){
    const r=rec();if(!r)return false;
    const serviceDay=randomServiceDay(),idx=Number(tableIndex)===1?1:0;
    r.activeTable={round:core.createRound({serviceDay,tableIndex:idx}),spins:0,wins:0,wagered:0,payout:0,goldenBalls:0,goldenSlots:[],startedAt:Date.now()};
    if(serviceDay)r.serviceDaysSeen=Number(r.serviceDaysSeen||0)+1;
    selectedBet=null;lastResult=null;ballTurns=4;wheelTurns=2;spinning=false;save();session()?.hideResult?.();session()?.mount?.('roulette',$('rouletteGame'));render();return true;
  }
  function ensureTable(){const a=active();if(!a||a.round?.complete)return freshTable(a?.round?.tableIndex||0);session()?.mount?.('roulette',$('rouletteGame'));if(a.pendingSpin){const p=a.pendingSpin;spinning=true;finalizeSpin(p.result,p.stake,p.mult,p.bet);return true;}render();return true;}

  function betKey(bet){if(!bet)return'';if(bet.kind==='slot')return`slot:${bet.slotKey}`;if(bet.kind==='pokemon')return`pokemon:${bet.pokemon}`;return`color:${bet.color}`;}
  function chooseBet(bet){if(spinning)return false;const r=round();if(!core.matchingSlots(r,bet).length)return false;selectedBet=bet;render();return true;}
  function setTable(index){const a=active();if(!a||spinning||Number(a.spins||0)>0)return false;a.round=core.createRound({...a.round,tableIndex:Number(index)===1?1:0});selectedBet=null;save();render();return true;}
  function isCovered(slot,isOccupied){return !isOccupied&&!!selectedBet&&core.betMatches(slot,selectedBet);}

  function renderWheel(r){
    const host=$('rouletteWheelSlots');if(!host)return;
    const occupied=new Set(r.occupied||[]),goldenSlots=new Set(active()?.goldenSlots||[]),slots=core.WHEEL_SLOTS||core.SLOTS;
    host.innerHTML=slots.map((slot,i)=>{const isOcc=occupied.has(slot.key),covered=isCovered(slot,isOcc),winning=!!lastResult?.won&&lastResult.slotKey===slot.key;return`<div class="roulette-wheel-slot roulette-${slot.color}${isOcc?' occupied':''}${covered?' bet-covered':''}${winning?' winning':''}" style="--i:${i}" title="${slot.pokemon} · ${title(slot.color)}"><span class="roulette-wheel-icon"><img src="${sprite(slot.pokemonId)}" alt="${slot.pokemon}"></span><span class="roulette-wheel-pocket" aria-hidden="true">${isOcc?`<b class="${goldenSlots.has(slot.key)?'golden':'silver'}"></b>`:''}</span></div>`;}).join('');
  }
  function renderBetBoard(r){
    const host=$('rouletteBetBoard');if(!host)return;const occupied=new Set(r.occupied||[]),selected=betKey(selectedBet);
    const colorHeads=core.COLORS.map(color=>{const bet={kind:'color',color},m=core.multiplierFor(r,bet),disabled=!m;return`<button type="button" data-rbet-color="${color}" class="roulette-board-head roulette-${color}${selected===betKey(bet)?' selected':''}" ${disabled?'disabled':''}><b>${title(color)}</b><small>×${formatMultiplier(m)}</small></button>`;}).join('');
    const rows=core.POKEMON.map(p=>{const pbet={kind:'pokemon',pokemon:p.name},m=core.multiplierFor(r,pbet);return`<div class="roulette-board-row"><button type="button" class="roulette-pokemon-bet${selected===betKey(pbet)?' selected':''}" data-rbet-pokemon="${p.name}" ${m?'':'disabled'}><img src="${sprite(p.id)}" alt=""><span>${p.name}<small>×${formatMultiplier(m)}</small></span></button>${core.COLORS.map(color=>{const key=`${p.key}:${color}`,sbet={kind:'slot',slotKey:key},isOcc=occupied.has(key),slot=core.SLOTS.find(s=>s.key===key),covered=isCovered(slot,isOcc),winning=!!lastResult?.won&&lastResult.slotKey===key;return`<button type="button" class="roulette-cell roulette-${color}${isOcc?' occupied':''}${selected===betKey(sbet)?' selected':''}${covered?' bet-covered':''}${winning?' winning':''}" data-rbet-slot="${key}" ${isOcc?'disabled':''}><img src="${sprite(p.id)}" alt=""><small>${isOcc?'BALL':`×${formatMultiplier(core.multiplierFor(r,sbet))}`}</small></button>`;}).join('')}</div>`;}).join('');
    host.innerHTML=`<div class="roulette-board-grid"><div class="roulette-board-corner">BET</div>${colorHeads}${rows}</div>`;
  }
  function render(){
    const a=active();if(!a)return;const r=round(),stakes=core.tableStakes(r.serviceDay),stake=currentStake(),mult=selectedBet?core.multiplierFor(r,selectedBet):0,potential=mult?Math.round(stake*mult):0;
    if($('rouletteCoins'))$('rouletteCoins').textContent=money().toLocaleString('en-GB');
    if($('rouletteBallCount'))$('rouletteBallCount').textContent=String(Math.max(0,6-r.occupied.length));
    if($('rouletteService')){$('rouletteService').hidden=!r.serviceDay;$('rouletteService').textContent='POKÉMON NEWS · SERVICE DAY · HIGH TABLE 150';}
    document.querySelectorAll('[data-roulette-table]').forEach(btn=>{const index=Number(btn.dataset.rouletteTable)||0;btn.classList.toggle('active',index===r.tableIndex);btn.disabled=spinning||Number(a.spins||0)>0;btn.querySelector('b').textContent=`${stakes[index]} COINS`;});
    renderWheel(r);renderBetBoard(r);
    const sel=$('rouletteSelection');if(sel)sel.innerHTML=selectedBet?`<small>YOUR BET</small><b>${core.describeBet(selectedBet)}</b><span>${stake} coins · ×${formatMultiplier(mult)} · returns ${potential}</span>`:`<small>YOUR BET</small><b>Choose a slot, Pokémon or colour</b><span>${stake} coins per spin</span>`;
    const spin=$('rouletteSpinBtn');if(spin){spin.disabled=spinning||!selectedBet||money()<stake||r.complete;spin.textContent=spinning?'SPINNING…':money()<stake?`NEED ${stake} COINS`:`SPIN · ${stake}`;}
    session()?.update?.('roulette',{runText:'6 balls · occupied slots stay blocked · hit chances improve as the wheel fills',rewardText:'live fair multipliers · rare Golden Ball jackpot',liveLabel:'BALLS',liveValue:`${r.occupied.length}/6`});
  }

  function showRescue(kind){const box=$('rouletteRescue');if(!box)return;const id=kind==='shroomish'?285:276,name=kind==='shroomish'?'SHROOMISH BOUNCE!':'TAILLOW RESCUE!';box.innerHTML=`<img src="${sprite(id)}" alt=""><b>${name}</b><span>The stuck ball is back in play.</span>`;box.hidden=false;setTimeout(()=>{if(box)box.hidden=true;},1200);}
  function setMessage(html,kind=''){const m=$('rouletteMessage');if(!m)return;m.className=`roulette-message ${kind}`;m.innerHTML=html;}
  function showResultFlash(result,payout,betPayout,goldenBonus){
    const flash=$('rouletteResultFlash');if(!flash)return;
    if(resultTimer){clearTimeout(resultTimer);resultTimer=null;}
    if(!(result.won||result.golden)){flash.hidden=true;return;}
    flash.className=`roulette-result-flash ${result.golden?'golden':'win'}`;
    flash.innerHTML=result.golden?`<small>GOLDEN BALL!</small><b>+${payout}</b><span>${result.won?`BET +${betPayout} · `:''}GOLD +${goldenBonus}</span>`:`<small>WIN!</small><b>+${payout}</b><span>${result.slot.pokemon} · ${title(result.slot.color)}</span>`;
    flash.hidden=false;document.querySelector?.('.roulette-wallet')?.classList.add('win-pulse');
    resultTimer=setTimeout(()=>{resultTimer=null;flash.hidden=true;document.querySelector?.('.roulette-wallet')?.classList.remove('win-pulse');lastResult=null;render();},1450);
  }
  function applyWallet(delta){const s=state();if(!s)return 0;s.profile.coins=Math.max(0,Math.round(Number(s.profile.coins)||0)+Math.round(Number(delta)||0));save();return s.profile.coins;}

  function finishTable(){
    const r=rec(),a=r?.activeTable;if(!r||!a)return;
    r.tablesCompleted=Number(r.tablesCompleted||0)+1;r.gamesPlayed=Number(r.gamesPlayed||0)+1;
    state().stats.arcadeGames=Number(state().stats.arcadeGames||0)+1;
    const net=Number(a.payout||0)-Number(a.wagered||0),service=!!a.round?.serviceDay;
    const review={title:'ROULETTE TABLE COMPLETE',mode:'Mauville Roulette',difficulty:service?'Service Day':'Standard',metricLabel:'NET',metricValue:`${net>=0?'+':''}${net} COINS`,stats:[{label:'Balls Played',value:'6 / 6'},{label:'Wins',value:String(a.wins||0)},{label:'Golden Balls',value:String(a.goldenBalls||0)},{label:'Wagered',value:`${a.wagered||0} coins`},{label:'Returned',value:`${a.payout||0} coins`},{label:'Table',value:`${core.tableStakes(service)[a.round.tableIndex]} coin${service&&a.round.tableIndex===1?' · SERVICE DAY':''}`}],pbs:[{label:'Best Single Payout',value:`${r.bestPayout||0} coins`,isNew:Number(a.bestPayout||0)>=Number(r.bestPayout||0)&&Number(a.bestPayout||0)>0},{label:'Biggest Multiplier',value:`×${formatMultiplier(r.biggestMultiplier||0)}`,isNew:Number(a.biggestMultiplier||0)>=Number(r.biggestMultiplier||0)&&Number(a.biggestMultiplier||0)>0}],rewards:[{label:'Net Table Result',value:`${net>=0?'+':''}${net} Lucky Coins`} ]};
    save();session()?.showResult?.('roulette',{title:net>=0?'TABLE WIN!':'TABLE COMPLETE',metricLabel:'NET',metricValue:`${net>=0?'+':''}${net}`,coinsAwarded:Math.max(0,net),bestText:service?'SERVICE DAY TABLE':'6 BALLS SETTLED',review,onReplay:()=>freshTable(a.round.tableIndex),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
  }

  function finalizeSpin(result,stake,mult,bet){
    const r=rec(),a=r?.activeTable;if(!r||!a||!a.pendingSpin)return;const settledBet=bet||a.pendingSpin.bet||selectedBet;if(!settledBet)return;
    const betPayout=result.won?Math.round(stake*mult):0,goldenBonus=result.golden?core.goldenPrizeForStake(stake):0,payout=betPayout+goldenBonus;
    a.round=result.round;a.spins=Number(a.spins||0)+1;a.wagered=Number(a.wagered||0)+stake;a.payout=Number(a.payout||0)+payout;if(result.won)a.wins=Number(a.wins||0)+1;
    a.bestPayout=Math.max(Number(a.bestPayout||0),payout);a.biggestMultiplier=Math.max(Number(a.biggestMultiplier||0),result.won?mult:0);
    r.spins=Number(r.spins||0)+1;r.coinsWagered=Number(r.coinsWagered||0)+stake;
    if(result.won){r.wins=Number(r.wins||0)+1;r.biggestMultiplier=Math.max(Number(r.biggestMultiplier||0),mult);r.betKindsWon={slot:0,pokemon:0,color:0,...(r.betKindsWon||{})};r.betKindsWon[settledBet.kind]=Number(r.betKindsWon[settledBet.kind]||0)+1;if(settledBet.kind==='slot')r.exactWins=Number(r.exactWins||0)+1;if(settledBet.kind==='pokemon')r.pokemonWins=Number(r.pokemonWins||0)+1;if(settledBet.kind==='color')r.colorWins=Number(r.colorWins||0)+1;}
    if(payout>0){r.coinsWon=Number(r.coinsWon||0)+payout;r.bestPayout=Math.max(Number(r.bestPayout||0),payout);applyWallet(payout);}const wager=stake;const earned=Math.max(0,payout-wager);if(earned>0){const s=state();s.stats=s.stats||{};s.stats.arcadeCoins=Number(s.stats.arcadeCoins||0)+earned;root.bumpDaily?.('arcadeCoins',earned);}
    if(result.golden){a.goldenBalls=Number(a.goldenBalls||0)+1;a.goldenSlots=[...(Array.isArray(a.goldenSlots)?a.goldenSlots:[]),result.slot.key];r.goldenBalls=Number(r.goldenBalls||0)+1;r.goldenBallCoins=Number(r.goldenBallCoins||0)+goldenBonus;}
    if(result.rescue){r.rescueEvents=Number(r.rescueEvents||0)+1;r[`${result.rescue}Rescues`]=Number(r[`${result.rescue}Rescues`]||0)+1;showRescue(result.rescue);}
    if(a.round.serviceDay)r.serviceDaySpins=Number(r.serviceDaySpins||0)+1;
    a.pendingSpin=null;lastResult={slotKey:result.slot.key,won:!!result.won,golden:!!result.golden,payout};
    if(result.golden){setMessage(result.won?`<b>GOLDEN BALL · WIN!</b><span>${result.slot.pokemon} · ${title(result.slot.color)} · bet +${betPayout} · gold +${goldenBonus} · total +${payout}</span>`:`<b>GOLDEN BALL · +${goldenBonus}!</b><span>${result.slot.pokemon} · ${title(result.slot.color)} landed · your bet missed, but the gold prize pays.</span>`,'golden');}
    else setMessage(result.won?`<b>WIN · ${core.describeBet(settledBet).toUpperCase()}</b><span>${result.slot.pokemon} · ${title(result.slot.color)} landed · ×${formatMultiplier(mult)} · +${payout} coins</span>`:`<b>${result.slot.pokemon.toUpperCase()} · ${result.slot.color.toUpperCase()}</b><span>No payout · ${12-a.round.occupied.length} slots remain</span>`,result.won?'win':'lose');
    selectedBet=null;spinning=false;save();render();showResultFlash(result,payout,betPayout,goldenBonus);if(a.round.complete)setTimeout(finishTable,1500);
  }

  function spin(){
    if(spinning||!selectedBet)return false;const a=active(),r=round(),stake=currentStake(),mult=core.multiplierFor(r,selectedBet);if(!a||r.complete||!mult||money()<stake)return false;
    const bet={...selectedBet};const result=core.resolveSpin(r,bet,{rescueRate:Number(odds().rouletteRescue??odds().rescue)||0,goldenRate:Number(odds().rouletteGoldenBall??odds().golden)||0,random:Math.random});if(!result.accepted)return false;
    spinning=true;a.pendingSpin={result,stake,mult,bet};applyWallet(-stake);
    const slots=core.WHEEL_SLOTS||core.SLOTS,idx=slots.findIndex(s=>s.key===result.slot.key),ball=$('rouletteBall'),rotor=$('rouletteWheelRotor');
    wheelTurns+=6;ballTurns+=9;
    if(rotor){rotor.classList.add('spinning');rotor.style.setProperty('--roulette-wheel-angle',`${wheelTurns*360}deg`);}
    if(ball){ball.classList.add('spinning');ball.classList.toggle('golden',!!result.golden);ball.style.setProperty('--roulette-angle',`${-(ballTurns*360)+idx*30}deg`);}
    setMessage(result.golden?'<b>GOLDEN BALL IN PLAY!</b><span>Rare prize ball · 10× stake bonus if it settles.</span>':'<b>THE BALL IS SPINNING…</b><span>Wheel and ball are in motion.</span>',result.golden?'golden':'spin');render();
    spinTimer=setTimeout(()=>{spinTimer=null;ball?.classList.remove('spinning');rotor?.classList.remove('spinning');finalizeSpin(result,stake,mult,bet);},3200);return true;
  }

  function open(){opened=true;ensureTable();return true;}
  function close(){opened=false;if(spinTimer){clearTimeout(spinTimer);spinTimer=null;}if(resultTimer){clearTimeout(resultTimer);resultTimer=null;}$('rouletteBall')?.classList.remove('spinning');$('rouletteWheelRotor')?.classList.remove('spinning');spinning=false;lastResult=null;save();return true;}
  function install(){
    if(typeof document==='undefined')return;
    $('rouletteSpinBtn')?.addEventListener('click',spin);
    document.addEventListener('click',e=>{
      if(!opened)return;const table=e.target.closest('[data-roulette-table]');if(table){setTable(table.dataset.rouletteTable);return;}
      const slot=e.target.closest('[data-rbet-slot]');if(slot){chooseBet({kind:'slot',slotKey:slot.dataset.rbetSlot});return;}
      const pokemon=e.target.closest('[data-rbet-pokemon]');if(pokemon){chooseBet({kind:'pokemon',pokemon:pokemon.dataset.rbetPokemon});return;}
      const color=e.target.closest('[data-rbet-color]');if(color)chooseBet({kind:'color',color:color.dataset.rbetColor});
    });
  }
  const api={open,close,spin,chooseBet,setTable,freshTable,render};root.LuckyDexRoulette=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;install();
})(typeof window!=='undefined'?window:globalThis);
