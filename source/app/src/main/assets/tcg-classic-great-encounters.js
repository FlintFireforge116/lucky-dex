/* LuckyDex Classic TCG — Great Encounters (dp4).
 * Historical print metadata cross-checked against PokemonTCG/pokemon-tcg-data dp4.json.
 * IMPORTANT: only explicitly reviewed entries are battle-enabled.
 * Printed attacks whose optional or interrupt effects need engine work are gated.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexClassicTCGGreatEncounters=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const SET={id:'dp4',name:'Great Encounters',series:'Diamond & Pearl',releaseDate:'2008-02-13',cardCount:106,printedTotal:106};
const T={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal',C:'Colorless'};
const RAW=`1|Blaziken|P|Stage 2|130|R|Combusken|W+30||1|Rare Holo|Fire Dance~C~30;Flame Kick~RRC~|
2|Cresselia|P|Basic|80|P||P+20||1|Rare Holo|Moon Twinkle~C~10;Lunar Dance~PPC~50|
3|Darkrai|P|Basic|70|D||F+20|P-20|1|Rare Holo|Reach Over~~;Darkness Pursuit~DDD~50|
4|Darkrai|P|Basic|80|D||F+20|P-20|1|Rare Holo|Darkness Roar~C~10;Sleep Hole~DDC~40+|
5|Pachirisu|P|Basic|70|L||F+20|M-20|1|Rare Holo|Call for Family~C~;Smash Short~C~10+|
6|Porygon-Z|P|Stage 2|110|C|Porygon2|F+30||2|Rare Holo|Tri Attack~CC~40×|Conversion~Power
7|Rotom|P|Basic|70|L||D+20|C-20|1|Rare Holo|Astonish~CC~20;Telebeam~LL~30+|
8|Sceptile|P|Stage 2|100|G|Grovyle|R+30|W-20|3|Rare Holo|Leaf Blade~GGCC~50+|Wild Growth~Body
9|Swampert|P|Stage 2|130|W|Marshtomp|G+30||2|Rare Holo|Hammer Arm~WWCC~80|Wash Out~Power
10|Tangrowth|P|Stage 1|110|G|Tangela|R+30|W-20|2|Rare Holo|Power Whip~G~;Stick and Absorb~GGCC~60|
11|Togekiss|P|Stage 2|120|C|Togetic|L+30|F-20|1|Rare Holo|Air Scroll~CCC~40+|Serene Grace~Power
12|Altaria|P|Stage 1|80|C|Swablu|C+20|F-20|1|Rare|Dragonbreath~C~40;Cotton Cloud~CCC~60|
13|Beedrill|P|Stage 2|110|G|Kakuna|R+30||0|Rare|Band Attack~G~30×;Twineedle~CCC~50×|
14|Butterfree|P|Stage 2|120|G|Metapod|R+30||0|Rare|Parallel Drain~G~30;Dozing Scales~GGC~60|
15|Claydol|P|Stage 1|80|F|Baltoy|G+20||2|Rare|Spinning Attack~FC~40|Cosmic Power~Power
16|Dialga|P|Basic|90|M||R+20|P-20|2|Rare|Time Bellow~M~10;Flash Cannon~MMC~40|
17|Exploud|P|Stage 2|130|C|Loudred|F+30||3|Rare|Ambient Noise~CC~;Hyper Voice~CCCC~70|
18|Houndoom|P|Stage 1|90|D|Houndour|W+20|P-20|1|Rare|Dark Fang~D~20;Black Fire~RC~40+|
19|Hypno|P|Stage 1|80|P|Drowzee|P+20||2|Rare|Dream Catcher~CC~;Hypnoblast~PPC~60|
20|Kingler|P|Stage 1|90|W|Krabby|L+20||3|Rare|Crabhammer~CC~30;Scissor Blow~WWC~80|
21|Lapras|P|Basic|80|W||L+20||1|Rare|Carry In~W~;Wave Splash~WC~20|
22|Latias|P|Basic|80|C||C+20|F-20|1|Rare|Miraculous Light~C~10;Mist Ball~RWC~80|
23|Latios|P|Basic|90|C||C+20|F-20|2|Rare|Energy Draw~C~10;Luster Purge~GLCC~120|
24|Mawile|P|Basic|70|M||R+10|P-20|1|Rare|Pick Out~~;Jaw Bite~MC~20|
25|Milotic|P|Stage 1|90|W|Feebas|L+20||2|Rare|Twister~WCC~50|Marvel Scale~Body
26|Palkia|P|Basic|90|W||L+20||2|Rare|Spacial Rend~W~10;Transback~WWC~40|
27|Primeape|P|Stage 1|90|F|Mankey|P+20||1|Rare|Whump~FCC~50|Anger Point~Body
28|Slowking|P|Stage 1|80|P|Slowpoke|P+20||2|Rare|Psych Up~PC~30|Trump Card~Power
29|Unown [H]|P|Basic|60|P||P+10||1|Rare|Hidden Power~P~30|HEAL~Power
30|Wailord|P|Stage 1|200|W|Wailmer|L×2||4|Rare|Sink Deep~WWWC~60|Sleeping Pulse~Body
31|Weezing|P|Stage 1|80|P|Koffing|P+20||2|Rare|Offensive Gas~PC~30|Toxic Virus~Body
32|Wigglytuff|P|Stage 1|90|C|Jigglypuff|F+20||1|Rare|Ballon Attack~CC~40+|Good Night Melody~Power
33|Arbok|P|Stage 1|80|P|Ekans|P+20||2|Uncommon|Deadly Poison~P~10+;Wrap~CCC~50|
34|Cacturne|P|Stage 1|80|D|Cacnea|R+20|P-20|1|Uncommon|Pin Missile~CC~20×;Needle Arm~DCC~50+|
35|Combusken|P|Stage 1|80|R|Torchic|W+20||1|Uncommon|Bulk Up~R~30;Double Kick~RCC~50×|
36|Delibird|P|Basic|70|W||M+20||1|Uncommon|Present~~;Ice Ball~W~20|
37|Floatzel|P|Stage 1|80|W|Buizel|L+20||1|Uncommon|Agility~CC~20;Aqua Jet~WWC~60|
38|Gorebyss|P|Stage 1|80|W|Clamperl|L+20||0|Uncommon|Sweet Temptation~~;Psychic Snap~WC~30+|
39|Granbull|P|Stage 1|90|C|Snubbull|F+20||2|Uncommon|Daunt~CC~30;Rage~CCCC~40+|
40|Grovyle|P|Stage 1|80|G|Treecko|R+20|W-20|1|Common|Greenness~~;Poison Breath~GG~30|
41|Hariyama|P|Stage 1|100|F|Makuhita|P+30||3|Uncommon|Palm Strike~FC~20+;Spirited Throw~FFC~50|
42|Huntail|P|Stage 1|90|W|Clamperl|L+20||1|Uncommon|Scary Face~~;Threaten and Drop~WC~30+|
43|Linoone|P|Stage 1|80|C|Zigzagoon|F+20||0|Uncommon|Switcheroo~~;Overrun~CCC~30|
44|Loudred|P|Stage 1|80|C|Whismur|F+20||2|Uncommon|Bass Control~CC~;Stomp~CCC~40+|
45|Magcargo|P|Stage 1|90|R|Slugma|W+20||3|Uncommon|Lava Plume~RRC~60|Magma Armor~Body
46|Marshtomp|P|Stage 1|90|W|Mudkip|G+20||2|Uncommon|Pound~CC~20;Muddy Bomb~FCC~|
47|Metapod|P|Stage 1|70|G|Caterpie|R+20||2|Uncommon|Ram~GC~30|Emerge~Power
48|Pelipper|P|Stage 1|80|W|Wingull|L+20|F-20|1|Uncommon|Guzzle~~;Jet Return~WCC~30×|
49|Porygon2|P|Stage 1|70|C|Porygon|F+20||2|Uncommon|Speed Attack~CC~30|Download~Power
50|Purugly|P|Stage 1|90|C|Glameow|F+20||2|Uncommon|Swagger~CC~20;Fury Swipes~CCC~40×|
51|Relicanth|P|Basic|70|W||L+20||1|Uncommon|Primal Calling~~;Sleep Swirl~CC~30|
52|Seviper|P|Basic|80|P||P+20||2|Uncommon|Tail Blade~P~20;Poison Tail~PCC~30+|
53|Skarmory|P|Basic|70|M||R+20|P-20|1|Uncommon|Air Crash~M~20;Steel Wing~MCC~40|
54|Slowbro|P|Stage 1|80|W|Slowpoke|L+20||2|Uncommon|Amnesia~CC~20;Zen Headbutt~PCC~60|
55|Togetic|P|Stage 1|70|C|Togepi|L+20|F-20|1|Uncommon|Speed Dive~CC~20;Sweet Kiss~CCC~50|
56|Unown [F]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~P~10|FAKE~Power
57|Unown [G]|P|Basic|50|P||P+10||1|Uncommon|Hidden Power~PC~50|GUARD~Power
58|Wailmer|P|Basic|90|W||L+20||3|Uncommon|Tsunami~WC~10;Ram~CCC~30|
59|Zangoose|P|Basic|70|C||F+20||1|Uncommon|Slash~C~20;Cutting Claw~CCC~40+|
60|Baltoy|P|Basic|50|F||G+10||1|Common|Psychic Balance~C~;Spin Turn~FC~20|
61|Buizel|P|Basic|60|W||L+10||1|Common|Headbutt~~10;Surf~WW~30|
62|Cacnea|P|Basic|50|G||R+10|W-20|1|Common|Sand Attack~C~;Poison Sting~GC~20|
63|Caterpie|P|Basic|40|G||R+10||1|Common|Tackle~G~20|Pupate~Power
64|Clamperl|P|Basic|40|W||L+10||1|Common|Clamp~C~10;Sparkling Pearl~WC~20|
65|Drowzee|P|Basic|60|P||P+10||1|Common|Hypnosis~C~;Headbutt~PC~20|
66|Ekans|P|Basic|60|P||P+10||2|Common|Shed Skin~C~;Poison Fang~P~10|
67|Feebas|P|Basic|30|W||L+10||1|Common|Splash~C~10;Fast Evolution~W~|
68|Glameow|P|Basic|50|C||F+10||1|Common|Captivate~C~;Slash~CC~20|
69|Houndour|P|Basic|50|R||W+10||1|Common|Ember~R~20;Smash Kick~CC~20|
70|Igglybuff|P|Basic|50|C||F+10||1|Common|Inquire~~|Baby Evolution~Power
71|Illumise|P|Basic|70|G||R+20||1|Common|Firefly Scent~GC~30|Scent Conduct~Power
72|Jigglypuff|P|Basic|60|C||F+10||1|Common|Hypnotic Gaze~C~;Expand~CC~20|
73|Kakuna|P|Stage 1|80|G|Weedle|R+20||2|Common|Stiffen~~;Spit Poison~G~10|
74|Koffing|P|Basic|60|P||P+10||2|Common|Tackle~C~10;Smogscreen~PC~10|
75|Krabby|P|Basic|60|W||L+10||2|Common|Irongrip~C~10;Guillotine~WC~30|
76|Lunatone|P|Basic|60|F||P+20||1|Common|Knock Over~C~20|Gravity Change~Power
77|Luvdisc|P|Basic|60|W||L+10||1|Common|Rendezvous~C~;Synchro Dance~W~10+|
78|Makuhita|P|Basic|60|F||P+10||2|Common|Punch~C~10;Arm Thrust~FC~40|
79|Mankey|P|Basic|50|F||P+10||1|Common|Light Punch~F~10;Rage~CC~10+|
80|Mudkip|P|Basic|60|W||G+10||1|Common|Mud Spatter~C~10;Endeavor~CCC~30+|
81|Porygon|P|Basic|50|C||F+10||1|Common|Calculate~C~;Sharpen~CC~20|
82|Slowpoke|P|Basic|60|W||L+10||2|Common|Rest~C~;Tumble Over~W~20|
83|Slugma|P|Basic|60|R||W+10||2|Common|Steady Firebreathing~R~10;Body Slam~CC~20|
84|Snubbull|P|Basic|60|C||F+10||1|Common|Roar~C~;Bite~CCC~30|
85|Solrock|P|Basic|70|F||G+20||1|Common|Sol Charge~F~20|Sunlight~Body
86|Swablu|P|Basic|40|C||L+10|F-20|1|Common|Super Speed~C~;Shoot Through~CC~10|
87|Tangela|P|Basic|70|G||R+10||2|Common|Vine Invite~C~;Grass Knot~GC~20+|
88|Togepi|P|Basic|50|C||F+10||1|Common|Yawn~C~;Find a Friend~C~|
89|Torchic|P|Basic|50|R||W+10||1|Common|Peck~~10;Singe~R~|
90|Treecko|P|Basic|50|G||R+10|W-20|1|Common|Energy Ball~C~10+;Absorb~GC~20|
91|Unown [L]|P|Basic|50|P||P+10||1|Common|Hidden Power~PC~|LINK~Body
92|Volbeat|P|Basic|70|G||R+20||1|Common|Firefly Light~GG~20|Light Conduct~Power
93|Weedle|P|Basic|50|G||R+10||1|Common|Call for Family~C~;String Shot~G~|
94|Whismur|P|Basic|50|C||F+10||1|Common|Mumble~~10;Uproar~C~|
95|Wingull|P|Basic|50|W||L+10|F-20|1|Common|Water Drip~W~10;Wing Attack~CC~20|
96|Zigzagoon|P|Basic|50|C||F+10||1|Common|Pull Out~C~;Double Stab~C~10×|
97|Amulet Coin|T|Pokémon Tool||||||0|Uncommon||
98|Felicity's Drawing|T|Supporter||||||0|Uncommon||
99|Leftovers|T|Pokémon Tool||||||0|Uncommon||
100|Moonlight Stadium|T|Stadium||||||0|Uncommon||
101|Premier Ball|T|Item||||||0|Uncommon||
102|Rare Candy|T|Item||||||0|Uncommon||
103|Cresselia LV.X|P|Level-Up|100|P|Cresselia|P×2||1|Rare Holo LV.X|Moon Skip~PPC~40|Full Moon Dance~Power
104|Darkrai LV.X|P|Level-Up|100|D|Darkrai|F×2|P-20|1|Rare Holo LV.X|Endless Darkness~DDC~40|Dark Shadow~Body
105|Dialga LV.X|P|Level-Up|110|M|Dialga|R×2|P-20|2|Rare Holo LV.X|Metal Flash~MMCC~80|Time Skip~Power
106|Palkia LV.X|P|Level-Up|120|W|Palkia|L×2||3|Rare Holo LV.X|Hydro Reflect~WWW~60|Restructure~Power`;
const N={type:'noop'};
const seq=(...effects)=>({type:'sequence',effects});
const flip=(heads=N,tails=N)=>({type:'coinFlip',heads,tails});
const stat=(name,target='opponentActive')=>({type:'status',target,status:name});
const bonus=(amount,condition)=>({type:'bonusDamage',amount,...(condition?{condition}:{})});
const search=(filter,amount=1)=>({type:'searchChosen',source:'deck',amount,filter});
const lock=(action,target='opponentActive',duration='opponentTurn')=>({type:'lock',action,target,duration});
const mod=(stat,amount,scope='self',duration='opponentTurn',condition)=>({type:'modifier',stat,amount,scope,duration,...(condition?{condition}:{})});
const gate=(heads=N)=>({type:'coinAttackGate',heads});
const rule=(name)=>({type:'neoRule',rule:'dp4:'+name});
// Conservative, verified-only enablement. Cards with pending choices or reactive
// Powers remain visible in the collection but cannot enter generated battle decks.
const READY=new Set([4,14,21,32,55,67,70,77,15,19,22,38,71,76,92,98,101,45,5,10,17,42,43,47,63,3,7,12,13,20,27,33,34,35,36,37,39,40,41,44,50,51,52,53,54,58,59,60,61,62,64,65,66,68,69,72,73,74,75,78,79,80,81,82,83,84,86,87,88,89,90,93,94,95,96,102]);
const EFFECTS={
 5:[{type:'benchFromDeck',amount:3,choose:true,filter:{kind:'pokemon',stage:'Basic'}},rule('5:smashShort')],
 10:[rule('10:powerWhip'),seq({type:'healSelf',amount:30},lock('retreat'))],
 17:[rule('17:ambientNoise'),N],
 42:[flip(seq(lock('attack'),lock('retreat'))),rule('42:threatenAndDrop')],
 43:[rule('43:switcheroo'),{type:'benchDamage',side:'opponent',amount:30}],
 47:[N],63:[N],
 45:[rule('45:lavaPlume')],
 15:[N],
 19:[rule('19:dreamCatcher'),stat('sleep')],
 22:[seq({type:'healSelf',amount:20},{type:'removeStatus',target:'self'}),seq({type:'discardEnergyCard',target:'self',amount:1,energyType:'Fire',strictEnergyType:true},{type:'discardEnergyCard',target:'self',amount:1,energyType:'Water',strictEnergyType:true})],
 38:[rule('38:sweetTemptation'),seq(bonus(20,{type:'selfHasEnergyType',energyType:'Psychic'}),{type:'status',target:'opponentActive',status:'confusion',condition:{type:'selfHasEnergyType',energyType:'Psychic'}})],
 71:[rule('71:fireflyScent')],
 76:[{type:'chooseOption',options:[{label:'Leave Stadium in play',effect:N},{label:'Discard the Stadium',effect:{type:'discardStadium'}}]},N],
 92:[flip(stat('confusion'))],
 4:[{type:'chooseOption',options:[{label:'Do not switch',effect:N},{label:'Ask opponent to switch',effect:{type:'forceOpponentSwitch'}}]},rule('4:sleepHole')],
 14:[rule('14:parallelDrain'),flip(stat('sleep'),stat('poison'))],
 21:[rule('21:carryIn'),N],
 32:[rule('32:balloonAttack'),N],
 55:[N,rule('55:sweetKiss')],
 67:[N,search({kind:'pokemon',stage:['Stage 1','Stage 2','Level-Up']})],
 70:[rule('70:inquire')],
 77:[rule('77:rendezvous'),bonus(20,{type:'equalEnergyCount'})],
 3:[search({kind:'energy'}),rule('3:darknessPursuit')],
 7:[{type:'shuffleChosenHand',side:'opponent',amount:1},flip(seq(bonus(30),stat('paralysis')))],
 12:[gate(stat('paralysis')),mod('damageReduction',30,'self','opponentTurn',{type:'opponentMatches',filter:{evolved:true}})],
 13:[{type:'fieldCountDamage',amount:30,filter:{name:'Beedrill'},mode:'replace'},{type:'coinDamage',coins:2,amount:50,mode:'replace'}],
 20:[N,{type:'selfDamageIfDefenderKnockedOut',amount:30}],
 27:[seq(stat('confusion','self'),flip(lock('attack')))],
 33:[seq(bonus(40,{type:'opponentStatus',status:'poison'}),stat('poison')),flip(stat('paralysis'))],
 34:[{type:'coinDamage',coins:3,amount:20,mode:'replace'},bonus(20,{type:'opponentDamaged'})],
 35:[mod('attackDamage',30,'self','nextOwnTurn'),{type:'coinDamage',coins:2,amount:50,mode:'replace'}],
 36:[flip(search({kind:'pokemon'},1)),N],
 37:[flip({type:'preventDamage',target:'self',duration:'opponentTurn'}),flip({type:'benchDamage',side:'opponent',amount:10})],
 39:[mod('attackDamage',-20,'opponentActive','opponentTurn'),{type:'damageFromDamage',source:'self',amount:1}],
 40:[search({kind:'energy',basicEnergy:true,subtype:'Grass'},2),stat('poison')],
 41:[flip(bonus(40)),rule('41:spiritedThrow')],
 44:[{type:'selectedDamage',target:'opponentPokemon',amount:20,ignoreWeakness:true,ignoreResistance:true},flip(bonus(20))],
 50:[flip({type:'discardEnergyCard',target:'opponentActive',amount:1}),{type:'coinDamage',coins:3,amount:40,mode:'replace'}],
 51:[search({kind:'trainer',nameContains:'Fossil'},3),seq(stat('sleep'),stat('sleep','self'))],
 52:[flip({type:'actionLock',side:'opponent',cardType:'Trainer',duration:'opponentTurn'}),flip(seq(bonus(30),stat('poison')))],
 53:[flip({type:'discardEnergyCard',target:'opponentActive',amount:1}),mod('damageReduction',20,'self','opponentTurn')],
 54:[{type:'chooseAttackLock',duration:'opponentTurn'},N],
 58:[flip({type:'benchDamage',side:'opponent',amount:10,all:true}),N],
 59:[N,bonus(50,{type:'pokemonPresent',zone:'inPlay',side:'opponent',filter:{name:'Seviper'}})],
 60:[{type:'drawToHandSize',matchSide:'opponent'},{type:'switch',side:'self'}],
 61:[N,N],
 62:[{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},stat('poison')],
 64:[gate(stat('paralysis')),N],
 65:[stat('sleep'),N],
 66:[{type:'healSelf',amount:20},flip(stat('poison'))],
 68:[{type:'forceOpponentSwitch'},N],
 69:[flip(N,{type:'discardEnergyCard',target:'self',amount:1,energyType:'Fire',strictEnergyType:true}),N],
 72:[stat('sleep'),mod('damageReduction',20,'self','opponentTurn')],
 73:[mod('damageReduction',30,'self','opponentTurn'),stat('poison')],
 74:[N,seq(stat('poison'),{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'})],
 75:[N,N],
 78:[N,gate({type:'discardEnergyCard',target:'opponentActive',amount:1})],
 79:[N,{type:'damageFromDamage',source:'self',amount:1}],
 80:[N,{type:'coinDamage',coins:2,amount:20,mode:'add'}],
 81:[{type:'reorderTop',count:3,side:'self'},N],
 82:[seq({type:'healSelf',amount:30},{type:'removeStatus',target:'self'},stat('sleep','self')),lock('attack','self','nextOwnTurn')],
 83:[N,flip(stat('paralysis'))],
 84:[{type:'forceOpponentSwitch'},N],
 86:[flip({type:'preventDamage',target:'self',duration:'opponentTurn'}),{type:'benchDamage',side:'opponent',amount:10}],
 87:[{type:'forceOpponentSwitch'},{type:'retreatCostDamage',amount:10}],
 88:[stat('sleep'),flip(search({kind:'pokemon'}))],
 89:[N,stat('burn')],
 90:[rule('90:energyBall'),{type:'healSelf',amount:10}],
 93:[{type:'benchFromDeck',amount:1,choose:true,filter:{kind:'pokemon',stage:'Basic'}},flip(stat('paralysis'))],
 94:[N,rule('94:uproar')],
 95:[N,N],
 96:[rule('96:pullOut'),{type:'coinDamage',coins:2,amount:10,mode:'replace'}]
};
const ABILITIES={47:[{...flip({type:'evolveFromDeck'}),condition:{type:'selfIsActive'}}],63:[{...flip({type:'evolveFromDeck'}),condition:{type:'selfIsActive'}}],45:[seq({type:'preventStatus',status:'sleep',duration:'whileInPlay',scope:'self'},{type:'preventStatus',status:'paralysis',duration:'whileInPlay',scope:'self'})],15:[rule('15:cosmicPower')],71:[flip({type:'benchFromDeck',amount:1,choose:true,filter:{kind:'pokemon',stage:'Basic',subtype:'Grass'}})],76:[rule('76:gravityChange')],92:[rule('92:lightConduct')],32:[seq(stat('sleep'),stat('sleep','self'))],70:[rule('70:babyEvolution')],27:[{type:'modifier',stat:'attackDamage',amount:40,scope:'self',duration:'whileInPlay',condition:{type:'selfDamaged'}}]};
const TRAINER_EFFECTS={98:rule('98:felicityDrawing'),101:rule('101:premierBall'),102:{type:'rareCandy'}};
const PRINTS={
 5:['Search your deck for up to three Basic Pokémon and put them onto your Bench.','If the Defending Pokémon has a Tool, +30 damage. Discard it and same-name Tools from opponent hand.'],
 10:['Choose an opposing Pokémon and deal 10 damage per basic Energy attached to Tangrowth.','Heal Tangrowth by 30 and prevent defending Pokémon retreat next turn.'],
 17:['Flip two coins. First chooses 50 Active or 20 to every opposing Bench. Second Confuses or prevents Trainer, Supporter and Stadium cards next turn.',''],
 42:['Flip: heads prevent the Defending Pokémon attacking or retreating next turn.','With Darkness Energy attached, deal 20 extra and discard a Special Energy from defender if any.'],
 43:['Move a Tool from one opposing Pokémon to another opposing Pokémon without a Tool.','30 to Active and 30 to an opposing Benched Pokémon.'],
 47:[''],63:[''],
 45:['You may discard the top card of your deck. If you do, the Defending Pokémon is Burned.'],
 15:[''],
 19:['If the Defending Pokémon is Asleep, move all damage counters from Hypno to that Pokémon.','Put the Defending Pokémon Asleep.'],
 22:['Remove two damage counters and all Special Conditions from Latias.','Discard one Fire Energy and one Water Energy attached to Latias.'],
 38:['Switch a chosen opposing Benched Pokémon Active and deal 10 damage to it.','If Gorebyss has Psychic Energy, +20 damage and Confuse.'],
 71:['If the Defending Pokémon has any Poké-Bodies, it is now Asleep.'],
 76:['You may discard a Stadium in play.'],
 92:['Flip: heads Confuse the Defending Pokémon.'],
 4:['You may have the opponent switch their Active Pokémon.', 'If the Defending Pokémon is Asleep, 80 damage; otherwise 40 and put it Asleep.'],
 14:['Heal one of your Pokémon by the amount of damage this attack dealt.', 'Flip: heads Asleep, tails Poisoned.'],
 21:['Find a Pokémon Tool, Supporter and Basic Energy card from your deck, one of each.', ''],
 32:['If Igglybuff is anywhere beneath Wigglytuff, deal +20 damage.'],
 55:['','The opponent may choose whether to draw a card.'],
 67:['','Search your deck for an Evolution card and put it into your hand.'],
 70:['Draw one card, then two more unless you already played a Supporter from hand this turn.'],
 77:['Show the top card of your deck and put it into your hand; draw two more if it is a Pokémon.', 'Deal 20 extra if both Active Pokémon have equal numbers of attached Energy.'],
 3:['Search deck for an Energy card and put it into your hand.','Base damage is 100 instead of 50 against Cresselia.'],
 7:['Select one hidden opponent hand card and shuffle it into their deck.','Flip: heads +30 damage and Paralyze.'],
 12:['Flip: tails does nothing; heads Paralyze.','Reduce damage from Evolved Pokémon attacks by 30 next turn.'],
 13:['30 damage per Beedrill in play.','Flip two coins; 50 damage per heads.'],
 20:['','If the attack knocks out the Defending Pokémon, Kingler takes 30 damage.'],
 27:['Confuse Primeape. Flip: heads prevent the Defending Pokémon attacking next turn.'],
 33:['If already Poisoned, +40 damage; otherwise Poison.','Flip: heads Paralyze.'],
 34:['Flip three coins; 20 damage per heads.','+20 if the Defending Pokémon is damaged.'],
 35:['Your attacks do +30 damage next turn.','Flip two coins; 50 per heads.'],
 36:['Flip: heads search deck for a card.',''],
 37:['Flip: heads prevent attacks against Floatzel next turn.','Flip: heads deal 10 to chosen opponent Benched Pokémon.'],
 39:['Reduce incoming attack damage from the Defending Pokémon by 20 next turn.','40 plus 10 per damage counter on Granbull.'],
 40:['Search up to two Grass Energy cards.','Poison the Defending Pokémon.'],
 41:['Flip: heads add 40 damage.','Base 80 when Hariyama has less remaining HP than the Defending Pokémon.'],
 44:['Choose one opponent Pokémon; do 20 ignoring Bench Weakness and Resistance.','Flip: heads add 20 damage.'],
 50:['Flip: heads discard one Defending Pokémon Energy.','Flip three coins; 40 damage per heads.'],
 51:['Search up to three Trainer cards with Fossil in their names.','Both Active Pokémon are Asleep.'],
 52:['Flip: heads prevent opponent playing Trainer cards next turn.','Flip: heads add 30 damage and Poison.'],
 53:['Flip: heads discard a Defending Pokémon Energy.','Reduce damage to Skarmory by 20 next turn.'],
 54:['Choose one attack of the Defending Pokémon to prevent next turn.',''],
 58:['Flip: heads deal 10 to each opposing Benched Pokémon.',''],
 59:['','+50 damage if Seviper is in opponent play.'],
 60:['Draw until your hand matches the opponent hand size.','Switch Baltoy with one of your Benched Pokémon.'],
 62:['Defending Pokémon must flip to attack next turn; tails fails.','Poison the Defending Pokémon.'],
 64:['Flip: tails does nothing; heads Paralyze.',''],
 65:['Put the Defending Pokémon Asleep.',''],
 66:['Remove two damage counters from Ekans.','Flip: heads Poison.'],
 68:['Force an opposing switch.',''],
 69:['Flip: tails discard a Fire Energy from Houndour.',''],
 72:['Put Defending Pokémon Asleep.','Reduce attacks against Jigglypuff by 20 next turn.'],
 73:['Reduce damage to Kakuna by 30 next turn.','Poison the Defending Pokémon.'],
 74:['','Poison the Defending Pokémon, then apply a coin gate to its next attack.'],
 78:['','Flip: tails do nothing, heads discard a Defending Pokémon Energy.'],
 79:['','10 plus 10 per damage counter on Mankey.'],
 80:['','Flip two coins; 30 plus 20 per heads.'],
 81:['Look at the top three of your deck and reorder them.',''],
 82:['Heal 30, clear Special Conditions, then fall Asleep.','Slowpoke cannot attack next turn.'],
 83:['','Flip: heads Paralyze the Defending Pokémon.'],
 84:['Force the Defending Pokémon to switch.',''],
 86:['Flip: heads prevent all effects and damage on Swablu next opponent turn.','Deal 10 damage to one opposing Benched Pokémon.'],
 87:['Force opposing switch.','20 damage plus 10 per Defending Pokémon Retreat Cost.'],
 88:['Put Defending Pokémon Asleep.','Flip: heads search deck for a Pokémon.'],
 89:['','Burn the Defending Pokémon.'],
 90:['10 plus 10 per extra Energy beyond attack cost, up to +20.','Remove one damage counter from Treecko.'],
 93:['Search deck for a Basic Pokémon and Bench it.','Flip: heads Paralyze the Defending Pokémon.'],
 94:['','Flip: heads deal 10 damage to each opposing Pokémon.'],
 96:['Return any one card from your discard to the top of your deck.','Flip two coins; 10 per heads.']
};
const ABILITY_TEXT={47:['Once during turn while Metapod is Active, flip: heads evolve Metapod from your draw deck.'],63:['Once during turn while Caterpie is Active, flip: heads evolve Caterpie from your draw deck.'],45:['Magcargo cannot be Asleep or Paralyzed.'],15:['Once per turn, put up to two cards from hand onto bottom of deck, then draw until you have six.'],71:['Flip: heads search your deck for a Basic Grass Pokémon and Bench it.'],76:['Discard a card from hand; if Solrock is in play, draw one card.'],92:['With Illumise in play, put a Supporter from your discard on top of your deck.'],32:['Once per turn, put both Active Pokémon Asleep.'],70:['Evolve into a real Jigglypuff from hand and clear damage.'],27:['If damaged, Primeape attacks deal 40 additional damage to the Defending Pokémon.']};
const DATA=RAW.split('\n').map(row=>row.split('|'));
function parse(row){
 const [number,name,kind,stage,hp,code,from,weak,resist,retreat,rarity,moves,powers]=row;
 const n=Number(number),ready=READY.has(n),pokemon=kind==='P',trainer=kind==='T',id='dp4-'+n;
 const parseMod=s=>s?{type:T[s[0]],value:s.slice(1)}:null;
 const card={id,setId:'dp4',number:String(number),name,source:'tcg',battleFormat:'classic',rarity,
   image:`https://images.pokemontcg.io/dp4/${number}.png`,imageLarge:`https://images.pokemontcg.io/dp4/${number}_hires.png`,
   kind:pokemon?'pokemon':trainer?'trainer':'energy'};
 if(pokemon){
  const w=parseMod(weak),r=parseMod(resist);
  Object.assign(card,{stage,hp:Number(hp),types:[...code].map(c=>T[c]),subtype:T[code[0]],retreat:Number(retreat||0),evolvesFrom:from||null,
    weakness:w?.type||null,weaknessValue:w?.value||null,weaknesses:w?[w]:[],
    resistance:r?.type||null,resistanceValue:r?.value||null,resistances:r?[r]:[],
    attacks:(moves||'').split(';').filter(Boolean).map((s,i)=>{const [attackName,cost='',damageText='']=s.split('~');return {
      name:attackName,cost,damage:Number((damageText.match(/^\d+/)||[])[0]||0),damageText:damageText||null,
      text:PRINTS[n]?.[i]??'Printed attack under implementation review; battle entry gated.',effect:EFFECTS[n]?.[i]||N};}),
    abilities:(powers||'').split(';').filter(Boolean).map(s=>{const [power,type]=s.split('~');return {
      name:power,type:type==='Power'?'activated':'passive',printedPowerType:type==='Power'?'power':'body',
      disabledByStatus:type==='Power',text:ABILITY_TEXT[n]?.[0]||'Poké-Power or Poké-Body awaiting battle timing verification.',effect:ABILITIES[n]?.[0]||N};}),
    isLevelX:stage==='Level-Up',levelUpFrom:stage==='Level-Up'?from:null});
  const ownTexts=[...card.attacks.map(a=>a.text),...card.abilities.map(a=>a.text)].join(' ').toLowerCase();
  const roles=[];for(const [role,regex] of Object.entries({draw:/draw|hand/,search:/search|discard to|deck/,status:/asleep|sleep|poison|confus|paraly|burn/,heal:/heal|remove.*damage counter/,ramp:/attach.*energy/,control:/can't|prevent|switch/}))if(regex.test(ownTexts))roles.push(role);
  const types=[...new Set(card.attacks.flatMap(a=>[...a.cost].filter(x=>x!=='C').map(x=>T[x])))];
  card.deckMeta={roles,synergy:roles,energyTypes:types,preferredEnergyTypes:types,inflicts:[],payoffs:[],preferredPartners:[],conditionalAttackEnergyTypes:[],babyEvolutionSupport:[]};
 }else if(trainer){card.trainerType=stage==='Pokémon Tool'?'Tool':stage;card.text=stage==='Item'?'Trainer effect cross-checked against previous print.':'Printed Trainer action awaiting implementation.';card.effect=TRAINER_EFFECTS[n]||N;
  if(n===98)card.text='Discard up to 2 cards from your hand. Discard 1 to draw 3, or 2 to draw 4.';
  if(n===101)card.text='Search your deck or discard for a Pokémon LV.X and put it into your hand.';
  if(n===102)card.text='Choose one of your Basic Pokémon and evolve directly into a valid Stage 1 or Stage 2 card from your hand.';
 }
 return Object.freeze({...card,battleEnabled:ready,deckEligible:ready,support:{status:ready?'FULL':'PARTIAL',reasons:ready?[]:['Effect choices, timing or printed damage not yet independently verified']}});
}
const CARDS=Object.freeze(DATA.map(parse)),MAP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>MAP.get(String(id||''))||null,
 coverage:()=>({total:CARDS.length,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,gated:CARDS.filter(c=>!c.battleEnabled).map(c=>c.id)})};
});
