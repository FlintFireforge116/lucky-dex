'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
const shell=html.slice(html.indexOf('<div id="ekansHoopGame"'),html.indexOf('<div id="dashGame"')).replace('ekans-hoop-game" hidden','ekans-hoop-game"');
const baseBody=`<div id="arcadeWorldView"><div id="arcadeWorldRoute"></div><button id="arcadeWorldPrev"></button><button id="arcadeWorldNext"></button></div><div id="arcadeVenueView" hidden><img id="arcadeVenueArt"><button id="arcadeWorldBack"></button><h2 id="arcadeVenueTitle"></h2><p id="arcadeVenueDescription"></p><div id="arcadeVenueGames"></div></div><div id="arcadeResultSheet" hidden><div id="arcadeResultSummary"><span id="arcadeResultTitle"></span><span id="arcadeResultMetricLabel"></span><span id="arcadeResultMetricValue"></span><span id="arcadeResultCoins"></span><span id="arcadeResultItem"></span><span id="arcadeResultBest"></span><div id="arcadeResultDetails"></div><button id="arcadeResultReplay"></button><button id="arcadeResultChange"></button><button id="arcadeResultBack"></button></div><div id="arcadeResultCardReveal" hidden><img id="arcadeResultRevealImage"><span id="arcadeResultRevealFallback"></span><span id="arcadeResultRevealName"></span><span id="arcadeResultRevealMeta"></span><span id="arcadeResultRevealCount"></span><button id="arcadeResultRevealNext"></button></div></div>${shell}<script>window.state={arcade:{},pokemon:{}};window.save=()=>{};window.navigate=()=>{};window.handleLuckyBack=()=>false;window.LuckyDexTrade={leave:()=>{}};window.awardArcadeCoins=n=>n;</script><script src="arcade-platform.js"></script><script src="arcade-session.js"></script><script src="arcade-ekans-hoop-core.js"></script><script src="arcade-ekans-hoop.js"></script><script src="arcade-world.js"></script>`;
const fixture=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="styles-v013.css"><link rel="stylesheet" href="arcade.css"><link rel="stylesheet" href="arcade-ekans-hoop.css"><body class="arcade-mode arcade-open">${baseBody}<script>LuckyDexArcadeWorld.openVenue('stadiumKidsClub');LuckyDexArcadeWorld.openGame('ekansHoop');LuckyDexEkansHoop.startRound({countdownMs:0});</script>`;
(async()=>{
  let chromium;
  try{({chromium}=require('playwright'));}
  catch(e){console.log('SKIP Ekans browser QA: Playwright dependency is not installed in this extracted workspace');return;}
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:360,height:800},hasTouch:true,isMobile:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource'))errors.push(m.text())});
    await page.route('https://ekans.test/**',route=>{const u=new URL(route.request().url());if(u.pathname==='/qa')return route.fulfill({contentType:'text/html',body:fixture});const f=path.resolve(assets,decodeURIComponent(u.pathname).slice(1));if(!f.startsWith(assets+path.sep)||!fs.existsSync(f))return route.fulfill({status:404,body:'missing'});return route.fulfill({path:f})});
    await page.goto('https://ekans.test/qa');
    assert.equal(await page.evaluate(()=>LuckyDexArcadeWorld.activeGame()),'ekansHoop');assert.equal(await page.evaluate(()=>LuckyDexArcadeWorld.selectedVenue()),'stadiumKidsClub');
    assert.equal(await page.locator('#ekansHoopThrow').count(),0,'button THROW control is gone');
    const box=await page.locator('#ekansHoopLauncher').boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2-55,box.y+box.height/2+90,{steps:4});
    let snap=await page.evaluate(()=>LuckyDexEkansHoop.snapshot());assert.ok(snap.dragging);assert.ok(snap.aim.lane>1.4&&snap.aim.lane<1.8);assert.ok(snap.aim.depth>0.9&&snap.aim.depth<1.3);
    await page.mouse.up();snap=await page.evaluate(()=>LuckyDexEkansHoop.snapshot());assert.equal(snap.dragging,false);assert.ok(snap.playerAirborne);await page.waitForTimeout(460);
    snap=await page.evaluate(()=>LuckyDexEkansHoop.snapshot());assert.equal(snap.playerAirborne,false);assert.ok(snap.targets.length>=1&&snap.targets.length<=3);
    await page.dispatchEvent('#ekansHoopLauncher','pointerdown',{pointerId:9,pointerType:'touch',clientX:100,clientY:500});await page.dispatchEvent('#ekansHoopLauncher','pointercancel',{pointerId:9,pointerType:'touch',clientX:100,clientY:500});assert.equal(await page.evaluate(()=>LuckyDexEkansHoop.snapshot().dragging),false);
    for(const viewport of [{width:360,height:800},{width:320,height:640}]){await page.setViewportSize(viewport);const q=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,launcherRect:document.getElementById('ekansHoopLauncher').getBoundingClientRect().toJSON(),backRect:document.querySelector('#ekansHoopGame [data-exit-game]').getBoundingClientRect().toJSON()}));assert.ok(q.sw<=q.iw);for(const r of [q.launcherRect,q.backRect])assert.ok(r.x>=0&&r.right<=viewport.width&&r.top<viewport.height&&r.bottom>0)}
    assert.deepEqual(errors,[]);console.log('PASS Ekans browser drag controls and solo layout');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
