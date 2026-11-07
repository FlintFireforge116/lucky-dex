/* Aquapolis (ecard2, 2003) — 150 numbered prints, 32 distinct H holos.
 * Source for card identities, costs, attacks and rarity: PokemonTCG/pokemon-tcg-data
 * cards/en/ecard2.json. Art links are references; images are not bundled.
 * Complex effects are marked PARTIAL, never represented by no-op battle effects.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGAquapolis=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ecard2',name:'Aquapolis',series:'E-Card',releaseDate:'2003-01-15',cardCount:182});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW="1|Ampharos|P|L|2|100|2|F||Flaaffy|Rare|Thundershock~L~20;Reflect Energy~LLC~50|\n2|Arcanine|P|R|1|90|3|W||Growlithe|Rare|Fire Blow~CCC~30+|Extreme Speed\n3|Ariados|P|G|1|70||R||Spinarak|Rare|Spider Force~GC~20+|Gluey Slime\n4|Azumarill|P|W|1|70|1|L||Marill|Rare|Aqua Sonic~WCC~40|Bubble Turn\n5|Bellossom|P|G|2|90|2|R|W|Gloom|Rare|Knife Leaf~GGC~30×|Flower Supplement\n6|Blissey|P|C|1|120|2|F||Chansey|Rare|Smash Bomber~CCC~50|Happy Healing\n7|Donphan|P|F|1|80|2|G|L|Phanpy|Rare|Earthquake~F~30;Double Stab~CCC~40×|\n8|Electrode|P|L|1|70|1|F||Voltorb|Rare|Swift~LC~30|Super Dynamo\n9|Elekid|P|L|b|30|1||||Rare|Energy Kick~L~|\n10|Entei|P|R|0|70|1|W|||Rare|Burning Fang~RCC~40|Pure Body\n11|Espeon|P|P|1|80||P||Eevee|Rare|Damage Blast~PCC~30+|Energy Return\n12|Exeggutor|P|G|1|80|1|R||Exeggcute|Rare|Super Eggsplosion~C~40×;Called Shot~G~|\n13|Exeggutor|P|P|1|80|1|P||Exeggcute|Rare|Big Eggsplosion~C~20×;Lateral Eggsplosion~PCC~30+|\n14|Houndoom|P|R|1|80|1|W||Houndour|Rare|Smokescreen~C~10;Burn Up~RRC~60|\n15|Houndoom|P|D|1|70|1|F|P|Houndour|Rare|Fireworks~RC~30;Dark Impact~DCC~40|\n16|Hypno|P|P|1|80|1|P||Drowzee|Rare|Spiral Aura~PCC~30|Sleep Pendulum\n17|Jumpluff|P|G|2|70||R|W|Skiploom|Rare|Cotton Punch~G~30×|Fluff\n18|Jynx|P|P|0|60|2|P|||Rare|Meditate~PC~10+;Confuse Ray~PCC~20|\n19|Kingdra|P|W|2|120|3|L||Seadra|Rare|Rapids~WWCC~50|Water Cyclone\n20|Lanturn|P|W|1|80|1|G||Chinchou|Rare|Lightning Ball~L~20;Conduction~CCC~30+|\n21|Lanturn|P|L|1|80|1|F||Chinchou|Rare|Electric Tackle~CC~20+|Ion Coating\n22|Magneton|P|M|1|70|2|R|G|Magnemite|Rare|Steel Wave~CCC~30|Magnetic Flow\n23|Muk|P|G|1|70|1|P||Grimer|Rare|Burning Sludge~CC~10|Heavyweight\n24|Nidoking|P|F|2|110|3|G|L|Nidorino|Rare|Giant Horn~FFCC~50+|Earth Rage\n25|Ninetales|P|R|1|80|1|W||Vulpix|Rare|Miracle Tail~R~10;Roasting Heat~RCC~40+|\n26|Octillery|P|W|1|80|2|L||Remoraid|Rare|Smokescreen~WCC~40|Suction Cups\n27|Parasect|P|G|1|70|1|R||Paras|Rare|Sleep Inducer~G~;Rapture Pollen~CC~20|\n28|Porygon2|P|C|1|70|1|F||Porygon|Rare|Hypnotic Ray~CC~20|Backup\n29|Primeape|P|F|1|80|1|P||Mankey|Rare|Karate Chop~FC~40-;Sudden Charge~FCC~40|\n30|Quagsire|P|W|1|80|2|G||Wooper|Rare|Water Gun~W~20+;Slam~CCCC~50×|\n31|Rapidash|P|R|1|70||W||Ponyta|Rare|Agility~CC~10;Gallop~RCC~30+|\n32|Scizor|P|M|1|80|2|R||Scyther|Rare|Snatch~MC~20;Heavy Metal~CCC~30+|Poison Resistance\n33|Slowbro|P|W|1|80|2|L||Slowpoke|Rare|Energy Cannon~WC~30+|Dense Body\n34|Slowking|P|P|1|80|1|P||Slowpoke|Rare|Bursting Hand~C~10×;Shuffle Attack~PCC~40|\n35|Steelix|P|M|1|100|4|R|G|Onix|Rare|Earth Rift~CC~10;Iron Smash~MMCC~50+|\n36|Sudowoodo|P|F|0|60|2|W|||Rare|Copy~C~;Energy Draw~F~|\n37|Suicune|P|W|0|70|1|L|||Rare|Hypno Wave~WCC~30+|Pure Body\n38|Tentacruel|P|W|1|70||L||Tentacool|Rare|Poison Sting~WC~20|Strange Tentacles\n39|Togetic|P|C|1|60|1|L|F|Togepi|Rare|Mini-Metronome~C~|Miracle Shift\n40|Tyranitar|P|D|2|120|3|F|P|Pupitar|Rare|Destructive Roar~D~;Tail Slap~DCC~30;Gigacrush~DDCCC~60|\n41|Umbreon|P|D|1|80|1|F|P|Eevee|Rare|Shadow Bind~CCC~30|Dark Moon\n42|Victreebel|P|G|2|90|2|R||Weepinbell|Rare|Corrosive Acid~GGC~40|Fragrance Trap\n43|Vileplume|P|G|2|100|2|R||Gloom|Rare|Poison Scent~G~;Addictive Pollen~CCC~40|\n44|Zapdos|P|L|0|80|2|L|F||Rare|Plasma~C~10;Lightning Storm~LLCC~60|Anti-Lightning\n45|Bellsprout|P|G|0|50|1|R|||Uncommon|Blot~GC~20|\n46|Dodrio|P|C|1|70|1|L|F|Doduo|Uncommon|Tri Attack~C~10×;Peck Attack~CC~|\n47|Flaaffy|P|L|1|80|1|F||Mareep|Uncommon|Thundershock~C~10;Spark~LLC~30|\n48|Furret|P|C|1|70|1|F||Sentret|Uncommon|Spinning Attack~CC~30|Scavenger Hunt\n49|Gloom|P|G|1|70|2|R||Oddish|Uncommon|Sleep Sap~CC~20|Enervating Pollen\n50|Golduck|P|W|1|70|1|L||Psyduck|Uncommon|Slash~CC~20;Distortion Beam~PCC~30|\n51|Growlithe|P|R|0|60|1|W|||Uncommon|Ember~RC~30|\n52|Magnemite|P|M|0|40|1|R|G||Uncommon|Attract~M~;Tackle~CC~20|\n53|Marill|P|W|0|50|1|L|||Uncommon|Headbutt~C~10;Sleepy Ball~WC~10|\n54|Marowak|P|F|1|70|1|G|L|Cubone|Uncommon|Triple Bone~CC~;Bone Rush~FCC~50×|\n55|Nidorino|P|G|1|70|1|P||Nidoran ♂|Uncommon|Poison Horn~G~10;Take Down~CCC~40|\n56|Pupitar|P|F|1|80|1|W||Larvitar|Uncommon|Thrash~CCC~30+|\n57|Scyther|P|G|0|60|1|R|||Uncommon|Quick Turn~G~10×;Cross-Cut~CCC~20+|\n58|Seadra|P|W|1|70|1|L||Horsea|Uncommon|Wave Splash~W~20;Water Bullet~CCC~30+|\n59|Seaking|P|W|1|70|1|L||Goldeen|Uncommon|Flail~CC~10×;Undulate~WCC~30|\n60|Skiploom|P|G|1|60|1|R|W|Hoppip|Uncommon|Break Powder~C~10+|Lightweight\n61|Smoochum|P|P|b|30|1||||Uncommon|Energy Kiss~P~10×|\n62|Spinarak|P|G|0|50|1|R|||Uncommon|Gnaw~C~10;Gooey Thread~GC~20|\n63|Tyrogue|P|F|b|30|1||||Uncommon|Energy Punch~F~10|\n64|Voltorb|P|L|0|50|1|F|||Uncommon|Rollout~C~10;Thundershock~LC~20|\n65|Weepinbell|P|G|1|70|1|R||Bellsprout|Uncommon|Growth~C~;Double Razor Leaf~GC~30×|\n66|Wooper|P|W|0|50|1|G|||Uncommon|Tail Whap~C~10;Deep Dive~W~|\n67|Aipom|P|C|0|50|1|F|||Common|Stretch Tail~C~;Skedaddle~CC~20|\n68|Bellsprout|P|G|0|40|1|P|||Common|Poison Vine~C~;Sharp Leaf~G~10+|\n69|Chansey|P|C|0|100|2|F|||Common|Rollout~C~10;Double-edge~CCC~40|\n70|Chinchou|P|W|0|50|1|G|||Common|Float~C~;Headbutt~CC~20|\n71|Chinchou|P|L|0|50|1|F|||Common|Jolt~C~;Confuse Ray~LC~10|\n72|Cubone|P|F|0|40|1|G|L||Common|Teary Eyes~C~;Tackle~F~10|\n73|Doduo|P|C|0|40|1|L|F||Common|Super Speed~C~;Rear Kick~CC~20|\n74|Drowzee|P|P|0|50|1|P|||Common|Sleep Inducer~P~;Tackle~CC~20|\n75|Eevee|P|C|0|50|1|F|||Common|Charge Up~C~;Lunge~C~20|\n76|Exeggcute|P|G|0|40|1|R|||Common|Growth Spurt~C~;Sleep Powder~G~10|\n77|Exeggcute|P|P|0|50|1|P|||Common|Continuous Eggsplosion~C~10×;Energy Support~P~|\n78|Goldeen|P|W|0|40|1|L|||Common|Knock Away~C~10+|\n79|Grimer|P|G|0|50|1|P|||Common|Poison Sludge~C~|\n80|Growlithe|P|R|0|50|1|W|||Common|Roar~C~;Firebreathing~R~10+|\n81|Hitmonchan|P|F|0|60|2|P|||Common|Rush~FC~10×;Smash Punch~CCC~50|\n82|Hitmontop|P|F|0|60|1|P|||Common|Double Kick~CC~20×;Triple Spin~FCC~20×|\n83|Hoppip|P|G|0|40|1|R|W||Common|Careless Tackle~C~20|Lightweight\n84|Horsea|P|W|0|40|1|L|||Common|Bubble~W~10|\n85|Horsea|P|W|0|50|1|L|||Common|Reverse Thrust~CC~20|\n86|Houndour|P|R|0|50|1|W|||Common|Singe~C~;Flare~RC~20|\n87|Houndour|P|D|0|50|1|F|P||Common|Feint Attack~DC~|\n88|Kangaskhan|P|C|0|70|2|F|||Common|Baby Outing~CC~;Mega Punch~CCC~30|\n89|Larvitar|P|F|0|40|1|W|||Common|Mountain Eater~C~;Rising Lunge~F~10+|\n90|Lickitung|P|C|0|80|2|F|||Common|Long Tongue~CC~;Body Slam~CCC~20|\n91|Magnemite|P|L|0|50|1|F|||Common|Magnetic Bomb~LC~20+|Conductive Body\n92|Mankey|P|F|0|40|1|P|||Common|Mug~F~10;Rage~CC~10+|\n93|Mareep|P|L|0|40|1|F|||Common|Charge~C~;Tail Slap~LC~20|\n94|Miltank|P|C|0|60|1|F|||Common|Tackle~CC~20;Continuous Tumble~CC~20×|\n95|Mr. Mime|P|P|0|50|1|P|||Common|Mind Shock~PC~20|Energy Barrier\n96|Nidoran ♂|P|G|0|50|1|P|||Common|Poison Horn~G~;Scratch~CC~20|\n97|Oddish|P|G|0|50|1|R|||Common|Stun Spore~G~;Ram~CC~20|\n98|Onix|P|F|0|60|2|W|||Common|Crush~FC~20×|\n99|Paras|P|G|0|50|1|R|||Common|Spore~C~;Spore Evolution~GC~|\n100|Phanpy|P|F|0|40|1|G|L||Common|Flail~C~10×;Rollout~FC~20|\n101|Pinsir|P|G|0|60|1|R|||Common|Horn Grab~CC~20;Super Slice~GGC~90|\n102|Ponyta|P|R|0|40|1|W|||Common|Tackle~C~10;Ember~RC~30|\n103|Porygon|P|C|0|40|1|F|||Common|Data Sort~C~;Peck~C~10|\n104|Psyduck|P|W|0|50|1|L|||Common|Headbutt~C~10;Scratch~CC~20|\n105|Remoraid|P|W|0|50|1|L|||Common|Splatter~W~|\n106|Scyther|P|G|0|50|1|L|F||Common|Slash~C~10;Swift~GC~20|\n107|Sentret|P|C|0|50|1|F|||Common|Spy~C~;Double Scratch~C~10×|\n108|Slowpoke|P|W|0|50|1|L|||Common|Fishing Tail~C~;Bite~CC~20|\n109|Smeargle|P|C|0|60|1|F|||Common|Paint Trick~C~;Doublslap~CC~20×|\n110|Sneasel|P|D|0|60|1|F|P||Common|Rob~D~;Claw~CC~30|\n111|Spinarak|P|G|0|40|1|P|||Common|Sharp Stinger~G~|\n112|Tangela|P|G|0|60|2|R|W||Common|Tickling Vines~CC~10;Double Kick~GCC~30×|\n113|Tentacool|P|W|0|50|1|L|||Common|Poison Sting~C~;Recover~W~|\n114|Togepi|P|C|0|40|1|F|||Common|Minor Errand-Running~C~;Pound~C~10|\n115|Voltorb|P|L|0|40|1|F|||Common|Swift~L~20|\n116|Vulpix|P|R|0|50|1|W|||Common|Collect Fire~R~10|\n117|Wooper|P|W|0|40|1|L|||Common|Bubble~W~10;Wave Splash~WC~20|\n118|Apricorn Forest|T||||||||Rare||\n119|Darkness Cube 01|T||||||||Uncommon|Plunder~D~10|\n120|Energy Switch|T||||||||Uncommon||\n121|Fighting Cube 01|T||||||||Uncommon|Violent Rage~F~10×|\n122|Fire Cube 01|T||||||||Uncommon|Singe~R~|\n123|Forest Guardian|T||||||||Uncommon||\n124|Grass Cube 01|T||||||||Uncommon|Sleep Poison~G~|\n125|Healing Berry|T||||||||Uncommon||\n126|Juggler|T||||||||Uncommon||\n127|Lightning Cube 01|T||||||||Uncommon|Discharge~L~40×|\n128|Memory Berry|T||||||||Uncommon||\n129|Metal Cube 01|T||||||||Uncommon|Metal Reversal~M~10|\n130|Pokémon Fan Club|T||||||||Uncommon||\n131|Pokémon Park|T||||||||Uncommon||\n132|Psychic Cube 01|T||||||||Uncommon|Psy Confuse~P~|\n133|Seer|T||||||||Uncommon||\n134|Super Energy Removal 2|T||||||||Uncommon||\n135|Time Shard|T||||||||Uncommon||\n136|Town Volunteers|T||||||||Uncommon||\n137|Traveling Salesman|T||||||||Uncommon||\n138|Undersea Ruins|T||||||||Uncommon||\n139|Power Plant|T||||||||Uncommon||\n140|Water Cube 01|T||||||||Uncommon|Splatter~W~|\n141|Weakness Guard|T||||||||Uncommon||\n142|Darkness Energy|E||||||||Rare||\n143|Metal Energy|E||||||||Rare||\n144|Rainbow Energy|E||||||||Rare||\n145|Boost Energy|E||||||||Uncommon||\n146|Crystal Energy|E||||||||Uncommon||\n147|Warp Energy|E||||||||Uncommon||\n148|Kingdra|P|C|2|110|3|L||Seadra|Rare Secret|Aquabomb~WWL~40;Dual Burn~PPLC~60|Crystal Type\n149|Lugia|P|C|0|80|3|P|||Rare Secret|Psychic~PR~10×;Steam Blast~WWRC~50|Crystal Type\n150|Nidoking|P|C|2|100|3|G||Nidorino|Rare Secret|Poison Horn~GGC~20;Rolling Thunder~LLFF~50|Crystal Type\nH1|1\nH2|2\nH3|3\nH4|4\nH5|5\nH6|6\nH7|8\nH8|10\nH9|11\nH10|12\nH11|15\nH12|16\nH13|17\nH14|19\nH15|21\nH16|22\nH17|23\nH18|24\nH19|25\nH20|26\nH21|32\nH22|34\nH23|35\nH24|36\nH25|37\nH26|38\nH27|39\nH28|40\nH29|41\nH30|42\nH31|43\nH32|44";
const noop={type:'noop'},par=status=>({type:'status',target:'opponentActive',status}),fl=(heads,tails=noop)=>({type:'coinFlip',heads,tails});
const coinDamage=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'});
const bonus=amount=>({type:'bonusDamage',amount});
const recoil=amount=>({type:'selfDamage',amount});
const heal=amount=>({type:'healSelf',amount});
const seq=(...effects)=>({type:'sequence',effects});
const gate={type:'coinAttackGate',heads:noop};
// Every item listed here has additional printed instructions. Unless an exact
// supported rule is supplied below, the card is view-only in combat.
const SPECIAL=`
1:01 2:0 3:0 4:0 5:0 6:0 7:01 8:0 9:0 10:0 11:0 12:01 13:01 14:01 15:01 16:0 17:0 18:01 19:0 20:1 21:0 22:0 23:0 24:0 25:01 26:0 27:01 28:0 29:01 30:01 31:01 32:01 33:0 34:01 35:01 36:01 37:0 38:0 39:0 40:02 41:0 42:0 43:01 44:01
45:0 46:01 47:01 49:0 50:1 51:0 52:0 53:1 54:01 55:01 56:0 57:01 58:1 59:01 60:0 61:0 62:1 63:0 64:1 65:01 66:1 67:01 68:01 69:1 70:0
71:01 72:0 73:0 74:0 75:01 76:01 77:01 78:0 79:0 80:01 81:01 82:01 83:0 84:0 85:0 86:0 87:0 88:0 89:01 90:01 91:0 92:01 93:0 94:1 95:0 96:0 97:0 98:0 99:01 100:0 101:01 102:1 103:0 105:0 106:1 107:01 108:0 109:01 110:01 111:0 112:01 113:01 114:0 115:0 116:0 117:0 148:01 149:01 150:01
`.trim().split(/\s+/).flatMap(chunk=>{const [id,indices]=chunk.split(':');return [...indices].map(i=>id+':'+i)});
const needsRule=new Set(SPECIAL);
const rules=Object.create(null),notes=Object.create(null),powers=Object.create(null),trainers=Object.create(null);
function attack(n,i,effect,text){rules[n+':'+i]=effect;notes[n+':'+i]=text;}
function group(group,effect,description){for(const key of group.trim().split(/\s+/))if(key) {rules[key]=effect;notes[key]=description;}}
group('1:0 47:0 64:1 71:0 84:0 90:1 97:0 117:0',fl(par('paralysis')),'Flip heads to Paralyze the Defending Pokémon.');
group('28:0 53:1 76:1 99:0',par('sleep'),'Put the Defending Pokémon Asleep.');
group('86:0',fl(par('burn')),'Flip heads to Burn the Defending Pokémon.');
group('122:0',par('burn'),'Burn the Defending Pokémon.');
group('38:0 55:0 68:0 79:0 96:0 113:0',fl(par('poison')),'Flip heads to Poison the Defending Pokémon.');
group('71:1',fl(par('confusion')),'Flip heads to Confuse the Defending Pokémon.');
attack(50,1,fl(par('sleep'),par('confusion')),'Flip heads: Sleep; tails: Confuse.');
attack(111,0,fl(par('poison'),par('paralysis')),'Flip heads: Poison; tails: Paralyze.');
attack(37,0,fl(bonus(20),par('sleep')),'Heads: +20 damage; tails: Sleep the Defending Pokémon.');
attack(60,0,fl(bonus(20),par('sleep')),'Heads: +20 damage; tails: Sleep the Defending Pokémon.');
attack(3,0,fl(bonus(10),par('paralysis')),'Heads: 10 more damage; tails: Paralyze the Defending Pokémon.');
attack(25,1,{type:'statusDamage',status:'burn',amount:20},'Deal 20 more damage if the defender is Burned.');
attack(43,0,fl(seq(par('poison'),par('confusion')),seq(par('poison'),par('sleep'))),'Heads: Poison and Confuse; tails: Poison and Sleep.');
attack(53,1,par('sleep'),'Put the Defending Pokémon Asleep.');
attack(62,1,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Prevent the Defending Pokémon retreating next turn.');
attack(41,0,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Prevent retreat next turn.');
attack(4,0,{type:'damageRule',ignoreResistance:true},'Ignore Resistance.');
attack(95,0,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true},'Ignore Weakness and Resistance.');
// This Swift also ignores Poké-Powers/Bodies, so a W/R-only approximation is not battle-safe.
// This Swift ignores all protection; W/R-only is insufficient.
attack(14,0,{type:'attackCoinGate',duration:'opponentTurn'},'The defender must flip heads to attack next turn.');
attack(26,0,{type:'attackCoinGate',duration:'opponentTurn'},'The defender must flip heads to attack next turn.');
attack(6,0,gate,'Flip tails: this attack does nothing.');
attack(75,1,gate,'Flip tails: this attack does nothing.');
attack(81,1,gate,'Flip tails: this attack does nothing.');
attack(101,1,{type:'allHeadsBonus',coins:2,amount:90},'Both heads: deal 90 damage; otherwise deal none.');
attack(110,1,gate,'Flip tails: this attack does nothing.');
attack(51,0,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true,strictEnergyType:true},'Discard a Fire Energy attached to Growlithe.');
attack(102,1,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true,strictEnergyType:true},'Discard one attached Fire Energy.');
attack(69,1,recoil(40),'Chansey does 40 damage to itself.');
attack(7,0,{type:'benchDamage',side:'self',amount:10,all:true},'10 damage to each own Benched Pokémon.');
attack(83,0,recoil(10),'Hoppip takes 10 recoil damage.');
attack(55,1,recoil(10),'Nidorino takes 10 recoil damage.');
attack(45,0,{type:'drain',amount:10},'Heal one damage counter from Bellsprout.');
attack(88,0,{type:'selectTopToHand',count:3,amount:1},'Look at top three deck cards, take one, shuffle others back.');
attack(85,0,{type:'switch',side:'self'},'After the attack, switch Horsea with the Bench.');
attack(80,0,{type:'switch',side:'opponent'},'The opponent switches their Active Pokémon.');
// Tyrogue requires selecting only Special Energy, which is not yet supported.
attack(94,1,coinDamage('untilTails',20),'Flip until tails; 20 damage for each heads.');
attack(54,1,coinDamage('untilTails',50),'Flip until tails; 50 damage for each heads.');
attack(77,0,coinDamage('untilTails',10),'Flip until tails; 10 damage per heads.');
for(const [n,i,coins,amount] of [[5,0,3,30],[7,1,2,40],[17,0,2,30],[30,1,2,50],[46,0,3,10],[57,0,2,10],[65,1,2,30],[82,0,2,20],[94,1,0,0],[98,0,2,20],[109,1,2,20],[112,1,2,30]])if(coins)attack(n,i,coinDamage(coins,amount),`Flip ${coins} coins; ${amount} damage for each heads.`);
attack(48,0,noop,'Deal 30 printed damage.');
attack(64,1,fl(par('paralysis')),'Flip heads to Paralyze.');
attack(71,0,fl(par('paralysis')),'Flip heads to Paralyze.');
attack(73,0,fl({type:'preventDamage',duration:'opponentTurn'}),'Flip heads: protect Doduo during the opponent turn.');
attack(72,0,{type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn',scope:'self'},'Reduce damage to Cubone by 20 during the opponent turn.');
attack(93,0,{type:'attachEnergyFromDiscard',energyType:'Lightning',amount:1},'Attach a Lightning Energy from discard to Mareep.');
attack(56,0,fl(bonus(10),recoil(10)),'Heads: 10 bonus damage; tails: 10 self damage.');
attack(78,0,fl(bonus(10)),'Heads: 10 bonus damage.');
attack(89,1,fl(bonus(10)),'Heads: 10 bonus damage.');
attack(68,1,fl(bonus(10)),'Heads: 10 bonus damage.');
attack(91,0,fl(bonus(10),recoil(10)),'Heads +10; tails take 10 damage.');
attack(18,1,fl(par('confusion')),'Heads: Confuse the defender.');
attack(29,1,seq(recoil(10),{type:'switch',side:'opponent'}),'10 recoil damage; opponent switches Active.');
attack(84,0,fl(par('paralysis')),'Heads: Paralyze.');
attack(97,0,fl(par('paralysis')),'Heads: Paralyze.');
attack(116,0,fl({type:'attachEnergyFromDiscard',energyType:'Fire',amount:1}),'Heads: attach a Fire Energy from discard.');
attack(113,1,seq({type:'discardEnergyCard',target:'self',energyType:'Water',amount:1,useCost:true,strictEnergyType:true},{type:'healSelf',amount:999}),'Discard one Water Energy to heal all damage.');
attack(70,0,fl({type:'preventDamage',duration:'opponentTurn'}),'Heads: prevent attack damage next turn.');
attack(59,1,fl({type:'preventDamage',duration:'opponentTurn'}),'Heads: prevent attack damage next turn.');
attack(31,0,fl({type:'preventDamage',duration:'opponentTurn'}),'Heads: prevent attack damage next turn.');
attack(104,1,noop,'20 damage.');
attack(69,1,recoil(40),'40 self damage.');
attack(112,0,fl({type:'lock',target:'opponentActive',action:'attack',duration:'opponentTurn'}),'Heads: defender cannot attack next turn.');
attack(121,0,coinDamage('untilTails',10),'Flip until tails; 10 damage per heads.');
// Additional individually checked Aquapolis effects and accurate damage formulae.
attack(1,1,{type:'moveEnergy',source:'self',target:'selfBench',amount:1},'Move one attached basic Energy from Ampharos to your Bench.');
attack(14,1,fl(noop,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:'all',strictEnergyType:true}),'Tails: discard all Fire Energy from Houndoom.');
attack(18,0,{type:'damageFromDamage',source:'opponent',amount:1},'10 more damage per counter on the opponent Active Pokémon.');
attack(18,1,fl(par('confusion')),'Heads: Confuse the Defending Pokémon.');
attack(30,0,{type:'energyDamage',source:'self',energyType:'Water',extraAbove:1,maxCount:2,amount:10},'10 more damage for each unused Water Energy, maximum 20.');
attack(30,1,coinDamage(2,50),'Flip two coins: 50 damage per heads.');
attack(56,0,fl(bonus(10),recoil(10)),'Heads: 10 extra damage; tails: 10 self-damage.');
attack(58,1,{type:'coinDamageByEnergy',amount:10,energyType:'Water',countAttachedEnergyType:true},'Flip once per attached Water Energy card, including matching Special Energy: 10 bonus damage per heads.');
attack(59,0,{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},'10 damage for each counter on Seaking.');
attack(72,0,{type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn',scope:'self'},'Prevent 20 attack damage to Cubone next turn.');
attack(73,0,fl({type:'preventDamage',duration:'opponentTurn'}),'Heads: prevent attack effects and damage during the opponent turn.');
attack(74,0,fl(seq({type:'forceOpponentSwitch'},par('sleep'))),'Heads: switch the opponent Pokémon and put the new Active Pokémon Asleep.');
attack(80,1,fl(bonus(10)),'Heads: deal 10 bonus damage.');
attack(81,0,seq(coinDamage(5,10),{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'}),'Flip 5 coins for 10 damage each; Hitmonchan cannot attack next turn.');
attack(89,0,seq({type:'discardTop',side:'opponent',amount:1},{type:'healSelf',amount:10}),'Opponent discards the top deck card; heal 10 from Larvitar.');
attack(89,1,fl(bonus(10)),'Heads: 10 bonus damage.');
attack(98,0,{type:'coinDamageByEnergy',amount:20,mode:'replace',countCards:true},'Flip once per attached Energy card, including Special Energy: 20 damage per heads.');
attack(100,0,{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},'10 damage per damage counter on Phanpy.');
attack(101,0,{type:'coinAttackGate',heads:par('paralysis')},'Heads: deal 20 and Paralyze; tails: no damage.');
attack(105,0,{type:'selectedDamage',target:'opponentPokemon',amount:10,ignoreWeakness:true,ignoreResistance:true},'10 damage to any opposing Pokémon, ignoring Weakness/Resistance.');
attack(107,0,{type:'inspectTop',count:3,deckSide:'opponent'},'Inspect the top three cards of the opposing deck without changing order.');
attack(107,1,coinDamage(2,10),'Flip two coins, 10 damage per heads.');
attack(109,0,fl(seq(par('confusion'),{type:'switch',side:'self'}),{type:'switch',side:'self'}),'Heads: Confuse the opponent; switch Smeargle with your Bench.');
attack(109,1,coinDamage(2,20),'Flip two coins, 20 damage per heads.');
attack(112,1,coinDamage(2,30),'Flip two coins, 30 damage per heads.');
// A zero printed base is essential for the both-heads-only Super Slice.
// Additional supported attacks with printed conditional damage and targeting.
attack(24,0,fl(bonus(30)),'Flip heads for 30 additional damage.');
attack(29,0,{type:'selfDamagePenalty',amount:1},'Reduce 40 printed damage by 10 per damage counter on Primeape.');
attack(40,0,fl({type:'discardEnergyCard',target:'opponentPokemon',amount:1}),'Heads: discard one Energy attached to an opposing Pokémon.');
attack(40,2,seq({type:'discardTop',side:'self',amount:3},{type:'discardTop',side:'opponent',amount:3}),'Discard the top three cards of both players decks.');
attack(43,1,fl({type:'actionLock',side:'opponent',cardType:'Supporter',duration:'opponentTurn'}),'Heads: opponent cannot play Supporters next turn.');
attack(47,1,{type:'benchDamage',side:'opponent',amount:10},'10 damage to one opposing Benched Pokémon, plus printed Active damage.');
attack(52,0,{type:'forceOpponentSwitch'},'Force an opposing Benched Pokémon into the Active Spot.');
attack(66,1,{type:'coinRepeatEffect',coins:3,effect:{type:'healSelf',amount:10}},'Flip three coins. Remove 10 damage for each heads.');
attack(90,0,{type:'selectedDamage',target:'opponentPokemon',amount:10,ignoreWeakness:true,ignoreResistance:true},'10 damage to a chosen opposing Pokémon. Ignore Weakness/Resistance.');
trainers[123]={kind:'supporter',effect:{type:'selectTopToHand',count:7,amount:1},text:'Shuffle your deck. Look at the top seven cards, add one of them to your hand, and shuffle the rest.'};
// Clear, well-understood Poké-Powers and Poké-Bodies. The rest retain a
// detailed support flag instead of inventing approximations.
powers[16]={name:'Sleep Pendulum',type:'activated',activeOnly:true,oncePerTurn:true,disabledByStatus:true,expeditionSpecialCondition:true,effect:par('sleep'),text:'While Hypno is Active, make the opposing Active Pokémon Asleep once per turn.'};
powers[28]={name:'Backup',type:'activated',oncePerTurn:true,disabledByStatus:true,expeditionSpecialCondition:true,effect:{type:'drawToHandSize',size:3},text:'If your hand has two or fewer cards, draw until you have three.'};
powers[32]={name:'Poison Resistance',type:'passive',effect:{type:'preventStatus',status:'poison',duration:'whileInPlay',scope:'self'},text:'Scizor cannot be Poisoned.'};
powers[24]={name:'Earth Rage',type:'activated',activeOnly:true,oncePerTurn:true,disabledByStatus:true,expeditionSpecialCondition:true,effect:fl({type:'benchDamage',side:'opponent',amount:10,all:true}),text:'Heads: one damage counter on each opposing Benched Pokémon.'};
trainers[142]={kind:'energy',effect:{type:'specialEnergy',provides:{Darkness:1}},text:'Provides Darkness; +10 attack damage. Non-Dark Pokémon take 10 between turns.'};
trainers[143]={kind:'energy',effect:{type:'specialEnergy',provides:{Metal:1}},text:'Provides Metal; reduces incoming attack damage by 10.'};
// Aquapolis completion pass v0.69.145. All abilities below have either a
// verified generic engine effect or a dedicated core/neoRule implementation.
const aq=(rule,extra={})=>({type:'neoRule',rule:'aquapolis:'+rule,...extra});
const activated=(name,effect,opts={})=>({name,type:'activated',oncePerTurn:true,disabledByStatus:true,...opts,effect});
const passive=(name,effect,opts={})=>({name,type:'passive',...opts,effect});
const allDamageIgnores={type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true};
// Only attacks with exact implemented conditions are exposed; no name-only stubs.
attack(8,0,allDamageIgnores,'Swift ignores Weakness, Resistance, Powers, Bodies and other protection.');
attack(16,0,aq('spiralAura'),'After damage, if the defender survives, optionally switch it with an opponent Benched Pokémon.');
attack(21,0,seq({type:'energyDamage',source:'self',energyType:'Lightning',amount:10},aq('electricTackleRecoil')),'+10 per attached Lightning Energy; tails: 10 recoil per Lightning Energy.');
attack(25,0,fl({type:'chooseOption',options:['Asleep','Burned','Confused','Paralyzed','Poisoned'].map((label,i)=>({label,effect:par(['sleep','burn','confusion','paralysis','poison'][i])}))}),'Heads: choose a Special Condition to inflict.');
attack(27,0,seq({type:'forceOpponentSwitch'},par('sleep')),'Choose an opposing Benched Pokémon to make Active and Asleep.');
attack(27,1,fl(par('sleep'),{type:'healSelf',amount:20}),'Heads: Sleep; tails: heal 20.');
attack(31,1,fl(seq(bonus(20),{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1}),noop),'Heads: +20 and discard a Fire Energy; tails: 30 damage only.');
attack(33,0,{type:'energyDamage',source:'self',amount:10,extraAbove:2,maxCount:2},'10 more damage per unused attached Energy, max +20.');
attack(34,0,{type:'filteredHandCountDamage',side:'opponent',filter:{kind:'energy'},amount:10,mode:'replace'},'10 damage per Energy card in your opponent’s hand.');
attack(35,0,seq({type:'benchDamage',side:'opponent',all:true,amount:10},fl(noop,{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'})),'10 to each opposing Bench; tails: cannot use Earth Rift next turn.');
attack(35,1,{type:'coinTierBonus',coins:2,tiers:{0:-50,1:0,2:20}},'Both heads: 70; one head: 50; both tails: 0.');
attack(36,0,{type:'copyAttack',source:'opponentActive',requiresCopiedCost:true},'Copy an opposing Active attack only if its Energy cost can be paid.');
attack(36,1,aq('energyDraw',{basicOnly:true}),'Search deck for a basic Energy and attach to Sudowoodo.');
attack(46,1,aq('peckAttack'),'Two coins: both tails Confuse, one head 20, both heads 50.');
attack(57,1,{type:'bonusDamage',amount:20,condition:{type:'opponentMatches',filter:{evolved:true}}},'40 against an Evolved Pokémon, otherwise 20.');
attack(61,0,aq('energyKiss'),'Flip one coin for each Energy card on the defender; 10 damage per heads.');
attack(65,0,aq('grassGrowth'),'Attach up to two Grass Energy cards from hand to Weepinbell.');
attack(67,0,fl({type:'selectedDamage',target:'opponentBench',amount:10,ignoreWeakness:true,ignoreResistance:true}), 'Heads: choose an opposing Benched Pokémon for 10 damage.');
attack(67,1,aq('skedaddle'),'If Bench exists, return Aipom and its basic Energy to hand.');
attack(75,0,fl(aq('energyDraw')),'Heads: search deck for an Energy card and attach it to Eevee.');
attack(76,0,aq('growthFromHand'),'Attach one Energy from hand to Exeggcute.');
attack(77,1,fl(aq('energySupport')),'Heads: search a Psychic Energy from deck and attach to Bench.');
attack(82,1,aq('tripleSpin'),'Three coins: 20 per heads, switch Hitmontop if two or more heads.');
attack(87,0,seq({type:'selectedDamage',target:'opponentPokemon',amount:20,ignoreWeakness:true,ignoreResistance:true},allDamageIgnores),'20 damage to any opponent Pokémon ignoring all defensive effects.');
attack(92,0,{type:'discardTool',target:'opponentActive',amount:'all'},'Before damage, discard all Tools and Technical Machines from defending Pokémon.');
attack(92,1,{type:'damageFromDamage',source:'self',amount:1},'+10 for each damage counter on Mankey.');
attack(99,1,{type:'evolveFromDeck'},'Search for a Pokémon that evolves from Paras; evolve immediately.');
attack(103,0,fl(aq('dataSort')),'Heads: choose a Trainer from discard and shuffle it into your deck.');
attack(106,1,allDamageIgnores,'Swift ignores Weakness, Resistance, Powers, Bodies and other effects.');
attack(108,0,aq('fishingTail'),'Choose a Baby, Basic, Evolution or basic Energy from discard to hand.');
attack(110,0,{type:'shuffleHandMatching',side:'opponent',filter:{trainerType:'Tool'}},'Shuffle opposing Tools and Technical Machines from hand into their deck.');
attack(114,0,aq('minorErrand'),'Flip two coins; choose that many basic Energy from deck to hand.');
attack(115,0,allDamageIgnores,'Swift ignores Weakness, Resistance, Powers, Bodies and other effects.');
// Pokémon Powers and Bodies, including holo and normal prints automatically.
powers[2]=passive('Extreme Speed',{type:'modifier',stat:'retreatCost',amount:-1,perEnergyCards:true,duration:'whileInPlay',scope:'self'});
powers[3]=passive('Gluey Slime',aq('glueySlimePassive'));
powers[4]=activated('Bubble Turn',fl({type:'returnToHand',target:'self',returnBasicEnergy:true}));
powers[8]=activated('Super Dynamo',fl({type:'chooseTarget',target:'selfPokemon',effect:{type:'attachEnergyFromDiscard',target:'selfPokemon',energyType:'Lightning',amount:1}}));
powers[19]=activated('Water Cyclone',{type:'moveEnergy',source:'selfActive',target:'selfBench',energyType:'Water',amount:1}, {oncePerTurn:false});
powers[26]=passive('Suction Cups',aq('suctionCupsPassive'),{activeOnly:true});
powers[33]=passive('Dense Body',aq('denseBodyPassive'));
powers[42]=activated('Fragrance Trap',fl({type:'forceOpponentSwitch'}));
powers[60]=passive('Lightweight',{type:'modifier',stat:'retreatCost',amount:-1,perEnergyCards:true,energyType:'Grass',duration:'whileInPlay',scope:'self'});
powers[83]=powers[60];
powers[91]=passive('Conductive Body',aq('conductiveBodyPassive'));
powers[95]=passive('Energy Barrier',aq('energyBarrierPassive'));
// Items and Supporters use normal effect selection instead of bypassing the hand/deck rules.
trainers[120]={kind:'item',effect:aq('energySwitch'),text:'Move one attached basic Energy between two of your Pokémon.'};
trainers[126]={kind:'supporter',effect:aq('juggler'),text:'Discard up to two Basic Energy from hand; draw 3 for one or 5 for two.'};
trainers[130]={kind:'supporter',effect:aq('fanClub'),text:'Search the deck for up to two Basic or Baby Pokémon and put them onto your Bench.'};
trainers[133]={kind:'supporter',effect:aq('seer'),text:'Reveal top six deck cards, take all Basic Energy, shuffle the rest.'};
trainers[137]={kind:'supporter',effect:{type:'searchChosen',source:'deck',amount:2,filter:{trainerType:'Tool'}},text:'Search deck for up to two Pokémon Tools / Technical Machines.'};
// Further Aquapolis exact attacks and Powers, including target and coin outcomes.
attack(11,0,aq('damageBlast'),'Flip one coin for each damage counter on the opponent; 30 plus 10 for each head.');
attack(13,0,aq('bigEggsplosion'),'Flip per attached Energy; 20 per heads.');
attack(13,1,aq('lateralEggsplosion'),'Flip for every Energy attached to your Benched Pokémon; 30 plus 10 per heads.');
attack(19,0,fl({type:'discardEnergyCard',target:'opponentActive',amount:1}),'Heads: discard an Energy from defending Pokémon.');
attack(20,1,aq('conduction'),'Discard all attached Lightning Energy; flip per discarded Energy for 40 bonus damage.');
attack(34,1,aq('shuffleAttack'),'Rearrange top opposing deck cards equal to Energy cards attached to the defender.');
attack(39,0,fl({type:'copyAttack',source:'opponentActive',ignoreUseCosts:false}),'Heads: copy one attack from opponent Active without paying its Energy cost, but honour other use costs.');
attack(42,0,fl(par('burn')),'Heads: Burn the defending Pokémon.');
attack(44,0,aq('plasma'),'Heads: attach a discarded Lightning Energy to Zapdos.');
attack(44,1,fl(noop,{type:'selfDamage',amount:20}),'Tails: place two damage counters on Zapdos.');
attack(49,0,seq(par('sleep'),{type:'status',target:'selfActive',status:'sleep'}),'Both Active Pokémon fall Asleep.');
attack(54,0,aq('tripleBone'),'Choose an opposing Benched Pokémon and flip three coins, 10 damage per heads.');
attack(63,0,aq('specialEnergyPunch'),'Heads: 10 damage and discard a Special Energy on the defender; tails: attack fails.');
powers[5]=activated('Flower Supplement',aq('flowerSupplement'));
powers[49]=passive('Enervating Pollen',aq('enervatingPollenPassive'));
// Temporary Technical Machine attacks are granted by the shared battle core.
// Fire/Grass/Psychic Cube effects require no custom attack interpretation.
trainers[121]={kind:'tool',effect:noop,attacks:[{name:'Violent Rage',cost:'F',damage:0,damageText:'10×',text:'10 damage per damage counter on the attacking Pokémon.',effect:{type:'damageFromDamage',source:'self',amount:1,mode:'replace'}}],text:'Fighting Pokémon Tool; grants Violent Rage and expires at the end of this turn.'};
trainers[122]={kind:'tool',effect:noop,attacks:[{name:'Singe',cost:'R',damage:0,text:'Defender becomes Burned.',effect:par('burn')}],text:'Fire Pokémon Tool; grants Singe and expires at the end of this turn.'};
trainers[124]={kind:'tool',effect:noop,attacks:[{name:'Sleep Poison',cost:'G',damage:0,text:'Defender becomes Asleep and Poisoned.',effect:seq(par('sleep'),par('poison'))}],text:'Grass Pokémon Tool; grants Sleep Poison and expires at the end of this turn.'};
trainers[132]={kind:'tool',effect:noop,attacks:[{name:'Psy Confuse',cost:'P',damage:0,text:'Defender becomes Confused.',effect:par('confusion')}],text:'Psychic Pokémon Tool; grants Psy Confuse and expires at the end of this turn.'};
trainers[140]={kind:'tool',effect:noop,attacks:[{name:'Splatter',cost:'W',damage:0,text:'Choose an opposing Pokémon and deal 20 damage ignoring Weakness and Resistance.',effect:{type:'selectedDamage',target:'opponentPokemon',amount:20,ignoreWeakness:true,ignoreResistance:true}}],text:'Water Pokémon Tool; grants Splatter and expires at the end of this turn.'};
// Aquapolis final pass: retain distinct print IDs, exact effects, and choice rules.
attack(2,0,aq('fireBlow'),'Discard any number of Fire Energy from Arcanine; +30 per heads when flipping once per discarded card.');
attack(9,0,aq('energyKick'),'Heads: move one Energy card from opponent Active to one of opponent Bench.');
attack(10,0,aq('burningFang'),'Optional coin: on heads discard Fire Energy from Entei and Burn the defender.');
attack(12,0,aq('superEggsplosion'),'Discard Energy from your Pokémon, flip a coin per discarded Energy, 40 damage per heads.');
attack(12,1,{type:'selectedEnergyDamage',target:'opponentBench',amount:10,energyType:'Grass'},'Choose an opposing Benched Pokémon: 10 damage per Grass Energy attached to Exeggutor.');
attack(15,0,fl(noop,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,strictEnergyType:true}), 'Tails: discard one Fire Energy from Houndoom; heads: keep it.');
attack(15,1,aq('darkImpact'), 'Defending Pokémon cannot use Poké-Powers next turn.');
attack(22,0,aq('steelWave'),'30 damage and 10 to each opposing Benched Pokémon matching defending Pokémon type.');
attack(23,0,aq('burningSludge'),'Flip for each attached Grass Energy; any heads: opponent Active becomes Poisoned and Burned.');
attack(32,0,aq('snatch'),'Optionally switch opponent Active with a previously undamaged opposing Benched Pokémon before the 20 damage.');
attack(32,1,aq('heavyMetal'),'30 plus 20 for each heads when flipping once per attached Metal Energy.');
powers[6]=activated('Happy Healing',aq('happyHealing'));
powers[10]=passive('Pure Body',aq('pureBodyFire'));
powers[11]=activated('Energy Return',aq('energyReturn'),{oncePerTurn:false});
powers[17]=passive('Fluff',aq('fluff'));
powers[21]=activated('Ion Coating',aq('ionCoating'));
powers[22]=activated('Magnetic Flow',aq('magneticFlow'),{activeOnly:true});
powers[23]=passive('Heavyweight',aq('heavyweight'));
powers[37]=passive('Pure Body',aq('pureBodyWater'));
powers[38]=activated('Strange Tentacles',aq('strangeTentacles'));
powers[39]=activated('Miracle Shift',aq('miracleShift'));
powers[41]=activated('Dark Moon',aq('darkMoon'),{activeOnly:true});
powers[44]=passive('Anti-Lightning',aq('antiLightning'));
powers[48]=activated('Scavenger Hunt',aq('scavengerHunt'));
trainers[118]={kind:'stadium',effect:{type:'stadiumAction',effect:aq('apricornForest')},text:'Once each turn: flip heads, reveal Basic Energy from hand; bench matching Basic Pokémon from deck.'};
trainers[119]={kind:'tool',effect:noop,attacks:[{name:'Plunder',cost:'D',damage:10,text:'Discard any attached Trainer cards from the Defending Pokémon before damage.',effect:{type:'discardTool',target:'opponentActive',amount:'all'}}],text:'Darkness Pokémon: grants Plunder, then discard this Technical Machine at end of turn.'};
trainers[125]={kind:'tool',effect:aq('healingBerryPassive'),text:'End of either turn, at 20 HP or less, heal 30 damage and discard.'};
trainers[127]={kind:'tool',effect:noop,attacks:[{name:'Discharge',cost:'L',damage:0,damageText:'40×',text:'Discard all attached Lightning Energy; flip for each, 40 damage per heads.',effect:aq('conduction40')}],text:'Lightning Pokémon: temporary Discharge attack.'};
trainers[128]={kind:'tool',effect:{type:'previousEvolutionAttacks'},text:'May use attacks printed on previous Evolution cards in this Pokémon’s stack; discard when used.'};
trainers[129]={kind:'tool',effect:noop,attacks:[{name:'Metal Reversal',cost:'M',damage:10,text:'Optionally switch the defender with its Bench before dealing damage.',effect:aq('snatch')}],text:'Metal Pokémon: temporary Metal Reversal attack.'};
trainers[131]={kind:'stadium',effect:aq('pokemonParkPassive'),text:'When Energy is attached from hand to your Benched Pokémon, heal 10 damage from that Pokémon.'};
trainers[134]={kind:'item',effect:aq('superEnergyRemoval2'),text:'Two heads: discard all opponent Active Energy; two tails: discard all your Active Energy; mixed: no effect.'};
trainers[135]={kind:'tool',effect:aq('timeShardPassive'),text:'If knocked out by defending Pokémon attack on opponent turn, return up to 2 attached basic Energy to hand.'};
trainers[136]={kind:'supporter',effect:aq('townVolunteers'),text:'Shuffle up to five Pokémon or Basic Energy cards from discard into deck.'};
trainers[138]={kind:'stadium',effect:{type:'stadiumAction',effect:aq('underseaRuins')},text:'Once each turn, flip heads to de-evolve one of your evolved Pokémon; discard top Evolution card.'};
trainers[139]={kind:'stadium',effect:{type:'stadiumAction',effect:aq('powerPlant')},text:'Once each turn, trade one basic Energy card in hand for one from discard.'};
trainers[141]={kind:'tool',effect:aq('weaknessGuardPassive'),onAttach:{type:'weaknessGuard',duration:'opponentTurn'},text:'No Weakness; discard at end of next opponent turn.'};
trainers[144]={kind:'energy',effect:{type:'specialEnergy',provides:{Miracle:1}},text:'One Energy of any type; attaching from hand puts 10 damage on the recipient.'};
trainers[145]={kind:'energy',effect:{type:'specialEnergy',provides:{Colorless:3}},text:'Attach to Evolved Pokémon only: three Colorless Energy, cannot retreat, expires at end of turn.'};
trainers[146]={kind:'energy',effect:{type:'specialEnergy',provides:{Colorless:1}},text:'One Energy of any Basic Energy type currently attached to its Pokémon; otherwise Colorless.'};
trainers[147]={kind:'energy',effect:{type:'specialEnergy',provides:{Colorless:1}},text:'Provides Colorless; attaching from hand to your Active Pokémon lets you switch with Bench.'};
// Crystal Type changes only while the printed basic Energy type is freshly attached.
for(const [id,names] of [[148,['Water','Lightning','Psychic']],[149,['Fire','Water','Psychic']],[150,['Grass','Lightning','Fire']]]){
  powers[id]=passive('Crystal Type',aq('crystalType'),{printedTypes:names});
}
attack(148,0,recoil(10),'40 damage; Kingdra takes 10 recoil damage.');
attack(148,1,aq('dualBurn'),'Flip two coins; for each tails discard one Energy attached to Kingdra.');
attack(149,0,aq('lugiaPsychic'),'10 damage per Energy attached to defending Pokémon.');
attack(149,1,{type:'discardEnergyCard',target:'self',amount:1,useCost:true},'Discard one Energy from Lugia to use Steam Blast.');
attack(150,0,par('poison'),'Poison the defending Pokémon.');
attack(150,1,aq('rollingThunder'),'Flip: heads 10 to all opposing Bench; tails 10 to own Bench.');

// There are intentionally no fake effects for the Crystal Pokémon and Cubes.

function getAttackRule(n,i){return rules[n+':'+i]||null;}
const labels=new Map();for(const line of RAW.trim().split('\n')){
 const a=line.split('|');if(a.length>2)labels.set(a[0],a);
}
const holoPairs=Object.fromEntries(RAW.trim().split('\n').filter(line=>/^H\d+\|\d+$/.test(line)).map(line=>line.split('|')));
function parse(id){const original=holoPairs[id]||id,fields=labels.get(original);
 if(!fields)throw new Error('Missing Aquapolis source print '+id);
 const [_,name,kind,type,stage,hp,retreat,weak,res,evolves,rarity,rawMoves,powerName]=fields;
 const h=String(id).startsWith('H'),n=Number(original),number=String(id),cardId='ecard2-'+id;
 const reasons=[];const image=`https://images.pokemontcg.io/ecard2/${id}.png`;
 let card={id:cardId,setId:'ecard2',number,name,kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy',rarity:h?'Rare Holo':rarity,source:'tcg',battleFormat:'classic',image,imageLarge:`https://images.pokemontcg.io/ecard2/${id}_hires.png`};
 if(kind==='P'){
  const attacks=(rawMoves||'').split(';').filter(Boolean).map((item,i)=>{
   const [name,cost,printed='']=item.split('~'),key=n+':'+i,needed=needsRule.has(key),effect=getAttackRule(n,i),value=Number((String(printed).match(/^\d+/)||[])[0]||0);
   if(needed&&!effect)reasons.push(`Unimplemented printed attack: ${name}`);
   if(effect&&!fx.supportsEffect(effect))reasons.push(`Unsupported effect for ${name}: ${effect.type}`);
   return {name,cost,damage:n===101&&i===1?0:String(printed).includes('×')?0:value,damageText:printed||null,text:notes[key]||(needed?'Printed attack effect needs engine support.':`Deal ${value} printed damage.`),effect:effect||(!needed?noop:null)};
  });
  const power=powerName?powers[n]:null;
  if(powerName&&!power)reasons.push(`Unimplemented Poké-Power / Poké-Body: ${powerName}`);
  if(power&&!fx.supportsEffect(power.effect))reasons.push(`Unsupported Poké-Power: ${power.name}`);
  Object.assign(card,{stage:stage==='0'?'Basic':stage==='b'?'Baby':`Stage ${stage}`,baby:stage==='b',hp:Number(hp),retreat:Number(retreat||0),types:[T[type]],subtype:T[type],weakness:T[weak]||null,weaknessValue:weak?'×2':null,resistance:T[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolves||null,attacks,abilities:power?[power]:[]});
 }else if(kind==='T'){
  const isTM=/ Cube 01$/.test(name),tool=['Healing Berry','Memory Berry','Time Shard','Weakness Guard'].includes(name),stadium=['Apricorn Forest','Pokémon Park','Undersea Ruins','Power Plant'].includes(name),supporter=['Forest Guardian','Juggler','Pokémon Fan Club','Seer','Town Volunteers','Traveling Salesman'].includes(name);
  const trainer=trainers[n];
  if(!trainer)reasons.push(`Printed ${isTM?'Technical Machine':tool?'Tool':stadium?'Stadium':supporter?'Supporter':'Trainer'} effect not implemented`);
  Object.assign(card,{trainerType:isTM||tool?'Tool':stadium?'Stadium':supporter?'Supporter':'Item',technicalMachine:isTM,attacks:trainer?.attacks||[],onAttach:trainer?.onAttach||null,effect:trainer?.effect||null,text:trainer?.text||'Printed effect is not yet supported in battle.'});
 }else{
  const special=trainers[n];
  if(!special)reasons.push('Special Energy effect not yet implemented');
  Object.assign(card,{specialEnergy:true,basicEnergy:false,subtype:name.replace(' Energy',''),types:[name.replace(' Energy','')],effect:special?.effect||null,text:special?.text||'Printed Special Energy rule needs additional engine support.'});
 }
 const battleEnabled=!reasons.length;
 return Object.freeze({...card,battleEnabled,deckEligible:battleEnabled,support:{status:battleEnabled?'FULL':'PARTIAL',reasons}});
}
const IDS=[...Array.from({length:150},(_,i)=>String(i+1)),...Array.from({length:32},(_,i)=>'H'+(i+1))];
const CARDS=Object.freeze(IDS.map(parse));const BY_ID=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>BY_ID.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
