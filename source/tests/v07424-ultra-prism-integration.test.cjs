'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const sm5=require('../app/src/main/assets/tcg-classic-ultra-prism.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const picker=require('../app/src/main/assets/tcg-classic-set-picker.js');
const rows=JSON.parse(fs.readFileSync(root+'/data/classic/sm5-print-compact.json','utf8'));
const coverage=require('../docs/SM5_BUILD_COVERAGE.json');
const contract=require('../scripts/sm5_release_contract.json');
test('SM5 178 canonical prints, attack costs and explicit gates',()=>{
 assert.equal(contract.pin,'66cbd13b706b789de3b8cce2f5c9fc95135a33b0');
 assert.equal(rows.length,178);assert.equal(sm5.CARDS.length,178);
 assert.deepEqual(rows.map(r=>r[0]),sm5.CARDS.map(c=>c.number));
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),237);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),37);
 assert.equal(rows.filter(r=>r[3].includes('Prism Star')).length,6);
 assert.equal(new Set(sm5.CARDS.map(c=>c.id)).size,178);
 for(let i=0;i<rows.length;i++){
  const r=rows[i],c=sm5.CARDS[i];
  assert.equal(c.id,'sm5-'+r[0]);assert.equal(c.name,r[1]);
  assert.equal(data.cardById(c.id),c,c.id+' not registered');
  assert.equal(c.deckEligible,c.battleEnabled,c.id+' gating mismatch');
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(r[4]));assert.deepEqual(c.types,r[5]);
   assert.equal(c.evolvesFrom,r[6]);assert.equal(c.retreat,r[11]);
   assert.equal(c.weakness,r[9]);assert.equal(c.resistance,r[10]);
   assert.deepEqual(c.attacks.map(a=>a.name),r[7].map(a=>a[0]));
   assert.deepEqual(c.attacks.map(a=>a.text),r[7].map(a=>a[3]));
   assert.deepEqual(c.attacks.map(a=>Array.isArray(a.cost)?a.cost.join(''):a.cost),r[7].map(a=>a[1].join('')));
   assert.deepEqual(c.abilities.map(a=>a.text),r[8].map(a=>a[2]));
   assert.equal(c.prizeCards,r[3].includes('GX')?2:1);
  }
  if(c.prismStar){assert.equal(c.battleEnabled,false,c.id+' Prism must be gated until one-copy/Lost Zone rules are implemented');assert.equal(c.maxDeckCopies,1);}
  if(!c.battleEnabled){assert.ok(coverage.gated[c.id]?.length,c.id+' missing blockers');continue;}
  for(const a of c.attacks||[]){assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);if(a.text.replace(/\(You can't use more than 1 GX attack in a game\.\)/g,'').trim())assert.notEqual(a.effect.type,'noop');}
  for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);
  if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],c.id+' trainer');
  if(c.kind==='energy')assert.deepEqual(fx.validateEffect(c.effect),[],c.id+' special Energy');
 }
 assert.equal(coverage.battleReady+Object.keys(coverage.gated).length,178);
});
test('SM5 alternate prints have identical rules, costs, Abilities and enabled statuses',()=>{
 for(const variant of contract.variants){const normal=sm5.cardById('sm5-'+variant.slice(0,-1)),alt=sm5.cardById('sm5-'+variant);assert.ok(normal&&alt,variant);
  for(const key of ['name','kind','battleEnabled','deckEligible','attacks','abilities','effect','trainerType','maxDeckCopies'])assert.deepEqual(alt[key],normal[key],variant+' '+key);
 }
});
test('SM5 is available in player builder, CPU builder and shared set picker',()=>{
 assert.ok(data.SETS.some(s=>s.id==='sm5'));assert.ok(builder.SET_IDS.includes('sm5'));assert.ok(cpu.SETS.includes('sm5'));
 assert.equal(data.coverage().ultraPrism.total,178);
 for(const ids of [builder.SET_IDS,cpu.SETS]){const html=picker.html({ids,selected:['sm5'],mode:'classic'});assert.match(html,/data-set-choice="sm5"[^>]*aria-pressed="true"/);assert.match(html,/Ultra Prism/);}
});
