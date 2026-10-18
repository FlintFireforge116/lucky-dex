/* LuckyDex v0.34.1 — expanded, data-driven achievement catalogue. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexAchievements=api;
  api.install();
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';

  const CATEGORIES={collection:'Collection',tcg:'TCG',tcgp:'TCGP',pokemon:'Pokémon',adventure:'Adventure',arcade:'Arcade',museum:'Museum'};
  const GEN_RANGES=[
    [1,'Kanto',1,151],[2,'Johto',152,251],[3,'Hoenn',252,386],[4,'Sinnoh',387,493],[5,'Unova',494,649],
    [6,'Kalos',650,721],[7,'Alola',722,809],[8,'Galar / Hisui',810,905],[9,'Paldea',906,1025]
  ];
  const TYPES=['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
  const norm=v=>String(v||'').trim().toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
  const slug=v=>norm(v).replace(/\s+/g,'-')||'unknown';
  function sourceOf(card){if(card?.source==='tcgp')return 'tcgp';if(card?.source==='tcg')return 'tcg';const id=String(card?.setId||card?.set?.id||'').replace(/^library:/i,'');return /^[AB]\d/i.test(id)?'tcgp':'tcg';}
  function cardSetId(card){return String(card?.setId||card?.set?.id||'').replace(/^library:/i,'');}
  function cardSetName(card){return String(card?.setName||card?.set?.name||card?.set||'Unknown set');}
  function descriptor(set,source){const rawId=source==='tcg'?(set?._libraryKey||set?.id||set?.name):(set?.id||set?.name);return {source,id:String(rawId||'').replace(/^library:/i,''),name:String(set?.name||set?.id||'Unknown set'),total:Number(set?.cardCount?.total||set?.total||0)};}
  function setProgress(cards,desc){
    const rows=Object.values(cards||{}).filter(c=>sourceOf(c)===desc.source).filter(c=>{
      const id=cardSetId(c),name=cardSetName(c);return (desc.id&&String(id)===String(desc.id))||norm(name)===norm(desc.name);
    });
    const total=Math.max(Number(desc.total||0),...rows.map(c=>Number(c?.setTotal||c?.set?.cardCount?.total||0)),0);
    const owned=new Set(rows.map(c=>String(c.id||c.localId||c.number||c.name))).size;
    return [owned,total||Math.max(1,owned+1)];
  }
  function buildSetAchievements(physicalSets,pocketSets,getCards){
    const out=[],seen=new Set();
    for(const [source,sets] of [['tcg',physicalSets||[]],['tcgp',pocketSets||[]]]){
      for(const set of sets){
        const d=descriptor(set,source);if(!d.id||!d.name||!d.total)continue;
        const key=`${source}:${d.id}`;if(seen.has(key))continue;seen.add(key);
        const id=`set_${source}_${slug(d.id)}`;
        out.push({id,icon:source==='tcgp'?'◈':'▣',name:`${d.name} Master`,desc:`Collect every card in ${d.name}.`,category:source,_v0341Set:true,reward:{coins:source==='tcgp'?350:450,dust:40,tickets:1},progress:()=>setProgress(getCards?.()||{},d),setDescriptor:d});
      }
    }
    return out;
  }
  function values(obj){return Object.values(obj||{});}
  function uniquePokemon(s,min=1,max=1025){return new Set(values(s?.pokemon).filter(p=>Number(p?.id)>=min&&Number(p?.id)<=max).map(p=>Number(p.id))).size;}
  function uniqueCards(s,source=null){return new Set(values(s?.cards).filter(c=>!source||sourceOf(c)===source).map(c=>String(c.id))).size;}
  function shinyCount(s){return Number(s?.stats?.shinies||values(s?.pokemon).filter(p=>p?.shiny).reduce((n,p)=>n+Number(p.count||1),0));}
  function maxCopies(map){return Math.max(0,...values(map).map(x=>Number(x?.count||0)));}
  function completedSetCount(s,source=null){
    const groups=new Map();
    for(const c of values(s?.cards).filter(c=>!source||sourceOf(c)===source)){
      const key=`${sourceOf(c)}:${cardSetId(c)||norm(cardSetName(c))}`,row=groups.get(key)||{ids:new Set(),total:0};row.ids.add(String(c.id));row.total=Math.max(row.total,Number(c.setTotal||c?.set?.cardCount?.total||0));groups.set(key,row);
    }
    return [...groups.values()].filter(r=>r.total>0&&r.ids.size>=r.total).length;
  }
  function regionalClears(s,id){return Number(s?.adventureRegional?.records?.[id]?.clears||0);}
  function totalRegionalClears(s){return Object.values(s?.adventureRegional?.records||{}).reduce((n,r)=>n+Number(r?.clears||0),0);}
  function dashGoldTypes(s){const records=s?.arcade?.dash?.leagueRecords||{};return Object.values(records).filter(byDifficulty=>Object.values(byDifficulty||{}).some(r=>r?.trophy==='gold')).length;}
  function dashTrophyTypes(s){const records=s?.arcade?.dash?.leagueRecords||{};return Object.values(records).filter(byDifficulty=>Object.values(byDifficulty||{}).some(r=>r?.trophy)).length;}
  function goldenrodEvents(s){return s?.arcade?.goldenrod?.events||{};}
  function goldenrodEvent(s,id){return goldenrodEvents(s)?.[id]||{};}
  function goldenrodDivisionMedals(s){return Object.values(goldenrodEvents(s)).flatMap(e=>Object.values(e?.divisionTrophies||{})).filter(Boolean);}
  function goldenrodTypeMedals(s){return Object.values(goldenrodEvents(s)).flatMap(e=>Object.values(e?.typeTrophies||{}).flatMap(by=>Object.values(by||{}))).filter(Boolean);}
  function goldenrodHasDivisionGold(s){return goldenrodDivisionMedals(s).includes('gold');}
  function goldenrodHasMasterGold(s,id){return goldenrodEvent(s,id)?.divisionTrophies?.master==='gold';}
  function museumCount(s){return values(s?.arcade?.museum?.exhibits).filter(x=>x?.discovered).length;}
  function museumMaxDuplicates(s){return Math.max(0,...values(s?.arcade?.museum?.exhibits).map(x=>Number(x?.foundCount||0)));}
  function def(id,icon,name,desc,category,reward,progress,extra={}){return {id,icon,name,desc,category,reward,progress,...extra};}
  function nonNeg(v){const n=Number(v);return Number.isFinite(n)&&n>=0?n:0;}
  function buildCoreAchievements(getState){
    const s=()=>getState?.()||{};const out=[];
    const push=(...a)=>out.push(def(...a));

    // Pokémon collection & battle history.
    push('catch_1','●','First Partner','Catch your first Pokémon.','pokemon',{coins:150},()=>[Number(s().stats?.catches||0),1]);
    for(const [n,reward] of [[10,250],[50,500],[100,800],[250,1200],[500,1800],[750,2400],[1025,4000]])push(`dex_unique_${n}`,'◆',`${n} Species`, `Own ${n} different Pokémon species.`,'pokemon',{coins:reward,dust:Math.max(20,Math.round(reward/20))},()=>[uniquePokemon(s()),n]);
    for(const [n,reward] of [[10,400],[25,700],[50,1200]])push(`shiny_${n}`,'✨',`${n} Shinies`,`Catch ${n} shiny Pokémon.`,'pokemon',{coins:reward,fragment:n>=25?1:0},()=>[shinyCount(s()),n]);
    for(const [gen,name,min,max] of GEN_RANGES)push(`dex_gen_${gen}`,'◉',`${name} Pokédex`, `Own every species in the ${name} Pokédex range.`,'pokemon',{coins:1800+gen*150,dust:100,tickets:1},()=>[uniquePokemon(s(),min,max),max-min+1]);
    for(const [n,reward] of [[100,300],[500,800],[1000,1500]])push(`encounters_${n}`,'◎',`Seen It All ${n}`,`Record ${n} wild encounters.`,'pokemon',{coins:reward},()=>[Number(s().stats?.encounters||0),n]);
    for(const [n,reward] of [[25,400],[100,900],[500,2000]])push(`battles_${n}`,'⚔',`${n} Victories`,`Win ${n} Pokémon battles.`,'pokemon',{coins:reward,dust:n>=100?50:0},()=>[Number(s().stats?.battlesWon||0),n]);
    push('pokemon_copy_10','◆','A Very Familiar Face','Own 10 copies of the same Pokémon.','pokemon',{coins:500},()=>[maxCopies(s().pokemon),10],{hidden:true});

    // Card collection & pack opening.
    for(const [n,reward] of [[1,100],[10,250],[50,700],[250,1600],[500,2600],[1000,5000]])push(`packs_${n}`,'▣',`${n} Packs Opened`,`Open ${n} booster packs.`,'collection',{coins:reward,dust:n>=50?50:0,tickets:n>=250?2:0},()=>[Number(s().stats?.packs||0),n]);
    for(const [n,reward] of [[100,250],[500,700],[1000,1200],[5000,3000],[10000,5000]])push(`cards_pulled_${n}`,'▤',`${n} Cards Pulled`,`Pull ${n} cards from boosters.`,'collection',{coins:reward,dust:Math.min(250,Math.round(n/20))},()=>[Number(s().stats?.cardsPulled||0),n]);
    for(const [n,reward] of [[50,300],[100,500],[250,900],[500,1500],[1000,3000],[2000,5000]])push(`cards_unique_${n}`,'◇',`${n} Unique Cards`,`Own ${n} unique cards across your binders.`,'collection',{coins:reward,dust:Math.min(300,Math.round(n/5))},()=>[uniqueCards(s()),n]);
    push('tcg_unique_500_gyarados_half_deck','▣','Gyarados Half Deck','Own 500 unique physical TCG cards.','tcg',{fixedProduct:'TK4G',fixedProductName:'HS Trainer Kit—Gyarados'},()=>[uniqueCards(s(),'tcg'),500]);
    push('tcg_unique_1000_raichu_half_deck','▣','Raichu Half Deck','Own 1,000 unique physical TCG cards.','tcg',{fixedProduct:'TK4R',fixedProductName:'HS Trainer Kit—Raichu'},()=>[uniqueCards(s(),'tcg'),1000]);
    for(const [n,reward] of [[1,600],[5,1200],[10,2200],[25,4000],[50,7000]])push(`sets_complete_${n}`,'★',n===1?'Set Complete!':`${n} Complete Sets`,`Complete ${n} card ${n===1?'set':'sets'}.`,'collection',{coins:reward,dust:n*20,tickets:n>=5?Math.min(5,Math.ceil(n/10)):1},()=>[completedSetCount(s()),n]);
    push('sets_tcg_10','▣','Physical Binder Veteran','Complete 10 physical TCG sets.','tcg',{coins:2500,dust:250,tickets:3},()=>[completedSetCount(s(),'tcg'),10]);
    push('sets_tcgp_5','◈','Pocket Collector','Complete 5 TCG Pocket sets.','tcgp',{coins:1800,dust:180,tickets:2},()=>[completedSetCount(s(),'tcgp'),5]);
    for(const [n,reward] of [[1,1000],[2,1800],[5,4000],[10,7500]])push(`god_pack_${n}`,'✦',n===1?'Arceus Smiled Upon Me':`${n} God Packs`,`Find ${n} God Pack${n===1?'':'s'}.`,'tcgp',{coins:reward,dust:n*100,tickets:Math.min(5,n)},()=>[Number(s().stats?.godPacks||0),n]);
    for(const [n,reward] of [[5,700],[10,1400],[25,3000]])push(`gold_cards_${n}`,'♛',`${n} Crown / Gold Pulls`,`Pull ${n} Crown or Gold rarity cards from TCG Pocket.`,'tcgp',{coins:reward,dust:n*20,tickets:n>=10?1:0},()=>[Number(s().stats?.goldCards||0),n]);
    for(const [n,reward] of [[10,400],[25,900],[50,1800]])push(`rare_hits_${n}`,'✧',`${n} Rare Hits`,`Record ${n} rare card pulls.`,'collection',{coins:reward,dust:n*4},()=>[Number(s().rareHits?.length||0),n]);
    push('card_copy_25','▤','Print Run','Own 25 copies of one card.','collection',{coins:600,dust:75},()=>[maxCopies(s().cards),25],{hidden:true});
    push('card_copy_50','▤','Warehouse Stock','Own 50 copies of one card.','collection',{coins:1200,dust:150},()=>[maxCopies(s().cards),50],{hidden:true});

    // Regional Adventure.
    push('regional_clear_1','♛','Regional Champion','Complete your first Regional Adventure.','adventure',{coins:1200,dust:75,tickets:1},()=>[totalRegionalClears(s()),1]);
    push('regional_kanto','🔴','Kanto Champion','Defeat Kanto’s Champion.','adventure',{coins:1800,dust:100,tickets:2},()=>[regionalClears(s(),'kanto'),1]);
    push('regional_johto','🟡','Johto Champion','Defeat Johto’s Champion.','adventure',{coins:1800,dust:100,tickets:2},()=>[regionalClears(s(),'johto'),1]);
    push('regional_hoenn','🟢','Hoenn Champion','Defeat Hoenn’s Champion.','adventure',{coins:2000,dust:125,tickets:2},()=>[regionalClears(s(),'hoenn'),1]);
    for(const [n,reward] of [[3,1500],[10,3500],[25,7000]])push(`regional_clears_${n}`,'♜',`${n} Regional Clears`,`Complete ${n} Regional Adventure runs.`,'adventure',{coins:reward,dust:n*15,tickets:Math.min(4,Math.ceil(n/5))},()=>[totalRegionalClears(s()),n]);
    push('legacy_adventure_10','🗺','Seasoned Explorer','Complete 10 Adventure runs across any supported mode.','adventure',{coins:1800,dust:100,tickets:2},()=>[Number(s().stats?.adventureClears||0),10]);

    // Arcade-wide and individual minigames.
    for(const [n,reward] of [[10,250],[50,700],[100,1200],[500,3500]])push(`arcade_games_${n}`,'✦',`${n} Arcade Runs`,`Finish ${n} Arcade games.`,'arcade',{coins:reward,tickets:n>=100?1:0},()=>[Number(s().stats?.arcadeGames||0),n]);
    for(const [n,reward] of [[1000,300],[50000,2500],[100000,5000]])push(`arcade_coins_${n}`,'◉',`${n.toLocaleString()} Arcade Coins`,`Earn ${n.toLocaleString()} Lucky Coins from Arcade games.`,'arcade',{coins:reward,tickets:n>=50000?2:0},()=>[Number(s().stats?.arcadeCoins||0),n]);
    for(const [n,reward] of [[5,300],[10,600],[25,1200]])push(`berry_perfect_${n}`,'🍓',`${n} Perfect Blends`,`Hit ${n} perfect Berry Blender rounds.`,'arcade',{coins:reward,dust:n*2},()=>[Number(s().stats?.perfectBerryRounds||0),n]);
    for(const [n,reward] of [[10,500],[25,1200],[50,2500]])push(`quiz_endless_${n}`,'?',`${n} Silhouettes`,`Reach an Endless Who’s That Pokémon? streak of ${n}.`,'arcade',{coins:reward,tickets:n>=25?1:0},()=>[Number(s().arcade?.bestQuizEndless||0),n]);
    push('unown_perfect_5','🔤','Unown Linguist','Decode five perfect Unown runs.','arcade',{coins:1500,tickets:2},()=>[Number(s().arcade?.unownPerfect||0),5]);
    push('safari_50','◆','Safari Veteran','Catch 50 Pokémon across Safari runs.','arcade',{coins:1600,dust:75},()=>[Number(s().arcade?.safariCaught||0),50]);
    for(const [n,reward] of [[1,150],[10,450],[50,1300],[100,2600]])push(`dash_races_${n}`,'➤',`${n} Dash Races`,`Finish ${n} Pokémon Dash races.`,'arcade',{coins:reward,dust:n>=50?50:0},()=>[Number(s().arcade?.dash?.races||0),n]);
    for(const [n,reward] of [[1,300],[10,900],[50,2500]])push(`dash_wins_${n}`,'🏁',n===1?'First Across the Line':`${n} Dash Wins`,`Win ${n} Pokémon Dash races.`,'arcade',{coins:reward,tickets:n>=50?2:n>=10?1:0},()=>[Number(s().arcade?.dash?.wins||0),n]);
    push('dash_podium_25','◆','Podium Regular','Finish on the Pokémon Dash podium 25 times.','arcade',{coins:1000,dust:50},()=>[Number(s().arcade?.dash?.podiums||0),25]);
    push('dash_trophy_5','🏆','League Contender','Earn a trophy in 5 different Type Leagues.','arcade',{coins:1000,tickets:1},()=>[dashTrophyTypes(s()),5]);
    push('dash_gold_1','🥇','Type League Champion','Earn your first Gold Type League trophy.','arcade',{coins:900,dust:50,tickets:1},()=>[dashGoldTypes(s()),1]);
    push('dash_gold_5','🥇','Five-Type Champion','Earn Gold trophies in 5 different Type Leagues.','arcade',{coins:1800,dust:100,tickets:2},()=>[dashGoldTypes(s()),5]);
    push('dash_all_types_gold','🏆','Master of All Types','Earn a Gold trophy in all 18 Type Leagues.','arcade',{coins:6000,dust:500,tickets:5},()=>[dashGoldTypes(s()),18]);

    // Goldenrod Challenge Course tournament progression.
    push('goldenrod_first_podium','🏅','First Goldenrod Podium','Finish in the top three of a Goldenrod Cup.','arcade',{coins:350,dust:20},()=>[goldenrodDivisionMedals(s()).length+goldenrodTypeMedals(s()).length>0?1:0,1]);
    push('goldenrod_division_champion','🥇','Division Champion','Win a Goldenrod Division Cup.','arcade',{coins:700,dust:40},()=>[goldenrodHasDivisionGold(s())?1:0,1]);
    push('goldenrod_master_champion','🏆','Master Champion','Win a Master Division Cup in any Goldenrod event.','arcade',{coins:1500,dust:100,tickets:1},()=>[['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition'].some(id=>goldenrodHasMasterGold(s(),id))?1:0,1]);
    push('goldenrod_type_specialist','◆','Type Specialist','Win a Goldenrod Type Cup.','arcade',{coins:900,dust:60},()=>[goldenrodTypeMedals(s()).includes('gold')?1:0,1]);
    push('goldenrod_speed_master','➤','Speed Master','Win the Pokémon Dash Master Division Cup.','arcade',{coins:1800,dust:100,tickets:1},()=>[goldenrodHasMasterGold(s(),'dash')?1:0,1]);
    push('goldenrod_power_master','💥','Power Master','Win the Power Trial Master Division Cup.','arcade',{coins:1800,dust:100,tickets:1},()=>[goldenrodHasMasterGold(s(),'powerTrial')?1:0,1]);
    push('goldenrod_iron_wall_master','🛡','Iron Wall Master','Win the Impact Trial Master Division Cup.','arcade',{coins:1800,dust:100,tickets:1},()=>[goldenrodHasMasterGold(s(),'impactTrial')?1:0,1]);
    push('goldenrod_target_master','🎯','Range Master','Win the Target Range Master Division Cup.','arcade',{coins:1800,dust:100,tickets:1},()=>[goldenrodHasMasterGold(s(),'targetRange')?1:0,1]);
    push('goldenrod_elemental_master','☄','Elemental Master','Win the Elemental Gauntlet Master Division Cup.','arcade',{coins:1800,dust:100,tickets:1},()=>[goldenrodHasMasterGold(s(),'elementalGauntlet')?1:0,1]);
    push('goldenrod_endurance_master','♥','Endurance Master','Win the Endurance Expedition Master Division Cup.','arcade',{coins:1800,dust:100,tickets:1},()=>[goldenrodHasMasterGold(s(),'enduranceExpedition')?1:0,1]);
    push('goldenrod_grand_champion','♛','Goldenrod Grand Champion','Win Master Division Cups in Pokémon Dash, Power Trial, Impact Trial and Target Range.','arcade',{coins:4500,dust:300,tickets:3},()=>[['dash','powerTrial','impactTrial','targetRange'].filter(id=>goldenrodHasMasterGold(s(),id)).length,4]);

    // Power Trial — caught-Pokémon Attack challenge.
    push('power_trial_first','💥','First Impact','Complete your first Power Trial.','arcade',{coins:180},()=>[Number(s().arcade?.powerTrial?.gamesPlayed||0),1]);
    push('power_trial_10','💥','Power Regular','Complete 10 Power Trials.','arcade',{coins:650,dust:30},()=>[Number(s().arcade?.powerTrial?.gamesPlayed||0),10]);
    push('power_trial_full_clear','◆','Five for Five','Clear all five Power Trial targets in one run.','arcade',{coins:700,dust:40},()=>[Number(s().arcade?.powerTrial?.fullClears||0),1]);
    push('power_trial_hard_clear','🏆','Heavy Hitter','Clear all five Power Trial targets on Hard.','arcade',{coins:1200,dust:75,tickets:1},()=>[Number(s().arcade?.powerTrial?.hardClears||0),1]);
    push('power_trial_precision','◎','Perfect Form','Land three perfect charge-and-impact strikes in one Power Trial.','arcade',{coins:850,dust:50},()=>[Number(s().arcade?.powerTrial?.bestPerfects||0),3]);
    push('power_trial_mastery','★','Maximum Output','Score 500 or more in a single Power Trial.','arcade',{coins:1400,dust:100},()=>[Number(s().arcade?.powerTrial?.bestScore||0),500]);
    push('power_trial_golden','✦','Golden Breaker','Clear a rare Golden Target in Power Trial.','arcade',{coins:1000,dust:75,tickets:1},()=>[Number(s().arcade?.powerTrial?.goldenTargetsCleared||0),1],{hidden:true});

    // Impact Trial — caught-Pokémon Defense challenge.
    push('impact_trial_first','🛡','First Stand','Complete your first Impact Trial.','arcade',{coins:180},()=>[Number(s().arcade?.impactTrial?.gamesPlayed||0),1]);
    push('impact_trial_10','🛡','Dome Defender','Complete 10 Impact Trials.','arcade',{coins:650,dust:30},()=>[Number(s().arcade?.impactTrial?.gamesPlayed||0),10]);
    push('impact_trial_full_clear','◆','Still Standing','Survive all five Impact Trial hazards.','arcade',{coins:700,dust:40},()=>[Number(s().arcade?.impactTrial?.fullClears||0),1]);
    push('impact_trial_hard_clear','🏆','Iron Wall','Survive all five hazards on Hard.','arcade',{coins:1200,dust:75,tickets:1},()=>[Number(s().arcade?.impactTrial?.hardClears||0),1]);
    push('impact_trial_perfect','◎','Impenetrable Form','Land three perfect Hardens in one Impact Trial.','arcade',{coins:850,dust:50},()=>[Number(s().arcade?.impactTrial?.bestPerfects||0),3]);
    push('impact_trial_mastery','★','Fortress','Score 650 or more in a single Impact Trial.','arcade',{coins:1400,dust:100},()=>[Number(s().arcade?.impactTrial?.bestScore||0),650]);
    push('impact_trial_golden','✦','Golden Guard','Clear a rare Golden Hazard in Impact Trial.','arcade',{coins:1000,dust:75,tickets:1},()=>[Number(s().arcade?.impactTrial?.goldenHazardsCleared||0),1],{hidden:true});

    // Target Range — caught-Pokémon Special Attack challenge.
    push('target_range_first','🎯','First Shot','Complete your first Target Range.','arcade',{coins:180},()=>[Number(s().arcade?.targetRange?.gamesPlayed||0),1]);
    push('target_range_bullseye','◎','Dead Centre','Land your first Target Range bullseye.','arcade',{coins:300,dust:15},()=>[Number(s().arcade?.targetRange?.totalBullseyes||0),1]);
    push('target_range_streak','✦','Dialled In','Land three bullseyes in a row in Target Range.','arcade',{coins:750,dust:40},()=>[Number(s().arcade?.targetRange?.bestBullseyeStreak||0),3]);
    push('target_range_longshot','↗','Long Shot','Land a bullseye from 40 metres or farther.','arcade',{coins:900,dust:50},()=>[Number(s().arcade?.targetRange?.longestBullseyeM||0),40]);
    push('target_range_golden','★','Golden Eye','Bullseye a rare Golden Target.','arcade',{coins:1000,dust:75,tickets:1},()=>[Number(s().arcade?.targetRange?.goldenTargetsWon||0),1],{hidden:true});

    // Elemental Gauntlet — caught-Pokémon Special Defense challenge.
    push('elemental_gauntlet_first','☄','Into the Storm','Complete your first Elemental Gauntlet.','arcade',{coins:180},()=>[Number(s().arcade?.elementalGauntlet?.gamesPlayed||0),1]);
    push('elemental_gauntlet_10','☄','Storm Veteran','Complete 10 Elemental Gauntlets.','arcade',{coins:650,dust:30},()=>[Number(s().arcade?.elementalGauntlet?.gamesPlayed||0),10]);
    push('elemental_gauntlet_full_clear','◆','Five Elements Standing','Survive all five Elemental Gauntlet waves.','arcade',{coins:700,dust:40},()=>[Number(s().arcade?.elementalGauntlet?.fullClears||0),1]);
    push('elemental_gauntlet_hard_clear','🏆','Specialist Survivor','Clear Elemental Gauntlet on Hard.','arcade',{coins:1200,dust:75,tickets:1},()=>[Number(s().arcade?.elementalGauntlet?.hardClears||0),1]);
    push('elemental_gauntlet_flawless','◎','Untouchable','Clear all five waves without being hit.','arcade',{coins:1600,dust:100,tickets:1},()=>[Number(s().arcade?.elementalGauntlet?.noDamageClears||0),1]);
    push('elemental_gauntlet_prismatic','✦','Prismatic Survivor','Survive a rare Prismatic Storm.','arcade',{coins:1200,dust:90,tickets:1},()=>[Number(s().arcade?.elementalGauntlet?.prismaticStormsCleared||0),1],{hidden:true});

    // Endurance Expedition — caught-Pokémon HP challenge.
    push('endurance_expedition_clear','♥','Trailblazer','Clear all five zones of Endurance Expedition.','arcade',{coins:700,dust:40},()=>[Number(s().arcade?.enduranceExpedition?.fullClears||0),1]);
    push('endurance_expedition_10','♥','Long-Haul Regular','Complete 10 Endurance Expeditions.','arcade',{coins:650,dust:30},()=>[Number(s().arcade?.enduranceExpedition?.gamesPlayed||0),10]);
    push('endurance_expedition_hard','🏆','Against the Elements','Clear Endurance Expedition on Hard.','arcade',{coins:1200,dust:75,tickets:1},()=>[Number(s().arcade?.enduranceExpedition?.hardClears||0),1]);
    push('endurance_expedition_flawless','◎','Untiring','Clear all five zones without taking a hit.','arcade',{coins:1600,dust:100,tickets:1},()=>[Number(s().arcade?.enduranceExpedition?.flawlessClears||0),1]);
    push('endurance_expedition_low_hp','◆','Heart Over Health','Clear Hard with a Pokémon whose base HP is 50 or lower.','arcade',{coins:1500,dust:100,tickets:1},()=>[Number(s().arcade?.enduranceExpedition?.lowHpHardClears||0),1]);
    push('endurance_expedition_cache','✦','Trail Treasure','Collect a rare Golden Trail Cache.','arcade',{coins:1200,dust:90,tickets:1},()=>[Number(s().arcade?.enduranceExpedition?.goldenCachesCollected||0),1],{hidden:true});

    // Mauville Roulette — faithful Gen III Game Corner table.
    push('roulette_first_win','◉','First Spin Winner','Win your first Mauville Roulette bet.','arcade',{coins:250},()=>[nonNeg(s().arcade?.roulette?.wins),1]);
    push('roulette_exact_win','◎','Dead-On','Win an exact-slot Roulette bet.','arcade',{coins:500,dust:25},()=>[nonNeg(s().arcade?.roulette?.exactWins),1]);
    push('roulette_10_wins','◉','Wheel Regular','Win 10 Mauville Roulette bets.','arcade',{coins:900,dust:50},()=>[nonNeg(s().arcade?.roulette?.wins),10]);
    push('roulette_full_table','◆','Six Ball Cycle','Complete a full six-ball Roulette table.','arcade',{coins:400},()=>[nonNeg(s().arcade?.roulette?.tablesCompleted),1]);
    push('roulette_all_bets','♣','Cover the Board','Win with an exact slot, a Pokémon bet and a colour bet.','arcade',{coins:1000,dust:60,tickets:1},()=>{const b=s().arcade?.roulette?.betKindsWon||{};return [['slot','pokemon','color'].filter(k=>nonNeg(b[k])>0).length,3];});
    push('roulette_big_payout','★','High Roller','Win at least 900 Lucky Coins from one Roulette spin.','arcade',{coins:1200,dust:75},()=>[nonNeg(s().arcade?.roulette?.bestPayout)>=900?1:0,1]);
    push('roulette_service_day','✦','Pokémon News Special','Play a spin on the rare Roulette Service Day table.','arcade',{coins:850,dust:50},()=>[nonNeg(s().arcade?.roulette?.serviceDaySpins),1],{hidden:true});
    push('roulette_rescue','?','Stuck Ball Saved','See Shroomish or Taillow rescue a stuck Roulette ball.','arcade',{coins:1000,dust:75,tickets:1},()=>[nonNeg(s().arcade?.roulette?.rescueEvents),1],{hidden:true});
    push('roulette_golden_ball','★','Golden Ball','Land the rare Golden Ball in Mauville Roulette.','arcade',{coins:1250,dust:75,tickets:1},()=>[nonNeg(s().arcade?.roulette?.goldenBalls),1],{hidden:true});

    // Mauville Slot Machine.
    push('slot_first_win','▥','Three Reels','Win your first Mauville Slot Machine spin.','arcade',{coins:250},()=>[nonNeg(s().arcade?.slotMachine?.wins),1]);
    push('slot_spins_50','▥','Machine Regular','Play 50 Mauville Slot Machine spins.','arcade',{coins:750,dust:40},()=>[nonNeg(s().arcade?.slotMachine?.spins),50]);
    push('slot_mixed_sevens','7','Seven Shuffle','Hit a mixed Red/Blue 7 line.','arcade',{coins:1000,dust:60},()=>[nonNeg(s().arcade?.slotMachine?.mixedSevens),1]);
    push('slot_first_jackpot','★','Mauville Jackpot','Hit three matching Red 7s or Blue 7s.','arcade',{coins:2500,dust:150,tickets:2},()=>[nonNeg(s().arcade?.slotMachine?.jackpots),1]);
    push('slot_replay','↻','Again!','Land a Replay line on the Mauville Slot Machine.','arcade',{coins:450},()=>[nonNeg(s().arcade?.slotMachine?.replays),1]);
    push('slot_power_16','⚡','Fully Charged','Fill Pika Power to 16.','arcade',{coins:900,dust:50},()=>[nonNeg(s().arcade?.slotMachine?.maxPower),16]);
    push('slot_reel_time','?','Reel Time!','Enter rare Reel Time on the Mauville Slot Machine.','arcade',{coins:1250,dust:75,tickets:1},()=>[nonNeg(s().arcade?.slotMachine?.reelTimes),1],{hidden:true});


    // Ekans' Hoop Hurl.
    push('ekans_first_ring','◉','First Ring','Land your first Hoop Hurl target.','arcade',{coins:150},()=>[Number(s().arcade?.ekansHoop?.totalHoops||0),1]);
    push('ekans_hoops_25','◉','Snake Charmer','Land 25 Hoop Hurl targets across your career.','arcade',{coins:350,dust:20},()=>[Number(s().arcade?.ekansHoop?.totalHoops||0),25]);
    push('ekans_hoops_100','◉','Hoop Veteran','Land 100 Hoop Hurl targets across your career.','arcade',{coins:900,dust:50},()=>[Number(s().arcade?.ekansHoop?.totalHoops||0),100]);
    push('ekans_streak_12','↗','On a Roll','Reach a 12-hit Hoop Hurl streak.','arcade',{coins:600,tickets:1},()=>[Number(s().arcade?.ekansHoop?.bestStreak||0),12]);
    push('ekans_score_80','◎','Master Hooper','Score 80 or more in a single Hoop Hurl round.','arcade',{coins:1000,dust:75},()=>[Number(s().arcade?.ekansHoop?.bestScore||0),80]);
    push('ekans_shiny_1','✨','Shiny Ringer','Hit your first shiny target in Hoop Hurl.','arcade',{coins:750,dust:50},()=>[Number(s().arcade?.ekansHoop?.shinyHits||0),1],{hidden:true});
    push('ekans_shiny_5','✨','Shiny Sharpshooter','Hit five shiny targets in Hoop Hurl.','arcade',{coins:2000,tickets:1},()=>[Number(s().arcade?.ekansHoop?.shinyHits||0),5],{hidden:true});

    // Dig! Dig! Dig!.
    push('dig_first_win','⛏','Down We Go','Win your first Dig! Dig! Dig! race.','arcade',{coins:200},()=>[Number(s().arcade?.digDigDig?.wins||0),1]);
    push('dig_wins_10','⛏','Tunnel Vision','Win 10 Dig! Dig! Dig! races.','arcade',{coins:800,dust:40},()=>[Number(s().arcade?.digDigDig?.wins||0),10]);
    push('dig_hard_win','◆','Hard Ground','Win Dig! Dig! Dig! on Hard.','arcade',{coins:600,dust:30},()=>[Number(s().arcade?.digDigDig?.winsByDifficulty?.hard||0),1]);
    push('dig_time_12000','↯','Rapid Excavator','Finish Dig! Dig! Dig! in 12 seconds or less.','arcade',{coins:900,dust:60},()=>{const t=Number(s().arcade?.digDigDig?.bestTimeMs);return [t>0?Math.max(0,24000-t):0,12000];});
    push('dig_games_25','⛏','Excavation Crew','Finish 25 Dig! Dig! Dig! races.','arcade',{coins:600,dust:30},()=>[Number(s().arcade?.digDigDig?.gamesPlayed||0),25]);
    push('dig_all_difficulties','◆','Three Layers Down','Win Dig! Dig! Dig! on Easy, Normal and Hard.','arcade',{coins:1000,tickets:1},()=>{const w=s().arcade?.digDigDig?.winsByDifficulty||{};return [['easy','normal','hard'].filter(k=>Number(w[k]||0)>0).length,3];});
    push('dig_time_7500','↯','Mole Machine','Finish Dig! Dig! Dig! in 7.50 seconds or less.','arcade',{coins:1500,dust:100},()=>{const t=Number(s().arcade?.digDigDig?.bestTimeMs);return [t>0&&t<=7500?1:0,1];},{hidden:true});

    // Magikarp's Splash.
    push('magikarp_first_win','◈','Making a Splash','Win your first Magikarp’s Splash round.','arcade',{coins:200},()=>[Number(s().arcade?.magikarpSplash?.wins||0),1]);
    push('magikarp_hard_win','◆','Hard Splash','Win Magikarp’s Splash on Hard.','arcade',{coins:600,dust:30},()=>[Number(s().arcade?.magikarpSplash?.winsByDifficulty?.hard||0),1]);
    push('magikarp_score_25','↥','High Jumper','Score 25 or more in one Magikarp’s Splash round.','arcade',{coins:900,dust:60},()=>[Number(s().arcade?.magikarpSplash?.bestScore||0),25]);
    push('magikarp_quick_10','↯','Perfect Rhythm','Chain 10 Quick Splashes in Magikarp’s Splash.','arcade',{coins:700,dust:40},()=>[Number(s().arcade?.magikarpSplash?.bestQuickChain||0),10]);
    push('magikarp_wins_10','◈','Splash Veteran','Win 10 Magikarp’s Splash rounds.','arcade',{coins:800,dust:40},()=>[Number(s().arcade?.magikarpSplash?.wins||0),10]);
    push('magikarp_all_difficulties','◆','Master of the Pond','Win Magikarp’s Splash on Easy, Normal and Hard.','arcade',{coins:1000,tickets:1},()=>{const w=s().arcade?.magikarpSplash?.winsByDifficulty||{};return [['easy','normal','hard'].filter(k=>Number(w[k]||0)>0).length,3];});
    push('magikarp_score_30','↥','Thirty Splash Salute','Score 30 or more in one Magikarp’s Splash round.','arcade',{coins:1500,dust:100},()=>[Number(s().arcade?.magikarpSplash?.bestScore||0)>=30?1:0,1],{hidden:true});

    // Rock Harden.
    push('rock_harden_first_win','▰','Rock Solid','Win your first Rock Harden round.','arcade',{coins:300,dust:20},()=>[nonNeg(s().arcade?.rockHarden?.wins),1]);
    push('rock_harden_games_25','▰','Quarry Regular','Finish 25 Rock Harden rounds.','arcade',{coins:600,dust:30},()=>[nonNeg(s().arcade?.rockHarden?.gamesPlayed),25]);
    push('rock_harden_hard_win','◆','Hard as Steel','Win Rock Harden on Hard.','arcade',{coins:600,dust:30},()=>[nonNeg(s().arcade?.rockHarden?.winsByDifficulty?.hard),1]);
    push('rock_harden_all_difficulties','◆','Three Times Hardened','Win Rock Harden on Easy, Normal and Hard.','arcade',{coins:1000,tickets:1},()=>{const w=s().arcade?.rockHarden?.winsByDifficulty||{};return [['easy','normal','hard'].filter(k=>nonNeg(w[k])>0).length,3];});
    push('rock_harden_perfect_10','✦','Perfect Form','Land 10 Perfect Hardens in one Rock Harden round.','arcade',{coins:900,dust:60},()=>[nonNeg(s().arcade?.rockHarden?.bestPerfects),10]);
    push('rock_harden_hp_50','▣','Still Standing','Win Rock Harden with at least 50 HP remaining.','arcade',{coins:800,dust:50},()=>[nonNeg(s().arcade?.rockHarden?.bestHpRemaining),50]);

    // Thundering Dynamo.
    push('dynamo_first_win','⚡','Power On!','Win your first Thundering Dynamo race.','arcade',{coins:300},()=>[nonNeg(s().arcade?.thunderingDynamo?.wins),1]);
    push('dynamo_hard_win','⚡','High Voltage','Win Thundering Dynamo on Hard.','arcade',{coins:650,dust:30},()=>[nonNeg(s().arcade?.thunderingDynamo?.winsByDifficulty?.hard),1]);
    push('dynamo_all_difficulties','◆','Full Circuit','Win Thundering Dynamo on Easy, Normal and Hard.','arcade',{coins:1000,tickets:1},()=>{const w=s().arcade?.thunderingDynamo?.winsByDifficulty||{};return [['easy','normal','hard'].filter(k=>nonNeg(w[k])>0).length,3];});
    push('dynamo_perfect_accuracy','✦','Clean Current','Finish a Thundering Dynamo race with 100% accuracy.','arcade',{coins:800,dust:50},()=>[nonNeg(s().arcade?.thunderingDynamo?.bestAccuracy),100]);
    push('dynamo_correct_500','⚡','Human Dynamo','Land 500 correct Thundering Dynamo presses across your career.','arcade',{coins:900,dust:50},()=>[nonNeg(s().arcade?.thunderingDynamo?.totalCorrect),500]);

    // Snore War.
    push('snore_first_win','☾','Wide Awake','Win your first Snore War match.','arcade',{coins:300},()=>[nonNeg(s().arcade?.snoreWar?.wins),1]);
    push('snore_hard_win','☾','No Snoozing','Win Snore War on Hard.','arcade',{coins:650,dust:30},()=>[nonNeg(s().arcade?.snoreWar?.winsByDifficulty?.hard),1]);
    push('snore_all_difficulties','◆','Sleep Specialist','Win Snore War on Easy, Normal and Hard.','arcade',{coins:1000,tickets:1},()=>{const w=s().arcade?.snoreWar?.winsByDifficulty||{};return [['easy','normal','hard'].filter(k=>nonNeg(w[k])>0).length,3];});
    push('snore_streak_50','☾','Eyes Wide Open','Reach a 50-hit Snore War streak.','arcade',{coins:800,dust:50},()=>[Math.max(nonNeg(s().arcade?.snoreWar?.bestStreak),nonNeg(s().arcade?.snoreWar?.bestEndlessStreak)),50]);
    push('snore_endless_100','∞','Hypnosis Marathon','Reach 100 hits in Snore War Endless.','arcade',{coins:1200,dust:75,tickets:1},()=>[nonNeg(s().arcade?.snoreWar?.bestEndlessHits),100]);
    push('secret_snore_endless_200','?','Insomniac','Reach 200 hits in Snore War Endless.','arcade',{coins:2500,dust:150,tickets:2},()=>[nonNeg(s().arcade?.snoreWar?.bestEndlessHits),200],{hidden:true});
    push('secret_snore_endless_500','?','Sleep Is For The Weak','Reach 500 hits in Snore War Endless.','arcade',{coins:5000,dust:300,tickets:3},()=>[nonNeg(s().arcade?.snoreWar?.bestEndlessHits),500],{hidden:true});

    push('rattata_first_win','🐀','Off to the Races','Win your first Run, Rattata, Run race.','arcade',{coins:300},()=>[nonNeg(s().arcade?.runRattataRun?.wins),1]);
    push('rattata_hard_win','🐀','Gutsy Rattata','Win Run, Rattata, Run on Hard.','arcade',{coins:650,dust:30},()=>[nonNeg(s().arcade?.runRattataRun?.winsByDifficulty?.hard),1]);
    push('rattata_all_difficulties','◆','Track Star','Win Run, Rattata, Run on Easy, Normal and Hard.','arcade',{coins:1000,tickets:1},()=>{const w=s().arcade?.runRattataRun?.winsByDifficulty||{};return [['easy','normal','hard'].filter(k=>nonNeg(w[k])>0).length,3];});
    push('rattata_flawless_win','✦','Hurdle Hero','Win Run, Rattata, Run without hitting a hurdle.','arcade',{coins:800,dust:50},()=>[nonNeg(s().arcade?.runRattataRun?.flawlessWins),1]);
    push('rattata_fast_finish','⚡','Quick Feet','Finish Run, Rattata, Run in 10.00 seconds or less.','arcade',{coins:1200,dust:75},()=>{const best=Number(s().arcade?.runRattataRun?.bestTimeMs);return [best>0&&best<=10000?1:0,1];});

    // Sushi-Go-Round.
    push('sushi_first_win','🍣','Big Spender','Win your first Sushi-Go-Round round.','arcade',{coins:300},()=>[nonNeg(s().arcade?.sushiGoRound?.wins),1]);
    push('sushi_hard_win','🍣','Conveyor Connoisseur','Win Sushi-Go-Round on Hard.','arcade',{coins:650,dust:30},()=>[nonNeg(s().arcade?.sushiGoRound?.winsByDifficulty?.hard),1]);
    push('sushi_all_difficulties','◆','Sushi Master','Win Sushi-Go-Round on Easy, Normal and Hard.','arcade',{coins:1000,tickets:1},()=>{const w=s().arcade?.sushiGoRound?.winsByDifficulty||{};return [['easy','normal','hard'].filter(k=>nonNeg(w[k])>0).length,3];});
    push('sushi_combo_5','✦','Same Again!','Reach a x5 same-sushi chain in Sushi-Go-Round.','arcade',{coins:800,dust:50},()=>[nonNeg(s().arcade?.sushiGoRound?.bestCombo),5]);
    push('sushi_big_bill','¥','High Roller','Run up a Sushi-Go-Round bill of ¥15,000 or more.','arcade',{coins:1200,dust:75},()=>[nonNeg(s().arcade?.sushiGoRound?.bestBill)>=15000?1:0,1]);

    push('clearcut_first_win','🪵','Timber!','Complete your first Clear Cut Challenge.','arcade',{coins:300},()=>[nonNeg(s().arcade?.clearCutChallenge?.gamesPlayed)>0?1:0,1]);
    push('clearcut_hard_win','✂','Razor Sharp','Score 80 / 100 or better on Hard.','arcade',{coins:650,dust:30},()=>[nonNeg(s().arcade?.clearCutChallenge?.bestScores?.hard)>=80?1:0,1]);
    push('clearcut_all_difficulties','◆','Cut Above','Score 70 / 100 or better on Easy, Normal and Hard.','arcade',{coins:1000,tickets:1},()=>{const b=s().arcade?.clearCutChallenge?.bestScores||{};return [['easy','normal','hard'].filter(k=>nonNeg(b[k])>=70).length,3];});
    push('clearcut_perfect','✦','Dead Centre','Score a Perfect 20 cut in Clear Cut Challenge.','arcade',{coins:800,dust:50},()=>[nonNeg(s().arcade?.clearCutChallenge?.totalPerfects)>0?1:0,1]);
    push('secret_clearcut_100','?','Master Cutter','Score 100 / 100 in one Clear Cut Challenge match.','arcade',{coins:2500,dust:150,tickets:1},()=>[nonNeg(s().arcade?.clearCutChallenge?.bestScore)>=100?1:0,1],{hidden:true});

    push('gutsy_first_finish','♥','Cave Explorer','Reach the end of Gutsy Golbat for the first time.','arcade',{coins:300},()=>[nonNeg(s().arcade?.gutsyGolbat?.gamesPlayed),1]);
    push('gutsy_heart_40','♥','Heart Hoarder','Finish a Gutsy Golbat run with at least 40 hearts.','arcade',{coins:650,dust:30},()=>[nonNeg(s().arcade?.gutsyGolbat?.bestHearts),40]);
    push('gutsy_hard_win','◆','Cave Champion','Win Gutsy Golbat on Hard.','arcade',{coins:1000,tickets:1},()=>[nonNeg(s().arcade?.gutsyGolbat?.winsByDifficulty?.hard),1]);
    push('gutsy_clean_win','✦','Untouchable Wings','Win Gutsy Golbat without hitting a Magnemite.','arcade',{coins:900,dust:75},()=>[nonNeg(s().arcade?.gutsyGolbat?.cleanWins),1]);
    push('gutsy_golden_heart','★','Golden Heart','Collect the rare Golden Heart in Gutsy Golbat.','arcade',{coins:1200,dust:100},()=>[nonNeg(s().arcade?.gutsyGolbat?.goldenHeartsCollected),1]);

    push('furret_first_match','●','Into the Grass','Complete your first Furret’s Frolic match.','arcade',{coins:300},()=>[nonNeg(s().arcade?.furretFrolic?.gamesPlayed),1]);
    push('furret_high_score','◎','Ball Hog','Score 15 points in one Furret’s Frolic match.','arcade',{coins:700,dust:40},()=>[nonNeg(s().arcade?.furretFrolic?.bestScore),15]);
    push('furret_hard_win','◆','Frolic Champion','Win Furret’s Frolic on Hard.','arcade',{coins:1000,tickets:1},()=>[nonNeg(s().arcade?.furretFrolic?.winsByDifficulty?.hard),1]);
    push('furret_master_ball','Ⓜ','Master Bouncer','Score a Master Ball in Furret’s Frolic.','arcade',{coins:900,dust:75},()=>[nonNeg(s().arcade?.furretFrolic?.masterBalls),1]);

    push('topsy_first_match','🌀','Top Spinner','Complete your first Topsy-Turvy match.','arcade',{coins:300},()=>[nonNeg(s().arcade?.topsyTurvy?.gamesPlayed),1]);
    push('topsy_first_win','◎','Ring Leader','Win a Topsy-Turvy match.','arcade',{coins:700,dust:40},()=>[nonNeg(s().arcade?.topsyTurvy?.wins),1]);
    push('topsy_hard_win','◆','Spin Doctor','Win Topsy-Turvy on Hard.','arcade',{coins:1000,tickets:1},()=>[nonNeg(s().arcade?.topsyTurvy?.winsByDifficulty?.hard),1]);
    push('secret_topsy_shutout','?','Untouchable Top','Win Topsy-Turvy without being knocked out once.','arcade',{coins:1800,dust:120,tickets:1},()=>[nonNeg(s().arcade?.topsyTurvy?.shutoutWins),1],{hidden:true});

    push('barrier_first_match','▣','Mime Time','Complete your first Barrier Ball match.','arcade',{coins:300},()=>[nonNeg(s().arcade?.barrierBall?.gamesPlayed),1]);
    push('barrier_first_win','◎','Court Jester','Win a Barrier Ball match.','arcade',{coins:700,dust:40},()=>[nonNeg(s().arcade?.barrierBall?.wins),1]);
    push('barrier_hard_win','◆','Barrier Master','Win Barrier Ball on Hard.','arcade',{coins:1000,tickets:1},()=>[nonNeg(s().arcade?.barrierBall?.winsByDifficulty?.hard),1]);
    push('secret_barrier_clean_sheet','?','No Entry','Win Barrier Ball without conceding a goal.','arcade',{coins:1800,dust:120,tickets:1},()=>[nonNeg(s().arcade?.barrierBall?.cleanSheetWins),1],{hidden:true});

    // Dream World · Ice Cream Scoop.
    push('icecream_first_stack','🍦','First Scoop','Complete your first Ice Cream Scoop run.','arcade',{coins:300},()=>[nonNeg(s().arcade?.iceCreamScoop?.gamesPlayed),1]);
    push('icecream_height_7','🍨','Seven-Layer Sundae','Land 7 scoops in one Ice Cream Scoop run.','arcade',{coins:650,dust:30},()=>[nonNeg(s().arcade?.iceCreamScoop?.bestHeight),7]);
    push('icecream_perfect_chain_4','✦','Steady Hands','Land 4 Perfect scoops in a row.','arcade',{coins:900,dust:60},()=>[nonNeg(s().arcade?.iceCreamScoop?.bestPerfectStreak),4]);
    push('icecream_hard_10','◆','Dream World Regular','Build a 10-scoop tower on Hard.','arcade',{coins:1200,dust:75,tickets:1},()=>[nonNeg(s().arcade?.iceCreamScoop?.bestHeights?.hard),10]);
    push('secret_icecream_dream_scoop','?','Sweet Dreams','Successfully land the rare Dream Scoop.','arcade',{coins:1500,dust:100,tickets:1},()=>[nonNeg(s().arcade?.iceCreamScoop?.dreamScoopsLanded),1],{hidden:true});
    push('secret_icecream_20','?','Brain Freeze','Complete the full 20-scoop Dream World tower.','arcade',{coins:3000,dust:200,tickets:2},()=>[nonNeg(s().arcade?.iceCreamScoop?.bestHeight),20],{hidden:true});

    // Dream World · Wailord's Water Spout.
    push('wailord_first_clear','💦','Making a Splash','Clear Wailord’s Water Spout by opening at least 15 balls.','arcade',{coins:350},()=>[nonNeg(s().arcade?.wailordWaterSpout?.clears),1]);
    push('wailord_combo_10','◉','Colour Cascade','Reach a 10-hit combo in Wailord’s Water Spout.','arcade',{coins:700,dust:40},()=>[nonNeg(s().arcade?.wailordWaterSpout?.bestCombo),10]);
    push('wailord_hard_clear','◆','Spout Specialist','Clear Wailord’s Water Spout on Hard.','arcade',{coins:1100,dust:75,tickets:1},()=>[nonNeg(s().arcade?.wailordWaterSpout?.hardClears),1]);
    push('wailord_30_balls','◎','Balloon Barrage','Open 30 balls in one Wailord’s Water Spout run.','arcade',{coins:1500,dust:100,tickets:1},()=>[nonNeg(s().arcade?.wailordWaterSpout?.bestBalls),30]);
    push('secret_wailord_rainbow_ball','?','Over the Rainbow','Open the rare Rainbow Dream Ball.','arcade',{coins:1800,dust:120,tickets:1},()=>[nonNeg(s().arcade?.wailordWaterSpout?.rainbowBallsOpened),1],{hidden:true});
    push('secret_wailord_perfect_clear','?','Dry Feet','Clear Wailord’s Water Spout without a Pokémon falling in the water.','arcade',{coins:2600,dust:180,tickets:2},()=>[nonNeg(s().arcade?.wailordWaterSpout?.perfectClears),1],{hidden:true});

    // Dream World · Pokémon Seek.
    push('pokemonseek_first_find','🔎','Found You!','Find your first lost Pokémon in Pokémon Seek.','arcade',{coins:350},()=>[nonNeg(s().arcade?.pokemonSeek?.clears),1]);
    push('pokemonseek_lost_item','✦','Lost and Found','Recover a lost item during Pokémon Seek.','arcade',{coins:700,dust:40},()=>[nonNeg(s().arcade?.pokemonSeek?.lostItemsFound),1]);
    push('pokemonseek_fast_find','⏱','Dream Detective','Find the lost Pokémon with at least 60 seconds remaining.','arcade',{coins:950,dust:60},()=>[nonNeg(s().arcade?.pokemonSeek?.bestRemainingMs),60000]);
    push('pokemonseek_hard_clear','◆','Dream Explorer','Find the lost Pokémon on Hard.','arcade',{coins:1200,dust:75,tickets:1},()=>[nonNeg(s().arcade?.pokemonSeek?.hardClears),1]);
    push('secret_pokemonseek_dream_sparkle','?','Sparkling Discovery','Find the rare Dream Sparkle in Pokémon Seek.','arcade',{coins:1800,dust:120,tickets:1},()=>[nonNeg(s().arcade?.pokemonSeek?.dreamSparklesFound),1],{hidden:true});
    push('secret_pokemonseek_clean_find','?','Perfect Search','Find the lost Pokémon without checking a wrong Pokémon.','arcade',{coins:2400,dust:160,tickets:2},()=>[nonNeg(s().arcade?.pokemonSeek?.cleanFinds),1],{hidden:true});
    push('pokemonseek_first_search','🔎','A Keen Eye','Find the lost Pokémon on your first search.','arcade',{coins:900,dust:60},()=>[nonNeg(s().arcade?.pokemonSeek?.firstSearchFinds),1]);
    push('pokemonseek_three_areas','🌈','Dream World Wanderer','Find a lost Pokémon in three different Dream World areas.','arcade',{coins:1400,dust:90,tickets:1},()=>[Object.values(s().arcade?.pokemonSeek?.areaClears||{}).filter(count=>Number(count)>0).length,3]);


    // Pokémon Picross.
    const picrossCompleted=()=>s().arcade?.picross?.completed||{};
    const picrossUnique=()=>Object.keys(picrossCompleted()).filter(key=>picrossCompleted()[key]).length;
    const picrossAreas=()=>{const areas=globalThis.LuckyDexPicrossData?.areas||[];const done=picrossCompleted();return areas.filter(area=>(area.slots||[]).length&&(area.slots||[]).every(slot=>done[slot.resource_id])).length;};
    push('picross_first_clear','▦','First Picture','Complete your first Pokémon Picross puzzle.','arcade',{coins:300},()=>[picrossUnique(),1]);
    push('picross_25','▦','Puzzle Apprentice','Complete 25 different Pokémon Picross puzzles.','arcade',{coins:700,dust:40},()=>[picrossUnique(),25]);
    push('picross_area_clear','◆','Area Complete','Complete every puzzle in a Pokémon Picross area.','arcade',{coins:900,dust:60,tickets:1},()=>[picrossAreas(),1]);
    push('picross_100','▦','Century of Squares','Complete 100 different Pokémon Picross puzzles.','arcade',{coins:1500,dust:100,tickets:1},()=>[picrossUnique(),100]);
    push('picross_errorless_25','✦','Perfect Pencil','Complete 25 different Pokémon Picross puzzles without a mistake.','arcade',{coins:1800,dust:120,tickets:1},()=>[nonNeg(s().arcade?.picross?.noMistakeClears),25]);
    push('picross_all_312','★','Picross Master','Complete all 312 standard Pokémon Picross stages.','arcade',{coins:6000,dust:500,tickets:5},()=>[picrossUnique(),312]);


    // Summer Beach House · Pikachu's Beach DX.
    push('pikachubeach_dx_first_clear','⚡','Super Surfer','Clear your first Pikachu’s Beach DX course.','arcade',{coins:500,dust:30},()=>[nonNeg(s().arcade?.pikachuBeach?.dx?.clears),1]);
    push('pikachubeach_dx_hard_clear','◆','DX Daredevil','Clear Pikachu’s Beach DX on Hard.','arcade',{coins:1400,dust:90,tickets:1},()=>[nonNeg(s().arcade?.pikachuBeach?.dx?.hardClears),1]);
    push('pikachubeach_dx_ring_hunter','◉','Ring Rider','Collect 50 rings across Pikachu’s Beach DX.','arcade',{coins:800,dust:50},()=>[nonNeg(s().arcade?.pikachuBeach?.dx?.totalRings),50]);
    push('pikachubeach_dx_combo','↻','Combo Current','Reach a 10-hit combo in Pikachu’s Beach DX.','arcade',{coins:1000,dust:60},()=>[nonNeg(s().arcade?.pikachuBeach?.dx?.bestCombo),10]);
    push('pikachubeach_dx_all_bosses','★','Storm Breaker','Defeat all five DX bosses across your runs.','arcade',{coins:2200,dust:150,tickets:2},()=>[Object.values(s().arcade?.pikachuBeach?.dx?.bossDefeats||{}).filter(v=>Number(v)>0).length,5]);
    push('pikachubeach_dx_allies','♥','Surfing Squad','Befriend Seaking, Lapras and Natu in DX.','arcade',{coins:1400,dust:90,tickets:1},()=>[Object.values(s().arcade?.pikachuBeach?.dx?.alliesUsed||{}).filter(v=>Number(v)>0).length,3]);
    push('pikachubeach_dx_flawless','🌊','Untouchable DX','Clear a DX course without taking damage.','arcade',{coins:1700,dust:110,tickets:1},()=>[nonNeg(s().arcade?.pikachuBeach?.dx?.flawlessClears),1]);
    push('secret_pikachubeach_dx_lucky_wave','?','DX Golden Break','Land the rare Lucky Wave in DX.','arcade',{coins:2000,dust:140,tickets:1},()=>[nonNeg(s().arcade?.pikachuBeach?.dx?.luckyWavesLanded),1],{hidden:true});

    // Museum / excavation display progression.
    for(const [n,reward] of [[1,250],[5,600],[10,1200],[20,2500]])push(`museum_exhibits_${n}`,'🏛',n===1?'First Exhibit':`${n} Museum Exhibits`,`Discover ${n} different museum exhibits.`,'museum',{coins:reward,dust:n*5,tickets:n>=20?2:n>=10?1:0},()=>[museumCount(s()),n]);
    push('museum_repeat_10','⛏','Favourite Exhibit','Excavate the same museum item 10 times.','museum',{coins:700,dust:75},()=>[museumMaxDuplicates(s()),10],{hidden:true});

    // Secrets that can be derived from durable state, not one-frame events.
    push('secret_zubat_5','🦇','Bat Country','Encounter Zubat five times in a row.','pokemon',{coins:500},()=>[Number(s().stats?.maxZubatStreak||0),5],{hidden:true});
    push('secret_fails_25','◌','The Ball Said No','Fail 25 catches across your play history.','pokemon',{coins:500},()=>[Number(s().stats?.failedCatches||0),25],{hidden:true});
    push('secret_loaded_4','✹','Stacked Deck','Pull four or more high-rarity cards from one pack.','collection',{coins:1200,dust:100,tickets:1},()=>[Number(s().stats?.maxBigHitsInPack||0),4],{hidden:true});
    push('secret_quiz_75','?','Professor’s Nightmare','Reach a 75-answer Endless silhouette streak.','arcade',{coins:3000,tickets:3},()=>[Number(s().arcade?.bestQuizEndless||0),75],{hidden:true});
    push('secret_dash_100_wins','➤','Blink and You Missed It','Win 100 Pokémon Dash races.','arcade',{coins:4000,dust:250,tickets:3},()=>[Number(s().arcade?.dash?.wins||0),100],{hidden:true});

    return out;
  }


  function runtimeCatalogue(){
    if(Array.isArray(root.ACHIEVEMENTS))return root.ACHIEVEMENTS;
    try{if(typeof ACHIEVEMENTS!=='undefined'&&Array.isArray(ACHIEVEMENTS))return ACHIEVEMENTS;}catch(_){}
    return [];
  }
  function progressFor(a){
    try{
      const fn=root.achievementProgress||(typeof achievementProgress==='function'?achievementProgress:null);
      if(fn)return fn(a);
      if(typeof a?.progress==='function'){
        const [value,target]=a.progress();
        return {value:Number(value||0),target:Math.max(1,Number(target||1)),complete:Number(value||0)>=Number(target||1),claimed:false};
      }
    }catch(_){}
    return {value:0,target:1,complete:false,claimed:false};
  }
  function snapshotCompletedArcadeIds(){
    try{return runtimeCatalogue().filter(a=>a?.category==='arcade'&&progressFor(a).complete).map(a=>String(a.id||'')).filter(Boolean);}catch(_){return [];}
  }
  function describeAchievementIds(ids){
    try{
      const wanted=new Set((Array.isArray(ids)?ids:[]).map(String));
      return runtimeCatalogue().filter(a=>wanted.has(String(a?.id||''))).map(a=>({id:String(a.id||''),name:String(a.name||'').slice(0,120),icon:String(a.icon||'').slice(0,40),desc:String(a.desc||'').slice(0,120),hidden:!!a.hidden}));
    }catch(_){return [];}
  }

  function install(){
    if(typeof document==='undefined'||typeof ACHIEVEMENTS==='undefined'||typeof state==='undefined')return false;
    const categoryById={first_shiny:'pokemon',ghost10:'pokemon',kanto_all:'pokemon',celestial_storm:'tcg',gold_card:'tcgp',haunted_visit:'adventure',haunted_clear:'adventure',packs25:'collection',packs100:'collection',arcade10k:'arcade',five_shiny:'pokemon',zubat3:'pokemon',fails3:'pokemon',loaded_pack:'collection',quiz_endless_20:'arcade',ball_drop_jackpot:'arcade',unown_perfect:'arcade',safari_ten:'arcade'};
    let category='all';
    const baseRewardText=rewardText;
    rewardText=function(r={}){const base=baseRewardText(r),dust=Number(r?.dust||0),fixed=String(r?.fixedProductName||'').trim(),sleeveId=String(r?.sleeve||'').trim(),sleeve=root.LuckyDexCosmeticsV0413?.registry?.[sleeveId];const extra=`✦ ${fmt(dust)} Dust`;let out=dust?(base?`${base} · ${extra}`:extra):base;if(fixed)out=out?`${out} · ${fixed}`:fixed;if(sleeveId&&sleeve)out=out?`${out} · Sleeve · ${sleeve.realName||sleeve.name}`:`Sleeve · ${sleeve.realName||sleeve.name}`;return out;};
    const fixedRewardClaims=new Set();
    claimAchievement=async function(id){
      const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a)return;const p=achievementProgress(a);if(!p.complete||p.claimed||fixedRewardClaims.has(id))return;
      if(a.reward?.fixedProduct){
        const grant=root.LuckyDexPackFlow?.grantFixedProductReward;if(typeof grant!=='function'){showToast('Half Deck reward is still loading. Try again in a moment.');return;}
        fixedRewardClaims.add(id);
        try{await grant(a.reward.fixedProduct);}catch(error){console.warn('[LuckyDex] fixed achievement reward failed',error);showToast('Could not grant that Half Deck yet. Please try again.');return;}finally{fixedRewardClaims.delete(id);}
      }
      state.profile.achievementClaims.push(id);state.profile.coins+=Number(a.reward?.coins||0);state.profile.tickets+=Number(a.reward?.tickets||0);state.profile.dust+=Number(a.reward?.dust||0);state.profile.shinyCharmFragments+=Number(a.reward?.fragment||0);if(a.reward?.card)queueAchievementCardRewardV0246(a.reward.card);if(a.reward?.sleeve)root.LuckyDexCosmeticsV0413?.unlockSleeve?.(state,a.reward.sleeve,`achievement:${a.id}:sleeve:${a.reward.sleeve}`);if(a.hidden)root.LuckyDexCosmeticsV0413?.discoverSecret?.(state,a.id);addTrainerXp(100+Number(a.reward?.fragment||0)*100);save();vibrate([20,25,60]);showToast(`${a.name} complete · ${rewardText(a.reward)}`,2800);renderAchievements();renderProfile();if(a.reward?.card)await fulfilPendingAchievementRewardsV0246();
    };
    function annotateExisting(){for(const a of ACHIEVEMENTS){if(!a.category)a.category=categoryById[a.id]||(a.hidden?'collection':'collection');}}
    function addCore(){const existing=new Set(ACHIEVEMENTS.map(a=>a.id));for(const a of buildCoreAchievements(()=>state)){if(!existing.has(a.id)){ACHIEVEMENTS.push(a);existing.add(a.id);}}}
    function addV0413(){const build=root.LuckyDexAchievementExpansionV0413?.build;if(typeof build!=='function')return;const existing=new Set(ACHIEVEMENTS.map(a=>a.id));for(const a of build(()=>state)){if(!existing.has(a.id)){ACHIEVEMENTS.push(a);existing.add(a.id);}}}
    function bindSleeves(){for(const sleeve of root.LuckyDexCosmeticsV0413?.catalogue||[]){const id=sleeve?.sourceAchievementId;if(!id)continue;const a=ACHIEVEMENTS.find(x=>x.id===id);if(a){a.reward=a.reward||{};if(!a.reward.sleeve)a.reward.sleeve=sleeve.id;}}}
    function physicalSets(){try{return [...(setCache?.tcg||[])];}catch(_){return [];}}
    function pocketSets(){try{return [...(root.LuckyDexPocket?.BUILTIN_SETS||[])];}catch(_){return [];}}
    function syncSets(){
      for(let i=ACHIEVEMENTS.length-1;i>=0;i--)if(ACHIEVEMENTS[i]?._v0341Set)ACHIEVEMENTS.splice(i,1);
      const generated=buildSetAchievements(physicalSets(),pocketSets(),()=>state.cards||{});
      for(const a of generated){if(a.category==='tcg'&&norm(a.setDescriptor?.name)==='celestial storm'&&ACHIEVEMENTS.some(x=>x.id==='celestial_storm'))continue;ACHIEVEMENTS.push(a);}
    }
    function sync(){annotateExisting();addCore();addV0413();syncSets();bindSleeves();annotateExisting();const rec=root.LuckyDexCosmeticsV0413?.reconcile?.(state,ACHIEVEMENTS);if(rec&&(rec.unlockedSleeves.length||rec.discoveredSecrets.length||rec.claimTokens.length))save();}
    function render(){
      sync();const list=document.getElementById('achievementList');if(!list)return;
      const rows=ACHIEVEMENTS.map(a=>({a,p:achievementProgress(a)})),earned=rows.filter(x=>x.p.complete).length,pill=document.getElementById('achievementCountPill'),summary=document.getElementById('achievementSummaryText');if(pill)pill.textContent=`${earned}/${ACHIEVEMENTS.length} earned`;if(summary)summary.textContent=`${earned} / ${ACHIEVEMENTS.length} earned`;
      let shown=rows.filter(({a,p})=>challengeTab==='complete'?p.complete&&!a.hidden:challengeTab==='hidden'?a.hidden:(!a.hidden&&!p.claimed));
      if(category!=='all')shown=shown.filter(({a})=>a.category===category);
      if(challengeTab==='active')shown.sort((x,y)=>Number(y.p.complete)-Number(x.p.complete)||(y.p.value/y.p.target)-(x.p.value/x.p.target)||String(x.a.name).localeCompare(String(y.a.name)));
      else shown.sort((x,y)=>String(x.a.category).localeCompare(String(y.a.category))||String(x.a.name).localeCompare(String(y.a.name)));
      list.innerHTML=shown.length?shown.map(({a,p})=>{const secret=a.hidden&&!p.complete,pct=clamp(p.value/p.target*100,0,100),cat=CATEGORIES[a.category]||a.category||'Collection';return `<div class="achievement-row ${p.complete?'complete':''} ${p.claimed?'claimed':''} ${secret?'secret-card':''}"><div class="achievement-icon">${secret?'?':a.icon}</div><div><b>${secret?'Secret achievement':escapeHtml(a.name)}</b><span>${secret?'Keep exploring Lucky Dex to uncover this.':escapeHtml(a.desc)}</span>${!secret?`<span class="achievement-category">${escapeHtml(cat)}</span><div class="progress-track"><i style="width:${pct}%"></i></div><small>${Math.min(p.value,p.target)} / ${p.target}</small>`:''}</div><div>${!secret?`<span class="achievement-reward">${rewardText(a.reward)}</span>`:''}${p.complete&&!p.claimed?`<button class="primary" data-claim-achievement="${a.id}">CLAIM</button>`:p.claimed?'<span class="achievement-reward">✓ CLAIMED</span>':''}</div></div>`;}).join(''):'<div class="empty compact-empty">Nothing in this category yet.</div>';
      list.querySelectorAll('[data-claim-achievement]').forEach(b=>b.onclick=()=>claimAchievement(b.dataset.claimAchievement));
    }
    renderAchievements=render;
    const select=document.getElementById('achievementCategoryFilter');if(select){select.value='all';select.addEventListener('change',()=>{category=select.value||'all';renderAchievements();});}
    sync();
    const recognition=root.LuckyDexCosmeticsV0413?.consumeRecognitionSummary?.();if(recognition&&(recognition.sleeves.length||recognition.achievements.length)){const sleeveCount=recognition.sleeves.length,achievementCount=recognition.achievements.length;showToast(`Previous accomplishments recognised · ${sleeveCount} sleeve${sleeveCount===1?'':'s'} unlocked · ${achievementCount} achievement${achievementCount===1?'':'s'}`,3600);}
    return true;
  }

  return {CATEGORIES,GEN_RANGES,TYPES,sourceOf,setProgress,buildSetAchievements,buildCoreAchievements,snapshotCompletedArcadeIds,describeAchievementIds,install};
});
