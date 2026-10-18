const assert=require('node:assert/strict');
const {launch,appPage}=require('../scripts/recovery-browser.cjs');
const viewports=[{width:360,height:800},{width:393,height:873},{width:412,height:915},{width:360,height:720},{width:360,height:700}];
async function visibleTap(page,selector){const r=await page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {fit:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,hit:hit===el||el.contains(hit)};});assert(r.fit&&r.hit,'visible/tappable '+selector);}
(async()=>{const browser=await launch();try{for(const viewport of viewports){const errors=[],{page,context}=await appPage(browser,viewport,errors);
 await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.locator('.bottom-nav [data-nav="arcade"]').tap();
 const venueIds=await page.evaluate(()=>LuckyDexArcadeWorld.VENUES.map(v=>v.id));
 for(const id of venueIds){
  await page.evaluate(id=>{LuckyDexArcadeWorld.selectVenue(id);LuckyDexArcadeWorld.renderWorld()},id);
  const world=await page.locator('.world-scene').boundingBox();assert(world.height>=viewport.height*.35&&world.height<=viewport.height*.45+1,'world hero must be contained below 45% usable height');
  await page.locator('.world-scene img').evaluate(i=>i.decode());
  await visibleTap(page,'[data-enter-venue="'+id+'"]');await page.locator('[data-enter-venue="'+id+'"]').tap();
  const venue=await page.locator('.arcade-venue-hero').boundingBox();assert(venue.height>=viewport.height*.35&&venue.height<=viewport.height*.45+1,'venue hero must be contained below 45% usable height');
  for(const card of await page.locator('[data-venue-game]').all())await visibleTap(page,'[data-venue-game="'+await card.getAttribute('data-venue-game')+'"]');
  await page.locator('#arcadeVenueArt').evaluate(i=>i.decode());await visibleTap(page,'#arcadeWorldBack');await page.locator('#arcadeWorldBack').tap();
 }
 await page.evaluate(()=>LuckyDexArcadeWorld.openGame('fossil'));
 const grid=await page.locator('#fossilGrid').evaluate(el=>{const cells=[...el.children],r=el.getBoundingClientRect();return {cells:cells.length,columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,rows:getComputedStyle(el).gridTemplateRows.split(' ').length,rect:{w:r.width,h:r.height}}});
 assert.deepEqual([grid.cells,grid.columns,grid.rows],[108,12,9],'Fossil must be twelve columns by nine independent rows');
 const initial=await page.evaluate(()=>LuckyDexFossilMuseum.currentDig().stability);await page.locator('[data-fossil-cell="13"]').tap();assert.equal(await page.evaluate(()=>LuckyDexFossilMuseum.currentDig().stability),initial-3);
 const shape=await page.locator('#fossilGrid').evaluate(el=>[...el.children].map(c=>{const r=c.getBoundingClientRect();return {w:r.width,h:r.height,col:getComputedStyle(c).gridColumnEnd,row:getComputedStyle(c).gridRowEnd}}));
 assert(shape.every(c=>c.col==='auto'&&c.row==='auto'),'No rock cell may inherit a whole-row or multi-cell span');assert(shape.every(c=>Math.abs(c.w-c.h)<2),'all cells remain square after excavation');
 await visibleTap(page,'#fossilToolPickaxe');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);assert.deepEqual(errors,[]);await context.close();
 }console.log('PASS v0.25.0 contained heroes, useful actions and independent 12×9 Fossil cells at five usable phone viewport cases');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
