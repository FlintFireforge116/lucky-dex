(function(root,factory){
  const sleeves=(typeof module==='object'&&module.exports)?require('./cosmetics-catalog-v0413.js'):root.LuckyDexCosmeticsCatalogV0413;
  const playmats=(typeof module==='object'&&module.exports)?require('./cosmetics-playmats-v06958.js'):root.LuckyDexPlaymatCatalogV06958;
  const core=(typeof module==='object'&&module.exports)?require('./cosmetics-core-v0413.js'):root.LuckyDexCosmeticsV0413;
  const api=factory(sleeves||{CATALOGUE:[]},playmats||{CATALOGUE:[]},core);
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexCustomiseV0413=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(sleeves,playmats,defaultCore){
  'use strict';
  let deps=null,kind='sleeves',ownership='all',category='all',source='all',query='',selectedId='luckydex-default',installed=false;
  const esc=s=>String(s??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const currentCatalogue=()=>kind==='playmats'?(playmats.CATALOGUE||[]):(sleeves.CATALOGUE||[]);
  const defaultId=()=>kind==='playmats'?'pocket-eevee':'luckydex-default';
  function presentation(entry,state,core=defaultCore){
    if(!entry)return null;
    const discovered=kind==='playmats'||!entry.hidden||core?.isDiscovered?.(state,entry.sourceAchievementId)||false;
    if(entry.hidden&&!discovered)return {id:entry.id,name:'???',artPath:'',requirement:'',action:'LOCKED',hidden:true,owned:false,category:entry.category,tier:entry.tier,sourceFamily:'',themes:['Secrets'],searchText:'???',kind};
    const owned=kind==='playmats'?!!core?.isPlaymatOwned?.(state,entry.id):!!core?.isOwned?.(state,entry.id);
    const active=kind==='playmats'?core?.activePlaymat?.(state)?.id===entry.id:core?.activeSleeve?.(state)?.id===entry.id;
    const name=entry.hidden?(entry.realName||entry.name):entry.name;
    return {id:entry.id,name,artPath:entry.artPath,requirement:owned?'':entry.unlockText,action:active?'EQUIPPED':owned?'EQUIP':'LOCKED',hidden:!!entry.hidden,owned,category:entry.category||'Playmat',tier:entry.tier,sourceFamily:entry.sourceFamily||'LuckyDex',themes:entry.themes||[entry.category||'Playmat'],searchText:[name,...(entry.searchTerms||[])].join(' '),kind};
  }
  function current(){return deps?.getState?.()||{};}
  function rowHtml(p){
    const noun=kind==='playmats'?'playmat':'sleeve',art=p.artPath?`<img src="${esc(p.artPath)}" alt="${esc(p.name)} ${noun}" loading="lazy" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add('art-failed')">`:'<div class="customise-secret-art">?</div>';
    return `<button class="customise-sleeve-tile ${kind==='playmats'?'customise-playmat-tile ':''}${p.owned?'owned':'locked'}" type="button" data-cosmetic-id="${esc(p.id)}"><span class="customise-sleeve-art ${kind==='playmats'?'customise-playmat-art':''}">${art}</span><b>${esc(p.name)}</b><small>${p.action==='EQUIPPED'?'EQUIPPED':p.owned?'OWNED':'LOCKED'}</small></button>`;
  }
  function detailHtml(p){
    const noun=kind==='playmats'?'playmat':'sleeve',art=p.artPath?`<img src="${esc(p.artPath)}" alt="${esc(p.name)} ${noun}" onerror="this.hidden=true;this.parentElement.classList.add('art-failed')">`:'<div class="customise-secret-art large">?</div>';
    const req=p.requirement?`<p>${esc(p.requirement)}</p>`:(p.hidden&&p.name==='???'?`<p>Keep exploring Lucky Dex to uncover this secret ${noun}.</p>`:'');
    const attr=kind==='playmats'?'data-equip-playmat':'data-equip-sleeve',action=p.action==='EQUIP'?`<button class="primary full" type="button" ${attr}="${esc(p.id)}">EQUIP</button>`:`<button class="secondary full" type="button" disabled>${esc(p.action)}</button>`;
    return `<div class="customise-detail-art ${kind==='playmats'?'customise-playmat-detail':''}">${art}</div><div class="customise-detail-copy"><div class="eyebrow">${esc(p.sourceFamily||('UNDISCOVERED '+noun.toUpperCase()))}</div><h3>${esc(p.name)}</h3>${req}${action}</div>`;
  }
  function visibleRows(){
    const state=current(),core=deps?.core||defaultCore,search=query.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    return currentCatalogue().map(x=>presentation(x,state,core)).filter(Boolean).filter(p=>category==='all'||p.themes.includes(category)||p.category===category).filter(p=>source==='all'||p.sourceFamily===source).filter(p=>ownership==='all'||(ownership==='owned'?p.owned:!p.owned)).filter(p=>!search||p.searchText.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(search));
  }
  function rebuildThemeOptions(){
    const themes=document.getElementById('customiseCategoryFilter');if(!themes)return;
    const choices=[...new Set(currentCatalogue().flatMap(e=>e.hidden?['Secrets']:e.themes||[e.category]).filter(Boolean))].sort();
    themes.innerHTML='<option value="all">All themes</option>'+choices.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');themes.value=choices.includes(category)?category:'all';if(themes.value==='all')category='all';
  }
  function refreshSummary(){
    if(typeof document==='undefined'||!deps)return;
    const state=current(),core=deps.core||defaultCore,sleeve=core?.activeSleeve?.(state),mat=core?.activePlaymat?.(state);
    const name=document.getElementById('customiseSummaryName'),preview=document.getElementById('customiseSummaryPreview');
    if(name)name.textContent=`${sleeve?.realName||sleeve?.name||'LuckyDex Default'} · ${mat?.name||'Eevee'}`;
    if(preview)preview.innerHTML=sleeve?.artPath?`<img src="${esc(sleeve.artPath)}" alt="" onerror="this.remove()">`:'';
  }
  function render(){
    if(typeof document==='undefined'||!deps)return;refreshSummary();
    const grid=document.getElementById('customiseSleeveGrid'),detail=document.getElementById('customiseSleeveDetail');if(!grid||!detail)return;
    document.querySelectorAll('[data-cosmetic-kind]').forEach(btn=>btn.classList.toggle('active',btn.dataset.cosmeticKind===kind));
    const label=document.querySelector('.customise-search>span'),input=document.getElementById('customiseSleeveSearch');if(label)label.textContent=kind==='playmats'?'SEARCH PLAYMATS':'SEARCH SLEEVES';if(input)input.placeholder=kind==='playmats'?'Pokémon, trainer or playmat name':'Pokémon, trainer or sleeve name';
    const rows=visibleRows(),cat=currentCatalogue(),count=document.getElementById('customiseCatalogueCount');if(count)count.textContent=`${rows.length} of ${cat.length} ${kind}`;
    if(!rows.some(x=>x.id===selectedId))selectedId=rows[0]?.id||defaultId();
    grid.innerHTML=rows.length?rows.map(rowHtml).join(''):`<div class="empty compact-empty customise-empty">No ${kind} in this filter.</div>`;
    const selected=rows.find(x=>x.id===selectedId)||presentation(cat.find(x=>x.id===selectedId),current(),deps.core||defaultCore);detail.innerHTML=selected?detailHtml(selected):'';
    grid.querySelectorAll('[data-cosmetic-id]').forEach(btn=>btn.onclick=()=>{selectedId=btn.dataset.cosmeticId;render();const dialog=document.getElementById('customisePreviewDialog');if(dialog&&!dialog.open)dialog.showModal();});
    detail.querySelector('[data-equip-sleeve]')?.addEventListener('click',e=>equip(e.currentTarget.dataset.equipSleeve,false));
    detail.querySelector('[data-equip-playmat]')?.addEventListener('click',e=>equip(e.currentTarget.dataset.equipPlaymat,true));
  }
  function equip(id,isPlaymat){const state=current(),core=deps.core||defaultCore,result=isPlaymat?core.equipPlaymat(state,id):core.equipSleeve(state,id);if(!result.ok){deps.showToast?.(`That ${isPlaymat?'playmat':'sleeve'} is still locked.`);return;}deps.save?.();deps.onChange?.();render();}
  function switchKind(next){kind=next==='playmats'?'playmats':'sleeves';selectedId=defaultId();category='all';rebuildThemeOptions();render();}
  function show(){if(typeof document==='undefined')return;const main=document.getElementById('profileMainView'),ach=document.getElementById('profileAchievementsView'),view=document.getElementById('profileCustomiseView');if(main)main.hidden=true;if(ach)ach.hidden=true;if(view)view.hidden=false;render();const page=document.querySelector('.page[data-page="profile"]');if(page)page.scrollTop=0;}
  function hide(){if(typeof document==='undefined')return;const main=document.getElementById('profileMainView'),view=document.getElementById('profileCustomiseView');if(view)view.hidden=true;if(main)main.hidden=false;refreshSummary();document.getElementById('customisePreviewDialog')?.close();}
  function install(options={}){
    deps={core:defaultCore,...options};if(typeof document==='undefined')return true;
    if(!installed){
      document.getElementById('customiseSummaryCard')?.addEventListener('click',show);document.getElementById('customiseBackBtn')?.addEventListener('click',()=>{hide();deps.onBack?.();});
      document.querySelectorAll('[data-cosmetic-kind]').forEach(btn=>btn.addEventListener('click',()=>switchKind(btn.dataset.cosmeticKind)));
      document.querySelectorAll('[data-cosmetic-filter]').forEach(btn=>btn.addEventListener('click',()=>{ownership=btn.dataset.cosmeticFilter;document.querySelectorAll('[data-cosmetic-filter]').forEach(x=>x.classList.toggle('active',x===btn));render();}));
      document.getElementById('customiseCategoryFilter')?.addEventListener('change',e=>{category=e.target.value;render();});document.getElementById('customiseSourceFilter')?.addEventListener('change',e=>{source=e.target.value;render();});document.getElementById('customiseSleeveSearch')?.addEventListener('input',e=>{query=e.target.value;render();});
      document.getElementById('customisePreviewClose')?.addEventListener('click',()=>document.getElementById('customisePreviewDialog')?.close());const dialog=document.getElementById('customisePreviewDialog');dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});installed=true;
    }
    rebuildThemeOptions();refreshSummary();return true;
  }
  return {install,render,show,hide,refreshSummary,presentation,switchKind};
});
