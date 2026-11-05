(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./tcg-classic-battle-data.js'),require('./tcg-classic-decks.js'));
 else root.LuckyDexClassicTCGDeckWorkspace=factory(root.LuckyDexClassicTCGBattleData,root.LuckyDexClassicTCGDecks);
})(typeof globalThis!=='undefined'?globalThis:this,function(data,decks){
'use strict';
const TYPES=Object.freeze(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless']);
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ');
const canonical=id=>data.cardById(id)?.id||String(id||'');
const typesOf=c=>Array.isArray(c?.types)&&c.types.length?c.types:[c?.subtype].filter(Boolean);
function counts(cards){const out=new Map();for(const id of cards||[]){const key=canonical(id);out.set(key,(out.get(key)||0)+1);}return out;}
function ownedMap(rows){const map=new Map();for(const row of rows||[]){const id=canonical(row.gameplayId);map.set(id,(map.get(id)||0)+Math.max(0,Number(row.quantity)||0));}return map;}
function catalogue(rows){const owned=ownedMap(rows),byId=new Map((rows||[]).map(r=>[canonical(r.gameplayId),r]));return data.CARDS.map(card=>({...byId.get(card.id),gameplayId:card.id,card,name:card.name,quantity:owned.get(card.id)||0,battleEnabled:!!card.battleEnabled,variants:byId.get(card.id)?.variants||[]}));}
function query(rows,opts={}){
 const f=opts.filters||{},selected=counts(opts.cards),tokens=norm(opts.search).split(/\s+/).filter(Boolean),stages={'Basic':0,'Stage 1':1,'Stage 2':2};
 const results=(rows||[]).filter(row=>{const c=row.card||data.cardById(row.gameplayId);if(!c)return false;const category=c.kind==='pokemon'?'Pokémon':c.specialEnergy?'Special Energy':'Trainer';
  if(f.category&&category!==f.category)return false;if(f.set&&c.setId!==f.set)return false;if(f.types?.length&&!f.types.slice(0,2).every(t=>typesOf(c).includes(t)))return false;if(f.stage&&c.stage!==f.stage)return false;if(f.owned&&!(row.quantity>0))return false;if(f.enabled&&!c.battleEnabled)return false;if(f.minOwned&&row.quantity<Number(f.minOwned))return false;if(f.inDeck==='yes'&&!selected.get(c.id)||f.inDeck==='no'&&selected.get(c.id))return false;if(f.retreat!==undefined&&f.retreat!==''&&Number(c.retreat)!==Number(f.retreat))return false;
  if(!tokens.length)return true;const text=norm([c.name,c.id,c.number,c.kind,c.stage,c.trainerType,...typesOf(c),...(c.attacks||[]).map(a=>`${a.name} ${a.cost} ${a.damageText??a.damage??''}`),JSON.stringify(c.effect||{})].join(' '));return tokens.every(t=>text.includes(t));});
 const compare={name:(a,b)=>a.card.name.localeCompare(b.card.name),type:(a,b)=>typesOf(a.card).join('/').localeCompare(typesOf(b.card).join('/')),hp:(a,b)=>(b.card.hp||0)-(a.card.hp||0),owned:(a,b)=>b.quantity-a.quantity,stage:(a,b)=>(stages[a.card.stage]??3)-(stages[b.card.stage]??3),number:(a,b)=>String(a.card.setId).localeCompare(String(b.card.setId))||Number(a.card.number||0)-Number(b.card.number||0)}[opts.sort||'number'];
 results.sort((a,b)=>(compare?compare(a,b):0)||Number(a.card.number||0)-Number(b.card.number||0));const pageSize=Math.max(1,Math.min(200,Number(opts.pageSize)||48)),pages=Math.max(1,Math.ceil(results.length/pageSize)),page=Math.max(0,Math.min(pages-1,Number(opts.page)||0));return {rows:results.slice(page*pageSize,(page+1)*pageSize),total:results.length,pages,page};
}
function edit(cards,id,delta,rows){return decks.edit(cards,id,delta,rows);}
function readiness(deck,rows){return decks.readiness(deck,rows);}
function saveDraft(state,deck,rows){return decks.saveDraft(state,deck,rows);}
function newId(state){let n=1;while(state.decks.some(d=>d.id===`classic-${n}`))n++;return `classic-${n}`;}
function duplicate(state,id){const battle=decks.ensureState(state),old=battle.decks.find(d=>d.id===id);if(!old)return null;const copy={...old,id:newId(battle),name:(old.name+' copy').slice(0,40),cards:(old.cards||[]).slice(),energyTypes:(old.energyTypes||[]).slice()};battle.decks.push(copy);return copy;}
function remove(state,id){const battle=decks.ensureState(state);battle.decks=battle.decks.filter(d=>d.id!==id);if(battle.activeDeckId===id)battle.activeDeckId=battle.decks[0]?.id||null;}
function activate(state,id){const battle=decks.ensureState(state);if(battle.decks.some(d=>d.id===id))battle.activeDeckId=id;}
function rename(state,id,name){const battle=decks.ensureState(state),deck=battle.decks.find(d=>d.id===id),value=String(name||'').trim().slice(0,40);if(!deck||!value)return false;deck.name=value;return true;}
function ownedPrints(id,rows){const key=canonical(id);return (rows||[]).filter(r=>canonical(r.gameplayId)===key).flatMap(r=>r.variants||[]).filter(v=>Number(v.quantity)>0);}
function selectedPrint(deck,id,rows){const key=canonical(id),prints=ownedPrints(key,rows);return prints[0]?.id||key;}
return {TYPES,typesOf,counts,catalogue,query,edit,readiness,saveDraft,duplicate,remove,activate,rename,ownedPrints,selectedPrint};
});
