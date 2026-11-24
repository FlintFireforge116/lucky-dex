'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const set=require('../app/src/main/assets/tcg-classic-detective-pikachu.js');
const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/det1-print-compact.json'),'utf8'));
const cv=JSON.parse(fs.readFileSync(path.join(root,'docs/DET1_BUILD_COVERAGE.json'),'utf8'));
const contract=require('../scripts/det1_release_contract.json');
const variantNos=[];
test('DET1 pinned 18 complete collector prints and attack costs',()=>{
 const expected=[];for(let i=1;i<=18;i++){expected.push(String(i));for(const v of variantNos)if(v.slice(0,-1)===String(i))expected.push(v);}
 assert.equal(rows.length,18);assert.equal(set.CARDS.length,18);assert.deepEqual(rows.map(r=>r[0]),expected);
 assert.deepEqual(set.CARDS.map(c=>c.id),expected.map(x=>'det1-'+x));
 assert.equal(rows.reduce((t,r)=>t+r[7].length,0),22);assert.equal(rows.reduce((t,r)=>t+r[8].length,0),4);
 assert.equal(rows.filter(r=>r[2]==='Trainer').length,0);assert.equal(rows.filter(r=>r[2]==='Energy').length,0);
 assert.equal(rows.filter(r=>r[3].includes('Prism Star')).length,0);
 assert.equal(rows.filter(r=>r[3].includes('GX')).length,0);assert.equal(contract.pin,cv.sourceGitBlob);
});
test('every enabled print preserves every full printed attack, Ability, Trainer/Energy rule and valid descriptor',()=>{
 for(let i=0;i<rows.length;i++){
  const r=rows[i],c=set.CARDS[i];assert.equal(c.name,r[1]);
  assert.equal(c.battleEnabled,c.deckEligible,c.id+' battle/deck gating disagreement');
  assert.equal(c.battleEnabled,c.support.status==='FULL',c.id+' FULL status mismatch');
  if(c.kind==='pokemon'){
   assert.equal(c.attacks.length,r[7].length,c.id);assert.equal(c.abilities.length,r[8].length,c.id);
   for(let j=0;j<r[7].length;j++){
    const a=c.attacks[j],p=r[7][j];assert.equal(a.name,p[0]);assert.deepEqual(a.cost,p[1],c.id+' '+a.name);
    assert.equal(a.damageText,p[2]||null);assert.equal(a.text,p[3]);
    if(c.battleEnabled){assert.notEqual(a.effect.type,'unsupported',c.id);assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);
     if(p[3]&&!/^\(You can.t use more than 1 GX attack/.test(p[3]))assert.notEqual(a.effect.type,'noop',c.id+' '+a.name);}
   }
   for(let j=0;j<r[8].length;j++){
    const a=c.abilities[j],p=r[8][j];assert.equal(a.name,p[0]);assert.equal(a.text,p[2]);
    if(c.battleEnabled){assert.notEqual(a.effect.type,'unsupported');assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}
   }
  }else if(c.battleEnabled){assert.deepEqual(fx.validateEffect(c.effect),[],c.id);assert.notEqual(c.effect.type,'noop',c.id);}
 }
 assert.equal(cv.battleReady,set.CARDS.filter(c=>c.battleEnabled).length);assert.equal(cv.battleReady+Object.keys(cv.gated).length,18);assert.equal(cv.battleReady,18);assert.deepEqual(Object.keys(cv.gated),[]);
 assert.deepEqual(cv.gated,Object.fromEntries(set.CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])));
});

test('Detective Pikachu registration, mixed set deck legality, and gating',()=>{const d=require('../app/src/main/assets/tcg-classic-battle-data.js'),b=require('../app/src/main/assets/tcg-classic-deck-builder.js'),o=require('../app/src/main/assets/tcg-classic-opponents.js'),p=require('../app/src/main/assets/tcg-classic-set-picker.js');assert.ok(d.SETS.some(s=>s.id==='det1'));assert.ok(b.SET_IDS.includes('det1'));assert.ok(o.SETS.includes('det1'));assert.equal(p.names.det1,'Detective Pikachu');for(const c of set.CARDS){assert.equal(d.cardById(c.id).battleEnabled,c.battleEnabled);assert.equal(d.cardById(c.id).deckEligible,c.deckEligible);}const owned=d.CARDS.filter(c=>['det1','sm9'].includes(c.setId)).map(c=>({gameplayId:c.id,quantity:4}));for(const r of [b.buildDeck(owned,{sets:['det1','sm9'],types:['Fire'],randomSeed:3}),o.generate({seed:3,sets:['det1','sm9'],type:'Fire'})]){assert.ok(r.ok,JSON.stringify(r));assert.equal(r.cards.length,30);assert.ok(d.validateDeck(r.cards).ok);assert.ok(r.cards.every(id=>['det1','sm9'].includes(d.cardById(id).setId)&&d.cardById(id).battleEnabled));}});

test('focused mixed-set deck actually uses owned Detective Pikachu Charmander',()=>{const d=require('../app/src/main/assets/tcg-classic-battle-data.js'),b=require('../app/src/main/assets/tcg-classic-deck-builder.js');const owned=d.CARDS.filter(c=>['det1','sm9'].includes(c.setId)).map(c=>({gameplayId:c.id,quantity:4}));const r=b.buildDeck(owned,{sets:['det1','sm9'],types:['Fire'],focusCardId:'det1-4',randomSeed:3});assert.ok(r.ok,JSON.stringify(r));assert.equal(r.cards.length,30);assert.ok(r.cards.includes('det1-4'));assert.ok(d.validateDeck(r.cards).ok);});
