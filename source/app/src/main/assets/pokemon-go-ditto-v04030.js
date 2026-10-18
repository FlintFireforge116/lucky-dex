(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexPokemonGoDitto=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const PRODUCTION_DENOMINATOR=40;
  const ELIGIBLE=Object.freeze(new Map([['6','spinarak'],['13','numel'],['59','bidoof']]));
  const norm=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/pok[eé]mon/g,'pokemon').replace(/[^a-z0-9]+/g,' ').trim();
  const collectorNumber=card=>String(card?.localId??card?.number??'').split('/')[0].replace(/^0+(?=\d)/,'');
  function isPokemonGoSet(set){return norm(set?.id)==='pgo'||norm(set?.name)==='pokemon go';}
  function isEligibleCover(set,descriptor,card){
    if(!isPokemonGoSet(set)||!card)return false;
    if(!/reverse-holo|reverse-or-holo/i.test(String(descriptor?.finish||'')))return false;
    const number=collectorNumber(card),expected=ELIGIBLE.get(number);
    return !!expected&&norm(card?.name)===expected;
  }
  function isDittoCard(card){return collectorNumber(card)==='53'&&norm(card?.name)==='ditto';}
  function shouldRoll(random=Math.random){return Number(random())<(1/PRODUCTION_DENOMINATOR);}
  function eligibleCoverBriefs(set){
    if(!isPokemonGoSet(set))return [];
    const byNumber=new Map((set?.cards||[]).map(card=>[collectorNumber(card),card]));
    return [...ELIGIBLE.keys()].map(number=>byNumber.get(number)).filter(card=>{
      const expected=ELIGIBLE.get(collectorNumber(card));return !!expected&&norm(card?.name)===expected;
    });
  }
  function planHiddenDitto(set,slots,random=Math.random){
    if(!isPokemonGoSet(set)||!shouldRoll(random))return null;
    const index=(slots||[]).findIndex(descriptor=>/reverse-holo|reverse-or-holo/i.test(String(descriptor?.finish||'')));
    if(index<0)return null;
    const covers=eligibleCoverBriefs(set);if(!covers.length)return null;
    const roll=Math.max(0,Math.min(.999999999,Number(random())||0));
    return Object.freeze({index,cover:covers[Math.floor(roll*covers.length)]});
  }
  function wrapHiddenDitto(cover,ditto){
    if(!cover||!ditto)return ditto||cover||null;
    return {...ditto,_foil:'Holofoil',_hiddenDitto:true,_hiddenDittoRevealed:false,_hiddenDittoCover:{...cover,_foil:cover._foil||'Reverse Holo'}};
  }
  function reveal(card){if(card?._hiddenDitto)card._hiddenDittoRevealed=true;return card;}
  return Object.freeze({PRODUCTION_DENOMINATOR,ELIGIBLE,collectorNumber,isPokemonGoSet,isEligibleCover,isDittoCard,shouldRoll,eligibleCoverBriefs,planHiddenDitto,wrapHiddenDitto,reveal});
});
