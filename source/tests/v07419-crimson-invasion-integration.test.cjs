'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const cards=require('../app/src/main/assets/tcg-classic-crimson-invasion.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const picker=require('../app/src/main/assets/tcg-classic-set-picker.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const src=JSON.parse(fs.readFileSync(root+'/data/classic/sm4-print-compact.json','utf8'));
const contract=require('../scripts/sm4_release_contract.json');
const coverage=require('../docs/SM4_BUILD_COVERAGE.json');

test('SM4: canonical pinned 126 prints, 193 attacks, 23 Abilities, 25 GX and 4 Energy',()=>{
 assert.equal(contract.pin,'0b99823554d4da6d2da4fcafa030f9b675008490');
 assert.equal(cards.CARDS.length,126);assert.equal(src.length,126);
 const a=new Set(contract.variants),expected=Array.from({length:124},(_,i)=>String(i+1)).flatMap(n=>a.has(n+'a')?[n,n+'a']:[n]);
 assert.deepEqual(src.map(r=>r[0]),expected);
 assert.equal(src.reduce((t,r)=>t+r[7].length,0),193);assert.equal(src.reduce((t,r)=>t+r[8].length,0),23);
 assert.equal(src.filter(r=>r[3].includes('GX')).length,25);
 assert.equal(src.reduce((t,r)=>t+r[7].filter(a=>a[0].endsWith('-GX')).length,0),25);
 assert.equal(src.filter(r=>r[2]==='Energy').length,4);
 assert.equal(new Set(cards.CARDS.map(c=>c.id)).size,126);
 for(let i=0;i<src.length;i++){
  const r=src[i],c=cards.CARDS[i];assert.equal(c.id,'sm4-'+r[0]);assert.equal(c.name,r[1]);
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
 assert.ok(coverage.battleReady>=50,'Unexpected playable regression');
 assert.equal(coverage.battleReady+Object.keys(coverage.gated).length,126);
});

test('SM4 collector variants duplicate gameplay and support consistently',()=>{
 for(const n of contract.variants){const basic=cards.cardById('sm4-'+n.slice(0,-1)),alt=cards.cardById('sm4-'+n);assert.ok(basic&&alt);
  assert.equal(basic.name,alt.name);assert.equal(basic.battleEnabled,alt.battleEnabled);
  assert.deepEqual(basic.attacks,alt.attacks);assert.deepEqual(basic.abilities,alt.abilities);
 }
});

test('SM4 player and CPU set pickers expose Crimson Invasion',()=>{
 assert.ok(data.SETS.some(s=>s.id==='sm4'));assert.ok(builder.SET_IDS.includes('sm4'));assert.ok(cpu.SETS.includes('sm4'));
 assert.equal(data.coverage().crimsonInvasion.total,126);
 for(const ids of [builder.SET_IDS,cpu.SETS]){
  const html=picker.html({ids,selected:['sm4'],mode:'classic'});
  assert.match(html,/data-set-choice="sm4"[^>]*aria-pressed="true"/);assert.match(html,/Crimson Invasion/);
 }
});

test('SM4-only battle-enabled player and CPU decks generate across seeds',()=>{
 const owned=cards.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 for(const seed of [3,24,56]){
  const b=builder.buildDeck(owned,{sets:['sm4'],style:seed%2?'competitive':'random',randomSeed:seed});
  assert.equal(b.ok,true,b.errors?.join('; '));assert.equal(b.cards.length,30);
  assert.ok(b.cards.every(id=>cards.cardById(id)?.battleEnabled),'player built gated/non-SM4');
  assert.deepEqual(decks.analyzeDeck(b.cards,b.energyTypes).missingEnergyTypes,[]);
  const playerTrainers=b.cards.map(data.cardById).filter(x=>x?.kind==='trainer');
  const playerFourOf=[...new Set(playerTrainers.map(x=>x.name))].filter(name=>playerTrainers.filter(x=>x.name===name).length>=4);
  assert.ok(playerFourOf.length<3,'SM4 single-set builder must not stuff unrelated four-of Trainer packages');
  const foe=cpu.generate({sets:['sm4'],type:[['Grass','Fire','Water'][seed%3]],seed});
  assert.equal(foe.ok,true,foe.error);assert.equal(foe.cards.length,30);
  assert.ok(foe.cards.every(id=>cards.cardById(id)?.battleEnabled),'CPU built gated/non-SM4');
  const cpuTrainers=foe.cards.map(data.cardById).filter(x=>x?.kind==='trainer');
  assert.ok([...new Set(cpuTrainers.map(x=>x.name))].filter(name=>cpuTrainers.filter(x=>x.name===name).length>=4).length<3,
    'SM4 CPU decks must use the legal 30-card fallback');
 }
});
