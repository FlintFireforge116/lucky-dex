const fs=require('node:fs'),path=require('node:path');
const {launch,createPage,start}=require('./tcgp-browser-fixture.cjs');
(async()=>{const browser=await launch();try{const {page,context,errors}=await createPage(browser);const report=await page.evaluate(()=>{
 const D=LuckyDexTCGPBattleData,W=LuckyDexTCGPDeckWorkspace,S=LuckyDexTCGPBattleSolo;
 state.cards=Object.fromEntries(D.PRINTS.map(p=>[p.id,{id:p.id,source:'tcgp',count:2}]));const rows=W.catalogue(D.projectOwnedCards(state.cards));
 const bench=(name,fn,n=50)=>{const samples=[];for(let i=0;i<n;i++){const t=performance.now();fn(i);samples.push(performance.now()-t);}samples.sort((a,b)=>a-b);return {name,samples:n,medianMs:samples[Math.floor(n/2)],p95Ms:samples[Math.floor(n*.95)]};};
 const timings=[bench('combined filter',()=>W.query(rows,{filters:{owned:true,types:['Water']},search:'attack',sort:'hp'})),bench('search warm cache',()=>W.query(rows,{search:'Pikachu',filters:{owned:true}})),bench('recipe list',()=>W.RECIPES.map(r=>W.recipe(r.cards,rows))),bench('Solo engine startup',i=>S.createBattle({seed:i}),100)];
 const t=performance.now();document.querySelector('[data-tcgp-action="build"]').click();timings.push({name:'open editor populated collection',elapsedMs:performance.now()-t});
 return {environment:'Desktop Chrome headless; full owned catalogue; timings are not Android-device measurements',canonicalRows:rows.length,timings};
 });
 await page.screenshot({path:'artifacts/v06937/editor-393.png'});await page.click('[data-deck="manage"]');await page.click('[data-deck="close-sheet"]');
 await page.click('#tcgpBattleBack');await page.screenshot({path:'artifacts/v06937/home-393.png'});await start(page,{mode:'battle'});await page.screenshot({path:'artifacts/v06937/battle-393.png'});
 report.browserErrors=errors;fs.writeFileSync('artifacts/v06937/performance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await context.close();}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
