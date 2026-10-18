'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {launch,appPage}=require('../scripts/recovery-browser.cjs');

test('global sleeves reach actual pack and Trade card-back DOM at phone dimensions',async t=>{
  const browser=await launch(),errors=[];
  try{
    const {page,context}=await appPage(browser,{width:360,height:800},errors);
    await page.locator('#titleContinueBtn').click();
    if(await page.locator('#starterPanel').isVisible())await page.locator('#starterChoices button').first().click();
    await page.evaluate(()=>{
      window.v0440LegacySave=JSON.parse(JSON.stringify(state));
      LuckyDexCosmeticsV0413.equipSleeve(state,'luckydex-midnight');
      const container=document.createElement('div');container.id='v0440PackFixture';document.body.append(container);
      window.v0440PackOptions={card:{id:'fixture-front',name:'Face-up fixture',rarity:'Common',source:'tcg'},artwork:LuckyDexPack.placeholder('Face-up fixture'),index:0,count:1,setName:'Offline fixture',onNext(){},onPrevious(){},onFullScreen(){},onExit(){},onSettle(){}};
      window.v0440PackReveal=LuckyDexPack.mountReveal(container,v0440PackOptions);
    });
    await t.test('cinematic back and unrevealed cover use decodable local active art, and switching updates both',async()=>{
      const beforeFront=await page.locator('#v0440PackFixture .pack-main-art').getAttribute('src');
      async function backs(){return page.evaluate(async()=>{
        const rows=[...document.querySelectorAll('#v0440PackFixture .pack-face-back,#v0440PackFixture .pack-unrevealed-cover')];
        return Promise.all(rows.map(async el=>{
          const css=getComputedStyle(el,'::after'),url=css.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]||'';
          const img=new Image();img.src=url;await img.decode();return {url,width:img.naturalWidth,height:img.naturalHeight,content:css.content,zIndex:css.zIndex};
        }));
      });}
      let rows=await backs();assert.equal(rows.length,2);
      for(const row of rows){assert.match(row.url,/\/cosmetics\/sleeves\/luckydex-midnight\.webp$/);assert(row.width>0&&row.height>0);assert.notEqual(row.content,'none');assert.equal(row.zIndex,'20');}
      assert.equal(await page.evaluate(()=>LuckyDexCosmeticsV0413.equipSleeve(state,'luckydex-pixel').ok),true);
      rows=await backs();for(const row of rows)assert.match(row.url,/luckydex-pixel\.webp$/);
      assert.equal(await page.locator('#v0440PackFixture .pack-main-art').getAttribute('src'),beforeFront,'equipping must not replace normal front art');
      await page.evaluate(()=>v0440PackReveal.session.skip());
      assert.equal(await page.locator('#v0440PackFixture .pack-unrevealed-cover').evaluate(el=>el.hidden),true,'normal reveal still hides the cover');
    });
    await t.test('fallback reveal uses the same active back without putting a sleeve over its face',async()=>{
      await page.evaluate(()=>{v0440PackReveal.destroy();window.v0440PackReveal=LuckyDexPack.mountFallbackReveal(document.getElementById('v0440PackFixture'),v0440PackOptions);});
      assert.match(await page.locator('#v0440PackFixture .pack-face-back').evaluate(el=>getComputedStyle(el,'::after').backgroundImage),/luckydex-pixel\.webp/);
      assert.equal(await page.locator('#v0440PackFixture .pack-face-front').evaluate(el=>getComputedStyle(el,'::after').backgroundImage),'none');
      assert.equal(await page.locator('#v0440PackFixture .pack-face-front img').getAttribute('src'),await page.evaluate(()=>v0440PackOptions.artwork));
    });
    await t.test('actual Trade receive backs refresh when equipped art changes, without changing its card fronts or transaction',async()=>{
      await page.evaluate(()=>{
        LuckyDexCosmeticsV0413.equipSleeve(state,'luckydex-midnight');
        const front=LuckyDexPack.placeholder('Trade fixture front');
        const request={id:'v0440-request',name:'Fixture Send',source:'tcg',setId:'v0440',setName:'Fixture Set',rarity:'Common',image:front,count:2};
        const offer={id:'v0440-offer',name:'Fixture Receive',source:'tcg',setId:'v0440',setName:'Fixture Set',rarity:'Common',image:front};
        state.cards[request.id]=request;
        state.trade.market={listings:[{id:'v0440-trade',request,offer,trainer:'Fixture Trainer',avatar:'★',sameSet:true,source:'tcg',accepted:false}]};
        window.v0440TradesBefore=Number(state.stats.trades||0);
        window.v0440TradePromise=LuckyDexTrade.accept('v0440-trade');
      });
      await page.locator('#tradeConfirmAccept').click();
      await page.waitForSelector('#tradeExchangeFx .trade-fx-back .lucky-sleeve-back-inner');
      const fronts=await page.locator('#tradeExchangeFx .trade-fx-front img').evaluateAll(images=>images.map(img=>img.getAttribute('src')));
      const before=await page.locator('#tradeExchangeFx .lucky-sleeve-back-inner').evaluateAll(rows=>rows.map(el=>el.dataset.sleeveId));
      assert.deepEqual(before,['luckydex-midnight','luckydex-midnight']);
      assert.equal(await page.evaluate(()=>LuckyDexCosmeticsV0413.equipSleeve(state,'luckydex-pixel').ok),true);
      const mounted=await page.locator('#tradeExchangeFx .lucky-sleeve-back-inner').evaluateAll(async rows=>Promise.all(rows.map(async el=>{const img=el.querySelector('img');await img.decode();return {id:el.dataset.sleeveId,src:img.getAttribute('src'),width:img.naturalWidth};})));
      assert.deepEqual(mounted.map(row=>row.id),['luckydex-pixel','luckydex-pixel']);
      for(const row of mounted){assert.match(row.src,/luckydex-pixel\.webp$/);assert(row.width>0);}
      assert.equal(await page.evaluate(()=>LuckyDexCosmeticsV0413.equipSleeve(state,'kanto-red').reason),'locked');
      assert.deepEqual(await page.locator('#tradeExchangeFx .lucky-sleeve-back-inner').evaluateAll(rows=>rows.map(el=>el.dataset.sleeveId)),['luckydex-pixel','luckydex-pixel']);
      assert.deepEqual(await page.locator('#tradeExchangeFx .trade-fx-front img').evaluateAll(images=>images.map(img=>img.getAttribute('src'))),fronts);
      assert.deepEqual(await page.evaluate(()=>({sent:state.cards['v0440-request'].count,received:state.cards['v0440-offer'].count,trades:Number(state.stats.trades)-v0440TradesBefore})),{sent:1,received:1,trades:1});
    });
    await page.evaluate(()=>{LuckyDexTrade.cancelOverlay();v0440PackReveal.destroy();});
    await t.test('real application reload preserves a v0.43.1-shaped save, legacy equipment, and newer-game sentinels',async()=>{
      const legacyJson=await page.evaluate(()=>{
        const s=v0440LegacySave,sentinel={nested:['keep',431]};
        s.saveVersion=7;s.sentinel=sentinel;s.profile.sentinel=sentinel;s.inventory.sentinel=sentinel;
        s.profile.coins=1234;s.profile.dust=567;s.profile.tickets=8;
        s.stats.sentinel=sentinel;s.arcade.sentinel=sentinel;s.arcade.impactTrial={gamesPlayed:2,fullClears:1,bestIntegrity:87,sentinel};
        s.arcade.goldenrod.sentinel=sentinel;s.arcade.goldenrod.events.impactTrial={unlockedDivision:'great',typeCupsUnlocked:true,divisionTrophies:{poke:'silver'},typeTrophies:{water:{rookie:'gold'}},records:{sentinel},sentinel};
        s.adventureRegional={schema:2,journeys:{kanto:null,johto:null,hoenn:null},activeRegion:null,active:null,records:{kanto:{clears:0,sentinel}},last:null,sentinel};
        s.achievementTelemetryV0413={events:{'voltorb:gift-lost':{count:1,lastAt:431}},flags:{sentinel}};
        s.cosmetics={unlockedSleeves:LuckyDexCosmeticsCatalogV0413.CATALOGUE.slice(0,30).map(row=>row.id),activeSleeve:'already-got-em',discoveredSecrets:['v0413_secret_god_pack_no_new'],claimedCosmeticRewards:['legacy:preserve-token'],sentinel};
        return JSON.stringify(s);
      });
      const {page:legacyPage,context:legacyContext}=await appPage(browser,{width:360,height:800},errors,{init:`localStorage.setItem('luckyDexSave',${JSON.stringify(legacyJson)});`});
      await legacyPage.locator('#titleContinueBtn').click();
      const migrated=await legacyPage.evaluate(()=>({active:state.cosmetics.activeSleeve,owned:LuckyDexCosmeticsCatalogV0413.CATALOGUE.slice(0,30).every(row=>state.cosmetics.unlockedSleeves.includes(row.id)),token:state.cosmetics.claimedCosmeticRewards.includes('legacy:preserve-token'),secrets:state.cosmetics.discoveredSecrets.includes('v0413_secret_god_pack_no_new'),sentinels:[state.sentinel,state.profile.sentinel,state.inventory.sentinel,state.stats.sentinel,state.arcade.sentinel,state.arcade.goldenrod.sentinel,state.arcade.goldenrod.events.impactTrial.sentinel,state.arcade.goldenrod.events.impactTrial.records.sentinel,state.adventureRegional.sentinel,state.adventureRegional.records.kanto?.sentinel,state.achievementTelemetryV0413.flags.sentinel,state.cosmetics.sentinel],economy:[state.profile.coins,state.profile.dust,state.profile.tickets],impact:[state.arcade.impactTrial.gamesPlayed,state.arcade.impactTrial.fullClears,state.arcade.impactTrial.bestIntegrity],trophy:state.arcade.goldenrod.events.impactTrial.typeTrophies.water?.rookie}));
      assert.equal(migrated.active,'already-got-em');assert.equal(migrated.owned,true);assert.equal(migrated.token,true);assert.equal(migrated.secrets,true);
      for(const sentinel of migrated.sentinels)assert.deepEqual(sentinel,{nested:['keep',431]});
      assert.deepEqual(migrated.economy,[1234,567,8]);assert.deepEqual(migrated.impact,[2,1,87]);assert.equal(migrated.trophy,'gold');
      await legacyContext.close();
    });
    await context.close();assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

