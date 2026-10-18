const assert=require('assert');
const achievements=require('../app/src/main/assets/achievements-v0341.js');

function catalogue(ekansHoop={}){
  const state={arcade:{ekansHoop:{gamesPlayed:0,wins:0,bestScore:0,bestStreak:0,totalHoops:0,shinyHits:0,...ekansHoop}}};
  return achievements.buildCoreAchievements(()=>state);
}
function byId(rows,id){
  const hit=rows.find(a=>a.id===id);
  assert.ok(hit,`missing achievement ${id}`);
  return hit;
}
function expectProgress(a,value,target){assert.deepEqual(a.progress(),[value,target],`${a.id} progress`);}

let rows=catalogue();
const expected=[
  ['ekans_first_ring','First Ring',{coins:150},false],
  ['ekans_hoops_25','Snake Charmer',{coins:350,dust:20},false],
  ['ekans_hoops_100','Hoop Veteran',{coins:900,dust:50},false],
  ['ekans_streak_12','On a Roll',{coins:600,tickets:1},false],
  ['ekans_score_80','Master Hooper',{coins:1000,dust:75},false],
  ['ekans_shiny_1','Shiny Ringer',{coins:750,dust:50},true],
  ['ekans_shiny_5','Shiny Sharpshooter',{coins:2000,tickets:1},true],
];
for(const [id,name,reward,hidden] of expected){
  const a=byId(rows,id);
  assert.equal(a.name,name,id+' name');
  assert.equal(a.category,'arcade',id+' category');
  assert.deepEqual(a.reward,reward,id+' reward');
  assert.equal(!!a.hidden,hidden,id+' hidden');
}
expectProgress(byId(rows,'ekans_first_ring'),0,1);
expectProgress(byId(rows,'ekans_hoops_25'),0,25);
expectProgress(byId(rows,'ekans_hoops_100'),0,100);
expectProgress(byId(rows,'ekans_streak_12'),0,12);
expectProgress(byId(rows,'ekans_score_80'),0,80);
expectProgress(byId(rows,'ekans_shiny_1'),0,1);
expectProgress(byId(rows,'ekans_shiny_5'),0,5);

rows=catalogue({totalHoops:137,bestStreak:14,bestScore:92,shinyHits:7});
expectProgress(byId(rows,'ekans_first_ring'),137,1);
expectProgress(byId(rows,'ekans_hoops_25'),137,25);
expectProgress(byId(rows,'ekans_hoops_100'),137,100);
expectProgress(byId(rows,'ekans_streak_12'),14,12);
expectProgress(byId(rows,'ekans_score_80'),92,80);
expectProgress(byId(rows,'ekans_shiny_1'),7,1);
expectProgress(byId(rows,'ekans_shiny_5'),7,5);

console.log('PASS v0.35.11 Ekans Hoop Hurl achievement catalogue');
