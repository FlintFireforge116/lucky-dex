/* LuckyDex Classic TCG — Majestic Dawn (dp5), v0.69.248.
 * Exact collector identity/HP/type/weakness/cost metadata from
 * PokemonTCG/pokemon-tcg-data cards/en/dp5.json.
 * Only cards with actual implemented attack/Trainer outcomes are battle-enabled.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGMajesticDawn=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET={id:'dp5',name:'Majestic Dawn',series:'Diamond & Pearl',releaseDate:'2008-05-21',cardCount:100,printedTotal:100};
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Articuno|P|Basic|100|W||M×2|F-20|2|Rare Holo|Blizzard~WWC~60|Freezing Screech~Power
2|Cresselia|P|Basic|70|P||P+20||1|Rare Holo|Future Sight~C~;Healing Light~PPC~40|
3|Darkrai|P|Basic|80|D||F+20|P-20|2|Rare Holo|Dark Slumber~D~10;Dark Resolve~DDC~40|Darkness Shade~Power
4|Dialga|P|Basic|100|M||R+20|P-20|3|Rare Holo|Time Shift~M~;Diamond Blast~MMCC~60+|
5|Glaceon|P|Stage 1|80|W|Eevee|M+20||1|Rare Holo|Snow Cloak~W~30;Speed Slide~WCC~60|
6|Kabutops|P|Stage 2|120|F|Kabuto|G+30||2|Rare Holo|Chop Up~FFC~70|Primal Shell~Body
7|Leafeon|P|Stage 1|90|G|Eevee|R+20|W-20|2|Rare Holo|Bind Down~G~30;Leaf Guard~GCC~60|
8|Manaphy|P|Basic|70|W||L+20||1|Rare Holo|Chase Up~C~;Fountain~WW~30|Aqua Skin~Body
9|Mewtwo|P|Basic|90|P||P×2||2|Rare Holo|Energy Absorption~~;Recover~P~;Psyburn~PPC~60|
10|Moltres|P|Basic|100|R||W×2|F-20|2|Rare Holo|Scorching Wing~RRC~100|Flame Charge~Power
11|Palkia|P|Basic|100|W||L+20||3|Rare Holo|Zone Shift~W~;Pearl Blast~WWCC~60|
12|Phione|P|Basic|60|W||L+10||1|Rare Holo|Evolution Wish~C~;Water Pulse~WW~30|
13|Rotom|P|Basic|60|L||D+20|C-20|1|Rare Holo|Dual Trans~~;Reflect Energy~LC~30|
14|Zapdos|P|Basic|100|L||L×2|F-20|2|Rare Holo|Raging Thunder~LLC~80|Sheet Lightning~Power
15|Aerodactyl|P|Stage 1|80|C|Old Amber|L+20|F-20|1|Rare|Supersonic~CC~30|Primal Claw~Body
16|Bronzong|P|Stage 1|90|P|Bronzor|P+20|R-20|3|Rare|Pain Amplifier~~;Coating~PCC~60|Cursed Alloy~Body
17|Empoleon|P|Stage 2|130|W|Prinplup|L+30||2|Rare|Dual Splash~WC~;Surf Together~WWC~50+|
18|Espeon|P|Stage 1|80|P|Eevee|P+20||1|Rare|Morning Sun~PCC~60|Sunlight Veil~Body
19|Flareon|P|Stage 1|90|R|Eevee|W+20||2|Rare|Fire Fang~R~30;Kindle~RCC~70|
20|Glaceon|P|Stage 1|90|W|Eevee|M+20||1|Rare|Ice Shot~WC~30;Icy Wind~WCC~60|
21|Hippowdon|P|Stage 1|100|F|Hippopotas|W+20||3|Rare|Vacuum Sand~~20;Sand Impact~FCC~50+|
22|Infernape|P|Stage 2|110|R|Monferno|W+30||0|Rare|Mach Punch~C~30;Mega Bravo~R~40×|
23|Jolteon|P|Stage 1|80|L|Eevee|F+20|M-20|0|Rare|Thunder Fang~L~20;Lightning Strike~LLC~50|
24|Leafeon|P|Stage 1|90|G|Eevee|R+20|W-20|1|Rare|Sprial Drain~GC~40;Leaf Blade~GCC~50+|
25|Minun|P|Basic|60|L||F+10|M-20|1|Rare|Pound~C~10;(+) Spark~LC~20|
26|Omastar|P|Stage 2|110|W|Omanyte|G+30||1|Rare|Send Back~WC~40|Primal Swirl~Power
27|Phione|P|Basic|70|W||L+10||1|Rare|Charm~C~;Whirlpool~WW~30|
28|Plusle|P|Basic|60|L||F+10|M-20|1|Rare|Call for Family~C~;– Boost~LC~20+|
29|Scizor|P|Stage 1|90|M|Scyther|R+30|P-20|1|Rare|Special Blow~M~30+;X-Scissor~MCC~50+|
30|Torterra|P|Stage 2|140|G|Grotle|R+30||4|Rare|Earthquake~CC~60;Frenzy Plant~GGCC~100|
31|Toxicroak|P|Stage 1|90|P|Croagunk|P+20||1|Rare|Paralyze Poison~P~20;Slash~PCC~60|
32|Umbreon|P|Stage 1|80|D|Eevee|F+20|P-20|1|Rare|Confuse Ray~DCC~50|Moonlight Veil~Body
33|Unown [P]|P|Basic|50|P||P+10||1|Rare|Hidden Power~P~20+|PUT~Power
34|Vaporeon|P|Stage 1|90|W|Eevee|L+20||1|Rare|Cleanse Away~W~30;Hyper Whirlpool~WCC~60|
35|Ambipom|P|Stage 1|80|C|Aipom|F+20||1|Uncommon|Astonish~CC~20;Hang High~CCC~|
36|Fearow|P|Stage 1|80|C|Spearow|L+20|F-20|0|Uncommon|Fury Attack~C~20×;Drill Peck~CCC~60|
37|Grotle|P|Stage 1|90|G|Turtwig|R+20|W-20|3|Uncommon|Planting~C~20;Body Slam~GGC~40|
38|Kangaskhan|P|Basic|90|C||F+20||3|Uncommon|Bite~CC~30;Comet Punch~CCC~20×|
39|Lickitung|P|Basic|70|C||F+20||2|Uncommon|Lap Up~C~;Slam~CC~20×|
40|Manectric|P|Stage 1|80|L|Electrike|F+20|M-20|0|Uncommon|Thunder Wave~L~30;Volt Crush~LC~40+|
41|Monferno|P|Stage 1|70|R|Chimchar|W+20||0|Uncommon|Fire Fang~R~30;Mid-air Strike~CC~30+|
42|Mothim|P|Stage 1|80|G|Burmy|R+20|F-20|0|Uncommon|Get Help~G~30×;Quick Touch~GC~40|Disturbance Scales~Body
43|Pachirisu|P|Basic|70|L||F+20|M-20|1|Uncommon|Trans Tail~~;Thundershock~LC~30|
44|Prinplup|P|Stage 1|80|W|Piplup|L+20||1|Uncommon|Ice Blade~WC~;Wash Over~WCC~50|
45|Raichu|P|Stage 1|90|L|Pikachu|F+20|M-20|0|Uncommon|Agility~C~20;Thunderbolt~LLC~100|
46|Scyther|P|Basic|70|G||R+20|F-20|1|Uncommon|Slash~C~10;Fury Cutter~GC~10+|
47|Staravia|P|Stage 1|80|C|Starly|L+20|F-20|0|Uncommon|Quick Attack~C~10+;Drill Peck~CCC~50|
48|Sudowoodo|P|Basic|80|F||W+20||2|Uncommon|Flail~C~10×;Wood Hammer~FF~50|
49|Unown [Q]|P|Basic|30|P||P+10||0|Uncommon|Hidden Power~C~20|QUICK~Power
50|Aipom|P|Basic|60|C||F+10||1|Common|Collect~C~;Hand Trick~CC~20|
51|Aipom|P|Basic|60|C||F+10||1|Common|Scratch~C~10;Last Resort~CC~30|
52|Bronzor|P|Basic|50|P||P+10|R-20|1|Common|Hypnosis~C~;Confuse Ray~P~10|
53|Buneary|P|Basic|50|C||F+10||1|Common|Drawup Power~~;Extend Ears~C~10|
54|Burmy Sandy Cloak|P|Basic|50|G||R+10||1|Common|Iron Defense~C~;Tackle~FC~30|
55|Chatot|P|Basic|60|C||L+20|F-20|0|Common|Mimic~~;Chatter~CC~20|
56|Chimchar|P|Basic|40|R||W+10||1|Common|Flare~R~20;Lunge~CC~40|
57|Chimchar|P|Basic|50|R||W+10||1|Common|Fury Swipes~C~10×|
58|Chingling|P|Basic|40|P||P+10||1|Common|Uproar~~|Baby Evolution~Power
59|Combee|P|Basic|50|G||R+10|F-20|1|Common|Honey Scent~C~;Flitter~GG~|
60|Croagunk|P|Basic|60|P||P+10||1|Common|Light Punch~C~10;Poison Sting~P~|
61|Drifloon|P|Basic|60|P||D+10|C-20|1|Common|Delivery~~;Reaction~P~20|
62|Eevee|P|Basic|60|C||F+10||1|Common|Call for Family~C~;Lunge~C~20|
63|Eevee|P|Basic|60|C||F+10||1|Common|Gnaw~~10;Sand Attack~C~|
64|Electrike|P|Basic|60|L||F+10|M-20|1|Common|Random Spark~L~;Tackle~CC~20|
65|Glameow|P|Basic|60|C||F+10||1|Common|Call for Family~C~;Rip Claw~CC~10|
66|Hippopotas|P|Basic|60|F||W+10||2|Common|Grainy Sand~F~10+;Double-edge~CCC~40|
67|Kabuto|P|Stage 1|80|F|Dome Fossil|G+20||1|Common|Shell Attack~F~20|Ancient Guidance~Power
68|Munchlax|P|Basic|60|C||F+10||2|Common|Lick~CC~20|Baby Evolution~Power
69|Omanyte|P|Stage 1|70|W|Helix Fossil|G+20||1|Common|Wash Over~WC~20|Call Up~Power
70|Pikachu|P|Basic|60|L||F+10|M-20|1|Common|Quick Attack~C~10+;Volt Tackle~LCC~50|
71|Piplup|P|Basic|60|W||L+10||1|Common|Water Splash~W~10+;Headbutt~CC~20|
72|Piplup|P|Basic|50|W||L+10||1|Common|Splatter~W~|
73|Shellos East Sea|P|Basic|60|W||L+10||2|Common|Surf~C~10;Muddy Water~WC~20|
74|Spearow|P|Basic|50|C||L+10|F-20|1|Common|Wing Attack~C~10;Claw~CC~30|
75|Starly|P|Basic|50|C||L+10|F-20|1|Common|Whirlwind~C~10;Flap~CC~20|
76|Stunky|P|Basic|60|D||F+10|P-20|1|Common|Poison Gas~D~;Slash~CC~20|
77|Turtwig|P|Basic|60|G||R+10|W-20|2|Common|Rollout~C~10;Razor Leaf~GC~30|
78|Turtwig|P|Basic|60|G||R+10|W-20|2|Common|Bite~GC~30|
79|Dawn Stadium|T|Stadium||||||0|Uncommon||
80|Dusk Ball|T|Item||||||0|Uncommon||
81|Energy Restore|T|Item||||||0|Uncommon||
82|Fossil Excavator|T|Supporter||||||0|Uncommon||
83|Mom's Kindness|T|Supporter||||||0|Uncommon||
84|Old Amber|T|Item|50|||||0|Uncommon||Hard Amber~Body
85|Poké Ball|T|Item||||||0|Uncommon||
86|Quick Ball|T|Item||||||0|Uncommon||
87|Super Scoop Up|T|Item||||||0|Uncommon||
88|Warp Point|T|Item||||||0|Uncommon||
89|Dome Fossil|T|Item|50|||||0|Common||Rock Reaction~Body
90|Energy Search|T|Item||||||0|Common||
91|Helix Fossil|T|Item|50|||||0|Common||Aqua Reaction~Body
92|Call Energy|E|Special||||||0|Uncommon||
93|Darkness Energy|E|Special||||||0|Uncommon||
94|Health Energy|E|Special||||||0|Uncommon||
95|Metal Energy|E|Special||||||0|Uncommon||
96|Recover Energy|E|Special||||||0|Uncommon||
97|Garchomp LV.X|P|Level-Up|140|C|Garchomp|C×2||0|Rare Holo LV.X|Restore~~|Dragon Pulse~Power
98|Glaceon LV.X|P|Level-Up|100|W|Glaceon|M+30||1|Rare Holo LV.X|Avalanche~WWC~70|Chilly Breath~Body
99|Leafeon LV.X|P|Level-Up|110|G|Leafeon|R+30|W-20|2|Rare Holo LV.X|Verdant Dance~GC~30+|Energy Forcing~Power
100|Porygon-Z LV.X|P|Level-Up|130|C|Porygon-Z|F×2||2|Rare Holo LV.X||Mode Crash~Power;Decode~Power`;
const N={type:'noop'};
const seq=(...effects)=>({type:'sequence',effects});
const flip=(heads=N,tails=N)=>({type:'coinFlip',heads,tails});
const status=(status,target='opponentActive')=>({type:'status',target,status});
const bonus=(amount,condition)=>({type:'bonusDamage',amount,...(condition?{condition}:{})});
const lock=(action,target='opponentActive',duration='opponentTurn',attackName)=>({type:'lock',action,target,duration,...(attackName?{attackName}:{})});
const rule=(id)=>({type:'neoRule',rule:id});
const bench=(side,amount,all=false)=>({type:'benchDamage',side,amount,all});
const chosen=(amount)=>({type:'selectedDamage',target:'opponentPokemon',amount,ignoreWeakness:true,ignoreResistance:true});
const mod=(stat,amount,scope='self',duration='opponentTurn')=>({type:'modifier',stat,amount,scope,duration});
const coinDamage=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'});
const search=(filter,amount=1)=>({type:'searchChosen',source:'deck',amount,filter});
const READY=new Set([97,98,99,100,3,10,15,26,33,42,49,92,67,69,84,89,91,1,6,8,14,16,18,32,9,11,12,13,17,19,23,34,40,43,50,58,68,79,94,96,21,22,29,44,2,4,5,7,20,24,25,27,28,30,31,35,36,37,38,39,41,45,46,47,48,51,52,53,54,55,56,57,59,60,61,62,63,64,65,66,70,71,72,73,74,75,76,77,78,80,81,82,83,85,86,87,88,90,93,95]);
const EFFECTS={
 97:[rule('dp5:97:restore')],
 98:[flip({type:'benchDamage',side:'opponent',all:true,amount:20})],
 99:[rule('dp5:99:verdantDance')],

 3:[rule('dp5:3:darkSlumber'),rule('dp5:3:darkResolve')],
 10:[rule('dp5:10:scorchingWing')],
 15:[flip(status('confusion'))],26:[{type:'forceOpponentSwitch'}],
 33:[rule('dp5:33:hiddenPower')],
 42:[rule('dp5:42:getHelp'),rule('dp5:42:quickTouch')],
 49:[N],

 1:[flip(bench('opponent',10,true),bench('self',10,true))],
 6:[{type:'benchDamage',side:'opponent',all:true,amount:10,filter:{damaged:true}}],
 8:[flip(search({},1)),rule('dp5:8:fountain')],
 14:[rule('dp5:14:ragingThunder')],
 16:[rule('dp5:16:painAmplifier'),mod('damageReduction',20)],
 18:[rule('dp5:18:morningSun')],
 32:[status('confusion')],
 67:[N],69:[{type:'multiTargetDamage',target:'opponentBench',count:2,amount:10}],

 9:[rule('dp5:9:energyAbsorption'),rule('dp5:9:recover'),N],
 11:[{type:'forceOpponentSwitch'},rule('dp5:11:pearlBlast')],
 12:[rule('dp5:12:evolutionWish'),status('sleep')],
 13:[rule('dp5:13:dualTrans'),rule('dp5:13:reflectEnergy')],
 17:[{type:'multiTargetDamage',target:'opponentPokemon',count:2,amount:30},rule('dp5:17:surfTogether')],
 19:[flip(status('burn')),rule('dp5:19:kindle')],
 23:[flip(status('paralysis')),rule('dp5:23:lightningStrike')],
 34:[{type:'heal',target:'selfBenchAll',amount:20},rule('dp5:34:hyperWhirlpool')],
 40:[flip(status('paralysis')),rule('dp5:40:voltCrush')],
 43:[rule('dp5:43:transTail'),flip(status('paralysis'))],
 50:[{type:'draw',amount:1},rule('dp5:50:handTrick')],
 58:[flip(bench('opponent',10,true))],
 68:[flip(status('paralysis'))],

 21:[{type:'attachEnergyFromDiscard',energyType:'Fighting',amount:1}, {type:'coinDamageByEnergy',energyType:'Fighting',countAttachedEnergyType:true,amount:20}],
 22:[bench('opponent',10),seq({type:'energyDamage',source:'self',energyType:'Fire',amount:40,mode:'replace'}, {type:'discardEnergyCard',target:'self',energyType:'Fire',strictEnergyType:true,amount:'all'})],
 29:[bonus(50,{type:'opponentHasSpecialEnergy'}),flip(bonus(40))],
 44:[chosen(30),{type:'multiTargetDamage',target:'opponentBench',count:2,amount:10}],
 2:[rule('dp3:96:futureSight'),{type:'heal',target:'selfAll',amount:10}],
 5:[flip({type:'preventDamage',target:'self',duration:'opponentTurn'}),{type:'damageRule',ignoreResistance:true,ignoreEffects:true}],
 37:[{type:'attachEnergy',source:'hand',energyType:'Grass',amount:1,target:'selfPokemon'},flip(status('paralysis'))],
 45:[flip({type:'preventDamage',target:'self',duration:'opponentTurn'}),{type:'discardEnergyCard',target:'self',amount:'all'}],
 46:[N,{type:'coinTierBonus',coins:3,tiers:{0:0,1:10,2:20,3:40}}],
 55:[{type:'handShuffle',draw:'opponentHandCount'},lock('retreat')],
 59:[{type:'heal',target:'selfPokemon',amount:20},chosen(20)],
 61:[flip({type:'searchChosen',source:'discard',amount:1}),{type:'switch',side:'self'}],
 4:[{type:'drawToHandSize',size:6},flip(bonus(20))],
 7:[lock('retreat'),mod('damageReduction',20)],
 20:[bench('opponent',10),flip(status('sleep'))],
 24:[{type:'healSelf',amount:10},flip(bonus(20))],
 25:[N,{type:'benchDamage',side:'opponent',amount:20,condition:{type:'pokemonPresent',zone:'bench',filter:{name:'Plusle'}}}],
 27:[mod('attackDamage',-20,'opponentActive'),flip({type:'discardEnergyCard',target:'opponentActive',amount:1})],
 28:[{type:'benchFromDeck',amount:1,choose:true,filter:{kind:'pokemon',stage:'Basic'}},bonus(20,{type:'pokemonPresent',zone:'bench',filter:{name:'Minun'}})],
 30:[bench('self',10,true),lock('attack','self','nextOwnTurn','Frenzy Plant')],
 31:[seq(status('poison'),flip(status('paralysis'))),N],
 35:[rule('dp4:7:astonish'),chosen(40)],
 36:[coinDamage(3,20),N],
 38:[N,coinDamage(4,20)],
 39:[{type:'draw',amount:1},coinDamage(2,20)],
 41:[status('burn'),flip(bonus(30))],
 47:[flip(bonus(30)),N],
 48:[{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},{type:'selfDamage',amount:30}],
 51:[N,{type:'coinAttackGate',heads:N}],
 52:[status('sleep'),flip(status('confusion'))],
 53:[search({kind:'energy'},1),{type:'heal',target:'selfBenchAll',amount:10}],
 54:[flip({type:'preventDamage',target:'self',duration:'opponentTurn'}),N],
 56:[N,{type:'coinAttackGate',heads:N}],
 57:[coinDamage(3,10)],
 60:[N,flip(status('poison'))],
 62:[{type:'benchFromDeck',amount:3,choose:true,filter:{kind:'pokemon',stage:'Basic',name:'Eevee'}},{type:'coinAttackGate',heads:N}],
 63:[N,{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'}],
 64:[chosen(10),N],
 65:[{type:'benchFromDeck',amount:1,choose:true,filter:{kind:'pokemon',stage:'Basic'}},flip({type:'discardEnergyCard',target:'opponentActive',amount:1})],
 66:[flip(bonus(10)),{type:'selfDamage',amount:10}],
 70:[flip(bonus(10)),{type:'selfDamage',amount:10}],
 71:[flip(bonus(10)),N],
 72:[chosen(10)],
 73:[N,bench('opponent',10)],
 74:[N,{type:'coinAttackGate',heads:N}],
 75:[{type:'forceOpponentSwitch'},N],
 76:[flip(status('poison')),N],
 77:[N,N],78:[N],
};
const TRAINER_EFFECTS={
 80:rule('dp2:110:dusk'),81:rule('dp1:106:energyRestore'),82:rule('dp2:111:fossilExcavator'),
 83:{type:'draw',amount:2},
 85:flip(search({kind:'pokemon'},1)),86:rule('dp2:114:quick'),
 87:flip({type:'scoopUp',target:'selfPokemon'}),88:seq({type:'forceOpponentSwitch'},rule('dp1:116:ownSwitch')),
 90:rule('ex1:basicSearch1'),79:N,84:{type:'playFossil',hp:50,subtype:'Colorless',canRetreat:false,countsAsKnockout:true},89:{type:'playFossil',hp:50,subtype:'Colorless',canRetreat:false,countsAsKnockout:true},91:{type:'playFossil',hp:50,subtype:'Colorless',canRetreat:false,countsAsKnockout:true},
};
const ENERGIES={92:{type:'specialEnergy',provides:{Colorless:1}},94:{type:'specialEnergy',provides:{Colorless:1}},96:{type:'specialEnergy',provides:{Colorless:1}},93:{type:'specialEnergy',provides:{Darkness:1}},95:{type:'specialEnergy',provides:{Metal:1}}};
const ENERGY_TEXT={92:'Provides Colorless Energy. Once per turn while attached to the Active Pokémon, search for up to two Basic Pokémon and Bench them; doing so ends your turn.',94:'Provides Colorless Energy. Heal 10 damage when attached from hand.',96:'Provides Colorless Energy. Remove all Special Conditions when attached from hand.',93:'Provides Darkness Energy. Adds 10 attack damage only when attached to a Darkness Pokémon.',95:'Provides Metal Energy. Reduces incoming attack damage by 10 only on Metal Pokémon.'};
const TRAINER_TEXT={84:'Play Old Amber as a Basic 50 HP Colorless Pokémon. Prevent attack damage while Benched; may discard voluntarily; Knock Out awards a Prize.',89:'Play Dome Fossil as a Basic 50 HP Colorless Pokémon. Hand-attached Fighting Energy triggers Kabuto evolution.',91:'Play Helix Fossil as a Basic 50 HP Colorless Pokémon. Hand-attached Water Energy triggers Omanyte evolution.',79:'Whenever a hand Energy is attached to a Grass or Water Pokémon, remove one damage counter and all Special Conditions.',80:'Look at the bottom seven cards; select one actual Pokémon card and shuffle the remainder.',81:'Flip three coins and recover one Basic Energy from discard per heads.',82:'Search deck or discard for a Fossil Trainer or Fossil Evolution.',83:'Draw two cards.',85:'Flip a coin; heads search the deck for a Pokémon.',86:'Reveal cards until the first Pokémon is found; add that card to hand.',87:'Flip a coin; heads return one of your Pokémon and all attachments to hand.',88:'Opponent switches their Active Pokémon; then you switch yours.',90:'Search the deck for a Basic Energy card.'};
const ATTACK_TEXT={
 21:['Attach one discarded Fighting Energy to Hippowdon.','Flip a coin for each Fighting Energy attached; add 20 damage per heads.'],
 22:['Deal 10 damage to one opposing Benched Pokémon.','Discard all Fire Energy attached to Infernape; deal 40 damage per Energy discarded.'],
 29:['Add 50 damage if the Defending Pokémon has Special Energy.','Flip a coin; heads adds 40 damage.'],
 44:['Select an opposing Pokémon; deal 30 damage, ignoring Bench Weakness and Resistance.','Select two different opposing Benched Pokémon; deal 10 damage to each.'],
 1:['Flip a coin: heads hit every opposing Benched Pokémon for 10; tails hit each of yours.'],
 6:['Deal 10 damage to each opposing Benched Pokémon already damaged.'],
 8:['Flip a coin: heads search for any card.','Attach up to two physical Basic Water Energy cards from hand to Benched Pokémon.'],
 14:['Deal 40 damage to one of your own Pokémon, selected by you.'],
 16:['Put one damage counter on every opposing Pokémon which already has damage counters.','Reduce incoming attack damage to Bronzong by 20 next opponent turn.'],
 67:['20 damage.'],69:['Deal 10 damage to each of two opposing Benched Pokémon.'],
 18:['Optionally move an attached Energy card to one of your Benched Pokémon.'],
 32:['Confuse the Defending Pokémon.'],
 3:['At the end of the Defending Pokémon’s next turn, it becomes Asleep.','If the Defending Pokémon is Asleep, heal 40 damage from Darkrai.'],
 10:['Discard all Fire Energy attached to Moltres.'],
 15:['Flip a coin; on heads, the Defending Pokémon becomes Confused.'],
 26:['Opponent switches its Active Pokémon with one of its Benched Pokémon.'],
 33:['Discard one card from the top of each deck; +20 damage for every Unown discarded.'],
 42:['Deal 30 damage per different Wormadam cloak on your Bench.','Optionally switch with a Benched Pokémon and move any number of Energy to the new Active.'],
 49:['Deal 20 damage.'],
 97:['Choose one non-LV.X Pokémon from discard and Bench it as a Basic Pokémon; optionally attach up to three Basic Energy cards from discard.'],
 98:['Flip a coin: on heads, deal 20 damage to every opposing Benched Pokémon.'],
 99:['Deal 30 damage plus 10 for each Energy card attached to all your Pokémon.'],
 9:['Choose up to two physical Energy cards from your discard to attach to Mewtwo.','Discard a Psychic Energy attached to Mewtwo to heal 60 damage.',''],
 11:['Force the opponent to switch their Active Pokémon.','Optionally return an Energy attached to Palkia and one attached to the Defending Pokémon to their owners’ hands.'],
 12:['Search your deck for a card that evolves one of your Pokémon and evolve that Pokémon.','The Defending Pokémon is now Asleep.'],
 13:['Select up to two basic Energy from discard and attach them to one Pokémon.','Move an Energy attached to Rotom to one of your Benched Pokémon.'],
 17:['Hit two different opponent Pokémon for 30 damage each.','Add 10 damage for each of your Benched Pokémon, then flip a coin: tails hits each of your Benched Pokémon for 10.'],
 19:['Flip a coin; heads Burns the Defending Pokémon.','Discard one Energy attached to Flareon and one from the Defending Pokémon.'],
 23:['Flip a coin; heads Paralyzes.','Optionally discard two Energy attached to Jolteon to deal 90 damage rather than 50.'],
 34:['Heal 20 from each of your Benched Pokémon.','Flip until tails, discard one opposing attached Energy per heads.'],
 40:['Flip a coin; heads Paralyzes.','Flip a coin; heads allows a Manectric Energy discard to add 30 damage.'],
 43:['Take one physical Lightning Energy from discard to hand.','Flip a coin; heads Paralyzes.'],
 50:['Draw a card.','Return Aipom and all attachments to hand, if you have a Benched Pokémon.'],
 58:['Flip a coin; heads hits all opposing Pokémon for 10.'],
 68:['Flip a coin; heads Paralyzes.'],
 2:['Reorder the top five cards of either player’s deck.','Remove one damage counter from each of your Pokémon.'],
 5:['Flip a coin; heads prevent all incoming attack effects/damage next turn.','Ignore the Defending Pokémon’s Resistance, Powers, Bodies and other protective effects.'],
 37:['Attach a Grass Energy card from hand to one of your Pokémon.','Flip a coin; heads Paralyze.'],
 45:['Flip a coin; heads prevent all attack effects/damage next turn.','Discard every Energy card attached to Raichu.'],
 46:['','Flip three coins; add 10/20/40 damage for one/two/three heads.'],
 55:['Shuffle your hand into your deck; draw as many cards as opponent holds.','The Defending Pokémon cannot retreat on its next turn.'],
 59:['Remove two damage counters from one of your Pokémon.','Choose an opposing Pokémon and deal 20 damage, ignoring Weakness and Resistance.'],
 61:['Flip a coin; heads recover one card from discard into hand.','Switch Drifloon with a Benched Pokémon.'],
 4:['Draw until you have six cards in hand.','Flip a coin; heads adds 20 damage.'],
 7:['The Defending Pokémon cannot retreat on its next turn.','Reduce incoming attack damage by 20 next opponent turn.'],
 20:['Deal 10 damage to one opposing Benched Pokémon.','Flip a coin; heads puts the Defending Pokémon Asleep.'],
 24:['Remove one damage counter from Leafeon.','Flip a coin; heads adds 20 damage.'],
 25:['','With Plusle on your Bench, deal 20 to one opposing Benched Pokémon.'],
 27:['Reduce the Defending Pokémon\'s attack damage by 20 next turn.','Flip a coin; heads discard an Energy attached to the Defending Pokémon.'],
 28:['Search for one Basic Pokémon and Bench it.','Add 20 damage if Minun is on your Bench.'],
 30:['Deal 10 damage to each of your own Benched Pokémon.','Torterra cannot use Frenzy Plant on its next turn.'],
 31:['Poison the Defending Pokémon; flip a coin, heads also Paralyze.',''],
 35:['Choose one concealed card from opponent hand; shuffle it into their deck.','Choose an opposing Pokémon; deal 40 damage, ignoring Bench Weakness and Resistance.'],
 36:['Flip three coins; deal 20 damage per heads.',''],38:['','Flip four coins; deal 20 damage per heads.'],
 39:['Draw one card.','Flip two coins; deal 20 damage per heads.'],
 41:['Burn the Defending Pokémon.','Flip a coin; heads adds 30 damage.'],47:['Flip a coin; heads adds 30 damage.',''],
 48:['Deal 10 damage per damage counter on Sudowoodo.','Sudowoodo does 30 damage to itself.'],
 51:['','Flip a coin; tails prevents Last Resort from doing anything.'],
 52:['Put the Defending Pokémon Asleep.','Flip a coin; heads Confuse the Defending Pokémon.'],
 53:['Search for one Energy card and put it into hand.','Remove one damage counter from each Benched Pokémon.'],
 54:['Flip a coin; heads prevent all incoming attacks next opponent turn.',''],
 56:['','Flip a coin; tails does nothing.'],57:['Flip three coins; deal 10 damage per heads.'],60:['','Flip a coin; heads Poison the Defending Pokémon.'],
 62:['Search deck for Eevee and Bench as many as fit.','Flip a coin; tails does nothing.'],
 63:['','The Defending Pokémon flips a coin when trying to attack next turn; tails fails.'],
 64:['Choose an opposing Pokémon; deal 10 damage.',''],
 65:['Search for a Basic Pokémon to Bench.','Flip a coin; heads discard an Energy from the Defending Pokémon.'],
 66:['Flip a coin; heads adds 10 damage.','Hippopotas does 10 damage to itself.'],
 70:['Flip a coin; heads adds 10 damage.','Pikachu does 10 damage to itself.'],
 71:['Flip a coin; heads adds 10 damage.',''],72:['Choose one opposing Pokémon; deal 10 damage ignoring Weakness/Resistance.'],
 73:['','Deal 10 damage to one opposing Benched Pokémon.'],74:['','Flip a coin; tails prevents the attack.'],
 75:['Opponent switches their Active Pokémon with a Benched Pokémon.',''],76:['Flip a coin; heads Poison.',''],
};
const DATA=RAW.split('\n').map(s=>s.split('|'));
function parse(row){
 const [number,name,kind,stage,hp,code,from,weak,resist,retreat,rarity,moves,powers]=row,n=Number(number),id='dp5-'+number,ready=READY.has(n);
 const pokemon=kind==='P',trainer=kind==='T',energy=kind==='E';
 const parseMod=(x)=>x?{type:T[x[0]],value:x.slice(1)}:null;
 const card={id,setId:'dp5',number:String(number),name,source:'tcg',battleFormat:'classic',rarity,
  image:`https://images.pokemontcg.io/dp5/${number}.png`,imageLarge:`https://images.pokemontcg.io/dp5/${number}_hires.png`,
  kind:pokemon?'pokemon':trainer?'trainer':'energy'};
 if(pokemon){const w=parseMod(weak),r=parseMod(resist);
  Object.assign(card,{stage,hp:Number(hp),types:[...code].map(x=>T[x]),subtype:T[code[0]],retreat:Number(retreat),evolvesFrom:from||null,
   weakness:w?.type||null,weaknessValue:w?.value||null,weaknesses:w?[w]:[],resistance:r?.type||null,resistanceValue:r?.value||null,resistances:r?[r]:[],
   attacks:(moves||'').split(';').filter(Boolean).map((s,i)=>{const [attackName,cost='',damageText='']=s.split('~');return {name:attackName,cost,damage:Number((damageText.match(/^\d+/)||[])[0]||0),damageText:damageText||null,text:ATTACK_TEXT[n]?.[i]??(ready?'':'Pending printed-effect outcome verification.'),effect:EFFECTS[n]?.[i]||N};}),
   abilities:(powers||'').split(';').filter(Boolean).map(s=>{const [abilityName,kind]=s.split('~');return {name:abilityName,type:kind==='Power'?'activated':'passive',printedPowerType:kind==='Power'?'power':'body',disabledByStatus:kind==='Power',text:'Requires a dedicated timing/choice regression before battle release.',effect:N};}),
   isLevelX:stage==='Level-Up',levelUpFrom:stage==='Level-Up'?from:null});
  if(n===58||n===68){const partner=n===58?'Chimecho':'Snorlax';card.abilities=[{name:'Baby Evolution',type:'activated',printedPowerType:'power',disabledByStatus:false,effect:rule('dp5:'+n+':babyEvolution'),text:'Choose a physical '+partner+' in hand to evolve this Baby and clear damage.'}];}
  const dp5Ability={
    1:{type:'triggered',event:'benched',fromHandOnly:true,oncePerTurn:false,text:'When played from hand onto your Bench, optionally flip; heads Paralyze the opposing Active Pokémon.',effect:rule('dp5:1:freezingScreech')},
    6:{type:'passive',text:'While Kabutops is your Active Pokémon, the opponent cannot play Item Trainer cards from hand.',effect:N},
    8:{type:'triggered',event:'energyAttached',energyType:'Water',fromHandOnly:true,oncePerTurn:false,disabledByStatus:false,text:'When Water Energy is attached from hand to Manaphy, remove two damage counters from it.',effect:{type:'healSelf',amount:20}},
    14:{type:'triggered',event:'benched',fromHandOnly:true,oncePerTurn:false,text:'When played from hand onto your Bench, optionally flip; heads place one damage counter on every opposing Pokémon.',effect:rule('dp5:14:sheetLightning')},
    16:{type:'triggered',event:'checkup',activeOnly:true,oncePerTurn:false,disabledByStatus:false,text:'Between turns place one damage counter on each opposing Pokémon with a Poké-Power.',effect:rule('dp5:16:cursedAlloy')},
    18:{type:'passive',disabledByStatus:false,text:'Your Pokémon that evolve from Eevee have +20 HP (only one Sunlight Veil applies).',effect:N},
    32:{type:'passive',disabledByStatus:false,text:'Pokémon evolving from Eevee have no Weakness and their Retreat Cost is zero.',effect:N},
    3:{type:'triggered',event:'benched',fromHandOnly:true,oncePerTurn:false,text:'When played from your hand to your Bench, choose the Defending Pokémon; it is now Asleep.',effect:rule('dp5:3:darknessShade')},
    10:{type:'triggered',event:'benched',fromHandOnly:true,oncePerTurn:false,text:'When played from your hand to your Bench, optionally flip; heads attach up to three Fire Energy from discard.',effect:rule('dp5:10:flameCharge')},
    15:{type:'triggered',event:'opponentPower',oncePerTurn:false,disabledByStatus:false,text:'After the opponent uses a Poké-Power, put two damage counters on that Pokémon.',effect:rule('dp5:15:primalClaw')},
    26:{type:'triggered',event:'evolved',fromHandOnly:true,oncePerTurn:true,text:'When evolved from hand, you may return the highest Stage Evolution card from each opposing Benched Evolved Pokémon to their hand.',effect:rule('dp5:26:primalSwirl')},
    33:{type:'activated',benchOnly:true,text:'When Unown P is Benched, put one damage counter on one of your non-Unown Pokémon.',effect:rule('dp5:33:put')},
    42:{type:'passive',disabledByStatus:false,text:'Your Pokémon attacks ignore Resistance.',effect:N},
    49:{type:'activated',benchOnly:true,text:'Discard attachments; attach this Unown Q as a Pokémon Tool to another of your Pokémon to reduce its retreat by one.',effect:rule('dp5:49:quick')},
    97:{type:'triggered',event:'levelUp',fromHandOnly:true,disabledByStatus:true,text:'When leveled up from hand to the Active Pokémon, optionally flip 3 coins; each heads adds one damage counter to each opposing Benched Pokémon.',effect:rule('dp5:97:dragonPulse')},
    98:{type:'passive',disabledByStatus:false,text:'While Active, all opposing Pokémon cannot use Poké-Powers.',effect:N},
    99:{type:'activated',disabledByStatus:true,text:'Once during your turn, attach a physical Energy card from hand to one of your Pokémon.',effect:rule('dp5:99:energyForcing')},


    67:{type:'activated',text:'Flip a coin; heads search your deck for a physical Helix Fossil, Dome Fossil or Old Amber and put it on the Bench.',effect:rule('dp5:67:ancientGuidance')},
    69:{type:'activated',text:'Flip a coin; heads recover a physical Helix Fossil, Dome Fossil or Old Amber from discard to your Bench.',effect:rule('dp5:69:callUp')}

  }[n];if(dp5Ability&&card.abilities.length)card.abilities=[{...card.abilities[0],...dp5Ability}];


  if(n===100){card.abilities=[
    {name:'Mode Crash',type:'triggered',printedPowerType:'power',disabledByStatus:true,event:'levelUp',fromHandOnly:true,oncePerTurn:false,text:'When leveled up from hand, optionally discard all of the opponent’s Special Energy cards in play.',effect:rule('dp5:100:modeCrash')},
    {name:'Decode',type:'activated',printedPowerType:'power',disabledByStatus:true,text:'Search the deck for up to two physical cards, shuffle, then arrange them on top of your deck.',effect:rule('dp5:100:decode')}
  ];}
  const namedPartners={25:['Plusle'],28:['Minun'],58:['Chimecho'],68:['Snorlax']};
  const conditional={25:['Lightning'],28:['Lightning'],30:['Grass']};
  const roles=[],blob=[...(card.attacks||[]).map(a=>a.text),...(card.abilities||[]).map(a=>a.text)].join(' ').toLowerCase();
  for(const [role,rx] of Object.entries({draw:/draw|hand/,search:/search|deck/,status:/asleep|sleep|poison|confus|paraly|burn/,heal:/heal|remove.*damage/,ramp:/attach.*energy/,control:/cannot|prevent|switch/}))if(rx.test(blob))roles.push(role);
  const types=[...new Set(card.attacks.flatMap(a=>[...a.cost].filter(x=>x!=='C').map(x=>T[x])))];
  card.deckMeta={roles,synergy:roles,energyTypes:types,preferredEnergyTypes:types,preferredPartners:namedPartners[n]||[],conditionalAttackEnergyTypes:conditional[n]||[],inflicts:[],payoffs:[]};
 }else if(trainer){card.trainerType=stage;card.effect=TRAINER_EFFECTS[n]||N;card.text=TRAINER_TEXT[n]||'Complex Trainer timing is still gated.';
   if([84,89,91].includes(n)){
     Object.assign(card,{hp:50,types:['Colorless'],subtype:'Colorless',stage:'Basic',retreat:0,fossil:true,fossilHp:50,countsAsKnockout:true,statusImmune:['sleep','paralysis','confusion','poison','burn']});
     card.abilities=[n===84?{name:'Hard Amber',type:'passive',printedPowerType:'body',disabledByStatus:false,text:'Prevent all attack damage to Old Amber while Benched.',effect:N}: {
       name:n===89?'Rock Reaction':'Aqua Reaction',type:'triggered',printedPowerType:'body',event:'energyAttached',energyType:n===89?'Fighting':'Water',fromHandOnly:true,oncePerTurn:false,disabledByStatus:false,
       text:'When an Energy of the specified type is attached from hand, search the deck for its Fossil evolution and evolve this Fossil.',effect:rule('dp5:'+n+':reaction')
     }];
   }
  }
 else if(energy){card.basicEnergy=false;card.specialEnergy=true;card.subtype=n===93?'Darkness':n===95?'Metal':'Colorless';card.types=[card.subtype];card.effect=ENERGIES[n]||{type:'specialEnergy',provides:{Colorless:1}};card.text=ENERGY_TEXT[n]||'Special Energy effect is awaiting timing verification.';}
 return Object.freeze({...card,battleEnabled:ready,deckEligible:ready,support:{status:ready?'FULL':'PARTIAL',reasons:ready?[]:['Special timing, choices, damage or printed effects not yet independently verified']}});
}
const CARDS=Object.freeze(DATA.map(parse)),MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
