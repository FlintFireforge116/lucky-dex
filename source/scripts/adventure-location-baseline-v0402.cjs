const fs=require('node:fs'),path=require('node:path');
const {launch,open}=require('./adventure3-browser-utils.cjs');
const output=path.resolve(__dirname,'../artifacts/v0402/before');
async function run(){
 fs.mkdirSync(output,{recursive:true});const browser=await launch(),results=[];
 try{for(const viewport of [{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:320,height:568},{width:768,height:1024}]){
  const {page,context,errors}=await open(browser,viewport);
  try{
   await page.locator('[data-nav="adventure"]').click();
   await page.evaluate(()=>{LuckyDexRegionalEngine.start(state,'johto',73);save();LuckyDexAdventure.regional()});
   async function capture(name){
    await page.waitForFunction(()=>[...document.querySelectorAll('#adventureRoot img')].every(i=>i.complete&&i.naturalWidth>0));
    const snapshot=await page.evaluate(()=>({title:document.querySelector('.adv3-head h2')?.textContent,text:document.querySelector('#adventureRoot').innerText,kind:document.querySelector('.adv3-journey')?.dataset.locationKind,scene:getComputedStyle(document.querySelector('.adv3-journey')).getPropertyValue('--scene'),actions:[...document.querySelectorAll('.adv3-location-actions button')].map(b=>({action:b.dataset.journeyAction,label:b.textContent,disabled:b.disabled,screen:b.dataset.screen})),tools:[...document.querySelectorAll('.adv3-route-tools button')].map(b=>b.textContent),feedback:document.querySelector('.adv3-feedback')?.textContent||'',next:document.querySelector('.adv3-next')?.textContent,footer:[...document.querySelectorAll('.adv3-foot button')].map(b=>b.textContent),horizontalOverflow:document.documentElement.scrollWidth>innerWidth,documentOverflow:document.documentElement.scrollHeight>innerHeight+1,phase:state.adventureRegional.active.phase,depth:state.adventureRegional.active.depth}));
    await page.screenshot({path:path.join(output,`${viewport.width}x${viewport.height}-${name}.png`)});
    results.push({viewport,name,...snapshot,errors:[...errors]});
   }
   await capture('01-new-bark-town');
   await page.locator('[data-journey-action="talk"]').click();
   await capture('02-route29-after-talk');
   await page.evaluate(()=>{const j=state.adventureRegional.active,n=j.nodes.find(n=>!n.optional&&n.name==='Cherrygrove City');j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.phase='map';j.location=n.name;save();LuckyDexAdventure.regional()});
   await capture('03-cherrygrove-city-fixture');
   await page.evaluate(()=>{const j=state.adventureRegional.active,n=j.nodes.find(n=>!n.optional&&n.name==='Union Cave');j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.phase='map';j.location=n.name;save();LuckyDexAdventure.regional()});
   await capture('04-union-cave-fixture');
   await page.evaluate(()=>{const j=state.adventureRegional.active,n=j.nodes.find(n=>!n.optional&&n.name==='Azalea Town');j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.phase='map';j.location=n.name;save();LuckyDexAdventure.regional()});
   await capture('05-azalea-city-fixture');
  }finally{await context.close()}
 }}finally{await browser.close()}
 const findings={disabledFiller:results.filter(r=>r.actions.some(a=>a.disabled)).map(r=>r.name),fakeCenter:results.filter(r=>r.name==='01-new-bark-town'&&r.actions.some(a=>/CENTER/.test(a.label))),awkwardRest:results.filter(r=>/REST WITH GUIDE|REST & CONTINUE/.test(r.text)).map(r=>r.name),staleAfterTalk:results.filter(r=>r.name==='02-route29-after-talk'&&/Party rested with the guide/.test(r.feedback)),duplicateShops:results.filter(r=>r.actions.filter(a=>/MART/.test(a.label)).length>1).map(r=>r.name)};
 fs.writeFileSync(path.join(output,'baseline-audit.json'),JSON.stringify({method:'Untouched v0.40.1 actual Chrome. Start/talk are user actions; city/cave fixtures only select pre-existing nodes to inspect baseline menus, and never simulate battle acceptance.',results,findings},null,2));
 console.log(JSON.stringify({captures:results.length,findings:{disabledFiller:findings.disabledFiller.length,fakeCenter:findings.fakeCenter.length,awkwardRest:findings.awkwardRest.length,staleAfterTalk:findings.staleAfterTalk.length,duplicateShops:findings.duplicateShops.length}},null,2));
}
module.exports={run};if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1});
