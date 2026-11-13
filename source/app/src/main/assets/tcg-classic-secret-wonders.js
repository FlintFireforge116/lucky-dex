/* LuckyDex Classic TCG — Diamond & Pearl: Secret Wonders (dp3).
 * 132 printed cards (source: PokemonTCG/pokemon-tcg-data cards/en/dp3.json).
 * Stage 2: canonical collector identities, attack costs and art;
 * only individually reviewed effects may be battle-enabled.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGSecretWonders=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET={id:'dp3',name:'Secret Wonders',series:'Diamond & Pearl',releaseDate:'2007-11-01',cardCount:132,printedTotal:132};
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Ampharos|P|Stage 2|130|L|Flaaffy|F+30|M-20|3|Rare Holo|Cluster Bolt~LCC~70|Jamming~Body
2|Blastoise|P|Stage 2|120|W|Wartortle|L+30||2|Rare Holo|Hydro Pump~WWC~50+|Waterlog~Power
3|Charizard|P|Stage 2|130|R|Charmeleon|W+40|F-20|3|Rare Holo|Blast Burn~RRRC~120|Fury Blaze~Body
4|Entei|P|Basic|80|R||W+20||2|Rare Holo|Blaze Roar~RRR~60|Burning Coat~Body
5|Flygon|P|Stage 2|120|F|Vibrava|W+30|L-20|1|Rare Holo|Sand Sonic~FCC~60+|Irritating Buzz~Body
6|Gallade|P|Stage 2|130|F|Kirlia|P+30||2|Rare Holo|Sonic Blade~FC~;Psychic Cut~PCC~60+|
7|Gardevoir|P|Stage 2|110|P|Kirlia|P+30||2|Rare Holo|Psychic Lock~PCC~60|Telepass~Power
8|Gastrodon East Sea|P|Stage 1|100|W|Shellos East Sea|G+30|L-20|4|Rare Holo|Dwindling Wave~WCC~80-|Osmotic Pressure~Power
9|Gastrodon West Sea|P|Stage 1|100|F|Shellos West Sea|G+30|L-20|4|Rare Holo|Raging Flood~FC~20+;Wild Waves~FCCC~80|
10|Ho-Oh|P|Basic|90|R||W×2|F-20|2|Rare Holo|Rainbow Wing~CCCC~20×|Phoenix Turn~Power
11|Jumpluff|P|Stage 2|90|G|Skiploom|R+30|F-20|0|Rare Holo|Cottonweed Punch~GG~|Cotton Spore~Body
12|Lickilicky|P|Stage 1|110|C|Lickitung|F+30||4|Rare Holo|Tongue Reel~CC~;Boundless Power~CCCC~80|
13|Ludicolo|P|Stage 2|100|W|Lombre|L+30||2|Rare Holo|Nature Power~WWC~60+|Rain Dish~Body
14|Lugia|P|Basic|90|C||P+20|F-20|2|Rare Holo|Silver Wing~C~20;Psychic Destruction~PCC~120|
15|Mew|P|Basic|60|P||P+20||1|Rare Holo|Psychic Balance~~;Re-creation~PCC~|
16|Raikou|P|Basic|80|L||F+20|M-20|2|Rare Holo|Thunder Climb~LLL~50+|Thunder Rumble~Power
17|Roserade|P|Stage 1|90|G|Roselia|R+20||1|Rare Holo|Sleep Poison~G~20;Magical Leaf~GCC~40+|
18|Salamence|P|Stage 2|140|C|Shelgon|C+30|F-20|3|Rare Holo|Direct Hit~CC~50;Dragon Finish~RRWW~|
19|Suicune|P|Basic|70|W||L+20||1|Rare Holo|Cure Stream~WWW~60|Aqua Recover~Power
20|Venusaur|P|Stage 2|130|G|Ivysaur|R+30||3|Rare Holo|Giant Bloom~GGC~60|Miracle Aroma~Power
21|Absol|P|Basic|70|D||F+20|P-20|1|Rare|Baleful Wind~C~;Raid~D~10|
22|Arcanine|P|Stage 1|100|R|Growlithe|W+30||2|Rare|Inferno Onrush~RRCC~120|Flame Dash~Power
23|Banette|P|Stage 1|80|P|Shuppet|D+20|C-20|1|Rare|Ghost Head~~;Spiteful Pain~PP~40+|
24|Dugtrio|P|Stage 1|90|F|Diglett|W+20|L-20|0|Rare|Dig Trap~FC~;Pit Trap~FFC~50+|
25|Electivire|P|Stage 1|100|L|Electabuzz|F+30|M-20|3|Rare|Discharge~LCC~50×|Motor Drive~Power
26|Electrode|P|Stage 1|80|L|Voltorb|F+20|M-20|0|Rare|Ion Blast~LC~40+|Energy Shift~Power
27|Furret|P|Stage 1|90|C|Sentret|F+20||1|Rare|Keen Eye~~;Baton Pass~CC~40|
28|Golduck|P|Stage 1|90|W|Psyduck|L+20||1|Rare|Encore~P~20;Break Beam~WP~40+|
29|Golem|P|Stage 2|130|F|Graveler|G+30|L-20|4|Rare|Double Throw~FFC~;Megaton Rock~FFFC~80|
30|Jynx|P|Basic|70|P||P+20||2|Rare|Icy Kiss~WC~30;Lovely Kiss~PC~|
31|Magmortar|P|Stage 1|110|R|Magmar|W+30||3|Rare|Flame Blast~R~20×;Fireball Bazooka~RCC~40|Flame Body~Body
32|Minun|P|Basic|60|L||F+10|M-20|1|Rare|Tag Play —~L~20|Minus Charge~Power
33|Mothim|P|Stage 1|80|G|Burmy|R+20|F-20|0|Rare|Silver Wind~~;Raging Scales~GC~30+|
34|Nidoking|P|Stage 2|130|P|Nidorino|P+30||2|Rare|Poison Rub~CC~20;Pride Attack~PPCC~60+|
35|Pidgeot|P|Stage 2|120|C|Pidgeotto|L+30|F-20|0|Rare|Mirror Move~CC~;Whirlwind~CC~50|
36|Plusle|P|Basic|60|L||F+10|M-20|1|Rare|Tag Play +~L~20|Plus Charge~Power
37|Sharpedo|P|Stage 1|80|D|Carvanha|L+20|P-20|0|Rare|Strike Wound~WCC~60+|Rough Skin~Body
38|Sunflora|P|Stage 1|80|G|Sunkern|R+20|W-20|2|Rare|Petal Dance~GG~30×|Grass Whistle~Power
39|Unown [S]|P|Basic|50|P||P+10||1|Rare|Hidden Power~C~10|Set~Power
40|Weavile|P|Stage 1|80|W|Sneasel|M+20||0|Rare|Shadow Charge~~;Chip Off~DD~40|Dark Engage~Power
41|Wormadam Plant Cloak|P|Stage 1|80|G|Burmy Plant Cloak|R+20||1|Rare|Leaf Hurricane~GCC~60|Plant Cloak~Body
42|Wormadam Sandy Cloak|P|Stage 1|80|F|Burmy Sandy Cloak|R+20|L-20|1|Rare|Push Over~FCC~40+|Sandy Cloak~Body
43|Wormadam Trash Cloak|P|Stage 1|70|M|Burmy Trash Cloak|R+20|P-20|1|Rare|Iron Tackle~MMC~70|Trash Cloak~Body
44|Xatu|P|Stage 1|80|P|Natu|P+10|F-20|1|Rare|Energy Singe~PC~|Psychic Shift~Power
45|Breloom|P|Stage 1|100|G|Shroomish|R+30||2|Uncommon|Drain Punch~FC~40;Homing Uppercut~FCC~60+|
46|Charmeleon|P|Stage 1|80|R|Charmander|W+20||1|Uncommon|Fire Fang~R~20;Flare Tail~RRC~50+|
47|Cloyster|P|Stage 1|80|W|Shellder|L+20||2|Uncommon|Withdraw~~;Spine Missile~WC~|
48|Donphan|P|Stage 1|100|F|Phanpy|W+20|L-20|3|Uncommon|Rapid Spin~FC~40;Bash In~FFCC~70+|
49|Farfetch'd|P|Basic|60|C||L+20|F-20|1|Uncommon|Swords Dance~C~;Leek Slap~C~30|
50|Flaaffy|P|Stage 1|80|L|Mareep|F+20|M-20|1|Uncommon|Attract Current~C~10;Electromagnetic Kick~LLC~60|
51|Ivysaur|P|Stage 1|80|G|Bulbasaur|R+20||2|Uncommon|Leech Seed~GC~20;Razor Leaf~GGC~60|
52|Kecleon|P|Basic|70|C||F+10||1|Uncommon|Blind Scratch~CC~60|Camouflage~Body
53|Kirlia|P|Stage 1|80|P|Ralts|P+20||1|Uncommon|Psychic Research~P~;Telekinesis~PCC~|
54|Lombre|P|Stage 1|70|W|Lotad|L+20||1|Uncommon|Torment~CC~20;Absorb~WW~40|
55|Miltank|P|Basic|90|C||F+20||2|Uncommon|Healing Milk~~;Continuous Tumble~CC~20×|
56|Muk|P|Stage 1|80|P|Grimer|P+20||2|Uncommon|Panic Liquid~PPC~50|Toxic Sludge~Body
57|Nidorino|P|Stage 1|80|P|Nidoran ♂|P+20||1|Uncommon|Spirited Drill~CC~20;Poison Horn~PCC~40|
58|Pidgeotto|P|Stage 1|70|C|Pidgey|L+20|F-20|0|Uncommon|Wing Attack~C~20;Quick Attack~CC~30+|
59|Pinsir|P|Basic|80|G||R+20||1|Uncommon|Grip and Squeeze~G~20;Power Guillotine~GCC~100|
60|Quagsire|P|Stage 1|90|W|Wooper|G+30|L-20|3|Uncommon|Muddy Water~WCC~60|Aqua Healing~Power
61|Raticate|P|Stage 1|70|C|Rattata|F+20||0|Uncommon|Gnaw Off~C~10+;Sneaky Attack~C~20+|
62|Roselia|P|Basic|70|G||R+10||1|Uncommon|Sleep Powder~C~;Razor Leaf~G~10|
63|Sableye|P|Basic|60|D|||C-20|1|Uncommon|Rummage~C~;Shadow Sneak~DC~20+|
64|Shelgon|P|Stage 1|80|C|Bagon|C+20|F-20|2|Uncommon|Focus Energy~C~;Protect Charge~CCC~30|
65|Skiploom|P|Stage 1|60|G|Hoppip|R+20|F-20|0|Uncommon|U-turn~G~20|Cotton Balloon~Body
66|Smeargle|P|Basic|70|C||F+10||1|Uncommon|Color Pick~~;Trace~C~|
67|Smoochum|P|Basic|50|P||P+10||1|Uncommon|Psykiss~~|Baby Evolution~Power
68|Unown [K]|P|Basic|60|P||P+10||1|Uncommon|Hidden Power~P~20|Kind~Power
69|Unown [N]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~10|Nod~Power
70|Unown [O]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~10|ONE~Power
71|Unown [X]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~C~10|X-RAY~Power
72|Unown [Z]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~PC~|ZERO~Power
73|Venomoth|P|Stage 1|80|G|Venonat|R+20|F-20|1|Uncommon|Disturbance Dive~GG~50|Dangerous Scales~Body
74|Vibrava|P|Stage 1|80|F|Trapinch|W+20|L-20|1|Uncommon|Sand Wind~F~;Hyper Beam~FCC~40|
75|Wartortle|P|Stage 1|80|W|Squirtle|L+20||1|Uncommon|Giant Wave~WW~40;Shell Attack~CCC~50|
76|Bagon|P|Basic|50|C||C+10|F-20|1|Common|Bite~C~10;Rage~CC~10+|
77|Bulbasaur|P|Basic|60|G||R+10||1|Common|Shake Vine~~;Bullet Seed~GC~10×|
78|Burmy Plant Cloak|P|Basic|40|G||R+10||1|Common|Plant Cloak Tackle~C~10+|Wear Cloak~Power
79|Burmy Sandy Cloak|P|Basic|40|G||R+10||1|Common|Sandy Cloak Tackle~C~10+|Wear Cloak~Power
80|Burmy Trash Cloak|P|Basic|40|G||R+10||1|Common|Trash Cloak Tackle~C~10+|Wear Cloak~Power
81|Carvanha|P|Basic|50|D||L+10|P-20|1|Common|Slash~W~10;Bite Away~DC~20|
82|Charmander|P|Basic|50|R||W+10||1|Common|Gnaw~~10;Lava Burn~RR~20|
83|Clefairy|P|Basic|60|C||F+10||1|Common|Double Slap~C~10×|
84|Corsola|P|Basic|70|W||G+20||1|Common|Rally~C~;Hook~WC~30|
85|Diglett|P|Basic|50|F||W+10|L-20|1|Common|Down Draw~C~;Mud Spatter~FF~30|
86|Duskull|P|Basic|50|P||D+10|C-20|1|Common|Astonish~P~|
87|Electabuzz|P|Basic|70|L||F+20|M-20|2|Common|Thundershock~L~10;Thunder~LLC~60|
88|Grimer|P|Basic|60|P||P+10||2|Common|Mud Bomb~C~10;Gunky~P~|
89|Growlithe|P|Basic|70|R||W+20||2|Common|Roar~C~;Dig Claws~RC~20|
90|Hoppip|P|Basic|30|G||R+10|F-20|1|Common|Hover Heal~G~10|Cottonweed~Body
91|Lickitung|P|Basic|80|C||F+20||3|Common|Lick~C~10;Stomp~CC~10+|
92|Lotad|P|Basic|50|W||L+10||1|Common|Water Sport~W~10+;Ram~WC~20|
93|Magmar|P|Basic|70|R||W+20||2|Common|Fire Punch~C~10;Smog~RC~20|
94|Mareep|P|Basic|50|L||F+10|M-20|1|Common|Thundershock~L~10;Static Shock~LC~20|
95|Murkrow|P|Basic|50|D||L+10|F-20|1|Common|Feint Attack~DC~|
96|Natu|P|Basic|40|P||P+10|F-20|1|Common|Bothering Wave~C~20;Future Sight~P~|
97|Nidoran ♂|P|Basic|60|P||P+10||1|Common|Collect~C~;Poison Skin~P~|
98|Phanpy|P|Basic|60|F||W+10|L-20|1|Common|Flail~C~10×;Take Down~FC~30|
99|Pidgey|P|Basic|50|C||L+10|F-20|1|Common|Growl~C~;Peck~CC~20|
100|Psyduck|P|Basic|60|W||L+10||1|Common|Delusion~C~;Migraine~C~10|
101|Qwilfish|P|Basic|70|W||L+20||1|Common|Nerve Shot~WW~20|Balloon Sting~Power
102|Ralts|P|Basic|60|P||P+10||1|Common|Smack~C~10;Confuse Ray~P~|
103|Rattata|P|Basic|30|C||F+10||0|Common|Tail Whip~C~;Bite~C~20|
104|Sentret|P|Basic|60|C||F+10||1|Common|Grope~C~;Scratch~C~10|
105|Shellder|P|Basic|50|W||L+10||1|Common|Shell Rest~C~;Tongue Slap~WC~20|
106|Shellos East Sea|P|Basic|60|W||L+10||2|Common|Shell Hunting~C~;Sprinkle Water~W~10|
107|Shellos West Sea|P|Basic|60|W||L+10||1|Common|Mud Spatter~C~10;Recover~W~|
108|Shroomish|P|Basic|50|G||R+10|W-20|1|Common|Headbutt~C~10;Toxic Spore~GC~20|
109|Shuckle|P|Basic|60|G||R+20||1|Common|Ferment Poison~GC~10|Pot Shell~Body
110|Shuppet|P|Basic|50|P||D+10|C-20|1|Common|Gossip~P~;Hang Down~CC~20|
111|Spinda|P|Basic|70|C||F+20||1|Common|Dish Out~C~;Synchro Punch~C~10+|
112|Squirtle|P|Basic|50|W||L+10||1|Common|Bubble~~;Aqua Tail~WC~20+|
113|Stantler|P|Basic|70|C||F+20||1|Common|Lead~~;Frighten Horn~CC~20|
114|Sunkern|P|Basic|40|G||R+10|W-20|1|Common|Sun Soak~C~;Seed Bomb~G~20|
115|Trapinch|P|Basic|50|F||W+10|L-20|1|Common|Inviting Trap~C~;Sand Tomb~F~10|
116|Venonat|P|Basic|50|G||R+10||1|Common|Stun Spore~C~;Signal Beam~G~10|
117|Voltorb|P|Basic|50|L||F+10|M-20|1|Common|Speed Ball~L~20;Big Explosion~LC~50|
118|Wooper|P|Basic|60|W||G+20|L-20|1|Common|Yawn~C~;Splatter~W~|
119|Bebe's Search|T|Supporter||||||0|Uncommon||
120|Night Maintenance|T|Item||||||0|Uncommon||
121|PlusPower|T|Item||||||0|Uncommon||
122|Professor Oak's Visit|T|Supporter||||||0|Uncommon||
123|Professor Rowan|T|Supporter||||||0|Uncommon||
124|Rival|T|Supporter||||||0|Uncommon||
125|Roseanne's Research|T|Supporter||||||0|Uncommon||
126|Team Galactic's Mars|T|Supporter||||||0|Uncommon||
127|Potion|T|Item||||||0|Common||
128|Switch|T|Item||||||0|Common||
129|Darkness Energy|E|Special||||||0|Uncommon||
130|Metal Energy|E|Special||||||0|Uncommon||
131|Gardevoir LV.X|P|Level-Up|130|P|Gardevoir|P×2||2|Rare Holo LV.X|Bring Down~PP~|Teleportation~Power
132|Honchkrow LV.X|P|Level-Up|110|D|Honchkrow|L+30|F-20|0|Rare Holo LV.X|Feint Attack~CC~;Darkness Wing~DDC~60|`;
const DATA=RAW.split('\n').map(row=>row.split('|'));
const READY=new Set([30,38,60,68,86,104,106,122,126,17,33,41,42,43,45,46,57,59,61,65,78,79,80,95,107,111,49,51,54,58,62,64,74,75,76,77,81,82,83,85,87,88,89,90,91,92,93,94,97,98,99,100,102,103,105,108,110,112,113,115,116,117,118,119,120,121,123,124,127,128,129,130]);
const noop={type:'noop'};
const flip=(heads,tails=noop)=>({type:'coinFlip',heads,tails});
const seq=(...effects)=>({type:'sequence',effects});
const status=s=>({type:'status',target:'opponentActive',status:s});
const extra=n=>({type:'bonusDamage',amount:n});
const lock=(action,target='opponentActive',duration='opponentTurn')=>({type:'lock',action,target,duration});
const EFFECTS={
 30:[{type:'status',target:'opponentActive',status:'paralysis',condition:{type:'damagedByAttackLastOpponentTurn'}},{type:'neoRule',rule:'dp3:30:lovelyKiss'}],
 38:[{type:'neoRule',rule:'dp3:38:petalDance'}],
 60:[{type:'benchDamage',side:'opponent',amount:20}],
 68:[noop],
 86:[flip({type:'neoRule',rule:'dp3:86:astonish'})],
 104:[{type:'neoRule',rule:'dp3:104:grope'},noop],
 106:[{type:'benchFromDeck',amount:2,choose:true,filter:{kind:'pokemon',stage:'Basic',name:['Shellos East Sea','Shellos West Sea']}},noop],
 17:[seq(status('sleep'),status('poison')),flip(seq(extra(30),{type:'healSelf',amount:30}))],
 33:[{type:'modifier',stat:'postWeaknessAttackDamage',amount:40,scope:'self',duration:'nextOwnTurn'},{type:'bonusDamage',amount:40,condition:{type:'selfDamaged'}}],
 41:[{type:'neoRule',rule:'dp3:41:leafHurricane'}],
 42:[{type:'energyDamage',source:'self',energyType:'Fighting',amount:10}],
 43:[{type:'selfDamage',amount:20}],
 45:[{type:'neoRule',rule:'dp3:45:drainPunch'},{type:'neoRule',rule:'dp3:45:homingUppercut'}],
 46:[status('burn'),{type:'neoRule',rule:'dp3:46:flareTail'}],
 57:[{type:'modifier',stat:'attackDamage',amount:20,scope:'self',duration:'nextOwnTurn'},status('poison')],
 59:[lock('retreat'),{type:'neoRule',rule:'dp3:59:powerGuillotine'}],
 61:[flip(extra(60)),{type:'bonusDamage',amount:20,condition:{type:'selfHasEnergyType',energyType:'Darkness'}}],
 65:[{type:'switch',side:'self'}],
 78:[{type:'bonusDamage',amount:10,condition:{type:'selfHasEnergyType',energyType:'Grass'}}],
 79:[{type:'bonusDamage',amount:10,condition:{type:'selfHasEnergyType',energyType:'Fighting'}}],
 80:[{type:'bonusDamage',amount:10,condition:{type:'selfHasEnergyType',energyType:'Metal'}}],
 95:[seq({type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},{type:'selectedDamage',target:'opponentPokemon',amount:20,ignoreWeakness:true,ignoreResistance:true})],
 107:[noop,seq({type:'discardEnergy',target:'self',energyType:'Water',amount:1},{type:'healSelf',amount:1000})],
 111:[seq({type:'draw',amount:1},{type:'draw',amount:1,fromBottom:true}),{type:'neoRule',rule:'dp3:111:synchroPunch'}],
 49:[{type:'nextAttackBonus',attackName:'Leek Slap',amount:30},{type:'lock',action:'attack',attackName:'Leek Slap',target:'self',duration:'nextOwnTurn'}],
 64:[{type:'nextAttackBonus',attackName:'Protect Charge',amount:50},{type:'modifier',stat:'damageReduction',amount:30,scope:'self',duration:'opponentTurn'}],
 76:[noop,{type:'damageFromDamage',source:'self',amount:1}],
 81:[noop,flip({type:'discardHand',side:'opponent',amount:1})],
 85:[{type:'draw',amount:1,fromBottom:true},noop],
 90:[{type:'removeStatus',target:'self'}],
 92:[{type:'neoRule',rule:'dp3:92:waterSport'},noop],
 100:[{type:'draw',amount:2,condition:{type:'selfStatus',status:'confusion'}},flip(status('confusion'),{type:'status',target:'self',status:'confusion'})],
 112:[flip(status('paralysis')),{type:'coinDamageByEnergy',energyType:'Water',countAttachedEnergyType:true,amount:10}],
 113:[{type:'searchChosen',source:'deck',filter:{kind:'trainer',trainerType:'Supporter'},amount:1},{type:'status',target:'opponentActive',status:'confusion',condition:{type:'opponentMatches',filter:{stage:'Basic'}}}],
 51:[{type:'healSelf',amount:10},noop],
 54:[flip({type:'actionLock',side:'opponent',cardType:'Supporter',duration:'opponentTurn'}),{type:'healSelf',amount:20}],
 58:[noop,flip(extra(30))],62:[status('sleep'),noop],
 74:[{type:'neoRule',rule:'dp1:58:aquaShower'},flip({type:'discardEnergyCard',target:'opponentActive',amount:1})],
 75:[{type:'lock',action:'attack',attackName:'Giant Wave',target:'self',duration:'nextOwnTurn'},noop],
 77:[status('sleep'),{type:'coinDamage',coins:4,amount:10,mode:'replace'}],
 82:[noop,{type:'selectedDamage',target:'opponentBench',amount:10}],
 83:[{type:'coinDamage',coins:2,amount:10,mode:'replace'}],
 87:[flip(status('paralysis')),flip(noop,{type:'selfDamage',amount:30})],
 88:[noop,{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'}],
 89:[{type:'forceOpponentSwitch'},noop],
 91:[flip(status('paralysis')),flip(extra(30))],
 93:[noop,status('poison')],94:[flip(status('paralysis')),noop],
 97:[{type:'draw',amount:1},seq(flip(status('poison')),flip(status('poison')))],
 98:[{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},{type:'selfDamage',amount:10}],
 99:[{type:'modifier',stat:'attackDamage',amount:-20,scope:'opponentActive',duration:'opponentTurn'},noop],
 102:[noop,flip(status('confusion'))],103:[flip(lock('attack')),noop],
 105:[{type:'healSelf',amount:20},noop],108:[noop,flip(status('poison'))],
 110:[{type:'damage',target:'opponentPokemon',amount:10},noop],
 115:[{type:'forceOpponentSwitch'},lock('retreat')],
 116:[flip(status('paralysis')),flip(status('confusion'))],
 117:[noop,{type:'selfDamage',amount:50}],
 118:[status('sleep'),seq({type:'damageRule',ignoreWeakness:true,ignoreResistance:true},{type:'selectedDamage',target:'opponentPokemon',amount:10})]
};
const PRINTS={
 30:['If Jynx was damaged by an attack during the opponent’s last turn, the Defending Pokémon is now Paralyzed.','Move 2 damage counters from Jynx to the Defending Pokémon, or 4 if Smoochum is underneath Jynx.'],
 38:['Flip 3 coins. Do 30 damage per heads; if 2 or more heads, Sunflora becomes Confused.'],
 60:['Does 20 damage to 1 of the opponent’s Benched Pokémon.'],
 68:[''],
 86:['Flip a coin. Heads: choose an opponent’s hand card randomly without looking, show it, then shuffle that SAME card into their deck.'],
 104:['Look at your top 2 deck cards; choose 1 for your hand and place the other at the bottom of your deck.',''],
 106:['Search your deck for up to 2 in any combination of Shellos East Sea or Shellos West Sea and Bench them. Shuffle afterward.',''],
 17:['The Defending Pokémon is now Asleep and Poisoned.','Flip a coin. Heads: 30 more damage and heal 30 damage from Roserade.'],
 33:['Next turn, attacks by Mothim that damage the Defending Pokémon do 40 more damage after Weakness and Resistance.','If Mothim has any damage counters, this attack does 40 more damage.'],
 41:['If the Defending Pokémon has fewer remaining HP than Wormadam Plant Cloak, it is now Confused.'],
 42:['Does 10 more damage for each Fighting Energy attached to Wormadam Sandy Cloak.'],
 43:['Wormadam Trash Cloak does 20 damage to itself.'],
 45:['Heal Breloom 10 damage for each Energy card attached to the Defending Pokémon.','If the Defending Pokémon has Retreat Cost 0, this attack does 60 more damage.'],
 46:['The Defending Pokémon is now Burned.','Flip a coin. Heads: discard one Fire Energy from Charmeleon to do 20 more damage.'],
 57:['During your next turn, Nidorino’s attacks do 20 more damage to the Defending Pokémon.','The Defending Pokémon is now Poisoned.'],
 59:['The Defending Pokémon cannot retreat next turn.','Flip 2 coins. If either is tails, this attack’s base damage is 10 instead of 100.'],
 61:['Flip a coin. Heads: 60 more damage.','If Raticate has Darkness Energy attached, this attack does 20 more damage.'],
 65:['Switch Skiploom with one of your Benched Pokémon.'],
 78:['If Burmy Plant Cloak has Grass Energy, 10 more damage.'],79:['If Burmy Sandy Cloak has Fighting Energy, 10 more damage.'],
 80:['If Burmy Trash Cloak has Metal Energy, 10 more damage.'],
 95:['Choose any opposing Pokémon; do 20 damage ignoring Weakness, Resistance and effects.'],
 107:['','Discard a Water Energy attached to Shellos West Sea and remove all damage counters from it.'],
 111:['Draw one card from the top and one card from the bottom of your deck.','If attached Basic Energy matches any Energy type on the Defending Pokémon, 30 more damage.'],
 49:["During your next turn, Leek Slap's base damage is 60.","Farfetch'd cannot use Leek Slap during your next turn."],
 64:["During your next turn, Protect Charge's base damage is 80.","During your opponent's next turn, damage done to Shelgon by attacks is reduced by 30."],
 76:['','Does 10 damage plus 10 more damage for each damage counter on Bagon.'],
 81:['','Flip a coin. If heads, discard a random card from your opponent’s hand without looking.'],
 85:['Draw one card from the bottom of your deck.',''],
 90:['Remove all Special Conditions from Hoppip.'],
 92:['If Lotad has less Energy attached than the Defending Pokémon, this attack does 20 more damage.',''],
 100:['If Psyduck is Confused, draw 2 cards.','Flip a coin. Heads: the Defending Pokémon is Confused. Tails: Psyduck is Confused.'],
 112:['Flip a coin. Heads: the Defending Pokémon is Paralyzed.','Flip a coin for each Water Energy attached to Squirtle. Does 20 damage plus 10 more for each heads.'],
 113:['Search your deck for a Supporter, reveal it and put it into your hand; shuffle your deck.','If the Defending Pokémon is not Evolved, it is now Confused.'],
 51:['Remove 1 damage counter from Ivysaur.',''],
 54:['Flip a coin. If heads, your opponent cannot play Supporters next turn.','Remove 2 damage counters from Lombre.'],
 58:['','Flip a coin. If heads, this attack does 30 more damage.'],
 62:['The Defending Pokémon is now Asleep.',''],
 74:['Does 10 damage to each of the opponent’s Pokémon, including Active.','Flip a coin. If heads, discard an Energy attached to the Defending Pokémon.'],
 75:['Wartortle cannot use Giant Wave next turn.',''],
 77:['The Defending Pokémon is now Asleep.','Flip 4 coins. Does 10 damage per heads.'],
 82:['','Does 10 damage to one opposing Benched Pokémon.'],
 83:['Flip 2 coins. Does 10 damage per heads.'],
 87:['Flip a coin. On heads, Paralyze the Defending Pokémon.','Flip a coin. On tails, Electabuzz does 30 damage to itself.'],
 88:['','If the Defending Pokémon attacks next turn, the opponent flips a coin; on tails the attack does nothing.'],
 89:['Your opponent switches the Defending Pokémon with one of their Benched Pokémon.',''],
 91:['Flip a coin. On heads Paralyze the Defending Pokémon.','Flip a coin. On heads, this attack does 30 more damage.'],
 93:['','The Defending Pokémon is now Poisoned.'],94:['Flip a coin. On heads, Paralyze the Defending Pokémon.',''],
 97:['Draw a card.','Flip 2 coins. If either is heads, the Defending Pokémon is now Poisoned.'],
 98:['Does 10 damage times the number of damage counters on Phanpy.','Phanpy does 10 damage to itself.'],
 99:['Damage from the Defending Pokémon’s attacks is reduced by 20 next turn.',''],
 102:['','Flip a coin. On heads, Confuse the Defending Pokémon.'],
 103:['Flip a coin. On heads, the Defending Pokémon cannot attack next turn.',''],
 105:['Remove 2 damage counters from Shellder.',''],
 108:['','Flip a coin. On heads, Poison the Defending Pokémon.'],
 110:['Put 1 damage counter on one of the opponent’s Pokémon.',''],
 115:['Switch the Defending Pokémon with an opposing Benched Pokémon.','The Defending Pokémon cannot retreat next turn.'],
 116:['Flip a coin. On heads, Paralyze the Defending Pokémon.','Flip a coin. On heads, Confuse the Defending Pokémon.'],
 117:['','Voltorb does 50 damage to itself.'],
 118:['The Defending Pokémon is now Asleep.','Choose one of your opponent’s Pokémon. Do 10 damage, ignoring Weakness and Resistance.']
};
const ABILITIES={
 38:[{type:'heal',target:'selfAll',amount:10,filter:{subtype:'Grass'}}],
 60:[{type:'healSelf',amount:30,condition:{type:'opponentEnergyAtLeast',energyType:'Water',amount:1,countSpecial:true}}],
 68:[{type:'heal',target:'opponentActive',amount:20}],
 41:[{type:'modifier',stat:'maxHp',amount:40,scope:'self',duration:'whileInPlay',condition:{type:'selfEnergyAtLeast',energyType:'Grass',amount:2,countSpecial:true}}],
 42:[{type:'preventEffects',duration:'whileInPlay'}],
 43:[{type:'modifier',stat:'damageReduction',amount:20,scope:'self',duration:'whileInPlay',condition:{type:'selfHasTool'}}],
 65:[{type:'modifier',stat:'damageReduction',amount:20,scope:'self',duration:'whileInPlay',condition:{type:'selfHasEnergyType',energyType:'Grass'},opponentFilter:{evolved:true}}],
 78:[{type:'attachEnergyFromDiscard',target:'self',energyType:'Grass',amount:1}],
 79:[{type:'attachEnergyFromDiscard',target:'self',energyType:'Fighting',amount:1}],
 80:[{type:'attachEnergyFromDiscard',target:'self',energyType:'Metal',amount:1}],
 90:[{type:'modifier',stat:'retreatCost',amount:-1,scope:'self',duration:'whileInPlay',condition:{type:'selfHasEnergyType',energyType:'Grass'}}]
};
const ABILITY_PRINTS={
 38:['Grass Whistle: Once per turn, heal 10 damage from each friendly Grass Pokémon. Cannot be used while Sunflora has a Special Condition.'],
 60:['Aqua Healing: Once per turn, if Quagsire is Active and the Defending Pokémon has Water Energy, heal Quagsire 30.'],
 68:['Kind: Once per turn, remove 2 damage counters from the Defending Pokémon.'],
 41:['Plant Cloak: With 2 or more Grass Energy attached, Wormadam Plant Cloak has +40 HP.'],
 42:['Sandy Cloak: Prevent all effects of attacks, excluding damage, done to Wormadam Sandy Cloak.'],
 43:['Trash Cloak: Damage taken is reduced by 20 if Wormadam Trash Cloak has a Pokémon Tool attached.'],
 65:['Cotton Balloon: With Grass Energy attached, reduce damage from opponent Evolved Pokémon attacks by 20.'],
 78:['Wear Cloak: Once on your turn, if Active, attach one Basic Grass Energy from your discard pile to Burmy.'],
 79:['Wear Cloak: Once on your turn, if Active, attach one Basic Fighting Energy from your discard pile to Burmy.'],
 80:['Wear Cloak: Once on your turn, if Active, attach one Basic Metal Energy from your discard pile to Burmy.'],
 90:['Cottonweed: If Hoppip has Grass Energy attached, its Retreat Cost is 0.']
};
const TRAINER_TEXT={
 119:'Put one card from your hand on top of your deck, then search for one Pokémon. You cannot play this if it is your only hand card.',
 120:'Shuffle up to three Pokémon and Basic Energy cards from your discard pile back into your deck.',
 121:'Attach to one of your Pokémon until end of turn; its attacks do 10 more to the Defending Pokémon.',
 122:'Draw three cards, then put one card from hand on the bottom of your deck.',
 123:'Keep one card from your hand, shuffle the rest into your deck and draw four cards.',
 124:'Reveal five cards from the top of your deck. Your opponent chooses three to put into your hand; return and shuffle the others.',
 125:'Search for up to two in any combination of Basic Pokémon and Basic Energy cards; put them into hand.',
 126:'Draw two cards, then choose one opponent hand card without looking and put it on the bottom of their deck.',
 127:'Remove two damage counters from one of your Pokémon.',128:'Switch your Active Pokémon with one of your Benched Pokémon.'
};
// Duplicated Trainer prints use the *same audited handler* as their earlier print.
const TRAINER_EFFECTS={
 119:{type:'neoRule',rule:'dp2:109:bebe'},120:{type:'neoRule',rule:'dp2:113:nightMaintenance'},
 121:{type:'modifier',stat:'postWeaknessAttackDamage',amount:10,duration:'whileInPlay',scope:'self'},
  122:{type:'neoRule',rule:'dp3:122:oakVisit'},126:seq({type:'draw',amount:2},{type:'neoRule',rule:'dp3:126:marsBottom'}),
 123:{type:'neoRule',rule:'dp1:112:rowan'},124:{type:'neoRule',rule:'dp1:113:rival'},
 127:{type:'heal',target:'selfPokemon',amount:20},128:{type:'switch',side:'self'}
};
const TRAINER_GATED='Printed Trainer effect is not yet verified for this set; battle use disabled.';
function parse(row){
 const [number,name,kind,stage,hp,code,from,weak,resist,retreat,rarity,moves,powers]=row;
 const n=Number(number),ready=READY.has(n),pokemon=kind==='P',trainer=kind==='T',id='dp3-'+n;
 const mod=s=>s?{type:T[s[0]],value:s.slice(1)}:null;
 const card={id,setId:'dp3',number:String(number),name,source:'tcg',battleFormat:'classic',rarity,
    image:`https://images.pokemontcg.io/dp3/${number}.png`,imageLarge:`https://images.pokemontcg.io/dp3/${number}_hires.png`,
    kind:pokemon?'pokemon':trainer?'trainer':'energy'};
 if(pokemon){
   const w=mod(weak),r=mod(resist);
   Object.assign(card,{stage,hp:Number(hp),types:[...code].map(c=>T[c]),subtype:T[code[0]],retreat:Number(retreat||0),evolvesFrom:from||null,
    weakness:w?.type||null,weaknessValue:w?.value||null,weaknesses:w?[w]:[],
    resistance:r?.type||null,resistanceValue:r?.value||null,resistances:r?[r]:[],
    attacks:(moves||'').split(';').filter(Boolean).map((s,i)=>{const [attackName,cost='',damageText='']=s.split('~');return {name:attackName,cost,
      damage:Number((damageText.match(/^\d+/)||[])[0]||0),damageText:damageText||null,
      text:PRINTS[n]?.[i]??'Printed attack effect awaiting implementation and verification.',effect:EFFECTS[n]?.[i]||noop};}),
    abilities:(powers||'').split(';').filter(Boolean).map(s=>{const [power,t]=s.split('~');return {name:power,type:t==='Power'?'activated':'passive',
      printedPowerType:t==='Power'?'power':'body',activeOnly:[60,78,79,80].includes(n),disabledByStatus:[38,60].includes(n),text:ABILITY_PRINTS[n]?.[0]||'Printed Poké-Power or Poké-Body awaiting verified effect and timing.',effect:ABILITIES[n]?.[0]||noop};}),
    isLevelX:stage==='Level-Up',levelUpFrom:stage==='Level-Up'?from:null,
    text:stage==='Level-Up'?'Only level up the Active Pokémon; the card retains prior attacks and Powers.':undefined});
   const full=[...card.attacks.map(a=>a.text),...card.abilities.map(a=>a.text)].join(' ').toLowerCase();
   const types=[...new Set(card.attacks.flatMap(a=>[...a.cost].filter(x=>x!=='C').map(x=>T[x])))];
   const roles=new Set();if(/draw|hand/.test(full))roles.add('draw');if(/search|recover|retrieve/.test(full))roles.add('search');
   if(/asleep|poison|confus|paraly|burn/.test(full))roles.add('status');
   card.deckMeta={roles:[...roles],synergy:[...roles],energyTypes:types,preferredEnergyTypes:[],inflicts:[],payoffs:[],preferredPartners:[],conditionalAttackEnergyTypes:[],babyEvolutionSupport:[]};
 }else if(trainer){card.trainerType=stage;card.text=TRAINER_TEXT[n]||TRAINER_GATED;card.effect=TRAINER_EFFECTS[n]||noop;}
 else {card.basicEnergy=false;card.specialEnergy=true;card.subtype=n===129?'Darkness':'Metal';card.types=[card.subtype];
   card.effect={type:'specialEnergy',provides:{[card.subtype]:1}};
   card.text=n===129?'Provides Darkness Energy; adds 10 damage only while attached to a Darkness Pokémon.':
   'Provides Metal Energy; reduces incoming attack damage by 10 only while attached to a Metal Pokémon.';}
 return Object.freeze({...card,battleEnabled:ready,deckEligible:ready,
    support:{status:ready?'FULL':'PARTIAL',reasons:ready?[]:['Attack, Power, or Trainer resolution pending verified implementation']}});
}
const CARDS=Object.freeze(DATA.map(parse));const MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,
 coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
