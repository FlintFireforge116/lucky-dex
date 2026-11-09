/* EX FireRed & LeafGreen (ex6) — complete 116-card 2004 Classic TCG expansion.
 * Original print text and stats from PokemonTCG/pokemon-tcg-data cards/en/ex6.json.
 * The Classic battle rules use LuckyDex's single-Active and separate Energy Zone.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGFireRedLeafGreen=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ex6',name:'EX FireRed & LeafGreen',series:'EX',releaseDate:'2004-08-30',cardCount:116});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Beedrill|P|G|2|90||R||Kakuna|Rare Holo|Poison Sting~G~20;Link Needle~GCC~50+|
2|Butterfree|P|G|2|100||L|F|Metapod|Rare Holo|Whirlwind~CC~30;Gust~GCC~50|Sooth Dust
3|Dewgong|P|W|1|80|2|M||Seel|Rare Holo|Cold Breath~W~10;Aurora Beam~CCC~40|Safeguard
4|Ditto|P|C|0|60|1|F|||Rare Holo|Energy Ball~C~10+|Form Variation
5|Exeggutor|P|P|1|80|2|P||Exeggcute|Rare Holo|Psychic Exchange~C~;Big Eggsplosion~PC~40×|
6|Kangaskhan|P|C|0|80|2|F|||Rare Holo|Fetch~C~;Headbutt~CC~20;One-Two Punch~CCC~30+|
7|Marowak|P|F|1|80|1|G||Cubone|Rare Holo|Linear Attack~FC~;Vengeance~FCC~30+|
8|Nidoking|P|F|2|120|3|W||Nidorino|Rare Holo|Earth Poison~FC~40;Bound Crush~FFCC~|Power Gene
9|Nidoqueen|P|F|2|120|2|G||Nidorina|Rare Holo|Toxic~G~;Power Lariat~FCC~40+|Family Bonds
10|Pidgeot|P|C|2|100||L|F|Pidgeotto|Rare Holo|Clutch~CC~40|Quick Search
11|Poliwrath|P|W|2|120|2|L||Poliwhirl|Rare Holo|Split Spiral Punch~CC~20;Mega Throw~WCC~50+|Spiral
12|Raichu|P|L|1|80|1|F||Pikachu|Rare Holo|Recharge~C~;Thunder Reflection~LLC~50|
13|Rapidash|P|R|1|80|1|W||Ponyta|Rare Holo|Searing Flame~RC~10;Rear Kick~RCC~40|Fiery Aura
14|Slowbro|P|P|1|60|1|P||Slowpoke|Rare Holo|Psyshock~PC~30|Strange Behavior
15|Snorlax|P|C|0|90|3|F|||Rare Holo|Collapse~C~10;Toss and Turn~CCC~30+|Rest Up
16|Tauros|P|C|0|70|1|F|||Rare Holo|Knock Over~C~10;Rampage~CCC~20+|
17|Victreebel|P|G|2|110|2|R||Weepinbell|Rare Holo|Acid~GCC~50|Acid Sampler
18|Arcanine|P|R|1|90|2|W||Growlithe|Rare|Flare~R~20;Heat Tackle~RCCC~70|
19|Chansey|P|C|0|90|2|F|||Rare|Sing~C~;Egg Surprise~CCC~|
20|Cloyster|P|W|1|70|1|L||Shellder|Rare|Double Bubble~CC~10×;Shell Attack~WCC~50|Exoskeleton
21|Dodrio|P|C|1|70|1|L|F|Doduo|Rare|Tri Attack~CC~20×|Retreat Aid
22|Dugtrio|P|F|1|80|1|G||Diglett|Rare|Sonicboom~FC~30;Rumble~FCC~50|
23|Farfetch'd|P|C|0|70|1|L|F||Rare|Hoard~C~;Cross-Cut~C~10+|
24|Fearow|P|C|1|80|1|L|F|Spearow|Rare|Shot Air~CC~10;Drill Peck~CCC~50|Free Flight
25|Hypno|P|P|1|80|1|P||Drowzee|Rare|Hypnotic Ray~PC~20|Eerie Aura
26|Kingler|P|W|1|80|2|L||Krabby|Rare|Salt Water~C~;Hyper Pump~WC~30+|
27|Magneton|P|L|1|80|1|F|M|Magnemite|Rare|Thundershock~LC~20;Speed Shot~CCC~|
28|Primeape|P|F|1|70||P|||Rare|Toss~CC~30×;Low Kick~FC~40|
29|Scyther|P|G|0|60|1|R|||Rare|Fury Cutter~GC~10+|Leaf Ride
30|Tangela|P|G|0|60|1|R|W||Rare|Vine Tease~C~;Wiggle~G~|
31|Charmeleon|P|R|1|70|1|W||Charmander|Uncommon|Flare~RC~30;Damage Burn~RCC~40+|
32|Drowzee|P|P|0|50|1|P|||Uncommon|Hypnosis~C~;Ambush~P~10+|
33|Exeggcute|P|P|0|50|1|P|||Uncommon|Psybeam~P~10;Double Spin~CC~20×|
34|Haunter|P|P|1|70|1|D|F|Gastly|Uncommon|Confuse Ray~PC~20|Head Trip
35|Ivysaur|P|G|1|80|1|P||Bulbasaur|Uncommon|Poison Seed~C~;Razor Leaf~GGC~50|
36|Kakuna|P|G|1|70|2|R||Weedle|Uncommon|Headbutt~C~10|Poison Payback
37|Lickitung|P|C|0|80|2|F|||Uncommon|Lick~C~10;Tongue Whip~CC~|
38|Mankey|P|F|0|50|1|P|||Uncommon|Mischief~C~;Light Punch~FC~30|
39|Metapod|P|G|1|80|2|R||Caterpie|Uncommon|Sharpen~CC~20|Energy Protection
40|Nidorina|P|G|1|80|1|P||Nidoran ♀|Uncommon|Scratch~C~20;Fast Evolution~CC~|
41|Nidorino|P|G|1|70|1|P||Nidoran ♂|Uncommon|Double Stab~C~20×;Rend~CCC~30+|
42|Onix|P|F|0|80|3|W|||Uncommon|Rock Throw~F~10;Tunneling~FC~|
43|Parasect|P|G|1|70|1|R||Paras|Uncommon|Energy Powder~G~;Toxic Spore~GC~20|
44|Persian|P|C|1|80|1|F||Meowth|Uncommon|Poison Claws~C~;Shining Claws~CC~30|Thick Skin
45|Pidgeotto|P|C|1|70||L|F|Pidgey|Uncommon|Clutch~C~10;Cutting Wind~CC~30|
46|Poliwhirl|P|W|1|80|1|L||Poliwag|Uncommon|Energy Stream~C~10;Bubble~WC~20|
47|Porygon|P|C|0|50|1|F|||Uncommon|Data Retrieval~C~;Confuse Ray~CC~10|
48|Raticate|P|C|1|70||F||Rattata|Uncommon|Pickup~C~;Quick Attack~C~10+|Thick Skin
49|Venomoth|P|G|1|70||R||Venonat|Uncommon|Sleep Poison~G~;Razor Wind~CC~60|Protective Dust
50|Wartortle|P|W|1|80|2|L||Squirtle|Uncommon|Water Gun~W~20+;Smash Turn~WCC~40|
51|Weepinbell|P|G|1|70|1|R||Bellsprout|Uncommon|Razor Leaf~G~20;Corrosive Acid~CC~10|
52|Wigglytuff|P|C|1|80|1|F||Jigglypuff|Uncommon|Expand~CC~30|Assistance
53|Bellsprout|P|G|0|50|1|R|||Common|Vine Whip~G~10|
54|Bulbasaur|P|G|0|50|1|R|||Common|Sleep Poison~C~;Razor Leaf~CC~20|
55|Bulbasaur|P|G|0|50|1|P|||Common|Ram~C~10;Gouge~GC~20+|
56|Caterpie|P|G|0|50|1|R|||Common|Signs of Evolution~C~;String Shot~G~10|
57|Charmander|P|R|0|50|1|W|||Common|Singe~R~|
58|Charmander|P|R|0|50|1|W|||Common|Headbutt~C~10;Slash~CC~20|
59|Clefairy|P|C|0|50|1|F|||Common|Gesture~C~;Moon Kick~CC~20|
60|Cubone|P|F|0|50|1|G|||Common|Beat~C~10;Linear Attack~FC~|
61|Diglett|P|F|0|50|1|G|||Common|Dig Under~C~|
62|Doduo|P|C|0|40|1|L|F||Common|Run Around~C~;Random Peck~CC~10+|
63|Gastly|P|P|0|50|1|D|F||Common|Slow Trip Gas~C~|
64|Growlithe|P|R|0|60|2|W|||Common|Bite~C~10;Flame Tail~RCC~40|
65|Jigglypuff|P|C|0|50|1|F|||Common|Sleep Inducer~C~;Quick Blow~CC~10+|
66|Krabby|P|W|0|50|2|L|||Common|Irongrip~C~10;Nap~W~|
67|Magikarp|P|W|0|30|1|L|||Common|Surprise Attack~C~10;Ascension~WC~|
68|Magnemite|P|L|0|50|1|F|M||Common|Supersonic~C~;Speed Ball~LC~20|
69|Meowth|P|C|0|50|1|F|||Common|Collect~C~;Cat Kick~CC~20|
70|Nidoran ♀|P|G|0|50|1|P|||Common|Look for Friends~C~;Bite~CC~20|
71|Nidoran ♂|P|G|0|50|1|P|||Common|Call for Family~C~;Double Stab~C~10×|
72|Paras|P|G|0|50|1|R|||Common|Call for Family~C~;Toxic Spore~G~10|
73|Pidgey|P|C|0|50|1|L|F||Common|Corner~C~;Gust~CC~20|
74|Pikachu|P|L|0|50|1|F|||Common|Plasma~C~10|
75|Poliwag|P|W|0|50|1|L|||Common|Spiral Attack~C~;Tail Whap~CC~20|
76|Ponyta|P|R|0|50|1|W|||Common|Stomp~CC~20+|
77|Rattata|P|C|0|40|1|F|||Common|Collect~C~;Scratch~C~10|
78|Seel|P|W|0|50|1|L|||Common|Horn Hazard~W~30|
79|Shellder|P|W|0|50|1|L|||Common|Minimize~C~;Wave Splash~W~10|
80|Slowpoke|P|P|0|50|1|P|||Common|Confusion Wave~C~|
81|Spearow|P|C|0|50|1|L|F||Common|Claw~C~10;Wing Attack~CC~20|
82|Squirtle|P|W|0|50|1|L|||Common|Sleepy Ball~W~10|
83|Squirtle|P|W|0|50|1|L|||Common|Bubble~C~;Smash Turn~WC~20|
84|Venonat|P|G|0|50|1|R|||Common|Psycho Waves~C~;Bite~G~10|
85|Voltorb|P|L|0|50|1|F|||Common|Thundershock~LC~20|Floating Electrons
86|Weedle|P|G|0|50|1|R|||Common|Call for Family~C~;Poison Spurt~G~|
87|Bill's Maintenance|T||0||||||Uncommon||
88|Celio's Network|T||0||||||Uncommon||
89|Energy Removal 2|T||0||||||Uncommon||
90|Energy Switch|T||0||||||Uncommon||
91|EXP.ALL|T||0||||||Uncommon||
92|Great Ball|T||0||||||Uncommon||
93|Life Herb|T||0||||||Uncommon||
94|Mt. Moon|T||0||||||Uncommon||
95|Poké Ball|T||0||||||Uncommon||
96|PokéDex HANDY909|T||0||||||Uncommon||
97|Pokémon Reversal|T||0||||||Uncommon||
98|Prof. Oak's Research|T||0||||||Uncommon||
99|Super Scoop Up|T||0||||||Uncommon||
100|VS Seeker|T||0||||||Uncommon||
101|Potion|T||0||||||Common||
102|Switch|T||0||||||Common||
103|Multi Energy|E||0||||||Rare||
104|Blastoise ex|P|W|2|150|3|L||Wartortle|Rare Holo EX|Hyper Whirlpool~WWWC~80|Energy Rain
105|Charizard ex|P|R|2|160|2|W||Charmeleon|Rare Holo EX|Slash~CCC~50;Burn Down~RRRRR~200|Energy Flame
106|Clefable ex|P|C|2|100|2|F||Clefairy|Rare Holo EX|Metronome~CC~;Moon Impact~CC~40|
107|Electrode ex|P|L|1|90|1|F||Voltorb|Rare Holo EX|Crush and Burn~LC~30+|Extra Energy Bomb
108|Gengar ex|P|P|2|150|2|P|F|Haunter|Rare Holo EX|Poltergeist~PC~40+;Prize Count~PPC~60+|
109|Gyarados ex|P|W|1|130|3|L||Magikarp|Rare Holo EX|Twister~WC~40;Dragon Rage~WWCCC~100|
110|Mr. Mime ex|P|P|0|80|1||||Rare Holo EX|Breakdown~PC~|Magic Odds
111|Mr. Mime ex|P|P|0|80|1||||Rare Holo EX|Breakdown~PC~|Magic Evens
112|Venusaur ex|P|G|2|150|3|P||Ivysaur|Rare Holo EX|Pollen Hazard~GCC~20;Solarbeam~GGGCC~90|Energy Trans
113|Charmander|P|R|0|50|1|W|||Rare Secret|Flare~R~10;Rage~CC~10+|
114|Articuno ex|P|W|0|110|2|M|||Rare Secret|Cold Crush~WWC~50|Legendary Ascent
115|Moltres ex|P|R|0|110|2|W|||Rare Secret|Crushing Flames~RRC~60|Legendary Ascent
116|Zapdos ex|P|L|0|110|2|L|||Rare Secret|Electron Crush~LLC~50+|Legendary Ascent`;
const PRINT=`1|The Defending Pokémon is now Poisoned.§This attack does 50 damage plus 30 more damage for each Beedrill (excluding this one) you have in play.|-
2|Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.§-|Sooth Dust:As long as Butterfree is your Active Pokémon, remove 1 damage counter from each of your Pokémon between turns.
3|The Defending Pokémon is now Asleep.§-|Safeguard:Prevent all effects of attacks, including damage, done to Dewgong by your opponent's Pokémon-ex.
4|Does 10 damage plus 10 more damage for each Energy attached to Ditto but not used to pay for this attack's Energy cost. You can't add more then 20 damage in this way.|Form Variation:Once during your turn (before your attack), you may search your discard pile for a Basic Pokémon (excluding Pokémon-ex and Ditto) and switch it with Ditto. (Any cards attached to Ditto, damage counters, Special Conditions, and effects on it are now on the new Pokémon.) Place Ditto in the discard pile.
5|Shuffle your hand into your deck. Draw up to 8 cards.§Flip a coin for each Energy attached to Exeggutor. This attack does 40 damage times the number of heads.|-
6|Draw a card.§-§Flip a coin. If heads, this attack does 30 damage plus 20 more damage.|-
7|Choose 1 of your opponent's Pokémon. This attack does 30 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§Does 30 damage plus 10 more damage for each Basic Pokémon and each Evolution card in your discard pile. You can't add more than 60 damage in this way.|-
8|If the Defending Pokémon already has any damage counters on it, the Defending Pokémon is now Poisoned.§Choose 1 of your opponent's Pokémon. This attack does 60 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.) Nidoking can't use Bound Crush during your next turn.|Power Gene:As long as Nidoking is in play, your attacks by Nidoran ♀, Nidorina, Nidoqueen, Nidoran ♂, and Nidorino do 10 more damage to the Defending Pokémon.
9|The Defending Pokémon is now Poisoned. Put 2 damage counters instead of 1 on the Defending Pokémon between turns.§Does 40 damage plus 10 more damage for each Evolved Pokémon you have in play.|Family Bonds:As long as Nidoqueen is in play, the Retreat Cost for Nidoran ♀, Nidorina, Nidoran ♂, Nidorino and Nidoking is 0.
10|The Defending Pokémon can't retreat until the end of your opponent's next turn.|Quick Search:Once during your turn (before your attack), you may choose any 1 card from your deck and put it into your hand. Shuffle your deck afterward. You can't use more than 1 Quick Search Poké-Power each turn. This power can't be used if Pidgeot is affected by a Special Condition.
11|The Defending Pokémon is now Confused.§If the Defending Pokémon is Pokémon-ex, this attack does 50 damage plus 30 more damage.|Spiral:As long as Poliwrath is your Active Pokémon, your opponent's Confused Pokémon can't retreat.
12|Search your deck for up to 2 Lightning Energy cards and attach them to Raichu. Shuffle your deck afterward.§You may move any number of Lightning Energy cards attached to Raichu to another of your Pokémon.|-
13|The Defending Pokémon is now Burned.§-|Fiery Aura:As long as Rapidash is your Active Pokémon, put 4 damage counters instead of 2 on Burned Pokémon between turns.
14|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|Strange Behavior:As often as you like during your turn (before your attack), you may move 1 damage counter from 1 of your Pokémon to Slowbro as long as you don't Knock Out Slowbro. This power can't be used if Slowbro is affected by a Special Condition.
15|Snorlax is now Asleep.§If Snorlax is Asleep, this attack does 30 damage plus 30 more damage. (This attack can be used even if Snorlax is Asleep.)|Rest Up:If Snorlax remains Asleep between turns, remove 2 damage counters from Snorlax (remove 1 if there is only 1).
16|You may discard any Stadium card in play.§Does 20 damage plus 10 more damage for each damage counter on Tauros. After doing damage, flip a coin. If tails, Tauros is now Confused.|-
17|The Defending Pokémon can't retreat until the end of your opponent's next turn.|Acid Sampler:As long as Victreebel is your Active Pokémon, put 1 damage counter on each Defending Pokémon between turns. Acid Sampler stops working if your other Active Pokémon is not a Victreebel.
18|-§Arcanine does 10 damage to itself.|-
19|The Defending Pokémon is now Asleep.§Flip a coin. If heads, Chansey does 50 damage to the Defending Pokémon. If tails, remove 5 damage counters from Chansey. (All if there are less than 5.)|-
20|Flip 2 coins. This attack does 10 damage times the number of heads. If either of the coins is heads, the Defending Pokémon is now Paralyzed.§-|Exoskeleton:Any damage done to Cloyster by attacks is reduced by 20 (after applying Weakness and Resistance).
21|Flip 3 coins. This attack does 20 damage times the number of heads.|Retreat Aid:As long as Dodrio is on your Bench, you pay ColorlessColorless less to retreat your Active Pokémon (excluding Pokémon-ex and Baby Pokémon.)
22|This attack's damage isn't affected by Weakness or Resistance.§The Defending Pokémon can't retreat until the end of your opponent's next turn.|-
23|Search your deck for up to 2 Pokémon Tool cards and attach them to any of your Pokémon (excluding Pokémon that already have a Pokémon Tool attached to them). Shuffle your deck afterward.§If the Defending Pokémon is an Evolved Pokémon, this attack does 10 damage plus 20 more damage.|-
24|Does 20 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)§-|Free Flight:If Fearow has no Energy attached to it, Fearow's Retreat Cost is 0.
25|The Defending Pokémon is now Asleep.|Eerie Aura:As long as Hypno is your Active Pokémon, put 2 damage counters on each Pokémon that remains Asleep between turns.
26|Search your deck for up to 2 Water Energy cards and attach them to Kingler. Shuffle your deck afterward.§Does 30 damage plus 20 more damage for each basic Energy attached to Kingler but not used to pay for this attack's Energy cost. You can't add more than 40 damage in this way.|-
27|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§Choose 1 of your opponent's Pokémon. This attack does 40 damage to that Pokémon. This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, or any other effects on that Pokémon.|-
28|You may discard from your hand as many Technical Machine and Pokémon Tool cards as you like. This attack does 30 damage times the number of cards you discarded.§-|-
29|Flip 3 coins. If 1 of them is heads, this attack does 10 damage plus 10 more damage. If 2 of them are heads, this attack does 10 damage plus 20 more damage. If all of them are heads, this attack does 10 damage plus 40 more damage.|Leaf Ride:If Scyther has any Energy attached to it, Scyther's Retreat Cost is 0.
30|Look at your Prize cards without showing your opponent. Choose 1 of the Prize cards and switch it with the top card of your deck without looking at the top card of your deck. If you have no cards in your deck, this attack does nothing.§Flip a coin. If heads, the Defending Pokémon is now Confused. If tails, the Defending Pokémon is now Poisoned.|-
31|-§If the Defending Pokémon already has any damage counters on it, this attack does 40 damage plus 20 more damage.|-
32|The Defending Pokémon is now Asleep.§Flip a coin. If heads, this attack does 10 damage plus 10 more damage.|-
33|Flip a coin. If heads, the Defending Pokémon is now Confused.§Flip 2 coins. This attack does 20 damage times the number of heads.|-
34|Flip a coin. If heads, the Defending Pokémon is now Confused.|Head Trip:Once during your turn (before your attack), if Haunter is on your Bench, you may use this power. One of your Active Pokémon is now Confused.
35|The Defending Pokémon is now Poisoned.§-|-
36|-|Poison Payback:If Kakuna is your Active Pokémon and is damaged by an opponent's attack (even if Kakuna is Knocked Out), the Attacking Pokémon is now Poisoned.
37|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
38|Shuffle your opponent's deck.§-|-
39|-|Energy Protection:Any damage done to Metapod by attacks is reduced by 10 for each Energy attached to Metapod. You can't reduce more than 30 damage in this way.
40|-§Search your deck for up to 2 Evolution cards, show them to your opponent, and put them into your hand. Shuffle your deck afterward.|-
41|Flip 2 coins. This attack does 20 damage times the number of heads.§If the Defending Pokémon already has any damage counters on it, this attack does 30 damage plus 30 more damage.|-
42|-§Choose up to 2 of your opponent's Benched Pokémon. This attack does 10 damage to each of them. (Don't apply Weakness and Resistance for Benched Pokémon.) Onix can't attack during your next turn.|-
43|Search your deck for up to 2 basic Energy cards and attach them to any of your Pokémon (excluding Pokémon-ex) in any way you like. Shuffle your deck afterward.§The Defending Pokémon is now Poisoned.|-
44|The Defending Pokémon is now Poisoned.§The Defending Pokémon is now Confused.|Thick Skin:Persian can't be affected by any Special Conditions.
45|The Defending Pokémon can't retreat until the end of your opponent's next turn.§-|-
46|Search your discard pile for a basic Energy card and attach it to Poliwhirl.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
47|If you have less than 4 cards in your hand, draw cards until you have 4 cards in your hand.§The Defending Pokémon is now Confused.|-
48|Search your discard pile for a Basic Pokémon (or Evolution card), a Trainer card, and an Energy card. Show them to your opponent and put them into your hand.§Flip a coin. If heads, this attack does 10 damage plus 40 more damage.|Thick Skin:Raticate can't be affected by any Special Conditions.
49|The Defending Pokémon is now Asleep and Poisoned.§Flip a coin. If tails, this attack does nothing.|Protective Dust:Prevent all effects of attacks, except damage, done to Venomoth by the Attacking Pokémon.
50|Does 20 damage plus 10 more damage for each Water Energy attached to Wartortle but not used to pay for this attack's Energy cost. You can't add more than 20 damage in this way.§After your attack, you may switch Wartortle with 1 of your Benched Pokémon.|-
51|-§The Defending Pokémon is now Burned.|-
52|During your opponent's next turn, any damage done to Wigglytuff by attacks is reduced by 10 (after applying Weakness and Resistance).|Assistance:Once during your turn (before your attack), if Wigglytuff is on your Bench, you may choose 1 of your Active Pokémon and remove 1 Special Condition from it.
53|-|-
54|Flip a coin. If heads, the Defending Pokémon is now Asleep and Poisoned.§-|-
55|-§Flip a coin. If heads, this attack does 20 damage plus 10 more damage.|-
56|Search your deck for a Metapod and a Butterfree card, show them to your opponent, and put them into your hand. Shuffle your deck afterward.§Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|-
57|The Defending Pokémon is now Burned.|-
58|-§-|-
59|Choose 1 of your opponent's Benched Pokémon and switch it with the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch.§-|-
60|-§Choose 1 of your opponent's Pokémon. This attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)|-
61|Choose 1 of your opponent's Pokémon. This attack does 10 damage to that Pokémon. This attack's damage isn't affected by Weakness or Resistance.|-
62|Switch Doduo with 1 of your Benched Pokémon.§Flip 2 coins. This attack does 10 damage plus 10 more damage for each heads.|-
63|At the end of your opponent's next turn, the Defending Pokémon is now Confused.|-
64|-§-|-
65|Switch 1 of your opponent's Benched Pokémon with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch. The new Defending Pokémon is now Asleep.§Flip a coin. If heads, this attack does 10 damage plus 20 more damage.|-
66|-§Remove 2 damage counters from Krabby (remove 1 if there is only 1).|-
67|Flip a coin. If tails, this attack does nothing.§Search your deck for a card that evolves from Magikarp and put it on Magikarp. (This counts as evolving Magikarp.) Shuffle your deck afterward.|-
68|Flip a coin. If heads, the Defending Pokémon is now Confused.§-|-
69|Draw a card.§-|-
70|Reveal cards from your deck until you reveal a Basic Pokémon. Show that card to your opponent and put it into your hand. Shuffle the other revealed cards into your deck. (If you don't reveal a Basic Pokémon, shuffle all the revealed cards back into your deck.)§-|-
71|Search your deck for a Nidoran ♀ or Nidoran ♂ card and put it onto your Bench. Shuffle your deck afterward.§Flip 2 coins. This attack does 10 damage times the number of heads.|-
72|Search your deck for up to 2 Basic Pokémon and put them onto your Bench. Shuffle your deck afterward.§Flip a coin. If heads, the Defending Pokémon is now Poisoned.|-
73|The Defending Pokémon can't retreat until the end of your opponent's next turn.§-|-
74|Flip a coin. If heads, search your discard pile for a Lightning Energy card and attach it to Pikachu.|-
75|Flip a coin. If heads, the Defending Pokémon is now Confused.§-|-
76|Flip a coin. If heads, this attack does 20 damage plus 10 more damage.|-
77|Draw a card.§-|-
78|Flip a coin. If tails, this attack does nothing.|-
79|During your opponent's next turn, any damage done to Shellder by attacks is reduced by 20 (after applying Weakness and Resistance).§-|-
80|Both Slowpoke and the Defending Pokémon are now Confused.|-
81|Flip a coin. If tails, this attack does nothing.§-|-
82|Flip a coin. If heads, the Defending Pokémon is now Asleep.|-
83|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.§After your attack, you may switch Squirtle with 1 of your Benched Pokémon.|-
84|Discard an Energy card attached to Venonat. The Defending Pokémon is now Confused.§-|-
85|Flip a coin. If heads, the Defending Pokémon is now Paralyzed.|Floating Electrons:As long as Voltorb has any Energy attached to it, Voltorb's Retreat Cost is 0.
86|Search your deck for up to 2 Grass Basic Pokémon and put them onto your Bench. Shuffle your deck afterward.§Discard a Grass Energy card attached to Weedle. The Defending Pokémon is now Poisoned.|-
87|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § If you have any cards in your hand, shuffle 1 of them into your deck, then draw 3 cards.
88|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Search your deck for a Basic Pokémon or Evolution card (excluding Pokémon-ex), show it to your opponent, and put it into your hand. Shuffle your deck afterward.
89|-|-|Flip a coin. If heads, choose 1 Energy card attached to 1 of your opponent's Pokémon and discard it.
90|-|-|Move a basic Energy card attached to 1 of your Pokémon to another of your Pokémon.
91|-|-|Attach EXP. ALL to 1 of your Pokémon (excluding Pokémon-ex and Pokémon that has an owner in its name) that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card. § During your opponent's turn, if 1 of your Active Pokémon is Knocked Out by your opponent's attack, you may take 1 basic Energy card attached to that Knocked Out Pokémon and attach it to the Pokémon with EXP.ALL attached to it. If you do, discard EXP.ALL.
92|-|-|Search your deck for a Basic Pokémon (excluding Pokémon-ex) and put it onto your Bench. Shuffle your deck afterward.
93|-|-|Flip a coin. If heads, choose 1 of your Pokémon (excluding Pokémon-ex), and remove all Special Conditions and 6 damage counters from that Pokémon (all if there are less than 6).
94|-|-|This card stays in play when you play it. Discard this card if another Stadium card comes into play. § Any Pokémon (both yours and your opponent's) with maximum HP less than 70 can't use any Poké-Powers.
95|-|-|Flip a coin. If heads, search your deck for a Basic Pokémon or Evolution card, show it to your opponent and put it into your hand. Shuffle your deck afterward.
96|-|-|Shuffle your deck. Look at 6 cards from the top of your deck, then put them back on top of your deck in any order.
97|-|-|Flip a coin. If heads, choose 1 of your opponent's Benched Pokémon and switch it with 1 of the Defending Pokémon. Your opponent chooses the Defending Pokémon to switch.
98|-|-|You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card. § Shuffle your hand into your deck, then draw 5 cards.
99|-|-|Flip a coin. If heads, return 1 of your Pokémon and all cards attached to it to your hand.
100|-|-|Search your discard pile for a Supporter card, show it to your opponent, and put it into your hand.
101|-|-|Remove 2 damage counters from 1 of your Pokémon (remove 1 damage counter if that Pokémon has only 1).
102|-|-|Switch 1 of your Active Pokémon with 1 of your Benched Pokémon.
103|-|-|Attach Multi Energy to 1 of your Pokémon. While in play, Multi Energy provides every type of Energy but provides only 1 Energy at a time. (Doesn't count as a basic Energy card when not in play.) Multi Energy provides Colorless Energy when attached to a Pokémon that already has Special Energy cards attached to it.
104|Flip a coin until you get tails. For each heads, your opponent discards an Energy card attached to the Defending Pokémon.|Energy Rain:As often as you like during your turn (before your attack), you may attach a Water Energy card from your hand to 1 of your Pokémon. Put 1 damage counter on that Pokémon. This power can't be used if Blastoise ex is affected by a Special Condition.
105|-§Discard 5 Fire Energy attached to Charizard ex. This attack's damage isn't affected by Weakness, Resistance, Poké-Powers, Poké-Bodies, and any other effects on the Defending Pokémon.|Energy Flame:All Energy attached to Charizard ex are Fire Energy instead of its usual type.
106|Choose 1 of the Defending Pokémon's attacks. Metronome copies that attack except for its Energy cost. (You must still do anything else in order to use that attack.) (No matter what type that Pokémon is, Clefable ex's type is still Colorless.) Clefable ex performs that attack.§-|-
107|You may discard as many Energy as you like attached to your Pokémon in play. If you do, this attack does 30 damage plus 20 more damage for each Energy you discarded.|Extra Energy Bomb:Once during your turn (before your attack), you may discard Electrode ex and all the cards attached to it (this counts as Knocking Out Electrode ex). If you do, search your discard pile for 5 Energy cards and attach them to any of your Pokémon (excluding Pokémon-ex) in any way you like. This power can't be used if Electrode ex is affected by a Special Condition.
108|Look at your opponent's hand. This attack does 40 damage plus 10 more damage for each Trainer card in your opponent's hand.§If you have more Prize cards left than your opponent, this attack does 60 damage plus 40 more damage.|-
109|Flip 2 coins. For each heads, choose 1 Energy attached to the Defending Pokémon, if any, and discard it. If both are tails, this attack does nothing.§-|-
110|Count the number of cards in your opponent's hand. Put that many damage counters on the Defending Pokémon.|Magic Odds:If Mr. Mime ex would be damaged by an attack, prevent that attack's damage done to Mr. Mime ex if that damage is 10, 30, 50, 70, 90, 110, 130, 150, or 170.
111|Count the number of cards in your opponent's hand. Put that many damage counters on the Defending Pokémon.|Magic Evens:If Mr. Mime ex would be damaged by an attack, prevent that attack's damage done to Mr. Mime ex if that damage is 20, 40, 60, 80, 100, 120, 140, 160, or 180.
112|The Defending Pokémon is now Poisoned, Burned, and Confused.§-|Energy Trans:As often as you like during your turn (before your attack), move a Grass Energy card attached to 1 of your Pokémon to another of your Pokémon. This power can't be used if Venusaur ex is affected by a Special Condition.
113|-§Does 10 damage plus 10 more damage for each damage counter on Charmander.|-
114|You may discard an Energy card attached to Articuno ex. If you do, your opponent discards an Energy card attached to the Defending Pokémon.|Legendary Ascent:Once during your turn, when you put Articuno ex from your hand onto your Bench, you may switch 1 of your Active Pokémon with Articuno ex. If you do, you may also move any number of basic Water Energy cards attached to your Pokémon to Articuno ex.
115|You may discard an Energy card attached to Moltres ex. If you do, the Defending Pokémon is now Confused.|Legendary Ascent:Once during your turn, when you put Moltres ex from your hand onto your Bench, you may switch 1 of your Active Pokémon with Moltres ex. If you do, you may also move any number of basic Fire Energy cards attached to your Pokémon to Moltres ex.
116|You may discard an Energy card attached to Zapdos ex. If you do, this attack does 50 damage plus 20 more damage.|Legendary Ascent:Once during your turn, when you put Zapdos ex from your hand onto your Bench, you may switch 1 of your Active Pokémon with Zapdos ex. If you do, you may also move any number of basic Lightning Energy cards attached to your Pokémon to Zapdos ex.`;
const FIELDS=new Map(RAW.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const TEXT=new Map(PRINT.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
const noop={type:'noop'},r=name=>({type:'neoRule',rule:'ex6:'+name});
const EX=new Set([104,105,106,107,108,109,110,111,112,114,115,116]);
const TM=new Set([]),STADIUM=new Set([94]),TOOLS=new Set([91]);
const ACTIVATE=new Set([4,10,14,34,52,104,107,112]);
// Castform's Temperamental Weather does not have a printed Special-Condition restriction.
const DISABLED_STATUS=new Set([4,10,14,34,104,107,112]);
function parse(n){
 const p=FIELDS.get(n);if(!p)throw new Error('Missing EX FireRed & LeafGreen '+n);
 const [_,name,kind,t,stage,hp,retreat,weak,resist,from,rarity,moves,printedPower]=p;
 const text=TEXT.get(n)||[],attackText=String(text[1]||'').split('§');
 const card={id:'ex6-'+n,setId:'ex6',number:String(n),name,kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy',source:'tcg',battleFormat:'classic',rarity,
  image:`https://images.pokemontcg.io/ex6/${n}.png`,imageLarge:`https://images.pokemontcg.io/ex6/${n}_hires.png`};
 const missing=[];
 if(kind==='P'){
   const attacks=(moves||'').split(';').filter(Boolean).map((str,i)=>{
     const [move,cost,printed='']=str.split('~'),original=attackText[i]==='-'?'':attackText[i]||'';
     const effect=n===106&&i===0?{type:'copyAttack',source:'opponentActive'}:(original?r(n+':'+i):noop);
     if(!fx.supportsEffect(effect))missing.push('Unsupported attack effect: '+move);
     return {name:move,cost,damage:/[×x]/.test(printed)?0:Number((printed.match(/^\d+/)||[])[0]||0),damageText:printed||null,text:original,effect};
   });
   const powerText=String(text[2]||'').split(':').slice(1).join(':');
   const abilities=printedPower?[{name:printedPower,type:ACTIVATE.has(n)?'activated':'passive',oncePerTurn:ACTIVATE.has(n)&&![4,14,104,112].includes(n),
      disabledByStatus:DISABLED_STATUS.has(n),printedPowerType:ACTIVATE.has(n)?'power':'body',text:powerText,effect:r('power:'+n)}]:[];
   if(abilities.some(a=>!fx.supportsEffect(a.effect)))missing.push('Unsupported ability');
   const isEx=EX.has(n);if(isEx&&rarity==='Rare Secret')card.exRarity='Rare Holo EX';
   Object.assign(card,{stage:stage==='0'?'Basic':'Stage '+stage,types:[T[t]],subtype:T[t],hp:Number(hp),retreat:Number(retreat||0),
     weakness:T[weak]||null,weaknessValue:weak?'×2':null,resistance:T[resist]||null,resistanceValue:resist?'-30':null,
     evolvesFrom:from||null,pokemonEx:isEx,isEx,prizeCards:isEx?2:1,attacks,abilities});
 }else if(kind==='E'){Object.assign(card,{subtype:'Colorless',types:['Colorless'],specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Colorless:1}},text:String(text[3]||'')});
 }else{
   const trainerType=TOOLS.has(n)||TM.has(n)?'Tool':STADIUM.has(n)?'Stadium':[87,88,98].includes(n)?'Supporter':'Item';
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
 if(card.id==='ex6-103')roles.add('energy');
 if(card.id==='ex6-91')roles.add('energy');
 if(card.kind==='trainer'&&[87,98].includes(n))roles.add('draw');
 if(card.kind==='trainer'&&n===94)roles.add('stadium');
 if(card.kind==='trainer'&&[87,88,90,91,92,95,96,100].includes(n))roles.add('support');
 if(card.kind==='trainer'&&[93,101].includes(n))roles.add('healing');
 card.deckMeta=Object.freeze({roles:[...roles],inflicts:[...inflicts],payoffs:[...payoffs],energyTypes:[...energyTypes],stages:[...stages],synergy:[]});
 return Object.freeze({...card,battleEnabled:missing.length===0,deckEligible:missing.length===0,support:{status:missing.length?'PARTIAL':'FULL',reasons:missing}});
}
const CARDS=Object.freeze(Array.from({length:116},(_,i)=>parse(i+1)));
const MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>[c.id,c.support.reasons])})};
});
