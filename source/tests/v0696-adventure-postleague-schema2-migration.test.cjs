const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
const F=require('../app/src/main/assets/adventure/adventure-location-flow.js');

function legacyCompletedSchema2(){
  return {
    pokemon:{'7:n':{...S.byId[7],level:50,count:1,xp:0}},
    team:['7:n'],
    profile:{coins:35552},inventory:{potion:4,pokeball:12},tmInventory:{},stats:{adventureClears:1},
    adventureV2:{},
    adventureRegional:{
      schema:2,
      activeRegion:'kanto',
      journeys:{
        kanto:{
          id:'kanto-old-complete',region:'kanto',seed:12345,phase:'complete',badges:8,
          rewardClaimed:true,completedAt:1700000000000,
          loot:{coins:5200,exp:900,catches:14,tms:8}
        },
        johto:null,hoenn:null
      },
      active:null,
      records:{kanto:{clears:1}},
      last:{region:'kanto',phase:'complete',rewardClaimed:true}
    }
  };
}

test('repairs a legacy schema-2 completed Kanto journey instead of leaving Adventure blank',()=>{
  const s=legacyCompletedSchema2();
  const before={coins:s.profile.coins,clears:s.stats.adventureClears,records:JSON.stringify(s.adventureRegional.records)};
  const a=E.ensureSave(s),j=a.active;
  assert.ok(j,'completed Kanto journey remains selected');
  assert.equal(j.region,'kanto');
  assert.equal(j.phase,'complete');
  assert.equal(j.rewardClaimed,true);
  assert.equal(j.completedAt,1700000000000);
  assert.ok(Array.isArray(j.nodes)&&j.nodes.length>0,'current authored nodes are restored');
  assert.ok(Array.isArray(j.party),'current party shape is restored');
  assert.doesNotThrow(()=>E.summary(j),'Adventure home summary can render');
  const place=F.describe(j);
  assert.ok(place?.name,'Adventure home can resolve a visible completed-journey location');
  assert.equal(s.profile.coins,before.coins,'repair never re-awards Champion coins');
  assert.equal(s.stats.adventureClears,before.clears,'repair never increments clear count');
  assert.equal(JSON.stringify(s.adventureRegional.records),before.records,'repair never mutates clear records');
});


test('legacy completed schema-2 save with no reward flag is treated as already paid',()=>{
  const s=legacyCompletedSchema2();
  delete s.adventureRegional.journeys.kanto.rewardClaimed;
  const before=s.profile.coins;
  const j=E.ensureSave(s).active;
  assert.equal(j.phase,'complete');
  assert.equal(j.rewardClaimed,true,'completed legacy League clear must never become payable again');
  assert.equal(s.profile.coins,before);
});

test('repair is idempotent after serialization',()=>{
  const s=legacyCompletedSchema2();
  E.ensureSave(s);
  const once=JSON.stringify(s);
  const restored=JSON.parse(once);
  E.ensureSave(restored);
  assert.equal(JSON.stringify(restored),once);
});
