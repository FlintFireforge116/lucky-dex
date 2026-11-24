'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets='../app/src/main/assets/',fx=require(assets+'tcgp-battle-effects.js'),d=require(assets+'tcg-classic-battle-data.js');
const sets=[['sm115','hidden-fates',69,82,3,17,11,3],['sma','hidden-fates-shiny-vault',94,164,33,10,39,0]];
for(const [sid,file,total,attacks,abilities,trainers,gx,tags] of sets){
 const set=require(assets+'tcg-classic-'+file+'.js');const bytes=fs.readFileSync(path.join(root,'data/classic/'+sid+'-print-compact.json'));const rows=JSON.parse(bytes);const cv=require('../docs/'+sid.toUpperCase()+'_BUILD_COVERAGE.json'),contract=require('../scripts/'+sid+'_release_contract.json'),source=require('../docs/'+sid.toUpperCase()+'_CANONICAL_SOURCE.json');
 test(sid+' complete pinned collector IDs and metadata',()=>{
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),source.compactSha256);assert.equal(source.sourceGitBlob,contract.pin);assert.equal(cv.sourceGitBlob,contract.pin);
  const nums=Array.from({length:total},(_,i)=>(sid==='sma'?'SV':'')+(i+1));assert.deepEqual(rows.map(r=>r[0]),nums);assert.deepEqual(set.CARDS.map(c=>c.id),nums.map(n=>sid+'-'+n));
  assert.equal(rows.reduce((n,r)=>n+r[7].length,0),attacks);assert.equal(rows.reduce((n,r)=>n+r[8].length,0),abilities);assert.equal(rows.filter(r=>r[2]==='Trainer').length,trainers);assert.equal(rows.filter(r=>r[3].includes('GX')).length,gx);assert.equal(rows.filter(r=>r[3].includes('TAG TEAM')).length,tags);
 });
 test(sid+' printed attacks, Abilities and Trainer rules preserved; all enabled descriptors valid',()=>{
  for(const [i,r] of rows.entries()){const c=set.CARDS[i];assert.equal(c.name,r[1]);assert.equal(c.rarity,r[12]);assert.equal(c.battleEnabled,c.deckEligible);assert.equal(c.battleEnabled,c.support.status==='FULL');assert.equal(d.cardById(c.id),c);
   if(c.kind==='pokemon'){assert.equal(c.hp,Number(r[4]));assert.equal(c.retreat,r[11]);assert.equal(c.prizeCards,r[3].includes('TAG TEAM')?3:r[3].includes('GX')?2:1);assert.deepEqual(c.attacks.map(a=>[a.name,Array.from(a.cost),a.damageText||'',a.text]),r[7]);assert.deepEqual(c.abilities.map(a=>[a.name,a.printedPowerType==='ability'?'Ability':a.printedPowerType,a.text]),r[8]);
    if(c.battleEnabled)for(const a of [...c.attacks,...c.abilities]){assert.notEqual(a.effect.type,'unsupported');assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);if(a.text&&!/^\(You can.t use more than 1 GX attack/.test(a.text))assert.notEqual(a.effect.type,'noop',c.id+' '+a.name);}
   }else {assert.equal(c.text,r[13].join('\n'));if(c.battleEnabled){assert.notEqual(c.effect.type,'unsupported');assert.deepEqual(fx.validateEffect(c.effect),[],c.id);}}
  }
  assert.deepEqual(cv.gated,Object.fromEntries(set.CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])));assert.equal(cv.battleReady,total);assert.deepEqual(cv.gated,{});
 });
 test(sid+' player and CPU can select this set and construct a legal deck',()=>{
  const b=require(assets+'tcg-classic-deck-builder.js'),o=require(assets+'tcg-classic-opponents.js'),p=require(assets+'tcg-classic-set-picker.js');assert.ok(b.SET_IDS.includes(sid));assert.ok(o.SETS.includes(sid));assert.equal(p.names[sid],set.SET.name);assert.ok(d.SETS.some(s=>s.id===sid));
  const owned=set.CARDS.map(c=>({gameplayId:c.id,quantity:4}));const player=b.buildDeck(owned,{sets:[sid],types:['Fire'],randomSeed:3}),cpu=o.generate({seed:3,sets:[sid],type:'Fire'});for(const r of [player,cpu]){assert.ok(r.ok,JSON.stringify(r));assert.equal(r.cards.length,30);assert.ok(d.validateDeck(r.cards).ok);assert.ok(r.cards.every(id=>d.cardById(id).setId===sid&&d.cardById(id).battleEnabled));}
 });
}
test('alternate prints have equal gameplay rules',()=>{for(const [a,b] of [[44,66],[44,69],[57,67],[58,68]])for(const k of ['name','battleEnabled','attacks','abilities','effect','trainerType'])assert.deepEqual(d.cardById('sm115-'+a)[k],d.cardById('sm115-'+b)[k]);});
test('Shiny Vault reprints preserve complete earlier descriptors for representative bespoke mechanics',()=>{for(const [a,b] of [['SV4','sm3-16'],['SV11','sm6-21'],['SV15','sm3-50'],['SV18','sm6-51'],['SV41','sm1-101'],['SV70','sm3-88'],['SV71','sm4-63'],['SV87','sm2-116']]){const x=d.cardById('sma-'+a),y=d.cardById(b);assert.ok(x.battleEnabled);for(const k of ['attacks','abilities','effect','trainerType'])assert.deepEqual(x[k]??(k==='attacks'?[]:undefined),y[k]??(k==='attacks'?[]:undefined),a+' '+k);}});
