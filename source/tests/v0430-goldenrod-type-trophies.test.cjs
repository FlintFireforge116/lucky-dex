const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('trophy cabinet renders separate type cup trophy tracks',()=>{
  const src=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-goldenrod.js'),'utf8');
  assert.match(src,/TYPE CUPS/);
  assert.match(src,/typeTrophies/);
  assert.match(src,/TYPE_ORDER/);
});

test('existing saved Type Cup trophies appear as distinct type/division entries without migration',()=>{
  const corePath=path.join(__dirname,'../app/src/main/assets/arcade-goldenrod-core.js');
  const statePath=path.join(__dirname,'../app/src/main/assets/arcade-goldenrod-state.js');
  const uiPath=path.join(__dirname,'../app/src/main/assets/arcade-goldenrod.js');
  for(const p of [corePath,statePath,uiPath])delete require.cache[require.resolve(p)];
  global.LuckyDexGoldenrodCore=require(corePath);global.LuckyDexGoldenrodState=require(statePath);
  global.state={arcade:{goldenrod:{events:{dash:{unlockedDivision:'great',typeCupsUnlocked:true,divisionTrophies:{rookie:'gold'},typeTrophies:{fire:{great:'gold'},water:{great:'silver'}},records:{}}}}}};
  const goldenrod=require(uiPath),markup=goldenrod.renderTrophyCabinet();
  assert.match(markup,/TYPE CUPS/);assert.match(markup,/Fire/);assert.match(markup,/Water/);
  assert.match(markup,/Fire[\s\S]{0,500}GOLD/);assert.match(markup,/Water[\s\S]{0,500}SILVER/);
});

test('Target Range no longer injects the old per-type prop sprite trees',()=>{
  const js=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-target-range.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-target-range.css'),'utf8');
  assert.doesNotMatch(js,/--range-prop/);
  assert.doesNotMatch(css,/var\(--range-prop\)/);
});
