const test=require('node:test'),assert=require('node:assert/strict'),{launch,createPage,start}=require('../scripts/tcgp-browser-fixture.cjs');
test('all requested portrait sizes keep setup/live anchors disjoint, on-screen and fixed with full benches and varying hands',async()=>{
 const browser=await launch();try{const {page,context,errors}=await createPage(browser);for(const [width,height] of [[360,720],[360,800],[393,873],[412,915],[430,932]]){await page.setViewportSize({width,height});for(const mode of ['setup','battle'])for(const handCount of mode==='setup'?[5]:[1,3,5,10,20]){await start(page,{mode,handCount});const issues=await page.evaluate(()=>{
   const rect=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};},arena=document.querySelector('.tcgp-live-arena'),a=rect(arena),problems=[];
   if(getComputedStyle(arena).display!=='grid')problems.push('arena is not an explicit grid');
   const sels=['.tcgp-live-opponent-top','.tcgp-live-opponent-bench','.tcgp-live-opponent-active','.tcgp-live-mid','.tcgp-live-player-active','.tcgp-live-player-bench','.tcgp-live-player-bottom'];const boxes=sels.map(s=>({s,...rect(document.querySelector(s))}));
   for(const b of boxes)if(b.y<a.y-.5||b.bottom>a.bottom+.5||b.x<a.x-.5||b.right>a.right+.5)problems.push(b.s+' escapes arena');
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const b=boxes[i],c=boxes[j];if(Math.min(b.right,c.right)-Math.max(b.x,c.x)>1&&Math.min(b.bottom,c.bottom)-Math.max(b.y,c.y)>1)problems.push(b.s+' overlaps '+c.s);}
   for(const s of ['.tcgp-live-opponent-bench','.tcgp-live-player-bench'])if(document.querySelector(s).children.length!==3)problems.push(s+' lacks three anchors');
   const bottom=['.tcgp-live-piles.mine','.tcgp-live-hand','.tcgp-live-energy-source'].map(s=>({s,...rect(document.querySelector(s))}));for(let i=0;i<bottom.length;i++)for(let j=i+1;j<bottom.length;j++)if(Math.min(bottom[i].right,bottom[j].right)-Math.max(bottom[i].x,bottom[j].x)>1)problems.push('hand/piles/Energy overlap');
   for(const n of document.querySelectorAll('.tcgp-live-card-wrap')){const r=rect(n),zone=rect(n.parentElement);if(r.y<zone.y-.5||r.bottom>zone.bottom+.5)problems.push(n.dataset.boardSlot+' escapes own zone');for(const child of n.children){const c=rect(child);if(c.y<r.y-.5||c.bottom>r.bottom+.5)problems.push('card/action escapes own anchor');}}
   for(const n of document.querySelectorAll('.tcgp-live-pile')){const r=rect(n),c=rect(n.querySelector('.tcgp-live-pile-card'));if(Math.abs(r.x-c.x)>.5||Math.abs(r.y-c.y)>.5||Math.abs(r.w-c.w)>.5||Math.abs(r.h-c.h)>.5)problems.push(n.className+' artwork/outline escapes pile footprint');}
   for(const n of document.querySelectorAll('.tcgp-live-card,.tcgp-live-pile,.tcgp-live-hand-card')){const r=rect(n);if(!n.closest('.tcgp-live-hand')&&(r.y<a.y-.5||r.bottom>a.bottom+.5))problems.push(n.className+' offscreen');}
   if(document.documentElement.scrollHeight>innerHeight+1||document.body.scrollHeight>innerHeight+1)problems.push('page grows vertically');const h=document.querySelector('.tcgp-live-hand');if(h.scrollHeight>h.clientHeight+1)problems.push('hand clips vertically');
   return problems;
  });assert.deepEqual(issues,[],`${width}x${height} ${mode} hand${handCount}`);}}assert.deepEqual(errors,[]);await context.close();}finally{await browser.close();}
});
