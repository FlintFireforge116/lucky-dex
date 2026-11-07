/* Legendary Collection (base6, 2002): 110 numbered reprints.
 * Original identities and printed attack/Power signatures checked against
 * PokemonTCG/pokemon-tcg-data/cards/en/base6.json.
 * Reuse ONLY an exact earlier print's gameplay. Differences and unsupported
 * original Powers are explicitly restricted, never represented as vanilla hits.
 */
(function(root,factory){
 const imported=typeof module==='object'&&module.exports;
 const base=imported?require('./tcg-classic-base1.js'):root.LuckyDexClassicTCGBase1;
 const jungle=imported?require('./tcg-classic-jungle.js'):root.LuckyDexClassicTCGJungle;
 const fossil=imported?require('./tcg-classic-fossil.js'):root.LuckyDexClassicTCGFossil;
 const rocket=imported?require('./tcg-classic-team-rocket.js'):root.LuckyDexClassicTCGTeamRocket;
 const fx=imported?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(base,jungle,fossil,rocket,fx);
 if(imported)module.exports=api;else root.LuckyDexClassicTCGLegendaryCollection=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(base,jungle,fossil,rocket,fx){'use strict';
const SET=Object.freeze({id:'base6',name:'Legendary Collection',series:'Legendary Collection',releaseDate:'2002-05-24',cardCount:110});
// # | name | attacks | Pokémon Powers; empty means no moves.
// Matching is strict: a Pokémon with different moves/Powers does NOT borrow a
// convenient same-name card's mechanic from another print.
const DATA=`1|Alakazam|Confuse Ray|Damage Swap
2|Articuno|Freeze Dry;Blizzard|
3|Charizard|Fire Spin|Energy Burn
4|Dark Blastoise|Hydrocannon;Rocket Tackle|
5|Dark Dragonite|Giant Tail|Summon Minions
6|Dark Persian|Fascinate;Poison Claws|
7|Dark Raichu|Surprise Thunder|
8|Dark Slowbro|Fickle Attack|Reel In
9|Dark Vaporeon|Bite;Whirlpool|
10|Flareon|Quick Attack;Flamethrower|
11|Gengar|Dark Mind|Curse
12|Gyarados|Dragon Rage;Bubblebeam|
13|Hitmonlee|Stretch Kick;High Jump Kick|
14|Jolteon|Quick Attack;Pin Missle|
15|Machamp|Seismic Toss|Strikes Back
16|Muk|Sludge|Toxic Gas
17|Ninetales|Lure;Fire Blast|
18|Venusaur|Solarbeam|Energy Trans
19|Zapdos|Thunder;Thunderbolt|
20|Beedrill|Twineedle;Poison Sting|
21|Butterfree|Whirlwind;Mega Drain|
22|Electrode|Tackle;Chain Lightning|
23|Exeggutor|Teleport;Big Eggsplosion|
24|Golem|Avalanche;Selfdestruct|
25|Hypno|Prophecy;Dark Mind|
26|Jynx|Doubleslap;Meditate|
27|Kabutops|Sharp Sickle;Absorb|
28|Magneton|Sonicboom;Selfdestruct|
29|Mewtwo|Energy Control;Telekinesis|
30|Moltres|Wildfire;Dive Bomb|
31|Nidoking|Thrash;Toxic|
32|Nidoqueen|Boyfriends;Mega Punch|
33|Pidgeot|Wing Attack;Hurricane|
34|Pidgeotto|Whirlwind;Mirror Move|
35|Rhydon|Horn Attack;Ram|
36|Arcanine|Flamethrower;Take Down|
37|Charmeleon|Slash;Flamethrower|
38|Dark Dragonair|Tail Strike|Evolutionary Light
39|Dark Wartortle|Doubleslap;Mirror Shell|
40|Dewgong|Aurora Beam;Ice Beam|
41|Dodrio|Rage|Retreat Aid
42|Fearow|Agility;Drill Peck|
43|Golduck|Psyshock;Hyper Beam|
44|Graveler|Harden;Rock Throw|
45|Growlithe|Flare|
46|Haunter|Nightmare|Transparency
47|Ivysaur|Vine Whip;Poisonpowder|
48|Kabuto|Scratch|Kabuto Armor
49|Kadabra|Recover;Super Psy|
50|Kakuna|Stiffen;Poisonpowder|
51|Machoke|Karate Chop;Submission|
52|Magikarp|Tackle;Flail|
53|Meowth|Pay Day|
54|Metapod|Stiffen;Stun Spore|
55|Nidorina|Supersonic;Double Kick|
56|Nidorino|Double Kick;Horn Drill|
57|Omanyte|Water Gun|Clairvoyance
58|Omastar|Water Gun;Spike Cannon|
59|Primeape|Fury Swipes;Tantrum|
60|Rapidash|Stomp;Agility|
61|Raticate|Bite;Super Fang|
62|Sandslash|Slash;Fury Swipes|
63|Seadra|Water Gun;Agility|
64|Snorlax|Body Slam|Thick Skinned
65|Tauros|Stomp;Rampage|
66|Tentacruel|Supersonic;Jellyfish Sting|
67|Abra|Psyshock|
68|Bulbasaur|Leech Seed|
69|Caterpie|String Shot|
70|Charmander|Scratch;Ember|
71|Doduo|Fury Attack|
72|Dratini|Pound|
73|Drowzee|Nightmare|Long-Distance Hypnosis
74|Eevee|Tail Wag;Quick Attack|
75|Exeggcute|Hypnosis;Leech Seed|
76|Gastly|Lick;Energy Conversion|
77|Geodude|Stone Barrage|
78|Grimer|Nasty Goo;Minimized|
79|Machop|Punch;Kick|
80|Magnemite|Thunder Wave;Selfdestruct|
81|Mankey|Mischief;Anger|
82|Nidoran ♀|Fury Swipes;Call for Family|
83|Nidoran ♂|Horn Hazard|
84|Onix|Rock Throw;Harden|
85|Pidgey|Whirlwind|
86|Pikachu|Spark|
87|Ponyta|Smash Kick;Flame Tail|
88|Psyduck|Dizziness;Water Gun|
89|Rattata|Bite|
90|Rhyhorn|Leer;Horn Attack|
91|Sandshrew|Sand-attack|
92|Seel|Headbutt|
93|Slowpoke|Spacing Out;Scavenge|
94|Spearow|Peck;Mirror Move|
95|Squirtle|Bubble;Withdraw|
96|Tentacool|Acid|Cowardice
97|Voltorb|Tackle|
98|Vulpix|Confuse Ray|
99|Weedle|Poison Sting|
100|Full Heal Energy||
101|Potion Energy||
102|Pokémon Breeder||
103|Pokémon Trader||
104|Scoop Up||
105|The Boss's Way||
106|Challenge!||
107|Energy Retrieval||
108|Bill||
109|Mysterious Fossil||
110|Potion||`.trim().split('\n');
// These Base Set details were historically registered by battle-data after all
// modules had loaded. Seed them here first so browser and Node see identical
// Legendary reprints; registerDetails is idempotent.
for(const detail of [
 {id:'base1-28',name:'Growlithe',supertype:'Pokémon',subtypes:['Basic'],hp:'60',types:['Fire'],attacks:[{name:'Flare',cost:['Fire','Colorless'],damage:'20',text:''}],weaknesses:[{type:'Water',value:'×2'}],retreatCost:['Colorless']},
 {id:'base1-60',name:'Ponyta',supertype:'Pokémon',subtypes:['Basic'],hp:'40',types:['Fire'],attacks:[{name:'Smash Kick',cost:['Colorless','Colorless'],damage:'20',text:''},{name:'Flame Tail',cost:['Fire','Fire'],damage:'30',text:''}],weaknesses:[{type:'Water',value:'×2'}],retreatCost:['Colorless']},
 {id:'base1-67',name:'Voltorb',supertype:'Pokémon',subtypes:['Basic'],hp:'40',types:['Lightning'],attacks:[{name:'Tackle',cost:['Colorless'],damage:'10',text:''}],weaknesses:[{type:'Fighting',value:'×2'}],retreatCost:['Colorless']}
])base.registerDetails(detail);
const SOURCE=[...base.CARDS,...jungle.CARDS,...fossil.CARDS,...rocket.CARDS];
const aliases=Object.freeze({'Pin Missle':'Pin Missile','Minimized':'Minimize'}); // original card JSON typo
const exact=(a,b)=>String(aliases[a]||a).toLowerCase()===String(aliases[b]||b).toLowerCase();
const sameName=(a,b)=>String(a||'').replace(/[\s’']/g,'').toLowerCase()===String(b||'').replace(/[\s’']/g,'').toLowerCase();
function matchPrint(name,attacks,powers){
 const expectedAttacks=attacks?attacks.split(';'):[],expectedPowers=powers?powers.split(';'):[];
 return SOURCE.find(c=>sameName(c.name,name)&&
  (c.attacks||[]).length===expectedAttacks.length &&
  (c.abilities||[]).length===expectedPowers.length &&
  expectedAttacks.every((a,i)=>exact(a,c.attacks[i].name))&&
  expectedPowers.every((a,i)=>exact(a,c.abilities[i].name)));
}
function rarity(n){return n<=19?'Rare Holo':n<=35?'Rare':n<=66?'Uncommon':n<=99?'Common':n<=101?'Uncommon':n<=104?'Rare':n<=107?'Uncommon':'Common';}
const missing=[];
const CARDS=DATA.map(line=>{
 const [raw,name,atk,power]=line.split('|'),n=Number(raw),id='base6-'+n;
 const source=n===109?fossil.cardById('base3-62'):matchPrint(name,atk,power);
 if(!source&&n!==29)missing.push(id+' '+name+' (no exact earlier printed moves/Powers)');
 const copied=source?{...source}:n===29?{
   kind:'pokemon',stage:'Basic',hp:60,retreat:2,subtype:'Psychic',types:['Psychic'],weakness:'Psychic',weaknessValue:'×2',resistance:null,resistanceValue:null,evolvesFrom:null,
   attacks:[{name:'Energy Control',cost:'P',damage:0,text:'Flip a coin. If heads, move one Basic Energy attached to an opposing Pokémon to another opposing Pokémon.',effect:{type:'coinFlip',heads:{type:'neoRule',rule:'legendary:energyControl'}}},{name:'Telekinesis',cost:'PPP',damage:0,text:'Deal 30 damage to one opposing Pokémon, ignoring Weakness and Resistance.',effect:{type:'selectedDamage',target:'opponentPokemon',amount:30,ignoreWeakness:true,ignoreResistance:true}}],abilities:[]
 }:{};
 const supported=n===29||!!(source?.battleEnabled&&source?.deckEligible!==false&&
    (source.attacks||[]).every(a=>a.unimplemented!==true&&(!a.effect||fx.supportsEffect(a.effect)))&&
    (source.abilities||[]).every(a=>!a.effect||fx.supportsEffect(a.effect)));
 const reasons=n===29?[]:source?[...(source.support?.reasons||[])]:['Unmapped reprint; exact printed moves/Powers require implementation'];
 if(source&&!supported&&!reasons.length)reasons.push('An original move or Pokémon Power needs engine support');
 return {...copied,id,setId:'base6',number:String(n),name,rarity:rarity(n),
   // Every physical print must give the battle UI readable move text, even
   // when older data omitted the reminder for a damage-only attack.
   attacks:(copied.attacks||[]).map(a=>({...a,text:a.text||(!a.effect&&Number(a.damage)>0?`Deal ${Number(a.damage)} damage.`:'')})),
   source:'tcg',battleFormat:'classic',
   image:`https://images.pokemontcg.io/base6/${n}.png`,imageLarge:`https://images.pokemontcg.io/base6/${n}_hires.png`,
   battleEnabled:supported,deckEligible:supported,
   support:{status:supported?'FULL':'PARTIAL',reasons:supported?[]:reasons},
   originalPrintId:source?.id||null};
});
if(CARDS.length!==110||new Set(CARDS.map(c=>c.id)).size!==110)throw Error('Legendary Collection missing numbered prints');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
 missing,coverage:()=>({total:110,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
