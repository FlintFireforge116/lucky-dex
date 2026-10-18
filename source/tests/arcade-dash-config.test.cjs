const assert=require('assert');
const path=require('path');
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-dash-config.js');
delete require.cache[modPath];
const c=require(modPath);

assert.deepStrictEqual(c.TYPE_ORDER,['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']);
assert.deepStrictEqual(Object.fromEntries(Object.entries(c.DIFFICULTIES).map(([k,v])=>[k,[v.minSpeed,v.maxSpeed]])),{easy:[20,65],normal:[55,100],hard:[90,135],expert:[100,180]});
for(const [speed,key] of [[20,'easy'],[65,'easy'],[55,'normal'],[100,'normal'],[90,'hard'],[135,'hard'],[100,'expert'],[180,'expert']])assert.strictEqual(c.difficultyFit(speed,key),'within',`${speed} should be within ${key}`);
assert.strictEqual(c.difficultyFit(19,'easy'),'below');
assert.strictEqual(c.difficultyFit(66,'easy'),'above');
assert.strictEqual(c.recommendedDifficulty(30),'easy');
assert.strictEqual(c.recommendedDifficulty(90),'normal','overlap midpoint tie chooses easier band');
assert.strictEqual(c.recommendedDifficulty(150),'expert');
assert.strictEqual(c.recommendedDifficulty(5),'easy');
assert.strictEqual(c.recommendedDifficulty(220),'expert');
const rewards={easy:[120,80,55,35,25,20],normal:[150,100,70,45,30,25],hard:[180,120,85,55,40,30],expert:[240,160,110,70,50,40]};
for(const [key,values] of Object.entries(rewards))for(let place=1;place<=6;place++){
  assert.strictEqual(c.quickReward(place,key),values[place-1]);
  assert.strictEqual(c.leagueReward(place,key),values[place-1]*3);
}
assert.strictEqual(c.quickReward(7,'easy'),0);
assert.strictEqual(c.leagueReward(1,'bogus'),0);
assert.strictEqual(Object.keys(c.LEAGUE_THEMES).length,18);
const refs=new Set();
for(const type of c.TYPE_ORDER){
  const t=c.themeFor(type);
  assert.ok(t&&t.label&&t.surface&&t.palette&&t.skins,`theme ${type}`);
  for(const k of ['rock','mud','speed-pad','stamina-pickup'])assert.ok(t.skins[k],`${type} skin ${k}`);
  refs.add(JSON.stringify(t));
}
assert.strictEqual(refs.size,18,'all 18 themes are distinct records');
assert.strictEqual(c.themeFor('unknown').label,c.LEAGUE_THEMES.normal.label);
for(const [key,d] of Object.entries(c.DIFFICULTIES))for(const k of ['reaction','avoidance','boostSeeking','sprintAggression','mistake','conserveAt'])assert.strictEqual(typeof d.ai[k],'number',`${key} ${k}`);
console.log('PASS Dash v2 difficulty, reward, recommendation and theme policy');
