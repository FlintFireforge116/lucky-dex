/* Expedition Base Set (ecard1, 2002): original physical TCG rules and identities.
 * Original card details checked against PokemonTCG/pokemon-tcg-data/cards/en/ecard1.json.
 * Non-playable cards stay visible with precise support flags; their printed
 * effects must never silently become effect-free placeholder attacks.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else root.LuckyDexClassicTCGExpedition=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'ecard1',name:'Expedition Base Set',series:'E-Card',releaseDate:'2002-09-15',cardCount:165});
const TYPES={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless',D:'Darkness',M:'Metal'};
const noop={type:'noop'},par=status=>({type:'status',target:'opponentActive',status}),selfStatus=status=>({type:'status',target:'selfActive',status});
const seq=(...effects)=>({type:'sequence',effects});
const flip=(heads,tails=noop)=>({type:'coinFlip',heads,tails});
const coins=(count,amount)=>({type:'coinDamage',coins:count,amount,mode:'replace'});
const bonus=amount=>({type:'bonusDamage',amount});
const recoil=amount=>({type:'selfDamage',amount});
const gate=()=>({type:'coinAttackGate',heads:noop});
const exp=rule=>({type:'neoRule',rule:'expedition:'+rule});
const ATTACKS=Object.create(null),POWERS=Object.create(null),TRAINERS=Object.create(null);
function attack(n,index,effect,text){ATTACKS[n+':'+index]={effect,text};}
function plain(n,...indices){for(const i of indices)attack(n,i,noop,'Deals the printed attack damage.');}
function ability(n,type,effect,{benchOnly=false,oncePerTurn=true,disabledByStatus=true,text=''}={}){POWERS[n]={type,effect,benchOnly,...(type==='activated'?{oncePerTurn}:{}),disabledByStatus,text};}
// The first 32 holo cards and their identical non-holo alternate prints.
attack(1,0,exp('syncroblast'),'80 damage if both Active Pokémon have equal Energy card counts; otherwise 20.');
ability(1,'activated',exp('psymimic'),{text:'Copy an opposing Pokémon attack including its cost, replacing a normal attack.'});
attack(2,0,exp('lightningStrike'),'May discard all attached Lightning Energy to deal 80 instead of 40.');
ability(2,'activated',exp('energyConnect'),{oncePerTurn:false,text:'Move a basic Energy from your Bench to the Active Pokémon.'});
attack(3,0,par('poison'),'Poison the Defending Pokémon.');
attack(3,1,{type:'statusDamage',status:'poison',amount:20},'Deal 20 more damage if the defender is Poisoned.');
attack(4,0,exp('energyCannon'),'10 more damage per extra Energy beyond the attack cost, up to 20 extra.');
ability(4,'activated',exp('jetStream'),{text:'Flip heads to discard an attached Energy from Blastoise and one opposing Active Energy.'});
attack(5,0,flip({type:'healSelf',amount:20}),'Heads: heal 20 from Butterfree.');
ability(5,'activated',{type:'removeStatus',target:'selfActive'},{text:'Remove all Special Conditions from your Active Pokémon.'});
attack(6,0,exp('scorchingWhirlwind'),'Flip two coins: discard two Energy if any tails, all Energy if both tails.');
ability(6,'activated',exp('burningEnergy'),{text:'Treat all basic Energy on your Pokémon as Fire for the rest of the turn.'});
attack(7,0,coins(2,20),'Flip two coins; 20 damage per heads.');
ability(7,'activated',exp('moonlight'),{text:'Put a hand card into deck to search a basic Energy.'});
attack(8,0,flip(par('paralysis')),'Heads Paralyze.');
attack(8,1,coins(4,20),'Four coin flips, 20 per heads.');
attack(9,0,coins(2,40),'Two flips, 40 per heads.');
ability(9,'activated',{type:'modifier',stat:'retreatCost',amount:-9,duration:'turn',scope:'team'},{benchOnly:true,text:'While on the Bench, make your Active Pokémon retreat for free for this turn.'});
plain(10,0);
attack(10,1,seq({type:'benchDamage',amount:10,all:true,side:'opponent'},{type:'benchDamage',amount:10,all:true,side:'self'}),'Deal 10 damage to each Benched Pokémon on both sides.');
attack(11,0,{type:'lock',target:'opponentActive',action:'retreat',duration:'opponentTurn'},'Prevent the Defending Pokémon from retreating during the next turn.');
attack(11,1,gate(),'Tails: attack does nothing.');
attack(12,0,exp('rendingJaws'),'40 damage if the defending Pokémon is undamaged; 70 otherwise.');
ability(12,'activated',exp('majorTsunami'),{text:'Switch the opposing Active and Feraligatr with Benched Pokémon.'});
attack(13,0,{type:'switch',side:'self'},'After damage, switch Gengar with your Benched Pokémon if any.');
ability(13,'activated',exp('chaosMove'),{text:'With opponent on three or fewer Prize cards, move one damage counter between Pokémon.'});
attack(14,0,{type:'damageRule',ignoreResistance:true},'Ignore Resistance.');
ability(14,'passive',{type:'modifier',stat:'damageReduction',amount:10,duration:'whileInPlay',scope:'self'},{text:'Reduce attack damage done to Golem by 10.'});
attack(15,0,flip(par('paralysis')),'Heads Paralyze.');
attack(15,1,gate(),'Tails: attack does nothing.');
attack(16,0,exp('ironFist'),'Heads: 10 additional damage for each damaged Pokémon you have in play.');
ability(16,'activated',{type:'reorderTop',deckSide:'self',count:4},{text:'Rearrange the top four cards of your deck.'});
attack(17,0,flip(exp('energyCatch')),'Heads: take one basic Energy from your discard into your hand.');
attack(18,0,par('poison'),'Poison the Defending Pokémon.');
ability(18,'activated',flip(exp('soothingAroma')),{text:'Heads: heal 10 damage from each of your damaged Pokémon.'});
attack(19,0,{type:'selectedEnergyDamage',target:'opponentPokemon',amount:10},'Choose an opponent Pokémon, place one damage counter per Energy attached to it.');
attack(20,0,flip(par('sleep')),'Heads: opponent Active is Asleep.');
attack(20,1,{type:'energyDamage',source:'opponent',countCards:true,amount:10},'10 extra per Energy attached to the defender.');
attack(21,0,exp('mislead'),'Flip two coins: Confuse if either is heads.');
attack(21,1,exp('etherealFlame'),'Discard all attached Fire Energy; 30 plus 20 for each discarded.');
attack(22,0,exp('energyPatch'),'Move one basic Energy between your Pokémon.');
attack(23,0,flip(bonus(30)),'Heads: +30 damage.');
ability(23,'activated',exp('beatingWings'),{text:'When Active, shuffle one of your Benched Pokémon and attachments into your deck.'});
attack(24,0,exp('waterPunch'),'Flip for every attached Water Energy: add 10 per heads.');
ability(24,'activated',exp('plunge'),{benchOnly:true,text:'Heads: move your Active Energy onto Poliwrath and switch it into the Active position.'});
attack(25,0,flip(exp('plasma')),'Heads: attach a discarded Lightning Energy to Raichu.');
attack(25,1,exp('shockBolt'),'Discard all Lightning Energy on Raichu or attack fails.');
attack(26,0,flip({type:'benchDamage',amount:10,side:'opponent'}),'Heads: deal 10 to a chosen opposing Benched Pokémon.');
plain(26,1);
attack(27,0,flip(bonus(10)),'Heads: 10 extra damage.');
attack(27,1,gate(),'Tails: this attack does nothing.');
attack(28,0,flip(par('burn')),'Heads: Burn the defender.');
ability(28,'activated',exp('heatUp'),{text:'If opponent has more attached Energy, take Fire Energy from deck and attach to Bench.'});
attack(29,0,flip(seq(bonus(10),{type:'benchDamage',amount:10,all:true,side:'opponent'})),'Heads: +10 and 10 to each opposing Benched Pokémon.');
ability(29,'passive',{type:'energyTypeOverride',energyType:'Darkness',target:'self'},{text:'All Energy attached to Tyranitar provides Darkness Energy.'});
attack(30,0,flip(par('paralysis')),'Heads Paralyze.');
ability(30,'activated',exp('harvestBounty'),{text:'When attaching Energy to your Active, you may attach one additional Energy at the same time.'});
attack(31,0,seq(coins(3,30),selfStatus('confusion')),'Three flips for 30 per heads; Vileplume becomes Confused.');
ability(31,'activated',flip(par('poison')),{text:'Heads: poison the opposing Active Pokémon.'});
attack(32,0,flip(par('poison'),par('confusion')),'Heads Poison; tails Confuse.');
attack(32,1,flip(noop,recoil(60)),'Tails: Weezing takes 60 recoil damage.');
// Alternate numbered non-holo prints have genuinely different attacks.
attack(36,0,flip(par('paralysis')),'Heads Paralyze.');attack(36,1,coins(2,40),'Two flips, 40 per heads.');
attack(39,0,gate(),'Tails: Tail Smash does nothing.');attack(39,1,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true},'Discard one Fire Energy.');
plain(46,0);attack(46,1,seq(coins(2,20),bonus(30)),'30 plus 20 per heads from two flips.');
attack(53,0,par('sleep'),'The opponent Active is Asleep.');plain(53,1);
attack(64,0,flip(bonus(20)),'Heads: +20.');attack(64,1,flip({type:'benchDamage',amount:10,all:true,side:'opponent'}),'Heads: 10 to each opposing Bench.');
attack(67,0,{type:'drain',amount:10},'Heal one damage counter if this attack damages the defender.');attack(67,1,coins(3,30),'Three flips, 30 per heads.');
// Uncommon and Common cards: keep every printed status, cost and coin effect.
attack(71,0,flip(par('confusion')),'Heads Confuse.');plain(71,1);
attack(72,0,flip(exp('bindWound')),'Heads: heal 20 damage from a chosen allied Pokémon.');attack(72,1,exp('dogpile'),'10 damage to opponent and self per Pokémon on your Bench.');
attack(73,0,coins(2,20),'Two flips, 20 per heads.');attack(73,1,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true},'Discard one Fire Energy.');
plain(74,0);attack(74,1,recoil(10),'10 self damage.');
attack(75,0,exp('spiralWave'),'Flip until tails; 20 damage per heads.');
attack(76,0,exp('energyDraw'),'Search deck for Basic Energy and attach it to Electabuzz.');attack(76,1,exp('reflectEnergy'),'Move one basic Energy from Electabuzz to a Benched Pokémon.');
plain(77,0);attack(77,1,flip(noop,recoil(20)),'Tails: 20 recoil.');
plain(78,0);attack(78,1,seq(par('confusion'),selfStatus('confusion')),'Both Active Pokémon become Confused.');
attack(79,0,{type:'damageRule',ignoreResistance:true},'Ignore Resistance.');attack(79,1,exp('rockSlide'),'30 to Active, 10 to up to two opposing Bench.');
attack(80,0,par('sleep'),'Put defending Pokémon to Sleep.');attack(80,1,{type:'attackRequirement',condition:{type:'opponentStatus',status:'sleep'}},'Only works while defending Pokémon is Asleep.');
plain(81,0);attack(81,1,{type:'selectedDamage',target:'opponentBench',amount:30,ignoreWeakness:true,ignoreResistance:true},'30 damage to chosen opposing Benched Pokémon.');
attack(82,0,par('sleep'),'Put defending Pokémon to Sleep.');plain(82,1);
attack(83,0,flip(par('paralysis')),'Heads Paralyze.');attack(83,1,par('sleep'),'Put defending Pokémon to Sleep.');
attack(84,0,exp('energyRecall'),'Attach two Basic Energy from discard to Kadabra.');attack(84,1,flip(par('confusion')),'Heads Confuse.');
plain(85,0,1);
attack(86,0,flip(par('burn')),'Heads Burn.');attack(86,1,flip(bonus(10),recoil(10)),'Heads +10, tails 10 recoil.');
plain(87,0);ability(87,'passive',{type:'modifier',stat:'damageReduction',amount:20,duration:'whileInPlay',scope:'self'},{text:'Reduce all attack damage to Metapod by 20.'});
attack(88,0,{type:'forceOpponentSwitch'},'After damage, your opponent chooses a new Active from their Bench.');
plain(89,0);attack(89,1,flip(par('paralysis')),'Heads Paralyze.');plain(90,0);
attack(91,0,flip(par('burn')),'Heads Burn.');plain(91,1);
attack(92,0,coins(2,10),'Two flips, 10 per heads.');attack(92,1,{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'},'Wartortle cannot attack next turn.');
plain(93,0);attack(93,1,flip(par('confusion')),'Heads Confuse.');
plain(94,0);attack(94,1,flip(par('poison')),'Heads Poison.');
attack(95,0,par('sleep'),'Put defending Pokémon to Sleep.');plain(95,1);
plain(96,0);attack(96,1,flip(par('paralysis')),'Heads Paralyze.');
attack(97,0,coins(2,10),'Two flips, 10 per heads.');plain(97,1);
plain(98,0);attack(98,1,flip(par('burn')),'Heads Burn.');
attack(99,0,par('sleep'),'Put defending Pokémon to Sleep.');attack(99,1,coins(2,20),'Two flips, 20 per heads.');
plain(100,0);attack(100,1,par('sleep'),'Put defending Pokémon to Sleep.');
attack(101,0,par('sleep'),'Put defending Pokémon to Sleep.');plain(101,1);
plain(102,0);attack(102,1,coins(3,20),'Three flips, 20 per heads.');
plain(103,0);attack(103,1,gate(),'Tails: attack does nothing.');
attack(104,0,flip(par('burn')),'Heads Burn.');attack(104,1,flip(bonus(20)),'Heads +20.');
plain(105,0);attack(105,1,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true},'Discard one attached Fire Energy.');
attack(106,0,coins(3,10),'Three flips, 10 per heads.');attack(107,0,gate(),'Tails: attack does nothing.');
attack(108,0,flip(par('poison')),'Heads Poison.');attack(109,0,flip(par('sleep'),par('confusion')),'Heads Sleep, tails Confuse.');
attack(110,0,{type:'damageRule',ignoreResistance:true},'Ignore Resistance.');plain(111,0);
attack(112,0,par('sleep'),'Put defending Pokémon to Sleep.');plain(113,0);plain(114,0);attack(114,1,flip(par('confusion')),'Heads Confuse.');
plain(115,0);plain(116,0,1);plain(117,0);attack(117,1,coins(2,20),'Two flips, 20 per heads.');
attack(118,0,{type:'damageFromDamage',source:'self',amount:1},'10 damage per damage counter on Magikarp.');attack(119,0,flip(par('paralysis')),'Heads Paralyze.');
attack(120,0,flip(par('paralysis')),'Heads Paralyze.');plain(120,1);
attack(121,0,coins(2,10),'Two flips, 10 per heads.');attack(121,1,flip({type:'draw',amount:1}),'Heads: draw one card.');
plain(122,0);attack(122,1,par('sleep'),'Put defending Pokémon to Sleep.');
plain(123,0);attack(123,1,coins(3,10),'Three flips, 10 per heads.');
attack(124,0,flip(par('paralysis')),'Heads Paralyze.');plain(124,1);plain(125,0,1);
attack(126,0,flip(par('burn')),'Heads Burn.');plain(126,1);attack(127,0,flip(par('paralysis')),'Heads Paralyze.');
attack(128,0,flip(bonus(20)),'Heads +20.');plain(129,0);attack(129,1,flip(par('paralysis')),'Heads Paralyze.');
attack(130,0,gate(),'Tails: attack does nothing.');plain(131,0);attack(131,1,coins(2,20),'Two flips, 20 per heads.');
plain(132,0);attack(132,1,flip(par('paralysis')),'Heads Paralyze.');
attack(133,0,gate(),'Tails: attack does nothing.');attack(133,1,recoil(20),'20 recoil.');
plain(134,0);attack(134,1,coins(2,20),'Two flips, 20 per heads.');
attack(135,0,flip(par('paralysis')),'Heads Paralyze.');plain(135,1);
attack(136,0,par('sleep'),'Put defending Pokémon to Sleep.');plain(136,1);
// Trainer cards. Supporters retain the one-Supporter-per-turn rule in Classic.
TRAINERS[137]={trainerType:'Supporter',text:'Shuffle one hand card into your deck and draw three.',effect:exp('billsMaintenance')};
TRAINERS[138]={trainerType:'Supporter',text:'Shuffle hand into your deck; draw as many as opponent has in hand.',effect:{type:'handShuffle',side:'self',draw:'opponentHandCount'}};
TRAINERS[139]={trainerType:'Item',text:'Flip twice: search one non-Baby Basic Pokémon per heads.',effect:{type:'coinRepeatEffect',coins:2,effect:{type:'search',amount:1,random:true,filter:{kind:'pokemon',stage:'Basic'}}}};
TRAINERS[140]={trainerType:'Item',text:'Heads: discard one attached opposing Energy card.',effect:flip({type:'chooseTarget',target:'opponentPokemon',effect:{type:'discardEnergyCard',target:'opponentPokemon',amount:1}})};
TRAINERS[141]={trainerType:'Item',text:'Flip three coins: recover Basic Energy from discard per heads.',effect:exp('energyRestore')};
TRAINERS[142]={trainerType:'Supporter',text:'Flip until tails; draw two per heads.',effect:{type:'coinUntilTails',effect:{type:'draw',amount:2}}};
TRAINERS[143]={trainerType:'Item',text:'Look at top seven cards; choose one Pokémon to hand and shuffle the remainder.',effect:exp('masterBall')};
// Technical Machine is deliberately excluded pending a verified borrowed-attack implementation.
TRAINERS[145]={trainerType:'Supporter',text:'Heal one of your Pokémon completely and discard its Energy.',effect:exp('pokemonNurse')};
TRAINERS[146]={trainerType:'Item',text:'Choose opposing Benched Pokémon; flip heads to switch that Pokémon Active.',effect:exp('pokemonReversal')};
TRAINERS[147]={trainerType:'Item',text:'Heads: return up to two Energy from discard to the deck.',effect:exp('powerCharge')};
TRAINERS[148]={trainerType:'Supporter',text:'Search your deck for an Evolution card.',effect:exp('elmsTrainingMethod')};
TRAINERS[149]={trainerType:'Supporter',text:'Shuffle hand into deck then draw five.',effect:{type:'handShuffle',side:'self',draw:5}};
// Strength Charm needs its temporary attack bonus and discard trigger wired together.
TRAINERS[151]={trainerType:'Item',text:'Heads: return a Pokémon and all cards attached to it to hand.',effect:exp('superScoopUp')};
TRAINERS[152]={trainerType:'Item',text:'Opponent switches Active first, then you switch yours.',effect:{type:'neoRule',rule:'doubleGust'}};
TRAINERS[153]={trainerType:'Item',text:'Search deck for a Basic Energy card. Classic30 Energy lives in a separate zone.',effect:exp('energySearch')};
TRAINERS[154]={trainerType:'Item',text:'Remove all Special Conditions from your Active Pokémon.',effect:{type:'removeStatus',target:'selfActive'}};
TRAINERS[155]={trainerType:'Item',text:'Flip two coins, heal 20 damage from one Pokémon per heads.',effect:{type:'neoRule',rule:'mooMooMilk'}};
TRAINERS[156]={trainerType:'Item',text:'Heal 20 damage from one of your Pokémon.',effect:{type:'chooseTarget',target:'selfPokemon',effect:{type:'heal',target:'selfPokemon',amount:20}}};
TRAINERS[157]={trainerType:'Item',text:'Switch your Active Pokémon with one from your Bench.',effect:{type:'switch',side:'self'}};
// Card row format: number|type|stage|HP|retreat|weak|resist|evolution|attacks|power
const ROWS=["1|P|2|100|2|P||Kadabra|Syncroblast.PCC.80|Psymimic","2|L|2|100|2|F||Flaaffy|Lightning Strike.LLCC.40|Energy Connect","3|G|1|70|1|P||Ekans|Poison Spray.G.0;Poison Reaction.CC.20+|","4|W|2|100|2|L||Wartortle|Energy Cannon.WWC.40+|Jet Stream","5|G|2|80|0|R||Metapod|Spiral Drain.GCC.40|Miraculous Powder","6|R|2|120|3|W||Charmeleon|Scorching Whirlwind.RRRR.120|Burning Energy","7|C|1|70|1|F||Clefairy|Doubleslap.CC.20×|Moonlight","8|W|1|80|2|M||Shellder|Lick.CC.10;Auto Fire.WCC.20×|","9|C|2|100|2|||Dragonair|Dragon Tail.LWF.40×|Tailwind","10|F|1|70|1|G|L|Diglett|Mud Slap.F.20;Magnitude.FCC.40|","11|C|1|70|0|L|F|Spearow|Clutch.CC.20;Supersonic Flight.CCC.50|","12|W|2|120|3|L||Croconaw|Rending Jaws.WWCC.70|Major Tsunami","13|P|2|90|1|D|F|Haunter|Hide in Shadows.PPC.40|Chaos Move","14|F|2|100|4|W||Graveler|Rock Tumble.FFCC.60|Rock Body","15|W|1|80|2|L||Krabby|Bubble.W.10;Giant Claw.WWC.70|","16|F|2|120|2|P||Machoke|Iron Fist.FFCC.50+|Terraforming","17|R|b|30|1||||Energy Catch.R.0|","18|G|2|100|2|R|W|Bayleef|Poisonpowder.GGCC.40|Soothing Aroma","19|P|0|50|1|P|||Super Psywave.PC.0|","20|P|0|70|2|P|||Hypnosis.C.0;Psychic.PPC.20+|","21|R|1|80|1|W||Vulpix|Mislead.RC.0;Ethereal Flame.CCC.0|","22|L|b|30|1||||Energy Patch.L.0|","23|C|2|80|0|L|F|Pidgeotto|Sharp Beak.CCC.20+|Beating Wings","24|W|2|100|2|L||Poliwhirl|Water Punch.WWCC.40+|Plunge","25|L|1|80|1|F||Pikachu|Plasma.C.10;Shock Bolt.LLC.60|","26|R|1|70|0|W||Ponyta|Overrun.CC.20;Flame Tail.RRC.40|","27|M|0|60|2|R|G||Steel Beak.MC.20+;Air Cutter.CCC.50|","28|R|2|100|2|W||Quilava|Super Singe.RRCC.50|Heat Up","29|D|2|120|4|F|P|Pupitar|Stamp.DDDD.50+|Dark Aura","30|G|2|100|2|R||Ivysaur|Body Slam.GGCC.40|Harvest Bounty","31|G|2|90|2|P||Gloom|Petal Dance.GC.30×|Poison Pollen","32|G|1|80|2|P||Koffing|Foul Gas.GC.0;Misfire.GGC.60|","36|W|2|100|2|L||Wartortle|Bubble.W.20;Double Cannon.CCC.40×|","39|R|2|100|2|W||Charmeleon|Tail Smash.C.40;Flamethrower.RRC.60|","46|W|2|100|2|L||Croconaw|Slash.C.20;Double Claw.WWC.30+|","53|G|2|100|3|R|W|Bayleef|Sleep Powder.G.20;Solarbeam.GGC.50|","64|R|2|100|2|W||Quilava|Quick Attack.C.10+;Thermal Blast.RRC.40|","67|G|2|100|2|R||Ivysaur|Leech Seed.G.20;Fury Strikes.GCC.30×|","71|G|1|70|1|R|W|Chikorita|Mysterious Powder.C.0;Razor Leaf.GC.30|","72|C|0|90|2|F|||Bind Wound.CC.0;Dogpile.CCC.10×|","73|R|1|80|1|W||Charmander|Double Scratch.CC.20×;Flamethrower.RCC.50|","74|W|1|80|1|L||Totodile|Tackle.CC.20;Take Down.CCC.40|","75|C|1|70|2|||Dratini|Spiral Wave.LW.20×|","76|L|0|60|2|F|||Energy Draw.C.0;Reflect Energy.LC.20|","77|L|1|80|1|F||Mareep|Headbutt.CC.20;Thunder Jolt.LLC.50|","78|G|1|70|1|P||Oddish|Razor Leaf.GC.20;Foul Odor.GCC.30|","79|F|1|80|3|W||Geodude|Rock Hurl.FC.20;Rock Slide.FFC.30|","80|P|1|70|1|D|F|Gastly|Nightmare.PC.20;Dream Eater.PC.50|","81|F|0|60|2|P|||Smash Kick.C.10;Stretch Kick.FFC.0|","82|G|1|80|1|R||Bulbasaur|Sleep Seed.GC.20;Vine Whip.GCC.40|","83|W|0|60|1|M|||Ice Punch.WC.10;Powder Snow.WCC.20|","84|P|1|70|1|P||Abra|Energy Recall.C.0;Confuse Ray.PC.20|","85|F|1|80|1|P||Machop|Punch.CC.20;Mega Kick.FFC.50|","86|R|0|60|1|W|||Flaming Punch.RC.10;Thrash.RCC.30+|","87|G|1|60|2|R||Caterpie|Rollout.C.10|Exoskeleton","88|C|1|60|0|L|F|Pidgey|Whirlwind.CC.20|","89|W|1|70|1|L||Poliwag|Punch.CC.20;Bubblebeam.WCC.30|","90|F|1|70|1|W||Larvitar|Headbutt.F.20|","91|R|1|70|1|W||Cyndaquil|Super Singe.RC.20;Tackle.CCC.30|","92|W|1|80|1|L||Squirtle|Doubleslap.C.10×;Giant Wave.WW.40|","93|P|0|40|1|P|||Scratch.C.10;Confuse Ray.P.0|","94|G|0|50|1|R|||Tackle.C.10;Poison Seed.GC.10|","95|G|0|40|1|R|||Sleep Seed.C.0;Vine Whip.GC.20|","96|G|0|40|1|R|||Headbutt.C.10;Entagling Thread.CC.10|","97|R|0|50|1|W|||Tail Rap.C.10×;Flare.RC.20|","98|R|0|50|1|W|||Gnaw.C.10;Searing Flame.RC.10|","99|G|0|40|1|R|W||Hypnotic Gaze.C.0;Double Scratch.GC.20×|","100|G|0|50|1|R|W||Razor Leaf.G.10;Sleep Powder.CC.10|","101|C|0|50|1|F|||Shining Fingers.C.0;Slap.C.10|","102|W|0|60|2|G|||Tackle.WC.20;Spike Cannon.WCC.20×|","103|F|0|40|1|G|L||Beat.C.10;Bone Smash.FC.30|","104|R|0|40|1|W|||Singe.R.0;Quick Attack.CC.10+|","105|R|0|50|1|W|||Tackle.C.10;Ember.RC.30|","106|F|0|40|1|G|L||Fury Headbutt.F.10×|","107|C|0|40|1||||Dragon Smash.LW.40|","108|G|0|50|1|P|||Poison Sting.G.10|","109|P|0|40|1|D|F||Bad Dream.P.0|","110|F|0|50|1|W|||Rock Hurl.F.10|","111|W|0|50|1|L|||Splash.C.10|","112|G|0|40|1|R|W||Sleep Powder.G.10|","113|D|0|50|1|F|P||Bite.C.10|","114|G|0|50|1|P|||Ram.C.10;Confusion Gas.G.0|","115|W|0|50|2|L|||Crabhammer.WW.30|","116|F|0|50|1|W|||Bite.F.10;Mud Slap.FC.20|","117|F|0|50|1|P|||Punch.F.10;Double Chop.CC.20×|","118|W|0|30|1|L|||Flail.C.10×|","119|L|0|40|1|F|||Thundershock.L.10|","120|W|0|40|1|L|||Bubble.W.10;Tail Slap.CC.20|","121|C|0|50|1|F|||Double Scratch.C.10×;Pay Day.CC.10|","122|G|0|50|1|P|||Tackle.C.10;Sleep Seed.GC.10|","123|C|0|40|1|L|F||Peck.C.10;Fury Strikes.CC.10×|","124|L|0|50|1|F|||Lightning Tail.C.0;Tackle.LC.20|","125|W|0|50|1|L|||Headbutt.C.10;Rollout.WC.20|","126|R|0|40|1|W|||Singe.R.0;Smash Kick.CC.20|","127|W|0|60|1|L|||Stun Needle.WW.20|","128|C|0|30|1|F|||Quick Attack.C.10+|","129|W|0|50|1|L|||Irongrip.W.10;Lick.CC.10|","130|C|0|40|1|L|F||Razor Wind.C.20|","131|W|0|50|1|L|||Wave Splash.W.10;Doubleslap.WC.20×|","132|W|0|40|1|L|||Headbutt.C.10;Bubblebeam.WW.20|","133|C|0|70|2|F|||Horn Hazard.CC.30;Take Down.CC.30|","134|W|0|50|1|L|||Surf.W.10;Double Scratch.CC.20×|","135|W|0|50|1|L|||Paralyzing Gaze.C.0;Bite.WC.20|","136|R|0|50|1|W|||Tail Shake.C.0;Flare.RC.20|"];
const LABELS=[[1,"Alakazam","Rare Holo"],[2,"Ampharos","Rare Holo"],[3,"Arbok","Rare Holo"],[4,"Blastoise","Rare Holo"],[5,"Butterfree","Rare Holo"],[6,"Charizard","Rare Holo"],[7,"Clefable","Rare Holo"],[8,"Cloyster","Rare Holo"],[9,"Dragonite","Rare Holo"],[10,"Dugtrio","Rare Holo"],[11,"Fearow","Rare Holo"],[12,"Feraligatr","Rare Holo"],[13,"Gengar","Rare Holo"],[14,"Golem","Rare Holo"],[15,"Kingler","Rare Holo"],[16,"Machamp","Rare Holo"],[17,"Magby","Rare Holo"],[18,"Meganium","Rare Holo"],[19,"Mew","Rare Holo"],[20,"Mewtwo","Rare Holo"],[21,"Ninetales","Rare Holo"],[22,"Pichu","Rare Holo"],[23,"Pidgeot","Rare Holo"],[24,"Poliwrath","Rare Holo"],[25,"Raichu","Rare Holo"],[26,"Rapidash","Rare Holo"],[27,"Skarmory","Rare Holo"],[28,"Typhlosion","Rare Holo"],[29,"Tyranitar","Rare Holo"],[30,"Venusaur","Rare Holo"],[31,"Vileplume","Rare Holo"],[32,"Weezing","Rare Holo"],[33,"Alakazam","Rare"],[34,"Ampharos","Rare"],[35,"Arbok","Rare"],[36,"Blastoise","Rare"],[37,"Blastoise","Rare"],[38,"Butterfree","Rare"],[39,"Charizard","Rare"],[40,"Charizard","Rare"],[41,"Clefable","Rare"],[42,"Cloyster","Rare"],[43,"Dragonite","Rare"],[44,"Dugtrio","Rare"],[45,"Fearow","Rare"],[46,"Feraligatr","Rare"],[47,"Feraligatr","Rare"],[48,"Gengar","Rare"],[49,"Golem","Rare"],[50,"Kingler","Rare"],[51,"Machamp","Rare"],[52,"Magby","Rare"],[53,"Meganium","Rare"],[54,"Meganium","Rare"],[55,"Mew","Rare"],[56,"Mewtwo","Rare"],[57,"Ninetales","Rare"],[58,"Pichu","Rare"],[59,"Pidgeot","Rare"],[60,"Poliwrath","Rare"],[61,"Raichu","Rare"],[62,"Rapidash","Rare"],[63,"Skarmory","Rare"],[64,"Typhlosion","Rare"],[65,"Typhlosion","Rare"],[66,"Tyranitar","Rare"],[67,"Venusaur","Rare"],[68,"Venusaur","Rare"],[69,"Vileplume","Rare"],[70,"Weezing","Rare"],[71,"Bayleef","Uncommon"],[72,"Chansey","Uncommon"],[73,"Charmeleon","Uncommon"],[74,"Croconaw","Uncommon"],[75,"Dragonair","Uncommon"],[76,"Electabuzz","Uncommon"],[77,"Flaaffy","Uncommon"],[78,"Gloom","Uncommon"],[79,"Graveler","Uncommon"],[80,"Haunter","Uncommon"],[81,"Hitmonlee","Uncommon"],[82,"Ivysaur","Uncommon"],[83,"Jynx","Uncommon"],[84,"Kadabra","Uncommon"],[85,"Machoke","Uncommon"],[86,"Magmar","Uncommon"],[87,"Metapod","Uncommon"],[88,"Pidgeotto","Uncommon"],[89,"Poliwhirl","Uncommon"],[90,"Pupitar","Uncommon"],[91,"Quilava","Uncommon"],[92,"Wartortle","Uncommon"],[93,"Abra","Common"],[94,"Bulbasaur","Common"],[95,"Bulbasaur","Common"],[96,"Caterpie","Common"],[97,"Charmander","Common"],[98,"Charmander","Common"],[99,"Chikorita","Common"],[100,"Chikorita","Common"],[101,"Clefairy","Common"],[102,"Corsola","Common"],[103,"Cubone","Common"],[104,"Cyndaquil","Common"],[105,"Cyndaquil","Common"],[106,"Diglett","Common"],[107,"Dratini","Common"],[108,"Ekans","Common"],[109,"Gastly","Common"],[110,"Geodude","Common"],[111,"Goldeen","Common"],[112,"Hoppip","Common"],[113,"Houndour","Common"],[114,"Koffing","Common"],[115,"Krabby","Common"],[116,"Larvitar","Common"],[117,"Machop","Common"],[118,"Magikarp","Common"],[119,"Mareep","Common"],[120,"Marill","Common"],[121,"Meowth","Common"],[122,"Oddish","Common"],[123,"Pidgey","Common"],[124,"Pikachu","Common"],[125,"Poliwag","Common"],[126,"Ponyta","Common"],[127,"Qwilfish","Common"],[128,"Rattata","Common"],[129,"Shellder","Common"],[130,"Spearow","Common"],[131,"Squirtle","Common"],[132,"Squirtle","Common"],[133,"Tauros","Common"],[134,"Totodile","Common"],[135,"Totodile","Common"],[136,"Vulpix","Common"],[137,"Bill’s Maintenance","Uncommon"],[138,"Copycat","Uncommon"],[139,"Dual Ball","Uncommon"],[140,"Energy Removal 2","Uncommon"],[141,"Energy Restore","Uncommon"],[142,"Mary’s Impulse","Uncommon"],[143,"Master Ball","Uncommon"],[144,"Multi Technical Machine 01","Uncommon"],[145,"Pokémon Nurse","Uncommon"],[146,"Pokémon Reversal","Uncommon"],[147,"Power Charge","Uncommon"],[148,"Professor Elm’s Training Method","Uncommon"],[149,"Professor Oak’s Research","Uncommon"],[150,"Strength Charm","Uncommon"],[151,"Super Scoop Up","Uncommon"],[152,"Warp Point","Uncommon"],[153,"Energy Search","Common"],[154,"Full Heal","Common"],[155,"Moo-Moo Milk","Common"],[156,"Potion","Common"],[157,"Switch","Common"],[158,"Darkness Energy","Rare"],[159,"Metal Energy","Rare"],[160,"Fighting Energy","No Rarity"],[161,"Fire Energy","No Rarity"],[162,"Grass Energy","No Rarity"],[163,"Lightning Energy","No Rarity"],[164,"Psychic Energy","No Rarity"],[165,"Water Energy","No Rarity"]];
// Holo / non-holo pairs have the exact same printed attacks and Powers.
const PAIRED={33:1,34:2,35:3,37:4,38:5,40:6,41:7,42:8,43:9,44:10,45:11,47:12,48:13,49:14,50:15,51:16,52:17,54:18,55:19,56:20,57:21,58:22,59:23,60:24,61:25,62:26,63:27,65:28,66:29,68:30,69:31,70:32};
const SUPPORTED_EXPEDITION=new Set([
 'syncroblast','energyCannon','rendingJaws','ironFist','dogpile','spiralWave',
 'waterPunch','etherealFlame','shockBolt','mislead','scorchingWhirlwind',
 'rockSlide','energyCatch','plasma','energyDraw','energyRecall','energyPatch',
 'reflectEnergy','bindWound','soothingAroma','jetStream','plunge',
 'energyConnect','majorTsunami','heatUp','billsMaintenance','energyRestore',
 'powerCharge','elmsTrainingMethod','pokemonNurse','superScoopUp','energySearch',
 'burningEnergy','moonlight','beatingWings','chaosMove','masterBall','pokemonReversal'
]);
function expeditionEffectSupported(effect){
 if(!effect||typeof effect!=='object')return true;
 if(effect.type==='neoRule'&&String(effect.rule||'').startsWith('expedition:'))
  return SUPPORTED_EXPEDITION.has(effect.rule.slice('expedition:'.length));
 return (!effect.effects||effect.effects.every(expeditionEffectSupported))&&
  (!effect.effect||expeditionEffectSupported(effect.effect))&&
  (!effect.heads||expeditionEffectSupported(effect.heads))&&
  (!effect.tails||expeditionEffectSupported(effect.tails));
}
const variants=new Map(ROWS.map(line=>{const fields=line.split('|');return [Number(fields[0]),fields];}));
function powerFor(n){return POWERS[n]||POWERS[PAIRED[n]]||null;}
function attackFor(n,i){return ATTACKS[n+':'+i]||ATTACKS[PAIRED[n]+':'+i]||null;}
function parseNumbered(n){const label=LABELS[n-1],record=variants.get(n)||variants.get(PAIRED[n]),id=`ecard1-${n}`;
 if(!label||Number(label[0])!==n)throw new Error('Expedition missing indexed print '+n);
 const [_,name,rarity]=label;
 const kind=n<=136?'pokemon':n<=157?'trainer':'energy';
 let data={id,setId:'ecard1',number:String(n),name,rarity,source:'tcg',battleFormat:'classic',kind,image:`https://images.pokemontcg.io/ecard1/${n}.png`,imageLarge:`https://images.pokemontcg.io/ecard1/${n}_hires.png`};
 const reasons=[];
 if(kind==='pokemon'){
  if(!record)throw new Error('Missing Expedition Pokémon statistics: '+n);
  const [,type,stage,hp,retreat,weak,res,evolves,moves,powerName]=record;
  const attacks=(moves||'').split(';').filter(Boolean).map((a,i)=>{
   const [name,cost,printed]=a.split('.'),rule=attackFor(n,i),variable=/[×+?]/.test(printed||''),value=Number(String(printed).replace(/[^0-9]/g,''))||0;
   if(!rule)reasons.push('Missing printed attack behavior for '+name);
   if(rule?.effect&&(!fx.supportsEffect(rule.effect)||!expeditionEffectSupported(rule.effect)))reasons.push(name+' effect unsupported by engine');
   return {name,cost,damage:/×/.test(printed)?0:value,damageText:variable?printed:null,text:rule?.text||'Original printed attack rules not implemented.',effect:rule?.effect||null,unimplemented:!rule};
  });
  const power=powerName?powerFor(n):null;
  if(powerName&&!power)reasons.push('Missing printed Poké-Power/Poké-Body '+powerName);
  if(power&&(!fx.supportsEffect(power.effect)||!expeditionEffectSupported(power.effect)))reasons.push(powerName+' effect unsupported by engine');

  data={...data,stage:stage==='0'?'Basic':stage==='b'?'Baby':'Stage '+stage,baby:stage==='b',hp:Number(hp),retreat:Number(retreat),types:[TYPES[type]],subtype:TYPES[type],weakness:TYPES[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPES[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolves||null,attacks,abilities:powerName&&power?[{name:powerName,...power}]:[]};
 }else if(kind==='trainer'){
  const trainer=TRAINERS[n];if(!trainer?.effect)reasons.push('Printed Trainer/Tool effect not yet implemented');
  else if((!fx.supportsEffect(trainer.effect)||!expeditionEffectSupported(trainer.effect)))reasons.push('Trainer effect unsupported by engine');
  data={...data,trainerType:trainer?.trainerType||(n===144?'Technical Machine':n===150?'Tool':'Item'),text:trainer?.text||'Read original card for the printed effect.',effect:trainer?.effect||null};
 }else{
  const basic=n>=160;
  data={...data,basicEnergy:basic,specialEnergy:!basic,subtype:n===158?'Darkness':n===159?'Metal':name.replace(' Energy',''),types:[n===158?'Darkness':n===159?'Metal':name.replace(' Energy','')],text:basic?'Basic Energy provided by the separate Classic Energy Zone.':n===158?'Provides Darkness; adds 10 attack damage and damages non-Dark Pokémon between turns.':'Provides Metal; reduces incoming damage and attack damage from non-Metal Pokémon.',effect:basic?null:{type:'specialEnergy',provides:{[n===158?'Darkness':'Metal']:1}}};
 }
 const battleEnabled=reasons.length===0;
 return {...data,battleEnabled,deckEligible:battleEnabled&&!data.basicEnergy,support:{status:battleEnabled?'FULL':'PARTIAL',reasons}};
}
const CARDS=Object.freeze(Array.from({length:165},(_,i)=>parseNumbered(i+1)));
if(new Set(CARDS.map(c=>c.id)).size!==165)throw Error('Expedition duplicate numbered print');
const BY_ID=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>BY_ID.get(String(id||'').toLowerCase())||null,
 coverage:()=>({total:165,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
