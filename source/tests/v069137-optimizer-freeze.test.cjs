'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),childProcess=require('node:child_process'),fs=require('node:fs');
const dir=path.resolve(__dirname,'../app/src/main/assets');
// Run a once-hanging fallback build in a subprocess: if this ever regresses,
// the test runner doesn't itself freeze indefinitely.
test('Classic deck builder terminates when only incompatible Stadiums can fill remaining slots',()=>{
 const program=`const d=require(${JSON.stringify(path.join(dir,'tcg-classic-battle-data.js'))}),b=require(${JSON.stringify(path.join(dir,'tcg-classic-deck-builder.js'))}); const stadium=d.CARDS.filter(c=>c.kind==='trainer'&&c.trainerType==='Stadium'&&['SNAPFOUNJA','SNAPFLORIO'].includes(c.setId));const basics=d.CARDS.filter(c=>c.kind==='pokemon'&&c.stage==='Basic'&&c.types?.includes('Water')&&['SNAPFOUNJA','SNAPFLORIO'].includes(c.setId)).slice(0,3);const result=b.buildDeck([...stadium,...basics].map(c=>({gameplayId:c.id,quantity:4})),{sets:['SNAPFOUNJA','SNAPFLORIO'],types:['Water'],style:'competitive',randomSeed:136});if(result.ok||!/Could only assemble/.test(result.errors?.join(' ')))throw Error('Expected graceful failure, got '+JSON.stringify(result));console.log('finished');`;
 const result=childProcess.spawnSync(process.execPath,['-e',program],{encoding:'utf8',timeout:5000});
 assert.notEqual(result.error?.code,'ETIMEDOUT','Builder must return instead of timing out');
 assert.equal(result.status,0,result.stderr||result.error?.message||'Build failed');
 assert.match(result.stdout,/finished/);
});
test('Optional real-match optimisation reports before expensive work and can cancel',async()=>{
 const B=require(path.join(dir,'tcg-classic-deck-builder.js')),C=require(path.join(dir,'tcg-classic-battle-data.js')),O=require(path.join(dir,'tcg-deck-optimizer.js'));
 const rows=C.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false&&!c.basicEnergy).map(c=>({gameplayId:c.id,quantity:4}));
 const progress=[];let stop=false,started=0;
 const result=await O.optimise({rows,format:'classic',options:{sets:B.SET_IDS,types:['Psychic'],theme:'sleep'},simulate:true,maxCandidates:4,seed:137,build:(r,o)=>{started++;return B.buildDeckAsync(r,o)},onProgress:p=>{progress.push(p);if(p.stage==='candidates'&&p.completed===1)stop=true;},isCancelled:()=>stop});
 assert.equal(result,null);assert.equal(started,1);
 assert.deepEqual(progress[0],{stage:'candidates',completed:0,total:4,valid:0});
});
test('Simulation compares legal full decks and yields progress to both Classic and Pocket',async()=>{
 const B=require(path.join(dir,'tcg-classic-deck-builder.js')),C=require(path.join(dir,'tcg-classic-battle-data.js')),P=require(path.join(dir,'tcgp-battle-decks.js')),D=require(path.join(dir,'tcgp-battle-data.js')),O=require(path.join(dir,'tcg-deck-optimizer.js'));
 for(const [format,rows,options,build] of [
  ['classic',C.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false&&!c.basicEnergy).map(c=>({gameplayId:c.id,quantity:4})),{sets:B.SET_IDS,types:['Psychic'],theme:'sleep'},B.buildDeckAsync],
  ['pocket',D.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind!=='energy').map(c=>({gameplayId:c.id,quantity:2})),{types:['Psychic'],theme:'sleep'},P.buildDeckAsync]
 ]){
  const progress=[];const result=await O.optimise({format,rows,options,maxCandidates:2,seed:136,simulate:true,build:(r,o)=>build(r,o),onProgress:p=>progress.push(p)});
  assert.equal(result.ok,true,format+': '+result.errors?.join(' '));
  assert.equal(result.cards.length,format==='classic'?30:20);
  assert.equal(progress[0].completed,0);assert.equal(progress[0].stage,'candidates');
  assert.ok(progress.some(p=>p.completed>=1&&p.stage==='candidates'));
 }
});
test('Both editor screens include a live cancellation path',()=>{
 for(const file of ['tcgp-deck-editor.js','tcg-classic-deck-editor.js']){
  const s=fs.readFileSync(path.join(dir,file),'utf8');
  assert.match(s,/cancel-auto/);assert.match(s,/buildActive=false/);
  assert.match(s,/cancelBuild\(\);message='Deck build cancelled/);
 }
});
