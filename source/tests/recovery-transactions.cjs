const assert=require('node:assert/strict');
const {launch,appPage}=require('../scripts/recovery-browser.cjs');
(async()=>{const browser=await launch(),errors=[];try{
const {page,context}=await appPage(browser,{width:360,height:800},errors);
await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();
await page.locator('.bottom-nav [data-nav="trade"]').tap();
// A real cached market fixture, as produced by the saved four-hour board.
await page.evaluate(async()=>{
 const request={id:'test-1',name:'Bulbasaur',setId:'test',setName:'Test Set',rarity:'Common',source:'tcg',count:2};
 state.cards[request.id]=request;
 const row={id:'qa-trade',trainer:'QA Trainer',avatar:'◆',accepted:false,request:{...request},offer:{...request,id:'test-2',name:'Ivysaur',count:0},reqTier:0,offerTier:0};
 LuckyDexTrade.current().push(row);await LuckyDexTrade.render();
});
await page.locator('[data-accept-trade="qa-trade"]').tap();
assert(await page.locator('#tradeConfirmModal').isVisible());
await page.evaluate(()=>handleLuckyBack());assert(await page.locator('#tradeConfirmModal').isHidden(),'native Back cancels pending Trade');
assert.equal(await page.evaluate(()=>state.cards['test-1'].count),2,'cancel must preserve card counts');
await page.locator('[data-accept-trade="qa-trade"]').tap();await page.locator('#tradeConfirmAccept').tap();
await page.waitForFunction(()=>!!state.cards['test-2']);
assert.equal(await page.evaluate(()=>state.cards['test-1'].count),1);assert.equal(await page.evaluate(()=>state.cards['test-2'].count),1);
await page.evaluate(()=>navigate('adventure'));assert(await page.locator('#tradeExchangeFx').isHidden(),'route exit dismisses animation');
await page.waitForTimeout(1000);assert.equal(await page.evaluate(()=>state.cards['test-2'].count),1,'interrupted animation cannot duplicate committed Trade');
await page.evaluate(()=>navigate('trade'));assert.equal(await page.evaluate(()=>LuckyDexTrade.current().find(r=>r.id==='qa-trade').accepted),true);
// Cancelling midway through a flip must leave the next exchange showing both fronts.
await page.evaluate(async()=>{const request=state.cards['test-1'];request.count=3;for(let i=0;i<2;i++)LuckyDexTrade.current().push({id:'flip-'+i,trainer:'QA',avatar:'◆',accepted:false,request:{...request},offer:{...request,id:'flip-card-'+i,name:'Ivysaur'},reqTier:0,offerTier:0});await LuckyDexTrade.render();});
await page.locator('[data-accept-trade="flip-0"]').tap();await page.locator('#tradeConfirmAccept').tap();await page.waitForFunction(()=>document.querySelector('.trade-fx-outgoing').classList.contains('flip-edge'));
await page.evaluate(()=>handleLuckyBack());await page.waitForTimeout(50);await page.locator('[data-accept-trade="flip-1"]').tap();await page.locator('#tradeConfirmAccept').tap();
assert.equal(await page.locator('.trade-fx-card.flip-edge,.trade-fx-card.face-back').count(),0,'next Trade must start with visible fronts');await page.evaluate(()=>handleLuckyBack());
// Abandoning a Voltorb board starts a fresh board and never awards coins.
await page.evaluate(()=>{navigate('arcade');LuckyDexArcadeWorld.openGame('voltorb')});
await page.locator('[data-vf-card]:not([data-vf-value="0"])').first().tap();
const before=await page.evaluate(()=>state.profile.coins);
await page.locator('#voltorbNewBtn').tap();
const after=await page.evaluate(()=>state.profile.coins);
assert.equal(after,before,'starting a new Voltorb board must not cash out the abandoned board');
assert.equal(await page.locator('#voltorbCashBtn').count(),0,'Voltorb cash-out control is removed');
await page.evaluate(()=>LuckyDexArcadeWorld.backFromGame());
// Save migration retains collection counts, shiny variants, unknown metadata and old fields.
const fixture={saveVersion:3,pokemon:{'25s':{id:25,name:'pikachu',shiny:true,count:3,types:['electric']}},cards:{legacy:{id:'legacy',name:'Old Card',count:7,custom:'keep'}},team:['25s'],arcade:{lastArcadeZone:'performance',bestSafari:99,customStat:42},customTop:'keep'};
await page.evaluate(fixture=>localStorage.setItem('luckyDexSave',JSON.stringify(fixture)),fixture);await page.reload({waitUntil:'load'});
const saved=await page.evaluate(()=>({pokemon:state.pokemon,cards:state.cards,arcade:state.arcade,customTop:state.customTop,live:window.state===state}));
assert.equal(saved.pokemon['25s'].count,3);assert.equal(saved.pokemon['25s'].shiny,true);assert.equal(saved.cards.legacy.count,7);assert.equal(saved.cards.legacy.custom,'keep');assert.equal(saved.arcade.bestSafari,99);assert.equal(saved.arcade.customStat,42);assert.equal(saved.arcade.lastArcadeVenue,'lilycoveContest');assert.equal(saved.customTop,'keep');assert(saved.live);
assert.deepEqual(errors,[]);await context.close();console.log('PASS Trade cancellation/transaction, Voltorb reward deduplication and legacy save compatibility');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
