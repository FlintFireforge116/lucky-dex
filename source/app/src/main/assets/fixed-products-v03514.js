/* LuckyDex v0.35.14 — fixed physical product manifests.
   Fixed products are assembled by printed deck position, never by booster RNG. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LuckyDexFixedProducts=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';

  const norm=value=>String(value??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[‐‑‒–—]/g,'-').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const GYARADOS=Object.freeze([
    'Totodile','Water Energy','Water Energy','Water Energy','Bill','Water Energy','Water Energy','Water Energy','Water Energy','Water Energy',
    'Water Energy','Magikarp','Croconaw','Totodile','Marill','Water Energy','Croconaw','Bill','Magikarp','Gyarados',
    'Energy Switch','Pokémon Communication','Poké Ball','Marill',"Professor Elm's Training Method",'Water Energy','Pokémon Communication','Switch','Water Energy','Gyarados'
  ]);
  const RAICHU=Object.freeze([
    'Moomoo Milk','Pikachu','Flaaffy','Meowth','Lightning Energy','Lightning Energy','Lightning Energy','Lightning Energy','Lightning Energy','Lightning Energy',
    'Lightning Energy','Meowth','Mareep','Lightning Energy','Lightning Energy','Pikachu','Flaaffy','Lightning Energy','Raichu','Mareep',
    'Copycat','Pokémon Collector','Lightning Energy','Switch','Poké Ball','Moomoo Milk','Pokémon Collector','Lightning Energy','Energy Switch','Raichu'
  ]);
  const SUPPORT_SET_NAMES=Object.freeze(['HeartGold & SoulSilver','HS Energy (2010 Unnumbered)']);
  const DEFINITIONS=Object.freeze({
    TK4G:Object.freeze({code:'TK4G',name:'HS Trainer Kit—Gyarados',kind:'half-deck',cardCount:30,foilPosition:30,signatureName:'Gyarados',contents:GYARADOS,supportSetNames:SUPPORT_SET_NAMES}),
    TK4R:Object.freeze({code:'TK4R',name:'HS Trainer Kit—Raichu',kind:'half-deck',cardCount:30,foilPosition:30,signatureName:'Raichu',contents:RAICHU,supportSetNames:SUPPORT_SET_NAMES})
  });

  function definitionFor(set={}){
    const rawId=String(set?._libraryKey||set?._libraryCode||set?.id||'').replace(/^library:/i,'').toUpperCase();
    if(DEFINITIONS[rawId])return DEFINITIONS[rawId];
    const key=norm(set?.name||set?.id||'');
    if(key.includes('hs trainer kit gyarados'))return DEFINITIONS.TK4G;
    if(key.includes('hs trainer kit raichu'))return DEFINITIONS.TK4R;
    return null;
  }
  const isFixed=set=>!!definitionFor(set);

  function artKey(name){
    const k=norm(name);
    if(k==='water energy')return ['water energy','basic water energy'];
    if(k==='lightning energy')return ['lightning energy','basic lightning energy'];
    return [k];
  }
  function firstNamed(cards,name){
    const wanted=artKey(name);
    return (cards||[]).find(row=>wanted.includes(norm(row?.name||'')))||null;
  }
  function signatureArt(signatureCards,definition,isFoil){
    const matches=(signatureCards||[]).filter(row=>norm(row?.name||'')===norm(definition.signatureName));
    if(!matches.length)return null;
    if(isFoil){
      return matches.find(row=>/holo|foil/i.test(String(row?._foil||row?.finish||row?._libraryVariant||row?.variant||'')))||matches.at(-1)||matches[0];
    }
    return matches.find(row=>!/holo|foil/i.test(String(row?._foil||row?.finish||row?._libraryVariant||row?.variant||'')))||matches[0];
  }
  function sourceArt(name,definition,position,pools){
    const isSignature=norm(name)===norm(definition.signatureName),isFoil=position===definition.foilPosition;
    if(isSignature)return signatureArt(pools.signatureCards,definition,isFoil)||firstNamed(pools.coreCards,name);
    if(/ energy$/i.test(name))return firstNamed(pools.energyCards,name)||firstNamed(pools.coreCards,name);
    return firstNamed(pools.coreCards,name);
  }
  function build(set={},pools={}){
    const definition=definitionFor(set);
    if(!definition)throw new Error('Unsupported fixed product');
    const setId=String(set?.id||`library:${definition.code}`),releaseDate=String(set?.releaseDate||'2010-05-12');
    return definition.contents.map((name,index)=>{
      const position=index+1,isFoil=position===definition.foilPosition,source=sourceArt(name,definition,position,pools)||{};
      const out={...source,id:`${definition.code}-${position}`,name,localId:String(position),number:String(position),rarity:'No Rarity',source:'tcg',setId,setName:set?.name||definition.name,set:{id:setId,name:set?.name||definition.name,releaseDate,cardCount:{total:definition.cardCount,official:definition.cardCount}},setTotal:definition.cardCount,setRelease:releaseDate,_fixedProduct:true,_fixedProductCode:definition.code,_fixedProductPosition:position};
      // Source art metadata is intentionally retained so installed HGSS/HS Energy
      // assets can still resolve locally, but fixed-product identity is position based.
      delete out.finish;delete out.foil;delete out._foil;
      if(isFoil)out._foil='Holofoil';
      return out;
    });
  }

  function grantToCollection(collection,cards,now=Date.now()){
    const rows=collection&&typeof collection==='object'?collection:{};
    const list=Array.isArray(cards)?cards:[];
    let newCards=0;
    for(const card of list){
      const id=String(card?.id||'').trim();if(!id)continue;
      const existing=Array.isArray(rows)?rows.find(row=>String(row?.id||'')===id):rows[id];
      let row=existing;
      if(!row){
        row={id,name:card.name||'Card',image:card.image||'',localId:card.localId||card.number||'',number:card.number||card.localId||'',setId:card.setId||card.set?.id||'',setName:card.setName||card.set?.name||'',setTotal:card.setTotal||card.set?.cardCount?.total||0,setRelease:card.setRelease||card.set?.releaseDate||'',source:'tcg',rarity:card.rarity||'',count:0,firstPulled:now};
        if(Array.isArray(rows))rows.push(row);else rows[id]=row;
        newCards++;
      }
      row.count=Math.max(0,Number(row.count)||0)+1;
      for(const key of ['name','image','localId','number','rarity','setId','setName','setTotal','setRelease','source','_foil','_libraryNative','_librarySetKey','_libraryCanonicalId','_artSource','_artIdentityVerified','_fixedProduct','_fixedProductCode','_fixedProductPosition']){
        if(card[key]!==undefined)row[key]=card[key];
      }
    }
    return {copies:list.length,newCards};
  }

  return Object.freeze({definitionFor,isFixed,build,grantToCollection,definitions:DEFINITIONS});
});
