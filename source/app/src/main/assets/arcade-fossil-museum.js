(function(root){
  'use strict';
  const core=root.LuckyDexFossilMuseumCore;
  let dig=null,selectedTool='pickaxe',haul=[],cardReveals=[],pendingCoins=0,finishing=false,bannerTimer=0,markupReady=false,pendingBoosterQueue=[],pendingFinishResult=null;
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const bridge=()=>root.LuckyDexFossilMuseumBridge||null;
  const rareOdds=()=>({fossilCard:.15,fossilPack:.04,...(bridge()?.getState?.()?.settings?.rareOdds||{})});
  const session=()=>root.LuckyDexArcadeSession||null;
  const MUSEUM_CASES={
    // Percent coordinates are relative to the genuine 576×400 Oreburgh room image.
    topA:{x:49.7,y:15.0,itemW:2.7,slots:[[-3.0,0],[0,0],[3.0,0]]},
    topB:{x:60.4,y:15.0,itemW:2.7,slots:[[-3.0,0],[0,0],[3.0,0]]},
    topC:{x:71.0,y:15.0,itemW:2.7,slots:[[-3.0,0],[0,0],[3.0,0]]},
    innerUpper:{x:69.5,y:54.4,itemW:2.2,slots:[[-2.8,-1.5],[0,-1.5],[2.8,-1.5],[-1.4,1.7],[1.4,1.7]]},
    innerLower:{x:69.5,y:72.0,itemW:2.3,slots:[[-2.4,-1.2],[0,-1.2],[2.4,-1.2],[-1.25,1.7],[1.25,1.7]]},
    outerTop:{x:91.0,y:36.0,itemW:2.5,slots:[[-2.7,-1.7],[2.7,-1.7],[-2.7,1.7],[2.7,1.7]]},
    outerMid:{x:91.0,y:54.2,itemW:2.5,slots:[[-2.7,-1.7],[2.7,-1.7],[-2.7,1.7],[2.7,1.7]]},
    outerLow:{x:91.0,y:72.4,itemW:2.5,slots:[[-2.7,-1.7],[2.7,-1.7],[-2.7,1.7],[2.7,1.7]]},
    pedestal:{x:41.0,y:48.0,itemW:4.8,slots:[[0,0]],prominent:true}
  };
  const MUSEUM_PLACEMENT={
    'helix-fossil':['topA',0],'dome-fossil':['topA',1],'old-amber':['topA',2],
    'root-fossil':['topB',0],'claw-fossil':['topB',1],'skull-fossil':['topB',2],
    'armor-fossil':['topC',0],'cover-fossil':['topC',1],'plume-fossil':['topC',2],
    'jaw-fossil':['outerTop',0],'sail-fossil':['outerTop',1],'fossilized-bird':['outerTop',2],'fossilized-dino':['outerTop',3],
    'fossilized-drake':['outerMid',0],'fossilized-fish':['outerMid',1],'relic-copper':['outerMid',2],'relic-silver':['outerMid',3],
    'relic-gold':['outerLow',0],'relic-vase':['outerLow',1],'relic-band':['outerLow',2],'relic-statue':['outerLow',3],
    'relic-crown':['innerUpper',0],'hard-stone':['innerUpper',1],'everstone':['innerUpper',2],'fire-stone':['innerUpper',3],'water-stone':['innerUpper',4],
    'thunder-stone':['innerLower',0],'leaf-stone':['innerLower',1],'moon-stone':['innerLower',2],
    'odd-keystone':['pedestal',0]
  };
  function museumSlotFor(id){
    const placement=MUSEUM_PLACEMENT[id];if(!placement)return null;
    const caseDef=MUSEUM_CASES[placement[0]],offset=caseDef?.slots?.[placement[1]];if(!caseDef||!offset)return null;
    return {x:caseDef.x+offset[0],y:caseDef.y+offset[1],w:caseDef.itemW,prominent:!!caseDef.prominent,caseId:placement[0]};
  }
  function escText(v){return String(v??'');}
  function ensureDigMarkup(){
    if(typeof document==='undefined')return null;
    const host=$('fossilGame');if(!host)return null;
    if(!markupReady||!$('fossilGrid')){
      host.className='panel arcade-game fossil-game fossil-dig-v0250';
      host.innerHTML=`
        <div class="arcade-full-head"><button class="game-exit" data-exit-game>‹ OREBURGH MINING MUSEUM</button><div class="arcade-mascot"><img src="arcade/sprites/actors/pokemon/408.png" alt="Cranidos" /><span>UNDERGROUND EXCAVATION</span></div></div>
        <div class="fossil-head-v0250">
          <div><div class="eyebrow">FOSSIL DIG</div><h2>Oreburgh dig wall</h2></div>
          <div class="fossil-stats-v0250"><span><small>WALL STABILITY</small><b id="fossilStability">100%</b></span><span><small>ITEMS FOUND</small><b id="fossilItemsFound">0/0</b></span></div>
        </div>
        <div class="fossil-wall-shell-v0250" id="fossilWallShell">
          <div class="fossil-wall-stage-v0250">
            <div class="fossil-find-layer-v0250" id="fossilFindLayer" aria-hidden="true"></div>
            <div class="fossil-grid-v0250" id="fossilGrid" aria-label="12 by 9 excavation wall"></div>
            <div class="fossil-find-banner-v0250" id="fossilFindBanner" hidden></div>
          </div>
        </div>
        <div class="fossil-tools-v0250" role="group" aria-label="Excavation tool">
          <button type="button" id="fossilToolPickaxe" data-fossil-tool="pickaxe" class="active"><span class="fossil-tool-icon-v0250">⛏</span><b>PICKAXE</b><small>Precise · −3 stability</small></button>
          <button type="button" id="fossilToolHammer" data-fossil-tool="hammer"><span class="fossil-tool-icon-v0250">🔨</span><b>HAMMER</b><small>3×3 strike · −8 stability</small></button>
        </div>
        <div class="fossil-dig-actions-v0251"><button type="button" id="fossilEndDig">END DIG</button></div>
        <div class="fossil-end-confirm-v0251" id="fossilEndConfirm" hidden role="dialog" aria-modal="false" aria-labelledby="fossilEndConfirmTitle">
          <b id="fossilEndConfirmTitle">Finish this excavation?</b>
          <span>Recovered finds are only collected when you leave. A cave-in can destroy them.</span>
          <div><button type="button" id="fossilKeepDigging">KEEP DIGGING</button><button type="button" id="fossilEndCollect">END & COLLECT</button></div>
        </div>
        <div class="fossil-booster-decision-v0260" id="fossilBoosterDecision" hidden role="dialog" aria-modal="true" aria-labelledby="fossilBoosterDecisionTitle">
          <div class="fossil-booster-decision-card-v0260"><div class="eyebrow">SEALED BOOSTER RECOVERED</div><h2 id="fossilBoosterDecisionTitle">Booster Pack</h2><img id="fossilBoosterDecisionArt" alt="Recovered sealed booster"><p>Open it now, or keep it sealed in your Collection for later.</p><div><button type="button" class="primary" id="fossilBoosterOpenNow">OPEN NOW</button><button type="button" class="secondary" id="fossilBoosterSave">SAVE FOR LATER</button></div></div>
        </div>`;
      host.querySelectorAll('[data-fossil-tool]').forEach(btn=>btn.addEventListener('click',()=>selectTool(btn.dataset.fossilTool)));
      $('fossilGrid')?.addEventListener('click',e=>{const cell=e.target.closest('[data-fossil-cell]');if(cell)strikeCell(Number(cell.dataset.fossilCell));});
      $('fossilEndDig')?.addEventListener('click',()=>showEndConfirm(true));
      $('fossilKeepDigging')?.addEventListener('click',()=>showEndConfirm(false));
      $('fossilEndCollect')?.addEventListener('click',()=>{showEndConfirm(false);finishDig('manual');});
      $('fossilBoosterOpenNow')?.addEventListener('click',()=>resolveBoosterDecisionV0260(true));
      $('fossilBoosterSave')?.addEventListener('click',()=>resolveBoosterDecisionV0260(false));
      markupReady=true;
    }
    session()?.mount?.('fossil',host);
    session()?.ensureStrip?.('fossil',host);
    return host;
  }
  function spriteFor(find,item){return find?.card?.image||item?.sprite||'';}
  function renderFinds(){
    const layer=$('fossilFindLayer');if(!layer||!dig)return;
    layer.replaceChildren();
    for(const find of dig.finds){
      const item=core.byId(find.itemId);if(!item)continue;
      const rows=find.cells.map(i=>Math.floor(i/dig.cols)),cols=find.cells.map(i=>i%dig.cols);
      const minR=Math.min(...rows),maxR=Math.max(...rows),minC=Math.min(...cols),maxC=Math.max(...cols);
      if(find.itemId==='tcg-booster'&&find.boosterReward){
        const art=document.createElement('img');art.className='fossil-booster-mini-v0266';art.alt='';art.draggable=false;
        art.src=root.LuckyDexBoosterMiniArt?.directPath?.(find.boosterReward.set||find.set||{})||find.boosterReward.boosterArt||item.sprite;
        art.style.left=`${minC/dig.cols*100}%`;art.style.top=`${minR/dig.rows*100}%`;art.style.width=`${(maxC-minC+1)/dig.cols*100}%`;art.style.height=`${(maxR-minR+1)/dig.rows*100}%`;
        layer.appendChild(art);continue;
      }
      const img=document.createElement('img');img.className='fossil-find-v0250';img.alt='';img.draggable=false;
      img.src=spriteFor(find,item);img.style.left=`${minC/dig.cols*100}%`;img.style.top=`${minR/dig.rows*100}%`;img.style.width=`${(maxC-minC+1)/dig.cols*100}%`;img.style.height=`${(maxR-minR+1)/dig.rows*100}%`;
      layer.appendChild(img);
    }
  }
  function renderGrid(){
    const grid=$('fossilGrid');if(!grid||!dig)return;
    const frag=document.createDocumentFragment();
    for(let i=0;i<dig.depths.length;i++){
      const btn=document.createElement('button');btn.type='button';btn.className='fossil-cell-v0250';btn.dataset.fossilCell=String(i);btn.dataset.depth=String(dig.depths[i]);btn.setAttribute('aria-label',`Rock ${i+1}, depth ${dig.depths[i]}`);btn.disabled=!!dig.finished;frag.appendChild(btn);
    }
    grid.replaceChildren(frag);
  }
  function renderStatus(){
    if(!dig)return;
    if($('fossilStability'))$('fossilStability').textContent=`${Math.max(0,dig.stability)}%`;
    if($('fossilItemsFound'))$('fossilItemsFound').textContent=`${dig.awardedFindIds.length}/${dig.finds.length}`;
    $('fossilToolPickaxe')?.classList.toggle('active',selectedTool==='pickaxe');
    $('fossilToolHammer')?.classList.toggle('active',selectedTool==='hammer');
    session()?.update?.('fossil',{runText:`Wall stability ${dig.stability}%`,rewardText:`${dig.awardedFindIds.length}/${dig.finds.length} recovered`,liveLabel:'TOOL',liveValue:selectedTool.toUpperCase()});
  }
  function renderDig(){renderFinds();renderGrid();renderStatus();}
  function showFindBanner(title,subtitle=''){
    const banner=$('fossilFindBanner');if(!banner)return;
    clearTimeout(bannerTimer);banner.replaceChildren();const b=document.createElement('b');b.textContent=title;banner.appendChild(b);if(subtitle){const s=document.createElement('span');s.textContent=subtitle;banner.appendChild(s);}banner.hidden=false;banner.classList.remove('show');void banner.offsetWidth;banner.classList.add('show');bannerTimer=setTimeout(()=>{banner.hidden=true;banner.classList.remove('show');},1500);
  }
  async function hydrateRewardFinds(site){
    const b=bridge();if(!site||!b)return;
    for(const find of site.finds){
      if(find.itemId==='tcg-card'){
        let resolved=null;try{resolved=await b.resolveBuriedCard?.();}catch(_){resolved=null;}
        if(resolved?.card){find.card=resolved.card;find.set=resolved.set||{};continue;}
        const fallback=core.byId(Math.random()<.5?'star-piece':'nugget');find.itemId=fallback.id;continue;
      }
      if(find.itemId==='tcg-booster'){
        let resolved=null;try{resolved=await b.resolveBuriedBooster?.();}catch(_){resolved=null;}
        if(resolved?.set?.id){find.boosterReward=resolved;find.set=resolved.set||{};continue;}
        const fallback=core.byId(Math.random()<.5?'star-piece':'nugget');find.itemId=fallback.id;
      }
    }
  }
  async function startDig(){
    ensureDigMarkup();session()?.hideResult?.();showEndConfirm(false);if($('fossilBoosterDecision'))$('fossilBoosterDecision').hidden=true;finishing=false;haul=[];cardReveals=[];pendingCoins=0;pendingBoosterQueue=[];pendingFinishResult=null;selectedTool='pickaxe';
    dig=core.generateDigSite({buriedCardChance:rareOdds().fossilCard,buriedBoosterChance:rareOdds().fossilPack});await hydrateRewardFinds(dig);renderDig();return dig;
  }
  function showEndConfirm(show){const box=$('fossilEndConfirm');if(!box)return false;box.hidden=!show;if(show)bridge()?.vibrate?.(6);return true;}
  function selectTool(toolId){if(!core.TOOL_RULES[toolId])return false;selectedTool=toolId;renderStatus();bridge()?.vibrate?.(toolId==='hammer'?12:5);return true;}
  function addHaul(title,subtitle,kind){haul.push({title:escText(title),subtitle:escText(subtitle),kind:escText(kind||'find')});}
  function queueRecoveredFind(find){
    const item=core.byId(find?.itemId);if(!item)return;
    const name=find?.boosterReward?.set?.name?`${find.boosterReward.set.name} Booster`:find?.card?.name||item.name;showFindBanner(name,'RECOVERED');
  }
  function bankRecoveredFind(find){
    const item=core.byId(find?.itemId),b=bridge();if(!item||!b)return false;
    if(item.rewardDestination==='museum'){
      const arcade=b.getState?.()?.arcade||{},museum=core.ensureMuseumState(arcade),rec=core.recordMuseumFind(museum,item,Date.now());
      if(rec.isNew)addHaul(item.name,'New museum exhibit','museum');
      else{pendingCoins+=rec.duplicateCoins;addHaul(item.name,`Duplicate sold · +${rec.duplicateCoins} coins`,'coins');}
      b.save?.();return true;
    }
    if(item.rewardDestination==='coins'){
      pendingCoins+=Math.max(0,Number(item.duplicateCoins)||0);addHaul(item.name,`Sold · +${item.duplicateCoins} coins`,'coins');return true;
    }
    if(item.rewardDestination==='inventory'){
      const granted=b.grantInventory?.(item.inventoryKey,item.amount||1)||0;addHaul(item.name,granted?'Added to Adventure inventory':'Inventory unchanged','inventory');return !!granted;
    }
    if(item.rewardDestination==='card'&&find.card){
      const row=b.grantCard?.(find.card,find.set||{}),name=row?.name||find.card.name||'Buried TCG Card';addHaul(name,'Added to Card Collection','card');if(row)cardReveals.push({id:row.id||find.card.id||'',name,image:row.image||find.card.image||'',setName:row.setName||find.set?.name||'',rarity:row.rarity||find.card.rarity||''});return !!row;
    }
    if(item.rewardDestination==='booster'&&find.boosterReward){
      const count=b.grantBooster?.(find.boosterReward)||0,label=find.boosterReward?.set?.name?`${find.boosterReward.set.name} Booster`:'Buried Booster';addHaul(label,count?'Recovered sealed booster':'Booster could not be saved','booster');return !!count;
    }
    return false;
  }
  function showNextBoosterDecisionV0260(){
    const box=$('fossilBoosterDecision');if(!box)return finalizeDigResultV0260();
    const find=pendingBoosterQueue[0];if(!find){box.hidden=true;return finalizeDigResultV0260();}
    const reward=find.boosterReward||{},set=reward.set||{};$('fossilBoosterDecisionTitle').textContent=`${set.name||'Mystery'} Booster`;
    const img=$('fossilBoosterDecisionArt');if(img){img.src=reward.boosterArt||root.LuckyDexBoosterArt?.localPath?.(set)||'';img.alt=`${set.name||'Recovered'} booster`;}
    box.hidden=false;bridge()?.vibrate?.([10,20,20]);return true;
  }
  async function resolveBoosterDecisionV0260(openNow){
    const find=pendingBoosterQueue.shift();if(!find)return showNextBoosterDecisionV0260();
    const reward=find.boosterReward||{},set=reward.set||{},b=bridge(),haulIndex=Number(find.boosterHaulIndex);
    const setHaulSubtitle=subtitle=>{if(Number.isInteger(haulIndex)&&haulIndex>=0&&haul[haulIndex])haul[haulIndex].subtitle=subtitle;};
    if($('fossilBoosterDecision'))$('fossilBoosterDecision').hidden=true;
    if(openNow){
      const opened=await b?.openSealedPack?.(set.id,{onClose:(info)=>{setHaulSubtitle(info?.committed?'Opened from excavation':'Saved unopened · Sealed Packs');showNextBoosterDecisionV0260();}});
      if(opened)return true;
    }
    setHaulSubtitle('Saved unopened · Sealed Packs');
    return showNextBoosterDecisionV0260();
  }
  function finalizeDigResultV0260(){
    const pending=pendingFinishResult;if(!pending)return false;pendingFinishResult=null;
    session()?.showResult?.('fossil',{title:pending.title,metricLabel:'BANKED',metricValue:pending.metricValue,coinsAwarded:pending.coinsAwarded,details:haul,cardReveals,bestText:pending.bestText,review:{title:pending.title,mode:'Fossil Dig',difficulty:'Excavation',metricLabel:'BANKED',metricValue:pending.metricValue,stats:[{label:'Finds Kept',value:String(pending.kept)},{label:'Total Finds',value:String(pending.total)},{label:'Finds Lost',value:String(pending.lost)},{label:'Outcome',value:String(pending.outcome)}],rewards:[{label:'Lucky Coins',value:String(pending.coinsAwarded||0)},...haul.slice(0,5).map(row=>({label:String(row.title||'Find'),value:String(row.subtitle||'Recovered')}))]},replayLabel:'DIG AGAIN',onReplay:()=>startDig(),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.()});
    renderStatus();return true;
  }
  function strikeCell(index){
    if(!dig||dig.finished||finishing)return false;
    const result=core.strike(dig,index,selectedTool);if(!result.changedIndices.length&&!result.recoveredIds.length)return false;
    bridge()?.vibrate?.(selectedTool==='hammer'?[18,10,18]:8);
    for(const id of result.recoveredIds){const find=dig.finds.find(f=>f.id===id);if(find)queueRecoveredFind(find);}
    renderDig();
    if(result.collapsed)finishDig('collapse');else if(result.allRecovered)finishDig('complete');
    return true;
  }
  function finishDig(reason='complete'){
    if(!dig||finishing||dig.resultShown)return false;finishing=true;dig.resultShown=true;dig.finished=true;
    const collapsed=reason==='collapse'||dig.collapsed,manual=reason==='manual',recoveredIds=[...(dig.awardedFindIds||[])];
    const resolved=collapsed?core.resolveCaveInHaul(recoveredIds):{keptIds:recoveredIds,lostIds:[]};
    haul=[];cardReveals=[];pendingCoins=0;pendingBoosterQueue=[];
    for(const id of resolved.keptIds){
      const find=dig.finds.find(f=>f.id===id);if(!find)continue;const item=core.byId(find.itemId);
      if(item?.rewardDestination==='booster'&&find.boosterReward){
        const haulIndex=haul.length;
        if(bankRecoveredFind(find)){find.boosterHaulIndex=haulIndex;pendingBoosterQueue.push(find);}
      }else bankRecoveredFind(find);
    }
    for(const id of resolved.lostIds){const find=dig.finds.find(f=>f.id===id),item=core.byId(find?.itemId);if(item)addHaul(find?.boosterReward?.set?.name?`${find.boosterReward.set.name} Booster`:find?.card?.name||item.name,'Lost in the cave-in','lost');}
    let awarded=0;if(pendingCoins>0)awarded=bridge()?.grantCoins?.(pendingCoins,'Fossil Dig')||pendingCoins;
    showEndConfirm(false);
    const lost=resolved.lostIds.length,bestText=collapsed?(lost?`${lost} find${lost===1?'':'s'} lost in the cave-in`:'Lucky escape — all recovered finds survived'):manual?'HAUL BANKED SAFELY':'SITE CLEARED';
    pendingFinishResult={title:collapsed?'WALL COLLAPSED':manual?'DIG ENDED':'DIG COMPLETE',metricValue:`${resolved.keptIds.length}/${dig.finds.length}`,coinsAwarded:awarded,bestText,kept:resolved.keptIds.length,total:dig.finds.length,lost:resolved.lostIds.length,outcome:collapsed?'CAVE-IN':manual?'MANUAL END':'SITE CLEARED'};
    if(pendingBoosterQueue.length)return showNextBoosterDecisionV0260();
    return finalizeDigResultV0260();
  }
  function openPlaque(item,record){
    const plaque=$('museumPlaque');if(!plaque)return false;
    $('museumPlaqueName').textContent=item.name.toUpperCase();$('museumPlaqueFlavour').textContent=item.flavour||'A recovered piece of Pokémon-world history.';$('museumPlaqueCount').textContent=`Excavated: ${Math.max(1,Number(record?.foundCount)||1)}`;plaque.hidden=false;return true;
  }
  function renderMuseum(){
    if(typeof document==='undefined')return false;const layer=$('museumExhibitLayer');if(!layer)return false;layer.replaceChildren();
    const state=bridge()?.getState?.(),museum=core.ensureMuseumState(state?.arcade||{});let count=0;
    for(const id of Object.keys(MUSEUM_PLACEMENT)){
      const slot=museumSlotFor(id);if(!slot)continue;
      const record=museum.exhibits?.[id];if(!record?.discovered)continue;const item=core.byId(id);if(!item?.museumEligible)continue;count++;
      const btn=document.createElement('button');btn.type='button';btn.className='museum-exhibit-v0250';if(slot.prominent)btn.classList.add('prominent');btn.dataset.museumId=id;btn.style.left=`${slot.x}%`;btn.style.top=`${slot.y}%`;btn.style.width=`${slot.w}%`;btn.setAttribute('aria-label',`${item.name}, excavated ${record.foundCount||1}`);
      const img=document.createElement('img');img.src=item.sprite;img.alt='';img.draggable=false;btn.appendChild(img);btn.addEventListener('click',()=>openPlaque(item,record));layer.appendChild(btn);
    }
    if($('museumExhibitCount'))$('museumExhibitCount').textContent=`${count} EXHIBIT${count===1?'':'S'}`;return count;
  }
  function wireMuseum(){
    const close=$('museumPlaqueClose');if(close&&!close.dataset.wired){close.dataset.wired='1';close.addEventListener('click',()=>{$('museumPlaque').hidden=true;});}
    const scene=$('museumScene');if(scene&&!scene.dataset.plaqueWired){scene.dataset.plaqueWired='1';scene.addEventListener('click',e=>{if(e.target.closest('.museum-exhibit-v0250,#museumPlaque,#museumBackOverlay'))return;const plaque=$('museumPlaque');if(plaque)plaque.hidden=true;});}
  }
  function open(activityId){
    if(activityId==='museum'){const host=$('museumGame');if(!host)return false;ensureDigMarkup();bridge()?.setOrientation?.('landscape');$('fossilGame').hidden=true;host.hidden=false;wireMuseum();if($('museumPlaque'))$('museumPlaque').hidden=true;renderMuseum();return true;}
    if(activityId!=='fossil')return false;bridge()?.setOrientation?.('portrait');const host=ensureDigMarkup();if(!host)return false;if($('museumGame'))$('museumGame').hidden=true;host.hidden=false;startDig();return true;
  }
  function close(activityId){
    clearTimeout(bannerTimer);if(!activityId||activityId==='fossil'){const host=$('fossilGame');if(host)host.hidden=true;dig=null;finishing=false;}
    if(!activityId||activityId==='museum'){const museum=$('museumGame');if(museum)museum.hidden=true;if($('museumPlaque'))$('museumPlaque').hidden=true;bridge()?.setOrientation?.('portrait');}
    return true;
  }
  const api={MUSEUM_CASES,MUSEUM_PLACEMENT,museumSlotFor,open,close,startDig,selectTool,strikeCell,finishDig,showEndConfirm,renderMuseum,currentDig:()=>dig};
  root.LuckyDexFossilMuseum=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof document!=='undefined')ensureDigMarkup();
})(typeof window!=='undefined'?window:globalThis);
