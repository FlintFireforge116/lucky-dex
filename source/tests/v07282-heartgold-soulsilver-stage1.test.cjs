'use strict';
/* HGSS1 Stage 1 mandatory APK audit. Source is immutable; never use generic
   battleEnabled to disguise an unimplemented printed rule. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=fs.readFileSync(path.join(root,'data/classic/hgss1-print-compact.json'));
const src=JSON.parse(data);
const set=require(path.join(assets,'tcg-classic-heartgold-soulsilver.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const pick=require(path.join(assets,'tcg-classic-set-picker.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const letters={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'};
const expectedNumbers=new Set([...Array.from({length:123},(_,i)=>String(i+1)),'ONE']);

test('locked 124 authentic collector prints, including the ONE secret print',()=>{
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),'e34fc017cbd948bea3f4fa18a627d55efaf2d217dbc4a2ec8afe102f1846a9f2');
 assert.equal(src.length,124);assert.deepEqual(new Set(src.map(r=>String(r[0]))),expectedNumbers);
 assert.equal(set.CARDS.length,124);assert.equal(new Set(set.CARDS.map(c=>c.id)).size,124);
 assert.deepEqual(new Set(set.CARDS.map(c=>c.number)),expectedNumbers);
 for(const r of src){
  const [n,name,supertype,subtypes,hp,types,evolve,attacks,abilities,weak,res,retreat,rarity,rules]=r;
  const c=set.cardById('hgss1-'+n);
  assert.ok(c,'hgss1-'+n);assert.equal(c.name,name);assert.equal(c.number,n);assert.equal(c.setId,'hgss1');
  assert.equal(c.kind,supertype==='Pokémon'?'pokemon':supertype==='Trainer'?'trainer':'energy');
  assert.equal(c.rarity,rarity||'');assert.equal(c.image,`https://images.pokemontcg.io/hgss1/${n}.png`);
  assert.deepEqual((c.attacks||[]).map(a=>[a.name,a.cost,a.damageText,a.text]),(attacks||[]).map(a=>[a[0],a[1].map(t=>letters[t]).join(''),a[2]||null,a[3]||'']));
  assert.deepEqual((c.abilities||[]).map(a=>[a.name,a.text,a.printedPowerType]),(abilities||[]).map(a=>[a[0],a[2]||'',a[1]==='Poké-Power'?'power':'body']));
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(hp));assert.equal(c.stage,subtypes[0]);assert.deepEqual(c.types,types);
   assert.equal(c.evolvesFrom,evolve||null);assert.equal(c.retreat,Number(retreat||0));
   assert.deepEqual(c.weaknesses,weak);assert.deepEqual(c.resistances,res);
  }
  if(c.kind==='trainer')assert.equal(c.text,rules.join('\n'));
 }
});

test('Classic set picker, CPU sets, manual builder and ownership cover numeric and ONE IDs',()=>{
 assert.ok(db.SETS.some(s=>s.id==='hgss1'));
 assert.ok(pick.rows.some(r=>r[0]==='hgss1'&&r[2]==='HeartGold & SoulSilver'));
 assert.ok(cpu.SETS.includes('hgss1'));assert.ok(builder.SET_IDS.includes('hgss1'));
 for(const id of ['hgss1-1','hgss1-110','hgss1-111','hgss1-123','hgss1-ONE'])assert.ok(db.cardById(id));
 const owned=db.projectOwnedCards([{source:'tcg',setId:'hgss1',number:'ONE',quantity:2},{source:'tcg',setId:'hgss1',number:'123',count:3},{source:'tcg',setName:'HeartGold & SoulSilver',number:'001',quantity:4}]);
 for(const [id,n] of [['hgss1-ONE',2],['hgss1-123',3],['hgss1-1',4]])assert.ok(owned.some(x=>x.gameplayId===id&&x.quantity===n),id+': '+JSON.stringify(owned));
});

test('all enabled attack, Trainer and Pokémon power schemas validate, gating is complete',()=>{
 let eligible=0,blocked=0;
 for(const c of set.CARDS){
  assert.equal(c.battleEnabled,c.support.status==='FULL',c.id);
  if(!c.battleEnabled){blocked++;assert.equal(c.deckEligible,false,c.id);assert.ok(c.support.reasons?.length,c.id);continue;}
  if(c.deckEligible)eligible++;
  for(const a of [...(c.attacks||[]),...(c.abilities||[]),...(c.kind==='trainer'?[c]:[])]){
    assert.deepEqual(fx.validateEffect(a.effect),[],c.id+':'+a.name);
    if((a.text||'').trim()&&a.effect?.type==='noop')assert.fail('nonempty printed mechanic cannot be a no-op: '+c.id+' '+a.name);
  }
 }
 assert.ok(eligible>=70,'Need useful battle-ready selection, not only a collector placeholder');
 assert.equal(eligible,116);assert.equal(blocked,0);
 assert.equal(set.coverage().total,124);assert.equal(set.coverage().gated.length,0);
});

test('LEGEND halves are deck-eligible as physical cards but cannot enter as lone Basic Pokémon',()=>{
 for(const n of [111,112,113,114]){const c=set.cardById('hgss1-'+n);assert.equal(c.stage,'LEGEND');assert.equal(c.legendHalf,true);assert.ok(c.battleEnabled);assert.ok(c.deckEligible);}
 for(const pair of [[111,112],[113,114]])assert.equal(set.cardById('hgss1-'+pair[0]).legendPair,set.cardById('hgss1-'+pair[1]).legendPair);
});

test('8 Basic Energy prints remain zoned, double Colorless and Rainbow are special playable Energy',()=>{
 for(let n=115;n<=122;n++){
  const c=set.cardById('hgss1-'+n);assert.equal(c.basicEnergy,true);assert.equal(c.deckEligible,false);assert.equal(c.kind,'energy');
 }
 const dce=set.cardById('hgss1-103'),rainbow=set.cardById('hgss1-104');
 assert.equal(dce.specialEnergy,true);assert.equal(rainbow.specialEnergy,true);
 assert.deepEqual(dce.effect.provides,{Colorless:2});assert.deepEqual(rainbow.effect.provides,{Miracle:1});
 assert.equal(rainbow.deckEligible,true);
 const core=fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8');
 assert.ok(core.includes("'hgss1-104'].includes(card.id)"),'Rainbow hand-attachment damage must be enabled');
});

test('Mappable Pokémon effects retain authentic nontrivial behavior and do not invent new printed powers',()=>{
 const find=(id,name)=>set.cardById(id).attacks.find(a=>a.name===name);
 assert.equal(find('hgss1-6','Mass Attack').effect.effects[1].side,'both');
 assert.equal(find('hgss1-6','Mass Attack').effect.effects[1].type,'benchCountDamage');
 assert.equal(find('hgss1-20','Spinning Tail').effect.effects[1].type,'benchDamage');
 assert.equal(find('hgss1-107','Earthquake').effect.side,'self');
 assert.equal(set.cardById('hgss1-107').abilities[0].name,'Exoskeleton');
 assert.equal(set.cardById('hgss1-107').abilities[0].printedPowerType,'body');
 assert.equal(set.cardById('hgss1-108').battleEnabled,true,'Rain Dance must be repeatable');
 assert.equal(set.cardById('hgss1-12').battleEnabled,true,'Second Sight must choose player deck');
 assert.equal(set.cardById('hgss1-94').battleEnabled,true,'Moomoo Milk must stick to a chosen target');
 assert.equal(set.cardById('hgss1-91').battleEnabled,true,'Energy Switch must allow any two own Pokémon');
});

test('HGSS-only CPU builds produce 30 legal, on-set decks with no gated cards for available types',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless']){
  for(const seed of [1,3,17]){
   const d=cpu.generate({sets:['hgss1'],type,seed});assert.ok(d.ok,`${type}/${seed}: ${JSON.stringify(d)}`);
   assert.equal(d.cards.length,30,`${type}/${seed}`);assert.ok(db.validateDeck(d.cards).ok,`${type}/${seed} - ${JSON.stringify(db.validateDeck(d.cards).errors)}`);
   for(const id of d.cards){const c=db.cardById(id);assert.equal(c.setId,'hgss1',id);assert.equal(c.deckEligible,true,id);}
  }
 }
});

test('version agrees across Gradle, UI and runtime boot bundle, and new set script loads before battle-data',()=>{
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8'),html=fs.readFileSync(path.join(assets,'index.html'),'utf8'),boot=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
 const version=gradle.match(/versionName ['"]([^'"]+)['"]/)[1];
 assert.equal(version,'0.69.283');assert.ok(html.includes('v'+version));assert.ok(boot.includes("window.__LUCKYDEX_BUILD='"+version+"'"));
 assert.ok(html.indexOf('tcg-classic-heartgold-soulsilver.js')<html.indexOf('tcg-classic-battle-data.js'));
});
