const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {launch,open,settle}=require('./adventure3-browser-utils.cjs');
const expectedPath=['New Bark Town','Route 29','Cherrygrove City','Route 30','Route 31','Sprout Tower','Violet City','Violet Gym'];
function prepared(){if(localStorage.getItem('luckyDexV0402Acceptance'))return;localStorage.setItem('luckyDexV0402Acceptance','1');localStorage.setItem('luckyDexSave',JSON.stringify({saveVersion:7,settings:{reducedMotion:true,vibration:false},pokemon:{'3:n':{id:3,name:'Venusaur',level:30,count:1},'6:n':{id:6,name:'Charizard',level:30,count:1},'9:n':{id:9,name:'Blastoise',level:30,count:1}},team:['3:n','6:n','9:n'],profile:{coins:1000,xp:4000},inventory:{potion:7,pokeball:20,berry:5}}))}
async function snapshot(page){return page.evaluate(()=>{
 const root=document.querySelector('.adv3-journey'),pane=document.querySelector('.adv3-journey-content'),feedback=document.querySelector('.adv3-location-feedback'),figure=document.querySelector('.adv3-place-vignette'),floor=figure&&getComputedStyle(figure).backgroundImage;
 return {title:document.querySelector('.adv3-head h2')?.textContent,view:root?.dataset.advView,place:root?.dataset.locationId,kind:root?.dataset.locationKind,text:document.querySelector('#adventureRoot').innerText,
  actions:[...document.querySelectorAll('.adv3-location-actions button')].map(b=>({key:b.dataset.locationAction,label:b.textContent.trim(),disabled:b.disabled})),
  tools:[...document.querySelectorAll('.adv3-location-tools button')].map(b=>({screen:b.dataset.screen,action:b.dataset.journeyAction,label:b.textContent.trim()})),
  feedback:feedback?.textContent||'',feedbackPlace:feedback?.dataset.feedbackPlace,next:document.querySelector('[data-journey-action="continue"]')?.textContent,sceneFloor:floor?.startsWith('url("')?floor.slice(5,-2):'',
  horizontalOverflow:document.documentElement.scrollWidth>innerWidth,documentOverflow:document.documentElement.scrollHeight>innerHeight+1,paneOverflow:pane?pane.scrollHeight-pane.clientHeight:0,
  footer:[...document.querySelectorAll('.adv3-foot button')].map(b=>{const r=b.getBoundingClientRect();return {label:b.textContent,bottom:r.bottom,top:r.top}}),
  journey:{phase:state.adventureRegional.active.phase,badges:state.adventureRegional.active.badges,depth:state.adventureRegional.active.depth,party:state.adventureRegional.active.party.map(p=>({level:p.level,hp:p.hp,maxHp:p.maxHp,pp:p.pp}))}};
 })}
function assertMenu(s,viewport){
 assert(!s.horizontalOverflow&&!s.documentOverflow,s.title+' stays in viewport');
 assert(s.footer.every(b=>b.top>=0&&b.bottom<=viewport.height+1),s.title+' travel control stays visible');
 if(s.view!=='journey')return;
 if(s.sceneFloor){const url=new URL(s.sceneFloor),assetRoot=path.resolve(__dirname,'../app/src/main/assets'),file=path.resolve(assetRoot,decodeURIComponent(url.pathname).slice(1));assert.equal(url.hostname,'luckydex.test',s.title+' floor remains local');assert(file.startsWith(assetRoot+path.sep)&&fs.existsSync(file),s.title+' floor asset URL exists in the offline package')}
 assert(s.place,s.title+' has one authoritative place id');assert(s.actions.length<=6,s.title+' has at most six primary actions');
 assert(s.actions.every(a=>!a.disabled||/opens after|requires|complete/i.test(a.label)),s.title+' has no disabled filler');
 assert(!/REST WITH GUIDE|REST & CONTINUE|supply stop|LOCATION COMPLETE|CONTINUE JOURNEY/i.test(s.text),s.title+' has concrete copy');
 assert(!s.actions.some(a=>/^(PARTY|BAG|MAP|REGION MAP)$/.test(a.label)),s.title+' primary actions are local');
 for(const key of ['party','bag'])assert.equal(s.tools.filter(t=>t.screen===key).length,1,s.title+' one '+key+' tool');
 assert.equal(s.tools.filter(t=>t.action==='regions').length,1,s.title+' one Map tool');
 assert.equal(new Set(s.actions.map(a=>a.key)).size,s.actions.length,s.title+' has no duplicate local action');
 assert(s.actions.filter(a=>/MART/.test(a.label)).length<=1,s.title+' has one meaningful shop');
 if(s.feedback)assert.equal(s.feedbackPlace,s.place,s.title+' feedback belongs to the current place');
 if(viewport.width>=360)assert(s.paneOverflow<=2,s.title+' primary content needs no scrolling');
}
async function chooseBattleAction(page){
 const chosen=await page.evaluate(()=>{
  const f=state.adventureRegional.active.battle,p=f.party.find(p=>p.key===f.leadKey),D=LuckyDexMoveData.moves,B=LuckyDexAdventureBattle;
  if(p.hp<p.maxHp*.35&&state.inventory.potion>0)return {kind:'potion'};
  const rows=f.party.filter(p=>p.hp>0).map(p=>{const moves=p.moves.filter(id=>p.pp[id]>0&&D[id].damageClass!=='status').map(id=>({id,score:(D[id].power||40)*B.effectiveness(D[id].type,f.enemy.types)*(p.types.includes(D[id].type)?1.1:1)*(D[id].accuracy||100)/100})).sort((a,b)=>b.score-a.score);return {key:p.key,move:moves[0]||{id:165,score:15}}}).sort((a,b)=>b.move.score-a.move.score),selected=rows.find(r=>r.key===p.key),best=rows[0];
  if(best.key!==p.key&&best.move.score>selected.move.score*1.7&&p.hp>p.maxHp*.4)return {kind:'switch',key:best.key};
  return {kind:'move',id:selected.move.id,enemy:f.enemy.name,pp:p.pp[selected.move.id]};
 });
 if(chosen.kind==='potion'){await page.locator('[data-adv-command="battle-bag"]').click();await page.locator('[data-battle-drawer="bag"] [data-adv-battle="potion"]').click()}
 else if(chosen.kind==='switch'){await page.locator('[data-adv-command="battle-switch"]').click();await page.locator(`[data-battle-drawer="switch"] [data-adv-battle="switch"][data-key="${chosen.key}"]`).click()}
 else{await page.locator('[data-adv-command="battle-fight"]').click();await page.locator(`[data-battle-drawer="fight"] [data-move-id="${chosen.id}"]`).click()}
 await settle(page);return chosen;
}
async function playFirstGym(page,viewport={width:360,height:640},{output,capture=true}={}){
 const records=[],travel=[],battleActions=[];let count=0;
 async function record(name){await page.waitForFunction(()=>[...document.querySelectorAll('#adventureRoot img')].every(i=>i.complete&&i.naturalWidth>0));const s=await snapshot(page);assertMenu(s,viewport);records.push({name,...s});if(output&&capture){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,`${viewport.width}x${viewport.height}-${String(++count).padStart(2,'0')}-${name}.png`)});}return s}
 await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();await page.locator('[data-region="johto"]').click();
 assert.deepEqual(await page.evaluate(()=>state.adventureRegional.active.party.map(p=>p.level)),[8,8,8],'prepared owned levels synchronize to8');
 let s=await record('new-bark-town');assert(!s.actions.some(a=>/CENTER/.test(a.label)),'New Bark has no fake Center');
 for(const tool of ['party','bag']){await page.locator(`.adv3-location-tools [data-screen="${tool}"]`).click();assert.equal(await page.locator(`[data-tool-screen="${tool}"]`).count(),1);await page.locator('[data-tool-action="back"]').first().click();assert.equal((await snapshot(page)).title,'New Bark Town',tool+' returns to exact place')}
 await page.locator('.adv3-location-tools [data-journey-action="regions"]').click();await page.locator('[data-region="johto"]').click();assert.equal((await snapshot(page)).title,'New Bark Town','Map resumes the same persistent region');
 await page.locator('[data-location-action="talk"]').click();await record('new-bark-feedback');assert.equal((await snapshot(page)).title,'New Bark Town','talk stays local');
 await page.locator('[data-journey-action="continue"]').click();s=await record('route29-after-travel');assert.equal(s.feedback,'','talk feedback clears when moving');
 travel.push('New Bark Town');
 for(let step=0;step<180;step++){
  s=await snapshot(page);if(s.title&&expectedPath.includes(s.title)&&travel.at(-1)!==s.title){travel.push(s.title);await record(s.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'));if(s.title==='Route 30'){const saved={place:s.place,depth:s.journey.depth,next:s.next};await page.reload();await page.locator('#titleContinueBtn').click();await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();s=await record('route30-after-reload');assert.deepEqual({place:s.place,depth:s.journey.depth,next:s.next},saved,'route progress remains persistent across reload');await page.locator('.adv3-location-tools [data-journey-action="regions"]').click();assert.match(await page.locator('[data-region="johto"]').innerText(),/Route 30/,'Map uses the authoritative saved waypoint');await page.locator('[data-region="johto"]').click();s=await snapshot(page);assert.equal(s.place,saved.place,'Map resumes saved waypoint')}}
  if(s.view==='result'&&s.journey.badges===1){await record('badge-milestone');assert.match(s.title,/Badge earned/);assert.equal(await page.locator('.adv3-location-feedback').count(),0);await page.reload();await page.locator('#titleContinueBtn').click();await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();assert.equal((await snapshot(page)).view,'result','badge milestone survives reload');break}
  assert(!/Party recovered/.test(s.title||''),'prepared first chapter should not depend on injected recovery');
  if(s.journey.phase==='battle'){battleActions.push(await chooseBattleAction(page));continue}
  if(s.view==='gym-prep'){await record('violet-gym-preparation');await page.locator('[data-journey-action="challenge"]').click();continue}
  if(s.view==='section'){const choice=page.locator('[data-journey-action="resolve"][data-choice="safe"]');assert(await choice.count(),'ordinary authored section offers a safe choice');await choice.click();continue}
  assert.equal(s.view,'journey','ordinary chapter remains a journey menu');
  if(s.title==='Violet City'){const gym=page.locator('[data-location-action="gym"]');assert.equal(await gym.count(),1,'Violet City exposes its real Gym');assert(await gym.isEnabled(),'Gym availability never requires an arbitrary Center visit');assert(!/Rest first/.test(s.text),'Gym copy has no rest gate')}
  const center=page.locator('[data-location-action="center"]');if(await center.count()&&!records.some(r=>r.name===s.title+'-center')){await center.click();await record(s.title+'-center');s=await snapshot(page)}
  const localGym=page.locator('[data-location-action="gym"]');
  if(await localGym.count()){await localGym.click();continue}
  const next=page.locator('[data-journey-action="continue"]');
  if(await next.count()&&await next.isEnabled()){const previous=s.place;assert(!/^CONTINUE(?: JOURNEY)?$/.test(await next.innerText()),'onward action names its next destination');await next.click();const after=await snapshot(page);if(after.place&&previous!==after.place)assert.equal(after.feedback,'','routine feedback clears on every named movement');continue}
  const action=page.locator('[data-location-action="battle"], [data-location-action="gym"]');assert.equal(await action.count(),1,s.title+' has one required battle/challenge action');await action.click();
 }
 assert.deepEqual(travel,expectedPath,'exact coherent first-Gym chapter');assert.equal((await snapshot(page)).journey.badges,1,'Falkner badge earned by actual battle turns');assert(battleActions.length>0,'real reducer moves were played');
 return {viewport,travel,battleActions,records,method:'Ordinary UI start, local talk, tools, healing, travel, battle drawers and PP-bearing effective moves. Prepared owned Venusaur/Charizard/Blastoise Lv30 synchronize to8. No injected battle victories, grants or recovery.'};
}
async function run({viewports=[{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:320,height:568},{width:768,height:1024}],output='artifacts/v0402/acceptance'}={}){
 const out=path.resolve(__dirname,'..',output),browser=await launch(),runs=[];try{for(const viewport of viewports){const {page,context,errors}=await open(browser,viewport,{init:prepared});try{const firstGym=await playFirstGym(page,viewport,{output:out});firstGym.spotChecks=await captureSpotChecks(page,viewport,out);runs.push(firstGym);assert.deepEqual(errors,[]);console.log(`PASS actual first-Gym chapter + regional spots ${viewport.width}x${viewport.height}`)}catch(e){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,`${viewport.width}x${viewport.height}-failure.png`)});fs.writeFileSync(path.join(out,'failure.html'),await page.content());fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({viewport,message:e.message,snapshot:await snapshot(page),errors},null,2));throw e}finally{await context.close()}}}finally{await browser.close()}
 fs.writeFileSync(path.join(out,'acceptance.json'),JSON.stringify({runs},null,2));return runs;
}
async function captureSpotChecks(page,viewport,out){
 const rows=[];
 for(const [region,name] of [['kanto','Pallet Town'],['kanto','Route 1'],['hoenn','Petalburg City'],['hoenn','Route 124'],['johto','Union Cave'],['johto','Azalea Town']]){
  await page.evaluate(({region,name})=>{const E=LuckyDexRegionalEngine,j=E.start(state,region,73),n=j.nodes.find(n=>!n.optional&&n.name===name);j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';j.recovery=null;j.location=name;save();LuckyDexAdventure.regional()},{region,name});
  await page.waitForFunction(()=>[...document.querySelectorAll('#adventureRoot img')].every(i=>i.complete&&i.naturalWidth>0));
  const s=await snapshot(page);assertMenu(s,viewport);assert.equal(s.title,name);await page.screenshot({path:path.join(out,`${viewport.width}x${viewport.height}-spot-${region}-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.png`)});rows.push({name,region,fixture:'Pre-existing authored-node selection for presentation only; never used for first-Gym combat acceptance.',...s});
 }
 return rows;
}
module.exports={prepared,snapshot,assertMenu,chooseBattleAction,playFirstGym,captureSpotChecks,run,expectedPath};if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1});
