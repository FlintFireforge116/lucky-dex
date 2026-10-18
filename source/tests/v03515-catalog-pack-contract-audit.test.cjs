'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const P=require('../app/src/main/assets/pack-policy-v0343.js');
const B=require('../app/src/main/assets/booster-art-v0260.js');
globalThis.LuckyDexPackPolicy=P;
globalThis.LuckyDexBoosterArt=B;
const A=require('../app/src/main/assets/card-acquisition-v0246.js');

const release=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/physical-set-release-dates-v0244.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../app/src/main/assets/booster-art-index-v0260.json'),'utf8'));
const byNormalizedRelease=new Map(Object.entries(release).map(([name,date])=>[B.normalizeName(name),date]));
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function releaseFor(name){return byNormalizedRelease.get(B.normalizeName(name))||byNormalizedRelease.get(B.canonicalName(name))||'';}
function legacyDate(iso){const [y,m,d]=String(iso).split('-').map(Number);return `${MONTHS[m-1]} ${d}, ${y}`;}

test('every bundled Pack Shop product with a known release date has a stable audited profile',()=>{
  const audited=[];
  for(const name of Object.keys(manifest.byName||{})){
    const date=releaseFor(name);
    const set={id:`library:${name}`,name,releaseDate:date};
    if(!A.boosterProductEligible(set,'tcg'))continue;
    assert.ok(date,`${name}: Pack Shop product has no canonical release date`);
    const profile=P.resolve(set,'tcg');
    assert.equal(profile.productKind,'booster',`${name}: non-booster leaked into Pack Shop`);
    assert.equal(profile.purchasable,true,`${name}: purchasable flag`);
    assert.ok(profile.cardCount>0,`${name}: no card count`);
    assert.equal(profile.slots.length,profile.cardCount,`${name}: slot count does not match pack count`);
    audited.push(name);
  }
  assert.ok(audited.length>=130,`expected broad physical Pack Shop audit, got ${audited.length}`);
});

test('all audited physical booster profiles are invariant to ISO versus legacy human-readable dates',()=>{
  let checked=0;
  for(const name of Object.keys(manifest.byName||{})){
    const date=releaseFor(name);if(!date)continue;
    const iso={id:`library:${name}`,name,releaseDate:date};
    if(!A.boosterProductEligible(iso,'tcg'))continue;
    const legacy={...iso,releaseDate:legacyDate(date)};
    const a=P.resolve(iso,'tcg'),b=P.resolve(legacy,'tcg');
    assert.equal(b.id,a.id,`${name}: stale catalogue date changed pack profile`);
    assert.equal(b.cardCount,a.cardCount,`${name}: stale catalogue date changed card count`);
    assert.deepEqual(b.slots.map(x=>[x.id,x.allowedClasses]),a.slots.map(x=>[x.id,x.allowedClasses]),`${name}: stale date changed slot contract`);
    checked++;
  }
  assert.ok(checked>=130,`expected broad date-shape audit, got ${checked}`);
});

test('historical standard profiles cannot gain extra rare slots from catalogue fallthrough',()=>{
  const expectations={wotc_11:{count:11,rare:1},ecard_ex_9:{count:9,rare:1},dp_bw_xy_10:{count:10,rare:1},sm_swsh_10:{count:10,rare:1},sv_10:{count:10,rare:1}};
  for(const [id,row] of Object.entries(expectations)){
    const sample={
      wotc_11:{name:'Jungle',releaseDate:'Jun 16, 1999'},
      ecard_ex_9:{name:'Aquapolis',releaseDate:'Jan 15, 2003'},
      dp_bw_xy_10:{name:'Diamond & Pearl',releaseDate:'May 1, 2007'},
      sm_swsh_10:{name:'Sun & Moon',releaseDate:'Feb 3, 2017'},
      sv_10:{name:'Scarlet & Violet',releaseDate:'Mar 31, 2023'}
    }[id];
    const p=P.resolve(sample,'tcg');
    assert.equal(p.id,id);
    assert.equal(p.slots.length,row.count);
    assert.equal(p.slots.filter(slot=>slot.rareOrHigher).length,row.rare,`${id}: should have one dedicated rare-or-higher slot`);
  }
});


test('actual catalogue era boundaries cannot slide into the preceding pack format',()=>{
  const cases=[
    [{name:'Power Keepers',releaseDate:'Feb 2, 2007',_librarySeries:'EX'},'ecard_ex_9',9],
    [{name:'Diamond & Pearl',releaseDate:'May 1, 2007',_librarySeries:'Diamond & Pearl'},'dp_bw_xy_10',10],
    [{name:'Sun & Moon',releaseDate:'Feb 3, 2017',_librarySeries:'Sun & Moon'},'sm_swsh_10',10],
    [{name:'Scarlet & Violet',releaseDate:'Mar 31, 2023',_librarySeries:'Scarlet & Violet'},'sv_10',10]
  ];
  for(const [set,id,count] of cases){
    const profile=P.resolve(set,'tcg');
    assert.equal(profile.id,id,set.name);
    assert.equal(profile.cardCount,count,set.name);
  }
});
