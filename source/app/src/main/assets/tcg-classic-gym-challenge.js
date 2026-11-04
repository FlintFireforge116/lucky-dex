/* Gym Challenge / gym2 (132 numbered original prints).
 * Pokémon TCG source: PokemonTCG/pokemon-tcg-data (gym2.json).
 * Each battle-enabled card must have its complete printed attacks and Powers.
 * Unsupported printed mechanics remain visible but cannot enter Classic decks.
 */
(function(root,factory){const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexClassicTCGGymChallenge=api;})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'gym2',name:'Gym Challenge',series:'Gym',releaseDate:'2000-10-16',cardCount:132});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless'};
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
const ATTACKS=new Map(MOVES.map(row=>{const [num,moves]=row.split('|');const attacks=moves.split(/;(?=[^;~]{1,55}~[GRWLPCF]*~)/).map(record=>{const [name,cost,damage,key='',text='']=record.split('~');if(key&&!E[key])throw new Error('Unknown Gym Challenge effect: '+key);const variable=/[+×?]/.test(damage);return {name,cost,damage:Number(damage.replace(/[^0-9]/g,''))||0,damageText:variable?damage:null,effect:key?E[key]:null,text};});return [Number(num),attacks];}));
// Only verified, fully implemented Trainers may enter the 30-card deck.
const TRAINERS={
 103:{text:'Heal 20 damage from every Pokémon in play, yours and your opponent’s.',effect:seq({type:'heal',target:'selfAll',amount:20},{type:'heal',target:'opponentAll',amount:20})},
 125:{text:'Until the end of your opponent’s next turn, prevent all attack damage to your Benched Pokémon; other attack effects still apply.',effect:{type:'preventDamage',target:'selfBenchAll',duration:'opponentTurn'}}
};
const STADIUM_NUMBERS=new Set([102,109,113,114,119,122,123]);
const CARDS=DATA.map(row=>{const [raw,name,type,stage,hp,ret,weak,res,evolvesFrom,rarity]=row.split('|');const number=Number(raw),basicEnergy=number>=127,kind=basicEnergy?'energy':(number>=100||number>=17&&number<=20)?'trainer':'pokemon';const attacks=ATTACKS.get(number)||[],reasons=[];
 if(kind==='pokemon'&&!attacks.length)reasons.push('Printed attack or Pokémon Power not yet implemented');
 if(kind==='trainer'&&!TRAINERS[number])reasons.push('Printed Trainer or Stadium effect not yet implemented');
 if(basicEnergy)reasons.push('Basic Energy is supplied by the separate Energy Zone');
 if(attacks.some(a=>a.effect&&!fx?.supportsEffect?.(a.effect)))reasons.push('Attack effect unsupported');
 if(kind==='trainer'&&TRAINERS[number]&&!fx?.supportsEffect?.(TRAINERS[number].effect))reasons.push('Trainer effect unsupported');
 const battleEnabled=!reasons.length;
 return {id:`gym2-${number}`,setId:'gym2',number:String(number),name,source:'tcg',battleFormat:'classic',kind,
  ...(kind==='pokemon'?{stage:stage==='0'?'Basic':`Stage ${stage}`,hp:Number(hp),retreat:Number(ret),types:[TYPE[type]],subtype:TYPE[type],evolvesFrom:evolvesFrom||null,weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,attacks,abilities:[]}:{}),
  ...(kind==='trainer'?{trainerType:STADIUM_NUMBERS.has(number)?'Stadium':'Item',text:TRAINERS[number]?.text||'',effect:TRAINERS[number]?.effect||null}:{}),
  ...(basicEnergy?{basicEnergy:true,subtype:TYPE[type],types:[TYPE[type]]}:{}),
  battleEnabled,deckEligible:battleEnabled,support:{status:battleEnabled?'FULL':'PARTIAL',reasons},rarity,
  image:`https://images.pokemontcg.io/gym2/${number}.png`,imageLarge:`https://images.pokemontcg.io/gym2/${number}_hires.png`};
});
if(CARDS.length!==132||new Set(CARDS.map(c=>c.id)).size!==132)throw new Error('Gym Challenge identity mismatch');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
 coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
