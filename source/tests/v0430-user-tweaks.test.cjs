'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

test('Stadium 2 Kids Club uses an authentic Clear Cut capture with a local offline fallback',()=>{
  const world=read('arcade-world.js');
  const sources=read('arcade/kids-club/SOURCES.md');
  assert.match(world,/id:"stadium2KidsClub"[^\n]+art:"https:\/\/www\.vizzed\.com\/[^"]+Pokemon%20Stadium%202[^"]+\.png"/i);
  assert.match(world,/id:"stadium2KidsClub"[^\n]+fallbackArt:"arcade\/kids-club\/kids-club-2-venue\.svg"/);
  assert.match(world,/fallbackArt[\s\S]{0,900}onerror|onerror[\s\S]{0,900}fallbackArt/,'remote venue art needs a local fallback on image failure');
  assert.equal(fs.existsSync(asset('arcade/kids-club/kids-club-2-venue.svg')),true,'existing Stadium 2 illustration must remain as the offline fallback');
  assert.match(sources,/Stadium 2/i,'asset provenance must document the Stadium 2 image');
  assert.match(sources,/Vizzed|Clear Cut Challenge/i,'asset provenance must identify the authentic Clear Cut capture');
});

test('Pocket Rare Pack upgrades normal rarity progression by one class and guarantees one great hit',()=>{
  const policy=fresh('pack-policy-v0343.js');
  const upgrades={
    common:'uncommon',uncommon:'rare',rare:'double-rare','double-rare':'ultra',
    ultra:'illustration',illustration:'special-illustration','special-illustration':'secret',secret:'secret'
  };
  for(const [from,to] of Object.entries(upgrades))assert.equal(policy.upgradePocketRareClass(from),to,`${from} should upgrade to ${to}`);

  const base=policy.slotPlan({id:'A1',name:'Genetic Apex'},{source:'tcgp',luckyPack:false,random:()=>.99});
  const rare=policy.slotPlan({id:'A1',name:'Genetic Apex'},{source:'tcgp',luckyPack:true,random:()=>.99});
  assert.equal(rare.length,base.length);
  assert.equal(rare.filter(slot=>slot.rarePackGreatHit===true).length,1,'Rare Pack must guarantee exactly one great-hit slot');
  assert.ok(rare.some(slot=>slot.rarePackGreatHit!==true),'not every Rare Pack slot should be jackpot-tier');
  assert.ok(rare.every(slot=>slot.specialRule==='pocket-rare-uplift'||slot.rarePackGreatHit===true),'Rare Pack slots should use the uplift contract');
  assert.ok(rare.some((slot,i)=>JSON.stringify(slot.allowedClasses)===JSON.stringify(base[i].allowedClasses)),'Rare Pack should preserve base slot identities instead of flattening every slot to one high pool');

  const normalCommon={id:'probe',allowedClasses:['common'],finish:'normal',replacements:[],rareOrHigher:false};
  const upliftCommon={...normalCommon,specialRule:'pocket-rare-uplift'};
  assert.deepEqual(policy.targetClassesFor({id:'A1',name:'Genetic Apex'},upliftCommon,'tcgp',()=>0),['uncommon']);
  const great={...normalCommon,specialRule:'pocket-rare-uplift',rarePackGreatHit:true};
  assert.ok(['ultra','illustration','special-illustration','secret'].includes(policy.targetClassesFor({id:'A1',name:'Genetic Apex'},great,'tcgp',()=>0)[0]));
});

test('Rare Pack and God Pack keep different odds and different presentation states',()=>{
  const flow=read('pack-flow-v0165.js');
  const god=fresh('god-pack-v0291.js');
  const css=read('god-pack-v0291.css');
  assert.equal(god.PRODUCTION_DENOMINATOR,1000);
  assert.match(flow,/!godPack\s*&&\s*Math\.random\(\)\s*<\s*1\/500/,'Rare Pack odds must remain 1 in 500');
  assert.match(flow,/rare-pack-active/,'Rare Pack needs a separate stage state');
  assert.match(flow,/rare-pack-intro/,'Rare Pack needs its own intro markup/state');
  assert.match(flow,/rare-pack-summary/,'Rare Pack needs its own summary style');
  assert.match(css,/\.rare-pack-active/,'Rare Pack needs dedicated CSS instead of borrowing God Pack styling');
  assert.match(css,/\.rare-pack-intro/);
  assert.match(css,/\.rare-pack-summary/);
  assert.match(flow,/function closePackOpening[\s\S]{0,1200}classList\.remove\('god-pack-omen','god-pack-active','rare-pack-active'\)/,'closing the opener must clear the Rare Pack stage state');
});

test('Pokemon GO hidden Ditto is an independent 1-in-40 pack event using one authentic disguise',()=>{
  assert.equal(fs.existsSync(asset('pokemon-go-ditto-v04030.js')),true,'v0.40.30 Ditto helper must exist');
  const ditto=fresh('pokemon-go-ditto-v04030.js');
  assert.equal(ditto.PRODUCTION_DENOMINATOR,40);
  assert.equal(ditto.shouldRoll(()=>0),true);
  assert.equal(ditto.shouldRoll(()=>0.0249),true);
  assert.equal(ditto.shouldRoll(()=>0.025),false);
  const set={id:'pgo',name:'Pokémon GO',cards:[
    {id:'pgo-6',localId:'6',name:'Spinarak'},
    {id:'pgo-13',localId:'13',name:'Numel'},
    {id:'pgo-53',localId:'53',name:'Ditto'},
    {id:'pgo-59',localId:'59',name:'Bidoof'}
  ]};
  const slots=[{id:'common-1',finish:'normal'},{id:'reverse',finish:'reverse-holo'},{id:'rare',finish:'holo-eligible'}];
  assert.equal(ditto.planHiddenDitto(set,slots,()=>.5),null,'most Pokémon GO packs should not contain hidden Ditto');
  const sequence=[0,.99];
  const plan=ditto.planHiddenDitto(set,slots,()=>sequence.shift());
  assert.equal(plan.index,1,'hidden Ditto must occupy the reverse slot');
  assert.equal(plan.cover.localId,'59','disguise selection should choose from the authentic three-card cover pool');
  assert.deepEqual(ditto.eligibleCoverBriefs(set).map(card=>String(card.localId)),['6','13','59']);
});

test('pack orchestration rolls Ditto independently instead of converting every eligible reverse cover',()=>{
  const flow=read('pack-flow-v0165.js'),app=read('app-v0167.js'),html=read('index.html');
  assert.match(flow,/applyPokemonGoHiddenDittoV04030\(/,'pack orchestration must use the v0.40.30 independent Ditto event');
  assert.doesNotMatch(flow,/applyPokemonGoHiddenDittoV04029/,'v0.40.30 orchestration must not be guarded by the removed v0.40.29 function name');
  assert.match(app,/planHiddenDitto/,'Ditto application should plan the event before replacing the reverse slot');
  assert.doesNotMatch(app,/for\(let i=0;i<cards\.length;i\+\+\)[\s\S]{0,240}isEligibleCover/,'the old every-eligible-cover auto-conversion loop must be gone');
  assert.match(html,/pokemon-go-ditto-v04030\.js/,'new Ditto helper must load in the app');
});
