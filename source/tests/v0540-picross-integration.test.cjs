const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=f=>fs.readFileSync(path.join(ASSETS,f),'utf8');

test('Pokémon Picross is a dedicated Arcade venue and loads its player assets',()=>{
  const world=read('arcade-world.js'),html=read('index.html');
  assert.match(world,/id:"picrossPlaza"/);
  assert.match(world,/games:\['picross'\]/);
  assert.match(world,/picross:'Pokémon Picross'/);
  assert.match(world,/picross:\(\)=>window\.LuckyDexPicross/);
  assert.match(html,/id="picrossGame"/);
  assert.match(html,/arcade-picross-data\.js/);
  assert.match(html,/arcade-picross-core\.js/);
  assert.match(html,/arcade-picross\.js/);
  assert.match(html,/arcade-picross\.css/);
});

test('Picross dataset contains 31 areas and exactly 312 selectable stages without the two unused placeholders',()=>{
  const data=require(path.join(ASSETS,'arcade-picross-data.cjs'));
  assert.equal(data.areas.length,31);
  const slots=data.areas.flatMap(a=>a.slots);
  assert.equal(slots.length,312);
  assert.equal(new Set(slots.map(s=>s.resource_id)).size,312);
  assert.equal(slots.some(s=>['P_169','P_171'].includes(s.resource_id)),false);
  assert.equal(data.puzzles.filter(p=>slots.some(s=>s.resource_id===p.resource_id)).length,312);
});

test('Picross keeps persistent completion records, Arcade records, and a full achievement set',()=>{
  const platform=read('arcade-platform.js'),records=read('arcade-records.js'),ach=read('achievements-v0341.js');
  assert.match(platform,/picross:\{completed:\{\},bestTimesMs:\{\},totalClears:0,noMistakeClears:0\}/);
  assert.match(records,/SUPPORTED_GAME_IDS=.*'picross'/s);
  assert.match(records,/picross:a=>/);
  assert.match(ach,/picross_first_clear/);
  assert.match(ach,/picross_area_clear/);
  assert.match(ach,/picross_100/);
  assert.match(ach,/picross_all_312/);
  assert.match(ach,/picross_errorless_25/);
});

test('Picross UI is touch-first with area select, level select, fill/X tools, undo and reset',()=>{
  const html=read('index.html'),js=read('arcade-picross.js'),css=read('arcade-picross.css');
  assert.match(html,/id="picrossAreaView"/);
  assert.match(html,/id="picrossLevelView"/);
  assert.match(html,/id="picrossPuzzleView"/);
  assert.match(html,/data-picross-tool="fill"/);
  assert.match(html,/data-picross-tool="x"/);
  assert.match(html,/id="picrossUndo"/);
  assert.match(html,/id="picrossReset"/);
  assert.match(js,/pointerdown/);
  assert.match(js,/pointermove/);
  assert.match(css,/touch-action:none/);
});

test('Picross bundles only converted puzzle data, not the 3DS ROM',()=>{
  const js=path.join(ASSETS,'arcade-picross-data.js');
  assert.ok(fs.statSync(js).size<2*1024*1024);
  const forbidden=fs.readdirSync(ASSETS).filter(name=>/\.(3ds|cia|rar)$/i.test(name));
  assert.deepEqual(forbidden,[]);
});

test('Picross completion lets the player view the solved picture and crosses individual resolved clues',()=>{
  const js=read('arcade-picross.js'),css=read('arcade-picross.css');
  assert.match(js,/VIEW PICTURE/);
  assert.match(js,/resolvedCluesForLine/);
  assert.match(js,/is-resolved/);
  assert.match(css,/\.picross-row-clue span\.is-resolved/);
  assert.match(css,/text-decoration:\s*line-through/);
});
