/* Shared, scalable set picker for the Classic30 deck builders and CPU opponents. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicSetPicker=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const rows=[
 ['base1','Base Set','Original'],['base2','Jungle','Original'],['base3','Fossil','Original'],['base5','Team Rocket','Original'],['gym1','Gym Heroes','Gym'],['gym2','Gym Challenge','Gym'],
 ['neo1','Neo Genesis','Neo'],['neo2','Neo Discovery','Neo'],['neo3','Neo Revelation','Neo'],['neo4','Neo Destiny','Neo'],
 ['base6','Legendary Collection','Original'],['ecard1','Expedition Base Set','e-Card'],['ecard2','Aquapolis','e-Card'],['ecard3','Skyridge','e-Card'],['ex1','EX Ruby & Sapphire','EX'],['ex2','EX Sandstorm','EX'],['ex3','EX Dragon','EX'],['ex4','EX Team Magma vs Team Aqua','EX'],['ex5','EX Hidden Legends','EX'],['ex6','EX FireRed & LeafGreen','EX'],
 ['SNAPFLORIO','Florio Nature Park','New Pokémon Snap'],['SNAPFOUNJA','Founja Jungle','New Pokémon Snap'],['sv1','Scarlet & Violet','Modern']
];
const names=Object.fromEntries(rows.map(([id,name])=>[id,name]));
const eras=['Original','Gym','Neo','e-Card','EX','New Pokémon Snap','Modern'];
const escape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function html({ids,selected,mode='classic',title='Allowed sets',state={}}){
 const allowed=new Set(ids),chosen=new Set(selected),sort=state.sort||'release';
 const chosenRows=rows.filter(([id])=>allowed.has(id));
 const show=chosenRows.sort((a,b)=>sort==='az'?a[1].localeCompare(b[1]):sort==='za'?b[1].localeCompare(a[1]):0);
 const groups=sort==='release'?eras.map(era=>[era,show.filter(row=>row[2]===era)]):[['All expansions',show]];
 return `<div class="tcg-set-selector" data-set-selector="${escape(mode)}"><div class="tcg-set-heading"><b>${escape(title)}</b><small data-set-count>${chosenRows.filter(([id])=>chosen.has(id)).length} / ${chosenRows.length} selected</small></div><div class="tcg-set-controls"><input type="search" data-set-search aria-label="Search expansions" value="${escape(state.search||'')}" placeholder="Search expansions…"><select data-set-sort aria-label="Sort expansions"><option value="release" ${sort==='release'?'selected':''}>By era</option><option value="az" ${sort==='az'?'selected':''}>Name A–Z</option><option value="za" ${sort==='za'?'selected':''}>Name Z–A</option></select></div><div class="tcg-set-bulk"><button type="button" data-set-bulk="all">Select all</button><button type="button" data-set-bulk="none">Select none</button><button type="button" data-set-bulk="invert">Invert</button><button type="button" data-set-selected-only aria-pressed="${!!state.selectedOnly}">Selected only</button></div><div class="tcg-set-eras">${groups.filter(([,list])=>list.length).map(([name,list])=>`<details data-set-era="${escape(name)}"><summary>${escape(name)} <small>${list.filter(([id])=>chosen.has(id)).length}/${list.length}</small></summary><div class="tcg-set-choices">${list.map(([id,label,era])=>`<button type="button" data-set-choice="${escape(id)}" data-set-name="${escape(label.toLowerCase()+' '+era.toLowerCase())}" aria-pressed="${chosen.has(id)}">${escape(label)}</button>`).join('')}</div></details>`).join('')}</div><p class="tcg-set-warning" data-set-warning ${selected.length?'hidden':''}>No sets selected — choose at least one before building a deck or starting a match.</p></div>`;
}
function refresh(node,selected,state={}){if(!node)return;const chosen=new Set(selected),buttons=Array.from(node.querySelectorAll('[data-set-choice]'));
 buttons.forEach(button=>{const active=chosen.has(button.dataset.setChoice);button.setAttribute('aria-pressed',String(active));const term=(state.search||'').toLowerCase().trim(),match=!term||String(button.dataset.setName||'').includes(term);button.hidden=!match||(!!state.selectedOnly&&!active);});
 const count=node.querySelector('[data-set-count]');if(count)count.textContent=`${buttons.filter(button=>chosen.has(button.dataset.setChoice)).length} / ${buttons.length} selected`;
 node.querySelectorAll('[data-set-era]').forEach(group=>{const kids=Array.from(group.querySelectorAll('[data-set-choice]'));group.hidden=!kids.some(button=>!button.hidden);if(state.search&&group.hidden===false)group.open=true;const small=group.querySelector('summary small');if(small)small.textContent=`${kids.filter(button=>chosen.has(button.dataset.setChoice)).length}/${kids.length}`;});
 const only=node.querySelector('[data-set-selected-only]');if(only)only.setAttribute('aria-pressed',String(!!state.selectedOnly));
 const warn=node.querySelector('[data-set-warning]');if(warn)warn.hidden=selected.length>0;
}
return {rows,names,html,refresh};
});
