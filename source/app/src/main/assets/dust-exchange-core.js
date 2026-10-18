(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexDustExchangeCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const text=value=>String(value??'').trim();
  const key=value=>text(value).toLowerCase();
  const finite=value=>Number.isFinite(Number(value))?Number(value):0;
  function normalizeKeepCopies(value){return Math.max(1,Math.min(99,Math.round(finite(value)||1)));}
  function matches(card,filters={},hooks={}){
    const query=key(filters.query),set=key(filters.set),legacyRarity=key(filters.rarity),rarities=(Array.isArray(filters.rarities)?filters.rarities:[]).map(key).filter(Boolean),dustValue=text(filters.dustValue);
    const cardSet=text(hooks.setFor?.(card)??card?.setName??card?.setId);
    const cardRarity=text(hooks.rarityFor?.(card)??card?.rarity);
    const value=finite(hooks.valueFor?.(card));
    if(query&&!([card?.name,card?.localId,card?.id].some(v=>key(v).includes(query))))return false;
    if(set&&key(cardSet)!==set)return false;
    if(rarities.length&&!rarities.includes(key(cardRarity)))return false;
    if(!rarities.length&&legacyRarity&&key(cardRarity)!==legacyRarity)return false;
    if(dustValue!==''&&String(value)!==String(finite(dustValue)))return false;
    return true;
  }
  function buildBatch(cards=[],filters={},keepCopies=1,hooks={}){
    const keep=normalizeKeepCopies(keepCopies),rows=[];
    for(const card of cards||[]){
      if(!card||hooks.isProtected?.(card)||!matches(card,filters,hooks))continue;
      const owned=Math.max(0,Math.trunc(finite(card.count))),value=Math.max(0,finite(hooks.valueFor?.(card)));
      const qty=Math.max(0,owned-keep);if(!qty||!value)continue;
      rows.push({id:String(card.id),name:text(card.name)||'Card',owned,keep,qty,value,gain:qty*value});
    }
    const rarities=(Array.isArray(filters.rarities)?filters.rarities:[]).map(text).filter(Boolean);
    return {filters:{query:text(filters.query),set:text(filters.set),rarity:rarities.length?'':text(filters.rarity),rarities,dustValue:text(filters.dustValue)},keepCopies:keep,rows,cardTypes:rows.length,copies:rows.reduce((n,r)=>n+r.qty,0),dust:rows.reduce((n,r)=>n+r.gain,0)};
  }
  function applyBatch(cardsById,batch,hooks={}){
    const rows=Array.isArray(batch?.rows)?batch.rows:[];
    for(const row of rows){
      const card=cardsById?.[row.id];
      const liveValue=Math.max(0,finite(hooks.valueFor?.(card)));
      if(!card||hooks.isProtected?.(card)||Math.trunc(finite(card.count))!==row.owned||liveValue!==row.value)return {ok:false,reason:'changed'};
      if(row.qty!==row.owned-normalizeKeepCopies(row.keep)||row.qty<1||row.gain!==row.qty*liveValue)return {ok:false,reason:'changed'};
    }
    for(const row of rows)cardsById[row.id].count-=row.qty;
    return {ok:true,dust:rows.reduce((n,r)=>n+r.qty*r.value,0),copies:rows.reduce((n,r)=>n+r.qty,0),cardTypes:rows.length};
  }
  return {normalizeKeepCopies,matches,buildBatch,applyBatch};
});
