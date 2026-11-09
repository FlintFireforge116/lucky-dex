/* EX Dragon (ex3) — full original 100-card card list (97 numbered + 3 secret).
 * Data source: PokemonTCG/pokemon-tcg-data cards/en/ex3.json. Original printed
 * attack text is retained; effects are resolved under LuckyDex Classic rules.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGDragon=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ex3',name:'EX Dragon',series:'EX',releaseDate:'2003-11-24',cardCount:100});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Absol|P|D|0|70|1|F|P||Rare Holo|Bad News~D~;Prize Count~DC~20+|
2|Altaria|P|C|1|80|1|C|G|Swablu|Rare Holo|Dragon Dance~C~;Dragon Song~WL~30|
3|Crawdaunt|P|W|1|80|2|L||Corphish|Rare Holo|Guillotine~WCC~50|Power Pinchers
4|Flygon|P|C|2|120|2|C|R|Vibrava|Rare Holo|Energy Shower~GL~;Rainbow Burn~CCC~30+|
5|Golem|P|F|2|120|4|W||Graveler|Rare Holo|Rock Vengeance~FCC~20+;Rock Slide~FFCCC~60|
6|Grumpig|P|P|1|80|1|P||Spoink|Rare Holo|Psychic Boom~PC~20+;Mind Trip~PCC~50|
7|Minun|P|L|0|50|1|F|M||Rare Holo|Cheer On~C~;Special Circuit~LC~|Chain of Events
8|Plusle|P|L|0|50|1|F|M||Rare Holo|Cheer On~C~;Extra Circuit~LC~|Chain of Events
9|Roselia|P|G|0|60|1|R|||Rare Holo|Speed Growth~C~;Sleep Powder~G~10|Thick Skin
10|Salamence|P|C|2|120|2|C|F|Shelgon|Rare Holo|Agility~CC~20;Dragon Claw~RWCC~60|Dragon Wind
11|Shedinja|P|G|1|30|1|||Nincada|Rare Holo|Damage Curse~C~|Wonder Guard
12|Torkoal|P|R|0|80|3|W|||Rare Holo|Power Generation~C~;Scorching Smoke~R~|
13|Crawdaunt|P|W|1|80|1|L||Corphish|Rare|Poison Claws~W~10;Rend~CCC~30+|
14|Dragonair|P|C|1|70|2|C|G|Dratini|Rare|Dazzle Blast~LC~20;Healing Wave~WCC~30|
15|Flygon|P|C|2|100|2|||Vibrava|Rare|Air Slash~GLC~60|Sand Guard
16|Girafarig|P|P|0|70|1|P|||Rare|Synchronized Search~C~;Breaking Impact~PC~|
17|Magneton|P|L|1|70|1|F|M|Magnemite|Rare|Magnetic Force~LC~10×|Magnetic Field
18|Ninjask|P|G|1|70||R||Nincada|Rare|Quick Touch~CC~30|Loose Shell
19|Salamence|P|C|2|100|2|||Shelgon|Rare|Dragon Flame~RWC~40+|Intimidating Fang
20|Shelgon|P|C|1|80|2|C|F|Bagon|Rare|Scrunch~C~;Rolling Attack~RWC~50|
21|Skarmory|P|M|0|70|1|R|G||Rare|Pick On~M~;Power Count~MC~20+|
22|Vibrava|P|C|1|80|1|C|R|Trapinch|Rare|Quick Charge~C~;Dragon Spark~GL~|
23|Bagon|P|C|0|50|1|C|F||Uncommon|Paralyzing Gaze~W~;Combustion~RC~20|
24|Camerupt|P|R|1|80|2|W||Numel|Uncommon|Super Singe~RC~20;Ram~RCC~50|
25|Combusken|P|R|1|70|1|W||Torchic|Uncommon|Quick Attack~CC~10+;Combustion~RCC~40|
26|Dratini|P|C|0|50|1|C|G||Uncommon|Dragon Dew~W~;Tail Slap~L~10|
27|Flaaffy|P|L|1|80|1|F|M|Mareep|Uncommon|Energy Recall~L~;Lightning Ball~LC~30|
28|Forretress|P|M|1|80|2|R|G|Pineco|Uncommon|Double Metal Ball~MC~;Backspin~CCC~40|
29|Graveler|P|F|1|80|3|W||Geodude|Uncommon|Grind~C~10×;Big Explosion~FFCC~|
30|Graveler|P|F|1|80|3|W||Geodude|Uncommon|Magnitude~FC~20;Rollout~FCC~40|
31|Grovyle|P|G|1|70|1|R|W|Treecko|Uncommon|Fury Cutter~GC~10+|
32|Gyarados|P|W|1|100|2|L||Magikarp|Uncommon|Dragon Crush~W~;Aqua Sonic~WCCCC~80|
33|Horsea|P|W|0|40|1|L|||Uncommon|Retaliate~C~10×;Smokescreen~W~10|
34|Houndoom|P|D|1|70|1|F|P|Houndour|Uncommon|Feint Attack~DC~;Flamethrower~FCC~50|
35|Magneton|P|L|1|80|1|F||Magnemite|Uncommon|Ram~CC~20;Triple Smash~LCC~20+|
36|Marshtomp|P|W|1|80|1|L||Mudkip|Uncommon|Mud Splash~WC~20|
37|Meditite|P|F|0|50|1|P|||Uncommon|Punch~C~10;Meditate~FC~10+|
38|Ninjask|P|G|1|70||R||Nincada|Uncommon|Supersonic~C~10;Sonic Wing~GC~30|
39|Seadra|P|W|1|70|1|L||Horsea|Uncommon|Energy Cannon~W~20+;Water Arrow~WCC~|
40|Seadra|P|W|1|70|1|L||Horsea|Uncommon|Agility~CC~20;Waterfall~WCC~40|
41|Shelgon|P|C|1|70|2|||Bagon|Uncommon|Rollout~CC~20|Energy Guard
42|Shelgon|P|C|1|70|2|||Bagon|Uncommon|Granite Head~WC~20;Flare~RCC~40|
43|Shuppet|P|P|0|50|1|D|F||Uncommon|Hypnosis~C~;Night Attack~P~|
44|Snorunt|P|W|0|50|1|M|||Uncommon|Powder Snow~W~10|
45|Swellow|P|C|1|70||L|F|Taillow|Uncommon|Clutch~C~10;Quick Dive~CC~|
46|Vibrava|P|C|1|70|1|||Trapinch|Uncommon|Razor Wing~CC~20|Levitate
47|Vibrava|P|C|1|70|1|||Trapinch|Uncommon|Dive~GC~20;Quick Turn~LCC~40×|
48|Whiscash|P|W|1|90|2|G||Barboach|Uncommon|Surf~WC~30;Magnitude~FCCC~60|Submerge
49|Bagon|P|C|0|40|1||||Common|Headbutt~C~10;Flare~RC~20|
50|Bagon|P|C|0|50|1||||Common|Risky Kick~C~10;Dragon Eye~RW~20|
51|Barboach|P|W|0|50|1|G|||Common|Splash~C~10;Mud Slap~FC~20|
52|Corphish|P|W|0|40|1|L|||Common|Poison Claws~C~;Bubble~W~10|
53|Corphish|P|W|0|50|1|L|||Common|Irongrip~C~10;Slash~WC~20|
54|Corphish|P|W|0|50|1|L|||Common|Beat~W~10;Toxic Grip~CC~|
55|Geodude|P|F|0|50|1|W|||Common|Light Punch~C~10;Pebble Throw~F~|
56|Geodude|P|F|0|40|1|W|||Common|Steady Punch~F~10+|
57|Grimer|P|G|0|50|1|P|||Common|Pound~C~10;Poison Spurt~G~|
58|Horsea|P|W|0|50|1|L|||Common|Paralyzing Gaze~C~;Wave Splash~CC~20|
59|Houndour|P|D|0|50|1|F|P||Common|Roar~C~;Bite~CC~20|
60|Magikarp|P|W|0|30|1|L|||Common|Call for Family~C~;Tackle~WC~20|
61|Magnemite|P|L|0|40|1|F|M||Common|Rollout~C~10;Hook~CC~20|
62|Magnemite|P|L|0|50|1|F|M||Common|Random Spark~L~|
63|Magnemite|P|L|0|50|1|F|||Common|Thundershock~L~10|
64|Mareep|P|L|0|50|1|F|M||Common|Jolt~C~|
65|Mudkip|P|W|0|50|1|L|||Common|Water Gun~C~10+|
66|Nincada|P|G|0|40|1|R|||Common|Poison Breath~G~10|
67|Nincada|P|G|0|50|1|R|||Common|Bite~C~10;Double Scratch~GC~20×|
68|Nincada|P|G|0|50|1|R|||Common|Leech Life~G~10|
69|Numel|P|R|0|40|1|W|||Common|Firebreathing~R~10+;Tackle~CC~20|
70|Numel|P|R|0|50|2|W|||Common|Rollout~C~10;Kindle~R~10|
71|Pineco|P|G|0|40|1|R|||Common|Tackle~GC~20|Exoskeleton
72|Slugma|P|R|0|50|2|W|||Common|Ram~C~10;Luring Flame~RC~|
73|Spoink|P|P|0|50|1|P|||Common|Bounce~C~10|
74|Spoink|P|P|0|50|1|P|||Common|Hop~C~10;Psybeam~PC~10|
75|Swablu|P|C|0|40|1|L|F||Common|Lullaby~W~10;Stifling Fluff~L~10|
76|Taillow|P|C|0|50|1|L|F||Common|Whirlwind~C~|
77|Torchic|P|R|0|50|1|W|||Common|Firebreathing~RC~20+|
78|Trapinch|P|F|0|50|1|G|||Common|Dig~C~10|
79|Trapinch|P|F|0|50|1|G|||Common|Bind~C~;Rock Smash~CC~10+|
80|Treecko|P|G|0|50|1|R|W||Common|Quick Attack~CC~10+|
81|Wurmple|P|G|0|50|1|R|||Common|Call for Friends~C~;String Shot~C~10|
82|Balloon Berry|T||0||||||Uncommon||
83|Buffer Piece|T||0||||||Uncommon||
84|Energy Recycle System|T||0||||||Uncommon||
85|High Pressure System|T||0||||||Uncommon||
86|Low Pressure System|T||0||||||Uncommon||
87|Mr. Briney's Compassion|T||0||||||Uncommon||
88|TV Reporter|T||0||||||Uncommon||
89|Ampharos ex|P|L|2|150|3|F|M|Flaaffy|Rare Holo EX|Gigavolt~LCC~40+|Conductivity
90|Dragonite ex|P|C|2|150|2|C|G|Dragonair|Rare Holo EX|Dragon Wave~WL~70;Giant Tail~CCCC~120|Call for Power
91|Golem ex|P|F|2|160|5|G||Graveler|Rare Holo EX|Magnitude~FCC~60;Double-edge~FFCCC~120|
92|Kingdra ex|P|W|2|150|3|G||Seadra|Rare Holo EX|Genetic Memory~W~;Hydrocannon~CCC~50+|
93|Latias ex|P|C|0|90|2|C|F||Rare Holo EX|Hypnoblast~C~10;Mist Ball~RWC~100|
94|Latios ex|P|C|0|100|2|C|G||Rare Holo EX|Energy Stream~C~10;Luster Purge~GLC~100|
95|Magcargo ex|P|R|1|100|3|W||Slugma|Rare Holo EX|Melting Mountain~R~20;Lava Flow~RRC~40+|
96|Muk ex|P|G|1|100|2|P||Grimer|Rare Holo EX|Poison Breath~G~10;Slimy Water~GGC~40+|Toxic Gas
97|Rayquaza ex|P|C|0|100|2|C|F||Rare Holo EX|Spiral Growth~C~;Dragon Burst~RL~40×|
98|Charmander|P|R|0|50|1|W|||Rare Secret|Flare~R~10;Rage~CC~10+|
99|Charmeleon|P|R|1|70|1|W||Charmander|Rare Secret|Smokescreen~R~10;Fireworks~RC~40|
100|Charizard|P|R|2|120|2|W||Charmeleon|Rare Secret|Collect Fire~RC~30;Flame Pillar~RCCC~60|`;
const PRINT=`1|If the number of cards in your opponent's hand is at least 6, choose a number of cards there, without looking, until your opponent has 5 cards left. Have your opponent discard the cards you chose.§If you have more Prize cards left than your opponent, this attack does 20 damage plus 20 more damage.|-
2|During your next turn, if any of your current Active Pokémon does damage to any Defending Pokémon, this attack does 40 more damage (before applying Weakness and Resistance).§Each Defending Pokémon is now Asleep.|-
3|-|Power Pinchers:As long as Crawdaunt is your Active Pokémon, when any of your Active Pokémon does damage to the Defending Pokémon, the attack does 10 more damage (before applying Weakness and Resistance).
4|Attach any number of basic Energy cards from your hand to your Pokémon in any way you like.§Does 30 damage plus 10 more damage for each type of basic Energy card attached to Flygon.|-
5|Does 20 damage plus 10 more damage for each damage counter on all of your Active Pokémon.§Does 20 damage to 2 of your opponent's Benched Pokémon (1 if there is only 1). (Don't apply Weakness and Resistance for Benched Pokémon.)|-
6|Does 20 damage plus 10 more damage for each Energy attached to the Defending Pokémon.§If Grumpig and the Defending Pokémon have the same amount of Energy attached to them, the Defending Pokémon is now Confused.|-
7|Remove 1 damage counter from each of your Pokémon (including Minun).§Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. If you choose Pokémon that has a Poké-Power or Poké-Body, this attack does 40 damage instead. (Don't apply Weakness and Resistance for Benched Pokémon.)|Chain of Events:As long as Minun is your Active Pokémon, whenever your other Active Pokémon, if any, attacks, you may use Cheer On after the first attack (you still need the necessary Energy to use Cheer On). You can't use Cheer On more than once in this way even if your other Active Pokémon has the Chain of Events Poké-Body.
8|Remove 1 damage counter from each of your Pokémon (including Plusle).§Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. If you choose Pokémon-ex, this attack does 40 damage instead. (Don't apply Weakness and Resistance for Benched Pokémon.)|Chain of Events:As long as Plusle is your Active Pokémon, whenever your other Active Pokémon, if any, attacks, you may use Cheer On after the first attack (you still need the necessary Energy to use Cheer On). You can't use Cheer On more than once in this way even if your other Active Pokémon has the Chain of Events Poké-Body.
9|Attach up to 2 Grass Energy cards from your hand to your Pokémon in any way you like.§The Defending Pokémon is now Asleep.|Thick Skin:Roselia can't be affected by any Special Conditions.
10|Flip a coin. If heads, prevent all effects of an attack, including damage, done to Salamence during your opponent's next turn.§-|Dragon Wind:Once during your turn (before your attack), if Salamence is your Active Pokémon, you may switch 1 of your opponent's Benched Pokémon with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch. This power can't be used if Salamence is affected by a Special Condition.
11|Put 1 damage counter, plus 1 more damage counter for each damage counter on Shedinja, on the Defending Pokémon.|Wonder Guard:Prevent all effects of attacks, including damage, done to Shedinja by your opponent's Evolved Pokémon and Pokémon-ex.
12|Search your discard pile for up to 2 basic Energy cards, show them to your opponent, and put them into your hand.§The Defending Pokémon is now Burned. Flip a coin. If tails, discard a Fire Energy card attached to Torkoal.|-
13|Flip a coin. If heads, the Defending Pokémon is now Poisoned.§If the Defending Pokémon has any damage counters on it, this attack does 30 damage plus 30 more damage.|-
14|Flip a coin. If heads, the Defending Pokémon is now Confused.§Remove 1 damage counter from each of your Active Pokémon.|-
15|Flip a coin. If tails, discard an Energy card attached to Flygon.|Sand Guard:Whenever Flygon would be damaged by your opponent's attack (after applying Weakness and Resistance), flip a coin. If heads, reduce that damage by 20.
16|If Girafarig and the Defending Pokémon have the same amount of Energy attached to them, pick any 1 card from your deck and put it into your hand. Shuffle your deck afterward.§Choose 1 of your opponent's Pokémon. This attack does 10 damage for each Colorless Energy in that Pokémon's Retreat Cost to that Pokémon (after applying effects to the Retreat Cost). (Don't apply Weakness and Resistance for Benched Pokémon.)|-
17|Does 10 damage times the amount of Energy attached to all of your Pokémon (including Magneton).|Magnetic Field:Once during your turn (before your attack), if you have basic Energy cards in your discard pile, you may discard any 1 card from your hand. Then search for up to 2 basic Energy cards from your discard pile, show them to your opponent, and put them into your hand. You can't return the card you first discarded to your hand in this way. This power can't be used if Magneton is affected by a Special Condition.
18|You may switch Ninjask with 1 of your Benched Pokémon. If you do, you may move any number of Grass Energy cards attached to Ninjask to the new Active Pokémon.|Loose Shell:Once during your turn, when you play Ninjask from your hand to evolve 1 of your Pokémon, you may search your deck for Shedinja and put it onto your Bench. Treat the new Benched Pokémon as a Basic Pokémon. Shuffle your deck afterward.
19|You may discard an Energy card attached to Salamence. If you do, this attack does 40 damage plus 20 more damage.|Intimidating Fang:As long as Salamence is your Active Pokémon, any damage done to your Pokémon by an opponent's attack is reduced by 10 (before applying Weakness and Resistance).
20|Flip a coin. If heads, prevent all damage done to Shelgon during your opponent's next turn. (Any other effects of attacks still happen.)§-|-
21|If the number of cards in your opponent's hand is at least 6, look at his or her hand. Choose a number of cards there until your opponent has 5 cards left in his or her hand and have your opponent shuffle the cards you chose into his or her deck.§Count the amount of Energy attached to all of your Pokémon and all of your opponent's Pokémon. If your Pokémon have less Energy than your opponent's, this attack does 20 damage plus 30 more damage.|-
22|Search your deck for up to 3 different types of basic Energy cards, show them to your opponent, and put them into your hand. Shuffle your deck afterward.§Flip a coin. If heads, this attack does 20 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
23|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§-|-
24|Flip a coin. If heads, the Defending Pokémon is now Burned.§-|-
25|Flip a coin. If heads, this attack does 10 damage plus 20 more damage.§-|-
26|Remove 2 damage counters from 1 of your Pokémon (remove 1 if there is only 1).§-|-
27|Attach up to 2 basic Energy cards from your discard pile to Flaaffy.§-|-
28|Put 2 damage counters on each Defending Pokémon.§After your attack, you may discard 1 Energy card attached to Forretress. If you do, switch Forretress with 1 of your Benched Pokémon.|-
29|Does 10 damage times the amount of Energy attached to Graveler.§Does 80 damage to each Active Pokémon (both yours and your opponent's).|-
30|Does 10 damage to each Benched Pokémon (both yours and your opponent's). (Don't apply Weakness and Resistance for Benched Pokémon.)§-|-
31|Flip 4 coins. If all of them are heads, this attack does 10 damage plus 60 more damage. If not, this attack does 10 damage plus 10 more damage for each heads.|-
32|Flip a coin. If heads, this attack does 10 damage to each Defending Pokémon. Discard an Energy card from each Defending Pokémon.§This attack's damage is not affected by Resistance.|-
33|Flip a coin. If heads, this attack does 10 damage times the number of damage counters on Horsea.§If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, that attack does nothing.|-
34|Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on that Pokémon.§Discard a Fire Energy card attached to Houndoom.|-
35|-§Flip 3 coins. This attack does 20 damage plus 20 more damage for each heads.|-
36|Does 10 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
37|-§Does 10 damage plus 10 more damage for each damage counter on the Defending Pokémon.|-
38|Flip a coin. If heads, the Defending Pokémon is now Confused.§This attack's damage is not affected by Resistance.|-
39|Does 20 damage plus 10 more damage for each Energy attached to Seadra but not used to pay for this attack's Energy cost. You can't add more than 20 damage in this way.§Choose 1 of your opponent's Pokémon. This attack does 30 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
40|Flip a coin. If heads, prevent all effects of an attack, including damage, done to Seadra during your opponent's next turn.§-|-
41|-|Energy Guard:As long as Shelgon has any basic Energy cards attached to it, damage done to Shelgon by an opponent's attack is reduced by 10 (after applying Weakness and Resistance).
42|Damage done to Shelgon by an opponent's attack is reduced by 10 (after applying Weakness and Resistance) during your opponent's next turn.§-|-
43|The Defending Pokémon is now Asleep.§Put 1 damage counter on 1 of your opponent's Pokémon.|-
44|The Defending Pokémon is now Asleep.|-
45|The Defending Pokémon can't retreat until the end of your opponent's next turn.§Flip a coin. If heads, choose 1 of your opponent's Pokémon. This attack does 50 damage to that Pokémon. This attack's damage isn't affected by Weakness or Resistance.|-
46|-|Levitate:If Vibrava has any basic Energy cards attached to it, Vibrava's Retreat Cost is 0.
47|-§Flip 2 coins. This attack does 40 damage times the number of heads.|-
48|-§Does 10 damage to each Benched Pokémon (both yours and your opponent's). (Don't apply Weakness and Resistance for Benched Pokémon.)|Submerge:As long as Whiscash is on your Bench, prevent all damage done to Whiscash by your opponent's attacks.
49|-§-|-
50|Flip a coin. If tails, this attack does nothing.§The Defending Pokémon is now Asleep.|-
51|-§-|-
52|Flip a coin. If heads, the Defending Pokémon is now Poisoned.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
53|-§-|-
54|-§The Defending Pokémon is now Poisoned.|-
55|-§Choose 1 of your opponent's Benched Pokémon. This attack does 10 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
56|Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|-
57|-§Discard a Grass Energy card attached to Grimer. The Defending Pokémon is now Poisoned.|-
58|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§-|-
59|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.§-|-
60|Search your deck for Magikarp and put as many of them as you like onto your Bench. Shuffle your deck afterward.§-|-
61|-§-|-
62|Choose 1 of your opponent's Pokémon. This attack does 10 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
63|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
64|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
65|Does 10 damage plus 10 more damage for each Water Energy attached to Mudkip but not used to pay for this attack's Energy cost. You can't add more than 20 damage in this way.|-
66|Flip a coin. If heads, the Defending Pokémon is now Poisoned.|-
67|-§Flip 2 coins. This attack does 20 damage times the number of heads.|-
68|After your attack, remove from Nincada the number of damage counters equal to the damage you did to the Defending Pokémon. If Nincada has fewer damage counters than that, remove all of them.|-
69|Flip a coin. If heads, this attack does 10 damage plus 10 more damage.§-|-
70|-§Discard a Fire Energy card attached to Numel and then discard an Energy card attached to the Defending Pokémon.|-
71|-|Exoskeleton:Any damage done to Pineco by attacks is reduced by 10 (after applying Weakness and Resistance).
72|-§Switch 1 of your opponent's Benched Pokémon with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch. The new Defending Pokémon is now Burned.|-
73|After your attack, you may switch Spoink with 1 of your Benched Pokémon.|-
74|-§Flip a coin. If heads, the Defending Pokémon is now Confused.|-
75|The Defending Pokémon is now Asleep.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
76|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.|-
77|Flip a coin. If heads, this attack does 20 damage plus 20 more damage.|-
78|-|-
79|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§Flip a coin. If heads, this attack does 10 damage plus 20 more damage.|-
80|Flip a coin. If heads, this attack does 10 damage plus 20 more damage.|-
81|Search your deck for Grass Basic Pokémon and put as many of them as you like onto your Bench. Shuffle your deck afterward.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
82|-|-|Attach Balloon Berry to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § When the Pokémon Balloon Berry is attached to retreats, discard Balloon Berry instead of discarding Energy cards.
83|-|-|Attach Buffer Piece to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § Damage done to the Pokémon Buffer Piece is attached to by an opponent's attack is reduced by 20 (after applying Weakness and Resistance). At the end of your opponent's turn after you played Buffer Piece, discard Buffer Piece.
84|-|-|Search your discard pile for basic Energy cards. You may either show 1 basic Energy card to your opponent and put it into your hand, or show 3 basic Energy cards to your opponent and shuffle them into your deck.
85|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Each player pays Colorless less to retreat his or her Fire and Water Pokémon.
86|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Each Grass and Lightning Pokémon in play (both yours and your opponent's) gets +10 HP.
87|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Choose 1 of your Pokémon in play (excluding Pokémon-ex). Return that Pokémon and all cards attached to it to your hand.
88|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Draw 3 cards. Then discard any 1 card from your hand.
89|Flip a coin. If heads, this attack does 40 damage plus 30 more damage. If tails, the Defending Pokémon is now Paralyzed.|Conductivity:As long as Ampharos ex is in play, whenever your opponent attaches an Energy card to his or her Pokémon from hand, put 1 damage counter on that Pokémon. You can't put more than 1 damage counter even if there is more than 1 Ampharos ex in play.
90|Discard a Water Energy card and a Lightning Energy card attached to Dragonite ex.§Flip a coin. If tails, this attack does nothing.|Call for Power:As often as you like during your turn, you may move an Energy card attached to 1 of your Pokémon to Dragonite ex. This power can't be used if Dragonite ex is affected by a Special Condition.
91|Does 10 damage to each Benched Pokémon (both yours and your opponent's). (Don't apply Weakness and Resistance for Benched Pokémon.)§Golem ex does 50 damage to itself.|-
92|Use any attack from Kingdra ex's Basic Pokémon card or Stage 1 Evolution card. (Kingdra ex doesn't have to pay for that attack's Energy cost.)§Does 50 damage plus 20 more damage for each Water Energy attached to Kingdra ex but not used to pay for this attack's Energy cost. You can't add more than 40 damage in this way.|-
93|Flip a coin. If heads, the Defending Pokémon is now Asleep.§Discard a Fire Energy and a Water Energy attached to Latias ex.|-
94|Flip a coin. If heads, search your discard pile for a basic Energy card and attach it to Latios ex.§Discard 3 Energy attached to Latios ex.|-
95|Discard the top card from your deck. If that card is a basic Energy card, attach it to Magcargo ex.§You may discard any number of basic Energy cards attached to Magcargo ex when you use this attack. If you do, this attack does 40 damage plus 20 more damage for each basic Energy card you discarded.|-
96|The Defending Pokémon is now Poisoned.§Does 40 damage plus 10 more damage for each Colorless Energy in the Defending Pokémon's Retreat Cost (after applying effects to the Retreat Cost).|Toxic Gas:As long as Muk ex is your Active Pokémon, ignore all Poké-Powers and Poké-Bodies other than Toxic Gas.
97|Flip a coin until you get tails. For each heads, search your discard pile for a basic Energy card and attach it to Rayquaza ex.§Discard either all Fire Energy or all Lightning Energy attached to Rayquaza ex. This attack does 40 damage times the amount of Fire or Lightning Energy discarded.|-
98|-§Does 10 damage plus 10 more damage for each damage counter on Charmander.|-
99|If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, that attack does nothing.§Flip a coin. If tails, discard a Fire Energy card attached to Charmeleon.|-
100|Flip a coin. If heads, search your discard pile for 2 Fire Energy cards and attach them to Charizard (1 if there is only 1).§You may discard a Fire Energy card attached to Charizard. If you do, choose 1 of your opponent's Benched Pokémon and do 30 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-`;
const pText=new Map(PRINT.split('\n').map(line=>{let p=line.split('|');return [Number(p[0]),p]}));
const fxMap=new Map();const put=(key,e)=>fxMap.set(key,e);
const bulk=(keys,e)=>keys.split(/\s+/).filter(Boolean).forEach(key=>put(key,e));
const noop={type:'noop'},r=name=>({type:'neoRule',rule:'ex3:'+name});
const status=s=>({type:'status',status:s,target:'opponentActive'});
const flip=(yes,no=noop)=>({type:'coinFlip',heads:yes,tails:no});
const seq=(...effects)=>({type:'sequence',effects});
const bonus=n=>({type:'bonusDamage',amount:n});
const guard={type:'preventDamage',target:'self',duration:'opponentTurn',effects:true};
const defense={type:'preventDamage',target:'self',duration:'opponentTurn',effects:false};
const restricted={type:'damageRule',ignoreResistance:true};
// Every attack with non-empty printed effect text is assigned here. Pure
// numerical attacks receive a validated noop effect, NEVER a silent fallback.
bulk('2:1 9:1 43:0 44:0 50:1 75:0',status('sleep'));
bulk('23:0 52:1 58:0 63:0 64:0 75:1 79:0 81:1',flip(status('paralysis')));
bulk('13:0 52:0 66:0',flip(status('poison')));
bulk('24:0',flip(status('burn')));
bulk('14:0 38:0 74:1',flip(status('confusion')));
bulk('25:0 56:0 69:0 77:0 79:1 80:0',flip(bonus(20)));
put('50:0',{type:'coinAttackGate',heads:noop});
bulk('10:0 40:0',flip(guard));put('20:0',flip(defense));
put('1:0',r('badNews'));put('1:1',r('prizeCount'));
put('2:0',r('dragonDance'));
put('4:0',r('energyShower'));put('4:1',r('rainbowBurn'));
put('5:0',r('rockVengeance'));put('5:1',{type:'benchDamage',side:'opponent',all:true,amount:20});
put('6:0',r('psychicBoom'));put('6:1',r('mindTrip'));
put('7:0',r('cheerOn'));put('7:1',r('specialCircuit'));
put('8:0',r('cheerOn'));put('8:1',r('extraCircuit'));
put('9:0',r('speedGrowth'));
put('11:0',r('damageCurse'));
put('12:0',r('powerGeneration'));put('12:1',seq(status('burn'),r('scorchingSmoke')));
put('13:1',r('rend30'));put('14:1',r('healingWave'));
put('15:0',r('airSlash'));put('16:0',r('synchronizedSearch'));put('16:1',r('breakingImpact'));
put('17:0',r('magneticForce'));put('18:0',r('quickTouch'));
put('19:0',r('dragonFlame'));put('21:0',r('pickOn'));put('21:1',r('powerCount'));
put('22:0',r('quickCharge'));put('22:1',r('dragonSpark'));
put('26:0',{type:'chooseTarget',target:'selfPokemon',effect:{type:'heal',target:'selfPokemon',amount:20}});
put('27:0',r('energyRecall'));put('28:0',{type:'damage',target:'opponentActive',amount:20});put('28:1',r('backspin'));
put('29:0',r('grind'));put('29:1',seq({type:'selfDamage',amount:80}));
put('30:0',seq({type:'benchDamage',side:'self',all:true,amount:10},{type:'benchDamage',side:'opponent',all:true,amount:10}));
put('31:0',r('furyCutter'));put('32:0',r('dragonCrush'));put('32:1',restricted);
put('33:0',r('retaliate'));put('33:1',{type:'attackCoinGate',duration:'opponentTurn',target:'opponentActive'});
put('34:0',{type:'selectedDamage',target:'opponentPokemon',amount:20,ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true});put('34:1',{type:'discardEnergyCard',target:'self',amount:1,energyType:'Fire',strictEnergyType:true});
put('35:1',r('tripleSmash'));put('36:0',{type:'benchDamage',side:'opponent',amount:10});put('37:1',r('meditate'));
put('38:1',restricted);put('39:0',r('waterBeyondCost'));put('39:1',{type:'selectedDamage',target:'opponentPokemon',amount:30,ignoreWeakness:true,ignoreResistance:true});
put('42:0',r('graniteHead'));put('43:1',{type:'selectedDamage',target:'opponentPokemon',amount:10,ignoreWeakness:true,ignoreResistance:true});
put('45:0',{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'});put('45:1',r('quickDive'));
put('47:1',{type:'coinDamage',coins:2,amount:40,mode:'replace'});
put('48:1',seq({type:'benchDamage',side:'opponent',all:true,amount:10},{type:'benchDamage',side:'self',all:true,amount:10}));
put('55:1',{type:'benchDamage',side:'opponent',amount:10});
put('57:1',seq({type:'discardEnergyCard',target:'self',amount:1,energyType:'Grass',strictEnergyType:true},status('poison')));
put('59:0',r('roar'));put('60:0',r('callMagikarp'));put('54:1',status('poison'));put('67:1',{type:'coinDamage',coins:2,amount:20,mode:'replace'});put('81:0',r('callFriends')); 
put('62:0',{type:'selectedDamage',target:'opponentPokemon',amount:10,ignoreWeakness:true,ignoreResistance:true});
put('65:0',r('waterBeyondCost'));put('68:0',r('leechLife'));
put('70:1',seq({type:'discardEnergyCard',target:'self',amount:1,energyType:'Fire',strictEnergyType:true},{type:'discardEnergyCard',target:'opponentActive',amount:1}));
put('72:1',r('luringFlame'));put('73:0',r('bounce'));put('76:0',r('roar'));
put('89:0',r('gigavolt'));
put('90:0',seq({type:'discardEnergyCard',target:'self',amount:1,energyType:'Water',strictEnergyType:true},{type:'discardEnergyCard',target:'self',amount:1,energyType:'Lightning',strictEnergyType:true}));
put('90:1',{type:'coinAttackGate',heads:noop});
put('91:0',seq({type:'benchDamage',side:'self',all:true,amount:10},{type:'benchDamage',side:'opponent',all:true,amount:10}));put('91:1',{type:'selfDamage',amount:50});
put('92:0',r('geneticMemory'));put('92:1',r('waterBeyondCost'));
put('93:0',flip(status('sleep')));put('93:1',seq({type:'discardEnergyCard',target:'self',amount:1,energyType:'Fire',strictEnergyType:true},{type:'discardEnergyCard',target:'self',amount:1,energyType:'Water',strictEnergyType:true}));
put('94:0',r('energyStream'));put('94:1',{type:'discardEnergyCard',target:'self',amount:3});
put('95:0',r('meltingMountain'));put('95:1',r('lavaFlow'));
put('96:0',status('poison'));put('96:1',r('slimyWater'));
put('97:0',r('spiralGrowth'));put('97:1',r('dragonBurst'));
put('98:1',{type:'damageFromDamage',source:'self',amount:1});
put('99:0',{type:'attackCoinGate',duration:'opponentTurn',target:'opponentActive'});put('99:1',r('fireworks'));
put('100:0',r('collectFire'));put('100:1',r('flamePillar'));
// Remaining attacks have plain printed damage and no additional printed effect.
const TRAINEFFECTS={
 82:{type:'neoRule',rule:'ex3:balloonBerry'},
 83:{type:'neoRule',rule:'ex3:bufferPiece'},
 84:r('energyRecycleSystem'),
 85:r('highPressureSystem'),
 86:r('lowPressureSystem'),
 87:r('mrBriney'),
 88:r('tvReporter')
};
const power=(name,rName,once=true)=>({name,type:'activated',printedPowerType:'power',disabledByStatus:true,oncePerTurn:once,effect:r(rName)});
const passive=(name,effect)=>({name,type:'passive',printedPowerType:'body',effect});
const ABILITIES={
 3:[passive('Power Pinchers',r('powerPinchers'))],
 7:[passive('Chain of Events',r('chainOfEvents'))],8:[passive('Chain of Events',r('chainOfEvents'))],
 9:[passive('Thick Skin',{type:'preventStatus',duration:'whileInPlay'})],
 10:[{...power('Dragon Wind','dragonWind'),activeOnly:true}],
 11:[passive('Wonder Guard',{type:'preventDamage',duration:'whileInPlay',attackerFilter:{evolved:true},effects:true})],
 15:[passive('Sand Guard',{type:'coinDamageGuard',reduction:20})],
 17:[power('Magnetic Field','magneticField')],
 18:[passive('Loose Shell',r('looseShell'))],
 19:[passive('Intimidating Fang',r('intimidatingFang'))],
 41:[passive('Energy Guard',r('energyGuard'))],
 46:[passive('Levitate',r('levitate'))],
 48:[passive('Submerge',{type:'preventDamage',duration:'whileInPlay',condition:{type:'selfOnBench'},effects:false})],
 71:[passive('Exoskeleton',r('exoskeleton'))],
 89:[passive('Conductivity',r('conductivity'))],
 90:[power('Call for Power','callForPower',false)],
 96:[passive('Toxic Gas',r('toxicGas'))]
};
const FIELDS=new Map(RAW.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const DEFAULT_META=Object.freeze({roles:Object.freeze([]),inflicts:Object.freeze([]),payoffs:Object.freeze([]),energyTypes:Object.freeze([]),stages:Object.freeze([])});
function parse(n){
 const p=FIELDS.get(n);if(!p)throw Error('EX Dragon missing '+n);
 const [_,name,k,t,st,hp,rt,weak,resist,from,rarity,attackList,powerName]=p;
 const textParts=pText.get(n)||[],moveTexts=(textParts[1]||'').split('§');
 const isEx=/ ex$/.test(name),card={id:'ex3-'+n,setId:'ex3',number:String(n),name,kind:k==='P'?'pokemon':'trainer',source:'tcg',battleFormat:'classic',rarity,
 image:`https://images.pokemontcg.io/ex3/${n}.png`,imageLarge:`https://images.pokemontcg.io/ex3/${n}_hires.png`};
 const reasons=[];
 if(k==='P'){
  const attacks=(attackList||'').split(';').filter(Boolean).map((str,i)=>{
    const [move,cost,printed='']=str.split('~'),key=n+':'+i,original=moveTexts[i]==='-'?'':moveTexts[i]||'',effect=fxMap.get(key)||(original?null:noop);
    if(!effect)reasons.push('Unimplemented attack '+move);
    if(effect&&!fx.supportsEffect(effect))reasons.push('Unsupported attack effect '+move);
    return {name:move,cost,damage:/×/.test(printed)?0:Number((printed.match(/^\d+/)||[])[0]||0),damageText:printed||null,text:original,effect};
  });
  const abilities=(ABILITIES[n]||[]).map(a=>({...a,text:String(textParts[2]||'').split(':').slice(1).join(':')}));
  if(powerName&&!abilities.length)reasons.push('Missing Power/Body '+powerName);
  for(const ability of abilities)if(!fx.supportsEffect(ability.effect))reasons.push('Unsupported Power '+ability.name);
  Object.assign(card,{hp:Number(hp),stage:st==='0'?'Basic':'Stage '+st,types:[T[t]],subtype:T[t],retreat:Number(rt||0),evolvesFrom:from||null,
    weakness:T[weak]||null,weaknessValue:weak?'×2':null,resistance:T[resist]||null,resistanceValue:resist?'-30':null,
    pokemonEx:isEx,isEx,prizeCards:isEx?2:1,attacks,abilities,statusImmune:n===9});
 }else{
  Object.assign(card,{trainerType:[87,88].includes(n)?'Supporter':[85,86].includes(n)?'Stadium':[82,83].includes(n)?'Tool':'Item',effect:TRAINEFFECTS[n]||null,text:textParts[3]||''});
  if(!card.effect||!fx.supportsEffect(card.effect))reasons.push('Trainer effect not supported: '+name);
 }
 const descriptions=card.kind==='pokemon'?card.attacks.map(a=>a.text).concat((card.abilities||[]).map(a=>a.text)).join(' '):card.text;
 const roles=new Set(),inflicts=new Set(),payoffs=new Set(),energyTypes=new Set(),stages=new Set();
 const txt=descriptions.toLowerCase();
 for(const [word,label] of [['poison','poison'],['burned','burn'],['burn','burn'],['asleep','sleep'],['sleep','sleep'],['confused','confusion'],['paralyzed','paralysis']])if(txt.includes(word))inflicts.add(label);
 if(/damage counter|prevent all|reduce|retreat|immun|guard|no damage|knocked out/.test(txt))roles.add('stall');
 if(/draw|search|put .*into your hand|look at .*deck/.test(txt))roles.add('draw');
 if(/search your deck/.test(txt))roles.add('search');
 if(/remove.*damage counter|heal/.test(txt))roles.add('healing');
 if(/attach.*energy|energy cards from your discard|move an energy/.test(txt))roles.add('energy');
 if(/discard|hand|switch|retreat|prevent/.test(txt))roles.add('disruption');
 if(/damage.*energy|each energy attached|basic energy attached/.test(txt))roles.add('damage');
 if(/if.*special condition|if.*poison|if.*asleep|if.*confused/.test(txt))for(const x of ['sleep','poison','burn','paralysis','confusion'])payoffs.add(x);
 for(const [symbol,type] of Object.entries(T))if(symbol!=='C'&&card.attacks?.some(a=>String(a.cost).includes(symbol)))energyTypes.add(type);
 if(/evolv|stage 1|stage 2/.test(txt))stages.add('Stage 1');
 if(card.kind==='trainer'&&[82,83].includes(n))roles.add('stall');
 if(card.kind==='trainer'&&[85,86].includes(n))roles.add('support');
 if(card.kind==='pokemon'&&card.stage!=='Basic')stages.add(card.stage);
 card.deckMeta=Object.freeze({roles:[...roles],inflicts:[...inflicts],payoffs:[...payoffs],energyTypes:[...energyTypes],stages:[...stages]});
 return Object.freeze({...card,battleEnabled:reasons.length===0,deckEligible:reasons.length===0,support:{status:reasons.length?'PARTIAL':'FULL',reasons}});
}
const CARDS=Object.freeze(Array.from({length:100},(_,i)=>parse(i+1)));
const BY_ID=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>BY_ID.get(String(id||''))||null,coverage:()=>({total:100,battleEnabled:CARDS.filter(x=>x.battleEnabled).length,partial:CARDS.filter(x=>!x.battleEnabled).map(c=>[c.id,c.support.reasons])})};
});
