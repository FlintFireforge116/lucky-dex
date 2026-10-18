'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const P=require('../app/src/main/assets/pack-policy-v0343.js');
const R=require('../app/src/main/assets/card-rarity-v0253.js');

test('legacy/non-ISO catalogue dates resolve to the correct historical pack era',()=>{
  const cases=[
    [{id:'library:JU',name:'Jungle',releaseDate:'Jun 16, 1999',_librarySeries:'Classic'},'wotc_11',11],
    [{id:'library:EX',name:'Expedition Base Set',releaseDate:'Sep 15, 2002',_librarySeries:'E-Card'},'ecard_ex_9',9],
    [{id:'library:DP',name:'Diamond & Pearl',releaseDate:'May 1, 2007',_librarySeries:'Diamond & Pearl'},'dp_bw_xy_10',10],
    [{id:'library:SM1',name:'Sun & Moon',releaseDate:'Feb 3, 2017',_librarySeries:'Sun & Moon'},'sm_swsh_10',10],
    [{id:'library:SV1',name:'Scarlet & Violet',releaseDate:'Mar 31, 2023',_librarySeries:'Scarlet & Violet'},'sv_10',10]
  ];
  for(const [set,id,count] of cases){const p=P.resolve(set,'tcg');assert.equal(p.id,id,set.name);assert.equal(p.cardCount,count,set.name);}
});

test('human release dates determine the era even when series metadata is absent or unhelpful',()=>{
  const cases=[
    ['Jun 16, 1999','wotc_11'],
    ['Sep 15, 2002','ecard_ex_9'],
    ['May 1, 2007','dp_bw_xy_10'],
    ['Feb 3, 2017','sm_swsh_10'],
    ['Mar 31, 2023','sv_10']
  ];
  for(const [releaseDate,id] of cases){
    const p=P.resolve({id:`library:${id}`,name:`Dated ${id}`,releaseDate,_librarySeries:'Other'},'tcg');
    assert.equal(p.id,id,releaseDate);
  }
  const malformed=P.resolve({id:'library:BADDATE',name:'Bad Date Product',releaseDate:'Feb 31, 2012',_librarySeries:'Other'},'tcg');
  assert.equal(malformed.purchasable,false,'invalid calendar dates must fail closed rather than roll into another date');
});

test('known series are a safe fallback when old cached catalogue rows have no release date',()=>{
  const cases=[
    [{name:'Jungle',_librarySeries:'Classic'},'wotc_11'],
    [{name:'Aquapolis',_librarySeries:'E-Card'},'ecard_ex_9'],
    [{name:'Platinum',_librarySeries:'Platinum'},'dp_bw_xy_10'],
    [{name:'Black & White',_librarySeries:'Black & White'},'dp_bw_xy_10'],
    [{name:'XY',_librarySeries:'XY'},'dp_bw_xy_10'],
    [{name:'Sun & Moon',_librarySeries:'Sun & Moon'},'sm_swsh_10'],
    [{name:'Sword & Shield',_librarySeries:'Sword & Shield'},'sm_swsh_10'],
    [{name:'Scarlet & Violet',_librarySeries:'Scarlet & Violet'},'sv_10'],
    [{name:'Mega Evolution',_librarySeries:'Mega Evolution'},'sv_10']
  ];
  for(const [set,id] of cases)assert.equal(P.resolve(set,'tcg').id,id,set.name);
});

test('an undated unknown physical set is not silently treated as a Scarlet & Violet booster',()=>{
  const p=P.resolve({id:'library:MYSTERY',name:'Mystery Product',releaseDate:'',_librarySeries:'Other'},'tcg');
  assert.equal(p.purchasable,false);
  assert.equal(p.productKind,'unknown');
  assert.equal(p.cardCount,0);
});

test('Jungle remains exact 7 common + 3 uncommon + 1 rare under stale catalogue date shapes',()=>{
  for(const set of [
    {id:'library:JU',name:'Jungle',releaseDate:'Jun 16, 1999',_librarySeries:'Classic'},
    {id:'library:JU',name:'Jungle',releaseDate:'',_librarySeries:'Classic'}
  ]){
    const slots=P.slotPlan(set,{source:'tcg'});
    assert.equal(slots.length,11);
    assert.deepEqual(slots.slice(0,7).map(x=>x.allowedClasses),Array.from({length:7},()=>['common']));
    assert.deepEqual(slots.slice(7,10).map(x=>x.allowedClasses),Array.from({length:3},()=>['uncommon']));
    assert.equal(slots[10].id,'rare');
  }
});

test('physical Lucky Packs upgrade only existing rare-or-higher slots instead of creating extra holo slots',()=>{
  const samples=[
    {name:'Jungle',releaseDate:'Jun 16, 1999',_librarySeries:'Classic'},
    {name:'Expedition Base Set',releaseDate:'Sep 15, 2002',_librarySeries:'E-Card'},
    {name:'Diamond & Pearl',releaseDate:'May 1, 2007',_librarySeries:'Diamond & Pearl'},
    {name:'Sun & Moon',releaseDate:'Feb 3, 2017',_librarySeries:'Sun & Moon'},
    {name:'Scarlet & Violet',releaseDate:'Mar 31, 2023',_librarySeries:'Scarlet & Violet'}
  ];
  for(const set of samples){
    const normal=P.slotPlan(set,{source:'tcg',luckyPack:false});
    const lucky=P.slotPlan(set,{source:'tcg',luckyPack:true});
    assert.equal(lucky.length,normal.length,set.name);
    assert.equal(lucky.filter(slot=>slot.rareOrHigher).length,normal.filter(slot=>slot.rareOrHigher).length,`${set.name}: Lucky Pack must not add rare-or-higher slots`);
    for(let i=0;i<normal.length;i++){
      if(normal[i].rareOrHigher){
        assert.ok(lucky[i].allowedClasses.includes('rare'),`${set.name}: Lucky Pack must retain the authentic rare-slot fallback`);
        assert.ok((lucky[i].replacements||[]).some(row=>row.family==='lucky-hit'),`${set.name}: existing hit slot should receive the Lucky Pack bias`);
      }else{
        assert.deepEqual(lucky[i].allowedClasses,normal[i].allowedClasses,`${set.name}: Lucky Pack must not create a new rare slot at ${normal[i].id}`);
        assert.equal(lucky[i].rareOrHigher,normal[i].rareOrHigher,`${set.name}: non-hit slot rarity contract changed`);
      }
    }
  }
});

test('pack contract validator rejects the exact Jungle leak seen on-device',()=>{
  assert.equal(typeof P.validatePack,'function');
  const set={id:'library:JU',name:'Jungle',releaseDate:'Jun 16, 1999',_librarySeries:'Classic'};
  const cards=[];
  for(let n=49;n<=55;n++)cards.push({id:`JU-${n}`,localId:String(n),name:`Common ${n}`,rarity:'Common',setId:'library:JU',setName:'Jungle'});
  cards.push({id:'JU-36',localId:'36',name:'Fearow',rarity:'Uncommon',setId:'library:JU',setName:'Jungle'});
  cards.push({id:'JU-45',localId:'45',name:'Rhydon',rarity:'Uncommon',setId:'library:JU',setName:'Jungle'});
  cards.push({id:'JU-48',localId:'48',name:'Weepinbell',rarity:'Uncommon',setId:'library:JU',setName:'Jungle'});
  cards.push({id:'JU-1',localId:'1',name:'Clefable',rarity:'Rare Holo',setId:'library:JU',setName:'Jungle'});
  assert.equal(P.validatePack(cards,set,'tcg',{classifier:R.classify}).ok,true);
  const bad=cards.slice();
  bad[8]={id:'JU-6',localId:'6',name:'Mr. Mime',rarity:'Rare Holo',setId:'library:JU',setName:'Jungle'};
  const audit=P.validatePack(bad,set,'tcg',{classifier:R.classify});
  assert.equal(audit.ok,false);
  assert.ok(audit.errors.some(x=>/uncommon-2/.test(x)));
});

test('live and offline pack construction both enforce the post-build pack contract',()=>{
  const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(app,/validatePack\?\.\(cards,set,source/);
  assert.match(app,/Invalid pack collation/);
  assert.ok((app.match(/assertPackContractV03515\(cards,set,source,slots\)/g)||[]).length>=2,'live and offline builders must both pass through the validator');
});
