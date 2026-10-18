'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const out=path.resolve(__dirname,'../artifacts/v0423/screens');fs.mkdirSync(out,{recursive:true});
let browser;
test.before(async()=>{browser=await chromium.launch({headless:true,executablePath:process.env.LUCKYDEX_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe'});});
test.after(async()=>{await browser?.close();});
async function open(viewport={width:360,height:780},type='ground'){
  const context=await browser.newContext({viewport,hasTouch:true,isMobile:true,offline:true});
  const page=await context.newPage();page.setDefaultTimeout(5000);
  await page.goto(pathToFileURL(path.resolve(__dirname,'../app/src/main/assets/index.html')).href);
  await page.evaluate(type=>{document.getElementById('titleScreen')?.remove();document.querySelector('[data-nav="arcade"]').click();LuckyDexArcadeWorld.openGame('targetRange');LuckyDexTargetRange.startExhibition({difficulty:'easy',participant:{id:207,key:'207:n',name:'Gligar',baseStat:35,types:[type,'flying']},attackType:type});},type);
  await page.locator('#targetRangePlay').waitFor({state:'visible'});return {context,page};
}

test('live portrait range fills the phone without scroll; low shooter, precise reticle and safe controls',async()=>{
  for(const viewport of [{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:320,height:568},{width:768,height:1024}]){
    const {page,context}=await open(viewport);
    try{
      const b=await page.locator('#targetRangeGallery').boundingBox(),p=await page.locator('#targetRangePokemon').boundingBox(),c=await page.locator('#targetRangeControl').boundingBox(),r=await page.locator('#targetRangeReticle').boundingBox();
      await page.screenshot({path:path.join(out,`${viewport.width}x${viewport.height}-ground.png`)});
      assert.ok(b.height>b.width*1.08,`range must not be a banner: ${JSON.stringify(b)}`);
      assert.ok((p.y+p.height/2-b.y)/b.height>.84,'Pokémon must stand in low foreground');
      assert.ok(p.x+p.width/2>b.x+b.width*.35&&p.x+p.width/2<b.x+b.width*.65);
      assert.ok(r.width<=21&&r.height<=21,'reticle stays small');
      assert.ok(c.y+c.height<=viewport.height-12,'gesture-area clearance');
      const overflow=await page.evaluate(()=>({x:document.documentElement.scrollWidth-innerWidth,y:document.documentElement.scrollHeight-innerHeight,p:document.getElementById('targetRangeGame').scrollHeight-document.getElementById('targetRangeGame').clientHeight}));
      assert.ok(overflow.x<=1&&overflow.y<=1&&overflow.p<=1,JSON.stringify(overflow));
      assert.equal(await page.locator('#targetRangePokemon').evaluate(n=>n.complete&&n.naturalWidth>0),true,'offline shooter art');
    }finally{await context.close();}
  }
});

test('near/far visual sizes and depth agree with distance; gold retains readable target rings',async()=>{
  const {page,context}=await open();try{
    const rows=await page.evaluate(()=>{
      const row={id:65,name:'Alakazam',baseStat:100,types:['psychic']};
      const values=[];
      for(let seed=1;seed<=60;seed++){
        LuckyDexTargetRange.startGoldenrodRound({player:row,seed,divisionId:'master',roundIndex:2,attackType:'psychic'});
        const s=LuckyDexTargetRange.snapshot(),r=document.getElementById('targetRangeTarget').getBoundingClientRect();values.push({distance:Number(document.getElementById('targetRangeDistance').textContent.split(' ')[0]),y:r.y+r.height/2,size:r.width});
      }return values;
    });
    const a=rows.toSorted((a,b)=>a.distance-b.distance)[0],b=rows.toSorted((a,b)=>b.distance-a.distance)[0];
    assert.ok(b.distance-a.distance>=25&&a.size>b.size*1.5&&a.y>b.y+80,JSON.stringify({a,b}));
    await page.evaluate(()=>{state.settings.rareOdds.targetRangeGolden=1;LuckyDexTargetRange.startExhibition({participant:{id:25,baseStat:60,types:['electric']},difficulty:'easy'});});
    assert.equal(await page.locator('#targetRangeTarget .ring').count(),4);
  }finally{await context.close();}
});

test('live charge rises and falls, and a real pointer release shoots exactly once',async()=>{
  const {page,context}=await open();try{
    await page.clock.install();
    const b=await page.locator('#targetRangeControl').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
    await page.clock.runFor(1500);const high=Number((await page.locator('#targetRangeFocusValue').textContent()).replace('%',''));
    await page.screenshot({path:path.join(out,'ideal-release.png')});
    await page.clock.runFor(1500);const low=Number((await page.locator('#targetRangeFocusValue').textContent()).replace('%',''));
    assert.ok(high>=90&&low<15,JSON.stringify({high,low}));
    await page.mouse.up();await page.clock.runFor(1700);
    assert.equal(await page.evaluate(()=>LuckyDexTargetRange.snapshot().shots),1);
    await page.clock.runFor(1600);assert.equal(await page.evaluate(()=>LuckyDexTargetRange.snapshot().shots),1);
  }finally{await context.close();}
});

test('actual projectile launches from Pokémon and its last pixel is the scored impact',async()=>{
  const {page,context}=await open();try{
    await page.clock.install();await page.evaluate(()=>LuckyDexTargetRange.fire(1));await page.clock.runFor(20);
    const launch=await page.evaluate(()=>{const g=targetRangeGallery.getBoundingClientRect(),p=targetRangePokemon.getBoundingClientRect();return {x:parseFloat(targetRangeProjectile.style.left)/100,y:parseFloat(targetRangeProjectile.style.top)/100,px:(p.x+p.width/2-g.x)/g.width,py:(p.y+p.height*.35-g.y)/g.height};});
    assert.ok(Math.abs(launch.x-launch.px)<.025&&Math.abs(launch.y-launch.py)<.04,JSON.stringify(launch));
    await page.clock.runFor(1300);
    const end=await page.evaluate(()=>({x:parseFloat(targetRangeProjectile.style.left)/100,y:parseFloat(targetRangeProjectile.style.top)/100,result:LuckyDexTargetRange.snapshot().lastResult}));
    assert.ok(end.result,'the shot actually settled');
    assert.ok(Math.abs(end.x-end.result.shot.impactX)<.0001&&Math.abs(end.y-end.result.shot.impactY)<.0001,JSON.stringify(end));
  }finally{await context.close();}
});

test('closing/restarting cancels old flight and reopening never duplicates pointer shots',async()=>{
  const {page,context}=await open();try{
    await page.clock.install();
    for(let i=0;i<4;i++){
      await page.evaluate(()=>{LuckyDexTargetRange.fire(1);LuckyDexTargetRange.close();LuckyDexTargetRange.open();LuckyDexTargetRange.startExhibition({participant:{id:25,baseStat:60,types:['electric']},difficulty:'easy'});});
      await page.clock.runFor(2500);
      assert.equal(await page.evaluate(()=>LuckyDexTargetRange.snapshot().run.currentIndex),0,'old impact must not score in new run');
      const b=await page.locator('#targetRangeControl').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.clock.runFor(1500);await page.mouse.up();await page.clock.runFor(2300);
      assert.equal(await page.evaluate(()=>LuckyDexTargetRange.snapshot().shots),1,'one pointer release, one shot');
    }
  }finally{await context.close();}
});

test('ordinary bottom-pad gestures can reach and bullseye both near and far phone targets',async()=>{
  for(const viewport of [{width:360,height:640},{width:360,height:780},{width:412,height:915}]){
    const {page,context}=await open(viewport);try{
      await page.clock.install();
      for(const distance of [10,50]){
        const aim=await page.evaluate(distance=>{
          const C=LuckyDexTargetRangeCore,profile=C.divisionProfile('rookie',0),player={id:25,baseStat:60,types:['electric']};state.settings.rareOdds.targetRangeGolden=0;
          let seed=1,target;for(;seed<5000;seed++){target=C.createRound({profile,seed,goldenRate:0}).targets[0];if(target.distanceM===distance)break;}
          LuckyDexTargetRange.startGoldenrodRound({player,seed,divisionId:'rookie',attackType:'electric'});
          const trajectory=C.projectileSolution({distanceM:distance,wind:target.wind,focus:1,spAtk:60}),g=targetRangeGallery;
          return {x:target.x-trajectory.drift,y:target.y-trajectory.drop*g.clientWidth/g.clientHeight};
        },distance);
        const g=await page.locator('#targetRangeGallery').boundingBox(),c=await page.locator('#targetRangeControl').boundingBox(),s=await page.evaluate(()=>LuckyDexTargetRange.snapshot());
        const start={x:c.x+c.width/2,y:c.y+c.height/2},end={x:start.x+(aim.x-s.aimX)*g.width/1.08,y:start.y+(aim.y-s.aimY)*g.height/1.02};
        assert.ok(end.y>0&&end.y<viewport.height-5,`reachable ${distance}m ${viewport.width}x${viewport.height}: ${JSON.stringify({start,end})}`);
        await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:12});await page.clock.runFor(1600);await page.mouse.up();await page.clock.runFor(1600);
        assert.equal(await page.evaluate(()=>LuckyDexTargetRange.snapshot().lastResult?.hit.ring),'bullseye',`${distance}m normal pointer aim`);
      }
    }finally{await context.close();}
  }
});

test('gallery also supports a precision hold; cancelling it never fires',async()=>{
  const {page,context}=await open();try{
    await page.clock.install();const g=await page.locator('#targetRangeGallery').boundingBox();
    await page.mouse.move(g.x+g.width*.2,g.y+g.height*.45);await page.mouse.down();await page.clock.runFor(800);
    assert.match(await page.locator('#targetRangeControl').getAttribute('class'),/is-drawing/);
    assert.ok(Number((await page.locator('#targetRangeFocusValue').textContent()).replace('%',''))>25);
    await page.locator('#targetRangePlay').dispatchEvent('pointercancel',{pointerId:1});await page.mouse.up();await page.clock.runFor(2000);
    assert.equal(await page.evaluate(()=>LuckyDexTargetRange.snapshot().shots),0);
  }finally{await context.close();}
});
