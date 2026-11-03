(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexClassicTCGBase1=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const SET=Object.freeze({id:'base1',name:'Base Set',series:'Base',releaseDate:'1999-01-09',cardCount:102});
const NAMES=[
'Alakazam','Blastoise','Chansey','Charizard','Clefairy','Gyarados','Hitmonchan','Machamp','Magneton','Mewtwo','Nidoking','Ninetales','Poliwrath','Raichu','Venusaur','Zapdos','Beedrill','Dragonair','Dugtrio','Electabuzz','Electrode','Pidgeotto','Arcanine','Charmeleon','Dewgong','Dratini',"Farfetch'd",'Growlithe','Haunter','Ivysaur','Jynx','Kadabra','Kakuna','Machoke','Magikarp','Magmar','Nidorino','Poliwhirl','Porygon','Raticate','Seel','Wartortle','Abra','Bulbasaur','Caterpie','Charmander','Diglett','Doduo','Drowzee','Gastly','Koffing','Machop','Magnemite','Metapod','Nidoran♂','Onix','Pidgey','Pikachu','Poliwag','Ponyta','Rattata','Sandshrew','Squirtle','Starmie','Staryu','Tangela','Voltorb','Vulpix','Weedle','Clefairy Doll','Computer Search','Devolution Spray','Impostor Professor Oak','Item Finder','Lass','Pokémon Breeder','Pokémon Trader','Scoop Up','Super Energy Removal','Defender','Energy Retrieval','Full Heal','Maintenance','PlusPower','Pokémon Center','Pokémon Flute','Pokédex','Professor Oak','Revive','Super Potion','Bill','Energy Removal','Gust of Wind','Potion','Switch','Double Colorless Energy','Fighting Energy','Fire Energy','Grass Energy','Lightning Energy','Psychic Energy','Water Energy'];
const ENERGY_CODE={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Colorless:'C'};
const BASIC_ENERGY={97:'Fighting',98:'Fire',99:'Grass',100:'Lightning',101:'Psychic',102:'Water'};
const byId=Object.create(null);
function support(status,reasons=[]){return {status,reasons:[...reasons]};}
function skeleton(number,name){
 const id=`base1-${number}`,kind=number<=69?'pokemon':number<=95?'trainer':'energy';
 const row={id,name,setId:'base1',number:String(number),kind,battleFormat:'classic',source:'tcg',battleEnabled:false,support:support('PARTIAL',['Detailed Base Set mechanics not loaded.']),image:`https://images.pokemontcg.io/base1/${number}.png`,imageLarge:`https://images.pokemontcg.io/base1/${number}_hires.png`};
 if(kind==='trainer')row.trainerType='Item';
 if(BASIC_ENERGY[number])Object.assign(row,{subtype:BASIC_ENERGY[number],basicEnergy:true,support:support('FULL',[]),battleEnabled:false,deckEligible:false});
 if(number===96)Object.assign(row,{subtype:'Colorless',specialEnergy:true,battleEnabled:true,deckEligible:true,support:support('FULL',[]),effect:{type:'specialEnergy',provides:{Colorless:2}}});
 return row;
}
const CARDS=NAMES.map((name,i)=>{const c=skeleton(i+1,name);byId[c.id.toLowerCase()]=c;return c;});
function fullPokemon(number,spec){
 const base=byId[`base1-${number}`],attacks=(spec.attacks||[]).map(a=>({...a,effect:a.effect||null}));
 Object.assign(base,{kind:'pokemon',stage:spec.stage||'Basic',subtype:spec.type,types:[spec.type],hp:spec.hp,retreat:spec.retreat||0,weakness:spec.weakness||null,weaknessValue:spec.weaknessValue||null,resistance:spec.resistance||null,resistanceValue:spec.resistanceValue||null,evolvesFrom:spec.evolvesFrom||null,points:1,attacks,abilities:spec.abilities||[],ability:spec.ability||null,battleEnabled:true,deckEligible:true,support:support('FULL',[]),source:'tcg',setId:'base1'});
 return base;
}
function fullTrainer(number,spec){
 const base=byId[`base1-${number}`];Object.assign(base,{kind:'trainer',trainerType:spec.trainerType||'Item',effect:spec.effect||null,onAttach:spec.onAttach||null,expires:spec.expires||null,...(spec.hp!=null?{hp:spec.hp}:{}),...(spec.abilities?{abilities:spec.abilities}:{}),battleEnabled:true,deckEligible:true,support:support('FULL',[]),source:'tcg',setId:'base1'});return base;
}
// First audited Base Set battle slice. These cards are enabled only because the
// complete printed gameplay on each card maps to existing structured effects.
fullPokemon(7,{type:'Fighting',hp:70,retreat:2,weakness:'Psychic',weaknessValue:'×2',attacks:[{name:'Jab',cost:'F',damage:20},{name:'Special Punch',cost:'FFC',damage:40}]});
fullPokemon(26,{type:'Colorless',hp:40,retreat:1,resistance:'Psychic',resistanceValue:'-30',attacks:[{name:'Pound',cost:'C',damage:10}]});
fullPokemon(43,{type:'Psychic',hp:30,retreat:0,weakness:'Psychic',weaknessValue:'×2',attacks:[{name:'Psyshock',cost:'C',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}}]});
fullPokemon(47,{type:'Fighting',hp:30,retreat:0,weakness:'Grass',weaknessValue:'×2',resistance:'Lightning',resistanceValue:'-30',attacks:[{name:'Dig',cost:'F',damage:10},{name:'Mud Slap',cost:'FF',damage:30}]});
fullPokemon(48,{type:'Colorless',hp:50,retreat:0,weakness:'Lightning',weaknessValue:'×2',resistance:'Fighting',resistanceValue:'-30',attacks:[{name:'Fury Attack',cost:'C',damage:0,damageText:'10×',effect:{type:'coinDamage',coins:2,amount:10,mode:'replace'}}]});
fullPokemon(52,{type:'Fighting',hp:50,retreat:1,weakness:'Psychic',weaknessValue:'×2',attacks:[{name:'Low Kick',cost:'F',damage:20}]});
fullPokemon(56,{type:'Fighting',hp:90,retreat:3,weakness:'Grass',weaknessValue:'×2',attacks:[{name:'Rock Throw',cost:'F',damage:10},{name:'Harden',cost:'FF',damage:0,effect:{type:'preventDamage',target:'self',duration:'opponentTurn',maxDamage:30}}]});
fullPokemon(61,{type:'Colorless',hp:30,retreat:0,weakness:'Fighting',weaknessValue:'×2',resistance:'Psychic',resistanceValue:'-30',attacks:[{name:'Bite',cost:'C',damage:20}]});
fullPokemon(62,{type:'Fighting',hp:40,retreat:1,weakness:'Grass',weaknessValue:'×2',resistance:'Lightning',resistanceValue:'-30',attacks:[{name:'Sand-attack',cost:'F',damage:10,effect:{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'}}]});
// v0.69.64: expanded audited Base Set slice. Each card below has its complete
// printed Pokémon gameplay represented; cards with unresolved Pokémon Powers or
// unusual choice semantics remain PARTIAL.
fullPokemon(3,{type:'Colorless',hp:120,retreat:1,weakness:'Fighting',weaknessValue:'×2',resistance:'Psychic',resistanceValue:'-30',attacks:[
 {name:'Scrunch',cost:'CC',damage:0,effect:{type:'coinFlip',heads:{type:'preventDamage',target:'self',duration:'opponentTurn'}}},
 {name:'Double-edge',cost:'CCCC',damage:80,effect:{type:'selfDamage',amount:80}}
]});
fullPokemon(6,{stage:'Stage 1',evolvesFrom:'Magikarp',type:'Water',hp:100,retreat:3,weakness:'Grass',weaknessValue:'×2',resistance:'Fighting',resistanceValue:'-30',attacks:[
 {name:'Dragon Rage',cost:'WWW',damage:50},
 {name:'Bubblebeam',cost:'WWWW',damage:40,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}}
]});
fullPokemon(9,{stage:'Stage 1',evolvesFrom:'Magnemite',type:'Lightning',hp:60,retreat:1,weakness:'Fighting',weaknessValue:'×2',attacks:[
 {name:'Thunder Wave',cost:'LLC',damage:30,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}},
 {name:'Selfdestruct',cost:'LLCC',damage:80,effect:{type:'sequence',effects:[{type:'benchDamage',side:'self',all:true,amount:20},{type:'benchDamage',side:'opponent',all:true,amount:20},{type:'selfDamage',amount:80}]}}
]});
fullPokemon(10,{type:'Psychic',hp:60,retreat:3,weakness:'Psychic',weaknessValue:'×2',attacks:[
 {name:'Psychic',cost:'PC',damage:10,effect:{type:'energyDamage',source:'opponent',amount:10,countCards:true}},
 {name:'Barrier',cost:'PP',damage:0,effect:{type:'sequence',effects:[{type:'discardEnergy',target:'self',energyType:'Psychic',amount:1,useCost:true},{type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}]}}
]});
fullPokemon(11,{stage:'Stage 2',evolvesFrom:'Nidorino',type:'Grass',hp:90,retreat:3,weakness:'Psychic',weaknessValue:'×2',attacks:[
 {name:'Thrash',cost:'GCC',damage:30,effect:{type:'coinFlip',heads:{type:'bonusDamage',amount:10},tails:{type:'selfDamage',amount:10}}},
 {name:'Toxic',cost:'GGG',damage:20,effect:{type:'status',target:'opponentActive',status:'poison',amount:20}}
]});
fullPokemon(12,{stage:'Stage 1',evolvesFrom:'Vulpix',type:'Fire',hp:80,retreat:1,weakness:'Water',weaknessValue:'×2',attacks:[
 {name:'Lure',cost:'CC',damage:0,effect:{type:'switch',side:'opponent'}},
 {name:'Fire Blast',cost:'RRRR',damage:80,effect:{type:'discardEnergy',target:'self',energyType:'Fire',amount:1,useCost:true}}
]});
fullPokemon(13,{stage:'Stage 2',evolvesFrom:'Poliwhirl',type:'Water',hp:90,retreat:3,weakness:'Grass',weaknessValue:'×2',attacks:[
 {name:'Water Gun',cost:'WWC',damage:30,effect:{type:'energyDamage',source:'self',energyType:'Water',extraAbove:2,maxCount:2,amount:10}},
 {name:'Whirlpool',cost:'WWCC',damage:40,effect:{type:'discardEnergyCard',target:'opponentActive',amount:1}}
]});
fullPokemon(14,{stage:'Stage 1',evolvesFrom:'Pikachu',type:'Lightning',hp:80,retreat:1,weakness:'Fighting',weaknessValue:'×2',attacks:[
 {name:'Agility',cost:'LCC',damage:20,effect:{type:'coinFlip',heads:{type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}}},
 {name:'Thunder',cost:'LLLC',damage:60,effect:{type:'coinFlip',heads:{type:'noop'},tails:{type:'selfDamage',amount:30}}}
]});
fullPokemon(17,{stage:'Stage 2',evolvesFrom:'Kakuna',type:'Grass',hp:80,retreat:0,weakness:'Fire',weaknessValue:'×2',resistance:'Fighting',resistanceValue:'-30',attacks:[
 {name:'Twineedle',cost:'CCC',damage:0,damageText:'30×',effect:{type:'coinDamage',coins:2,amount:30,mode:'replace'}},
 {name:'Poison Sting',cost:'GGG',damage:40,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'poison'}}}
]});
fullPokemon(18,{stage:'Stage 1',evolvesFrom:'Dratini',type:'Colorless',hp:80,retreat:2,resistance:'Psychic',resistanceValue:'-30',attacks:[
 {name:'Slam',cost:'CCC',damage:0,damageText:'30×',effect:{type:'coinDamage',coins:2,amount:30,mode:'replace'}},
 {name:'Hyper Beam',cost:'CCCC',damage:20,effect:{type:'discardEnergyCard',target:'opponentActive',amount:1}}
]});
fullPokemon(19,{stage:'Stage 1',evolvesFrom:'Diglett',type:'Fighting',hp:70,retreat:2,weakness:'Grass',weaknessValue:'×2',resistance:'Lightning',resistanceValue:'-30',attacks:[
 {name:'Slash',cost:'FFC',damage:40},
 {name:'Earthquake',cost:'FFFF',damage:70,effect:{type:'benchDamage',side:'self',all:true,amount:10}}
]});
fullPokemon(20,{type:'Lightning',hp:70,retreat:2,weakness:'Fighting',weaknessValue:'×2',attacks:[
 {name:'Thundershock',cost:'L',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}},
 {name:'Thunderpunch',cost:'LC',damage:30,effect:{type:'coinFlip',heads:{type:'bonusDamage',amount:10},tails:{type:'selfDamage',amount:10}}}
]});
fullPokemon(23,{stage:'Stage 1',evolvesFrom:'Growlithe',type:'Fire',hp:100,retreat:3,weakness:'Water',weaknessValue:'×2',attacks:[
 {name:'Flamethrower',cost:'RRC',damage:50,effect:{type:'discardEnergy',target:'self',energyType:'Fire',amount:1,useCost:true}},
 {name:'Take Down',cost:'RRCC',damage:80,effect:{type:'selfDamage',amount:30}}
]});
fullPokemon(24,{stage:'Stage 1',evolvesFrom:'Charmander',type:'Fire',hp:80,retreat:1,weakness:'Water',weaknessValue:'×2',attacks:[
 {name:'Slash',cost:'CCC',damage:30},
 {name:'Flamethrower',cost:'RRC',damage:50,effect:{type:'discardEnergy',target:'self',energyType:'Fire',amount:1,useCost:true}}
]});
fullPokemon(25,{stage:'Stage 1',evolvesFrom:'Seel',type:'Water',hp:80,retreat:3,weakness:'Lightning',weaknessValue:'×2',attacks:[
 {name:'Aurora Beam',cost:'WWC',damage:50},
 {name:'Ice Beam',cost:'WWCC',damage:30,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}}
]});
fullPokemon(29,{stage:'Stage 1',evolvesFrom:'Gastly',type:'Psychic',hp:60,retreat:1,resistance:'Fighting',resistanceValue:'-30',attacks:[
 {name:'Hypnosis',cost:'P',damage:0,effect:{type:'status',target:'opponentActive',status:'sleep'}},
 {name:'Dream Eater',cost:'PP',damage:50,effect:{type:'attackRequirement',condition:{type:'opponentStatus',status:'sleep'}}}
]});
fullPokemon(30,{stage:'Stage 1',evolvesFrom:'Bulbasaur',type:'Grass',hp:60,retreat:1,weakness:'Fire',weaknessValue:'×2',attacks:[
 {name:'Vine Whip',cost:'GCC',damage:30},
 {name:'Poisonpowder',cost:'GGG',damage:20,effect:{type:'status',target:'opponentActive',status:'poison'}}
]});
fullPokemon(31,{type:'Psychic',hp:70,retreat:2,weakness:'Psychic',weaknessValue:'×2',attacks:[
 {name:'Doubleslap',cost:'P',damage:0,damageText:'10×',effect:{type:'coinDamage',coins:2,amount:10,mode:'replace'}},
 {name:'Meditate',cost:'PPC',damage:20,effect:{type:'damageFromDamage',source:'opponent',amount:1}}
]});
fullPokemon(32,{stage:'Stage 1',evolvesFrom:'Abra',type:'Psychic',hp:60,retreat:3,weakness:'Psychic',weaknessValue:'×2',attacks:[
 {name:'Recover',cost:'PP',damage:0,effect:{type:'sequence',effects:[{type:'discardEnergy',target:'self',energyType:'Psychic',amount:1,useCost:true},{type:'healSelf',amount:999}]}},
 {name:'Super Psy',cost:'PPC',damage:50}
]});
fullPokemon(33,{stage:'Stage 1',evolvesFrom:'Weedle',type:'Grass',hp:80,retreat:2,weakness:'Fire',weaknessValue:'×2',attacks:[
 {name:'Stiffen',cost:'CC',damage:0,effect:{type:'coinFlip',heads:{type:'preventDamage',target:'self',duration:'opponentTurn'}}},
 {name:'Poisonpowder',cost:'GG',damage:20,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'poison'}}}
]});
fullPokemon(34,{stage:'Stage 1',evolvesFrom:'Machop',type:'Fighting',hp:80,retreat:3,weakness:'Psychic',weaknessValue:'×2',attacks:[
 {name:'Karate Chop',cost:'FFC',damage:50,effect:{type:'selfDamagePenalty'}},
 {name:'Submission',cost:'FFCC',damage:60,effect:{type:'selfDamage',amount:20}}
]});
fullPokemon(35,{type:'Water',hp:30,retreat:1,weakness:'Lightning',weaknessValue:'×2',attacks:[
 {name:'Tackle',cost:'C',damage:10},
 {name:'Flail',cost:'W',damage:0,effect:{type:'damageFromDamage',source:'self',amount:1,mode:'replace'}}
]});
fullPokemon(36,{type:'Fire',hp:50,retreat:2,weakness:'Water',weaknessValue:'×2',attacks:[
 {name:'Fire Punch',cost:'RR',damage:30},
 {name:'Flamethrower',cost:'RRC',damage:50,effect:{type:'discardEnergy',target:'self',energyType:'Fire',amount:1,useCost:true}}
]});
fullPokemon(37,{stage:'Stage 1',evolvesFrom:'Nidoran♂',type:'Grass',hp:60,retreat:1,weakness:'Psychic',weaknessValue:'×2',attacks:[
 {name:'Double Kick',cost:'GCC',damage:0,damageText:'30×',effect:{type:'coinDamage',coins:2,amount:30,mode:'replace'}},
 {name:'Horn Drill',cost:'GGCC',damage:50}
]});
fullPokemon(41,{type:'Water',hp:60,retreat:1,weakness:'Lightning',weaknessValue:'×2',attacks:[{name:'Headbutt',cost:'W',damage:10}]});
fullPokemon(42,{stage:'Stage 1',evolvesFrom:'Squirtle',type:'Water',hp:70,retreat:1,weakness:'Lightning',weaknessValue:'×2',attacks:[
 {name:'Withdraw',cost:'WC',damage:0,effect:{type:'coinFlip',heads:{type:'preventDamage',target:'self',duration:'opponentTurn'}}},
 {name:'Bite',cost:'WCC',damage:40}
]});
fullPokemon(44,{type:'Grass',hp:40,retreat:1,weakness:'Fire',weaknessValue:'×2',attacks:[{name:'Leech Seed',cost:'GG',damage:20,effect:{type:'drain',amount:10}}]});
fullPokemon(45,{type:'Grass',hp:40,retreat:1,weakness:'Fire',weaknessValue:'×2',attacks:[{name:'String Shot',cost:'G',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}}]});
fullPokemon(46,{type:'Fire',hp:50,retreat:1,weakness:'Water',weaknessValue:'×2',attacks:[{name:'Scratch',cost:'C',damage:10},{name:'Ember',cost:'RC',damage:30,effect:{type:'discardEnergy',target:'self',energyType:'Fire',amount:1,useCost:true}}]});
fullPokemon(49,{type:'Psychic',hp:50,retreat:1,weakness:'Psychic',weaknessValue:'×2',attacks:[{name:'Pound',cost:'C',damage:10},{name:'Confuse Ray',cost:'PP',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'confusion'}}}]});
fullPokemon(51,{type:'Grass',hp:50,retreat:1,weakness:'Psychic',weaknessValue:'×2',attacks:[{name:'Foul Gas',cost:'GG',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'poison'},tails:{type:'status',target:'opponentActive',status:'confusion'}}}]});
fullPokemon(53,{type:'Lightning',hp:40,retreat:1,weakness:'Fighting',weaknessValue:'×2',attacks:[{name:'Thunder Wave',cost:'L',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}},{name:'Selfdestruct',cost:'LC',damage:40,effect:{type:'sequence',effects:[{type:'benchDamage',side:'self',all:true,amount:10},{type:'benchDamage',side:'opponent',all:true,amount:10},{type:'selfDamage',amount:40}]}}]});
fullPokemon(54,{stage:'Stage 1',evolvesFrom:'Caterpie',type:'Grass',hp:70,retreat:2,weakness:'Fire',weaknessValue:'×2',attacks:[{name:'Stiffen',cost:'CC',damage:0,effect:{type:'coinFlip',heads:{type:'preventDamage',target:'self',duration:'opponentTurn'}}},{name:'Stun Spore',cost:'GG',damage:20,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}}]});
fullPokemon(55,{type:'Grass',hp:40,retreat:1,weakness:'Psychic',weaknessValue:'×2',attacks:[{name:'Horn Hazard',cost:'G',damage:30,effect:{type:'coinAttackGate',heads:{type:'noop'}}}]});
fullPokemon(57,{type:'Colorless',hp:40,retreat:1,weakness:'Lightning',weaknessValue:'×2',resistance:'Fighting',resistanceValue:'-30',attacks:[{name:'Whirlwind',cost:'CC',damage:10,effect:{type:'forceOpponentSwitch'}}]});
fullPokemon(58,{type:'Lightning',hp:40,retreat:1,weakness:'Fighting',weaknessValue:'×2',attacks:[{name:'Gnaw',cost:'C',damage:10},{name:'Thunder Jolt',cost:'LC',damage:30,effect:{type:'coinFlip',heads:{type:'noop'},tails:{type:'selfDamage',amount:10}}}]});
fullPokemon(59,{type:'Water',hp:40,retreat:1,weakness:'Grass',weaknessValue:'×2',attacks:[{name:'Water Gun',cost:'W',damage:10,effect:{type:'energyDamage',source:'self',energyType:'Water',extraAbove:1,maxCount:2,amount:10}}]});
fullPokemon(63,{type:'Water',hp:40,retreat:1,weakness:'Lightning',weaknessValue:'×2',attacks:[{name:'Bubble',cost:'W',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}},{name:'Withdraw',cost:'WC',damage:0,effect:{type:'coinFlip',heads:{type:'preventDamage',target:'self',duration:'opponentTurn'}}}]});
fullPokemon(64,{stage:'Stage 1',evolvesFrom:'Staryu',type:'Water',hp:60,retreat:1,weakness:'Lightning',weaknessValue:'×2',attacks:[{name:'Recover',cost:'WW',damage:0,effect:{type:'sequence',effects:[{type:'discardEnergy',target:'self',energyType:'Water',amount:1,useCost:true},{type:'healSelf',amount:999}]}},{name:'Star Freeze',cost:'WCC',damage:20,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}}]});
fullPokemon(66,{type:'Grass',hp:50,retreat:2,weakness:'Fire',weaknessValue:'×2',attacks:[{name:'Bind',cost:'GC',damage:20,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'paralysis'}}},{name:'Poisonpowder',cost:'GGG',damage:20,effect:{type:'status',target:'opponentActive',status:'poison'}}]});
fullPokemon(68,{type:'Fire',hp:50,retreat:1,weakness:'Water',weaknessValue:'×2',attacks:[{name:'Confuse Ray',cost:'RR',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'confusion'}}}]});
fullPokemon(69,{type:'Grass',hp:40,retreat:1,weakness:'Fire',weaknessValue:'×2',attacks:[{name:'Poison Sting',cost:'G',damage:10,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'poison'}}}]});


// v0.69.64: classic power/stateful mechanics. These stay generic so later
// Wizards-era sets can reuse the same rules primitives.
fullPokemon(1,{stage:'Stage 2',evolvesFrom:'Kadabra',type:'Psychic',hp:80,retreat:3,weakness:'Psychic',weaknessValue:'×2',abilities:[
 {name:'Damage Swap',type:'activated',oncePerTurn:false,disabledByStatus:true,effect:{type:'redistributeDamage',amount:10}}
],attacks:[{name:'Confuse Ray',cost:'PPP',damage:30,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'confusion'}}}]});
fullPokemon(2,{stage:'Stage 2',evolvesFrom:'Wartortle',type:'Water',hp:100,retreat:3,weakness:'Lightning',weaknessValue:'×2',abilities:[
 {name:'Rain Dance',type:'activated',oncePerTurn:false,disabledByStatus:true,effect:{type:'attachEnergy',target:'selfPokemon',amount:1,energyType:'Water',filter:{subtype:'Water'}}}
],attacks:[{name:'Hydro Pump',cost:'WWW',damage:40,effect:{type:'energyDamage',source:'self',energyType:'Water',extraAbove:3,maxCount:2,amount:10}}]});
fullPokemon(4,{stage:'Stage 2',evolvesFrom:'Charmeleon',type:'Fire',hp:120,retreat:3,weakness:'Water',weaknessValue:'×2',resistance:'Fighting',resistanceValue:'-30',abilities:[
 {name:'Energy Burn',type:'activated',oncePerTurn:false,disabledByStatus:true,effect:{type:'energyTypeOverride',energyType:'Fire',duration:'turn'}}
],attacks:[{name:'Fire Spin',cost:'RRRR',damage:100,effect:{type:'discardEnergyCard',target:'self',amount:2,useCost:true}}]});
fullPokemon(5,{type:'Colorless',hp:40,retreat:1,weakness:'Fighting',weaknessValue:'×2',resistance:'Psychic',resistanceValue:'-30',attacks:[
 {name:'Sing',cost:'C',damage:0,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'sleep'}}},
 {name:'Metronome',cost:'CCC',damage:0,effect:{type:'copyAttack',source:'opponentActive',ignoreUseCosts:true}}
]});
fullPokemon(8,{stage:'Stage 2',evolvesFrom:'Machoke',type:'Fighting',hp:100,retreat:3,weakness:'Psychic',weaknessValue:'×2',abilities:[
 {name:'Strikes Back',type:'triggered',event:'damagedByAttack',opponentAttackOnly:true,disabledByStatus:true,effect:{type:'damage',target:'opponentActive',amount:10}}
],attacks:[{name:'Seismic Toss',cost:'FFFC',damage:60}]});
fullPokemon(15,{stage:'Stage 2',evolvesFrom:'Ivysaur',type:'Grass',hp:100,retreat:2,weakness:'Fire',weaknessValue:'×2',abilities:[
 {name:'Energy Trans',type:'activated',oncePerTurn:false,disabledByStatus:true,effect:{type:'redistributeEnergy',amount:1,allowedEnergyTypes:['Grass']}}
],attacks:[{name:'Solarbeam',cost:'GGGG',damage:60}]});
fullPokemon(16,{type:'Lightning',hp:90,retreat:3,resistance:'Fighting',resistanceValue:'-30',attacks:[
 {name:'Thunder',cost:'LLLC',damage:60,effect:{type:'coinFlip',heads:{type:'noop'},tails:{type:'selfDamage',amount:30}}},
 {name:'Thunderbolt',cost:'LLLL',damage:100,effect:{type:'discardEnergyCard',target:'self',amount:'all',useCost:true}}
]});
fullPokemon(27,{type:'Colorless',hp:50,retreat:1,weakness:'Lightning',weaknessValue:'×2',resistance:'Fighting',resistanceValue:'-30',attacks:[
 {name:'Leek Slap',cost:'C',damage:30,effect:{type:'sequence',effects:[{type:'coinAttackGate',heads:{type:'noop'}},{type:'lock',target:'self',action:'attack',attackName:'Leek Slap',duration:'whileInPlay'}]}},
 {name:'Pot Smash',cost:'CCC',damage:30}
]});
fullPokemon(38,{stage:'Stage 1',evolvesFrom:'Poliwag',type:'Water',hp:60,retreat:1,weakness:'Grass',weaknessValue:'×2',attacks:[
 {name:'Amnesia',cost:'WW',damage:0,effect:{type:'chooseAttackLock',duration:'opponentTurn'}},
 {name:'Doubleslap',cost:'WWC',damage:0,damageText:'30×',effect:{type:'coinDamage',coins:2,amount:30,mode:'replace'}}
]});
fullPokemon(39,{type:'Colorless',hp:30,retreat:1,weakness:'Fighting',weaknessValue:'×2',resistance:'Psychic',resistanceValue:'-30',attacks:[
 {name:'Conversion 1',cost:'C',damage:0,effect:{type:'chooseTypeOverride',target:'opponentActive',stat:'weakness',energyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting']}},
 {name:'Conversion 2',cost:'CC',damage:0,effect:{type:'chooseTypeOverride',target:'self',stat:'resistance',energyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting']}}
]});
fullPokemon(40,{stage:'Stage 1',evolvesFrom:'Rattata',type:'Colorless',hp:60,retreat:1,weakness:'Fighting',weaknessValue:'×2',resistance:'Psychic',resistanceValue:'-30',attacks:[
 {name:'Bite',cost:'C',damage:20},
 {name:'Super Fang',cost:'CCC',damage:0,damageText:'?',effect:{type:'remainingHpFractionDamage',divisor:2,roundTo:10,mode:'replace'}}
]});
fullPokemon(50,{type:'Psychic',hp:30,retreat:0,resistance:'Fighting',resistanceValue:'-30',attacks:[
 {name:'Sleeping Gas',cost:'P',damage:0,effect:{type:'coinFlip',heads:{type:'status',target:'opponentActive',status:'sleep'}}},
 {name:'Destiny Bond',cost:'PC',damage:0,effect:{type:'sequence',effects:[{type:'discardEnergyCard',target:'self',energyType:'Psychic',amount:1,useCost:true},{type:'destinyBond',target:'self'}]}}
]});


// v0.69.64: final Base Set identities. These use reusable engine mechanics so
// Jungle and later sets can share the same semantics rather than card-name hacks.
fullPokemon(21,{stage:'Stage 1',evolvesFrom:'Voltorb',type:'Lightning',hp:80,retreat:1,weakness:'Fighting',weaknessValue:'×2',abilities:[{name:'Buzzap',type:'activated',oncePerTurn:false,disabledByStatus:true,effect:{type:'selfKoAttachAsEnergy',amount:2,energyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting']}}],attacks:[{name:'Electric Shock',cost:'LLL',damage:50,effect:{type:'coinFlip',tails:{type:'selfDamage',amount:10}}}]});
fullPokemon(22,{stage:'Stage 1',evolvesFrom:'Pidgey',type:'Colorless',hp:60,retreat:1,weakness:'Lightning',weaknessValue:'×2',resistance:'Fighting',resistanceValue:'-30',attacks:[{name:'Whirlwind',cost:'CC',damage:20,effect:{type:'forceOpponentSwitch'}},{name:'Mirror Move',cost:'CCC',damage:0,effect:{type:'mirrorLastAttackResult'}}]});
fullTrainer(70,{hp:10,effect:{type:'playFossil',hp:10,subtype:'Colorless',canRetreat:false,noPrize:true,countsAsKnockout:false,statusImmune:['sleep','confusion','paralysis','poison'],discardable:true},abilities:[{name:'Discard Clefairy Doll',type:'activated',oncePerTurn:false,effect:{type:'discardSelf'}}]});

fullTrainer(71,{effect:{type:'sequence',effects:[{type:'discardChosenHand',side:'self',amount:2,required:true},{type:'searchChosen',source:'deck',amount:1,filter:{}}]}});
fullTrainer(72,{effect:{type:'devolutionSpray',target:'selfPokemon'}});
fullTrainer(73,{effect:{type:'handShuffle',side:'opponent',draw:7}});
fullTrainer(74,{effect:{type:'sequence',effects:[{type:'discardChosenHand',side:'self',amount:2,required:true},{type:'searchChosen',source:'discard',amount:1,filter:{kind:'trainer'},excludePlayedTrainer:true}]}});
fullTrainer(75,{effect:{type:'shuffleHandMatching',side:'both',filter:{kind:'trainer'}}});
fullTrainer(76,{effect:{type:'rareCandy'}});
fullTrainer(77,{effect:{type:'tradeHandForDeck',handFilter:{kind:'pokemon'},deckFilter:{kind:'pokemon'}}});
fullTrainer(78,{effect:{type:'scoopUp',target:'selfPokemon'}});
fullTrainer(79,{effect:{type:'multiEnergyRemoval'}});
fullTrainer(80,{trainerType:'AttachedTrainer',expires:'endOpponentTurn',effect:{type:'modifier',stat:'damageReduction',amount:20,duration:'whileInPlay',scope:'self'}});
fullTrainer(81,{effect:{type:'sequence',effects:[{type:'discardChosenHand',side:'self',amount:1,required:true},{type:'energyRetrieval',amount:2,energyCardIds:{Fighting:'base1-97',Fire:'base1-98',Grass:'base1-99',Lightning:'base1-100',Psychic:'base1-101',Water:'base1-102'}}]}});
fullTrainer(82,{effect:{type:'removeStatus',target:'selfActive'}});
fullTrainer(83,{effect:{type:'sequence',effects:[{type:'shuffleChosenHand',side:'self',amount:2,required:true},{type:'draw',side:'self',amount:1}]}});
fullTrainer(84,{trainerType:'AttachedTrainer',expires:'endOwnTurn',effect:{type:'modifier',stat:'postWeaknessAttackDamage',amount:10,duration:'whileInPlay',scope:'self'}});
fullTrainer(85,{effect:{type:'pokemonCenter'}});
fullTrainer(86,{effect:{type:'benchFromDiscard',side:'opponent',amount:1,filter:{kind:'pokemon',stage:'Basic'}}});
fullTrainer(87,{effect:{type:'reorderTop',deckSide:'self',count:5}});
fullTrainer(88,{effect:{type:'sequence',effects:[{type:'discardHand',side:'self',amount:999},{type:'draw',side:'self',amount:7}]}});
fullTrainer(89,{effect:{type:'benchFromDiscard',side:'self',amount:1,filter:{kind:'pokemon',stage:'Basic'},damageFraction:0.5}});
fullTrainer(90,{effect:{type:'sequence',effects:[{type:'discardEnergyCard',target:'selfPokemon',amount:1},{type:'heal',target:'selfPokemon',amount:40}]}});
fullTrainer(91,{effect:{type:'draw',side:'self',amount:2}});
fullTrainer(92,{effect:{type:'discardEnergyCard',target:'opponentPokemon',amount:1}});
fullTrainer(93,{effect:{type:'switch',side:'opponent'}});
fullTrainer(94,{effect:{type:'heal',target:'selfPokemon',amount:20}});
fullTrainer(95,{effect:{type:'switch',side:'self'}});

const CLASSIC30_LOANER_DECK=Object.freeze([
 ...Array(4).fill('base1-7'), ...Array(4).fill('base1-52'),
 ...Array(4).fill('base1-26'), ...Array(4).fill('base1-61'),
 ...Array(4).fill('base1-67'), ...Array(4).fill('base1-60'),
 ...Array(4).fill('base1-28'), 'base1-96','base1-96'
]);
function cardById(id){return byId[String(id||'').trim().toLowerCase()]||null;}
function stageOf(detail){const raw=detail?.subtypes?.find(x=>/^(Basic|Stage 1|Stage 2)$/i.test(String(x)))||'Basic';return /^stage 1$/i.test(raw)?'Stage 1':/^stage 2$/i.test(raw)?'Stage 2':'Basic';}
function costCode(cost){return (cost||[]).map(x=>ENERGY_CODE[x]||'C').join('');}
function numericDamage(value){const m=String(value??'').match(/^\s*(\d+)\s*$/);return m?Number(m[1]):null;}
function compileAttack(attack){
 const damage=numericDamage(attack?.damage),text=String(attack?.text||'').trim();
 if(damage==null&&String(attack?.damage||'').trim()!=='')return {ok:false,reason:`Unimplemented variable attack damage: ${attack?.name||'attack'} (${attack?.damage})`};
 if(text)return {ok:false,reason:`Unimplemented attack text: ${attack?.name||'attack'} — ${text}`};
 return {ok:true,value:{name:String(attack?.name||'Attack'),cost:costCode(attack?.cost),damage:Number(damage||0),effect:null,printedText:text}};
}
function normalizePokemon(detail,base){
 const reasons=[],attacks=[];
 for(const a of detail.attacks||[]){const result=compileAttack(a);if(result.ok)attacks.push(result.value);else reasons.push(result.reason);}
 if(Array.isArray(detail.abilities)&&detail.abilities.length)for(const a of detail.abilities)reasons.push(`Unimplemented ${a.type||'Pokémon Power'}: ${a.name||'Ability'} — ${String(a.text||'').trim()}`);
 const hp=Number(detail.hp);if(!Number.isFinite(hp)||hp<=0)reasons.push('Missing or invalid HP.');
 if(!(detail.attacks||[]).length)reasons.push('No attack data loaded.');
 const weakness=detail.weaknesses?.[0]?.type||null,resistanceRow=detail.resistances?.[0]||null;
 return {...base,name:detail.name||base.name,kind:'pokemon',stage:stageOf(detail),subtype:detail.types?.[0]||'Colorless',types:[...(detail.types||[])],hp:Number(hp||0),retreat:Number(detail.convertedRetreatCost??detail.retreatCost?.length??0),weakness,weaknessValue:detail.weaknesses?.[0]?.value||null,resistance:resistanceRow?.type||null,resistanceValue:resistanceRow?.value||null,evolvesFrom:detail.evolvesFrom||null,attacks,ability:null,battleEnabled:reasons.length===0,deckEligible:reasons.length===0,support:support(reasons.length?'PARTIAL':'FULL',reasons),printed:detail};
}
function normalizeTrainer(detail,base){
 const text=String(detail.effect||detail.text||detail.rules?.join(' ')||'').trim();
 const reasons=[text?`Unimplemented Trainer text: ${text}`:'Trainer effect text not loaded.'];
 return {...base,name:detail.name||base.name,kind:'trainer',trainerType:'Item',effect:null,battleEnabled:false,deckEligible:false,support:support('PARTIAL',reasons),printed:detail};
}
function registerDetails(detail){
 const base=cardById(detail?.id);if(!base)throw new Error(`Not a Base Set card: ${detail?.id||''}`);
 if(base.basicEnergy||base.specialEnergy)return base;
 const next=detail.supertype==='Pokémon'||detail.supertype==='Pokemon'?normalizePokemon(detail,base):detail.supertype==='Trainer'?normalizeTrainer(detail,base):{...base,printed:detail};
 Object.assign(base,next);return base;
}
function projectOwnedCards(cards){
 const rows=Array.isArray(cards)?cards:Object.values(cards||{}),out=[];
 for(const owned of rows){if(String(owned?.source||'').toLowerCase()!=='tcg'||String(owned?.setId||owned?.set?.id||'').toLowerCase()!=='base1')continue;const card=cardById(owned.id);if(!card)continue;out.push({gameplayId:card.id,name:card.name,card,quantity:Math.max(0,Number(owned.count==null?1:owned.count)||0),battleEnabled:!!card.battleEnabled,variants:[{id:owned.id,quantity:Math.max(0,Number(owned.count==null?1:owned.count)||0),image:owned.image||null,rarity:owned.rarity||null,row:owned}]});}
 return out.sort((a,b)=>Number(a.card.number)-Number(b.card.number));
}
function coverage(){const counts={FULL:0,PARTIAL:0,UNSUPPORTED:0};for(const c of CARDS)counts[c.support.status]=(counts[c.support.status]||0)+1;return {...counts,total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,deckEligible:CARDS.filter(c=>c.deckEligible).length};}
return {SET,CARDS,ENERGY_CODE,CLASSIC30_LOANER_DECK,cardById,registerDetails,projectOwnedCards,coverage};
});
