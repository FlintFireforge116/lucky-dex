/* LuckyDex v0.24.6 card acquisition routing.
   Acquisition is decided per card so promo/trophy cards cannot leak out of
   generically named catalogue sets such as Miscellaneous. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LuckyDexCardAcquisition=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';

  const ACHIEVEMENT_SET_NAME='Achievement Rewards';
  const ACHIEVEMENT_SET_KEY='achievement-rewards';
  const PROMO_DUST_BANDS=Object.freeze({
    standard:Object.freeze({purchase:350,salvage:100}),
    enhanced:Object.freeze({purchase:600,salvage:175}),
    elite:Object.freeze({purchase:900,salvage:275}),
    premium:Object.freeze({purchase:1300,salvage:450})
  });

  function norm(value=''){
    return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/pok[eé]mon/g,'pokemon').replace(/[^a-z0-9]+/g,' ').trim();
  }

  function promoValueText(card){
    const subtype=Array.isArray(card?.subtypes)?card.subtypes.join(' '):card?.subtype||'';
    return norm([card?.name,card?.rarity,card?._foil,subtype,card?.supertype,card?.category,card?.type].filter(Boolean).join(' '));
  }
  function promoValueBand(card){
    const text=promoValueText(card);
    const shared=globalThis.LuckyDexCardRarity?.classify?.(card||{});
    if(shared&&(shared.rarityClass==='secret'||shared.chaseTraits?.some?.(x=>['gold','hyper','crown','rainbow','special-illustration'].includes(x))))return 'premium';
    if(/\b(?:gold|golden|hyper rare|rainbow|special illustration|secret rare|crown)\b/.test(text))return 'premium';
    if(/\b(?:vmax|v max|vstar|v star|v union|tag team|radiant|shining)\b/.test(text))return 'elite';
    if(/\b(?:ex|gx|break|lv x|v)\b/.test(text))return 'enhanced';
    return 'standard';
  }
  function promoDustPurchaseCost(card){return PROMO_DUST_BANDS[promoValueBand(card)].purchase;}
  function promoDustSalvageValue(card){return PROMO_DUST_BANDS[promoValueBand(card)].salvage;}
  function resolvedSet(card,set){
    if(set)return set;
    if(card?.set&&typeof card.set==='object')return card.set;
    return {id:card?.setId||'',name:card?.setName||card?.set||''};
  }
  function isExplicitAchievementCard(card,set=null){
    const s=resolvedSet(card,set),name=norm(card?.name),setName=norm(s?.name||card?.setName),setId=norm(s?.id||card?.setId);
    if(name==='ancient mew')return true;
    if(name==='victory medal'&&(setName==='victory medals'||setId.includes('victory medal')))return true;
    return !!card?._achievementReward;
  }
  function isDedicatedPromoSet(set){
    const name=norm(set?.name),id=norm(set?.id),series=norm(set?.series||set?._librarySeries);
    return /\bpromos?\b/.test(name)||/\bpromos?\b/.test(id)||series==='promos'||series==='promo';
  }
  function isMcDonaldsMiniSet(set){const text=norm([set?.name,set?.id].filter(Boolean).join(' '));return /\bmcdonald\b/.test(text);}
  function isSpecialOneOffSet(set){
    const name=norm(set?.name),id=norm(set?.id);
    if(name==='miscellaneous'||id==='miscellaneous'||id==='misc')return true;
    if(name==='victory medals'||id==='victory medals'||id.startsWith('victory medal '))return true;
    if(/\bcard creator pack\b/.test(name)||/\bcard creator pack\b/.test(id))return true;
    if(name==='world collection'||name.startsWith('world collection ')||id==='world collection'||id.startsWith('world collection '))return true;
    if(name==='best of game'||id==='best of game')return true;
    if(name==='pokemon futsal collection'||id==='pokemon futsal collection')return true;
    return false;
  }
  function isPromoCard(card,set=null){
    const s=resolvedSet(card,set),rarity=norm(card?.rarity),kind=norm(card?.supertype||card?.category||card?.type);
    if(card?._promo===true||card?._promoOnly===true)return true;
    // McDonald's cards are distributed in their own mini-packs; some validated
    // scans use Promo as a rarity label, but they still belong in that product.
    if(isMcDonaldsMiniSet(s))return false;
    if(/\bpromo\b/.test(rarity)||/\bpromo\b/.test(kind))return true;
    return isDedicatedPromoSet(s)||isSpecialOneOffSet(s);
  }
  function classify(card,set=null){
    if(isExplicitAchievementCard(card,set))return 'achievement_reward';
    if(isPromoCard(card,set))return 'promo_vault';
    return 'booster';
  }
  function boosterEligible(card,set=null){return classify(card,set)==='booster';}
  function promoVaultEligible(card,set=null){return classify(card,set)==='promo_vault';}
  function achievementEligible(card,set=null){return classify(card,set)==='achievement_reward';}
  function setMayContainPromoCards(set){
    const name=norm(set?.name),id=norm(set?.id);
    return isDedicatedPromoSet(set)||isSpecialOneOffSet(set);
  }

  function isAchievementOnlyPromoSet(set){
    const name=norm(set?.name),id=norm(set?.id);
    if(name==='miscellaneous'||id==='miscellaneous'||id==='misc'||id.endsWith(' miscellaneous'))return true;
    return false;
  }
  function promoCatalogSetEligible(set){return setMayContainPromoCards(set)&&!isAchievementOnlyPromoSet(set);}
  function tradeCatalogSetEligible(set){return !isAchievementOnlyPromoSet(set);}
  function setBoosterCatalogEligible(set){
    const name=norm(set?.name),id=norm(set?.id);
    if(isDedicatedPromoSet(set)||isSpecialOneOffSet(set))return false;
    return true;
  }
  function boosterProductEligible(set,source='tcg'){
    if(!setBoosterCatalogEligible(set))return false;
    if(source!=='tcg')return true;
    const resolver=typeof globalThis!=='undefined'?globalThis.LuckyDexPackPolicy?.resolve:null;
    // Physical products are fail-closed. If the audited pack policy has not
    // loaded yet, do not briefly expose a fixed deck/subset/unknown product
    // as a purchasable booster while scripts initialise.
    if(typeof resolver!=='function')return false;
    const profile=resolver(set,source);
    if(!profile||profile.purchasable===false||profile.productKind!=='booster')return false;
    // Physical Pack Shop entries must have an audited bundled packshot. This
    // prevents fixed decks/collections and unknown catalogue products from
    // being silently treated as ordinary boosters by the date fallback.
    const artResolver=typeof globalThis!=='undefined'?globalThis.LuckyDexBoosterArt?.localPath:null;
    if(typeof artResolver!=='function')return false;
    const art=artResolver(set);
    if(!art)return false;
    return true;
  }
  function displaySetName(card){
    if(achievementEligible(card))return ACHIEVEMENT_SET_NAME;
    return card?.set?.name||card?.setName||card?.set||card?.setId||'Unknown set';
  }
  function displaySetKey(card){
    if(achievementEligible(card))return ACHIEVEMENT_SET_KEY;
    return card?.set?.id||card?.setId||card?.setName||card?.set||'Unknown set';
  }

  return Object.freeze({
    ACHIEVEMENT_SET_NAME,ACHIEVEMENT_SET_KEY,PROMO_DUST_BANDS,norm,classify,boosterEligible,promoVaultEligible,achievementEligible,
    isPromoCard,isDedicatedPromoSet,isSpecialOneOffSet,isMcDonaldsMiniSet,isAchievementOnlyPromoSet,setMayContainPromoCards,promoCatalogSetEligible,tradeCatalogSetEligible,setBoosterCatalogEligible,boosterProductEligible,
    promoValueBand,promoDustPurchaseCost,promoDustSalvageValue,displaySetName,displaySetKey
  });
});
