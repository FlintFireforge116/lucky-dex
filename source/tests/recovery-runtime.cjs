const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {root,games,launch,appPage}=require('../scripts/recovery-browser.cjs');
const viewports=[{width:360,height:800},{width:412,height:915},{width:393,height:873}];
const probe=()=>{
 window.__qaResources=new Map();const sources=/\/(arcade-(amie|classics|quiz|unown|ball-drop)|berry-blender)\.js/;
 for(const [name,clear,repeat] of [['setTimeout','clearTimeout',false],['setInterval','clearInterval',true],['requestAnimationFrame','cancelAnimationFrame',false]]){
  const native=window[name].bind(window),nativeClear=window[clear].bind(window);
  window[name]=(callback,...args)=>{let id;const source=(new Error().stack||'').split('\n')[2]||'';id=native((...v)=>{if(!repeat)__qaResources.delete(id);callback(...v)},...args);if(sources.test(source))__qaResources.set(id,{name,source});return id;};
  window[clear]=id=>{__qaResources.delete(id);nativeClear(id);};
 }
};
async function useful(page,id){return page.evaluate(id=>{const b=document.getElementById(id),r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {fully:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth,hit:hit===b||b.contains(hit),enabled:!b.disabled,rect:{x:r.x,y:r.y,w:r.width,h:r.height},overflow:document.documentElement.scrollWidth-innerWidth};},id);}
async function resources(page){return page.evaluate(()=>[...__qaResources.values()]);}
(async()=>{const browser=await launch(),summary=[],out=path.join(root,'artifacts/qa');fs.mkdirSync(out,{recursive:true});try{
for(const viewport of viewports){
 const errors=[],{page,context}=await appPage(browser,viewport,errors,{init:probe}),prefix=viewport.width+'x'+viewport.height;
 const snap=name=>page.screenshot({path:path.join(out,prefix+'-'+name+'.png')});
 await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await snap('home');
 const nav=async id=>{if(await page.evaluate(()=>document.body.classList.contains('arcade-mode')))await page.locator('[data-world-home]').tap();await page.locator('.bottom-nav [data-nav="'+id+'"]').tap();assert.equal(await page.locator('.page.active').getAttribute('data-page'),id);assert.deepEqual(errors,[],'uncaught error at '+id);};
 for(let cycle=0;cycle<3;cycle++)for(const id of ['collection','adventure','trade','profile','adventure','arcade'])await nav(id);
 await nav('trade');await snap('trade');
 for(const selector of ['[data-trade-mode="global"]','[data-trade-mode="same"]','[data-trade-source="tcgp"]','[data-trade-source="all"]','[data-trade-view="spares"]','[data-trade-view="featured"]'])await page.locator(selector).tap();
 await page.locator('#tradeSearch').fill('Pikachu');await page.locator('#tradeSearchClear').tap();await nav('adventure');await nav('trade');await page.evaluate(()=>handleLuckyBack());assert.equal(await page.locator('.page.active').getAttribute('data-page'),'adventure');
 await nav('arcade');await snap('world');
 const venues=await page.evaluate(()=>LuckyDexArcadeWorld.VENUES.map(v=>({id:v.id,games:v.games})));
 for(const venue of venues){
  await page.evaluate(id=>{LuckyDexArcadeWorld.selectVenue(id);LuckyDexArcadeWorld.renderWorld()},venue.id);
  await page.locator('[data-enter-venue="'+venue.id+'"]').tap();
  const img=await page.locator('#arcadeVenueArt').evaluate(i=>i.complete&&i.naturalWidth>0);assert(img,'offline venue '+venue.id);await snap('venue-'+venue.id);
  for(const id of venue.games){
   await page.locator('[data-venue-game="'+id+'"]').tap();
   const control=await useful(page,games[id]);assert(control.fully&&control.hit&&control.enabled,id+' useful initial control '+JSON.stringify(control));assert.equal(control.overflow,0,id+' overflow');
   await snap(id+'-ready');
   await page.locator('#'+games[id]).tap();
   if(id==='berry')await page.waitForFunction(()=>LuckyDexBerryBlender.state().phase==='running');
   if(id==='unown')await page.waitForFunction(()=>document.querySelectorAll('[data-unown-v168]').length>0);
   if(id==='quiz')await page.waitForFunction(()=>document.getElementById('quizSprite').complete&&document.getElementById('quizSprite').naturalWidth>0);
   const loaded=await page.waitForFunction(id=>{const list=[...document.querySelectorAll('#'+id+'Game img')].filter(i=>i.getAttribute('src')&&i.getBoundingClientRect().width>0&&!i.closest('[hidden]'));return list.every(i=>i.complete&&i.naturalWidth>0)?list.map(i=>({url:i.src,loaded:true})):false;},id);
   const images=await loaded.jsonValue();assert(images.every(i=>i.loaded),id+' offline images '+JSON.stringify(images));assert(images.every(i=>i.url.startsWith('http://luckydex.test/')||i.url.startsWith('data:image/png;base64,')),id+' runtime remote images');
   await snap(id+'-running');
   await page.locator('#'+id+'Game [data-exit-game]').tap();assert.equal(await page.evaluate(()=>document.body.classList.contains('arcade-open')),false,id+' exit chrome');
   const pending=await resources(page);assert.deepEqual(pending,[],id+' leaked resources');
   await page.locator('[data-venue-game="'+id+'"]').tap();assert((await useful(page,games[id])).enabled,id+' reentry control');await page.evaluate(()=>handleLuckyBack());
   assert.deepEqual(errors,[],id+' uncaught errors');summary.push({viewport:prefix,game:id,control,images:images.length});
  }
  await page.locator('#arcadeWorldBack').tap();
 }
 // Results must fit with usable touch targets.
 await page.evaluate(()=>{LuckyDexArcadeWorld.openGame('ballDrop');LuckyDexArcadeSession.showResult('ballDrop',{title:'PRIZE MACHINE COMPLETE',metricValue:'12,345 points · 3 jackpots',coinsAwarded:3090,itemAwarded:{key:'berry',amount:3}})});
 for(const id of ['arcadeResultReplay','arcadeResultBack'])assert((await useful(page,id)).fully&&(await useful(page,id)).hit,'result '+id);await snap('result');await page.locator('#arcadeResultBack').tap();
 // Active game to unrelated app route must dispatch the same cleanup.
 await page.evaluate(()=>{LuckyDexArcadeWorld.openGame('ballDrop');LuckyDexBallDropV0180.dropBall();navigate('trade')});assert.equal(await page.evaluate(()=>LuckyDexArcadeWorld.activeGame()),null);assert.deepEqual(await resources(page),[]);
 assert.deepEqual(errors,[]);await context.close();
}
fs.writeFileSync(path.join(out,'runtime-results.json'),JSON.stringify(summary,null,2));console.log('PASS offline runtime: 3 phone viewports × 10 games, 8 venues, route cycles, reentry, touch, results and resource cleanup');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
