/* Gym Heroes / gym1 (132 original prints). Source identity: PokemonTCG/pokemon-tcg-data.
 * Battles are enabled only for cards whose complete printed actions are mapped.
 * Unsupported effects stay visible in the catalogue but never enter generated decks.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexClassicTCGGymHeroes=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'gym1',name:'Gym Heroes',series:'Gym',releaseDate:'2000-08-14',cardCount:132});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless'};
// number | printed name | type | stage 0/1/2 | HP | retreat | weakness | resistance | evolvesFrom.
// Different numbered prints of the same Gym Pokémon retain distinct attacks.
const DATA=`
1|Blaine's Moltres|R|0|90|3||F|
2|Brock's Rhydon|F|1|80|3|G|L|Brock's Rhyhorn
3|Erika's Clefable|C|1|70|2|F|P|Erika's Clefairy
4|Erika's Dragonair|C|1|80|2||P|Erika's Dratini
5|Erika's Vileplume|G|2|80|2|R||Erika's Gloom
6|Lt. Surge's Electabuzz|L|0|70|2|F||
7|Lt. Surge's Fearow|C|1|70|0|L|F|Lt. Surge's Spearow
8|Lt. Surge's Magneton|L|1|70|2|F||Lt. Surge's Magnemite
9|Misty's Seadra|W|1|70|1|L||Misty's Horsea
10|Misty's Tentacruel|W|1|70|0|L||Misty's Tentacool
11|Rocket's Hitmonchan|F|0|60|1|P||
12|Rocket's Moltres|R|0|60|2||F|
13|Rocket's Scyther|G|0|60|1|R|F|
14|Sabrina's Gengar|P|2|80|1||F|Sabrina's Haunter
15|Brock|||||||
16|Erika|||||||
17|Lt. Surge|||||||
18|Misty|||||||
19|The Rocket's Trap|||||||
20|Brock's Golem|F|2|90|4|G||Brock's Graveler
21|Brock's Onix|F|0|70|2|G||
22|Brock's Rhyhorn|F|0|60|2|G|L|
23|Brock's Sandslash|F|1|60|1|G|L|Brock's Sandshrew
24|Brock's Zubat|G|0|30|0|P|F|
25|Erika's Clefairy|C|0|50|1|F|P|
26|Erika's Victreebel|G|2|80|2|R||Erika's Weepinbell
27|Lt. Surge's Electabuzz|L|0|60|2|F||
28|Lt. Surge's Raichu|L|1|70|2|F||Lt. Surge's Pikachu
29|Misty's Cloyster|W|1|70|2|L||Misty's Shellder
30|Misty's Goldeen|W|0|30|0|L||
31|Misty's Poliwrath|W|2|90|3|G||Misty's Poliwhirl
32|Misty's Tentacool|W|0|40|0|L||
33|Rocket's Snorlax|C|0|90|4|F|P|
34|Sabrina's Venomoth|G|1|60|0|R|F|Sabrina's Venonat
35|Blaine's Growlithe|R|0|50|1|W||
36|Blaine's Kangaskhan|C|0|80|3|F|P|
37|Blaine's Magmar|R|0|60|2|W||
38|Brock's Geodude|F|0|50|1|G||
39|Brock's Golbat|G|1|70|1|P|F|Brock's Zubat
40|Brock's Graveler|F|1|70|2|G||Brock's Geodude
41|Brock's Lickitung|C|0|80|3|F|P|
42|Erika's Dratini|C|0|40|1||P|
43|Erika's Exeggcute|G|0|50|1|R||
44|Erika's Exeggutor|G|1|70|2|R||Erika's Exeggcute
45|Erika's Gloom|G|1|60|1|R||Erika's Oddish
46|Erika's Gloom|G|1|70|1|R||Erika's Oddish
47|Erika's Oddish|G|0|40|1|R||
48|Erika's Weepinbell|G|1|60|1|R||Erika's Bellsprout
49|Erika's Weepinbell|G|1|70|2|R||Erika's Bellsprout
50|Lt. Surge's Magnemite|L|0|30|0|F||
51|Lt. Surge's Raticate|C|1|70|1|F|P|Lt. Surge's Rattata
52|Lt. Surge's Spearow|C|0|30|0|L|F|
53|Misty's Poliwhirl|W|1|70|2|G||Misty's Poliwag
54|Misty's Psyduck|W|0|50|1|G||
55|Misty's Seaking|W|1|70|1|L||Misty's Goldeen
56|Misty's Starmie|W|1|80|2|L||Misty's Staryu
57|Misty's Tentacool|W|0|50|1|L||
58|Sabrina's Haunter|P|1|50|0||F|Sabrina's Gastly
59|Sabrina's Jynx|P|0|60|1|P||
60|Sabrina's Slowbro|P|1|70|2|P||Sabrina's Slowpoke
61|Blaine's Charmander|R|0|50|1|W||
62|Blaine's Growlithe|R|0|50|1|W||
63|Blaine's Ponyta|R|0|40|0|W||
64|Blaine's Tauros|C|0|70|2|F|P|
65|Blaine's Vulpix|R|0|40|1|W||
66|Brock's Geodude|F|0|40|1|G||
67|Brock's Mankey|F|0|40|0|P||
68|Brock's Mankey|F|0|40|0|P||
69|Brock's Onix|F|0|100|3|G||
70|Brock's Rhyhorn|F|0|70|3|G|L|
71|Brock's Sandshrew|F|0|40|1|G|L|
72|Brock's Sandshrew|F|0|50|1|G|L|
73|Brock's Vulpix|R|0|40|1|W||
74|Brock's Zubat|G|0|40|0|P|F|
75|Erika's Bellsprout|G|0|40|1|R||
76|Erika's Bellsprout|G|0|50|1|R||
77|Erika's Exeggcute|G|0|40|1|R||
78|Erika's Oddish|G|0|50|1|R||
79|Erika's Tangela|G|0|60|2|R||
80|Lt. Surge's Magnemite|L|0|40|1|F||
81|Lt. Surge's Pikachu|L|0|50|1|F||
82|Lt. Surge's Rattata|C|0|40|1|F|P|
83|Lt. Surge's Spearow|C|0|50|0|L|F|
84|Lt. Surge's Voltorb|L|0|40|1|F||
85|Misty's Goldeen|W|0|40|1|L||
86|Misty's Horsea|W|0|40|0|L||
87|Misty's Poliwag|W|0|50|1|G||
88|Misty's Seel|W|0|60|1|L||
89|Misty's Shellder|W|0|40|1|L||
90|Misty's Staryu|W|0|50|1|L||
91|Sabrina's Abra|P|0|40|0|P||
92|Sabrina's Drowzee|P|0|50|1|P||
93|Sabrina's Gastly|P|0|50|1||F|
94|Sabrina's Mr. Mime|P|0|50|1|P||
95|Sabrina's Slowpoke|P|0|50|1|P||
96|Sabrina's Venonat|G|0|40|1|R||
97|Blaine's Quiz #1|||||||
98|Brock|||||||
99|Charity|||||||
100|Erika|||||||
101|Lt. Surge|||||||
102|Misty|||||||
103|No Removal Gym|||||||
104|The Rocket's Training Gym|||||||
105|Blaine's Last Resort|||||||
106|Brock's Training Method|||||||
107|Celadon City Gym|||||||
108|Cerulean City Gym|||||||
109|Erika's Maids|||||||
110|Erika's Perfume|||||||
111|Good Manners|||||||
112|Lt. Surge's Treaty|||||||
113|Minion of Team Rocket|||||||
114|Misty's Wrath|||||||
115|Pewter City Gym|||||||
116|Recall|||||||
117|Sabrina's ESP|||||||
118|Secret Mission|||||||
119|Tickling Machine|||||||
120|Vermilion City Gym|||||||
121|Blaine's Gamble|||||||
122|Energy Flow|||||||
123|Misty's Duel|||||||
124|Narrow Gym|||||||
125|Sabrina's Gaze|||||||
126|Trash Exchange|||||||
127|Fighting Energy|F|-||0|||
128|Fire Energy|R|-||0|||
129|Grass Energy|G|-||0|||
130|Lightning Energy|L|-||0|||
131|Psychic Energy|P|-||0|||
132|Water Energy|W|-||0|||
`.trim().split('\n');
// Printed attack records for cards with effects supported end-to-end by the
// current battle engine. Never infer missing rules from attack names alone.
// number|attack name~cost~printed damage~effect key~concise rules text;...
const MOVES=`
9|Tail Snap~W~20~~;Knockout Needle~WWW~30+~twoHeadsPlus60~Flip two coins. If both are heads, deal 60 extra damage.
56|Water Gun~W~10+~waterGun~Deal 10 additional damage per extra Water Energy beyond the first, maximum 20 extra.;Bubblebeam~WWW~30~coinParalyze~Flip a coin. On heads, Paralyze the Defending Pokémon.
58|Night Spirits~PP~30×~nightSpirits~Flip one coin for each Sabrina's Gastly, Sabrina's Haunter, and Sabrina's Gengar in play on your side. Deal 30 damage per heads.
90|Swift~WC~20~swift~Ignore Weakness, Resistance, Pokémon Powers and effects on the defender for this attack's damage.
7|Repeating Drill~CC~10×~coin5x10~Flip five coins. Deal 10 damage per heads.;Clutch~CCC~30~lockRetreat~The Defending Pokémon cannot retreat during the opponent's next turn.
22|Horn Toss~CC~20~forceSwitch~After damage, the opponent switches their Active Pokémon with a Benched Pokémon, if possible.;Take Down~FFC~40~self10~Brock's Rhyhorn takes 10 damage.
23|Needles~FF~10~coinParalyzePoison~Flip a coin. On heads, the Defending Pokémon becomes Paralyzed and Poisoned.;Sandstorm~FF~20~smokescreen~Next turn, the Defending Pokémon must flip heads to attack successfully.
30|Horn Hazard~W~30~gate~Flip a coin. On tails, this attack does nothing.
35|Shake~C~10~forceSwitch~After damage, the opponent switches their Active Pokémon with a Benched Pokémon if available.;Fire Tackle~RC~30~self10~Blaine's Growlithe takes 10 damage.
36|Child's Punch~C~10~gate~Flip a coin. On tails, this attack does nothing.;One-Two Punch~CCC~30+~bonus10~Flip a coin. On heads, deal 10 more damage.
40|Rock Toss~FCC~20×~coin3x20~Flip three coins. Deal 20 damage per heads.
41|Tongue Slap~CC~20~~;Slam~CCC~30×~coin2x30~Flip two coins. Deal 30 damage per heads.
46|Dream Dance~GC~10~sleepBoth~The Defending Pokémon and Erika's Gloom both fall Asleep.;Vile Smell~GGC~30~confuseBoth~The Defending Pokémon and Erika's Gloom both become Confused.
49|Sleep Poison~GC~0~sleepPoison~The Defending Pokémon becomes Asleep and Poisoned.;Vine Whip~GGC~40~~
50|Removal Pulse~L~10~coinEnergyRemove~If the defender has attached Energy, flip a coin. Heads discards one Energy from it.;Confusion Pulse~LL~20~coinConfuse~Flip a coin. On heads, Confuse the Defending Pokémon.
51|Super Fang~C~?~halfHp~Deal damage equal to half the opponent's remaining HP, rounded up to the nearest 10.
52|Drill Peck~C~20~~
63|Agility~RC~20~coinPrevent~Flip a coin. On heads, prevent all effects of attacks on Blaine's Ponyta next turn.
67|Taunt~C~0~forceSwitch~Switch an opposing Benched Pokémon into the Active position if one exists.;Light Kick~F~10~~
69|Bellow~C~0~coinParalyze~Flip a coin. On heads, Paralyze the Defending Pokémon.;Rock Throw~FFC~30~~
71|Defense Curl~C~0~coinPreventDamage~Flip a coin. On heads, prevent all attack damage done to Brock's Sandshrew next turn.;Rolling Attack~FC~20~~
72|Sand Pit~FF~20~lockRetreat~The Defending Pokémon cannot retreat during the opponent's next turn.
73|Flame~R~20~~;Quick Attack~CC~10+~bonus20~Flip a coin. On heads, deal 20 more damage.
74|Wing Attack~C~10~~;Poison Fang~GC~20~coinPoison~Flip a coin. On heads, Poison the Defending Pokémon.
75|Poison Vine~G~10~coinPoison~Flip a coin. On heads, Poison the Defending Pokémon.;Vine Whip~GG~30~~
76|Careless Tackle~C~20~self10~Erika's Bellsprout also takes 10 damage.
78|Blot~G~10~heal10~Remove one damage counter from Erika's Oddish if it has damage.;Sporadic Sponging~GC~20~coinHeal10~If damaged, flip a coin. On heads, heal one damage counter.
80|Thundershock~L~10~coinParalyze~Flip a coin. On heads, Paralyze the Defending Pokémon.;Tackle~CC~20~~
83|Whirlwind~C~10~forceSwitch~After damage, the opponent switches their Active Pokémon with a Benched Pokémon, if possible.;Razor Wind~CC~40~gate~Flip a coin. On tails, this attack does nothing.
84|Spin Ball~L~20×~coin1x20~Flip a coin; deal 20 damage on heads.;Double Spin~LC~20×~coin2x20~Flip two coins; deal 20 damage per heads.
85|Fury Attack~C~10×~coin2x10~Flip two coins; deal 10 damage per heads.;Supersonic~W~0~coinConfuse~Flip a coin. On heads, Confuse the Defending Pokémon.
86|Tackle~W~10~~;Smokescreen~WW~20~smokescreen~Next turn, the Defending Pokémon must flip heads to attack successfully.
87|Hypnotic Stare~W~0~sleepOrPara~Flip a coin. On heads, Paralyze the defender; on tails, put it Asleep.;Tail Rap~WC~20×~coin2x20~Flip two coins, dealing 20 damage per heads.
88|Aurora Beam~WC~20~~
89|Tackle~C~10~~;Clamp~WC~20~coinClamp~Flip a coin. Heads deals 20 damage and Paralyzes the defender; tails does nothing.
92|Suggestion~P~0~coinAttackLock~Flip a coin. On heads, the defender cannot attack during its next turn.;Headbutt~CC~20~~
93|Spook~PC~20~lockRetreat~The Defending Pokémon cannot retreat during the opponent's next turn.
95|Lazy Attack~PC~30~selfSleep~Sabrina's Slowpoke becomes Asleep after attacking.
96|Poison Antennae~G~0~poison~The Defending Pokémon is now Poisoned.;Removal Beam~PC~20~coinEnergyRemove~If the defender has attached Energy, flip a coin. Heads discards one Energy from it.
`.trim().split('\n');
const MORE_MOVES=`
5|Mega Drain~GGG~30~drainHalf~If this attack damages the defender, heal Erika's Vileplume for half of the damage dealt, rounded up to the nearest 10.
6|Charge~L~0~surgeCharge2~Attach up to two Lightning Energy from your discard pile to Lt. Surge's Electabuzz.;Discharge~L~30×~surgeDischarge~Discard all attached Lightning Energy, flipping once per card; deal 30 damage for each heads.
8|Mega Shock~LLLC~50~surgeMegaShock~Flip a coin; on tails, Lt. Surge's Magneton does 20 damage to itself.
20|Rock Slide~FFC~20~rockSlide~Deal 10 damage to up to three opposing Benched Pokémon.;Fissure~FFCC~50~~
21|Bind~FF~20~coinParalyze~Flip a coin; on heads, Paralyze the defender.;Tunneling~FFF~0~brockTunneling~Deal 20 damage to up to two opposing Benched Pokémon; Brock's Onix cannot attack on its next turn.
24|Alert~C~0~brockAlert~Draw a card, then switch Brock's Zubat with one of your Benched Pokémon. Requires a Benched Pokémon.;Wing Attack~CC~20~~
26|Razor Leaf~GGG~50~~
28|Mega Punch~LL~30~~;Thunderbolt~LLLL~100~discardAllEnergy~Discard all Energy attached to Lt. Surge's Raichu.
29|Triple Cannon~WWC~20×~coin3x20~Flip three coins; deal 20 damage per heads.
33|Collapse~CCC~20~selfSleep~After attacking, Rocket's Snorlax falls Asleep.
34|Healing Pollen~G~0~sabrinaHealPollen~Flip three coins; for each heads, remove one damage counter from each of your Pokémon.;Sonic Distortion~P~10~sabrinaSonic~Flip two coins; if either is heads, Confuse the defender.
38|Tackle~C~10~~;Lucky Shot~FC~0~brockLuckyShot~Choose an opposing Benched Pokémon and flip a coin; on heads, deal 30 damage to it.
39|Dive~C~20~~;Spiral Dive~CCC~10~spiralDive~Deal 10 damage to each opposing Benched Pokémon in addition to the Active Pokémon.
44|Psychic Exchange~P~0~psychicExchange~Shuffle your hand into your deck and draw five cards.;Stomp~GCC~30+~bonus10~Flip a coin; on heads deal 10 more damage.
53|Rapids~WC~20~coinEnergyRemove~If the defender has attached Energy, flip a coin; on heads, discard one.;Water Punch~CCC~30+~mistyWaterPunch~Flip once per Water Energy attached and add 10 damage per heads.
55|Horn Attack~W~10~~;Mud Splash~WW~30~mistyMudSplash~Choose a Benched Pokémon; on heads, deal 10 additional damage to it.
59|Good Night~P~10~sleep~The Defending Pokémon falls Asleep.;Good Morning~PC~20~wakeDefender~Wake the Defending Pokémon if it is Asleep.
60|Naptime~P~0~slowbroNap~Flip a coin; on heads heal up to 30 damage from Sabrina's Slowbro, then put it to Sleep.;Screaming Headbutt~PCC~40~cannotAttackNextTurn~Sabrina's Slowbro cannot attack on its next turn.
62|Blaze~RR~20~blazeGrassBench~Deal 10 damage to each opposing Grass Pokémon on the Bench.
65|Tail Fan~RCC~20~coinConfuse~Flip a coin; on heads, Confuse the defender.
70|Drill Tackle~FC~0~twoHeads70~Flip two coins; only if both are heads, deal 70 damage.
77|Eggsplosion~C~10×~energyEggsplosion~Flip one coin per Energy attached to Erika's Exeggcute; deal 10 per heads.;Psychic~PC~10+~psychicOppEnergy~Deal 10 more damage for each Energy card attached to the defender.
79|Vine Slap~G~10~~;Stretch Vine~GGC~0~stretchVine~Choose an opposing Benched Pokémon; deal 20 damage to it, ignoring Weakness and Resistance.
81|Charge~C~0~pikachuRecover~Attach one Lightning Energy from the discard pile to Lt. Surge's Pikachu.;Lightning Tail~LL~20~coinParalyze~Flip a coin; on heads, Paralyze the defender.
82|Focus Energy~C~0~rattataFocus~Next turn, Lt. Surge's Rattata's Gnaw attack has double base damage.;Gnaw~CC~20~~

1|Phoenix Flame~RRRRR~90~phoenixFlame~Flip a coin. After doing damage, on tails shuffle Blaine's Moltres and all attached cards into your deck.
4|Blizzard~CCC~30~gymBlizzard~Flip a coin. Heads deals 10 to each opposing Benched Pokémon; tails deals 10 to each of your own Benched Pokémon.;Take Away~CCCC~0~gymTakeAway~Shuffle Erika's Dragonair and all attached cards into your deck, then shuffle the defending Pokémon and all its cards into its owner's deck.
27|Charge~L~0~surgeCharge2~Attach up to two Lightning Energy from your discard pile to Lt. Surge's Electabuzz.;Electric Current~LL~20~surgeCurrent~Move one Lightning Energy attached to Lt. Surge's Electabuzz onto one of your Benched Pokémon, or discard it if the Bench is empty.
31|Water Ring~WWCC~30~mistyWaterRing~Deal 10 damage to every non-Water Pokémon on either player's Bench, ignoring Weakness and Resistance.
45|Healing Pollen~G~0~erikaGloomHeal~Flip a coin; on heads heal 40 damage from Erika's Gloom.;Magic Pollen~GGG~30~erikaMagicPollen~Choose Sleep, Confusion, Paralysis or Poison for the Defending Pokémon.
`.trim().split('\n');
const nop={type:'noop'};
const status=(status,target='opponentActive')=>({type:'status',target,status});
const flip=(heads,tails)=>({type:'coinFlip',heads,tails});
const coinDamage=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'});
const coinGate={type:'coinAttackGate',heads:nop};
const effects={
 coin5x10:coinDamage(5,10),coin3x20:coinDamage(3,20),coin2x30:coinDamage(2,30),
 coin1x20:coinDamage(1,20),coin2x20:coinDamage(2,20),coin2x10:coinDamage(2,10),
 lockRetreat:{type:'lock',action:'retreat',duration:'opponentTurn'},
 forceSwitch:{type:'forceOpponentSwitch'},self10:{type:'selfDamage',amount:10},
 coinParalyzePoison:flip({type:'sequence',effects:[status('paralysis'),status('poison')]}),
 smokescreen:{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},
 gate:coinGate,bonus10:flip({type:'bonusDamage',amount:10}),bonus20:flip({type:'bonusDamage',amount:20}),
 sleepBoth:{type:'sequence',effects:[status('sleep'),status('sleep','self')]},
 confuseBoth:{type:'sequence',effects:[status('confusion'),status('confusion','self')]},
 sleepPoison:{type:'sequence',effects:[status('sleep'),status('poison')]},
 coinEnergyRemove:flip({type:'discardEnergyCard',target:'opponentActive',amount:1}),
 coinConfuse:flip(status('confusion')),coinParalyze:flip(status('paralysis')),
 halfHp:{type:'remainingHpFractionDamage',divisor:2,roundTo:10,mode:'replace'},
 coinPrevent:flip({type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}),
 coinPreventDamage:flip({type:'preventDamage',target:'self',duration:'opponentTurn'}),
 coinPoison:flip(status('poison')),heal10:{type:'healSelf',amount:10},coinHeal10:flip({type:'healSelf',amount:10}),
 sleepOrPara:flip(status('paralysis'),status('sleep')),
 drainHalf:{type:'drain',fraction:0.5},
 surgeCharge2:{type:'attachEnergyFromDiscard',target:'self',energyType:'Lightning',amount:2,upTo:true},
 surgeDischarge:{type:'sequence',effects:[{type:'coinDamageByEnergy',amount:30,energyType:'Lightning',mode:'replace'},{type:'discardEnergy',target:'self',energyType:'Lightning',amount:'all'}]},
 surgeMegaShock:flip({type:'noop'},{type:'selfDamage',amount:20}),
 rockSlide:{type:'multiTargetDamage',target:'opponentBench',count:3,amount:10},
 brockTunneling:{type:'sequence',effects:[{type:'multiTargetDamage',target:'opponentBench',count:2,amount:20},{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'}]},
 brockAlert:{type:'sequence',effects:[{type:'draw',amount:1},{type:'switch'}]},
 discardAllEnergy:{type:'discardEnergyCard',target:'self',amount:'all'},
 sabrinaHealPollen:{type:'coinRepeatEffect',coins:3,effect:{type:'heal',target:'selfAll',amount:10}},
 sabrinaSonic:{type:'coinRepeatEffect',coins:2,effect:status('confusion')},
 brockLuckyShot:flip({type:'selectedDamage',target:'opponentBench',amount:30}),
 spiralDive:{type:'benchDamage',side:'opponent',all:true,amount:10},
 psychicExchange:{type:'handShuffle',side:'self',draw:5},
 mistyWaterPunch:{type:'coinDamageByEnergy',energyType:'Water',amount:10,mode:'add'},
 mistyMudSplash:flip({type:'benchDamage',side:'opponent',all:false,amount:10}),
 sleep:status('sleep'),
 wakeDefender:{type:'removeStatuses',target:'opponentActive',statuses:['sleep']},
 slowbroNap:flip({type:'sequence',effects:[{type:'healSelf',amount:30},status('sleep','self')]}),
 cannotAttackNextTurn:{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'},
 blazeGrassBench:{type:'benchDamage',side:'opponent',all:true,amount:10,filter:{subtype:'Grass'}},
 twoHeads70:{type:'allHeadsBonus',coins:2,amount:70},
 energyEggsplosion:{type:'coinDamageByEnergy',amount:10,mode:'replace'},
 psychicOppEnergy:{type:'energyDamage',source:'opponent',amount:10,mode:'add'},
 stretchVine:{type:'selectedDamage',target:'opponentBench',amount:20},
 pikachuRecover:{type:'attachEnergyFromDiscard',target:'self',energyType:'Lightning',amount:1},
 rattataFocus:{type:'nextAttackBonus',attackName:'Gnaw',amount:20},
 phoenixFlame:flip({type:'noop'},{type:'shuffleIntoDeck',target:'self',includeAttached:true}),
 gymBlizzard:flip({type:'benchDamage',side:'opponent',all:true,amount:10},{type:'benchDamage',side:'self',all:true,amount:10}),
 gymTakeAway:{type:'sequence',effects:[{type:'shuffleIntoDeck',target:'self',includeAttached:true},{type:'shuffleIntoDeck',target:'opponentActive',includeAttached:true}]},
 surgeCurrent:{type:'moveEnergy',source:'self',target:'selfBench',energyType:'Lightning',amount:1},
 mistyWaterRing:{type:'sequence',effects:[{type:'benchDamage',side:'opponent',all:true,filter:{notSubtype:'Water'},amount:10},{type:'benchDamage',side:'self',all:true,filter:{notSubtype:'Water'},amount:10}]},
 erikaGloomHeal:flip({type:'healSelf',amount:40}),
 erikaMagicPollen:{type:'chooseOption',options:[{label:'Sleep',effect:status('sleep')},{label:'Confuse',effect:status('confusion')},{label:'Paralyse',effect:status('paralysis')},{label:'Poison',effect:status('poison')}]},


 coinClamp:{type:'coinAttackGate',heads:status('paralysis')},
 coinAttackLock:flip({type:'lock',action:'attack',duration:'opponentTurn'}),
 selfSleep:status('sleep','self'),poison:status('poison'),
 twoHeadsPlus60:{type:'allHeadsBonus',coins:2,amount:60},
 waterGun:{type:'energyDamage',source:'self',energyType:'Water',extraAbove:1,maxCount:2,amount:10},
 nightSpirits:{type:'coinDamageByPokemon',filter:{name:["Sabrina's Gastly","Sabrina's Haunter","Sabrina's Gengar"]},amount:30},
 swift:{type:'damageRule',ignoreWeakness:true,ignoreEffects:true}
};
const ATTACKS=new Map([...MOVES,...MORE_MOVES].filter(Boolean).map(row=>{const [num,moves]=row.split('|');return [Number(num),moves.split(/;(?=[A-Z][^;~]{0,70}~[GRWLPCF]*~)/).map(move=>{
 const [name,cost,rawDamage,key='',text='']=move.split('~');const effect=key?(effects[key]||{type:'notImplemented',key}):null;
 const variable=rawDamage.includes('×')||rawDamage.includes('+')||rawDamage==='?';
 return {name,cost,damage:variable?(/\+/.test(rawDamage)?Number(rawDamage.replace('+',''))||0:0):Number(rawDamage)||0,damageText:variable?rawDamage:null,effect,text};
 })];}));
// Gym Heroes powers are separate from attack effects. Enabled Powers must use
// a real engine operation; unimplemented Powers continue to block battle use.
const POWER={
 5:{name:'Pollen Defense',text:'If an attack damages Erika’s Vileplume while Active, flip a coin. On heads, the attacking Pokémon becomes Confused.',type:'triggered',event:'damagedByAttack',activeOnly:true,disabledByStatus:false,effect:flip(status('confusion'))},
 8:{name:'Energy Charge',text:'As often as you like while Lt. Surge’s Magneton is Active, move a Lightning Energy from another of your Pokémon to it.',type:'activated',activeOnly:true,oncePerTurn:false,disabledByStatus:true,effect:{type:'moveEnergy',source:'selfBench',target:'self',energyType:'Lightning',amount:1}},
 26:{name:'Fragrance Trap',text:'Once during your turn, flip a coin. On heads, bring one opposing Benched Pokémon Active.',type:'activated',oncePerTurn:true,disabledByStatus:true,effect:flip({type:'forceOpponentSwitch'})},
 29:{name:'Shell Armor',text:'Prevent 10 damage from attacks against Misty’s Cloyster after Weakness and Resistance.',type:'passive',disabledByStatus:true,effect:{type:'modifier',stat:'damageReduction',amount:10,duration:'whileInPlay',scope:'self'}},
 33:{name:'Restless Sleep',text:'When an attack damages Rocket’s Snorlax while it is already Asleep, deal 20 damage to the attacker.',type:'triggered',event:'damagedByAttack',disabledByStatus:false,effect:{type:'damage',target:'opponentActive',amount:20,condition:{type:'selfStatus',status:'sleep'}}},
 65:{name:'Natural Healing',text:'Once during your turn, remove one damage counter from Blaine’s Vulpix.',type:'activated',disabledByStatus:true,oncePerTurn:true,effect:{type:'healSelf',amount:10}}
};
const UNIMPLEMENTED_POWERS=new Set([2,10,12,14,42,47]);
const TRAINERS={
 15:{text:'Remove one damage counter from each of your damaged Pokémon.',effect:{type:'heal',target:'selfAll',amount:10}},
 98:{text:'Remove one damage counter from each of your damaged Pokémon.',effect:{type:'heal',target:'selfAll',amount:10}},
 106:{text:'Search your deck for a Basic or Evolution Pokémon with Brock in its name, reveal it and put it into your hand. Shuffle afterward.',effect:{type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon',nameContains:'Brock'}}},
 125:{text:'Each player shuffles their hand into their deck, then draws that same number of cards.',effect:{type:'handShuffle',side:'both',draw:'same'}},
 110:{text:'Look at the opponent’s hand. Choose any number of Basic Pokémon there and move them to their Bench while it has space.',effect:{type:'benchBasicsFromOpponentHand'}}
};
// Rules summaries remain available for every print, even if the underlying
// battle mechanic is not yet ready. They are not used to grant playability.
const TRAINER_DESCRIPTIONS={
 15:'Heal 10 damage from each of your Pokémon that has damage counters.',
 16:'Each player may draw up to three cards, beginning with you.',
 17:'Put a Basic Pokémon from your hand into the Active position; move your previous Active to the Bench. Requires free Bench space.',
 18:'Discard two other cards from your hand to give attacks by your Misty Pokémon 20 additional damage this turn.',
 19:'Flip a coin. If heads, the opponent shuffles their hand into the deck and draws a new hand of four.',
 97:'Present a Pokémon from your hand. Your opponent guesses its length; the correct guess rewards them with two draws, otherwise you draw two.',
 98:'Remove one damage counter from each of your damaged Pokémon.',
 99:'Attach this to your Active Pokémon for the turn. You may reduce damage it deals to the defender in increments of 10.',
 100:'Each player may draw up to three cards, beginning with you.',
 101:'Move a Basic Pokémon from your hand into the Active position, moving your previous Active to the Bench. Requires free Bench space.',
 102:'Discard two other cards; attacks by your Misty Pokémon deal 20 additional damage to the defender this turn.',
 103:'Stadium. Playing Energy Removal or Super Energy Removal requires discarding two extra cards from hand.',
 104:'Stadium. All Pokémon have one additional Colorless Energy retreat cost.',
 105:'If this is your only card in hand, show your hand and draw five cards.',
 106:'Search your deck for a Pokémon whose name includes Brock, add it to your hand, then shuffle.',
 107:'Stadium. Once per turn, a player may discard Energy from their Erika Pokémon to clear its Special Conditions.',
 108:'Stadium. Pokémon with Misty in their names retreat for one Colorless Energy less.',
 109:'Trade two other cards in hand to search the deck for up to two Erika Pokémon, then shuffle.',
 110:'Choose any number of Basic Pokémon in your opponent’s hand and put them onto their Bench, subject to the Bench limit.',
 111:'When you have no Basic Pokémon in hand, show your hand and search your deck for a Basic Pokémon.',
 112:'The opponent chooses: both players take one Prize card into hand, or you draw one card.',
 113:'Flip two coins; on two heads return an opposing Benched Pokémon and its attached cards to hand, otherwise end your turn.',
 114:'Look at the top seven cards of your deck, take any two, and discard the remainder.',
 115:'Stadium. Ignore Resistance when a Brock Pokémon makes an attack.',
 116:'Your Active Pokémon may attack using one of the lower Evolution cards beneath it for this turn, paying the required Energy.',
 117:'Attach to one Sabrina Pokémon. Once this turn, you may reroll all coins for its attack.',
 118:'Look at the opponent’s hand, then discard any number of your other hand cards and draw as many.',
 119:'Flip a coin. Heads temporarily hides the opponent’s hand until their next turn ends; tails ends your turn immediately.',
 120:'Stadium. Lt. Surge Pokémon may flip a coin on each attack: heads adds 10 damage, tails deals 10 damage to themselves.',
 121:'Discard as many other cards from your hand as you like; on heads draw twice that many cards.',
 122:'Return any number of attached Energy cards from each of your Pokémon to your hand.',
 123:'Play Rock–Paper–Scissors. The winner reshuffles their hand and draws five cards.',
 124:'Stadium. Players may have only four Benched Pokémon, returning any extras and attachments to hand.',
 125:'Each player shuffles their hand into their deck, then draws that same number of cards.',
 126:'Shuffle the discard pile into the deck, then discard that many cards from its top.'
};
const STADIUM_NUMBERS=new Set([103,104,107,108,115,120,124]);
const CARDS=DATA.map(row=>{
 const [rawNumber,name,type,stage,hp,ret,weak,res,evolvesFrom]=row.split('|');const number=Number(rawNumber),basicEnergy=number>=127,kind=basicEnergy?'energy':number>=97||number>=15&&number<=19?'trainer':'pokemon';
 const attacks=ATTACKS.get(number)||[],abilities=POWER[number]?[POWER[number]]:[],reasons=[];
 if(kind==='pokemon'&&!ATTACKS.has(number))reasons.push('Printed attacks not yet implemented');
 if(kind==='pokemon'&&UNIMPLEMENTED_POWERS.has(number))reasons.push('Printed Pokémon Power not yet implemented');
 if(abilities.some(power=>!fx?.supportsEffect?.(power.effect)))reasons.push('Pokémon Power effect not supported by engine');
 if(kind==='trainer'&&!TRAINERS[number])reasons.push('Printed Gym Trainer effect not yet implemented');
 if(kind==='trainer'&&TRAINERS[number]&&!fx?.supportsEffect?.(TRAINERS[number].effect))reasons.push('Gym Trainer effect not supported by engine');
 if(basicEnergy)reasons.push('Basic Energy is supplied separately by the Classic Energy Zone');
 if(attacks.some(a=>a.effect&&!fx?.supportsEffect?.(a.effect)))reasons.push('Attack effect not supported by current battle engine');
 if(kind==='pokemon'&&attacks.length&&attacks.some(a=>a.effect?.type==='notImplemented'))reasons.push('Printed attack effect not yet implemented');
 const battleEnabled=!reasons.length;
 return {id:`gym1-${number}`,setId:'gym1',number:String(number),name,source:'tcg',battleFormat:'classic',kind,
   ...(kind==='pokemon'?{stage:stage==='0'?'Basic':`Stage ${stage}`,hp:Number(hp),retreat:Number(ret),types:[TYPE[type]],subtype:TYPE[type],evolvesFrom:evolvesFrom||null,
    weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,attacks,abilities}:{}),
   ...(kind==='trainer'?{trainerType:STADIUM_NUMBERS.has(number)?'Stadium':'Item',text:TRAINERS[number]?.text||TRAINER_DESCRIPTIONS[number]||'',effect:TRAINERS[number]?.effect||null}:{}),...(basicEnergy?{basicEnergy:true,subtype:TYPE[type],types:[TYPE[type]]}:{}),
   battleEnabled,deckEligible:battleEnabled,support:{status:battleEnabled?'FULL':'PARTIAL',reasons},
   rarity:number<=19?'Rare Holo':number<=34?'Rare':number<=60?'Uncommon':number<=96?'Common':number<=104?'Rare':number<=120?'Uncommon':'Common',
   image:`https://images.pokemontcg.io/gym1/${number}.png`,imageLarge:`https://images.pokemontcg.io/gym1/${number}_hires.png`};
});
if(CARDS.length!==132||new Set(CARDS.map(c=>c.id)).size!==132)throw new Error('Gym Heroes identity mismatch');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
  coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,
   partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
