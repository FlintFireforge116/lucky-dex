'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const assets=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(assets,'tcgp-battle-ui.js'));
const css=()=>fs.readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');

function battleWith(handCardId){
  return {
    phase:'battle',activeSide:'player',
    sides:{player:{active:{uid:'a',cardId:'A1-001'},bench:[{uid:'b0',cardId:'A1-002',benchSlot:0}],hand:[{uid:'h',cardId:handCardId}]}}
  };
}

test('untargeted Trainer can be played by dropping it onto the player Active area',()=>{
  const actions=[{type:'trainer',handIndex:0,cardId:'X-TRAINER'}];
  assert.equal(ui.directHandDropActionIndex(actions,battleWith('X-TRAINER'),0,'active',0),0);
});

test('targeted Trainer resolves only on the specific Pokémon it targets',()=>{
  const actions=[
    {type:'trainer',handIndex:0,cardId:'X-HEAL',target:'active'},
    {type:'trainer',handIndex:0,cardId:'X-HEAL',target:'bench',benchIndex:0}
  ];
  const battle=battleWith('X-HEAL');
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'active',0),0);
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'bench',0),1);
  assert.equal(ui.directHandDropActionIndex(actions,battle,0,'bench',2),-1);
});

test('Tool mini cards sit below the HP corner instead of overlapping it',()=>{
  const styles=css();
  assert.match(styles,/\.tcgp-live-tool-stack\{[^}]*top:44%/s);
  assert.match(styles,/\.tcgp-live-tool-stack\.compact\{[^}]*top:36%/s);
});

test('dragging uses Pokémon board zones as the primary Trainer play surface',()=>{
  const js=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
  assert.match(js,/untargetedTrainer/);
  assert.ok(!/tcgp-live-center-play">DROP CARD TO PLAY/.test(js),'centre strip should not advertise a tiny DROP CARD TO PLAY target');
});
