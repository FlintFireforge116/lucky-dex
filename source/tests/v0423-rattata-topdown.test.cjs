'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

test('Run Rattata Run top-down view keeps the player anchored and brings hurdles toward them',()=>{
  assert.equal(fs.existsSync(asset('arcade-run-rattata-run-view.js')),true,'top-down view helper must exist');
  const view=fresh('arcade-run-rattata-run-view.js');
  const h=400,camera=300;
  const playerY=view.worldToY(camera,camera,h);
  const near=view.worldToY(camera+100,camera,h);
  const closer=view.worldToY(camera+100,camera+50,h);
  assert.equal(playerY,view.playerAnchorY(h));
  assert.ok(near<playerY,'an upcoming hurdle must render above the player');
  assert.ok(closer>near,'the hurdle must move down as the player approaches it');
  assert.ok(view.worldToY(camera-50,camera,h)>playerY,'racers behind the player render below them');
});

test('Run Rattata Run top-down geometry gives four stable lane centres and visible hurdle filtering',()=>{
  const view=fresh('arcade-run-rattata-run-view.js');
  const xs=[0,1,2,3].map(i=>view.laneToX(i,360));
  assert.equal(new Set(xs.map(Math.round)).size,4);
  assert.ok(xs.every((x,i)=>i===0||x>xs[i-1]));
  const visible=view.visibleHurdles([220,390,575,760],300,400);
  assert.deepEqual(visible.map(v=>v.distance),[220,390,575]);
  assert.ok(visible.every(v=>v.y>=-view.CONFIG.hurdleCullMargin&&v.y<=400+view.CONFIG.hurdleCullMargin));
});

test('Run Rattata Run shell is a single top-down course instead of four horizontal tracks',()=>{
  const html=read('index.html');
  const start=html.indexOf('id="runRattataRunGame"'),end=html.indexOf('id="dashGame"');
  const shell=html.slice(start,end);
  assert.match(shell,/id="runRattataRunCourse" class="rattata-course"/);
  assert.match(shell,/id="runRattataRunHurdles" class="rattata-hurdle-field"/);
  assert.match(shell,/rattata-lane-lines/);
  for(const id of ['runRattataRunPlayerLane','runRattataRunCpu1Lane','runRattataRunCpu2Lane','runRattataRunCpu3Lane'])assert.match(shell,new RegExp(`id="${id}" class="rattata-racer-slot`));
  assert.doesNotMatch(shell,/class="rattata-track"/);
});

test('Run Rattata Run runtime uses top-down camera geometry and one shared hurdle field',()=>{
  const js=read('arcade-run-rattata-run.js');
  assert.match(js,/LuckyDexRunRattataRunView/);
  assert.match(js,/view\.worldToY\(/);
  assert.match(js,/view\.laneToX\(/);
  assert.match(js,/runRattataRunHurdles/);
  assert.match(js,/--rattata-course-offset/);
  assert.doesNotMatch(js,/style\.left=`\$\{\(pos\/core\.CONFIG\.courseDistance\)/);
});

test('Run Rattata Run top-down CSS uses vertical lanes and honest airborne depth cues',()=>{
  const css=read('arcade-run-rattata-run.css');
  assert.match(css,/\.rattata-course\{/);
  assert.match(css,/\.rattata-lane-lines\{/);
  assert.match(css,/\.rattata-hurdle\{/);
  assert.match(css,/\.rattata-racer-slot\.is-airborne/);
  assert.match(css,/--rattata-course-offset/);
  assert.doesNotMatch(css,/grid-template-rows:repeat\(4/);
});
