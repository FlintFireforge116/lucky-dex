const fs=require('node:fs'),path=require('node:path');
const {launch,appPage,root}=require('./recovery-browser.cjs');
const out=path.join(root,'artifacts/v0230/screens');fs.mkdirSync(out,{recursive:true});
async function fixture(page,destination,kind){await page.evaluate(({destination,kind})=>{
 const b=LuckyDexAdventureBridge,s=b.getState(),M=LuckyDexAdventureModel,A=LuckyDexAdventure;
 s.profile.xp=4000;s.inventory={...s.inventory,pokeball:20,greatball:10,ultraball:5,berry:10,potion:10};
 for(const id of [1,4,7]){const m=LuckyDexAdventureSpecies.byId[id];s.pokemon[id+':n']={...m,name:m.identifier,key:id+':n',shiny:false,count:1,level:16,xp:0};}s.team=['1:n','4:n','7:n'];
 const v=M.ensureState(s);v.activeRoam=null;v.activeExpedition=null;b.save();A.leave();A.enter();A.openDestination(destination);
 if(kind==='destination')return;
 if(['roam','reveal','rare','discovery','battle','trainer','capture'].includes(kind)){
  A.startRoam();const r=v.activeRoam;if(kind==='roam')return;
  if(kind==='discovery'){r.reveal={kind:'item',key:'potion',qty:1,claimed:true};A.enter();return;}
  const id=destination==='haunted'?94:destination==='coast'?131:destination==='volcano'?6:destination==='cave'?142:25;
  r.reveal={kind:'pokemon',seed:102,enemy:{...LuckyDexAdventureSpecies.byId[id],level:12,shiny:kind==='rare',rare:kind==='rare',tier:kind==='rare'?'rare':'normal'}};A.enter();
  if(['battle','trainer','capture'].includes(kind)){A.engage();const f=r.battle;if(kind==='trainer'){f.kind='trainer';f.trainer={name:'Bug Catcher Eli',classKey:'bug_catcher'};A.enter();}}
  return;
 }
 A.startExpedition();const r=v.activeExpedition;if(kind==='route')return;
 const type=kind==='boss-approach'||kind==='boss'?'boss':kind==='perk'?'cache':kind==='summary'?'boss':kind;
 const n=r.route.nodes.find(n=>n.type===type)||r.route.nodes.find(n=>n.type==='event');r.currentNode=n.id;r.pending={nodeId:n.id,type:n.type};r.phase=type==='boss'?'battle':type;
 if(type==='cache'){r.resolutions[n.id]={claimed:true};M.offerPerk(r,['compass','quickClaw']);}
 if(type==='camp'){r.party.forEach(p=>r.hpByKey[p.key]=Math.round(p.maxHp*.65));}
 if(kind==='summary'){r.phase='complete';r.pending=null;r.completed=r.route.nodes.filter(n=>n.lane===0&&n.depth>0).map(n=>n.id);r.loot={...r.loot,coins:210,xp:140,battles:4,rooms:7,catches:[{id:25,name:'Pikachu'}],items:{berry:2,potion:1}};}
 b.save();A.enter();
 },{destination,kind});if(kind==='boss')await page.locator('[data-adv-action="boss-engage"]').tap();}
(async()=>{const browser=await launch(),errors=[],layout=[];try{
 for(const viewport of [{width:360,height:800},{width:393,height:873},{width:412,height:915},{width:320,height:640}]){
  const {page,context}=await appPage(browser,viewport,errors);await page.locator('#titleContinueBtn').tap();await page.locator('#starterChoices button').first().tap();await page.waitForTimeout(2200);
  await page.screenshot({path:path.join(out,`${viewport.width}-map.png`)});
  for(const d of ['meadow','cave','haunted','coast','volcano']){await fixture(page,d,'destination');await page.waitForTimeout(260);await page.screenshot({path:path.join(out,`${viewport.width}-${d}.png`)});}
  for(const kind of ['roam','reveal','rare','discovery','battle','trainer','route','event','camp','perk','boss-approach','boss','summary']){
   await fixture(page,'meadow',kind);await page.waitForTimeout(350);await page.screenshot({path:path.join(out,`${viewport.width}-${kind}.png`)});
   const metrics=await page.evaluate(()=>{const host=document.querySelector('#adventureRoot');return {view:LuckyDexAdventure.snapshot().view,overflow:document.documentElement.scrollWidth>innerWidth,missing:[...host.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),root:host.getBoundingClientRect().toJSON(),buttons:[...host.querySelectorAll('.adv-foot button,.adv-event-choices button,.adv-camp-controls button')].map(b=>({text:b.textContent.trim(),box:b.getBoundingClientRect().toJSON()}))};});layout.push({viewport,kind,...metrics});
  }
  await fixture(page,'meadow','battle');await page.locator('[data-adv-command="battle-bag"]').tap();await page.screenshot({path:path.join(out,`${viewport.width}-bag.png`)});
  await page.evaluate(()=>{const f=LuckyDexAdventureBridge.getState().adventureV2.activeRoam.battle;f.enemy.hp=1;f.enemy.maxHp=50;f.rng=100;});
  const capture=page.evaluate(()=>LuckyDexAdventure.act('ball',{key:'ultraball'}));await page.waitForTimeout(260);await page.screenshot({path:path.join(out,`${viewport.width}-capture.png`)});await capture;
  await context.close();
 }
 fs.writeFileSync(path.join(out,'layout.json'),JSON.stringify({errors,layout},null,2));
 if(errors.length||layout.some(m=>m.overflow||m.missing.length))throw Error(JSON.stringify({errors,failures:layout.filter(m=>m.overflow||m.missing.length)}));
 console.log('PASS 4 viewport Adventure screenshot matrix; no horizontal overflow/missing rendered images');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
