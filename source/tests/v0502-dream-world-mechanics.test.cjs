const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

function freshCore(name){const p=path.join(root,name);delete require.cache[require.resolve(p)];return require(p);}

test('Wailord uses arrow movement plus an explicit shoot button, not direct playfield dragging',()=>{
  const html=read('index.html'),js=read('arcade-wailord-water-spout.js');
  assert.match(html,/id="wailordShoot"/);
  assert.match(html,/SHOOT|SPOUT/);
  assert.doesNotMatch(js,/field\?\.addEventListener\?\.\('pointerdown'/);
  assert.doesNotMatch(js,/moveWailord\(e\.clientX\)/);
  assert.match(js,/bindHold\('wailordLeft','arrowleft'\)/);
  assert.match(js,/bindHold\('wailordRight','arrowright'\)/);
  assert.match(js,/function shootHeldPokemon/);
});

test('Pokemon caught by Wailord stay held on the spout until the player shoots',()=>{
  const js=read('arcade-wailord-water-spout.js');
  assert.match(js,/p\.held=true/);
  assert.match(js,/if\(p\.held\)/);
  assert.match(js,/p\.x=clamp\(wailordX\+p\.holdOffset/);
  assert.match(js,/p\.held=false/);
  assert.match(js,/core\.launchVector/);
});

test('Normal Wailord objective remains 15 balls and water splashes reset multiplier',()=>{
  const c=freshCore('arcade-wailord-water-spout-core.js');
  assert.equal(c.CONFIG.goalBalls,15);
  const run=c.createRun({difficulty:'normal',rng:()=>.2,rainbowRate:0});
  for(let i=0;i<6;i++)c.hitBall(run,'pikachu',{id:String(i),colour:'yellow',rainbow:false});
  assert.ok(run.multiplier>1);
  c.registerFall(run,'pikachu');
  assert.equal(run.multiplier,1);
  assert.equal(run.combo,0);
});

test('Ice Cream Scoop models each placed scoop as an independent physics body',()=>{
  const c=freshCore('arcade-ice-cream-scoop-core.js');
  const run=c.createRun({difficulty:'normal',rng:()=>.2,dreamRate:0});
  const first=c.resolveDrop(run,.5,()=>.2);
  assert.equal(first.safe,true);
  const body=run.stack[0];
  for(const key of ['x','y','vx','vy','angle','omega','radius','mass'])assert.equal(typeof body[key],'number',key);
  assert.equal(typeof c.stepPhysics,'function');
  assert.equal(typeof c.isTowerSettled,'function');
});

test('Ice Cream physics topples through loss of physical support rather than a fixed lean limit',()=>{
  const c=freshCore('arcade-ice-cream-scoop-core.js');
  assert.equal('leanLimit' in c.DIFFICULTIES.normal,false);
  assert.equal('minOverlap' in c.DIFFICULTIES.normal,false);
  const centred=c.createRun({difficulty:'normal',rng:()=>.2,dreamRate:0});
  for(let i=0;i<5;i++){
    const out=c.resolveDrop(centred,.5,()=>.2);
    assert.equal(out.safe,true);
    for(let j=0;j<180;j++)c.stepPhysics(centred,1/120);
    assert.equal(centred.collapsed,false);
  }
  const leaning=c.createRun({difficulty:'normal',rng:()=>.2,dreamRate:0});
  for(const x of [.5,.56,.61,.66]){
    const out=c.resolveDrop(leaning,x,()=>.2);
    if(!out.safe)break;
    for(let j=0;j<240&&!leaning.collapsed;j++)c.stepPhysics(leaning,1/120);
  }
  assert.equal(leaning.collapsed,true);
});
