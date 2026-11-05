'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const classic=require(path.join(assets,'tcg-classic-battle-data.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const workspace=require(path.join(assets,'tcg-classic-deck-workspace.js'));
const lab=require(path.join(assets,'tcgp-substitute-lab.js'));
const source=name=>fs.readFileSync(path.join(assets,name),'utf8');

function renderLab(){const listeners={};const container={innerHTML:'',contains:()=>true,addEventListener:(event,cb)=>{listeners[event]=cb},removeEventListener:event=>{delete listeners[event]}};lab.open({container,art:()=>''});return {container,listeners};}

test('Florio Nature Park is in both the Classic card catalogue and auto-build set selection',()=>{
  const cards=classic.CARDS.filter(c=>c.setId==='SNAPFLORIO');
  assert.equal(cards.length,123);
  assert.equal(cards.filter(c=>c.battleEnabled).length,123);
  assert.ok(builder.SET_IDS.includes('SNAPFLORIO'));
  assert.ok(workspace.query(workspace.catalogue([]),{filters:{set:'SNAPFLORIO',enabled:true}}).total===123);
  assert.match(source('tcg-classic-deck-editor.js'),/id==='SNAPFLORIO'\?'Florio Nature Park'/);
  assert.match(source('tcgp-battle-ui.js'),/id==='SNAPFLORIO'\?'Florio Nature Park'/);
});

test('Each energy archetype has one selector, including Darkness and Metal',()=>{
  assert.equal(new Set(builder.ARCHETYPE_TYPES).size,builder.ARCHETYPE_TYPES.length);
  assert.equal(builder.ARCHETYPE_TYPES.filter(x=>x==='Darkness').length,1);
  assert.equal(builder.ARCHETYPE_TYPES.filter(x=>x==='Metal').length,1);
});

test('Sandbox presents Classic combat playmats, piles, hand and Energy Zone in native board order',()=>{
  const {container,listeners}=renderLab(),html=container.innerHTML;
  assert.match(html,/tcgp-live-arena format-classic lental-wide-bench tcgp-lab-arena/);
  const order=['tcgp-live-opponent-top','tcgp-live-opponent tcgp-live-mat-half','tcgp-live-mid','tcgp-live-player tcgp-live-mat-half','tcgp-live-player-bottom'];
  let previous=-1;for(const segment of order){const pos=html.indexOf(segment);assert.ok(pos>previous,`${segment} should appear in normal battle order`);previous=pos;}
  assert.match(html,/tcgp-live-score tcgp-classic-score/);
  assert.match(html,/tcgp-live-energy-source/);
  assert.match(html,/tcgp-live-hand/);
  assert.match(html,/data-lab-action="slot"/);
  assert.match(html,/data-lab-action="next-turn"/);
  assert.match(html,/data-lab-action="perform"|No legal actions/);
  assert.match(html,/Florio Nature Park/);
  assert.ok(listeners.click);
  lab.close();
});

test('Tapping bench cards keeps selection and manual setup controls working',()=>{
  const {container,listeners}=renderLab();
  lab.setSlot('player','bench',4,'SNAPFLORIO-001');
  const button={dataset:{labAction:'slot',side:'player',zone:'bench',index:'4'}};
  listeners.click({target:{closest:()=>button}});
  assert.match(container.innerHTML,/You · Bench 5/);
  assert.match(container.innerHTML,/SNAPFLORIO-001/);
  assert.match(container.innerHTML,/data-lab-action="damage"/);
  assert.match(container.innerHTML,/data-lab-action="energy"/);
  lab.close();
});
