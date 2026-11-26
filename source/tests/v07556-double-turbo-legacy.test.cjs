'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {run}=require('../scripts/audit-double-turbo-legacy.cjs');
const fixtures=[
  {
    "id": "ex4-13",
    "name": "Spark",
    "base": [
      20,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex5-6",
    "name": "Breaking Sound",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex5-47",
    "name": "Super Icy Wind",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex5-56",
    "name": "Spark",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex5-99",
    "name": "Steel Wave",
    "base": [
      50,
      20
    ],
    "expected": [
      30,
      0
    ]
  },
  {
    "id": "ex6-24",
    "name": "Shot Air",
    "base": [
      10,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex7-19",
    "name": "Spinning Tail",
    "base": [
      20,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex7-40",
    "name": "Explosive Evolution",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex8-4",
    "name": "Split Bomb",
    "base": [
      30,
      30
    ],
    "expected": [
      10,
      10
    ]
  },
  {
    "id": "ex8-24",
    "name": "Triple Breach",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex10-25",
    "name": "Stretch Kick",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex10-37",
    "name": "Double Attack",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex10-63",
    "name": "Telekinesis",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex10-78",
    "name": "Splatter",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex10-102",
    "name": "Snap Tail",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "ex10-109",
    "name": "Mudslide",
    "base": [
      0,
      100
    ],
    "expected": [
      0,
      80
    ]
  },
  {
    "id": "ex11-7",
    "name": "Return Spark",
    "base": [
      50,
      20
    ],
    "expected": [
      30,
      0
    ]
  },
  {
    "id": "ex11-17",
    "name": "Feint Attack",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "ex11-33",
    "name": "Mist Attack",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex11-43",
    "name": "Sonic Signal",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex11-50",
    "name": "Snap Tail",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "ex11-62",
    "name": "Linear Attack",
    "base": [
      0,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex11-70",
    "name": "Linear Attack",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex11-82",
    "name": "Dig Under",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex11-86",
    "name": "Skill Dive",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex12-2",
    "name": "Bound Crush",
    "base": [
      0,
      60
    ],
    "expected": [
      0,
      40
    ]
  },
  {
    "id": "ex12-15",
    "name": "Feint Attack",
    "base": [
      0,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex12-34",
    "name": "Rock Slide",
    "base": [
      20,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex12-37",
    "name": "Tongue Whip",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex12-45",
    "name": "Water Arrow",
    "base": [
      0,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex12-50",
    "name": "Random Spark",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex12-57",
    "name": "Mach Punch",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex12-67",
    "name": "Pebble Throw",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex12-83",
    "name": "Overrun",
    "base": [
      30,
      20
    ],
    "expected": [
      10,
      0
    ]
  },
  {
    "id": "ex13-18",
    "name": "Overrun",
    "base": [
      0,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex13-23",
    "name": "Feint Attack",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex13-25",
    "name": "Rock Slide",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex13-28",
    "name": "Rock Slide",
    "base": [
      40,
      10
    ],
    "expected": [
      20,
      0
    ]
  },
  {
    "id": "ex13-38",
    "name": "Wide Laser",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex13-41",
    "name": "Split Bomb",
    "base": [
      30,
      30
    ],
    "expected": [
      10,
      10
    ]
  },
  {
    "id": "ex13-65",
    "name": "Pebble Throw",
    "base": [
      0,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex13-74",
    "name": "Water Arrow",
    "base": [
      0,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex14-3",
    "name": "Linear Attack",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "ex14-5",
    "name": "Dig Under",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "ex14-15",
    "name": "Triple Needle",
    "base": [
      10,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex14-23",
    "name": "Bass Control",
    "base": [
      0,
      40
    ],
    "expected": [
      0,
      20
    ]
  },
  {
    "id": "ex14-24",
    "name": "Mud Splash",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "ex14-35",
    "name": "Stretch Vine",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "ex14-41",
    "name": "Feint Attack",
    "base": [
      0,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex14-95",
    "name": "Hydro Shot",
    "base": [
      0,
      70
    ],
    "expected": [
      0,
      50
    ]
  },
  {
    "id": "ex15-6",
    "name": "Linear Attack",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "ex15-48",
    "name": "Thunder Spear",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex15-69",
    "name": "Quick Bind",
    "base": [
      0,
      10
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex16-5",
    "name": "Fire Stream",
    "base": [
      50,
      10
    ],
    "expected": [
      30,
      0
    ]
  },
  {
    "id": "ex16-22",
    "name": "Feint Attack",
    "base": [
      0,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "ex16-95",
    "name": "Scanblast",
    "base": [
      70,
      70
    ],
    "expected": [
      50,
      50
    ]
  },
  {
    "id": "ex16-97",
    "name": "Dirge",
    "base": [
      60,
      60
    ],
    "expected": [
      40,
      40
    ]
  },
  {
    "id": "dp7-99",
    "name": "Voltage Shoot",
    "base": [
      0,
      80
    ],
    "expected": [
      0,
      60
    ]
  },
  {
    "id": "pl2-22",
    "name": "Muddy Bomb",
    "base": [
      10,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "pl2-29",
    "name": "Fling Away",
    "base": [
      30,
      30
    ],
    "expected": [
      10,
      10
    ]
  },
  {
    "id": "hgss2-6",
    "name": "Switch Cannon",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "hgss2-13",
    "name": "Hydro Launcher",
    "base": [
      0,
      100
    ],
    "expected": [
      0,
      80
    ]
  },
  {
    "id": "hgss2-88",
    "name": "Darkness Howl",
    "base": [
      20,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "hgss2-94",
    "name": "Torrent Blade",
    "base": [
      0,
      100
    ],
    "expected": [
      0,
      80
    ]
  },
  {
    "id": "hgss2-95",
    "name": "Torrent Blade",
    "base": [
      0,
      100
    ],
    "expected": [
      0,
      80
    ]
  },
  {
    "id": "hgss4-20",
    "name": "Thunder Shot",
    "base": [
      50,
      50
    ],
    "expected": [
      30,
      30
    ]
  },
  {
    "id": "hgss4-38",
    "name": "Licking Shot",
    "base": [
      0,
      510
    ],
    "expected": [
      0,
      490
    ]
  },
  {
    "id": "hgss4-74",
    "name": "Tripping Headbutt",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "col1-12",
    "name": "Destructive Tsunami",
    "base": [
      40,
      40
    ],
    "expected": [
      20,
      20
    ]
  },
  {
    "id": "col1-SL6",
    "name": "Destructive Tsunami",
    "base": [
      40,
      40
    ],
    "expected": [
      20,
      20
    ]
  },
  {
    "id": "bw3-56",
    "name": "Synchronoise",
    "base": [
      20,
      20
    ],
    "expected": [
      0,
      0
    ]
  },
  {
    "id": "bw7-69",
    "name": "Telekinesis",
    "base": [
      0,
      30
    ],
    "expected": [
      0,
      10
    ]
  },
  {
    "id": "bw7-89",
    "name": "Hammerhead",
    "base": [
      30,
      30
    ],
    "expected": [
      10,
      10
    ]
  },
  {
    "id": "bw7-144",
    "name": "Hammerhead",
    "base": [
      30,
      30
    ],
    "expected": [
      10,
      10
    ]
  },
  {
    "id": "sm3-38",
    "name": "Synchronoise",
    "base": [
      60,
      20
    ],
    "expected": [
      40,
      0
    ]
  }
];
for(const side of ['player','opponent']){
 for(const f of fixtures)test(`${side} legacy DTE ${f.id} ${f.name}`,()=>{assert.deepEqual(run(f.id,f.name,false,side),f.base,'unmodified control');assert.deepEqual(run(f.id,f.name,true,side),f.expected,'reduced outgoing damage');});
 for(const [id,name,damage] of [['ex15-19','Delta Mind',10],['ex13-48','Deceive',40]])test(`${side} DTE leaves ${name} counters intact`,()=>{assert.deepEqual(run(id,name,false,side),[0,damage]);assert.deepEqual(run(id,name,true,side),[0,damage]);});
}
