const assert=require('assert');
const path=require('path');
const modPath=path.resolve(__dirname,'../app/src/main/assets/arcade-session.js');
delete require.cache[modPath];
global.LuckyDexArcadePlatform={dailyClaimAvailable:()=>true};
const s=require(modPath);
const expected=['berryPicker','tilePuzzle','voltorb','ballDrop','berry','clefairy','fossil','unown','quiz','dash','ekansHoop','digDigDig'];
for(const id of expected)assert.ok(s.GAME_RULES[id],`${id} rule preserved`);
for(const id of expected){assert.ok(s.GAME_RULES[id].run.trim(),`${id} run`);assert.ok(s.GAME_RULES[id].reward.trim(),`${id} reward`);}
assert.ok(!s.GAME_RULES.ditto && !s.GAME_RULES.safari);
const zero=s.resultModel({title:'Done',metricLabel:'Score',metricValue:0,coinsAwarded:0,itemAwarded:null,bestText:''});
assert.strictEqual(zero.coinsText,'+0 Lucky Coins');
assert.strictEqual(zero.itemText,'');
const item=s.resultModel({title:'Done',metricLabel:'Score',metricValue:1,coinsAwarded:12,itemAwarded:{key:'berry',amount:2},bestText:'NEW BEST'});
assert.strictEqual(item.itemText,'+2 Berry');
assert.strictEqual(item.coinsText,'+12 Lucky Coins');
assert.strictEqual(item.bestText,'NEW BEST');

const detailed=s.resultModel({title:'Dig complete',details:[{title:'Helix Fossil',subtitle:'New museum exhibit',kind:'museum'},{title:'Nugget',subtitle:'Sold · +100 coins',kind:'coins'}]});
assert.deepStrictEqual(detailed.details,[{title:'Helix Fossil',subtitle:'New museum exhibit',kind:'museum'},{title:'Nugget',subtitle:'Sold · +100 coins',kind:'coins'}]);
const sanitized=s.resultModel({details:[null,{title:'X'},'bad']});assert.deepStrictEqual(sanitized.details,[{title:'X',subtitle:'',kind:'find'}]);
assert.deepStrictEqual(zero.details,[],'legacy result models remain detail-free');

const guard=s.createCompletionGuard();
let calls=0;
assert.strictEqual(guard(()=>{calls++;}),true);
assert.strictEqual(guard(()=>{calls++;}),false);
assert.strictEqual(calls,1);
console.log('PASS v0.18 session rules/result model/completion guard');
