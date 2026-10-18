(function(root,factory){
  const cat=(typeof module==='object'&&module.exports)?require('./cosmetics-catalog-v0413.js'):root.LuckyDexCosmeticsCatalogV0413;
  const core=(typeof module==='object'&&module.exports)?require('./cosmetics-core-v0413.js'):root.LuckyDexCosmeticsV0413;
  const api=factory(cat||{CATALOGUE:[]},core);
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexCustomiseV0413=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(catalogue,defaultCore){
  'use strict';
  let deps=null, ownership='all', category='all', source='all', query='', selectedId='luckydex-default', installed=false;
  const esc=s=>String(s??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  function presentation(entry,state,core=defaultCore){
    if(!entry)return null;
    const discovered=!entry.hidden||core?.isDiscovered?.(state,entry.sourceAchievementId)||false;
    if(entry.hidden&&!discovered)return {id:entry.id,name:'???',artPath:'',requirement:'',action:'LOCKED',hidden:true,owned:false,category:entry.category,tier:entry.tier,sourceFamily:'',themes:['Secrets'],searchText:'???'};
    const owned=!!core?.isOwned?.(state,entry.id);
    const active=core?.activeSleeve?.(state)?.id===entry.id;
    const name=entry.hidden?(entry.realName||entry.name):entry.name;
    return {id:entry.id,name,artPath:entry.artPath,requirement:owned?'':entry.unlockText,action:active?'EQUIPPED':owned?'EQUIP':'LOCKED',hidden:!!entry.hidden,owned,category:entry.category,tier:entry.tier,sourceFamily:entry.sourceFamily||'LuckyDex',themes:entry.themes||[entry.category],searchText:[name,...(entry.searchTerms||[])].join(' ')};
  }
  function current(){return deps?.getState?.()||{};}
  function rowHtml(p){
    const art=p.artPath?`<img src="${esc(p.artPath)}" alt="${esc(p.name)} sleeve" loading="lazy" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add('art-failed')">`:'<div class="customise-secret-art">?</div>';
    return `<button class="customise-sleeve-tile ${p.owned?'owned':'locked'}" type="button" data-sleeve-id="${esc(p.id)}"><span class="customise-sleeve-art">${art}</span><b>${esc(p.name)}</b><small>${p.action==='EQUIPPED'?'EQUIPPED':p.owned?'OWNED':'LOCKED'}</small></button>`;
  }
  function detailHtml(p){
    const art=p.artPath?`<img src="${esc(p.artPath)}" alt="${esc(p.name)} sleeve" onerror="this.hidden=true;this.parentElement.classList.add('art-failed')">`:'<div class="customise-secret-art large">?</div>';
    const req=p.requirement?`<p>${esc(p.requirement)}</p>`:(p.hidden&&p.name==='???'?'<p>Keep exploring Lucky Dex to uncover this secret sleeve.</p>':'');
    const action=p.action==='EQUIP'?`<button class="primary full" type="button" data-equip-sleeve="${esc(p.id)}">EQUIP</button>`:`<button class="secondary full" type="button" disabled>${esc(p.action)}</button>`;
    return `<div class="customise-detail-art">${art}</div><div class="customise-detail-copy"><div class="eyebrow">${esc(p.sourceFamily||'UNDISCOVERED SLEEVE')}</div><h3>${esc(p.name)}</h3>${req}${action}</div>`;
  }
  function visibleRows(){
    const state=current(),core=deps?.core||defaultCore;
    const search=query.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    return (catalogue.CATALOGUE||[]).map(x=>presentation(x,state,core)).filter(Boolean).filter(p=>category==='all'||p.themes.includes(category)||p.category===category).filter(p=>source==='all'||p.sourceFamily===source).filter(p=>ownership==='all'||(ownership==='owned'?p.owned:!p.owned)).filter(p=>!search||p.searchText.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(search));
  }
  function refreshSummary(){
    if(typeof document==='undefined'||!deps)return;
    const state=current(),entry=(deps.core||defaultCore)?.activeSleeve?.(state);
    const name=document.getElementById('customiseSummaryName'),preview=document.getElementById('customiseSummaryPreview');
    if(name)name.textContent=entry?.realName||entry?.name||'LuckyDex Default';
    if(preview)preview.innerHTML=entry?.artPath?`<img src="${esc(entry.artPath)}" alt="" onerror="this.remove()">`:'';
  }
  function render(){
    if(typeof document==='undefined'||!deps)return;
    refreshSummary();
    const grid=document.getElementById('customiseSleeveGrid'),detail=document.getElementById('customiseSleeveDetail');
    if(!grid||!detail)return;
    const rows=visibleRows();
    const count=document.getElementById('customiseCatalogueCount');if(count)count.textContent=`${rows.length} of ${(catalogue.CATALOGUE||[]).length} sleeves`;
    if(!rows.some(x=>x.id===selectedId))selectedId=rows[0]?.id||'luckydex-default';
    grid.innerHTML=rows.length?rows.map(rowHtml).join(''):'<div class="empty compact-empty customise-empty">No sleeves in this filter.</div>';
    const selected=rows.find(x=>x.id===selectedId)||presentation((catalogue.CATALOGUE||[]).find(x=>x.id===selectedId),current(),deps.core||defaultCore);
    detail.innerHTML=selected?detailHtml(selected):'';
    grid.querySelectorAll('[data-sleeve-id]').forEach(btn=>btn.onclick=()=>{selectedId=btn.dataset.sleeveId;render();const dialog=document.getElementById('customisePreviewDialog');if(dialog&&!dialog.open)dialog.showModal();});
    detail.querySelector('[data-equip-sleeve]')?.addEventListener('click',e=>{
      const state=current(),result=(deps.core||defaultCore).equipSleeve(state,e.currentTarget.dataset.equipSleeve);
      if(!result.ok){deps.showToast?.('That sleeve is still locked.');return;}
      deps.save?.();deps.onChange?.();render();
    });
  }
  function show(){
    if(typeof document==='undefined')return;
    const main=document.getElementById('profileMainView'),ach=document.getElementById('profileAchievementsView'),view=document.getElementById('profileCustomiseView');
    if(main)main.hidden=true;if(ach)ach.hidden=true;if(view)view.hidden=false;render();
    const page=document.querySelector('.page[data-page="profile"]');if(page)page.scrollTop=0;
  }
  function hide(){
    if(typeof document==='undefined')return;
    const main=document.getElementById('profileMainView'),view=document.getElementById('profileCustomiseView');
    if(view)view.hidden=true;if(main)main.hidden=false;refreshSummary();
    document.getElementById('customisePreviewDialog')?.close();
  }
  function install(options={}){
    deps={core:defaultCore,...options};
    if(typeof document==='undefined')return true;
    if(!installed){
      document.getElementById('customiseSummaryCard')?.addEventListener('click',show);
      document.getElementById('customiseBackBtn')?.addEventListener('click',()=>{hide();deps.onBack?.();});
      document.querySelectorAll('[data-cosmetic-filter]').forEach(btn=>btn.addEventListener('click',()=>{ownership=btn.dataset.cosmeticFilter;document.querySelectorAll('[data-cosmetic-filter]').forEach(x=>x.classList.toggle('active',x===btn));render();}));
      document.getElementById('customiseCategoryFilter')?.addEventListener('change',e=>{category=e.target.value;render();});
      document.getElementById('customiseSourceFilter')?.addEventListener('change',e=>{source=e.target.value;render();});
      document.getElementById('customiseSleeveSearch')?.addEventListener('input',e=>{query=e.target.value;render();});
      document.getElementById('customisePreviewClose')?.addEventListener('click',()=>document.getElementById('customisePreviewDialog')?.close());
      const dialog=document.getElementById('customisePreviewDialog');dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
      const themes=document.getElementById('customiseCategoryFilter');if(themes){const choices=[...new Set((catalogue.CATALOGUE||[]).flatMap(e=>e.hidden?['Secrets']:e.themes||[e.category]))].sort();themes.innerHTML='<option value="all">All themes</option>'+choices.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');}
      installed=true;
    }
    refreshSummary();return true;
  }
  return {install,render,show,hide,refreshSummary,presentation};
});
