const assert=require('node:assert/strict');const {launch,appPage}=require('../scripts/recovery-browser.cjs');
(async()=>{const browser=await launch(),errors=[];try{
 const {page,context}=await appPage(browser,{width:360,height:800},errors);
 await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();
 await page.evaluate(()=>{state.trade.currentSlot='2026-01-01:0';navigate('trade')});
 await page.waitForTimeout(150);assert.deepEqual(errors,[],'entering Trade with expired saved board must not recurse');
 assert.equal(await page.evaluate(()=>state.trade.currentSlot),await page.evaluate(()=>LuckyDexTrade.clock().slot));
 await page.evaluate(()=>{state.trade.currentSlot='2026-01-01:0';});
 await page.waitForFunction(()=>state.trade.currentSlot===LuckyDexTrade.clock().slot,{},{timeout:3000});assert.deepEqual(errors,[],'active clock rollover must refresh once');
 await page.evaluate(()=>navigate('adventure'));await page.evaluate(()=>navigate('trade'));assert.deepEqual(errors,[]);
 await context.close();console.log('PASS expired Trade entry, active four-hour refresh and reentry without recursion');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
