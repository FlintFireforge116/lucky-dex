/* Fossil (base3) printed identities and Classic TCG battle data.
 * Rules are paraphrased from the printed Fossil cards. Unsupported mechanics
 * are explicitly gated, never silently treated as ordinary damage.
 */
(function(root,factory){const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexClassicTCGFossil=api;})(typeof globalThis!=='undefined'?globalThis:this,function(fx){
'use strict';
const SET=Object.freeze({id:'base3',name:'Fossil',series:'Base',releaseDate:'1999-10-10',cardCount:62});
const TYPES={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless'};
// First 15 rares have alternative non-holo prints 16–30.
const TABLE=`
1|Aerodactyl|F|1|60|2|G|F|Mysterious Fossil|Wing Attack~CCC~30
2|Articuno|W|0|70|2||F||Freeze Dry~WWW~30~paralyze;Blizzard~WWWW~50~blizzard
3|Ditto|C|0|50|1|F|P||
4|Dragonite|C|2|100|1||F|Dragonair|Slam~CCCC~0~coin2x40
5|Gengar|P|2|80|1||F|Haunter|Dark Mind~PPP~30~darkMind
6|Haunter|P|1|50|0||F|Gastly|Nightmare~PC~10~sleep
7|Hitmonlee|F|0|60|1|P|||Stretch Kick~FF~0~stretchKick;High Jump Kick~FFF~50
8|Hypno|P|1|90|2|P||Drowzee|Prophecy~P~0~prophecy;Dark Mind~PPP~30~darkMind
9|Kabutops|F|2|60|1|G||Kabuto|Sharp Sickle~FF~30;Absorb~FFFF~40~halfDrain
10|Lapras|W|0|80|2|L|||Water Gun~W~10~waterGun1;Confuse Ray~WW~10~confuse
11|Magneton|L|1|80|2|F||Magnemite|Sonicboom~LC~20~noWeakness;Selfdestruct~LLLL~100~self100
12|Moltres|R|0|70|2||F||Wildfire~R~0~wildfire;Dive Bomb~RRRR~80~attackGate
13|Muk|G|1|70|2|P||Grimer|Sludge~GGG~30~poisonFlip
14|Raichu|L|1|90|1|F||Pikachu|Gigashock~LLLL~30~gigashock
15|Zapdos|L|0|80|2||F||Thunderstorm~LLLL~40~thunderstorm
31|Arbok|G|1|60|2|P||Ekans|Terror Strike~G~10~terror;Poison Fang~GGC~20~poison
32|Cloyster|W|1|50|2|L||Shellder|Clamp~WW~30~clamp;Spike Cannon~WW~0~coin2x30
33|Gastly|P|0|50|0||F||Lick~P~10~paralyze;Energy Conversion~PP~0~energyConversion
34|Golbat|G|1|60|0|P|F|Zubat|Wing Attack~CCC~30;Leech Life~GGC~20~drain
35|Golduck|W|1|70|1|L||Psyduck|Psyshock~P~10~paralyze;Hyper Beam~WWC~20~discardEnergy
36|Golem|F|2|80|4|G||Graveler|Avalanche~FFFC~60;Selfdestruct~FFFF~100~self100
37|Graveler|F|1|60|2|G||Geodude|Harden~FF~0~harden;Rock Throw~FFC~40
38|Kingler|W|1|60|3|L||Krabby|Flail~W~0~flail;Crabhammer~WWC~40
39|Magmar|R|0|70|1|W|||Smokescreen~R~10~smokescreen;Smog~RR~20~poisonFlip
40|Omastar|W|2|70|1|G||Omanyte|Water Gun~WC~20~waterGun1;Spike Cannon~WW~0~coin2x30
41|Sandslash|F|1|70|1|G|L|Sandshrew|Slash~CC~20;Fury Swipes~FF~0~coin3x20
42|Seadra|W|1|60|1|L||Horsea|Water Gun~WC~20~waterGun1;Agility~WCC~20~agility
43|Slowbro|P|1|60|1|P||Slowpoke|Psyshock~PP~20~paralyze
44|Tentacruel|W|1|60|0|L||Tentacool|Supersonic~W~0~confuse;Jellyfish Sting~WW~10~poison
45|Weezing|G|1|60|1|P||Koffing|Smog~GG~20~poisonFlip;Selfdestruct~GGC~60~self60
46|Ekans|G|0|40|1|P|||Spit Poison~G~0~poisonFlip;Wrap~GC~20~paralyze
47|Geodude|F|0|50|1|G|||Stone Barrage~FC~0~untilTails
48|Grimer|G|0|50|1|P|||Nasty Goo~C~10~paralyze;Minimize~G~0~minimize
49|Horsea|W|0|40|0|L|||Smokescreen~W~10~smokescreen
50|Kabuto|F|1|30|1|G||Mysterious Fossil|Scratch~C~10
51|Krabby|W|0|50|2|L|||Call for Family~W~0~callKrabby;Irongrip~WC~20
52|Omanyte|W|1|40|1|G||Mysterious Fossil|Water Gun~W~10~waterGun1
53|Psyduck|W|0|50|1|L|||Headache~P~0~trainerLock;Fury Swipes~W~0~coin3x10
54|Shellder|W|0|30|1|L|||Supersonic~W~0~confuse;Hide in Shell~W~0~hide
55|Slowpoke|P|0|50|1|P|||Spacing Out~C~0~spacing;Scavenge~PP~0~scavenge
56|Tentacool|W|0|30|0|L|||Acid~W~10
57|Zubat|G|0|40|0|P|F||Supersonic~CC~0~confuse;Leech Life~GC~10~drain
`.trim().split('\n');
const S=(t)=>({type:'status',target:'opponentActive',status:t});
const coin=(effect)=>({type:'coinFlip',heads:effect});
const seq=(...effects)=>({type:'sequence',effects});
const bench=(side,amount)=>({type:'benchDamage',side,amount,all:true});
const effects={
 paralyze:coin(S('paralysis')),confuse:coin(S('confusion')),poisonFlip:coin(S('poison')),poison:S('poison'),sleep:S('sleep'),
 blizzard:{type:'coinFlip',heads:bench('opponent',10),tails:bench('self',10)},coin2x40:{type:'coinDamage',coins:2,amount:40,mode:'replace'},coin2x30:{type:'coinDamage',coins:2,amount:30,mode:'replace'},coin3x20:{type:'coinDamage',coins:3,amount:20,mode:'replace'},coin3x10:{type:'coinDamage',coins:3,amount:10,mode:'replace'},
 darkMind:{type:'benchDamage',side:'opponent',amount:10},stretchKick:{type:'benchDamage',side:'opponent',amount:20},
 prophecy:{type:'fossilProphecy'},halfDrain:{type:'drain',fraction:0.5},drain:{type:'drain',fraction:1},
 waterGun1:{type:'energyDamage',source:'self',energyType:'Water',extraAbove:1,maxCount:2,amount:10},
 noWeakness:{type:'damageRule',ignoreWeakness:true,ignoreResistance:true},
 self100:seq(bench('self',20),bench('opponent',20),{type:'selfDamage',amount:100}),
 self60:seq(bench('self',10),bench('opponent',10),{type:'selfDamage',amount:60}),
 wildfire:{type:'fossilWildfire'},attackGate:{type:'coinAttackGate',heads:{type:'noop'}},
 gigashock:{type:'multiTargetDamage',target:'opponentBench',count:3,amount:10},
 thunderstorm:{type:'fossilThunderstorm'},
 terror:coin({type:'forceOpponentSwitch'}),
 clamp:{type:'coinAttackGate',heads:S('paralysis')},
 energyConversion:seq({type:'energyRetrieval',amount:2},{type:'selfDamage',amount:10}),
 discardEnergy:{type:'discardEnergyCard',target:'opponentActive',amount:1},
 harden:{type:'preventDamage',target:'self',duration:'opponentTurn',maxDamage:30},
 flail:{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},
 smokescreen:{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},
 agility:coin({type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}),
 untilTails:{type:'coinDamage',coins:'untilTails',amount:10,mode:'replace'},
 minimize:{type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn',scope:'self'},
 callKrabby:{type:'benchFromDeck',amount:1,filter:{kind:'pokemon',stage:'Basic',name:'Krabby'}},
 trainerLock:{type:'actionLock',cardType:'Trainer',side:'opponent',duration:'opponentTurn'},
 hide:coin({type:'preventDamage',target:'self',duration:'opponentTurn'}),
 spacing:coin({type:'heal',target:'self',amount:10}),
 scavenge:seq({type:'discardEnergy',target:'self',energyType:'Psychic',amount:1,useCost:true},{type:'searchChosen',source:'discard',amount:1,filter:{kind:'trainer'}})
};
const TEXT={
 paralyze:'Flip a coin; on heads, Paralyze the Defending Pokémon.',confuse:'Flip a coin; on heads, Confuse the Defending Pokémon.',poisonFlip:'Flip a coin; on heads, Poison the Defending Pokémon.',poison:'Poison the Defending Pokémon.',sleep:'Put the Defending Pokémon to Sleep.',
 blizzard:'Flip a coin: on heads, damage each opposing Benched Pokémon for 10; on tails, damage each of your own Benched Pokémon for 10.',
 coin2x40:'Flip two coins; deal 40 damage per heads.',coin2x30:'Flip two coins; deal 30 damage per heads.',coin3x20:'Flip three coins; deal 20 damage per heads.',coin3x10:'Flip three coins; deal 10 damage per heads.',
 darkMind:'Deal 10 damage to one opposing Benched Pokémon, ignoring Weakness and Resistance.',stretchKick:'Choose an opponent’s Benched Pokémon and deal 20 damage to it, ignoring Weakness and Resistance.',
 prophecy:'Look at up to the top three cards of either deck and put them back in any order.',halfDrain:'Heal half the damage this attack deals, rounded up to a full damage counter.',drain:'Heal damage equal to the amount dealt.',waterGun1:'Add 10 damage per extra attached Water Energy beyond those needed, maximum 20 bonus damage.',
 noWeakness:'Ignore Weakness and Resistance when dealing this attack’s damage.',self100:'Deal 20 damage to every Pokémon on both Benches, then 100 damage to this Pokémon.',self60:'Deal 10 damage to every Pokémon on both Benches, then 60 damage to this Pokémon.',
 wildfire:'You may discard Fire Energy attached to Moltres; discard the same number of cards from the opponent’s deck.',attackGate:'Flip a coin; on tails, this attack does no damage.',
 gigashock:'Deal 10 damage to up to three opposing Benched Pokémon.',thunderstorm:'Flip once for each opposing Benched Pokémon: heads deals it 20 damage; take 10 self-damage for each tails.',
 terror:'Flip a coin; on heads, after damage your opponent switches its Active Pokémon with a Benched Pokémon.',clamp:'Flip a coin; on heads, Paralyze the opponent; on tails, the attack does nothing.',
 energyConversion:'Take up to two discarded Energy cards back into your hand and deal 10 damage to Gastly.',discardEnergy:'Discard one Energy card attached to the opponent’s Active Pokémon.',
 harden:'Prevent damage of 30 or less to this Pokémon during the opponent’s next turn.',flail:'Deal 10 damage per damage counter currently on this Pokémon.',smokescreen:'The opponent flips a coin to attack next turn; tails makes the attack fail.',
 agility:'Flip a coin: on heads, prevent all effects of attacks on this Pokémon next turn.',untilTails:'Flip until tails; deal 10 damage for each heads.',minimize:'Reduce incoming attack damage by 20 on the opponent’s next turn.',
 callKrabby:'Search your deck for a Basic Krabby, put it on your Bench, then shuffle.',trainerLock:'Your opponent cannot play Trainer cards during their next turn.',hide:'Flip a coin; on heads, prevent attack damage to this Pokémon next turn.',spacing:'Flip a coin; on heads, heal 10 damage. Requires existing damage.',
 scavenge:'Discard one attached Psychic Energy to recover a Trainer from your discard pile.'
};
const ABILITIES={
 1:[{name:'Prehistoric Power',type:'passive',disabledByStatus:true,effect:{type:'actionLock',cardType:'Evolution',duration:'whileInPlay'},text:'Neither player may evolve Pokémon while Aerodactyl’s Power is active.'}],
 3:[{name:'Transform',type:'passive',activeOnly:true,disabledByStatus:true,effect:{type:'noop'},text:'While Active, copy the defending Pokémon’s card, stats and attacks (except evolution), and treat attached Energy as any type.'}],
 4:[{name:'Step In',type:'activated',benchOnly:true,oncePerTurn:true,effect:{type:'switch',side:'self',source:'bench'},text:'Once per turn, switch Benched Dragonite with your Active Pokémon.'}],
 5:[{name:'Curse',type:'activated',oncePerTurn:true,disabledByStatus:true,effect:{type:'fossilMoveCounter',side:'opponent'},text:'Move one damage counter from one opposing Pokémon to another, including for a knockout.'}],
 6:[{name:'Transparency',type:'passive',disabledByStatus:true,effect:{type:'fossilTransparency'},text:'Flip a coin when an attack would affect Haunter; on heads, prevent all effects including damage.'}],
 13:[{name:'Toxic Gas',type:'passive',disabledByStatus:true,effect:{type:'abilitySuppression',duration:'whileInPlay',scope:'both'},text:'While this Power is active, ignore all other Pokémon Powers (except Toxic Gas).'}],
 43:[{name:'Strange Behavior',type:'activated',oncePerTurn:false,disabledByStatus:true,effect:{type:'fossilMoveCounter',side:'self',destination:'self'},text:'Move one damage counter from another of your Pokémon onto Slowbro; do not knock Slowbro out.'}],
 50:[{name:'Kabuto Armor',type:'passive',disabledByStatus:true,effect:{type:'fossilArmor'},text:'Attack damage taken by Kabuto is halved and rounded down to the nearest 10, after Weakness and Resistance.'}],
 52:[{name:'Clairvoyance',type:'passive',disabledByStatus:true,effect:{type:'fossilClairvoyance'},text:'Your opponent plays with their hand revealed.'}],
 56:[{name:'Cowardice',type:'activated',disabledByStatus:true,effect:{type:'returnToHand',target:'self',discardAttached:true,requirePlayedBeforeTurn:true},text:'Return Tentacool to your hand; discard attached cards. Cannot be used the turn Tentacool enters play.'}]
};
// No approximate stand-ins for powers whose behaviour needs an engine-specific implementation.
const SPECIAL_ENGINE_REQUIRED=new Set([3]);
const rows=[];
for(const line of TABLE){const [number,name,type,stage,hp,ret,weak,res,evolvesFrom,moves]=line.split('|');const attacks=(moves||'').split(';').filter(Boolean).map(move=>{const [name,cost,rawDamage,key='']=move.split('~');const effect=effects[key]||null;return {name,cost,damage:Number(rawDamage)||0,damageText:/coin|untilTails|flail|thunderstorm/.test(key)?'×':/waterGun/.test(key)?'+':null,effect,text:TEXT[key]||''};});const n=Number(number);const abilities=ABILITIES[n]||[],reasons=[];
 if(SPECIAL_ENGINE_REQUIRED.has(n))reasons.push(`${name} needs special Fossil rules implementation`);
 for(const attack of attacks)if(attack.effect&&fx?.supportsEffect?.(attack.effect)===false)reasons.push(`Unsupported ${attack.name} effect`);
 for(const ability of abilities)if(fx?.supportsEffect?.(ability.effect)===false)reasons.push(`Unsupported ${ability.name} power`);
 rows.push({number:n,name,kind:'pokemon',stage:stage==='0'?'Basic':`Stage ${stage}`,hp:Number(hp),retreat:Number(ret),subtype:TYPES[type],types:[TYPES[type]],weakness:TYPES[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPES[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolvesFrom||null,attacks,abilities,battleEnabled:!reasons.length,deckEligible:!reasons.length,support:{status:reasons.length?'PARTIAL':'FULL',reasons}});
}
const trainers={
 58:{name:'Mr. Fuji',text:'Choose one of your Benched Pokémon and shuffle it, with all attached cards, into your deck.',effect:{type:'shuffleIntoDeck',target:'selfBench',includeAttached:true}},
 59:{name:'Energy Search',text:'Search your deck for a Basic Energy card, add it to your hand, then shuffle.',effect:{type:'searchChosen',source:'deck',amount:1,filter:{kind:'energy'}}},
 60:{name:'Gambler',text:'Shuffle your hand into your deck. Flip a coin: draw eight on heads, one on tails.',effect:{type:'sequence',effects:[{type:'handShuffle',side:'self',draw:0},{type:'coinFlip',heads:{type:'draw',amount:8},tails:{type:'draw',amount:1}}]}},
 61:{name:'Recycle',text:'Flip a coin; on heads, place one card from your discard pile on top of your deck.',effect:{type:'coinFlip',heads:{type:'fossilRecycle'}}},
 62:{name:'Mysterious Fossil',text:'Play as a 10 HP Basic Pokémon with no attacks, no retreat and no Prize awarded when knocked out. It may evolve into Kabuto, Omanyte or Aerodactyl.',effect:{type:'playFossil',hp:10,subtype:'Colorless',canRetreat:false,noPrize:true,countsAsKnockout:false,statusImmune:['sleep','confusion','paralysis','poison'],discardable:true},abilities:[{name:'Discard Fossil',type:'activated',effect:{type:'discardSelf'},text:'At any time during your turn before attacking, you may discard Mysterious Fossil from play.'}]}
};
const CARDS=[];
for(let n=1;n<=62;n++){
 if(n>=58){const v=trainers[n],reasons=[];if(n===59)reasons.push('Basic Energy is supplied by the Energy Zone; Energy Search requires hybrid rules');if(fx?.supportsEffect?.(v.effect)===false)reasons.push('Unimplemented Trainer effect');CARDS.push({id:`base3-${n}`,name:v.name,setId:'base3',number:String(n),kind:'trainer',trainerType:'Item',text:v.text,effect:v.effect,abilities:v.abilities||[],hp:n===62?10:undefined,battleEnabled:!reasons.length,deckEligible:!reasons.length,support:{status:reasons.length?'PARTIAL':'FULL',reasons},source:'tcg',battleFormat:'classic',image:`https://images.pokemontcg.io/base3/${n}.png`,imageLarge:`https://images.pokemontcg.io/base3/${n}_hires.png`,rarity:n===58?'Uncommon':'Common'});continue;}
 const old=n>=16&&n<=30?n-15:n,card=rows.find(r=>r.number===old);if(!card)throw new Error('Missing Fossil #'+n);
 const {number,...meta}=card;CARDS.push({...meta,id:`base3-${n}`,setId:'base3',number:String(n),source:'tcg',battleFormat:'classic',image:`https://images.pokemontcg.io/base3/${n}.png`,imageLarge:`https://images.pokemontcg.io/base3/${n}_hires.png`,rarity:n<=15?'Rare Holo':n<=30?'Rare':n<=45?'Uncommon':'Common'});
}
const BY_ID=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>BY_ID.get(String(id||'').toLowerCase())||null,coverage:()=>({total:62,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
