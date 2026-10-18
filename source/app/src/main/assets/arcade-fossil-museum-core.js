(function(root,factory){
  const api=factory();
  root.LuckyDexFossilMuseumCore=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const BOARD_DEFAULTS={rows:9,cols:12,minFinds:3,maxFinds:6,minDepth:2,maxDepth:4,stability:100};
  const TOOL_RULES={
    pickaxe:{stabilityCost:3,centreDamage:3,radius:0,neighbourDamage:0},
    hammer:{stabilityCost:8,centreDamage:2,radius:1,neighbourDamage:1}
  };
  const asset=id=>`arcade/fossil-museum-v0257/items/${id}.png`;
  const miningAsset=asset;
  const MASKS={
    // Relative dimensions follow Underground / Grand Underground buried-object proportions.
    helix:[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    dome:[[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,1],[2,2],[2,3],[2,4],[3,1],[3,2],[3,3]],
    amber:[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    root:[[0,1],[0,3],[1,0],[1,1],[1,2],[1,3],[1,4],[2,1],[2,2],[2,3],[3,0],[3,1],[3,3],[3,4],[4,0],[4,4]],
    claw:[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[3,1],[3,2],[4,1],[4,2]],
    skull:[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    armor:[[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3],[1,4],[2,0],[2,1],[2,2],[2,3],[2,4],[3,1],[3,2],[3,3]],
    star:[[0,1],[1,0],[1,1],[1,2],[2,0],[2,2]],
    keystone:[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    fossilA:[[0,0],[0,1],[1,0],[1,1],[2,1]],
    fossilB:[[0,1],[0,2],[1,0],[1,1],[1,2],[2,0]],
    fossilC:[[0,0],[0,1],[0,2],[1,1],[2,1]],
    fossilD:[[0,0],[1,0],[1,1],[2,1],[2,2]],
    small:[[0,0],[0,1],[1,0],[1,1]],
    medium:[[0,1],[1,0],[1,1],[1,2],[2,1]],
    large:[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    bone:[[0,1],[1,0],[1,1],[1,2],[2,1],[3,1],[4,1]],
    bar:[[0,0],[0,1],[0,2]],
    gem:[[0,1],[1,0],[1,1],[1,2],[2,1]],
    card:[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
    booster:[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]]
  };
  const ITEM_MASKS={
    "armor-fossil":[[0,1],[0,2],[0,3],[1,1],[1,2],[1,3],[2,1],[2,2],[2,3],[3,1],[3,2],[3,3]],
    "big-nugget":[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    "big-pearl":[[0,1],[1,0],[1,1],[1,2],[2,1]],
    "claw-fossil":[[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,0],[3,1],[3,2]],
    "coin-cache-25":[[0,0],[0,1],[1,0],[1,1]],
    "coin-cache-45":[[0,0],[0,1],[1,0],[1,1]],
    "coin-cache-70":[[0,0],[0,1],[1,0],[1,1]],
    "comet-shard":[[1,1],[1,2],[2,1],[2,2]],
    "cover-fossil":[[0,1],[1,0],[1,1],[2,1]],
    "dome-fossil":[[0,2],[0,3],[1,1],[1,2],[1,3],[2,1],[2,2],[2,3],[3,1],[3,2]],
    "everstone":[[0,1],[0,2],[1,1],[1,2]],
    "fire-stone":[[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    "fossilized-bird":[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
    "fossilized-dino":[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    "fossilized-drake":[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    "fossilized-fish":[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    "great-ball":[[0,0],[0,1],[1,0],[1,1]],
    "hard-stone":[[0,0],[0,1],[1,0],[1,1]],
    "helix-fossil":[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    "jaw-fossil":[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    "leaf-stone":[[1,0],[1,1],[1,2],[2,0],[2,1],[2,2],[3,1]],
    "moon-stone":[[0,1],[0,2],[1,1],[1,2]],
    "nugget":[[0,0],[0,1],[1,0],[1,1]],
    "odd-keystone":[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    "old-amber":[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    "pearl":[[0,0],[0,1],[1,0],[1,1]],
    "plume-fossil":[[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1]],
    "poke-ball":[[0,0],[0,1],[1,0],[1,1]],
    "rare-bone":[[1,1],[1,2],[2,0],[2,1],[2,2],[3,0],[3,1]],
    "relic-band":[[0,0],[0,1],[1,0],[1,1]],
    "relic-copper":[[0,0],[0,1],[1,0],[1,1]],
    "relic-crown":[[0,0],[0,1],[1,0],[1,1]],
    "relic-gold":[[0,0],[0,1],[1,0],[1,1]],
    "relic-silver":[[1,0],[1,1],[1,2]],
    "relic-statue":[[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    "relic-vase":[[0,0],[0,1],[1,0],[1,1],[1,2],[2,1]],
    "root-fossil":[[0,2],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[2,4],[3,0],[3,1],[3,2],[3,3],[4,1],[4,3]],
    "sail-fossil":[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
    "skull-fossil":[[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]],
    "star-piece":[[0,1],[1,0],[1,1],[1,2],[2,1]],
    "stardust":[[0,0],[0,1],[1,0],[1,1]],
    "tcg-card":[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
    "tcg-booster":[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
    "thunder-stone":[[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1]],
    "ultra-ball":[[0,0],[0,1],[1,0],[1,1]],
    "water-stone":[[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1]],
  };
  function entry(id,name,category,weight,sprite,mask,museumEligible,duplicateCoins,flavour,rewardDestination,extra={}){
    return {id,name,category,weight,sprite,mask,museumEligible,duplicateCoins,flavour,rewardDestination,...extra};
  }
  const fossils=[
    ['helix-fossil','Helix Fossil',miningAsset('helix-fossil'),MASKS.helix,60,'A spiral fossil from an ancient sea. Its coiled shell hints at a life spent drifting through prehistoric waters.'],
    ['dome-fossil','Dome Fossil',miningAsset('dome-fossil'),MASKS.dome,60,'A broad shell fossil worn smooth by immense stretches of time.'],
    ['old-amber','Old Amber',miningAsset('old-amber'),MASKS.amber,60,'Golden amber preserving traces of ancient Pokémon life within its hardened resin.'],
    ['root-fossil','Root Fossil',miningAsset('root-fossil'),MASKS.root,60,'A branching fossil whose stony shape still resembles the roots of an ancient organism.'],
    ['claw-fossil','Claw Fossil',miningAsset('claw-fossil'),MASKS.claw,60,'A hooked fossil from a long-extinct Pokémon built for life among ancient reefs.'],
    ['skull-fossil','Skull Fossil',miningAsset('skull-fossil'),MASKS.skull,60,'A thick fossilised skull built to withstand tremendous impacts.'],
    ['armor-fossil','Armor Fossil',miningAsset('armor-fossil'),MASKS.armor,60,'A plated fossil whose heavy armour survived long after the Pokémon itself vanished.'],
    ['cover-fossil','Cover Fossil',asset('cover-fossil'),MASKS.fossilA,60,'A shell-like fossil from a Pokémon that once crawled along ancient seafloors.'],
    ['plume-fossil','Plume Fossil',asset('plume-fossil'),MASKS.fossilD,60,'A feather-shaped fossil from a nimble prehistoric Pokémon.'],
    ['jaw-fossil','Jaw Fossil',asset('jaw-fossil'),MASKS.fossilB,60,'A formidable jaw fossil lined with the memory of crushing teeth.'],
    ['sail-fossil','Sail Fossil',asset('sail-fossil'),MASKS.fossilC,60,'A delicate sail-shaped fossil once used to regulate the body of an ancient Pokémon.'],
    ['fossilized-bird','Fossilized Bird',asset('fossilized-bird'),MASKS.fossilA,75,'One half of a strange Galar fossil puzzle, preserved without the rest of its body.'],
    ['fossilized-dino','Fossilized Dino',asset('fossilized-dino'),MASKS.fossilB,75,'A frozen-looking fragment from Galar, waiting for an improbable partner.'],
    ['fossilized-drake','Fossilized Drake',asset('fossilized-drake'),MASKS.fossilC,75,'A sturdy ancient fragment whose original creature remains a mystery.'],
    ['fossilized-fish','Fossilized Fish',asset('fossilized-fish'),MASKS.fossilD,75,'A piscine fossil fragment from Galar, remarkably intact despite its age.']
  ].map((x,i)=>entry(x[0],x[1],'fossil',i<7?12:9,x[2],x[3],true,x[4],x[5],'museum'));
  const relicData=[
    ['relic-copper','Relic Copper',60,'A weathered copper treasure from a vanished civilisation.'],
    ['relic-silver','Relic Silver',90,'A silver relic polished smooth by centuries underground.'],
    ['relic-gold','Relic Gold',130,'A heavy gold relic whose maker has long been forgotten.'],
    ['relic-vase','Relic Vase',110,'An ancient vessel recovered intact from deep below the surface.'],
    ['relic-band','Relic Band',130,'A ceremonial band whose purpose is lost to history.'],
    ['relic-statue','Relic Statue',160,'A tiny carved figure, carefully preserved in the earth.'],
    ['relic-crown','Relic Crown',220,'A rare crown-like relic worthy of the museum treasury case.']
  ];
  const relics=relicData.map((x,i)=>entry(x[0],x[1],'relic',7-i*.45,asset(x[0]),i%2?MASKS.gem:MASKS.small,true,x[2],x[3],'museum'));
  const geology=[
    ['hard-stone','Hard Stone','A dense mineral specimen with a satisfying weight.',MASKS.small],
    ['everstone','Everstone','An unusually stable stone prized by Pokémon researchers.',[[0,0],[0,1],[0,2],[0,3],[1,1],[1,2]]],
    ['fire-stone','Fire Stone','A warm mineral whose core glows like a banked ember.',MASKS.medium],
    ['water-stone','Water Stone','A clear blue mineral shaped by the pressure of water and time.',MASKS.medium],
    ['thunder-stone','Thunder Stone','A yellow-green crystal that seems to hold a charge.',MASKS.medium],
    ['leaf-stone','Leaf Stone','A green stone carrying the pattern of a fossilised leaf.',[[0,1],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2],[3,1]]],
    ['moon-stone','Moon Stone','A pale, strange mineral traditionally associated with moonlight.',[[0,0],[0,1],[0,2],[0,3],[1,1],[1,2]]]
  ].map(x=>entry(x[0],x[1],'geology',8,miningAsset(x[0]),x[3],true,40,x[2],'museum'));
  const odd=entry('odd-keystone','Odd Keystone','signature',3,miningAsset('odd-keystone'),MASKS.keystone,true,180,'A peculiar stone marked by many small hollows. Something about it feels far less ordinary than the surrounding rock.','museum');
  const balls=[
    entry('poke-ball','Poké Ball','inventory',9,asset('poke-ball'),MASKS.small,false,0,'','inventory',{inventoryKey:'pokeball',amount:1}),
    entry('great-ball','Great Ball','inventory',6,asset('great-ball'),MASKS.small,false,0,'','inventory',{inventoryKey:'greatball',amount:1}),
    entry('ultra-ball','Ultra Ball','inventory',4,asset('ultra-ball'),MASKS.small,false,0,'','inventory',{inventoryKey:'ultraball',amount:1})
  ];
  const treasureValues={nugget:100,'big-nugget':250,pearl:60,'big-pearl':130,stardust:40,'star-piece':100,'rare-bone':160,'comet-shard':220};
  const treasureMasks={nugget:MASKS.small,'big-nugget':MASKS.medium,pearl:MASKS.small,'big-pearl':MASKS.medium,stardust:MASKS.small,'star-piece':MASKS.star,'rare-bone':MASKS.bone,'comet-shard':MASKS.large};
  const treasures=Object.entries(treasureValues).map(([id,value],i)=>entry(id,id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),'treasure',i<4?12:8,(id==='star-piece'||id==='rare-bone')?miningAsset(id):asset(id),treasureMasks[id]||MASKS.small,false,value,'','coins'));
  const coinCaches=[25,45,70].map((value,i)=>entry(`coin-cache-${value}`,`${value} Lucky Coins`,'coins',14-i*2,asset('relic-gold'),MASKS.small,false,value,'','coins'));
  const tcg=entry('tcg-card','Buried TCG Card','card',1,asset('tcg-card'),MASKS.card,false,0,'','card');
  const booster=entry('tcg-booster','Buried Booster Pack','booster',0.35,asset('tcg-card'),MASKS.booster,false,0,'','booster');
  const CATALOGUE=[...fossils,odd,...relics,...geology,...balls,...treasures,...coinCaches,tcg,booster];
  const RECOVERY_MASK_SOURCE='sprite-alpha-v0257';
  const RECOVERY_MASKS=ITEM_MASKS;
  for(const item of CATALOGUE){const m=(Array.isArray(RECOVERY_MASKS[item.id])&&RECOVERY_MASKS[item.id].length)?RECOVERY_MASKS[item.id]:item.mask;item.recoveryMask=m.map(([r,c])=>[r,c]);const occupied=new Set(item.mask.map(([r,c])=>`${r},${c}`));for(const [r,c] of item.recoveryMask)occupied.add(`${r},${c}`);item.mask=[...occupied].map(x=>x.split(',').map(Number));}
  const byId=id=>CATALOGUE.find(x=>x.id===id)||null;
  const BURIED_CARD_SITE_CHANCE=0.15;
  const BURIED_BOOSTER_SITE_CHANCE=0.04;
  const RECOVERY_CLEAR_RATIO=1;
  function rollBuriedCardTier(roll){
    const r=clamp(Number(roll),0,0.999999);
    return r<0.495?0:r<0.775?1:r<0.925?2:r<0.975?3:r<0.990?4:r<0.995?5:6;
  }
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const randInt=(rng,a,b)=>a+Math.floor(clamp(Number(rng()),0,0.999999)*(b-a+1));
  function weightedPick(list,rng){
    const total=list.reduce((s,x)=>s+Math.max(0,Number(x.weight)||0),0); if(total<=0)return list[0]||null;
    let roll=clamp(Number(rng()),0,0.999999)*total;
    for(const row of list){roll-=Math.max(0,Number(row.weight)||0);if(roll<0)return row;}return list[list.length-1]||null;
  }
  function maskBounds(mask){let maxR=0,maxC=0;for(const [r,c] of mask){maxR=Math.max(maxR,r);maxC=Math.max(maxC,c);}return {h:maxR+1,w:maxC+1};}
  function cellsFor(mask,row,col,cols){return mask.map(([r,c])=>(row+r)*cols+(col+c));}
  function canPlace(item,row,col,rows,cols,used){const {h,w}=maskBounds(item.mask);if(row<0||col<0||row+h>rows||col+w>cols)return false;return cellsFor(item.mask,row,col,cols).every(i=>!used.has(i));}
  function placeOne(item,rows,cols,used,rng,attempts=45){
    const {h,w}=maskBounds(item.mask);if(h>rows||w>cols)return null;
    for(let n=0;n<attempts;n++){
      const row=randInt(rng,0,rows-h),col=randInt(rng,0,cols-w);
      if(canPlace(item,row,col,rows,cols,used)){const cells=cellsFor(item.mask,row,col,cols);cells.forEach(i=>used.add(i));return {row,col,cells};}
    }
    for(let row=0;row<=rows-h;row++)for(let col=0;col<=cols-w;col++)if(canPlace(item,row,col,rows,cols,used)){const cells=cellsFor(item.mask,row,col,cols);cells.forEach(i=>used.add(i));return {row,col,cells};}
    return null;
  }
  function generateDigSite(options={}){
    const rng=typeof options.rng==='function'?options.rng:Math.random;
    const rows=Number(options.rows||BOARD_DEFAULTS.rows),cols=Number(options.cols||BOARD_DEFAULTS.cols);
    const minFinds=Number(options.minFinds??BOARD_DEFAULTS.minFinds),maxFinds=Number(options.maxFinds??BOARD_DEFAULTS.maxFinds);
    const buriedCardChance=clamp(Number(options.buriedCardChance??BURIED_CARD_SITE_CHANCE),0,1),buriedBoosterChance=clamp(Number(options.buriedBoosterChance??BURIED_BOOSTER_SITE_CHANCE),0,1);
    const catalogue=(options.catalogue||CATALOGUE).filter(x=>x&&Array.isArray(x.mask)&&x.mask.length);
    const count=clamp(randInt(rng,minFinds,maxFinds),minFinds,maxFinds);
    const depths=Array.from({length:rows*cols},()=>randInt(rng,BOARD_DEFAULTS.minDepth,BOARD_DEFAULTS.maxDepth));
    const used=new Set(),finds=[],chosen=new Set();
    const pushPlaced=(item,placed)=>{if(!item||!placed)return false;chosen.add(item.id);const recoveryCells=cellsFor(item.recoveryMask||item.mask,placed.row,placed.col,cols);finds.push({id:`find-${finds.length+1}-${item.id}`,itemId:item.id,row:placed.row,col:placed.col,cells:placed.cells,recoveryCells,recovered:false});return true;};
    const buriedCard=catalogue.find(x=>x.id==='tcg-card');
    if(buriedCard&&clamp(Number(rng()),0,0.999999)<buriedCardChance){
      pushPlaced(buriedCard,placeOne(buriedCard,rows,cols,used,rng));
    }
    const buriedBooster=catalogue.find(x=>x.id==='tcg-booster');
    if(buriedBooster&&clamp(Number(rng()),0,0.999999)<buriedBoosterChance){
      pushPlaced(buriedBooster,placeOne(buriedBooster,rows,cols,used,rng));
    }
    let guard=0;
    while(finds.length<count&&guard++<count*30){
      const pool=catalogue.filter(x=>x.id!=='tcg-card'&&x.id!=='tcg-booster'&&!chosen.has(x.id));if(!pool.length)break;
      const item=weightedPick(pool,rng);chosen.add(item.id);
      const placed=placeOne(item,rows,cols,used,rng);
      if(placed)pushPlaced(item,placed);
    }
    if(finds.length<Math.min(3,count)){
      const fallback=catalogue.slice().sort((a,b)=>a.mask.length-b.mask.length||String(a.id).localeCompare(String(b.id)));
      for(const item of fallback){
        if(finds.length>=Math.min(3,count))break;if(chosen.has(item.id)&&finds.some(f=>f.itemId===item.id))continue;
        const placed=placeOne(item,rows,cols,used,()=>0,5);
        if(placed){const recoveryCells=cellsFor(item.recoveryMask||item.mask,placed.row,placed.col,cols);finds.push({id:`find-${finds.length+1}-${item.id}`,itemId:item.id,row:placed.row,col:placed.col,cells:placed.cells,recoveryCells,recovered:false});}
      }
    }
    return {rows,cols,depths,finds,stability:BOARD_DEFAULTS.stability,finished:false,collapsed:false,awardedFindIds:[]};
  }
  function isFindRecovered(site,find){
    if(!site||!find)return false;
    const cells=(Array.isArray(find.recoveryCells)&&find.recoveryCells.length)?find.recoveryCells:find.cells;
    if(!Array.isArray(cells)||!cells.length)return false;
    const cleared=cells.reduce((count,i)=>count+(Number(site.depths?.[i])===0?1:0),0);
    return cleared>=Math.ceil(cells.length*RECOVERY_CLEAR_RATIO);
  }
  function completeRecoveredFinds(site){
    if(!site||!Array.isArray(site.finds))return [];
    const awarded=new Set(Array.isArray(site.awardedFindIds)?site.awardedFindIds:[]),fresh=[];
    for(const find of site.finds){if(!awarded.has(find.id)&&isFindRecovered(site,find)){find.recovered=true;awarded.add(find.id);fresh.push(find.id);}}
    site.awardedFindIds=[...awarded];return fresh;
  }
  function emptyStrike(site){return {changedIndices:[],recoveredIds:[],collapsed:!!site?.collapsed,allRecovered:false};}
  function ensureMuseumState(arcade){
    const host=(arcade&&typeof arcade==='object')?arcade:{};
    const museum=(host.museum&&typeof host.museum==='object')?host.museum:{};
    museum.exhibits=(museum.exhibits&&typeof museum.exhibits==='object')?museum.exhibits:{};
    host.museum=museum;
    return museum;
  }
  const CAVE_IN_LOSS_CHANCE=0.60;
  function resolveCaveInHaul(ids,rng=Math.random,lossChance=CAVE_IN_LOSS_CHANCE){
    const unique=[...new Set((Array.isArray(ids)?ids:[]).filter(Boolean))],keptIds=[],lostIds=[];
    const chance=clamp(Number(lossChance),0,1);
    for(const id of unique){((clamp(Number(rng()),0,0.999999)<chance)?lostIds:keptIds).push(id);}
    if(unique.length>=2&&keptIds.length===0&&lostIds.length){keptIds.push(lostIds.pop());}
    return {keptIds,lostIds};
  }
  function recordMuseumFind(museum,item,now=Date.now()){
    if(!museum||typeof museum!=='object'||!item?.id||!item.museumEligible)return {isNew:false,duplicateCoins:0,record:null};
    museum.exhibits=(museum.exhibits&&typeof museum.exhibits==='object')?museum.exhibits:{};
    const existing=museum.exhibits[item.id];
    if(existing&&existing.discovered){
      existing.foundCount=Math.max(1,Number(existing.foundCount)||1)+1;
      return {isNew:false,duplicateCoins:Math.max(0,Number(item.duplicateCoins)||0),record:existing};
    }
    const record={discovered:true,foundCount:1,firstFoundAt:Number(now)||Date.now()};
    museum.exhibits[item.id]=record;
    return {isNew:true,duplicateCoins:0,record};
  }
  function strike(site,index,toolId){
    const rule=TOOL_RULES[toolId];if(!site||site.finished||!rule||!Number.isInteger(index)||index<0||index>=site.depths.length)return emptyStrike(site);
    const row=Math.floor(index/site.cols),col=index%site.cols,changed=[];
    for(let dr=-rule.radius;dr<=rule.radius;dr++)for(let dc=-rule.radius;dc<=rule.radius;dc++){
      const rr=row+dr,cc=col+dc;if(rr<0||cc<0||rr>=site.rows||cc>=site.cols)continue;
      const i=rr*site.cols+cc,damage=(dr===0&&dc===0)?rule.centreDamage:rule.neighbourDamage;if(damage<=0)continue;
      const before=Number(site.depths[i]||0),after=Math.max(0,before-damage);if(after!==before){site.depths[i]=after;changed.push(i);}
    }
    site.stability=clamp(Number(site.stability||0)-rule.stabilityCost,0,100);
    changed.sort((a,b)=>a-b);
    const recoveredIds=completeRecoveredFinds(site);
    const allRecovered=site.finds.length>0&&site.finds.every(f=>site.awardedFindIds.includes(f.id));
    if(allRecovered)site.finished=true;
    else if(site.stability<=0){site.finished=true;site.collapsed=true;}
    return {changedIndices:changed,recoveredIds,collapsed:site.collapsed,allRecovered};
  }
  return {BOARD_DEFAULTS,TOOL_RULES,CAVE_IN_LOSS_CHANCE,BURIED_CARD_SITE_CHANCE,BURIED_BOOSTER_SITE_CHANCE,RECOVERY_CLEAR_RATIO,RECOVERY_MASK_SOURCE,RECOVERY_MASKS,CATALOGUE,MASKS,byId,rollBuriedCardTier,generateDigSite,strike,isFindRecovered,completeRecoveredFinds,resolveCaveInHaul,ensureMuseumState,recordMuseumFind};
});
