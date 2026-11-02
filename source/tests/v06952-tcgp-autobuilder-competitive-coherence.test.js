'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const decks=require(path.join(assets,'tcgp-battle-decks.js'));

const row=(id,quantity=2)=>({gameplayId:id,quantity,battleEnabled:true,variants:[]});
const trainers=()=>data.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind==='trainer').map(c=>row(c.id,2));
const pokemonCounts=result=>{
  const out=new Map();
  for(const id of result.cards||[]){
    const c=data.cardById(id);
    if(c?.kind==='pokemon')out.set(c.name,(out.get(c.name)||0)+1);
  }
  return out;
};

test('competitive type filtering cannot promote an unfinished evolution into the archetype core',()=>{
  // Mirrors the bad on-device deck: one eligible Tynamo, two Eelektrik,
  // no eligible Eelektross, and one Pikachu ex.
  const rows=[...trainers(),row('A1-107',1),row('A1-108',2),row('A2b-022',2)];
  const result=decks.buildQuickDeck(rows,{type:'Lightning',style:'competitive'});
  assert.equal(result.ok,true);
  assert.doesNotMatch(result.strategy,/Eelektrik core/);
  const counts=pokemonCounts(result);
  assert.equal(counts.get('Eelektrik')||0,0,'unfinished Tynamo family should not be auto-added without a terminal endpoint');
  assert.equal(counts.get('Tynamo')||0,0,'pre-evolution-only package should not be treated as a competitive partner');
});

test('primary evolution line duplication never creates more evolutions than prerequisites',()=>{
  const rows=[...trainers(),row('A1-107',1),row('A1-108',2),row('A1-109',2),row('A2b-022',1)];
  const result=decks.buildQuickDeck(rows,{cardId:'A1-109',style:'competitive'});
  assert.equal(result.ok,true);
  const counts=pokemonCounts(result);
  assert.ok((counts.get('Eelektrik')||0)<=(counts.get('Tynamo')||0),`Eelektrik/Tynamo ratio is ${counts.get('Eelektrik')||0}/${counts.get('Tynamo')||0}`);
  assert.ok((counts.get('Eelektross')||0)<=(counts.get('Eelektrik')||0),`Eelektross/Eelektrik ratio is ${counts.get('Eelektross')||0}/${counts.get('Eelektrik')||0}`);
});

test('automatic competitive decks reject any internally unbalanced evolution counts',()=>{
  const rows=[...trainers(),row('A1-107',1),row('A1-108',2),row('A1-109',2),row('A2b-022',2)];
  const result=decks.buildQuickDeck(rows,{type:'Lightning',style:'competitive'});
  assert.equal(result.ok,true);
  const counts=pokemonCounts(result);
  for(const id of new Set(result.cards)){
    const c=data.cardById(id);
    if(c?.kind!=='pokemon'||c.stage==='Basic'||!c.evolvesFrom)continue;
    assert.ok((counts.get(c.name)||0)<=(counts.get(c.evolvesFrom)||0),`${c.name} count exceeds ${c.evolvesFrom}`);
  }
});

test('competitive Basic cores do not add an unrelated full Stage 2 family just to fill a Pokemon quota',()=>{
  const rows=data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>row(c.id,2));
  let target=null;
  for(let variant=0;variant<32;variant++){
    const result=decks.buildQuickDeck(rows,{type:'Lightning',style:'competitive',variant});
    assert.equal(result.ok,true);
    if(result.focusCardId==='A2b-022'){target=result;break;}
  }
  assert.ok(target,'expected Pikachu ex to remain a competitive Lightning candidate');
  const selected=(target.cards||[]).map(id=>data.cardById(id)).filter(c=>c?.kind==='pokemon');
  const secondaryStage2=selected.filter(c=>c.stage==='Stage 2'&&c.name!=='Pikachu ex');
  assert.equal(secondaryStage2.length,0,`unrelated Stage 2 filler found: ${secondaryStage2.map(c=>c.name).join(', ')}`);
});

test('competitive autobuild refuses a one-Basic deck instead of labelling it competitive',()=>{
  const rows=[...trainers(),row('A2b-022',1)];
  const result=decks.buildQuickDeck(rows,{type:'Lightning',style:'competitive'});
  assert.equal(result.ok,false,'one owned Basic should not be presented as a competitive deck');
});

test('single-type competitive builds do not force an unrelated evolution engine just to justify the selected Energy type',()=>{
  const rows=data.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>row(c.id,2));
  let target=null;
  for(let variant=0;variant<32;variant++){
    const result=decks.buildQuickDeck(rows,{type:'Lightning',style:'competitive',variant});
    assert.equal(result.ok,true);
    if(result.focusCardId==='A2-062'){target=result;break;} // Rotom: Lightning type, Colourless attack cost
  }
  assert.ok(target,'expected Rotom to remain a competitive Lightning candidate');
  const selected=target.cards.map(id=>data.cardById(id)).filter(c=>c?.kind==='pokemon');
  const secondaryStage2=selected.filter(c=>c.stage==='Stage 2');
  assert.equal(secondaryStage2.length,0,`single-type helper forced an unrelated Stage 2 line: ${secondaryStage2.map(c=>c.name).join(', ')}`);
});

test('runtime marker remains at or beyond v0.69.52',()=>{
  const fs=require('node:fs');
  const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
  const match=app.match(/window\.__LUCKYDEX_BUILD='0\.69\.(\d+)'/);
  assert.ok(match,'runtime marker should be present');
  assert.ok(Number(match[1])>=52,`runtime marker regressed to ${match[0]}`);
});
