/* EX Sandstorm (ex2) official 100-card inventory, 18 Sep 2003.
 * Source: PokemonTCG/pokemon-tcg-data cards/en/ex2.json.
 * The 30-card Classic hybrid rules and separate Energy Zone are preserved.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGSandstorm=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ex2',name:'EX Sandstorm',series:'EX',releaseDate:'2003-09-18',cardCount:100});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Armaldo|P|F|2|120|3|G||Anorith|Rare Holo|Blade Arms~FFC~60|Primal Veil
2|Cacturne|P|G|1|80|1|R||Cacnea|Rare Holo|Feint Attack~CCC~|Poison Payback
3|Cradily|P|G|2|100|2|R||Lileep|Rare Holo|Lure Poison~C~;Spiral Drain~GCC~50|Super Suction Cups
4|Dusclops|P|P|1|70|1|D|F|Duskull|Rare Holo|Judgement~PC~;Random Curse~PCC~|
5|Flareon|P|R|1|80|2|W||Eevee|Rare Holo|Super Singe~RC~20;Flamethrower~RCCC~70|
6|Jolteon|P|L|1|70|1|F|M|Eevee|Rare Holo|Double Kick~CC~20×;Lightning Strike~LLC~40|
7|Ludicolo|P|W|2|90|2|L||Lombre|Rare Holo|Hydro Punch~WCC~50+|Rain Dish
8|Lunatone|P|P|0|60|1|P|||Rare Holo|Cosmic Draw~C~;Lunar Blast~PC~30|Lunar Eclipse
9|Mawile|P|M|0|60|1|R|||Rare Holo|Scam~C~;Metal Hook~MC~20|
10|Sableye|P|D|0|60|1|F|||Rare Holo|Supernatural~C~;Dark Bind~DC~20|
11|Seviper|P|G|0|80|2|P|||Rare Holo|Deadly Poison~C~10;Extra Poison~CC~20|
12|Shiftry|P|G|2|120|2|R||Nuzleaf|Rare Holo|Light Touch Throw~GGCC~80-|Fan Away
13|Solrock|P|F|0|70|1|G|||Rare Holo|Cosmic Draw~C~;Solar Blast~FCC~40|Solar Eclipse
14|Zangoose|P|C|0|70|1|F|||Rare Holo|Target Slash~C~10+;Super Slash~CCC~30+|Poison Resistance
15|Arcanine|P|R|1|80|1|W||Growlithe|Rare|Burn Up~RCC~60|Fire Veil
16|Espeon|P|P|1|80|1|P||Eevee|Rare|Confuse Ray~P~20;Energy Crush~CCC~20+|
17|Golduck|P|W|1|70|1|L||Psyduck|Rare|Special Blow~WP~30+|Chaos Flash
18|Kecleon|P|C|0|60|1|F|||Rare|Double Scratch~CC~20×|Energy Variation
19|Omastar|P|W|2|110|2|L||Omanyte|Rare|Pull Down~C~;Hydrocannon~CC~30+|
20|Pichu|P|L|0|40|1|F|||Rare|Energy Retrieval~L~|Baby Evolution
21|Sandslash|P|F|1|70||G||Sandshrew|Rare|Sand Swirl~FC~;Earthquake~FCC~60|
22|Shiftry|P|G|2|120|2|R||Nuzleaf|Rare|Feint Attack~CCC~;Slash~GCCC~60|
23|Steelix|P|M|1|100|4|R|G|Onix|Rare|Rage~FCC~10+;Spinning Tail~MMCC~|
24|Umbreon|P|D|1|80|1|F|P|Eevee|Rare|Confuse Ray~C~10;Moon Impact~DCC~40|
25|Vaporeon|P|W|1|70|1|L||Eevee|Rare|Aurora Beam~WC~30;Aqua Sonic~WCC~50|
26|Wobbuffet|P|P|0|80|2|P|||Rare|Flip Over~PCC~50|Safeguard
27|Anorith|P|F|1|80|1|G||Claw Fossil|Uncommon|Fast Evolution~C~;Pierce~FC~30|
28|Anorith|P|F|1|80|2|G||Claw Fossil|Uncommon|Slash~F~20;Double Scratch~CCC~40×|
29|Arbok|P|G|1|70|1|P||Ekans|Uncommon|Toxic~GCC~20|Intimidating Fang
30|Azumarill|P|W|1|70|1|L||Marill|Uncommon|Drizzle~C~;Max Bubbles~WC~30×|
31|Azurill|P|C|0|40|1|F|||Uncommon|Jump Catch~C~|Baby Evolution
32|Baltoy|P|F|0|50|1|G|||Uncommon|Rapid Spin~C~10|
33|Breloom|P|G|1|70|1|R||Shroomish|Uncommon|Super Poison Breath~C~;Sky Uppercut~FCC~50|
34|Delcatty|P|C|1|80|1|F||Skitty|Uncommon|Scratch~CC~30;Ultra Energy Source~CCC~10×|
35|Electabuzz|P|L|0|60|1|F|M||Uncommon|Plasma~C~10;Thunder Spear~LCC~|
36|Elekid|P|L|0|40|1|F|||Uncommon|Gather Energy~L~|Baby Evolution
37|Fearow|P|C|1|70||L|F|Spearow|Uncommon|Double Wing Attack~CC~;Rend~CCC~30+|
38|Illumise|P|G|0|60|1|R|||Uncommon|Chaotic Noise~C~;Pester~GC~20+|Glowing Screen
39|Kabuto|P|W|1|60|2|G||Mysterious Fossil|Uncommon|Team Assembly~C~;Pierce~FC~20|Exoskeleton
40|Kirlia|P|P|1|70|1|P||Ralts|Uncommon|Psyshock~PC~20;Link Blast~PCC~60|
41|Lairon|P|M|1|70|2|R|G|Aron|Uncommon|Iron Defense~C~;Headbutt~MCC~50|
42|Lileep|P|G|1|80|2|R||Root Fossil|Uncommon|Influence~C~;Time Spiral~CC~|
43|Lileep|P|G|1|80|2|R||Root Fossil|Uncommon|Amnesia~CC~;Headbutt~GC~30|
44|Linoone|P|C|1|70||F||Zigzagoon|Uncommon|Sniff Out~C~;Fury Swipes~CC~20×|
45|Lombre|P|W|1|60|1|L||Lotad|Uncommon|Double Scratch~WC~30×|Rain Dish
46|Lombre|P|W|1|70|1|L||Lotad|Uncommon|Surprise~C~10;Fury Swipes~CC~20×|
47|Murkrow|P|D|0|60|1|F|P||Uncommon|Surprise~C~;Dark Mind~DC~20|
48|Nuzleaf|P|G|1|80|1|R||Seedot|Uncommon|Steady Punch~CC~20+;Razor Leaf~GCC~40|
49|Nuzleaf|P|G|1|80|1|R||Seedot|Uncommon|Stun Spore~GC~20;Razor Wind~CCC~60|
50|Pelipper|P|W|1|70||L|F|Wingull|Uncommon|Water Gun~CC~30+|
51|Quilava|P|R|1|80|2|W||Cyndaquil|Uncommon|Slash~CC~20;Burning Claw~RCC~40|
52|Vigoroth|P|C|1|70|1|F||Slakoth|Uncommon|Focus Energy~C~;Slash~CCC~40|
53|Volbeat|P|G|0|60|1|R|||Uncommon|Toxic Vibration~C~;Pester~GC~20+|Uplifting Glow
54|Wynaut|P|P|0|50|1|P|||Uncommon|Alluring Smile~P~|Baby Evolution
55|Xatu|P|P|1|70||P|F|Natu|Uncommon|Psyimpact~PC~|Healing Wind
56|Aron|P|M|0|50|1|R|G||Common|Steel Headbutt~MC~20+|
57|Cacnea|P|G|0|50|1|R|||Common|Light Punch~C~10|Poison Payback
58|Cacnea|P|G|0|50|1|R|||Common|Poison Sting~G~10|
59|Cyndaquil|P|R|0|50|1|W|||Common|Tackle~C~10;Singe~R~|
60|Dunsparce|P|C|0|50|1|F|||Common|Strike and Run~C~;Sudden Flash~C~10|
61|Duskull|P|P|0|40|1|D|F||Common|Surprise~C~;Confuse Ray~P~|
62|Duskull|P|P|0|40|1|D|F||Common|Haunt~P~;Dark Mind~CC~10|
63|Eevee|P|C|0|50|1|F|||Common|Signs of Evolution~C~;Quick Attack~C~10+|
64|Ekans|P|G|0|50|1|P|||Common|Bind~C~10|
65|Growlithe|P|R|0|50|1|W|||Common|Flare~RC~20|Fire Veil
66|Lotad|P|W|0|40|1|L|||Common|Ram~C~10|Rain Dish
67|Lotad|P|W|0|50|1|L|||Common|Tackle~C~10;Blot~CC~20|
68|Marill|P|W|0|50|1|L|||Common|Double Bubble~WC~10×|
69|Natu|P|P|0|50|1|P|||Common|Peck~C~10;Soothing Wave~P~|
70|Omanyte|P|W|1|70|1|L||Mysterious Fossil|Common|Team Assembly~C~;Bind~CC~20|
71|Onix|P|F|0|80|3|W|||Common|Bind~CC~10;Rage~FCC~10+|
72|Pikachu|P|L|0|50|1|F|||Common|Scratch~C~10;Pika Bolt~LCC~40|
73|Psyduck|P|W|0|50|1|L|||Common|Confusion Wave~C~|
74|Ralts|P|P|0|50|1|P|||Common|Hypnosis~C~;Psychic Boom~P~10×|
75|Sandshrew|P|F|0|50|1|G|||Common|Poison Needle~F~10|
76|Seedot|P|G|0|40|1|R|||Common|Surprise Attack~G~30|
77|Seedot|P|G|0|40|1|R|||Common|Tackle~C~10|
78|Shroomish|P|G|0|40|1|R|W||Common|Growth Spurt~C~;Poisonpowder~GC~10|
79|Skitty|P|C|0|50|1|F|||Common|Energy Catch~C~;Double-edge~CC~30|
80|Slakoth|P|C|0|40|1|F|||Common|Lazy Punch~C~10|
81|Spearow|P|C|0|40|1|L|F||Common|Super Speed~C~;Peck~C~10|
82|Trapinch|P|F|0|40|1|G|||Common|Sand Pit~C~10;Irongrip~CC~20|
83|Wailmer|P|W|0|80|3|L|||Common|Rollout~CC~20;Super Hypno Wave~WCC~30|
84|Wingull|P|W|0|40|1|L|F||Common|Supersonic~C~|
85|Zigzagoon|P|C|0|40|1|F|||Common|Collect~C~;Headbutt~CC~20|
86|Double Full Heal|T||0||||||Uncommon||
87|Lanette's Net Search|T||0||||||Uncommon||
88|Rare Candy|T||0||||||Uncommon||
89|Wally's Training|T||0||||||Uncommon||
90|Claw Fossil|T||0|40|||||Common||Jagged Stone
91|Mysterious Fossil|T||0|10|||||Common||
92|Root Fossil|T||0|40|||||Common||Spongy Stone
93|Multi Energy|E||0||||||Rare||
94|Aerodactyl ex|P|C|1|100|1|L|F|Mysterious Fossil|Rare Holo EX|Supersonic~C~10;Wing Attack~CCC~60|Primal Lock
95|Aggron ex|P|M|2|150|4|F|G|Lairon|Rare Holo EX|Rend~CCC~30+;Metal Surge~MMCCC~50|
96|Gardevoir ex|P|P|2|150|2|G||Kirlia|Rare Holo EX|Feedback~PC~;Psystorm~PCCC~10×|
97|Kabutops ex|P|W|2|150|2|G||Kabuto|Rare Holo EX|Hydrocutter~C~40×;Spiral Drain~FFCC~70|
98|Raichu ex|P|L|1|100|1|F||Pikachu|Rare Holo EX|Dazzle Blast~L~20;Mega Thunderbolt~LLC~120|
99|Typhlosion ex|P|R|2|160|2|F||Quilava|Rare Holo EX|Ring of Fire~RCC~40;Split Blast~RRRCC~100|
100|Wailord ex|P|W|1|200|5|G||Wailmer|Rare Holo EX|Super Deep Dive~C~;Dwindling Wave~WWWC~100-|`;
const f=Object.freeze({type:'noop'}),R=new Map(),notes=new Map();
const put=(key,e,description)=>{R.set(key,e);if(description)notes.set(key,description)};
const bulk=(keys,e,description)=>keys.trim().split(/\s+/).filter(Boolean).forEach(k=>put(k,e,description));
const status=s=>({type:'status',target:'opponentActive',status:s});
const flip=(heads,tails=f)=>({type:'coinFlip',heads,tails});
const seq=(...effects)=>({type:'sequence',effects});
const bonus=amount=>({type:'bonusDamage',amount});
const coin=(coins,amount,mode='replace')=>({type:'coinDamage',coins,amount,mode});
const rule=name=>({type:'neoRule',rule:'ex2:'+name});
const lock={type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'};
const guarded={type:'preventDamage',target:'self',duration:'opponentTurn',effects:true};
const delay={type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'};
const plain=`1:0 8:1 13:1 22:1 24:1 25:0 27:1 28:0 34:0 39:1 41:1 43:1 48:1 51:0 52:1 57:0 59:0 65:0 66:0 67:0 69:0 72:0 72:1 77:0 81:1 82:1 83:0 85:1 94:1`.split(' ');
for(const key of plain)put(key,f);
// Status attacks, coin flips and damage prevention.
bulk('5:0 59:1',flip(status('burn')),'On heads, Burn the Defending Pokémon.');
bulk('16:0 24:0 61:1 84:0 98:0',flip(status('confusion')),'On heads, Confuse the Defending Pokémon.');
bulk('40:0 49:0 60:1 64:0 70:1 71:0',flip(status('paralysis')),'On heads, Paralyze the Defending Pokémon.');
bulk('58:0 75:0',flip(status('poison')),'On heads, Poison the Defending Pokémon.');
bulk('69:1 74:0 83:1',status('sleep'),'The Defending Pokémon is Asleep.');
put('94:0',status('confusion'));
put('33:0',status('poison'));
put('29:0',{...status('poison'),amount:20},'Toxic: put 2 damage counters between turns.');
put('78:1',status('poison'));
put('82:0',lock);put('21:0',lock);put('99:0',seq(status('burn'),lock));
put('41:0',flip(guarded));put('81:0',flip(guarded));
put('76:0',{type:'coinAttackGate',heads:f});put('49:1',{type:'coinAttackGate',heads:f});
put('73:0',seq({type:'status',target:'self',status:'confusion'},status('confusion')));
put('38:0',flip(status('confusion'),status('sleep')));
put('53:0',flip(status('poison'),status('sleep')));
put('11:1',rule('extraPoison'));
put('68:0',{type:'coinDamageStatus',coins:2,amount:10,minHeads:1,status:'paralysis'});
// Printed damage scaling. Damage-counter rule takes 10-HP units, not ×10 twice.
bulk('23:0 71:1',{type:'damageFromDamage',source:'self',amount:1});
bulk('6:0 18:0',{type:'coinDamage',coins:2,amount:20,mode:'replace'});
bulk('28:1',{type:'coinDamage',coins:2,amount:40,mode:'replace'});
bulk('45:0',{type:'coinDamage',coins:2,amount:30,mode:'replace'});
bulk('44:1 46:1',{type:'coinDamage',coins:3,amount:20,mode:'replace'});
put('56:0',flip(bonus(20)));put('48:0',flip(bonus(10)));put('63:1',flip(bonus(10)));
put('7:0',rule('waterEnergyBeyondCost'));
put('19:1',rule('waterEnergyBeyondCost'));
put('50:0',rule('waterEnergyBeyondCost'));
put('74:1',{type:'energyDamage',source:'opponent',amount:10});
put('25:1',{type:'damageRule',ignoreResistance:true});
put('33:1',{type:'damageRule',ignoreResistance:true});
put('37:1',rule('rend20'));put('95:0',rule('rend30'));
put('95:1',seq({type:'benchDamage',side:'opponent',all:true,amount:20}));
put('14:0',rule('targetSlash'));put('14:1',rule('superSlash'));
put('12:0',rule('lightTouchThrow'));put('16:1',rule('energyCrush'));
put('17:0',rule('specialBlow'));put('38:1',rule('pester'));put('53:1',rule('pester'));
put('40:1',rule('linkBlast'));put('34:1',rule('ultraEnergy'));
put('96:1',rule('psystorm'));put('100:1',rule('dwindlingWave'));
put('97:0',rule('hydrocutter'));put('30:1',{type:'coinDamageByEnergy',amount:30});
put('4:0',rule('judgement'));put('4:1',{type:'damage',target:'opponentActive',amount:50});
put('96:0',rule('feedback'));
// Bench attacks, recovery and discard.
put('2:0',{type:'selectedDamage',target:'opponentPokemon',amount:40,ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true});
put('22:0',{type:'selectedDamage',target:'opponentPokemon',amount:40,ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true});
put('35:1',{type:'selectedDamage',target:'opponentPokemon',amount:40,ignoreWeakness:true,ignoreResistance:true});
put('3:1',{type:'healSelf',amount:20});put('97:1',{type:'healSelf',amount:20});put('67:1',{type:'healSelf',amount:10});
put('5:1',{type:'discardEnergyCard',target:'self',energyType:'Fire',strictEnergyType:true,amount:1});
put('26:0',{type:'selfDamage',amount:10});put('79:1',{type:'selfDamage',amount:10});
put('21:1',{type:'benchDamage',side:'self',all:true,amount:10});
put('23:1',{type:'benchDamage',side:'opponent',all:true,amount:20});
put('37:0',f);
put('55:0',seq({type:'damage',target:'opponentActive',amount:10},{type:'benchDamage',side:'opponent',all:true,amount:10}));
put('62:0',{type:'damage',target:'opponentActive',amount:10});
put('62:1',{type:'benchDamage',side:'opponent',amount:10});
put('47:1',{type:'benchDamage',side:'opponent',amount:10});
put('98:1',rule('discardAllEnergy'));
put('99:1',{type:'discardEnergyCard',target:'self',amount:1});
put('80:0',delay);
put('52:0',{type:'nextAttackBonus',attackName:'Slash',amount:50});
put('43:0',{type:'chooseAttackLock',duration:'opponentTurn'});
put('85:0',{type:'draw',amount:1});
put('27:0',{type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon',stage:['Stage 1','Stage 2']}});
put('31:0',{type:'searchChosen',source:'deck',amount:1,filter:{kind:'trainer'}});
put('44:0',{type:'searchChosen',source:'discard',amount:1});
put('63:0',{type:'searchChosen',source:'deck',amount:3,filter:{kind:'pokemon',evolvesFrom:'Eevee'}});
put('32:0',rule('rapidSpin'));
put('3:0',rule('lurePoison'));
put('8:0',rule('cosmicDraw'));put('13:0',rule('cosmicDraw'));
put('9:0',rule('scam'));
put('9:1',rule('metalHook'));
put('10:0',rule('supernatural'));
put('10:1',rule('darkBind'));
put('11:0',rule('deadlyPoison'));
put('15:0',rule('burnUp'));
put('19:0',rule('pullDown'));
put('20:0',rule('energyRetrieval'));
put('30:0',rule('drizzle'));
put('35:0',rule('plasma'));
put('36:0',rule('gatherEnergy'));
put('39:0',rule('teamAssembly'));
put('42:0',rule('influence'));
put('42:1',rule('timeSpiral'));
put('46:0',rule('surprise'));
put('47:0',rule('surprise'));
put('51:1',rule('burningClaw'));
put('54:0',rule('alluringSmile'));
put('60:0',rule('strikeAndRun'));
put('61:0',rule('surprise'));
put('70:0',rule('teamAssembly'));
put('78:0',rule('growthSpurt'));
put('79:0',rule('energyCatch'));
put('100:0',rule('superDeepDive'));
put('6:1',rule('lightningStrike'));
// 89 Wally's Training requires evolving the Active Pokémon, not choosing any target.
const TRAINEFFECTS={86:{type:'removeStatuses',statuses:['sleep','poison','burn','confusion','paralysis']},
 87:rule('lanetteNetSearch'),
 88:{type:'rareCandy'},89:{type:'evolveTargetFromDeck',target:'selfActive'},
 90:{type:'playFossil',hp:40,subtype:'Colorless',canRetreat:false},
 91:{type:'playFossil',hp:10,subtype:'Colorless',canRetreat:false},
 92:{type:'playFossil',hp:40,subtype:'Colorless',canRetreat:false}};
const SPECIAL={93:{type:'specialEnergy',provides:{Colorless:1}}};
const power=(name,ruleName)=>({name,type:'activated',effect:rule(ruleName),printedPowerType:'power',disabledByStatus:true,expeditionSpecialCondition:true,oncePerTurn:true});
const passive=(name,effect)=>({name,type:'passive',effect,printedPowerType:'body'});
const ABILITIES={
 1:[passive('Primal Veil',{type:'actionLock',cardType:'Supporter',duration:'whileActive'})],
 2:[passive('Poison Payback',rule('poisonPayback'))],
 3:[passive('Super Suction Cups',rule('superSuctionCups'))],
 7:[passive('Rain Dish',rule('rainDish'))],
 8:[power('Lunar Eclipse','lunarEclipse')],
 12:[power('Fan Away','fanAway')],
 13:[power('Solar Eclipse','solarEclipse')],
 14:[passive('Poison Resistance',{type:'preventStatus',duration:'whileInPlay',status:'poison'})],
 15:[passive('Fire Veil',rule('fireVeil'))],
 17:[power('Chaos Flash','chaosFlash')],
 18:[passive('Energy Variation',rule('energyVariation'))],
 20:[power('Baby Evolution','babyEvolution')],
 26:[passive('Safeguard',{type:'preventDamage',duration:'whileInPlay',attackerFilter:{isEx:true},effects:true})],
 29:[passive('Intimidating Fang',rule('intimidatingFang'))],
 31:[power('Baby Evolution','babyEvolution')],
 36:[power('Baby Evolution','babyEvolution')],
 38:[passive('Glowing Screen',rule('glowingScreen'))],
 39:[passive('Exoskeleton',rule('exoskeleton'))],
 45:[passive('Rain Dish',rule('rainDish'))],
 53:[passive('Uplifting Glow',rule('upliftingGlow'))],
 54:[power('Baby Evolution','babyEvolution')],
 55:[power('Healing Wind','healingWind')],
 57:[passive('Poison Payback',rule('poisonPayback'))],
 65:[passive('Fire Veil',rule('fireVeil'))],
 66:[passive('Rain Dish',rule('rainDish'))],
 90:[passive('Jagged Stone',rule('jaggedStone'))],
 92:[passive('Spongy Stone',rule('rainDish'))],
 94:[passive('Primal Lock',{type:'actionLock',cardType:'Tool',side:'opponent',duration:'whileInPlay'})]
};
// Cards with a power or attack that needs a specialized rule are tagged so
// the deck planner recognises their strategy, rather than being treated as vanilla.
const META={
 1:{roles:['disruption']},2:{roles:['poison'],inflicts:['poison']},3:{roles:['stall','poison','healing'],inflicts:['poison']},4:{roles:['disruption']},
 7:{roles:['healing','damage'],energyTypes:['Water']},8:{roles:['draw']},9:{roles:['disruption']},10:{roles:['disruption']},
 11:{roles:['poison','sleep'],inflicts:['poison','sleep']},12:{roles:['disruption']},13:{roles:['draw']},
 14:{roles:['stall']},15:{roles:['burn'],inflicts:['burn']},17:{roles:['disruption'],inflicts:['confusion']},
 19:{roles:['disruption']},20:{roles:['energy']},21:{roles:['disruption']},22:{roles:['disruption']},
 26:{roles:['stall']},27:{roles:['search']},29:{roles:['stall'],inflicts:['poison']},30:{roles:['energy']},
 31:{roles:['search']},32:{roles:['disruption']},35:{roles:['energy']},36:{roles:['energy']},
 38:{roles:['stall'],inflicts:['confusion','sleep'],payoffs:['sleep','poison','burn','paralysis','confusion']},39:{roles:['stall','search']},
 42:{roles:['search','disruption']},43:{roles:['disruption']},44:{roles:['search']},
 45:{roles:['healing']},47:{roles:['disruption']},51:{inflicts:['burn']},52:{roles:['setup']},
 53:{roles:['stall'],inflicts:['poison','sleep'],payoffs:['sleep','poison','burn','paralysis','confusion']},54:{roles:['search']},55:{roles:['healing']},
 57:{roles:['poison'],inflicts:['poison']},60:{roles:['search']},63:{roles:['search']},
 65:{roles:['burn'],inflicts:['burn']},66:{roles:['healing']},68:{inflicts:['paralysis']},
 70:{roles:['search']},78:{roles:['energy'],inflicts:['poison']},79:{roles:['energy']},
 83:{inflicts:['sleep']},86:{roles:['healing']},87:{roles:['search'],stages:['Basic']},88:{roles:['evolution','search']},
 89:{roles:['evolution','search']},90:{roles:['stall']},92:{roles:['healing']},
 93:{roles:['energy']},94:{roles:['disruption']},95:{roles:['damage']},96:{roles:['damage']},
 97:{roles:['healing']},98:{roles:['damage']},99:{roles:['burn'],inflicts:['burn']},100:{roles:['healing']}
};
// Concise printed-rule descriptions, retained in the attack inspector.
// Identical to the original mechanics; no generic "special effect" labels.
const ATTACK_TEXT={
1:['Deal 60 damage.'],
2:['Choose an opposing Pokémon and deal 40 damage to it. Ignore Weakness, Resistance and other protective effects.'],
3:['Optionally switch the opposing Active with a Benched Pokémon; Poison the new Active.','Deal 50 damage and heal 20 damage from Cradily.'],
4:['Flip two coins. If both are heads, knock out the Defending Pokémon.','Distribute five damage counters among the Defending Pokémon.'],
5:['Deal 20 damage; a heads coin flip Burns the opponent.','Deal 70 damage; discard a Fire Energy from Flareon.'],
6:['Flip two coins; deal 20 damage for each heads.','Deal 40 damage, or discard all Lightning Energy to deal 70 instead.'],
7:['Deal 50 plus 10 for each extra Water Energy beyond the attack cost, up to 20 extra.'],
8:['Draw three cards if the opponent has an evolved Pokémon in play.','Deal 30 damage.'],
9:['Inspect the opponent’s hand; optionally shuffle a Supporter into their deck and let them draw one.','Optionally switch a Benched opponent into the Active position, then deal 20 damage.'],
10:['Use the effect of a Supporter in your opponent’s hand without taking that card.','Deal 20 damage; optionally discard Darkness Energy to Paralyze the defender.'],
11:['Deal 10 damage; optionally discard Grass Energy to Poison the defender.','Deal 20 damage; if the defender is Pokémon-ex, also put it to Sleep and Poison it.'],
12:['Deal 80 minus 10 for each Energy attached to the defender.'],
13:['Draw three cards if your opponent has an evolved Pokémon in play.','Deal 40 damage.'],
14:['Deal 10 damage, plus 30 if the defender is Seviper.','Deal 30 damage, plus 30 if the defender is evolved.'],
15:['Deal 60 damage; on tails, discard all Fire Energy from Arcanine.'],
16:['Deal 20 damage; heads Confuses the defender.','Deal 20 plus 10 for each Energy attached to all of your opponent’s Pokémon.'],
17:['Deal 30 damage, plus 40 if the defender has Special Energy.'],
18:['Flip twice; deal 20 damage per heads.'],
19:['Return the top Evolution card of each opposing evolved Pokémon to its owner’s hand.','Deal 30 plus 20 for up to two Water Energy attached beyond the attack cost.'],
20:['Recover up to two basic Energy from your Energy discard and attach them to your Pokémon, adding one damage counter for each.'],
21:['Deal 20 damage to each Defending Pokémon and block retreat next turn.','Deal 60 damage to the defender and 10 to each of your Benched Pokémon.'],
22:['Deal 40 damage to any opposing Pokémon, ignoring Weakness, Resistance and other protective effects.','Deal 60 damage.'],
23:['Deal 10 damage plus 10 for each damage counter on Steelix.','Deal 20 damage to every opposing Pokémon.'],
24:['Deal 10 damage; heads Confuses the defender.','Deal 40 damage.'],
25:['Deal 30 damage.','Deal 50 damage, ignoring Resistance.'],
26:['Deal 50 damage and 10 self-damage to Wobbuffet.'],
27:['Search your deck for an Evolution Pokémon, reveal it and put it into your hand.','Deal 30 damage.'],
28:['Deal 20 damage.','Flip twice and deal 40 damage per heads.'],
29:['Deal 20 damage and badly Poison the defender (20 damage between turns).'],
30:['Attach as many Water Energy cards as you like from your hand to your Active Pokémon.','Flip one coin per Energy attached to your Active Pokémon and deal 30 per heads.'],
31:['Search your deck for a Trainer card and put it into your hand.'],
32:['Deal 10 damage, then each player may switch their Active Pokémon with a Benched Pokémon.'],
33:['Poison each Defending Pokémon.','Deal 50 damage, ignoring Resistance.'],
34:['Deal 30 damage.','Deal 10 damage for each basic Energy attached to both Active Pokémon.'],
35:['Deal 10 damage; on heads, recover Lightning Energy from discard onto Electabuzz.','Choose any opposing Pokémon and deal 40 damage to it.'],
36:['Search your Energy supply for basic Energy and attach one to one of your Pokémon.'],
37:['Deal 20 damage to each Defending Pokémon.','Deal 30 damage, plus 20 if the defender already has damage counters.'],
38:['Flip a coin: heads Confuses the defender, tails puts it to Sleep.','Deal 20 damage plus 20 if the defender has a Special Condition.'],
39:['Search your deck and fill open Bench slots with Omanyte, Kabuto or Basic Pokémon.','Deal 20 damage.'],
40:['Deal 20 damage; on heads, Paralyze the defender.','Deal 60 damage, reduced to 30 if the two Active Pokémon have different numbers of attached Energy.'],
41:['Flip a coin; heads prevents effects and damage to Lairon during the next opposing turn.','Deal 50 damage.'],
42:['Search your deck and Bench up to two of Omanyte, Kabuto, Aerodactyl, Lileep or Anorith.','Choose an opposing evolved Pokémon; on heads remove its highest Evolution card and shuffle it into the deck.'],
43:['Choose one of the defender’s attacks to prevent it using on its next turn.','Deal 30 damage.'],
44:['Return any one card from your discard pile to your hand.','Flip three coins; deal 20 damage per heads.'],
45:['Flip two coins; deal 30 damage per heads.'],
46:['Shuffle a random card from your opponent’s hand back into their deck; deal 10 damage.','Flip three coins; deal 20 damage per heads.'],
47:['Shuffle a random card from your opponent’s hand into their deck.','Deal 20 damage plus 10 to an opponent’s Benched Pokémon.'],
48:['Deal 20 damage plus 10 on heads.','Deal 40 damage.'],
49:['Deal 20 damage; on heads, Paralyze the defender.','Deal 60 damage only if a coin lands heads.'],
50:['Deal 30 damage plus up to 20 more for Water Energy attached beyond the attack cost.'],
51:['Deal 20 damage.','Deal 40 damage; optionally discard Fire Energy to Burn the defender.'],
52:['Set up Slash to deal 90 base damage next turn.','Deal 40 damage (90 after Focus Energy).'],
53:['Flip: heads Poisons, tails puts the defender to Sleep.','Deal 20 plus 20 if the defender has a Special Condition.'],
54:['Search for one Pokémon per attached Energy and put those Pokémon into your hand.'],
55:['Put one damage counter on each opposing Pokémon.'],
56:['Deal 20 damage plus 20 on heads.'],
57:['Deal 10 damage.'],
58:['Deal 10 damage; on heads, Poison the defender.'],
59:['Deal 10 damage.','Flip a coin; on heads, Burn the defender.'],
60:['Bench up to three Basics from your deck, then optionally switch Dunsparce to the Bench.','Deal 10 damage; on heads, Paralyze the defender.'],
61:['Shuffle a random card from the opponent’s hand into their deck.','Flip a coin; heads Confuses the defender.'],
62:['Place one damage counter on the defender.','Deal 10 damage and 10 more to a Benched opposing Pokémon.'],
63:['Search your deck for up to three cards that evolve from Eevee.','Deal 10 damage plus 10 on heads.'],
64:['Deal 10 damage; on heads, Paralyze the defender.'],
65:['Deal 20 damage.'],
66:['Deal 10 damage.'],
67:['Deal 10 damage.','Deal 20 damage and heal 10 from Lotad.'],
68:['Flip two coins, deal 10 damage per heads and Paralyze the defender if either is heads.'],
69:['Deal 10 damage.','Put the defender to Sleep.'],
70:['Bench Omanyte, Kabuto or Basic Pokémon from your deck into open Bench slots.','Deal 20 damage; on heads, Paralyze the defender.'],
71:['Deal 10 damage; on heads, Paralyze the defender.','Deal 10 plus 10 for each damage counter on Onix.'],
72:['Deal 10 damage.','Deal 40 damage.'],
73:['Confuse both Psyduck and the defender.'],
74:['Put the defender to Sleep.','Deal 10 damage for each Energy attached to the defender.'],
75:['Deal 10 damage; on heads, Poison the defender.'],
76:['Deal 30 damage only on heads.'],
77:['Deal 10 damage.'],
78:['Attach a Grass Energy from your hand to Shroomish.','Deal 10 damage and Poison the defender.'],
79:['Recover one basic Energy from discard to your hand.','Deal 30 damage and 10 to Skitty itself.'],
80:['Deal 10 damage; Slakoth cannot attack next turn.'],
81:['On heads, prevent attack damage and effects to Spearow during the opponent’s next turn.','Deal 10 damage.'],
82:['Deal 10 damage and stop the defender retreating next turn.','Deal 20 damage.'],
83:['Deal 20 damage.','Deal 30 damage and put the defender to Sleep.'],
84:['Flip a coin; on heads, Confuse the defender.'],
85:['Draw one card.','Deal 20 damage.'],
94:['Deal 10 damage and Confuse the defender.','Deal 60 damage.'],
95:['Deal 30 plus 30 if the defender already has damage.','Deal 50 to the defender and 20 to all its Benched Pokémon.'],
96:['Put as many damage counters on the defender as your opponent has cards in hand.','Deal 10 damage for every Energy on every Pokémon in play.'],
97:['Flip one coin per attached Energy, maximum three, dealing 40 damage per heads.','Deal 70 damage and heal 20 from Kabutops ex.'],
98:['Deal 20 damage; heads Confuses the defender.','Deal 120 damage and discard all attached Energy.'],
99:['Deal 40 damage, Burn the defender and prevent retreat next turn.','Deal 100 damage, discard an attached Energy; against two Defending Pokémon, optionally split 50 each.'],
100:['Heal 30 damage from Wailord ex and switch it with a Benched Pokémon (fails without a Bench).','Deal 100 damage minus 10 for each damage counter on Wailord ex.']
};
const BASIC_META=Object.freeze({roles:Object.freeze([]),inflicts:Object.freeze([]),payoffs:Object.freeze([]),energyTypes:Object.freeze([]),stages:Object.freeze([])});
const FIELDS=new Map(RAW.split('\n').map(line=>{const p=line.split('|');return [Number(p[0]),p]}));
function parse(n){
 const p=FIELDS.get(n);if(!p)throw new Error('EX Sandstorm missing card '+n);
 const [_,name,k,type,stage,hp,retreat,weak,resist,from,rarity,moves,ability]=p;
 const m=META[n]||{},deckMeta=Object.freeze(Object.fromEntries(['roles','inflicts','payoffs','energyTypes','stages'].map(key=>[key,Object.freeze([...(m[key]||[])])])));
 const card={id:'ex2-'+n,setId:'ex2',number:String(n),name,source:'tcg',battleFormat:'classic',rarity,deckMeta,
 image:`https://images.pokemontcg.io/ex2/${n}.png`,imageLarge:`https://images.pokemontcg.io/ex2/${n}_hires.png`,
 kind:k==='P'?'pokemon':k==='T'?'trainer':'energy'};
 const reasons=[];
 if(k==='P'){
  const attacks=(moves||'').split(';').filter(Boolean).map((spec,i)=>{
   const [move,cost,printed='']=spec.split('~'),key=n+':'+i,e=R.get(key);
   if(!e)reasons.push('Attack has no battle effect: '+move);
   else if(!fx.supportsEffect(e))reasons.push('Unsupported attack effect: '+move);
   return {name:move,cost,damage:/×/.test(printed)?0:({21:0,23:1,37:0}[n]===i?20:Number((printed.match(/^\d+/)||[])[0]||0)),damageText:printed||null,
    text:notes.get(key)||ATTACK_TEXT[n]?.[i]||`Deal ${printed||0} damage.`,effect:e||null};
  });
  if(ability&&!ABILITIES[n])reasons.push('Power/Body missing: '+ability);
  if(ABILITIES[n]&&!ABILITIES[n].every(a=>fx.supportsEffect(a.effect)))reasons.push('Unsupported Power: '+ability);
  const isEx=/ ex$/.test(name);
  Object.assign(card,{stage:stage==='0'?'Basic':`Stage ${stage}`,evolvesFrom:from||null,hp:Number(hp),retreat:Number(retreat||0),types:[T[type]],subtype:T[type],
   weakness:T[weak]||null,weaknessValue:weak?'×2':null,resistance:T[resist]||null,resistanceValue:resist?'-30':null,
   pokemonEx:isEx,isEx,prizeCards:isEx?2:1,attacks,abilities:ABILITIES[n]||[]});
 }else if(k==='T'){
  Object.assign(card,{trainerType:[87,89].includes(n)?'Supporter':'Item',effect:TRAINEFFECTS[n]||null,text:({86:'Remove all Special Conditions from each of your Active Pokémon.',87:'Search your deck for up to three different types of Basic Pokémon, excluding Baby Pokémon. Put them in your hand and shuffle your deck.',88:'Evolve one of your Basic Pokémon straight into a Stage 1 or Stage 2 from your hand.',89:'Search your deck for an Evolution of your Active Pokémon and evolve it, then shuffle your deck.',90:'Play Claw Fossil as a non-retreating 40 HP Colorless Basic Pokémon; it yields no Prize when Knocked Out.',91:'Play Mysterious Fossil as a non-retreating 10 HP Colorless Basic Pokémon; it yields no Prize when Knocked Out.',92:'Play Root Fossil as a non-retreating 40 HP Colorless Basic Pokémon; it yields no Prize when Knocked Out.'})[n]});
  if([90,91,92].includes(n))Object.assign(card,{hp:Number(hp),types:['Colorless'],subtype:'Colorless',stage:'Basic',retreat:0,noPrize:true,countsAsKnockout:false,statusImmune:true,abilities:ABILITIES[n]||[]});
  if(!TRAINEFFECTS[n])reasons.push('Trainer effect not implemented: '+name);
 }else Object.assign(card,{specialEnergy:true,basicEnergy:false,types:['Colorless'],subtype:'Colorless',effect:SPECIAL[n],text:'Multi Energy: all types as a single Energy; Colorless only when another Special Energy is attached.'});
 return Object.freeze({...card,battleEnabled:reasons.length===0,deckEligible:reasons.length===0,support:{status:reasons.length?'PARTIAL':'FULL',reasons}});
}
const CARDS=Object.freeze(Array.from({length:100},(_,i)=>parse(i+1)));
const BY_ID=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>BY_ID.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
