'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../app/src/main/assets/arcade-fishing-core.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');

test('catch zone responds strongly to a short press and reverses direction quickly on release',()=>{
  const item=C.createCatch({species:S.byId[129],rolls:{size:.5},rod:'old'});
  const run=C.startFight(item,'old',123);run.zoneY=.5;run.zoneV=0;
  C.stepFight(run,{hold:true},80);
  const raised=run.zoneY;
  assert(raised<.47,`80ms press should visibly raise zone; got ${raised}`);
  C.stepFight(run,{hold:false},80);
  assert(run.zoneY>raised,`80ms release should reverse immediately; ${raised} -> ${run.zoneY}`);
});
