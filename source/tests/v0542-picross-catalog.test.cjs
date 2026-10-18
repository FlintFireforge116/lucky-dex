const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');

test('Picross stage numbers come from the original catalogue rather than physical grid order',()=>{
  const data=require(path.join(ASSETS,'arcade-picross-data.cjs'));
  for(const area of data.areas){
    const actual=(area.slots||[]).map(s=>s.stage_number).sort((a,b)=>a-b);
    const expected=Array.from({length:(area.slots||[]).length},(_,i)=>i+1);
    assert.deepEqual(actual,expected,`Area ${area.area} stage numbers`);
  }
  const area3=data.areas.find(a=>a.area===3);
  const byId=Object.fromEntries(area3.slots.map(s=>[s.resource_id,s.stage_number]));
  assert.deepEqual(byId,{P_294:4,P_233:1,P_226:2,P_190:3,P_304:6,P_276:5});
});

test('Picross Pokémon resources carry the correct English identity including special forms',()=>{
  const data=require(path.join(ASSETS,'arcade-picross-data.cjs'));
  const byId=Object.fromEntries(data.puzzles.map(p=>[p.resource_id,p]));
  assert.equal(byId.P_233.display_name,'Blitzle');
  assert.equal(byId.P_294.display_name,'Klefki');
  assert.equal(byId.P_304.display_name,'Ash-Greninja');
  assert.equal(byId.P_002.display_name,'Venusaur');
  assert.equal(byId.T_001.display_name,'Poké Ball');
});

test('Picross level UI labels stages using stored true stage numbers',()=>{
  const js=fs.readFileSync(path.join(ASSETS,'arcade-picross.js'),'utf8');
  assert.match(js,/slot\.stage_number/);
  assert.doesNotMatch(js,/findIndex\(s=>s\.resource_id===resourceId\)/);
});
