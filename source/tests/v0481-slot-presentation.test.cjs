const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('slot stake buttons show only LuckyDex values rather than redundant 1 2 3 coin labels',()=>{
  const html=read('index.html');
  assert.match(html,/data-slot-bet="1"[^>]*><b>25<\/b><small>LUCKY COINS<\/small>/);
  assert.match(html,/data-slot-bet="2"[^>]*><b>50<\/b><small>LUCKY COINS<\/small>/);
  assert.match(html,/data-slot-bet="3"[^>]*><b>75<\/b><small>LUCKY COINS<\/small>/);
  assert.doesNotMatch(html,/>1 COIN</);
  assert.doesNotMatch(html,/>2 COINS</);
  assert.doesNotMatch(html,/>3 COINS</);
});

test('slot cabinet uses genuinely scrolling reel strips while a reel is live',()=>{
  const js=read('arcade-slot-machine.js');
  const css=read('arcade-slot-machine.css');
  assert.match(js,/function rollingStripHtml\(/);
  assert.match(js,/slot-reel-strip is-scrolling/);
  assert.match(js,/if\(spinning&&!stopped\[c\]\)/);
  assert.match(css,/\.slot-reel-strip\.is-scrolling/);
  assert.match(css,/@keyframes slotReelScroll/);
  assert.match(css,/animation:slotReelScroll/);
});

test('slot machine removes the large spinning instruction panel but keeps compact outcome feedback',()=>{
  const html=read('index.html');
  const js=read('arcade-slot-machine.js');
  assert.doesNotMatch(html,/id="slotMessage" class="slot-message"/);
  assert.match(html,/id="slotOutcome"/);
  assert.doesNotMatch(js,/REELS SPINNING/);
  assert.doesNotMatch(js,/Stop each reel in order/);
  assert.match(js,/setOutcome/);
});
