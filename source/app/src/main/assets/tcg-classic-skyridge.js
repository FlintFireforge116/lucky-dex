/* Skyridge (ecard3, May 2003): 150 numbered + 32 Holo prints.
 * Catalogue identity/attack/energy metadata: PokemonTCG/pokemon-tcg-data cards/en/ecard3.json.
 * An attack/power without VERIFIED implemented behaviour is PARTIAL, not a fake working card.
 * This is an incremental integration; do not enable rules merely because supportsEffect accepts a tag.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGSkyridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ecard3',name:'Skyridge',series:'E-Card',releaseDate:'2003-05-12',cardCount:182});
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW="1|Aerodactyl|P|F|1|70|1|W||Mysterious Fossil|Rare|Rising Lunge~FC~20+|Ancient Wind\n2|Alakazam|P|P|2|100|2|P||Kadabra|Rare|Psychic~CCC~30+|Energy Jump\n3|Arcanine|P|R|1|80|2|W||Growlithe|Rare|Shake~C~10;White Flames~RRC~70|Energy Recharge\n4|Articuno|P|W|0|80|2|M|F||Rare|Freeze Solid~C~10;Ice Cyclone~WWCC~50|Water Immunity\n5|Beedrill|P|G|2|80||R||Kakuna|Rare|Needle Rush~CC~10+|Venom Spray\n6|Crobat|P|G|2|90||P||Golbat|Rare|Double Cross~GCC~40×|Carry Off\n7|Dewgong|P|W|1|80|2|M||Seel|Rare|Freeze Lock~WC~20;Crushing Ice~WWCC~40+|\n8|Flareon|P|R|1|70|1|W||Eevee|Rare|Singe~R~;Burn Booster~CCC~40+|Self-healing\n9|Forretress|P|M|1|70|2|R|G|Pineco|Rare|Spinning Blow~CC~20×;Scatterbomb~MCC~40|\n10|Gengar|P|P|2|100|2|D|F|Haunter|Rare|Hydrokinesis~PPCC~40|Manipulate\n11|Gyarados|P|W|1|90|2|L||Magikarp|Rare|Dragon's Vengeance~WCCC~50|Flame Vapor\n12|Houndoom|P|D|1|70|1|F|P|Houndour|Rare|Ambush~CC~10+;Lonely Fang~DCC~30+|\n13|Jolteon|P|L|1|70||F||Eevee|Rare|Thundershock~L~10;Thunderspark~LCC~40|Self-healing\n14|Kabutops|P|F|2|90|2|G||Kabuto|Rare|Dual Cut~FFC~50×|Primal Aura\n15|Ledian|P|G|1|70||R||Ledyba|Rare|Pollen Shield~C~10;Swift~GGC~50|\n16|Machamp|P|F|2|120|2|P||Machoke|Rare|Drag Off~FC~20;Hurricane Punch~FFCC~30×|Immunity\n17|Magcargo|P|R|1|80|3|W||Slugma|Rare|Eruption~CC~20+;Fire Stream~RRCC~60|\n18|Magcargo|P|F|1|80|3|W||Slugma|Rare|Crushing Lava~FCC~40+|Streaming Mantle\n19|Magneton|P|L|1|80|1|F||Magnemite|Rare|Electric Blast~LCC~40|Attract Energy\n20|Magneton|P|M|1|70|2|R|G|Magnemite|Rare|Bounce Off~CC~20;Magnetic Wave~MMC~30+|\n21|Moltres|P|R|0|80|2|W|F||Rare|Collect Fire~C~10;Burning Tail~RRCC~60|Fire Immunity\n22|Nidoqueen|P|G|2|110|3|P||Nidorina|Rare|Double Claw~GCC~30+|Evolution Helper\n23|Omastar|P|W|2|90|2|L||Omanyte|Rare|Spook~WWC~50|Primal Stare\n24|Piloswine|P|W|1|90|3|M||Swinub|Rare|Freezing Breath~WCC~20;Trample~FCCC~40|\n25|Politoed|P|W|2|110|2|L||Poliwhirl|Rare|Sudden Growth~C~;Frog Hop~WCC~30+;Energy Splash~WWCCC~70|\n26|Poliwrath|P|F|2|110|2|P||Poliwhirl|Rare|Spiral Punch~FFC~40+|Strange Spiral\n27|Raichu|P|L|1|80|1|F||Pikachu|Rare|Zzzap~CC~;Lightning Storm~LCC~50|\n28|Raikou|P|L|0|70|1|F|||Rare|Lightning Sphere~LCC~40+|Pure Body\n29|Rhydon|P|F|1|90|2|G|L|Rhyhorn|Rare|Stomp~FCC~30+;Giant Tail~FFCCC~100|\n30|Starmie|P|P|1|80|1|P||Staryu|Rare|Energy Burst~P~10×;Star Back~PCC~40|\n31|Steelix|P|M|1|100|4|R|G|Onix|Rare|Squeeze~MMC~20+;Metal Tail~MMMC~40|Rare Metal\n32|Umbreon|P|D|1|70|1|F|P|Eevee|Rare|Sharp Claws~DC~10+|Dark Gaze\n33|Vaporeon|P|W|1|70|1|L||Eevee|Rare|Hypnosplash~CC~10;Aqua Trick~WCC~40|Self-healing\n34|Wigglytuff|P|C|1|70|1|F||Jigglypuff|Rare|Do the Wave~CC~10×|Good Neighbor\n35|Xatu|P|P|1|80|1|P||Natu|Rare|Warp Hole~CCC~30|Synchronicity\n36|Electrode|P|L|1|70|1|F||Voltorb|Uncommon|Plasma~CC~20;Selfdestruct~LLCC~100|\n37|Kabuto|P|F|1|50|1|G||Mysterious Fossil|Uncommon|Scratch~FC~30|Thick Shell\n38|Machoke|P|F|1|80|1|P||Machop|Uncommon|Focus Energy~C~;Mega Punch~FCC~40|\n39|Misdreavus|P|P|0|50|1|D|F||Uncommon|Hypnoblast~P~10;Gift of Spite~PC~|\n40|Noctowl|P|C|1|70||L|F|Hoothoot|Uncommon|Triple Smash~CC~10+|Investigate\n41|Omanyte|P|W|1|60|1|L||Mysterious Fossil|Uncommon|Water of Evolution~C~;Drag Off~WC~20|\n42|Persian|P|C|1|70||F||Meowth|Uncommon|Surprise Slash~CC~20;Lunge~CC~50|\n43|Piloswine|P|F|1|80|3|G|L|Swinub|Uncommon|Impaling Tusk~FCC~40;Continuous Charge~FFCC~30+|\n44|Starmie|P|W|1|70|1|L||Staryu|Uncommon|Water Gun~W~10+;Core Blast~CCC~30+|\n45|Wobbuffet|P|P|0|70|2|P|||Uncommon|Return Attack~PC~10×|Mirror Coat\n46|Abra|P|P|0|40|1|P|||Common|Headbutt~CC~20|Psychoflow\n47|Buried Fossil|P|C|0|30|1||||Common||Reconstruction\n48|Cleffa|P|C|b|30|1||||Common|Energy Recycle~C~|\n49|Delibird|P|W|0|50|1|M|||Common|Limited Delivery~C~;Kick Away~WC~20|\n50|Diglett|P|F|0|40|1|G|L||Common|Burrow~F~10|\n51|Ditto|P|C|0|50|1|F|||Common|Copy~C~|Prismatic Body\n52|Dugtrio|P|F|1|70|1|G|L|Diglett|Common|Burrow~FC~20;Dig Under~CCC~|\n53|Dunsparce|P|C|0|40|1|F|||Common|Tail Shake~C~10|Slippery Skin\n54|Eevee|P|C|0|50|1|F|||Common|Smash Kick~C~10;Take Down~CC~30|\n55|Farfetch'd|P|C|0|50|1|L|F||Common|Whirlwind~C~;Leek Rush~C~10×|\n56|Forretress|P|G|1|70|2|R||Pineco|Common|Shell Rupture~GC~;Double Spin~GCC~40×|Exoskeleton\n57|Gastly|P|P|0|50|1|D|F||Common|Haunt~P~|\n58|Girafarig|P|P|0|60|1|P|||Common|Energy Patch~P~;Syncroblast~PC~40|\n59|Gligar|P|F|0|60|1|G|||Common|Irongrip~F~10;Sharp Stinger~FC~10|\n60|Golbat|P|G|1|70|1|P||Zubat|Common|Poison Sound Wave~GC~;Strength in Numbers~CCC~30+|\n61|Granbull|P|C|1|80|1|F||Snubbull|Common|Fling~CC~20;Mega Punch~CCCC~50|\n62|Growlithe|P|R|0|50|1|W|||Common|Flare~R~10;Double Kick~CC~20×|\n63|Haunter|P|P|1|70|1|D|F|Gastly|Common|Confuse Ray~CC~10;Shadow Hand~PCC~30|\n64|Heracross|P|G|0|60|1|R|||Common|Slash~CC~20;Angry Horn~GCC~30|\n65|Hoothoot|P|C|0|40|1|L|F||Common|Hypnosis~C~;Eerie Light~C~|\n66|Houndour|P|R|0|50|1|W|||Common|Retaliate~C~10×;Fireworks~R~20|\n67|Igglybuff|P|C|b|30|1||||Common|Energy Heal~C~|\n68|Jigglypuff|P|C|0|50|1|F|||Common|Nap~C~;Lullaby~CC~10|\n69|Kadabra|P|P|1|70|1|P||Abra|Common|Nightmare~C~10;Mind Shock~PCC~40|\n70|Kakuna|P|G|1|70|2|R||Weedle|Common|Poisonpowder~G~|Exoskeleton\n71|Lapras|P|W|0|60|2|M|||Common|Assist~CC~;Hypnoblast~WWC~30|\n72|Ledyba|P|G|0|40|1|L|F||Common|Teary Eyes~C~;Quick Turn~G~10×|\n73|Ledyba|P|G|0|50|1|R|||Common|Gnaw~G~10;Slam~CC~20×|\n74|Machop|P|F|0|50|1|P|||Common|Smash Punch~C~20;Fling~FC~20|\n75|Magikarp|P|W|0|30|1|L|||Common|Signs of Evolution~C~;Splash~W~10|\n76|Magnemite|P|L|0|40|1|F|||Common|Thunder Wave~C~;Magnetic Lines~L~10|\n77|Mantine|P|W|0|60|2|L|F||Common|Fin Smack~W~10×;Aqua Sonic~WCC~30|\n78|Meowth|P|C|0|40|1|F|||Common|Sudden Swipe~C~10|\n79|Murkrow|P|D|0|50|1|F|P||Common|Evil Eye~D~;Blindside~CC~|\n80|Natu|P|P|0|50|1|P|||Common|Foresight~P~;Removal Beam~CC~10|\n81|Nidoran ♀|P|G|0|50|1|P|||Common|Call for Family~C~;Scratch~G~10|\n82|Nidoran ♀|P|G|0|50|1|P|||Common|Poison Sting~CC~10|\n83|Nidorina|P|G|1|80|2|P||Nidoran ♀|Common|Tackle~CC~20;Poison Claws~GCC~30|\n84|Pikachu|P|L|0|50|1|F|||Common|Max Voltage~CC~20+|\n85|Pineco|P|G|0|40|1|R|||Common|Surprise Attack~C~20|\n86|Pineco|P|G|0|50|1|R|||Common|Double-edge~GC~30|\n87|Poliwag|P|W|0|40|1|L|||Common|Sleep Bubble~W~10;Doubleslap~CC~20×|\n88|Poliwhirl|P|W|1|70|1|L||Poliwag|Common|Twiddle~C~;Double Kick~CCC~30×|\n89|Raticate|P|C|1|70|1|F||Rattata|Common|Scratch~C~20;Continuous Bite~CC~10+|\n90|Rattata|P|C|0|30|1|F|||Common|Call for Friends~C~;Body Slam~C~10|\n91|Rhyhorn|P|F|0|60|2|G|L||Common|Horn Attack~C~10;Retaliate~FC~10×|\n92|Sandshrew|P|F|0|40|1|G|L||Common|Double Scratch~C~10×;Dig Under~F~|\n93|Sandslash|P|F|1|70|1|G|L|Sandshrew|Common|Sand Trap~FC~10;Poison Needle Rush~FCC~20×|\n94|Seel|P|W|0|50|1|L|||Common|Cold Breath~W~10|\n95|Seel|P|W|0|50|1|L|||Common|Double Headbutt~C~10×;Ice Beam~WC~10|\n96|Shuckle|P|G|0|30|2|R|||Common|Poisonous Saliva~GC~10|Vase Body\n97|Skarmory|P|M|0|60|2|R|G||Common|Double Peck~C~10×;Spinning Head~MCC~30|\n98|Slugma|P|R|0|50|2|W|||Common|Tackle~C~10;Scorching Lava~R~|\n99|Slugma|P|R|0|50|2|W|||Common|Singe~RC~10|\n100|Snorlax|P|C|0|80|3|F|||Common|Continuous Tumble~CCC~30×|Lolling About\n101|Snubbull|P|C|0|50|1|F|||Common|Scary Face~C~;Bite~CC~20|\n102|Stantler|P|C|0|60|1|F|||Common|Threaten~C~;Antler Swipe~CC~|\n103|Staryu|P|W|0|40|1|L|||Common|Energy Healing~C~;Doubleslap~W~10×|\n104|Staryu|P|W|0|50|1|L|||Common|Slap~C~10;Confuse Ray~WC~10|\n105|Sunflora|P|G|1|70|1|R|W|Sunkern|Common|Energy Plant~GC~;Trip Over~GCC~30+|\n106|Sunkern|P|G|0|40|1|R|W||Common|Rollout~C~10;Blot~G~10|\n107|Swinub|P|W|0|50|1|M|||Common|Ram~C~10;Freezing Breath~W~|\n108|Swinub|P|F|0|50|1|G|L||Common|Mud Slap~F~10;Overrun~CC~10|\n109|Teddiursa|P|C|0|40|1|F|||Common|Surprise Attack~C~20;Rage~CC~10+|\n110|Ursaring|P|C|1|80|2|F||Teddiursa|Common|Bear Hug~CCC~30;Rend~CCCC~40+|\n111|Venomoth|P|G|1|70||R||Venonat|Common|Healing Dust~CC~;Miracle Powder~GCC~30|\n112|Venonat|P|G|0|50|1|R|||Common|Double Spin~C~10×;Supersonic~GC~10|\n113|Voltorb|P|L|0|50|1|F|||Common|Magnetic Pull~L~;Spin Tackle~LC~30|\n114|Weedle|P|G|0|40|1|R|||Common|Fury Attack~G~10×|\n115|Weedle|P|G|0|50|1|R|||Common|Entangling Thread~C~;Poison Horn~G~|\n116|Yanma|P|G|0|60|1|L|F||Common|Agility~GC~10;Triple Smash~GCC~20+|\n117|Zubat|P|G|0|40|1|L|F||Common|Sound Waves~C~;Flitter~G~|\n118|Zubat|P|G|0|50|1|P|||Common|Wing Attack~C~10;Poison Spray~GC~10|\n119|Ancient Ruins|T||||||||Uncommon||\n120|Relic Hunter|T||||||||Uncommon||\n121|Apricorn Maker|T||||||||Uncommon||\n122|Crystal Shard|T||||||||Uncommon||\n123|Desert Shaman|T||||||||Uncommon||\n124|Fast Ball|T||||||||Uncommon||\n125|Fisherman|T||||||||Uncommon||\n126|Friend Ball|T||||||||Uncommon||\n127|Hyper Potion|T||||||||Uncommon||\n128|Lure Ball|T||||||||Uncommon||\n129|Miracle Sphere α|T||||||||Uncommon|Fire Force~RCC~30+|\n130|Miracle Sphere β|T||||||||Uncommon|Freezing Force~WCC~30+|\n131|Miracle Sphere γ|T||||||||Uncommon|Thunder Force~LCC~30+|\n132|Mirage Stadium|T||||||||Uncommon||\n133|Mystery Plate α|T||||||||Uncommon|Desert Burn~C~|\n134|Mystery Plate β|T||||||||Uncommon|Stone Crush~C~|\n135|Mystery Plate γ|T||||||||Uncommon|Retro Cave~C~|\n136|Mystery Plate δ|T||||||||Uncommon|Healing Oasis~C~|\n137|Mystery Zone|T||||||||Uncommon||\n138|Oracle|T||||||||Uncommon||\n139|Star Piece|T||||||||Uncommon||\n140|Underground Expedition|T||||||||Uncommon||\n141|Underground Lake|T||||||||Uncommon||\n142|Bounce Energy|E||||||||Uncommon||\n143|Cyclone Energy|E||||||||Uncommon||\n144|Retro Energy|E||||||||Uncommon||\n145|Celebi|P|C|0|60|1|R|||Rare Secret|Empathic Healing~GW~;Mind Bend~GPC~20|Crystal Type\n146|Charizard|P|C|2|110|4|W||Charmeleon|Rare Secret|Fireblast~RRF~40;Dragon Tail~RLLC~50×|Crystal Type\n147|Crobat|P|C|2|80||P||Golbat|Rare Secret|Poison Flame~GRC~20;Squared Attack~GPP~20×|Crystal Type\n148|Golem|P|C|2|100|4|W||Graveler|Rare Secret|Rock Throw~FFC~30;Earth Bomb~GRFC~50|Crystal Type\n149|Ho-oh|P|C|0|80|3|W|||Rare Secret|Holy Flame~RL~20;Scalding Steam~RWWC~40|Crystal Type\n150|Kabutops|P|C|2|90|3|G||Kabuto|Rare Secret|Draining Cut~WFC~20;Triple Cutter~LLFC~30×|Crystal Type";
const HOLOS=[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,31,32,33,35];
const noop={type:'noop'},status=s=>({type:'status',target:'opponentActive',status:s}),flip=(heads,tails=noop)=>({type:'coinFlip',heads,tails}),bonus=n=>({type:'bonusDamage',amount:n});
const coins=(n,a,mode='replace')=>({type:'coinDamage',coins:n,amount:a,mode}),gate={type:'coinAttackGate',heads:noop},recoil=n=>({type:'selfDamage',amount:n}),seq=(...effects)=>({type:'sequence',effects});
const effects=Object.create(null),descriptions=Object.create(null),powers=Object.create(null),trainers=Object.create(null);
function atk(n,i,e,text){effects[n+':'+i]=e;descriptions[n+':'+i]=text;}
function group(keys,e,text){for(const key of keys.trim().split(/\s+/))if(key)effects[key]=e,descriptions[key]=text;}
// These attacks are the ONLY ones without additional printed conditions.
const pure=new Set('37:0 38:1 43:0 46:0 54:0 59:0 61:1 62:0 64:0 73:0 75:1 81:1 83:0 89:0 91:0 98:0 104:0 106:0 107:0 108:0 118:0 148:0 149:0'.split(' '));
// Conditions and the order of their application are copied from the printed cards.
group('8:0 99:0',status('burn'),'The Defending Pokémon is Burned.');
group('53:0 65:0 68:1 69:0 82:0 87:0',status('sleep'),'The Defending Pokémon is Asleep.');
group('70:0 96:0 118:1',status('poison'),'The Defending Pokémon is Poisoned.');
group('13:0 71:1 83:1 94:0',flip(status('paralysis')),'Heads: the Defending Pokémon is Paralyzed.');
group('63:0 65:1 104:1 112:1 117:0',flip(status('confusion')),'Heads: the Defending Pokémon is Confused.');
group('39:0 71:1',flip(status('sleep')),'Heads: the Defending Pokémon is Asleep.');
// Reassert actual Paralyze rule for No. 13 and the sleep chance for Lapras.
atk(13,0,flip(status('paralysis')),'Flip heads: Paralyze the Defending Pokémon.');
atk(71,1,flip(status('sleep')),'Flip heads: Sleep the Defending Pokémon.');
group('1:0 12:0 29:0',flip(bonus(20)),'Flip heads for 20 additional damage.');
atk(22,0,coins(2,20,'add'),'Flip twice, 20 bonus damage per heads.');
group('32:0 105:1',flip(bonus(30)),'Flip heads for 30 additional damage.');
atk(31,0,flip(seq(bonus(10),status('paralysis'))),'Heads: 10 more damage and Paralysis.');
atk(88,0,flip(status('confusion'),status('sleep')),'Heads Confused; tails Asleep.');
atk(107,1,flip(status('paralysis'),status('sleep')),'Heads Paralyzed; tails Asleep.');
atk(24,0,flip(status('paralysis'),status('sleep')),'Heads Paralyzed; tails Asleep.');
atk(59,1,flip(status('poison'),status('paralysis')),'Heads Poisoned; tails Paralyzed.');
atk(60,0,flip(status('confusion'),status('poison')),'Heads Confused; tails Poisoned.');
atk(10,0,flip(status('burn'),status('confusion')),'Heads Burned; tails Confused.');
group('6:0 14:0 56:1 62:1 72:1 73:1 77:0 87:1 88:1 92:0 95:0 97:0 103:1 112:0',coins(2,10),'Flip two coins; damage per heads.');
// Override card-specific damage values (some were grouped solely by coin count).
for(const [n,i,heads,damage] of [[6,0,2,40],[14,0,2,50],[56,1,2,40],[62,1,2,20],[72,1,2,10],[73,1,2,20],[77,0,2,10],[87,1,2,20],[88,1,2,30],[92,0,2,10],[95,0,2,10],[97,0,2,10],[103,1,2,10],[112,0,2,10]])atk(n,i,coins(heads,damage),`Flip ${heads} coins: ${damage} damage per heads.`);
group('16:1 114:0',coins(3,10),'Flip three coins, 10 damage for each heads.');
atk(16,1,coins(4,30),'Flip four coins for 30 damage per heads.');
atk(114,0,coins(3,10),'Flip three coins for 10 damage per heads.');
atk(116,1,coins(3,10,'add'),'20 plus 10 for each heads on three coin flips.');
atk(100,0,coins('untilTails',30),'Flip until tails: 30 damage per heads.');
atk(55,1,coins('untilTails',10),'Flip until tails: 10 damage per heads.');
atk(26,0,coins('untilTails',20,'add'),'40 damage plus 20 per heads until tails.');
group('29:1 42:1 74:0 85:0 109:0',gate,'Flip tails: this attack does nothing.');
atk(101,0,flip(seq({type:'lock',target:'opponentActive',action:'attack',duration:'opponentTurn'},{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'})),'Heads: defending Pokémon cannot attack or retreat next turn.');
// Recovery and damage-counter mechanics.
atk(54,1,recoil(10),'30 damage and 10 recoil.');
atk(66,0,{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},'10 for each damage counter on Houndour.');
atk(86,0,recoil(10),'30 damage and 10 recoil.');
atk(91,1,{type:'damageFromDamage',source:'self',amount:1,mode:'replace'},'10 damage per damage counter on Rhyhorn.');
atk(109,1,{type:'damageFromDamage',source:'self',amount:1},'10 additional damage per counter on Teddiursa.');
atk(110,1,{type:'bonusDamage',amount:20,condition:{type:'opponentDamaged'}},'20 more damage if the defender has any damage counters.');
atk(66,1,flip(noop,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,strictEnergyType:true}),'On tails, discard one attached Fire Energy.');
atk(68,0,{type:'healSelf',amount:10},'Remove 10 damage from Jigglypuff.');
atk(69,1,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true},'Mind Shock ignores Weakness and Resistance.');
atk(77,1,{type:'damageRule',ignoreResistance:true},'Ignore Resistance.');
// Meowth's Sudden Swipe requires the player to choose ONE Energy from the opponent's hand; this is not equivalent to shuffling ALL Energy.

atk(52,1,{type:'selectedDamage',target:'opponentPokemon',amount:30,ignoreWeakness:true,ignoreResistance:true},'Choose one opposing Pokémon; 30 damage ignoring W/R.');
atk(92,1,{type:'selectedDamage',target:'opponentPokemon',amount:10,ignoreWeakness:true,ignoreResistance:true},'Choose one opposing Pokémon; place 10 damage ignoring W/R.');
atk(117,1,{type:'selectedDamage',target:'opponentPokemon',amount:10,ignoreWeakness:true,ignoreResistance:true},'Choose one opposing Pokémon; deal 10 ignoring W/R.');
atk(106,1,{type:'drain',amount:10},'Remove 10 damage if Sunkern has any.');
atk(94,0,flip(status('sleep')),'Heads: Sleep.');
atk(95,1,flip(status('paralysis')),'Heads: Paralyze.');
atk(115,0,flip(status('paralysis')),'Heads: Paralyze.');
atk(115,1,flip(status('poison')),'Heads: Poison.');
atk(72,0,{type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn',scope:'self'},'Reduce attack damage on Ledyba by 20 next turn.');
atk(104,1,flip(status('confusion')),'Heads: Confuse.');
atk(108,1,flip({type:'selectedDamage',target:'opponentBench',amount:10,ignoreWeakness:true,ignoreResistance:true}),'Heads: 10 damage to a chosen opposing Bench Pokémon.');
atk(116,0,flip({type:'preventDamage',duration:'opponentTurn'}),'Heads: prevent effects and damage of attacks during opponent turn.');
atk(113,0,{type:'forceOpponentSwitch',chooseBy:'attacker'},'Choose an opposing Benched Pokémon to switch into Active.');
atk(113,1,recoil(10),'30 damage and 10 self-damage.');
atk(74,1,{type:'forceOpponentSwitch'},'After damage, opponent switches defending Pokémon with Bench.');
atk(61,0,{type:'forceOpponentSwitch'},'After 20 damage, opponent switches defending Pokémon with Bench.');
atk(55,0,{type:'forceOpponentSwitch'},'Opponent switches Active Pokémon.');
atk(50,0,flip({type:'preventDamage',duration:'opponentTurn'}),'Heads: prevent attack damage on Diglett during opponent turn.');
atk(52,0,flip({type:'preventDamage',duration:'opponentTurn'}),'Heads: prevent attack damage on Dugtrio during opponent turn.');
atk(106,0,noop,'10 printed damage.');
atk(82,0,status('poison'),'The Defending Pokémon is Poisoned.');
atk(87,0,status('sleep'),'The Defending Pokémon is Asleep.');
atk(98,1,seq({type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true,strictEnergyType:true},status('burn')),'Discard one Fire Energy attached to Slugma; Burn the defender.');
atk(27,1,flip(noop,recoil(20)),'Tails: two damage counters on Raichu.');
atk(36,0,flip({type:'attachEnergyFromDiscard',energyType:'Lightning',amount:1}),'Heads: attach one Lightning Energy from discard.');
atk(36,1,seq({type:'benchDamage',side:'self',all:true,amount:20},{type:'benchDamage',side:'opponent',all:true,amount:20},recoil(100)),'Selfdestruct: 100 recoil and 20 to each Benched Pokémon.');
atk(38,0,{type:'noop'},'Focus Energy: next Mega Punch has 80 base damage (not implemented).'); // Deliberately gated below.
atk(49,1,{type:'forceOpponentSwitch'},'After damage the opponent switches Active Pokémon.');
atk(59,1,flip(status('poison'),status('paralysis')),'Heads Poisoned, tails Paralyzed.');
atk(63,0,flip(status('confusion')),'Heads: Confused.');
atk(68,1,status('sleep'),'The Defending Pokémon is Asleep.');
atk(70,0,status('poison'),'The Defending Pokémon is Poisoned.');
atk(93,0,{type:'benchDamage',side:'opponent',amount:10},'10 damage to up to two opposing Benched Pokémon (target count unresolved).'); // Deliberately gated.
atk(97,1,flip({type:'switch',side:'self'}),'Heads: switch Skarmory with one of your Benched Pokémon.');
atk(99,0,status('burn'),'The Defending Pokémon is Burned.');
atk(101,1,noop,'20 damage.');
atk(104,0,noop,'10 damage.');
atk(107,0,noop,'10 damage.');
atk(108,0,noop,'10 damage.');
atk(109,0,gate,'Flip tails: no damage.');
atk(110,0,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Defending Pokémon cannot retreat next turn.');
atk(112,0,coins(2,10),'Flip two coins: 10 damage per heads.');
atk(113,1,recoil(10),'30 damage plus 10 self damage.');
atk(115,0,flip(status('paralysis')),'Heads: Paralyze.');
atk(115,1,flip(status('poison')),'Heads: Poison.');
atk(118,1,status('poison'),'The Defending Pokémon is Poisoned.');
// Fully supported Bodies, as opposed to abilities that would need a new trigger.
const passive=(name,effect)=>({name,type:'passive',effect});
for(const n of [56,70])powers[n]=passive('Exoskeleton',{type:'modifier',stat:'damageReduction',amount:10,duration:'whileInPlay',scope:'self'});
powers[96]=passive('Vase Body',{type:'modifier',stat:'damageReduction',amount:20,duration:'whileInPlay',scope:'self'});
// Psychoflow is enforced in the core retreat-cost calculation and suppressed with abilities.
powers[46]=passive('Psychoflow',{type:'neoRule',rule:'skyridge:psychoflow'});
powers[100]={name:'Lolling About',type:'activated',oncePerTurn:true,activeOnly:true,disabledByStatus:true,effect:seq({type:'healSelf',amount:10},{type:'status',target:'selfActive',status:'sleep'})};
// Reuse Aquapolis Crystal-Type support, but with this set's own printed type sets.
const crystal={145:['Grass','Water','Psychic'],146:['Fire','Lightning','Fighting'],147:['Grass','Fire','Psychic'],148:['Grass','Fire','Fighting'],149:['Fire','Water','Lightning'],150:['Water','Lightning','Fighting']};
for(const [n,printedTypes] of Object.entries(crystal))powers[n]={name:'Crystal Type',type:'passive',printedTypes,effect:{type:'neoRule',rule:'aquapolis:crystalType'}};
atk(146,0,{type:'discardEnergyCard',target:'self',amount:1,useCost:true},'Discard one Energy from Charizard for Fireblast.');
atk(146,1,coins(2,50),'Flip two coins, 50 damage per heads.');
atk(147,0,flip(seq(status('burn'),status('poison'))),'Heads: Burn and Poison the defender.');
atk(147,1,coins(4,20),'Flip four coins, 20 damage per heads.');
atk(148,1,seq(recoil(20),{type:'benchDamage',side:'self',amount:10,all:true},{type:'benchDamage',side:'opponent',amount:10,all:true}),'20 recoil and 10 damage to every Benched Pokémon.');
atk(149,1,seq({type:'discardEnergyCard',target:'self',amount:1,useCost:true},flip(status('burn'))),'Discard one Energy; heads: Burn the defender.');
atk(150,0,{type:'healSelf',amount:10},'Heal 10 damage from Kabutops.');
atk(150,1,coins(3,30),'Flip three coins, 30 damage per heads.');

// v0.69.149: verified Skyridge attacks. Keep distinct holo/reprint metadata,
// use explicit battle effects rather than enabling a card from its printed text alone.
atk(2,0,{type:'energyDamage',source:'opponent',countCards:true,amount:10},'30 damage plus 10 per Energy card attached to the defender.');
atk(7,0,flip({type:'actionLock',cardType:'EnergyActive',duration:'opponentTurn'}),'Heads: opponent cannot attach Energy from hand to Active next turn.');
atk(7,1,{type:'retreatCostDamage',amount:10},'40 plus 10 for each unit of the defending Pokémon\'s effective retreat cost.');
atk(12,1,{type:'neoRule',rule:'skyridge:lonelyFang'},'30 plus 20 for each extra Pokémon on opponent Bench versus yours.');
atk(15,0,{type:'neoRule',rule:'skyridge:pollenShield'},'Ledian cannot receive Special Conditions during your opponent\'s next turn.');
atk(15,1,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},'Swift: 50 damage unaffected by Weakness, Resistance and protective effects.');
atk(17,1,seq({type:'discardEnergyCard',target:'self',energyType:'Fire',strictEnergyType:true,amount:1,useCost:true},{type:'benchDamage',side:'opponent',all:true,amount:10}),'Discard one attached Fire Energy; 10 to each opposing Benched Pokémon.');
atk(20,1,{type:'neoRule',rule:'skyridge:magneticWave'},'30 plus 10 per extra Benched Pokémon you have relative to the opponent.');
atk(23,0,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Defender cannot retreat next turn.');
atk(25,1,flip(bonus(20)),'Frog Hop: heads adds 20 damage.');
atk(30,0,{type:'neoRule',rule:'skyridge:energyBurst'},'Heads: 10 damage times the total Energy cards attached to both Active Pokémon.');
atk(33,0,status('sleep'),'Hypnosplash: put the defender to Sleep.');
atk(34,0,{type:'neoRule',rule:'skyridge:doTheWave'},'Heads: 10 damage for each of your Pokémon in play; tails: no damage.');
atk(39,1,{type:'neoRule',rule:'skyridge:giftOfSpite'},'Place one damage counter for each damaged friendly Pokémon in play.');
atk(40,0,coins(3,10,'add'),'10 damage plus 10 per heads on three flips.');
atk(43,1,{type:'neoRule',rule:'skyridge:continuousCharge'},'Flip 4 coins: +20 damage per heads and 10 self damage per heads.');
atk(44,0,{type:'energyDamage',source:'self',energyType:'Water',amount:20,extraAbove:1,maxCount:2},'Water Gun: 10 + up to 40 for Water Energy not used in the cost.');
atk(44,1,{type:'neoRule',rule:'destiny:coreBlast'},'30 damage plus 20 per Special Energy card attached to the defender.');
atk(45,0,{type:'neoRule',rule:'skyridge:returnAttack'},'If at least one of two flips is heads, do 10 damage per damage counter on Wobbuffet.');
atk(49,0,{type:'searchChosen',source:'deck',amount:1,filter:{kind:'trainer',trainerType:['Tool','Technical Machine']}},'Choose a Pokémon Tool or Technical Machine from your deck; shuffle.');
atk(51,0,{type:'copyAttack',source:'opponentActive',requiresCopiedCost:true},'Copy one opposing Active attack if Ditto can pay its Energy cost.');
atk(56,0,{type:'benchDamage',side:'opponent',all:true,amount:10},'10 damage to each opponent Benched Pokémon; no Weakness/Resistance.');
atk(57,0,{type:'damage',target:'opponentActive',amount:10},'Place one damage counter on the defender, not attack damage.');
atk(58,1,{type:'neoRule',rule:'skyridge:syncroblast'},'40 damage with equal Energy card counts, or 10 otherwise.');
atk(60,1,{type:'benchCountDamage',side:'self',filter:{name:['Zubat','Golbat','Crobat']},amount:10},'30 plus 10 for each Zubat, Golbat or Crobat on your Bench.');
atk(64,1,{type:'neoRule',rule:'skyridge:angryHorn'},'50 damage rather than 30 if Heracross has at least 40 damage.');
atk(69,0,status('sleep'),'Nightmare: Sleep.');
atk(71,0,{type:'searchChosen',source:'deck',amount:1,filter:{kind:'trainer',trainerType:'Supporter'}},'Choose a Supporter from your deck and shuffle.');
atk(75,0,flip({type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon',evolvesFrom:'Magikarp'}}),'Heads: choose a card that evolves from Magikarp from your deck.');
atk(76,0,flip(status('paralysis')),'Thunder Wave: heads Paralyze.');
atk(79,0,{type:'selectedDamage',target:'opponentPokemon',amount:10,ignoreWeakness:true,ignoreResistance:true},'Choose any opposing Pokémon and put one damage counter on it.');
atk(79,1,{type:'selectedDamage',target:'opponentPokemon',amount:20,filter:{damaged:true},ignoreWeakness:true,ignoreResistance:true},'20 to a damaged opposing Pokémon, ignoring Weakness and Resistance.');
atk(80,1,flip({type:'discardEnergyCard',target:'opponentActive',amount:1}),'Heads: discard one Energy from the defending Pokémon.');
atk(89,1,{type:'coinTierBonus',coins:3,tiers:{0:0,1:10,2:30,3:60}},'One / two / three heads adds 10 / 30 / 60 damage respectively.');
atk(90,1,flip(status('paralysis')),'Body Slam: heads Paralyze.');
atk(93,1,{type:'coinDamageStatus',coins:3,amount:20,minHeads:1,status:'poison'},'20 damage per heads; if at least one heads, Poison.');
atk(103,0,{type:'neoRule',rule:'skyridge:energyHealing'},'Remove 20 damage per Energy card attached to Staryu.');
atk(111,0,{type:'neoRule',rule:'skyridge:healingDust'},'Flip two coins; heal 10 per heads from every friendly Pokémon.');
atk(111,1,{type:'neoRule',rule:'skyridge:miraclePowder'},'Heads: choose one of five Special Conditions for the defending Pokémon.');
atk(145,0,{type:'neoRule',rule:'skyridge:empathicHealing'},'Heal 20 from Celebi and each Pokémon matching its current type.');
atk(145,1,flip(status('confusion')),'Mind Bend: heads Confuse.');


// Additional attack resolution paths keep Energy Zone and discard-pile card
// identities separate, and expose concrete targeting choices.
atk(17,0,{type:'neoRule',rule:'skyridge:eruption'},'Discard the top card of each deck: 20 extra damage per discarded Fire Energy card.');
atk(24,1,{type:'neoRule',rule:'skyridge:trample'},'For each Benched Pokémon on both sides, flip: heads deals 20 damage to it.');
atk(27,0,{type:'neoRule',rule:'skyridge:zzzap'},'Put 20 damage on every Pokémon in play with a Poké-Power or Poké-Body.');
atk(67,0,{type:'neoRule',rule:'skyridge:energyHeal'},'Choose a Pokémon with Energy attached and heal 10 from it.');
atk(81,0,{type:'neoRule',rule:'skyridge:callNidoran'},'Bench a Basic Nidoran female or male from your deck and shuffle.');
atk(84,0,{type:'neoRule',rule:'skyridge:maxVoltage'},'Discard all attached Lightning Energy; 20 plus 10 for each card discarded.');
atk(90,0,{type:'neoRule',rule:'skyridge:callFriends'},'Bench one Baby or Basic Pokémon from your deck, then shuffle.');

// Functional passive and activated power definitions. Each is backed by the
// corresponding core legality/energy/recovery hook, rather than a UI-only tag.
powers[4]=passive('Water Immunity',{type:'neoRule',rule:'skyridge:waterImmunity'});
powers[21]=passive('Fire Immunity',{type:'neoRule',rule:'skyridge:fireImmunity'});
powers[14]=passive('Primal Aura',{type:'neoRule',rule:'skyridge:primalAura'});
// Prevent attack effects (including Special Conditions), NOT the printed attack damage.
powers[16]=passive('Immunity',{type:'preventEffects',duration:'whileInPlay'});
powers[23]={name:'Primal Stare',type:'passive',activeOnly:true,effect:{type:'actionLock',cardType:'EvolutionActive',side:'opponent',duration:'whileActive'}};
powers[26]={name:'Strange Spiral',type:'activated',activeOnly:true,oncePerTurn:true,effect:{type:'neoRule',rule:'skyridge:strangeSpiral'}};
powers[31]=passive('Rare Metal',{type:'neoRule',rule:'skyridge:rareMetal'});
powers[34]={name:'Good Neighbor',type:'activated',benchOnly:true,oncePerTurn:true,effect:{type:'neoRule',rule:'skyridge:goodNeighbor'}};
powers[35]=passive('Synchronicity',{type:'neoRule',rule:'skyridge:synchronicity'});
powers[37]=passive('Thick Shell',{type:'modifier',stat:'damageReduction',amount:10,duration:'whileInPlay',scope:'self',opponentFilter:{evolved:true}});
powers[51]=passive('Prismatic Body',{type:'neoRule',rule:'skyridge:prismaticBody'});
powers[53]=passive('Slippery Skin',{type:'neoRule',rule:'skyridge:slipperySkin'});
// New attack effects with verified legal options/choice timing.
atk(16,0,{type:'neoRule',rule:'skyridge:dragOff'},'Before 20 damage, choose an opposing Benched Pokémon to switch in.');
atk(31,1,{type:'neoRule',rule:'skyridge:metalTail'},'Choose 40 damage normally, or flip: heads 80, tails none.');
atk(35,0,{type:'neoRule',rule:'skyridge:warpHole'},'Heads: choose a card in your discard pile to place on top of your deck.');

// v0.69.150: remaining Skyridge rules. All rules are dispatched to concrete
// battle handlers; the same effect applies to the numbered and Holo print.
const sky=(rule)=>({type:'neoRule',rule:'skyridge:'+rule});
const skyAttack=(n,i,rule,description)=>atk(n,i,sky(rule),description);
const skyPower=(n,name,type,rule,extras={})=>powers[n]={name,type,effect:sky(rule),...extras};
const skyTrainer=(n,rule,text,extra={})=>trainers[n]={effect:sky(rule),text,...extra};
for(const [n,i,r,text] of [
 [3,0,'shake','After 10 damage, the opponent chooses a Benched Pokémon to switch Active.'],
 [3,1,'whiteFlames','70 damage; discard every attached Fire Energy card.'],
 [4,0,'freezeSolid','10 damage; heads attach one discarded Water Energy to Articuno.'],
 [4,1,'iceCyclone','50 damage; heads 10 to each opposing Bench, tails 10 to all your Pokémon.'],
 [5,0,'needleRush','Four coin flips: 10 base, then 10/20/50/90 extra for 1/2/3/4 heads.'],
 [8,1,'burnBooster','40 damage; discard one attached Energy to attack, plus 10 if it was Fire.'],
 [9,0,'spinningBlow','Flip two coins for 20 damage each; on two heads switch Forretress with your chosen Bench.'],
 [9,1,'scatterbomb','Flip two coins; each heads does 10 to all opponent Bench, each tails to all your Bench.'],
 [11,0,'dragonsVengeance','50 base, 100 if Gyarados already has seven damage counters.'],
 [13,1,'thunderspark','40 damage and 10 to every Benched Pokémon with attached Energy on both sides.'],
 [18,0,'crushingLava','Optionally discard attached basic Fire to Burn, or Fighting to deal 20 extra.'],
 [19,0,'electricBlast','40 damage; optionally discard all Lightning Energy to distribute that many damage counters among enemy Bench.'],
 [20,0,'bounceOff','20 damage; if unequal Energy card counts, the side with fewer switches an Active.'],
 [21,0,'collectFire','10 damage; on heads retrieve a discarded Fire Energy to Moltres.'],
 [21,1,'burningTail','60 damage; on tails discard an attached Fire Energy.'],
 [25,0,'suddenGrowth','Attach any number of basic Energy cards from hand to Politoed.'],
 [25,2,'energySplash','70 damage; move two Water Energy cards to one or two of your Benched Pokémon.'],
 [28,0,'lightningSphere','Optional heads flip: discard all Lightning Energy for 20 additional damage per Energy.'],
 [30,1,'starBack','40 damage; choose a basic Energy from discard and attach it to one of your Pokémon.'],
 [33,1,'aquaTrick','40 damage; on heads move an opposing Active Energy to their Bench.'],
 [38,0,'focusEnergy','Next turn Machoke’s Mega Punch has 80 base damage.'],
 [41,0,'waterOfEvolution','Choose an Omastar from hand and evolve Omanyte.'],
 [41,1,'omanyteDragOff','Before 20 damage optionally switch in a chosen opposing Bench.'],
 [42,0,'surpriseSlash','20 damage; on heads choose one opposing Trainer from hand to shuffle into deck.'],
 [48,0,'energyRecycle','Shuffle one basic Energy card from discard into your deck.'],
 [58,0,'energyPatch','Move one basic attached Energy between your Pokémon.'],
 [63,1,'shadowHand','30 damage; optionally discard up to two hand cards, then draw the same number.'],
 [76,1,'magneticLines','10 damage; on heads move an opposing basic attached Energy to their Bench.'],
 [78,0,'suddenSwipe','10 damage; on heads choose one Energy from opponent hand to shuffle into their deck.'],
 [80,0,'foresight','Look at and reorder top three cards of either player’s deck.'],
 [93,0,'sandTrap','10 damage; also choose up to two opposing Benched Pokémon for 10 damage each.'],
 [97,1,'spinningHead','30 damage; on heads switch Skarmory with chosen Benched Pokémon.'],
 [102,0,'threaten','On heads select a Trainer from opponent hand and shuffle it into their deck.'],
 [102,1,'antlerSwipe','Heads: 20 to Active ignoring W/R; tails: 20 to a chosen opposing Benched Pokémon.'],
 [105,0,'energyPlant','Search deck for basic Energy and attach it to one of your Pokémon.']
])skyAttack(n,i,r,text);
// This Power is suppressed by a Special Condition where the printed text requires it.
skyPower(1,'Ancient Wind','activated','ancientWind',{oncePerTurn:true,activeOnly:true,disabledByStatus:true});
skyPower(2,'Energy Jump','activated','energyJump',{oncePerTurn:true,disabledByStatus:true});
skyPower(3,'Energy Recharge','triggered','energyRecharge',{event:'evolved',activeOnly:true,fromHandOnly:true});
skyPower(5,'Venom Spray','triggered','venomSpray',{event:'evolved',activeOnly:true,fromHandOnly:true});
skyPower(6,'Carry Off','activated','carryOff',{oncePerTurn:true,disabledByStatus:true});
for(const [n,name,type] of [[8,'Self-healing','Fire'],[13,'Self-healing','Lightning'],[33,'Self-healing','Water']])
 skyPower(n,name,'triggered','selfHealing',{event:'energyAttached',energyType:type,fromHandOnly:true});
skyPower(10,'Manipulate','triggered','manipulate',{event:'evolved',activeOnly:true,fromHandOnly:true});
skyPower(11,'Flame Vapor','triggered','flameVapor',{event:'evolved',activeOnly:true,fromHandOnly:true});
skyPower(18,'Streaming Mantle','triggered','streamingMantle',{event:'evolved',activeOnly:true,fromHandOnly:true});
skyPower(19,'Attract Energy','triggered','attractEnergy',{event:'evolved',fromHandOnly:true});
skyPower(22,'Evolution Helper','activated','evolutionHelper',{oncePerTurn:true,benchOnly:true});
skyPower(28,'Pure Body','passive','pureBody');
skyPower(32,'Dark Gaze','passive','darkGaze',{activeOnly:true});
skyPower(40,'Investigate','activated','investigate',{oncePerTurn:true,disabledByStatus:true});
skyPower(45,'Mirror Coat','passive','mirrorCoat');
skyPower(47,'Reconstruction','activated','reconstruction',{oncePerTurn:true});
for(const [n,r,text] of [
 [119,'ancientRuins','Reveal a Supporter-free hand to draw a card (once per turn).'],
 [122,'crystalShard','Attached Pokémon becomes Colorless; discard after it attacks.'],
 [123,'desertShaman','Both players shuffle their hands into decks, then each draws up to four.'],
 [126,'friendBall','Choose an opposing Pokémon, then search your deck for same-type Pokémon.'],
 [127,'hyperPotion','Discard one or two attached basic Energy cards to heal 30 or 50 damage.'],
 [129,'miracleSphereAlpha','Temporary Fire Force attack for evolved Fire, Lightning or Fighting Pokémon.'],
 [130,'miracleSphereBeta','Temporary Freezing Force attack for evolved Fire, Water or Psychic Pokémon.'],
 [131,'miracleSphereGamma','Temporary Thunder Force attack for evolved Grass, Water or Lightning Pokémon.'],
 [132,'mirageStadium','Retreat requires a heads flip; tails blocks that retreat without spending Energy.'],
 [133,'mysteryPlateAlpha','Temporary Desert Burn attack with conditional Prize-card effects.'],
 [134,'mysteryPlateBeta','Temporary Stone Crush attack with conditional Prize-card effects.'],
 [135,'mysteryPlateGamma','Temporary Retro Cave attack with conditional Prize-card effects.'],
 [136,'mysteryPlateDelta','Temporary Healing Oasis attack with conditional Prize-card effects.'],
 [137,'mysteryZone','Once per turn swap an Evolution card from hand for a basic Energy from deck.'],
 [138,'oracle','Choose two cards from deck and place them on top in a chosen order.'],
 [139,'starPiece','Between turns, evolve a damaged Benched Pokémon from deck and discard Star Piece.'],
 [140,'undergroundExpedition','Choose two of the bottom four deck cards to hand and reorder the rest.'],
 [141,'undergroundLake','Once per turn put a discarded Omanyte or Kabuto directly onto your Bench.']
])skyTrainer(n,r,text);
for(const [n,name,move,cost,printed,rule] of [
 [129,'Miracle Sphere α','Fire Force','RCC',30,'miracleSphereAlphaAttack'],
 [130,'Miracle Sphere β','Freezing Force','WCC',30,'miracleSphereBetaAttack'],
 [131,'Miracle Sphere γ','Thunder Force','LCC',30,'miracleSphereGammaAttack'],
 [133,'Mystery Plate α','Desert Burn','C',0,'mysteryPlateAlphaAttack'],
 [134,'Mystery Plate β','Stone Crush','C',0,'mysteryPlateBetaAttack'],
 [135,'Mystery Plate γ','Retro Cave','C',0,'mysteryPlateGammaAttack'],
 [136,'Mystery Plate δ','Healing Oasis','C',0,'mysteryPlateDeltaAttack']
])trainers[n].attacks=[{name:move,cost,damage:printed,effect:sky(rule),text:trainers[n].text}];
// Stadium actions and active Tools are resolved via the standard core interfaces.
for(const n of [119,137,141])trainers[n].effect={type:'stadiumAction',effect:trainers[n].effect};

// A Poké-Body is continuous, while a Poké-Power is a triggered/activated action.
// Ancient Wind silences Bodies only; Dark Gaze silences Benched Powers only.
const bodyNumbers=new Set([4,8,13,14,16,21,23,28,31,32,33,35,37,45,46,51,53,56,70,96,145,146,147,148,149,150]);
for(const [number,ability] of Object.entries(powers))ability.printedPowerType=bodyNumbers.has(Number(number))?'body':'power';
const FORCE_PARTIAL=new Set();
trainers[125]={effect:{type:'searchChosen',source:'discard',amount:4,filter:{basicEnergy:true}},text:'Choose up to four basic Energy cards from your discard pile and return them to hand.'};
// Search effects preserve the user's choice instead of taking random cards.
trainers[120]={effect:{type:'searchChosen',source:'deck',amount:2,filter:{kind:'trainer',trainerType:['Supporter','Stadium']}},text:'Choose up to two Supporter and/or Stadium cards from your deck; shuffle.'};
trainers[121]={effect:{type:'searchChosen',source:'deck',amount:2,filter:{kind:'trainer',nameContains:'Ball'}},text:'Choose up to two Trainer cards whose names contain Ball; shuffle.'};
trainers[124]={effect:{type:'neoRule',rule:'skyridge:fastBall'},text:'Reveal cards from your deck until an Evolution card appears; put it in hand and shuffle the rest.'};
trainers[128]={effect:{type:'neoRule',rule:'skyridge:lureBall'},text:'Flip three coins; choose an Evolution from discard for each heads.'};

const powerUnsafe=new Set();
const fields=new Map(RAW.split('\n').map(line=>line.split('|')).map(a=>[a[0],a]));
function parse(id){const n=String(id).startsWith('H')?HOLOS[Number(id.slice(1))-1]:Number(id);const f=fields.get(String(n));if(!f)throw new Error('Missing Skyridge print '+id);
 const [_,name,kind,t,st,hp,retreat,w,r,evolves,rarity,moves,power]=f;
 const reasons=[],card={id:'ecard3-'+id,setId:'ecard3',number:String(id),name,kind:kind==='P'?'pokemon':kind==='T'?'trainer':'energy',source:'tcg',battleFormat:'classic',rarity:String(id).startsWith('H')?'Rare Holo':rarity,image:`https://images.pokemontcg.io/ecard3/${id}.png`,imageLarge:`https://images.pokemontcg.io/ecard3/${id}_hires.png`};
 if(kind==='P'){
   const attacks=(moves||'').split(';').filter(Boolean).map((item,i)=>{
      const [move,cost,printed='']=item.split('~'),key=n+':'+i,needs=!pure.has(key),rule=effects[key],damage=Number((printed.match(/^\d+/)||[])[0]||0);
      if((needs&&!rule)||FORCE_PARTIAL.has(key))reasons.push(`Unimplemented printed attack: ${move}`);
      if(rule&&!fx.supportsEffect(rule))reasons.push(`Unsupported effect: ${move}`);
      return {name:move,cost,damage:printed.includes('×')?0:damage,damageText:printed||null,text:descriptions[key]||(needs?'Battle rule requires implementation.':`Deal ${damage} damage.`),effect:rule||(!needs?noop:null)};
   });
   if(power&&!powers[n])reasons.push(`Poké-Power / Poké-Body pending: ${power}`);
   if(powerUnsafe.has(n))reasons.push(`Complex printed ability requires battle hooks: ${power}`);
   if(powers[n]&&!fx.supportsEffect(powers[n].effect))reasons.push(`Unsupported Poké-Power: ${power}`);
   Object.assign(card,{stage:st==='0'?'Basic':st==='b'?'Baby':`Stage ${st}`,baby:st==='b',hp:Number(hp),retreat:Number(retreat||0),types:[T[t]],subtype:T[t],weakness:T[w]||null,weaknessValue:w?'×2':null,resistance:T[r]||null,resistanceValue:r?'-30':null,evolvesFrom:evolves||null,attacks,abilities:powers[n]?[powers[n]]:[],retreatZeroWithPsychic:n===46,handEnergyBlocked:n===4?'Water':n===21?'Fire':null,retreatZeroAgainstEvolution:n===53});
 }else if(kind==='T'){
   const subtype=/^(Miracle Sphere|Mystery Plate)/.test(name)?'Tool':['Ancient Ruins','Mirage Stadium','Mystery Zone','Underground Lake'].includes(name)?'Stadium':['Relic Hunter','Apricorn Maker','Desert Shaman','Fisherman','Oracle','Underground Expedition'].includes(name)?'Supporter':['Crystal Shard','Star Piece'].includes(name)?'Tool':'Item';
   if(!trainers[n])reasons.push('Printed Trainer interaction requires battle implementation');
   Object.assign(card,{trainerType:subtype,technicalMachine:/^(Miracle Sphere|Mystery Plate)/.test(name),attacks:trainers[n]?.attacks||[],effect:trainers[n]?.effect||null,text:trainers[n]?.text||'Not yet battle-ready.'});
 }else{
   const specialRules={142:{provides:{Colorless:2},rule:'bounceEnergy',text:'Provides two Colorless; attach only to a Pokémon with basic Energy, returning an attached basic Energy to hand.'},143:{provides:{Colorless:1},rule:'cycloneEnergy',text:'Provides Colorless; when attached from hand to Active, opponent chooses a Bench to promote.'},144:{provides:{Colorless:1},rule:'retroEnergy',text:'Provides Colorless; when attached from hand to an Evolved Pokémon, optionally heal up to 20 and devolve it.'}};
   const sr=specialRules[n];Object.assign(card,{specialEnergy:true,basicEnergy:false,subtype:name.replace(' Energy',''),types:['Colorless'],effect:{type:'specialEnergy',provides:sr.provides},attachRule:sr.rule,text:sr.text});
 }
 return Object.freeze({...card,battleEnabled:!reasons.length,deckEligible:!reasons.length,support:{status:reasons.length?'PARTIAL':'FULL',reasons}});
}
const IDS=[...Array.from({length:150},(_,i)=>String(i+1)),...Array.from({length:32},(_,i)=>'H'+(i+1))];
const CARDS=Object.freeze(IDS.map(parse));const BY_ID=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>BY_ID.get(String(id||''))||null,coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
