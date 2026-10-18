const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let browserTools=null;try{browserTools=require('../scripts/recovery-browser.cjs');require.resolve('playwright');}catch(_){browserTools=null;}
if(!browserTools){
  const runtimePath=path.join(root,'app/src/main/assets/arcade-fossil-museum.js');
  assert.ok(fs.existsSync(runtimePath),'new Fossil Dig runtime must exist');
  const js=fs.readFileSync(runtimePath,'utf8'),html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8'),css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');
  for(const token of ['startDig','selectTool','strikeCell','finishDig','currentDig','data-fossil-cell','fossilToolPickaxe','fossilToolHammer','WALL STABILITY','ITEMS FOUND'])assert(js.includes(token)||html.includes(token),`missing Fossil Dig contract token ${token}`);
  assert(css.includes('grid-template-columns:repeat(12')||css.includes('--fossil-cols,12'),'Fossil wall CSS must define twelve columns');
  assert(css.includes('min-height:44px')||css.includes('min-height:48px')||css.includes('min-height:52px'),'tool controls need phone-sized touch targets');
  console.log('PASS v0.25.0 Fossil Dig static/browser-fallback contract (Playwright unavailable locally)');
  process.exit(0);
}
const {launch,appPage}=browserTools;
(async()=>{const browser=await launch();try{for(const viewport of [{width:360,height:720},{width:320,height:700}]){const errors=[],{page,context}=await appPage(browser,viewport,errors);await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.locator('.bottom-nav [data-nav="arcade"]').tap();await page.evaluate(()=>LuckyDexFossilMuseum.open('fossil'));await page.waitForSelector('[data-fossil-cell]');
 const board=await page.locator('#fossilGrid').evaluate(el=>({count:el.children.length,cols:getComputedStyle(el).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth-innerWidth}));assert.deepEqual([board.count,board.cols],[108,12]);assert(board.overflow<=1);
 assert.equal(await page.locator('#fossilStability').textContent(),'100%');
 for(const id of ['#fossilToolPickaxe','#fossilToolHammer'])assert((await page.locator(id).boundingBox()).height>=44);
 const before=await page.evaluate(()=>LuckyDexFossilMuseum.currentDig().stability);await page.locator('[data-fossil-cell="13"]').tap();assert.equal(await page.evaluate(()=>LuckyDexFossilMuseum.currentDig().stability),before-3);await page.locator('#fossilToolHammer').tap();const beforeHammer=await page.evaluate(()=>LuckyDexFossilMuseum.currentDig().stability);await page.locator('[data-fossil-cell="13"]').tap();assert.equal(await page.evaluate(()=>LuckyDexFossilMuseum.currentDig().stability),beforeHammer-8);assert.deepEqual(errors,[]);await context.close();}console.log('PASS v0.25.0 Fossil Dig browser contract');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
