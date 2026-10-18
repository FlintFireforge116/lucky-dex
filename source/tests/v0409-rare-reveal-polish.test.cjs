const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('shiny Unown uses sprite-only shine without circular halo',()=>{
  const css=read('app/src/main/assets/arcade.css');
  const rule=(css.match(/\.unown-glyph\[data-shiny-unown="true"\][^{]*\{([^}]*)\}/)||[])[1]||'';
  assert.doesNotMatch(rule,/border-radius\s*:\s*50%/i);
  assert.doesNotMatch(rule,/background\s*:/i);
  assert.doesNotMatch(rule,/box-shadow\s*:/i);
  assert.match(css,/data-shiny-unown="true"\]\s+img\{[^}]*filter:/i);
  assert.match(css,/data-shiny-unown="true"\]::after\{[^}]*content:\s*"✦"/i);
});

test('Unown banks shiny reward reveals and sends them to cashout review',()=>{
  const js=read('app/src/main/assets/arcade-unown.js');
  assert.match(js,/rewardReveals\s*:\s*\[\]/);
  assert.match(js,/g\.rewardReveals\.push\(/);
  assert.match(js,/showResult\?\.\('unown',[\s\S]*rewardReveals\s*:\s*g\.rewardReveals/s);
});

test('Tile Puzzle passes card pack and present rewards into the reveal stage',()=>{
  const js=read('app/src/main/assets/arcade-amie.js');
  assert.match(js,/let\s+rareLabel='',\s*rareReveal=null/);
  assert.match(js,/rareReveal\s*=\s*bridge\?\.rewardReveal\?/);
  assert.match(js,/result\('tilePuzzle',[\s\S]*rewardReveals\s*:\s*rareReveal\s*\?\s*\[rareReveal\]\s*:\s*\[\]/s);
});

test('Puzzle presents resolve to their actual reward labels rather than Puzzle Present',()=>{
  const core=read('app/src/main/assets/arcade-tile-puzzle-core.js');
  assert.match(core,/250 Lucky Coins/);
  assert.match(core,/50 Card Dust/);
  assert.match(core,/Pack Voucher/);
  assert.doesNotMatch(core,/label:'Puzzle Present'/);
});

test('rare reward bridge exposes a shared reveal descriptor',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(app,/function rareRewardRevealV0409\(/);
  assert.match(app,/LuckyDexRareRewardBridge=\{[^}]*rewardReveal:rareRewardRevealV0409/s);
});

test('Tile Puzzle uses a transparent Mystery Gift sprite without a numbered backing badge',()=>{
  const js=read('app/src/main/assets/arcade-amie.js');
  assert.match(js,/mystery-gift\.svg/);
  const fn=(js.match(/function drawGiftMarker\([^)]*\)\{([\s\S]*?)\n\}/)||[])[1]||'';
  assert.match(fn,/drawImage\(/);
  assert.doesNotMatch(fn,/fillRect\(/);
  assert.doesNotMatch(fn,/fillText\(/);
  assert.doesNotMatch(js,/Present found on tile/);
  assert.ok(fs.existsSync(path.join(ROOT,'app/src/main/assets/arcade/ui/mystery-gift.svg')));
});
