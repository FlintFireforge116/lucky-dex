const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let browserTools=null;try{browserTools=require('../scripts/recovery-browser.cjs');require.resolve('playwright');}catch(_){browserTools=null;}
if(!browserTools){
  const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');
  for(const token of ['unownTypedForm','unownInput','unownDecodeBtn','unownCashBtn'])assert.ok(html.includes(token),`missing ${token}`);
  assert.ok(css.includes('unown-canonical'),'reveal CSS missing');
  console.log('PASS v0.28.3 Unown browser static fallback (Playwright unavailable locally)');
  process.exit(0);
}
const {launch,appPage}=browserTools;
(async()=>{const browser=await launch();try{
  const errors=[],{page,context}=await appPage(browser,{width:360,height:760},errors);
  await page.locator('#titleContinueBtn').tap();
  await page.locator('#starterChoices button').first().tap();
  await page.locator('.bottom-nav [data-nav="arcade"]').tap();
  await page.evaluate(()=>LuckyDexUnown.open());
  assert.equal(await page.locator('[data-unown-difficulty]').count(),3);
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1,'tabs/page must not overflow');
  await page.locator('[data-unown-difficulty="normal"]').tap();
  const hasAnswerScreen=await page.locator('#unownAnswerScreen').count()>0;
  if(hasAnswerScreen){
    assert.equal(await page.locator('#unownAnswerOpenBtn').isVisible(),true,'v0.28.4+ should expose the dedicated answer-screen trigger');
    assert.equal(await page.locator('#unownTypedForm').isVisible(),false,'typed form stays inside the hidden answer screen until a question begins');
  }else assert.equal(await page.locator('#unownTypedForm').isVisible(),true);
  assert.equal(await page.locator('#unownAnswers').isVisible(),false);
  if(await page.evaluate(()=>!!window.LuckyDexDebug?.forceUnownRound)){
    await page.evaluate(()=>LuckyDexDebug.forceUnownRound({answer:'Iron Valiant',category:'POKÉMON',clue:'FAIRY / FIGHTING Pokémon'},'normal'));
    if(hasAnswerScreen)assert.equal(await page.locator('#unownAnswerScreen').isVisible(),true,'typed rounds should open the dedicated answer screen');
    assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1,'long message must not overflow');
    await page.locator('#unownInput').fill('iron-valiant');
    await page.locator('#unownTypedForm').press('Enter');
    await page.waitForTimeout(700);
    const decoded=await page.evaluate(()=>({state:LuckyDexDebug.unownState(),canonical:getComputedStyle(document.querySelector('.unown-canonical')).opacity,glyphs:getComputedStyle(document.querySelector('.unown-word-glyphs')).opacity}));
    assert.equal(decoded.state.phase,'between','keyboard Enter should use the normal submit path exactly once');
    assert.equal(decoded.state.streak,1,'one Enter should produce one decode');
    assert.equal(decoded.canonical,'1');assert.ok(Number(decoded.glyphs)<.2,'glyphs should visually retire on reveal');

    await page.evaluate(()=>LuckyDexDebug.forceUnownRound({answer:'Brute Bonnet',category:'POKÉMON',clue:'GRASS / DARK Pokémon'},'normal'));
    await page.locator('#unownInput').fill('brute bonnet');
    await page.locator('#unownTypedForm').press('Enter');
    await page.evaluate(()=>LuckyDexUnown.close());
    await page.evaluate(()=>LuckyDexUnown.open());
    await page.waitForTimeout(800);
    const reopened=await page.evaluate(()=>LuckyDexDebug.unownState());
    assert.equal(reopened.phase,'ready','close/reopen during reveal must cancel stale advancement/result');
    assert.equal(reopened.streak,0);
    assert.notEqual(await page.evaluate(()=>document.activeElement?.id),'unownInput','stale focus callback must not target a reopened ready session');
  }
  assert.deepEqual(errors,[]);
  await context.close();
  console.log('PASS v0.28.3 Unown mobile/reveal browser contract');
}finally{await browser.close();}})().catch(err=>{console.error(err);process.exit(1)});
