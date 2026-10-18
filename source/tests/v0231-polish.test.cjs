'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const M=require('../app/src/main/assets/adventure/adventure-model.js');

assert.ok(M.HOTSPOT_BLUEPRINTS,'Adventure model exposes biome-specific hotspot blueprints');
for(const id of Object.keys(M.DESTINATIONS)){
  const spots=M.HOTSPOT_BLUEPRINTS[id];
  assert.equal(spots.length,5,`${id} has five authored hotspot positions`);
  assert.equal(new Set(spots.map(s=>`${s.x},${s.y}`)).size,5,`${id} hotspot positions are unique`);
  for(const s of spots){
    assert.ok(s.x>=8&&s.x<=92&&s.y>=4&&s.y<=88,`${id} ${s.clue} stays inside scene`);
    assert.ok(s.clue&&s.effect,`${id} hotspot has clue and effect`);
  }
}
assert.ok(M.HOTSPOT_BLUEPRINTS.meadow.some(s=>/grass/i.test(s.clue)&&s.y>=55),'Viridian grass clues sit in the lower grass beds');
assert.ok(M.HOTSPOT_BLUEPRINTS.meadow.some(s=>/tree/i.test(s.clue)&&s.x>=65&&s.y<=25),'Viridian tree clue sits on the isolated upper tree');
assert.ok(M.HOTSPOT_BLUEPRINTS.coast.filter(s=>/water|bubble|splash/i.test(s.clue)).length>=3,'Seafoam clues favour visible water');

assert.ok(M.ENCOUNTER_POOLS,'Adventure model exposes curated encounter pools');
const ultraBeasts=new Set([793,794,795,796,797,798,799,803,804,805,806]);
for(const [id,tiers] of Object.entries(M.ENCOUNTER_POOLS)){
  for(const tier of ['normal','rare','legendary']){
    assert.ok(Array.isArray(tiers[tier]),`${id} has ${tier} encounter tier`);
    for(const species of tiers[tier]) assert.ok(!ultraBeasts.has(species),`${id}/${tier} excludes Ultra Beast #${species}`);
  }
}
assert.ok(!M.ENCOUNTER_POOLS.meadow.normal.includes(795)&&!M.ENCOUNTER_POOLS.meadow.rare.includes(795),'Pheromosa cannot appear in Viridian Wilds');
assert.deepEqual(M.ENCOUNTER_POOLS.meadow.legendary,[],'Viridian Wilds has no random legendary tier');
assert.ok(M.ENCOUNTER_POOLS.coast.legendary.includes(144),'Seafoam can reserve Articuno for the exceptional tier');

const arcadeCss=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade.css'),'utf8');
assert.ok(!/body\.arcade-mode \.bottom-nav\s*\{\s*display:none/.test(arcadeCss),'Arcade world no longer hides global bottom navigation');
assert.match(arcadeCss,/body\.arcade-open \.bottom-nav[^\{]*\{\s*display:none/,'Active minigames still hide global bottom navigation');
assert.match(arcadeCss,/body\.arcade-venue-open \.bottom-nav[^\{]*\{\s*display:none/,'Venue screen still hides global bottom navigation');

const packCss=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/pack-opening-v0160.css'),'utf8');
assert.match(packCss,/\.pack-hit-label\{[^}]*justify-self:center/s,'Holo hit label is explicitly centered under the card');
assert.match(packCss,/\.pack-hit-label\{[^}]*border-radius:/s,'Holo hit label is visually anchored as a badge');

console.log('PASS v0.23.2 hotspot placement, encounter vetting, Arcade nav and holo alignment contracts');
