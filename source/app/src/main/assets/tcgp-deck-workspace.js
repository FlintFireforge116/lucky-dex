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
  const searchText=new Map();
  function textOf(c,row){return norm([c.name,c.id,row.gameplayId,c.support?.status,c.setId,...typesOf(c),c.stage,c.trainerSubtype,c.trainerType,c.text,...(c.ruleBoxes||[]),...c.attacks?.map(a=>[a.name,a.text,a.cost,JSON.stringify(a.effect)].join(' '))||[],...[].concat(c.abilities||c.ability||[]).map(a=>[a.name,a.text,JSON.stringify(a.effect)].join(' ')),...(row.variants||[]).map(v=>v.id),setText(c),JSON.stringify(c.effect)].join(' '));}
  function query(rows,opts={}){
    const f=opts.filters||{},selected=counts(opts.cards),tokens=norm(opts.search).split(/\s+/).filter(Boolean);
    const results=(rows||[]).filter(row=>{
      const c=row.card||data.cardById(row.gameplayId);if(!c)return false;
      if(!opts.developer&&f.status&&f.status!=='FULL')return false;
      const cat=c.effect?.type==='playFossil'?'Fossil':c.kind==='pokemon'?'Pokémon':c.trainerSubtype||c.trainerType||'Trainer';
      if(f.category&&!(f.category==='Trainer'?c.kind==='trainer':f.category==='Pokémon'?c.kind==='pokemon':cat===f.category))return false;
      if(f.types?.length&&!f.types.slice(0,2).every(t=>typesOf(c).includes(t)))return false;
      if(f.stage&&c.stage!==f.stage)return false;
      if(f.setId&&!(c.setId===f.setId||printSets.get(c.id)?.has(f.setId)))return false;
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
      if(!tokens.length)return true;const key=c.id||row.gameplayId;let text=searchText.get(key);if(!text){text=textOf(c,{gameplayId:key,variants:[]});searchText.set(key,text);}const searchable=text+' '+norm((row.variants||[]).map(v=>v.id).join(' '));return tokens.every(t=>searchable.includes(t));
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
    const preferredPrints={};for(const cardId of new Set(cards)){const print=selectedPrint(deck,cardId,rows);if(print!==cardId)preferredPrints[cardId]=print;}
    const saved={id,preferredPrints,name:String(deck.name||'Pocket Deck').slice(0,40),cards,energyMode,energyTypes,energyType:energyTypes[0]};const ready=readiness(saved,rows);saved.draft=!ready.ok;
    const i=battle.decks.findIndex(d=>d.id===id);if(i>=0)battle.decks[i]=saved;else battle.decks.push(saved);battle.activeDeckId=id;
    return {ok:true,deck:saved,readiness:ready};
  }
  function readiness(deck,rows){const legal=decks.validateDeck(deck?.cards||[],rows),types=decks.deckEnergyTypes(deck),analysis=decks.analyzeDeck(deck?.cards||[],types);const errors=[...legal.errors];if(!analysis.energyValid)errors.push('Energy Zone must use 1 to 3 different generating Energy types.');return {ok:errors.length===0,errors,warnings:analysis.warnings};}
  function newId(battle){let n=1;while(battle.decks.some(d=>d.id==='pocket-'+n))n++;return 'pocket-'+n;}
  function duplicate(state,id){const battle=decks.ensureBattleState(state),old=battle.decks.find(d=>d.id===id);if(!old)return null;const copy={...old,id:newId(battle),name:(old.name+' copy').slice(0,40),cards:old.cards.slice(),preferredPrints:{...old.preferredPrints},energyTypes:old.energyTypes?.slice()};battle.decks.push(copy);return copy;}
  function remove(state,id){const b=decks.ensureBattleState(state);b.decks=b.decks.filter(d=>d.id!==id);if(b.activeDeckId===id)b.activeDeckId=b.decks[0]?.id||null;}
  function activate(state,id){const b=decks.ensureBattleState(state);if(b.decks.some(d=>d.id===id))b.activeDeckId=id;}
  // Artwork is cosmetic: physical ownership is checked independently of canonical deck copies.
  function ownedPrints(id,rows){const key=canonical(id);return (rows||[]).filter(r=>canonical(r.gameplayId)===key).flatMap(r=>r.variants||[]).filter(v=>v.quantity>0&&canonical(v.id)===key);}
  function selectedPrint(deck,id,rows){const key=canonical(id),prints=ownedPrints(key,rows),preferred=deck?.preferredPrints?.[key];return prints.some(p=>p.id===preferred)?preferred:prints.find(p=>p.id===key)?.id||prints[0]?.id||key;}
  function rename(state,id,name){const deck=decks.ensureBattleState(state).decks.find(d=>d.id===id),value=String(name||'').trim().slice(0,40);if(!deck||!value)return false;deck.name=value;return true;}
  // Two copies of each linked family; shared consistency cards make the plan repeatable.
  function makeRecipe(id,name,description,core,energyTypes,extras=[]){
    const supports=[...extras,'P-A-007','P-A-005','P-A-001','P-A-002','A1-223','A2-147','A1a-068','P-A-006'];
    const unique=[...new Set([...core,...supports])].slice(0,10);
    return Object.freeze({id,name,description,keyPokemon:core.filter(cid=>data.cardById(cid)?.kind==='pokemon'),cards:Object.freeze(unique.flatMap(cid=>[cid,cid])),energyMode:'manual',energyTypes:Object.freeze(energyTypes)});
  }
  const RECIPES=Object.freeze([
    makeRecipe('grass-swarm','Grass swarm','Beedrill attacks for one Grass Energy while Venomoth applies poison; healing and retreat keep the swarm moving.',['A1-008','A1-009','A1-010','A1-016','A1-017'],['Grass']),
    makeRecipe('fire-pressure','Fire pressure','Vulpix disrupts early attacks, then Ninetales converts two Fire Energy into steady pressure with Entei providing draw support.',['A1-037','A1-038','A4a-010'],['Fire']),
    makeRecipe('water-sleep','Water sleep','Frosmoth buys setup turns with sleep while Lapras banks Water Energy for its larger Hydro Pump.',['A1-092','A1-093','A1-079'],['Water']),
    makeRecipe('lightning-bench','Lightning bench','Pikachu ex rewards a full Lightning Bench; low-retreat Electrode and Pincurchin provide alternate attackers.',['A1-096','A1-099','A1-100','A1-112'],['Lightning']),
    makeRecipe('psychic-punish','Psychic punishment','Alakazam and Jynx punish Energy-heavy opponents; a full Abra family and draw cards help assemble the evolution.',['A1-115','A1-116','A1-117','A1-127'],['Psychic']),
    makeRecipe('fighting-evolution','Fighting evolution','Machamp ex supplies sustained damage after its full evolution line; Rockruff and Lycanroc ex offer a faster secondary plan.',['A1-143','A1-144','A1-146','A3-099','C1-080'],['Fighting']),
    makeRecipe('darkness-poison','Poison lock','Grimer poisons to enable Muk’s Venoshock bonus; Arbok traps the Active Pokémon to retain pressure.',['A1-174','A1-175','A1-164','A1-165'],['Darkness']),
    makeRecipe('metal-acceleration','Metal acceleration','Meltan accelerates its own Metal Energy before evolving into damage-reducing Melmetal; Mawile disrupts opposing Energy.',['A1-181','A1-182','A1-178'],['Metal']),
    makeRecipe('dragon-dual','Dragon dual Energy','A complete Dragonite ex family uses Water and Lightning Energy; Lapras stores Water Energy while the evolution develops.',['A3b-051','A3b-052','A3b-053','A1-079'],['Water','Lightning']),
    makeRecipe('charizard-ex','Charizard ex pressure','Entei draws from the Active Spot while the full Charizard ex family sets up Crimson Storm; switching preserves setup pieces.',['A1-033','A1-034','A1-036','A4a-010'],['Fire']),
    makeRecipe('blastoise-ex','Blastoise ex reservoir','Blastoise ex and Lapras both reward extra Water Energy, backed by a complete Squirtle family and defensive healing.',['A1-053','A1-054','A1-056','A1-079'],['Water']),
    makeRecipe('venusaur-ex','Venusaur ex endurance','Venusaur ex heals as it attacks; Venomoth’s inexpensive poison buys turns for the complete Bulbasaur evolution line.',['A1-001','A1-002','A1-004','A1-016','A1-017'],['Grass']),
    makeRecipe('sleep-control','Sleep control','Jigglypuff starts the sleep plan, Wigglytuff ex continues it, and Frosmoth offers a lower-cost Water-powered sleep attacker.',['P-A-022','A1-195','A1-092','A1-093'],['Water']),
    makeRecipe('water-counter','Water counter armour','Poliwrath returns attack damage while Cloyster reduces incoming damage; Giant Cape and Potion reinforce both defensive families.',['A1-059','A1-060','A1-061','A1-066','A1-067'],['Water'],['A2-147']),
    makeRecipe('dual-mega','Dual Mega stadium','Mega Mewtwo X ex gains damage with a Stadium in play; Jynx punishes built-up opponents while Training Area enables Dual Impact.',['C1-056','A1-127'],['Psychic'],['B2-153']),
    makeRecipe('greninja-mega','Mega Greninja evolution','A full Froakie family leads into dual-type Mega Greninja ex; Frosmoth buys evolution turns with guaranteed sleep.',['A1-087','A1-088','C1-042','A1-092','A1-093'],['Water'])
  ]);
  return {RECIPES,selectedPrint,ownedPrints,rename,TYPES,typesOf,counts,catalogue,query,edit,recipe,readiness,saveDraft,duplicate,remove,activate};
});
