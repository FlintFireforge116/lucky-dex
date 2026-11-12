/* Diamond & Pearl (dp1), source catalogue — 130 numbered English prints.
 * Print metadata from PokemonTCG/pokemon-tcg-data/cards/en/dp1.json.
 * Untested printed effects must stay GATED from Classic battles, not downgraded
 * to vanilla attacks or blank trainer actions. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGDiamondPearl=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET={id:'dp1',name:'Diamond & Pearl',series:'Diamond & Pearl',releaseDate:'2007-05-01',cardCount:130};
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Dialga|P|Basic|90|M||R+20|P-20|2|Rare Holo|Time Bellow~M~10;Flash Cannon~MMC~40|
2|Dusknoir|P|Stage 2|120|P|Dusclops|D+30|C-20|3|Rare Holo|Hard Feelings~PPC~|Dark Palm~Poké-Power
3|Electivire|P|Stage 1|100|L|Electabuzz|F+20|M-20|3|Rare Holo|Giga Impact~LLLC~60|Intense Voltage~Poké-Power
4|Empoleon|P|Stage 2|130|W|Prinplup|L+30||2|Rare Holo|Ice Blade~WC~;Aqua Jet~WWC~70|
5|Infernape|P|Stage 2|100|R|Monferno|W+30||0|Rare Holo|Meteor Punch~C~30×;Flare Blitz~RR~90|
6|Lucario|P|Stage 1|90|F|Riolu|P+20||1|Rare Holo|Feint~C~30;Aura Sphere~FF~40|
7|Luxray|P|Stage 2|120|L|Luxio|F+30|M-20|1|Rare Holo|Lightning Star~LLLL~80|Gleam Eyes~Poké-Power
8|Magnezone|P|Stage 2|120|M|Magneton|R+30|P-20|4|Rare Holo|Metal Blast~MCC~50+|Magnetize~Poké-Body
9|Manaphy|P|Basic|70|W||L+20||1|Rare Holo|Call for Family~C~;Aqua Ring~WW~30|
10|Mismagius|P|Stage 1|90|P|Misdreavus|D+20|C-20|1|Rare Holo|Avenge~P~;Psywave~PPC~30+|
11|Palkia|P|Basic|90|W||L+20||2|Rare Holo|Spacial Rend~W~10;Transback~WWC~40|
12|Rhyperior|P|Stage 2|140|F|Rhydon|W+30|L-20|4|Rare Holo|Rock Wrecker~FFC~80|Earth Fissure~Poké-Power
13|Roserade|P|Stage 1|90|G|Roselia|R+20||1|Rare Holo|Poison Sting~GG~30;Spike Whip~GGC~50|
14|Shiftry|P|Stage 2|120|D|Nuzleaf|F+30|P-20|2|Rare Holo|Spirit Dance~DDC~50+|Darkness Fan~Poké-Power
15|Skuntank|P|Stage 1|90|D|Stunky|F+20|P-20|1|Rare Holo|Frustration~DD~;Toxic Cloud~DDC~30|
16|Staraptor|P|Stage 2|100|C|Staravia|L+30|F-20|0|Rare Holo|Accelerative Dive~C~30;Brave Heart~CCCC~100|
17|Torterra|P|Stage 2|140|G|Grotle|R+30||4|Rare Holo|Body Slam~CCC~30;Leaf Storm~GGCC~60|
18|Azumarill|P|Stage 1|80|W|Marill|L+20||2|Rare|Defense Curl~C~;Bubble Pump~WW~40+|
19|Beautifly|P|Stage 2|100|G|Silcoon|R+20|F-20|1|Rare|Whirlwind~CC~30;Giga Drain~GGCC~50|
20|Bibarel|P|Stage 1|100|C|Bidoof|F+20||2|Rare|Rest~C~;Take Down~CCC~60|
21|Carnivine|P|Basic|70|G||R+20|W-20|1|Rare|Swallow Up~GC~30;Wring Out~GG~20|
22|Clefable|P|Stage 1|90|C|Clefairy|F+20||2|Rare|Double Slap~CC~30×;Metronome~CCC~|
23|Drapion|P|Stage 1|100|P|Skorupi|P+20||3|Rare|Stomp~CC~20+;Poison Claws~PPC~50|
24|Drifblim|P|Stage 1|80|P|Drifloon|D+20|C-20|0|Rare|Wind Wave~C~;Explosive Smoke~PPP~60|
25|Dustox|P|Stage 2|120|G|Cascoon|R+30||2|Rare|Stun Spore~GC~30;Toxic Dust~GGCC~50|
26|Floatzel|P|Stage 1|90|W|Buizel|L+20||1|Rare|Screw Tail~WC~30;Water Gun~WW~40+|
27|Gengar|P|Stage 2|110|P|Haunter|D+30|C-20|1|Rare|Life Drain~C~;Shadow Dance~PPC~|
28|Heracross|P|Basic|80|G||R+20||2|Rare|Pitch~C~10;Horn Slash~GG~30+|
29|Hippowdon|P|Stage 1|110|F|Hippopotas|W+20|L-20|3|Rare|Vacuum Up~FCC~40;Sand Eject~FFCC~60|
30|Lopunny|P|Stage 1|80|C|Buneary|F+20||1|Rare|Healing Wish~C~;Flop~CCC~30|
31|Machamp|P|Stage 2|130|F|Machoke|P+30||3|Rare|Revenge~F~20+;Dynamic Punch~FFF~60+|
32|Medicham|P|Stage 1|90|F|Meditite|P+20||2|Rare|Force Palm~F~;Spinning Kick~FFC~80|
33|Munchlax|P|Basic|60|C||F+10||2|Rare|Heave~C~30×|Baby Evolution~Poké-Power
34|Noctowl|P|Stage 1|90|C|Hoothoot|L+20|F-20|1|Rare|See Beyond~C~;Extrasensory~CCC~30+|
35|Pachirisu|P|Basic|70|L||F+20|M-20|1|Rare|Minor Errand-Running~C~;Thunder Jolt~L~20|
36|Purugly|P|Stage 1|90|C|Glameow|F+20||1|Rare|High Hat~C~;Body Slam~CCCC~50|
37|Snorlax|P|Basic|100|C||F+20||4|Rare|Block~C~;Ease Up~CCCC~40+|
38|Steelix|P|Stage 1|110|M|Onix|R+20|P-20|4|Rare|Slam~M~30×;Metal Slash~MMCC~100|
39|Vespiquen|P|Stage 1|100|G|Combee|R+20|F-20|3|Rare|Leaf Honey~G~;Attack Order~GCC~10×|
40|Weavile|P|Stage 1|80|D|Sneasel|F+20|P-20|1|Rare|Nasty Plot~D~;Dark Pulse~DDD~10×|
41|Wobbuffet|P|Basic|80|P||P+20||3|Rare|Countercharge~PC~|
42|Wynaut|P|Basic|40|P||P+10||1|Rare|Astonish~~|Baby Evolution~Poké-Power
43|Budew|P|Basic|40|G||R+10||1|Uncommon|Errand-Running~~|Baby Evolution~Poké-Power
44|Cascoon|P|Stage 1|80|G|Wurmple|R+20||3|Uncommon|Harden~G~;Gooey Thread~GC~20|
45|Cherrim|P|Stage 1|80|G|Cherubi|R+20|W-20|2|Uncommon|Worry Seed~G~20;Magical Leaf~GG~20+|
46|Drifloon|P|Basic|60|P||D+10|C-20|1|Uncommon|Blowing Wind~P~;Ominous Wind~PC~10|
47|Dusclops|P|Stage 1|80|P|Duskull|D+20|C-20|2|Uncommon|Roam~PC~;Gravity Wave~PP~30|
48|Elekid|P|Basic|40|L||F+10|M-20|1|Uncommon|Outlet~~|Baby Evolution~Poké-Power
49|Grotle|P|Stage 1|90|G|Turtwig|R+20|W-20|3|Uncommon|Synthesis~G~;Cut~GCC~50|
50|Haunter|P|Stage 1|70|P|Gastly|D+20|C-20|0|Uncommon|Hypnosis~P~;Dream Eater~PP~60|
51|Hippopotas|P|Basic|60|F||W+10|L-20|2|Uncommon|Yawn~C~;Sand Attack~F~10|
52|Luxio|P|Stage 1|80|L|Shinx|F+20|M-20|0|Uncommon|Fasten Claws~C~10+;Thunder Fang~LL~30|
53|Machoke|P|Stage 1|80|F|Machop|P+20||2|Uncommon|Karate Chop~FC~40-;Seismic Toss~FFC~60|
54|Magneton|P|Stage 1|70|M|Magnemite|R+20|P-20|2|Uncommon|Tri Attack~CC~20×;Magnetic Ray~MCC~40|
55|Mantyke|P|Basic|40|W||L+10|F-20|1|Uncommon|Call for Friends~~|Baby Evolution~Poké-Power
56|Monferno|P|Stage 1|70|R|Chimchar|W+20||0|Uncommon|Flame Dance~R~30;Fury Swipes~CC~20×|
57|Nuzleaf|P|Stage 1|80|D|Seedot|F+20|P-20|1|Uncommon|Dirty Trick~D~;Razor Wind~DD~40|
58|Prinplup|P|Stage 1|80|W|Piplup|L+20||1|Uncommon|Aqua Shower~W~;Brine~WW~|
59|Rapidash|P|Stage 1|80|R|Ponyta|W+20||0|Uncommon|Overrun~CC~20;Blaze Up~RRC~50|
60|Rhydon|P|Stage 1|90|F|Rhyhorn|W+20|L-20|2|Uncommon|Storm Up~FC~30+;Crash Impact~FFC~60|
61|Riolu|P|Basic|60|F||P+10||1|Uncommon|Wild Kick~F~30|
62|Seaking|P|Stage 1|80|W|Goldeen|L+20||1|Uncommon|Flail~CC~10×;Horn Drill~WW~50|
63|Silcoon|P|Stage 1|80|G|Wurmple|R+20||3|Uncommon|Harden~G~;Entangling String~GC~20|
64|Staravia|P|Stage 1|70|C|Starly|L+20|F-20|0|Uncommon|Whirlwind~CC~20;Clutch~CC~20|
65|Unown [A]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~10|ANALYZE~Poké-Power
66|Unown [B]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~10|BOUNCE~Poké-Power
67|Unown [C]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~10|CALL~Poké-Power
68|Unown [D]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~10|DRAW~Poké-Power
69|Azurill|P|Basic|40|C||F+10||1|Common|Delivery~~|Baby Evolution~Poké-Power
70|Bidoof|P|Basic|50|C||F+10||1|Common|Amnesia~C~;Scavenge~C~|
71|Bonsly|P|Basic|40|F||G+10||1|Common|Fake Tears~~|Baby Evolution~Poké-Power
72|Buizel|P|Basic|60|W||L+10||1|Common|Splash About~W~10+|
73|Buneary|P|Basic|50|C||F+10||1|Common|Splash~C~10;Jump Kick~CC~10|
74|Chatot|P|Basic|60|C||L+10|F-20|1|Common|Me First~C~;Tone-Deaf~C~10|
75|Cherubi|P|Basic|50|G||R+10|W-20|1|Common|Sleep Powder~G~;Leech Seed~GC~20|
76|Chimchar|P|Basic|50|R||W+10||1|Common|Scratch~~10;Ember~RC~30|
77|Clefairy|P|Basic|60|C||F+10||1|Common|Sing~C~;Moon Impact~CC~20+|
78|Cleffa|P|Basic|40|C||F+10||1|Common|Eeek~~|Baby Evolution~Poké-Power
79|Combee|P|Basic|50|G||R+10|F-20|1|Common|Soliciting Nectar~G~;Gust~CC~20|
80|Duskull|P|Basic|50|P||D+10|C-20|1|Common|Disable~C~;Night Shade~PC~20|
81|Electabuzz|P|Basic|70|L||F+10|M-20|2|Common|Thunderpunch~LC~30+;Shock Wave~LL~20|
82|Gastly|P|Basic|50|P||D+10|C-20|1|Common|Pain Payback~P~|
83|Glameow|P|Basic|50|C||F+10||1|Common|Charm~C~;Pose~CC~30|
84|Goldeen|P|Basic|60|W||L+10||1|Common|Horn Attack~C~10;Take Down~WC~30|
85|Hoothoot|P|Basic|50|C||L+10|F-20|1|Common|Hypnosis~C~;Kick Shot~CC~30|
86|Machop|P|Basic|60|F||P+10||2|Common|Low Kick~F~20|
87|Magnemite|P|Basic|50|M||R+10|P-20|1|Common|Metal Sound~M~;Resonance~MC~20+|
88|Marill|P|Basic|60|W||L+10||1|Common|Rollout~C~10+;Splashing Turn~WW~20|
89|Meditite|P|Basic|50|F||P+10||1|Common|Detect~F~;Meditate~FC~10+|
90|Mime Jr.|P|Basic|40|P||P+10||1|Common|Mime~P~|Baby Evolution~Poké-Power
91|Misdreavus|P|Basic|60|P||D+10|C-20|1|Common|Astonish~C~;Confuse Ray~PC~20|
92|Onix|P|Basic|90|F||G+20||3|Common|Tunneling~F~;Headbutt~CC~20|
93|Piplup|P|Basic|60|W||L+10||1|Common|Peck~~10;Water Splash~WC~20+|
94|Ponyta|P|Basic|60|R||W+10||1|Common|Tackle~C~10;Flame Tail~RR~30|
95|Rhyhorn|P|Basic|60|F||W+10|L-20|2|Common|Horn Attack~C~10;Take Down~FC~30|
96|Roselia|P|Basic|70|G||R+10||1|Common|Toxic Spikes~G~;Sweet Spike~GG~10|
97|Seedot|P|Basic|50|G||R+10|W-20|1|Common|Bide~C~;Rollout~CC~20|
98|Shinx|P|Basic|60|L||F+10|M-20|1|Common|Spark~L~10|
99|Skorupi|P|Basic|60|P||P+10||2|Common|Poison Sting~P~;Pin Missile~CC~10×|
100|Sneasel|P|Basic|60|D||F+10|P-20|1|Common|Double Slap~C~10×;Feint Attack~DC~|
101|Starly|P|Basic|50|C||L+10|F-20|1|Common|Gust~C~10;Quick Attack~CC~10+|
102|Stunky|P|Basic|60|D||F+10|P-20|1|Common|Scratch~C~10;Severe Gas~DC~10|
103|Turtwig|P|Basic|60|G||R+10|W-20|2|Common|Tackle~~10;Razor Leaf~G~20|
104|Wurmple|P|Basic|50|G||R+10||1|Common|Needling Sting~C~10+;String Shot~G~10|
105|Double Full Heal|T|Item||||||0|Uncommon||
106|Energy Restore|T|Item||||||0|Uncommon||
107|Energy Switch|T|Item||||||0|Uncommon||
108|Night Pokémon Center|T|Item||||||0|Uncommon||
109|PlusPower|T|Item||||||0|Uncommon||
110|Poké Ball|T|Item||||||0|Uncommon||
111|Pokédex HANDY910is|T|Item||||||0|Uncommon||
112|Professor Rowan|T|Supporter||||||0|Uncommon||
113|Rival|T|Supporter||||||0|Uncommon||
114|Speed Stadium|T|Stadium||||||0|Uncommon||
115|Super Scoop Up|T|Item||||||0|Uncommon||
116|Warp Point|T|Item||||||0|Uncommon||
117|Energy Search|T|Item||||||0|Common||
118|Potion|T|Item||||||0|Common||
119|Switch|T|Item||||||0|Common||
120|Empoleon LV.X|P|Level-Up|140|W|Empoleon|L+30||2|Rare Holo LV.X|Hydro Impact~WWW~|Supreme Command~Poké-Power
121|Infernape LV.X|P|Level-Up|120|R|Infernape|W+30||0|Rare Holo LV.X|Flare Up~RR~150|Burning Head~Poké-Power
122|Torterra LV.X|P|Level-Up|160|G|Torterra|R+30||4|Rare Holo LV.X|Vigorous Dash~GGGC~100|Forest Murmurs~Poké-Power
123|Grass Energy|E|Basic||||||0|Common||
124|Fire Energy|E|Basic||||||0|Common||
125|Water Energy|E|Basic||||||0|Common||
126|Lightning Energy|E|Basic||||||0|Common||
127|Psychic Energy|E|Basic||||||0|Common||
128|Fighting Energy|E|Basic||||||0|Common||
129|Darkness Energy|E|Basic||||||0|Common||
130|Metal Energy|E|Basic||||||0|Common||`;
const DATA=RAW.split('\n').map(line=>line.split('|'));
// Explicit printed rules for the fully implemented first batch. Other prints
// retain their exact collector/art identity but are not battle-eligible.
const PRINTS={
  23:['Flip a coin. If heads, this attack does 20 damage plus 20 more damage.','The Defending Pokémon is now Poisoned.'],
  61:['Flip a coin. If tails, this attack does nothing.'],
  76:['','Flip a coin. If tails, discard a Fire Energy attached to Chimchar.'],
  28:['Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.','Flip a coin. If heads, this attack does 30 damage plus 30 more damage.'],
  74:['Draw a card.','Flip a coin. If heads, the Defending Pokémon is now Confused.'],
  84:['','Goldeen does 10 damage to itself.'],
  85:['The Defending Pokémon is now Asleep.','Flip a coin. If tails, this attack does nothing.'],
  86:[''],93:['','Flip a coin. If heads, this attack does 20 damage plus 10 more damage.'],94:['',''],
  95:['','Rhyhorn does 10 damage to itself.'],
  99:['Flip a coin. If heads, the Defending Pokémon is now Poisoned.','Flip 4 coins. This attack does 10 damage times the number of heads.'],
  101:['','Flip a coin. If heads, this attack does 10 damage plus 20 more damage.'],
  102:['','The Defending Pokémon is now Poisoned.'],103:['',''],
  104:['Flip a coin. If heads, this attack does 10 damage plus 10 more damage.','Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'],
  19:['Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.','After your attack, remove from Beautifly the number of damage counters equal to the damage you did to the Defending Pokémon.'],
  25:['Flip a coin. If heads, the Defending Pokémon is now Paralyzed.','The Defending Pokémon is now Poisoned. Put 2 damage counters instead of 1 on the Defending Pokémon between turns.'],
  44:['During your opponent\'s next turn, if Cascoon would be damaged by an attack, prevent that attack\'s damage done to Cascoon if that damage is 30 or less.','The Defending Pokémon can\'t retreat during your opponent\'s next turn.'],
  45:['Flip a coin. If heads, the Defending Pokémon is now Confused.','Flip a coin. If heads, this attack does 20 damage plus 20 more damage and remove 3 damage counters from Cherrim.'],
  52:['Flip a coin. If heads, this attack does 10 damage plus 30 more damage.','Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'],
  56:['Search your discard pile for a Fire Energy card and attach it to Monferno.','Flip 3 coins. This attack does 20 damage times the number of heads.'],
  59:['Does 10 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)','Flip a coin. If tails, discard a Fire Energy attached to Rapidash and this attack does 10 damage to each of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)'],
  62:['Does 10 damage times the number of damage counters on Seaking.',''],
  63:['During your opponent\'s next turn, if Silcoon would be damaged by an attack, prevent that attack\'s damage done to Silcoon if that damage is 30 or less.','Flip a coin. If heads, the Defending Pokémon can\'t attack during your opponent\'s next turn.'],
  64:['Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.','The Defending Pokémon can\'t retreat during your opponent\'s next turn.'],
  73:['','Does 10 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)'],
  75:['The Defending Pokémon is now Asleep.','If this attack does any damage to the Defending Pokémon (after applying Weakness and Resistance), remove 1 damage counter from Cherubi.'],
  83:['During your opponent\'s next turn, any damage done by attacks from the Defending Pokémon is reduced by 20 (before applying Weakness and Resistance).','Flip a coin. If tails, this attack does nothing.'],
  87:['Flip a coin. If heads, the Defending Pokémon is now Confused.','If the Defending Pokémon is Confused, this attack does 20 damage plus 20 more damage.'],
  89:['Flip a coin. If heads, prevent all effects of an attack, including damage, done to Meditite during your opponent\'s next turn.','Does 10 damage plus 10 more damage for each damage counter on the Defending Pokémon.'],
  97:['Flip a coin. If heads, during your opponent\'s next turn, if Seedot would be Knocked Out by damage from an attack, Seedot is not Knocked Out and its remaining HP becomes 10 instead.',''],
  98:['Does 10 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)'],
  72:['If Buizel has less Energy attached to it than the Defending Pokémon, this attack does 10 damage plus 10 more damage.'],
  82:['Move 1 damage counter from Gastly to 1 of your opponent\'s Pokémon.']
};
const noop={type:'noop'},status=s=>({type:'status',target:'opponentActive',status:s});
const lock=(action,target='opponentActive')=>({type:'lock',target,action,duration:'opponentTurn'});
const benchHit=(amount)=>({type:'benchDamage',side:'opponent',amount});
const seq=(...effects)=>({type:'sequence',effects});
const guard={type:'preventDamage',target:'self',duration:'opponentTurn',maxDamage:30};
const flip=(heads,tails=noop)=>({type:'coinFlip',heads,tails});
const extra=n=>({type:'bonusDamage',amount:n});
const EFFECTS={
  23:[flip(extra(20)),status('poison')],
  61:[{type:'coinAttackGate',heads:noop}],
  76:[noop,flip(noop,{type:'discardEnergy',target:'self',energyType:'Fire',amount:1})],
  28:[{type:'forceOpponentSwitch'},flip(extra(30))],
  74:[{type:'draw',amount:1},flip(status('confusion'))],
  84:[noop,{type:'selfDamage',amount:10}],
  85:[status('sleep'),{type:'coinAttackGate',heads:noop}],
  86:[noop],93:[noop,flip(extra(10))],94:[noop,noop],
  95:[noop,{type:'selfDamage',amount:10}],
  99:[flip(status('poison')),{type:'coinDamage',coins:4,amount:10,mode:'replace'}],
  101:[noop,flip(extra(20))],102:[noop,status('poison')],103:[noop,noop],
  104:[flip(extra(10)),flip(status('paralysis'))],
  19:[{type:'forceOpponentSwitch'},{type:'drain'}],
  25:[flip(status('paralysis')),{type:'status',target:'opponentActive',status:'poison',amount:20}],
  44:[guard,lock('retreat')],
  45:[flip(status('confusion')),flip(seq(extra(20),{type:'healSelf',amount:30}))],
  52:[flip(extra(30)),flip(status('paralysis'))],
  56:[{type:'attachEnergyFromDiscard',target:'self',energyType:'Fire',amount:1},{type:'coinDamage',coins:3,amount:20,mode:'replace'}],
  59:[benchHit(10),flip(noop,seq({type:'discardEnergy',target:'self',amount:1,energyType:'Fire'}, {type:'benchDamage',side:'opponent',amount:10,all:true}))],
  62:[{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},noop],
  63:[guard,flip(lock('attack'))],
  64:[{type:'forceOpponentSwitch'},lock('retreat')],
  73:[noop,benchHit(10)],
  75:[status('sleep'),{type:'drain',amount:10}],
  83:[{type:'modifier',stat:'attackDamage',amount:-20,scope:'opponentActive',duration:'opponentTurn'},{type:'coinAttackGate',heads:noop}],
  87:[flip(status('confusion')),{type:'statusDamage',status:'confusion',amount:20}],
  89:[flip({type:'preventDamage',target:'self',duration:'opponentTurn',preventEffects:true}),{type:'damageFromDamage',source:'opponent',amount:1}],
  97:[flip({type:'koGuard',target:'self',duration:'opponentTurn',mode:'survive',remainingHp:10}),noop],
  98:[benchHit(10)],
  72:[{type:'neoRule',rule:'dp1:72:splashAbout'}],
  82:[{type:'chooseTarget',target:'opponentPokemon',chooser:'owner',effect:{type:'moveDamage',target:'self',destination:'opponentPokemon',amount:10}}]
};
// Trainer wording checked against the individual dp1 printed-card records.
// Rule text below is catalogue data even when an effect is still gated.
const TRAINER_TEXT={
 105:'Remove all Special Conditions from each of your Active Pokémon.',
 106:'Flip 3 coins. For each heads, put a basic Energy card from your discard pile into your hand. If you don\'t have that many basic Energy cards in your discard pile, put all of them into your hand.',
 107:'Move a basic Energy card attached to 1 of your Pokémon to another of your Pokémon.',
 108:'Choose 1 of your Pokémon. Flip 2 coins. If both are heads, remove all damage counters from that Pokémon. If both are tails, discard all Energy cards attached to that Pokémon.',
 109:'Attach PlusPower to 1 of your Pokémon. Discard this card at the end of your turn. If the Pokémon PlusPower is attached to attacks, the attack does 10 more damage to the Active Pokémon (before applying Weakness and Resistance).',
 110:'Flip a coin. If heads, search your deck for a Pokémon, show it to your opponent, and put it into your hand. Shuffle your deck afterward.',
 111:'Look at the top 2 cards of your deck, choose 1 of them, and put it into your hand. Put the other card on the bottom of your deck.',
 112:'You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. Choose 1 card in your hand and shuffle the rest of your cards into your deck. Then, draw 4 cards. (If this is the only card in your hand, you can\'t play this card.)',
 113:'You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. Reveal the top 5 cards of your deck. Your opponent chooses 3 of those cards. Put those cards into your hand and put other 2 cards on top of your deck. Shuffle your deck afterward.',
 114:'This card stays in play when you play it. Discard this card if another Stadium card comes into play. If another card with the same name is in play, you can\'t play this card. Once during each player\'s turn, the player may flip a coin until he or she gets tails. For each heads, that player draws a card.',
 115:'Flip a coin. If heads, return 1 of your Pokémon and all cards attached to it to your hand.',
 116:'Your opponent switches 1 of his or her Defending Pokémon with 1 of his or her Benched Pokémon, if any. You switch 1 of your Active Pokémon with 1 of your Benched Pokémon, if any.',
 117:'Search your deck for a basic Energy card, show it to your opponent, and put it into your hand. Shuffle your deck afterward.',
 118:'Remove 2 damage counters from 1 of your Pokémon (remove 1 damage counter if that Pokémon has only 1).',
 119:'Switch 1 of your Active Pokémon with 1 of your Benched Pokémon.'
};
const TRAINER_EFFECTS={
 105:{type:'removeStatuses',target:'selfActive',statuses:['sleep','paralysis','confusion','poison','burn']},
 110:flip({type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon'}}),
 117:{type:'neoRule',rule:'ex1:basicSearch1'},
 118:{type:'heal',target:'selfPokemon',amount:20},
 119:{type:'switch',side:'self'}
};
const RULES_LVX='Put this card onto your Active Pokémon of the named species. A Pokémon LV.X retains attacks, Poké-Powers and Poké-Bodies from its previous level.';
const READY=new Set([...Object.keys(EFFECTS).map(Number),...Object.keys(TRAINER_EFFECTS).map(Number)]);
function parse(row){
 const [num,name,kind,stage,hp,code,from,weak,resist,retreat,rarity,moveSpecs,powerSpecs]=row;
 const n=Number(num),id='dp1-'+n,ready=READY.has(n)||kind==='E';
 const card={id,setId:'dp1',number:String(n),name,kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy',source:'tcg',battleFormat:'classic',rarity,
  image:`https://images.pokemontcg.io/dp1/${n}.png`,imageLarge:`https://images.pokemontcg.io/dp1/${n}_hires.png`};
 if(kind==='P'){
  const attacks=moveSpecs.split(';').filter(Boolean).map((s,i)=>{const [attackName,cost,damageText='']=s.split('~');return {
    name:attackName,cost,damage:Number((damageText.match(/^\d+/)||[])[0]||0),damageText:damageText||null,
    text:PRINTS[n]?.[i]??'See the original card for the printed attack effect.',
    effect:EFFECTS[n]?.[i]||{type:'noop'}};});
  const abilities=powerSpecs.split(';').filter(Boolean).map(s=>{const [power,type]=s.split('~');return {
    name:power,type:type?.includes('Power')?'activated':'passive',printedPowerType:type?.includes('Power')?'power':'body',
    text:'See the printed card. This ability is not yet battle-enabled.',effect:{type:'noop'}};});
  const parseModifier=s=>s?{type:T[s[0]],value:s.slice(1)}:null;
  const w=parseModifier(weak),r=parseModifier(resist);
  Object.assign(card,{stage,hp:Number(hp),types:code.split('').map(x=>T[x]),subtype:T[code[0]],
    retreat:Number(retreat||0),evolvesFrom:from||null,weakness:w?.type||null,weaknessValue:w?.value||null,
    weaknesses:w?[w]:[],resistance:r?.type||null,resistanceValue:r?.value||null,resistances:r?[r]:[],
    attacks,abilities,isLevelX:stage==='Level-Up',levelUpFrom:stage==='Level-Up'?from:null,
    text:stage==='Level-Up'?RULES_LVX:undefined});
 }else if(kind==='T'){
  Object.assign(card,{trainerType:stage,text:TRAINER_TEXT[n]||'See the printed card for rules.',
    effect:TRAINER_EFFECTS[n]||{type:'noop'}});
 }else{
  const energyType=T['GRWLPFDM'[n-123]];
  Object.assign(card,{basicEnergy:true,specialEnergy:false,subtype:energyType,types:[energyType],effect:{type:'noop'},
    deckEligible:false,text:`Provides one ${energyType} Energy. LuckyDex Classic uses an ordered Basic Energy Zone.`});
 }
 const fullPrint=[...(card.attacks||[]).map(a=>a.text),...(card.abilities||[]).map(a=>a.text),card.text||''].join(' ').toLowerCase();
 const energyTypes=[...new Set((card.attacks||[]).flatMap(a=>[...a.cost].filter(c=>c!=='C').map(c=>T[c])))];
 const inflicts=['sleep','poison','confusion','paralysis','burn'].filter(s=>fullPrint.includes(s==='sleep'?'asleep':s==='paralysis'?'paralyzed':s==='confusion'?'confused':s==='burn'?'burned':'poisoned'));
 const roles=new Set();if(/draw/.test(fullPrint))roles.add('draw');if(/search your deck/.test(fullPrint))roles.add('search');if(inflicts.length)roles.add('status');
 if(/return.*energy|attach.*energy|move.*energy/.test(fullPrint))roles.add('energy-acceleration');
 const payoff=[];
 card.deckMeta={roles:[...roles],synergy:[...roles],energyTypes,preferredEnergyTypes:[],inflicts,payoffs:payoff,
   preferredPartners:[],conditionalAttackEnergyTypes:[],stage2ExSupport:null,requiresTools:[]};
 // NO unverified attack, LV.X mechanic, Power or trainer enters CPU / Test Lab.
 return Object.freeze({...card,battleEnabled:ready,deckEligible:ready&&card.deckEligible!==false,
  support:{status:ready?'FULL':'PARTIAL',reasons:ready?[]:['Printed interactions not yet fully implemented/tested']}});
}
const CARDS=Object.freeze(DATA.map(parse));
const MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,coverage:()=>({total:CARDS.length,
  battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
