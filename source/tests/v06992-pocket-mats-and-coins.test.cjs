'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const mats=require(path.join(A,'cosmetics-playmats-v06958.js'));
const coins=require(path.join(A,'cosmetics-coins-v06992.js'));
const core=require(path.join(A,'cosmetics-core-v0413.js'));
const ui=require(path.join(A,'tcgp-battle-ui.js'));
const cosmeticAch=require(path.join(A,'achievements-cosmetics-v06992.js'));
const all=[...mats.CATALOGUE,...coins.CATALOGUE];

test('official artwork catalogue includes 88 playmats and 86 actual coin designs, unique and unlockable',()=>{
 assert.equal(mats.CATALOGUE.length,88);assert.equal(coins.CATALOGUE.length,86);
 assert.equal(new Set(mats.CATALOGUE.map(m=>m.id)).size,88);
 assert.equal(new Set(coins.CATALOGUE.map(m=>m.id)).size,86);
 for(const entry of all){
   assert.ok(entry.alwaysUnlocked||entry.sourceAchievementId||entry.rewardGroup,entry.id+' has no unlock');
   assert.match(entry.artPath,/^https:\/\/archives\.bulbagarden\.net\/media\/upload\/[a-f0-9]\/([a-f0-9]{2})\/TCGP_(?:Playmat|Coin)_.+\.png$/);
   const name=decodeURIComponent(entry.artPath.split('/').at(-1));
   const hash=createHash('md5').update(name).digest('hex');
   assert.ok(entry.artPath.includes('/'+hash[0]+'/'+hash.slice(0,2)+'/'),entry.id+' incorrect archive path');
 }
 assert.equal(mats.BY_ID['pocket-eevee'].alwaysUnlocked,true);
 assert.equal(coins.BY_ID['pocket-coin-poke-ball'].alwaysUnlocked,true);
 assert.equal(mats.BY_ID['pocket-charizard'].rewardGroup,'collection:species:6');
});

test('older saves gain only neutral Poké Ball coin; locked coins need an achievement',()=>{
 const state={cosmetics:{activePlaymat:'pocket-eevee',unlockedPlaymats:['pocket-eevee']},profile:{achievementClaims:[]}};
 const norm=core.ensureState(state);
 assert.deepEqual(norm.unlockedCoins,['pocket-coin-poke-ball']);
 assert.equal(norm.activeCoin,'pocket-coin-poke-ball');
 assert.equal(core.equipCoin(state,'pocket-coin-mewtwo').ok,false);
 assert.equal(core.equipCoin(state,'missing').ok,false);
 assert.equal(core.equipCoin(state,'pocket-coin-poke-ball').ok,true);
 assert.equal(core.activePlaymat(state).id,'pocket-eevee');
});

test('claiming earned wins unlocks exactly its mats and coins; rewards never duplicate',()=>{
 const achievements=cosmeticAch.build(()=>state);
 const state={tcgpBattle:{stats:{wins:60}},tcgClassicBattle:{stats:{wins:0}},profile:{achievementClaims:[]}};
 assert.equal(achievements.length,16);
 const claim='v06992_style_pocket_1';
 assert.deepEqual(achievements.find(a=>a.id===claim).progress(),[60,1]);
 const items=all.filter(e=>e.sourceAchievementId===claim);
 assert.ok(items.some(x=>x.kind==='coin')&&items.some(x=>x.kind==='playmat'));
 const first=core.reconcile(state,achievements);
 assert.deepEqual(first.unlockedCoins,[]);
 assert.equal(items.some(x=>core.isCoinOwned(state,x.id)&&x.kind==='coin'),false);
 state.profile.achievementClaims.push(claim);
 const done=core.reconcile(state,achievements);
 assert.equal(done.unlockedCoins.length,items.filter(x=>x.kind==='coin').length);
 assert.equal(done.unlockedPlaymats.length,items.filter(x=>x.kind==='playmat').length);
 assert.equal(core.reconcile(state,achievements).unlockedCoins.length,0);
 assert.equal(core.reconcile(state,achievements).unlockedPlaymats.length,0);
 const candidate=done.unlockedCoins[0];assert.equal(core.equipCoin(state,candidate).ok,true);
 assert.equal(core.activeCoin(state).id,candidate);
 assert.equal(core.equipCoin(state,'pocket-coin-poke-ball').ok,true);
 assert.equal(core.equipCoin(state,candidate).ok,true);
 const saved=JSON.parse(JSON.stringify(state));assert.equal(core.ensureState(saved).activeCoin,candidate);
});

test('cosmetic milestones track Pocket and Classic wins separately and every coin/mat has an achievable source',()=>{
 const state={tcgpBattle:{stats:{wins:5}},tcgClassicBattle:{stats:{wins:3}}};
 const achievements=cosmeticAch.build(()=>state);
 assert.deepEqual(achievements.find(x=>x.id==='v06992_style_pocket_5').progress(),[5,5]);
 assert.deepEqual(achievements.find(x=>x.id==='v06992_style_classic_3').progress(),[3,3]);
 const ids=new Set(achievements.map(x=>x.id));
 for(const item of all)if(item.sourceAchievementId)assert.ok(ids.has(item.sourceAchievementId),item.id);
 for(const achievement of achievements){assert.ok(all.some(x=>x.sourceAchievementId===achievement.id&&x.kind==='playmat'));assert.ok(all.some(x=>x.sourceAchievementId===achievement.id&&x.kind==='coin'));}
});

test('equipped coin displays on player heads and neutral reverse on tails / opponent',()=>{
 const state={cosmetics:{unlockedCoins:['pocket-coin-mewtwo'],activeCoin:'pocket-coin-mewtwo'}};
 const first=ui._test.coinArtPath('player',state),cpu=ui._test.coinArtPath('opponent',state);
 assert.equal(first,coins.BY_ID['pocket-coin-mewtwo'].artPath);
 assert.equal(cpu,coins.BY_ID['pocket-coin-poke-ball'].artPath);
 assert.match(ui._test.coinPresentationHtml(true,'player',state),/TCGP_Coin_Mewtwo\.png/);
 assert.match(ui._test.coinPresentationHtml(false,'player',state),/tcgp-present-coin-reverse.*TAILS/);
 assert.deepEqual(ui._test.coinSequence({results:[false,true,false],heads:1,coins:3}),[false,true,false]);
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 assert.match(html,/data-cosmetic-kind="coins"/);
 assert.ok(html.indexOf('cosmetics-coins-v06992.js')<html.indexOf('cosmetics-core-v0413.js'));
 assert.ok(html.indexOf('achievements-cosmetics-v06992.js')<html.indexOf('achievements-v0341.js'));
});
