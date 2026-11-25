'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const set=require('../app/src/main/assets/tcg-classic-evolving-skies.js');
const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/swsh7-print-compact.json'),'utf8'));
const cv=JSON.parse(fs.readFileSync(path.join(root,'docs/SWSH7_BUILD_COVERAGE.json'),'utf8'));
const contract=require('../scripts/swsh7_release_contract.json');
const variantNos=[];
test('SWSH7 pinned 237 canonical collector prints and attack costs',()=>{
 const expected=[];for(let i=1;i<=237;i++){expected.push(String(i));for(const v of variantNos)if(v.slice(0,-1)===String(i))expected.push(v);}
 assert.equal(rows.length,237);assert.equal(set.CARDS.length,237);assert.deepEqual(rows.map(r=>r[0]),expected);
 assert.deepEqual(set.CARDS.map(c=>c.id),expected.map(x=>'swsh7-'+x));
 assert.equal(rows.reduce((t,r)=>t+r[7].length,0),309);assert.equal(rows.reduce((t,r)=>t+r[8].length,0),44);
 assert.equal(rows.filter(r=>r[2]==='Trainer').length,40);assert.equal(rows.filter(r=>r[2]==='Energy').length,4);
 assert.equal(rows.filter(r=>r[3].includes('Prism Star')).length,0);
 assert.equal(rows.filter(r=>r[3].includes('V')).length,51);assert.equal(contract.pin,cv.sourceGitBlob);
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
  }else if(c.battleEnabled&&!c.basicEnergy){assert.deepEqual(fx.validateEffect(c.effect),[],c.id);assert.notEqual(c.effect.type,'noop',c.id);}
 }
 assert.equal(cv.battleReady,set.CARDS.filter(c=>c.battleEnabled).length);assert.equal(cv.battleReady+Object.keys(cv.gated).length,237);assert.ok(cv.battleReady>0&&cv.battleReady<237);
 assert.deepEqual(cv.gated,Object.fromEntries(set.CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])));
});
test('alternate-art effects and one-copy/Lost-Zone Prism Star metadata are canonical',()=>{
 for(const no of variantNos){const a=set.cardById('swsh7-'+no),base=set.cardById('swsh7-'+no.slice(0,-1));assert.ok(a&&base);
  for(const key of ['name','battleEnabled','deckEligible','attacks','abilities','effect','trainerType'])assert.deepEqual(a[key],base[key],no+' '+key);}
 for(const c of set.CARDS.filter(c=>c.prismStar)){assert.equal(c.maxDeckCopies,1,c.id);assert.equal(c.prismStar,true,c.id);}
 assert.equal(set.CARDS.filter(c=>c.prismStar).length,0);
 assert.equal(set.CARDS.filter(c=>c.ultraBeast).every(c=>c.tags.includes('ultra-beast')),true);
});

test('central catalogue includes SWSH7 and preserves enable/gating status',()=>{const d=require('../app/src/main/assets/tcg-classic-battle-data.js');assert.ok(d.SETS.some(s=>s.id==='swsh7'));for(const c of set.CARDS){assert.equal(d.cardById(c.id).battleEnabled,c.battleEnabled);assert.equal(d.cardById(c.id).deckEligible,c.deckEligible);}});
test('Evolving Skies is selectable and builds legal player and CPU decks without gated prints',()=>{
 const d=require('../app/src/main/assets/tcg-classic-battle-data.js'),b=require('../app/src/main/assets/tcg-classic-deck-builder.js'),o=require('../app/src/main/assets/tcg-classic-opponents.js'),p=require('../app/src/main/assets/tcg-classic-set-picker.js');
 assert.ok(b.SET_IDS.includes('swsh7'));assert.ok(o.SETS.includes('swsh7'));assert.equal(p.names.swsh7,'Evolving Skies');
 const owned=set.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
 const player=b.buildDeck(owned,{sets:['swsh7'],types:['Water'],randomSeed:3}),cpu=o.generate({seed:3,sets:['swsh7'],type:'Water'});
 for(const r of [player,cpu]){assert.ok(r.ok,JSON.stringify(r));assert.equal(r.cards.length,30);assert.ok(d.validateDeck(r.cards).ok);assert.ok(r.cards.every(id=>d.cardById(id).setId==='swsh7'&&d.cardById(id).battleEnabled));}
});


test('V and VMAX retain printed stage, separate GX flags and prize values',()=>{for(const c of set.CARDS.filter(c=>c.pokemonV)){assert.equal(c.pokemonGX,false);assert.equal(c.prizeCards,c.pokemonVMAX?3:2);assert.equal(c.stage,c.pokemonVMAX?'VMAX':'Basic');assert.ok(c.attacks.every(a=>!a.gxAttack));if(c.pokemonVMAX)assert.ok(c.evolvesFrom.endsWith(' V'));}});

test('strike tags, alternate art and owned library projection are preserved',()=>{for(const [i,r] of rows.entries()){const c=set.CARDS[i];for(const [name,tag,key] of [['Single Strike','single-strike','singleStrike'],['Rapid Strike','rapid-strike','rapidStrike']]){assert.equal(c[key],r[3].includes(name));assert.equal(c.tags.includes(tag),r[3].includes(name));}}for(const [a,b] of [[7,166],[7,167],[13,168],[28,171],[31,173],[94,188],[94,189]]){const x=set.cardById('swsh7-'+a),y=set.cardById('swsh7-'+b);for(const k of ['name','battleEnabled','deckEligible','attacks','abilities','effect'])assert.deepEqual(x[k],y[k]);}const d=require('../app/src/main/assets/tcg-classic-battle-data.js');assert.equal(d.projectOwnedCards([{id:'SWSH7-028',source:'tcg',quantity:2}]).find(x=>x.gameplayId==='swsh7-28')?.quantity,2);});
test('Dragon archetype uses mixed printed Energy costs, never a Dragon Energy Zone',()=>{
 const d=require('../app/src/main/assets/tcg-classic-battle-data.js'),b=require('../app/src/main/assets/tcg-classic-deck-builder.js'),o=require('../app/src/main/assets/tcg-classic-opponents.js');
 for(const c of set.CARDS.filter(c=>c.types?.includes('Dragon'))){assert.equal(c.weakness,null);assert.equal(c.resistance,null);assert.ok(!c.deckMeta.energyTypes.includes('Dragon'));}
 for(const seed of [3,7,23]){
  const player=b.buildDeck(set.CARDS.map(c=>({gameplayId:c.id,quantity:4})),{sets:['swsh7'],types:['Dragon'],randomSeed:seed}),cpu=o.generate({seed,sets:['swsh7'],type:'Dragon'});
  for(const result of [player,cpu]){assert.ok(result.ok);assert.ok(d.validateDeck(result.cards).ok);assert.ok(result.cards.some(id=>d.cardById(id).types?.includes('Dragon')));assert.ok(!result.energyTypes.includes('Dragon'));assert.ok(result.energyTypes.length>=2);}
 }
});
