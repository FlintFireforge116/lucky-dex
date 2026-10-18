'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
const shellStart=html.indexOf('<div id="digDigDigGame"'),shellEnd=html.indexOf('<div id="dashGame"');
const shell=html.slice(shellStart,shellEnd).replace('dig-dig-dig-game" hidden','dig-dig-dig-game"');
const baseBody=`<div id="arcadeWorldView"><div id="arcadeWorldRoute"></div><button id="arcadeWorldPrev"></button><button id="arcadeWorldNext"></button></div><div id="arcadeVenueView" hidden><img id="arcadeVenueArt"><button id="arcadeWorldBack"></button><h2 id="arcadeVenueTitle"></h2><p id="arcadeVenueDescription"></p><div id="arcadeVenueGames"></div></div><div id="arcadeResultSheet" hidden><div id="arcadeResultSummary"><span id="arcadeResultTitle"></span><span id="arcadeResultMetricLabel"></span><span id="arcadeResultMetricValue"></span><span id="arcadeResultCoins"></span><span id="arcadeResultItem"></span><span id="arcadeResultBest"></span><div id="arcadeResultDetails"></div><button id="arcadeResultReplay"></button><button id="arcadeResultChange"></button><button id="arcadeResultBack"></button></div><div id="arcadeResultCardReveal" hidden><img id="arcadeResultRevealImage"><span id="arcadeResultRevealFallback"></span><span id="arcadeResultRevealName"></span><span id="arcadeResultRevealMeta"></span><span id="arcadeResultRevealCount"></span><button id="arcadeResultRevealNext"></button></div></div>${shell}<script>window.state={arcade:{},pokemon:{}};window.save=()=>{};window.navigate=()=>{};window.handleLuckyBack=()=>false;window.LuckyDexTrade={leave:()=>{}};window.awardArcadeCoins=n=>n;</script><script src="arcade-platform.js"></script><script src="arcade-session.js"></script><script src="arcade-dig-dig-dig-core.js"></script><script src="arcade-dig-dig-dig.js"></script><script src="arcade-world.js"></script>`;
const fixture=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="styles-v013.css"><link rel="stylesheet" href="arcade.css"><link rel="stylesheet" href="arcade-dig-dig-dig.css"><body class="arcade-mode arcade-open">${baseBody}<script>LuckyDexArcadeWorld.openVenue('stadiumKidsClub');LuckyDexArcadeWorld.openGame('digDigDig');</script>`;
(async()=>{
  let chromium;try{({chromium}=require('playwright'));}catch(_){console.log('SKIP v0.36.0 Dig browser QA: Playwright dependency is not installed in this extracted workspace');return;}
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:360,height:800},hasTouch:true,isMobile:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource'))errors.push(m.text())});
    await page.route('https://dig.test/**',route=>{const u=new URL(route.request().url());if(u.pathname==='/qa')return route.fulfill({contentType:'text/html',body:fixture});const f=path.resolve(assets,decodeURIComponent(u.pathname).slice(1));if(!f.startsWith(assets+path.sep)||!fs.existsSync(f))return route.fulfill({status:404,body:'missing'});return route.fulfill({path:f})});
    await page.goto('https://dig.test/qa');
    assert.equal(await page.evaluate(()=>LuckyDexArcadeWorld.activeGame()),'digDigDig');assert.equal(await page.evaluate(()=>LuckyDexArcadeWorld.selectedVenue()),'stadiumKidsClub');
    for(const viewport of [{width:360,height:800},{width:320,height:640}]){
      await page.setViewportSize(viewport);
      const q=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,boxes:['digDigDigPlayerLane','digDigDigCpu1Lane','digDigDigCpu2Lane','digDigDigCpu3Lane','digDigDigLeft','digDigDigRight'].map(id=>document.getElementById(id).getBoundingClientRect().toJSON()),back:document.querySelector('#digDigDigGame [data-exit-game]').getBoundingClientRect().toJSON()}));
      assert.ok(q.sw<=q.iw,`${viewport.width}px layout has no horizontal overflow`);
      for(const r of [...q.boxes,q.back]){assert.ok(r.x>=-1&&r.right<=viewport.width+1,`element ${r.x}..${r.right} within ${viewport.width}`);assert.ok(r.width>0&&r.height>0);}
    }
    await page.setViewportSize({width:360,height:800});
    await page.evaluate(()=>LuckyDexDigDigDig.startRound({difficulty:'normal',countdownMs:0}));
    const left=page.locator('#digDigDigLeft'),right=page.locator('#digDigDigRight');
    await left.dispatchEvent('pointerdown',{pointerId:1,pointerType:'touch'});assert.equal(await page.evaluate(()=>LuckyDexDigDigDig.snapshot().racers[0].progress),1);
    await left.dispatchEvent('pointerdown',{pointerId:2,pointerType:'touch'});assert.equal(await page.evaluate(()=>LuckyDexDigDigDig.snapshot().racers[0].progress),1,'repeated side is rejected');
    await right.dispatchEvent('pointerdown',{pointerId:3,pointerType:'touch'});assert.equal(await page.evaluate(()=>LuckyDexDigDigDig.snapshot().racers[0].progress),2);
    await page.keyboard.down('ArrowLeft');await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',repeat:true,bubbles:true})));await page.keyboard.up('ArrowLeft');assert.ok((await page.evaluate(()=>LuckyDexDigDigDig.snapshot().racers[0].progress))<=3,'keyboard repeat does not leak progress');
    await page.evaluate(()=>LuckyDexDigDigDig.pause());assert.equal(await page.locator('#digDigDigPauseOverlay').isVisible(),true);await page.click('#digDigDigResume');assert.notEqual(await page.evaluate(()=>LuckyDexDigDigDig.snapshot().phase),'paused');
    const dims=await page.evaluate(()=>[...document.querySelectorAll('#digDigDigRace .dig-sandshrew')].map(img=>({w:img.getBoundingClientRect().width,h:img.getBoundingClientRect().height,nw:img.naturalWidth,nh:img.naturalHeight})));
    for(const d of dims){assert.equal(d.nw,35);assert.equal(d.nh,39);assert.ok(Math.abs(d.w/d.h-35/39)<.02,`sprite ratio ${d.w}/${d.h}`);}
    await page.evaluate(()=>{const g=LuckyDexDigDigDig;g.showReady({difficulty:'easy'});g.startRound({difficulty:'easy',countdownMs:0});for(let i=0;i<80;i++)g.input(i%2?'right':'left');g.finishRound();});
    assert.equal(await page.locator('#arcadeResultSheet').isVisible(),true);await page.click('#arcadeResultReplay');assert.equal(await page.evaluate(()=>LuckyDexDigDigDig.snapshot().phase),'idle');
    await page.evaluate(()=>LuckyDexDigDigDig.startRound({countdownMs:0}));await page.evaluate(()=>LuckyDexDigDigDig.finishRound());await page.click('#arcadeResultBack');assert.equal(await page.evaluate(()=>LuckyDexArcadeWorld.activeGame()),null);assert.equal(await page.locator('#arcadeVenueView').isVisible(),true);
    assert.deepEqual(errors,[]);console.log('PASS v0.36.0 Dig browser mobile controls, layout, pause, replay and Kids Club return');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
