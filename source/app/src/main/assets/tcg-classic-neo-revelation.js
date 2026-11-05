/* Neo Revelation (66 numbered cards), Classic TCG catalogue.
 * Original card identity, print and attack text: PokemonTCG/pokemon-tcg-data/cards/en/neo3.json.
 * Unsupported effects are explicitly restricted instead of silently resolving as vanilla attacks.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGNeoRevelation=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'neo3',name:'Neo Revelation',series:'Neo',releaseDate:'2001-09-21',cardCount:66});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless',D:'Darkness',M:'Metal'};
// number|name|type|stage|HP|retreat|weakness|resistance|evolvesFrom|rarity|attacks
const DATA=`1|Ampharos|L|2|90|3|F||Flaaffy|Rare Holo|Attract Current~L~20;Gigavolt~LLLC~40+
2|Blissey|C|1|120|2|F|P|Chansey|Rare Holo|Body Slam~CCCC~30
3|Celebi|P|0|50|1|P|||Rare Holo|Psychic Damage~P~
4|Crobat|G|2|90|0|P|F|Golbat|Rare Holo|Triggered Poison~G~20;Cross Attack~GGC~20×
5|Delibird|C|0|60|1|L|F||Rare Holo|Present~CC~
6|Entei|R|0|80|1|W|||Rare Holo|Searing Flames~RRR~60
7|Ho-oh|R|0|90|2|W|F||Rare Holo|Stoke~R~;Sacred Fire~RRR~;Dive Bomb~RRRRR~90
8|Houndoom|D|1|70|1||P|Houndour|Rare Holo|Dark Flame~R~20;Black Fang~DCC~30+
9|Jumpluff|G|2|70|0|R|F|Skiploom|Rare Holo|Evolutionary Spore~G~;Solarbeam~G~30
10|Magneton|M|1|80|2|R|G|Magnemite|Rare Holo|Plasma~LLC~30
11|Misdreavus|P|0|50|1||F||Rare Holo|Night Eyes~P~;Perish Song~PPP~
12|Porygon2|C|1|70|1|F|P|Porygon|Rare Holo|Delta Beam~CCC~20
13|Raikou|L|0|80|1|F|||Rare Holo|Lightning Tackle~LLL~50
14|Suicune|W|0|70|1|L|||Rare Holo|Aurora Wave~WWW~30
15|Aerodactyl|F|1|60|2|G|F|Mysterious Fossil|Rare|Fly~CCC~30
16|Celebi|G|0|50|1|R|||Rare|Psychic Leaf~GG~10+
17|Entei|R|0|60|0|W|||Rare|Mega Flame~RRR~50
18|Ho-oh|C|0|90|2|W|F||Rare|Rainbow Burn~CCCC~30+
19|Kingdra|W|2|90|2|||Seadra|Rare|Genetic Memory~C~;Twister~WWCC~50
20|Lugia|P|0|90|2|P|F||Rare|Aerowing~CCCC~40
21|Raichu|L|1|80|1|F||Pikachu|Rare|Thundershock~LC~20;Lightning Strike~LLL~40
22|Raikou|L|0|60|0|F|||Rare|Lightning Spark~LLL~30
23|Skarmory|M|0|60|2|R|G||Rare|Fury Attack~C~10×;Agility~MCC~20
24|Sneasel|D|0|60|0||P||Rare|Swipe~D~;Quick Attack~CC~10+
25|Starmie|P|1|70|1|P||Staryu|Rare|Confuse Ray~W~10;Core Stream~PPC~
26|Sudowoodo|F|0|60|3|W|||Rare|Slam~CC~20×
27|Suicune|W|0|60|0|L|||Rare|Crystal Wave~WWW~30+
28|Flaaffy|L|1|70|1|F||Mareep|Uncommon|Electric Punch~L~20;Tail Shock~LCC~30
29|Golbat|G|1|60|0|P|F|Zubat|Uncommon|Screech~C~;Poison Bite~GC~10
30|Graveler|F|1|70|2|G||Geodude|Uncommon|Earthquake~FC~40;Rock Tumble~FFF~50
31|Jynx|W|0|60|1|P|||Uncommon|Freezing Kiss Goodnight~W~;Strange Dance~PPC~20+
32|Lanturn|L|1|80|2|F||Chinchou|Uncommon|Blinding Light~LCC~30
33|Magcargo|R|1|80|3|W||Slugma|Uncommon|Lava Flow~RRR~40+
34|Octillery|W|1|80|2|L||Remoraid|Uncommon|Constrict~W~10;Octazooka~WWW~40
35|Parasect|G|1|60|2|R||Paras|Uncommon|Sleep Pinchers~GG~30
36|Piloswine|F|1|90|3|G|L|Swinub|Uncommon|Nap~CC~;High-Speed Charge~FFCC~80
37|Seaking|W|1|70|1|L||Goldeen|Uncommon|Rising Lunge~W~10+;Horn Swipe~WW~20+
38|Stantler|C|0|60|1|F|P||Uncommon|Terrorize~C~;Overhead Toss~CCC~30
39|Unown [B]|P|0|50|1|P|||Uncommon|Hidden Power~P~10
40|Unown [Y]|P|0|40|1|P|||Uncommon|Hidden Power~P~10
41|Aipom|C|0|40|0|F|P||Common|Grab~C~;Tail Punch~CC~20
42|Chinchou|L|0|50|1|F|||Common|Positive Ion~L~10+;Negative Ion~W~10
43|Farfetch'd|C|0|50|1|L|F||Common|Gust~C~10;Leek Jab~CCC~40
44|Geodude|F|0|40|1|G|||Common|Knuckle Punch~F~20
45|Goldeen|W|0|40|0|L|||Common|Fin Smack~C~10×
46|Murkrow|D|0|40|0||P||Common|Call for Family~C~;Flock Attack~CC~10+
47|Paras|G|0|40|1|R|||Common|Sleep Spore~G~10;Scratch~CC~20
48|Quagsire|W|1|70|2|G|L|Wooper|Common|Mud Slap~FF~30;Whirlpool~WWCC~40
49|Qwilfish|W|0|60|1|L|||Common|Poison Sting~W~10;Needle Storm~CC~20×
50|Remoraid|W|0|40|0|L|||Common|Sharpshooting~W~
51|Shuckle|F|0|40|1|G|||Common|Toxic Saliva~GG~
52|Skiploom|G|1|60|0|R|F|Hoppip|Common|Hop~C~20;Mysterious Powder~G~10
53|Slugma|R|0|50|2|W|||Common|Flare~R~10;Magma Ring~RR~20
54|Smoochum|P|0|30|0||||Common|Psykiss~C~
55|Snubbull|C|0|50|1|F|P||Common|Bite~C~10;Raging Headbutt~CC~10+
56|Staryu|W|0|40|1|L|||Common|Tackle~C~10;Bubblebeam~W~10
57|Swinub|F|0|40|1|G|L||Common|Tackle~C~10;Take Down~FC~30
58|Unown [K]|P|0|40|1|P|||Common|Hidden Power~P~10
59|Zubat|G|0|40|0|P|F||Common|Bite~C~10;Poison Spray~G~
60|Balloon Berry||0||0||||Uncommon|
61|Healing Field||0||0||||Uncommon|
62|Pokémon Breeder Fields||0||0||||Uncommon|
63|Rocket's Hideout||0||0||||Uncommon|
64|Old Rod||0||0||||Common|
65|Shining Gyarados|W|0|100|3|G|F||Rare Shining|Outrage~WFF~30+;Devastate~WWRR~50
66|Shining Magikarp|W|0|30|1|L|||Rare Shining|Gold Scale~W~;Dragon Bond~P~`.trim().split('\n');
const noop={type:'noop'},status=s=>({type:'status',target:'opponentActive',status:s}),coin=(yes,no=noop)=>({type:'coinFlip',heads:yes,tails:no}),seq=(...effects)=>({type:'sequence',effects}),bonus=n=>({type:'bonusDamage',amount:n}),multi=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'}),gate=()=>({type:'coinAttackGate',heads:noop});
const ATTACK={};
function set(n,i,effect){ATTACK[n+':'+i]=effect;}
// Exact effects that are already represented by the shared battle rules.
set(1,0,{type:'neoRule',rule:'revelation:attractCurrent'});
set(1,1,coin(bonus(20),status('paralysis')));
set(2,0,coin(status('paralysis')));
set(3,0,multi(3,10));
set(5,0,{type:'neoRule',rule:'revelation:present'});
set(7,2,gate());
set(9,1,noop);
set(7,0,{type:'neoRule',rule:'revelation:stoke'});
set(7,1,coin({type:'selectedDamage',target:'opponentPokemon',amount:40,ignoreWeakness:true,ignoreResistance:true}));
set(11,0,seq(status('sleep'),{type:'neoRule',rule:'revelation:nightEyes'}));
set(11,1,{type:'neoRule',rule:'revelation:perishSong'});
set(13,0,coin(noop,{type:'selfDamage',amount:20}));
set(15,0,{type:'coinAttackGate',heads:{type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}});
set(21,0,coin(status('paralysis')));
set(23,0,multi(2,10));
set(23,1,coin({type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}));
set(24,1,coin(bonus(20)));
set(25,0,coin(status('confusion')));
set(26,0,multi(2,20));
set(28,0,noop);
set(29,0,{type:'neoRule',rule:'screech'});
set(29,1,{type:'neoRule',rule:'poisonBite'});
set(30,0,{type:'benchDamage',side:'self',all:true,amount:10});
set(30,1,{type:'damageRule',ignoreResistance:true});
set(31,0,status('sleep'));
set(31,1,coin(seq(bonus(20),status('confusion'))));
set(32,0,coin(status('confusion')));
set(34,0,coin(status('paralysis')));
set(34,1,coin({type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'}));
set(35,0,coin(status('sleep')));
set(36,0,{type:'healSelf',amount:30});
set(36,1,seq({type:'selfDamage',amount:30},{type:'lock',target:'self',action:'attack',attackName:'High-Speed Charge',duration:'nextOwnTurn'}));
set(37,0,coin(bonus(10)));
set(37,1,{type:'allHeadsBonus',coins:2,amount:40});
set(42,0,coin(bonus(10)));
set(43,0,noop);
set(43,1,{type:'lock',target:'self',action:'attack',attackName:'Leek Jab',duration:'nextOwnTurn'});
set(46,0,{type:'neoRule',rule:'revelation:callMurkrow'});
set(46,1,{type:'coinDamageByPokemon',filter:{name:'Murkrow'},benchOnly:true,amount:10,mode:'add'});
set(44,0,noop);
set(45,0,multi(2,10));
set(47,0,coin(status('sleep')));
set(48,1,{type:'discardEnergyCard',target:'opponentActive',amount:1});
set(47,1,noop);
set(48,0,noop);
set(49,0,coin(status('poison')));
set(49,1,{type:'neoRule',rule:'revelation:needleStorm'});
set(50,0,coin({type:'selectedDamage',target:'opponentPokemon',amount:20,ignoreWeakness:true,ignoreResistance:true}));
set(51,0,coin({type:'status',target:'opponentActive',status:'poison',amount:20}));
set(52,0,noop);
set(52,1,coin(status('confusion')));
set(53,0,noop);
set(53,1,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'});
set(55,0,noop);
set(55,1,coin({type:'damageFromDamage',source:'self',amount:1}));
set(16,0,{type:'neoRule',rule:'revelation:psychicLeaf'});
set(18,0,{type:'energyTypeCountDamage',amount:10});
set(28,1,coin({type:'benchDamage',side:'opponent',all:true,amount:10}));
set(56,0,noop);
set(56,1,coin(status('paralysis')));
set(57,0,noop);
set(57,1,{type:'selfDamage',amount:10});
set(59,0,noop);
set(59,1,status('poison'));
set(66,0,{type:'neoRule',rule:'revelation:goldScale'});
set(66,1,{type:'neoRule',rule:'revelation:dragonBond'});
// More intricate rules require a dedicated engine implementation, not a no-op.
const PLAIN=new Set('9:1 28:0 43:0 44:0 47:1 48:0 52:0 53:0 55:0 56:0 57:0 59:0'.split(' '));
const POWER_NAMES={2:'Softboiled',3:'Time Travel',6:'Howl',10:'Electromagnetic Power',12:'Energy Converter',13:'Lightning Burst',14:'Crystal Body',15:'Prehistoric Memory',17:'Legendary Body',22:'Legendary Body',26:'Mimic',27:'Legendary Body',32:'Submerge',33:'Magma Pool',35:'Allergic Pollen',39:'[Bear]',40:'[Yield]',51:'Hard Shell',58:'[Keep]'};
const POWER_IMPLEMENTED=new Set([51]);
const POWER_MODE={2:'triggered',3:'passive',6:'triggered',10:'activated',12:'activated',13:'triggered',14:'passive',15:'passive',17:'passive',22:'passive',26:'passive',27:'passive',32:'activated',33:'passive',35:'passive',39:'activated',40:'activated',51:'passive',58:'passive'};
const TRAINER_TEXT={
60:'Attach Balloon Berry to one Pokémon without a Tool. When it retreats, discard this Tool instead of Energy.',
61:'Stadium: once during each player’s turn, flip a coin. On heads, heal 20 damage from that player’s Active Pokémon.',
62:'Flip for one or two non-Baby Pokémon that can evolve. On heads, search for a matching Evolution and put it in your hand.',
63:'Stadium: Pokémon with Dark in their names have 20 extra HP.',
64:'Flip twice. Both heads retrieve a Pokémon from discard; both tails retrieve a Trainer.'};
const TRAINER_EFFECTS={
61:{type:'stadiumAction',effect:coin({type:'healSelf',amount:20})},
63:{type:'modifier',stat:'maxHp',amount:20,scope:'both',duration:'whileInPlay',filter:{nameContains:'Dark'}},
64:{type:'neoRule',rule:'revelation:oldRod'}
};
// Readable paraphrases of the printed Neo Revelation attacks. These also
// explain cards whose unusual effects are not yet battle-enabled.
const ATTACK_TEXT={
  1:[`Flip three coins. For each heads, find a Lightning Energy in the ordered Basic Energy supply and attach it to one of your Lightning Pokémon.`,`Heads: 60 damage. Tails: 40 damage and Paralyze the defender.`],
  2:[`Flip a coin. On heads, Paralyze the defending Pokémon.`],
  3:[`Flip three coins. Put one damage counter on the defender for every heads.`],
  4:[`If your opponent attaches Energy to the defender next turn, Poison that Pokémon.`,`Flip four coins; deal 20 per heads. With at least two heads, also Confuse the defender.`],
  5:[`Flip three coins: one heads deals 40 damage; two heads heal 30 from the defender; three heads deal 60; three tails heal all the defender's damage.`],
  6:[`Discard two Fire Energy attached to Entei or this attack does nothing.`],
  7:[`Attach one Fire Energy from the Basic Energy supply to Ho-oh.`,`Heads: choose any opposing Pokémon and deal 40 damage, ignoring Weakness and Resistance. Tails: no damage.`,`Flip a coin. On tails, this attack misses completely.`],
  8:[`Discard one attached Fire Energy or this attack fails. Attach a discarded Darkness Energy to Houndoom if available.`,`Flip once for each Darkness Energy attached to Houndoom; deal 10 extra damage per heads.`],
  9:[`Evolve any number of your Hoppip and Skiploom by finding their matching evolution cards in your deck.`,`Deal 30 damage.`],
  10:[`Attach one discarded Lightning Energy to Magneton, if available.`],
  11:[`Put the defender to Sleep and mark it as hit by Night Eyes.`,`Knock out the defender if it is still Asleep and was hit by Night Eyes last turn.`],
  12:[`Flip a coin. On heads, choose Sleep, Confusion or Paralysis for the defender.`],
  13:[`Flip a coin. On tails, Raikou damages itself for 20.`],
  14:[`Flip two coins: two heads Paralyze; exactly one heads puts the defender to Sleep.`],
  15:[`Heads: prevent all attacks and effects against Aerodactyl next turn. Tails: no damage or effect.`],
  16:[`Flip a coin for each Energy attached to the defender. Add 10 damage per heads; heal Celebi by the actual damage dealt.`],
  17:[`Flip two coins. For every tails, discard one of Entei's attached Fire Energy.`],
  18:[`Add 10 damage for each different Basic Energy type attached to Ho-oh.`],
  19:[`Use an attack on Kingdra's underlying Basic or Evolution cards without paying its Energy cost.`,`Flip twice. Discard an Energy from the defender for each heads; two tails means no damage.`],
  20:[`You may flip a coin: heads doubles this attack's damage to 80; tails makes it miss.`],
  21:[`Flip a coin. Heads: Paralyze the defender.`,`You may discard all attached Lightning Energy. If you do, this attack deals 80 instead of 40 damage.`],
  22:[`Heads: deal 20 extra damage to one opposing Benched Pokémon, ignoring Weakness and Resistance.`],
  23:[`Flip two coins; deal 10 damage per heads.`,`Flip a coin. On heads, prevent all damage and other attack effects against Skarmory next turn.`],
  24:[`Heads: discard all Trainer cards attached to your opponent's Pokémon.`,`Flip a coin. On heads, deal 20 additional damage.`],
  25:[`Flip a coin. On heads, Confuse the defender.`,`Choose a non-Colorless Energy type. Deal 20 damage to every opposing Pokémon carrying that Energy type, ignoring Weakness and Resistance.`],
  26:[`Flip two coins; deal 20 damage per heads.`],
  27:[`Heads: deal 10 extra damage. Tails: after dealing damage, the opponent switches their Active Pokémon with a Benched Pokémon.`],
  28:[`Deal 20 damage.`,`Heads: deal 10 to each opposing Benched Pokémon as well.`],
  29:[`Until the end of your next turn, attacks against this defender deal 20 extra damage.`,`Poison the defender and heal Golbat by half the damage actually dealt, rounded up to a damage counter.`],
  30:[`Deal 10 damage to each of your own Benched Pokémon.`,`Deal 50 damage, ignoring the defender's Resistance.`],
  31:[`Put the defending Pokémon to Sleep.`,`Heads: deal 20 extra damage and Confuse the defender.`],
  32:[`Flip a coin. On heads, Confuse the defending Pokémon.`],
  33:[`You may discard any number of attached Fire Energy. Add 20 damage for each card discarded.`],
  34:[`Flip a coin. On heads, Paralyze the defender.`,`Heads: the defender must flip a coin whenever it attacks next turn; on tails, that attack fails.`],
  35:[`Flip a coin. On heads, put the defending Pokémon to Sleep.`],
  36:[`Remove up to 30 damage from Piloswine.`,`Piloswine damages itself for 30 and cannot use High-Speed Charge next turn.`],
  37:[`Flip a coin. On heads, add 10 damage.`,`Flip two coins. If both are heads, add 40 damage.`],
  38:[`Choose one attack on a Basic defender. It cannot use that attack next turn.`,`If you have a Bench, flip a coin. On tails, deal 10 damage to one of your own Benched Pokémon.`],
  39:[`Deal 10 damage.`],
  40:[`Deal 10 damage.`],
  41:[`Choose an attached Trainer card on an opposing Pokémon and shuffle it into your opponent's deck.`,`Deal 20 damage.`],
  42:[`Flip a coin. On heads, add 10 damage.`,`If the defender attacks Chinchou next turn, its damage is reduced by 10 before Weakness and Resistance.`],
  43:[`Deal 10 damage.`,`Deal 40 damage. Farfetch'd cannot use Leek Jab next turn unless it leaves the Active spot.`],
  44:[`Deal 20 damage.`],
  45:[`Flip two coins; deal 10 damage per heads.`],
  46:[`Find another Murkrow in your deck and put it on your Bench if there is space.`,`Flip once for each Murkrow on your Bench; add 10 damage per heads.`],
  47:[`Flip a coin. On heads, put the defender to Sleep.`,`Deal 20 damage.`],
  48:[`Deal 30 damage.`,`Discard one Energy attached to the defending Pokémon, if it has any.`],
  49:[`Flip a coin. On heads, Poison the defender.`,`Keep flipping until tails; deal 20 damage for each heads in the streak.`],
  50:[`Heads: choose any opposing Pokémon and deal 20 damage to it, ignoring Weakness and Resistance.`],
  51:[`Flip a coin. On heads, Poison the defender for 20 between-turn damage instead of the usual 10.`],
  52:[`Deal 20 damage.`,`Flip a coin. On heads, Confuse the defender.`],
  53:[`Deal 10 damage.`,`The defender cannot retreat during its next turn.`],
  54:[`Heads: shuffle one Special Energy attached to any opposing Pokémon into your opponent's deck.`],
  55:[`Deal 10 damage.`,`Heads: add 10 damage for every damage counter currently on Snubbull.`],
  56:[`Deal 10 damage.`,`Flip a coin. On heads, Paralyze the defender.`],
  57:[`Deal 10 damage.`,`Swinub deals 10 damage to itself.`],
  58:[`Deal 10 damage.`],
  59:[`Deal 10 damage.`,`Poison the defending Pokémon.`],
  65:[`Flip a coin. On heads, add 10 damage for each damage counter on Shining Gyarados; on tails, this attack misses.`,`Discard two attached Fire Energy or this attack fails. Deal 10 to each opposing Benched Pokémon. On heads, also discard one Energy from each opposing Pokémon.`],
  66:[`The opponent may draw two cards. Whether or not they do, you may draw two cards.`,`Search your deck for Gyarados, Dark Gyarados or Shining Gyarados, reveal it and add it to your hand.`]
};
const POWER_TEXT={
  2:`When you evolve Chansey into Blissey, flip a coin. Heal 80 damage on heads or 40 on tails.`,
  3:`If an attack would knock out Celebi, flip a coin. On heads, shuffle Celebi and its attached cards into your deck instead. Disabled by status conditions.`,
  6:`When you play Entei, you may discard five cards from your deck; attach any Fire Energy revealed to Fire Pokémon. Using this Power ends your turn.`,
  10:`Move an attached Energy between your Magnemite, Magneton or Dark Magneton as often as you like before attacking. Disabled by status conditions.`,
  12:`Once a turn, temporarily change an attached Basic Energy on one of your Pokémon to a chosen type. Disabled by status conditions.`,
  13:`When Lightning Energy is attached from hand to Raikou, the opponent must switch their Active Pokémon with a Benched Pokémon if possible.`,
  14:`Suicune ignores effects of opposing attacks other than damage. This protection stops when Suicune has a status condition.`,
  15:`Evolved Pokémon may use attacks from their previous Evolution stages, paying the printed Energy costs. Disabled if Aerodactyl has a status condition.`,
  17:`While Entei is Active, Trainer effects other than Stadiums cannot affect it or its attached Energy. Attached Trainers are discarded.`,
  22:`While Raikou is Active, Trainer effects other than Stadiums cannot affect it or its attached Energy. Attached Trainers are discarded.`,
  26:`While Sudowoodo is Active, it can copy the opponent Active Pokémon's attacks and costs. Disabled by status conditions.`,
  27:`While Suicune is Active, Trainer effects other than Stadiums cannot affect it or its attached Energy. Attached Trainers are discarded.`,
  32:`Once a turn, Lanturn can become Water type until your turn ends. Disabled by status conditions.`,
  33:`When Active Magcargo moves to the Bench, transfer one attached Fire Energy to your new Active Pokémon.`,
  35:`While Parasect is in play, attacks and Pokémon Powers cannot affect cards in either player's discard pile. Disabled by status conditions.`,
  39:`Once per turn, move one damage counter from another Unown you own onto Unown [B], provided it has more than 10 HP remaining.`,
  40:`Once per turn, flip a coin. On heads, fetch one Psychic Energy from the supply and attach it to one of your Unown.`,
  51:`Whenever Shuckle takes 40 or less attack damage after Weakness/Resistance, reduce that damage to 10. Disabled by status conditions.`,
  58:`Opposing attacks, Pokémon Powers and Trainers cannot discard Energy from your Pokémon with Unown in their names.`
};

const RULE_TEXT={
65:'You cannot have more than one Shining Gyarados in your deck.',
66:'You cannot have more than one Shining Magikarp in your deck.'};
function effectSupported(effect){
 if(!effect)return true;
 if(effect.type==='neoRule'&&['revelation:stoke','revelation:oldRod','revelation:present','revelation:nightEyes','revelation:perishSong','revelation:callMurkrow','revelation:needleStorm','revelation:attractCurrent','revelation:psychicLeaf','revelation:goldScale','revelation:dragonBond'].includes(effect.rule))return true;
 if(effect.type==='sequence')return effect.effects.every(effectSupported);
 if(effect.type==='coinFlip')return effectSupported(effect.heads)&&effectSupported(effect.tails);
 if(effect.type==='coinAttackGate')return effectSupported(effect.heads);
 return fx?.supportsEffect?.(effect)===true;
}
const CARDS=DATA.map(line=>{
 const [raw,name,type,stage,hp,ret,weak,res,evolvesFrom,rarity,moves]=line.split('|');
 const n=Number(raw),id='neo3-'+n,kind=n>=60&&n<=64?'trainer':'pokemon';
 const attacks=(moves||'').split(';').filter(Boolean).map((move,i)=>{
  const [title,cost,printed]=move.split('~'),effect=ATTACK[n+':'+i],damage=/[×?]/.test(printed||'')?0:Number(String(printed||'').replace(/[^0-9]/g,''))||0;
  const variable=/[+×?]/.test(printed||'');
  return {name:title,cost,damage,damageText:variable?printed:null,effect:effect||null,text:ATTACK_TEXT[n]?.[i]||'',unimplemented:!Object.prototype.hasOwnProperty.call(ATTACK,n+':'+i)||!effectSupported(effect)};
 });
 // Retain printed Power identity even if the bespoke effect is not yet executable.
 const abilities=POWER_NAMES[n]?[{name:POWER_NAMES[n],type:POWER_MODE[n],effect:{type:'neoRule',rule:'revelation:'+POWER_NAMES[n].toLowerCase().replace(/[^a-z]/g,'')},text:POWER_TEXT[n]||'Consult the printed Pokémon Power.'}]:[];
 const reasons=[];
 if(kind==='pokemon'){
   for(const atk of attacks)if(atk.unimplemented)reasons.push('Printed '+atk.name+' effect needs engine support');
   if(abilities.length&&!POWER_IMPLEMENTED.has(n))reasons.push('Pokémon Power '+POWER_NAMES[n]+' needs engine support');
   if(n===65)reasons.push('Shining Gyarados attacks still need full implementation');
   if(n===54)reasons.push('Baby Pokémon protection must be verified');
 }else if(!TRAINER_EFFECTS[n]||!effectSupported(TRAINER_EFFECTS[n]))reasons.push('Trainer '+name+' effect needs engine support');
 const battleEnabled=reasons.length===0;
 return {id,setId:'neo3',number:String(n),name,kind,rarity,source:'tcg',battleFormat:'classic',
   ...(kind==='pokemon'?{stage:Number(stage)===0?'Basic':'Stage '+stage,hp:Number(hp),retreat:Number(ret),types:[TYPE[type]],subtype:TYPE[type],weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolvesFrom||null,attacks,abilities,baby:n===54,printedRules:RULE_TEXT[n]||''}:{}),
   ...(kind==='trainer'?{trainerType:[60].includes(n)?'Tool':[61,63].includes(n)?'Stadium':'Item',text:TRAINER_TEXT[n],effect:TRAINER_EFFECTS[n]||{type:'neoRule',rule:'revelation:'+n}}:{}),
   battleEnabled,deckEligible:battleEnabled,support:{status:battleEnabled?'FULL':'PARTIAL',reasons},
   image:'https://images.pokemontcg.io/neo3/'+n+'.png',imageLarge:'https://images.pokemontcg.io/neo3/'+n+'_hires.png'};
});
if(CARDS.length!==66||new Set(CARDS.map(c=>c.id)).size!==66)throw new Error('Neo Revelation catalogue identity mismatch');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
 coverage:()=>({total:66,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id+' '+c.name+': '+c.support.reasons.join('; '))})};
});
