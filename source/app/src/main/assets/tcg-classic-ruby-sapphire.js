/* EX Ruby & Sapphire (ex1, June 2003) — first Generation III/EX-era set.
 * 109 official cards from PokemonTCG/pokemon-tcg-data/cards/en/ex1.json.
 * An effect marked unimplemented remains visible but cannot enter a battle deck.
 * The hybrid Classic30 Energy Zone and five Prize cards stay unchanged.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGRubySapphire=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ex1',name:'EX Ruby & Sapphire',series:'EX',releaseDate:'2003-06-18',cardCount:109});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Aggron|P|M|2|110|4|R|G|Lairon|Rare Holo|Retaliate~C~10×;Mega Punch~CCC~40;Double Lariat~MMCCC~70×|
2|Beautifly|P|G|2|80|0|R||Silcoon|Rare Holo|Stun Spore~G~20;Parallel Gain~GCC~50|Withering Dust
3|Blaziken|P|R|2|100|2|W||Combusken|Rare Holo|Fire Stream~RCC~50|Firestarter
4|Camerupt|P|R|1|90|3|W||Numel|Rare Holo|Lava Burn~RC~20;Fire Spin~RRCC~100|
5|Delcatty|P|C|1|70|1|F||Skitty|Rare Holo|Max Energy Source~C~10×|Energy Draw
6|Dustox|P|G|2|90|0|P||Cascoon|Rare Holo|Toxic~GC~;Gust~GCC~50|Protective Dust
7|Gardevoir|P|P|2|100|2|P||Kirlia|Rare Holo|Energy Burst~P~10×|Psy Shadow
8|Hariyama|P|F|1|90|2|P||Makuhita|Rare Holo|Super Slap Push~F~;Mega Throw~FCC~40+|
9|Manectric|P|L|1|70|1|F|M|Electrike|Rare Holo|Attract Current~C~10;Thunder Jolt~LLC~50|
10|Mightyena|P|D|1|70|1|F|P|Poochyena|Rare Holo|Shakedown~DCC~40|Intimidating Fang
11|Sceptile|P|G|2|120|3|R|W|Grovyle|Rare Holo|Lizard Poison~C~20;Solarbeam~GGCCC~70|
12|Slaking|P|C|2|120|3|F||Vigoroth|Rare Holo|Critical Move~CCCC~100|Lazy
13|Swampert|P|W|2|110|3|L||Marshtomp|Rare Holo|Hypno Splash~WWCC~50|Water Call
14|Wailord|P|W|1|120|4|L||Wailmer|Rare Holo|Take Down~CCC~50;Surf~WWWCC~70|
15|Blaziken|P|R|2|110|2|W||Combusken|Rare|Clutch~CC~20;Flamethrower~RCCC~80|
16|Breloom|P|G|1|70|1|R||Shroomish|Rare|Headbutt~CC~20;Battle Blast~GCC~40+|
17|Donphan|P|F|1|80|1|G||Phanpy|Rare|Rend~FC~20+;Double Spin~FCCC~60×|
18|Nosepass|P|F|0|60|1|W|||Rare|Invisible Hand~C~;Repulsion~CC~|
19|Pelipper|P|W|1|70|1|L|F|Wingull|Rare|Stockpile~C~;Spit Up~WC~30;Swallow~WCC~20|
20|Sceptile|P|G|2|100|3|R|W|Grovyle|Rare|Tail Rap~GCC~50×|Energy Trans
21|Seaking|P|W|1|70|0|L||Goldeen|Rare|Water Arrow~W~;Fast Stream~CC~30|
22|Sharpedo|P|W|1|70|1|L||Carvanha|Rare|Dark Slash~WCC~40+|Rough Skin
23|Swampert|P|W|2|100|2|L||Marshtomp|Rare|Water Arrow~W~;Waterfall~WCC~50|Natural Remedy
24|Weezing|P|G|1|80|2|P||Koffing|Rare|Confusion Gas~G~10;Poison Smog~GC~|
25|Aron|P|M|0|50|1|R|G||Uncommon|Rollout~M~10;Double Stab~CC~20×|
26|Cascoon|P|G|1|70|2|R||Wurmple|Uncommon|Poison Thread~G~|Hard Cocoon
27|Combusken|P|R|1|70|1|W||Torchic|Uncommon|Flare~R~20;Double Kick~CCC~40×|
28|Combusken|P|R|1|80|1|W||Torchic|Uncommon|Lunge~CC~50|Natural Cure
29|Delcatty|P|C|1|80|1|F||Skitty|Uncommon|Energy Call~C~10;Cannonball~CC~30+|
30|Electrike|P|L|0|50|1|F|M||Uncommon|Charge~L~;Thunder Jolt~LC~30|
31|Grovyle|P|G|1|70|1|R|W|Treecko|Uncommon|Poison Breath~CC~;Swift~GCC~30|
32|Grovyle|P|G|1|80|1|R|W|Treecko|Uncommon|Slash~CC~20|Natural Cure
33|Hariyama|P|F|1|80|1|P||Makuhita|Uncommon|Shove~FC~20;Slap Down~FCC~40+|
34|Kirlia|P|P|1|70|1|P||Ralts|Uncommon|Removal Beam~P~10;Super Psy~PCC~50|
35|Kirlia|P|P|1|70|1|P||Ralts|Uncommon|Dazzle Dance~C~;Life Drain~P~|
36|Lairon|P|M|1|70|2|R|G|Aron|Uncommon|Ram~CC~20;Metal Claw~MCC~40|
37|Lairon|P|M|1|80|2|R|G|Aron|Uncommon|Magnitude~M~20;One-Two Strike~CCCC~30+|
38|Linoone|P|C|1|70|1|F||Zigzagoon|Uncommon|Seek Out~C~;Continuous Headbutt~CC~40×|
39|Manectric|P|L|1|70|1|F|M|Electrike|Uncommon|Thundershock~CC~20;Gigashock~LCC~40|
40|Marshtomp|P|W|1|70|1|L||Mudkip|Uncommon|Bubble~W~10;Slash~CCC~40|
41|Marshtomp|P|W|1|80|1|L||Mudkip|Uncommon|Aqua Sonic~CC~20|Natural Cure
42|Mightyena|P|D|1|70|1|F|P|Poochyena|Uncommon|Bite~CC~20;Ambush~DCC~30+|
43|Silcoon|P|G|1|60|2|R||Wurmple|Uncommon|Gooey Thread~G~10|Hard Cocoon
44|Skitty|P|C|0|40|1|F|||Uncommon|Minor Errand-Running~C~;Lullaby~C~10|
45|Slakoth|P|C|0|40|1|F|||Uncommon|Claw~C~20;Slack Off~CC~|
46|Swellow|P|C|1|70|0|L|F|Taillow|Uncommon|Wing Attack~CC~30|Drive Off
47|Vigoroth|P|C|1|70|1|F||Slakoth|Uncommon|Fury Swipes~CC~20×;Rage~CCC~20+|
48|Wailmer|P|W|0|80|3|L|||Uncommon|Rest~CC~;Water Gun~WC~20+|
49|Aron|P|M|0|40|1|R|G||Common|Teary Eyes~C~;Ram~CC~20|
50|Aron|P|M|0|50|2|R|G||Common|Gnaw~C~10|
51|Carvanha|P|W|0|40|1|L|||Common|Big Bite~C~10|Rough Skin
52|Electrike|P|L|0|50|1|F|M||Common|Headbutt~C~10|
53|Electrike|P|L|0|50|1|F|M||Common|Super Thunder Wave~C~;Tackle~CC~20|
54|Koffing|P|G|0|50|1|P|||Common|Tackle~C~10;Double-edge~GC~30|
55|Goldeen|P|W|0|50|1|L|||Common|Flail~C~10×|
56|Makuhita|P|F|0|50|1|P|||Common|Slap Push~C~10;Lunge Out~CC~20|
57|Makuhita|P|F|0|50|1|P|||Common|Fling~C~;Low Kick~FC~30|
58|Makuhita|P|F|0|50|1|P|||Common|Fake Out~F~10|
59|Mudkip|P|W|0|50|1|L|||Common|Bubble~W~10|
60|Mudkip|P|W|0|50|1|L|||Common|Pound~C~10;Fury Swipes~CC~10×|
61|Numel|P|R|0|50|1|W|||Common|Headbutt~C~10;Burn Off~RC~|
62|Phanpy|P|F|0|50|1|G|||Common|Stampede~C~10;Trembler~FC~|
63|Poochyena|P|D|0|40|1|F|P||Common|Bite~C~10|
64|Poochyena|P|D|0|50|1|F|P||Common|Knock Off~D~;Rear Kick~CC~20|
65|Poochyena|P|D|0|50|1|F|P||Common|Shadow Bind~D~10|
66|Ralts|P|P|0|50|1|P|||Common|Confuse Ray~P~10|
67|Ralts|P|P|0|50|1|P|||Common|Headbutt~C~10;Hypnoblast~PC~20|
68|Ralts|P|P|0|50|1|P|||Common|Pound~C~10;Link Blast~PC~40|
69|Shroomish|P|G|0|40|1|R|W||Common|Sleep Powder~C~10|
70|Skitty|P|C|0|40|1|F|||Common|Plus Energy~C~;Scratch~C~10|
71|Skitty|P|C|0|50|1|F|||Common|Tackle~C~10;Lunge~CC~30|
72|Taillow|P|C|0|40|1|L|F||Common|Peck~C~10;Wing Attack~CC~20|
73|Torchic|P|R|0|40|1|W|||Common|Peck~C~10;Fireworks~RC~30|
74|Torchic|P|R|0|50|1|W|||Common|Singe~C~|
75|Treecko|P|G|0|40|1|R|W||Common|Poison Breath~G~|
76|Treecko|P|G|0|40|1|R|W||Common|Tail Slap~C~10;Razor Leaf~GC~20|
77|Wingull|P|W|0|40|1|L|F||Common|Surprise Attack~W~20|
78|Wurmple|P|G|0|50|1|R|||Common|Signs of Evolution~C~;Poison Barb~G~|
79|Zigzagoon|P|C|0|40|1|F|||Common|Fury Swipes~C~10×|
80|Energy Removal 2|T||||||||Uncommon||
81|Energy Restore|T||||||||Uncommon||
82|Energy Switch|T||||||||Uncommon||
83|Lady Outing|T||||||||Uncommon||
84|Lum Berry|T||||||||Uncommon||
85|Oran Berry|T||||||||Uncommon||
86|Poké Ball|T||||||||Uncommon||
87|Pokémon Reversal|T||||||||Uncommon||
88|PokéNav|T||||||||Uncommon||
89|Professor Birch|T||||||||Uncommon||
90|Energy Search|T||||||||Common||
91|Potion|T||||||||Common||
92|Switch|T||||||||Common||
93|Darkness Energy|E||||||||Rare||
94|Metal Energy|E||||||||Rare||
95|Rainbow Energy|E||||||||Rare||
96|Chansey ex|P|C|0|120|3|F|||Rare Holo EX|Healing Egg~CC~;Double-edge~CCC~80|
97|Electabuzz ex|P|L|0|90|2|F|M||Rare Holo EX|Thundershock~L~10;Quick Attack~LLC~40+|
98|Hitmonchan ex|P|F|0|90|2|P|||Rare Holo EX|Steady Punch~F~10+;Sky Uppercut~FFC~50|
99|Lapras ex|P|W|0|110|3|L|||Rare Holo EX|Energy Ball~W~10+;Confuse Ray~WWC~30|
100|Magmar ex|P|R|0|90|2|W|||Rare Holo EX|Smokescreen~R~10;Super Singe~RRC~40|
101|Mewtwo ex|P|P|0|100|3|P|||Rare Holo EX|Energy Absorption~P~;Psyburn~PPC~60|
102|Scyther ex|P|G|0|80|1|R|F||Rare Holo EX|Agility~G~10;Slash~GGC~50|
103|Sneasel ex|P|D|0|80|1|F|P||Rare Holo EX|Double Scratch~D~10×;Beat Up~DDC~20×|
104|Grass Energy|E||||||||Common||
105|Fighting Energy|E||||||||Common||
106|Water Energy|E||||||||Common||
107|Psychic Energy|E||||||||Common||
108|Fire Energy|E||||||||Common||
109|Lightning Energy|E||||||||Common||`;
const noop={type:'noop'},status=s=>({type:'status',target:'opponentActive',status:s});
const flip=(heads,tails=noop)=>({type:'coinFlip',heads,tails});
const coins=(count,amount,mode='replace')=>({type:'coinDamage',coins:count,amount,mode});
const seq=(...effects)=>({type:'sequence',effects});
const bonus=amount=>({type:'bonusDamage',amount});
const gate={type:'coinAttackGate',heads:noop};
const RULES=new Map(),NOTES=new Map();
const add=(n,i,e,note)=>{RULES.set(`${n}:${i}`,e);NOTES.set(`${n}:${i}`,note);};
const each=(keys,e,note)=>keys.split(' ').forEach(key=>{const [n,i]=key.split(':');add(n,i,e,note);});
// Plain attacks: no printed additional effect. Never infer this from printed damage alone.
const PLAIN=new Set(`1:1 6:1 11:1 14:1 16:0 19:1 23:1 25:0 27:0 32:0 34:1 36:0 36:1 40:1 42:0 46:0 49:1 50:0 52:0 53:1 54:0 56:0 56:1 57:1 60:0 61:0 62:0 63:0 64:1 67:0 68:0 70:1 71:0 72:0 72:1 73:0 76:0 76:1 97:0 101:1 102:1`.split(' '));
// Straightforward print-faithful effects using already tested battle primitives.
each('2:0 39:0 40:0 58:0 59:0 53:0',flip(status('paralysis')),'On heads, the Defending Pokémon is Paralyzed.');
each('35:0 66:0',flip(status('confusion')),'On heads, Confuse the Defending Pokémon.');
each('61:1 74:0',flip(status('burn')),'On heads, Burn the Defending Pokémon.');
add(75,0,flip(status('poison')),'On heads, Poison the Defending Pokémon.');
add(31,0,status('poison'),'Poison the Defending Pokémon.');
add(26,0,status('poison'),'Poison the Defending Pokémon.');
add(24,0,status('confusion'),'Confuse the Defending Pokémon.');
add(67,1,status('sleep'),'The Defending Pokémon is now Asleep.');
add(69,0,status('sleep'),'The Defending Pokémon is now Asleep.');
add(44,1,status('sleep'),'The Defending Pokémon is now Asleep.');
add(99,1,status('confusion'),'Confuse the Defending Pokémon.');
add(100,1,status('burn'),'Burn the Defending Pokémon.');
add(97,0,flip(status('paralysis')),'On heads, Paralyze the Defending Pokémon.');
add(98,0,flip(bonus(10)),'On heads, Steady Punch adds 10 damage.');
add(97,1,flip(bonus(20)),'On heads, Quick Attack adds 20 damage.');
add(42,1,flip(bonus(30)),'On heads, Ambush adds 30 damage.');
// Rend needs a damaged-defender modifier not covered by damageRule.
add(33,0,flip(status('paralysis')),'On heads, Paralyze the Defending Pokémon.');
add(33,1,coins(2,10,'add'),'Slap Down: 40 plus 10 per heads on two flips.');
add(37,1,coins(2,20,'add'),'One-Two Strike: 30 plus 20 per heads on two flips.');
add(1,2,coins(2,70),'Double Lariat: 70 times the heads on two flips.');
add(17,1,coins(2,60),'Double Spin: 60 times the heads on two flips.');
add(20,0,coins(2,50),'Tail Rap: 50 times the heads on two flips.');
add(25,1,coins(2,20),'Double Stab: 20 times the heads on two flips.');
add(27,1,coins(2,40),'Double Kick: 40 times the heads on two flips.');
add(47,0,coins(3,20),'Fury Swipes: 20 times the heads on three flips.');
add(60,1,coins(3,10),'Fury Swipes: 10 times the heads on three flips.');
add(79,0,coins(3,10),'Fury Swipes: 10 times the heads on three flips.');
add(103,0,coins(2,10),'Double Scratch: 10 times the heads on two flips.');
add(38,1,coins('untilTails',40),'Continuous Headbutt: flip until tails, 40 per heads.');
each('28:0 45:0 71:1 77:0',gate,'Tails: the attack does no damage or effects.');
add(30,1,flip(noop,{type:'selfDamage',amount:10}),'Thunder Jolt: on tails, Electrike takes 10 damage.');
add(9,1,flip(noop,{type:'selfDamage',amount:10}),'Thunder Jolt: on tails, Manectric takes 10 damage.');
add(54,1,{type:'selfDamage',amount:10},'Double-edge: Koffing also takes 10 damage.');
add(14,0,{type:'selfDamage',amount:20},'Take Down: Wailord takes 20 damage.');
add(96,1,{type:'selfDamage',amount:60},'Double-edge: Chansey ex also takes 60 damage.');
add(73,1,flip(noop,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,strictEnergyType:true}),'Fireworks: on tails discard one attached Fire Energy.');
add(65,0,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Shadow Bind: the defender cannot retreat next turn.');
add(51,0,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Big Bite: the defender cannot retreat next turn.');
add(43,0,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Gooey Thread: the defender cannot retreat next turn.');
add(15,0,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Clutch: the defender cannot retreat next turn.');
add(98,1,{type:'damageRule',ignoreResistance:true},'Sky Uppercut is not affected by Resistance.');
add(41,0,{type:'damageRule',ignoreResistance:true},'Aqua Sonic is not affected by Resistance.');
add(31,1,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},'Swift ignores Weakness, Resistance and all effects on the Defending Pokémon.');
// Link Blast needs an exact Energy-count comparison hook.
add(99,0,{type:'energyDamage',source:'self',extraAbove:1,maxCount:2,amount:10},'Energy Ball: +10 per extra attached Energy beyond first, maximum +20.');
add(48,1,{type:'energyDamage',source:'self',energyType:'Water',extraAbove:1,maxCount:2,amount:10},'Water Gun: +10 per Water Energy beyond cost, maximum +20.');
add(16,1,{type:'energyDamage',source:'self',energyType:'Fighting',amount:10},'Battle Blast: +10 per attached Fighting Energy.');
add(55,0,{type:'damageFromDamage',source:'self',amount:10},'Flail: 10 damage per damage counter on Goldeen.');
add(47,1,{type:'damageFromDamage',source:'self',amount:10},'Rage: 20 damage plus 10 per counter on Vigoroth.');
// Scyther ex Agility prevents damage AND effects; do not enable a partial guard.

// Reuse verified generic effects for first-generation EX-specific moves.
add(1,0,flip({type:'damageFromDamage',source:'self',amount:1}),'Retaliate: heads does damage equal to Aggron’s existing damage counters; tails zero.');
add(15,1,{type:'discardEnergyCard',target:'self',energyType:'Fire',strictEnergyType:true,amount:1},'Flamethrower: after attacking, discard an attached Fire Energy.');
add(24,1,seq(status('poison'),{type:'benchDamage',side:'opponent',all:true,amount:10}),
  'Poison Smog: Poison the defender and deal 10 damage to each opposing Benched Pokémon.');
add(34,0,flip({type:'discardEnergyCard',target:'opponentActive',amount:1}),
  'Removal Beam: on heads, discard one Energy card from the Defending Pokémon.');
add(37,0,seq({type:'benchDamage',side:'self',all:true,amount:10},
  {type:'benchDamage',side:'opponent',all:true,amount:10}),
  'Magnitude: 20 damage to the defender and 10 to each Benched Pokémon on both sides.');
add(38,0,{type:'searchChosen',source:'deck',amount:2},
  'Seek Out: choose up to two cards from your deck and put them in your hand; shuffle.');
add(45,1,seq({type:'healSelf',amount:200},
  {type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'}),
  'Slack Off: heal all damage, then Slakoth cannot attack on its next turn.');
add(48,0,seq({type:'removeStatuses',statuses:['sleep','paralysis','confusion','poison','burn']},
  {type:'healSelf',amount:40},{type:'status',target:'self',status:'sleep'}),
  'Rest: clear status, heal 40, then put Wailmer to Sleep.');
add(57,0,{type:'forceOpponentSwitch'},
  'Fling: the opponent must choose a replacement Active from their Bench.');
add(103,1,{type:'coinDamageByPokemon',amount:20},
  'Beat Up: flip one coin for each Pokémon in play on your side; 20 per heads.');

// Attacks requiring additional legal choices or timing remain gated, including
// first-EX-era attacks with double-Active wording or conditional Poké-Powers.
const TRAINEFFECTS={
 86:flip({type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon'}}),
 87:flip({type:'forceOpponentSwitch'}),
 89:{type:'drawToHandSize',size:6},
  // Energy Search requires an Energy-Zone-specific adaptation; no Basic Energy in the draw deck.
 91:{type:'heal',target:'selfPokemon',amount:20},
 92:{type:'switch',side:'self'},
};
const FIELDS=new Map(RAW.split('\n').map(line=>{const parts=line.split('|');return [Number(parts[0]),parts];}));
function parse(n){const f=FIELDS.get(n);if(!f)throw Error(`Missing EX Ruby & Sapphire card ${n}`);
 const [_,name,kind,t,stage,hp,retreat,weakness,resistance,evolvesFrom,rarity,moves,ability]=f;
 const card={id:`ex1-${n}`,setId:'ex1',number:String(n),name,source:'tcg',battleFormat:'classic',
  rarity,image:`https://images.pokemontcg.io/ex1/${n}.png`,imageLarge:`https://images.pokemontcg.io/ex1/${n}_hires.png`,
  kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy'};
 const reasons=[];
 if(kind==='P'){
  const attacks=(moves||'').split(';').filter(Boolean).map((spec,i)=>{
   const [move,cost,damagePrinted='']=spec.split('~'),key=`${n}:${i}`,plain=PLAIN.has(key),effect=RULES.get(key);
   if(!plain&&!effect)reasons.push(`Unimplemented printed attack: ${move}`);
   if(effect&&!fx.supportsEffect(effect))reasons.push(`Unsupported effect for ${move}`);
   return {name:move,cost,damage:/×/.test(damagePrinted)?0:Number((damagePrinted.match(/^\d+/)||[])[0]||0),damageText:damagePrinted||null,
    text:NOTES.get(key)||(!plain?'Printed effect pending implementation.':`Deal ${Number(damagePrinted||0)} damage.`),effect:effect|| (plain?noop:null)};
  });
  if(ability)reasons.push(`Poké-Power / Poké-Body pending: ${ability}`);
  const ex=/\sex$/.test(name);Object.assign(card,{stage:stage==='0'?'Basic':`Stage ${stage}`,evolvesFrom:evolvesFrom||null,
   hp:Number(hp),retreat:Number(retreat||0),types:[T[t]],subtype:T[t],weakness:T[weakness]||null,
   weaknessValue:weakness?'×2':null,resistance:T[resistance]||null,resistanceValue:resistance?'-30':null,
   pokemonEx:ex,isEx:ex,prizeCards:ex?2:1,attacks,abilities:[]});
 }else if(kind==='T'){
  const tool=[84,85].includes(n),supporter=[83,89].includes(n);
  Object.assign(card,{trainerType:tool?'Tool':supporter?'Supporter':'Item',effect:TRAINEFFECTS[n]||null,
    text:TRAINEFFECTS[n]?'Uses the verified legacy Classic battle action.':'Printed Trainer mechanics require verification.'});
  if(!TRAINEFFECTS[n])reasons.push(`Unimplemented Trainer: ${name}`);
 }else{
  const basics={104:'Grass',105:'Fighting',106:'Water',107:'Psychic',108:'Fire',109:'Lightning'};
  if(basics[n])Object.assign(card,{basicEnergy:true,specialEnergy:false,subtype:basics[n],types:[basics[n]],deckEligible:false,
    text:'Basic Energy is generated by the separate Classic Energy Zone rather than drawn from the 30-card deck.'});
  else{Object.assign(card,{basicEnergy:false,specialEnergy:true,types:[n===93?'Darkness':n===94?'Metal':'Colorless'],
    subtype:n===93?'Darkness':n===94?'Metal':'Rainbow',text:'Printed special Energy rules pending full battle integration.'});
    reasons.push('Special Energy effect pending implementation');}
 }
 return Object.freeze({...card,battleEnabled:reasons.length===0,deckEligible:card.deckEligible===false?false:reasons.length===0,
   support:{status:reasons.length?'PARTIAL':'FULL',reasons}});
}
const CARDS=Object.freeze(Array.from({length:109},(_,i)=>parse(i+1)));
const BY_ID=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>BY_ID.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,
 partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
