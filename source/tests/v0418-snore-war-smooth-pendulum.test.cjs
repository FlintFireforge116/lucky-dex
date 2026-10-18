'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);

test('Snore War pendulum stays continuous when RAF timestamp uses a different timebase',()=>{
  const core=require(asset('arcade-snore-war-core.js'));
  let clock=1000;
  let queuedFrame=null;
  let angle='-43deg';
  const pendulum={
    style:{setProperty(name,value){if(name==='--snore-angle')angle=value;}},
    classList:{toggle(){}},
  };
  const fakeDocument={
    getElementById(id){return id==='snoreWarPendulum'?pendulum:null;},
    querySelectorAll(){return[];},
    addEventListener(){},
  };
  const fakeWindow={
    performance:{now:()=>clock},
    requestAnimationFrame(cb){queuedFrame=cb;return 1;},
    cancelAnimationFrame(){},
    addEventListener(){},
  };

  const oldWindow=global.window,oldDocument=global.document;
  global.window=fakeWindow;
  global.document=fakeDocument;
  const runtimePath=asset('arcade-snore-war.js');
  delete require.cache[require.resolve(runtimePath)];
  const runtime=require(runtimePath);
  try{
    runtime.startRound({difficulty:'normal'});
    const referenceRace=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:1000});
    const center=core.centerTimeForIndex(referenceRace,0);
    clock=center;
    runtime.press();
    assert.ok(Math.abs(parseFloat(angle))<0.5,'press at centre should render the pendulum at centre');

    clock=center+16;
    assert.equal(typeof queuedFrame,'function','runtime should schedule an animation frame');
    queuedFrame(50000); // Deliberately unrelated RAF timestamp origin.
    assert.ok(Math.abs(parseFloat(angle))<5,`pendulum should continue just past centre, got ${angle}`);
  }finally{
    runtime.close();
    delete require.cache[require.resolve(runtimePath)];
    if(oldWindow===undefined)delete global.window;else global.window=oldWindow;
    if(oldDocument===undefined)delete global.document;else global.document=oldDocument;
  }
});
