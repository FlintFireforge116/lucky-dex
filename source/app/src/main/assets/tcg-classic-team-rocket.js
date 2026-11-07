/* Team Rocket (2000) / base5. Printed identities are complete; only effects
 * faithfully implemented by the current Classic engine are battle-enabled.
 * Do not substitute damage for effects the engine cannot yet model.
 */
(function(root,factory){
 const fx=typeof module==='object'&&module.exports?require('./tcgp-battle-effects.js'):root.LuckyDexTCGPBattleEffects;
 const api=factory(fx);if(typeof module==='object'&&module.exports)module.exports=api;else root.LuckyDexClassicTCGTeamRocket=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(fx){'use strict';
const SET=Object.freeze({id:'base5',name:'Team Rocket',series:'Base',releaseDate:'2000-04-24',cardCount:83});
const TYPE={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',C:'Colorless'};
// number|name|type|stage|HP|retreat|weakness|resistance|evolves from|attack~cost~damage~mechanic (;-separated)
const TABLE=`
1|Dark Alakazam|P|2|60|3|P||Dark Kadabra|Teleport Blast~PPC~30~teleport;Mind Shock~PPP~40~noWeakness
2|Dark Arbok|G|1|60|2|P||Ekans|Stare~GG~0~stare;Poison Vapor~GGG~10~poisonVapor
3|Dark Blastoise|W|2|70|2|L||Dark Wartortle|Hydrocannon~WW~30~hydrocannon;Rocket Tackle~WCC~40~rocketTackle
4|Dark Charizard|R|2|80|3|W|F|Dark Charmeleon|Nail Flick~C~10;Continuous Fireball~RR~0~continuousFireball
5|Dark Dragonite|C|2|70|2||F|Dark Dragonair|Giant Tail~CCCC~70~attackGate
6|Dark Dugtrio|F|1|50|2|G|L|Diglett|Knock Down~FF~20~knockDown
7|Dark Golbat|G|1|50|0|P|F|Zubat|Flitter~GG~0~flitter
8|Dark Gyarados|W|1|70|2|G|F|Magikarp|Ice Beam~WWW~30~paralyze
9|Dark Hypno|P|1|60|2|P||Drowzee|Psypunch~P~20;Bench Manipulation~PPC~0~benchManipulation
10|Dark Machamp|F|2|70|3|P||Dark Machoke|Mega Punch~FF~30;Fling~FFFC~0~fling
11|Dark Magneton|L|1|60|2|F||Magnemite|Sonicboom~CC~20~noWeakness;Magnetic Lines~LL~30~magneticLines
12|Dark Slowbro|P|1|60|2|P||Slowpoke|Fickle Attack~PP~40~attackGate
13|Dark Vileplume|G|2|60|2|R||Dark Gloom|Petal Whirlwind~GGG~0~petalWhirlwind
14|Dark Weezing|G|1|60|1|P||Koffing|Mass Explosion~GC~0~massExplosion;Stun Gas~GGG~20~stunGas
32|Dark Charmeleon|R|1|50|2|W||Charmander|Tail Slap~CC~20;Fireball~RRR~70~fireball
33|Dark Dragonair|C|1|60|2||P|Dratini|Tail Strike~CCC~20~bonus20
34|Dark Electrode|L|1|60|1|F||Voltorb|Rolling Tackle~C~10;Energy Bomb~LL~30~energyBomb
35|Dark Flareon|R|1|50|1|W||Eevee|Rage~C~10~rage;Playing with Fire~RR~30~playingWithFire
36|Dark Gloom|G|1|50|2|R||Oddish|Poisonpowder~GG~10~poison
37|Dark Golduck|W|1|60|2|L||Psyduck|Third Eye~P~0~thirdEye;Super Psy~PPC~50
38|Dark Jolteon|L|1|50|1|F||Eevee|Lightning Flash~L~20~smokescreen;Thunder Attack~LLC~30~thunderAttack
39|Dark Kadabra|P|1|50|2|P||Abra|Mind Shock~PP~30~noWeakness
40|Dark Machoke|F|1|60|2|P||Machop|Drag Off~FFC~20~dragOff;Knock Back~FFC~30~knockBack
41|Dark Muk|G|1|60|2|P||Grimer|Sludge Punch~GG~20~poison
42|Dark Persian|C|1|60|0|F|P|Meowth|Fascinate~C~0~fascinate;Poison Claws~CC~10~poisonFlip
43|Dark Primeape|F|1|60|1|P||Mankey|Frenzied Attack~FF~40~selfConfuse
44|Dark Rapidash|R|1|60|0|W||Ponyta|Rear Kick~CC~20;Flame Pillar~RR~30~flamePillar
45|Dark Vaporeon|W|1|60|1|L||Eevee|Bite~CCC~30;Whirlpool~WWC~20~discardEnergy
46|Dark Wartortle|W|1|60|1|L||Squirtle|Doubleslap~W~0~coin2x10;Mirror Shell~WC~0~mirrorShell
47|Magikarp|W|0|30|1|L|||Flop~C~10;Rapid Evolution~WWW~0~rapidEvolution
48|Porygon|C|0|40|0|F|P||Conversion 1~C~0~conversion;Psybeam~CCC~20~confuseFlip
49|Abra|P|0|40|1|P|||Vanish~P~0~vanish;Psyshock~P~10~paralyze
50|Charmander|R|0|40|1|W|||Fire Tail~R~20
51|Dark Raticate|C|1|50|1|F|P|Rattata|Gnaw~CC~20;Hyper Fang~CCC~50~attackGate
52|Diglett|F|0|40|0|G|L||Dig Under~F~0~digUnder;Scratch~FC~20
53|Dratini|C|0|40|1||P||Wrap~CC~10~paralyze
54|Drowzee|P|0|50|1|P|||Nightmare~PC~10~sleep
55|Eevee|C|0|40|1|F|P||Tackle~C~10;Sand-attack~CC~10~smokescreen
56|Ekans|G|0|50|1|P|||Bite~C~10;Poison Sting~GG~20~poisonFlip
57|Grimer|G|0|40|1|P|||Poison Gas~G~0~sleep;Sticky Hands~GG~10~stickyHands
58|Koffing|G|0|40|1|P|||Tackle~C~10;Poison Gas~GC~20~poisonFlip
59|Machop|F|0|50|1|P|||Punch~CC~20;Kick~FCC~30
60|Magnemite|L|0|40|1|F|||Tackle~CC~20;Magnetism~LC~10~magnetism
61|Mankey|F|0|40|0|P|||Mischief~C~0~mischief;Anger~FC~20~bonus20
62|Meowth|C|0|40|1|F|P||Coin Hurl~CC~0~coinHurl
63|Oddish|G|0|50|1|R|||Sleep Powder~G~0~sleep;Poisonpowder~G~0~poison
64|Ponyta|R|0|50|1|W|||Ember~RC~30~fireDiscard
65|Psyduck|W|0|50|1|L|||Dizziness~P~0~draw;Water Gun~WC~20~waterGun
66|Rattata|C|0|40|0|F|P||Quick Attack~C~10~bonus10
67|Slowpoke|P|0|50|1|P|||Afternoon Nap~C~0~basicEnergySearch;Headbutt~P~10
68|Squirtle|W|0|50|1|L|||Shell Attack~CC~20
69|Voltorb|L|0|40|1|F|||Speed Ball~L~20
70|Zubat|G|0|40|0|P|F||Ram~C~10;Bite~GC~20
83|Dark Raichu|L|1|70|1|F||Pikachu|Surprise Thunder~LLL~30~surpriseThunder
`.trim().split('\n');
const noop={type:'noop'};
const status=kind=>({type:'status',target:'opponentActive',status:kind});
const coin=(heads,tails)=>({type:'coinFlip',heads,tails});
const fxByKey={
 noWeakness:{type:'damageRule',ignoreWeakness:true,ignoreResistance:true},
 paralyze:coin(status('paralysis')),confuseFlip:coin(status('confusion')),
 poison:status('poison'),sleep:status('sleep'),poisonFlip:coin(status('poison')),
 smokescreen:{type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},
 attackGate:{type:'coinAttackGate',heads:noop},bonus20:coin({type:'bonusDamage',amount:20}),bonus10:coin({type:'bonusDamage',amount:10}),
 draw:{type:'draw',amount:1},
 hydrocannon:{type:'energyDamage',source:'self',energyType:'Water',extraAbove:2,maxCount:2,amount:20},
 rocketTackle:{type:'sequence',effects:[{type:'selfDamage',amount:10},coin({type:'preventDamage',target:'self',duration:'opponentTurn'})]},
 continuousFireball:{type:'coinDamageByEnergy',energyType:'Fire',amount:50,discardHeads:true},
 knockDown:coin(noop,{type:'bonusDamage',amount:20}),
 stunGas:coin(status('poison'),status('paralysis')),
 fireball:{type:'coinAttackGate',heads:{type:'discardEnergy',target:'self',energyType:'Fire',amount:1}},
 rage:{type:'damageFromDamage',source:'self',amount:1},
 thunderAttack:coin(status('paralysis'),{type:'selfDamage',amount:10}),
 knockBack:{type:'forceOpponentSwitch'},
 fascinate:coin({type:'forceOpponentSwitch'}),
 selfConfuse:statusSelf('confusion'),
 discardEnergy:{type:'discardEnergyCard',target:'opponentActive',amount:1},
 mirrorShell:{type:'neoRule',rule:'legendary:mirrorShell'},
 coin2x10:{type:'coinDamage',coins:2,amount:10,mode:'replace'},
 conversion:{type:'chooseTypeOverride',target:'opponentActive',stat:'weakness',energyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting']},
 digUnder:{type:'selectedDamage',target:'opponentPokemon',amount:10},
 stickyHands:coin({type:'sequence',effects:[{type:'bonusDamage',amount:20},status('paralysis')]}),
 mischief:{type:'shuffleDeck',side:'opponent'},
 coinHurl:coin({type:'selectedDamage',target:'opponentPokemon',amount:20}),
 fireDiscard:{type:'discardEnergy',target:'self',energyType:'Fire',amount:1,useCost:true},
 waterGun:{type:'energyDamage',source:'self',energyType:'Water',extraAbove:1,maxCount:2,amount:10},
 surpriseThunder:coin(coin({type:'benchDamage',side:'opponent',all:true,amount:20},{type:'benchDamage',side:'opponent',all:true,amount:10}))
};
function statusSelf(s){return {type:'status',target:'self',status:s};}
// Each description is a concise rendition of the printed gameplay. The card's
// exact printed rules remain visible in the artwork. No placeholders.
const descriptions={
 teleport:'After dealing damage, you may switch Dark Alakazam with a Benched Pokémon.',
 noWeakness:'Ignore Weakness and Resistance for this attack.',
 stare:'Choose an opposing Pokémon; deal 10 damage, ignoring Weakness and Resistance, and disable its Power through the opponent’s next turn.',
 poisonVapor:'Poison the Defending Pokémon and damage every opposing Benched Pokémon for 10.',
 hydrocannon:'Deal 20 extra damage for each additional Water Energy beyond the two required, up to 40 more.',
 rocketTackle:'Deal 10 damage to Dark Blastoise; flip a coin. On heads, prevent attack damage to it next turn.',
 continuousFireball:'Flip once per attached Fire Energy. Deal 50 damage per heads, then discard that many Fire Energy.',
 attackGate:'Flip a coin. On tails, this attack does no damage.',knockDown:'Your opponent flips a coin. On tails, deal 20 additional damage.',
 flitter:'Choose any opposing Pokémon and deal 20 damage, ignoring Weakness and Resistance.',
 paralyze:'Flip a coin. On heads, Paralyze the Defending Pokémon.',
 benchManipulation:'Your opponent flips once for each Benched Pokémon. Deal 20 damage per tails, ignoring Weakness and Resistance.',
 fling:'Shuffle the opponent’s Active Pokémon and all attached cards into their deck. Requires an opposing Benched Pokémon.',
 magneticLines:'Move a basic Energy card attached to the defender onto one of the opponent’s Benched Pokémon.',
 massExplosion:'Deal 20 damage per Koffing, Weezing and Dark Weezing in play, then damage all those Pokémon for 20.',
 stunGas:'On heads, Poison; on tails, Paralyze the Defending Pokémon.',
 petalWhirlwind:'Flip coins for 30 damage per heads. On at least two heads, Confuse Dark Vileplume.',
 fireball:'Flip a coin. Heads deals 70 damage and discards one Fire Energy; tails does nothing.',
 bonus20:'Flip a coin. On heads, deal 20 additional damage.',bonus10:'Flip a coin. On heads, deal 10 additional damage.',
 energyBomb:'Move all attached Energy cards to your Benched Pokémon. Discard them if your Bench is empty.',
 rage:'Deal 10 additional damage for each damage counter on this Pokémon.',
 playingWithFire:'Flip a coin. On heads, discard a Fire Energy to do 20 more damage.',
 poison:'Poison the Defending Pokémon.',thirdEye:'Discard an attached Energy card to draw up to three cards.',
 smokescreen:'The defender must flip a coin when attacking next turn; tails makes that attack fail.',
 thunderAttack:'Flip a coin. On heads, Paralyze the defender; on tails, Dark Jolteon takes 10 damage.',
 dragOff:'Before damage, switch an opposing Benched Pokémon into Active; this attack targets the new Active Pokémon.',
 knockBack:'After dealing damage, force the opponent to switch their Active Pokémon.',
 fascinate:'Flip a coin. On heads, switch an opposing Benched Pokémon into Active.',
 poisonFlip:'Flip a coin. On heads, Poison the Defending Pokémon.',
 selfConfuse:'After attacking, Confuse Dark Primeape.',
 flamePillar:'You may discard a Fire Energy to deal 10 damage to one opposing Benched Pokémon.',
 discardEnergy:'Discard an Energy card attached to the defender.',
 coin2x10:'Flip two coins; deal 10 damage for each heads.',
 mirrorShell:'If damaged by an attack on the opponent’s next turn, deal an equal amount back to the attacker.',
 rapidEvolution:'Search for Gyarados or Dark Gyarados and evolve Magikarp immediately.',
 conversion:'Change the defending Pokémon’s Weakness to a non-Colorless type you choose.',
 confuseFlip:'Flip a coin. On heads, Confuse the Defending Pokémon.',
 vanish:'Shuffle Abra into your deck and discard its attached cards.',
 sleep:'Put the Defending Pokémon to Sleep.',
 digUnder:'Choose any opposing Pokémon; deal 10 damage ignoring Weakness and Resistance.',
 stickyHands:'Flip a coin. On heads, deal 20 more damage and Paralyze the Defending Pokémon.',
 magnetism:'Deal 10 more damage per Magnemite, Magneton and Dark Magneton on your Bench.',
 mischief:'Shuffle the opponent’s deck.',coinHurl:'Choose an opposing Pokémon and flip a coin. Heads deals 20 damage, ignoring Weakness and Resistance.',
 fireDiscard:'Discard one attached Fire Energy to use this attack.',draw:'Draw a card.',
 waterGun:'Deal 10 extra damage per excess Water Energy, maximum 20 extra.',
 basicEnergySearch:'Search your deck for a Psychic Basic Energy and attach it to Slowpoke.',
 surpriseThunder:'Flip a coin. On heads, flip again: deal 20 damage to each opposing Benched Pokémon on heads, or 10 on tails.'
};
const powerText={
 5:['Summon Minions','On evolution, search for up to two Basic Pokémon and put them on your Bench.'],
 6:['Sinkhole','When the opponent retreats, their coin flip may deal 20 damage to that Pokémon.'],
 7:['Sneak Attack','On evolution, deal 10 damage to an opposing Pokémon, applying Weakness and Resistance.'],
 8:['Final Beam','When knocked out by an attack, a coin flip can reflect 20 damage per attached Water Energy.'],
 12:['Reel In','On evolution, take up to three Pokémon cards from your discard pile into your hand.'],
 13:['Hay Fever','Neither player can play Trainer cards while this Power is active.'],
 33:['Evolutionary Light','Once per turn, find an Evolution card in your deck and put it in your hand.'],
 36:['Pollen Stench','Once per turn, flip a coin. Heads Confuses the defender; tails Confuses your Active Pokémon.'],
 39:['Matter Exchange','Once per turn, discard a card from your hand to draw one card.'],
 41:['Sticky Goo','While Dark Muk is Active, the opponent pays two additional Colorless Energy to retreat.'],
 43:['Frenzy','When Dark Primeape deals damage while Confused, it deals 30 extra damage.'],
 50:['Gather Fire','Once per turn, move one Fire Energy from another of your Pokémon to Charmander.'],
 54:['Long-Distance Hypnosis','Once per turn, flip a coin. Heads puts the defender to Sleep; tails puts your Active Pokémon to Sleep.'],
 66:['Trickery','Once per turn, exchange a Prize with the top card of your deck.']
};
const powerEffect={
 5:{type:'neoRule',rule:'legendary:summonMinions'},
 12:{type:'neoRule',rule:'legendary:reelIn'},
 33:{type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon',stage:['Stage 1','Stage 2']}},
 41:{type:'modifier',stat:'retreatCost',amount:2,duration:'whileInPlay',scope:'opponentActive'},
 36:{type:'coinFlip',heads:status('confusion'),tails:statusSelf('confusion')},
 54:{type:'coinFlip',heads:status('sleep'),tails:statusSelf('sleep')}
};
const power=[5,6,7,8,12,13,33,36,39,41,43,50,54,66];
const UNIQUE=new Map();
for(const line of TABLE){const [number,name,type,stage,hp,ret,weak,res,evolvesFrom,moves]=line.split('|');const n=Number(number);
 const attacks=(moves||'').split(';').filter(Boolean).map(raw=>{const [name,cost,rawDamage,key='']=raw.split('~');const effect=key?(fxByKey[key]||{type:'notImplemented',key}):null;return {name,cost,damage:Number(rawDamage)||0,damageText:/coin|surpriseThunder|continuousFireball|petalWhirlwind|massExplosion|benchManipulation/.test(key)?'×':/bonus|hydrocannon|rage|waterGun|stickyHands|magnetism|knockDown/.test(key)?'+':null,effect,text:descriptions[key]||''};});
 const abilities=powerText[n]?[{name:powerText[n][0],text:powerText[n][1],type:[5,12].includes(n)?'triggered':n===41?'passive':'activated',...([5,12].includes(n)?{event:'evolved',fromHandOnly:true}:n===41?{activeOnly:true}:{oncePerTurn:true}),disabledByStatus:true,effect:powerEffect[n]||null}]:[];
 const reasons=[...attacks.filter(a=>a.effect?.type==='notImplemented'||a.effect&&!fx?.supportsEffect?.(a.effect)).map(a=>`${a.name}: printed effect not implemented`)];
 if(power.includes(n)&&!powerEffect[n])reasons.push(`${powerText[n][0]}: Pokémon Power not implemented`);
 if(powerEffect[n]&&!fx?.supportsEffect?.(powerEffect[n]))reasons.push('Pokémon Power unsupported');
 UNIQUE.set(n,{name,kind:'pokemon',stage:stage==='0'?'Basic':`Stage ${stage}`,hp:Number(hp),retreat:Number(ret),subtype:TYPE[type],types:[TYPE[type]],weakness:TYPE[weak]||null,weaknessValue:weak?'×2':null,resistance:TYPE[res]||null,resistanceValue:res?'-30':null,evolvesFrom:evolvesFrom||null,attacks,abilities,battleEnabled:!reasons.length,deckEligible:!reasons.length,support:{status:reasons.length?'PARTIAL':'FULL',reasons}});
}
const TRAINERS={
 15:['Here Comes Team Rocket!','Each player turns all their Prize cards face up for the remainder of the game.'],
 16:["Rocket's Sneak Attack",'Look at the opponent’s hand and shuffle one of their Trainer cards into their deck.'],
 17:['Rainbow Energy','Provides one Energy of any Basic type when attached, and deals 10 damage to that Pokémon on attachment.'],
 73:["The Boss’s Way",'Search your deck for a Dark Evolution Pokémon and put it into your hand, then shuffle.'],
 74:['Challenge!','Offer a challenge: the opponent either lets both players fill their Benches from their decks or lets you draw two cards.'],
 75:['Digger','Players alternate flipping coins until tails, which damages that player’s Active Pokémon for 10.'],
 76:["Imposter Oak’s Revenge",'Discard a card to make the opponent shuffle their hand into their deck, then draw four cards.'],
 77:['Nightly Garbage Run','Choose up to three Pokémon or Basic Energy cards in your discard pile and shuffle them into your deck.'],
 78:['Goop Gas Attack','Temporarily disable all Pokémon Powers until the end of your opponent’s next turn.'],
 79:['Sleep!','Flip a coin. On heads, put the Defending Pokémon to Sleep.'],
 81:['Full Heal Energy','Provides one Colorless Energy. When attached from your hand, clear all Special Conditions from that Pokémon.'],
 82:['Potion Energy','Provides one Colorless Energy. When attached from your hand, heal 10 damage from that Pokémon.']
};
const CARDS=[];
for(let n=1;n<=83;n++){
 const actual=n>=18&&n<=31?n-17:n===71?15:n===72?16:n===80?17:n;
 const isTrainer=[15,16,73,74,75,76,77,78,79].includes(actual),isSpecial=[17,81,82].includes(actual);
 let card;
 if(isTrainer||isSpecial){const [name,text]=TRAINERS[actual];let effect=null;let reasons=['Printed Trainer or Special Energy mechanic requires engine integration'];
  if(actual===79){effect={type:'coinFlip',heads:status('sleep')};reasons=fx?.supportsEffect?.(effect)?[]:['Sleep! coin-flip effect not supported'];}
  if(actual===73){effect={type:'searchChosen',source:'deck',amount:1,filter:{kind:'pokemon',stage:['Stage 1','Stage 2'],nameContains:'Dark'}};reasons=[];}
  if(actual===74){effect={type:'neoRule',rule:'legendary:challenge'};reasons=[];}
  if(actual===81||actual===82){effect={type:'specialEnergy',provides:{Colorless:1}};reasons=[];}
  card={name,kind:isTrainer?'trainer':'energy',trainerType:isTrainer?'Item':undefined,specialEnergy:isSpecial,subtype:isSpecial?'Colorless':undefined,effect,text,battleEnabled:!reasons.length,deckEligible:!reasons.length,support:{status:reasons.length?'PARTIAL':'FULL',reasons}};
 }else{
  const found=UNIQUE.get(actual);if(!found)throw new Error('Missing Team Rocket card #'+n);card={...found};
 }
 const rarity=n<=17?'Rare Holo':n<=31?'Rare':n===83?'Secret Rare':n<=48?'Uncommon':n<=70?'Common':n===71||n===72||n===80?'Rare':n<=77?'Uncommon':'Common';
 CARDS.push({...card,id:`base5-${n}`,setId:'base5',number:String(n),source:'tcg',battleFormat:'classic',rarity,image:`https://images.pokemontcg.io/base5/${n}.png`,imageLarge:`https://images.pokemontcg.io/base5/${n}_hires.png`});
}
const BY_ID=new Map(CARDS.map(c=>[c.id,c]));
return {SET,CARDS:Object.freeze(CARDS),cardById:id=>BY_ID.get(String(id||'').toLowerCase())||null,coverage:()=>({total:83,battleEnabled:CARDS.filter(c=>c.battleEnabled).length,partial:CARDS.filter(c=>!c.battleEnabled).map(c=>`${c.id} ${c.name}: ${c.support.reasons.join('; ')}`)})};
});
