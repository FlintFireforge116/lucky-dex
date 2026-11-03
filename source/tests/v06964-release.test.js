'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const app=read('app/src/main/assets/app-v0167.js');
const html=read('app/src/main/assets/index.html');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const base=require('../app/src/main/assets/tcg-classic-base1.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');

test('v0.69.64 release markers agree exactly',()=>{
  assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.64'/);
  assert.match(html,/LUCKY DEX · v0\.69\.64/);
});

test('Base Set is 102 of 102 FULL with no unsupported structured mechanics',()=>{
  assert.deepEqual(base.coverage(),{FULL:102,PARTIAL:0,UNSUPPORTED:0,total:102,battleEnabled:96,deckEligible:96});
  const bad=[];
  for(const card of base.CARDS){
    if(card.support?.status!=='FULL')continue;
    const check=(label,effect)=>{if(effect&&!effects.supportsEffect(effect))bad.push(`${card.id} ${label}: ${effects.validateEffect(effect).join('; ')}`);};
    for(const [i,attack] of (card.attacks||[]).entries())check(`attack ${i}`,attack.effect);
    for(const [i,ability] of (card.abilities||[]).entries())check(`ability ${i}`,ability.effect);
    check('effect',card.effect);check('onAttach',card.onAttach);
  }
  assert.deepEqual(bad,[]);
});

test('every Base Set evolution points to a Base Set Pokemon identity',()=>{
  const names=new Set(base.CARDS.filter(c=>c.kind==='pokemon').map(c=>c.name));
  for(const card of base.CARDS.filter(c=>c.kind==='pokemon'&&c.stage!=='Basic')){
    assert.ok(card.evolvesFrom,`${card.name} must name its pre-evolution`);
    assert.ok(names.has(card.evolvesFrom),`${card.name} pre-evolution ${card.evolvesFrom} must exist`);
  }
});
