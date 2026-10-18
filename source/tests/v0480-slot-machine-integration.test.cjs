const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('Mauville Slot Machine is wired into the Game Corner and app shell',()=>{
  const world=read('arcade-world.js'),index=read('index.html');
  assert.match(world,/id:'mauville'[^\n]+games:\['roulette','slotMachine'\]/);
  assert.match(world,/slotMachine:'Mauville Slot Machine'/);
  assert.match(world,/slotMachine:\(\)=>window\.LuckyDexSlotMachine/);
  assert.match(index,/id="slotMachineGame"/);
  assert.match(index,/arcade-slot-machine-core\.js/);
  assert.match(index,/arcade-slot-machine\.js/);
  assert.match(index,/arcade-slot-machine\.css/);
});

test('slot machine has persistent records, achievements, and a Reel Time rare-event setting',()=>{
  const platform=read('arcade-platform.js'),records=read('arcade-records.js'),ach=read('achievements-v0341.js'),app=read('app-v0167.js'),index=read('index.html');
  assert.match(platform,/slotMachine:\{gamesPlayed:0/);
  assert.match(records,/slotMachine/);
  assert.match(ach,/slot_first_jackpot/);
  assert.match(ach,/slot_reel_time/);
  assert.match(app,/slotReelTime/);
  assert.match(index,/rareSlotReelTimeOddsSelect/);
});

test('slot machine UI exposes 1/2/3 coin bet and three independent stop controls',()=>{
  const index=read('index.html'),css=read('arcade-slot-machine.css');
  assert.match(index,/data-slot-bet="1"/);
  assert.match(index,/data-slot-bet="2"/);
  assert.match(index,/data-slot-bet="3"/);
  assert.match(index,/data-slot-stop="0"/);
  assert.match(index,/data-slot-stop="1"/);
  assert.match(index,/data-slot-stop="2"/);
  assert.match(css,/slot-machine-reels/);
});


test('slot settlement applies the original red/blue 7 luck flip',()=>{
  const js=read('arcade-slot-machine.js');
  assert.match(js,/result\.bestLine\?\.jackpotTone==='blue'/);
  assert.match(js,/result\.bestLine\?\.jackpotTone==='red'/);
  assert.match(js,/straight7/);
});
