/* LuckyDex Classic TCG — Diamond & Pearl: Mysterious Treasures (dp2).
 * 124 unique collector-number prints (123/123 + Time-Space Distortion 124).
 * Historical printed metadata: PokemonTCG/pokemon-tcg-data cards/en/dp2.json.
 * All 124 collector prints now have modeled Classic battle effects and
 * may be used in CPU decks and the Test Lab.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGMysteriousTreasures=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET={id:'dp2',name:'Mysterious Treasures',series:'Diamond & Pearl',releaseDate:'2007-08-01',cardCount:124,printedTotal:123};
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Aggron|P|Stage 2|130|M|Lairon|R+40|P-20|4|Rare Holo|Heap Up~CC~40+;Hard Metal~MMMM~60+|
2|Alakazam|P|Stage 2|100|P|Kadabra|P+30||1|Rare Holo|Psychic Guard~PPC~50|Power Cancel~Poké-Power
3|Ambipom|P|Stage 1|80|C|Aipom|F+20||1|Rare Holo|Tail Influence~CC~30;Charity Tail~CC~80|
4|Azelf|P|Basic|60|P||P+20||1|Rare Holo|Bind Pulse~P~10|Downer Material~Poké-Body
5|Blissey|P|Stage 1|130|C|Chansey|F+30||3|Rare Holo|Happy Chance~C~20+|Kind Egg~Poké-Power
6|Bronzong|P|Stage 1|90|M|Bronzor|R+30|P-20|3|Rare Holo|Shady Stamp~MMC~50|Miracle Oracle~Poké-Power
7|Celebi|P|Basic|60|G||R+20||1|Rare Holo|Sprouting~~;Leaf Tornado~GG~30|
8|Feraligatr|P|Stage 2|130|W|Croconaw|L+30||2|Rare Holo|Energy Cyclone~WW~20×;Breaking Tail~WCC~60|
9|Garchomp|P|Stage 2|130|C|Gabite|C+30||0|Rare Holo|Dragon Fang~CCC~70|Rainbow Scale~Poké-Body
10|Honchkrow|P|Stage 1|90|D|Murkrow|L+20|F-20|1|Rare Holo|Dark Wing Flaps~DDC~50|Dark Genes~Poké-Body
11|Lumineon|P|Stage 1|80|W|Finneon|L+20||1|Rare Holo|Reverse Stream~CC~30+|Lure Ring~Poké-Power
12|Magmortar|P|Stage 1|100|R|Magmar|W+30||3|Rare Holo|Smoke Bomb~RC~30;Flame Drum~RRC~80|
13|Meganium|P|Stage 2|130|G|Bayleef|R+30|W-20|2|Rare Holo|Ultra Powder~G~20;Fire Counterattack~GGC~60+|
14|Mesprit|P|Basic|60|P||P+20||1|Rare Holo|Teleportation Burst~PC~30|Upper Material~Poké-Body
15|Raichu|P|Stage 1|90|L|Pikachu|F+20|M-20|1|Rare Holo|Electromagnetic Induction~~;Explosive Thunder~LC~30×|
16|Typhlosion|P|Stage 2|110|R|Quilava|W+30||2|Rare Holo|Evaporating Heat~RRC~60|Firestarter~Poké-Power
17|Tyranitar|P|Stage 2|140|D|Pupitar|F+30|P-20|4|Rare Holo|Payback~DC~40+;Ground Burn~FFDD~80+|
18|Uxie|P|Basic|60|P||P+20||1|Rare Holo|Mind Off~P~10+|Memory Out~Poké-Power
19|Abomasnow|P|Stage 1|100|G|Snover|R+30||3|Rare|Heavy Blizzard~WCC~60|Glacier Snow~Poké-Body
20|Ariados|P|Stage 1|80|G|Spinarak|R+20||1|Rare|Offensive Needle~GC~20|Sticky~Poké-Body
21|Bastiodon|P|Stage 2|130|M|Shieldon|R+40|P-20|3|Rare|Anger Revenge~MMC~60|Protective Wall~Poké-Body
22|Chimecho|P|Basic|70|P||P+20||1|Rare|Call In~C~;Strange Bell~P~20|
23|Crobat|P|Stage 2|100|P|Golbat|P+30|F-20|0|Rare|Strike and Fade~PP~|Evolutionary Toxic~Poké-Power
24|Exeggutor|P|Stage 1|90|G|Exeggcute|R+20||2|Rare|String Bomb~C~30×;Nutritional Support~G~|
25|Glalie|P|Stage 1|90|W|Snorunt|M+20||2|Rare|Intimidation Pebble~WWC~50|Craggy Face~Poké-Body
26|Gyarados|P|Stage 1|120|W|Magikarp|L+30|F-20|3|Rare|Enrage~WWCC~80|Dragon DNA~Poké-Body
27|Kricketune|P|Stage 1|80|G|Kricketot|R+20||2|Rare|Sore Performance~CC~20;Concerto~GG~40+|
28|Manectric|P|Stage 1|80|L|Electrike|F+20|M-20|0|Rare|Lightning Twister~C~20×;Chain Lightning~LLL~70|
29|Mantine|P|Basic|80|W||L+20|F-20|1|Rare|Giant Wave~WW~50|Jumbo Fin~Poké-Body
30|Mr. Mime|P|Basic|70|P||P+20||1|Rare|Trick Play~PC~|Airy Wall~Poké-Body
31|Nidoqueen|P|Stage 2|120|P|Nidorina|P+30|L-20|2|Rare|Give Aid~PPC~90|Mother Pheromone~Poké-Body
32|Ninetales|P|Stage 1|80|R|Vulpix|W+20||1|Rare|Fire Blast~RR~60|Color Shift~Poké-Power
33|Rampardos|P|Stage 2|120|F|Cranidos|G+30||1|Rare|Assurance~FC~30;Hasty Headbutt~FFF~100|
34|Slaking|P|Stage 2|140|C|Vigoroth|F+30||4|Rare|Lazy Blow~CCCC~50|Energetic Impulse~Poké-Power
35|Sudowoodo|P|Basic|80|F||W×2||1|Rare|Sidestep~C~20;Persuade~FF~30|
36|Toxicroak|P|Stage 1|90|P|Croagunk|P+20||1|Rare|Knuckle Claws~PC~30|Poison Sacs~Poké-Body
37|Unown [I]|P|Basic|50|P||P+10||1|Rare|Hidden Power~C~|ITEM~Poké-Power
38|Ursaring|P|Stage 1|100|C|Teddiursa|F+20||2|Rare|Bad Temper~CC~30;Defensive Claw~CCCC~60+|
39|Walrein|P|Stage 2|130|W|Sealeo|M+30||3|Rare|Ice Bind~WWC~70|Freeze-up~Poké-Power
40|Whiscash|P|Stage 1|90|W|Barboach|G+30|L-20|3|Rare|Fury~WCC~20×;Magnitude~FCCC~60|
41|Bayleef|P|Stage 1|80|G|Chikorita|R+20|W-20|1|Uncommon|Evolution Impulse~C~;Leaf Boomerang~GC~30×|
42|Chingling|P|Basic|40|P||P+10||1|Uncommon|Inviting Bell~~|Baby Evolution~Poké-Power
43|Cranidos|P|Stage 1|70|F|Skull Fossil|G+20||1|Uncommon|Headbutt~C~20;Steamroll~FC~30|
44|Croconaw|P|Stage 1|80|W|Totodile|L+20||2|Uncommon|Hover Over~WC~30|Evolutionary Vitality~Poké-Power
45|Dewgong|P|Stage 1|90|W|Seel|M+20||2|Uncommon|Collapse~WWC~60|Cold Fat~Poké-Body
46|Dodrio|P|Stage 1|80|C|Doduo|L+20|F-20|0|Uncommon|Fury Attack~C~10×;Triple Pick~CCC~|
47|Dunsparce|P|Basic|60|C||F+10||1|Uncommon|Snake Hook~~;Bite and Run~~10|
48|Gabite|P|Stage 1|80|C|Gible|C+20||1|Uncommon|Gather Up~C~;Marvelous Shine~CC~|
49|Girafarig|P|Basic|70|C||P+20||1|Uncommon|Crane Neck~C~;Psybeam~CC~20|
50|Golbat|P|Stage 1|70|P|Zubat|P+20|F-20|0|Uncommon|Pulse Search~P~30|
51|Graveler|P|Stage 1|90|F|Geodude|G+20|L-20|3|Uncommon|Rock Cannon~FC~30×;Rock Slide~FCC~40|
52|Happiny|P|Basic|60|C||F+10||1|Uncommon|Lively~~|Baby Evolution~Poké-Power
53|Lairon|P|Stage 1|80|M|Aron|R+20|P-20|3|Uncommon|Mend~M~;Confront~MMC~50|
54|Magmar|P|Basic|70|R||W+20||2|Uncommon|Flare~R~20;Flamethrower~RRC~50|
55|Masquerain|P|Stage 1|70|G|Surskit|R+20|F-20|0|Uncommon|Centrifugal Force~CC~20×;Swirling Ripple~GG~30+|
56|Nidorina|P|Stage 1|80|P|Nidoran ♀|P+20||1|Uncommon|Rescue~C~;Scratch~PC~30|
57|Octillery|P|Stage 1|80|W|Remoraid|L+20||1|Uncommon|Crash Bomber~CC~30+;Aqua Liner~WW~|
58|Parasect|P|Stage 1|90|G|Paras|R+20||2|Uncommon|Wild Spores~G~20;Extend Fungus~GGC~60|
59|Pupitar|P|Stage 1|70|F|Larvitar|G+20|L-20|0|Uncommon|Pressurized Gas~CC~;Rocket Tackle~FCC~50|
60|Quilava|P|Stage 1|80|R|Cyndaquil|W+20||1|Uncommon|Fireworks~RC~40|
61|Sandslash|P|Stage 1|90|F|Sandshrew|W+20|L-20|1|Uncommon|Spike Armor~C~;Poison Spike~FFC~60|
62|Sealeo|P|Stage 1|80|W|Spheal|M+20||2|Uncommon|Ice Rider~WW~|
63|Shieldon|P|Stage 1|80|M|Armor Fossil|R+20|P-20|2|Uncommon|Hard Face~MC~20;Shield Attack~MCC~40+|
64|Tropius|P|Basic|80|G||R+20|F-20|1|Uncommon|Bonus Leaf~G~;Whirlwind~GC~30|
65|Unown [E]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~CC~|EQUIP~Poké-Power
66|Unown [M]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~|MAGNET~Poké-Power
67|Unown [T]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~|THROW~Poké-Power
68|Vigoroth|P|Stage 1|80|C|Slakoth|F+20||1|Uncommon|Wake-up Punch~C~10;Fury Swipes~CCC~30×|
69|Abra|P|Basic|50|P||P+10||1|Common|Play Search~P~;Ultra Evolution~PC~|
70|Aipom|P|Basic|60|C||F+10||1|Common|Tail Whap~C~10;Throw Off~CC~|
71|Aron|P|Basic|50|M||R+10|P-20|2|Common|Steel Tackle~MC~30|
72|Barboach|P|Basic|50|W||G+10|L-20|1|Common|Mud Spit~F~|
73|Bidoof|P|Basic|60|C||F+10||2|Common|Tackle~CC~30|
74|Bronzor|P|Basic|50|M||R+10|P-20|1|Common|Dull Light~MC~20|
75|Buizel|P|Basic|60|W||L+10||1|Common|Quick Attack~CC~10+|
76|Chansey|P|Basic|100|C||F+20||2|Common|Scrunch~CC~;Double-edge~CCCC~80|
77|Chikorita|P|Basic|50|G||R+10|W-20|1|Common|Sleep Scent~~;Jump On~G~10+|
78|Croagunk|P|Basic|60|P||P+10||1|Common|Ghastly Sound~C~;Finger Poke~PP~20|
79|Cyndaquil|P|Basic|60|R||W+10||1|Common|Tackle~~10;Live Coal~RC~20|
80|Doduo|P|Basic|60|C||L+10|F-20|1|Common|Double Stab~C~10×;Accelerating Stab~CC~30|
81|Electrike|P|Basic|60|L||F+10|M-20|1|Common|Electromagnetic Jam~L~10|
82|Exeggcute|P|Basic|60|G||R+10||1|Common|Direct-hit Bomb~G~|
83|Finneon|P|Basic|50|W||L+10||1|Common|Elegant Swim~W~;Tackle~CC~20|
84|Geodude|P|Basic|60|F||G+10|L-20|2|Common|Stone Throw~F~|
85|Gible|P|Basic|50|C||C+10||1|Common|Push Down~C~10|
86|Kricketot|P|Basic|60|G||R+10||2|Common|Call for Family~C~;Sling~G~10|
87|Larvitar|P|Basic|50|F||G+10|L-20|1|Common|Mountain Bite~F~10+;Hammer In~CC~20|
88|Magby|P|Basic|40|R||W+10||1|Common|Scorch~~|Baby Evolution~Poké-Power
89|Magikarp|P|Basic|30|W||L+10||1|Common|Flail~C~10×;Dragon Rage~WW~60|
90|Murkrow|P|Basic|60|D||L+10|F-20|1|Common|Swarm~~;Hide Crowd~CC~20|
91|Nidoran ♀|P|Basic|50|P||P+10||1|Common|Call for Family~C~;Poison Sting~PC~20|
92|Paras|P|Basic|60|G||R+10||1|Common|Scratch~C~10;Mushroom Tackle~GG~20|
93|Pichu|P|Basic|40|L||F+10|M-20|1|Common|Chupi~~20|Baby Evolution~Poké-Power
94|Pikachu|P|Basic|60|L||F+10|M-20|1|Common|BikaBika~LC~20+|Electro Recycle~Poké-Power
95|Remoraid|P|Basic|60|W||L+10||1|Common|Sharpshooting~W~;Numbing Water~WW~20|
96|Sandshrew|P|Basic|60|F||W+10|L-20|1|Common|Sand Attack~F~;Ram~FC~30|
97|Seel|P|Basic|60|W||M+10||2|Common|Freezing Headbutt~WC~10|
98|Shinx|P|Basic|60|L||F+10|M-20|1|Common|Plasma~L~10|
99|Slakoth|P|Basic|50|C||F+10||1|Common|Drowsy~C~|
100|Snorunt|P|Basic|50|W||M+10||1|Common|Collect~C~;Snowball~W~20|
101|Snover|P|Basic|60|G||R+10||2|Common|Curiosity~~;Snowball Fight~WC~30|
102|Spheal|P|Basic|50|W||M+10||2|Common|Rollout~C~10;Willpower~W~|
103|Spinarak|P|Basic|50|G||R+10||1|Common|Impound~C~;Double Scratch~GC~20×|
104|Surskit|P|Basic|50|G||R+10||1|Common|Sleep Inducer~G~|
105|Teddiursa|P|Basic|60|C||F+10||1|Common|Rest~C~;Sweet Palm~CC~30|
106|Totodile|P|Basic|50|W||L+10||1|Common|Bite~~10;Shining Fang~W~10+|
107|Vulpix|P|Basic|60|R||W+10||1|Common|Fire Soul~RR~20|
108|Zubat|P|Basic|50|P||P+10|F-20|1|Common|Supersonic~P~;Bite~CC~20|
109|Bebe's Search|T|Supporter||||||0|Uncommon||
110|Dusk Ball|T|Item||||||0|Uncommon||
111|Fossil Excavator|T|Supporter||||||0|Uncommon||
112|Lake Boundary|T|Stadium||||||0|Uncommon||
113|Night Maintenance|T|Item||||||0|Uncommon||
114|Quick Ball|T|Item||||||0|Uncommon||
115|Team Galactic's Wager|T|Supporter||||||0|Uncommon||
116|Armor Fossil|T|Item|50|||||0|Common||Armor Stone~Poké-Body
117|Skull Fossil|T|Item|50|||||0|Common||Skull Stone~Poké-Body
118|Multi Energy|E|Special||||||0|Rare||
119|Darkness Energy|E|Special||||||0|Uncommon||
120|Metal Energy|E|Special||||||0|Uncommon||
121|Electivire LV.X|P|Level-Up|120|L|Electivire|F×2|M-20|3|Rare Holo LV.X|Pulse Barrier~LC~50|Shocking Tail~Poké-Body
122|Lucario LV.X|P|Level-Up|110|F|Lucario|P×2||1|Rare Holo LV.X|Close Combat~FFC~80|Stance~Poké-Power
123|Magmortar LV.X|P|Level-Up|130|R|Magmortar|W×2||3|Rare Holo LV.X|Flame Bluster~RRRR~|Torrid Wave~Poké-Power
124|Time-Space Distortion|T|Item||||||0|Rare Secret||`;
const DATA=RAW.split('\n').map(line=>line.split('|'));
const noop={type:'noop'};
const coin=(heads,tails=noop)=>({type:'coinFlip',heads,tails});
const seq=(...effects)=>({type:'sequence',effects});
const status=(s,target='opponentActive')=>({type:'status',target,status:s});
const bench=(n)=>({type:'benchDamage',side:'opponent',amount:n});
const bonus=(n)=>({type:'bonusDamage',amount:n});
const lock=(action,target='opponentActive',duration='opponentTurn')=>({type:'lock',action,target,duration});
const custom=(n,action)=>({type:'neoRule',rule:'dp2:'+n+':'+action});
const search=(where,amount,filter)=>({type:'searchChosen',source:where,amount,filter});
const selfGuard=(amount=999)=>({type:'preventDamage',target:'self',duration:'opponentTurn',...(amount!==999?{maxDamage:amount}:{})});
const EFFECTS={
 // No invented move text or vanilla approximations: each enabled attack below is mapped to its effect.
 // Stage 2: selected printed effects, conditional evolution attacks and Level-Up cards.
 5:[custom(5,'happyChance')],
 6:[status('confusion')],
 9:[noop],
 11:[custom(11,'reverseStream')],
 14:[{type:'switch',side:'self'}],
 20:[coin(status('poison'),status('paralysis'))],
 29:[{type:'lock',action:'attack',attackName:'Giant Wave',target:'self',duration:'nextOwnTurn'}],
 31:[custom(31,'giveAid')],
 34:[custom(34,'lazyBlow')],
 66:[custom(66,'hiddenPower')],
 73:[noop],
 70:[noop,custom(70,'throwOff')],
 46:[{type:'coinDamage',coins:3,amount:10,mode:'replace'},custom(46,'triplePick')],
 1:[custom(1,'heapUp'),custom(1,'hardMetal')],
 8:[custom(8,'energyCyclone'),custom(8,'breakingTail')],
 19:[coin(bench(10))],
 25:[coin(seq({type:'actionLock',side:'opponent',cardType:'Trainer',duration:'opponentTurn'},{type:'actionLock',side:'opponent',cardType:'Supporter',duration:'opponentTurn'}))],
 32:[{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1}],
 44:[lock('retreat')],
 45:[status('sleep','self')],
 61:[custom(61,'spikeArmor'),custom(61,'poisonSpike')],
 87:[custom(87,'mountainBite'),noop],
 12:[{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},custom(12,'flameDrum')],
 7:[custom(7,'sprouting'),custom(7,'leafTornado')],
 24:[custom(24,'stringBomb'),custom(24,'nutritionalSupport')],
 68:[custom(68,'wakePunch'),{type:'coinDamage',coins:3,amount:30,mode:'replace'}],
 70:[noop,custom(70,'throwOff')],
 81:[custom(81,'electromagneticJam')],
 82:[custom(82,'directHitBomb')],
 102:[noop,custom(102,'willpower')],
 121:[custom(121,'pulseBarrier')],
 122:[{type:'modifier',stat:'damageTaken',target:'self',amount:30,duration:'opponentTurn'}],
 123:[custom(123,'flameBluster')],
 12:[{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},custom(12,'flameDrum')],
 7:[custom(7,'sprouting'),custom(7,'leafTornado')],
 13:[seq(coin(status('poison')),coin(status('burn')),coin(status('paralysis'))),custom(13,'counterattack')],
 22:[custom(22,'callIn'),custom(22,'strangeBell')],
 27:[status('sleep'),custom(27,'concerto')],
 28:[custom(28,'lightningTwister'),custom(28,'chainLightning')],
 33:[custom(33,'assurance'),seq({type:'selfDamage',amount:20},{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true})],
 35:[custom(35,'sidestep'),seq({type:'forceOpponentSwitch'},lock('retreat'))],
 38:[seq(status('confusion'),{type:'modifier',stat:'attackDamage',scope:'opponentActive',amount:60,duration:'opponentTurn'}),custom(38,'defensiveClaw')],
 40:[{type:'damageFromDamage',source:'self',amount:2,mode:'replace'},seq({type:'benchDamage',side:'opponent',all:true,amount:20},{type:'benchDamage',side:'self',all:true,amount:20})],
 41:[search('deck',1,{kind:'pokemon',stage:['Stage 1','Stage 2','Level-Up']}),{type:'coinDamage',coins:2,amount:30,mode:'replace'}],
 43:[noop,bench(20)],
 47:[{type:'draw',amount:1},{type:'switch',side:'self'}],
 48:[search('discard',2,{basicEnergy:true}),custom(48,'marvelousShine')],
 49:[search('deck',1,{kind:'trainer'}),coin(status('confusion'))],
 50:[{type:'revealHand',side:'opponent'}],
 51:[{type:'coinDamage',coins:'untilTails',amount:30,mode:'replace'},{type:'multiTargetDamage',target:'opponentBench',count:2,amount:10}],
 53:[custom(53,'mend'),noop],
 54:[noop,{type:'discardEnergyCard',target:'self',amount:1}],
 55:[custom(55,'centrifugal'),custom(55,'ripple')],
 56:[search('discard',2,{kind:'pokemon'}),noop],
 57:[custom(57,'crashBomber'),{type:'selectedDamage',target:'opponentBench',amount:40}],
 58:[custom(58,'wildSpores'),{type:'healSelf',amount:20}],
 59:[custom(59,'pressurizedGas'),seq({type:'selfDamage',amount:10},coin(selfGuard()))],
 60:[coin(noop,{type:'discardEnergyCard',target:'self',amount:1,energyType:'Fire'})],
 62:[{type:'selectedDamage',target:'opponentPokemon',amount:30}],
 63:[{type:'modifier',stat:'damageReduction',amount:20,scope:'self',duration:'opponentTurn'},coin(bonus(20))],
 64:[custom(64,'bonusLeaf'),{type:'forceOpponentSwitch'}],
 68:[custom(68,'wakePunch'),{type:'coinDamage',coins:3,amount:30,mode:'replace'}],
 70:[noop,custom(70,'throwOff')],
 71:[{type:'selfDamage',amount:10}],
 72:[custom(72,'mudSpit')],
 74:[coin(status('confusion'))],
 75:[coin(bonus(30))],
 76:[coin(selfGuard()),{type:'selfDamage',amount:60}],
 77:[coin(status('sleep')),coin(bonus(10))],
 78:[coin({type:'actionLock',side:'opponent',cardType:'Supporter',duration:'opponentTurn'}),coin(status('poison'))],
 79:[noop,noop],
 83:[coin({type:'preventDamage',target:'self',duration:'opponentTurn',preventEffects:true}),noop],
 84:[{type:'multiTargetDamage',target:'opponentBench',count:2,amount:10}],
 85:[{type:'forceOpponentSwitch'}],
 86:[{type:'benchFromDeck',amount:1,filter:{kind:'pokemon',stage:'Basic'}},noop],
 89:[{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},custom(89,'dragonRage')],
 90:[{type:'benchFromDeck',amount:1,filter:{name:'Murkrow'}},{type:'switch',side:'self'}],
 91:[custom(91,'callFamily'),coin(status('poison'))],
 92:[noop,coin(status('paralysis'))],
 95:[{type:'selectedDamage',target:'opponentPokemon',amount:10},coin(status('paralysis'))],
 96:[{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},noop],
 97:[coin(status('paralysis'))],
 98:[coin({type:'attachEnergyFromDiscard',target:'self',energyType:'Lightning',amount:1})],
 99:[seq(status('sleep','self'),status('sleep'))],
 100:[{type:'draw',amount:1},{type:'coinAttackGate',heads:noop}],
 101:[{type:'revealHand',side:'opponent'},coin(noop,{type:'selfDamage',amount:10})],
 103:[lock('retreat'),{type:'coinDamage',coins:2,amount:20,mode:'replace'}],
 104:[seq({type:'forceOpponentSwitch'},status('sleep'))],
 106:[noop,custom(106,'shiningFang')],
 107:[bench(10)],
 108:[coin(status('confusion')),noop],
};
// READY includes every print after the four-stage implementation work.

// Additional fully modeled no-Power and Baby Evolution attacks.
Object.assign(EFFECTS,{
  15:[custom(15,'electromagneticInduction'),custom(15,'explosiveThunder')],
  16:[{type:'discardEnergyCard',target:'opponentActive',energyType:'Water',amount:1}],
  17:[custom(17,'payback'),custom(17,'groundBurn')],
  42:[search('deck',1,{trainerType:'Supporter'})],
  52:[{type:'heal',target:'selfPokemon',amount:20}],
  69:[custom(69,'playSearch'),custom(69,'ultraEvolution')],
  80:[{type:'coinDamage',coins:2,amount:10,mode:'replace'},{type:'lock',action:'attack',attackName:'Accelerating Stab',target:'self',duration:'nextOwnTurn'}],
  82:[custom(82,'directHitBomb')],
  87:[custom(87,'mountainBite'),noop],
  88:[coin(status('burn'))],
  93:[{type:'coinAttackGate',heads:noop}],
  94:[coin(bonus(10))],
  105:[seq({type:'removeStatus',target:'self'}, {type:'healSelf',amount:20},status('sleep','self')),custom(105,'sweetPalm')],
});
const READY=new Set([
 5,6,9,11,14,20,29,31,34,46,66,70,73,
 1,7,8,12,19,24,25,32,44,45,61,68,81,82,87,102,121,122,123,
 13,22,27,28,33,35,38,40,41,47,48,49,50,51,53,54,55,56,57,58,59,60,62,63,64,71,72,74,75,76,77,78,79,83,84,85,86,89,90,91,92,95,96,97,98,99,100,101,103,104,106,107,108
]);

for(const n of [15,16,17,42,52,69,80,88,93,94,105])READY.add(n);
// Stage 4: the remaining 18 prints now have executable battle rules.
for(const n of [2,3,4,10,18,21,23,26,30,36,37,39,43,65,67,115,116,117])READY.add(n);
Object.assign(EFFECTS,{
 2:[custom(2,'psychicGuard')],
 3:[custom(3,'tailInfluence'),custom(3,'charityTail')],
 4:[custom(4,'bindPulse')],
 10:[custom(10,'darkWingFlaps')],
 18:[custom(18,'mindOff')],
 21:[custom(21,'angerRevenge')],
 23:[custom(23,'strikeAndFade')],
 26:[custom(26,'enrage')],
 30:[custom(30,'trickPlay')],
 36:[status('poison')],
 37:[custom(37,'hiddenPower')],
 39:[custom(39,'iceBind')],
 43:[noop,bench(20)],
 65:[custom(65,'hiddenPower')],
 67:[custom(67,'hiddenPower')]
});


const PRINTS={
 5:['Before dealing damage, optionally attach one Basic Energy from your discard to Blissey; +10 damage per attached Energy.'],
 6:['Confuse the Defending Pokémon.'],
 9:['70 damage. Rainbow Scale adds 40 if defender has Weakness to an Energy type attached to Garchomp, unless Garchomp has Special Energy.'],
 11:['30 damage plus 10 per attached Water Energy. Return all Water Energy on Lumineon to your hand.'],
 14:['Deal 30 damage. You may switch Mesprit with a Benched Pokémon.'],
 20:['Flip a coin: heads Poison, tails Paralyze the Defending Pokémon.'],
 29:['50 damage. Mantine cannot use Giant Wave next turn.'],
 31:['90 damage, reduced to 50 when you have the same or fewer Benched Pokémon than the opponent.'],
 34:['50 damage. Energetic Impulse can raise the base damage to 130 for this turn.'],
 66:['Flip a coin. Heads: deal 30 to the Defending Pokémon; tails: deal 30 to one of your Pokémon instead.'],
 73:['30 damage. Wacan Berry reduces damage from Lightning attackers by 20.'],
 70:['10 damage.','Choose one opposing Pokémon, discard its Pokémon Tools before dealing 20 damage to it.'],
 46:['Flip three coins, 10 damage per heads.','Choose up to three different evolved opposing Pokémon; deal 30 damage to each, ignoring Bench Weakness/Resistance.'],
 15:['Search your deck for up to 2 Lightning Energy and attach them to 1 of your Pokémon.', 'Discard all Basic Lightning Energy attached to Raichu; do 30 damage per discarded Energy.'],
 16:['Discard one Water Energy attached to the Defending Pokémon.'],
 17:['If the opponent has only 1 Prize left, do 40 extra damage and discard their top 3 deck cards.', 'Both players discard the top card of their decks. Do 20 extra damage for each Energy card discarded.'],
 42:['Search your deck for a Supporter and put it in your hand.'],
 52:['Heal 20 damage from one of your Pokémon.'],
 69:['Look at the top 5 cards of your deck, put one in your hand, then shuffle the deck.', 'Search your deck for Alakazam and evolve Abra directly.'],
 80:['Flip 2 coins; 10 damage for each heads.', 'Doduo cannot use Accelerating Stab on your next turn.'],
 82:['Flip one coin for each Energy attached to Exeggcute; choose a Pokémon and do 10 damage per heads.'],
 87:['Optionally discard the top card of your deck for +10 damage and put Larvitar to Sleep.', ''],
 88:['On heads the Defending Pokémon is now Burned.'],
 93:['On tails this attack does nothing.'],
 94:['On heads do 10 extra damage.'],
 105:['Remove all Special Conditions and heal 20 damage, then put Teddiursa to Sleep.', 'Heal 10 damage from the Defending Pokémon BEFORE dealing damage.'],
 13:['Flip three separate coins for Poison, Burn and Paralysis respectively.','If the opponent has any Fire Pokémon in play, do 30 more damage.'],
 22:['Draw one card; draw two more if Chingling is under Chimecho.','Confuse the Defending Pokémon if it is a Basic Pokémon.'],
 27:['The Defending Pokémon is now Asleep.','Do 10 extra damage for each Kricketot and Kricketune you have in play.'],
 28:['Deal 20 damage per Basic Energy attached to Manectric.','Deal 20 damage to each opposing Benched Pokémon matching the Defending Pokémon’s type.'],
 33:['If the Defending Pokémon has 60 HP or less remaining, deal 60 instead of 30.','Do 20 damage to Rampardos; ignore Weakness, Resistance and effects on the Defending Pokémon.'],
 35:['If Bonsly is underneath Sudowoodo, flip for prevention of all effects and damage next turn.','Switch the Defending Pokémon, then prevent the new Active Pokémon from retreating.'],
 38:['Confuse the Defending Pokémon; its attacks do 60 more damage next turn.','Gain extra damage with Teddiursa on the Bench, and heal it if damaged.'],
 40:['Deal 20 damage for every damage counter on Whiscash.','Deal 20 damage to every Benched Pokémon on both sides.'],
 41:['Find one Evolution Pokémon in your deck and put it in hand.','Flip two coins; deal 30 per heads.'],
 43:['','Do 20 damage to one opposing Benched Pokémon.'],
 47:['Draw one card.','Switch Dunsparce with a Benched Pokémon.'],
 48:['Recover up to two Energy from your discard pile.','On heads put four damage counters on an opposing Pokémon; on tails heal four from an ally.'],
 49:['Search your deck for one Trainer.','Flip a coin; heads Confuses the Defending Pokémon.'],
 50:['Look at the opponent’s hand.'],
 51:['Flip until tails, dealing 30 per heads.','Do 10 damage to two different opposing Benched Pokémon.'],
 53:['Recover Metal Energy from the discard to Lairon, then remove two damage counters.',''],
 54:['','Discard one Energy attached to Magmar.'],
 55:['Deal 20 per retreat Energy of the Defending Pokémon.','If opponent has a Water Pokémon, do 30 more and Confuse.'],
 56:['Retrieve up to two Pokémon from discard.',''],
 57:['If defender has a Special Energy, do 30 more and discard a Special Energy from it.','Do 40 damage to a chosen opposing Benched Pokémon.'],
 58:['If Parasect evolved from Paras this turn, do 40 instead and apply Sleep and Poison.','Remove two damage counters from Parasect.'],
 59:['Put a damage counter on each opposing Pokémon.','Deal 10 recoil; on heads prevent damage to Pupitar next turn.'],
 60:['Flip a coin; on tails discard a Fire Energy attached to Quilava.'],
 62:['Select one opposing Pokémon to receive 30 damage.'],
 63:['Reduce damage taken by 20 next turn.','On heads do 20 more damage.'],
 64:['Heal 30 from each of your Benched Pokémon with Grass Energy attached.','Opponent switches the Defending Pokémon.'],
 68:['If this turn’s evolution from Asleep Slakoth occurred, do 60 instead.','Flip three coins, dealing 30 per heads.'],
 70:['','Discard the Pokémon Tools on the chosen opposing Pokémon before hitting for 20.'],
 71:['Deal 10 recoil damage.'],
 72:['Flip a coin; on heads deal 10 to each of the opponent’s Pokémon.'],
 74:['On heads Confuse the Defending Pokémon.'],
 75:['On heads add 30 damage.'],
 76:['On heads prevent damage from attacks during opponent’s next turn.','Deal 60 damage to Chansey.'],
 77:['On heads put the Defending Pokémon Asleep.','On heads add 10 damage.'],
 78:['On heads opponent may not play Supporters next turn.','On heads Poison the Defending Pokémon.'],
 79:['',''],
 83:['On heads prevent all effects of attacks, including damage, next turn.',''],
 84:['Select two opposing Benched Pokémon and do 10 damage to each.'],
 85:['Opponent switches the Defending Pokémon.'],
 86:['Put a Basic Pokémon from your deck onto your Bench.',''],
 89:['Deal 10 per damage counter on Magikarp.','Flip two coins; this attack fails if either is tails.'],
 90:['Search your deck and Bench a Murkrow.','Switch Murkrow with a Benched Pokémon.'],
 91:['Search and Bench Nidoran Female or Male.','On heads Poison the Defending Pokémon.'],
 92:['','On heads Paralyze the Defending Pokémon.'],
 95:['Do 10 damage to one opposing Pokémon.','On heads Paralyze the Defending Pokémon.'],
 96:['Defending Pokémon flips a coin to attack on opponent’s next turn.',''],
 97:['On heads Paralyze the Defending Pokémon.'],
 98:['On heads attach a Lightning Energy from discard to Shinx.'],
 99:['Both Slakoth and Defending Pokémon become Asleep.'],
 100:['Draw one card.','On tails this attack deals no damage.'],
 101:['Look at the opponent’s hand.','On tails Snover deals 10 recoil to itself.'],
 103:['Defending Pokémon cannot retreat next turn.','Flip two coins; deal 20 per heads.'],
 104:['Switch an opposing Benched Pokémon Active and put it to Sleep.'],
 106:['','If Defending Pokémon is already damaged, do 10 extra.'],
 107:['Deal 10 damage to an opposing Benched Pokémon.'],
 108:['On heads Confuse the Defending Pokémon.',''],
};
Object.assign(PRINTS,{
 2:['50 damage. During your opponent’s next turn reduce damage to Alakazam from Stage 2 Pokémon by 30.'],
 3:['30 damage; opponent flips until heads, moving one Energy per tails from Defending Pokémon to bottom of deck.','80 damage; opponent may discard 2 cards from hand to reduce to 10 damage.'],
 4:['10 damage. Opponent cannot attach Special Energy cards from hand on next turn.'],
 10:['50 damage. Randomly shuffle 1 card from the opponent’s hand into their deck.'],
 18:['10 damage. If Mesprit and Azelf are in play, 20 more damage and Sleep.'],
 21:['60 damage. If Bastiodon was damaged by an attack last turn, put 4 damage counters on 1 opponent Benched Pokémon.'],
 23:['Choose 1 opposing Pokémon, deal 50 damage. Flip a coin; on tails shuffle Crobat and all attached cards into your deck.'],
 26:['80 damage. Flip until tails; on heads discard random opponent hand cards, on first tails Confuse Gyarados.'],
 30:['Opponent guesses a coin flip. Wrong guess: 50 damage to defender; right guess: 20 damage to Mr. Mime.'],
 36:['30 damage and Poison the Defending Pokémon.'],
 37:['Choose an Energy on the Defending Pokémon to make a face-down Special Colorless Energy until the end of opponent’s next turn.'],
 39:['70 damage. Opponent may discard 1 card from hand to prevent Paralysis.'],
 43:['20 damage.','30 damage and 20 to one opposing Benched Pokémon.'],
 65:['During your opponent’s next turn, all their coin flips are tails.'],
 67:['Look at opponent’s hand and shuffle 1 chosen card into deck; then opponent does same to your revealed hand.']
});
Object.assign(PRINTS,{
 1:['Return all discarded Energy cards to the deck and shuffle; if any are Special Metal Energy, +30 damage.', 'Option: 60 damage, or 100 damage with 40 recoil.'],
 8:['Choose Energy cards from your hand, return each chosen card to the deck and shuffle; deal 20 per card.', 'Discard a random unknown card from the opponent’s hand.'],
 19:['On heads also deal 10 to each opposing Benched Pokémon.'],
 25:['On heads opponent may not play Trainers or Supporters next turn.'],
 32:['Discard an attached Fire Energy.'],
 44:['Defending Pokémon cannot retreat next turn.'],
 45:['Deal 60 and make Dewgong Asleep.'],
 61:['If Sandslash is damaged by the opponent’s attack, place four damage counters on that attacker, even if Sandslash is KO’d.', 'Poison the Defending Pokémon if it already has damage counters.'],
 87:['You may discard the top deck card for +10 damage and put Larvitar to Sleep.', ''],
 12:['Attack-blocking Smoke Bomb: the Defending Pokémon must flip a coin to attack next turn.', 'Unless Magby is in the evolution stack, discard two Energy cards from your hand or this attack does nothing.'],
 7:['Search your deck/ordered Energy supply for Grass Energy and attach it to Celebi.', 'You may move any number of Basic Grass Energy from your Pokémon to your other Pokémon.'],
 24:['Flip a coin for every Basic Energy attached to Exeggutor and the Defending Pokémon; 30 damage per heads.', 'Search your deck/ordered Energy supply for up to two Grass Energy and attach them to any of your Pokémon.'],
 68:['If Vigoroth evolved from a Sleeping Slakoth this turn, the base damage is 60.', 'Flip three coins; 30 damage per heads.'],
 70:['','Choose an opposing Pokémon, discard its Pokémon Tools BEFORE dealing 20 damage.'],
 81:['On heads your opponent cannot attach Energy from hand to the Active Pokémon next turn.'],
 82:['Flip a coin per Energy on Exeggcute; deal 10 damage per heads to a chosen opposing Pokémon.'],
 102:['','On heads Spheal’s Rollout base damage becomes 40 on its next turn.'],
 121:['Discard all opposing Pokémon Tools and Stadiums. If you discard any, prevent attacks and their effects against Electivire during the opponent’s next turn.'],
 122:['Do 80 damage; Lucario takes 30 more damage from attacks on the opponent’s next turn.'],
 123:['Discard two attached Fire Energy. Choose one opposing Pokémon and deal 100 damage; Flame Bluster is unavailable on your next turn.']
});
const BABIES={42:'Chimecho',52:'Chansey',88:'Magmar',93:'Pikachu'};
const POWER_READY={
 5:{name:'Kind Egg',type:'activated',oncePerTurn:true,text:'If Happiny is under Blissey, shuffle up to one card for each attached Energy from your hand into the deck, then draw as many.',rule:'dp2:5:kindEgg'},
 6:{name:'Miracle Oracle',type:'activated',oncePerTurn:true,text:'Draw 1, then discard one hand card. Draw an extra card if that card was Energy.',rule:'dp2:6:miracleOracle'},
 9:{name:'Rainbow Scale',type:'passive',oncePerTurn:false,disabledByStatus:false,text:'+40 damage if the Defending Pokémon has Weakness to any attached Energy type, but this does not work with Special Energy attached.',rule:'dp2:9:rainbowScale'},
 11:{name:'Lure Ring',type:'activated',activeOnly:true,oncePerTurn:true,text:'Switch in an opposing Benched Pokémon with printed maximum HP of at least 100.',rule:'dp2:11:lureRing'},
 14:{name:'Upper Material',type:'passive',oncePerTurn:false,disabledByStatus:false,text:'With Uxie and Azelf in play, all Uxie, Mesprit and Azelf on either side have free retreat.',rule:'dp2:14:upperMaterial'},
 20:{name:'Sticky',type:'passive',oncePerTurn:false,disabledByStatus:false,text:'All Pokémon except Ariados have one extra retreat cost.',rule:'dp2:20:sticky'},
 29:{name:'Jumbo Fin',type:'passive',oncePerTurn:false,disabledByStatus:false,text:'If Mantyke is under Mantine, all your Water Pokémon retreat for two Colorless Energy less.',rule:'dp2:29:jumboFin'},
 31:{name:'Mother Pheromone',type:'passive',oncePerTurn:false,disabledByStatus:false,text:'Your Nidoran, Nidorina, Nidorino and Nidoking attacks cost one Colorless less.',rule:'dp2:31:motherPheromone'},
 34:{name:'Energetic Impulse',type:'activated',activeOnly:true,oncePerTurn:true,text:'Flip a coin: heads Lazy Blow is 130 this turn; tails Slaking cannot attack or retreat this turn.',rule:'dp2:34:energeticImpulse'},
 66:{name:'MAGNET',type:'activated',activeOnly:true,oncePerTurn:true,text:'Flip a coin; heads you may switch an opposing Benched Pokémon to Active.',rule:'dp2:66:magnet'},
 19:{name:'Glacier Snow',type:'triggered',event:'damagedByAttack',oncePerTurn:false,text:'When Active Abomasnow is damaged by an attack (even if knocked out), put the attacking Pokémon Asleep.',rule:'dp2:19:glacierSnow'},
 32:{name:'Color Shift',type:'activated',oncePerTurn:true,text:'Choose an opposing Pokémon; Ninetales becomes its type until end of this turn.',rule:'dp2:32:colorShift'},
 44:{name:'Evolutionary Vitality',type:'triggered',event:'evolved',fromHandOnly:true,oncePerTurn:false,text:'When evolved from hand, reveal the top five cards, take all Energy cards into hand and shuffle the rest.',rule:'dp2:44:evolutionaryVitality'},
 121:{name:'Shocking Tail',type:'triggered',event:'opponentEnergyAttached',activeOnly:true,disabledByStatus:false,oncePerTurn:false,text:'While Electivire LV.X is Active, put two damage counters on each opposing Pokémon receiving Energy attached from hand.',rule:'dp2:121:shockingTail'},
 122:{name:'Stance',type:'triggered',event:'levelUp',fromHandOnly:true,oncePerTurn:true,text:'On leveling up Active Lucario from hand, you may prevent all effects of the opponent’s next attack.',rule:'dp2:122:stance'},
 123:{name:'Torrid Wave',type:'activated',activeOnly:true,oncePerTurn:true,disabledByStatus:true,text:'Once per turn while Active, Burn the Defending Pokémon; this Burn deals three damage counters between turns.',rule:'dp2:123:torridWave'},
 16:{name:'Firestarter',text:'Once during your turn, attach a Fire Energy card from your discard pile to one of your Benched Pokémon.',rule:'dp2:16:firestarter'},94:{name:'Electro Recycle',text:'If Pichu is under Pikachu, once during your turn retrieve a Lightning Energy from your discard pile to your hand.',rule:'dp2:94:electroRecycle'}};
Object.assign(POWER_READY,{
 2:{name:'Power Cancel',type:'passive',disabledByStatus:true,text:'On an opponent’s turn, discard 2 cards from hand to cancel an opposing Poké-Power as it is used (optional).',rule:'dp2:2:powerCancel'},
 4:{name:'Downer Material',type:'passive',disabledByStatus:false,text:'With Uxie and Mesprit allied, opposing Basic Pokémon attacks cost 1 more Colorless (not cumulative).',rule:'dp2:4:downerMaterial'},
 10:{name:'Dark Genes',type:'passive',disabledByStatus:false,text:'While Honchkrow has Energy for its own attack, Murkrow may use that attack for free.',rule:'dp2:10:darkGenes'},
 18:{name:'Memory Out',type:'triggered',event:'damagedByAttack',oncePerTurn:false,disabledByStatus:false,text:'When damaged by an opponent’s attack, even if knocked out, optionally lock the attacking move next turn.',rule:'dp2:18:memoryOut'},
 21:{name:'Protective Wall',type:'passive',disabledByStatus:false,text:'Opponent’s attacks do no damage to your Benched Pokémon.',rule:'dp2:21:protectiveWall'},
 23:{name:'Evolutionary Toxic',type:'triggered',event:'evolved',fromHandOnly:true,oncePerTurn:false,text:'When evolved from hand, optionally Poison the Defending Pokémon; 2 counters between turns.',rule:'dp2:23:evolutionaryToxic'},
 26:{name:'Dragon DNA',type:'passive',disabledByStatus:false,text:'Gyarados may use attacks of Basic Magikarp in its evolution stack, adding 30 to damage dealt.',rule:'dp2:26:dragonDNA'},
 30:{name:'Airy Wall',type:'passive',disabledByStatus:false,text:'Prevent attacks from Pokémon with 2 or fewer Energy cards; with Mime Jr. underneath also prevent attack effects.',rule:'dp2:30:airyWall'},
 36:{name:'Poison Sacs',type:'passive',disabledByStatus:false,text:'Your opponent’s Poison conditions are not removed by evolution or Level-Up.',rule:'dp2:36:poisonSacs'},
 37:{name:'ITEM',type:'activated',oncePerTurn:true,text:'If Unown I, T, E, M are all on Bench, search your deck for a Trainer card and put it into hand. Only 1 ITEM each turn.',rule:'dp2:37:item'},
 39:{name:'Freeze-up',type:'triggered',event:'evolved',fromHandOnly:true,oncePerTurn:false,text:'On evolution from hand optionally flip 2 coins; 2 heads discard Defending Pokémon and attachments without KO.',rule:'dp2:39:freezeUp'},
 65:{name:'EQUIP',type:'activated',benchOnly:true,activeOnly:false,oncePerTurn:true,text:'From your Bench discard attachments and attach Unown E as Pokémon Tool to your own Pokémon for +10 HP.',rule:'dp2:65:equip'},
 67:{name:'THROW',type:'activated',activeOnly:true,oncePerTurn:true,text:'Discard a card from your hand; on heads put 2 damage counters on one opponent Benched Pokémon.',rule:'dp2:67:throw'}
});
const TRAINER_TEXT={111:'Search your deck or discard pile for a Fossil Trainer or a Stage 1 or Stage 2 Pokémon evolved from a Fossil, reveal it, and put it in your hand.',112:'All Pokémon have Weakness ×2 instead of their printed Weakness.',109:'Put a card from your hand on top of your deck, then search your deck for a Pokémon and put it into your hand. Shuffle your deck.',110:'Look at the bottom seven cards of your deck. Put one Pokémon from those cards into your hand, return the others and shuffle.',113:'Choose up to three Pokémon and Basic Energy cards from your discard pile and shuffle them into your deck.',114:'Reveal cards from your deck until you reveal a Pokémon. Put that Pokémon into your hand and shuffle the other cards back into your deck.',124:'Flip three coins. For each heads, choose one Pokémon in your discard pile and put it into your hand.',115:'Both players shuffle their hands into their decks, play rock-paper-scissors, then the winner draws up to 6 cards and the loser up to 3.',116:'Play as a 50 HP Colorless Basic Pokémon on your Bench, even though this is a Trainer. Armor Stone reduces incoming attack damage by 10 per heads until tails. May voluntarily discard it, but a Knock Out awards a Prize.',117:'Play as a 50 HP Colorless Basic Pokémon on your Bench, even though this is a Trainer. Skull Stone places 1 damage counter on the attacker for each heads until tails when an attack would Knock Out Skull Fossil. May voluntarily discard it, but a Knock Out awards a Prize.'};
const TRAINER_EFFECTS={111:{type:'neoRule',rule:'dp2:111:fossilExcavator'},112:{type:'noop'},109:{type:'neoRule',rule:'dp2:109:bebe'},110:{type:'neoRule',rule:'dp2:110:dusk'},113:{type:'neoRule',rule:'dp2:113:nightMaintenance'},114:{type:'neoRule',rule:'dp2:114:quick'},124:{type:'neoRule',rule:'dp2:124:timeSpace'},115:{type:'neoRule',rule:'dp2:115:teamGalacticsWager'},116:{type:'playFossil',hp:50,subtype:'Colorless',canRetreat:false,countsAsKnockout:true},117:{type:'playFossil',hp:50,subtype:'Colorless',canRetreat:false,countsAsKnockout:true}};
for(const n of [109,110,111,112,113,114,124,118,119,120])READY.add(n);
const GATED_EXPLANATION='Printed effects require additional mechanic verification before Classic battle use';
function parse(row){
 const [number,name,kind,stage,hp,code,from,weak,resist,retreat,rarity,attacks,powers]=row;
 const n=Number(number),id='dp2-'+n,ready=READY.has(n),pokemon=kind==='P',trainer=kind==='T';
 const card={id,setId:'dp2',number:String(number),name,source:'tcg',battleFormat:'classic',rarity,
    image:`https://images.pokemontcg.io/dp2/${number}.png`,imageLarge:`https://images.pokemontcg.io/dp2/${number}_hires.png`,
    kind:pokemon?'pokemon':trainer?'trainer':'energy'};
 const parseMod=s=>s?{type:T[s[0]],value:s.slice(1)}:null;
 if(pokemon){
   const w=parseMod(weak),r=parseMod(resist);
   Object.assign(card,{stage,hp:Number(hp),types:(code||'C').split('').map(x=>T[x]),subtype:T[(code||'C')[0]],
     retreat:Number(retreat||0),evolvesFrom:from||null,
     weakness:w?.type||null,weaknessValue:w?.value||null,weaknesses:w?[w]:[],
     resistance:r?.type||null,resistanceValue:r?.value||null,resistances:r?[r]:[],
     attacks:(attacks||'').split(';').filter(Boolean).map((spec,i)=>{
       const [attackName,cost='',damageText='']=spec.split('~');return {name:attackName,cost,
         damage:Number((damageText.match(/^\d+/)||[])[0]||0),damageText:damageText||null,
         text:PRINTS[n]?.[i]??(ready?'':'Printed text shown on the original card; not yet battle-enabled.'),
         effect:EFFECTS[n]?.[i]||{type:'noop'}};
     }),
     abilities:(powers||'').split(';').filter(Boolean).map(s=>{
       const [power,type]=s.split('~');return {name:power,type:type?.includes('Power')?'activated':'passive',
         printedPowerType:type?.includes('Power')?'power':'body',
         text:'Printed Power or Body remains gated pending outcome and timing validation.',effect:{type:'noop'}};
     }),isLevelX:stage==='Level-Up',levelUpFrom:stage==='Level-Up'?from:null,
     text:stage==='Level-Up'?'Level up only your Active Pokémon. Retain attacks and Powers from the previous level.':undefined});
   if(BABIES[n]&&card.abilities.length){card.abilities[0]={name:'Baby Evolution',type:'activated',printedPowerType:'power',oncePerTurn:true,disabledByStatus:true,text:'Once during your turn, evolve this Baby Pokémon into '+BABIES[n]+' from your hand and remove its damage counters.',effect:{type:'neoRule',rule:'dp1:babyEvolve',targetName:BABIES[n]}};}
   if(POWER_READY[n]&&card.abilities.length){const p=POWER_READY[n];card.abilities[0]={name:p.name,type:p.type||'activated',printedPowerType:p.type==='passive'||n===121?'body':'power',expeditionSpecialCondition:p.type!=='passive',oncePerTurn:p.oncePerTurn??true,disabledByStatus:p.disabledByStatus??(p.type==='triggered'?false:true),activeOnly:!!p.activeOnly,benchOnly:!!p.benchOnly,event:p.event,fromHandOnly:!!p.fromHandOnly,text:p.text,effect:{type:'neoRule',rule:p.rule}};}
   const full=[...card.attacks.map(a=>a.text),...card.abilities.map(a=>a.text)].join(' ').toLowerCase();
   const types=[...new Set(card.attacks.flatMap(a=>[...a.cost].filter(s=>s!=='C').map(s=>T[s])))];
   const roles=new Set();if(/draw|hand/.test(full))roles.add('draw');if(/search|recover|retrieve/.test(full))roles.add('search');
   for(const condition of ['asleep','poison','confus','paraly','burn'])if(full.includes(condition))roles.add('status');
   card.deckMeta={roles:[...roles],synergy:[...roles],energyTypes:types,preferredEnergyTypes:[],inflicts:[],payoffs:[],preferredPartners:[],conditionalAttackEnergyTypes:[],babyEvolutionSupport:[]};
 }else if(trainer){
   card.trainerType=stage;card.text=TRAINER_TEXT[n]||'Original printed Trainer effect; battle use requires outcome verification.';
   card.effect=TRAINER_EFFECTS[n]||{type:'noop'};
   if(n===116||n===117)Object.assign(card,{hp:50,types:['Colorless'],subtype:'Colorless',stage:'Basic',retreat:0,fossil:true,fossilHp:50,countsAsKnockout:true,statusImmune:['sleep','paralysis','confusion','poison','burn']});
 }else{card.basicEnergy=false;card.specialEnergy=true;card.subtype=name==='Metal Energy'?'Metal':name==='Darkness Energy'?'Darkness':'Colorless';card.types=[card.subtype];card.effect={type:'specialEnergy',provides:{[card.subtype]:1}};card.deckEligible=n>=118&&n<=120;card.text=n===118?'Provides one unit of any Energy type while no other Special Energy is attached; otherwise provides Colorless.':n===119?'Provides Darkness Energy and adds 10 damage to its Darkness Pokémon’s attacks.':'Provides Metal Energy and reduces damage to its Metal Pokémon by 10.';}
 return Object.freeze({...card,battleEnabled:ready,deckEligible:ready&&card.deckEligible!==false,
   support:{status:ready?'FULL':'PARTIAL',reasons:ready?[]:[GATED_EXPLANATION]}});
}
const CARDS=Object.freeze(DATA.map(parse));
const MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
