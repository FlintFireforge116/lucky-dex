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
 {name:'Rain Dance',type:'activated',oncePerTurn:false,disabledByStatus:true,effect:{type:'attachEnergy',target:'selfPokemon',source:'hand',amount:1,energyType:'Water',filter:{subtype:'Water'}}}
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

// Human-readable explanations for every playable Base Set effect. These are
// concise descriptions of the implemented card mechanics, not UI guesses based
// on a generic effect.type. They follow the card identity across deck/battle UI.
// Printed cards without an effect deliberately have no extra rules paragraph.
const BASE1_POKEMON_RULES={
  1:{powers:{'Damage Swap':'During your turn, move one damage counter between your Pokémon as often as you like, but not if the move would Knock Out the receiving Pokémon. This power cannot be used while Alakazam has a Special Condition.'},attacks:{'Confuse Ray':'Flip a coin. On heads, the Defending Pokémon becomes Confused.'}},
  2:{powers:{'Rain Dance':'During your turn, you may attach extra Water Energy from your hand to your Water Pokémon. You may repeat this while Blastoise is able to use its power.'},attacks:{'Hydro Pump':'Deals 10 more damage for each extra Water Energy attached beyond the first three, up to 20 extra damage.'}},
  3:{attacks:{'Scrunch':'Flip a coin. On heads, Chansey takes no attack damage during your opponent’s next turn, although other attack effects still apply.','Double-edge':'Chansey also deals 80 damage to itself.'}},
  4:{powers:{'Energy Burn':'During your turn, you can make all Energy attached to Charizard count as Fire Energy until the turn ends. This power is unavailable while Charizard has a Special Condition.'},attacks:{'Fire Spin':'Discard 2 Energy cards attached to Charizard to use this attack.'}},
  5:{attacks:{'Sing':'Flip a coin. On heads, the Defending Pokémon falls Asleep.','Metronome':'Choose an attack on the Defending Pokémon. Metronome copies that attack without paying its usual Energy or discard costs.'}},
  6:{attacks:{'Bubblebeam':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.'}},
  8:{powers:{'Strikes Back':'When Machamp is damaged by an opponent’s attack while Active, deal 10 damage back to the attacking Pokémon.'}},
  9:{attacks:{'Thunder Wave':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.','Selfdestruct':'Also deal 20 damage to every Benched Pokémon on both sides and 80 damage to Magneton itself.'}},
  10:{attacks:{'Psychic':'Adds 10 damage for every Energy card attached to the Defending Pokémon.','Barrier':'Discard 1 Psychic Energy attached to Mewtwo. Prevent attack damage and effects against it during your opponent’s next turn.'}},
  11:{attacks:{'Thrash':'Flip a coin. On heads, add 10 damage to this attack; on tails, Nidoking takes 10 damage.','Toxic':'Poison the Defending Pokémon. This stronger Poison places two damage counters between turns.'}},
  12:{attacks:{'Lure':'Your opponent must switch their Active Pokémon with a Benched Pokémon.','Fire Blast':'Discard 1 Fire Energy attached to Ninetales to use this attack.'}},
  13:{attacks:{'Water Gun':'Adds 10 damage for each Water Energy beyond the first two, up to 20 bonus damage.','Whirlpool':'Discard one Energy card attached to the Defending Pokémon.'}},
  14:{attacks:{'Agility':'Flip a coin. On heads, prevent all damage and effects of attacks against Raichu during your opponent’s next turn.','Thunder':'Flip a coin. On tails, Raichu also takes 30 damage.'}},
  15:{powers:{'Energy Trans':'During your turn, move Grass Energy between your Pokémon as often as you like. This power is unavailable while Venusaur has a Special Condition.'}},
  16:{attacks:{'Thunder':'Flip a coin. On tails, Zapdos takes 30 damage.','Thunderbolt':'Discard all Energy cards attached to Zapdos to use this attack.'}},
  17:{attacks:{'Twineedle':'Flip two coins. Deal 30 damage for each heads.','Poison Sting':'Flip a coin. On heads, the Defending Pokémon becomes Poisoned.'}},
  18:{attacks:{'Slam':'Flip two coins. Deal 30 damage for each heads.','Hyper Beam':'Discard one Energy card attached to the Defending Pokémon.'}},
  19:{attacks:{'Earthquake':'Also deal 10 damage to each of your own Benched Pokémon.'}},
  20:{attacks:{'Thundershock':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.','Thunderpunch':'Flip a coin. On heads, add 10 damage; on tails, Electabuzz takes 10 damage.'}},
  21:{powers:{'Buzzap':'Knock Out Electrode and attach it to another of your Pokémon as a Special Energy card providing two Energy of a chosen basic type.'},attacks:{'Electric Shock':'Flip a coin. On tails, Electrode takes 10 damage.'}},
  22:{attacks:{'Whirlwind':'After the damage, your opponent must switch their Active Pokémon with one from their Bench.','Mirror Move':'Copy the effects of the last attack that damaged Pidgeotto during your opponent’s previous turn.'}},
  23:{attacks:{'Flamethrower':'Discard 1 Fire Energy attached to Arcanine to use this attack.','Take Down':'Arcanine also takes 30 damage.'}},
  24:{attacks:{'Flamethrower':'Discard 1 Fire Energy attached to Charmeleon to use this attack.'}},
  25:{attacks:{'Ice Beam':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.'}},
  27:{attacks:{'Leek Slap':'Flip a coin. On tails, this attack fails. Farfetch’d can use Leek Slap only once while it remains in play.'}},
  29:{attacks:{'Hypnosis':'The Defending Pokémon becomes Asleep.','Dream Eater':'This attack only works when the Defending Pokémon is Asleep.'}},
  30:{attacks:{'Poisonpowder':'The Defending Pokémon becomes Poisoned.'}},
  31:{attacks:{'Doubleslap':'Flip two coins. Deal 10 damage for each heads.','Meditate':'Deals 10 extra damage for each damage counter already on the Defending Pokémon.'}},
  32:{attacks:{'Recover':'Discard 1 Psychic Energy attached to Kadabra, then remove all damage counters from Kadabra.'}},
  33:{attacks:{'Stiffen':'Flip a coin. On heads, prevent attack damage to Kakuna during your opponent’s next turn.','Poisonpowder':'Flip a coin. On heads, the Defending Pokémon becomes Poisoned.'}},
  34:{attacks:{'Karate Chop':'This attack deals 10 less damage for each damage counter on Machoke.','Submission':'Machoke also takes 20 damage.'}},
  35:{attacks:{'Flail':'Deals 10 damage for each damage counter on Magikarp.'}},
  36:{attacks:{'Flamethrower':'Discard 1 Fire Energy attached to Magmar to use this attack.'}},
  37:{attacks:{'Double Kick':'Flip two coins. Deal 30 damage for each heads.'}},
  38:{attacks:{'Amnesia':'Choose one attack on the Defending Pokémon. It cannot use that attack during your opponent’s next turn.','Doubleslap':'Flip two coins. Deal 30 damage for each heads.'}},
  39:{attacks:{'Conversion 1':'Choose a type. The Defending Pokémon’s Weakness becomes that type until its next change or it leaves play.','Conversion 2':'Choose a type. Porygon’s Resistance becomes that type until its next change or it leaves play.'}},
  40:{attacks:{'Super Fang':'Deal damage equal to half the Defending Pokémon’s remaining HP, rounded up to the nearest 10.'}},
  42:{attacks:{'Withdraw':'Flip a coin. On heads, prevent all damage to Wartortle from attacks during your opponent’s next turn.'}},
  43:{attacks:{'Psyshock':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.'}},
  44:{attacks:{'Leech Seed':'If this attack deals damage, heal 10 damage from Bulbasaur.'}},
  45:{attacks:{'String Shot':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.'}},
  46:{attacks:{'Ember':'Discard 1 Fire Energy attached to Charmander to use this attack.'}},
  48:{attacks:{'Fury Attack':'Flip two coins. Deal 10 damage for each heads.'}},
  49:{attacks:{'Confuse Ray':'Flip a coin. On heads, the Defending Pokémon becomes Confused.'}},
  50:{attacks:{'Sleeping Gas':'Flip a coin. On heads, the Defending Pokémon becomes Asleep.','Destiny Bond':'Discard 1 Psychic Energy from Gastly. If Gastly is knocked out by an attack on your opponent’s next turn, the attacking Pokémon is also knocked out.'}},
  51:{attacks:{'Foul Gas':'Flip a coin. On heads, the Defending Pokémon becomes Poisoned; on tails, it becomes Confused.'}},
  53:{attacks:{'Thunder Wave':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.','Selfdestruct':'Also deal 10 damage to every Benched Pokémon on both sides and 40 damage to Magnemite itself.'}},
  54:{attacks:{'Stiffen':'Flip a coin. On heads, prevent attack damage to Metapod during your opponent’s next turn.','Stun Spore':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.'}},
  55:{attacks:{'Horn Hazard':'Flip a coin. On tails, the attack does nothing.'}},
  56:{attacks:{'Harden':'During your opponent’s next turn, prevent attack damage of 30 or less against Onix.'}},
  57:{attacks:{'Whirlwind':'After dealing damage, your opponent must switch their Active Pokémon with a Benched Pokémon.'}},
  58:{attacks:{'Thunder Jolt':'Flip a coin. On tails, Pikachu takes 10 damage.'}},
  59:{attacks:{'Water Gun':'Deals 10 more damage for each extra Water Energy attached beyond the first, up to 20 extra damage.'}},
  62:{attacks:{'Sand-attack':'If the Defending Pokémon tries to attack during your opponent’s next turn, they must flip a coin. On tails, the attack fails.'}},
  63:{attacks:{'Bubble':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.','Withdraw':'Flip a coin. On heads, prevent attack damage to Squirtle during your opponent’s next turn.'}},
  64:{attacks:{'Recover':'Discard 1 Water Energy attached to Starmie, then heal all damage from Starmie.','Star Freeze':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.'}},
  66:{attacks:{'Bind':'Flip a coin. On heads, the Defending Pokémon becomes Paralyzed.','Poisonpowder':'The Defending Pokémon becomes Poisoned.'}},
  68:{attacks:{'Confuse Ray':'Flip a coin. On heads, the Defending Pokémon becomes Confused.'}},
  69:{attacks:{'Poison Sting':'Flip a coin. On heads, the Defending Pokémon becomes Poisoned.'}}
};
const BASE1_TRAINER_RULES={
  70:'Play Clefairy Doll as a 10 HP Basic Pokémon. It cannot retreat, has no Special Conditions and gives up no Prize if knocked out. You may discard it during your turn.',
  71:'Discard 2 other cards from your hand, then search your deck for any 1 card and put it into your hand.',
  72:'Remove an Evolution card from one of your Pokémon and return it to your hand, reverting that Pokémon to its previous stage.',
  73:'Your opponent shuffles their hand into their deck, then draws 7 cards.',
  74:'Discard 2 other cards from your hand. Choose a Trainer card in your discard pile and put it into your hand, excluding the Item Finder you just played.',
  75:'Both players shuffle all Trainer cards from their hands into their decks.',
  76:'Evolve a Basic Pokémon directly into its matching Stage 2 Pokémon from your hand without needing its Stage 1.',
  77:'Trade 1 Basic or Evolution Pokémon from your hand for 1 Basic or Evolution Pokémon from your deck. Show both cards to your opponent, then shuffle your deck afterward.',
  78:'Return one of your Pokémon and all its attached cards to your hand, removing it from play.',
  79:'Discard 1 Energy card attached to one of your Pokémon to remove up to 2 Energy cards from one of your opponent’s Pokémon.',
  80:'Attach to one of your Pokémon. During your opponent’s next turn, attacks deal 20 less damage to that Pokémon. Discard Defender afterward.',
  81:'Discard a card from your hand to recover up to 2 Basic Energy cards from your discard pile.',
  82:'Remove all Special Conditions from your Active Pokémon.',
  83:'Shuffle 2 cards from your hand into your deck, then draw 1 card.',
  84:'Attach to one of your Pokémon. Its attacks deal 10 more damage to your opponent’s Active Pokémon this turn. Discard PlusPower afterward.',
  85:'Remove all damage counters from each of your Pokémon, then discard all Energy cards attached to any Pokémon healed this way.',
  86:'Choose a Basic Pokémon from your opponent’s discard pile and put it onto their Bench.',
  87:'Look at the top 5 cards of your deck and put them back in any order.',
  88:'Discard your hand, then draw 7 cards.',
  89:'Put a Basic Pokémon from your discard pile onto your Bench with damage counters equal to half its HP.',
  90:'Discard 1 Energy card attached to one of your Pokémon, then heal up to 40 damage from that Pokémon.',
  91:'Draw 2 cards.',
  92:'Choose an Energy card attached to one of your opponent’s Pokémon and discard it.',
  93:'Choose one of your opponent’s Benched Pokémon to replace their Active Pokémon.',
  94:'Heal 20 damage from one of your Pokémon.',
  95:'Switch your Active Pokémon with one of your Benched Pokémon.'
};
function applyBase1RulesText(){
  for(const [number,rules] of Object.entries(BASE1_POKEMON_RULES)){
    const card=cardById(`base1-${number}`);
    for(const attack of card?.attacks||[])if(rules.attacks?.[attack.name])attack.text=rules.attacks[attack.name];
    for(const power of card?.abilities||[])if(rules.powers?.[power.name])power.text=rules.powers[power.name];
  }
  for(const [number,description] of Object.entries(BASE1_TRAINER_RULES)){
    const card=cardById(`base1-${number}`);if(card)card.text=description;
  }
  const doll=cardById('base1-70');if(doll?.abilities?.[0])doll.abilities[0].text='Discard Clefairy Doll from play during your turn without giving up a Prize.';
  const dce=cardById('base1-96');if(dce)dce.text='Provides 2 Colorless Energy while attached to a Pokémon. In LuckyDex Classic, this card attaches separately from the once-per-turn Basic Energy Zone placement.';
  for(const [number,type] of Object.entries(BASIC_ENERGY)){
    const card=cardById(`base1-${number}`);if(card)card.text=`Provides 1 ${type} Energy. LuckyDex Classic supplies Basic Energy through the Energy Zone rather than as deck cards.`;
  }
}
applyBase1RulesText();

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
function ownedBaseSetCard(owned){
 if(!owned||typeof owned!=='object')return null;
 const source=String(owned.source||'').toLowerCase();if(source&&source!=='tcg')return null;
 const setId=String(owned.setId||owned.set?.id||'').toLowerCase(),libraryKey=String(owned._librarySetKey||'').toLowerCase(),setName=String(owned.setName||owned.set?.name||'').trim().toLowerCase(),setTotal=Number(owned.setTotal||owned.set?.cardCount?.total||0);
 const isBaseSet=setId==='base1'||setId==='library:bs'||libraryKey==='bs'||(setName==='base set'&&setTotal===102);if(!isBaseSet)return null;
 const direct=cardById(owned.id);if(direct)return direct;
 for(const value of [owned.localId,owned.number,owned._libraryCanonicalId,owned.id]){
  const raw=String(value??'').trim(),match=raw.match(/^(?:base1|bs)?[-_:]?0*(\d{1,3})$/i);if(!match)continue;const number=Number(match[1]);if(number>=1&&number<=SET.cardCount)return cardById(`base1-${number}`);
 }
 return null;
}
function projectOwnedCards(cards){
 const rows=Array.isArray(cards)?cards:Object.values(cards||{}),grouped=new Map();
 for(const owned of rows){const card=ownedBaseSetCard(owned);if(!card)continue;const quantity=Math.max(0,Number(owned.count==null?1:owned.count)||0),variant={id:owned.id||card.id,quantity,image:owned.image||owned.imageUrl||null,rarity:owned.rarity||null,row:owned},current=grouped.get(card.id);if(current){current.quantity+=quantity;current.variants.push(variant);}else grouped.set(card.id,{gameplayId:card.id,name:card.name,card,quantity,battleEnabled:!!card.battleEnabled,variants:[variant]});}
 return [...grouped.values()].sort((a,b)=>Number(a.card.number)-Number(b.card.number));
}
function coverage(){const counts={FULL:0,PARTIAL:0,UNSUPPORTED:0};for(const c of CARDS)counts[c.support.status]=(counts[c.support.status]||0)+1;return {...counts,total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,deckEligible:CARDS.filter(c=>c.deckEligible).length};}
return {SET,CARDS,ENERGY_CODE,CLASSIC30_LOANER_DECK,cardById,registerDetails,projectOwnedCards,coverage};
});
