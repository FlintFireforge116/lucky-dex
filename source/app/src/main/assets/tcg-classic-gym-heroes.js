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
 coinClamp:{type:'coinAttackGate',heads:status('paralysis')},
 coinAttackLock:flip({type:'lock',action:'attack',duration:'opponentTurn'}),
 selfSleep:status('sleep','self'),poison:status('poison'),
 twoHeadsPlus60:{type:'allHeadsBonus',coins:2,amount:60},
 waterGun:{type:'energyDamage',source:'self',energyType:'Water',extraAbove:1,maxCount:2,amount:10},
 nightSpirits:{type:'coinDamageByPokemon',filter:{name:["Sabrina's Gastly","Sabrina's Haunter","Sabrina's Gengar"]},amount:30},
 swift:{type:'damageRule',ignoreWeakness:true,ignoreEffects:true}
};
const ATTACKS=new Map(MOVES.map(row=>{const [num,moves]=row.split('|');return [Number(num),moves.split(/;(?=[A-Z][^;~]{0,70}~[GRWLPCF]*~)/).map(move=>{
 const [name,cost,rawDamage,key='',text='']=move.split('~');const effect=key?(effects[key]||{type:'notImplemented',key}):null;
 const variable=rawDamage.includes('×')||rawDamage.includes('+')||rawDamage==='?';
 return {name,cost,damage:variable?(/\+/.test(rawDamage)?Number(rawDamage.replace('+',''))||0:0):Number(rawDamage)||0,damageText:variable?rawDamage:null,effect,text};
 })];}));
const TRAINERS={
 15:{text:'Remove one damage counter from each of your damaged Pokémon.',effect:{type:'heal',target:'selfAll',amount:10}},
 98:{text:'Remove one damage counter from each of your damaged Pokémon.',effect:{type:'heal',target:'selfAll',amount:10}},
 106:{text:'Search your deck for a Basic or Evolution Pokémon with Brock in its name, reveal it and put it into your hand. Shuffle afterward.',effect:{type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon',nameContains:'Brock'}}},
 125:{text:'Each player shuffles their hand into their deck, then draws that same number of cards.',effect:{type:'handShuffle',side:'both',draw:'same'}}
};
const CARDS=DATA.map(row=>{
 const [rawNumber,name,type,stage,hp,ret,weak,res,evolvesFrom]=row.split('|');const number=Number(rawNumber),basicEnergy=number>=127,kind=basicEnergy?'energy':number>=97||number>=15&&number<=19?'trainer':'pokemon';
 const attacks=ATTACKS.get(number)||[],reasons=[];
 if(kind==='pokemon'&&!ATTACKS.has(number))reasons.push('Printed attacks or Pokémon Powers not yet implemented');
 if(kind==='trainer'&&!TRAINERS[number])reasons.push('Printed Gym Trainer effect not yet implemented');
 if(kind==='trainer'&&TRAINERS[number]&&!fx?.supportsEffect?.(TRAINERS[number].effect))reasons.push('Gym Trainer effect not supported by engine');
 if(basicEnergy)reasons.push('Basic Energy is supplied separately by the Classic Energy Zone');
 if(attacks.some(a=>a.effect&&!fx?.supportsEffect?.(a.effect)))reasons.push('Attack effect not supported by current battle engine');
 if(kind==='pokemon'&&attacks.length&&attacks.some(a=>a.effect?.type==='notImplemented'))reasons.push('Printed attack effect not yet implemented');
 const battleEnabled=!reasons.length;
 return {id:`gym1-${number}`,setId:'gym1',number:String(number),name,source:'tcg',battleFormat:'classic',kind,
   ...(kind==='pokemon'?{stage:stage==='0'?'Basic':`Stage ${stage}`,hp:Number(hp),retreat:Number(ret),types:[TYPE[type]],subtype:TYPE[type],evolvesFrom:evolvesFrom||null,
    weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,attacks,abilities:[]}:{}),
   ...(kind==='trainer'?{trainerType:'Item',text:TRAINERS[number]?.text||'',effect:TRAINERS[number]?.effect||null}:{}),...(basicEnergy?{basicEnergy:true,subtype:TYPE[type],types:[TYPE[type]]}:{}),
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
