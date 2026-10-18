/* Retained save defaults/achievements and binder shortcuts; no Arcade ownership. */
(()=>{
  function ensureV167State(){
    state.arcade ||= {};
    const defaults={bestQuizEndless:0,bestQuizEndlessScore:0,bestBallDrop:0,bestUnown:0,bestSafari:0,safariCaught:0,unownPerfect:0,ballDropJackpots:0};
    let changed=false;for(const [k,v] of Object.entries(defaults)){if(state.arcade[k]==null){state.arcade[k]=v;changed=true;}}
    if(changed)save();
    if(!ACHIEVEMENTS.some(a=>a.id==='quiz_endless_20'))ACHIEVEMENTS.push(
      {id:'quiz_endless_20',icon:'♾️',name:'Silhouette Machine',desc:"Reach a streak of 20 in Who's That Pokémon? Endless.",reward:{coins:1500,tickets:1},progress:()=>[Number(state.arcade.bestQuizEndless||0),20]},
      {id:'ball_drop_jackpot',icon:'🔴',name:'Prize Machine Jackpot',desc:'Land a Pokéball in the centre jackpot slot.',reward:{coins:900},progress:()=>[Number(state.arcade.ballDropJackpots||0),1]},
      {id:'unown_perfect',icon:'🔤',name:'Ruins Scholar',desc:'Decode all 5 Unown messages in one run.',reward:{coins:1000,tickets:1},progress:()=>[Number(state.arcade.unownPerfect||0),1]},
      {id:'safari_ten',icon:'🦏',name:'Safari Regular',desc:'Catch 10 Pokémon across Safari Zone runs.',reward:{coins:1000},progress:()=>[Number(state.arcade.safariCaught||0),10]}
    );
  }

  /* Visible Card Binder shortcuts. The select remains for accessibility and set filtering. */
  function wireBinderQuickFiltersV167(){
    document.querySelectorAll('[data-binder-filter]').forEach(btn=>btn.onclick=()=>{
      const select=document.getElementById('collectionFilter');if(!select)return;
      select.value=btn.dataset.binderFilter;renderCollection();
    });
    const search=document.getElementById('collectionSearch');if(search)search.oninput=renderCollection;
    const filter=document.getElementById('collectionFilter');if(filter)filter.onchange=renderCollection;
    const group=document.getElementById('collectionGroupFilter');if(group)group.onchange=renderCollection;
  }

ensureV167State();wireBinderQuickFiltersV167();
})();
