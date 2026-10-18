'use strict';
const fs=require('node:fs'),path=require('node:path');
const {root,launch,appPage}=require('./recovery-browser.cjs');
const viewports=[{width:360,height:640},{width:360,height:740},{width:390,height:844},{width:412,height:915}];
function seedSave(){localStorage.setItem('luckyDexSave',JSON.stringify({saveVersion:7,pokemon:{'4:n':{id:4,name:'charmander',level:8,count:1,types:['fire'],baseStats:{hp:39,attack:52,defense:43,speed:65}}},team:['4:n']}));}
async function enterRace(page,options={}){
  await page.locator('#titleContinueBtn').click();
  await page.locator('.bottom-nav [data-nav="arcade"]').click();
  await page.evaluate(hostile=>{window.qaOriginalDashParent=document.getElementById('dashGame').parentElement;if(hostile)window.qaOriginalDashParent.style.transform='translate3d(0,96px,0)';},!!options.hostile);
  await page.evaluate(()=>LuckyDexArcadeWorld.openVenue(LuckyDexArcadeWorld.venueForGame('dash')));
  await page.locator('[data-venue-game="dash"]').click();
  await page.locator('#dashQuickBtn').click();
  await page.locator('[data-dash-difficulty="easy"]').click();
  await page.locator('#dashStartBtn').click();
  await page.waitForFunction(()=>!document.getElementById('dashCountdown').hidden&&document.getElementById('dashCountdown').textContent!=='LOADING');
  await page.waitForTimeout(3300);
}
async function layout(page){return page.evaluate(()=>{
  const box=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {id:e.id,class:e.className,x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,position:s.position,transform:s.transform,filter:s.filter,perspective:s.perspective,contain:s.contain,overflow:s.overflow,padding:s.padding};};
  const ancestors=[];for(let e=document.getElementById('dashGame');e;e=e.parentElement)ancestors.push(box(e));
  const nodes={};for(const selector of ['#dashGame','#dashRaceView','.dash-full-head','.dash-hud','.dash-canvas-wrap','#dashCanvas','.dash-controls','#dashLeftBtn','#dashSprintBtn','#dashRightBtn'])nodes[selector]=box(document.querySelector(selector));
  return {viewport:{width:innerWidth,height:innerHeight},scroll:{documentHeight:document.documentElement.scrollHeight,bodyHeight:document.body.scrollHeight,y:scrollY},ancestors,nodes};
});}
async function capture(label='after',options={}){
  const out=path.join(root,'artifacts/v0340',label);fs.mkdirSync(out,{recursive:true});
  const browser=await launch(),results=[];
  try{for(const viewport of viewports){const errors=[],{context,page}=await appPage(browser,viewport,errors,{init:seedSave});try{await enterRace(page,options);const measured=await layout(page);await page.screenshot({path:path.join(out,`race-${viewport.width}x${viewport.height}.png`)});results.push({...measured,errors});}finally{await context.close();}}}finally{await browser.close();}
  fs.writeFileSync(path.join(out,'layout.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(m=>({viewport:m.viewport,course:m.nodes['.dash-canvas-wrap'],controls:m.nodes['.dash-controls'],scroll:m.scroll,errors:m.errors})),null,2));return results;
}
module.exports={viewports,seedSave,enterRace,layout,capture};
if(require.main===module){const hostile=process.argv.includes('--hostile');capture((process.argv.includes('--before')?'before':'after')+(hostile?'-hostile':''),{hostile}).catch(e=>{console.error(e);process.exitCode=1;});}
