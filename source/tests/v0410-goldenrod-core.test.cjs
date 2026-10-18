const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('path');
const corePath=path.join(__dirname,'..','app/src/main/assets/arcade-goldenrod-core.js');
function fresh(){delete require.cache[require.resolve(corePath)];return require(corePath);}

function entrants(){return [
  {id:'player',name:'YOU',metric:0},
  {id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'},{id:'d',name:'D'},{id:'e',name:'E'}
];}

test('Goldenrod divisions use exact maximum-stat caps and points',()=>{
  const core=fresh();
  assert.equal(core.isStatEligible(59,'rookie'),true);
  assert.equal(core.isStatEligible(60,'rookie'),false);
  assert.equal(core.isStatEligible(89,'poke'),true);
  assert.equal(core.isStatEligible(90,'poke'),false);
  assert.equal(core.isStatEligible(119,'great'),true);
  assert.equal(core.isStatEligible(120,'great'),false);
  assert.equal(core.isStatEligible(149,'ultra'),true);
  assert.equal(core.isStatEligible(999,'master'),true);
  assert.deepEqual([1,2,3,4,5,6].map(core.pointsForPlace??(p=>core.POINTS_BY_PLACE[p])),[10,6,4,3,2,1]);
  assert.equal(core.nextDivision('rookie').id,'poke');
  assert.equal(core.nextDivision('master'),null);
});

test('cups accept exactly three unique rounds and accumulate standings',()=>{
  const core=fresh();
  const cup=core.createCup({eventId:'powerTrial',mode:'division',divisionId:'great',player:entrants()[0],entrants:entrants().slice(1),seed:7});
  const r1=core.recordRound(cup,{roundId:'r1',results:entrants().map((e,i)=>({id:e.id,place:i+1,metric:100-i}))});
  assert.equal(r1.accepted,true);
  assert.equal(core.recordRound(cup,{roundId:'r1',results:[]}).accepted,false);
  core.recordRound(cup,{roundId:'r2',results:entrants().map((e,i)=>({id:e.id,place:6-i,metric:50+i}))});
  core.recordRound(cup,{roundId:'r3',results:entrants().map((e,i)=>({id:e.id,place:i+1,metric:80-i}))});
  assert.equal(cup.rounds.length,3);
  assert.equal(core.recordRound(cup,{roundId:'r4',results:[]}).accepted,false);
  const s=core.standings(cup);
  assert.equal(s.length,6);
  assert.equal(s.reduce((n,row)=>n+row.points,0),78);
});

test('trophies and seeded tiebreaks are deterministic and honor metric direction',()=>{
  const core=fresh();
  assert.equal(core.trophyForPlace(1),'gold');
  assert.equal(core.trophyForPlace(2),'silver');
  assert.equal(core.trophyForPlace(3),'bronze');
  assert.equal(core.trophyForPlace(4),null);
  const make=direction=>{
    const all=entrants();
    const cup=core.createCup({eventId:'dash',mode:'division',divisionId:'rookie',player:all[0],entrants:[all[1]],seed:123,metricDirection:direction});
    core.recordRound(cup,{roundId:'r1',results:[{id:'player',place:1,metric:100},{id:'a',place:2,metric:90}]});
    core.recordRound(cup,{roundId:'r2',results:[{id:'a',place:1,metric:90},{id:'player',place:2,metric:100}]});
    return core.standings(cup);
  };
  assert.equal(make('higher')[0].id,'player');
  assert.equal(make('lower')[0].id,'a');
  const rng1=core.createSeededRng(99),rng2=core.createSeededRng(99);
  assert.deepEqual([rng1(),rng1(),rng1()],[rng2(),rng2(),rng2()]);
});

test('completion is idempotent and abandonment blocks final completion',()=>{
  const core=fresh();
  const cup=core.createCup({eventId:'impactTrial',mode:'division',divisionId:'rookie',player:entrants()[0],entrants:entrants().slice(1),seed:1});
  let calls=0;
  const first=core.completeCupOnce(cup,()=>({ok:true,n:++calls}));
  const second=core.completeCupOnce(cup,()=>({ok:true,n:++calls}));
  assert.deepEqual(first,{ok:true,n:1});
  assert.deepEqual(second,{ok:true,n:1});
  assert.equal(calls,1);
  const abandoned=core.createCup({eventId:'dash',mode:'division',divisionId:'rookie',player:entrants()[0],entrants:entrants().slice(1),seed:2});
  core.abandonCup(abandoned);
  assert.equal(core.completeCupOnce(abandoned,()=>++calls),null);
  assert.equal(calls,1);
});

test('compressedStat has diminishing returns and stays bounded',()=>{
  const core=fresh();
  const a=core.compressedStat(20),b=core.compressedStat(100),c=core.compressedStat(180),d=core.compressedStat(999);
  assert.equal(a,.55);
  assert.ok(b>a&&c>b);
  assert.equal(c,1);
  assert.equal(d,1);
  assert.ok((c-b)<(b-a));
});
