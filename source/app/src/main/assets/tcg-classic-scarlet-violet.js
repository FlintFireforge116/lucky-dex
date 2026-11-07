/* Scarlet & Violet base expansion — Classic30 gameplay adapter.
 * 258 official identities; gameplay enabled only where every printed effect
 * has an implemented equivalent. No guessed attacks, Abilities or Trainers.
 * Original metadata: PokemonTCG/pokemon-tcg-data (sv1, 31 March 2023).
 * All images are external card references; card assets are not duplicated.
 */
(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.LuckyDexClassicTCGScarletViolet=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET=Object.freeze({id:'sv1',name:'Scarlet & Violet',series:'Scarlet & Violet',releaseDate:'2023-03-31',cardCount:258});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Pineco|P|G|0|60|2|R|||Common|Guard Press~CC~10~*|
2|Heracross|P|G|0|120|2|R|||Uncommon|Superpowered Throw~GC~10+~*;Horn Attack~GGC~90~|
3|Shroomish|P|G|0|60|1|R|||Common|Absorb~G~10~*|
4|Breloom|P|G|1|110|1|R||Shroomish|Uncommon|Mach Cross~G~60~|
5|Cacnea|P|G|0|60|1|R|||Common|Light Punch~CC~30~|!
6|Cacturne|P|G|1|130|2|R||Cacnea|Uncommon|Spike Shot~CCC~110~|!
7|Tropius|P|G|0|100|1|R|||Common|Fresh-Picked Fruit~G~~*;Razor Leaf~GC~50~|
8|Scatterbug|P|G|0|30|1|R|||Common|Tackle~GC~20~|!
9|Spewpa|P|G|1|70|3|R||Scatterbug|Common|Bug Bite~GC~30~|!
10|Vivillon|P|G|2|120|1|R||Spewpa|Uncommon|Miracle Powder~G~50~*;Bug Buzz~GC~110~|
11|Skiddo|P|G|0|60|1|R|||Common|Vine Whip~G~10~;Smash Kick~CC~20~|
12|Gogoat|P|G|1|130|2|R||Skiddo|Common|Rising Lunge~CC~30+~*;Solar Beam~GCC~110~|
13|Sprigatito|P|G|0|70|1|R|||Common|Scratch~C~10~;Leafage~GC~20~|
14|Floragato|P|G|1|90|1|R||Sprigatito|Uncommon|Slash~C~20~;Leaf Step~GC~60~|
15|Meowscarada|P|G|2|160|1|R||Floragato|Rare|Trick Cape~C~40~*;Flower Blast~GC~130~|
16|Tarountula|P|G|0|40|1|R|||Common|String Haul~C~~*;Bug Bite~G~10~|
17|Tarountula|P|G|0|40|1|R|||Common|String Shot~GC~20~*|
18|Tarountula|P|G|0|60|2|R|||Common|Surprise Attack~G~30~*|
19|Spidops ex|P|G|1|260|2|R||Tarountula|Double Rare|Wire Hang~GC~90+~*|!
20|Smoliv|P|G|0|50|1|R|||Common|Tackle~CC~30~|
21|Smoliv|P|G|0|60|1|R|||Common|Nutrients~G~~*;Spray Fluid~GC~20~|
22|Dolliv|P|G|1|90|1|R||Smoliv|Common|Slap~C~20~;Apply Oil~GC~40~*|
23|Arboliva|P|G|2|150|2|R||Dolliv|Rare|Solar Beam~GGC~150~|!
24|Toedscool|P|G|0|50|1|R|||Common|Furious Kicks~G~10×~*|
25|Toedscool|P|G|0|60|2|R|||Common|Spore~G~~*;Ram~CC~10~|
26|Toedscruel|P|G|1|120|2|R||Toedscool|Uncommon|Eerie Tentacles~G~30~*;Triple Smash~GCC~80×~*|
27|Capsakid|P|G|0|60|1|R|||Common|Slightly Spicy~C~10~*|
28|Capsakid|P|G|0|70|1|R|||Common|Increasing Spice~C~~*;Playful Kick~GCC~50~|
29|Scovillain|P|G|1|110|1|R||Capsakid|Uncommon|Hot Bite~C~20~*;Super Spicy Breath~GCC~90+~*|
30|Growlithe|P|R|0|70|2|W|||Common|Relentless Flames~R~30×~*|
31|Growlithe|P|R|0|90|3|W|||Common|Stoke~C~~*;Fire Claws~RRR~70~|
32|Arcanine ex|P|R|1|280|3|W||Growlithe|Double Rare|Raging Claws~RR~30+~*;Bright Flame~RRR~250~*|
33|Houndour|P|R|0|70|1|W|||Common|Bite~C~10~;Flare~RC~30~|
34|Houndoom|P|R|1|120|2|W||Houndour|Common|Sharp Fang~C~30~;Fire Blast~RRC~150~*|
35|Torkoal|P|R|0|130|3|W|||Uncommon|Stampede~CC~30~;Concentrated Fire~RCC~80×~*|
36|Fuecoco|P|R|0|80|2|W|||Common|Gnaw~C~10~;Combustion~RRC~50~|
37|Crocalor|P|R|1|100|3|W||Fuecoco|Uncommon|Bite~RC~50~;Rolling Tackle~RRC~100~|
38|Skeledirge|P|R|2|180|3|W||Crocalor|Rare|Passionate Singing~R~50~*;Blazing Shout~RRC~190~*|
39|Charcadet|P|R|0|60|1|W|||Common|Ember~R~30~*|
40|Charcadet|P|R|0|70|1|W|||Common|Heat Blast~RRC~60~|
41|Armarouge|P|R|1|130|2|W||Charcadet|Rare|Flame Cannon~RRC~90~*|!
42|Slowpoke|P|W|0|70|2|L|||Common|Rest~C~~*;Headbutt~WC~20~|
43|Slowbro|P|W|1|100|3|L||Slowpoke|Rare|Bubble Drain~WC~60~*|!
44|Magikarp|P|W|0|30|1|L|||Common|Jump~W~~*|
45|Gyarados ex|P|W|1|300|4|L||Magikarp|Double Rare|Waterfall~WWW~100~;Tyrannical Tail~WWWCC~180+~*|
46|Buizel|P|W|0|70|1|L|||Common|Rain Splash~W~10~;Razor Fin~CC~20~|
47|Floatzel|P|W|1|120|1|L||Buizel|Uncommon|Hydro Pump~CC~50+~*|
48|Alomomola|P|W|0|120|2|L|||Common|Surf~WC~30~;Aqua Slash~WWC~120~*|
49|Clauncher|P|W|0|70|1|L|||Common|Vise Grip~W~10~|
50|Clawitzer|P|W|1|120|2|L||Clauncher|Common|Water Gun~WC~50~;Aqua Cannon~WWC~160~*|
51|Bruxish|P|W|0|100|1|L|||Common|Vivid Charge~W~~*;Wave Splash~WC~60~|
52|Quaxly|P|W|0|70|1|L|||Common|Pound~C~10~;Kick~WC~20~|
53|Quaxwell|P|W|1|100|1|L||Quaxly|Uncommon|Rain Splash~W~20~;Spiral Kick~WCC~70~|
54|Quaquaval|P|W|2|170|2|L||Quaxwell|Rare|Hydro Kick~WCC~140~|!
55|Wiglett|P|W|0|50|1|L|||Common|Twisting Strike~W~10~*|
56|Wiglett|P|W|0|60|1|L|||Common|Dig a Little~C~~*;Ram~CC~20~|
57|Wugtrio|P|W|1|90|2|L||Wiglett|Uncommon|Headbutt~W~30~;Undersea Tunnel~CCC~~*|
58|Cetoddle|P|W|0|80|2|M|||Common|Tackle~CC~30~|
59|Cetoddle|P|W|0|100|3|M|||Common|Icicle~W~10~;Sharp Fin~WCC~60~|
60|Cetitan|P|W|1|180|3|M||Cetoddle|Uncommon|Hammer In~CC~50~;Sweeping Tackle~WCC~200-~*|
61|Dondozo|P|W|0|160|4|L|||Rare|Release Rage~CC~50×~*;Heavy Splash~WWCC~120~|
62|Tatsugiri|P|W|0|70|1|L|||Uncommon|Mise en Place~W~~*;Curl Up~W~30~*|
63|Magnemite|P|L|0|60|1|F|||Common|Magnetic Switch~C~~*;Electro Ball~L~10~|
64|Magneton|P|L|1|90|2|F||Magnemite|Common|Lightning Ball~L~20~;Explosion~LL~90~*|
65|Magnezone ex|P|L|2|330|3|F||Magneton|Double Rare|Energy Crush~L~50×~*;Pulse Launcher~LL~220~*|
66|Mareep|P|L|0|60|1|F|||Common|Static Shock~L~10~;Electro Ball~LCC~40~|
67|Flaaffy|P|L|1|90|2|F||Mareep|Uncommon|Thunder Shock~L~20~*;Electro Ball~LCC~60~|
68|Pachirisu|P|L|0|70|1|F|||Uncommon|Everyone Discharge~LC~10+~*|!
69|Rotom|P|L|0|60|1|F|||Common|Linear Attack~C~~*|
70|Rotom|P|L|0|80|1|F|||Common|Junk Hunt~C~~*;Thunder Shock~L~20~*|
71|Toxel|P|L|0|70|2|F|||Common|Gnaw~CC~20~|
72|Toxtricity|P|L|1|130|2|F||Toxel|Uncommon|Yank Away~CC~~*;Thunder~LCC~120~*|
73|Pawmi|P|L|0|50|1|F|||Common|Jolt~L~~*|
74|Pawmi|P|L|0|60|1|F|||Common|Light Punch~C~10~;Zap Kick~LC~20~|
75|Pawmo|P|L|1|90|1|F||Pawmi|Common|Thunder Shock~L~30~*;Head Bolt~LLC~70~|
76|Pawmot|P|L|2|130|0|F||Pawmo|Rare|Electro Paws~LLC~230~*|!
77|Wattrel|P|L|0|50|1|L|F||Common|Collect~C~~*;Glide~LC~20~|
78|Wattrel|P|L|0|60|1|L|F||Common|Static Shock~L~20~|
79|Kilowattrel|P|L|1|120|1|L|F|Wattrel|Uncommon|Skill Dive~CC~~*;Thunder Blast~LCC~140~*|
80|Miraidon|P|L|0|120|1|F|||Rare|Sharp Fang~CC~30~;Lightning Laser~LLC~90~*|
81|Miraidon ex|P|L|0|220|1|F|||Double Rare|Photon Blaster~LLC~220~*|!
82|Drowzee|P|P|0|70|1|D|F||Common|Forced Sleep~P~~*;Gentle Slap~PCC~30~|
83|Hypno|P|P|1|110|2|D|F|Drowzee|Uncommon|Pendulum Influence~P~~*;Psychic Sphere~PCC~100~|
84|Ralts|P|P|0|70|1|D|F||Common|Psyshot~PC~30~|
85|Kirlia|P|P|1|90|1|D|F|Ralts|Common|Magical Shot~PC~30~;Psychic~PPC~60+~*|
86|Gardevoir ex|P|P|2|310|2|D|F|Kirlia|Double Rare|Miracle Force~PPC~190~*|!
87|Shuppet|P|P|0|60|1|D|F||Common|Enveloping Shadow~P~10~*|
88|Banette ex|P|P|1|250|2|D|F|Shuppet|Double Rare|Everlasting Darkness~P~30~*;Poltergeist~PC~60×~*|
89|Drifloon|P|P|0|70|1|D|F||Common|Gust~CC~10~;Balloon Blast~PP~30×~*|
90|Drifblim|P|P|1|110|1|D|F|Drifloon|Uncommon|Gust~CC~30~;Curse Spreading~PPP~~*|
91|Flabébé|P|P|0|40|1|M|||Common|Pollen Shot~P~20~|
92|Floette|P|P|1|70|1|M||Flabébé|Common|Magical Leaf~PC~30+~*|
93|Florges|P|P|2|140|2|M||Floette|Uncommon|Moonblast~PCC~120~*|!
94|Dedenne|P|P|0|70|1|M|||Common|Energy Munch~P~30~*|
95|Dedenne|P|P|0|70|1|M|||Common|Second Bite~PC~30+~*|
96|Klefki|P|P|0|70|1|M|||Rare|Joust~C~10~*|!
97|Fidough|P|P|0|50|1|M|||Common|Rear Kick~CC~20~|
98|Fidough|P|P|0|60|2|M|||Common|Springy~P~~*;Flop~PCC~30~|
99|Dachsbun|P|P|1|90|1|M||Fidough|Uncommon|Headbutt Bounce~PCC~100~|!
100|Flittle|P|P|0|30|0|D|F||Common|Ram~P~10~|
101|Flittle|P|P|0|40|1|D|F||Common|Spinning Attack~C~20~|
102|Flittle|P|P|0|40|1|D|F||Common|Dash Off~P~10~*|
103|Espathra|P|P|1|110|0|D|F|Flittle|Uncommon|Eye Strength~P~20~*;Psychic~PCC~30+~*|
104|Greavard|P|P|0|70|2|D|F||Common|Graveyard Gamboling~P~10×~*|
105|Greavard|P|P|0|80|3|D|F||Common|Underworld Stroll~CC~~*;Sharp Fang~PCC~30~|
106|Houndstone|P|P|1|140|3|D|F|Greavard|Rare|Last Respects~PP~80+~*|
107|Mankey|P|F|0|60|1|P|||Common|Monkey Beatdown~F~30~*|
108|Primeape|P|F|1|90|1|P||Mankey|Common|Raging Punch~F~70~*|
109|Annihilape|P|F|2|140|2|P||Primeape|Rare|Rage Fist~F~70×~*;Dynamite Punch~FF~170~*|
110|Meditite|P|F|0|60|1|P|||Common|Feint~F~10~*|
111|Medicham|P|F|1|90|1|P||Meditite|Uncommon|Acu-Punch-Ture~F~30~*;Kick Shot~F~90~*|
112|Riolu|P|F|0|70|1|P|||Common|Jab~C~10~;Low Kick~FC~20~|
113|Riolu|P|F|0|70|1|P|||Common|Punch~F~10~;Reckless Charge~FC~50~*|
114|Lucario|P|F|1|130|2|P||Riolu|Uncommon|Avenging Knuckle~F~30+~*;Accelerating Stab~FCC~120~*|
115|Sandile|P|F|0|70|2|G|||Common|Gnaw~F~10~;Ram~FF~30~|
116|Krokorok|P|F|1|100|2|G||Sandile|Common|Payback~F~30+~*;Corkscrew Punch~FF~60~|
117|Krookodile|P|F|2|170|3|G||Krokorok|Uncommon|Chomp Chomp Bite~F~50~*;Earthquake~FF~180~*|
118|Hawlucha|P|F|0|70|1|P|||Rare|Wing Attack~FCC~70~|!
119|Silicobra|P|F|0|80|2|G|||Common|Mud-Slap~FC~30~|
120|Sandaconda|P|F|1|140|3|G||Silicobra|Uncommon|Skull Bash~FFC~120~;Sandstorm Spray~FFFC~~*|
121|Stonjourner|P|F|0|130|2|G|||Uncommon|Mega Kick~FCC~100~|!
122|Klawf|P|F|0|130|3|G|||Rare|Vise Grip~FF~50~;Adrenaline Hammer~FFF~130~*|
123|Great Tusk ex|P|F|0|250|4|P|||Double Rare|Bedrock Breaker~F~40~*;Gigantic Tusks~FFF~250~*|
124|Koraidon|P|F|0|130|2|P|||Rare|Claw Slash~CCC~70~;Rampaging Fang~FFFC~190~*|
125|Koraidon ex|P|F|0|230|2|P|||Double Rare|Wild Impact~FFC~220~*|!
126|Grimer|P|D|0|80|3|F|||Common|Super Poison Breath~DCC~50~*|
127|Muk|P|D|1|140|4|F||Grimer|Uncommon|Toxic Strike~DCCC~100~*|!
128|Seviper|P|D|0|120|2|F|||Common|Spit Poison~D~~*;Venoshock~DCC~60+~*|
129|Spiritomb|P|D|0|70|1|G|||Uncommon|Taunt~D~~*;Doom Decree~DD~~*|
130|Croagunk|P|D|0|70|1|F|||Common|Beat~D~10~;Whap Down~DCC~40~|
131|Toxicroak ex|P|D|1|250|2|F||Croagunk|Double Rare|Nasty Plot~D~~*;Toxic Ripper~DCC~120~*|
132|Pawniard|P|D|0|70|1|G|||Common|Scratch~C~10~;Pierce~DC~20~|
133|Bisharp|P|D|1|120|1|G||Pawniard|Common|Dark Cutter~D~40~;Double-Edged Slash~DC~120~*|
134|Kingambit|P|D|2|170|3|G||Bisharp|Rare|Hack At~DCC~160~|!
135|Maschiff|P|D|0|70|2|G|||Common|Rear Kick~D~10~;Darkness Fang~DC~20~|
136|Maschiff|P|D|0|80|3|G|||Common|Crunch~DD~30~*|
137|Mabosstiff|P|D|1|130|3|G||Maschiff|Uncommon|Wild Tackle~DDC~160~*|!
138|Bombirdier|P|D|0|110|1|L|F||Uncommon|Knickknack Carrying~C~~*;Clutch~DC~60~*|
139|Forretress|P|M|1|120|3|R|G|Pineco|Uncommon|Continuous Spin~M~50×~*;Rolling Shell~MCC~90~*|
140|Varoom|P|M|0|60|1|R|G||Common|Poison Gas~C~~*|
141|Varoom|P|M|0|80|2|R|G||Common|Hammer In~MCC~60~|
142|Revavroom|P|M|1|140|2|R|G|Varoom|Rare|Knock Away~MCCC~90+~*|!
143|Iron Treads ex|P|M|0|220|3|R|G||Double Rare|Triple Laser~CCC~~*;Cybernetic Wheels~MMMC~160~*|
144|Chansey|P|C|0|110|2|F|||Common|Pound~CC~40~;Egg Rolling~CCC~60×~*|
145|Blissey|P|C|1|150|2|F||Chansey|Uncommon|Happy Cyclone~CCC~150~*|!
146|Zangoose|P|C|0|90|1|F|||Common|Slash~C~40~|
147|Zangoose|P|C|0|110|2|F|||Uncommon|Drag Off~CC~~*;Slashing Claw~CCC~80~|
148|Starly|P|C|0|60|1|L|F||Common|Flap~C~20~|
149|Staravia|P|C|1|80|1|L|F|Starly|Common|Wing Attack~CC~40~;Speed Dive~CCC~80~|
150|Staraptor|P|C|2|150|1|L|F|Staravia|Uncommon|Tailspin Away~CC~60~*;Power Blast~CCC~180~*|
151|Skwovet|P|C|0|60|1|F|||Common|Bite~CC~20~|!
152|Greedent|P|C|1|120|2|F||Skwovet|Uncommon|Bite~CC~50~;Enhanced Fang~CCC~80+~*|
153|Indeedee|P|C|0|90|1|F|||Rare|Expert Nurturer~C~~*;Hypnoblast~CC~30~*|
154|Lechonk|P|C|0|60|1|F|||Common|Repelling Odor~C~~*;Stampede~CC~20~|
155|Lechonk|P|C|0|60|1|F|||Common|Collect~C~~*;Tackle~CCC~30~|
156|Lechonk|P|C|0|70|1|F|||Common|Whimsy Tackle~CCC~70~*|
157|Oinkologne|P|C|1|120|2|F||Lechonk|Uncommon|Ram~CC~50~;Leg Stomp~CCC~130~*|
158|Oinkologne ex|P|C|1|260|2|F||Lechonk|Double Rare|Maddening Scent~C~10+~*;Heavy Stomp~CCC~210~*|
159|Tandemaus|P|C|0|30|1|F|||Common|Gnaw~C~20~|
160|Tandemaus|P|C|0|40|1|F|||Common|Double Hit~CC~30×~*|
161|Maushold|P|C|1|70|1|F||Tandemaus|Uncommon|Slap~C~40~;Family Attack~CC~70×~*|
162|Squawkabilly|P|C|0|70|1|L|F||Common|Call for Family~C~~*;Fly~CC~60~*|
163|Cyclizar|P|C|0|110|1|F|||Uncommon|Reckless Charge~CC~70~*|
164|Cyclizar|P|C|0|110|0|F|||Rare|Touring~C~~*;Speed Attack~CCC~100~|
165|Flamigo|P|C|0|110|1|L|F||Uncommon|Flap~C~30~;Nosedive~CCC~110~*|
166|Arven|T||0||0||||Uncommon||
167|Beach Court|T||0||0||||Uncommon||
168|Crushing Hammer|T||0||0||||Common||
169|Defiance Band|T||0||0||||Uncommon||
170|Electric Generator|T||0||0||||Uncommon||
171|Energy Retrieval|T||0||0||||Common||
172|Energy Search|T||0||0||||Common||
173|Energy Switch|T||0||0||||Common||
174|Exp. Share|T||0||0||||Uncommon||
175|Jacq|T||0||0||||Uncommon||
176|Judge|T||0||0||||Uncommon||
177|Katy|T||0||0||||Uncommon||
178|Mesagoza|T||0||0||||Uncommon||
179|Miriam|T||0||0||||Uncommon||
180|Nemona|T||0||0||||Common||
181|Nest Ball|T||0||0||||Uncommon||
182|Pal Pad|T||0||0||||Common||
183|Penny|T||0||0||||Uncommon||
184|Picnic Basket|T||0||0||||Uncommon||
185|Poké Ball|T||0||0||||Common||
186|Pokégear 3.0|T||0||0||||Common||
187|Pokémon Catcher|T||0||0||||Common||
188|Potion|T||0||0||||Common||
189|Professor's Research (Professor Sada)|T||0||0||||Rare||
190|Professor's Research (Professor Turo)|T||0||0||||Rare||
191|Rare Candy|T||0||0||||Common||
192|Rock Chestplate|T||0||0||||Uncommon||
193|Rocky Helmet|T||0||0||||Uncommon||
194|Switch|T||0||0||||Common||
195|Team Star Grunt|T||0||0||||Uncommon||
196|Ultra Ball|T||0||0||||Uncommon||
197|Vitality Band|T||0||0||||Uncommon||
198|Youngster|T||0||0||||Uncommon||`.trim().split('\n');
const ALTS=Object.fromEntries('199:17 200:22 201:24 202:29 203:41 204:42 205:49 206:55 207:61 208:68 209:76 210:82 211:84 212:85 213:98 214:104 215:113 216:115 217:122 218:137 219:138 220:134 221:148 222:151 223:19 224:32 225:45 226:65 227:81 228:86 229:88 230:123 231:125 232:131 233:143 234:158 235:166 236:175 237:177 238:179 239:183 240:189 241:190 242:195 243:19 244:81 245:86 246:123 247:125 248:143 249:166 250:175 251:179 252:183 253:81 254:125 255:181 256:191'.split(' ').map(x=>x.split(':').map(Number)));
const noop={type:'noop'},paralyse={type:'status',target:'opponentActive',status:'paralysis'},burn={type:'status',target:'opponentActive',status:'burn'},poison={type:'status',target:'opponentActive',status:'poison'};
const lock={type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'};
const coin=(heads,tails=noop)=>({type:'coinFlip',heads,tails});
const selfDamage=n=>({type:'selfDamage',amount:n});
const discard=(count,energyType)=>({type:'discardEnergyCard',target:'self',amount:count,...(energyType?{energyType}:{})});
const increase=(amount,condition)=>({type:'bonusDamage',amount,condition});
// Print-number + attack index. IMPORTANT: only complete, reviewed mappings.
const ATTACK_RULES={
  '3:0':{type:'healSelf',amount:10},
  '12:0':coin({type:'bonusDamage',amount:30}),
  '17:0':coin(paralyse),'18:0':{type:'coinAttackGate',heads:noop},
  '27:0':coin(burn),'30:0':{type:'coinDamage',coins:'untilTails',amount:30,mode:'replace'},
  '32:0':{type:'damageFromDamage',source:'self',amount:1},'32:1':discard(2,'Fire'),
  '34:1':discard(1),'39:0':discard(1),
  '45:1':increase(180,{type:'opponentDamaged'}),
  '47:0':{type:'energyDamage',source:'self',energyType:'Water',amount:20},
  '48:1':lock,'50:1':lock,
  '55:0':coin({type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}),
  '64:1':selfDamage(90),'67:0':coin(paralyse),
  '75:0':coin(paralyse),'81:0':lock,
  '85:1':{type:'energyDamage',source:'opponent',amount:20},
  '113:1':selfDamage(20),
  '123:0':{type:'discardStadium'},'123:1':selfDamage(50),
  '124:1':discard(3),
  '126:0':poison,'133:1':selfDamage(30),
  '136:0':coin({type:'discardEnergyCard',target:'opponentActive',amount:1}),
  '144:1':{type:'coinDamage',coins:'untilTails',amount:60,mode:'replace'},
  '157:1':coin(noop,lock),
  '158:0':{type:'benchCountDamage',side:'opponent',amount:30},'158:1':coin(noop,lock),
  '160:0':{type:'coinDamage',coins:2,amount:30,mode:'replace'},
  '163:0':selfDamage(10),'165:1':selfDamage(20)
};

// Printed SV1 move implementations. Effects unsupported by the Classic engine
// stay out of the battle pool rather than becoming zero-effect placeholders.
const sv=(rule,more={})=>({type:'lentalRule',rule:'sv1:'+rule,...more});
const seq=(...effects)=>({type:'sequence',effects});
const flip=(heads,tails={type:'noop'})=>({type:'coinFlip',heads,tails});
const guarded=(amount)=>({type:'modifier',stat:'damageReduction',amount,duration:'opponentTurn',target:'self'});
const pick=(name)=>({kind:'pokemon',name});
Object.assign(ATTACK_RULES,{
 '1:0':guarded(30),
 '2:0':{type:'retreatCostDamage',amount:30},
 '7:0':{type:'heal',target:'selfBench',amount:60},
 '10:0':flip(sv('specialCondition')),
 '15:0':sv('trickCape'),
 '16:0':flip({type:'forceOpponentSwitch'}),
 '19:0':{type:'retreatCostDamage',amount:30},
 '21:0':{type:'heal',target:'selfPokemon',amount:30},
 '22:1':{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},
 '24:0':{type:'coinDamage',coins:3,amount:10,mode:'replace'},
 '25:0':{type:'status',target:'opponentActive',status:'sleep'},
 '26:0':sv('eerieTentacles'),
 '26:1':{type:'coinDamage',coins:3,amount:80,mode:'replace'},
 '28:0':{type:'attachEnergy',target:'self',energyType:'Fire',amount:1},
 '29:0':{type:'status',target:'opponentActive',status:'burn'},
 '29:1':{type:'bonusDamage',amount:90,condition:{type:'selfHasEnergyType',energyType:'Fire'}},
 '31:0':{type:'attachEnergy',target:'self',energyType:'Fire',amount:2},
 '35:1':{type:'coinDamageByEnergy',energyType:'Fire',amount:80,mode:'replace'},
 '38:0':sv('passionateSinging'),'38:1':{type:'selfDamage',amount:30},
 '41:0':{type:'status',target:'opponentActive',status:'burn'},
 '42:0':seq({type:'healSelf',amount:30},{type:'status',target:'self',status:'sleep'}),
 '43:0':{type:'healSelf',amount:30},
 '44:0':flip({type:'selectedDamage',target:'opponentPokemon',amount:10}),
 '51:0':sv('energyFromZoneToHand', {amount:3}),
 '56:0':flip({type:'discardTop',side:'opponent',amount:1}),
 '57:1':{type:'coinRepeatEffect',coins:3,effect:{type:'discardTop',side:'opponent',amount:3}},
 '60:1':{type:'selfDamagePenalty',amount:2,mode:'add'},
 '61:0':{type:'discardCountDamage',amount:50,mode:'replace',filter:{name:'Tatsugiri'}},
 '62:0':sv('miseEnPlace'),'62:1':{type:'returnToHand',target:'self',includeAttached:true},
 '63:0':{type:'switch',side:'self'},
 '65:0':{type:'energyDamage',source:'opponent',all:true,countCards:true,amount:50,mode:'replace'},
 '65:1':{type:'selfDamage',amount:30},
 '68:0':seq({type:'benchCountDamage',side:'self',pokemonType:'Lightning',amount:20},{type:'damageRule',ignoreWeakness:true}),
 '69:0':{type:'selectedDamage',target:'opponentPokemon',amount:20},
 '70:0':{type:'searchChosen',source:'discard',amount:1,filter:{kind:'trainer',trainerType:'Item'}},
 '70:1':flip({type:'status',target:'opponentActive',status:'paralysis'}),
 '72:0':seq({type:'shuffleRandomHandCard',side:'opponent'},{type:'shuffleRandomHandCard',side:'opponent'}),
 '72:1':{type:'selfDamage',amount:20},
 '73:0':flip({type:'status',target:'opponentActive',status:'paralysis'}),
 '76:0':{type:'discardEnergyCard',target:'self',amount:'all'},
 '77:0':{type:'draw',side:'self',amount:1},
 '79:0':{type:'selectedDamage',target:'opponentPokemon',amount:50},
 '79:1':{type:'discardEnergyCard',target:'self',amount:1,energyType:'Lightning'},
 '80:1':{type:'benchDamage',side:'opponent',amount:30},
 '82:0':seq({type:'forceOpponentSwitch'},{type:'status',target:'opponentActive',status:'sleep'}),
 '83:0':flip({type:'copyAttack',source:'opponentPokemon',ignoreUseCosts:true}),
 '86:0':{type:'removeStatus',target:'self'},
 '87:0':flip({type:'actionLock',side:'opponent',cardType:'Item',duration:'opponentTurn'}),
 '88:0':{type:'actionLock',side:'opponent',cardType:'Item',duration:'opponentTurn'},
 '88:1':{type:'filteredHandCountDamage',side:'opponent',filter:{kind:'trainer'},amount:60,mode:'replace'},
 '89:1':{type:'damageFromDamage',source:'self',amount:3,mode:'replace'},
 '90:1':sv('curseSpreading'),
 '92:0':flip(seq({type:'bonusDamage',amount:30},{type:'healSelf',amount:30})),
 '93:0':{type:'modifier',stat:'attackDamage',amount:-30,scope:'opponentActive',duration:'opponentTurn'},
 '94:0':flip({type:'discardEnergyCard',target:'opponentActive',amount:1}),
 '95:0':{type:'damageFromDamage',source:'opponent',amount:1},
 '96:0':{type:'discardTool',target:'opponentActive'},
 '98:0':guarded(30),
 '102:0':{type:'switch',side:'self'},
 '103:0':{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},
 '103:1':{type:'energyDamage',source:'opponent',amount:50},
 '104:0':{type:'discardCountDamage',amount:10,mode:'replace',filter:{kind:'pokemon',subtype:'Psychic'}},
 '105:0':sv('supporterToBottom'),
 '106:0':{type:'discardCountDamage',amount:10,filter:{kind:'pokemon',subtype:'Psychic'}},
 '107:0':{type:'selfDamage',amount:10},'108:0':{type:'selfDamage',amount:20},
 '109:0':sv('rageFist'), '109:1':{type:'selfDamage',amount:50},
 '110:0':{type:'damageRule',ignoreResistance:true},
 '111:0':{type:'chooseAttackLock',duration:'opponentTurn'},'111:1':{type:'coinAttackGate',heads:{type:'noop'}},
 '114:0':sv('avengingKnuckle'),'114:1':{type:'lock',target:'self',action:'attack',attackName:'Accelerating Stab',duration:'nextOwnTurn'},
 '116:0':sv('payback'),
 '117:0':{type:'coinUntilTails',effect:{type:'discardEnergyCard',target:'opponentActive',amount:1}},
 '117:1':{type:'benchDamage',side:'self',all:true,amount:30},
 '120:1':sv('sandstormSpray'),
 '122:1':{type:'status',target:'self',status:'confusion'},
 '125:0':{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'},
 '127:0':{type:'status',target:'opponentActive',status:'poison'},
 '128:0':{type:'status',target:'opponentActive',status:'poison'},
 '128:1':{type:'bonusDamage',amount:120,condition:{type:'opponentStatus',status:'poison'}},
 '129:0':{type:'forceOpponentSwitch'},
 '129:1':sv('doomDecree'),
 '131:0':{type:'searchChosen',source:'deck',amount:2},
 '131:1':{type:'status',target:'opponentActive',status:'poison',amount:60},
 '137:0':{type:'selfDamage',amount:30},
 '138:0':{type:'searchChosen',source:'deck',amount:3,filter:{kind:'trainer',trainerType:'Tool'}},
 '138:1':{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},
 '139:0':{type:'coinDamage',coins:'untilTails',amount:50,mode:'replace'},
 '139:1':guarded(50),
 '140:0':{type:'status',target:'opponentActive',status:'poison'},
 '142:0':flip({type:'bonusDamage',amount:90}),
 '143:0':sv('tripleLaser'),'143:1':{type:'switch',side:'self'},
 '145:0':sv('happyCyclone'),
 '147:0':sv('dragOff'),
 '150:0':{type:'preventDamage',target:'self',duration:'opponentTurn',attackerFilter:{stage:'Basic'}},
 '150:1':{type:'discardEnergyCard',target:'self',amount:1},
 '152:1':{type:'bonusDamage',amount:80,condition:{type:'selfHasTool'}},
 '153:0':{type:'evolveFromDeck'},
 '153:1':{type:'status',target:'opponentActive',status:'sleep'},
 '154:0':{type:'forceOpponentSwitch'},
 '155:0':{type:'draw',side:'self',amount:1},
 '156:0':{type:'coinAttackGate',heads:{type:'noop'}},
 '161:1':{type:'fieldCountDamage',side:'self',filter:{name:'Maushold'},amount:70,mode:'replace'},
 '162:0':{type:'benchFromDeck',amount:2,filter:{kind:'pokemon',stage:'Basic'}},
 '162:1':{type:'coinAttackGate',heads:{type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}},
 '164:0':{type:'draw',side:'self',amount:2}
});

// Modern Pokémon ex are worth TWO Prizes. Their print variants reuse identical
// gameplay only after a signature-verified matching normal print was identified.
// A Tera Bench protection rule is implemented as a Bench-only passive Ability.
const TERA=new Set([32,45]);
const ABILITIES={
  81:[{name:'Tandem Unit',type:'activated',oncePerTurn:true,
      effect:{type:'benchFromDeck',amount:2,filter:{kind:'pokemon',stage:'Basic',subtype:'Lightning'}}}]
};

// Full-print SV1 Abilities. The modern Tera rule is handled separately.
Object.assign(ABILITIES,{
 5:[{name:'Counterattack Quills',type:'triggered',event:'damagedByAttack',activeOnly:true,opponentAttackOnly:true,effect:{type:'damage',target:'opponentActive',amount:30}}],
 6:[{name:'Counterattack Quills',type:'triggered',event:'damagedByAttack',activeOnly:true,opponentAttackOnly:true,effect:{type:'damage',target:'opponentActive',amount:30}}],
 8:[{name:'Adaptive Evolution',type:'passive',effect:{type:'evolutionTimingOverride',firstTurn:true,sameTurn:true}}],
 9:[{name:'Adaptive Evolution',type:'passive',effect:{type:'evolutionTimingOverride',firstTurn:true,sameTurn:true}}],
 19:[{name:'Trap Territory',type:'passive',effect:{type:'modifier',stat:'retreatCost',amount:1,scope:'opponentActive',duration:'whileInPlay'}}],
 23:[{name:'Enriching Oil',type:'triggered',event:'evolved',fromHandOnly:true,effect:sv('enrichingOil')}],
 41:[{name:'Fire Off',type:'activated',oncePerTurn:false,effect:sv('fireOff')}],
 43:[{name:'Strange Behavior',type:'activated',oncePerTurn:false,effect:sv('strangeBehavior')}],
 54:[{name:'Energy Carnival',type:'activated',oncePerTurn:true,effect:sv('energyCarnival')}],
 68:[{name:'Electricity Pouches',type:'passive',effect:{type:'preventStatus',target:'self',status:'paralysis',duration:'whileInPlay'}}],
 76:[{name:'Electrogenesis',type:'activated',oncePerTurn:true,effect:{type:'attachEnergy',target:'self',energyType:'Lightning',amount:1}}],
 86:[{name:'Psychic Embrace',type:'activated',oncePerTurn:false,effect:sv('psychicEmbrace')}],
 93:[{name:'Blooming Garden',type:'passive',effect:{type:'weaknessGuard',target:'selfAll',duration:'whileInPlay'}}],
 96:[{name:'Mischievous Lock',type:'passive',activeOnly:true,effect:{type:'abilitySuppression',filter:{stage:'Basic'},scope:'both',duration:'whileActive'}}],
 99:[{name:'Well-Baked Body',type:'passive',effect:sv('wellBakedBody')}],
 118:[{name:'Flying Entry',type:'triggered',event:'benched',fromHandOnly:true,effect:sv('flyingEntry')}],
 121:[{name:'Exoskeleton',type:'passive',effect:{type:'modifier',stat:'damageReduction',amount:20,duration:'whileInPlay',scope:'self'}}],
 125:[{name:'Dino Cry',type:'activated',oncePerTurn:true,effect:sv('dinoCry')}],
 127:[{name:'Poison Sacs',type:'passive',effect:sv('poisonSacs')}],
 134:[{name:'Leadership',type:'passive',effect:{type:'modifier',stat:'attackDamage',amount:30,scope:'team',duration:'whileInPlay',filter:{stage:'Basic'}}}],
 137:[{name:'Intimidating Howl',type:'activated',oncePerTurn:true,effect:{type:'forceOpponentSwitch'}}],
 142:[{name:'Rumbling Engine',type:'activated',oncePerTurn:true,effect:sv('rumblingEngine')}],
 145:[{name:'Busybody Nurse',type:'activated',oncePerTurn:true,effect:{type:'removeStatus',target:'selfActive'}}],
 151:[{name:'Nest Stash',type:'activated',oncePerTurn:true,effect:sv('nestStash')}]
});

const ATTACK_SUMMARIES={
  '32:0':'Deal 30 plus 10 additional damage for each damage counter on Arcanine ex.',
  '32:1':'Deal 250 damage and discard 2 Fire Energy from this Pokémon.',
  '45:1':'Deal 180 extra damage if the opponent’s Active Pokémon is already damaged.',
  '47:0':'Deal 50 plus 20 extra damage for each Water Energy on Floatzel.',
  '81:0':'Deal 220 damage. This Pokémon cannot attack during your next turn.',
  '123:0':'Deal 40 damage and discard the Stadium in play.',
  '123:1':'Deal 250 damage, then place 50 damage on this Pokémon.',
  '158:0':'Deal 10 plus 30 extra damage for each opposing Benched Pokémon.',
  '158:1':'Deal 210 damage; on Tails, this Pokémon cannot attack next turn.'
};
function describeEffect(rule,base){
 const t=rule.type;
 if(t==='selfDamage')return `Deal ${base} damage and ${rule.amount} damage to yourself.`;
 if(t==='discardEnergyCard')return `Deal ${base} damage and discard ${rule.amount} attached Energy card(s).`;
 if(t==='coinDamage')return `Flip coins for damage in multiples of ${rule.amount}.`;
 if(t==='coinAttackGate')return `Flip a coin. On Tails the attack fails.`;
 if(t==='coinFlip')return `Deal ${base} damage and flip a coin to resolve an additional effect.`;
 if(t==='healSelf')return `Deal ${base} damage and heal ${rule.amount} damage from this Pokémon.`;
 if(t==='status')return `Deal ${base} damage and inflict ${rule.status}.`;
 if(t==='energyDamage'||t==='benchCountDamage'||t==='damageFromDamage'||t==='bonusDamage')return 'Damage varies with the described Energy or board condition.';
 if(t==='lock')return `Deal ${base} damage; this Pokémon cannot attack on your next turn.`;
 if(t==='discardStadium')return `Deal ${base} damage and discard the Stadium.`;
 return 'The additional attack effect is supported in Classic battle.';
}
// Human-readable effect text mirrors the official SV1 print, rather than
// generic engine messages that obscure conditions and side-effects.
Object.assign(ATTACK_SUMMARIES,{
 '1:0':'During your opponent’s next turn, Pineco takes 30 less attack damage, after Weakness and Resistance.',
 '2:0':'10 damage plus 30 for each Energy in the Defending Pokémon’s Retreat Cost.',
 '7:0':'Heal 60 damage from one of your Benched Pokémon.',
 '10:0':'Flip a coin. On Heads, choose a Special Condition for the Defending Pokémon.',
 '15:0':'You may return an attached Energy from your opponent’s Active Pokémon to its owner’s hand.',
 '16:0':'Flip a coin. On Heads, switch in an opposing Benched Pokémon.',
 '19:0':'90 damage plus 30 for each Energy in the Defending Pokémon’s Retreat Cost.',
 '21:0':'Heal 30 damage from one of your Pokémon.',
 '22:1':'On the opponent’s next turn, a Tails flip cancels the Defending Pokémon’s attack.',
 '24:0':'Flip three coins. Deal 10 damage for each Heads.',
 '25:0':'The Defending Pokémon is now Asleep.',
 '26:0':'You may move an Energy from the Defending Pokémon to one of your opponent’s Benched Pokémon.',
 '26:1':'Flip three coins. Deal 80 damage for each Heads.',
 '28:0':'Take the next matching Fire Energy from the ordered Energy Zone and attach it to Capsakid.',
 '29:0':'The Defending Pokémon is now Burned.',
 '29:1':'90 damage, or 180 if Scovillain has any Fire Energy attached.',
 '31:0':'Take up to two matching Fire Energy from the ordered Energy Zone and attach them to Growlithe.',
 '35:1':'Flip one coin per attached Fire Energy. Deal 80 damage for each Heads.',
 '38:0':'Deal 50 damage; attach up to two Basic Energy from your discard to your Pokémon.',
 '38:1':'190 damage; Skeledirge takes 30 damage too.',
 '41:0':'90 damage and Burn the Defending Pokémon.',
 '42:0':'Heal 30 damage from Slowpoke, then make Slowpoke Asleep.',
 '43:0':'60 damage, then heal 30 from Slowbro.',
 '44:0':'Flip a coin. On Heads, deal 10 to one opposing Pokémon. No Weakness or Resistance on Bench.',
 '51:0':'Take up to three Basic Energy from the top of the ordered Energy Zone into your hand.',
 '56:0':'Flip a coin. On Heads, discard the top card of the opposing deck.',
 '57:1':'Flip three coins; for every Heads, discard three cards from the top of the opposing deck.',
 '60:1':'200 damage minus 20 per damage counter on Cetitan.',
 '61:0':'50 damage for each Tatsugiri in your discard pile.',
 '62:0':'Attach up to two Water Energy from the ordered Energy Zone to one of your Basic Pokémon.',
 '62:1':'30 damage; return Tatsugiri and its attached cards to your hand.',
 '63:0':'Switch Magnemite with one of your Benched Pokémon.',
 '65:0':'50 damage for every Energy attached to all opposing Pokémon.',
 '65:1':'220 damage; Magnezone ex takes 30 itself.',
 '68:0':'10 damage plus 20 for each Benched Lightning Pokémon. Ignore Weakness.',
 '69:0':'Deal 20 damage to one opposing Pokémon; ignore Bench Weakness and Resistance.',
 '70:0':'Return an Item from your discard pile to your hand.',
 '70:1':'20 damage; flip a coin to Paralyze.',
 '72:0':'Choose two random cards from the opponent’s hand; return them to their deck.',
 '72:1':'120 damage; Toxtricity takes 20 itself.',
 '73:0':'Flip a coin; on Heads Paralyze the Defending Pokémon.',
 '76:0':'230 damage, then discard all Energy from Pawmot.',
 '77:0':'Draw one card.',
 '79:0':'Deal 50 damage to one opposing Pokémon.',
 '79:1':'140 damage and discard an attached Lightning Energy.',
 '80:1':'90 damage to Active and 30 to one opposing Benched Pokémon.',
 '82:0':'Opponent chooses a Benched Pokémon to promote; that Pokémon becomes Asleep.',
 '83:0':'Flip a coin. On Heads, copy an attack from an opponent’s Pokémon in play.',
 '86:0':'190 damage and remove every Special Condition from Gardevoir ex.',
 '87:0':'10 damage; on Heads the opponent cannot play Items next turn.',
 '88:0':'30 damage; opposing player cannot play Items next turn.',
 '88:1':'Reveal opponent’s hand. Deal 60 damage per Trainer card found there.',
 '89:1':'Deal 30 for each damage counter on Drifloon.',
 '90:1':'Place eight damage counters among opposing Pokémon as you choose.',
 '92:0':'Flip a coin. On Heads deal 30 additional damage and heal 30 from Floette.',
 '93:0':'120 damage. Defending Pokémon’s attacks do 30 less next turn.',
 '94:0':'30 damage and on Heads discard an Energy from the Defending Pokémon.',
 '95:0':'30 plus 10 for every damage counter on the Defending Pokémon.',
 '96:0':'Before doing 10 damage, discard all Tools from the opponent’s Active Pokémon.',
 '98:0':'Fidough takes 30 less damage from attacks during the opponent’s next turn.',
 '102:0':'10 damage; switch Flittle with a Benched Pokémon.',
 '103:0':'20 damage; the Defending Pokémon cannot retreat next turn.',
 '103:1':'30 plus 50 per Energy attached to the Defending Pokémon.',
 '104:0':'10 damage for every Psychic Pokémon in your discard.',
 '105:0':'Move a Supporter from the opponent’s hand to the bottom of their deck.',
 '106:0':'80 damage plus 10 per Psychic Pokémon in your discard.',
 '107:0':'30 damage and 10 damage to Mankey.',
 '108:0':'70 damage and 20 damage to Primeape.',
 '109:0':'70 damage for each Prize card the opponent has taken.',
 '109:1':'170 damage and 50 damage to Annihilape.',
 '110:0':'10 damage that ignores Resistance.',
 '111:0':'30 damage; choose an attack the Defending Pokémon cannot use next turn.',
 '111:1':'90 damage. Flip a coin; on Tails, this attack does nothing.',
 '114:0':'30 damage, plus 120 if a Fighting Pokémon was knocked out by an attack last turn.',
 '114:1':'120 damage. Lucario cannot use Accelerating Stab on your next turn.',
 '116:0':'30 damage, plus 90 if opponent has exactly one Prize card remaining.',
 '117:0':'50 damage; flip until Tails, discarding an Energy from the Defending Pokémon per Heads.',
 '117:1':'180 damage and 30 damage to each of your Benched Pokémon.',
 '120:1':'Discard two Energy from Sandaconda, then shuffle the opponent’s Active and attachments into deck.',
 '122:1':'130 damage; Klawf becomes Confused.',
 '125:0':'220 damage. Koraidon ex cannot attack next turn.',
 '127:0':'100 damage and Poison the Defending Pokémon.',
 '128:0':'Poison the Defending Pokémon.',
 '128:1':'60 damage plus 120 if the Defending Pokémon is Poisoned.',
 '129:0':'Switch in one opposing Benched Pokémon.',
 '129:1':'Flip two coins. On two Heads, knock out the opposing Active Pokémon.',
 '131:0':'Search your deck for two cards and put them into your hand.',
 '131:1':'120 damage; Poison the opponent for 60 damage at each Pokémon Checkup.',
 '137:0':'160 damage, and 30 damage to Mabosstiff.',
 '138:0':'Search your deck for up to three Pokémon Tool cards.',
 '138:1':'60 damage; Defending Pokémon cannot retreat next turn.',
 '139:0':'Flip until Tails. Deal 50 damage for each Heads.',
 '139:1':'90 damage. Forretress takes 50 less attack damage next turn.',
 '140:0':'Poison the Defending Pokémon.',
 '142:0':'90 damage plus 90 on Heads.',
 '143:0':'Deal 30 damage to three different opposing Pokémon.',
 '143:1':'160 damage; switch Iron Treads ex with a Benched Pokémon.',
 '145:0':'150 damage; move all Energy from Blissey to a Benched Pokémon.',
 '147:0':'Switch in an opposing Benched Pokémon and deal 30 to the new Active.',
 '150:0':'60 damage; prevent incoming attack damage from Basic Pokémon next turn.',
 '150:1':'180 damage and discard an attached Energy.',
 '152:1':'80 damage plus 80 if Greedent has a Tool.',
 '153:0':'Evolve one of your Pokémon using a matching Evolution from deck.',
 '153:1':'30 damage; Defending Pokémon is Asleep.',
 '154:0':'Opponent switches their Active with a Benched Pokémon.',
 '155:0':'Draw a card.',
 '156:0':'Flip a coin; on Tails the attack does nothing.',
 '161:1':'70 damage for each of your Maushold in play.',
 '162:0':'Search for two Basic Pokémon from deck and put them onto Bench.',
 '162:1':'60 damage; on Tails attack fails, on Heads protect Squawkabilly next turn.',
 '164:0':'Draw two cards.'
});

const TRAINER_TYPES={166:'Supporter',167:'Stadium',169:'Tool',174:'Tool',175:'Supporter',176:'Supporter',177:'Supporter',178:'Stadium',179:'Supporter',180:'Supporter',183:'Supporter',189:'Supporter',190:'Supporter',192:'Tool',193:'Tool',195:'Supporter',197:'Tool',198:'Supporter'};
const TRAINERS={
  176:{type:'handShuffle',side:'both',draw:4},
  177:{type:'sequence',effects:[{type:'handShuffle',side:'self',draw:8},{type:'endTurn'}]},
  180:{type:'draw',side:'self',amount:3},
  185:coin({type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon'}}),
  189:{type:'sequence',effects:[{type:'discardHand',side:'self',amount:999},{type:'draw',side:'self',amount:7}]},
  190:{type:'sequence',effects:[{type:'discardHand',side:'self',amount:999},{type:'draw',side:'self',amount:7}]},
  196:{type:'sequence',effects:[{type:'discardChosenHand',side:'self',amount:2,required:true},{type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon'}}]},
  198:{type:'handShuffle',side:'self',draw:5},
  188:{type:'heal',target:'selfPokemon',amount:30},
  194:{type:'switch',side:'self'},
  191:{type:'rareCandy'},
  181:{type:'benchFromDeck',amount:1,filter:{kind:'pokemon',stage:'Basic'}},
  168:coin({type:'discardEnergyCard',target:'opponentPokemon',amount:1}),
  187:coin({type:'switch',side:'opponent'})
};

Object.assign(TRAINERS,{
 166:sv('arven'),
 167:{type:'noop'},
 169:{type:'modifier',stat:'attackDamage',amount:30,duration:'whileInPlay',sv1DefianceBand:true},
 170:sv('electricGenerator'),
 171:{type:'energyRetrieval',amount:2,energyCardIds:{Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Darkness:'lental-basic-darkness',Metal:'lental-basic-metal'}},
 172:sv('energySearch'),
 173:sv('energySwitch'),
 174:{type:'triggeredEffect',event:'teammateKnockedOut',effect:sv('expShare')},
 175:{type:'searchChosen',source:'deck',amount:2,filter:{kind:'pokemon',evolved:true}},
 178:{type:'stadiumAction',effect:flip({type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon'}})},
 179:sv('miriam'),
 182:sv('palPad'),
 183:{type:'returnToHand',target:'selfPokemon',filter:{stage:'Basic'},returnBasicEnergy:true},
 184:{type:'sequence',effects:[{type:'heal',target:'selfAll',amount:30},{type:'heal',target:'opponentAll',amount:30}]},
 186:sv('pokegear'),
 192:{type:'modifier',stat:'damageReduction',amount:30,duration:'whileInPlay',filter:{subtype:'Fighting'}},
 193:{type:'triggeredEffect',event:'damagedByAttack',activeOnly:true,opponentAttackOnly:true,effect:{type:'damage',target:'opponentActive',amount:20}},
 195:sv('teamStarGrunt'),
 197:{type:'modifier',stat:'attackDamage',amount:10,duration:'whileInPlay'}
});

const cardRows=[];const sourceByNumber=new Map();
for(const line of RAW){
 const [rawNum,name,letter,type,stage,hp,retreat,weak,resistance,evolvesFrom,rarity,attacks,hasAbility]=line.split('|');
 const n=Number(rawNum),isPokemon=letter==='P',isEx=/ ex$/.test(name),special=!!hasAbility;
 const baseAttacks=(attacks||'').split(';').filter(Boolean).map((spec,index)=>{
   const [name,cost,damage,needsRule]=spec.split('~');
   const rule=ATTACK_RULES[n+':'+index];
   const rawDamage=String(damage||'');
   const numeric=Number((rawDamage.match(/^\d+/)||[])[0]||0);
   // Non-interactive detail text must not claim an unimplemented effect works.
   const explain=rule ? (ATTACK_SUMMARIES[n+':'+index]||describeEffect(rule,numeric)) : needsRule?
      'Has a printed effect that is not yet supported in Classic battle.' :
      (numeric?`Deal ${numeric} damage.`:'No damage.');
   return {name,cost,damage:numeric,damageText:rawDamage,description:explain,
     ...(rule?{effect:rule}:{}),_needsRule:!!needsRule&&!rule};
 });
 const abilities=ABILITIES[n]||[];
 const unsupported=baseAttacks.some(x=>x._needsRule)||(special&&!abilities.length&&!TERA.has(n));
 const battleEnabled=isPokemon?!unsupported:(!!TRAINERS[n]);
 const moves=baseAttacks.map(({_needsRule,...x})=>x);
 const s={id:'sv1-'+n,name,number:String(n),setId:'sv1',kind:isPokemon?'pokemon':letter==='T'?'trainer':'energy',source:'tcg',battleFormat:'classic',rarity,
   image:`https://images.pokemontcg.io/sv1/${n}.png`,
   battleEnabled,deckEligible:battleEnabled,support:battleEnabled?{status:'FULL',reasons:[]}:{status:'PARTIAL',reasons:[isPokemon?'Printed move or Ability not yet fully implemented':'Trainer effect not yet implemented']}};
 if(isPokemon){
   Object.assign(s,{types:type.split('/').map(x=>T[x]),subtype:T[type.split('/')[0]],stage:stage==='0'?'Basic':`Stage ${stage}`,
     hp:Number(hp),retreat:Number(retreat),weakness:T[weak]||null,weaknessValue:weak?'×2':null,
     resistance:T[resistance]||null,resistanceValue:resistance?'-30':null,
     evolvesFrom:evolvesFrom||null,attacks:moves,abilities:[...abilities],
     points:isEx?2:1,prizeCards:isEx?2:1,isEx,imageLarge:`https://images.pokemontcg.io/sv1/${n}_hires.png`});
   if(TERA.has(n))s.abilities.push({name:'Tera Bench Guard',type:'passive',benchOnly:true,
     effect:{type:'preventDamage',target:'self',duration:'whileInPlay'}});
 }else if(letter==='T')Object.assign(s,{trainerType:TRAINER_TYPES[n]||'Item',...(TRAINERS[n]?{effect:TRAINERS[n]}:{}),imageLarge:`https://images.pokemontcg.io/sv1/${n}_hires.png`});
 sourceByNumber.set(n,Object.freeze(s));cardRows.push(sourceByNumber.get(n));
}
for(let n=199;n<=256;n++){
 const src=sourceByNumber.get(ALTS[n]);if(!src)throw new Error('Missing SV1 variant source '+n);
 const rarity=n<=222?'Illustration Rare':n<=242?'Ultra Rare':n<=252?'Special Illustration Rare':'Hyper Rare';
 cardRows.push(Object.freeze({...src,id:'sv1-'+n,number:String(n),rarity,image:`https://images.pokemontcg.io/sv1/${n}.png`,imageLarge:`https://images.pokemontcg.io/sv1/${n}_hires.png`}));
}
for(const [n,subtype] of [[257,'Lightning'],[258,'Fighting']])cardRows.push(Object.freeze({id:'sv1-'+n,name:'Basic '+subtype+' Energy',number:String(n),setId:'sv1',kind:'energy',subtype,basicEnergy:true,battleEnabled:false,deckEligible:false,source:'tcg',battleFormat:'classic',rarity:'Hyper Rare',image:`https://images.pokemontcg.io/sv1/${n}.png`,support:{status:'PARTIAL',reasons:['Basic Energy comes from Classic Energy Zone']}}));
const CARDS=Object.freeze(cardRows);const MAP=new Map(CARDS.map(c=>[c.id,c]));
function cardById(id){return MAP.get(String(id||'').toLowerCase())||null;}
function coverage(){return {total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,disabled:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id),set:SET};}
return {SET,CARDS,cardById,coverage};
});
