'use strict';
// v0.69.333: permanent cross-era Classic deckbuilding quality gate.
const {test}=require('node:test'), assert=require('node:assert/strict');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');

// These sets use checked-in stubs until their Gradle generator runs. This early
// deck-quality gate executes BEFORE those generators, so audit their full cards
// in each set's post-generation audit instead. Keep this list in sync with newly pinned expansions (including SM5).
const emptyLocalCatalogues=new Set(['bw11','xy1','xy2','xy3','xy4','xy5','xy6','xy7','xy8','xy9','xy10','sm2','sm5','sm6']);
// DET1 and the three prerequisite SWSH promo prints are deliberately mixed-only.
// Each has a separate mixed-set audit below; never skip a complete expansion here.
const mixedOnlyCatalogues=new Set(['det1','swshp']);
function ownedFor(set){return classic.CARDS.filter(c=>c.setId===set&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));}
function trainerCounts(ids){
 const byName=new Map();
 for(const c of ids.map(classic.cardById).filter(c=>c?.kind==='trainer'))byName.set(c.name,(byName.get(c.name)||0)+1);
 return byName;
}
function assertDeckQuality(result,owned,description){
 assert.equal(result.ok,true,`${description}: ${result.errors?.join('; ')}`);
 assert.equal(result.cards.length,30,`${description}: exactly thirty physical cards`);
 const validation=decks.validateDraft(result.cards,owned,{requireFull:true});
 assert.equal(validation.ok,true,`${description}: ${validation.errors?.join('; ')}`);
 const energy=decks.analyzeDeck(result.cards,result.energyTypes);
 assert.deepEqual(energy.missingEnergyTypes,[],`${description}: no unsupported attack type`);
 const cards=result.cards.map(classic.cardById);
 assert.deepEqual(synergy.report(cards,result.energyTypes,'any').dead,[],`${description}: no known dead-effect Trainers`);
 assert.ok(cards.filter(c=>c?.aceSpec).length<=1,`${description}: one ACE SPEC total`);
 assert.ok(cards.filter(c=>c?.name==='Miracle Energy').length<=1,`${description}: Miracle Energy limited`);
 return trainerCounts(result.cards);
}

test('BREAKpoint generated catalogue is exempt from early local deck gate and audited after generation',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const gradle=fs.readFileSync(path.join(__dirname,'../app/build.gradle'),'utf8');
 assert.ok(emptyLocalCatalogues.has('xy9'));
 assert.match(gradle,/tasks\.register\('generateXY9ForApk'/);
 assert.match(gradle,/tasks\.register\('auditXY9ForApk'/);
 assert.match(gradle,/dependsOn tasks\.named\('generateXY9ForApk'\)/);
});

test('pinned BREAKthrough catalogue is audited after generation, not by the early local-stub deck gate',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const gradle=fs.readFileSync(path.join(__dirname,'../app/build.gradle'),'utf8');
 assert.ok(emptyLocalCatalogues.has('xy8'),'XY8 is a generated catalogue and must be skipped by the early deck gate');
 assert.match(gradle,/tasks\.register\('generateXY8ForApk'/);
 assert.match(gradle,/tasks\.register\('auditXY8ForApk'/);
 assert.match(gradle,/dependsOn tasks\.named\('generateXY8ForApk'\)/,
  'XY8 specific audit must run AFTER the pinned generator');
});

test('Ultra Prism pinned catalogue is quality-gated after generation, not from the early local stub',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const gradle=fs.readFileSync(path.join(__dirname,'../app/build.gradle'),'utf8');
 assert.ok(emptyLocalCatalogues.has('sm5'),'SM5 requires its verified 178-card source before a meaningful deck audit');
 assert.match(gradle,/tasks\.register\('generateSM5ForApk'/);
 assert.match(gradle,/tasks\.register\('auditSM5ForApk'/);
 assert.match(gradle,/dependsOn tasks\.named\('generateSM5ForApk'\)/);
});

test('Forbidden Light generated deck catalogue is tested after its official SHA-pinned source is built',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const gradle=fs.readFileSync(path.join(__dirname,'../app/build.gradle'),'utf8');
 assert.ok(emptyLocalCatalogues.has('sm6'),'SM6 cannot be judged from its pre-generator empty stub');
 assert.match(gradle,/tasks\.register\('generateSM6ForApk'/);
 assert.match(gradle,/tasks\.register\('auditSM6ForApk'/);
 assert.match(gradle,/dependsOn tasks\.named\('generateSM6ForApk'\)/);
});

test('all locally populated Classic sets generate legal, Energy-compatible, usable 30-card decks under two styles',()=>{
 let audited=0;
 for(const set of builder.SET_IDS){
  // These pinned-source expansions are separately tested after pinned generation on GitHub;
  // do not make the regression depend on whether they are generated locally.
  if(emptyLocalCatalogues.has(set)||mixedOnlyCatalogues.has(set))continue;
  const owned=ownedFor(set);
  assert.ok(owned.length*4>=30,`${set}: missing cards from a previously populated catalogue`);
  for(const [style,randomSeed] of [['competitive',3],['random',24]]){
   const label=`${set}/${style}`;
   const result=builder.buildDeck(owned,{sets:[set],style,randomSeed});
   const trainers=assertDeckQuality(result,owned,label);
   // Deliberate 4-of packages remain possible for very restricted early-era
   // card pools; don't enforce a blanket cap on Trainer copies.
   if(!['base2','base3','base5','neo2','neo3','ex2','ex12','ex13','bw5'].includes(set)){
    const fourOf=[...trainers].filter(([,count])=>count>=4);
    assert.ok(fourOf.length<3,`${label}: excessive unrelated 4-copy Trainer packages ${JSON.stringify(fourOf)}`);
   }
   audited++;
  }
 }
 assert.equal(audited,2*builder.SET_IDS.filter(set=>!emptyLocalCatalogues.has(set)&&!mixedOnlyCatalogues.has(set)).length,
   'audit two independent choices from each currently populated Classic set ID');
 assert.ok(audited>=118,'do not silently lose previously audited Classic sets');
});

test('Detective Pikachu mixed-set owned decks and CPU remain legal in both styles',()=>{
 const sets=['det1','sm9'],owned=sets.flatMap(ownedFor),cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
 assert.ok(ownedFor('det1').length>=16);assert.ok(ownedFor('sm9').length>=94);
 for(const [style,randomSeed] of [['competitive',3],['random',24]]){
  const result=builder.buildDeck(owned,{sets,style,randomSeed,types:['Fire'],focusCardId:'det1-4'});
  assertDeckQuality(result,owned,'det1+sm9/'+style);assert.ok(result.cards.includes('det1-4'),'retains the selected Detective Pikachu card');
  assert.ok(result.cards.every(id=>sets.includes(classic.cardById(id).setId)));
 }
 const result=cpu.generate({sets,type:'Fire',seed:42});assert.ok(result.ok,result.error);assert.ok(classic.validateDeck(result.cards).ok);assert.deepEqual(decks.analyzeDeck(result.cards,result.energyTypes).missingEnergyTypes,[]);
 assert.ok(result.cards.every(id=>sets.includes(classic.cardById(id).setId)));
});
test('partial SWSH promos retain exact prerequisites, reject standalone drafts, and build legal mixed Gallery decks',()=>{
 const sets=['swsh12pt5gg','swshp'],promo=ownedFor('swshp'),owned=sets.flatMap(ownedFor),cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
 assert.deepEqual(promo.map(c=>c.gameplayId).sort(),['swshp-SWSH223','swshp-SWSH229','swshp-SWSH266']);
 assert.equal(classic.CARDS.filter(c=>c.setId==='swshp').length,3,'revisit this explicit mixed-only audit when the promo catalogue expands');
 for(const style of ['competitive','random']){
  assert.equal(builder.buildDeck(promo,{sets:['swshp'],style,types:['Psychic'],randomSeed:3}).ok,false);
  for(const [suffix,parents] of [['GG44',['swshp-SWSH223','swshp-SWSH229']],['GG45',['swshp-SWSH266']],['GG46',['swshp-SWSH266']]]){
   const focus='swsh12pt5gg-'+suffix,label=focus+'/'+style;
   const result=builder.buildDeck(owned,{sets,style,types:['Psychic'],focusCardId:focus,randomSeed:3});
   assertDeckQuality(result,owned,label);assert.ok(result.cards.includes(focus),label+' keeps the chosen evolution');
   assert.ok(result.cards.some(id=>parents.includes(id)),label+' retains a legal Basic prerequisite');
   assert.ok(result.cards.every(id=>sets.includes(classic.cardById(id).setId)),label+' stays within selected sets');
  }
 }
 assert.equal(cpu.generate({sets:['swshp'],type:'Psychic',seed:42}).ok,false);
 const result=cpu.generate({sets,type:'Psychic',seed:42});assertDeckQuality(result,owned,'mixed Gallery/promo CPU');
 assert.ok(result.cards.some(id=>id.startsWith('swshp-')));assert.ok(result.cards.every(id=>sets.includes(classic.cardById(id).setId)));
});
test('modern and dense historical sets diversify Trainers while retaining functional combos',()=>{
 for(const set of ['gym2','neo4','ecard3','dp5','hgss2','bw4']){
  const owned=ownedFor(set),result=builder.buildDeck(owned,{sets:[set],style:'competitive',randomSeed:3});
  const trainers=assertDeckQuality(result,owned,set);
  const cards=[...trainers.values()];
  assert.ok(cards.filter(count=>count===4).length<=1,`${set}: no repeated four-copy generic Trainer shells`);
  assert.ok(trainers.size>=5,`${set}: varied support roles expected`);
 }
});

test('Dragon Frontiers Bench-only Stage 2 ex supporters need not add irrelevant attack Energy types',()=>{
 const owned=ownedFor('ex15'),result=builder.buildDeck(owned,{sets:['ex15'],style:'random',randomSeed:24});
 assertDeckQuality(result,owned,'Dragon Frontiers');
 assert.ok(result.energyTypes.length<=2,'do not add third and fourth Basic Energy solely to attack from utility Bench');
});

test('automatic Trainer ownership restriction does not strip intentionally selected legal copies',()=>{
 const owned=ownedFor('base1');
 const result=builder.buildDeck(owned,{sets:['base1'],style:'competitive',randomSeed:3,cards:['base1-91','base1-91','base1-91','base1-91']});
 assertDeckQuality(result,owned,'retained user selection');
 assert.equal(result.cards.filter(id=>id==='base1-91').length,4,'existing legal four-copy preference is preserved');
});

test('mixed-era collections remain coherent instead of mixing irrelevant support',()=>{
 const eras=[
  ['base1','base2','base3'], ['gym1','gym2'],
  ['neo1','neo2','neo3','neo4'],['ex11','ex12','ex13','ex14','ex15'],
  ['dp5','dp6','dp7'],['pl1','pl2','pl3','pl4'],
  ['hgss1','hgss2','hgss3','hgss4'],['bw3','bw4','bw5'],
  ['bw6','bw7','bw8'],['bw8','bw9','bw10']
 ];
 for(const sets of eras){
  const owned=classic.CARDS.filter(c=>sets.includes(c.setId)&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
  assertDeckQuality(builder.buildDeck(owned,{sets,style:'competitive',randomSeed:7}),owned,sets.join('+'));
 }
});

test('CPU uses the same improved shared builder and keeps valid single-/mixed-era teams',()=>{
 const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
 for(const [sets,type] of [
  [['gym2'],'Psychic'],[['neo4'],'Fire'],[['ex15'],'Grass'],
  [['dp5'],'Psychic'],[['hgss2'],'Water'],[['bw3'],'Fire'],
  [['bw10'],'Water'],[['gym1','gym2'],'Psychic']
 ]){
  const label=sets.join('+')+'/'+type;
  const result=cpu.generate({sets,type,seed:42});
  assert.equal(result.ok,true,`${label}: ${result.error||''}`);
  assert.equal(classic.validateDeck(result.cards).ok,true,`${label}: legal CPU deck`);
  assert.deepEqual(decks.analyzeDeck(result.cards,result.energyTypes).missingEnergyTypes,[],`${label}: legal CPU Energy`);
  assert.deepEqual(synergy.report(result.cards.map(classic.cardById),result.energyTypes,'any').dead,[],`${label}: no known dead Trainers`);
 }
});
