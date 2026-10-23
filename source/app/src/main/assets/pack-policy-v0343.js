/* LuckyDex v0.34.3 — canonical booster product, collation and price policy. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LuckyDexPackPolicy=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';
  const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[‐‑‒–—]/g,'-').replace(/[^a-z0-9★]+/g,' ').replace(/\s+/g,' ').trim();
  const keyOf=set=>norm(set?.name||set?.id||'');
  const libraryKeyOf=set=>norm(String(set?._libraryKey||set?._libraryCode||set?.id||'').replace(/^library:/i,'')).replace(/\s+/g,'');
  const rawCardNumber=card=>String(card?.localId??card?.number??card?.printedNumber??'').trim().toUpperCase();
  const MONTHS=Object.freeze({jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11});
  function parseReleaseDateV03515(value){
    const s=String(value||'').trim();if(!s)return null;
    let y,m,d,hit=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(hit){y=Number(hit[1]);m=Number(hit[2])-1;d=Number(hit[3]);}
    else{hit=s.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);if(!hit)return null;m=MONTHS[hit[1].toLowerCase()];d=Number(hit[2]);y=Number(hit[3]);if(m===undefined)return null;}
    const n=Date.UTC(y,m,d),check=new Date(n);
    return check.getUTCFullYear()===y&&check.getUTCMonth()===m&&check.getUTCDate()===d?n:null;
  }
  const dateOf=set=>parseReleaseDateV03515(set?.releaseDate||set?.date||'');
  const slot=(id,pool,allowedClasses,extra={})=>Object.freeze({id,pool,allowedClasses:Object.freeze([...(allowedClasses||[])]),finish:'normal',replacements:Object.freeze([]),rareOrHigher:false,allowParallelRepeat:false,...extra});
  const LOW=['common'], MID=['uncommon'], RARE=['rare','double-rare','ultra','illustration','special-illustration','historic-chase','secret'], HIT=['double-rare','ultra','illustration','special-illustration','historic-chase','secret'], POCKET_RARE_GREAT=['ultra','illustration','special-illustration','secret'], ANY=['common','uncommon','rare','double-rare','ultra','illustration','special-illustration','historic-chase','secret','unknown'], FLEX_ANY=[...ANY,'promo'];
  const POCKET_RARE_UPGRADE=Object.freeze({common:'uncommon',uncommon:'rare',rare:'double-rare','double rare':'ultra',ultra:'illustration',illustration:'special-illustration','special illustration':'secret',secret:'secret','historic chase':'secret',unknown:'rare'});
  function upgradePocketRareClass(value){return POCKET_RARE_UPGRADE[norm(value)]||norm(value)||'rare';}

  const SUBSETS=Object.freeze([
    ['generations radiant collection','Generations'],
    ['radiant collection','Legendary Treasures'],
    ['brilliant stars trainer gallery','Brilliant Stars'],
    ['astral radiance trainer gallery','Astral Radiance'],
    ['lost origin trainer gallery','Lost Origin'],
    ['silver tempest trainer gallery','Silver Tempest'],
    ['crown zenith galarian gallery','Crown Zenith'],
    ['galarian gallery','Crown Zenith'],
    ['hidden fates shiny vault','Hidden Fates'],
    ['shiny vault','Hidden Fates'],
    ['shining fates shiny vault','Shining Fates'],
    ['celebrations classic collection','Celebrations'],
    ['celebrations classic collection classic collection','Celebrations'],
    ['30th celebration classic collection','30th Celebration']
  ]);
  const SUBSET_KEYS=Object.freeze({
    ann25thr:'Celebrations',cel25c:'Celebrations',
    swsh45sv:'Shining Fates',sma:'Hidden Fates',sm115sv:'Hidden Fates',hifsv:'Hidden Fates',
    swsh9tg:'Brilliant Stars',swsh10tg:'Astral Radiance',swsh11tg:'Lost Origin',swsh12tg:'Silver Tempest',swsh12pt5gg:'Crown Zenith'
  });
  function subsetParent(set){
    const libraryKey=libraryKeyOf(set);if(SUBSET_KEYS[libraryKey])return {name:SUBSET_KEYS[libraryKey]};
    const k=keyOf(set);
    for(const [needle,parent] of SUBSETS)if(k===needle)return {name:parent};
    const matches=SUBSETS.filter(([needle])=>k.includes(needle)).sort((a,b)=>b[0].length-a[0].length);
    return matches.length?{name:matches[0][1]}:null;
  }


  const PARENT_SUBSETS=Object.freeze({
    'brilliant stars':{name:'Brilliant Stars Trainer Gallery',weight:.12,mode:'inline',numberPrefix:'TG'},
    'astral radiance':{name:'Astral Radiance Trainer Gallery',weight:.12,mode:'inline',numberPrefix:'TG'},
    'lost origin':{name:'Lost Origin Trainer Gallery',weight:.12,mode:'inline',numberPrefix:'TG'},
    'silver tempest':{name:'Silver Tempest Trainer Gallery',weight:.12,mode:'inline',numberPrefix:'TG'},
    'crown zenith':{name:'Crown Zenith Galarian Gallery',weight:.18,mode:'inline',numberPrefix:'GG'},
    'hidden fates':{name:'Hidden Fates Shiny Vault',weight:.14,mode:'external',subsetKeys:Object.freeze(['SMA','SM115SV','HIFSV'])},
    'shining fates':{name:'Shining Fates Shiny Vault',weight:.14,mode:'external',subsetKeys:Object.freeze(['SWSH45SV'])}
  });
  function parentSubset(set){const k=keyOf(set);for(const [name,row] of Object.entries(PARENT_SUBSETS))if(k===name||k.includes(name))return row;return null;}
  function weighted(rows,random=Math.random){const total=rows.reduce((n,r)=>n+Math.max(0,Number(r[1])||0),0);let x=Math.max(0,Math.min(.999999999,Number(random())||0))*total;for(const row of rows){x-=Math.max(0,Number(row[1])||0);if(x<0)return row[0];}return rows.at(-1)?.[0];}
  function standardSlots(profile){
    if(profile==='wotc_11')return [
      ...Array.from({length:7},(_,i)=>slot(`common-${i+1}`,'core',LOW)),
      ...Array.from({length:3},(_,i)=>slot(`uncommon-${i+1}`,'core',MID)),
      slot('rare','core',RARE,{rareOrHigher:true,finish:'holo-eligible',replacements:[{family:'classic-hit',weight:1}]})
    ];
    if(profile==='ecard_ex_9')return [
      ...Array.from({length:5},(_,i)=>slot(`common-${i+1}`,'core',LOW)),
      ...Array.from({length:2},(_,i)=>slot(`uncommon-${i+1}`,'core',MID)),
      slot('reverse','core',ANY,{finish:'reverse-holo',allowParallelRepeat:true,replacements:[{family:'ecard-ex-reverse-hit',weight:1}]}),
      slot('rare','core',RARE,{rareOrHigher:true,finish:'holo-eligible',replacements:[{family:'ecard-ex-hit',weight:1}]})
    ];
    if(profile==='sv_10')return [
      ...Array.from({length:4},(_,i)=>slot(`common-${i+1}`,'core',LOW)),
      ...Array.from({length:3},(_,i)=>slot(`uncommon-${i+1}`,'core',MID)),
      slot('foil-1','core',ANY,{finish:'reverse-holo',allowParallelRepeat:true,replacements:[{family:'sv-foil-a',weight:1}]}),
      slot('foil-2','core',ANY,{finish:'reverse-holo',allowParallelRepeat:true,replacements:[{family:'sv-foil-b',weight:1}]}),
      slot('rare','core',RARE,{finish:'holo',rareOrHigher:true,replacements:[{family:'sv-rare',weight:1}]})
    ];
    return [
      ...Array.from({length:5},(_,i)=>slot(`common-${i+1}`,'core',LOW)),
      ...Array.from({length:3},(_,i)=>slot(`uncommon-${i+1}`,'core',MID)),
      slot('reverse','core',ANY,{finish:'reverse-holo',allowParallelRepeat:true,replacements:[{family:profile==='sm_swsh_10'?'sm-swsh-reverse':'dp-bw-xy-reverse',weight:1}]}),
      slot('rare','core',RARE,{finish:'holo-eligible',rareOrHigher:true,replacements:[{family:profile==='sm_swsh_10'?'sm-swsh-hit':'dp-bw-xy-hit',weight:1}]})
    ];
  }

  const SPECIAL=Object.freeze({
    'legendary collection':{id:'legendary_collection_11',cardCount:11,price:650,rateFamily:'classic-wotc',slots:[...Array.from({length:6},(_,i)=>slot(`common-${i+1}`,'core',LOW)),...Array.from({length:3},(_,i)=>slot(`uncommon-${i+1}`,'core',MID)),slot('reverse','core',ANY,{finish:'reverse-holo',allowParallelRepeat:true}),slot('rare','core',RARE,{rareOrHigher:true,finish:'holo-eligible',replacements:[{family:'classic-hit',weight:1}]})]},
    'dragon vault':{id:'dragon_vault_5',cardCount:5,price:400,rateFamily:'celebration-all-holo',slots:Array.from({length:5},(_,i)=>slot(`holo-${i+1}`,'core',ANY,{finish:'holo'}))},
    'legendary treasures':{id:'legendary_treasures_10_rc',cardCount:10,price:650,rateFamily:'dp-bw-xy',slots:[...Array.from({length:4},(_,i)=>slot(`core-common-${i+1}`,'core',LOW,{excludeNumberPrefixes:['RC']})),...Array.from({length:2},(_,i)=>slot(`core-uncommon-${i+1}`,'core',MID,{excludeNumberPrefixes:['RC']})),slot('core-reverse','core',ANY,{finish:'reverse-or-holo',allowParallelRepeat:true,excludeNumberPrefixes:['RC']}),slot('core-rare','core',RARE,{rareOrHigher:true,finish:'holo-eligible',excludeNumberPrefixes:['RC']}),slot('radiant-common','core',LOW,{specialRule:'radiant-collection',requiredNumberPrefixes:['RC']}),slot('radiant-hit','core',['uncommon','rare','ultra','illustration','special-illustration','secret'],{specialRule:'radiant-collection',requiredNumberPrefixes:['RC']})]},
    'double crisis':{id:'double_crisis_7',cardCount:7,price:450,rateFamily:'xy-special',slots:[...Array.from({length:3},(_,i)=>slot(`common-${i+1}`,'core',LOW)),...Array.from({length:2},(_,i)=>slot(`uncommon-${i+1}`,'core',MID)),slot('reverse','core',ANY,{finish:'reverse-holo',allowParallelRepeat:true}),slot('holo-hit','core',RARE,{rareOrHigher:true,finish:'holo'})]},
    'detective pikachu':{id:'detective_pikachu_4',cardCount:4,price:325,rateFamily:'celebration-all-holo',slots:Array.from({length:4},(_,i)=>slot(`holo-${i+1}`,'core',ANY,{finish:'holo'}))},
    'generations':{id:'generations_10_rc',cardCount:10,price:650,rateFamily:'xy-special',slots:[...Array.from({length:4},(_,i)=>slot(`core-common-${i+1}`,'core',LOW,{excludeNumberPrefixes:['RC']})),...Array.from({length:2},(_,i)=>slot(`core-uncommon-${i+1}`,'core',MID,{excludeNumberPrefixes:['RC']})),slot('core-reverse','core',ANY,{finish:'reverse-holo',allowParallelRepeat:true,excludeNumberPrefixes:['RC']}),slot('core-rare','core',RARE,{rareOrHigher:true,finish:'holo-eligible',excludeNumberPrefixes:['RC']}),slot('radiant-common','core',LOW,{specialRule:'radiant-collection',requiredNumberPrefixes:['RC']}),slot('radiant-hit','core',['uncommon','rare','ultra','illustration','special-illustration','secret'],{specialRule:'radiant-collection',requiredNumberPrefixes:['RC']})]},
    'celebrations':{id:'celebrations_4',cardCount:4,price:375,rateFamily:'celebration-all-holo',slots:[slot('foil-1','core',ANY,{finish:'holo'}),slot('foil-2','core',ANY,{finish:'holo'}),slot('foil-3','core',ANY,{finish:'holo',replacements:[{pool:'subset-key',subsetKeys:['Ann25thR','cel25c'],specialRule:'celebrations-classic',weight:.25}]}),slot('foil-4','core',ANY,{finish:'holo',rareOrHigher:true})]},
    '30th celebration':{id:'30th_celebration_6',cardCount:6,price:500,rateFamily:'sv-high-density',slots:[...Array.from({length:4},(_,i)=>slot(`foil-${i+1}`,'core',ANY,{finish:'holo',excludeRarities:['Pikachu Rare'],excludeSpecialRule:'30th-pikachu-rare'})),slot('pikachu-rare','core',ANY,{finish:'holo',requiredName:'Pikachu',requiredRarity:'Pikachu Rare',specialRule:'30th-pikachu-rare'}),slot('energy','special-energy',ANY,{finish:'holo',energy:true,requiredSupertype:'Energy'})]}
  });;

  const PROFILE_META=Object.freeze({
    wotc_11:{cardCount:11,price:650,rateFamily:'classic-wotc'},
    ecard_ex_9:{cardCount:9,price:550,rateFamily:'ecard-ex'},
    dp_bw_xy_10:{cardCount:10,price:600,rateFamily:'dp-bw-xy'},
    sm_swsh_10:{cardCount:10,price:600,rateFamily:'sm-swsh'},
    sv_10:{cardCount:10,price:600,rateFamily:'sv-standard'}
  });
  const CUT={ECARD:Date.parse('2002-09-15T00:00:00Z'),DP:Date.parse('2007-05-01T00:00:00Z'),SM:Date.parse('2017-02-03T00:00:00Z'),SV:Date.parse('2023-03-31T00:00:00Z')};

  function rateFamilyOverride(set,base){
    const k=keyOf(set),d=dateOf(set);
    if(/heartgold|soulsilver|unleashed|undaunted|triumphant/.test(k)||(d!==null&&d>=Date.parse('2010-02-10T00:00:00Z')&&d<Date.parse('2011-04-25T00:00:00Z')))return 'hgss-legend';
    return base;
  }
  function seriesProfile(set){
    const series=norm(set?._librarySeries||set?.series||'');
    if(!series)return null;
    if(['classic','base','gym','neo'].some(v=>series===v||series.startsWith(v+' ')))return 'wotc_11';
    if(series==='e card'||series==='e-card'||series==='ex'||series.startsWith('ex '))return 'ecard_ex_9';
    if(['diamond pearl','diamond and pearl','platinum','heartgold soulsilver','heartgold soul silver','black white','black and white','xy'].some(v=>series===v||series.startsWith(v+' ')))return 'dp_bw_xy_10';
    if(['sun moon','sun and moon','sword shield','sword and shield'].some(v=>series===v||series.startsWith(v+' ')))return 'sm_swsh_10';
    if(['scarlet violet','scarlet and violet','mega evolution'].some(v=>series===v||series.startsWith(v+' ')))return 'sv_10';
    return null;
  }
  function standardId(set){
    // Prefer the catalogue's explicit series whenever it is available. Release
    // dates are still accepted for older cached rows, but should never be able
    // to push a correctly-series-labelled set into the previous/next era.
    const bySeries=seriesProfile(set);
    if(bySeries)return bySeries;
    const d=dateOf(set);
    if(d===null)return null;
    if(d<CUT.ECARD)return 'wotc_11';
    if(d<CUT.DP)return 'ecard_ex_9';
    if(d<CUT.SM)return 'dp_bw_xy_10';
    if(d<CUT.SV)return 'sm_swsh_10';
    return 'sv_10';
  }
  function specialFor(set){const k=keyOf(set);if(k.includes('30th celebration')&&!k.includes('classic collection'))return SPECIAL['30th celebration'];for(const [name,p] of Object.entries(SPECIAL)){if(name==='30th celebration')continue;if(k===name||k.includes(name))return p;}return null;}
  function fixedSpecialProduct(set){
    const k=keyOf(set),id=norm(set?._libraryKey||set?._libraryCode||set?.id||'');
    if(id==='tk4g'||id==='tk4r'||k.includes('hs trainer kit gyarados')||k.includes('hs trainer kit raichu')){
      return Object.freeze({id:'fixed_half_deck_30',cardCount:30,price:600,rateFamily:'fixed-product',productKind:'half-deck',fixedContents:true,slots:Object.freeze([])});
    }
    return null;
  }
  function flexibleSpecialProduct(set){
    const k=keyOf(set);
    const known=/\btrainer kit\b|\bmcdonald\b|\bmy first battle\b|\b(?:pokemon )?tcg classic\b|\bpokemon trading card game classic\b|^rumble$|\bpokemon rumble\b|\bsouthern islands\b|\bkalos starter set\b|\bbox topper\b|\benerg(?:y|ies)\b/;
    if(!known.test(k))return null;
    const total=Math.max(0,Number(set?.cardCount?.total??set?.cardCount?.official??set?.total??set?.setTotal)||0);
    const count=!total?4:total<=40?4:total<=70?6:total<=100?8:10;
    const price=count<=4?325:count<=6?425:count<=8?525:600;
    return Object.freeze({id:`special_flexible_${count}`,cardCount:count,price,rateFamily:'special-flexible',slots:Object.freeze(Array.from({length:count},(_,i)=>slot(`special-${i+1}`,'core',FLEX_ANY)))});
  }
  function pocketProfile(set){
    const deluxe=!!set?._deluxe||/deluxe/.test(keyOf(set));const count=deluxe?4:5;
    const slots=deluxe?[slot('pocket-1','core',['common','uncommon']),slot('pocket-2','core',['uncommon','rare']),slot('pocket-3','core',['rare','double-rare','ultra']),slot('pocket-4','core',HIT,{rareOrHigher:true,replacements:[{family:'pocket-deluxe-hit',weight:1}]})]:[
      slot('pocket-1','core',['common','uncommon']),slot('pocket-2','core',['common','uncommon']),slot('pocket-3','core',['common','uncommon']),slot('pocket-4','core',['uncommon','rare','double-rare','ultra','illustration'],{replacements:[{family:'pocket-fourth',weight:1}]}),slot('pocket-5','core',RARE,{rareOrHigher:true,replacements:[{family:'pocket-fifth',weight:1}]})
    ];
    return Object.freeze({id:deluxe?'pocket_deluxe_4':'pocket_standard_5',source:'tcgp',cardCount:count,price:450,rateFamily:deluxe?'pocket-deluxe':'pocket-standard',productKind:'booster',purchasable:true,parent:null,slots:Object.freeze(slots)});
  }
  function resolve(set={},source='tcg'){
    if(source==='tcgp')return pocketProfile(set);
    const parent=subsetParent(set);if(parent)return Object.freeze({id:'subset',source:'tcg',cardCount:0,price:0,rateFamily:'subset',productKind:'subset',purchasable:false,parent,slots:Object.freeze([])});
    const fixed=fixedSpecialProduct(set);if(fixed)return Object.freeze({...fixed,source:'tcg',purchasable:false,parent:null,slots:Object.freeze([])});
    const special=specialFor(set);if(special)return Object.freeze({...special,source:'tcg',productKind:'booster',purchasable:true,parent:null,slots:Object.freeze(special.slots.slice())});
    const flexible=flexibleSpecialProduct(set);if(flexible)return Object.freeze({...flexible,source:'tcg',productKind:'non-booster',purchasable:false,parent:null,slots:Object.freeze(flexible.slots.slice())});
    const id=standardId(set);
    if(!id)return Object.freeze({id:'unknown',source:'tcg',cardCount:0,price:0,rateFamily:'unknown',productKind:'unknown',purchasable:false,parent:null,slots:Object.freeze([])});
    const m=PROFILE_META[id];return Object.freeze({id,source:'tcg',cardCount:m.cardCount,price:m.price,rateFamily:rateFamilyOverride(set,m.rateFamily),productKind:'booster',purchasable:true,parent:null,slots:Object.freeze(standardSlots(id))});
  }
  const POCKET_BONUS_PROFILES=Object.freeze({
    a4:Object.freeze({chance:.08330,rule:'wisdom-baby-bonus',numbers:Object.freeze([32,66,70,75,77,101,166,171])}),
    a4a:Object.freeze({chance:.08330,rule:'secluded-baby-bonus',numbers:Object.freeze([23,59,63,77])}),
    b1:Object.freeze({chance:.05238,rule:'pocket-shiny-bonus'}),
    b1a:Object.freeze({chance:.05238,rule:'pocket-shiny-bonus'}),
    b2:Object.freeze({chance:.05238,rule:'fantastical-bonus-shiny'}),
    b2a:Object.freeze({chance:.05238,rule:'pocket-shiny-bonus'}),
    b2b:Object.freeze({chance:.05238,rule:'mega-shine-bonus'}),
    b3:Object.freeze({chance:.05238,rule:'pocket-shiny-bonus'}),
    b3a:Object.freeze({chance:.05238,rule:'pocket-shiny-bonus'}),
    b3b:Object.freeze({chance:.05238,rule:'pocket-shiny-bonus'}),
    b4:Object.freeze({chance:.05238,rule:'pocket-shiny-bonus'}),
    b4a:Object.freeze({chance:.05238,rule:'pocket-shiny-bonus'}),
    b4b:Object.freeze({chance:.01666,rule:'deluxe-mega-bonus'})
  });
  const POCKET_BONUS_NAMES=Object.freeze({
    'wisdom of sea and sky':'a4','secluded springs':'a4a','mega rising':'b1','crimson blaze':'b1a',
    'fantastical parade':'b2','paldean wonders':'b2a','mega shine':'b2b','pulsing aura':'b3',
    'paradox drive':'b3a','everyday wonders':'b3b','ruler of the skies':'b4',
    'team rocket s ambition':'b4a','deluxe pack mega':'b4b'
  });
  const pocketSetKey=set=>norm(set?.id||'').replace(/\s+/g,'')||POCKET_BONUS_NAMES[keyOf(set)]||'';
  const localNumber=card=>{const raw=String(card?.localId??card?.number??card?.printedNumber??'').trim();return /^0*\d+$/.test(raw)?Number(raw):NaN;};
  function pocketBonusProfile(set){const id=pocketSetKey(set);return POCKET_BONUS_PROFILES[id]||POCKET_BONUS_PROFILES[POCKET_BONUS_NAMES[keyOf(set)]]||null;}
  function pocketBonusSlot(profile){
    if(!profile)return null;
    if(profile.rule==='wisdom-baby-bonus'||profile.rule==='secluded-baby-bonus')return slot('pocket-bonus-baby','core',ANY,{specialRule:profile.rule});
    if(profile.rule==='mega-shine-bonus')return slot('pocket-bonus-shiny','core',['ultra','special-illustration','secret'],{rareOrHigher:true,specialRule:profile.rule});
    if(profile.rule==='deluxe-mega-bonus')return slot('pocket-bonus-shiny','core',['special-illustration'],{rareOrHigher:true,specialRule:profile.rule});
    return slot('pocket-bonus-shiny','core',['ultra','special-illustration'],{rareOrHigher:true,specialRule:profile.rule});
  }
  function isPocketBonusOnlyCard(card,set){
    const profile=pocketBonusProfile(set);if(!profile)return false;
    const rarity=norm(card?.rarity??card?.printedRarity??''),number=localNumber(card),name=norm(card?.name||'');
    if(profile.rule==='wisdom-baby-bonus'||profile.rule==='secluded-baby-bonus')return profile.numbers.includes(number);
    if(profile.rule==='mega-shine-bonus')return /^(?:one shiny|two shiny)$/.test(rarity)||(number===86&&name==='mew');
    if(profile.rule==='deluxe-mega-bonus')return rarity==='two shiny';
    return /^(?:one shiny|two shiny)$/.test(rarity);
  }
  function slotPlan(set,options={}){
    const source=options.source||'tcg',p=resolve(set,source);let slots=p.slots.slice();
    const random=typeof options.random==='function'?options.random:Math.random;
    if(source==='tcgp'){
      const bonus=pocketBonusProfile(set);
      if(bonus&&random()<bonus.chance){const descriptor=pocketBonusSlot(bonus);if(descriptor)slots.push(descriptor);}
    }
    if(source==='tcgp'&&options.luckyPack){
      const baseCount=p.slots.length,greatIndex=Math.max(0,slots.slice(0,baseCount).findIndex(row=>row.id==='pocket-5'));
      const guaranteedIndex=greatIndex>=0&&slots[greatIndex]?.id==='pocket-5'?greatIndex:Math.max(0,baseCount-1);
      slots=slots.map((s,index)=>{
        if(index>=baseCount)return s;
        const upgraded=[...new Set((s.allowedClasses||[]).map(upgradePocketRareClass))];
        const rarePackAllowed=index===guaranteedIndex?POCKET_RARE_GREAT:[...new Set([...(s.allowedClasses||[]),...upgraded])];
        return Object.freeze({...s,specialRule:'pocket-rare-uplift',rarePackGreatHit:index===guaranteedIndex,rarePackAllowedClasses:Object.freeze(rarePackAllowed.slice()),rarePackBaseSpecialRule:s.specialRule||''});
      });
    }
    if(source==='tcg'&&p.purchasable){
      const sub=parentSubset(set);
      if(sub){
        const idx=slots.findIndex(row=>row.finish==='reverse-holo'||row.finish==='reverse-or-holo'||/^foil-[12]$/.test(row.id));
        if(sub.mode==='inline'&&sub.numberPrefix){
          const prefix=String(sub.numberPrefix).toUpperCase();
          // Gallery rows share the parent's source set. Keep them out of every
          // ordinary slot, then allow them only as the audited reverse-slot replacement.
          slots=slots.map(row=>Object.freeze({...row,excludeNumberPrefixes:Object.freeze([...new Set([...(row.excludeNumberPrefixes||[]),prefix])])}));
          if(idx>=0){const row=slots[idx];slots[idx]=Object.freeze({...row,replacements:Object.freeze([...(row.replacements||[]),{pool:'inline-subset',requiredNumberPrefixes:Object.freeze([prefix]),excludeNumberPrefixes:Object.freeze([]),finish:'holo',weight:sub.weight}])});}
        }else if(sub.mode==='external'&&sub.subsetKeys?.length&&idx>=0){
          const row=slots[idx];slots[idx]=Object.freeze({...row,replacements:Object.freeze([...(row.replacements||[]),{pool:'subset-key',subsetKeys:Object.freeze(sub.subsetKeys.slice()),finish:'holo',weight:sub.weight}])});
        }
      }
    }
    if(options.luckyPack&&source==='tcg'&&!['special-flexible','celebration-all-holo'].includes(p.rateFamily))slots=slots.map(s=>s.rareOrHigher?Object.freeze({...s,allowedClasses:Object.freeze([...new Set([...(s.allowedClasses||[]),...HIT])]),replacements:Object.freeze([...(s.replacements||[]),{family:'lucky-hit',weight:1}])}):s);
    return slots;
  }

  const ENERGY_TYPES_30TH=Object.freeze([
    ['Grass',9],['Fire',10],['Water',11],['Lightning',12],['Psychic',13],['Fighting',14],['Darkness',15],['Metal',16]
  ]);
  function specialPoolCards(set,descriptor){
    if(descriptor?.pool!=='special-energy'||keyOf(set)!=='30th celebration')return [];
    return ENERGY_TYPES_30TH.map(([type,number])=>Object.freeze({
      id:`mee-${number}`,localId:String(number),name:`Basic ${type} Energy`,rarity:'Common',supertype:'Energy',subtypes:['Basic'],source:'tcg',setId:'mee',setName:'Mega Evolution Energies',setTotal:16,setRelease:'2025-09-26',_libraryNative:true,_artIdentityVerified:true,_foil:'Foil',image:`https://images.scrydex.com/pokemon/mee-${number}/large`
    }));
  }
  function is30thPikachuRare(card){
    const rawName=norm(card?.name||''),rawRarity=norm(card?.rarity??card?.printedRarity??'');
    const rawNumber=String(card?.localId??card?.number??card?.printedNumber??'').trim();
    const number=/^0*\d+$/.test(rawNumber)?Number(rawNumber):NaN;
    return rawName==='pikachu'&&(rawRarity==='pikachu rare'||(Number.isFinite(number)&&number>=23&&number<=52));
  }
  const prefixList=value=>(Array.isArray(value)?value:[]).map(v=>String(v||'').trim().toUpperCase()).filter(Boolean);
  const cardLibraryKey=card=>libraryKeyOf({_libraryKey:card?._librarySetKey||card?._libraryCode||card?.set?.id||card?.setId||''});
  function numberRuleMatches(card,descriptor){
    const number=rawCardNumber(card),required=prefixList(descriptor?.requiredNumberPrefixes),excluded=prefixList(descriptor?.excludeNumberPrefixes);
    if(required.length&&!required.some(prefix=>number.startsWith(prefix)))return false;
    if(excluded.some(prefix=>number.startsWith(prefix)))return false;
    return true;
  }
  function poolIdentityMatches(card,descriptor,set){
    if(descriptor?.pool==='special-energy')return true;
    const cardKey=cardLibraryKey(card),setKey=libraryKeyOf(set);
    const sameSet=!cardKey||!setKey||cardKey===setKey;
    if(sameSet&&numberRuleMatches(card,descriptor))return true;
    for(const replacement of descriptor?.replacements||[]){
      const pool=String(replacement?.pool||'');
      if(pool==='inline-subset'){
        if(!sameSet)continue;
        const candidate={...descriptor,...replacement,excludeNumberPrefixes:replacement.excludeNumberPrefixes||[]};
        if(numberRuleMatches(card,candidate))return true;
      }else if(pool==='subset-key'){
        const keys=(replacement.subsetKeys||[]).map(key=>libraryKeyOf({_libraryKey:key})).filter(Boolean);
        if(cardKey&&keys.includes(cardKey)&&numberRuleMatches(card,{...descriptor,...replacement,excludeNumberPrefixes:replacement.excludeNumberPrefixes||[]}))return true;
      }
    }
    // Effective replacement descriptors are passed directly by the pack builder.
    if(descriptor?.pool==='subset-key'){
      const keys=(descriptor.subsetKeys||[]).map(key=>libraryKeyOf({_libraryKey:key})).filter(Boolean);
      return !!cardKey&&keys.includes(cardKey)&&numberRuleMatches(card,descriptor);
    }
    if(descriptor?.pool==='inline-subset')return sameSet&&numberRuleMatches(card,descriptor);
    return false;
  }
  function cardMatchesDescriptor(card,descriptor,set=null,source='tcg',classifier=null){
    if(!card||!descriptor)return false;
    if(source==='tcg'&&!poolIdentityMatches(card,descriptor,set))return false;
    const rawRarity=norm(card?.rarity??card?.printedRarity??'');
    const rawName=norm(card?.name||'');
    const rawSupertype=norm(card?.supertype||card?.category||'');
    const number=localNumber(card);
    const bonusRule=descriptor.specialRule||'';
    const isBonusDescriptor=['wisdom-baby-bonus','secluded-baby-bonus','pocket-shiny-bonus','fantastical-bonus-shiny','mega-shine-bonus','deluxe-mega-bonus'].includes(bonusRule);
    if(source==='tcgp'&&!isBonusDescriptor&&isPocketBonusOnlyCard(card,set))return false;
    if(descriptor.specialRule==='30th-pikachu-rare'&&!is30thPikachuRare(card))return false;
    if((bonusRule==='pocket-shiny-bonus'||bonusRule==='fantastical-bonus-shiny')&&!/^(?:one shiny|two shiny)$/.test(rawRarity))return false;
    if(bonusRule==='wisdom-baby-bonus'&&!POCKET_BONUS_PROFILES.a4.numbers.includes(number))return false;
    if(bonusRule==='secluded-baby-bonus'&&!POCKET_BONUS_PROFILES.a4a.numbers.includes(number))return false;
    if(bonusRule==='mega-shine-bonus'&&!(/^(?:one shiny|two shiny)$/.test(rawRarity)||(number===86&&rawName==='mew')))return false;
    if(bonusRule==='deluxe-mega-bonus'&&rawRarity!=='two shiny')return false;
    if(descriptor.excludeSpecialRule==='30th-pikachu-rare'&&is30thPikachuRare(card))return false;
    if(descriptor.requiredRarity&&descriptor.specialRule!=='30th-pikachu-rare'&&rawRarity!==norm(descriptor.requiredRarity))return false;
    if(descriptor.requiredName&&rawName!==norm(descriptor.requiredName))return false;
    if(descriptor.requiredSupertype&&rawSupertype!==norm(descriptor.requiredSupertype))return false;
    if((descriptor.excludeRarities||[]).some(value=>rawRarity===norm(value)))return false;
    const classify=typeof classifier==='function'?classifier:(typeof globalThis==='object'&&typeof globalThis.LuckyDexCardRarity?.classify==='function'?globalThis.LuckyDexCardRarity.classify:null);
    const allowedClasses=descriptor.rarePackAllowedClasses||descriptor.allowedClasses;
    if(classify&&allowedClasses?.length){
      const rarityClass=classify(card,set)?.rarityClass||'unknown';
      if(!allowedClasses.includes(rarityClass))return false;
    }
    return true;
  }

  function validatePack(cards,set={},source='tcg',options={}){
    const opts=options&&typeof options==='object'?options:{};
    const slots=Array.isArray(opts.slots)?opts.slots:slotPlan(set,{source,luckyPack:!!opts.luckyPack,random:typeof opts.random==='function'?opts.random:Math.random});
    const list=Array.isArray(cards)?cards:[];
    const errors=[];
    const classifier=typeof opts.classifier==='function'?opts.classifier:(typeof globalThis==='object'&&typeof globalThis.LuckyDexCardRarity?.classify==='function'?globalThis.LuckyDexCardRarity.classify:null);
    if(!Array.isArray(cards))errors.push('pack: cards is not an array');
    if(list.length!==slots.length)errors.push(`pack: expected ${slots.length} cards, received ${list.length}`);
    const seen=new Map();
    for(let i=0;i<Math.min(list.length,slots.length);i++){
      const card=list[i],descriptor=slots[i],slotId=descriptor?.id||`slot-${i+1}`;
      if(!cardMatchesDescriptor(card,descriptor,set,source,classifier))errors.push(`${slotId}: card does not match slot contract`);
      const id=String(card?.id||'').trim();
      if(id){
        const foil=norm(card?._foil||'normal'),previous=seen.get(id)||[];
        if(previous.length){
          if(!descriptor?.allowParallelRepeat)errors.push(`${slotId}: duplicate card identity ${id}`);
          else if(previous.includes(foil))errors.push(`${slotId}: duplicate parallel ${id} (${foil||'normal'})`);
        }
        previous.push(foil);seen.set(id,previous);
      }
    }
    return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),profileId:resolve(set,source).id,cardCount:list.length,slotCount:slots.length});
  }

  function pocketBaseTargetClasses(descriptor,random=Math.random){
    const specialRule=descriptor?.rarePackBaseSpecialRule||descriptor?.specialRule||'';
    if(specialRule==='wisdom-baby-bonus'||specialRule==='secluded-baby-bonus')return [];
    if(specialRule==='pocket-shiny-bonus'||specialRule==='fantastical-bonus-shiny')return [weighted([['ultra',.6818],['special-illustration',.3182]],random)];
    if(specialRule==='mega-shine-bonus')return [weighted([['ultra',.6816],['special-illustration',.2544],['secret',.064]],random)];
    if(specialRule==='deluxe-mega-bonus')return ['special-illustration'];
    if(descriptor.id==='pocket-5'||descriptor.rareOrHigher)return [weighted([['rare',.63],['double-rare',.22],['ultra',.09],['illustration',.045],['special-illustration',.012],['secret',.003]],random)];
    if(descriptor.id==='pocket-4')return [weighted([['uncommon',.70],['rare',.22],['double-rare',.06],['illustration',.018],['special-illustration',.002]],random)];
    return (descriptor.allowedClasses||[]).slice();
  }
  const PHYSICAL_JACKPOT_SECRET_SHARE=1/6;
  function classifyForTarget(card,set,classifier){
    const fn=typeof classifier==='function'?classifier:(typeof globalThis==='object'&&typeof globalThis.LuckyDexCardRarity?.classify==='function'?globalThis.LuckyDexCardRarity.classify:null);
    return fn?fn(card,set):null;
  }
  function isJackpotSecret(card,set=null,classifier=null){
    const c=classifyForTarget(card,set,classifier);
    return !!c&&c.rarityClass==='secret'&&(Number(c.revealRank)>=8||/jackpot/i.test(String(c.revealLabel||'')));
  }
  function refinePhysicalTargetPlan(set,descriptor,cards,targets,classifier=null,random=Math.random){
    const base=Array.isArray(targets)?targets.slice():[];
    const plain=mode=>Object.freeze({targets:Object.freeze(base.slice()),secretMode:mode||'any'});
    if(base.length!==1||base[0]!=='secret'||!Array.isArray(cards)||!cards.length)return plain('any');
    const classify=card=>classifyForTarget(card,set,classifier);
    const eligible=cards.filter(card=>cardMatchesDescriptor(card,descriptor,set,'tcg',classifier)&&classify(card)?.rarityClass==='secret');
    const jackpots=eligible.filter(card=>isJackpotSecret(card,set,classifier));
    if(!jackpots.length)return plain('any');
    if(Math.max(0,Math.min(.999999999,Number(random())||0))<PHYSICAL_JACKPOT_SECRET_SHARE)return Object.freeze({targets:Object.freeze(['secret']),secretMode:'jackpot'});
    const ordinary=eligible.filter(card=>!isJackpotSecret(card,set,classifier));
    if(ordinary.length)return Object.freeze({targets:Object.freeze(['secret']),secretMode:'ordinary'});
    for(const rarityClass of ['special-illustration','illustration','ultra','double-rare','rare']){
      if(cards.some(card=>cardMatchesDescriptor(card,descriptor,set,'tcg',classifier)&&classify(card)?.rarityClass===rarityClass))return Object.freeze({targets:Object.freeze([rarityClass]),secretMode:'downgraded'});
    }
    return Object.freeze({targets:Object.freeze(['secret']),secretMode:'jackpot'});
  }
  function targetPlanMatches(card,plan,set=null,classifier=null){
    const c=classifyForTarget(card,set,classifier);if(!c)return false;
    if(plan?.secretMode==='jackpot')return c.rarityClass==='secret'&&isJackpotSecret(card,set,classifier);
    if(plan?.secretMode==='ordinary')return c.rarityClass==='secret'&&!isJackpotSecret(card,set,classifier);
    return (plan?.targets||[]).includes(c.rarityClass);
  }

  function targetClassesFor(set,descriptor,source='tcg',random=Math.random){
    if(source==='tcgp'){
      if(descriptor?.rarePackGreatHit)return [weighted([['ultra',.18],['illustration',.42],['special-illustration',.30],['secret',.10]],random)];
      const base=pocketBaseTargetClasses(descriptor,random);
      if(descriptor?.specialRule==='pocket-rare-uplift')return [...new Set(base.map(upgradePocketRareClass))];
      return base;
    }
    if((descriptor.replacements||[]).some(r=>r.family==='lucky-hit'))return ['secret','special-illustration','illustration','ultra','double-rare','historic-chase'];
    const family=rateFamilyOverride(set,resolve(set,source).rateFamily);
    if(descriptor.allowedClasses.length===1)return descriptor.allowedClasses.slice();
    if((descriptor.finish==='reverse-holo'||descriptor.finish==='reverse-or-holo')&&!descriptor.rareOrHigher){
      if(family==='sv-standard'||family==='sv-high-density'){
        if(descriptor.id==='foil-1')return [weighted([['common',.42],['uncommon',.34],['rare',.13],['illustration',.09],['ultra',.02]],random)];
        if(descriptor.id==='foil-2')return [weighted([['common',.43],['uncommon',.35],['rare',.165],['special-illustration',.04],['secret',.015]],random)];
      }
      return [weighted([['common',.45],['uncommon',.40],['rare',.12],['ultra',.025],['secret',.005]],random)];
    }
    if(descriptor.rareOrHigher){
      const rows=family==='hgss-legend'?[['rare',.84],['historic-chase',.07],['ultra',.07],['secret',.02]]:
        family==='ecard-ex'?[['rare',.88],['ultra',.105],['secret',.015]]:
        family==='dp-bw-xy'||family==='xy-special'?[['rare',.84],['ultra',.12],['illustration',.02],['special-illustration',.01],['secret',.01]]:
        family==='sm-swsh'?[['rare',.74],['double-rare',.13],['ultra',.08],['illustration',.03],['special-illustration',.015],['secret',.005]]:
        family==='sv-standard'?[['rare',.70],['double-rare',.22],['ultra',.065],['secret',.015]]:
        family==='sv-high-density'?[['rare',.55],['double-rare',.22],['ultra',.10],['illustration',.08],['special-illustration',.035],['secret',.015]]:
        [['rare',.96],['ultra',.035],['secret',.005]];
      return [weighted(rows,random)];
    }
    return descriptor.allowedClasses.slice();
  }
  function diagnostics(sets=[],rarities=[]){
    const rows=[];
    for(const s of sets){
      const p=resolve(s,'tcg'),value=s?.name||s?.id||'unknown';
      if(!p?.id)rows.push({kind:'profile',value,diagnostic:'missing-profile'});
      if(p?.id==='subset'&&!p.parent)rows.push({kind:'subset-parent',value,diagnostic:'missing-parent'});
    }
    const classifier=typeof globalThis==='object'&&globalThis.LuckyDexCardRarity?.classify;
    for(const r of rarities){
      const value=typeof r==='string'?r:(r?.rarity??r?.printedRarity??'');
      if(!norm(value)){rows.push({kind:'rarity',value,diagnostic:'missing-rarity'});continue;}
      if(typeof classifier==='function'){
        const result=classifier(typeof r==='string'?{rarity:r}:r||{});
        if(result?.rarityClass==='unknown')rows.push({kind:'rarity',value,diagnostic:result.diagnostic||'unknown-rarity'});
      }
    }
    return rows;
  }
  return Object.freeze({resolve,packSizeFor:(set,source='tcg')=>resolve(set,source).cardCount,priceFor:(set,source='tcg')=>resolve(set,source).price,slotPlan,targetClassesFor,refinePhysicalTargetPlan,targetPlanMatches,isJackpotSecret,PHYSICAL_JACKPOT_SECRET_SHARE,upgradePocketRareClass,cardMatchesDescriptor,validatePack,specialPoolCards,isPurchasable:(set,source='tcg')=>resolve(set,source).purchasable,parentFor:set=>subsetParent(set),rateFamilyFor:(set,source='tcg')=>resolve(set,source).rateFamily,diagnostics,flexibleSpecialProduct,SUBSETS,PARENT_SUBSETS,POCKET_BONUS_PROFILES,pocketBonusProfile});
});
