/* EX Deoxys (ex8) — original 108-card 2005 Classic TCG expansion.
 * Printed data transcribed from PokemonTCG/pokemon-tcg-data cards/en/ex8.json.
 * Local LuckyDex format: 30-card deck, single Active Pokemon, Energy Zone.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGDeoxys=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ex8',name:'EX Deoxys',series:'EX',releaseDate:'2005-02-01',cardCount:108});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Altaria|P|C|1|70|1|L|F|Swablu|Rare Holo|Double Wing Attack~L~;Dive~WCC~50|Safeguard
2|Beautifly|P|G|2|100|1|R||Silcoon|Rare Holo|Luring Antenna~G~20;Cutting Wind~GCC~50|Hunch
3|Breloom|P|F|1|80|1|P||Shroomish|Rare Holo|Leaf Poison~C~20;Hustle Punch~FCC~70-|
4|Camerupt|P|R|1|90|2|W||Numel|Rare Holo|Back Burner~C~;Split Bomb~RCC~|
5|Claydol|P|F|1|80|1|W||Baltoy|Rare Holo|Ancient Mantra~CC~20+|Psychic Trace
6|Crawdaunt|P|D|1|70|1|G|P|Corphish|Rare Holo|Bubblebeam~CC~20;Cross-Cut~DCC~40+|Dark Protection
7|Dusclops|P|P|1|70|1|D|F|Duskull|Rare Holo|Psychic Removal~P~20;Powerful Hand~PPC~|
8|Gyarados|P|W|1|90|2|L||Magikarp|Rare Holo|Dragon Spark~W~;Full Retaliation~CC~20×;Pulverize~WWCC~50+|
9|Jirachi|P|M|0|60|1|R|G||Rare Holo|Metallic Blow~MC~20+|Wishing Star
10|Ludicolo|P|W|2|100|2|L||Lombre|Rare Holo|Healing Steps~W~30;Circular Steps~WCC~10×|Swing Dance
11|Metagross|P|P|2|100|2|P||Metang|Rare Holo|Link Blast~PC~70|Super Connectivity
12|Mightyena|P|D|1|70||F|P|Poochyena|Rare Holo|Seek Out~C~;Pull Away~CC~30|
13|Ninjask|P|G|1|70||L||Nincada|Rare Holo|Swords Dance~C~;Slash~C~30|Fast Protection
14|Shedinja|P|P|1|50||||Nincada|Rare Holo|Extra Curse~C~|Empty Shell
15|Slaking|P|C|2|120|3|F||Vigoroth|Rare Holo|Amnesia~CC~20;Lazy Headbutt~CCCC~70|Lazy Aura
16|Deoxys|P|P|0|70|1|P|||Rare|Link Blast~PC~40|Form Change
17|Deoxys|P|P|0|70|1|P|||Rare|Energy Crush~PCC~10+|Form Change
18|Deoxys|P|P|0|70|1|P|||Rare|Barrier Attack~PC~20|Form Change
19|Ludicolo|P|W|2|100|2|L||Lombre|Rare|Water Punch~CCC~40+|Happy Dance
20|Magcargo|P|R|1|80|3|W||Slugma|Rare|Knock Over~C~10;Combustion~RCC~50|Smooth Over
21|Pelipper|P|W|1|70|1|L|F|Wingull|Rare|Bay Dance~C~10;Aqua Sonic~WCC~50|
22|Rayquaza|P|C|0|80|1|C|||Rare|Tumbling Attack~CC~20+|Dragon Aura
23|Sableye|P|D|0|60|1||C||Rare|Slash~C~10;Limitation~D~|Night Vision
24|Seaking|P|W|1|70||L||Goldeen|Rare|Triple Breach~W~;Rend~CC~30+|
25|Shiftry|P|G|2|110|1|R||Nuzleaf|Rare|Stadium Power~GCC~50+|Fan Action
26|Skarmory|P|M|0|70|1|L|F||Rare|Spearhead~C~;Heavy Metal~CC~10+|Metallic Lift
27|Tropius|P|G|0|80|1|R|||Rare|Miracle Blow~G~;Stomp~CCCC~40+|Tropical Motion
28|Whiscash|P|F|1|90|2|G||Barboach|Rare|Raging Tremble~C~;Dwindling Wave~FFC~70-|
29|Xatu|P|P|1|70||L|F|Natu|Rare|Dazzle Dance~C~;Psyloop~PC~30+|Mirror Coat
30|Donphan|P|F|1|80|1|G||Phanpy|Uncommon|Spinning Horn~F~;Rock Hurl~FCC~50|
31|Golbat|P|G|1|70||P||Zubat|Uncommon|Spiral Drain~GC~20|Self-control
32|Grumpig|P|P|1|80|1|P||Spoink|Uncommon|Hypnoblast~PC~20;Extra Ball~PCC~50+|Carefree
33|Lombre|P|W|1|70|1|L||Lotad|Uncommon|Ambush~CC~20+|Aqua Lift
34|Lombre|P|W|1|70|1|L||Lotad|Uncommon|Blot~CC~20|Natural Cure
35|Lotad|P|W|0|50|1|L|||Uncommon|Surprise~W~10|
36|Lunatone|P|F|0|60|1|W|||Uncommon|Foresight~C~;Target Beam~FC~20+|Moonglow
37|Magcargo|P|R|1|80|2|W||Slugma|Uncommon|Headbutt~C~20;Burning Ball~RCC~50|
38|Manectric|P|L|1|70|1|F|M|Electrike|Uncommon|Thunder Spear~L~;Magnetic Tackle~CCC~40+|
39|Masquerain|P|G|1|60||L|F|Surskit|Uncommon|Stun Spore~G~20|Intimidating Pattern
40|Metang|P|P|1|80|2|P||Beldum|Uncommon|Psychic Boom~PC~10+;Quick Blow~PCC~40+|
41|Minun|P|L|0|60|1|F|||Uncommon|Sniff Out~C~;Negative Spark~L~|
42|Nosepass|P|F|0|60|1|W|||Uncommon|Sharpen~C~10|Magnetic Reversal
43|Nuzleaf|P|G|1|70|1|R||Seedot|Uncommon|Eerie Light~C~;One-Two Strike~GCC~30+|
44|Plusle|P|L|0|60|1|F|||Uncommon|Call for Family~C~;Positive Spark~L~|
45|Shelgon|P|C|1|80|2|C|R|Bagon|Uncommon|Rock Smash~RW~30+|Hard Protection
46|Silcoon|P|G|1|80|2|R||Wurmple|Uncommon|Ram~C~10;Advanced Armor~GC~|
47|Solrock|P|P|0|70|2|G|||Uncommon|Scorching Light~C~;Reflected Beam~P~|Sunbeam
48|Starmie|P|W|1|70|1|L||Staryu|Uncommon|Energy Flip~W~;Psychic Boom~P~10+|Core Guard
49|Swellow|P|C|1|70||L|F|Taillow|Uncommon|Mid-air Crush~CC~;Nosedive~CC~40|
50|Vigoroth|P|C|1|80|2|F||Slakoth|Uncommon|Scratch~CC~30|Vigorous Aura
51|Weezing|P|G|1|70|1|P||Koffing|Uncommon|Liability~C~;Smogscreen~GC~20|
52|Bagon|P|C|0|50|1|C|R||Common|Singe~R~;Doubleslap~W~10×|
53|Baltoy|P|F|0|50|1|W|||Common|Spinning Attack~C~10;Selfdestruct~FC~40|
54|Barboach|P|W|0|50|1|G|||Common|Amnesia~C~;Tackle~F~10|
55|Beldum|P|P|0|50|1|P|||Common|Flip Over~CC~30|
56|Carvanha|P|D|0|50|1|G|P||Common|Sharp Fin~W~10;Rage~DC~10+|
57|Corphish|P|W|0|40|1|L|||Common|Double Chop~C~10×|Exoskeleton
58|Duskull|P|P|0|40|1|D|F||Common|Paralyzing Gaze~C~;Will-o'-the-wisp~PC~20|
59|Electrike|P|L|0|50|1|F|M||Common|High Voltage~L~;Gnaw~CC~20|
60|Electrike|P|L|0|50|1|F|||Common|Recharge~L~;Quick Attack~CC~10+|
61|Goldeen|P|W|0|50|1|L|||Common|Supersonic~C~;Waterfall~W~10|
62|Koffing|P|G|0|50|1|P|||Common|Smog~G~|
63|Lotad|P|W|0|50|1|L|||Common|Rain Splash~C~10;Aqua Wave~WC~20+|
64|Magikarp|P|W|0|30|1|L|||Common|Leap Out~C~;Rage~WC~10+|
65|Makuhita|P|F|0|50|1|P|||Common|Thrust~C~10;Rising Lunge~FC~20+|
66|Natu|P|P|0|50|1|P|||Common|Razor Wind~C~20|Mirror Coat
67|Nincada|P|G|0|50|1|R|||Common|Dig Under~G~;Scratch~CC~20|
68|Numel|P|R|0|40|1|W|||Common|Ram~C~10|Dense
69|Phanpy|P|F|0|50|1|G|||Common|Corkscrew Punch~F~10;Double Spin~CC~20×|
70|Poochyena|P|D|0|50|1|F|P||Common|Surprise~C~;Sharp Fang~DC~20|
71|Seedot|P|G|0|40|1|R|||Common|Collect~C~;Quick Attack~G~10+|
72|Shroomish|P|G|0|40|1|R|W||Common|Stun Spore~C~;Trip Over~G~10+|
73|Slakoth|P|C|0|40|1|F|||Common|Yawn~C~;Flail~C~10×|
74|Slugma|P|R|0|50|2|W|||Common|Collect~C~;Combustion~R~10|
75|Slugma|P|R|0|50|2|W|||Common|Magma Ring~C~10;Flare~RC~20|
76|Spoink|P|P|0|50|1|P|||Common|Hypnotic Gaze~C~;Flop~CC~20|
77|Staryu|P|W|0|50|1|L|||Common|Rapid Spin~C~10|
78|Surskit|P|G|0|50|1|R|||Common|Agility~G~10|
79|Swablu|P|C|0|40|1|L|F||Common|Peck~C~10|Fluff
80|Taillow|P|C|0|40|1|L|F||Common|Fly~C~10|
81|Wingull|P|W|0|50|1|L|F||Common|Quick Attack~CC~10+|
82|Wurmple|P|G|0|50|1|R|||Common|Ascension~C~;Miracle Essence~G~|
83|Zubat|P|G|0|50|1|P|||Common|Bite~C~10|Self-control
84|Balloon Berry|T||0||||||Uncommon||
85|Crystal Shard|T||0||||||Uncommon||
86|Energy Charge|T||0||||||Uncommon||
87|Lady Outing|T||0||||||Uncommon||
88|Master Ball|T||0||||||Uncommon||
89|Meteor Falls|T||0||||||Uncommon||
90|Professor Cozmo's Discovery|T||0||||||Uncommon||
91|Space Center|T||0||||||Uncommon||
92|Strength Charm|T||0||||||Uncommon||
93|Boost Energy|E||0||||||Uncommon||
94|Heal Energy|E||0||||||Uncommon||
95|Scramble Energy|E||0||||||Uncommon||
96|Crobat ex|P|G|2|130||L|F|Golbat|Rare Holo EX|Cross Attack~CC~20×;Pester~GGC~60+|Distortion
97|Deoxys ex|P|P|0|100|1|P|||Rare Holo EX|Energy Burst~PC~10+|Form Change
98|Deoxys ex|P|P|0|110|2|P|||Rare Holo EX|Psyburst~PCC~50+|Form Change
99|Deoxys ex|P|P|0|90|2|P|||Rare Holo EX|Psychic Shield~PCC~50|Form Change
100|Hariyama ex|P|F|1|110|2|P||Makuhita|Rare Holo EX|Knock Off~FC~40;Pivot Throw~FFC~80|Commanding Aura
101|Manectric ex|P|L|1|100|1|F|M|Electrike|Rare Holo EX|Disconnect~LC~40;Mega Shot~LLC~|
102|Rayquaza ex|P|C|0|100|2|C|W||Rare Holo EX|Spiral Blast~RL~20×|Dragon Boost
103|Salamence ex|P|C|2|160|2|C|R|Shelgon|Rare Holo EX|Flame Jet~RC~;Bright Flame~RWCC~120|Dragon Lift
104|Sharpedo ex|P|D|1|100||G|P|Carvanha|Rare Holo EX|Drag Off~CC~20;Darkness Blast~DDC~60+|
105|Latias ★|P|C|0|80|1|C|P||Rare Holo Star|Healing Light~C~10;Shooting Star~RWP~50+|
106|Latios ★|P|C|0|80|1|C|G||Rare Holo Star|Miraculous Light~C~10;Shining Star~GLP~50+|
107|Rayquaza ★|P|C|0|90|2|C|W||Rare Holo Star|Spiral Rush~RL~30×;Holy Star~RRLL~|
108|Rocket's Raikou ex|P|D|0|100|2|F|||Rare Secret|Thunderous Blow~LCC~40+|Lightning Burst`;
const PRINT=`1|Does 20 damage to each Defending Pokémon.§-|Safeguard:Prevent all effects of attacks, including damage, done to Altaria by your opponent's Pokémon-ex.
2|Before doing damage, you may choose 1 of your opponent's Benched Pokémon and switch it with 1 of the Defending Pokémon. If you do, this attack does 20 damage to the new Defending Pokémon. Your opponent chooses the Defending Pokémon to switch.§-|Hunch:As long as Beautifly's remaining HP is 40 or less, Beautifly does 40 more damage to the Defending Pokémon (before applying Weakness and Resistance).
3|If Breloom has any Grass Energy attached to it, the Defending Pokémon is now Poisoned.§During your next turn, Hustle Punch attack's base damage is 50 instead of 70.|-
4|Search your discard pile for up to 2 basic Energy cards and attach them to your Pokémon in any way you like.§Choose 2 of your opponent's Pokémon. This attack does 30 damage to each of them. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
5|If Claydol has any Psychic Energy attached to it, the Defending Pokémon is now Confused. If Claydol has any Fighting Energy attached to it, this attack does 20 damage plus 20 more damage.|Psychic Trace:Once during your turn (before your attack), if Claydol is your Active Pokémon, you may shuffle your hand into your deck. Then, draw a number of cards equal to the number of cards in your opponent's hand. This power can't be used if Claydol is affected by a Special Condition.
6|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§If the Defending Pokémon is an Evolved Pokémon, this attack does 40 damage plus 20 more damage.|Dark Protection:Any damage done to Crawdaunt by your opponent's attacks is reduced by 10 for each Darkness Energy attached to Crawdaunt (after applying Weakness and Resistance). You can't reduce more than 20 damage in this way.
7|Flip 2 coins. If both of them are heads, discard all Energy attached to the Defending Pokémon.§Count the number of cards in your hand. Put that many damage counters on the Defending Pokémon. You can't put more than 7 damage counters in this way.|-
8|This attack does 10 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§Does 20 damage times the number of damage counters on all of your Magikarp.§If the Defending Pokémon already has at least 2 damage counters on it, this attack does 50 damage plus 50 more damage.|-
9|If the Defending Pokémon has any Poké-Bodies, this attack does 20 damage plus 30 more damage.|Wishing Star:Once during your turn (before your attack), if Jirachi is your Active Pokémon, you may look at the top 5 cards of your deck, choose 1 of them, and put it into your hand. Shuffle your deck afterward. Jirachi and your other Active Pokémon, if any, are now Asleep. This power can't be used if Jirachi is affected by a Special Condition.
10|You may discard as many cards as you like from your hand. If you do, remove that many damage counters from Ludicolo.§Does 10 damage times the number of Pokémon in play (both yours and your opponent's), excluding Ludicolo.|Swing Dance:Once during your turn (before your attack), you may draw a card. This power can't be used if Ludicolo is affected by a Special Condition.
11|If Metagross and the Defending Pokémon have a different amount of Energy attached to them, this attack's base damage is 40 instead of 70.|Super Connectivity:Once during your turn (before your attack), you may search your discard pile for a Psychic or Metal Energy card and attach it to your Active Pokémon. Then, put 1 damage counter on that Pokémon. This power can't be used if Metagross is affected by a Special Condition.
12|Search your deck for 1 card and put it into your hand. Shuffle your deck afterward.§If your opponent has 5 or more cards in his or her hand, your opponent discards a number of cards until your opponent has 4 cards left in his or her hand.|-
13|During your next turn, Ninjask's Slash attack's base damage is 80.§-|Fast Protection:Prevent all effects, including damage, done to Ninjask by your opponent's attacks from his or her Basic Pokémon.
14|Put 2 damage counters on the Defending Pokémon. If the Defending Pokémon is Pokémon-ex, put 4 damage counters instead.|Empty Shell:When Shedinja is Knocked Out, your opponent doesn't take any Prize cards.
15|Choose 1 of the Defending Pokémon's attacks. That Pokémon can't use that attack during your opponent's next turn.§Slaking is now Asleep.|Lazy Aura:As long as Slaking is your Active Pokémon, any damage done by attacks from your opponent's Pokémon-ex is reduced by 30 (before applying Weakness and Resistance).
16|If Deoxys and the Defending Pokémon have a different amount of Energy attached to them, this attack's base damage is 20 instead of 40.|Form Change:Once during your turn (before your attack), you may search your deck for another Deoxys and switch it with Deoxys. (Any cards attached to Deoxys, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) If you do, put Deoxys on top of your deck. Shuffle your deck afterward. You can't use more than 1 Form Change Poké-Power each turn.
17|Does 10 damage plus 10 more damage for each Energy attached to all of your opponent's Pokémon.|Form Change:Once during your turn (before your attack), you may search your deck for another Deoxys and switch it with Deoxys. (Any cards attached to Deoxys, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) If you do, put Deoxys on top of your deck. Shuffle your deck afterward. You can't use more than 1 Form Change Poké-Power each turn.
18|During your opponent's next turn, any damage done to Deoxys by attacks is reduced by 30 (after applying Weakness and Resistance).|Form Change:Once during your turn (before your attack), you may search your deck for another Deoxys and switch it with Deoxys. (Any cards attached to Deoxys, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) If you do, put Deoxys on top of your deck. Shuffle your deck afterward. You can't use more than 1 Form Change Poké-Power each turn.
19|Flip a coin for each Water Energy attached to Ludicolo. This attack does 40 damage plus 20 damage for each heads.|Happy Dance:Once during your turn (before your attack), you may remove 1 damage counter from each of your Pokémon. You can't use more than 1 Happy Dance Poké-Power each turn. This power can't be used if Ludicolo is affected by a Special Condition.
20|You may discard any Stadium card in play.§-|Smooth Over:Once during your turn (before your attack), you may search your deck for a card. Shuffle your deck, then put that card on top of your deck. This power can't be used if Magcargo is affected by a Special Condition.
21|During your next turn, if any of your current Active Pokémon does damage to any Defending Pokémon, the attack does 30 more damage (before applying Weakness and Resistance).§This attack's damage is not affected by Resistance.|-
22|Flip a coin. If heads, this attack does 20 damage plus 20 more damage.|Dragon Aura:As long as Rayquaza has any basic Fire Energy cards and any basic Lightning Energy cards attached to it, prevent all effects, except damage, by an opponent's attack done to Rayquaza.
23|-§Your opponent can't play any Supporter Cards from his or her hand during your opponent's next turn.|Night Vision:Once during your turn (before your attack), if Sableye is your Active Pokémon, you may look at your opponent's hand. This power can't be used if Sableye is affected by a Special Condition.
24|Choose 3 of your opponent's Pokémon. This attack does 10 damage to each of those Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§If the Defending Pokémon already has any damage counters on it, this attack does 30 damage plus 20 more damage.|-
25|If there is any Stadium card in play, this attack does 50 damage plus 20 more damage.|Fan Action:Once during your turn (before your attack), you may switch 1 of the Defending Pokémon with 1 of your opponent's Benched Pokémon. Your opponent chooses the Benched Pokémon to switch. This power can't be used if Shiftry is affected by a Special Condition.
26|Draw a card.§Flip a coin for each Metal Energy attached to Skarmory. This attack does 10 damage plus 20 more damage for each heads.|Metallic Lift:If Skarmory has any Metal Energy attached to it, the Retreat Cost for Skarmory is 0.
27|Flip a coin. If heads, choose 1 Special Condition. The Defending Pokémon is now affected by that Special Condition.§Flip a coin. If heads, this attack does 40 damage plus 20 more damage.|Tropical Motion:As long as Tropius is your Active Pokémon, your opponent's Active Pokémon have no Resistance.
28|Flip a coin. If heads, this attack does 10 damage for each damage counter on Whiscash to each Defending Pokémon. If tails, this attack does 10 damage for each damage counter on Whiscash to the Defending Pokémon.§Does 70 damage minus 10 damage for each damage counter on Whiscash.|-
29|Each Defending Pokémon is now Confused.§Does 30 damage plus 30 more damage for each Trainer card your opponent has in play.|Mirror Coat:If Xatu is Burned or Poisoned by an opponent's attack (even if Xatu is Knocked Out), the Attacking Pokémon is now affected by the same Special Conditions (1 if there is only 1).
30|Does 10 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§This attack's damage is not affected by Resistance.|-
31|Remove 1 damage counter from Golbat.|Self-control:Golbat can't be Paralyzed.
32|The Defending Pokémon is now Asleep.§If the Defending Pokémon is Pokémon-ex, this attack does 50 damage plus 30 more damage.|Carefree:Grumpig can't be Confused.
33|Flip a coin. If heads, this attack does 20 damage plus 20 more damage.|Aqua Lift:If Lombre has any Water Energy attached to it, the Retreat Cost for Lombre is 0.
34|Remove 2 damage counters from Lombre.|Natural Cure:When you attach a Water Energy card from your hand to Lombre, remove all Special Conditions from Lombre.
35|Choose 1 card from your opponent's hand without looking. Look at the card you chose, then have your opponent shuffle that card into his or her deck.|-
36|Look at the top 5 cards of either player's deck and put them back on top of that player's deck in any order.§Does 20 damage plus 10 more damage for each Solrock you have in play.|Moonglow:The Retreat Cost for each Solrock you have in play is 0.
37|-§If Magcargo has at least 2 Fire Energy attached to it, the Defending Pokémon is now Burned.|-
38|Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§You may do 40 damage plus 10 more damage for each Lightning Energy attached to Manectric. If you do, Manectric does 10 damage to itself.|-
39|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|Intimidating Pattern:As long as Masquerain is your Active Pokémon, any damage done by an opponent's attack is reduced by 20 (before applying Weakness and Resistance). You can't use more than 1 Intimidating Pattern Poké-Body each turn.
40|Does 10 damage plus 10 more damage for each Energy attached to the Defending Pokémon.§Flip a coin. If heads, this attack does 40 damage plus 20 more damage.|-
41|Put any 1 card from your discard pile into your hand.§Does 20 damage to each of your opponent's Pokémon that has any Poké-Bodies. Don't apply Weakness and Resistance.|-
42|-|Magnetic Reversal:Once during your turn (before your attack), if Nosepass is your Active Pokémon, you may flip a coin. If heads, switch 1 of your opponent's Benched Pokémon with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch. This power can't be used if Nosepass is affected by a Special Condition.
43|The Defending Pokémon is now Confused.§Flip 2 coins. This attack does 30 damage plus 20 more damage for each heads.|-
44|Search your deck for up to 2 Basic Pokémon and put them onto your Bench. Shuffle your deck afterward.§Does 20 damage to each of your opponent's Pokémon that has any Poké-Powers. Don't apply Weakness and Resistance.|-
45|Flip a coin. If heads, this attack does 30 damage plus 10 more damage.|Hard Protection:Prevent all damage done to Shelgon by attacks from your Pokémon.
46|-§During your opponent's next turn, prevent all effects of attacks, including damage, done to Silcoon by your opponent's Evolved Pokémon.|-
47|Flip a coin. If heads, the Defending Pokémon is now Paralyzed. If tails, the Defending Pokémon is now Burned.§Choose 1 of your opponent's Benched Pokémon. This attack does 10 damage to that Pokémon for each Lunatone you have in play. (Don't apply Weakness and Resistance for Benched Pokémon.)|Sunbeam:The maximum HP for each Lunatone you have in play is now 80.
48|Choose 1 of your opponent's Benched Pokémon. This attack does 10 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) You may move an Energy attached to that Pokémon to another of your opponent's Pokémon.§Does 10 damage plus 10 more damage for each Energy attached to the Defending Pokémon.|Core Guard:As long as Starmie has any Psychic Energy attached to it, damage done to Starmie by attacks is reduced by 10 (after applying Weakness and Resistance).
49|Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) Flip a coin. If heads, your opponent discards 1 Energy card, if any, attached to that Pokémon.§Flip a coin. If tails, Swellow does 10 damage to itself.|-
50|-|Vigorous Aura:As long as Vigoroth is your Active Pokémon, attacks by each player's Active Pokémon (both if there are 2) do 10 more damage to any Active Pokémon (before applying Weakness and Resistance).
51|Put damage counters on the Defending Pokémon until it is 10 HP away from being Knocked Out. Weezing does 70 damage to itself.§The Defending Pokémon is now Poisoned. If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, that attack does nothing.|-
52|Flip a coin. If heads, the Defending Pokémon is now Burned.§Flip 2 coins. This attack does 10 damage times the number of heads.|-
53|-§Does 10 damage to each Benched Pokémon (both yours and your opponent's). (Don't apply Weakness and Resistance for Benched Pokémon.) Baltoy does 50 damage to itself.|-
54|Choose 1 of the Defending Pokémon's attacks. That Pokémon can't use that attack during your opponent's next turn.§-|-
55|Beldum does 10 damage to itself, and don't apply Weakness and Resistance to this damage.|-
56|-§Does 10 damage plus 10 more damage for each damage counter on Carvanha.|-
57|Flip 2 coins. This attack does 10 damage times the number of heads.|Exoskeleton:Any damage done to Corphish by attacks is reduced by 10 (after applying Weakness and Resistance).
58|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§-|-
59|Flip a coin. If heads, your opponent can't play Trainer cards from his or her hand during his or her next turn.§-|-
60|Search your deck for a Lightning Energy card and attach it to Electrike. Shuffle your deck afterward.§Flip a coin. If heads, this attack does 10 damage plus 20 more damage.|-
61|Flip a coin. If heads, the Defending Pokémon is now Confused.§-|-
62|The Defending Pokémon is now Poisoned.|-
63|-§Flip a coin. If heads, this attack does 20 damage plus 10 more damage.|-
64|Switch Magikarp with 1 of your Benched Pokémon.§Does 10 damage plus 10 more damage for each damage counter on Magikarp.|-
65|Flip a coin. If tails, this attack does nothing. If heads, discard 1 Energy card attached to the Defending Pokémon.§Flip a coin. If heads, this attack does 20 damage plus 10 more damage.|-
66|Flip a coin. If tails, this attack does nothing.|Mirror Coat:If Natu is Burned or Poisoned by an opponent's attack (even if Natu is Knocked Out), the Attacking Pokémon is now affected by the same Special Conditions (1 if there is only 1).
67|Choose 1 of your opponent's Pokémon. This attack does 10 damage to that Pokémon. This attack's damage isn't affected by Weakness or Resistance.§-|-
68|-|Dense:Any damage done to Numel by attacks from Evolved Pokémon (both yours and your opponent's) is reduced by 20 (after applying Weakness and Resistance).
69|-§Flip 2 coins. This attack does 20 damage times the number of heads.|-
70|Choose 1 card from your opponent's hand without looking. Look at the card you chose, then have your opponent shuffle that card into his or her deck.§-|-
71|Draw a card.§Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|-
72|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|-
73|The Defending Pokémon is now Asleep.§Does 10 damage times the number of damage counters on Slakoth.|-
74|Draw a card.§-|-
75|The Defending Pokémon can't retreat during your opponent's next turn.§-|-
76|The Defending Pokémon is now Asleep.§-|-
77|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon, if any. You switch Staryu with 1 of your Benched Pokémon, if any.|-
78|Flip a coin. If heads, prevent all effects of an attack, including damage, done to Surskit during your opponent's next turn.|-
79|-|Fluff:Whenever Swablu would be damaged or affected by an opponent's attack and already has at least 1 damage counter on it, flip a coin. If heads, prevent all effects of that attack, including damage, done to Swablu.
80|Flip a coin. If tails, this attack does nothing. If heads, prevent all effects of an attack, including damage, done to Taillow during your opponent's next turn.|-
81|Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|-
82|Search your deck for a card that evolves from Wurmple and put it on Wurmple. (This counts as evolving Wurmple.) Shuffle your deck afterward.§Flip a coin. If heads, choose 1 Special Condition. Each Defending Pokémon is now affected by that Special Condition.|-
83|-|Self-control:Zubat can't be Paralyzed.
84|-|-|Attach Balloon Berry to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § As long as Balloon Berry is attached to a Pokémon, that Pokémon's Retreat Cost is 0. When this Pokémon retreats, discard Balloon Berry.
85|-|-|Attach Crystal Shard to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § As long as this card is attached to a Pokémon, that Pokémon's type is Colorless. If that Pokémon attacks, discard this card at the end of the turn.
86|-|-|Flip a coin. If heads, search your discard pile for 2 Energy cards (1 if there is only 1), show them to your opponent, and shuffle them into your deck.
87|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Search your deck for up to 3 different types of basic Energy cards, show them to your opponent, and put them into your hand. Shuffle your deck afterward.
88|-|-|Look at the top 7 cards from your deck. Choose a Basic Pokémon or Evolution card from those cards, show it to your opponent, and put it into your hand. Put the other 6 cards back on top of your deck. Shuffle your deck afterward.
89|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Each player's Active Evolved Pokémon (excluding Pokémon-ex) can use any attack from its Basic Pokémon or its Stage 1 Evolution card. (You still have to pay for that attack's Energy cost.)
90|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Flip a coin. If heads, draw the bottom 3 cards of your deck. If tails, draw the top 2 cards of your deck.
91|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Ignore Poké-Bodies for all Basic Pokémon in play (both yours and your opponent's) (excluding Pokémon-ex and Pokémon that has an owner in its name).
92|-|-|Attach Strength Charm to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § Whenever an attack from the Pokémon that Strength Charm is attached to does damage to the Active Pokémon, the attack does 10 more damage (before applying Weakness and Resistance). Discard Strength Charm at the end of the turn in which this Pokémon attacks.
93|-|-|Boost Energy can be attached only to an Evolved Pokémon. Discard Boost Energy at the end of the turn it was attached. Boost Energy provides ColorlessColorlessColorless Energy. The Pokémon Boost Energy is attached to can't retreat. If the Pokémon Boost Energy is attached to isn't an Evolved Pokémon, discard Boost Energy.
94|-|-|Heal Energy provides Colorless Energy. When you attach this card from your hand to 1 of your Pokémon, remove 1 damage counter and all Special Conditions from that Pokémon. If Heal Energy is attached to Pokémon-ex, Heal Energy has no effect other than providing Energy.
95|-|-|Scramble Energy can be attached only to an Evolved Pokémon (excluding Pokémon-ex). Scramble Energy provides Colorless Energy. While in play, if you have more Prize cards left than your opponent, Scramble Energy provides every type of Energy but provides only 3 in any combination at a time. If the Pokémon Scramble Energy is attached to isn't an Evolved Pokémon (or evolves into Pokémon-ex), discard Scramble Energy.
96|Flip 4 coins. This attack does 20 damage times the number of heads. If you get 2 or more heads, the Defending Pokémon is now Confused.§If the Defending Pokémon is affected by a Special Condition, this attack does 60 damage plus 40 more damage.|Distortion:Once during your turn (before your attack), if Crobat ex is your Active Pokémon, you may put 1 damage counter on 1 of your opponent's Pokémon. This power can't be used if Crobat ex is affected by a Special Condition.
97|Does 10 damage plus 10 more damage for each Energy attached to Deoxys ex and the Defending Pokémon.|Form Change:Once during your turn (before your attack), you may search your deck for another Deoxys ex and switch it with Deoxys ex. (Any cards attached to Deoxys ex, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) If you do, put Deoxys ex on top of your deck. Shuffle your deck afterward. You can't use more than 1 Form Change Poké-Power each turn.
98|You may discard 2 Energy attached to Deoxys ex. If you do, this attack does 50 damage plus 20 more damage for each Energy attached to the Defending Pokémon.|Form Change:Once during your turn (before your attack), you may search your deck for another Deoxys ex and switch it with Deoxys ex. (Any cards attached to Deoxys ex, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) If you do, put Deoxys ex on top of your deck. Shuffle your deck afterward. You can't use more than 1 Form Change Poké-Power each turn.
99|Prevent all effects of attacks, including damage, done to Deoxys ex by your opponent's Pokémon-ex during your opponent's next turn.|Form Change:Once during your turn (before your attack), you may search your deck for another Deoxys ex and switch it with Deoxys ex. (Any cards attached to Deoxys ex, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) If you do, put Deoxys ex on top of your deck. Shuffle your deck afterward. You can't use more than 1 Form Change Poké-Power each turn.
100|Choose 1 card from your opponent's hand without looking and discard it.§During your opponent's next turn, any damage done to Hariyama ex by attacks is increased by 10 (before applying Weakness and Resistance).|Commanding Aura:As long as Hariyama ex is your Active Pokémon, your opponent can't play any Stadium cards from his or her hand.
101|Your opponent can't play any Trainer cards (except for Supporter cards) from his or her hand during your opponent's next turn.§Discard all Lightning Energy attached to Manectric ex and then choose 1 of your opponent's Pokémon. This attack does 80 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
102|Does 20 damage for each basic Energy card attached to Rayquaza ex.|Dragon Boost:Once during your turn, when you put Rayquaza ex from your hand onto your Bench, you may move any number of basic Energy cards attached to your Pokémon to Rayquaza ex.
103|Choose 1 of your opponent's Pokémon. This attack does 40 damage to that Pokémon. This attack's damage isn't affected by Weakness or Resistance.§Discard 2 Energy attached to Salamence ex.|Dragon Lift:The Retreat Cost for each of your Pokémon (excluding Pokémon-ex and Baby Pokémon) is 0.
104|Before doing damage, you may switch 1 of your opponent's Benched Pokémon with the Defending Pokémon. If you do, this attack does 20 damage to the new Defending Pokémon. Your opponent chooses the Defending Pokémon to switch.§You may discard a Darkness Energy attached to Sharpedo ex. If you do, this attack does 60 damage plus 20 more damage and discard 1 Energy card attached to the Defending Pokémon.|-
105|Remove 1 damage counter from each of your Pokémon (including Latias Star).§If the Defending Pokémon is Pokémon-ex, discard all Energy cards attached to Latias Star and this attack does 50 damage plus 100 more damage.|-
106|Remove 1 damage counter and all Special Conditions from Latios Star.§If the Defending Pokémon is a Stage 2 Evolved Pokémon, discard all Energy cards attached to Latios Star and this attack does 50 damage plus 100 more damage.|-
107|Flip a coin until you get tails. This attack does 30 damage times the number of heads.§Discard all Energy cards attached to Rayquaza Star. This attack does 100 damage to each of your opponent's Pokémon-ex. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
108|Does 40 damage plus 10 more damage for each Lightning Energy attached to Rocket's Raikou ex.|Lightning Burst:Whenever you attach a Darkness Energy card from your hand to Rocket's Raikou ex, you may choose 1 of the Defending Pokémon and switch it with 1 of your opponent's Benched Pokémon. Your opponent chooses the Benched Pokémon to switch. This power can't be used if Rocket's Raikou ex is affected by a Special Condition.`;
const FIELDS=new Map(RAW.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const TEXT=new Map(PRINT.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const noop={type:'noop'},r=name=>({type:'neoRule',rule:'ex8:'+name});
const EX=new Set([96,97,98,99,100,101,102,103,104,108]);
const ACTIVATED=new Set([5,9,10,11,16,17,18,19,20,23,25,42,96,97,98,99]);
const TOOL=new Set([84,85,92]),STADIUM=new Set([89,91]),SUPPORTER=new Set([87,90]);
const ENERGY=[93,94,95], STAR=new Set([105,106,107]);
function parse(n){
 const f=FIELDS.get(n),v=TEXT.get(n)||[];
 if(!f)throw new Error('Missing EX Deoxys card '+n);
 const [_,name,kind,types,stage,hp,retreat,weak,resist,from,rarity,moves,powerName]=f;
 const attackPrint=String(v[1]||'').split('§');
 const card={id:'ex8-'+n,setId:'ex8',number:String(n),name,kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy',source:'tcg',battleFormat:'classic',rarity,
  image:`https://images.pokemontcg.io/ex8/${n}.png`,imageLarge:`https://images.pokemontcg.io/ex8/${n}_hires.png`};
 const missing=[];
 if(kind==='P'){
  const attacks=(moves||'').split(';').filter(Boolean).map((record,i)=>{
   const [title,cost,printed='']=record.split('~'),text=attackPrint[i]==='-'?'':attackPrint[i]||'';
   const effect=text?r(n+':'+i):noop;
   if(!fx.supportsEffect(effect))missing.push('Unsupported attack: '+title);
   return {name:title,cost,damage:Number((printed.match(/^\d+/)||[])[0]||0),damageText:printed||null,text,effect};
  });
  const powerText=String(v[2]||'').split(':').slice(1).join(':');
  const abilities=powerName?[{name:powerName,type:ACTIVATED.has(n)?'activated':'passive',oncePerTurn:ACTIVATED.has(n)&&n!==25,
   disabledByStatus:ACTIVATED.has(n),activeOnly:[9,23,42,96].includes(n),benchOnly:false,printedPowerType:ACTIVATED.has(n)?'power':'body',text:powerText,effect:r('power:'+n)}]:[];
  if(abilities.some(a=>!fx.supportsEffect(a.effect)))missing.push('Unsupported ability');
  const isEx=EX.has(n),isStar=STAR.has(n);
  if(isStar)card.pokemonStar=true;
  if(n===14)card.noPrize=true; // Shedinja Empty Shell (also works in prize-mode Classic)
  Object.assign(card,{stage:stage==='0'?'Basic':'Stage '+stage,types:types.split('').map(k=>T[k]),subtype:T[types[0]],hp:Number(hp),retreat:Number(retreat||0),
    weakness:T[weak]||null,weaknessValue:weak?'×2':null,resistance:T[resist]||null,resistanceValue:resist?'-30':null,
    evolvesFrom:from||null,pokemonEx:isEx,isEx,prizeCards:isEx?2:1,attacks,abilities});
 }else if(kind==='E'){
   const text=String(v[3]||'');Object.assign(card,{subtype:'Colorless',types:['Colorless'],specialEnergy:true,basicEnergy:false,
    effect:{type:'specialEnergy',provides:n===93?{Colorless:3}:n===94?{Colorless:1}:{Colorless:1}},text});
 }else{
   const trainerType=TOOL.has(n)?'Tool':STADIUM.has(n)?'Stadium':SUPPORTER.has(n)?'Supporter':'Item';
   Object.assign(card,{trainerType,attacks:[],text:String(v[3]||''),effect:r('trainer:'+n)});
   if(!fx.supportsEffect(card.effect))missing.push('Unsupported Trainer');
 }
 const description=[...(card.attacks||[]).map(x=>x.text),...(card.abilities||[]).map(x=>x.text),card.text||''].join(' ').toLowerCase();
 const roles=new Set(),inflicts=new Set(),payoffs=new Set(),energyTypes=new Set(),stages=new Set();
 // Infer offensive conditions from attack text, not defensive Powers or
 // self-inflicted status. Otherwise immunity cards were falsely being used as
 // Poison/Sleep/Paralysis attackers by the themed deck builder.
 for(const attack of card.attacks||[]){
  const printed=String(attack.text||'').toLowerCase();
  if(/(?:the|each) defending pok[eé]mon is now affected by that special condition/.test(printed)&&/choose 1 special condition/.test(printed)){
   for(const tag of ['poison','burn','sleep','confusion','paralysis'])inflicts.add(tag);
  }
  for(const [printedName,tag] of [['poisoned','poison'],['burned','burn'],['asleep','sleep'],['confused','confusion'],['paralyzed','paralysis']]){
   if(new RegExp('(?:the|each) defending pok[eé]mon is now '+printedName).test(printed))inflicts.add(tag);
   if(new RegExp('(?:if|when|whenever) (?:the )?defending pok[eé]mon[^.]{0,70}(?:is|has) (?:already )?'+printedName).test(printed))payoffs.add(tag);
  }
  if(/if the defending pok[eé]mon is affected by a special condition/.test(printed))
   for(const tag of ['poison','burn','sleep','confusion','paralysis'])payoffs.add(tag);
 }
 if(/remove (?:all )?\d* damage counters|heal|remove all special conditions/.test(description))roles.add('healing');
 if(/search your deck|put .* into your hand/.test(description))roles.add('search');
 if(/draw (?:\d+|a) card/.test(description))roles.add('draw');
 if(/discard .*energy|recover .*energy|attach .*energy/.test(description))roles.add('energy');
 if(/can't (?:retreat|play)|prevent all effects|damage.*reduced|no weakness/.test(description))roles.add('stall');
 if(/opponent's hand|opponent's deck/.test(description))roles.add('disruption');
 if([16,17,18,97,98,99].includes(n))roles.add('deoxys-form-change');
 if([93,94,95].includes(n))roles.add('energy');
 if(STADIUM.has(n))roles.add('stadium');
 if(isNaN(Number(stage))===false&&Number(stage)>0)stages.add('Stage '+stage);
 for(const attack of card.attacks||[])for(const symbol of String(attack.cost||''))if(symbol!=='C'&&T[symbol])energyTypes.add(T[symbol]);
 if(card.kind==='pokemon'&&STAR.has(n))roles.add('pokemon-star');
 if(card.kind==='trainer'&&TOOL.has(n))roles.add('tool');
 if(card.kind==='trainer'&&[84,85,92].includes(n))roles.add('support');
 if(card.kind==='trainer'&&n===86){roles.add('recovery');roles.add('energy');}
 if(card.kind==='trainer'&&n===87)roles.add('energy');
 if(card.kind==='trainer'&&n===88)roles.add('search');
 if(card.kind==='trainer'&&n===90)roles.add('draw');
 if(card.kind==='trainer'&&n===89){roles.add('evolution-synergy');roles.delete('draw');}
 if(card.kind==='trainer'&&n===91)roles.add('body-suppression');
 const requiredStages=n===93||n===95?['Stage 1','Stage 2']:[];
 card.deckMeta=Object.freeze({roles:[...roles],inflicts:[...inflicts],payoffs:[...payoffs],energyTypes:[...energyTypes],stages:[...stages],
   requiredStages,preferredEnergyTypes:[],synergy:[...roles].filter(x=>['deoxys-form-change','evolution-synergy','stall','healing'].includes(x))});
 return Object.freeze({...card,battleEnabled:missing.length===0,deckEligible:missing.length===0,support:{status:missing.length?'PARTIAL':'FULL',reasons:missing}});
}
const CARDS=Object.freeze(Array.from({length:108},(_,i)=>parse(i+1)));
const MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])})};
});
