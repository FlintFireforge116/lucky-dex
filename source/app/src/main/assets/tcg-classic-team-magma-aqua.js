/* EX Team Magma vs Team Aqua (ex4) — complete 97-card Classic set.
 * Card text: PokemonTCG/pokemon-tcg-data/cards/en/ex4.json.
 * EX-era dual typings and Team names are preserved. LuckyDex 30-card
 * single-Active / Energy Zone rules apply only where stated by the engine.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGTeamMagmaAqua=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ex4',name:'EX Team Magma vs Team Aqua',series:'EX',releaseDate:'2004-03-15',cardCount:97});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Team Aqua's Cacturne|P|G|1|80|2|R||Team Aqua's Cacnea|Rare Holo|Dark Bind~D~10;Poison Barb~GCC~40|
2|Team Aqua's Crawdaunt|P|W|1|80|1|L||Team Aqua's Corphish|Rare Holo|Aqua Reverse~DC~20;Deep Impact~WWC~40|
3|Team Aqua's Kyogre|P|W|0|100|3|G|||Rare Holo|Aqua Trip~WC~10;Aqua Smash~WWC~50+|Power Saver
4|Team Aqua's Manectric|P|L|1|70|1|F|M|Team Aqua's Electrike|Rare Holo|Thunderspark~LCC~50|Power Shift
5|Team Aqua's Sharpedo|P|W|1|70|0|L||Team Aqua's Carvanha|Rare Holo|Rage~CC~10+;Aqua Slash~WWC~60|
6|Team Aqua's Walrein|P|W|2|120|2|F||Team Aqua's Sealeo|Rare Holo|Power Blow~W~10+;Hydro Reverse~WWCC~50+|
7|Team Magma's Aggron|P|F|2|120|2|G||Team Magma's Lairon|Rare Holo|Crush~F~30×;Land Stream~FFCC~50+|
8|Team Magma's Claydol|P|P|1|80|2|P||Team Magma's Baltoy|Rare Holo|Dark Hand~PCC~40+|Magma Switch
9|Team Magma's Groudon|P|F|0|100|3|G|||Rare Holo|Linear Attack~FC~;Pulverize~FFC~50+|Power Saver
10|Team Magma's Houndoom|P|R|1|70|1|W||Team Magma's Houndour|Rare Holo|Roasting Heat~RC~30+;Magma Spurt~RCC~30×|
11|Team Magma's Rhydon|P|F|1|90|2|G||Team Magma's Rhyhorn|Rare Holo|Magma Jab~DC~20;Shoot Down~FFC~50|
12|Team Magma's Torkoal|P|R|0|80|2|W|||Rare Holo|Magma Burn~R~10;Hot Air~RC~30|
13|Raichu|P|L|1|80|1|F||Pikachu|Rare|Spark~LC~20;Kerzap~LLC~40+|
14|Team Aqua's Crawdaunt|P|W|1|80|1|L||Team Aqua's Corphish|Rare|Poison Reaction~WC~20+;Double Claw~WCC~30+|
15|Team Aqua's Mightyena|P|D|1|70|1|G|P|Team Aqua's Poochyena|Rare|Bite~DC~20;Mystic Fang~WCC~50|
16|Team Aqua's Sealeo|P|W|1|70|1|M||Team Aqua's Spheal|Rare|Aqua Trance~W~20;Super Hypnoblast~WC~30+|
17|Team Aqua's Seviper|P|G|0|80|2|P|||Rare|Call for Family~C~;Thick Poison~GCC~20|
18|Team Aqua's Sharpedo|P|W|1|70|0|L||Team Aqua's Carvanha|Rare|Slow-Acting Poison~CC~20;Aqua Smash~WWC~50+|
19|Team Magma's Camerupt|P|R|1|80|2|W||Team Magma's Numel|Rare|Flame Ball~RCC~50|Overheat
20|Team Magma's Lairon|P|F|1|80|2|G||Team Magma's Aron|Rare|Body Slam~C~10;Tackle~FFC~50|
21|Team Magma's Mightyena|P|D|1|70|1|F|P|Team Magma's Poochyena|Rare|Overrun~F~10;Bite Off~DCC~40+|
22|Team Magma's Rhydon|P|F|1|80|2|G||Team Magma's Rhyhorn|Rare|Second Strike~CC~20+;Land Crush~FFC~60|
23|Team Magma's Zangoose|P|C|0|70|1|F|||Rare|Call for Family~C~;Team Play~CCC~10×|
24|Team Aqua's Cacnea|P|G|0|50|1|R|||Uncommon|Paralyzing Gaze~C~;Pin Missile~CC~10×|
25|Team Aqua's Carvanha|P|W|0|50|1|L|||Uncommon|Slow-Acting Poison~CC~20|Dark Lift
26|Team Aqua's Corphish|P|W|0|50|1|L|||Uncommon|Double Pinchers~C~10×;Dark Poison~DC~20|
27|Team Aqua's Electrike|P|L|0|50|1|F|M||Uncommon|Random Spark~L~;Plasma~CC~10|
28|Team Aqua's Lanturn|P|L|1|80|1|F|M|Team Aqua's Chinchou|Uncommon|Lightning Ball~LCC~50|Auxiliary Light
29|Team Aqua's Manectric|P|L|1|80|1|F|M|Team Aqua's Electrike|Uncommon|Aqua Beam~LC~20;Chaos Crush~LCC~50|
30|Team Aqua's Mightyena|P|D|1|80|1|G|P|Team Aqua's Poochyena|Uncommon|Aqua Call~C~;Wave Splash~WC~30|
31|Team Aqua's Sealeo|P|W|1|80|2|M||Team Aqua's Spheal|Uncommon|Aurora Beam~CC~20;Knock Over~WWC~40|
32|Team Magma's Baltoy|P|P|0|50|1|P|||Uncommon|Psymist~C~;Pain Amplifier~PC~|
33|Team Magma's Claydol|P|F|1|80|1|G||Team Magma's Baltoy|Uncommon|Clay Curse~CC~;Clay Pulse~FFC~50|
34|Team Magma's Houndoom|P|R|1|70|1|W||Team Magma's Houndour|Uncommon|Target Scorch~RC~30;Damage Burn~RCC~40+|
35|Team Magma's Houndour|P|R|0|50|1|W|||Uncommon|Singe~R~;Dark Shock~DC~20|
36|Team Magma's Lairon|P|F|1|70|1|G||Team Magma's Aron|Uncommon|Gnaw~C~20;Land Sonic~FFC~40|
37|Team Magma's Mightyena|P|D|1|80|1|F|P|Team Magma's Poochyena|Uncommon|Lunge~FC~50|Call for Help
38|Team Magma's Rhyhorn|P|F|0|50|1|G|||Uncommon|Double Damage~C~;Horn Rush~FCC~60|
39|Bulbasaur|P|G|0|50|1|R|||Common|Growth~C~;Razor Leaf~G~10|
40|Cubone|P|F|0|50|1|G|||Common|Bone Attack~F~20|
41|Jigglypuff|P|C|0|50|1|F|||Common|Doubleslap~C~10×;Rest~CC~|
42|Meowth|P|C|0|50|1|F|||Common|Plunder~C~10;Scratch~CC~20|
43|Pikachu|P|L|0|50|1|F|||Common|Agility~C~;Thundershock~LC~20|
44|Psyduck|P|W|0|40|1|L|||Common|Bubble~W~10;Confuse Ray~P~10|
45|Slowpoke|P|P|0|50|1|P|||Common|Amnesia~P~;Tail Strike~CC~10+|
46|Squirtle|P|W|0|50|1|L|||Common|Tackle~C~10|Shell Retreat
47|Team Aqua's Carvanha|P|W|0|40|1|L|||Common|Confuse Ray~C~10;Poison Fang~WC~10|
48|Team Aqua's Carvanha|P|W|0|50|1|L|||Common|Wave Splash~W~10;Razor Fin~CC~20|
49|Team Aqua's Chinchou|P|L|0|50|1|F|M||Common|Confuse Ray~C~;Wave Splash~LC~20|
50|Team Aqua's Corphish|P|W|0|40|1|L|||Common|Toxic Grip~C~|
51|Team Aqua's Corphish|P|W|0|50|1|L|||Common|Slash~W~10;Slow-Acting Poison~CC~10|
52|Team Aqua's Electrike|P|L|0|50|1|F|M||Common|Scratch~C~10;Thundershock~LC~10|
53|Team Aqua's Electrike|P|L|0|50|1|F|M||Common|Self Charge~C~;Tackle~CC~20|
54|Team Aqua's Poochyena|P|D|0|40|1|G|P||Common|Double Scratch~C~10×;Tail Slap~CC~20|
55|Team Aqua's Poochyena|P|D|0|50|1|G|P||Common|Roar~C~;Aqua Crush~WC~10|
56|Team Aqua's Spheal|P|W|0|40|1|M|||Common|Powder Snow~W~10|
57|Team Aqua's Spheal|P|W|0|50|1|M|||Common|Rollout~W~10;Aqua Trance~WC~20|
58|Team Magma's Aron|P|F|0|50|1|G|||Common|Mud Slap~F~10;Tackle~CC~20|
59|Team Magma's Aron|P|F|0|50|1|G|||Common|Dig Under~F~|
60|Team Magma's Baltoy|P|F|0|50|1|G|||Common|Peck~C~10;Double Spin~FC~20×|
61|Team Magma's Baltoy|P|F|0|50|1|G|||Common|Night Attack~F~;Spinning Attack~CC~20|
62|Team Magma's Houndour|P|R|0|50|1|W|||Common|Combustion~R~10;Super Singe~RC~10|
63|Team Magma's Houndour|P|R|0|50|1|W|||Common|Kick Away~C~10;Steady Firebreathing~RC~20|
64|Team Magma's Numel|P|R|0|50|1|W|||Common|Collect~C~;Combustion~RC~20|
65|Team Magma's Poochyena|P|D|0|40|1|F|P||Common|Snarl~C~|
66|Team Magma's Poochyena|P|D|0|50|1|F|P||Common|Darkness Call~C~;Sharp Fang~FC~20|
67|Team Magma's Rhyhorn|P|F|0|50|1|G|||Common|Double Stab~F~10×;Second Strike~CC~10+|
68|Team Magma's Rhyhorn|P|F|0|60|2|G|||Common|Ram~C~10;Knock Over~FC~10|
69|Team Aqua Schemer|T||0||||||Common||
70|Team Magma Schemer|T||0||||||Common||
71|Archie|T||0||||||Uncommon||
72|Dual Ball|T||0||||||Uncommon||
73|Maxie|T||0||||||Uncommon||
74|Strength Charm|T||0||||||Uncommon||
75|Team Aqua Ball|T||0||||||Uncommon||
76|Team Aqua Belt|T||0||||||Uncommon||
77|Team Aqua Conspirator|T||0||||||Uncommon||
78|Team Aqua Hideout|T||0||||||Uncommon||
79|Team Aqua Technical Machine 01|T||0||||||Uncommon|Miracle~C~10|
80|Team Magma Ball|T||0||||||Uncommon||
81|Team Magma Belt|T||0||||||Uncommon||
82|Team Magma Conspirator|T||0||||||Uncommon||
83|Team Magma Hideout|T||0||||||Uncommon||
84|Team Magma Technical Machine 01|T||0||||||Uncommon|Crushing Magma~C~10|
85|Warp Point|T||0||||||Uncommon||
86|Aqua Energy|E||0||||||Uncommon||
87|Magma Energy|E||0||||||Uncommon||
88|Double Rainbow Energy|E||0||||||Rare||
89|Blaziken ex|P|R|2|150|2|W||Combusken|Rare Holo EX|Blaze Kick~RC~30+;Volcanic Ash~RRCC~|
90|Cradily ex|P|G|2|150|2|W||Lileep|Rare Holo EX|Eerie Light~CC~30;Acidic Poison~GGCC~60|Primal Vibes
91|Entei ex|P|R|0|100|2|W|||Rare Holo EX|Searing Flame~R~10;Bright Flame~RRC~90|
92|Raikou ex|P|L|0|100|2|F|||Rare Holo EX|Dazzle Blast~L~10;Lightning Tackle~LLC~70|
93|Sceptile ex|P|G|2|150|2|G|W|Grovyle|Rare Holo EX|Green Heal~G~;Poison Ring~GCC~40;Slashing Strike~GGCCC~100|
94|Suicune ex|P|W|0|100|2|L|||Rare Holo EX|Energy Flip~W~;Reverse Stream~WWC~50+|
95|Swampert ex|P|F|2|150|3|G||Marshtomp|Rare Holo EX|Hyper Pump~C~20+;Crushing Wave~WCC~|
96|Absol|P|D|0|70|1|F|||Rare Secret|Quick Attack~CC~10+;Feint Attack~DDC~|
97|Jirachi|P|P|0|50|1|P|||Rare Secret|Hypnoblast~P~10;Swift~CC~20|`;
const PRINT=`1|You may discard a Darkness Energy card attached to Team Aqua's Cacturne. If you do, the Defending Pokémon is now Paralyzed.§The Defending Pokémon is now Poisoned.|-
2|Before doing damage, you may choose 1 of your opponent's Benched Pokémon that has Team Magma in its name and switch it with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch.§If the Defending Pokémon already has any damage counters on it, the Defending Pokémon is now Confused.|-
3|Flip a coin. If heads, the Defending Pokémon is now Confused. If tails, the Defending Pokémon is now Asleep.§If the Defending Pokémon is affected by a Special Condition, this attack does 50 damage plus 20 more damage.|Power Saver:As long as the number of Pokémon in play (both yours and your opponent's) that has Team Aqua in its name is 3 or less, Team Aqua's Kyogre can't attack.
4|Does 10 damage to each Benched Pokémon (both yours and your opponent's) that has Energy cards attached to it. (Don't apply Weakness and Resistance for Benched Pokémon.)|Power Shift:Once during your turn (before your attack), you may move any number of basic Energy cards attached to 1 of your Pokémon with Team Aqua in its name to another of your Pokémon. This power can't be used if Team Aqua's Manectric is affected by a Special Condition.
5|Does 10 damage plus 10 more damage for each damage counter on Team Aqua's Sharpedo.§Team Aqua's Sharpedo can't attack during your next turn.|-
6|Does 10 damage plus 10 more damage for each Energy attached to Team Aqua's Walrein.§You may return any number of basic Water Energy cards attached to all of your Pokémon to your hand. If you do, this attack does 50 damage plus 10 more damage for each Energy you returned.|-
7|Flip a coin for each Energy attached to Team Magma's Aggron. This attack does 30 damage times the number of heads.§You may discard any number of basic Energy cards attached to Team Magma's Aggron. If you do, this attack does 50 damage plus 20 more damage for each basic Energy card you discarded.|-
8|If you have more cards in your hand than your opponent, this attack does 40 damage plus 20 more damage.|Magma Switch:Once during your turn (before your attack), you may move an Energy card attached to your Pokémon with Team Magma in its name to another of your Pokémon. This power can't be used if Team Magma's Claydol is affected by a Special Condition.
9|Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§If the Defending Pokémon already has at least 2 damage counters on it, this attack does 50 damage plus 20 more damage.|Power Saver:As long as the number of Pokémon in play (both yours and your opponent's) that has Team Magma in its name is 3 or less, Team Magma's Groudon can't attack.
10|If the Defending Pokémon is Burned, this attack does 30 damage plus 20 more damage.§Discard the top 5 cards from your deck. This attack does 30 damage times the number of Fire and Fighting basic Energy cards discarded in this way.|-
11|This attack's damage is not affected by Resistance.§If the Defending Pokémon has Team Aqua in its name, the Defending Pokémon is now Confused.|-
12|Discard the top card from your opponent's deck, and flip a coin. If tails, discard a Fire Energy attached to Team Magma's Torkoal.§Discard a Fire Energy attached to Team Magma's Torkoal and your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon, if any.|-
13|Does 10 damage to 2 of your opponent's Benched Pokémon (1 if there is only 1). (Don't apply Weakness and Resistance for Benched Pokémon.)§Flip a coin. If heads, this attack does 40 damage plus 40 more damage to the Defending Pokémon and discard all Lightning Energy cards attached to Raichu.|-
14|If the Defending Pokémon is Poisoned, this attack does 20 damage plus 20 more damage.§Flip 2 coins. This attack does 30 damage plus 20 more damage for each heads.|-
15|-§If the Defending Pokémon is Pokémon-ex, the Defending Pokémon is now Confused.|-
16|At the end of your opponent's next turn, the Defending Pokémon is now Asleep.§If the Defending Pokémon is Asleep, this attack does 30 damage plus 20 more damage.|-
17|Search your deck for a Grass Basic Pokémon or Basic Pokémon with Team Aqua in its name and put it onto your Bench. Shuffle your deck afterward.§Flip a coin. If heads, the Defending Pokémon is now Confused and Poisoned. If tails, the Defending Pokémon is now Poisoned.|-
18|At the end of your opponent's next turn, the Defending Pokémon is now Poisoned.§If the Defending Pokémon is affected by a Special Condition, this attack does 50 damage plus 20 more damage.|-
19|You may move a Fire Energy card attached to Team Magma's Camerupt to 1 of your Benched Pokémon.|Overheat:Once during your turn (before your attack), you may search your discard pile for a basic Energy card and attach it to Team Magma's Camerupt. Put 2 damage counters on Team Mamga's Camerupt. This power can't be used if Team Magma's Camerupt is affected by a Special Condition.
20|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§-|-
21|Choose 1 of your opponent's Benched Pokémon. This attack does 10 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§If the Defending Pokémon is Pokémon-ex, this attack does 40 damage plus 40 more damage.|-
22|If the Defending Pokémon already has at least 2 damage counters on it, this attack does 20 damage plus 20 more damage.§Flip a coin. If tails, discard an Energy card attached to Team Magma's Rhydon.|-
23|Search your deck for a Colorless Basic Pokémon or Basic Pokémon with Team Magma in its name and put it onto your Bench. Shuffle your deck afterward.§Does 10 damage times the number of Pokémon in play with Team Magma in its name.|-
24|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§Flip 4 coins. This attack does 10 damage times the number of heads.|-
25|At the end of your opponent's next turn, the Defending Pokémon is now Poisoned.|Dark Lift:If Team Aqua's Carvanha has any Darkness Energy attached to it, the Retreat Cost for Team Aqua's Carvanha is 0.
26|Flip 2 coins. This attack does 10 damage times the number of heads.§Discard a basic Energy card attached to Team Aqua's Corphish or this attack does nothing. The Defending Pokémon is now Poisoned.|-
27|Choose 1 of your opponent's Pokémon. This attack does 10 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§Flip a coin. If heads, search your discard pile for a Lightning Energy card and attach it to Team Aqua's Electrike.|-
28|-|Auxiliary Light:Once during your turn (before your attack), you may attach a basic Energy card from your hand to Team Aqua's Lanturn. Put 2 damage counters on Team Aqua's Lanturn. This power can't be used if Team Aqua's Lanturn is affected by a Special Condition.
29|If the Defending Pokémon has Team Magma in its name, the Defending Pokémon is now Confused.§If the Defending Pokémon is Confused, discard an Energy card attached to the Defending Pokémon.|-
30|Search your deck for Pokémon that has Team Aqua in its name, show up to 3 of them to your opponent, and put them into your hand. Shuffle your deck afterward.§-|-
31|-§You may discard any Stadium card in play.|-
32|Flip 2 coins. For each heads, choose 1 of you opponent's Pokémon and put 1 damage counter on that Pokémon.§Put 1 damage counter on each of your opponent's Pokémon that already has damage counters on it.|-
33|Put 2 damage counters on your opponent's Pokémon in any way you like.§Does 10 damage to each of your opponent's Benched Pokémon that has any damage counters on it. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
34|If the Defending Pokémon has Team Aqua in its name, the Defending Pokémon is now Burned.§If the Defending Pokémon already has any damage counters on it, this attack does 40 damage plus 20 more damage.|-
35|Flip a coin. If heads, the Defending Pokémon is now Burned.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
36|-§If the Defending Pokémon already has any damage counters on it, the Defending Pokémon is now Confused.|-
37|Flip a coin. If tails, this attack does nothing.|Call for Help:Once during your turn (before your attack), if Team Magma's Mightyena is your Active Pokémon, you may search your deck for a Pokémon with Team Magma in its name, show it to your opponent, and put it into your hand. Shuffle your deck afterward. This power can't be used if Team Magma's Mightyena is affected by a Special Condition.
38|Does 10 damage to each Defending Pokémon.§Flip a coin. If tails, this attack does nothing.|-
39|Attach a Grass Energy card from your hand to Bulbasaur.§-|-
40|Flip a coin. If tails, this attack does nothing.|-
41|Flip 2 coins. This attack does 10 damage times the number of heads.§Remove all Special Conditions and 3 damage counters from Jigglypuff (all if there are less than 3). Jigglypuff is now Asleep.|-
42|Before doing damage, discard all Trainer cards attached to the Defending Pokémon (before they affect the damage).§-|-
43|Flip a coin. If heads, prevent all effects of an attack, including damage, done to Pikachu during your opponent's next turn.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
44|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§Flip a coin. If heads, the Defending Pokémon is now Confused.|-
45|Choose 1 of the Defending Pokémon's attacks. That Pokémon can't use that attack during your opponent's next turn.§Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|-
46|-|Shell Retreat:As long as Squirtle has any Energy cards attached to it, damage done to Squirtle by an opponent's attack is reduced by 10 (after applying Weakness and Resistance).
47|Flip a coin. If heads, the Defending Pokémon is now Confused.§The Defending Pokémon is now Poisoned.|-
48|-§-|-
49|Flip a coin. If heads, the Defending Pokémon is now Confused.§-|-
50|The Defending Pokémon is now Poisoned.|-
51|-§At the end of your opponent's next turn, the Defending Pokémon is now Poisoned.|-
52|-§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
53|Attach an Energy card from your hand to Team Aqua's Electrike.§-|-
54|Flip 2 coins. This attack does 10 damage times the number of heads.§-|-
55|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon, if any.§Flip a coin. If heads, discard an Energy card attached to the Defending Pokémon.|-
56|The Defending Pokémon is now Asleep.|-
57|-§At the end of your opponent's next turn, the Defending Pokémon is now Asleep.|-
58|-§-|-
59|Choose 1 of your opponent's Pokémon. This attack does 10 damage to that Pokémon. This attack's damage isn't affected by Weakness or Resistance.|-
60|-§Flip 2 coins. This attack does 20 damage times the number of heads.|-
61|Put 1 damage counter on 1 of your opponent's Pokémon.§-|-
62|-§The Defending Pokémon is now Burned.|-
63|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon, if any.§-|-
64|Draw a card.§-|-
65|Flip a coin. If heads, this attack does 10 damage to the Defending Pokémon. If tails, the Defending Pokémon is now Paralyzed.|-
66|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon, if any.§-|-
67|Flip 2 coins. This attack does 10 damage times the number of heads.§If the Defending Pokémon already has at least 2 damage counters on it, this attack does 10 damage plus 20 more damage.|-
68|-§You may discard any Stadium card in play.|-
69|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Discard any 1 Pokémon from your hand. Then draw 3 cards. If you discarded a Pokémon with Team Aqua in its name, draw 4 cards instead.
70|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Discard any 1 Pokémon from your hand. Then draw 3 cards. If you discarded a Pokémon with Team Magma in its name, draw 4 cards instead.
71|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Search your deck for a Pokémon with Team Aqua in its name and put it onto your Bench. Shuffle your deck afterward. Treat the new Benched Pokémon as a Basic Pokémon. If it is a Stage 2 Pokémon, put 2 damage counters on that Pokémon.
72|-|-|Flip 2 coins. For each heads, search your deck for a Basic Pokémon card, show it to your opponent, and put it into your hand. Shuffle your deck afterward.
73|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Search your hand or discard pile for a Pokémon with Team Magma in its name and put it onto your Bench. Treat the new Benched Pokémon as a Basic Pokémon. If it is a Stage 2 Pokémon, put 2 damage counters on that Pokémon.
74|-|-|Attach Strength Charm to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § Whenever an attack from the Pokémon that Strength Charm is attached to does damage to the Active Pokémon (after applying Weakness and Resistance), the attack does 10 more damage. At the end of the turn in which this happens, discard Strength Charm.
75|-|-|Flip a coin. If heads, search your deck for a Pokémon that has Team Aqua in its name, show it to your opponent, and put it into your hand. If tails, search your deck for a Basic Pokémon that has Team Aqua in its name, show it to your opponent and put it into your hand. Shuffle your deck afterward.
76|-|-|Attach Team Aqua Belt to 1 of your Pokémon with Team Aqua in its name that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § At any time between turns, if the Pokémon Team Aqua Belt is attached to is your Active Pokémon, search your deck for a card that evolves from that Pokémon and put it on that Pokémon. (This counts as evolving that Pokémon.) Shuffle your deck afterward, then discard Team Aqua Belt.
77|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Search your deck for up to 2 in any combination of Basic Pokémon with Team Aqua in its name and basic Energy cards, show them to your opponent, and put them into your hand. Shuffle your deck afterward.
78|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Each Pokémon that does not have Team Aqua in its name pays Colorless more to retreat.
79|Choose 1 Special Condition. The Defending Pokémon is now affected by that Special Condition.|-|Attach this card to 1 of your Pokémon that has Team Aqua in its name. That Pokémon may use this card's attack instead of its own. At the end of your turn, discard Team Aqua Technical Machine 01.
80|-|-|Flip a coin. If heads, search your deck for a Pokémon that has Team Magma in its name, show it to your opponent, and put it into your hand. If tails, search your deck for a Basic Pokémon that has Team Magma in its name, show it to your opponent, and put it into your hand. Shuffle your deck afterward.
81|-|-|Attach Team Magma Belt to 1 of your Pokémon with Team Magma in its name that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § At any time between turns, if the Pokémon Team Magma Belt is attached to is your Active Pokémon, search your deck for a card that evolves from that Pokémon and put it on that Pokémon. (This counts as evolving that Pokémon.) Shuffle your deck afterward, then discard Team Magma Belt.
82|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Search your deck for up to 2 in any combination of Basic Pokémon with Team Magma in its name and basic Energy cards, show them to your opponent, and put them into your hand. Shuffle your deck afterward.
83|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Whenever any player plays a Basic Pokémon that doesn't have Team Magma in its name from his or her hand, that player puts 1 damage counter on that Pokémon.
84|Choose an Energy card attached to the Defending Pokémon and put that card at the bottom of your opponent's deck.|-|Attach this card to 1 of your Pokémon that has Team Magma in its name. That Pokémon may use this card's attack instead of its own. At the end of your turn, discard Team Magma Technical Machine 01.
85|-|-|Your opponent switches 1 of his or her Defending Pokémon with 1 of his or her Benched Pokémon, if any. You switch 1 of your Active Pokémon with 1 of your Benched Pokémon, if any.
86|-|-|Aqua Energy can be attached only to a Pokémon with Team Aqua in its name. Aqua Energy provides Water and Darkness Energy but provides 2 Energy at a time. (Doesn't count as a basic Energy card when not in play and has no other effect than providing Energy.) At the end of your turn, discard Aqua Energy.
87|-|-|Magma Energy can be attached only to a Pokémon with Team Magma in its name. Magma Energy provides Fighting and /or Darkness Energy but provides 2 Energy at a time. (Doesn't count as a basic Energy card when not in play and has no other effect than providing Energy.) At the end of your turn, discard Magma Energy.
88|-|-|Double Rainbow Energy can be attached only to an Evolved Pokémon (excluding Pokémon-ex). While in play, Double Rainbow Energy provides every type of Energy but provides 2 Energy at a time. (Doesn't count as a basic Energy when not in play and has no effect other than providing Energy.) Damage done to your opponent's Pokémon by the Pokémon Double Rainbow Energy is attached to is reduced by 10 (after applying Weakness and Resistance). When the Pokémon Double Rainbow Energy is attached to is no longer an Evolved Pokémon, discard Double Rainbow Energy.
89|Flip a coin. If heads, this attack does 30 damage plus 20 more damage. If tails, this attack does 30 damage and the Defending Pokémon is now Burned.§Discard 2 Fire Energy attached to Blaziken ex and then choose 1 of your opponent's Pokémon. This attack does 100 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
90|The Defending Pokémon is now Confused.§The Defending Pokémon is now Poisoned and Burned.|Primal Vibes:As long as Cradily ex is your Active Pokémon, your opponent can't play a Pokémon from his or her hand to evolve his or her Active Pokémon.
91|Flip a coin. If heads, the Defending Pokémon is now Burned.§Discard 2 Energy attached to Entei ex.|-
92|Flip a coin. If heads, the Defending Pokémon is now Confused.§Flip a coin. If tails, Raikou ex does 20 damage to itself.|-
93|Remove 4 damage counters from each of your Pokémon that has Grass Energy attached. If that Pokémon has less than 4 damage counters, remove all of them.§The Defending Pokémon is now Poisoned. The Defending Pokémon can't retreat until the end of your opponent's next turn.§Sceptile ex can't use Slashing Strike during your next turn.|-
94|Choose 1 of your opponent's Benched Pokémon. This attack does 10 damage to that Pokémon. You may move an Energy card attached to that Pokémon to another of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§You may return all basic Energy cards attached to Suicune ex to your hand. If you do, this attack does 50 damage plus 10 more damage for each basic Energy card you returned.|-
95|Does 20 damage plus 20 more damage for each basic Energy attached to Swampert ex but not used to pay for this attack's Energy cost. You can't add more than 80 damage in this way.§Choose 1 of your opponent's Pokémon. This attack does 40 damage to that Pokémon. After doing damage, flip a coin. If heads, your opponent discards an Energy card, if any, attached to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
96|Flip a coin. If heads, this attack does 10 damage plus 10 more damage.§Choose 1 of your opponent's Pokémon. This attack does 30 damage to that Pokémon. This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies or any other effects on that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
97|The Defending Pokémon is now Asleep.§This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies or any other effects on the Defending Pokémon.|-`;
const FIELDS=new Map(RAW.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const TEXT=new Map(PRINT.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const noop={type:'noop'},r=name=>({type:'neoRule',rule:'ex4:'+name});
const effectByKey=new Map();
const put=(key,e)=>effectByKey.set(key,e);
const bulk=(keys,e)=>keys.split(/\s+/).filter(Boolean).forEach(k=>put(k,e));
const status=s=>({type:'status',target:'opponentActive',status:s});
const coin=(yes,no=noop)=>({type:'coinFlip',heads:yes,tails:no});
const seq=(...effects)=>({type:'sequence',effects});
const bonus=n=>({type:'bonusDamage',amount:n});
const selected=(n,{ignoreEffects=false}={})=>({type:'selectedDamage',target:'opponentPokemon',amount:n,ignoreWeakness:true,ignoreResistance:true,ignoreEffects});
const skip={type:'coinAttackGate',heads:noop};
// Nontrivial printed effects are dispatched to the EX4 rules module in the
// shared engine (including coin outcomes, team selection, and energy costs).
// Simple printed effects use existing, tested effect primitives.

bulk('1:1 47:1 50:0',status('poison'));
bulk('56:0',status('sleep'));
bulk('62:1',status('burn'));
bulk('20:0 24:0 44:0 52:1',coin(status('paralysis')));
bulk('35:0 91:0',coin(status('burn')));
bulk('43:1',coin(status('paralysis')));
bulk('44:1 47:0 49:0 92:0',coin(status('confusion')));
bulk('40:0 37:0 38:1',skip);
bulk('39:1 42:1 46:0 48:0 51:0 52:0 53:1 54:1 58:0 60:0 61:1 63:1 64:1 68:0',noop);
// Trainer attacks are attached via their Technical Machines and evaluated
// using the exact same action/effect pipeline as Pokémon attacks.
const ABILITY={
 3:{name:'Power Saver',type:'passive'},4:{name:'Power Shift',type:'activated',oncePerTurn:true,disabledByStatus:true},
 8:{name:'Magma Switch',type:'activated',oncePerTurn:true,disabledByStatus:true},9:{name:'Power Saver',type:'passive'},
 19:{name:'Overheat',type:'activated',oncePerTurn:true,disabledByStatus:true},25:{name:'Dark Lift',type:'passive'},
 28:{name:'Auxiliary Light',type:'activated',oncePerTurn:true,disabledByStatus:true},
 37:{name:'Call for Help',type:'activated',oncePerTurn:true,disabledByStatus:true,activeOnly:true},
 46:{name:'Shell Retreat',type:'passive'},90:{name:'Primal Vibes',type:'passive'}
};
const TRAINER_TYPE={69:'Supporter',70:'Supporter',71:'Supporter',72:'Item',73:'Supporter',74:'Tool',75:'Item',76:'Tool',77:'Supporter',78:'Stadium',79:'Tool',80:'Item',81:'Tool',82:'Supporter',83:'Stadium',84:'Tool',85:'Item'};
const SPECIAL={
 86:{type:'specialEnergy',provides:{Water:1,Darkness:1},name:'Aqua Energy'},
 87:{type:'specialEnergy',provides:{Fighting:1,Darkness:1},name:'Magma Energy'},
 88:{type:'specialEnergy',provides:{Miracle:2},name:'Double Rainbow Energy'}
};
const RARITY_EX=new Set([89,90,91,92,93,94,95]);
function parse(n){
 const p=FIELDS.get(n);if(!p)throw new Error('Missing EX Team Magma vs Team Aqua '+n);
 const [_,name,kind,t,stage,hp,retreat,weak,resist,from,rarity,moves,printedPower]=p;
 const text=TEXT.get(n)||[],attackText=String(text[1]||'').split('§');
 const card={id:'ex4-'+n,setId:'ex4',number:String(n),name,kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy',source:'tcg',battleFormat:'classic',rarity,
  image:`https://images.pokemontcg.io/ex4/${n}.png`,imageLarge:`https://images.pokemontcg.io/ex4/${n}_hires.png`};
 const missing=[];
 if(kind==='P'){
   const attacks=(moves||'').split(';').filter(Boolean).map((str,i)=>{
     const [move,cost,printed='']=str.split('~'),original=attackText[i]==='-'?'':attackText[i]||'';
     const effect=effectByKey.get(n+':'+i)||(original?r(n+':'+i):noop);
     if(!fx.supportsEffect(effect))missing.push('Unsupported attack effect: '+move);
     return {name:move,cost,damage:/×/.test(printed)?0:Number((printed.match(/^\d+/)||[])[0]||0),damageText:printed||null,text:original,effect};
   });
   const rawAbility=ABILITY[n];const abilityText=String(text[2]||'').split(':').slice(1).join(':');
   const abilities=rawAbility?[{...rawAbility,printedPowerType:rawAbility.type==='passive'?'body':'power',effect:r('power:'+n),text:abilityText}]:[];
   if(printedPower&&!rawAbility)missing.push('Missing ability: '+printedPower);
   if(abilities.some(a=>!fx.supportsEffect(a.effect)))missing.push('Unsupported ability');
   const dual=(n>=1&&n<=12)||n===24;
   const types=dual?[T[t],'Darkness']:[T[t]];
   const isEx=RARITY_EX.has(n);
   Object.assign(card,{stage:stage==='0'?'Basic':'Stage '+stage,types,subtype:T[t],hp:Number(hp),retreat:Number(retreat||0),
     weakness:T[weak]||null,weaknesses:{6:['Fighting','Metal'],7:['Grass','Water'],89:['Water','Psychic'],90:['Water','Fire'],93:['Grass','Fire']}[n]||null,weaknessValue:weak?'×2':null,resistance:T[resist]||null,resistanceValue:resist?'-30':null,
     evolvesFrom:from||null,pokemonEx:isEx,isEx,prizeCards:isEx?2:1,attacks,abilities});
 } else if(kind==='T'){
   const trainerType=TRAINER_TYPE[n]||'Item';const technicalMachine=n===79||n===84;
   const attacks=technicalMachine?(moves||'').split(';').filter(Boolean).map((str,i)=>{
     const [move,cost,printed='']=str.split('~');return {name:move,cost,damage:Number(printed||0),damageText:printed||null,text:attackText[i]==='-'?'':attackText[i]||'',effect:r(n+':'+i)};
   }):[];
   Object.assign(card,{trainerType,technicalMachine,attacks,text:String(text[3]||''),effect:r('trainer:'+n)});
   if(!fx.supportsEffect(card.effect))missing.push('Unsupported Trainer');
 }else Object.assign(card,{specialEnergy:true,basicEnergy:false,subtype:'Colorless',types:['Colorless'],effect:SPECIAL[n],text:String(text[3]||'')});
 const fullText=(card.attacks||[]).map(a=>a.text).concat((card.abilities||[]).map(a=>a.text),card.text||'').join(' ').toLowerCase();
 const roles=new Set(),inflicts=new Set(),payoffs=new Set(),energyTypes=new Set(),stages=new Set();
 if(/heal|remove .*damage counter/.test(fullText))roles.add('healing');
 if(/draw|search .*deck|put .*into your hand/.test(fullText))roles.add('draw');
 if(/search .*deck/.test(fullText))roles.add('search');
 if(/attach .*energy|energy .*from .*discard|move .*energy|provides .*energy/.test(fullText))roles.add('energy');
 if(/prevent|reduce .*damage|can't retreat|no damage/.test(fullText))roles.add('stall');
 if(/discard|switch|can't play|opponent.*hand|confus|poison|sleep|asleep|burn|paraly/.test(fullText))roles.add('disruption');
 if(/damage.*energy|damage counter|damage.*pokemon in play/.test(fullText))roles.add('damage');
 for(const [token,tag] of [['poison','poison'],['burned','burn'],['asleep','sleep'],['confused','confusion'],['paralyzed','paralysis']]){
   if(new RegExp('defending pokémon is now '+token).test(fullText))inflicts.add(tag);
 }
 if(/if the defending pokémon (?:is|already has).*poison/i.test(fullText))payoffs.add('poison');
 if(/if the defending pokémon (?:is|already has).*burn/i.test(fullText))payoffs.add('burn');
 if(/if the defending pokémon (?:is|already has).*asleep/i.test(fullText))payoffs.add('sleep');
 if(/if the defending pokémon (?:is|already has).*confused/i.test(fullText))payoffs.add('confusion');
 if(/if the defending pokémon (?:is|already has).*special condition/i.test(fullText))for(const x of ['poison','sleep','burn','confusion','paralysis'])payoffs.add(x);
 for(const attack of card.attacks||[])for(const sym of String(attack.cost||''))if(sym!=='C'&&T[sym])energyTypes.add(T[sym]);
 if(card.kind==='pokemon'&&card.stage!=='Basic')stages.add(card.stage);
 if(card.kind==='trainer'&&/Conspirator|Ball|Archie|Maxie/.test(name))roles.add('search');
 if(card.kind==='trainer'&&/Hideout/.test(name))roles.add('disruption');
 if(card.kind==='trainer'&&/Belt|Charm/.test(name))roles.add('support');
 if(card.kind==='energy')roles.add('energy');
 const team=name.startsWith('Team Aqua')?'aqua':name.startsWith('Team Magma')?'magma':null;
 // Team-locked Trainers must not fill dead slots in an unrelated deck.
 const requiredTeam=kind==='T'&&[71,75,76,77,78,79].includes(n)?'aqua':kind==='T'&&[73,80,81,82,83,84].includes(n)?'magma':null;
 const preferredTeam=kind==='T'&&n===69?'aqua':kind==='T'&&n===70?'magma':null;
 if(n===79)for(const x of ['sleep','poison','burn','paralysis','confusion'])inflicts.add(x);
 if([71,73,75,80].includes(n))roles.add('search');
 card.deckMeta=Object.freeze({roles:[...roles],inflicts:[...inflicts],payoffs:[...payoffs],energyTypes:[...energyTypes],stages:[...stages],...(team?{team}:{}),...(requiredTeam?{requiredTeams:[requiredTeam]}:{}),...(preferredTeam?{preferredTeams:[preferredTeam]}:{}),synergy:team?[team]:[]});
 return Object.freeze({...card,battleEnabled:missing.length===0,deckEligible:missing.length===0,support:{status:missing.length?'PARTIAL':'FULL',reasons:missing}});
}
const CARDS=Object.freeze(Array.from({length:97},(_,i)=>parse(i+1)));
const MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])})};
});
