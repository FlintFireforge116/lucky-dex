(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./tcgp-battle-data.js'),require('./tcgp-battle-decks.js'));
  else root.LuckyDexTCGPDeckWorkspace=factory(root.LuckyDexTCGPBattleData,root.LuckyDexTCGPBattleDecks);
})(typeof globalThis!=='undefined'?globalThis:this,function(data,decks){
  'use strict';
  const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Dragon','Colorless'];
  const typesOf=c=>Array.isArray(c?.types)&&c.types.length?c.types:[c?.subtype].filter(Boolean);
  const canonical=id=>data.cardById(id)?.id||String(id||'');
  const norm=s=>data.normalizeName(String(s||''));
  const printSets=new Map();for(const p of data.PRINTS){if(!printSets.has(p.gameplayId))printSets.set(p.gameplayId,new Set());printSets.get(p.gameplayId).add(p.setId);}
  function setText(c){return [...(printSets.get(c.id)||[c.setId])].map(id=>id+' '+(data.SETS.find(s=>s.id===id)?.name||'')).join(' ');}
  function counts(cards){const out=new Map();for(const id of cards||[]){const key=canonical(id);out.set(key,(out.get(key)||0)+1);}return out;}
  function ownedMap(rows){const map=new Map();for(const row of rows||[]){const id=canonical(row.gameplayId);map.set(id,(map.get(id)||0)+Math.max(0,Number(row.quantity)||0));}map.set('BASIC-POKE-BALL',2);return map;}
  function catalogue(rows){
    const owned=ownedMap(rows),byId=new Map((rows||[]).map(r=>[canonical(r.gameplayId),r]));
    return data.CARDS.map(card=>({...byId.get(card.id),gameplayId:card.id,card,name:card.name,quantity:owned.get(card.id)||0,battleEnabled:card.battleEnabled,variants:byId.get(card.id)?.variants||[]}));
  }
  function textOf(c,row){return norm([c.name,c.id,row.gameplayId,c.support?.status,c.setId,...typesOf(c),c.stage,c.trainerSubtype,c.trainerType,c.text,...(c.ruleBoxes||[]),...c.attacks?.map(a=>[a.name,a.text,a.cost,JSON.stringify(a.effect)].join(' '))||[],...[].concat(c.abilities||c.ability||[]).map(a=>[a.name,a.text,JSON.stringify(a.effect)].join(' ')),...(row.variants||[]).map(v=>v.id),setText(c),JSON.stringify(c.effect)].join(' '));}
  function query(rows,opts={}){
    const f=opts.filters||{},selected=counts(opts.cards),tokens=norm(opts.search).split(/\s+/).filter(Boolean);
    const results=(rows||[]).filter(row=>{
      const c=row.card||data.cardById(row.gameplayId);if(!c)return false;
      if(!opts.developer&&f.status&&f.status!=='FULL')return false;
      const cat=c.effect?.type==='playFossil'?'Fossil':c.kind==='pokemon'?'Pokémon':c.trainerSubtype||c.trainerType||'Trainer';
      if(f.category&&!(f.category==='Trainer'?c.kind==='trainer':f.category==='Pokémon'?c.kind==='pokemon':cat===f.category))return false;
      if(f.types?.length&&!f.types.every(t=>typesOf(c).includes(t)))return false;
      if(f.stage&&c.stage!==f.stage)return false;
      if(f.setId&&!(c.setId===f.setId||data.PRINTS.some(p=>p.gameplayId===c.id&&p.setId===f.setId)))return false;
      if(f.ex&&!(c.points>=2||/ ex$/i.test(c.name)))return false;
      if(f.mega&&!/^Mega /i.test(c.name))return false;
      if(f.owned&&!(row.quantity>0))return false;
      if(f.minOwned&&row.quantity<Number(f.minOwned))return false;
      if(f.inDeck==='yes'&&!selected.get(c.id)||f.inDeck==='no'&&selected.get(c.id))return false;
      if(f.energy&&!(c.attacks||[]).some(a=>String(a.cost).includes(({Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'})[f.energy])))return false;
      if(f.retreat!==undefined&&f.retreat!==''&&Number(c.retreat)!==Number(f.retreat))return false;
      if(f.ability&&!([].concat(c.abilities||c.ability||[]).length))return false;
      if(f.enabled&&!c.battleEnabled)return false;
      if(f.status&&c.support?.status!==f.status)return false;
      return !tokens.length||tokens.every(t=>textOf(c,row).includes(t));
    });
    const recent=r=>Math.max(0,...(r.variants||[]).map(v=>Number(v.row?.firstPulled)||Date.parse(v.row?.obtainedAt||v.row?.acquiredAt||v.row?.createdAt||'')||0));
    const stages={'Basic':0,'Stage 1':1,'Stage 2':2};
    const compare={name:(a,b)=>a.card.name.localeCompare(b.card.name),type:(a,b)=>typesOf(a.card).join('/').localeCompare(typesOf(b.card).join('/')),hp:(a,b)=>(b.card.hp||0)-(a.card.hp||0),owned:(a,b)=>b.quantity-a.quantity,stage:(a,b)=>(stages[a.card.stage]??3)-(stages[b.card.stage]??3),recent:(a,b)=>recent(b)-recent(a)}[opts.sort];
    results.sort((a,b)=>(compare?compare(a,b):0)||a.gameplayId.localeCompare(b.gameplayId,undefined,{numeric:true}));
    const pageSize=Math.max(1,Math.min(200,Number(opts.pageSize)||48)),pages=Math.max(1,Math.ceil(results.length/pageSize)),page=Math.max(0,Math.min(pages-1,Number(opts.page)||0));
    return {rows:results.slice(page*pageSize,(page+1)*pageSize),total:results.length,pages,page};
  }
  function edit(cards,id,delta,rows){
    const list=(cards||[]).map(canonical),card=data.cardById(id),fail=error=>({ok:false,cards:list,error});
    if(!card)return fail('Unknown card.');const count=list.filter(x=>x===card.id).length;
    if(delta<0){const i=list.lastIndexOf(card.id);if(i>=0)list.splice(i,1);return {ok:true,cards:list};}
    if(!card.battleEnabled)return fail('This card is available for review, not legal battles.');
    if(list.length>=20)return fail('Your deck already has 20 cards.');
    if(list.filter(x=>decks.copyLimitKey(data.cardById(x))===decks.copyLimitKey(card)).length>=2)return fail('Maximum two copies of the same name.');
    if(count>=(ownedMap(rows).get(card.id)||0))return fail('No more owned copies available.');
    list.push(card.id);return {ok:true,cards:list};
  }
  function recipe(cards,rows){const have=ownedMap(rows),missing=[];let owned=0;for(const [cardId,quantity] of counts(cards)){const n=Math.min(quantity,have.get(cardId)||0);owned+=n;if(n<quantity)missing.push({cardId,quantity:quantity-n});}return {owned,total:(cards||[]).length,missing};}
  function saveDraft(state,deck,rows){
    const cards=[];for(const id of deck.cards||[]){const r=edit(cards,id,1,rows);if(!r.ok)return {ok:false,errors:[r.error]};cards.push(canonical(id));}
    const battle=decks.ensureBattleState(state),id=deck.id||newId(battle),energyMode=deck.energyMode==='manual'?'manual':'auto';
    const energyTypes=energyMode==='auto'?decks.analyzeDeck(cards).recommendedEnergyTypes:Array.isArray(deck.energyTypes)?deck.energyTypes.slice():[];
    const saved={id,name:String(deck.name||'Pocket Deck').slice(0,40),cards,energyMode,energyTypes,energyType:energyTypes[0]};const ready=readiness(saved,rows);saved.draft=!ready.ok;
    const i=battle.decks.findIndex(d=>d.id===id);if(i>=0)battle.decks[i]=saved;else battle.decks.push(saved);battle.activeDeckId=id;
    return {ok:true,deck:saved,readiness:ready};
  }
  function readiness(deck,rows){const legal=decks.validateDeck(deck?.cards||[],rows),types=decks.deckEnergyTypes(deck),analysis=decks.analyzeDeck(deck?.cards||[],types);const errors=[...legal.errors];if(!analysis.energyValid)errors.push('Energy Zone must use 1 to 3 different generating Energy types.');return {ok:errors.length===0,errors,warnings:analysis.warnings};}
  function newId(battle){let n=1;while(battle.decks.some(d=>d.id==='pocket-'+n))n++;return 'pocket-'+n;}
  function duplicate(state,id){const battle=decks.ensureBattleState(state),old=battle.decks.find(d=>d.id===id);if(!old)return null;const copy={...old,id:newId(battle),name:(old.name+' copy').slice(0,40),cards:old.cards.slice(),energyTypes:old.energyTypes?.slice()};battle.decks.push(copy);return copy;}
  function remove(state,id){const b=decks.ensureBattleState(state);b.decks=b.decks.filter(d=>d.id!==id);if(b.activeDeckId===id)b.activeDeckId=b.decks[0]?.id||null;}
  function activate(state,id){const b=decks.ensureBattleState(state);if(b.decks.some(d=>d.id===id))b.activeDeckId=id;}
  return {TYPES,typesOf,counts,catalogue,query,edit,recipe,readiness,saveDraft,duplicate,remove,activate};
});
