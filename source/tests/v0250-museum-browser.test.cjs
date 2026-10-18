const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
let browserTools=null;try{browserTools=require('../scripts/recovery-browser.cjs');require.resolve('playwright');}catch(_){browserTools=null;}
if(!browserTools){
  const runtime=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-fossil-museum.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');
  for(const token of ['MUSEUM_CASES','oreburgh-museum-dppt-landscape-v0252','museum-exhibit-v0250','museumPlaque','Excavated:','renderMuseum'])assert(runtime.includes(token)||html.includes(token),`missing museum contract token ${token}`);
  assert(html.includes('id="museumGame"'),'museum host must exist');
  assert(!runtime.includes('museum-avatar')&&!runtime.includes('museumJoystick'),'museum must not render walking/avatar controls');
  assert(css.includes('.museum-room-v0250'),'museum room CSS missing');
  console.log('PASS v0.25.0 museum static/browser-fallback contract (Playwright unavailable locally)');
  process.exit(0);
}
const {launch,appPage}=browserTools;
(async()=>{const browser=await launch();try{for(const viewport of [{width:360,height:720},{width:320,height:700}]){const errors=[],{page,context}=await appPage(browser,viewport,errors);await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.locator('.bottom-nav [data-nav="arcade"]').tap();await page.evaluate(()=>LuckyDexFossilMuseum.open('museum'));await page.waitForSelector('#oreburghMuseumRoom');
 assert.equal(await page.locator('.museum-exhibit-v0250').count(),0);assert.equal(await page.locator('[data-museum-empty],.museum-silhouette,.museum-locked').count(),0);assert((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1);
 await page.evaluate(()=>{const s=LuckyDexFossilMuseumBridge.getState();s.arcade.museum.exhibits['helix-fossil']={discovered:true,foundCount:4,firstFoundAt:1};LuckyDexFossilMuseum.renderMuseum();});
 assert.equal(await page.locator('[data-museum-id="helix-fossil"]').count(),1);await page.locator('[data-museum-id="helix-fossil"]').tap();assert.match((await page.locator('#museumPlaque').textContent()).toUpperCase(),/HELIX FOSSIL/);assert.match(await page.locator('#museumPlaque').textContent(),/Excavated: 4/);
 await page.evaluate(()=>{const s=LuckyDexFossilMuseumBridge.getState();s.arcade.museum.exhibits['odd-keystone']={discovered:true,foundCount:1,firstFoundAt:1};LuckyDexFossilMuseum.renderMuseum();});assert.equal(await page.locator('[data-museum-id="odd-keystone"]').count(),1);assert.deepEqual(errors,[]);await context.close();}console.log('PASS v0.25.0 museum browser contract');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
