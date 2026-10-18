const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-unown.js'),'utf8');

assert.match(js,/LuckyDexUnownData\.buildPool\(.*LuckyDexAdventureSpecies\.byId/,'must build from shared species dataset');
for(const mode of ['easy','normal','hard'])assert.ok(js.includes(`'${mode}'`)||js.includes(`"${mode}"`),`missing ${mode} mode`);
assert.match(js,/function\s+submitAnswer\s*\(/,'shared answer path missing');
assert.match(js,/unownTypedForm[\s\S]*submit/,'typed form must use submit event');
assert.match(js,/preventDefault\(\)/,'typed submit should prevent browser form navigation');
assert.match(js,/submitAnswer\(/,'answer controls must converge on submitAnswer');
assert.match(js,/awardArcadeCoins\([^\n]*'unown'/,'must preserve existing Unown reward routing');
assert.match(js,/cashOut/,'cash-out flow missing');
assert.match(js,/showResult\?\.\('unown'/,'Arcade session result path missing');
assert.doesNotMatch(js,/UNOWN_WORDS_V168|round\s*>?=\s*5|\/5 DECODED|6 choices/,'legacy fixed-run logic should be gone');
assert.match(js,/clearInterval/,'timer interval must be cancellable');
assert.match(js,/managedTimeouts|timeouts/,'managed reveal timeouts missing');
assert.match(js,/clearTimeout/,'managed timeouts must be cleared');
assert.match(js,/requestAnimationFrame/,'typed mode should schedule safe focus');
assert.match(js,/normaliseAnswer/,'typed answers must use normalisation');
assert.match(js,/650/,'canonical reveal should last 650 ms');
assert.match(js,/bank\s*\*\s*\.20|bank\s*\*\s*0\.20/,'failure consolation must be 20% of bank');
assert.match(js,/usedNormalised/,'normalised collision history must be tracked');
assert.match(js,/forceUnownRound/,'deterministic debug fixture hook missing');
assert.match(js,/state:\s*\(\)\s*=>/,'debug/state readback API missing');

console.log('PASS v0.28.3 Unown streak-flow source contract');
