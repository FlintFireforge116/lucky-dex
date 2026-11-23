'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const cards=require('../app/src/main/assets/tcg-classic-guardians-rising.js');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const picker=require('../app/src/main/assets/tcg-classic-set-picker.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const contract=require('../scripts/sm2_release_contract.json');
const src=JSON.parse(fs.readFileSync(path.join(root,'data/classic/sm2-print-compact.json'),'utf8'));
const by=n=>cards.cardById('sm2-'+n);

test('Pinned 180 collector prints, 11 alternates and 287 exact attacks',()=>{
 assert.equal(contract.pin,'0d2296a8c32fac6442c9b407653d30f8e9c3f0d6');
 assert.equal(cards.CARDS.length,180);assert.equal(src.length,180);
 const extra=new Set(contract.variants);
 const expected=Array.from({length:169},(_,i)=>String(i+1)).flatMap(n=>extra.has(n+'a')?[n,n+'a']:[n]);
 assert.deepEqual(src.map(r=>String(r[0])),expected);
 assert.equal(src.reduce((n,r)=>n+r[7].length,0),287);
 assert.equal(src.reduce((n,r)=>n+r[8].length,0),30);
 assert.equal(src.filter(r=>r[3].includes('GX')).length,42);
 assert.equal(src.filter(r=>r[2]==='Energy').length,4);
 assert.equal(src.reduce((n,r)=>n+r[7].filter(a=>a[0].endsWith('-GX')).length,0),42);
 assert.equal(new Set(cards.CARDS.map(c=>c.id)).size,180);
 for(let i=0;i<180;i++){
  const r=src[i],c=cards.CARDS[i];
  assert.equal(c.id,'sm2-'+r[0]);assert.equal(c.name,r[1]);
  assert.equal(classic.cardById(c.id),c,c.id+' missing from battle registry');
  assert.equal(c.battleEnabled,c.deckEligible,'Unsafe card in deck builder '+c.id);
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(r[4]));assert.deepEqual(c.types,r[5]);
   assert.equal(c.evolvesFrom,r[6]);
   assert.deepEqual(c.attacks.map(a=>Array.isArray(a.cost)?a.cost.join(''):String(a.cost)),r[7].map(a=>a[1].join('')),'Cost mismatch '+c.id);
   assert.deepEqual(c.attacks.map(a=>a.name),r[7].map(a=>a[0]));
   assert.deepEqual(c.attacks.map(a=>a.damageText||''),r[7].map(a=>a[2]));
   assert.equal(c.abilities.length,r[8].length,'Ability count mismatch '+c.id);
   if(r[3].includes('GX')){assert.equal(c.prizeCards,2);assert.equal(c.pokemonGX,true);}
  }
  if(!c.battleEnabled){assert.ok(c.support.reasons.length>0,c.id+' missing explicit blocker');continue;}
  for(const atk of c.attacks||[])assert.deepEqual(effects.validateEffect(atk.effect),[],c.id+' '+atk.name);
  for(const ab of c.abilities||[])assert.deepEqual(effects.validateEffect(ab.effect),[],c.id+' '+ab.name);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id+' Trainer');
  if(c.kind==='energy'&&!c.basicEnergy)assert.deepEqual(effects.validateEffect(c.effect),[],c.id+' Energy');
 }
 assert.ok(cards.CARDS.filter(x=>x.battleEnabled).length>=25,'Unexpectedly few playable cards');
});

test('Alternate arts share their printed moves and coin-search rules',()=>{
 for(const id of contract.variants){const base=by(id.slice(0,-1)),alt=by(id);assert.equal(base.name,alt.name);
  assert.deepEqual((base.attacks||[]).map(a=>[a.name,a.cost]),(alt.attacks||[]).map(a=>[a.name,a.cost]));
  assert.equal(base.battleEnabled,alt.battleEnabled,id+' support does not mirror base print');
 }
});

test('Guardians Rising selectable for both player and CPU, with no invisible sets',()=>{
 assert.ok(builder.SET_IDS.includes('sm2'));
 assert.ok(cpu.SETS.includes('sm2'));
 assert.ok(classic.SETS.some(s=>s.id==='sm2'));
 assert.ok(classic.coverage().guardiansRising);
 for(const [label,ids] of [['player',builder.SET_IDS],['cpu',cpu.SETS]]){
  const html=picker.html({ids,selected:['sm2'],mode:label});
  assert.match(html,/data-set-choice="sm2"[^>]*aria-pressed="true"/);
  assert.match(html,/Guardians Rising/);
  for(const id of ids)assert.ok(html.includes('data-set-choice="'+id+'"'),label+' invisible '+id);
 }
});

test('Guardians Rising alone produces energy-compatible 30-card decks for player and CPU',()=>{
 const owned=cards.CARDS.filter(c=>c.battleEnabled&&c.deckEligible).map(c=>({gameplayId:c.id,quantity:4}));
 assert.ok(owned.length*4>=30,'Playable catalogue cannot provide 30 physical cards');
 for(const seed of [3,24]){
  const res=builder.buildDeck(owned,{sets:['sm2'],style:seed===3?'competitive':'random',randomSeed:seed});
  assert.equal(res.ok,true,res.errors?.join('; '));assert.equal(res.cards.length,30);
  assert.ok(res.cards.every(id=>classic.cardById(id)?.setId==='sm2'));
  assert.deepEqual(decks.analyzeDeck(res.cards,res.energyTypes).missingEnergyTypes,[]);
 }
 const foe=cpu.generate({sets:['sm2'],type:'Water',seed:33});
 assert.equal(foe.ok,true,foe.error);assert.equal(foe.cards.length,30);
 assert.ok(foe.cards.every(id=>classic.cardById(id)?.setId==='sm2'));
});
