/* Neo Destiny — 113 original English print identities, including eight Shining secret rares.
 * PokemonTCG/pokemon-tcg-data/cards/en/neo4.json (card identities & stats).
 * Supported moves are explicitly declared below; unimplemented Powers/moves are
 * kept visible in the card catalogue but not offered for battle or Auto Build.
 * Printed card artwork is never modified.  Basic Energy uses the separate Zone.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;
 else if(root)root.LuckyDexClassicTCGNeoDestiny=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'neo4',name:'Neo Destiny',series:'Neo',releaseDate:'2002-02-28',cardCount:113,printedTotal:105});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless',D:'Darkness',M:'Metal'};
// No unsupported card is ever treated as an effect-free attacker.
const DATA=`1|Dark Ampharos|P|L|2|70|2|F||Dark Flaaffy|Rare Holo|Shock Bolt~LCC~50|Conductivity
2|Dark Crobat|P|G|2|70|0|P|F|Dark Golbat|Rare Holo|Dark Drain~GG~|Surprise Bite
3|Dark Donphan|P|F|1|60|3|G|L|Phanpy|Rare Holo|Tusk Toss~FF~;Giant Tusk~FFC~50|
4|Dark Espeon|P|P|1|60|0|P||Eevee|Rare Holo|Gouge~C~10+;Psysplash~PCC~|
5|Dark Feraligatr|P|W|2|80|3|G||Dark Croconaw|Rare Holo|Crushing Blow~WWW~50|Scare
6|Dark Gengar|P|P|2|70|2||F|Dark Haunter|Rare Holo|Pull In~PPP~30|Deep Sleep
7|Dark Houndoom|P|R|1|60|1|W||Houndour|Rare Holo|Eerie Howl~C~;Dark Fire~RC~30+|
8|Dark Porygon2|P|C|1|60|1|F|P|Porygon|Rare Holo|Curve Attack~CCC~20|Spatial Distortion
9|Dark Scizor|P|M|1|70|2|R|G|Scyther|Rare Holo|Threaten~CC~;Slash~CCC~30|
10|Dark Typhlosion|P|R|2|80|1|W||Dark Quilava|Rare Holo|Claw Swipe~C~20;Rushing Flames~R~40×|
11|Dark Tyranitar|P|F|2|90|3|G|L|Dark Pupitar|Rare Holo|Mountain Smasher~F~20×;Fling Away~FFFC~50|
12|Light Arcanine|P|R|1|100|2|W||Growlithe|Rare Holo|Gentle Flames~RRC~50|Drive Off
13|Light Azumarill|P|W|1|80|1|L||Marill|Rare Holo|Bubble~W~10;Bubble Jump~WCC~30|
14|Light Dragonite|P|C|2|100|2||F|Light Dragonair|Rare Holo|Light Wave~CCC~40|Miraculous Wind
15|Light Togetic|P|C|1|60|0||F|Togepi|Rare Holo|Sweet Kiss~CC~30|Gift
16|Miracle Energy|E||0||0||||Rare Holo||
17|Dark Ariados|P|G|1|60|2|R||Spinarak|Rare|Entangle~G~;Poison Bind~GGG~30|
18|Dark Magcargo|P|R|1|60|3|W||Slugma|Rare|Ball of Flame~RR~20|Hot Plate
19|Dark Omastar|P|W|2|70|2|G||Dark Omanyte|Rare|Prehistoric Water~W~;Dark Tentacle~WC~30|
20|Dark Slowking|P|P|1|60|2|P||Slowpoke|Rare|Mind Shock~PP~30|Cunning
21|Dark Ursaring|P|C|1|60|2|F|P|Teddiursa|Rare|Provoke~C~;Battle Frenzy~CC~|
22|Light Dragonair|P|C|1|80|2||P|Dratini|Rare|Healing Light~CC~;Protective Wave~CCC~20|
23|Light Lanturn|P|L|1|80|2|F||Chinchou|Rare|Searchlight~L~;Spark~LL~30|
24|Light Ledian|P|G|1|70|0|R|F|Ledyba|Rare|Flash Touch~G~;Comet Punch~GCC~20×|
25|Light Machamp|P|F|2|100|2|P||Light Machoke|Rare|Beatdown~FFF~50|Tag Team
26|Light Piloswine|P|W|1|90|3|G|L|Swinub|Rare|Knock Over~CCC~30|Fluffy Wool
27|Unown [G]|P|P|0|40|1|P|||Rare|Hidden Power~P~10|[Give]
28|Unown [H]|P|P|0|40|1|P|||Rare|Hidden Power~P~10|[Help]
29|Unown [W]|P|P|0|40|1|P|||Rare|Hidden Power~P~10|[Want]
30|Unown [X]|P|P|0|50|1|P|||Rare|Hidden Power~P~10|[XXXXX]
31|Chansey|P|C|0|90|2|F|P||Uncommon|Doubleslap~CC~20×;Egg Toss~CCC~80|
32|Dark Croconaw|P|W|1|60|2|G||Totodile|Uncommon|Clamping Jaw~WW~20|
33|Dark Exeggutor|P|P|1|60|2|P||Exeggcute|Uncommon|Triple Headbutt~C~10×;MAX Burst~PC~20×|
34|Dark Flaaffy|P|L|1|60|1|F||Mareep|Uncommon|High Voltage~L~10;Stun Wave~LC~30|
35|Dark Forretress|P|G|1|60|2|R||Pineco|Uncommon|Armor Up~C~;Explosion~GG~60|
36|Dark Haunter|P|P|1|50|0||F|Gastly|Uncommon|Call Back~P~;Surround~PP~20|
37|Dark Omanyte|P|W|1|40|1|G||Mysterious Fossil|Uncommon|Water Cannon~W~|
38|Dark Pupitar|P|F|1|60|1|G|L|Larvitar|Uncommon|Rock Tackle~FF~40;Explosive Evolution~CCC~|
39|Dark Quilava|P|R|1|60|1|W||Cyndaquil|Uncommon|Incinerate~R~;Rushing Magma~RR~20×|
40|Dark Wigglytuff|P|C|1|60|2|F|P|Jigglypuff|Uncommon|Dark Song~CC~;Slap Awake~CCC~20+|
41|Heracross|P|G|0|60|2|R|||Uncommon|Tackle~GC~20;Charging Horn~GGG~30+|
42|Hitmonlee|P|F|0|60|1|P|||Uncommon|One-Two Kick~FF~20×;Heel Drop~FFF~60|
43|Houndour|P|D|0|40|1||P||Uncommon|Corner~D~;Lunge~CC~30|
44|Jigglypuff|P|C|0|50|1|F|P||Uncommon|Expand~CC~10|
45|Light Dewgong|P|W|1|80|2|L||Seel|Uncommon|Freezing Breath~WW~10;Ice Pillar~WWW~40|
46|Light Flareon|P|R|1|80|1|W||Eevee|Uncommon|Warm Up~R~;Burning Flame~RRC~30+|
47|Light Golduck|P|W|1|80|1|L||Psyduck|Uncommon|Flipper Stroke~W~;Core Blast~PCC~30+|
48|Light Jolteon|P|L|1|70|0|F||Eevee|Uncommon|Pulse Guard~L~;Thunder Needle~LLC~20×|
49|Light Machoke|P|F|1|80|2|P||Machop|Uncommon|Return Home~F~;Gentle Kick~FF~40|
50|Light Ninetales|P|R|1|90|1|W||Vulpix|Uncommon|Guiding Flame~R~;Fire Blast~RRR~50|
51|Light Slowbro|P|P|1|80|2|P||Slowpoke|Uncommon|Fish Out~P~;Splash About~WC~20+|
52|Light Vaporeon|P|W|1|80|1|L||Eevee|Uncommon|Wash Away~W~;Hypnoshower~WWC~30|
53|Light Venomoth|P|G|1|80|0|R|F|Venonat|Uncommon|Mysterious Wing~G~;Synchronize~PC~40|
54|Light Wigglytuff|P|C|1|80|1|F|P|Jigglypuff|Uncommon|Evolution Song~C~;Body Slam~CCC~20|
55|Scyther|P|G|0|60|1|R|F||Uncommon|Agility~GC~10;Sharp Sickle~GGG~40|
56|Togepi|P|C|0|40|1||P||Uncommon|Charm~C~;Spike Ball Tackle~CC~20|
57|Unown [C]|P|P|0|40|1|P|||Uncommon|Hidden Power~P~10|[Chase]
58|Unown [P]|P|P|0|40|1|P|||Uncommon|Hidden Power~P~10|[Perform]
59|Unown [Q]|P|P|0|40|1|P|||Uncommon|Hidden Power~P~10|[Quicken]
60|Unown [Z]|P|P|0|40|1|P|||Uncommon|Hidden Power~P~10|[Zoom]
61|Cyndaquil|P|R|0|40|1|W|||Common|Smokescreen~R~10|
62|Dark Octillery|P|W|1|60|2|L||Remoraid|Common|Ink Blast~W~20+;Tentacle Wrap~WC~20|
63|Dratini|P|C|0|40|1||P||Common|Shed~C~;Fury Attack~C~10×|
64|Exeggcute|P|P|0|40|1|P|||Common|Sleep Powder~G~10;Psyshock~P~10|
65|Gastly|P|P|0|40|0||F||Common|Nightmare~P~10|
66|Girafarig|P|C|0|60|1||||Common|Tail Bite~CC~10+;Psychic~PP~10+|
67|Gligar|P|F|0|50|0|G|F||Common|Stun Poison~FC~10|
68|Growlithe|P|R|0|50|1|W|||Common|Bite~CC~20|
69|Hitmonchan|P|F|0|60|1|P|||Common|Dodge~F~;Supersonic Jab~FFF~40|
70|Larvitar|P|F|0|40|1|G|L||Common|Leer~C~;Rock Throw~FC~20|
71|Ledyba|P|G|0|40|0|R|F||Common|Swift~GC~20|
72|Light Sunflora|P|G|1|80|1|R||Sunkern|Common|Reflected Sunlight~CC~;Solarbeam~GGG~40|
73|Machop|P|F|0|40|1|P|||Common|Chop~C~10;Punch~CC~20|
74|Mantine|P|W|0|60|2|L|F||Common|Giant Wave~WW~40|
75|Mareep|P|L|0|50|1|F|||Common|Headbutt~C~10|
76|Phanpy|P|F|0|40|1|G|L||Common|Crushing Step~F~10+|
77|Pineco|P|G|0|40|2|R|||Common|Tackle~CC~20|
78|Porygon|P|C|0|50|1|F|P||Common|Sharpen~CC~20|
79|Psyduck|P|W|0|50|1|L|||Common|Flipper Splash~W~10;Migraine~PC~20|
80|Remoraid|P|W|0|40|0|L|||Common|Fury Strikes~W~10×|
81|Seel|P|W|0|50|1|L|||Common|Take Down~WC~30|
82|Slugma|P|R|0|50|2|W|||Common|Combustion~RR~30|
83|Sunkern|P|G|0|40|2|R|||Common|Rollout~C~10;Sunbathe~GG~|
84|Swinub|P|W|0|50|1|G|L||Common|Generate Cold~WC~20|
85|Totodile|P|W|0|50|1|G|||Common|Water Gun~W~10+|
86|Unown [L]|P|P|0|50|1|P|||Common|Hidden Power~P~10|[Laugh]
87|Unown [S]|P|P|0|50|1|P|||Common|Hidden Power~PC~20|[Search]
88|Unown [T]|P|P|0|40|1|P|||Common|Hidden Power~PC~20|[Tell]
89|Unown [V]|P|P|0|40|1|P|||Common|Hidden Power~P~10|[Vanish]
90|Venonat|P|G|0|40|1|R|||Common|Gnaw~C~10;Poisonpowder~GC~10|
91|Vulpix|P|R|0|50|1|W|||Common|Ember~RC~30|
92|Broken Ground Gym|T||0||0||||Rare||
93|EXP.ALL|T||0||0||||Rare||
94|Impostor Professor Oak's Invention|T||0||0||||Rare||
95|Radio Tower|T||0||0||||Rare||
96|Thought Wave Machine|T||0||0||||Rare||
97|Counterattack Claws|T||0||0||||Uncommon||
98|Energy Amplifier|T||0||0||||Uncommon||
99|Energy Stadium|T||0||0||||Uncommon||
100|Lucky Stadium|T||0||0||||Uncommon||
101|Magnifier|T||0||0||||Uncommon||
102|Pokémon Personality Test|T||0||0||||Uncommon||
103|Team Rocket's Evil Deeds|T||0||0||||Uncommon||
104|Heal Powder|T||0||0||||Common||
105|Mail from Bill|T||0||0||||Common||
106|Shining Celebi|P|G|0|50|1|R|||Rare Shining|Healing Water~W~;Miracle Leaf~GP~10|
107|Shining Charizard|P|R|0|100|3|W|F||Rare Shining|White-hot Flame~RRRLL~100|
108|Shining Kabutops|P|F|0|80|2|G|||Rare Shining|Lightning Cut~FFL~30+;Water Slash~FFWW~50+|
109|Shining Mewtwo|P|P|0|70|2|P|||Rare Shining|Reflect Shield~PL~;Psyburst~PPR~40+|
110|Shining Noctowl|P|C|0|60|1|L|F||Rare Shining|Flashing Eyes~PLC~30|
111|Shining Raichu|P|L|0|70|1|F|||Rare Shining|Thundersquall~LLWW~40|
112|Shining Steelix|P|M|0|90|4|R|G||Rare Shining|Crushing Earth~MMFF~80|
113|Shining Tyranitar|P|D|0|80|3||P||Rare Shining|Mountain Crush~DFF~30;Destructive Fire~DRRR~50|`.trim().split('\n');
const E={},T={};
const noop={type:'noop'},status=s=>({type:'status',target:'opponentActive',status:s}),selfStatus=s=>({type:'status',target:'selfActive',status:s}),
 coin=(a,b=noop)=>({type:'coinFlip',heads:a,tails:b}),seq=(...effects)=>({type:'sequence',effects}),
 bonus=n=>({type:'bonusDamage',amount:n}),repeat=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'}),
 guard=(effects=true)=>({type:'preventDamage',target:'self',duration:'opponentTurn',effects}),
 gate=()=>({type:'coinAttackGate',heads:noop}),
 par=s=>status(s),lock=(action='retreat')=>({type:'lock',target:'opponentActive',action,duration:'opponentTurn'}),
 recoil=amount=>({type:'selfDamage',amount});
function move(n,i,effect,text){E[n+':'+i]={effect,text};}
// Exact printed effects already covered by the shared classic engine.
move(22,0,{type:'heal',target:'selfAll',amount:10},'Remove one damage counter from each of your Pokémon.');
move(22,1,coin(guard()),'Flip a coin. On heads prevent all effects including damage against Light Dragonair next turn.');
move(31,0,repeat(2,20),'Flip two coins, 20 damage per heads.');
move(31,1,{type:'coinTierBonus',coins:2,tiers:{0:0,1:0,2:80},mode:'replace'},'Flip two coins. If either is tails, deal no damage.');
move(32,0,seq(lock(),{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'}),'The defending Pokémon cannot retreat and must flip heads to attack next turn.');
move(38,0,seq(recoil(10),{type:'lock',target:'self',action:'attack',attackName:'Rock Tackle',duration:'nextOwnTurn'}),'10 recoil. Cannot use Rock Tackle next turn.');
move(40,0,coin(par('sleep'),par('confusion')),'Heads: Asleep; tails: Confused.');
move(41,0,noop,'Deal 20 damage.');
move(41,1,coin(bonus(30)),'Flip heads for 30 more damage.');
move(42,0,repeat(2,20),'Flip two coins; deal 20 damage per heads.');
move(42,1,gate(),'Flip a coin; on tails this attack misses.');
move(43,0,lock(),'Defender cannot retreat during its next turn.');
move(43,1,gate(),'Flip a coin; on tails this attack misses.');
move(44,0,{type:'modifier',stat:'damageReduction',amount:10,duration:'opponentTurn',scope:'self'},'Reduce the next opposing attack damage to Jigglypuff by 10.');
move(49,1,seq({type:'bonusDamage',amount:-20,condition:{type:'opponentDamaged'}}),'40 damage if defender undamaged; otherwise 20.');
move(54,1,coin(par('paralysis')),'Flip heads to Paralyze.');
move(55,0,coin(guard()),'Flip heads to prevent all attack damage and effects to Scyther next turn.');
move(55,1,noop,'Deal 40 damage.');
move(61,0,{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},'Defender must flip heads to attack next turn.');
move(63,0,{type:'healSelf',amount:10},'Remove 10 damage from Dratini.');
move(63,1,repeat(2,10),'Flip two coins for 10 damage per heads.');
move(64,0,par('sleep'),'Put the defending Pokémon to Sleep.');
move(64,1,coin(par('paralysis')),'Flip heads to Paralyze the defender.');
move(65,0,par('sleep'),'Put the defending Pokémon to Sleep.');
move(66,0,coin(bonus(20)),'Flip heads for 20 extra damage.');
move(66,1,{type:'energyDamage',source:'opponent',amount:10,mode:'add'},'Add 10 damage per Energy attached to defending Pokémon.');
move(67,0,coin(seq(par('paralysis'),par('poison'))),'Flip heads to both Paralyze and Poison the defender.');
move(68,0,noop,'Deal 20 damage.');
move(69,0,coin({type:'preventDamage',target:'self',duration:'opponentTurn'}),'Flip heads to prevent attack damage next turn.');
move(69,1,noop,'Deal 40 damage.');
move(70,0,coin({type:'lock',target:'opponentActive',action:'attack',duration:'opponentTurn'}),'Flip heads; defender cannot attack next turn.');
move(70,1,noop,'Deal 20 damage.');
move(71,0,{type:'damageRule',ignoreWeakness:true,ignoreResistance:true,ignoreEffects:true},'Swift: damage ignores Weakness, Resistance and effects.');
move(72,1,noop,'Deal 40 damage.');
move(73,0,noop,'Deal 10 damage.');
move(73,1,noop,'Deal 20 damage.');
move(74,0,{type:'lock',target:'self',action:'attack',duration:'nextOwnTurn'},'Mantine cannot attack during your next turn.');
move(75,0,noop,'Deal 10 damage.');
move(76,0,coin(bonus(10)),'Flip heads to deal an extra 10 damage.');
move(77,0,noop,'Deal 20 damage.');
move(78,0,noop,'Deal 20 damage.');
move(79,0,noop,'Deal 10 damage.');
move(79,1,coin(par('confusion'),selfStatus('confusion')),'Heads: Confuse the defender; tails: Confuse Psyduck.');
move(80,0,repeat(3,10),'Flip three coins for 10 damage per heads.');
move(81,0,recoil(10),'Deal 10 recoil to Seel.');
move(82,0,noop,'Deal 30 damage.');
move(83,0,noop,'Deal 10 damage.');
move(84,0,coin(par('paralysis')),'Flip heads to Paralyze.');
move(90,0,noop,'Deal 10 damage.');
move(90,1,par('poison'),'Poison the defender.');
move(91,0,{type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true},'Discard one attached Fire Energy or Ember fails.');
// Trainers with a fully compatible printed action.  Others remain catalogued.
T[104]={trainerType:'Item',text:'Flip a coin. On heads, cure all Special Conditions and heal 20 damage from your Active Pokémon.',effect:coin(seq({type:'removeStatuses',target:'selfActive',statuses:['sleep','confusion','paralysis','poison']},{type:'heal',target:'selfActive',amount:20}))};
// The old card format treats ordinary trainer cards as Items; Stadiums and Tools are explicit.
const TRAINER_TYPE={92:'Stadium',93:'Tool',95:'Stadium',97:'Tool',99:'Stadium',100:'Stadium'};
const TRAINER_TEXT={92:'Stadium: Basic/Baby Pokémon have one additional retreat cost.',93:'Tool: transfer one Basic Energy from the Active Pokémon on attack Knock Out; discard this Tool.',94:'May reshuffle your opponent’s Prize cards and replace them from their deck.',95:'Stadium: once per turn look at the top two cards of your deck.',96:'Flip until tails; return opposing Active Energy to hand per heads. Your turn ends.',97:'Tool: on attack damage to this Active, flip heads to return two damage counters, then discard Tool.',98:'Shuffle an Energy from hand into deck; flip heads for up to three Basic Energy.',99:'Stadium: once per turn flip heads to retrieve Basic Energy from discard.',100:'Stadium: once per turn flip heads to draw one card.',101:'Attach until end of turn; ignore Resistance on this Pokémon’s attacks.',102:'Guess whether a hidden Evolution is Light, Dark or neither; winner draws three.',103:'Put a card from the opponent’s hand into their deck; opponent may draw two.',105:'Playable with fewer than five hand cards. Draw up to four.'};
const SHINING=new Set([106,107,108,109,110,111,112,113]);
const CARDS=DATA.map(line=>{
 const [raw,name,kindCode,type,stage,hp,ret,weak,res,evolvesFrom,rarity,moves,power]=line.split('|');
 const n=Number(raw),id='neo4-'+n,kind=kindCode==='P'?'pokemon':kindCode==='E'?'energy':'trainer';
 const attacks=kind!=='pokemon'?[]:(moves||'').split(';').filter(Boolean).map((entry,i)=>{
  const [title,cost,printed]=entry.split('~');
  const implemented=E[n+':'+i];
  const damaged=Number(String(printed||'').replace(/[^0-9]/g,''))||0;
  const variable=/[×+?-]/.test(printed||'');
  return {name:title,cost,damage:variable?damaged:damaged,damageText:variable?printed:null,text:implemented?.text||'',effect:implemented?.effect||null,unimplemented:!implemented||!fx.supportsEffect(implemented.effect)};
 });
 const reasons=[];if(kind==='pokemon'){
   for(const atk of attacks)if(atk.unimplemented)reasons.push(atk.name+' printed attack effect not implemented');
   if(power)reasons.push('Pokémon Power '+power+' not yet implemented');
   if(SHINING.has(n))reasons.push('Shining attack requires dedicated multi-type/target mechanic verification');
 }else if(kind==='trainer'&&!T[n])reasons.push('Trainer '+name+' effect not yet implemented');
 else if(kind==='energy')reasons.push('Miracle Energy needs a dedicated Special Energy implementation');
 const battleEnabled=!reasons.length;
 return {id,setId:'neo4',number:String(n),name,kind,rarity,source:'tcg',battleFormat:'classic',
 ...(kind==='pokemon'?{stage:Number(stage)===0?'Basic':'Stage '+stage,hp:Number(hp),retreat:Number(ret),types:[TYPE[type]],subtype:TYPE[type],weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolvesFrom||null,attacks,abilities:power?[{name:power,type:'passive',effect:{type:'neoRule',rule:'destiny:'+power},text:'See original card Pokémon Power.'}]:[],printedRules:SHINING.has(n)?`You cannot have more than one ${name} in your deck.`:''}:{}),
 ...(kind==='trainer'?{trainerType:T[n]?.trainerType||TRAINER_TYPE[n]||'Item',text:T[n]?.text||TRAINER_TEXT[n]||'Read the printed Trainer card.',effect:T[n]?.effect||null}:{}),
 ...(kind==='energy'?{specialEnergy:true,subtype:'Colorless',types:['Colorless'],text:'Miracle Energy: Special Energy with evolution/turn restrictions. Under development.',effect:null}:{}),
 image:'https://images.pokemontcg.io/neo4/'+n+'.png',imageLarge:'https://images.pokemontcg.io/neo4/'+n+'_hires.png',
 battleEnabled,deckEligible:battleEnabled,support:{status:battleEnabled?'FULL':'PARTIAL',reasons}
 };
});
if(CARDS.length!==113||new Set(CARDS.map(c=>c.id)).size!==113)throw Error('Neo Destiny card identities incomplete');
const byId=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>byId.get(String(id||'').toLowerCase())||null,
 coverage:()=>({total:113,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id+' '+c.name+': '+c.support.reasons.join('; '))})};
});
