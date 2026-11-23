'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const sm5=require('../app/src/main/assets/tcg-classic-ultra-prism.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const rows=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/classic/sm5-print-compact.json'),'utf8'));
test('SM5 inherited attacks and reusable mechanics preserve print text exactly',()=>{
 const first=sm5.cardById('sm5-1');assert.ok(first);assert.equal(first.attacks[0].name,'Continuous Eggsplosion');
 assert.deepEqual(first.attacks[0].cost,['G']);
 assert.deepEqual(first.attacks[0].effect,{type:'coinDamage',coins:'untilTails',amount:20,mode:'replace'});
 assert.deepEqual(fx.validateEffect(first.attacks[0].effect),[]);
 const ready=sm5.CARDS.filter(c=>c.battleEnabled);assert.ok(ready.length>0);
 for(const c of ready)for(const atk of c.attacks||[])if(atk.text.trim())assert.notEqual(atk.effect.type,'unsupported');
});
test('SM5 GX prizes, enabled Prism Star prints and integrated one-unit Special Energy',()=>{
 const prismIds=['58','62','77','89','120','136'].map(n=>'sm5-'+n);
 const energyIds=['136','137','138','170','171'].map(n=>'sm5-'+n);
 assert.deepEqual(sm5.CARDS.filter(c=>c.prismStar).map(c=>c.id),prismIds);
 assert.deepEqual(sm5.CARDS.filter(c=>c.kind==='energy').map(c=>c.id),energyIds);
 for(const c of sm5.CARDS){
  if(c.kind==='pokemon'&&c.name.endsWith('-GX'))assert.equal(c.prizeCards,2);
  if(c.prismStar){
   assert.equal(c.battleEnabled,true,c.id+' Prism Star should be implemented by Stage 5');
   assert.equal(c.deckEligible,true,c.id+' Prism Star should be deck-eligible');
   assert.equal(c.maxDeckCopies,1,c.id+' one-copy limit must remain enforced');
   assert.equal(c.support.status,'FULL',c.id+' must not bypass missing effects');
  }
  if(c.kind==='energy'){
   assert.equal(c.battleEnabled,true,c.id+' Stage 4 Special Energy should be implemented');
   assert.equal(c.deckEligible,true,c.id+' Special Energy should be deck-eligible');
   assert.deepEqual(fx.validateEffect(c.effect),[],c.id+' invalid Special Energy descriptor');
   assert.equal(c.effect.type,'specialEnergy');
   assert.deepEqual(c.effect.provides,{Colorless:1},c.id+' must not create extra simultaneous Energy units');
  }
 }
 const p=sm5.cardById('sm5-116');assert.ok(p);const prev=rows.find(r=>r[0]==='116');
 assert.equal(p.attacks.length,prev[7].length);assert.deepEqual(p.attacks.map(a=>a.cost),prev[7].map(a=>a[1]));
});
