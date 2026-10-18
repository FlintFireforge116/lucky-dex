'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);

test('Snore War hides its ready/start panel during a live round and restores it at ready',()=>{
  let clock=1000;
  let queuedFrame=null;
  const ready={hidden:false};
  const controls={hidden:true};
  const button={disabled:true,addEventListener(){}};
  const start={addEventListener(){}};
  const fakeDocument={
    hidden:false,
    getElementById(id){
      return {
        snoreWarReady:ready,
        snoreWarControls:controls,
        snoreWarButton:button,
        snoreWarStart:start,
      }[id]||null;
    },
    querySelectorAll(){return[];},
    addEventListener(){},
  };
  const fakeWindow={
    performance:{now:()=>clock},
    requestAnimationFrame(cb){queuedFrame=cb;return 1;},
    cancelAnimationFrame(){queuedFrame=null;},
    addEventListener(){},
  };

  const oldWindow=global.window,oldDocument=global.document;
  global.window=fakeWindow;
  global.document=fakeDocument;
  const runtimePath=asset('arcade-snore-war.js');
  delete require.cache[require.resolve(runtimePath)];
  const runtime=require(runtimePath);
  try{
    runtime.showReady({difficulty:'normal'});
    assert.equal(ready.hidden,false,'ready panel should be visible before starting');
    assert.equal(controls.hidden,true,'live controls should be hidden before starting');

    runtime.startRound({difficulty:'normal'});
    assert.equal(ready.hidden,true,'ready/start panel should disappear during the round');
    assert.equal(controls.hidden,false,'live controls should replace the ready panel during the round');
    assert.equal(button.disabled,false,'Hypnosis input should be enabled during the round');

    runtime.showReady({difficulty:'normal'});
    assert.equal(ready.hidden,false,'ready/start panel should return after reset/replay');
    assert.equal(controls.hidden,true,'live controls should hide again at ready');
  }finally{
    runtime.close();
    delete require.cache[require.resolve(runtimePath)];
    if(oldWindow===undefined)delete global.window;else global.window=oldWindow;
    if(oldDocument===undefined)delete global.document;else global.document=oldDocument;
  }
});
