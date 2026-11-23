'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'data/classic/sm1-print-compact.json'),'utf8'));
const sm=require('../app/src/main/assets/tcg-classic-sun-moon.js');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const contract=require('../scripts/sm1_release_contract.json');
const by=n=>sm.cardById('sm1-'+n);
const code=x=>Array.isArray(x)?x.join(''):String(x||'');
test('SM1 pin/version/Gradle generation and all set registrations are consistent',()=>{
 assert.equal(contract.pin,'b3f5cd6f524ce45d59462fd2a56e237ff06063dc');
 assert.equal(contract.release,'0.69.402');assert.equal(contract.stage,'complete');
 assert.deepEqual([contract.printedTotal,contract.attackPrints,contract.abilities,contract.pokemonGX,contract.gxAttackPrints,contract.energyPrints],[173,238,26,27,27,13]);
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.match(gradle,/versionName '0\.69\.402'/);assert.match(gradle,/versionCode 7402/);
 for(const task of ['preflightSM1ContractForApk','generateSM1ForApk','auditSM1ForApk'])assert.ok(gradle.includes(task));
 assert.match(gradle,/dependsOn tasks\.named\('auditXY12ForApk'\)/);
 assert.equal(builder.SET_IDS.includes('sm1'),true);
 assert.ok(classic.coverage().sunMoon);
 assert.equal(classic.SETS.some(s=>s.id==='sm1'),true);
 assert.equal(cpu.generate({sets:['sm1'],type:'Water',seed:33}).ok,true);
});
test('173 exact official records, 101a special Eevee, attack costs, 238 attacks, 26 abilities',()=>{
 assert.equal(source.length,173);assert.equal(sm.CARDS.length,173);
 assert.deepEqual(source.map(r=>String(r[0])),[...Array.from({length:101},(_,i)=>String(i+1)),'101a',...Array.from({length:71},(_,i)=>String(i+102))]);
 assert.equal(new Set(source.map(r=>String(r[0]))).size,173);
 assert.equal(source.reduce((n,r)=>n+r[7].length,0),238);
 assert.equal(source.reduce((n,r)=>n+r[8].length,0),26);
 assert.equal(source.filter(r=>r[3].includes('GX')).length,27);
 assert.equal(source.filter(r=>r[2]==='Energy').length,13);
 assert.equal(source.reduce((n,r)=>n+r[7].filter(a=>a[0].endsWith('-GX')).length,0),27);
 assert.equal(by('101a').name,'Eevee');assert.notEqual(by('101a'),by('101'));
 for(let i=0;i<173;i++){
  const row=source[i],c=sm.CARDS[i];assert.equal(c.id,'sm1-'+row[0]);assert.equal(c.name,row[1]);
  assert.equal(classic.cardById(c.id),c,'Registry lookup missing '+c.id);
  assert.equal(c.battleEnabled,c.deckEligible,'No incomplete card selectable in deck '+c.id);
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(row[4]));assert.deepEqual(c.types,row[5]);assert.equal(c.evolvesFrom,row[6]);
   assert.deepEqual(c.attacks.map(x=>x.name),row[7].map(a=>a[0]));
   assert.deepEqual(c.attacks.map(x=>code(x.cost)),row[7].map(a=>a[1].join('')),'Printed cost mismatch '+c.id);
   assert.deepEqual(c.attacks.map(x=>x.damageText||''),row[7].map(a=>a[2]));
   assert.equal(c.abilities.length,row[8].length,'Every ability must be listed in the original catalogue '+c.id);
   if(row[3].includes('GX')){assert.equal(c.pokemonGX,true);assert.equal(c.prizeCards,2);assert.equal(c.pokemonEX,false);}
   for(const a of c.attacks)if(a.gxAttack)assert.ok(a.name.endsWith('-GX'));
  }
  if(!c.battleEnabled){assert.ok(c.support.reasons.length>0,'Non-playable print missing explanation');continue;}
  assert.equal(c.support.status,'FULL');
  for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+'/'+a.name);
  for(const a of c.abilities||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+'/'+a.name);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
  if(c.kind==='energy'&&!c.basicEnergy)assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
 }
 assert.equal(sm.CARDS.filter(c=>c.battleEnabled).length,contract.expectedPlayableMinimum);
 for(const n of contract.requiredEnabledNumbers)assert.equal(by(n).battleEnabled,true,n+' missing ready effect');
});
test('GX is once per player per game; GX KOs take two prizes, non-GX takes one',()=>{
 assert.equal(by(35).pokemonGX,true);assert.equal(by(35).prizeCards,2);
 assert.equal(by(35).attacks[2].gxAttack,true);
 assert.equal(by(27).attacks.find(x=>x.gxAttack).name,'Burning Slam-GX');
 assert.equal(by(100).attacks.find(x=>x.gxAttack).name,'Mad Bull-GX');
 assert.equal(by(35).attacks.filter(a=>a.gxAttack).length,1);
 assert.equal(by(1).prizeCards,1);
 const coreText=fs.readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-core.js'),'utf8');
 assert.match(coreText,/attack\.gxAttack\|\|\/\\bGX\\b\/i\.test\(attack\.name/);
 assert.ok(coreText.includes('s.gxAttackUsed=true'));
 assert.ok(coreText.includes('if ((attack.gxAttack||/\\bGX\\b/i.test(attack.name||\'\'))&&s.gxAttackUsed)continue;'));
});
test('Physical Energy: special DCE plus 11 Basic reprints, Rainbow flexible unit and attachment effects are enabled',()=>{
 assert.equal(by(136).specialEnergy,true);assert.deepEqual(by(136).effect.provides,{Colorless:2});
 assert.equal(by(137).battleEnabled,true);assert.deepEqual(by(137).effect.provides,{Miracle:1});
 for(const i of [162,163,164,165,166,167,168,169,170,171,172]){
  const c=by(i);assert.equal(c.kind,'energy');assert.equal(c.basicEnergy,true);assert.equal(c.specialEnergy,false);
 }
 assert.equal(by(162).energyType,'Psychic');assert.equal(by(168).energyType,'Psychic');
 assert.equal(by(163).energyType,'Metal');assert.equal(by(171).energyType,'Metal');
});
test('Special artwork GX uses matching printed attacks and safe mechanic gating',()=>{
 for(const [n,alts] of [[15,[138,150]],[35,[139,151]],[61,[140,152]],[66,[141,153]],[80,[142,154]],[89,[143,155]],[100,[144,156]],[110,[145,157]]]){
  const original=by(n);
  for(const alt of alts){const other=by(alt);assert.equal(other.name,original.name);
   assert.equal(other.battleEnabled,original.battleEnabled,`alternate art gate differs: ${n}/${alt}`);
   assert.deepEqual(other.attacks.map(a=>a.name),original.attacks.map(a=>a.name));
   assert.deepEqual(other.attacks.map(a=>code(a.cost)),original.attacks.map(a=>code(a.cost)));
  }
 }
});
test('Exact same-set 30-card player and CPU deck quality, both styles and four seeds',()=>{
 const owned=sm.CARDS.filter(c=>c.deckEligible).map(c=>({gameplayId:c.id,quantity:4}));
 for(const [style,seeds] of [['competitive',[3,12]],['random',[24,88]]])for(const randomSeed of seeds){
  const res=builder.buildDeck(owned,{sets:['sm1'],style,randomSeed});
  assert.equal(res.ok,true,`${style}/${randomSeed}: ${res.errors?.join('; ')}`);
  assert.equal(res.cards.length,30);
  assert.ok(res.cards.every(id=>classic.cardById(id)?.setId==='sm1'));
  assert.equal(decks.validateDraft(res.cards,owned,{requireFull:true}).ok,true);
  assert.deepEqual(decks.analyzeDeck(res.cards,res.energyTypes).missingEnergyTypes,[]);
 }
 assert.equal(cpu.generate({sets:['sm1'],type:'Water',seed:33}).ok,true);
});
