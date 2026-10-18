'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
const art=fs.readFileSync(path.join(root,'app/src/main/assets/card-art-library-v0165.js'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/build-apk.yml'),'utf8');
const ignore=fs.readFileSync(path.join(root,'.gitignore'),'utf8');

// Release-date sorting must not silently become alphabetical when metadata is partial.
assert.match(art,/_catalogOrder/,'physical card catalogue exposes its authoritative source chronology ordinal');
assert.match(flow,/packReleaseSortKeyV0243|releaseSortKeyV0243/,'Packs owns an explicit v0.24.3 chronology sort key');
assert.match(flow,/my first battle[^\n]*2023-09-29/i,'My First Battle has its exact physical release-date override');

function context(){
  const c={console,window:null,state:{cards:{},ui:{packBrowser:{sortKey:'releaseDate',sortDir:'desc',chronologyV0242:true},packMetrics:{}},settings:{}},setCache:{tcg:[],tcgp:[]},document:{getElementById(){return null;}},LuckyDexDebug:{},LuckyDexPack:{dateValue(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;const n=Date.parse(value+'T00:00:00Z');return Number.isFinite(n)?n:null;},placeholder:()=>''},escapeHtml:String,AbortController,URL,setTimeout,clearTimeout,Promise,Date};
  c.window=c;vm.createContext(c);vm.runInContext(flow,c,{filename:'pack-flow-v0165.js'});return c;
}
{
  const c=context();
  c.setCache.tcg=[
    {id:'older-name-z',name:'Zulu Set',releaseDate:'2023',_catalogOrder:10,cardCount:{total:10}},
    {id:'newer-name-a',name:'Alpha Set',releaseDate:'2023',_catalogOrder:11,cardCount:{total:10}},
    {id:'151',name:'Scarlet & Violet—151',releaseDate:'2023',_catalogOrder:12,cardCount:{total:207}},
    {id:'mfb',name:'My First Battle',releaseDate:'2023',_catalogOrder:13,cardCount:{total:48}},
  ];
  assert.deepEqual(Array.from(c.LuckyDexPackBrowser.rows('tcg','','releaseDate','desc')).map(x=>x.id),['mfb','151','newer-name-a','older-name-z'],'release sorting uses exact overrides then catalogue chronology, never alphabetical tie-breaking for partial dates');
}

// Permanent Android identity: canonical key is part of source and CI must refuse any other signer.
const keyPath=path.join(root,'app/luckydex-dev.keystore');
assert.ok(fs.existsSync(keyPath),'canonical LuckyDex signing keystore is bundled');
const keySha=crypto.createHash('sha256').update(fs.readFileSync(keyPath)).digest('hex');
assert.equal(keySha,'90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3','bundled keystore is the original stable LuckyDex signer');
assert.match(ignore,/!app\/luckydex-dev\.keystore/,'canonical signing key is explicitly allowed into source control');
assert.match(gradle,/GradleException[\s\S]{0,500}luckydex-dev\.keystore|luckydex-dev\.keystore[\s\S]{0,500}GradleException/,'Gradle fails instead of falling back when canonical signer is absent');
assert.match(workflow,/90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3/,'CI pins canonical keystore SHA-256');
assert.match(workflow,/06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A/,'CI pins canonical signing certificate fingerprint');
assert.doesNotMatch(workflow,/falling back to Android debug signing/i,'CI never silently falls back to an ephemeral debug signer');
assert.match(workflow,/exit 1|false/,'CI has a hard failure path for signing identity mismatch');

console.log('PASS v0.24.3 release chronology and permanent signing contract');
