const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.join(__dirname,'..');
const ASSETS=path.join(ROOT,'app','src','main','assets');
const read=name=>fs.readFileSync(path.join(ASSETS,name),'utf8');
const core=require(path.join(ASSETS,'arcade-gutsy-golbat-core.js'));

test('Gutsy Golbat offers cave-dwelling Flying-type choices',()=>{
  const dexes=core.CAVE_FLIERS.map(p=>p.dex);
  assert.deepEqual(dexes,[41,42,169,527,528,714,715,207,472]);
  assert.equal(new Set(dexes).size,dexes.length);
  assert.equal(core.caveFlier(714).name,'Noibat');
});

test('chosen flyer becomes YOU and all three COM racers use different flyers',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0,playerDex:714});
  assert.equal(run.players[0].dex,714);
  assert.equal(run.players[0].species,'Noibat');
  const cpuDexes=run.players.slice(1).map(p=>p.dex);
  assert.equal(new Set(cpuDexes).size,3);
  assert.ok(cpuDexes.every(dex=>dex!==714));
});

test('player left-right steering is fast and responsive',()=>{
  const run=core.createRun({difficulty:'normal',rng:()=>0.5,goldenHeartRate:0});
  run.entities=[];
  run.players.slice(1).forEach((cpu,i)=>{cpu.x=850;cpu.y=90+i*170;cpu.aiThinkMs=999999;cpu.aiCrossCutMs=999999;cpu.aiJukeMs=999999;cpu.aiTarget={x:850,y:cpu.y};});
  const start=run.players[0].x;
  core.stepRun(run,250,{right:true,left:false});
  assert.ok(run.players[0].x-start>=90,`expected brisk right movement, got ${run.players[0].x-start}`);
  const rightVx=run.players[0].vx;
  assert.ok(rightVx>=350,`expected strong right velocity, got ${rightVx}`);
  core.stepRun(run,250,{left:true,right:false});
  assert.ok(run.players[0].vx<0,'opposite input should reverse direction promptly');
});

test('Gutsy ready screen includes flyer picker and arena width is locked',()=>{
  const html=read('index.html');
  const css=read('arcade-gutsy-golbat.css');
  const js=read('arcade-gutsy-golbat.js');
  assert.ok((html.match(/data-gutsy-pokemon=/g)||[]).length>=9);
  assert.match(html,/data-gutsy-pokemon="714"/);
  assert.match(js,/function\s+selectPokemon\s*\(/);
  assert.match(js,/playerDex/);
  assert.match(css,/\.gutsy-stage\{[^}]*width:100%/s);
  assert.match(css,/\.gutsy-arena\{[^}]*width:100%/s);
  assert.match(css,/\.gutsy-bat\.is-you::after/);
});
