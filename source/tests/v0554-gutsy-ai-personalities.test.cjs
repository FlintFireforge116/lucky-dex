const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const core=require(path.join(__dirname,'..','app','src','main','assets','arcade-gutsy-golbat-core.js'));

function seeded(seed=1){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}

function roleOrder(seed){
  const run=core.createRun({difficulty:'normal',rng:seeded(seed),goldenHeartRate:0});
  return run.players.slice(1).map(p=>p.aiPersonality);
}

function isolated(role,difficulty='normal',rivalX=800){
  const run=core.createRun({difficulty,rng:seeded(91),goldenHeartRate:0});
  run.entities=[];
  const p=run.players[1];
  p.aiPersonality=role;
  p.x=500;p.y=160;p.vx=0;p.vy=0;p.aiThinkMs=0;p.aiTarget=null;p.aiCrossCutMs=0;p.aiJukeMs=999999;
  const rival=run.players[0];
  rival.x=rivalX;rival.y=160;rival.vx=0;rival.vy=0;rival.hearts=20;
  run.players[2].x=150;run.players[2].y=390;run.players[2].aiThinkMs=999999;run.players[2].aiTarget={x:150,y:390};run.players[2].aiCrossCutMs=999999;
  run.players[3].x=850;run.players[3].y=470;run.players[3].aiThinkMs=999999;run.players[3].aiTarget={x:850,y:470};run.players[3].aiCrossCutMs=999999;
  return {run,p};
}

test('every Gutsy race has one backmarker, one front-runner and one brawler',()=>{
  assert.ok(core.AI_PERSONALITIES,'personality catalogue should be exported');
  for(let seed=1;seed<=8;seed++){
    const roles=roleOrder(seed).slice().sort();
    assert.deepEqual(roles,['backmarker','brawler','front-runner']);
  }
});

test('personality assignment is shuffled between COM slots instead of fixing one role to COM 1/2/3',()=>{
  const permutations=new Set();
  for(let seed=1;seed<=12;seed++)permutations.add(roleOrder(seed).join('|'));
  assert.ok(permutations.size>=3,`expected several COM-role permutations, got ${[...permutations].join(', ')}`);
});

test('backmarker prefers the rear while front-runner pushes toward the front',()=>{
  const back=isolated('backmarker','normal');
  const front=isolated('front-runner','normal');
  for(let i=0;i<14;i++){core.stepRun(back.run,50,{});core.stepRun(front.run,50,{});}
  assert.ok(back.p.x<430,`backmarker should retreat into the rear half; x=${back.p.x}`);
  assert.ok(front.p.x>570,`front-runner should push into the forward half; x=${front.p.x}`);
});

test('brawler personality can still choose racer contact without a fixed front-running lane',()=>{
  assert.equal(typeof core.chooseBrawlerIntent,'function');
  const {run,p}=isolated('brawler','hard',260);
  let values=[0.05,0.05];
  run.rng=()=>values.length?values.shift():0.5;
  const intent=core.chooseBrawlerIntent(run,p);
  assert.equal(intent.kind,'racer');
  assert.equal(intent.targetIndex,0);
});

test('the same AI personality is more capable on Hard than Easy',()=>{
  const easy=isolated('front-runner','easy');
  const hard=isolated('front-runner','hard');
  core.stepRun(easy.run,120,{});
  core.stepRun(hard.run,120,{});
  assert.ok(Math.abs(hard.p.vx)>Math.abs(easy.p.vx)*1.2,`hard AI should steer more decisively; easy=${easy.p.vx}, hard=${hard.p.vx}`);
});
