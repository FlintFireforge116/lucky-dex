'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

// Voltorb Flip: there is no cash-out path, and the in-board COINS display is
// the actual Voltorb multiplier/payout value rather than an arbitrary ×20 UI value.
const classics=require('../app/src/main/assets/arcade-classics.js');
const classicsJs=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-classics.js'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const sessionJs=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-session.js'),'utf8');
assert.equal(typeof classics.voltorbDisplayCoins,'function','Voltorb must expose its display-payout rule for regression coverage');
assert.equal(classics.voltorbDisplayCoins(5184),5184,'Voltorb COINS must show the board payout itself, not payout ×20');
assert.match(classicsJs,/<span>PAYOUT<\/span><b id="voltorbBank">0<\/b>/,'Voltorb HUD must label the unbanked board value as PAYOUT, not profile coins');
assert.doesNotMatch(html,/id="voltorbCashBtn"/,'Voltorb Flip must not expose a CASH OUT button');
assert.doesNotMatch(classicsJs,/function cashVoltorb\b|voltorbCashBtn/,'Voltorb Flip must not retain a hidden cash-out implementation');
assert.doesNotMatch(sessionJs,/voltorb:\{[^\n]*cash out/i,'Voltorb run instructions must not advertise cashing out');

// Tile Puzzle: completion is visual. If two source tiles are indistinguishable,
// swapping only those tiles must count as a completed picture.
const amie=require('../app/src/main/assets/arcade-amie.js');
const amieJs=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-amie.js'),'utf8');
assert.equal(typeof amie.isSolvedVisualSwap,'function','Tile Puzzle must expose visual-equivalence completion logic');
const equivalent=(value,target)=>(value===3&&target===4)||(value===4&&target===3);
assert.equal(amie.isSolvedSwap([0,1,2,4,3]),false,'legacy identity check demonstrates the ambiguous-tile bug');
assert.equal(amie.isSolvedVisualSwap([0,1,2,4,3],equivalent),true,'visually equivalent tiles must not make a puzzle impossible');
assert.equal(amie.isSolvedVisualSwap([0,2,1,3,4],equivalent),false,'visually distinct misplaced tiles must still block completion');
assert.match(amieJs,/isSolvedVisualSwap\(tile\.board,/, 'live Tile Puzzle completion must use the visual-equivalence rule');
assert.match(amieJs,/run\?\.sceneImage\?\.complete.*naturalWidth/, 'visual-equivalence signatures must never be built from a not-yet-loaded blank scene');

// TCG Pocket trades: printed rarities are exact trade classes. Crown must not
// collapse to the same fallback tier as Two Diamond (the screenshot regression).
const R=require('../app/src/main/assets/card-rarity-v0253.js');
assert.equal(R.classify({source:'tcgp',rarity:'Crown'}).rarityClass,'secret','bare Pocket Crown must classify as a secret/crown hit');
const pocketClasses=[
  ['One Diamond','tcgp:one-diamond'],['Two Diamond','tcgp:two-diamond'],['Three Diamond','tcgp:three-diamond'],['Four Diamond','tcgp:four-diamond'],
  ['One Star','tcgp:one-star'],['Two Star','tcgp:two-star'],['Three Star','tcgp:three-star'],['Crown','tcgp:crown'],
  ['One Shiny','tcgp:one-shiny'],['Two Shiny','tcgp:two-shiny']
];
for(const [rarity,key] of pocketClasses)assert.equal(R.tradeClass({source:'tcgp',rarity}),key,`Pocket ${rarity} must trade only as its exact printed rarity`);
assert.notEqual(R.tradeClass({source:'tcgp',rarity:'Crown'}),R.tradeClass({source:'tcgp',rarity:'Two Diamond'}),'Crown and Two Diamond can never be a matched-rarity trade');
const tradeJs=fs.readFileSync(path.join(root,'app/src/main/assets/trade-v0163.js'),'utf8');
assert.match(tradeJs,/MARKET_VERSION\s*=\s*'v[0-9]+-[^']+'/,'trade market must retain a versioned cache generation so old misclassified listings are invalidated');
assert.match(tradeJs,/marketVersion\s*!==\s*MARKET_VERSION[\s\S]*?delete\s+state\.trade\.market/,'old Pocket market rows must be discarded immediately when rarity semantics change without materialising an empty market');
assert.match(tradeJs,/typeof requestTier==='string'/,'Pocket exact rarity classes must bypass numeric ±1 tier bargaining');

console.log('PASS v0.35.16 user-reported Voltorb, Tile Puzzle and Pocket trade regressions');
