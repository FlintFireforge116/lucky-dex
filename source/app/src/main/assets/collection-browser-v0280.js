/* LuckyDex v0.28.0 — Card Binder TCG/TCGP tabs, search and sorting. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexCollectionBrowser=api;
  api.install();
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  function sourceOf(card){
    if(card?.source==='tcgp')return 'tcgp';
    if(card?.source==='tcg')return 'tcg';
    const id=String(card?.setId||card?.set?.id||'').replace(/^library:/i,'');
    return /^[AB]\d/i.test(id)?'tcgp':'tcg';
  }
  function numberValue(value){
    const raw=String(value??'').trim(),m=raw.match(/\d+/);return m?Number(m[0]):Number.MAX_SAFE_INTEGER;
  }
  function releaseText(card){return String(card?.setRelease||card?.set?.releaseDate||card?.releaseDate||'');}
  function searchText(card){return [card?.name,card?.setName,card?.set?.name,card?.setId,card?.set?.id,card?.localId,card?.number,card?.rarity].map(v=>String(v||'').toLowerCase()).join(' ');}
  function formatSetDate(value){
    const raw=String(value||'').trim();if(!raw)return '';
    const d=new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw)?`${raw}T00:00:00Z`:raw);if(Number.isNaN(d.getTime()))return raw;
    try{return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(d);}catch(_){return raw;}
  }
  function setCompletion(set){const total=Number(set?.total||0),count=Number(set?.count||0);return total>0?Math.max(0,Math.min(100,Math.round(count/total*100))):0;}
  function filterOwnedSets(sets,query=''){
    const q=String(query||'').trim().toLowerCase();if(!q)return [...(sets||[])];
    return [...(sets||[])].filter(set=>[set?.name,set?.key,set?.release,formatSetDate(set?.release)].map(v=>String(v||'').toLowerCase()).some(v=>v.includes(q)));
  }
  function filterCards(cards,{source='tcg',query='',filter='all',group='all'}={}){
    const q=String(query||'').trim().toLowerCase();
    return [...(cards||[])].filter(card=>sourceOf(card)===source)
      .filter(card=>!q||searchText(card).includes(q))
      .filter(card=>filter!=='duplicates'||Number(card?.count||0)>1)
      .filter(card=>filter!=='rare'||((typeof looksRare==='function')?looksRare(card?.rarity||''):/(rare|ex|vmax|vstar|secret|crown|gold|illustration|★|☆)/i.test(String(card?.rarity||''))))
      .filter(card=>group==='all'||String(group).slice(0,4)!=='set:'||String(card?.setId||card?.set?.id||card?.setName||card?.set?.name||'')===String(group).slice(4));
  }
  function rarityValue(card){
    if(typeof rarityTier==='function')return Number(rarityTier(card?.rarity||''))||0;
    const r=String(card?.rarity||'').toLowerCase();return /(crown|gold|secret)/.test(r)?6:/(hyper|special illustration|rainbow)/.test(r)?5:/(ultra|illustration|vmax|vstar)/.test(r)?4:/(rare|ex|gx|v\b)/.test(r)?3:1;
  }
  function restoreCardControls({filter,group}={}){if(filter)filter.hidden=false;if(group)group.hidden=false;}
  function clearGrid(grid){if(grid)grid.innerHTML='';return grid;}
  function sortCards(cards,key='releaseDate',dir='desc'){
    const mul=dir==='asc'?1:-1;
    return [...(cards||[])].sort((a,b)=>{
      let av,bv,cmp=0;
      if(key==='name'){av=String(a?.name||'').toLowerCase();bv=String(b?.name||'').toLowerCase();cmp=av.localeCompare(bv);}
      else if(key==='setName'){av=String(a?.setName||a?.set?.name||'').toLowerCase();bv=String(b?.setName||b?.set?.name||'').toLowerCase();cmp=av.localeCompare(bv);}
      else if(key==='number'){cmp=numberValue(a?.localId??a?.number)-numberValue(b?.localId??b?.number);}
      else if(key==='rarity'){cmp=rarityValue(a)-rarityValue(b);}
      else if(key==='quantity'){cmp=Number(a?.count||0)-Number(b?.count||0);}
      else {cmp=releaseText(a).localeCompare(releaseText(b));}
      if(cmp)return cmp*mul;
      const setCmp=String(a?.setName||'').localeCompare(String(b?.setName||''));if(setCmp)return setCmp;
      const numCmp=numberValue(a?.localId??a?.number)-numberValue(b?.localId??b?.number);if(numCmp)return numCmp;
      return String(a?.name||'').localeCompare(String(b?.name||''));
    });
  }

  function install(){
    if(typeof document==='undefined'||typeof state==='undefined')return;
    const oldRender=renderCollection,oldRebuild=rebuildCollectionControls;
    let setPickerQuery='';
    function ensureState(){
      state.ui=state.ui&&typeof state.ui==='object'?state.ui:{};
      const cb=state.ui.collectionBrowser=state.ui.collectionBrowser&&typeof state.ui.collectionBrowser==='object'?state.ui.collectionBrowser:{};
      cb.source=cb.source==='tcgp'?'tcgp':'tcg';cb.bySource=cb.bySource&&typeof cb.bySource==='object'?cb.bySource:{};
      for(const src of ['tcg','tcgp']){
        const row=cb.bySource[src]=cb.bySource[src]&&typeof cb.bySource[src]==='object'?cb.bySource[src]:{};
        if(!['releaseDate','setName','name','number','rarity','quantity'].includes(row.sortKey))row.sortKey='releaseDate';
        if(!['asc','desc'].includes(row.sortDir))row.sortDir='desc';
        if(typeof row.query!=='string')row.query='';if(typeof row.filter!=='string')row.filter='all';if(typeof row.group!=='string')row.group='all';
      }
      return cb;
    }
    function current(){const cb=ensureState();return cb.bySource[cb.source];}
    function persist(){try{save();}catch(_){}}
    function setIdentity(card){return String(card?.setId||card?.set?.id||card?.setName||card?.set?.name||'');}
    function setName(card){return String(card?.setName||card?.set?.name||card?.setId||'Unknown set');}
    function releaseForCard(card,source){
      const direct=releaseText(card);if(direct)return direct;
      const id=setIdentity(card),name=setName(card).toLowerCase(),set=(setCache?.[source]||[]).find(row=>String(row?.id||'')===id||String(row?.name||'').toLowerCase()===name);
      return String(set?.releaseDate||'');
    }
    function syncCardRelease(cards,source){for(const card of cards){if(!card.setRelease){const rel=releaseForCard(card,source);if(rel)card.setRelease=rel;}}}
    function ownedSets(source){
      const cards=Object.values(state.cards||{}).filter(card=>sourceOf(card)===source),map=new Map(),catalog=setCache?.[source]||[],rank=new Map(catalog.map((set,i)=>[String(set.id),i]));
      for(const c of cards){const key=setIdentity(c),row=map.get(key)||{key,name:setName(c),count:0,total:Number(c.setTotal||0),release:releaseForCard(c,source),rank:rank.has(key)?rank.get(key):99999};row.count++;row.total=Math.max(row.total,Number(c.setTotal||0));map.set(key,row);}
      return [...map.values()].sort((a,b)=>a.rank-b.rank||String(b.release).localeCompare(String(a.release))||a.name.localeCompare(b.name));
    }
    function saveControls(){
      if(collectionMode!=='cards')return;const row=current();
      row.query=document.getElementById('collectionSearch')?.value||'';row.sortKey=document.getElementById('collectionSort')?.value||'releaseDate';row.sortDir=document.getElementById('collectionSortDir')?.dataset.dir||'desc';row.filter=document.getElementById('collectionFilter')?.value||'all';row.group=document.getElementById('collectionGroupFilter')?.value||'all';
    }
    function syncControls(){
      const cb=ensureState(),row=current(),isCards=collectionMode==='cards';
      const tabs=document.getElementById('cardBinderSourceTabs'),sort=document.getElementById('collectionSort'),dir=document.getElementById('collectionSortDir'),search=document.getElementById('collectionSearch'),group=document.getElementById('collectionGroupFilter'),picker=document.getElementById('collectionSetPickerWrap'),progress=document.getElementById('collectionProgress');
      if(tabs)tabs.hidden=!isCards;if(sort)sort.hidden=!isCards;if(dir)dir.hidden=!isCards;
      tabs?.querySelectorAll('[data-binder-source]').forEach(btn=>btn.classList.toggle('active',btn.dataset.binderSource===cb.source));
      if(isCards){
        if(search){search.placeholder=`Search ${cb.source==='tcgp'?'TCGP':'TCG'} cards, sets or numbers`;search.value=row.query;}if(sort)sort.value=row.sortKey;if(dir){dir.dataset.dir=row.sortDir;dir.textContent=row.sortDir==='asc'?'↑':'↓';dir.setAttribute('aria-label',row.sortDir==='asc'?'Sort ascending':'Sort descending');}
        if(group)group.hidden=true;if(picker)picker.hidden=false;if(progress)progress.hidden=true;updateSetPickerCard();
      }else{if(picker)picker.hidden=true;if(progress)progress.hidden=false;}
    }
    function selectedSetRecord(){
      const cb=ensureState(),row=current();if(!String(row.group||'').startsWith('set:'))return null;
      const key=String(row.group).slice(4);return ownedSets(cb.source).find(set=>String(set.key)===key)||null;
    }
    function updateSetPickerCard(){
      const cb=ensureState(),row=current(),sets=ownedSets(cb.source),selected=selectedSetRecord(),title=document.getElementById('collectionSetPickerTitle'),meta=document.getElementById('collectionSetPickerMeta'),complete=document.getElementById('collectionSetPickerComplete'),track=document.getElementById('collectionSetPickerTrack'),bar=document.getElementById('collectionSetPickerBar'),button=document.getElementById('collectionSetPickerButton');
      if(!title||!meta)return;
      if(selected){
        const pct=setCompletion(selected),date=formatSetDate(selected.release),total=Number(selected.total||0);title.textContent=selected.name;meta.textContent=`${date?date+' · ':''}${selected.count}${total?` / ${total}`:''} collected`;
        if(track)track.hidden=!total;if(bar)bar.style.width=`${pct}%`;if(complete)complete.hidden=pct<100;button?.classList.toggle('complete',pct>=100);
      }else{
        const unique=Object.values(state.cards||{}).filter(card=>sourceOf(card)===cb.source).length;title.textContent='All owned sets';meta.textContent=`${unique} unique cards · ${sets.length} set${sets.length===1?'':'s'}`;if(track)track.hidden=true;if(complete)complete.hidden=true;button?.classList.remove('complete');
      }
    }
    function renderSetPicker(){
      const cb=ensureState(),row=current(),allSets=ownedSets(cb.source),sets=filterOwnedSets(allSets,setPickerQuery),list=document.getElementById('collectionSetPickerList'),label=document.getElementById('collectionSetPickerSourceLabel');if(!list)return;
      if(label)label.textContent=`${cb.source==='tcgp'?'TCGP':'TCG'} · ${allSets.length} owned set${allSets.length===1?'':'s'}`;
      const allSelected=row.group==='all';
      const allUnique=Object.values(state.cards||{}).filter(card=>sourceOf(card)===cb.source).length;
      let html=`<button type="button" class="collection-set-row all ${allSelected?'selected':''}" data-set-group="all" role="option" aria-selected="${allSelected}"><span class="collection-set-row-main"><b>All owned sets</b><small>Browse the full ${cb.source==='tcgp'?'TCGP':'TCG'} binder</small></span><span class="collection-set-row-count"><strong>${allUnique}</strong><small>unique cards</small></span><span class="collection-set-choice" aria-hidden="true"></span></button>`;
      if(!sets.length)html+=`<div class="collection-set-empty">No owned sets match “${escapeHtml(setPickerQuery)}”.</div>`;
      html+=sets.map(set=>{const value=`set:${set.key}`,selected=value===row.group,pct=setCompletion(set),date=formatSetDate(set.release),total=Number(set.total||0),done=total>0&&pct>=100;return `<button type="button" class="collection-set-row ${selected?'selected ':''}${done?'complete':''}" data-set-group="${escapeHtml(value)}" role="option" aria-selected="${selected}"><span class="collection-set-row-main"><b>${escapeHtml(set.name)}</b><small>${escapeHtml(date||'Release date unavailable')}</small></span><span class="collection-set-row-count"><strong>${set.count}${total?` / ${total}`:''}</strong><small>${done?'COMPLETE':`${pct}% collected`}</small></span><span class="collection-set-choice" aria-hidden="true"></span>${total?`<span class="collection-set-row-track"><i style="width:${pct}%"></i></span>`:''}</button>`;}).join('');
      list.innerHTML=html;
      list.querySelectorAll('[data-set-group]').forEach(btn=>btn.addEventListener('click',()=>{const value=btn.dataset.setGroup||'all',group=document.getElementById('collectionGroupFilter');row.group=value;if(group)group.value=value;persist();updateSetPickerCard();closeSetPicker();renderCollection();}));
    }
    function openSetPicker(){
      const dialog=document.getElementById('collectionSetPickerDialog'),input=document.getElementById('collectionSetSearch');if(!dialog)return;setPickerQuery='';if(input)input.value='';renderSetPicker();
      if(typeof dialog.showModal==='function'){if(!dialog.open)dialog.showModal();}else dialog.setAttribute('open','');setTimeout(()=>input?.focus(),20);
    }
    function closeSetPicker(){const dialog=document.getElementById('collectionSetPickerDialog');if(!dialog)return;if(typeof dialog.close==='function'&&dialog.open)dialog.close();else dialog.removeAttribute('open');}
    function rebuildCards(){
      const cb=ensureState(),row=current(),filter=document.getElementById('collectionFilter'),group=document.getElementById('collectionGroupFilter');
      restoreCardControls({filter,group});
      if(filter){filter.innerHTML='<option value="all">All owned cards</option><option value="rare">Rare hits</option><option value="duplicates">Spare copies</option>';filter.value=[...filter.options].some(o=>o.value===row.filter)?row.filter:'all';row.filter=filter.value;}
      if(group){const sets=ownedSets(cb.source);group.innerHTML='<option value="all">All owned sets</option>'+sets.map(s=>`<option value="set:${escapeHtml(s.key)}">${escapeHtml(s.release?`${s.release} · ${s.name}`:s.name)} · ${s.count}${s.total?`/${s.total}`:''}</option>`).join('');group.value=[...group.options].some(o=>o.value===row.group)?row.group:'all';row.group=group.value;}
      const quick=document.getElementById('binderQuickFilters'),dc=document.getElementById('binderDuplicateCount');if(quick)quick.hidden=false;if(dc)dc.textContent=Object.values(state.cards||{}).filter(c=>sourceOf(c)===cb.source&&Number(c.count||0)>1).length;
      const teamPanel=document.getElementById('teamPanel');if(teamPanel)teamPanel.hidden=true;syncControls();
    }
    rebuildCollectionControls=function(){
      if(collectionMode!=='cards'){const out=oldRebuild();syncControls();return out;}
      return rebuildCards();
    };
    renderCollection=function(){
      if(collectionMode!=='cards')return oldRender();
      const cb=ensureState(),row=current(),grid=document.getElementById('collectionGrid');if(!grid)return;clearGrid(grid);
      saveControls();syncCardRelease(Object.values(state.cards||{}),cb.source);
      let items=filterCards(Object.values(state.cards||{}),{source:cb.source,query:row.query,filter:row.filter,group:row.group});items=sortCards(items,row.sortKey,row.sortDir);
      const allSource=Object.values(state.cards||{}).filter(c=>sourceOf(c)===cb.source);renderCollectionProgress(items,allSource);
      const quick=document.getElementById('binderQuickFilters'),dc=document.getElementById('binderDuplicateCount');if(quick)quick.hidden=false;if(dc)dc.textContent=allSource.filter(c=>Number(c.count||0)>1).length;
      document.querySelectorAll('[data-binder-filter]').forEach(b=>b.classList.toggle('active',b.dataset.binderFilter===row.filter));
      grid.classList.remove('sealed-pack-collection-v0260');
      if(!items.length){grid.innerHTML=`<div class="empty">${row.query?'No cards match that search in this collection.':row.filter==='duplicates'?'No spare card copies yet.':'Nothing here yet.'}</div>`;return;}
      grid.innerHTML=items.map(x=>`<button class="collection-item card ${looksRare(x.rarity||'')?'rare-card':''}" data-card-id="${escapeHtml(x.id)}"><span class="count-badge">×${x.count}</span>${cardArtHtml(x.image,x.name,x)}<div class="card-tile-copy"><b>${escapeHtml(humanCardText(x.name,'Unknown card'))}</b><span>${escapeHtml(cardDisplayMeta(x))}</span></div></button>`).join('');
      grid.querySelectorAll('[data-card-id]').forEach(b=>b.onclick=()=>openCardModal(state.cards[b.dataset.cardId]));syncControls();
    };
    function switchCollectionMode(btn){if(!btn)return;if(collectionMode==='cards')saveControls();collectionMode=btn.dataset.collection||'pokemon';document.querySelectorAll('[data-collection]').forEach(row=>row.classList.toggle('active',row===btn));rebuildCollectionControls();renderTeamPanel();renderCollection();}
    document.querySelectorAll('[data-binder-source]').forEach(btn=>btn.addEventListener('click',()=>{if(collectionMode!=='cards')return;saveControls();const cb=ensureState();cb.source=btn.dataset.binderSource==='tcgp'?'tcgp':'tcg';persist();rebuildCards();renderCollection();}));
    document.getElementById('collectionSort')?.addEventListener('change',e=>{if(collectionMode!=='cards')return;current().sortKey=e.target.value;persist();renderCollection();});
    document.getElementById('collectionSortDir')?.addEventListener('click',e=>{if(collectionMode!=='cards')return;const row=current();row.sortDir=row.sortDir==='asc'?'desc':'asc';e.currentTarget.dataset.dir=row.sortDir;persist();renderCollection();});
    document.getElementById('collectionSearch')?.addEventListener('input',e=>{if(collectionMode!=='cards')return;current().query=e.target.value;renderCollection();});
    document.getElementById('collectionFilter')?.addEventListener('change',e=>{if(collectionMode!=='cards')return;current().filter=e.target.value;persist();renderCollection();});
    document.getElementById('collectionGroupFilter')?.addEventListener('change',e=>{if(collectionMode!=='cards')return;current().group=e.target.value;persist();renderCollection();});
    document.querySelectorAll('[data-collection]').forEach(btn=>{btn.onclick=()=>switchCollectionMode(btn);});
    document.getElementById('collectionSetPickerButton')?.addEventListener('click',openSetPicker);
    document.getElementById('collectionSetPickerClose')?.addEventListener('click',closeSetPicker);
    document.getElementById('collectionSetSearch')?.addEventListener('input',event=>{setPickerQuery=event.target.value||'';renderSetPicker();});
    document.getElementById('collectionSetPickerDialog')?.addEventListener('click',event=>{if(event.target===event.currentTarget)closeSetPicker();});
    syncControls();
  }
  return {sourceOf,filterCards,sortCards,restoreCardControls,clearGrid,formatSetDate,setCompletion,filterOwnedSets,install};
});
