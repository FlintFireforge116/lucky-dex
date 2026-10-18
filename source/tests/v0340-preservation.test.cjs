'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),baseline=require('./v0340-preservation-baseline.json');
const laterIntentionalChanges=new Set([
  'app/src/main/assets/collection-trade-v0167.css',
  'app/src/main/assets/pack-opening-v0160.css',
  'app/src/main/assets/pack-opening-v0160.js',
  'app/src/main/assets/pack-flow-v0165.js',
  'app/src/main/assets/app-v0167.js',
  'app/src/main/assets/trade-v0163.js',
  'app/src/main/assets/trade-browser-v0169.css',
  'app/src/main/assets/arcade-ball-drop.js',
  'app/src/main/assets/arcade.css',
  'app/src/main/assets/collection-browser-v0280.js',
  // Adventure 3.0 deliberately replaces these behaviors. Current v0.39.1
  // protection is separately enforced by adventure3-preservation and shared-functions.
  'app/src/main/assets/adventure/adventure-model.js',
  'app/src/main/assets/adventure/adventure-move-data.js',
  'app/src/main/assets/adventure/adventure-battle.js',
  'app/src/main/assets/adventure/adventure-battle.css',
  'app/src/main/assets/adventure/adventure-controller.js',
  'app/src/main/assets/adventure/adventure-regional-engine.js',
  'app/src/main/assets/adventure/adventure-regional-ui.js',
]);
for(const [name,expected] of Object.entries(baseline.files)){
  if(laterIntentionalChanges.has(name))continue;
  const file=path.join(root,name);assert(fs.existsSync(file),`preserved v0.33.1 file exists: ${name}`);
  let bytes=fs.readFileSync(file);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected,`exact supplied v0.33.1 preservation: ${name}`);
}
const verified=Object.keys(baseline.files).filter(name=>!laterIntentionalChanges.has(name)).length;
console.log(`PASS ${verified} supplied v0.33.1 protected files preserved; later intentional Collection / pack-engine changes excluded`);
