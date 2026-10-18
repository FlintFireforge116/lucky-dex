const fs=require('fs'),assert=require('assert');
const core=require('../app/src/main/assets/dust-exchange-core.js');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const app=fs.readFileSync('app/src/main/assets/app-v0167.js','utf8');
const css=fs.readFileSync('app/src/main/assets/trade-browser-v0169.css','utf8');

assert.match(html,/id="dustRarityFilter"[^>]*class="[^"]*dust-rarity-options/,'rarity filter should be a multi-choice control rather than a single select');
assert.doesNotMatch(html,/<select id="dustRarityFilter"/,'rarity filter must no longer be a single dropdown');
assert.match(app,/function dustRarityOptions\(/,'runtime should render the rarity choices');
assert.match(app,/rarities:/,'filter state should carry multiple rarities');
assert.match(app,/rarityTier\(/,'rarity choices should be ordered using the app rarity tier rather than alphabetically');
assert.match(css,/\.dust-rarity-options/,'rarity multi-choice needs dedicated styling');

const cards=[
 {id:'a',name:'A',count:4,rarity:'Common',value:10},
 {id:'b',name:'B',count:4,rarity:'Rare',value:20},
 {id:'c',name:'C',count:4,rarity:'Ultra Rare',value:50}
];
const hooks={rarityFor:c=>c.rarity,valueFor:c=>c.value,setFor:()=>'',isProtected:()=>false};
const batch=core.buildBatch(cards,{rarities:['Common','Ultra Rare']},1,hooks);
assert.deepEqual(batch.rows.map(r=>r.id),['a','c'],'multi-rarity filter should match any selected rarity');
assert.deepEqual(batch.filters.rarities,['Common','Ultra Rare'],'confirmed snapshot should preserve selected rarities');
const legacy=core.buildBatch(cards,{rarity:'Rare'},1,hooks);
assert.deepEqual(legacy.rows.map(r=>r.id),['b'],'legacy single-rarity callers should remain compatible');

console.log('PASS v0.55.6 Dust rarity multi-select contract');
