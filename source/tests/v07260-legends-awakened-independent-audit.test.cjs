'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const opponents=require('../app/src/main/assets/tcg-classic-opponents.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
const owned=data.CARDS.filter(c=>c.setId==='dp6').map(c=>({gameplayId:c.id,quantity:4}));
const build=(id,extra={})=>builder.buildDeck(owned,{sets:['dp6'],focusCardId:'dp6-'+id,randomSeed:42,...extra});
const has=(r,id)=>r.cards.includes('dp6-'+id);
const types={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
const payable=(card,energy)=>!(card.attacks||[]).length||(card.attacks||[]).some(a=>[...String(a.cost||'')].every(code=>code==='C'||energy.includes(types[code])));

test('DP6 form-change decks contain distinct, physically searchable forms instead of only identical copies',()=>{
 for(const id of [1,24,25,26,48,49,50,51]){
  const result=build(id);assert.ok(result.ok,`focus ${id}: ${result.errors}`);
  const source=data.cardById('dp6-'+id),group=source.abilities.find(a=>a.formGroup)?.formGroup;
  const forms=[...new Set(result.cards.filter(uid=>data.cardById(uid)?.abilities?.some(a=>a.formGroup===group)))];
  assert.ok(forms.length>=2,`focus ${id} has no alternate form: ${forms}`);
  assert.ok(forms.some(cid=>cid!==source.id),`focus ${id} has no change destination`);
  for(const cid of forms)assert.ok(payable(data.cardById(cid),result.energyTypes),`${cid} requires unavailable energy`);
 }
});

test('A Deoxys support print in a non-Deoxys Psychic core gets an alternative form',()=>{
 for(const id of [16,19,34]){
  const r=build(id);assert.ok(r.ok,`${id}: ${r.errors}`);
  const forms=[...new Set(r.cards.filter(uid=>['dp6-1','dp6-24','dp6-25','dp6-26'].includes(uid)))];
  if(forms.length)assert.ok(forms.length>=2,`support Deoxys has dead Form Change: ${forms}`);
 }
});

test('Ninjask auto decks include Shedinja and a valid Nincada prerequisite',()=>{
 const r=build(67);assert.ok(r.ok,JSON.stringify(r.errors));
 assert.ok(has(r,108),'Nincada required for Ninjask evolution');
 assert.ok(has(r,40),'Shedinja required for Cast-off Shell');
 const n=build(40);assert.ok(n.ok,JSON.stringify(n.errors));
 assert.ok(has(n,108));
});

test('Mesprit LV.X always gets BOTH complete Azelf and Uxie LV.X partner lines',()=>{
 for(const id of [34,143]){
  const r=build(id);assert.ok(r.ok,`${id}: ${r.errors}`);
  for(const n of [19,140,43,146])assert.ok(has(r,n),`focus ${id}: missing dp6-${n}`);
  assert.ok(has(r,143));
 }
});

test('When Supreme Blast partners are unavailable, builder declines a dead focus',()=>{
 const incomplete=owned.filter(c=>c.gameplayId!=='dp6-146');
 const r=builder.buildDeck(incomplete,{sets:['dp6'],focusCardId:'dp6-143',randomSeed:9});
 assert.equal(r.ok,false,'must not advertise Supreme Blast without Uxie LV.X');
 assert.match(r.errors.join(' '),/Uxie|Mesprit|Supreme Blast/);
});

test('Evoluter is excluded from all-Basic/Level-Up-only cores and never treated as a LV.X shortcut',()=>{
 const simple=build(1);assert.ok(simple.ok,JSON.stringify(simple.errors));
 assert.ok(!has(simple,136),'Deoxys and Mesprit LV.X cannot be evolved by Evoluter');
 const tech=data.cardById('dp6-136');
 const context=synergy.context(simple.cards.map(data.cardById).filter(Boolean),simple.energyTypes,'any');
 assert.equal(synergy.trainerScore(tech,context),-Infinity);
 const evolving=build(7);assert.ok(evolving.ok);
 assert.ok(evolving.cards.filter(id=>id==='dp6-136').length<=2);
});

test('No generic DP6 auto deck is overloaded with more than two identical Tools',()=>{
 for(const id of [1,7,21,27,48,61,67,143]){
  const r=build(id);assert.ok(r.ok,`${id}: ${r.errors}`);
  for(const tool of ['dp6-129','dp6-136','dp6-137'])
   assert.ok(r.cards.filter(cid=>cid===tool).length<=2,`${id}: too many ${tool}`);
 }
});

test('LV.X level-up is not an ordinary evolution that strands a Stage 1 Lucario',()=>{
 const r=build(61);assert.ok(r.ok,r.errors.join('; '));
 assert.ok(has(r,117));assert.ok(has(r,61));
 assert.ok(!r.cards.includes('dp2-122'),'dp6-only builder must not pull LV.X from DP2');
});

test('Snowpoint Temple +20 HP applies to Basic-origin LV.X but not evolved-origin LV.X',()=>{
 const loan=opponents.generate({sets:['dp6'],type:'Psychic',seed:3});assert.ok(loan.ok);
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,firstSide:'player',seed:3,playerEnergyTypes:['Psychic'],opponentEnergyTypes:['Psychic']});
 s.stadium={cardId:'dp6-134',uid:'temple',ownerSide:'player'};
 for(const [base,lv] of [['dp6-19','dp6-140'],['dp6-34','dp6-143'],['dp6-11','dp6-144'],['dp6-43','dp6-146']]){
  const slot=core.makePokemonSlot(lv,2,'z');slot.stack=[base,lv];s.sides.player.active=slot;
  assert.equal(core.maxHp(s,'player',slot),data.cardById(lv).hp+20,lv);
 }
 for(const [base,lv] of [['dp6-5','dp6-141'],['dp4-6','dp6-142']]){
  const slot=core.makePokemonSlot(lv,2,'z');slot.stack=[base,lv];s.sides.player.active=slot;
  assert.equal(core.maxHp(s,'player',slot),data.cardById(lv).hp,lv);
 }
 const slot=core.makePokemonSlot('dp6-140',2,'z');slot.stack=['dp6-19','dp6-140'];s.sides.player.active=slot;
 delete s.stadium;assert.equal(core.maxHp(s,'player',slot),data.cardById('dp6-140').hp);
});

test('selected-only DP6 CPU generations remain 30 cards, on-set, synergistic and have payable attacks',()=>{
 for(let seed=1;seed<=24;seed++){
  const r=opponents.generate({sets:['dp6'],seed,type:['Psychic','Grass','Water','Fighting','Fire','Metal'][seed%6]});
  assert.ok(r.ok,`${seed}: ${r.error}`);assert.equal(r.cards.length,30);
  for(const id of r.cards)assert.equal(data.cardById(id).setId,'dp6');
  if(r.cards.includes('dp6-143'))assert.ok(['dp6-140','dp6-146'].every(id=>r.cards.includes(id)),`seed ${seed}: dead Supreme Blast`);
  if(r.cards.includes('dp6-67'))assert.ok(r.cards.includes('dp6-40'),`seed ${seed}: dead Cast-off Shell`);
  for(const id of r.cards){const c=data.cardById(id);if(c.kind==='pokemon'&&(c.attacks||[]).length)
   assert.ok(payable(c,r.energyTypes),`seed ${seed}: ${id} no payable attacks`);
  }
 }
});

test('Basic-only focused decks never inherit Stage 1, Stage 2 or LV.X from a chosen Basic',()=>{
 for(const id of [19,34,43,67,87,108,117]){
  const r=build(id,{basicOnly:true});
  if(data.cardById('dp6-'+id).stage!=='Basic'){
   assert.equal(r.ok,false,`focus ${id} must not bypass Basic-only`);continue;
  }
  assert.ok(r.ok,`basic ${id}: ${r.errors}`);
  assert.ok(r.cards.every(cid=>{const c=data.cardById(cid);return c?.kind!=='pokemon'||c.stage==='Basic';}),
    `basic ${id} included an evolution or LV.X`);
 }
});


test('release version is consistent across Gradle, JavaScript and visible HTML',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 const version=gradle.match(/versionName '([^']+)'/)?.[1];
 assert.match(version,/^\d+\.\d+\.\d+$/,'valid semver-shaped release stamp');
 const html=fs.readFileSync(path.join(asset,'index.html'),'utf8');
 const app=fs.readFileSync(path.join(asset,'app-v0167.js'),'utf8');
 assert.ok(html.includes(`id="titleBuildVersion">v${version}`));
 assert.ok(html.includes(`id="appBuildVersion">LUCKY DEX · v${version}`));
 assert.ok(app.includes(`__LUCKYDEX_BUILD='${version}'`));
});
