/* Neo Genesis (111 original numbered cards), first Johto-era Classic set.
 * Catalogue identity, HP, costs and moves from PokemonTCG/pokemon-tcg-data neo1.
 * Neo rules resolve in the Classic 30 battle engine with Basic Energy generated
 * from the separate zone; special Darkness/Metal/Recycle Energy remains in deck.
 * Printed card art and the original game data are not rewritten.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LuckyDexClassicTCGNeoGenesis=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'neo1',name:'Neo Genesis',series:'Neo',releaseDate:'2000-12-16',cardCount:111});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless',D:'Darkness',M:'Metal'};
const DATA=`1|Ampharos|L|2|80|2|F||Flaaffy|Rare Holo|Gigaspark~LLL~40
2|Azumarill|W|1|70|1|L||Marill|Rare Holo|Tackle~CC~20;Bubble Shower~WWW~30
3|Bellossom|G|2|70|2|R||Gloom|Rare Holo|Sweet Nectar~G~;Flower Dance~GGC~30×
4|Feraligatr|W|2|100|3|G||Croconaw|Rare Holo|Chomp~WWWW~50+
5|Feraligatr|W|2|120|3|G||Croconaw|Rare Holo|Riptide~WWW~10+
6|Heracross|G|0|60|2|R|||Rare Holo|Megahorn~GGG~60
7|Jumpluff|G|2|70|0|R|F|Skiploom|Rare Holo|Sleep Powder~G~20;Leech Seed~G~20
8|Kingdra|W|2|90|2|||Seadra|Rare Holo|Agility~WWC~30;Dragon Tornado~WWWW~50
9|Lugia|C|0|90|2|P|F||Rare Holo|Elemental Blast~RWL~90
10|Meganium|G|2|100|3|R||Bayleef|Rare Holo|Body Slam~GGCC~40
11|Meganium|G|2|100|3|R||Bayleef|Rare Holo|Soothing Scent~GGGG~40
12|Pichu|L|0|30|0||||Rare Holo|Zzzap~C~
13|Skarmory|M|0|60|2|R|G||Rare Holo|Claw~C~20;Steel Wing~MCC~30
14|Slowking|P|1|80|3|P||Slowpoke|Rare Holo|Mind Blast~PPP~20+
15|Steelix|M|1|110|4|R|G|Onix|Rare Holo|Tackle~CC~20;Tail Crush~MCC~30+
16|Togetic|C|1|60|0||F|Togepi|Rare Holo|Super Metronome~C~;Fly~CCC~30
17|Typhlosion|R|2|100|2|W||Quilava|Rare Holo|Flame Burst~RRRR~60+
18|Typhlosion|R|2|100|2|W||Quilava|Rare Holo|Flame Wheel~RRRR~80
19|Metal Energy||||||||Rare Holo|
20|Cleffa|C|0|30|0||||Rare|Eeeeeeek~C~
21|Donphan|F|1|70|3|G|L|Phanpy|Rare|Flail~F~10×;Rapid Spin~FFF~50
22|Elekid|L|0|30|0||||Rare|
23|Magby|R|0|30|0||||Rare|Sputter~C~10
24|Murkrow|D|0|50|0||P||Rare|Mean Look~D~;Feint Attack~DC~
25|Sneasel|D|0|60|0||P||Rare|Fury Swipes~C~10×;Beat Up~DD~20×
26|Aipom|C|0|40|0|F|P||Uncommon|Pilfer~C~;Tail Rap~C~10×
27|Ariados|G|1|60|1|R||Spinarak|Uncommon|Spider Web~G~;Poison Bite~GGG~20
28|Bayleef|G|1|70|2|R||Chikorita|Uncommon|Poisonpowder~GC~20;Pollen Shield~GGC~30
29|Bayleef|G|1|80|2|R||Chikorita|Uncommon|Sweet Scent~G~;Double Razor Leaf~GGG~40×
30|Clefairy|C|0|50|1|F|P||Uncommon|Doubleslap~CC~10×;Squaredance~CCC~
31|Croconaw|W|1|70|2|G||Totodile|Uncommon|Screech~C~;Jaw Clamp~WWC~30
32|Croconaw|W|1|80|2|G||Totodile|Uncommon|Tackle~CC~20;Sweep Away~WWC~50
33|Electabuzz|L|0|70|1|F|||Uncommon|Punch~CC~20;Swift~LLL~30
34|Flaaffy|L|1|60|1|F||Mareep|Uncommon|Discharge~L~30×;Electric Current~LL~20
35|Furret|C|1|60|1|F|P|Sentret|Uncommon|Quick Attack~CC~20+;Slam~CCC~30×
36|Gloom|G|1|60|1|R||Oddish|Uncommon|Strange Powder~GC~20;Sticky Nectar~GGC~20+
37|Granbull|C|1|70|2|F|P|Snubbull|Uncommon|Tackle~CC~20;Raging Charge~CCC~10+
38|Lanturn|L|1|70|2|F||Chinchou|Uncommon|Floodlight~LL~20
39|Ledian|G|1|60|0|R|F|Ledyba|Uncommon|Baton Pass~GG~30
40|Magmar|R|0|70|2|W|||Uncommon|Tail Slap~CC~20;Magma Punch~RRC~40
41|Miltank|C|0|70|2|F|P||Uncommon|Milk Drink~C~;Body Slam~CCC~20
42|Noctowl|C|1|60|0|L|F|Hoothoot|Uncommon|Wing Attack~CCC~30
43|Phanpy|F|0|40|1|G|L||Uncommon|Tackle~C~10;Endure~F~
44|Piloswine|W|1|80|3|G|L|Swinub|Uncommon|Freeze~WW~10;Blizzard~WWW~30
45|Quagsire|W|1|70|2|G|L|Wooper|Uncommon|Surf~WW~30;Earthquake~FFCC~60
46|Quilava|R|1|60|1|W||Cyndaquil|Uncommon|Ember~RC~30;Fire Wind~RR~20
47|Quilava|R|1|70|1|W||Cyndaquil|Uncommon|Smokescreen~RR~20;Char~RRR~30
48|Seadra|W|1|70|1|L||Horsea|Uncommon|Bubble~W~10;Mud Splash~WW~30
49|Skiploom|G|1|60|0|R|F|Hoppip|Uncommon|Poisonpowder~G~10;Stun Spore~G~10
50|Sunflora|G|1|70|1|R||Sunkern|Uncommon|Petal Dance~GGG~30×
51|Togepi|C|0|40|1||P||Uncommon|Poison Barb~CC~10
52|Xatu|P|1|80|1|P|F|Natu|Uncommon|Prophecy~P~;Confuse Ray~PPP~30
53|Chikorita|G|0|40|1|R|||Common|Tackle~C~10;Deflector~G~
54|Chikorita|G|0|50|1|R|||Common|Growl~C~;Razor Leaf~GC~20
55|Chinchou|L|0|50|1|F|||Common|Supersonic~L~;Flail~W~10×
56|Cyndaquil|R|0|40|1|W|||Common|Leer~C~;Swift~RC~20
57|Cyndaquil|R|0|50|1|W|||Common|Fireworks~R~20;Quick Attack~CC~10+
58|Girafarig|P|0|60|1||||Common|Agility~CC~10;Psybeam~PP~20
59|Gligar|F|0|60|0|G|F||Common|Poison Sting~F~10;Slash~CC~20
60|Hoothoot|C|0|50|1|L|F||Common|Hypnosis~C~;Peck~CC~20
61|Hoppip|G|0|50|0|R|F||Common|Hop~C~10;Sprout~G~
62|Horsea|W|0|50|0|L|||Common|Fin Slap~WW~20+
63|Ledyba|G|0|40|0|R|F||Common|Supersonic~G~;Comet Punch~GG~
64|Mantine|W|0|60|1|L|F||Common|Undulate~WW~20
65|Mareep|L|0|40|1|F|||Common|Static Electricity~L~;Thundershock~LL~20
66|Marill|W|0|40|1|L|||Common|Defense Curl~C~;Bubble Bomb~WW~30
67|Natu|P|0|30|0|P|F||Common|Peck~C~10;Telekinesis~PP~
68|Oddish|G|0|40|1|R|||Common|Hide~C~;Absorb~GG~20
69|Onix|F|0|60|2|G|||Common|Screech~C~;Rage~FF~10+
70|Pikachu|L|0|50|1|F|||Common|Quick Attack~C~10+;Agility~LLC~20
71|Sentret|C|0|40|1|F|P||Common|Fury Swipes~C~10×
72|Shuckle|G|0|50|1|R|||Common|Withdraw~G~;Wrap~GG~20
73|Slowpoke|P|0|50|1|P|||Common|Psyshock~P~10;Water Gun~W~10+
74|Snubbull|C|0|50|1|F|P||Common|Roar~C~;Lick~CC~10
75|Spinarak|G|0|40|1|R|||Common|Scary Face~C~;String Shot~G~10
76|Stantler|C|0|60|2|F|P||Common|Stomp~CC~20+;Mystifying Horns~CCC~20
77|Sudowoodo|F|0|60|3|W|||Common|Flail~F~10×;Rock Throw~FC~30
78|Sunkern|G|0|40|2|R|||Common|Growth~G~;Mega Drain~GGG~30
79|Swinub|W|0|40|1|G|L||Common|Powder Snow~W~10
80|Totodile|W|0|40|1|G|||Common|Bite~C~10;Rage~WC~10+
81|Totodile|W|0|50|1|G|||Common|Leer~C~;Fury Swipes~W~10×
82|Wooper|W|0|50|1|G|L||Common|Amnesia~W~;Slam~CC~20×
83|Arcade Game||||||||Rare|
84|Ecogym||||||||Rare|
85|Energy Charge||||||||Rare|
86|Focus Band||||||||Rare|
87|Mary||||||||Rare|
88|PokéGear||||||||Rare|
89|Super Energy Retrieval||||||||Rare|
90|Time Capsule||||||||Rare|
91|Bill’s Teleporter||||||||Uncommon|
92|Card-Flip Game||||||||Uncommon|
93|Gold Berry||||||||Uncommon|
94|Miracle Berry||||||||Uncommon|
95|New Pokédex||||||||Uncommon|
96|Professor Elm||||||||Uncommon|
97|Sprout Tower||||||||Uncommon|
98|Super Scoop Up||||||||Uncommon|
99|Berry||||||||Common|
100|Double Gust||||||||Common|
101|Moo-Moo Milk||||||||Common|
102|Pokémon March||||||||Common|
103|Super Rod||||||||Common|
104|Darkness Energy||||||||Rare|
105|Recycle Energy||||||||Rare|
106|Fighting Energy||||||||No Rarity|
107|Fire Energy||||||||No Rarity|
108|Grass Energy||||||||No Rarity|
109|Lightning Energy||||||||No Rarity|
110|Psychic Energy||||||||No Rarity|
111|Water Energy||||||||No Rarity|`.trim().split('\n');
const simple={type:'noop'},par=status=>({type:'status',target:'opponentActive',status}),
 coin=(heads,tails)=>({type:'coinFlip',heads:heads||simple,tails:tails||simple}),
 seq=(...effects)=>({type:'sequence',effects}),
 bonus=n=>({type:'bonusDamage',amount:n}),
 toss=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'}),
 guard=(effects=true)=>({type:'preventDamage',target:'self',duration:'opponentTurn',effects}),
 flipGuard=()=>coin(guard()),
 gate=()=>({type:'coinAttackGate',heads:simple}),
 damaged=(amount)=>({type:'damageFromDamage',source:'self',amount}),
 bench=(side,amount)=>({type:'benchDamage',side,all:true,amount});
const EFFECTS={};const TEXT={};
function set(num,index,effect,text){const key=num+':'+index;EFFECTS[key]=effect;TEXT[key]=text||'';}
// Mechanics whose exact semantics are understood by the existing TCG engine.
set(1,0,coin(seq(par('paralysis'),bench('opponent',10))),'Heads: Paralyze and deal 10 to each opposing Benched Pokémon.');
set(2,1,coin(seq(par('paralysis'),bench('opponent',10))),'Heads: Paralyze and deal 10 to each opposing Benched Pokémon.');
set(6,0,gate(),'Tails: no damage.');
set(7,0,par('sleep'),'Put the defender Asleep.');
set(7,1,{type:'drain',amount:10},'If this attack damages the defender, heal 10 from Jumpluff.');
set(8,0,flipGuard(),'Heads: prevent all opposing attack effects next turn.');
// Kingdra's Dragon Tornado checks for survival and chooses the switch target.
set(9,0,seq({type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1},{type:'discardEnergyCard',target:'self',energyType:'Water',amount:1},{type:'discardEnergyCard',target:'self',energyType:'Lightning',amount:1}),'Discard a Fire, Water and Lightning Energy to attack.');
set(10,0,coin(par('paralysis')),'Heads: Paralyze the defender.');
set(11,0,par('sleep'),'Put the defender Asleep.');
set(13,0,gate(),'Tails: the attack fails.');
set(13,1,coin({type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn',scope:'self'}),'Heads: reduce damage to Skarmory by 20 next turn.');
set(14,0,coin(seq(bonus(10),par('confusion'))),'Heads: 10 extra damage and Confusion.');
set(15,1,coin(bonus(20)),'Heads: 20 extra damage.');
set(16,1,{type:'coinAttackGate',heads:guard()},'Heads: attack succeeds and protects Togetic; tails: Fly misses.');
set(17,0,coin(seq(bonus(20),{type:'selfDamage',amount:20})),'Heads: 20 extra damage and 20 recoil.');
set(18,0,seq({type:'discardEnergyCard',target:'self',energyType:'Fire',amount:3},bench('self',20),bench('opponent',20)),'Discard three Fire Energy; deal 20 to all Benched Pokémon.');
set(21,0,damaged(10),'10 damage per damage counter on Donphan.');
// Rapid Spin requires an exact two-sided switch choice; leave it unavailable until that interaction is implemented.

set(25,0,toss(3,10),'Flip three coins; 10 damage per heads.');
set(25,1,{type:'coinDamageByPokemon',amount:20},'Flip a coin for each of your Pokémon in play; 20 per heads.');
set(26,1,toss(2,10),'Flip two coins; 10 per heads.');
// Spider Web persists while Active, not merely for one turn; no shortened substitute.

set(28,0,coin(par('poison')),'Heads: Poison the defender.');
set(29,1,toss(2,40),'Flip two coins; 40 per heads.');
set(30,0,toss(2,10),'Flip two coins; 10 per heads.');
set(32,1,{type:'discardTop',side:'self',amount:3},'Discard the top three cards of your deck.');
set(33,1,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},'Ignore the defender’s Weakness, Resistance and effects.');
set(35,0,coin(bonus(10)),'Heads: 10 extra damage.');
set(35,1,toss(2,30),'Flip two coins; 30 per heads.');
set(36,0,coin(par('confusion'),par('sleep')),'Heads: Confuse; tails: Asleep.');
set(37,1,seq(damaged(10),{type:'selfDamage',amount:20}),'Add 10 per damage counter and deal 20 to Granbull.');
set(38,0,coin(par('paralysis')),'Heads: Paralyze the defender.');
set(41,0,{type:'coinRepeatEffect',coins:2,effect:{type:'healSelf',amount:20}},'Flip twice; heal 20 from Miltank per heads.');
set(41,1,coin(par('paralysis')),'Heads: Paralyze.');
set(43,1,coin({type:'koGuard',mode:'survive',remainingHp:10,attackOnly:true,duration:'opponentTurn'}),'Heads: survive an attack KO next turn with 10 HP.');
set(44,1,coin(bench('opponent',10),bench('self',10)),'Deal 10 to the opponent Bench on heads, your Bench on tails.');
set(45,1,bench('self',10),'Deal 10 to each of your Benched Pokémon.');
set(46,0,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1},'Discard one attached Fire Energy to attack.');
set(47,0,{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},'The defender must flip heads to attack successfully next turn.');
set(48,0,coin(par('paralysis')),'Heads: Paralyze.');
set(49,0,par('poison'),'Poison the defender.');
set(49,1,coin(par('paralysis')),'Heads: Paralyze.');
set(50,0,seq(toss(3,30),{type:'status',target:'self',status:'confusion'}),'Flip three coins, 30 per heads; Sunflora becomes Confused.');
set(51,0,par('poison'),'Poison the defender.');
set(52,1,coin(par('confusion')),'Heads: Confuse.');
set(54,0,{type:'modifier',stat:'damageReduction',amount:10,duration:'opponentTurn',scope:'self'},'Reduce attack damage to Chikorita by 10 next turn.');
set(55,0,coin(par('confusion')),'Heads: Confuse.');
set(55,1,damaged(10),'10 per damage counter on Chinchou.');
set(56,1,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},'Ignore the defender’s Weakness, Resistance and effects.');
set(57,0,coin(simple,{type:'discardEnergyCard',target:'self',amount:1}),'Tails: discard one Energy attached to Cyndaquil.');
set(57,1,coin(bonus(20)),'Heads: 20 extra damage.');
set(58,0,flipGuard(),'Heads: prevent all opposing attack effects next turn.');
set(58,1,coin(par('confusion')),'Heads: Confuse.');
set(59,0,coin(par('poison')),'Heads: Poison.');
set(60,0,par('sleep'),'Put the defender Asleep.');
set(61,1,{type:'benchFromDeck',amount:1,filter:{name:'Hoppip',stage:'Basic'}},'Search for Hoppip and Bench it.');
set(63,0,coin(par('confusion')),'Heads: Confuse.');
set(63,1,toss(4,10),'Flip four coins, 10 per heads.');
set(64,0,flipGuard(),'Heads: prevent all opposing attack effects next turn.');
set(65,1,coin(par('paralysis')),'Heads: Paralyze.');
set(66,0,coin({type:'preventDamage',target:'self',duration:'opponentTurn'}),'Heads: prevent attack damage next turn.');
set(66,1,coin(par('paralysis'),{type:'selfDamage',amount:10}),'Heads: Paralyze, tails: 10 recoil.');
set(67,1,{type:'selectedDamage',target:'opponentPokemon',amount:20,ignoreWeakness:true,ignoreResistance:true},'Deal 20 to a chosen opposing Pokémon.');
set(68,0,flipGuard(),'Heads: prevent attack effects next turn.');
set(68,1,{type:'drain',fraction:.5},'Heal half the damage dealt (rounded up to 10).');
set(69,1,damaged(10),'Add 10 per damage counter on Onix.');
set(70,0,coin(bonus(20)),'Heads: 20 extra damage.');
set(70,1,flipGuard(),'Heads: prevent opposing attack effects next turn.');
set(71,0,toss(3,10),'Flip three coins, 10 per heads.');
set(72,0,coin({type:'preventDamage',target:'self',duration:'opponentTurn'}),'Heads: prevent attack damage next turn.');
set(72,1,coin(par('paralysis')),'Heads: Paralyze.');
set(73,0,coin(par('paralysis')),'Heads: Paralyze.');
set(74,0,coin({type:'forceOpponentSwitch'}),'Heads: the opponent switches.');
set(74,1,coin(par('paralysis')),'Heads: Paralyze.');
set(75,1,coin(par('paralysis')),'Heads: Paralyze.');
set(76,0,coin(bonus(10)),'Heads: 10 extra damage.');
set(76,1,coin(par('confusion')),'Heads: Confuse.');
set(77,0,damaged(10),'10 per damage counter on Sudowoodo.');
set(78,1,{type:'drain',fraction:.5},'Heal half the damage dealt (rounded up to 10).');
set(79,0,par('sleep'),'Put the defender Asleep.');
set(80,1,damaged(10),'Add 10 per damage counter on Totodile.');
set(81,1,toss(3,10),'Flip three coins, 10 per heads.');
set(82,1,toss(2,20),'Flip two coins, 20 per heads.');

// v0.69.95: complete Neo Genesis attack declarations, including the Johto rules.
const NR=name=>({type:'neoRule',rule:name});
const healPick=(side,amount)=>({type:'chooseTarget',target:side,effect:{type:'heal',target:side,amount}});
const atkBonus=(name)=>({type:'neoRule',rule:name});
set(3,0,coin(healPick('selfPokemon',999)),'Flip heads, then heal all damage from one of your Pokémon.');
set(3,1,{type:'fieldCountDamage',side:'self',filter:{name:'Bellossom'},amount:30,mode:'replace'},'30 for each Bellossom in play.');
set(4,0,NR('chomp'),'Flip once for each damage counter on Feraligatr, adding 10 per heads.');
set(5,0,NR('riptide'),'10 + 10 for each Water Energy in discard; return those Energy cards to the deck.');
set(8,1,NR('dragonTornado'),'After damage, if the defender survives, choose a new opposing Active from its Bench.');
set(12,0,NR('zzzap'),'Deal 20 to every Pokémon in play with a Pokémon Power, ignoring Weakness and Resistance.');
set(16,0,coin({type:'copyAttack',source:'opponentPokemon',ignoreUseCosts:false}),'Flip heads to copy one opposing Pokémon attack, ignoring only its Energy cost.');
set(20,0,{type:'handShuffle',side:'self',draw:7},'Shuffle your hand into your deck, then draw seven cards.');
set(21,1,NR('rapidSpin'),'Deal damage, then both players choose a Benched Pokémon to switch Active.');
set(23,0,NR('sputter'),'All Pokémon Powers stop functioning until the end of your next turn.');
set(24,0,NR('meanLook'),'Defender cannot retreat while Murkrow remains Active.');
set(24,1,seq({type:'selectedDamage',target:'opponentPokemon',amount:20},{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true}),'Choose any opposing Pokémon and deal 20 unaffected by other effects.');
set(26,0,NR('pilfer'),'Shuffle Aipom and attached cards into your deck; on heads shuffle a card from discard into it.');
set(27,0,coin(NR('spiderWeb')),'Heads: defender cannot retreat until it evolves or leaves the Active Spot.');
set(27,1,NR('poisonBite'),'If damage is dealt, Poison the defender and heal half the damage dealt.');
set(28,1,NR('pollenShield'),'Prevent Special Conditions on Bayleef during the opponent’s next turn.');
set(29,0,NR('sweetScent'),'Heads: heal 20 from one of yours; tails: heal 20 from an opposing Pokémon.');
set(30,1,NR('squaredance'),'Flip once for each Pokémon in play; take up to that many Basic Energy from Energy Zone into hand.');
set(31,0,NR('screech'),'Attacks damaging the defender get +20 until the end of your next turn.');
set(31,1,NR('jawClamp'),'Defender cannot retreat or switch out while Croconaw remains Active until the end of the opponent turn.');
set(34,0,NR('discharge'),'Discard all attached Lightning Energy; flip once per discarded Energy; 30 per heads.');
set(34,1,NR('electricCurrent'),'Move one attached Lightning Energy to one of your Benched Pokémon, or discard it if there is no Bench.');
set(36,1,coin(seq(bonus(10),NR('jawClamp'))),'Heads: +10 and defender cannot retreat or switch.');
set(39,0,NR('batonPass'),'Move all attached Grass Energy to a Benched Grass Pokémon and switch with it.');
set(44,0,coin(NR('freeze')),'Heads: defender cannot attack until it evolves or leaves Active.');
set(46,1,NR('fireWind'),'Choose a Benched Pokémon and flip twice, 10 damage per heads.');
set(47,1,coin(NR('char')),'Heads: put a persistent Char counter on the defender.');
set(48,1,NR('mudSplash'),'Choose an opposing Benched Pokémon and flip heads for 10 damage.');
set(52,0,NR('prophecy'),'Choose either player and arrange the top three deck cards.');
set(53,1,NR('deflector'),'Halve incoming damage to Chikorita, rounded down to nearest 10, next turn.');
set(56,0,coin(NR('leer')),'Heads: defender cannot attack Cyndaquil next turn.');
set(62,0,NR('finSlap'),'Add 10 damage if Horsea was damaged by an attack during the opponent’s last turn.');
set(65,0,NR('staticElectricity'),'For each Mareep in play attach Lightning Energy from Energy Zone to it.');
set(69,0,NR('screech'),'Attack damage to the defender is increased by 20 until end of your next turn.');
set(73,1,{type:'energyDamage',source:'self',energyType:'Water',extraAbove:1,maxCount:2,amount:10},'Add 10 per extra Water Energy, up to 20.');
set(75,0,coin(NR('scaryFace')),'Heads: defender cannot attack or retreat next turn.');
set(78,0,coin(NR('growth')),'Heads: attach up to two Grass Energy cards from hand to Sunkern.');
set(81,0,coin(NR('leer')),'Heads: defender cannot attack Totodile next turn.');
set(82,0,NR('amnesia'),'Choose a defender attack; it cannot use it next turn.');
// Neo Pokémon Powers have their own timing; do not present them as passive no-ops.
const NEO_ABILITIES={
 4:{name:'Berserk',type:'triggered',event:'evolved',fromHandOnly:true,effect:NR('berserk'),disabledByStatus:false},
 5:{name:'Downpour',type:'activated',oncePerTurn:false,effect:NR('downpour'),disabledByStatus:true},
 6:{name:'Final Blow',type:'passive',effect:NR('finalBlow'),disabledByStatus:true},
 10:{name:'Herbal Scent',type:'triggered',event:'evolved',fromHandOnly:true,effect:NR('herbalScent'),disabledByStatus:false},
 11:{name:'Wild Growth',type:'passive',effect:NR('wildGrowth'),disabledByStatus:true},
 14:{name:'Mind Games',type:'passive',effect:NR('mindGames'),disabledByStatus:true},
 17:{name:'Fire Recharge',type:'activated',oncePerTurn:true,effect:NR('fireRecharge'),disabledByStatus:true},
 18:{name:'Fire Boost',type:'triggered',event:'evolved',fromHandOnly:true,effect:NR('fireBoost'),disabledByStatus:false},
 22:{name:'Playful Punch',type:'activated',oncePerTurn:true,effect:NR('playfulPunch'),disabledByStatus:true},
 38:{name:'Hydroelectric Power',type:'passive',effect:NR('hydroelectricPower'),disabledByStatus:true},
 42:{name:'Glaring Gaze',type:'activated',oncePerTurn:true,effect:NR('glaringGaze'),disabledByStatus:true}
};

const PLAIN=new Set('2:0 15:0 32:0 33:0 37:0 40:0 40:1 42:0 43:0 45:0 53:0 54:1 59:1 60:1 61:0 67:0 77:1 80:0'.split(' '));
const POWERS={4:'Berserk',5:'Downpour',6:'Final Blow',10:'Herbal Scent',11:'Wild Growth',14:'Mind Games',17:'Fire Recharge',18:'Fire Boost',22:'Playful Punch',38:'Hydroelectric Power',42:'Glaring Gaze'};
// The inspector explains printed Pokémon Powers without replacing the actual
// card artwork or changing their implemented effects.
const POWER_RULES={
 4:'When played from hand to evolve, flip a coin. Heads: discard the top five cards of the opponent’s deck. Tails: discard the top five of your own deck.',
 5:'As often as you like during your turn, discard a Water Energy card from hand. Cannot use while Asleep, Confused or Paralyzed.',
 6:'If Heracross has 20 HP or less left, Megahorn’s base damage becomes 120 rather than 60. Stops working under a Special Condition.',
 10:'When played from hand to evolve, flip a coin. Heads: heal all damage from all Grass Pokémon in play.',
 11:'While active, each Grass Energy attached to your Grass Pokémon provides two Grass Energy. Stops working while Meganium is Asleep, Confused or Paralyzed.',
 14:'Whenever your opponent plays a Trainer, flip a coin. Heads: cancel the Trainer and return it to the top of their deck. Stops working under a Special Condition.',
 17:'Once during your turn, flip a coin. Heads: attach a Fire Energy card from your discard to one of your Fire Pokémon. Stops working under a Special Condition.',
 18:'When played from hand to evolve, flip a coin. Heads: attach up to four Fire Energy to Typhlosion (sourced from the Energy Zone in Classic 30).',
 22:'Once during your turn, flip a coin. Heads: deal 20 damage to the opposing Active Pokémon. Your turn ends either way. Cannot use under a Special Condition.',
 38:'Floodlight can deal ten extra damage for each additional Water Energy on Lanturn not used for its attack cost. Stops under a Special Condition.',
 42:'Once during your turn, flip a coin. Heads: look at your opponent’s hand, choose a Trainer and shuffle it into their deck. Cannot use under a Special Condition.'
};

const BABIES=new Set([12,20,22,23]);
const TRAINERS={
 83:{text:'Shuffle deck. Reveal top three; if at least two share a name, put all matching cards into hand and shuffle the rest.',effect:NR('arcadeGame')},
 84:{text:'Stadium. When a non-Colorless Energy card is discarded from a Pokémon by an attack, Power or Trainer, return it to its owner’s hand (not on Knock Out).',effect:NR('ecogym')},
 85:{text:'Flip heads to return up to two Energy from discard to deck.',effect:NR('energyCharge')},
 86:{text:'Pokémon Tool. On attack Knock Out, flip: heads leave 10 HP instead, then discard Focus Band.',effect:NR('focusBand')},
 87:{text:'Draw two cards, then choose two cards from your hand to shuffle into your deck.',effect:NR('mary')},
 88:{text:'Look at top seven of your deck. Take one Trainer into hand, shuffle deck and do not play any more Trainers this turn.',effect:NR('pokeGear')},
 89:{text:'Discard two other cards from hand to take up to four Basic Energy from your discard into hand.',effect:NR('superEnergyRetrieval')},
 90:{text:'Opponent may shuffle up to five Pokémon and Basic Energy from discard into deck; then you may do the same. No more Trainers this turn.',effect:NR('timeCapsule')},
 91:{text:'Flip a coin. On heads draw four cards.',effect:coin({type:'draw',amount:4})},
 92:{text:'Guess the type of one opposing Prize card, reveal it; if correct, draw two.',effect:NR('cardFlipGame')},
 93:{text:'Pokémon Tool. Heal forty damage and discard between turns when four damage counters are present.',effect:NR('goldBerry')},
 94:{text:'Pokémon Tool. Remove all Special Conditions and discard between turns if affected.',effect:NR('miracleBerry')},
 95:{text:'Shuffle your deck, then rearrange its top five cards.',effect:{type:'sequence',effects:[{type:'shuffleDeck',side:'self'},{type:'reorderTop',deckSide:'self',count:5}]}},
 96:{text:'Shuffle your hand into your deck; draw seven. You cannot play another Trainer this turn.',effect:NR('elm')},
 97:{text:'Stadium. Colorless Pokémon deal thirty less attack damage after Weakness and Resistance.',effect:NR('sproutTower')},
 98:{text:'Flip a coin. Heads: return a Pokémon and all of its cards to hand.',effect:coin({type:'scoopUp',target:'selfPokemon'})},
 99:{text:'Pokémon Tool. Heal twenty damage and discard between turns when two damage counters are present.',effect:NR('berry')},
 100:{text:'Each player chooses one of their Benched Pokémon to switch with Active; opponent chooses first.',effect:NR('doubleGust')},
 101:{text:'Choose a Pokémon, flip two coins, heal twenty damage for each heads.',effect:NR('mooMooMilk')},
 102:{text:'Opponent may search for and Bench one Basic Pokémon, then you may do the same. Shuffle decks.',effect:NR('pokemonMarch')},
 103:{text:'Flip a coin. Heads: return one Evolution from discard to hand. Tails: return one Basic Pokémon.',effect:NR('superRod')}
};
const STADIUMS=new Set([84,97]),TOOLS=new Set([86,93,94,99]);
const SPECIAL_ENERGY={19:{Metal:1},104:{Darkness:1},105:{Colorless:1}};
const SPECIAL_ENERGY_RULES={
 19:'Provides one Metal Energy. Reduce attack damage received by the attached Pokémon by 10. If the Pokémon is not Metal type, its own attacks deal 10 less damage.',
 104:'Provides one Darkness Energy. Attacks that damage the Defending Pokémon do 10 extra damage. At the end of each turn, place one damage counter on the attached Pokémon unless it is Darkness-type or has Dark in its name.',
 105:'Provides one Colorless Energy. When discarded from play, return Recycle Energy to its owner’s hand instead of the discard pile.'
};

const BASIC_ENERGY={106:'Fighting',107:'Fire',108:'Grass',109:'Lightning',110:'Psychic',111:'Water'};
const NEO_BABIES_READY=true,NEO_SPECIAL_READY=true;
const CARDS=DATA.map(line=>{
 const [raw,name,type,stage,hp,ret,weak,res,evolvesFrom,rarity,moves]=line.split('|'),n=Number(raw),id='neo1-'+n;
 const kind=n>=106||n===19||n===104||n===105?'energy':n>=83?'trainer':'pokemon';
 const basicEnergy=!!BASIC_ENERGY[n],specialEnergy=!!SPECIAL_ENERGY[n];
 const attacks=(moves||'').split(';').filter(Boolean).map((m,i)=>{
   const [name,cost,printedDamage]=m.split('~'),key=n+':'+i,effect=EFFECTS[key]||null;
   const variable=/[+×?]/.test(printedDamage),damage=/×/.test(printedDamage)?0:Number((printedDamage||'').replace(/[^0-9]/g,''))||0;
   return {name,cost,damage,damageText:variable?printedDamage:null,effect,text:TEXT[key]||(!PLAIN.has(key)&&!Object.hasOwn(EFFECTS,key)?'Printed effect pending full Classic engine support. See original card artwork for exact wording.':''),unimplemented:!PLAIN.has(key)&&!Object.hasOwn(EFFECTS,key)};
 });
 const abilities=NEO_ABILITIES[n]?[{...NEO_ABILITIES[n],text:POWER_RULES[n]}]:[];
 const reasons=[];
 if(kind==='pokemon'){
   if(BABIES.has(n)&&!NEO_BABIES_READY)reasons.push('Original Baby Pokémon Rule has not yet been implemented');
   if(abilities.some(a=>!fx?.supportsEffect?.(a.effect)))reasons.push('Printed Pokémon Power has not yet been implemented');
   for(const attack of attacks){
     if(attack.unimplemented)reasons.push('Printed '+attack.name+' effect not yet implemented');
     if(attack.effect&&!fx?.supportsEffect?.(attack.effect))reasons.push(attack.name+' effect not supported by engine');
     if(/[DM]/.test(attack.cost)&&!NEO_SPECIAL_READY)reasons.push('Special Darkness/Metal Energy is not yet resolved faithfully');
   }
   if(!attacks.length&&!abilities.length)reasons.push('No printed attacks or Powers');
 }else if(kind==='trainer'){
   if(!TRAINERS[n])reasons.push('Printed Trainer/Tool/Stadium effect not yet implemented');
   else if(!fx?.supportsEffect?.(TRAINERS[n].effect))reasons.push('Trainer effect not supported by engine');
 }else if(basicEnergy){/* Six Basic Energy prints are generated by Energy Zone, not legal deck slots. */}
 else if(!NEO_SPECIAL_READY)reasons.push('Special Energy attachment and its printed passive effects not yet implemented');
 const battleEnabled=!reasons.length;
 const c={id,setId:'neo1',number:String(n),name,source:'tcg',battleFormat:'classic',kind,rarity,
  ...(kind==='pokemon'?{stage:Number(stage)===0?'Basic':'Stage '+stage,hp:Number(hp),retreat:Number(ret||0),types:[TYPE[type]],subtype:TYPE[type],evolvesFrom:evolvesFrom||null,weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,attacks,abilities,baby:BABIES.has(n)}:{}),
  ...(kind==='trainer'?{trainerType:STADIUMS.has(n)?'Stadium':TOOLS.has(n)?'Tool':'Item',text:TRAINERS[n]?.text||'',effect:TRAINERS[n]?.effect||null}:{}),
  ...(kind==='energy'?{basicEnergy,specialEnergy,subtype:BASIC_ENERGY[n]||Object.keys(SPECIAL_ENERGY[n]||{})[0],types:[BASIC_ENERGY[n]||Object.keys(SPECIAL_ENERGY[n]||{})[0]],text:SPECIAL_ENERGY_RULES[n]||'',effect:specialEnergy?{type:'specialEnergy',provides:SPECIAL_ENERGY[n]}:null}:{}),
  battleEnabled,deckEligible:battleEnabled&&!basicEnergy,support:{status:battleEnabled?'FULL':'PARTIAL',reasons},
  image:'https://images.pokemontcg.io/neo1/'+n+'.png',imageLarge:'https://images.pokemontcg.io/neo1/'+n+'_hires.png'};
 return c;
});
if(CARDS.length!==111||new Set(CARDS.map(c=>c.id)).size!==111)throw new Error('Neo Genesis identity mismatch');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
 coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
