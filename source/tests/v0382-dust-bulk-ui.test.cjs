const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const app=fs.readFileSync('app/src/main/assets/app-v0167.js','utf8');
const trade=fs.readFileSync('app/src/main/assets/trade-v0163.js','utf8');
const css=fs.readFileSync('app/src/main/assets/trade-browser-v0169.css','utf8');

for(const id of ['dustCardSearch','dustSetFilter','dustRarityFilter','dustValueFilter','dustClearFilters','dustKeepCopies','dustBulkSummary','dustConvertFiltered','dustBulkDialog','dustBulkConfirmList','dustBulkConfirmBtn']){
  assert.match(html,new RegExp(`id=["']${id}["']`),`missing ${id}`);
}
assert.match(html,/CONVERT FILTERED/,'bulk action must say FILTERED rather than implying every card');
assert.match(html,/KEEP COPIES/,'keep-copy control needs explicit label');
assert.ok(html.indexOf('dust-exchange-core.js')<html.indexOf('app-v0167.js'),'dust core must load before app runtime');

assert.match(app,/dustExchange:\{keepCopies:3\}/,'new saves default bulk keep preference to 3');
assert.match(app,/dustExchange:\{\.\.\.base\.ui\.dustExchange/,'old saves receive additive dust preference migration');
assert.match(app,/function resetDustExchangeFilters\(/,'filters need an explicit reset on entry');
assert.match(app,/function buildDustBulkSnapshot\(/,'runtime must create a confirmation snapshot');
assert.match(app,/function confirmDustBulkSnapshot\(/,'runtime must render a confirmation step');
assert.match(app,/function convertFilteredCardsToDust\(/,'runtime must execute filtered bulk conversion');
assert.match(app,/LuckyDexDustExchangeCore\.applyBatch/,'bulk conversion must validate the confirmed snapshot before mutation');
assert.match(app,/window\.resetDustExchangeFilters=resetDustExchangeFilters/,'Trade tab must be able to reset transient filters');
assert.match(trade,/window\.resetDustExchangeFilters\?\.\(\)/,'opening Dust Exchange resets old filters');

assert.match(css,/\.dust-filter-grid/,'filter controls need dedicated layout');
assert.match(css,/\.dust-bulk-panel/,'bulk keep/summary controls need dedicated styling');
assert.match(css,/\.dust-bulk-dialog/,'confirmation dialog needs styling');

console.log('PASS v0.38.2 dust bulk UI contract');
