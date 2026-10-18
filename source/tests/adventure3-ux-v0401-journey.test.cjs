const assert = require('node:assert/strict');
const {launch, open} = require('../scripts/adventure3-browser-utils.cjs');

(async () => {
  const browser = await launch();
  try {
    for (const viewport of [{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:768,height:1024},{width:320,height:568}]) {
      const {page, context, errors} = await open(browser, viewport);
      try {
        await page.locator('[data-nav="adventure"]').click();
        async function fit(label) {
          const geometry = await page.evaluate(() => {
            const pane = document.querySelector('.adv3-journey-content, .adv3-home-content');
            return {outer:document.documentElement.scrollHeight > innerHeight+1, horizontal:document.documentElement.scrollWidth > innerWidth, pane:pane.scrollHeight > pane.clientHeight+1};
          });
          assert(!geometry.outer && !geometry.horizontal, label+' stays in the viewport');
          if(viewport.width >= 360) assert(!geometry.pane, label+' primary content needs no scrolling');
        }
        await fit('Adventure home');
        await page.locator('[data-hub-action="journey"]').click();
        await page.locator('[data-region="johto"]').click();
        assert.equal(await page.locator('[data-location-kind="town"]').count(), 1, 'New Bark is presented as a town menu');
        assert.equal(await page.locator('.adv3-head h2').innerText(), 'New Bark Town');
        const town = await page.locator('#adventureRoot').innerText();
        for(const label of ['TALK TO LOCALS','REST AT HOME','PARTY','BAG','MAP','LEAVE FOR ROUTE 29']) assert(town.includes(label), 'town offers '+label);
        assert(!town.includes('supply stop'), 'supply rewards are actions at the real place');
        assert.equal(await page.locator('[data-journey-action="tools"][data-screen="bag"]').count(),1,'only one Bag shortcut');
        assert.equal(await page.locator('[data-location-action="center"]').count(),0,'New Bark does not invent a Pokémon Center');
        assert.equal(await page.locator('[data-location-action="mart"]').count(),0,'New Bark does not invent a Poké Mart');
        await fit('New Bark Town');
        await page.locator('[data-location-action="explore"][data-id="johto-c0-supplies"]').click();
        assert.equal(await page.locator('.adv3-head h2').innerText(),'New Bark Town','cache retains parent identity');
        assert.equal(await page.locator('[data-adv-view="result"]').count(),0,'cache does not force results');
        assert.equal(await page.evaluate(()=>state.adventureRegional.active.depth),0,'optional cache does not advance authored place');
        const paid = await page.evaluate(()=>({coins:state.profile.coins,balls:state.inventory.pokeball}));
        await page.evaluate(()=>LuckyDexAdventure.regional());
        assert.deepEqual(await page.evaluate(()=>({coins:state.profile.coins,balls:state.inventory.pokeball})),paid,'repeat render never pays twice');
        await page.locator('[data-location-action="talk"]').click();
        assert.equal(await page.locator('[data-adv-view="result"]').count(),0,'routine conversation returns to travel menu');
        assert.equal(await page.evaluate(()=>state.adventureRegional.active.depth),0,'conversation stays at its authored place');
        await page.locator('[data-journey-action="continue"]').click();
        assert.equal(await page.evaluate(()=>state.adventureRegional.active.depth),1);
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Route 29');
        assert.equal(await page.locator('[data-location-kind="route"]').count(),1);
        const route = await page.locator('#adventureRoot').innerText();
        assert(route.includes('SEARCH GRASS') && route.includes('EXPLORE'),'route offers contextual field actions');
        assert(!route.includes('FISH'),'no fishing without explicit water encounter data');
        await fit('Route 29');
        // A serialized routine result must settle on re-entry, without new rewards.
        await page.evaluate(()=>{LuckyDexRegionalEngine.enter(state,'johto-c0-rare');LuckyDexAdventure.regional()});
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Route 29','rare encounter battle also uses its parent real place');
        await page.evaluate(()=>{state.adventureRegional.active.battle.result={kind:'victory'};LuckyDexRegionalEngine.settleBattle(state);save();LuckyDexAdventure.home()});
        await page.reload();
        await page.locator('#titleContinueBtn').click();
        await page.locator('[data-nav="adventure"]').click();
        assert(!/supply stop|rare sighting/.test(await page.locator('.adv3-continue h3').innerText()),'home also keeps real location identity');
        await fit('Saved journey home');
        const rarePaid = await page.evaluate(()=>state.profile.coins);
        await page.locator('[data-hub-action="journey"]').click();
        assert.equal(await page.evaluate(()=>state.adventureRegional.active.phase),'map');
        assert.equal(await page.evaluate(()=>state.profile.coins),rarePaid,'saved routine result pays no extra reward');
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Route 29');
        await page.evaluate(()=>{const E=LuckyDexRegionalEngine,j=state.adventureRegional.active;E.enter(state,'johto-c0-s1');j.battle.result={kind:'victory'};E.settleBattle(state);LuckyDexAdventure.regional()});
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Route 29','routine victory remains local until travel');
        await page.locator('[data-journey-action="continue"]').click();
        await page.evaluate(()=>{state.adventureRegional.active.party.forEach(p=>{p.hp=1;p.status='poison';for(const id of p.moves)p.pp[id]=0});LuckyDexAdventure.regional()});
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Cherrygrove City');
        await page.locator('.adv3-location-tools [data-screen="party"]').click();
        const conditionText=await page.locator('.a3-party-list').innerText();
        assert(conditionText.includes('Poisoned')&&!/\bpoison\b/.test(conditionText),'party condition uses the shared human status label');
        await page.locator('[data-tool-action="back"]').first().click();
        assert(await page.locator('[data-location-action="center"]').isEnabled(),'authored city Center is available');
        await fit('Cherrygrove City');
        await page.locator('[data-location-action="center"]').evaluate(el=>{el.click();el.click()});
        assert.equal(await page.evaluate(()=>state.adventureRegional.active.depth),2,'double Center tap never advances authored travel');
        assert(await page.evaluate(()=>state.adventureRegional.active.party.every(p=>p.hp===p.maxHp&&!p.status&&p.moves.every(id=>p.pp[id]>0))),'Center retains full HP/PP/status recovery');
        assert.equal(await page.locator('[data-adv-view="result"]').count(),0,'Center returns without a forced result');
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Cherrygrove City','Center stays local until explicit travel');
        await page.evaluate(()=>{const E=LuckyDexRegionalEngine,j=state.adventureRegional.active;for(let i=0;i<20;i++){if(j.phase==='result')E.advance(state);else if(j.phase==='map'){const n=E.available(j).find(n=>!n.optional);if(n.type==='gym')break;E.enter(state,n.id)}else if(j.phase==='node')E.resolveNode(state);else if(j.phase==='battle'){j.battle.result={kind:'victory'};E.settleBattle(state)}}LuckyDexAdventure.regional()});
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Violet City','Gym arrival first presents its real city');
        await page.locator('[data-location-action="gym"]').click();
        await page.locator('.adv3-location-actions [data-location-action="battle"][data-id="johto-c0-s4"]').click();
        await fit('Gym preparation');
        await page.locator('[data-journey-action="challenge"]').click();
        await page.evaluate(()=>{state.adventureRegional.active.battle.result={kind:'victory'};LuckyDexRegionalEngine.settleBattle(state);save();LuckyDexAdventure.regional()});
        assert.equal(await page.locator('[data-adv-view="result"]').count(),1,'badge retains dedicated milestone');
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Badge earned');
        await fit('Badge result');
        await page.evaluate(()=>{const j=state.adventureRegional.active,n=j.nodes.find(n=>n.name==='Azalea Town'&&!n.optional);j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';LuckyDexAdventure.regional()});
        assert.equal(await page.locator('[data-location-action="gym"]').count(),1,'Gym city exposes its real Gym destination');
        assert(await page.locator('[data-location-action="gym"]').isEnabled(),'city Gym travel does not require an arbitrary Center visit');
        assert(!/Rest first/i.test(await page.locator('#adventureRoot').innerText()),'no generic pre-Gym healing gate');
        await fit('Azalea city and available Gym');
        await page.locator('[data-location-action="gym"]').click();
        assert.equal(await page.locator('.adv3-head h2').innerText(),'Azalea Gym');
        assert(await page.locator('.adv3-location-actions [data-location-action="battle"]').isEnabled(),'existing Gym is enabled without mandatory healing');
        await page.evaluate(()=>{const E=LuckyDexRegionalEngine,j=E.start(state,'kanto',17),n=j.nodes.find(n=>n.name==='Pewter City'&&n.type==='gym');j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';LuckyDexAdventure.regional()});
        assert.equal(await page.locator('[data-location-kind="gym"]').count(),1,'Pewter City authored Gym overrides town naming');
        assert.match(await page.locator('.adv3-location-actions').innerText(),/CHALLENGE PEWTER GYM/,'Pewter offers its real Gym name');
        await page.locator('.adv3-location-actions [data-location-action="battle"]').click();
        assert.equal(await page.locator('[data-adv-view="gym-prep"]').count(),1,'Pewter Gym opens preparation');
        await fit('Pewter Gym preparation');
        for(const [region,place] of [['kanto','Rock Tunnel'],['kanto','Pokémon Tower'],['johto','Mt. Mortar']]) {
          await page.evaluate(({region,place})=>{const E=LuckyDexRegionalEngine,j=E.start(state,region,17),n=j.nodes.find(n=>n.name===place&&!n.optional);j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';LuckyDexAdventure.regional()},{region,place});
          const fieldActions=await page.locator('.adv3-location-actions').innerText();
          assert(!fieldActions.includes('SEARCH GRASS'),place+' does not imply grass in its special area');
          assert(fieldActions.includes('SEARCH POKÉMON')&&fieldActions.includes('EXPLORE'),place+' offers search and exploration');
          await fit(place+' special-area menu');
        }
        assert.deepEqual(errors,[]);
        console.log('PASS real-location and routine-flow contracts '+viewport.width+'x'+viewport.height);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
