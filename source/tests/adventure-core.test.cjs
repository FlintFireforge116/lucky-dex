'use strict';
const assert=require('node:assert/strict');
const {launch,appPage}=require('../scripts/recovery-browser.cjs');
(async()=>{
  const browser=await launch(),errors=[];
  try {
    const {page,context}=await appPage(browser,{width:393,height:873},errors,{init:()=>{
      localStorage.setItem('luckyDexSave',JSON.stringify({saveVersion:6,settings:{zone:'haunted'},profile:{coins:1500,xp:1600,firstClears:{meadow:true},rankRewards:[2,3,4,5],custom:'profile-sentinel'},pokemon:{'7:n':{id:7,name:'squirtle',level:10,count:1,shiny:false,generation:1,xp:0,types:['water'],baseStats:{hp:44,attack:48,defense:65,speed:43}}},team:['7:n'],stats:{catches:1,visitedLocations:{haunted:true}},legacySentinel:{keep:true},adventureV2:{custom:'v2-sentinel'}}));
    }});
    assert.equal(await page.evaluate(()=>typeof window.LuckyDexAdventureBridge),'object','core exports its explicit shared services bridge');
    await page.locator('#titleContinueBtn').tap();await page.evaluate(()=>navigate('adventure'));
    assert.equal(await page.locator('[data-adv-view="home"]').isVisible(),true,'Adventure opens its unified home');
    await page.evaluate(()=>LuckyDexAdventure.wild());
    assert.equal(await page.locator('[data-adv-view="habitats"]').isVisible(),true,'Wild Hunt is owned by the unified Adventure entry point');
    assert.equal(await page.locator('#searchBtn').count(),0);
    const saved=await page.evaluate(()=>{
      const bridge=window.LuckyDexAdventureBridge,state=bridge.getState();
      const assertBridge=typeof bridge.save==='function'&&typeof bridge.currentRank==='function'&&typeof bridge.openSupplies==='function';
      bridge.save();return {assertBridge,state:JSON.parse(localStorage.getItem('luckyDexSave'))};
    });
    assert.equal(saved.assertBridge,true);
    assert.deepEqual(saved.state.legacySentinel,{keep:true});assert.equal(saved.state.profile.custom,'profile-sentinel');assert.equal(saved.state.adventureV2.custom,'v2-sentinel');assert.deepEqual(saved.state.profile.firstClears,{meadow:true});
    assert.equal(saved.state.profile.coins,1500,'migration and navigation do not grant or consume shared currency');assert.deepEqual(saved.state.team,['7:n']);assert.equal(saved.state.pokemon['7:n'].count,1);assert.equal(saved.state.pokemon['7:n'].level,10);
    await page.evaluate(()=>LuckyDexAdventureBridge.openSupplies());
    assert.equal(await page.locator('[data-tool-screen="mart"]').isVisible(),true,'shared supplies bridge opens the Adventure Mart');
    assert.equal(await page.evaluate(()=>window.handleLuckyBack()),true);
    assert.equal(await page.locator('[data-adv-view="home"]').isVisible(),true,'Back from bridge supplies returns to Adventure home');
    for(const dest of ['collection','packs','profile','trade','arcade','adventure']) {
      await page.evaluate(dest=>navigate(dest),dest);
      assert.equal(await page.locator('.page.active').getAttribute('data-page'),dest);
      if(dest!=='adventure'){assert.equal(await page.evaluate(()=>window.handleLuckyBack()),true,'shared pages retain Back to Adventure');assert.equal(await page.locator('.page.active').getAttribute('data-page'),'adventure');assert.equal(await page.locator('[data-adv-view="home"]').isVisible(),true);}
    }
    assert.equal(await page.locator('[data-adv-view="home"]').isVisible(),true);
    assert.equal(await page.locator('#pokemonDialog').count(),1);
    assert.deepEqual(errors,[]);
    await context.close();
    console.log('PASS unified Adventure/Wild Hunt bridge, additive old save, Mart/Back and shared page navigation');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
