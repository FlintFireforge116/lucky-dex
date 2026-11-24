'use strict';
// Independent XY12 catalogue contract and mechanics-reuse smoke gate.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const xy12=require('../app/src/main/assets/tcg-classic-evolutions.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const contract=require('../scripts/xy12_release_contract.json');
const data='data/classic/xy12-print-compact.json';
const mandatory=process.env.GITHUB_ACTIONS==='true';
const source=fs.existsSync(path.join(root,data))?JSON.parse(read(data)):null;
const printedCost=x=>Array.isArray(x)?x.join(''):String(x??'');
const by=n=>xy12.cardById('xy12-'+n);

test('XY12 pinned upstream, build version, dependency and release contract',()=>{
 assert.equal(contract.release,'0.69.427');
 assert.equal(contract.stage,'complete');
 assert.deepEqual([contract.printedTotal,contract.attackPrints,contract.abilities,contract.pokemonBreak,contract.energyPrints],[113,129,11,4,10]);
 assert.equal(contract.pin,'7e80c06b0f3e5621058a29e26c90023d1033e65f');
 assert.match(read('app/build.gradle'),/versionCode 7427/);
 assert.match(read('app/build.gradle'),/versionName '0\.69\.427'/);
 for(const name of ['preflightXY12ContractForApk','generateXY12ForApk','auditXY12ForApk'])assert.ok(read('app/build.gradle').includes(name),'Gradle missing '+name);
 assert.match(read('app/build.gradle'),/dependsOn tasks\.named\('auditXY11ForApk'\)/);
 assert.match(read('app/build.gradle'),/tests\/v07396-evolutions-integration\.test\.cjs/);
 assert.ok(read('app/src/main/assets/index.html').includes('tcg-classic-evolutions.js'));
 for(const p of ['app/src/main/assets/tcg-classic-battle-data.js','app/src/main/assets/tcg-classic-deck-builder.js','app/src/main/assets/tcg-classic-opponents.js','app/src/main/assets/tcg-classic-set-picker.js'])assert.ok(read(p).includes('xy12'),'Missing registration '+p);
 for(const p of ['xy9','xy10','xy11'])assert.equal(require('../scripts/'+p+'_release_contract.json').release,contract.release);
 assert.ok(read('scripts/build-xy12.py').includes(contract.pin));
});
test('Exact printed catalogue, variants, attack costs and safe explicit gating',()=>{
 assert.ok(source,'Pinned official catalogue is mandatory in every release patch');
 assert.deepEqual(source.map(x=>String(x[0])),Array.from({length:113},(_,i)=>String(i+1)));
 assert.equal(source.reduce((n,r)=>n+r[7].length,0),129);
 assert.equal(source.reduce((n,r)=>n+r[8].length,0),11);
 assert.equal(source.filter(r=>r[3].includes('BREAK')).length,4);
 assert.equal(source.filter(r=>r[2]==='Energy').length,10);
 assert.equal(xy12.CARDS.length,113);
 assert.equal(classic.coverage().evolutions.printed,113);
 for(let i=0;i<113;i++){
  const r=source[i],c=xy12.CARDS[i];
  assert.equal(c.id,'xy12-'+r[0]);assert.equal(c.name,r[1]);
  assert.equal(classic.cardById(c.id),c,'Global cardById missing '+c.id);
  assert.equal(c.kind,{'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[r[2]]);
  assert.equal(c.battleEnabled,c.deckEligible,'Do not include unimplemented prints in CPU/player decks');
  if(c.kind==='pokemon'){
   assert.deepEqual(c.types,r[5]);
   assert.deepEqual(c.attacks.map(a=>printedCost(a.cost)),r[7].map(a=>a[1].join('')),'Printed attack energy cost drift '+c.id);
   assert.deepEqual(c.attacks.map(a=>a.name),r[7].map(a=>a[0]),'Printed attack names '+c.id);
   assert.deepEqual(c.attacks.map(a=>a.damageText||''),r[7].map(a=>a[2]),'Printed damage labels '+c.id);
   assert.equal(c.breakEvolution,r[3].includes('BREAK'));
   if(c.breakEvolution)assert.equal(c.upgradeInheritance,'previous');
  }
  if(!c.battleEnabled){assert.ok(c.support.reasons.length>0,'Ungated unsupported card '+c.id);continue;}
  assert.equal(c.support.status,'FULL');
  for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+'/'+a.name);
  if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
  if(c.kind==='energy'&&!c.basicEnergy)assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
 }
 assert.equal(xy12.CARDS.filter(c=>c.battleEnabled).length,contract.expectedPlayableMinimum);
 for(const n of contract.requiredEnabledNumbers)assert.equal(by(n)?.battleEnabled,true,'Required verified card gated: '+n);
});
test('Basic Energy are physical Basic cards; Double Colorless gives two Colorless only',()=>{
 assert.equal(by(90).specialEnergy,true);assert.equal(by(90).basicEnergy,false);
 assert.deepEqual(by(90).effect.provides,{Colorless:2});
 const energy=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy'];
 energy.forEach((type,i)=>{const c=by(91+i);assert.equal(c.kind,'energy');assert.equal(c.energyType,type);assert.equal(c.basicEnergy,true);assert.equal(c.specialEnergy,false);});
 assert.equal(by(91).id,'xy12-91');
 assert.equal(by(90).deckEligible,true);
});
test('Mega Spirit Links have corresponding EX Mega and require matching partners',()=>{
 const core=read('app/src/main/assets/tcgp-battle-core.js');
 const deck=read('app/src/main/assets/tcg-classic-deck-builder.js');
 for(const [tool,megas] of [[73,[22,102]],[75,[13,101]],[81,[65,105]],[86,[27]],[89,[2,100]]]){
  const c=by(tool);assert.ok(c?.battleEnabled,'Missing Spirit Link '+tool);
  assert.equal(c.trainerType,'Tool');
  for(const mega of megas){assert.ok(core.includes('xy12-'+mega),'Missing Mega evolution turn exemption '+mega);assert.equal(by(mega)?.megaEvolution,true);}
  assert.ok(deck.includes('xy12-'+tool),'Deck-builder missing tool dependency '+tool);
 }
});
test('Printed reprints reuse their original effect definitions, not mistaken alternate mechanics',()=>{
 for(const [base,alt] of [[2,100],[13,101],[22,102],[52,103],[64,104],[65,105],[72,106]]){
  const left=by(base),right=by(alt);assert.deepEqual(right.attacks.map(a=>a.effect),left.attacks.map(a=>a.effect));
  assert.equal(right.battleEnabled,left.battleEnabled,'A reused original and alternate cannot have conflicting gates '+alt);
 }
});
test('Distinct XY12 regular effects and correct physical discard requirements',()=>{
 assert.equal(by(24).attacks[0].effect.type,'chooseAttackLock');
 assert.equal(by(36).battleEnabled,true,'Spark Bolt is enabled with optional Energy discard');
 assert.deepEqual(by(52).attacks[0].effect,{type:'xy12Rule',rule:'energyAbsorption'});
 assert.equal(by(71).battleEnabled,true,'Expiry-safe Conversion 3 is enabled');
 assert.equal(by(34).attacks[1].effect.rule,'hgss3:45:doubleHeadstrike');
 assert.equal(by(110).attacks[1].effect.rule,'xy4:fly');
 assert.equal(by(79).effect.effects[0].amount,2);
 assert.equal(by(84).effect.effects[1].type,'endTurn');
 assert.equal(by(77).effect.source,'discard');assert.equal(by(77).effect.filter.basicEnergy,true);
 assert.equal(by(85).effect.side,'self');
 assert.equal(by(90).effect.provides.Colorless,2);
});
test('XY12 legal player/CPU deck building and set isolation',()=>{
 const owned=xy12.CARDS.filter(c=>c.deckEligible).map(c=>({gameplayId:c.id,quantity:4}));
 assert.ok(owned.length>=80);
 for(const style of ['competitive','random']){
  const res=builder.buildDeck(owned,{sets:['xy12'],style,randomSeed:style==='competitive'?3:24});
  assert.equal(res.ok,true,style+': '+(res.errors||[]).join('; '));
  assert.equal(res.cards.length,30);
  assert.ok(res.cards.every(id=>classic.cardById(id)?.setId==='xy12'));
  assert.equal(decks.validateDraft(res.cards,owned,{requireFull:true}).ok,true);
  assert.deepEqual(decks.analyzeDeck(res.cards,res.energyTypes).missingEnergyTypes,[]);
 }
});
