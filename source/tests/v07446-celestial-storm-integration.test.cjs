'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const set=require('../app/src/main/assets/tcg-classic-celestial-storm.js');
const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/sm7-print-compact.json'),'utf8'));
const cv=JSON.parse(fs.readFileSync(path.join(root,'docs/SM7_BUILD_COVERAGE.json'),'utf8'));
const contract=require('../scripts/sm7_release_contract.json');
const variantNos=['10a','123a','148a','177a'];
test('SM7 pinned 187 complete collector prints (including four extra variants) and attack costs',()=>{
 const expected=[];for(let i=1;i<=183;i++){expected.push(String(i));if(variantNos.includes(`${i}a`))expected.push(`${i}a`);}
 assert.equal(rows.length,187);assert.equal(set.CARDS.length,187);assert.deepEqual(rows.map(r=>r[0]),expected);
 assert.deepEqual(set.CARDS.map(c=>c.id),expected.map(x=>'sm7-'+x));
 assert.equal(rows.reduce((t,r)=>t+r[7].length,0),232);assert.equal(rows.reduce((t,r)=>t+r[8].length,0),51);
 assert.equal(rows.filter(r=>r[2]==='Trainer').length,43);assert.equal(rows.filter(r=>r[2]==='Energy').length,2);
 assert.equal(rows.filter(r=>r[3].includes('Prism Star')).length,3);
 assert.equal(rows.filter(r=>r[3].includes('GX')).length,30);assert.equal(contract.pin,cv.sourceGitBlob);
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
 assert.equal(cv.battleReady,set.CARDS.filter(c=>c.battleEnabled).length);assert.equal(cv.battleReady+Object.keys(cv.gated).length,187);assert.ok(cv.battleReady>=75);
 assert.deepEqual(cv.gated,Object.fromEntries(set.CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])));
});
test('alternate-art effects and one-copy/Lost-Zone Prism Star metadata are canonical',()=>{
 for(const no of variantNos){const a=set.cardById('sm7-'+no),base=set.cardById('sm7-'+no.slice(0,-1));assert.ok(a&&base);
  for(const key of ['name','battleEnabled','deckEligible','attacks','abilities','effect','trainerType'])assert.deepEqual(a[key],base[key],no+' '+key);}
 for(const c of set.CARDS.filter(c=>c.prismStar)){assert.equal(c.maxDeckCopies,1,c.id);assert.equal(c.prismStar,true,c.id);}
 assert.equal(set.CARDS.filter(c=>c.prismStar).length,3);
 assert.equal(set.CARDS.filter(c=>c.ultraBeast).every(c=>c.tags.includes('ultra-beast')),true);
});

test('central catalogue includes SM7 and preserves enable/gating status',()=>{const d=require('../app/src/main/assets/tcg-classic-battle-data.js');assert.ok(d.SETS.some(s=>s.id==='sm7'));for(const c of set.CARDS){assert.equal(d.cardById(c.id).battleEnabled,c.battleEnabled);assert.equal(d.cardById(c.id).deckEligible,c.deckEligible);}});
