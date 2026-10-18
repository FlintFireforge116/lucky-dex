'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

// Collection regression: leaving Sealed Packs must restore the set/filter controls.
const collection=require('../app/src/main/assets/collection-browser-v0280.js');
assert.equal(typeof collection.restoreCardControls,'function','collection browser should expose the control-restore helper');
const filter={hidden:true},group={hidden:true};
collection.restoreCardControls({filter,group});
assert.equal(filter.hidden,false,'Card Binder must unhide its filter after Sealed Packs hid it');
assert.equal(group.hidden,false,'Card Binder must unhide its set selector after Sealed Packs hid it');

// Arcade regression: nine venue stops must fit into two rows instead of clipping a third row.
const arcadeCss=read('app/src/main/assets/arcade.css');
assert.match(arcadeCss,/\.world-stops\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/s,'9 Arcade venues should use five columns so Dash is visible in row two');

// Achievement expansion is kept in a dedicated, data-driven module.
const achPath=path.join(root,'app/src/main/assets/achievements-v0341.js');
assert.ok(fs.existsSync(achPath),'v0.34.1 achievement module should exist');
const ach=require(achPath);
assert.equal(typeof ach.buildCoreAchievements,'function');
assert.equal(typeof ach.buildSetAchievements,'function');
assert.equal(typeof ach.setProgress,'function');

const cards={
  a:{id:'base1-1',source:'tcg',setId:'base1',setName:'Base Set',setTotal:2,count:1},
  b:{id:'base1-2',source:'tcg',setId:'base1',setName:'Base Set',setTotal:2,count:3},
  c:{id:'A1-001',source:'tcgp',setId:'A1',setName:'Genetic Apex',setTotal:3,count:1}
};
assert.deepEqual(ach.setProgress(cards,{source:'tcg',id:'base1',name:'Base Set',total:2}),[2,2]);
assert.deepEqual(ach.setProgress(cards,{source:'tcgp',id:'A1',name:'Genetic Apex',total:3}),[1,3]);

const physical=Array.from({length:120},(_,i)=>({id:`tcg-${i}`,name:`TCG Set ${i}`,cardCount:{total:100+i}}));
const pocket=Array.from({length:22},(_,i)=>({id:`P${i}`,name:`Pocket Set ${i}`,cardCount:{total:80+i}}));
const setDefs=ach.buildSetAchievements(physical,pocket,()=>cards);
assert.equal(setDefs.length,142,'every supplied TCG and TCGP set should receive an achievement');
assert.equal(new Set(setDefs.map(x=>x.id)).size,setDefs.length,'generated set achievement ids must be unique');
assert.ok(setDefs.every(x=>['tcg','tcgp'].includes(x.category)),'set achievements should carry TCG/TCGP categories');

const core=ach.buildCoreAchievements(()=>({
  stats:{packs:0,cardsPulled:0,shinies:0,catches:0,encounters:0,battlesWon:0,arcadeGames:0,arcadeCoins:0,adventureClears:0,godPacks:0,goldCards:0,perfectBerryRounds:0,failedCatches:0,maxZubatStreak:0,maxBigHitsInPack:0},
  pokemon:{},cards:{},rareHits:[],profile:{dust:0},
  arcade:{bestQuizEndless:0,ballDropJackpots:0,unownPerfect:0,safariCaught:0,bestBallDrop:0,fossilsFound:0,museum:{exhibits:{}},dash:{races:0,wins:0,podiums:0,leagueRecords:{}}},
  adventureRegional:{records:{}}
}));
assert.ok(core.length>=55,`expected at least 55 authored achievements, got ${core.length}`);
assert.ok(new Set(core.map(x=>x.id)).size===core.length,'authored achievement ids must be unique');
assert.ok(core.some(x=>x.id==='god_pack_1'),'first God Pack achievement should exist');
assert.ok(core.some(x=>x.id==='dash_all_types_gold'),'all-Type-League gold achievement should exist');
assert.ok(core.some(x=>x.category==='museum'),'Museum achievements should exist');
assert.ok(core.some(x=>x.hidden),'there should be authored secret achievements');

const html=read('app/src/main/assets/index.html');
assert.match(html,/id="achievementCategoryFilter"/,'Profile should expose an achievement category filter');
assert.match(html,/achievements-v0341\.js/,'new achievement module should be loaded');

const achievementSource=read('app/src/main/assets/achievements-v0341.js');
assert.match(achievementSource,/state\.profile\.dust\s*\+=\s*Number\(a\.reward\?\.dust\|\|0\)/,'achievement claims should support Dust rewards');
assert.match(achievementSource,/const extra=`✦ \${fmt\(dust\)} Dust`/,'achievement reward labels should show Dust');


// Browser install must see the Pocket catalogue through its UMD root and register set achievements.
{
  const vm=require('node:vm');
  const source=read('app/src/main/assets/achievements-v0341.js');
  const sandbox={console,document:{getElementById:()=>null},ACHIEVEMENTS:[],state:{stats:{},profile:{achievementClaims:[],coins:0,tickets:0,dust:0,shinyCharmFragments:0},cards:{},pokemon:{},rareHits:[],arcade:{museum:{exhibits:{}},dash:{leagueRecords:{}}},adventureRegional:{records:{}}},setCache:{tcg:[]},rewardText:()=>'',claimAchievement:async()=>{},achievementProgress:()=>({value:0,target:1,complete:false,claimed:false}),queueAchievementCardRewardV0246:()=>{},addTrainerXp:()=>{},save:()=>{},vibrate:()=>{},showToast:()=>{},renderAchievements:()=>{},renderProfile:()=>{},fulfilPendingAchievementRewardsV0246:async()=>{},fmt:n=>String(n),escapeHtml:s=>String(s),clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),challengeTab:'active',module:undefined};
  sandbox.window=sandbox;sandbox.globalThis=sandbox;sandbox.LuckyDexPocket={BUILTIN_SETS:[{id:'A1',name:'Genetic Apex',cardCount:{total:286}}]};
  vm.createContext(sandbox);vm.runInContext(source,sandbox);
  assert.ok(sandbox.ACHIEVEMENTS.some(x=>x.id==='set_tcgp_a1'),'browser install should register TCGP set achievements from LuckyDexPocket');
}

const gradle=read('app/build.gradle');
assert.ok(Number((gradle.match(/versionCode\s+(\d+)/)||[])[1])>=341,'versionCode must preserve v0.34.1 or later');
console.log('PASS v0.34.1 binder/Arcade regressions and data-driven achievement expansion');
