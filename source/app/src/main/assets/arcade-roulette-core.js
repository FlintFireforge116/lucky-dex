(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.LuckyDexRouletteCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const POKEMON=Object.freeze([
    Object.freeze({id:296,key:'makuhita',name:'Makuhita'}),
    Object.freeze({id:298,key:'azurill',name:'Azurill'}),
    Object.freeze({id:300,key:'skitty',name:'Skitty'}),
    Object.freeze({id:360,key:'wynaut',name:'Wynaut'})
  ]);
  const COLORS=Object.freeze(['yellow','green','purple']);
  const SLOTS=Object.freeze(POKEMON.flatMap(p=>COLORS.map((color,colorIndex)=>Object.freeze({
    key:`${p.key}:${color}`,pokemon:p.name,pokemonKey:p.key,pokemonId:p.id,color,colorIndex
  }))));
  // Presentation order follows the alternating colour rhythm while rotating species,
  // preventing three identical Pokémon from sitting beside one another on the wheel.
  const WHEEL_KEYS=Object.freeze([
    'makuhita:yellow','azurill:green','skitty:purple','wynaut:yellow',
    'makuhita:green','azurill:purple','skitty:yellow','wynaut:green',
    'makuhita:purple','azurill:yellow','skitty:green','wynaut:purple'
  ]);
  const WHEEL_SLOTS=Object.freeze(WHEEL_KEYS.map(key=>SLOTS.find(slot=>slot.key===key)));
  const clamp01=v=>Math.max(0,Math.min(.999999999,Number(v)||0));
  const normalizeOccupied=input=>[...new Set((Array.isArray(input)?input:[]).map(String).filter(key=>SLOTS.some(s=>s.key===key)))].slice(0,6);
  function createRound({occupied=[],serviceDay=false,tableIndex=0}={}){
    const safe=normalizeOccupied(occupied);
    return {occupied:safe,serviceDay:!!serviceDay,tableIndex:Number(tableIndex)===1?1:0,complete:safe.length>=6};
  }
  function tableStakes(serviceDay=false){return [25,serviceDay?150:75];}
  function availableSlots(round){const occupied=new Set(round?.occupied||[]);return SLOTS.filter(slot=>!occupied.has(slot.key));}
  function matchingSlots(round,bet){
    const avail=availableSlots(round),kind=String(bet?.kind||'');
    if(kind==='slot')return avail.filter(s=>s.key===String(bet?.slotKey||''));
    if(kind==='pokemon')return avail.filter(s=>s.pokemon.toLowerCase()===String(bet?.pokemon||'').toLowerCase());
    if(kind==='color')return avail.filter(s=>s.color===String(bet?.color||'').toLowerCase());
    return [];
  }
  function multiplierFor(round,bet){const avail=availableSlots(round),count=matchingSlots(round,bet).length;return count>0?avail.length/count:0;}
  function betMatches(slot,bet){
    if(!slot||!bet)return false;
    if(bet.kind==='slot')return slot.key===bet.slotKey;
    if(bet.kind==='pokemon')return slot.pokemon.toLowerCase()===String(bet.pokemon||'').toLowerCase();
    if(bet.kind==='color')return slot.color===String(bet.color||'').toLowerCase();
    return false;
  }
  function resolveSpin(round,bet,{random=Math.random,rescueRate=0,goldenRate=0}={}){
    const current=createRound(round||{}),avail=availableSlots(current);
    if(current.complete||!avail.length)return {accepted:false,reason:'complete',round:current};
    const eligible=matchingSlots(current,bet);
    if(!eligible.length)return {accepted:false,reason:'invalid-bet',round:current};
    const multiplier=multiplierFor(current,bet);
    const goldenChance=Math.max(0,Math.min(1,Number(goldenRate)||0));
    const golden=goldenChance>0&&clamp01(random())<goldenChance;
    let rescue=null;
    if(current.occupied.length>=2&&clamp01(random())<Math.max(0,Math.min(1,Number(rescueRate)||0)))rescue=clamp01(random())<.5?'shroomish':'taillow';
    const slot=avail[Math.floor(clamp01(random())*avail.length)]||avail[0];
    const won=betMatches(slot,bet);
    const next=createRound({occupied:[...current.occupied,slot.key],serviceDay:current.serviceDay,tableIndex:current.tableIndex});
    return {accepted:true,slot,won,multiplier,payoutMultiplier:won?multiplier:0,rescue,golden,round:next,remaining:availableSlots(next).length};
  }
  function goldenPrizeForStake(stake){return Math.max(0,Math.round(Number(stake)||0))*10;}
  function nextRound(round){return createRound({serviceDay:!!round?.serviceDay,tableIndex:Number(round?.tableIndex)===1?1:0});}
  function describeBet(bet){
    if(bet?.kind==='slot'){const s=SLOTS.find(x=>x.key===bet.slotKey);return s?`${s.pokemon} · ${s.color}`:'Slot';}
    if(bet?.kind==='pokemon')return String(bet.pokemon||'Pokémon');
    if(bet?.kind==='color')return String(bet.color||'Colour').replace(/^./,c=>c.toUpperCase());
    return 'Bet';
  }
  return {POKEMON,COLORS,SLOTS,WHEEL_SLOTS,createRound,tableStakes,availableSlots,matchingSlots,multiplierFor,betMatches,resolveSpin,goldenPrizeForStake,nextRound,describeBet};
});
