/* Compressed regional campaigns. Team provenance and adaptations: docs/ADVENTURE_REGION_SOURCES.md. */
(function (root) {
  'use strict';
  const trainer = (name, city, type, team, strategy) => ({name, city, type, team, strategy});
  const stage = (name, habitat, wild, rare, title, text, safeLabel, riskLabel) => ({
    name, habitat, wild, rare, event: {title, text, safeLabel, riskLabel}
  });
  const regions = {
    kanto: {
      id: 'kanto', name: 'Kanto', available: true, edition: 'Red / Blue', accent: '#ef727b', start: 'Pallet Town', rewardCoins: 1200,
      encounters: {
        'Route 1': {wild:[16,19],rare:[25]},
        'Viridian Forest': {wild:[10,11,12,13,14,15],rare:[25]},
        'Route 3': {wild:[21,39],rare:[41]},
        'Mt. Moon': {wild:[41,74,46],rare:[35]},
        'Nugget Bridge': {wild:[16,43,69],rare:[63]},
        'Route 5': {wild:[16,19,43,52,69],rare:[63]},
        'Route 6': {wild:[16,19,43,52,69],rare:[63]},
        'Rock Tunnel': {wild:[41,74,66,95],rare:[104]},
        'Route 8': {wild:[16,19,37,58],rare:[43]},
        'Cycling Road': {wild:[84,21,111],rare:[128]},
        'Route 15': {wild:[48,84,102,111],rare:[113,123]},
        'Pokémon Tower': {wild:[92,93],rare:[104]},
        'Saffron approach': {wild:[52,43,69],rare:[58,37]},
        'Route 19': {wild:[72,73,90,98,129],rare:[54]},
        'Seafoam Islands': {wild:[86,87,90,41,42,54],rare:[124]},
        'Pokémon Mansion': {wild:[88,89,109,110,77],rare:[126]},
        'Route 21': {wild:[72,73,114,129],rare:[60,61]},
        'Route 22': {wild:[19,20,21,22,56],rare:[57]},
        'Route 23': {wild:[21,22,56,57],rare:[114]},
        'Victory Road': {wild:[74,75,95,41,42,66,67],rare:[105,49]}
      },
      gyms: [
        trainer('Brock', 'Pewter City', 'rock', [74,95], 'guard'),
        trainer('Misty', 'Cerulean City', 'water', [120,121], 'heal'),
        trainer('Lt. Surge', 'Vermilion City', 'electric', [100,25,26], 'status'),
        trainer('Erika', 'Celadon City', 'grass', [71,114,45], 'heal'),
        trainer('Koga', 'Fuchsia City', 'poison', [109,89,109,110], 'status'),
        trainer('Sabrina', 'Saffron City', 'psychic', [64,122,49,65], 'pressure'),
        trainer('Blaine', 'Cinnabar Island', 'fire', [58,77,78,59], 'pressure'),
        trainer('Giovanni', 'Viridian City', 'ground', [111,51,31,34,112], 'guard')
      ],
      stages: [
        stage('Route 2 & Viridian Forest', 'meadow', [16,19,10,13,11,14], [25], 'Forest fork', 'A narrow trail cuts through Viridian Forest. The main path has a quiet clearing; the thicket hides rustling leaves.', 'Rest in the clearing', 'Explore the thicket'),
        stage('Route 3 & Mt. Moon', 'cave', [21,39,41,74,46], [35], 'Mt. Moon ledge', 'A lantern marks a sheltered ledge in Mt. Moon. Below it, a rocky passage disappears into darkness.', 'Shelter by the lantern', 'Descend the passage'),
        stage('Nugget Bridge & Routes 5–6', 'meadow', [16,19,43,69,52], [63], 'Nugget Bridge challenge', 'A trainer beside Nugget Bridge offers advice for the journey to Vermilion. A tougher challenger waits across the bridge.', 'Take the advice', 'Accept the challenge'),
        stage('Rock Tunnel & Celadon approach', 'cave', [41,74,66,95,43,69], [104], 'Rock Tunnel crossing', 'The marked path through Rock Tunnel is steady. A side tunnel may contain supplies, but the stones shift underfoot.', 'Follow the markers', 'Search the side tunnel'),
        stage('Cycling Road & Safari Zone', 'meadow', [84,21,48,102,111], [113,128,123,127], 'Safari lookout', 'The Safari Zone warden points out a calm lookout. Beyond the reeds, a rare Pokémon has left fresh tracks.', 'Pause at the lookout', 'Follow the tracks'),
        stage('Pokémon Tower & Saffron approach', 'haunted', [92,93,104,52,43,69], [58,37], 'Lavender lanterns', 'Lanterns glow beside Pokémon Tower. You can rest with the caretaker or investigate a flickering light upstairs.', 'Stay with the caretaker', 'Investigate the light'),
        stage('Seafoam Islands & Pokémon Mansion', 'coast', [86,54,79,72,88,109,77], [87,90,126], 'Cinnabar landing', 'The Cinnabar pier is sheltered from the current. An old landing beside Pokémon Mansion promises a shorter crossing.', 'Use the sheltered pier', 'Try the old landing'),
        stage('Routes 21–22 & Viridian return', 'meadow', [114,16,17,19,20,72], [60,61], 'Viridian homeward trail', 'Pallet is close enough for a welcome break. The road back to Viridian also carries a final trainer challenge.', 'Take a homeward rest', 'Seek the challenger'),
        stage('Kanto Victory Road', 'cave', [74,75,95,41,42,66,67], [105,49], 'Indigo ascent', 'The last climb to Indigo Plateau splits at a boulder. One path has a sheltered rest stop; the other crosses a rugged ridge.', 'Use the rest stop', 'Cross the ridge')
      ],
      eliteFour: [
        trainer('Lorelei', 'Indigo Plateau', 'ice', [87,91,80,124,131], 'guard'),
        trainer('Bruno', 'Indigo Plateau', 'fighting', [95,107,106,95,68], 'pressure'),
        trainer('Agatha', 'Indigo Plateau', 'ghost', [94,42,93,24,94], 'status'),
        trainer('Lance', 'Indigo Plateau', 'dragon', [130,148,148,142,149], 'pressure')
      ],
      champion: trainer('Blue', 'Indigo Plateau', 'mixed', [18,65,112,59,103,9], 'pressure')
    },
    johto: {
      id: 'johto', name: 'Johto', available: true, edition: 'Gold / Silver', accent: '#e6bc5a', start: 'New Bark Town', rewardCoins: 1300,
      gyms: [
        trainer('Falkner', 'Violet City', 'flying', [16,17], 'pressure'),
        trainer('Bugsy', 'Azalea Town', 'bug', [11,14,123], 'guard'),
        trainer('Whitney', 'Goldenrod City', 'normal', [35,241], 'heal'),
        trainer('Morty', 'Ecruteak City', 'ghost', [92,93,94,93], 'status'),
        trainer('Chuck', 'Cianwood City', 'fighting', [57,62], 'pressure'),
        trainer('Jasmine', 'Olivine City', 'steel', [81,81,208], 'guard'),
        trainer('Pryce', 'Mahogany Town', 'ice', [86,87,221], 'guard'),
        trainer('Clair', 'Blackthorn City', 'dragon', [148,148,148,230], 'pressure')
      ],
      stages: [
        stage('Routes 29–31 & Sprout Tower', 'meadow', [16,19,161,163,10,13,69], [92], 'Violet bell', 'The bell at Sprout Tower marks a quiet rest. A swaying upper walkway offers an extra training challenge.', 'Rest by the bell', 'Climb the walkway'),
        stage('Route 32, Union Cave & Slowpoke Well', 'cave', [41,74,95,19,79], [194], 'Azalea well', 'A keeper at Slowpoke Well offers a dry place to rest. Water echoes from a deeper passage.', 'Stay with the keeper', 'Follow the echo'),
        stage('Ilex Forest & Route 34', 'meadow', [10,13,43,46,19,96], [63,132], 'Ilex forest shrine', 'A peaceful clearing surrounds the Ilex Forest shrine. Fresh tracks lead into the dense trees beyond it.', 'Rest in the clearing', 'Follow the tracks'),
        stage('Routes 36–37 & Burned Tower', 'haunted', [16,163,165,167,58,37,109], [185,126], 'Ecruteak embers', 'The Burned Tower stairwell still smells of ash. A guide offers a safe route around the unstable floor.', 'Follow the guide', 'Search the lower floor'),
        stage('Routes 38–41 & Whirl Islands', 'coast', [20,81,241,128,72,98], [222,226], 'Whirl Islands tide', 'The tide near Cianwood is turning. A sheltered crossing is open, while a narrow inlet may hide unusual Pokémon.', 'Take the calm crossing', 'Explore the inlet'),
        stage('Olivine Lighthouse & coast', 'coast', [72,73,98,129,81], [170,90], 'Lighthouse watch', 'Olivine Lighthouse has a warm room for weary travellers. The keeper also needs help checking a storm-battered walkway.', 'Rest in the warm room', 'Help on the walkway'),
        stage('Mt. Mortar & Lake of Rage', 'cave', [41,74,66,20,118,129], [236,130], 'Lake of Rage squall', 'Wind sweeps over the Lake of Rage. A fishing hut offers shelter; the lake path could reveal what stirred the water.', 'Shelter in the hut', 'Explore the lake path'),
        stage('Ice Path & Blackthorn approach', 'cave', [41,42,220,124], [225], 'Ice Path slide', 'A broad ledge offers a safe pause inside Ice Path. A steep ice chute leads toward a hidden chamber.', 'Pause on the ledge', 'Take the ice chute'),
        stage('Routes 45–46 & Johto Victory Road', 'cave', [74,75,42,95,111,217,232], [216,231,227,207], 'Dragon country', 'Blackthorn fades behind the mountain pass. The marked trail reaches a rest shelter; a rocky spur offers one last test.', 'Use the marked shelter', 'Climb the rocky spur')
      ],
      eliteFour: [
        trainer('Will', 'Indigo Plateau', 'psychic', [178,124,103,80,178], 'status'),
        trainer('Koga', 'Indigo Plateau', 'poison', [168,49,205,89,169], 'status'),
        trainer('Bruno', 'Indigo Plateau', 'fighting', [237,106,107,95,68], 'pressure'),
        trainer('Karen', 'Indigo Plateau', 'dark', [197,45,94,198,229], 'heal')
      ],
      champion: trainer('Lance', 'Indigo Plateau', 'dragon', [130,149,149,142,6,149], 'pressure')
    },
    hoenn: {
      id: 'hoenn', name: 'Hoenn', available: true, edition: 'Emerald', accent: '#65d1a4', start: 'Littleroot Town', rewardCoins: 1400,
      gyms: [
        trainer('Roxanne', 'Rustboro City', 'rock', [74,74,299], 'guard'),
        trainer('Brawly', 'Dewford Town', 'fighting', [66,307,296], 'pressure'),
        trainer('Wattson', 'Mauville City', 'electric', [100,309,82,310], 'status'),
        trainer('Flannery', 'Lavaridge Town', 'fire', [322,218,323,324], 'pressure'),
        trainer('Norman', 'Petalburg City', 'normal', [327,288,264,289], 'guard'),
        trainer('Winona', 'Fortree City', 'flying', [333,357,279,227,334], 'heal'),
        trainer('Tate & Liza', 'Mossdeep City', 'psychic', [344,178,337,338], 'status'),
        trainer('Juan', 'Sootopolis City', 'water', [370,340,364,342,230], 'heal')
      ],
      stages: [
        stage('Routes 101–104 & Petalburg Woods', 'meadow', [261,263,265,270,273,276,285], [280,287], 'Petalburg canopy', 'Rain patters on the Petalburg Woods canopy. A dry clearing offers shelter, while rustling branches invite a closer look.', 'Wait in the clearing', 'Search the branches'),
        stage('Dewford shore & Granite Cave', 'cave', [41,74,296,304,72,278], [302,63], 'Granite Cave lantern', 'A hiker keeps a lantern burning in Granite Cave. A darker route leads past glittering stone.', 'Rest by the lantern', 'Take the darker route'),
        stage('Slateport coast & Route 110', 'meadow', [278,43,309,316,263], [311,312], 'Slateport market detour', 'A traveller has set up a rest bench outside Slateport market. A nearby challenge promises supplies for the Mauville road.', 'Use the rest bench', 'Take the market challenge'),
        stage('Route 111 desert & Fiery Path', 'volcano', [322,66,218,109,88,328,27], [324,331], 'Lavaridge ashfall', 'Ash drifts down from Mt. Chimney. A covered path is calm, but a warm rocky trail might hold useful supplies.', 'Take the covered path', 'Search the warm trail'),
        stage('Rusturf Tunnel & Petalburg return', 'cave', [293,261,263,290,183,278], [300], 'Rusturf shortcut', 'The Rusturf Tunnel workers offer a place to sit. An unfinished side passage may shorten the return to Petalburg.', 'Rest with the workers', 'Try the side passage'),
        stage('Routes 119–120 & Fortree canopy', 'meadow', [43,263,264,357,278,183], [352,349], 'Weather Institute front', 'A heavy shower sweeps past the Weather Institute. You can wait under cover or search the riverbank as the weather changes.', 'Wait under cover', 'Search the riverbank'),
        stage('Route 121 & Mt. Pyre', 'haunted', [261,353,355,278,320], [358], 'Mt. Pyre mist', 'Mist curls around Mt. Pyre. A sheltered stairway is clear, while distant chimes lead toward the summit.', 'Take the sheltered stairs', 'Follow the chimes'),
        stage('Routes 124–126 & Sootopolis waters', 'coast', [72,278,320,170,366], [369], 'Sootopolis current', 'The waters around Sootopolis divide around a reef. A calm channel is safe; the deeper current passes a hidden grotto.', 'Use the calm channel', 'Explore the deep current'),
        stage('Ever Grande & Hoenn Victory Road', 'cave', [41,42,304,305,296,297,293,294], [303,308], 'Ever Grande waterfall', 'Beyond the waterfall, Victory Road has one final fork. A well-lit platform offers rest before a demanding ascent.', 'Rest on the platform', 'Challenge the ascent')
      ],
      eliteFour: [
        trainer('Sidney', 'Ever Grande City', 'dark', [262,275,332,342,359], 'pressure'),
        trainer('Phoebe', 'Ever Grande City', 'ghost', [356,354,302,354,356], 'status'),
        trainer('Glacia', 'Ever Grande City', 'ice', [364,362,364,362,365], 'guard'),
        trainer('Drake', 'Ever Grande City', 'dragon', [372,334,230,330,373], 'pressure')
      ],
      champion: trainer('Wallace', 'Ever Grande City', 'water', [321,73,272,340,130,350], 'heal')
    }
  };
  const order = ['kanto','johto','hoenn','sinnoh','unova','kalos','alola','galar','paldea'];
  for (const id of order.slice(3)) {
    regions[id] = {id, name: id[0].toUpperCase() + id.slice(1), available: false, deferred: 'Regional campaign content is not yet populated.'};
  }
  const value = {regions, order};
  if (typeof module === 'object' && module.exports) module.exports = value;
  root.LuckyDexRegions = value;
})(typeof window !== 'undefined' ? window : globalThis);
