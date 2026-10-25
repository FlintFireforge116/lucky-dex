const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {launch,createPage,start,drag}=require('./tcgp-browser-fixture.cjs');
const out=path.resolve(__dirname,'../artifacts/v06929/visual');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await launch();
 try{
  const {page,context,errors}=await createPage(browser);
  async function capture(name){
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.tcgp-live-arena img,.tcgp-live-sheet img')].map(i=>i.decode()));});
   await page.screenshot({path:path.join(out,name+'.png')});
  }
  for(const [w,h] of [[360,720],[360,800],[393,873],[412,915],[430,932]]){
   await page.setViewportSize({width:w,height:h});
   for(const [mode,count] of [['setup',5],['battle',3],['battle',5],['battle',10],['battle',20]]){
    await start(page,{mode,handCount:count});await capture(w+'x'+h+'-'+mode+'-hand'+count);
    if(count===20){await page.locator('.tcgp-live-hand-card').last().scrollIntoViewIfNeeded();await capture(w+'x'+h+'-last-card');}
   }
  }
  await page.setViewportSize({width:360,height:720});
  await page.evaluate(()=>{LuckyDexCosmeticsV0413.unlockSleeve(state,'luckydex-cream');LuckyDexCosmeticsV0413.equipSleeve(state,'luckydex-cream');});
  await start(page,{mode:'battle',benchCount:2});
  await drag(page,'[data-tcgp-energy-source]','.tcgp-live-player-bench .tcgp-live-card-wrap:first-child .tcgp-live-card');
  await capture('360x720-attached-energy-equipped-sleeve');
  await page.click('.tcgp-live-player-active .tcgp-live-card');await capture('360x720-card-detail');await page.click('.tcgp-live-sheet-close');
  await drag(page,'[data-tcgp-hand-drag="2"]','[data-card-play-zone="1"]');
  await page.click('[data-tcgp-action="open-discard"][data-side="player"]');await capture('360x720-public-discard');await page.click('.tcgp-live-sheet-close');
  await start(page,{mode:'battle',benchCount:2});
  await drag(page,'[data-tcgp-hand-drag="1"]','[data-card-play-zone="1"]');await capture('360x720-relevant-evolution-targets');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({viewports:5,captures:fs.readdirSync(out).filter(f=>f.endsWith('.png')).length,errors},null,2));
  await context.close();console.log('PASS real-art portrait and sheet captures');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
