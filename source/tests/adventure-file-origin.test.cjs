const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {launch,root}=require('../scripts/recovery-browser.cjs');
(async()=>{const browser=await launch(),errors=[];try{
 const context=await browser.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true});const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));await page.route(/^https?:/,r=>r.abort());
 await page.goto(pathToFileURL(path.join(root,'app/src/main/assets/index.html')).href);await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.evaluate(()=>{navigate('adventure');LuckyDexAdventure.wild();});
 assert.equal(await page.locator('[data-adv-view="habitats"]').isVisible(),true);
 await page.locator('[data-adv-destination="meadow"]').tap();await page.locator('[data-adv-action="roam"]').tap();await page.locator('[data-adv-hotspot]').first().tap();
 const data=await page.evaluate(async()=>{const el=document.querySelector('.adv-environment'),url=getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];const image=new Image();const loaded=await new Promise(resolve=>{image.onload=()=>resolve(image.naturalWidth);image.onerror=()=>resolve(0);image.src=url;});return {url,loaded,save:JSON.parse(localStorage.getItem('luckyDexSave'))};});
 assert.match(data.url,/^file:/);assert.equal(data.loaded,384);assert(data.save.adventureV2.activeRoam.reveal);assert.deepEqual(errors,[]);
 console.log('PASS browser file origin: offline scene pixels, local assets, starter/hotspot and localStorage persistence');await context.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
