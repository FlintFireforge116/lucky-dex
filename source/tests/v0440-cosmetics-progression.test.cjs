'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assets=path.join(__dirname,'../app/src/main/assets');
const existing=require(path.join(assets,'cosmetics-catalog-v0413.js')).CATALOGUE.slice(0,30);
function fresh(rows=[]){
  const CATALOGUE=[...existing,...rows];
  const context={LuckyDexCosmeticsCatalogV0413:{CATALOGUE,BY_ID:Object.fromEntries(CATALOGUE.map(x=>[x.id,x]))}};
  vm.runInNewContext(fs.readFileSync(path.join(assets,'cosmetics-core-v0413.js'),'utf8'),context);
  return context.LuckyDexCosmeticsV0413;
}
const sleeve=(id,rewardGroup,extra={})=>({id,name:id,artPath:`cosmetics/sleeves/${id}.webp`,rewardGroup,...extra});
const plain=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));

test('progression-bound catalogue entries remain locked without saved evidence',()=>{
  const c=fresh([sleeve('new-kanto','region:kanto'),sleeve('unknown','invented:history')]);
  const state={};c.reconcile(state);
  assert.equal(c.isOwned(state,'new-kanto'),false);
  assert.equal(c.isOwned(state,'unknown'),false);
  assert.equal(c.equipSleeve(state,'new-kanto').reason,'locked');
});

test('a regional clear grants a thematic group once and retains a legacy equipped reward',()=>{
  const c=fresh([sleeve('red-team','region:kanto'),sleeve('blue-team','region:kanto')]);
  const state={profile:{coins:17,dust:19,achievementClaims:['regional_kanto']},adventureRegional:{records:{kanto:{clears:1}}},cosmetics:{unlockedSleeves:['kanto-red','oak-trio'],activeSleeve:'kanto-red',discoveredSecrets:['v0413_secret_kanto_starters'],claimedCosmeticRewards:['legacy:token']}};
  const first=c.reconcile(state);
  assert.deepEqual(plain(first.unlockedSleeves),['red-team','blue-team']);
  assert.equal(state.cosmetics.activeSleeve,'kanto-red');
  assert.equal(state.cosmetics.unlockedSleeves.includes('oak-trio'),true);
  assert.equal(state.cosmetics.claimedCosmeticRewards.includes('legacy:token'),true);
  assert.deepEqual(plain(state.profile),{coins:17,dust:19,achievementClaims:['regional_kanto']});
  assert.equal(first.claimTokens.length,2);
  assert.equal(new Set(state.cosmetics.claimedCosmeticRewards).size,state.cosmetics.claimedCosmeticRewards.length);
  assert.deepEqual(plain(c.consumeRecognitionSummary()),{sleeves:['red-team','blue-team'],achievements:[]});
  assert.deepEqual(plain(c.reconcile(state)),{unlockedSleeves:[],discoveredSecrets:[],claimTokens:[]});
  assert.equal(c.consumeRecognitionSummary(),null);
  assert.equal(c.equipSleeve(state,'red-team').ok,true);
});

test('Goldenrod Type Cup rewards use recorded golds including Impact Trial and legacy Dash',()=>{
  const rows=[sleeve('fire-cup','goldenrod:type:fire'),sleeve('water-cup','goldenrod:type:water'),sleeve('psychic-cup','goldenrod:type:psychic'),sleeve('champion','goldenrod:master-gold'),sleeve('guard','arcade:impact-clear')];
  const c=fresh(rows),state={arcade:{goldenrod:{events:{impactTrial:{divisionTrophies:{master:'gold'},typeTrophies:{fire:{ultra:'gold'},water:{rookie:'bronze'}}}}},impactTrial:{fullClears:1},dash:{leagueRecords:{psychic:{hard:{trophy:'gold'}}}}}};
  assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['fire-cup','psychic-cup','champion','guard']);
  assert.equal(c.isOwned(state,'water-cup'),false);
});

test('unrecorded achievements, unlocked cups, arbitrary trophies and region names never invent history',()=>{
  const c=fresh([sleeve('sinnoh','region:sinnoh'),sleeve('fire','goldenrod:type:fire'),sleeve('impact','arcade:impact-clear'),sleeve('podium','goldenrod:podium')]);
  const state={stats:{adventureClears:99,arcadeGames:999},adventureRegional:{records:{sinnoh:{clears:1}},journeys:{kanto:{badges:8}}},arcade:{goldenrod:{events:{impactTrial:{typeCupsUnlocked:true,divisionTrophies:{madeUp:'gold'},typeTrophies:{fire:{rookie:'winner',madeUp:'gold'}}},invented:{divisionTrophies:{master:'gold'}}}},impactTrial:{gamesPlayed:99,bestScore:9999}}};
  c.reconcile(state);for(const id of ['sinnoh','fire','impact','podium'])assert.equal(c.isOwned(state,id),false);
});

test('completed physical and Pocket sets require distinct known card identities and real totals',()=>{
  const c=fresh([sleeve('physical','tcg:sets:1'),sleeve('pocket','tcgp:sets:1')]);
  const state={cards:{a:{id:'A-1',setId:'A1',source:'tcgp',setTotal:2},b:{id:'A-1',setId:'A1',source:'tcgp',setTotal:2},c:{id:'X-1',setId:'X',source:'tcg',setTotal:2},d:{id:'X-2',setId:'X',source:'tcg',setTotal:2}}};
  assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['physical']);
  state.cards.b.id='A-2';assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['pocket']);
});

test('owned species and validated generation completion grant themed groups without counts inflating the dex',()=>{
  const c=fresh([sleeve('mewtwo','collection:species:150'),sleeve('kanto-complete','dex:1'),sleeve('fire-ten','type:fire'),sleeve('sparkle','shiny:25')]);
  const state={pokemon:{a:{id:150,count:1000,types:['psychic']}},stats:{shinies:24}};
  assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['mewtwo']);
  state.stats.shinies=25;state.pokemon=Object.fromEntries(Array.from({length:151},(_,i)=>[i,{id:i+1,types:i<10?['fire']:['normal']} ]));
  assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['kanto-complete','fire-ten','sparkle']);
});

test('grouped secrets stay private until the matching existing hidden condition is proven',()=>{
  const c=fresh([sleeve('starter-secret','collection:starters',{hidden:true,sourceAchievementId:'v0413_secret_kanto_starters'}),sleeve('unbound-secret','region:kanto',{hidden:true,sourceAchievementId:'unrecorded_secret'})]);
  const state={adventureRegional:{records:{kanto:{clears:1}}},pokemon:{a:{id:1},b:{id:4}}};
  c.reconcile(state);assert.equal(c.isOwned(state,'starter-secret'),false);assert.equal(c.isOwned(state,'unbound-secret'),false);assert.deepEqual(plain(state.cosmetics.discoveredSecrets),[]);
  state.pokemon.c={id:7};
  assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['starter-secret']);
  assert.equal(c.isDiscovered(state,'v0413_secret_kanto_starters'),true);
});

test('an achievement claim remains durable group evidence after the live collection changes',()=>{
  const c=fresh([sleeve('eevee','collection:eevee-family',{hidden:true,sourceAchievementId:'v0413_secret_eevee_family'}),sleeve('region','region:johto')]);
  const state={profile:{achievementClaims:['v0413_secret_eevee_family','regional_johto']}};
  assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['eevee','region']);
  assert.equal(c.isDiscovered(state,'v0413_secret_eevee_family'),true);
});

test('malformed totals, non-finite counters and absent species cannot grant collection sleeves',()=>{
  const c=fresh([sleeve('packs','packs:50'),sleeve('dex','dex:1'),sleeve('set','tcg:sets:1')]);
  const state={stats:{packs:Infinity},pokemon:{bad:{id:0,generation:1,count:9999}},cards:{bad:{setId:'unknown',setTotal:1}}};
  c.reconcile(state);for(const id of ['packs','dex','set'])assert.equal(c.isOwned(state,id),false);
});

test('migration retains unknown cosmetics fields and all original owned IDs',()=>{
  const c=fresh();const legacyIds=existing.slice(0,30).map(x=>x.id);
  const state={cosmetics:{unlockedSleeves:legacyIds,activeSleeve:'already-got-em',sentinel:{nested:['keep',44]},futureVersion:9}};
  c.reconcile(state);
  assert.deepEqual(plain(state.cosmetics.sentinel),{nested:['keep',44]});
  assert.equal(state.cosmetics.futureVersion,9);
  assert.equal(state.cosmetics.activeSleeve,'already-got-em');
  for(const id of legacyIds)assert.equal(c.isOwned(state,id),true);
});

test('family rewards require every distinct member and shiny milestones use durable finite totals',()=>{
  const c=fresh([sleeve('family','collection:family:4-5-6'),sleeve('first-shiny','shiny:1'),sleeve('ten-shiny','shiny:10')]);
  const state={pokemon:{a:{id:4,count:99},b:{id:5},s:{id:25,shiny:true,count:1}}};
  assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['first-shiny']);
  state.pokemon.c={id:6};state.stats={shinies:10};
  assert.deepEqual(plain(c.reconcile(state).unlockedSleeves),['family','ten-shiny']);
});


test('malformed reward group suffixes cannot bypass the supported progression contract',()=>{
  const c=fresh([sleeve('bad-region','region:kanto:invented'),sleeve('bad-species','collection:species:150:invented'),sleeve('bad-shiny','shiny:10:10'),sleeve('bad-type','type:fire:invented')]);
  const state={adventureRegional:{records:{kanto:{clears:1}}},pokemon:Object.fromEntries(Array.from({length:10},(_,i)=>[i,{id:i===0?150:i,types:['fire']} ])),stats:{shinies:25}};
  c.reconcile(state);for(const id of ['bad-region','bad-species','bad-shiny','bad-type'])assert.equal(c.isOwned(state,id),false);
});

test('boolean and array counters are not recorded victories, shiny totals, or species IDs',()=>{
  const c=fresh([sleeve('clear','region:kanto'),sleeve('impact','arcade:impact-clear'),sleeve('shiny','shiny:1'),sleeve('species','collection:species:1')]);
  const state={adventureRegional:{records:{kanto:{clears:true}}},arcade:{impactTrial:{fullClears:[1]}},stats:{shinies:true},pokemon:{invalid:{id:true}}};
  c.reconcile(state);for(const id of ['clear','impact','shiny','species'])assert.equal(c.isOwned(state,id),false);
});
