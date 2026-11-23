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
test('SM5 GX attacks, Prism Star gates and no-fake-energy safeguards',()=>{
 for(const c of sm5.CARDS){
  if(c.kind==='pokemon'&&c.name.endsWith('-GX'))assert.equal(c.prizeCards,2);
  if(c.prismStar)assert.equal(c.battleEnabled,false);
  if(c.kind==='energy')assert.equal(c.battleEnabled,false,'new Unit/Prism special Energy not yet integrated');
 }
 const p=sm5.cardById('sm5-116');assert.ok(p);const prev=rows.find(r=>r[0]==='116');
 assert.equal(p.attacks.length,prev[7].length);assert.deepEqual(p.attacks.map(a=>a.cost),prev[7].map(a=>a[1]));
});
