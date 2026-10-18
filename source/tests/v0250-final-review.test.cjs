const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const core=require('../app/src/main/assets/arcade-fossil-museum-core.js');
global.LuckyDexFossilMuseumCore=core;
const museum=require('../app/src/main/assets/arcade-fossil-museum.js');

const coinRows=core.CATALOGUE.filter(x=>x.category==='coins');
assert.ok(coinRows.length>=3,'coin caches should exist');
assert.ok(coinRows.every(x=>/relic-gold\.png$/.test(x.sprite)),'Lucky Coin caches should use the coin-like gold relic sprite, not a Nugget sprite');

const expectedCases=['topA','topB','topC','outerTop','outerMid','outerLow','innerUpper','innerLower','pedestal'];
assert.deepEqual(Object.keys(museum.MUSEUM_CASES||{}).sort(),expectedCases.slice().sort(),'museum must model only the genuine Oreburgh display surfaces and central pedestal');
const entries=Object.entries(museum.MUSEUM_PLACEMENT||{});
assert.equal(entries.length,30,'all 30 museum exhibits need case-based placements');
for(const [id] of entries){const slot=museum.museumSlotFor(id);assert.ok(slot,`${id} must resolve to a case slot`);assert.ok(expectedCases.includes(slot.caseId),`${id} must be positioned inside a genuine museum display/pedestal, not floating on the floor`);assert.ok(slot.x>0&&slot.x<100&&slot.y>0&&slot.y<100,`${id} must stay inside the museum room`);}

const room=path.join(root,'app/src/main/assets/arcade/fossil-museum-v0252/oreburgh-museum-dppt-landscape-v0252.png');
assert.ok(fs.existsSync(room),'v0.25.2 authentic Oreburgh museum room missing');
const sha=crypto.createHash('sha256').update(fs.readFileSync(room)).digest('hex');
assert.match(sha,/^[0-9a-f]{64}$/,'museum room SHA should be valid');
console.log('PASS v0.25.0 final visual-review contract');
