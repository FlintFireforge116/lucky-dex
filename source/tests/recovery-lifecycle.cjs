const assert=require('node:assert/strict');const {launch,appPage}=require('../scripts/recovery-browser.cjs');
(async()=>{const browser=await launch(),errors=[];try{
 const {page,context}=await appPage(browser,{width:360,height:800},errors);
 await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.locator('.bottom-nav [data-nav="arcade"]').tap();
 // Leave the Blender while its awaited countdown is pending, then immediately start a new session.
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('berry'));await page.locator('#berryStartBtn').tap();await page.evaluate(()=>LuckyDexArcadeWorld.backFromGame());
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('berry'));await page.waitForTimeout(2300);
 assert.equal(await page.evaluate(()=>LuckyDexBerryBlender.state().phase),'ready','cancelled countdown cannot start the reentered Blender');
 // Actual three-ball run and result, then leave/reenter and switch to another game.
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('ballDrop'));const before=await page.evaluate(()=>state.profile.coins);
 for(let ball=0;ball<3;ball++){await page.locator('#ballDropBtn').tap();await page.waitForFunction(()=>!document.getElementById('ballDropBtn').disabled||LuckyDexArcadeSession.isShowing(),{},{timeout:20000});}
 assert(await page.locator('#arcadeResultSheet').isVisible());const after=await page.evaluate(()=>state.profile.coins);assert(after>before,'finished run awards coins');
 await page.locator('#arcadeResultBack').tap();assert.equal(await page.evaluate(()=>LuckyDexArcadeWorld.activeGame()),null);assert.equal(await page.evaluate(()=>document.body.classList.contains('arcade-open')),false);
 await page.locator('[data-venue-game="ballDrop"]').tap();assert.equal(await page.locator('#ballDropScore').textContent(),'0');await page.locator('#ballDropBtn').tap();await page.evaluate(()=>LuckyDexArcadeWorld.suspend());
 assert.equal(await page.evaluate(()=>LuckyDexArcadeWorld.activeGame()),null);assert.equal(await page.evaluate(()=>state.profile.coins),after,'background interruption awards no extra coins');
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('clefairy'));await page.locator('#memoryStartBtn').tap();await page.evaluate(()=>LuckyDexArcadeWorld.openGame('quiz'));await page.waitForTimeout(2500);assert.equal(await page.locator('#clefairyGame [data-memory]:enabled').count(),0,'cancelled Moon Stage playback never activates controls later');
 await page.evaluate(()=>LuckyDexArcadeWorld.leave());assert.deepEqual(errors,[]);await context.close();console.log('PASS Blender countdown exit, complete Ball Drop/reentry/background, interrupted Clefairy lesson');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
