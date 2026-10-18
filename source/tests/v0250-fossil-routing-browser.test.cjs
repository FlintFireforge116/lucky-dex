const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let browserTools=null;try{browserTools=require('../scripts/recovery-browser.cjs');require.resolve('playwright');}catch(_){browserTools=null;}
if(!browserTools){
  const runtime=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-fossil-museum.js'),'utf8');
  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  for(const token of ["rewardDestination==='museum'","rewardDestination==='coins'","rewardDestination==='inventory'","rewardDestination==='card'",'recordMuseumFind','grantInventory','grantCard','pendingCoins','resolveBuriedCard'])assert(runtime.includes(token)||app.includes(token),`missing routing token ${token}`);
  assert(app.includes('state.stats.cardsPulled')&&!/grantFossilCardV0250[\s\S]{0,1200}state\.stats\.packs\+\+/.test(app),'buried cards must not increment pack count');
  console.log('PASS v0.25.0 Fossil reward routing static/browser-fallback contract (Playwright unavailable locally)');
  process.exit(0);
}
const {launch,appPage}=browserTools;
(async()=>{const browser=await launch();try{const errors=[],{page,context}=await appPage(browser,{width:360,height:720},errors);await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.locator('.bottom-nav [data-nav="arcade"]').tap();await page.evaluate(()=>LuckyDexArcadeWorld.openGame('fossil'));
 const inject=async(itemId,extra={})=>page.evaluate(async({itemId,extra})=>{LuckyDexArcadeSession.hideResult();await LuckyDexFossilMuseum.startDig();const d=LuckyDexFossilMuseum.currentDig();d.depths=Array(108).fill(0);d.depths[0]=1;d.finds=[{id:'test-'+itemId,itemId,cells:[0],row:0,col:0,...extra}];d.awardedFindIds=[];d.finished=false;d.collapsed=false;d.resultShown=false;d.stability=100;return true;},{itemId,extra});
 await inject('helix-fossil');await page.evaluate(()=>LuckyDexFossilMuseum.strikeCell(0));let museum=await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().arcade.museum.exhibits['helix-fossil']);assert.equal(museum.foundCount,1);
 const coins1=await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().profile.coins);await inject('helix-fossil');await page.evaluate(()=>LuckyDexFossilMuseum.strikeCell(0));museum=await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().arcade.museum.exhibits['helix-fossil']);assert.equal(museum.foundCount,2);assert.equal(await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().profile.coins),coins1+60);
 await inject('nugget');const c2=await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().profile.coins);await page.evaluate(()=>LuckyDexFossilMuseum.strikeCell(0));assert.equal(await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().profile.coins),c2+100);assert.match(await page.locator('#arcadeResultDetails').textContent(),/Nugget/);
 await inject('great-ball');const gb=await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().inventory.greatball||0);await page.evaluate(()=>LuckyDexFossilMuseum.strikeCell(0));assert.equal(await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().inventory.greatball),gb+1);
 const packs=await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().stats.packs);await inject('tcg-card',{card:{id:'test-buried-card',name:'Test Buried Card',rarity:'Rare'},set:{id:'test-set',name:'Test Set',cardCount:{total:1}}});await page.evaluate(()=>LuckyDexFossilMuseum.strikeCell(0));assert.equal(await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().cards['test-buried-card'].count),1);assert.equal(await page.evaluate(()=>LuckyDexFossilMuseumBridge.getState().stats.packs),packs);
 await page.reload();assert.equal(await page.evaluate(()=>{const raw=JSON.parse(localStorage.getItem('luckydex-save-v1'));return raw.arcade.museum.exhibits['helix-fossil'].foundCount;}),2);assert.deepEqual(errors,[]);await context.close();console.log('PASS v0.25.0 Fossil reward routing browser contract');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
