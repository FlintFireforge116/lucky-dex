/* Gym Challenge / gym2 (132 numbered original prints).
 * Pokémon TCG source: PokemonTCG/pokemon-tcg-data (gym2.json).
 * Each battle-enabled card must have its complete printed attacks and Powers.
 * Unsupported printed mechanics remain visible but cannot enter Classic decks.
 */
(function(root,factory){const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexClassicTCGGymChallenge=api;})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'gym2',name:'Gym Challenge',series:'Gym',releaseDate:'2000-10-16',cardCount:132});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless'};
// Gym Challenge's printed Basic Energy rows have no type column; resolve their
// identity by collector number before a generated card is attached from hand.
const BASIC_ENERGY_TYPES={127:'Fighting',128:'Fire',129:'Grass',130:'Lightning',131:'Psychic',132:'Water'};
const DATA=`
1|Blaine's Arcanine|R|1|90|3|W||Blaine's Growlithe|Rare Holo
2|Blaine's Charizard|R|2|100|3|W|F|Blaine's Charmeleon|Rare Holo
3|Brock's Ninetales|R|1|70|1|W||Brock's Vulpix|Rare Holo
4|Erika's Venusaur|G|2|90|2|R||Erika's Ivysaur|Rare Holo
5|Giovanni's Gyarados|W|1|90|3|G|F|Giovanni's Magikarp|Rare Holo
6|Giovanni's Machamp|F|2|100|3|P||Giovanni's Machoke|Rare Holo
7|Giovanni's Nidoking|G|2|120|3|P||Giovanni's Nidorino|Rare Holo
8|Giovanni's Persian|C|1|60|0|F|P|Giovanni's Meowth|Rare Holo
9|Koga's Beedrill|G|2|80|0|R|F|Koga's Kakuna|Rare Holo
10|Koga's Ditto|C|0|40|1|F|P||Rare Holo
11|Lt. Surge's Raichu|L|1|80|2|F||Lt. Surge's Pikachu|Rare Holo
12|Misty's Golduck|W|1|70|1|G||Misty's Psyduck|Rare Holo
13|Misty's Gyarados|W|1|100|3|G|F|Misty's Magikarp|Rare Holo
14|Rocket's Mewtwo|P|0|70|2|P|||Rare Holo
15|Rocket's Zapdos|L|0|70|2||F||Rare Holo
16|Sabrina's Alakazam|P|2|80|3|P||Sabrina's Kadabra|Rare Holo
17|Blaine||||0||||Rare Holo
18|Giovanni||||0||||Rare Holo
19|Koga||||0||||Rare Holo
20|Sabrina||||0||||Rare Holo
21|Blaine's Ninetales|R|1|60|2|W||Blaine's Vulpix|Rare
22|Brock's Dugtrio|F|1|60|1|G|L|Brock's Diglett|Rare
23|Giovanni's Nidoqueen|G|2|100|3|P||Giovanni's Nidorina|Rare
24|Giovanni's Pinsir|G|0|70|2|R|||Rare
25|Koga's Arbok|G|1|90|2|P||Koga's Ekans|Rare
26|Koga's Muk|G|1|80|3|P||Koga's Grimer|Rare
27|Koga's Pidgeotto|C|1|60|0|L|F|Koga's Pidgey|Rare
28|Lt. Surge's Jolteon|L|1|70|1|F||Lt. Surge's Eevee|Rare
29|Sabrina's Gengar|P|2|90|2||F|Sabrina's Haunter|Rare
30|Sabrina's Golduck|W|1|70|2|L||Sabrina's Psyduck|Rare
31|Blaine's Charmeleon|R|1|70|2|W||Blaine's Charmander|Uncommon
32|Blaine's Dodrio|C|1|70|1|L|F|Blaine's Doduo|Uncommon
33|Blaine's Rapidash|R|1|70|0|W||Blaine's Ponyta|Uncommon
34|Brock's Graveler|F|1|70|2|G||Brock's Geodude|Uncommon
35|Brock's Primeape|F|1|70|1|P||Brock's Mankey|Uncommon
36|Brock's Sandslash|F|1|70|1|G|L|Brock's Sandshrew|Uncommon
37|Brock's Vulpix|R|0|50|1|W|||Uncommon
38|Erika's Bellsprout|G|0|40|1|R|||Uncommon
39|Erika's Bulbasaur|G|0|50|1|R|||Uncommon
40|Erika's Clefairy|C|0|50|1|F|P||Uncommon
41|Erika's Ivysaur|G|1|60|2|R||Erika's Bulbasaur|Uncommon
42|Giovanni's Machoke|F|1|80|2|P||Giovanni's Machop|Uncommon
43|Giovanni's Meowth|C|0|40|1|F|P||Uncommon
44|Giovanni's Nidorina|G|1|80|2|P||Giovanni's Nidoran ♀|Uncommon
45|Giovanni's Nidorino|G|1|70|2|P||Giovanni's Nidoran ♂|Uncommon
46|Koga's Golbat|G|1|60|0|P|F|Koga's Zubat|Uncommon
47|Koga's Kakuna|G|1|70|2|R||Koga's Weedle|Uncommon
48|Koga's Koffing|G|0|50|1|P|||Uncommon
49|Koga's Pidgey|C|0|40|1|L|F||Uncommon
50|Koga's Weezing|G|1|70|2|P||Koga's Koffing|Uncommon
51|Lt. Surge's Eevee|C|0|40|1|F|P||Uncommon
52|Lt. Surge's Electrode|L|1|70|2|F||Lt. Surge's Voltorb|Uncommon
53|Lt. Surge's Raticate|C|1|60|1|F|P|Lt. Surge's Rattata|Uncommon
54|Misty's Dewgong|W|1|80|2|L||Misty's Seel|Uncommon
55|Sabrina's Haunter|P|1|70|0||F|Sabrina's Gastly|Uncommon
56|Sabrina's Hypno|P|1|70|2|P||Sabrina's Drowzee|Uncommon
57|Sabrina's Jynx|P|0|60|1|P|||Uncommon
58|Sabrina's Kadabra|P|1|70|1|P||Sabrina's Abra|Uncommon
59|Sabrina's Mr. Mime|P|0|60|1|P|||Uncommon
60|Blaine's Charmander|R|0|50|1|W|||Common
61|Blaine's Doduo|C|0|50|0|L|F||Common
62|Blaine's Growlithe|R|0|60|1|W|||Common
63|Blaine's Mankey|F|0|40|0|P|||Common
64|Blaine's Ponyta|R|0|50|1|W|||Common
65|Blaine's Rhyhorn|F|0|60|2|G|L||Common
66|Blaine's Vulpix|R|0|50|1|W|||Common
67|Brock's Diglett|F|0|40|1|G|L||Common
68|Brock's Geodude|F|0|50|1|G|||Common
69|Erika's Jigglypuff|C|0|50|1|F|P||Common
70|Erika's Oddish|G|0|40|1|R|||Common
71|Erika's Paras|G|0|50|1|R|||Common
72|Giovanni's Machop|F|0|50|1|P|||Common
73|Giovanni's Magikarp|W|0|30|1|L|||Common
74|Giovanni's Meowth|C|0|50|2|F|P||Common
75|Giovanni's Nidoran ♀|G|0|50|1|P|||Common
76|Giovanni's Nidoran ♂|G|0|40|1|P|||Common
77|Koga's Ekans|G|0|50|1|P|||Common
78|Koga's Grimer|G|0|50|1|P|||Common
79|Koga's Koffing|G|0|40|1|P|||Common
80|Koga's Pidgey|C|0|50|1|L|F||Common
81|Koga's Tangela|G|0|50|2|R|||Common
82|Koga's Weedle|G|0|40|1|R|||Common
83|Koga's Zubat|G|0|40|0|P|F||Common
84|Lt. Surge's Pikachu|L|0|40|0|F|||Common
85|Lt. Surge's Rattata|C|0|30|0|F|P||Common
86|Lt. Surge's Voltorb|L|0|50|1|F|||Common
87|Misty's Horsea|W|0|50|0|L|||Common
88|Misty's Magikarp|W|0|30|1|L|||Common
89|Misty's Poliwag|W|0|50|1|G|||Common
90|Misty's Psyduck|W|0|60|1|G|||Common
91|Misty's Seel|W|0|50|1|L|||Common
92|Misty's Staryu|W|0|40|1|L|||Common
93|Sabrina's Abra|P|0|40|0|P|||Common
94|Sabrina's Abra|P|0|50|1|P|||Common
95|Sabrina's Drowzee|P|0|50|1|P|||Common
96|Sabrina's Gastly|P|0|30|0||F||Common
97|Sabrina's Gastly|P|0|40|1||F||Common
98|Sabrina's Porygon|C|0|40|1|F|P||Common
99|Sabrina's Psyduck|W|0|50|1|L|||Common
100|Blaine||||0||||Rare
101|Brock's Protection||||0||||Rare
102|Chaos Gym||||0||||Rare
103|Erika's Kindness||||0||||Rare
104|Giovanni||||0||||Rare
105|Giovanni's Last Resort||||0||||Rare
106|Koga||||0||||Rare
107|Lt. Surge's Secret Plan||||0||||Rare
108|Misty's Wish||||0||||Rare
109|Resistance Gym||||0||||Rare
110|Sabrina||||0||||Rare
111|Blaine's Quiz #2||||0||||Uncommon
112|Blaine's Quiz #3||||0||||Uncommon
113|Cinnabar City Gym||||0||||Uncommon
114|Fuchsia City Gym||||0||||Uncommon
115|Koga's Ninja Trick||||0||||Uncommon
116|Master Ball||||0||||Uncommon
117|Max Revive||||0||||Uncommon
118|Misty's Tears||||0||||Uncommon
119|Rocket's Minefield Gym||||0||||Uncommon
120|Rocket's Secret Experiment||||0||||Uncommon
121|Sabrina's Psychic Control||||0||||Uncommon
122|Saffron City Gym||||0||||Uncommon
123|Viridian City Gym||||0||||Uncommon
124|Fervor||||0||||Common
125|Transparent Walls||||0||||Common
126|Warp Point||||0||||Common
127|Fighting Energy||||0||||No Rarity
128|Fire Energy||||0||||No Rarity
129|Grass Energy||||0||||No Rarity
130|Lightning Energy||||0||||No Rarity
131|Psychic Energy||||0||||No Rarity
132|Water Energy||||0||||No Rarity
`.trim().split('\n');
const MOVES=`
1|Heat Tackle~RCC~40~self10~Do 10 damage to Blaine's Arcanine.;Firestorm~RRRR~120~discard3Fire~Discard three attached Fire Energy cards to use this attack.
27|Quick Turn~CCC~30×~coin2x30~Flip two coins; deal 30 damage per heads.;Aerial Maneuvers~CCCC~10+~aerial~Flip a coin. Heads adds 30 damage and prevents attack effects on Koga's Pidgeotto next turn.
28|High Voltage~LC~20~trainerLockCoin~Flip a coin. Heads prevents your opponent from playing Trainers next turn.;Thunder Flare~LLL~30+~flare~Deal an additional 10 damage per damage counter on Lt. Surge's Jolteon. Flip a coin; on tails, do 30 damage to itself.
32|Mega Peck~CC~50~gate~Flip a coin. If tails, this attack does nothing.
33|Fire Mane~R~20~~;Stamp~RCC~30+~stamp~Flip a coin. Heads adds 10 damage to the defender and deals 10 to each opposing Benched Pokémon.
34|Tackle~CC~20~~;Detonate~FFF~50~detonate~Deal 10 to each Benched Pokémon on both sides, 50 to Brock's Graveler, and discard the Stadium.
36|Swift~FC~20~swift~Ignore Weakness, Resistance and effects affecting the defender.;Needle Ball~FF~30~coinPoison~Flip a coin. Heads Poisons the defender.
37|Hypnotic Gaze~C~0~sleep~The Defending Pokémon falls Asleep.;Fire Ring~RR~20~bench10~Deal 10 to one opposing Benched Pokémon, if available.
39|Sleep Seed~G~10~sleep~The Defending Pokémon falls Asleep.;Errand-Running~GG~0~coinTrainerSearch~Flip a coin. Heads searches your deck for a Trainer, revealing it and adding it to hand.
44|Poison Sting Tackle~GC~30~nidorinaSting~Do 20 damage to Giovanni's Nidorina. Flip a coin; heads Poisons the defender.;Body Slam~GCC~20~coinParalyze~Flip a coin. Heads Paralyzes the defender.
45|Rend~GCC~20+~rend~Deal 20 extra damage if the defender already has damage counters.
46|Bite~CC~20~~;Sonic Scream~GGG~30~coinConfuse~Flip a coin. Heads Confuses the defender.
48|Smokescreen~G~10~smokescreen~The defender must flip heads to attack successfully next turn.;Obscuring Gas~GC~30~obscure~After doing damage, on heads shuffle Koga's Koffing and all attached cards into your deck.
55|Nightmare~PP~20~sleep~Put the defender Asleep.;Shadow Attack~PPP~0~shadowAttack~Flip a coin. On heads, deal 30 damage to one opposing Benched Pokémon if available.
60|Fire Tail Slap~R~20~fireTailSlap~Flip a coin. On tails, discard one attached Fire Energy card.
61|Wild Kick~C~20~gate~Flip a coin. On tails, this attack does nothing.;Retaliate~CC~10×~retaliate~Deal 10 damage per damage counter on Blaine's Doduo.
62|Stoke~R~0~stoke~LuckyDex Energy Zone adaptation: attach one Fire Energy from the generated Energy pool.;Body Slam~RCC~20~coinParalyze~Flip a coin. On heads, Paralyze the defender.
64|Hind Kick~CC~20~coinSwitch~Flip a coin. On heads, switch Blaine's Ponyta with a Benched Pokémon if available.
65|Horn Charge~F~30~gate~Flip a coin. On tails, the attack does nothing.;Overrun~CCC~20~coinBench20~Flip a coin. On heads, deal 20 damage to one opposing Benched Pokémon if available.
67|Surprise Attack~F~20~gate~Flip a coin. On tails, deal no damage.;Tremor~FC~40~ownBench10~Deal 10 damage to each of your own Benched Pokémon.
68|Rock Toss~F~10×~coin3x10~Flip three coins, dealing 10 damage per heads.
70|Strange Powder~G~10~confuseOrSleep~Heads Confuses the defender, tails puts it Asleep.
71|Irongrip~C~10~~;Poison Spore~GG~0~poisonSpore~Flip a coin. On heads, Poison the defender and deal 10 damage to each opposing Benched Pokémon.
74|Cat Fleas~C~0~coinConfuse~Flip a coin. On heads, Confuse the defender.;Cat Kick~CCC~30~~
75|Horn Thrust~G~20~gate~Flip a coin. On tails, deal no damage.;Double-edge~CC~30~self20~Do 20 damage to Giovanni's Nidoran female.
77|Fast-Acting Poison~G~10~doubleHeadsConfusePoison~Flip two coins. If both heads, Confuse and Poison the defender.
79|Smelly Gas~G~10~smellyGas~Flip a coin. On heads, deal 10 damage to all Benched Pokémon on both sides.
80|Peck~C~10~~;Sand-attack~CCC~20~smokescreen~The defender must flip heads to attack successfully next turn.
81|Sleep Powder~G~10~sleep~Put the defender Asleep.;Grasping Vine~GC~0~coinDraw2~Flip a coin. On heads, draw two cards.
82|Sting~C~10~~;Sharp Stinger~GC~10~poisonOrPara~Heads Poisons the defender; tails Paralyzes it.
84|Quick Attack~CC~10+~bonus20~Flip a coin. On heads, deal 20 more damage.
85|Focus Energy~C~0~focusQuick~Next turn Lt. Surge's Rattata's Quick Attack deals 10 additional base damage.;Quick Attack~CC~10+~bonus20~Flip a coin. On heads, deal 20 more damage.
86|Bouncing Ball~LC~30~coinSelf10~Flip a coin. On tails, do 10 damage to Lt. Surge's Voltorb.
88|Play Dead~C~0~coinPrevent~Flip a coin. On heads, prevent all effects of attacks done to Misty's Magikarp next turn.;Leap~C~10~~
91|Frostbite~W~10~lockRetreat~The defender cannot retreat on its next turn.;Mirage~WC~10~smokescreen~The defender must flip heads to attack successfully next turn.
92|Star Boomerang~W~20~coinReturn~Flip a coin. Heads returns Misty's Staryu and all attached cards to your hand after damage.
93|Pound~C~10~~;Synchronize~PC~40~equalEnergy~You may use this attack only if both Active Pokémon have the same number of attached Energy cards.
94|Psyscan~P~0~revealHand~Look at your opponent's hand.;Quick Attack~P~10+~bonus20~Flip a coin. On heads, deal 20 more damage.
98|Sharp Point~C~10~~;Barrier Attack~CC~20~barrierAttack~Reduce damage from attacks against Sabrina's Porygon by 10 during your opponent's next turn.
51|Surprise~C~0~surprise~Return a random card from your opponent's hand to their deck and shuffle.;Scratch~CC~20~~
54|Ice Throw~WW~20~iceThrow~Double this attack's base damage when the defender is Fighting-type.;Take Down~WCCC~60~self20~Misty's Dewgong does 20 damage to itself.
58|Life Drain~P~0~lifeDrain~Flip a coin. On heads, reduce the defender's remaining HP to 10.;Psyshot~PCC~30~~
76|Double Kick~C~10×~coin2x10~Flip two coins; deal 10 damage per heads.;Retaliation~G~30~retaliation~Can only use this attack with at least two damage counters on Giovanni's Nidoran male.
96|Lick~P~10~coinParalyze~Flip a coin. On heads, Paralyze the defender.;Fade Out~PP~30~fadeOut~Return Sabrina's Gastly and its Energy cards to your hand, discarding other attachments.
2|Roaring Flames~R~20+~roaringFlames~Discard all Fire Energy attached to Blaine's Charizard; deal 20 additional damage for each Fire Energy discarded.;Flame Jet~RR~0~flameJet~Flip a coin. On heads, deal 40 damage to one opposing Pokémon, ignoring Weakness and Resistance.
14|Juxtapose~P~0~juxtapose~Flip a coin. On heads, swap the number of damage counters on Rocket's Mewtwo and the defender.;Hypnoblast~PP~20~coinSleep~Flip a coin. On heads, put the defender Asleep.;Psyburn~PPPC~60~~
31|Fire Claws~RR~30~~;Bonfire~RRR~0~bonfire~Flip three coins. For each heads, discard one Fire Energy attached to Blaine's Charmeleon and deal 10 damage to every opposing Pokémon, ignoring Weakness and Resistance. If insufficient Fire Energy, the attack does nothing.
`.trim().split('\n');
const EXTRA_MOVES=`
3|Will-o'-the-wisp~RR~30~~Deal 30 damage.
4|Growth~G~0~growth~Flip heads to attach up to two Grass Energy from your hand.;Wide Solarbeam~GGGG~20~wideSolarbeam~Deal 20 damage to up to two opposing Benched Pokémon.
5|Summon Storm~W~0~summonStorm~On two heads, deal 20 to all other Pokémon on both sides.;Dragon Tornado~WWCC~40~dragonTornado~After damage, switch opponent’s Active with one of their Bench unless knocked out.
6|Hurricane Punch~FFFC~30×~coin4x30~Flip four coins; 30 damage per heads.
7|Intimidate~G~0~intimidate~The defender cannot attack Giovanni’s Nidoking next turn if its printed HP is 50 or lower.;Tumbling Attack~GGGC~40+~coinBonus30~Flip heads to add 30 damage.
8|Ambush~CCC~20+~bonus20~Flip heads to add 20 damage.
9|Nerve Poison~GG~20~coinPoisonPara~Flip heads to Paralyze and Poison.;Hyper Needle~CCC~70~hyperNeedle~Flip tails to miss; this attack may only be used once while Koga’s Beedrill remains in play.
10|Giant Growth~C~0~giantGrowth~Flip heads to raise Koga’s Ditto’s HP to 80 and Pound damage to 30 until it leaves Active.;Pound~C~10~dittoPound~Deal 10 damage, or 30 after a successful Giant Growth.
11|Kerzap~LL~20+~kerzap~Flip heads to add 30 damage and discard all attached Lightning Energy.;Thundertackle~LLCC~40~thundertackle~Flip heads to Paralyze; tails deals 20 self-damage.
12|Electro Beam~WC~40~electroBeam~Flip tails to discard all attached Energy.;Super Removal~PC~0~superRemoval~Flip heads to discard an attached Energy card from every opposing Pokémon.
13|Tidal Wave~WWWW~70~~Deal 70 damage.
15|Plasma~L~20~plasma~Attach a Lightning Energy from discard if possible.;Electroburn~LLLC~70~electroburn~Self-damage 10 times attached Lightning Energy.
16|Mega Burn~PCCC~60~noNextTurn~Cannot use this attack next turn.
21|Burn Up~RR~50~burnUp~Flip tails to discard all attached Fire Energy.
22|Lie Low~F~0~lieLow~Reduce incoming damage by 20 next turn.;Earthdrill~FFC~60~earthdrill~Only usable after Lie Low last turn.
23|Mega Kick~GGC~40~~Deal 40 damage.;Love Lariat~GGCC~50+~loveLariat~Flip heads to add 50 when Giovanni’s Nidoking is on your Bench; tails misses.
24|Snapping Pincers~GC~10+~bonus10~Flip heads to add 10 damage.;Overhead Toss~GCC~40~overheadToss~Flip tails to deal 20 to one of your own Benched Pokémon.
25|Poison Buildup~G~0~selfPoison~Koga’s Arbok becomes Poisoned.;Poison Power~GG~20~poisonPower~If Koga’s Arbok is Poisoned, deal 40 damage and Poison defender.
26|Sludge Whirlpool~GGC~40~~Deal 40 damage.
29|Dark Wave~PP~20~suppressPower~Disable all Pokémon Powers through opponent’s next turn.;Shadow Bind~PPP~40~lockRetreat~Prevent retreat next turn.
30|Damage Shift~PP~0~damageShift~Move one damage counter from each of your damaged Pokémon to defender.;Water Spray~WCC~20+~bonus20~Flip heads to add 20 damage.
35|Mega Thrash~FFF~60~megaThrash~Deal 20 self-damage and discard Stadium.
38|Stretch Vine~G~0~stretchVine~Deal 10 damage to one opposing Benched Pokémon.
40|Lunar Power~C~0~lunarPower~Flip heads to evolve one of your Benched Pokémon from deck.;Moon Kick~CC~20~~Deal 20 damage.
41|Double Razor Leaf~GGG~40×~coin2x40~Flip two coins, 40 per heads.
42|Risky Attack~F~60~riskyAttack~Flip tails to miss and deal 100 self-damage.;Headlock~FFC~20+~headlock~Flip heads to add 20 and Paralyze defender.
43|False Charity~C~0~falseCharity~Flip heads to look at opponent’s top deck card; discard it if Trainer, otherwise put in their hand.;Double Scratch~CC~20×~coin2x20~Flip two coins; deal 20 damage per heads.
47|Toxic Secretion~G~0~toxicSecretion~Flip heads to Poison defender for 20 damage between turns.
49|Messenger~C~0~messenger~Return Koga’s Pidgey to the top of your deck and search a different Pokémon.;Wing Attack~CC~20~~Deal 20 damage.
50|Spontaneous Explosion~GG~10+~spontaneousExplosion~Flip heads to add 30 and deal 30 self-damage.;Toxic Cloud~GGC~20~toxicCloud~Flip heads to Poison defender for 20 damage between turns.
52|Power Ball~LLC~30+~powerBall~Flip 3 coins; add 10 damage per heads.
53|Focus Energy~C~0~focusDoubleEdge~Double your next Double-edge attack’s damage and self-damage.;Double-edge~CC~40~doubleEdge~Deal 20 self-damage (doubled after Focus Energy).
56|Invigorate~P~0~invigorate~Put a Basic Pokémon from either discard onto its owner’s Bench with half its HP in damage.;Pendulum Curse~PP~20×~pendulumCurse~Flip once per defender’s damage counter; deal 20 per heads.
57|Helping Hand~P~0~helpingHand~Heal any number of damage counters from an opposing Pokémon and draw as many cards.;Hug~PC~20~coinLockRetreat~Flip heads to prevent defender retreating next turn.
59|Magic Darts~PC~0~magicDarts~Choose an opposing Pokémon and flip three coins; deal 10 damage per heads.
63|Pranks~C~0~pranks~Flip heads to move one card from opponent’s discard to top of deck.;Fury Swipes~F~10×~coin3x10~Flip three coins; 10 damage per heads.
66|Bite~C~10~~Deal 10 damage.;Call Will-o'-the-wisp~R~0~callFire~Flip three coins and recover one Fire Energy from discard per heads.
69|Group Therapy~C~0~groupTherapy~Heal 10 damage from each damaged Pokémon on both sides.;Pulled Punch~CC~40-~pulledPunch~Deal 40 if defender has no damage, otherwise 10.
72|Chop~C~10~~Deal 10 damage.;Fury Punch~FF~20×~furyPunch~Flip heads to deal 20 damage per self damage counter.
73|Ancestral Memory~W~40~ancestralMemory~Flip tails to miss; may only use once while Giovanni’s Magikarp remains in play.;Flail Around~WC~10×~coin3x10~Flip three coins; deal 10 damage per heads.
78|Sludge Grip~G~0~sludgeGrip~Flip heads to switch in one opposing Benched Pokémon and Poison it.;Sludge Toss~GC~20~~Deal 20 damage.
83|Group Attack~GC~10×~groupAttack~Search your deck for Koga’s Zubat to fill free Bench slots, then deal 10 per Koga’s Zubat in play.
87|Ink Spurt~WW~20~inkSpurt~Flip heads to make defender flip for every attack until evolved or Benched.
89|Bubbles~W~20~bubbles~Flip tails to prevent Bubbles next turn.;Amnesia~WW~0~amnesia~Choose one defender attack and prevent it next turn.
90|ESP~P~0~mistyESP~Flip three coins; one heads draws one, two heads deals 20, three heads copies defender’s attack.
95|Energy Support~P~0~energySupport~Search deck for Psychic Energy; LuckyDex Energy Zone adaptation returns generated Psychic Energy to hand.;Mind Shock~PC~20~swift~Ignore Weakness and Resistance.
97|Suffocating Gas~PP~30~~Deal 30 damage.
99|Scratch~C~10~~Deal 10 damage.;Random ESP~P~20~randomESP~Flip heads to Confuse defender; tails misses and Confuses Sabrina’s Psyduck.
`.trim().split('\n');
const E={noop:{type:'noop'}};
const S=(status,target='opponentActive')=>({type:'status',status,target});
const coin=(heads,tails)=>({type:'coinFlip',heads,tails});
const multi=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'});
const seq=(...effects)=>({type:'sequence',effects});
const ben=(side,amount)=>({type:'benchDamage',side,amount,all:true});
Object.assign(E,{
 self10:{type:'selfDamage',amount:10}, self20:{type:'selfDamage',amount:20},
 discard3Fire:{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:3,useCost:true},
 coinSleep:coin(S('sleep')),coin2x30:multi(2,30),coin3x10:multi(3,10),coin2x10:multi(2,10),
 bonus20:coin({type:'bonusDamage',amount:20}),
 gate:{type:'coinAttackGate',heads:E.noop},
 coinPoison:coin(S('poison')),coinParalyze:coin(S('paralysis')),coinConfuse:coin(S('confusion')),
 sleep:S('sleep'),lockRetreat:{type:'lock',action:'retreat',duration:'opponentTurn'},
 smokescreen:{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},
 aerial:coin(seq({type:'bonusDamage',amount:30},{type:'preventDamage',target:'self',duration:'opponentTurn',effects:true})),
 trainerLockCoin:coin({type:'actionLock',cardType:'Trainer',side:'opponent',duration:'opponentTurn'}),
 flare:seq({type:'damageFromDamage',source:'self',amount:1},coin(E.noop,{type:'selfDamage',amount:30})),
 stamp:coin(seq({type:'bonusDamage',amount:10},ben('opponent',10))),
 detonate:seq(ben('opponent',10),ben('self',10),{type:'selfDamage',amount:50},{type:'discardStadium'}),
 swift:{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},
 bench10:{type:'benchDamage',side:'opponent',all:false,amount:10},
 coinTrainerSearch:coin({type:'searchChosen',source:'deck',amount:1,filter:{kind:'trainer'}}),
 nidorinaSting:seq({type:'selfDamage',amount:20},coin(S('poison'))),
 rend:{type:'bonusDamage',amount:20,condition:{type:'opponentDamaged'}},
 obscure:coin({type:'shuffleIntoDeck',target:'self',includeAttached:true}),
 shadowAttack:coin({type:'selectedDamage',target:'opponentBench',amount:30}),
 fireTailSlap:coin(E.noop,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1}),
 retaliate:{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},
 stoke:{type:'attachEnergy',target:'self',energyType:'Fire',amount:1},
 coinSwitch:coin({type:'switch'}),
 coinBench20:coin({type:'benchDamage',side:'opponent',all:false,amount:20}),
 ownBench10:ben('self',10),
 confuseOrSleep:coin(S('confusion'),S('sleep')),
 poisonSpore:coin(seq(S('poison'),ben('opponent',10))),
 doubleHeadsConfusePoison:{type:'allHeadsEffect',coins:2,heads:seq(S('confusion'),S('poison'))},
 sludgeGrip:coin(seq({type:'forceOpponentSwitch'},S('poison'))),
 smellyGas:coin(seq(ben('opponent',10),ben('self',10))),
 coinDraw2:coin({type:'draw',amount:2}),
 poisonOrPara:coin(S('poison'),S('paralysis')),
 focusQuick:{type:'nextAttackBonus',attackName:'Quick Attack',amount:10},
 coinSelf10:coin(E.noop,{type:'selfDamage',amount:10}),
 coinPrevent:coin({type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}),
 coinReturn:coin({type:'returnToHand',target:'self',returnBasicEnergy:true}),
 equalEnergy:{type:'attackRequirement',condition:{type:'equalEnergyCount'}},
 revealHand:{type:'revealHand',side:'opponent'},
 barrierAttack:{type:'modifier',stat:'damageReduction',amount:10,duration:'opponentTurn',scope:'self'},
 surprise:{type:'shuffleRandomHandCard',side:'opponent'},
 iceThrow:{type:'bonusDamage',amount:20,condition:{type:'opponentMatches',filter:{subtype:'Fighting'}}},
 lifeDrain:coin({type:'setRemainingHp',target:'opponentActive',amount:10}),
 retaliation:{type:'attackRequirement',condition:{type:'selfRemainingHpAtMost',amount:20}},
 fadeOut:{type:'returnToHand',target:'self',returnBasicEnergy:true,discardTools:true},
 roaringFlames:seq({type:'energyDamage',source:'self',energyType:'Fire',amount:20},{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:'all'}),
 flameJet:coin(seq({type:'selectedDamage',target:'opponentPokemon',amount:40},{type:'damageRule',ignoreWeakness:true,ignoreResistance:true})),
 juxtapose:{type:'gymRule',rule:'challengeJuxtapose'},bonfire:{type:'gymRule',rule:'challengeBonfire'}
});

// Gym Challenge attack adapters. A descriptive rule is never a substitute for
// the engine implementation: special choices and passives are tested below.
const rule=name=>({type:'gymRule',rule:'challenge:'+name});
const add=(a)=>({type:'bonusDamage',amount:a});
const flip=(heads,tails)=>({type:'coinFlip',heads,tails});
const damageCount=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'});
Object.assign(E,{
 growth:rule('growth'),wideSolarbeam:{type:'multiTargetDamage',target:'opponentBench',count:2,amount:20},summonStorm:rule('summonStorm'),dragonTornado:rule('dragonTornado'),coin4x30:damageCount(4,30),
 intimidate:rule('intimidate'),coinBonus30:flip(add(30)),bonus20:flip(add(20)),coinPoisonPara:flip(seq(S('poison'),S('paralysis'))),hyperNeedle:rule('hyperNeedle'),
 giantGrowth:rule('giantGrowth'),dittoPound:rule('dittoPound'),kerzap:flip(seq(add(30),{type:'discardEnergyCard',target:'self',energyType:'Lightning',amount:'all'})),thundertackle:flip(S('paralysis'),{type:'selfDamage',amount:20}),
 electroBeam:flip(E.noop,{type:'discardEnergyCard',target:'self',amount:'all'}),superRemoval:rule('superRemoval'),plasma:{type:'attachEnergyFromDiscard',target:'self',amount:1,energyType:'Lightning'},electroburn:rule('electroburn'),
 noNextTurn:rule('noNextTurn'),burnUp:flip(E.noop,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:'all'}),lieLow:{type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn',scope:'self'},earthdrill:rule('earthdrill'),
 loveLariat:rule('loveLariat'),bonus10:flip(add(10)),overheadToss:rule('overheadToss'),selfPoison:S('poison','self'),poisonPower:rule('poisonPower'),suppressPower:rule('suppressPower'),
 damageShift:rule('damageShift'),megaThrash:seq({type:'selfDamage',amount:20},{type:'discardStadium'}),stretchVine:{type:'selectedDamage',target:'opponentBench',amount:10},lunarPower:rule('lunarPower'),coin2x40:damageCount(2,40),
 riskyAttack:rule('riskyAttack'),headlock:flip(seq(add(20),S('paralysis'))),falseCharity:rule('falseCharity'),coin2x20:damageCount(2,20),toxicSecretion:rule('toxicSecretion'),
 messenger:rule('messenger'),spontaneousExplosion:flip(seq(add(30),{type:'selfDamage',amount:30})),toxicCloud:rule('toxicCloud'),powerBall:rule('powerBall'),
 focusDoubleEdge:rule('focusDoubleEdge'),doubleEdge:rule('doubleEdge'),invigorate:rule('invigorate'),pendulumCurse:rule('pendulumCurse'),helpingHand:rule('helpingHand'),coinLockRetreat:flip({type:'lock',action:'retreat',duration:'opponentTurn'}),
 magicDarts:rule('magicDarts'),pranks:rule('pranks'),coin3x10:damageCount(3,10),callFire:rule('callFire'),groupTherapy:seq({type:'heal',target:'selfAll',amount:10},{type:'heal',target:'opponentAll',amount:10}),
 pulledPunch:rule('pulledPunch'),furyPunch:rule('furyPunch'),ancestralMemory:rule('ancestralMemory'),sludgeGrip:flip(seq({type:'forceOpponentSwitch'},S('poison'))),groupAttack:rule('groupAttack'),inkSpurt:flip({type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'}),
 bubbles:rule('bubbles'),amnesia:rule('amnesia'),mistyESP:rule('mistyESP'),energySupport:rule('energySupport'),randomESP:rule('randomESP')
});
const ATTACKS=new Map([...MOVES,...EXTRA_MOVES].map(row=>{const [num,moves]=row.split('|');const attacks=moves.split(/;(?=[^;~]{1,55}~[GRWLPCF]*~)/).map(record=>{const [name,cost,damage,key='',text='']=record.split('~');if(key&&!E[key])throw new Error('Unknown Gym Challenge effect: '+key);const variable=/[+×?]/.test(damage);return {name,cost,damage:Number(damage.replace(/[^0-9]/g,''))||0,damageText:variable?damage:null,effect:key?E[key]:null,text};});return [Number(num),attacks];}));
// Only verified, fully implemented Trainers may enter the 30-card deck.
const TRAINERS={
 103:{text:'Heal 20 damage from every Pokémon in play, yours and your opponent’s.',effect:seq({type:'heal',target:'selfAll',amount:20},{type:'heal',target:'opponentAll',amount:20})},
 125:{text:'Until the end of your opponent’s next turn, prevent all attack damage to your Benched Pokémon; other attack effects still apply.',effect:{type:'preventDamage',target:'selfBenchAll',duration:'opponentTurn'}}
};

// The two holo and regular printings of Gym Leader cards share their rules.
Object.assign(TRAINERS,{
 17:{text:'Instead of your normal Energy Zone attachment this turn, attach two Fire Energy to one Blaine Pokémon.',effect:rule('blaine')},
 100:{text:'Instead of your normal Energy Zone attachment this turn, attach two Fire Energy to one Blaine Pokémon.',effect:rule('blaine')},
 18:{text:'This turn Giovanni Pokémon may evolve immediately, including on the first turn.',effect:rule('giovanni')},
 104:{text:'This turn Giovanni Pokémon may evolve immediately, including on the first turn.',effect:rule('giovanni')},
 19:{text:'Attacks from Koga Pokémon that deal damage Poison the defender this turn.',effect:rule('koga')},
 106:{text:'Attacks from Koga Pokémon that deal damage Poison the defender this turn.',effect:rule('koga')},
 20:{text:'Move all Energy from one Sabrina Pokémon to another Sabrina Pokémon.',effect:rule('sabrina')},
 110:{text:'Move all Energy from one Sabrina Pokémon to another Sabrina Pokémon.',effect:rule('sabrina')},
 101:{text:'Attach to a Brock Pokémon. The opponent cannot discard that Pokémon’s Energy with attacks or Trainers.',effect:rule('brockProtection')},
 102:{text:'Stadium. Flip for each non-Stadium Trainer; on tails opponent may play its effects instead.',effect:rule('chaosGym')},
 105:{text:'Heal all damage from a Giovanni Pokémon, then discard your hand.',effect:rule('giovanniLastResort')},
 107:{text:'Place a face-down hand card on your Bench as a Basic Pokémon; reveal it when it acts or is affected.',effect:rule('surgeSecretPlan')},
 108:{text:'Look at one Prize. Opponent may allow exchanging it with a hand card; otherwise draw one.',effect:rule('mistyWish')},
 109:{text:'Stadium. Each Pokémon Resistance is reduced by 20.',effect:rule('resistanceGym')},
 111:{text:'Show a hand card. Opponent guesses Pokémon/Trainer/Energy; correct guesses draw two for opponent, otherwise you.',effect:rule('blainesQuiz2')},
 112:{text:'Show a Pokémon from hand and name an attack. Opponent guesses its name; correct guesses draw three for opponent, otherwise you.',effect:rule('blainesQuiz3')},
 113:{text:'Stadium. Water damage to Blaine Pokémon does not gain Weakness.',effect:rule('cinnabarGym')},
 114:{text:'Stadium. Once per turn, flip heads to return a Koga Pokémon and attachments to its owner’s deck.',effect:{type:'stadiumAction',effect:rule('fuchsiaGym')}},
 115:{text:'Attach to Active Koga Pokémon. When attacked, you may switch it before damage. Discard if it goes to Bench.',effect:rule('ninjaTrick')},
 116:{text:'Look at the top seven cards of your deck and take one Pokémon; shuffle the rest back.',effect:rule('masterBall')},
 117:{text:'Discard two Energy cards from hand and Bench a Basic Pokémon from discard.',effect:rule('maxRevive')},
 118:{text:'Discard one other hand card to take up to two Water Energy cards into your hand.',effect:rule('mistyTears')},
 119:{text:'Stadium. Benching a Basic Pokémon from hand triggers a coin flip; tails damages that Pokémon.',effect:rule('minefieldGym')},
 120:{text:'Flip heads to search your deck for any card. Tails locks your Trainers until next turn ends.',effect:flip({type:'searchChosen',source:'deck',amount:1}, {type:'actionLock',side:'self',cardType:'Trainer',duration:'opponentTurn'})},
 121:{text:'Flip heads to play the effect of a Trainer in your opponent’s discard (without moving it).',effect:rule('psychicControl')},
 122:{text:'Stadium. During your turn you may return Basic Energy attached to Sabrina Pokémon to hand.',effect:{type:'stadiumAction',effect:rule('saffronGym')}},
 123:{text:'Stadium. Whenever a Giovanni Pokémon evolves, heal 20 damage from it.',effect:rule('viridianGym')},
 124:{text:'Reveal the top three cards of your deck; take Fire Energy, discard the rest.',effect:rule('fervor')},
 126:{text:'Opponent switches their Active with a Benched Pokémon, then you do the same.',effect:rule('warpPoint')}
});

const POWERS={
 3:{name:'Shapeshift',text:'Attach an Evolution card from hand and treat Brock’s Ninetales as that Pokémon without its Power. Discard that Evolution on status or choice.',type:'activated',disabledByStatus:true,oncePerTurn:false,effect:rule('shapeshift')},
 6:{name:'Fortitude',text:'If an opponent attack would Knock Out Giovanni’s Machamp, flip heads to survive with 10 HP.',type:'passive',disabledByStatus:true,effect:{type:'koGuard',mode:'surviveCoin',remainingHp:10,attackOnly:true}},
 8:{name:'Call the Boss',text:'When Giovanni’s Persian evolves, search the deck for Giovanni Trainer and put it in hand.',type:'triggered',event:'evolved',effect:{type:'searchChosen',source:'deck',amount:1,filter:{kind:'trainer',name:'Giovanni'}}},
 13:{name:'Rebellion',text:'Flip two coins before attacking; if both tails, shuffle Misty’s Gyarados and attachments into deck instead.',type:'passive',effect:rule('rebellion')},
 16:{name:'Psylink',text:'Sabrina’s Alakazam may use attacks of all your other Psychic Pokémon in play with their Energy costs.',type:'passive',disabledByStatus:true,effect:rule('psylink')},
 21:{name:'Healing Fire',text:'Attaching Fire Energy from hand heals one damage counter on Blaine’s Ninetales.',type:'triggered',event:'energyAttached',energyType:'Fire',disabledByStatus:true,effect:{type:'healSelf',amount:10}},
 26:{name:'Energy Drain',text:'After an opponent’s attack damages Koga’s Muk, flip heads to discard Energy from the attacker.',type:'triggered',event:'damagedByAttack',disabledByStatus:true,effect:rule('energyDrain')},
 35:{name:'Scram',text:'If Brock’s Primeape has exactly 10 HP left, shuffle it and its attachments into deck.',type:'triggered',event:'damagedByAttack',disabledByStatus:true,effect:rule('scram')},
 38:{name:'Soak Up',text:'Move up to two Grass Energy from your other Pokémon to Erika’s Bellsprout.',type:'activated',disabledByStatus:true,oncePerTurn:true,effect:rule('soakUp')},
 41:{name:'Relaxing Scent',text:'While Erika’s Ivysaur is Active, damage done by attacks to any Pokémon is halved (rounded up to ten).',type:'passive',activeOnly:true,disabledByStatus:true,effect:rule('relaxingScent')},
 47:{name:'Emerge',text:'Flip heads to evolve Koga’s Kakuna into Koga’s Beedrill from deck.',type:'activated',disabledByStatus:true,oncePerTurn:true,effect:rule('emerge')},
 52:{name:'Shock Blast',text:'When Lt. Surge’s Electrode is Active and damaged, flip tails to deal 20 to each Active Pokémon.',type:'triggered',event:'damagedByAttack',activeOnly:true,disabledByStatus:false,effect:rule('shockBlast')},
 97:{name:'Gaseous Form',text:'Sabrina’s Gastly gains 10 maximum HP per Psychic Energy attached.',type:'passive',disabledByStatus:false,effect:rule('gaseousForm')}
};
const STADIUM_NUMBERS=new Set([102,109,113,114,119,122,123]);
const CARDS=DATA.map(row=>{const [raw,name,type,stage,hp,ret,weak,res,evolvesFrom,rarity]=row.split('|');const number=Number(raw),basicEnergy=number>=127,kind=basicEnergy?'energy':(number>=100||number>=17&&number<=20)?'trainer':'pokemon';const attacks=ATTACKS.get(number)||[],abilities=POWERS[number]?[POWERS[number]]:[],reasons=[];
 if(kind==='pokemon'&&!attacks.length)reasons.push('Printed attack or Pokémon Power not yet implemented');
 if(kind==='trainer'&&!TRAINERS[number])reasons.push('Printed Trainer or Stadium effect not yet implemented');
 if(basicEnergy)reasons.push('Basic Energy is supplied by the separate Energy Zone');
 if(attacks.some(a=>a.effect&&!fx?.supportsEffect?.(a.effect)))reasons.push('Attack effect unsupported');
 if(kind==='trainer'&&TRAINERS[number]&&!fx?.supportsEffect?.(TRAINERS[number].effect))reasons.push('Trainer effect unsupported');
 const battleEnabled=!reasons.length;
 return {id:`gym2-${number}`,setId:'gym2',number:String(number),name,source:'tcg',battleFormat:'classic',kind,
  ...(kind==='pokemon'?{stage:stage==='0'?'Basic':`Stage ${stage}`,hp:Number(hp),retreat:Number(ret),types:[TYPE[type]],subtype:TYPE[type],evolvesFrom:evolvesFrom||null,weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,attacks,abilities}:{}),
  ...(kind==='trainer'?{trainerType:STADIUM_NUMBERS.has(number)?'Stadium':number===101||number===115?'AttachedTrainer':'Item',text:TRAINERS[number]?.text||'',effect:TRAINERS[number]?.effect||null}:{}),
  ...(basicEnergy?{basicEnergy:true,subtype:BASIC_ENERGY_TYPES[number],types:[BASIC_ENERGY_TYPES[number]]}:{}),
  battleEnabled,deckEligible:battleEnabled,support:{status:battleEnabled?'FULL':'PARTIAL',reasons},rarity,
  image:`https://images.pokemontcg.io/gym2/${number}.png`,imageLarge:`https://images.pokemontcg.io/gym2/${number}_hires.png`};
});
if(CARDS.length!==132||new Set(CARDS.map(c=>c.id)).size!==132)throw new Error('Gym Challenge identity mismatch');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
 coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
