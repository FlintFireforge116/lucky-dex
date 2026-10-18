'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const Rarity=require('../app/src/main/assets/card-rarity-v0253.js');
const Pack=require('../app/src/main/assets/pack-policy-v0343.js');

function loadCardArtLibrary(){
  const code=fs.readFileSync(path.join(root,'app/src/main/assets/card-art-library-v0165.js'),'utf8');
  const context={window:{},globalThis:{},console,navigator:{onLine:false},localStorage:{getItem(){return null},setItem(){}},indexedDB:{open(){throw new Error('unused')}}};
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(code,context,{filename:'card-art-library-v0165.js'});
  return context.window.LuckyDexCardArt;
}

test('physical card library keeps live array identities and supports compact-object compatibility',()=>{
  const lib=loadCardArtLibrary();
  assert.equal(typeof lib?._recordFields,'function','test hook exposes exact card-index decoder');
  const liveA=lib._recordFields(['TK4G-20','20','Gyarados','No Rarity','https://example.test/gyarados-a.png']);
  const liveB=lib._recordFields(['TK4G-20-2','20','Gyarados','No Rarity','https://example.test/gyarados-b.png']);
  assert.equal(liveA.id,'TK4G-20');
  assert.equal(liveB.id,'TK4G-20-2');
  assert.notEqual(liveA.id,liveB.id,'duplicate collector numbers must retain distinct canonical print IDs');

  const row=lib._recordFields({i:'TK4G-017',p:'17',n:'Gyarados',r:'No Rarity',u:'https://example.test/gyarados.png',v:'deck'});
  assert.deepEqual(JSON.parse(JSON.stringify(row)),{
    id:'TK4G-017',number:'17',name:'Gyarados',rarity:'No Rarity',url:'https://example.test/gyarados.png',file:'',variant:'deck'
  });
  const fallback=lib._recordFields({id:'legacy-1',number:'1',name:'Legacy',rarity:'Common',url:'https://example.test/legacy.png'});
  assert.equal(fallback.id,'legacy-1');
  assert.equal(fallback.number,'1');
  assert.equal(fallback.name,'Legacy');
});

test('Dragon Vault uses holo finish without promoting cards 1-20 to rare, and Kyurem 21/20 is secret',()=>{
  const set={id:'dv1',name:'Dragon Vault'};
  const regular={id:'dv1-1',localId:'1',number:'1',name:'Dratini',rarity:'Rare Holo',setId:'dv1',setName:'Dragon Vault'};
  const secret={id:'dv1-21',localId:'21',number:'21',name:'Kyurem',rarity:'Rare Holo',setId:'dv1',setName:'Dragon Vault'};
  assert.equal(Rarity.normalizedPrintedRarity(regular,set),'No Rarity');
  const regClass=Rarity.classify(regular,set);
  assert.equal(regClass.rarityClass,'unknown');
  assert.equal(regClass.finish,'holo');
  assert.equal(Rarity.normalizedPrintedRarity(secret,set),'Secret Rare');
  const secretClass=Rarity.classify(secret,set);
  assert.equal(secretClass.rarityClass,'secret');
  assert.equal(secretClass.finish,'holo');
});

test('Dragon Vault remains a five-card all-holo product and Lucky Pack cannot make its slots impossible',()=>{
  const set={id:'dv1',name:'Dragon Vault',releaseDate:'2012-10-05',cardCount:{total:21}};
  const normal=Pack.slotPlan(set,{source:'tcg',luckyPack:false});
  const lucky=Pack.slotPlan(set,{source:'tcg',luckyPack:true});
  assert.equal(normal.length,5);
  assert.equal(lucky.length,5);
  assert.ok(normal.every(slot=>slot.finish==='holo'));
  assert.ok(lucky.every(slot=>slot.finish==='holo'));
  assert.ok(lucky.every(slot=>slot.allowedClasses.includes('unknown')),'Lucky Pack keeps regular Dragon Vault holo cards eligible');
});


test('Dragon Vault resolves to the audited high-resolution wrapper while retaining the legacy local emergency fallback',()=>{
  const art=require('../app/src/main/assets/booster-art-v0260.js');
  const set={id:'dv1',name:'Dragon Vault'};
  assert.equal(art.directPath(set),'authentic-pack-art/dragon-vault-ray.webp');
  assert.equal(art.localPath(set),'booster-art-v0260/dv1.webp');
  assert.notEqual(art.directPath(set),art.localPath(set),'normal rendering must not upscale the bundled 109x199 thumbnail');
  assert.ok(!/^https?:/i.test(art.directPath(set)),'normal rendering uses a bundled local primary asset');
  const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  assert.match(app,/fallbackArtUrl/,'sealed-pack rendering must retain the bundled local image as a network-failure fallback');
  assert.match(app,/data-booster-fallback/,'saved sealed packs must also fall back to bundled artwork');
});
