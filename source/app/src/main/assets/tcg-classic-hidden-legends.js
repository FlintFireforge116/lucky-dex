/* EX Hidden Legends (ex5) — complete 102-card 2004 Classic TCG expansion.
 * Original print text and stats from PokemonTCG/pokemon-tcg-data cards/en/ex5.json.
 * The Classic battle rules use LuckyDex's single-Active and separate Energy Zone.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGHiddenLegends=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ex5',name:'EX Hidden Legends',series:'EX',releaseDate:'2004-06-14',cardCount:102});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Banette|P|P|1|70|1|D|F|Shuppet|Rare Holo|Shadow Steal~P~10+;Darkness Chant~PC~|
2|Claydol|P|P|1|80|1|P||Baltoy|Rare Holo|Muddy Eye~P~10×|Primal Pull
3|Crobat|P|G|2|90||P||Golbat|Rare Holo|Flutter Trick~C~20;Triple Poison~GC~10|
4|Dark Celebi|P|G|0|70|1|R|||Rare Holo|Dark Provide~C~;Leaf Poison~GD~20|
5|Electrode|P|L|1|70|1|F||Voltorb|Rare Holo|Swift~L~30;Mass Destruction~CCC~|
6|Exploud|P|C|2|120|2|F||Loudred|Rare Holo|Breaking Sound~C~;Bass Control~CC~;Thunderous Roar~CCC~30;Hyper Voice~CCCC~60|
7|Heracross|P|G|0|70|1|R|||Rare Holo|Extra Draw~C~;Sonicboom~GGC~50|
8|Jirachi|P|P|0|70|1|R|||Rare Holo|Make a Wish~C~;Mind Bend~PM~30|
9|Machamp|P|F|2|120|2|P||Machoke|Rare Holo|Brick Smash~FC~40;Cross Chop~FCCC~60+|Overzealous
10|Medicham|P|F|1|80|1|P||Meditite|Rare Holo|Meditate~FC~20+;Chakra Points~FCC~10+|
11|Metagross|P|P|2|100|2|R|P|Metang|Rare Holo|Squared Attack~PMC~30×|Metal Juncture
12|Milotic|P|W|1|100|2|L||Feebas|Rare Holo|Wave Splash~WC~30;Distorted Wave~WWCC~80|Healing Shower
13|Pinsir|P|G|0|70|1|R|||Rare Holo|Sonicboom~GC~30|Crust
14|Shiftry|P|D|2|110|2|F|P|Nuzleaf|Rare Holo|Push Aside~DC~30;Supernatural Power~CCC~40+|
15|Walrein|P|W|2|120|3|M||Sealeo|Rare Holo|Sheer Cold~WWC~50|Crush Draw
16|Bellossom|P|G|2|100|2|R|W|Gloom|Rare|Miracle Powder~G~10;Solarbeam~GCC~50|Heal Dance
17|Chimecho|P|P|0|60|1|P|||Rare|Chime~C~;Psychic Boom~P~10×|
18|Gorebyss|P|W|1|70||L||Clamperl|Rare|Stun Needle~C~10;Mystic Water~WC~20+|
19|Huntail|P|W|1|80|1|L||Clamperl|Rare|Bite~CC~20;Dark Splash~WCC~40+|
20|Masquerain|P|G|1|70||L|F|Surskit|Rare|Whirlwind~C~20;Silver Wind~GC~30|
21|Metang|P|M|1|80|2|R|G|Beldum|Rare|Metal Load~C~;Metal Claw~MC~30|
22|Ninetales|P|R|1|70|1|W||Vulpix|Rare|Quick Attack~CC~20+;Will-o'-the-wisp~RCC~50|Safeguard
23|Rain Castform|P|W|0|60|1|L|||Rare|Scattered Shower~W~;Rainy Day Blues~CC~20|Temperamental Weather
24|Relicanth|P|W|0|60|1|L|||Rare|Yawn~W~10|Deep Sleep
25|Snow-cloud Castform|P|W|0|70|2|M|||Rare|Flurries~W~;White Snow~WWCC~50+|Temperamental Weather
26|Sunny Castform|P|R|0|70|2|W|||Rare|Sunshine~R~;Sunburn~RCC~40|Temperamental Weather
27|Tropius|P|G|0|80|1|R|||Rare|Fruition~G~;Gust~CC~20|
28|Beldum|P|M|0|50|2|R|G||Uncommon|Tackle~C~10|Levitate
29|Beldum|P|M|0|50|2|R|G||Uncommon|Metal Charge~MC~30|Magnetic Call
30|Castform|P|C|0|60|1|F|||Uncommon|Forecast~C~;Extra Ball~CC~20+|Temperamental Weather
31|Claydol|P|F|1|80|1|W||Baltoy|Uncommon|Hyper Beam~PC~20;Ram~FCC~50|
32|Corsola|P|W|0|70|1|G|||Uncommon|Coral Glow~C~;Surf~WCC~40|
33|Dodrio|P|C|1|80||L|F|Doduo|Uncommon|Retaliate~CC~10×;Slashing Strike~CC~40|Fast Feet
34|Glalie|P|W|1|80|1|M||Snorunt|Uncommon|Heavy Blizzard~WCC~50|Ice Wall
35|Gloom|P|G|1|70|1|R||Oddish|Uncommon|Cling~GC~20;Double Razor Leaf~GCC~40×|
36|Golbat|P|G|1|70|1|P||Zubat|Uncommon|Supersonic~C~;Sharp Fang~GC~20|
37|Igglybuff|P|C|0|50|1|F|||Uncommon|Set Song~C~|Baby Evolution
38|Lanturn|P|L|1|80|2|F||Chinchou|Uncommon|Lightning Strike~LLC~50|Energy Grounding
39|Loudred|P|C|1|80|2|F||Whismur|Uncommon|Cracking Voice~CC~20;Light Punch~CCC~40|
40|Luvdisc|P|W|0|60|1|L|||Uncommon|Loving Draw~C~;Sweet Temptation~W~|
41|Machoke|P|F|1|80|1|P||Machop|Uncommon|Low Kick~FC~30|Strikes Back
42|Medicham|P|F|1|80|1|P||Meditite|Uncommon|Steady Punch~C~20+;Power Heal~FC~10+|
43|Metang|P|P|1|80|2|P||Beldum|Uncommon|Psyshock~CC~20;Metal Ball~PCC~|
44|Metang|P|M|1|70|2|R|G|Beldum|Uncommon|Tackle~CC~20|Levitate
45|Nuzleaf|P|D|1|70|1|F|P|Seedot|Uncommon|Upper Hand~C~;Feint Attack~DCC~|
46|Rhydon|P|F|1|90|2|W||Rhyhorn|Uncommon|Horn Drill~C~20;Hyper Tail~FCC~50+|Power Diffusion
47|Sealeo|P|W|1|70|1|M||Spheal|Uncommon|Super Icy Wind~W~;Skull Bash~WCC~50|
48|Spinda|P|C|0|60|1|F|||Uncommon|The Hula-la~C~;Flail~C~10×|
49|Starmie|P|P|1|80|1|P||Staryu|Uncommon|Water Arrow~W~;Rainbow Star~PCC~50+|
50|Swalot|P|G|1|80|2|P||Gulpin|Uncommon|Amnesia~C~10;Swallow Up~GCC~50+|
51|Tentacruel|P|W|1|70||L||Tentacool|Uncommon|Long Tentacle~C~;Toxic~CC~|
52|Baltoy|P|P|0|50|1|P|||Common|Psyshock~P~10|
53|Baltoy|P|F|0|50|1|W|||Common|Headbutt~C~10;Mud Slap~CC~20|
54|Beldum|P|P|0|50|1|P|||Common|Call for Family~C~;Metal Ball~P~|
55|Chikorita|P|G|0|50|1|R|W||Common|Poisonpowder~C~|
56|Chinchou|P|L|0|50|1|F|||Common|Pound~C~10;Spark~LC~10|
57|Chinchou|P|L|0|50|1|F|||Common|Random Spark~L~;Lightning Ball~LC~20|
58|Clamperl|P|W|0|40|1|L|||Common|Bubble~WC~20|Exoskeleton
59|Cyndaquil|P|R|0|50|1|W|||Common|Swift~C~10;Rage~CC~10+|
60|Doduo|P|C|0|40|1|L|F||Common|Drill Peck~C~10|
61|Feebas|P|W|0|30|1|L|||Common|Tackle~C~10;Ascension~W~|
62|Gulpin|P|G|0|50|1|P|||Common|Yawn~C~;Spit Poison~G~|
63|Jigglypuff|P|C|0|50|1|F|||Common|Rollout~C~10;Sleepy Song~CC~|
64|Machop|P|F|0|50|1|P|||Common|Knuckle Punch~C~10;Karate Chop~FC~30-|
65|Meditite|P|P|0|50|1|P|||Common|Double Chop~C~10×;Calm Mind~P~|
66|Meditite|P|F|0|50|1|P|||Common|Jab~F~10;Steady Punch~CC~20+|
67|Minun|P|L|0|50|1|F|M||Common|Minus Energy~C~10;Thundershock~LC~20|
68|Oddish|P|G|0|50|1|R|||Common|Poisonpowder~C~;Razor Leaf~G~10|
69|Plusle|P|L|0|50|1|F|M||Common|Plus Energy~C~;Dazzle Blast~LC~20|
70|Rhyhorn|P|F|0|60|1|W|||Common|Double Stab~C~10×;Take Down~FCC~50|
71|Seedot|P|G|0|40|1|R|||Common|Growth Spurt~C~;Trip Over~CC~10+|
72|Shuppet|P|P|0|40|1|D|F||Common|Shadow Crush~P~10|
73|Snorunt|P|W|0|50|1|M|||Common|Ice Breath~C~;Tackle~CC~20|
74|Spheal|P|W|0|40|1|M|||Common|Freezing Breath~C~|
75|Staryu|P|W|0|50|1|L|||Common|Pound~W~10|Core Guard
76|Surskit|P|G|0|50|1|R|||Common|Splash About~C~10+|
77|Tentacool|P|W|0|50|1|L|||Common|Wrap~C~|Freefloating
78|Togepi|P|C|0|50|1|F|||Common|Sleepy Song~C~|
79|Totodile|P|W|0|50|1|L|||Common|Flail~C~10×;Bite~WC~20|
80|Voltorb|P|L|0|40|1|F|||Common|Recharge~C~;Rolling Attack~LC~20|
81|Vulpix|P|R|0|50|1|W|||Common|Scratch~C~10;Ascension~R~|
82|Whismur|P|C|0|50|1|F|||Common|Wail~C~10|
83|Zubat|P|G|0|50|1|P|||Common|Quick Turn~C~10×;Surprise~G~|
84|Ancient Technical Machine [Ice]|T||0||||||Uncommon|Ice Generator~C~|
85|Ancient Technical Machine [Rock]|T||0||||||Uncommon|Stone Generator~C~|
86|Ancient Technical Machine [Steel]|T||0||||||Uncommon|Steel Generator~CC~|
87|Ancient Tomb|T||0||||||Uncommon||
88|Desert Ruins|T||0||||||Uncommon||
89|Island Cave|T||0||||||Uncommon||
90|Life Herb|T||0||||||Uncommon||
91|Magnetic Storm|T||0||||||Uncommon||
92|Steven's Advice|T||0||||||Uncommon||
93|Groudon ex|P|F|0|100|3|W|||Rare Holo EX|Rock Tumble~CC~30;Crushing Mantle~FFC~50+|Mark of Antiquity
94|Kyogre ex|P|W|0|100|3|G|||Rare Holo EX|Water Arrow~CC~;Super Tidal Wave~WWC~50+|Mark of Antiquity
95|Metagross ex|P|M|2|150|4|F|G|Metang|Rare Holo EX|Metal Reversal~MC~40;Extra Comet Punch~MMCC~50+|
96|Ninetales ex|P|R|1|90|1|W||Vulpix|Rare Holo EX|Intense Glare~C~;Fire Blast~RCCC~100|
97|Regice ex|P|W|0|90|2|M|||Rare Holo EX|Freeze Lock~WWC~60|Crystal Body
98|Regirock ex|P|F|0|100|3|W|||Rare Holo EX|Tonnage~FFC~60+|Healing Stone
99|Registeel ex|P|M|0|90|2|R|G||Rare Holo EX|Steel Wave~MMC~50|Exoskeleton
100|Vileplume ex|P|G|2|140|2|P||Gloom|Rare Holo EX|Special Formula~GCC~50|Block Dust
101|Wigglytuff ex|P|C|1|100|1|F||Jigglypuff|Rare Holo EX|Sleepy Song~CC~30;Do the Wave~CCC~30+|
102|Groudon|P|F|0|80|3|G|||Rare Secret|Mud Shot~FC~20;Earthquake~FFFC~60|`;
const PRINT=`1|Does 10 damage plus 20 more damage for each Special Energy card in your opponent's discard pile.§Count the number of Basic Pokémon or Evolution cards in your discard pile. Put that many damage counters on the Defending Pokémon. You can't put more than 6 damage counters on the Defending Pokémon in this way.|-
2|Does 10 damage times the number of basic Energy cards attached to Claydol and the Defending Pokémon.|Primal Pull:As long as Claydol is your Active Pokémon, each player's Evolved Pokémon pays Colorless more Energy to use its attacks.
3|Flip a coin. If heads, look at your opponent's hand and choose 1 card. Your opponent discards the card you chose.§The Defending Pokémon is now Poisoned. Put 3 damage counters instead of 1 on the Defending Pokémon between turns.|-
4|Attach up to 1 Grass or Darkness Energy card from your hand to your Pokémon.§The Defending Pokémon is now Poisoned.|-
5|This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.§Both Electrode and the Defending Pokémon are now Knocked Out. If Electrode has any Special Energy cards attached to it, this attack does nothing.|-
6|Does 10 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§Does 30 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§The Defending Pokémon is now Confused.§-|-
7|If your opponent has any Pokémon-ex in play, search your deck for up to 2 Grass Energy cards and attach them to Heracross. Shuffle your deck afterward.§This attack's damage isn't affected by Weakness or Resistance.|-
8|Search your deck for a card that evolves from 1 of your Pokémon and put it on that Pokémon. (This counts as evolving that Pokémon.) If you do, put 1 damage counter on Jirachi. Shuffle your deck afterward.§Flip a coin. If heads, the Defending Pokémon is now Confused.|-
9|This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.§Flip a coin. If heads, this attack does 60 damage plus 30 more damage.|Overzealous:If your opponent has any Pokémon-ex in play, each of Machamp's attacks do 30 more damage to the Defending Pokémon.
10|Does 20 damage plus 10 more damage for each damage counter on the Defending Pokémon.§Does 10 damage plus 10 more damage for each card in your opponent's hand.|-
11|Flip 4 coins. This attack does 30 damage times the number of heads.|Metal Juncture:As often as you like during your turn (before your attack), you may move a Metal Energy card attached to 1 of your Benched Pokémon to your Active Pokémon. This power can't be used if Metagross is affected by a Special Condition.
12|-§Before doing damage, remove 3 damage counters from the Defending Pokémon (all if there are less than 3).|Healing Shower:Once during your turn, when you play Milotic from your hand to evolve 1 of your Pokémon, you may remove all damage counters from all of your Pokémon and your opponent's Pokémon (excluding Pokémon-ex).
13|This attack's damage isn't affected by Weakness or Resistance.|Crust:Any damage done to Pinsir by attacks from your opponent's Basic Pokémon is reduced by 30 (after applying Weakness and Resistance).
14|Look at your opponent's hand and choose 1 Basic Pokémon or Evolution card you find there. Your opponent puts it at the bottom of his or her deck.§If you have the same number of cards in your hand as your opponent, this attack does 40 damage plus 40 more damage.|-
15|Flip a coin. If heads, each Defending Pokémon can't attack during your opponent's next turn.|Crush Draw:Once during your turn (before your attack), you may reveal the top card of your deck. If that card is a basic Energy card, attach it to 1 of your Pokémon. If not, put the card back on your deck. This power can't be used if Walrein is affected by a Special Condition.
16|Flip a coin. If heads, choose 1 Special Condition. The Defending Pokémon is now affected by that Special Condition.§-|Heal Dance:Once during your turn (before your attack), you may remove 2 damage counters from 1 of your Pokémon. You can't use more than 1 Heal Dance Poké-Power each turn. This power can't be used if Bellossom is affected by a Special Condition.
17|Search your opponent's discard pile for a Supporter card and use the effect of that card as the effect of this attack. (The Supporter card remains in your opponent's discard pile.)§Does 10 damage times the amount of Energy attached to the Defending Pokémon.|-
18|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§Does 20 damage plus 10 more damage for each Psychic Energy in play.|-
19|-§Does 40 damage plus 10 more damage for each Darkness Pokémon in play.|-
20|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.§During your next turn, if an attack does damage to the Defending Pokémon (after applying Weakness and Resistance), that attack does 30 more damage.|-
21|Search your discard pile for a Metal Energy card and attach it to Metang.§-|-
22|Flip a coin. If heads, this attack does 20 damage plus 20 more damage.§-|Safeguard:Prevent all effects of attacks, including damage, done to Ninetales by your opponent's Pokémon-ex.
23|Shuffle your hand into your deck. Draw up to 5 cards.§If Low Pressure System is in play, the Defending Pokémon is now Confused.|Temperamental Weather:Once during your turn (before your attack), you may search your deck for Castform, Sunny Castform, or Snow-cloud Castform and switch it with Rain Castform. (Any cards attached to Rain Castform, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) Shuffle Rain Castform back into your deck. You can't use more than 1 Temperamental Weather Poké-Power each turn.
24|Flip a coin. If heads, the Defending Pokémon is now Asleep.|Deep Sleep:As long as Relicanth is your Active Pokémon, a player flips 2 coins for each of his or her Pokémon that is Asleep between turns. If either coin is tails, that Pokémon is still Asleep.
25|Flip a coin. If heads, the Defending Pokémon is now Paralyzed. If tails, the Defending Pokémon is now Asleep.§If Magnetic Storm is in play, this attack does 50 damage plus 20 more damage.|Temperamental Weather:Once during your turn (before your attack), you may search your deck for Castform, Rain Castform, or Sunny Castform and switch it with Snow-cloud Castform. (Any cards attached to Snow-cloud Castform, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) Shuffle Snow-cloud Castform back into your deck. You can't use more than 1 Temperamental Weather Poké-Power each turn.
26|Search your discard pile for a Stadium card, show it to your opponent, and put it into your hand.§If High Pressure System is in play, the Defending Pokémon is now Burned.|Temperamental Weather:Once during your turn (before your attack), you may search your deck for Castform, Rain Castform, or Snow-cloud Castform and switch it with Sunny Castform. (Any cards attached to Sunny Castform, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) Shuffle Sunny Castform back into your deck. You can't use more than 1 Temperamental Weather Poké-Power each turn.
27|Move 1 Energy card attached to Tropius to another of your Pokémon and remove 4 damage counters from that Pokémon (all if there are less than 4).§-|-
28|-|Levitate:If Beldum has any Energy attached to it, Beldum's Retreat Cost is 0.
29|Put 1 damage counter on Beldum.|Magnetic Call:Once during your turn (before your attack), you may flip a coin. If heads, search your deck for a Metal Basic Pokémon and put it onto your Bench. Shuffle your deck afterward. This power can't be used if Beldum is affected by a Special Condition.
30|Search your deck for a Stadium card and play it. Shuffle your deck afterward.§If the Defending Pokémon is Pokémon-ex, this attack does 20 damage plus 20 more damage.|Temperamental Weather:Once during your turn (before your attack), you may search your deck for Sunny Castform, Rain Castform, or Snow-cloud Castform and switch it with Castform. (Any cards attached to Castform, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) Shuffle Castform back into your deck. You can't use more than 1 Temperamental Weather Poké-Power each turn.
31|Flip a coin. If heads, discard 1 Energy attached to the Defending Pokémon.§-|-
32|Draw a number of cards up to the number of your opponent's Basic Pokémon in play. (You can't have more than 10 cards in your hand in this way.)§-|-
33|Does 10 damage times the number of damage counters on Dodrio.§Flip a coin. If tails, Dodrio can't use Slashing Strike during your next turn.|Fast Feet:Dodrio can retreat even when it is Asleep or Paralyzed.
34|Flip a coin. If heads, put 1 damage counter on each of your opponent's Benched Pokémon.|Ice Wall:Any damage done to Glalie by attacks from your opponent's Pokémon with any Special Energy cards attached to it is reduced by 40 (after applying Weakness and Resistance).
35|After your attack, remove from Gloom the number of damage counters equal to the damage you did to the Defending Pokémon. If Gloom has fewer damage counters than that, remove all of them.§Flip 2 coins. This attack does 40 damage times the number of heads.|-
36|The Defending Pokémon is now Confused.§-|-
37|Search your deck for a Basic Pokémon and a basic Energy card, show them to your opponent, and put them into your hand. Shuffle your deck afterward.|Baby Evolution:Once during your turn (before your attack), you may put Jigglypuff from your hand onto Igglybuff (this counts as evolving Igglybuff), and remove all damage counters from Igglybuff.
38|You may discard all Lightning Energy attached to Lanturn. If you do, this attack's base damage is 90 instead of 50.|Energy Grounding:Once during your opponent's turn, when any of your Pokémon is Knocked Out by your opponent's attacks, you may use this power. Choose a basic Energy card discarded from the Knocked Out Pokémon and attach it to Lanturn. You can't use more than 1 Energy Grounding Poké-Power each turn.
39|Flip a coin. If heads, each Defending Pokémon is now Confused.§-|-
40|Draw cards until you have the same number of cards in your hand as your opponent has in his or her hand.§Switch 1 of your opponent's Benched Pokémon with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch. This attack does 10 damage to the new Defending Pokémon.|-
41|-|Strikes Back:If Machoke is your Active Pokémon and is damaged by an opponent's attack (even if Machoke is Knocked Out), put 1 damage counter on the Attacking Pokémon.
42|Flip a coin. If heads, this attack does 20 damage plus 10 more damage.§Does 10 damage plus 10 more damage for each damage counter on Medicham. After doing damage, remove 1 damage counter from Medicham.|-
43|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§Put 5 damage counters on the Defending Pokémon.|-
44|-|Levitate:If Metang has any Energy attached to it, Metang's Retreat Cost is 0.
45|Choose 1 of the Defending Pokémon's attacks. That Pokémon can't use that attack during your opponent's next turn.§Choose 1 of your opponent's Pokémon. This attack does 40 damage to that Pokémon. This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on that Pokémon.|-
46|-§If the Defending Pokémon has any Poké-Powers or Poké-Bodies, this attack does 50 damage plus 20 more damage.|Power Diffusion:As long as Rhydon is your Active Pokémon, prevent all damage done by attacks to all of your Benched Pokémon.
47|Does 10 damage to each of your opponent's Pokémon. This attack's damage isn't affected by Weakness or Resistance.§-|-
48|Flip a coin. If heads, the Defending Pokémon is now Confused. If tails, both the Defending Pokémon and Spinda are now Confused.§Does 10 damage times the number of damage counters on Spinda.|-
49|Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§Does 50 damage plus 10 more damage for each type of basic Energy attached to the Defending Pokémon.|-
50|Choose 1 of the Defending Pokémon's attacks. That Pokémon can't use that attack during your opponent's next turn.§Before doing damage, count the remaining HP of the Defending Pokémon and Swalot. If the Defending Pokémon has fewer remaining HP than Swalot's, this attack does 50 damage plus 30 more damage.|-
51|Flip a coin. If heads, the Defending Pokémon is now Confused. If tails, discard an Energy card attached to the Defending Pokémon.§The Defending Pokémon is now Poisoned. Put 2 damage counters instead of 1 on the Defending Pokémon between turns.|-
52|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
53|-§-|-
54|Search your deck for a Basic Pokémon and put it onto your Bench. Shuffle your deck afterward.§Put 1 damage counter on the Defending Pokémon.|-
55|Flip a coin. If heads, the Defending Pokémon is now Poisoned.|-
56|-§Choose 2 of your opponent's Benched Pokémon. This attack does 10 damage to each of those Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
57|Choose 1 of your opponent's Pokémon. This attack does 10 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§-|-
58|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|Exoskeleton:Any damage done to Clamperl by attacks is reduced by 10 (after applying Weakness and Resistance).
59|This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.§Does 10 damage plus 10 more damage for each damage counter on Cyndaquil.|-
60|-|-
61|-§Search your deck for a card that evolves from Feebas and put it on Feebas. (This counts as evolving Feebas.) Shuffle your deck afterward.|-
62|The Defending Pokémon is now Asleep.§The Defending Pokémon is now Poisoned.|-
63|-§Each Defending Pokémon is now Asleep.|-
64|-§Does 30 damage minus 10 damage for each damage counter on Machop.|-
65|Flip 2 coins. This attack does 10 damage times the number of heads.§Remove 2 damage counters from Meditite (remove 1 if there is only 1).|-
66|-§Flip a coin. If heads, this attack does 20 damage plus 10 more damage.|-
67|Flip a coin. If heads, choose 1 Energy attached to the Defending Pokémon. Your opponent returns that card to his or her hand.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
68|Flip a coin. If heads, the Defending Pokémon is now Poisoned.§-|-
69|Flip a coin. If heads, attach a Lightning Energy card from your hand to any of your Pokémon.§Flip a coin. If heads, the Defending Pokémon is now Confused.|-
70|Flip 2 coins. This attack does 10 damage times the number of heads.§Rhyhorn does 10 damage to itself.|-
71|Attach a Grass Energy card from your hand to Seedot.§Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|-
72|You may discard 1 Psychic Energy card attached to Shuppet. If you do, your opponent discards 1 Energy card attached to the Defending Pokémon.|-
73|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§-|-
74|Flip a coin. If heads, the Defending Pokémon is now Paralyzed. If tails, the Defending Pokémon is now Asleep.|-
75|-|Core Guard:If Staryu has any Psychic Energy attached to it, damage done to Staryu by any attack is reduced by 10 (after applying Weakness and Resistance).
76|If Surskit has less Energy attached to it than the Defending Pokémon, this attack does 10 damage plus 10 more damage.|-
77|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|Freefloating:If Tentacool has no Energy attached to it, Tentacool's Retreat Cost is 0.
78|Each Defending Pokémon is now Asleep.|-
79|Does 10 damage for each damage counter on Totodile.§-|-
80|Search your deck for a Lightning Energy card and attach it to Voltorb. Shuffle your deck afterward.§-|-
81|-§Search your deck for a card that evolves from Vulpix and put it on Vulpix. (This counts as evolving Vulpix.) Shuffle your deck afterward.|-
82|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.|-
83|Flip 2 coins. This attack does 10 damage times the number of heads.§Choose 1 card from your opponent's hand without looking. Look at the card you chose, then have your opponent shuffle that card into his or her deck.|-
84|Discard all of your opponent's Trainer cards in play. If you do, prevent all effects, including damage, done to the Pokémon using this attack during your opponent's next turn.|-|Attach this card to 1 of your Evolved Pokémon (excluding Pokémon-ex and Pokémon that has an owner in its name) in play. That Pokémon may use this card's attack instead of its own. At the end of your turn, discard Ancient Technical Machine [Ice].
85|If your opponent has any Evolved Pokémon in play, remove the highest Stage Evolution card from each of them and put those cards back into his or her hand.|-|Attach this card to 1 of your Evolved Pokémon (excluding Pokémon-ex and Pokémon that has an owner in its name) in play. That Pokémon may use this card's attack instead of its own. At the end of your turn, discard Ancient Technical Machine [Rock].
86|If the Defending Pokémon has a Poké-Power or Poké-Body, choose up to 2 basic Energy cards attached to 1 of your opponent's Pokémon and attach them to the Defending Pokémon.|-|Attach this card to 1 of your Evolved Pokémon (excluding Pokémon-ex and Pokémon that has an owner in its name) in play. That Pokémon may use this card's attack instead of its own. At the end of your turn, discard Ancient Technical Machine [Steel].
87|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Don't apply Weakness for all Pokémon in play (excluding Pokémon-ex and Pokémon that has an owner in its name).
88|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § At any time between turns, each player puts 1 damage counter on his or her Pokémon-ex with maximum HP of at least 100.
89|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Whenever any player attaches an Energy card from his or her hand to Water Pokémon, Fighting Pokémon, or Metal Pokémon, remove any Special Conditions from that Pokémon.
90|-|-|Flip a coin. If heads, choose 1 of your Pokémon (excluding Pokémon-ex). Remove all Special Conditions and 6 damage counters from that Pokémon (all if there are less than 6).
91|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Any damage done by attacks from Psychic Pokémon and Fighting Pokémon (both yours and your opponent's) is not affected by Resistance.
92|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Draw a number of cards up to the number of your opponent's Pokémon in play. § If you have more than 7 cards (including this one) in your hand, you can't play this card.
93|This attack's damage is not affected by Resistance.§You may discard from your hand as many Energy cards as you like. If you do, this attack does 50 damage plus 10 more damage for each Energy card you discarded.|Mark of Antiquity:As long as Groudon ex is your Active Pokémon, each player's Kyogre ex and Rayquaza ex can't attack.
94|Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§You may show your hand to your opponent. If you do, this attack does 50 damage plus 10 more damage for each Energy card in your hand. After doing damage, shuffle the Energy cards back into your deck.|Mark of Antiquity:As long as Kyogre ex is your Active Pokémon, each player's Groudon ex and Rayquaza ex can't attack.
95|Before doing damage, you may choose 1 of your opponent's Benched Pokémon and switch it with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch. If you do, this attack does 40 damage to the new Defending Pokémon.§During your next turn, Extra Comet Punch does 50 damage plus 50 more damage.|-
96|Switch 1 of your opponent's Benched Pokémon with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch. The new Defending Pokémon is now Burned and Confused.§Discard a Fire Energy attached to Ninetales ex.|-
97|Flip a coin. If heads, your opponent can't attach Energy cards from his or her hand to the Defending Pokémon during his or her next turn.|Crystal Body:Prevent all effects of attacks, except damage, done to Regice ex by the Attacking Pokémon.
98|You may do 60 damage plus 20 more damage. If you do, Regirock ex does 30 damage to itself.|Healing Stone:At any time between turns, remove 1 damage counter from Regirock ex.
99|Does 20 damage to each of your opponent's Benched Pokémon of the same type as the Defending Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|Exoskeleton:Any damage done to Registeel ex by attacks is reduced by 10 (after applying Weakness and Resistance).
100|Flip a coin. If heads, the Defending Pokémon is now Asleep and Poisoned. If tails, the Defending Pokémon is now Confused.|Block Dust:As long as Vileplume ex is your Active Pokémon, your opponent can't play any Trainer cards (except for Supporter cards) from his or her hand.
101|Each Defending Pokémon is now Asleep.§Does 30 damage plus 10 more damage for each of your Benched Pokémon.|-
102|-§Does 10 damage to each of your Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-`;
const FIELDS=new Map(RAW.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const TEXT=new Map(PRINT.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const noop={type:'noop'},r=name=>({type:'neoRule',rule:'ex5:'+name});
const EX=new Set([93,94,95,96,97,98,99,100,101]);
const TM=new Set([84,85,86]),STADIUM=new Set([87,88,89,91]);
const ACTIVATE=new Set([11,15,16,23,25,26,29,30,37]);
const DISABLED_STATUS=new Set([11,15,16,23,25,26,29,30]);
function parse(n){
 const p=FIELDS.get(n);if(!p)throw new Error('Missing EX Hidden Legends '+n);
 const [_,name,kind,t,stage,hp,retreat,weak,resist,from,rarity,moves,printedPower]=p;
 const text=TEXT.get(n)||[],attackText=String(text[1]||'').split('§');
 const card={id:'ex5-'+n,setId:'ex5',number:String(n),name,kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy',source:'tcg',battleFormat:'classic',rarity,
  image:`https://images.pokemontcg.io/ex5/${n}.png`,imageLarge:`https://images.pokemontcg.io/ex5/${n}_hires.png`};
 const missing=[];
 if(kind==='P'){
   const attacks=(moves||'').split(';').filter(Boolean).map((str,i)=>{
     const [move,cost,printed='']=str.split('~'),original=attackText[i]==='-'?'':attackText[i]||'';
     const effect=original?r(n+':'+i):noop;
     if(!fx.supportsEffect(effect))missing.push('Unsupported attack effect: '+move);
     return {name:move,cost,damage:/[×x]/.test(printed)?0:Number((printed.match(/^\d+/)||[])[0]||0),damageText:printed||null,text:original,effect};
   });
   const powerText=String(text[2]||'').split(':').slice(1).join(':');
   const abilities=printedPower?[{name:printedPower,type:ACTIVATE.has(n)?'activated':'passive',oncePerTurn:ACTIVATE.has(n)&&![11].includes(n),
      disabledByStatus:DISABLED_STATUS.has(n),printedPowerType:ACTIVATE.has(n)?'power':'body',text:powerText,effect:r('power:'+n)}]:[];
   if(abilities.some(a=>!fx.supportsEffect(a.effect)))missing.push('Unsupported ability');
   const isEx=EX.has(n);
   Object.assign(card,{stage:stage==='0'?'Basic':'Stage '+stage,types:[T[t]],subtype:T[t],hp:Number(hp),retreat:Number(retreat||0),
     weakness:T[weak]||null,weaknessValue:weak?'×2':null,resistance:T[resist]||null,resistanceValue:resist?'-30':null,
     evolvesFrom:from||null,pokemonEx:isEx,isEx,prizeCards:isEx?2:1,attacks,abilities});
 }else{
   const trainerType=TM.has(n)?'Tool':STADIUM.has(n)?'Stadium':n===92?'Supporter':'Item';
   const attacks=TM.has(n)?(moves||'').split(';').filter(Boolean).map((str,i)=>{const [move,cost,printed='']=str.split('~');return {name:move,cost,damage:Number(printed||0),damageText:printed||null,text:attackText[i]==='-'?'':attackText[i]||'',effect:r(n+':'+i)};}):[];
   Object.assign(card,{trainerType,technicalMachine:TM.has(n),attacks,text:String(text[3]||''),effect:r('trainer:'+n)});
   if(!fx.supportsEffect(card.effect))missing.push('Unsupported Trainer');
 }
 const fullText=(card.attacks||[]).map(a=>a.text).concat((card.abilities||[]).map(a=>a.text),card.text||'').join(' ').toLowerCase();
 const roles=new Set(),inflicts=new Set(),payoffs=new Set(),energyTypes=new Set(),stages=new Set();
 if(/heal|remove .*damage counter/.test(fullText))roles.add('healing');
 if(/draw|search .*deck|put .*into your hand/.test(fullText))roles.add('draw');
 if(/search .*deck/.test(fullText))roles.add('search');
 if(/attach .*energy|energy .*from .*discard|move .*energy|energy cards in.*hand/.test(fullText))roles.add('energy');
 if(/prevent|reduce .*damage|can't retreat|no damage|healing stone/.test(fullText))roles.add('stall');
 if(/discard|switch|can't play|opponent.*hand|confus|poison|sleep|asleep|burn|paraly/.test(fullText))roles.add('disruption');
 if(/damage.*energy|damage counter|damage.*pokémon in play/.test(fullText))roles.add('damage');
 for(const [word,tag] of [['poisoned','poison'],['burned','burn'],['asleep','sleep'],['confused','confusion'],['paralyzed','paralysis']]){
   if(new RegExp('defending pokémon is now '+word).test(fullText))inflicts.add(tag);
 }
 for(const [word,tag] of [['poison','poison'],['burn','burn'],['asleep','sleep'],['confus','confusion']])if(new RegExp('if the defending pokémon (?:is|already has).*'+word).test(fullText))payoffs.add(tag);
 for(const attack of card.attacks||[])for(const sym of String(attack.cost||''))if(sym!=='C'&&T[sym])energyTypes.add(T[sym]);
 if(card.kind==='pokemon'&&card.stage!=='Basic')stages.add(card.stage);
 if(card.kind==='trainer'&&n===92)roles.add('draw');
 if(card.kind==='trainer'&&[87,88,89,91].includes(n))roles.add('stadium');
 if(card.kind==='trainer'&&[84,85,86].includes(n))roles.add('support');
 if(card.kind==='trainer'&&n===90)roles.add('healing');
 card.deckMeta=Object.freeze({roles:[...roles],inflicts:[...inflicts],payoffs:[...payoffs],energyTypes:[...energyTypes],stages:[...stages],synergy:[]});
 return Object.freeze({...card,battleEnabled:missing.length===0,deckEligible:missing.length===0,support:{status:missing.length?'PARTIAL':'FULL',reasons:missing}});
}
const CARDS=Object.freeze(Array.from({length:102},(_,i)=>parse(i+1)));
const MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])})};
});
