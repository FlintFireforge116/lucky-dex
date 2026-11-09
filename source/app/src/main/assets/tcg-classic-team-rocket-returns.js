/* EX Team Rocket Returns (ex7) — complete 111-card 2004 Classic TCG expansion.
 * Original print text and stats from PokemonTCG/pokemon-tcg-data cards/en/ex7.json.
 * The Classic battle rules use LuckyDex's single-Active and separate Energy Zone.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGTeamRocketReturns=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ex7',name:'EX Team Rocket Returns',series:'EX',releaseDate:'2004-11-08',cardCount:111});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Azumarill|P|W|1|80|1|L||Marill|Rare Holo|Water Punch~WC~20+|Froth
2|Dark Ampharos|P|L|2|120|2|F||Dark Flaaffy|Rare Holo|Ram~CC~30;Shock Bolt~LCC~70|Darkest Impulse
3|Dark Crobat|P|G|2|90|1|L|F|Dark Golbat|Rare Holo|Dark Drain~GC~;Skill Dive~GC~|Black Beam
4|Dark Electrode|P|L|1|70|1|F||Voltorb|Rare Holo|Energy Bomb~L~30|Darkness Navigation
5|Dark Houndoom|P|R|1|70|1|F|P|Houndour|Rare Holo|Shakedown~DC~20;Dark Fire~RCC~40+|
6|Dark Hypno|P|P|1|70|1|P||Drowzee|Rare Holo|Dark Link~C~;Black Magic~PC~20×|
7|Dark Marowak|P|F|1|70|1|G||Cubone|Rare Holo|Brick Smash~CC~30;Hard Bone~FFC~70|
8|Dark Octillery|P|W|1|70|1|L||Remoraid|Rare Holo|Black Suction Cups~W~;Ink Blast~CC~30+|
9|Dark Slowking|P|P|1|80|1|G||Slowpoke|Rare Holo|Litter~PC~20+|Cunning
10|Dark Steelix|P|D|1|110|4|R|G|Onix|Rare Holo|Energy Link~CC~20;Heavy Impact~FCCC~60|
11|Jumpluff|P|G|2|90||R|W|Skiploom|Rare Holo|Energy Crush~C~10+|Buffer
12|Kingdra|P|W|2|120|2|L||Seadra|Rare Holo|Hyper Whirlpool~CC~20;Aqua Sonic~WCC~50|Dragon Veil
13|Piloswine|P|F|1|100|2|G||Swinub|Rare Holo|Sheer Cold~CC~20;Tonnage~FFCC~60+|
14|Togetic|P|C|1|70|1|L|F|Togepi|Rare Holo|Dive~CC~30;Rainbow Moves~CCC~|Holy Shield
15|Dark Dragonite|P|D|2|120|2|C|G|Dark Dragonair|Rare|Double Wing Attack~WL~;Claw Swipe~CCC~50|Dark Trance
16|Dark Muk|P|G|1|80|1|P||Grimer|Rare|Slimy Water~CC~10×;Acidic Poison~GC~10|Sticky Goo
17|Dark Raticate|P|D|1|70||F||Rattata|Rare|Dark Seed~D~;Spread Poison~CC~10|
18|Dark Sandslash|P|F|1|70||G||Sandshrew|Rare|Swift~CCC~50|Poison Payback
19|Dark Tyranitar|P|D|2|120|2|F|P|Dark Pupitar|Rare|Grind~C~10+;Spinning Tail~DCC~;Bite Off~DDCCC~70+|
20|Dark Tyranitar|P|F|2|120|3|G||Dark Pupitar|Rare|Second Strike~FCC~50+|Sand Damage
21|Delibird|P|W|0|70|1|M|||Rare|Souvenir~CC~|Gift Exchange
22|Furret|P|C|1|80|1|F||Sentret|Rare|Quick Change~C~;Quick Tail Smash~CC~30|
23|Ledian|P|G|1|70|1|R||Ledyba|Rare|Split Spiral Punch~CC~20;Tackle~GCC~50|Powder Protection
24|Magby|P|R|0|50|1|W|||Rare|Detour~C~|Baby Evolution
25|Misdreavus|P|P|0|60|1|D|F||Rare|Hide in Shadows~PC~20|Dark Spell
26|Quagsire|P|W|1|80|2|G||Wooper|Rare|Hyper Pump~W~20+|Saturation
27|Qwilfish|P|W|0|60|1|L|||Rare|Stun Poison~WC~10|Spiny
28|Yanma|P|G|0|70|1|L|F||Rare|Quick Charge~C~;Swift~C~20|
29|Dark Arbok|P|G|1|90|1|P||Ekans|Uncommon|Swallow Up~G~10+;Extra Poison~CC~30|
30|Dark Ariados|P|G|1|70|1|R||Spinarak|Uncommon|Super Poison Breath~C~;Breaking Impact~GCC~|
31|Dark Dragonair|P|D|1|70|1|C|G|Dratini|Uncommon|Dragon Rage~WL~30|Evolutionary Light
32|Dark Dragonair|P|D|1|80|1|C|G|Dratini|Uncommon|Double Tackle~WC~;Crushing Blow~LCC~40|
33|Dark Flaaffy|P|L|1|80|1|F||Mareep|Uncommon|Thunder Slash~C~10;Headbutt~LC~20|
34|Dark Golbat|P|G|1|70||P||Zubat|Uncommon|Night Ambush~G~|
35|Dark Golduck|P|W|1|70|1|L||Psyduck|Uncommon|Darkness Shield~WC~20;Cold Crush~WCC~40|
36|Dark Gyarados|P|W|1|80|2|L|F|Magikarp|Uncommon|Sharp Fang~WC~30;Dark Streak~WCC~40|Dark Scale
37|Dark Houndoom|P|R|1|70|1|W||Houndour|Uncommon|Fire Payback~RCC~40+|Fire Breath
38|Dark Magcargo|P|R|1|80|2|W||Slugma|Uncommon|Energy Press~C~10+;Linear Attack~FCC~|
39|Dark Magneton|P|L|1|70|1|F||Magnemite|Uncommon|Magnetic Lines~LC~20;Poison Pulse~LCC~40|
40|Dark Pupitar|P|F|1|70|1|G||Larvitar|Uncommon|Explosive Evolution~C~;Double Tackle~FC~|
41|Dark Pupitar|P|F|1|80|2|G||Larvitar|Uncommon|Dark Streak~CC~20;Rock Tumble~FCC~40|
42|Dark Weezing|P|G|1|80|2|P||Koffing|Uncommon|Smog~C~;Darkness Charge~GCC~50|Methane Leak
43|Heracross|P|F|0|70|1|P|||Uncommon|Get Even~FC~20+|Crust
44|Magmar|P|R|0|70|1|W|||Uncommon|Dump and Draw~C~;Flame Tail~RCC~40|
45|Mantine|P|W|0|70|1|L|||Uncommon|Aqua Slash~WC~30|Ripples
46|Rocket's Meowth|P|D|0|60|1|F|||Uncommon|Snatch and Run~C~;Miraculous Comeback~CC~10×|
47|Rocket's Wobbuffet|P|D|0|70|1|P|||Uncommon|Dark Aid~C~;Amnesia~PC~10|
48|Seadra|P|W|1|70|1|L||Horsea|Uncommon|Confuse Ray~WC~10;Aqua Trick~WCC~30|
49|Skiploom|P|G|1|60||R|W|Hoppip|Uncommon|Miracle Powder~C~10|Buffer
50|Togepi|P|C|0|40|1|F|||Uncommon|Yawn~C~;Mini-Metronome~CC~|
51|Cubone|P|F|0|50|1|G|||Common|Look for Friends~C~;Bonemerang~F~10×|
52|Dratini|P|C|0|40|1||||Common|Pound~C~10|
53|Dratini|P|C|0|50|1|C|G||Common|Dragon Song~C~;Tail Strike~WL~20+|
54|Drowzee|P|P|0|50|1|P|||Common|Soothing Wave~C~10|Insomnia
55|Ekans|P|G|0|60|1|P|||Common|Tail Wrap~C~|
56|Grimer|P|G|0|50|1|P|||Common|Taunt~C~;Spit Poison~CC~10|
57|Hoppip|P|G|0|30|1|R|W||Common|Miracle Powder~C~|Buffer
58|Horsea|P|W|0|50|1|L|||Common|Water Plant~C~;Swift~WW~30|
59|Houndour|P|R|0|50|1|W|||Common|Rear Kick~C~10;Smokescreen~RC~20|
60|Houndour|P|R|0|50|1|W|||Common|Firebreathing~R~10+|Dark Lift
61|Koffing|P|G|0|50|1|P|||Common|Gnaw~C~10|Knockout Gas
62|Larvitar|P|F|0|50|1|G|||Common|Fury Attack~F~10×|
63|Larvitar|P|F|0|50|1|G|||Common|Light Punch~C~10;Dig Drain~FC~20|
64|Ledyba|P|G|0|50|1|R|||Common|Call for Family~C~;Beat~GC~20|
65|Magikarp|P|W|0|30|1|L|||Common|Call for Friends~W~|
66|Magnemite|P|L|0|50|1|F|||Common|Sonicboom~C~10|
67|Mareep|P|L|0|50|1|F|||Common|Minor Errand-Running~C~;Quick Attack~LC~10+|
68|Marill|P|W|0|50|1|L|||Common|Minor Errand-Running~C~|
69|Onix|P|F|0|80|3|W|||Common|Horn Rush~C~10;Granite Head~FC~20|
70|Psyduck|P|W|0|50|1|L|||Common|Gentle Slap~C~10;Headache~W~|
71|Rattata|P|C|0|40|1|F|||Common|Fury Swipes~C~10×|Scramble
72|Rattata|P|C|0|40|1|F|||Common|Call for Family~C~;Snarl~C~|
73|Remoraid|P|W|0|50|1|L|||Common|Energy Draw~C~;Razor Fin~W~10|
74|Sandshrew|P|F|0|50|1|G|||Common|Rear Kick~C~10;Swift~CC~20|
75|Sentret|P|C|0|50|1|F|||Common|Friend Search~C~;Surprise Attack~C~20|
76|Slowpoke|P|P|0|50|1|P|||Common|Bite~C~10|Dense
77|Slugma|P|R|0|50|2|W|||Common|Singe~R~;Heat Tackle~CC~30|
78|Spinarak|P|G|0|50|1|R|||Common|Collect~C~;Rising Lunge~GC~20+|
79|Swinub|P|F|0|50|1|G|||Common|Tackle~C~10;Rest~CC~|
80|Voltorb|P|L|0|40|1|F|||Common|Psycho Waves~C~;Thunder Wave~C~10|
81|Wooper|P|W|0|50|1|G|||Common|Wave Splash~W~10|Saturation
82|Zubat|P|G|0|50|1|P|||Common|Dark Streak~C~;Ambush~GC~20+|
83|Copycat|T||0||||||Uncommon||
84|Pokémon Retriever|T||0||||||Uncommon||
85|Pow! Hand Extension|T||0||||||Uncommon||
86|Rocket's Admin.|T||0||||||Uncommon||
87|Rocket's Hideout|T||0||||||Uncommon||
88|Rocket's Mission|T||0||||||Uncommon||
89|Rocket's Poké Ball|T||0||||||Uncommon||
90|Rocket's Tricky Gym|T||0||||||Uncommon|Feint Attack~C~|
91|Surprise! Time Machine|T||0||||||Uncommon||
92|Swoop! Teleporter|T||0||||||Uncommon||
93|Venture Bomb|T||0||||||Uncommon||
94|Dark Metal Energy|E||0||||||Uncommon||
95|R Energy|E||0||||||Uncommon||
96|Rocket's Articuno ex|P|D|0|100|1|M|||Rare Holo EX|Freeze Solid~C~10;Ice Wing~WWC~50|Darkness Veil
97|Rocket's Entei ex|P|D|0|100|1|W|||Rare Holo EX|Energy Link~C~10;Volcanic Ash~RRC~|Dark Condition
98|Rocket's Hitmonchan ex|P|D|0|100|1|P|||Rare Holo EX|Mach Punch~F~10;Magnum Punch~FFC~60|Strikes Back
99|Rocket's Mewtwo ex|P|D|0|100|2|P|||Rare Holo EX|Darkness Switch~P~;Hypnoblast~PCC~40;Psyburn~PCCC~70|
100|Rocket's Moltres ex|P|D|0|100|2|W|||Rare Holo EX|Fire Dance~RC~30;Combustion~RRC~50|Dark Lift
101|Rocket's Scizor ex|P|D|1|120|1|R|G|Rocket's Scyther ex|Rare Holo EX|Rotating Claws~CCC~50|Dual Armor
102|Rocket's Scyther ex|P|D|0|80|1|R|F||Rare Holo EX|Bounce~C~10;Slashing Strike~CCC~40|Dual Armor
103|Rocket's Sneasel ex|P|D|0|90|1|F|P||Rare Holo EX|Drag Off~D~10;Dark Ring~DDC~30+|
104|Rocket's Snorlax ex|P|D|0|100|3|F|||Rare Holo EX|Poison Claws~CC~20;Collapse~CCCC~60|Dark Healer
105|Rocket's Suicune ex|P|D|0|100|1|L|||Rare Holo EX|Icy Wind~C~10;Hyper Splash~WWC~50+|Dark and Clear
106|Rocket's Zapdos ex|P|D|0|100|1|L|||Rare Holo EX|Plasma~C~10;Raging Thunder~LLC~60|Darkness Guard
107|Mudkip ★|P|W|0|70|1|L|||Rare Holo Star|Whirlpool~W~;Spring Back~WW~20+|
108|Torchic ★|P|R|0|70|1|W|||Rare Holo Star|Fireworks~R~20;Spring Back~RR~20+|
109|Treecko ★|P|G|0|70|1|R|W||Rare Holo Star|Tackle~C~10;Spring Back~GG~20+|
110|Charmeleon|P|R|1|70|1|W||Charmander|Rare Secret|Smokescreen~R~10;Fireworks~RC~40|
111|Here Comes Team Rocket!|T||0||||||Rare Secret||`;
const PRINT=`1|Flip a coin for each Water Energy attached to Azumarill. This attack does 20 damage plus 20 more damage for each heads.|Froth:Once during your turn, when you play Azumarill from your hand to evolve 1 of your Active Pokémon, you may use this power. Each Defending Pokémon is now Paralyzed.
2|-§Discard all Lightning Energy attached to Dark Ampharos.|Darkest Impulse:As long as Dark Ampharos is in play, whenever your opponent plays an Evolution card from his or her hand to evolve 1 of his or her Pokémon, put 2 damage counters on that Pokémon. You can't use more than 1 Darkest Impulse Poké-Body each turn.
3|Does 10 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) Remove from Dark Crobat a number of damage counters equal to the number of your opponent's Pokémon in play.§Does 30 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|Black Beam:Once during your turn (before your attack), if Dark Crobat is your Active Pokémon, you may choose 1 of the Defending Pokémon. That Pokémon is now Poisoned. This power can't be used if Dark Crobat is affected by a Special Condition.
4|You may move all Energy cards attached to Dark Electrode to your Benched Pokémon in any way you like.|Darkness Navigation:Once during your turn (before your attack), if Dark Electrode has no Energy attached to it, you may search your deck for a Darkness or Dark Metal Energy and attach it to Dark Electrode. Shuffle your deck afterward. This power can't be used if Dark Electrode is affected by a Special Condition.
5|Choose a card from your opponent's hand without looking and discard it.§You may discard a Fire Energy or Darkness Energy attached to Dark Houndoom. If you do, this attack does 40 damage plus 20 more damage.|-
6|Flip a coin. If heads, choose an attack on 1 of your Pokémon in play that has Dark in its name (excluding this one). Dark Link copies that attack except for its Energy cost. (You must still do anything else required for that attack.) (No matter what type that Pokémon is, Dark Hypno's type is still Psychic Darkness.) Dark Hypno performs that attack.§Does 20 damage times the number of your opponent's Benched Pokémon.|-
7|This attack's damage isn't affected by Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.§Discard a Basic Pokémon or Evolution card from your hand or this attack does nothing.|-
8|Does 10 damage to each Defending Pokémon. Flip a coin. If heads, each Defending Pokémon is now Paralyzed.§Does 30 damage plus 10 more damage for each Energy attached to Dark Octillery but not used to pay for this attack's Energy cost. You can't add more than 20 damage in this way.|-
9|You may discard a combination of up to 2 Pokémon Tool cards and Rocket's Secret Machine cards from your hand. If you do, this attack does 20 damage plus 30 more damage for each card you discarded.|Cunning:Once during your turn (before your attack), you may look at the top card of your opponent's deck. Then, you may shuffle his or her deck. This power can't be used if Dark Slowking is affected by a Special Condition.
10|Search your discard pile for an Energy card and attach it to Dark Steelix.§-|-
11|Does 10 damage plus 10 more damage for each Energy attached to all of your opponent's Pokémon.|Buffer:If Jumpluff would be Knocked Out by an opponent's attack, flip a coin. If heads, Jumpluff is not Knocked Out and its remaining HP becomes 10 instead.
12|Flip a coin until you get tails. For each heads, discard an Energy card attached to the Defending Pokémon.§This attack's damage is not affected by Resistance.|Dragon Veil:As long as Kingdra is in play, each of your Active Pokémon has no Weakness.
13|Flip a coin. If heads, each Defending Pokémon can't attack during your opponent's next turn.§You may do 60 damage plus 40 more damage. If you do, Piloswine does 30 damage to itself.|-
14|-§Choose 1 of your opponent's Benched Pokémon's attacks. Rainbow Moves copies that attack except for its Energy cost. (You must still do anything else required for that attack.) (No matter what type that Pokémon is, Togetic's type is still Colorless.) Togetic performs that attack.|Holy Shield:Prevent all effects of attacks, including damage, done to Togetic by your opponent's Pokémon that has Dark in its name.
15|Does 30 damage to each Defending Pokémon.§-|Dark Trance:As often as you like during your turn (before your attack), you may move a Darkness Energy card attached to 1 of your Pokémon to another of your Pokémon. This power can't be used if Dark Dragonite is affected by a Special Condition.
16|Does 10 damage times the number of Colorless Energy in the Defending Pokémon's Retreat Cost (after applying effects to the Retreat Cost).§The Defending Pokémon is now Burned and Poisoned.|Sticky Goo:As long as Dark Muk is your Active Pokémon, your opponent pays ColorlessColorless more to retreat his or her Active Pokémon.
17|The Defending Pokémon can't retreat during your opponent's next turn. Put 5 damage counters on the Defending Pokémon at the end of your opponent's next turn.§The Defending Pokémon is now Poisoned. This attack does 20 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
18|This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.|Poison Payback:If Dark Sandslash is your Active Pokémon and is damaged by an opponent's attack (even if Dark Sandslash is Knocked Out), the Attacking Pokémon is now Poisoned.
19|Does 10 damage plus 10 more damage for each Energy attached to Dark Tyranitar.§Does 20 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§If the Defending Pokémon is Pokémon-ex, this attack does 70 damage plus 50 more damage.|-
20|If the Defending Pokémon already has at least 2 damage counters on it, this attack does 50 damage plus 20 more damage.|Sand Damage:As long as Dark Tyranitar is your Active Pokémon, put 1 damage counter on each of your opponent's Benched Basic Pokémon between turns. You can't use more than 1 Sand Damage Poké-Body between turns.
21|Flip 3 coins. If 1 of them is heads, put 4 damage counters on the Defending Pokémon. If 2 of them are heads, remove 1 damage counter from the Defending Pokémon. If all of them are heads, put 10 damage counters on the Defending Pokémon. If all of them are tails, remove all damage counters from the Defending Pokémon.|Gift Exchange:Once during your turn (before your attack), if Delibird is your Active Pokémon, you may shuffle 1 card from your hand into your deck. Then, draw a card. This power can't be used if Delibird is affected by a Special Condition.
22|Choose up to 3 cards in your hand and put them on top of your deck. Then, search your deck for that many cards and put them into your hand. Shuffle your deck afterward.§Before doing damage, you may flip a coin. If heads, this attack does 80 damage instead. If tails, this attack does nothing.|-
23|Flip a coin. If heads, the Defending Pokémon is now Confused.§-|Powder Protection:Any damage done to Ledian by attacks from Pokémon that has an owner in its name is reduced by 40.
24|If you have a Supporter card in play, use the effect on that card as the effect of this attack.|Baby Evolution:Once during your turn (before your attack), you may put Magmar from your hand onto Magby (this counts as evolving Magby), and remove all damage counters from Magby.
25|Switch Misdreavus with 1 of your Benched Pokémon.|Dark Spell:Once during your turn (before your attack), if Misdreavus is your Active Pokémon, you may flip a coin. If heads, put 1 damage counter on 1 of your opponent's Pokémon. This power can't be used if Misdreavus is affected by a Special Condition or if your other Active Pokémon is not Misdreavus.
26|Does 20 damage plus 20 more damage for each basic Energy card attached to Quagsire but not used to pay for this attack's Energy cost. You can't add more than 60 damage in this way.|Saturation:When you attach a Water Energy card from your hand to Quagsire, remove all Special Conditions and 2 damage counters from Quagsire.
27|Flip a coin. If heads, the Defending Pokémon is now Paralyzed and Poisoned.|Spiny:If Qwilfish is your Active Pokémon and is damaged by an opponent's attack (even if Qwilfish is Knocked Out), flip a coin until you get tails. For each heads, put 1 damage counter on the Attacking Pokémon.
28|Search your deck for up to 4 different types of basic Energy cards, show them to your opponent, and put them into your hand. Shuffle your deck afterward.§This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.|-
29|Before doing damage, count the remaining HP of the Defending Pokémon and Dark Arbok. If the Defending Pokémon has fewer remaining HP than Dark Arbok's, this attack does 10 damage plus 30 more damage.§If the Defending Pokémon is Pokémon-ex, the Defending Pokémon is now Asleep and Poisoned.|-
30|Each Defending Pokémon is now Poisoned.§Choose 1 of your opponent's Pokémon. This attack does 20 damage for each Colorless Energy in that Pokémon's Retreat Cost (after applying effects to the Retreat Cost). (Don't apply Weakness and Resistance for Benched Pokémon.)|-
31|-|Evolutionary Light:Once during your turn (before your attack), if Dark Dragonair is your Active Pokémon, you may search your deck for an Evolution card. Show it to your opponent and put it into your hand. Shuffle your deck afterward. This power can't be used if Dark Dragonair is affected by a Special Condition.
32|Does 20 damage to each Defending Pokémon.§Flip a coin. If heads, discard an Energy card attached to the Defending Pokémon.|-
33|If the Defending Pokémon is a Basic Pokémon, the Defending Pokémon is now Paralyzed. Dark Flaaffy can't use Thunder Slash during your next turn.§-|-
34|Does 30 damage to 1 of your opponent's Pokémon. Dark Golbat can't attack during your next turn. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
35|Flip a coin. If heads, prevent all effects of an attack, including damage, done to each of your Active Pokémon during your opponent's next turn.§You may discard an Energy card attached to Dark Golduck. If you do, discard an Energy attached to the Defending Pokémon.|-
36|-§Flip a coin. If heads, each Defending Pokémon is now Paralyzed.|Dark Scale:If Dark Gyarados is your Active Pokémon and is Knocked Out by an opponent's attack, put 3 damage counters on the Attacking Pokémon.
37|If you have less Benched Pokémon than your opponent, this attack does 40 damage plus 20 more damage.|Fire Breath:Once during your turn (before your attack), if Dark Houndoom is your Active Pokémon, you may flip a coin. If heads, the Defending Pokémon (choose 1 if there are 2) is now Burned. This power can't be used if Dark Houndoom is affected by a Special Condition.
38|Does 10 damage plus 10 more damage for each basic Energy card attached to all of your Active Pokémon.§Choose 1 of your opponent's Pokémon. This attack does 40 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
39|If your opponent has at least 2 Pokémon in play, move a basic Energy card from the Defending Pokémon to another of your opponent's Pokémon.§The Defending Pokémon is now Poisoned.|-
40|Flip a coin. If heads, this attack does 10 damage to each of your opponent's Pokémon. (Don't apply Weakness and Resistance.) Then, search your deck for a card that evolves from Dark Pupitar and put it on Dark Pupitar. (This counts as evolving Dark Pupitar.) Shuffle your deck afterward.§Does 20 damage to each Defending Pokémon.|-
41|Flip a coin. If heads, each Defending Pokémon is now Paralyzed.§This attack's damage is not affected by Resistance.|-
42|The Defending Pokémon is now Poisoned.§Put 2 damage counters on Dark Weezing.|Methane Leak:As long as Dark Weezing is your Active Pokémon, put 1 damage counter on each Pokémon that remains Poisoned between turns.
43|If you have more Prize cards left than your opponent, this attack does 20 damage plus 10 more damage for each Prize card more than your opponent.|Crust:Any damage done to Heracross by attacks from your opponent's Basic Pokémon is reduced by 20 (after applying Weakness and Resistance).
44|Discard up to 2 Energy cards from your hand. Then, draw 2 cards for each Energy card you discarded.§-|-
45|Mantine can't attack during your next turn.|Ripples:Once during your turn (before your attack), you may remove 1 damage counter from 1 of your Pokémon (excluding Mantine). This power can't be used if Mantine is affected by a Special Condition.
46|Search your deck for a Pokémon Tool card or Rocket's Secret Machine card, show it to your opponent, and put it into your hand. If you do, you may switch Rocket's Meowth with 1 of your Benched Pokémon. Shuffle your deck afterward.§Flip a coin for each Pokémon in play (both yours and your opponent's). This attack does 10 damage times the number of heads. Rocket's Meowth does 10 damage times the number of tails to itself.|-
47|Search your discard pile for Pokémon Tool cards and Rocket's Secret Machine cards. You may show either 1 Pokémon Tool card or Rocket's Secret Machine card to your opponent and put it into your hand, or show a combination of 3 Pokémon Tool cards or Rocket's Secret Machine cards to your opponent and shuffle them into your deck.§Choose 1 of the Defending Pokémon's attacks. That Pokémon can't use that attack during your opponent's next turn.|-
48|The Defending Pokémon is now Confused.§Move 1 Energy card attached to the Defending Pokémon to 1 of your opponent's Benched Pokémon. If your opponent has no Benched Pokémon, this effect does nothing.|-
49|Flip a coin. If heads, choose 1 Special Condition. The Defending Pokémon is now affected by that Special Condition.|Buffer:If Skiploom would be Knocked Out by an opponent's attack, flip a coin. If heads, Skiploom is not Knocked Out and its remaining HP becomes 10 instead.
50|The Defending Pokémon is now Asleep.§Flip a coin. If heads, choose 1 of the Defending Pokémon's attacks. Mini-Metronome copies that attack except for its Energy cost. (You must still do anything else required for that attack.) (No matter what type that Pokémon is, Togepi's type is still Colorless.) Togepi performs that attack.|-
51|Reveal cards from your deck until you reveal a Basic Pokémon. Show that card to your opponent and put it into your hand. Shuffle the other revealed cards into your deck. (If you don't reveal a Basic Pokémon, shuffle all the revealed cards back into your deck.)§Flip 2 coins. This attack does 10 damage times the number of heads.|-
52|-|-
53|Each Defending Pokémon is now Asleep.§Flip a coin. If heads, this attack does 20 damage plus 10 more damage.|-
54|Flip a coin. If heads, each Defending Pokémon is now Asleep.|Insomnia:Drowzee can't be Asleep.
55|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
56|Choose 1 of your opponent's Benched Pokémon and switch it with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch.§The Defending Pokémon is now Poisoned.|-
57|Flip a coin. If heads, choose 1 Special Condition. The Defending Pokémon is now affected by that Special Condition.|Buffer:If Hoppip would be Knocked Out by an opponent's attack, flip a coin. If heads, Hoppip is not Knocked Out and its remaining HP becomes 10 instead.
58|Search your discard pile for up to 2 Water Energy cards, show them to your opponent, and put them into your hand.§This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.|-
59|-§If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, that attack does nothing.|-
60|Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|Dark Lift:If Houndour has any Darkness Energy attached to it, the Retreat Cost for Houndour is 0.
61|-|Knockout Gas:If Koffing is your Active Pokémon and is Knocked Out by an opponent's attack, the Attacking Pokémon is now Confused and Poisoned.
62|Flip 3 coins. This attack does 10 damage times the number of heads.|-
63|-§Remove 1 damage counter from Larvitar.|-
64|Search your deck for a Grass Basic Pokémon and put it onto your Bench. Shuffle your deck afterward.§-|-
65|Search your deck for up to 2 Basic Pokémon and put them onto your Bench. Shuffle your deck afterward.|-
66|This attack's damage isn't affected by Weakness or Resistance.|-
67|Search your deck for a basic Energy card, show it to your opponent, and put it into your hand. Shuffle your deck afterward.§Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|-
68|Search your deck for up to 2 basic Energy cards, show them to your opponent, and put them into your hand. Shuffle your deck afterward.|-
69|Flip a coin. If tails, this attack does nothing.§During your opponent's next turn, any damage done to Onix by attacks is reduced by 10 (after applying Weakness and Resistance).|-
70|-§Flip a coin. If heads, your opponent can't play a Trainer card from his or her hand until the end of your opponent's next turn.|-
71|Flip 3 coins. This attack does 10 damage times the number of heads.|Scramble:As long as your opponent has any Pokémon-ex as his or her Active Pokémon, the Retreat Cost for Rattata is 0.
72|Search your deck for a Basic Pokémon and put it onto your Bench. Shuffle your deck afterward.§Flip a coin. If heads, this attack does 10 damage to the Defending Pokémon. If tails, the Defending Pokémon is now Paralyzed.|-
73|Flip a coin. If heads, search your deck for a basic Energy card and attach it to Remoraid. Shuffle your deck afterward.§-|-
74|-§This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on the Defending Pokémon.|-
75|Look at the top 5 cards of your deck. Choose a Basic Pokémon or Evolution card you find there, show it to your opponent, and put it into your hand. Put the other 4 cards back on top of your deck. Shuffle your deck afterward.§Flip a coin. If tails, this attack does nothing.|-
76|-|Dense:Any damage done to Slowpoke by attacks from your opponent's Evolved Pokémon is reduced by 10 (after applying Weakness and Resistance).
77|Flip a coin. If heads, the Defending Pokémon is now Burned.§Slugma does 10 damage to itself.|-
78|Draw a card.§Flip a coin. If heads, this attack does 20 damage plus 10 more damage.|-
79|-§Remove all Special Conditions and all damage counters from Swinub. Swinub is now Asleep.|-
80|Discard an Energy card attached to Voltorb. The Defending Pokémon is now Confused.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
81|-|Saturation:When you attach a Water Energy card from your hand to Wooper, remove all Special Conditions and 1 damage counter from Wooper.
82|Flip a coin. If heads, each Defending Pokémon is now Paralyzed.§Flip a coin. If heads, this attack does 20 damage plus 10 more damage.|-
83|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Shuffle your hand into your deck. Then, count the number of cards in your opponent's hand and draw that many cards.
84|-|-|Search your discard pile for Basic Pokémon and Evolution cards. You may either show 1 Basic Pokémon or Evolution card to your opponent and put it into your hand, or show a combination of 3 Basic Pokémon or Evolution cards to your opponent and shuffle them into your deck.
85|-|-|You may use this card only if you have more Prize cards left than your opponent. § Move 1 Energy card attached to the Defending Pokémon to another of your opponent's Pokémon. Or, switch 1 of your opponent's Benched Pokémon with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch.
86|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Each player shuffles his or her hand into his or her deck. Then, each player counts his or her Prize cards left and draws up to that many cards. (You draw your cards first.)
87|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Each Pokémon with Dark or Rocket's in its name (both yours and your opponent's) gets +20 HP.
88|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Discard a card from your hand. Then, draw 3 cards. If you discarded a Pokémon that has Dark or Rocket's in its name, draw 4 cards instead.
89|-|-|Search your deck for a Pokémon with Dark in its name, show it to your opponent, and put it into your hand. Shuffle your deck afterward.
90|Does 20 damage to 1 of your opponent's Pokémon. This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on that Pokémon.|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Each Pokémon with Dark or Rocket's in its name (both yours and your opponent's) can use attacks on this card instead of its own.
91|-|-|Choose 1 of your Evolved Pokémon, remove the highest Stage Evolution card from it, and shuffle it into your deck (this counts as devolving that Pokémon). If that Pokémon remains in play, search your deck for an Evolution card that evolves from that Pokémon and put it onto that Pokémon (this counts as evolving that Pokémon). Shuffle your deck afterward.
92|-|-|Search your deck for a Basic Pokémon (excluding Pokémon-ex) and switch it with 1 of your Basic Pokémon (excluding Pokémon-ex) in play. (Any cards attached to that Pokémon, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) Place the first Basic Pokémon in the discard pile. Shuffle your deck afterward.
93|-|-|Flip a coin. If heads, put 1 damage counter on 1 of your opponent's Pokémon. If tails, put 1 damage counter on 1 of your Pokémon.
94|-|-|Attach Dark Metal Energy to 1 of your Pokémon. While in play, Dark Metal Energy provides Darkness Energy and Metal Energy, but provides only 1 Energy at a time. (Doesn't count as a basic Energy card when not in play and has no effect other than providing Energy.)
95|-|-|R Energy can be attached only to a Pokémon that has Dark or Rocket's in its name. While in play, R Energy provides 2 Darkness Energy. (Doesn't count as a basic Energy card.) If the Pokémon R Energy is attached to attacks, the attack does 10 more damage to the Active Pokémon (before applying Weakness and Resistance). When your turn ends, discard R Energy.
96|Search your discard pile for a Water Energy card and attach it to Rocket's Articuno ex.§-|Darkness Veil:As long as Rocket's Articuno ex has any Darkness Energy attached to it, prevent all effects, except damage, by an opponent's attack done to Rocket's Articuno ex.
97|Search your discard pile for an Energy card and attach it to Rocket's Entei ex.§Discard 2 Energy attached to Rocket's Entei ex and then choose 1 of your opponent's Pokémon. This attack does 60 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|Dark Condition:As long as Rocket's Entei ex has any Darkness Energy attached to it, Rocket's Entei ex has no Weakness.
98|Does 10 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§-|Strikes Back:If Rocket's Hitmonchan ex is your Active Pokémon and is damaged by an opponent's attack (even if Rocket's Hitmonchan ex is Knocked Out), put 2 damage counters on the Attacking Pokémon.
99|Discard an Energy card attached to Rocket's Mewtwo ex, and then switch all damage counters on Rocket's Mewtwo ex with those on the Defending Pokémon. (If an effect of this attack is prevented, this attack does nothing.)§Flip a coin. If heads, the Defending Pokémon is now Asleep.§-|-
100|Search your discard pile for a Fire Energy card and attach it to 1 of your Pokémon.§-|Dark Lift:If Rocket's Moltres ex has any Darkness Energy attached to it, the Retreat Cost for Rocket's Moltres ex is 0.
101|You may discard an Energy card attached to Rocket's Scizor ex. If you do, search your discard pile for an Energy card (excluding the one you discarded) and attach it to Rocket's Scizor ex.|Dual Armor:As long as Rocket's Scizor ex has any Metal Energy attached to it, Rocket's Scizor ex is both Darkness and Metal type.
102|After your attack, you may switch Rocket's Scyther ex with 1 of your Benched Pokémon.§Rocket's Scyther ex can't use Slashing Strike during your next turn.|Dual Armor:As long as Rocket's Scyther ex has any Grass Energy attached to it, Rocket's Scyther ex is both Grass and Darkness type.
103|Before doing damage, you may switch 1 of your opponent's Benched Pokémon with the Defending Pokémon. If you do, this attack does 10 damage to the new Defending Pokémon. Your opponent chooses the Defending Pokémon to switch.§Does 30 damage plus 10 more damage for each of your Darkness Pokémon in play.|-
104|Flip a coin. If heads, the Defending Pokémon is now Poisoned.§Rocket's Snorlax ex is now Asleep.|Dark Healer:As long as Rocket's Snorlax ex has any Darkness Energy attached to it, remove 1 damage counter from Rocket's Snorlax ex between turns.
105|The Defending Pokémon is now Asleep.§If the Defending Pokémon is a Stage 2 Evolved Pokémon, this attack does 50 damage plus 40 more damage.|Dark and Clear:As long as Rocket's Suicune ex has any Darkness Energy attached to it, Rocket's Suicune ex can't be affected by any Special Conditions.
106|Search your discard pile for a Lightning Energy card and attach it to Rocket's Zapdos ex.§This attack does 30 damage to 1 of your Pokémon.|Darkness Guard:As long as Rocket's Zapdos ex has any Darkness Energy attached to it, damage done to Rocket's Zapdos ex by an opponent's attack is reduced by 10 (after applying Weakness and Resistance).
107|Flip a coin. If heads, discard an Energy card attached to the Defending Pokémon.§If your opponent has only 1 Prize card left, this attack does 20 damage plus 50 more damage and the Defending Pokémon is now Asleep.|-
108|Flip a coin. If tails, discard a Fire Energy card attached to Torchic Star.§If your opponent has only 1 Prize card left, this attack does 20 damage plus 50 more damage and the Defending Pokémon is now Confused.|-
109|-§If your opponent has only 1 Prize card left, this attack does 20 damage plus 50 more damage and the Defending Pokémon is now Poisoned.|-
110|If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, that attack does nothing.§Flip a coin. If tails, discard a Fire Energy card attached to Charmeleon.|-
111|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Each player plays with his or her Prize cards face up for the rest of the game.`;
const FIELDS=new Map(RAW.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const TEXT=new Map(PRINT.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const noop={type:'noop'},r=name=>({type:'neoRule',rule:'ex7:'+name});
// Three original 2004 copy attacks require actual copied-attack choices.
// An executable copyAttack also supports cards from the 2000 Team Rocket set.
const COPIED_ATTACKS=Object.freeze({
 '6:0':{type:'coinFlip',heads:{type:'copyAttack',source:'selfBench',allowedNamePrefix:'Dark '}}, // Dark Link: heads, a different Dark Pokemon in play
 '14:1':{type:'copyAttack',source:'opponentBench'},              // Rainbow Moves: opponent Bench only
 '50:1':{type:'coinFlip',heads:{type:'copyAttack',source:'opponentActive'}} // Mini-Metronome: heads
});
const EX=new Set([96,97,98,99,100,101,102,103,104,105,106]);
const TM=new Set([]),STADIUM=new Set([87,90]),TOOLS=new Set([]);
const DARK_DUAL=new Set([2,3,4,5,6,7,8,9,16,18,20,29,30,33,34,35,36,37,38,39,40,41,42]);
const ACTIVATE=new Set([3,4,9,15,21,24,25,31,37,45]);
// Castform's Temperamental Weather does not have a printed Special-Condition restriction.
const DISABLED_STATUS=new Set([3,4,9,15,21,24,25,31,37,45]);
function parse(n){
 const p=FIELDS.get(n);if(!p)throw new Error('Missing EX Team Rocket Returns '+n);
 const [_,name,kind,t,stage,hp,retreat,weak,resist,from,rarity,moves,printedPower]=p;
 const text=TEXT.get(n)||[],attackText=String(text[1]||'').split('§');
 const card={id:'ex7-'+n,setId:'ex7',number:String(n),name,kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy',source:'tcg',battleFormat:'classic',rarity,
  image:`https://images.pokemontcg.io/ex7/${n}.png`,imageLarge:`https://images.pokemontcg.io/ex7/${n}_hires.png`};
 const missing=[];
 if(kind==='P'){
   const attacks=(moves||'').split(';').filter(Boolean).map((str,i)=>{
     const [move,cost,printed='']=str.split('~'),original=attackText[i]==='-'?'':attackText[i]||'';
     const effect=COPIED_ATTACKS[n+':'+i]||(original?r(n+':'+i):noop);
     if(!fx.supportsEffect(effect))missing.push('Unsupported attack effect: '+move);
     return {name:move,cost,damage:/[×x]/.test(printed)?0:Number((printed.match(/^\d+/)||[])[0]||0),damageText:printed||null,text:original,effect};
   });
   const powerText=String(text[2]||'').split(':').slice(1).join(':');
   const abilities=printedPower?[{name:printedPower,type:ACTIVATE.has(n)?'activated':'passive',oncePerTurn:ACTIVATE.has(n)&&![15].includes(n),
      disabledByStatus:DISABLED_STATUS.has(n),benchOnly:false,printedPowerType:ACTIVATE.has(n)?'power':'body',text:powerText,effect:r('power:'+n)}]:[];
   if(abilities.some(a=>!fx.supportsEffect(a.effect)))missing.push('Unsupported ability');
   const isEx=EX.has(n);const isStar=rarity==='Rare Holo Star';if(isStar)card.pokemonStar=true;
   Object.assign(card,{stage:stage==='0'?'Basic':'Stage '+stage,types:(DARK_DUAL.has(n)?[T[t],'Darkness']:n===10?['Darkness','Metal']:[T[t]]),subtype:T[t],hp:Number(hp),retreat:Number(retreat||0),
     weakness:T[weak]||null,weaknessValue:weak?'×2':null,resistance:T[resist]||null,resistanceValue:resist?'-30':null,
     evolvesFrom:from||null,pokemonEx:isEx,isEx,prizeCards:isEx?2:1,attacks,abilities});
 }else if(kind==='E'){Object.assign(card,{subtype:'Colorless',types:['Colorless'],specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:n===94?{Darkness:1,Metal:1}:{Darkness:2}},text:String(text[3]||'')});
 }else{
   const trainerType=TOOLS.has(n)||TM.has(n)?'Tool':STADIUM.has(n)?'Stadium':[83,86,88,111].includes(n)?'Supporter':'Item';
   const attacks=(TM.has(n)||n===90)?(moves||'').split(';').filter(Boolean).map((str,i)=>{const [move,cost,printed='']=str.split('~');return {name:move,cost,damage:Number(printed||0),damageText:printed||null,text:attackText[i]==='-'?'':attackText[i]||'',effect:r(n+':'+i)};}):[];
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
 // Black Beam is an activated Poison power, not a printed attack.
 if(n===3)inflicts.add('poison');
 if(/^Dark |^Rocket's /.test(name))roles.add('rocket');
 if(rarity==='Rare Holo Star')roles.add('pokemon-star');
 if([94,95].includes(n)&&kind==='E')roles.add('energy');
 if(card.kind==='trainer'&&[87,90].includes(n))roles.add('dark-synergy');
 // The name-based Rocket family includes the 2000 Team Rocket expansion
 // (base5), not only the 2004 EX set. Do NOT conflate Dark with Darkness.
 const isRocketPokemon=card.kind==='pokemon'&&/^(?:Dark |Rocket's )/.test(name);
 const rocketRequired=card.kind==='trainer'&&[87,89,90].includes(n);
 const rocketPreferred=card.kind==='trainer'&&[88,91,92].includes(n);
 if(isRocketPokemon)roles.add('rocket-family');
 if(card.kind==='trainer'&&[83,86,88,111].includes(n))roles.add('draw');
 if(card.kind==='trainer'&&[87,90].includes(n))roles.add('stadium');
 if(card.kind==='trainer'&&[84,85,86,88,89,91,92].includes(n))roles.add('support');
 if(card.kind==='trainer'&&n===84)roles.add('recovery');
 // Do not recommend prize-reveal or self-discard cards as draw/disruption
 // engines. The original text matters more than a keyword scan here.
 if(kind==='T'){
   if(n===83){roles.delete('disruption');roles.add('draw');}
   if(n===84){roles.delete('draw');roles.delete('disruption');roles.add('recovery');roles.add('search');}
   if(n===87){roles.delete('disruption');roles.add('stall');}
   if(n===88){roles.delete('disruption');roles.add('draw');}
   if(n===90){roles.delete('disruption');roles.add('damage');}
   if(n===111){roles.delete('draw');roles.delete('disruption');roles.add('information');}
 }
 // Keep printed type separate from the Energy types actually needed for attacks.
 // Rocket-themed support receives a shared affiliation regardless of expansion.
 card.deckMeta=Object.freeze({roles:[...roles],inflicts:[...inflicts],payoffs:[...payoffs],energyTypes:[...energyTypes],stages:[...stages],
   ...(isRocketPokemon?{team:'rocket'}:{}),requiredTeams:rocketRequired?['rocket']:[],
   preferredTeams:rocketPreferred?['rocket']:[],
   // The two Rocket's ex Dual Armor cards have only Colorless attack costs,
   // but need these Basic Energy types to make their Bodies useful.
   preferredEnergyTypes:n===101?['Metal']:n===102?['Grass']:[],synergy:[]});
 return Object.freeze({...card,battleEnabled:missing.length===0,deckEligible:missing.length===0,support:{status:missing.length?'PARTIAL':'FULL',reasons:missing}});
}
const CARDS=Object.freeze(Array.from({length:111},(_,i)=>parse(i+1)));
const MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])})};
});
