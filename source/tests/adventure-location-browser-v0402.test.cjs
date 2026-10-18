const assert=require('node:assert/strict'),{test}=require('node:test');
const {launch,open}=require('../scripts/adventure3-browser-utils.cjs');

async function withJohto(check){const browser=await launch();const {page,context,errors}=await open(browser,{width:360,height:640});try{await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();await page.locator('[data-region="johto"]').click();await check(page);assert.deepEqual(errors,[])}finally{await context.close();await browser.close()}}

test('v0402 starting town has at most six valid local actions, truthful services, and a separate unique tool strip',()=>withJohto(async page=>{
 const primary=page.locator('.adv3-location-actions button');assert((await primary.count())<=6,'at most six primary actions');
 assert.equal(await page.locator('.adv3-location-actions button[disabled]').count(),0,'unavailable filler is hidden');
 const labels=await primary.allTextContents();assert(!labels.some(s=>/CENTER|REST WITH GUIDE|REST & CONTINUE/.test(s)),'New Bark has no fake Center or guide rest');
 assert(!labels.some(s=>/^(PARTY|BAG|MAP|REGION MAP)$/.test(s.trim())),'universal tools are outside primary actions');
 for(const key of ['party','bag'])assert.equal(await page.locator(`.adv3-location-tools [data-journey-action="tools"][data-screen="${key}"]`).count(),1,key+' appears exactly once in the tool strip');
 assert.equal(await page.locator('.adv3-location-tools [data-journey-action="regions"]').count(),1,'Map appears exactly once');
 assert.match(await page.locator('.adv3-foot [data-journey-action="continue"]').innerText(),/Route 29/i,'travel names its destination');
}));

test('v0402 local talk stays at its place and feedback clears on named travel',()=>withJohto(async page=>{
 const before=await page.locator('.adv3-head h2').innerText();
 await page.locator('[data-journey-action="location"][data-location-action="talk"]').click();
 assert.equal(await page.locator('.adv3-head h2').innerText(),before,'talk does not silently travel');
 const feedback=page.locator('.adv3-location-feedback');assert.equal(await feedback.count(),1,'local feedback appears');
 assert.equal(await feedback.getAttribute('data-feedback-place'),await page.locator('[data-location-id]').getAttribute('data-location-id'),'feedback belongs to current authoritative place');
 const text=await feedback.innerText();assert(text.trim(),'feedback is concise and useful');
 await feedback.locator('button').click();assert.equal(await page.locator('.adv3-location-feedback').count(),0,'explicit dismissal clears local feedback');
 await page.locator('[data-journey-action="location"][data-location-action="talk"]').click();
 await page.locator('[data-journey-action="continue"]').click();
 assert.equal(await page.locator('.adv3-head h2').innerText(),'Route 29');assert.equal(await page.locator('.adv3-location-feedback').count(),0,'routine talk feedback clears on movement');
 assert.equal(await page.locator('.adv3-location-actions button').filter({hasText:/FISH/}).count(),0,'Route29 cannot fish without explicit water data');
}));

test('v0402 authoritative location flow exposes New Bark identity and its real destination',()=>withJohto(async page=>{
 const result=await page.evaluate(()=>{const F=window.LuckyDexLocationFlow,j=state.adventureRegional.active;if(!F)return {loaded:false};return {loaded:true,place:F.describe(j),moduleMethods:['describe','actionsFor','perform','continue','settleRoutine','feedbackFor','dismiss','sceneFor'].filter(k=>typeof F[k]!=='function')}});
 assert(result.loaded,'location flow module is loaded');assert.deepEqual(result.moduleMethods,[]);
 assert.equal(result.place.name,'New Bark Town');assert.equal(result.place.kind,'town');assert.equal(result.place.nextLabel,'Route 29');
}));

test('v0402 first-Gym chapter completes through ordinary UI travel and real PP-bearing battle moves',async()=>{
 const {prepared,playFirstGym}=require('../scripts/adventure-location-acceptance-v0402.cjs'),browser=await launch();
 const {page,context,errors}=await open(browser,{width:360,height:640},{init:prepared});
 try{await playFirstGym(page,{width:360,height:640},{capture:false});assert.deepEqual(errors,[])}finally{await context.close();await browser.close()}
});

test('v0402 optional authored exploration dialogue can leave without guide healing or a dead end',()=>withJohto(async page=>{
 // Select an existing later authored event solely to inspect its dialog. Core
 // first-Gym acceptance above always starts normally and plays actual battles.
 await page.evaluate(()=>{const j=state.adventureRegional.active,n=j.nodes.find(n=>!n.optional&&n.name==='Slowpoke Well');j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';j.location=n.name;save();LuckyDexAdventure.regional()});
 await page.locator('[data-location-action="explore"]').click();assert.equal(await page.locator('[data-adv-view="section"]').count(),1,'authored exploration opens one short choice dialog');
 assert(!/local guide|rest with guide|rest & continue/i.test(await page.locator('.adv3-local-dialog').innerText()),'exploration dialogue uses factual place copy');
 // Entering an authored chapter normally synchronizes the owned levels to its
 // cap. Compare after that existing synchronization, before choosing to leave.
 const before=await page.evaluate(()=>({hp:state.adventureRegional.active.party.map(p=>p.hp),coins:state.profile.coins,potions:state.inventory.potion}));
 await page.locator('[data-adv-view="section"] [data-journey-action="continue"]').click();
 assert.equal(await page.locator('[data-adv-view="section"]').count(),0,'Leave is functional and exits the dialog');
 assert.equal(await page.locator('.adv3-head h2').innerText(),'Azalea Town','Leave travels to the semantic next place');
 assert.deepEqual(await page.evaluate(()=>({hp:state.adventureRegional.active.party.map(p=>p.hp),coins:state.profile.coins,potions:state.inventory.potion})),before,'leaving neither heals nor pays optional rewards');
}));

test('v0402 completed authored home recovery hides its unavailable action',()=>withJohto(async page=>{
 // Later authored home checkpoint is a secondary presentation fixture.
 await page.evaluate(()=>{const E=LuckyDexRegionalEngine,j=E.start(state,'kanto',73),n=j.nodes.find(n=>!n.optional&&n.name==='Pallet Town'&&n.type==='camp');j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';j.location=n.name;save();LuckyDexAdventure.regional()});
 await page.locator('[data-location-action="heal"]').click();
 assert.equal(await page.locator('.adv3-head h2').innerText(),'Pallet Town','home recovery remains local');
 assert.equal(await page.locator('[data-location-action="heal"]').count(),0,'completed home recovery is hidden once it cannot perform');
 assert(await page.locator('[data-journey-action="continue"]').isEnabled(),'onward travel remains available');
}));

test('v0402 dismissed home recovery stays dismissed through rerender and reload',()=>withJohto(async page=>{
 await page.locator('[data-location-action="heal"]').click();assert.equal(await page.locator('.adv3-location-feedback').count(),1,'home recovery has one local message');
 await page.locator('.adv3-location-feedback button').click();assert.equal(await page.locator('.adv3-location-feedback').count(),0);
 const paid=await page.evaluate(()=>({coins:state.profile.coins,inventory:state.inventory,party:state.adventureRegional.active.party}));
 await page.locator('.adv3-location-tools [data-screen="party"]').click();await page.locator('[data-tool-action="back"]').first().click();
 assert.equal(await page.locator('.adv3-location-feedback').count(),0,'ordinary tool return does not recreate dismissed result feedback');
 await page.reload();await page.locator('#titleContinueBtn').click();await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();
 assert.equal(await page.locator('.adv3-head h2').innerText(),'New Bark Town');assert.equal(await page.locator('.adv3-location-feedback').count(),0,'serialized routine result respects dismissal');
 assert.deepEqual(await page.evaluate(()=>({coins:state.profile.coins,inventory:state.inventory,party:state.adventureRegional.active.party})),paid,'rerender/reload cannot repeat recovery or rewards');
}));

test('v0402 authored exploration risk keeps its existing reward-or-damage contract and grants no healing',()=>withJohto(async page=>{
 await page.evaluate(()=>{const j=state.adventureRegional.active,n=j.nodes.find(n=>!n.optional&&n.name==='Slowpoke Well');j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';j.location=n.name;save();LuckyDexAdventure.regional()});
 await page.locator('[data-location-action="explore"]').click();
 const before=await page.evaluate(()=>({coins:state.profile.coins,inventory:state.inventory,party:state.adventureRegional.active.party.map(p=>({hp:p.hp,maxHp:p.maxHp}))}));
 await page.locator('[data-journey-action="resolve"][data-choice="risk"]').click();
 assert.equal(await page.locator('.adv3-head h2').innerText(),'Slowpoke Well','exploration resolves locally');
 const after=await page.evaluate(()=>({coins:state.profile.coins,inventory:state.inventory,party:state.adventureRegional.active.party.map(p=>({hp:p.hp,maxHp:p.maxHp}))}));
 assert.deepEqual(after.inventory,before.inventory,'exploration does not inject supplies');
 if(after.coins>before.coins){assert.equal(after.coins-before.coins,85,'chapter2 purse retains existing reward');assert.deepEqual(after.party,before.party,'finding supplies does not heal');}
 else{assert.equal(after.coins,before.coins);assert.deepEqual(after.party,before.party.map(p=>({...p,hp:Math.max(1,p.hp-Math.round(p.maxHp*.12))})),'rough exploration retains existing12% damage');}
 await page.locator('.adv3-location-tools [data-screen="party"]').click();await page.locator('[data-tool-action="back"]').first().click();
 assert.deepEqual(await page.evaluate(()=>({coins:state.profile.coins,inventory:state.inventory,party:state.adventureRegional.active.party.map(p=>({hp:p.hp,maxHp:p.maxHp}))})),after,'routine rerender pays or damages once');
}));
