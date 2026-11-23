'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const cards=require('../app/src/main/assets/tcg-classic-burning-shadows.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const picker=require('../app/src/main/assets/tcg-classic-set-picker.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const src=JSON.parse(fs.readFileSync(root+'/data/classic/sm3-print-compact.json','utf8'));
const contract=require('../scripts/sm3_release_contract.json');
const coverage=require('../docs/SM3_BUILD_COVERAGE.json');

test('SM3: canonical pinned 177 prints, 274 attacks, 27 Abilities, 40 GX and 3 Basic Energy',()=>{
 assert.equal(contract.pin,'3476b25cb32b6e748c7fdd9405e6a5329a665d3d');
 assert.equal(cards.CARDS.length,177);assert.equal(src.length,177);
 const a=new Set(contract.variants),expected=Array.from({length:169},(_,i)=>String(i+1)).flatMap(n=>a.has(n+'a')?[n,n+'a']:[n]);
 assert.deepEqual(src.map(r=>r[0]),expected);
 assert.equal(src.reduce((t,r)=>t+r[7].length,0),274);assert.equal(src.reduce((t,r)=>t+r[8].length,0),27);
 assert.equal(src.filter(r=>r[3].includes('GX')).length,40);
 assert.equal(src.reduce((t,r)=>t+r[7].filter(a=>a[0].endsWith('-GX')).length,0),40);
 assert.equal(src.filter(r=>r[2]==='Energy').length,3);
 assert.equal(new Set(cards.CARDS.map(c=>c.id)).size,177);
 for(let i=0;i<src.length;i++){
  const r=src[i],c=cards.CARDS[i];assert.equal(c.id,'sm3-'+r[0]);assert.equal(c.name,r[1]);
  assert.equal(data.cardById(c.id),c,c.id+' unregistered');
  assert.equal(c.deckEligible,c.battleEnabled,c.id+' deck gating mismatch');
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(r[4]));assert.deepEqual(c.types,r[5]);assert.equal(c.evolvesFrom,r[6]);
   assert.equal(c.retreat,r[11]);assert.equal(c.weakness,r[9]);assert.equal(c.resistance,r[10]);
   assert.deepEqual(c.attacks.map(a=>a.name),r[7].map(a=>a[0]));
   assert.deepEqual(c.attacks.map(a=>a.text),r[7].map(a=>a[3]));
   assert.deepEqual(c.attacks.map(a=>Array.isArray(a.cost)?a.cost.join(''):a.cost),r[7].map(a=>a[1].join('')));
   assert.equal(c.abilities.length,r[8].length);
   assert.equal(c.prizeCards,r[3].includes('GX')?2:1);
  }
  if(!c.battleEnabled){assert.ok(coverage.gated[c.id]?.length,c.id+' lacks explicit blocker');continue;}
  for(const a of c.attacks||[]){assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);if(a.text.replace(/\(You can't use more than 1 GX attack in a game\.\)/g,'').trim())assert.notEqual(a.effect.type,'noop',c.id+' nonempty printed effect must not become noop');}
  for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);
  if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],c.id+' trainer');
  if(c.kind==='energy'&&!c.basicEnergy)assert.deepEqual(fx.validateEffect(c.effect),[],c.id+' special');
 }
 assert.ok(coverage.battleReady>=65,'Unexpected playable regression');
 assert.equal(coverage.battleReady+Object.keys(coverage.gated).length,177);
});

test('SM3 collector variants duplicate gameplay and support consistently',()=>{
 for(const n of contract.variants){const basic=cards.cardById('sm3-'+n.slice(0,-1)),alt=cards.cardById('sm3-'+n);assert.ok(basic&&alt);
  assert.equal(basic.name,alt.name);assert.equal(basic.battleEnabled,alt.battleEnabled);
  assert.deepEqual(basic.attacks,alt.attacks);assert.deepEqual(basic.abilities,alt.abilities);
 }
});

test('SM3 player and CPU set pickers expose Burning Shadows',()=>{
 assert.ok(data.SETS.some(s=>s.id==='sm3'));assert.ok(builder.SET_IDS.includes('sm3'));assert.ok(cpu.SETS.includes('sm3'));
 assert.equal(data.coverage().burningShadows.total,177);
 for(const ids of [builder.SET_IDS,cpu.SETS]){
  const html=picker.html({ids,selected:['sm3'],mode:'classic'});
  assert.match(html,/data-set-choice="sm3"[^>]*aria-pressed="true"/);assert.match(html,/Burning Shadows/);
 }
});

test('SM3-only battle-enabled player and CPU decks generate across seeds',()=>{
 const owned=cards.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 for(const seed of [3,24,56]){
  const b=builder.buildDeck(owned,{sets:['sm3'],style:seed%2?'competitive':'random',randomSeed:seed});
  assert.equal(b.ok,true,b.errors?.join('; '));assert.equal(b.cards.length,30);
  assert.ok(b.cards.every(id=>cards.cardById(id)?.battleEnabled),'player built gated/non-SM3');
  assert.deepEqual(decks.analyzeDeck(b.cards,b.energyTypes).missingEnergyTypes,[]);
  const playerTrainers=b.cards.map(data.cardById).filter(x=>x?.kind==='trainer');
  const playerFourOf=[...new Set(playerTrainers.map(x=>x.name))].filter(name=>playerTrainers.filter(x=>x.name===name).length>=4);
  assert.ok(playerFourOf.length<3,'SM3 single-set builder must not stuff unrelated four-of Trainer packages');
  const foe=cpu.generate({sets:['sm3'],type:['Grass','Fire','Water'][seed%3],seed});
  assert.equal(foe.ok,true,foe.error);assert.equal(foe.cards.length,30);
  assert.ok(foe.cards.every(id=>cards.cardById(id)?.battleEnabled),'CPU built gated/non-SM3');
  const cpuTrainers=foe.cards.map(data.cardById).filter(x=>x?.kind==='trainer');
  assert.ok([...new Set(cpuTrainers.map(x=>x.name))].filter(name=>cpuTrainers.filter(x=>x.name===name).length>=4).length<3,
    'SM3 CPU decks must use the same non-redundant Trainer fallback');
 }
});
