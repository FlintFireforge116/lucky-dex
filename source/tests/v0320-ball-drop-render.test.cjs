'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {launch}=require('../scripts/recovery-browser.cjs');
const root=path.resolve(__dirname,'..');
// Optional source argument is used to prove this regression fails on v0.31.
const sourcePath=process.argv[2]||path.join(root,'app/src/main/assets/arcade-ball-drop.js');
(async()=>{
  const browser=await launch();
  try{
    const page=await browser.newPage({viewport:{width:393,height:873},isMobile:true,hasTouch:true}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const ids=['Backboard','Pins','Prize','Powerup','Ball','Effects'];
    await page.setContent(`<meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#050b17}.ball-drop-machine{position:relative;width:393px;height:548px}.ball-drop-machine canvas{position:absolute;width:100%;height:100%;inset:0}</style><div class="ball-drop-machine">${ids.map(id=>`<canvas id="ballDrop${id}Canvas" width="720" height="1004"></canvas>`).join('')}</div><button id="ballDropBtn">DROP BALL</button>`);
    await page.addScriptTag({content:fs.readFileSync(sourcePath,'utf8')});
    await page.evaluate(()=>{Math.random=()=>.5;window.model=LuckyDexBallDropV0180.startRun();});
    const pixels=await page.evaluate(()=>{
      const c=document.getElementById('ballDropPinsCanvas').getContext('2d');
      const alpha=(x,y)=>c.getImageData(x,y,1,1).data[3];
      return {oldCrown:alpha(122,128),slopedBody:alpha(119,138),leftRamp:alpha(5,140),rightRamp:alpha(714,140)};
    });
    assert.equal(pixels.oldCrown,0,'render must leave the removed circular crown transparent');
    assert.ok(pixels.slopedBody>200,'visible triangle must occupy the sloped collision solid');
    assert.ok(pixels.leftRamp>200&&pixels.rightRamp>200,'edge ramps must visibly join both side walls');
    await page.evaluate(()=>{const p=model.pegField.find(p=>p.special==='metronome');LuckyDexBallDropV0180._testTriggerSpecial({x:p.x+20,y:p.y,vx:0,vy:0,omega:0,specialCooldown:{}},p,1000,model.pegField,()=>0);});
    assert.deepEqual(errors,[],'triangle paths and targeted special-pin redraw must work on a native canvas');
    const out=path.join(root,'artifacts/v0320');fs.mkdirSync(out,{recursive:true});
    await page.screenshot({path:path.join(out,'ball-drop-slopes-phone.png')});
    console.log('PASS v0.32 native canvas sloped solids, symmetric wall ramps and Metronome redraw at 393px phone viewport');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
