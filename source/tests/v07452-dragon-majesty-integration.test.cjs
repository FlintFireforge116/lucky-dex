'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const set=require('../app/src/main/assets/tcg-classic-dragon-majesty.js');
const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/sm75-print-compact.json'),'utf8'));
const cv=JSON.parse(fs.readFileSync(path.join(root,'docs/SM75_BUILD_COVERAGE.json'),'utf8'));
const contract=require('../scripts/sm75_release_contract.json');
const variantNos=['40a','60a'];
test('SM75 pinned 80 complete collector prints (including two extra variants) and attack costs',()=>{
 const expected=[];for(let i=1;i<=78;i++){expected.push(String(i));if(variantNos.includes(`${i}a`))expected.push(`${i}a`);}
 assert.equal(rows.length,80);assert.equal(set.CARDS.length,80);assert.deepEqual(rows.map(r=>r[0]),expected);
 assert.deepEqual(set.CARDS.map(c=>c.id),expected.map(x=>'sm75-'+x));
 assert.equal(rows.reduce((t,r)=>t+r[7].length,0),115);assert.equal(rows.reduce((t,r)=>t+r[8].length,0),18);
 assert.equal(rows.filter(r=>r[2]==='Trainer').length,13);assert.equal(rows.filter(r=>r[2]==='Energy').length,0);
 assert.equal(rows.filter(r=>r[3].includes('Prism Star')).length,2);
 assert.equal(rows.filter(r=>r[3].includes('GX')).length,15);assert.equal(contract.pin,cv.sourceGitBlob);
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
 assert.equal(cv.battleReady,set.CARDS.filter(c=>c.battleEnabled).length);assert.equal(cv.battleReady+Object.keys(cv.gated).length,80);assert.equal(cv.battleReady,80);assert.deepEqual(cv.gated,{});
 assert.deepEqual(cv.gated,Object.fromEntries(set.CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])));
});
test('alternate-art effects and one-copy/Lost-Zone Prism Star metadata are canonical',()=>{
 for(const no of variantNos){const a=set.cardById('sm75-'+no),base=set.cardById('sm75-'+no.slice(0,-1));assert.ok(a&&base);
  for(const key of ['name','battleEnabled','deckEligible','attacks','abilities','effect','trainerType'])assert.deepEqual(a[key],base[key],no+' '+key);}
 for(const c of set.CARDS.filter(c=>c.prismStar)){assert.equal(c.maxDeckCopies,1,c.id);assert.equal(c.prismStar,true,c.id);}
 assert.equal(set.CARDS.filter(c=>c.prismStar).length,2);
 assert.equal(set.CARDS.filter(c=>c.ultraBeast).every(c=>c.tags.includes('ultra-beast')),true);
});

test('central catalogue includes SM75 and preserves enable/gating status',()=>{const d=require('../app/src/main/assets/tcg-classic-battle-data.js');assert.ok(d.SETS.some(s=>s.id==='sm75'));for(const c of set.CARDS){assert.equal(d.cardById(c.id).battleEnabled,c.battleEnabled);assert.equal(d.cardById(c.id).deckEligible,c.deckEligible);}});
test('Dragon Majesty is selectable and builds legal player and CPU decks without gated prints',()=>{
 const d=require('../app/src/main/assets/tcg-classic-battle-data.js'),b=require('../app/src/main/assets/tcg-classic-deck-builder.js'),o=require('../app/src/main/assets/tcg-classic-opponents.js'),p=require('../app/src/main/assets/tcg-classic-set-picker.js');
 assert.ok(b.SET_IDS.includes('sm75'));assert.ok(o.SETS.includes('sm75'));assert.equal(p.names.sm75,'Dragon Majesty');
 const owned=set.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
 const player=b.buildDeck(owned,{sets:['sm75'],types:['Fire'],randomSeed:3}),cpu=o.generate({seed:3,sets:['sm75'],type:'Dragon'});
 for(const r of [player,cpu]){assert.ok(r.ok,JSON.stringify(r));assert.equal(r.cards.length,30);assert.ok(d.validateDeck(r.cards).ok);assert.ok(r.cards.every(id=>d.cardById(id).setId==='sm75'&&d.cardById(id).battleEnabled));}
});

test('Dragon Majesty mono-Water generation succeeds for player and CPU across seeds',()=>{const d=require('../app/src/main/assets/tcg-classic-battle-data.js'),b=require('../app/src/main/assets/tcg-classic-deck-builder.js'),o=require('../app/src/main/assets/tcg-classic-opponents.js');const owned=set.CARDS.map(c=>({gameplayId:c.id,quantity:4}));for(const seed of [3,9,21])for(const r of [b.buildDeck(owned,{sets:['sm75'],types:['Water'],randomSeed:seed}),o.generate({sets:['sm75'],type:'Water',seed})]){assert.ok(r.ok,JSON.stringify(r));assert.equal(r.cards.length,30);assert.ok(d.validateDeck(r.cards).ok);assert.ok(r.cards.every(id=>d.cardById(id).setId==='sm75'&&d.cardById(id).battleEnabled));assert.deepEqual(r.energyTypes,['Water']);}});

test('Narrow mono-Water fallback counts distinct Trainer names and never fills with an unmatched Dragon Talon',()=>{
 const d=require('../app/src/main/assets/tcg-classic-battle-data.js'),b=require('../app/src/main/assets/tcg-classic-deck-builder.js'),decks=require('../app/src/main/assets/tcg-classic-decks.js');
 const owned=set.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
 for(const style of ['competitive','random'])for(const seed of [3,9,21,42]){
  const r=b.buildDeck(owned,{sets:['sm75'],types:['Water'],style,randomSeed:seed});
  assert.ok(r.ok,JSON.stringify(r));assert.equal(r.cards.length,30);assert.deepEqual(r.energyTypes,['Water']);
  assert.ok(decks.validateDraft(r.cards,owned,{requireFull:true}).ok);
  const cards=r.cards.map(d.cardById);assert.ok(cards.every(c=>c.setId==='sm75'));
  if(!cards.some(c=>c.kind==='pokemon'&&c.types.includes('Dragon')))assert.ok(!cards.some(c=>c.name==='Dragon Talon'));
 }
});
