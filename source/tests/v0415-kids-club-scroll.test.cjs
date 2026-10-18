const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');

const rule=css.match(/\.arcade-venue-games\s*\{([^}]*)\}/);
assert.ok(rule,'arcade venue games rule must exist');
const body=rule[1];
assert.match(body,/flex\s*:\s*1(?:\s+1\s+auto)?\s*;/,'venue game list must consume remaining venue height');
assert.match(body,/min-height\s*:\s*0\s*;/,'venue game list must be allowed to shrink inside the flex venue shell');
assert.match(body,/overflow-y\s*:\s*auto\s*;/,'venue game list must scroll vertically when more games are added');
assert.match(body,/overscroll-behavior\s*:\s*contain\s*;/,'venue game list should contain touch overscroll');
console.log('PASS v0.40.15 Kids Club venue game list scroll contract');
