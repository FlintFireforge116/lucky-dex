/* LuckyDex Classic TCG: Jungle (base2, 1999) battle-card catalogue.
 * Printed identities are separate; holo/non-holo Pokémon share gameplay.
 * Incomplete effects are explicitly disabled rather than silently replaced by vanilla damage.
 */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects);if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexClassicTCGJungle=api;})(typeof globalThis!=='undefined'?globalThis:this,function(effects){
'use strict';
const SET=Object.freeze({id:'base2',name:'Jungle',series:'Base',releaseDate:'1999-06-16',cardCount:64});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless'};
const A=(name,cost,damage,key='')=>({name,cost,damage,key});
const attack=(v)=>{const [name,cost,damage,key='']=v.split('~');return A(name,cost,Number(damage)||0,key);};
// 48 unique Jungle gameplay cards. Entries 17–32 are alternate non-holo prints of 1–16.
// Columns: # | name | type | stage | HP | retreat | weakness | resistance | evolvesFrom | attacks
const TABLE=`
1|Clefable|C|1|70|2|F|P|Clefairy|Metronome~C~0~copy;Minimize~CC~0~minimize
2|Electrode|L|1|90|1|F||Voltorb|Tackle~CC~20;Chain Lightning~LLL~20~chain
3|Flareon|R|1|70|1|W||Eevee|Quick Attack~CC~10~quick;Flamethrower~RRCC~60~fireDiscard
4|Jolteon|L|1|70|1|F||Eevee|Quick Attack~CC~10~quick;Pin Missile~LLC~0~coin4x20
5|Kangaskhan|C|0|90|3|F|P||Fetch~C~0~draw1;Comet Punch~CCCC~0~coin4x20
6|Mr. Mime|P|0|40|1|P|||Meditate~PC~10~meditate
7|Nidoqueen|G|2|90|3|P||Nidorina|Boyfriends~GC~20~boyfriends;Mega Punch~GGCC~50
8|Pidgeot|C|2|80|0|L|F|Pidgeotto|Wing Attack~CC~20;Hurricane~CCC~30~hurricane
9|Pinsir|G|0|60|1|R|||Irongrip~GG~20~paralyze;Guillotine~GGCC~50
10|Scyther|G|0|70|0|R|F||Swords Dance~G~0~swords;Slash~CCC~30
11|Snorlax|C|0|90|4|F|P||Body Slam~CCCC~30~paralyze
12|Vaporeon|W|1|80|1|L||Eevee|Quick Attack~CC~10~quick;Water Gun~WWC~30~watergun
13|Venomoth|G|1|70|0|R|F|Venonat|Venom Powder~GG~10~confusePoison
14|Victreebel|G|2|80|2|R||Weepinbell|Lure~G~0~lure;Acid~GG~20~retreatLock
15|Vileplume|G|2|80|2|R||Gloom|Petal Dance~GGG~0~petaldance
16|Wigglytuff|C|1|80|2|F|P|Jigglypuff|Lullaby~C~0~sleep;Do the Wave~CCC~10~wave
33|Butterfree|G|2|70|0|R|F|Metapod|Whirlwind~CC~20~whirlwind;Mega Drain~GGGG~40~megadrain
34|Dodrio|C|1|70|0|L|F|Doduo|Rage~CCC~10~rage
35|Exeggutor|G|1|80|3|R||Exeggcute|Teleport~P~0~teleport;Big Eggsplosion~C~0~energyCoins
36|Fearow|C|1|70|0|L|F|Spearow|Agility~CCC~20~agility;Drill Peck~CCCC~40
37|Gloom|G|1|60|1|R||Oddish|Poisonpowder~G~0~poison;Foul Odor~GG~20~doubleConfuse
38|Lickitung|C|0|90|3|F|P||Tongue Wrap~C~10~paralyze;Supersonic~CC~0~confuse
39|Marowak|F|1|60|1|G|L|Cubone|Bonemerang~FF~0~coin2x30;Call for Friend~FFC~0~callFighting
40|Nidorina|G|1|70|1|P||Nidoran ♀|Supersonic~G~0~confuse;Double Kick~GCC~0~coin2x30
41|Parasect|G|1|60|1|R||Paras|Spore~GG~0~sleep;Slash~CCC~30
42|Persian|C|1|70|0|F|P|Meowth|Scratch~CC~20;Pounce~CCC~30~pounce
43|Primeape|F|1|70|1|P||Mankey|Fury Swipes~FF~0~coin3x20;Tantrum~FFC~50~selfConfuseTails
44|Rapidash|R|1|70|0|W||Ponyta|Stomp~CC~20~quick10;Agility~RRC~30~agility
45|Rhydon|F|1|100|3|G|L|Rhyhorn|Horn Attack~FCC~30;Ram~FFFF~50~ram
46|Seaking|W|1|70|1|L||Goldeen|Horn Attack~W~10;Waterfall~WC~30
47|Tauros|C|0|60|2|F|P||Stomp~CC~20~quick10;Rampage~CCC~20~rampage
48|Weepinbell|G|1|70|1|R||Bellsprout|Poisonpowder~G~10~paralyzePoison;Razor Leaf~GG~30
49|Bellsprout|G|0|40|1|R|||Vine Whip~G~10;Call for Family~G~0~callBellsprout
50|Cubone|F|0|40|1|G|L||Snivel~C~0~snivel;Rage~FF~10~rage
51|Eevee|C|0|50|1|F|P||Tail Wag~C~0~tailWag;Quick Attack~CC~10~quick
52|Exeggcute|G|0|50|1|R|||Hypnosis~P~0~sleep;Leech Seed~GG~20~leech10
53|Goldeen|W|0|40|0|L|||Horn Attack~W~10
54|Jigglypuff|C|0|60|1|F|P||Lullaby~C~0~sleep;Pound~CC~20
55|Mankey|F|0|30|0|P|||Scratch~C~10
56|Meowth|C|0|50|1|F|P||Pay Day~CC~10~payday
57|Nidoran ♀|G|0|60|1|P|||Fury Swipes~G~0~coin3x10;Call for Family~GG~0~callNidoran
58|Oddish|G|0|50|1|R|||Stun Spore~G~10~paralyze;Sprout~GG~0~callOddish
59|Paras|G|0|40|1|R|||Scratch~CC~20;Spore~GG~0~sleep
60|Pikachu|L|0|50|1|F|||Spark~LL~20~spark
61|Rhyhorn|F|0|70|3|G|L||Leer~C~0~tailWag;Horn Attack~FCC~30
62|Spearow|C|0|50|0|L|F||Peck~C~10;Mirror Move~CCC~0~mirror
63|Venonat|G|0|40|1|R|||Stun Spore~G~10~paralyze;Leech Life~GC~10~drain
`.trim().split('\n').map(s=>s.trim()).filter(Boolean);
const SYMBOLS=Object.freeze({Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Colorless:'C'});
const coinStatus=status=>({type:'coinFlip',heads:{type:'status',target:'opponentActive',status}});
const bonus=n=>({type:'coinFlip',heads:{type:'bonusDamage',amount:n}});
const variable=(coins,amount)=>({type:'coinDamage',coins,amount,mode:'replace'});
const conditions={sleep:'sleep',poison:'poison',confusion:'confusion',paralysis:'paralysis'};
const status=s=>({type:'status',target:'opponentActive',status:s});
const rule=(key)=>{
 switch(key){
  case '':return null;
  case 'quick':return bonus(20);
  case 'quick10':return bonus(10);
  case 'fireDiscard':return {type:'discardEnergyCard',target:'self',energyType:'Fire',amount:1,useCost:true};
  case 'coin4x20':return variable(4,20);
  case 'coin3x20':return variable(3,20);
  case 'coin3x10':return variable(3,10);
  case 'coin2x30':return variable(2,30);
  case 'paralyze':return coinStatus('paralysis');
  case 'paralyzePoison':return coinStatus('poison');
  case 'confuse':return coinStatus('confusion');
  case 'sleep':return status('sleep');
  case 'poison':return status('poison');
  case 'confusePoison':return {type:'coinFlip',heads:{type:'sequence',effects:[status('confusion'),status('poison')]}};
  case 'draw1':return {type:'draw',side:'self',amount:1};
  case 'meditate':return {type:'damageFromDamage',source:'opponent',amount:1};
  case 'boyfriends':return {type:'fieldCountDamage',side:'self',amount:20,filter:{name:'Nidoking'}};
  case 'watergun':return {type:'energyDamage',source:'self',energyType:'Water',extraAbove:2,maxCount:2,amount:10};
  case 'energyCoins':return {type:'coinDamageByEnergy',amount:20,mode:'replace',countCards:true};
  case 'rage':return {type:'damageFromDamage',source:'self',amount:1};
  case 'rampage':return {type:'sequence',effects:[{type:'damageFromDamage',source:'self',amount:1},{type:'coinFlip',tails:statusSelf('confusion')}]};
  case 'selfConfuseTails':return {type:'coinFlip',tails:statusSelf('confusion')};
  case 'doubleConfuse':return {type:'sequence',effects:[status('confusion'),statusSelf('confusion')]};
  case 'swords':return {type:'nextAttackBonus',attackName:'Slash',amount:30};
  case 'wave':return {type:'benchCountDamage',side:'self',amount:10};
  case 'agility':return {type:'coinFlip',heads:{type:'preventDamage',target:'self',duration:'opponentTurn',effects:true}};
  case 'megadrain':return {type:'drain',fraction:0.5};
  case 'leech10':return {type:'drain',amount:10};
  case 'drain':return {type:'drain'};
  case 'payday':return {type:'coinFlip',heads:{type:'draw',side:'self',amount:1}};
  case 'minimize':return {type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn',scope:'self'};
  case 'copy':return {type:'copyAttack',source:'opponentActive',ignoreUseCosts:true};
  case 'callFighting':return {type:'benchFromDeck',amount:1,filter:{kind:'pokemon',stage:'Basic',subtype:'Fighting'}};
  case 'callBellsprout':return {type:'benchFromDeck',amount:1,filter:{kind:'pokemon',stage:'Basic',name:'Bellsprout'}};
  case 'callOddish':return {type:'benchFromDeck',amount:1,filter:{kind:'pokemon',stage:'Basic',name:'Oddish'}};
  case 'callNidoran':return {type:'benchFromDeck',amount:1,filter:{kind:'pokemon',stage:'Basic',name:['Nidoran ♀','Nidoran♂']}};
  case 'whirlwind':return {type:'forceOpponentSwitch'};
  case 'lure':return {type:'switch',side:'opponent'};
  case 'teleport':return {type:'switch',side:'self'};
  case 'pounce':return {type:'modifier',stat:'damageReduction',amount:10,duration:'opponentTurn',scope:'self'};
  case 'snivel':return {type:'modifier',stat:'damageReduction',amount:20,duration:'opponentTurn',scope:'self'};
  case 'tailWag':return {type:'coinFlip',heads:{type:'lock',action:'attack',target:'opponentActive',duration:'opponentTurn'}};
  case 'retreatLock':return {type:'coinFlip',heads:{type:'lock',action:'retreat',target:'opponentActive',duration:'opponentTurn'}};
  case 'petaldance':return {type:'sequence',effects:[variable(3,40),statusSelf('confusion')]};
  case 'spark':return {type:'benchDamage',side:'opponent',amount:10};
  case 'mirror':return {type:'mirrorLastAttackResult'};
  case 'hurricane':return {type:'returnIfSurvives',target:'opponentActive'};
  case 'ram':return {type:'sequence',effects:[{type:'selfDamage',amount:20},{type:'forceOpponentSwitch'}]};
  case 'chain':return {type:'chainLightning',amount:10};
  default:return {type:'notImplemented',key};
 }
};
function statusSelf(s){return {type:'status',target:'self',status:s};}
const ABILITIES={
 6:[{name:'Invisible Wall',type:'passive',disabledByStatus:true,effect:{type:'preventDamage',target:'self',duration:'whileInPlay',minDamage:30},text:'Prevent attack damage of 30 or more to Mr. Mime after Weakness and Resistance; other attack effects still apply. This Power stops working while Mr. Mime is affected by a Special Condition.'}],
 11:[{name:'Thick Skinned',type:'passive',disabledByStatus:true,effect:{type:'preventStatus',target:'self',duration:'whileInPlay'},text:'Snorlax cannot be Asleep, Confused, Paralyzed or Poisoned unless this Power is disabled.'}],
 13:[{name:'Shift',type:'activated',oncePerTurn:true,disabledByStatus:true,effect:{type:'chooseTypeOverride',target:'self',stat:'type',energyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting']},text:'Once per turn, choose a non-Colorless type of another Pokémon in play; Venomoth becomes that type until your next turn.'}],
 15:[{name:'Heal',type:'activated',oncePerTurn:true,disabledByStatus:true,effect:{type:'coinFlip',heads:{type:'heal',target:'selfPokemon',amount:10}},text:'Once per turn, flip a coin. On heads, remove one damage counter from one of your Pokémon.'}],
 34:[{name:'Retreat Aid',type:'passive',benchOnly:true,effect:{type:'modifier',stat:'retreatCost',amount:-1,duration:'whileInPlay',scope:'team'},text:'While Dodrio is on your Bench, your Active Pokémon pays one fewer Colorless Energy to retreat.'}],
 55:[{name:'Peek',type:'activated',oncePerTurn:true,disabledByStatus:true,effect:{type:'peek'},text:'Once per turn, look at the top card of either deck, a random card in the opponent’s hand, or one Prize card.'}]
};
// Descriptions are paraphrases of the printed rules, not engine-specific jargon.
const DESCRIPTIONS={
 copy:'Choose an attack of the Defending Pokémon and copy it. Ignore its Energy and discard requirements.',minimize:'Reduce attack damage to Clefable by 20 during your opponent’s next turn.',
 chain:'Deal 10 damage to each Benched Pokémon on both sides sharing the Defending Pokémon’s type, unless that type is Colorless.',
 quick:'Flip a coin: on heads, this attack does 20 additional damage.',quick10:'Flip a coin: on heads, do 10 additional damage.',fireDiscard:'Discard one attached Fire Energy to use this attack.',
 coin4x20:'Flip four coins; deal 20 damage per heads.',coin3x20:'Flip three coins; deal 20 damage per heads.',coin3x10:'Flip three coins; deal 10 damage per heads.',coin2x30:'Flip two coins; deal 30 damage per heads.',
 paralyze:'Flip a coin: on heads, the Defending Pokémon is Paralyzed.',paralyzePoison:'Flip a coin: on heads, the Defending Pokémon is Poisoned.',confuse:'Flip a coin: on heads, the Defending Pokémon is Confused.',sleep:'The Defending Pokémon becomes Asleep.',poison:'The Defending Pokémon becomes Poisoned.',
 confusePoison:'Flip a coin: on heads, the Defending Pokémon becomes both Confused and Poisoned.',
 draw1:'Draw one card.',meditate:'Deal 10 more damage for each damage counter on the Defending Pokémon.',boyfriends:'Deal 20 more damage for each Nidoking you have in play.',
 watergun:'Deal 10 more damage for each extra Water Energy beyond the two required, maximum 20 extra.',energyCoins:'Flip a coin for each Energy attached; deal 20 damage per heads.',
 rage:'Deal 10 more damage for each damage counter on this Pokémon.',rampage:'Deal 10 more damage per damage counter on Tauros; flip a coin and Confuse Tauros on tails.',selfConfuseTails:'Flip a coin; on tails, this Pokémon becomes Confused.',doubleConfuse:'Both this Pokémon and the Defending Pokémon become Confused.',
 swords:'During your next turn, Slash deals 60 damage rather than 30.',wave:'Deal 10 extra damage for each Pokémon on your Bench.',
 agility:'Flip a coin; on heads, prevent all effects of attacks on this Pokémon during the opponent’s next turn.',megadrain:'Heal half the damage dealt, rounded up to the nearest damage counter.',leech10:'If damage is dealt, remove one damage counter from this Pokémon.',drain:'Heal this Pokémon for the damage actually dealt.',
 payday:'Flip a coin; draw one card if heads.',
 callFighting:'Search your deck for a Basic Fighting Pokémon and put it on your Bench, then shuffle.',callBellsprout:'Search your deck for a Basic Bellsprout and put it on your Bench, then shuffle.',callOddish:'Search your deck for a Basic Oddish and put it on your Bench, then shuffle.',callNidoran:'Search for a Basic Nidoran♂ or Nidoran♀, put it on your Bench, then shuffle.',
 whirlwind:'After damage, your opponent chooses a Benched Pokémon to switch into Active.',lure:'Choose an opponent’s Benched Pokémon to replace their Active Pokémon.',teleport:'Switch Exeggutor with one of your Benched Pokémon.',
 pounce:'If the Defending Pokémon attacks Persian next turn, reduce its damage by 10 while both stay Active.',snivel:'Reduce attack damage to Cubone by 20 during the opponent’s next turn while both stay Active.',
 tailWag:'Flip a coin; on heads, the Defending Pokémon cannot attack this Pokémon next turn while both stay Active.',retreatLock:'Flip a coin; on heads, the Defending Pokémon cannot retreat next turn.',
 petaldance:'Flip three coins and deal 40 damage per heads. Afterwards Vileplume becomes Confused.',spark:'Deal 10 damage to one of the opponent’s Benched Pokémon, ignoring Weakness and Resistance.',mirror:'If this Pokémon was attacked last turn, copy the resulting damage and effects to the Defending Pokémon.',
 hurricane:'After damage, unless it knocks out the defender, return that Pokémon and all attached cards to its owner’s hand.',ram:'Deal 20 damage to Rhydon itself; after dealing damage, the opponent switches their Active Pokémon.',
};
const UNIQUE=[];
for(const line of TABLE){const fields=line.split('|');if(fields.length!==10)throw new Error('Malformed Jungle card '+line);const [number,name,type,stage,hp,ret,weak,res,evolvesFrom,moveStr]=fields;
 const attacks=moveStr.split(';').map(v=>{const raw=attack(v),effect=rule(raw.key),valid=effects?.supportsEffect?.(effect)!==false;return {name:raw.name,cost:raw.cost,damage:raw.damage,damageText:raw.key.startsWith('coin')||raw.key==='petaldance'||raw.key==='energyCoins'?'×':raw.key==='meditate'||raw.key==='boyfriends'||raw.key==='rage'||raw.key==='rampage'||raw.key==='wave'||raw.key==='watergun'||raw.key==='quick'||raw.key==='quick10'?'+':null,effect,text:DESCRIPTIONS[raw.key]||'',_unsupported:!valid};});
 const abilities=ABILITIES[Number(number)]||[],reasons=[...attacks.filter(a=>a._unsupported).map(a=>`Unimplemented ${a.name} mechanics`),...abilities.filter(a=>!effects?.supportsEffect?.(a.effect)).map(a=>`Unimplemented ${a.name} Power`)];
 UNIQUE.push({number:Number(number),name,stage:stage==='0'?'Basic':`Stage ${stage}`,hp:Number(hp),retreat:Number(ret),subtype:TYPE[type],types:[TYPE[type]],weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolvesFrom||null,attacks:attacks.map(({_unsupported,...a})=>a),abilities,kind:'pokemon',battleEnabled:reasons.length===0,deckEligible:reasons.length===0,support:{status:reasons.length?'PARTIAL':'FULL',reasons}});
}
const cards=[];
for(let n=1;n<=64;n++){
 if(n===64){cards.push({id:'base2-64',name:'Poké Ball',setId:'base2',number:'64',kind:'trainer',trainerType:'Item',battleFormat:'classic',source:'tcg',text:'Flip a coin. If heads, search your deck for a Pokémon, add it to your hand, and shuffle your deck.',effect:{type:'coinFlip',heads:{type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon'}}},battleEnabled:true,deckEligible:true,support:{status:'FULL',reasons:[]},image:'https://images.pokemontcg.io/base2/64.png',imageLarge:'https://images.pokemontcg.io/base2/64_hires.png'});continue;}
 const original=n>=17&&n<=32?n-16:n;
 const record=UNIQUE.find(x=>x.number===original);if(!record)throw new Error('Missing Jungle card #'+n);
 const {number,...meta}=record;cards.push({...meta,id:`base2-${n}`,setId:'base2',number:String(n),battleFormat:'classic',source:'tcg',image:`https://images.pokemontcg.io/base2/${n}.png`,imageLarge:`https://images.pokemontcg.io/base2/${n}_hires.png`,rarity:n<=16?'Rare Holo':n<=32?'Rare':n<=48?'Uncommon':'Common'});
}
const CARDS=Object.freeze(cards),LOOKUP=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS,cardById:id=>LOOKUP.get(String(id||'').trim().toLowerCase())||null,coverage:()=>({total:64,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
