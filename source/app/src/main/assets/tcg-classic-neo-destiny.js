/* Neo Destiny — 113 original English print identities, including eight Shining secret rares.
 * PokemonTCG/pokemon-tcg-data/cards/en/neo4.json (card identities & stats).
 * Supported moves are explicitly declared below; unimplemented Powers/moves are
 * kept visible in the card catalogue but not offered for battle or Auto Build.
 * Printed card artwork is never modified.  Basic Energy uses the separate Zone.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGNeoDestiny=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'neo4',name:'Neo Destiny',series:'Neo',releaseDate:'2002-02-28',cardCount:113,printedTotal:105});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless',D:'Darkness',M:'Metal'};
// No unsupported card is ever treated as an effect-free attacker.
const DATA=`1|Dark Ampharos|P|L|2|70|2|F||Dark Flaaffy|Rare Holo|Shock Bolt~LCC~50|Conductivity
2|Dark Crobat|P|G|2|70|0|P|F|Dark Golbat|Rare Holo|Dark Drain~GG~|Surprise Bite
3|Dark Donphan|P|F|1|60|3|G|L|Phanpy|Rare Holo|Tusk Toss~FF~;Giant Tusk~FFC~50|
4|Dark Espeon|P|P|1|60|0|P||Eevee|Rare Holo|Gouge~C~10+;Psysplash~PCC~|
5|Dark Feraligatr|P|W|2|80|3|G||Dark Croconaw|Rare Holo|Crushing Blow~WWW~50|Scare
6|Dark Gengar|P|P|2|70|2||F|Dark Haunter|Rare Holo|Pull In~PPP~30|Deep Sleep
7|Dark Houndoom|P|R|1|60|1|W||Houndour|Rare Holo|Eerie Howl~C~;Dark Fire~RC~30+|
8|Dark Porygon2|P|C|1|60|1|F|P|Porygon|Rare Holo|Curve Attack~CCC~20|Spatial Distortion
9|Dark Scizor|P|M|1|70|2|R|G|Scyther|Rare Holo|Threaten~CC~;Slash~CCC~30|
10|Dark Typhlosion|P|R|2|80|1|W||Dark Quilava|Rare Holo|Claw Swipe~C~20;Rushing Flames~R~40×|
11|Dark Tyranitar|P|F|2|90|3|G|L|Dark Pupitar|Rare Holo|Mountain Smasher~F~20×;Fling Away~FFFC~50|
12|Light Arcanine|P|R|1|100|2|W||Growlithe|Rare Holo|Gentle Flames~RRC~50|Drive Off
13|Light Azumarill|P|W|1|80|1|L||Marill|Rare Holo|Bubble~W~10;Bubble Jump~WCC~30|
14|Light Dragonite|P|C|2|100|2||F|Light Dragonair|Rare Holo|Light Wave~CCC~40|Miraculous Wind
15|Light Togetic|P|C|1|60|0||F|Togepi|Rare Holo|Sweet Kiss~CC~30|Gift
16|Miracle Energy|E||0||0||||Rare Holo||
17|Dark Ariados|P|G|1|60|2|R||Spinarak|Rare|Entangle~G~;Poison Bind~GGG~30|
18|Dark Magcargo|P|R|1|60|3|W||Slugma|Rare|Ball of Flame~RR~20|Hot Plate
19|Dark Omastar|P|W|2|70|2|G||Dark Omanyte|Rare|Prehistoric Water~W~;Dark Tentacle~WC~30|
20|Dark Slowking|P|P|1|60|2|P||Slowpoke|Rare|Mind Shock~PP~30|Cunning
21|Dark Ursaring|P|C|1|60|2|F|P|Teddiursa|Rare|Provoke~C~;Battle Frenzy~CC~|
22|Light Dragonair|P|C|1|80|2||P|Dratini|Rare|Healing Light~CC~;Protective Wave~CCC~20|
23|Light Lanturn|P|L|1|80|2|F||Chinchou|Rare|Searchlight~L~;Spark~LL~30|
24|Light Ledian|P|G|1|70|0|R|F|Ledyba|Rare|Flash Touch~G~;Comet Punch~GCC~20×|
25|Light Machamp|P|F|2|100|2|P||Light Machoke|Rare|Beatdown~FFF~50|Tag Team
26|Light Piloswine|P|W|1|90|3|G|L|Swinub|Rare|Knock Over~CCC~30|Fluffy Wool
27|Unown [G]|P|P|0|40|1|P|||Rare|Hidden Power~P~10|[Give]
28|Unown [H]|P|P|0|40|1|P|||Rare|Hidden Power~P~10|[Help]
29|Unown [W]|P|P|0|40|1|P|||Rare|Hidden Power~P~10|[Want]
30|Unown [X]|P|P|0|50|1|P|||Rare|Hidden Power~P~10|[XXXXX]
31|Chansey|P|C|0|90|2|F|P||Uncommon|Doubleslap~CC~20×;Egg Toss~CCC~80|
32|Dark Croconaw|P|W|1|60|2|G||Totodile|Uncommon|Clamping Jaw~WW~20|
33|Dark Exeggutor|P|P|1|60|2|P||Exeggcute|Uncommon|Triple Headbutt~C~10×;MAX Burst~PC~20×|
34|Dark Flaaffy|P|L|1|60|1|F||Mareep|Uncommon|High Voltage~L~10;Stun Wave~LC~30|
35|Dark Forretress|P|G|1|60|2|R||Pineco|Uncommon|Armor Up~C~;Explosion~GG~60|
36|Dark Haunter|P|P|1|50|0||F|Gastly|Uncommon|Call Back~P~;Surround~PP~20|
37|Dark Omanyte|P|W|1|40|1|G||Mysterious Fossil|Uncommon|Water Cannon~W~|
38|Dark Pupitar|P|F|1|60|1|G|L|Larvitar|Uncommon|Rock Tackle~FF~40;Explosive Evolution~CCC~|
39|Dark Quilava|P|R|1|60|1|W||Cyndaquil|Uncommon|Incinerate~R~;Rushing Magma~RR~20×|
40|Dark Wigglytuff|P|C|1|60|2|F|P|Jigglypuff|Uncommon|Dark Song~CC~;Slap Awake~CCC~20+|
41|Heracross|P|G|0|60|2|R|||Uncommon|Tackle~GC~20;Charging Horn~GGG~30+|
42|Hitmonlee|P|F|0|60|1|P|||Uncommon|One-Two Kick~FF~20×;Heel Drop~FFF~60|
43|Houndour|P|D|0|40|1||P||Uncommon|Corner~D~;Lunge~CC~30|
44|Jigglypuff|P|C|0|50|1|F|P||Uncommon|Expand~CC~10|
45|Light Dewgong|P|W|1|80|2|L||Seel|Uncommon|Freezing Breath~WW~10;Ice Pillar~WWW~40|
46|Light Flareon|P|R|1|80|1|W||Eevee|Uncommon|Warm Up~R~;Burning Flame~RRC~30+|
47|Light Golduck|P|W|1|80|1|L||Psyduck|Uncommon|Flipper Stroke~W~;Core Blast~PCC~30+|
48|Light Jolteon|P|L|1|70|0|F||Eevee|Uncommon|Pulse Guard~L~;Thunder Needle~LLC~20×|
49|Light Machoke|P|F|1|80|2|P||Machop|Uncommon|Return Home~F~;Gentle Kick~FF~40|
50|Light Ninetales|P|R|1|90|1|W||Vulpix|Uncommon|Guiding Flame~R~;Fire Blast~RRR~50|
51|Light Slowbro|P|P|1|80|2|P||Slowpoke|Uncommon|Fish Out~P~;Splash About~WC~20+|
52|Light Vaporeon|P|W|1|80|1|L||Eevee|Uncommon|Wash Away~W~;Hypnoshower~WWC~30|
53|Light Venomoth|P|G|1|80|0|R|F|Venonat|Uncommon|Mysterious Wing~G~;Synchronize~PC~40|
54|Light Wigglytuff|P|C|1|80|1|F|P|Jigglypuff|Uncommon|Evolution Song~C~;Body Slam~CCC~20|
55|Scyther|P|G|0|60|1|R|F||Uncommon|Agility~GC~10;Sharp Sickle~GGG~40|
56|Togepi|P|C|0|40|1||P||Uncommon|Charm~C~;Spike Ball Tackle~CC~20|
57|Unown [C]|P|P|0|40|1|P|||Uncommon|Hidden Power~P~10|[Chase]
58|Unown [P]|P|P|0|40|1|P|||Uncommon|Hidden Power~P~10|[Perform]
59|Unown [Q]|P|P|0|40|1|P|||Uncommon|Hidden Power~P~10|[Quicken]
60|Unown [Z]|P|P|0|40|1|P|||Uncommon|Hidden Power~P~10|[Zoom]
61|Cyndaquil|P|R|0|40|1|W|||Common|Smokescreen~R~10|
62|Dark Octillery|P|W|1|60|2|L||Remoraid|Common|Ink Blast~W~20+;Tentacle Wrap~WC~20|
63|Dratini|P|C|0|40|1||P||Common|Shed~C~;Fury Attack~C~10×|
64|Exeggcute|P|P|0|40|1|P|||Common|Sleep Powder~G~10;Psyshock~P~10|
65|Gastly|P|P|0|40|0||F||Common|Nightmare~P~10|
66|Girafarig|P|C|0|60|1||||Common|Tail Bite~CC~10+;Psychic~PP~10+|
67|Gligar|P|F|0|50|0|G|F||Common|Stun Poison~FC~10|
68|Growlithe|P|R|0|50|1|W|||Common|Bite~CC~20|
69|Hitmonchan|P|F|0|60|1|P|||Common|Dodge~F~;Supersonic Jab~FFF~40|
70|Larvitar|P|F|0|40|1|G|L||Common|Leer~C~;Rock Throw~FC~20|
71|Ledyba|P|G|0|40|0|R|F||Common|Swift~GC~20|
72|Light Sunflora|P|G|1|80|1|R||Sunkern|Common|Reflected Sunlight~CC~;Solarbeam~GGG~40|
73|Machop|P|F|0|40|1|P|||Common|Chop~C~10;Punch~CC~20|
74|Mantine|P|W|0|60|2|L|F||Common|Giant Wave~WW~40|
75|Mareep|P|L|0|50|1|F|||Common|Headbutt~C~10|
76|Phanpy|P|F|0|40|1|G|L||Common|Crushing Step~F~10+|
77|Pineco|P|G|0|40|2|R|||Common|Tackle~CC~20|
78|Porygon|P|C|0|50|1|F|P||Common|Sharpen~CC~20|
79|Psyduck|P|W|0|50|1|L|||Common|Flipper Splash~W~10;Migraine~PC~20|
80|Remoraid|P|W|0|40|0|L|||Common|Fury Strikes~W~10×|
81|Seel|P|W|0|50|1|L|||Common|Take Down~WC~30|
82|Slugma|P|R|0|50|2|W|||Common|Combustion~RR~30|
83|Sunkern|P|G|0|40|2|R|||Common|Rollout~C~10;Sunbathe~GG~|
84|Swinub|P|W|0|50|1|G|L||Common|Generate Cold~WC~20|
85|Totodile|P|W|0|50|1|G|||Common|Water Gun~W~10+|
86|Unown [L]|P|P|0|50|1|P|||Common|Hidden Power~P~10|[Laugh]
87|Unown [S]|P|P|0|50|1|P|||Common|Hidden Power~PC~20|[Search]
88|Unown [T]|P|P|0|40|1|P|||Common|Hidden Power~PC~20|[Tell]
89|Unown [V]|P|P|0|40|1|P|||Common|Hidden Power~P~10|[Vanish]
90|Venonat|P|G|0|40|1|R|||Common|Gnaw~C~10;Poisonpowder~GC~10|
91|Vulpix|P|R|0|50|1|W|||Common|Ember~RC~30|
92|Broken Ground Gym|T||0||0||||Rare||
93|EXP.ALL|T||0||0||||Rare||
94|Impostor Professor Oak's Invention|T||0||0||||Rare||
95|Radio Tower|T||0||0||||Rare||
96|Thought Wave Machine|T||0||0||||Rare||
97|Counterattack Claws|T||0||0||||Uncommon||
98|Energy Amplifier|T||0||0||||Uncommon||
99|Energy Stadium|T||0||0||||Uncommon||
100|Lucky Stadium|T||0||0||||Uncommon||
101|Magnifier|T||0||0||||Uncommon||
102|Pokémon Personality Test|T||0||0||||Uncommon||
103|Team Rocket's Evil Deeds|T||0||0||||Uncommon||
104|Heal Powder|T||0||0||||Common||
105|Mail from Bill|T||0||0||||Common||
106|Shining Celebi|P|G|0|50|1|R|||Rare Shining|Healing Water~W~;Miracle Leaf~GP~10|
107|Shining Charizard|P|R|0|100|3|W|F||Rare Shining|White-hot Flame~RRRLL~100|
108|Shining Kabutops|P|F|0|80|2|G|||Rare Shining|Lightning Cut~FFL~30+;Water Slash~FFWW~50+|
109|Shining Mewtwo|P|P|0|70|2|P|||Rare Shining|Reflect Shield~PL~;Psyburst~PPR~40+|
110|Shining Noctowl|P|C|0|60|1|L|F||Rare Shining|Flashing Eyes~PLC~30|
111|Shining Raichu|P|L|0|70|1|F|||Rare Shining|Thundersquall~LLWW~40|
112|Shining Steelix|P|M|0|90|4|R|G||Rare Shining|Crushing Earth~MMFF~80|
113|Shining Tyranitar|P|D|0|80|3||P||Rare Shining|Mountain Crush~DFF~30;Destructive Fire~DRRR~50|`.trim().split('\n');
const E={},T={};
const noop={type:'noop'},status=s=>({type:'status',target:'opponentActive',status:s}),selfStatus=s=>({type:'status',target:'selfActive',status:s}),
 coin=(a,b=noop)=>({type:'coinFlip',heads:a,tails:b}),seq=(...effects)=>({type:'sequence',effects}),
 bonus=n=>({type:'bonusDamage',amount:n}),repeat=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'}),
 guard=(effects=true)=>({type:'preventDamage',target:'self',duration:'opponentTurn',effects}),
 gate=()=>({type:'coinAttackGate',heads:noop}),
 par=s=>status(s),lock=(action='retreat')=>({type:'lock',target:'opponentActive',action,duration:'opponentTurn'}),
 recoil=amount=>({type:'selfDamage',amount});
function move(n,i,effect,text){E[n+':'+i]={effect,text};}
// Exact printed effects already covered by the shared classic engine.
move(22,0,{type:'heal',target:'selfAll',amount:10},'Remove one damage counter from each of your Pokémon.');
move(22,1,coin(guard()),'Flip a coin. On heads prevent all effects including damage against Light Dragonair next turn.');
move(31,0,repeat(2,20),'Flip two coins, 20 damage per heads.');
move(31,1,{type:'coinTierBonus',coins:2,tiers:{0:0,1:0,2:80},mode:'replace'},'Flip two coins. If either is tails, deal no damage.');
move(32,0,seq(lock(),{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'}),'The defending Pokémon cannot retreat and must flip heads to attack next turn.');
move(38,0,seq(recoil(10),{type:'lock',target:'self',action:'attack',attackName:'Rock Tackle',duration:'nextOwnTurn'}),'10 recoil. Cannot use Rock Tackle next turn.');
move(40,0,coin(par('sleep'),par('confusion')),'Heads: Asleep; tails: Confused.');
move(41,0,noop,'Deal 20 damage.');
move(41,1,coin(bonus(30)),'Flip heads for 30 more damage.');
move(42,0,repeat(2,20),'Flip two coins; deal 20 damage per heads.');
move(42,1,gate(),'Flip a coin; on tails this attack misses.');
move(43,0,lock(),'Defender cannot retreat during its next turn.');
move(43,1,gate(),'Flip a coin; on tails this attack misses.');
move(44,0,{type:'modifier',stat:'damageReduction',amount:10,duration:'opponentTurn',scope:'self'},'Reduce the next opposing attack damage to Jigglypuff by 10.');
move(49,1,seq({type:'bonusDamage',amount:-20,condition:{type:'opponentDamaged'}}),'40 damage if defender undamaged; otherwise 20.');
move(54,1,coin(par('paralysis')),'Flip heads to Paralyze.');
move(55,0,coin(guard()),'Flip heads to prevent all attack damage and effects to Scyther next turn.');
move(55,1,noop,'Deal 40 damage.');
move(61,0,{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},'Defender must flip heads to attack next turn.');
move(63,0,{type:'healSelf',amount:10},'Remove 10 damage from Dratini.');
move(63,1,repeat(2,10),'Flip two coins for 10 damage per heads.');
move(64,0,par('sleep'),'Put the defending Pokémon to Sleep.');
move(64,1,coin(par('paralysis')),'Flip heads to Paralyze the defender.');
move(65,0,par('sleep'),'Put the defending Pokémon to Sleep.');
move(66,0,coin(bonus(20)),'Flip heads for 20 extra damage.');
move(66,1,{type:'energyDamage',source:'opponent',amount:10,mode:'add'},'Add 10 damage per Energy attached to defending Pokémon.');
move(67,0,coin(seq(par('paralysis'),par('poison'))),'Flip heads to both Paralyze and Poison the defender.');
move(68,0,noop,'Deal 20 damage.');
move(69,0,coin({type:'preventDamage',target:'self',duration:'opponentTurn'}),'Flip heads to prevent attack damage next turn.');
move(69,1,noop,'Deal 40 damage.');
move(70,0,coin({type:'lock',target:'opponentActive',action:'attack',duration:'opponentTurn'}),'Flip heads; defender cannot attack next turn.');
move(70,1,noop,'Deal 20 damage.');
move(71,0,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},'Swift: damage ignores Weakness, Resistance and effects.');
move(72,1,noop,'Deal 40 damage.');
move(73,0,noop,'Deal 10 damage.');
move(73,1,noop,'Deal 20 damage.');
move(74,0,{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'},'Mantine cannot attack during your next turn.');
move(75,0,noop,'Deal 10 damage.');
move(76,0,coin(bonus(10)),'Flip heads to deal an extra 10 damage.');
move(77,0,noop,'Deal 20 damage.');
move(78,0,noop,'Deal 20 damage.');
move(79,0,noop,'Deal 10 damage.');
move(79,1,coin(par('confusion'),selfStatus('confusion')),'Heads: Confuse the defender; tails: Confuse Psyduck.');
move(80,0,repeat(3,10),'Flip three coins for 10 damage per heads.');
move(81,0,recoil(10),'Deal 10 recoil to Seel.');
move(82,0,noop,'Deal 30 damage.');
move(83,0,noop,'Deal 10 damage.');
move(84,0,coin(par('paralysis')),'Flip heads to Paralyze.');
move(90,0,noop,'Deal 10 damage.');
move(90,1,par('poison'),'Poison the defender.');
move(91,0,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true},'Discard one attached Fire Energy or Ember fails.');
// Neo Destiny completion: original move costs and intended outcomes.
const destiny=(rule)=>({type:'neoRule',rule:'destiny:'+rule});
const D=(n,i,r,t)=>move(n,i,destiny(r),t);
const both=(a,b)=>seq(a,b);
D(1,0,'shockBolt','Discard all attached Lightning Energy or this attack fails.');
D(2,0,'darkDrain','Flip for each opposing Pokémon; 10 damage per heads and heal that much damage.');
D(3,0,'tuskToss','Flip: heads return the defender to hand with attachments; tails force a switch.');
move(3,1,noop,'50 damage.');
move(4,0,coin(bonus(10)),'Flip heads for 10 extra damage.');
D(4,1,'psysplash','Deal 10 damage per attached Energy to every opposing Pokémon.');
D(5,0,'crushingBlow','Flip heads to discard one opposing Active Energy.');
D(6,0,'pullIn','Choose an opposing Benched Pokémon to promote; the target becomes Asleep.');
D(7,0,'eerieHowl','Put an opposing Basic Pokémon from hand onto their Bench and switch it Active.');
D(7,1,'darkFire','Discard one Darkness Energy to boost damage by 20.');
move(8,0,coin(guard(false)),'Flip heads to prevent attack damage during the next opposing turn.');
D(9,0,'threaten','Flip heads, inspect opponent hand and shuffle one Trainer into their deck.');
move(9,1,noop,'30 damage.');
move(10,0,noop,'20 damage.');
D(10,1,'rushingFlames','Discard Fire Energy from your Pokémon, then 40 damage for each heads.');
D(11,0,'mountainSmasher','Flip once per attached Fighting Energy, 20 damage and discard deck card per heads.');
D(11,1,'flingAway','If there is an opposing Bench, deal 30 to Active and 30 to chosen Bench.');
D(12,0,'gentleFlames','Deal 10 to Babies, 30 to Basics, and 50 to Evolutions.');
move(13,0,coin(par('paralysis')),'Flip heads to Paralyze the defender.');
D(13,1,'bubbleJump','Flip heads to move two attached Energy to your Bench and return this Pokémon to hand.');
move(14,0,{type:'preventEffects',target:'self',duration:'opponentTurn'},'Prevent all non-damage attack effects next opposing turn.');
D(15,0,'sweetKiss','Defender draws one card optionally.');
D(17,0,'entangle','Switch an opposing Benched Pokémon to Active; flip heads to Paralyze.');
D(17,1,'poisonBind','Poison the defender; flip heads to prevent its retreat and switching.');
D(18,0,'ballOfFlame','Optionally discard attached Fire Energy to deal 20 to an opposing Bench Pokémon.');
D(19,0,'prehistoricWater','Flip heads to devolve an opposing evolved Pokémon.');
D(19,1,'darkTentacle','Defender may not evolve during the next turn except via attacks or Powers.');
move(20,0,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true},'30 damage ignoring Weakness and Resistance.');
D(21,0,'provoke','Each player may put opposing Basics from hand onto the Bench.');
D(21,1,'battleFrenzy','Flip for each Pokémon in play and deal 20 to those with heads.');
D(23,0,'searchlight','Flip heads; each player may take a card from their discard pile into hand.');
D(23,1,'spark','Deal 30 to Active and 10 damage to an opposing Benched Pokémon.');
D(24,0,'flashTouch','Switch with a Benched Pokémon, protecting that new Active from Special Conditions.');
move(24,1,repeat(4,20),'Flip four coins; 20 damage for each heads.');
D(25,0,'beatdown','Deal 100 on heads versus a Dark-name/Darkness Pokémon, otherwise 50.');
D(26,0,'knockOver','Optionally discard the Stadium in play.');
for(const n of [27,28,29,30,57,58,59,60,86,87,88,89])move(n,0,noop,'Hidden Power: 10 damage (20 for Unown [S] and [T]).');
move(33,0,repeat(3,10),'Flip three coins; 10 damage per heads.');
D(33,1,'maxBurst','Flip once per Energy on opposing Pokémon; 20 damage per heads.');
D(34,0,'highVoltage','Flip heads to prevent opponent from playing Trainers next turn.');
D(34,1,'stunWave','Suppress the defender Pokémon Power until the end of your next turn.');
D(35,0,'armorUp','Flip heads to survive a fatal attack with 10 HP remaining through next own turn.');
move(35,1,recoil(60),'60 damage and 60 recoil.');
D(36,0,'callBack','Put a Basic Pokémon from opposing discard onto their Bench with 10 damage.');
move(36,1,coin(par('sleep'),lock('retreat')),'Heads: Sleep; tails: opposing Active cannot retreat.');
D(37,0,'waterCannon','10 damage per attached Water Energy, maximum 30.');
D(38,1,'explosiveEvolution','Flip heads to deal 10 to all opposing Pokémon and evolve into Dark Tyranitar.');
D(39,0,'incinerate','Reveal top opposing deck card; discard it if a Trainer.');
D(39,1,'rushingMagma','Discard top five deck cards; 20 damage per Fire Energy discarded.');
D(40,1,'slapAwake','Deal 20 extra versus Asleep/Confused, then remove those conditions.');
D(45,0,'freezingBreath','Heads Paralyzed; tails Asleep.');
D(45,1,'icePillar','Protect your Bench from attack damage during next opponent turn.');
D(46,0,'warmUp','Attach one Fire Energy from the ordered Energy supply to Benched Pokémon.');
D(46,1,'burningFlame','Flip two coins, discard Fire Energy per heads, +20 damage per heads or attack fails.');
D(47,0,'flipperStroke','Each player may take basic Energy from their top three cards, then shuffle.');
D(47,1,'coreBlast','20 extra damage per Special Energy on defender.');
D(48,0,'pulseGuard','Prevent 30+ attack damage during next opponent turn.');
move(48,1,{type:'coinDamageStatus',coins:3,amount:20,minHeads:2,status:'paralysis',mode:'replace'},'Flip three coins: 20 damage per heads; Paralyze if 2 or more heads.');
D(49,0,'returnHome','Choose your own Bench Pokémon to shuffle into your deck.');
D(50,0,'guidingFlame','Bench a Basic Pokémon from your discard.');
move(50,1,{type:'discardEnergyCard',target:'self',amount:1,energyType:'Fire',useCost:true},'Discard one Fire Energy to attack.');
D(51,0,'fishOut','Both players may shuffle up to three Pokémon from their discard back into the deck.');
D(51,1,'splashAbout','20 extra damage if defender has more attached Energy.');
D(52,0,'washAway','Flip heads to fully heal one Benched Pokémon, discarding all Energy attached.');
D(52,1,'hypnoshower','Put opposing Active to Sleep and heal 10 from each Benched Pokémon (both sides).');
D(53,0,'mysteriousWing','Each player may retrieve a Pokémon from their discard into hand.');
D(53,1,'synchronize','Deal no damage unless own and opposing Active have equal attached Energy counts.');
D(54,0,'evolutionSong','Each player may evolve one Pokémon from their deck.');
D(56,0,'charm','Reduce opposing attacks by 10 on the next turn.');
move(56,1,recoil(10),'20 damage and 10 recoil.');
D(62,0,'inkBlast','Add up to 20 damage for extra attached Energy beyond cost.');
D(62,1,'tentacleWrap','Heads Paralyze; tails opposing Active retreat costs one extra Energy.');
D(72,0,'reflectedSunlight','Attach up to two Grass Energy from hand to a Grass Pokémon.');
D(83,1,'sunbathe','Flip heads to heal self completely and evolve from deck.');
D(85,0,'waterGun','10 extra damage for each Water Energy above cost, max 20.');
D(106,0,'healingWater','Heal a selected Bench Pokémon by 10 per Water Energy attached.');
D(106,1,'miracleLeaf','Flip per opposing Active Energy; on any heads choose Sleep, Poison, or Confusion.');
D(107,0,'whiteHotFlame','Discard Fire and Lightning Energy attached. Flip tails for 30 recoil.');
D(108,0,'lightningCut','Heads: +10 plus 10 to each opposing Bench; tails: 10 recoil.');
D(108,1,'waterSlash','+10 damage per Water Energy beyond two Water cost; ignore Resistance.');
D(109,0,'reflectShield','Flip on being hit next turn: heads prevent attack damage and deal 20 to attacker.');
D(109,1,'psyburst','Discard attached Fire Energy; +10 damage per Energy on opponent Active.');
D(110,0,'flashingEyes','Three coins: one heads Sleep, two Confusion, three Paralysis.');
D(111,0,'thundersquall','Deal 10 to chosen opposing Benched Pokémon per attached Water Energy.');
D(112,0,'crushingEarth','Heads: 10 to all Benched Pokémon; tails: no attack damage. Cannot attack next turn.');
D(113,0,'mountainCrush','Flip until tails; discard top opponent card for each heads.');
D(113,1,'destructiveFire','Flip for each attached Fire; discard that many Fire or fail; remove defender Energy per heads.');

// Trainers with a fully compatible printed action.  Others remain catalogued.
T[104]={trainerType:'Item',text:'Flip a coin. On heads, cure all Special Conditions and heal 20 damage from your Active Pokémon.',effect:coin(seq({type:'removeStatuses',target:'selfActive',statuses:['sleep','confusion','paralysis','poison']},{type:'heal',target:'selfActive',amount:20}))};
// Real Pokémon Power roles. LuckyDex's three-Bench house rule counts required
// Unown word letters in hand, Active and Bench; the Power owner must be in play.
const P={};
const passive=(n,rule,props={})=>P[n]={type:'passive',effect:destiny(rule),...props};
const activated=(n,rule,props={})=>P[n]={type:'activated',effect:destiny(rule),oncePerTurn:true,disabledByStatus:true,...props};
const triggered=(n,event,rule,props={})=>P[n]={type:'triggered',event,effect:destiny(rule),disabledByStatus:true,...props};
triggered(1,'opponentEnergyAttached','conductivity');
triggered(2,'evolved','surpriseBite',{fromHandOnly:true});
passive(5,'scare',{activeOnly:true,disabledByStatus:true});
passive(6,'deepSleep',{disabledByStatus:true});
activated(8,'spatialDistortion');
activated(12,'driveOff',{activeOnly:true});
passive(14,'miraculousWind',{activeOnly:true,disabledByStatus:true});
triggered(15,'evolved','gift',{fromHandOnly:true});
triggered(18,'opponentBenched','hotPlate',{activeOnly:true});
activated(20,'cunning');
triggered(25,'evolved','tagTeam',{fromHandOnly:true,benchOnly:true});
triggered(26,'damagedByAttack','fluffyWool',{activeOnly:true,opponentAttackOnly:true});
activated(27,'unownGive',{text:'[Give]: with G, I, V and E in your hand or in play, flip heads to attach the top Basic Energy from your Energy Zone to one of your Pokémon.'});
activated(28,'unownHelp',{text:'[Help]: with H, E, L and P in your hand or in play, shuffle your hand into your deck, then draw the same number of cards.'});
activated(29,'unownWant',{text:'[Want]: with W, A, N and T in your hand or in play, flip heads to return a Trainer from your discard pile to your hand.'});
passive(30,'unownX');
passive(57,'unownC',{activeOnly:true});
passive(58,'unownP',{activeOnly:true});
activated(59,'unownQ',{disabledByStatus:false});
passive(60,'unownZ',{benchOnly:true});
activated(86,'unownL',{disabledByStatus:false});
activated(87,'unownS',{disabledByStatus:false});
activated(88,'unownT',{disabledByStatus:false});
triggered(89,'benched','unownV',{fromHandOnly:true,disabledByStatus:false});
move(14,0,destiny('lightWave'),'Prevent all attack effects other than damage during the next opposing turn.');
// Stadiums, tools and Items are separate; normal card play semantics apply.
T[92]={trainerType:'Stadium',text:'Each player pays one Colorless more to retreat a Baby or Basic Pokémon.',effect:noop};
T[93]={trainerType:'Tool',text:'On an opponent attack KO, transfer a Basic Energy from your Active to the Pokémon with EXP.ALL; discard EXP.ALL.',effect:{type:'triggeredEffect',event:'knockedOut',effect:destiny('expAll')}};
T[94]={trainerType:'Item',text:'You may shuffle opponent Prize cards into their deck and replace them from the deck.',effect:destiny('impostorOak')};
T[95]={trainerType:'Stadium',text:'Once per turn look at the top two cards of your deck and return them in order.',effect:{type:'stadiumAction',effect:destiny('radioTower')}};
T[96]={trainerType:'Item',text:'Flip until tails; return one opponent Active Energy to hand per heads. Your turn ends.',effect:destiny('thoughtWave')};
T[97]={trainerType:'Tool',text:'If Active and damaged by an opponent attack, flip heads to return 20 damage to attacker; discard Counterattack Claws.',effect:{type:'triggeredEffect',event:'damagedByAttack',activeOnly:true,opponentAttackOnly:true,effect:destiny('counterattackClaws')}};
T[98]={trainerType:'Item',text:'Shuffle an Energy from your hand into deck. Flip heads to take up to three Basic Energy from supply.',effect:destiny('energyAmplifier')};
T[99]={trainerType:'Stadium',text:'Once per turn flip a coin; on heads return Basic Energy from discard to hand.',effect:{type:'stadiumAction',effect:destiny('energyStadium')}};
T[100]={trainerType:'Stadium',text:'Once per turn flip heads to draw one card.',effect:{type:'stadiumAction',effect:destiny('luckyStadium')}};
T[101]={trainerType:'Tool',text:'Until the end of this turn, attacks by this Pokémon ignore Resistance. Discard Magnifier at end of turn.',effect:{type:'modifier',stat:'attackDamage',amount:0,duration:'whileInPlay'}};
T[102]={trainerType:'Item',text:'Show an Evolution secretly; opposing player guesses Light, Dark or neither; correct guess gives opponent three cards, wrong gives you three.',effect:destiny('personalityTest')};
T[103]={trainerType:'Item',text:'Choose an opponent hand card to shuffle into their deck; opponent may draw up to two cards.',effect:destiny('evilDeeds')};
T[105]={trainerType:'Item',text:'Only with fewer than five hand cards including Mail from Bill; draw until four cards remain in hand.',effect:{type:'drawToHandSize',size:4}};

// The old card format treats ordinary trainer cards as Items; Stadiums and Tools are explicit.
const TRAINER_TYPE={92:'Stadium',93:'Tool',95:'Stadium',97:'Tool',99:'Stadium',100:'Stadium'};
const TRAINER_TEXT={92:'Stadium: Basic/Baby Pokémon have one additional retreat cost.',93:'Tool: transfer one Basic Energy from the Active Pokémon on attack Knock Out; discard this Tool.',94:'May reshuffle your opponent’s Prize cards and replace them from their deck.',95:'Stadium: once per turn look at the top two cards of your deck.',96:'Flip until tails; return opposing Active Energy to hand per heads. Your turn ends.',97:'Tool: on attack damage to this Active, flip heads to return two damage counters, then discard Tool.',98:'Shuffle an Energy from hand into deck; flip heads for up to three Basic Energy.',99:'Stadium: once per turn flip heads to retrieve Basic Energy from discard.',100:'Stadium: once per turn flip heads to draw one card.',101:'Attach until end of turn; ignore Resistance on this Pokémon’s attacks.',102:'Guess whether a hidden Evolution is Light, Dark or neither; winner draws three.',103:'Put a card from the opponent’s hand into their deck; opponent may draw two.',105:'Playable with fewer than five hand cards. Draw up to four.'};
const SHINING=new Set([106,107,108,109,110,111,112,113]);
const CARDS=DATA.map(line=>{
 const [raw,name,kindCode,type,stage,hp,ret,weak,res,evolvesFrom,rarity,moves,power]=line.split('|');
 const n=Number(raw),id='neo4-'+n,kind=kindCode==='P'?'pokemon':kindCode==='E'?'energy':'trainer';
 const attacks=kind!=='pokemon'?[]:(moves||'').split(';').filter(Boolean).map((entry,i)=>{
  const [title,cost,printed]=entry.split('~');
  const implemented=E[n+':'+i];
  const damaged=Number(String(printed||'').replace(/[^0-9]/g,''))||0;
  const variable=/[×+?-]/.test(printed||'');
  return {name:title,cost,damage:variable?damaged:damaged,damageText:variable?printed:null,text:implemented?.text||'',effect:implemented?.effect||null,unimplemented:!implemented||!fx.supportsEffect(implemented.effect)};
 });
 const reasons=[];if(kind==='pokemon'){
   for(const atk of attacks)if(atk.unimplemented)reasons.push(atk.name+' printed attack effect not implemented');
   if(power&&!P[n])reasons.push('Pokémon Power '+power+' not yet implemented');
   if(SHINING.has(n)&&attacks.some(a=>a.unimplemented))reasons.push('Shining attack needs dedicated validation');
 }else if(kind==='trainer'&&!T[n])reasons.push('Trainer '+name+' effect not yet implemented');
 else if(kind==='energy'&&n!==16)reasons.push('Unsupported Special Energy');
 const battleEnabled=!reasons.length;
 return {id,setId:'neo4',number:String(n),name,kind,rarity,source:'tcg',battleFormat:'classic',
 ...(kind==='pokemon'?{stage:Number(stage)===0?'Basic':'Stage '+stage,hp:Number(hp),retreat:Number(ret),types:[TYPE[type]],subtype:TYPE[type],weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolvesFrom||null,attacks,abilities:power&&P[n]?[{name:power,...P[n],text:'See original card Pokémon Power.'}]:[],printedRules:SHINING.has(n)?`You cannot have more than one ${name} in your deck.`:''}:{}),
 ...(kind==='trainer'?{trainerType:T[n]?.trainerType||TRAINER_TYPE[n]||'Item',text:T[n]?.text||TRAINER_TEXT[n]||'Read the printed Trainer card.',effect:T[n]?.effect||null}:{}),
 ...(kind==='energy'?{specialEnergy:true,subtype:'Colorless',types:['Colorless'],text:'Attach only to a Light or Shining Pokémon. Counts as any two Energy symbols in total; discarded at the end of your turn.',effect:{type:'specialEnergy',provides:{Miracle:2}}}:{}),
 image:'https://images.pokemontcg.io/neo4/'+n+'.png',imageLarge:'https://images.pokemontcg.io/neo4/'+n+'_hires.png',
 battleEnabled,deckEligible:battleEnabled,support:{status:battleEnabled?'FULL':'PARTIAL',reasons}
 };
});
if(CARDS.length!==113||new Set(CARDS.map(c=>c.id)).size!==113)throw Error('Neo Destiny card identities incomplete');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
 coverage:()=>({total:113,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id+' '+c.name+': '+c.support.reasons.join('; '))})};
});
