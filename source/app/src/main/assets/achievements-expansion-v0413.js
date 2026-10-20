(function(root,factory){
  const tele=(typeof module==='object'&&module.exports)?require('./achievement-telemetry-v0413.js'):root.LuckyDexAchievementTelemetryV0413;
  const api=factory(tele);
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  root.LuckyDexAchievementExpansionV0413=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(telemetry){
  'use strict';
  const values=o=>Object.values(o||{}),num=v=>Math.max(0,Number(v)||0),norm=v=>String(v||'').toLowerCase();
  const def=(id,icon,name,desc,category,reward,progress,extra={})=>({id,icon,name,desc,category,reward,progress,...extra,_v0413:true});
  function sourceOf(card){if(card?.source==='tcgp')return'tcgp';if(card?.source==='tcg')return'tcg';return /^[AB]\d/i.test(String(card?.setId||card?.set?.id||''))?'tcgp':'tcg';}
  function completedSetCount(s,source){
    const groups=new Map();
    for(const c of values(s?.cards).filter(c=>!source||sourceOf(c)===source)){
      const key=`${sourceOf(c)}:${c?.setId||c?.set?.id||c?.setName||c?.set?.name||'unknown'}`,r=groups.get(key)||{ids:new Set(),total:0};
      r.ids.add(String(c?.id||c?.localId||c?.name||''));r.total=Math.max(r.total,num(c?.setTotal||c?.set?.cardCount?.total));groups.set(key,r);
    }
    return [...groups.values()].filter(r=>r.total>0&&r.ids.size>=r.total).length;
  }
  function distinctLocations(s){
    const names=new Set(Object.entries(s?.stats?.visitedLocations||{}).filter(([,v])=>!!v).map(([k])=>k));
    for(const j of Object.values(s?.adventureRegional?.journeys||{}))for(const n of j?.completedLocations||[])names.add(String(n));
    return names.size;
  }
  function sealedCount(s){return values(s?.sealedPacks).reduce((n,r)=>n+num(r?.count),0);}
  function typesOwned(s){const set=new Set();for(const p of values(s?.pokemon))for(const t of p?.types||[])set.add(norm(t));return set.size;}
  function gensOwned(s,shinyOnly=false){const set=new Set();for(const p of values(s?.pokemon)){if(shinyOnly&&!p?.shiny)continue;let g=num(p?.generation);if(!g){const id=num(p?.id);g=id<=151?1:id<=251?2:id<=386?3:id<=493?4:id<=649?5:id<=721?6:id<=809?7:id<=905?8:9;}if(g)set.add(g);}return set.size;}
  function regionalClear(s,id){return num(s?.adventureRegional?.records?.[id]?.clears);}
  function arcadeSampler(s){return Object.values(s?.arcade?.records?.games||{}).filter(r=>Array.isArray(r?.recent)&&r.recent.length>0).length;}
  function speciesCount(s,id){return values(s?.pokemon).filter(p=>Number(p?.id)===Number(id)).reduce((n,p)=>n+Math.max(1,num(p?.count)||1),0);}
  function ownsSpecies(s,id){return speciesCount(s,id)>0;}
  function maxCardCopies(s){return Math.max(0,...values(s?.cards).map(c=>num(c?.count)));}
  function eventCount(s,id){return telemetry?.count?.(s,id)||0;}
  function build(getState){
    const s=()=>getState?.()||{}; const out=[]; const push=(...a)=>out.push(def(...a));
    push('v0413_trade_1','⇄','First Link','Complete 1 trade.','collection',{coins:250},()=>[num(s().stats?.trades),1]);
    push('v0413_trade_10','⇄','Link Regular','Complete 10 trades.','collection',{coins:700,sleeve:'link-cable'},()=>[num(s().stats?.trades),10]);
    push('v0413_trade_50','⇄','Trade Network','Complete 50 trades.','collection',{coins:1800,dust:100},()=>[num(s().stats?.trades),50]);
    push('v0413_balls_100','●','Pitcher','Throw 100 Poké Balls.','pokemon',{coins:400},()=>[num(s().stats?.ballsThrown),100]);
    push('v0413_balls_500','●','Veteran Thrower','Throw 500 Poké Balls.','pokemon',{coins:1200,dust:50},()=>[num(s().stats?.ballsThrown),500]);
    push('v0413_locations_10','⌖','Road Trip','Visit 10 distinct Adventure locations.','adventure',{coins:500},()=>[distinctLocations(s()),10]);
    push('v0413_locations_25','⌖','Cartographer','Visit 25 distinct Adventure locations.','adventure',{coins:1250,tickets:1},()=>[distinctLocations(s()),25]);
    push('v0413_sealed_1','▣','Sealed Deal','Own at least 1 unopened sealed booster at once.','collection',{coins:300},()=>[sealedCount(s()),1]);
    push('v0413_sealed_5','▣','Booster Vault','Own at least 5 sealed boosters at once.','collection',{coins:800,sleeve:'sealed-vault'},()=>[sealedCount(s()),5]);
    push('v0413_retreats_10','↶','Back From the Past','Record 10 expedition or past returns.','adventure',{coins:700},()=>[num(s().stats?.expeditionRetreats),10],{legacyHidden:true});

    push('v0413_types_all_18','◆','Type Collector','Own Pokémon collectively representing all 18 types.','pokemon',{coins:1200,sleeve:'type-wheel'},()=>[typesOwned(s()),18]);
    push('v0413_gens_all_9','◉','Across the Eras','Own at least one Pokémon from every generation 1–9.','pokemon',{coins:1500,sleeve:'eras'},()=>[gensOwned(s()),9]);
    push('v0413_shiny_gens_3','✨','Shiny Tourist','Own a shiny Pokémon from 3 different generations.','pokemon',{coins:1000,sleeve:'shiny-tour'},()=>[gensOwned(s(),true),3]);
    push('v0413_dual_set_complete','▣','Two Formats, One Binder','Complete a physical TCG set and a TCG Pocket set.','collection',{coins:1500,sleeve:'dual-binder'},()=>[(completedSetCount(s(),'tcg')>0?1:0)+(completedSetCount(s(),'tcgp')>0?1:0),2]);
    push('v0413_regional_trio','♛','Original Circuit','Clear Kanto, Johto and Hoenn Regional Adventures.','adventure',{coins:2000,tickets:2},()=>[['kanto','johto','hoenn'].filter(id=>regionalClear(s(),id)>0).length,3]);
    push('v0413_arcade_sampler_8','✦','Game Corner Passport','Record completed runs in 8 Arcade games.','arcade',{coins:1000,sleeve:'arcade-pass'},()=>[arcadeSampler(s()),8]);
    push('v0413_one_hp_win','♥','By a Thread','Win an Adventure battle with the active Pokémon on exactly 1 HP.','adventure',{coins:750},()=>[eventCount(s(),'battle:one-hp-win'),1],{_v0413TelemetryOnly:true});
    push('v0413_first_throw','●','First Ball Wonder','Catch a Pokémon with the first ball thrown in that fight.','adventure',{coins:500,sleeve:'first-ball'},()=>[eventCount(s(),'catch:first-throw'),1],{_v0413TelemetryOnly:true});
    push('v0413_voltorb_gift_clear','🎁','Gift Secured','Reveal a Voltorb mini-gift and clear that board.','arcade',{coins:750,dust:50},()=>[eventCount(s(),'voltorb:gift-cleared'),1],{_v0413TelemetryOnly:true});
    push('v0413_charm_active','✨','Charmed Life','Have at least 3 Shiny Charm fragments.','pokemon',{coins:900},()=>[num(s().profile?.shinyCharmFragments),3]);

    push('v0413_secret_kanto_starters','?','Oak Would Be Proud','Own Bulbasaur, Charmander and Squirtle.','pokemon',{coins:600,sleeve:'oak-trio'},()=>[[1,4,7].filter(id=>ownsSpecies(s(),id)).length,3],{hidden:true});
    push('v0413_secret_eevee_family','?','Evolutionary Overachiever','Own Eevee and all eight Eeveelutions.','pokemon',{coins:1500,sleeve:'eevee-spectrum'},()=>[[133,134,135,136,196,197,470,471,700].filter(id=>ownsSpecies(s(),id)).length,9],{hidden:true});
    push('v0413_secret_magikarp_6','?','School of Splash','Own 6 copies of Magikarp.','pokemon',{coins:500,sleeve:'splash-school'},()=>[speciesCount(s(),129),6],{hidden:true});
    push('v0413_secret_zubat_10','?','Cave Echo','Reach a max consecutive Zubat streak of 10.','pokemon',{coins:700},()=>[num(s().stats?.maxZubatStreak),10],{hidden:true});
    push('v0413_secret_failed_100','?','Maybe Try a Master Ball?','Record 100 failed catches.','pokemon',{coins:800},()=>[num(s().stats?.failedCatches),100],{hidden:true});
    push('v0413_secret_big_hits_5','?','This Pack Is Ridiculous','Reach 5 high-rarity hits in one pack.','collection',{coins:1500,tickets:1},()=>[num(s().stats?.maxBigHitsInPack),5],{hidden:true});
    push('v0413_secret_card_copy_100','?','Print Factory','Own 100 copies of one card.','collection',{coins:1000,dust:150},()=>[maxCardCopies(s()),100],{hidden:true});
    push('v0413_secret_voltorb_gift_lost','?','Should Have Cashed Out','Reveal a Voltorb mini-gift and then lose that board.','arcade',{coins:500,sleeve:'voltorb-lost'},()=>[eventCount(s(),'voltorb:gift-lost'),1],{hidden:true,_v0413TelemetryOnly:true});
    push('v0413_secret_golden_berry_perfect','?','Golden Recipe','Deliver a Golden Berry and finish that Berry Picker run with zero misses.','arcade',{coins:1000,sleeve:'golden-recipe'},()=>[eventCount(s(),'berry:golden-perfect'),1],{hidden:true,_v0413TelemetryOnly:true});
    push('v0413_secret_god_pack_no_new','?','Already Got ’Em','Open a God Pack where every card was already owned.','tcgp',{coins:1200,sleeve:'already-got-em'},()=>[eventCount(s(),'pack:god-no-new'),1],{hidden:true,_v0413TelemetryOnly:true});
    return out;
  }
  return {build,completedSetCount,distinctLocations,sealedCount,typesOwned,gensOwned};
});
