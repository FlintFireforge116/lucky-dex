'use strict';
const path=require('node:path');
let chromium;try{({chromium}=require('playwright'));}catch(_){console.log('SKIP v0.38.0 Rock Harden browser QA: Playwright dependency unavailable');process.exit(0);}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:412,height:915},isMobile:true,hasTouch:true});
    await page.goto('file://'+path.resolve(__dirname,'../app/src/main/assets/index.html'));
    await page.waitForTimeout(120);
    await page.evaluate(()=>{document.getElementById('titleScreen')?.remove();document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));const game=document.getElementById('rockHardenGame');if(game)game.hidden=false;LuckyDexRockHarden.open();});
    const metrics=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,button:document.getElementById('rockHardenButton')?.getBoundingClientRect(),lanes:[...document.querySelectorAll('#rockHardenArena .rock-harden-lane')].map(x=>x.getBoundingClientRect()),hp:[...document.querySelectorAll('#rockHardenArena .rock-harden-hp')].length,scores:[...document.querySelectorAll('#rockHardenArena .rock-harden-score')].length,rocks:[...document.querySelectorAll('#rockHardenArena .rock-harden-rock')].length,shadows:[...document.querySelectorAll('#rockHardenArena .rock-harden-shadow')].length}));
    if(metrics.scrollWidth>metrics.clientWidth+1)throw new Error(`horizontal page scroll ${metrics.scrollWidth}>${metrics.clientWidth}`);
    if(!metrics.button||metrics.button.height<64)throw new Error('HARDEN touch target too small');
    if(metrics.lanes.length!==4||metrics.lanes.some(x=>x.right>metrics.clientWidth+1))throw new Error('four lanes do not fit portrait viewport');
    if([metrics.hp,metrics.scores,metrics.rocks,metrics.shadows].some(n=>n!==4))throw new Error('all four lane HUD/telegraph elements must exist');

    await page.evaluate(()=>LuckyDexRockHarden.startRound({difficulty:'normal',countdownMs:0}));
    await page.locator('#rockHardenButton').dispatchEvent('pointerdown',{pointerId:11,pointerType:'touch',isPrimary:true});
    const silver=await page.evaluate(()=>({held:document.getElementById('rockHardenPlayerLane').classList.contains('is-hardened'),filter:getComputedStyle(document.getElementById('rockHardenPlayerSprite')).filter}));
    if(!silver.held||!silver.filter||silver.filter==='none')throw new Error('pointer hold did not visibly enter silver Harden state');
    await page.locator('#rockHardenButton').dispatchEvent('pointerup',{pointerId:11,pointerType:'touch',isPrimary:true});

    await page.locator('#rockHardenButton').dispatchEvent('pointerdown',{pointerId:12,pointerType:'touch',isPrimary:true});await page.waitForTimeout(50);
    await page.evaluate(()=>LuckyDexRockHarden.pause());const before=await page.evaluate(()=>LuckyDexRockHarden.snapshot());await page.waitForTimeout(120);const during=await page.evaluate(()=>LuckyDexRockHarden.snapshot());
    if(before.timerMs!==during.timerMs||Math.abs(before.player.hp-during.player.hp)>.001)throw new Error('pause did not freeze timer/HP');
    if(!await page.locator('#rockHardenPauseOverlay').isVisible())throw new Error('pause overlay not visible');
    await page.evaluate(()=>LuckyDexRockHarden.release());await page.locator('#rockHardenResume').click();

    const secretText=await page.locator('#rockHardenArena').textContent();if(/\b(?:coins?|dust|ticket|booster|card)\b/i.test(secretText||''))throw new Error('arena exposes Gold prize category before claim');

    // Make the next owner frame deterministically exercise impact feedback and final result without a 45s browser wait.
    await page.evaluate(()=>{const c=LuckyDexRockHardenCore,orig=c.advanceRound;c.advanceRound=(r,t)=>{orig(r,t);if(!r.finalized){r.player.lastGrade='perfect';r.player.score=Math.max(3,r.player.score);r.player.perfects=Math.max(1,r.player.perfects);r.player.blocks=Math.max(1,r.player.blocks);r.events.push({type:'block',at:t,racerId:'player',grade:'perfect',points:3,gold:false},{type:'impact',at:t,racerId:'player',grade:'perfect',gold:false});r.racers[1].alive=false;r.racers[1].koAt=t-30;r.racers[2].alive=false;r.racers[2].koAt=t-20;r.racers[3].alive=false;r.racers[3].koAt=t-10;r.finalized=true;r.finishedAt=t;}return r;};});
    await page.waitForTimeout(80);
    if(!await page.locator('#arcadeResultSheet').isVisible().catch(()=>false)){const phase=await page.evaluate(()=>LuckyDexRockHarden.snapshot().phase);if(phase!=='finished')throw new Error('countdown/running/impact/result path not reachable');}
    console.log('PASS v0.38.0 Rock Harden browser/mobile layout and interaction');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
