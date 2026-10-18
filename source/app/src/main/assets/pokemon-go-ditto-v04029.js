(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexPokemonGoDitto=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
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
  function wrapHiddenDitto(cover,ditto){
    if(!cover||!ditto)return ditto||cover||null;
    return {...ditto,_foil:'Holofoil',_hiddenDitto:true,_hiddenDittoRevealed:false,_hiddenDittoCover:{...cover,_foil:cover._foil||'Reverse Holo'}};
  }
  function reveal(card){if(card?._hiddenDitto)card._hiddenDittoRevealed=true;return card;}
  return Object.freeze({ELIGIBLE,collectorNumber,isPokemonGoSet,isEligibleCover,isDittoCard,wrapHiddenDitto,reveal});
});
