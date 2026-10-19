const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');

function extractFunction(name){
  const marker=`function ${name}(`;
  const start=source.indexOf(marker);
  assert.ok(start>=0,`${name} must exist`);
  const brace=source.indexOf('{',start);
  let depth=0, quote=null, escape=false;
  for(let i=brace;i<source.length;i++){
    const ch=source[i];
    if(quote){if(escape){escape=false;continue;}if(ch==='\\'){escape=true;continue;}if(ch===quote)quote=null;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='{')depth++;
    else if(ch==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error(`Could not extract ${name}`);
}

const blocks=[];
for(const name of ['rebuildableStorageKeys','purgeRebuildableStorage','persistLuckyDexSave','save']){
  if(source.includes(`function ${name}(`))blocks.push(extractFunction(name));
}
assert.ok(blocks.some(x=>x.startsWith('function save(')),'save must be extracted');

const data=new Map([
  ['luckyDexSave','{"old":true}'],
  ['luckyDexPackCacheV13','X'.repeat(5000)],
  ['luckyDexPtcgCardsV151:sv1','Y'.repeat(5000)],
  ['importantUserSetting','keep-me']
]);
let quotaBlocked=true;
const localStorage={
  get length(){return data.size;},
  key(i){return [...data.keys()][i]??null;},
  getItem(k){return data.has(k)?data.get(k):null;},
  removeItem(k){data.delete(k);if(k==='luckyDexPackCacheV13'||String(k).startsWith('luckyDexPtcgCardsV151:'))quotaBlocked=false;},
  setItem(k,v){
    if(k==='luckyDexSave'&&quotaBlocked){const err=new Error('Quota exceeded');err.name='QuotaExceededError';throw err;}
    data.set(k,String(v));
  }
};

let hudRenders=0;
const context={
  window:{LuckyDexProgression:{ensureSave(){} }},
  state:{profile:{},daily:{},saveVersion:7},
  resetDaily(){},
  localStorage,
  renderGlobalHud(){hudRenders++;},
  console:{warn(){},error(){},log(){}},
  showToast(){},
  JSON,
  Object,
  Array,
  String,
  Number,
  Date,
  Math
};
context.window.localStorage=localStorage;
vm.createContext(context);
vm.runInContext(`${blocks.join('\n')}\nthis.save=save;`,context);

assert.doesNotThrow(()=>context.save(),'a cache quota failure must not abort the caller');
assert.match(data.get('luckyDexSave')||'',/"saveVersion":7/,'the real save must be retried after rebuildable caches are evicted');
assert.equal(data.get('importantUserSetting'),'keep-me','unrelated user settings must not be evicted');
assert.equal(hudRenders,1,'HUD refresh should still happen after storage recovery');
context.resetDaily=()=>{throw new Error('daily maintenance failed');};
assert.doesNotThrow(()=>context.save(),'secondary save preparation failures must not abort the feature that called save');
assert.equal(hudRenders,2,'HUD refresh should still run when save preparation fails');
console.log('save-storage-recovery: ok');
