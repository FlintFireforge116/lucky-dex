const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('every hand card is draggable even when it has no legal play',()=>{
  const ui=read('app/src/main/assets/tcgp-battle-ui.js');
  assert.match(ui,/data-tcgp-hand-drag="\$\{index\}"/);
  assert.doesNotMatch(ui,/const dragAttrs=usable\?/);
});

test('direct hand target legality is specific to the dragged card and exact board slot',()=>{
  const ui=require('../app/src/main/assets/tcgp-battle-ui.js');
  assert.equal(typeof ui.directHandDropActionIndex,'function');
  const setup={phase:'setup',setupSide:'player',sides:{player:{active:null,bench:[]}}};
  const setupActions=[{type:'setupActive',handIndex:0},{type:'setupBench',handIndex:0}];
  assert.equal(ui.directHandDropActionIndex(setupActions,setup,0,'active',0),0);
  assert.equal(ui.directHandDropActionIndex(setupActions,setup,0,'bench',0),1);
  assert.equal(ui.directHandDropActionIndex(setupActions,setup,0,'bench',2),-1);
  assert.equal(ui.directHandDropActionIndex(setupActions,setup,1,'active',0),-1);

  const battle={phase:'battle',activeSide:'player',sides:{player:{active:{cardId:'A1-001'},bench:[{cardId:'A1-001'}]}}};
  const actions=[
    {type:'bench',handIndex:0},
    {type:'evolve',handIndex:1,target:'active'},
    {type:'evolve',handIndex:1,target:'bench',benchIndex:0},
    {type:'trainer',handIndex:2}
  ];
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'bench',1),0);
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'bench',2),-1);
  assert.equal(ui.directHandDropActionIndex(actions,battle,1,'active',0),1);
  assert.equal(ui.directHandDropActionIndex(actions,battle,1,'bench',0),2);
  assert.equal(ui.directHandDropActionIndex(actions,battle,2,'active',0),-1);
  assert.equal(ui.directHandDropActionIndex(actions,battle,2,'bench',1),-1);
});

test('drag styling hides the origin card and distinguishes valid and invalid targets',()=>{
  const css=read('app/src/main/assets/tcgp-battle.css');
  assert.match(css,/\.tcgp-live-hand-wrap\.tcgp-drag-origin[^{]*\{?[^}]*visibility\s*:\s*hidden/s);
  assert.match(css,/data-tcgp-drop-state="valid"/);
  assert.match(css,/data-tcgp-drop-state="invalid"/);
  assert.match(css,/content\s*:\s*"×"/);
});
