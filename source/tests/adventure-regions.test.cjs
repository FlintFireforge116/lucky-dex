'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bundlePath = path.join(__dirname, '../app/src/main/assets/adventure/adventure-regions.js');
const {regions, order} = require(bundlePath);
const species = require('../app/src/main/assets/adventure/adventure-species.js').byId;

assert.deepEqual(order, ['kanto','johto','hoenn','sinnoh','unova','kalos','alola','galar','paldea']);
assert.deepEqual(Object.keys(regions), order);
assert.deepEqual(order.filter(id => regions[id].available), ['kanto','johto','hoenn']);
for (const id of order.slice(3)) {
  assert.equal(regions[id].available, false);
  assert.ok(regions[id].deferred);
  assert.equal(regions[id].stages, undefined, 'deferred regions must not borrow placeholder encounter tables');
}

// Expected species sequence transcribed from the pret primary game data cited in
// docs/ADVENTURE_REGION_SOURCES.md. Preserve repeated species and original variants.
const canonical = {
  kanto: [
    ['Brock',[74,95]], ['Misty',[120,121]], ['Lt. Surge',[100,25,26]], ['Erika',[71,114,45]],
    ['Koga',[109,89,109,110]], ['Sabrina',[64,122,49,65]], ['Blaine',[58,77,78,59]], ['Giovanni',[111,51,31,34,112]],
    ['Lorelei',[87,91,80,124,131]], ['Bruno',[95,107,106,95,68]], ['Agatha',[94,42,93,24,94]], ['Lance',[130,148,148,142,149]],
    ['Blue',[18,65,112,59,103,9]]
  ],
  johto: [
    ['Falkner',[16,17]], ['Bugsy',[11,14,123]], ['Whitney',[35,241]], ['Morty',[92,93,94,93]],
    ['Chuck',[57,62]], ['Jasmine',[81,81,208]], ['Pryce',[86,87,221]], ['Clair',[148,148,148,230]],
    ['Will',[178,124,103,80,178]], ['Koga',[168,49,205,89,169]], ['Bruno',[237,106,107,95,68]], ['Karen',[197,45,94,198,229]],
    ['Lance',[130,149,149,142,6,149]]
  ],
  hoenn: [
    ['Roxanne',[74,74,299]], ['Brawly',[66,307,296]], ['Wattson',[100,309,82,310]], ['Flannery',[322,218,323,324]],
    ['Norman',[327,288,264,289]], ['Winona',[333,357,279,227,334]], ['Tate & Liza',[344,178,337,338]], ['Juan',[370,340,364,342,230]],
    ['Sidney',[262,275,332,342,359]], ['Phoebe',[356,354,302,354,356]], ['Glacia',[364,362,364,362,365]], ['Drake',[372,334,230,330,373]],
    ['Wallace',[321,73,272,340,130,350]]
  ]
};
const habitats = ['meadow','cave','haunted','coast','volcano'];
const strategies = ['pressure','guard','status','heal'];
const poolSignatures = new Set();
const eventTitles = new Set();
for (const id of order.slice(0,3)) {
  const region = regions[id];
  assert.equal(region.id, id);
  assert.ok(region.start && region.edition && region.accent);
  assert.ok(Number.isInteger(region.rewardCoins) && region.rewardCoins > 0);
  assert.equal(region.gyms.length, 8);
  assert.equal(region.eliteFour.length, 4);
  assert.equal(region.stages.length, 9);
  assert.match(region.stages.at(-1).name, /Victory Road/);
  const bosses = [...region.gyms, ...region.eliteFour, region.champion];
  assert.deepEqual(bosses.map(boss => [boss.name,boss.team]), canonical[id], id + ' canonical teams and campaign order');
  for (const boss of bosses) {
    assert.ok(boss.name && boss.city && boss.type);
    assert.ok(strategies.includes(boss.strategy));
    assert.ok(boss.team.length >= 2 && boss.team.length <= 6);
    for (const nationalId of boss.team) assert.ok(species[nationalId], 'known boss species ' + nationalId);
  }
  for (const area of region.stages) {
    assert.ok(habitats.includes(area.habitat));
    assert.ok(area.wild.length >= 4 && area.rare.length >= 1);
    assert.equal(new Set([...area.wild,...area.rare]).size, area.wild.length + area.rare.length, 'pool entries must not accidentally double-weight a species');
    const signature = [...area.wild,...area.rare].sort((a,b) => a-b).join(',');
    assert.ok(!poolSignatures.has(signature), 'each stage has a distinct encounter pool');
    poolSignatures.add(signature);
    assert.ok(!eventTitles.has(area.event.title), 'environmental events are locally named');
    eventTitles.add(area.event.title);
    for (const key of ['title','text','safeLabel','riskLabel']) assert.ok(area.event[key]);
    assert.notEqual(area.event.safeLabel, area.event.riskLabel);
    for (const nationalId of [...area.wild,...area.rare]) {
      assert.ok(species[nationalId], 'known wild species ' + nationalId);
      assert.ok(nationalId <= ({kanto:151,johto:251,hoenn:386})[id], id + ' era-appropriate species');
    }
  }
}
assert.equal(poolSignatures.size, 27);
assert.equal(regions.hoenn.champion.name, 'Wallace', 'Emerald champion, not Ruby/Sapphire Steven');
assert.equal(regions.hoenn.gyms[7].name, 'Juan', 'Emerald Sootopolis gym');
assert.ok(!regions.johto.stages[7].rare.includes(215), 'Sneasel in Ice Path belongs to Crystal, not Gold/Silver');
assert.ok(regions.kanto.stages[0].rare.includes(25), 'Viridian Forest Pikachu');
assert.ok(regions.hoenn.stages[5].rare.includes(349), 'Route 119 Feebas');
const browser = {window:{}};
vm.runInNewContext(fs.readFileSync(bundlePath,'utf8'), browser);
assert.equal(browser.window.LuckyDexRegions.regions.kanto.start, 'Pallet Town');
assert.equal(browser.window.LuckyDexRegions.order.length, 9);
console.log('PASS regional campaign registry: 3 populated regions, 27 distinct stages, 39 canonical bosses, browser/CommonJS exports');
