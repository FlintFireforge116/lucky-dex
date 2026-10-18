const assert=require('node:assert/strict');
const {launch,appPage,games}=require('../scripts/recovery-browser.cjs');
(async()=>{const browser=await launch(),errors=[];try{
for(const viewport of [{width:360,height:800},{width:412,height:915},{width:393,height:873}]){
 const {page,context}=await appPage(browser,viewport,errors);
 await page.locator('#titleContinueBtn').click();await page.locator('#starterChoices button').first().click();await page.locator('.bottom-nav [data-nav="arcade"]').click();
 for(const [id,selector,ratio] of [['voltorb','#voltorbBoard',1],['fossil','.fossil-wall-stage-v0250',12/9]]){
  await page.evaluate(id=>LuckyDexArcadeWorld.openGame(id),id);
  const duplicates=await page.evaluate(()=>{const counts=new Map();document.querySelectorAll('[id]').forEach(n=>counts.set(n.id,(counts.get(n.id)||0)+1));return [...counts].filter(([,count])=>count>1).map(([id])=>id)});assert.deepEqual(duplicates,[],'HUD IDs must be unique');
  const r=await page.locator(selector).boundingBox();assert(Math.abs(r.width/r.height-ratio)<.04,id+' scene ratio must be preserved: '+JSON.stringify(r));
  assert(r.x>=0&&r.x+r.width<=viewport.width+1,id+' scene must fit horizontally');
 }
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('berry'));const berry=await page.locator('.berry-machine').boundingBox();assert(berry.x>=0&&berry.x+berry.width<=viewport.width+1,'restored Berry Blender must fit horizontally');
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('quiz'));
 const sprite=await page.locator('#quizSprite').boundingBox(),wrap=await page.locator('.quiz-silhouette-wrap').boundingBox();assert(sprite.y+sprite.height<=wrap.y+wrap.height+1,'quiz silhouette must fit in its scene without accidental cropping');
 for(const [gameId,startId] of Object.entries(games)){
  await page.evaluate(id=>LuckyDexArcadeWorld.openGame(id),gameId);
  const box=await page.locator('#'+startId).boundingBox();
  assert(box,gameId+' primary control must render');
  assert(box.y>=0&&box.y+box.height<=viewport.height,gameId+' primary control must fit inside '+viewport.width+'x'+viewport.height);
  const overflow=await page.evaluate(id=>{const el=document.getElementById(id+'Game');return el.scrollHeight-el.clientHeight;},gameId);
  assert(overflow<=2,gameId+' game screen must not require page-like vertical scrolling at '+viewport.width+'x'+viewport.height);
 }
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('berryPicker'));
 const pickerStage=await page.locator('#berryPickerStage').boundingBox();
 assert(pickerStage.height/viewport.height>.55,'Berry Picker scene must use most of the available phone height');
 await context.close();
}assert.deepEqual(errors,[]);console.log('PASS source proportions at three phone sizes');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
