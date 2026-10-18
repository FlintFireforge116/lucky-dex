const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('app/src/main/assets/index.html');
const js=read('app/src/main/assets/arcade-dash.js');
const css=read('app/src/main/assets/arcade-dash.css');
for(const id of ['dashModeView','dashDifficultyView','dashLeagueView','dashPickerView','dashStandingsView','dashRaceView','dashQuickBtn','dashLeaguesBtn','dashDifficultyButtons','dashLeagueGrid','dashStartBtn','dashLeftBtn','dashSprintBtn','dashRightBtn','dashStandingsContinue'])assert.ok(html.includes(`id="${id}"`),`missing ${id}`);
assert.ok(!html.includes('id="dashUpBtn"')&&!html.includes('id="dashDownBtn"'),'old vertical lane buttons removed');
assert.ok(html.includes('id="dashRacerSearch"')&&html.includes('id="dashRacerSort"')&&html.includes('id="dashRacerGrid"'));
assert.ok(js.includes('Catch a ${')&&js.includes('-type Pokémon to enter.'),'locked league copy must be direct');
assert.ok(css.includes('image-rendering:pixelated'),'picker keeps pixel sprites');

global.LuckyDexDashConfig=require(path.join(root,'app/src/main/assets/arcade-dash-config.js'));
global.LuckyDexDashLeague=require(path.join(root,'app/src/main/assets/arcade-dash-league.js'));
global.LuckyDexAdventureSpecies=require(path.join(root,'app/src/main/assets/adventure/adventure-species.js'));
global.LuckyDexDashCourse=require(path.join(root,'app/src/main/assets/arcade-dash-course.js'));
const modPath=path.join(root,'app/src/main/assets/arcade-dash.js');delete require.cache[modPath];const d=require(modPath);
const rows=[
 {key:'6:n',id:6,name:'Charizard',types:['fire','flying'],baseSpeed:100,level:40},
 {key:'25:n',id:25,name:'Pikachu',types:['electric'],baseSpeed:90,level:20},
 {key:'999:n',id:999,name:'Mystery',types:[],baseSpeed:44,level:1}
];
d.chooseMode('quick');assert.deepStrictEqual(d.eligibleRacersForCurrentMode(rows).map(x=>x.key),['6:n','25:n']);
d.chooseMode('league');d.chooseLeague('fire');assert.deepStrictEqual(d.eligibleRacersForCurrentMode(rows).map(x=>x.key),['6:n']);
d.chooseLeague('flying');assert.deepStrictEqual(d.eligibleRacersForCurrentMode(rows).map(x=>x.key),['6:n'],'dual type qualifies');
d.chooseMode('quick');d.chooseDifficulty('normal');assert.strictEqual(d.racerFitLabel(rows[1]).includes('ELIGIBLE'),true);assert.strictEqual(d.racerFitLabel(rows[2]).includes('TOO SLOW'),true);
const records={fire:{easy:{trophy:'gold'},normal:{trophy:'silver'},hard:{trophy:'bronze'}}};
const summary=d.trophySummary('fire',records);assert.ok(summary.includes('Easy 🥇')&&summary.includes('Normal 🥈')&&summary.includes('Hard 🥉')&&summary.includes('Expert —'));
assert.deepStrictEqual(d.filterAndSortRacers(rows,{query:'char',sort:'speed'}).map(x=>x.key),['6:n']);
assert.deepStrictEqual(d.filterAndSortRacers(rows,{query:'',sort:'name'}).map(x=>x.key),['6:n','999:n','25:n']);
console.log('PASS Dash v2 mode, league eligibility, trophy summary and racer picker contracts');
