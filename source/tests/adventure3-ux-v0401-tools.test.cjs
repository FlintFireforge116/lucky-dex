const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {launch,open}=require('../scripts/adventure3-browser-utils.cjs');let browser;
before(async()=>{browser=await launch();});after(async()=>browser.close());
async function setup(viewport={width:360,height:640}){
  const p=await open(browser,viewport);await p.page.evaluate(()=>{
    LuckyDexRegionalEngine.start(state,'johto',123);
    state.pokemon['25:n'].moves=[84,98,45,39];state.pokemon['25:n'].pendingMoves=[86];
    for(const id of [10,13,16,19,21,23,27,29,32,35,37,39,41,43,46,48,50,52,54,56,58]){
      const s=LuckyDexAdventureSpecies.byId[id];state.pokemon[id+':n']={...s,id,level:15,count:1,xp:0};
    }LuckyDexProgression.ensureSave(state);save();LuckyDexAdventure.openTool('party');
  });return p;
}
async function fits(page,label){
  const m=await page.evaluate(()=>{const content=document.querySelector('.a3-tools-content'),r=content.getBoundingClientRect();return {outer:document.documentElement.scrollHeight-innerHeight,horizontal:document.documentElement.scrollWidth-innerWidth,inner:content.scrollHeight-content.clientHeight,top:r.top,bottom:r.bottom,height:innerHeight};});
  assert.ok(m.outer<=1&&m.horizontal<=1&&m.inner<=2&&m.top>=0&&m.bottom<=m.height+1,label+': '+JSON.stringify(m));
}
for(const viewport of [{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:768,height:1024}])test(`Compact Party/Moves/pickers/TM comparison fit without pane or document scrolling at ${viewport.width}x${viewport.height}`,async()=>{
  const {page,context,errors}=await setup(viewport);try{
    assert.equal(await page.locator('[data-tool-action="select-party"]').count(),3,'Three compact selectable party slots are missing');await fits(page,'Party');
    await page.locator('[data-tool-action="replace"]').first().click();assert.equal(await page.locator('.a3-tools select,.a3-tools input[type="radio"]').count(),0);
    assert.ok(await page.locator('[data-tool-action="replace-with"]').count()<=6);await fits(page,'Replacement picker');
    await page.locator('[data-tool-action="back"]').click();
    await page.evaluate(()=>LuckyDexAdventure.openTool('moves',{key:'25:n'}));
    assert.equal(await page.locator('[data-tool-action="move-tab"]').count(),3,'MOVES/LEARN/TM CASE tabs are missing');
    assert.equal(await page.locator('.adv-move-grid .adv-move-slot').count(),4);assert.equal(await page.locator('.a3-tools select').count(),0);await fits(page,'Known moves');
    await page.locator('[data-tool-action="choose-pokemon"]').click();assert.ok(await page.locator('[data-tool-action="pick-pokemon"]').count()<=6);await fits(page,'Pokémon picker');await page.locator('[data-tool-action="back"]').click();
    await page.locator('[data-tool-action="move-tab"][data-tab="learn"]').click();await fits(page,'Pending moves');await page.locator('[data-tool-action="learn"]').first().click();
    assert.equal(await page.locator('[data-tool-action="forget"]').count(),4);await fits(page,'Pending replacement');await page.locator('[data-tool-action="cancel"]').first().click();
    await page.locator('[data-tool-action="move-tab"][data-tab="tm"]').click();await fits(page,'TM Case');await page.locator('[data-tool-action="teach"][data-id="85"]').click();await fits(page,'TM replacement');
    await page.locator('[data-tool-action="forget"][data-slot="1"]').click();await fits(page,'Teaching confirmation');
    fs.mkdirSync(path.resolve(__dirname,'../artifacts/v0401/screens'),{recursive:true});await page.screenshot({path:path.resolve(__dirname,`../artifacts/v0401/screens/${viewport.width}x${viewport.height}-tm-teaching.png`)});
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
test('Paged replacement and learner pickers preserve back context and never open native selectors',async()=>{
  const {page,context,errors}=await setup();try{
    await page.locator('[data-tool-action="replace"]').first().click();assert.ok(await page.locator('[data-tool-action="replace-with"]').count()<=6,'The owned list needs in-game paging');const first=await page.locator('[data-tool-action="replace-with"]').first().getAttribute('data-key');
    await page.locator('[data-tool-action="page"][data-delta="1"]').click();const second=await page.locator('[data-tool-action="replace-with"]').first().getAttribute('data-key');assert.notEqual(first,second);
    const team=await page.evaluate(()=>state.team.slice());await page.locator('[data-tool-action="replace-with"]:not([disabled])').first().evaluate(b=>{b.click();b.click();});
    const updated=await page.evaluate(()=>state.team);assert.equal(updated.length,3);assert.equal(new Set(updated).size,3);assert.notDeepEqual(updated,team);
    await page.evaluate(()=>LuckyDexAdventure.openTool('moves',{key:'25:n',moveTab:'tm'}));await page.locator('[data-tool-action="choose-pokemon"]').click();await page.locator('[data-tool-search]').fill('Pikachu');await page.locator('[data-tool-action="pick-pokemon"]').click();
    assert.match(await page.locator('[data-tool-action="choose-pokemon"]').innerText(),/Pikachu/);assert.equal(await page.locator('[data-tool-action="move-tab"][aria-pressed="true"]').getAttribute('data-tab'),'tm');assert.equal(await page.locator('.a3-tools select,.a3-tools input[type="radio"]').count(),0);assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
test('Compact teaching confirmation retains atomic TM consume, cancellation and rapid-tap protection',async()=>{
  const {page,context,errors}=await setup();try{
    await page.evaluate(()=>LuckyDexAdventure.openTool('moves',{key:'25:n',moveTab:'tm'}));
    const quantity=await page.evaluate(()=>state.tmInventory[85]);await page.locator('[data-tool-action="teach"][data-id="85"]').click();await fits(page,'Compact comparison');await page.locator('[data-tool-action="cancel"]').first().click();assert.equal(await page.evaluate(()=>state.tmInventory[85]),quantity);
    await page.locator('[data-tool-action="teach"][data-id="85"]').click();await page.locator('[data-tool-action="forget"][data-slot="1"]').click();assert.equal(await page.evaluate(()=>state.tmInventory[85]),quantity);
    await page.locator('[data-tool-action="confirm"]').evaluate(b=>{b.click();b.click();});assert.equal(await page.evaluate(()=>state.tmInventory[85]),quantity-1);assert.deepEqual(await page.evaluate(()=>state.pokemon['25:n'].moves),[84,85,45,39]);assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
test('Compact Mart, purchase confirmation and field Bag fit and debit only once',async()=>{
  const {page,context,errors}=await setup();try{
    await page.evaluate(()=>LuckyDexAdventure.openTool('mart'));await fits(page,'Mart');const before=await page.evaluate(()=>({coins:state.profile.coins,count:state.inventory.potion}));
    await page.locator('[data-tool-action="buy"][data-key="potion"]').click();await fits(page,'Purchase');assert.deepEqual(await page.evaluate(()=>({coins:state.profile.coins,count:state.inventory.potion})),before);
    await page.locator('[data-tool-action="confirm"]').evaluate(b=>{b.click();b.click();});assert.deepEqual(await page.evaluate(()=>({coins:state.profile.coins,count:state.inventory.potion})),{coins:before.coins-180,count:before.count+3});
    await page.evaluate(()=>LuckyDexAdventure.openTool('bag'));await fits(page,'Bag');assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
test('Game windows size to their compact content rather than filling unused space with a giant paper panel',async()=>{
  const {page,context}=await setup();try{
    for(const screen of ['party','moves','mart']){
      await page.evaluate(screen=>LuckyDexAdventure.openTool(screen,{key:screen==='party'?'1:n':'25:n'}),screen);
      const gap=await page.locator('.a3-tools-content').evaluate(e=>e.getBoundingClientRect().bottom-e.lastElementChild.getBoundingClientRect().bottom);
      assert.ok(gap<30,`${screen} has ${gap.toFixed(1)}px of empty paper below its controls`);
    }
    await page.evaluate(()=>LuckyDexAdventure.openTool('moves',{key:'25:n',moveTab:'tm'}));
    const gap=await page.evaluate(()=>document.querySelector('.a3-pager').getBoundingClientRect().top-document.querySelector('.a3-tm-grid').getBoundingClientRect().bottom);
    assert.ok(gap<30,`TM paging has ${gap.toFixed(1)}px unused between tiles and controls`);
  }finally{await context.close();}
});
