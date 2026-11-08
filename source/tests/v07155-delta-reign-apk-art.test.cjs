'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'../..');
const ASSETS=path.join(ROOT,'source/app/src/main/assets');
const DELTA=fs.readFileSync(path.join(ASSETS,'delta-reign-card-art-v069154.js'),'utf8');
const FLOW=fs.readFileSync(path.join(ASSETS,'pack-flow-v0165.js'),'utf8');
const start=FLOW.indexOf('function preloadPackCard('),end=FLOW.indexOf('\nconst POCKET_EXACT_DATASETS_',start);
assert.ok(start>0&&end>start,'actual pack-reveal loader must exist');
const LOADER=FLOW.slice(start,end);

function simulate({offline=false,localLoads=true,remoteLoads=false,set='Delta Reign',id='ME6-012',number='012',name='Sprigatito'}={}){
  const attempts=[],window={location:{protocol:'file:'}},card={id,number,name,image:'old-invalid-image.webp'},
    run={art:new Map(),abort:{signal:{aborted:false}},urls:new Set()};
  vm.runInNewContext(DELTA,{window,console,Map,Set,Object,Array,Number,String,RegExp,JSON});
  const sandbox={window,console,Map,Set,Promise,JSON,URL,
    preparedPack:{source:'tcg',set:{id:set==='Delta Reign'?'library:me6':'base1',name:set}},
    isOnlineV13:()=>!offline,validPackRun:()=>true,
    packCachedBlob:async()=>null,packArtworkIsUsable:async()=>false,
    packArtworkCandidatesV163:async()=>[],cacheRemotePackArtworkV163:()=>{},
    LuckyDexPack:{decodeImage:async url=>{
      attempts.push(url);
      return url.startsWith('file:///android_asset/')?localLoads:url.startsWith('https://raw.githubusercontent.com/')?remoteLoads:false;
    },placeholder:cardName=>`placeholder:${cardName}`}
  };
  vm.runInNewContext(LOADER,sandbox,{filename:'pack-flow-exact-loader.js'});
  return sandbox.preloadPackCard(card,run).then(result=>({result,card,attempts}));
}

test('Delta Reign Sprigatito loads exact APK scan without an internet connection',async()=>{
  const r=await simulate({offline:true});
  assert.equal(r.result.source,'delta-reign-apk');
  assert.equal(r.result.url,'file:///android_asset/delta-reign-cards/me06-012_sprigatito.webp');
  assert.deepEqual(r.attempts,[r.result.url]);
  assert.equal(r.card._artIdentityVerified,true);
});

test('Delta Reign uses the exact matching local scan for ordinary, holo and secret numbers',async()=>{
  for(const [id,num,name,filename] of [
    ['ME6-004','004','Cacnea','me06-004_cacnea.webp'],
    ['ME6-092','092',"Emcee's Hype",'me06-092_emcee_s_hype.webp'],
    ['ME6-141','141','Mega Rayquaza ex','me06-141_mega_rayquaza_ex_mhr.webp']
  ]){
    const r=await simulate({offline:true,id,number:num,name});
    assert.equal(r.result.url,`file:///android_asset/delta-reign-cards/${filename}`);
  }
});

test('Delta Reign falls back to exact card image on GitHub if APK asset fails',async()=>{
  const r=await simulate({offline:false,localLoads:false,remoteLoads:true});
  assert.equal(r.result.source,'delta-reign-github');
  assert.equal(r.attempts.length,2);
  assert.equal(r.attempts[1],'https://raw.githubusercontent.com/FlintFireforge116/lucky-dex/main/source/app/src/main/assets/delta-reign-cards/me06-012_sprigatito.webp');
});

test('Wrong card identity never receives Delta Reign artwork',async()=>{
  const r=await simulate({offline:true,id:'base1-012',number:'012',name:'Sprigatito',set:'Base Set'});
  assert.equal(r.result.source,'placeholder');
  assert.equal(r.result.url,'placeholder:Sprigatito');
  assert.equal(r.attempts.length,0);
});

test('Android preBuild validates all 141 actual bundled WebP assets and build version is valid',()=>{
  const gradle=fs.readFileSync(path.join(ROOT,'source/app/build.gradle'),'utf8');
  assert.match(gradle,/validateDeltaReignCardAssets/);
  assert.match(gradle,/dependsOn tasks\.named\('validateDeltaReignCardAssets'\)/);
  assert.match(gradle,/if \(!img\.isFile\(\) \|\| img\.length\(\) < 8000\)/);
  const version=gradle.match(/versionName '(\d+\.\d+\.\d+)'/)?.[1];
  assert.ok(version&&Number(version.split('.')[2])>=157);
  assert.ok(Number(gradle.match(/versionCode (\d+)/)?.[1]||0)>=7137);
  const lines=fs.readFileSync(path.join(ROOT,'source/scripts/delta-reign-art-download.txt'),'utf8').trim().split('\n');
  assert.equal(lines.length,141);
  assert.equal(new Set(lines.map(l=>l.split('|')[1])).size,141);
});
