const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

function mustExist(file){assert.ok(fs.existsSync(path.join(root,file)),`${file} must exist`);}

test('Ice Cream Scoop no longer shows the Pleasant Forest navigation arrows beside the cone',()=>{
  const css=read('arcade-ice-cream-scoop.css');
  assert.match(css,/icecream-arrow-mask/);
  assert.match(css,/pointer-events:\s*none/);
});

test('Dream World exposes Pokemon Seek as its third game',()=>{
  const world=read('arcade-world.js'),index=read('index.html');
  assert.match(world,/games:\['iceCreamScoop','wailordWaterSpout','pokemonSeek'\]/);
  assert.match(world,/pokemonSeek:'Pokémon Seek'/);
  assert.match(world,/pokemonSeek:\(\)=>window\.LuckyDexPokemonSeek/);
  assert.match(index,/id="pokemonSeekGame"/);
  for(const f of ['arcade-pokemon-seek-core.js','arcade-pokemon-seek.js','arcade-pokemon-seek.css'])mustExist(f);
  assert.match(index,/arcade-pokemon-seek-core\.js/);
  assert.match(index,/arcade-pokemon-seek\.js/);
  assert.match(index,/arcade-pokemon-seek\.css/);
});

test('Pokemon Seek preserves normal 90 second Listen Carefully search with local Spooky Manor graph art',()=>{
  const index=read('index.html'),css=read('arcade-pokemon-seek.css'),js=read('arcade-pokemon-seek.js'),core=read('arcade-pokemon-seek-core.js');
  assert.match(index,/id="pokemonSeekListen"/);
  assert.match(index,/id="pokemonSeekSpots"/);
  assert.match(index,/id="pokemonSeekNavigation"/);
  const locations=read('arcade-pokemon-seek-locations.js');
  assert.match(locations,/manor-e/);assert.doesNotMatch(css,/https?:\/\//);
  assert.match(js,/listenHint/);
  assert.match(js,/collectLostItem/);
  assert.match(core,/durationMs:\s*90000/);
  assert.match(core,/foundScore:\s*5000/);
  assert.match(core,/lostItemScore:\s*5000/);
});

test('Pokemon Seek has persistent records, six achievements, results, and a forceable rare Dream Sparkle',()=>{
  const platform=read('arcade-platform.js'),records=read('arcade-records.js'),ach=read('achievements-v0341.js'),app=read('app-v0167.js'),index=read('index.html'),session=read('arcade-session.js'),js=read('arcade-pokemon-seek.js');
  assert.match(platform,/pokemonSeek:\{gamesPlayed:0/);
  assert.match(records,/pokemonSeek/);
  const ids=['pokemonseek_first_find','pokemonseek_lost_item','pokemonseek_fast_find','pokemonseek_hard_clear','secret_pokemonseek_dream_sparkle','secret_pokemonseek_clean_find'];
  for(const id of ids)assert.match(ach,new RegExp(id));
  assert.match(app,/pokemonSeekDreamSparkle:\.02/);
  assert.match(index,/rarePokemonSeekDreamSparkleOddsSelect/);
  assert.match(index,/Dream Sparkle · Pokémon Seek/);
  assert.match(index,/Always · 100%/);
  assert.match(session,/pokemonSeek/);
  assert.match(js,/showResult\?\.\('pokemonSeek'/);
});
