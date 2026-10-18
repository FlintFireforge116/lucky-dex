const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{launch,open}=require('./target-range-browser-fixture.cjs');
const out=path.resolve(__dirname,'../artifacts/v0423/visual');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await launch(),results=[];try{
  for(const viewport of [{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:320,height:568},{width:768,height:1024}]){
    const {context,page}=await open(browser,viewport);try{
      await page.clock.install();
      const types=viewport.width===360&&viewport.height===780?await page.evaluate(()=>Object.keys(LuckyDexTargetRangeCore.ATTACKS)):['ground','grass','water','psychic'];
      for(const type of types)for(const distance of [10,50]){
        const selection=await page.evaluate(({type,distance})=>{
          const C=LuckyDexTargetRangeCore,profile=C.divisionProfile('rookie',0),player={id:type==='psychic'?65:type==='water'?7:207,name:type==='psychic'?'Alakazam':type==='water'?'Squirtle':'Gligar',baseStat:65,types:[type]};
          state.settings.rareOdds.targetRangeGolden=0;
          let seed=1;for(;seed<5000;seed++)if(C.createRound({profile,seed,goldenRate:0}).targets[0].distanceM===distance)break;
          if(seed===5000)throw Error('Missing seeded distance fixture');
          LuckyDexTargetRange.startGoldenrodRound({player,attackType:type,divisionId:'rookie',seed});return {seed};
        },{type,distance});
        const metrics=await page.evaluate(()=>{const g=targetRangeGallery.getBoundingClientRect(),p=targetRangePokemon.getBoundingClientRect(),c=targetRangeControl.getBoundingClientRect(),t=targetRangeTarget.getBoundingClientRect();return {distance:targetRangeDistance.textContent,gallery:{w:g.width,h:g.height},shooterY:(p.y+p.height/2-g.y)/g.height,targetY:(t.y+t.height/2-g.y)/g.height,targetSize:t.width,controlBottom:c.bottom,docOverflow:document.documentElement.scrollHeight-innerHeight,horizontal:document.documentElement.scrollWidth-innerWidth,paneOverflow:targetRangeGame.scrollHeight-targetRangeGame.clientHeight,artLoaded:targetRangePokemon.complete&&targetRangePokemon.naturalWidth>0};});
        assert.equal(metrics.distance,`${distance} m`);assert.ok(metrics.gallery.h>metrics.gallery.w);assert.ok(metrics.shooterY>.84);assert.ok(metrics.controlBottom<=viewport.height-12);assert.ok(metrics.docOverflow<=1&&metrics.horizontal<=1&&metrics.paneOverflow<=1&&metrics.artLoaded);
        const file=`${viewport.width}x${viewport.height}-${type}-${distance}m.png`;await page.screenshot({path:path.join(out,file)});results.push({viewport,type,...selection,...metrics,file});
      }
      if(viewport.width===360&&viewport.height===780){
        await page.evaluate(()=>{const C=LuckyDexTargetRangeCore;state.settings.rareOdds.targetRangeGolden=1;let seed=1;while(!C.createRound({profile:C.divisionProfile('rookie',0),seed,goldenRate:1}).targets[0].golden)seed++;LuckyDexTargetRange.startGoldenrodRound({seed,divisionId:'rookie',player:{id:65,name:'Alakazam',baseStat:135,types:['psychic']},attackType:'psychic'});});
        assert.equal(await page.locator('#targetRangeTarget.is-golden .ring').count(),4);await page.screenshot({path:path.join(out,'golden-target.png')});
        const c=await page.locator('#targetRangeControl').boundingBox();await page.mouse.move(c.x+c.width/2,c.y+c.height/2);await page.mouse.down();await page.clock.runFor(1500);await page.screenshot({path:path.join(out,'ideal-hold.png')});await page.mouse.up();
        await page.clock.runFor(350);await page.screenshot({path:path.join(out,'psybeam-flight.png')});await page.clock.runFor(1000);await page.screenshot({path:path.join(out,'impact-feedback.png')});
      }
    }finally{await context.close();}
  }
  fs.writeFileSync(path.join(out,'visual-qa.json'),JSON.stringify({captures:results.length+4,offline:true,results},null,2));console.log(`PASS ${results.length+4} offline captures, five viewports, all 18 type scenes, 10/50m, gold/hold/flight/impact`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
