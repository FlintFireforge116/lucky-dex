'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {launch,createPage,start,grabPoint}=require('./tcgp-browser-fixture.cjs');
const out=path.resolve(__dirname,'../artifacts/v06933/visual');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await launch();try{
 const checks=[];
 for(const width of [360,393]){
  const {page,context,errors}=await createPage(browser,{width,height:width===360?800:873});
  await page.evaluate(()=>{state.cards=Object.fromEntries(LuckyDexTCGPBattleData.PRINTS.map(p=>[p.id,{source:'tcgp',id:p.id,setId:p.setId,name:p.name,count:2}]));LuckyDexTCGPBattleUI.renderHome();});
  await page.click('[data-tcgp-action="build"]');await page.fill('#tcgpDeckSearch','Charizard');await page.screenshot({path:path.join(out,width+'-catalogue.png')});
  await page.fill('#tcgpDeckSearch','Pidgeot');await page.screenshot({path:path.join(out,width+'-exceptions.png')});
  await page.evaluate(()=>LuckyDexTCGPBattleUI.renderHome());await start(page,{mode:'battle'});
  await page.evaluate(()=>{__tcgpBattle.sides.player.active=LuckyDexTCGPBattleCore.makePokemonSlot('A3-087',0,'visual-lunala');__tcgpBattle.sides.player.active.energy={Psychic:3};});
  await page.click('.tcgp-live-player-active .tcgp-live-card');await page.screenshot({path:path.join(out,width+'-ability-inspection.png')});
  assert.match(await page.locator('.tcgp-live-card-sheet').innerText(),/Psychic Connect/);
  await page.click('.tcgp-live-sheet-close');await page.evaluate(()=>{__tcgpBattle.sides.player.hand[0]={uid:'visual-potion',cardId:'P-A-001'};});
  await page.click('.tcgp-live-player-active .tcgp-live-card');await page.click('.tcgp-live-sheet-close');const point=await grabPoint(page,'[data-tcgp-hand-drag="0"]');await page.mouse.click(point.x,point.y);await page.screenshot({path:path.join(out,width+'-trainer-inspection.png')});
  assert.match(await page.locator('.tcgp-live-card-sheet').innerText(),/Heal 20/);assert.deepEqual(errors,[]);
  checks.push({width,pageErrors:errors,horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});await context.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,note:'Offline disposable fixtures. External card art deliberately unavailable; existing artwork fallback remains usable.'},null,2));console.log('PASS eight portrait catalogue/exception/ability/Trainer captures');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
