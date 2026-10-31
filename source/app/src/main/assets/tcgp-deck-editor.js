(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.LuckyDexTCGPDeckEditor=factory(root);})(typeof globalThis!=='undefined'?globalThis:this,function(root){
 'use strict';
 const D=root.LuckyDexTCGPBattleData,K=root.LuckyDexTCGPBattleDecks,W=root.LuckyDexTCGPDeckWorkspace;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const el=id=>root.document.getElementById(id);
 let host,draft,filters={owned:true},search='',sort='number',page=0,developer=false,message='',sheet=null,rows=[],recipeView=null;
 let buildSerial=0,buildTimer=null;
 function cancelBuild(){buildSerial++;root.clearTimeout(buildTimer);buildTimer=null;}
 function close(){cancelBuild();host=null;draft=null;}
 const btn=(action,label,attrs='')=>`<button type="button" data-deck="${action}" ${attrs}>${label}</button>`;
 function refreshRows(){rows=W.catalogue(host.owned());}
 function art(card){const url=host.art(card.loaner?'P-A-005':card.id);return url?`<img src="${esc(url)}" alt="${esc(card.name)}" loading="lazy" onerror="this.hidden=true">`:`<span class="tcgp-editor-fallback">${esc(card.name)}</span>`;}
 function counts(){return W.counts(draft.cards);}
 function tile(card,deck=false){
  const n=counts().get(card.id)||0,row=rows.find(r=>r.gameplayId===card.id),canAdd=W.edit(draft.cards,card.id,1,host.owned()).ok;
  return `<article class="tcgp-editor-card${deck?' in-deck':''}">${btn('inspect',art(card),`data-id="${esc(card.id)}" class="tcgp-editor-art" aria-label="Inspect ${esc(card.name)}"`)}<b class="tcgp-editor-card-name">${esc(card.name)}</b><small>${deck?`${esc(card.stage||card.trainerType||'Trainer')} · ×${n}`:`Owned ${row?.quantity||0} · Deck ${n}`}</small><div class="tcgp-editor-stepper">${btn('remove','−',`data-id="${esc(card.id)}" data-tcgp-action="remove-card" data-card-id="${esc(card.id)}" aria-label="Remove ${esc(card.name)}" ${n?'':'disabled'}`)}<b>${n}</b>${btn('add','+',`data-id="${esc(card.id)}" aria-label="Add ${esc(card.name)}" ${canAdd?'':'disabled'}`)}</div></article>`;
 }
 function energy(){if(draft.energyMode!=='manual')draft.energyTypes=K.analyzeDeck(draft.cards).recommendedEnergyTypes;return draft.energyTypes||[];}
 function deckHtml(){
  const types=energy(),cards=[...counts()].map(([id])=>D.cardById(id)).filter(Boolean),pokemon=draft.cards.map(D.cardById).filter(c=>c?.kind==='pokemon').length;
  return `<header><h2>MY DECK <span>· ${draft.cards.length} / 20</span></h2>${btn('energy',`${types.join(' / ')||'Auto Energy'} ▾`,`aria-label="Configure Energy"`)}</header><div class="tcgp-editor-composition">${pokemon} Pokémon · ${draft.cards.length-pokemon} Trainers · ${draft.energyMode==='manual'?'Manual':'Auto'} Energy</div><div class="tcgp-editor-deck-grid">${cards.length?cards.map(c=>tile(c,true)).join(''):'<p>Choose a card below to start your deck.</p>'}</div>`;
 }
 function open(options){
  cancelBuild();
  host=options;const state=K.ensureBattleState(host.state()),old=options.deck||state.decks.find(d=>d.id===state.activeDeckId);
  draft=old?{...old,cards:old.cards.slice(),energyTypes:K.deckEnergyTypes(old)}:{name:'My Pocket Deck',cards:[],energyMode:'auto',energyTypes:[]};
  search='';page=0;message='';recipeView=null;sheet=null;refreshRows();mount();if(options.quick)autoBuild('recommended');
 }
 function mount(){
  host.container.innerHTML=`<div id="tcgpDeckWorkspace" class="tcgp-editor"><div class="tcgp-editor-top"><input id="tcgpDeckName" maxlength="40" value="${esc(draft.name)}" aria-label="Deck name"><nav>${btn('manage','Decks')}${btn('auto','Auto build')}${btn('save','Save')}</nav></div><section id="tcgpMyDeck" class="tcgp-editor-mydeck">${deckHtml()}</section><div class="tcgp-editor-tools"><input id="tcgpDeckSearch" type="search" value="${esc(search)}" placeholder="Search cards, attacks, rules…" aria-label="Search cards"><div>${btn('filters','Filter')}${btn('sort','Sort ▾')}${btn('recipes','Recipes')}${btn('developer',developer?'Developer ✓':'Developer')}</div><p id="tcgpEditorMessage" role="status"></p></div><section id="tcgpDeckResults"></section><div id="tcgpEditorModal"></div></div>`;
  el('tcgpDeckWorkspace').addEventListener('click',click);
  el('tcgpDeckName').addEventListener('input',e=>draft.name=e.target.value);
  el('tcgpDeckSearch').addEventListener('input',e=>{search=e.target.value;page=0;renderResults();});
  renderResults();updateMessage();
 }
 function updateMessage(){el('tcgpEditorMessage').textContent=message;}
 function update(){const scroller=el('tcgpMyDeck')?.querySelector('.tcgp-editor-deck-grid'),scroll=scroller?.scrollTop||0,left=scroller?.scrollLeft||0;el('tcgpMyDeck').innerHTML=deckHtml();const tray=el('tcgpMyDeck').querySelector('.tcgp-editor-deck-grid');tray.scrollTop=scroll;tray.scrollLeft=left;renderResults();updateMessage();}
 function renderResults(){
  const r=W.query(rows,{search,filters,sort,cards:draft.cards,page,pageSize:48,developer});page=r.page;
  el('tcgpDeckResults').innerHTML=`<div class="tcgp-editor-result-bar"><b>COLLECTION · ${r.total}</b><small>${r.total?page*48+1:0}–${Math.min(r.total,(page+1)*48)} of ${r.total}</small></div><div class="tcgp-editor-grid">${r.rows.map(row=>tile(row.card)).join('')||'<p>No matching cards. Change your filters.</p>'}</div><nav class="tcgp-editor-pages">${btn('previous','‹ Previous',page?'':'disabled')}<span>${page+1} / ${r.pages}</span>${btn('next','Next ›',page+1<r.pages?'':'disabled')}</nav>`;
 }
 function showSheet(title,body){sheet=title;el('tcgpEditorModal').innerHTML=`<div class="tcgp-editor-shade"><section class="tcgp-editor-sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><h2>${esc(title)}</h2>${btn('close-sheet','×','aria-label="Close panel"')}</header>${body}</section></div>`;el('tcgpEditorModal').querySelector('[data-deck="close-sheet"]').focus();}
 function closeSheet(){sheet=null;el('tcgpEditorModal').innerHTML='';}
 function chips(key,values){return `<div class="tcgp-editor-chips">${values.map(v=>{const value=typeof v==='object'?v.value:v,label=typeof v==='object'?v.label:v;const selected=Array.isArray(filters[key])?filters[key].includes(value):String(filters[key])===String(value);return `<button type="button" data-filter="${key}" data-value="${esc(value)}" aria-pressed="${selected}">${esc(label)}</button>`;}).join('')}</div>`;}
 function filterSheet(){
  showSheet('Filter cards',`<div class="tcgp-editor-filter-body"><h3>Card category</h3>${chips('category',['Pokémon','Trainer','Item','Supporter','Tool','Stadium','Fossil'])}<h3>Type · select two to require both</h3>${chips('types',W.TYPES)}<h3>Evolution</h3>${chips('stage',['Basic','Stage 1','Stage 2'])}<h3>Special / collection</h3>${chips('ex',[{value:'true',label:'Pokémon ex'}])}${chips('mega',[{value:'true',label:'Mega'}])}${chips('owned',[{value:'true',label:'Owned only'}])}${chips('ability',[{value:'true',label:'Has Ability'}])}${chips('enabled',[{value:'true',label:'Battle ready'}])}<h3>Number owned · minimum</h3>${chips('minOwned',['1','2','3','4'])}<h3>In this deck</h3>${chips('inDeck',[{value:'yes',label:'In deck'},{value:'no',label:'Not in deck'}])}<h3>Attack Energy requirement</h3>${chips('energy',W.TYPES.filter(t=>t!=='Dragon'))}<h3>Retreat cost</h3>${chips('retreat',['0','1','2','3','4'])}<h3>Expansion</h3>${chips('setId',D.SETS.filter(s=>D.PRINTS.some(p=>p.setId===s.id)).map(s=>({value:s.id,label:`${s.id} · ${s.name}`})))}${developer?`<h3>Implementation status</h3>${chips('status',['FULL','PARTIAL','UNSUPPORTED'])}`:''}</div><footer>${btn('reset-filters','Reset')}${btn('apply-filters','Show cards')}</footer>`);
 }
 function inspect(id){const c=D.cardById(id);if(!c)return;showSheet(c.name,`<div class="tcgp-editor-inspect">${art(c)}<div><p>${esc(W.typesOf(c).join(' / '))} · ${esc(c.stage||c.trainerType)} ${c.hp?`· ${c.hp} HP`:''}</p>${c.evolvesFrom?`<p>Evolves from ${esc(c.evolvesFrom)}</p>`:''}${host.rules(c)}${c.text?`<p>${esc(c.text)}</p>`:''}${developer?`<p>${esc(c.support?.status)} ${esc(c.support?.reasons?.join(' ')||'')}</p>${btn('test-card','Build test setup',`data-id="${esc(c.id)}"`)}`:''}${btn('focus-card','Build around this card',`data-id="${esc(c.id)}" ${c.battleEnabled?'':'disabled'}`)}</div></div>`);}
 function save(){const r=W.saveDraft(host.state(),draft,host.owned());message=r.ok?(r.deck.draft?'Draft saved · '+(r.readiness.errors.find(e=>e.includes('Energy'))||'finish 20 cards to battle.'):'Deck saved · ready to battle.'):r.errors.join(' ');if(r.ok){draft={...r.deck,cards:r.deck.cards.slice()};host.save();}updateMessage();}
 function manage(){const b=K.ensureBattleState(host.state());showSheet('My decks',`${btn('new','+ New deck')}${btn('auto-new','Auto build new')}<div class="tcgp-editor-saved">${b.decks.map(d=>`<article><h3>${esc(d.name)} ${b.activeDeckId===d.id?'★':''}</h3><div class="tcgp-editor-preview">${[...new Set(d.cards)].slice(0,5).map(id=>D.cardById(id)).filter(Boolean).map(art).join('')}</div><small>${d.cards.length}/20 · ${W.readiness(d,host.owned()).ok?'Battle ready':'Draft / check cards and Energy'}</small><nav>${btn('edit-saved','Edit',`data-id="${esc(d.id)}"`)}${btn('activate','Active',`data-id="${esc(d.id)}"`)}${btn('duplicate','Copy',`data-id="${esc(d.id)}"`)}${btn('delete','Delete',`data-id="${esc(d.id)}"`)}</nav></article>`).join('')||'<p>No saved decks yet.</p>'}</div>${btn('battle','Battle with active deck')}`);}
 function autoSheet(){showSheet('Auto build',`<p>Build only with your owned, battle-ready cards.</p><div class="tcgp-editor-options">${btn('recommended','Recommended / Best available')}${btn('repair','Fill / repair this deck')}${btn('around-type','Build around type')}${btn('pick-card','Build around card')}</div>${developer?'<details><summary>Developer / Testing</summary><label>Focus <select id="tcgpTestKind"><option value="card">Card ID</option><option value="type">Type</option><option value="setId">Set</option><option value="mechanic">Mechanic</option><option value="status">Status</option></select></label><input id="tcgpTestValue" placeholder="A1-083"><button data-deck="test-build" data-tcgp-action="test-build">Build focused test deck</button></details>':''}`);}
 function autoBuild(mode,extra={}){
  cancelBuild();const serial=buildSerial,owner=host,target=draft,options={...(mode==='existing'?{mode,cards:draft.cards.slice()}:{}),...extra};
  closeSheet();message='Building candidate decks…';updateMessage();
  // Let the feedback paint before bounded CPU work; no game state mutation.
  const cancelled=()=>serial!==buildSerial||host!==owner||draft!==target||!el('tcgpDeckWorkspace');
  buildTimer=root.setTimeout(async()=>{if(cancelled())return;try{const r=await K.buildDeckAsync(owner.owned(),options,{isCancelled:cancelled});if(!r||cancelled())return;message=r.ok?r.strategy:r.errors.join(' ');if(r.ok){target.cards=r.cards;target.energyTypes=r.energyTypes;target.energyMode='auto';}update();}catch(error){if(!cancelled()){message='Could not build this deck: '+error.message;updateMessage();}}},25);
 }
 function energySheet(){showSheet('Energy Zone',`<p>Energy is generated separately from the 20-card deck.</p>${btn('energy-auto','Automatic · follow attack costs')}<div class="tcgp-editor-chips">${K.ENERGY_TYPES.map(t=>btn('energy-type',esc(t),`data-id="${t}" aria-pressed="${energy().includes(t)}"`)).join('')}</div><div class="tcgp-deck-warnings">${K.analyzeDeck(draft.cards,energy()).warnings.map(w=>`<p>${esc(w.message)}</p>`).join('')}</div>`);}
 function recipes(){
  const b=K.ensureBattleState(host.state()),suggested=[{name:'Ivysaur learning deck',cards:K.LOANER_PLAYER_DECK},...b.decks.map(d=>({name:d.name+' recipe',cards:d.cards}))];
  showSheet('Local recipes',`<p>Recipes do not grant cards. Only owned copies can enter your playable deck.</p>${suggested.map((r,i)=>{const status=W.recipe(r.cards,host.owned());return `<article><h3>${esc(r.name)}</h3><b>${status.owned} / ${status.total} cards owned</b><p>${status.missing.map(m=>`${esc(D.cardById(m.cardId)?.name||m.cardId)} ×${m.quantity}`).join(' · ')||'Complete collection'}</p>${btn('load-recipe','Use owned cards',`data-id="${i}"`)}</article>`;}).join('')}`);recipeView=suggested;
 }
 function testCard(id){const r=K.buildTestSetup(host.owned(),{cardId:id});showSheet('Test setup',`<h3>${esc(D.cardById(id)?.name)}</h3><p>${r.ready?'Owned legal player deck ready.':'Review setup only · not battle ready.'}</p><ul>${r.prerequisites.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><p>${esc(r.blockers.join(' '))}</p><p>Attempted cards: ${r.attemptedCards.map(id=>esc(D.cardById(id)?.name||id)).join(' → ')}</p><p>${esc(r.opponentNotice)}</p>${r.ready?btn('use-test','Use player test deck',`data-id="${esc(id)}"`)+btn('play-test','Play test pair · no rewards',`data-id="${esc(id)}"`):''}`);}
 function click(event){
  const filter=event.target.closest('[data-filter]');if(filter){event.stopPropagation();const k=filter.dataset.filter,v=filter.dataset.value;if(k==='types'){const set=new Set(filters.types||[]);set.has(v)?set.delete(v):set.add(v);filters.types=[...set];}else if(['owned','ex','mega','ability','enabled'].includes(k))filters[k]=!filters[k];else filters[k]=String(filters[k])===v?'':v;page=0;const top=el('tcgpEditorModal').querySelector('.tcgp-editor-sheet').scrollTop;filterSheet();el('tcgpEditorModal').querySelector('.tcgp-editor-sheet').scrollTop=top;return;}
  const node=event.target.closest('[data-deck]');if(!node)return;event.stopPropagation();const action=node.dataset.deck,id=node.dataset.id;
  if(action==='close-sheet')return closeSheet();
  if(action==='inspect')return inspect(id);
  if(action==='add'||action==='remove'){cancelBuild();const r=W.edit(draft.cards,id,action==='add'?1:-1,host.owned());draft.cards=r.cards;message=r.error||'';return update();}
  if(action==='filters')return filterSheet();if(action==='apply-filters'){closeSheet();page=0;return renderResults();}if(action==='reset-filters'){filters={};return filterSheet();}
  if(action==='next'||action==='previous'){page+=action==='next'?1:-1;return renderResults();}
  if(action==='sort')return showSheet('Sort cards',`<div class="tcgp-editor-options">${[['number','Card number / set'],['name','Name'],['type','Type'],['hp','HP'],['recent','Recently obtained'],['owned','Number owned'],['stage','Evolution stage']].map(([id,label])=>btn('sort-by',label,`data-id="${id}"`)).join('')}</div>`);
  if(action==='sort-by'){sort=id;page=0;closeSheet();return renderResults();}
  if(action==='save')return save();if(action==='manage')return manage();
  if(action==='new'||action==='auto-new'){cancelBuild();message='';draft={name:'New Pocket Deck',cards:[],energyMode:'auto',energyTypes:[]};closeSheet();mount();if(action==='auto-new')autoBuild('recommended');return;}
  if(action==='duplicate'){W.duplicate(host.state(),id);host.save();return manage();}
  if(action==='delete')return showSheet('Delete deck?',`<p>Delete this saved deck? Your collection is unchanged.</p>${btn('confirm-delete','Delete saved deck',`data-id="${esc(id)}"`)}`);
  if(action==='confirm-delete'){W.remove(host.state(),id);if(draft.id===id)delete draft.id;host.save();return manage();}
  if(action==='activate'){W.activate(host.state(),id);host.save();return manage();}
  if(action==='edit-saved'){const d=K.ensureBattleState(host.state()).decks.find(d=>d.id===id);if(d){draft={...d,cards:d.cards.slice(),energyTypes:K.deckEnergyTypes(d)};closeSheet();mount();}return;}
  if(action==='battle'){closeSheet();return host.battle();}
  if(action==='auto')return autoSheet();if(action==='recommended')return autoBuild('recommended');if(action==='repair')return autoBuild('existing');
  if(action==='around-type')return showSheet('Build around type',`<div class="tcgp-editor-chips">${W.TYPES.map(t=>btn('focus-type',t,`data-id="${t}"`)).join('')}</div>`);
  if(action==='focus-type')return autoBuild('type',{type:id});if(action==='focus-card')return autoBuild('card',{cardId:id});
  if(action==='pick-card'){closeSheet();message='Tap a collection card, then choose “Build around this card”.';return updateMessage();}
  if(action==='energy')return energySheet();if(action==='energy-auto'){draft.energyMode='auto';update();return energySheet();}
  if(action==='energy-type'){let selected=energy().slice();selected=selected.includes(id)?selected.filter(t=>t!==id):[...selected,id];if(!selected.length||selected.length>3)return;draft.energyMode='manual';draft.energyTypes=selected;update();return energySheet();}
  if(action==='recipes')return recipes();if(action==='load-recipe'){const r=recipeView?.[Number(id)];if(!r)return;draft={name:r.name,cards:[],energyMode:'auto',energyTypes:[]};for(const card of r.cards){const edit=W.edit(draft.cards,card,1,host.owned());if(edit.ok)draft.cards=edit.cards;}message='Owned recipe cards loaded. Missing cards were not added.';closeSheet();mount();return;}
  if(action==='developer'){developer=!developer;if(!developer)delete filters.status;el('tcgpDeckWorkspace').querySelector('[data-deck="developer"]').textContent=developer?'Developer ✓':'Developer';return renderResults();}
  if(action==='play-test'){const r=K.buildTestSetup(host.owned(),{cardId:id});if(r.ready){closeSheet();host.playTest(r);}return;}if(action==='test-card')return testCard(id);if(action==='use-test'){const r=K.buildTestSetup(host.owned(),{cardId:id});if(r.ready){draft.cards=r.cards;draft.energyMode='auto';draft.energyTypes=r.energyTypes;}closeSheet();return update();}
  if(action==='test-build'){const kind=el('tcgpTestKind').value,value=el('tcgpTestValue').value.trim();if(kind==='card')return testCard(value);return autoBuild('developer',{[kind]:value});}
 }
 return {open,close};
});
