const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');

const godPath=path.join(root,'app/src/main/assets/god-pack-v0291.js');
assert.ok(fs.existsSync(godPath),'v0.29.1 must ship the isolated God Pack policy module');
const god=require(godPath);

assert.strictEqual(god.PRODUCTION_DENOMINATOR,1000,'production God Pack odds must be 1/1000');
assert.strictEqual(god.FORCE_TEST_GOD_PACK,false,'God Pack validation override must be disabled in production builds');
assert.strictEqual(god.shouldRoll(()=>0.999999,true),true,'explicit validation override can still force a God Pack when deliberately requested');
assert.strictEqual(god.shouldRoll(()=>0.0009,false),true,'production roll below 1/1000 must trigger');
assert.strictEqual(god.shouldRoll(()=>0.001,false),false,'production roll at/above 1/1000 must not trigger');

const tier=c=>c.tier;
const modern=[0,1,2,3,4,4,4,5,5,6,6,6].map((t,i)=>({id:String(i),tier:t}));
const modernPlan=god.targetPlan(modern,10,tier);
assert.strictEqual(modernPlan.length,10,'God Pack target plan must match physical pack size');
assert.ok(modernPlan.every(t=>t>=4),'modern God Packs must contain only top-end tier 4+ targets');
assert.ok(modernPlan.filter(t=>t===6).length>=2,'modern God Packs must guarantee multiple highest-tier targets when available');

const classic=[0,0,1,1,2,2,2].map((t,i)=>({id:String(i),tier:t}));
const classicPlan=god.targetPlan(classic,6,tier);
assert.deepStrictEqual([...new Set(classicPlan)],[2],'classic sets whose ceiling is Rare/Holo must make every God Pack slot hit that ceiling');

const app=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
const flow=fs.readFileSync(path.join(root,'app/src/main/assets/pack-flow-v0165.js'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/god-pack-v0291.css'),'utf8');

assert.match(html,/god-pack-v0291\.css/,'God Pack spectacle stylesheet must be loaded');
assert.match(html,/god-pack-v0291\.js/,'God Pack policy module must be loaded');
assert.match(flow,/shouldRoll\(/,'normal pack preparation must roll God Pack before building cards');
assert.match(flow,/!godPack\s*&&\s*Math\.random\(\)\s*<\s*1\/500/,'Lucky Pack must only roll when God Pack did not trigger and use 1/500 odds');
assert.match(flow,/preparedPack=\{set,source,cards,luckyPack,godPack,/,'God Pack state must persist through the full reveal flow');
assert.match(flow,/godPack:false/,'stored\/excavated booster opening must explicitly opt out of God Pack conversion');
assert.match(flow,/playGodPackIntroV0291/,'tearing a God Pack must trigger a dedicated full-screen intro');
assert.match(flow,/GOD PACK COMPLETE/,'God Pack summary must have dedicated celebration copy');
assert.match(flow,/summaryCount=pack\.godPack\?`\$\{pack\.cards\.length\} hits`:fixedHalfDeck\?'30-card Half Deck':`\$\{pack\.cards\.length\} cards`/,'normal pack summaries must keep the existing cards label while fixed Half Decks get product copy');
assert.match(app,/godPacks:0/,'save defaults must persist a God Pack count');
assert.match(app,/preparedPack\.godPack[^\n]+rareHits\.unshift/,'committing a God Pack must record a rare-hit event');
assert.match(app,/\['God packs',state\.stats\.godPacks\|\|0\]/,'profile stats must show lifetime God Packs');
assert.match(app,/buildBalancedPack\(set,source,luckyPack=false,signal=null,godPack=false\)/,'balanced pack builder must accept God Pack mode');
assert.match(app,/buildOfflinePackV13\(set,source,luckyPack=false,godPack=false\)/,'offline cached packs must support the same God Pack card policy');
assert.match(css,/god-pack-active/,'God Pack visuals must remain charged through card reveals');
assert.match(css,/god-pack-intro/,'God Pack must have a dedicated full-screen intro treatment');

console.log('God Pack policy, generation, persistence and spectacle contract verified');
