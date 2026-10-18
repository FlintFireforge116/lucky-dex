(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexCardArtIdentityV0533=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
function clean(value=''){return String(value||'').trim();}
function normalizeBase(value=''){
  let out=clean(value);if(!out)return '';
  if(/images\.pokemontcg\.io/i.test(out))return out.replace(/_hires\.png(?:\?.*)?$/i,'').replace(/\.png(?:\?.*)?$/i,'');
  return out.replace(/\/(?:high|low)\.(?:webp|png|jpe?g)(?:\?.*)?$/i,'');
}
function normalizedToken(value=''){return clean(value).toLowerCase().replace(/[^a-z0-9]/g,'');}
function localNumber(card){const raw=clean(card?.localId??card?.number??'');if(!raw)return '';return /^0*\d+$/.test(raw)?String(Number(raw)):normalizedToken(raw);}
function setTokens(card){const out=[];for(const raw of [card?.set?.id,card?.setId]){const v=normalizedToken(raw);if(v&&!out.includes(v))out.push(v);}return out;}
function urlParts(base){let path='';try{path=new URL(base).pathname;}catch(_){path=String(base).replace(/^https?:\/\/[^/]+/i,'').split('?')[0];}return path.split('/').filter(Boolean).map(decodeURIComponent);}
function exactTcgdexPath(card,base){
  if(!/assets\.tcgdex\.net/i.test(base))return false;
  const parts=urlParts(base),local=normalizedToken(localNumber(card));if(!local)return false;
  const last=normalizedToken(parts.at(-1));if(last!==local)return false;
  const sets=setTokens(card);if(!sets.length)return true;
  return parts.some(part=>sets.includes(normalizedToken(part)));
}
function exactScrydexPath(card,base){
  if(!/images\.scrydex\.com/i.test(base))return false;
  const parts=urlParts(base),pokemonIndex=parts.findIndex(part=>normalizedToken(part)==='pokemon'),imageId=normalizedToken((pokemonIndex>=0?parts[pokemonIndex+1]:'')||parts.at(-2)||'');if(!imageId)return false;
  const ids=[card?.id,...setTokens(card).map(set=>`${set}${localNumber(card)}`)].map(normalizedToken).filter(Boolean);
  return ids.includes(imageId);
}
function exactPokemonTcgPath(card,base){
  if(!/images\.pokemontcg\.io/i.test(base))return false;
  const parts=urlParts(normalizeBase(base)),local=normalizedToken(localNumber(card));if(!local||normalizedToken(parts.at(-1))!==local)return false;
  const sets=setTokens(card);return !sets.length||sets.includes(normalizedToken(parts.at(-2)));
}
function knownProviderMatch(card,base){
  if(/assets\.tcgdex\.net/i.test(base))return exactTcgdexPath(card,base);
  if(/images\.scrydex\.com/i.test(base))return exactScrydexPath(card,base);
  if(/images\.pokemontcg\.io/i.test(base))return exactPokemonTcgPath(card,base);
  return null;
}
function isTrusted(card,base=card?.image||''){
  base=normalizeBase(base);if(!card||!base)return false;
  const known=knownProviderMatch(card,base);if(known!==null)return known;
  if(card._artIdentityVerified||card._libraryNative||card._pocketNative||card._pocketExactRemote)return true;
  if((card.source||'tcg')==='tcgp')return false;
  return false;
}
return Object.freeze({normalizeBase,isTrusted,exactTcgdexPath,exactScrydexPath,exactPokemonTcgPath});
});
