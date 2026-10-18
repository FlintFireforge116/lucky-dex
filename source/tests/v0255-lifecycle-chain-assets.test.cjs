const assert=require('assert');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

// 1) Android/background lifecycle: hiding the app must not navigate out of a live minigame.
const arcade=read('app/src/main/assets/arcade-world.js');
const suspend=arcade.match(/function suspend\(\)\{([^}]*)\}/)?.[1]||'';
assert(suspend,'Arcade suspend() must exist');
assert(!/backFromGame\s*\(/.test(suspend),'background suspend must not exit the active minigame');
assert(!/cleanup\s*\(/.test(suspend),'background suspend must not tear down the active minigame');

// 2) Wild field chain is durable state, grows on captures/faints, and breaks only on flee/loss.
const modelCode=read('app/src/main/assets/adventure/adventure-model.js');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(modelCode,sandbox);
const M=sandbox.LuckyDexAdventureModel||sandbox.window.LuckyDexAdventureModel;
assert(M,'Adventure model must load');
const save={adventureV2:{schema:1,destinations:{meadow:{encounters:0,shiny:0,clears:0,seen:{},caught:{},rare:{},boss:false,chain:7}},activeRoam:null,activeExpedition:null,lastDestination:'meadow'}};
const v2=M.ensureState(save);
assert.equal(v2.destinations.meadow.chain,7,'saved chain survives migration/navigation');
assert.equal(M.updateFieldChain(v2,'meadow','capture'),8,'capture extends chain');
assert.equal(v2.destinations.meadow.chain,8);
v2.destinations.meadow.chain=5;
assert.equal(M.updateFieldChain(v2,'meadow','victory'),6,'fainting a wild Pokémon extends the chain');
assert.equal(v2.destinations.meadow.chain,6);
for(const kind of ['fled','loss']){
  v2.destinations.meadow.chain=5;
  assert.equal(M.updateFieldChain(v2,'meadow',kind),0,`${kind} breaks chain`);
  assert.equal(v2.destinations.meadow.chain,0);
}
v2.destinations.meadow.chain=6;
assert.equal(M.updateFieldChain(v2,'meadow','item'),6,'non-battle navigation/events do not break chain');

const controller=read('app/src/main/assets/adventure/adventure-wild-hunt.js');
assert(/chain:M\.fieldChain\(v2,destination\)/.test(controller),'new roam sessions must resume the destination field chain');
assert(/M\.updateFieldChain\(v2,destination,kind\)/.test(controller),'battle terminal results must update the durable field chain');

// 3) Remaining simplified archaeology sprites must be replaced, not merely present.
const itemDir=path.join(root,'app/src/main/assets/arcade/fossil-museum-v0255/items');
const expectedHashes={
  'comet-shard':'8bf51580cbbef6d562ef82110d9637587a75c7bf56ebc4b1aae53196e37416b2',
  'relic-copper':'232df69f5e1c448047af467a228f771b84649d5c8279102d249b562ae525c664',
  'relic-silver':'4c8cfeacf356e34cb39af1423c9b53e5a5dfb6d4d7b5748f8152e8236d2b6163',
  'relic-gold':'f9c96d0802a7c5b2e19a458e3013468a63d5d299ae5b84a9d322e2ff731a3e2d',
  'relic-vase':'37410b47294fd839c15122d6b15f826b88342757a5f3206ec8394190c9b3ed67',
  'relic-band':'02763b1055bc993c1e709ac7823bd159e4d3cebc6f2d6de9b68db405b8b0e9ba',
  'relic-statue':'27a9b9a6db41ee96a7d3fb8b6c5a29d10b473477a5b7e4fdfb9ebf0a6d7a0b92',
  'relic-crown':'dc5c2e2ed06f68f4e3cb3a1bdfb343689c3504e51ecc46d748289e66364db30a'
};
const required=Object.keys(expectedHashes);
for(const id of required){
  const p=path.join(itemDir,id+'.png');
  assert(fs.existsSync(p),`${id} authentic v0.25.5 asset must exist`);
  const bytes=fs.readFileSync(p);
  assert(bytes.length>100,`${id} asset must contain image data`);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expectedHashes[id],`${id} must be the pinned authentic item sprite`);
  const old=path.join(root,'app/src/main/assets/arcade/fossil-museum-v0254/items',id+'.png');
  if(fs.existsSync(old))assert.notEqual(crypto.createHash('sha256').update(bytes).digest('hex'),crypto.createHash('sha256').update(fs.readFileSync(old)).digest('hex'),`${id} must not reuse the v0.25.4 stand-in`);
}

console.log('v0.25.5 lifecycle, field-chain and archaeology asset contract passed');
