'use strict';
/* Triumphant v0.69.291: independently check immutable print source, executable rules, CPU and integration. */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const rawBuffer=fs.readFileSync(path.join(root,'data/classic/hgss4-print-compact.json')),raw=JSON.parse(rawBuffer.toString('utf8'));
const hg=require(path.join(assets,'tcg-classic-triumphant.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const id=n=>'hgss4-'+n,types={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'};
const attack=(n,name)=>hg.cardById(id(n)).attacks.find(a=>a.name===name);
test('103 immutable authenticated collector prints, including Alph Lithograph FOUR',()=>{
 assert.equal(crypto.createHash('sha256').update(rawBuffer).digest('hex'),'77c7859b072a1be81422cb962a02d6b4b59934ea4739025aa0f17db660c6fbde');
 assert.equal(raw.length,103);assert.equal(hg.CARDS.length,103);
 assert.deepEqual(new Set(raw.map(r=>String(r[0]))),new Set([...Array.from({length:102},(_,i)=>String(i+1)),'FOUR']));
 assert.equal(hg.cardById(id('FOUR')).name,'Alph Lithograph');
});
test('all 103 prints preserve exact identity, stages, printed attacks, abilities, HP, energy, weakness and rarity',()=>{
 let enabled=0;
 for(const row of raw){
  const [num,name,supertype,subtypes,hp,element,evolves,attacks,abilities,weak,res,retreat,rarity]=row,c=hg.cardById(id(num));
  assert.ok(c,id(num));assert.equal(c.name,name);assert.equal(c.number,String(num));assert.equal(c.rarity,rarity);
  assert.equal(c.kind,supertype==='Pokémon'?'pokemon':supertype==='Trainer'?'trainer':'energy');
  assert.deepEqual((c.attacks||[]).map(a=>[a.name,a.text,a.cost,a.damageText]),attacks.map(a=>[a[0],a[3]||'',a[1].map(t=>types[t]).join(''),a[2]||null]));
  assert.deepEqual((c.abilities||[]).map(a=>[a.name,a.text,a.printedPowerType]),abilities.map(a=>[a[0],a[2],a[1]==='Poké-Power'?'power':'body']));
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(hp));assert.equal(c.stage,subtypes[0]);assert.deepEqual(c.types,element);assert.equal(c.evolvesFrom,evolves||null);
   assert.equal(c.retreat,retreat);assert.deepEqual(c.weaknesses,weak);assert.deepEqual(c.resistances,res);
  }
  if(c.battleEnabled){enabled++;assert.equal(c.deckEligible,true);assert.equal(c.support.status,'FULL');
   for(const a of [...(c.attacks||[]),...(c.abilities||[]),...(c.kind==='trainer'?[c]:[])]){
    assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+(a.name||'trainer'));
    if(a.text?.trim())assert.notEqual(a.effect?.type,'noop',c.id+' '+a.name);
   }
  }else{assert.equal(c.deckEligible,false);assert.ok(c.support.reasons?.length,id(num)+' lacks gate reason');}
 }
 assert.ok(enabled>=50,'At least 50 genuine fully mapped playable prints required');
 assert.equal(hg.coverage().battleEnabled,enabled);assert.equal(hg.coverage().gated.length,103-enabled);
});
test('Triumphant is registered in collection, player picker, CPU picker, deck builder and APK',()=>{
 assert.ok(db.SETS.some(s=>s.id==='hgss4'));assert.ok(cpu.SETS.includes('hgss4'));assert.ok(builder.SET_IDS.includes('hgss4'));
 assert.ok(fs.readFileSync(path.join(assets,'tcg-classic-set-picker.js'),'utf8').includes("['hgss4','Triumphant'"));
 assert.ok(fs.readFileSync(path.join(assets,'index.html'),'utf8').includes('tcg-classic-triumphant.js'));
 const owned=db.projectOwnedCards([{source:'tcg',setId:'hgss4',number:'FOUR',quantity:2},{source:'tcg',setId:'hgss4',number:'25',quantity:3}]);
 assert.ok(owned.some(c=>c.gameplayId===id('FOUR')&&c.quantity===2));
 assert.ok(owned.some(c=>c.gameplayId===id('25')&&c.quantity===3));
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.ok(gradle.includes("scripts/build-hgss4.py"));assert.ok(gradle.includes('v07291-triumphant-stage1.test.cjs'));
 const ver=gradle.match(/versionName '([^']+)'/)[1];assert.ok(fs.readFileSync(path.join(assets,'index.html'),'utf8').includes('v'+ver));
 assert.ok(fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8').includes("__LUCKYDEX_BUILD='"+ver+"'"));
});
test('each two-half LEGEND is a matched, battle-enabled pair after completion',()=>{
 for(const [a,b] of [['99','100'],['101','102']]){
  const left=hg.cardById(id(a)),right=hg.cardById(id(b));
  assert.equal(left.stage,'LEGEND');assert.equal(right.stage,'LEGEND');assert.equal(left.legendPair,right.legendPair);
  assert.equal(left.prizeCards,2);assert.equal(right.prizeCards,2);
  assert.equal(left.battleEnabled,right.battleEnabled);assert.equal(left.deckEligible,right.deckEligible);
  assert.equal(left.battleEnabled,true,'Both halves must be playable together after completion');
 }
});
test('multiplicative printed damage does not add an incorrect fixed damage value',()=>{
 for(const c of hg.CARDS)for(const a of c.attacks||[])if(/^\d+\s*[×x]$/.test(a.damageText||''))assert.equal(a.damage,0,c.id+' '+a.name);
 assert.equal(attack('54','Shoot Through').damage,20,'Primary target must still take printed damage');
 assert.equal(attack('48','Blizzard').damage,40,'Piloswine direct damage must survive Bench effect');
});
test('printed-rule effect schemas: coin tiers, conditional Stadium, Water Energy and targeted Bench',()=>{
 for(const [n,name,expected] of [['24','Fury Cutter','coinTierBonus'],['42','Eruption','topDeckBothDiscardBonus'],['19','Sand Impact','coinDamageByEnergy'],['55','Imitate','drawToHandSize'],['31','Swallow Up','bonusDamage']]){
  const e=attack(n,name);assert.ok(e,id(n)+' '+name);assert.equal(e.effect.type,expected);assert.deepEqual(fx.validateEffect(e.effect),[]);
 }
 for(const n of ['12','19','24','31','42','44','48','55','83'])assert.equal(hg.cardById(id(n)).battleEnabled,true,id(n));
});
test('Triumphant-only CPU produces legal 30-card decks with no gated actions or orphan evolutions',()=>{
 let valid=0;for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(const seed of [3,7,11,17]){
  const g=cpu.generate({sets:['hgss4'],type,seed});if(!g.ok)continue;
  valid++;assert.equal(g.cards.length,30);assert.ok(db.validateDeck(g.cards).ok,type+'/'+seed);
  const cards=g.cards.map(i=>db.cardById(i)),names=new Set(cards.map(c=>c.name));
  for(const c of cards){assert.equal(c.setId,'hgss4');assert.equal(c.battleEnabled,true);assert.equal(c.deckEligible,true);
   if(['Stage 1','Stage 2'].includes(c.stage))assert.ok(names.has(c.evolvesFrom),type+'/'+seed+' orphan '+c.name);
  }
  for(const [a,b] of [['99','100'],['101','102']])assert.equal(g.cards.filter(x=>x===id(a)).length,g.cards.filter(x=>x===id(b)).length);
 }
 assert.ok(valid>=25,'At least 25 successful selected-set decks expected; got '+valid);
});
test('independent audited schemas, CPU and smoke executions produce no errors or failures',()=>{
 const audit=require(path.join(root,'scripts/audit-classic-set.cjs'));
 const report=audit.auditSet('hgss4',{data:db,fx,opponents:cpu,core,testIndex:[],engineText:fs.readFileSync(path.join(assets,'tcgp-battle-effects.js'),'utf8')+'\n'+fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8'),setDefs:{hgss4:hg.SET},cpu:true,smoke:true});
 assert.equal(report.summary.errors,0);assert.equal(report.summary.warnings,0);assert.equal(report.summary.reviewFlags,0);
 assert.equal(report.smoke.failures.length,0);assert.equal(report.cpu.valid,16);
});
