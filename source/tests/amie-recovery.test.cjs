/* Run with NODE_PATH set to the bundled node_modules, or installed Playwright. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const assets = path.resolve(__dirname, '../app/src/main/assets');
const source = process.env.AMIE_SOURCE || 'arcade-amie.js';
const html = fs.readFileSync(path.join(assets, 'index.html'), 'utf8');
const games = html.slice(html.indexOf('<div id="berryPickerGame"'), html.indexOf('<div id="voltorbGame"'));
const fixture = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;height:100dvh}button{cursor:pointer}[hidden]{display:none}</style><link rel="stylesheet" href="/arcade.css"><link rel="stylesheet" href="/arcade-amie.css">${games}<script>
window.state={arcade:{bestBerryPicker:{easy:0,normal:1000,hard:0},bestHeadIt:{easy:0,normal:0,hard:0,unlimited:0,unlimitedStreak:0},bestTilePuzzle:{easy:null,normal:20,hard:null},preserve:'existing save'},inventory:{berry:5}};window.saves=[];window.save=()=>saves.push(JSON.parse(JSON.stringify(state)));
window.awards=[];window.LuckyDexArcadePlatform={caughtParticipants:n=>[25,133,175].slice(0,n).map(id=>({id,name:'Pokemon '+id,image:'arcade/sprites/actors/pokemon/'+id+'.png'})),awardRun:r=>{awards.push(r);return {coinsAwarded:r.coins,itemAwarded:null};}};
window.LuckyDexArcadeSession={mount(){},hideResult(){},update(){},showResult(){}};
window.resources={timeouts:new Set(),intervals:new Set(),rafs:new Set()};
const originalTimeout=setTimeout,originalClearTimeout=clearTimeout,originalInterval=setInterval,originalClearInterval=clearInterval,originalRaf=requestAnimationFrame,originalCancelRaf=cancelAnimationFrame,originalNow=performance.now.bind(performance);performance.now=()=>window.testNow??originalNow();
window.setTimeout=(fn,ms)=>{let id=originalTimeout(()=>{resources.timeouts.delete(id);fn();},ms);resources.timeouts.add(id);return id;};window.clearTimeout=id=>{resources.timeouts.delete(id);originalClearTimeout(id);};
window.setInterval=(fn,ms)=>{const id=originalInterval(fn,ms);resources.intervals.add(id);return id;};window.clearInterval=id=>{resources.intervals.delete(id);originalClearInterval(id);};
window.requestAnimationFrame=fn=>{let id=originalRaf(now=>{resources.rafs.delete(id);fn(window.testNow??now);});resources.rafs.add(id);return id;};window.cancelAnimationFrame=id=>{resources.rafs.delete(id);originalCancelRaf(id);};
</script><script src="/${source}"></script>`;
async function main(){
 const server=http.createServer((req,res)=>{if(req.url==='/'){res.setHeader('content-type','text/html');res.end(fixture);return;}const p=path.join(assets,decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(assets)||!fs.existsSync(p)){res.statusCode=404;res.end();return;}if(p.endsWith('.js'))res.setHeader('content-type','text/javascript');if(p.endsWith('.css'))res.setHeader('content-type','text/css');res.end(fs.readFileSync(p));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await require('../scripts/recovery-browser.cjs').launch();
 try{
  for(const [width,height] of [[360,800],[412,915],[412,1200]]){
   const page=await browser.newPage({viewport:{width,height}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${server.address().port}`);
   await page.evaluate(()=>window.amie=window.LuckyDexAmie||window.LuckyDexAmieV0190);
   await page.evaluate(()=>amie.open('berryPicker'));
   assert.equal(await page.locator('[data-berry-customer]').count(),1,'ready Berry Picker must show its actual requester');
   await page.locator('#berryPickerStartBtn').click();
   const stage=await page.locator('#berryPickerStage').boundingBox();assert.ok(stage.height/height>.55,'Berry Picker scene must dominate the phone height while it is visible');
   const berry=page.locator('[data-berry-pick]').first();
   await berry.dispatchEvent('pointerdown',{pointerId:7,isPrimary:true,pointerType:'mouse',clientX:100,clientY:180});
   await berry.dispatchEvent('pointermove',{pointerId:7,clientX:110,clientY:190});
   assert.equal(await page.locator('.berry-drag').count(),1,'drag must exist during pointer gesture');
   await berry.dispatchEvent('pointercancel',{pointerId:7,pointerType:'touch'});
   assert.equal(await page.locator('.berry-drag').count(),0,'pointer cancellation must clean up drag');
   await berry.dispatchEvent('pointerdown',{pointerId:8,isPrimary:true,pointerType:'mouse',clientX:100,clientY:180});
   await berry.dispatchEvent('pointermove',{pointerId:8,clientX:110,clientY:190});
   await berry.dispatchEvent('lostpointercapture',{pointerId:8});
   assert.equal(await page.locator('.berry-drag').count(),0,'lost capture must clean up drag');
   assert.equal(await berry.getAttribute('aria-pressed'),'true','lost capture must preserve the tap-to-feed selection');
   await berry.dispatchEvent('pointerdown',{pointerId:9,isPrimary:true,pointerType:'mouse',clientX:100,clientY:180});
   await berry.dispatchEvent('pointermove',{pointerId:9,clientX:110,clientY:190});
   await page.evaluate(()=>amie.close());
   assert.equal(await page.locator('.berry-drag').count(),0,'exit must clean up a held berry');
   await page.evaluate(()=>{amie.open('tilePuzzle');});
   await page.waitForTimeout(60);
   const r=await page.locator('#tilePuzzleCanvas').boundingBox();
   assert.ok(Math.abs(r.width/r.height-5/3)<.01,'ready tile picture must use the 3DS top-screen aspect');
   await page.evaluate(()=>amie.startTile());
   await page.locator('#tilePuzzleCanvas').click({position:{x:10,y:10}});
   await page.locator('#tilePuzzleCanvas').click({position:{x:90,y:10}});
   assert.equal(await page.locator('#tilePuzzleMoves').textContent(),'1','two different tile taps swap the picture once');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   assert.equal(overflow,false,`${width}x${height} must not horizontally overflow`);
   await page.evaluate(()=>amie.close());
   assert.deepEqual(await page.evaluate(()=>Object.values(resources).map(s=>s.size)),[0,0,0],'exit must release all owned timers and animation frames');
   assert.deepEqual(errors,[],'game lifecycle must not produce browser exceptions');
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:360,height:800}});await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(()=>{Math.random=()=>0;window.amie=window.LuckyDexAmie;amie.open('berryPicker');amie.setBerryMode('unlimited');amie.startBerry();});
  await page.locator('[data-berry-pick="razz"]').click();await page.locator('[data-berry-customer="0"]').click();await page.locator('[data-berry-customer="0"]').click();
  assert.equal(await page.locator('#berryPickerCorrect').textContent(),'1','a requester in its reaction cannot be scored twice');
  await page.waitForTimeout(270);
  for(let i=0;i<3;i++){await page.locator('[data-berry-pick="bluk"]').click();await page.locator(`[data-berry-customer="${i}"]`).click();}
  assert.equal(await page.evaluate(()=>awards.length),1,'three unlimited misses award exactly once');
  const reward=await page.evaluate(()=>awards[0]);assert.equal(reward.gameId,'berryPicker');assert.equal(reward.coins,20);assert.equal(reward.dailyEligible,false);assert.deepEqual(reward.dailyReward,{key:'berry',amount:2});
  await page.evaluate(()=>{amie.startBerry();amie.close();});await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>awards.length),1,'restarting and exiting cannot award an abandoned run');
  assert.deepEqual(await page.evaluate(()=>Object.values(resources).map(s=>s.size)),[0,0,0],'finished/restarted run callbacks must be disposed');await page.close();
  const bestPage=await browser.newPage({viewport:{width:360,height:800}});await bestPage.goto(`http://127.0.0.1:${server.address().port}`);
  await bestPage.evaluate(()=>{window.testNow=0;Math.random=()=>0;window.amie=LuckyDexAmie;amie.open('berryPicker');amie.startBerry();});
  await bestPage.locator('[data-berry-pick="razz"]').click();await bestPage.locator('[data-berry-customer="0"]').click();
  await bestPage.evaluate(()=>testNow=61000);await bestPage.waitForTimeout(110);
  assert.equal(await bestPage.evaluate(()=>state.arcade.bestBerryPicker.easy),160,'completed berry score must update the saved best');
  assert.equal(await bestPage.evaluate(()=>saves.at(-1).arcade.bestBerryPicker.easy),160,'berry best must reach save persistence');
  await bestPage.evaluate(()=>{amie.startBerry();testNow+=61000;});await bestPage.waitForTimeout(110);
  assert.equal(await bestPage.evaluate(()=>state.arcade.bestBerryPicker.easy),160,'a lower berry score must preserve the previous best');
  async function finishTileAt(seconds){
   await bestPage.evaluate(()=>{amie.open('tilePuzzle');Math.random=()=>0;amie.startTile();});
   await bestPage.evaluate(seconds=>{testNow+=seconds*1000;const c=document.getElementById('tilePuzzleCanvas'),r=c.getBoundingClientRect();function tap(i){c.dispatchEvent(new PointerEvent('pointerdown',{clientX:r.left+(i%5+.5)*r.width/5,clientY:r.top+(Math.floor(i/5)+.5)*r.height/4}));}for(let i=0;i<19;i++){tap(i);tap(19);}},seconds);
  }
  await finishTileAt(5);
  assert.equal(await bestPage.evaluate(()=>state.arcade.bestTilePuzzle.easy),5,'first solved tile puzzle stores elapsed seconds in its existing numeric field');
  assert.equal(await bestPage.evaluate(()=>saves.at(-1).arcade.bestTilePuzzle.easy),5,'tile time must reach save persistence');
  await finishTileAt(10);assert.equal(await bestPage.evaluate(()=>state.arcade.bestTilePuzzle.easy),5,'a slower tile solve must preserve the previous best');
  await finishTileAt(3);assert.equal(await bestPage.evaluate(()=>state.arcade.bestTilePuzzle.easy),3,'a faster tile solve replaces the previous best');
  assert.equal(await bestPage.evaluate(()=>state.arcade.preserve),'existing save','updating bests preserves unrelated save values');
  assert.equal(await bestPage.evaluate(()=>awards.filter(r=>r.gameId==='tilePuzzle').length),3,'each completed puzzle awards only once');
  await bestPage.evaluate(()=>amie.close());await bestPage.close();
  console.log('PASS Amie recovery: ready scenes, cancelled drags, tile swaps, rewards, best-score persistence, resource cleanup, 3 phone sizes');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
