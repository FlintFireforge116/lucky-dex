'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'../..');
const ASSETS=path.join(ROOT,'source/app/src/main/assets');
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'source/scripts/delta-reign-card-art-manifest.json'),'utf8'));
const fullIndex=JSON.parse(fs.readFileSync(path.join(ROOT,'card-art-index.json'),'utf8'));
function createOfflineBrowser(){
  const win={};
  const context={window:win,navigator:{onLine:false},localStorage:{getItem:()=>null,setItem:()=>{}},console,Promise,Map,Set,Object,Array,Number,String,RegExp,JSON,Date};
  vm.runInNewContext(fs.readFileSync(path.join(ASSETS,'delta-reign-card-art-v069154.js'),'utf8'),context,{filename:'delta-reign-card-art.js'});
  vm.runInNewContext(fs.readFileSync(path.join(ASSETS,'card-art-library-v0165.js'),'utf8'),context,{filename:'card-art-library-v0165.js'});
  return win;
}
test('Delta Reign list has 141 distinct English numbered scans and verified source paths',()=>{
  assert.equal(manifest.cards.length,141);
  for(let i=1;i<=141;i++){
    const c=manifest.cards[i-1];
    assert.equal(c.number,i);
    assert.ok(c.name && c.rarity);
    assert.match(c.file,new RegExp(`^me06-${String(i).padStart(3,'0')}_.*\\.webp$`));
    assert.equal(c.source,`https://billsarchive.com/assets/delta-reign/small/${c.file}`);
  }
  assert.equal(new Set(manifest.cards.map(c=>c.file)).size,141);
  assert.deepEqual(manifest.cards.filter(c=>c.number>103).reduce((a,c)=>(a[c.rarity]=(a[c.rarity]||0)+1,a),{}),{'Illustration Rare':14,'Ultra Rare':17,'Special Illustration Rare':6,'Mega Hyper Rare':1});
});
test('Index on GitHub maps all 141 cards to dedicated source assets, with no reprint collisions',()=>{
  const sets=fullIndex.sets.filter(x=>x.k==='me6');assert.equal(sets.length,1);
  const set=sets[0];assert.equal(set.n,'Delta Reign');assert.equal(set.c.length,141);
  for(let i=0;i<141;i++){
    const row=set.c[i],card=manifest.cards[i];
    assert.equal(row[0],`ME6-${String(i+1).padStart(3,'0')}`);
    assert.equal(row[1],String(i+1).padStart(3,'0'));
    assert.equal(row[2],card.name);assert.equal(row[3],card.rarity);
    assert.equal(row[4],`https://raw.githubusercontent.com/FlintFireforge116/lucky-dex/main/source/app/src/main/assets/delta-reign-cards/${card.file}`);
  }
  assert.equal(fullIndex.set_count,fullIndex.sets.length);
  assert.equal(fullIndex.card_count,fullIndex.sets.reduce((sum,s)=>sum+s.c.length,0));
});
test('Offline library knows about Delta Reign even with no cached index or network',async()=>{
  const w=createOfflineBrowser();
  const catalog=await w.LuckyDexCardArt.catalog();
  const delta=catalog.filter(s=>s.name==='Delta Reign');
  assert.equal(delta.length,1);assert.equal(delta[0].id,'library:me6');
  const prepared=await w.LuckyDexCardArt.prepareSet(delta[0]);
  assert.equal(prepared.cards.length,141);
  assert.equal(prepared.cards[0].image,'delta-reign-cards/me06-001_heracross.webp');
  assert.equal(prepared.cards[140].image,'delta-reign-cards/me06-141_mega_rayquaza_ex_mhr.webp');
  assert.equal(await w.LuckyDexCardArt.resolveLocal(prepared.cards[140],prepared),prepared.cards[140].image);
});
test('Old owned Delta Reign cards are repaired without touching other sets or mismatched identities',()=>{
  const w=createOfflineBrowser();
  const cards={one:{id:'ME6-084',name:'Mega Rayquaza ex',localId:'084',setName:'Delta Reign',image:'https://invalid.example/84'},two:{id:'dlr-055',name:'Nidoran F',localId:'055',setId:'DLR',image:''},three:{id:'EX6-084',name:'Mega Rayquaza ex',localId:'084',setName:'FireRed & LeafGreen',image:'keep.png'},four:{id:'ME6-084-wrong',name:'Moltres',localId:'084',setName:'Delta Reign',image:'keep-wrong.png'}};
  assert.equal(w.LuckyDexDeltaReignArtV069154.repairOwned(cards),2);
  assert.equal(cards.one.image,'delta-reign-cards/me06-084_mega_rayquaza_ex.webp');
  assert.equal(cards.two.image,'delta-reign-cards/me06-055_nidoran_f.webp');
  assert.equal(cards.three.image,'keep.png');assert.equal(cards.four.image,'keep-wrong.png');
  assert.equal(w.LuckyDexDeltaReignArtV069154.repairOwned(cards),0);
});
test('Termux downloader covers every source and version markers advance to 0.69.154',()=>{
  const list=fs.readFileSync(path.join(ROOT,'source/scripts/delta-reign-art-download.txt'),'utf8').trim().split('\n');
  assert.equal(list.length,141);
  for(let i=0;i<141;i++)assert.equal(list[i],`${String(i+1).padStart(3,'0')}|${manifest.cards[i].file}`);
  const html=fs.readFileSync(path.join(ASSETS,'index.html'),'utf8');
  assert.ok(html.indexOf('delta-reign-card-art-v069154.js')<html.indexOf('card-art-library-v0165.js'));
  assert.match(html,/id="titleBuildVersion">v0\.69\.154/);assert.match(html,/id="appBuildVersion">LUCKY DEX · v0\.69\.154/);
  const app=fs.readFileSync(path.join(ASSETS,'app-v0167.js'),'utf8');assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.154'/);
  const gradle=fs.readFileSync(path.join(ROOT,'source/app/build.gradle'),'utf8');assert.match(gradle,/versionCode 7134/);assert.match(gradle,/versionName '0\.69\.154'/);
  assert.match(fs.readFileSync(path.join(ROOT,'source/scripts/download-delta-reign-art.sh'),'utf8'),/Verified all 141/);
});
