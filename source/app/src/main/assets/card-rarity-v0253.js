/* LuckyDex v0.25.3 — canonical printed-rarity / finish / chase classification. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LuckyDexCardRarity=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const OVERRIDES=Object.freeze({});
  const norm=v=>String(v??'').toLowerCase().replace(/[‐‑‒–—]/g,'-').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim();
  const uniq=a=>[...new Set(a.filter(Boolean))];
  const classTier=Object.freeze({common:0,uncommon:1,rare:2,'double-rare':3,ultra:4,illustration:4,'special-illustration':5,'historic-chase':5,secret:6,promo:2,unknown:1});

  function canonicalId(card){return String(card?.id||card?._libraryCanonicalId||'').trim();}
  function collectorNumber(card){
    const raw=String(card?.localId??card?.number??card?.printedNumber??'').trim();
    if(/^0*\d+$/.test(raw))return Number(raw);
    const tail=canonicalId(card).match(/(?:^|[-_])0*(\d+)$/);
    return tail?Number(tail[1]):NaN;
  }
  function legacyWotcRarity(card,set){
    const identity=norm([set?.id,set?.name,set?._libraryKey,card?.setId,card?.setName,card?.set?.id,card?.set?.name].filter(Boolean).join(' '));
    const n=collectorNumber(card);if(!Number.isFinite(n))return '';
    if(/(?:^|\s)(?:base2|ju|jungle)(?:\s|$)/.test(identity)){
      if(n>=1&&n<=16)return 'Rare Holo';if(n<=32)return 'Rare';if(n<=48)return 'Uncommon';if(n<=64)return 'Common';
    }
    if(/(?:^|\s)(?:base3|fo|fossil)(?:\s|$)/.test(identity)){
      if(n>=1&&n<=15)return 'Rare Holo';if(n<=30)return 'Rare';if(n<=45)return 'Uncommon';if(n<=62)return 'Common';
    }
    return '';
  }
  function cardSetIdentity(card={},set=null){
    return norm([set?.id,set?.name,set?.series,set?._libraryKey,set?._librarySeries,card?.setId,card?.setName,card?.set?.id,card?.set?.name,card?.set?.series].filter(Boolean).join(' '));
  }
  function isDragonVault(card={},set=null){
    const identity=cardSetIdentity(card,set);
    return /\bdragon vault\b/.test(identity)||/(?:^| )(?:drv|dv1)(?: |$)/.test(identity);
  }
  function isMcDonalds(card={},set=null){
    const identity=cardSetIdentity(card,set);
    return /\bmcdonald(?:s)?\b/.test(identity)||/(?:^| )(?:mcd\d{2}|\d{4}swsh)(?: |$)/.test(identity);
  }
  function normalizedPrintedRarity(card={},set=null){
    const raw=String(card?.rarity??card?.printedRarity??'').trim();
    // Dragon Vault is an all-holo special set, not a set where every normal
    // card is a Rare. Keep 1-20 rarity-less and model the foil as finish; the
    // 21/20 Kyurem is the actual secret card.
    if(isDragonVault(card,set)){
      const n=collectorNumber(card);
      if(Number.isFinite(n)&&n>20)return 'Secret Rare';
      return 'No Rarity';
    }
    const weak=!raw||/^(?:unknown|no rarity|n\/a|none|-)$/i.test(raw);
    if(!weak)return raw;
    const identity=cardSetIdentity(card,set);
    // Promo families are routed by set identity. If a promo record itself has
    // weak rarity metadata, expose the useful game/display rarity as Promo.
    if(/\bpromos?\b/.test(identity))return 'Promo';
    return raw||'Unknown';
  }
  function explicitRarity(card,set){
    const legacy=legacyWotcRarity(card,set);if(legacy)return legacy;
    const id=canonicalId(card),override=OVERRIDES[id];
    if(override?.rarity)return String(override.rarity);
    return normalizedPrintedRarity(card,set);
  }
  function sourceText(card,set){
    const explicit=explicitRarity(card,set);
    if(explicit && !/^(unknown|n\/a|none|-)$/i.test(explicit))return {text:norm(explicit),authoritative:true,original:explicit};
    const fallback=[card?.rarityLabel,card?.variant,card?.subtype,card?.subtypes,card?.category,card?.name].flat().filter(Boolean).join(' ');
    return {text:norm(fallback),authoritative:false,original:explicit||''};
  }
  function chaseTraitsFor(card,source){
    const structured=[card?.chaseTraits,card?.traits,card?._traits,card?.variant,card?._variant].flat().filter(Boolean).join(' ');
    // When printed rarity is known, use it plus structured metadata. Card-name inference is fallback only.
    const text=norm([source.text,structured,source.authoritative?'':card?.name].filter(Boolean).join(' '));
    const out=[];
    if(/\bgold\b/.test(text))out.push('gold');
    if(/\bhyper\b/.test(text))out.push('hyper');
    if(/\bcrown\b/.test(text))out.push('crown');
    if(/\brainbow\b/.test(text))out.push('rainbow');
    if(/\bsecret\b/.test(text)||/\bhyper rare\b/.test(text)||/\bgold rare\b/.test(text)||/\bcrown rare\b/.test(text))out.push('secret');
    if(/\bspecial illustration\b|\bsir\b/.test(text))out.push('special-illustration');
    if(/\bfull art\b/.test(text))out.push('full-art');
    if(/\btextured\b/.test(text))out.push('textured');
    return uniq(out);
  }
  function rarityClassFor(card,source,traits){
    const r=source.text;
    if(card?._achievementReward===true)return 'promo';
    if(/\bpromo\b/.test(r))return 'promo';
    if(/(^|\s)legend(?:ary)?(\s|$)|\brare holo star\b/.test(r))return 'historic-chase';
    // Secret/jackpot printed labels are their own rarity class. Pocket 3★/immersive also live here.
    if(/\bsecret(?: rare)?\b|\brare secret\b|\bhyper rare\b|\bgold rare\b|\bcrown(?: rare)?\b|\bthree star\b|\b3 star\b|\bimmersive\b|\bmega attack rare\b|\bblack white rare\b|\brgb rare\b|\bfuturistic rare\b/.test(r))return 'secret';
    if(/\bspecial illustration(?: rare)?\b|\brare rainbow\b|\brainbow rare\b|\bshiny ultra rare\b|\brare shiny gx\b|\bshiny rare v or vmax\b|\btwo star\b|\b2 star\b|\btwo shiny\b|\b2 shiny\b/.test(r))return 'special-illustration';
    if(/\billustration rare\b|\bcharacter rare\b|\btrainer gallery(?: rare)?\b|\bone star\b|\b1 star\b/.test(r))return 'illustration';
    if(/\bultra rare\b|\brare ultra\b|\bfull art\b|\bradiant rare\b|\bradiant\b|\bamazing rare\b|\bace spec(?: rare)?\b|\bshining(?: rare)?\b|\bshiny rare\b|\bone shiny\b|\b1 shiny\b|\brare holo (?:ex|gx|v|max|vmax|vstar|lv\.?x)\b|\bholo rare (?:v|vmax|vstar)\b|\brare prism star\b|\brare break\b|\brare prime\b/.test(r))return 'ultra';
    if(/\bdouble rare\b|\bfour diamond\b|\b4 diamond\b/.test(r))return 'double-rare';
    if(/\buncommon\b|\btwo diamond\b|\b2 diamond\b/.test(r))return 'uncommon';
    if(/\bcommon\b|\bone diamond\b|\b1 diamond\b/.test(r))return 'common';
    if(/^(?:rare|rare holo|holo rare|rare reverse holo|pikachu rare|three diamond|3 diamond)$/.test(r))return 'rare';
    if(traits.includes('secret'))return 'secret';
    if(traits.includes('special-illustration')||traits.includes('rainbow'))return 'special-illustration';
    return 'unknown';
  }
  function finishFor(card,source,set=null){
    const id=canonicalId(card),override=OVERRIDES[id];
    const text=norm([override?.finish,card?._foil,card?.finish,card?.foil,card?.printing,card?.surface].filter(Boolean).join(' '));
    if(/reverse/.test(text))return 'reverse-holo';
    if(/textur/.test(text))return 'textured';
    if(/special foil|confetti|cosmos|galaxy|shatter|cracked ice/.test(text))return 'special-foil';
    if(/holo|foil/.test(text))return 'holo';
    // Every Dragon Vault card was printed holofoil even though cards 1-20 do
    // not need to be promoted into a Rare rarity tier in LuckyDex.
    if(isDragonVault(card,set))return 'holo';
    // Printed rarity can explicitly say Holo, but this never changes rarityClass.
    if(/\bholo\b/.test(source.text))return 'holo';
    return 'normal';
  }
  function revealMetaFor(card,source,rarityClass,traits){
    const r=source.text;
    if(rarityClass==='historic-chase'){if(/\brare holo star\b/.test(r))return {rank:7.5,style:'gold-star',label:'GOLD STAR PULL'};return {rank:7,style:'legend',label:'LEGEND PULL'};}
    if(rarityClass==='secret'){
      if(/\bcrown\b/.test(r)||traits.includes('crown'))return {rank:8,style:'crown',label:'CROWN SECRET RARE — JACKPOT'};
      if(/\bgold\b/.test(r)||traits.includes('gold'))return {rank:8,style:'gold',label:'GOLD SECRET RARE — JACKPOT'};
      if(/\bhyper\b/.test(r)||traits.includes('hyper'))return {rank:8,style:'gold',label:'HYPER SECRET RARE — JACKPOT'};
      if(/\bthree star\b|\b3 star\b|\bimmersive\b/.test(r))return {rank:7.4,style:'immersive',label:'IMMERSIVE / 3★ PULL'};
      if(/\bmega attack rare\b/.test(r))return {rank:7.2,style:'secret',label:'MEGA ATTACK RARE'};
      if(/\bblack white rare\b/.test(r))return {rank:7.5,style:'secret',label:'BLACK WHITE RARE'};
      if(/\brgb rare\b/.test(r))return {rank:8,style:'secret',label:'RGB RARE — JACKPOT'};
      if(/\bfuturistic rare\b/.test(r))return {rank:7.5,style:'secret',label:'FUTURISTIC RARE'};
      return {rank:7,style:'secret',label:'SECRET RARE'};
    }
    if(rarityClass==='special-illustration'){
      if(/\brainbow\b/.test(r)||traits.includes('rainbow'))return {rank:6.6,style:'prismatic',label:'RAINBOW RARE'};
      if(/\btwo shiny\b|\b2 shiny\b|\bshiny ultra\b|\brare shiny gx\b|\bshiny rare v or vmax\b/.test(r))return {rank:6.2,style:'shiny-special',label:'SHINY HIT'};
      return {rank:6,style:'special-illustration',label:'SPECIAL ILLUSTRATION RARE'};
    }
    if(rarityClass==='illustration')return {rank:5,style:'illustration',label:'ILLUSTRATION RARE'};
    if(rarityClass==='ultra'){
      if(/\brare prime\b/.test(r))return {rank:4.8,style:'prime',label:'PRIME PULL'};
      if(/\blv\.?x\b/.test(r))return {rank:4.8,style:'lvx',label:'LV.X PULL'};
      if(/\bbreak\b/.test(r))return {rank:4.6,style:'break',label:'BREAK PULL'};
      if(/\bshining\b/.test(r))return {rank:5.3,style:'shining',label:'SHINING PULL'};
      if(/\bradiant\b/.test(r))return {rank:4.7,style:'radiant',label:'RADIANT RARE'};
      if(/\bamazing\b/.test(r))return {rank:4.7,style:'amazing',label:'AMAZING RARE'};
      if(/\bace spec\b/.test(r))return {rank:4.5,style:'ace-spec',label:'ACE SPEC'};
      if(/\bone shiny\b|\b1 shiny\b|\bshiny rare\b/.test(r))return {rank:4.8,style:'shiny',label:'SHINY RARE'};
      if(/\brare prism star\b/.test(r))return {rank:4.8,style:'prism',label:'PRISM STAR'};
      if(/\bholo rare vmax\b/.test(r))return {rank:4.6,style:'ultra',label:'VMAX PULL'};
      if(/\bholo rare vstar\b/.test(r))return {rank:4.6,style:'ultra',label:'VSTAR PULL'};
      if(/\bholo rare v\b/.test(r))return {rank:4.3,style:'ultra',label:'POKÉMON V'};
      return {rank:4,style:'ultra',label:'ULTRA RARE'};
    }
    if(rarityClass==='double-rare')return {rank:3,style:'double-rare',label:'DOUBLE RARE'};
    if(rarityClass==='rare')return {rank:2,style:'holo',label:'RARE / HOLO'};
    if(rarityClass==='uncommon')return {rank:1,style:'normal',label:'UNCOMMON'};
    if(rarityClass==='common')return {rank:0,style:'normal',label:''};
    if(rarityClass==='promo')return {rank:2,style:'promo',label:'PROMO'};
    return {rank:0,style:'unknown',label:'UNKNOWN RARITY'};
  }
  function classify(card={},set=null){
    if(typeof card==='string')card={rarity:card};
    const source=sourceText(card,set),traits=chaseTraitsFor(card,source);
    const rarityClass=rarityClassFor(card,source,traits);
    const tier=classTier[rarityClass]??1;
    const finish=finishFor(card,source,set);
    const explicitNoRarity=norm(source.original)==='no rarity';
    let meta=revealMetaFor(card,source,rarityClass,traits);
    if(rarityClass==='unknown'&&explicitNoRarity){
      meta=finish==='normal'?{rank:0,style:'normal',label:'NO RARITY'}:{rank:2,style:'holo',label:'HOLOFOIL'};
    }
    let impactTier=tier,impactStyle=meta.style;
    if(rarityClass==='historic-chase'||rarityClass==='secret'){impactTier=6;}
    else if(rarityClass==='special-illustration'){impactTier=5;}
    else if(rarityClass==='illustration'||rarityClass==='ultra'){impactTier=4;}
    else if(rarityClass==='double-rare'){impactTier=3;}
    else if(rarityClass==='rare'){impactTier=2;}
    if(rarityClass==='common'||rarityClass==='uncommon'||rarityClass==='unknown'){
      if(finish==='reverse-holo'){impactTier=Math.max(2,impactTier);impactStyle='reverse';}
      else if(finish!=='normal'){impactTier=Math.max(2,impactTier);impactStyle='holo';}
    }
    const originalRarity=source.original||String(card?.rarity||'Unknown');
    return Object.freeze({
      originalRarity,rarityClass,tier,finish,chaseTraits:Object.freeze(traits.slice()),impactTier,impactStyle,
      revealRank:meta.rank,revealStyle:meta.style,revealLabel:meta.label,isRareHit:tier>=3||rarityClass==='secret'||rarityClass==='historic-chase',
      diagnostic:rarityClass==='unknown'&&!explicitNoRarity?'unknown-rarity':null
    });
  }
  function pocketTradeClass(rarity){
    const r=norm(rarity);if(!r||/^(?:unknown|no rarity|n\/a|none|-)$/i.test(r))return null;
    const aliases=[
      [/^(?:one|1) diamond$/,'one-diamond'],[/^(?:two|2) diamond$/,'two-diamond'],[/^(?:three|3) diamond$/,'three-diamond'],[/^(?:four|4) diamond$/,'four-diamond'],
      [/^(?:one|1) star$/,'one-star'],[/^(?:two|2) star$/,'two-star'],[/^(?:three|3) star$/,'three-star'],[/^crown(?: rare)?$/,'crown'],
      [/^(?:one|1) shiny$/,'one-shiny'],[/^(?:two|2) shiny$/,'two-shiny']
    ];
    for(const [pattern,key] of aliases)if(pattern.test(r))return `tcgp:${key}`;
    return `tcgp:${r.replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
  }
  function tradeClassLabel(value){
    const key=String(value||'');
    const physical=Object.freeze({
      'tcg:dragon-vault-holo':'Dragon Vault Holofoil',
      'tcg:mcdonalds-promo':"McDonald's Promo",
      'tcg:mcdonalds-confetti-holo':"McDonald's Confetti Holo",
      'tcg:no-rarity':'No Rarity',
      'tcg:no-rarity-holo':'No Rarity Holofoil',
      'tcg:common':'Common','tcg:uncommon':'Uncommon','tcg:rare':'Rare / Holo',
      'tcg:double-rare':'Double Rare','tcg:ultra':'Ultra / Radiant Rare',
      'tcg:illustration':'Illustration Rare','tcg:special-illustration':'Special Illustration Rare',
      'tcg:historic-chase':'Historic Chase','tcg:secret':'Secret / Hyper Rare','tcg:unknown':'Unknown Rarity'
    });
    if(physical[key])return physical[key];
    if(!key.startsWith('tcgp:'))return '';
    const label=key.slice(5).split('-').map(word=>word?word[0].toUpperCase()+word.slice(1):'').join(' ');return label==='Crown'?'Crown':label;
  }
  function tier(cardOrRarity){return classify(typeof cardOrRarity==='string'?{rarity:cardOrRarity}:cardOrRarity||{}).tier;}
  function finish(card){return classify(card||{}).finish;}
  function tradeClass(card,set=null){
    if(card?._achievementReward===true)return 'achievement';
    const source=norm(card?.source||set?.source||'');
    if(source==='tcgp'){const pocket=pocketTradeClass(card?.rarity);if(pocket)return pocket;}
    const c=classify(card||{},set);
    // Physical products with deliberately absent printed rarity must never fall
    // through to the generic unknown tier (1 / Uncommon). Use exact classes so
    // the marketplace can only pair them with genuinely comparable products.
    if(source!=='tcgp'&&isDragonVault(card,set)&&collectorNumber(card)<=20)return 'tcg:dragon-vault-holo';
    if(source!=='tcgp'&&isMcDonalds(card,set))return c.finish==='normal'?'tcg:mcdonalds-promo':'tcg:mcdonalds-confetti-holo';
    if(source!=='tcgp'&&norm(c.originalRarity)==='no rarity')return c.finish==='normal'?'tcg:no-rarity':'tcg:no-rarity-holo';
    return c.rarityClass==='promo'?'promo':`tcg:${c.rarityClass}`;
  }
  function dustTier(card){return classify(card||{}).tier;}
  return Object.freeze({OVERRIDES,normalizedPrintedRarity,classify,tier,finish,pocketTradeClass,tradeClassLabel,tradeClass,dustTier});
});
