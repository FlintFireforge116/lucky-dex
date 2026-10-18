const assert=require('assert');
const E=require('../app/src/main/assets/adventure/adventure-regional-engine.js');
const P=require('../app/src/main/assets/adventure/adventure-progression.js');
const S=require('../app/src/main/assets/adventure/adventure-species.js');
function fixture(region,badges){
 const save={pokemon:{'4:n':{...S.byId[4],level:30,xp:125,count:3}},team:['4:n'],profile:{coins:4123,tickets:8,dust:99},inventory:{potion:9,pokeball:33},tmInventory:{85:2},stats:{catches:20},cards:{kept:true},settings:{shinyOdds:2048},arcade:{records:{kept:true}},adventureV2:{destinations:{meadow:{chain:17,seen:33,caught:20}},activeExpedition:{id:'old-expedition',phase:'active',unclaimedReward:9999},history:[{id:'historic'}]},adventureRegional:{schema:1,active:{id:'old-regional',region,seed:17,phase:'battle',badges,eliteWins:2,nodes:[{id:'old'}],party:[],loot:{coins:321,exp:789,catches:3,tms:1},rewardClaimed:false},records:{kanto:{clears:4}},last:{region:'kanto',phase:'complete'}}};
 P.ensureSave(save);return save;
}
for(const [region,badges,checkpoint,chapter] of [['kanto',0,'Pallet Town',0],['kanto',1,'Pewter City',1],['johto',3,'Goldenrod City',3],['hoenn',8,'Sootopolis City',8]]){
 const save=fixture(region,badges),preserved=JSON.stringify({pokemon:save.pokemon,team:save.team,profile:save.profile,inventory:save.inventory,tmInventory:save.tmInventory,cards:save.cards,settings:save.settings,arcade:save.arcade,destinations:save.adventureV2.destinations,history:save.adventureV2.history,stats:save.stats});
 const a=E.ensureSave(save);assert.equal(a.schema,2,'schema1 run must migrate to persistent journey');
 const j=a.journeys[region];assert.equal(j.badges,badges);assert.equal(j.chapterIndex,chapter);assert.equal(j.checkpoint.name,checkpoint);assert.equal(j.phase,'map');assert.equal(j.battle,null);assert.equal(j.sectionIndex,0);assert.equal(j.eliteWins,0,'old gauntlet restarts safely after eighth badge');assert.equal(j.loot.coins,321,'committed ledger retained without re-award');assert.equal(a.active,j);assert.equal(a.activeRegion,region);assert.equal(save.adventureV2.activeExpedition,null);assert.equal(save.adventureV2.retiredExpedition.id,'old-expedition');
 assert.equal(JSON.stringify({pokemon:save.pokemon,team:save.team,profile:save.profile,inventory:save.inventory,tmInventory:save.tmInventory,cards:save.cards,settings:save.settings,arcade:save.arcade,destinations:save.adventureV2.destinations,history:save.adventureV2.history,stats:save.stats}),preserved,'migration touches no committed reward or unrelated state');
 const migrated=JSON.stringify(save);E.ensureSave(save);assert.equal(JSON.stringify(save),migrated,'migration idempotence');
 const restored=JSON.parse(migrated);E.ensureSave(restored);assert.equal(restored.adventureRegional.active,restored.adventureRegional.journeys[region],'active alias is rebound after serialization');assert.equal(restored.profile.coins,4123);
}
const historic=fixture('kanto',8);historic.adventureRegional.active=null;E.ensureSave(historic);assert.equal(historic.adventureRegional.journeys.kanto,null,'historic clears do not skip reworked journey');assert.equal(historic.adventureRegional.records.kanto.clears,4);
console.log('PASS journey migration checkpoints, independent save preservation, retired Expedition, history and idempotence');
