const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('path');
const root=path.resolve(__dirname,'..');
const corePath=path.join(root,'app/src/main/assets/arcade-goldenrod-core.js');
const statePath=path.join(root,'app/src/main/assets/arcade-goldenrod-state.js');
function fresh(){
  global.LuckyDexGoldenrodCore=require(corePath);
  delete require.cache[require.resolve(statePath)];
  return require(statePath);
}

test('fresh Goldenrod state starts each built event in Rookie with Type Cups locked',()=>{
  const S=fresh(),out=S.defaultGoldenrodState();
  assert.equal(out.version,1);
  assert.deepEqual(Object.keys(out.events),['dash','powerTrial','impactTrial','targetRange','elementalGauntlet','enduranceExpedition']);
  for(const id of Object.keys(out.events)){
    assert.equal(out.events[id].unlockedDivision,'rookie');
    assert.equal(out.events[id].typeCupsUnlocked,false);
    assert.deepEqual(out.events[id].divisionTrophies,{});
  }
});

test('legacy Dash type leagues migrate to stat divisions without deleting legacy data',()=>{
  const S=fresh();
  const legacy={leagueRecords:{
    fire:{easy:{trophy:'bronze',bestPoints:15,bestTotalTimeMs:30000}},
    water:{normal:{trophy:'silver',bestPoints:20,bestTotalTimeMs:29000}},
    steel:{hard:{trophy:'gold',bestPoints:25,bestTotalTimeMs:28000}},
    ghost:{expert:{trophy:'???',bestPoints:Infinity,bestTotalTimeMs:NaN}},
    fairy:{unknown:{trophy:'gold'}}
  }};
  const out=S.normalizeGoldenrodState(null,{legacyDash:legacy});
  assert.equal(out.events.dash.typeTrophies.fire.poke,'bronze');
  assert.equal(out.events.dash.typeTrophies.water.great,'silver');
  assert.equal(out.events.dash.typeTrophies.steel.ultra,'gold');
  assert.equal(out.events.dash.unlockedDivision,'master');
  assert.equal(out.events.dash.typeCupsUnlocked,true);
  assert.equal(out.events.dash.typeTrophies.ghost?.master,undefined);
  assert.equal(out.events.dash.typeTrophies.fairy,undefined);
  assert.equal(legacy.leagueRecords.fire.easy.trophy,'bronze');
});

test('normalization preserves future keys and never downgrades an existing trophy',()=>{
  const S=fresh();
  const input={version:1,futureRoot:{keep:true},events:{dash:{futureEvent:'yes',unlockedDivision:'ultra',typeCupsUnlocked:true,divisionTrophies:{great:'gold'},typeTrophies:{fire:{poke:'gold'}}}}};
  const legacy={leagueRecords:{fire:{easy:{trophy:'bronze'}}}};
  const out=S.normalizeGoldenrodState(input,{legacyDash:legacy});
  assert.deepEqual(out.futureRoot,{keep:true});
  assert.equal(out.events.dash.futureEvent,'yes');
  assert.equal(out.events.dash.divisionTrophies.great,'gold');
  assert.equal(out.events.dash.typeTrophies.fire.poke,'gold');
  assert.equal(out.events.dash.unlockedDivision,'ultra');
});

test('applyCupProgress unlocks next division on podium, Type Cups on Rookie podium, and Type Cups do not advance divisions',()=>{
  const S=fresh();
  const event=S.defaultGoldenrodState().events.powerTrial;
  let r=S.applyCupProgress(event,{mode:'division',divisionId:'rookie',finalPlace:3,trophy:'bronze'});
  assert.equal(event.unlockedDivision,'poke');
  assert.equal(event.typeCupsUnlocked,true);
  assert.equal(event.divisionTrophies.rookie,'bronze');
  assert.equal(r.unlockedDivision,'poke');
  S.applyCupProgress(event,{mode:'division',divisionId:'rookie',finalPlace:1,trophy:'gold'});
  assert.equal(event.divisionTrophies.rookie,'gold');
  S.applyCupProgress(event,{mode:'type',divisionId:'poke',type:'fire',finalPlace:1,trophy:'gold'});
  assert.equal(event.unlockedDivision,'poke');
  assert.equal(event.typeTrophies.fire.poke,'gold');
});
