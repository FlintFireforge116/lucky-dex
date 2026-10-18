const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {launch,appPage}=require('../scripts/recovery-browser.cjs');
const out=path.resolve('artifacts/v0223/berry');
fs.mkdirSync(out,{recursive:true});
const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
const center=r=>({x:r.x+r.width/2,y:r.y+r.height/2});
async function main(){
 const browser=await launch(),errors=[],report=[];
 try{
  for(const size of [{width:360,height:800},{width:393,height:873},{width:412,height:915},{width:360,height:724},{width:360,height:800,fallback:true}]){
   const viewport={width:size.width,height:size.height};
   const {page,context}=await appPage(browser,viewport,errors,{init:()=>{
    window.berryTestResources={intervals:new Set(),timeouts:new Set(),listeners:new Set()};
    const si=setInterval,ci=clearInterval,st=setTimeout,ct=clearTimeout;
    window.setInterval=(fn,ms)=>{const id=si(fn,ms);berryTestResources.intervals.add(id);return id;};
    window.clearInterval=id=>{berryTestResources.intervals.delete(id);ci(id);};
    window.setTimeout=(fn,ms)=>{let id=st(()=>{berryTestResources.timeouts.delete(id);fn();},ms);berryTestResources.timeouts.add(id);return id;};
    window.clearTimeout=id=>{berryTestResources.timeouts.delete(id);ct(id);};
    const add=document.addEventListener.bind(document),remove=document.removeEventListener.bind(document);
    document.addEventListener=(type,fn,options)=>{if(/^(pointer|touch)(move|up|end|cancel)$/.test(type))berryTestResources.listeners.add(fn);add(type,fn,options);};
    document.removeEventListener=(type,fn,options)=>{berryTestResources.listeners.delete(fn);remove(type,fn,options);};
   }});
   if(size.fallback)await page.evaluate(()=>window.PointerEvent=undefined);
   const cdp=await context.newCDPSession(page);
   const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map((p,i)=>({...p,id:p.id??i,radiusX:2,radiusY:2,force:1}))});
   async function drag(from,to,cancel=false){await touch('touchStart',[from]);for(let step=1;step<=5;step++)await touch('touchMove',[{x:from.x+(to.x-from.x)*step/5,y:from.y+(to.y-from.y)*step/5}]);await touch(cancel?'touchCancel':'touchEnd',[]);}
   await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.locator('.bottom-nav [data-nav="arcade"]').tap();
   await page.waitForTimeout(450);
   await page.evaluate(()=>{Math.random=()=>0;LuckyDexArcadeWorld.openGame('berryPicker');});
   for(const mode of ['easy','normal','hard','unlimited']){
    await page.locator(`[data-berry-mode="${mode}"]`).tap();
    const layout=await page.evaluate(async({rectSource})=>{
     const rect=eval('('+rectSource+')'),nodes=[...document.querySelectorAll('[data-berry-pick]')];await Promise.all(nodes.map(b=>b.querySelector('img').decode()));
     const berries=nodes.map(b=>{const im=b.querySelector('img'),art=rect(im),canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let left=canvas.width,right=0,top=canvas.height,bottom=0;for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}return {hit:rect(b),art,visible:{width:(right-left+1)/canvas.width*art.width,height:(bottom-top+1)/canvas.height*art.height}};});
     return {stage:rect(document.getElementById('berryPickerStage')),berries,message:rect(document.getElementById('berryPickerMessage')),start:rect(document.getElementById('berryPickerStartBtn'))};
    },{rectSource:rect.toString()});
    for(const b of layout.berries){assert(b.hit.width>=56&&b.hit.height>=56,'berry must provide at least a 56px touch target');assert(Math.max(b.visible.width,b.visible.height)>=54,'visible berry pixels must be substantially larger on a phone');assert(b.hit.width>b.visible.width&&b.hit.height>b.visible.height,'touch target must exceed opaque artwork');assert(b.hit.y>=layout.stage.y+layout.stage.height*.26,'berries must occupy the reachable lower canopy');assert(b.hit.y+b.hit.height<layout.stage.y+layout.stage.height*.71,'berries must stay above requesters');}
    for(let i=0;i<layout.berries.length;i++)for(let j=i+1;j<layout.berries.length;j++){const a=layout.berries[i].hit,b=layout.berries[j].hit;assert(a.x+a.width+4<=b.x||b.x+b.width+4<=a.x||a.y+a.height+4<=b.y||b.y+b.height+4<=a.y,'all berry touch targets need separation '+JSON.stringify({viewport,mode,a,b}));}
    assert(layout.message.y+layout.message.height<=layout.start.y,'helper text must never cover Start');assert(layout.start.y+layout.start.height<=viewport.height,'Start must fit usable phone viewport');
    report.push({viewport,fallback:!!size.fallback,mode,...layout});
   }
   await page.locator('[data-berry-mode="hard"]').tap();await page.locator('#berryPickerStartBtn').tap();
   let from=center(await page.locator('[data-berry-pick="razz"]').boundingBox()),to=center(await page.locator('[data-berry-customer="0"] .amie-pokemon').boundingBox());
   await page.touchscreen.tap(from.x,from.y);
   assert.equal(await page.locator('[data-berry-pick="razz"]').getAttribute('aria-pressed'),'true','native touch tap must visibly select');
   await page.touchscreen.tap(to.x,to.y);assert.equal(await page.locator('#berryPickerCorrect').textContent(),'1','native tap then Pokemon must feed exactly once');
   await page.waitForTimeout(280);await drag(from,to);assert.equal(await page.locator('#berryPickerCorrect').textContent(),'2','native touch drag release over Pokemon must feed exactly once '+JSON.stringify(size));
   assert.equal(await page.locator('.amie-berry.selected').count(),0,'drag-generated click must not reselect a delivered berry');
   await page.waitForTimeout(280);await drag(from,{x:viewport.width/2,y:170});assert.equal(await page.locator('[data-berry-pick="razz"]').getAttribute('aria-pressed'),'true','failed drop must retain visible selection');
   await page.touchscreen.tap(to.x,to.y);assert.equal(await page.locator('#berryPickerCorrect').textContent(),'3','tap target must recover from failed drag');
   await page.waitForTimeout(280);await drag(from,to,true);assert.equal(await page.locator('.berry-drag').count(),0,'native touch cancellation must clean ghost');assert.equal(await page.locator('.amie-berry.selected').count(),1,'cancel must retain tap fallback');
   await page.touchscreen.tap(to.x,to.y);assert.equal(await page.locator('#berryPickerCorrect').textContent(),'4','tap target must recover from cancellation');
   await page.waitForTimeout(280);
   const other=center(await page.locator('[data-berry-pick="bluk"]').boundingBox());
   await touch('touchStart',[{...from,id:1}]);await touch('touchStart',[{...from,id:1},{...other,id:2}]);await touch('touchMove',[{...to,id:1},{...other,id:2}]);await touch('touchEnd',[{...other,id:2}]);await touch('touchEnd',[]);
   assert.equal(await page.locator('#berryPickerCorrect').textContent(),'5','second finger must not replace the first berry gesture');
   await page.screenshot({path:path.join(out,`${viewport.width}x${viewport.height}${size.fallback?'-fallback':''}-hard.png`)});
   await touch('touchStart',[from]);await touch('touchMove',[{x:from.x,y:from.y+30}]);
   await page.evaluate(()=>LuckyDexArcadeWorld.backFromGame(true));await touch('touchEnd',[]);
   assert.equal(await page.locator('.berry-drag').count(),0,'exit during drag must remove ghost');
   await page.waitForTimeout(450);
   assert.deepEqual(await page.evaluate(()=>Object.values(berryTestResources).map(s=>s.size)),[0,0,0],'exit must dispose run timers and gesture listeners');
   await page.evaluate(()=>LuckyDexArcadeWorld.openGame('berryPicker'));assert.equal(await page.locator('.amie-berry.selected').count(),0,'reentry must start clean');
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'layout-touch-results.json'),JSON.stringify(report,null,2));
  console.log('PASS v0.22.3 Berry: four phone/usable viewports, every mode, native tap/drag/failed-drop/cancel/multi-touch/reentry/cleanup');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
