const assert=require('node:assert/strict'),{launch,open,settle}=require('../scripts/adventure3-browser-utils.cjs');
(async()=>{
 const b=await launch();try{
  const {page,context,errors}=await open(b,{width:360,height:640});
  await page.locator('[data-nav="adventure"]').click();
  await page.locator('[data-hub-action="journey"]').click();await page.locator('[data-region="kanto"]').click();
  await page.locator('[data-location-action="heal"]').click();
  assert.equal(await page.locator('[data-journey-action="advance"]').count(),0,'routine actions return without a forced interstitial');
  assert.equal(await page.locator('[data-adv-view="journey"]').count(),1,'routine home recovery retains the local menu');
  assert.equal(await page.locator('.adv3-head h2').innerText(),'Pallet Town','routine recovery waits for explicit travel');
  await page.locator('.adv3-foot [data-journey-action="continue"]').click();
  assert.equal(await page.evaluate(()=>state.adventureRegional.active.phase),'map');
  await page.locator('[data-location-action="battle"]').click();
  await page.locator('[data-adv-command="battle-fight"]').click();await page.locator('[data-move-id]:enabled').first().click();await settle(page);
  const before=await page.evaluate(()=>JSON.stringify({id:state.adventureRegional.active.id,party:state.adventureRegional.active.party,battle:state.adventureRegional.active.battle,depth:state.adventureRegional.active.depth}));
  await page.reload();await page.locator('#titleContinueBtn').click();await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();
  assert.equal(await page.evaluate(()=>JSON.stringify({id:state.adventureRegional.active.id,party:state.adventureRegional.active.party,battle:state.adventureRegional.active.battle,depth:state.adventureRegional.active.depth})),before,'reload resumes exact HP/PP/RNG/location');
  await page.evaluate(()=>{LuckyDexRegionalEngine.defeat(state);state.adventureRegional.active.recovery=null;save();LuckyDexAdventure.openTool('moves',{key:'25:n',moveTab:'tm'})});
  await page.locator('[data-tool-action="teach"][data-id="85"]').click();assert.equal(await page.evaluate(()=>state.tmInventory[85]),2);
  assert.match(await page.locator('#adventureRoot').innerText(),/Choose a move to forget/);
  await page.locator('[data-tool-action="forget"][data-slot="0"]').click();await page.locator('[data-tool-action="confirm"]').click();
  assert.equal(await page.evaluate(()=>state.tmInventory[85]),1);assert(await page.evaluate(()=>state.pokemon['25:n'].moves.includes(85)));assert.deepEqual(errors,[]);
  await context.close();console.log('PASS actual regional location/fight reload and confirmedTM replacement');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
