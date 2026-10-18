const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,launch,appPage,games}=require('./recovery-browser.cjs');
const sizes=[{width:360,height:800},{width:393,height:873},{width:412,height:915},{width:360,height:700}];
(async()=>{const browser=await launch(),out=path.join(root,'artifacts/v0223/qa'),results=[];fs.mkdirSync(out,{recursive:true});try{
for(const viewport of sizes){const errors=[],{page,context}=await appPage(browser,viewport,errors),prefix=viewport.width+'x'+viewport.height;
 const snap=async name=>{await page.locator('img:visible').evaluateAll(async imgs=>Promise.all(imgs.filter(i=>i.getAttribute('src')).map(i=>i.decode().catch(()=>{}))));await page.screenshot({path:path.join(out,prefix+'-'+name+'.png')});};
 await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.locator('.bottom-nav [data-nav="arcade"]').tap();await snap('world');
 for(const id of await page.evaluate(()=>LuckyDexArcadeWorld.VENUES.map(v=>v.id))){await page.evaluate(id=>LuckyDexArcadeWorld.openVenue(id),id);await snap('venue-'+id);}
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('berryPicker'));await snap('berry-ready');await page.locator('[data-berry-mode="hard"]').tap();await page.locator('#berryPickerStartBtn').tap();await snap('berry-hard');
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('fossil'));await snap('fossil-covered');
 const toReveal=await page.evaluate(()=>{let s;for(let i=0;i<20;i++){s=LuckyDexArcadeClassicsV0190.makeFossil();if(s.items.length===2)break;}const empty=s.revealed.map((_,i)=>i).filter(i=>!s.itemIndexes.has(i)&&!s.obstacles.has(i)).slice(0,2);return [...empty,[...s.obstacles][0],s.items[0].itemIndex]});
 for(const i of toReveal)await page.locator('[data-fossil-v019="'+i+'"]').tap();if(await page.locator('#arcadeResultSheet').isVisible())await page.evaluate(()=>LuckyDexArcadeSession.hideResult());await snap('fossil-revealed');
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('ballDrop'));await snap('ball-ready');await page.locator('#ballDropBtn').tap();await snap('ball-running');await page.evaluate(()=>LuckyDexArcadeWorld.backFromGame());
 for(const id of ['clefairy','berry','tilePuzzle']){await page.evaluate(id=>LuckyDexArcadeWorld.openGame(id),id);await snap(id+'-preserved');}
 const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,activeGame:LuckyDexArcadeWorld.activeGame()}));assert.equal(geometry.overflow,0);assert.deepEqual(errors,[]);results.push({viewport:prefix,errors:0,...geometry});await context.close();
}
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log('PASS v0.22.3 screenshot capture: four usable viewports, all venues, target games and preserved restores');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
